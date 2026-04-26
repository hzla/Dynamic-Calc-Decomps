

$("#p2 .ability").bind("keyup change", function () {
	// autosetWeather($(this).val(), 1);
	// autosetTerrain($(this).val(), 1);
});

var resultLocations = [[], []];
for (var i = 0; i < 4; i++) {
	resultLocations[0].push({
		"move": "#resultMoveL" + (i + 1),
		"damage": "#resultDamageL" + (i + 1)
	});
	resultLocations[1].push({
		"move": "#resultMoveR" + (i + 1),
		"damage": "#resultDamageR" + (i + 1)
	});
}

var damageResults;

function isAirborne(mon) {
	return (mon.hasItem("Air Balloon") || mon.hasAbility("Levitate") || mon.hasType("Flying")) ? true : false;
}

function performCalculations() {
	var p1info = $("#p1");
	var p2info = $("#p2");



	var p1 = createPokemon(p1info);
	var p2 = createPokemon(p2info);
	var p1field = createField();
	var p2field = p1field.clone().swap();


	damageResults = calculateAllMoves(settings.damageGen, p1, p1field, p2, p2field);

	p1 = damageResults[0][0].attacker;
	p2 = damageResults[1][0].attacker;
	var battling = [p1, p2];
	p1.maxDamages = [];
	p2.maxDamages = [];
	

	if ($('#SpeL').prop('checked')) {
		p1.stats.spe = Math.floor(p1.stats.spe * 1.1)
		p1info.find(".sp .totalMod").css('color', '#bd93f9')
	} else {
		p1info.find(".sp .totalMod").attr('style', '')	
	}


	if ($('#mistralton').prop('checked')) {
		if (isAirborne(p1)) {
			p1.stats.spe = Math.floor(p1.stats.spe * 1.5)
		}
		if (isAirborne(p2)) {
			p2.stats.spe = Math.floor(p2.stats.spe * 1.5)
		}
	}

	for (stat of [["at", "atk"],["df","def"],["sa", "spa"],["sd","spd"]]){
		let total = p1info.find(`.${stat[0]} .total`)
		total.text(p1.stats[stat[1]])
		if (p1.boosts[stat[1]] > 0) {
			total.css('color', "#bb86fc")
		} else {
			total.css('color', "")
		}
	}

	for (stat of [["at", "atk"],["df","def"],["sa", "spa"],["sd","spd"]]){
		let total = p2info.find(`.${stat[0]} .total`)
		total.text(p2.stats[stat[1]])
		if (p2.boosts[stat[1]] > 0) {
			total.css('color', "#bb86fc")
		} else {
			total.css('color', "")
		}
	}

	

	p1info.find(".sp .totalMod").text(p1.stats.spe);
	p2info.find(".sp .totalMod").text(p2.stats.spe);

	if (p1.stats.spe > p2.stats.spe) {
		p1info.find(".sp .totalMod").css('color', '#8be9fd')
		p2info.find(".sp .totalMod").css('color', '#ff5555')
	} else {
		p2info.find(".sp .totalMod").css('color', '#8be9fd')
		p1info.find(".sp .totalMod").css('color', '#ff5555')
	}







	var fastestSide = p1.stats.spe > p2.stats.spe ? 0 : p1.stats.spe === p2.stats.spe ? "tie" : 1;

	var result, maxDamage;
	var bestResult;
	var zProtectAlerted = false;
	var is100 = false
	
	for (var i = 0; i < 4; i++) {
		// P1
		result = damageResults[0][i];
		maxDamage = result.range()[1] * p1.moves[i].hits;
		if (!zProtectAlerted && maxDamage > 0 && p1.item.indexOf(" Z") === -1 && p1field.defenderSide.isProtected && p1.moves[i].isZ) {
			alert('Although only possible while hacking, Z-Moves fully damage through protect without a Z-Crystal');
			zProtectAlerted = true;
		}
		p1.maxDamages.push({moveOrder: i, maxDamage: maxDamage});
		p1.maxDamages.sort(function (firstMove, secondMove) {
			return secondMove.maxDamage - firstMove.maxDamage;
		});
		var p1MoveLabel = (p1.moves[i].originalName || p1.moves[i].name).replace("Hidden Power", "HP");
		$(resultLocations[0][i].move + " + label").text(p1MoveLabel);
		

		$(resultLocations[0][i].damage).text(result.moveDesc(notation));
		var doublePowerMoves = ["Avalanche", "Payback", "Assurance", "Revenge", "Retaliate", "Stomping Tantrum"]
		if (TITLE.includes("Cascade")) {
			doublePowerMoves = doublePowerMoves.concat(["Thrash", "Temper Flare", "Seething Cold", "Uproar"])
		}
		if (doublePowerMoves.indexOf(p1.moves[i].name) != -1) {
			$(resultLocations[0][i].damage).text(result.moveDesc(notation) + " (can double power)");
		}

		// P2
		result = damageResults[1][i];
		maxDamage = result.range()[1] * p2.moves[i].hits;
		if (!zProtectAlerted && maxDamage > 0 && p2.item.indexOf(" Z") === -1 && p2field.defenderSide.isProtected && p2.moves[i].isZ) {
			alert('Although only possible while hacking, Z-Moves fully damage through protect without a Z-Crystal');
			zProtectAlerted = true;
		}
		p2.maxDamages.push({moveOrder: i, maxDamage: maxDamage});
		p2.maxDamages.sort(function (firstMove, secondMove) {
			return secondMove.maxDamage - firstMove.maxDamage;
		});
		var p2MoveLabel = (p2.moves[i].originalName || p2.moves[i].name).replace("Hidden Power", "HP");
		$(resultLocations[1][i].move + " + label").text(p2MoveLabel);
		$(resultLocations[1][i].damage).text(result.moveDesc(notation));

		var dmgInfo = $(resultLocations[1][i].damage).text()

		if (doublePowerMoves.indexOf(p2.moves[i].name) != -1) {
			$(resultLocations[1][i].damage).text($(resultLocations[1][i].damage).text()+ " (can double power)");
		}

		if (["Counter", "Mirror Coat", "Destiny Bond"].indexOf(p2.moves[i].name) != -1) {
			$(resultLocations[1][i].damage).text($(resultLocations[1][i].damage).text()+ " (variable dmg)");
		}

		// BOTH
		var bestMove;
		if (fastestSide === "tie") {
			// Technically the order should be random in a speed tie, but this non-determinism makes manual testing more difficult.
			// battling.sort(function () { return 0.5 - Math.random(); });
			bestMove = battling[0].maxDamages[0].moveOrder;
			var chosenPokemon = battling[0] === p1 ? "0" : "1";
			bestResult = $(resultLocations[chosenPokemon][bestMove].move);
		} else {
			bestMove = battling[fastestSide].maxDamages[0].moveOrder;
			bestResult = $(resultLocations[fastestSide][bestMove].move);
		}
	}
	if ($('.locked-move').length) {
		bestResult = $('.locked-move');
	} else {
		stickyMoves.setSelectedMove(bestResult.prop("id"));
	}
	bestResult.prop("checked", true);
	bestResult.change();
	$("#resultHeaderL").text(p1.name + "'s Moves (select one to show detailed results)");
	$("#resultHeaderR").text(p2.name + "'s Moves (select one to show detailed results)");
	highlightMoves()

}

