"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 6, typeChart: 6 };
}

var calc = require("../index");

describe("Hardlove gem boosts", function () {
    var previous;
    beforeEach(function () {
        previous = {};
        ['TITLE', 'settings', 'gameGen', 'typeChart', 'FIELD_EFFECTS', 'pokedex', 'calcingForSwitchIns'].forEach(function (key) {
            previous[key] = global[key];
        });
        global.TITLE = 'Hardlove Gold';
        global.settings = { type_chart: 6, typeChart: 6, damageGen: 8, critGen: 6, switchIn: 0, challengeMode: false };
        global.gameGen = 8;
        global.typeChart = calc.TYPE_CHART[6];
        global.FIELD_EFFECTS = {};
        global.pokedex = {};
        global.calcingForSwitchIns = false;
    });

    afterEach(function () {
        Object.keys(previous).forEach(function (key) {
            if (previous[key] === undefined) delete global[key];
            else global[key] = previous[key];
        });
    });

    function result(gen, item, power, options, moveName, species) {
        global.gameGen = gen;
        global.settings.damageGen = gen;
        var move = new calc.Move(gen, moveName || 'Water Pulse', { basePower: power || 80 });
        var attacker = new calc.Pokemon(gen, species || 'Mew', Object.assign({
            ability: 'No Ability', item: item, moves: [move]
        }, options));
        var defender = new calc.Pokemon(gen, 'Mew', { ability: 'No Ability', item: '', moves: [move] });
        return calc.calculate(gen, attacker, defender, move, new calc.Field());
    }

    [5, 6, 8].forEach(function (gen) {
        test.each(['Hardlove Gold', 'HARD LOVE GOLD', 'Pokemon Hard-Love Gold v2'])(
            'gen ' + gen + ' gives matching gems 50%% in %s', function (title) {
                global.TITLE = title;
                var boosted = result(gen, 'Water Gem');
                expect(boosted.damage).toEqual(result(gen, '', 120).damage);
                expect(boosted.rawDesc.attackerItem).toBe('Water Gem');
                expect(result(gen, 'Normal Gem', 80, {}, 'Tackle').damage)
                    .toEqual(result(gen, '', 120, {}, 'Tackle').damage);
            }
        );

        test('gen ' + gen + ' only boosts active gems matching the move type', function () {
            var baseline = result(gen, '').damage;
            expect(result(gen, 'Fire Gem').damage).toEqual(baseline);
            expect(result(gen, 'Water Gem', 80, { itemOn: false }).damage).toEqual(baseline);
            expect(result(gen, 'Water Gem', 80, { ability: 'Klutz' }).damage).toEqual(baseline);
        });

        test.each(['Heart Gold Engine Rom', 'Hard Gold'])(
            'gen ' + gen + ' keeps the default gem boost in %s', function (title) {
                global.TITLE = title;
                expect(result(gen, 'Water Gem').damage).toEqual(result(gen, '', gen === 5 ? 120 : 104).damage);
            }
        );
    });

    test('keeps the existing Radical Red 50% gem boost', function () {
        global.TITLE = 'Radical Red';
        expect(result(8, 'Water Gem').damage).toEqual(result(8, '', 120).damage);
    });

    test('does not change non-gem items sharing the modern gem branch', function () {
        var hardlove = result(8, 'Electirizer', 80, {}, 'Brick Break', 'Electivire');
        global.TITLE = 'Heart Gold Engine Rom';
        expect(hardlove.damage).toEqual(result(8, 'Electirizer', 80, {}, 'Brick Break', 'Electivire').damage);
    });

    test('also gives Tera Gem 50% where it is supported', function () {
        expect(result(6, 'Tera Gem', 80, {}, 'Water Pulse', 'Blastoise').damage)
            .toEqual(result(6, '', 120, {}, 'Water Pulse', 'Blastoise').damage);
    });
});
