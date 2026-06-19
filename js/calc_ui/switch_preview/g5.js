function g5ExpFixedPointSqrt(val) {
    return Math.round(Math.sqrt(val) * 4096)
}

function g5ExpPow25(val) {
    return Math.floor((val * val * g5ExpFixedPointSqrt(val)) / 4096)
}

function g5ExpMulRatio(value, ratio) {
    var scaled = value * ratio
    var decimal = scaled & 4095
    scaled >>= 12

    if (decimal > 2048) {
        scaled += 1
    }

    return scaled
}

function g5CalcTrainerPreviewExpYield(player, opposingName, opposingLevel) {
    var baseYield = expYields[cleanString(opposingName)]
    if (!baseYield || !player || !player.level || !opposingLevel) {
        return 0
    }

    // Match BW's trainer battle path for the active participant:
    // base exp, trainer bonus, level scaling, then Lucky Egg.
    var baseExp = Math.floor((baseYield * opposingLevel) / 5)
    baseExp = Math.floor((baseExp * 15) / 10)

    var numer = g5ExpPow25(opposingLevel * 2 + 10)
    var denom = g5ExpPow25(opposingLevel + player.level + 10)
    var expYield = Math.floor((baseExp * numer) / denom) + 1

    if (player.hasItem("Lucky Egg")) {
        expYield = g5ExpMulRatio(expYield, 6144)
    }

    return expYield
}

function g5GetMatchupTypes(type1, type2) {
    var matchupTypes = []

    if (type1 && type1 !== "None") {
        matchupTypes.push(type1)
    }

    if (type2 && type2 !== "None" && type2 !== type1) {
        matchupTypes.push(type2)
    }

    return matchupTypes
}

function g5GetCascadePreviewTypes(pokemon, fallbackTypes) {
    if (pokemon.item && pokemon.item.startsWith("Tera ") && pokemon.moves[0] && pokemon.moves[0].type) {
        return [pokemon.moves[0].type]
    }

    return g5GetMatchupTypes(fallbackTypes[0], fallbackTypes[1])
}

function g5GetCascadePreviewTypePair(pokemon, fallbackTypes) {
    if (pokemon.item && pokemon.item.startsWith("Tera ") && pokemon.moves[0] && pokemon.moves[0].type) {
        return [pokemon.moves[0].type, pokemon.moves[0].type]
    }

    return [fallbackTypes[0], fallbackTypes[1] || fallbackTypes[0]]
}

function g5ApplyCascadeMatchupBpMod(bp, targetTypes, switchInTypes) {
    if (!bp || !targetTypes.length || !switchInTypes.length) {
        return bp
    }

    var normalizedSwitchInTypes = [switchInTypes[0], switchInTypes[1] || switchInTypes[0]]
    var defensiveTypeInfo = get_type_info(normalizedSwitchInTypes)
    var typeEffectiveness = []

    for (var i = 0; i < targetTypes.length; i++) {
        var effectiveness = defensiveTypeInfo[targetTypes[i]]
        typeEffectiveness.push(Number.isFinite(effectiveness) ? effectiveness : 1)
    }

    if (typeEffectiveness.some(function(effectiveness) { return effectiveness >= 4; })) {
        return Math.floor(bp / 2)
    }

    if (typeEffectiveness.some(function(effectiveness) { return effectiveness >= 2; })) {
        return Math.floor((bp * 3) / 4)
    }

    // Cascade switch preview gives the larger boost when the switch-in blanks
    // either of the current player's typing options outright.
    if (typeEffectiveness.some(function(effectiveness) { return effectiveness === 0; })) {
        return bp + Math.floor(bp / 2)
    }

    if (typeEffectiveness.every(function(effectiveness) { return effectiveness <= 0.5; })) {
        return bp + Math.floor(bp / 4)
    }

    return bp
}

