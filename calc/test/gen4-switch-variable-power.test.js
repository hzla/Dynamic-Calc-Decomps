"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

global.settings = { type_chart: 4, typeChart: 4, damageGen: 4, critGen: 4, gen: 4 };
global.TITLE = "Platinum";
global.gameGen = 4;
global.pokedex = {};
global.calcingForSwitchIns = false;
const calc = require("../index");
global.typeChart = calc.TYPE_CHART[4];

const preview = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../../js/calc_ui/switch_preview/g4.js"), "utf8"), preview);

function calculate(name, options = {}) {
    const pokemon = extra => new calc.Pokemon(4, "Mew", Object.assign({
        level: 50, ability: "No Ability", nature: "Serious", overrides: { types: ["Normal"] }
    }, extra));
    const attackerOptions = Object.assign({}, options.attacker);
    attackerOptions.overrides = Object.assign({ types: ["Normal"] }, attackerOptions.overrides);
    attackerOptions.overrides.baseStats = Object.assign({}, attackerOptions.overrides.baseStats, {
        spe: (options.speed || 120) - 20
    });
    const attacker = pokemon(attackerOptions);
    const defender = pokemon(options.defender);
    const move = new calc.Move(4, name, options.move);
    global.calcingForSwitchIns = options.switchPreview !== false;
    try {
        return calc.calculate(4, attacker, defender, move, new calc.Field(options.field));
    } finally {
        global.calcingForSwitchIns = false;
    }
}

// With these level-50, neutral-nature Mew, Attack/Defense and SpA/SpD are
// both 120. Platinum's CalcMoveDamage therefore returns floor(22*power/50)+2.
const conditionalMoves = [
    ["Brine", 65, { defender: { curHP: 1 } }],
    ["Facade", 70, { attacker: { status: "psn" } }],
    ["Wake-Up Slap", 60, { defender: { status: "slp" } }],
    ["Smelling Salts", 60, { defender: { status: "par" } }],
    ["Payback", 50, {}], ["Avalanche", 60, {}], ["Assurance", 50, {}],
    ["Revenge", 60, {}], ["Pursuit", 40, { field: { defenderSide: { isSwitching: "out" } } }],
    ["Fury Cutter", 10, {}], ["Rollout", 30, {}], ["Ice Ball", 30, {}],
    ["Eruption", 150, { attacker: { curHP: 1 } }],
    ["Water Spout", 150, { attacker: { curHP: 1 } }],
    ["Gust", 40, {}], ["Twister", 40, {}], ["Stomp", 65, {}],
    ["Earthquake", 100, {}], ["Surf", 95, {}], ["Whirlpool", 15, {}]
];

for (const [name, power, options] of conditionalMoves) {
    test(`${name} phase 2 uses table power without its effect script`, () => {
        for (const speed of [60, 120, 180]) {
            const result = calculate(name, Object.assign({}, options, { speed }));
            assert.equal(result.rawDesc.g4Phase2BaseDamage, Math.floor(22 * power / 50) + 2);
        }
    });
}

test("Weather Ball uses 50 Normal-type BP for base damage, then weather type for STAB/effectiveness", () => {
    for (const [weather, type] of [["Sun", "Fire"], ["Rain", "Water"], ["Sand", "Rock"], ["Hail", "Ice"]]) {
        const result = calculate("Weather Ball", {
            attacker: { curHP: 1, ability: type === "Fire" ? "Blaze" : "No Ability",
                item: type === "Fire" ? "Charcoal" : "",
                overrides: { types: [type] } },
            field: { weather }
        });
        assert.equal(result.rawDesc.g4Phase2BaseDamage, 24, weather);
        assert.equal(result.rawDesc.g4Phase2StabMod, 1.5, weather);
        assert.equal(preview.getGen4Phase2DamageScore(result), 36, weather);
    }
    const superEffective = calculate("Weather Ball", {
        attacker: { overrides: { types: ["Fire"] } },
        defender: { overrides: { types: ["Grass", "Steel"] } }, field: { weather: "Sun" }
    });
    assert.equal(preview.getGen4Phase2DamageScore(superEffective), 144);
});

test("the fainted Cloud Nine/Air Lock battler no longer suppresses Weather Ball's weather type", () => {
    for (const ability of ["Cloud Nine", "Air Lock"]) {
        const result = calculate("Weather Ball", { attacker: { curHP: 1, ability,
            overrides: { types: ["Fire"] } }, field: { weather: "Sun" } });
        assert.equal(preview.getGen4Phase2DamageScore(result), 36, ability);
    }
});

