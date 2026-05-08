// Functions managing UI for right side player box

var BOX_SORT_DEFAULT_KEY = "species_name"
var BOX_SORT_DEFAULT_DIRECTION = "asc"
var BOX_SORT_STORAGE_KEY = "boxSortKey"
var BOX_SORT_DIRECTION_STORAGE_KEY = "boxSortDirection"
var BOX_SORT_ALLOWED_KEYS = {
    species_name: true,
    species_id: true,
    bst: true,
    hp: true,
    atk: true,
    def: true,
    spa: true,
    spd: true,
    spe: true,
    damage_dealt: true,
    damage_taken: true
}
var BOX_SORT_STATE = {
    key: BOX_SORT_DEFAULT_KEY,
    direction: BOX_SORT_DEFAULT_DIRECTION
}
var BOX_STAT_KEY_MAP = {
    hp: "hp",
    atk: "at",
    def: "df",
    spa: "sa",
    spd: "sd",
    spe: "sp"
}
var BOX_DAMAGE_SORT_KEYS = {
    damage_dealt: true,
    damage_taken: true
}
var BOX_MATCHUP_METRICS_CACHE = {
    fingerprint: null,
    metricsBySetId: {}
}
var PARTY_PREVIEW_OVERRIDE_SLOTS = null
var IMPORT_PARTY_PREVIEW_PRESERVATION_DEPTH = 0
var IMPORT_PARTY_PREVIEW_SNAPSHOT = null

function clonePartyPreviewSetData(setData) {
    if (!setData || typeof setData !== "object") {
        return null
    }
    if (typeof structuredClone === "function") {
        return structuredClone(setData)
    }
    return JSON.parse(JSON.stringify(setData))
}

function clearPartyPreviewSlotOverrides() {
    PARTY_PREVIEW_OVERRIDE_SLOTS = null
}

function getPartyPreviewSlotOverride(speciesName, slotIndex) {
    if (!Array.isArray(PARTY_PREVIEW_OVERRIDE_SLOTS)) {
        return null
    }
    var slotOverride = PARTY_PREVIEW_OVERRIDE_SLOTS[slotIndex]
    if (!slotOverride || slotOverride.speciesName !== speciesName) {
        return null
    }
    return slotOverride.setData || null
}

function capturePartyPreviewSnapshot() {
    var speciesList = Array.isArray(currentParty) ? currentParty.slice() : []
    var previewSlots = speciesList.map(function(speciesName, slotIndex) {
        var setData = getPartyPreviewSlotOverride(speciesName, slotIndex)
        if (!setData && setdex && setdex[speciesName] && setdex[speciesName]["My Box"]) {
            setData = setdex[speciesName]["My Box"]
        }
        return {
            speciesName: speciesName,
            setData: clonePartyPreviewSetData(setData)
        }
    })
    return {
        speciesList: speciesList,
        previewSlots: previewSlots
    }
}

function restorePartyPreviewSnapshot(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.speciesList)) {
        return
    }
    currentParty = snapshot.speciesList.slice()
    localStorage.currentParty = currentParty.join(",")
    PARTY_PREVIEW_OVERRIDE_SLOTS = Array.isArray(snapshot.previewSlots)
        ? snapshot.previewSlots.map(function(slotOverride) {
            return {
                speciesName: slotOverride.speciesName,
                setData: clonePartyPreviewSetData(slotOverride.setData)
            }
        })
        : null
    if (typeof displayParty === "function") {
        displayParty()
    }
}

function runWithImportPartyPreviewPolicy(operation) {
    if (typeof operation !== "function") {
        return
    }
    var shouldPreservePreview = typeof shouldImportPartyPreview === "function"
        ? !shouldImportPartyPreview()
        : false
    if (!shouldPreservePreview) {
        clearPartyPreviewSlotOverrides()
        return operation()
    }

    var isOutermostImport = IMPORT_PARTY_PREVIEW_PRESERVATION_DEPTH === 0
    if (isOutermostImport) {
        IMPORT_PARTY_PREVIEW_SNAPSHOT = capturePartyPreviewSnapshot()
    }
    IMPORT_PARTY_PREVIEW_PRESERVATION_DEPTH += 1

    try {
        return operation()
    } finally {
        IMPORT_PARTY_PREVIEW_PRESERVATION_DEPTH -= 1
        if (isOutermostImport) {
            restorePartyPreviewSnapshot(IMPORT_PARTY_PREVIEW_SNAPSHOT)
            IMPORT_PARTY_PREVIEW_SNAPSHOT = null
        }
    }
}

function isDamageBoxSortKey(sortKey) {
    return Boolean(BOX_DAMAGE_SORT_KEYS[sortKey])
}

function getSavedBoxSortKey() {
    var savedKey = localStorage.getItem(BOX_SORT_STORAGE_KEY)
    if (savedKey && BOX_SORT_ALLOWED_KEYS[savedKey]) {
        return savedKey
    }
    return BOX_SORT_DEFAULT_KEY
}

function getSavedBoxSortDirection() {
    var savedDirection = localStorage.getItem(BOX_SORT_DIRECTION_STORAGE_KEY)
    return savedDirection == "desc" ? "desc" : BOX_SORT_DEFAULT_DIRECTION
}

function persistBoxSortState() {
    localStorage.setItem(BOX_SORT_STORAGE_KEY, BOX_SORT_STATE.key)
    localStorage.setItem(BOX_SORT_DIRECTION_STORAGE_KEY, BOX_SORT_STATE.direction)
}

BOX_SORT_STATE.key = getSavedBoxSortKey()
BOX_SORT_STATE.direction = getSavedBoxSortDirection()

function findBoxPokemonBySetId(root, setId) {
    return $(root).find('.trainer-pok').filter(function() {
        return $(this).attr('data-id') == setId
    })
}

function findBoxSortCardsBySetId(root, setId) {
    return $(root).find('.box-sort-card').filter(function() {
        return $(this).attr('data-set-id') == setId
    })
}

function normalizeBoxAbilityForCalc(pokemon) {
    if (pokemon && pokemon.ability == "Intimidate") {
        pokemon.ability = "Honey Gather"
    }
    return pokemon
}

function getBoxSpeciesNameFromSetId(setId) {
    return String(setId || "").split(" (")[0]
}

