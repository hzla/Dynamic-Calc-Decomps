"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;

var items_1 = require("../items");
var result_1 = require("../result");
var util_1 = require("./util");
var romhacks_1 = require("./romhacks");
var romhack_helpers_1 = require("./romhacks/helpers");
function calculateDPP(gen, attacker, defender, move, field) {
    var title = typeof TITLE === "string" ? TITLE : "";
    var profile = (0, romhacks_1.getMechanicsProfile)(title, gen.num);
    var ctx = {
        gen: gen,
        attacker: attacker,
        defender: defender,
        move: move,
        field: field,
        title: title,
        desc: null,
        util: util_1,
        state: {}
    };
    // if (limitHits) {
    //     move.hits = 1
    // }


    (0, util_1.checkAirLock)(attacker, field);
    (0, util_1.checkAirLock)(defender, field);
    (0, util_1.checkForecast)(attacker, field.weather);
    (0, util_1.checkForecast)(defender, field.weather);
    (0, util_1.checkItem)(attacker);
    (0, util_1.checkItem)(defender);
    (0, util_1.checkRawStatChanges)(attacker, field.attackerSide.isPowerTrick);
    (0, util_1.checkRawStatChanges)(defender, field.defenderSide.isPowerTrick);
    (0, util_1.checkIntimidate)(gen, attacker, defender);
    (0, util_1.checkIntimidate)(gen, defender, attacker);
    (0, util_1.checkDownload)(attacker, defender);
    (0, util_1.checkDownload)(defender, attacker);
    attacker.stats.spe = (0, util_1.getFinalSpeed)(gen, attacker, field, field.attackerSide);
    defender.stats.spe = (0, util_1.getFinalSpeed)(gen, defender, field, field.defenderSide);
    var desc = {
        attackerName: attacker.name,
        moveName: move.name,
        defenderName: defender.name
    };
    var scoresFutureSightAsSwitchMove = typeof calcingForSwitchIns !== "undefined" &&
        calcingForSwitchIns &&
        move.named('Future Sight', 'Doom Desire');
    ctx.desc = desc;
    var result = new result_1.Result(gen, attacker, defender, move, field, 0, desc);
    if (move.category === 'Status' && !move.named('Nature Power')) {
        return result;
    }
    if (field.defenderSide.isProtected && !move.breaksProtect) {
        desc.isProtected = true;
        return result;
    }
    if (attacker.hasAbility('Mold Breaker')) {
        defender.ability = '';
        desc.attackerAbility = attacker.ability;
    }
    var isCritical = move.isCrit && !defender.hasAbility('Battle Armor', 'Shell Armor');
    var basePower = move.bp;
    if (move.named('Weather Ball')) {
        if (field.hasWeather('Sun')) {
            move.type = 'Fire';
            basePower *= 2;
            // console.log("fire")
            // console.log(basePower)
        }
        else if (field.hasWeather('Rain')) {
            move.type = 'Water';
            basePower *= 2;
        }
        else if (field.hasWeather('Sand')) {
            move.type = 'Rock';
            basePower *= 2;
        }
        else if (field.hasWeather('Hail')) {
            move.type = 'Ice';
            basePower *= 2;
        }
        else if (field.hasWeather('Fog')) {
            basePower *= 2;
        }
        else {
            move.type = 'Normal';
        }
        desc.weather = field.weather;
        desc.moveType = move.type;
        desc.moveBP = basePower;
        move.bp = basePower
    }
    else if (move.named('Judgment') && attacker.item && attacker.item.includes('Plate')) {
        move.type = (0, items_1.getItemBoostType)(attacker.item);
    }
    else if (move.named('Natural Gift') && attacker.item && attacker.item.includes('Berry')) {
        var gift = (0, items_1.getNaturalGift)(gen, attacker.item);
        move.type = gift.t;
        move.bp = gift.p;
        desc.attackerItem = attacker.item;
        desc.moveBP = move.bp;
        desc.moveType = move.type;
    }
    if (scoresFutureSightAsSwitchMove) {
        move.type = move.named('Doom Desire') ? 'Steel' : 'Psychic';
        desc.moveType = move.type;
    }
    if (attacker.hasAbility('Normalize')) {
        move.type = 'Normal';
        desc.attackerAbility = attacker.ability;
    }
    var isGhostRevealed = attacker.hasAbility('Scrappy') || field.defenderSide.isForesight;
    var type1Effectiveness = (0, util_1.getMoveEffectiveness)(gen, move, defender.types[0], isGhostRevealed, field.isGravity, false, false, false, false, profile, ctx);
    var type2Effectiveness = defender.types[1]
        ? (0, util_1.getMoveEffectiveness)(gen, move, defender.types[1], isGhostRevealed, field.isGravity, false, false, false, false, profile, ctx)
        : 1;
    var typeEffectiveness = type1Effectiveness * type2Effectiveness;
    if (typeEffectiveness === 0 && move.hasType('Ground') && defender.hasItem('Iron Ball')) {
        if (type1Effectiveness === 0) {
            type1Effectiveness = 1;
        }
        else if (defender.types[1] && type2Effectiveness === 0) {
            type2Effectiveness = 1;
        }
        typeEffectiveness = type1Effectiveness * type2Effectiveness;
    }

    if (!scoresFutureSightAsSwitchMove && (move.named('Future Sight') || move.named('Doom Desire'))) {
        type1Effectiveness = 1;
        type2Effectiveness = 1;
        typeEffectiveness = 1;
    }

    if (typeEffectiveness === 0) {
        return result;
    }
    var ignoresWonderGuard = move.hasType('???') || move.named('Fire Fang') || (!scoresFutureSightAsSwitchMove && (move.named('Doom Desire') || move.named('Future Sight')));
    

    if ((!ignoresWonderGuard && defender.hasAbility('Wonder Guard') && typeEffectiveness <= 1) ||
        (move.hasType('Fire') && defender.hasAbility('Flash Fire')) ||
        (move.hasType('Water') && defender.hasAbility('Dry Skin', 'Water Absorb')) ||
        (move.hasType('Electric') && defender.hasAbility('Motor Drive', 'Volt Absorb')) ||
        (move.hasType('Ground') && !field.isGravity &&
            !defender.hasItem('Iron Ball') && defender.hasAbility('Levitate')) ||
        (move.flags.sound && defender.hasAbility('Soundproof'))) {
        
        if (!calcingForSwitchIns) {
            desc.defenderAbility = defender.ability;
            return result; 
        } else {
            if (move.named("Weather Ball", "Judgment") || move.name.includes("Hidden Power")) {
                console.log("immunity skipped")
                // Do nothing
            } else {
                return result
            }
        }
            
    }
    desc.HPEVs = "".concat(defender.evs.hp, " HP");
    var fixedDamage = (0, util_1.handleFixedDamageMoves)(attacker, move);
    if (fixedDamage) {
        result.damage = fixedDamage;
        return result;
    }



    if (move.hits > 1) {
        desc.hits = move.hits;
    }
    var computeDamageArray = function (hitCount) {
        if (hitCount === void 0) { hitCount = 0; }
        var basePower = move.bp;
        var turnOrder = attacker.stats.spe > defender.stats.spe ? 'first' : 'last';
        switch (move.name) {
            case 'Brine':
                if (defender.curHP() <= defender.maxHP() / 2 && !calcingForSwitchIns) {
                    basePower *= 2;
                    desc.moveBP = basePower;
                }
                break;
            case 'Eruption':
                basePower = Math.max(1, Math.floor((basePower * attacker.curHP()) / attacker.maxHP()));
                desc.moveBP = basePower;
                break;
            case 'Water Spout':
                basePower = Math.max(1, Math.floor((basePower * attacker.curHP()) / attacker.maxHP()));
                desc.moveBP = basePower;
                break;
            case 'Facade':
                if (!calcingForSwitchIns) {
                    if (attacker.hasStatus('par', 'psn', 'tox', 'brn')) {
                        basePower = move.bp * 2;
                        desc.moveBP = basePower;
                    }   
                }     
                break;
            case 'Flail':
            case 'Reversal':
                var p = Math.floor((64 * attacker.curHP()) / attacker.maxHP());
                basePower = p <= 1 ? 200 : p <= 5 ? 150 : p <= 12 ? 100 : p <= 21 ? 80 : p <= 42 ? 40 : 20;
                desc.moveBP = basePower;
                break;
            case 'Fling':
                basePower = (0, items_1.getFlingPower)(attacker.item);
                desc.moveBP = basePower;
                desc.attackerItem = attacker.item;
                break;
            case 'Grass Knot':
            case 'Low Kick':
                var w = defender.weightkg;
                basePower = w > 200 ? 120 : w > 100 ? 100 : w > 50 ? 80 : w > 25 ? 60 : w > 10 ? 40 : 20;
                desc.moveBP = basePower;
                break;
            case 'Gyro Ball':
                basePower = Math.min(150, Math.floor((25 * defender.stats.spe) / attacker.stats.spe));
                desc.moveBP = basePower;
                break;
            case 'Payback':
                if (turnOrder !== 'first') {
                    basePower *= 2;
                    desc.moveBP = basePower;
                }
                break;
            case 'Punishment':
                basePower = Math.min(200, 60 + 20 * (0, util_1.countBoosts)(gen, defender.boosts));
                desc.moveBP = basePower;
                break;
            case 'Wake-Up Slap':
                if (!calcingForSwitchIns) {
                    if (defender.hasStatus('slp')) {
                        basePower *= 2;
                        desc.moveBP = basePower;
                    }
                }
                break;
             case 'Smelling Salts':
                if (!calcingForSwitchIns) {
                    if (defender.hasStatus('par')) {
                        basePower *= 2;
                        desc.moveBP = basePower;
                    }
                }
                break;
            case 'Nature Power':
                move.category = 'Special';
                move.secondaries = true;
                if (calcingForSwitchIns) {
                    basePower = 0;
                } else {
                    basePower = 80;
                }
                desc.moveName = 'Tri Attack';
                break;
            case 'Crush Grip':
            case 'Wring Out':
                basePower = Math.floor((defender.curHP() * 120) / defender.maxHP()) + 1;
                desc.moveBP = basePower;
                break;
            case 'Fury Cutter':
                break;
            case 'Triple Kick':
                basePower = (hitCount + 1) * 10;
                desc.moveBP = move.hits === 2 ? 30 : move.hits === 3 ? 60 : 10;
                
                break;
            case 'Rock Wrecker':
                break;
            case 'Triple Axel':
                basePower = (hitCount + 1) * 20;;
                desc.moveBP = move.hits === 2 ? 70 : move.hits === 3 ? 120 : 30;
                break;
            default:
                basePower = move.bp;
        }
        ctx.state.hitCount = hitCount;
        ctx.state.originalBasePower = move.bp;
        basePower = (0, romhack_helpers_1.applyValueHooks)(profile, "moveBasePower", ctx, basePower);
        if (basePower === 0) {
            return null;
        }
        if (field.attackerSide.isHelpingHand) {
            basePower = Math.floor(basePower * 1.5);
            desc.isHelpingHand = true;
        }
        if ((attacker.hasAbility('Technician') && basePower <= 60 && !(move.named('Pursuit') && field.defenderSide.isSwitching))) {
            basePower = Math.floor(basePower * 1.5);
            desc.attackerAbility = attacker.ability;
        }
        if (field.attackerSide.is10Buff) {
            basePower = Math.floor(basePower * 1.1);
            desc.is10Buff = true;
        }
        if (field.attackerSide.is15Buff) {
            basePower = Math.floor(basePower * 1.15);
        }
        if (field.attackerSide.is20Buff) {
            basePower = Math.floor(basePower * 1.2);
        }
        if (field.attackerSide.is25Buff) {
            basePower = Math.floor(basePower * 1.25);
        }
        if (field.attackerSide.is30Buff) {
            basePower = Math.floor(basePower * 1.3);
        }
        if (field.attackerSide.is50Buff) {
            basePower = Math.floor(basePower * 1.5);
        }
        var isPhysical = move.category === 'Physical';
        if ((attacker.hasItem('Muscle Band') && isPhysical) ||
            (attacker.hasItem('Wise Glasses') && !isPhysical)) {
            ctx.state.modifierId = "muscleWiseBoost";
            var muscleWiseMods = (0, romhack_helpers_1.applyValueHooks)(profile, "basePowerMods", ctx, []);
            ctx.state.modifierId = undefined;
            basePower = Math.floor(basePower * (muscleWiseMods[0] || 1.1));
            desc.attackerItem = attacker.item;
        }
        else if (move.hasType((0, items_1.getItemBoostType)(attacker.item)) ||
            (attacker.hasItem('Adamant Orb') &&
                attacker.named('Dialga') &&
                move.hasType('Steel', 'Dragon')) ||
            (attacker.hasItem('Lustrous Orb') &&
                attacker.named('Palkia') &&
                move.hasType('Water', 'Dragon')) ||
            (attacker.hasItem('Griseous Orb') &&
                attacker.named('Giratina-Origin') &&
                move.hasType('Ghost', 'Dragon'))) {
            ctx.state.modifierId = "plateBoost";
            ctx.state.fixedMod = 1.5;
            var profileMods = (0, romhack_helpers_1.applyValueHooks)(profile, "basePowerMods", ctx, []);
            ctx.state.modifierId = undefined;
            if (profileMods.length) {
                basePower = Math.floor(basePower * profileMods[0]);
            }
            else {
                basePower = Math.floor(basePower * 1.2);
            }
            
            desc.attackerItem = attacker.item;
        }
        if ((attacker.hasAbility('Reckless') && (move.recoil || move.hasCrashDamage)) ||
            (attacker.hasAbility('Iron Fist') && move.flags.punch)) {
            basePower = Math.floor(basePower * 1.2);
            desc.attackerAbility = attacker.ability;
        }
        else if ((attacker.curHP() <= attacker.maxHP() / 3 &&
            ((attacker.hasAbility('Overgrow') && move.hasType('Grass')) ||
                (attacker.hasAbility('Blaze') && move.hasType('Fire')) ||
                (attacker.hasAbility('Torrent') && move.hasType('Water')) ||
                (attacker.hasAbility('Swarm') && move.hasType('Bug'))))) {
            basePower = Math.floor(basePower * 1.5);
            desc.attackerAbility = attacker.ability;
        }
        if ((defender.hasAbility('Heatproof') && move.hasType('Fire')) ||
            (defender.hasAbility('Thick Fat') && (move.hasType('Fire', 'Ice')))) {
            basePower = Math.floor(basePower * 0.5);
            desc.defenderAbility = defender.ability;
        }
        else if (defender.hasAbility('Dry Skin') && move.hasType('Fire')) {
            basePower = Math.floor(basePower * 1.25);
            desc.defenderAbility = defender.ability;
        }
        if (attacker.hasAbility('Rivalry') && ![attacker.gender, defender.gender].includes('N')) {
            if (attacker.gender === defender.gender) {
                basePower = Math.floor(basePower * 1.25);
                desc.rivalry = 'buffed';
            }
            else {
                basePower = Math.floor(basePower * 0.75);
                desc.rivalry = 'nerfed';
            }
            desc.attackerAbility = attacker.ability;
        }
        var attackStat = isPhysical ? 'atk' : 'spa';
        desc.attackEVs = "";
        var attack = attacker.rawStats[attackStat];
        var attackBoost = attacker.boosts[attackStat];
        if (field.attackerSide.isPowerTrick && isPhysical) {
            desc.isPowerTrickAttacker = true;
        }
        if (defender.hasAbility('Unaware')) {
            desc.defenderAbility = defender.ability;
        }
        else if (attacker.hasAbility('Simple')) {
            attack = getSimpleModifiedStat(attack, attackBoost);
            desc.attackerAbility = attacker.ability;
            desc.attackBoost = attackBoost;
        }
        else if (attackBoost > 0 || (!isCritical && attackBoost < 0)) {
            attack = (0, util_1.getModifiedStat)(attack, attackBoost);
            desc.attackBoost = attackBoost;
        }
        if (isPhysical && attacker.hasAbility('Pure Power', 'Huge Power')) {
            attack *= 2;
            desc.attackerAbility = attacker.ability;
        }
        else if (field.hasWeather('Sun') &&
            (attacker.hasAbility(isPhysical ? 'Flower Gift' : 'Solar Power'))) {
            attack = Math.floor(attack * 1.5);
            desc.attackerAbility = attacker.ability;
            desc.weather = field.weather;
        }
        else if (field.attackerSide.isFlowerGift && field.hasWeather('Sun') && isPhysical) {
            attack = Math.floor(attack * 1.5);
            desc.weather = field.weather;
            desc.isFlowerGiftAttacker = true;
        }
        else if ((isPhysical &&
            (attacker.hasAbility('Hustle') || (attacker.hasAbility('Guts') && attacker.status)) ||
            (!isPhysical && attacker.abilityOn && attacker.hasAbility('Plus', 'Minus')))) {
            attack = Math.floor(attack * 1.5);
            desc.attackerAbility = attacker.ability;
        }
        else if (isPhysical && attacker.hasAbility('Slow Start') && attacker.abilityOn) {
            attack = Math.floor(attack / 2);
            desc.attackerAbility = attacker.ability;
        }
        if ((isPhysical ? attacker.hasItem('Choice Band') : attacker.hasItem('Choice Specs')) ||
            (!isPhysical && attacker.hasItem('Soul Dew') && attacker.named('Latios', 'Latias'))) {
            var choiceMods = [];
            if (!attacker.hasItem('Soul Dew')) {
                ctx.state.modifierId = "choiceBoost";
                choiceMods = (0, romhack_helpers_1.applyValueHooks)(profile, "attackMods", ctx, []);
                ctx.state.modifierId = undefined;
            }
            attack = Math.floor(attack * (choiceMods[0] || 1.5));
            desc.attackerItem = attacker.item;
        }
        else if (isPhysical && attacker.hasItem('Berserk Gene')) {
            attack = Math.floor(attack * 1.5);
            desc.attackerItem = attacker.item;
        }
        else if ((attacker.hasItem('Light Ball') && attacker.named('Pikachu')) ||
            (attacker.hasItem('Thick Club') && attacker.named('Cubone', 'Marowak') && isPhysical) ||
            (attacker.hasItem('Deep Sea Tooth') && attacker.named('Clamperl') && !isPhysical)) {
            attack *= 2;
            desc.attackerItem = attacker.item;
        }
        var defenseStat = isPhysical ? 'def' : 'spd';
        desc.defenseEVs = "";
        var defense = defender.rawStats[defenseStat];
        var defenseBoost = defender.boosts[defenseStat];
        if (field.defenderSide.isPowerTrick && isPhysical) {
            desc.isPowerTrickDefender = true;
        }
        if (attacker.hasAbility('Unaware')) {
            desc.attackerAbility = attacker.ability;
        }
        else if (defender.hasAbility('Simple')) {
            defense = getSimpleModifiedStat(defense, defenseBoost);
            desc.defenderAbility = defender.ability;
            desc.defenseBoost = defenseBoost;
        }
        else if (defenseBoost < 0 || (!isCritical && defenseBoost > 0)) {
            defense = (0, util_1.getModifiedStat)(defense, defenseBoost);
            desc.defenseBoost = defenseBoost;
        }
        if (defender.hasAbility('Marvel Scale') && defender.status && isPhysical) {
            defense = Math.floor(defense * 1.5);
            desc.defenderAbility = defender.ability;
        }
        else if (defender.hasAbility('Flower Gift') && field.hasWeather('Sun') && !isPhysical) {
            defense = Math.floor(defense * 1.5);
            desc.defenderAbility = defender.ability;
            desc.weather = field.weather;
        }
        else if (field.defenderSide.isFlowerGift && field.hasWeather('Sun') && !isPhysical) {
            defense = Math.floor(defense * 1.5);
            desc.weather = field.weather;
            desc.isFlowerGiftDefender = true;
        }
        if ((defender.hasItem('Soul Dew') && defender.named('Latios', 'Latias') && !isPhysical) || (defender.hasItem('Eviolite') && ((_a = gen.species.get((0, util_1.toID)(defender.name))) === null || _a === void 0 ? void 0 : _a.nfe))) {
            defense = Math.floor(defense * 1.5);
            desc.defenderItem = defender.item;
        }
        else if ((defender.hasItem('Deep Sea Scale') && defender.named('Clamperl') && !isPhysical) ||
            (defender.hasItem('Metal Powder') && defender.named('Ditto') && isPhysical)) {
            defense *= 2;
            desc.defenderItem = defender.item;
        }
        if (field.hasWeather('Sand') && defender.hasType('Rock') && !isPhysical) {
            defense = Math.floor(defense * 1.5);
            desc.weather = field.weather;
        }
        if (move.named('Explosion') || move.named('Self-Destruct')) {
            defense = Math.floor(defense * 0.5);
        }
        if (defense < 1) {
            defense = 1;
        }
        var baseDamage = Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * basePower * attack) / 50) / defense);
        if (attacker.hasStatus('brn') && isPhysical && !attacker.hasAbility('Guts')) {
            baseDamage = Math.floor(baseDamage * 0.5);
            desc.isBurned = true;
        }
        if (!isCritical) {
            var screenMultiplier = field.gameType !== 'Singles' ? 2 / 3 : 1 / 2;
            if (isPhysical && field.defenderSide.isReflect) {
                baseDamage = Math.floor(baseDamage * screenMultiplier);
                desc.isReflect = true;
            }
            else if (!isPhysical && field.defenderSide.isLightScreen) {
                baseDamage = Math.floor(baseDamage * screenMultiplier);
                desc.isLightScreen = true;
            }
        }
        if (field.gameType !== 'Singles' &&
            ['allAdjacent', 'allAdjacentFoes'].includes(move.target)) {
            baseDamage = Math.floor((baseDamage * 3) / 4);
        }
        if ((field.hasWeather('Sun') && move.hasType('Fire')) ||
            (field.hasWeather('Rain') && move.hasType('Water'))) {
            baseDamage = Math.floor(baseDamage * 1.5);
            desc.weather = field.weather;
        }
        else if ((field.hasWeather('Sun') && move.hasType('Water')) ||
            (field.hasWeather('Rain') && move.hasType('Fire')) ||
            (move.named('Solar Beam') && field.hasWeather('Rain', 'Sand', 'Hail', 'Fog'))) {
            baseDamage = Math.floor(baseDamage * 0.5);
            desc.weather = field.weather;
        }
        if (attacker.hasAbility('Flash Fire') && attacker.abilityOn && move.hasType('Fire')) {
            baseDamage = Math.floor(baseDamage * 1.5);
            desc.attackerAbility = 'Flash Fire';
        }
        baseDamage += 2;
        if (isCritical) {
            if (attacker.hasAbility('Sniper')) {
                baseDamage *= 3;
                desc.attackerAbility = attacker.ability;
            }
            else {
                baseDamage *= 2;
            }
            desc.isCritical = isCritical;
        }
        if (attacker.hasItem('Life Orb') && !move.named('Future Sight') && !move.named('Doom Desire')) {
            ctx.state.modifierId = "lifeOrb";
            ctx.state.profileModifierApplied = false;
            baseDamage = (0, romhack_helpers_1.applyValueHooks)(profile, "baseDamage", ctx, baseDamage);
            ctx.state.modifierId = undefined;
            if (!ctx.state.profileModifierApplied) {
                baseDamage = Math.floor(baseDamage * 1.3);
            }
            ctx.state.profileModifierApplied = undefined;
            desc.attackerItem = attacker.item;
        }
        if (move.named('Pursuit') && field.defenderSide.isSwitching) {
            baseDamage = Math.floor(baseDamage * 2);
            desc.isSwitching = 'out';
        }
        var stabMod = 1;
        if (move.hasType.apply(move, __spreadArray([], __read(attacker.types), false)) &&
            (scoresFutureSightAsSwitchMove || (!move.named('Future Sight') && !move.named('Doom Desire')))) {
            if (attacker.hasAbility('Adaptability')) {
                stabMod = 2;
                desc.attackerAbility = attacker.ability;
            }
            else {
                stabMod = 1.5;
            }
        }
        var filterMod = 1;
        if (defender.hasAbility('Filter', 'Solid Rock') && typeEffectiveness > 1) {
            filterMod = 0.75;
            desc.defenderAbility = defender.ability;
        }
        var ebeltMod = 1;
        if (attacker.hasItem('Expert Belt') && typeEffectiveness > 1) {
            ctx.state.modifierId = "expertBelt";
            var expertBeltMods = (0, romhack_helpers_1.applyValueHooks)(profile, "finalMods", ctx, []);
            ctx.state.modifierId = undefined;
            ebeltMod = expertBeltMods[0] || 1.2;
            desc.attackerItem = attacker.item;
        }
        var tintedMod = 1;
        if (attacker.hasAbility('Tinted Lens') && typeEffectiveness < 1) {
            tintedMod = 2;
            desc.attackerAbility = attacker.ability;
        }
        var berryMod = 1;
        if (move.hasType((0, items_1.getBerryResistType)(defender.item)) &&
            (typeEffectiveness > 1 || move.hasType('Normal'))) {
            berryMod = 0.5;
            desc.defenderItem = defender.item;
        }
        desc.g4Phase2BaseDamage = baseDamage;
        desc.g4Phase2StabMod = stabMod;
        desc.g4Phase2Type1Effectiveness = type1Effectiveness;
        desc.g4Phase2Type2Effectiveness = type2Effectiveness;
        desc.g4Phase2FilterMod = filterMod;
        desc.g4Phase2ExpertBeltMod = ebeltMod;
        desc.g4Phase2TintedMod = tintedMod;
        desc.g4Phase2BerryMod = berryMod;
        var damage = [];
        for (var i = 0; i < 16; i++) {
            damage[i] = Math.floor((baseDamage * (85 + i)) / 100);
            damage[i] = Math.floor(damage[i] * stabMod);
            damage[i] = Math.floor(damage[i] * type1Effectiveness);
            damage[i] = Math.floor(damage[i] * type2Effectiveness);
            damage[i] = Math.floor(damage[i] * filterMod);
            damage[i] = Math.floor(damage[i] * ebeltMod);
            damage[i] = Math.floor(damage[i] * tintedMod);
            damage[i] = Math.floor(damage[i] * berryMod);
            damage[i] = Math.max(1, damage[i]);
        }
        return { damage: damage, attackStat: attackStat };
    };
    var hitResult = computeDamageArray(0);
    if (!hitResult) {
        return result;
    }
    var damage = hitResult.damage;
    var attackStat = hitResult.attackStat;
    result.damage = damage;
    desc.attackBoost =
        move.named('Foul Play') ? defender.boosts[attackStat] : attacker.boosts[attackStat];
    if (move.timesUsed > 1 || move.hits > 1) {
        var origDefBoost = desc.defenseBoost;
        var origAtkBoost = desc.attackBoost;
        var numAttacks = 1;
        if (move.dropsStats && move.timesUsed > 1) {
            desc.moveTurns = "over ".concat(move.timesUsed, " turns");
            numAttacks = move.timesUsed;
        }
        else {
            numAttacks = move.hits;
        }
        var usedItems = [false, false];
        var damageMatrix = [damage];
        for (var times = 1; times < numAttacks; times++) {
            usedItems = (0, util_1.checkMultihitBoost)(gen, attacker, defender, move, field, desc, usedItems[0], usedItems[1]);
            var nextHit = computeDamageArray(times);
            if (!nextHit) {
                break;
            }
            damageMatrix[times] = nextHit.damage;
        }
        result.damage = damageMatrix;
        desc.defenseBoost = origDefBoost;
        desc.attackBoost = origAtkBoost;
    }
    return result;
}
exports.calculateDPP = calculateDPP;
function getSimpleModifiedStat(stat, mod) {
    var simpleMod = Math.min(6, Math.max(-6, mod * 2));
    return simpleMod > 0
        ? Math.floor((stat * (2 + simpleMod)) / 2)
        : simpleMod < 0 ? Math.floor((stat * 2) / (2 - simpleMod)) : stat;
}
//# sourceMappingURL=gen4.js.map
