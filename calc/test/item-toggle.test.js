"use strict";

var helper_1 = require("./helper");

function expectRatio(result, baseline, expected, tol) {
    if (tol === void 0) { tol = 0.02; }
    var _a = result.range(), rMin = _a[0], rMax = _a[1];
    var _b = baseline.range(), bMin = _b[0], bMax = _b[1];
    expect(Math.abs((rMin / bMin) - expected)).toBeLessThanOrEqual(tol);
    expect(Math.abs((rMax / bMax) - expected)).toBeLessThanOrEqual(tol);
}

describe('Item toggle handling', function () {
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
    });
});