function g5BuildCascadeContext(player, playerType1, playerType2) {
    var weatherToggle = $('#weather-bar').find('input:checked')[0]

    return {
        player: player,
        playerType1: playerType1,
        playerType2: playerType2,
        playerTypePair: g5GetCascadePreviewTypePair(player, [playerType1, playerType2]),
        playerMatchupTypes: g5GetCascadePreviewTypes(player, [playerType1, playerType2]),
        playerAbility: $("#abilityL1").val(),
        playerStatus: $("#statusL1").val(),
        playerHp: parseInt($("#p1").find(".percent-hp").val()),
        weather: weatherToggle ? weatherToggle.value : "",
        weatherTypes: {Sun: "Fire", Hail: "Ice", Sand: "Rock", Rain: "Water"},
        immunities: {"Dry Skin": "Water", "Flash Fire": "Fire", "Well-Baked Body": "Fire", "Levitate": "Ground", "Sap Sipper": "Grass", "Motor Drive": "Electric", "Storm Drain": "Water", "Volt Absorb": "Electric", "Water Absorb": "Water", "Lightning Rod": "Electric", "Thunder Armor": "Electric"},
        resistances: {"Slush Rush": "Ice", "Swift Swim": "Water", "Sand Rush": "Ground", "Justified": "Dark", "Toxic Boost": "Poison"},
        baseTypeInfo: get_type_info([playerType1, playerType2])
    }
}

function g5GetCascadeTrainerPreviewInfo(trainerPok, player) {
    var pokName = trainerPok.split(" (")[0]
    var trName = trainerPok.split(" (")[1].replace(")", "").split("[")[0]
    var subIndex = trainerPok.split(" (")[1].replace(")", "").split("[")[1].replace("]", "")
    var types = pokedex[pokName].types
    var pokData = SETDEX_BW[pokName][trName]
    var opposing = createPokemon(pokName + " (" + trName + ")")

    return {
        trainerPok: trainerPok,
        pokName: pokName,
        trName: trName,
        subIndex: subIndex,
        types: types,
        pokData: pokData,
        opposing: opposing,
        expYield: g5CalcTrainerPreviewExpYield(player, pokName, opposing.level)
    }
}

function g5TrainerIgnoresAbilities(pokemon) {
    return pokemon.hasAbility("Mold Breaker", "Teravolt", "Turboblaze", "Neutralizing Gas") || pokemon.hasItem("Tera Drill", "Ability Drill")
}

function g5MoveHasFlag(move, flagName) {
    return !!(move && move.flags && move.flags[flagName])
}

function g5GetCascadeHybridEffectiveType(move, moveName, opposing, cascadeContext) {
    var effectiveType = move.type
    var noTypeChange = move.named("Judgment", "Nature Power", "Techno Blast", "Natural Gift", "Weather Ball", "Weather Crash")
    var hasAteTypeChange = false

    if (!noTypeChange) {
        var isNormalType = move.hasType("Normal")
        if (opposing.hasAbility("Aerilate") && isNormalType) {
            effectiveType = "Flying"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Pixilate") && isNormalType) {
            effectiveType = "Fairy"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Galvanize") && isNormalType) {
            effectiveType = "Electric"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Moisturize") && isNormalType) {
            effectiveType = "Water"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Refrigerate") && isNormalType) {
            effectiveType = "Ice"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Normalize")) {
            effectiveType = "Normal"
            hasAteTypeChange = true
        }
    }

    if (moveName == "Weather Ball" || moveName == "Weather Crash") {
        if (cascadeContext.weather == "Sun" || opposing.hasAbility("Solar Power", "Flower Gift", "Chlorophyll")) {
            effectiveType = "Fire"
        } else if (cascadeContext.weatherTypes[cascadeContext.weather]) {
            effectiveType = cascadeContext.weatherTypes[cascadeContext.weather]
        }
    }

    if (moveName == "Techno Blast") {
        if (opposing.item == "Chill Drive") {
            effectiveType = "Ice"
        } else if (opposing.item == "Douse Drive") {
            effectiveType = "Water"
        } else if (opposing.item == "Burn Drive") {
            effectiveType = "Fire"
        } else if (opposing.item == "Shock Drive") {
            effectiveType = "Electric"
        }
    }

    return {
        type: effectiveType,
        hasAteTypeChange: hasAteTypeChange
    }
}

