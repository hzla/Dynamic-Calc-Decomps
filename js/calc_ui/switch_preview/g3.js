var GEN3_PHASE1_TYPE_MATCHUPS = {
    "Normal-Rock": 0.5,
    "Normal-Steel": 0.5,
    "Fire-Fire": 0.5,
    "Fire-Water": 0.5,
    "Fire-Grass": 2.0,
    "Fire-Ice": 2.0,
    "Fire-Bug": 2.0,
    "Fire-Rock": 0.5,
    "Fire-Dragon": 0.5,
    "Fire-Steel": 2.0,
    "Water-Fire": 2.0,
    "Water-Water": 0.5,
    "Water-Grass": 0.5,
    "Water-Ground": 2.0,
    "Water-Rock": 2.0,
    "Water-Dragon": 0.5,
    "Electric-Water": 2.0,
    "Electric-Electric": 0.5,
    "Electric-Grass": 0.5,
    "Electric-Ground": 0.0,
    "Electric-Flying": 2.0,
    "Electric-Dragon": 0.5,
    "Grass-Fire": 0.5,
    "Grass-Water": 2.0,
    "Grass-Grass": 0.5,
    "Grass-Poison": 0.5,
    "Grass-Ground": 2.0,
    "Grass-Flying": 0.5,
    "Grass-Bug": 0.5,
    "Grass-Rock": 2.0,
    "Grass-Dragon": 0.5,
    "Grass-Steel": 0.5,
    "Ice-Water": 0.5,
    "Ice-Grass": 2.0,
    "Ice-Ice": 0.5,
    "Ice-Ground": 2.0,
    "Ice-Flying": 2.0,
    "Ice-Dragon": 2.0,
    "Ice-Steel": 0.5,
    "Ice-Fire": 0.5,
    "Fighting-Normal": 2.0,
    "Fighting-Ice": 2.0,
    "Fighting-Poison": 0.5,
    "Fighting-Flying": 0.5,
    "Fighting-Psychic": 0.5,
    "Fighting-Bug": 0.5,
    "Fighting-Rock": 2.0,
    "Fighting-Dark": 2.0,
    "Fighting-Steel": 2.0,
    "Poison-Grass": 2.0,
    "Poison-Poison": 0.5,
    "Poison-Ground": 0.5,
    "Poison-Rock": 0.5,
    "Poison-Ghost": 0.5,
    "Poison-Steel": 0.0,
    "Ground-Fire": 2.0,
    "Ground-Electric": 2.0,
    "Ground-Grass": 0.5,
    "Ground-Poison": 2.0,
    "Ground-Flying": 0.0,
    "Ground-Bug": 0.5,
    "Ground-Rock": 2.0,
    "Ground-Steel": 2.0,
    "Flying-Electric": 0.5,
    "Flying-Grass": 2.0,
    "Flying-Fighting": 2.0,
    "Flying-Bug": 2.0,
    "Flying-Rock": 0.5,
    "Flying-Steel": 0.5,
    "Psychic-Fighting": 2.0,
    "Psychic-Poison": 2.0,
    "Psychic-Psychic": 0.5,
    "Psychic-Dark": 0.0,
    "Psychic-Steel": 0.5,
    "Bug-Fire": 0.5,
    "Bug-Grass": 2.0,
    "Bug-Fighting": 0.5,
    "Bug-Poison": 0.5,
    "Bug-Flying": 0.5,
    "Bug-Psychic": 2.0,
    "Bug-Ghost": 0.5,
    "Bug-Dark": 2.0,
    "Bug-Steel": 0.5,
    "Rock-Fire": 2.0,
    "Rock-Ice": 2.0,
    "Rock-Fighting": 0.5,
    "Rock-Ground": 0.5,
    "Rock-Flying": 2.0,
    "Rock-Bug": 2.0,
    "Rock-Steel": 0.5,
    "Ghost-Normal": 0.0,
    "Ghost-Psychic": 2.0,
    "Ghost-Dark": 0.5,
    "Ghost-Steel": 0.5,
    "Ghost-Ghost": 2.0,
    "Dragon-Dragon": 2.0,
    "Dragon-Steel": 0.5,
    "Dark-Fighting": 0.5,
    "Dark-Psychic": 2.0,
    "Dark-Ghost": 2.0,
    "Dark-Dark": 0.5,
    "Dark-Steel": 0.5,
    "Steel-Fire": 0.5,
    "Steel-Water": 0.5,
    "Steel-Electric": 0.5,
    "Steel-Ice": 2.0,
    "Steel-Rock": 2.0,
    "Steel-Steel": 0.5,
    "Normal-Ghost": 0.0,
    "Fighting-Ghost": 0.0
};

