// Initializing settings from local storage and setting default global variables

params = new URLSearchParams(window.location.search);
devMode = params.get('dev') == '1'
g = params.get('gen');
damageGen = parseInt(params.get('dmgGen'))
type_chart = parseInt(params.get('types'))
type_mod = params.get('type_mod')
switchIn = parseInt(params.get('switchIn'))
noSwitch = params.get('noSwitch')
hasEvs = params.get('evs') != '0'
challengeMode = params.get('challengeMode')
FAIRY = params.get('fairy') == '1'
misc = params.get('misc')
invert = params.get('invert')
DEFAULTS_LOADED = false
analyze = false
limitHits = false
FIELD_EFFECTS = {}

if (damageGen <= 3) {
    $('#player-poks-filter').remove()
}

SETDEX_BW = null
TR_NAMES = null
BACKUP_MODE = params.get('backup')
params = new URLSearchParams(window.location.search)

SOURCES = {
  "9aa37533b7c000992d92": "Blaze Black/Volt White",
  "04770c9a89687b02a9f5": "Blaze Black 2/Volt White 2 Original",
  "945a33720dbd6bc04488": "Blaze Black 2/Volt White 2 Redux 1.4",
  "da1eedc0e39ea07b75bf": "Vintage White",
  "26138cc1d500b0cf7334": "Renegade Platinum",
  "03e577af7cc9856a1f42": "Sacred Gold/Storm Silver",
  "9e7113f0ee22dad116e1": "Platinum Redux 5.2 TC6",
  "b6e2693147e215f10f4a": "Radical Red 3.02",
  "e91164d90d06a009e6cc": "Radical Red 4.1 Hardcore",
  "7a1ed35468b22ea01103": "Ancestral X",
  "8c3ca30ba346734d5e4f": "Run & Bun",
  "f109940e5639c3702e6d": "Rising Ruby/Sinking Saphire",
  "00734d33040067eb7e9f": "Grand Colloseum 2.0",
  "24bbfc0e69ff4a5c006b": "Emerald Kaizo",
  "13fc25a3b19071978dd6": "Platinum",
  "be0a4fedbe0ff31e47b0": "Heart Gold/Soul Silver",
  "78381c312866ee2e6ff9": "Black/White",
  "83c196dce6759252b3f4": "Black 2/White 2",
  "8d1ab90a3b3c494d8485": "Eternal X/Wilting Y Insanity Rebalanced",
  "68bfb2ccba14b7f6b1f0": "Inclement Emerald",
  "e9030beba9c1ba8804e8": "Kaizo Colloseum",
  "6875151cfa5eea00eafa": "Inclement Emerald No EVs",
  "8f199f3f40194ecc4b8e": "Sterling Silver 1.14",
  "7ea3ff9a608c1963a0a5": "Sterling Silver 1.15",
  "b819708dba8f8c0641d5": "Sterling Silver 1.16",
  "5b789b0056c18c5c668b": "Platinum Redux 2.6",
  "de22f896c09fceb0b273": "Maximum Platinum",
  "a0ff5953fbf39bcdddd3": "Cascade White 2",
  "ee9b421600cd6487e4e3": "Photonic Sun/Prismatic Moon",
  "d3501821feaa976d581a": "Azure Platinum",
  "9abb79df1e356642c229": "Fire Red Omega",
  "12f82557ed0e08145660": "Fire Red",
  "aeb373b7631d4afd7a53": "Emerald",
  "006ac04e900ccb3110df": "Luminescent Platinum",
  "2ec049ba9513d189a915": "Emerald Imperium",
  "55d895a19083b26c0c53": "Emerald Imperium 1.2",
  "imp13": "Emerald Imperium 1.3",
  "ced457ba9aa55731616c": "Radical Red 4.1 Normal"
}