$(".result-move").change(function () {
	
	if (damageResults) {
		var result = findDamageResult($(this));

		if (result) {
			var desc = result.fullDesc(notation, false);
			if (desc.indexOf('--') === -1) desc += ' -- possibly the worst move ever';
			$("#mainResult").text(desc);
			var summary = displayDamageHits(normalizeDamageForDisplay(result));
			var rest = "";
			var newLine = summary.indexOf('\n');
			if (newLine > -1) {
				rest = summary.substring(newLine + 1);
				summary = summary.substring(0, newLine);
			}
			$("#firstDmgValues").html("Possible damage amounts: (" + summary + ")");
			if (rest !== "") $("#restDmgValues").html("(" + rest + ")");

			if (rest.trim() === "") {
				$("#firstDmgValues").css("display", "block");
				$("#restDmgValues").html("");
			} else {
				$("#damageValues").removeAttr("open");
				$("#firstDmgValues").css("display", "revert");
			}
		}
	}


	var move = $(".results-right .visually-hidden:checked + .btn").text()    
});

function displayDamageHits(damage) {
	// Fixed Damage
	if (typeof damage === 'number') return damage.toString();

	if (damage.length == 16 && typeof damage[0] === 'number') {
		var medianIndex = 8;
		if (settings && settings.damageGen === 4) {
			medianIndex = 15;
		} else if (settings && settings.damageGen === 5) {
			medianIndex = 0;
		}
		var formatted = damage.map(function (value, index) {
			if (index === medianIndex) {
				return `<span id='dmg-median' title='AI Simulated Dmg Roll'>${value}</span>`;
			}
			return value;
		});
		return formatted.join(', ');
	}

	// Standard Damage
	if (damage.length > 2 && typeof damage[0] === 'number') return damage.join(', ');
	// Fixed Parental Bond Damage
	if (typeof damage[0] === 'number' && typeof damage[1] === 'number') {
		return '1st Hit: ' + damage[0] + '; 2nd Hit: ' + damage[1];
	}
	// Multihit Damage
	var fullText = "";
	for (var i = 1; i <= damage.length; i++) {
		var txt = toOrdinal(i) + " Hit: " + damage[i - 1].join(', ');
		if (i > 1 && i < damage.length) txt += "; ";
		fullText += txt;
		if (i % 2 == 1 && i < damage.length) fullText += "\n";
	}
	return fullText;
}

