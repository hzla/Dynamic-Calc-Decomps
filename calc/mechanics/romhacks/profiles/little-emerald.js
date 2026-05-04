"use strict";
exports.__esModule = true;

var util_1 = require("../../../util");
var helpers_1 = require("../helpers");
var LITTLE_EMERALD_BABY_MEGA_STONES = {
    "Attack Incense": true,
    "Calm Incense": true,
    "Defense Incense": true,
    Electirizer: true,
    "Egg Incense": true,
    "Full Incense": true,
    "Ice Incense": true,
    "Lax Incense": true,
    "Light Incense": true,
    "Luck Incense": true,
    Magmarizer: true,
    "Metal Incense": true,
    "Moon Incense": true,
    "Odd Incense": true,
    "Pink Incense": true,
    "Punk Incense": true,
    "Pure Incense": true,
    "Rock Incense": true,
    "Rose Incense": true,
    "Sea Incense": true,
    "Soothing Incense": true,
    "Wave Incense": true,
    "Weird Incense": true
};

function isNamedHolder(pokemon, species, item) {
    return pokemon.named(species) && pokemon.hasItem(item);
}

function isLittleEmeraldSpecies(pokemon) {
    return pokemon && typeof pokemon.name === "string" ? pokemon.name : "";
}

function isCharcadetFamilyWithItem(pokemon, item) {
    var name = isLittleEmeraldSpecies(pokemon);
    return name.indexOf("Charcadet") === 0 && pokemon.hasItem(item, item === "Auspicious Armor" ? "Auspiciuse Armor" : item);
}

function isEeveeStoneBoost(pokemon, item, moveType) {
    var name = isLittleEmeraldSpecies(pokemon);
    return name.indexOf("Eevee") === 0 && pokemon.hasItem(item) && pokemon.hasType(moveType);
}

function isLittleEmeraldMegaStone(gen, itemName) {
    if (!itemName) {
        return false;
    }
    if (LITTLE_EMERALD_BABY_MEGA_STONES[itemName]) {
        return true;
    }
    var item = gen.items.get((0, util_1.toID)(itemName));
    return !!(item && item.megaEvolves);
}

function hasLittleEmeraldLaggingItem(pokemon) {
    return isNamedHolder(pokemon, "Wynaut", "Lax Incense") ||
        isNamedHolder(pokemon, "Munchlax", "Full Incense");
}

function isNFE(gen, pokemon) {
    var species = gen.species.get((0, util_1.toID)(pokemon.name));
    return !!(species && species.nfe);
}

function applyTwentyPercentItemBoost(ctx, bpMods) {
    var attacker = ctx.attacker;
    var move = ctx.move;
    var itemMatched =
        attacker.hasItem("Pink Incense") && move.hasType("Fairy") ||
            attacker.hasItem("Egg Incense") && move.hasType("Normal") ||
            attacker.hasItem("Attack Incense") && move.hasType("Fighting") ||
            attacker.hasItem("Calm Incense") && move.category === "Physical" ||
            attacker.hasItem("Electirizer") && move.hasType("Electric") ||
            attacker.hasItem("Magmarizer") && move.hasType("Fire") ||
            attacker.hasItem("Ice Incense") && move.hasType("Ice") ||
            attacker.hasItem("Sea Incense") && move.hasType("Water") ||
            attacker.hasItem("Rose Incense") && move.hasType("Grass") ||
            attacker.hasItem("Pure Incense") && move.hasType("Psychic") ||
            attacker.hasItem("Rock Incense") && move.hasType("Rock") ||
            attacker.hasItem("Odd Incense") && move.hasType("Psychic") ||
            attacker.hasItem("Weird Incense") && move.hasType("Ice") ||
            attacker.hasItem("Metal Incense") && move.hasType("Steel") ||
            attacker.hasItem("Wave Incense") && move.hasType("Water") ||
            attacker.hasItem("Soothing Incense") && move.flags.sound ||
            attacker.hasItem("Punk Incense") && move.flags.sound ||
            isEeveeStoneBoost(attacker, "Fire Stone", "Fire") && move.hasType("Fire") ||
            isEeveeStoneBoost(attacker, "Water Stone", "Water") && move.hasType("Water") ||
            isEeveeStoneBoost(attacker, "Thunder Stone", "Electric") && move.hasType("Electric") ||
            isEeveeStoneBoost(attacker, "Sun Stone", "Psychic") && move.hasType("Psychic") ||
            isEeveeStoneBoost(attacker, "Moon Stone", "Dark") && move.hasType("Dark") ||
            isEeveeStoneBoost(attacker, "Ice Stone", "Ice") && move.hasType("Ice") ||
            isEeveeStoneBoost(attacker, "Leaf Stone", "Grass") && move.hasType("Grass") ||
            isEeveeStoneBoost(attacker, "Shiny Stone", "Fairy") && move.hasType("Fairy") ||
            attacker.hasItem("Black Flute", "Blue Flute", "Red Flute", "White Flute", "Yellow Flute") && move.flags.sound;
    if (itemMatched) {
        bpMods.push(4915);
        ctx.desc.attackerItem = attacker.item;
    }
    return bpMods;
}

