unviableMoves = ['Future Sight', 'Focus Punch', 'Explosion', 'Misty Explosion']


// Attacker is Player, Defender is AI
function consoleMatchupData(attackerVDefenderResults, defenderVAttackerResults, dmgBoost=1, aiCrits=false, hitBy=false) {
    disableKOChanceCalcs = true

    let attacker = defenderVAttackerResults[0].defender
    let defender = defenderVAttackerResults[0].attacker



    defender.originalCurHP = defender.originalCurHP / dmgBoost

    attacker.moves = attacker.getDamagingMovePool()

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
    let highestDmgDealt = 0
    let bestMove = "(None)"
    let attackerBestMove = "(None)"
    let isOhkod = false
    let wins1v1 = false
    let winsMidTurn1v1 = false
    let adjustedSpeed = adjustSpeed(defender.rawStats.spe, defender.ability, defenderField.weather, defenderField.terrain, defender.item)

    let isFaster = adjustedSpeed >= attacker.rawStats.spe
    let movesFirst = false

    // check player moves against AI pok
    for (moveIndex in attacker.moves) {
        let move = attacker.moves[moveIndex]

        // skip unviable or inaccurate moves
        if (move.name == "(No Move)" || unviableMoves.includes(move.name) || backup_moves[move.name].acc < 90) continue;
        
        damage = attackerVDefenderResults[moveIndex].damage

        if (damage.length == 16) {
            damage = damage.map(() => damage[0])
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
                }
            }
        }   
    }




    // AI can see it's own focus sash
    if (defender.item == 'Focus Sash' && attackerFastestKill > 0) {
        attackerFastestKill = Math.max(2, attackerFastestKill)
    }

    // Check ai moves against player pok

    if (hitBy) {
        const hitByIndex = currentAiMoves.indexOf(hitBy)

        if (defenderVAttackerResults[hitByIndex].damage[15]) {
            attacker.originalCurHP = Math.max(1, attacker.originalCurHP - defenderVAttackerResults[hitByIndex].damage[15])
            // console.log(`${attacker.name} new hp: ${attacker.originalCurHP} after ${hitBy} does ${defenderVAttackerResults[hitByIndex].damage[15]} damage`)
        }    
    }

    let remainingAttackerHP = attacker.originalCurHP

    for (moveIndex in defender.moves) {
        let move = defender.moves[moveIndex]
        if (move.name == "(No Move)") continue;




        damage = defenderVAttackerResults[moveIndex].damage

        if (damage.length == 16) {
            damage = damage.map(() => damage[15])

            if (aiCrits) {
                damage = damage.map(() => damage[15] * 1.5)
            }
        } else if (!damage[15] && move.category != "Status") {
            immunities[move.name] ||= []
            immunities[move.name].push(attacker.name)
        }

        if (damage[0] > highestDmgDealt) {
            highestDmgDealt = damage[0]
        }

        // TODO: AI doesn't see status on player, or weather damage effects
        // count how many turns to kill including status/hazards and recovery items
        let koData = getKOChance(genInfo, defender, attacker, move, defenderField, damage, false)
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

    if (isFaster) {
        remainingAttackerHP -= highestDmgDealt * (attackerFastestKill)
    } else {
        remainingAttackerHP -= highestDmgDealt * (attackerFastestKill - 1)
    }

    remainingAttackerHP = parseInt(remainingAttackerHP / attacker.rawStats.hp * 100)

    let matchupData = {defenderBestMoveHasPrio: defenderBestMoveHasPrio, attackerBestMoveHasPrio: attackerBestMoveHasPrio, wins1v1: wins1v1, isFaster: movesFirst, isRevenge: isRevenge, isThreaten: isThreaten, maxDmg: highestDmgDealt, move: bestMove, attackerBestMove: attackerBestMove, isOhkod: isOhkod, winsMidTurn1v1: winsMidTurn1v1, attackerFastestKill: attackerFastestKill, defenderFastestKill: defenderFastestKill, remainingAttackerHP: remainingAttackerHP}

    disableKOChanceCalcs = false

    return matchupData
}

