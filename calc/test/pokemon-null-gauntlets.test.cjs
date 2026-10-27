const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const root = path.resolve(__dirname, '../..');

function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function loadData(version) {
    const context = {};
    vm.runInNewContext(read(`backups/${version}.js`), context);
    return context.backup_data.formatted_sets;
}

function preview(setdex, title) {
    setdex = structuredClone(setdex);
    const stored = new Map();
    const element = {prop() { return this; }, text() { return this; }, val() { return ''; }, click() { return this; }};
    const parse = id => String(id).match(/^(.*?) \((.*)\)(?:\[\d+\])?$/);
    const context = {
        TITLE: title, setdex, partnerName: null, customLeads: {}, URLSearchParams,
        window: {location: {search: '?data=null'}},
        localStorage: {getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key)},
        $: () => element,
        stripTrainerLevelDuplicateMarkers: id => id,
        getTrainerName: id => parse(id)?.[2].replace(/^Lvl \d+ /, '') || null,
        getSetDataBySetId(id) { const match = parse(id); return match && setdex[match[1]]?.[match[2]]; },
        getTrainerPreviewTrainerIdFromSet(id) { return this.getSetDataBySetId(id)?.tr_id || false; },
        getTrainerPreviewPartnerIdFromSet(id) { return this.getSetDataBySetId(id)?.partner || false; },
        getTrainerSetsById(id) { return this.TR_NAMES.filter(ref => this.getSetDataBySetId(ref).tr_id === Number(id)).map(setId => ({setId})); },
        refresh_next_in() {}, refreshTagPartnerPreview() {},
        getOpposingTrainerIdentity: id => id,
        renderTrainerPreviewPok: (entry, inactive) => `<div class="card" data-inactive="${!!inactive}"></div>`
    };
    context.partySlots = [{speciesName: 'Pikachu', setData: {level: 80, nature: 'Timid', ability: 'Static', moves: ['Thunderbolt'], item: 'Light Ball'}}];
    context.capturePartyPreviewSnapshot = () => ({previewSlots: context.partySlots});
    // These helpers are called as browser globals, not object methods.
    for (const name of ['getTrainerPreviewTrainerIdFromSet', 'getTrainerPreviewPartnerIdFromSet', 'getTrainerSetsById']) {
        context[name] = context[name].bind(context);
    }
    vm.createContext(context);
    vm.runInContext(read('js/data/null_gauntlets.js'), context);
    vm.runInContext(read('js/calc_ui/null_wandering_spirit.js'), context);
    vm.runInContext(read('js/calc_ui/trainer_preview.js'), context);
    context.TR_NAMES = context.get_trainer_names();
    context.syncPokemonNullWanderingSpirit();
    for (const id of context.TR_NAMES) {
        const data = context.getSetDataBySetId(id);
        if (Number(data.sub_index) === 0 && !context.customLeads[data.tr_id]) context.customLeads[data.tr_id] = id;
    }
    context.opposingPreviewReady = true;
    context.opposingPreviewRoster = context.TR_NAMES;
    return context;
}

test('Wandering Spirit copies independent party slots, updates forms/sets, and removes stale records', () => {
    const context = preview(loadData('null125'), 'Pokemon Null 1.2.5');
    const original = {level: 83, nature: 'Jolly', ability: 'Huge Power', item: 'Sitrus Berry',
        moves: ['Aqua Jet', 'Play Rough'], ivs: {hp: 24, at: 28}, evs: {hp: 12}, status: 'Poisoned', currentHp: 1};
    context.partySlots = [
        {speciesName: 'Azumarill', setData: original},
        {speciesName: 'Azumarill', setData: {...original, level: 84, nature: 'Adamant', moves: ['Waterfall']}},
        {speciesName: 'Palafin-Hero', setData: {...original, level: 82, ability: 'Zero to Hero'}}
    ];
    assert.equal(context.syncPokemonNullWanderingSpirit(), true);
    assert.equal(context.syncPokemonNullWanderingSpirit(), false);
    const team = context.getPokemonNullWanderingSpiritTeam();
    assert.equal(team.setIds.length, 3);
    assert.equal(new Set(team.setIds).size, 3);
    const copy = context.getSetDataBySetId(team.setIds[0]);
    for (const field of ['level', 'nature', 'ability', 'item', 'moves', 'ivs', 'evs']) {
        assert.equal(JSON.stringify(copy[field]), JSON.stringify(original[field]));
    }
    assert.equal(copy.status, 'Healthy');
    assert.equal(copy.currentHp, undefined);
    copy.moves[0] = 'Tackle';
    copy.ivs.hp = 0;
    assert.equal(original.moves[0], 'Aqua Jet');
    assert.equal(original.ivs.hp, 24);
    context.syncPokemonNullWanderingSpirit();
    context.syncOpposingPreviewState(context.customLeads[475]);
    assert.equal(context.opposingPreviewState.teams.at(-1).trainerId, 843);
    assert.deepEqual(Array.from(context.getOpposingPreviewCalculationSets(team.setIds[1])), Array.from(team.setIds));
    context.partySlots = [];
    context.syncPokemonNullWanderingSpirit();
    context.syncOpposingPreviewState(context.customLeads[475]);
    for (const id of team.setIds) assert.ok(!context.getSetDataBySetId(id));
    assert.equal(context.opposingPreviewState.teams.length, 8);
    assert.equal(context.opposingPreviewState.teams.at(-1).setIds.length, 0);
    assert.ok(context.renderOpposingPreviewTeams([]).includes('Wandering Spirit mirrors your party'));
    assert.ok(!context.renderOpposingPreviewTeams([]).includes('opposing-team-remove'));
});

