// Wandering Spirit has no fixed roster: its COPY_BATTLE party is the player's.
var POKEMON_NULL_WANDERING_SPIRIT_ID = 843
var pokemonNullWanderingSpirit = {roster: null, fingerprint: '', records: [], setIds: [], timer: null}

function supportsPokemonNullWanderingSpirit() {
    return typeof TITLE !== 'undefined' && ['Pokemon Null 1.2', 'Pokemon Null 1.2.5'].includes(TITLE)
}

function getPokemonNullWanderingSpiritSlot(setId) {
    var match = String(setId || '').match(/ \(Lvl \d+ Wandering Spirit Slot(\d+) \|Mt\. Pyre\|\)(?:\[\d+\])?$/)
    return supportsPokemonNullWanderingSpirit() && match ? Number(match[1]) - 1 : -1
}

function getPokemonNullWanderingSpiritTeam() {
    return {
        key: 'pokemon-null-wandering-spirit', name: 'Wandering Spirit |Mt. Pyre|',
        isPokemonNullWanderingSpirit: true,
        trainerId: POKEMON_NULL_WANDERING_SPIRIT_ID,
        leadSetId: pokemonNullWanderingSpirit.setIds[0] || '',
        setIds: pokemonNullWanderingSpirit.setIds.slice()
    }
}

function syncPokemonNullWanderingSpirit() {
    if (!supportsPokemonNullWanderingSpirit() || typeof setdex === 'undefined' || !setdex ||
        typeof capturePartyPreviewSnapshot !== 'function') return false
    var state = pokemonNullWanderingSpirit
    var slots = capturePartyPreviewSnapshot().previewSlots || []
    // During initial restoration the stored box is loaded just after initCalc.
    var stored = null
    var party = slots.map(function(slot, index) {
        var data = slot.setData
        if (!data) {
            if (!stored) stored = typeof getStoredCustomSets === 'function' ? getStoredCustomSets() : {}
            data = stored[slot.speciesName] && stored[slot.speciesName]['My Box']
        }
        if (!data || data.isEgg || (typeof isImportedEggSpecies === 'function' && isImportedEggSpecies(slot.speciesName))) return null
        var copy = {}
        var fields = ['level', 'nature', 'ivs', 'evs', 'dvs', 'moves', 'ability', 'item', 'gender', 'happiness', 'shiny', 'teraType']
        fields.forEach(function(key) {
            if (data[key] !== undefined) copy[key] = data[key]
        })
        copy = JSON.parse(JSON.stringify(copy))
        copy.level = Number(copy.level) || 100
        copy.moves = Array.isArray(copy.moves) ? copy.moves.slice(0, 4) : []
        copy.tr_id = POKEMON_NULL_WANDERING_SPIRIT_ID
        copy.sub_index = index
        copy.battle_type = 'Singles'
        copy.sprite = 'Ghost_May'
        copy.isPokemonNullWanderingSpirit = true
        // Copies are fresh opponents, not the player's remembered battle health.
        copy.status = 'Healthy'
        return {species: slot.speciesName, name: 'Lvl ' + copy.level + ' Wandering Spirit Slot' + (index + 1) + ' |Mt. Pyre|', data: copy}
    }).filter(Boolean)
    var fingerprint = JSON.stringify(party)
    if (state.roster === setdex && state.fingerprint === fingerprint && state.records.every(function(record) {
        return setdex[record.species] && setdex[record.species][record.name] === record.data
    })) return false

    state.records.forEach(function(record) {
        if (state.roster && state.roster[record.species] && state.roster[record.species][record.name] === record.data) {
            delete state.roster[record.species][record.name]
        }
    })
    party.forEach(function(record) {
        if (!setdex[record.species]) setdex[record.species] = {}
        setdex[record.species][record.name] = record.data
    })
    state.roster = setdex
    state.fingerprint = fingerprint
    state.records = party
    state.setIds = party.map(function(record) { return record.species + ' (' + record.name + ')[' + record.data.sub_index + ']' })
    if (typeof TR_NAMES !== 'undefined') TR_NAMES = get_trainer_names()
    if (typeof customLeads !== 'undefined' && customLeads) {
        delete customLeads[POKEMON_NULL_WANDERING_SPIRIT_ID]
        if (state.setIds.length) customLeads[POKEMON_NULL_WANDERING_SPIRIT_ID] = state.setIds[0]
    }
    return true
}

function queuePokemonNullWanderingSpiritRefresh() {
    if (!supportsPokemonNullWanderingSpirit() || pokemonNullWanderingSpirit.timer !== null) return
    pokemonNullWanderingSpirit.timer = setTimeout(function refresh() {
        if ((typeof initializing !== 'undefined' && initializing) || (typeof changingSets !== 'undefined' && changingSets)) {
            pokemonNullWanderingSpirit.timer = setTimeout(refresh, 20)
            return
        }
        pokemonNullWanderingSpirit.timer = null
        if (!syncPokemonNullWanderingSpirit() || !opposingPreviewReady || opposingPreviewState.presetGauntletId !== 'mt-pyre') return
        var state = opposingPreviewState
        var slot = getPokemonNullWanderingSpiritSlot(state.selectedSetId)
        if (slot >= 0) {
            var selected = pokemonNullWanderingSpirit.setIds.find(function(id) {
                return getSetDataBySetId(id).sub_index === slot
            }) || pokemonNullWanderingSpirit.setIds[0]
            // An empty party cannot be calculated; return to the preceding fight.
            if (!selected) selected = getTrainerSetsById(475)[0].setId
            var preset = getOpposingPreviewPreset(selected)
            if (preset) state.teams = preset.teams
            // Updating a mirrored party is a list edit, not a new gauntlet.
            lastOpposingTrainerIdentity = getOpposingTrainerIdentity(selected, getOpposingPreviewCalculationSets(selected))
            setOpposing(selected.replace(/\[\d+\]$/, ''))
            // The ordinary selector skips ranking refresh for the same set ID.
            queueRefreshNextIn()
        } else {
            refreshOpposingPreviewState()
        }
    }, 0)
}
