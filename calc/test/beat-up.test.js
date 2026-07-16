"use strict";

var calc = require("../index");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var PARTY = [
    { name: "Pikachu", level: 20, baseAttack: 55 },
    { name: "Machamp", level: 50, baseAttack: 130 },
    { name: "Chansey", level: 30, baseAttack: 5 }
];

function withGen(genNum, fn) {
    var previous = {
        gameGen: global.gameGen,
        settings: global.settings,
        TITLE: global.TITLE,
        typeChart: global.typeChart,
        pokedex: global.pokedex,
        params: global.params,
        calcingForSwitchIns: global.calcingForSwitchIns
    };
    global.gameGen = genNum;
    global.settings = {
        damageGen: genNum,
        critGen: genNum,
        typeChart: genNum,
        physSpecSplit: genNum >= 4
    };
    global.TITLE = "";
    global.typeChart = calc.TYPE_CHART[genNum];
    global.pokedex = {};
    global.params = new URLSearchParams();
    global.calcingForSwitchIns = false;
    try {
        return fn(calc.Generations.get(genNum));
    }
    finally {
        Object.keys(previous).forEach(function (key) {
            if (typeof previous[key] === "undefined") delete global[key];
            else global[key] = previous[key];
        });
    }
}

function makeBattle(gen, party, attackerOptions, defenderOptions) {
    var move = new calc.Move(gen, "Beat Up", { beatUpParty: party });
    var attacker = new calc.Pokemon(gen, "Umbreon", Object.assign({
        level: 50,
        item: "None",
        moves: [move]
    }, attackerOptions));
    var defender = new calc.Pokemon(gen, "Gengar", Object.assign({
        level: 50,
        item: "None",
        moves: [new calc.Move(gen, "Tackle")]
    }, defenderOptions));
    return { move: move, result: calc.calculate(gen, attacker, defender, move, new calc.Field()) };
}