function gen3Phase1Score(attackerTypes, defenderTypes) {
    var p1types = defenderTypes.slice();
    if (!p1types[1]) p1types[1] = p1types[0];

    var p2types = attackerTypes.slice();
    if (!p2types[1]) p2types[1] = p2types[0];

    var score = 10;
    for (var k in p1types) {
        var type = p1types[k];
        for (var matchup in GEN3_PHASE1_TYPE_MATCHUPS) {
            var type1 = matchup.split("-")[0];
            var type2 = matchup.split("-")[1];
            if ((type1 == type) && (type2 == p2types[0] || type2 == p2types[1])) {
                score = Math.floor(score * GEN3_PHASE1_TYPE_MATCHUPS[matchup]);
            }
        }
    }
    return score;
}

function applyGen3TypeCalcDamage(moveType, attackerTypes, defenderTypes, damage, defenderAbility) {
    var dmg = damage;
    // Apply STAB first (integer math like TypeCalc)
    if (attackerTypes.includes(moveType)) {
        dmg = Math.floor((dmg * 15) / 10);
    }
    // Levitate special-case: TypeCalc skips type chart entirely, leaving base damage intact.
    if (defenderAbility == "Levitate" && moveType == "Ground") {
        return dmg;
    }
    for (var matchup in GEN3_PHASE1_TYPE_MATCHUPS) {
        var type1 = matchup.split("-")[0];
        var type2 = matchup.split("-")[1];
        if (type1 == moveType && (type2 == defenderTypes[0] || type2 == defenderTypes[1])) {
            dmg = Math.floor(dmg * GEN3_PHASE1_TYPE_MATCHUPS[matchup]);
            if (dmg === 0 && GEN3_PHASE1_TYPE_MATCHUPS[matchup] !== 0) {
                dmg = 1;
            }
        }
    }
    return dmg;
}

function getGen3TypeEffectiveness(moveType, defenderType) {
    if (!moveType || !defenderType) {
        return 1;
    }

    var matchup = `${moveType}-${defenderType}`;
    return matchup in GEN3_PHASE1_TYPE_MATCHUPS ? GEN3_PHASE1_TYPE_MATCHUPS[matchup] : 1;
}

function getGen3EmeraldPhase2MoveScore(attackerTypes, defenderTypes, defenderAbility, move) {
    if (!move || !move.type) {
        return 0;
    }

    var score = 1;
    if (attackerTypes.includes(move.type)) {
        score *= 1.5;
    }

    if (!(defenderAbility == "Levitate" && move.type == "Ground")) {
        var scoredTypes = {};
        for (var i = 0; i < defenderTypes.length; i++) {
            var defenderType = defenderTypes[i];
            if (!defenderType || scoredTypes[defenderType]) {
                continue;
            }
            score *= getGen3TypeEffectiveness(move.type, defenderType);
            scoredTypes[defenderType] = true;
        }
    }

    return score;
}

var GEN3_PHYSICAL_TYPES = ["Normal", "Fighting", "Flying", "Ground", "Rock", "Bug", "Ghost", "Poison", "Steel"];
var GEN3_EMERALD_POWER_ONE_MOVES = {
    "Guillotine": true,
    "Horn Drill": true,
    "Sonic Boom": true,
    "Low Kick": true,
    "Counter": true,
    "Seismic Toss": true,
    "Dragon Rage": true,
    "Fissure": true,
    "Night Shade": true,
    "Bide": true,
    "Psywave": true,
    "Super Fang": true,
    "Flail": true,
    "Reversal": true,
    "Return": true,
    "Present": true,
    "Frustration": true,
    "Magnitude": true,
    "Hidden Power": true,
    "Mirror Coat": true,
    "Endeavor": true,
    "Sheer Cold": true
};

