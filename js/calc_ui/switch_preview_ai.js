function canTrap(trapper, target) {
    if (target.types.includes("Ghost")) return false;

    if (trapper.ability == "Shadow Tag") {
        if (target.ability != "Shadow Tag") return true;
    }

    if (trapper.ability == "Magnet Pull" && target.types.includes("Steel")) return true;
    if (trapper.ability == "Arena Trap" && target.ability != "Levitate" && !target.types.includes("Flying")) return true;

    return false;
}

function adjustSpeed(speed, ability, weather, terrain, item) { 
    if (item == "Choice Scarf") {
        speed = speed * 1.5;
    }
    if (ability == "Chlorophyll" && weather == "Sun") {
        return speed * 2
    }
    if (ability == "Slush Rush" && weather == "Snow") {
        return speed * 2
    }
    if (ability == "Swift Swim" && weather == "Rain") {
        return speed * 2
    }
    if (ability == "Sand Rush" && weather == "Sand") {
        return speed * 2
    }
    if (ability == "Surge Surfer" && terrain == "Electric") {
        return speed * 2   
    }
    return speed
}


// Attacker is Player, Defender is AI
function postKoMatchupData(attackerVDefenderResults, defenderVAttackerResults) {
    disableKOChanceCalcs = true

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
    let attackerBestMove = "(None)"
    let isOhkod = false
    let wins1v1 = false
    let winsMidTurn1v1 = false
    let aiHasSE = false
    let adjustedSpeed = adjustSpeed(defender.rawStats.spe, defender.ability, defenderField.weather, defenderField.terrain, defender.item)


    let isFaster = adjustedSpeed >= p1RawSpeed
    let movesFirst = false

    let currentTrainerPok = $('.set-selector')[3].value.split(" (")[0]
    let isCurrent = currentTrainerPok == defender.name

    // These variables are also referenced by the battle console
    if (isCurrent) {
        bestDmgAgainstCurrent = 0
        bestPrioDmgAgainstCurrent = 0

        bestPrioMoveAgainstCurrent = ""
        bestMoveAgainstCurrent = ""
        bestMoveAgainstCurrentIndex = 0

        currentAiMoves = get_current_in().moves


        bestAiDmgAgainstCurrent = 0
        bestAiMoveAgainstCurrent = ""
        currentTypeMatchup = 2
    }


    // check player moves against AI pok
    for (moveIndex in attacker.moves) {
        let move = attacker.moves[moveIndex]




        damage = attackerVDefenderResults[moveIndex].damage



        if (damage.length == 16) {
            damage = damage.map(() => damage[8])


            if (isCurrent && damage[0] > bestDmgAgainstCurrent) {
                bestDmgAgainstCurrent = damage[0]
                bestMoveAgainstCurrent = move.name
                bestMoveAgainstCurrentIndex = moveIndex
            }
        }

        // count how many turns to kill including status/hazards and recovery items
        let koData = getKOChance(genInfo, attacker, defender, move, attackerField, damage, false)
        let turnsToKill = koData.n

        // 0 means too insignificant to matter
        if (turnsToKill == 0) {
            continue;
        }

        if (turnsToKill == 1 && defender.item != 'Focus Sash') {
            isOhkod = true
        }

        // AI sees itself at 90% hp when it has life orb
        if (turnsToKill == 2 && defender.item == "Life Orb" && damage[8] >= (defender.originalCurHP * 0.9)) {
            isOhkod = true
            turnsToKill = 1
        }

        if (turnsToKill < attackerFastestKill) {
            attackerFastestKill = turnsToKill
            attackerBestMove = move.name
            if (!move.priority) {
                attackerBestMoveHasPrio = false;
            }
        } 

        if (move.priority) {
            if (turnsToKill <= attackerFastestPrioKill) {
                attackerFastestPrioKill = turnsToKill;                 
                // attacker is marked as having prio since this is the fastest kill the move or tied with fastest
                if (turnsToKill <= attackerFastestKill) {
                    attackerBestMoveHasPrio = true;
                    if (isCurrent) {
                        if (damage[0] > bestPrioDmgAgainstCurrent) {
                            bestPrioDmgAgainstCurrent = damage[0]
                            bestPrioMoveAgainstCurrent = move.name
                        }
                    }
                }
            }
        }   
    }



    // AI can see it's own focus sash
    if (defender.item == 'Focus Sash' && attackerFastestKill > 0) {
        attackerFastestKill = Math.max(2, attackerFastestKill)
    }

    // Check ai moves against player pok
    for (moveIndex in defender.moves) {
        let move = defender.moves[moveIndex]


        if (movePPs[currentlyCalcingAgainst] && parseInt(movePPs[currentlyCalcingAgainst][moveIndex]) == 0) {
            continue;
        }
        damage = defenderVAttackerResults[moveIndex].damage

        if (move.category != "Status") {
           let effectiveness = typeChart[move.type][attacker.types[0]]

           if (attacker.types[1]) {
               effectiveness = effectiveness * typeChart[move.type][attacker.types[1]]
           }
           if (effectiveness > 1) {
               aiHasSE = true;
           }
        }

        if (damage.length == 16) {
            damage = damage.map(() => damage[8])

            if (isCurrent && damage[0] > bestAiDmgAgainstCurrent) {
                bestAiDmgAgainstCurrent = damage[0]
                bestAiMoveAgainstCurrent = move.name
            }
        }



        if (damage[0] > highestDmgDealt) {
            highestDmgDealt = damage[0]
        }

        // TODO: AI doesn't see status on player, or weather damage effects
        // count how many turns to kill including status/hazards and recovery items
        let koData = getKOChance(genInfo, defender, attacker, move, defenderField, damage, false)
        let turnsToKill = koData.n

        if (defender.name == "Greninja") {
            console.log("here")
        }


        // 0 means too insignificant to matter
        if (turnsToKill == 0) {
            continue;
        }

        // OHKO means revenge killer
        if (turnsToKill == 1) {
            isRevenge = true

            if (move.priority) {
                defenderBestMoveHasPrio = true
                // prio move that kills should always be best move
                bestMove = move.name
            }
        }

        // 2hko means threatener
        if (turnsToKill == 2) {
            isThreaten = true

            if (move.priority && defenderFastestKill >= 2) {
                defenderBestMoveHasPrio = true
            }
        }

        if (turnsToKill <  defenderFastestKill) {
            defenderFastestKill = turnsToKill

            if (move.priority) {
                defenderBestMoveHasPrio = true
            } else {
                defenderBestMoveHasPrio = false;
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
                if (turnsToKill < attackerFastestKill) {
                    winsMidTurn1v1 = true
                }       
            // slower and using priority
            } else {
                // compare turns to kill with player fastest non prio kill and prio kill
                if (turnsToKill <= attackerFastestKill && turnsToKill < attackerFastestPrioKill) {
                    wins1v1 = true
                }
                if (turnsToKill < attackerFastestKill && turnsToKill < attackerFastestPrioKill - 1) {
                    winsMidTurn1v1 = true
                }
            }
        } else {
            // faster without priority
            if (isFaster) {
                // compare turns to kill with player fastest non prio kill and prio kill
                if (turnsToKill <= attackerFastestKill && turnsToKill < attackerFastestPrioKill) {
                    wins1v1 = true
                }

                if (turnsToKill < attackerFastestKill && turnsToKill < attackerFastestPrioKill - 1) {
                    winsMidTurn1v1 = true
                }
            // slower and non priority
            } else {
                // compare turns to kill with player fastest non prio kill and prio kill
                if (turnsToKill < attackerFastestKill && turnsToKill < attackerFastestPrioKill) {
                    wins1v1 = true
                }
                if (turnsToKill < attackerFastestKill - 1 && turnsToKill < attackerFastestPrioKill - 1) {
                    winsMidTurn1v1 = true
                }
            }
        }
    }


   
    if (defenderBestMoveHasPrio && !attackerBestMoveHasPrio) {
        movesFirst = true
    } else if ( (defenderBestMoveHasPrio && attackerBestMoveHasPrio) || (!defenderBestMoveHasPrio && !attackerBestMoveHasPrio)) {
        movesFirst = isFaster
    }



    let debug = {defenderBestMoveHasPrio: defenderBestMoveHasPrio, attackerBestMoveHasPrio: attackerBestMoveHasPrio, attackerFastestKill: attackerFastestKill, defenderFastestKill: defenderFastestKill, attackerFastestPrioKill: attackerFastestPrioKill, isFaster: isFaster, movesFirst: movesFirst, winsMidTurn1v1: winsMidTurn1v1}
    
    // console.log(debug)
    // console.log(`${defender.name} using ${bestMove} kills in ${defenderFastestKill}`)
    // console.log(`${attacker.name} kills in ${attackerFastestKill}`)
    // console.log(`${defender.name} faster: ${isFaster}, movesFirst: ${movesFirst}, winsMidTurn1v1: ${winsMidTurn1v1}`)       

    




    let matchupData = {aiHasSE: aiHasSE, defenderBestMoveHasPrio: defenderBestMoveHasPrio, attackerBestMoveHasPrio: attackerBestMoveHasPrio, wins1v1: wins1v1, isFaster: movesFirst, isRevenge: isRevenge, isThreaten: isThreaten, maxDmg: highestDmgDealt, move: bestMove, attackerBestMove: attackerBestMove, isTrapper: isTrapper, isOhkod: isOhkod, winsMidTurn1v1: winsMidTurn1v1, attackerFastestKill: attackerFastestKill, defenderFastestKill: defenderFastestKill}

    disableKOChanceCalcs = false
    matchupCache.set(currentKey, matchupData)

    return matchupData
}

