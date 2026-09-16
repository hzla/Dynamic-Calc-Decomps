/* Gen V move-scoring reference. */
(function(root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory(require("./gen5_ai_data.js"));
    else root.Gen5AiReference = factory(root.Gen5AiData);
})(typeof globalThis !== "undefined" ? globalThis : this, function(data) {
    "use strict";

    const FLAGS = [
        ["basic", "Basic", "Basic AI"], ["strong", "Evaluate Atks", "Evaluate Attacks AI"],
        ["expert", "Expert", "Expert AI"], ["setup", "1st Turn Setup", "First Turn Setup AI"],
        ["easy", "Easy", "Opening-battle AI"], ["legend", "Legend", "Legendary opening AI"],
        ["baton", "Baton Pass", "Baton Pass AI"], ["double", "Doubles", "Doubles AI — opponent targets"],
        ["hp", "Check HP", "Check HP AI"], ["weather", "Weather", "Weather AI"], ["harass", "Harass", "Harass AI"]
    ].map((flag, index) => ({ key: flag[0], badge: flag[1], title: flag[2], bit: 1 << index }));
    const normalize = name => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const aliases = { faintattack: "feintattack", vicegrip: "visegrip", hijkick: "highjumpkick", hijumpkick: "highjumpkick", smellingsalt: "smellingsalts" };
    const canonical = name => aliases[normalize(name)] || normalize(name);
    const invert = condition => typeof condition === "boolean" ? !condition : Object.assign({}, condition, { negated: !condition.negated });
    const chancePercent = (n, d) => String(Math.round(n * 1000 / d) / 10) + "%";
    const compare = (a, b, op) => op === "UNDER" ? a < b : op === "OVER" ? a > b : op === "NOT_EQUAL" ? a !== b : a === b;

    // Resolve only move metadata and format. Battle conditions remain readable checks.
    function resolveCondition(c, ctx) {
        let result = c;
        if (c.any || c.all) {
            const kind = c.any ? "any" : "all";
            const children = c[kind].map(x => resolveCondition(x, ctx));
            if (children.includes(kind === "any")) result = kind === "any";
            else {
                const remaining = children.filter(x => typeof x !== "boolean");
                result = remaining.length ? (remaining.length === 1 ? remaining[0] : { [kind]: remaining }) : kind === "all";
            }
        } else if (c.selection && ctx[c.selection.property] !== undefined) {
            result = compare(ctx[c.selection.property], c.selection.value, c.selection.comparison);
        } else if (c.nonDamaging !== undefined && ctx.nonDamaging) result = c.nonDamaging;
        else return c;
        return c.negated ? invert(result) : result;
    }

    function prepareGraph(root, ctx) {
        const nodes = [{ type: "end", id: 0 }], cache = new Map([[0, 0]]);
        function visit(id) {
            if (cache.has(id)) return cache.get(id);
            const n = data.nodes[id], out = { type: n.type };
            let resolved;
            if (n.type === "score") Object.assign(out, { delta: n.delta, next: visit(n.next) });
            else {
                const condition = n.type === "if" ? resolveCondition(n.condition, ctx) : null;
                if (typeof condition === "boolean") resolved = visit(condition ? n.yes : n.no);
                else {
                    const yes = visit(n.yes), no = visit(n.no);
                    if (yes === no) resolved = yes;
                    else {
                        Object.assign(out, { yes, no });
                        if (n.type === "if") out.condition = condition;
                        else Object.assign(out, { numerator: n.numerator, denominator: n.denominator, shared: n.shared });
                    }
                }
            }
            if (resolved === undefined) { resolved = nodes.length; nodes.push({ id: resolved, ...out }); }
            cache.set(id, resolved);
            return resolved;
        }
        return { root: visit(root), nodes };
    }

    // Share continuations even when some branches finish the flag early. Explicit end
    // blocks preserve those exits; requiring a strict postdominator duplicates Fling's
    // common checks thousands of times.
    function structure(graph, earlyExits) {
        const nodes = graph.nodes, reachable = new Map([[0, new Set([0])]]);
        const post = new Map([[0, new Set([0])]]);
        function postdom(id) {
            if (post.has(id)) return post.get(id);
            const n = nodes[id];
            const set = n.type === "score" ? new Set(postdom(n.next)) : new Set([...postdom(n.yes)].filter(x => postdom(n.no).has(x)));
            set.add(id); post.set(id, set); return set;
        }
        function descendants(id) {
            if (reachable.has(id)) return reachable.get(id);
            const n = nodes[id];
            let set;
            if (n.type === "score") set = new Set(descendants(n.next));
            else set = new Set([...descendants(n.yes), ...descendants(n.no)]);
            set.add(id);
            reachable.set(id, set);
            return set;
        }
        function sequence(id, stop) {
            const result = [];
            while (id !== stop && id !== 0) {
                const n = nodes[id];
                if (n.type === "score") {
                    result.push({ type: "score", delta: n.delta, line: n.line });
                    id = n.next;
                    continue;
                }
                const sets = earlyExits ? descendants : postdom;
                const common = [...sets(n.yes)].filter(x => sets(n.no).has(x) && (x === stop || x !== 0 && !descendants(stop).has(x)));
                const join = common.reduce((best, x) => sets(x).size > sets(best).size ? x : best, stop);
                let yes = sequence(n.yes, join), no = sequence(n.no, join);
                let test = n.condition;
                let numerator = n.numerator;
                if (yes.length === 0 && no.length) {
                    [yes, no] = [no, yes];
                    if (n.type === "if") test = invert(test);
                    else numerator = n.denominator - numerator;
                }
                if (n.type === "if") result.push({ type: "if", condition: test, yes: yes, no: no, line: n.line });
                else result.push({ type: "chance", numerator: numerator, denominator: n.denominator, shared: n.shared, yes: yes, no: no, line: n.line });
                id = join;
            }
            if (id === 0 && stop !== 0) result.push({ type: "end" });
            return result;
        }
        return simplify(sequence(graph.root, 0));
    }

    function simplify(rules) {
        const key = value => JSON.stringify(value, (k, v) => k === "line" ? undefined : v);
        const combine = (kind, a, b) => ({ [kind]: [a, b].flatMap(c => !c.negated && c[kind] || [c]) });
        function trimCondition(c) {
            if (c.any) c.any = c.any.map(trimCondition);
            if (c.all) {
                c.all = c.all.map(trimCondition);
                // One ability read can only have one value. If it is Wonder Guard,
                // exclusions for Volt Absorb etc. do not add useful conditions.
                // Separate CHECK_TOKUSEI reads stay separate: each can make a fresh guess.
                const known = c.all.filter(x => x.fact && x.fact.equal !== !!x.negated);
                c.all = c.all.filter(x => !x.fact || x.fact.equal !== !!x.negated || !known.some(k => k.fact.read === x.fact.read && k.fact.value !== x.fact.value));
                if (c.all.length === 1) return c.negated ? invert(c.all[0]) : c.all[0];
            }
            return c;
        }
        rules.forEach(rule => {
            if (!rule.yes) return;
            rule.yes = simplify(rule.yes);
            rule.no = simplify(rule.no);
            if (rule.type !== "if") return;
            while (rule.no.length === 1 && rule.no[0].type === "if" && key(rule.yes) === key(rule.no[0].yes)) {
                rule.condition = combine("any", rule.condition, rule.no[0].condition);
                rule.no = rule.no[0].no;
            }
            while (rule.yes.length === 1 && rule.yes[0].type === "if" && !rule.no.length && !rule.yes[0].no.length) {
                rule.condition = combine("all", rule.condition, rule.yes[0].condition);
                rule.yes = rule.yes[0].yes;
            }
            rule.condition = trimCondition(rule.condition);
        });
        return rules;
    }

    function describeMove(input) {
        input = input || {};
        const move = input.moveData || {};
        const effect = move.e_id === null || move.e_id === undefined || move.e_id === "" ? undefined : Number(move.e_id);
        const mask = input.aiMask === null || input.aiMask === undefined || input.aiMask === "" ? null : Number(input.aiMask);
        const result = { moveName: input.moveName || "", sections: [], notices: [], flags: [], effectId: effect };
        if (mask === null || !Number.isInteger(mask) || mask < 0) {
            result.notices.push("This trainer set has no configured AI flags.");
            return result;
        }
        result.flags = FLAGS.filter(flag => mask & flag.bit);
        if (mask === 0) result.notices.push("No AI scoring flags are enabled for this trainer.");
        if (mask & ~2047) result.notices.push("This set also contains flags outside the 11 move-scoring flags covered here.");
        if (!Number.isInteger(effect) || effect < 0) {
            result.notices.push("This move has no valid exported AI effect ID. Its scoring rules cannot be identified.");
            return result;
        }
        const customEffect = effect >= data.effectCount;
        if (customEffect) result.notices.push("This move uses an unsupported custom effect. General checks are shown; custom effect-specific rules are not available.");
        const id = Number.isInteger(move.id) ? move.id : Number.isInteger(move.moveId) ? move.moveId : data.moveIds[canonical(input.moveName)];
        if (id === undefined) result.notices.push("The move's original slot is unknown. Checks for specific named moves are shown as conditions; its exported effect is still used.");
        const ctx = { moveId: id, type: move.type, battleFormat: input.battleFormat || "Singles",
            nonDamaging: move.category === "Status" && Number(move.basePower !== undefined ? move.basePower : move.bp) === 0 };
        result.flags.forEach(flag => {
            const graph = prepareGraph(data.roots[customEffect ? data.effectCount : effect][FLAGS.indexOf(flag)], ctx);
            result.sections.push({ key: flag.key, title: flag.title, rules: structure(graph, flag.key === "basic"),
                empty: flag.key === "double" && !["Doubles", "Triples"].includes(ctx.battleFormat) ? "These checks only apply in Doubles or Triples." : customEffect ? "No further checks can be identified for this custom effect." : "No additional score changes for this move." });
        });
        return result;
    }

    return { FLAGS, describeMove, chancePercent, _test: { prepareGraph, structure } };
});
