// --- Initialization ----------------------------------------------------------

const params = new URLSearchParams(window.location.search);
const npoint = `https://api.npoint.io/${params.get('data')}`

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
    switchIn: getNum('switchIn', 9),
    noSwitch: getBool('noSwitch'),
    hasEvs: !getBool('evs', '0'),
    customPoks: !getBool('customPoks', '0'),
    challengeMode: params.get('challengeMode') == 'true' || false,
    critGen: getNum('critGen', getNum('dmgGen', 8)),
    customCascadeSwitchAI: getBool('cascAI'),
    showDex: false
};

// --- Global State -----------------------------------------------------------


let DEFAULTS_LOADED = false;
let analyze       = false;
let limitHits     = false;
let securityKey = 0;
gameGen = settings.damageGen

let FIELD_EFFECTS = {};
let learnsetClosable = false;

let movePPs = {};

let calcingForSwitchIns = false;
let changingSets        = false;
var initializing        = false;
let terminalStarted     = false;
let partnerName         = null;
let customLeads         = null;
let showDex = false;
let showAI = false;
let lastClickedWeather = null
let prevTrainerName = null
let currentTrainerName = null

let bestDmgAgainstCurrent        = 0;
let bestPrioDmgAgainstCurrent    = 0;
let mechanics = "vanilla"

let bestMoveAgainstCurrent       = "";
let bestPrioMoveAgainstCurrent   = "";
let bestMoveAgainstCurrentIndex  = 0;
let currentAiMoves               = [];

let bestAiDmgAgainstCurrent      = 0;
let bestAiMoveAgainstCurrent     = "";
let currentTypeMatchup           = 2;

let dynamicTypeBugActive = true;

const MOVE_NAME_ALIASES = {
    "Solar-Beam": "Solar Beam"
};

function registerMoveAliasesForTable(table) {
    if (!table) {
        return;
    }

    for (var alias in MOVE_NAME_ALIASES) {
        var canonicalName = MOVE_NAME_ALIASES[alias];
        if (table[canonicalName] && typeof table[alias] === "undefined") {
            table[alias] = table[canonicalName];
        }
    }
}

function updateHeaderShellState() {
  if (typeof window.updateMainPageHeaderState !== "function") {
    return;
  }

  const syncMasterVisible = $('#sync-master').is(':visible');
  const syncLuaVisible = $('#sync-lua').is(':visible');

  window.updateMainPageHeaderState({
    title: typeof TITLE === "string" ? TITLE : "",
    showDex,
    showBattleLog: syncMasterVisible || syncLuaVisible,
    showMainNav: true
  })
}

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

SOURCES = window.romhackSourceTitles || {}

$(document).ready(function() {
  $('.genSelection').hide()
  console.log(TITLE)
  if (backupFiles[TITLE]) {
    // Load hardcoded calc data if present
    checkAndLoadScript(`./backups/${backupFiles[TITLE]}.js`, {
            onLoad: (src) => {
                npoint_data = backup_data
                loadDataSource(npoint_data)

                // Load hardcoded trainer orders if present
                checkAndLoadScript(`./backups/trainer_orders/${backupFiles[TITLE]}.js`, {
                        onLoad: (src) => {
                            if (typeof backup_data.order === "undefined") {
                                backup_data.order = trainerOrders
                                npoint_data = backup_data
                                console.log("loaded harcoded trainer orders")
                            } else {
                                console.log("using preexisting trainer orders in calc data")
                            }                     
                        },
                        onNotFound: (src) => console.log(`Not found: ${src}`)
                });
            },
            onNotFound: (src) => console.log(`Not found: ${src}`)
    });    
  } else {
	    $.get(npoint, function(data){
	        npoint_data = data
	        backup_data = data
	        gameGen = settings.damageGen
	        settings.gameSwitchIn = gameGen
	        toggleGen3SwitchGuide();
	        TITLE = ""
	        TITLE = npoint_data.title || SOURCES[params.get("data")] || "Untitled"
        document.title = TITLE + " Calculator"
        setBaseGame(TITLE)
        $('#rom-title').text(TITLE).show()
        if ( TITLE.includes("Cascade")) {
            $('.cascade-effects .btn-small').show()
        }


        loadDataSource(data)

        if (gameGen < 8) {
            $('label[for="snow"]').hide()
        }

        // setTimeout(function() {
        //     if (localStorage["left"]) {
        //         var set = localStorage["right"]
        //         $('.opposing').val(set)
        //         $('.opposing').change()
        //         $('.opposing .select2-chosen').text(set)
        //         if ($('.info-group.opp > * > .forme').is(':visible')) {
        //             $('.info-group.opp > * > .forme').change()
        //         }
        //     }

        //     if (localStorage["right"]) {
        //         $(`[data-id='${localStorage["left"]}']`).click()
        //     }             
        // }, 100)

    })
  }
})