function isBadOdds(p1, p2) {
    let aiHpThreshold =  parseInt(p2.ability == "Regenerator" ? p2.stats.hp / 2 : p2.stats.hp / 4)
    let playerHpThreshold = Math.min( parseInt(p1.stats.hp / 2), p1.originalCurHP)
    
    // TODO: account for player prio
    let aiIsFaster = false

    const prioMoveKills = bestPrioMoveAgainstCurrent != "" && bestPrioDmgAgainstCurrent >= p2.originalCurHP

    let badOddsDmg = 0;

    
    // If prio move kills, check priority speed brackets, and only check against the prio move dmg
    if (prioMoveKills) {
        if (moves[bestAiMoveAgainstCurrent].priority == '1') {
            aiIsFaster = p2.rawStats.spe >= p1.rawStats.spe
        } else {
            aiIsFaster = false
        }
        badOddsDmg = bestPrioDmgAgainstCurrent
    } else {
        if (bestMoveAgainstCurrent == "") {
            aiIsFaster = p2.rawStats.spe >= p1.rawStats.spe
        } else if (bestMoveAgainstCurrent) {
            aiIsFaster = p2.rawStats.spe >= p1.rawStats.spe || (bestAiMoveAgainstCurrent != "" && moves[bestAiMoveAgainstCurrent].priority == '1')
        }        
        // AI must have greater than 50% hp or 25% with regenerator
        if (p2.originalCurHP < aiHpThreshold) {
            return [false, "low HP"]
        } 
        badOddsDmg = bestDmgAgainstCurrent   
    }
    

    // console.log(p2)
    // console.log(`${aiIsFaster} faster, ${bestDmgAgainstCurrent} dmg vs ${p2.originalCurHP}`)

    // If Player threatens fast ohko
    if (badOddsDmg >= p2.originalCurHP && !aiIsFaster) {
        return [true, "F-Ohko"];
    // If Player threatens slow ohko
    } else if (badOddsDmg >= p2.originalCurHP && aiIsFaster) {
        // Check if ai can do more than 50% or ko player
        if (bestAiDmgAgainstCurrent < playerHpThreshold) {
            return [true, "S-Ohko"]
        } else {
            return [false, "Ai Chunks"]
        }
    // If bad type matchup
    } else if (currentTypeMatchup > 2) {       
        for (let move of p2.moves) {
            let cat = move.category
            if (cat == "status") continue;
            let effectiveness = typeChart[move.type][p1.types[0]]
            if (p1.types[1]) {
                effectiveness = effectiveness * typeChart[move.type][p1.types[1]]
            }

            // Check for super effective moves
            if (effectiveness > 1) {
                return [false, "AI SE"];
            }
        }
        return [true, "Bad MU"]
    }

    return [false, ""];
}