INC_EM = false
if (SOURCES[params.get('data')]) {
    TITLE = SOURCES[params.get('data')] || "NONE"

    // redirect for old ren plat url
    if (params.get('data') == 'bd7fc78f8fa2500dfcca') {
        location.href = 'https://hzla.github.io/Dynamic-Calc/?data=26138cc1d500b0cf7334&gen=7&switchIn=4&types=6'
    }

    baseGame = ""
    if (TITLE.includes("Inclement") ) {
        baseGame = "inc_em"
    } else if (TITLE.includes("Imperium")) {
        baseGame = "imp"
    }

    if (!baseGame) {
        $('#read-save').hide()
    } else {
        $('.save-editor-guide').show()
    }

    $('.genSelection').hide()
    $('#rom-title').text(TITLE).show()
    if (TITLE.includes("Radical Red") || TITLE.includes("Emerald Imperium")) {
        // INC_EM = true
        $("#lvl-cap").show()
        // $("#harsh-sunshine").next().text("Ability Sun")
        // $("#heavy-rain").next().text("Ability Rain")
    }

    if ( TITLE == "Cascade White 2") {
        $('.cascade-effects .btn-small').show()
    }
} else {
    TITLE = "NONE"
}



function initCalc() {
  var head= document.getElementsByTagName('head')[0];
  var script= document.createElement('script');
  script.src= './js/shared_controls.js?0b3ea005';
  head.appendChild(script);
  saveUploaded = false
  boxSprites = ["pokesprite", "pokesprite"]
  themes = ["old", "new"]
  trueHP = true
  fainted = []
  lastSetName = ""
  disableKOChanceCalcs = false

  pokChanges = {}
  calcing = false

  // local storage settings defaults
  if (typeof localStorage.partnerName === 'undefined') {
     partnerName = null 
  } else {
    partnerName = localStorage.partnerName
  }

  if (typeof localStorage.currentParty == "undefined" || localStorage.currentParty == "") {
    currentParty = []
  } else {
    currentParty = localStorage.currentParty.split(",")
  }

  if (typeof localStorage.boxspriteindex === 'undefined') {
    localStorage.boxspriteindex = 1
  }

  if (typeof localStorage.watchSaveFile === 'undefined') {
    localStorage.watchSaveFile = 0
  }

  if (typeof localStorage.filterSaveFile === 'undefined') {
    localStorage.filterSaveFile = 0
  }

  if (typeof localStorage.themeIndex === 'undefined') {
    localStorage.themeIndex = 1
  }
  if (typeof localStorage.lvlCap != 'undefined') {
    $('#lvl-cap').val(localStorage.lvlCap)
  }
  localStorage.toDelete = ""

  if (parseInt(localStorage.themeIndex) == 0) {
    $('body, html').addClass('old')
  }
  sprite_style = boxSprites[parseInt(localStorage.boxspriteindex)]
  
  if (!parseInt(localStorage.boxrolls)) {
    localStorage.boxrolls = 0
  } else {
    $('#player-poks-filter').show()
  }

  // if first time
  if (typeof localStorage.battlenotes === 'undefined') {
    localStorage.battlenotes = '1'
  } else if (localStorage.battlenotes == '0'){
    $('.poke-import').first().hide()
  } 

  if (localStorage.states && isValidJSON(localStorage.states)) {
    states = JSON.parse(localStorage.states)
  } else {
    states = {}
  }

  calcing = false
  changingSets = false

  if (localStorage.notes) {
    $('#battle-notes .notes-text').html(localStorage.notes);
  }

  setSettingsTogglesFromLocalStorage()
}

// Settings toggle

function setSettingsTogglesFromLocalStorage() {
    if (sprite_style == "pokesprite") {
        $('#sprite-toggle input').prop('checked', true)
    }
    if (localStorage.watchSaveFile == "1") {
        $('#save-toggle input').prop('checked', true)
    }
    if (localStorage.filterSaveFile == "1") {
        $('#save-filter-toggle input').prop('checked', true)
    }
    if (localStorage.themeIndex == '1') {
        $('#theme-toggle input').prop('checked', true)
    }
    if (localStorage.boxrolls == '1') {
        $('#toggle-boxroll input').prop('checked', true)
    }
    if (localStorage.battlenotes == '1') {
        $('#toggle-battle-notes input').prop('checked', true)
    }
}

function toggleBoxSpriteStyle() {
    var oldStyle = boxSprites[parseInt(localStorage.boxspriteindex)]
    localStorage.boxspriteindex = (parseInt(localStorage.boxspriteindex) + 1) % 2
    sprite_style = boxSprites[parseInt(localStorage.boxspriteindex)]

    $('.player-poks').removeClass(oldStyle)
    $('.player-poks').addClass(sprite_style)

    $('.trainer-pok').each(function() {
        $(this).removeClass(oldStyle)
        var newURL = $(this).attr('src').replace(oldStyle, sprite_style)
        $(this).attr('src', newURL)
    })
}

