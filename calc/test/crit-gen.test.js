"use strict";

var index_1 = require("../index");

var previousGlobals;

function calculateCriticalDamage(damageGen, critGen, title) {
    global.gameGen = damageGen;
    global.TITLE = title || "";
    global.typeChart = index_1.TYPE_CHART[6];
    global.FIELD_EFFECTS = {};
    global.pokedex = {};
    global.get_current_in = function () { return null; };
    global.settings = {
        type_chart: 6,
        typeChart: 6,
        damageGen: damageGen,
        critGen: critGen,
        switchIn: 0,
        challengeMode: false,
        physSpecSplit: damageGen >= 4
    };

    var gen = index_1.Generations.get(damageGen);
    var move = new index_1.Move(gen, "Psychic", { isCrit: true });
    var attacker = new index_1.Pokemon(gen, "Mew", { item: "" });
    attacker.moves = [move];
    return (0, index_1.calculate)(
        gen,
        attacker,
        new index_1.Pokemon(gen, "Vulpix", { item: "" }),
        move
    ).range();
}

beforeEach(function () {
    previousGlobals = {
        gameGen: global.gameGen,
        TITLE: global.TITLE,
        settings: global.settings,
        typeChart: global.typeChart,
        FIELD_EFFECTS: global.FIELD_EFFECTS,
        pokedex: global.pokedex,
        get_current_in: global.get_current_in
    };
});

afterEach(function () {
    global.gameGen = previousGlobals.gameGen;
    global.TITLE = previousGlobals.TITLE;
    global.settings = previousGlobals.settings;
    global.typeChart = previousGlobals.typeChart;
    global.FIELD_EFFECTS = previousGlobals.FIELD_EFFECTS;
    global.pokedex = previousGlobals.pokedex;
    global.get_current_in = previousGlobals.get_current_in;
});

describe("Crit Gen damage multiplier", function () {
    test.each([
        [1, ""],
        [2, ""],
        [3, ""],
        [4, ""],
        [5, ""],
        [6, ""],
        [8, ""],
        [8, "Pokemon Null"]
    ])("damage gen %i honors the Crit Gen 6 boundary", function (damageGen, title) {
        var critGen1 = calculateCriticalDamage(damageGen, 1, title);
        var critGen5 = calculateCriticalDamage(damageGen, 5, title);
        var critGen6 = calculateCriticalDamage(damageGen, 6, title);
        var critGen8 = calculateCriticalDamage(damageGen, 8, title);

        expect(critGen1).toEqual(critGen5);
        expect(critGen6).toEqual(critGen8);
        expect(critGen5[0]).toBeGreaterThan(critGen6[0]);
        expect(critGen5[1]).toBeGreaterThan(critGen6[1]);
    });
});
