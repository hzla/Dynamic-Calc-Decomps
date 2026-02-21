GEN4_PHASE2_IGNORE_LIST = [
    "Reversal",
    "Flail",
    "Frustration",
    "Return",
    "Low Kick",
    "Magnitude",
    "Present",
    "Endeavor",
    "Night Shade",
    "Seismic Toss",
    "Psywave",
    "Sonicboom",
    "Super Fang",
    "Fissure",
    "Horn Drill",
    "Sheer Cold",
    "Guillotine",
    "Grass Knot",
    "Gyro Ball"
]

function get_next_in_g4() {
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }
    var ranked_trainer_poks = []
    var trainer_poks = CURRENT_TRAINER_POKS
    var trainer_poks_copy = JSON.parse(JSON.stringify(trainer_poks))
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val() 
    var player_pok = $('.set-selector.player')[1].value.substring(0, $('.set-selector.player')[1].value.indexOf(" ("))

    if (player_type2 == ""){
        player_type2 = player_type1
    }

    // get type chart
    var type_info = get_type_info([player_type1, player_type2])

    // get mons with SE moves and sort by type matchup and trainer order
    var se_mons = []
    var se_indexes = []


    var p1info = $("#p1");
    var p2info = $("#p2");
    var p1 = createPokemon(p1info);
    var p2 = createPokemon(p2info);
    var p1field = createField();
    var p2field = p1field.clone().swap();

    try {
        p1.ability = customSets[p1.name]["My Box"].ability   
    } catch {
        p1.ability = "Pressure"
    }

    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        if (!pokedex[pok_name]) {
            continue
        }
        var type1 = pokedex[pok_name]["types"][0]
        var type2 = pokedex[pok_name]["types"][1] || type1

        var pok_data = SETDEX_BW[pok_name][tr_name]
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))

        if (pok_data["ability"] == "Multitype") {
            var plates = {}
            plates["Blank"] = "Normal"
            plates["Draco"] = "Dragon"
            plates["Dread"] = "Dark"
            plates["Earth"] = "Ground"
            plates["Fist"] = "Fighting"
            plates["Flame"] = "Fire"
            plates["Icicle"] = "Ice"
            plates["Insect"] = "Bug"
            plates["Iron"] = "Steel"
            plates["Meadow"] = "Grass"
            plates["Mind"] = "Psychic"
            plates["Pixie"] = "Fairy"
            plates["Sky"] = "Flying"
            plates["Splash"] = "Water"
            plates["Spooky"] = "Ghost"
            plates["Stone"] = "Rock"
            plates["Toxic"] = "Poison"
            plates["Zap"] = "Electric"
            plate_type = plates[pok_data["item"].split(" Plate")[0]]
            type1 = plate_type
            type2 = plate_type
        }


        var effectiveness = type_info[type1] + type_info[type2]
        if (effectiveness == 8) {
            effectiveness = 1.75
        }
        var full_immune = (effectiveness == 0)

        // check moves for SE
        var isSE = false

        for (j in pok_data["moves"]) {
            var mov_name = pok_data["moves"][j]


            var mov_data = moves[mov_name]

            if (pok_data["moves"][j] == "Judgment") {
                mov_data["type"] = plate_type
            }

            // Curse can't be supereffective against anything
            if (!mov_data || mov_name == "Curse") {
                continue
            }

            if (mov_data) {

                if (mov_data["type"] == "Ground" && "Skarmory,Aerodactyl,Zapdos,Crobat,Moltres".includes(player_pok)){
                    isSE = true
                }

                if (mov_data["type"] == "Electric" && "Gastrodon,Swampert,Whishcash,Quagsire,Marshtomp".includes(player_pok)){
                    isSE = true
                }

                if (player_pok == "Altaria" && mov_data["type"] == "Dragon") {
                    isSE = true
                }

                if (player_type1 == "Steel" && player_type2 == "Fairy" && mov_data["type"] == "Poison") {
                    isSE = true
                }

                if (player_pok == "Girafarig" && mov_data["type"] == "Ghost") {
                    isSE = true
                }

                if (type_info[mov_data["type"]] >= 2) {
                    isSE = true
                }           
            }

            if (p1.ability == 'Levitate' && mov_data["type"] == "Ground") {
                isSE = false
            }

            if (isSE && !full_immune) {   
                se_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"], effectiveness])
                se_indexes.push(sub_index)
                break
            }           
        }
    }

    // Phase 2: sort rest of mons by using other mons moves with current mon stats
    var other_mons = []

    var currentHp = parseInt($('.max-hp').first().text())


    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var type1 = pokedex[pok_name]["types"][0]
        var type2 = pokedex[pok_name]["types"][1] || type1
        var pok_data = SETDEX_BW[pok_name][tr_name]
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))

        if (se_indexes.includes(sub_index)) {
            continue
        }

        // p1 = createPokemon($("#p1"))
        // create mon with ignoteStatMods = true
        p2 = createPokemon(p2info, pok_data["moves"], true)
        p2.originalCurHP = 1

        if (p2.ability == "Reckless") {
            p2.ability = "Minus"
        }

        if (p2.item == "Life Orb") {
            p2.item = "Leftovers"
        }

         // because the game only counts multihits moves as 1 
    
        var results = calculateAllMoves(settings.damageGen, p1, p1field, p2, p2field, false)[1];
        

        var highestDamage = 0
        var highestDamageName = ""
        for (n in results) {
            var dmg = 0
            if (typeof results[n].damage === 'number') {
                dmg = results[n].damage % 255
            } else {
                dmg = results[n].damage[results[n].damage.length - 1] % 255
            }

            // correct for doubling dmg when slower moves
            if (["Avalanche", "Payback", "Assurance"].includes(results[n].move.name) && results[n].attacker.rawStats.spe < results[n].defender.rawStats.spe) {
                dmg = dmg / 2
            }

            if (dmg > highestDamage && !GEN4_PHASE2_IGNORE_LIST.includes(results[n].move.name) ) {
                if (moves[results[n].move.name]['multihit']) {
                    dmg = Math.floor(dmg / 3)
                }
                highestDamage = dmg
                highestDamageName = results[n].move.name
            }
        }
        other_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"], highestDamage, highestDamageName])
    }
    console.log(se_mons.sort(sort_trpoks_g4).concat(other_mons.sort(sort_trpoks_g4)))
    return(se_mons.sort(sort_trpoks_g4).concat(other_mons.sort(sort_trpoks_g4)))
}

function sort_trpoks_g4(a, b) {
    if (a[5] === b[5]) {
        return (b[3] > a[3]) ? -1 : 1;
    }
    else {
        return (b[5] < a[5]) ? -1 : 1;
    }
}