function getBoxSpeciesBaseStats(speciesName) {
    var speciesData = (pokedex && pokedex[speciesName]) || {}
    var baseStats = speciesData.baseStats || speciesData.bs || {}
    return {
        hp: Number(baseStats.hp) || 0,
        at: Number(baseStats.atk != null ? baseStats.atk : baseStats.at) || 0,
        df: Number(baseStats.def != null ? baseStats.def : baseStats.df) || 0,
        sa: Number(baseStats.spa != null ? baseStats.spa : baseStats.sa) || 0,
        sd: Number(baseStats.spd != null ? baseStats.spd : baseStats.sd) || 0,
        sp: Number(baseStats.spe != null ? baseStats.spe : baseStats.sp) || 0
    }
}

function getBoxSpeciesId(speciesName) {
    if (Array.isArray(window.nullMons)) {
        var index = window.nullMons.indexOf(speciesName)
        if (index >= 0) {
            return index + 1
        }
    }
    return Number.MAX_SAFE_INTEGER
}

function getBoxSearchRowShouldDisplay() {
    return $('.player-poks .trainer-pok.left-side, .player-megas .trainer-pok.left-side').length > 0
}

function isFeaturedBoxSortKey(sortKey) {
    return !["species_name", "species_id"].includes(sortKey)
}

function syncBoxSortControls() {
    $('#search-row').css('display', getBoxSearchRowShouldDisplay() ? 'flex' : 'none')
    $('#box-sort-select').val(BOX_SORT_STATE.key)
    var isAscending = BOX_SORT_STATE.direction !== "desc"
    $('#box-sort-direction')
        .text(isAscending ? '↑' : '↓')
        .toggleClass('desc', !isAscending)
        .attr('title', isAscending ? 'Ascending' : 'Descending')
        .attr('aria-label', `Toggle ${isAscending ? 'descending' : 'ascending'} sort`)
}

function setBoxSortState(nextKey, nextDirection) {
    if (nextKey) {
        BOX_SORT_STATE.key = nextKey
    }
    if (nextDirection) {
        BOX_SORT_STATE.direction = nextDirection
    }
    persistBoxSortState()
    syncBoxSortControls()
}

function toggleBoxSortDirection() {
    BOX_SORT_STATE.direction = BOX_SORT_STATE.direction === "desc" ? "asc" : "desc"
    persistBoxSortState()
    syncBoxSortControls()
}

function getBoxInputFingerprint(selector) {
    return $(selector).find('input, select').map(function() {
        var key = this.id || this.name || this.className || this.tagName
        var type = (this.type || "").toLowerCase()
        var value = (type == "checkbox" || type == "radio") ? String(this.checked) : String($(this).val())
        return `${key}:${value}`
    }).get().join("|")
}

function getBoxMatchupContextOptions() {
    var opponentInfo = $("#p2")
    if (!opponentInfo.length) {
        return null
    }

    var opponent = normalizeBoxAbilityForCalc(createPokemon(opponentInfo))
    if (!opponent || !Array.isArray(opponent.types) || !opponent.types[0]) {
        return null
    }

    var p1field = createField()
    var p2field = p1field.clone().swap()
    var opponentCurrentHp = Number($('#p2').find('#currentHpL1').val())
    if (!opponentCurrentHp) {
        opponentCurrentHp = Number(opponent.originalCurHP) || 0
    }

    var totalStats = $('.total.totalMod')
    var opponentSpeed = parseInt(totalStats[1] && totalStats[1].innerHTML, 10)
    if (!Number.isFinite(opponentSpeed)) {
        opponentSpeed = Number(opponent.rawStats && opponent.rawStats.spe) || 0
    }

    return {
        fingerprint: [
            localStorage.customsets || "",
            $('.opposing.set-selector').first().val() || "",
            String(settings && settings.damageGen),
            String($('#filter-move').val() || ""),
            String($('#adv-boxrolls').prop('checked')),
            getBoxInputFingerprint('#p1'),
            getBoxInputFingerprint('#p2'),
            getBoxInputFingerprint('.field-info')
        ].join("::"),
        opponent: opponent,
        p1field: p1field,
        p2field: p2field,
        opponentCurrentHp: opponentCurrentHp,
        opponentSpeed: opponentSpeed,
        selectedMoveIndex: $('#filter-move option:selected').index(),
        advBoxrollsEnabled: $('#adv-boxrolls').prop('checked'),
        dealtMinRoll: $("#min-dealt").val(),
        takenMaxRoll: $("#max-taken").val()
    }
}

function expandBoxDamageRolls(damage, moveName, attacker, requireSkillLink) {
    if (!Array.isArray(damage)) {
        return []
    }

    var expanded = Array.isArray(damage[0]) ? damage.map(function(row) {
        return Array.isArray(row) ? row.slice() : row
    }) : damage.slice()
    var moveData = moves && moves[moveName] ? moves[moveName] : null
    if (!moveData || !moveData.multihit) {
        return normalize_damage(expanded)
    }

    if (requireSkillLink && (!attacker || attacker.ability != "Skill Link")) {
        return normalize_damage(expanded)
    }

    var hitCounts = moveData.multihit
    var targetHits = hitCounts[hitCounts.length - 1]
    while (expanded.length < targetHits) {
        expanded.push(Array.isArray(expanded[0]) ? expanded[0].slice() : expanded[0])
    }
    return normalize_damage(expanded)
}

function formatBoxDamagePercent(value) {
    if (!Number.isFinite(value)) {
        return "--"
    }
    return `${value.toFixed(1)}%`
}

function getBoxSortMetricValue(sortKey, setId) {
    var speciesName = getBoxSpeciesNameFromSetId(setId)
    var baseStats = getBoxSpeciesBaseStats(speciesName)

    if (sortKey == "species_name") {
        return speciesName
    }

    if (sortKey == "species_id") {
        return getBoxSpeciesId(speciesName)
    }

    if (sortKey == "bst") {
        return baseStats.hp + baseStats.at + baseStats.df + baseStats.sa + baseStats.sd + baseStats.sp
    }

    var statKey = BOX_STAT_KEY_MAP[sortKey]
    if (statKey) {
        return baseStats[statKey] || 0
    }

    if (isDamageBoxSortKey(sortKey)) {
        var metrics = getBoxMatchupMetrics(setId)
        if (sortKey == "damage_dealt") {
            return Number.isFinite(metrics.bestMinDealtPercent) ? metrics.bestMinDealtPercent : null
        }
        return Number.isFinite(metrics.worstMaxTakenPercent) ? metrics.worstMaxTakenPercent : null
    }

    return speciesName
}

