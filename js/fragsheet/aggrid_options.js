params = new URLSearchParams(window.location.search);
let fragsheetGridInitialized = false;
let globalSeenTrainers = {};
SOURCES = window.romhackSourceTitles || {}
const DEFAULT_FRAGSHEET_SPLIT_DATA = {
    "lvls": [Number.POSITIVE_INFINITY],
    "titles": ["All"],
    "types": []
}
let hasDetailedSplitData = true;

function getFragsheetSplitData(title) {
    if (typeof splitData !== "object" || !splitData) {
        return DEFAULT_FRAGSHEET_SPLIT_DATA;
    }

    if (splitData[title]) {
        return splitData[title];
    }

    const matchingTitle = Object.keys(splitData)
        .sort((left, right) => right.length - left.length)
        .find((knownTitle) => typeof title === "string" && title.includes(knownTitle));

    return matchingTitle ? splitData[matchingTitle] : DEFAULT_FRAGSHEET_SPLIT_DATA;
}

function syncSplitTabVisibility(splitConfig) {
    const splitTitles = Array.isArray(splitConfig && splitConfig["titles"]) ? splitConfig["titles"] : [];
    hasDetailedSplitData = splitConfig !== DEFAULT_FRAGSHEET_SPLIT_DATA;

    $('#all-tab').toggle(hasDetailedSplitData);
    for (let splitIndex = 0; splitIndex < 9; splitIndex++) {
        const hasSplit = hasDetailedSplitData && typeof splitTitles[splitIndex] !== "undefined";
        $(`#split-${splitIndex}-tab`)
            .toggle(hasSplit)
            .text(hasSplit ? `${splitTitles[splitIndex]}` : "");
    }
}

function initializeSplits() {
    TITLE = SOURCES[params.get('data')] || TITLE
    $('#sheet-title').text(`${TITLE} Sheet`)
    const splitConfig = getFragsheetSplitData(TITLE)
    splitTitles = splitConfig["titles"]
    syncSplitTabVisibility(splitConfig)

    lvlcaps = splitConfig["lvls"]
    if (typeof localStorage.encounters != "undefined" && localStorage.encounters != "") {

        encounters = JSON.parse(localStorage.encounters)
    }
    else {
        encounters = {}
    }
    rowData = []
    globalSeenTrainers = {}
    activeSplit = "all-simple"
    columnDefs = []
}

// Custom cell renderers
const statusCellRenderer = (params) => {
    return `<span class="status-${params.value.toLowerCase()}">${params.value}</span>`;
};

const pokemonImageRenderer = (params) => {
    return `<span class="pokemon-sprite">${params.value}</span>`;
};

const progressBarRenderer = (params) => {
    let percentage = params.value || 0;
    if (percentage == "NaN") {
        percentage = 0
    }
    return `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
            <div class="progress-text">${percentage}%</div>
        </div>
    `;
};

const splitsCellRenderer = (params) => {
    return `<div class="splits-cell">${params.value || 0}</div>`;
};

function updateEncounter(field, species, value) {
    encounters[species][field] = value
    localStorage.encounters = JSON.stringify(encounters)
}

function updateEncounterSetData(field, species, value) {
    encounters[species].setData["My Box"][field] = value
    localStorage.encounters = JSON.stringify(encounters)
}


function watchLocalStorageProperty(propertyName, callback) {
  window.addEventListener('storage', (event) => {
    // The storage event only fires when localStorage is changed in OTHER tabs/windows
    if (event.key === propertyName) {
      callback({
        key: event.key,
        oldValue: event.oldValue,
        newValue: event.newValue,
        url: event.url
      });
    }
  });
}

watchLocalStorageProperty('encounters', (data) => {
  console.log("Encounter Data Updated, refreshing table")
  encounters = JSON.parse(localStorage.encounters)
  refreshTables();
});

