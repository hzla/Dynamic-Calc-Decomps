"use strict";

global.settings = { type_chart: 3, typeChart: 3, damageGen: 3, critGen: 5, gen: 3 };
global.TITLE = "";
global.gameGen = 3;
global.pokedex = {};
global.calcingForSwitchIns = false;

var calc = require("../index");

function attacker(move) {
    return new calc.Pokemon(3, "Absol", {
        item: "",
        nature: "Adamant",
        evs: { atk: 252 },
        moves: [move]
    });
}

function defender() {
    return new calc.Pokemon(3, "Blissey", {
        item: "",
        nature: "Bold",
        evs: { hp: 252, def: 252 }
    });
}

function calculateWithSplit(move, enabled) {
    global.settings.physSpecSplit = enabled;
    return calc.calculate(3, attacker(move), defender(), move, new calc.Field({}));
}

function gen5Abomasnow(move) {
    return new calc.Pokemon(5, "Abomasnow", {
        item: "",
        nature: "Hardy",
        evs: { atk: 0, spa: 0 },
        moves: [move]
    });
}

function gen5Golem() {
    return new calc.Pokemon(5, "Golem", {
        item: "",
        nature: "Hardy",
        ivs: { hp: 4, spd: 4 },
        evs: { hp: 0, spd: 0 }
    });
}

describe("phys/spec split setting", function () {
    beforeEach(function () {
        global.settings.type_chart = 3;
        global.settings.typeChart = 3;
        global.settings.damageGen = 3;
        global.gameGen = 3;
        global.typeChart = calc.TYPE_CHART[3];
    });

    test("uses type-based categories when the split is disabled", function () {
        var move = new calc.Move(3, "Crunch", { overrides: { category: "Physical" } });
        var result = calculateWithSplit(move, false);

        expect(result.move.category).toBe("Special");
        expect(result.damage[0]).toBeLessThan(100);
    });

    test("uses move-data categories when the split is enabled", function () {
        var move = new calc.Move(3, "Crunch", { overrides: { category: "Physical" } });
        var result = calculateWithSplit(move, true);

        expect(result.move.category).toBe("Physical");
        expect(result.damage[0]).toBeGreaterThan(200);
    });

    test("treats Fairy as special when the split is disabled", function () {
        global.settings.type_chart = 6;
        global.settings.typeChart = 6;
        global.typeChart = calc.TYPE_CHART[6];

        var move = new calc.Move(3, "Crunch", {
            overrides: { type: "Fairy", category: "Physical" }
        });
        var result = calculateWithSplit(move, false);

        expect(result.move.category).toBe("Special");
        expect(result.damage[0]).toBeLessThan(100);
    });

    test("uses type-based categories in gen 5 when the split is disabled", function () {
        global.gameGen = 5;
        global.settings.damageGen = 5;
        global.settings.type_chart = 5;
        global.settings.typeChart = 5;
        global.settings.physSpecSplit = false;
        global.typeChart = calc.TYPE_CHART[5];

        var gigaDrain = new calc.Move(5, "Giga Drain", {
            overrides: { basePower: 80, type: "Grass" }
        });
        var seedBomb = new calc.Move(5, "Seed Bomb", {
            overrides: { basePower: 80, type: "Grass" }
        });
        var gigaDrainResult = calc.calculate(5, gen5Abomasnow(gigaDrain), gen5Golem(), gigaDrain, new calc.Field({}));
        var seedBombResult = calc.calculate(5, gen5Abomasnow(seedBomb), gen5Golem(), seedBomb, new calc.Field({}));

        expect(gigaDrain.category).toBe("Special");
        expect(seedBomb.category).toBe("Special");
        expect(seedBombResult.damage).toEqual(gigaDrainResult.damage);
    });
});
