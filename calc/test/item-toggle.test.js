"use strict";

var helper_1 = require("./helper");
var types_1 = require("../data/types");

function expectRatio(result, baseline, expected, tol) {
    if (tol === void 0) { tol = 0.02; }
    var _a = result.range(), rMin = _a[0], rMax = _a[1];
    var _b = baseline.range(), bMin = _b[0], bMax = _b[1];
    expect(Math.abs((rMin / bMin) - expected)).toBeLessThanOrEqual(tol);
    expect(Math.abs((rMax / bMax) - expected)).toBeLessThanOrEqual(tol);
}

function restoreGlobal(name, value) {
    if (typeof value === "undefined") {
        delete global[name];
    }
    else {
        global[name] = value;
    }
}

describe('Item toggle handling', function () {
    var prevGlobals;

    beforeEach(function () {
        prevGlobals = {
            TITLE: global.TITLE,
            settings: global.settings,
            gameGen: global.gameGen,
            typeChart: global.typeChart,
            FIELD_EFFECTS: global.FIELD_EFFECTS,
            pokedex: global.pokedex
        };
        global.TITLE = "NONE";
        global.settings = { type_chart: 6, typeChart: 6, damageGen: 4, critGen: 4, switchIn: 0, challengeMode: false };
        global.gameGen = 4;
        global.typeChart = types_1.TYPE_CHART[6];
        global.FIELD_EFFECTS = {};
        global.pokedex = {};
    });

    afterEach(function () {
        restoreGlobal("TITLE", prevGlobals.TITLE);
        restoreGlobal("settings", prevGlobals.settings);
        restoreGlobal("gameGen", prevGlobals.gameGen);
        restoreGlobal("typeChart", prevGlobals.typeChart);
        restoreGlobal("FIELD_EFFECTS", prevGlobals.FIELD_EFFECTS);
        restoreGlobal("pokedex", prevGlobals.pokedex);
    });

    (0, helper_1.inGen)(4, function (_a) {
        var calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;

        test('Berserk Gene boosts physical damage by 1.5x', function () {
            var field = Field({});
            var move = Move('Return');
            var defender = Pokemon('Blastoise', { item: '' });
            var boosted = calculate(
                Pokemon('Mew', { item: 'Berserk Gene' }),
                defender,
                move,
                field
            );
            var baseline = calculate(
                Pokemon('Mew', { item: '' }),
                defender,
                move,
                field
            );
            expectRatio(boosted, baseline, 1.5);
        });

        test('itemOn false treats Berserk Gene as no item', function () {
            var field = Field({});
            var move = Move('Return');
            var toggledOff = calculate(
                Pokemon('Mew', { item: 'Berserk Gene', itemOn: false }),
                Pokemon('Blastoise', { item: '' }),
                move,
                field
            );
            var baseline = calculate(
                Pokemon('Mew', { item: '' }),
                Pokemon('Blastoise', { item: '' }),
                move,
                field
            );
            expect(toggledOff.range()).toEqual(baseline.range());
        });

        test('Metronome item scales damage with consecutive uses', function () {
            var field = Field({});
            var defender = Pokemon('Blastoise', { item: '' });
            var baseline = calculate(
                Pokemon('Mew', { item: 'Metronome' }),
                defender,
                Move('Return', { timesUsedWithMetronome: 0 }),
                field
            );
            var boosted = calculate(
                Pokemon('Mew', { item: 'Metronome' }),
                defender,
                Move('Return', { timesUsedWithMetronome: 3 }),
                field
            );
            expectRatio(boosted, baseline, 1.3, 0.08);
        });
    });
});
