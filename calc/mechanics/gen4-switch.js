"use strict";
exports.__esModule = true;

var switchItems = require("../items");
var switchResult = require("../result");
var switchUtil = require("./util");

// pokeplatinum battle_lib.c: CleanupFaintedMon, CalcMoveDamage, ApplyTypeChart.
// This is the post-KO AI's calculation, including its two u8 score assignments.
// Normal battle scripts (entry abilities, berries, Life Orb, etc.) do not run.
var G4_CHART_ORDER = {
    Normal: ["Rock", "Steel", "Ghost"],
    Fire: ["Fire", "Water", "Grass", "Ice", "Bug", "Rock", "Dragon", "Steel"],
    Water: ["Fire", "Water", "Grass", "Ground", "Rock", "Dragon"],
    Electric: ["Water", "Electric", "Grass", "Ground", "Flying", "Dragon"],
    Grass: ["Fire", "Water", "Grass", "Poison", "Ground", "Flying", "Bug", "Rock", "Dragon", "Steel"],
    Ice: ["Water", "Grass", "Ice", "Ground", "Flying", "Dragon", "Steel", "Fire"],
    Fighting: ["Normal", "Ice", "Poison", "Flying", "Psychic", "Bug", "Rock", "Dark", "Steel", "Ghost"],
    Poison: ["Grass", "Poison", "Ground", "Rock", "Ghost", "Steel"],
    Ground: ["Fire", "Electric", "Grass", "Poison", "Flying", "Bug", "Rock", "Steel"],
    Flying: ["Electric", "Grass", "Fighting", "Bug", "Rock", "Steel"],
    Psychic: ["Fighting", "Poison", "Psychic", "Dark", "Steel"],
    Bug: ["Fire", "Grass", "Fighting", "Poison", "Flying", "Psychic", "Ghost", "Dark", "Steel"],
    Rock: ["Fire", "Ice", "Fighting", "Ground", "Flying", "Bug", "Steel"],
    Ghost: ["Normal", "Psychic", "Dark", "Steel", "Ghost"],
    Dragon: ["Dragon", "Steel"], Dark: ["Fighting", "Psychic", "Ghost", "Dark", "Steel"],
    Steel: ["Fire", "Water", "Electric", "Ice", "Rock", "Steel"]
};
var G4_TYPE_IDS = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "???",
    "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy"];
var G4_PUNCHES = ["Ice Punch", "Fire Punch", "Thunder Punch", "Mach Punch", "Focus Punch", "Dizzy Punch",
    "Dynamic Punch", "Hammer Arm", "Mega Punch", "Comet Punch", "Meteor Mash", "Shadow Punch", "Drain Punch",
    "Bullet Punch", "Sky Uppercut"];
var G4_WONDER_GUARD_CHARGE_MOVES = ["Bide", "Razor Wind", "Sky Attack", "Skull Bash", "Solar Beam", "Fly",
    "Dive", "Dig", "Bounce", "Fire Fang"];

function g4SwitchRatio(value, numerator, denominator) {
    return Math.floor(value * numerator / denominator);
}
function g4SwitchStage(stat, stage) {
    stage = Math.max(-6, Math.min(6, stage || 0));
    return stage >= 0 ? g4SwitchRatio(stat, 2 + stage, 2) : g4SwitchRatio(stat, 2, 2 - stage);
}
function g4SwitchDivide(value, divisor) {
    return value ? Math.max(1, Math.floor(value / divisor)) : 0;
}

