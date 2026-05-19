"use strict";
exports.__esModule = true;

var util_1 = require("../util");
var items_1 = require("../items");
var result_1 = require("../result");
var util_2 = require("./util");
var romhacks_1 = require("./romhacks");
var romhack_helpers_1 = require("./romhacks/helpers");



function calculateBWXY(gen, attacker, defender, move, field) {
    var _a;
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
        util: util_2,
        state: {}
    };
    (0, util_2.checkAirLock)(attacker, field);
    (0, util_2.checkAirLock)(defender, field);
    (0, util_2.checkForecast)(attacker, field.weather);
    (0, util_2.checkForecast)(defender, field.weather);
    (0, util_2.checkItem)(attacker, field.isMagicRoom);
    (0, util_2.checkItem)(defender, field.isMagicRoom);
    (0, util_2.checkRawStatChanges)(attacker, field.attackerSide.isPowerTrick, field.isWonderRoom);
    (0, util_2.checkRawStatChanges)(defender, field.defenderSide.isPowerTrick, field.isWonderRoom);
    (0, util_2.checkSeedBoost)(attacker, field);
    (0, util_2.checkSeedBoost)(defender, field);
    (0, romhack_helpers_1.runHooks)(profile, "beforeStats", ctx);
    (0, util_2.computeFinalStats)(gen, attacker, defender, field, 'def', 'spd', 'spe');
    (0, util_2.checkIntimidate)(gen, attacker, defender);
    (0, util_2.checkIntimidate)(gen, defender, attacker);
    (0, util_2.checkDownload)(attacker, defender, field.isWonderRoom);
    (0, util_2.checkDownload)(defender, attacker, field.isWonderRoom);
    (0, util_2.computeFinalStats)(gen, attacker, defender, field, 'atk', 'spa');
    (0, util_2.checkInfiltrator)(attacker, field.defenderSide);
    (0, util_2.checkInfiltrator)(defender, field.attackerSide);
    var desc = {
        attackerName: attacker.name,
        moveName: move.name,
        defenderName: defender.name,
        isWonderRoom: field.isWonderRoom
    };
    ctx.desc = desc;

    var isAttackerTera = attacker.item.startsWith("Tera ")
    var isDefenderTera = defender.item.startsWith("Tera ")

    var oldTypes = ["",""]

    if (pokedex[attacker.name]) {
        oldTypes = pokedex[attacker.name].types   
    }

    
    var teraType = attacker.moves[0].type
    var isSameTypeTera = isAttackerTera && teraType == move.type && oldTypes.includes(teraType)

    if (isAttackerTera) {
        attacker.types = [attacker.moves[0].type, ""]
    }
    if (isDefenderTera) {
        defender.types = [defender.moves[0].type, ""]
    }

    



    
    var result = new result_1.Result(gen, attacker, defender, move, field, 0, desc);
    if (move.category === 'Status' && !move.named('Nature Power')) {
        return result;
    }

    if (field.defenderSide.isProtected && !move.breaksProtect) {
        desc.isProtected = true;
        return result;
    }
    if (attacker.hasAbility('Mold Breaker', 'Teravolt', 'Turboblaze') || attacker.hasItem("Ability Drill", "Tera Drill")) {
        defender.ability = '';
        desc.attackerAbility = attacker.ability;
    }
    var isCritical = move.isCrit && !defender.hasAbility('Battle Armor', 'Shell Armor') && move.timesUsed === 1;
    if (move.named('Weather Ball', "Weather Crash")) {
        move.type =
            field.hasWeather('Sun', 'Harsh Sunshine') ? 'Fire'
                : field.hasWeather('Rain', 'Heavy Rain') ? 'Water'
                    : field.hasWeather('Sand') ? 'Rock'
                        : field.hasWeather('Hail') ? 'Ice'
                            : 'Normal';

        desc.weather = field.weather;
        desc.moveType = move.type;
    }
    else if (move.named('Judgment') && attacker.item && attacker.item.includes('Plate')) {
        move.type = (0, items_1.getItemBoostType)(attacker.item);
    }
    else if (move.named('Techno Blast') && attacker.item && attacker.item.includes('Drive')) {
        move.type = (0, items_1.getTechnoBlast)(attacker.item);
    }
    else if (move.named('Natural Gift') && attacker.item && attacker.item.includes('Berry')) {
        var gift = (0, items_1.getNaturalGift)(gen, attacker.item);
        move.type = gift.t;
        move.bp = gift.p;
        desc.attackerItem = attacker.item;
        desc.moveBP = move.bp;
        desc.moveType = move.type;
    }
    else if (move.named('Nature Power')) {
        if (gen.num === 5) {
            move.type = 'Ground';
        }
        else {
            move.type =
                field.hasTerrain('Electric') ? 'Electric'
                    : field.hasTerrain('Grassy') ? 'Grass'
                        : field.hasTerrain('Misty') ? 'Fairy'
                            : 'Normal';
        }
    }
    else if (move.named('Brick Break')) {
        field.defenderSide.isReflect = false;
        field.defenderSide.isLightScreen = false;
    }
    (0, romhack_helpers_1.runHooks)(profile, "afterMoveType", ctx);
    var isAerilate = false;
    var isPixilate = false;
    var isRefrigerate = false;
    var isNormalize = false;
    var isMoisturize = false;
    var isGalvanize = false;
    var hasAteTypeChange = false;
    var noTypeChange = move.named('Judgment', 'Nature Power', 'Techo Blast', 'Natural Gift', 'Weather Ball', 'Weather Crash') || isAttackerTera;
    if (!move.isZ && !noTypeChange) {
        var normal = move.hasType('Normal');
        if ((isAerilate = attacker.hasAbility('Aerilate') && normal)) {
            move.type = 'Flying';
        }
        else if ((isPixilate = attacker.hasAbility('Pixilate') && normal)) {
            move.type = 'Fairy';
        }
        else if ((isGalvanize = attacker.hasAbility('Galvanize') && normal)) {
            move.type = 'Electric';
        }
        else if ((isMoisturize = attacker.hasAbility('Moisturize') && normal)) {
            move.type = 'Water';
        }
        else if ((isRefrigerate = attacker.hasAbility('Refrigerate') && normal)) {
            move.type = 'Ice';
        }
        else if ((isNormalize = attacker.hasAbility('Normalize'))) {
            move.type = 'Normal';
        }
        if (isPixilate || isRefrigerate || isAerilate || isNormalize || isGalvanize || isMoisturize) {
            hasAteTypeChange = true;
            desc.attackerAbility = attacker.ability;
        }
    }
    if (attacker.hasAbility('Gale Wings') && move.hasType('Flying')) {
        move.priority = 1;
        desc.attackerAbility = attacker.ability;
    }
    var isGhostRevealed = attacker.hasAbility('Scrappy') || field.defenderSide.isForesight;
    var isCascadeProfile = profile.id === "cascade-white";
    var isDarkRevealed = attacker.hasAbility('Inner Focus') && isCascadeProfile
    var isForceNeutral = (move.named("Chip Away") || attacker.hasAbility("Normalize")) && isCascadeProfile
    gen.types.gen = settings.typeChart
    ctx.state.effectivenessType = defender.types[0];
    var type1Effectiveness = (0, util_2.getMoveEffectiveness)(gen, move, defender.types[0], isGhostRevealed, field.isGravity, false, false, false, isDarkRevealed, profile, ctx);
    var type2Effectiveness = defender.types[1]
        ? (ctx.state.effectivenessType = defender.types[1],
            (0, util_2.getMoveEffectiveness)(gen, move, defender.types[1], isGhostRevealed, field.isGravity, false, false, false, isDarkRevealed, profile, ctx))
        : 1;
    var typeEffectiveness = type1Effectiveness * type2Effectiveness;

    if (isForceNeutral) {
        typeEffectiveness = 1
    }


    var resistedKnockOffDamage = !defender.item ||
        (defender.named('Giratina-Origin') && defender.hasItem('Griseous Orb')) ||
        (defender.name.includes('Arceus') && defender.item.includes('Plate')) ||
        (defender.name.includes('Genesect') && defender.item.includes('Drive')) ||
        (defender.named('Groudon', 'Groudon-Primal') && defender.hasItem('Red Orb')) ||
        (defender.named('Kyogre', 'Kyogre-Primal') && defender.hasItem('Blue Orb'));
    if (!resistedKnockOffDamage && defender.item) {
        var item = gen.items.get((0, util_1.toID)(defender.item));
        resistedKnockOffDamage = false;
    }
    if (typeEffectiveness === 0 && move.named('Thousand Arrows')) {
        typeEffectiveness = 1;
    }
    else if (typeEffectiveness === 0 && move.hasType('Ground') &&
        defender.hasItem('Iron Ball') && !defender.hasAbility('Klutz')) {
        typeEffectiveness = 1;
    }
    else if (typeEffectiveness === 0 && defender.hasItem('Ring Target')) {
        var effectiveness = gen.types.get((0, util_1.toID)(move.type)).effectiveness;
        if (effectiveness[defender.types[0]] === 0) {
            typeEffectiveness = type2Effectiveness;
        }
        else if (defender.types[1] && effectiveness[defender.types[1]] === 0) {
            typeEffectiveness = type1Effectiveness;
        }
    }
    else if (typeEffectiveness === 0 &&
        (defender.hasItem('Ring Target') ||
            (move.hasType('Poison') && attacker.hasAbility('Corrosion')) ||
            (move.flags.bone && attacker.hasAbility('Bone Zone')) ||
            move.named('Draco Barrage'))) {
        var effectiveness = gen.types.get((0, util_1.toID)(move.type)).effectiveness;
        if (effectiveness[defender.types[0]] === 0) {
            typeEffectiveness = type2Effectiveness * 2;
        }
        else if (defender.types[1] && effectiveness[defender.types[1]] === 0) {
            typeEffectiveness = type1Effectiveness * 2;
        }
    }

    if (typeEffectiveness === 0) {
        return result;
    }

    if ((move.named('Sky Drop') &&
        (defender.hasType('Flying') || defender.weightkg >= 200 || field.isGravity)) ||
        (move.named('Synchronoise') && !defender.hasType(attacker.types[0]) &&
            (!attacker.types[1] || !defender.hasType(attacker.types[1]))) ||
        (move.named('Dream Eater') && !defender.hasStatus('slp') && !isCascadeProfile)) {
        return result;
    }
    if ((field.hasWeather('Harsh Sunshine') && move.hasType('Water')) ||
        (field.hasWeather('Heavy Rain') && move.hasType('Fire'))) {
        desc.weather = field.weather;
        return result;
    }
    if (field.hasWeather('Strong Winds') && defender.hasType('Flying') &&
        gen.types.get((0, util_1.toID)(move.type)).effectiveness['Flying'] > 1) {
        typeEffectiveness /= 2;
        desc.weather = field.weather;
    }
    if ((defender.hasAbility('Wonder Guard') && typeEffectiveness <= 1) ||
        (move.hasType('Grass') && defender.hasAbility('Sap Sipper')) ||
        (move.hasType('Fire') && defender.hasAbility('Flash Fire',  "Well-Baked Body")) ||
        (move.flags.wind && defender.hasAbility("Wind Rider")) ||
        (move.hasType('Water') && defender.hasAbility('Dry Skin', 'Storm Drain', 'Water Absorb')) ||
        (move.hasType('Electric') &&
            defender.hasAbility('Lightning Rod', 'Motor Drive', 'Volt Absorb', "Thunder Armor")) ||
        (move.hasType('Ground') &&
            !field.isGravity && !move.named('Thousand Arrows') &&
            !defender.hasItem('Iron Ball') && defender.hasAbility('Levitate')) || (move.flags.bullet && defender.hasAbility('Bulletproof')) || (move.flags.sound && !move.named('Clangorous Soul') && defender.hasAbility('Soundproof', "Amplifier"))) {
        desc.defenderAbility = defender.ability;
        return result;
    }
    if (move.hasType('Ground') && !move.named('Thousand Arrows') &&
        !field.isGravity && defender.hasItem('Air Balloon')) {
        desc.defenderItem = defender.item;
        return result;
    }
    if (move.priority > 0 && field.hasTerrain('Psychic') && (0, util_2.isGrounded)(defender, field)) {
        desc.terrain = field.terrain;
        return result;
    }
    desc.HPEVs = "".concat(defender.evs.hp, " HP");
    var fixedDamage = (0, util_2.handleFixedDamageMoves)(attacker, move);
    if (fixedDamage) {
        if (attacker.hasAbility('Parental Bond')) {
            result.damage = [fixedDamage, fixedDamage];
            desc.attackerAbility = attacker.ability;
        }
        else {
            result.damage = fixedDamage;
        }
        return result;
    }
    if (move.named('Final Gambit')) {
        result.damage = attacker.curHP();
        return result;
    }
    if (move.hits > 1) {
        desc.hits = move.hits;
    }
    var isSpread = field.gameType !== 'Singles' &&
        ['allAdjacent', 'allAdjacentFoes'].includes(move.target);
    if (isCascadeProfile && attacker.hasAbility("Ballistics") && move.flags.bullet && field.gameType !== 'Singles') {
        isSpread = true;
    }
    var computeDamageArray = function (hitCount) {
        if (hitCount === void 0) { hitCount = 0; }
        var turnOrder = attacker.stats.spe > defender.stats.spe ? 'first' : 'last';
        var basePower;
        var hitIndex = hitCount + 1;
        switch (move.name) {
            case 'Payback':
                basePower = move.bp * (turnOrder === 'last' ? 2 : 1);
                desc.moveBP = basePower;
                break;
            case 'Pursuit':
                var switching = field.defenderSide.isSwitching;
                basePower = move.bp * (switching ? 2 : 1);
                if (switching)
                    desc.isSwitching = 'out';
                desc.moveBP = basePower;
                break;
            case 'Electro Ball':
                if (defender.stats.spe === 0)
                    defender.stats.spe = 1;
                var r = Math.floor(attacker.stats.spe / defender.stats.spe);
                basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : r >= 1 ? 60 : 40;
                desc.moveBP = basePower;
                break;
            case 'Gyro Ball':
                if (attacker.stats.spe === 0)
                    attacker.stats.spe = 1;
                basePower = Math.min(150, Math.floor((25 * defender.stats.spe) / attacker.stats.spe) + 1);
                desc.moveBP = basePower;
                break;
            case 'Punishment':
                basePower = Math.min(200, 60 + 20 * (0, util_2.countBoosts)(gen, defender.boosts));
                desc.moveBP = basePower;
                break;
            case 'Low Kick':
            case 'Grass Knot':
                var w = defender.weightkg * (0, util_2.getWeightFactor)(defender);
                basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
                desc.moveBP = basePower;
                break;
            case "Beat Up":
            case "Infernal Parade":
            case "Barb Barrage":
            case "Bitter Malice":
            case 'Hex':
                basePower = move.bp * (defender.status ? 2 : 1);
                desc.moveBP = basePower;
                break;
            case 'Heavy Slam':
            case 'Heat Crash':
                var wr = (attacker.weightkg * (0, util_2.getWeightFactor)(attacker)) /
                    (defender.weightkg * (0, util_2.getWeightFactor)(defender));
                basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
                desc.moveBP = basePower;
                break;
            case 'Stored Power':
            case 'Power Trip':
                var boostMult = 20;
                basePower = move.bp + boostMult * (0, util_2.countBoosts)(gen, attacker.boosts);
                desc.moveBP = basePower;
                break;
            case 'Acrobatics':
                basePower = move.bp * (attacker.hasItem('Flying Gem') || !attacker.item ? 2 : 1);
                desc.moveBP = basePower;
                break;
            case 'Assurance':
                basePower = move.bp * (defender.hasAbility('Parental Bond (Child)') ? 2 : 1);
                break;
            case 'Wake-Up Slap':
                basePower = move.bp * (defender.hasStatus('slp') ? 2 : 1);
                desc.moveBP = basePower;
                break;
            case 'Dream Eater':
                basePower = move.bp * (defender.hasStatus('slp') ? 2 : 1);
                desc.moveBP = basePower;
                break;
            case 'Smelling Salts':
                basePower = move.bp * (defender.hasStatus('par') ? 2 : 1);
                desc.moveBP = basePower;
                break;
            case 'Weather Crash':
            case 'Weather Ball':
                basePower = move.bp * (field.weather && !field.hasWeather('Strong Winds') ? 2 : 1);
                desc.moveBP = basePower;
                break;
            case 'Fling':
                basePower = (0, items_1.getFlingPower)(attacker.item);
                desc.moveBP = basePower;
                desc.attackerItem = attacker.item;
                break;
            case 'Eruption':
            case 'Water Spout':
                basePower = Math.max(1, Math.floor((150 * attacker.curHP()) / attacker.maxHP()));
                desc.moveBP = basePower;
                break;
            case 'Flail':
            case 'Reversal':
                var p = Math.floor((48 * attacker.curHP()) / attacker.maxHP());
                basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
                desc.moveBP = basePower;
                break;
            case 'Nature Power':
                if (gen.num === 5) {
                    move.category = 'Physical';
                    move.target = 'allAdjacent';
                    basePower = 100;
                    desc.moveName = 'Earthquake';
                }
                else {
                    move.category = 'Special';
                    move.secondaries = true;
                    switch (field.terrain) {
                        case 'Electric':
                            basePower = 90;
                            desc.moveName = 'Thunderbolt';
                            break;
                        case 'Grassy':
                            basePower = 90;
                            desc.moveName = 'Energy Ball';
                            break;
                        case 'Misty':
                            basePower = 95;
                            desc.moveName = 'Moonblast';
                            break;
                        default:
                            basePower = 80;
                            desc.moveName = 'Tri Attack';
                    }
                }
                break;
            // Triple Kick is hardcoded @ 10 bp * hit count
            case 'Triple Kick':
                basePower = hitIndex * 10;
                desc.moveBP = move.hits === 2 ? 30 : move.hits === 3 ? 60 : 10;
                break;
            case 'Crush Grip':
            case 'Wring Out':
                basePower = 100 * Math.floor((defender.curHP() * 4096) / defender.maxHP());
                basePower = Math.floor(Math.floor((120 * basePower + 2048 - 1) / 4096) / 100) || 1;
                desc.moveBP = basePower;
                break;
            default:
                basePower = move.bp;
        }
        ctx.state.hitCount = hitCount;
        ctx.state.turnOrder = turnOrder;
        basePower = (0, romhack_helpers_1.applyValueHooks)(profile, "moveBasePower", ctx, basePower);
        if (basePower === 0) {
            return null;
        }
        var hitResistedKnockOffDamage = resistedKnockOffDamage;
        if (!hitResistedKnockOffDamage && hitCount > 0 && !defender.hasAbility('Sticky Hold')) {
            hitResistedKnockOffDamage = true;
        }
        var bpMods = [];
        var applyBPProfile = function (modifierId) {
            ctx.state.modifierId = modifierId;
            ctx.state.skipDefaultMod = false;
            ctx.state.basePower = basePower;
            ctx.state.hitCount = hitCount;
            ctx.state.hitResistedKnockOffDamage = hitResistedKnockOffDamage;
            ctx.state.hasAteTypeChange = hasAteTypeChange;
            ctx.state.isMoisturize = isMoisturize;
            ctx.state.typeEffectiveness = typeEffectiveness;
            ctx.state.hitsPhysical = hitsPhysical;
            bpMods = (0, romhack_helpers_1.applyValueHooks)(profile, "basePowerMods", ctx, bpMods);
            ctx.state.modifierId = undefined;
        };
        if ((attacker.hasAbility('Technician') && basePower <= 60 && !(move.named('Pursuit') && field.defenderSide.isSwitching)) ||
            (attacker.hasAbility('Flare Boost') &&
                attacker.hasStatus('brn') && move.category === 'Special') ||
            (attacker.hasAbility('Toxic Boost') &&
                attacker.hasStatus('psn', 'tox') && move.category === 'Physical')) {
            bpMods.push(6144);
            desc.attackerAbility = attacker.ability;
        }
        else if (attacker.hasAbility('Analytic', "Patient") && turnOrder !== 'first') {
            bpMods.push(5325);
            desc.attackerAbility = attacker.ability;
        }
        else if (attacker.hasAbility('Sand Force') &&
            field.hasWeather('Sand') &&
            move.hasType('Rock', 'Ground', 'Steel')) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("sandForceWeather");
            if (bpMods.length === beforeProfileMods) {
                bpMods.push(5325);
            }
            desc.attackerAbility = attacker.ability;
            desc.weather = field.weather;
        }
        else if (attacker.hasAbility('Sand Force') &&
            !field.hasWeather('Sand') &&
            move.hasType('Rock', 'Ground', 'Steel')) {
            applyBPProfile("sandForceNoWeather");
        }
        else if ((attacker.hasAbility('Reckless') && (move.recoil || move.hasCrashDamage))) {
            bpMods.push(4915);
            desc.attackerAbility = attacker.ability;
        }
        else if ((attacker.hasAbility('Iron Fist') && move.flags.punch)) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("ironFist");
            if (bpMods.length === beforeProfileMods) {
                bpMods.push(4915);
            }
            desc.attackerAbility = attacker.ability;
        }
        else if ((attacker.hasAbility('Amplifier') && move.flags.sound)) {
            bpMods.push(4915);
            desc.attackerAbility = attacker.ability;
        }
        if (defender.hasAbility('Heatproof') && move.hasType('Fire')) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("heatproof");
            if (bpMods.length === beforeProfileMods) {
                bpMods.push(2048);
            }
            desc.defenderAbility = defender.ability;
        }
        if (defender.hasAbility('Dry Skin') && move.hasType('Fire')) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("drySkinFire");
            if (bpMods.length === beforeProfileMods) {
                bpMods.push(5120);
            }
            desc.defenderAbility = defender.ability;
        }
        if (attacker.hasAbility('Sheer Force') && move.secondaries) {
            bpMods.push(5325);
            desc.attackerAbility = attacker.ability;
        }
        if (attacker.hasAbility('Rivalry') && ![attacker.gender, defender.gender].includes('N')) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("rivalryBase");
            if (attacker.gender === defender.gender) {
                if (bpMods.length === beforeProfileMods && !ctx.state.skipDefaultMod)
                    bpMods.push(5120);
                desc.rivalry = 'buffed';
            }
            else {
                if (bpMods.length === beforeProfileMods && !ctx.state.skipDefaultMod)
                    bpMods.push(3072);
                desc.rivalry = 'nerfed';
            }
            desc.attackerAbility = attacker.ability;
        }
        if (attacker.item && (0, items_1.getItemBoostType)(attacker.item) === move.type) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("plateBoost");
            if (bpMods.length === beforeProfileMods) {
                bpMods.push(4915);
            }
            desc.attackerItem = attacker.item;
        }
        else if ((attacker.hasItem('Muscle Band') && move.category === 'Physical') ||
            (attacker.hasItem('Wise Glasses') && move.category === 'Special')) {
            bpMods.push(4505);
            desc.attackerItem = attacker.item;
        }
        else if ((attacker.hasItem('Adamant Orb') &&
            attacker.named('Dialga') &&
            move.hasType('Steel', 'Dragon')) ||
            (attacker.hasItem('Lustrous Orb') &&
                attacker.named('Palkia') &&
                move.hasType('Water', 'Dragon')) ||
            (attacker.hasItem('Griseous Orb') &&
                attacker.named('Giratina-Origin') &&
                move.hasType('Ghost', 'Dragon'))) {
            bpMods.push(4915);
            desc.attackerItem = attacker.item;
        }
        else if (attacker.hasItem("".concat(move.type, " Gem"))) {
            bpMods.push(gen.num > 5 ? 5325 : 6144);
            desc.attackerItem = attacker.item;
        }
        if (attacker.hasItem("Tera Gem") && move.type == attacker.moves[0].type) {
            bpMods.push(gen.num > 5 ? 5325 : 6144);
            desc.attackerItem = attacker.item;
        }
        if ((move.named('Facade') && attacker.hasStatus('brn', 'par', 'psn', 'tox')) ||
            (move.named('Brine') && defender.curHP() <= defender.maxHP() / 2) ||
            (move.named('Venoshock') && defender.hasStatus('psn', 'tox'))) {
            bpMods.push(8192);
            desc.moveBP = basePower * 2;
        }
        else if (move.named('Knock Off') && !hitResistedKnockOffDamage) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("knockOff");
            if (gen.num > 5 && bpMods.length === beforeProfileMods) {
                bpMods.push(6144);
                desc.moveBP = basePower * 1.5;
            }
        }
        else if (move.named('Solar Beam') && field.hasWeather('Rain', 'Heavy Rain', 'Sand', 'Hail')) {
            bpMods.push(2048);
            desc.moveBP = basePower / 2;
            desc.weather = field.weather;
        }
        if (field.attackerSide.isHelpingHand) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("helpingHand");
            if (bpMods.length === beforeProfileMods) {
                bpMods.push(6144);
            }
            desc.isHelpingHand = true;
        }
        if (field.attackerSide.is10Buff) {
            bpMods.push(4505);
        }
        if (field.attackerSide.is15Buff) {
            bpMods.push(4710);
        }
        if (field.attackerSide.is20Buff) {
            bpMods.push(4915);
        }
        if (field.attackerSide.is25Buff) {
            bpMods.push(5120);
        }
        if (field.attackerSide.is30Buff) {
            bpMods.push(5324);
        }
        if (field.attackerSide.is50Buff) {
            bpMods.push(6144);
        }
        if (isAerilate || isPixilate || isRefrigerate) {
            var beforeProfileMods = bpMods.length;
            applyBPProfile("ateBoost");
            if (bpMods.length === beforeProfileMods && !ctx.state.skipDefaultMod) {
                bpMods.push(5325);
                desc.attackerAbility = attacker.ability;
            }
        }
        else if ((attacker.hasAbility('Mega Launcher') && move.flags.pulse) ||
            (attacker.hasAbility('Strong Jaw') && move.flags.bite)) {
            bpMods.push(6144);
            desc.attackerAbility = attacker.ability;
        }
        else if (attacker.hasAbility('Tough Claws') && move.flags.contact) {
            bpMods.push(5325);
            desc.attackerAbility = attacker.ability;
        }
        var aura = "".concat(move.type, " Aura");
        var isAttackerAura = attacker.hasAbility(aura);
        var isDefenderAura = defender.hasAbility(aura);
        var isUserAuraBreak = attacker.hasAbility('Aura Break') || defender.hasAbility('Aura Break');
        var isFieldAuraBreak = field.isAuraBreak;
        var isFieldFairyAura = field.isFairyAura && move.type === 'Fairy';
        var isFieldDarkAura = field.isDarkAura && move.type === 'Dark';
        var auraActive = isAttackerAura || isDefenderAura || isFieldFairyAura || isFieldDarkAura;
        var auraBreak = isFieldAuraBreak || isUserAuraBreak;
        if (auraActive) {
            if (auraBreak) {
                bpMods.push(3072);
                desc.attackerAbility = attacker.ability;
                desc.defenderAbility = defender.ability;
            }
            else {
                bpMods.push(5448);
                if (isAttackerAura)
                    desc.attackerAbility = attacker.ability;
                if (isDefenderAura)
                    desc.defenderAbility = defender.ability;
            }
        }
        if ((0, util_2.isGrounded)(attacker, field)) {
            if ((field.hasTerrain('Electric') && move.hasType('Electric')) ||
                (field.hasTerrain('Grassy') && move.hasType('Grass'))) {
                bpMods.push(6144);
                desc.terrain = field.terrain;
            }
        }
        if ((0, util_2.isGrounded)(defender, field)) {
            if ((field.hasTerrain('Misty') && move.hasType('Dragon')) ||
                (field.hasTerrain('Grassy') && move.named('Bulldoze', 'Earthquake'))) {
                bpMods.push(2048);
                desc.terrain = field.terrain;
            }
        }
        applyBPProfile();
        basePower = (0, util_2.OF16)(Math.max(1, (0, util_2.pokeRound)((basePower * (0, util_2.chainMods)(bpMods, 41, 2097152)) / 4096)));
        var attack;
        var attackSource = move.named('Foul Play') ? defender : attacker;
        var attackStat = move.named('Body Press') ? 'def' : move.category === 'Special' ? 'spa' : 'atk';
        desc.attackEVs =
            move.named('Foul Play')
                ? (0, util_2.getStatDescriptionText)(gen, attackSource, attackStat, field.defenderSide.isPowerTrick, field.isWonderRoom)
                : (0, util_2.getStatDescriptionText)(gen, attackSource, attackStat, field.attackerSide.isPowerTrick, field.isWonderRoom);
        if (field.attackerSide.isPowerTrick && move.category === 'Physical' && !move.named('Foul Play')) {
            desc.isPowerTrickAttacker = true;
        }
        if (attackSource.boosts[attackStat] === 0 ||
            (isCritical && attackSource.boosts[attackStat] < 0)) {
            attack = attackSource.rawStats[attackStat];
        }
        else if (defender.hasAbility('Unaware')) {
            attack = attackSource.rawStats[attackStat];
            desc.defenderAbility = defender.ability;
        }
        else {
            attack = attackSource.stats[attackStat];
            desc.attackBoost = attackSource.boosts[attackStat];
        }
        if (attacker.hasAbility('Hustle') && move.category === 'Physical') {
            attack = (0, util_2.pokeRound)((attack * 3) / 2);
            desc.attackerAbility = attacker.ability;
        }
        var atMods = [];
        if (defender.hasAbility('Thick Fat') && move.hasType('Fire', 'Ice')) {
            atMods.push(2048);
            desc.defenderAbility = defender.ability;
        }
        if ((attacker.hasAbility('Guts') && attacker.status && move.category === 'Physical') ||
            (attacker.curHP() <= attacker.maxHP() / 3 &&
                ((attacker.hasAbility('Overgrow') && move.hasType('Grass')) ||
                    (attacker.hasAbility('Blaze') && move.hasType('Fire')) ||
                    (attacker.hasAbility('Torrent') && move.hasType('Water')) ||
                    (attacker.hasAbility('Swarm') && move.hasType('Bug')))) ||
            (move.category === 'Special' && attacker.abilityOn && attacker.hasAbility('Plus', 'Minus'))) {
            atMods.push(6144);
            desc.attackerAbility = attacker.ability;
        }
        else if (attacker.hasAbility('Flash Fire') && attacker.abilityOn && move.hasType('Fire')) {
            atMods.push(6144);
            desc.attackerAbility = 'Flash Fire';
        }
        else if ((attacker.hasAbility('Solar Power') &&
            field.hasWeather('Sun', 'Harsh Sunshine') &&
            move.category === 'Special') ||
            (attacker.named('Cherrim') &&
                attacker.hasAbility('Flower Gift') &&
                field.hasWeather('Sun', 'Harsh Sunshine') &&
                move.category === 'Physical')) {
            atMods.push(6144);
            desc.attackerAbility = attacker.ability;
            desc.weather = field.weather;
        }
        else if (field.attackerSide.isFlowerGift &&
            field.hasWeather('Sun', 'Harsh Sunshine') &&
            move.category === 'Physical') {
            atMods.push(6144);
            desc.weather = field.weather;
            desc.isFlowerGiftAttacker = true;
        }
        else if ((attacker.hasAbility('Defeatist') && attacker.curHP() <= attacker.maxHP() / 2) ||
            (attacker.hasAbility('Slow Start') && attacker.abilityOn && move.category === 'Physical')) {
            atMods.push(2048);
            desc.attackerAbility = attacker.ability;
        }
        else if (attacker.hasAbility('Huge Power', 'Pure Power') && move.category === 'Physical') {
            atMods.push(8192);
            desc.attackerAbility = attacker.ability;
        }
        if ((attacker.hasItem('Thick Club') &&
            attacker.named('Cubone', 'Marowak', 'Marowak-Alola') &&
            move.category === 'Physical') ||
            (attacker.hasItem('Deep Sea Tooth') &&
                attacker.named('Clamperl') &&
                move.category === 'Special') ||
            (attacker.hasItem('Light Ball') && attacker.name.startsWith('Pikachu') && !move.isZ)) {
            atMods.push(8192);
            desc.attackerItem = attacker.item;
        }
        else if ((attacker.hasItem('Soul Dew') &&
            attacker.named('Latios', 'Latias', 'Latios-Mega', 'Latias-Mega') &&
            move.category === 'Special') ||
            (attacker.hasItem('Choice Band', 'Tera C-Band') && move.category === 'Physical') ||
            (attacker.hasItem('Choice Specs', 'Tera Specs') && move.category === 'Special')) {
            atMods.push(6144);
            desc.attackerItem = attacker.item;
        }
        else if (attacker.hasItem('Mascot Badge')) {
            atMods.push(8192);
            desc.attackerItem = attacker.item;
        }
        atMods = (0, romhack_helpers_1.applyValueHooks)(profile, "attackMods", ctx, atMods);
        attack = (0, util_2.OF16)(Math.max(1, (0, util_2.pokeRound)((attack * (0, util_2.chainMods)(atMods, 410, 131072)) / 4096)));
        var defense;
        var defenseStat = move.overrideDefensiveStat || move.category === 'Physical' ? 'def' : 'spd';
        var hitsPhysical = defenseStat === 'def';
        desc.defenseEVs = (0, util_2.getStatDescriptionText)(gen, defender, defenseStat, field.defenderSide.isPowerTrick, field.isWonderRoom);
        if (field.defenderSide.isPowerTrick && (field.isWonderRoom !== hitsPhysical)) {
            desc.isPowerTrickDefender = true;
        }
        var boosts = defender.boosts[defenseStat];
        if (boosts === 0 ||
            (isCritical && boosts > 0) ||
            move.ignoreDefensive) {
            defense = defender.rawStats[defenseStat];
        }
        else if (attacker.hasAbility('Unaware')) {
            defense = defender.rawStats[defenseStat];
            desc.attackerAbility = attacker.ability;
        }
        else {
            defense = defender.stats[defenseStat];
            desc.defenseBoost = boosts;
        }
        if (field.hasWeather('Sand') && defender.hasType('Rock') && !hitsPhysical) {
            defense = (0, util_2.pokeRound)((defense * 3) / 2);
            desc.weather = field.weather;
        }
        var dfMods = [];
        ctx.state.defense = defense;
        ctx.state.hitsPhysical = hitsPhysical;
        dfMods = (0, romhack_helpers_1.applyValueHooks)(profile, "defenseMods", ctx, dfMods);
        defense = ctx.state.defense;
        if (defender.hasAbility('Marvel Scale') && defender.status && hitsPhysical) {
            dfMods.push(6144);
            desc.defenderAbility = defender.ability;
        }
        else if (defender.named('Cherrim') &&
            defender.hasAbility('Flower Gift') &&
            field.hasWeather('Sun', 'Harsh Sunshine') &&
            !hitsPhysical) {
            dfMods.push(6144);
            desc.defenderAbility = defender.ability;
            desc.weather = field.weather;
        }
        else if (field.defenderSide.isFlowerGift &&
            field.hasWeather('Sun', 'Harsh Sunshine') &&
            !hitsPhysical) {
            dfMods.push(6144);
            desc.weather = field.weather;
            desc.isFlowerGiftDefender = true;
        }
        if (field.hasTerrain('Grassy') && defender.hasAbility('Grass Pelt') && hitsPhysical) {
            dfMods.push(6144);
            desc.defenderAbility = defender.ability;
        }
        if ((!hitsPhysical && defender.hasItem('Soul Dew') &&
            defender.named('Latios', 'Latias', 'Latios-Mega', 'Latias-Mega')) ||
            (defender.hasItem('Eviolite') && ((_a = gen.species.get((0, util_1.toID)(defender.name))) === null || _a === void 0 ? void 0 : _a.nfe)) ||
            (!hitsPhysical && defender.hasItem('Assault Vest', 'Tera Vest'))) {
            dfMods.push(6144);
            desc.defenderItem = defender.item;
        }
        if (defender.hasItem('Mascot Badge')) {
            dfMods.push(8192);
        }
        if ((defender.hasItem('Metal Powder') && defender.named('Ditto') && hitsPhysical) ||
            (defender.hasItem('Deep Sea Scale') && defender.named('Clamperl') && !hitsPhysical)) {
            dfMods.push(8192);
            desc.defenderItem = defender.item;
        }
        if (defender.hasAbility('Fur Coat') && hitsPhysical) {
            dfMods.push(8192);
            desc.defenderAbility = defender.ability;
        }
        defense = (0, util_2.OF16)(Math.max(1, (0, util_2.pokeRound)((defense * (0, util_2.chainMods)(dfMods, 410, 131072)) / 4096)));
        if ((move.named('Explosion') || move.named('Self-Destruct')) && settings.switchIn == 11) {
            defense = Math.floor(defense * 0.5);
        }
        if (TITLE == "Blinding White 2") {
            // Roxie, Elesa, Skyla lvlcaps
            settings.levelCaps = [[19, 1], [36, 2], [50, 3]];
            settings.challengeExceptionListPresent = false;
        }
        var delta = 0;
        // Check if challenge mode, if calculating trainer pok, and if trainer pok is in challenge mode exception list
        var currentTrainerMon = settings.challengeMode && typeof get_current_in === "function" ? get_current_in(false) : null;
        if (settings.challengeMode && currentTrainerMon && !(settings.challengeExceptionListPresent && currentTrainerMon["noCh"]) && $('.set-selector')[3].value.includes(attacker.name) && $('.set-selector')[3].value.includes(attacker.level)) {
            delta = 4;
            for (n in settings.levelCaps) {
                if (attacker.level <= settings.levelCaps[n][0]) {
                    delta = settings.levelCaps[n][1];
                    break;
                }
            }
        }
        var baseDamage = (0, util_2.getBaseDamage)(attacker.level + delta, basePower, attack, defense);
        if (isSpread) {
            baseDamage = (0, util_2.pokeRound)((0, util_2.OF32)(baseDamage * 3072) / 4096);
        }
        if (attacker.hasAbility('Parental Bond (Child)')) {
            baseDamage = (0, util_2.pokeRound)((0, util_2.OF32)(baseDamage * 2048) / 4096);
        }
        ctx.state.modifierId = "weather";
        ctx.state.skipWeather = false;
        baseDamage = (0, romhack_helpers_1.applyValueHooks)(profile, "baseDamage", ctx, baseDamage);
        ctx.state.modifierId = undefined;
        if (!ctx.state.skipWeather) {
            if ((field.hasWeather('Sun', 'Harsh Sunshine') && move.hasType('Fire')) ||
                (field.hasWeather('Rain', 'Heavy Rain') && move.hasType('Water'))) {
                baseDamage = (0, util_2.pokeRound)((0, util_2.OF32)(baseDamage * 6144) / 4096);
                desc.weather = field.weather;
            }
            else if ((field.hasWeather('Sun') && move.hasType('Water')) ||
                (field.hasWeather('Rain') && move.hasType('Fire'))) {
                baseDamage = (0, util_2.pokeRound)((0, util_2.OF32)(baseDamage * 2048) / 4096);
                desc.weather = field.weather;
            }
        }
        ctx.state.isCritical = isCritical;
        (0, romhack_helpers_1.runHooks)(profile, "beforeFinalDamage", ctx);
        isCritical = ctx.state.isCritical;
        if (isCritical) {
            if (settings.critGen >= 6) {
                baseDamage = Math.floor((0, util_2.OF32)(baseDamage * (1.5)));
            }
            else {
                baseDamage = Math.floor((0, util_2.OF32)(baseDamage * (gen.num > 5 ? 1.5 : 2)));
            }
            ctx.state.isCritical = isCritical;
            baseDamage = (0, romhack_helpers_1.applyValueHooks)(profile, "baseDamage", ctx, baseDamage);
            desc.isCritical = isCritical;
        }
        var stabMod = 4096;
        if (attacker.hasType(move.type) || (oldTypes.includes(move.type) && isAttackerTera)) {
            if (attacker.hasAbility('Adaptability') || isSameTypeTera) {
                stabMod = 8192;
                if (attacker.hasAbility('Adaptability') && isSameTypeTera) {
                    stabMod = 9216;
                }
                desc.attackerAbility = attacker.ability;
            }
            else {
                stabMod = 6144;
            }
        }
        else if (attacker.hasAbility('Protean', "Savant")) {
            stabMod = 6144;
            desc.attackerAbility = attacker.ability;
        }
        var applyBurn = attacker.hasStatus('brn') &&
            move.category === 'Physical' &&
            !attacker.hasAbility('Guts') &&
            !(move.named('Facade') && (gen.num === 6 || isCascadeProfile));
        desc.isBurned = applyBurn;
        var finalMods = [];
        if (field.defenderSide.isReflect && move.category === 'Physical' && !isCritical) {
            finalMods.push(field.gameType !== 'Singles' ? (gen.num > 5 ? 2732 : 2703) : 2048);
            desc.isReflect = true;
        }
        else if (field.defenderSide.isLightScreen && move.category === 'Special' && !isCritical) {
            finalMods.push(field.gameType !== 'Singles' ? (gen.num > 5 ? 2732 : 2703) : 2048);
            desc.isLightScreen = true;
        }
        if ((defender.hasAbility('Multiscale', "Majestic Ward")) && defender.curHP() === defender.maxHP() &&
            hitCount === 0 &&
            !field.defenderSide.isSR && (!field.defenderSide.spikes || defender.hasType('Flying')) &&
            !attacker.hasAbility('Parental Bond (Child)')) {
            finalMods.push(2048);
            desc.defenderAbility = defender.ability;
        }
        if (defender.hasAbility('Fluffy') && move.flags.contact && !attacker.hasAbility('Long Reach')) {
            finalMods.push(2048);
            desc.defenderAbility = defender.ability;
        }
        finalMods = (0, romhack_helpers_1.applyValueHooks)(profile, "finalMods", ctx, finalMods);
        if (defender.hasAbility('Fluffy') && move.hasType('Fire')) {
            finalMods.push(8192);
            desc.defenderAbility = defender.ability;
        }
        if (attacker.hasAbility('Tinted Lens', 'Tenacity') && typeEffectiveness < 1) {
            finalMods.push(8192);
            desc.attackerAbility = attacker.ability;
        }
        if (field.defenderSide.isFriendGuard) {
            finalMods.push(3072);
            desc.isFriendGuard = true;
        }
        if (attacker.hasAbility('Sniper') && isCritical) {
            finalMods.push(6144);
            desc.attackerAbility = attacker.ability;
        }
        if (defender.hasAbility('Solid Rock', 'Filter') && typeEffectiveness > 1) {
            finalMods.push(3072);
            desc.defenderAbility = defender.ability;
        }
        if (attacker.hasItem('Metronome') && move.timesUsedWithMetronome >= 1) {
            var timesUsedWithMetronome = Math.floor(move.timesUsedWithMetronome);
            if (timesUsedWithMetronome <= 4) {
                finalMods.push(4096 + timesUsedWithMetronome * 819);
            }
            else {
                finalMods.push(8192);
            }
            desc.attackerItem = attacker.item;
        }
        if (attacker.hasItem('Expert Belt') && typeEffectiveness > 1 && !move.isZ) {
            finalMods.push(4915);
            desc.attackerItem = attacker.item;
        }
        else if (attacker.hasItem('Life Orb', 'Tera Orb')) {
            finalMods.push(5324);
            desc.attackerItem = attacker.item;
        }
        if (attacker.hasItem('Tera Plate') && move.type == attacker.moves[0].type) {
            finalMods.push(5324);
            desc.attackerItem = attacker.item;
        }
        if (move.hasType((0, items_1.getBerryResistType)(defender.item)) &&
            (typeEffectiveness > 1 || move.hasType('Normal')) &&
            hitCount === 0 &&
            !attacker.hasAbility('Unnerve')) {
            finalMods.push(2048);
            desc.defenderItem = defender.item;
        }
        if (field.defenderSide.isProtected && move.isZ && attacker.item && attacker.item.includes(' Z')) {
            finalMods.push(1024);
            desc.isProtected = true;
        }
        var finalMod = (0, util_2.chainMods)(finalMods, 41, 131072);
        var damage = [];
        for (var i = 0; i < 16; i++) {
            damage[i] =
                (0, util_2.getFinalDamage)(baseDamage, i, typeEffectiveness, applyBurn, stabMod, finalMod);
        }
        return { damage: damage, attackStat: attackStat };
    };
    var hitResult = computeDamageArray(0);
    if (!hitResult) {
        return result;
    }
    var damage = hitResult.damage;
    var attackStat = hitResult.attackStat;
    var childDamage;
    if (attacker.hasAbility('Parental Bond') && move.hits === 1 && !isSpread) {
        var child = attacker.clone();
        child.ability = 'Parental Bond (Child)';
        (0, util_2.checkMultihitBoost)(gen, child, defender, move, field, desc);
        childDamage = calculateBWXY(gen, child, defender, move, field).damage;
        desc.attackerAbility = attacker.ability;
    }
    desc.attackBoost =
        move.named('Foul Play') ? defender.boosts[attackStat] : attacker.boosts[attackStat];
    if (move.timesUsed > 1 || move.hits > 1) {
        var damageMatrix = [damage];
        var origDefBoost = desc.defenseBoost;
        var origAtkBoost = desc.attackBoost;
        var numAttacks = 1;
        if (move.timesUsed > 1) {
            desc.moveTurns = "over ".concat(move.timesUsed, " turns");
            numAttacks = move.timesUsed;
        }
        else {
            numAttacks = move.hits;
        }
        var usedItems = [false, false];
        for (var times = 1; times < numAttacks; times++) {
            usedItems = (0, util_2.checkMultihitBoost)(gen, attacker, defender, move, field, desc, usedItems[0], usedItems[1]);
            if (hasAteTypeChange) {
                hasAteTypeChange = attacker.hasAbility('Aerilate', 'Galvanize', 'Pixilate', 'Refrigerate', 'Moisturize', 'Normalize');
            }
            var nextHit = computeDamageArray(times);
            if (!nextHit) {
                break;
            }
            damageMatrix[times] = nextHit.damage;
        }
        result.damage = damageMatrix;
        desc.defenseBoost = origDefBoost;
        desc.attackBoost = origAtkBoost;
        return result;
    }
    result.damage = childDamage ? [damage, childDamage] : damage;
    return result;
}
exports.calculateBWXY = calculateBWXY;
//# sourceMappingURL=gen56.js.map
