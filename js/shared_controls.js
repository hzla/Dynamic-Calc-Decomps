if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement, fromIndex) { // eslint-disable-line no-extend-native
		var k;
		if (this == null) {
			throw new TypeError('"this" equals null or n is undefined');
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = +fromIndex || 0;
		if (Math.abs(n) === Infinity) {
			n = 0;
		}
		if (n >= len) {
			return -1;
		}
		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
		while (k < len) {
			if (k in O && O[k] === searchElement) {
				return k;
			}
			k++;
		}
		return -1;
	};
}

boxSprites = ["pokesprite", "pokesprite"]
fainted = []
if (!localStorage.boxspriteindex) {
localStorage.boxspriteindex = 1
}
sprite_style = boxSprites[parseInt(localStorage.boxspriteindex)]

function startsWith(string, target) {
	return (string || '').slice(0, target.length) === target;
}

var LEGACY_STATS_RBY = ["hp", "at", "df", "sl", "sp"];
var LEGACY_STATS_GSC = ["hp", "at", "df", "sa", "sd", "sp"];
var LEGACY_STATS = [[], LEGACY_STATS_RBY, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC, LEGACY_STATS_GSC];
var HIDDEN_POWER_REGEX = /Hidden Power(\w*)/;

var CALC_STATUS = {
	'Healthy': '',
	'Paralyzed': 'par',
	'Poisoned': 'psn',
	'Badly Poisoned': 'tox',
	'Burned': 'brn',
	'Asleep': 'slp',
	'Frozen': 'frz'
};

function legacyStatToStat(st) {
	switch (st) {
	case 'hp':
		return "hp";
	case 'at':
		return "atk";
	case 'df':
		return "def";
	case 'sa':
		return "spa";
	case 'sd':
		return "spd";
	case 'sp':
		return "spe";
	case 'sl':
		return "spc";
	}
}

// input field validation
var bounds = {
	"level": [0, 100],
	"base": [1, 255],
	"evs": [0, 252],
	"ivs": [0, 31],
	"dvs": [0, 15],
	"move-bp": [0, 65535]
};
for (var bounded in bounds) {
	attachValidation(bounded, bounds[bounded][0], bounds[bounded][1]);
}
function attachValidation(clazz, min, max) {
	$("." + clazz).keyup(function () {
		validate($(this), min, max);
	});
}
function validate(obj, min, max) {
	obj.val(Math.max(min, Math.min(max, ~~obj.val())));
}

// auto-calc stats and current HP on change
$(".level").change(function () {
	var poke = $(this).closest(".poke-info");
	calcHP(poke);
	calcStats(poke);
});
$(".nature").bind("keyup recalc change", function () {
	calcStats($(this).closest(".poke-info"));
});
$(".hp .base, .hp .evs, .hp .ivs").bind("keyup recalc change", function () {
	calcHP($(this).closest(".poke-info"));
});
$(".at .base, .at .evs, .at .ivs").bind("keyup recalc change", function () {
	calcStat($(this).closest(".poke-info"), 'at');
});
$(".df .base, .df .evs, .df .ivs").bind("keyup recalc change", function () {
	calcStat($(this).closest(".poke-info"), 'df');
});
$(".sa .base, .sa .evs, .sa .ivs").bind("keyup recalc change", function () {
	calcStat($(this).closest(".poke-info"), 'sa');
});
$(".sd .base, .sd .evs, .sd .ivs").bind("keyup recalc change", function () {
	calcStat($(this).closest(".poke-info"), 'sd');
});
$(".sp .base, .sp .evs, .sp .ivs").bind("keyup recalc change", function () {
	calcStat($(this).closest(".poke-info"), 'sp');
});
$(".sl .base").keyup(function () {
	calcStat($(this).closest(".poke-info"), 'sl');
});
$(".at .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'at');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".df .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'df');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sa .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'sa');
	poke.find(".sd .dvs").val($(this).val());
	calcStat(poke, 'sd');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sp .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'sp');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});
$(".sl .dvs").keyup(function () {
	var poke = $(this).closest(".poke-info");
	calcStat(poke, 'sl');
	poke.find(".hp .dvs").val(getHPDVs(poke));
	calcHP(poke);
});

function getHPDVs(poke) {
	return (~~poke.find(".at .dvs").val() % 2) * 8 +
(~~poke.find(".df .dvs").val() % 2) * 4 +
(~~poke.find(".sp .dvs").val() % 2) * 2 +
(~~poke.find(gen === 1 ? ".sl .dvs" : ".sa .dvs").val() % 2);
}

function calcStats(poke) {
	for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
		calcStat(poke, LEGACY_STATS[gen][i]);
	}
}

function calcCurrentHP(poke, max, percent, skipDraw) {
	var current = Math.round(Number(percent) * Number(max) / 100);
	poke.find(".current-hp").val(current);
	if (!skipDraw) drawHealthBar(poke, max, current);
	return current;
}
function calcPercentHP(poke, max, current, skipDraw) {
	var percent = Math.round(100 * Number(current) / Number(max));
	if (percent === 0 && current > 0) {
		percent = 1;
	} else if (percent === 100 & current < max) {
		percent = 99;
	}

	poke.find(".percent-hp").val(percent);
	if (!skipDraw) drawHealthBar(poke, max, current);
	return percent;
}
function drawHealthBar(poke, max, current) {
	var fillPercent = 100 * current / max;
	var fillColor = fillPercent > 50 ? "green" : fillPercent > 20 ? "yellow" : "red";

	var healthbar = poke.find(".hpbar");
	healthbar.addClass("hp-" + fillColor);
	var unwantedColors = ["green", "yellow", "red"];
	unwantedColors.splice(unwantedColors.indexOf(fillColor), 1);
	for (var i = 0; i < unwantedColors.length; i++) {
		healthbar.removeClass("hp-" + unwantedColors[i]);
	}
	healthbar.css("background", "linear-gradient(to right, " + fillColor + " " + fillPercent + "%, white 0%");
}
// TODO: these HP inputs should really be input type=number with min=0, step=1, constrained by max=maxHP or 100
$(".current-hp").keyup(function () {
	var max = $(this).parent().children(".max-hp").text();
	validate($(this), 0, max);
	var current = $(this).val();
	calcPercentHP($(this).parent(), max, current);
});
$(".percent-hp").keyup(function () {
	var max = $(this).parent().children(".max-hp").text();
	validate($(this), 0, 100);
	var percent = $(this).val();
	calcCurrentHP($(this).parent(), max, percent);
});


function showAbilityExtras(abilityObj) {
	var moveHits =
		$(abilityObj).val() === 'Skill Link' ? 5 :
			$(abilityObj).closest(".poke-info").find(".item").val() === 'Loaded Dice' ? 4 : 3;
	$(abilityObj).closest(".poke-info").find(".move-hits").val(moveHits);

	var ability = $(abilityObj).closest(".poke-info").find(".ability").val();

	var TOGGLE_ABILITIES = ['Flash Fire', 'Intimidate', 'Minus', 'Plus', 'Slow Start', 'Unburden', 'Stakeout', 'Teraform Zero', 'Bull Rush', 'Quill Rush', 'Illusion', 'Dauntless Shield', 'Intrepid Sword', 'Download'];

	if (TOGGLE_ABILITIES.indexOf(ability) >= 0) {
		$(abilityObj).closest(".poke-info").find(".abilityToggle").show();
	} else {
		$(abilityObj).closest(".poke-info").find(".abilityToggle").hide();
	}
	var boostedStat = $(abilityObj).closest(".poke-info").find(".boostedStat");

	if (ability === "Protosynthesis" || ability === "Quark Drive") {
		boostedStat.show();
		autosetQP($(abilityObj).closest(".poke-info"));
	} else {
		boostedStat.hide();
	}

	if (ability === "Supreme Overlord") {
		$(abilityObj).closest(".poke-info").find(".alliesFainted").show();
	} else {
		$(abilityObj).closest(".poke-info").find(".alliesFainted").val('0');
		$(abilityObj).closest(".poke-info").find(".alliesFainted").hide();

	}
	// detectAutoWeather(abilityObj)
}

$(".ability").bind("keyup change", function () {
	showAbilityExtras(this)
});

function detectAutoWeather() {
	var is_p1 = $(this).parents("#p1").length > 0
	var ability = $(this).val()
	var weather_abilities = ["Drought", "Drizzle", "Sand Stream", "Snow Warning", "Desolate Land", "Primordial Sea", "Delta Stream", "Orichalcum Pulse"]


	// dont change weather when filtering ability list
	if (is_p1 && !weather_abilities.includes(createPokemon($("#p1")).ability)) {
		return
	}

	// dont change weather if new mon has no weather ability but other mon does
	if (!weather_abilities.includes(ability) && is_p1) {
		if (weather_abilities.includes($("#p2 .ability").val())) {
			return
		}
	}

	if (!weather_abilities.includes(ability) && !is_p1) {
		if (weather_abilities.includes($("#p1 .ability").val())) {
			return
		}
	}

	// set weather according to new mons ability


	if (weather_abilities.includes(ability)) {
		autosetWeather($(this).val(), 0);
      	resultsCache = new Map();
	}
	autosetTerrain($(this).val(), 0);
}

$("#p1 .ability, #p2 .ability").bind("keyup change recalc", detectAutoWeather);

