$(document).ready(function() {
    $('#toggle-console').click(function() {
        if ($('.terminal:visible').length == 0) {
            
            if (!terminalStarted) {
               $(initConsole) 
            }
            
            $('.notes-text').hide()
            $('.battle-console').show()
            $(this).text("Battle Console")
        } else {
            $('.notes-text').show()
            $('.battle-console').hide()
            $(this).text("Battle Notes")
        }
    })

})

function initConsole() {
	noEcho = false;
    terminalStarted = true;
	term = $('.battle-console').terminal({
      help: function(value) {
          window.open('https://github.com/hzla/Dynamic-Calc/wiki/Battle-Console', '_blank');
      },
      // clear all highlights
      reset: function() {
          var poks = $('#p1').find(".trainer-pok")
            poks.removeClass('defender')
            poks.removeClass('killer')
            poks.removeClass('faster')
      },
      // show mons that live all rolls of specified move or current most dmg move of current pokemon
      // matches first move that contains search string ignoring capitalization
      // first argument can be an integer which determines how many times the move will hit
      lives: function(...args) {
      	let times = getTimesHitFromArgs(args)

        move = getMoveFromArgs(args)

      	this.echo(`Lives ${times > 1 ? times + " " : ""}${move} from ${localStorage.right.split("(")[0]}`)
      	consoleBoxRolls(move, false, takenMaxRoll=100, crit=false, times)
      },
      // same as above but with crit damage
      livescrit: function(...args) {
          let times = getTimesHitFromArgs(args)

          move = getMoveFromArgs(args)

          this.echo(`Lives ${times ? times + " " : ""}crit ${move} from ${localStorage.right.split("(")[0]}`)
          consoleBoxRolls(move, false, takenMaxRoll=100, crit=true, times)
      },
      // highlights any mon that can ohko current ai pok with any move from it's level up and tm learnset, first argument is an optional dmg boost
      ohko: function(...args) {
          const dmgBoost = args[0] || 1

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for OHKO${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`)
          consoleBoxRolls(chosenMove=null, dealtMinRoll=100, false, false, 1, fast=false, dmgBoost)
      },
      // same as above but also must be faster
      fohko: function(...args) {
          const dmgBoost = args[0] || 1

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for fast OHKO${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`)
          consoleBoxRolls(chosenMove=null, dealtMinRoll=100, false, false, 1, fast=true, dmgBoost)
      },
      // highlights any mon that does the specified amount of damage ai pok with any move from it's level up and tm learnset, 
      // first argument is min roll
      // second argument is an optional dmg boost
      does: function(...args) {
          const dmgBoost = args[1] || 1
          const minRoll = args[0]

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for mons that do at least ${minRoll}%${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`)
          consoleBoxRolls(chosenMove=null, minRoll, false, false, 1, fast=false, dmgBoost)
      },
      fdoes: function(...args) {
          const dmgBoost = args[1] || 1
          const minRoll = args[0]

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for faster mons that do at least ${minRoll}%${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`)
          consoleBoxRolls(chosenMove=null, minRoll, false, false, 1, fast=true, dmgBoost)
      },
      baits: function(...args) {
          move = getMoveFromArgs(args)
          currentAiMoves = get_current_in().moves

          this.echo(`Baits ${move} from ${localStorage.right.split("(")[0]}`)
          consoleBoxRolls(move, dealtMinRoll=false, takenMaxRoll=100, crit=false, times=1, fast=false, dmgBoost=1, showBait=true)
      }
   }, {
        greetings: "Welcome to the battle console!\nType 'help' for available commands.\nType 'clear' to clear console",
	    checkArity: false
    });
}


function getTimesHitFromArgs(args) {
    let times = 1
    if (parseInt(args[0])) {
        times = parseInt(args[0])
    }
    return times
}

function getMoveFromArgs(args) {
    if (parseInt(args[0])) {
        args = args.slice(1)
    }

    let searchStr = args.join(" ")
    if (searchStr == "" || args == []) {
        searchStr = bestAiMoveAgainstCurrent
    }

	for (let move of currentAiMoves) {
		if (move.toLowerCase().includes(searchStr.toLowerCase())) {
			
            return move
		}
	}
}

//p1 is AI, mon is player
function consoleBoxRolls(chosenMove=null, dealtMinRoll=false, takenMaxRoll=false, AiCrit=false, times=1, fast=false, dmgBoost=1, showBait=false) {
    var box = get_box()

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
    if (AiCrit) {
        taken_max_roll = taken_max_roll * (2/3)
    }
    if (times > 1) {
        taken_max_roll = taken_max_roll / times
    }

    if (dmgBoost > 1) {
        dealt_min_roll = dealt_min_roll / dmgBoost
    }

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

        for (j = 0; j < 4; j++) {            
            let opposing_dmg = opposing_results[j].damage
            let move_name = opposing_results[j].move.originalName
            let min_roll = opposing_dmg[0]


            let turns = getTurnsToKill(opposing_dmg, monHp)

            if (turns < fastestKill) {
                fastestKill = turns
                aiMostDmgMoves = [move_name]
                highestMinRoll = opposing_dmg[0]
                if (moves[move_name].secondaries) {
                    aiMostDmgMovesWithSecondaries = [move_name]
                } else {
                    aiMostDmgMovesWithSecondaries = []
                }
            } else if (turns == fastestKill) {
                if (min_roll > highestMinRoll) {
                    highestMinRoll = min_roll;
                }

                if (opposing_dmg[opposing_dmg.length - 1] > highestMinRoll) {
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
                console.log(`${aiKillingMoves[0]} is only killing move`)
            } else if (aiKillingMoves.length > 1 && aiKillingMoves.includes(chosenMove)) {
                if (aiMinRollKillingMoves.length == 1 && aiMinRollKillingMoves[0] == chosenMove) {
                    isBaiter = true
                    console.log(`${aiKillingMoves[0]} is only killing move where min roll kills`)
                }  
                if (aiKillingMovesWithSecondaries.length == 1 && aiKillingMovesWithSecondaries[0] == chosenMove) {
                    isBaiter = true
                    console.log(`${aiKillingMoves[0]} is only killing with secondary effect`)
                }   
            }

            if (aiMostDmgMoves.length == 1 && aiMostDmgMoves[0] == chosenMove) {
                isBaiter = true;
                console.log(`${aiKillingMoves[0]} kills fastest`)
            } 
            else if (aiMostDmgMovesWithSecondaries.length == 1 && aiMostDmgMovesWithSecondaries[0] == chosenMove) {
                isBaiter = true;
                console.log(`${aiKillingMoves[0]} is only fastest killing move with secondaries`)
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
                    moveList.push(player_results[j].move.originalName)
                    killers[box[m]] = 1
                    $(`.trainer-pok[data-id='${box[m]}']`).addClass('killer')
                } 
            }

            if (moveList.length > 0) {
                term.echo(`${mon.name}: ${moveList}`)
            }


        }


    }
    monHighlights = {"killers": killers, "defenders": defenders, "faster": faster, "baiters": baiters} 
    return monHighlights
}