function getGen3TypeBasedCategory(type) {
    return GEN3_PHYSICAL_TYPES.includes(type) ? "Physical" : "Special";
}

function shouldUseGen3IndexedHiddenPowerMoves() {
    return typeof TITLE === "string" && TITLE == "Emerald Kaizo";
}

function shouldUseGen3EmeraldPhase2Scores() {
    return typeof TITLE === "string" && (TITLE == "Emerald Kaizo" || TITLE == "Emerald Kaizo 1.1");
}

function getGen3EmeraldMoveTableName(moveName) {
    if (!moveName) {
        return moveName;
    }
    if (/^HP\s+\w+$/.test(moveName)) {
        return shouldUseGen3IndexedHiddenPowerMoves() ? moveName.replace(/^HP\s+/, "Hidden Power ") : "Hidden Power";
    }
    if (/^Hidden Power\s+\w+$/.test(moveName)) {
        return shouldUseGen3IndexedHiddenPowerMoves() ? moveName : "Hidden Power";
    }
    if (moveName == "Hidden Power" || moveName == "HP") {
        return "Hidden Power";
    }
    if (moveName == "Sonicboom") {
        return "Sonic Boom";
    }
    return moveName;
}

function isGen3EmeraldPowerOneMove(moveName) {
    return !!GEN3_EMERALD_POWER_ONE_MOVES[getGen3EmeraldMoveTableName(moveName)];
}

function getGen3EmeraldMoveTableMove(moveName) {
    var tableName = getGen3EmeraldMoveTableName(moveName);
    var move = new calc.Move(GENERATION, tableName);

    if (isGen3EmeraldPowerOneMove(moveName)) {
        move.bp = 1;
    }

    // TypeCalc and AI_CalcDmg use the raw battle move table, not battle-script
    // dynamic type overrides or calc-only display variants.
    if (tableName == "Hidden Power") {
        move.type = "Normal";
    } else if (tableName == "Weather Ball") {
        move.bp = 50;
        move.type = "Normal";
    } else if (tableName == "Future Sight") {
        move.type = "Psychic";
    } else if (tableName == "Doom Desire") {
        move.type = "Steel";
    }

    if (move.type && move.type != "???") {
        move.category = getGen3TypeBasedCategory(move.type);
    }

    return move;
}