var lastManualWeather = "";
var lastAutoWeather = ["", ""];
function autosetWeather(ability, i) {
	var currentWeather = $("input:radio[name='weather']:checked").val();
	if (lastAutoWeather.indexOf(currentWeather) === -1) {
		lastManualWeather = currentWeather;
		lastAutoWeather[1 - i] = "";
	}

	if (INC_EM) {
		ability = ability.replace("Drought", "Desolate Land").replace("Drizzle", "Primordial Sea")
	}

	switch (ability) {
	case "Drought":
	case "Orichalcum Pulse":
		lastAutoWeather[i] = "Sun";
		$("#sun").prop("checked", true);
		break;
	case "Drizzle":
		lastAutoWeather[i] = "Rain";
		$("#rain").prop("checked", true);
		// var bg_width = $('.poke-sprite')[0].width + 40
		// $(".poke-sprite-weather").show().css("background",
		// 	"url(../img/rain.gif)"
		// ).css("width", `${bg_width}px`)
		break;
	case "Sand Stream":
		lastAutoWeather[i] = "Sand";
		$("#sand").prop("checked", true);
		break;
	case "Snow Warning":
		lastAutoWeather[i] = "Snow";
		$("#snow").prop("checked", true);
		break;
	case "Desolate Land":
		lastAutoWeather[i] = "Harsh Sunshine";
		$("#harsh-sunshine").prop("checked", true);
		break;
	case "Primordial Sea":
		lastAutoWeather[i] = "Heavy Rain";
		$("#heavy-rain").prop("checked", true);
		break;
	case "Delta Stream":
		lastAutoWeather[i] = "Strong Winds";
		$("#strong-winds").prop("checked", true);
		break;
	default:
		lastAutoWeather[i] = "";
		var newWeather = lastAutoWeather[1 - i] !== "" ? lastAutoWeather[1 - i] : "";
		$("input:radio[name='weather'][value='" + newWeather + "']").prop("checked", true);
		break;
	}
}

var lastManualTerrain = "";
var lastAutoTerrain = ["", ""];
function autosetTerrain(ability, i) {
	var currentTerrain = $("input:checkbox[name='terrain']:checked").val() || "No terrain";
	if (lastAutoTerrain.indexOf(currentTerrain) === -1) {
		lastManualTerrain = currentTerrain;
		lastAutoTerrain[1 - i] = "";
	}
	// terrain input uses checkbox instead of radio, need to uncheck all first
	$("input:checkbox[name='terrain']:checked").prop("checked", false);
	switch (ability) {
	case "Electric Surge":
	case "Hadron Engine":
		lastAutoTerrain[i] = "Electric";
		$("#electric").prop("checked", true);
		break;
	case "Grassy Surge":
		lastAutoTerrain[i] = "Grassy";
		$("#grassy").prop("checked", true);
		break;
	case "Misty Surge":
		lastAutoTerrain[i] = "Misty";
		$("#misty").prop("checked", true);
		break;
	case "Psychic Surge":
		lastAutoTerrain[i] = "Psychic";
		$("#psychic").prop("checked", true);
		break;
	default:
		lastAutoTerrain[i] = "";
		var newTerrain = lastAutoTerrain[1 - i] !== "" ? lastAutoTerrain[1 - i] : lastManualTerrain;
		if ("No terrain" !== newTerrain) {
			$("input:checkbox[name='terrain'][value='" + newTerrain + "']").prop("checked", true);
		}
		break;
	}
}

$("#p1 .item").bind("keyup change", function () {
	autosetStatus("#p1", $(this).val());
});

var lastManualStatus = {"#p1": "Healthy"};
var lastAutoStatus = {"#p1": "Healthy"};
function autosetStatus(p, item) {
	var currentStatus = $(p + " .status").val();
	if (currentStatus !== lastAutoStatus[p]) {
		lastManualStatus[p] = currentStatus;
	}
	if (p == "#p2") {
		var ability = $('#abilityR1').val()
	} else {
		var ability = $('#abilityL1').val()
	}
	if (item === "Flame Orb" && ability != "Water Veil") {
		lastAutoStatus[p] = "Burned";
		$(p + " .status").val("Burned");
		$(p + " .status").change();
	} else if (item === "Toxic Orb") {
		lastAutoStatus[p] = "Badly Poisoned";
		$(p + " .status").val("Badly Poisoned");
		$(p + " .status").change();
	} else {
		lastAutoStatus[p] = "Healthy";
		if (currentStatus !== lastManualStatus[p]) {
			$(p + " .status").val(lastManualStatus[p]);
			$(p + " .status").change();
		}
	}
}

$(".status").bind("keyup change", function () {
	if ($(this).val() === 'Badly Poisoned') {
		$(this).parent().children(".toxic-counter").show();
	} else {
		$(this).parent().children(".toxic-counter").hide();
	}
});

var lockerMove = "";
function showMoveExtras(moveObj, ppObj=null, fullSetName="", index=null) {
	var moveName = $(moveObj).val();
	var move = moves[moveName] || moves['(No Move)'];

	var moveGroupObj = $(moveObj).parent();
	moveGroupObj.children(".move-bp").val(moveName === 'Present' ? 40 : move.bp);

	const isPlayer = $(moveObj).parents("#p1").length > 0
	const moveIndex = $(moveObj).parent().attr('class')[4]

	let resultText = $(`#resultDamage${isPlayer ? 'L' : 'R'}${moveIndex}`)




	


	if (ppObj) {
		if (isPlayer) {
			ppObj.val(backup_moves[moveName].pp	)
		} else {
			movePPs[fullSetName][moveIndex] ||= backup_moves[moveName].pp	
			let ppVal = movePPs[fullSetName][moveIndex] 
			ppObj.val(ppVal)
		}		
	} else {
		try {
			$(moveObj).parent().find('.move-pp').val(backup_moves[moveName].pp)
		} catch {
		}
		
	}
				
	var m = moveName.match(HIDDEN_POWER_REGEX);
	var pokeObj = $(moveObj).closest(".poke-info");
	var pokemon = createPokemon(pokeObj);

	if (changingSets) {
		if (m) {
			


			trueHP = true


			var actual = calc.Stats.getHiddenPower(GENERATION, pokemon.ivs, trueHP);
			if (actual.type !== m[1]) {
				
				$(moveObj).val(`Hidden Power ${actual.type}`)

				var hpIVs = calc.Stats.getHiddenPowerIVs(GENERATION, m[1]);
				if (hpIVs && gen < 7) {
					for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
						var legacyStat = LEGACY_STATS[gen][i];
						var stat = legacyStatToStat(legacyStat);
						pokeObj.find("." + legacyStat + " .ivs").val(hpIVs[stat] !== undefined ? hpIVs[stat] : 31);
						pokeObj.find("." + legacyStat + " .dvs").val(hpIVs[stat] !== undefined ? calc.Stats.IVToDV(hpIVs[stat]) : 15);
					}
					if (gen < 3) {
						var hpDV = calc.Stats.getHPDV({
							atk: pokeObj.find(".at .ivs").val(),
							def: pokeObj.find(".df .ivs").val(),
							spe: pokeObj.find(".sp .ivs").val(),
							spc: pokeObj.find(".sa .ivs").val()
						});
						pokeObj.find(".hp .ivs").val(calc.Stats.DVToIV(hpDV));
						pokeObj.find(".hp .dvs").val(hpDV);
					}
					// pokeObj.change();
					moveGroupObj.children(".move-bp").val(gen >= 6 ? 60 : 70);
				}
			} else {
				moveGroupObj.children(".move-bp").val(actual.power);
			}
		} else if (gen >= 2 && gen <= 6 && HIDDEN_POWER_REGEX.test($(moveObj).attr('data-prev'))) {
			// If moveObj selector was previously Hidden Power but now isn't, reset all IVs/DVs to max.
			var pokeObj = $(moveObj).closest(".poke-info");
			for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
				var legacyStat = LEGACY_STATS[gen][i];
				pokeObj.find("." + legacyStat + " .ivs").val(31);
				pokeObj.find("." + legacyStat + " .dvs").val(15);
			}
		}
	}	
	$(moveObj).attr('data-prev', moveName);
	moveGroupObj.children(".move-type").val(move.type);
	moveGroupObj.children(".move-cat").val(move.category);

	let isCrit = false
	if (typeof backup_moves != "undefined" && typeof backup_moves[moveName] != 'undefined') {
		isCrit = (backup_moves[moveName].crit_stage >= 2 && pokemon.item == "Scope Lens") || move.willCrit === true;
	} else {
		isCrit = move.willCrit === true;
	}

	moveGroupObj.children(".move-crit").prop("checked", isCrit);

	var stat = move.category === 'Special' ? 'spa' : 'atk';
	var dropsStats =
		move.self && move.self.boosts && move.self.boosts[stat] && move.self.boosts[stat] < 0;
	if (Array.isArray(move.multihit)) {
		moveGroupObj.children(".stat-drops").hide();
		moveGroupObj.children(".move-hits").show();
		var pokemon = $(moveObj).closest(".poke-info");
		var moveHits = 3;
		if (move.multihit[1] == 2)
			moveHits = 2;
		else if (move.multihit[1] == 5 && pokemon.find(".ability").val() === "Skill Link")
			moveHits = 5;
		moveGroupObj.children(".move-hits").val(moveHits);
	} else if (dropsStats) {
		moveGroupObj.children(".move-hits").hide();
		moveGroupObj.children(".stat-drops").show();
	} else {
		moveGroupObj.children(".move-hits").hide();
		moveGroupObj.children(".stat-drops").hide();
	}
	moveGroupObj.children(".move-z").prop("checked", false);



	if (TITLE.includes("Cascade")) {
		setTimeout(function() {
			if ($(moveObj).parent().hasClass('move1')) {
				let pokeInfo = $(moveGroupObj).parents('.poke-info')
				let itemName = pokeInfo.find('.item').val()
				if (itemName) {
					if (itemName.includes("Tera ")) {
						teraType = move.type
						pokeInfo.find(".type1").val(teraType).css('border', '1px solid #bb86fc')
						pokeInfo.find('.type2').val("")
					} else {
						let pokeName = pokeInfo.find('.select2-chosen').text().split(" (")[0]
						if (pokedex[pokeName]) {
							let oldTypes = pokedex[pokeName].types
							pokeInfo.find('.type1').val(oldTypes[0]).css('border', '')
							if (oldTypes.length > 1) {
								pokeInfo.find('.type2').val(oldTypes[1])
							}
						}
						
					}
				}
			}
		}, 500)
		

	}
	

	

}


