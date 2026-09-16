"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ai = require("../../js/calc_ui/gen5_ai_reference");
const data = require("../../js/calc_ui/gen5_ai_data");

function describe(name, mask, overrides) {
    return ai.describeMove(Object.assign({ moveName: name, moveData: data.moves[name], aiMask: mask, battleFormat: "Singles" }, overrides));
}
function flatten(rules) {
    return rules.flatMap(r => [r, ...flatten(r.yes || []), ...flatten(r.no || [])]);
}
function conditionValue(c, values) {
    if (c.any) { const v = c.any.some(x => conditionValue(x, values)); return c.negated ? !v : v; }
    if (c.all) { const v = c.all.every(x => conditionValue(x, values)); return c.negated ? !v : v; }
    const v = values(c);
    return c.negated ? !v : v;
}
function distribution(rules, values, initial = 100) {
    function run(list, states) {
        for (const r of list) {
            const next = [];
            for (const s of states) {
                if (s.end) { next.push(s); continue; }
                if (r.type === "score") next.push({ score: Math.max(0, s.score + r.delta), p: s.p });
                else if (r.type === "end") next.push({ ...s, end: true });
                else if (r.type === "if") next.push(...run(conditionValue(r.condition, values) ? r.yes : r.no, [s]));
                else {
                    const p = r.numerator / r.denominator;
                    next.push(...run(r.yes, [{ ...s, p: s.p * p }]), ...run(r.no, [{ ...s, p: s.p * (1 - p) }]));
                }
            }
            states = next;
        }
        return states;
    }
    const out = {};
    run(rules, [{ score: initial, p: 1 }]).forEach(s => { out[s.score] = (out[s.score] || 0) + s.p; });
    return out;
}
function graphDistribution(graph, values, initial = 100) {
    const out = {};
    function run(id, score, p) {
        const n = graph.nodes[id];
        if (!id) out[score] = (out[score] || 0) + p;
        else if (n.type === "score") run(n.next, Math.max(0, score + n.delta), p);
        else if (n.type === "if") run(conditionValue(n.condition, values) ? n.yes : n.no, score, p);
        else { run(n.yes, score, p * n.numerator / n.denominator); run(n.no, score, p * (1 - n.numerator / n.denominator)); }
    }
    run(graph.root, initial, 1);
    return out;
}
const expertRules = name => describe(name, 4).sections[0].rules;

test("every standard move and all 338 effect slots render under all 11 flags", () => {
    assert.equal(data.effectCount, 338);
    assert.equal(data.roots.length, 339);
    assert(data.roots.every(row => row.length === 11));
    assert.deepEqual(Object.keys(data).sort(), ["effectCount", "moveIds", "moves", "nodes", "roots", "version"]);
    for (const [name, move] of Object.entries(data.moves)) {
        for (const format of ["Singles", "Doubles"]) {
            const r = describe(name, 2047, { battleFormat: format });
            assert.equal(r.sections.length, 11, name);
            const text = JSON.stringify(r.sections.map(s => s.rules));
            assert.doesNotMatch(text, /jump to|Function \d|\bundefined\b/i, name);
        }
    }
    for (let e = 0; e <= 337; e++) {
        assert.equal(describe("Renamed Move", 2047, { moveData: { e_id: e, basePower: 40, category: "Physical", type: "Normal" }, battleFormat: "Doubles" }).sections.length, 11);
    }
});

test("only configured flags appear, including empty and unknown flag states", () => {
    for (const f of ai.FLAGS) assert.deepEqual(describe("Tackle", f.bit).sections.map(s => s.key), [f.key]);
    assert.deepEqual(describe("Tackle", 5).sections.map(s => s.key), ["basic", "expert"]);
    assert.equal(describe("Tackle", 0).sections.length, 0);
    assert.match(describe("Tackle", null).notices.join(" "), /no configured/);
    assert.equal(describe("Tackle", 4).sections[0].rules.length, 0);
    assert.match(describe("Tackle", 4096).notices[0], /outside/);
    assert.equal(describe("Custom", 7, { moveData: {} }).sections.length, 0);
    assert.match(describe("Custom", 7, { moveData: { e_id: 900, basePower: 40, type: "Fire" } }).notices[0], /custom effect/);
});

test("independent sleep checks: Dream Eater bonus and Sleep Talk's two penalties", () => {
    assert.deepEqual(distribution(expertRules("Sleep Powder"), c => (c.items || []).includes("Dream Eater")), { 100: 0.5, 101: 0.5 });
    assert.deepEqual(distribution(expertRules("Sleep Powder"), c => (c.items || []).includes("Sleep Talk")), { 98: 0.5, 99: 0.5 });
});

