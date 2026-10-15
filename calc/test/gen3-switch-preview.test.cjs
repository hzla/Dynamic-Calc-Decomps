"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

global.settings = { type_chart: 3, typeChart: 3, physSpecSplit: false };
const calc = require("../index");
const previewSource = fs.readFileSync(path.join(__dirname, "../../js/calc_ui/switch_preview/g3.js"), "utf8");

function loadPreview(title) {
    const context = {
        TITLE: title,
        GENERATION: calc.Generations.get(3),
        calc
    };
    vm.runInNewContext(previewSource, context);
    return context;
}

test("Emerald but Bad keeps separately indexed Hidden Power variants for switch scoring", () => {
    const preview = loadPreview("Emerald but Bad");
    for (const type of ["Water", "Fire", "Ground", "Flying", "Ice"]) {
        for (const prefix of ["HP", "Hidden Power"]) {
            const name = `${prefix} ${type}`;
            const move = preview.getGen3EmeraldMoveTableMove(name);
            assert.equal(move.name, `HP ${type}`);
            assert.equal(move.type, type);
            assert.equal(move.bp, 70);
            assert.equal(preview.isGen3EmeraldPowerOneMove(name), false);
        }
    }
});

test("ordinary Hidden Power keeps its raw Normal type and power-one switch behavior", () => {
    for (const title of ["Emerald but Bad", "Emerald Kaizo", "Emerald"]) {
        const preview = loadPreview(title);
        for (const name of ["Hidden Power", "HP"]) {
            const move = preview.getGen3EmeraldMoveTableMove(name);
            assert.equal(move.type, "Normal");
            assert.equal(move.bp, 1);
            assert.equal(preview.isGen3EmeraldPowerOneMove(name), true);
        }
    }
    const preview = loadPreview("Emerald");
    assert.equal(preview.getGen3EmeraldMoveTableMove("HP Water").type, "Normal");
    assert.equal(preview.isGen3EmeraldPowerOneMove("HP Water"), true);
});

test("Emerald Kaizo retains its indexed Hidden Power names and types", () => {
    const preview = loadPreview("Emerald Kaizo");
    const move = preview.getGen3EmeraldMoveTableMove("HP Water");
    assert.equal(move.name, "Hidden Power Water");
    assert.equal(move.type, "Water");
    assert.equal(move.bp, 70);
    assert.equal(preview.isGen3EmeraldPowerOneMove("HP Water"), false);
});
