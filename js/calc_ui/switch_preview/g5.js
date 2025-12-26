function get_next_in_g5() {  
    
    var trainer_poks = CURRENT_TRAINER_POKS
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val() 
    
    if (TITLE == "Cascade White 2") {
        var weather = $('#weather-bar').find('input:checked')[0].value
        var weathers = {"Sun": "Fire", "Hail": "Ice", "Sand": "Rock", "Rain": "Water"}
        var immunities = {"Dry Skin": "Water", "Flash Fire": "Fire", "Levitate": "Ground", "Sap Sipper": "Grass", "Motor Drive": "Electric", "Storm Drain": "Water", "Volt Absorb": "Electric", "Water Absorb": "Water"}
        var player_status = $("#statusL1").val()
        var player_hp = parseInt($("#p1").find(".percent-hp").val())
        var player_ability = $("#abilityL1").val()
    }

    if (player_type2 == ""){
        player_type2 = player_type1
    }

    var type_info = get_type_info([player_type1, player_type2])

    var ranked_trainer_poks = []

    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var strongest_move_bp = 0
        var strongest_move = "None"
        var sub_index = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", "")
        var types = pokedex[pok_name].types



        var pok_data = SETDEX_BW[pok_name][tr_name]

        for (j in pok_data["moves"]) {
            var mov_data = moves[pok_data["moves"][j]]

            if (!mov_data) {
                continue
            }

            // for endeavor/grass knot/counter etc
            
            mov_bp = mov_data["bp"]
            if (mov_bp == 1) {
                mov_bp = 60
            }

            
            if (TITLE == "Cascade White 2") {
                
                if (pok_data["ability"] == "Technician" && mov_bp <= 60) {
                    mov_bp = mov_bp * 1.5
                }

                if (types[0] == mov_data["type"] || types[1] == mov_data["type"]) {
                    mov_bp = mov_bp * 1.5
                }

                if (pok_data["moves"][j] == "Acrobatics" && (pok_data["item"] == "-" || pok_data["item"] == "Flying Gem")) {
                    mov_bp = mov_bp * 2
                }

                else if (player_status != "Healthy" && (pok_data["moves"][j] == "Hex" || pok_data["moves"][j] == "Barb Barrage" || pok_data["moves"][j] == "Infernal Parade" || pok_data["moves"][j] == "Beat Up")) {
                    mov_bp = mov_bp * 2
                }

                else if (player_status == "Asleep" && (pok_data["moves"][j] == "Dream Eater" || pok_data["moves"][j] == "Wake-Up Slap")) {
                    mov_bp = mov_bp * 2
                }

                else if (pok_data["moves"][j] == "Brine" && player_hp <= 50) {
                    mov_bp = mov_bp * 2
                }

                else if ((pok_data["moves"][j] == "Frost Breath" || pok_data["moves"][j] == "Storm Throw" || pok_data["moves"][j] == "Pay Day") && (!player_ability.includes(" Armor"))) {
                    mov_bp = mov_bp * 2
                }

                else if (pok_data["moves"][j] == "Weather Ball" && weather != "") {
                    mov_bp = mov_bp * 2
                    mov_data["type"] = weathers[weather]
                }
                else if (pok_data["moves"][j] == "Explosion" || pok_data["moves"][j] == "Self-Destruct") {
                    mov_bp = 0
                }

                if (immunities[player_ability]) {
                    if (mov_data["type"] == immunities[player_ability]) {
                        mov_bp = 0
                    }
                }

                if (player_ability == "Soundproof") {
                    if (mov_data.isSound) {
                        mov_bp = 0   
                    }
                }

                if (mov_data.multihit) {
                    if (pok_data["ability"] == "Skill Link") {
                        mov_bp = mov_bp * mov_data.multihit[1]
                    } else {
                         mov_bp = mov_bp * mov_data.multihit[0]
                    }
                }
            }

            if (TITLE == "Cascade White 2" && (player_ability == "Corrosion" || player_ability == "Scrappy")) {
                type_info = get_type_info([player_type1, player_type2], player_ability)
            }

            var bp = mov_bp * type_info[mov_data["type"]]

            
            if (TITLE == "Cascade White 2") {
                if ((pok_data["moves"][j] == "Freeze-Dry") && types.includes("Water") || (pok_data["moves"][j] == "Sky Uppercut") && types.includes("Flying")) {
                    bp = bp * 4
                }
            }
            


            if (bp > strongest_move_bp) {
                strongest_move_bp = bp
                strongest_move = pok_data["moves"][j]
            }
            else if (bp == strongest_move_bp) {
                strongest_move += (", " + pok_data["moves"][j])
            } else {

            }
        }
        ranked_trainer_poks.push([trainer_poks[i], strongest_move_bp, strongest_move, sub_index, pok_data["moves"]])
    }

    if ((typeof noSwitch != "undefined" && noSwitch == "1") || partnerName) {
       ranked_trainer_poks.sort(sort_subindex)
   } else {
        ranked_trainer_poks.sort(sort_trpoks)
   }

    // Auto-sorts Megas to come out last - this should only run on switchIn=5
    var endSwap = null
    var foundMega = false
    for (var i = 0; i < ranked_trainer_poks.length; i++) {
                if (TITLE == "Ancestral X")
                    break;

        if (foundMega) {
            if (i == ranked_trainer_poks.length - 1)
                ranked_trainer_poks[i - 1] = endSwap
            else
                ranked_trainer_poks[i - 1] = ranked_trainer_poks[i]
        }
      
        if (ranked_trainer_poks[i][0].includes("-Mega")) {
            endSwap = ranked_trainer_poks[ranked_trainer_poks.length - 1]
            ranked_trainer_poks[ranked_trainer_poks.length - 1] = ranked_trainer_poks[i]
            foundMega = true
        }
    }
  
    console.log(ranked_trainer_poks)
    return ranked_trainer_poks
}