function normalizeDamageForDisplay(result) {
	var damage = result.damage;
	if (!result || !result.gen || !result.move) return damage;
	var genNum = result.gen.num;
	var hits = result.move.hits || 1;
	if (genNum >= 5 && genNum <= 6 && hits > 1 &&
		Array.isArray(damage) && typeof damage[0] === 'number' && damage.length >= 16) {
		return squashMultihitDisplay(damage, hits);
	}
	return damage;
}

function squashMultihitDisplay(d, hits) {
	if (hits === 1) return d;
	if (d.length === 1) return [d[0] * hits];
	if (d.length === 16) {
		switch (hits) {
		case 2:
			return [
				2 * d[0], d[2] + d[3], d[4] + d[4], d[4] + d[5], d[5] + d[6], d[6] + d[6],
				d[6] + d[7], d[7] + d[7], d[8] + d[8], d[8] + d[9], d[9] + d[9], d[9] + d[10],
				d[10] + d[11], d[11] + d[11], d[12] + d[13], 2 * d[15],
			];
		case 3:
			return [
				3 * d[0], d[3] + d[3] + d[4], d[4] + d[4] + d[5], d[5] + d[5] + d[6],
				d[5] + d[6] + d[6], d[6] + d[6] + d[7], d[6] + d[7] + d[7], d[7] + d[7] + d[8],
				d[7] + d[8] + d[8], d[8] + d[8] + d[9], d[8] + d[9] + d[9], d[9] + d[9] + d[10],
				d[9] + d[10] + d[10], d[10] + d[11] + d[11], d[11] + d[12] + d[12], 3 * d[15],
			];
		case 4:
			return [
				4 * d[0], 4 * d[4], d[4] + d[5] + d[5] + d[5], d[5] + d[5] + d[6] + d[6],
				4 * d[6], d[6] + d[6] + d[7] + d[7], 4 * d[7], d[7] + d[7] + d[7] + d[8],
				d[7] + d[8] + d[8] + d[8], 4 * d[8], d[8] + d[8] + d[9] + d[9], 4 * d[9],
				d[9] + d[9] + d[10] + d[10], d[10] + d[10] + d[10] + d[11], 4 * d[11], 4 * d[15],
			];
		case 5:
			return [
				5 * d[0], d[4] + d[4] + d[4] + d[5] + d[5], d[5] + d[5] + d[5] + d[5] + d[6],
				d[5] + d[6] + d[6] + d[6] + d[6], d[6] + d[6] + d[6] + d[6] + d[7],
				d[6] + d[6] + d[7] + d[7] + d[7], 5 * d[7], d[7] + d[7] + d[7] + d[8] + d[8],
				d[7] + d[7] + d[8] + d[8] + d[8], 5 * d[8], d[8] + d[8] + d[8] + d[9] + d[9],
				d[8] + d[9] + d[9] + d[9] + d[9], d[9] + d[9] + d[9] + d[9] + d[10],
				d[9] + d[10] + d[10] + d[10] + d[10], d[10] + d[10] + d[11] + d[11] + d[11], 5 * d[15],
			];
		case 10:
			return [
				10 * d[0], 10 * d[4], 3 * d[4] + 7 * d[5], 5 * d[5] + 5 * d[6], 10 * d[6],
				5 * d[6] + 5 * d[7], 10 * d[7], 7 * d[7] + 3 * d[8], 3 * d[7] + 7 * d[8], 10 * d[8],
				5 * d[8] + 5 * d[9], 4 * d[9], 5 * d[9] + 5 * d[10], 7 * d[10] + 3 * d[11], 10 * d[11],
				10 * d[15],
			];
		default:
			return d;
		}
	}
	return d;
}