function buildBoxSortValueMap(setIds, sortKey, contextOptions) {
    var valueMap = {}
    var safeSetIds = Array.isArray(setIds) ? setIds : []

    if (!safeSetIds.length) {
        return valueMap
    }

    if (isDamageBoxSortKey(sortKey)) {
        for (var i = 0; i < safeSetIds.length; i++) {
            var damageSetId = safeSetIds[i]
            var metrics = getBoxMatchupMetrics(damageSetId, contextOptions)
            valueMap[damageSetId] = sortKey == "damage_dealt"
                ? (Number.isFinite(metrics.bestMinDealtPercent) ? metrics.bestMinDealtPercent : null)
                : (Number.isFinite(metrics.worstMaxTakenPercent) ? metrics.worstMaxTakenPercent : null)
        }
        return valueMap
    }

    for (var j = 0; j < safeSetIds.length; j++) {
        var setId = safeSetIds[j]
        valueMap[setId] = getBoxSortMetricValue(sortKey, setId)
    }

    return valueMap
}

function compareBoxSortValues(leftValue, rightValue) {
    if (leftValue == null && rightValue == null) {
        return 0
    }
    if (leftValue == null) {
        return 1
    }
    if (rightValue == null) {
        return -1
    }

    if (typeof leftValue === "string" || typeof rightValue === "string") {
        var stringDiff = String(leftValue).localeCompare(String(rightValue))
        return BOX_SORT_STATE.direction === "desc" ? -stringDiff : stringDiff
    }

    var numericDiff = Number(leftValue) - Number(rightValue)
    return BOX_SORT_STATE.direction === "desc" ? -numericDiff : numericDiff
}

function applyCurrentBoxSort(selector, sortValueMap) {
    var container = $(selector)
    var mons = container.children('.box-sort-card').get()

    mons.sort(function(leftNode, rightNode) {
        var leftSetId = leftNode.getAttribute('data-set-id')
        var rightSetId = rightNode.getAttribute('data-set-id')
        var leftValue = sortValueMap && Object.prototype.hasOwnProperty.call(sortValueMap, leftSetId)
            ? sortValueMap[leftSetId]
            : getBoxSortMetricValue(BOX_SORT_STATE.key, leftSetId)
        var rightValue = sortValueMap && Object.prototype.hasOwnProperty.call(sortValueMap, rightSetId)
            ? sortValueMap[rightSetId]
            : getBoxSortMetricValue(BOX_SORT_STATE.key, rightSetId)
        var diff = compareBoxSortValues(
            leftValue,
            rightValue
        )

        if (diff !== 0) {
            return diff
        }

        return getBoxSpeciesNameFromSetId(leftSetId).localeCompare(getBoxSpeciesNameFromSetId(rightSetId))
    })

    $(mons).detach().appendTo(container)
}

function formatFeaturedSortValue(sortKey, value) {
    if (value == null || !Number.isFinite(Number(value))) {
        return "--"
    }

    if (sortKey == "damage_dealt") {
        return `${Number(value).toFixed(1)}%`
    }
    if (sortKey == "damage_taken") {
        return `${Number(value).toFixed(1)}%`
    }
    return `${Math.round(Number(value))}`
}

function updateFeaturedBoxResults(selector, sortValueMap) {
    var container = $(selector)
    var cards = container.children('.box-sort-card')
    cards.removeClass('featured')
    cards.find('.box-sort-metric').text('')

    if (!isFeaturedBoxSortKey(BOX_SORT_STATE.key)) {
        return
    }

    cards.slice(0, 6).each(function() {
        var setId = $(this).attr('data-set-id')
        var sortValue = sortValueMap && Object.prototype.hasOwnProperty.call(sortValueMap, setId)
            ? sortValueMap[setId]
            : getBoxSortMetricValue(BOX_SORT_STATE.key, setId)
        $(this)
            .addClass('featured')
            .find('.box-sort-metric')
            .text(formatFeaturedSortValue(BOX_SORT_STATE.key, sortValue))
    })
}

