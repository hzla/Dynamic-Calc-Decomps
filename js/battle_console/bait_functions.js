const statLoweringEffects = {
	"ATK_MINUS_1": 1,
	"DEF_MINUS_1": 1,
	"SPD_MINUS_1": 1,
	"SP_ATK_MINUS_1": 1,
	"SP_DEF_MINUS_1": 1,
	"EVS_MINUS_1": 1,
	"ACC_MINUS_1": 1,
	"ATK_MINUS_2": 1,
	"DEF_MINUS_2": 1,
	"SPD_MINUS_2": 1,
	"SP_ATK_MINUS_2": 1,
	"SP_DEF_MINUS_2": 1,
	"EVS_MINUS_2": 1,
	"ACC_MINUS_2": 1,
	"V_CREATE": 1,
	"ATK_DEF_DOWN": 1,
	"DEF_SPDEF_DOWN": 1
}

const statBoostingEffects = {
	"ATK_PLUS_1":1,
	"DEF_PLUS_1":1,
	"SPD_PLUS_1":1,
	"SP_ATK_PLUS_1":1,
	"SP_DEF_PLUS_1":1,
	"EVS_PLUS_1":1,
	"ACC_PLUS_1":1,
	"ATK_PLUS_2":1,
	"DEF_PLUS_2":1,
	"SPD_PLUS_2":1,
	"SP_ATK_PLUS_2":1,
	"SP_DEF_PLUS_2":1,
	"EVS_PLUS_2":1,
	"ACC_PLUS_2":1,
	"ALL_STATS_UP":1
}

const selfDmgEffects = {
	"EXPLOSION":1,
	"MAX_HP_50_RECOIL":1,
	"MIND_BLOWN":1,
	"FINAL_GAMBIT":1,
	"RECOIL_IF_MISS":1
}


function targetCanBePoisoned(source, target, field) {
	// technically toxic boost checks for a physical move as well
	if (target.hasAbility("Immunity", "Comatose", "Purifying Salt", "Pastel Veil", "Poison Heal", "Toxic Boost")) return false;
	if (field.terrain == "Misty") return false;
	if (!source.hasAbility("Corrosion") && target.hasType("Steel", "Poison")) return false;
	return true;
}

function targetCanBeBurned(source, target, field) {
	if (target.hasAbility("Water Veil", "Comatose", "Purifying Salt", "Water Bubble", "Thermal Exchange")) return false;
	if (field.terrain == "Misty") return false;
	if (target.hasType("Fire")) return false;
	return true;
}

function targetCanBeParalyzed(source, target, field) {
	if (target.hasAbility("Limber", "Comatose", "Purifying Salt")) return false;
	if (field.terrain == "Misty") return false;
	if (target.hasType("Electric")) return false;
	return true;
}

function targetCanBeFrozen(source, target, field) {
	if (target.hasAbility("Magma Armor", "Comatose", "Purifying Salt")) return false;
	if (field.terrain == "Misty") return false;
	if (target.hasType("Ice")) return false;
	return true;
}

function targetCanBeConfused(source, target, field) {
	if (target.hasAbility("Own Tempo")) return false;
	if (field.terrain == "Misty") return false;
	if (target.hasType("Ice")) return false;
	return true;
}

function targetCanBeFlinched(source, target, field) {
	if (target.hasAbility("Inner Focus", "Shield Dust")) return false;
	return (source.stats.spe >= target.stats.spe)
}

function hasBadEffect(source, target, move) {
	let moveData = backup_moves[move.name]
	
	// Bad if has recoil
	if (move.recoil) return true;
	if (selfDmgEffects[moveData.eff]) return true; 
	if (moveData.addEff == "RECHARGE") return true;

	// Bad if has self stat lowering effect
	if (moveData.self && statLoweringEffects[moveData.addEff] && source.ability != "Contrary") return true; 
	return false;
}

function hasGoodEffect(source, target, field, move, hitsToKoTarget ) {
	if (move.eff == "BOLT_BEAK" && source.stats.spe >= target.stats.spe) {
		return true;
	}

	if (statBoostingEffects[moveData.addEff]) return true; 

	if (move.addEff == "POISON" || move.addEff == "TOXIC") {
		if (targetCanBePoisoned(source, target, field)) return true;
	}

	if (move.addEff == "BURN") {
		if (targetCanBeBurned(source, target, field)) return true;
	}

	if (move.addEff == "FREEZE_OR_FROSTBITE") {
		if (targetCanBeFrozen(source, target, field)) return true;
	}

	if (move.addEff == "PARALYSIS") {
		if (targetCanBeParalyzed(source, target, field)) return true;
	}

	if (move.addEff == "CONFUSION") {
		if (targetCanBeConfused(source, target, field)) return true;
	}

	// Also needs to be in danger of OHKO by target
	if (move.addEff == "FLINCH") {
		if (targetCanBeFlinched(source, target, field)) return true;
	}

	if (statLoweringEffects[moveData.addEff] && !moveData.self && hitsToKoTarget > 1) return true; 
	return false
}


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