const unseenAbilities = ["Bull Rush", "Illusion", "Slow Start", "Quill Rush","Bull Rush", "Dauntless Shield", "Intrepid Sword", "Download", "Orichalcum Pulse", "Hadron Engine", "Electric Surge", "Grassy Surge", "Psychic Surge", "Seed Sower", "Misty Surge", "Desolate Land", "Primordial Sea", "Delta Stream"]

const defaultOffAbilities = ['Flash Fire','Minus', 'Plus','Unburden','Stakeout'];

function deepMemoize(fn) {
  resultsCache = new Map();
  matchupCache = new Map();

  return function(...args) {
    currentKey = hashPokemonPair([compressPlayerPok(args[1]), compressTrainerPok(args[3])])
    if (resultsCache.has(currentKey)) {
      return resultsCache.get(currentKey);
    }
    const result = fn(...args);
    resultsCache.set(currentKey, result);
    return result;
  };
}

function compressPlayerPok(pok) {
    return {
        't': pok.types,
        'l': pok.level,
        'a': pok.ability,
        's': pok.name,
        'ao': pok.abilityOn,
        'i': pok.item,
        'n': pok.nature,
        'iv': pok.ivs,
        'ev': pok.evs,
        'b': pok.boosts,
        'ss': pok.stats,
        'h': pok.originalCurHP,
        'st': pok.status,
        'm0': pok.moves[0].name,
        'm1': pok.moves[1].name,
        'm2': pok.moves[2].name,
        'm3': pok.moves[3].name
    }
}