function toOrdinal(num) {
	if (typeof num !== "number" || !Number.isInteger(num)) {
		return "Input must be an integer.";
	}
	switch (num) {
	case 1:
		return num + "st";
	case 2:
		return num + "nd";
	case 3:
		return num + "rd";
	default:
		return num + "th";
	}

	setGen3LastMoveFromDamage(p1, damageResults);
}

function setGen3LastMoveFromDamage(p1, damageResults) {
	if (typeof settings === "undefined" || settings.gameSwitchIn != 3) return;
	// Intentionally no-op: do not auto-select a last move from P1 damage.
	return;
}

function findDamageResult(resultMoveObj) {
	var selector = "#" + resultMoveObj.attr("id");
	for (var i = 0; i < resultLocations.length; i++) {
		for (var j = 0; j < resultLocations[i].length; j++) {
			if (resultLocations[i][j].move === selector) {
				return damageResults[i][j];
			}
		}
	}
}

function checkStatBoost(p1, p2) {
	if ($('#StatBoostL').prop("checked")) {
		for (var stat in p1.boosts) {
			if (stat === 'hp') continue;
			p1.boosts[stat] = Math.min(6, p1.boosts[stat] + 1);
		}
	}
	if ($('#StatBoostR').prop("checked")) {
		for (var stat in p2.boosts) {
			if (stat === 'hp') continue;
			p2.boosts[stat] = Math.min(6, p2.boosts[stat] + 1);
		}
	}
}


function rolls_less_than(rolls, k, winsTie) {

	if (k == 0) {
		return 0
	}

	if (rolls == 0) {
		return 16
	}

	for (n in rolls) {
		
		if (winsTie) {
			if (rolls[n] > k) {
				return parseInt(n)
			} 
		} else {
			if (rolls[n] >= k) {
				return parseInt(n)
			} 
		}
		
	}

	return 16
}

function calculate_probabilities(results) {
	// for each move's damage range
	var probabilities = []

	for (let i = 0; i < 4; i++) {
		var probability = 0
		// for each damage roll

		for (let n = 0; n < 16; n++) {
			// get number of rolls in other moves that are less than current roll

			if (results[i].damage == 0) {
				break
			}

			m1_roll_count = rolls_less_than(results[(i + 1) % 4].damage, results[i].damage[n], (i < 3))
			if (m1_roll_count == 0) {
				continue
			}
			m2_roll_count = rolls_less_than(results[(i + 2) % 4].damage, results[i].damage[n], (i < 2))
			if (m2_roll_count == 0) {
				continue
			}
			m3_roll_count = rolls_less_than(results[(i + 3) % 4].damage, results[i].damage[n], (i < 1))
			if (m3_roll_count == 0) {
				continue
			}
			probability += (0.0625) * (m1_roll_count / 16) * (m2_roll_count / 16) * (m3_roll_count / 16)
		}
		probabilities.push(probability)
	}
	return probabilities
}



