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

function g5IsCascadeWhiteDevSource() {
    var sourceId = typeof params !== "undefined" && params && typeof params.get === "function" ? params.get("data") : ""
    return (typeof TITLE === "string" && TITLE.includes("Cascade White Dev")) || sourceId === "casc2"
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
    if (g5IsCascadeWhiteDevSource()) {
        return g5CascadeHasTera(pokemon) ? [g5CascadeFirstMoveType(pokemon)] : g5GetMatchupTypes(fallbackTypes[0], fallbackTypes[1])
    }
    if (pokemon.item && pokemon.item.startsWith("Tera ") && pokemon.moves[0] && pokemon.moves[0].type) {
        return [pokemon.moves[0].type]
    }

    return g5GetMatchupTypes(fallbackTypes[0], fallbackTypes[1])
}

function g5GetCascadePreviewTypePair(pokemon, fallbackTypes) {
    if (g5IsCascadeWhiteDevSource() && g5CascadeHasTera(pokemon)) {
        var teraType = g5CascadeFirstMoveType(pokemon)
        return [teraType, teraType]
    }
    if (g5IsCascadeWhiteDevSource()) {
        return [fallbackTypes[0], fallbackTypes[1] || fallbackTypes[0]]
    }
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
    var cascadeToggle = $('.cascade-effects input:checked')[0]
    var fieldEffects = typeof FIELD_EFFECTS !== "undefined" ? Object.assign({}, FIELD_EFFECTS) : {}
    // resetField clears the radio without dispatching the FIELD_EFFECTS click handler.
    if (cascadeToggle) fieldEffects = cascadeToggle.value ? { [cascadeToggle.id]: true } : {}

    return {
        player: player,
        playerType1: playerType1,
        playerType2: playerType2,
        playerTypePair: g5GetCascadePreviewTypePair(player, [playerType1, playerType2]),
        playerMatchupTypes: g5GetCascadePreviewTypes(player, [playerType1, playerType2]),
        playerAbility: $("#abilityL1").val(),
        playerStatus: $("#statusL1").val(),
        playerHp: parseInt($("#p1").find(".percent-hp").val()),
        playerMovePPs: [1, 2, 3, 4].map(function(index) { return parseInt($("#p1").find(".move" + index + " .move-pp").val()) }),
        field: typeof createField === "function" ? createField() : null,
        fieldEffects: fieldEffects,
        weather: weatherToggle ? weatherToggle.value : "",
        weatherTypes: {Sun: "Fire", Hail: "Ice", Sand: "Rock", Rain: "Water"},
        immunities: {"Dry Skin": "Water", "Flash Fire": "Fire", "Well-Baked Body": "Fire", "Levitate": "Ground", "Sap Sipper": "Grass", "Motor Drive": "Electric", "Storm Drain": "Water", "Volt Absorb": "Electric", "Water Absorb": "Water", "Lightning Rod": "Electric", "Thunder Armor": "Electric"},
        resistances: {"Slush Rush": "Ice", "Swift Swim": "Water", "Sand Rush": "Ground", "Justified": "Dark", "Toxic Boost": "Poison"}
    }
}

function g5GetCascadeTrainerPreviewInfo(trainerPok, player) {
    var pokName = trainerPok.split(" (")[0]
    var trName = trainerPok.split(" (")[1].replace(")", "").split("[")[0]
    var subIndex = trainerPok.split(" (")[1].replace(")", "").split("[")[1].replace("]", "")
    var types = pokedex[pokName].types
    var pokData = SETDEX_BW[pokName][trName]
    var opposing = createPokemon(pokName + " (" + trName + ")")
    var expYield = g5CalcTrainerPreviewExpYield(player, pokName, opposing.level)

    if (pokName == "Ditto" && g5IsCascadeWhiteDevSource()) {
        var transformedInfo = g5BuildCascadeDittoPreviewInfo(player, opposing, types, pokData)
        opposing = transformedInfo.opposing
        types = transformedInfo.types
        pokData = transformedInfo.pokData
    }

    return {
        trainerPok: trainerPok,
        pokName: pokName,
        trName: trName,
        subIndex: subIndex,
        types: types,
        pokData: pokData,
        opposing: opposing,
        isDittoPreview: pokName == "Ditto" && g5IsCascadeWhiteDevSource(),
        expYield: expYield
    }
}