var littleEmeraldProfile = (0, helpers_1.makeProfile)({
    id: "little-emerald",
    gens: [7, 8, 9],
    titleMatchers: [{ equals: "Little Emerald" }],
    hooks: {
        criticalHit: [
            function (ctx, isCritical) {
                if (ctx.defender.hasAbility("Magma Armor")) {
                    ctx.desc.defenderAbility = ctx.defender.ability;
                    return false;
                }
                if (isNamedHolder(ctx.defender, "Rhyhorn", "Protector")) {
                    ctx.desc.defenderItem = ctx.defender.item;
                    return false;
                }
                if (isNamedHolder(ctx.attacker, "Happiny", "Lucky Punch")) {
                    ctx.desc.attackerItem = ctx.attacker.item;
                    return ctx.move.timesUsed === 1;
                }
                return isCritical;
            }
        ],
        turnOrder: [
            function (ctx, turnOrder) {
                var attackerLagging = hasLittleEmeraldLaggingItem(ctx.attacker);
                var defenderLagging = hasLittleEmeraldLaggingItem(ctx.defender);
                if (attackerLagging === defenderLagging) {
                    return turnOrder;
                }
                if (attackerLagging) {
                    ctx.desc.attackerItem = ctx.attacker.item;
                    return "last";
                }
                ctx.desc.defenderItem = ctx.defender.item;
                return "first";
            }
        ],
        typeEffectiveness: [
            function (ctx, effectiveness) {
                var move = ctx.move;
                var type = ctx.state.effectivenessType;
                if (ctx.attacker.hasAbility("Normalize") && type === "Ghost" && move.hasType("Normal")) {
                    ctx.desc.attackerAbility = ctx.attacker.ability;
                    return 1;
                }
                if (ctx.defender.hasAbility("Steam Engine") && move.hasType("Fire", "Water")) {
                    ctx.desc.defenderAbility = ctx.defender.ability;
                    return 0;
                }
                if (ctx.defender.hasAbility("Heatproof", "Thermal Exchange") && move.hasType("Fire")) {
                    ctx.desc.defenderAbility = ctx.defender.ability;
                    return 0;
                }
                if (ctx.defender.hasAbility("Damp") && move.named("Explosion", "Misty Explosion", "Self-Destruct")) {
                    ctx.desc.defenderAbility = ctx.defender.ability;
                    return 0;
                }
                return effectiveness;
            }
        ],
        basePowerMods: [
            function (ctx, bpMods) {
                if (ctx.move.named("Knock Off") && isLittleEmeraldMegaStone(ctx.gen, ctx.defender.item)) {
                    var knockOffIndex = bpMods.indexOf(6144);
                    if (knockOffIndex !== -1) {
                        bpMods.splice(knockOffIndex, 1);
                        ctx.desc.moveBP = ctx.state.basePower;
                    }
                    ctx.desc.defenderItem = ctx.defender.item;
                }
                return applyTwentyPercentItemBoost(ctx, bpMods);
            }
        ],
        attackMods: [
            function (ctx, atMods) {
                if (isNamedHolder(ctx.attacker, "Pichu", "Light Incense")) {
                    atMods.push(6144);
                    ctx.desc.attackerItem = ctx.attacker.item;
                }
                if (ctx.attacker.hasAbility("Huge Power") && ctx.move.category === "Physical") {
                    atMods.push(8192);
                    ctx.desc.attackerAbility = ctx.attacker.ability;
                }
                return atMods;
            }
        ],
        defenseMods: [
            function (ctx, dfMods) {
                if (isNamedHolder(ctx.defender, "Cleffa", "Moon Incense")) {
                    dfMods.push(6144);
                    ctx.desc.defenderItem = ctx.defender.item;
                }
                if (isCharcadetFamilyWithItem(ctx.defender, "Malicious Armor") ||
                    isCharcadetFamilyWithItem(ctx.defender, "Auspicious Armor")) {
                    dfMods.push(6144);
                    ctx.desc.defenderItem = ctx.defender.item;
                }
                if (!ctx.state.hitsPhysical && isNamedHolder(ctx.defender, "Tyrogue", "Defense Incense")) {
                    dfMods.push(6144);
                    ctx.desc.defenderItem = ctx.defender.item;
                }
                if (!ctx.state.hitsPhysical && ctx.defender.hasItem("Eviolite") && isNFE(ctx.gen, ctx.defender)) {
                    var evioliteIndex = dfMods.lastIndexOf(6144);
                    if (evioliteIndex !== -1) {
                        dfMods.splice(evioliteIndex, 1);
                        ctx.desc.defenderItem = undefined;
                    }
                }
                return dfMods;
            }
        ]
    }
});
exports.littleEmeraldProfile = littleEmeraldProfile;