function setColumnDefs() {
    // Column definitions
    columnDefs = [
        {
            headerName: '#',
            field: 'rank',
            width: 60,
            pinned: 'left',
            cellStyle: params => {
                return { 'font-weight': 'bold' };
            },
            cellClassRules: {
              'rank-1': params => params.value === 1,
              'rank-2': params => params.value === 2,
              'rank-3': params => params.value === 3
            }
        },
        {
            headerName: 'Status',
            field: 'status',
            width: 85,
            cellRenderer: statusCellRenderer,
            menuTabs: []
        },
        {
            headerName: 'Img',
            field: 'species',
            width: 80,
            cellRenderer: (params) => {
              if (params.data.species) {
                return `<span class="fragsheet-grid-sprite"><img src="./img/pokesprite/${params.data.species.toLowerCase().replace(/[ :]/g, '-').replace(/[.’]/g, '').replace(/-totem$/g, '')}.png" alt="" /></span>`;
              }
              return '';
            },
            menuTabs: []
        },
        {
            headerName: 'Nickname',
            field: 'nickname',
            width: 115,
            menuTabs: [],
            editable: true,
            valueFormatter: (params) => getDisplayNickname(params.value, params.data && params.data.species),
            cellEditor: 'agTextCellEditor',
            onCellValueChanged: (event) => {
                updateEncounter('nn', event.data.species, event.newValue);
            }
        },
        {
            headerName: 'Species',
            field: 'species',
            width: 115,
            menuTabs: []
        },
        {
            headerName: 'Met Location',
            field: 'encounterLocation',
            width: 135,
            menuTabs: [],
            editable: true,
            cellEditor: 'agTextCellEditor',
            onCellValueChanged: (event) => {
                updateEncounterSetData('met', event.data.species, event.newValue);
            },
            valueFormatter: (params) => toTitleCase(params.value),
            cellStyle: params => {
                return { 'text-overflow': 'initial' };
            },
        },
        {
            headerName: 'S1',
            field: 'split0',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S2',
            field: 'split1',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all" 
        },
        {
            headerName: 'S3',
            field: 'split2',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S4',
            field: 'split3',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S5',
            field: 'split4',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S6',
            field: 'split5',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S7',
            field: 'split6',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'S8',
            field: 'split7',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'E4',
            field: 'split8',
            width: 55,
            cellRenderer: splitsCellRenderer,
            menuTabs: [],
            hide: activeSplit != "all"
        },
        {
            headerName: 'KOs',
            field: 'totalKo',
            width: 65,
            cellStyle: { 'font-weight': 'bold' },
            menuTabs: [],
            hide: activeSplit == 9
        },
        {
            headerName: 'KO Share',
            field: 'koShare',
            width: activeSplit == "all" ? 105 : 575,
            cellRenderer: progressBarRenderer,
            menuTabs: [],
            hide: activeSplit == 9
        },
        {
            headerName: 'Ability',
            field: 'ability',
            width: 145,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Nature',
            field: 'nature',
            width: 105,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Hp',
            field: 'hp',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Atk',
            field: 'at',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Def',
            field: 'df',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'SpA',
            field: 'sa',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'SpD',
            field: 'sd',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },
        {
            headerName: 'Spe',
            field: 'sp',
            width: 65,
            menuTabs: [],
            hide: activeSplit != 9
        },

    ];
}

function displayFragHistory(rowData) {
    let battleCount = 0

    $('#split-1-container').empty()
    $('.split-container').hide()
    $('#stat-title').text(`${rowData.species}'s Battles`)
    for (let i = 0; i < 9; i++) {
        let container = $(`#split-1-container`)
        let fragList = rowData[`split${i}FragInfo`]
        let seenTrainers = {}
        let hasRenderedSplitHeader = false

        if (!fragList.length) {
            continue
        }

        for (const fragEntry of fragList) {
            let frag = getFragEntryValue(fragEntry)
            let trName = formatFragHistoryTrainerName(extractTrainerName(frag))
            let sourceSpeciesName = getFragEntrySourceSpecies(fragEntry)
            let trainerKey = seenTrainers[trName]
            let wasMegaEvolved = isMegaFragSourceForDisplay(sourceSpeciesName, rowData.species)

            let pokName = extractPokemonName(frag)
            let spritePath = `./img/pokesprite/${pokName.toLowerCase().replace(/[ :'.-]+/g, '-').replace(/-totem$/g, '').replace(/^-|-glitched$|-$/g, '')}.png`
            let fragMonHtml = `<img src="${spritePath}" alt="${pokName}">`

            if (!hasRenderedSplitHeader) {
                container.append(renderFragHistorySplitSectionHeader(splitTitles[i]))
                hasRenderedSplitHeader = true
            }

            if (!trainerKey) {
                trainerKey = `split-${i}-battle-${battleCount}`
                let fragHTML = `<div class="frag-row">
                                    <div class="fragged-tr"><div class="tr-name">${escapeFragHistoryHtml(trName)}</div></div>
                                    <div class="fragged-mons" data-frag-key="${trainerKey}">${fragMonHtml}</div>
                                </div>`

                container.append(fragHTML)
                seenTrainers[trName] = trainerKey
                battleCount += 1
            } else {
                $(`[data-frag-key="${trainerKey}"]`).append(fragMonHtml)
            }

            if (wasMegaEvolved) {
                let fragRow = $(`[data-frag-key="${trainerKey}"]`).closest('.frag-row')
                if (!fragRow.find('.fragged-note').length) {
                    fragRow.append(`<div class="fragged-note">Mega Evolved</div>`)
                }
            }
            $(container).show()
        }
    }
    $('#delete-enc').show().text(`Delete ${rowData.species}`)
    return battleCount    
}

function extractLevel(str) {
    str = getFragEntryValue(str)
    const match = str.match(/Lvl (\d+)/);
    return match ? parseInt(match[1]) : null;
}

function extractTrainerName(str) {
    str = getFragEntryValue(str)
    // Find "Lvl " followed by numbers, then capture everything after it until the closing parenthesis
    const match = str.match(/Lvl \d+\s+(.+?)\s*\)/);
    return match ? match[1].trim() : null;
}

function formatFragHistoryTrainerName(name) {
    if (!name) {
        return name;
    }
    return String(name).split("|")[0].trim();
}

