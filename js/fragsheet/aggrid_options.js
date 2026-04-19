params = new URLSearchParams(window.location.search);
let fragsheetGridInitialized = false;
SOURCES = window.romhackSourceTitles || {}

function initializeSplits() {
    TITLE = SOURCES[params.get('data')]
    $('#sheet-title').text(`${TITLE} Sheet`)
    splitTitles = splitData[TITLE]["titles"]
    for (title in splitTitles) {
        $(`#split-${parseInt(title)}-tab`).text(`${splitTitles[title]}`)
    }

    lvlcaps = splitData[TITLE]["lvls"]
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
            field: 'img',
            width: 80,
            cellRenderer: (params) => {
              if (params.data.species) {
                return `<img src="./img/pokesprite/${params.data.species.toLowerCase().replace(/[ :]/g, '-').replace(/[.’]/g, '')}.png" style="width: 60px; height: 60px; object-fit: cover;margin-top: 10px;" />`;
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



    $('.frag-row').remove()
    $('.split-container').hide()
    $('#stat-title').text(`${rowData.species}'s Battles`)
    for (let i = 0; i < 9; i++) {
        let container = $(`#split-1-container`)
        let fragList = rowData[`split${i}FragInfo`]
        let seenTrainers = {}

        for (const frag of fragList) {
            let trName = formatFragHistoryTrainerName(extractTrainerName(frag))
            
            let pokName = extractPokemonName(frag)
            let spritePath = `./img/pokesprite/${pokName.toLowerCase().replace(/[ :'.-]+/g, '-').replace(/^-|-glitched$|-$/g, '')}.png`
            let typing = splitData[TITLE]["types"][i]


            if (!seenTrainers[trName]) {
                let fragHTML = `<div class="frag-row">
                                    <div class="fragged-tr ${typing}-type"><div class="tr-name">${trName}</div> <div class="tr-split">${splitTitles[i]} Split</div></div>
                                    <div class="fragged-mons" data-tr="${trName}"><img src="${spritePath}"></div>
                                </div>`

                container.append(fragHTML)
                seenTrainers[trName] = true
                battleCount += 1
            } else {
                let fragHTML = `<img src="${spritePath}">`
                $(`[data-tr="${trName}"`).append(fragHTML)
            }
            $(container).show()
        }
    }
    $('#delete-enc').show().text(`Delete ${rowData.species}`)
    return battleCount    
}

function extractLevel(str) {
    const match = str.match(/Lvl (\d+)/);
    return match ? parseInt(match[1]) : null;
}

function extractTrainerName(str) {
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
    for (let i = 0; i < familyMembers.length; i++) {
        let familySpecies = familyMembers[i]
        if (encountersMap[familySpecies] && encountersMap[familySpecies].alive === false) {
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

function findLatestImportedLaterEvolution(speciesName, sourceData) {
    let latestBatchId = getLatestBoxImportBatchId()
    if (!latestBatchId || !sourceData || typeof sourceData !== "object") {
        return null
    }

    if (getImportBatchIdForSpeciesEntry(sourceData[speciesName]) === latestBatchId) {
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
    let currentBoxSets = getStoredCustomSetsForSpeciesHelpers()

    for (enc in encounters) {
        encRow = {}
        encRow.totalKo = 0

        let foundEvo = findAnyLaterEvolutionInBoxOrEncounters(enc, encounters, currentBoxSets)


        // merge frags with prevos
        let prevo = prevoData(enc, encounters)
        let uniqFrags = [...new Set(encounters[enc].frags.concat(prevo[1]))].filter(item => item !== undefined);

        encounters[enc].frags = uniqFrags
        encounters[enc].fragCount = uniqFrags.length
        encRow.frags = uniqFrags
        encRow.fragCount = uniqFrags.length






        if (foundEvo) {
            continue
        }

       if (encounters[enc].alive) {
        encRow.status = "Alive"
        aliveCount++
       } else {
        encRow.status = "Dead"
        deadCount++
       }

       let setData = encounters[enc].setData["My Box"]



       if (typeof setData == "undefined" && enc.includes("Rotom-") && typeof encounters["Rotom"].setData != "undefined") {
            setData = encounters["Rotom"].setData
       } 

       if (enc.includes("Greninja-") && typeof encounters["Greninja"].setData != "undefined") {
            setData = encounters["Greninja"].setData
       } 





       
       encRow.species = enc

        if (typeof setData == "undefined") {
            setData = {}
            encRow.nickname = enc
            encRow.encounterLocation = "Click to Edit"
            encRow.nature = "Unknown"
            encRow.ability = "Unknown"
        } else {
            encRow.nickname = setData.nn || enc
            encRow.encounterLocation = setData.met
            encRow.nature = setData.nature
            encRow.ability = setData.ability
        }

       if (!setData.ivs) {
           encRow.hp = 31
           encRow.at = 31
           encRow.df = 31
           encRow.sa = 31
           encRow.sd = 31
           encRow.sp = 31
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
       let totalKos = 0
       let splitFound = false

       let seenTrainers = {}

       for (const frag of encounters[enc].frags) {
        let level = extractLevel(frag)
        let trName = extractTrainerName(frag)


        globalSeenTrainers[trName] ||= true
        seenTrainers[trName] ||= true

        splitFound = false

        for( index in lvlcaps) {
            let minCap = 0

            if (index > 0) {
                minCap = lvlcaps[index - 1]
            }

            if (level <= lvlcaps[index] && level > minCap && (activeSplit == "all" || activeSplit == "all-simple" || activeSplit == index)) {
                encRow[`split${index}`] += 1
                encRow[`split${index}FragInfo`].push(frag)
                encRow.totalKo += 1
                allKos += 1 
                break
            }  
            if (index == 8 && level > minCap && (activeSplit == "all" || activeSplit == "all-simple" || activeSplit == 8)) {
                encRow[`split8`] += 1
                encRow[`split${index}FragInfo`].push(frag)
                encRow.totalKo += 1
                allKos += 1 
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

    if (typeof TITLE !== "string" || !splitData[TITLE]) {
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
