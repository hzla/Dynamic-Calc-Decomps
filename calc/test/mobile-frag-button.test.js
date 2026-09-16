"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadMobileKo() {
    const selections = {
        '.player.set-selector': 'Bulbasaur (My Box)',
        '.opposing.set-selector': 'Patrat (Lvl 10 Youngster Joey)[0]',
        '#levelR1': '12', '#levelL1': '11',
    };
    const context = {
        console, TITLE: 'Cascade White Dev',
        localStorage: { encounters: JSON.stringify({ Bulbasaur: {
            setData: { 'My Box': {} }, frags: [], fragCount: 0,
        } }) },
        fainted: [],
        document: {},
        alert: jest.fn(), setTimeout: (fn) => fn(),
        refresh_next_in: jest.fn(), performCalculations: jest.fn(),
        refreshTables: jest.fn(), gridApi: {},
        getTrainerPreviewDataId: (id) => id.split('[')[0],
        getTrainerPreviewTrainerIdFromSet: jest.fn(() => 192),
        getManualFragTrainerSplitIndex: jest.fn(() => 2),
        $: (selector) => {
            const api = {
                length: 1,
                first() { return api; },
                val() { return selections[selector]; },
                text(value) { return value === undefined ? '' : api; },
                ready() { return api; }, on() { return api; },
                toggleClass() { return api; }, attr() { return api; }, prop() { return api; },
                show() { return api; }, hide() { return api; },
            };
            return api;
        },
    };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../../js/fragsheet/frags.js'), 'utf8'), context);
    const hooks = fs.readFileSync(path.resolve(__dirname, '../../js/showdown_hooks.js'), 'utf8');
    vm.runInContext(hooks.slice(0, hooks.indexOf('var MID_PANEL_LAYOUT_STORAGE_KEY')), context);
    expect(hooks).toContain("$(document).on('click', '#opposing-ko-toggle', toggleMobileOpponentKo)");
    return { context, selections, read: () => JSON.parse(context.localStorage.encounters) };
}

describe('mobile KO fragsheet button', () => {
    test('credits the selected left Pokemon before preview refresh and updates the table', () => {
        const { context, selections, read } = loadMobileKo();
        context.refresh_next_in.mockImplementation(() => { selections['.opposing.set-selector'] = 'Purrloin (Lvl 13 Next)[1]'; });
        context.toggleMobileOpponentKo({ preventDefault: jest.fn() });
        const mon = read().Bulbasaur;
        expect(mon.frags).toEqual(['Patrat (Lvl 12 Youngster Joey)']);
        expect(mon.manualFrags).toEqual(mon.frags);
        expect(mon.fragCount).toBe(1);
        expect(mon.fragSplitIndexes[mon.frags[0]]).toBe(2);
        expect(context.fainted).toEqual(['Patrat (Lvl 10 Youngster Joey)']);
        expect(context.refreshTables).toHaveBeenCalled();
        expect(context.encounters.Bulbasaur.frags).toEqual(mon.frags);
    });

    test('unmarking does not remove a frag and remarking does not duplicate it', () => {
        const { context, read } = loadMobileKo();
        context.toggleMobileOpponentKo();
        context.toggleMobileOpponentKo();
        expect(context.fainted).toEqual([]);
        expect(read().Bulbasaur.fragCount).toBe(1);
        context.toggleMobileOpponentKo();
        expect(read().Bulbasaur.fragCount).toBe(1);
        // The original desktop sprite gesture still toggles manual credits.
        context.addFrag({ preventDefault: jest.fn() });
        expect(read().Bulbasaur.frags).toEqual([]);
        expect(read().Bulbasaur.manualFrags).toEqual([]);
    });

    test('does not remove an existing imported credit', () => {
        const { context, read } = loadMobileKo();
        const encounters = read();
        encounters.Bulbasaur.frags = ['Patrat (Lvl 12 Youngster Joey)'];
        encounters.Bulbasaur.fragCount = 1;
        context.localStorage.encounters = JSON.stringify(encounters);
        context.toggleMobileOpponentKo();
        expect(read().Bulbasaur.frags).toEqual(encounters.Bulbasaur.frags);
        expect(read().Bulbasaur.fragCount).toBe(1);
    });

    test('handles an unimported player Pokemon without throwing or modifying encounters', () => {
        const { context, selections, read } = loadMobileKo();
        selections['.player.set-selector'] = 'Charmander (My Box)';
        expect(() => context.toggleMobileOpponentKo()).not.toThrow();
        expect(context.alert).toHaveBeenCalledWith(expect.stringContaining('Import your party/box first'));
        expect(read().Bulbasaur.fragCount).toBe(0);
    });
});
