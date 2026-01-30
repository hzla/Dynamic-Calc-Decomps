function get_next_in_g5() {  
    
    var trainer_poks = CURRENT_TRAINER_POKS
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val() 
    
    if (TITLE.includes("Cascade")) {
        var weather = $('#weather-bar').find('input:checked')[0].value
        var weathers = {"Sun": "Fire", "Hail": "Ice", "Sand": "Rock", "Rain": "Water"}
        var immunities = {"Dry Skin": "Water", "Flash Fire": "Fire", "Well-Baked Body": "Fire", "Levitate": "Ground", "Sap Sipper": "Grass", "Motor Drive": "Electric", "Storm Drain": "Water", "Volt Absorb": "Electric", "Water Absorb": "Water", "Lightning Rod": "Electric", "Thunder Armor": "Electric"}
        var resistances = {"Slush Rush": "Ice", "Swift Swim": "Water", "Sand Rush": "Ground", "Justified": "Dark", "Toxic Boost": "Poison"}
        var player_status = $("#statusL1").val()
        var player_hp = parseInt($("#p1").find(".percent-hp").val())
        var player_ability = $("#abilityL1").val()
    }

    if (player_type2 == ""){
        player_type2 = player_type1
    }

    var type_info = get_type_info([player_type1, player_type2])

    var ranked_trainer_poks = []

    var player = createPokemon($('#p1'))
    var playerIgnoresAbilities = player.hasAbility("Mold Breaker", "Teravolt", "Turboblaze" ,"Neutralizing Gas") || player.hasItem("Tera Drill", "Ability Drill")


    for (i in trainer_poks) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var strongest_move_bp = 0
        var strongest_move = "None"
        var sub_index = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", "")
        var types = pokedex[pok_name].types

        



        var pok_data = SETDEX_BW[pok_name][tr_name]

        var opposing = createPokemon(`${pok_name} (${tr_name})`)
        var isFaster = opposing.stats.spe >= player.stats.spe
        var opposingIgnoresAbilities = opposing.hasAbility("Mold Breaker", "Teravolt", "Turboblaze" ,"Neutralizing Gas") || opposing.hasItem("Tera Drill", "Ability Drill")


        for (let move of opposing.moves) {
            var moveName = move.name
            var movData = moves[moveName]

            // for endeavor/grass knot/counter etc
            
            moveBp = move.bp
            if (moveBp == 1) {
                moveBp = 60
            }

                       
            if (TITLE.includes("Cascade")) {

                var isAerilate = false;
                var isPixilate = false;
                var isRefrigerate = false;
                var isNormalize = false;
                var isMoisturize = false;
                var isGalvanize = false;
                var hasAteTypeChange = false;
                var noTypeChange = move.named('Judgment', 'Nature Power', 'Techo Blast', 'Natural Gift', 'Weather Ball');

                
                if (!noTypeChange) {
                    var normal = move.hasType('Normal');
                    if ((isAerilate = opposing.hasAbility('Aerilate') && normal)) {
                        move.type = 'Flying';
                    }
                    else if ((isPixilate = opposing.hasAbility('Pixilate') && normal)) {
                        move.type = 'Fairy';
                    }
                    else if ((isGalvanize = opposing.hasAbility('Galvanize') && normal)) {
                        move.type = 'Electric';
                    }
                    else if ((isMoisturize = opposing.hasAbility('Moisturize') && normal)) {
                        move.type = 'Water';
                    }
                    else if ((isRefrigerate = opposing.hasAbility('Refrigerate') && normal)) {
                        move.type = 'Ice';
                    }
                    else if ((isNormalize = opposing.hasAbility('Normalize'))) {
                        move.type = 'Normal';
                    }
                    if (isPixilate || isRefrigerate || isAerilate || isNormalize || isGalvanize || isMoisturize) {
                        hasAteTypeChange = true;
                    }
                }

                if (hasAteTypeChange) {
                    moveBp *= 1.2
                }

                if (opposing.hasAbility("Technician") && moveBp <= 60) {
                    moveBp *= 1.5
                }
  
                if (types[0] == move.type || types[1] == move.type || opposing.hasAbility("Savant")) {
                    moveBp *= 1.5
                }

                if(opposing.hasAbility("Tenacity") && type_info[move.type] < 1) {
                    moveBp *= 2
                }

                // Move specific modifiers
                if (move.named("Eruption", "Water Spout")) {
                    moveBp = Math.max(1, Math.floor((150 * opposing.curHP()) / opposing.maxHP()));
                } else if (move.named("Flail","Reversal")) {
                    var p = Math.floor((48 * opposing.curHP()) / opposing.maxHP());
                    moveBp = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
                } else if (move.named("Knock Off") && player.hasItem()) {
                    moveBp *= 1.5
                } else if (move.named("Acrobatics") && (pok_data["item"] == "-" || pok_data["item"] == "Flying Gem")) {
                    moveBp *= 2
                } else if ((move.named("Gyro Ball", "Avalanche", "Payback", "Revenge") && !isFaster)) {
                    moveBp *= 2
                } else if (moveName == "Electro Ball" && isFaster) {
                    moveBp = (moveName == "Electro Ball" && opposing.stats.spe > player.stats.spe)
                } else if (move.named("Retaliate")) {
                    moveBp *= 2
                } else if (move.named("Solar Blade", "Solar Beam")) {
                    var canChargeSolar = weather == "Sun" || opposing.hasItem("Power Herb") || opposing.hasAbility("Solar Power", "Flower Gift", "Chlorophyll")
                    if (!canChargeSolar) {
                        moveBp = 0
                    }
                } else if (move.named("Electro Shot") && !opposing.hasItem("Power Herb") && weather != "Rain") {
                    moveBp *= 0.5
                } else if (move.named("Explosion", "Self-Destruct")) {
                    moveBp = 0
                }
                else if (player_status != "Healthy" && (move.named("Hex","Beat Up","Infernal Parade", "Bitter Malice","Barb Barrage"))) {
                    moveBp *= 2
                }
                else if (player_status == "Asleep" && (move.named("Dream Eater", "Wake-Up Slap"))) {
                    moveBp *= 2
                }
                else if (moveName == "Brine" && player_hp <= 50) {
                    moveBp *= 2
                }
                else if (moveName == "Weather Ball" && weather != "") {
                    moveBp *= 2
                    move.type = weathers[weather]
                }
                else if (moveName == "Explosion" || moveName == "Self-Destruct") {
                    moveBp = 0
                } else if (moveName == "Natural Gift" && pok_data.item.includes(" Berry")) {
                    let naturalGiftInfo = ITEMS_BY_ID[8][cleanString(pok_data.item)].naturalGift
                    move.type = naturalGiftInfo.type
                    moveBp = naturalGiftInfo.basePower
                }


                // Player Ability Modifiers
                if (!opposingIgnoresAbilities) {
                    if (immunities[player_ability]) {
                        if (move.type == immunities[player_ability]) {
                            moveBp = 0
                        }
                    } else if (resistances[player_ability]) {
                        if (move.type == resistances[player_ability]) {
                            moveBp *= 0.5
                        }
                    } else if (player_ability == "Thick Fat" && move.hasType("Fire", "Ice")) {
                        moveBp *= 0.5
                    } else if (player_ability == "Heatproof" && move.hasType("Fire")) {
                        moveBp *= 0.25
                    } else if (player_ability == "Soundproof") {
                        if (move.flags.sound) {
                            moveBp = 0   
                        }
                    } else if (player_ability == "Dry Skin" && move.hasType("Fire")) {
                        moveBp *= 2
                    } else if (player_ability == "Bulletproof") {
                        if (move.flags.bullet) {
                            moveBp = 0   
                        }
                    } else if (player_ability == "Wind Rider") {
                        if (move.flags.wind) {
                            moveBp = 0   
                        }
                    } 
                }
                
                
                // Crits
                if (move.isCrit && (!player.hasAbility("Battle Armor", "Shell Armor") || opposingIgnoresAbilities)) {
                    if (settings.critGen >= 6) {
                        moveBp *= 1.5
                    } else {
                        moveBp *= 2
                    }

                    if (opposing.hasAbility("Sniper")) {
                        moveBp *= 1.5
                    }
                }

                // Multihits
                if (movData.multihit && movData.multihit.constructor === Array) {
                    if (pok_data["ability"] == "Skill Link") {
                        moveBp *= movData.multihit[1]
                    } else if (pok_data["item"] == "Loaded Dice") {
                        moveBp *= Math.min(movData.multihit[1], 4)
                    }
                    else {
                         moveBp *= movData.multihit[0]
                    }
                } else if (movData.multihit) {
                    moveBp *= movData.multihit
                }


                // Type chart modifiers
                if (opposing.hasAbility("Scrappy", "Corrosion","Normalize","Inner Focus")) {
                    type_info = get_type_info([player_type1, player_type2], opposing.ability)
                } else if (move.named("Chip Away","Sacred Sword", "Relic Song","Freeze-Dry","Sky Uppercut")) {
                    type_info = get_type_info([player_type1, player_type2], moveName)
                }

                if (type_info < 1 && opposing.hasAbility("Tenacity")) {
                    moveBp *= 2
                }
            }

            var bp = moveBp * type_info[move.type]

            if (bp > strongest_move_bp) {
                strongest_move_bp = bp
                strongest_move = moveName
            }
            else if (bp == strongest_move_bp) {
                strongest_move += (", " + moveName)
            } else {

            }
        }
        ranked_trainer_poks.push([trainer_poks[i], strongest_move_bp, strongest_move, sub_index, pok_data["moves"]])
    }


   if ((typeof noSwitch != "undefined" && noSwitch == "1") || partnerName) {
       ranked_trainer_poks = ranked_trainer_poks.sort(sort_subindex)
   } else {
        ranked_trainer_poks = ranked_trainer_poks.sort(sort_trpoks)
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