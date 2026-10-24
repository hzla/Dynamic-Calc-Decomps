(function(root) {
    "use strict";
    var node = typeof module !== "undefined" && module.exports;
    var data = node ? require("./platinum_ai_script") : root.PlatinumAiScript;
    var engine = node ? require("../../../calc/mechanics/gen4-switch") : root;
    var Move = node ? require("../../../calc/move").Move : root.calc.Move;
    var items = node ? require("../../../calc/items") : root;
    var types = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "???", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy"];
    function key(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
    var itemRows = {};
    Object.keys(data.items).forEach(function(token) { itemRows[key(token.replace(/^ITEM_/, ""))] = data.items[token]; });
    function itemData(name) { return itemRows[key(name)] || data.items.ITEM_NONE; }
    function eligible(move) {
        return data.altPowerEffects.includes(move.effectId) || (move.basePower > 1 && !data.riskyEffects.includes(move.effectId));
    }
    // BattleSystem_CompareBattlerSpeed computes and caches these values. The
    // order matters for odd stats; speed-halving items ignore Klutz/Embargo.
    function speed(mon, other, field, side, state, prefix) {
        state = state || {}; prefix = prefix || "attacker";
        var ability = state[prefix + "AbilitySuppressed"] ? "" : mon.ability;
        var stage = mon.boosts.spe || 0;
        if (ability === "Simple") stage = Math.max(-6, Math.min(6, stage * 2));
        var value = Math.floor(mon.rawStats.spe * (stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage)));
        var weather = [ability, other.ability].some(function(a) { return a === "Cloud Nine" || a === "Air Lock"; }) ? "" : field.weather;
        if ((ability === "Swift Swim" && weather === "Rain") || (ability === "Chlorophyll" && weather === "Sun")) value *= 2;
        if (["Macho Brace", "Iron Ball", "Power Bracer", "Power Belt", "Power Lens", "Power Band", "Power Anklet", "Power Weight"].includes(mon.item)) value = Math.floor(value / 2);
        var held = ability === "Klutz" || state[prefix + "Embargo"] ? "" : mon.item;
        if (held === "Choice Scarf") value = Math.floor(value * 15 / 10);
        if (held === "Quick Powder" && mon.name === "Ditto") value *= 2;
        if (ability === "Quick Feet" && mon.status) value = Math.floor(value * 15 / 10);
        else if (mon.status === "par") value = Math.floor(value / 4);
        if (ability === "Slow Start" && mon.abilityOn) value = Math.floor(value / 2);
        if (ability === "Unburden" && mon.abilityOn && !mon.item) value *= 2;
        if (side.isTailwind) value *= 2;
        return value;
    }
    function estimate(input, info, probe, params) {
        params = params || {};
        var attacker = input.attacker.clone(), defender = input.defender.clone();
        var field = input.field.clone();
        var state = Object.assign({}, input.stateOverrides && input.stateOverrides.damageState);
        var gen = attacker.gen;
        state.allowNoMove = true;
        if (state.attackerCharge !== undefined) state.charge = state.attackerCharge;
        var move = attacker.moves[0] ? attacker.moves[0].clone() : new Move(gen, "Tackle");
        move.name = info.moveName;
        move.bp = info.basePower;
        move.type = info.type;
        move.category = info.category;
        move.hits = 1;
        move.isCrit = false;
        // clone() is used again by ApplyTypeChart; preserve the table values there.
        move.overrides = Object.assign({}, move.overrides, { basePower: move.bp, type: move.type, category: move.category });
        attacker.stats.spe = speed(attacker, defender, field, field.attackerSide, state, "attacker");
        defender.stats.spe = speed(defender, attacker, field, field.defenderSide, state, "defender");
        // Party comparisons pass reserve metadata into the variable-power cases,
        // while CalcMoveDamage still reads the ACTIVE battler's stats and item.
        var meta = params.metadata || attacker;
        var embargo = params.metadata ? false : state.attackerEmbargo;
        var metaAbility = !params.metadata && state.attackerAbilitySuppressed ? "" : meta.ability;
        var item = metaAbility === "Klutz" || embargo ? itemData("") : itemData(meta.item);
        var name = info.moveName;
        if (probe === undefined && name === "Psywave") {
            if (params.random === undefined) throw new Error("Use the Psywave damage distribution for random AI checks.");
            state.fixedDamage = Math.floor(attacker.level * params.random / 10);
        }
        if (probe === undefined && name === "Magnitude") {
            if (params.random === undefined) throw new Error("Use the Magnitude damage distribution for random AI checks.");
            move.bp = params.random;
        }
        if (name === "Natural Gift") {
            move.bp = Number(item.naturalGiftPower) || info.basePower;
            if (Number(item.naturalGiftPower)) move.type = types[data.constants[item.naturalGiftType]];
        } else if (name === "Judgment") {
            if (item.holdEffect.indexOf("HOLD_EFFECT_ARCEUS_") === 0) move.type = items.getItemBoostType(meta.item) || info.type;
        } else if (/^(Hidden Power|HP)( |$)/.test(name)) {
            var stats = ["hp", "atk", "def", "spe", "spa", "spd"];
            var power = 0, type = 0;
            stats.forEach(function(stat, i) { power |= ((meta.ivs[stat] & 2) >> 1) << i; type |= (meta.ivs[stat] & 1) << i; });
            move.bp = Math.floor(power * 40 / 63) + 30;
            type = Math.floor(type * 15 / 63) + 1;
            move.type = types[type >= 9 ? type + 1 : type];
        } else if (name === "Gyro Ball") {
            move.bp = Math.min(150, 1 + Math.floor(25 * defender.stats.spe / attacker.stats.spe));
        } else if (["Dragon Rage", "Sonic Boom", "Seismic Toss", "Night Shade"].includes(name)) {
            state.fixedDamage = name === "Dragon Rage" ? 40 : name === "Sonic Boom" ? 20 : attacker.level;
        } else if (name === "Return" || name === "Frustration") {
            var friendship = input.stateOverrides && input.stateOverrides.friendship;
            if (friendship === undefined) throw new Error(name + " needs the attacker's friendship.");
            move.bp = Math.floor((name === "Return" ? friendship : 255 - friendship) * 10 / 25) || info.basePower;
        } else if (name === "Low Kick" || name === "Grass Knot") {
            var weight = Math.floor(defender.weightkg * 10);
            move.bp = weight <= 100 ? 20 : weight <= 250 ? 40 : weight <= 500 ? 60 : weight <= 1000 ? 80 : weight <= 2000 ? 100 : 120;
        }
        // Weather Ball has no special case in TrainerAI_CalcDamage, but the
        // effectiveness opcode calls TrainerAI_MoveType, which *does* resolve it.
        if (probe !== undefined) {
            delete state.fixedDamage;
            state.chartProbe = probe;
            if (name === "Weather Ball") {
                var weather = [attacker.ability, defender.ability].some(function(a) { return a === "Air Lock" || a === "Cloud Nine"; }) ? "" : field.weather;
                if (!["Sun", "Rain", "Sand", "Hail"].includes(weather)) throw new Error("Weather Ball effectiveness in clear, foggy, or suppressed weather is undefined in the decompiled AI; ROM behavior needs verification.");
                move.type = ({ Sun: "Fire", Rain: "Water", Sand: "Rock", Hail: "Ice" })[weather] || info.type;
            }
        }
        move.overrides.basePower = move.bp;
        move.overrides.type = move.type;
        var result = engine.calculateDPPMoveChoice(gen, attacker, defender, move, field, state);
        if (params.flags) return result.rawDesc.g4AiTypeFlags;
        var value = result.damage;
        return value ? Math.max(1, Math.floor(value * (params.variance === undefined ? 100 : params.variance) / 100)) : 0;
    }
    function mergeDistribution(rows) {
        var merged = new Map();
        rows.forEach(function(row) { merged.set(row[0], (merged.get(row[0]) || 0) + row[1]); });
        return Array.from(merged.entries());
    }
    // RandNext is a u16. Retain the tiny modulo bias for these damage draws.
    function residueProbability(mod, lo, hi) {
        var count = 0;
        for (var i = lo; i < hi; i++) count += Math.floor(65536 / mod) + (i < 65536 % mod ? 1 : 0);
        return count / 65536;
    }
    function distribution(input, info, params) {
        var rolls = [[undefined, 1]];
        if (info.moveName === "Psywave") rolls = Array.from({ length: 11 }, function(_, i) { return [i + 5, residueProbability(11, i, i + 1)]; });
        if (info.moveName === "Magnitude") rolls = [[10,0,5],[30,5,15],[50,15,35],[70,35,65],[90,65,85],[110,85,95],[150,95,100]].map(function(r) { return [r[0], residueProbability(100, r[1], r[2])]; });
        return mergeDistribution(rolls.map(function(r) { return [estimate(input, info, undefined, Object.assign({}, params, { random: r[0] })), r[1]]; }));
    }
    var api = { distribution: distribution, mergeDistribution: mergeDistribution, residueProbability: residueProbability, speed: speed, estimate: estimate, eligible: eligible, itemData: itemData, types: types };
    root.PlatinumAiDamage = api;
    if (node) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
