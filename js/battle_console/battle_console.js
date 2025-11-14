$(document).ready(function() {
    $('#toggle-console').click(function() {
        if ($('.terminal:visible').length == 0) {
            
            if (!terminalStarted) {
               $(initConsole) 
               $('.battle-console').draggable()
               $('.battle-console').resizable()

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



    $(document).on('click', '.terminal-output span', function() {
      let spanText = $(this).attr('data-text') || $(this).text()
      spanText = spanText.trim()

      if (customSets[spanText]) {
        console.log(spanText)
        $(`img[data-id="${spanText} (My Box)"]`).click()
      }

      if (moves[spanText]) {
        $('select.move-selector .select2-chosen').first().text(spanText)
        $('select.move-selector').first().val(spanText).change()
        // $('.move-selector').first()
      }

    })

})

function initConsole() {
  noEcho = false;
  terminalStarted = true;
  immunities = {}
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

        let move = getMoveFromArgs(args)

        this.echo(`Lives ${times > 1 ? times + " " : ""}${move} from ${localStorage.right.split("(")[0]}`, {keepWords: true})
        consoleBoxRolls(move, false, takenMaxRoll=100, crit=false, times)
      },
      // same as above but with crit damage
      livescrit: function(...args) {
          let times = getTimesHitFromArgs(args)

          let move = getMoveFromArgs(args)

          this.echo(`Lives ${times ? times + " " : ""}crit ${move} from ${localStorage.right.split("(")[0]}`, {keepWords: true})
          consoleBoxRolls(move, false, takenMaxRoll=100, crit=true, times)
      },
      // highlights any mon that can ohko current ai pok with any move from it's level up and tm learnset, first argument is an optional dmg boost
      ohko: function(...args) {
          const dmgBoost = args[0] || 1

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for OHKO${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`, {keepWords: true})
          consoleBoxRolls(chosenMove=null, dealtMinRoll=100, false, false, 1, fast=false, dmgBoost)
      },
      // same as above but also must be faster
      fohko: function(...args) {
          const dmgBoost = args[0] || 1

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for fast OHKO${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`, {keepWords: true})
          consoleBoxRolls(chosenMove=null, dealtMinRoll=100, false, false, 1, fast=true, dmgBoost)
      },
      // highlights any mon that does the specified amount of damage ai pok with any move from it's level up and tm learnset, 
      // first argument is min roll
      // second argument is an optional dmg boost
      does: function(...args) {
          const dmgBoost = args[1] || 1
          const minRoll = args[0]

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for mons that do at least ${minRoll}%${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`, {keepWords: true})
          consoleBoxRolls(chosenMove=null, minRoll, false, false, 1, fast=false, dmgBoost)
      },
      // same as above but looks for faster
      fdoes: function(...args) {
          const dmgBoost = args[1] || 1
          const minRoll = args[0]

          this.clear();
          this.echo(`Searching learnsets and obtained TMs for faster mons that do at least ${minRoll}%${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}`, {keepWords: true})
          consoleBoxRolls(chosenMove=null, minRoll, false, false, 1, fast=true, dmgBoost)
      },
      baits: function(...args) {
          let move = getMoveFromArgs(args)
          currentAiMoves = get_current_in().moves

          this.echo(`Baits ${move} from ${localStorage.right.split("(")[0]}`, {keepWords: true})
          consoleBoxRolls(move, dealtMinRoll=false, takenMaxRoll=100, crit=false, times=1, fast=false, dmgBoost=1, showBait=true)
      },
      // Highlights mons that win the 1v1 using available move pool, assuming player always low rolls and AI always high rolls
      wins: function(...args) {
          const dmgBoost = args[0] || 1
          const aiCrits = args[1] || false

          let move = false
          if (args[2]) {
            move = getHitByMoveFromArgs(args)
          }
          
          let p2info = $("#p2");          
          let p2 = createPokemon(p2info);
          let p1field = createField();
          let p2field = p1field.clone().swap();

          let box = get_box()

          this.clear();
          this.echo(`Searching for winning matchups${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}${move ? ` after getting hit by ${teal(move)}` : ""}${aiCrits ? ` assuming all crits` : ""}\n`, {keepWords: true})
          let results = []

          for (m = 0; m < box.length; m++) {

            let p1 = createPokemon(box[m])
            // Calculate every damaging move from left pokemon's current movepool against right pokemon's moveset
            let all_results = calculateAllLeftVisibleRight(damageGen, p1, p1field, p2, p2field);
            let matchup = consoleMatchupData(all_results[0], all_results[1], dmgBoost, aiCrits, move)

            if (!matchup.wins1v1) {
              results.push([p1.name, matchup.attackerBestMove, matchup.remainingAttackerHP])
            }            
          }
          results = results.sort(sortByRemainingHP)

          resultsTable = [["Species", "Move", "%HP"]]
          for (let result of results) {
            resultsTable.push(result)
          } 
          printAsciiTable(this, resultsTable, [""], ["purple", "teal", "hpColor"])          
      },
      // same as above but assuming AI crits every move
      winscrit: function(...args) {
        const dmgBoost = args[0] || 1
        const aiCrits = true
        this.exec(`wins ${dmgBoost} true`)
      },
      // same as wins but mon must take a max roll hit from the specified move, must specify damage boost and crit in first 2 args first
      winsafter: function(...args) {
          const dmgBoost = args[0] || 1
          const aiCrits = args[1] == 'crit' || false

          let move = false
          if (args[2]) {
            move = getHitByMoveFromArgs(args)
          }
          
          let p2info = $("#p2");          
          let p2 = createPokemon(p2info);
          let p1field = createField();
          let p2field = p1field.clone().swap();
          let box = get_box()

          this.clear();
          this.echo(`Searching for winning matchups${dmgBoost > 1 ? ` after ${dmgBoost}x boost` : ""}${move ? ` after getting hit by ${teal(move)}` : ""}${aiCrits ? ` assuming all crits` : ""}\n`, {keepWords: true})
          let results = []
          for (m = 0; m < box.length; m++) {

            let p1 = createPokemon(box[m])
            // Calculate every damaging move from left pokemon's current movepool against right pokemon's moveset
            let all_results = calculateAllLeftVisibleRight(damageGen, p1, p1field, p2, p2field);
            let matchup = consoleMatchupData(all_results[0], all_results[1], dmgBoost, aiCrits, move)


            if (!matchup.wins1v1) {
              results.push([p1.name, matchup.attackerBestMove, matchup.remainingAttackerHP])
            }     
          }
          results = results.sort(sortByRemainingHP)

          resultsTable = [["Species", "Move", "%HP"]]
          for (let result of results) {
            resultsTable.push(result)
          }

          printAsciiTable(this, resultsTable, [""], ["purple", "teal", "hpColor"])     
      },
      immune: function(...args) {
          let p2info = $("#p2");          
          let p2 = createPokemon(p2info);
          let p1field = createField();
          let p2field = p1field.clone().swap();
          let box = get_box()
          immunities = {}  

          this.clear();
          this.echo(`Searching box for mons with immunities\n`, {keepWords: true});

          for (m = 0; m < box.length; m++) {
            let p1 = createPokemon(box[m])
            let all_results = calculateAllLeftVisibleRight(damageGen, p1, p1field, p2, p2field);
            let matchup = consoleMatchupData(all_results[0], all_results[1])   
          }

          let immunityTable = [[]] 
          let blockedMoveCount = 0

          for (let im in immunities) {
            immunityTable[0].push(im)
            let pokCount = 1
            for (let pok of immunities[im]) {
              immunityTable[pokCount] ||= []
              immunityTable[pokCount][blockedMoveCount] = pok
              pokCount += 1
            }
            blockedMoveCount += 1   
          }
          console.log(immunityTable)
          printAsciiTable(this, immunityTable)
      }

   }, {
        greetings: "Welcome to the battle console!\nType 'help' for available commands.\nType 'clear' to clear console",
        checkArity: false,
        scrollOnEcho: false
    });
}

function getTimesHitFromArgs(args) {
    let times = 1
    if (parseInt(args[0])) {
        times = parseInt(args[0])
    }
    return times
}

function purple(message) {
    return "[[;#bb86fc;]" + message + "]";
}

function teal(message) {
    return "[[;#1abc9c;]" + message + "]";
}

function hpColor(hp) {
  return parseInt(hp) > 50 ? "[[;#50fa7b;]" + hp + "]" : "[[;#ff5555;]" + hp + "]"

}

function red(message) {
  return "[[;#ff5555;]" + message + "]";
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

function getHitByMoveFromArgs(args) {
  let searchStr = args.slice(2).join(" ")

  for (let move of currentAiMoves) {
    if (move.toLowerCase().includes(searchStr.toLowerCase())) {
      return move
    }
  }
}