// auto-update move details on select
$(".move-selector").change(function () {
	showMoveExtras(this)
});


function showItemExtras(itemObj) {
	var itemName = $(itemObj).val();
	var $metronomeControl = $(itemObj).closest('.poke-info').find('.metronome');
	if (itemName === "Metronome") {
		$metronomeControl.show();
	} else {
		$metronomeControl.hide();
	}

	let pokeInfo = $(itemObj).parents('.poke-info')
	

	if (itemName) {
		if (itemName.includes("Tera ")) {
			teraType = pokeInfo.find('.move1 .move-type').val()
			pokeInfo.find(".type1").val(teraType).css('border', '1px solid #bb86fc')
			pokeInfo.find('.type2').val("")
		} else {
			let pokeName = pokeInfo.find('.select2-chosen').text().split(" (")[0]
			let oldTypes = pokedex[pokeName].types
			pokeInfo.find('.type1').val(oldTypes[0]).css('border', '')
			if (oldTypes.length > 1) {
				pokeInfo.find('.type2').val(oldTypes[1])
			}
		}
	}
	
}

$(".item").change(function () {
	showItemExtras(this)
});

function smogonAnalysis(pokemonName) {
	var generation = ["rb", "gs", "rs", "dp", "bw", "xy", "sm", "ss"][gen - 1];
	return "https://smogon.com/dex/" + generation + "/pokemon/" + pokemonName.toLowerCase() + "/";
}




// auto-update set details on select

function refresh_next_in() {
	var next_poks = get_next_in()

	var trpok_html = ""

	for (i in next_poks ) {
		var pok_name = next_poks[i][0].split(" (")[0].toLowerCase().replace(" ","-").replace(".","").replace("’","").replace(":","-")
		for (let n = 0; n < 4; n++) {
			if (!next_poks[i][4][n]) {
				next_poks[i][4][n] = ""
			}
		}

		var dataID = next_poks[i][0].split("[")[0]

		console.log(next_poks[i][0])
		if (next_poks[i][0].includes($('input.opposing').val()) && settings.noSwitch != "1" && (settings.damageGen >= 3 && settings.damageGen <= 5)){
			
			continue
		}

		var isFainted = ""
		if (fainted.includes(dataID)) {
			isFainted = "fainted"
		}

		var isLead = ""

		if (next_poks[i][0].includes("[0]") && (settings.gameSwitchIn == 4 || settings.gameSwitchIn == 5)) {
			isLead = "lead"
		}
		if (next_poks[i][0].includes("[1]") && (settings.gameSwitchIn == 4 || settings.gameSwitchIn == 5) && battle_type != "Singles") {
			isLead = "lead"
		}
		if (next_poks[i][0].includes("[2]") && (settings.gameSwitchIn == 4 || settings.gameSwitchIn == 5) && battle_type == "Triples") {
			isLead = "lead"
		}



		var pok = `<div class="trainer-pok-container">
			<img class="trainer-pok right-side hl-disabled ${isFainted} ${isLead}" src="./img/${sprite_style}/${pok_name.replace(" ", "")}.png" data-id="${dataID}">`


		var species = next_poks[i][0].split(" (")[0]
		var set_name = next_poks[i][0].split(" (")[1].split(")")[0]
		var item = setdex[species][set_name]["item"]

		if (item && item != "-" && !item.toLowerCase().includes("none")) {
			item_name = item.toLowerCase().replace(" ", "_").replace("'","") 
            pok += `<img class="trainer-pok-item" src="./img/items/${item_name}.png">`
		}

		let pps = []
		// console.log(next_poks[i][0])
		if (movePPs[dataID]) {
			pps = movePPs[dataID]
		} else {
			pps = [1,1,1,1]
		}

		if (settings.gameSwitchIn == 5 || settings.gameSwitchIn == 4) { 
			pok +=`
			<div class="bp-info${pps[0] == '0' ? 'nopp' : ''}" data-strong="${next_poks[i][2].includes(next_poks[i][4][0])}">${next_poks[i][4][0].replace("Hidden Power", "HP")}</div>
			<div class="bp-info${pps[1] == '0' ? 'nopp' : ''}" data-strong="${next_poks[i][2].includes(next_poks[i][4][1])}">${next_poks[i][4][1].replace("Hidden Power", "HP")}</div>
			<div class="bp-info${pps[2] == '0' ? 'nopp' : ''}" data-strong="${next_poks[i][2].includes(next_poks[i][4][2])}">${next_poks[i][4][2].replace("Hidden Power", "HP")}</div>
			<div class="bp-info${pps[3] == '0' ? 'nopp' : ''}" data-strong="${next_poks[i][2].includes(next_poks[i][4][3])}">${next_poks[i][4][3].replace("Hidden Power", "HP")}</div>
			</div>`
		} else {
			pok +=`<div class="bp-infos">
			<div class="bp-info ${pps[0] == '0' ? 'nopp' : ''}">${next_poks[i][4][0].replace("Hidden Power", "HP")}</div>
			<div class="bp-info ${pps[1] == '0' ? 'nopp' : ''}">${next_poks[i][4][1].replace("Hidden Power", "HP")}</div>
			<div class="bp-info ${pps[2] == '0' ? 'nopp' : ''}">${next_poks[i][4][2].replace("Hidden Power", "HP")}</div>
			<div class="bp-info ${pps[3] == '0' ? 'nopp' : ''}">${next_poks[i][4][3].replace("Hidden Power", "HP")}</div></div>`
		}
		
		

		
		if (TITLE.includes("1.3")) {
			pok += next_poks[i][5]
		}
		pok += `</div>`
		
		trpok_html += pok
	}
	$('.opposing.trainer-pok-list').html(trpok_html)

	if (localStorage.switchInfo == '1') {
		simplifySwitchScores()
	}
}

function updateGen3BaitMoves() {
	if (typeof settings === "undefined" || settings.gameSwitchIn != 3) return;
	var p2 = createPokemon($('#p2'));
	var moveNames = [];
	for (var i in p2.moves) {
		if (p2.moves[i] && p2.moves[i].name) {
			moveNames.push(p2.moves[i].name);
		}
	}
	var selector = $('#gen3-switch-guide .last-move-used select.move-selector');
	if (!selector.length) return;

	var current = selector.val();
	var options = "";
	for (var j in moveNames) {
		var name = moveNames[j];
		options += `<option value="${name}">${name}</option>`;
	}
	selector.html(options);
	if (current && moveNames.includes(current)) {
		selector.val(current);
	}
}

$('#gen3-switch-guide .last-move-used .bait-trigger').on('change input', function() {
	if (typeof settings === "undefined" || settings.gameSwitchIn != 3) return;
	refresh_next_in();
});

$('#p2 .move-selector, #p2 .set-selector').change(function() {
	updateGen3BaitMoves();
});

$('#p2 .move-bp, #p2 .move-type').on('change input', function() {
	updateGen3BaitMoves();
});


$('#p1 .boost, #statusL1, #p1 .percent-hp').blur(function() {
	refresh_next_in()	
})


