function compareDamagingMoves(player, opposing, field) {
	let leastNoOfHits = 1000;
	let highestMaxRoll = 0;
	let highestMoveScore = 0;
	let moveScores = {}
	let killTurns = []

	let opposingMoves = opposing.moves
	results = calculateSingleSidedMoves(gen, opposing, player, field)

	// First Loop: get turns to kill and find least number of turns to kill
	for (let moveIndex in opposingMoves) {
		const move = opposingMoves[moveIndex]
		if (move.category == "Status") continue; 

		let damage = results[moveIndex].damage;
		let turnsToKill = getKOChance(genInfo, opposing, player, move, field, damage , false).n;

		// 0 means too weak to consider
		if (turnsToKill == 0) {
            continue;
        }
		if (turnsToKill < leastNoOfHits) {
			leastNoOfHits = turnsToKill
		}
		killTurns[moveIndex] = turnsToKill
	}

	// Second Loop: get move scores
	for (let moveIndex in opposingMoves) {
		const move = opposingMoves[moveIndex]
		if (move.category == "Status") continue; 
		let damage = results[moveIndex].damage;

		if (move.name.includes("Hidden Power")) move.name = "Hidden Power";

		// Weighting: 2000, 1000, 500, 250, 100, 50, each flag is worth more than all flags below combined
		let	isLeastHits = 0;
		let isPrioKill =  0;
		let	isGuarenteedOhko = 0;
		let isSignificantlyMoreDmg = 0;
		const	isAcc = backup_moves[move.name].acc >= 100 ? 100 : 0;
		const	isEffect = move.secondaries == true ? 50 : 0;
		
		
		turnsToKill = killTurns[moveIndex]
	
		// add score for killing in least number of turns
		if (turnsToKill == leastNoOfHits) {
			leastNoOfHits = turnsToKill;
			isLeastHits = 2000;

			// add score for all rolls killing
			if (turnsToKill == 1) {
				if (move.priority >= 1) isPrioKill = 1000; 
				if (damage[0] >= player.originalCurHP) isGuarenteedOhko = 500; 
			} 
		}
		// add score for significantly more damage than all other moves if not a ko
		if (turnsToKill > 1 && damage[0] > highestMaxRoll) isSignificantlyMoreDmg = 250;

		// Update highest dmg
		if (damage[damage.length - 1] > highestMaxRoll) highestMaxRoll = damage[damage.length - 1];

		let moveScore = isLeastHits + isPrioKill + isGuarenteedOhko + isSignificantlyMoreDmg + isAcc + isEffect

		if (moveScore > highestMoveScore) {
			highestMoveScore = moveScore
			moveScores["bait"] = [move.name]
		} else if (moveScore == highestMoveScore) {
			moveScores["bait"].push(move.name)
		}
		moveScores[move.name] = moveScore
	}
	return moveScores
}

function getPPStallPairs() {
	
}

