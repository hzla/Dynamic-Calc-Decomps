"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function sourceBetween(source, start, end) {
    return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
}

function loadPreview(setdex) {
    const root = path.resolve(__dirname, "../..");
    const context = { setdex, TITLE: "Pixelmon", partnerName: null, customLeads: {} };
    const controls = fs.readFileSync(path.join(root, "js/shared_controls.js"), "utf8");
    const utilities = fs.readFileSync(path.join(root, "js/calc_ui/utility_functions.js"), "utf8");
    vm.createContext(context);
    vm.runInContext(sourceBetween(utilities, "function stripTrainerLevelDuplicateMarkers", "function padArray"), context);
    vm.runInContext(sourceBetween(controls, "function getSetDataFromSetId", "function getImportedAbilitySlotDisplaySuffix"), context);
    vm.runInContext(sourceBetween(controls, "function getTrainerPreviewTrainerIdFromSet", "function getTrainerPreviewBattleType"), context);
    vm.runInContext(fs.readFileSync(path.join(root, "js/calc_ui/trainer_preview.js"), "utf8"), context);
    context.TR_NAMES = context.get_trainer_names();
    return context;
}

test("Pixelmon previews include every team member despite distinct #slot labels", () => {
    const sets = {};
    for (const [index, species] of ["Druddigon", "Fraxure", "Dragalge", "Altaria"].entries()) {
        sets[species] = { [`Lvl 50 Aliene #${index + 1}`]: { tr_id: 1, sub_index: index, pixelmonTrainerName: "Aliene" } };
    }
    sets.Garchomp = { "Lvl 50 Bryce #1": { tr_id: 2, sub_index: 0, pixelmonTrainerName: "Bryce" } };
    const context = loadPreview(sets);
    for (const selected of context.TR_NAMES.filter((setId) => !setId.startsWith("Garchomp"))) {
        const preview = Array.from(context.get_trainer_poks(selected));
        assert.equal(context.get_trainer_name(selected), "Aliene");
        assert.equal(preview.length, 4);
        assert.ok(preview.every((setId) => !setId.startsWith("Garchomp")));
    }
});

test("legacy trainer variants still use their displayed team labels", () => {
    const context = loadPreview({
        Altaria: { "Lvl 50 Aliene": { tr_id: 1, sub_index: 0 } },
        Dragonite: { "Lvl 60 Aliene - Rematch": { tr_id: 1, sub_index: 0 } },
    });
    assert.equal(context.get_trainer_name("Altaria (Lvl 50 Aliene)"), "Aliene");
    assert.deepEqual(Array.from(context.get_trainer_poks("Altaria (Lvl 50 Aliene)")), ["Altaria (Lvl 50 Aliene)[0]"]);
    assert.deepEqual(Array.from(context.get_trainer_poks("Dragonite (Lvl 60 Aliene - Rematch)")), ["Dragonite (Lvl 60 Aliene - Rematch)[0]"]);
});