$(".set-selector").change(function () {
	// lock this event from firing multiple times from one action
	if (changingSets && !initializing) {
		// console.log("prevented")
		return;
	}


	$('.crit-text').removeClass('crit-text')
	changingSets = true

	// console.log("set changing")
	setTimeout(function() {
		changingSets = false
	}, 10)
	var fullSetName = $(this).val();
	var pokemonName = fullSetName.substring(0, fullSetName.indexOf(" ("));
	var setName = fullSetName.substring(fullSetName.indexOf("(") + 1, fullSetName.lastIndexOf(")"));

	if (setName != 'Blank Set' && setdex[pokemonName] && typeof setdex[pokemonName][setName] != undefined) {
		currentSetLevel = setdex[pokemonName][setName]["level"]
	}


	if ($(this).hasClass('opposing')) {
		CURRENT_TRAINER_POKS = get_trainer_poks(fullSetName)
		localStorage["right"] = fullSetName
		var sprite = setdex
		var right_max_hp = $("#p2 .max-hp").text()
		$("#p2 .current-hp").val(right_max_hp)//.change()

		movePPs[fullSetName] ||= [];


	} else {
		var left_max_hp = $("#p1 .max-hp").text()		
		$("#p1 .current-hp").val(left_max_hp)//.change()
	}
	


	if ($(this).hasClass('opposing')) {
		if (setdex && setdex[pokemonName]) {
			if (setName != "Blank Set") {
				// var sprite = setdex[pokemonName][setName]["sprite"]
				
				battle_type = setdex[pokemonName][setName]["battle_type"]
				var ai = setdex[pokemonName][setName]["ai_tags"] 
				


				if (CURRENT_TRAINER_POKS && CURRENT_TRAINER_POKS.length > 0 && TITLE.includes("1.3")) {
					
					let orderInfo = emImpOrders[CURRENT_TRAINER_POKS.find(str => str.includes("[0]")).split("[")[0]]



					if (orderInfo) {
						if (orderInfo.next) {
							$(".nav-tag.next").attr('data-next', orderInfo.next).show()
						}
						if (orderInfo.prev) {
							$(".nav-tag.prev").attr('data-next', orderInfo.prev).show()
						}
					} else {
						$('.nav-tag.next, .nav-tag.prev').hide()
					}	
				}

				if (npoint_data.order) {
					let next = null
					let prev = null

					if (npoint_data.order[setdex[pokemonName][setName]["tr_id"]]) {
						next = npoint_data.order[setdex[pokemonName][setName]["tr_id"]].next
						prev = npoint_data.order[setdex[pokemonName][setName]["tr_id"]].prev
					}

					if (next) {
						$(".nav-tag.next").attr('data-next', next).show()
					}

					if (prev) {
						$(".nav-tag.prev").attr('data-next', prev).show()
					}
				}

				if (setdex[pokemonName][setName]["partner"]) {
					$(".nav-tag.partner").show().attr('data-next', setdex[pokemonName][setName]["partner"])
				} else {
					$(".nav-tag.partner").hide()
				}

				$('#ai-tags').html("")
				if (typeof ai != "undefined") {
					for (tag of ai) {
						if (tag == "Ace Pokemon" || tag == "Powerful Status" || tag == "Force Setup First Turn") {
							$('#ai-tags').append(`<div>${tag}</div>`)
						}	
					}
				}
				
				if (!(typeof partnerName != undefined && partnerName != null) && (battle_type == "Singles" || battle_type == undefined || battle_type == "Rotation")) {
					$('#singles-format').click()
				} else {
					$('#doubles-format').click()
				} 

				let enemy_moves = setdex[pokemonName][setName].moves

				$('#filter-move').html(`<option value="All Moves">All Moves</option>`)
				
				for (move of enemy_moves) {
					$('#filter-move').append(`<option value="${move}">${move}</option>`)
				}
			}
		} else {
			$('#trainer-sprite').hide()
		}
		var pokesprite = pokemonName.toLowerCase().replace(" ", "").replace(".","").replace("’","").replace(":","-")

		if (pokesprite.includes("galarian-")) {
			pokesprite = pokesprite.split("galarian-")[1] +  "-galar"
		}

		if (pokesprite.includes("hisuian-")) {
			pokesprite = pokesprite.split("hisuian-")[1] +  "-hisui"
		}

		if ((pokesprite).includes("alolan-")) {
			pokesprite = pokesprite.split("alolan-")[1] +  "-alola"
		}

		$('#p2 .poke-sprite').attr('src', `./img/${trainerSprites}/${pokesprite.replace("-glitched", "")}.${suffix}`)

		if ($('#player-poks-filter:visible').length > 0) {
	       box_rolls() 
	    } 
	} else {
		if (setdex) {
			var pokesprite = pokemonName.toLowerCase().replace(" ", "").replace(".","").replace("’","")
			
			$('#p1 .poke-sprite').attr('src', `./img/${playerSprites}/${pokesprite}.${suffix}`)
			$('#p1 .poke-sprite').addClass('no-flip')

			let abilities = abilsPrimary[pokemonName]
			let uniqAbilities = []

			if (TITLE.includes("1.3") && localStorage.randomized != '1' && localStorage.filterAbilities == '1') {
				// $('#abilityL1').off('change keyup')
				
				if (abilities) {
					abilities = abilities.filter(item => item !== "None");
					uniqAbilities = [...new Set(abilities)]

					// console.log(uniqAbilities)

					let abilOptions = ""
					for (abil of uniqAbilities) {
						abilOptions += `<option value="${abil}">${abil}</option>`
					}
					$('#abilityL1').html(abilOptions)
				} else {
					$('#abilityL1').empty().append($('#abilityR1').html())
				}
				// $('#abilityL1').on('change keyup', detectAutoWeather)
			}
		}
	}



	var pokemon = pokedex[pokemonName];


	if (pokemon) {
		pokeObj = $(this).closest(".poke-info");
		if (stickyMoves.getSelectedSide() === pokeObj.prop("id")) {
			stickyMoves.clearStickyMove();
		}
		pokeObj.find(".analysis").attr("href", smogonAnalysis(pokemonName));


		pokeObj.find(".type1").val(pokemon.types[0]);
		pokeObj.find(".type2").val(pokemon.types[1]);
		pokeObj.find(".hp .base").val(pokemon.bs.hp);
		var i;
		for (i = 0; i < LEGACY_STATS[gen].length; i++) {
			pokeObj.find("." + LEGACY_STATS[gen][i] + " .base").val(pokemon.bs[LEGACY_STATS[gen][i]]);
		}
		pokeObj.find(".boost").val(0);
		pokeObj.find(".percent-hp").val(100);
		// pokeObj.find(".status").val("Healthy").change();


		var moveObj;
		var abilityObj = pokeObj.find(".ability");
		var itemObj = pokeObj.find(".item");
		var randset = undefined;
		var regSets = pokemonName in setdex && setName in setdex[pokemonName];





		$(this).closest('.poke-info').find(".ability-pool").hide();
		$(this).closest('.poke-info').find(".item-pool").hide();

		if (regSets) {
			var set = regSets ? correctHiddenPower(setdex[pokemonName][setName]) : randset;
			

			if (set.level < 1) {
				let lvlCap = parseInt($('#lvl-cap').text()) || parseInt(localStorage.lvlCap)
				pokeObj.find(".level").val(lvlCap + parseInt(set.level));
			} else {
				pokeObj.find(".level").val(set.level);
			}
			


			if (settings.hasEvs) {
				pokeObj.find(".hp .evs").val((set.evs && set.evs.hp !== undefined) ? set.evs.hp : 0);
			}

			

			pokeObj.find(".hp .ivs").val((set.ivs && set.ivs.hp !== undefined) ? set.ivs.hp : 31);
			pokeObj.find(".hp .dvs").val((set.dvs && set.dvs.hp !== undefined) ? set.dvs.hp : 15);
			for (i = 0; i < LEGACY_STATS[gen].length; i++) {
				
				if (settings.hasEvs) {
					pokeObj.find("." + LEGACY_STATS[gen][i] + " .evs").val(
					(set.evs && set.evs[LEGACY_STATS[gen][i]] !== undefined) ?
						set.evs[LEGACY_STATS[gen][i]] : ($("#randoms").prop("checked") ? 84 : 0));
				}

				
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .ivs").val(
					(set.ivs && set.ivs[LEGACY_STATS[gen][i]] !== undefined) ? set.ivs[LEGACY_STATS[gen][i]] : 31);
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .dvs").val(
					(set.dvs && set.dvs[LEGACY_STATS[gen][i]] !== undefined) ? set.dvs[LEGACY_STATS[gen][i]] : 15);
			}
			setSelectValueIfValid(pokeObj.find(".nature"), set.nature, "Hardy");
			var abilityFallback = (typeof pokemon.abilities !== "undefined") ? pokemon.abilities[0] : "";

			setSelectValueIfValid(abilityObj, set.ability, abilityFallback);
			setSelectValueIfValid(itemObj, set.item, "");

			var moves = randset ? selectMovesFromRandomOptions(randset.moves) : set.moves;
			for (i = 0; i < 4; i++) {
				moveObj = pokeObj.find(".move" + (i + 1) + " select.move-selector");
				moveObj.attr('data-prev', moveObj.val());
				setSelectValueIfValid(moveObj, moves[i], "(No Move)");

				if (i == 0) {
					pokeObj.find(".type1").css('border', '')
					if (itemObj.val().includes("Tera ")) {
						pokeObj.find(".type1").css('border', '1px solid #bb86fc')
						pokeObj.find(".type1").val(MOVES_BY_ID[gen][cleanString(moves[i])].type);	
						pokeObj.find(".type2").val("");	
					}
				}

				moveObj.prev().find('.select2-chosen').text(moveObj.val())
				ppObj = null
				
				if (typeof backup_moves != 'undefined' && typeof backup_moves[moves[i]] != 'undefined') {
					ppObj = pokeObj.find(".move" + (i + 1) + " .move-pp");
				}
				showMoveExtras(moveObj, ppObj, fullSetName);
			}
		} else {
			pokeObj.find(".level").val(100);
			pokeObj.find(".hp .evs").val(0);
			pokeObj.find(".hp .ivs").val(31);
			pokeObj.find(".hp .dvs").val(15);
			for (i = 0; i < LEGACY_STATS[gen].length; i++) {
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .evs").val(0);
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .ivs").val(31);
				pokeObj.find("." + LEGACY_STATS[gen][i] + " .dvs").val(15);
			}
			pokeObj.find(".nature").val("Hardy");
			setSelectValueIfValid(abilityObj, pokemon.abilities[0], "");
			// setSelectValueIfValid(abilityObj, pokemon.ab, "Torrent");
			itemObj.val("");
			for (i = 0; i < 4; i++) {
				moveObj = pokeObj.find(".move" + (i + 1) + " select.move-selector");
				moveObj.attr('data-prev', moveObj.val());
				moveObj.val("(No Move)");
				moveObj.change();
			}
			if ($("#randoms").prop("checked")) {
				$(this).closest('.poke-info').find(".move-pool").hide();
			}
		}

		var formeObj = $(this).siblings().find(".forme").parent();
		itemObj.prop("disabled", false);
		var baseForme;
		if (pokemon.baseSpecies && pokemon.baseSpecies !== pokemon.name && !TITLE.includes("Lumi")) {
			baseForme = pokedex[pokemon.baseSpecies];
		}
		if (pokemon.otherFormes) {
			showFormes(formeObj, pokemonName, pokemon, pokemonName);
		} else if (baseForme && baseForme.otherFormes) {
			showFormes(formeObj, pokemonName, baseForme, pokemon.baseSpecies);
		} else {
			formeObj.hide();
		}
		
		calcHP(pokeObj);
		calcStats(pokeObj);
		showAbilityExtras(abilityObj);
		abilityObj.trigger('recalc')
		showItemExtras();
		if (pokemon.gender === "N") {
			pokeObj.find(".gender").parent().hide();
			pokeObj.find(".gender").val("");
		} else pokeObj.find(".gender").parent().show();

		if (typeof setdex[pokemonName] != "undefined" && typeof setdex[pokemonName][setName] != "undefined" && setdex[pokemonName][setName]["status"]) {
			pokeObj.find(".status").val(setdex[pokemonName][setName]["status"])//.change();
		} else {
			pokeObj.find(".status").val("Healthy")//.change();
		}
		
	}

	// if (typeof partnerName != undefined && partnerName != null) {
	// 	$('#doubles-format').click()	
	// }

	// don't get new switch ins if set was the same
	
	if (fullSetName != lastSetName) {
		refresh_next_in()
	} else {
		return
	}
	lastSetName = fullSetName



	if ($(this).hasClass('opposing')) {
		let trainerName = getTrainerName(fullSetName)
		let currentPartyData = getPartyData()

		if (trainerName != lastAiTrainerName || currentPartyData.length < 6) {
			lastAiTrainerName = getTrainerName(fullSetName)
			consecutiveSetChangesOnAiTrainer = 0;
		} else {
			if (deepEqualJSON(currentPartyData, lastPartyData)) {
				consecutiveSetChangesOnAiTrainer++;
			} else {
				lastPartyData = currentPartyData
				consecutiveSetChangesOnAiTrainer = 0;
			}			
		}
	}
	if (consecutiveSetChangesOnAiTrainer >= 4) {
		let newSnapshot = getSnapshot()
		if (!deepEqualJSON(newSnapshot, lastSentSnapshot)) {
			if (localStorage.enableAnalytics == '1' && localStorage.randomized != '1') {	
				submitCurrentSnapshot().then(console.log);
			}
		} 
	}



	// end = performance.now()
	// console.log(`Execution time: ${end - start} ms`);
});