function vanillaDamageCalcEmerald(attacker, defender, move, field, skipTypeCalc) {
    var attack = attacker.stats.atk;
    var defense = defender.stats.def;
    var spAttack = attacker.stats.spa;
    var spDefense = defender.stats.spd;
    var movePower = move.bp;
    var damage;
    function applyStatStage(stat, stage) {
        if (!stage)
            return stat;
        if (stage > 0)
            return Math.floor(stat * (2 + stage) / 2);
        return Math.floor(stat * 2 / (2 - stage));
    }

    if (["Huge Power", "Pure Power"].includes(attacker.ability)) attack *= 2;
    if (field.attackerSide.isStoneBadge) attack = Math.floor(attack * 1.1);
    if (field.defenderSide.isBalanceBadge) defense = Math.floor(defense * 1.1);
    if (field.attackerSide.isMindBadge) spAttack = Math.floor(spAttack * 1.1);
    if (field.defenderSide.isMindBadge) spDefense = Math.floor(spDefense * 1.1);

    var itemBoostType = calc.getItemBoostType(attacker.item);
    if (itemBoostType == move.type) {
        if (attacker.item != "Sea Incense") {
            if (['Normal', 'Fighting', 'Flying', 'Ground', 'Rock', 'Bug', 'Ghost', 'Poison', 'Steel'].includes(itemBoostType)) attack = Math.floor(attack * 1.1);
            else spAttack = Math.floor(spAttack * 1.1);
        } else {
            spAttack = Math.floor(spAttack * 1.05);
        }
    }

    if (attacker.item == "Choice Band") attack = Math.floor(attack * 1.5);
    if (attacker.item == "Soul Dew" && ["Latias", "Latios"].includes(attacker.name)) spAttack = Math.floor(spAttack * 1.5);
    if (attacker.item == "Soul Dew" && ["Latias", "Latios"].includes(defender.name)) spDefense = Math.floor(spDefense * 1.5);
    if (attacker.item == "Deep Sea Tooth" && attacker.name == "Clamperl") spAttack = Math.floor(spAttack * 2);
    if (attacker.item == "Deep Sea Scale" && attacker.name == "Clamperl") spDefense = Math.floor(spDefense * 2);
    if (attacker.item == "Light Ball" && attacker.name == "Pikachu") spAttack = Math.floor(spAttack * 2);
    if (attacker.item == "Metal Powder" && attacker.name == "Ditto") defense = Math.floor(defense * 2);
    if (attacker.item == "Thick Club" && ["Cubone", "Marowak"].includes(attacker.name)) attack = Math.floor(attack * 2);

    if (defender.ability == "Thick Fat" && ["Fire", "Ice"].includes(move.type)) spAttack = Math.floor(spAttack / 2);
    if (attacker.ability == "Hustle") attack = Math.floor(attack * 1.5);
    if (["Plus", "Minus"].includes(attacker.ability) && field.gameType == "Doubles") spAttack = Math.floor(spAttack * 1.5);
    if (attacker.ability == "Guts" && attacker.status) attack = Math.floor(attack * 1.5);
    if (defender.ability == "Marvel Scale" && defender.status) defense = Math.floor(defense * 1.5);
    if (move.type == "Grass" && attacker.ability == "Overgrow") movePower = Math.floor(movePower * 1.5);
    if (move.type == "Fire" && attacker.ability == "Blaze") movePower = Math.floor(movePower * 1.5);
    if (move.type == "Water" && attacker.ability == "Torrent") movePower = Math.floor(movePower * 1.5);
    if (move.type == "Bug" && attacker.ability == "Swarm") movePower = Math.floor(movePower * 1.5);

    if (["Self-Destruct", "Explosion"].includes(move.name)) defense = Math.floor(defense / 2);

    if (move.type == "???") {
        damage = 0;
    } else if (move.category == "Physical") {
        damage = applyStatStage(attack, attacker.boosts.atk);
        damage = Math.floor(damage * movePower);
        damage = Math.floor(damage * Math.floor(2 * attacker.level / 5 + 2));

        defense = applyStatStage(defense, defender.boosts.def);

        damage = Math.floor(damage / defense);
        damage = Math.floor(damage / 50);

        if (attacker.status === "brn" && attacker.ability !== "Guts") {
            damage = Math.floor(damage / 2);
        }

        if (field.defenderSide.isReflect) {
            if (field.gameType == "Doubles") damage = 2 * Math.floor(damage / 3);
            else damage = Math.floor(damage / 2);
        }

        if (field.gameType == "Doubles" && move.target == "allAdjacentFoes") damage = Math.floor(damage / 2);

        if (damage == 0) damage = 1;
    } else {
        damage = applyStatStage(spAttack, attacker.boosts.spa);
        damage = Math.floor(damage * movePower);
        damage = Math.floor(damage * Math.floor(2 * attacker.level / 5 + 2));

        spDefense = applyStatStage(spDefense, defender.boosts.spd);

        damage = Math.floor(damage / spDefense);
        damage = Math.floor(damage / 50);

        if (field.defenderSide.isLightScreen) {
            if (field.gameType == "Doubles") damage = 2 * Math.floor(damage / 3);
            else damage = Math.floor(damage / 2);
        }

        if (field.gameType == "Doubles" && move.target == "allAdjacentFoes") damage = Math.floor(damage / 2);

        if (field.weather && ![attacker.ability, defender.ability].includes("Air Lock")) {
            if (field.weather == "Rain") {
                if (move.type == "Fire") damage = Math.floor(damage / 2);
                else if (move.type == "Water") damage = Math.floor((15 * damage) / 10);
            }
            if (["Rain", "Sand", "Hail"].includes(field.weather) && move.named("Solar Beam")) {
                damage = Math.floor(damage / 2);
            }
            if (field.weather == "Sun") {
                if (move.type == "Fire") damage = Math.floor((15 * damage) / 10);
                else if (move.type == "Water") damage = Math.floor(damage / 2);
            }
        }
    }
    damage += 2;
    if (skipTypeCalc) return damage;

    if (attacker.types.includes(move.type)) damage = Math.floor(damage * 1.5);

    if (attacker.ability == "Levitate" && move.type == "Ground") return 0;

    var effectiveness = 1;
    for (var i in defender.types) {
        var type = defender.types[i];
        if (`${move.type}-${type}` in GEN3_PHASE1_TYPE_MATCHUPS) {
            effectiveness *= GEN3_PHASE1_TYPE_MATCHUPS[`${move.type}-${type}`];
            damage = Math.floor(damage * GEN3_PHASE1_TYPE_MATCHUPS[`${move.type}-${type}`]);
        }
    }
    if (attacker.ability == "Wonder Guard" && effectiveness <= 1) return 0;

    return damage
}

