(function(root) {
    "use strict";
    var node = typeof module !== "undefined" && module.exports;
    var script = node ? require("./platinum_ai_script") : root.PlatinumAiScript;
    var damageAI = node ? require("./platinum_ai_damage") : root.PlatinumAiDamage;
    var C = script.constants;
    var stats = ["hp", "atk", "def", "spe", "spa", "spd", "accuracy", "evasion"];
    var flags = { BASIC: 1, EVAL_ATTACK: 2, EXPERT: 4, SETUP_FIRST_TURN: 8, RISKY: 16, DAMAGE_PRIORITY: 32, BATON_PASS: 64, TAG_STRATEGY: 128, CHECK_HP: 256, WEATHER: 512, HARRASSMENT: 1024 };
    function key(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
    var ids = {}, names = {};
    Object.keys(C).forEach(function(token) { ids[key(token)] = C[token]; });
    Object.keys(script.moves).forEach(function(id) { names[key(script.moves[id].name)] = Number(id); });
    [ ["High Jump Kick", "hi_jump_kick"], ["Vise Grip", "vice_grip"], ["Feint Attack", "faint_attack"], ["Smelling Salts", "smelling_salt"] ].forEach(function(pair) { names[key(pair[0])] = names[key(pair[1])]; });
    function tokenId(prefix, value) {
        if (typeof value === "number") return value;
        return ids[key(prefix + "_" + (value || "None"))] || 0;
    }
    function hp(mon) {
        if (typeof mon.curHP === "function") return mon.curHP();
        return Number(mon.originalCurHP !== undefined ? mon.originalCurHP : mon.curHP !== undefined ? mon.curHP : mon.hp);
    }
    function hpPercent(mon) { return Math.floor(100 * hp(mon) / (typeof mon.maxHP === "function" ? mon.maxHP() : mon.maxHP)); }
    function status(mon) {
        return ({ slp: C.MON_CONDITION_SLEEP, asleep: C.MON_CONDITION_SLEEP, brn: C.MON_CONDITION_BURN, burned: C.MON_CONDITION_BURN,
            par: C.MON_CONDITION_PARALYSIS, paralyzed: C.MON_CONDITION_PARALYSIS, psn: C.MON_CONDITION_POISON, poisoned: C.MON_CONDITION_POISON,
            tox: C.MON_CONDITION_TOXIC, "badly poisoned": C.MON_CONDITION_TOXIC, frz: C.MON_CONDITION_FREEZE, frozen: C.MON_CONDITION_FREEZE })[String(mon.status || "").toLowerCase()] || 0;
    }
    function normalize(move, table, slot) {
        var name = typeof move === "string" ? move : move && (move.originalName || move.name) || "(No Move)";
        name = name.replace(/^HP /, "Hidden Power ");
        var id = names[key(name)] || (/^Hidden Power/.test(name) ? C.MOVE_HIDDEN_POWER : 0);
        var native = script.moves[id] || {};
        var row = table && (table[name] || table[name.replace("Hidden Power", "HP")]) || {};
        var number = function(value, fallback) { return value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : fallback; };
        return { slot: slot, moveName: name, moveId: id, effectId: number(row.e_id, native.effect),
            type: row.type || damageAI.types[native.type] || move && move.type || "Normal",
            category: row.category || ({ CLASS_PHYSICAL: "Physical", CLASS_SPECIAL: "Special", CLASS_STATUS: "Status" })[native.category] || "Status",
            basePower: number(row.basePower, number(row.bp, native.power || 0)), valid: name !== "(No Move)" && name !== "-" && !!move };
    }
    function compare(op, actual, expected) {
        if (op.endsWith("NotEqualTo") || op.endsWith("NotEqual")) return actual !== expected;
        if (op.endsWith("LessThan")) return actual < expected;
        if (op.endsWith("GreaterThan")) return actual > expected;
        if (op.endsWith("NotMask")) return !(actual & expected);
        if (op.endsWith("Mask")) return !!(actual & expected);
        return actual === expected;
    }
    function required(state, name) {
        if (state[name] === undefined || state[name] === null) {
            var labels = {
                turnCount: "the current turn number", friendship: "the AI Pokémon's friendship",
                attackerFirstTurn: "whether this is the AI Pokémon's first turn",
                defenderFirstTurn: "whether this is the player's Pokémon's first turn",
                attackerProtectChain: "the AI Pokémon's consecutive successful Protect count",
                defenderProtectChain: "the player's consecutive successful Protect count",
                attackerChoiceLockedMove: "the AI Pokémon's Choice-locked move (or none)",
                attackerQuickClawActivated: "whether the AI Pokémon's Quick Claw activated this turn",
                defenderQuickClawActivated: "whether the player's Quick Claw activated this turn",
                attackerReserveCount: "the number of living AI reserve Pokémon",
                defenderReserveCount: "the number of living player reserve Pokémon",
                defenderKnownMoves: "the player's moves already revealed to the AI",
                defenderKnownItem: "the player's item already revealed to the AI"
            };
            var readable = labels[name] || name.replace(/^attacker/, "AI Pokémon ").replace(/^defender/, "player Pokémon ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
            throw new Error("Needs battle history: " + readable + ".");
        }
        return state[name];
    }
    function aggregate(states) {
        var groups = new Map();
        states.forEach(function(s) {
            var k = [s.pc, s.temp, s.score, s.stack.join(",")].join("|");
            if (groups.has(k)) groups.get(k).probability += s.probability;
            else groups.set(k, s);
        });
        return Array.from(groups.values());
    }
    // Combine independent per-move score distributions without truncating the
    // Cartesian product. Polynomial coefficient k is P(exactly k other ties).
    function selectionProbabilities(moves) {
        moves.forEach(function(move, i) {
            move.probability = 0;
            if (!move.valid) return;
            move.outcomes.forEach(function(outcome) {
                var ties = [1];
                moves.forEach(function(other, j) {
                    if (i === j || !other.valid) return;
                    var lower = 0, equal = 0;
                    other.outcomes.forEach(function(o) { if (o.finalScore < outcome.finalScore) lower += o.probability; else if (o.finalScore === outcome.finalScore) equal += o.probability; });
                    var next = Array(ties.length + 1).fill(0);
                    ties.forEach(function(p, k) { next[k] += p * lower; next[k + 1] += p * equal; });
                    ties = next;
                });
                // RandNext is u16; modulo 3 is very slightly biased to index 0.
                // Display precision makes that <0.002% cartridge bias invisible.
                move.probability += outcome.probability * ties.reduce(function(sum, p, k) { return sum + p / (k + 1); }, 0);
            });
        });
    }
    function makeContext(input, moves, assumptions) {
        var state = input.stateOverrides || {};
        var field = input.field || { attackerSide: {}, defenderSide: {} };
        var mons = [input.defender, input.attacker];
        function mon(b) { if (b > 1) throw new Error("Partner battler state is not supported."); return mons[b]; }
        function prefix(b) { mon(b); return b === 1 ? "attacker" : "defender"; }
        function history(b, prop) { return required(state, prefix(b) + prop); }
        function moveData(id) {
            if (id === 0) return Object.assign(normalize(null, null, 0), { valid: true });
            var current = moves.find(function(m) { return m.moveId === id; });
            if (current) return current;
            var table = input.moveTable || {};
            var name = Object.keys(table).find(function(n) { return names[key(n)] === id; });
            return normalize(name || (script.moves[id] || {}).name, table, 0);
        }
        function stage(b, stat) { return Number((mon(b).boosts || {})[stats[stat]] || 0) + 6; }
        function movesKnown(b) { return b === 1 ? moves : history(b, "KnownMoves").map(function(m) { return normalize(m, input.moveTable, 0); }); }
        function item(b, known) { return tokenId("ITEM", known && b === 0 ? history(b, "KnownItem") : mon(b).item); }
        function ability(b, actual) {
            var m = mon(b);
            if (state[prefix(b) + "AbilitySuppressed"]) return [0];
            if (actual || b === 1 || ["Shadow Tag", "Arena Trap", "Magnet Pull"].includes(m.ability)) return [tokenId("ABILITY", m.ability)];
            if (state.defenderKnownAbility !== undefined) return [tokenId("ABILITY", state.defenderKnownAbility)];
            var possible = input.defenderAbilities;
            if (!possible || !possible.length) throw new Error("Needs the target's possible abilities or a revealed ability.");
            return possible.slice(0, 2).map(function(a) { return tokenId("ABILITY", a); });
        }
        function side(b) {
            var s = b === 1 ? field.attackerSide || {} : field.defenderSide || {};
            return state[prefix(b) + "ToxicSpikes"] === undefined ? s : Object.assign({}, s, { toxicSpikes: state[prefix(b) + "ToxicSpikes"] });
        }
        function sideMask(b) {
            if (state[prefix(b) + "SideConditions"] !== undefined) return state[prefix(b) + "SideConditions"];
            var s = side(b), value = state[prefix(b) + "ExtraSideConditions"] || 0;
            [ ["isReflect", "REFLECT"], ["isLightScreen", "LIGHT_SCREEN"], ["isSafeguard", "SAFEGUARD"], ["isMist", "MIST"], ["isSR", "STEALTH_ROCK"], ["spikes", "SPIKES"], ["toxicSpikes", "TOXIC_SPIKES"], ["isTailwind", "TAILWIND"] ].forEach(function(pair) { if (s[pair[0]]) value |= C["SIDE_CONDITION_" + pair[1]]; });
            return value;
        }
        function mask(b, kind) {
            var prop = prefix(b) + kind;
            if (state[prop] !== undefined) return state[prop];
            assumptions.add("Unshown volatile effects (such as Substitute, Taunt, Disable, and Encore) are assumed absent.");
            return 0;
        }
        var maxCache = {}, effCache = {}, distributionCache = new Map();
        function reserves(b) { return history(b, "Party"); }
        function alive(m) { return hp(m) > 0 && !m.isEgg && m.name && m.name !== "(None)" && m.name !== "Egg"; }
        function variance(slot, vary) {
            if (!vary) return 100;
            if (!state.damageRolls || state.damageRolls[slot] === undefined) {
                var err = new Error("Shared damage roll required"); err.sharedRoll = slot; throw err;
            }
            return state.damageRolls[slot];
        }
        function distribution(info, vary, metadata, battler, rollSlot) {
            battler = battler === undefined ? 1 : battler;
            var roll = variance(rollSlot === undefined ? info.slot : rollSlot, vary);
            var cacheKey = JSON.stringify([info, roll, metadata, battler]);
            if (distributionCache.has(cacheKey)) return distributionCache.get(cacheKey);
            var source = input;
            if (battler === 0) {
                // Cartridge quirk: the previous player move is evaluated against
                // AI_CONTEXT.defender (the player itself), using the AI's IVs.
                var ds = Object.assign({}, state.damageState), f = field.clone();
                Object.keys(ds).forEach(function(k) { if (k.startsWith("attacker")) delete ds[k]; });
                Object.keys(state.damageState || {}).forEach(function(k) { if (k.startsWith("defender")) ds[k.replace("defender", "attacker")] = state.damageState[k]; });
                ds.charge = !!ds.attackerCharge;
                f.attackerSide = f.defenderSide;
                if ([input.attacker.ability, input.defender.ability].some(function(a) { return a === "Air Lock" || a === "Cloud Nine"; })) f.weather = "";
                source = Object.assign({}, input, { attacker: input.defender, field: f,
                    stateOverrides: Object.assign({}, state, { friendship: state.defenderFriendship, damageState: ds }) });
                metadata = { ivs: input.attacker.ivs, item: input.defender.item, ability: ds.attackerEmbargo ? "Klutz" : input.defender.ability };
            }
            var rows = input.aiDamage && !metadata && battler === 1 ? [[Math.floor(input.aiDamage[info.slot] * roll / 100), 1]] : damageAI.distribution(source, info, { variance: roll, metadata: metadata });
            distributionCache.set(cacheKey, rows);
            if (!metadata && battler === 1 && !vary) maxCache[info.slot] = Math.max.apply(Math, rows.map(function(r) { return r[0]; }));
            return rows;
        }
        function allDamage(list, vary, metadata) {
            return list.map(function(m) { return m.valid && damageAI.eligible(m) ? distribution(m, vary, metadata) : [[0, 1]]; });
        }
        function cdf(rows, value) { return rows.reduce(function(sum, r) { return sum + (r[0] <= value ? r[1] : 0); }, 0); }
        function maximum(lists) {
            return lists.reduce(function(max, rows) {
                var next = [];
                max.forEach(function(a) { rows.forEach(function(b) { next.push([Math.max(a[0], b[0]), a[1] * b[1]]); }); });
                return damageAI.mergeDistribution(next);
            }, [[0, 1]]);
        }
        function highest(info, vary) {
            var lists = allDamage(moves, vary);
            return lists[info.slot].reduce(function(sum, r) {
                return sum + r[1] * lists.reduce(function(p, other, i) { return p * (i === info.slot ? 1 : cdf(other, r[0])); }, 1);
            }, 0);
        }
        function partyMore(vary) {
            var active = maximum(allDamage(moves, vary));
            var others = reserves(1).filter(alive).map(function(m) { return maximum(allDamage(m.moves.map(function(n, i) { return normalize(n, input.moveTable, i); }), vary, m)); });
            return active.reduce(function(sum, r) { return sum + r[1] * (1 - others.reduce(function(p, rows) { return p * cdf(rows, r[0]); }, 1)); }, 0);
        }
        function battlerMore(b, vary, slot) {
            var active = maximum(allDamage(moves, vary));
            var previousName = history(b, "PreviousMove");
            var prev = normalize(previousName, input.moveTable, slot);
            if (previousName && !prev.moveId) throw new Error("Unrecognized previous move: " + previousName + ".");
            var previous = distribution(prev, vary, null, b, slot);
            return previous.reduce(function(sum, r) { return sum + r[1] * cdf(active, r[0] - 1); }, 0);
        }
        function hasSuperEffective() {
            return !state.defenderSwitching && moves.some(function(m) { return m.valid && damageAI.estimate(input, m, 0, { flags: true }).superEffective; });
        }
        function maxDamage(info) {
            if (maxCache[info.slot] === undefined) distribution(info, false);
            if (!Number.isFinite(maxCache[info.slot])) throw new Error("Missing AI damage for " + info.moveName + ".");
            return maxCache[info.slot];
        }
        function effectiveness(info) {
            if (effCache[info.slot] === undefined) {
                var n = input.aiEffectiveness ? input.aiEffectiveness[info.slot] : damageAI.estimate(input, info, 40);
                // Source normalizes these four STAB-adjusted values, and only these.
                effCache[info.slot] = ({ 120: 80, 240: 160, 30: 20, 15: 10 })[n] || n;
            }
            return effCache[info.slot];
        }
        function speedCompare() {
            if (state.speedCompare !== undefined) return state.speedCompare;
            var a = input.attacker, d = input.defender;
            var as = a.gen ? damageAI.speed(a, d, field, field.attackerSide, state.damageState, "attacker") : a.stats.spe;
            var ds = d.gen ? damageAI.speed(d, a, field, field.defenderSide, state.damageState, "defender") : d.stats.spe;
            // The misleading ignoreQuickClaw parameter suppresses activation
            // writes and move priority, but still consults the cached speed RNG.
            var quick = function(m, b) {
                if (m.ability === "Klutz" || state.damageState && state.damageState[prefix(b) + "Embargo"]) return false;
                if (m.item === "Quick Claw") return !!history(b, "QuickClawActivated");
                return m.item === "Custap Berry" && hp(m) <= Math.floor(m.maxHP() / (m.ability === "Gluttony" ? 2 : 4));
            };
            var aq = quick(a, 1), dq = quick(d, 0);
            if (aq !== dq) return aq ? 0 : 1;
            if (aq && dq) return as === ds ? [0, 2] : as < ds ? 1 : 0;
            var lag = function(m) { return !(state.damageState && state.damageState[(m === a ? "attacker" : "defender") + "Embargo"]) && m.ability !== "Klutz" && ["Lagging Tail", "Full Incense"].includes(m.item); };
            var al = lag(a), dl = lag(d);
            if (al !== dl) return al ? 1 : 0;
            if (!al && (a.ability === "Stall") !== (d.ability === "Stall")) return a.ability === "Stall" ? 1 : 0;
            if (as === ds) return [0, 2];
            var reverse = al || (a.ability === "Stall" && d.ability === "Stall") || !!state.trickRoom;
            return (reverse ? as > ds : as < ds) ? 1 : 0;
        }
        return { reserves: reserves, alive: alive, distribution: distribution, highest: highest, partyMore: partyMore, battlerMore: battlerMore, hasSuperEffective: hasSuperEffective, moveData: moveData, moveTable: input.moveTable, state: state, field: field, mon: mon, prefix: prefix, history: history, stage: stage, movesKnown: movesKnown, item: item, ability: ability, side: side, sideMask: sideMask, mask: mask, cachedDamage: function(info) { return maxCache[info.slot]; }, maxDamage: maxDamage, effectiveness: effectiveness, speedCompare: speedCompare };
    }
    function runFlag(states, label, info, moves, ctx, cap) {
        var pending = states.map(function(s) { return Object.assign({}, s, { pc: script.labels[label], stack: [] }); });
        var complete = [], steps = 0;
        while (pending.length) {
            if (++steps > 12000 || pending.length + complete.length > cap) throw new Error("Exact AI evaluation exceeded its work limit; no probabilities were discarded or estimated.");
            var next = [];
            pending.forEach(function(s) {
                var ins = script.code[s.pc++];
                if (!ins) throw new Error("Invalid AI script cursor.");
                var op = ins[0], a = ins[1], jump = function(ok) { if (ok) s.pc = script.labels[a[a.length - 1]]; };
                var fork = function(values, apply) {
                    values.forEach(function(v) {
                        var copy = Object.assign({}, s, { stack: s.stack.slice(), trace: s.trace.slice(), probability: s.probability * v[1] });
                        apply(copy, v[0]); next.push(copy);
                    });
                };
                var setJump = function(copy, yes) { if (yes) copy.pc = script.labels[a[a.length - 1]]; };
                var chance = function(p, apply) {
                    p = Math.max(0, Math.min(1, p));
                    fork([[true, p], [false, 1 - p]].filter(function(v) { return v[1] > 0; }), apply || setJump);
                };
                if (op.startsWith("IfRandom")) {
                    var count = 0; for (var r = 0; r < 256; r++) if (compare(op, r, a[0])) count++;
                    fork([[true, count / 256], [false, 1 - count / 256]].filter(function(v) { return v[1] > 0; }), setJump); return;
                }
                if (op === "AddToMoveScore") {
                    var before = s.score; s.score = Math.max(0, ((before + a[0]) << 24) >> 24);
                    s.trace = s.trace.concat({ flag: label.replace(/_Main$/, ""), label: ins[2], condition: "pokeplatinum AI script line " + ins[3], sourceLine: ins[3], delta: a[0], scoreBefore: before, scoreAfter: s.score });
                } else if (op === "GoTo") s.pc = script.labels[a[0]];
                else if (op === "PushAndGoTo") { s.stack = s.stack.concat(s.pc); s.pc = script.labels[a[0]]; }
                else if (op === "PopOrEnd") { if (s.stack.length) { s.stack = s.stack.slice(); s.pc = s.stack.pop(); } else { complete.push(s); return; } }
                else if (/^If(Loaded|Temp)(LessThan|GreaterThan|EqualTo|NotEqualTo|Mask|NotMask)$/.test(op)) jump(compare(op, s.temp, a[0]));
                else if (/^IfLoaded(Not)?InTable$/i.test(op)) jump(script.tables[a[0]].includes(s.temp) !== /Not/i.test(op));
                else if (/^IfMove(Not)?EqualTo$/.test(op)) jump(compare(op, info.moveId, a[0]));
                else if (/^IfCurrentMoveEffect(Not)?EqualTo$/.test(op)) jump(compare(op, info.effectId, a[0]));
                else if (op.startsWith("IfHPPercent")) jump(compare(op, hpPercent(ctx.mon(a[0])), a[1]));
                else if (op.startsWith("IfStatStage")) jump(compare(op, ctx.stage(a[0], a[1]), a[2]));
                else if (op === "IfStatus" || op === "IfNotStatus") jump(!!(status(ctx.mon(a[0])) & a[1]) !== (op === "IfNotStatus"));
                else if (/^If(Not)?VolatileStatus$/.test(op)) jump(!!(ctx.mask(a[0], "VolatileStatus") & a[1]) !== op.startsWith("IfNot"));
                else if (/^If(Not)?MoveEffect$/.test(op)) jump(!!(ctx.mask(a[0], "MoveEffects") & a[1]) !== op.startsWith("IfNot"));
                else if (/^If(Not)?SideCondition$/.test(op)) jump(!!(ctx.sideMask(a[0]) & a[1]) !== op.startsWith("IfNot"));
                else if (op === "IfTargetIsPartner") { /* Singles never targets a partner. */ }
                else if (op === "LoadCurrentMove") s.temp = info.moveId;
                else if (op === "LoadCurrentMoveEffect") s.temp = info.effectId;
                else if (op === "LoadMovePower") s.temp = info.basePower;
                else if (op === "LoadCurrentMoveClass") s.temp = info.category === "Physical" ? 0 : info.category === "Special" ? 1 : 2;
                else if (op === "LoadBattleType") s.temp = ctx.state.battleType === undefined ? C.BATTLE_TYPE_TRAINER : ctx.state.battleType;
                else if (op === "LoadTurnCount") s.temp = required(ctx.state, "turnCount");
                else if (op === "LoadBattlerTurnCount") s.temp = ctx.history(a[0], "TurnsActive");
                else if (op === "LoadIsFirstTurnInBattle") s.temp = +ctx.history(a[0], "FirstTurn");
                else if (op === "LoadProtectChain") s.temp = ctx.history(a[0], "ProtectChain");
                else if (op === "LoadStockpileCount") s.temp = ctx.history(a[0], "StockpileCount");
                else if (op === "LoadRecycleItem") s.temp = tokenId("ITEM", ctx.history(a[0], "RecycleItem"));
                else if (op === "LoadBattlerPreviousMove") s.temp = names[key(ctx.history(a[0], "PreviousMove"))] || 0;
                else if (/^Load(Type|Power|Effect)OfLoadedMove$/.test(op)) {
                    var loaded = ctx.moveData(s.temp);
                    if (!loaded.valid) throw new Error("Unknown previous move metadata.");
                    s.temp = op === "LoadTypeOfLoadedMove" ? damageAI.types.indexOf(loaded.type) : op === "LoadPowerOfLoadedMove" ? loaded.basePower : loaded.effectId;
                } else if (op === "LoadDefenderLastUsedMoveClass") {
                    var prev = normalize(ctx.history(0, "PreviousMove"), ctx.moveTable, 0);
                    s.temp = prev.category === "Physical" ? 0 : prev.category === "Special" ? 1 : 2;
                } else if (op === "LoadTypeFrom") {
                    if (a[0] === C.LOAD_MOVE_TYPE) s.temp = damageAI.types.indexOf(info.type);
                    else if (a[0] <= 3) { var ts = ctx.mon(a[0] % 2).types; s.temp = damageAI.types.indexOf(ts[Math.floor(a[0] / 2)] || ts[0]); }
                    else throw new Error("Partner type state is not supported.");
                } else if (op === "FlagBattlerIsType") s.temp = +ctx.mon(a[0]).types.includes(damageAI.types[a[1]]);
                else if (op === "LoadBattlerAbility" || op === "LoadAbility") {
                    var abilities = ctx.ability(a[0], op === "LoadAbility");
                    fork(abilities.map(function(v) { return [v, 1 / abilities.length]; }), function(copy, v) { copy.temp = v; }); return;
                } else if (op === "CheckBattlerAbility") {
                    var known = a[0] === 1 || ctx.state.defenderKnownAbility !== undefined || ["Shadow Tag", "Arena Trap", "Magnet Pull"].includes(ctx.mon(a[0]).ability);
                    var possible = ctx.ability(a[0], false);
                    s.temp = !known && possible.length > 1 && possible.includes(a[1]) ? 2 : possible[0] === 0 ? 2 : +(possible[0] === a[1]);
                } else if (op === "LoadHeldItem") s.temp = ctx.item(a[0], false);
                else if (op === "IfHeldItemEqualTo") jump(ctx.item(a[0], true) === a[1]);
                else if (op === "LoadHeldItemEffect") {
                    var held = a[0] === 0 ? ctx.history(0, "KnownItem") : ctx.mon(1).item;
                    s.temp = C[damageAI.itemData(held).holdEffect];
                } else if (op === "LoadGender") s.temp = ({ M: 0, F: 1, N: 2 })[ctx.mon(a[0]).gender];
                else if (op === "LoadCurrentWeather") s.temp = ({ Rain: C.AI_WEATHER_RAINING, Sun: C.AI_WEATHER_SUNNY, Sand: C.AI_WEATHER_SANDSTORM, Hail: C.AI_WEATHER_HAILING, Fog: C.AI_WEATHER_DEEP_FOG })[ctx.field.weather] || C.AI_WEATHER_CLEAR;
                else if (op === "IfMoveEffectivenessEquals") jump(ctx.effectiveness(info) === a[0]);
                else if (op === "CalcMaxEffectiveness") s.temp = Math.max.apply(Math, moves.filter(function(m) { return m.valid; }).map(ctx.effectiveness));
                else if (op === "FlagMoveDamageScore") {
                    if (!damageAI.eligible(info)) s.temp = 0;
                    else { chance(ctx.highest(info, a[0]), function(copy, yes) { copy.temp = yes ? 2 : 1; }); return; }
                } else if (op === "IfCurrentMoveKills" || op === "IfCurrentMoveDoesNotKill") {
                    if (damageAI.eligible(info)) {
                        var kill = ctx.distribution(info, a[0]).reduce(function(p, r) { return p + (r[0] >= hp(ctx.mon(0)) ? r[1] : 0); }, 0);
                        chance(op === "IfCurrentMoveKills" ? kill : 1 - kill); return;
                    }
                } else if (/^IfSpeedCompare(Not)?EqualTo$/.test(op)) {
                    var speed = ctx.speedCompare();
                    if (Array.isArray(speed)) { fork(speed.map(function(v) { return [compare(op, v, a[0]), 1 / speed.length]; }), setJump); return; }
                    jump(compare(op, speed, a[0]));
                } else if (op === "IfAttackerHasDamagingMoves" || op === "IfAttackerHasNoDamagingMoves") jump(moves.some(function(m) { return m.valid && m.basePower; }) === (op === "IfAttackerHasDamagingMoves"));
                else if (/^IfMove(Effect)?(Not)?Known$/.test(op)) {
                    var found = ctx.movesKnown(a[0]).some(function(m) { return m.valid && (op.includes("Effect") ? m.effectId : m.moveId) === a[1]; });
                    jump(found !== op.includes("Not"));
                } else if (op === "IfLevel") jump(a[0] === 0 ? ctx.mon(1).level > ctx.mon(0).level : a[0] === 1 ? ctx.mon(1).level < ctx.mon(0).level : ctx.mon(1).level === ctx.mon(0).level);
                else if (op === "IfTargetIsTaunted" || op === "IfTargetIsNotTaunted") jump(!!ctx.state.defenderTaunted === (op === "IfTargetIsTaunted"));
                else if (op === "IfActivatedFlashFire") jump(ctx.mon(a[0]).ability === "Flash Fire" && !!ctx.mon(a[0]).abilityOn);
                else if (op === "LoadCurrentMovePP") s.temp = required(ctx.state, "attackerPP")[info.slot];
                else if (op === "LoadFlingPower") { var m = ctx.mon(a[0]); s.temp = ctx.state.damageState && ctx.state.damageState[ctx.prefix(a[0]) + "Embargo"] ? 0 : Number(damageAI.itemData(m.item).flingPower); }
                else if (op === "LoadSpikesLayers") s.temp = Number(ctx.side(a[0])[a[1] === C.SIDE_CONDITION_SPIKES ? "spikes" : "toxicSpikes"] || 0);
                else if (op === "CountAlivePartyBattlers") s.temp = ctx.state[ctx.prefix(a[0]) + "Party"] ? ctx.reserves(a[0]).filter(ctx.alive).length : ctx.history(a[0], "ReserveCount");
                else if (op === "IfPartyMemberStatus" || op === "IfPartyMemberNotStatus") jump(ctx.reserves(a[0]).some(function(m) { return ctx.alive(m) && (!!(status(m) & a[1]) === (op === "IfPartyMemberStatus")); }));
                else if (op === "IfAnyPartyMemberIsWounded") jump(ctx.reserves(a[0]).some(function(m) { return hp(m) !== (typeof m.maxHP === "function" ? m.maxHP() : m.maxHP); }));
                else if (op === "IfAnyPartyMemberUsedPP") jump(ctx.reserves(a[0]).some(function(m) { return !!m.usedPP || m.pp.some(function(p, i) { return p !== m.maxPP[i]; }); }));
                else if (op === "IfHasSuperEffectiveMove") jump(ctx.hasSuperEffective());
                else if (op === "IfPartyMemberDealsMoreDamage") { chance(ctx.partyMore(a[0])); return; }
                else if (op === "IfBattlerDealsMoreDamage") { chance(ctx.battlerMore(a[0], a[1], info.slot)); return; }
                else if (op === "SumPositiveStatStages") s.temp = stats.reduce(function(sum, stat, i) { return sum + Math.max(0, ctx.stage(a[0], i) - 6); }, 0);
                else if (op === "DiffStatStages") s.temp = ctx.stage(a[0], a[1]) - ctx.stage(1, a[1]);
                else if (/^IfBattlerHas(Higher|Lower|Equal)Stat$/.test(op)) {
                    var raw = function(b) { return a[1] === 0 ? hp(ctx.mon(b)) : (ctx.mon(b).rawStats || ctx.mon(b).stats)[stats[a[1]]]; };
                    jump(op.includes("Higher") ? raw(a[0]) > raw(1) : op.includes("Lower") ? raw(a[0]) < raw(1) : raw(a[0]) === raw(1));
                } else if (op === "IfBattlerFainted" || op === "IfBattlerNotFainted") jump((hp(ctx.mon(a[0])) === 0) === (op === "IfBattlerFainted"));
                else if (op === "IfBattlerUnderEffect") jump(!!ctx.state[ctx.prefix(a[0]) + (a[1] === 0 ? "DisabledMove" : "EncoredMove")]);
                else if (op === "IfCurrentMoveMatchesEffect") jump(names[key(ctx.state[a[0] === 0 ? "attackerDisabledMove" : "attackerEncoredMove"])] === info.moveId);
                else if (op === "IfFieldConditionsMask") {
                    var fm = ctx.state.fieldConditions || 0;
                    if (ctx.field.isGravity) fm |= C.FIELD_CONDITION_GRAVITY;
                    if (ctx.state.trickRoom) fm |= C.FIELD_CONDITION_TRICK_ROOM;
                    jump(!!(fm & a[0]));
                } else if (op === "IfCanUseLastResort") jump(!!ctx.history(a[0], "CanUseLastResort"));
                else throw new Error("Source command " + op + " needs additional battle state or implementation (line " + ins[3] + ").");
                next.push(s);
            });
            pending = aggregate(next);
        }
        return aggregate(complete.map(function(s) { return Object.assign({}, s, { pc: -1 }); }));
    }
    function evaluateScenario(input) {
        input = input || {};
        var assumptions = new Set(["Unshown side and volatile effects are assumed absent unless supplied; first-turn, party, move-memory and item-lock history are required when a rule needs them.", "Conditional on choosing Fight; switching and trainer item use are excluded.", "Percentages treat game RNG draws as independent uniform values; RNG seed correlations and sub-0.002% modulo bias are not modeled."]);
        var warnings = [];
        var result = { supported: false, warnings: warnings, assumptions: [], moves: [], sourceCommit: script.sourceCommit };
        try {
            if (!input.attacker || !input.defender) throw new Error("Missing attacker or defender.");
            if (input.field && input.field.gameType === "Doubles") throw new Error("Doubles targeting and partner scoring are not supported.");
            if (input.aiMask === null || input.aiMask === undefined || !Number.isInteger(Number(input.aiMask))) throw new Error("Trainer AI flags are unavailable.");
            var mask = Number(input.aiMask) >>> 0;
            if (mask & 0xE0000080) throw new Error("This trainer uses partner or special battle AI that is not supported.");
            var moves = (input.attacker.moves || []).slice(0, 4).map(function(m, i) { return normalize(m, input.moveTable, i); });
            while (moves.length < 4) moves.push(normalize(null, null, moves.length));
            var ctx = makeContext(input, moves, assumptions);
            var state = input.stateOverrides || {};
            if (state.invalidMoveMask === undefined) assumptions.add("Move locks and restrictions not supplied by battle history are assumed absent; supplied PP and restrictions are respected.");
            var invalidMask = Number(state.invalidMoveMask) || 0;
            var held = input.attacker.ability === "Klutz" || state.damageState && state.damageState.attackerEmbargo ? "" : input.attacker.item;
            var choice = ["Choice Band", "Choice Scarf", "Choice Specs"].includes(held);
            var locked = choice ? required(state, "attackerChoiceLockedMove") : "";
            if (!moves.some(function(m) { return m.moveId === names[key(locked)]; })) locked = "";
            moves.forEach(function(m) {
                if (!m.valid || state.attackerPP && state.attackerPP[m.slot] === 0 ||
                    m.moveId === names[key(state.attackerDisabledMove)] ||
                    (state.attackerEncoredMove && m.moveId !== names[key(state.attackerEncoredMove)]) ||
                    (locked && m.moveId !== names[key(locked)]) ||
                    (state.attackerTaunted && m.basePower === 0) ||
                    (state.attackerTormented && m.moveId === names[key(required(state, "attackerPreviousMove"))]) ||
                    (input.field && input.field.isGravity && ["Fly", "Bounce", "Jump Kick", "High Jump Kick", "Splash", "Magnet Rise"].includes(m.moveName)) ||
                    (state.attackerHealBlocked && ["Recover", "Soft-Boiled", "Rest", "Milk Drink", "Morning Sun", "Synthesis", "Moonlight", "Swallow", "Heal Order", "Slack Off", "Roost", "Lunar Dance", "Healing Wish", "Wish"].includes(m.moveName)) ||
                    (state.attackerImprisonedMoves || []).some(function(n) { return names[key(n)] === m.moveId; })) invalidMask |= 1 << m.slot;
            });
            if (invalidMask === 15) throw new Error("All move slots are unavailable; Struggle is forced instead of a normal move choice.");
            moves.forEach(function(info) {
                var moveResult = Object.assign({}, info, { probability: null, outcomes: [] });
                result.moves.push(moveResult);
                if (info.valid && (info.effectId === undefined || !info.moveId)) throw new Error("Unrecognized move/effect: " + info.moveName + ".");
                var pp = state.attackerPP && state.attackerPP[info.slot];
                var initial = invalidMask & (1 << info.slot) ? 0 : 100;
                // Invalid moves start at zero, but the cartridge still scores them
                // unless they have zero PP. Preserve that distinction.
                var states = [{ score: info.valid && pp !== 0 ? initial : 0, temp: 0, probability: 1, trace: [], stack: [] }];
                if (info.valid && pp !== 0) {
                    for (var flag = 0; flag < 29; flag++) {
                        if (mask & (1 << flag)) states = runFlag(states, script.flags[flag], info, moves, ctx, input.options && input.options.branchCap || 8192);
                    }
                }
                var byScore = new Map();
                states.forEach(function(s) {
                    if (byScore.has(s.score)) byScore.get(s.score).probability += s.probability;
                    else byScore.set(s.score, { finalScore: s.score, probability: s.probability, trace: s.trace });
                });
                moveResult.outcomes = Array.from(byScore.values()).sort(function(a, b) { return b.finalScore - a.finalScore; });
                if (ctx.cachedDamage(info) !== undefined) moveResult.aiMaxDamage = ctx.cachedDamage(info);
            });
            selectionProbabilities(result.moves);
            result.supported = true;
        } catch (err) {
            if (err.sharedRoll !== undefined) result.sharedRoll = err.sharedRoll;
            warnings.push(err.message);
            // Incomplete paths cannot produce defensible selection percentages.
            result.moves.forEach(function(m) { m.probability = null; });
        }
        result.assumptions = Array.from(assumptions);
        return result;
    }
    // Shared random state must be conditioned BEFORE combining independent
    // move scores. In particular, one Quick Claw activation affects every move.
    function evaluate(input) {
        var pending = [{ state: Object.assign({}, input && input.stateOverrides), probability: 1 }], results = [], count = 0;
        while (pending.length) {
            if (++count > 70000) return { supported: false, moves: [], assumptions: [], warnings: ["Shared random-state evaluation exceeded its work limit."] };
            var scenario = pending.pop(), state = scenario.state;
            var quick = ["attacker", "defender"].find(function(b) { return state[b + "QuickClawActivated"] === "auto" && input[b].item === "Quick Claw"; });
            if (quick) {
                var prob = damageAI.residueProbability(100, 0, 20);
                [false, true].forEach(function(on) { var copy = Object.assign({}, state); copy[quick + "QuickClawActivated"] = on; pending.push({ state: copy, probability: scenario.probability * (on ? prob : 1 - prob) }); });
                continue;
            }
            var r = evaluateScenario(Object.assign({}, input, { stateOverrides: state }));
            if (r.sharedRoll !== undefined) {
                for (var roll = 85; roll <= 100; roll++) {
                    var rolls = (state.damageRolls || []).slice(); rolls[r.sharedRoll] = roll;
                    pending.push({ state: Object.assign({}, state, { damageRolls: rolls }), probability: scenario.probability / 16 });
                }
                continue;
            }
            if (!r.supported) return r;
            results.push([r, scenario.probability]);
        }
        var result = results[0][0];
        if (results.length === 1) return result;
        result.moves = result.moves.map(function(m, i) {
            var outcomes = new Map(), probability = 0;
            results.forEach(function(pair) {
                probability += pair[0].moves[i].probability * pair[1];
                pair[0].moves[i].outcomes.forEach(function(o) {
                    if (!outcomes.has(o.finalScore)) outcomes.set(o.finalScore, Object.assign({}, o, { probability: 0 }));
                    outcomes.get(o.finalScore).probability += o.probability * pair[1];
                });
            });
            return Object.assign({}, m, { probability: probability, outcomes: Array.from(outcomes.values()).sort(function(a, b) { return b.finalScore - a.finalScore; }) });
        });
        return result;
    }
    var api = { AI_FLAGS: flags, evaluate: evaluate, _private: { makeContext: makeContext, normalizeMoveData: normalize, selectionProbabilities: selectionProbabilities, hpPercent: hpPercent, runFlag: runFlag } };
    root.PlatinumMoveAiPreview = api;
    if (node) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
