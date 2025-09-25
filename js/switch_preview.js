function canTrap(trapper, target) {
    if (target.types.includes("Ghost")) return false;

    if (trapper.ability == "Shadow Tag") {
        if (target.ability != "Shadow Tag") return true;
    }

    if (trapper.ability == "Magnet Pull" && target.types.includes("Steel")) return true;
    if (trapper.ability == "Arena Trap" && target.ability != "Levitate" && !target.types.includes("Flying")) return true;

    return false;
}

// Attacker is Player, Defender is AI
function matchupData(attackerVDefenderResults, defenderVAttackerResults) {
    disableKOChanceCalcs = true
    let gen = {
        "num": 8,
        "abilities": {
            "gen": 8
        },
        "items": {
            "gen": 8
        },
        "moves": {
            "gen": 8
        },
        "species": {
            "gen": 8
        },
        "types": {
            "gen": 8
        },
        "natures": {}
    }

    let attacker = defenderVAttackerResults[0].defender
    let defender = defenderVAttackerResults[0].attacker

    let defenderField = defenderVAttackerResults[0].field
    let attackerField = attackerVDefenderResults[0].field

    let defenderFastestKill = 100
    let attackerFastestKill = 100

    let defenderFastestPrioKill = 100
    let attackerFastestPrioKill = 100

    let attackerBestMoveHasPrio = false
    let defenderBestMoveHasPrio = false

    let isRevenge = false
    let isThreaten = false
    let isTrapper = canTrap(defender, attacker)
    let highestDmgDealt = 0
    let bestMove = "(None)"
    let isOhkod = false

    let wins1v1 = false


    let isFaster = defender.rawStats.spe >= p1RawSpeed
    let movesFirst = false







     for (moveIndex in attacker.moves) {
        let move = attacker.moves[moveIndex]
        damage = attackerVDefenderResults[moveIndex].damage

        if (damage.length == 16) {
            damage = damage.map(() => damage[8])
        }

        // count how many turns to kill including status/hazards and recovery items
        let koData = getKOChance(gen, attacker, defender, move, attackerField, damage, false)
        let turnsToKill = koData.n

        // 0 means too insignificant to matter
        if (turnsToKill == 0) {
            continue;
        }

        if (turnsToKill == 1) {
            isOhkod = true
        }

        if (turnsToKill <= attackerFastestKill) {
            attackerFastestKill = turnsToKill
        } 

        if (move.priority) {
            if (turnsToKill <= attackerFastestPrioKill) {
                attackerFastestPrioKill = turnsToKill;      
                
                // attacker is marked as having prio since this is the fastest kill the move or tied with fastest
                if (turnsToKill <= attackerFastestKill) {
                    attackerBestMoveHasPrio = true;
                }
            }
        }       
    }




    for (moveIndex in defender.moves) {
        let move = defender.moves[moveIndex]
        damage = defenderVAttackerResults[moveIndex].damage


        if (damage.length == 16) {
            damage = damage.map(() => damage[8])
        }

        if (damage[0] > highestDmgDealt) {
            highestDmgDealt = damage[0]
        }

        // TODO: AI doesn't see status on player, or weather damage effects



        // count how many turns to kill including status/hazards and recovery items
        let koData = getKOChance(gen, defender, attacker, move, defenderField, damage, false)
        let turnsToKill = koData.n

        // 0 means too insignificant to matter
        if (turnsToKill == 0) {
            continue;
        }

        // OHKO means revenge killer
        if (turnsToKill == 1) {
            isRevenge = true

            if (move.priority) {
                defenderBestMoveHasPrio = true
            }
        }

        // 2hko means threatener
        if (turnsToKill == 2) {
            isThreaten = true

            if (move.priority && defenderFastestKill >= 2) {
                defenderBestMoveHasPrio = true
            }
        }

        if (turnsToKill <=  defenderFastestKill) {
            defenderFastestKill = turnsToKill

            if (move.priority) {
                defenderBestMoveHasPrio = true
            }
            bestMove = move.name
        }
   
        if (move.priority) {
            // faster and using priority
            if (isFaster) {
                // compare turns to kill with player fastest kill
                if (turnsToKill <= attackerFastestKill) {
                    wins1v1 = true
                }       
            // slower and using priority
            } else {
                // compare turns to kill with player fastest non prio kill and prio kill
                if (turnsToKill <= attackerFastestKill && turnsToKill < attackerFastestPrioKill) {
                    wins1v1 = true
                }
            }
        } else {
            // faster without priority
            if (isFaster) {
                // compare turns to kill with player fastest non prio kill and prio kill
                if (turnsToKill <= attackerFastestKill && turnsToKill < attackerFastestPrioKill) {
                    wins1v1 = true
                }
            // slower and non priority
            } else {
                // compare turns to kill with player fastest non prio kill and prio kill
                if (turnsToKill < attackerFastestKill && turnsToKill < attackerFastestPrioKill) {
                    wins1v1 = true
                }
            }
        }
    }

   
    if (defenderBestMoveHasPrio && !attackerBestMoveHasPrio) {
        movesFirst = true
    } else if ( (defenderBestMoveHasPrio && attackerBestMoveHasPrio) || (!defenderBestMoveHasPrio && !attackerBestMoveHasPrio)) {
        movesFirst = isFaster
    }



    let debug = {defenderBestMoveHasPrio: defenderBestMoveHasPrio, attackerBestMoveHasPrio: attackerBestMoveHasPrio, attackerFastestKill: attackerFastestKill, defenderFastestKill: defenderFastestKill, attackerFastestPrioKill: attackerFastestPrioKill, isFaster: isFaster, movesFirst: movesFirst}
    
    // console.log(debug)
    
    // console.log(`${defender.name} using ${bestMove} kills in ${defenderFastestKill}`)
    // console.log(`${attacker.name} kills in ${attackerFastestKill}`)

    let matchupData = {wins1v1: wins1v1, isFaster: movesFirst, isRevenge: isRevenge, isThreaten: isThreaten, maxDmg: highestDmgDealt, move: bestMove, isTrapper: isTrapper, isOhkod: isOhkod}

    disableKOChanceCalcs = false
    return matchupData
}