test("exact score-change chances: absorption, setup, HP checks, and ordinary damage", () => {
    assert.deepEqual(distribution(expertRules("Absorb"), c => c.text.includes("half damage")), { 97: 206 / 256, 100: 50 / 256 });
    assert.deepEqual(distribution(describe("Swords Dance", 8).sections[0].rules, () => true), { 100: 80 / 256, 102: 176 / 256 });
    assert.equal(ai.chancePercent(176, 256), "68.8%");
    assert.deepEqual(distribution(describe("Thunderbolt", 2).sections[0].rules, c => c.text.includes("knock out")), { 104: 1 });
    const basic = describe("Thunderbolt", 1).sections[0].rules;
    assert.deepEqual(distribution(basic, c => c.text.includes("immune")), { 90: 1 });
    // The Weather flag falls into its sun check for other effects.
    assert.match(JSON.stringify(describe("Tackle", 512).sections[0].rules), /weather/);
    assert.match(JSON.stringify(describe("Recover", 256).sections[0].rules), /70%/);
});

test("Easy and Legend use the active Gen V scripts", () => {
    const easy = describe("Tackle", 16).sections[0];
    assert.equal(easy.title, "Opening-battle AI");
    assert.deepEqual(distribution(easy.rules, c => c.text.includes("first turn")), { 101: 1 });
    assert.deepEqual(distribution(describe("Growl", 16).sections[0].rules, () => false), { 100: 0.25, 101: 0.5, 102: 0.25 });
    assert.equal(describe("Tackle", 32).sections[0].rules.length, 0);
    assert.deepEqual(distribution(describe("Fusion Flare", 32).sections[0].rules, () => true), { 110: 1 });
    assert.deepEqual(distribution(describe("Fusion Bolt", 32).sections[0].rules, () => false), { 100: 1 });
});

test("shared random checks retain strict boundaries and conditional probabilities", () => {
    // One shared roll: 0..49 adds 1, 50..128 adds 3, 129..255 adds 2.
    const g = { root: 4, nodes: [
        { type: "end", id: 0 },
        { type: "score", id: 1, delta: 2, next: 0 },
        { type: "chance", id: 2, numerator: 50, denominator: 129, shared: true, yes: 0, no: 1 },
        { type: "score", id: 3, delta: 1, next: 2 },
        { type: "chance", id: 4, numerator: 129, denominator: 256, shared: true, yes: 3, no: 1 }
    ] };
    const expected = { 101: 50 / 256, 103: 79 / 256, 102: 127 / 256 };
    assert.deepEqual(graphDistribution(g, () => false), expected);
    assert.deepEqual(distribution(ai._test.structure(g), () => false), expected);
    assert(flatten(expertRules("Explosion")).some(r => r.shared));
    assert(flatten(expertRules("Protect")).some(r => r.shared));
});

test("hand-checked healing, weather, Baton Pass and linked Protect/Explosion outcomes", () => {
    // below 70%, moving later, no revealed Snatch.
    assert.deepEqual(distribution(expertRules("Recover"), c =>
        c.text === "the user's HP is below 70%" || c.text.startsWith("the target is ahead")),
        { 100: 20 / 256, 102: 236 / 256 });
    // Full HP ends Expert at -3, even if other healing conditions would favor it.
    assert.deepEqual(distribution(expertRules("Recover"), c => c.text === "the user's HP is 100%"), { 97: 1 });
    // Attack +3 or higher, HP <=60%, moving first.
    assert.deepEqual(distribution(expertRules("Baton Pass"), c => c.text === "the user's Attack stage is above +2"),
        { 100: 80 / 256, 102: 176 / 256 });
    // Swift Swim, moving later, takes +1 before HP checks.
    assert.deepEqual(distribution(expertRules("Rain Dance"), c =>
        c.text === "the user's ability is Swift Swim" || c.text === "the user's HP is below 40%"), { 101: 1 });
    // at <=30% HP, zero target evasion boosts.
    // Two +1 changes share the SAME <=128 roll, so +1 alone cannot happen.
    assert.deepEqual(distribution(expertRules("Explosion"), c =>
        c.text === "the target's evasion stage is below +1" || c.text === "the user's HP is below 80%"),
        { 100: 127 / 256, 102: 129 / 256 });
    // revealed Feint, badly poisoned target, counter 0.
    // +2 is certain; both -2 penalties share roll >=128. No zero-change outcome.
    assert.deepEqual(distribution(expertRules("Protect"), c =>
        ["the target has revealed Feint", "the target is badly poisoned", "the user's consecutive Protect/Detect/Endure counter is 0"].includes(c.text)),
        { 98: 0.5, 102: 0.5 });
});

