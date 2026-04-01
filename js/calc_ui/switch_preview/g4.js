function get_next_in_g4() {
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    function g4_type_multiplier_40(attackingType, defendingType1, defendingType2) {
        var TYPE_MULTI_IMMUNE = 0
        var TYPE_MULTI_NOT_VERY_EFF = 5
        var TYPE_MULTI_SUPER_EFF = 20
        var TYPE_MULTI_BASE_DAMAGE = 40

        var typeChart = {
            Normal:   { Rock: TYPE_MULTI_NOT_VERY_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF, Ghost: TYPE_MULTI_IMMUNE },
            Fire:     { Fire: TYPE_MULTI_NOT_VERY_EFF, Water: TYPE_MULTI_NOT_VERY_EFF, Grass: TYPE_MULTI_SUPER_EFF, Ice: TYPE_MULTI_SUPER_EFF, Bug: TYPE_MULTI_SUPER_EFF, Rock: TYPE_MULTI_NOT_VERY_EFF, Dragon: TYPE_MULTI_NOT_VERY_EFF, Steel: TYPE_MULTI_SUPER_EFF },
            Water:    { Fire: TYPE_MULTI_SUPER_EFF, Water: TYPE_MULTI_NOT_VERY_EFF, Grass: TYPE_MULTI_NOT_VERY_EFF, Ground: TYPE_MULTI_SUPER_EFF, Rock: TYPE_MULTI_SUPER_EFF, Dragon: TYPE_MULTI_NOT_VERY_EFF },
            Electric: { Water: TYPE_MULTI_SUPER_EFF, Electric: TYPE_MULTI_NOT_VERY_EFF, Grass: TYPE_MULTI_NOT_VERY_EFF, Ground: TYPE_MULTI_IMMUNE, Flying: TYPE_MULTI_SUPER_EFF, Dragon: TYPE_MULTI_NOT_VERY_EFF },
            Grass:    { Fire: TYPE_MULTI_NOT_VERY_EFF, Water: TYPE_MULTI_SUPER_EFF, Grass: TYPE_MULTI_NOT_VERY_EFF, Poison: TYPE_MULTI_NOT_VERY_EFF, Ground: TYPE_MULTI_SUPER_EFF, Flying: TYPE_MULTI_NOT_VERY_EFF, Bug: TYPE_MULTI_NOT_VERY_EFF, Rock: TYPE_MULTI_SUPER_EFF, Dragon: TYPE_MULTI_NOT_VERY_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF },
            Ice:      { Fire: TYPE_MULTI_NOT_VERY_EFF, Water: TYPE_MULTI_NOT_VERY_EFF, Grass: TYPE_MULTI_SUPER_EFF, Ice: TYPE_MULTI_NOT_VERY_EFF, Ground: TYPE_MULTI_SUPER_EFF, Flying: TYPE_MULTI_SUPER_EFF, Dragon: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF },
            Fighting: { Normal: TYPE_MULTI_SUPER_EFF, Ice: TYPE_MULTI_SUPER_EFF, Poison: TYPE_MULTI_NOT_VERY_EFF, Flying: TYPE_MULTI_NOT_VERY_EFF, Psychic: TYPE_MULTI_NOT_VERY_EFF, Bug: TYPE_MULTI_NOT_VERY_EFF, Rock: TYPE_MULTI_SUPER_EFF, Ghost: TYPE_MULTI_IMMUNE, Dark: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_SUPER_EFF, Fairy: TYPE_MULTI_NOT_VERY_EFF },
            Poison:   { Grass: TYPE_MULTI_SUPER_EFF, Poison: TYPE_MULTI_NOT_VERY_EFF, Ground: TYPE_MULTI_NOT_VERY_EFF, Rock: TYPE_MULTI_NOT_VERY_EFF, Ghost: TYPE_MULTI_NOT_VERY_EFF, Steel: TYPE_MULTI_IMMUNE, Fairy: TYPE_MULTI_SUPER_EFF },
            Ground:   { Fire: TYPE_MULTI_SUPER_EFF, Electric: TYPE_MULTI_SUPER_EFF, Grass: TYPE_MULTI_NOT_VERY_EFF, Poison: TYPE_MULTI_SUPER_EFF, Flying: TYPE_MULTI_IMMUNE, Bug: TYPE_MULTI_NOT_VERY_EFF, Rock: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_SUPER_EFF },
            Flying:   { Electric: TYPE_MULTI_NOT_VERY_EFF, Grass: TYPE_MULTI_SUPER_EFF, Fighting: TYPE_MULTI_SUPER_EFF, Bug: TYPE_MULTI_SUPER_EFF, Rock: TYPE_MULTI_NOT_VERY_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF },
            Psychic:  { Fighting: TYPE_MULTI_SUPER_EFF, Poison: TYPE_MULTI_SUPER_EFF, Psychic: TYPE_MULTI_NOT_VERY_EFF, Dark: TYPE_MULTI_IMMUNE, Steel: TYPE_MULTI_NOT_VERY_EFF },
            Bug:      { Fire: TYPE_MULTI_NOT_VERY_EFF, Grass: TYPE_MULTI_SUPER_EFF, Fighting: TYPE_MULTI_NOT_VERY_EFF, Poison: TYPE_MULTI_NOT_VERY_EFF, Flying: TYPE_MULTI_NOT_VERY_EFF, Psychic: TYPE_MULTI_SUPER_EFF, Ghost: TYPE_MULTI_NOT_VERY_EFF, Dark: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF, Fairy: TYPE_MULTI_NOT_VERY_EFF },
            Rock:     { Fire: TYPE_MULTI_SUPER_EFF, Ice: TYPE_MULTI_SUPER_EFF, Fighting: TYPE_MULTI_NOT_VERY_EFF, Ground: TYPE_MULTI_NOT_VERY_EFF, Flying: TYPE_MULTI_SUPER_EFF, Bug: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF },
            Ghost:    { Normal: TYPE_MULTI_IMMUNE, Psychic: TYPE_MULTI_SUPER_EFF, Ghost: TYPE_MULTI_SUPER_EFF, Dark: TYPE_MULTI_NOT_VERY_EFF },
            Dragon:   { Dragon: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF, Fairy: TYPE_MULTI_IMMUNE },
            Dark:     { Fighting: TYPE_MULTI_NOT_VERY_EFF, Psychic: TYPE_MULTI_SUPER_EFF, Ghost: TYPE_MULTI_SUPER_EFF, Dark: TYPE_MULTI_NOT_VERY_EFF, Fairy: TYPE_MULTI_NOT_VERY_EFF },
            Steel:    { Fire: TYPE_MULTI_NOT_VERY_EFF, Water: TYPE_MULTI_NOT_VERY_EFF, Electric: TYPE_MULTI_NOT_VERY_EFF, Ice: TYPE_MULTI_SUPER_EFF, Rock: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF, Fairy: TYPE_MULTI_SUPER_EFF },
            Fairy:    { Fire: TYPE_MULTI_NOT_VERY_EFF, Fighting: TYPE_MULTI_SUPER_EFF, Poison: TYPE_MULTI_NOT_VERY_EFF, Dragon: TYPE_MULTI_SUPER_EFF, Dark: TYPE_MULTI_SUPER_EFF, Steel: TYPE_MULTI_NOT_VERY_EFF }
        }

        var mul = TYPE_MULTI_BASE_DAMAGE
        var attackTable = typeChart[attackingType] || {}

        if (attackTable.hasOwnProperty(defendingType1)) {
            mul = Math.floor(mul * attackTable[defendingType1] / 10)
        }

        if (defendingType1 != defendingType2 && attackTable.hasOwnProperty(defendingType2)) {
            mul = Math.floor(mul * attackTable[defendingType2] / 10)
        }

        return mul
    }

    function g4_phase1_score_40(monType1, monType2, playerType1, playerType2) {
        return g4_type_multiplier_40(monType1, playerType1, playerType2)
            + g4_type_multiplier_40(monType2, playerType1, playerType2)
    }

    var ranked_trainer_poks = []
    var trainer_poks = CURRENT_TRAINER_POKS
    var trainer_poks_copy = JSON.parse(JSON.stringify(trainer_poks))
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val()
    var player_pok = $('.set-selector.player')[1].value.substring(0, $('.set-selector.player')[1].value.indexOf(" ("))

    if (player_type2 == "") {
        player_type2 = player_type1
    }

    // get type chart
    var type_info = get_type_info([player_type1, player_type2])

    // get mons with SE moves and sort by type matchup and trainer order
    var se_mons = []
    var se_mon_ids = []

    // Exact internal stale score source for the Gen 4 bug:
    // among mons that fail Phase 1, keep the lowest exact 40-based Phase 1 score,
    // with later party slot winning ties.
    var lowest_phase1_score_40 = Infinity
    var lowest_phase1_sub_index = -1
    var lowest_phase1_mon = ""

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

        var expYield = Math.floor(Math.floor(expYields[cleanString(pok_name)] * pok_data.level / 7) * 1.5);



        var plate_type = null
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

        var exact_phase1_score_40 = g4_phase1_score_40(type1, type2, player_type1, player_type2)


        var full_immune = (effectiveness == 0)



        // check moves for SE
        var isSE = false
        var added_to_se_bucket = false
        var seMoves = []

        for (j in pok_data["moves"]) {
            var mov_name = pok_data["moves"][j]
            var mov_data = moves[mov_name]

            if (pok_data["moves"][j] == "Judgment") {
                mov_data["type"] = plate_type
            }

            if (pok_data["moves"][j] == "Weather Ball") {
                var weather = p1field.weather
                var weatherBallTypes = {"Sun": "Fire", "Hail": "Ice", "Rain": "Water", "Sand": "Rock"}
                mov_data["type"] = weatherBallTypes[weather] || "Normal"
            }



            // Curse can't be supereffective against anything
            if (!mov_data || mov_name == "Curse") {
                continue
            }



            if (mov_data) {
                var groundWeak = ["Aerodactyl","Skarmory"]
                var electricWeak = ["Gligar", "Gliscor"]
                var scrappyWeak = ["Sableye", "Spiritomb"]

                if (pok_data.ability == "Normalize") {
                    mov_data["type"] = "Normal"
                }

                // Fairy type insertion bugs
                if (TITLE == "Renegade Platinum") {
                    groundWeak.push("Zapdos")
                    groundWeak.push("Zubat")
                    groundWeak.push("Golbat")
                    groundWeak.push("Crobat")
                    groundWeak.push("Moltres")

                    electricWeak.push("Gastrodon")
                    electricWeak.push("Marshtomp")
                    electricWeak.push("Swampert")
                    electricWeak.push("Barboach")
                    electricWeak.push("Whishcash")
                    electricWeak.push("Wooper")
                    electricWeak.push("Quagsire")
                }

                if (mov_data["type"] == "Ground" && groundWeak.includes(player_pok)) {
                    isSE = true
                }

                if (mov_data["type"] == "Electric" && electricWeak.includes(player_pok)) {
                    isSE = true
                }

                if (player_pok == "Altaria" && mov_data["type"] == "Dragon") {
                    isSE = true
                }

                if (player_pok == "Altaria" && mov_data["type"] == "Dragon") {
                    isSE = true
                }

                if (mov_data["type"] == "Fighting" && scrappyWeak.includes(player_pok) && pok_data.ability == "Scrappy") {
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
                se_mons.push([trainer_poks[i], 0, mov_name, sub_index, pok_data["moves"], effectiveness, '', '', expYield, exact_phase1_score_40])
                se_mon_ids.push(trainer_poks[i])
                added_to_se_bucket = true
                break
            }
        }

        // Track the exact internal stale-score source from mons that fail Phase 1.
        if (!added_to_se_bucket) {
            if (
                exact_phase1_score_40 < lowest_phase1_score_40 ||
                (exact_phase1_score_40 == lowest_phase1_score_40 && sub_index > lowest_phase1_sub_index)
            ) {
                lowest_phase1_score_40 = exact_phase1_score_40
                lowest_phase1_sub_index = sub_index
                lowest_phase1_mon = trainer_poks[i]
            }
        }
    }

    // Phase 2: sort rest of mons by using other mons moves with current mon stats
    var other_mons = []

    var currentHp = parseInt($('.max-hp').first().text())

    // The bug only affects the first Phase 2 mon checked.
    var checked_first_phase2_mon = false

    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var type1 = pokedex[pok_name]["types"][0]
        var type2 = pokedex[pok_name]["types"][1] || type1
        var pok_data = SETDEX_BW[pok_name][tr_name]
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))

        expYield = Math.floor(Math.floor(expYields[cleanString(pok_name)] * pok_data.level / 7) * 1.5);



        if (se_mon_ids.includes(trainer_poks[i])) {
            continue
        }



        var is_first_phase2_mon = !checked_first_phase2_mon
        checked_first_phase2_mon = true

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
        calcingForSwitchIns = true
        var results = calculateAllMoves(settings.damageGen, p1, p1field, p2, p2field, false)[1]
        calcingForSwitchIns = false

        var highestDamage = 0
        var highestDamageName = ""

        for (n in results) {
            var dmg = 0
            var moveName = results[n].move.name
            var isIgnoredPhase2Move = moves[moveName].bp == 1
            var useBuggedPhase2Damage = false

            if (
                is_first_phase2_mon &&
                parseInt(n) === 0 &&
                isIgnoredPhase2Move &&
                lowest_phase1_score_40 !== Infinity
            ) {
                dmg = lowest_phase1_score_40
                useBuggedPhase2Damage = true
            } else {
                if (isIgnoredPhase2Move) {
                    continue
                }

                if (typeof results[n].damage === 'number') {
                    dmg = results[n].damage % 255
                } else {
                    dmg = results[n].damage[results[n].damage.length - 1] % 255
                }

                // correct for doubling dmg when slower moves
                if (["Avalanche", "Payback", "Assurance"].includes(moveName) && results[n].attacker.rawStats.spe < results[n].defender.rawStats.spe) {
                    dmg = dmg / 2
                }

                if (moves[moveName] && moves[moveName]['multihit']) {
                    dmg = Math.floor(dmg / 3)
                }
            }

            if (dmg > highestDamage) {
                highestDamage = dmg
                if (useBuggedPhase2Damage) {
                    highestDamageName = moveName
                } else {
                    highestDamageName = moveName
                }
            }
        }
        other_mons.push([trainer_poks[i], 0, "", sub_index, pok_data["moves"], highestDamage, highestDamageName, '', expYield, null])
    }

    orderedMons = []

    if (settings.noSwitch) {
        orderedMons = se_mons.concat(other_mons).sort(sort_trpoks_g4)
    } else {
        orderedMons = se_mons.sort(sort_trpoks_g4).concat(other_mons.sort(sort_trpoks_g4))
    }

    console.log(orderedMons)
    return (orderedMons)
}

function sort_trpoks_g4(a, b) {
    console.log(settings.noSwitch)
    if (settings.noSwitch) {
        return (b[3] > a[3]) ? -1 : 1;
    }

    if (a[5] === b[5]) {
        return (b[3] > a[3]) ? -1 : 1;
    }
    else {
        return (b[5] < a[5]) ? -1 : 1;
    }
}