function get_next_in() {  
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }

    var trainer_poks = CURRENT_TRAINER_POKS
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val() 
    
    if (player_type2 == ""){
        player_type2 = player_type1
    }

    var type_info = get_type_info([player_type1, player_type2])
    var currentHp = parseInt($('.current-hp').first().val())

    var p1info = $("#p1");
    var p2info = $("#p2");
    var p1 = createPokemon(p1info);

    p1RawSpeed = parseInt($('#p1 .totalMod').text())

    var p1field = createField();
    var p2field = p1field.clone().swap();

    ranked_trainer_poks = []

    for (i in trainer_poks) {
        analysis = ""

        p2 = createPokemon(trainer_poks[i].slice(0,-3))

        if (!hasEvs) {
            p2.evs = {
                "hp": 0,
                "atk": 0,
                "def": 0,
                "spa": 0,
                "spd": 0,
                "spe": 0
            }
        }

        let all_results = calculateAllMoves(damageGen, p1, p1field, p2, p2field, false);
        
        let player_results = all_results[0]
        let results = all_results[1]

        let pok_name = trainer_poks[i].split(" (")[0]
        let tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        let pok_data = SETDEX_BW[pok_name][tr_name]

        let sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))
        let types = pokedex[pok_name].types
        let type_matchup = getTypeMatchup([player_type1, player_type2], types)

        let switchInScore = 0


        matchup = {}

        analysis += `<div class='bp-info switch-info mu-info'>Type MU: ${type_matchup}</div>` 




        if (noSwitch != '1') {
             matchup = matchupData(player_results, results)

            matchup["type_matchup"] = type_matchup

            

            // Check for trappers, revenge killers, and good matchups
            if (matchup.wins1v1) {
                analysis += "<div class='bp-info switch-info'>Wins 1v1</div>" 
                // trapper
                if (matchup.isTrapper && matchup.wins1v1) {
                    switchInScore += 20000
                    analysis += "<div class='bp-info switch-info'>Trapper</div>"
                // fast ohko
                } else if (matchup.isRevenge && matchup.isFaster) {
                    switchInScore += sub_index
                    switchInScore += 10000 
                    analysis += "<div class='bp-info switch-info'>Fast Ohko</div>"
                // slow ohko
                } else if (matchup.isRevenge && !matchup.isFaster) {
                    switchInScore += sub_index
                    switchInScore += 9500
                    analysis += "<div class='bp-info switch-info'>Slow Ohko</div>" 
                // fast 2hko
                } else if (matchup.isThreaten && matchup.isFaster && !matchup.move.includes("Explosion") && !matchup.move != "Self-Destruct") {
                    switchInScore += sub_index
                    switchInScore += 9000 
                    analysis += "<div class='bp-info switch-info'>Fast 2Hko</div>" 
                // slow 2hko
                } else if (matchup.isThreaten && matchup.isFaster && !matchup.move.includes("Explosion") && !matchup.move != "Self-Destruct") {
                    switchInScore += sub_index
                    switchInScore += 8500
                    analysis += "<div class='bp-info switch-info'>Slow 2Hko</div>" 
                // good matchup
                } else if (type_matchup < 2) {
                    analysis += "<div class='bp-info switch-info'>Good MU</div>" 
                    switchInScore += 4000 * (2 - type_matchup)
                // wins 1v1
                } else {
                    switchInScore += sub_index
                    analysis += "<div class='bp-info switch-info'></div>" 
                    switchInScore += 300
                }
            // loses 1v1
            } else {
                analysis += `<div class='bp-info switch-info'>Loses 1v1</div>` 
                if (!matchup.isOhkod) {
                    switchInScore += sub_index / 100
                    switchInScore += Math.min(matchup.maxDmg / 10, currentHp)
                    analysis += `<div class='bp-info switch-info'>Deals ${Math.min(matchup.maxDmg, currentHp)}</div>` 
                } else {
                    analysis += `<div class='bp-info switch-info'>Is Ohko'd</div>` 
                }
            }

            if (switchInScore == 0) {
                switchInScore += sub_index / 100
            }

            if (pok_name.includes("-Mega")) {
                switchInScore -= 100000
            }

            // Set ace to last or second to last if mega
            if (pok_data["ai_tags"] && pok_data["ai_tags"].includes("Ace Pokemon") && (pok_data.sub_index == trainer_poks.length - 2))  {
                analysis += `<div class='bp-info switch-info'>Ace</div>` 
                switchInScore -= 50000
            }

            analysis += `<div class='bp-info switch-info switch-score'>${Math.round(switchInScore * 100) / 100 }</div>` 
        }
        ranked_trainer_poks.push([trainer_poks[i], switchInScore, matchup.move, sub_index, pok_data["moves"], analysis])
    }



    ranked_trainer_poks.sort(sort_subindex)


    
    console.log(ranked_trainer_poks)
    return ranked_trainer_poks
}