function highlightMoves() {
	if (localStorage.highlightMoves == '1') {
		let p1Hp = parseInt($('#p1 .percent-hp').val())
		let critMult = settings.critGen > 5 ? 1.5 : 2
		if (localStorage.highlightMoves) {
			for (let idx of [1,2,3,4]) {
				let resultText = $(`#resultDamageR${idx}`).text()
				$(`#resultDamageR${idx}`).css('border', '')
				if (resultText.includes(" - ")) {
					let highRoll = parseInt(resultText.split(" - ")[1].replace("%", ""))

					if (highRoll * critMult >= p1Hp) {
						$(`#resultDamageR${idx}`).css('border', '1px solid rgba(241,250,140,0.8)')
					} 
					if (highRoll >= p1Hp) {
						$(`#resultDamageR${idx}`).css('border', '1px solid rgba(255,85,85,0.8)')
					} 
				}
			}
		}	
	}
	
}

function formatMovePool(moves) {
	var formatted = [];
	for (var i = 0; i < moves.length; i++) {
		formatted.push(isKnownDamagingMove(moves[i]) ? moves[i] : '<i>' + moves[i] + '</i>');
	}
	return formatted.join(', ');
}

function isKnownDamagingMove(move) {
	var m = GENERATION.moves.get(calc.toID(move));
	return m && m.basePower;
}

function selectMovesFromRandomOptions(moves) {
	var selected = [];

	var nonDamaging = [];
	for (var i = 0; i < moves.length; i++) {
		if (isKnownDamagingMove(moves[i])) {
			selected.push(moves[i]);
			if (selected.length >= 4) break;
		} else {
			nonDamaging.push(moves[i]);
		}
	}

	while (selected.length < 4 && nonDamaging.length) {
		selected.push(nonDamaging.pop());
	}

	return selected;
}

function showFormes(formeObj, pokemonName, pokemon, baseFormeName) {
	var formes = pokemon.otherFormes.slice();
	formes.unshift(baseFormeName);

	var defaultForme = formes.indexOf(pokemonName);
	if (defaultForme < 0) defaultForme = 0;

	var formeOptions = getSelectOptions(formes, false, defaultForme);
	formeObj.children("select").find("option").remove().end().append(formeOptions)//.change();
	formeObj.show();
}

function setSelectValueIfValid(select, value, fallback) {
	select.val(!value ? fallback : select.children(`option[value="${value}"]`).length ? value : fallback);
}

$(".forme").change(function () {
	var altForme = pokedex[$(this).val()],
		container = $(this).closest(".info-group").siblings(),
		fullSetName = container.find(".select2-chosen").first().text(),
		pokemonName = fullSetName.substring(0, fullSetName.indexOf(" (")),
		setName = fullSetName.substring(fullSetName.indexOf("(") + 1, fullSetName.lastIndexOf(")"));

	$(this).parent().siblings().find(".type1").val(altForme.types[0]);
	$(this).parent().siblings().find(".type2").val(altForme.types[1] ? altForme.types[1] : "");
	for (var i = 0; i < LEGACY_STATS[8].length; i++) {
		var baseStat = container.find("." + LEGACY_STATS[8][i]).find(".base");
		baseStat.val(altForme.bs[LEGACY_STATS[8][i]]);
		baseStat.keyup();
	}
	var pokemonSets = setdex[pokemonName];
	var chosenSet = pokemonSets && pokemonSets[setName];
	var greninjaSet = $(this).val().indexOf("Greninja") !== -1;
	var isAltForme = $(this).val() !== pokemonName;
	if (chosenSet) {
		let abilityFallback = pokedex[pokemonName].abilities[0];
		setSelectValueIfValid(container.find(".ability"), chosenSet.ability, abilityFallback);
	} else if (isAltForme && abilities.indexOf(altForme.abilities[0]) !== -1 && !greninjaSet) {
		container.find(".ability").val(altForme.abilities[0]);
	} else if (greninjaSet) {
		$(this).parent().find(".ability");
	}
	container.find(".ability").keyup();

	if ($(this).val().indexOf("-Mega") !== -1 && $(this).val() !== "Rayquaza-Mega") {
		container.find(".item").val("").keyup();
	} else {
		container.find(".item").prop("disabled", false);
	}
});

function correctHiddenPower(pokemon) {
	return pokemon
	// After Gen 7 bottlecaps means you can have a HP without perfect IVs
	if (gen >= 7 && pokemon.level >= 100) return pokemon;

	// Convert the legacy stats table to a useful one, and also figure out if all are maxed
	var ivs = {};
	var maxed = true;
	for (var i = 0; i <= LEGACY_STATS[8].length; i++) {
		var s = LEGACY_STATS[8][i];
		var iv = ivs[legacyStatToStat(s)] = (pokemon.ivs && pokemon.ivs[s]) || 31;
		if (iv !== 31) maxed = false;
	}

	var expected = calc.Stats.getHiddenPower(GENERATION, ivs, trueHP);
	for (var i = 0; i < pokemon.moves.length; i++) {
		var m = pokemon.moves[i].match(HIDDEN_POWER_REGEX);
		if (!m) continue;
		// The Pokemon has Hidden Power and is not maxed but the types don't match we don't
		// want to attempt to reconcile the user's IVs so instead just correct the HP type
		if (!maxed && expected.type !== m[1]) {
			pokemon.moves[i] = "Hidden Power " + expected.type;
		} else {
			// Otherwise, use the default preset hidden power IVs that PS would use
			var hpIVs = calc.Stats.getHiddenPowerIVs(GENERATION, m[1]);
			if (!hpIVs) continue; // some impossible type was specified, ignore

			pokemon.ivs = pokemon.ivs || {hp: 31, at: 31, df: 31, sa: 31, sd: 31, sp: 31};
			pokemon.dvs = pokemon.dvs || {hp: 15, at: 15, df: 15, sa: 15, sd: 15, sp: 15};
			for (var stat in hpIVs) {
				pokemon.ivs[calc.Stats.shortForm(stat)] = hpIVs[stat];
				pokemon.dvs[calc.Stats.shortForm(stat)] = calc.Stats.IVToDV(hpIVs[stat]);
			}
			if (gen < 3) {
				pokemon.dvs.hp = calc.Stats.getHPDV({
					atk: pokemon.ivs.at,
					def: pokemon.ivs.df,
					spe: pokemon.ivs.sp,
					spc: pokemon.ivs.sa
				});
				pokemon.ivs.hp = calc.Stats.DVToIV(pokemon.dvs.hp);
			}
		}
	}
	return pokemon;
}

function autosetQP(pokemon) {
	var currentWeather = $("input:radio[name='weather']:checked").val();
	var currentTerrain = $("input:checkbox[name='terrain']:checked").val() || "No terrain";

	var item = pokemon.find(".item").val();
	var ability = pokemon.find(".ability").val();
	var boostedStat = pokemon.find(".boostedStat").val();

	if (!boostedStat || boostedStat === "auto") {
		if (
			(item === "Booster Energy") ||
			(ability === "Protosynthesis" && currentWeather === "Sun") ||
			(ability === "Quark Drive" && currentTerrain === "Electric")
		) {
			pokemon.find(".boostedStat").val("auto");
		} else {
			pokemon.find(".boostedStat").val("");
		}
	}
}



