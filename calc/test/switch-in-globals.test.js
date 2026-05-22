"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 8, typeChart: 8 };
}

var helper_1 = require("./helper");
var types_1 = require("../data/types");

function P(ctx, name, options) {
    if (options === void 0) { options = {}; }
    var merged = Object.assign({ ability: "No Ability", item: "", level: 50, nature: "Serious", moves: [ctx.Move("Tackle")] }, options);
    return ctx.Pokemon(name, merged);
}

describe("switch-in calculation globals", function () {
    (0, helper_1.inGen)(8, function (_a) {
        var gen = _a.gen, calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { gen: gen, calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test("does not require p1Name before Gen 4 preview initializes it", function () {
            var prev = {
                TITLE: global.TITLE,
                settings: global.settings,
                gameGen: global.gameGen,
                typeChart: global.typeChart,
                calcingForSwitchIns: global.calcingForSwitchIns,
                p1Name: global.p1Name,
                dynamicTypeBugActive: global.dynamicTypeBugActive,
                localStorage: global.localStorage,
                backup_moves: global.backup_moves,
                pokedex: global.pokedex,
                $: global.$
            };
            global.TITLE = "HG Engine";
            global.settings = { type_chart: 8, typeChart: 8, damageGen: 8, critGen: 8, switchIn: 0, challengeMode: false };
            global.gameGen = 8;
            global.typeChart = types_1.TYPE_CHART[8];
            global.calcingForSwitchIns = true;
            delete global.p1Name;
            delete global.dynamicTypeBugActive;
            delete global.localStorage;
            global.backup_moves = {};
            global.pokedex = {};
            global.$ = function () { return ({ val: function () { return ""; } }); };

            try {
                var result = ctx.calculate(
                    P(ctx, "Bulbasaur"),
                    P(ctx, "Charmander"),
                    Move("Tackle"),
                    Field({})
                );
                expect(result.range()[1]).toBeGreaterThan(0);
            }
            finally {
                global.TITLE = prev.TITLE;
                global.settings = prev.settings;
                global.gameGen = prev.gameGen;
                global.typeChart = prev.typeChart;
                global.calcingForSwitchIns = prev.calcingForSwitchIns;
                global.p1Name = prev.p1Name;
                global.dynamicTypeBugActive = prev.dynamicTypeBugActive;
                global.localStorage = prev.localStorage;
                global.backup_moves = prev.backup_moves;
                global.pokedex = prev.pokedex;
                global.$ = prev.$;
            }
        });
    });
});