function getBoxMatchupMetrics(setId, options) {
    options = options || getBoxMatchupContextOptions()
    var speciesName = getBoxSpeciesNameFromSetId(setId)
    var fallbackMetrics = {
        setId: setId,
        speciesName: speciesName,
        speed: 0,
        bestMinDealtPercent: null,
        bestMinDealtMove: "",
        worstMaxTakenPercent: null,
        worstMaxTakenMove: "",
        faster: false,
        killer: false,
        defender: false,
        ohko: false,
        mbOhko: false,
        ohkod: false,
        mbOhkod: false
    }

    if (!options) {
        return fallbackMetrics
    }

    if (BOX_MATCHUP_METRICS_CACHE.fingerprint !== options.fingerprint) {
        BOX_MATCHUP_METRICS_CACHE.fingerprint = options.fingerprint
        BOX_MATCHUP_METRICS_CACHE.metricsBySetId = {}
    }

    if (BOX_MATCHUP_METRICS_CACHE.metricsBySetId[setId]) {
        return BOX_MATCHUP_METRICS_CACHE.metricsBySetId[setId]
    }

    var mon = normalizeBoxAbilityForCalc(createPokemon(setId))
    if (!mon || !Array.isArray(mon.types) || !mon.types[0]) {
        BOX_MATCHUP_METRICS_CACHE.metricsBySetId[setId] = fallbackMetrics
        return fallbackMetrics
    }

    var monSpeed = Number(mon.rawStats && mon.rawStats.spe) || 0
    var monHp = Number(mon.originalCurHP) || 0
    var dealtMinRoll = options.dealtMinRoll === "" ? 10000 : Number(options.dealtMinRoll)
    var takenMaxRoll = options.takenMaxRoll === "" ? -1 : Number(options.takenMaxRoll)
    var useDefaultColors = dealtMinRoll == 10000 && takenMaxRoll == -1 && options.advBoxrollsEnabled
    var results = calculateAllMoves(settings.damageGen, options.opponent, options.p1field, mon, options.p2field, false)
    var opposingResults = results[0] || []
    var playerResults = results[1] || []
    var matchingMoveCount = 0
    var hasUnsafeTakenMove = false
    var metrics = {
        setId: setId,
        speciesName: speciesName,
        speed: monSpeed,
        bestMinDealtPercent: null,
        bestMinDealtMove: "",
        worstMaxTakenPercent: null,
        worstMaxTakenMove: "",
        faster: monSpeed > options.opponentSpeed,
        killer: false,
        defender: false,
        ohko: false,
        mbOhko: false,
        ohkod: false,
        mbOhkod: false
    }

    for (var j = 0; j < 4; j++) {
        if (playerResults[j]) {
            var playerMoveName = playerResults[j].move.originalName || playerResults[j].move.name
            var playerDamage = expandBoxDamageRolls(playerResults[j].damage, playerResults[j].move.name, playerResults[j].attacker, true)
            if (playerDamage.length) {
                var minDealtPercent = options.opponentCurrentHp > 0 ? (playerDamage[0] / options.opponentCurrentHp) * 100 : null
                if (!Number.isFinite(metrics.bestMinDealtPercent) || minDealtPercent > metrics.bestMinDealtPercent) {
                    metrics.bestMinDealtPercent = minDealtPercent
                    metrics.bestMinDealtMove = playerMoveName
                }
                if (can_kill(playerDamage, options.opponentCurrentHp * dealtMinRoll / 100)) {
                    metrics.killer = true
                }
                if (useDefaultColors) {
                    if (can_kill(playerDamage, options.opponentCurrentHp)) {
                        metrics.ohko = true
                    } else if (kill_count > 0) {
                        metrics.mbOhko = true
                    }
                }
            }
        }

        if (!opposingResults[j]) {
            continue
        }

        var matchesSelectedMove = options.selectedMoveIndex == 0 || j == options.selectedMoveIndex - 1
        if (!matchesSelectedMove) {
            continue
        }

        matchingMoveCount += 1
        var opposingMoveName = opposingResults[j].move.originalName || opposingResults[j].move.name
        var opposingDamage = expandBoxDamageRolls(opposingResults[j].damage, opposingResults[j].move.name, opposingResults[j].attacker, false)
        if (!opposingDamage.length) {
            continue
        }

        var maxTakenPercent = monHp > 0 ? (opposingDamage[opposingDamage.length - 1] / monHp) * 100 : null
        if (matchesSelectedMove && (!Number.isFinite(metrics.worstMaxTakenPercent) || maxTakenPercent > metrics.worstMaxTakenPercent)) {
            metrics.worstMaxTakenPercent = maxTakenPercent
            metrics.worstMaxTakenMove = opposingMoveName
        }

        if (can_topkill(opposingDamage, monHp * takenMaxRoll / 100)) {
            hasUnsafeTakenMove = true
        }
        if (useDefaultColors) {
            can_topkill(opposingDamage, monHp)
            if (kill_count >= 16) {
                metrics.ohkod = true
            } else if (kill_count > 0) {
                metrics.mbOhkod = true
            }
        }
    }

    if (matchingMoveCount > 0 && !hasUnsafeTakenMove) {
        metrics.defender = true
    }

    BOX_MATCHUP_METRICS_CACHE.metricsBySetId[setId] = metrics
    return metrics
}

function hideBoxDamageTooltip() {
    $('#box-damage-tooltip').hide().html("")
}

function getBoxDamageTooltipLines(setId) {
    var context = getBoxMatchupContextOptions()
    if (!context) {
        return []
    }

    var metrics = getBoxMatchupMetrics(setId, context)
    var showThresholdTooltip = $('#player-poks-filter:visible').length > 0
    var hasMinDealt = showThresholdTooltip && $("#min-dealt").val() !== ""
    var hasMaxTaken = showThresholdTooltip && $("#max-taken").val() !== ""
    var lines = []

    if (hasMinDealt) {
        lines.push(`${formatBoxDamagePercent(metrics.bestMinDealtPercent)}${metrics.bestMinDealtMove ? ` w/ ${metrics.bestMinDealtMove}` : ""}`)
    }
    if (hasMaxTaken) {
        lines.push(`${formatBoxDamagePercent(metrics.worstMaxTakenPercent)}${metrics.worstMaxTakenMove ? ` from ${metrics.worstMaxTakenMove}` : ""}`)
    }

    if (!lines.length && BOX_SORT_STATE.key == "damage_dealt") {
        lines.push(`${formatBoxDamagePercent(metrics.bestMinDealtPercent)}${metrics.bestMinDealtMove ? ` w/ ${metrics.bestMinDealtMove}` : ""}`)
    }
    if (!lines.length && BOX_SORT_STATE.key == "damage_taken") {
        lines.push(`${formatBoxDamagePercent(metrics.worstMaxTakenPercent)}${metrics.worstMaxTakenMove ? ` from ${metrics.worstMaxTakenMove}` : ""}`)
    }

    return lines.filter(function(line) {
        return !line.includes("--")
    })
}

function updateBoxDamageTooltipPosition(event) {
    var tooltip = $('#box-damage-tooltip')
    if (!tooltip.is(':visible')) {
        return
    }
    var hoverTarget = event && event.currentTarget ? event.currentTarget : null
    var rect = hoverTarget && hoverTarget.getBoundingClientRect ? hoverTarget.getBoundingClientRect() : null
    var tooltipWidth = tooltip.outerWidth()
    var tooltipHeight = tooltip.outerHeight()
    var left
    var top

    if (rect) {
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
        top = rect.top - tooltipHeight - 8

        var minLeft = 8
        var maxLeft = window.innerWidth - tooltipWidth - 8
        left = Math.max(minLeft, Math.min(maxLeft, left))

        if (top < 8) {
            top = rect.bottom + 8
        }
    } else {
        left = event.pageX - (tooltipWidth / 2)
        top = event.pageY - tooltipHeight - 10
    }

    tooltip.css({
        left: `${left}px`,
        top: `${top}px`
    })
}

function maybeShowBoxDamageTooltip(event) {
    var setId = $(event.currentTarget).attr('data-id')
    if (!setId) {
        hideBoxDamageTooltip()
        return
    }
    if ($(event.currentTarget).closest('.box-sort-card').hasClass('featured')) {
        hideBoxDamageTooltip()
        return
    }

    var showForSort = isDamageBoxSortKey(BOX_SORT_STATE.key)
    var showForFilters = $('#player-poks-filter:visible').length > 0 && ($("#min-dealt").val() !== "" || $("#max-taken").val() !== "")
    if (!showForSort && !showForFilters) {
        hideBoxDamageTooltip()
        return
    }

    var lines = getBoxDamageTooltipLines(setId)
    if (!lines.length) {
        hideBoxDamageTooltip()
        return
    }

    $('#box-damage-tooltip')
        .html(lines.map(function(line) {
            return `<div class="damage-line">${line}</div>`
        }).join(""))
        .show()

    updateBoxDamageTooltipPosition(event)
}

