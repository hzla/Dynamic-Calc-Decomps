
// Default trainer name list
function get_trainer_names() {
    var all_poks = setdex
    var trainer_names = [] 

    if (!all_poks || typeof all_poks !== "object") {
        return trainer_names
    }

    for (const [pok_name, poks] of Object.entries(all_poks)) {
        if (!poks || typeof poks !== "object") {
            continue
        }
        var pok_tr_names = Object.keys(poks)
        for (i in pok_tr_names) {
           var trainer_name = pok_tr_names[i]
           var sub_index = poks[trainer_name]["sub_index"]
           trainer_names.push(`${pok_name} (${trainer_name})[${sub_index}]`) 
        }      
    }
    return trainer_names
}

// Used for making next/prev button function
function get_custom_trainer_names() {
    var all_poks = setdex
    var trainer_names = {} 

    if (!all_poks || typeof all_poks !== "object") {
        return trainer_names
    }

    for (const [pok_name, poks] of Object.entries(all_poks)) {
        if (!poks || typeof poks !== "object") {
            continue
        }
        var pok_tr_names = Object.keys(poks)
        for (i in pok_tr_names) {
           var trainer_name = pok_tr_names[i]
           var sub_index = poks[trainer_name]["sub_index"]

           // If there's a mastersheet
           if (npoint_data["order"]) {
                // If this trainer is listed in the mastersheet
                if (npoint_data["order"][poks[trainer_name]["tr_id"]]) {
                    next = npoint_data["order"][poks[trainer_name]["tr_id"]]["next"]
                    prev = npoint_data["order"][poks[trainer_name]["tr_id"]]["prev"]
                    setdex[pok_name][trainer_name]["next"] = next
                    setdex[pok_name][trainer_name]["prev"] = prev
                }      
           }
           if (sub_index == 0 && !trainer_name.includes("Slot2") && !trainer_name.includes("Slot3") ) {
                trainer_names[poks[trainer_name]["tr_id"] || 0] = `${pok_name} (${trainer_name})[${sub_index}]`
           }     
        }      
    }
    return trainer_names
}

function get_trainer_name(set_name) {
    if (!set_name) {
        return null
    }

    // Pixelmon labels include a per-Pokémon #slot, while the entire preset
    // shares one trainer identity for team preview and navigation.
    var importedSet = typeof getSetDataFromSetId === "function" ? getSetDataFromSetId(set_name) : null
    if (importedSet && typeof importedSet.pixelmonTrainerName === "string") {
        return importedSet.pixelmonTrainerName
    }

    return getTrainerName(set_name)
}