// Game specific configs and modifications
function setGameSettings(title) {
  $('label[for="fog"]').hide()
  if (title == "Renegade Platinum") {
    gameGen = 4
    settings.damageGen = 4
    if (!settings.noSwitch) {
      settings.gameSwitchIn = 4;
      settings.switchIn = 4;  
    }
    settings.sourceType = "full"
    settings.typeChart = 6;
    settings.critGen = 5;
    save_expansion = false
    showDex = true;
    showAI = true;
    $('label[for="snow"]').hide()
  } else if (title == "Platinum Kaizo" || title == "Platinum") {
    gameGen = 4
    settings.damageGen = 4
    if (!settings.noSwitch) {
      settings.gameSwitchIn = 4;
      settings.switchIn = 4;  
    }
    settings.sourceType = "full"
    settings.typeChart = 5;
    settings.critGen = 5;
    save_expansion = false
    showDex = true;
    showAI = true;
    $('label[for="snow"]').hide()
    $('label[for="fog"]').show()
  } else if (TITLE.includes(" Null")) {
    gameGen = 8
    settings.damageGen = 8
    // settings.noSwitch = 1
    settings.sourceType = "full"
    settings.typeChart = 6;
    settings.critGen = 6;
    showDex = true;
    showAI = false;
    $('#sync-lua').show()
    $('label[for="snow"]').show().removeClass('btn-right').addClass('btn-mid')
    $('label[for="hail"]').show()
    $('#maxL').next().remove()
    $('#maxR').next().remove()

    
  } else if (title.includes("Sterling Silver")) {
    gameGen = 4
    settings.damageGen = 4
    if (!settings.noSwitch) {
      settings.gameSwitchIn = 4;
      settings.switchIn = 4;  
    }   
    settings.sourceType = "full"
    settings.typeChart = 4;
    settings.customPoks = 1;
    settings.critGen = 5;
    save_expansion = false
    showDex = true;
    showAI = true;
    $('label[for="snow"]').hide()
  } else if (TITLE.includes("Cascade")) {
    gameGen = 5
     if (!settings.noSwitch) {
      settings.gameSwitchIn = 5;
    }
    settings.damageGen = 5;
    settings.sourceType = "full"
    save_expansion = false
    settings.hasMastersheet = true;
    showDex = true
    showAI = true
    $('label[for="snow"]').hide()
    $('#ms-link').show()
  } else if (TITLE == "Ancestral X" || TITLE == "Navy Sapphire" || TITLE == "Reignited Ruby") {
    gameGen = 6
     if (!settings.noSwitch) {
      settings.gameSwitchIn = 6;
    }
    settings.damageGen = 6;
    settings.sourceType = "full"
    save_expansion = false
    settings.hasMastersheet = false;
    showDex = false
    showAI = false
    $('label[for="snow"]').hide()
  } else if (TITLE == "Fire Red Omega" || TITLE == "Emerald Kaizo" || TITLE == "Royal Sapphire") {
    gameGen = 3
    settings.gameSwitchIn = 3; 
    settings.switchIn = 3
    settings.damageGen = 3;
    settings.typeChart = 3;
    settings.sourceType = "full"
    settings.critGen = 5;
    save_expansion = false
    settings.hasMastersheet = false;
    showDex = false
    showAI = false
    $('label[for="snow"]').hide()
  }else if (title == "Blinding White 2") {
    gameGen = 5
    settings.gameSwitchIn = 5; 
    settings.damageGen = 5;
    settings.sourceType = "full"
    settings.typeChart = 11
    settings.critGen = 5;
    showAI = true
    save_expansion = false,
    showDex = true
    if (settings.challengeMode) {
      $('#redux-lvl').css('display', 'inline-block');
      $('#redux-lvl').click(function() {
        alert("There is a bug in BW2 Challenge mode where the stats of a pokemon do not match it's displayed level. The calc will adjust the level to show it's true stats. However, the damage formula in this game uses Pokemon level as one of the inputs and this formula uses the incorrect displayed level. So the true power level of a pokemon is somewhere between the bugged displayed level, and the non challenge mode level. The challenge mode version of this calc takes into account this bug and adjusts the calculations accordingly.")
      })
    }
    $('label[for="snow"]').hide()
  } else if (title == "Vintage White Plus") {
    gameGen = 5
    settings.gameSwitchIn = 5;
    settings.switchIn = 5; 
    settings.damageGen = 5;
    settings.gen = 8;
    settings.critGen = 5;
    settings.typeChart = 5;
    settings.sourceType = "full"
    save_expansion = false,
    showDex = true
    showAI = true
    $('label[for="snow"]').hide()
  } else if (title == "Hardlove Gold" || title == "Heart Gold Engine Rom") {
    gameGen = 8
    settings.gameSwitchIn = 4; 
    settings.sourceType = "full"
    settings.readIncludes = true
    mechanics = "hge"
    save_expansion = true

    $('label[for="hail"]').hide()
    $('label[for="snow"]').show()
  }
  else {
    gameGen = 8
    $('label[for="hail"]').hide()
    settings.sourceType = "onlyTrainers"
  }
  $('#open-dex, #main-nav-dex').toggle(showDex)
  $('#dex-show').toggle(showDex)
  $('#show-ai').toggle(showAI)

  updateHeaderShellState()

  toggleGen3SwitchGuide();
}