function refreshBoxDisplay() {
    hideBoxDamageTooltip()
    if ($('#player-poks-filter:visible').length > 0) {
        box_rolls()
        return
    }
    get_box()
}

function sort_box_by_set(attr) {
    var box = $('.player-poks'),
    mons = box.children('.trainer-pok');
 
    mons.sort(function(a,b){
        mon1_id = a.getAttribute('data-id')
        mon1_species = mon1_id.split(" (")[0]
        mon1_data = setdex[mon1_species]["My Box"]

        mon2_id = b.getAttribute('data-id')
        mon2_species = mon2_id.split(" (")[0]
        mon2_data = setdex[mon2_species]["My Box"]

        var an = mon1_data[attr],
            bn = mon2_data[attr];
     
        if(an > bn) {
            return 1;
        }
        if(an < bn) {
            return -1;
        }
        return 0;
    });   
    mons.detach().appendTo(box);
}

function setBoxToLevelCap() {
    const levelCap = parseInt($('#lvl-cap').val());
    if (confirm(`Set Box to level ${levelCap}?`)) {
        for (set in customSets) {
            if (customSets[set]["My Box"]){
                customSets[set]["My Box"].level = levelCap;
                setdex[set]['My Box'].level = levelCap;
            }
        }
        localStorage.customsets = JSON.stringify(customSets);
        updateBoxAnim();
    }
}

$('#lvl-cap').on('contextmenu', function(e) {
    e.preventDefault()
    setBoxToLevelCap()
})

function sort_box_by_dex(attr) {
    var box = $('.player-poks'),
    mons = box.children('.trainer-pok');
 
    mons.sort(function(a,b){
        mon1_id = a.getAttribute('data-id')
        mon1_species = mon1_id.split(" (")[0]
        mon1_data = pokedex[mon1_species]

        mon2_id = b.getAttribute('data-id')
        mon2_species = mon2_id.split(" (")[0]
        mon2_data = pokedex[mon2_species]

        var an = mon1_data[attr],
            bn = mon2_data[attr];
     
        

        if(an > bn) {
            return 1;
        }
        if(an < bn) {
            return -1;
        }
        return 0;
    });   
    mons.detach().appendTo(box);
}

function abv(s, containerSelector = '.player-party') {
    if (!s) {
        return ""
    }

    var container = $(containerSelector)
    var containerWidth = container.width() || container.parent().width() || $('.player-party').width() || $('.trainer-poks').first().width() || 0
    if ((containerWidth / s.length <= 50)) {
        if (s.split(" ")[1]) {
            return (s.split(" ")[0][0] + " " + s.split(" ")[1]).slice(0,13)
        } else {
            return s.slice(0,13)
        }
        
    } else {
        return s
    }
}

function getPreviewSpriteName(species_name) {
    return species_name.toLowerCase().replace(" ","-").replace(".","").replace("’","").replace(":","-")
}

function isImportedEggSpecies(speciesName) {
    return Boolean(
        speciesName &&
        customSets &&
        customSets[speciesName] &&
        customSets[speciesName]["My Box"] &&
        customSets[speciesName]["My Box"].isEgg
    )
}

var manualTagPartnerSelectionPending = false
var manualTagPartnerTrainerId = false
var manualTagPartnerLockedTrainerIds = []

function getSelectedTagPartnerSourceSetId() {
    return $('.opposing.set-selector').first().val() || $('.opposing .select2-chosen').first().text() || ""
}

function getSetDataBySetId(setId) {
    if (!setId || !setId.includes(" (")) {
        return null
    }

    var species_name = setId.substring(0, setId.indexOf(" ("))
    var set_name = setId.substring(setId.indexOf("(") + 1, setId.lastIndexOf(")"))
    set_name = set_name.replace(/\)\[\d+\]$/, "").replace(/\[\d+\]$/, "")

    if (!setdex[species_name] || !setdex[species_name][set_name]) {
        return null
    }

    return setdex[species_name][set_name]
}

function getTrainerIdFromSet(setId) {
    var setData = getSetDataBySetId(setId)
    if (!setData || !setData.tr_id) {
        return false
    }

    return Number(setData.tr_id)
}

function getTagPartnerIdFromSet(setId) {
    var set_data = getSetDataBySetId(setId)
    if (!set_data) {
        return false
    }
    return set_data.tagPartner || false
}

function getTrainerSetsById(trainerId) {
    if (!trainerId || !setdex) {
        return []
    }

    var normalizedTrainerId = Number(trainerId)
    var trainerSets = []
    var orderIndex = 0

    for (const [speciesName, sets] of Object.entries(setdex)) {
        for (const [setName, setData] of Object.entries(sets)) {
            if (!setData || Number(setData.tr_id) !== normalizedTrainerId) {
                continue
            }

            trainerSets.push({
                setId: `${speciesName} (${setName})`,
                speciesName: speciesName,
                setData: setData,
                subIndex: Number.isFinite(Number(setData.sub_index)) ? Number(setData.sub_index) : Number.MAX_SAFE_INTEGER,
                orderIndex: orderIndex
            })
            orderIndex++
        }
    }

    trainerSets.sort(function(a, b) {
        if (a.subIndex !== b.subIndex) {
            return a.subIndex - b.subIndex
        }
        return a.orderIndex - b.orderIndex
    })

    return trainerSets
}

function getTagPartnerTrainerName(trainerId) {
    if (typeof customLeads !== "undefined" && customLeads && customLeads[trainerId]) {
        return get_trainer_name(customLeads[trainerId]) || "Tag Partner"
    }

    return "Tag Partner"
}

function setTagPartnerLabel(labelText, titleText) {
    $('.tag-partner-label').text(labelText).attr('title', titleText || labelText)
    $('.tag-partner-header').attr('title', titleText || labelText)
}

function beginManualTagPartnerSelection() {
    manualTagPartnerSelectionPending = true
    $('.player.set-selector').first().select2('open')
}

function clearManualTagPartnerSelectionPending() {
    manualTagPartnerSelectionPending = false
}

function isManualTagPartnerSelectionPending() {
    return manualTagPartnerSelectionPending
}

function clearManualTagPartnerOverride() {
    manualTagPartnerTrainerId = false
    manualTagPartnerLockedTrainerIds = []
}

