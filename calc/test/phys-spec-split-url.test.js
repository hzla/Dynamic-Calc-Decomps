"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");
var initializeSource = fs.readFileSync(path.join(__dirname, "../../js/initialize.js"), "utf8");
var menuSource = fs.readFileSync(path.join(__dirname, "../../js/calc_ui/menu_settings.js"), "utf8");

function loadFunction(context, source, name) {
    var start = source.indexOf("function " + name + "(");
    var end = source.indexOf("\nfunction ", start + 1);
    vm.runInContext(source.slice(start, end === -1 ? undefined : end), context);
}

function runtime(query, stored) {
    var values = Object.assign({}, stored);
    var location = { href: "https://calc.example/index.html?" + query, search: "?" + query };
    var context = vm.createContext({
        URL: URL,
        URLSearchParams: URLSearchParams,
        window: {
            location: location,
            history: { replaceState: function (_, __, url) { location.href = url; } }
        },
        localStorage: {
            getItem: function (key) { return values[key] === undefined ? null : values[key]; },
            setItem: function (key, value) { values[key] = value; }
        },
        cleanString: require("../util").toID,
        BLANK_DEV_TITLE: "Blank Slate Dev Calc",
        PHYS_SPEC_SPLIT_STORAGE_PREFIX: "calcPhysSpecSplit:",
        POKEMON_COLORS_NORMAL_TITLE: "Pokemon Colors Normal",
        POKEMON_COLORS_CLASSIC_TITLE: "Pokemon Colors Classic",
        TITLE: "Test Game"
    });
    vm.runInContext(initializeSource.slice(0, initializeSource.indexOf("const BLANK_DEV_TITLE")), context);
    ["getRuntimeTitle", "getTitleScopedStorageKey", "getTitleScopedStoredBool",
        "setTitleScopedStoredBool", "isPokemonColorsTitle", "requiresPhysSpecSplit",
        "getDefaultMoveCategoryForName", "getDefaultPhysSpecSplitEnabled", "getPhysSpecSplitEnabled",
        "syncGameScopedPhysSpecSplitSettings", "setPhysSpecSplitEnabled", "applyPhysSpecSplitMoveCategories"
    ].forEach(function (name) { loadFunction(context, initializeSource, name); });
    loadFunction(context, menuSource, "canShowPhysSpecSplitToggle");
    context.runtimeSettings = vm.runInContext("settings", context);
    context.stored = values;
    return context;
}

function loadMoveTables(context) {
    context.exports = {};
    context.require = function () { return require("../util"); };
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../data/moves.js"), "utf8"), context);
    context.calc = { MOVES: context.exports.MOVES };
    context.moves = context.calc.MOVES[context.runtimeSettings.gen];
    context.jsonMoves = { "Thunder Punch": { type: "Electric", category: "Physical" }, Protect: { type: "Normal" } };
    context.customMoves = { "Custom Fire": { type: "Fire", category: "Physical" } };
    context.exports = {};
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../move.js"), "utf8"), context);
}

describe("physical/special split URL override", function () {
    test.each([1, 2, 3, 4, 5, 6, 7, 8, 9])("supports both modes with generation %i mechanics", function (generation) {
        ["0", "1"].forEach(function (value) {
            var context = runtime("gen=" + generation + "&dmgGen=" + generation + "&psSplit=" + value, {
                "calcPhysSpecSplit:Test Game": value === "1" ? "0" : "1"
            });
            expect(context.runtimeSettings.physSpecSplit).toBe(value === "1");
            context.syncGameScopedPhysSpecSplitSettings("Test Game");
            expect(context.runtimeSettings.physSpecSplit).toBe(value === "1");
            expect(context.canShowPhysSpecSplitToggle()).toBe(true);
            loadMoveTables(context);
            context.applyPhysSpecSplitMoveCategories();
            var gen = { num: generation, moves: { get: function (id) { return context.MOVES_BY_ID[generation][id]; } } };
            var move = new context.Move(gen, "Thunder Punch");
            expect(move.category).toBe(value === "1" ? "Physical" : "Special");
            expect(context.moves["Thunder Punch"].category).toBe(move.category);
            expect(new context.Move(gen, "Thunder Wave").category).toBe("Status");
            expect(context.runtimeSettings.damageGen).toBe(generation);
        });
    });

    test("type-based mode replaces imported and custom categories and preserves status moves", function () {
        var context = runtime("gen=8&dmgGen=8&psSplit=0");
        loadMoveTables(context);
        context.jsonMoves["Changed Type"] = { type: "Ghost", category: "Special" };
        context.jsonMoves["Custom Fairy"] = { type: "Fairy", category: "Physical" };
        context.applyPhysSpecSplitMoveCategories();
        expect(context.jsonMoves["Thunder Punch"].category).toBe("Special");
        expect(context.jsonMoves["Changed Type"].category).toBe("Physical");
        expect(context.jsonMoves["Custom Fairy"].category).toBe("Special");
        expect(context.jsonMoves.Protect.category).toBe("Status");
        expect(context.customMoves["Custom Fire"].category).toBe("Special");
        expect(context.MOVES_BY_ID[8].thunderpunch.category).toBe("Special");
    });

    test("explicit URL settings override forced game defaults without changing saved preferences", function () {
        var context = runtime("psSplit=0", { "calcPhysSpecSplit:Renegade Platinum": "0" });
        context.syncGameScopedPhysSpecSplitSettings("Renegade Platinum");
        expect(context.runtimeSettings.physSpecSplit).toBe(false);
        expect(context.stored["calcPhysSpecSplit:Renegade Platinum"]).toBe("0");
    });

    test.each(["", "&psSplit=invalid", "&psSplit="])("keeps generation defaults and saved settings for absent or invalid values: %s", function (query) {
        var context = runtime("dmgGen=3" + query, { "calcPhysSpecSplit:Saved Game": "1" });
        expect(context.getPhysSpecSplitEnabled("Test Game")).toBe(false);
        expect(context.getPhysSpecSplitEnabled("Saved Game")).toBe(true);
        expect(context.getPhysSpecSplitEnabled("Renegade Platinum")).toBe(true);
        context.runtimeSettings.damageGen = 8;
        expect(context.getPhysSpecSplitEnabled("Test Game")).toBe(true);
    });

    test("the menu toggle updates an active URL override and preserves other parameters", function () {
        var context = runtime("data=test&dmgGen=8&psSplit=0");
        context.setPhysSpecSplitEnabled(true, "Test Game");
        expect(context.runtimeSettings.physSpecSplit).toBe(true);
        var url = new URL(context.window.location.href);
        expect(url.searchParams.get("psSplit")).toBe("1");
        expect(url.searchParams.get("data")).toBe("test");
        expect(context.stored["calcPhysSpecSplit:Test Game"]).toBe("1");
        context.setPhysSpecSplitEnabled(false, "Test Game");
        expect(context.runtimeSettings.physSpecSplit).toBe(false);
        expect(new URL(context.window.location.href).searchParams.get("psSplit")).toBe("0");
    });
});