function calculateAllMoves(gen, p1, p1field, p2, p2field, displayProbabilities=true) {
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		if (p2.moves[i] == "(No Move)" || p2.moves[i].name == "Smokescreen") {
			p2.moves[i].name = "Growl"
			p2.moves[i].category = "Status"
		} else {
			try {
				p2.moves[i].category = moves[p2.moves[i].originalName]["category"]
			} catch {
				console.log(`Resolving unknown move ${p2.moves[i].originalName}`)
				p2.moves[i].category = moves[p2.moves[i].name]["category"]
			}
			
		}
		
		// p2.moves[i].overrides = {}

		// In case p2 comes up as empty
		if (!p2.name) {
			// console.log(p2)
			var p2info = $("#p2");
			p2 = createPokemon(p2info);
		}

		if (!p1.name) {
			// console.log(p1)
			var p1info = $("#p1");
			p1 = createPokemon(p1info);
		}


		


		results[0][i] = calc.calculate(gen, p1, getDefensiveMoveTypeOverridePokemon(p2, $("#p2")), p1.moves[i], p1field);
		results[1][i] = calc.calculate(gen, p2, getDefensiveMoveTypeOverridePokemon(p1, $("#p1")), p2.moves[i], p2field);
	}
	return results;
}

function calculateLeftMoves(gen, p1, p1field, p2, p2field) {
	var results = [[], []];
	
	var movePool = p1.getDamagingMovePool()

	for (var i = 0; i < movePool.length; i++) {
		results[0][i] = calc.calculate(gen, p1, getDefensiveMoveTypeOverridePokemon(p2, $("#p2")), movePool[i], p1field);
	}
	return results;
}


function calculateSingleSidedMoves(gen, attacker, defender, field) {
	var results = [];

	for (var i = 0; i < 4; i++) {
		results[i] = calc.calculate(gen, attacker, defender, attacker.moves[i], field);
	}
	return results;
}

function calculateAllLeftVisibleRight(gen, p1, p1field, p2, p2field) {
	var results = [[], []];
	
	var movePool = p1.getDamagingMovePool()


	for (var i = 0; i < Math.max(movePool.length, 4); i++) {
		results[0][i] = calc.calculate(gen, p1, getDefensiveMoveTypeOverridePokemon(p2, $("#p2")), movePool[i] || movePool[i - 1], p1field);
		if (i < p2.moves.length) {
			results[1][i] = calc.calculate(gen, p2, getDefensiveMoveTypeOverridePokemon(p1, $("#p1")), p2.moves[i] || p2.moves[i - 1], p2field);
		}
	}
	return results;
}



$(".mode").change(function () {
	var params = new URLSearchParams(window.location.search);
	params.set('mode', $(this).attr("id"));
	var mode = params.get('mode');
	if (mode === 'randoms') {
		window.location.replace('randoms' + linkExtension + '?' + params);
	} else if (mode === 'one-vs-one') {
		window.location.replace('index' + linkExtension + '?' + params);
	} else {
		window.location.replace('honkalculate' + linkExtension + '?' + params);
	}
});

$(".notation").change(function () {
	performCalculations();
});

$(document).ready(function () {
	var params = new URLSearchParams(window.location.search);
	var m = params.get('mode');
	if (m) {
		if (m !== 'one-vs-one' && m !== 'randoms') {
			window.location.replace('honkalculate' + linkExtension + '?' + params);
		} else {
			if ($('#randoms').prop('checked')) {
				if (m === 'one-vs-one') {
					window.location.replace('index' + linkExtension + '?' + params);
				}
			} else {
				if (m === 'randoms') {
					window.location.replace('randoms' + linkExtension + '?' + params);
				}
			}
		}
	}
	$(".calc-trigger").on("change keyup", function () {
		setTimeout(performCalculations, 0);
		if (settings.switchIn == 10) {
			setTimeout(refresh_next_in(), 0);
		}
	});
	performCalculations();
});