function getCurrentTrainerPreviewIds() {
    var trainerIds = []

    function pushTrainerId(setId) {
        var trainerId = getTrainerIdFromSet((setId || "").split("[")[0])
        if (trainerId && !trainerIds.includes(trainerId)) {
            trainerIds.push(trainerId)
        }
    }

    if (typeof CURRENT_TRAINER_POKS !== "undefined" && CURRENT_TRAINER_POKS && CURRENT_TRAINER_POKS.length) {
        for (const trainerSet of CURRENT_TRAINER_POKS) {
            pushTrainerId(Array.isArray(trainerSet) ? trainerSet[0] : trainerSet)
        }
    }

    if (!trainerIds.length) {
        pushTrainerId(getSelectedTagPartnerSourceSetId())
    }

    return trainerIds
}

function setManualTagPartnerFromSet(setId) {
    var trainerId = getTrainerIdFromSet(setId)
    if (!trainerId) {
        return false
    }

    manualTagPartnerTrainerId = trainerId
    manualTagPartnerLockedTrainerIds = getCurrentTrainerPreviewIds()
    refreshTagPartnerPreview()
    return true
}

function maybeClearManualTagPartnerOverride(selectedSetId) {
    if (!manualTagPartnerTrainerId || !manualTagPartnerLockedTrainerIds.length) {
        return
    }

    var currentTrainerId = getTrainerIdFromSet(selectedSetId)
    if (!currentTrainerId || manualTagPartnerLockedTrainerIds.includes(currentTrainerId)) {
        return
    }

    clearManualTagPartnerOverride()
}

function sort_box_by_name(aToZ = true, selector = '.player-poks') {
    var box = $(selector),
    mons = box.children('.trainer-pok');
 
    mons.sort(function(a,b){
        mon1_id = a.getAttribute('data-id');
        mon1_species = mon1_id.split(" (")[0];

        mon2_id = b.getAttribute('data-id');
        mon2_species = mon2_id.split(" (")[0];

        if(mon1_species > mon2_species) {
            return aToZ ? 1 : -1;
        }
        if(mon1_species < mon2_species) {
            return aToZ ? -1 : 1;
        }
        return 0;
    });   
    mons.detach().appendTo(box);
}

function isMegaBoxEntry(speciesName) {
    return typeof speciesName === "string" && speciesName.includes("-Mega")
}

function toggleMegaBoxVisibility(hasMegas) {
    $('.player-megas-wrapper').toggle(Boolean(settings && settings.damageGen >= 6 && hasMegas))
}

function buildBoxSpriteHTML(setId, highlights) {
    var pok_name = setId.split(" (")[0].toLowerCase().replace(" ","-").replace(".","").replace(".","").replace("’","").replace(":","-")
    var highlightClasses = highlights ? ` ${highlights.trim()}` : ""
    return `<div class="box-sort-card${highlightClasses}" data-set-id="${setId}">
        <div class="box-sort-metric"></div>
        <img class="trainer-pok left-side ${sprite_style} ${highlights}" src="./img/${sprite_style}/${pok_name}.png" data-id="${setId}">
    </div>`
}

function generateCompactPreviewHTML({ setData, speciesName, dataId, interactiveClass = "", containerSelector = ".player-party", showItem = true, showNature = true, showAbility = true }) {
    var sprite_name = getPreviewSpriteName(speciesName)
    var imageClass = interactiveClass ? ` ${interactiveClass}` : ""
    var pok = `<div class="trainer-pok-container">
        <img class="trainer-pok${imageClass}" src="./img/${sprite_style}/${sprite_name}.png" data-id="${dataId}">`

    if (showItem && setData['item']) {
        var item_name = setData['item'].toLowerCase().replace(" ", "_").replace("'", "")
        pok += `<img class="trainer-pok-item" src="./img/items/${item_name}.png">`
    }

    var moves = setData['moves'] || []
    for (var i = 0; i < 4; i++) {
        if (moves[i]) {
            pok += `<div class="bp-info">${abv(moves[i].replace("Hidden Power", "HP"), containerSelector)}</div>`
        } else {
            pok += `<div class="bp-info"> - </div>`
        }
    }

    if (showNature) {
        pok += `<div class="bp-info nature-info">${setData['nature'] || ""}</div>`
    }

    if (showAbility) {
        pok += `<div class="bp-info extra-info">${setData['ability'] || ""}</div>`
    }

    pok += `</div>`
    return pok
}

function generatePartyHTML(set_data, species_name) {
    return generateCompactPreviewHTML({
        setData: set_data,
        speciesName: species_name,
        dataId: species_name + " (My Box)",
        interactiveClass: "left-side",
        containerSelector: ".player-party",
        showItem: true,
        showNature: true,
        showAbility: true
    })
}

function refreshTagPartnerPreview() {
    var wrapper = $('.tag-partner-preview-wrapper')
    var destination = $('.tag-partner-preview')
    var selectedSetId = getSelectedTagPartnerSourceSetId()
    maybeClearManualTagPartnerOverride(selectedSetId)
    var tagPartnerId = manualTagPartnerTrainerId || getTagPartnerIdFromSet(selectedSetId)

    destination.html("")

    if (!tagPartnerId) {
        wrapper.hide()
        setTagPartnerLabel('Tag Partner', 'Tag Partner')
        return
    }

    console.log('[Tag Partner] detected tag partner on right-side set', {
        sourceSetId: selectedSetId,
        tagPartnerId: tagPartnerId,
        selectedSetData: getSetDataBySetId(selectedSetId)
    })

    var trainerSets = getTrainerSetsById(tagPartnerId)
    if (!trainerSets.length) {
        console.warn('[Tag Partner] no sets found for detected tag partner trainer id', {
            sourceSetId: selectedSetId,
            tagPartnerId: tagPartnerId
        })
        wrapper.hide()
        setTagPartnerLabel('Tag Partner', 'Tag Partner')
        return
    }

    var trainerName = getTagPartnerTrainerName(tagPartnerId)
    console.log('[Tag Partner] rendering tag partner preview', {
        sourceSetId: selectedSetId,
        tagPartnerId: tagPartnerId,
        trainerName: trainerName,
        trainerSetIds: trainerSets.map(function(trainerSet) {
            return trainerSet.setId
        })
    })
    setTagPartnerLabel('Tag Partner', `Tag Partner: ${trainerName}`)

    for (const trainerSet of trainerSets) {
        destination.append(generateCompactPreviewHTML({
            setData: trainerSet.setData,
            speciesName: trainerSet.speciesName,
            dataId: trainerSet.setId,
            interactiveClass: "tag-partner-pok",
            containerSelector: ".tag-partner-preview",
            showItem: false,
            showNature: false,
            showAbility: false
        }))
    }

    wrapper.show()
}