function createPokemon(pokeInfo, customMoves=false, ignoreStatMods=false) {
	if (typeof pokeInfo === "string") { // in this case, pokeInfo is the id of an individual setOptions value whose moveset's tier matches the selected tier(s)
		var name = pokeInfo.substring(0, pokeInfo.indexOf(" ("));
		var setName = pokeInfo.substring(pokeInfo.indexOf("(") + 1, pokeInfo.lastIndexOf(")"));
		var set = setdex[name][setName];


		var ivs = {};
		var evs = {};
		for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
			var legacyStat = LEGACY_STATS[gen][i];
			var stat = legacyStatToStat(legacyStat);

			ivs[stat] = (gen >= 3 && set.ivs && typeof set.ivs[legacyStat] !== "undefined") ? set.ivs[legacyStat] : 31;
			evs[stat] = (set.evs && typeof set.evs[legacyStat] !== "undefined") ? set.evs[legacyStat] : 0;
		}

		var pokemonMoves = [];
		for (var i = 0; i < 4; i++) {

			moveName = set.moves[i];
			var pokmove = new calc.Move(gen, moves[moveName] ? moveName : "(No Move)", {ability: ability, item: item})
			pokemonMoves.push(pokmove);
		}

		let tmpLvl = set.level

		if ((parseInt(set.level) < 1 || typeof set.sublevel != "undefined")) {
			if (lvlCap != "") {
				tmpLvl = lvlCap + set.sublevel
			} else {
				tmpLvl = parseInt($('#levelR1').val()) + set.sublevel
			}
			set.level = tmpLvl	
			// console.log(`adjusting ${name} to level ${tmpLvl} for pokemon creation`)
		}

		let status = ''

		if (set.status == 'Badly Poisoned') {
			status = 'tox'
		} else if (set.status == 'Frozen') {
			status = 'frz'
		} else if (set.status == 'Burned') {
			status = 'brn'
		}
		
		return new calc.Pokemon(gen, name, {
			level: tmpLvl,
			ability: set.ability,
			abilityOn: true,
			item: set.item || "",
			nature: set.nature,
			ivs: ivs,
			evs: evs,
			moves: pokemonMoves,
			status: status
		});
	} else {
		var setName = pokeInfo.find("input.set-selector").val();
		var name;

		if (setName.indexOf("(") === -1) {
			name = setName;
		} else {
			var pokemonName = setName.substring(0, setName.indexOf(" (")).replace("n Z", "n-Z").replace("o o", "o-o");
			
			var species = pokedex[pokemonName];
			name = (species.otherFormes || (species.baseSpecies && species.baseSpecies !== pokemonName)) ? pokeInfo.find(".forme").val() : pokemonName;
			if (TITLE.includes("Lumi")) {
				name = pokemonName
			}
		}
		var baseStats = {};
		var ivs = {};
		var evs = {};
		var boosts = {};
		
		
		if (false) {
			var stat_abvs = {"hp": "hp", "atk": "at", "def": "df", "spa": "sa", "spd": "sd", "spe": "sp"}
			for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
				var stat = legacyStatToStat(LEGACY_STATS[gen][i]);
				baseStats[stat === 'spc' ? 'spa' : stat] = pokedex['Rotom']['bs'][stat_abvs[stat]];
				~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .base").val(pokedex['Rotom']['bs'][stat_abvs[stat]])
				ivs[stat] = gen > 2 ? ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .ivs").val() : ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .dvs").val() * 2 + 1;
				evs[stat] = ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .evs").val();
				boosts[stat] = ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .boost").val();
			}
		} else {
			for (var i = 0; i < LEGACY_STATS[gen].length; i++) {
				var stat = legacyStatToStat(LEGACY_STATS[gen][i]);
				baseStats[stat === 'spc' ? 'spa' : stat] = ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .base").val();
				ivs[stat] = gen > 2 ? ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .ivs").val() : ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .dvs").val() * 2 + 1;
				evs[stat] = ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .evs").val();
				boosts[stat] = ~~pokeInfo.find("." + LEGACY_STATS[gen][i] + " .boost").val();
			}
		}



		if (ignoreStatMods) {
			boosts = {};
		}





		
		if (gen === 1) baseStats.spd = baseStats.spa;

		var ability = pokeInfo.find(".ability").val();
		var item = pokeInfo.find(".item").val();
		var isDynamaxed = pokeInfo.find(".max").prop("checked");
		pokeInfo.isDynamaxed = isDynamaxed;
		calcHP(pokeInfo);
		var curHP = ~~pokeInfo.find(".current-hp").val();
		// FIXME the Pokemon constructor expects non-dynamaxed HP
		if (isDynamaxed) curHP = Math.floor(curHP / 2);
		var types = [pokeInfo.find(".type1").val(), pokeInfo.find(".type2").val()];
		
		if (customMoves) {
			var move1 = customMoves[0]
			var move2 = customMoves[1]
			var move3 = customMoves[2]
			var move4 = customMoves[3]
		} 

		return new calc.Pokemon(gen, name, {
			level: ~~pokeInfo.find(".level").val(),
			ability: ability,
			abilityOn: pokeInfo.find(".abilityToggle").is(":checked"),
			item: item,
			gender: pokeInfo.find(".gender").is(":visible") ? getGender(pokeInfo.find(".gender").val()) : "N",
			nature: pokeInfo.find(".nature").val(),
			ivs: ivs,
			evs: evs,
			isDynamaxed: isDynamaxed,
			alliesFainted: parseInt(pokeInfo.find(".alliesFainted").val()),
			boostedStat: pokeInfo.find(".boostedStat:visible").val() || undefined,
			boosts: boosts,
			curHP: curHP,
			status: CALC_STATUS[pokeInfo.find(".status").val()],
			toxicCounter: status === 'Badly Poisoned' ? ~~pokeInfo.find(".toxic-counter").val() : 0,
			moves: [
				getMoveDetails(pokeInfo.find(".move1"), name, ability, item, isDynamaxed, move1),
				getMoveDetails(pokeInfo.find(".move2"), name, ability, item, isDynamaxed, move2),
				getMoveDetails(pokeInfo.find(".move3"), name, ability, item, isDynamaxed, move3),
				getMoveDetails(pokeInfo.find(".move4"), name, ability, item, isDynamaxed, move4)
			],
			overrides: {
				baseStats: baseStats,
				types: types
			}
		});
	}
}

function getGender(gender) {
	if (!gender || gender === 'genderless' || gender === 'N') return 'N';
	if (gender.toLowerCase() === 'male' || gender === 'M') return 'M';
	return 'F';
}

function getMoveDetails(moveInfo, species, ability, item, useMax, moveName=false) {
	if (moveName) {

	} else {
		var moveName = moveInfo.find("select.move-selector").val();
	}

	
	var isZMove = gen > 6 && moveInfo.find("input.move-z").prop("checked");
	var isCrit = moveInfo.find(".move-crit").prop("checked");

	if (limitHits) {
		var hits = 1
		// console.log("limit")
	} else {
		var hits = +moveInfo.find(".move-hits").val();
	}
	var timesUsed = +moveInfo.find(".stat-drops").val();
	var timesUsedWithMetronome = moveInfo.find(".metronome").is(':visible') ? +moveInfo.find(".metronome").val() : 1;
	
	if (moveName != moveInfo.find("select.move-selector").val() || moveName.includes("Hidden Power")) {
		var overrides = {}
	} else {
		var overrides = {
			basePower: +moveInfo.find(".move-bp").val(),
			type: moveInfo.find(".move-type").val()
		};
	}
	
	if (gen >= 4) overrides.category = moveInfo.find(".move-cat").val();
	return new calc.Move(gen, moveName, {
		ability: ability, item: item, useZ: isZMove, species: species, isCrit: isCrit, hits: hits,
		timesUsed: timesUsed, timesUsedWithMetronome: timesUsedWithMetronome, overrides: overrides, useMax: useMax
	});
}

