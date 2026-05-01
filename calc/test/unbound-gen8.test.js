"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 6, typeChart: 6 };
}

var helper_1 = require("./helper");
var types_1 = require("../data/types");

function withGlobals(title, fn) {
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
        type_chart: 6,
        typeChart: 6,
        damageGen: 8,
        critGen: 6,
        switchIn: 0,
        noSwitch: true,
        challengeMode: false
    };
    global.gameGen = 8;
    global.typeChart = types_1.TYPE_CHART[6];
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
    var merged = Object.assign({ ability: "No Ability", item: "", level: 100, nature: "Serious", moves: [ctx.Move("Giga Impact")] }, options);
    return ctx.Pokemon(name, merged);
}

function M(ctx, name, options) {
    if (options === void 0) { options = {}; }
    return ctx.Move(name, options);
}

function F(ctx, options) {
    if (options === void 0) { options = {}; }
    return ctx.Field(options);
}

function calcResult(ctx, title, spec) {
    return withGlobals(title, function () {
        return ctx.calculate(spec.attacker(ctx), spec.defender(ctx), spec.move(ctx), spec.field ? spec.field(ctx) : ctx.Field({}));
    });
}

function expectRatio(result, baseline, expected, tol) {
    if (tol === void 0) { tol = 0.03; }
    var resultRange = result.range();
    var baseRange = baseline.range();
    expect(Math.abs(resultRange[0] / baseRange[0] - expected)).toBeLessThanOrEqual(tol);
    expect(Math.abs(resultRange[1] / baseRange[1] - expected)).toBeLessThanOrEqual(tol);
}

function expectNonZero(result) {
    expect(result.range()[1]).toBeGreaterThan(0);
}

describe("Pokemon Unbound gen8 mechanics", function () {
    (0, helper_1.inGen)(8, function (_a) {
        var gen = _a.gen, calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { gen: gen, calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test("Weather Ball becomes Rock in Vicious Sandstorm", function () {
            var result = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Weather Ball"); },
                field: function (c) { return F(c, { weather: "Vicious Sandstorm" }); }
            });
            expect(result.rawDesc.moveType).toBe("Rock");
        });

        test("Sand Force is boosted in Vicious Sandstorm", function () {
            var boosted = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew", { ability: "Sand Force" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Stone Edge"); },
                field: function (c) { return F(c, { weather: "Vicious Sandstorm" }); }
            });
            var baseline = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Stone Edge"); },
                field: function (c) { return F(c, { weather: "Vicious Sandstorm" }); }
            });
            expectRatio(boosted, baseline, 5325 / 4096);
        });

        test("Vicious Sandstorm boosts special bulk for Rock and Ground defenders", function () {
            var boosted = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Golem"); },
                move: function (c) { return M(c, "Flash Cannon"); },
                field: function (c) { return F(c, { weather: "Vicious Sandstorm" }); }
            });
            var baseline = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Golem"); },
                move: function (c) { return M(c, "Flash Cannon"); }
            });
            expectRatio(boosted, baseline, 2 / 3, 0.04);
        });

        test("Inverse Battle flips immunity matchups", function () {
            var inverse = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Umbreon"); },
                move: function (c) { return M(c, "Psychic"); },
                field: function (c) { return F(c, { isInverse: true }); }
            });
            expectNonZero(inverse);
        });

        test("Shadowy Veil reduces damage to Ghost defenders", function () {
            var veiled = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Gengar"); },
                move: function (c) { return M(c, "Dark Pulse"); },
                field: function (c) { return F(c, { isShadowyVeil: true }); }
            });
            var baseline = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Gengar"); },
                move: function (c) { return M(c, "Dark Pulse"); }
            });
            expectRatio(veiled, baseline, 0.5);
        });

        test("Portal Power reduces non-contact damage", function () {
            var reduced = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew", { ability: "Portal Power" }); },
                move: function (c) { return M(c, "Psychic"); }
            });
            var baseline = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Psychic"); }
            });
            expectRatio(reduced, baseline, 0.75);
        });

        test("Bellow matches Punk Rock for sound move offense", function () {
            var bellow = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew", { ability: "Bellow" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Hyper Voice"); }
            });
            var punkRock = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew", { ability: "Punk Rock" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Hyper Voice"); }
            });
            expect(bellow.damage).toEqual(punkRock.damage);
        });

        test("Non-Unbound gen8 damage stays on the current baseline", function () {
            var vanilla = calcResult(ctx, "NONE", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Thunderbolt"); }
            });
            var unbound = calcResult(ctx, "Pokemon Unbound", {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Thunderbolt"); }
            });
            expect(unbound.damage).toEqual(vanilla.damage);
        });
    });
});