test("Normalize still overrides Weather Ball's weather type in phase 2", () => {
    const result = calculate("Weather Ball", { attacker: { ability: "Normalize" }, field: { weather: "Sun" } });
    assert.equal(preview.getGen4Phase2DamageScore(result), 36);
});

test("Triple Kick phase 2 scores one 10-BP hit regardless of hit selector", () => {
    for (const hits of [1, 2, 3]) {
        const result = calculate("Triple Kick", { move: { hits } });
        assert.equal(result.rawDesc.g4Phase2BaseDamage, 6);
        assert.equal(preview.getGen4Phase2DamageScore(result), 12);
    }
});

test("Beat Up phase 2 uses the fainted battler's stats and 10 BP, including with no healthy party members", () => {
    for (const party of [[], [{ name: "Shuckle", level: 1, baseAttack: 10 }],
        [{ name: "Mewtwo", level: 100, baseAttack: 110 }, { name: "Mew", level: 50, baseAttack: 100 }]]) {
        const result = calculate("Beat Up", { move: { beatUpParty: party } });
        assert.equal(result.rawDesc.g4Phase2BaseDamage, 6);
        assert.equal(preview.getGen4Phase2DamageScore(result), 6);
    }
});

test("Pursuit still receives Technician in phase 2 when the switching checkbox is set", () => {
    const result = calculate("Pursuit", { attacker: { ability: "Technician" },
        field: { defenderSide: { isSwitching: "out" } } });
    assert.equal(result.rawDesc.g4Phase2BaseDamage, 28);
});

test("phase 2 uses the noncritical roll even when the active move's crit checkbox is set", () => {
    assert.equal(calculate("Payback", { move: { isCrit: true } }).rawDesc.g4Phase2BaseDamage, 24);
});

test("Payback's table-power damage is truncated to u8 before type modifiers", () => {
    const result = calculate("Payback", { speed: 60, attacker: { overrides: { baseStats: { atk: 2000 } } } });
    assert.equal(result.rawDesc.g4Phase2BaseDamage, 372);
    assert.equal(preview.getGen4Phase2DamageScore(result), 116);
});

test("Solar Beam's weather penalty and Explosion/Self-Destruct's defense halving stay active", () => {
    for (const weather of ["Rain", "Sand", "Hail", "Fog"]) {
        assert.equal(calculate("Solar Beam", { field: { weather } }).rawDesc.g4Phase2BaseDamage, 28);
    }
    assert.equal(calculate("Explosion").rawDesc.g4Phase2BaseDamage, 222);
    assert.equal(calculate("Self-Destruct").rawDesc.g4Phase2BaseDamage, 178);
});

test("normal attacks retain Weather Ball, Payback, Pursuit and Triple Kick behavior", () => {
    assert.equal(calculate("Weather Ball", { switchPreview: false, field: { weather: "Sun" } }).rawDesc.moveBP, 100);
    assert.equal(calculate("Payback", { switchPreview: false, speed: 60 }).rawDesc.moveBP, 100);
    assert.equal(calculate("Pursuit", { switchPreview: false,
        field: { defenderSide: { isSwitching: "out" } } }).rawDesc.g4Phase2BaseDamage, 38);
    const tripleKick = calculate("Triple Kick", { switchPreview: false, move: { hits: 3 } });
    assert.equal(tripleKick.damage.length, 3);
    assert.ok(tripleKick.damage[2][15] > tripleKick.damage[0][15]);
    const beatUp = calculate("Beat Up", { switchPreview: false, move: { beatUpParty: [
        { name: "Mewtwo", level: 100, baseAttack: 110 }, { name: "Mew", level: 50, baseAttack: 100 }
    ] } });
    assert.equal(beatUp.damage[0][15], 11);
    assert.equal(beatUp.damage[1][15], 6);
});

test("all 32 source-power-1 moves are skipped before phase 2 damage scoring", () => {
    const names = ["Bide", "Counter", "Crush Grip", "Dragon Rage", "Endeavor", "Fissure", "Flail", "Fling",
        "Frustration", "Grass Knot", "Guillotine", "Gyro Ball", "Hidden Power", "Horn Drill", "Low Kick",
        "Magnitude", "Metal Burst", "Mirror Coat", "Natural Gift", "Night Shade", "Present", "Psywave",
        "Punishment", "Return", "Reversal", "Seismic Toss", "Sheer Cold", "SonicBoom", "Spit Up",
        "Super Fang", "Trump Card", "Wring Out"];
    for (const name of names.concat(["HP Ice", "Hidden Power Fire", "Sonic Boom"])) {
        assert.equal(preview.isGen4Phase2IgnoredMove(name), true, name);
    }
});