function g5GetCascadePhase2EffectiveType(move, moveName, opposing, cascadeContext) {
    var effectiveType = move.type
    var noTypeChange = move.named("Judgment", "Nature Power", "Natural Gift", "Weather Ball")
    var hasAteTypeChange = false

    if (!noTypeChange) {
        var isNormalType = move.hasType("Normal")
        if (opposing.hasAbility("Aerilate") && isNormalType) {
            effectiveType = "Flying"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Pixilate") && isNormalType) {
            effectiveType = "Fairy"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Galvanize") && isNormalType) {
            effectiveType = "Electric"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Moisturize") && isNormalType) {
            effectiveType = "Water"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Refrigerate") && isNormalType) {
            effectiveType = "Ice"
            hasAteTypeChange = true
        } else if (opposing.hasAbility("Normalize")) {
            effectiveType = "Normal"
            hasAteTypeChange = true
        }
    }

    if (moveName == "Weather Ball" && cascadeContext.weather != "") {
        effectiveType = cascadeContext.weatherTypes[cascadeContext.weather]
    }

    return {
        type: effectiveType,
        hasAteTypeChange: hasAteTypeChange
    }
}

function g5IsCascadeAbilityImmuneToMove(move, moveType, playerAbility) {
    if (!playerAbility) {
        return false
    }

    if (playerAbility == "Soundproof" && g5MoveHasFlag(move, "sound")) {
        return true
    }

    if (playerAbility == "Bulletproof" && g5MoveHasFlag(move, "bullet")) {
        return true
    }

    if (playerAbility == "Wind Rider" && g5MoveHasFlag(move, "wind")) {
        return true
    }

    return false
}

function g5GetCascadePhase2TypeInfo(opposing, moveName, playerType1, playerType2) {
    if (opposing.hasAbility("Scrappy", "Corrosion", "Normalize", "Inner Focus")) {
        return get_type_info([playerType1, playerType2], opposing.ability)
    }

    if (["Chip Away", "Sacred Sword", "Relic Song", "Freeze-Dry", "Sky Uppercut"].includes(moveName)) {
        return get_type_info([playerType1, playerType2], moveName)
    }

    return get_type_info([playerType1, playerType2])
}

function g5GetCascadeHybridScoreMultiplier(effectiveness) {
    if (!Number.isFinite(effectiveness) || effectiveness <= 0.5) {
        return 1
    }

    if (effectiveness >= 4) {
        return 8
    }

    if (effectiveness >= 2) {
        return 4
    }

    return 2
}

function g5GetCascadeHybridTypingScore(opposing, switchInTypePair, cascadeContext) {
    var typeModifier = false
    if (opposing.hasAbility("Scrappy", "Corrosion", "Inner Focus")) {
        typeModifier = opposing.ability
    }

    var typeInfo = get_type_info([cascadeContext.playerTypePair[0], cascadeContext.playerTypePair[1]], typeModifier)
    var firstEffectiveness = Number.isFinite(typeInfo[switchInTypePair[0]]) ? typeInfo[switchInTypePair[0]] : 1
    var secondEffectiveness = Number.isFinite(typeInfo[switchInTypePair[1]]) ? typeInfo[switchInTypePair[1]] : 1

    return g5GetCascadeHybridScoreMultiplier(firstEffectiveness) * g5GetCascadeHybridScoreMultiplier(secondEffectiveness)
}

function g5BuildCascadeHybridPhase1Rankings(trainerPoks, player, cascadeContext) {
    var phase1Mons = []
    var phase1Ids = {}

    for (var i = 0; i < trainerPoks.length; i++) {
        var info = g5GetCascadeTrainerPreviewInfo(trainerPoks[i], player)
        var opposing = info.opposing
        var opposingIgnoresAbilities = g5TrainerIgnoresAbilities(opposing)
        var switchInTypePair = g5GetCascadePreviewTypePair(opposing, info.types)
        var qualifyingMoves = []

        for (var j = 0; j < opposing.moves.length; j++) {
            var move = opposing.moves[j]
            var moveName = move.name
            var moveTypeInfo = g5GetCascadeHybridEffectiveType(move, moveName, opposing, cascadeContext)
            var defensiveTypeInfo = g5GetCascadePhase2TypeInfo(opposing, moveName, cascadeContext.playerType1, cascadeContext.playerType2)
            var moveEffectiveness = Number.isFinite(defensiveTypeInfo[moveTypeInfo.type]) ? defensiveTypeInfo[moveTypeInfo.type] : 1

            if (!opposingIgnoresAbilities) {
                if (cascadeContext.immunities[cascadeContext.playerAbility] && moveTypeInfo.type == cascadeContext.immunities[cascadeContext.playerAbility]) {
                    moveEffectiveness = 0
                } else if (g5IsCascadeAbilityImmuneToMove(move, moveTypeInfo.type, cascadeContext.playerAbility)) {
                    moveEffectiveness = 0
                }
            }

            if (moveEffectiveness > 1) {
                qualifyingMoves.push(moveName)
            }
        }

        if (!qualifyingMoves.length) {
            continue
        }

        phase1Mons.push([
            info.trainerPok,
            g5GetCascadeHybridTypingScore(opposing, switchInTypePair, cascadeContext),
            qualifyingMoves.join(", "),
            info.subIndex,
            info.pokData["moves"],
            "",
            "",
            "",
            info.expYield
        ])
        phase1Ids[info.trainerPok] = true
    }

    return {
        phase1Mons: phase1Mons,
        phase1Ids: phase1Ids
    }
}