function extractPokemonName(str) {
    str = getFragEntryValue(str)
    // Match everything before the opening parenthesis and trim whitespace
    const match = str.match(/^(.+?)\s*\(/);
    return match ? match[1].trim() : null;
}

function toTitleCase(str) {
  if (!str) {
    return ""
  }
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDisplayNickname(nicknameValue, speciesName) {
    let nickname = String(nicknameValue || "").trim()
    if (!nickname || nickname === ".") {
        return ""
    }

    if (nickname.toLowerCase() === String(speciesName || "").toLowerCase()) {
        return ""
    }

    return nickname
}

function findRowDataBySpecies(speciesName) {
    for (row of rowData) {
        if (row.species == speciesName) {
            return row
        }
    }
    return {}
}

// Returns [fragCount, frags, met location, nickname]
function resolveEvoEntry(speciesName) {
    let resolvedSpeciesName = speciesName
    let evoEntry = evoData[resolvedSpeciesName]

    if (!evoEntry && speciesName.includes("-")) {
        resolvedSpeciesName = speciesName.split("-")[0]
        evoEntry = evoData[resolvedSpeciesName]
    }

    if (!evoEntry) {
        return null
    }

    let ancestor = evoEntry["anc"] || resolvedSpeciesName
    let ancestorEntry = evoData[ancestor]

    if (!ancestorEntry && ancestor.includes("-")) {
        ancestor = ancestor.split("-")[0]
        ancestorEntry = evoData[ancestor]
    }

    if (!ancestorEntry) {
        return null
    }

    return {
        resolvedSpeciesName: resolvedSpeciesName,
        ancestor: ancestor,
        ancestorEntry: ancestorEntry
    }
}

function getEvolutionChain(speciesName) {
    let resolved = resolveEvoEntry(speciesName)
    if (!resolved) {
        return []
    }

    // Some form-heavy families collapse multiple form evolutions onto the same
    // base species in evoData (for example Deerling -> Sawsbuck repeated 4x).
    // Deduping here prevents the "later evolution" checks from treating the
    // same species as its own later evolution and hiding the row.
    let rawChain = [resolved.ancestor].concat(resolved.ancestorEntry["evos"] || [])
    return rawChain.filter(function(chainSpeciesName, index) {
        return rawChain.indexOf(chainSpeciesName) === index
    })
}

function getSpeciesFamilyMembers(speciesName) {
    let chain = getEvolutionChain(speciesName)
    if (chain.length) {
        return chain
    }
    return speciesName ? [speciesName] : []
}

const WORMADAM_FORM_SPECIES = {
    "Wormadam": true,
    "Wormadam-Sandy": true,
    "Wormadam-Trash": true
}

function isWormadamFormSpecies(speciesName) {
    return Boolean(WORMADAM_FORM_SPECIES[speciesName])
}

function areInterchangeableWormadamForms(speciesName, otherSpeciesName) {
    return isWormadamFormSpecies(speciesName) && isWormadamFormSpecies(otherSpeciesName)
}

function speciesHasDeadEncounter(speciesName, encounterMap) {
    return Boolean(encounterMap && encounterMap[speciesName] && encounterMap[speciesName].alive === false)
}

function hasLiveWormadamFormEncounter(speciesName, encounterMap) {
    if (!isWormadamFormSpecies(speciesName) || !encounterMap || typeof encounterMap !== "object") {
        return false
    }

    let currentBoxSets = safeParseStoredObject(localStorage.customsets)
    for (let formSpeciesName in WORMADAM_FORM_SPECIES) {
        if (encounterMap[formSpeciesName] && encounterMap[formSpeciesName].alive !== false) {
            return true
        }

        if (speciesExistsInCustomSets(formSpeciesName, currentBoxSets) && !speciesHasDeadEncounter(formSpeciesName, encounterMap)) {
            return true
        }
    }

    return false
}

function getFragEntryValue(fragEntry) {
    if (fragEntry && typeof fragEntry === "object") {
        return String(fragEntry.value || "")
    }

    return String(fragEntry || "")
}

function parseFragLevelMetadata(fragEntry) {
    let fragValue = getFragEntryValue(fragEntry)
    let splitIndex = getFragEntrySplitIndex(fragEntry)
    let splitKey = splitIndex == null ? "" : `|split:${splitIndex}`
    let match = fragValue.match(/Lvl (\d+)(\*)?/)
    if (!match) {
        return {
            level: Number.POSITIVE_INFINITY,
            hasAsterisk: false,
            dedupeKey: `${fragValue}${splitKey}`
        }
    }

    return {
        level: parseInt(match[1], 10),
        hasAsterisk: Boolean(match[2]),
        dedupeKey: `${fragValue.replace(/Lvl \d+(\*)?/, `Lvl #${match[2] ? "*" : ""}`)}${splitKey}`
    }
}

function getFragEntrySourceSpecies(fragEntry) {
    if (!fragEntry || typeof fragEntry !== "object") {
        return ""
    }

    return String(fragEntry.sourceSpecies || "")
}

function normalizeFragSplitIndex(splitIndex) {
    if (splitIndex === null || typeof splitIndex === "undefined" || splitIndex === "") {
        return null
    }

    const parsed = Number(splitIndex)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 8) {
        return null
    }

    return Math.floor(parsed)
}

function getFragEntrySplitIndex(fragEntry) {
    if (!fragEntry || typeof fragEntry !== "object") {
        return null
    }

    return normalizeFragSplitIndex(fragEntry.splitIndex)
}

function getEncounterFragSplitIndex(encounter, fragValue) {
    if (!encounter || !encounter.fragSplitIndexes || typeof encounter.fragSplitIndexes !== "object") {
        return null
    }

    return normalizeFragSplitIndex(encounter.fragSplitIndexes[fragValue])
}

function activeSplitMatchesFragSplit(splitIndex) {
    return activeSplit == "all" || activeSplit == "all-simple" || Number(activeSplit) === Number(splitIndex)
}

function addFragEntryToRowSplit(encRow, splitIndex, fragEntry) {
    const normalizedSplitIndex = normalizeFragSplitIndex(splitIndex)
    if (normalizedSplitIndex == null || !activeSplitMatchesFragSplit(normalizedSplitIndex)) {
        return false
    }

    encRow[`split${normalizedSplitIndex}`] += 1
    encRow[`split${normalizedSplitIndex}FragInfo`].push(fragEntry)
    encRow.totalKo += 1
    allKos += 1
    return true
}

function escapeFragHistoryHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function getFragsheetMegaBaseSpecies(speciesName) {
    if (typeof speciesName !== "string") {
        return ""
    }

    let megaIndex = speciesName.indexOf("-Mega")
    if (megaIndex === -1) {
        return speciesName
    }

    return speciesName.slice(0, megaIndex)
}

function isMegaSpeciesForFragsheet(speciesName) {
    return typeof speciesName === "string" && speciesName.includes("-Mega")
}

function isMegaFragSourceForDisplay(sourceSpeciesName, displayedSpeciesName) {
    if (!isMegaSpeciesForFragsheet(sourceSpeciesName)) {
        return false
    }

    let sourceBaseSpecies = getFragsheetMegaBaseSpecies(sourceSpeciesName)
    return Boolean(sourceBaseSpecies && sourceBaseSpecies === displayedSpeciesName)
}

function slugifyFragHistorySplitLabel(label) {
    return String(label || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "")
        .trim()
}

function getFragHistorySplitHeaderSpriteCandidates(label) {
    const rawLabel = String(label || "").trim()
    if (!rawLabel) {
        return []
    }

    const candidates = []
    const seen = {}

    function pushCandidate(value) {
        const slug = slugifyFragHistorySplitLabel(value)
        if (!slug || seen[slug]) {
            return
        }
        seen[slug] = true
        candidates.push(`./img/trainer_sprites/${slug}.png`)
    }

    pushCandidate(rawLabel)

    if (rawLabel.includes("/")) {
        pushCandidate(rawLabel.split("/")[0])
    }

    if (rawLabel.includes("&")) {
        pushCandidate(rawLabel.split("&")[0])
    }

    return candidates
}

function renderFragHistorySplitSectionHeader(label) {
    const splitLabel = String(label || "").trim()
    const title = splitLabel ? `${splitLabel} Split` : "Split"
    const lowerLabel = splitLabel.toLowerCase()
    let spriteHtml = ""

    if (lowerLabel.includes("tate") && lowerLabel.includes("liza")) {
        spriteHtml = `
            <div class="battle-log-split-section-img-pair">
                <div class="battle-log-split-section-img-wrap">
                    <img
                        class="battle-log-split-section-img"
                        src="./img/trainer_sprites/tate.png"
                        alt=""
                        data-fallback-sources=""
                        onerror="window.handleBattleLogSplitHeaderImageError(this)"
                    >
                </div>
                <div class="battle-log-split-section-img-wrap">
                    <img
                        class="battle-log-split-section-img"
                        src="./img/trainer_sprites/liza.png"
                        alt=""
                        data-fallback-sources=""
                        onerror="window.handleBattleLogSplitHeaderImageError(this)"
                    >
                </div>
            </div>
        `
    } else {
        const spriteCandidates = getFragHistorySplitHeaderSpriteCandidates(splitLabel)
        const primarySprite = spriteCandidates[0] || ""
        const fallbackSprites = spriteCandidates.slice(1).join("|")
        spriteHtml = primarySprite
            ? `
                <div class="battle-log-split-section-img-wrap">
                    <img
                        class="battle-log-split-section-img"
                        src="${escapeFragHistoryHtml(primarySprite)}"
                        alt=""
                        data-fallback-sources="${escapeFragHistoryHtml(fallbackSprites)}"
                        onerror="window.handleBattleLogSplitHeaderImageError(this)"
                    >
                </div>
            `
            : ""
    }

    return `
        <div class="battle-log-split-section-header">
            ${spriteHtml}
            <div class="battle-log-split-section-title">${escapeFragHistoryHtml(title)}</div>
        </div>
    `
}

function speciesExistsInBoxOrEncounters(speciesName, encounters, boxSets) {
    return (
        speciesExistsInEncounterMap(speciesName, encounters) ||
        speciesExistsInCustomSets(speciesName, boxSets)
    )
}

function getFragsheetDisplaySpecies(speciesName, encounters, boxSets) {
    let latestImportedWormadamForm = findLatestImportedWormadamForm(boxSets)
    if (latestImportedWormadamForm && isWormadamFormSpecies(speciesName)) {
        return latestImportedWormadamForm
    }

    let resolved = resolveEvoEntry(speciesName)
    if (!resolved) {
        return speciesName
    }

    let evolutionChain = getEvolutionChain(speciesName)
    let resolvedSpeciesName = resolved.resolvedSpeciesName
    let sourceIndex = evolutionChain.indexOf(resolvedSpeciesName)
    if (sourceIndex < 0) {
        sourceIndex = evolutionChain.indexOf(speciesName)
    }

    if (sourceIndex < 0) {
        return speciesName
    }

    if (isMegaSpeciesForFragsheet(speciesName)) {
        for (let i = evolutionChain.length - 1; i >= 0; i--) {
            let candidateSpecies = evolutionChain[i]
            if (isMegaSpeciesForFragsheet(candidateSpecies)) {
                continue
            }
            return candidateSpecies
        }
        return getFragsheetMegaBaseSpecies(speciesName) || speciesName
    }

    for (let i = evolutionChain.length - 1; i > sourceIndex; i--) {
        let candidateSpecies = evolutionChain[i]
        if (isMegaSpeciesForFragsheet(candidateSpecies)) {
            continue
        }

        if (speciesExistsInBoxOrEncounters(candidateSpecies, encounters, boxSets)) {
            return candidateSpecies
        }
    }

    return resolvedSpeciesName || speciesName
}

function chooseFragsheetDisplaySetData(displaySpecies, sourceSpeciesList, encounters) {
    let preferredSources = [displaySpecies].concat(sourceSpeciesList || [])
    for (let i = 0; i < preferredSources.length; i++) {
        let speciesName = preferredSources[i]
        if (!encounters[speciesName] || !encounters[speciesName].setData || !encounters[speciesName].setData["My Box"]) {
            continue
        }
        return encounters[speciesName].setData["My Box"]
    }

    return null
}

function mergeFragsForDisplaySpecies(displaySpecies, sourceSpeciesList, encounters) {
    let mergedFrags = []
    let fragSourceMap = {}
    let orderedSources = Array.isArray(sourceSpeciesList) ? [...sourceSpeciesList] : []

    // Prefer non-mega/base entries when the same frag string exists in multiple forme buckets.
    orderedSources.sort(function(a, b) {
        return Number(isMegaSpeciesForFragsheet(a)) - Number(isMegaSpeciesForFragsheet(b))
    })

    for (let i = 0; i < orderedSources.length; i++) {
        let sourceSpecies = orderedSources[i]
        let encounter = encounters[sourceSpecies]
        if (!encounter || !Array.isArray(encounter.frags)) {
            continue
        }

        for (let fragIndex = 0; fragIndex < encounter.frags.length; fragIndex++) {
            let rawFragEntry = encounter.frags[fragIndex]
            let fragValue = getFragEntryValue(rawFragEntry)
            if (typeof rawFragEntry === "undefined" || !fragValue) {
                continue
            }

            let splitIndex = getFragEntrySplitIndex(rawFragEntry)
            if (splitIndex == null) {
                splitIndex = getEncounterFragSplitIndex(encounter, fragValue)
            }

            let fragKey = `${fragValue}::${splitIndex == null ? "" : splitIndex}`
            if (typeof fragSourceMap[fragKey] === "undefined") {
                fragSourceMap[fragKey] = {
                    value: fragValue,
                    sourceSpecies: sourceSpecies,
                    splitIndex: splitIndex
                }
                mergedFrags.push(fragKey)
            }
        }
    }

    return mergedFrags.map(function(fragKey) {
        return fragSourceMap[fragKey]
    })
}

function dedupeDisplayedFragEntriesByLevel(fragEntries) {
    let dedupedEntries = []
    let bestEntryByKey = {}
    let bestEntryIndexByKey = {}

    for (let i = 0; i < fragEntries.length; i++) {
        let fragEntry = fragEntries[i]
        let levelMetadata = parseFragLevelMetadata(fragEntry)
        let existingEntry = bestEntryByKey[levelMetadata.dedupeKey]

        if (!existingEntry) {
            bestEntryByKey[levelMetadata.dedupeKey] = fragEntry
            bestEntryIndexByKey[levelMetadata.dedupeKey] = dedupedEntries.length
            dedupedEntries.push(fragEntry)
            continue
        }

        let existingLevelMetadata = parseFragLevelMetadata(existingEntry)
        if (levelMetadata.level < existingLevelMetadata.level) {
            let existingIndex = bestEntryIndexByKey[levelMetadata.dedupeKey]
            bestEntryByKey[levelMetadata.dedupeKey] = fragEntry
            dedupedEntries[existingIndex] = fragEntry
        }
    }

    return dedupedEntries
}

function safeParseStoredObject(rawValue) {
    try {
        return rawValue ? JSON.parse(rawValue) : {}
    } catch (_error) {
        return {}
    }
}

function getStoredCustomSetsForSpeciesHelpers() {
    if (typeof customSets === "object" && customSets) {
        return customSets
    }
    return safeParseStoredObject(localStorage.customsets)
}

function speciesExistsInCustomSets(speciesName, boxSets) {
    let sets = boxSets || getStoredCustomSetsForSpeciesHelpers()
    return Boolean(sets && sets[speciesName] && sets[speciesName]["My Box"])
}

function speciesExistsInEncounterMap(speciesName, encounterMap) {
    return Boolean(encounterMap && typeof encounterMap === "object" && encounterMap[speciesName])
}

function isSpeciesFamilyMarkedDead(speciesName, encounterMap) {
    let encountersMap = encounterMap && typeof encounterMap === "object"
        ? encounterMap
        : safeParseStoredObject(localStorage.encounters)

    let familyMembers = getSpeciesFamilyMembers(speciesName)
    let hasLiveEquivalentWormadamForm = hasLiveWormadamFormEncounter(speciesName, encountersMap)
    for (let i = 0; i < familyMembers.length; i++) {
        let familySpecies = familyMembers[i]
        if (encountersMap[familySpecies] && encountersMap[familySpecies].alive === false) {
            if (hasLiveEquivalentWormadamForm && areInterchangeableWormadamForms(speciesName, familySpecies)) {
                continue
            }
            return true
        }
    }

    return false
}

window.getSpeciesFamilyMembers = getSpeciesFamilyMembers
window.isSpeciesFamilyMarkedDead = isSpeciesFamilyMarkedDead

function getLatestBoxImportBatchId() {
    return String(localStorage.latestBoxImportBatchId || "").trim()
}

function getImportBatchIdForSpeciesEntry(entry) {
    if (!entry || typeof entry !== "object") {
        return ""
    }

    if (entry["My Box"] && typeof entry["My Box"] === "object") {
        return String(entry["My Box"].boxImportBatchId || entry["My Box"].importBatchId || "").trim()
    }

    if (entry.setData && entry.setData["My Box"] && typeof entry.setData["My Box"] === "object") {
        return String(entry.setData["My Box"].boxImportBatchId || entry.setData["My Box"].importBatchId || "").trim()
    }

    return ""
}

function findLatestImportedWormadamForm(sourceData) {
    let latestBatchId = getLatestBoxImportBatchId()
    if (!latestBatchId || !sourceData || typeof sourceData !== "object") {
        return null
    }

    for (let formSpeciesName in WORMADAM_FORM_SPECIES) {
        if (getImportBatchIdForSpeciesEntry(sourceData[formSpeciesName]) === latestBatchId) {
            return formSpeciesName
        }
    }

    return null
}

function findLatestImportedLaterEvolution(speciesName, sourceData) {
    let latestBatchId = getLatestBoxImportBatchId()
    if (!latestBatchId || !sourceData || typeof sourceData !== "object") {
        return null
    }

    if (getImportBatchIdForSpeciesEntry(sourceData[speciesName]) === latestBatchId) {
        return null
    }

    let latestImportedWormadamForm = findLatestImportedWormadamForm(sourceData)
    if (latestImportedWormadamForm && isWormadamFormSpecies(speciesName)) {
        return latestImportedWormadamForm
    }

    let resolved = resolveEvoEntry(speciesName)
    if (!resolved) {
        return null
    }

    let evolutionChain = getEvolutionChain(speciesName)
    let sourceIndex = evolutionChain.indexOf(resolved.resolvedSpeciesName)
    if (sourceIndex < 0) {
        sourceIndex = evolutionChain.indexOf(speciesName)
    }

    if (sourceIndex < 0) {
        return null
    }

    for (let i = sourceIndex + 1; i < evolutionChain.length; i++) {
        let evolvedSpecies = evolutionChain[i]
        if (!sourceData[evolvedSpecies]) {
            continue
        }

        if (getImportBatchIdForSpeciesEntry(sourceData[evolvedSpecies]) === latestBatchId) {
            return evolvedSpecies
        }
    }

    return null
}

window.findLatestImportedLaterEvolution = findLatestImportedLaterEvolution
window.shouldHideImportedPrevo = function(speciesName, sourceData) {
    return Boolean(findLatestImportedLaterEvolution(speciesName, sourceData))
}

function findAnyLaterEvolutionInEncounters(speciesName, encounters) {
    if (!encounters || typeof encounters !== "object") {
        return null
    }

    let resolved = resolveEvoEntry(speciesName)
    if (!resolved) {
        return null
    }

    let evolutionChain = getEvolutionChain(speciesName)
    let sourceIndex = evolutionChain.indexOf(resolved.resolvedSpeciesName)
    if (sourceIndex < 0) {
        sourceIndex = evolutionChain.indexOf(speciesName)
    }

    if (sourceIndex < 0) {
        return null
    }

    for (let i = sourceIndex + 1; i < evolutionChain.length; i++) {
        let evolvedSpecies = evolutionChain[i]
        if (typeof encounters[evolvedSpecies] != "undefined") {
            return evolvedSpecies
        }
    }

    return null
}

function findAnyLaterEvolutionInBoxOrEncounters(speciesName, encounters, boxSets) {
    let resolved = resolveEvoEntry(speciesName)
    if (!resolved) {
        return null
    }

    let evolutionChain = getEvolutionChain(speciesName)
    let sourceIndex = evolutionChain.indexOf(resolved.resolvedSpeciesName)
    if (sourceIndex < 0) {
        sourceIndex = evolutionChain.indexOf(speciesName)
    }

    if (sourceIndex < 0) {
        return null
    }

    let currentBoxSets = boxSets || getStoredCustomSetsForSpeciesHelpers()
    for (let i = sourceIndex + 1; i < evolutionChain.length; i++) {
        let evolvedSpecies = evolutionChain[i]
        if (
            speciesExistsInEncounterMap(evolvedSpecies, encounters) ||
            speciesExistsInCustomSets(evolvedSpecies, currentBoxSets)
        ) {
            return evolvedSpecies
        }
    }

    return null
}

function prevoData(speciesName, encounters) {
    let resolved = resolveEvoEntry(speciesName)
    if (!resolved) {
        return [0, [], false, false]
    }

    let ancestor = resolved.ancestor
    let resolvedSpeciesName = resolved.resolvedSpeciesName

    if (ancestor == resolvedSpeciesName) {
        console.log("Is not evolved form")
        return [0, [], false, false]
    }

    let evos = [ancestor].concat(resolved.ancestorEntry["evos"] || [])

    // Look for later evolutions first
    for (let i = evos.length - 1; i >= 0; i--) {
        mon = evos[i]
        if (encounters[mon] && mon != resolvedSpeciesName) {
            return [encounters[mon].fragCount, encounters[mon].frags, encounters[mon].setData["My Box"].met, encounters[mon].setData["My Box"].nn]
        }
    }

    console.log("prevo data not found")
    return [0, [], false, false]
}



function createRowData() {
    allKos = 0
    aliveCount = 0
    deadCount = 0
    rowData = []
    globalSeenTrainers = {}
    let currentBoxSets = getStoredCustomSetsForSpeciesHelpers()
    let displaySpeciesMap = {}

    for (enc in encounters) {
        let displaySpecies = getFragsheetDisplaySpecies(enc, encounters, currentBoxSets)
        if (!displaySpeciesMap[displaySpecies]) {
            displaySpeciesMap[displaySpecies] = []
        }
        displaySpeciesMap[displaySpecies].push(enc)
    }

    for (let displaySpecies in displaySpeciesMap) {
        let sourceSpeciesList = displaySpeciesMap[displaySpecies]
        let encounterForDisplaySpecies = encounters[displaySpecies] || encounters[sourceSpeciesList[0]] || {}
        let setData = chooseFragsheetDisplaySetData(displaySpecies, sourceSpeciesList, encounters)
        let mergedFragEntries = dedupeDisplayedFragEntriesByLevel(
            mergeFragsForDisplaySpecies(displaySpecies, sourceSpeciesList, encounters)
        )
        let encRow = {}
        encRow.totalKo = 0
        encRow.species = displaySpecies
        encRow.sourceSpecies = sourceSpeciesList
        encRow.frags = mergedFragEntries.map(function(fragEntry) {
            return fragEntry.value
        })
        encRow.fragCount = encRow.frags.length
        let displaySpeciesAlive = !isSpeciesFamilyMarkedDead(displaySpecies, encounters)

        if (displaySpeciesAlive) {
            encRow.status = "Alive"
            aliveCount++
        } else {
            encRow.status = "Dead"
            deadCount++
        }

        if (typeof setData == "undefined" || setData == null) {
            setData = {}
            encRow.nickname = ""
            encRow.encounterLocation = "Click to Edit"
            encRow.nature = "Unknown"
            encRow.ability = "Unknown"
        } else {
            encRow.nickname = getDisplayNickname(setData.nn, displaySpecies)
            encRow.encounterLocation = setData.met
            encRow.nature = setData.nature
            encRow.ability = setData.ability
        }

        if (!setData.ivs) {
            encRow.hp = ""
            encRow.at = ""
            encRow.df = ""
            encRow.sa = ""
            encRow.sd = ""
            encRow.sp = ""
        } else {
            encRow.hp = setData.ivs.hp
            encRow.at = setData.ivs.at
            encRow.df = setData.ivs.df
            encRow.sa = setData.ivs.sa
            encRow.sd = setData.ivs.sd
            encRow.sp = setData.ivs.sp
        }

        for (let i = 0; i < 9; i++) {
            encRow[`split${i}`] = 0
            encRow[`split${i}FragInfo`] = []
        }

        let seenTrainers = {}

        for (const fragEntry of mergedFragEntries) {
            let frag = getFragEntryValue(fragEntry)
            let level = extractLevel(frag)
            let trName = extractTrainerName(frag)
            let splitIndex = getFragEntrySplitIndex(fragEntry)

            globalSeenTrainers[trName] ||= true
            seenTrainers[trName] ||= true

            if (splitIndex != null) {
                addFragEntryToRowSplit(encRow, splitIndex, fragEntry)
                continue
            }

            for (index in lvlcaps) {
                let minCap = 0

                if (index > 0) {
                    minCap = lvlcaps[index - 1]
                }

                if (level <= lvlcaps[index] && level > minCap && (activeSplit == "all" || activeSplit == "all-simple" || activeSplit == index)) {
                    addFragEntryToRowSplit(encRow, index, fragEntry)
                    break
                }
                if (index == 8 && level > minCap && (activeSplit == "all" || activeSplit == "all-simple" || activeSplit == 8)) {
                    addFragEntryToRowSplit(encRow, 8, fragEntry)
                }
            }
        }

        encRow.battleCount = Object.keys(seenTrainers).length
        rowData.push(encRow)
    }
    rowData = rowData.sort((a, b) => b.totalKo - a.totalKo);
    for (rowIndex in rowData) {
        rowData[rowIndex].rank = parseInt(rowIndex) + 1
        rowData[rowIndex].koShare = (rowData[parseInt(rowIndex)].totalKo / allKos * 100).toFixed(1) || 0
    }

    $('#alive-count').text(aliveCount)
    $('#dead-count').text(deadCount)
    $('#ko-count').text(allKos)
    $('#battle-count').text(Object.keys(globalSeenTrainers).length)
}

function refreshTables() {
    createRowData()
    setColumnDefs()
    gridApi.setGridOption('columnDefs', columnDefs);
    gridApi.setGridOption('rowData', rowData);

    // Filter frag history if visible, but avoid mutating the right panel while the
    // battle-log tab is active (that panel is repurposed there).
    if (typeof currentDisplayedSpecies != 'undefined' && !document.body.classList.contains('battle-log-mode')) {
        displayFragHistory(findRowDataBySpecies(currentDisplayedSpecies));
    }
}

$('.tab').click(function() {
    $('.tab').removeClass('active')
    $(this).addClass('active')
    
    if (!$(this).attr('data-split').includes("all") ) {
        activeSplit = parseInt($(this).attr('data-split'))
    } else {
        activeSplit = $(this).attr('data-split')
    }

    refreshTables()
})

$(document).on('click', '.status-alive', function() {
    $(this).removeClass('status-alive').addClass('status-dead').text("Dead")
    let speciesName = rowData[parseInt($(this).parent().parent().parent().attr('row-id'))].species
    updateEncounter('alive', speciesName, false)
})

$(document).on('click', '.status-dead', function() {
    $(this).removeClass('status-dead').addClass('status-alive').text("Alive")
    let speciesName = rowData[parseInt($(this).parent().parent().parent().attr('row-id'))].species
    updateEncounter('alive', speciesName, true)
})

$('#delete-enc').click(function() {
    let speciesName = $(this).text().split("Delete ")[1]
    if (confirm(`Delete ${speciesName} from your encounters and custom sets?`)) {
        delete encounters[speciesName]
        localStorage.encounters = JSON.stringify(encounters);

        createRowData()
        gridApi.setGridOption('rowData', rowData);

        var sets = JSON.parse(localStorage.customsets)

        delete sets[speciesName]['My Box']
        if (sets[speciesName] && Object.keys(sets[speciesName]).length === 0) {
            delete sets[speciesName]
        }
        localStorage.toDelete = speciesName
        localStorage.customsets = JSON.stringify(sets)




    }
})


function addRowTitles(gridApi) {

   for (index in rowData) {
        
        let rowElement = $(`[row-id="${index}"]`)

        let ivs = rowData[index].ivs
        let ivInfo = `${ivs["hp"]} HP / ${ivs["at"]} Atk / ${ivs["df"]} Def / ${ivs["sa"]} SpA / ${ivs["sd"]} SpD / ${ivs["sp"]} Spe`

        let setInfo = `${rowData[index].ability} ${rowData[index].nature} ${ivInfo}`

        console.log(rowData[index].species)


        $(rowElement).attr('title', setInfo)
   }
}




function ensureFragsheetGridInitialized() {
    if (fragsheetGridInitialized) {
        return window.gridApi || null;
    }

    const gridDiv = document.querySelector('#myGrid');
    if (!gridDiv || typeof agGrid === "undefined") {
        return null;
    }

    if (typeof TITLE !== "string") {
        return null;
    }

    initializeSplits()
    setColumnDefs()
    createRowData()

    const gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true
        },
        getRowStyle: params => {
            let styles = {}
            styles.cursor = "pointer"
            styles.class = `rank-${params.data.rank}`
            styles.title = `test`
            return styles
        },
        onRowClicked: (event) => {
            currentDisplayedSpecies = event.data.species;
            displayFragHistory(event.data)
        },
        rowHeight: 80,
        headerHeight: 40
    };
    window.gridApi = agGrid.createGrid(gridDiv, gridOptions);
    fragsheetGridInitialized = true;
    return window.gridApi;
}

window.ensureFragsheetGridInitialized = ensureFragsheetGridInitialized;

document.addEventListener('DOMContentLoaded', ensureFragsheetGridInitialized);