function consoleBoxRolls(chosenMove=null, dealtMinRoll=false, takenMaxRoll=false, AiCrit=false, times=1, fast=false, dmgBoost=1, showBait=false, appliedMove=false) {
    var box = get_box()


    // Set rolls to search for to impossible numbers if not specified
    if (!dealtMinRoll) {
        dealt_min_roll=10000000
    } else {
        dealt_min_roll = dealtMinRoll
    }
    if (!takenMaxRoll) {
        taken_max_roll=-100000
    } else {
        taken_max_roll = takenMaxRoll
    }

    // if accounting for crits against player, reduce search threshold by 2/3rds
    if (AiCrit) {
        taken_max_roll = taken_max_roll * (2/3)
    }
    // If number of hits is specified, divide threshold by number of hits
    if (times > 1) {
        taken_max_roll = taken_max_roll / times
    }

    // if dmg boost against ai is specified, reduce search threshold
    if (dmgBoost > 1) {
        dealt_min_roll = dealt_min_roll / dmgBoost
    }

    // clear box of filters
    $('.killer').removeClass('killer')
    $('.defender').removeClass('defender')
    $('.faster').removeClass('faster')
    $('.baiter').removeClass('baiter')



    var p1field = createField();
    var p2field = p1field.clone().swap();

    var p1info = $("#p2");
    var p1 = createPokemon(p1info);
    var p1hp = p1info.find('#currentHpL1').val()
    var p1speed = parseInt($('.total.totalMod')[1].innerHTML)

    if (p1.ability == "Intimidate") {
        p1.ability = "Minus"
    }

    var killers = {}
    var defenders = {}
    var faster = {}
    var baiters = {}

    var tableOutput = []

    for (m = 0; m < box.length; m++) {
        if (p1.level < 1) {
            break;
        }
        var isBaiter = false;
        var mon = createPokemon(box[m])
        var monSpeed = mon.rawStats.spe

        if (mon.ability == "Intimidate") {
            mon.ability = "Minus"
        }



        if (monSpeed > p1speed) {
            if (fast) {
                // faster[box[m]] = 1
                // $(`.trainer-pok[data-id='${box[m]}']`).addClass('faster')
            }     
        } else {
            if (fast) {
                continue;
            }
        }

        var monHp = mon.originalCurHP
        var selected_move_index = $('#filter-move option:selected').index()

        if (!p1.name) {
            return {"killers": killers, "defenders": defenders, "faster": faster, "baiters": baiters}  
        }
        
        var all_results = memoizedCalc(damageGen, p1, p1field, mon, p2field, false);
        var opposing_results = all_results[0]
        var player_results = all_results[1]

        if (dealtMinRoll) {
            player_results = calculateLeftMoves(damageGen, mon, p1field, p1, p2field)[0];
        }

        var defend_count = 0

        var aiKillingMoves = []
        var aiMinRollKillingMoves = []
        var aiKillingMovesWithSecondaries = []
        

        var aiMostDmgMoves = []
        var aiMostDmgMovesWithSecondaries = []

        let fastestKill = 1000
        let chosenMoveDmg = 0
        let highestMaxRoll = 0
        let highestMinRoll = 0
        let baitedMoves = []



        for (j = 0; j < 4; j++) {            
            let opposing_dmg = opposing_results[j].damage
            let move_name = opposing_results[j].move.originalName
            let min_roll = opposing_dmg[0]


            let appliedDmg = applyDamageRollToDefender(opposing_results[j].move, p1, mon, p1field).damage[15]



            let turns = getTurnsToKill(opposing_dmg, monHp)

            if (mon.name == "Barraskewda") {
                console.log(move_name)
            }

            if (turns < fastestKill) {
                fastestKill = turns
                aiMostDmgMoves = [move_name]
                highestMinRoll = opposing_dmg[0] 
                highestMaxRoll = opposing_dmg[opposing_dmg.length - 1] 
                if (moves[move_name].secondaries) {
                    aiMostDmgMovesWithSecondaries = [move_name]
                } else {
                    aiMostDmgMovesWithSecondaries = []
                }
            // If this moves kills in same number of turns as the current strongest move
            } else if (turns == fastestKill) {
                if (min_roll > highestMinRoll) {
                    highestMinRoll = min_roll;
                }

                // set this move as strongest every roll does more than previous highest max roll
                if (opposing_dmg[0] > highestMaxRoll) {
                    aiMostDmgMoves = [move_name]       
                } else {
                    aiMostDmgMoves.push(move_name)
                }
                if (moves[move_name].secondaries) {
                    aiMostDmgMovesWithSecondaries.push(move_name)
                }           
            }

            if (move_name == chosenMove) {
                chosenMoveDmg = opposing_dmg
            } 

            if (takenMaxRoll || showBait) {
                let isKill = can_topkill(opposing_dmg, monHp * taken_max_roll / 100)
                if (!isKill && (move_name == chosenMove)) {
                   
                    if (!showBait) {
                        defenders[box[m]] = 1
                        $(`.trainer-pok[data-id='${box[m]}']`).addClass('defender')
                    }
                    
                } else if (isKill) {
                    aiKillingMoves.push(move_name)
                    if (opposing_dmg[0] > monHp) {
                        aiMinRollKillingMoves.push(move_name)
                    }
                    if (moves[move_name].secondaries) {
                        aiKillingMovesWithSecondaries.push(move_name)
                    }
                }
            }    
        }


        if (showBait) {
            if (aiKillingMoves.length == 1 && aiKillingMoves[0] == chosenMove) {
                isBaiter = true;
                console.log(`${aiKillingMoves[0]} is only killing move ${mon.name}`)
            } else if (aiKillingMoves.length > 1 && aiKillingMoves.includes(chosenMove)) {
                if (aiMinRollKillingMoves.length == 1 && aiMinRollKillingMoves[0] == chosenMove) {
                    isBaiter = true
                    console.log(`${aiKillingMoves[0]} is only killing move where min roll kills ${mon.name}`)
                }  
                if (aiKillingMovesWithSecondaries.length == 1 && aiKillingMovesWithSecondaries[0] == chosenMove) {
                    isBaiter = true
                    console.log(`${aiKillingMoves[0]} is only killing with secondary effect ${mon.name}`)
                }   
            }

            if (aiMostDmgMoves.length == 1 && aiMostDmgMoves[0] == chosenMove && typeof aiMostDmgMoves[0] != "undefined") {
                isBaiter = true;
                console.log(`${aiKillingMoves[0]} kills fastest ${mon.name}`)
            } 
            else if (aiMostDmgMovesWithSecondaries.length == 1 && aiMostDmgMovesWithSecondaries[0] == chosenMove) {
                isBaiter = true;
                console.log(`${aiKillingMoves[0]} is only fastest killing move with secondaries ${mon.name}`)
            }

            if (isBaiter) {
                baiters[box[m]] = 1
                $(`.trainer-pok[data-id='${box[m]}']`).addClass('defender')
            }
        }


        if (dealtMinRoll) {
            var moveList = []
            for (j = 0; j < player_results.length; j++) {
                player_dmg = player_results[j].damage

                if (can_kill(player_dmg, p1hp * dealt_min_roll / 100)) {
                    if (!unviableMoves.includes(player_results[j].move.originalName)) {
                       moveList.push(player_results[j].move.originalName) 
                    }
                    
                    killers[box[m]] = 1
                    $(`.trainer-pok[data-id='${box[m]}']`).addClass('killer')
                } 
            }

            if (moveList.length > 0) {
                term.echo(`${purple(mon.name)}: ${moveList.map(m => teal(m)).join(" | ")}`)
            }


        }


    }
    monHighlights = {"killers": killers, "defenders": defenders, "faster": faster, "baiters": baiters} 
    return monHighlights
}


