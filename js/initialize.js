// --- Initialization ----------------------------------------------------------

const params = new URLSearchParams(window.location.search);

// Helper for boolean flags
const getBool = (key, truthy = "1") => params.get(key) === truthy;

// Helper for numbers with fallback
const getNum = (key, fallback) => {
    const v = parseInt(params.get(key), 10);
    return Number.isFinite(v) ? v : fallback;
};

// --- Settings ---------------------------------------------------------------

const settings = {
    devMode: getBool('dev'),
    gen: getNum('gen', 8),
    damageGen: getNum('dmgGen', 8),
    typeChart: getNum('types', 6),
    switchIn: getNum('switchIn', 5),
    noSwitch: getBool('noSwitch'),
    hasEvs: !getBool('evs', '0'),
    challengeMode: params.get('challengeMode') || false,
    critGen: getNum('critGen', getNum('dmgGen', 8))
};

// --- Global State -----------------------------------------------------------


let DEFAULTS_LOADED = false;
let analyze       = false;
let limitHits     = false;

let FIELD_EFFECTS = {};
let learnsetClosable = false;

let movePPs = {};

let calcingForSwitchIns = false;
let changingSets        = false;
let terminalStarted     = false;
let partnerName         = null;

let bestDmgAgainstCurrent        = 0;
let bestPrioDmgAgainstCurrent    = 0;

let bestMoveAgainstCurrent       = "";
let bestPrioMoveAgainstCurrent   = "";
let bestMoveAgainstCurrentIndex  = 0;
let currentAiMoves               = [];

let bestAiDmgAgainstCurrent      = 0;
let bestAiMoveAgainstCurrent     = "";
let currentTypeMatchup           = 2;

// --- Defaults ---------------------------------------------------------------

setSettingsDefaults();

// --- Gen Info ---------------------------------------------------------------

const genInfo = {
    num: 8,
    abilities: { gen: 8 },
    items:     { gen: 8 },
    moves:     { gen: 8 },
    species:   { gen: 8 },
    types:     { gen: 8 },
    natures:   {}
};


if (settings.damageGen <= 3) {
    $('#player-poks-filter').remove()
}