function g5BuildCascadePhase2Rankings(trainerPoks, player, cascadeContext, applyCascadeMatchupMod, excludedIds) {
    var rankedTrainerPoks = []

    for (var i = 0; i < trainerPoks.length; i++) {
        if (excludedIds && excludedIds[trainerPoks[i]]) {
            continue
        }

        var info = g5GetCascadeTrainerPreviewInfo(trainerPoks[i], player)
        var opposing = info.opposing
        var strongestMoveBp = 0
        var strongestMove = "None"
        var isFaster = opposing.stats.spe >= player.stats.spe
        var opposingIgnoresAbilities = g5TrainerIgnoresAbilities(opposing)
        var switchInTypes = g5GetCascadePreviewTypes(opposing, info.types)

        for (var j = 0; j < opposing.moves.length; j++) {
            var move = opposing.moves[j]
            var moveName = move.name
            var movData = moves[moveName]

            if (!movData) {
                continue
            }

            var moveBp = move.bp
            if (moveBp == 1) {
                moveBp = 60
            }

            var moveTypeInfo = g5GetCascadePhase2EffectiveType(move, moveName, opposing, cascadeContext)
            var moveType = moveTypeInfo.type

            if (moveTypeInfo.hasAteTypeChange) {
                moveBp *= 1.2
            }

            if (opposing.hasAbility("Technician") && moveBp <= 60) {
                moveBp *= 1.5
            }

            if (info.types[0] == moveType || info.types[1] == moveType || opposing.hasAbility("Savant") || (opposing.item && opposing.item.startsWith("Tera ") && opposing.moves[0].type == moveType)) {
                moveBp *= 1.5
            }

            if (opposing.hasAbility("Tenacity") && cascadeContext.baseTypeInfo[moveType] < 1) {
                moveBp *= 2
            }

            if (move.named("Eruption", "Water Spout")) {
                moveBp = Math.max(1, Math.floor((150 * opposing.curHP()) / opposing.maxHP()))
            } else if (move.named("Flail", "Reversal")) {
                var p = Math.floor((48 * opposing.curHP()) / opposing.maxHP())
                moveBp = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20
            } else if (move.named("Acrobatics") && (info.pokData["item"] == "-" || info.pokData["item"] == "Flying Gem")) {
                moveBp *= 2
            } else if (move.named("Gyro Ball", "Avalanche", "Payback", "Revenge") && !isFaster) {
                moveBp *= 2
            } else if (moveName == "Electro Ball" && isFaster) {
                moveBp = (moveName == "Electro Ball" && opposing.stats.spe > player.stats.spe)
            } else if (move.named("Retaliate")) {
                moveBp *= 2
            } else if (move.named("Solar Blade", "Solar Beam")) {
                var canChargeSolar = cascadeContext.weather == "Sun" || opposing.hasItem("Power Herb") || opposing.hasAbility("Solar Power", "Flower Gift", "Chlorophyll")
                if (!canChargeSolar) {
                    moveBp = 0
                }
            } else if (move.named("Electro Shot") && !opposing.hasItem("Power Herb") && cascadeContext.weather != "Rain") {
                moveBp *= 0.5
            } else if (move.named("Explosion", "Self-Destruct")) {
                moveBp = 0
            } else if (cascadeContext.playerStatus != "Healthy" && move.named("Hex", "Beat Up", "Infernal Parade", "Bitter Malice", "Barb Barrage")) {
                moveBp *= 2
            } else if (cascadeContext.playerStatus == "Asleep" && move.named("Dream Eater", "Wake-Up Slap")) {
                moveBp *= 2
            } else if (moveName == "Brine" && cascadeContext.playerHp <= 50) {
                moveBp *= 2
            } else if ((moveName == "Weather Ball" || moveName == "Weather Crash") && cascadeContext.weather != "") {
                moveBp *= 2
            } else if (moveName == "Natural Gift" && info.pokData.item && info.pokData.item.includes(" Berry")) {
                var naturalGiftInfo = ITEMS_BY_ID[8][cleanString(info.pokData.item)].naturalGift
                moveType = naturalGiftInfo.type
                moveBp = naturalGiftInfo.basePower
            }

            if (!opposingIgnoresAbilities) {
                if (cascadeContext.immunities[cascadeContext.playerAbility]) {
                    if (moveType == cascadeContext.immunities[cascadeContext.playerAbility]) {
                        moveBp = 0
                    }
                } else if (cascadeContext.resistances[cascadeContext.playerAbility]) {
                    if (moveType == cascadeContext.resistances[cascadeContext.playerAbility]) {
                        moveBp *= 0.5
                    }
                } else if (cascadeContext.playerAbility == "Thick Fat" && (moveType == "Fire" || moveType == "Ice")) {
                    moveBp *= 0.5
                } else if (cascadeContext.playerAbility == "Heatproof" && moveType == "Fire") {
                    moveBp *= 0.25
                } else if (cascadeContext.playerAbility == "Soundproof" && g5MoveHasFlag(move, "sound")) {
                    moveBp = 0
                } else if (cascadeContext.playerAbility == "Dry Skin" && moveType == "Fire") {
                    moveBp *= 2
                } else if (cascadeContext.playerAbility == "Bulletproof" && g5MoveHasFlag(move, "bullet")) {
                    moveBp = 0
                } else if (cascadeContext.playerAbility == "Wind Rider" && g5MoveHasFlag(move, "wind")) {
                    moveBp = 0
                }
            }

            if (move.isCrit && (!player.hasAbility("Battle Armor", "Shell Armor") || opposingIgnoresAbilities)) {
                if (settings.critGen >= 6) {
                    moveBp *= 1.5
                } else {
                    moveBp *= 2
                }

                if (opposing.hasAbility("Sniper")) {
                    moveBp *= 1.5
                }
            }

            if (movData.multihit && movData.multihit.constructor === Array) {
                if (info.pokData["ability"] == "Skill Link") {
                    moveBp *= movData.multihit[1]
                } else if (info.pokData["item"] == "Loaded Dice") {
                    moveBp *= Math.min(movData.multihit[1], 4)
                } else {
                    moveBp *= movData.multihit[0]
                }
            } else if (movData.multihit) {
                moveBp *= movData.multihit
            }

            var typeInfo = g5GetCascadePhase2TypeInfo(opposing, moveName, cascadeContext.playerType1, cascadeContext.playerType2)
            if (typeInfo[moveType] < 1 && opposing.hasAbility("Tenacity")) {
                moveBp *= 2
            }

            var bp = moveBp * typeInfo[moveType]
            if (applyCascadeMatchupMod) {
                bp = g5ApplyCascadeMatchupBpMod(bp, cascadeContext.playerMatchupTypes, switchInTypes)
            }

            if (bp > strongestMoveBp) {
                strongestMoveBp = bp
                strongestMove = moveName
            } else if (bp == strongestMoveBp) {
                strongestMove += ", " + moveName
            }
        }

        rankedTrainerPoks.push([info.trainerPok, strongestMoveBp, strongestMove, info.subIndex, info.pokData["moves"], "", "", "", info.expYield])
    }

    return rankedTrainerPoks
}

