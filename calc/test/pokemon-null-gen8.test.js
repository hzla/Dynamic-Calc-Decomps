"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 6, typeChart: 6 };
}

var helper_1 = require("./helper");
var types_1 = require("../data/types");

function withNullGlobals(fn) {
    var prev = {
        TITLE: global.TITLE,
        settings: global.settings,
        gameGen: global.gameGen,
        typeChart: global.typeChart,
        calcingForSwitchIns: global.calcingForSwitchIns,
        pokedex: global.pokedex
    };
    global.TITLE = "Pokemon Null 1.2";
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

describe("Pokemon Null gen8 mechanics", function () {
    (0, helper_1.inGen)(8, function (_a) {
        var calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;

        function calcBlazeKick(attackerOptions) {
            return withNullGlobals(function () {
                var attacker = Pokemon("Cinderace", Object.assign({
                    level: 44,
                    ability: "Protean",
                    item: "",
                    nature: "Serious",
                    moves: [Move("Blaze Kick")]
                }, attackerOptions));
                var defender = Pokemon("Abomasnow", {
                    level: 44,
                    item: "",
                    nature: "Serious"
                });
                return calculate(attacker, defender, Move("Blaze Kick"), Field({}));
            });
        }

        test("Protean toggle does not double-count existing STAB", function () {
            var baseline = calcBlazeKick({ abilityOn: false });
            var proteanOn = calcBlazeKick({ abilityOn: true });
            expect(proteanOn.damage).toEqual(baseline.damage);
        });

        test("Protean toggle still grants STAB when current type is not the move type", function () {
            var baseline = calcBlazeKick({ abilityOn: false });
            var typelessProtean = calcBlazeKick({
                abilityOn: true,
                overrides: { types: ["???"] }
            });
            expect(typelessProtean.damage).toEqual(baseline.damage);
        });
    });
});
