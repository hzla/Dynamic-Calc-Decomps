"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
global.settings = { gen: 3, damageGen: 3, critGen: 5, type_chart: 3, typeChart: 3, physSpecSplit: false };
global.TITLE = "Emerald but Bad";
global.gameGen = 3;
global.pokedex = {};
global.calcingForSwitchIns = false;
const calc = require("../index");
global.typeChart = calc.TYPE_CHART[3];

function matchup(defenderSwitching, attackerSwitching, name = "Pursuit") {
    const attacker = new calc.Pokemon(3, "Sharpedo", {
        level: 68, nature: "Timid", ability: "Speed Boost", item: "Black Glasses",
        overrides: { baseStats: { hp: 80, atk: 120, def: 75, spa: 120, spd: 75, spe: 95 } }
    });
    const defender = new calc.Pokemon(3, "Tangela", {
        level: 68, nature: "Brave", ability: "Chlorophyll", item: "Leftovers",
        ivs: { hp: 31, atk: 22, def: 1, spa: 12, spd: 3, spe: 9 },
        overrides: { baseStats: { hp: 105, atk: 100, def: 125, spa: 110, spd: 90, spe: 60 } }
    });
    const move = new calc.Move(3, name, { overrides: { basePower: 50 } });
    const field = new calc.Field({ defenderSide: { isSwitching: defenderSwitching }, attackerSide: { isSwitching: attackerSwitching } });
    return calc.calculate(3, attacker, defender, move, field);
}

test("reported Sharpedo matchup doubles Pursuit damage when the checkbox supplies true", () => {
    const normal = matchup(false), switching = matchup(true);
    assert.deepEqual(normal.range(), [61, 72]);
    // Emerald doubles damage before STAB and random variation, not base power.
    assert.deepEqual(switching.damage, Array.from({ length: 16 }, (_, i) => Math.floor(144 * (85 + i) / 100)));
    assert.equal(switching.rawDesc.isSwitching, "out");
    assert.equal(switching.move.category, "Special");
    assert.deepEqual(matchup("out").damage, switching.damage);
});

test("only a departing defender activates Pursuit, and other moves are unaffected", () => {
    const normal = matchup(false).damage;
    for (const value of [undefined, false, "in"]) assert.deepEqual(matchup(value).damage, normal);
    assert.deepEqual(matchup(false, true).damage, normal);
    assert.deepEqual(matchup(true, false, "Bite").damage, matchup(false, false, "Bite").damage);
});