function g5ApplyMegaSwitchPreviewOrdering(rankedTrainerPoks) {
    var endSwap = null
    var foundMega = false

    for (var i = 0; i < rankedTrainerPoks.length; i++) {
        if (TITLE == "Ancestral X" || TITLE == "Navy Sapphire") {
            break
        }

        if (foundMega) {
            if (i == rankedTrainerPoks.length - 1) {
                rankedTrainerPoks[i - 1] = endSwap
            } else {
                rankedTrainerPoks[i - 1] = rankedTrainerPoks[i]
            }
        }

        if (rankedTrainerPoks[i][0].includes("-Mega")) {
            endSwap = rankedTrainerPoks[rankedTrainerPoks.length - 1]
            rankedTrainerPoks[rankedTrainerPoks.length - 1] = rankedTrainerPoks[i]
            foundMega = true
        }
    }

    return rankedTrainerPoks
}

function g5FinalizeRankedTrainerPoks(rankedTrainerPoks) {
    // Partner sections are split later during render, so partner battles should
    // still respect the ranked switch preview order when the feature is enabled.
    if (settings && settings.noSwitch) {
        rankedTrainerPoks = rankedTrainerPoks.sort(sort_subindex)
    } else {
        rankedTrainerPoks = rankedTrainerPoks.sort(sort_trpoks)
    }

    return g5ApplyMegaSwitchPreviewOrdering(rankedTrainerPoks)
}

