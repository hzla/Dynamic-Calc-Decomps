"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 8, typeChart: 8 };
}

var helper_1 = require("./helper");
var types_1 = require("../data/types");
var gen789_1 = require("../mechanics/gen789");
var vanilla_gen789_1 = require("../mechanics/vanilla/gen789");

var DEFAULT_SETTINGS = {
    type_chart: 8,
    typeChart: 8,
    damageGen: 8,
    critGen: 8,
    challengeMode: false,
    switchIn: 0,
    levelCaps: [],
    challengeExceptionListPresent: false
};

function withGlobals(title, overrides, fn) {
    var prev = {
        TITLE: global.TITLE,
        settings: global.settings,
        gameGen: global.gameGen,
        typeChart: global.typeChart,
        calcingForSwitchIns: global.calcingForSwitchIns,
        p1Name: global.p1Name,
        localStorage: global.localStorage,
        backup_moves: global.backup_moves,
        pokedex: global.pokedex,
        $: global.$
    };
    var settings = Object.assign({}, DEFAULT_SETTINGS, (overrides && overrides.settings) || {});
    global.TITLE = title;
    global.settings = settings;
    global.gameGen = settings.damageGen || 8;
    global.typeChart = types_1.TYPE_CHART[settings.typeChart];
    global.calcingForSwitchIns = false;
    global.p1Name = "Player 1";
    global.localStorage = { dynamicTypeBug: "0" };
    global.backup_moves = {};
    global.pokedex = {};
    global.$ = function () { return ({ val: function () { return ""; } }); };
    try {
        return fn();
    }
    finally {
        global.TITLE = prev.TITLE;
        global.settings = prev.settings;
        global.gameGen = prev.gameGen;
        global.typeChart = prev.typeChart;
        global.calcingForSwitchIns = prev.calcingForSwitchIns;
        global.p1Name = prev.p1Name;
        global.localStorage = prev.localStorage;
        global.backup_moves = prev.backup_moves;
        global.pokedex = prev.pokedex;
        global.$ = prev.$;
    }
}

function calcResult(ctx, title, spec, overrides) {
    return withGlobals(title, overrides, function () {
        var attacker = spec.attacker(ctx);
        var defender = spec.defender(ctx);
        var move = spec.move(ctx);
        var field = spec.field ? spec.field(ctx) : ctx.Field({});
        return ctx.calculate(attacker, defender, move, field);
    });
}

function expectRatio(result, baseline, expected, tol) {
    if (tol === void 0) { tol = 0.03; }
    if (Array.isArray(result.damage) && Array.isArray(baseline.damage)) {
        var ratios = [];
        for (var i = 0; i < result.damage.length; i++) {
            if (baseline.damage[i] > 0) {
                ratios.push(result.damage[i] / baseline.damage[i]);
            }
        }
        var avgRatio = ratios.reduce(function (sum, ratio) { return sum + ratio; }, 0) / ratios.length;
        expect(Math.abs(avgRatio - expected)).toBeLessThanOrEqual(tol);
        return;
    }
    var _a = result.range(), rMin = _a[0], rMax = _a[1];
    var _b = baseline.range(), bMin = _b[0], bMax = _b[1];
    var midRatio = ((rMin + rMax) / 2) / ((bMin + bMax) / 2);
    expect(Math.abs(midRatio - expected)).toBeLessThanOrEqual(tol);
}

function expectZero(result) {
    var _a = result.range(), min = _a[0], max = _a[1];
    expect(min).toBe(0);
    expect(max).toBe(0);
}

function expectNonZero(result) {
    expect(result.range()[1]).toBeGreaterThan(0);
}

function P(ctx, name, options) {
    if (options === void 0) { options = {}; }
    var merged = Object.assign({ ability: "No Ability", item: "", abilityOn: true, level: 100, nature: "Serious", moves: ["Giga Impact"] }, options);
    var moveList = merged.moves || ["Giga Impact"];
    merged.moves = moveList.map(function (moveName) {
        return typeof moveName === "string" ? ctx.Move(moveName, { ability: merged.ability, item: merged.item }) : moveName;
    });
    return ctx.Pokemon(name, merged);
}

function M(ctx, name, options) {
    if (options === void 0) { options = {}; }
    return ctx.Move(name, options);
}