describe("Beat Up", function () {
    [2, 3, 4].forEach(function (genNum) {
        test("uses each member's level/base Attack and the target's base Defense in gen " + genNum, function () {
            withGen(genNum, function (gen) {
                var boosted = makeBattle(gen, PARTY, { boosts: { atk: 6 }, item: "Choice Band" }, { boosts: { def: 6 } });
                var unboosted = makeBattle(gen, PARTY, { boosts: { atk: -6 } }, { boosts: { def: -6 } });

                expect(boosted.move.hits).toBe(3);
                expect(boosted.result.damage).toHaveLength(3);
                expect(boosted.result.damage).toEqual(unboosted.result.damage);
                expect(boosted.result.range()[0]).toBeGreaterThan(0);
                expect(boosted.result.rawDesc.hits).toBe(3);
            });
        });
    });

    [5, 6, 7, 8].forEach(function (genNum) {
        test("varies per-hit power by party base Attack in gen " + genNum, function () {
            withGen(genNum, function (gen) {
                var consoleSpy = jest.spyOn(console, "log").mockImplementation(function () {});
                try {
                    var battle = makeBattle(gen, PARTY);
                    var damage = battle.result.damage;
                    expect(battle.move.hits).toBe(3);
                    expect(damage).toHaveLength(3);
                    expect(damage[1][0]).toBeGreaterThan(damage[0][0]);
                    expect(damage[0][0]).toBeGreaterThan(damage[2][0]);

                    var changedLevels = PARTY.map(function (member, index) {
                        return Object.assign({}, member, { level: index + 1 });
                    });
                    expect(makeBattle(gen, changedLevels).result.damage).toEqual(damage);

                    var boosted = makeBattle(gen, PARTY, { boosts: { atk: 2 } });
                    expect(boosted.result.range()[1]).toBeGreaterThan(battle.result.range()[1]);
                }
                finally {
                    consoleSpy.mockRestore();
                }
            });
        });
    });

    test("preserves contributor metadata when a move is cloned", function () {
        withGen(5, function (gen) {
            var move = new calc.Move(gen, "Beat Up", { beatUpParty: PARTY });
            var clone = move.clone();
            expect(clone.hits).toBe(3);
            expect(clone.beatUpParty).toEqual(PARTY);
            expect(clone.beatUpParty).not.toBe(move.beatUpParty);
        });
    });

    test("is a regular single-hit listed-power move in Platinum Kaizo", function () {
        withGen(4, function (gen) {
            global.TITLE = "Platinum Kaizo";
            var beatUp = new calc.Move(gen, "Beat Up", {
                beatUpParty: PARTY,
                overrides: { basePower: 60, category: "Physical", type: "Dark" }
            });
            var regularMove = new calc.Move(gen, "Tackle", {
                overrides: { basePower: 60, category: "Physical", type: "Dark" }
            });
            var attacker = new calc.Pokemon(gen, "Umbreon", {
                level: 50,
                item: "None",
                moves: [beatUp]
            });
            var defender = new calc.Pokemon(gen, "Gengar", {
                level: 50,
                item: "None",
                moves: [new calc.Move(gen, "Tackle")]
            });
            var field = new calc.Field();
            var beatUpResult = calc.calculate(gen, attacker, defender, beatUp, field);
            var regularResult = calc.calculate(gen, attacker, defender, regularMove, field);

            expect(beatUpResult.move.hits).toBe(1);
            expect(beatUpResult.move.beatUpParty).toBeUndefined();
            expect(beatUpResult.damage).toEqual(regularResult.damage);
            expect(Array.isArray(beatUpResult.damage[0])).toBe(false);
        });
    });

    ["Emerald Imperium 1.3", "Radical Red 4.1 Hardcore"].forEach(function (title) {
        test("uses listed base power and multihit data for the " + title + " family", function () {
            withGen(8, function (gen) {
                global.TITLE = title;
                var overrides = { basePower: 25, category: "Physical", type: "Dark", multihit: [2, 5] };
                var beatUp = new calc.Move(gen, "Beat Up", {
                    beatUpParty: PARTY,
                    hits: 4,
                    overrides: overrides
                });
                var regularMove = new calc.Move(gen, "Tackle", {
                    hits: 4,
                    overrides: overrides
                });
                var attacker = new calc.Pokemon(gen, "Umbreon", {
                    level: 50,
                    item: "None",
                    moves: [beatUp]
                });
                var defender = new calc.Pokemon(gen, "Gengar", {
                    level: 50,
                    item: "None",
                    moves: [new calc.Move(gen, "Tackle")]
                });
                var field = new calc.Field();
                var beatUpResult = calc.calculate(gen, attacker, defender, beatUp, field);
                var regularResult = calc.calculate(gen, attacker, defender, regularMove, field);

                expect(beatUpResult.move.hits).toBe(4);
                expect(beatUpResult.move.beatUpParty).toBeUndefined();
                expect(beatUpResult.damage).toHaveLength(4);
                expect(beatUpResult.damage).toEqual(regularResult.damage);
            });
        });
    });

    test("labels every roll group with its contributing party member", function () {
        var source = fs.readFileSync(path.join(__dirname, "../../js/index_randoms_controls.js"), "utf8");
        var start = source.indexOf("function getBeatUpHitLabels");
        var end = source.indexOf("function normalizeDamageForDisplay");
        var context = {
            Array: Array,
            settings: { damageGen: 4 },
            toOrdinal: function (value) {
                return value === 1 ? "1st" : value === 2 ? "2nd" : value === 3 ? "3rd" : value + "th";
            }
        };
        vm.createContext(context);
        vm.runInContext(source.slice(start, end), context);

        var text = context.displayDamageHits([[3, 4], [7, 8], [2, 3]], ["Pikachu", "Machamp", "Chansey"]);
        expect(text).toContain("1st Hit (Pikachu): 3, 4");
        expect(text).toContain("2nd Hit (Machamp): 7, 8");
        expect(text).toContain("3rd Hit (Chansey): 2, 3");
        expect(text.split("\n")).toEqual([
            "1st Hit (Pikachu): 3, 4",
            "2nd Hit (Machamp): 7, 8",
            "3rd Hit (Chansey): 2, 3"
        ]);
        expect(context.displayDamageHits([3, 4, 5], ["Pikachu"])).toBe("1st Hit (Pikachu): 3, 4, 5");
    });
});
