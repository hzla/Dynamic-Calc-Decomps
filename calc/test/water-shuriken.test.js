"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 6, typeChart: 6 };
}

var helper_1 = require("./helper");
var types_1 = require("../data/types");

function withTitle(title, fn) {
    var keys = ["TITLE", "settings", "gameGen", "typeChart", "calcingForSwitchIns", "pokedex"];
    var previous = {};
    keys.forEach(function (key) { previous[key] = global[key]; });
    global.TITLE = title;
    global.settings = {
        type_chart: 6, typeChart: 6, damageGen: 8, critGen: 6,
        physSpecSplit: true, switchIn: 0, noSwitch: true, challengeMode: false
    };
    global.gameGen = 8;
    global.typeChart = types_1.TYPE_CHART[6];
    global.calcingForSwitchIns = false;
    global.pokedex = {};
    try {
        return fn();
    } finally {
        keys.forEach(function (key) { global[key] = previous[key]; });
    }
}

describe.each(["", "Pokemon Null 1.2", "Pokemon Null 1.2.5"])("Water Shuriken (%s)", function (title) {
    (0, helper_1.inGen)(8, function (_a) {
        var calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;

        function matchup(moveOptions, attackerOptions) {
            return withTitle(title, function () {
                var attacker = Pokemon("Greninja", Object.assign({
                    level: 38,
                    ability: "Protean",
                    nature: "Naive",
                    ivs: { hp: 31, atk: 19, def: 31, spa: 31, spd: 24, spe: 25 },
                    overrides: { baseStats: { hp: 72, atk: 95, def: 67, spa: 103, spd: 71, spe: 122 } }
                }, attackerOptions));
                var defender = Pokemon("Magcargo", {
                    level: 36, ability: "Magma Armor", nature: "Timid", item: "Focus Sash"
                });
                return calculate(attacker, defender, Move("Water Shuriken", moveOptions), Field({}));
            });
        }

        test("matches the reported 96-120 damage for two 20-BP hits", function () {
            var result = matchup({ basePower: 20, hits: 2 });
            expect(result.attacker.rawStats.spa).toBe(95);
            expect(result.defender.rawStats.spd).toBe(73);
            expect(result.defender.maxHP()).toBe(100);
            expect(result.rawDesc.moveBP).toBe(20);
            expect(result.range()).toEqual([96, 120]);
            expect(result.damage).toHaveLength(2);
            result.damage.forEach(function (rolls) {
                expect(Math.min.apply(Math, rolls)).toBe(48);
                expect(Math.max.apply(Math, rolls)).toBe(60);
            });
        });

        test.each([3, 5])("applies the configured power to every hit (%i hits)", function (hits) {
            expect(matchup({ basePower: 20, hits: hits }).range()).toEqual([48 * hits, 60 * hits]);
        });

        test("preserves the default 15-BP calculation", function () {
            var result = matchup({ hits: 2 });
            expect(result.rawDesc.moveBP).toBe(15);
            expect(result.range()).toEqual([72, 96]);
        });

        test("honors another configured base power", function () {
            expect(matchup({ basePower: 30, hits: 2 }).rawDesc.moveBP).toBe(30);
        });

        test("retains the Ash-Greninja Battle Bond power boost", function () {
            var result = matchup({ hits: 3 }, {
                name: "Greninja-Ash", ability: "Battle Bond"
            });
            expect(result.rawDesc.moveBP).toBe(20);
            expect(result.move.hits).toBe(3);
        });
    });
});
