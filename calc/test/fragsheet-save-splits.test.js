"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const rules = require("../../js/fragsheet/battle_log_split_rules.js");

function loadFragsheet(saveFileActive = true, width = 1920) {
    const tabs = {};
    const listeners = {};
    const storage = {};
    const context = {
        console, URLSearchParams, innerWidth: width,
        TITLE: "Cascade White Dev",
        evoData: {}, customSets: {},
        splitData: { "Other Game": { titles: ["First", "Last"], lvls: [20, 100], types: [] } },
        battleLogSplitRules: rules,
        isSaveFileBattleLogActive: () => saveFileActive,
        location: { search: "?data=casc2" },
        localStorage: Object.assign(storage, {
            getItem: (key) => storage[key] || null,
            setItem: (key, value) => { storage[key] = String(value); },
        }),
        addEventListener: (type, listener) => { listeners[type] = listener; },
        document: {
            addEventListener: () => {},
            body: { classList: { contains: () => false } },
        },
        gridApi: { setGridOption: jest.fn() },
        $: (selector) => {
            const state = tabs[String(selector)] ||= {};
            const api = {
                toggle(value) { state.visible = value; return api; },
                text(value) { state.text = value; return api; },
                removeClass() { return api; }, addClass() { return api; },
                on() { return api; }, click() { return api; }, ready() { return api; },
            };
            return api;
        },
    };
    context.window = context;
    vm.createContext(context);
    for (const file of ["aggrid_options.js", "frags.js"]) {
        vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../../js/fragsheet", file), "utf8"), context);
    }
    context.initializeSplits();
    return { context, tabs, listeners, setSaveFileActive: (value) => { saveFileActive = value; } };
}