function displayParty() {
    var destination = $('.player-party')
    $('.player-party').html("")

    if (Array.isArray(PARTY_PREVIEW_OVERRIDE_SLOTS) && PARTY_PREVIEW_OVERRIDE_SLOTS.length !== currentParty.length) {
        clearPartyPreviewSlotOverrides()
    }

    if (currentParty.length > 0) {
        $('.player-party').css('display', 'flex')
        $('#clear-party').css('display', 'inline-block')

        if (saveUploaded) {
            $('#edge').css('display', 'inline-block')
        }

        for (i in currentParty) {


            let pok = ""
            try {
                species_name = currentParty[i]
                var slotOverride = getPartyPreviewSlotOverride(species_name, Number(i))
                if (!slotOverride && !setdex[species_name]) {
                    continue;
                }
                if (isImportedEggSpecies(species_name)) {
                    continue;
                }
                var set_data = slotOverride || (setdex[species_name] && setdex[species_name]["My Box"])
                if (!set_data) {
                    continue;
                }
                pok = generatePartyHTML(set_data, species_name)
            } catch {
                $('.player-party').html("")
                $('.player-party').hide()
                $('#clear-party').hide()
                $('#edge').hide()
                break;
            }            
            destination.append(pok)
        }
    }

    refreshTagPartnerPreview()
}


function get_box() {
    var names = get_trainer_names()
    encounters = getEncounters()
    hideBoxDamageTooltip()

    var box = []

    var box_html = ""
    var mega_box_html = ""
    var megaCount = 0

    for (i in names) {
        if (names[i].includes("My Box")) {
            var setId = names[i].split("[")[0]
            var speciesName = setId.split(" (")[0]

            if (
                (typeof window.isSpeciesFamilyMarkedDead === "function" && window.isSpeciesFamilyMarkedDead(speciesName, encounters)) ||
                (encounters && encounters[speciesName] && !encounters[speciesName].alive) ||
                isImportedEggSpecies(speciesName)
            ) {
                continue
            }

            box.push(setId)

            var set_name = setId.trim()
            var highlights = ""

            if (typeof monHighlights != "undefined") {
                if (set_name in monHighlights.defenders) {
                    highlights += ' defender'
                }
                if (set_name in monHighlights.killers) {
                    highlights += ' killer'
                }
                if (set_name in monHighlights.faster) {
                    highlights += ' faster'
                }
                if (set_name in monHighlights.baiters) {
                    highlights += ' baiter'
                }
            }
            var pok = buildBoxSpriteHTML(setId, highlights)

            if (isMegaBoxEntry(speciesName)) {
                mega_box_html += pok
                megaCount += 1
            } else {
                box_html += pok
            }
        }   
    }


    $('.player-poks').html(box_html)
    $('.player-megas').html(mega_box_html)
    var renderedSetIds = $('.player-poks .box-sort-card, .player-megas .box-sort-card').map(function() {
        return $(this).attr('data-set-id')
    }).get()
    var sortContextOptions = isDamageBoxSortKey(BOX_SORT_STATE.key) ? getBoxMatchupContextOptions() : null
    var sortValueMap = buildBoxSortValueMap(renderedSetIds, BOX_SORT_STATE.key, sortContextOptions)
    applyCurrentBoxSort('.player-poks', sortValueMap)
    applyCurrentBoxSort('.player-megas', sortValueMap)
    updateFeaturedBoxResults('.player-poks', sortValueMap)
    updateFeaturedBoxResults('.player-megas', sortValueMap)
    toggleMegaBoxVisibility(megaCount > 0)
    syncBoxSortControls()
    filter_box()



    return box
}

function applyHighlights() {

}

function filter_box() {
    let search_string = $('#search-box').val().toLowerCase()
    let containers = $('.trainer-pok-list.player-poks, .trainer-pok-list.player-megas')

    // Hide Prevos
    if (localStorage.hidePrevos == '1' && typeof customSets != 'undefined') {
        containers.find('.box-sort-card').show()
        for (set in customSets) {
            let set_id = `${set} (My Box)`
            if (typeof window.shouldHideImportedPrevo === "function" && window.shouldHideImportedPrevo(set, customSets)) {
               findBoxSortCardsBySetId(containers, set_id).hide()
            }
        }
    }

    // Return if search string is too short
    if (search_string.length < 2) {
        containers.find('.trainer-pok.left-side').removeClass('active')
        return
    }

    containers.find('.trainer-pok.left-side').removeClass('active')
    for (set in customSets) {

        // remove megas
        let baseSet = set
        if (set.includes("-Mega")) {
            baseSet = set.replace("-Mega-X", "").replace("-Mega-Y", "").replace("-Mega-D", "").replace("-Mega-O", "").replace("-Mega", "")
        }
        
        let setInfo = JSON.stringify(customSets[set]).toLowerCase()
        let pokedexInfo = JSON.stringify(pokedex[set]).toLowerCase()
            
        let backupDataInfo = ""
        if (backup_data && backup_data.poks && backup_data.poks[set]) {
            backupDataInfo = JSON.stringify(backup_data.poks[set]).toLowerCase()
        }

        let set_id = `${set} (My Box)`

        let learnset = null



        try {
            if (TITLE.includes("Imperium")) {
                 learnset = JSON.stringify(learnsets[baseSet.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()]).toLowerCase()
            }
        } catch {
            
        }        


        const lowerCasePokName = set.toLowerCase()
        if (setInfo.includes(search_string) || lowerCasePokName.includes(search_string) || pokedexInfo.includes(search_string) || backupDataInfo.includes(search_string)) {
            findBoxPokemonBySetId(containers, set_id).addClass('active')
        }

        if (learnset) {
            if (learnset.includes(search_string)) {
                findBoxPokemonBySetId(containers, set_id).addClass('active')
            }
        }
    }
}