function toggleGen3SwitchGuide() {
  if (typeof settings === "undefined") return;
  if (settings.gameSwitchIn == 3) {
    $("#gen3-switch-guide").removeClass("hide");
  } else {
    $("#gen3-switch-guide").addClass("hide");
  }
}

INC_EM = false
if (SOURCES[params.get('data')]) {
    TITLE = SOURCES[params.get('data')] || "NONE"

    setGameSettings(TITLE)
    if (typeof applyAutoImportMegasVisibility === "function") {
        applyAutoImportMegasVisibility()
    }
    window.baseGame ||= ""
    setBaseGame(TITLE)
    // if (TITLE.includes("Inclement") ) {
    //     baseGame = "inc_em"
    // } else if (TITLE.includes("Imperium")) {
    //     baseGame = "imp"

    //     if (localStorage.switchInfo == '1') {
    //       $('.trainer-pok-list.opposing').addClass('ai-show')
    //     }
    // } else if (TITLE.includes("Platinum")) {
    //   baseGame = "Pt"
    // } else if (TITLE.includes(" Black") || TITLE.includes(" White")) {
    //   baseGame = "BW"
    //   if (TITLE.includes("Black 2") || TITLE.includes("White 2")) {
    //     baseVersion = "BW2"
    //   } else {
    //     baseVersion = "BW"
    //   }
    // } else if (TITLE.includes("Gold") || TITLE.includes("Silver")) {
    //   baseGame = "HGSS"
    // }

    // if (!baseGame) {
    //     $('#read-save').hide()
    // } 

    // $('#rom-title').text(TITLE).show()
    // // if (TITLE.includes("Radical Red") || TITLE.includes("Emerald Imperium")) {
    // //     $("#lvl-cap").show()
    // // }

    // if ( TITLE.includes("Cascade")) {
    //     $('.cascade-effects .btn-small').show()
    //     baseVersion = "BW2"
    // }
} else {
    TITLE = "NONE"
}

