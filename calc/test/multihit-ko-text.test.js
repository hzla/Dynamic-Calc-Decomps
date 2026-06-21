"use strict";

var calc = require("../index");

describe("multi-hit KO text", function () {
    [4, 5, 6].forEach(function (genNum) {
        test("uses selected 2-hit damage once in gen " + genNum, function () {
            var gen = calc.Generations.get(genNum);
            var attacker = new calc.Pokemon(gen, "Turtwig", { level: 16 });
            var defender = new calc.Pokemon(gen, "Onix", {
                level: 15,
                ivs: { hp: 29 }
            });
            var move = new calc.Move(gen, "Bullet Seed", { hits: 2 });
            var field = new calc.Field();
            var perHit = [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 24];
            var result = new calc.Result(gen, attacker, defender, move, field, [perHit, perHit], {
                attackerName: "Turtwig",
                defenderName: "Onix",
                moveName: "Bullet Seed"
            });

            var desc = result.desc();

            expect(desc).toContain("32-48 (82 - 123%) -- 6.3% chance to OHKO");
            expect(desc).not.toContain("guaranteed OHKO");
            expect(result.kochance(false).text).toBe("6.3% chance to OHKO");
        });
    });

    [5, 6].forEach(function (genNum) {
        test("does not double-count per-hit rolls in gen " + genNum, function () {
            var gen = calc.Generations.get(genNum);
            var attacker = new calc.Pokemon(gen, "Turtwig", { level: 16 });
            var defender = new calc.Pokemon(gen, "Onix", {
                level: 15,
                ivs: { hp: 29 }
            });
            var move = new calc.Move(gen, "Bullet Seed", { hits: 2 });
            var field = new calc.Field();
            var perHit = [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 24];
            var result = new calc.Result(gen, attacker, defender, move, field, perHit, {
                attackerName: "Turtwig",
                defenderName: "Onix",
                moveName: "Bullet Seed"
            });

            var desc = result.desc();

            expect(desc).toContain("32-48 (82 - 123%) -- 6.3% chance to OHKO");
            expect(desc).not.toContain("guaranteed OHKO");
        });
    });
});