test('Wandering Spirit runtime sets restore before saved trainer previews and do not affect other games', () => {
    const context = preview(loadData('null12'), 'Pokemon Null 1.2');
    const selected = context.pokemonNullWanderingSpirit.setIds[0];
    context.syncOpposingPreviewState(selected);
    const restored = context.restoreOpposingPreviewState();
    assert.equal(restored, selected.replace(/\[\d+\]$/, ''));
    assert.equal(context.opposingPreviewState.presetGauntletId, 'mt-pyre');
    const other = preview({}, 'Other Game');
    assert.equal(other.syncPokemonNullWanderingSpirit(), false);
    assert.equal(Object.keys(other.setdex).length, 0);
});

for (const [version, title] of [['null12', 'Pokemon Null 1.2'], ['null125', 'Pokemon Null 1.2.5']]) {
    const data = loadData(version);
    test(`${version}: every preset resolves completely and preserves source partner battles`, () => {
        const context = preview(data, title);
        assert.equal(context.pokemonNullGauntlets.length, 17);
        const seen = new Set();
        for (const group of context.pokemonNullGauntlets) {
            const ids = Array.from(group.battles.flat());
            assert.ok(ids.length >= 2 && ids.length <= 10);
            for (const id of ids) {
                assert.ok(!seen.has(id), `Trainer ${id} belongs to multiple gauntlets`);
                seen.add(id);
                assert.ok(context.customLeads[id], `${group.id} is missing trainer ${id}`);
            }
            for (const battle of group.battles) {
                if (battle.length === 2) {
                    assert.equal(context.getSetDataBySetId(context.customLeads[battle[0]]).partner, battle[1]);
                    assert.equal(context.getSetDataBySetId(context.customLeads[battle[1]]).partner, battle[0]);
                }
                for (const id of battle) {
                    const selected = context.customLeads[id];
                    const sets = context.syncOpposingPreviewState(selected);
                    assert.equal(context.opposingPreviewState.presetGauntletId, group.id);
                    assert.deepEqual(Array.from(context.opposingPreviewState.teams, team => context.getSetDataBySetId(team.leadSetId).tr_id), ids);
                    assert.deepEqual([...new Set(Array.from(sets, ref => context.getSetDataBySetId(ref).tr_id))].sort((a, b) => a - b), Array.from(battle).sort((a, b) => a - b));
                    assert.equal(context.partnerName, null);
                }
            }
            const html = context.renderOpposingPreviewTeams([]);
            assert.ok(!html.includes('opposing-team-remove'));
            assert.equal((html.match(/opposing-team-heading/g) || []).length, 1);
            const before = context.opposingPreviewState.teams.length;
            context.removeOpposingPreviewTeam(1);
            assert.equal(context.opposingPreviewState.teams.length, before);
        }
    });

    test(`${version}: preset selection survives reload and simultaneous-only battles stay partners`, () => {
        const context = preview(data, title);
        context.syncOpposingPreviewState(context.customLeads[114]);
        const selected = context.restoreOpposingPreviewState();
        assert.equal(context.getSetDataBySetId(selected).tr_id, 114);
        assert.equal(context.opposingPreviewState.presetGauntletId, 'route-104');
        assert.equal(context.opposingPreviewState.teams.length, 3);
        assert.equal(context.getPokemonNullGauntlet(794, title), null);
        assert.equal(context.getPokemonNullGauntlet(860, title), null);
        context.syncOpposingPreviewState(context.customLeads[794]);
        assert.equal(context.opposingPreviewState.presetGauntletId, '');
        assert.equal(context.opposingPreviewState.mode, 'partner');
        assert.equal(context.opposingPreviewState.teams.length, 2);
    });
}

test('manual lists accept ten teams and restore all ten without activating presets', () => {
    const sets = {Pikachu: {}};
    for (let i = 0; i < 11; i++) sets.Pikachu[`Lvl 50 Team ${i}`] = {tr_id: -100 - i, sub_index: 0};
    const context = preview(sets, 'Other Game');
    const id = i => `Pikachu (Lvl 50 Team ${i})`;
    context.syncOpposingPreviewState(id(0));
    for (let i = 1; i < 10; i++) assert.equal(context.addOpposingPreviewTeam(id(i), 'b2b'), true);
    assert.equal(context.addOpposingPreviewTeam(id(10), 'b2b'), false);
    context.syncOpposingPreviewState(id(9));
    context.restoreOpposingPreviewState();
    assert.equal(context.opposingPreviewState.teams.length, 10);
    assert.equal(context.opposingPreviewState.selectedSetId, id(9));
    assert.deepEqual(Array.from(context.getOpposingPreviewCalculationSets(id(9))), [`${id(9)}[0]`]);
    assert.equal(context.getPokemonNullGauntlet(319, 'Other Game'), null);
});

test('incomplete or custom rosters never lock a partial preset list', () => {
    for (const custom of [false, true]) {
        const context = preview({Pikachu: {'Lvl 50 Trainer': {tr_id: 319, sub_index: 0, isCustomOpponentTeam: custom}}}, 'Pokemon Null 1.2');
        context.syncOpposingPreviewState('Pikachu (Lvl 50 Trainer)');
        assert.equal(context.opposingPreviewState.presetGauntletId, '');
        assert.equal(context.opposingPreviewState.mode, null);
        assert.equal(context.opposingPreviewState.teams.length, 1);
    }
});
