"use strict";
exports.__esModule = true;

var helpers_1 = require("../helpers");

var platinumReduxProfile = (0, helpers_1.makeProfile)({
    id: "platinum-redux",
    gens: [4],
    titleMatchers: [{ includes: "Platinum Redux" }],
    hooks: {
        basePowerMods: [
            function (ctx, mods) {
                if (ctx.state.modifierId === "muscleWiseBoost") {
                    mods.push(1.15);
                    return mods;
                }
            }
        ],
        attackMods: [
            function (ctx, mods) {
                if (ctx.state.modifierId === "choiceBoost") {
                    mods.push(1.25);
                    return mods;
                }
            }
        ],
        baseDamage: [
            function (ctx, baseDamage) {
                if (ctx.state.modifierId === "lifeOrb") {
                    ctx.state.profileModifierApplied = true;
                    return Math.floor(baseDamage * 1.25);
                }
            }
        ],
        finalMods: [
            function (ctx, mods) {
                if (ctx.state.modifierId === "expertBelt") {
                    mods.push(1.25);
                    return mods;
                }
            }
        ]
    }
});
exports.platinumReduxProfile = platinumReduxProfile;