describe("Little Emerald gen789 mechanics", function () {
    (0, helper_1.inGen)(8, function (_a) {
        var gen = _a.gen, calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { gen: gen, calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test("routes Little Emerald calculations through vanilla gen789", function () {
            withGlobals("Little Emerald - Hard Mode", null, function () {
                var original = vanilla_gen789_1.calculateSMSSSVVanilla;
                var marker = { damage: 123 };
                var called = false;
                vanilla_gen789_1.calculateSMSSSVVanilla = function () {
                    called = true;
                    return marker;
                };
                try {
                    expect(gen789_1.calculateSMSSSV(gen, {}, {}, {}, {})).toBe(marker);
                    expect(called).toBe(true);
                }
                finally {
                    vanilla_gen789_1.calculateSMSSSVVanilla = original;
                }
            });
        });

        test("all mega stones resist Knock Off even on non-native holders", function () {
            var spec = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew", { item: "Houndoominite" }); },
                move: function (c) { return M(c, "Knock Off"); }
            };
            var vanilla = calcResult(ctx, "NONE", spec);
            var little = calcResult(ctx, "Little Emerald", spec);
            expect(vanilla.rawDesc.moveBP).toBeGreaterThan(little.rawDesc.moveBP);
            expect(little.rawDesc.moveBP).toBe(65);
        });

        test("baby mega stones also resist Knock Off on non-native holders", function () {
            var spec = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew", { item: "Electirizer" }); },
                move: function (c) { return M(c, "Knock Off"); }
            };
            expect(calcResult(ctx, "Little Emerald", spec).rawDesc.moveBP).toBe(65);
        });

        test("Pichu Light Incense boosts special attack by 50%", function () {
            var withItem = {
                attacker: function (c) { return P(c, "Pichu", { item: "Light Incense" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Thunderbolt"); }
            };
            var withoutItem = {
                attacker: function (c) { return P(c, "Pichu"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Thunderbolt"); }
            };
            expectRatio(calcResult(ctx, "Little Emerald", withItem), calcResult(ctx, "Little Emerald", withoutItem), 1.5);
        });

        test("Normalize lets Normal moves hit Ghost types", function () {
            var spec = {
                attacker: function (c) { return P(c, "Mew", { ability: "Normalize" }); },
                defender: function (c) { return P(c, "Gengar"); },
                move: function (c) { return M(c, "Tackle"); }
            };
            expectZero(calcResult(ctx, "NONE", spec));
            expectNonZero(calcResult(ctx, "Little Emerald", spec));
        });

        test("Steam Engine grants Fire and Water immunity", function () {
            var fireSpec = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew", { ability: "Steam Engine" }); },
                move: function (c) { return M(c, "Flamethrower"); }
            };
            var waterSpec = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew", { ability: "Steam Engine" }); },
                move: function (c) { return M(c, "Surf"); }
            };
            expectZero(calcResult(ctx, "Little Emerald", fireSpec));
            expectZero(calcResult(ctx, "Little Emerald", waterSpec));
        });

        test("Happiny Lucky Punch forces critical hits", function () {
            var spec = {
                attacker: function (c) { return P(c, "Happiny", { item: "Lucky Punch" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Tackle"); }
            };
            expect(calcResult(ctx, "Little Emerald", spec).rawDesc.isCritical).toBe(true);
        });

        test("Protector and Magma Armor prevent critical hits", function () {
            var protectorSpec = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Rhyhorn", { item: "Protector" }); },
                move: function (c) { return M(c, "Slash", { isCrit: true }); }
            };
            var magmaArmorSpec = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Magcargo", { ability: "Magma Armor" }); },
                move: function (c) { return M(c, "Slash", { isCrit: true }); }
            };
            expect(calcResult(ctx, "Little Emerald", protectorSpec).rawDesc.isCritical).toBeUndefined();
            expect(calcResult(ctx, "Little Emerald", magmaArmorSpec).rawDesc.isCritical).toBeUndefined();
        });

        test("Huge Power quadruples physical attack", function () {
            var withAbility = {
                attacker: function (c) { return P(c, "Mew", { ability: "Huge Power" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Tackle"); }
            };
            var withoutAbility = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Tackle"); }
            };
            expectRatio(calcResult(ctx, "Little Emerald", withAbility), calcResult(ctx, "Little Emerald", withoutAbility), 4.0, 0.08);
        });

        test("Eviolite only boosts physical defense", function () {
            var physical = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Chansey", { item: "Eviolite" }); },
                move: function (c) { return M(c, "Tackle"); }
            };
            var special = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Chansey", { item: "Eviolite" }); },
                move: function (c) { return M(c, "Thunderbolt"); }
            };
            var noItemPhysical = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Chansey"); },
                move: function (c) { return M(c, "Tackle"); }
            };
            var noItemSpecial = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Chansey"); },
                move: function (c) { return M(c, "Thunderbolt"); }
            };
            expect(calcResult(ctx, "Little Emerald", physical).range()[1]).toBeLessThan(calcResult(ctx, "Little Emerald", noItemPhysical).range()[1]);
            expect(calcResult(ctx, "Little Emerald", special).damage).toEqual(calcResult(ctx, "Little Emerald", noItemSpecial).damage);
        });

        test("Wynaut Lax Incense applies Lagging Tail-style move order", function () {
            var withItem = {
                attacker: function (c) { return P(c, "Wynaut", { item: "Lax Incense" }); },
                defender: function (c) { return P(c, "Shuckle", { evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } }); },
                move: function (c) { return M(c, "Payback"); }
            };
            var withoutItem = {
                attacker: function (c) { return P(c, "Wynaut"); },
                defender: function (c) { return P(c, "Shuckle", { evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } }); },
                move: function (c) { return M(c, "Payback"); }
            };
            expectRatio(calcResult(ctx, "Little Emerald", withItem), calcResult(ctx, "Little Emerald", withoutItem), 2.0, 0.06);
        });

        test("sound-boosting items raise sound move damage by 20%", function () {
            var withItem = {
                attacker: function (c) { return P(c, "Mew", { item: "Yellow Flute" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Hyper Voice"); }
            };
            var withoutItem = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Hyper Voice"); }
            };
            expectRatio(calcResult(ctx, "Little Emerald", withItem), calcResult(ctx, "Little Emerald", withoutItem), 1.2, 0.03);
        });

        test("non-specific baby mega stones are not species-locked", function () {
            var withItem = {
                attacker: function (c) { return P(c, "Mew", { item: "Electirizer" }); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Thunderbolt"); }
            };
            var withoutItem = {
                attacker: function (c) { return P(c, "Mew"); },
                defender: function (c) { return P(c, "Mew"); },
                move: function (c) { return M(c, "Thunderbolt"); }
            };
            expectRatio(calcResult(ctx, "Little Emerald", withItem), calcResult(ctx, "Little Emerald", withoutItem), 1.2, 0.03);
        });
    });
});
