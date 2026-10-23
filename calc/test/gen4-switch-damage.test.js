"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
global.settings = { gen: 4, type_chart: 4, typeChart: 4, damageGen: 4, critGen: 4 };
global.gameGen = 4;
global.TITLE = "Platinum";
global.pokedex = {};
global.calcingForSwitchIns = true;
const calc = require("../index");
global.typeChart = calc.TYPE_CHART[4];

function result(name = "Bite", options = {}) {
    const pokemon = (opts = {}) => new calc.Pokemon(4, opts.name || "Mew", Object.assign({
        level: 50, nature: "Serious", ability: "No Ability", gender: "M"
    }, opts, { overrides: Object.assign({ types: ["Normal"], baseStats: {
        hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100
    } }, opts.overrides) }));
    return calc.calculate(4, pokemon(options.attacker), pokemon(options.defender),
        new calc.Move(4, name, options.move), new calc.Field(options.field));
}
const base = (name, options) => result(name, options).rawDesc.g4Phase2BaseDamage;
const score = (name, options) => result(name, options).rawDesc.g4Phase2Score;

test("faint cleanup resets attacking stages but preserves the defender's stages", () => {
    for (const stage of [-6, -1, 0, 1, 6]) {
        assert.equal(base("Bite", { attacker: { boosts: { atk: stage } } }), 28);
    }
    assert.equal(base("Bite", { defender: { boosts: { def: 1 } } }), 19);
    assert.equal(base("Bite", { defender: { boosts: { def: -1 } } }), 41);
    assert.equal(base("Bite", { defender: { boosts: { def: -6 } } }), 107);
});

test("Simple, Unaware and Mold Breaker modify the defender's surviving stages", () => {
    const defender = { ability: "Simple", boosts: { def: 1 } };
    assert.equal(base("Bite", { defender }), 15);
    assert.equal(base("Bite", { defender, attacker: { ability: "Mold Breaker" } }), 19);
    assert.equal(base("Bite", { defender, attacker: { ability: "Unaware" } }), 28);
});

test("Intimidate and Download entry effects are not reapplied", () => {
    assert.equal(base("Bite", { defender: { ability: "Intimidate" } }), 28);
    assert.equal(base("Water Pulse", { attacker: { ability: "Download", abilityOn: true } }), 28);
});

test("Slow Start is reset by fainting even if the calculator toggle says it expired", () => {
    assert.equal(base("Bite", { attacker: { ability: "Slow Start", abilityOn: false } }), 15);
});

test("faint cleanup clears Helping Hand and Flash Fire boosts", () => {
    assert.equal(base("Bite", { field: { attackerSide: { isHelpingHand: true } } }), 28);
    assert.equal(base("Fire Punch", { attacker: { ability: "Flash Fire", abilityOn: true } }), 35);
});

test("burn and Guts use the fainted battler's persistent status", () => {
    assert.equal(base("Bite", { attacker: { status: "brn" } }), 15);
    for (const status of ["brn", "psn", "par"]) {
        assert.equal(base("Bite", { attacker: { ability: "Guts", status } }), 41);
    }
});

test("fainted Flower Gift does not boost Attack, but living defender Flower Gift boosts SpD", () => {
    assert.equal(base("Seed Bomb", { attacker: { ability: "Flower Gift" }, field: { weather: "Sun" } }), 37);
    assert.equal(base("Psychic", { defender: { ability: "Flower Gift" }, field: { weather: "Sun" } }), 28);
    assert.equal(base("Psychic", { attacker: { ability: "Mold Breaker" },
        defender: { ability: "Flower Gift" }, field: { weather: "Sun" } }), 41);
});

test("Plus/Minus require a living ally with the matching opposite ability", () => {
    assert.equal(base("Water Pulse", { attacker: { ability: "Plus", abilityOn: true } }), 28);
    assert.equal(base("Water Pulse", { attacker: { ability: "Plus" }, field: {
        gameType: "Doubles", g4Phase2State: { attackerPartnerAbility: "Minus" }
    } }), 41);
    assert.equal(base("Water Pulse", { attacker: { ability: "Plus", abilityOn: true },
        field: { gameType: "Doubles" } }), 41);
});

test("raw stat ability and item modifiers are applied before defending stat stages", () => {
    assert.equal(base("Bite", { attacker: { ability: "Huge Power", item: "Choice Band" },
        defender: { boosts: { def: 1 } } }), 54);
    assert.equal(base("Water Pulse", { attacker: { item: "Choice Specs" } }), 41);
    assert.equal(base("Bite", { attacker: { ability: "Hustle", item: "Choice Band", ivs: { atk: 29 } } }), 60);
});

test("Soul Dew and sand boost raw SpD before applying the defender's stage", () => {
    assert.equal(base("Water Pulse", { defender: { name: "Latias", item: "Soul Dew", boosts: { spd: 1 },
        overrides: { types: ["Rock"], baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 } } },
        field: { weather: "Sand" } }), 9);
});

test("Light Ball doubles power before Rivalry's rounding", () => {
    assert.equal(base("Fire Punch", { attacker: { name: "Pikachu", ability: "Rivalry", item: "Light Ball" } }), 84);
});

test("Thick Fat precedes the low-HP ability modifier", () => {
    const r = result("Fire Punch", { attacker: { ability: "Blaze" }, defender: { ability: "Thick Fat" } });
    assert.equal(r.rawDesc.g4Phase2Power, 55);
    assert.equal(r.rawDesc.g4Phase2BaseDamage, 26);
});