function applyDamageRollToDefender(move, attacker, defender, p1field) {
    return calc.calculate(gen, attacker, defender, move, p1field)
}

function printAsciiTable(term, data, headerColors=["teal"], rowColors=["purple"]) {
  if (!Array.isArray(data) || data.length === 0) {
    term.echo('Empty table.');
    return;
  }

  const colCount = Math.max(...data.map(row => row.length));

  // Normalize rows (fill missing cells with empty strings)
  const normalized = data.map(row => {
    const newRow = [];
    for (let i = 0; i < colCount; i++) {
      const val = row[i];
      newRow.push(val == null ? '' : val.toString());
    }
    return newRow;
  });

  // Compute column widths based on all normalized rows
  const colWidths = [];
  for (let c = 0; c < colCount; c++) {
    let maxLen = 0;
    for (let r = 0; r < normalized.length; r++) {
      const cell = normalized[r][c];
      if (cell.length > maxLen) maxLen = cell.length;
    }
    colWidths[c] = maxLen + 2; // padding
  }

  const border = '+' + colWidths.map(w => '-'.repeat(w)).join('+') + '+';

  const formatRow = (row, colors) => {
    return (
      '|' +
      row
        .map((cell, i) => {
          const padded = ' ' + cell.padEnd(colWidths[i] - 1, ' ');
          
          color = colors[i] || colors[0]

          if (color === 'teal') return teal(padded);
          if (color === 'purple') return purple(padded);
          if (color === 'hpColor') return hpColor(padded)
          return padded;
        })
        .join('|') +
      '|'
    );
  };

  const lines = [border];
  lines.push(formatRow(normalized[0], headerColors)); // header in teal
  lines.push(border);
  for (let i = 1; i < normalized.length; i++) {
    lines.push(formatRow(normalized[i], rowColors)); // rows in purple
  }
  lines.push(border);

  term.echo(lines.join('\n'));
}

function sortByRemainingHP(a, b) {
    if (a[2] === b[2]) {
        return (b[0] > a[0]) ? -1 : 1;
    }
    else {
        return (b[2] < a[2]) ? -1 : 1;
    }
}