function g5GetCascadePokemonTypes(pokemon, fallbackTypes) {
    if (!pokemon || !pokemon.types || !pokemon.types.length) {
        return fallbackTypes
    }

    var types = pokemon.types.filter(function(type) { return !!type && type !== "None" })
    if (!types.length) {
        return fallbackTypes
    }

    return [types[0], types[1] || types[0]]
}

function g5GetCascadePokemonMoveNames(pokemon, fallbackMoves) {
    if (!pokemon || !pokemon.moves || !pokemon.moves.length) {
        return fallbackMoves
    }

    var moveNames = pokemon.moves
        .map(function(move) { return move && move.name ? move.name : "" })
        .filter(function(moveName) { return !!moveName && moveName !== "(No Move)" })

    return moveNames.length ? moveNames : fallbackMoves
}

function g5BuildCascadeDittoPreviewInfo(player, opposing, fallbackTypes, pokData) {
    var transformed = player && typeof player.clone === "function" ? player.clone() : null
    if (!transformed) {
        return {
            opposing: opposing,
            types: fallbackTypes,
            pokData: pokData
        }
    }

    // The switch scorer replaces MonData with the defender itself, including
    // its held item; this is different from an actual Imposter transformation.
    return {
        opposing: transformed,
        types: g5GetCascadePokemonTypes(player, fallbackTypes),
        pokData: Object.assign({}, pokData, {
            ability: transformed.ability,
            moves: g5GetCascadePokemonMoveNames(transformed, pokData.moves)
        })
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
    if (!Number.isFinite(effectiveness)) {
        return 4
    }
    if (effectiveness <= 0) {
        return 1
    }

    // A2_AIChanges.cpp: ConvertToEffectivenessScore maps quarter/half/neutral/
    // double/quadruple effectiveness to 1/2/4/8/16 (immunity also scores 1).
    return Math.max(1, Math.min(16, effectiveness * 4))
}

function g5GetCascadeHybridTypingScore(opposing, switchInTypePair, cascadeContext) {
    var typeModifier = false
    if (opposing.hasAbility("Scrappy", "Corrosion", "Inner Focus")) {
        typeModifier = opposing.ability
    }

    // The ROM passes a raw type ID, not a packed monotype, for a Tera defender.
    // PokeTypePair_GetType1(rawType) is Normal; GetType2(rawType) is the Tera type.
    var targetPair = g5IsCascadeWhiteDevSource() && cascadeContext.player && g5CascadeHasTera(cascadeContext.player)
        ? ["Normal", g5CascadeFirstMoveType(cascadeContext.player)] : cascadeContext.playerTypePair
    var typeInfo = g5IsCascadeWhiteDevSource()
        ? g5CascadeGameTypeInfo(targetPair, typeModifier, cascadeContext)
        : get_type_info([cascadeContext.playerTypePair[0], cascadeContext.playerTypePair[1]], typeModifier)
    var firstEffectiveness = Number.isFinite(typeInfo[switchInTypePair[0]]) ? typeInfo[switchInTypePair[0]] : 1
    var secondEffectiveness = Number.isFinite(typeInfo[switchInTypePair[1]]) ? typeInfo[switchInTypePair[1]] : 1

    return g5GetCascadeHybridScoreMultiplier(firstEffectiveness) * g5GetCascadeHybridScoreMultiplier(secondEffectiveness)
}

function g5BuildCascadeHybridPhase1Rankings(trainerPoks, player, cascadeContext) {
    var phase1Mons = []
    var phase1Ids = {}
    var useGameRules = g5IsCascadeWhiteDevSource()

    for (var i = 0; i < trainerPoks.length; i++) {
        var info = g5GetCascadeTrainerPreviewInfo(trainerPoks[i], player)
        var opposing = info.opposing
        var opposingIgnoresAbilities = useGameRules ? g5CascadeIgnoresAbilities(opposing) : g5TrainerIgnoresAbilities(opposing)
        var switchInTypePair = g5GetCascadePreviewTypePair(opposing, info.types)
        var qualifyingMoves = []

        for (var j = 0; j < opposing.moves.length; j++) {
            var move = opposing.moves[j]
            if (!g5CascadeMoveHasPP(info, move, j, cascadeContext)) {
                continue
            }
            var moveName = move.name
            var moveTypeInfo = useGameRules ? g5CascadeGameMoveType(move, opposing, cascadeContext) : g5GetCascadeHybridEffectiveType(move, moveName, opposing, cascadeContext)
            var defensiveTypeInfo = g5GetCascadePhase2TypeInfo(opposing, moveName, cascadeContext.playerType1, cascadeContext.playerType2)
            var moveEffectiveness = Number.isFinite(defensiveTypeInfo[moveTypeInfo.type]) ? defensiveTypeInfo[moveTypeInfo.type] : 1

            if (useGameRules) {
                moveEffectiveness = g5CascadeGameMoveEffectiveness(move, moveTypeInfo.type, opposing, cascadeContext, true)
            } else if (!opposingIgnoresAbilities) {
                if (cascadeContext.immunities[cascadeContext.playerAbility] && moveTypeInfo.type == cascadeContext.immunities[cascadeContext.playerAbility]) {
                    moveEffectiveness = 0
                } else if (g5IsCascadeAbilityImmuneToMove(move, moveTypeInfo.type, cascadeContext.playerAbility)) {
                    moveEffectiveness = 0
                }
            }

            if (moveEffectiveness > 1) {
                qualifyingMoves.push(moveName)
                if (useGameRules) break
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
    if (g5IsCascadeWhiteDevSource()) {
        return g5BuildCascadeDevPhase2Rankings(trainerPoks, player, cascadeContext, applyCascadeMatchupMod, excludedIds)
    }
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
            if (typeInfo[moveType] < 1 && (opposing.hasAbility("Tenacity") || opposing.hasAbility("Tinted Lens"))) {
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

// CascadeWhite2CodeInjection/A_CoreBattle/A2_AIChanges.cpp:
// PickBestMonToSwitchInto, Phase2PickBestMonToSwitchInto and CheckRatio.
function g5CascadeHasTera(pokemon) {
    if (!pokemon) return false
    if (pokemon.isTerastallized || (pokemon.teraType && pokemon.teraType != "None")) return true
    // isTeraItem: IDs 228, 257, 298..313. Tera Plate (544) is intentionally
    // absent: it can activate Tera, but this preview helper omits it in game.
    var item = String(pokemon.item || "").toLowerCase().replace(/[^a-z0-9]/g, "")
    return /^tera(gem|eviolite|specs|cband|scarf|cscarf|orb|sash|fband|claw|wpolicy|bpolicy|powder|vest|insurance|drill|leftovers|dice|krock)$/.test(item)
}

function g5CascadeFirstMoveType(pokemon) {
    var move = pokemon.moves && pokemon.moves[0]
    var data = move && g5CascadeMoveData(move)
    return data && data.type || move && move.type || "Normal"
}

function g5CascadeMoveData(move) {
    if (typeof moves === "undefined") return null
    // Typed Hidden Power entries are calculator aliases of the same ROM move.
    var name = /^(?:Hidden Power|HP)\s+\w+$/.test(move.name) ? "Hidden Power" : move.name
    return moves[name] || moves[move.name]
}

function g5CascadeMoveHasPP(info, move, moveIndex, cascadeContext) {
    if (typeof move.pp === "number") {
        return move.pp > 0
    }
    if (info.isDittoPreview) {
        var copiedPP = cascadeContext && cascadeContext.playerMovePPs && cascadeContext.playerMovePPs[moveIndex]
        return !Number.isFinite(copiedPP) || copiedPP > 0
    }
    var setId = info.trainerPok.split("[")[0]
    var savedPP = typeof movePPs !== "undefined" && movePPs[setId]
    return !savedPP || typeof savedPP[moveIndex] === "undefined" || Number(savedPP[moveIndex]) > 0
}

function g5CascadeIgnoresAbilities(pokemon) {
    return pokemon.hasAbility("Mold Breaker", "Teravolt", "Turboblaze") || pokemon.hasItem("Tera Drill", "Ability Drill")
}

function g5CascadeGameMoveType(move, opposing, cascadeContext) {
    // The game converts all Normal moves, including Judgment and Natural Gift,
    // then overrides Weather Ball/Crash and Techno Blast separately.
    var data = g5CascadeMoveData(move)
    var originalType = data && data.type || move.type
    var ateTypes = { Aerilate: "Flying", Pixilate: "Fairy", Galvanize: "Electric", Moisturize: "Water", Refrigerate: "Ice" }
    var type = opposing.hasAbility("Normalize") ? "Normal" : originalType == "Normal" && ateTypes[opposing.ability] || originalType
    var hasAteTypeChange = opposing.hasAbility("Normalize") || type != originalType
    if (move.named("Weather Ball", "Weather Crash")) {
        type = cascadeContext.weather == "Sun" || opposing.hasAbility("Solar Power", "Chlorophyll", "Flower Gift")
            ? "Fire" : cascadeContext.weatherTypes[cascadeContext.weather] || "Normal"
        hasAteTypeChange = false
    } else if (move.named("Techno Blast")) {
        type = { "Chill Drive": "Ice", "Douse Drive": "Water", "Burn Drive": "Fire", "Shock Drive": "Electric" }[opposing.item] || "Normal"
        hasAteTypeChange = false
    }
    return { type: type, hasAteTypeChange: hasAteTypeChange }
}

function g5CascadeGameImmune(move, moveType, playerAbility) {
    // These two checks use explicit move lists in the ROM, not generic flags.
    var bulletMoves = ["Acid Spray", "Aura Sphere", "Barrage", "Bullet Seed", "Egg Bomb", "Electro Ball", "Energy Ball", "Focus Blast", "Gyro Ball", "Boomburst", "Magnet Bomb", "Mud Bomb", "Octazooka", "Pollen Puff", "Rock Blast", "Rock Wrecker", "Seed Bomb", "Shadow Ball", "Sludge Bomb", "Weather Ball", "Zap Cannon"]
    var windMoves = ["Air Slash", "Hurricane", "Heat Wave", "Ominous Wind", "Silver Wind", "Gust", "Blizzard", "Petal Blizzard", "Fairy Wind", "Diamond Storm", "Razor Winds", "Aeroblast", "Icy Wind", "Tailwind", "Twister", "Whirlwind", "Air Cutter"]
    return ((playerAbility == "Amplifier" || playerAbility == "Soundproof") && g5MoveHasFlag(move, "sound")) ||
        (playerAbility == "Bulletproof" && bulletMoves.includes(move.name)) ||
        (playerAbility == "Wind Rider" && windMoves.includes(move.name))
}

function g5CascadeGameTypeInfo(typePair, modifier, cascadeContext) {
    if (typeof calc === "undefined" || !calc.TYPE_CHART) return get_type_info(typePair.slice(), modifier)
    var chart = calc.TYPE_CHART[6]
    var effects = cascadeContext && cascadeContext.fieldEffects || {}
    var result = {}
    // The ROM's altered-effectiveness helpers use its ordinary chart even on
    // special fields. That chart matches all 324 entries of TYPE_CHART[6].
    Object.keys(chart).forEach(function(attackType) {
        var altered = modifier && !((modifier == "Scrappy" && !["Normal", "Fighting"].includes(attackType)) ||
            (modifier == "Corrosion" && attackType != "Poison") ||
            (modifier == "Inner Focus" && attackType != "Psychic"))
        result[attackType] = 1
        Array.from(new Set(typePair)).forEach(function(defenseType) {
            if (!defenseType || defenseType == "None") return
            var effectiveness = chart[attackType][defenseType] === undefined ? 1 : chart[attackType][defenseType]
            if (!altered) {
                if (effects.chargestone && attackType == "Electric" && defenseType == "Ground") effectiveness = 0.5
                if (effects.celestial && ((attackType == "Ghost" && defenseType == "Normal") || (attackType == "Psychic" && defenseType == "Dark"))) effectiveness = 0.5
            } else if (modifier == "Normalize" || modifier == "Chip Away") effectiveness = 1
            else if (modifier == "Sky Uppercut") {
                if (attackType == "Fighting" && defenseType == "Flying") effectiveness = 2
            } else {
                if (attackType == "Ice" && defenseType == "Water") effectiveness = 2
                if (attackType == "Poison" && defenseType == "Steel") effectiveness = 2
                if (attackType == "Psychic" && defenseType == "Dark") effectiveness = 1
                if (["Normal", "Fighting"].includes(attackType) && defenseType == "Ghost") effectiveness = 1
            }
            result[attackType] *= effectiveness
        })
    })
    return result
}

function g5CascadeServerWeather(cascadeContext) {
    return ["Air Lock", "Cloud Nine"].includes(cascadeContext.playerAbility) ? "" : cascadeContext.weather
}

function g5CascadeGameSpeed(pokemon, cascadeContext, playerSide) {
    var speed = pokemon.rawStats ? pokemon.rawStats.spe : pokemon.stats.spe
    var boost = pokemon.boosts && pokemon.boosts.spe || 0
    speed = Math.floor(speed * (boost >= 0 ? (2 + boost) / 2 : 2 / (2 - boost)))
    var modifiers = []
    var field = cascadeContext.field
    var weather = g5CascadeServerWeather(cascadeContext)
    var itemActive = !(field && field.isMagicRoom) && !pokemon.embargo && !pokemon.hasAbility("Klutz")
    var floating = !(field && field.isGravity) && !(itemActive && pokemon.hasItem("Iron Ball")) &&
        ((pokemon.types || []).includes("Flying") || pokemon.hasAbility("Levitate") || (itemActive && pokemon.hasItem("Air Balloon")) || pokemon.magnetRise)
    if (cascadeContext.fieldEffects && cascadeContext.fieldEffects.mistralton && floating) modifiers.push(6144)
    if (pokemon.hasAbility("Light Metal")) modifiers.push(6144)
    if (pokemon.hasAbility("Heavy Metal")) modifiers.push(2730)
    if ((pokemon.hasAbility("Chlorophyll") && weather == "Sun") ||
        (pokemon.hasAbility("Swift Swim") && weather == "Rain") ||
        (pokemon.hasAbility("Sand Rush") && weather == "Sand") ||
        (pokemon.hasAbility("Slush Rush") && weather == "Hail") ||
        (pokemon.hasAbility("Unburden") && pokemon.abilityOn && !pokemon.item)) modifiers.push(8192)
    if (pokemon.hasAbility("Quick Feet") && pokemon.status) modifiers.push(6144)
    if (pokemon.hasAbility("Slow Start") && pokemon.abilityOn) modifiers.push(2048)
    if (itemActive && pokemon.hasItem("Choice Scarf", "Tera Scarf", "Tera C-Scarf", "Mascot Badge")) modifiers.push(6144)
    if (itemActive && pokemon.hasItem("Iron Ball", "Macho Brace", "Power Anklet", "Power Band", "Power Belt", "Power Bracer", "Power Lens", "Power Weight")) modifiers.push(2048)
    var side = field && (playerSide ? field.attackerSide : field.defenderSide)
    if (side && side.isTailwind) modifiers.push(8192)
    var combined = modifiers.reduce(function(ratio, modifier) { return Math.floor((ratio * modifier + 2048) / 4096) }, 4096)
    combined = Math.max(410, Math.min(131072, combined))
    // The injected speed routine replaces the modified result with one quarter
    // of the staged stat when paralyzed; it does not divide the final speed.
    speed = g5ExpMulRatio(speed, pokemon.status == "par" && !pokemon.hasAbility("Quick Feet") ? 1024 : combined)
    return Math.max(0, Math.min(10000, speed))
}

function g5CascadeGameMoveEffectiveness(move, moveType, opposing, cascadeContext, phase1) {
    var modifier = false
    if ((opposing.hasAbility("Scrappy") && ["Normal", "Fighting"].includes(moveType)) ||
        (opposing.hasAbility("Corrosion") && moveType == "Poison") ||
        (opposing.hasAbility("Inner Focus") && moveType == "Psychic")) {
        modifier = opposing.ability
    } else if (move.named("Freeze-Dry", "Sacred Sword", "Sky Uppercut", "Chip Away")) {
        modifier = move.name
    } else if (opposing.hasAbility("Normalize")) {
        modifier = "Normalize"
    }
    var typePair = cascadeContext.playerTypePair || [cascadeContext.playerType1, cascadeContext.playerType2]
    var effectiveness = g5CascadeGameTypeInfo(typePair, modifier, cascadeContext)[moveType]
    if (!g5CascadeIgnoresAbilities(opposing) &&
        (cascadeContext.immunities[cascadeContext.playerAbility] == moveType || g5CascadeGameImmune(move, moveType, cascadeContext.playerAbility))) {
        effectiveness = 0
    }
    if (phase1 && opposing.hasAbility("Normalize") && !move.named("Natural Gift", "Techno Blast", "Weather Ball", "Weather Crash")) {
        effectiveness = 1
    }
    return effectiveness
}

function g5CascadeGameRatio(value, move, movData, opposing, player, cascadeContext, info) {
    var hpRatio = function(pokemon) {
        return typeof pokemon.curHP === "function" && typeof pokemon.maxHP === "function" ? Math.round(pokemon.curHP() * 409600 / pokemon.maxHP()) : 409600
    }
    if (move.named("Venoshock")) return /^(psn|tox)$/.test(player.status) || ["Poisoned", "Badly Poisoned"].includes(cascadeContext.playerStatus) ? value * 2 : value
    if (move.named("Brine")) return hpRatio(player) <= 204800 ? value * 2 : value
    if (move.named("Focus Punch")) return Math.floor(value / 2)
    if (move.named("Flail", "Reversal")) {
        var ratio = hpRatio(opposing)
        return value * (ratio == 409600 ? 1 : ratio >= 281600 ? 2 : ratio >= 145000 ? 4 : ratio >= 85300 ? 8 : ratio >= 42700 ? 10 : ratio >= 17100 ? 15 : 20)
    }
    if (move.named("Eruption", "Water Spout")) {
        var ratio = hpRatio(opposing)
        return ratio == 409600 ? value : ratio < 204800 ? 0 : Math.floor(value / 16) * Math.floor(ratio / 25600)
    }
    var copiedPlayer = !!(info && info.isDittoPreview)
    if (move.named("Electro Ball")) return g5CascadeGameSpeed(opposing, cascadeContext, copiedPlayer) > g5CascadeGameSpeed(player, cascadeContext, true) ? value * 2 : value
    if (move.named("Hex", "Barb Barrage", "Beat Up", "Bitter Malice", "Infernal Parade")) return cascadeContext.playerStatus != "Healthy" ? value * 2 : value
    if (move.named("Acrobatics")) return !opposing.item || opposing.hasItem("Flying Gem") ? value * 2 : value
    var hitMax = Array.isArray(movData.multihit) ? movData.multihit[1] : movData.multihit
    if (hitMax == 2 || hitMax == 3) return value * hitMax
    if (move.named("Dream Eater", "Wake-Up Slap")) return cascadeContext.playerStatus == "Asleep" ? value * 2 : value
    // Ditto substitutes the actual defender, including its mon ID: Retaliate
    // therefore checks the player's faint record instead of the trainer's.
    if (move.named("Retaliate")) return copiedPlayer && !cascadeContext.playerAllyFaintedThisTurn ? value : value * 2
    if (movData.willCrit || movData.critStage == 6 || movData.critRatio == 7) {
        if (player.defenseCurl || player.luckyChant || (!g5CascadeIgnoresAbilities(opposing) && player.hasAbility("Battle Armor", "Shell Armor"))) return value
        return value * (opposing.hasAbility("Sniper") ? 3 : 2)
    }
    if (hitMax == 5) return value * (opposing.hasAbility("Skill Link") ? 6 : opposing.hasItem("Loaded Dice", "Tera Dice") ? 4 : 2)
    if (move.named("Gyro Ball", "Revenge", "Avalanche", "Payback")) return g5CascadeGameSpeed(opposing, cascadeContext, copiedPlayer) < g5CascadeGameSpeed(player, cascadeContext, true) ? value * 2 : value
    if (move.named("Solar Beam", "Solar Blade")) return g5CascadeServerWeather(cascadeContext) == "Sun" || opposing.hasItem("Power Herb") || opposing.hasAbility("Chlorophyll", "Solar Power", "Flower Gift") ? value : Math.floor(value / 2)
    if (move.named("Electro Shot")) return g5CascadeServerWeather(cascadeContext) == "Rain" || opposing.hasItem("Power Herb") ? value : Math.floor(value / 2)
    if (move.named("Skull Bash", "Meteor Beam", "Sky Attack")) return opposing.hasItem("Power Herb") ? value : Math.floor(value / 2)
    if (move.named("Grass Knot", "Low Kick")) {
        // The game's helper takes and returns u16 despite receiving Q16 power.
        var truncated = value & 65535
        var weight = player.weightkg || 0
        var multiplier = weight < 10 ? 24576 : weight < 25 ? 12288 : weight < 50 ? 8192 : weight < 100 ? 6144 : weight < 200 ? 4915 : 4096
        return g5ExpMulRatio(truncated, multiplier) & 65535
    }
    return value
}

function g5BuildCascadeDevPhase2Rankings(trainerPoks, player, cascadeContext, applyCascadeMatchupMod, excludedIds) {
    return trainerPoks.filter(function(setId) { return !excludedIds || !excludedIds[setId] }).map(function(setId) {
        var info = g5GetCascadeTrainerPreviewInfo(setId, player)
        var opposing = info.opposing
        var strongestPower = 0
        var strongestMoves = []
        opposing.moves.forEach(function(move, moveIndex) {
            var movData = g5CascadeMoveData(move)
            if (!movData || !g5CascadeMoveHasPP(info, move, moveIndex, cascadeContext)) return
            var basePower = Number(typeof movData.basePower !== "undefined" ? movData.basePower : typeof movData.bp !== "undefined" ? movData.bp : move.bp)
            if (!Number.isFinite(basePower) || basePower <= 0) return
            // The source leaves phase 2's local atkAbility uninitialized for
            // non-Ditto candidates. Use the candidate's ability here; reproducing
            // an arbitrary register value requires tracing the compiled ROM.
            var typeInfo = g5CascadeGameMoveType(move, opposing, cascadeContext)
            if (move.named("Weather Ball", "Weather Crash") && typeInfo.type != "Normal") basePower = 100
            else if (typeInfo.hasAteTypeChange) basePower = g5ExpMulRatio(basePower, 4505)
            var effectiveness = g5CascadeGameMoveEffectiveness(move, typeInfo.type, opposing, cascadeContext, false)
            var value = Math.floor(basePower * effectiveness * 65536)
            if (value > 0) {
                value = g5CascadeGameRatio(value, move, movData, opposing, player, cascadeContext, info)
                // Technician checks the move table BP, after the special move ratio.
                var tablePower = Number(typeof movData.basePower !== "undefined" ? movData.basePower : typeof movData.bp !== "undefined" ? movData.bp : move.bp)
                if (opposing.hasAbility("Technician") && tablePower <= 60) value += Math.floor(value / 2)
                var stabTypes = info.types
                var originalTypes = typeof pokedex !== "undefined" && pokedex[opposing.name] ? pokedex[opposing.name].types : stabTypes
                if (stabTypes.includes(typeInfo.type) || opposing.hasAbility("Savant") || (g5CascadeHasTera(opposing) && (originalTypes.includes(typeInfo.type) || g5CascadeFirstMoveType(opposing) == typeInfo.type))) value += Math.floor(value / 2)
                if (!g5CascadeIgnoresAbilities(opposing)) {
                    var ability = cascadeContext.playerAbility
                    if (ability == "Heatproof" && typeInfo.type == "Fire") value = Math.floor(value / 4)
                    if (ability == "Thick Fat" && ["Fire", "Ice"].includes(typeInfo.type)) value = Math.floor(value / 2)
                    if (["Dry Skin", "Fluffy"].includes(ability) && typeInfo.type == "Fire") value *= 2
                    var resistances = { "Toxic Boost": "Poison", "Swift Swim": "Water", "Slush Rush": "Ice", "Sand Rush": "Rock", "Justified": "Dark" }
                    if (resistances[ability] == typeInfo.type) value = Math.floor(value / 2)
                    if (opposing.hasAbility("Tinted Lens", "Tenacity") && effectiveness < 1) value *= 2
                }
            }
            var power = Math.floor(value / 65536)
            if (applyCascadeMatchupMod) power = g5ApplyCascadeMatchupBpMod(power, cascadeContext.playerMatchupTypes, g5GetCascadePreviewTypes(opposing, info.types))
            if (power > strongestPower) { strongestPower = power; strongestMoves = [move.name] }
            else if (power == strongestPower && power > 0) strongestMoves.push(move.name)
        })
        return [info.trainerPok, strongestPower, strongestMoves.join(", ") || "None", info.subIndex, info.pokData.moves, "", "", "", info.expYield]
    })
}

function g5CascadeGameSortRankings(rankings) {
    // The ROM swaps out-of-order pairs immediately. This is not a stable sort:
    // later higher scores can reverse two equal-scoring party slots.
    for (var j = 0; j < rankings.length; j++) {
        for (var k = j + 1; k < rankings.length; k++) {
            if (rankings[j][1] < rankings[k][1]) {
                var entry = rankings[j]
                rankings[j] = rankings[k]
                rankings[k] = entry
            }
        }
    }
    return rankings
}

function g5BuildCascadeDevHybridRankings(trainerPoks, player, cascadeContext) {
    var inactive = []
    var currentId = typeof getOpposingFaintDataId === "function" ? getOpposingFaintDataId() : ""
    var eligible = trainerPoks.slice().sort(function(a, b) {
        var indexA = a.match(/\[(\d+)\]$/)
        var indexB = b.match(/\[(\d+)\]$/)
        return (indexA ? Number(indexA[1]) : 0) - (indexB ? Number(indexB[1]) : 0)
    }).filter(function(setId) {
        var dataId = setId.split("[")[0]
        var unavailable = dataId == currentId || (typeof fainted !== "undefined" && (fainted.includes(setId) || fainted.includes(dataId)))
        if (unavailable) {
            var info = g5GetCascadeTrainerPreviewInfo(setId, player)
            inactive.push([setId, 0, "None", info.subIndex, info.pokData.moves, "", "", "", info.expYield])
        }
        return !unavailable
    })
    var phase1 = g5BuildCascadeHybridPhase1Rankings(eligible, player, cascadeContext)
    var rankings
    if (phase1.phase1Mons.length) {
        // Phase 2 is a global fallback, not a second scoring pass for the
        // candidates lacking a super-effective move while phase 1 succeeds.
        rankings = eligible.map(function(setId) {
            var scored = phase1.phase1Mons.find(function(row) { return row[0] == setId })
            if (scored) return scored
            var info = g5GetCascadeTrainerPreviewInfo(setId, player)
            return [setId, 0, "None", info.subIndex, info.pokData.moves, "", "", "", info.expYield]
        })
    } else {
        rankings = g5BuildCascadeDevPhase2Rankings(eligible, player, cascadeContext, false)
    }
    return settings.noSwitch ? rankings.concat(inactive).sort(sort_subindex) : g5CascadeGameSortRankings(rankings).concat(inactive)
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
        var shouldApplyCascadeMatchupMod = settings.customCascadeSwitchAI

        if (settings.customCascadeSwitchAIG4) {
            if (g5IsCascadeWhiteDevSource()) {
                ranked_trainer_poks = g5BuildCascadeDevHybridRankings(trainer_poks, player, cascadeContext)
                console.log(ranked_trainer_poks)
                return ranked_trainer_poks
            }
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
