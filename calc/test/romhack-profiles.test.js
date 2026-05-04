"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 6, typeChart: 6 };
}

var helper_1 = require("./helper");
var types_1 = require("../data/types");
var romhacks_1 = require("../mechanics/romhacks");
var romhack_helpers_1 = require("../mechanics/romhacks/helpers");

function withGlobals(title, genNum, fn) {
    var prev = {
        TITLE: global.TITLE,
        settings: global.settings,
        gameGen: global.gameGen,
        typeChart: global.typeChart,
        calcingForSwitchIns: global.calcingForSwitchIns,
        pokedex: global.pokedex
    };
    global.TITLE = title;
    global.settings = {
        type_chart: genNum,
        typeChart: genNum,
        damageGen: genNum,
        critGen: genNum,
        switchIn: 0,
        challengeMode: false
    };
    global.gameGen = genNum;
    global.typeChart = types_1.TYPE_CHART[genNum];
    global.calcingForSwitchIns = false;
    global.pokedex = {};
    try {
        return fn();
    }
    finally {
        global.TITLE = prev.TITLE;
        global.settings = prev.settings;
        global.gameGen = prev.gameGen;
        global.typeChart = prev.typeChart;
        global.calcingForSwitchIns = prev.calcingForSwitchIns;
        global.pokedex = prev.pokedex;
    }
}

function P(ctx, name, options) {
    if (options === void 0) { options = {}; }
    var merged = Object.assign({ ability: "No Ability", item: "", level: 100, nature: "Serious" }, options);
    if (!merged.moves) {
        merged.moves = [ctx.Move("Giga Impact")];
    }
    return ctx.Pokemon(name, merged);
}

function M(ctx, name, options) {
    if (options === void 0) { options = {}; }
    return ctx.Move(name, options);
}

function calcResult(ctx, title, spec) {
    return withGlobals(title, ctx.gen, function () {
        return ctx.calculate(spec.attacker(ctx), spec.defender(ctx), spec.move(ctx), spec.field ? spec.field(ctx) : ctx.Field({}));
    });
}

describe("romhack mechanics profiles", function () {
    test("registry resolves expected profiles", function () {
        expect((0, romhacks_1.getMechanicsProfile)("Unknown", 6).id).toBe("vanilla");
        expect((0, romhacks_1.getMechanicsProfile)("Cascade White", 5).id).toBe("cascade-white");
        expect((0, romhacks_1.getMechanicsProfile)("Super Cascade Hack", 6).id).toBe("cascade-white");
        expect((0, romhacks_1.getMechanicsProfile)("Platinum Kaizo", 4).id).toBe("platinum-kaizo");
        expect((0, romhacks_1.getMechanicsProfile)("Platinum Kaizo", 5).id).toBe("vanilla");
        expect((0, romhacks_1.getMechanicsProfile)("Little Emerald", 8).id).toBe("little-emerald");
        expect((0, romhacks_1.getMechanicsProfile)("Little Emerald - Hard Mode", 8).id).toBe("little-emerald");
        expect((0, romhacks_1.getMechanicsProfile)("Little Emerald", 6).id).toBe("vanilla");
        expect((0, romhacks_1.getMechanicsProfile)("Pokemon Unbound", 8).id).toBe("pokemon-unbound");
        expect((0, romhacks_1.getMechanicsProfile)("Unbound 2.1.1", 8).id).toBe("pokemon-unbound");
        expect((0, romhacks_1.getMechanicsProfile)("Pokemon Unbound", 7).id).toBe("vanilla");
    });

    (0, helper_1.inGen)(4, function (_a) {
        var gen = _a.gen, calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { gen: gen, calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test("Platinum Kaizo Eruption does not scale with HP", function () {
            var lowHpSpec = {
                attacker: function (c) { return P(c, "Typhlosion", { curHP: 1 }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Eruption"); }
            };
            var vanilla = calcResult(ctx, "NONE", lowHpSpec);
            var kaizo = calcResult(ctx, "Platinum Kaizo", lowHpSpec);
            expect(vanilla.rawDesc.moveBP).toBeLessThan(150);
            expect(kaizo.rawDesc.moveBP || kaizo.move.bp).toBe(150);
        });

        test("Platinum Kaizo per-hit base power overrides are profile-driven", function () {
            var tripleKick = {
                attacker: function (c) { return P(c, "Hitmonlee"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Triple Kick", { hits: 3 }); }
            };
            var profile = (0, romhacks_1.getMechanicsProfile)("Platinum Kaizo", 4);
            var hookCtx = {
                move: {
                    hits: 3,
                    named: function () {
                        return Array.prototype.slice.call(arguments).indexOf("Fury Cutter") !== -1;
                    }
                },
                desc: {},
                state: { hitCount: 2 }
            };
            expect(calcResult(ctx, "Platinum Kaizo", tripleKick).rawDesc.moveBP).toBe(180);
            expect((0, romhack_helpers_1.applyValueHooks)(profile, "moveBasePower", hookCtx, 30)).toBe(60);
            expect(hookCtx.desc.moveBP).toBe(120);
        });

        test("Platinum Kaizo Plate boost is stronger than vanilla", function () {
            var withPlate = {
                attacker: function (c) { return P(c, "Mew", { item: "Meadow Plate" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Energy Ball"); }
            };
            var noPlate = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Energy Ball"); }
            };
            var vanillaRatio = calcResult(ctx, "NONE", withPlate).range()[0] / calcResult(ctx, "NONE", noPlate).range()[0];
            var kaizoRatio = calcResult(ctx, "Platinum Kaizo", withPlate).range()[0] / calcResult(ctx, "Platinum Kaizo", noPlate).range()[0];
            expect(vanillaRatio).toBeLessThan(1.35);
            expect(kaizoRatio).toBeGreaterThan(1.4);
        });
    });

    (0, helper_1.inGen)(6, function (_a) {
        var gen = _a.gen, calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { gen: gen, calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test("vanilla gen56 representative damage is unchanged by unknown title", function () {
            var spec = {
                attacker: function (c) { return P(c, "Mew", { ability: "Iron Fist" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Sky Uppercut"); }
            };
            expect(calcResult(ctx, "NONE", spec).damage).toEqual(calcResult(ctx, "Unconfigured Hack", spec).damage);
        });
    });
});
