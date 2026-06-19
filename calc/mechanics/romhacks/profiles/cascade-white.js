"use strict";
exports.__esModule = true;

var helpers_1 = require("../helpers");

function weatherSuppressed(ctx) {
    return (ctx.defender.hasAbility("Overcoat") || ctx.defender.hasItem("Utility Umbrella"));
}

function commonTypes(attacker, defender) {
    return attacker.types.some(function (type) { return defender.types.includes(type); });
}

var cascadeWhiteProfile = (0, helpers_1.makeProfile)({
    id: "cascade-white",
    gens: [5, 6],
    titleMatchers: [{ includes: "Cascade" }],
    hooks: {
        beforeStats: [
            function (ctx) {
                ctx.util.checkCascItems(ctx.attacker);
                ctx.util.checkCascItems(ctx.defender);
            }
        ],
        afterMoveType: [
            function (ctx) {
                if (ctx.move.named("Weather Ball", "Weather Crash") && weatherSuppressed(ctx)) {
                    ctx.move.type = "Normal";
                    ctx.desc.moveType = ctx.move.type;
                }
            }
        ],
        typeEffectiveness: [
            function (ctx, effectiveness) {
                var move = ctx.move;
                var type = ctx.state.effectivenessType;
                var fieldEffects = typeof FIELD_EFFECTS !== "undefined" ? FIELD_EFFECTS : {};
                if ((typeof $ !== "undefined") && (($("#abilityL1") == "Corrosion" || $("#abilityL2") == "Corrosion") && type == "Steel" && move.type == "Poison")) {
                    return 2;
                }
                if (fieldEffects["chargestone"] && type == "Ground" && move.type == "Electric") {
                    return 0.5;
                }
                if (fieldEffects["celestial"]) {
                    if (type == "Normal" && move.type == "Ghost") {
                        return 0.5;
                    }
                    if (type == "Dark" && move.type == "Psychic") {
                        return 0.5;
                    }
                }
                if (fieldEffects["opelucid"]) {
                    if (type == "Fairy" && move.type == "Dragon") {
                        return 0.5;
                    }
                    if (type == "Ghost" && move.type == "Fighting") {
                        return 0.5;
                    }
                }
                if (move.named("Sky Uppercut") && type === "Flying") {
                    return 2;
                }
                if (move.named("Sacred Sword", "Relic Song") && type == "Ghost") {
                    return 1;
                }
                if (move.named("Chip Away")) {
                    return 1;
                }
                return effectiveness;
            }
        ],
        moveBasePower: [
            function (ctx, basePower) {
                var move = ctx.move;
                var desc = ctx.desc;
                if (move.named("Electro Ball")) {
                    basePower = ctx.defender.stats.spe < ctx.attacker.stats.spe ? move.bp * 2 : move.bp;
                    desc.moveBP = basePower;
                    return basePower;
                }
                if (move.named("Gyro Ball")) {
                    basePower = ctx.defender.stats.spe > ctx.attacker.stats.spe ? move.bp * 2 : move.bp;
                    desc.moveBP = basePower;
                    return basePower;
                }
                if (move.named("Heavy Slam", "Heat Crash")) {
                    return move.bp;
                }
                if (move.named("Stored Power", "Power Trip")) {
                    basePower = move.bp + 25 * ctx.util.countBoosts(ctx.gen, ctx.attacker.boosts);
                    desc.moveBP = basePower;
                    return basePower;
                }
                if (move.named("Weather Ball", "Weather Crash")) {
                    basePower = move.bp * (ctx.field.weather && !(ctx.field.hasWeather("Strong Winds") && weatherSuppressed(ctx)) ? 2 : 1);
                    desc.moveBP = basePower;
                    return basePower;
                }
            }
        ],
        basePowerMods: [
            function (ctx, bpMods) {
                var attacker = ctx.attacker;
                var defender = ctx.defender;
                var move = ctx.move;
                var field = ctx.field;
                var desc = ctx.desc;
                var state = ctx.state;
                var hitsPhysical = state.hitsPhysical;
                if (state.modifierId === "sandForceWeather") {
                    bpMods.push(5734);
                    return bpMods;
                }
                if (state.modifierId === "sandForceNoWeather" && move.hasType("Rock", "Ground", "Steel")) {
                    bpMods.push(4915);
                    desc.attackerAbility = attacker.ability;
                    desc.weather = field.weather;
                    return bpMods;
                }
                if (state.modifierId === "ironFist") {
                    bpMods.push(5325);
                    return bpMods;
                }
                if (state.modifierId === "heatproof") {
                    bpMods.push(1024);
                    return bpMods;
                }
                if (state.modifierId === "drySkinFire") {
                    bpMods.push(8192);
                    return bpMods;
                }
                if (state.modifierId === "rivalryBase") {
                    state.skipDefaultMod = true;
                    return bpMods;
                }
                if (state.modifierId === "plateBoost" && attacker.item && attacker.item.includes("Plate")) {
                    bpMods.push(5529);
                    return bpMods;
                }
                if (state.modifierId === "helpingHand") {
                    bpMods.push(8192);
                    return bpMods;
                }
                if (state.modifierId === "ateBoost") {
                    state.skipDefaultMod = true;
                    return bpMods;
                }
                if (defender.hasAbility("Slush Rush") && move.hasType("Ice")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Swift Swim") && move.hasType("Water")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Sand Rush") && move.hasType("Rock")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Toxic Boost") && move.hasType("Poison")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Permafrost") && move.category == "Special") {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Justified") && move.hasType("Dark")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Light Metal") && hitsPhysical) {
                    bpMods.push(6144);
                }
                else if (defender.hasAbility("Heavy Metal") && hitsPhysical) {
                    bpMods.push(2732);
                }
                else if (defender.hasAbility("Solid Rock", "Filter") && state.typeEffectiveness > 2) {
                    bpMods.push(3072);
                }
                else if (defender.hasAbility("Merciless") && attacker.status) {
                    bpMods.push(3072);
                }
                else if (defender.hasAbility("Sap Sipper") && move.hasType("Grass")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Motor Drive") && move.hasType("Electric")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Water Absorb") && move.hasType("Water")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Flash Fire") && move.hasType("Fire")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Strawberry") && move.hasType("Fairy")) {
                    bpMods.push(2048);
                }
                else if (defender.hasAbility("Teravolt") && move.hasType("Dragon")) {
                    bpMods.push(2048);
                }
                if (attacker.hasAbility("Normalize") || state.hasAteTypeChange) {
                    bpMods.push(4915);
                }
                else if (attacker.hasAbility("Moisturize") && state.isMoisturize) {
                    bpMods.push(4915);
                }
                else if (attacker.hasAbility("Reckless") && move.named("Explosion", "Self-Destruct")) {
                    bpMods.push(4915);
                }
                else if (attacker.hasAbility("Mold Breaker", "Turboblaze", "Teravolt")) {
                    bpMods.push(4505);
                }
                else if (attacker.hasAbility("Infiltrator") && state.typeEffectiveness > 1) {
                    bpMods.push(4915);
                }
                else if (attacker.hasAbility("Merciless") && defender.status) {
                    bpMods.push(5120);
                }
                else if (attacker.hasAbility("Hyper Cutter") && (move.flags.slicing || move.flags.claw)) {
                    bpMods.push(5325);
                }
                else if ((attacker.hasAbility("Overgrow") && move.hasType("Grass")) ||
                    (attacker.hasAbility("Blaze") && move.hasType("Fire")) ||
                    (attacker.hasAbility("Torrent") && move.hasType("Water")) ||
                    (attacker.hasAbility("Swarm") && move.hasType("Bug"))) {
                    if (attacker.curHP() > attacker.maxHP() / 3) {
                        bpMods.push(5120);
                    }
                }
                else if (attacker.hasAbility("Ballistics") && move.flags.bullet) {
                    bpMods.push(4915);
                }
                else if (defender.hasAbility("Colossal")) {
                    bpMods.push(3072);
                }
                else if (attacker.named("Farfetch’d") && attacker.hasItem("Stick") && hitsPhysical) {
                    bpMods.push(8192);
                }
                else if (attacker.hasItem("Light Ball") && attacker.name.startsWith("Eevee")) {
                    bpMods.push(8192);
                }
                if (attacker.hasAbility("Rivalry") && commonTypes(attacker, defender)) {
                    bpMods.push(5448);
                    desc.rivalry = "buffed";
                    desc.attackerAbility = attacker.ability;
                }
                return bpMods;
            }
        ],
        defenseMods: [
            function (ctx, dfMods) {
                if (ctx.field.hasWeather("Hail") && ctx.defender.hasType("Ice") && ctx.state.hitsPhysical) {
                    ctx.state.defense = ctx.util.pokeRound((ctx.state.defense * 3) / 2);
                    ctx.desc.weather = ctx.field.weather;
                }
                return dfMods;
            }
        ],
        baseDamage: [
            function (ctx, baseDamage) {
                if (ctx.state.modifierId === "weather" && weatherSuppressed(ctx)) {
                    ctx.state.skipWeather = true;
                    return baseDamage;
                }
                if (ctx.state.isCritical && ctx.defender.hasAbility("Forewarn")) {
                    baseDamage = Math.floor(ctx.util.OF32(baseDamage * 0.75));
                }
                return baseDamage;
            }
        ],
        finalMods: [
            function (ctx, finalMods) {
                if (ctx.defender.hasAbility("Rivalry") && commonTypes(ctx.attacker, ctx.defender)) {
                    finalMods.push(2744);
                    ctx.desc.rivalry = "buffed";
                    ctx.desc.attackerAbility = ctx.attacker.ability;
                }
                return finalMods;
            }
        ],
        beforeFinalDamage: [
            function (ctx) {
                if (ctx.move.named("Explosion", "Self-Destruct")) {
                    ctx.state.isCritical = true;
                }
            }
        ]
    }
});
exports.cascadeWhiteProfile = cascadeWhiteProfile;
