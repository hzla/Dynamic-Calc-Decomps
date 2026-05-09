"use strict";

global.settings = { type_chart: 6, typeChart: 6, damageGen: 8, critGen: 8, gen: 8 };
global.TITLE = "";
global.gameGen = 8;
global.pokedex = {};
global.calcingForSwitchIns = false;

var calc = require("../index");
var field_1 = require("../field");

global.typeChart = calc.TYPE_CHART[6];

function makePokemon(gen, name) {
    return new calc.Pokemon(gen, name, {
        item: "",
        moves: [new calc.Move(gen, "Hyper Beam")]
    });
}

describe("inverse battles", function () {
    beforeEach(function () {
        global.settings.invertTypes = false;
    });

    [3, 4, 5, 6, 7, 8].forEach(function (gen) {
        test("inverts type immunities in gen " + gen, function () {
            global.gameGen = gen;
            global.settings.damageGen = gen;
            var normal = calc.calculate(
                gen,
                makePokemon(gen, "Snorlax"),
                makePokemon(gen, "Gengar"),
                new calc.Move(gen, "Hyper Beam"),
                new field_1.Field({})
            );
            var inverse = calc.calculate(
                gen,
                makePokemon(gen, "Snorlax"),
                makePokemon(gen, "Gengar"),
                new calc.Move(gen, "Hyper Beam"),
                new field_1.Field({ inverse: true })
            );
            expect(normal.damage).toBe(0);
            expect(inverse.damage[0]).toBeGreaterThan(0);
        });
    });

    test("invertTypes setting makes default fields inverse", function () {
        global.gameGen = 8;
        global.settings.damageGen = 8;
        global.settings.invertTypes = true;

        var result = calc.calculate(
            8,
            makePokemon(8, "Snorlax"),
            makePokemon(8, "Gengar"),
            new calc.Move(8, "Hyper Beam"),
            new field_1.Field({})
        );

        expect(result.field.isInverse).toBe(true);
        expect(result.damage[0]).toBeGreaterThan(0);
    });
});