describe("save-file fragsheet splits", () => {
    test("shows all Cascade split tabs without a level-cap table", () => {
        const { context, tabs } = loadFragsheet();
        expect(context.getFragsheetSplitData("Cascade White Dev").titles)
            .toEqual(rules.getProgressionForTitle("Cascade White Dev").splitTitles);
        expect(context.lvlcaps).toEqual([]); // No invented level-based assignments.
        for (let index = 0; index < 9; index++) {
            expect(tabs[`#split-${index}-tab`]).toEqual({
                visible: true,
                text: rules.getProgressionForTitle("Cascade White Dev").splitTitles[index],
            });
        }
    });

    test("refreshes split tabs when an already-open fragsheet switches to a save import", () => {
        const { context, tabs, setSaveFileActive } = loadFragsheet(false);
        expect(tabs["#split-2-tab"].visible).toBe(false);
        setSaveFileActive(true);
        context.refreshTables();
        expect(tabs["#split-2-tab"]).toEqual({ visible: true, text: "Burgh" });
        context.activeSplit = 2;
        setSaveFileActive(false);
        context.refreshTables();
        expect(tabs["#split-2-tab"].visible).toBe(false);
        expect(context.activeSplit).toBe("all-simple");
        expect(context.getFragsheetSplitData("Other Game").lvls).toEqual([20, 100]);
        expect(context.getFragsheetSplitData("Unconfigured Game").titles).toEqual(["All"]);
    });

    test("keeps explicit split assignments through party/box reimport and uses them over levels", () => {
        const { context } = loadFragsheet();
        const first = "Patrat (Lvl 99 First Trainer )";
        const second = "Purrloin (Lvl 1 Second Trainer )";
        const old = {
            Bulbasaur: {
                setData: { "My Box": { nature: "Timid" } },
                frags: [first, second], fragCount: 2,
                fragSplitIndexes: { [first]: 0, [second]: 3 }, alive: true,
                manualFrags: [first],
            },
            Charmander: { setData: { "My Box": {} }, frags: [first], fragSplitIndexes: { [first]: 2 } },
        };
        context.localStorage.encounters = JSON.stringify(old);
        context.syncImportedEncounterState({ Bulbasaur: { "My Box": { nature: "Modest" } } }, []);
        expect(context.encounters.Bulbasaur.fragSplitIndexes).toEqual(old.Bulbasaur.fragSplitIndexes);
        expect(context.encounters.Bulbasaur.manualFrags).toEqual([first]);
        expect(context.encounters.Charmander.fragSplitIndexes).toEqual(old.Charmander.fragSplitIndexes);
        context.activeSplit = "all";
        context.refreshTables();
        const row = context.rowData.find((entry) => entry.species === "Bulbasaur");
        expect([row.totalKo, row.split0, row.split3]).toEqual([2, 1, 1]);
        context.activeSplit = 3;
        context.refreshTables();
        const filtered = context.rowData.find((entry) => entry.species === "Bulbasaur");
        expect([filtered.totalKo, filtered.split0, filtered.split3]).toEqual([1, 0, 1]);
    });

    test.each([375, 960])("shows only Status, Img and KOs at %ipx, including save logs", (width) => {
        const { context } = loadFragsheet(true, width);
        for (const split of ["all", "all-simple", 0, 3, 8]) {
            context.activeSplit = split;
            context.setColumnDefs();
            expect(context.columnDefs.filter((col) => !col.hide).map((col) => col.headerName))
                .toEqual(["Status", "Img", "KOs"]);
        }
    });

    test("restores desktop columns on resize and leaves desktop stats behavior intact", () => {
        const { context, tabs, listeners } = loadFragsheet(true, 375);
        expect(tabs["#stats-tab"].visible).toBe(false);
        context.innerWidth = 961;
        listeners.resize();
        expect(context.columnDefs.filter((col) => !col.hide).map((col) => col.headerName))
            .toEqual(expect.arrayContaining(["#", "Nickname", "Species", "Met Location", "KOs", "Battles", "KO Share"]));
        expect(context.columnDefs.every((col) => typeof col.hide === "boolean")).toBe(true);
        expect(tabs["#stats-tab"].visible).toBe(true);
        context.activeSplit = 9;
        context.refreshTables();
        expect(context.columnDefs.find((col) => col.field === "nature").hide).toBe(false);
        context.innerWidth = 375;
        listeners.resize();
        expect(context.activeSplit).toBe("all-simple");
        expect(context.columnDefs.filter((col) => !col.hide).map((col) => col.headerName))
            .toEqual(["Status", "Img", "KOs"]);
    });

    test("rebuilds cached splits when the trainer order arrives after the data", async () => {
        const source = fs.readFileSync(path.resolve(__dirname, "../../js/initialize.js"), "utf8");
        const start = source.indexOf("async function loadTrainerOrderFallbackForCurrentTitle()");
        const end = source.indexOf("async function tryLoadStoredDevOverride()", start);
        const render = jest.fn();
        const order = { 20: { id: 20, prev: 156, next: null } };
        const context = {
            console,
            backup_data: {}, trainerOrders: order,
            getCurrentBackupFileName: () => "casc2",
            getTrainerOrderScriptSrc: (name) => `backups/trainer_orders/${name}.js`,
            checkAndLoadScript: async (_src, hooks) => { await Promise.resolve(); hooks.onLoad(); },
            isSaveFileBattleLogActive: () => true,
            renderBattleLogView: render,
        };
        context.window = context;
        vm.createContext(context);
        vm.runInContext(source.slice(start, end), context);
        await context.loadTrainerOrderFallbackForCurrentTitle();
        expect(context.npoint_data.order).toBe(order);
        expect(render).toHaveBeenCalledWith(true);
        // An embedded order must still win over a separate fallback file.
        render.mockClear();
        context.backup_data.order = { embedded: true };
        await context.loadTrainerOrderFallbackForCurrentTitle();
        expect(context.backup_data.order).toEqual({ embedded: true });
        expect(render).not.toHaveBeenCalled();
    });
});