function calculateDPPPostKO(gen, attacker, defender, move, field) {
    // Optional partner/volatile state supplements the two visible combatants.
    // Doubles defaults assume both partner slots are alive unless specified.
    var state = field.g4Phase2State || {};
    var aSide = field.attackerSide, dSide = field.defenderSide;
    var doubles = field.gameType === "Doubles";
    var aAbility = attacker.ability;
    var dAbility = defender.ability;
    var attackerPartnerAbility = state.attackerPartnerAbility;
    if (!attackerPartnerAbility && doubles && attacker.abilityOn && ["Plus", "Minus"].includes(aAbility)) {
        attackerPartnerAbility = aAbility === "Plus" ? "Minus" : "Plus";
    }
    if (dAbility === "Levitate" && (field.isGravity || state.defenderIngrain)) dAbility = "";
    var aItem = aAbility === "Klutz" ? "" : attacker.item;
    var dItem = dAbility === "Klutz" || state.defenderEmbargo ? "" : defender.item;
    var ignoresAbility = aAbility === "Mold Breaker";
    var defAbility = function (name) { return !ignoresAbility && dAbility === name; };
    var weather = [dAbility, attackerPartnerAbility, state.defenderPartnerAbility].some(function (ability) {
        return ability === "Cloud Nine" || ability === "Air Lock";
    }) ? "" : field.weather;
    var desc = { attackerName: attacker.name, defenderName: defender.name, moveName: move.name };
    var result = new switchResult.Result(gen, attacker, defender, move, field, 0, desc);
    if (move.named("(No Move)")) return result;

    var power = move.bp;
    var damageType = move.type;
    if (move.named("Weather Ball", "Judgment", "Struggle")) damageType = "Normal";
    if (move.named("Future Sight")) damageType = "Psychic";
    if (move.named("Doom Desire")) damageType = "Steel";
    var chartType = damageType;
    if (move.named("Weather Ball")) chartType = ({ Sun: "Fire", Rain: "Water", Sand: "Rock", Hail: "Ice" })[weather] || "Normal";
    if (move.named("Judgment")) {
        // Move_CalcVariableType uses the reserve's item, not the fainted user's.
        var reserveItem = move.overrides && move.overrides.g4Phase2ReserveItem;
        chartType = reserveItem && reserveItem.includes("Plate") ? switchItems.getItemBoostType(reserveItem) || "Normal" : "Normal";
    }
    if (aAbility === "Normalize") damageType = chartType = "Normal";
    desc.moveBP = power;
    desc.moveType = chartType;

    var atk = attacker.rawStats.atk, spa = attacker.rawStats.spa;
    var def = defender.rawStats.def, spd = defender.rawStats.spd;
    // Fainting clears Power Trick's flag, but does not undo its swapped raw stats.
    if (aSide.isPowerTrick) atk = attacker.rawStats.def;
    if (dSide.isPowerTrick) def = defender.rawStats.atk;
    var physical = move.category === "Physical", special = move.category === "Special";
    var statMod = function (stat, n, d) { return g4SwitchRatio(stat, n, d) & 0xFFFF; };

    // CleanupFaintedMon clears Charge and Helping Hand; Technician remains.
    if (aAbility === "Technician" && !move.named("Struggle") && power <= 60) power = statMod(power, 3, 2);
    if (aAbility === "Huge Power" || aAbility === "Pure Power") atk = statMod(atk, 2, 1);
    // Faint cleanup resets slowStartTurnNumber to totalTurns+1.
    if (aAbility === "Slow Start") atk = Math.floor(atk / 2);
    var boostedType = switchItems.getItemBoostType(aItem);
    // Shared item helpers also contain items absent from Platinum's item table.
    if (["Steel Feather", "Fairy Feather", "Pixie Plate", "Pink Bow", "Polkadot Bow"].includes(aItem)) boostedType = undefined;
    if (damageType === boostedType) power = statMod(power, 120, 100);
    if (aItem === "Choice Band") atk = statMod(atk, 150, 100);
    if (aItem === "Choice Specs") spa = statMod(spa, 150, 100);
    if (aItem === "Soul Dew" && attacker.named("Latios", "Latias") && !state.frontier) spa = statMod(spa, 150, 100);
    if (dItem === "Soul Dew" && defender.named("Latios", "Latias") && !state.frontier) spd = statMod(spd, 150, 100);
    if (aItem === "Deep Sea Tooth" && attacker.named("Clamperl")) spa = statMod(spa, 2, 1);
    if (dItem === "Deep Sea Scale" && defender.named("Clamperl")) spd = statMod(spd, 2, 1);
    // The game doubles power here, after Technician, rather than the Attack stat.
    if (aItem === "Light Ball" && attacker.named("Pikachu")) power = statMod(power, 2, 1);
    if (dItem === "Metal Powder" && defender.named("Ditto")) def = statMod(def, 2, 1);
    if (aItem === "Thick Club" && attacker.named("Cubone", "Marowak")) atk = statMod(atk, 2, 1);
    if ((aItem === "Adamant Orb" && attacker.named("Dialga") && ["Dragon", "Steel"].includes(damageType)) ||
        (aItem === "Lustrous Orb" && attacker.named("Palkia") && ["Dragon", "Water"].includes(damageType)) ||
        (aItem === "Griseous Orb" && attacker.named("Giratina", "Giratina-Origin") && ["Dragon", "Ghost"].includes(damageType))) {
        power = statMod(power, 120, 100);
    }
    if ((aItem === "Muscle Band" && physical) || (aItem === "Wise Glasses" && special)) power = statMod(power, 110, 100);
    if (defAbility("Thick Fat") && ["Fire", "Ice"].includes(damageType)) power = Math.floor(power / 2);
    if (aAbility === "Hustle") atk = statMod(atk, 150, 100);
    if (aAbility === "Guts" && attacker.status) atk = statMod(atk, 150, 100);
    if (defAbility("Marvel Scale") && defender.status) def = statMod(def, 150, 100);
    if ((aAbility === "Plus" && attackerPartnerAbility === "Minus") ||
        (aAbility === "Minus" && attackerPartnerAbility === "Plus")) spa = statMod(spa, 150, 100);
    if (damageType === "Electric" && state.mudSport) power = Math.floor(power / 2);
    if (damageType === "Fire" && state.waterSport) power = Math.floor(power / 2);
    if ((aAbility === "Overgrow" && damageType === "Grass") || (aAbility === "Blaze" && damageType === "Fire") ||
        (aAbility === "Torrent" && damageType === "Water") || (aAbility === "Swarm" && damageType === "Bug")) {
        power = statMod(power, 150, 100);
        desc.attackerAbility = aAbility;
    }
    if (defAbility("Heatproof") && damageType === "Fire") power = Math.floor(power / 2);
    if (defAbility("Dry Skin") && damageType === "Fire") power = statMod(power, 125, 100);
    var defenseStage = defender.boosts[physical ? "def" : "spd"] || 0;
    if (defAbility("Simple")) defenseStage = Math.max(-6, Math.min(6, defenseStage * 2));
    if (aAbility === "Unaware") defenseStage = 0;
    if (aAbility === "Rivalry" && attacker.gender !== "N" && defender.gender !== "N") {
        power = statMod(power, attacker.gender === defender.gender ? 125 : 75, 100);
    }
    if (aAbility === "Iron Fist" && G4_PUNCHES.includes(move.name)) power = statMod(power, 120, 100);
    if (weather === "Sun" && aAbility === "Solar Power") spa = statMod(spa, 15, 10);
    if (weather === "Sand" && defender.hasType("Rock")) spd = statMod(spd, 15, 10);
    // The fainted attacker's own Flower Gift is not counted as a living ally.
    if (weather === "Sun" && (attackerPartnerAbility === "Flower Gift" || (doubles && aSide.isFlowerGift))) atk = statMod(atk, 15, 10);
    if (weather === "Sun" && !ignoresAbility && (dAbility === "Flower Gift" || state.defenderPartnerAbility === "Flower Gift" ||
        (doubles && dSide.isFlowerGift))) spd = statMod(spd, 15, 10);
    if (move.named("Explosion", "Self-Destruct")) def = Math.floor(def / 2);

    var damage = 0;
    if (physical || special) {
        var offense = physical ? atk : spa;
        var defense = g4SwitchStage(physical ? def : spd, defenseStage);
        damage = Math.floor(offense * power * (Math.floor(attacker.level * 2 / 5) + 2) / Math.max(1, defense));
        damage = Math.floor(damage / 50);
        if (physical && attacker.status === "brn" && aAbility !== "Guts") damage = Math.floor(damage / 2);
        var defendingAlive = state.defenderSideAlive === undefined ? (doubles ? 2 : 1) : state.defenderSideAlive;
        if (!move.named("Brick Break") && ((physical && dSide.isReflect) || (special && dSide.isLightScreen))) {
            damage = doubles && defendingAlive === 2 ? g4SwitchRatio(damage, 2, 3) : Math.floor(damage / 2);
        }
    }
    var otherAlive = state.otherAlive === undefined ? (doubles ? 2 : 0) : state.otherAlive;
    if (doubles && ((move.target === "allAdjacentFoes" && (state.defenderSideAlive === undefined || state.defenderSideAlive === 2)) ||
        (move.target === "allAdjacent" && otherAlive >= 2))) damage = g4SwitchRatio(damage, 3, 4);
    if (weather === "Rain") {
        if (damageType === "Fire") damage = Math.floor(damage / 2);
        if (damageType === "Water") damage = g4SwitchRatio(damage, 15, 10);
    }
    if (move.named("Solar Beam") && ["Rain", "Sand", "Hail", "Fog"].includes(weather)) damage = Math.floor(damage / 2);
    if (weather === "Sun") {
        if (damageType === "Fire") damage = g4SwitchRatio(damage, 15, 10);
        if (damageType === "Water") damage = Math.floor(damage / 2);
    }
    // CleanupFaintedMon clears Flash Fire's moveEffectsData, so no boost here.
    damage += 2;
    desc.g4Phase2BaseDamage = damage;
    desc.g4Phase2Power = power;
    var score = damage & 0xFF;
    var stab = attacker.hasType(chartType) ? (aAbility === "Adaptability" ? 2 : 1.5) : 1;
    if (move.named("Struggle")) stab = 1;
    desc.g4Phase2StabMod = stab;
    score = g4SwitchRatio(score, stab === 1.5 ? 15 : stab, stab === 1.5 ? 10 : 1);
    var filter = 1, expert = 1, tinted = 1, immune = false, se = false, nve = false;
    var chartMove = move.clone();
    chartMove.type = chartType;
    var ctx = { gen: gen, attacker: attacker, defender: defender, move: chartMove, field: field };
    var pairs = defender.types.filter(function (type, index, types) { return type && types.indexOf(type) === index; }).map(function (type) {
        var eff = switchUtil.getMoveEffectiveness(gen, chartMove, type, aAbility === "Scrappy" || dSide.isForesight,
            field.isGravity, false, false, false, false, null, ctx);
        if (type === "Flying" && chartType === "Ground" && (dItem === "Iron Ball" || state.defenderIngrain || field.isGravity)) eff = 1;
        if (type === "Flying" && state.defenderRoost) eff = 1;
        if (type === "Dark" && chartType === "Psychic" && state.defenderMiracleEye) eff = 1;
        return { type: type, eff: eff };
    });
    var order = typeof TITLE === "string" && TITLE === "Renegade Platinum" ? G4_TYPE_IDS : G4_CHART_ORDER[chartType] || G4_TYPE_IDS;
    pairs.sort(function (a, b) { return order.indexOf(a.type) - order.indexOf(b.type); });
    desc.g4Phase2Type1Effectiveness = pairs[0] ? pairs[0].eff : 1;
    desc.g4Phase2Type2Effectiveness = pairs[1] ? pairs[1].eff : 1;
    if (!move.named("Struggle")) {
        if (chartType === "Ground" && dItem !== "Iron Ball" && (defAbility("Levitate") || (state.defenderMagnetRise && !state.defenderIngrain))) {
            immune = true;
        } else {
            pairs.forEach(function (pair) {
                if (pair.eff === 0) { score = 0; immune = true; se = nve = false; }
                if (pair.eff === 0.5) {
                    score = g4SwitchDivide(score * 5, 10);
                    if (move.bp) { if (se) se = false; else nve = true; }
                }
                if (pair.eff === 2) {
                    score = g4SwitchDivide(score * 20, 10);
                    if (move.bp) { if (nve) nve = false; else se = true; }
                }
            });
        }
        if (defAbility("Wonder Guard") && !G4_WONDER_GUARD_CHARGE_MOVES.includes(move.name) && (!se || (se && nve)) && move.bp) {
            immune = true;
        } else {
            if (se && move.bp) {
                if (defAbility("Filter") || defAbility("Solid Rock")) { filter = 0.75; score = g4SwitchDivide(score * 3, 4); }
                if (aItem === "Expert Belt") { expert = 1.2; score = g4SwitchRatio(score, 120, 100); }
            }
            if (nve && move.bp && aAbility === "Tinted Lens") { tinted = 2; score *= 2; }
        }
    }
    desc.g4Phase2FilterMod = filter;
    desc.g4Phase2ExpertBeltMod = expert;
    desc.g4Phase2TintedMod = tinted;
    desc.g4Phase2BerryMod = 1;
    desc.g4Phase2Score = immune ? 0 : score & 0xFF;
    result.damage = desc.g4Phase2Score;
    return result;
}
exports.calculateDPPPostKO = calculateDPPPostKO;