test("Klutz suppresses held item effects", () => {
    assert.equal(base("Bite", { attacker: { item: "Choice Band", ability: "Klutz" } }), 28);
    assert.equal(score("Earthquake", { defender: { item: "Iron Ball", ability: "Klutz", overrides: { types: ["Flying"] } } }), 0);
    assert.equal(score("Earthquake", { defender: { item: "Iron Ball", overrides: { types: ["Flying"] } } }), 46);
});

test("Life Orb, Metronome and resist berries are not part of either phase 2 function", () => {
    assert.equal(base("Bite", { attacker: { item: "Life Orb" } }), 28);
    assert.equal(base("Bite", { attacker: { item: "Metronome" }, move: { timesUsedWithMetronome: 9 } }), 28);
    assert.equal(score("Hyper Voice", { defender: { item: "Chilan Berry" } }), 61);
    assert.equal(score("Fire Punch", { defender: { item: "Occa Berry", overrides: { types: ["Grass"] } } }), 70);
});

test("items absent from Platinum do not change its phase 2 calculation", () => {
    assert.equal(base("Bite", { defender: { name: "Bulbasaur", item: "Eviolite" } }), 28);
    assert.equal(base("Iron Head", { attacker: { item: "Steel Feather" } }), 37);
    assert.equal(base("Hyper Voice", { attacker: { item: "Pink Bow" } }), 41);
});

test("elemental absorption and Soundproof scripts do not run during phase 2", () => {
    for (const [name, ability, expected] of [["Fire Punch", "Flash Fire", 35],
        ["Water Pulse", "Water Absorb", 28], ["Water Pulse", "Dry Skin", 28],
        ["Shock Wave", "Volt Absorb", 28], ["Shock Wave", "Motor Drive", 28], ["Hyper Voice", "Soundproof", 61]]) {
        assert.equal(score(name, { defender: { ability } }), expected, ability);
    }
});

test("Levitate, Gravity, Mold Breaker and Wonder Guard use ApplyTypeChart", () => {
    assert.equal(score("Earthquake", { defender: { ability: "Levitate" } }), 0);
    assert.equal(score("Earthquake", { defender: { ability: "Levitate" }, field: { isGravity: true } }), 46);
    assert.equal(score("Earthquake", { attacker: { ability: "Mold Breaker" }, defender: { ability: "Levitate" } }), 46);
    assert.equal(score("Psychic", { defender: { ability: "Wonder Guard" } }), 0);
    for (const [name, expected] of [["Fire Fang", 30], ["Solar Beam", 54], ["Fly", 41]]) {
        assert.equal(score(name, { defender: { ability: "Wonder Guard" } }), expected, name);
    }
});

test("Filter, Expert Belt and Tinted Lens use the source's final modifier order", () => {
    assert.equal(score("Brick Break", { defender: { ability: "Filter" } }), 52);
    assert.equal(score("Brick Break", { attacker: { item: "Expert Belt" }, defender: { ability: "Filter" } }), 62);
    assert.equal(score("Seed Bomb", { attacker: { ability: "Tinted Lens" },
        defender: { overrides: { types: ["Grass", "Poison"] } } }), 18);
});

test("type effects follow cartridge chart order, independent of defender type-slot order", () => {
    for (const types of [["Fire", "Grass"], ["Grass", "Fire"]]) {
        assert.equal(score("Ice Beam", { move: { basePower: 80 }, defender: { overrides: { types } } }), 37);
    }
    for (const types of [["Ice", "Water"], ["Water", "Ice"]]) {
        assert.equal(score("Fire Punch", { move: { basePower: 80 }, defender: { overrides: { types } } }), 36);
    }
});

test("Brick Break bypasses screens, and Protect is not consulted by phase 2", () => {
    assert.equal(base("Brick Break", { field: { defenderSide: { isReflect: true } } }), 35);
    assert.equal(base("Bite", { field: { defenderSide: { isProtected: true } } }), 28);
});

test("doubles screens and spread damage count only surviving battlers", () => {
    assert.equal(base("Bite", { field: { gameType: "Doubles", defenderSide: { isReflect: true } } }), 19);
    assert.equal(base("Bite", { field: { gameType: "Doubles", defenderSide: { isReflect: true },
        g4Phase2State: { defenderSideAlive: 1 } } }), 15);
    assert.equal(base("Surf", { field: { gameType: "Doubles" } }), 32);
    assert.equal(base("Surf", { field: { gameType: "Doubles", g4Phase2State: { otherAlive: 1 } } }), 43);
});

test("Judgment uses Normal base damage and the reserve's plate for the type-chart pass", () => {
    assert.equal(score("Judgment", { attacker: { item: "Silk Scarf" }, defender: { overrides: { types: ["Grass"] } },
        move: { overrides: { g4Phase2ReserveItem: "Flame Plate" } } }), 108);
});

test("status moves retain the cartridge's residual +2 score, and empty move slots are skipped", () => {
    assert.equal(score("Splash"), 3);
    assert.equal(score("Nature Power"), 3);
    assert.equal(score("Splash", { defender: { overrides: { types: ["Ghost"] } } }), 0);
    assert.equal(result("(No Move)").damage, 0);
});

test("Struggle skips Technician and the STAB/type-chart pass", () => {
    assert.equal(score("Struggle", { attacker: { ability: "Technician" } }), 24);
    assert.equal(score("Struggle", { defender: { overrides: { types: ["Ghost"] } } }), 24);
});

test("custom Gen 4 mechanics profiles keep their existing calculation path", () => {
    const title = global.TITLE;
    try {
        for (const customTitle of ["Platinum Kaizo", "Platinum Redux"]) {
            global.TITLE = customTitle;
            assert.equal(result("Bite").rawDesc.g4Phase2Score, undefined);
        }
    } finally {
        global.TITLE = title;
    }
});