function get_next_in_g3() {
    if (typeof CURRENT_TRAINER_POKS === "undefined") {
        return;
    }

    var trainer_poks = CURRENT_TRAINER_POKS;
    var ranked_trainer_poks = [];

    var p1 = createPokemon($("#p1"));
    var field = createField().clone().swap();
    var lastMoveName = $("#gen3-switch-guide .last-move-used > select.move-selector").val();
    var lastMoveBp = moves[lastMoveName] ? moves[lastMoveName].bp : NaN;
    var currentOpposingDataId = getGen3CurrentOpposingDataId();
    var useEmeraldPhase2Scores = shouldUseGen3EmeraldPhase2Scores();


    if (p1.species && p1.species.name === "Castform") {
        switch (field.weather) {
            case "Sun":
                p1.types[0] = "Fire";
                break;
            case "Rain":
                p1.types[0] = "Water";
                break;
            case "Hail":
                p1.types[0] = "Ice";
                break;
            default:
                p1.types[0] = "Normal";
                break;
        }
    }

    var defenderTypes = p1.types.slice();
    var rawDefenderTypes = p1.types.slice();
    if (!defenderTypes[1]) defenderTypes[1] = defenderTypes[0];

    var dead = createPokemon($("#p2"));
    if (dead && dead.name && dead.name.includes("Castform")) {
        dead.types = ["Normal"];
    }

    for (var i = 0; i < trainer_poks.length; i++) {
        var pok_name = trainer_poks[i].split(" (")[0];
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0];
        var sub_index = parseInt(trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", ""));

        if (!pokedex[pok_name] || !setdex[pok_name] || !setdex[pok_name][tr_name]) {
            continue;
        }



        var enemy = createPokemon(`${pok_name} (${tr_name})`);
        enemyDex = pokedex[pok_name];

        expYield = Math.floor(Math.floor(expYields[cleanString(pok_name)] * enemy.level / 7) * 1.5);


        var enemyTypes = enemyDex.types.slice();
        if (!enemyTypes[1]) enemyTypes[1] = enemyTypes[0];

        var phase1Score = gen3Phase1Score(enemyTypes, defenderTypes);

        var hasSE = false;
        var bestDamage = 0;
        var bestMove = "";
        var seMoves = [];
        var phase2Damages = [];
        var phase2Scores = [];

        for (var j = 0; j < enemy.moves.length; j++) {
            var move = enemy.moves[j];



            var moveCopy = getGen3EmeraldMoveTableMove(move.name);

            if (typeof moveCopy.type === "undefined") {
                continue;
            }

            var typeData = GENERATION.types.get(toID(moveCopy.type));
            var typeEffectiveness1 = typeData && typeof typeData.effectiveness[defenderTypes[0]] !== "undefined" ? typeData.effectiveness[defenderTypes[0]] : 1;
            var typeEffectiveness2 = typeData && typeof typeData.effectiveness[defenderTypes[1]] !== "undefined" ? typeData.effectiveness[defenderTypes[1]] : 1;
            var typeEffectiveness = p1.types[1] ? typeEffectiveness1 * typeEffectiveness2 : typeEffectiveness1;
            if (p1.ability == "Levitate" && moveCopy.type == "Ground") typeEffectiveness = 0;

            if (moveCopy.bp && typeEffectiveness > 1) {
                hasSE = true;
                seMoves.push(move.name);
            }

            if (isGen3EmeraldPowerOneMove(move.name)) continue;

            if (useEmeraldPhase2Scores) {
                phase2Scores.push({
                    score: getGen3EmeraldPhase2MoveScore(dead.types, rawDefenderTypes, p1.ability, moveCopy),
                    move: move.name
                });
            }

            var lastMoveTableName = lastMoveName || moveCopy.name;
            var lastMove = getGen3EmeraldMoveTableMove(lastMoveTableName);
            if (!isGen3EmeraldPowerOneMove(lastMoveTableName) && !isNaN(lastMoveBp)) {
                lastMove.bp = lastMoveBp;
            }



            var baseDmg = vanillaDamageCalcEmerald(dead, p1, lastMove, field, true);
            var dmg = applyGen3TypeCalcDamage(moveCopy.type, dead.types, defenderTypes, baseDmg, p1.ability);
            phase2Damages.push({
                damage: dmg,
                move: move.name
            });
            
            // console.log(`${dead.name} using ${enemy.species.name}'s ${enemy.moves[j].name} -> ${dmg}`);
            // console.log(lastMove)
            
            if (dmg > bestDamage) {
                bestDamage = dmg % 256;
                bestMove = move.name;
            } else if (dmg == bestDamage && bestMove) {
                bestMove += (", " + move.name);
            }
        }

        var score = bestDamage;
        if (hasSE && phase1Score > 0) score = 100000 + phase1Score;

        var reason;
        if (hasSE && phase1Score > 0) {
            reason = `phase1 (SE move: ${seMoves.join(", ")}; typeScore=${phase1Score})`;
        } else {
            reason = `phase2 (damage=${bestDamage}, bestMove=${bestMove || "None"})`;
        }
        var dataId = getGen3TrainerPreviewDataId(trainer_poks[i]);
        var isUnavailable = (typeof fainted !== "undefined" && fainted.includes(dataId)) || (dataId && dataId == currentOpposingDataId);
        var entry = [trainer_poks[i], score, bestMove, sub_index, setdex[pok_name][tr_name]["moves"], reason, phase1Score, bestDamage, expYield];
        entry.gen3Switch = {
            hasPhase1Match: hasSE && phase1Score > 0,
            isUnavailable: isUnavailable,
            phase1Score: phase1Score,
            phase2Damages: phase2Damages,
            phase2Scores: phase2Scores
        };
        ranked_trainer_poks.push(entry);
    }

    ranked_trainer_poks = settings && settings.noSwitch
        ? ranked_trainer_poks.sort(sort_subindex)
        : order_trpoks_g3(ranked_trainer_poks);
    // console.log(ranked_trainer_poks.map((entry, idx) => ({
    //     order: idx + 1,
    //     pokemon: entry[0],
    //     reason: entry[5],
    //     score: entry[1],
    //     typeScore: entry[6],
    //     bestDamage: entry[7],
    //     bestMove: entry[2]
    // })));
    return ranked_trainer_poks;
}