test("opponent-target Doubles resistance checks accumulate with the ally comparison", () => {
    // half damage, no KO, two opponents. The -1 occurs on
    // rolls >=64 (192/256); being strongest in the ally comparison gives +1 on
    // a separate roll >=128. Net -1/0/+1 probabilities are 3/8, 1/2, 1/8.
    const rules = describe("Thunderbolt", 128, { battleFormat: "Doubles" }).sections[0].rules;
    assert.deepEqual(distribution(rules, c => c.text.includes("half damage") ||
        c.text.includes("unfainted ally") || c.text.includes("ties or beats")), { 99: 0.375, 100: 0.5, 101: 0.125 });
    assert.match(JSON.stringify(rules), /same slot/);
    assert.match(JSON.stringify(expertRules("Power Swap")), /Attack stage minus the user's Attack stage/);
    assert.match(JSON.stringify(expertRules("Fling")), /0 during Embargo/);
});

test("format, metadata and move identity remain distinct", () => {
    assert.equal(describe("Thunderbolt", 128).sections[0].rules.length, 0);
    assert(describe("Thunderbolt", 128, { battleFormat: "Doubles" }).sections[0].rules.length > 0);
    assert.deepEqual(describe("Renamed Sleep", 4, { moveData: data.moves["Sleep Powder"] }).sections[0].rules, expertRules("Sleep Powder"));
    const original = describe("Fusion Flare", 32).sections[0].rules;
    const renamed = describe("Custom Fire", 32, { moveData: { ...data.moves["Fusion Flare"], id: 558 } }).sections[0].rules;
    assert.deepEqual(renamed, original);
    assert.match(JSON.stringify(expertRules("Swords Dance")), /stage is below \+3/);
    assert.match(JSON.stringify(expertRules("Baton Pass")), /60%|70%/);
    assert.match(JSON.stringify(expertRules("Recover")), /HP/);
});

test("structured explanations preserve the graph's outcomes, early exits and score floor", () => {
    const names = ["Fling", "Double Team", "Protect", "Explosion", "Baton Pass", "Recover", "Sleep Powder", "Rain Dance", "Thunderbolt", "Power Split"];
    for (const name of names) for (const flag of ai.FLAGS) {
        const move = data.moves[name];
        const graph = ai._test.prepareGraph(data.roots[move.e_id][ai.FLAGS.indexOf(flag)], { type: move.type, moveId: data.moveIds[name.toLowerCase().replace(/[^a-z0-9]/g, "")], battleFormat: "Doubles", nonDamaging: move.category === "Status" && move.basePower === 0 });
        const rules = ai._test.structure(graph, flag.key === "basic");
        const abilityReads = {};
        graph.nodes.forEach(n => {
            const f = n.condition && n.condition.fact;
            if (f) (abilityReads[f.read] ||= new Set()).add(f.value);
        });
        for (let seed = 1; seed <= 20; seed++) {
            const values = c => {
                if (c.fact) {
                    const choices = [...abilityReads[c.fact.read], 'another ability'];
                    return (choices[seed % choices.length] === c.fact.value) === c.fact.equal;
                }
                let hash = seed;
                for (const ch of c.text + JSON.stringify(c.items)) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
                return (hash >>> 0) % 3 === 0;
            };
            const a = distribution(rules, values, seed === 1 ? 1 : 100), b = graphDistribution(graph, values, seed === 1 ? 1 : 100);
            const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
            for (const k of keys) assert(Math.abs((a[k] || 0) - (b[k] || 0)) < 1e-12, `${name}/${flag.key}/${seed}/${k}`);
        }
    }
});

test("all explanations pass the actual HTML renderer and escape imported names", () => {
    const chain = new Proxy({}, { get: () => () => chain });
    const context = { window: {}, document: {}, Gen5AiReference: ai, $: () => chain, Set, console };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../../js/calc_ui/ai_display.js"), "utf8"), context);
    for (const [name] of Object.entries(data.moves)) {
        for (const s of describe(name, 2047, { battleFormat: "Doubles" }).sections) {
            const html = context.renderGen5AiRules(s.rules, new Set());
            assert.doesNotMatch(html, /\b(?:undefined|NaN)\b|[A-Z]{2,}_[A-Z_]+/, name);
        }
    }
    assert.equal(context.escapeAiHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