function maybeRenderTeamVariations(tr_id) {
    
    $('#alt-team-bar').hide()

    let altTeamHtml = ""

    if (typeof rivalVariations != "undefined" && rivalVariations[tr_id]){
        if (rivalVariations[tr_id].length == 3) {
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][0] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][0]}">${starters[0]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][1] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][1]}">${starters[1]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][2] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][2]}">${starters[2]}</div>`
        } else if (rivalVariations[tr_id].length == 6) {
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][0] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][0]}">Dawn ${starters[0]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][1] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][1]}">Dawn ${starters[1]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][2] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][2]}">Dawn ${starters[2]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][3] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][3]}">Lucas ${starters[0]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][4] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][4]}">Lucas ${starters[1]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][5] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][5]}">Lucas ${starters[2]}</div>`
        }
        $('#alt-team-bar').html(altTeamHtml).show()
    }

    if (typeof teamVariations != "undefined" && teamVariations[tr_id]){
        console.log(`Alt teams: ${teamVariations[tr_id]}`)

        for (let teamIdx in teamVariations[tr_id]) {
            altTeamHtml += `<div class="alt-team ${teamVariations[tr_id][teamIdx] == tr_id ? "curr" : ""}" data-next="${teamVariations[tr_id][teamIdx]}">Team ${parseInt(teamIdx) + 1}</div>`
        }
        $('#alt-team-bar').html(altTeamHtml).show()
    }
}

function get_partner_name_from_tr_id(tr_id) {
    if (!tr_id || typeof customLeads === "undefined" || !customLeads || !customLeads[tr_id]) {
        return null
    }

    return get_trainer_name(customLeads[tr_id])
}

function get_set_partner_name(set_id) {
    if (!set_id) {
        return null
    }

    var pok_name = set_id.split(" (")[0]
    var tr_name = set_id.split(" (")[1]

    if (!pok_name || !tr_name) {
        return null
    }

    tr_name = tr_name.replace(/\)\[\d+\]$/, "").replace(/\)$/, "")

    if (!setdex[pok_name] || !setdex[pok_name][tr_name]) {
        return null
    }

    return get_partner_name_from_tr_id(setdex[pok_name][tr_name]["partner"])
}

function get_set_split(set_id) {
    if (!set_id) {
        return null
    }

    var pok_name = set_id.split(" (")[0]
    var tr_name = set_id.split(" (")[1]

    if (!pok_name || !tr_name) {
        return null
    }

    tr_name = tr_name.replace(/\)\[\d+\]$/, "").replace(/\)$/, "")

    if (!setdex[pok_name] || !setdex[pok_name][tr_name]) {
        return null
    }

    return setdex[pok_name][tr_name]["split"] || null
}

// Gets the trainers list of pokemon
// maybePartner is tr_id of possible partner
function get_trainer_poks(trainer_name, maybePartner=false, primaryOnly=false)
{
    if (typeof TR_NAMES == 'undefined') {
        return []
    }

    var matches = []
    var primaryMatches = []
    var partnerMatches = []
    function push_match(match) {
        if (!matches.includes(match)) {
            matches.push(match)
        }
    }
    function push_primary_match(match) {
        if (!primaryMatches.includes(match)) {
            primaryMatches.push(match)
        }
    }
    function push_partner_match(match) {
        if (!partnerMatches.includes(match)) {
            partnerMatches.push(match)
        }
    }
    function matches_trainer_name(set_id, target_name, white_space) {
        if (!target_name || !set_id.includes(target_name + white_space)) {
            return false
        }

        return target_name.split(" ").at(-1) == set_id.split(" ").at(-2) ||
            target_name.split(" ").at(-2) == set_id.split(" ").at(-2)
    }

    var canMatchTrainerIds = typeof getTrainerPreviewTrainerIdFromSet === "function"
    var primaryTrainerId = canMatchTrainerIds ? Number(getTrainerPreviewTrainerIdFromSet(trainer_name)) : 0
    var partnerTrainerId = primaryOnly ? 0 : Number(maybePartner) || 0

    trainer_name = stripTrainerLevelDuplicateMarkers(trainer_name)
    var og_trainer_name = get_trainer_name(trainer_name)
    var selected_team_label = og_trainer_name || ""

    let og_white_space = " "
    let partner_white_space = " "

    if (og_trainer_name && og_trainer_name.includes(" - ")) {
        og_white_space = ""
    }

    var maybePartnerName = get_partner_name_from_tr_id(maybePartner)
    var selectedSplit = TITLE == "Radical Red 4.1 Normal" ? get_set_split(trainer_name) : null

    var tempPartnerName = primaryOnly ? null : maybePartnerName || partnerName

    if (tempPartnerName && tempPartnerName.includes(" - ")) {
        partner_white_space = ""
    }


    for (i in TR_NAMES) {
        if (selectedSplit && get_set_split(TR_NAMES[i]) !== selectedSplit) {
            continue
        }

        var candidateTrainerId = canMatchTrainerIds ? Number(getTrainerPreviewTrainerIdFromSet(TR_NAMES[i])) : 0

        if (primaryTrainerId && candidateTrainerId === primaryTrainerId) {
            push_primary_match(TR_NAMES[i])
        } else if (!primaryTrainerId && matches_trainer_name(TR_NAMES[i], og_trainer_name, og_white_space)) {
            push_primary_match(TR_NAMES[i])
        }

        if (partnerTrainerId && candidateTrainerId === partnerTrainerId) {
            push_partner_match(TR_NAMES[i])
        } else if (!partnerTrainerId && tempPartnerName && matches_trainer_name(TR_NAMES[i], tempPartnerName, partner_white_space)) {
            push_partner_match(TR_NAMES[i])
        }
    }

    if (primaryMatches.length == 0 && partnerMatches.length == 0) {
        for (i in TR_NAMES) {
            if (selectedSplit && get_set_split(TR_NAMES[i]) !== selectedSplit) {
                continue
            }

            if (TR_NAMES[i].includes(og_trainer_name)) {
                if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
                   push_primary_match(TR_NAMES[i])
                }    
            }
        }
    }

    if (selected_team_label && primaryMatches.length > 0) {
        var labels = []
        var exactPrimaryMatches = []
        for (var i = 0; i < primaryMatches.length; i++) {
            var matchLabel = get_trainer_name(primaryMatches[i]) || ""
            if (!labels.includes(matchLabel)) {
                labels.push(matchLabel)
            }
            if (matchLabel == selected_team_label) {
                exactPrimaryMatches.push(primaryMatches[i])
            }
        }

        if (labels.length > 1 && exactPrimaryMatches.length > 0) {
            primaryMatches = exactPrimaryMatches
        }
    }

    for (var i = 0; i < primaryMatches.length; i++) {
        push_match(primaryMatches[i])
    }
    for (var i = 0; i < partnerMatches.length; i++) {
        push_match(partnerMatches[i])
    }

    return matches
}

// The visible list is separate from CURRENT_TRAINER_POKS: B2B reserves must
// never become reserves of the trainer currently being calculated.
var opposingPreviewState = {
    mode: null, teams: [], selectedSetId: "", suppressedPartner: false,
    pending: null, pinnedSetId: ""
}
var opposingPreviewReady = false
var opposingPreviewRoster = null

function getOpposingPreviewStorageKey() {
    var source = window.devDataOverrides
        ? window.devDataOverrides.getCurrentSourceId()
        : new URLSearchParams(window.location.search).get('data') || 'default'
    return 'calcOpposingPreview:' + source + ':' + TITLE
}

function getOpposingPreviewTeam(setId) {
    var data = getSetDataBySetId(setId)
    if (!data || data.isTemporaryOpponentSet || !get_trainer_name(setId)) return null
    var sets = get_trainer_poks(setId, false, true).sort(function(a, b) {
        return (Number(getSetDataBySetId(a).sub_index) || 0) - (Number(getSetDataBySetId(b).sub_index) || 0)
    })
    if (!sets.length) return null
    return {
        key: JSON.stringify([Number(data.tr_id) || null, get_trainer_name(setId), get_set_split(setId)]),
        name: get_trainer_name(setId), leadSetId: sets[0].replace(/\[\d+\]$/, ''), setIds: sets
    }
}

function getOpposingPreviewTeamIndex(setId) {
    var normalized = String(setId || '').replace(/\[\d+\]$/, '')
    return opposingPreviewState.teams.findIndex(function(team) {
        return team.setIds.some(function(id) { return id.replace(/\[\d+\]$/, '') === normalized })
    })
}

function saveOpposingPreviewState() {
    if (!opposingPreviewReady) return
    try {
        localStorage.setItem(getOpposingPreviewStorageKey(), JSON.stringify({
            version: 1, mode: opposingPreviewState.mode,
            teams: opposingPreviewState.teams.map(function(team) { return team.leadSetId }),
            selectedSetId: opposingPreviewState.selectedSetId,
            suppressedPartner: opposingPreviewState.suppressedPartner
        }))
    } catch (error) {
        console.warn('Could not save opposing trainer previews', error)
    }
}

function getValidOpposingPreviewSelection(setId) {
    if (typeof setId !== 'string' || !setId.includes(' (') || typeof setdex === 'undefined' || !setdex) return ''
    var data = getSetDataBySetId(setId)
    var species = setId.split(' (')[0]
    return (data && !data.isTemporaryOpponentSet) ||
        (setId.endsWith(' (Blank Set)') && typeof pokedex !== 'undefined' && pokedex[species]) ? setId : ''
}

function restoreOpposingPreviewState() {
    // shared_controls also runs before the asynchronous game data has arrived.
    // Leave persisted state untouched until trainer references can be resolved.
    if (typeof TR_NAMES === 'undefined' || !TR_NAMES.length) return getValidOpposingPreviewSelection(localStorage.right)
    opposingPreviewState = {
        mode: null, teams: [], selectedSetId: "", suppressedPartner: false,
        pending: null, pinnedSetId: ""
    }
    var saved = null
    try { saved = JSON.parse(localStorage.getItem(getOpposingPreviewStorageKey()) || 'null') } catch (error) { /* Discard invalid saved state. */ }
    if (saved && saved.version === 1 && Array.isArray(saved.teams)) {
        for (var ref of saved.teams.slice(0, saved.mode === 'partner' ? 2 : 4)) {
            var team = typeof ref === 'string' ? getOpposingPreviewTeam(ref) : null
            // Without the original anchor, the saved list no longer represents this battle.
            if (!opposingPreviewState.teams.length && !team) break
            if (team && !opposingPreviewState.teams.some(function(existing) { return existing.key === team.key })) {
                opposingPreviewState.teams.push(team)
            }
        }
        if (opposingPreviewState.teams.length) {
            opposingPreviewState.mode = opposingPreviewState.teams.length > 1 && ['partner', 'b2b'].includes(saved.mode) ? saved.mode : null
            if (!opposingPreviewState.mode) opposingPreviewState.teams = opposingPreviewState.teams.slice(0, 1)
            opposingPreviewState.suppressedPartner = saved.suppressedPartner === true
            opposingPreviewState.selectedSetId = getOpposingPreviewTeamIndex(saved.selectedSetId) >= 0
                ? saved.selectedSetId.replace(/\[\d+\]$/, '') : opposingPreviewState.teams[0].leadSetId
        }
    }
    var selected = opposingPreviewState.selectedSetId || localStorage.right || $('input.opposing').val()
    var anchor = typeof selected === 'string' ? getOpposingPreviewTeam(selected) : null
    // Migrate the old, unscoped setting only when both trainers exist in this game.
    var legacyName = localStorage.getItem('partnerName')
    partnerName = null
    localStorage.removeItem('partnerName')
    if (!saved && anchor && legacyName) {
        var legacySet = TR_NAMES.find(function(id) { return get_trainer_name(id) === legacyName })
        var legacyTeam = legacySet ? getOpposingPreviewTeam(legacySet) : null
        if (legacyTeam && legacyTeam.key !== anchor.key) {
            opposingPreviewState.teams = [anchor, legacyTeam]
            opposingPreviewState.mode = 'partner'
        }
    }
    opposingPreviewReady = true
    opposingPreviewRoster = TR_NAMES
    if (anchor) {
        syncOpposingPreviewState(selected)
        localStorage.right = selected
    } else {
        // Ordinary calculator sets can be selected without having a trainer team.
        selected = getValidOpposingPreviewSelection(selected)
        opposingPreviewState.selectedSetId = selected
        syncOpposingPreviewControls()
        saveOpposingPreviewState()
    }
    return selected
}

function syncOpposingPreviewControls() {
    var state = opposingPreviewState
    var valid = state.teams.length > 0
    $('#add-opposing-partner').prop('disabled', !valid || !!state.mode)
    $('#add-opposing-team').prop('disabled', !valid || state.mode === 'partner' || state.teams.length >= 4)
    $('#opposing-partner-active').prop('hidden', state.mode !== 'partner')
    $('#set-partner').text(state.mode === 'partner' || state.pinnedSetId ? 'Clear Partner' : 'Toggle as Partner')
}

function syncOpposingPreviewState(setId) {
    if (!opposingPreviewReady) return get_trainer_poks(setId, getTrainerPreviewPartnerIdFromSet(setId))
    var state = opposingPreviewState
    // Imports and custom-team deletions rebuild TR_NAMES. Refresh cached party
    // membership then, including when a deleted lead has a surviving teammate.
    if (opposingPreviewRoster !== TR_NAMES) {
        state.teams = state.teams.map(function(team) {
            var survivingSet = team.setIds.find(function(id) { return getSetDataBySetId(id) })
            return survivingSet ? getOpposingPreviewTeam(survivingSet) : null
        }).filter(Boolean)
        if (state.teams.length < 2 && state.mode) {
            state.mode = null
            state.suppressedPartner = true
        }
        opposingPreviewRoster = TR_NAMES
    }
    var index = getOpposingPreviewTeamIndex(setId)
    if (index < 0) {
        var anchor = getOpposingPreviewTeam(setId)
        var pinned = state.pinnedSetId ? getOpposingPreviewTeam(state.pinnedSetId) : null
        state.teams = anchor ? [anchor] : []
        state.mode = null
        state.suppressedPartner = false
        state.pending = null
        state.pinnedSetId = ''
        $('#opposing-preview-message').text('')
        if (anchor && pinned && anchor.key !== pinned.key) {
            state.teams.push(pinned)
            state.mode = 'partner'
        }
    }
    state.selectedSetId = String(setId || '').replace(/\[\d+\]$/, '')
    if (state.teams.length === 1 && !state.suppressedPartner) {
        var partnerId = getTrainerPreviewPartnerIdFromSet(setId)
        var partnerSets = partnerId ? getTrainerSetsById(partnerId) : []
        var autoTeam = partnerSets.length ? getOpposingPreviewTeam(partnerSets[0].setId) : null
        if (autoTeam && autoTeam.key !== state.teams[0].key) {
            state.teams.push(autoTeam)
            state.mode = 'partner'
        }
    }
    // Keep the compatibility variable scoped to actual partner mode, never B2B.
    var activeIndex = getOpposingPreviewTeamIndex(setId)
    partnerName = state.mode === 'partner' ? state.teams[activeIndex === 0 ? 1 : 0].name : null
    syncOpposingPreviewControls()
    saveOpposingPreviewState()
    return getOpposingPreviewCalculationSets(setId)
}

function getOpposingPreviewCalculationSets(setId) {
    var state = opposingPreviewState
    if (state.mode === 'partner') return state.teams.flatMap(function(team) { return team.setIds })
    var index = getOpposingPreviewTeamIndex(setId)
    return index >= 0 ? state.teams[index].setIds.slice() : get_trainer_poks(setId, false, true)
}

function beginOpposingPreviewSelection(mode) {
    var state = opposingPreviewState
    if (!state.teams.length || state.mode === 'partner' || (mode === 'partner' && state.mode) || state.teams.length >= 4) return
    state.pending = mode
    $('#opposing-preview-message').text('')
    $('input.opposing.set-selector').first().select2('open')
}

function addOpposingPreviewTeam(setId, mode) {
    var state = opposingPreviewState
    var team = getOpposingPreviewTeam(setId)
    if (!['partner', 'b2b'].includes(mode) || !team || !state.teams.length || state.mode === 'partner' || (mode === 'partner' && state.mode) || state.teams.length >= 4) return false
    if (state.teams.some(function(existing) { return existing.key === team.key })) {
        $('#opposing-preview-message').text('That trainer is already in the list.')
        return false
    }
    state.teams.push(team)
    state.mode = mode
    state.pinnedSetId = ''
    refreshOpposingPreviewState(mode === 'partner')
    return true
}

function applyOpposingPreviewFormat(setId) {
    var data = getSetDataBySetId(setId)
    if (!data) return
    var format = data.battle_type
    var singles = !format || format === 'Singles' || format === 'Rotation'
    var doubles = opposingPreviewState.mode === 'partner' || !singles
    $(doubles ? '#doubles-format' : '#singles-format').click()
}

function refreshOpposingPreviewState(updateFormat = false) {
    var state = opposingPreviewState
    CURRENT_TRAINER_POKS = syncOpposingPreviewState(state.selectedSetId)
    // Membership edits are not battle transitions and must not reset remembered health.
    lastOpposingTrainerIdentity = getOpposingTrainerIdentity(state.selectedSetId, CURRENT_TRAINER_POKS)
    if (updateFormat) applyOpposingPreviewFormat(state.selectedSetId)
    refresh_next_in()
    refreshTagPartnerPreview()
}

function removeOpposingPreviewTeam(index) {
    var state = opposingPreviewState
    if (index < 1 || index >= state.teams.length) return
    var wasPartner = state.mode === 'partner'
    var removingActive = getOpposingPreviewTeamIndex(state.selectedSetId) === index
    state.teams.splice(index, 1)
    state.suppressedPartner = true
    if (state.teams.length === 1) state.mode = null
    state.pinnedSetId = ''
    $('#opposing-preview-message').text('')
    if (removingActive) {
        // Set the new selection before changing the input, keeping this a list edit.
        state.selectedSetId = state.teams[0].leadSetId
        lastOpposingTrainerIdentity = getOpposingTrainerIdentity(state.selectedSetId, getOpposingPreviewCalculationSets(state.selectedSetId))
        setOpposing(state.selectedSetId)
    }
    refreshOpposingPreviewState(wasPartner)
}

function toggleOpposingPreviewPartner() {
    var state = opposingPreviewState
    if (state.mode === 'b2b') return
    if (state.mode === 'partner') {
        removeOpposingPreviewTeam(1)
    } else {
        state.pinnedSetId = state.pinnedSetId ? '' : state.selectedSetId
        $('#opposing-preview-message').text(state.pinnedSetId ? 'Select another trainer to add this trainer as a partner.' : '')
        syncOpposingPreviewControls()
    }
}

function escapeOpposingPreviewText(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function renderOpposingPreviewTeams(rankedEntries) {
    var state = opposingPreviewState
    if (!state.mode) return null
    var activeIndex = getOpposingPreviewTeamIndex(state.selectedSetId)
    return state.teams.map(function(team, index) {
        var active = index === activeIndex
        var cards = state.mode === 'partner' || active
            ? rankedEntries.filter(function(entry) { return getOpposingPreviewTeamIndex(entry[0]) === index }).map(function(entry) { return renderTrainerPreviewPok(entry) }).join('')
            : team.setIds.map(function(id) {
                var data = getSetDataBySetId(id)
                return renderTrainerPreviewPok([id, 0, '', data.sub_index, (data.moves || []).slice()], true)
            }).join('')
        var label = state.mode === 'partner' && index > 0 ? 'Partner: ' : ''
        var remove = index > 0 ? `<button type="button" class="opposing-team-remove" data-team-index="${index}" aria-label="Remove ${escapeOpposingPreviewText(team.name)}" title="Remove team">&times;</button>` : ''
        return `<div class="opposing-team-group${active ? ' active-team' : ''}" data-team-index="${index}">
            <div class="trainer-preview-label opposing-team-heading"><span>${label}${escapeOpposingPreviewText(team.name)}</span>${remove}</div>
            <div class="trainer-preview-section ${index === 0 ? 'trainer-preview-primary' : state.mode === 'partner' ? 'trainer-preview-partner' : 'trainer-preview-b2b'}">${cards}</div>
        </div>`
    }).join('')
}

// Get the current selected trainer pokemon
function get_current_in(refreshBoxRolls = true) {
    var setInfo = $('.opposing.set-selector').first().val() || $('.opposing .select2-chosen').first().text()
    if (!setInfo || !setInfo.includes(" (")) {
        return null
    }
    var pok_name = setInfo.split(" (")[0]
    var setNamePart = setInfo.split(" (")[1]
    if (!setNamePart) {
        return null
    }
    var tr_name = setNamePart.replace(")", "").split("[")[0]

    if (refreshBoxRolls && typeof queueBoxMatchupRefresh === "function") {
        queueBoxMatchupRefresh()
    }
    return setdex && setdex[pok_name] ? setdex[pok_name][tr_name] : null
}

function setOpposing(id) {
    currentTrainerSet = id
    localStorage["right"] = currentTrainerSet

    $('.opposing').val(currentTrainerSet)

    // turn set setting into a function and just call it manually here
    $($('.opposing')[1]).change()
    $('.opposing .select2-chosen').text(currentTrainerSet)
    // if ($('.info-group.opp > * > .forme').is(':visible')) {
    //     $('.info-group.opp > * > .forme').change()
    // }
    if ($('#player-poks-filter:visible').length > 0 && typeof queueBoxMatchupRefresh === "function") {
       queueBoxMatchupRefresh()
    }
    if (typeof syncOpposingKoButton === "function") {
        syncOpposingKoButton()
    }
}