function toggleThemes() {
    var oldStyle = themes[parseInt(localStorage.themeIndex)]
    localStorage.themeIndex = (parseInt(localStorage.themeIndex) + 1) % 2
    themeStyle = themes[parseInt(localStorage.themeIndex)]

    $('html, body').removeClass(oldStyle)
    $('html, body').addClass(themeStyle)
}

function toggle_box_rolls() {
    localStorage.boxrolls = (parseInt(localStorage.boxrolls) + 1) % 2   
}


// Settings Event Bindings

$('#theme-toggle .slider').click(toggleThemes)

$('#toggle-boxroll .slider').click(function(){
    toggle_box_rolls()
    $('#player-poks-filter').toggle()
    if ($('#player-poks-filter:visible').length > 0) {
        box_rolls()
    }
})

$('#toggle-battle-notes .slider').click(function(){
    localStorage.battlenotes = (parseInt(localStorage.battlenotes) + 1) % 2   
    $('.poke-import').first().toggle()
})

$('#save-toggle .slider').click(function(){
    localStorage.watchSaveFile = (parseInt(localStorage.watchSaveFile) + 1) % 2;   
})

$('#save-filter-toggle .slider').click(function(){
    localStorage.filterSaveFile = (parseInt(localStorage.filterSaveFile) + 1) % 2;   
})

function adjustStat(speciesName, stat, value) {
    pokedex[speciesName].bs[stat] = value
    speciesId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    SPECIES_BY_ID[gen][speciesId].baseStats[stat] = value
}

function loadDataSource(data) {
    SETDEX_BW = data
    SETDEX_ADV = data
    SETDEX_DPP = data
    SETDEX_SM = data
    SETDEX_SS = data
    SETDEX_XY = data
    setdex = data

    TR_NAMES = get_trainer_names()
    if ('move_replacements' in data) {
        CHANGES = data['move_replacements']
    } else {
        CHANGES = {}
    }

    moveChanges["NONE"] = CHANGES

    
    jsonMoves = data["moves"]
    customMoves = data["custom_moves"]
    var jsonMove


    $("#show-ai").hide()


    console.log("loaded custom poks data")

    $('#save-pok').show()

    // imperium changes
    if (TITLE.includes("Emerald Imperium")) {

        moves['Chloroblast'].recoil = [50,100];
        MOVES_BY_ID[g].chloroblast.recoil = [50,100]
        
        if (TITLE.includes("1.3")) {
            $('#reasoning').show()
            adjustStat("Unfezant", "at", 115)
            adjustStat("Unfezant", "sp", 108)

            adjustStat("Empoleon-Mega-O", "hp", 84)
            adjustStat("Empoleon-Mega-O", "df", 83)
            adjustStat("Empoleon-Mega-O", "sd", 83)

            adjustStat("Empoleon-Mega-D", "hp", 118)
            adjustStat("Empoleon-Mega-D", "df", 88)
            adjustStat("Empoleon-Mega-D", "sd", 157)
            adjustStat("Empoleon-Mega-D", "sa", 131)

            adjustStat("Infernape-Mega", "df", 82)
            adjustStat("Infernape-Mega", "sd", 82)
            adjustStat("Infernape-Mega", "sp", 120)

            adjustStat("Slaking-Mega", "sa", 95)
            adjustStat("Slaking-Mega", "sd", 75)

            adjustStat("Roserade-Mega", "at", 80)
            adjustStat("Roserade-Mega", "df", 90)
            adjustStat("Roserade-Mega", "sa", 140)
            adjustStat("Roserade-Mega", "sd", 125)
            adjustStat("Roserade-Mega", "sp", 120)


            moves['Mighty Cleave'].bp = 90;
            MOVES_BY_ID[g].mightycleave.basePower = 90

            $('#learnset-show').show()
        }
    
        $('#maxL').next().remove()
        $('#maxR').next().remove()
        pokedex["Raichu"]["types"] = ["Electric", "Normal"]
    }
    initCalc() 


    if (localStorage.customsets) {
        console.log("loading box")
        customSets = JSON.parse(localStorage.customsets);
        updateDex(customSets)   
        get_box()
        displayParty()
    }
    
    customLeads = get_custom_trainer_names()

    moves['(No Move)'] = moves['-'] = {
        "bp": 0,
        "category": "Status",
        "type": "Normal"
    }    
}

