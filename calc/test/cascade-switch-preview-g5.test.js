"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const previewSource = fs.readFileSync(path.join(__dirname, "../../js/calc_ui/switch_preview/g5.js"), "utf8");

function makeMove(name, bp, type) {
    return {
        name, bp, type, flags: {}, isCrit: false,
        named(...names) { return names.includes(name); },
        hasType(moveType) { return type === moveType; }
    };
}

function makePokemon(ability, moves) {
    return {
        ability, item: "", level: 62, stats: { spe: 153 }, moves,
        hasAbility(...names) { return names.includes(ability); },
        hasItem() { return false; }
    };
}

function previewScores(flags, leafeonAbility = "Tinted Lens") {
    const player = {
        item: "", level: 62, stats: { spe: 154 }, moves: [],
        hasItem() { return false; }
    };
    const roserade = makePokemon("Majesty", [makeMove("Hyper Beam", 160, "Normal")]);
    const leafeon = makePokemon(leafeonAbility, [makeMove("Frenzy Plant", 150, "Grass")]);
    const context = {
        TITLE: "Cascade White Dev",
        settings: { customCascadeSwitchAI: !!flags.cascAI, customCascadeSwitchAIG4: !!flags.cascAIG4, critGen: 5 },
        CURRENT_TRAINER_POKS: ["Roserade (Gardenia)[4]", "Leafeon (Gardenia)[3]"],
        pokedex: { Roserade: { types: ["Grass", "Poison"] }, Leafeon: { types: ["Grass"] } },
        SETDEX_BW: {
            Roserade: { Gardenia: { moves: ["Hyper Beam"], item: "", ability: "Majesty" } },
            Leafeon: { Gardenia: { moves: ["Frenzy Plant"], item: "", ability: leafeonAbility } }
        },
        moves: { "Hyper Beam": {}, "Frenzy Plant": {} },
        expYields: {},
        cleanString: name => name,
        createPokemon: name => typeof name !== "string" ? player : name.startsWith("Roserade") ? roserade : leafeon,
        get_type_info: types => types[0] === "Bug"
            ? { Normal: 1, Grass: 0.25 }
            : { Bug: 1, Flying: 2 },
        sort_trpoks: (a, b) => b[1] - a[1],
        sort_subindex: (a, b) => Number(a[3]) - Number(b[3]),
        console: { log() {} },
        $: selector => ({
            first() { return this; },
            val() { return ({ ".type1": "Bug", ".type2": "Flying", "#abilityL1": "", "#statusL1": "Healthy" })[selector] || ""; },
            find(query) { return query === "input:checked" ? [] : { val: () => "100" }; }
        })
    };
    vm.runInNewContext(previewSource, context);
    return Object.fromEntries(context.get_next_in_g5().map(row => [row[0].split(" (")[0], { power: row[1], move: row[2] }]));
}

test("cascAIG4 keeps the ordinary Cascade phase 2 move powers", () => {
    for (const cascAIG4 of [false, true]) {
        const scores = previewScores({ cascAIG4 });
        assert.deepEqual(scores.Roserade, { power: 160, move: "Hyper Beam" });
        assert.deepEqual(scores.Leafeon, { power: 112.5, move: "Frenzy Plant" });
    }
});

test("Tinted Lens doubles a quarter-effective phase 2 move once", () => {
    assert.equal(previewScores({ cascAIG4: true }, "None").Leafeon.power, 56.25);
    assert.equal(previewScores({ cascAIG4: true }, "Tinted Lens").Leafeon.power, 112.5);
});

test("cascAI still applies the separate Cascade matchup power modifier", () => {
    for (const cascAIG4 of [false, true]) {
        const scores = previewScores({ cascAI: true, cascAIG4 });
        assert.equal(scores.Roserade.power, 120);
        assert.equal(scores.Leafeon.power, 84);
    }
});