// compress to only the fields that can change when a trainer pok is not loaded
function compressTrainerPok(pok) {
    return {
        'l': pok.level,
        'a': pok.ability,
        's': pok.name,
        'm0': pok.moves[0].name,
        'm1': pok.moves[1].name,
        'm2': pok.moves[2].name,
        'm3': pok.moves[3].name
    }
}




function get_next_in() {  
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return
    }
    lvlCap = parseInt($('#lvl-cap').val())

    var trainer_poks = [...CURRENT_TRAINER_POKS]
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
    p1Name = p1.name

    if (p1.ability == "Intimidate") {
        p1.ability = "Run Away"
    }

    var currentp2 = createPokemon(p2info)


    p1RawSpeed = parseInt($('#p1 .totalMod').text())

    var p1field = createField();


    var p2field = p1field.clone().swap();


    ranked_trainer_poks = []

    let player_results_list = []
    let ai_results_list = []

    for (let subIndex in trainer_poks) {
        analysis = ""

        p2 = createPokemon(trainer_poks[subIndex].slice(0,-3))
        
        currentlyCalcingAgainst = trainer_poks[subIndex].slice(0,-3)

        let isCurrent = currentp2.name == p2.name



        // Remove intimidate unless you're calcing against the current in pokemon and intimidate is on
        // TODO: fix so that if current player mon has been intimidated, it needs to apply the dmg reduction to dmg done to all ai trainer pokemon
        if (p2.ability == "Intimidate" && !(isCurrent && $('#p2 .abilityToggle').is(':checked'))) {
            p2.ability = "Run Away"
        }
        else if (unseenAbilities.includes(p2.ability)) {
            p2.ability = "Run Away"
        } else if (defaultOffAbilities.includes(p2.ability)) {
            p2.abilityOn = false;
        }

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


        if (localStorage.switchInfo == '1') {
            calcingForSwitchIns = true
            p1Name = p1.name

            // const start = performance.now();
            
            // for (let i=0; i<10;i++) {
            //     memoizedCalc(damageGen, p1, p1field, p2, p2field);
            //     // calculateAllMoves(damageGen, p1, p1field, p2, p2field);
            // }
            let all_results = memoizedCalc(damageGen, p1, p1field, p2, p2field);
            // let all_results = calculateAllMoves(damageGen, p1, p1field, p2, p2field);
            // const end = performance.now();
            // console.log(`Calculate All Moves vs ${p2.name} Execution time: ${end - start} ms`);
            calcingForSwitchIns = false
            
            player_results = all_results[0]
            results = all_results[1]

            player_results_list.push(player_results)
            ai_results_list.push(results)
        } else {
            p1name = p1.name
        }
       

        let pok_name = trainer_poks[subIndex].split(" (")[0]
        let tr_name = trainer_poks[subIndex].split(" (")[1].replace(")", "").split("[")[0]
        let pok_data = SETDEX_BW[pok_name][tr_name]

        let sub_index = parseInt(trainer_poks[subIndex].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""))
        let types = pokedex[pok_name].types
        let type_matchup = getTypeMatchup([player_type1, player_type2], types)

        let switchInScore = 0



        matchup = {}
        if (localStorage.switchInfo == '1') analysis += "<div class='ai-infos'>"   
        analysis += `<div class='bp-info switch-info mu-info'>Type MU: ${type_matchup}</div>` 

        if (isCurrent) {
            currentTypeMatchup = type_matchup
        }

        if (localStorage.switchInfo == '1') {
            // const s = performance.now();

            // if (matchupCache.has(currentKey)) {
            //     matchup = matchupCache.get(currentKey)
            // } else {
            // console.log(i)
            // console.log(trainer_poks)
            // console.log(trainer_poks[subIndex]) 
            matchup = postKoMatchupData(player_results, results)
            // console.log(trainer_poks) 
            // console.log(trainer_poks[subIndex]) 

            if (!trainer_poks[subIndex]) {
                console.log("wtf")
            }
            // }        
            // const e = performance.now();
            // console.log(`PostKoMatchupData vs ${p2.name} Execution time: ${e - s} ms`); 
            matchup["type_matchup"] = type_matchup

            matchup.move = matchup.move.replace("Hidden Power", "HP")
            matchup.attackerBestMove = matchup.attackerBestMove.replace("Hidden Power", "HP")

            
      
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
                    analysis += `<div class='bp-info switch-info'>Fast Ohko ${matchup.move}</div>`
                // slow ohko
                } else if (matchup.isRevenge && !matchup.isFaster) {
                    switchInScore += sub_index
                    switchInScore += 9500
                    analysis += `<div class='bp-info switch-info'>Slow Ohko ${matchup.move}</div>` 
                // fast 2hko
                } else if (matchup.isThreaten && matchup.isFaster && !matchup.move.includes("Explosion") && !matchup.move != "Self-Destruct") {
                    switchInScore += sub_index
                    switchInScore += 9000 
                    analysis += `<div class='bp-info switch-info'>Fast 2Hko ${matchup.move}</div>` 
                // slow 2hko
                } else if (matchup.isThreaten && matchup.isFaster && !matchup.move.includes("Explosion") && !matchup.move != "Self-Destruct") {
                    switchInScore += sub_index
                    switchInScore += 8500
                    analysis += `<div class='bp-info switch-info'>Slow 2Hko ${matchup.move}</div>` 
                // good matchup
                } else if (type_matchup < 2) {
                    // analysis += "<div class='bp-info switch-info'>Good MU</div>" 
                    analysis += `<div class='bp-info switch-info'>${matchup.isFaster ? "Fast" : "Slow"} ${matchup.defenderFastestKill}Hko ${matchup.move}</div>` 
                    switchInScore += 4000 * (2 - type_matchup)
                // wins 1v1
                } else {
                    switchInScore += sub_index
                    analysis += `<div class='bp-info switch-info'>${matchup.isFaster ? "Fast" : "Slow"} ${matchup.defenderFastestKill}Hko ${matchup.move}</div>` 
                    switchInScore += 300
                }
            // loses 1v1
            } else {
                analysis += `<div class='bp-info switch-info'>Loses 1v1</div>` 
                if (!matchup.isOhkod) {
                    switchInScore += sub_index / 100
                    switchInScore += Math.min(matchup.maxDmg / 10, currentHp)
                    analysis += `<div class='bp-info switch-info'>Deals ${Math.min(matchup.maxDmg, currentHp)} ${matchup.move}</div>` 
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

        
            let midTurnScore = 0

            if (matchup.winsMidTurn1v1) {
                // analysis += `<div class='bp-info switch-info'>Can Switch</div>` 
                if (matchup.isTrapper) {
                    midTurnScore += 20000
                } 
                else if (type_matchup < 2) {
                    midTurnScore += 4000 * (2 - type_matchup)
                    midTurnScore -= sub_index

                    
                    if (matchup.aiHasSE) {
                        midTurnScore += 8000
                    }
                } 
                else if (matchup.attackerFastestKill > 3) {
                    midTurnScore += 300
                    midTurnScore += sub_index
                    analysis += `<div class='bp-info switch-info'>Walls You</div>` 
                }
                else {
                    midTurnScore += sub_index
                }
                analysis += `</div><div class="switch-infos"><div class='bp-info switch-info mt-switch-score'>${Math.round(midTurnScore * 100) / 100 }</div>` 
            } else {
                analysis += `</div><div class="switch-infos"><div class='bp-info switch-info mt-switch-score loses'>-1000</div>` 
                analysis += `<div class='bp-info switch-info mt-switch-move loses'>${matchup.attackerBestMove}</div>`         
            }

            analysis += `<div class='bp-info switch-info switch-score'>${Math.round(switchInScore * 100) / 100 }</div></div>` 

        }

        ranked_trainer_poks.push([trainer_poks[subIndex], switchInScore, matchup.move, sub_index, pok_data["moves"], analysis, matchup])
    }

    
    $('.bad-odds').hide()

    if (localStorage.switchInfo == '1') {
        let badOdds = isBadOdds(p1, currentp2)

        if (badOdds[0]) {
            $('.bad-odds').show()
            $('.bad-odds').text(`Bad Odds: ${badOdds[1]}`)
        }
       
    }



    ranked_trainer_poks.sort(sort_subindex)


    console.log(ranked_trainer_poks)
    
    return ranked_trainer_poks
}

function simplifySwitchScores() {
    let scores = $('.switch-score')
    let rawScores = []

    scores.each(function() {
        let score = parseFloat($(this).text())
        rawScores.push(score)
    })

    rawScores = rawScores.sort((a,b) => b - a)

    scores.each(function() {
        let score = parseFloat($(this).text())
        let order = rawScores.indexOf(score)
        
        if (score < -50000) {
            $(this).text(`Mega Form`)
        } else if ((score < 0) ) {
            $(this).text(`Ace`)
        } else {
           $(this).text(`Post KO Prio: ${order + 1}`) 
        }        
    })

    // mid turn
    scores = $('.mt-switch-score')
    rawScores = []

    scores.each(function() {
        let score = parseFloat($(this).text())
        rawScores.push(score)
    })

    rawScores = rawScores.sort((a,b) => b - a)

    scores.each(function() {
        let score = parseFloat($(this).text())
        let order = rawScores.indexOf(score)


        if (score < 0) {
            $(this).text("Loses 1v1 after")
        } else {
            $(this).text(`Mid Turn Prio: ${order + 1}`)   
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
    return parseFloat(((att1_vs_def1 * att1_vs_def2) + (att2_vs_def1 * att2_vs_def2)).toFixed(2));
}