function createField() {
	var gameType = $("input:radio[name='format']:checked").val();
	var isMagicRoom = $("#magicroom").prop("checked");
	var isWonderRoom = $("#wonderroom").prop("checked");
	var isGravity = $("#gravity").prop("checked");
	var isTabletsOfRuin = $('#tablets-of-ruin').prop("checked");
	var isBeadsOfRuin = $('#beads-of-ruin').prop("checked");
	var isVesselOfRuin = $('#vessel-of-ruin').prop("checked");
	var isSwordOfRuin = $('#sword-of-ruin').prop("checked");
	var isSR = [$("#srL").prop("checked"), $("#srR").prop("checked")];
	var weather;
	var spikes;
	if (gen === 2) {
		spikes = [$("#gscSpikesL").prop("checked") ? 1 : 0, $("#gscSpikesR").prop("checked") ? 1 : 0];
		weather = $("input:radio[name='gscWeather']:checked").val();
	} else {
		weather = $("input:radio[name='weather']:checked").val();
		spikes = [~~$("input:radio[name='spikesL']:checked").val(), ~~$("input:radio[name='spikesR']:checked").val()];
	}
	var steelsurge = [$("#steelsurgeL").prop("checked"), $("#steelsurgeR").prop("checked")];
	var vinelash = [$("#vinelashL").prop("checked"), $("#vinelashR").prop("checked")];
	var wildfire = [$("#wildfireL").prop("checked"), $("#wildfireR").prop("checked")];
	var cannonade = [$("#cannonadeL").prop("checked"), $("#cannonadeR").prop("checked")];
	var volcalith = [$("#volcalithL").prop("checked"), $("#volcalithR").prop("checked")];
	var terrain = ($("input:checkbox[name='terrain']:checked").val()) ? $("input:checkbox[name='terrain']:checked").val() : "";
	var isReflect = [$("#reflectL").prop("checked"), $("#reflectR").prop("checked")];
	var isLightScreen = [$("#lightScreenL").prop("checked"), $("#lightScreenR").prop("checked")];
	var isProtected = [$("#protectL").prop("checked"), $("#protectR").prop("checked")];
	var isSeeded = [$("#leechSeedL").prop("checked"), $("#leechSeedR").prop("checked")];
	var isForesight = [$("#foresightL").prop("checked"), $("#foresightR").prop("checked")];
	var isHelpingHand = [$("#helpingHandL").prop("checked"), $("#helpingHandR").prop("checked")];
	var isTailwind = [$("#tailwindL").prop("checked"), $("#tailwindR").prop("checked")];
	var isFriendGuard = [$("#friendGuardL").prop("checked"), $("#friendGuardR").prop("checked")];
	var isAuroraVeil = [$("#auroraVeilL").prop("checked"), $("#auroraVeilR").prop("checked")];
	var isBattery = [$("#batteryL").prop("checked"), $("#batteryR").prop("checked")];
	var isPowerSpot = [$("#powerSpotL").prop("checked"), $("#powerSpotR").prop("checked")];
	var isFlowerGift = [$("#flowerGiftL").prop("checked"), $("#flowerGiftR").prop("checked")];
	
	var is10Buff = [$("#is10BuffL").prop("checked"), $("#is10BuffR").prop("checked")];
	var is15Buff = [$("#is15BuffL").prop("checked"), $("#is15BuffR").prop("checked")];
	var is20Buff = [$("#is20BuffL").prop("checked"), $("#is20BuffR").prop("checked")];
	var is25Buff = [$("#is25BuffL").prop("checked"), $("#is25BuffR").prop("checked")];
	var is30Buff = [$("#is30BuffL").prop("checked"), $("#is30BuffR").prop("checked")];
	var is50Buff = [$("#is50BuffL").prop("checked"), $("#is50BuffR").prop("checked")];
	// TODO: support switching in as well!
	var isSwitchingOut = [$("#switchingL").prop("checked"), $("#switchingR").prop("checked")];

	var isBadgeAtk = [$("#AtkL").prop("checked"), $("#AtkR").prop("checked")];
	var isBadgeSpec = [$("#SpecL").prop("checked"), $("#SpecR").prop("checked")];
	var isBadgeDef = [$("#DefL").prop("checked"), $("#DefR").prop("checked")];
	var isBadgeSpeed = [$("#SpeL").prop("checked"), $("#SpeR").prop("checked")];

	var createSide = function (i) {
		return new calc.Side({
			spikes: spikes[i], isSR: isSR[i], steelsurge: steelsurge[i],
			vinelash: vinelash[i], wildfire: wildfire[i], cannonade: cannonade[i], volcalith: volcalith[i],
			isReflect: isReflect[i], isLightScreen: isLightScreen[i],
			isProtected: isProtected[i], isSeeded: isSeeded[i], isForesight: isForesight[i], isFlowerGift: isFlowerGift[i],
			isTailwind: isTailwind[i], isHelpingHand: isHelpingHand[i], isFriendGuard: isFriendGuard[i], isBadgeAtk: isBadgeAtk[i],isBadgeSpec: isBadgeSpec[i], isBadgeDef: isBadgeDef[i], isBadgeSpeed: isBadgeSpeed[i],
			isAuroraVeil: isAuroraVeil[i], isBattery: isBattery[i], isPowerSpot: isPowerSpot[i], isSwitching: isSwitchingOut[i], is10Buff: is10Buff[i], is15Buff: is15Buff[i], is20Buff: is20Buff[i], is25Buff: is25Buff[i], is30Buff: is30Buff[i], is50Buff: is50Buff[i] ? 'out' : undefined
		});
	};
	// console.log(is10Buff)
	return new calc.Field({
		gameType: gameType, weather: weather, terrain: terrain, isMagicRoom: isMagicRoom, isWonderRoom: isWonderRoom, isGravity: isGravity,
		isTabletsOfRuin: isTabletsOfRuin, isBeadsOfRuin: isBeadsOfRuin, isVesselOfRuin: isVesselOfRuin, isSwordOfRuin: isSwordOfRuin,
		attackerSide: createSide(0), defenderSide: createSide(1)
	});
}

function calcHP(poke) {
	var total = calcStat(poke, "hp");
	var $maxHP = poke.find(".max-hp");

	if (!total) {
		total = parseInt($maxHP.text())
	}

	var prevMaxHP = Number($maxHP.attr('data-prev')) || total;
	var $currentHP = poke.find(".current-hp");
	var prevCurrentHP = $currentHP.attr('data-set') ? Math.min(Number($currentHP.val()), prevMaxHP) : prevMaxHP;
	// NOTE: poke.find(".percent-hp").val() is a rounded value!
	var prevPercentHP = 100 * prevCurrentHP / prevMaxHP;

	$maxHP.text(total);
	$maxHP.attr('data-prev', total);

	var newCurrentHP = calcCurrentHP(poke, total, prevPercentHP);
	calcPercentHP(poke, total, newCurrentHP);

	$currentHP.attr('data-set', true);
}

function calcStat(poke, StatID) {
	var stat = poke.find("." + StatID);
	var base = ~~stat.find(".base").val();
	var level = ~~poke.find(".level").val();
	var nature, ivs, evs;
	if (gen < 3) {
		ivs = ~~stat.find(".dvs").val() * 2;
		evs = 252;
	} else {
		ivs = ~~stat.find(".ivs").val();
		evs = ~~stat.find(".evs").val();
		if (StatID !== "hp") nature = poke.find(".nature").val();
	}
	// Shedinja still has 1 max HP during the effect even if its Dynamax Level is maxed (DaWoblefet)
	var total = calc.calcStat(gen, legacyStatToStat(StatID), base, ivs, evs, level, nature);
	if (gen > 7 && StatID === "hp" && poke.isDynamaxed && total !== 1) {
		total *= 2;
	}

	stat.find(".total").text(total);
	// if (StatID == "at") {
	// 	console.log(`${StatID} ${total}`)
	// }
	
	return total;
}

var GENERATION = {
	'1': 1, 'rb': 1, 'rby': 1,
	'2': 2, 'gs': 2, 'gsc': 2,
	'3': 3, 'rs': 3, 'rse': 3, 'frlg': 3, 'adv': 3,
	'4': 4, 'dp': 4, 'dpp': 4, 'hgss': 4,
	'5': 5, 'bw': 5, 'bw2': 5, 'b2w2': 5,
	'6': 6, 'xy': 6, 'oras': 6,
	'7': 7, 'sm': 7, 'usm': 7, 'usum': 7,
	'8': 8, 'ss': 8
};

var SETDEX = [
	{},
	typeof SETDEX_RBY === 'undefined' ? {} : SETDEX_RBY,
	typeof SETDEX_GSC === 'undefined' ? {} : SETDEX_GSC,
	typeof SETDEX_ADV === 'undefined' ? {} : SETDEX_ADV,
	typeof SETDEX_DPP === 'undefined' ? {} : SETDEX_DPP,
	typeof setdex === 'undefined' ? {} : setdex,
	typeof SETDEX_XY === 'undefined' ? {} : SETDEX_XY,
	typeof SETDEX_SM === 'undefined' ? {} : SETDEX_SM,
	typeof SETDEX_SS === 'undefined' ? {} : SETDEX_SS,
];
var RANDDEX = [
	{},
	typeof GEN1RANDOMBATTLE === 'undefined' ? {} : GEN1RANDOMBATTLE,
	typeof GEN2RANDOMBATTLE === 'undefined' ? {} : GEN2RANDOMBATTLE,
	typeof GEN3RANDOMBATTLE === 'undefined' ? {} : GEN3RANDOMBATTLE,
	typeof GEN4RANDOMBATTLE === 'undefined' ? {} : GEN4RANDOMBATTLE,
	typeof GEN5RANDOMBATTLE === 'undefined' ? {} : GEN5RANDOMBATTLE,
	typeof GEN6RANDOMBATTLE === 'undefined' ? {} : GEN6RANDOMBATTLE,
	typeof GEN7RANDOMBATTLE === 'undefined' ? {} : GEN7RANDOMBATTLE,
	typeof GEN8RANDOMBATTLE === 'undefined' ? {} : GEN8RANDOMBATTLE,
];
var gen, genWasChanged, notation, pokedex, setdex, randdex, typeChart, moves, abilities, items, calcHP, calcStat, GENERATION;
$(".gen").change(function () {
	/*eslint-disable */
	gen = ~~$(this).val() || 8;
	GENERATION = calc.Generations.get(gen);
	genWasChanged = true;
	/* eslint-enable */
	// declaring these variables with var here makes z moves not work; TODO
	
	randdex = RANDDEX[gen];
	typeChart = calc.TYPE_CHART[gen];
	
	items = calc.ITEMS[gen];
	abilities = calc.ABILITIES[gen];

	if (!DEFAULTS_LOADED) {
		pokedex = calc.SPECIES[gen];
		setdex = SETDEX[gen];
		if (TITLE == "Ancestral X")
			moves = calc.MOVES[6];
		else
			moves = calc.MOVES[9];
		DEFAULTS_LOADED = true
	}

	clearField();
	$("#importedSets").prop("checked", false);
	$(".gen-specific.g" + gameGen).show();
	$(".gen-specific").not(".g" + gameGen).hide();
	var typeOptions = getSelectOptions(Object.keys(typeChart));
	$("select.type1, select.move-type").find("option").remove().end().append(typeOptions);
	$("select.type2").find("option").remove().end().append("<option value=\"\">(none)</option>" + typeOptions);
	var moveOptions = getSelectOptions(Object.keys(moves), true);
	$("select.move-selector").find("option").remove().end().append(moveOptions);
	var abilityOptions = getSelectOptions(abilities, true);
	$("select.ability").find("option").remove().end().append("<option value=\"\">(other)</option>" + abilityOptions);
	var itemOptions = getSelectOptions(items, true);
	$("select.item").find("option").remove().end().append("<option value=\"\">(none)</option>" + itemOptions);
});