function setBaseGame(title) {
    window.baseGame ||= ""
    if (title.includes("Inclement") ) {
        window.baseGame = "inc_em"
    } else if (title.includes("Imperium")) {
        window.baseGame = "imp"

        if (localStorage.switchInfo == '1') {
          $('.trainer-pok-list.opposing').addClass('ai-show')
        }
        $('#sync-lua').show()
    } else if (TITLE.includes("Platinum") ) {
      baseGame = "Pt"
      save_expansion = false
      $('#sync-lua, #desmume-icon').show()
    } else if (TITLE.includes(" Black") || TITLE.includes(" White")) {
      baseGame = "BW"
      if (TITLE.includes("Black 2") || TITLE.includes("White 2")) {
        baseVersion = "BW2"
      } else {
        baseVersion = "BW"
        $('#sync-lua, #desmume-icon').show()
      }
    } else if (title.includes("Gold") || title.includes("Silver")) {
      window.baseGame = "HGSS"
      $('#sync-lua, #desmume-icon').show()
    } else if (title.includes("Null")) {
        window.baseGame = "null"

        $('#p2').addClass('poke-null')

        if (localStorage.switchInfo == '1') {
          $('.trainer-pok-list.opposing').addClass('ai-show')
        }
    }

    if (title.includes("Radical Red") || title.includes("Emerald Imperium")) {
        $("#lvl-cap").show()
    }
    $('#rom-title').text(TITLE).show()

    if ( title.includes("Cascade")) {
        $('.cascade-effects .btn-small').show()
        baseVersion = "BW2"
    }

    if (!baseGame && settings.damageGen == 3) {
        window.baseGame = "g3"
    } else if (!baseGame && settings.damageGen == 6) {
        window.baseGame = "g6"
    } else if (!baseGame && settings.damageGen == 7) {
        window.baseGame = "g7"
    }

    if (!baseGame) {
        $('#read-save').hide()
    } 

    if (typeof window.updateMainPageTitle === "function") {
      window.updateMainPageTitle(TITLE)
    }

    updateHeaderShellState()
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

    if (poksData['Cherrim']) {
        pokedex[`Cherrim-Sunshine-Glitched`] = {
            "types": [
                "Grass"
            ],
            "bs": poksData['Cherrim']['bs'],
            "weightkg": 0.3,
            "abilities": {
                "0": "Flower Gift"
            },
            "otherFormes": [
                "Cherrim",
                "Cherrim-Sunshine"
            ]
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

// Allows both explicit pokemon names "Rotom-Heat" or smogon ID style "rotomheat"
function loadPoksData() {
    console.log("patching changed mons...")
    if (TITLE.includes("Platinum")) {
        initPlatinum()  
    }



    for (pok in pokedex) {
        if (pok.includes("Glitched")) {
            continue
        }

        const pokId = cleanString(pok)
        const pokName = SPECIES_BY_ID[gen][pokId].name

        // Allow import of Farfetch'd w/ unicode standard apostrophe
        if (pokName == "Farfetch’d" && !poksData["Farfetch’d"]) {
          jsonPok = poksData["Farfetch'd"] || poksData["farfetchd"] ;
        }
        else if (poksData[pokName] || poksData[pokId]) {
            jsonPok = poksData[pokId] || poksData[pokName] 
        } else {           
           continue //skip weird smogon pokemon and arceus forms
        }
        

        if (!jsonPok) {
            console.log(`${pokName} not found in data source`)
            continue
        }

        pokedex[pokName]["bs"] = jsonPok["bs"]

        if (jsonPok["types"]) {
            pokedex[pokName]["types"] = jsonPok["types"]
        }
        
        if (jsonPok.hasOwnProperty("abilities"))
            pokedex[pok]["abilities"] = jsonPok["abilities"]
        

        SPECIES_BY_ID[gen][pokId].types = jsonPok["types"]
        SPECIES_BY_ID[gen][pokId].baseStats = {
            "atk": jsonPok["bs"]["at"],
            "def": jsonPok["bs"]["df"],
            "hp": jsonPok["bs"]["hp"],
            "spa": jsonPok["bs"]["sa"],
            "spd": jsonPok["bs"]["sd"],
            "spe": jsonPok["bs"]["sp"],
        }
    }

    if (settings.customPoks == 1) {
        for (pok in poksData) {
            var pok_id = cleanString(pok)

            if (typeof SPECIES_BY_ID[gen][pok_id] === "undefined" || SPECIES_BY_ID[gen][pok_id].name != pok ) {

                if (!poksData[pok]) {
                    console.log(pok)
                    continue
                } 

                console.log(`Creating custom pok: ${pok}`)

                poksData[pok]["baseStats"] = poksData[pok]["bs"]
                poksData[pok]["id"] = pok_id
                poksData[pok]["kind"] = "Species"
                SPECIES_BY_ID[gen][pok_id] = poksData[pok]
                pokedex[pok] = poksData[pok]
            }     
        }
    }
}

function loadMovesData() {
  for (move in moves) {
    var moveId = cleanString(move)
    var moveName = moveId

    if (MOVES_BY_ID[gen][moveId]) {
        moveName = MOVES_BY_ID[gen][moveId].name

    } else {
        console.log(`${moveId} not found`)
        continue
    }

    if (jsonMoves[moveName]) {
        jsonMove = jsonMoves[moveName]
    } else if (jsonMoves[moveId]){
        jsonMove = jsonMoves[moveId]
    } else {
        continue //completely overite if custom move data found
    }


    if (moveName == '(No Move)') {
        continue
    }

    moves[moveName]["bp"] = jsonMove["basePower"] || jsonMove["bp"]


    MOVES_BY_ID[g][moveId].basePower = jsonMove["basePower"] || jsonMove["bp"]

    var special_case_power_overrides = {
      "Return": 102,
      "Magnitude": 70
    }



    if (TITLE == "Platinum Kaizo") {
        special_case_power_overrides["Return"] = 121
    }


    if (moveName in special_case_power_overrides) {
      moves[moveName]["bp"] = special_case_power_overrides[moveName]
      MOVES_BY_ID[g][moveId].basePower = special_case_power_overrides[moveName]
    }
        
    var optional_move_params = ["type", "category", "e_id", "multihit", "target", "recoil", "overrideBP", "secondaries", "drain", "priority", "willCrit"]  
    for (n in optional_move_params) {
        var param = optional_move_params[n]
        if (jsonMove[param]) {
          moves[moveName][param] = jsonMove[param]
          MOVES_BY_ID[g][moveId][param] = jsonMove[param]  
        }
    }

    var optional_flag_params = ["makesContact", "isPunch", "isBite", "isBullet", "isSound", "isPulse", "isKick", "isSword", "isBone", "isWind"]  
    for (n in optional_flag_params) {
        var param = optional_flag_params[n]
        if (jsonMove[param]) {
          moves[moveName][param] = jsonMove[param]
          MOVES_BY_ID[g][moveId]["flags"][param] = jsonMove[param]  
        }
    }

    if (jsonMove['flags']) {
      if (jsonMove['flags']['punch']) {
          moves[moveName]['isPunch'] = true
          MOVES_BY_ID[g][moveId]["flags"]["punch"] = 1
      }
      if (jsonMove['flags']['sound']) {
          moves[moveName]['isSound'] = true
          MOVES_BY_ID[g][moveId]["flags"]["sound"] = 1
      }
    }

    if (moves[moveName]["multihit"] && moves[moveName]["multihit"][0] && moves[moveName]["multihit"][0] == moves[moveName]["multihit"][1] ) {
        MOVES_BY_ID[g][moveId].multihit  = moves[moveName]["multihit"][0]
        moves[moveName]["multihit"] =  moves[moveName]["multihit"][0]

    }

    // gen 5 data sources from pokeweb will only include multihit if it's a multihit move
    if (!jsonMove['multihit'] && (settings.damageGen == 5)) {
         delete moves[moveName].multihit
         delete MOVES_BY_ID[g][moveId].multihit 
    }
  }

  for (move in jsonMoves) {
    var moveId = cleanString(move)
    var moveName = moveId

    if (MOVES_BY_ID[gen][moveId]) {
        var moveName = MOVES_BY_ID[gen][moveId].name
    } else {
        console.log(`${moveId} not found`)


        if (moveId == move) {
            continue //skip this move if importing using normalized move names    
        }
        moveName = move
        
    }

    // if defined in showdown move list
    if (moves[moveName]) {
    } else {
        // custom move
        console.log(`Creating custom move ${moveName}`)
        jsonMoves[moveName]["flags"] = {}
        jsonMoves[moveName]["name"] = move

        if (settings.damageGen == 3) {
            if (['Normal', 'Fighting', 'Flying', 'Ground', 'Rock', 'Bug', 'Ghost', 'Poison', 'Steel'].includes(jsonMoves[moveName].type)) {
                jsonMoves[moveName]["category"] = "Physical"
            } else {
                jsonMoves[moveName]["category"] = "Special"
            }
        }


        moves[moveName] = jsonMoves[moveName]
        moves[moveName]["bp"] = jsonMoves[moveName]["basePower"]
        MOVES_BY_ID[8][cleanString(move)] = jsonMoves[moveName]
    }
  }

    registerMoveAliasesForTable(moves)
    registerMoveAliasesForTable(jsonMoves)
    registerMoveAliasesForTable(backup_moves)

    // Post move data loading, game specific adjustments
  
    if (TITLE.includes("Cascade")) {
        jsonMoves["Hidden Power"].basePower = 70
        jsonMoves["Hidden Force"].basePower = 70
        typeNames = []
        for (type in TYPES_BY_ID[gen]) {
            typeNames.push(TYPES_BY_ID[gen][type].name)
        }

        for (type of typeNames) {
            jsonMoves[`Hidden Power ${type}`] = {}
            jsonMoves[`Hidden Power ${type}`].basePower = 70 
            jsonMoves[`Hidden Power ${type}`].category = 'Special'
            jsonMoves[`Hidden Force ${type}`] = {}
            jsonMoves[`Hidden Force ${type}`].basePower = 70 
            jsonMoves[`Hidden Force ${type}`].category = 'Physical'
            jsonMoves[`Hidden Force ${type}`].type = type  
        }

        // Need to be manually added in because these flags are hardcoded into the rom
        // so they can't be exported by pokeweb
        moves["Leech Life"].isBite = true
        MOVES_BY_ID[gen].leechlife.flags.bite = true

        moves["Devour"].isBite = true
        MOVES_BY_ID[gen].devour.flags.bite = true

        for (let moveID of ["shadowclaw","sacredsword","razorshell","dualchop","drillrun","solarblade","crosspoison","psychocut","xscissor","nightslash","airslash","psyblade","leafblade","dragonclaw","aerialace","aircutter","crushclaw","metalclaw","slash","furyswipes","drillpeck","razorwinds","scratch","furycutter","cut","razorleaf","secretsword"]) {
            let moveName = MOVES_BY_ID[gen][moveID].name
            moves[moveName].isSlicing = true;
            MOVES_BY_ID[gen][moveID].flags.slicing = 1;
        }
    }

    if (TITLE.includes("Sterling")) {
        delete moves.Barrage["multihit"]
        delete MOVES_BY_ID[g].barrage["multihit"]

        moves.Clamp["multihit"] = [2,5]
        MOVES_BY_ID[g].clamp["multihit"] = [2,5]

        MOVES_BY_ID[g].avalanche.target = 'allAdjacentFoes'
        moves.Avalanche.target = 'allAdjacentFoes'

    }

    if (TITLE == "Platinum Kaizo") {

        // moves["Take Down"]["recoil"] = [1,4]
        // MOVES_BY_ID[g].takedown["recoil"] = [1,4]

    }
}

function loadDataSource(data) {
    SETDEX_BW = data
    setdex = data


    if (settings.sourceType == "full") {
        SETDEX_BW = data["formatted_sets"]
        setdex = data["formatted_sets"]

        hasPokReplacements = false
        pok_subs = {}

        if (data.poks_replacements) {
            hasPokReplacements = true
            pok_subs = data.poks_replacements
        }


        for (let pok in pok_subs) {
            if (data["formatted_sets"][pok] && typeof data["formatted_sets"][pok_subs[pok]]  == "undefined" ) {
                data["formatted_sets"][pok_subs[pok]] = data["formatted_sets"][pok]
                delete data["formatted_sets"][pok]
            }

            if (data.poks[pok]) {
                data.poks[pok_subs[pok]] = data.poks[pok]
            }
        }
    }

    TR_NAMES = get_trainer_names()
    if ('move_replacements' in data) {
        CHANGES = data['move_replacements']
        moveChanges[TITLE] = data['move_replacements']
    } else {
        CHANGES = {}
    }
    if ('ability_replacements' in data) {
        abilityChanges[TITLE] = data['ability_replacements']
    } 
    if ('item_replacements' in data) {
        itemChanges[TITLE] = data['item_replacements']
    } 


    
    jsonMoves = data["moves"]
    customMoves = data["custom_moves"]
    var jsonMove

    if (settings.sourceType == "full") {
      poksData = data["poks"]
      loadPoksData()

      moveData = data["moves"]
      backup_moves = data["moves"]
      loadMovesData()
    }

    if (settings.readIncludes) {
      includes = data["includes"]
      sav_pok_names = includes["poks"]
      sav_move_names = includes["moves"] 
      sav_item_names = includes["items"]
      sav_pok_growths = includes["growths"]
      sav_abilities = includes["abilities"]
      if (typeof window.extendSavArraysToGen67 === "function") {
        window.extendSavArraysToGen67()
      }
    }
    $('#save-pok').show()

    // imperium changes
    if (TITLE.includes("Emerald Imperium")) {

        delete moves['Chloroblast'].recoil 
        delete MOVES_BY_ID[g].chloroblast.recoil
        moves['Chloroblast'].mindBlownRecoil = true;
        MOVES_BY_ID[g].chloroblast.mindBlownRecoil = true;

        delete moves['Flash Cannon'].isPulse 
        delete MOVES_BY_ID[g].flashcannon.flags.pulse

        delete moves['Snipe Shot'].isPulse 
        delete MOVES_BY_ID[g].snipeshot.flags.pulse

        delete moves['Octazooka'].isPulse 
        delete MOVES_BY_ID[g].octazooka.flags.pulse

        moves["Fury Attack"].bp = 20
        MOVES_BY_ID[g].furyattack.basePower = 20

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
    localStorage.customLeads = JSON.stringify(customLeads)

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
