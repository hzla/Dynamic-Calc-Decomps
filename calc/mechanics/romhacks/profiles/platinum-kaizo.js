"use strict";
exports.__esModule = true;

var helpers_1 = require("../helpers");

function isCalcingForSwitchIns() {
    return typeof calcingForSwitchIns !== "undefined" && calcingForSwitchIns;
}

var platinumKaizoProfile = (0, helpers_1.makeProfile)({
    id: "platinum-kaizo",
    gens: [4],
    titleMatchers: [{ equals: "Platinum Kaizo" }],
    hooks: {
        moveBasePower: [
            function (ctx, basePower) {
                var move = ctx.move;
                var desc = ctx.desc;
                var hitCount = ctx.state.hitCount || 0;
                if (move.named("Eruption")) {
                    basePower = ctx.state.originalBasePower || basePower;
                    desc.moveBP = basePower;
                    return basePower;
                }
                if (move.named("Wring Out")) {
                    basePower = move.bp || 75;
                    if (ctx.defender.curHP() <= ctx.defender.maxHP() / 2 && !isCalcingForSwitchIns()) {
                        basePower *= 2;
                    }
                    desc.moveBP = basePower;
                    return basePower;
                }
                if (move.named("Fury Cutter")) {
                    desc.moveBP = move.hits === 2 ? 60 : move.hits === 3 ? 120 : 30;
                    return (hitCount + 1) * 20;
                }
                if (move.named("Triple Kick", "Rock Wrecker")) {
                    desc.moveBP = move.hits === 2 ? 90 : move.hits === 3 ? 180 : 30;
                    return (hitCount + 1) * 30;
                }
            }
        ],
        basePowerMods: [
            function (ctx, mods) {
                if (ctx.state.modifierId === "plateBoost" && ctx.attacker.item && ctx.attacker.item.includes("Plate")) {
                    return (0, helpers_1.pushMod)(mods, ctx.state.fixedMod || 1.5);
                }
            }
        ]
    }
});
exports.platinumKaizoProfile = platinumKaizoProfile;
