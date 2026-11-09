"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const previewSource = fs.readFileSync(path.join(root, "js/calc_ui/switch_preview/g5.js"), "utf8");
const aiSource = fs.readFileSync(path.join(root, "js/calc_ui/switch_preview_ai.js"), "utf8");
const comparatorSource = aiSource.slice(aiSource.indexOf("function sort_trpoks("), aiSource.indexOf("function sort_subindex("));

function setup() {
    const context = vm.createContext({
        TITLE: "Ancestral X", settings: { gameSwitchIn: 6, noSwitch: false },
        fainted: [], doubles: true, current: "Gigalith (Grant)",
        opposingPreviewState: { mode: null },
        $: () => ({ is: () => context.doubles }),
        getOpposingFaintDataId: () => context.current
    });
    vm.runInContext(comparatorSource, context);
    vm.runInContext(previewSource, context);
    return context;
}

function grantRows(scores = [80, 80, 100, 75]) {
    return [
        ["Gigalith (Grant)[0]", 80, "", "0"],
        ["Corsola (Grant)[1]", 80, "", "1"],
        ...["Aerodactyl", "Cradily", "Armaldo", "Tyrantrum"].map((name, index) =>
            [`${name} (Grant)[${index + 2}]`, scores[index], "", String(index + 2)])
    ];
}

function update(context, rows = grantRows()) {
    return context.g5ApplyDoubleKoPreview(rows.slice().sort(context.sort_trpoks));
}

function reserveNames(rows) {
    return Array.from(rows).filter(row => Number(row[3]) >= 2).map(row => row[0].split(" (")[0]);
}

test("vanilla Gen 5, 6 and 7 default to separate KOs and offer the differing double-KO order", () => {
    for (const generation of [5, 6, 7]) {
        const context = setup();
        context.settings.gameSwitchIn = generation;
        context.fainted = ["Corsola (Grant)"];
        assert.deepEqual(reserveNames(update(context)), ["Armaldo", "Aerodactyl", "Cradily", "Tyrantrum"]);
        assert.equal(context.g5DoubleKoPreviewState.available, true);
        assert.equal(context.g5DoubleKoPreviewState.enabled, false);

        context.g5DoubleKoPreviewState.enabled = true;
        assert.deepEqual(reserveNames(update(context)), ["Armaldo", "Cradily", "Aerodactyl", "Tyrantrum"]);
        context.g5DoubleKoPreviewState.enabled = false;
        assert.deepEqual(reserveNames(update(context)), ["Armaldo", "Aerodactyl", "Cradily", "Tyrantrum"]);
    }
});

test("Sunflora's three-way runner-up tie also selects Armaldo and Cradily", () => {
    const context = setup();
    const rows = grantRows([150, 150, 180, 150]);
    update(context, rows);
    context.g5DoubleKoPreviewState.enabled = true;
    assert.deepEqual(reserveNames(update(context, rows)), ["Armaldo", "Cradily", "Aerodactyl", "Tyrantrum"]);
});

test("lead and fainted cards do not participate in the sort and keep their displayed positions", () => {
    const context = setup();
    const rows = grantRows([80, 80, 100, 200]);
    context.fainted = ["Tyrantrum (Grant)"];
    const separate = update(context, rows);
    context.g5DoubleKoPreviewState.enabled = true;
    const double = update(context, rows);
    for (const index of [0, 1, 5]) {
        assert.equal(double.findIndex(row => Number(row[3]) === index), separate.findIndex(row => Number(row[3]) === index));
    }
    assert.deepEqual(reserveNames(double).filter(name => name !== "Tyrantrum"), ["Armaldo", "Cradily", "Aerodactyl"]);
    assert.deepEqual(rows, grantRows([80, 80, 100, 200]));
});

test("differences below the first two replacements do not show the warning", () => {
    const context = setup();
    update(context, grantRows([100, 50, 50, 75]));
    assert.equal(context.g5DoubleKoPreviewState.available, false);
});

test("an equal highest score preserves party order without a warning", () => {
    const context = setup();
    update(context, grantRows([80, 80, 80, 75]));
    assert.equal(context.g5DoubleKoPreviewState.available, false);
});

test("marking or loading Armaldo removes the ambiguity and resets the toggle", () => {
    for (const exclude of ["faint", "current"]) {
        const context = setup();
        update(context);
        context.g5DoubleKoPreviewState.enabled = true;
        if (exclude === "faint") context.fainted = ["Armaldo (Grant)"];
        else context.current = "Armaldo (Grant)";
        update(context);
        assert.equal(context.g5DoubleKoPreviewState.available, false);
        assert.equal(context.g5DoubleKoPreviewState.enabled, false);
        context.fainted = [];
        context.current = "Gigalith (Grant)";
        assert.deepEqual(reserveNames(update(context)), ["Armaldo", "Aerodactyl", "Cradily", "Tyrantrum"]);
        assert.equal(context.g5DoubleKoPreviewState.enabled, false);
    }
});

test("format and score changes clear the warning and reset before ambiguity returns", () => {
    for (const change of ["format", "scores"]) {
        const context = setup();
        update(context);
        context.g5DoubleKoPreviewState.enabled = true;
        if (change === "format") context.doubles = false;
        update(context, change === "scores" ? grantRows([120, 100, 80, 60]) : grantRows());
        assert.equal(context.g5DoubleKoPreviewState.available, false);
        assert.equal(context.g5DoubleKoPreviewState.enabled, false);
        context.doubles = true;
        update(context);
        assert.equal(context.g5DoubleKoPreviewState.available, true);
        assert.equal(context.g5DoubleKoPreviewState.enabled, false);
    }
});

test("custom AI, disabled rankings, other generations and opposing partner trainers are excluded", () => {
    for (const change of [
        c => { c.TITLE = "Cascade White Dev"; },
        c => { c.settings.noSwitch = true; },
        c => { c.settings.gameSwitchIn = 4; },
        c => { c.settings.gameSwitchIn = 8; },
        c => { c.opposingPreviewState.mode = "partner"; }
    ]) {
        const context = setup();
        update(context);
        context.g5DoubleKoPreviewState.enabled = true;
        change(context);
        update(context);
        assert.equal(context.g5DoubleKoPreviewState.available, false);
        assert.equal(context.g5DoubleKoPreviewState.enabled, false);
    }
});

test("combined parties cannot be sorted as a single trainer's reserves", () => {
    const context = setup();
    const rows = grantRows().concat([["Partner (Other)[0]", 60, "", "0"]]);
    update(context, rows);
    assert.equal(context.g5DoubleKoPreviewState.available, false);
});

test("a new trainer starts with the separate-KO order", () => {
    const context = setup();
    update(context);
    context.g5DoubleKoPreviewState.enabled = true;
    const rows = grantRows().map(row => [row[0].replace("Grant", "Other"), ...row.slice(1)]);
    assert.deepEqual(reserveNames(update(context, rows)), ["Armaldo", "Aerodactyl", "Cradily", "Tyrantrum"]);
    assert.equal(context.g5DoubleKoPreviewState.enabled, false);
});

test("an empty preview clears stale toggle state", () => {
    const context = setup();
    update(context);
    context.g5DoubleKoPreviewState.enabled = true;
    assert.equal(context.g5ApplyDoubleKoPreview(undefined), undefined);
    assert.equal(context.g5DoubleKoPreviewState.available, false);
    assert.equal(context.g5DoubleKoPreviewState.enabled, false);
});