SOURCES = {
  "9aa37533b7c000992d92": "Blaze Black/Volt White",
  "04770c9a89687b02a9f5": "Blaze Black 2/Volt White 2 Original",
  "945a33720dbd6bc04488": "Blaze Black 2/Volt White 2 Redux 1.4",
  "da1eedc0e39ea07b75bf": "Vintage White",
  "renegadeplatinum": "Renegade Platinum",
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
  "casc": "Cascade White 2",
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

$(document).ready(function() {
  if (backupFiles[TITLE]) {
    console.log("now loading local data instead of npoint")
    checkAndLoadScript(`./backups/${backupFiles[TITLE]}.js`, {
            onLoad: (src) => {
                npoint_data = backup_data
                loadDataSource(npoint_data)
            },
            onNotFound: (src) => console.log(`Not found: ${src}`)
    });    
    
  } else {
    $.get(npoint, function(data){
        npoint_data = data
        loadDataSource(data)
        final_type_chart = construct_type_chart()

        setTimeout(function() {
            if (localStorage["left"]) {
                var set = localStorage["right"]
                $('.opposing').val(set)
                $('.opposing').change()
                $('.opposing .select2-chosen').text(set)
                if ($('.info-group.opp > * > .forme').is(':visible')) {
                    $('.info-group.opp > * > .forme').change()
                }
            }

            if (localStorage["right"]) {
                $(`[data-id='${localStorage["left"]}']`).click()
            }             
        }, 100)
       
    })
  }
})


function setGameSettings(title) {
  if (title == "Renegade Platinum") {
    gameGen = 4
    settings.gameSwitchIn = 4;
    settings.sourceType = "full"
  } else if (title == "Cascade White 2") {
    gameGen = 5
    settings.gameSwitchIn = 11; 
    settings.sourceType = "full"
  }
  else {
    gameGen = 8
    settings.sourceType = "onlyTrainers"
  }
}

INC_EM = false
if (SOURCES[params.get('data')]) {
    TITLE = SOURCES[params.get('data')] || "NONE"

    setGameSettings(TITLE)

    baseGame = ""
    if (TITLE.includes("Inclement") ) {
        baseGame = "inc_em"
    } else if (TITLE.includes("Imperium")) {
        baseGame = "imp"

        if (localStorage.switchInfo == '1') {
          $('.trainer-pok-list.opposing').addClass('ai-show')
        }
    } else if (TITLE == "Renegade Platinum") {
      baseGame = "Pt"
    }

    if (!baseGame) {
        $('#read-save').hide()
    } 

    $('.genSelection').hide()
    $('#rom-title').text(TITLE).show()
    if (TITLE.includes("Radical Red") || TITLE.includes("Emerald Imperium")) {
        $("#lvl-cap").show()
    }

    if ( TITLE == "Cascade White 2") {
        $('.cascade-effects .btn-small').show()
    }
} else {
    TITLE = "NONE"
}



function initCalc() {
  
  initializing = true
  setTimeout(function() {
    initializing = false
  }, 2000)


  var head= document.getElementsByTagName('head')[0];
  var script= document.createElement('script');
  script.src= './js/shared_controls.js?0b3ea005';
  head.appendChild(script);

  memoizedCalc = deepMemoize(calculateAllMoves);
}


function adjustStat(speciesName, stat, value) {
    pokedex[speciesName].bs[stat] = value
    speciesId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    SPECIES_BY_ID[gen][speciesId].baseStats[stat] = value
}

// In platinum, trainer mons with alternate forms all use the base stats of the original
function initPlatinum() {
  var rotom_info = [["Heat", "Fire"],["Wash", "Water"],["Mow", "Grass"],["Frost", "Ice"],["Fan", "Flying"]]
  var deoxys_info = ['Attack', 'Defense','Speed']
  var wormadam_info = ['Sandy', 'Trash']
    
    if (poksData['Rotom']) {
       for (let i = 0; i < rotom_info.length; i++) {
            pokedex[`Rotom-${rotom_info[i][0]}-Glitched`] = {
                "types": [
                    "Electric",
                    rotom_info[i][1]
                ],
                "bs": poksData['Rotom']['bs'],
                "weightkg": 0.3,
                "abilities": {
                    "0": "Levitate"
                },
                "gender": "N"
            }
        } 
    }
    
    if (poksData['Deoxys']) {
        for (let i = 0; i < deoxys_info.length; i++) {
            pokedex[`Deoxys-${deoxys_info[i]}-Glitched`] = {
                "types": [
                    "Psychic"
                ],
                "bs": poksData['Deoxys']['bs'],
                "weightkg": 60.8,
                "abilities": {
                    "0": "Pressure"
                },
                "gender": "N",
            }
        }
    }

    if (poksData['Shaymin']) {
        pokedex['Shaymin-Sky-Glitched'] = {
            "types": [
                "Grass",
                "Flying"
            ],
            "bs": poksData['Shaymin']['bs'],
            "weightkg": 2.1,
            "abilities": {
                "0": "Natural Cure"
            },
            "gender": "N",
            "otherFormes": [
                "Shaymin-Sky"
            ]
        }
    }

    if (poksData['Wormadam']) {
        pokedex['Wormadam-Trash-Glitched'] = {
            "types": [
                "Bug",
                "Steel"
            ],
            "bs": poksData['Wormadam']['bs'],
            "weightkg": 6.5,
            "abilities": {
                "0": "Anticipation"
            },
            "otherFormes": [
                "Wormadam-Sandy",
                "Wormadam-Trash"
            ]
        }

        pokedex['Wormadam-Sandy-Glitched'] = {
            "types": [
                "Bug",
                "Ground"
            ],
            "bs": poksData['Wormadam']['bs'],
            "weightkg": 6.5,
            "abilities": {
                "0": "Anticipation"
            },
            "otherFormes": [
                "Wormadam-Sandy",
                "Wormadam-Trash"
            ]
        }
    }  
}

function loadPoksData() {
  console.log("patching changed mons...")
  if (TITLE.includes("Platinum")) {
      initPlatinum()  
  }

  for (pok in pokedex) {
    if (pok.includes("Glitched")) {
        continue
    }
    // Allow import of Farfetch'd w/ unicode standard apostrophe
    if (pok == "Farfetch’d" && poksData["Farfetch'd"]) {
      jsonPok = poksData["Farfetch'd"];
    }
    else if (poksData[pok]) {
        jsonPok = poksData[pok]
    } else {           
       continue //skip weird smogon pokemon and arceus forms
    }
    const pok_id = cleanString(pok)

    pokedex[pok]["bs"] = jsonPok["bs"]

    if (jsonPok["types"]) {
        pokedex[pok]["types"] = jsonPok["types"]
    }
    
    if (jsonPok.hasOwnProperty("abilities"))
        pokedex[pok]["abilities"] = jsonPok["abilities"]
    
    SPECIES_BY_ID[gen][pok_id].types = jsonPok["types"]
    SPECIES_BY_ID[gen][pok_id].baseStats = {
        "atk": jsonPok["bs"]["at"],
        "def": jsonPok["bs"]["df"],
        "hp": jsonPok["bs"]["hp"],
        "spa": jsonPok["bs"]["sa"],
        "spd": jsonPok["bs"]["sd"],
        "spe": jsonPok["bs"]["sp"],
    }
  }
}

function loadMovesData() {
  for (move in moves) {
    var moveId = cleanString(move)

    if (jsonMoves[move]) {
        jsonMove = jsonMoves[move]
    } else {
        // moves[move] = jsonMoves[move]
        continue //completely overite if custom move data found
    }

    if (move == '(No Move)') {
        continue
    }
    moves[move]["bp"] = jsonMove["basePower"]


    MOVES_BY_ID[g][moveId].basePower = jsonMove["basePower"]

    var special_case_power_overrides = {
      "Return": 102,
      "Magnitude": 70
    }

    if (move in special_case_power_overrides) {
      moves[move]["bp"] = special_case_power_overrides[move]
         MOVES_BY_ID[g][moveId].basePower = special_case_power_overrides[move]
    }
        
    var optional_move_params = ["type", "category", "e_id", "multihit", "target", "recoil", "overrideBP", "secondaries", "drain", "priority", "willCrit"]  
    for (n in optional_move_params) {
        var param = optional_move_params[n]
        if (jsonMove[param]) {
          moves[move][param] = jsonMove[param]
          MOVES_BY_ID[g][moveId][param] = jsonMove[param]  
        }
    }

    var optional_flag_params = ["makesContact", "isPunch", "isBite", "isBullet", "isSound", "isPulse", "isKick", "isSword", "isBone", "isWind"]  
    for (n in optional_flag_params) {
        var param = optional_flag_params[n]
        if (jsonMove[param]) {
          moves[move][param] = jsonMove[param]
          MOVES_BY_ID[g][moveId]["flags"][param] = jsonMove[param]  
        }
    }

    if (jsonMove['flags']) {
      if (jsonMove['flags']['punch']) {
          moves[move]['isPunch'] = true
          MOVES_BY_ID[g][moveId]["flags"]["punch"] = 1
      }
      if (jsonMove['flags']['sound']) {
          moves[move]['isSound'] = true
          MOVES_BY_ID[g][moveId]["flags"]["sound"] = 1
      }
    }

    // gen 5 data sources from pokeweb will only include multihit if it's a multihit move
    if (!jsonMove['multihit'] && (settings.damageGen == 5)) {
         delete MOVES_BY_ID[g][moveId].multihit 
    }
  }

  for (move in jsonMoves) {     
    // if defined in showdown move list
    if (moves[move]) {
    } else {
        // custom move
        jsonMoves[move]["flags"] = {}

        moves[move] = jsonMoves[move]
        moves[move]["bp"] = jsonMoves[move]["basePower"]
        MOVES_BY_ID[8][move.replace(/-|,|'|’| /g, "").toLowerCase()] = jsonMoves[move]
    }
  }
}

function loadDataSource(data) {
    SETDEX_BW = data
    setdex = data

    if (settings.sourceType == "full") {
      SETDEX_BW = data["formatted_sets"]
      setdex = data["formatted_sets"]
    }

    TR_NAMES = get_trainer_names()
    if ('move_replacements' in data) {
        CHANGES = data['move_replacements']
    } else {
        CHANGES = {}
    }
    
    jsonMoves = data["moves"]
    customMoves = data["custom_moves"]
    var jsonMove


    // $("#show-ai").hide()

    if (settings.sourceType == "full") {
      poksData = data["poks"]
      loadPoksData()

      moveData = data["moves"]
      loadMovesData()
    }



    $('#save-pok').show()

    // imperium changes
    if (TITLE.includes("Emerald Imperium")) {

        delete moves['Chloroblast'].recoil 
        delete MOVES_BY_ID[g].chloroblast.recoil
        moves['Chloroblast'].mindBlownRecoil = true;
        MOVES_BY_ID[g].chloroblast.mindBlownRecoil = true;
        
        if (TITLE.includes("1.3")) {
            $('#reasoning').show()
            $('.move-pp').show()
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





// Initializes set selection list UI

function loadDefaultLists() {
  $(".player.set-selector").select2({
    formatResult: function (object) {
      if ($("#randoms").prop("checked")) {
        return object.pokemon;
      } else {
        // return object.text;
        return object.set ? ("&nbsp;&nbsp;&nbsp;" + object.text) : ("<b>" + object.text + "</b>");
      }
    },
    query: function (query) {
      var pageSize = 30;
      var results = [];
      var options = getSetOptions();
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        // var pokeName = option.pokemon.toUpperCase();
        var fullName = option.text.toUpperCase();
        if (!query.term || query.term.toUpperCase().split(" ").every(function (term) {
          // return pokeName.indexOf(term) === 0 || pokeName.indexOf("-" + term) >= 0;
          return fullName.indexOf(term) === 0 || fullName.indexOf("-" + term) >= 0 || fullName.indexOf(" " + term) >= 0 || fullName.indexOf("(" + term) >= 0;
          // return fullName.indexOf(term) === 0 || fullName.indexOf("-" + term) >= 0 || fullName.indexOf("(" + term) >= 0;
        })) {
          if ($("#randoms").prop("checked")) {
            if (option.id) results.push(option);
          } else {
            results.push(option);
          }
        }
      }
      query.callback({
        results: results.slice((query.page - 1) * pageSize, query.page * pageSize),
        more: results.length >= query.page * pageSize
      });
    }
  });
  $(".opposing.set-selector").select2({
    formatResult: function (object) {
      if ($("#randoms").prop("checked")) {
        return object.pokemon;
      } else {
        // return object.text;
        return object.set ? ("&nbsp;&nbsp;&nbsp;" + object.text) : ("<b>" + object.text + "</b>");
      }
    },
    query: function (query) {
      var pageSize = 30;
      var results = [];
      var options = getSetOptions();
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        // var pokeName = option.pokemon.toUpperCase();
        var fullName = option.text.toUpperCase();
        if (!query.term || query.term.toUpperCase().split(" ").every(function (term) {
          // return pokeName.indexOf(term) === 0 || pokeName.indexOf("-" + term) >= 0;
          return fullName.indexOf(term) === 0 || fullName.indexOf("-" + term) >= 0 || fullName.indexOf(" " + term) >= 0 || fullName.indexOf("(" + term) >= 0;
          // return fullName.indexOf(term) === 0 || fullName.indexOf("-" + term) >= 0 || fullName.indexOf("(" + term) >= 0;
        })) {
          if ($("#randoms").prop("checked")) {
            if (option.id) results.push(option);
          } else {
            results.push(option);
          }
        }
      }
      query.callback({
        results: results.slice((query.page - 1) * pageSize, query.page * pageSize),
        more: results.length >= query.page * pageSize
      });
    }
  });
}