function g5FinalizeCascadeHybridRankings(phase1Mons, phase2Mons) {
    var rankedTrainerPoks = phase1Mons.concat(phase2Mons)

    if (settings && settings.noSwitch) {
        rankedTrainerPoks = rankedTrainerPoks.sort(sort_subindex)
    } else {
        rankedTrainerPoks = phase1Mons.sort(sort_trpoks).concat(phase2Mons.sort(sort_trpoks))
    }

    return g5ApplyMegaSwitchPreviewOrdering(rankedTrainerPoks)
}

function get_next_in_g5() {
    var trainer_poks = CURRENT_TRAINER_POKS
    var player_type1 = $('.type1').first().val()
    var player_type2 = $('.type2').first().val()

    if (player_type2 == "") {
        player_type2 = player_type1
    }

    var type_info = get_type_info([player_type1, player_type2])
    var ranked_trainer_poks = []
    var player = createPokemon($('#p1'))

    if (TITLE.includes("Cascade")) {
        var cascadeContext = g5BuildCascadeContext(player, player_type1, player_type2)
        var shouldApplyCascadeMatchupMod = settings.customCascadeSwitchAI || settings.customCascadeSwitchAIG4

        if (settings.customCascadeSwitchAIG4) {
            var phase1Results = g5BuildCascadeHybridPhase1Rankings(trainer_poks, player, cascadeContext)
            var phase2Results = g5BuildCascadePhase2Rankings(
                trainer_poks,
                player,
                cascadeContext,
                shouldApplyCascadeMatchupMod,
                phase1Results.phase1Ids
            )

            ranked_trainer_poks = g5FinalizeCascadeHybridRankings(phase1Results.phase1Mons, phase2Results)
            console.log(ranked_trainer_poks)
            return ranked_trainer_poks
        }

        ranked_trainer_poks = g5FinalizeRankedTrainerPoks(
            g5BuildCascadePhase2Rankings(trainer_poks, player, cascadeContext, shouldApplyCascadeMatchupMod)
        )
        console.log(ranked_trainer_poks)
        return ranked_trainer_poks
    }

    for (var i = 0; i < trainer_poks.length; i++) {
        var pok_name = trainer_poks[i].split(" (")[0]
        var tr_name = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[0]
        var strongest_move_bp = 0
        var strongest_move = "None"
        var sub_index = trainer_poks[i].split(" (")[1].replace(")", "").split("[")[1].replace("]", "")
        var pok_data = SETDEX_BW[pok_name][tr_name]
        var opposing = createPokemon(pok_name + " (" + tr_name + ")")
        var expYield = g5CalcTrainerPreviewExpYield(player, pok_name, opposing.level)

        for (var j = 0; j < opposing.moves.length; j++) {
            var move = opposing.moves[j]
            var moveName = move.name
            var moveBp = move.bp

            if (moveBp == 1) {
                moveBp = 60
            }

            var bp = moveBp * type_info[move.type]
            if (bp > strongest_move_bp) {
                strongest_move_bp = bp
                strongest_move = moveName
            } else if (bp == strongest_move_bp) {
                strongest_move += ", " + moveName
            }
        }

        ranked_trainer_poks.push([trainer_poks[i], strongest_move_bp, strongest_move, sub_index, pok_data["moves"], "", "", "", expYield])
    }

    ranked_trainer_poks = g5FinalizeRankedTrainerPoks(ranked_trainer_poks)
    console.log(ranked_trainer_poks)
    return ranked_trainer_poks
}