function simplifySwitchScores() {
    let scores = $('.switch-score')
    let rawScores = []

    scores.each(function() {
        let score = parseInt($(this).text())
        rawScores.push(score)
    })

    rawScores = rawScores.sort((a,b) => b - a)

    scores.each(function() {
        let score = parseInt($(this).text())
        let order = rawScores.indexOf(score)
        
        if (score < -50000) {
            $(this).text(`Mega Form`)
        } else if ((score < 0) ) {
            $(this).text(`Ace`)
        } else {
           $(this).text(`Post KO: ${order + 1}`) 
        }        
    })
}

// sort by switch in score, break ties on trainer order
function sort_trpoks(a, b) {
    if (a[1] === b[1]) {
        return (b[3] > a[3]) ? -1 : 1;
    }
    else {
        return (b[1] < a[1]) ? -1 : 1;
    }
}

function sort_subindex(a, b) {
    if (a[3] === b[3]) {
        return (parseInt(b[3]) < parseInt(a[3])) ? -1 : 1;
    }
    else {
        return (parseInt(b[3]) > parseInt(a[3])) ? -1 : 1;
    }
}

function handleTypeMatchupImmunityEI(matchup){
  if (matchup === 0) { return 0.1 }
  else {return matchup}
}

function getTypeMatchup(playerTypes, defenderTypes) {

    let attType1 = playerTypes[0];
    let attType2 = playerTypes[1] ?? attType1;
    let defType1 = defenderTypes[0];
    let defType2 = defenderTypes[1] ?? defType1;

    let att1_vs_def1 = handleTypeMatchupImmunityEI(typeChart[attType1][defType1]);
    let att1_vs_def2 = (defType1 === defType2) ? 1.0 : handleTypeMatchupImmunityEI(typeChart[attType1][defType2]);

    let att2_vs_def1;
    let att2_vs_def2;
    if (attType1 === attType2){
        att2_vs_def1 = att1_vs_def1;
        att2_vs_def2 = att1_vs_def2;
    } else {
        att2_vs_def1 = handleTypeMatchupImmunityEI(typeChart[attType2][defType1]);
        att2_vs_def2 = (defType1 === defType2) ? 1.0 : handleTypeMatchupImmunityEI(typeChart[attType2][defType2]);
    }
    return (att1_vs_def1 * att1_vs_def2) + (att2_vs_def1 * att2_vs_def2);
}