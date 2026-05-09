"use strict";
exports.__esModule = true;

var helpers_1 = require("../helpers");

function isUnboundSandstorm(field) {
    return !!(field && field.hasWeather && field.hasWeather("Vicious Sandstorm"));
}

function hasUnboundFullHpShield(defender, field) {
    return defender.curHP() === defender.maxHP() &&
        (!field.defenderSide.isSR && (!field.defenderSide.spikes || defender.hasType("Flying")) ||
            defender.hasItem("Heavy-Duty Boots"));
}

var unboundProfile = (0, helpers_1.makeProfile)({
    id: "pokemon-unbound",
    gens: [8],
    titleMatchers: [
        { includes: "Pokemon Unbound" },
        { equals: "Unbound" },
        { includes: "Unbound 2.1.1" }
    ],
    hooks: {
        afterMoveType: [
            function (ctx) {
                if (ctx.move.named("Weather Ball") && isUnboundSandstorm(ctx.field)) {
                    ctx.move.type = "Rock";
                    ctx.desc.weather = ctx.field.weather;
                    ctx.desc.moveType = ctx.move.type;
                }
                if ((ctx.attacker.hasAbility("Grass Dash") && ctx.move.hasType("Grass")) ||
                    (ctx.attacker.hasAbility("Slippery Tail") && ctx.move.flags.tail)) {
                    ctx.move.priority = 1;
                    ctx.desc.attackerAbility = ctx.attacker.ability;
                }
            }
        ],
        basePowerMods: [
            function (ctx, bpMods) {
                if (ctx.move.named("Solar Beam", "Solar Blade") && isUnboundSandstorm(ctx.field)) {
                    bpMods.push(2048);
                    ctx.desc.moveBP = ctx.state.basePower / 2;
                    ctx.desc.weather = ctx.field.weather;
                }
                if (ctx.attacker.hasAbility("Sand Force") &&
                    isUnboundSandstorm(ctx.field) &&
                    ctx.move.hasType("Rock", "Ground", "Steel")) {
                    bpMods.push(5325);
                    ctx.desc.attackerAbility = ctx.attacker.ability;
                    ctx.desc.weather = ctx.field.weather;
                }
                if (ctx.attacker.hasAbility("Bellow", "Sound Waves") && ctx.move.flags.sound) {
                    bpMods.push(5325);
                    ctx.desc.attackerAbility = ctx.attacker.ability;
                }
                return bpMods;
            }
        ],
        attackMods: [
            function (ctx, atMods) {
                if (ctx.attacker.hasAbility("Crabby Tactics") &&
                    ctx.move.category === "Physical" &&
                    !ctx.attacker.isDynamaxed) {
                    atMods.push(6144);
                    ctx.desc.attackerAbility = ctx.attacker.ability;
                }
                return atMods;
            }
        ],
        defenseMods: [
            function (ctx, dfMods) {
                if (ctx.defender.hasAbility("Honey Armor") && ctx.state.hitsPhysical) {
                    dfMods.push(8192);
                    ctx.desc.defenderAbility = ctx.defender.ability;
                }
                if (!ctx.state.hitsPhysical &&
                    isUnboundSandstorm(ctx.field) &&
                    ctx.defender.hasType("Rock", "Ground")) {
                    dfMods.push(6144);
                    ctx.desc.weather = ctx.field.weather;
                }
                return dfMods;
            }
        ],
        finalMods: [
            function (ctx, finalMods) {
                if (ctx.defender.hasAbility("Multieye") &&
                    ctx.state.hitCount === 0 &&
                    hasUnboundFullHpShield(ctx.defender, ctx.field) &&
                    !ctx.attacker.hasAbility("Parental Bond (Child)", "ORAORAORAORA (Child)")) {
                    finalMods.push(2048);
                    ctx.desc.defenderAbility = ctx.defender.ability;
                }
                if (ctx.field.isShadowyVeil &&
                    ctx.defender.hasType("Ghost") &&
                    !ctx.attacker.hasAbility("Parental Bond (Child)", "ORAORAORAORA (Child)")) {
                    finalMods.push(2048);
                    ctx.desc.isShadowyVeil = true;
                }
                if ((ctx.defender.hasAbility("Bellow", "Sound Waves") && ctx.move.flags.sound) ||
                    (ctx.defender.hasAbility("Icy Skin", "Dusty Scales") && ctx.move.category === "Special")) {
                    finalMods.push(2048);
                    ctx.desc.defenderAbility = ctx.defender.ability;
                }
                if (ctx.defender.hasAbility("Portal Power") && !ctx.move.flags.contact) {
                    finalMods.push(3072);
                    ctx.desc.defenderAbility = ctx.defender.ability;
                }
                return finalMods;
            }
        ]
    }
});
exports.unboundProfile = unboundProfile;
