"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

global.settings = { type_chart: 4, typeChart: 4, damageGen: 4, critGen: 4, gen: 4 };
global.TITLE = "Renegade Platinum";
global.gameGen = 4;
global.pokedex = {};
global.calcingForSwitchIns = false;

const calc = require("../index");
global.typeChart = calc.TYPE_CHART[4];

function damage(moveName, hp, switchPreview, ability = "No Ability", basePower = 150) {
    const move = new calc.Move(4, moveName, { basePower });
    const attacker = new calc.Pokemon(4, "Torkoal", { level: 73, curHP: hp, ability });
    const defender = new calc.Pokemon(4, "Garchomp", { level: 78, ability: "No Ability" });
    global.calcingForSwitchIns = switchPreview;
    try {
        return calc.calculate(4, attacker, defender, move, new calc.Field());
    } finally {
        global.calcingForSwitchIns = false;
    }
}

// pokeplatinum BattleAI_PostKOSwitchIn calls CalcMoveDamage with inPower=0,
// without running CalcHPFalloffPower from Eruption/Water Spout's effect script.
for (const moveName of ["Eruption", "Water Spout"]) {
    test(`${moveName} phase 2 uses table power even for the fainted attacker`, () => {
        const fullHp = damage(moveName, undefined, false);
        for (const hp of [1, 50, undefined]) {
            const preview = damage(moveName, hp, true);
            assert.equal(preview.rawDesc.moveBP, 150);
            assert.equal(preview.rawDesc.g4Phase2BaseDamage, fullHp.rawDesc.g4Phase2BaseDamage);
        }
        assert.equal(damage(moveName, 1, true, "No Ability", 120).rawDesc.moveBP, 120);
    });

    test(`${moveName} still scales with HP during an actual attack`, () => {
        const fullHp = damage(moveName, undefined, false);
        const lowHp = damage(moveName, 1, false);
        assert.equal(fullHp.rawDesc.moveBP, 150);
        assert.equal(lowHp.rawDesc.moveBP, 1);
        assert.ok(lowHp.range()[1] < fullHp.range()[1]);
    });
}

test("phase 2 retains Blaze/Torrent's low-HP boost on top of table power", () => {
    for (const [moveName, ability] of [["Eruption", "Blaze"], ["Water Spout", "Torrent"]]) {
        const preview = damage(moveName, 1, true, ability);
        const boostedPower = damage(moveName, 1, true, "No Ability", 225);
        assert.equal(preview.rawDesc.attackerAbility, ability);
        assert.equal(preview.rawDesc.g4Phase2BaseDamage, boostedPower.rawDesc.g4Phase2BaseDamage);
    }
});

test("Gen 4 phase 2 skips HP moves with source power 1, but scores Eruption and Water Spout", () => {
    const context = {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../../js/calc_ui/switch_preview/g4.js"), "utf8"), context);
    for (const name of ["Flail", "Reversal", "Wring Out", "Crush Grip"]) {
        assert.equal(context.isGen4Phase2IgnoredMove(name), true, name);
    }
    for (const name of ["Eruption", "Water Spout", "Brine"]) {
        assert.equal(context.isGen4Phase2IgnoredMove(name), false, name);
    }
});