function getGen3TrainerPreviewDataId(setId) {
    if (typeof getTrainerPreviewDataId === "function") {
        return getTrainerPreviewDataId(setId);
    }
    return typeof setId === "string" ? setId.split("[")[0] : "";
}

function getGen3CurrentOpposingDataId() {
    if (typeof getOpposingFaintDataId === "function") {
        return getOpposingFaintDataId();
    }

    var currentSet = "";
    var opposingSelector = $(".set-selector.opposing");
    if (opposingSelector.length) {
        currentSet = opposingSelector.last().val();
    }
    currentSet = currentSet || $("input.opposing").val() || "";
    return getGen3TrainerPreviewDataId(currentSet);
}

function order_trpoks_g3(rankedTrainerPoks) {
    var remaining = rankedTrainerPoks
        .filter(function(entry) {
            return entry.gen3Switch && !entry.gen3Switch.isUnavailable;
        })
        .sort(sort_subindex);
    var order = 0;

    while (remaining.length) {
        var choice = chooseGen3PostKoSwitchEntry(remaining);
        if (!choice || !choice.entry) {
            break;
        }

        choice.entry.gen3Switch.phase = choice.phase;
        choice.entry.gen3Switch.order = order++;
        remaining = remaining.filter(function(entry) {
            return entry !== choice.entry;
        });
    }

    return rankedTrainerPoks.sort(sort_trpoks_g3);
}