function box_rolls() {
    if (!parseInt(localStorage.boxrolls)) {
        return
    }
    var box = get_box()
    var killers = []
    var defenders = []
    var faster = []

    $('.player-poks .trainer-pok, .player-party .trainer-pok').removeClass('killer').removeClass('defender').removeClass('ohko').removeClass('mb-ohko').removeClass('ohkod').removeClass('mb-ohkod').removeClass('faster')

    var contextOptions = getBoxMatchupContextOptions()
    if (!contextOptions) {
        return {"killers": killers, "defenders": defenders, "faster": faster}
    }

    for (m = 0; m < box.length; m++) {
        if (contextOptions.opponent.level < 1) {
            break;
        }
        var metrics = getBoxMatchupMetrics(box[m], contextOptions)
        if (metrics.faster) {
            faster.push({"set": box[m]})
            findBoxPokemonBySetId(document, box[m]).addClass('faster')
        }

        if (metrics.killer) {
            killers.push({"set": box[m], "move": metrics.bestMinDealtMove})
            findBoxPokemonBySetId(document, box[m]).addClass('killer')
        }

        if (metrics.ohko) {
            findBoxPokemonBySetId(document, box[m]).addClass('ohko')
        } else if (metrics.mbOhko) {
            findBoxPokemonBySetId(document, box[m]).addClass('mb-ohko')
        }

        if (metrics.defender) {
            defenders.push({"set": box[m], "move": metrics.worstMaxTakenMove})
            findBoxPokemonBySetId(document, box[m]).addClass('defender')
        }

        if (metrics.ohkod) {
            findBoxPokemonBySetId(document, box[m]).addClass('ohkod')
        } else if (metrics.mbOhkod) {
            findBoxPokemonBySetId(document, box[m]).addClass('mb-ohkod')
        }
    }
    return {"killers": killers, "defenders": defenders, "faster": faster}  
}



// check if ai mon has >= 50% chance kills player
function can_kill(damages, hp) {
    damages = normalize_damage(damages)
    kill_count = 0
    for (n in damages) {
        if (damages[n] >= hp) {
            kill_count += 1
        }
    }
    return (kill_count >= 16)
}

// check if ai mon highest roll kills player
function can_topkill(damages, hp) {
    if (hp < 0) return true;
    kill_count = 0
    damages = normalize_damage(damages)

    for (n in damages) {
        if (damages[n] > hp) {
            kill_count += 1
        }
    }
    return (kill_count > 0)
}

function getTurnsToKill(damages, hp) {
    if (hp < 0) return 1;

    damages = normalize_damage(damages)

    return Math.ceil(hp / damages[damages.length - 1])
}

function normalize_damage(damages) {
    if (!Array.isArray(damages)) {
        return []
    }
    if (!Array.isArray(damages[0])) {
        return damages
    }
    var summed = []
    for (var i = 0; i < damages[0].length; i++) {
        summed[i] = 0
        for (var hit = 0; hit < damages.length; hit++) {
            summed[i] += damages[hit][i] || 0
        }
    }
    return summed
}

function sortTms () {
      let rows = $(".tms .ls-row").get();

      rows.sort(function (a, b) {
        let aText = $(a).find(".ls-level").text();
        let bText = $(b).find(".ls-level").text();

        // Extract type (TM/HM) and number
        let aMatch = aText.match(/(TM|HM)(\d+)/);
        let bMatch = bText.match(/(TM|HM)(\d+)/);

        if (!aMatch || !bMatch) return 0;

        let aType = aMatch[1];
        let bType = bMatch[1];
        let aNum = parseInt(aMatch[2], 10);
        let bNum = parseInt(bMatch[2], 10);

        // Sort by type: TM first, then HM
        if (aType !== bType) {
          return aType === "TM" ? -1 : 1;
        }

        // Sort by number
        return aNum - bNum;
      });

      // Append in sorted order
      $(".tms").append(rows);
    }

function get_current_learnset() {
    var pok_name = createPokemon($("#p1")).name
    if (pok_name.includes("-Mega")) {
        pok_name = pok_name.split("-Mega")[0]
    } else if (pok_name.includes("-Primal")) {
         pok_name = pok_name.split("-Primal")[0]
    }
    if (pok_name.includes("Ogerpon")) {
        pok_name = "Ogerpon"
    }

    if (pok_name.includes("Maushold")) {
        pok_name = "Maushold"
    }

    console.log(pok_name)
    pok_name = pok_name.replaceAll("é", "é")
    current_learnset = em_imp_primary_mons[pok_name]
    
    if (!current_learnset || !TITLE.includes("1.3")) {
        // $("#learnset-show").hide()
        return
    } else {
        $("#learnset-show").show()
    }

    current_learnset = current_learnset["learnset_info"]

    var ls_html = ""

    for (let i = 0; i < current_learnset["learnset"].length; i++) {
        var lvl = current_learnset["learnset"][i][0]
        var mv_name = current_learnset["learnset"][i][1]
        ls_html += `<div class='ls-row'><div class='ls-level'>${lvl}</div><div class='ls-name'>${mv_name}</div></div>`
    }
    $(".lvl-up-moves").html(ls_html)

    var tm_html = ""

    if (current_learnset["tms"]) {
        for (let i = 0; i < current_learnset["tms"].length; i++) {
            var mv_name = current_learnset["tms"][i]

            let tm_index = ""
            if (tms["tms"][mv_name]) {
                tm_index = `TM${tms["tms"][mv_name]}`
            } else if (tms["hms"][mv_name]) {
                tm_index = `HM${tms["hms"][mv_name]}`
            }

            let isLegal = (localStorage.legalTms && localStorage.legalTms.includes(mv_name)) || typeof localStorage.legalTms == 'undefined'

            tm_html += `<div class='ls-row ${isLegal ? '' : 'illegal'}'><div class='ls-level'>${tm_index}</div><div class='ls-name'>${mv_name}</div></div>`
        }
    }    
    $(".tms").html(tm_html)
    sortTms()

    var egg_html = ""

    var eggData = []
    if (evoData[pok_name] && evoData[pok_name].anc && em_imp_primary_mons[evoData[pok_name].anc]["learnset_info"]["egg"]) {
        eggData = em_imp_primary_mons[evoData[pok_name].anc]["learnset_info"]["egg"]
    }
    
    for (let i = 0; i < eggData.length; i++) {
        var mv_name = eggData[i]
        egg_html += `<div class='ls-row'><div class='ls-name'>${mv_name}</div></div>`
    }

    $(".egg").html(egg_html)

    let evo_html = ""
    if (em_imp_primary_mons[pok_name] && em_imp_primary_mons[pok_name]["evos"]) {
        let evos = em_imp_primary_mons[pok_name]["evos"]

    
        for (evo of evos) {
            let method = formatString(evo.method)
            let parameter = formatString(evo.parameter)
            let target = formatString(evo.target)
            
            evo_html += `<div class='ls-row'><div class='ls-level'>${method}: ${parameter}</div><div class='ls-name'>${target}</div></div>`
        }
        $(".evos").html(evo_html)   
    }
    return current_learnset    
}