function getFirstValidSetOption(side="left") {
	var sets = getSetOptions();

	if (localStorage[side]) {
		var setData = {}
		setData["pokemon"] = localStorage[side].split(" (")[0]
		setData["set"] = localStorage[side].split(" (")[1].split(")")[0]
		setData["nickname"] = ""
		setData["text"] = localStorage[side]
		setData["id"] = localStorage[side]
		return setData
	} 

	return undefined;
}

$(".notation").change(function () {
	notation = $(this).val();
});

function clearField() {
	$("#singles-format").prop("checked", false);
	$("#doubles-format").prop("checked", true);
	$("#clear").prop("checked", true);
	$("#clear-cascade").prop("checked", true);
	$("#gscClear").prop("checked", true);
	$("#gravity").prop("checked", false);
	$("#srL").prop("checked", false);
	$("#srR").prop("checked", false);
	$("#spikesL0").prop("checked", true);
	$("#spikesR0").prop("checked", true);
	$("#is0BuffL").prop("checked", true);
	$("#is0BuffR").prop("checked", true);
	$("#gscSpikesL").prop("checked", false);
	$("#gscSpikesR").prop("checked", false);
	$("#steelsurgeL").prop("checked", false);
	$("#steelsurgeR").prop("checked", false);
	$("#vinelashL").prop("checked", false);
	$("#vinelashR").prop("checked", false);
	$("#wildfireL").prop("checked", false);
	$("#wildfireR").prop("checked", false);
	$("#cannonadeL").prop("checked", false);
	$("#cannonadeR").prop("checked", false);
	$("#volcalithL").prop("checked", false);
	$("#volcalithR").prop("checked", false);
	$("#reflectL").prop("checked", false);
	$("#reflectR").prop("checked", false);
	$("#lightScreenL").prop("checked", false);
	$("#lightScreenR").prop("checked", false);
	$("#protectL").prop("checked", false);
	$("#protectR").prop("checked", false);
	$("#leechSeedL").prop("checked", false);
	$("#leechSeedR").prop("checked", false);
	$("#foresightL").prop("checked", false);
	$("#foresightR").prop("checked", false);
	$("#helpingHandL").prop("checked", false);
	$("#helpingHandR").prop("checked", false);
	$("#tailwindL").prop("checked", false);
	$("#tailwindR").prop("checked", false);
	$("#friendGuardL").prop("checked", false);
	$("#friendGuardR").prop("checked", false);
	$("#auroraVeilL").prop("checked", false);
	$("#auroraVeilR").prop("checked", false);
	$("#batteryL").prop("checked", false);
	$("#batteryR").prop("checked", false);
	$("#switchingL").prop("checked", false);
	$("#switchingR").prop("checked", false);
	$("input:checkbox[name='terrain']").prop("checked", false);
}

function getSetOptions(sets) {
	var setsHolder = sets;
	if (setsHolder === undefined) {
		setsHolder = pokedex;
	}
	var pokeNames = Object.keys(setsHolder);
	pokeNames.sort();
	var setOptions = [];
	for (var i = 0; i < pokeNames.length; i++) {
		var pokeName = pokeNames[i];
		setOptions.push({
			pokemon: pokeName,
			text: pokeName
		});
		if (pokeName in setdex) {
			var setNames = Object.keys(setdex[pokeName]);
			for (var j = 0; j < setNames.length; j++) {
				var setName = setNames[j];
				setOptions.push({
					pokemon: pokeName,
					set: setName,
					text: pokeName + " (" + setName + ")",
					id: pokeName + " (" + setName + ")",
					isCustom: setdex[pokeName][setName].isCustomSet,
					nickname: setdex[pokeName][setName].nickname || ""
				});
			}
		}
		setOptions.push({
			pokemon: pokeName,
			set: "Blank Set",
			text: pokeName + " (Blank Set)",
			id: pokeName + " (Blank Set)"
		});

	}
	return setOptions;
}

function getSelectOptions(arr, sort, defaultOption) {
	if (sort) {
		arr.sort();
	}
	var r = '';
	for (var i = 0; i < arr.length; i++) {
		r += '<option value="' + arr[i] + '" ' + (defaultOption === i ? 'selected' : '') + '>' + arr[i] + '</option>';
	}
	return r;
}
var stickyMoves = (function () {
	var lastClicked = 'resultMoveL1';
	$(".result-move").click(function () {
		if (this.id === lastClicked) {
			$(this).toggleClass("locked-move");
		} else {
			$('.locked-move').removeClass('locked-move');
		}
		lastClicked = this.id;
	});

	return {
		clearStickyMove: function () {
			lastClicked = null;
			$('.locked-move').removeClass('locked-move');
		},
		setSelectedMove: function (slot) {
			lastClicked = slot;
		},
		getSelectedSide: function () {
			if (lastClicked) {
				if (lastClicked.indexOf('resultMoveL') !== -1) {
					return 'p1';
				} else if (lastClicked.indexOf('resultMoveR') !== -1) {
					return 'p2';
				}
			}
			return null;
		}
	};
})();

function isPokeInfoGrounded(pokeInfo) {
	return $("#gravity").prop("checked") || (
		pokeInfo.find(".type1").val() !== "Flying" &&
        pokeInfo.find(".type2").val() !== "Flying" &&
        pokeInfo.find(".ability").val() !== "Levitate" &&
        pokeInfo.find(".item").val() !== "Air Balloon"
	);
}

function getTerrainEffects() {
	var className = $(this).prop("className");
	className = className.substring(0, className.indexOf(" "));
	switch (className) {
	case "type1":
	case "type2":
	case "item":
		var id = $(this).closest(".poke-info").prop("id");
		var terrainValue = $("input:checkbox[name='terrain']:checked").val();
		if (terrainValue === "Electric") {
			$("#" + id).find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#" + id)));
		} else if (terrainValue === "Misty") {
			$("#" + id).find(".status").prop("disabled", isPokeInfoGrounded($("#" + id)));
		}
		break;
	case "ability":
		// with autoset, ability change may cause terrain change, need to consider both sides
		var terrainValue = $("input:checkbox[name='terrain']:checked").val();
		if (terrainValue === "Electric") {
			$("#p1").find(".status").prop("disabled", false);
			$("#p2").find(".status").prop("disabled", false);
			$("#p1").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p2")));
		} else if (terrainValue === "Misty") {
			$("#p1").find(".status").prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find(".status").prop("disabled", isPokeInfoGrounded($("#p2")));
		} else {
			$("#p1").find("[value='Asleep']").prop("disabled", false);
			$("#p1").find(".status").prop("disabled", false);
			$("#p2").find("[value='Asleep']").prop("disabled", false);
			$("#p2").find(".status").prop("disabled", false);
		}
		break;
	default:
		$("input:checkbox[name='terrain']").not(this).prop("checked", false);
		if ($(this).prop("checked") && $(this).val() === "Electric") {
			// need to enable status because it may be disabled by Misty Terrain before.
			$("#p1").find(".status").prop("disabled", false);
			$("#p2").find(".status").prop("disabled", false);
			$("#p1").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find("[value='Asleep']").prop("disabled", isPokeInfoGrounded($("#p2")));
		} else if ($(this).prop("checked") && $(this).val() === "Misty") {
			$("#p1").find(".status").prop("disabled", isPokeInfoGrounded($("#p1")));
			$("#p2").find(".status").prop("disabled", isPokeInfoGrounded($("#p2")));
		} else {
			$("#p1").find("[value='Asleep']").prop("disabled", false);
			$("#p1").find(".status").prop("disabled", false);
			$("#p2").find("[value='Asleep']").prop("disabled", false);
			$("#p2").find(".status").prop("disabled", false);
		}
		break;
	}
}

function allPokemon(selector) {
	var allSelector = "";
	for (var i = 0; i < $(".poke-info").length; i++) {
		if (i > 0) {
			allSelector += ", ";
		}
		allSelector += "#p" + (i + 1) + " " + selector;
	}
	return allSelector;
}


var g = settings.gen

$(document).ready(function () {
	

	if (!settings.damageGen) {
		settings.damageGen = Math.min(parseInt(g),5)
	} 

	if (settings.damageGen <= 5 && settings.switchIn < 10 && TITLE != "Platinum Redux 2.6" || TITLE.includes("Lumi")) {
		trainerSprites = "front"
		playerSprites = "back"
		suffix = "gif"
	} else {
		trainerSprites = "front"
		playerSprites = "back"
		$('.poke-sprite').css('background', 'none')
		suffix = "gif"
	}
	console.log(`Initializing Calc with moves from gen ${g} and mechanics from gen ${settings.damageGen}`)
	$("#gen" + g).prop("checked", true);
	$("#gen" + g).change();
	$("#percentage").prop("checked", true);
	$("#percentage").change();
	loadDefaultLists();
	$(".move-selector").select2({
		dropdownAutoWidth: true,
		matcher: function (term, text) {
			// 2nd condition is for Hidden Power
			return text.toUpperCase().indexOf(term.toUpperCase()) === 0 || text.toUpperCase().indexOf(" " + term.toUpperCase()) >= 0;
		}
	});

    if (localStorage["left"]) {
        $(`[data-id='${localStorage["left"]}']`).click()
    }    

    if (localStorage["right"]) {
      var set = localStorage["right"]
      $('.opposing').val(set)
      $('.opposing').change()
      $('.opposing .select2-chosen').text(set)
      if ($('.info-group.opp > * > .forme').is(':visible')) {
          $('.info-group.opp > * > .forme').change()
      }
    }         

	$(".terrain-trigger").bind("change keyup", getTerrainEffects);	
});