function chooseGen3PostKoSwitchEntry(entries) {
    var phase1Entry = chooseGen3Phase1SwitchEntry(entries);
    if (phase1Entry) {
        return {
            entry: phase1Entry,
            phase: 1
        };
    }

    var phase2Entry = chooseGen3Phase2SwitchEntry(entries);
    if (phase2Entry) {
        return {
            entry: phase2Entry,
            phase: 2
        };
    }

    var fallbackEntry = chooseGen3FallbackSwitchEntry(entries);
    if (fallbackEntry) {
        return {
            entry: fallbackEntry,
            phase: 3
        };
    }

    return null;
}

function chooseGen3Phase1SwitchEntry(entries) {
    var invalidEntries = [];

    while (invalidEntries.length < entries.length) {
        var bestEntry = null;
        var bestScore = 0;

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (invalidEntries.includes(entry)) {
                continue;
            }

            var score = entry.gen3Switch && Number.isFinite(entry.gen3Switch.phase1Score)
                ? entry.gen3Switch.phase1Score
                : 0;
            if (bestScore < score) {
                bestScore = score;
                bestEntry = entry;
            }
        }

        if (!bestEntry) {
            return null;
        }
        if (bestEntry.gen3Switch.hasPhase1Match) {
            return bestEntry;
        }

        invalidEntries.push(bestEntry);
    }

    return null;
}

function chooseGen3Phase2SwitchEntry(entries) {
    var bestEntry = null;
    var bestScore = 0;

    for (var i = 0; i < entries.length; i++) {
        var scores = entries[i].gen3Switch.phase2Scores || [];
        for (var j = 0; j < scores.length; j++) {
            if (bestScore < scores[j].score) {
                bestScore = scores[j].score;
                bestEntry = entries[i];
            }
        }

        if (scores.length) {
            continue;
        }

        var damages = entries[i].gen3Switch.phase2Damages || [];
        for (var k = 0; k < damages.length; k++) {
            if (bestScore < damages[k].damage) {
                bestScore = damages[k].damage % 256;
                bestEntry = entries[i];
            }
        }
    }

    return bestEntry;
}

function chooseGen3FallbackSwitchEntry(entries) {
    return entries.length ? entries[0] : null;
}

function sort_trpoks_g3(a, b) {
    var aMeta = a.gen3Switch || {};
    var bMeta = b.gen3Switch || {};
    if (aMeta.isUnavailable !== bMeta.isUnavailable) {
        return aMeta.isUnavailable ? 1 : -1;
    }
    if (aMeta.isUnavailable && bMeta.isUnavailable) {
        return a[3] - b[3];
    }
    if (aMeta.phase !== bMeta.phase) {
        return aMeta.phase - bMeta.phase;
    }
    if (aMeta.order !== bMeta.order) {
        return aMeta.order - bMeta.order;
    }
    return a[3] - b[3];
}
