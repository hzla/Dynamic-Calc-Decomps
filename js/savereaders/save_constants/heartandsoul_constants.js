var heartAndSoulSaveConstants = {
  "title": "Heart & Soul 2.0.6",
  "layout": {
    "SpeciesInfo": {
      "size": 268,
      "baseHP": 0,
      "baseAttack": 1,
      "baseDefense": 2,
      "baseSpeed": 3,
      "baseSpAttack": 4,
      "baseSpDefense": 5,
      "types": 6,
      "genderRatio": 18,
      "growthRate": 21,
      "abilities": 24,
      "speciesName": 44,
      "weight": 64,
      "height": 62,
      "levelUpLearnset": 152,
      "teachableLearnset": 156,
      "eggMoveLearnset": 160,
      "formSpeciesIdTable": 168
    },
    "MoveInfo": {
      "size": 68,
      "name": 0,
      "description": 4,
      "effect": 8,
      "pp": 14,
      "argument": 32,
      "type": {
        "bit": 80,
        "width": 5
      },
      "category": {
        "bit": 85,
        "width": 2
      },
      "power": {
        "bit": 87,
        "width": 9
      },
      "accuracy": {
        "bit": 96,
        "width": 7
      },
      "target": {
        "bit": 103,
        "width": 9
      },
      "priority": {
        "bit": 160,
        "width": 4
      },
      "strikeCount": {
        "bit": 164,
        "width": 4
      },
      "multiHit": {
        "bit": 168,
        "width": 1
      },
      "explosion": {
        "bit": 169,
        "width": 1
      },
      "criticalHitStage": {
        "bit": 170,
        "width": 2
      },
      "alwaysCriticalHit": {
        "bit": 172,
        "width": 1
      },
      "makesContact": {
        "bit": 176,
        "width": 1
      },
      "ignoresProtect": {
        "bit": 177,
        "width": 1
      },
      "magicCoatAffected": {
        "bit": 178,
        "width": 1
      },
      "snatchAffected": {
        "bit": 179,
        "width": 1
      },
      "punchingMove": {
        "bit": 181,
        "width": 1
      },
      "bitingMove": {
        "bit": 182,
        "width": 1
      },
      "pulseMove": {
        "bit": 183,
        "width": 1
      },
      "soundMove": {
        "bit": 184,
        "width": 1
      },
      "ballisticMove": {
        "bit": 185,
        "width": 1
      },
      "powderMove": {
        "bit": 186,
        "width": 1
      },
      "danceMove": {
        "bit": 187,
        "width": 1
      },
      "windMove": {
        "bit": 188,
        "width": 1
      },
      "slicingMove": {
        "bit": 189,
        "width": 1
      },
      "healingMove": {
        "bit": 190,
        "width": 1
      },
      "ignoresTargetAbility": {
        "bit": 192,
        "width": 1
      },
      "ignoresTargetDefenseEvasionStages": {
        "bit": 193,
        "width": 1
      },
      "ignoresSubstitute": {
        "bit": 200,
        "width": 1
      }
    },
    "AbilityInfo": {
      "size": 28,
      "name": 0,
      "description": 20
    },
    "ItemInfo": {
      "size": 44,
      "name": 20,
      "description": 12
    },
    "TrainerMon": {
      "size": 36,
      "nickname": 0,
      "ev": 4,
      "iv": 8,
      "moves": 12,
      "species": 20,
      "heldItem": 22,
      "ability": 24,
      "lvl": 26,
      "ball": 27,
      "friendship": 28,
      "tags": 32,
      "nature": {
        "bit": 232,
        "width": 5
      },
      "gender": {
        "bit": 237,
        "width": 2
      },
      "isShiny": {
        "bit": 239,
        "width": 1
      },
      "teraType": {
        "bit": 240,
        "width": 5
      }
    },
    "Trainer": {
      "size": 52,
      "aiFlags": 0,
      "party": 8,
      "items": 12,
      "trainerClass": 28,
      "trainerPic": 30,
      "trainerName": 31,
      "partySize": 43,
      "poolSize": 44,
      "poolRuleIndex": 45,
      "gender": {
        "bit": 239,
        "width": 1
      },
      "battleType": {
        "bit": 336,
        "width": 2
      }
    },
    "TrainerClass": {
      "size": 16,
      "name": 0
    },
    "LevelUpMove": {
      "size": 4,
      "move": 0,
      "level": 2
    },
    "SaveBlock1": {
      "size": 15760,
      "saveVersion": 0,
      "playerPartyCount": 568,
      "playerParty": 572
    },
    "SaveBlock2": {
      "size": 3892,
      "playerName": 0,
      "playerTrainerId": 10
    },
    "SaveBlock3": {
      "size": 52,
      "challengeSettings": 16
    },
    "PokemonStorage": {
      "size": 34144,
      "boxes": 4,
      "boxNames": 33604,
      "fusions": 33744
    },
    "BoxPokemon": {
      "size": 80,
      "personality": 0,
      "otId": 4,
      "nickname": 8,
      "checksum": 28,
      "secure": 32,
      "hiddenNatureModifier": {
        "bit": 147,
        "width": 5
      },
      "isBadEgg": {
        "bit": 152,
        "width": 1
      },
      "hasSpecies": {
        "bit": 153,
        "width": 1
      },
      "isEgg": {
        "bit": 154,
        "width": 1
      },
      "shinyModifier": {
        "bit": 254,
        "width": 1
      }
    },
    "Pokemon": {
      "size": 100,
      "status": 80,
      "level": 84,
      "hp": 86,
      "maxHP": 88
    },
    "PokemonSubstruct0": {
      "species": {
        "bit": 0,
        "width": 11
      },
      "heldItem": {
        "bit": 16,
        "width": 10
      },
      "experience": {
        "bit": 32,
        "width": 21
      },
      "nickname11": {
        "bit": 53,
        "width": 8
      },
      "nickname12": {
        "bit": 86,
        "width": 8
      }
    },
    "PokemonSubstruct1": {
      "move1": {
        "bit": 0,
        "width": 11
      },
      "move2": {
        "bit": 16,
        "width": 11
      },
      "move3": {
        "bit": 32,
        "width": 11
      },
      "move4": {
        "bit": 48,
        "width": 11
      },
      "hyperTrainedHP": {
        "bit": 62,
        "width": 1
      },
      "hyperTrainedAttack": {
        "bit": 63,
        "width": 1
      },
      "hyperTrainedDefense": {
        "bit": 71,
        "width": 1
      },
      "hyperTrainedSpeed": {
        "bit": 79,
        "width": 1
      },
      "hyperTrainedSpAttack": {
        "bit": 87,
        "width": 1
      },
      "hyperTrainedSpDefense": {
        "bit": 95,
        "width": 1
      }
    },
    "PokemonSubstruct3": {
      "abilityNum": {
        "bit": 93,
        "width": 2
      },
      "isEgg": {
        "bit": 62,
        "width": 1
      }
    },
    "ChallengeSettings": {
      "tx_Mode_Fairy_Types": {
        "bit": 230,
        "width": 1
      },
      "tx_Mode_Modern_Moves": {
        "bit": 232,
        "width": 1
      },
      "tx_Mode_Legendary_Abilities": {
        "bit": 233,
        "width": 1
      },
      "tx_Challenges_NoEVs": {
        "bit": 76,
        "width": 1
      },
      "tx_Random_Abilities": {
        "bit": 39,
        "width": 1
      },
      "tx_Random_Type": {
        "bit": 37,
        "width": 1
      },
      "tx_Random_Moves": {
        "bit": 40,
        "width": 1
      },
      "tx_Random_Trainer": {
        "bit": 41,
        "width": 1
      },
      "tx_Challenges_TrainerScalingIVs": {
        "bit": 83,
        "width": 2
      },
      "tx_Challenges_TrainerScalingEVs": {
        "bit": 85,
        "width": 2
      },
      "tx_Challenges_BaseStatEqualizer": {
        "bit": 67,
        "width": 2
      }
    },
    "constants": {
      "NUM_SPECIES": 1573,
      "MOVES_COUNT_ALL": 935,
      "ABILITIES_COUNT": 311,
      "ITEMS_COUNT": 901,
      "TRAINERS_COUNT": 653,
      "DIFFICULTY_COUNT": 3,
      "DIFFICULTY_NORMAL": 1,
      "SECTOR_DATA_SIZE": 3968,
      "SAVE_VERSION": 5,
      "TOTAL_BOXES_COUNT": 14,
      "TARGET_BOTH": 6,
      "TARGET_FOES_AND_ALLY": 11,
      "TARGET_USER": 7,
      "PARTNER_COUNT": 7,
      "MAX_TRAINERS_COUNT": 864
    }
  },
  "species": {
    "1": {
      "name": "Bulbasaur",
      "define": "SPECIES_BULBASAUR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Chlorophyll"
      ]
    },
    "2": {
      "name": "Ivysaur",
      "define": "SPECIES_IVYSAUR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Chlorophyll"
      ]
    },
    "3": {
      "name": "Venusaur",
      "define": "SPECIES_VENUSAUR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Chlorophyll"
      ]
    },
    "4": {
      "name": "Charmander",
      "define": "SPECIES_CHARMANDER",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Solar Power"
      ]
    },
    "5": {
      "name": "Charmeleon",
      "define": "SPECIES_CHARMELEON",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Solar Power"
      ]
    },
    "6": {
      "name": "Charizard",
      "define": "SPECIES_CHARIZARD",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Solar Power"
      ]
    },
    "7": {
      "name": "Squirtle",
      "define": "SPECIES_SQUIRTLE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Rain Dish"
      ]
    },
    "8": {
      "name": "Wartortle",
      "define": "SPECIES_WARTORTLE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Rain Dish"
      ]
    },
    "9": {
      "name": "Blastoise",
      "define": "SPECIES_BLASTOISE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Rain Dish"
      ]
    },
    "10": {
      "name": "Caterpie",
      "define": "SPECIES_CATERPIE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        null,
        "Run Away"
      ]
    },
    "11": {
      "name": "Metapod",
      "define": "SPECIES_METAPOD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        null
      ]
    },
    "12": {
      "name": "Butterfree",
      "define": "SPECIES_BUTTERFREE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Compound Eyes",
        null,
        "Tinted Lens"
      ]
    },
    "13": {
      "name": "Weedle",
      "define": "SPECIES_WEEDLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        null,
        "Run Away"
      ]
    },
    "14": {
      "name": "Kakuna",
      "define": "SPECIES_KAKUNA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        null
      ]
    },
    "15": {
      "name": "Beedrill",
      "define": "SPECIES_BEEDRILL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        "Sniper"
      ]
    },
    "16": {
      "name": "Pidgey",
      "define": "SPECIES_PIDGEY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        "Tangled Feet",
        "Big Pecks"
      ]
    },
    "17": {
      "name": "Pidgeotto",
      "define": "SPECIES_PIDGEOTTO",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        "Tangled Feet",
        "Big Pecks"
      ]
    },
    "18": {
      "name": "Pidgeot",
      "define": "SPECIES_PIDGEOT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        "Tangled Feet",
        "Big Pecks"
      ]
    },
    "19": {
      "name": "Rattata",
      "define": "SPECIES_RATTATA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Guts",
        "Hustle"
      ]
    },
    "20": {
      "name": "Raticate",
      "define": "SPECIES_RATICATE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Guts",
        "Hustle"
      ]
    },
    "21": {
      "name": "Spearow",
      "define": "SPECIES_SPEAROW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        null,
        "Sniper"
      ]
    },
    "22": {
      "name": "Fearow",
      "define": "SPECIES_FEAROW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        null,
        "Sniper"
      ]
    },
    "23": {
      "name": "Ekans",
      "define": "SPECIES_EKANS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Intimidate",
        "Shed Skin",
        "Unnerve"
      ]
    },
    "24": {
      "name": "Arbok",
      "define": "SPECIES_ARBOK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Intimidate",
        "Shed Skin",
        "Unnerve"
      ]
    },
    "25": {
      "name": "Pikachu",
      "define": "SPECIES_PIKACHU",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "26": {
      "name": "Raichu",
      "define": "SPECIES_RAICHU",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "27": {
      "name": "Sandshrew",
      "define": "SPECIES_SANDSHREW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Veil",
        null,
        "Sand Rush"
      ]
    },
    "28": {
      "name": "Sandslash",
      "define": "SPECIES_SANDSLASH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Veil",
        null,
        "Sand Rush"
      ]
    },
    "29": {
      "name": "Nidoran-F",
      "define": "SPECIES_NIDORAN_F",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Rivalry",
        "Hustle"
      ]
    },
    "30": {
      "name": "Nidorina",
      "define": "SPECIES_NIDORINA",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Rivalry",
        "Hustle"
      ]
    },
    "31": {
      "name": "Nidoqueen",
      "define": "SPECIES_NIDOQUEEN",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Rivalry",
        "Sheer Force"
      ]
    },
    "32": {
      "name": "Nidoran-M",
      "define": "SPECIES_NIDORAN_M",
      "genderRatio": 0,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Rivalry",
        "Hustle"
      ]
    },
    "33": {
      "name": "Nidorino",
      "define": "SPECIES_NIDORINO",
      "genderRatio": 0,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Rivalry",
        "Hustle"
      ]
    },
    "34": {
      "name": "Nidoking",
      "define": "SPECIES_NIDOKING",
      "genderRatio": 0,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Rivalry",
        "Sheer Force"
      ]
    },
    "35": {
      "name": "Clefairy",
      "define": "SPECIES_CLEFAIRY",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Magic Guard",
        "Friend Guard"
      ]
    },
    "36": {
      "name": "Clefable",
      "define": "SPECIES_CLEFABLE",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Magic Guard",
        "Unaware"
      ]
    },
    "37": {
      "name": "Vulpix",
      "define": "SPECIES_VULPIX",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Flash Fire",
        null,
        "Drought"
      ]
    },
    "38": {
      "name": "Ninetales",
      "define": "SPECIES_NINETALES",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Flash Fire",
        null,
        "Drought"
      ]
    },
    "39": {
      "name": "Jigglypuff",
      "define": "SPECIES_JIGGLYPUFF",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Competitive",
        "Friend Guard"
      ]
    },
    "40": {
      "name": "Wigglytuff",
      "define": "SPECIES_WIGGLYTUFF",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Competitive",
        "Frisk"
      ]
    },
    "41": {
      "name": "Zubat",
      "define": "SPECIES_ZUBAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Inner Focus",
        null,
        "Infiltrator"
      ]
    },
    "42": {
      "name": "Golbat",
      "define": "SPECIES_GOLBAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Inner Focus",
        null,
        "Infiltrator"
      ]
    },
    "43": {
      "name": "Oddish",
      "define": "SPECIES_ODDISH",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        null,
        "Run Away"
      ]
    },
    "44": {
      "name": "Gloom",
      "define": "SPECIES_GLOOM",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        null,
        "Stench"
      ]
    },
    "45": {
      "name": "Vileplume",
      "define": "SPECIES_VILEPLUME",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        null,
        "Effect Spore"
      ]
    },
    "46": {
      "name": "Paras",
      "define": "SPECIES_PARAS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Effect Spore",
        "Dry Skin",
        "Damp"
      ]
    },
    "47": {
      "name": "Parasect",
      "define": "SPECIES_PARASECT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Effect Spore",
        "Dry Skin",
        "Damp"
      ]
    },
    "48": {
      "name": "Venonat",
      "define": "SPECIES_VENONAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Compound Eyes",
        "Tinted Lens",
        "Run Away"
      ]
    },
    "49": {
      "name": "Venomoth",
      "define": "SPECIES_VENOMOTH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Tinted Lens",
        "Wonder Skin"
      ]
    },
    "50": {
      "name": "Diglett",
      "define": "SPECIES_DIGLETT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Veil",
        "Arena Trap",
        "Sand Force"
      ]
    },
    "51": {
      "name": "Dugtrio",
      "define": "SPECIES_DUGTRIO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Veil",
        "Arena Trap",
        "Sand Force"
      ]
    },
    "52": {
      "name": "Meowth",
      "define": "SPECIES_MEOWTH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Technician",
        "Unnerve"
      ]
    },
    "53": {
      "name": "Persian",
      "define": "SPECIES_PERSIAN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Limber",
        "Technician",
        "Unnerve"
      ]
    },
    "54": {
      "name": "Psyduck",
      "define": "SPECIES_PSYDUCK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Damp",
        "Cloud Nine",
        "Swift Swim"
      ]
    },
    "55": {
      "name": "Golduck",
      "define": "SPECIES_GOLDUCK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Damp",
        "Cloud Nine",
        "Swift Swim"
      ]
    },
    "56": {
      "name": "Mankey",
      "define": "SPECIES_MANKEY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Vital Spirit",
        "Anger Point",
        "Defiant"
      ]
    },
    "57": {
      "name": "Primeape",
      "define": "SPECIES_PRIMEAPE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Vital Spirit",
        "Anger Point",
        "Defiant"
      ]
    },
    "58": {
      "name": "Growlithe",
      "define": "SPECIES_GROWLITHE",
      "genderRatio": 63,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Flash Fire",
        "Justified"
      ]
    },
    "59": {
      "name": "Arcanine",
      "define": "SPECIES_ARCANINE",
      "genderRatio": 63,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Flash Fire",
        "Justified"
      ]
    },
    "60": {
      "name": "Poliwag",
      "define": "SPECIES_POLIWAG",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Water Absorb",
        "Damp",
        "Swift Swim"
      ]
    },
    "61": {
      "name": "Poliwhirl",
      "define": "SPECIES_POLIWHIRL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Water Absorb",
        "Damp",
        "Swift Swim"
      ]
    },
    "62": {
      "name": "Poliwrath",
      "define": "SPECIES_POLIWRATH",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Water Absorb",
        "Damp",
        "Swift Swim"
      ]
    },
    "63": {
      "name": "Abra",
      "define": "SPECIES_ABRA",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Synchronize",
        "Inner Focus",
        "Magic Guard"
      ]
    },
    "64": {
      "name": "Kadabra",
      "define": "SPECIES_KADABRA",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Synchronize",
        "Inner Focus",
        "Magic Guard"
      ]
    },
    "65": {
      "name": "Alakazam",
      "define": "SPECIES_ALAKAZAM",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Synchronize",
        "Inner Focus",
        "Magic Guard"
      ]
    },
    "66": {
      "name": "Machop",
      "define": "SPECIES_MACHOP",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Guts",
        "No Guard",
        "Steadfast"
      ]
    },
    "67": {
      "name": "Machoke",
      "define": "SPECIES_MACHOKE",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Guts",
        "No Guard",
        "Steadfast"
      ]
    },
    "68": {
      "name": "Machamp",
      "define": "SPECIES_MACHAMP",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Guts",
        "No Guard",
        "Steadfast"
      ]
    },
    "69": {
      "name": "Bellsprout",
      "define": "SPECIES_BELLSPROUT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        null,
        "Gluttony"
      ]
    },
    "70": {
      "name": "Weepinbell",
      "define": "SPECIES_WEEPINBELL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        null,
        "Gluttony"
      ]
    },
    "71": {
      "name": "Victreebel",
      "define": "SPECIES_VICTREEBEL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        null,
        "Gluttony"
      ]
    },
    "72": {
      "name": "Tentacool",
      "define": "SPECIES_TENTACOOL",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        "Liquid Ooze",
        "Rain Dish"
      ]
    },
    "73": {
      "name": "Tentacruel",
      "define": "SPECIES_TENTACRUEL",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        "Liquid Ooze",
        "Rain Dish"
      ]
    },
    "74": {
      "name": "Geodude",
      "define": "SPECIES_GEODUDE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Rock Head",
        "Sturdy",
        "Sand Veil"
      ]
    },
    "75": {
      "name": "Graveler",
      "define": "SPECIES_GRAVELER",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Rock Head",
        "Sturdy",
        "Sand Veil"
      ]
    },
    "76": {
      "name": "Golem",
      "define": "SPECIES_GOLEM",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Rock Head",
        "Sturdy",
        "Sand Veil"
      ]
    },
    "77": {
      "name": "Ponyta",
      "define": "SPECIES_PONYTA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Flash Fire",
        "Flame Body"
      ]
    },
    "78": {
      "name": "Rapidash",
      "define": "SPECIES_RAPIDASH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Flash Fire",
        "Flame Body"
      ]
    },
    "79": {
      "name": "Slowpoke",
      "define": "SPECIES_SLOWPOKE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Own Tempo",
        "Regenerator"
      ]
    },
    "80": {
      "name": "Slowbro",
      "define": "SPECIES_SLOWBRO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Own Tempo",
        "Regenerator"
      ]
    },
    "81": {
      "name": "Magnemite",
      "define": "SPECIES_MAGNEMITE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Magnet Pull",
        "Sturdy",
        "Analytic"
      ]
    },
    "82": {
      "name": "Magneton",
      "define": "SPECIES_MAGNETON",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Magnet Pull",
        "Sturdy",
        "Analytic"
      ]
    },
    "83": {
      "name": "Farfetch’d",
      "define": "SPECIES_FARFETCHD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Inner Focus",
        "Defiant"
      ]
    },
    "84": {
      "name": "Doduo",
      "define": "SPECIES_DODUO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Early Bird",
        "Tangled Feet"
      ]
    },
    "85": {
      "name": "Dodrio",
      "define": "SPECIES_DODRIO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Early Bird",
        "Tangled Feet"
      ]
    },
    "86": {
      "name": "Seel",
      "define": "SPECIES_SEEL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Thick Fat",
        "Hydration",
        "Ice Body"
      ]
    },
    "87": {
      "name": "Dewgong",
      "define": "SPECIES_DEWGONG",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Thick Fat",
        "Hydration",
        "Ice Body"
      ]
    },
    "88": {
      "name": "Grimer",
      "define": "SPECIES_GRIMER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stench",
        "Sticky Hold",
        "Poison Touch"
      ]
    },
    "89": {
      "name": "Muk",
      "define": "SPECIES_MUK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stench",
        "Sticky Hold",
        "Poison Touch"
      ]
    },
    "90": {
      "name": "Shellder",
      "define": "SPECIES_SHELLDER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Shell Armor",
        "Skill Link",
        "Overcoat"
      ]
    },
    "91": {
      "name": "Cloyster",
      "define": "SPECIES_CLOYSTER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Shell Armor",
        "Skill Link",
        "Overcoat"
      ]
    },
    "92": {
      "name": "Gastly",
      "define": "SPECIES_GASTLY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "93": {
      "name": "Haunter",
      "define": "SPECIES_HAUNTER",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "94": {
      "name": "Gengar",
      "define": "SPECIES_GENGAR",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Levitate",
        "Cursed Body",
        null
      ]
    },
    "95": {
      "name": "Onix",
      "define": "SPECIES_ONIX",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rock Head",
        "Sturdy",
        "Weak Armor"
      ]
    },
    "96": {
      "name": "Drowzee",
      "define": "SPECIES_DROWZEE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Insomnia",
        "Forewarn",
        "Inner Focus"
      ]
    },
    "97": {
      "name": "Hypno",
      "define": "SPECIES_HYPNO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Insomnia",
        "Forewarn",
        "Inner Focus"
      ]
    },
    "98": {
      "name": "Krabby",
      "define": "SPECIES_KRABBY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hyper Cutter",
        "Shell Armor",
        "Sheer Force"
      ]
    },
    "99": {
      "name": "Kingler",
      "define": "SPECIES_KINGLER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hyper Cutter",
        "Shell Armor",
        "Sheer Force"
      ]
    },
    "100": {
      "name": "Voltorb",
      "define": "SPECIES_VOLTORB",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Soundproof",
        "Static",
        "Aftermath"
      ]
    },
    "101": {
      "name": "Electrode",
      "define": "SPECIES_ELECTRODE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Soundproof",
        "Static",
        "Aftermath"
      ]
    },
    "102": {
      "name": "Exeggcute",
      "define": "SPECIES_EXEGGCUTE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Chlorophyll",
        null,
        "Harvest"
      ]
    },
    "103": {
      "name": "Exeggutor",
      "define": "SPECIES_EXEGGUTOR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Chlorophyll",
        null,
        "Harvest"
      ]
    },
    "104": {
      "name": "Cubone",
      "define": "SPECIES_CUBONE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rock Head",
        "Lightning Rod",
        "Battle Armor"
      ]
    },
    "105": {
      "name": "Marowak",
      "define": "SPECIES_MAROWAK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rock Head",
        "Lightning Rod",
        "Battle Armor"
      ]
    },
    "106": {
      "name": "Hitmonlee",
      "define": "SPECIES_HITMONLEE",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Limber",
        "Reckless",
        "Unburden"
      ]
    },
    "107": {
      "name": "Hitmonchan",
      "define": "SPECIES_HITMONCHAN",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Iron Fist",
        "Inner Focus"
      ]
    },
    "108": {
      "name": "Lickitung",
      "define": "SPECIES_LICKITUNG",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        "Oblivious",
        "Cloud Nine"
      ]
    },
    "109": {
      "name": "Koffing",
      "define": "SPECIES_KOFFING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        "Neutralizing Gas",
        "Stench"
      ]
    },
    "110": {
      "name": "Weezing",
      "define": "SPECIES_WEEZING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        "Neutralizing Gas",
        "Stench"
      ]
    },
    "111": {
      "name": "Rhyhorn",
      "define": "SPECIES_RHYHORN",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Lightning Rod",
        "Rock Head",
        "Reckless"
      ]
    },
    "112": {
      "name": "Rhydon",
      "define": "SPECIES_RHYDON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Lightning Rod",
        "Rock Head",
        "Reckless"
      ]
    },
    "113": {
      "name": "Chansey",
      "define": "SPECIES_CHANSEY",
      "genderRatio": 254,
      "growthRate": 4,
      "abilities": [
        "Natural Cure",
        "Serene Grace",
        "Healer"
      ]
    },
    "114": {
      "name": "Tangela",
      "define": "SPECIES_TANGELA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Leaf Guard",
        "Regenerator"
      ]
    },
    "115": {
      "name": "Kangaskhan",
      "define": "SPECIES_KANGASKHAN",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Early Bird",
        "Scrappy",
        "Inner Focus"
      ]
    },
    "116": {
      "name": "Horsea",
      "define": "SPECIES_HORSEA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Sniper",
        "Damp"
      ]
    },
    "117": {
      "name": "Seadra",
      "define": "SPECIES_SEADRA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Sniper",
        "Damp"
      ]
    },
    "118": {
      "name": "Goldeen",
      "define": "SPECIES_GOLDEEN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Water Veil",
        "Lightning Rod"
      ]
    },
    "119": {
      "name": "Seaking",
      "define": "SPECIES_SEAKING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Water Veil",
        "Lightning Rod"
      ]
    },
    "120": {
      "name": "Staryu",
      "define": "SPECIES_STARYU",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Illuminate",
        "Natural Cure",
        "Analytic"
      ]
    },
    "121": {
      "name": "Starmie",
      "define": "SPECIES_STARMIE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Illuminate",
        "Natural Cure",
        "Analytic"
      ]
    },
    "122": {
      "name": "Mr. Mime",
      "define": "SPECIES_MR_MIME",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Soundproof",
        "Filter",
        "Technician"
      ]
    },
    "123": {
      "name": "Scyther",
      "define": "SPECIES_SCYTHER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Technician",
        "Steadfast"
      ]
    },
    "124": {
      "name": "Jynx",
      "define": "SPECIES_JYNX",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Forewarn",
        "Dry Skin"
      ]
    },
    "125": {
      "name": "Electabuzz",
      "define": "SPECIES_ELECTABUZZ",
      "genderRatio": 63,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Vital Spirit"
      ]
    },
    "126": {
      "name": "Magmar",
      "define": "SPECIES_MAGMAR",
      "genderRatio": 63,
      "growthRate": 0,
      "abilities": [
        "Flame Body",
        null,
        "Vital Spirit"
      ]
    },
    "127": {
      "name": "Pinsir",
      "define": "SPECIES_PINSIR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Hyper Cutter",
        "Mold Breaker",
        "Moxie"
      ]
    },
    "128": {
      "name": "Tauros",
      "define": "SPECIES_TAUROS",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Anger Point",
        "Sheer Force"
      ]
    },
    "129": {
      "name": "Magikarp",
      "define": "SPECIES_MAGIKARP",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Swift Swim",
        null,
        "Rattled"
      ]
    },
    "130": {
      "name": "Gyarados",
      "define": "SPECIES_GYARADOS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        null,
        "Moxie"
      ]
    },
    "131": {
      "name": "Lapras",
      "define": "SPECIES_LAPRAS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Water Absorb",
        "Shell Armor",
        "Hydration"
      ]
    },
    "132": {
      "name": "Ditto",
      "define": "SPECIES_DITTO",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Limber",
        null,
        "Imposter"
      ]
    },
    "133": {
      "name": "Eevee",
      "define": "SPECIES_EEVEE",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Adaptability",
        "Anticipation"
      ]
    },
    "134": {
      "name": "Vaporeon",
      "define": "SPECIES_VAPOREON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Water Absorb",
        "Water Absorb",
        "Hydration"
      ]
    },
    "135": {
      "name": "Jolteon",
      "define": "SPECIES_JOLTEON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Volt Absorb",
        "Volt Absorb",
        "Quick Feet"
      ]
    },
    "136": {
      "name": "Flareon",
      "define": "SPECIES_FLAREON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Flash Fire",
        "Flash Fire",
        "Guts"
      ]
    },
    "137": {
      "name": "Porygon",
      "define": "SPECIES_PORYGON",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Trace",
        "Download",
        "Analytic"
      ]
    },
    "138": {
      "name": "Omanyte",
      "define": "SPECIES_OMANYTE",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Shell Armor",
        "Weak Armor"
      ]
    },
    "139": {
      "name": "Omastar",
      "define": "SPECIES_OMASTAR",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Shell Armor",
        "Weak Armor"
      ]
    },
    "140": {
      "name": "Kabuto",
      "define": "SPECIES_KABUTO",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Battle Armor",
        "Weak Armor"
      ]
    },
    "141": {
      "name": "Kabutops",
      "define": "SPECIES_KABUTOPS",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Battle Armor",
        "Weak Armor"
      ]
    },
    "142": {
      "name": "Aerodactyl",
      "define": "SPECIES_AERODACTYL",
      "genderRatio": 31,
      "growthRate": 5,
      "abilities": [
        "Rock Head",
        "Pressure",
        "Unnerve"
      ]
    },
    "143": {
      "name": "Snorlax",
      "define": "SPECIES_SNORLAX",
      "genderRatio": 31,
      "growthRate": 5,
      "abilities": [
        "Immunity",
        "Thick Fat",
        "Gluttony"
      ]
    },
    "144": {
      "name": "Articuno",
      "define": "SPECIES_ARTICUNO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Snow Cloak"
      ]
    },
    "145": {
      "name": "Zapdos",
      "define": "SPECIES_ZAPDOS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Static"
      ]
    },
    "146": {
      "name": "Moltres",
      "define": "SPECIES_MOLTRES",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Flame Body"
      ]
    },
    "147": {
      "name": "Dratini",
      "define": "SPECIES_DRATINI",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Shed Skin",
        null,
        "Marvel Scale"
      ]
    },
    "148": {
      "name": "Dragonair",
      "define": "SPECIES_DRAGONAIR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Shed Skin",
        null,
        "Marvel Scale"
      ]
    },
    "149": {
      "name": "Dragonite",
      "define": "SPECIES_DRAGONITE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Inner Focus",
        null,
        "Multiscale"
      ]
    },
    "150": {
      "name": "Mewtwo",
      "define": "SPECIES_MEWTWO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Unnerve"
      ]
    },
    "151": {
      "name": "Mew",
      "define": "SPECIES_MEW",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Synchronize",
        null,
        null
      ]
    },
    "152": {
      "name": "Chikorita",
      "define": "SPECIES_CHIKORITA",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Leaf Guard"
      ]
    },
    "153": {
      "name": "Bayleef",
      "define": "SPECIES_BAYLEEF",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Leaf Guard"
      ]
    },
    "154": {
      "name": "Meganium",
      "define": "SPECIES_MEGANIUM",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Leaf Guard"
      ]
    },
    "155": {
      "name": "Cyndaquil",
      "define": "SPECIES_CYNDAQUIL",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Flash Fire"
      ]
    },
    "156": {
      "name": "Quilava",
      "define": "SPECIES_QUILAVA",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Flash Fire"
      ]
    },
    "157": {
      "name": "Typhlosion",
      "define": "SPECIES_TYPHLOSION",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Flash Fire"
      ]
    },
    "158": {
      "name": "Totodile",
      "define": "SPECIES_TOTODILE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Sheer Force"
      ]
    },
    "159": {
      "name": "Croconaw",
      "define": "SPECIES_CROCONAW",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Sheer Force"
      ]
    },
    "160": {
      "name": "Feraligatr",
      "define": "SPECIES_FERALIGATR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Sheer Force"
      ]
    },
    "161": {
      "name": "Sentret",
      "define": "SPECIES_SENTRET",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Keen Eye",
        "Frisk"
      ]
    },
    "162": {
      "name": "Furret",
      "define": "SPECIES_FURRET",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Keen Eye",
        "Frisk"
      ]
    },
    "163": {
      "name": "Hoothoot",
      "define": "SPECIES_HOOTHOOT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Insomnia",
        "Keen Eye",
        "Tinted Lens"
      ]
    },
    "164": {
      "name": "Noctowl",
      "define": "SPECIES_NOCTOWL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Insomnia",
        "Keen Eye",
        "Tinted Lens"
      ]
    },
    "165": {
      "name": "Ledyba",
      "define": "SPECIES_LEDYBA",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Swarm",
        "Early Bird",
        "Rattled"
      ]
    },
    "166": {
      "name": "Ledian",
      "define": "SPECIES_LEDIAN",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Swarm",
        "Early Bird",
        "Iron Fist"
      ]
    },
    "167": {
      "name": "Spinarak",
      "define": "SPECIES_SPINARAK",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Swarm",
        "Insomnia",
        "Sniper"
      ]
    },
    "168": {
      "name": "Ariados",
      "define": "SPECIES_ARIADOS",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Swarm",
        "Insomnia",
        "Sniper"
      ]
    },
    "169": {
      "name": "Crobat",
      "define": "SPECIES_CROBAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Inner Focus",
        null,
        "Infiltrator"
      ]
    },
    "170": {
      "name": "Chinchou",
      "define": "SPECIES_CHINCHOU",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Volt Absorb",
        "Illuminate",
        "Water Absorb"
      ]
    },
    "171": {
      "name": "Lanturn",
      "define": "SPECIES_LANTURN",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Volt Absorb",
        "Illuminate",
        "Water Absorb"
      ]
    },
    "172": {
      "name": "Pichu",
      "define": "SPECIES_PICHU",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "173": {
      "name": "Cleffa",
      "define": "SPECIES_CLEFFA",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Magic Guard",
        "Friend Guard"
      ]
    },
    "174": {
      "name": "Igglybuff",
      "define": "SPECIES_IGGLYBUFF",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Competitive",
        "Friend Guard"
      ]
    },
    "175": {
      "name": "Togepi",
      "define": "SPECIES_TOGEPI",
      "genderRatio": 31,
      "growthRate": 4,
      "abilities": [
        "Hustle",
        "Serene Grace",
        "Super Luck"
      ]
    },
    "176": {
      "name": "Togetic",
      "define": "SPECIES_TOGETIC",
      "genderRatio": 31,
      "growthRate": 4,
      "abilities": [
        "Hustle",
        "Serene Grace",
        "Super Luck"
      ]
    },
    "177": {
      "name": "Natu",
      "define": "SPECIES_NATU",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Synchronize",
        "Early Bird",
        "Magic Bounce"
      ]
    },
    "178": {
      "name": "Xatu",
      "define": "SPECIES_XATU",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Synchronize",
        "Early Bird",
        "Magic Bounce"
      ]
    },
    "179": {
      "name": "Mareep",
      "define": "SPECIES_MAREEP",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Static",
        null,
        "Plus"
      ]
    },
    "180": {
      "name": "Flaaffy",
      "define": "SPECIES_FLAAFFY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Static",
        null,
        "Plus"
      ]
    },
    "181": {
      "name": "Ampharos",
      "define": "SPECIES_AMPHAROS",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Static",
        null,
        "Plus"
      ]
    },
    "182": {
      "name": "Bellossom",
      "define": "SPECIES_BELLOSSOM",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        null,
        "Healer"
      ]
    },
    "183": {
      "name": "Marill",
      "define": "SPECIES_MARILL",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Thick Fat",
        "Huge Power",
        "Sap Sipper"
      ]
    },
    "184": {
      "name": "Azumarill",
      "define": "SPECIES_AZUMARILL",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Thick Fat",
        "Huge Power",
        "Sap Sipper"
      ]
    },
    "185": {
      "name": "Sudowoodo",
      "define": "SPECIES_SUDOWOODO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        "Rock Head",
        "Rattled"
      ]
    },
    "186": {
      "name": "Politoed",
      "define": "SPECIES_POLITOED",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Water Absorb",
        "Damp",
        "Drizzle"
      ]
    },
    "187": {
      "name": "Hoppip",
      "define": "SPECIES_HOPPIP",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Leaf Guard",
        "Infiltrator"
      ]
    },
    "188": {
      "name": "Skiploom",
      "define": "SPECIES_SKIPLOOM",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Leaf Guard",
        "Infiltrator"
      ]
    },
    "189": {
      "name": "Jumpluff",
      "define": "SPECIES_JUMPLUFF",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Leaf Guard",
        "Infiltrator"
      ]
    },
    "190": {
      "name": "Aipom",
      "define": "SPECIES_AIPOM",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Run Away",
        "Pickup",
        "Skill Link"
      ]
    },
    "191": {
      "name": "Sunkern",
      "define": "SPECIES_SUNKERN",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Solar Power",
        "Early Bird"
      ]
    },
    "192": {
      "name": "Sunflora",
      "define": "SPECIES_SUNFLORA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Solar Power",
        "Early Bird"
      ]
    },
    "193": {
      "name": "Yanma",
      "define": "SPECIES_YANMA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Speed Boost",
        "Compound Eyes",
        "Frisk"
      ]
    },
    "194": {
      "name": "Wooper",
      "define": "SPECIES_WOOPER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Damp",
        "Water Absorb",
        "Unaware"
      ]
    },
    "195": {
      "name": "Quagsire",
      "define": "SPECIES_QUAGSIRE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Damp",
        "Water Absorb",
        "Unaware"
      ]
    },
    "196": {
      "name": "Espeon",
      "define": "SPECIES_ESPEON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Synchronize",
        "Synchronize",
        "Magic Bounce"
      ]
    },
    "197": {
      "name": "Umbreon",
      "define": "SPECIES_UMBREON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Synchronize",
        "Synchronize",
        "Inner Focus"
      ]
    },
    "198": {
      "name": "Murkrow",
      "define": "SPECIES_MURKROW",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Insomnia",
        "Super Luck",
        "Prankster"
      ]
    },
    "199": {
      "name": "Slowking",
      "define": "SPECIES_SLOWKING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Own Tempo",
        "Regenerator"
      ]
    },
    "200": {
      "name": "Misdreavus",
      "define": "SPECIES_MISDREAVUS",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "201": {
      "name": "Unown",
      "define": "SPECIES_UNOWN",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "202": {
      "name": "Wobbuffet",
      "define": "SPECIES_WOBBUFFET",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shadow Tag",
        null,
        "Telepathy"
      ]
    },
    "203": {
      "name": "Girafarig",
      "define": "SPECIES_GIRAFARIG",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Inner Focus",
        "Early Bird",
        "Sap Sipper"
      ]
    },
    "204": {
      "name": "Pineco",
      "define": "SPECIES_PINECO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        null,
        "Overcoat"
      ]
    },
    "205": {
      "name": "Forretress",
      "define": "SPECIES_FORRETRESS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        null,
        "Overcoat"
      ]
    },
    "206": {
      "name": "Dunsparce",
      "define": "SPECIES_DUNSPARCE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Serene Grace",
        "Run Away",
        "Rattled"
      ]
    },
    "207": {
      "name": "Gligar",
      "define": "SPECIES_GLIGAR",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Hyper Cutter",
        "Sand Veil",
        "Immunity"
      ]
    },
    "208": {
      "name": "Steelix",
      "define": "SPECIES_STEELIX",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rock Head",
        "Sturdy",
        "Sheer Force"
      ]
    },
    "209": {
      "name": "Snubbull",
      "define": "SPECIES_SNUBBULL",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Intimidate",
        "Run Away",
        "Rattled"
      ]
    },
    "210": {
      "name": "Granbull",
      "define": "SPECIES_GRANBULL",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Intimidate",
        "Quick Feet",
        "Rattled"
      ]
    },
    "211": {
      "name": "Qwilfish",
      "define": "SPECIES_QWILFISH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Swift Swim",
        "Intimidate"
      ]
    },
    "212": {
      "name": "Scizor",
      "define": "SPECIES_SCIZOR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Technician",
        "Light Metal"
      ]
    },
    "213": {
      "name": "Shuckle",
      "define": "SPECIES_SHUCKLE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sturdy",
        "Gluttony",
        "Contrary"
      ]
    },
    "214": {
      "name": "Heracross",
      "define": "SPECIES_HERACROSS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Swarm",
        "Guts",
        "Moxie"
      ]
    },
    "215": {
      "name": "Sneasel",
      "define": "SPECIES_SNEASEL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Inner Focus",
        "Keen Eye",
        "Pickpocket"
      ]
    },
    "216": {
      "name": "Teddiursa",
      "define": "SPECIES_TEDDIURSA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Quick Feet",
        "Honey Gather"
      ]
    },
    "217": {
      "name": "Ursaring",
      "define": "SPECIES_URSARING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Guts",
        "Quick Feet",
        "Unnerve"
      ]
    },
    "218": {
      "name": "Slugma",
      "define": "SPECIES_SLUGMA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Magma Armor",
        "Flame Body",
        "Weak Armor"
      ]
    },
    "219": {
      "name": "Magcargo",
      "define": "SPECIES_MAGCARGO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Magma Armor",
        "Flame Body",
        "Weak Armor"
      ]
    },
    "220": {
      "name": "Swinub",
      "define": "SPECIES_SWINUB",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Oblivious",
        "Snow Cloak",
        "Thick Fat"
      ]
    },
    "221": {
      "name": "Piloswine",
      "define": "SPECIES_PILOSWINE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Oblivious",
        "Snow Cloak",
        "Thick Fat"
      ]
    },
    "222": {
      "name": "Corsola",
      "define": "SPECIES_CORSOLA",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Hustle",
        "Natural Cure",
        "Regenerator"
      ]
    },
    "223": {
      "name": "Remoraid",
      "define": "SPECIES_REMORAID",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hustle",
        "Sniper",
        "Moody"
      ]
    },
    "224": {
      "name": "Octillery",
      "define": "SPECIES_OCTILLERY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Suction Cups",
        "Sniper",
        "Moody"
      ]
    },
    "225": {
      "name": "Delibird",
      "define": "SPECIES_DELIBIRD",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Vital Spirit",
        "Hustle",
        "Insomnia"
      ]
    },
    "226": {
      "name": "Mantine",
      "define": "SPECIES_MANTINE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Swift Swim",
        "Water Absorb",
        "Water Veil"
      ]
    },
    "227": {
      "name": "Skarmory",
      "define": "SPECIES_SKARMORY",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Keen Eye",
        "Sturdy",
        "Weak Armor"
      ]
    },
    "228": {
      "name": "Houndour",
      "define": "SPECIES_HOUNDOUR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Early Bird",
        "Flash Fire",
        "Unnerve"
      ]
    },
    "229": {
      "name": "Houndoom",
      "define": "SPECIES_HOUNDOOM",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Early Bird",
        "Flash Fire",
        "Unnerve"
      ]
    },
    "230": {
      "name": "Kingdra",
      "define": "SPECIES_KINGDRA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Sniper",
        "Damp"
      ]
    },
    "231": {
      "name": "Phanpy",
      "define": "SPECIES_PHANPY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        null,
        "Sand Veil"
      ]
    },
    "232": {
      "name": "Donphan",
      "define": "SPECIES_DONPHAN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        null,
        "Sand Veil"
      ]
    },
    "233": {
      "name": "Porygon2",
      "define": "SPECIES_PORYGON2",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Trace",
        "Download",
        "Analytic"
      ]
    },
    "234": {
      "name": "Stantler",
      "define": "SPECIES_STANTLER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Frisk",
        "Sap Sipper"
      ]
    },
    "235": {
      "name": "Smeargle",
      "define": "SPECIES_SMEARGLE",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Own Tempo",
        "Technician",
        "Moody"
      ]
    },
    "236": {
      "name": "Tyrogue",
      "define": "SPECIES_TYROGUE",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Guts",
        "Steadfast",
        "Vital Spirit"
      ]
    },
    "237": {
      "name": "Hitmontop",
      "define": "SPECIES_HITMONTOP",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Intimidate",
        "Technician",
        "Steadfast"
      ]
    },
    "238": {
      "name": "Smoochum",
      "define": "SPECIES_SMOOCHUM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Forewarn",
        "Hydration"
      ]
    },
    "239": {
      "name": "Elekid",
      "define": "SPECIES_ELEKID",
      "genderRatio": 63,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Vital Spirit"
      ]
    },
    "240": {
      "name": "Magby",
      "define": "SPECIES_MAGBY",
      "genderRatio": 63,
      "growthRate": 0,
      "abilities": [
        "Flame Body",
        null,
        "Vital Spirit"
      ]
    },
    "241": {
      "name": "Miltank",
      "define": "SPECIES_MILTANK",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Thick Fat",
        "Scrappy",
        "Sap Sipper"
      ]
    },
    "242": {
      "name": "Blissey",
      "define": "SPECIES_BLISSEY",
      "genderRatio": 254,
      "growthRate": 4,
      "abilities": [
        "Natural Cure",
        "Serene Grace",
        "Healer"
      ]
    },
    "243": {
      "name": "Raikou",
      "define": "SPECIES_RAIKOU",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Inner Focus"
      ]
    },
    "244": {
      "name": "Entei",
      "define": "SPECIES_ENTEI",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Inner Focus"
      ]
    },
    "245": {
      "name": "Suicune",
      "define": "SPECIES_SUICUNE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Inner Focus"
      ]
    },
    "246": {
      "name": "Larvitar",
      "define": "SPECIES_LARVITAR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Guts",
        null,
        "Sand Veil"
      ]
    },
    "247": {
      "name": "Pupitar",
      "define": "SPECIES_PUPITAR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Shed Skin",
        null,
        null
      ]
    },
    "248": {
      "name": "Tyranitar",
      "define": "SPECIES_TYRANITAR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sand Stream",
        null,
        "Unnerve"
      ]
    },
    "249": {
      "name": "Lugia",
      "define": "SPECIES_LUGIA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Multiscale"
      ]
    },
    "250": {
      "name": "Ho-Oh",
      "define": "SPECIES_HO_OH",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Regenerator"
      ]
    },
    "251": {
      "name": "Celebi",
      "define": "SPECIES_CELEBI",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Natural Cure",
        null,
        null
      ]
    },
    "252": {
      "name": "Treecko",
      "define": "SPECIES_TREECKO",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Unburden"
      ]
    },
    "253": {
      "name": "Grovyle",
      "define": "SPECIES_GROVYLE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Unburden"
      ]
    },
    "254": {
      "name": "Sceptile",
      "define": "SPECIES_SCEPTILE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Unburden"
      ]
    },
    "255": {
      "name": "Torchic",
      "define": "SPECIES_TORCHIC",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Speed Boost"
      ]
    },
    "256": {
      "name": "Combusken",
      "define": "SPECIES_COMBUSKEN",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Speed Boost"
      ]
    },
    "257": {
      "name": "Blaziken",
      "define": "SPECIES_BLAZIKEN",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Speed Boost"
      ]
    },
    "258": {
      "name": "Mudkip",
      "define": "SPECIES_MUDKIP",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Damp"
      ]
    },
    "259": {
      "name": "Marshtomp",
      "define": "SPECIES_MARSHTOMP",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Damp"
      ]
    },
    "260": {
      "name": "Swampert",
      "define": "SPECIES_SWAMPERT",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Damp"
      ]
    },
    "261": {
      "name": "Poochyena",
      "define": "SPECIES_POOCHYENA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Quick Feet",
        "Rattled"
      ]
    },
    "262": {
      "name": "Mightyena",
      "define": "SPECIES_MIGHTYENA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Intimidate",
        "Quick Feet",
        "Moxie"
      ]
    },
    "263": {
      "name": "Zigzagoon",
      "define": "SPECIES_ZIGZAGOON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Gluttony",
        "Quick Feet"
      ]
    },
    "264": {
      "name": "Linoone",
      "define": "SPECIES_LINOONE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Gluttony",
        "Quick Feet"
      ]
    },
    "265": {
      "name": "Wurmple",
      "define": "SPECIES_WURMPLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        null,
        "Run Away"
      ]
    },
    "266": {
      "name": "Silcoon",
      "define": "SPECIES_SILCOON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        null
      ]
    },
    "267": {
      "name": "Beautifly",
      "define": "SPECIES_BEAUTIFLY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        "Rivalry"
      ]
    },
    "268": {
      "name": "Cascoon",
      "define": "SPECIES_CASCOON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        null
      ]
    },
    "269": {
      "name": "Dustox",
      "define": "SPECIES_DUSTOX",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        null,
        "Compound Eyes"
      ]
    },
    "270": {
      "name": "Lotad",
      "define": "SPECIES_LOTAD",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swift Swim",
        "Rain Dish",
        "Own Tempo"
      ]
    },
    "271": {
      "name": "Lombre",
      "define": "SPECIES_LOMBRE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swift Swim",
        "Rain Dish",
        "Own Tempo"
      ]
    },
    "272": {
      "name": "Ludicolo",
      "define": "SPECIES_LUDICOLO",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swift Swim",
        "Rain Dish",
        "Own Tempo"
      ]
    },
    "273": {
      "name": "Seedot",
      "define": "SPECIES_SEEDOT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Early Bird",
        "Pickpocket"
      ]
    },
    "274": {
      "name": "Nuzleaf",
      "define": "SPECIES_NUZLEAF",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Early Bird",
        "Pickpocket"
      ]
    },
    "275": {
      "name": "Shiftry",
      "define": "SPECIES_SHIFTRY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Chlorophyll",
        "Wind Rider",
        "Pickpocket"
      ]
    },
    "276": {
      "name": "Taillow",
      "define": "SPECIES_TAILLOW",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Guts",
        null,
        "Scrappy"
      ]
    },
    "277": {
      "name": "Swellow",
      "define": "SPECIES_SWELLOW",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Guts",
        null,
        "Scrappy"
      ]
    },
    "278": {
      "name": "Wingull",
      "define": "SPECIES_WINGULL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Hydration",
        "Rain Dish"
      ]
    },
    "279": {
      "name": "Pelipper",
      "define": "SPECIES_PELIPPER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Drizzle",
        "Rain Dish"
      ]
    },
    "280": {
      "name": "Ralts",
      "define": "SPECIES_RALTS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Synchronize",
        "Trace",
        "Telepathy"
      ]
    },
    "281": {
      "name": "Kirlia",
      "define": "SPECIES_KIRLIA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Synchronize",
        "Trace",
        "Telepathy"
      ]
    },
    "282": {
      "name": "Gardevoir",
      "define": "SPECIES_GARDEVOIR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Synchronize",
        "Trace",
        "Telepathy"
      ]
    },
    "283": {
      "name": "Surskit",
      "define": "SPECIES_SURSKIT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        null,
        "Rain Dish"
      ]
    },
    "284": {
      "name": "Masquerain",
      "define": "SPECIES_MASQUERAIN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Intimidate",
        null,
        "Unnerve"
      ]
    },
    "285": {
      "name": "Shroomish",
      "define": "SPECIES_SHROOMISH",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Effect Spore",
        "Poison Heal",
        "Quick Feet"
      ]
    },
    "286": {
      "name": "Breloom",
      "define": "SPECIES_BRELOOM",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Effect Spore",
        "Poison Heal",
        "Technician"
      ]
    },
    "287": {
      "name": "Slakoth",
      "define": "SPECIES_SLAKOTH",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Truant",
        null,
        null
      ]
    },
    "288": {
      "name": "Vigoroth",
      "define": "SPECIES_VIGOROTH",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Vital Spirit",
        null,
        null
      ]
    },
    "289": {
      "name": "Slaking",
      "define": "SPECIES_SLAKING",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Truant",
        null,
        null
      ]
    },
    "290": {
      "name": "Nincada",
      "define": "SPECIES_NINCADA",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Compound Eyes",
        null,
        "Run Away"
      ]
    },
    "291": {
      "name": "Ninjask",
      "define": "SPECIES_NINJASK",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Speed Boost",
        null,
        "Infiltrator"
      ]
    },
    "292": {
      "name": "Shedinja",
      "define": "SPECIES_SHEDINJA",
      "genderRatio": 255,
      "growthRate": 1,
      "abilities": [
        "Wonder Guard",
        null,
        null
      ]
    },
    "293": {
      "name": "Whismur",
      "define": "SPECIES_WHISMUR",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Soundproof",
        null,
        "Rattled"
      ]
    },
    "294": {
      "name": "Loudred",
      "define": "SPECIES_LOUDRED",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Soundproof",
        null,
        "Scrappy"
      ]
    },
    "295": {
      "name": "Exploud",
      "define": "SPECIES_EXPLOUD",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Soundproof",
        null,
        "Scrappy"
      ]
    },
    "296": {
      "name": "Makuhita",
      "define": "SPECIES_MAKUHITA",
      "genderRatio": 63,
      "growthRate": 2,
      "abilities": [
        "Thick Fat",
        "Guts",
        "Sheer Force"
      ]
    },
    "297": {
      "name": "Hariyama",
      "define": "SPECIES_HARIYAMA",
      "genderRatio": 63,
      "growthRate": 2,
      "abilities": [
        "Thick Fat",
        "Guts",
        "Sheer Force"
      ]
    },
    "298": {
      "name": "Azurill",
      "define": "SPECIES_AZURILL",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Thick Fat",
        "Huge Power",
        "Sap Sipper"
      ]
    },
    "299": {
      "name": "Nosepass",
      "define": "SPECIES_NOSEPASS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        "Magnet Pull",
        "Sand Force"
      ]
    },
    "300": {
      "name": "Skitty",
      "define": "SPECIES_SKITTY",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Normalize",
        "Wonder Skin"
      ]
    },
    "301": {
      "name": "Delcatty",
      "define": "SPECIES_DELCATTY",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Normalize",
        "Wonder Skin"
      ]
    },
    "302": {
      "name": "Sableye",
      "define": "SPECIES_SABLEYE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        "Stall",
        "Prankster"
      ]
    },
    "303": {
      "name": "Mawile",
      "define": "SPECIES_MAWILE",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Hyper Cutter",
        "Intimidate",
        "Sheer Force"
      ]
    },
    "304": {
      "name": "Aron",
      "define": "SPECIES_ARON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sturdy",
        "Rock Head",
        "Heavy Metal"
      ]
    },
    "305": {
      "name": "Lairon",
      "define": "SPECIES_LAIRON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sturdy",
        "Rock Head",
        "Heavy Metal"
      ]
    },
    "306": {
      "name": "Aggron",
      "define": "SPECIES_AGGRON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sturdy",
        "Rock Head",
        "Heavy Metal"
      ]
    },
    "307": {
      "name": "Meditite",
      "define": "SPECIES_MEDITITE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pure Power",
        null,
        "Telepathy"
      ]
    },
    "308": {
      "name": "Medicham",
      "define": "SPECIES_MEDICHAM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pure Power",
        null,
        "Telepathy"
      ]
    },
    "309": {
      "name": "Electrike",
      "define": "SPECIES_ELECTRIKE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Static",
        "Lightning Rod",
        "Minus"
      ]
    },
    "310": {
      "name": "Manectric",
      "define": "SPECIES_MANECTRIC",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Static",
        "Lightning Rod",
        "Minus"
      ]
    },
    "311": {
      "name": "Plusle",
      "define": "SPECIES_PLUSLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Plus",
        null,
        "Lightning Rod"
      ]
    },
    "312": {
      "name": "Minun",
      "define": "SPECIES_MINUN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Minus",
        null,
        "Volt Absorb"
      ]
    },
    "313": {
      "name": "Volbeat",
      "define": "SPECIES_VOLBEAT",
      "genderRatio": 0,
      "growthRate": 1,
      "abilities": [
        "Illuminate",
        "Swarm",
        "Prankster"
      ]
    },
    "314": {
      "name": "Illumise",
      "define": "SPECIES_ILLUMISE",
      "genderRatio": 254,
      "growthRate": 2,
      "abilities": [
        "Oblivious",
        "Tinted Lens",
        "Prankster"
      ]
    },
    "315": {
      "name": "Roselia",
      "define": "SPECIES_ROSELIA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Natural Cure",
        "Poison Point",
        "Leaf Guard"
      ]
    },
    "316": {
      "name": "Gulpin",
      "define": "SPECIES_GULPIN",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Liquid Ooze",
        "Sticky Hold",
        "Gluttony"
      ]
    },
    "317": {
      "name": "Swalot",
      "define": "SPECIES_SWALOT",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Liquid Ooze",
        "Sticky Hold",
        "Gluttony"
      ]
    },
    "318": {
      "name": "Carvanha",
      "define": "SPECIES_CARVANHA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Rough Skin",
        null,
        "Speed Boost"
      ]
    },
    "319": {
      "name": "Sharpedo",
      "define": "SPECIES_SHARPEDO",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Rough Skin",
        null,
        "Speed Boost"
      ]
    },
    "320": {
      "name": "Wailmer",
      "define": "SPECIES_WAILMER",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Water Veil",
        "Oblivious",
        "Pressure"
      ]
    },
    "321": {
      "name": "Wailord",
      "define": "SPECIES_WAILORD",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Water Veil",
        "Oblivious",
        "Pressure"
      ]
    },
    "322": {
      "name": "Numel",
      "define": "SPECIES_NUMEL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Simple",
        "Own Tempo"
      ]
    },
    "323": {
      "name": "Camerupt",
      "define": "SPECIES_CAMERUPT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Magma Armor",
        "Solid Rock",
        "Anger Point"
      ]
    },
    "324": {
      "name": "Torkoal",
      "define": "SPECIES_TORKOAL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "White Smoke",
        "Drought",
        "Shell Armor"
      ]
    },
    "325": {
      "name": "Spoink",
      "define": "SPECIES_SPOINK",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Thick Fat",
        "Own Tempo",
        "Gluttony"
      ]
    },
    "326": {
      "name": "Grumpig",
      "define": "SPECIES_GRUMPIG",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Thick Fat",
        "Own Tempo",
        "Gluttony"
      ]
    },
    "327": {
      "name": "Spinda",
      "define": "SPECIES_SPINDA",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Own Tempo",
        "Tangled Feet",
        "Contrary"
      ]
    },
    "328": {
      "name": "Trapinch",
      "define": "SPECIES_TRAPINCH",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Hyper Cutter",
        "Arena Trap",
        "Sheer Force"
      ]
    },
    "329": {
      "name": "Vibrava",
      "define": "SPECIES_VIBRAVA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Levitate",
        "Levitate",
        "Levitate"
      ]
    },
    "330": {
      "name": "Flygon",
      "define": "SPECIES_FLYGON",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Levitate",
        "Levitate",
        "Levitate"
      ]
    },
    "331": {
      "name": "Cacnea",
      "define": "SPECIES_CACNEA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sand Veil",
        null,
        "Water Absorb"
      ]
    },
    "332": {
      "name": "Cacturne",
      "define": "SPECIES_CACTURNE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sand Veil",
        null,
        "Water Absorb"
      ]
    },
    "333": {
      "name": "Swablu",
      "define": "SPECIES_SWABLU",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Natural Cure",
        null,
        "Cloud Nine"
      ]
    },
    "334": {
      "name": "Altaria",
      "define": "SPECIES_ALTARIA",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Natural Cure",
        null,
        "Cloud Nine"
      ]
    },
    "335": {
      "name": "Zangoose",
      "define": "SPECIES_ZANGOOSE",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Immunity",
        null,
        "Toxic Boost"
      ]
    },
    "336": {
      "name": "Seviper",
      "define": "SPECIES_SEVIPER",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Shed Skin",
        null,
        "Infiltrator"
      ]
    },
    "337": {
      "name": "Lunatone",
      "define": "SPECIES_LUNATONE",
      "genderRatio": 255,
      "growthRate": 4,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "338": {
      "name": "Solrock",
      "define": "SPECIES_SOLROCK",
      "genderRatio": 255,
      "growthRate": 4,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "339": {
      "name": "Barboach",
      "define": "SPECIES_BARBOACH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Anticipation",
        "Hydration"
      ]
    },
    "340": {
      "name": "Whiscash",
      "define": "SPECIES_WHISCASH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Oblivious",
        "Anticipation",
        "Hydration"
      ]
    },
    "341": {
      "name": "Corphish",
      "define": "SPECIES_CORPHISH",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Hyper Cutter",
        "Shell Armor",
        "Adaptability"
      ]
    },
    "342": {
      "name": "Crawdaunt",
      "define": "SPECIES_CRAWDAUNT",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Hyper Cutter",
        "Shell Armor",
        "Adaptability"
      ]
    },
    "343": {
      "name": "Baltoy",
      "define": "SPECIES_BALTOY",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "344": {
      "name": "Claydol",
      "define": "SPECIES_CLAYDOL",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "345": {
      "name": "Lileep",
      "define": "SPECIES_LILEEP",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Suction Cups",
        null,
        "Storm Drain"
      ]
    },
    "346": {
      "name": "Cradily",
      "define": "SPECIES_CRADILY",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Suction Cups",
        null,
        "Storm Drain"
      ]
    },
    "347": {
      "name": "Anorith",
      "define": "SPECIES_ANORITH",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Battle Armor",
        null,
        "Swift Swim"
      ]
    },
    "348": {
      "name": "Armaldo",
      "define": "SPECIES_ARMALDO",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Battle Armor",
        null,
        "Swift Swim"
      ]
    },
    "349": {
      "name": "Feebas",
      "define": "SPECIES_FEEBAS",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Swift Swim",
        "Oblivious",
        "Adaptability"
      ]
    },
    "350": {
      "name": "Milotic",
      "define": "SPECIES_MILOTIC",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Marvel Scale",
        "Competitive",
        "Cute Charm"
      ]
    },
    "351": {
      "name": "Castform-Normal",
      "define": "SPECIES_CASTFORM_NORMAL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Forecast",
        null,
        null
      ]
    },
    "352": {
      "name": "Kecleon",
      "define": "SPECIES_KECLEON",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Color Change",
        null,
        "Protean"
      ]
    },
    "353": {
      "name": "Shuppet",
      "define": "SPECIES_SHUPPET",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Insomnia",
        "Frisk",
        "Cursed Body"
      ]
    },
    "354": {
      "name": "Banette",
      "define": "SPECIES_BANETTE",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Insomnia",
        "Frisk",
        "Cursed Body"
      ]
    },
    "355": {
      "name": "Duskull",
      "define": "SPECIES_DUSKULL",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Levitate",
        null,
        "Frisk"
      ]
    },
    "356": {
      "name": "Dusclops",
      "define": "SPECIES_DUSCLOPS",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Pressure",
        null,
        "Frisk"
      ]
    },
    "357": {
      "name": "Tropius",
      "define": "SPECIES_TROPIUS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Chlorophyll",
        "Solar Power",
        "Harvest"
      ]
    },
    "358": {
      "name": "Chimecho",
      "define": "SPECIES_CHIMECHO",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "359": {
      "name": "Absol",
      "define": "SPECIES_ABSOL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Pressure",
        "Super Luck",
        "Justified"
      ]
    },
    "360": {
      "name": "Wynaut",
      "define": "SPECIES_WYNAUT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shadow Tag",
        null,
        "Telepathy"
      ]
    },
    "361": {
      "name": "Snorunt",
      "define": "SPECIES_SNORUNT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Inner Focus",
        "Ice Body",
        "Moody"
      ]
    },
    "362": {
      "name": "Glalie",
      "define": "SPECIES_GLALIE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Inner Focus",
        "Ice Body",
        "Moody"
      ]
    },
    "363": {
      "name": "Spheal",
      "define": "SPECIES_SPHEAL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Thick Fat",
        "Ice Body",
        "Oblivious"
      ]
    },
    "364": {
      "name": "Sealeo",
      "define": "SPECIES_SEALEO",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Thick Fat",
        "Ice Body",
        "Oblivious"
      ]
    },
    "365": {
      "name": "Walrein",
      "define": "SPECIES_WALREIN",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Thick Fat",
        "Ice Body",
        "Oblivious"
      ]
    },
    "366": {
      "name": "Clamperl",
      "define": "SPECIES_CLAMPERL",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Shell Armor",
        null,
        "Rattled"
      ]
    },
    "367": {
      "name": "Huntail",
      "define": "SPECIES_HUNTAIL",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Swift Swim",
        null,
        "Water Veil"
      ]
    },
    "368": {
      "name": "Gorebyss",
      "define": "SPECIES_GOREBYSS",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Swift Swim",
        null,
        "Hydration"
      ]
    },
    "369": {
      "name": "Relicanth",
      "define": "SPECIES_RELICANTH",
      "genderRatio": 31,
      "growthRate": 5,
      "abilities": [
        "Swift Swim",
        "Rock Head",
        "Sturdy"
      ]
    },
    "370": {
      "name": "Luvdisc",
      "define": "SPECIES_LUVDISC",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Swift Swim",
        null,
        "Hydration"
      ]
    },
    "371": {
      "name": "Bagon",
      "define": "SPECIES_BAGON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Rock Head",
        null,
        "Sheer Force"
      ]
    },
    "372": {
      "name": "Shelgon",
      "define": "SPECIES_SHELGON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Rock Head",
        null,
        "Overcoat"
      ]
    },
    "373": {
      "name": "Salamence",
      "define": "SPECIES_SALAMENCE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        null,
        "Moxie"
      ]
    },
    "374": {
      "name": "Beldum",
      "define": "SPECIES_BELDUM",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        "Light Metal"
      ]
    },
    "375": {
      "name": "Metang",
      "define": "SPECIES_METANG",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        "Light Metal"
      ]
    },
    "376": {
      "name": "Metagross",
      "define": "SPECIES_METAGROSS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        "Light Metal"
      ]
    },
    "377": {
      "name": "Regirock",
      "define": "SPECIES_REGIROCK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        "Sturdy"
      ]
    },
    "378": {
      "name": "Regice",
      "define": "SPECIES_REGICE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        "Ice Body"
      ]
    },
    "379": {
      "name": "Registeel",
      "define": "SPECIES_REGISTEEL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        "Light Metal"
      ]
    },
    "380": {
      "name": "Latias",
      "define": "SPECIES_LATIAS",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "381": {
      "name": "Latios",
      "define": "SPECIES_LATIOS",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "382": {
      "name": "Kyogre",
      "define": "SPECIES_KYOGRE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Drizzle",
        null,
        null
      ]
    },
    "383": {
      "name": "Groudon",
      "define": "SPECIES_GROUDON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Drought",
        null,
        null
      ]
    },
    "384": {
      "name": "Rayquaza",
      "define": "SPECIES_RAYQUAZA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Air Lock",
        null,
        null
      ]
    },
    "385": {
      "name": "Jirachi",
      "define": "SPECIES_JIRACHI",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Serene Grace",
        null,
        null
      ]
    },
    "386": {
      "name": "Deoxys-Normal",
      "define": "SPECIES_DEOXYS_NORMAL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        null
      ]
    },
    "387": {
      "name": "Turtwig",
      "define": "SPECIES_TURTWIG",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Shell Armor"
      ]
    },
    "388": {
      "name": "Grotle",
      "define": "SPECIES_GROTLE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Shell Armor"
      ]
    },
    "389": {
      "name": "Torterra",
      "define": "SPECIES_TORTERRA",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Shell Armor"
      ]
    },
    "390": {
      "name": "Chimchar",
      "define": "SPECIES_CHIMCHAR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Iron Fist"
      ]
    },
    "391": {
      "name": "Monferno",
      "define": "SPECIES_MONFERNO",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Iron Fist"
      ]
    },
    "392": {
      "name": "Infernape",
      "define": "SPECIES_INFERNAPE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Iron Fist"
      ]
    },
    "393": {
      "name": "Piplup",
      "define": "SPECIES_PIPLUP",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Competitive"
      ]
    },
    "394": {
      "name": "Prinplup",
      "define": "SPECIES_PRINPLUP",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Competitive"
      ]
    },
    "395": {
      "name": "Empoleon",
      "define": "SPECIES_EMPOLEON",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Competitive"
      ]
    },
    "396": {
      "name": "Starly",
      "define": "SPECIES_STARLY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        null,
        "Reckless"
      ]
    },
    "397": {
      "name": "Staravia",
      "define": "SPECIES_STARAVIA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        null,
        "Reckless"
      ]
    },
    "398": {
      "name": "Staraptor",
      "define": "SPECIES_STARAPTOR",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        null,
        "Reckless"
      ]
    },
    "399": {
      "name": "Bidoof",
      "define": "SPECIES_BIDOOF",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Simple",
        "Unaware",
        "Moody"
      ]
    },
    "400": {
      "name": "Bibarel",
      "define": "SPECIES_BIBAREL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Simple",
        "Unaware",
        "Moody"
      ]
    },
    "401": {
      "name": "Kricketot",
      "define": "SPECIES_KRICKETOT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Shed Skin",
        null,
        "Run Away"
      ]
    },
    "402": {
      "name": "Kricketune",
      "define": "SPECIES_KRICKETUNE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swarm",
        null,
        "Technician"
      ]
    },
    "403": {
      "name": "Shinx",
      "define": "SPECIES_SHINX",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Rivalry",
        "Intimidate",
        "Guts"
      ]
    },
    "404": {
      "name": "Luxio",
      "define": "SPECIES_LUXIO",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Rivalry",
        "Intimidate",
        "Guts"
      ]
    },
    "405": {
      "name": "Luxray",
      "define": "SPECIES_LUXRAY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Rivalry",
        "Intimidate",
        "Guts"
      ]
    },
    "406": {
      "name": "Budew",
      "define": "SPECIES_BUDEW",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Natural Cure",
        "Poison Point",
        "Leaf Guard"
      ]
    },
    "407": {
      "name": "Roserade",
      "define": "SPECIES_ROSERADE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Natural Cure",
        "Poison Point",
        "Technician"
      ]
    },
    "408": {
      "name": "Cranidos",
      "define": "SPECIES_CRANIDOS",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Mold Breaker",
        null,
        "Sheer Force"
      ]
    },
    "409": {
      "name": "Rampardos",
      "define": "SPECIES_RAMPARDOS",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Mold Breaker",
        null,
        "Sheer Force"
      ]
    },
    "410": {
      "name": "Shieldon",
      "define": "SPECIES_SHIELDON",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Sturdy",
        null,
        "Soundproof"
      ]
    },
    "411": {
      "name": "Bastiodon",
      "define": "SPECIES_BASTIODON",
      "genderRatio": 31,
      "growthRate": 1,
      "abilities": [
        "Sturdy",
        null,
        "Soundproof"
      ]
    },
    "412": {
      "name": "Burmy-Plant",
      "define": "SPECIES_BURMY_PLANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Overcoat"
      ]
    },
    "413": {
      "name": "Wormadam-Plant",
      "define": "SPECIES_WORMADAM_PLANT",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Anticipation",
        null,
        "Overcoat"
      ]
    },
    "414": {
      "name": "Mothim-Plant",
      "define": "SPECIES_MOTHIM_PLANT",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        "Tinted Lens"
      ]
    },
    "415": {
      "name": "Combee",
      "define": "SPECIES_COMBEE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Honey Gather",
        null,
        "Hustle"
      ]
    },
    "416": {
      "name": "Vespiquen",
      "define": "SPECIES_VESPIQUEN",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Pressure",
        null,
        "Unnerve"
      ]
    },
    "417": {
      "name": "Pachirisu",
      "define": "SPECIES_PACHIRISU",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Pickup",
        "Volt Absorb"
      ]
    },
    "418": {
      "name": "Buizel",
      "define": "SPECIES_BUIZEL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        null,
        "Water Veil"
      ]
    },
    "419": {
      "name": "Floatzel",
      "define": "SPECIES_FLOATZEL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        null,
        "Water Veil"
      ]
    },
    "420": {
      "name": "Cherubi",
      "define": "SPECIES_CHERUBI",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        null,
        null
      ]
    },
    "421": {
      "name": "Cherrim-Overcast",
      "define": "SPECIES_CHERRIM_OVERCAST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Flower Gift",
        null,
        null
      ]
    },
    "422": {
      "name": "Shellos-West",
      "define": "SPECIES_SHELLOS_WEST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sticky Hold",
        "Storm Drain",
        "Sand Force"
      ]
    },
    "423": {
      "name": "Gastrodon-West",
      "define": "SPECIES_GASTRODON_WEST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sticky Hold",
        "Storm Drain",
        "Sand Force"
      ]
    },
    "424": {
      "name": "Ambipom",
      "define": "SPECIES_AMBIPOM",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Technician",
        "Pickup",
        "Skill Link"
      ]
    },
    "425": {
      "name": "Drifloon",
      "define": "SPECIES_DRIFLOON",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Aftermath",
        "Unburden",
        "Flare Boost"
      ]
    },
    "426": {
      "name": "Drifblim",
      "define": "SPECIES_DRIFBLIM",
      "genderRatio": 127,
      "growthRate": 2,
      "abilities": [
        "Aftermath",
        "Unburden",
        "Flare Boost"
      ]
    },
    "427": {
      "name": "Buneary",
      "define": "SPECIES_BUNEARY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Klutz",
        "Limber"
      ]
    },
    "428": {
      "name": "Lopunny",
      "define": "SPECIES_LOPUNNY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cute Charm",
        "Klutz",
        "Limber"
      ]
    },
    "429": {
      "name": "Mismagius",
      "define": "SPECIES_MISMAGIUS",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "430": {
      "name": "Honchkrow",
      "define": "SPECIES_HONCHKROW",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Insomnia",
        "Super Luck",
        "Moxie"
      ]
    },
    "431": {
      "name": "Glameow",
      "define": "SPECIES_GLAMEOW",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Limber",
        "Own Tempo",
        "Keen Eye"
      ]
    },
    "432": {
      "name": "Purugly",
      "define": "SPECIES_PURUGLY",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Thick Fat",
        "Own Tempo",
        "Defiant"
      ]
    },
    "433": {
      "name": "Chingling",
      "define": "SPECIES_CHINGLING",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "434": {
      "name": "Stunky",
      "define": "SPECIES_STUNKY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stench",
        "Aftermath",
        "Keen Eye"
      ]
    },
    "435": {
      "name": "Skuntank",
      "define": "SPECIES_SKUNTANK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stench",
        "Aftermath",
        "Keen Eye"
      ]
    },
    "436": {
      "name": "Bronzor",
      "define": "SPECIES_BRONZOR",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        "Heatproof",
        "Heavy Metal"
      ]
    },
    "437": {
      "name": "Bronzong",
      "define": "SPECIES_BRONZONG",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        "Heatproof",
        "Heavy Metal"
      ]
    },
    "438": {
      "name": "Bonsly",
      "define": "SPECIES_BONSLY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        "Rock Head",
        "Rattled"
      ]
    },
    "439": {
      "name": "Mime Jr.",
      "define": "SPECIES_MIME_JR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Soundproof",
        "Filter",
        "Technician"
      ]
    },
    "440": {
      "name": "Happiny",
      "define": "SPECIES_HAPPINY",
      "genderRatio": 254,
      "growthRate": 4,
      "abilities": [
        "Natural Cure",
        "Serene Grace",
        "Friend Guard"
      ]
    },
    "441": {
      "name": "Chatot",
      "define": "SPECIES_CHATOT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        "Tangled Feet",
        "Big Pecks"
      ]
    },
    "442": {
      "name": "Spiritomb",
      "define": "SPECIES_SPIRITOMB",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pressure",
        null,
        "Infiltrator"
      ]
    },
    "443": {
      "name": "Gible",
      "define": "SPECIES_GIBLE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sand Veil",
        null,
        "Rough Skin"
      ]
    },
    "444": {
      "name": "Gabite",
      "define": "SPECIES_GABITE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sand Veil",
        null,
        "Rough Skin"
      ]
    },
    "445": {
      "name": "Garchomp",
      "define": "SPECIES_GARCHOMP",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sand Veil",
        null,
        "Rough Skin"
      ]
    },
    "446": {
      "name": "Munchlax",
      "define": "SPECIES_MUNCHLAX",
      "genderRatio": 31,
      "growthRate": 5,
      "abilities": [
        "Pickup",
        "Thick Fat",
        "Gluttony"
      ]
    },
    "447": {
      "name": "Riolu",
      "define": "SPECIES_RIOLU",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Steadfast",
        "Inner Focus",
        "Prankster"
      ]
    },
    "448": {
      "name": "Lucario",
      "define": "SPECIES_LUCARIO",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Steadfast",
        "Inner Focus",
        "Justified"
      ]
    },
    "449": {
      "name": "Hippopotas",
      "define": "SPECIES_HIPPOPOTAS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sand Stream",
        null,
        "Sand Force"
      ]
    },
    "450": {
      "name": "Hippowdon",
      "define": "SPECIES_HIPPOWDON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sand Stream",
        null,
        "Sand Force"
      ]
    },
    "451": {
      "name": "Skorupi",
      "define": "SPECIES_SKORUPI",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Battle Armor",
        "Sniper",
        "Keen Eye"
      ]
    },
    "452": {
      "name": "Drapion",
      "define": "SPECIES_DRAPION",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Battle Armor",
        "Sniper",
        "Keen Eye"
      ]
    },
    "453": {
      "name": "Croagunk",
      "define": "SPECIES_CROAGUNK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Anticipation",
        "Dry Skin",
        "Poison Touch"
      ]
    },
    "454": {
      "name": "Toxicroak",
      "define": "SPECIES_TOXICROAK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Anticipation",
        "Dry Skin",
        "Poison Touch"
      ]
    },
    "455": {
      "name": "Carnivine",
      "define": "SPECIES_CARNIVINE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "456": {
      "name": "Finneon",
      "define": "SPECIES_FINNEON",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Swift Swim",
        "Storm Drain",
        "Water Veil"
      ]
    },
    "457": {
      "name": "Lumineon",
      "define": "SPECIES_LUMINEON",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Swift Swim",
        "Storm Drain",
        "Water Veil"
      ]
    },
    "458": {
      "name": "Mantyke",
      "define": "SPECIES_MANTYKE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Swift Swim",
        "Water Absorb",
        "Water Veil"
      ]
    },
    "459": {
      "name": "Snover",
      "define": "SPECIES_SNOVER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Snow Warning",
        null,
        "Soundproof"
      ]
    },
    "460": {
      "name": "Abomasnow",
      "define": "SPECIES_ABOMASNOW",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Snow Warning",
        null,
        "Soundproof"
      ]
    },
    "461": {
      "name": "Weavile",
      "define": "SPECIES_WEAVILE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Pressure",
        null,
        "Pickpocket"
      ]
    },
    "462": {
      "name": "Magnezone",
      "define": "SPECIES_MAGNEZONE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Magnet Pull",
        "Sturdy",
        "Analytic"
      ]
    },
    "463": {
      "name": "Lickilicky",
      "define": "SPECIES_LICKILICKY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        "Oblivious",
        "Cloud Nine"
      ]
    },
    "464": {
      "name": "Rhyperior",
      "define": "SPECIES_RHYPERIOR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Lightning Rod",
        "Solid Rock",
        "Reckless"
      ]
    },
    "465": {
      "name": "Tangrowth",
      "define": "SPECIES_TANGROWTH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Leaf Guard",
        "Regenerator"
      ]
    },
    "466": {
      "name": "Electivire",
      "define": "SPECIES_ELECTIVIRE",
      "genderRatio": 63,
      "growthRate": 0,
      "abilities": [
        "Motor Drive",
        null,
        "Vital Spirit"
      ]
    },
    "467": {
      "name": "Magmortar",
      "define": "SPECIES_MAGMORTAR",
      "genderRatio": 63,
      "growthRate": 0,
      "abilities": [
        "Flame Body",
        null,
        "Vital Spirit"
      ]
    },
    "468": {
      "name": "Togekiss",
      "define": "SPECIES_TOGEKISS",
      "genderRatio": 31,
      "growthRate": 4,
      "abilities": [
        "Hustle",
        "Serene Grace",
        "Super Luck"
      ]
    },
    "469": {
      "name": "Yanmega",
      "define": "SPECIES_YANMEGA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Speed Boost",
        "Tinted Lens",
        "Frisk"
      ]
    },
    "470": {
      "name": "Leafeon",
      "define": "SPECIES_LEAFEON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Leaf Guard",
        "Leaf Guard",
        "Chlorophyll"
      ]
    },
    "471": {
      "name": "Glaceon",
      "define": "SPECIES_GLACEON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        "Snow Cloak",
        "Ice Body"
      ]
    },
    "472": {
      "name": "Gliscor",
      "define": "SPECIES_GLISCOR",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Hyper Cutter",
        "Sand Veil",
        "Poison Heal"
      ]
    },
    "473": {
      "name": "Mamoswine",
      "define": "SPECIES_MAMOSWINE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Oblivious",
        "Snow Cloak",
        "Thick Fat"
      ]
    },
    "474": {
      "name": "Porygon-Z",
      "define": "SPECIES_PORYGON_Z",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Adaptability",
        "Download",
        "Analytic"
      ]
    },
    "475": {
      "name": "Gallade",
      "define": "SPECIES_GALLADE",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Steadfast",
        "Sharpness",
        "Justified"
      ]
    },
    "476": {
      "name": "Probopass",
      "define": "SPECIES_PROBOPASS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        "Magnet Pull",
        "Sand Force"
      ]
    },
    "477": {
      "name": "Dusknoir",
      "define": "SPECIES_DUSKNOIR",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Pressure",
        null,
        "Frisk"
      ]
    },
    "478": {
      "name": "Froslass",
      "define": "SPECIES_FROSLASS",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        null,
        "Cursed Body"
      ]
    },
    "479": {
      "name": "Rotom",
      "define": "SPECIES_ROTOM",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "480": {
      "name": "Uxie",
      "define": "SPECIES_UXIE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "481": {
      "name": "Mesprit",
      "define": "SPECIES_MESPRIT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "482": {
      "name": "Azelf",
      "define": "SPECIES_AZELF",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "483": {
      "name": "Dialga",
      "define": "SPECIES_DIALGA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Telepathy"
      ]
    },
    "484": {
      "name": "Palkia",
      "define": "SPECIES_PALKIA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Telepathy"
      ]
    },
    "485": {
      "name": "Heatran",
      "define": "SPECIES_HEATRAN",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Flash Fire",
        null,
        "Flame Body"
      ]
    },
    "486": {
      "name": "Regigigas",
      "define": "SPECIES_REGIGIGAS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Slow Start",
        null,
        null
      ]
    },
    "487": {
      "name": "Giratina-Altered",
      "define": "SPECIES_GIRATINA_ALTERED",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Telepathy"
      ]
    },
    "488": {
      "name": "Cresselia",
      "define": "SPECIES_CRESSELIA",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "489": {
      "name": "Phione",
      "define": "SPECIES_PHIONE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Hydration",
        null,
        null
      ]
    },
    "490": {
      "name": "Manaphy",
      "define": "SPECIES_MANAPHY",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Hydration",
        null,
        null
      ]
    },
    "491": {
      "name": "Darkrai",
      "define": "SPECIES_DARKRAI",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Bad Dreams",
        null,
        null
      ]
    },
    "492": {
      "name": "Shaymin-Land",
      "define": "SPECIES_SHAYMIN_LAND",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Natural Cure",
        null,
        null
      ]
    },
    "493": {
      "name": "Arceus-Normal",
      "define": "SPECIES_ARCEUS_NORMAL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "494": {
      "name": "Victini",
      "define": "SPECIES_VICTINI",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Victory Star",
        null,
        null
      ]
    },
    "495": {
      "name": "Snivy",
      "define": "SPECIES_SNIVY",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Contrary"
      ]
    },
    "496": {
      "name": "Servine",
      "define": "SPECIES_SERVINE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Contrary"
      ]
    },
    "497": {
      "name": "Serperior",
      "define": "SPECIES_SERPERIOR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Contrary"
      ]
    },
    "498": {
      "name": "Tepig",
      "define": "SPECIES_TEPIG",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Thick Fat"
      ]
    },
    "499": {
      "name": "Pignite",
      "define": "SPECIES_PIGNITE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Thick Fat"
      ]
    },
    "500": {
      "name": "Emboar",
      "define": "SPECIES_EMBOAR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Reckless"
      ]
    },
    "501": {
      "name": "Oshawott",
      "define": "SPECIES_OSHAWOTT",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Shell Armor"
      ]
    },
    "502": {
      "name": "Dewott",
      "define": "SPECIES_DEWOTT",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Shell Armor"
      ]
    },
    "503": {
      "name": "Samurott",
      "define": "SPECIES_SAMUROTT",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Shell Armor"
      ]
    },
    "504": {
      "name": "Patrat",
      "define": "SPECIES_PATRAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Keen Eye",
        "Analytic"
      ]
    },
    "505": {
      "name": "Watchog",
      "define": "SPECIES_WATCHOG",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Illuminate",
        "Keen Eye",
        "Analytic"
      ]
    },
    "506": {
      "name": "Lillipup",
      "define": "SPECIES_LILLIPUP",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Vital Spirit",
        "Pickup",
        "Run Away"
      ]
    },
    "507": {
      "name": "Herdier",
      "define": "SPECIES_HERDIER",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        "Sand Rush",
        "Scrappy"
      ]
    },
    "508": {
      "name": "Stoutland",
      "define": "SPECIES_STOUTLAND",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        "Sand Rush",
        "Scrappy"
      ]
    },
    "509": {
      "name": "Purrloin",
      "define": "SPECIES_PURRLOIN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Limber",
        "Unburden",
        "Prankster"
      ]
    },
    "510": {
      "name": "Liepard",
      "define": "SPECIES_LIEPARD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Limber",
        "Unburden",
        "Prankster"
      ]
    },
    "511": {
      "name": "Pansage",
      "define": "SPECIES_PANSAGE",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        null,
        "Overgrow"
      ]
    },
    "512": {
      "name": "Simisage",
      "define": "SPECIES_SIMISAGE",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        null,
        "Overgrow"
      ]
    },
    "513": {
      "name": "Pansear",
      "define": "SPECIES_PANSEAR",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        null,
        "Blaze"
      ]
    },
    "514": {
      "name": "Simisear",
      "define": "SPECIES_SIMISEAR",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        null,
        "Blaze"
      ]
    },
    "515": {
      "name": "Panpour",
      "define": "SPECIES_PANPOUR",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        null,
        "Torrent"
      ]
    },
    "516": {
      "name": "Simipour",
      "define": "SPECIES_SIMIPOUR",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        null,
        "Torrent"
      ]
    },
    "517": {
      "name": "Munna",
      "define": "SPECIES_MUNNA",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Forewarn",
        "Synchronize",
        "Telepathy"
      ]
    },
    "518": {
      "name": "Musharna",
      "define": "SPECIES_MUSHARNA",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Forewarn",
        "Synchronize",
        "Telepathy"
      ]
    },
    "519": {
      "name": "Pidove",
      "define": "SPECIES_PIDOVE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Big Pecks",
        "Super Luck",
        "Rivalry"
      ]
    },
    "520": {
      "name": "Tranquill",
      "define": "SPECIES_TRANQUILL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Big Pecks",
        "Super Luck",
        "Rivalry"
      ]
    },
    "521": {
      "name": "Unfezant",
      "define": "SPECIES_UNFEZANT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Big Pecks",
        "Super Luck",
        "Rivalry"
      ]
    },
    "522": {
      "name": "Blitzle",
      "define": "SPECIES_BLITZLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Lightning Rod",
        "Motor Drive",
        "Sap Sipper"
      ]
    },
    "523": {
      "name": "Zebstrika",
      "define": "SPECIES_ZEBSTRIKA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Lightning Rod",
        "Motor Drive",
        "Sap Sipper"
      ]
    },
    "524": {
      "name": "Roggenrola",
      "define": "SPECIES_ROGGENROLA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sturdy",
        "Weak Armor",
        "Sand Force"
      ]
    },
    "525": {
      "name": "Boldore",
      "define": "SPECIES_BOLDORE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sturdy",
        "Weak Armor",
        "Sand Force"
      ]
    },
    "526": {
      "name": "Gigalith",
      "define": "SPECIES_GIGALITH",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sturdy",
        "Sand Stream",
        "Sand Force"
      ]
    },
    "527": {
      "name": "Woobat",
      "define": "SPECIES_WOOBAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Unaware",
        "Klutz",
        "Simple"
      ]
    },
    "528": {
      "name": "Swoobat",
      "define": "SPECIES_SWOOBAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Unaware",
        "Klutz",
        "Simple"
      ]
    },
    "529": {
      "name": "Drilbur",
      "define": "SPECIES_DRILBUR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Rush",
        "Sand Force",
        "Mold Breaker"
      ]
    },
    "530": {
      "name": "Excadrill",
      "define": "SPECIES_EXCADRILL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Rush",
        "Sand Force",
        "Mold Breaker"
      ]
    },
    "531": {
      "name": "Audino",
      "define": "SPECIES_AUDINO",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Healer",
        "Regenerator",
        "Klutz"
      ]
    },
    "532": {
      "name": "Timburr",
      "define": "SPECIES_TIMBURR",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Guts",
        "Sheer Force",
        "Iron Fist"
      ]
    },
    "533": {
      "name": "Gurdurr",
      "define": "SPECIES_GURDURR",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Guts",
        "Sheer Force",
        "Iron Fist"
      ]
    },
    "534": {
      "name": "Conkeldurr",
      "define": "SPECIES_CONKELDURR",
      "genderRatio": 63,
      "growthRate": 3,
      "abilities": [
        "Guts",
        "Sheer Force",
        "Iron Fist"
      ]
    },
    "535": {
      "name": "Tympole",
      "define": "SPECIES_TYMPOLE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swift Swim",
        "Hydration",
        "Water Absorb"
      ]
    },
    "536": {
      "name": "Palpitoad",
      "define": "SPECIES_PALPITOAD",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swift Swim",
        "Hydration",
        "Water Absorb"
      ]
    },
    "537": {
      "name": "Seismitoad",
      "define": "SPECIES_SEISMITOAD",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swift Swim",
        "Poison Touch",
        "Water Absorb"
      ]
    },
    "538": {
      "name": "Throh",
      "define": "SPECIES_THROH",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Guts",
        "Inner Focus",
        "Mold Breaker"
      ]
    },
    "539": {
      "name": "Sawk",
      "define": "SPECIES_SAWK",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        "Inner Focus",
        "Mold Breaker"
      ]
    },
    "540": {
      "name": "Sewaddle",
      "define": "SPECIES_SEWADDLE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swarm",
        "Chlorophyll",
        "Overcoat"
      ]
    },
    "541": {
      "name": "Swadloon",
      "define": "SPECIES_SWADLOON",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Leaf Guard",
        "Chlorophyll",
        "Overcoat"
      ]
    },
    "542": {
      "name": "Leavanny",
      "define": "SPECIES_LEAVANNY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Swarm",
        "Chlorophyll",
        "Overcoat"
      ]
    },
    "543": {
      "name": "Venipede",
      "define": "SPECIES_VENIPEDE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Swarm",
        "Speed Boost"
      ]
    },
    "544": {
      "name": "Whirlipede",
      "define": "SPECIES_WHIRLIPEDE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Swarm",
        "Speed Boost"
      ]
    },
    "545": {
      "name": "Scolipede",
      "define": "SPECIES_SCOLIPEDE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Poison Point",
        "Swarm",
        "Speed Boost"
      ]
    },
    "546": {
      "name": "Cottonee",
      "define": "SPECIES_COTTONEE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Prankster",
        "Infiltrator",
        "Chlorophyll"
      ]
    },
    "547": {
      "name": "Whimsicott",
      "define": "SPECIES_WHIMSICOTT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Prankster",
        "Infiltrator",
        "Chlorophyll"
      ]
    },
    "548": {
      "name": "Petilil",
      "define": "SPECIES_PETILIL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Own Tempo",
        "Leaf Guard"
      ]
    },
    "549": {
      "name": "Lilligant",
      "define": "SPECIES_LILLIGANT",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Own Tempo",
        "Leaf Guard"
      ]
    },
    "550": {
      "name": "Basculin-Red-Striped",
      "define": "SPECIES_BASCULIN_RED_STRIPED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Reckless",
        "Adaptability",
        "Mold Breaker"
      ]
    },
    "551": {
      "name": "Sandile",
      "define": "SPECIES_SANDILE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        "Moxie",
        "Anger Point"
      ]
    },
    "552": {
      "name": "Krokorok",
      "define": "SPECIES_KROKOROK",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        "Moxie",
        "Anger Point"
      ]
    },
    "553": {
      "name": "Krookodile",
      "define": "SPECIES_KROOKODILE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        "Moxie",
        "Anger Point"
      ]
    },
    "554": {
      "name": "Darumaka",
      "define": "SPECIES_DARUMAKA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Hustle",
        null,
        "Inner Focus"
      ]
    },
    "555": {
      "name": "Darmanitan-Standard",
      "define": "SPECIES_DARMANITAN_STANDARD",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sheer Force",
        null,
        "Zen Mode"
      ]
    },
    "556": {
      "name": "Maractus",
      "define": "SPECIES_MARACTUS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Absorb",
        "Chlorophyll",
        "Storm Drain"
      ]
    },
    "557": {
      "name": "Dwebble",
      "define": "SPECIES_DWEBBLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        "Shell Armor",
        "Weak Armor"
      ]
    },
    "558": {
      "name": "Crustle",
      "define": "SPECIES_CRUSTLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        "Shell Armor",
        "Weak Armor"
      ]
    },
    "559": {
      "name": "Scraggy",
      "define": "SPECIES_SCRAGGY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        "Moxie",
        "Intimidate"
      ]
    },
    "560": {
      "name": "Scrafty",
      "define": "SPECIES_SCRAFTY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        "Moxie",
        "Intimidate"
      ]
    },
    "561": {
      "name": "Sigilyph",
      "define": "SPECIES_SIGILYPH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Wonder Skin",
        "Magic Guard",
        "Tinted Lens"
      ]
    },
    "562": {
      "name": "Yamask",
      "define": "SPECIES_YAMASK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Mummy",
        null,
        null
      ]
    },
    "563": {
      "name": "Cofagrigus",
      "define": "SPECIES_COFAGRIGUS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Mummy",
        null,
        null
      ]
    },
    "564": {
      "name": "Tirtouga",
      "define": "SPECIES_TIRTOUGA",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Solid Rock",
        "Sturdy",
        "Swift Swim"
      ]
    },
    "565": {
      "name": "Carracosta",
      "define": "SPECIES_CARRACOSTA",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Solid Rock",
        "Sturdy",
        "Swift Swim"
      ]
    },
    "566": {
      "name": "Archen",
      "define": "SPECIES_ARCHEN",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Defeatist",
        null,
        null
      ]
    },
    "567": {
      "name": "Archeops",
      "define": "SPECIES_ARCHEOPS",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Defeatist",
        null,
        null
      ]
    },
    "568": {
      "name": "Trubbish",
      "define": "SPECIES_TRUBBISH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stench",
        "Sticky Hold",
        "Aftermath"
      ]
    },
    "569": {
      "name": "Garbodor",
      "define": "SPECIES_GARBODOR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stench",
        "Weak Armor",
        "Aftermath"
      ]
    },
    "570": {
      "name": "Zorua",
      "define": "SPECIES_ZORUA",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Illusion",
        null,
        null
      ]
    },
    "571": {
      "name": "Zoroark",
      "define": "SPECIES_ZOROARK",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Illusion",
        null,
        null
      ]
    },
    "572": {
      "name": "Minccino",
      "define": "SPECIES_MINCCINO",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Technician",
        "Skill Link"
      ]
    },
    "573": {
      "name": "Cinccino",
      "define": "SPECIES_CINCCINO",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Cute Charm",
        "Technician",
        "Skill Link"
      ]
    },
    "574": {
      "name": "Gothita",
      "define": "SPECIES_GOTHITA",
      "genderRatio": 191,
      "growthRate": 3,
      "abilities": [
        "Frisk",
        "Competitive",
        "Shadow Tag"
      ]
    },
    "575": {
      "name": "Gothorita",
      "define": "SPECIES_GOTHORITA",
      "genderRatio": 191,
      "growthRate": 3,
      "abilities": [
        "Frisk",
        "Competitive",
        "Shadow Tag"
      ]
    },
    "576": {
      "name": "Gothitelle",
      "define": "SPECIES_GOTHITELLE",
      "genderRatio": 191,
      "growthRate": 3,
      "abilities": [
        "Frisk",
        "Competitive",
        "Shadow Tag"
      ]
    },
    "577": {
      "name": "Solosis",
      "define": "SPECIES_SOLOSIS",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Overcoat",
        "Magic Guard",
        "Regenerator"
      ]
    },
    "578": {
      "name": "Duosion",
      "define": "SPECIES_DUOSION",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Overcoat",
        "Magic Guard",
        "Regenerator"
      ]
    },
    "579": {
      "name": "Reuniclus",
      "define": "SPECIES_REUNICLUS",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Overcoat",
        "Magic Guard",
        "Regenerator"
      ]
    },
    "580": {
      "name": "Ducklett",
      "define": "SPECIES_DUCKLETT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Big Pecks",
        "Hydration"
      ]
    },
    "581": {
      "name": "Swanna",
      "define": "SPECIES_SWANNA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Big Pecks",
        "Hydration"
      ]
    },
    "582": {
      "name": "Vanillite",
      "define": "SPECIES_VANILLITE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Ice Body",
        "Snow Cloak",
        "Weak Armor"
      ]
    },
    "583": {
      "name": "Vanillish",
      "define": "SPECIES_VANILLISH",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Ice Body",
        "Snow Cloak",
        "Weak Armor"
      ]
    },
    "584": {
      "name": "Vanilluxe",
      "define": "SPECIES_VANILLUXE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Ice Body",
        "Snow Warning",
        "Weak Armor"
      ]
    },
    "585": {
      "name": "Deerling-Spring",
      "define": "SPECIES_DEERLING_SPRING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "586": {
      "name": "Sawsbuck-Spring",
      "define": "SPECIES_SAWSBUCK_SPRING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "587": {
      "name": "Emolga",
      "define": "SPECIES_EMOLGA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Motor Drive"
      ]
    },
    "588": {
      "name": "Karrablast",
      "define": "SPECIES_KARRABLAST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Shed Skin",
        "No Guard"
      ]
    },
    "589": {
      "name": "Escavalier",
      "define": "SPECIES_ESCAVALIER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Shell Armor",
        "Overcoat"
      ]
    },
    "590": {
      "name": "Foongus",
      "define": "SPECIES_FOONGUS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Effect Spore",
        null,
        "Regenerator"
      ]
    },
    "591": {
      "name": "Amoonguss",
      "define": "SPECIES_AMOONGUSS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Effect Spore",
        null,
        "Regenerator"
      ]
    },
    "592": {
      "name": "Frillish",
      "define": "SPECIES_FRILLISH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Absorb",
        "Cursed Body",
        "Damp"
      ]
    },
    "593": {
      "name": "Jellicent",
      "define": "SPECIES_JELLICENT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Absorb",
        "Cursed Body",
        "Damp"
      ]
    },
    "594": {
      "name": "Alomomola",
      "define": "SPECIES_ALOMOMOLA",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Healer",
        "Hydration",
        "Regenerator"
      ]
    },
    "595": {
      "name": "Joltik",
      "define": "SPECIES_JOLTIK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Compound Eyes",
        "Unnerve",
        "Swarm"
      ]
    },
    "596": {
      "name": "Galvantula",
      "define": "SPECIES_GALVANTULA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Compound Eyes",
        "Unnerve",
        "Swarm"
      ]
    },
    "597": {
      "name": "Ferroseed",
      "define": "SPECIES_FERROSEED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Iron Barbs",
        null,
        null
      ]
    },
    "598": {
      "name": "Ferrothorn",
      "define": "SPECIES_FERROTHORN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Iron Barbs",
        null,
        "Anticipation"
      ]
    },
    "599": {
      "name": "Klink",
      "define": "SPECIES_KLINK",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Plus",
        "Minus",
        "Clear Body"
      ]
    },
    "600": {
      "name": "Klang",
      "define": "SPECIES_KLANG",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Plus",
        "Minus",
        "Clear Body"
      ]
    },
    "601": {
      "name": "Klinklang",
      "define": "SPECIES_KLINKLANG",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Plus",
        "Minus",
        "Clear Body"
      ]
    },
    "602": {
      "name": "Tynamo",
      "define": "SPECIES_TYNAMO",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "603": {
      "name": "Eelektrik",
      "define": "SPECIES_EELEKTRIK",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "604": {
      "name": "Eelektross",
      "define": "SPECIES_EELEKTROSS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "605": {
      "name": "Elgyem",
      "define": "SPECIES_ELGYEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Telepathy",
        "Synchronize",
        "Analytic"
      ]
    },
    "606": {
      "name": "Beheeyem",
      "define": "SPECIES_BEHEEYEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Telepathy",
        "Synchronize",
        "Analytic"
      ]
    },
    "607": {
      "name": "Litwick",
      "define": "SPECIES_LITWICK",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Flash Fire",
        "Flame Body",
        "Infiltrator"
      ]
    },
    "608": {
      "name": "Lampent",
      "define": "SPECIES_LAMPENT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Flash Fire",
        "Flame Body",
        "Infiltrator"
      ]
    },
    "609": {
      "name": "Chandelure",
      "define": "SPECIES_CHANDELURE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Flash Fire",
        "Flame Body",
        "Infiltrator"
      ]
    },
    "610": {
      "name": "Axew",
      "define": "SPECIES_AXEW",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Rivalry",
        "Mold Breaker",
        "Unnerve"
      ]
    },
    "611": {
      "name": "Fraxure",
      "define": "SPECIES_FRAXURE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Rivalry",
        "Mold Breaker",
        "Unnerve"
      ]
    },
    "612": {
      "name": "Haxorus",
      "define": "SPECIES_HAXORUS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Rivalry",
        "Mold Breaker",
        "Unnerve"
      ]
    },
    "613": {
      "name": "Cubchoo",
      "define": "SPECIES_CUBCHOO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        "Slush Rush",
        "Rattled"
      ]
    },
    "614": {
      "name": "Beartic",
      "define": "SPECIES_BEARTIC",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        "Slush Rush",
        "Swift Swim"
      ]
    },
    "615": {
      "name": "Cryogonal",
      "define": "SPECIES_CRYOGONAL",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "616": {
      "name": "Shelmet",
      "define": "SPECIES_SHELMET",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hydration",
        "Shell Armor",
        "Overcoat"
      ]
    },
    "617": {
      "name": "Accelgor",
      "define": "SPECIES_ACCELGOR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hydration",
        "Sticky Hold",
        "Unburden"
      ]
    },
    "618": {
      "name": "Stunfisk",
      "define": "SPECIES_STUNFISK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        "Limber",
        "Sand Veil"
      ]
    },
    "619": {
      "name": "Mienfoo",
      "define": "SPECIES_MIENFOO",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Inner Focus",
        "Regenerator",
        "Reckless"
      ]
    },
    "620": {
      "name": "Mienshao",
      "define": "SPECIES_MIENSHAO",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Inner Focus",
        "Regenerator",
        "Reckless"
      ]
    },
    "621": {
      "name": "Druddigon",
      "define": "SPECIES_DRUDDIGON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rough Skin",
        "Sheer Force",
        "Mold Breaker"
      ]
    },
    "622": {
      "name": "Golett",
      "define": "SPECIES_GOLETT",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Iron Fist",
        "Klutz",
        "No Guard"
      ]
    },
    "623": {
      "name": "Golurk",
      "define": "SPECIES_GOLURK",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Iron Fist",
        "Klutz",
        "No Guard"
      ]
    },
    "624": {
      "name": "Pawniard",
      "define": "SPECIES_PAWNIARD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Defiant",
        "Inner Focus",
        "Pressure"
      ]
    },
    "625": {
      "name": "Bisharp",
      "define": "SPECIES_BISHARP",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Defiant",
        "Inner Focus",
        "Pressure"
      ]
    },
    "626": {
      "name": "Bouffalant",
      "define": "SPECIES_BOUFFALANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Reckless",
        "Sap Sipper",
        "Soundproof"
      ]
    },
    "627": {
      "name": "Rufflet",
      "define": "SPECIES_RUFFLET",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Keen Eye",
        "Sheer Force",
        "Hustle"
      ]
    },
    "628": {
      "name": "Braviary",
      "define": "SPECIES_BRAVIARY",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Keen Eye",
        "Sheer Force",
        "Defiant"
      ]
    },
    "629": {
      "name": "Vullaby",
      "define": "SPECIES_VULLABY",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Big Pecks",
        "Overcoat",
        "Weak Armor"
      ]
    },
    "630": {
      "name": "Mandibuzz",
      "define": "SPECIES_MANDIBUZZ",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Big Pecks",
        "Overcoat",
        "Weak Armor"
      ]
    },
    "631": {
      "name": "Heatmor",
      "define": "SPECIES_HEATMOR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        "Flash Fire",
        "White Smoke"
      ]
    },
    "632": {
      "name": "Durant",
      "define": "SPECIES_DURANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Hustle",
        "Truant"
      ]
    },
    "633": {
      "name": "Deino",
      "define": "SPECIES_DEINO",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Hustle",
        null,
        null
      ]
    },
    "634": {
      "name": "Zweilous",
      "define": "SPECIES_ZWEILOUS",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Hustle",
        null,
        null
      ]
    },
    "635": {
      "name": "Hydreigon",
      "define": "SPECIES_HYDREIGON",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "636": {
      "name": "Larvesta",
      "define": "SPECIES_LARVESTA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Flame Body",
        null,
        "Swarm"
      ]
    },
    "637": {
      "name": "Volcarona",
      "define": "SPECIES_VOLCARONA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Flame Body",
        null,
        "Swarm"
      ]
    },
    "638": {
      "name": "Cobalion",
      "define": "SPECIES_COBALION",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Justified",
        null,
        null
      ]
    },
    "639": {
      "name": "Terrakion",
      "define": "SPECIES_TERRAKION",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Justified",
        null,
        null
      ]
    },
    "640": {
      "name": "Virizion",
      "define": "SPECIES_VIRIZION",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Justified",
        null,
        null
      ]
    },
    "641": {
      "name": "Tornadus-Incarnate",
      "define": "SPECIES_TORNADUS_INCARNATE",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Prankster",
        null,
        "Defiant"
      ]
    },
    "642": {
      "name": "Thundurus-Incarnate",
      "define": "SPECIES_THUNDURUS_INCARNATE",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Prankster",
        null,
        "Defiant"
      ]
    },
    "643": {
      "name": "Reshiram",
      "define": "SPECIES_RESHIRAM",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Turboblaze",
        null,
        null
      ]
    },
    "644": {
      "name": "Zekrom",
      "define": "SPECIES_ZEKROM",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Teravolt",
        null,
        null
      ]
    },
    "645": {
      "name": "Landorus-Incarnate",
      "define": "SPECIES_LANDORUS_INCARNATE",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Sand Force",
        null,
        "Sheer Force"
      ]
    },
    "646": {
      "name": "Kyurem",
      "define": "SPECIES_KYUREM",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        null
      ]
    },
    "647": {
      "name": "Keldeo-Ordinary",
      "define": "SPECIES_KELDEO_ORDINARY",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Justified",
        null,
        null
      ]
    },
    "648": {
      "name": "Meloetta-Aria",
      "define": "SPECIES_MELOETTA_ARIA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Serene Grace",
        null,
        null
      ]
    },
    "649": {
      "name": "Genesect",
      "define": "SPECIES_GENESECT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Download",
        null,
        null
      ]
    },
    "650": {
      "name": "Chespin",
      "define": "SPECIES_CHESPIN",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Bulletproof"
      ]
    },
    "651": {
      "name": "Quilladin",
      "define": "SPECIES_QUILLADIN",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Bulletproof"
      ]
    },
    "652": {
      "name": "Chesnaught",
      "define": "SPECIES_CHESNAUGHT",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Bulletproof"
      ]
    },
    "653": {
      "name": "Fennekin",
      "define": "SPECIES_FENNEKIN",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Magician"
      ]
    },
    "654": {
      "name": "Braixen",
      "define": "SPECIES_BRAIXEN",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Magician"
      ]
    },
    "655": {
      "name": "Delphox",
      "define": "SPECIES_DELPHOX",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Magician"
      ]
    },
    "656": {
      "name": "Froakie",
      "define": "SPECIES_FROAKIE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Protean"
      ]
    },
    "657": {
      "name": "Frogadier",
      "define": "SPECIES_FROGADIER",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Protean"
      ]
    },
    "658": {
      "name": "Greninja",
      "define": "SPECIES_GRENINJA",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Protean"
      ]
    },
    "659": {
      "name": "Bunnelby",
      "define": "SPECIES_BUNNELBY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Cheek Pouch",
        "Huge Power"
      ]
    },
    "660": {
      "name": "Diggersby",
      "define": "SPECIES_DIGGERSBY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Cheek Pouch",
        "Huge Power"
      ]
    },
    "661": {
      "name": "Fletchling",
      "define": "SPECIES_FLETCHLING",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Big Pecks",
        null,
        "Gale Wings"
      ]
    },
    "662": {
      "name": "Fletchinder",
      "define": "SPECIES_FLETCHINDER",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Flame Body",
        null,
        "Gale Wings"
      ]
    },
    "663": {
      "name": "Talonflame",
      "define": "SPECIES_TALONFLAME",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Flame Body",
        null,
        "Gale Wings"
      ]
    },
    "664": {
      "name": "Scatterbug-Icy-Snow",
      "define": "SPECIES_SCATTERBUG_ICY_SNOW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "665": {
      "name": "Spewpa-Icy-Snow",
      "define": "SPECIES_SPEWPA_ICY_SNOW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "666": {
      "name": "Vivillon-Icy-Snow",
      "define": "SPECIES_VIVILLON_ICY_SNOW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "667": {
      "name": "Litleo",
      "define": "SPECIES_LITLEO",
      "genderRatio": 223,
      "growthRate": 3,
      "abilities": [
        "Rivalry",
        "Unnerve",
        "Moxie"
      ]
    },
    "668": {
      "name": "Pyroar",
      "define": "SPECIES_PYROAR",
      "genderRatio": 223,
      "growthRate": 3,
      "abilities": [
        "Rivalry",
        "Unnerve",
        "Moxie"
      ]
    },
    "669": {
      "name": "Flabebe-Red",
      "define": "SPECIES_FLABEBE_RED",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "670": {
      "name": "Floette-Red",
      "define": "SPECIES_FLOETTE_RED",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "671": {
      "name": "Florges-Red",
      "define": "SPECIES_FLORGES_RED",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "672": {
      "name": "Skiddo",
      "define": "SPECIES_SKIDDO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sap Sipper",
        null,
        "Grass Pelt"
      ]
    },
    "673": {
      "name": "Gogoat",
      "define": "SPECIES_GOGOAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sap Sipper",
        null,
        "Grass Pelt"
      ]
    },
    "674": {
      "name": "Pancham",
      "define": "SPECIES_PANCHAM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Iron Fist",
        "Mold Breaker",
        "Scrappy"
      ]
    },
    "675": {
      "name": "Pangoro",
      "define": "SPECIES_PANGORO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Iron Fist",
        "Mold Breaker",
        "Scrappy"
      ]
    },
    "676": {
      "name": "Furfrou-Natural",
      "define": "SPECIES_FURFROU_NATURAL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "677": {
      "name": "Espurr",
      "define": "SPECIES_ESPURR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Infiltrator",
        "Own Tempo"
      ]
    },
    "678": {
      "name": "Meowstic-M",
      "define": "SPECIES_MEOWSTIC_M",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Infiltrator",
        "Prankster"
      ]
    },
    "679": {
      "name": "Honedge",
      "define": "SPECIES_HONEDGE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "No Guard",
        null,
        null
      ]
    },
    "680": {
      "name": "Doublade",
      "define": "SPECIES_DOUBLADE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "No Guard",
        null,
        null
      ]
    },
    "681": {
      "name": "Aegislash-Shield",
      "define": "SPECIES_AEGISLASH_SHIELD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stance Change",
        null,
        null
      ]
    },
    "682": {
      "name": "Spritzee",
      "define": "SPECIES_SPRITZEE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Healer",
        null,
        "Aroma Veil"
      ]
    },
    "683": {
      "name": "Aromatisse",
      "define": "SPECIES_AROMATISSE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Healer",
        null,
        "Aroma Veil"
      ]
    },
    "684": {
      "name": "Swirlix",
      "define": "SPECIES_SWIRLIX",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Unburden"
      ]
    },
    "685": {
      "name": "Slurpuff",
      "define": "SPECIES_SLURPUFF",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Unburden"
      ]
    },
    "686": {
      "name": "Inkay",
      "define": "SPECIES_INKAY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Contrary",
        "Suction Cups",
        "Infiltrator"
      ]
    },
    "687": {
      "name": "Malamar",
      "define": "SPECIES_MALAMAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Contrary",
        "Suction Cups",
        "Infiltrator"
      ]
    },
    "688": {
      "name": "Binacle",
      "define": "SPECIES_BINACLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Tough Claws",
        "Sniper",
        "Pickpocket"
      ]
    },
    "689": {
      "name": "Barbaracle",
      "define": "SPECIES_BARBARACLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Tough Claws",
        "Sniper",
        "Pickpocket"
      ]
    },
    "690": {
      "name": "Skrelp",
      "define": "SPECIES_SKRELP",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Poison Touch",
        "Adaptability"
      ]
    },
    "691": {
      "name": "Dragalge",
      "define": "SPECIES_DRAGALGE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Poison Touch",
        "Adaptability"
      ]
    },
    "692": {
      "name": "Clauncher",
      "define": "SPECIES_CLAUNCHER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Mega Launcher",
        null,
        null
      ]
    },
    "693": {
      "name": "Clawitzer",
      "define": "SPECIES_CLAWITZER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Mega Launcher",
        null,
        null
      ]
    },
    "694": {
      "name": "Helioptile",
      "define": "SPECIES_HELIOPTILE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Dry Skin",
        "Sand Veil",
        "Solar Power"
      ]
    },
    "695": {
      "name": "Heliolisk",
      "define": "SPECIES_HELIOLISK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Dry Skin",
        "Sand Veil",
        "Solar Power"
      ]
    },
    "696": {
      "name": "Tyrunt",
      "define": "SPECIES_TYRUNT",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Strong Jaw",
        null,
        "Sturdy"
      ]
    },
    "697": {
      "name": "Tyrantrum",
      "define": "SPECIES_TYRANTRUM",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Strong Jaw",
        null,
        "Rock Head"
      ]
    },
    "698": {
      "name": "Amaura",
      "define": "SPECIES_AMAURA",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Refrigerate",
        null,
        "Snow Warning"
      ]
    },
    "699": {
      "name": "Aurorus",
      "define": "SPECIES_AURORUS",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Refrigerate",
        null,
        "Snow Warning"
      ]
    },
    "700": {
      "name": "Sylveon",
      "define": "SPECIES_SYLVEON",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Cute Charm",
        "Cute Charm",
        "Pixilate"
      ]
    },
    "701": {
      "name": "Hawlucha",
      "define": "SPECIES_HAWLUCHA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Limber",
        "Unburden",
        "Mold Breaker"
      ]
    },
    "702": {
      "name": "Dedenne",
      "define": "SPECIES_DEDENNE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cheek Pouch",
        "Pickup",
        "Plus"
      ]
    },
    "703": {
      "name": "Carbink",
      "define": "SPECIES_CARBINK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        "Sturdy"
      ]
    },
    "704": {
      "name": "Goomy",
      "define": "SPECIES_GOOMY",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sap Sipper",
        "Hydration",
        "Gooey"
      ]
    },
    "705": {
      "name": "Sliggoo",
      "define": "SPECIES_SLIGGOO",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sap Sipper",
        "Hydration",
        "Gooey"
      ]
    },
    "706": {
      "name": "Goodra",
      "define": "SPECIES_GOODRA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sap Sipper",
        "Hydration",
        "Gooey"
      ]
    },
    "707": {
      "name": "Klefki",
      "define": "SPECIES_KLEFKI",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Prankster",
        null,
        "Magician"
      ]
    },
    "708": {
      "name": "Phantump",
      "define": "SPECIES_PHANTUMP",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Natural Cure",
        "Frisk",
        "Harvest"
      ]
    },
    "709": {
      "name": "Trevenant",
      "define": "SPECIES_TREVENANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Natural Cure",
        "Frisk",
        "Harvest"
      ]
    },
    "710": {
      "name": "Pumpkaboo-Average",
      "define": "SPECIES_PUMPKABOO_AVERAGE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "711": {
      "name": "Gourgeist-Average",
      "define": "SPECIES_GOURGEIST_AVERAGE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "712": {
      "name": "Bergmite",
      "define": "SPECIES_BERGMITE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        "Ice Body",
        "Sturdy"
      ]
    },
    "713": {
      "name": "Avalugg",
      "define": "SPECIES_AVALUGG",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        "Ice Body",
        "Sturdy"
      ]
    },
    "714": {
      "name": "Noibat",
      "define": "SPECIES_NOIBAT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Frisk",
        "Infiltrator",
        "Telepathy"
      ]
    },
    "715": {
      "name": "Noivern",
      "define": "SPECIES_NOIVERN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Frisk",
        "Infiltrator",
        "Telepathy"
      ]
    },
    "716": {
      "name": "Xerneas-Neutral",
      "define": "SPECIES_XERNEAS_NEUTRAL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Fairy Aura",
        null,
        null
      ]
    },
    "717": {
      "name": "Yveltal",
      "define": "SPECIES_YVELTAL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Dark Aura",
        null,
        null
      ]
    },
    "718": {
      "name": "Zygarde-50",
      "define": "SPECIES_ZYGARDE_50",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Aura Break",
        null,
        null
      ]
    },
    "719": {
      "name": "Diancie",
      "define": "SPECIES_DIANCIE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        null,
        null
      ]
    },
    "720": {
      "name": "Hoopa-Confined",
      "define": "SPECIES_HOOPA_CONFINED",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Magician",
        null,
        null
      ]
    },
    "721": {
      "name": "Volcanion",
      "define": "SPECIES_VOLCANION",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Water Absorb",
        null,
        null
      ]
    },
    "722": {
      "name": "Rowlet",
      "define": "SPECIES_ROWLET",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Long Reach"
      ]
    },
    "723": {
      "name": "Dartrix",
      "define": "SPECIES_DARTRIX",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Long Reach"
      ]
    },
    "724": {
      "name": "Decidueye",
      "define": "SPECIES_DECIDUEYE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Long Reach"
      ]
    },
    "725": {
      "name": "Litten",
      "define": "SPECIES_LITTEN",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Intimidate"
      ]
    },
    "726": {
      "name": "Torracat",
      "define": "SPECIES_TORRACAT",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Intimidate"
      ]
    },
    "727": {
      "name": "Incineroar",
      "define": "SPECIES_INCINEROAR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Intimidate"
      ]
    },
    "728": {
      "name": "Popplio",
      "define": "SPECIES_POPPLIO",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Liquid Voice"
      ]
    },
    "729": {
      "name": "Brionne",
      "define": "SPECIES_BRIONNE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Liquid Voice"
      ]
    },
    "730": {
      "name": "Primarina",
      "define": "SPECIES_PRIMARINA",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Liquid Voice"
      ]
    },
    "731": {
      "name": "Pikipek",
      "define": "SPECIES_PIKIPEK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Skill Link",
        "Pickup"
      ]
    },
    "732": {
      "name": "Trumbeak",
      "define": "SPECIES_TRUMBEAK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Skill Link",
        "Pickup"
      ]
    },
    "733": {
      "name": "Toucannon",
      "define": "SPECIES_TOUCANNON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Skill Link",
        "Sheer Force"
      ]
    },
    "734": {
      "name": "Yungoos",
      "define": "SPECIES_YUNGOOS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stakeout",
        "Strong Jaw",
        "Adaptability"
      ]
    },
    "735": {
      "name": "Gumshoos",
      "define": "SPECIES_GUMSHOOS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stakeout",
        "Strong Jaw",
        "Adaptability"
      ]
    },
    "736": {
      "name": "Grubbin",
      "define": "SPECIES_GRUBBIN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        null
      ]
    },
    "737": {
      "name": "Charjabug",
      "define": "SPECIES_CHARJABUG",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Battery",
        null,
        null
      ]
    },
    "738": {
      "name": "Vikavolt",
      "define": "SPECIES_VIKAVOLT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "739": {
      "name": "Crabrawler",
      "define": "SPECIES_CRABRAWLER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hyper Cutter",
        "Iron Fist",
        "Anger Point"
      ]
    },
    "740": {
      "name": "Crabominable",
      "define": "SPECIES_CRABOMINABLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hyper Cutter",
        "Iron Fist",
        "Anger Point"
      ]
    },
    "741": {
      "name": "Oricorio-Baile",
      "define": "SPECIES_ORICORIO_BAILE",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Dancer",
        null,
        null
      ]
    },
    "742": {
      "name": "Cutiefly",
      "define": "SPECIES_CUTIEFLY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Honey Gather",
        "Shield Dust",
        "Sweet Veil"
      ]
    },
    "743": {
      "name": "Ribombee",
      "define": "SPECIES_RIBOMBEE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Honey Gather",
        "Shield Dust",
        "Sweet Veil"
      ]
    },
    "744": {
      "name": "Rockruff",
      "define": "SPECIES_ROCKRUFF",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Vital Spirit",
        "Steadfast"
      ]
    },
    "745": {
      "name": "Lycanroc-Midday",
      "define": "SPECIES_LYCANROC_MIDDAY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Sand Rush",
        "Steadfast"
      ]
    },
    "746": {
      "name": "Wishiwashi-Solo",
      "define": "SPECIES_WISHIWASHI_SOLO",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Schooling",
        null,
        null
      ]
    },
    "747": {
      "name": "Mareanie",
      "define": "SPECIES_MAREANIE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Merciless",
        "Limber",
        "Regenerator"
      ]
    },
    "748": {
      "name": "Toxapex",
      "define": "SPECIES_TOXAPEX",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Merciless",
        "Limber",
        "Regenerator"
      ]
    },
    "749": {
      "name": "Mudbray",
      "define": "SPECIES_MUDBRAY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        "Stamina",
        "Inner Focus"
      ]
    },
    "750": {
      "name": "Mudsdale",
      "define": "SPECIES_MUDSDALE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        "Stamina",
        "Inner Focus"
      ]
    },
    "751": {
      "name": "Dewpider",
      "define": "SPECIES_DEWPIDER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Bubble",
        null,
        "Water Absorb"
      ]
    },
    "752": {
      "name": "Araquanid",
      "define": "SPECIES_ARAQUANID",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Bubble",
        null,
        "Water Absorb"
      ]
    },
    "753": {
      "name": "Fomantis",
      "define": "SPECIES_FOMANTIS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Leaf Guard",
        null,
        "Contrary"
      ]
    },
    "754": {
      "name": "Lurantis",
      "define": "SPECIES_LURANTIS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Leaf Guard",
        null,
        "Contrary"
      ]
    },
    "755": {
      "name": "Morelull",
      "define": "SPECIES_MORELULL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Illuminate",
        "Effect Spore",
        "Rain Dish"
      ]
    },
    "756": {
      "name": "Shiinotic",
      "define": "SPECIES_SHIINOTIC",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Illuminate",
        "Effect Spore",
        "Rain Dish"
      ]
    },
    "757": {
      "name": "Salandit",
      "define": "SPECIES_SALANDIT",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Corrosion",
        null,
        "Oblivious"
      ]
    },
    "758": {
      "name": "Salazzle",
      "define": "SPECIES_SALAZZLE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Corrosion",
        null,
        "Oblivious"
      ]
    },
    "759": {
      "name": "Stufful",
      "define": "SPECIES_STUFFUL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fluffy",
        "Klutz",
        "Cute Charm"
      ]
    },
    "760": {
      "name": "Bewear",
      "define": "SPECIES_BEWEAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fluffy",
        "Klutz",
        "Unnerve"
      ]
    },
    "761": {
      "name": "Bounsweet",
      "define": "SPECIES_BOUNSWEET",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Leaf Guard",
        "Oblivious",
        "Sweet Veil"
      ]
    },
    "762": {
      "name": "Steenee",
      "define": "SPECIES_STEENEE",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Leaf Guard",
        "Oblivious",
        "Sweet Veil"
      ]
    },
    "763": {
      "name": "Tsareena",
      "define": "SPECIES_TSAREENA",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Leaf Guard",
        "Queenly Majesty",
        "Sweet Veil"
      ]
    },
    "764": {
      "name": "Comfey",
      "define": "SPECIES_COMFEY",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Flower Veil",
        "Triage",
        "Natural Cure"
      ]
    },
    "765": {
      "name": "Oranguru",
      "define": "SPECIES_ORANGURU",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Inner Focus",
        "Telepathy",
        "Symbiosis"
      ]
    },
    "766": {
      "name": "Passimian",
      "define": "SPECIES_PASSIMIAN",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Receiver",
        null,
        "Defiant"
      ]
    },
    "767": {
      "name": "Wimpod",
      "define": "SPECIES_WIMPOD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Wimp Out",
        null,
        null
      ]
    },
    "768": {
      "name": "Golisopod",
      "define": "SPECIES_GOLISOPOD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Emergency Exit",
        null,
        null
      ]
    },
    "769": {
      "name": "Sandygast",
      "define": "SPECIES_SANDYGAST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Compaction",
        null,
        "Sand Veil"
      ]
    },
    "770": {
      "name": "Palossand",
      "define": "SPECIES_PALOSSAND",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Compaction",
        null,
        "Sand Veil"
      ]
    },
    "771": {
      "name": "Pyukumuku",
      "define": "SPECIES_PYUKUMUKU",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Innards Out",
        null,
        "Unaware"
      ]
    },
    "772": {
      "name": "Type: Null",
      "define": "SPECIES_TYPE_NULL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Battle Armor",
        null,
        null
      ]
    },
    "773": {
      "name": "Silvally-Normal",
      "define": "SPECIES_SILVALLY_NORMAL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "774": {
      "name": "Minior-Meteor-Red",
      "define": "SPECIES_MINIOR_METEOR_RED",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "775": {
      "name": "Komala",
      "define": "SPECIES_KOMALA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Comatose",
        null,
        null
      ]
    },
    "776": {
      "name": "Turtonator",
      "define": "SPECIES_TURTONATOR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shell Armor",
        null,
        null
      ]
    },
    "777": {
      "name": "Togedemaru",
      "define": "SPECIES_TOGEDEMARU",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Iron Barbs",
        "Lightning Rod",
        "Sturdy"
      ]
    },
    "778": {
      "name": "Mimikyu-Disguised",
      "define": "SPECIES_MIMIKYU_DISGUISED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Disguise",
        null,
        null
      ]
    },
    "779": {
      "name": "Bruxish",
      "define": "SPECIES_BRUXISH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Dazzling",
        "Strong Jaw",
        "Wonder Skin"
      ]
    },
    "780": {
      "name": "Drampa",
      "define": "SPECIES_DRAMPA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Berserk",
        "Sap Sipper",
        "Cloud Nine"
      ]
    },
    "781": {
      "name": "Dhelmise",
      "define": "SPECIES_DHELMISE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Steelworker",
        null,
        null
      ]
    },
    "782": {
      "name": "Jangmo-o",
      "define": "SPECIES_JANGMO_O",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Bulletproof",
        "Soundproof",
        "Overcoat"
      ]
    },
    "783": {
      "name": "Hakamo-o",
      "define": "SPECIES_HAKAMO_O",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Bulletproof",
        "Soundproof",
        "Overcoat"
      ]
    },
    "784": {
      "name": "Kommo-o",
      "define": "SPECIES_KOMMO_O",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Bulletproof",
        "Soundproof",
        "Overcoat"
      ]
    },
    "785": {
      "name": "Tapu Koko",
      "define": "SPECIES_TAPU_KOKO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Electric Surge",
        null,
        "Telepathy"
      ]
    },
    "786": {
      "name": "Tapu Lele",
      "define": "SPECIES_TAPU_LELE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Psychic Surge",
        null,
        "Telepathy"
      ]
    },
    "787": {
      "name": "Tapu Bulu",
      "define": "SPECIES_TAPU_BULU",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Grassy Surge",
        null,
        "Telepathy"
      ]
    },
    "788": {
      "name": "Tapu Fini",
      "define": "SPECIES_TAPU_FINI",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Misty Surge",
        null,
        "Telepathy"
      ]
    },
    "789": {
      "name": "Cosmog",
      "define": "SPECIES_COSMOG",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Unaware",
        null,
        null
      ]
    },
    "790": {
      "name": "Cosmoem",
      "define": "SPECIES_COSMOEM",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Sturdy",
        null,
        null
      ]
    },
    "791": {
      "name": "Solgaleo",
      "define": "SPECIES_SOLGALEO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Full Metal Body",
        null,
        null
      ]
    },
    "792": {
      "name": "Lunala",
      "define": "SPECIES_LUNALA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Shadow Shield",
        null,
        null
      ]
    },
    "793": {
      "name": "Nihilego",
      "define": "SPECIES_NIHILEGO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "794": {
      "name": "Buzzwole",
      "define": "SPECIES_BUZZWOLE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "795": {
      "name": "Pheromosa",
      "define": "SPECIES_PHEROMOSA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "796": {
      "name": "Xurkitree",
      "define": "SPECIES_XURKITREE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "797": {
      "name": "Celesteela",
      "define": "SPECIES_CELESTEELA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "798": {
      "name": "Kartana",
      "define": "SPECIES_KARTANA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "799": {
      "name": "Guzzlord",
      "define": "SPECIES_GUZZLORD",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "800": {
      "name": "Necrozma",
      "define": "SPECIES_NECROZMA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Prism Armor",
        null,
        null
      ]
    },
    "801": {
      "name": "Magearna",
      "define": "SPECIES_MAGEARNA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Soul-Heart",
        null,
        null
      ]
    },
    "802": {
      "name": "Marshadow",
      "define": "SPECIES_MARSHADOW",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Technician",
        null,
        null
      ]
    },
    "803": {
      "name": "Poipole",
      "define": "SPECIES_POIPOLE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "804": {
      "name": "Naganadel",
      "define": "SPECIES_NAGANADEL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "805": {
      "name": "Stakataka",
      "define": "SPECIES_STAKATAKA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "806": {
      "name": "Blacephalon",
      "define": "SPECIES_BLACEPHALON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beast Boost",
        null,
        null
      ]
    },
    "807": {
      "name": "Zeraora",
      "define": "SPECIES_ZERAORA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Volt Absorb",
        null,
        null
      ]
    },
    "808": {
      "name": "Meltan",
      "define": "SPECIES_MELTAN",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Magnet Pull",
        null,
        null
      ]
    },
    "809": {
      "name": "Melmetal",
      "define": "SPECIES_MELMETAL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Iron Fist",
        null,
        null
      ]
    },
    "810": {
      "name": "Grookey",
      "define": "SPECIES_GROOKEY",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Grassy Surge"
      ]
    },
    "811": {
      "name": "Thwackey",
      "define": "SPECIES_THWACKEY",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Grassy Surge"
      ]
    },
    "812": {
      "name": "Rillaboom",
      "define": "SPECIES_RILLABOOM",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Grassy Surge"
      ]
    },
    "813": {
      "name": "Scorbunny",
      "define": "SPECIES_SCORBUNNY",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Libero"
      ]
    },
    "814": {
      "name": "Raboot",
      "define": "SPECIES_RABOOT",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Libero"
      ]
    },
    "815": {
      "name": "Cinderace",
      "define": "SPECIES_CINDERACE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Libero"
      ]
    },
    "816": {
      "name": "Sobble",
      "define": "SPECIES_SOBBLE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Sniper"
      ]
    },
    "817": {
      "name": "Drizzile",
      "define": "SPECIES_DRIZZILE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Sniper"
      ]
    },
    "818": {
      "name": "Inteleon",
      "define": "SPECIES_INTELEON",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Sniper"
      ]
    },
    "819": {
      "name": "Skwovet",
      "define": "SPECIES_SKWOVET",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cheek Pouch",
        null,
        "Gluttony"
      ]
    },
    "820": {
      "name": "Greedent",
      "define": "SPECIES_GREEDENT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cheek Pouch",
        null,
        "Gluttony"
      ]
    },
    "821": {
      "name": "Rookidee",
      "define": "SPECIES_ROOKIDEE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        "Unnerve",
        "Big Pecks"
      ]
    },
    "822": {
      "name": "Corvisquire",
      "define": "SPECIES_CORVISQUIRE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Keen Eye",
        "Unnerve",
        "Big Pecks"
      ]
    },
    "823": {
      "name": "Corviknight",
      "define": "SPECIES_CORVIKNIGHT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Pressure",
        "Unnerve",
        "Mirror Armor"
      ]
    },
    "824": {
      "name": "Blipbug",
      "define": "SPECIES_BLIPBUG",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Compound Eyes",
        "Telepathy"
      ]
    },
    "825": {
      "name": "Dottler",
      "define": "SPECIES_DOTTLER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Compound Eyes",
        "Telepathy"
      ]
    },
    "826": {
      "name": "Orbeetle",
      "define": "SPECIES_ORBEETLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Frisk",
        "Telepathy"
      ]
    },
    "827": {
      "name": "Nickit",
      "define": "SPECIES_NICKIT",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Run Away",
        "Unburden",
        "Stakeout"
      ]
    },
    "828": {
      "name": "Thievul",
      "define": "SPECIES_THIEVUL",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Run Away",
        "Unburden",
        "Stakeout"
      ]
    },
    "829": {
      "name": "Gossifleur",
      "define": "SPECIES_GOSSIFLEUR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cotton Down",
        "Regenerator",
        "Effect Spore"
      ]
    },
    "830": {
      "name": "Eldegoss",
      "define": "SPECIES_ELDEGOSS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cotton Down",
        "Regenerator",
        "Effect Spore"
      ]
    },
    "831": {
      "name": "Wooloo",
      "define": "SPECIES_WOOLOO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fluffy",
        "Run Away",
        "Bulletproof"
      ]
    },
    "832": {
      "name": "Dubwool",
      "define": "SPECIES_DUBWOOL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fluffy",
        "Steadfast",
        "Bulletproof"
      ]
    },
    "833": {
      "name": "Chewtle",
      "define": "SPECIES_CHEWTLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Strong Jaw",
        "Shell Armor",
        "Swift Swim"
      ]
    },
    "834": {
      "name": "Drednaw",
      "define": "SPECIES_DREDNAW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Strong Jaw",
        "Shell Armor",
        "Swift Swim"
      ]
    },
    "835": {
      "name": "Yamper",
      "define": "SPECIES_YAMPER",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Ball Fetch",
        null,
        "Rattled"
      ]
    },
    "836": {
      "name": "Boltund",
      "define": "SPECIES_BOLTUND",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Strong Jaw",
        null,
        "Competitive"
      ]
    },
    "837": {
      "name": "Rolycoly",
      "define": "SPECIES_ROLYCOLY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Steam Engine",
        "Heatproof",
        "Flash Fire"
      ]
    },
    "838": {
      "name": "Carkol",
      "define": "SPECIES_CARKOL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Steam Engine",
        "Flame Body",
        "Flash Fire"
      ]
    },
    "839": {
      "name": "Coalossal",
      "define": "SPECIES_COALOSSAL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Steam Engine",
        "Flame Body",
        "Flash Fire"
      ]
    },
    "840": {
      "name": "Applin",
      "define": "SPECIES_APPLIN",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Ripen",
        "Gluttony",
        "Bulletproof"
      ]
    },
    "841": {
      "name": "Flapple",
      "define": "SPECIES_FLAPPLE",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Ripen",
        "Gluttony",
        "Hustle"
      ]
    },
    "842": {
      "name": "Appletun",
      "define": "SPECIES_APPLETUN",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Ripen",
        "Gluttony",
        "Thick Fat"
      ]
    },
    "843": {
      "name": "Silicobra",
      "define": "SPECIES_SILICOBRA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Spit",
        "Shed Skin",
        "Sand Veil"
      ]
    },
    "844": {
      "name": "Sandaconda",
      "define": "SPECIES_SANDACONDA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Spit",
        "Shed Skin",
        "Sand Veil"
      ]
    },
    "845": {
      "name": "Cramorant",
      "define": "SPECIES_CRAMORANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gulp Missile",
        null,
        null
      ]
    },
    "846": {
      "name": "Arrokuda",
      "define": "SPECIES_ARROKUDA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Swift Swim",
        null,
        "Propeller Tail"
      ]
    },
    "847": {
      "name": "Barraskewda",
      "define": "SPECIES_BARRASKEWDA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Swift Swim",
        null,
        "Propeller Tail"
      ]
    },
    "848": {
      "name": "Toxel",
      "define": "SPECIES_TOXEL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Rattled",
        "Static",
        "Klutz"
      ]
    },
    "849": {
      "name": "Toxtricity-Amped",
      "define": "SPECIES_TOXTRICITY_AMPED",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Punk Rock",
        "Plus",
        "Technician"
      ]
    },
    "850": {
      "name": "Sizzlipede",
      "define": "SPECIES_SIZZLIPEDE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Flash Fire",
        "White Smoke",
        "Flame Body"
      ]
    },
    "851": {
      "name": "Centiskorch",
      "define": "SPECIES_CENTISKORCH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Flash Fire",
        "White Smoke",
        "Flame Body"
      ]
    },
    "852": {
      "name": "Clobbopus",
      "define": "SPECIES_CLOBBOPUS",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Limber",
        null,
        "Technician"
      ]
    },
    "853": {
      "name": "Grapploct",
      "define": "SPECIES_GRAPPLOCT",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Limber",
        null,
        "Technician"
      ]
    },
    "854": {
      "name": "Sinistea-Phony",
      "define": "SPECIES_SINISTEA_PHONY",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Weak Armor",
        null,
        "Cursed Body"
      ]
    },
    "855": {
      "name": "Polteageist-Phony",
      "define": "SPECIES_POLTEAGEIST_PHONY",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Weak Armor",
        null,
        "Cursed Body"
      ]
    },
    "856": {
      "name": "Hatenna",
      "define": "SPECIES_HATENNA",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Healer",
        "Anticipation",
        "Magic Bounce"
      ]
    },
    "857": {
      "name": "Hattrem",
      "define": "SPECIES_HATTREM",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Healer",
        "Anticipation",
        "Magic Bounce"
      ]
    },
    "858": {
      "name": "Hatterene",
      "define": "SPECIES_HATTERENE",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Healer",
        "Anticipation",
        "Magic Bounce"
      ]
    },
    "859": {
      "name": "Impidimp",
      "define": "SPECIES_IMPIDIMP",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Prankster",
        "Frisk",
        "Pickpocket"
      ]
    },
    "860": {
      "name": "Morgrem",
      "define": "SPECIES_MORGREM",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Prankster",
        "Frisk",
        "Pickpocket"
      ]
    },
    "861": {
      "name": "Grimmsnarl",
      "define": "SPECIES_GRIMMSNARL",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Prankster",
        "Frisk",
        "Pickpocket"
      ]
    },
    "862": {
      "name": "Obstagoon",
      "define": "SPECIES_OBSTAGOON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Reckless",
        "Guts",
        "Defiant"
      ]
    },
    "863": {
      "name": "Perrserker",
      "define": "SPECIES_PERRSERKER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Battle Armor",
        "Tough Claws",
        "Steely Spirit"
      ]
    },
    "864": {
      "name": "Cursola",
      "define": "SPECIES_CURSOLA",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Weak Armor",
        null,
        "Perish Body"
      ]
    },
    "865": {
      "name": "Sirfetchd",
      "define": "SPECIES_SIRFETCHD",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Steadfast",
        null,
        "Scrappy"
      ]
    },
    "866": {
      "name": "Mr-Rime",
      "define": "SPECIES_MR_RIME",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Tangled Feet",
        "Screen Cleaner",
        "Ice Body"
      ]
    },
    "867": {
      "name": "Runerigus",
      "define": "SPECIES_RUNERIGUS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Wandering Spirit",
        null,
        null
      ]
    },
    "868": {
      "name": "Milcery",
      "define": "SPECIES_MILCERY",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "869": {
      "name": "Alcremie-Strawberry-Vanilla-Cream",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "870": {
      "name": "Falinks",
      "define": "SPECIES_FALINKS",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Battle Armor",
        null,
        "Defiant"
      ]
    },
    "871": {
      "name": "Pincurchin",
      "define": "SPECIES_PINCURCHIN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Lightning Rod",
        null,
        "Electric Surge"
      ]
    },
    "872": {
      "name": "Snom",
      "define": "SPECIES_SNOM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        null,
        "Ice Scales"
      ]
    },
    "873": {
      "name": "Frosmoth",
      "define": "SPECIES_FROSMOTH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        null,
        "Ice Scales"
      ]
    },
    "874": {
      "name": "Stonjourner",
      "define": "SPECIES_STONJOURNER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Power Spot",
        null,
        null
      ]
    },
    "875": {
      "name": "Eiscue-Ice",
      "define": "SPECIES_EISCUE_ICE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Ice Face",
        null,
        null
      ]
    },
    "876": {
      "name": "Indeedee-M",
      "define": "SPECIES_INDEEDEE_M",
      "genderRatio": 0,
      "growthRate": 4,
      "abilities": [
        "Inner Focus",
        "Synchronize",
        "Psychic Surge"
      ]
    },
    "877": {
      "name": "Morpeko-Full-Belly",
      "define": "SPECIES_MORPEKO_FULL_BELLY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hunger Switch",
        null,
        null
      ]
    },
    "878": {
      "name": "Cufant",
      "define": "SPECIES_CUFANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sheer Force",
        null,
        "Heavy Metal"
      ]
    },
    "879": {
      "name": "Copperajah",
      "define": "SPECIES_COPPERAJAH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sheer Force",
        null,
        "Heavy Metal"
      ]
    },
    "880": {
      "name": "Dracozolt",
      "define": "SPECIES_DRACOZOLT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Volt Absorb",
        "Hustle",
        "Sand Rush"
      ]
    },
    "881": {
      "name": "Arctozolt",
      "define": "SPECIES_ARCTOZOLT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Volt Absorb",
        "Static",
        "Slush Rush"
      ]
    },
    "882": {
      "name": "Dracovish",
      "define": "SPECIES_DRACOVISH",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Water Absorb",
        "Strong Jaw",
        "Sand Rush"
      ]
    },
    "883": {
      "name": "Arctovish",
      "define": "SPECIES_ARCTOVISH",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Water Absorb",
        "Ice Body",
        "Slush Rush"
      ]
    },
    "884": {
      "name": "Duraludon",
      "define": "SPECIES_DURALUDON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Light Metal",
        "Heavy Metal",
        "Stalwart"
      ]
    },
    "885": {
      "name": "Dreepy",
      "define": "SPECIES_DREEPY",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        "Infiltrator",
        "Cursed Body"
      ]
    },
    "886": {
      "name": "Drakloak",
      "define": "SPECIES_DRAKLOAK",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        "Infiltrator",
        "Cursed Body"
      ]
    },
    "887": {
      "name": "Dragapult",
      "define": "SPECIES_DRAGAPULT",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Clear Body",
        "Infiltrator",
        "Cursed Body"
      ]
    },
    "888": {
      "name": "Zacian-Hero",
      "define": "SPECIES_ZACIAN_HERO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Intrepid Sword",
        null,
        null
      ]
    },
    "889": {
      "name": "Zamazenta-Hero",
      "define": "SPECIES_ZAMAZENTA_HERO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Dauntless Shield",
        null,
        null
      ]
    },
    "890": {
      "name": "Eternatus",
      "define": "SPECIES_ETERNATUS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        null
      ]
    },
    "891": {
      "name": "Kubfu",
      "define": "SPECIES_KUBFU",
      "genderRatio": 31,
      "growthRate": 5,
      "abilities": [
        "Inner Focus",
        null,
        null
      ]
    },
    "892": {
      "name": "Urshifu-Single-Strike",
      "define": "SPECIES_URSHIFU_SINGLE_STRIKE",
      "genderRatio": 31,
      "growthRate": 5,
      "abilities": [
        "Unseen Fist",
        null,
        null
      ]
    },
    "893": {
      "name": "Zarude",
      "define": "SPECIES_ZARUDE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Leaf Guard",
        null,
        null
      ]
    },
    "894": {
      "name": "Regieleki",
      "define": "SPECIES_REGIELEKI",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Transistor",
        null,
        null
      ]
    },
    "895": {
      "name": "Regidrago",
      "define": "SPECIES_REGIDRAGO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Dragon's Maw",
        null,
        null
      ]
    },
    "896": {
      "name": "Glastrier",
      "define": "SPECIES_GLASTRIER",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Chilling Neigh",
        null,
        null
      ]
    },
    "897": {
      "name": "Spectrier",
      "define": "SPECIES_SPECTRIER",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Grim Neigh",
        null,
        null
      ]
    },
    "898": {
      "name": "Calyrex",
      "define": "SPECIES_CALYREX",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Unnerve",
        null,
        null
      ]
    },
    "899": {
      "name": "Wyrdeer",
      "define": "SPECIES_WYRDEER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Frisk",
        "Sap Sipper"
      ]
    },
    "900": {
      "name": "Kleavor",
      "define": "SPECIES_KLEAVOR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        "Sheer Force",
        "Sharpness"
      ]
    },
    "901": {
      "name": "Ursaluna",
      "define": "SPECIES_URSALUNA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Guts",
        "Bulletproof",
        "Unnerve"
      ]
    },
    "902": {
      "name": "Basculegion-M",
      "define": "SPECIES_BASCULEGION_M",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Adaptability",
        "Mold Breaker"
      ]
    },
    "903": {
      "name": "Sneasler",
      "define": "SPECIES_SNEASLER",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Pressure",
        "Unburden",
        "Poison Touch"
      ]
    },
    "904": {
      "name": "Overqwil",
      "define": "SPECIES_OVERQWIL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Swift Swim",
        "Intimidate"
      ]
    },
    "905": {
      "name": "Enamorus-Incarnate",
      "define": "SPECIES_ENAMORUS_INCARNATE",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Cute Charm",
        null,
        "Contrary"
      ]
    },
    "956": {
      "name": "Rattata-Alola",
      "define": "SPECIES_RATTATA_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        "Hustle",
        "Thick Fat"
      ]
    },
    "957": {
      "name": "Raticate-Alola",
      "define": "SPECIES_RATICATE_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        "Hustle",
        "Thick Fat"
      ]
    },
    "958": {
      "name": "Raichu-Alola",
      "define": "SPECIES_RAICHU_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Surge Surfer",
        null,
        null
      ]
    },
    "959": {
      "name": "Sandshrew-Alola",
      "define": "SPECIES_SANDSHREW_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        null,
        "Slush Rush"
      ]
    },
    "960": {
      "name": "Sandslash-Alola",
      "define": "SPECIES_SANDSLASH_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        null,
        "Slush Rush"
      ]
    },
    "961": {
      "name": "Vulpix-Alola",
      "define": "SPECIES_VULPIX_ALOLA",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        null,
        "Snow Warning"
      ]
    },
    "962": {
      "name": "Ninetales-Alola",
      "define": "SPECIES_NINETALES_ALOLA",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Snow Cloak",
        null,
        "Snow Warning"
      ]
    },
    "963": {
      "name": "Diglett-Alola",
      "define": "SPECIES_DIGLETT_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Veil",
        "Tangling Hair",
        "Sand Force"
      ]
    },
    "964": {
      "name": "Dugtrio-Alola",
      "define": "SPECIES_DUGTRIO_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sand Veil",
        "Tangling Hair",
        "Sand Force"
      ]
    },
    "965": {
      "name": "Meowth-Alola",
      "define": "SPECIES_MEOWTH_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Technician",
        "Rattled"
      ]
    },
    "966": {
      "name": "Persian-Alola",
      "define": "SPECIES_PERSIAN_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        "Technician",
        "Rattled"
      ]
    },
    "967": {
      "name": "Geodude-Alola",
      "define": "SPECIES_GEODUDE_ALOLA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Magnet Pull",
        "Sturdy",
        "Galvanize"
      ]
    },
    "968": {
      "name": "Graveler-Alola",
      "define": "SPECIES_GRAVELER_ALOLA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Magnet Pull",
        "Sturdy",
        "Galvanize"
      ]
    },
    "969": {
      "name": "Golem-Alola",
      "define": "SPECIES_GOLEM_ALOLA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Magnet Pull",
        "Sturdy",
        "Galvanize"
      ]
    },
    "970": {
      "name": "Grimer-Alola",
      "define": "SPECIES_GRIMER_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Touch",
        "Gluttony",
        "Power of Alchemy"
      ]
    },
    "971": {
      "name": "Muk-Alola",
      "define": "SPECIES_MUK_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Touch",
        "Gluttony",
        "Power of Alchemy"
      ]
    },
    "972": {
      "name": "Exeggutor-Alola",
      "define": "SPECIES_EXEGGUTOR_ALOLA",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Frisk",
        null,
        "Harvest"
      ]
    },
    "973": {
      "name": "Marowak-Alola",
      "define": "SPECIES_MAROWAK_ALOLA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cursed Body",
        "Lightning Rod",
        "Rock Head"
      ]
    },
    "974": {
      "name": "Meowth-Galar",
      "define": "SPECIES_MEOWTH_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Tough Claws",
        "Unnerve"
      ]
    },
    "975": {
      "name": "Ponyta-Galar",
      "define": "SPECIES_PONYTA_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Pastel Veil",
        "Anticipation"
      ]
    },
    "976": {
      "name": "Rapidash-Galar",
      "define": "SPECIES_RAPIDASH_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Pastel Veil",
        "Anticipation"
      ]
    },
    "977": {
      "name": "Slowpoke-Galar",
      "define": "SPECIES_SLOWPOKE_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gluttony",
        "Own Tempo",
        "Regenerator"
      ]
    },
    "978": {
      "name": "Slowbro-Galar",
      "define": "SPECIES_SLOWBRO_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Quick Draw",
        "Own Tempo",
        "Regenerator"
      ]
    },
    "979": {
      "name": "Farfetchd-Galar",
      "define": "SPECIES_FARFETCHD_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Steadfast",
        null,
        "Scrappy"
      ]
    },
    "980": {
      "name": "Weezing-Galar",
      "define": "SPECIES_WEEZING_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        "Neutralizing Gas",
        "Misty Surge"
      ]
    },
    "981": {
      "name": "Mr-Mime-Galar",
      "define": "SPECIES_MR_MIME_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Vital Spirit",
        "Screen Cleaner",
        "Ice Body"
      ]
    },
    "982": {
      "name": "Articuno-Galar",
      "define": "SPECIES_ARTICUNO_GALAR",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Competitive",
        null,
        null
      ]
    },
    "983": {
      "name": "Zapdos-Galar",
      "define": "SPECIES_ZAPDOS_GALAR",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Defiant",
        null,
        null
      ]
    },
    "984": {
      "name": "Moltres-Galar",
      "define": "SPECIES_MOLTRES_GALAR",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Berserk",
        null,
        null
      ]
    },
    "985": {
      "name": "Slowking-Galar",
      "define": "SPECIES_SLOWKING_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Curious Medicine",
        "Own Tempo",
        "Regenerator"
      ]
    },
    "986": {
      "name": "Corsola-Galar",
      "define": "SPECIES_CORSOLA_GALAR",
      "genderRatio": 191,
      "growthRate": 4,
      "abilities": [
        "Weak Armor",
        null,
        "Cursed Body"
      ]
    },
    "987": {
      "name": "Zigzagoon-Galar",
      "define": "SPECIES_ZIGZAGOON_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Gluttony",
        "Quick Feet"
      ]
    },
    "988": {
      "name": "Linoone-Galar",
      "define": "SPECIES_LINOONE_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Gluttony",
        "Quick Feet"
      ]
    },
    "989": {
      "name": "Darumaka-Galar",
      "define": "SPECIES_DARUMAKA_GALAR",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Hustle",
        null,
        "Inner Focus"
      ]
    },
    "990": {
      "name": "Darmanitan-Galar-Standard",
      "define": "SPECIES_DARMANITAN_GALAR_STANDARD",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Gorilla Tactics",
        null,
        "Zen Mode"
      ]
    },
    "991": {
      "name": "Yamask-Galar",
      "define": "SPECIES_YAMASK_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Wandering Spirit",
        null,
        null
      ]
    },
    "992": {
      "name": "Stunfisk-Galar",
      "define": "SPECIES_STUNFISK_GALAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Mimicry",
        null,
        null
      ]
    },
    "993": {
      "name": "Growlithe-Hisui",
      "define": "SPECIES_GROWLITHE_HISUI",
      "genderRatio": 63,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Flash Fire",
        "Rock Head"
      ]
    },
    "994": {
      "name": "Arcanine-Hisui",
      "define": "SPECIES_ARCANINE_HISUI",
      "genderRatio": 63,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Flash Fire",
        "Rock Head"
      ]
    },
    "995": {
      "name": "Voltorb-Hisui",
      "define": "SPECIES_VOLTORB_HISUI",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Soundproof",
        "Static",
        "Aftermath"
      ]
    },
    "996": {
      "name": "Electrode-Hisui",
      "define": "SPECIES_ELECTRODE_HISUI",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Soundproof",
        "Static",
        "Aftermath"
      ]
    },
    "997": {
      "name": "Typhlosion-Hisui",
      "define": "SPECIES_TYPHLOSION_HISUI",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Frisk"
      ]
    },
    "998": {
      "name": "Qwilfish-Hisui",
      "define": "SPECIES_QWILFISH_HISUI",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Swift Swim",
        "Intimidate"
      ]
    },
    "999": {
      "name": "Sneasel-Hisui",
      "define": "SPECIES_SNEASEL_HISUI",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Inner Focus",
        "Keen Eye",
        "Pickpocket"
      ]
    },
    "1000": {
      "name": "Samurott-Hisui",
      "define": "SPECIES_SAMUROTT_HISUI",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Sharpness"
      ]
    },
    "1001": {
      "name": "Lilligant-Hisui",
      "define": "SPECIES_LILLIGANT_HISUI",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Hustle",
        "Leaf Guard"
      ]
    },
    "1002": {
      "name": "Zorua-Hisui",
      "define": "SPECIES_ZORUA_HISUI",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Illusion",
        null,
        null
      ]
    },
    "1003": {
      "name": "Zoroark-Hisui",
      "define": "SPECIES_ZOROARK_HISUI",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Illusion",
        null,
        null
      ]
    },
    "1004": {
      "name": "Braviary-Hisui",
      "define": "SPECIES_BRAVIARY_HISUI",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Keen Eye",
        "Sheer Force",
        "Tinted Lens"
      ]
    },
    "1005": {
      "name": "Sliggoo-Hisui",
      "define": "SPECIES_SLIGGOO_HISUI",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sap Sipper",
        "Shell Armor",
        "Gooey"
      ]
    },
    "1006": {
      "name": "Goodra-Hisui",
      "define": "SPECIES_GOODRA_HISUI",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Sap Sipper",
        "Shell Armor",
        "Gooey"
      ]
    },
    "1007": {
      "name": "Avalugg-Hisui",
      "define": "SPECIES_AVALUGG_HISUI",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Strong Jaw",
        "Ice Body",
        "Sturdy"
      ]
    },
    "1008": {
      "name": "Decidueye-Hisui",
      "define": "SPECIES_DECIDUEYE_HISUI",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Scrappy"
      ]
    },
    "1009": {
      "name": "Pikachu-Cosplay",
      "define": "SPECIES_PIKACHU_COSPLAY",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1010": {
      "name": "Pikachu-Rock-Star",
      "define": "SPECIES_PIKACHU_ROCK_STAR",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1011": {
      "name": "Pikachu-Belle",
      "define": "SPECIES_PIKACHU_BELLE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1012": {
      "name": "Pikachu-Pop-Star",
      "define": "SPECIES_PIKACHU_POP_STAR",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1013": {
      "name": "Pikachu-PhD",
      "define": "SPECIES_PIKACHU_PHD",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1014": {
      "name": "Pikachu-Libre",
      "define": "SPECIES_PIKACHU_LIBRE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1015": {
      "name": "Pikachu-Original",
      "define": "SPECIES_PIKACHU_ORIGINAL",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1016": {
      "name": "Pikachu-Hoenn",
      "define": "SPECIES_PIKACHU_HOENN",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1017": {
      "name": "Pikachu-Sinnoh",
      "define": "SPECIES_PIKACHU_SINNOH",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1018": {
      "name": "Pikachu-Unova",
      "define": "SPECIES_PIKACHU_UNOVA",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1019": {
      "name": "Pikachu-Kalos",
      "define": "SPECIES_PIKACHU_KALOS",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1020": {
      "name": "Pikachu-Alola",
      "define": "SPECIES_PIKACHU_ALOLA",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1021": {
      "name": "Pikachu-Partner",
      "define": "SPECIES_PIKACHU_PARTNER",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1022": {
      "name": "Pikachu-World",
      "define": "SPECIES_PIKACHU_WORLD",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1023": {
      "name": "Pichu-Spiky-Eared",
      "define": "SPECIES_PICHU_SPIKY_EARED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        null
      ]
    },
    "1024": {
      "name": "Unown-B",
      "define": "SPECIES_UNOWN_B",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1025": {
      "name": "Unown-C",
      "define": "SPECIES_UNOWN_C",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1026": {
      "name": "Unown-D",
      "define": "SPECIES_UNOWN_D",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1027": {
      "name": "Unown-E",
      "define": "SPECIES_UNOWN_E",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1028": {
      "name": "Unown-F",
      "define": "SPECIES_UNOWN_F",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1029": {
      "name": "Unown-G",
      "define": "SPECIES_UNOWN_G",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1030": {
      "name": "Unown-H",
      "define": "SPECIES_UNOWN_H",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1031": {
      "name": "Unown-I",
      "define": "SPECIES_UNOWN_I",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1032": {
      "name": "Unown-J",
      "define": "SPECIES_UNOWN_J",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1033": {
      "name": "Unown-K",
      "define": "SPECIES_UNOWN_K",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1034": {
      "name": "Unown-L",
      "define": "SPECIES_UNOWN_L",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1035": {
      "name": "Unown-M",
      "define": "SPECIES_UNOWN_M",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1036": {
      "name": "Unown-N",
      "define": "SPECIES_UNOWN_N",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1037": {
      "name": "Unown-O",
      "define": "SPECIES_UNOWN_O",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1038": {
      "name": "Unown-P",
      "define": "SPECIES_UNOWN_P",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1039": {
      "name": "Unown-Q",
      "define": "SPECIES_UNOWN_Q",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1040": {
      "name": "Unown-R",
      "define": "SPECIES_UNOWN_R",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1041": {
      "name": "Unown-S",
      "define": "SPECIES_UNOWN_S",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1042": {
      "name": "Unown-T",
      "define": "SPECIES_UNOWN_T",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1043": {
      "name": "Unown-U",
      "define": "SPECIES_UNOWN_U",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1044": {
      "name": "Unown-V",
      "define": "SPECIES_UNOWN_V",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1045": {
      "name": "Unown-W",
      "define": "SPECIES_UNOWN_W",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1046": {
      "name": "Unown-X",
      "define": "SPECIES_UNOWN_X",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1047": {
      "name": "Unown-Y",
      "define": "SPECIES_UNOWN_Y",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1048": {
      "name": "Unown-Z",
      "define": "SPECIES_UNOWN_Z",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1049": {
      "name": "Unown-Exclamation",
      "define": "SPECIES_UNOWN_EXCLAMATION",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1050": {
      "name": "Unown-Question",
      "define": "SPECIES_UNOWN_QUESTION",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1051": {
      "name": "Castform-Sunny",
      "define": "SPECIES_CASTFORM_SUNNY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Forecast",
        null,
        null
      ]
    },
    "1052": {
      "name": "Castform-Rainy",
      "define": "SPECIES_CASTFORM_RAINY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Forecast",
        null,
        null
      ]
    },
    "1053": {
      "name": "Castform-Snowy",
      "define": "SPECIES_CASTFORM_SNOWY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Forecast",
        null,
        null
      ]
    },
    "1054": {
      "name": "Deoxys-Attack",
      "define": "SPECIES_DEOXYS_ATTACK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        null
      ]
    },
    "1055": {
      "name": "Deoxys-Defense",
      "define": "SPECIES_DEOXYS_DEFENSE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        null
      ]
    },
    "1056": {
      "name": "Deoxys-Speed",
      "define": "SPECIES_DEOXYS_SPEED",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        null
      ]
    },
    "1057": {
      "name": "Burmy-Sandy",
      "define": "SPECIES_BURMY_SANDY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Overcoat"
      ]
    },
    "1058": {
      "name": "Burmy-Trash",
      "define": "SPECIES_BURMY_TRASH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Overcoat"
      ]
    },
    "1059": {
      "name": "Wormadam-Sandy",
      "define": "SPECIES_WORMADAM_SANDY",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Anticipation",
        null,
        "Overcoat"
      ]
    },
    "1060": {
      "name": "Wormadam-Trash",
      "define": "SPECIES_WORMADAM_TRASH",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Anticipation",
        null,
        "Overcoat"
      ]
    },
    "1061": {
      "name": "Cherrim-Sunshine",
      "define": "SPECIES_CHERRIM_SUNSHINE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Flower Gift",
        null,
        null
      ]
    },
    "1062": {
      "name": "Shellos-East",
      "define": "SPECIES_SHELLOS_EAST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sticky Hold",
        "Storm Drain",
        "Sand Force"
      ]
    },
    "1063": {
      "name": "Gastrodon-East",
      "define": "SPECIES_GASTRODON_EAST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sticky Hold",
        "Storm Drain",
        "Sand Force"
      ]
    },
    "1064": {
      "name": "Rotom-Heat",
      "define": "SPECIES_ROTOM_HEAT",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1065": {
      "name": "Rotom-Wash",
      "define": "SPECIES_ROTOM_WASH",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1066": {
      "name": "Rotom-Frost",
      "define": "SPECIES_ROTOM_FROST",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1067": {
      "name": "Rotom-Fan",
      "define": "SPECIES_ROTOM_FAN",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1068": {
      "name": "Rotom-Mow",
      "define": "SPECIES_ROTOM_MOW",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1069": {
      "name": "Dialga-Origin",
      "define": "SPECIES_DIALGA_ORIGIN",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Telepathy"
      ]
    },
    "1070": {
      "name": "Palkia-Origin",
      "define": "SPECIES_PALKIA_ORIGIN",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        "Telepathy"
      ]
    },
    "1071": {
      "name": "Giratina-Origin",
      "define": "SPECIES_GIRATINA_ORIGIN",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1072": {
      "name": "Shaymin-Sky",
      "define": "SPECIES_SHAYMIN_SKY",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Serene Grace",
        null,
        null
      ]
    },
    "1073": {
      "name": "Arceus-Fighting",
      "define": "SPECIES_ARCEUS_FIGHTING",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1074": {
      "name": "Arceus-Flying",
      "define": "SPECIES_ARCEUS_FLYING",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1075": {
      "name": "Arceus-Poison",
      "define": "SPECIES_ARCEUS_POISON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1076": {
      "name": "Arceus-Ground",
      "define": "SPECIES_ARCEUS_GROUND",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1077": {
      "name": "Arceus-Rock",
      "define": "SPECIES_ARCEUS_ROCK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1078": {
      "name": "Arceus-Bug",
      "define": "SPECIES_ARCEUS_BUG",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1079": {
      "name": "Arceus-Ghost",
      "define": "SPECIES_ARCEUS_GHOST",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1080": {
      "name": "Arceus-Steel",
      "define": "SPECIES_ARCEUS_STEEL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1081": {
      "name": "Arceus-Fire",
      "define": "SPECIES_ARCEUS_FIRE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1082": {
      "name": "Arceus-Water",
      "define": "SPECIES_ARCEUS_WATER",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1083": {
      "name": "Arceus-Grass",
      "define": "SPECIES_ARCEUS_GRASS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1084": {
      "name": "Arceus-Electric",
      "define": "SPECIES_ARCEUS_ELECTRIC",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1085": {
      "name": "Arceus-Psychic",
      "define": "SPECIES_ARCEUS_PSYCHIC",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1086": {
      "name": "Arceus-Ice",
      "define": "SPECIES_ARCEUS_ICE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1087": {
      "name": "Arceus-Dragon",
      "define": "SPECIES_ARCEUS_DRAGON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1088": {
      "name": "Arceus-Dark",
      "define": "SPECIES_ARCEUS_DARK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1089": {
      "name": "Arceus-Fairy",
      "define": "SPECIES_ARCEUS_FAIRY",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Multitype",
        null,
        null
      ]
    },
    "1090": {
      "name": "Basculin-Blue-Striped",
      "define": "SPECIES_BASCULIN_BLUE_STRIPED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rock Head",
        "Adaptability",
        "Mold Breaker"
      ]
    },
    "1091": {
      "name": "Basculin-White-Striped",
      "define": "SPECIES_BASCULIN_WHITE_STRIPED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rattled",
        "Adaptability",
        "Mold Breaker"
      ]
    },
    "1092": {
      "name": "Darmanitan-Zen",
      "define": "SPECIES_DARMANITAN_ZEN",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sheer Force",
        null,
        "Zen Mode"
      ]
    },
    "1093": {
      "name": "Darmanitan-Galar-Zen",
      "define": "SPECIES_DARMANITAN_GALAR_ZEN",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Gorilla Tactics",
        null,
        "Zen Mode"
      ]
    },
    "1094": {
      "name": "Deerling-Summer",
      "define": "SPECIES_DEERLING_SUMMER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "1095": {
      "name": "Deerling-Autumn",
      "define": "SPECIES_DEERLING_AUTUMN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "1096": {
      "name": "Deerling-Winter",
      "define": "SPECIES_DEERLING_WINTER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "1097": {
      "name": "Sawsbuck-Summer",
      "define": "SPECIES_SAWSBUCK_SUMMER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "1098": {
      "name": "Sawsbuck-Autumn",
      "define": "SPECIES_SAWSBUCK_AUTUMN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "1099": {
      "name": "Sawsbuck-Winter",
      "define": "SPECIES_SAWSBUCK_WINTER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Sap Sipper",
        "Serene Grace"
      ]
    },
    "1100": {
      "name": "Tornadus-Therian",
      "define": "SPECIES_TORNADUS_THERIAN",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Regenerator",
        null,
        "Regenerator"
      ]
    },
    "1101": {
      "name": "Thundurus-Therian",
      "define": "SPECIES_THUNDURUS_THERIAN",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Volt Absorb",
        null,
        "Volt Absorb"
      ]
    },
    "1102": {
      "name": "Landorus-Therian",
      "define": "SPECIES_LANDORUS_THERIAN",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        null,
        null
      ]
    },
    "1103": {
      "name": "Enamorus-Therian",
      "define": "SPECIES_ENAMORUS_THERIAN",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Overcoat",
        null,
        null
      ]
    },
    "1106": {
      "name": "Keldeo-Resolute",
      "define": "SPECIES_KELDEO_RESOLUTE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Justified",
        null,
        null
      ]
    },
    "1107": {
      "name": "Meloetta-Pirouette",
      "define": "SPECIES_MELOETTA_PIROUETTE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Serene Grace",
        null,
        null
      ]
    },
    "1108": {
      "name": "Genesect-Douse",
      "define": "SPECIES_GENESECT_DOUSE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Download",
        null,
        null
      ]
    },
    "1109": {
      "name": "Genesect-Shock",
      "define": "SPECIES_GENESECT_SHOCK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Download",
        null,
        null
      ]
    },
    "1110": {
      "name": "Genesect-Burn",
      "define": "SPECIES_GENESECT_BURN",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Download",
        null,
        null
      ]
    },
    "1111": {
      "name": "Genesect-Chill",
      "define": "SPECIES_GENESECT_CHILL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Download",
        null,
        null
      ]
    },
    "1112": {
      "name": "Greninja-Bond",
      "define": "SPECIES_GRENINJA_BOND",
      "genderRatio": 0,
      "growthRate": 3,
      "abilities": [
        "Battle Bond",
        null,
        null
      ]
    },
    "1113": {
      "name": "Greninja-Ash",
      "define": "SPECIES_GRENINJA_ASH",
      "genderRatio": 0,
      "growthRate": 3,
      "abilities": [
        "Battle Bond",
        null,
        null
      ]
    },
    "1114": {
      "name": "Vivillon-Polar",
      "define": "SPECIES_VIVILLON_POLAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1115": {
      "name": "Vivillon-Tundra",
      "define": "SPECIES_VIVILLON_TUNDRA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1116": {
      "name": "Vivillon-Continental",
      "define": "SPECIES_VIVILLON_CONTINENTAL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1117": {
      "name": "Vivillon-Garden",
      "define": "SPECIES_VIVILLON_GARDEN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1118": {
      "name": "Vivillon-Elegant",
      "define": "SPECIES_VIVILLON_ELEGANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1119": {
      "name": "Vivillon-Meadow",
      "define": "SPECIES_VIVILLON_MEADOW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1120": {
      "name": "Vivillon-Modern",
      "define": "SPECIES_VIVILLON_MODERN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1121": {
      "name": "Vivillon-Marine",
      "define": "SPECIES_VIVILLON_MARINE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1122": {
      "name": "Vivillon-Archipelago",
      "define": "SPECIES_VIVILLON_ARCHIPELAGO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1123": {
      "name": "Vivillon-High-Plains",
      "define": "SPECIES_VIVILLON_HIGH_PLAINS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1124": {
      "name": "Vivillon-Sandstorm",
      "define": "SPECIES_VIVILLON_SANDSTORM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1125": {
      "name": "Vivillon-River",
      "define": "SPECIES_VIVILLON_RIVER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1126": {
      "name": "Vivillon-Monsoon",
      "define": "SPECIES_VIVILLON_MONSOON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1127": {
      "name": "Vivillon-Savanna",
      "define": "SPECIES_VIVILLON_SAVANNA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1128": {
      "name": "Vivillon-Sun",
      "define": "SPECIES_VIVILLON_SUN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1129": {
      "name": "Vivillon-Ocean",
      "define": "SPECIES_VIVILLON_OCEAN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1130": {
      "name": "Vivillon-Jungle",
      "define": "SPECIES_VIVILLON_JUNGLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1131": {
      "name": "Vivillon-Fancy",
      "define": "SPECIES_VIVILLON_FANCY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1132": {
      "name": "Vivillon-Pokeball",
      "define": "SPECIES_VIVILLON_POKEBALL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1133": {
      "name": "Flabebe-Yellow",
      "define": "SPECIES_FLABEBE_YELLOW",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1134": {
      "name": "Flabebe-Orange",
      "define": "SPECIES_FLABEBE_ORANGE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1135": {
      "name": "Flabebe-Blue",
      "define": "SPECIES_FLABEBE_BLUE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1136": {
      "name": "Flabebe-White",
      "define": "SPECIES_FLABEBE_WHITE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1137": {
      "name": "Floette-Yellow",
      "define": "SPECIES_FLOETTE_YELLOW",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1138": {
      "name": "Floette-Orange",
      "define": "SPECIES_FLOETTE_ORANGE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1139": {
      "name": "Floette-Blue",
      "define": "SPECIES_FLOETTE_BLUE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1140": {
      "name": "Floette-White",
      "define": "SPECIES_FLOETTE_WHITE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1141": {
      "name": "Floette-Eternal",
      "define": "SPECIES_FLOETTE_ETERNAL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1142": {
      "name": "Florges-Yellow",
      "define": "SPECIES_FLORGES_YELLOW",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1143": {
      "name": "Florges-Orange",
      "define": "SPECIES_FLORGES_ORANGE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1144": {
      "name": "Florges-Blue",
      "define": "SPECIES_FLORGES_BLUE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1145": {
      "name": "Florges-White",
      "define": "SPECIES_FLORGES_WHITE",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Flower Veil",
        null,
        "Symbiosis"
      ]
    },
    "1146": {
      "name": "Furfrou-Heart",
      "define": "SPECIES_FURFROU_HEART",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1147": {
      "name": "Furfrou-Star",
      "define": "SPECIES_FURFROU_STAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1148": {
      "name": "Furfrou-Diamond",
      "define": "SPECIES_FURFROU_DIAMOND",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1149": {
      "name": "Furfrou-Debutante",
      "define": "SPECIES_FURFROU_DEBUTANTE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1150": {
      "name": "Furfrou-Matron",
      "define": "SPECIES_FURFROU_MATRON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1151": {
      "name": "Furfrou-Dandy",
      "define": "SPECIES_FURFROU_DANDY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1152": {
      "name": "Furfrou-La-Reine",
      "define": "SPECIES_FURFROU_LA_REINE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1153": {
      "name": "Furfrou-Kabuki",
      "define": "SPECIES_FURFROU_KABUKI",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1154": {
      "name": "Furfrou-Pharaoh",
      "define": "SPECIES_FURFROU_PHARAOH",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Fur Coat",
        null,
        null
      ]
    },
    "1155": {
      "name": "Meowstic-F",
      "define": "SPECIES_MEOWSTIC_F",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Infiltrator",
        "Competitive"
      ]
    },
    "1156": {
      "name": "Aegislash-Blade",
      "define": "SPECIES_AEGISLASH_BLADE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stance Change",
        null,
        null
      ]
    },
    "1157": {
      "name": "Pumpkaboo-Small",
      "define": "SPECIES_PUMPKABOO_SMALL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "1158": {
      "name": "Pumpkaboo-Large",
      "define": "SPECIES_PUMPKABOO_LARGE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "1159": {
      "name": "Pumpkaboo-Super",
      "define": "SPECIES_PUMPKABOO_SUPER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "1160": {
      "name": "Gourgeist-Small",
      "define": "SPECIES_GOURGEIST_SMALL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "1161": {
      "name": "Gourgeist-Large",
      "define": "SPECIES_GOURGEIST_LARGE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "1162": {
      "name": "Gourgeist-Super",
      "define": "SPECIES_GOURGEIST_SUPER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Pickup",
        "Frisk",
        "Insomnia"
      ]
    },
    "1163": {
      "name": "Xerneas-Active",
      "define": "SPECIES_XERNEAS_ACTIVE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Fairy Aura",
        null,
        null
      ]
    },
    "1164": {
      "name": "Zygarde-10-Aura-Break",
      "define": "SPECIES_ZYGARDE_10_AURA_BREAK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Aura Break",
        null,
        null
      ]
    },
    "1165": {
      "name": "Zygarde-10-Power-Construct",
      "define": "SPECIES_ZYGARDE_10_POWER_CONSTRUCT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Power Construct",
        null,
        null
      ]
    },
    "1166": {
      "name": "Zygarde-50-Power-Construct",
      "define": "SPECIES_ZYGARDE_50_POWER_CONSTRUCT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Power Construct",
        null,
        null
      ]
    },
    "1167": {
      "name": "Zygarde-Complete",
      "define": "SPECIES_ZYGARDE_COMPLETE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Power Construct",
        null,
        null
      ]
    },
    "1168": {
      "name": "Hoopa-Unbound",
      "define": "SPECIES_HOOPA_UNBOUND",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Magician",
        null,
        null
      ]
    },
    "1169": {
      "name": "Oricorio-Pom-Pom",
      "define": "SPECIES_ORICORIO_POM_POM",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Dancer",
        null,
        null
      ]
    },
    "1170": {
      "name": "Oricorio-Pa'u",
      "define": "SPECIES_ORICORIO_PAU",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Dancer",
        null,
        null
      ]
    },
    "1171": {
      "name": "Oricorio-Sensu",
      "define": "SPECIES_ORICORIO_SENSU",
      "genderRatio": 191,
      "growthRate": 0,
      "abilities": [
        "Dancer",
        null,
        null
      ]
    },
    "1172": {
      "name": "Rockruff-Own-Tempo",
      "define": "SPECIES_ROCKRUFF_OWN_TEMPO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        null,
        null
      ]
    },
    "1173": {
      "name": "Lycanroc-Midnight",
      "define": "SPECIES_LYCANROC_MIDNIGHT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Keen Eye",
        "Vital Spirit",
        "No Guard"
      ]
    },
    "1174": {
      "name": "Lycanroc-Dusk",
      "define": "SPECIES_LYCANROC_DUSK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Tough Claws",
        null,
        null
      ]
    },
    "1175": {
      "name": "Wishiwashi-School",
      "define": "SPECIES_WISHIWASHI_SCHOOL",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Schooling",
        null,
        null
      ]
    },
    "1176": {
      "name": "Silvally-Fighting",
      "define": "SPECIES_SILVALLY_FIGHTING",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1177": {
      "name": "Silvally-Flying",
      "define": "SPECIES_SILVALLY_FLYING",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1178": {
      "name": "Silvally-Poison",
      "define": "SPECIES_SILVALLY_POISON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1179": {
      "name": "Silvally-Ground",
      "define": "SPECIES_SILVALLY_GROUND",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1180": {
      "name": "Silvally-Rock",
      "define": "SPECIES_SILVALLY_ROCK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1181": {
      "name": "Silvally-Bug",
      "define": "SPECIES_SILVALLY_BUG",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1182": {
      "name": "Silvally-Ghost",
      "define": "SPECIES_SILVALLY_GHOST",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1183": {
      "name": "Silvally-Steel",
      "define": "SPECIES_SILVALLY_STEEL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1184": {
      "name": "Silvally-Fire",
      "define": "SPECIES_SILVALLY_FIRE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1185": {
      "name": "Silvally-Water",
      "define": "SPECIES_SILVALLY_WATER",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1186": {
      "name": "Silvally-Grass",
      "define": "SPECIES_SILVALLY_GRASS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1187": {
      "name": "Silvally-Electric",
      "define": "SPECIES_SILVALLY_ELECTRIC",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1188": {
      "name": "Silvally-Psychic",
      "define": "SPECIES_SILVALLY_PSYCHIC",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1189": {
      "name": "Silvally-Ice",
      "define": "SPECIES_SILVALLY_ICE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1190": {
      "name": "Silvally-Dragon",
      "define": "SPECIES_SILVALLY_DRAGON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1191": {
      "name": "Silvally-Dark",
      "define": "SPECIES_SILVALLY_DARK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1192": {
      "name": "Silvally-Fairy",
      "define": "SPECIES_SILVALLY_FAIRY",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "RKS System",
        null,
        null
      ]
    },
    "1193": {
      "name": "Minior-Meteor-Orange",
      "define": "SPECIES_MINIOR_METEOR_ORANGE",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1194": {
      "name": "Minior-Meteor-Yellow",
      "define": "SPECIES_MINIOR_METEOR_YELLOW",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1195": {
      "name": "Minior-Meteor-Green",
      "define": "SPECIES_MINIOR_METEOR_GREEN",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1196": {
      "name": "Minior-Meteor-Blue",
      "define": "SPECIES_MINIOR_METEOR_BLUE",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1197": {
      "name": "Minior-Meteor-Indigo",
      "define": "SPECIES_MINIOR_METEOR_INDIGO",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1198": {
      "name": "Minior-Meteor-Violet",
      "define": "SPECIES_MINIOR_METEOR_VIOLET",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1199": {
      "name": "Minior-Core-Red",
      "define": "SPECIES_MINIOR_CORE_RED",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1200": {
      "name": "Minior-Core-Orange",
      "define": "SPECIES_MINIOR_CORE_ORANGE",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1201": {
      "name": "Minior-Core-Yellow",
      "define": "SPECIES_MINIOR_CORE_YELLOW",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1202": {
      "name": "Minior-Core-Green",
      "define": "SPECIES_MINIOR_CORE_GREEN",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1203": {
      "name": "Minior-Core-Blue",
      "define": "SPECIES_MINIOR_CORE_BLUE",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1204": {
      "name": "Minior-Core-Indigo",
      "define": "SPECIES_MINIOR_CORE_INDIGO",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1205": {
      "name": "Minior-Core-Violet",
      "define": "SPECIES_MINIOR_CORE_VIOLET",
      "genderRatio": 255,
      "growthRate": 3,
      "abilities": [
        "Shields Down",
        null,
        null
      ]
    },
    "1206": {
      "name": "Mimikyu-Busted",
      "define": "SPECIES_MIMIKYU_BUSTED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Disguise",
        null,
        null
      ]
    },
    "1210": {
      "name": "Magearna-Original",
      "define": "SPECIES_MAGEARNA_ORIGINAL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Soul-Heart",
        null,
        null
      ]
    },
    "1211": {
      "name": "Cramorant-Gulping",
      "define": "SPECIES_CRAMORANT_GULPING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gulp Missile",
        null,
        null
      ]
    },
    "1212": {
      "name": "Cramorant-Gorging",
      "define": "SPECIES_CRAMORANT_GORGING",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gulp Missile",
        null,
        null
      ]
    },
    "1213": {
      "name": "Toxtricity-Low-Key",
      "define": "SPECIES_TOXTRICITY_LOW_KEY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Punk Rock",
        "Minus",
        "Technician"
      ]
    },
    "1214": {
      "name": "Sinistea-Antique",
      "define": "SPECIES_SINISTEA_ANTIQUE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Weak Armor",
        null,
        "Cursed Body"
      ]
    },
    "1215": {
      "name": "Polteageist-Antique",
      "define": "SPECIES_POLTEAGEIST_ANTIQUE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Weak Armor",
        null,
        "Cursed Body"
      ]
    },
    "1216": {
      "name": "Alcremie-Strawberry-Ruby-Cream",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_RUBY_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1217": {
      "name": "Alcremie-Strawberry-Matcha-Cream",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_MATCHA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1218": {
      "name": "Alcremie-Strawberry-Mint-Cream",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_MINT_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1219": {
      "name": "Alcremie-Strawberry-Lemon-Cream",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_LEMON_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1220": {
      "name": "Alcremie-Strawberry-Salted-Cream",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_SALTED_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1221": {
      "name": "Alcremie-Strawberry-Ruby-Swirl",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_RUBY_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1222": {
      "name": "Alcremie-Strawberry-Caramel-Swirl",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_CARAMEL_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1223": {
      "name": "Alcremie-Strawberry-Rainbow-Swirl",
      "define": "SPECIES_ALCREMIE_STRAWBERRY_RAINBOW_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1224": {
      "name": "Eiscue-Noice",
      "define": "SPECIES_EISCUE_NOICE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Ice Face",
        null,
        null
      ]
    },
    "1225": {
      "name": "Indeedee-F",
      "define": "SPECIES_INDEEDEE_F",
      "genderRatio": 254,
      "growthRate": 4,
      "abilities": [
        "Own Tempo",
        "Synchronize",
        "Psychic Surge"
      ]
    },
    "1226": {
      "name": "Morpeko-Hangry",
      "define": "SPECIES_MORPEKO_HANGRY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Hunger Switch",
        null,
        null
      ]
    },
    "1227": {
      "name": "Zacian-Crowned",
      "define": "SPECIES_ZACIAN_CROWNED",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Intrepid Sword",
        null,
        null
      ]
    },
    "1228": {
      "name": "Zamazenta-Crowned",
      "define": "SPECIES_ZAMAZENTA_CROWNED",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Dauntless Shield",
        null,
        null
      ]
    },
    "1229": {
      "name": "Eternatus-Eternamax",
      "define": "SPECIES_ETERNATUS_ETERNAMAX",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Pressure",
        null,
        null
      ]
    },
    "1230": {
      "name": "Urshifu-Rapid-Strike",
      "define": "SPECIES_URSHIFU_RAPID_STRIKE",
      "genderRatio": 31,
      "growthRate": 5,
      "abilities": [
        "Unseen Fist",
        null,
        null
      ]
    },
    "1231": {
      "name": "Zarude-Dada",
      "define": "SPECIES_ZARUDE_DADA",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Leaf Guard",
        null,
        null
      ]
    },
    "1234": {
      "name": "Basculegion-F",
      "define": "SPECIES_BASCULEGION_F",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Swift Swim",
        "Adaptability",
        "Mold Breaker"
      ]
    },
    "1235": {
      "name": "Alcremie-Berry-Vanilla-Cream",
      "define": "SPECIES_ALCREMIE_BERRY_VANILLA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1236": {
      "name": "Alcremie-Berry-Ruby-Cream",
      "define": "SPECIES_ALCREMIE_BERRY_RUBY_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1237": {
      "name": "Alcremie-Berry-Matcha-Cream",
      "define": "SPECIES_ALCREMIE_BERRY_MATCHA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1238": {
      "name": "Alcremie-Berry-Mint-Cream",
      "define": "SPECIES_ALCREMIE_BERRY_MINT_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1239": {
      "name": "Alcremie-Berry-Lemon-Cream",
      "define": "SPECIES_ALCREMIE_BERRY_LEMON_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1240": {
      "name": "Alcremie-Berry-Salted-Cream",
      "define": "SPECIES_ALCREMIE_BERRY_SALTED_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1241": {
      "name": "Alcremie-Berry-Ruby-Swirl",
      "define": "SPECIES_ALCREMIE_BERRY_RUBY_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1242": {
      "name": "Alcremie-Berry-Caramel-Swirl",
      "define": "SPECIES_ALCREMIE_BERRY_CARAMEL_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1243": {
      "name": "Alcremie-Berry-Rainbow-Swirl",
      "define": "SPECIES_ALCREMIE_BERRY_RAINBOW_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1244": {
      "name": "Alcremie-Love-Vanilla-Cream",
      "define": "SPECIES_ALCREMIE_LOVE_VANILLA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1245": {
      "name": "Alcremie-Love-Ruby-Cream",
      "define": "SPECIES_ALCREMIE_LOVE_RUBY_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1246": {
      "name": "Alcremie-Love-Matcha-Cream",
      "define": "SPECIES_ALCREMIE_LOVE_MATCHA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1247": {
      "name": "Alcremie-Love-Mint-Cream",
      "define": "SPECIES_ALCREMIE_LOVE_MINT_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1248": {
      "name": "Alcremie-Love-Lemon-Cream",
      "define": "SPECIES_ALCREMIE_LOVE_LEMON_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1249": {
      "name": "Alcremie-Love-Salted-Cream",
      "define": "SPECIES_ALCREMIE_LOVE_SALTED_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1250": {
      "name": "Alcremie-Love-Ruby-Swirl",
      "define": "SPECIES_ALCREMIE_LOVE_RUBY_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1251": {
      "name": "Alcremie-Love-Caramel-Swirl",
      "define": "SPECIES_ALCREMIE_LOVE_CARAMEL_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1252": {
      "name": "Alcremie-Love-Rainbow-Swirl",
      "define": "SPECIES_ALCREMIE_LOVE_RAINBOW_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1253": {
      "name": "Alcremie-Star-Vanilla-Cream",
      "define": "SPECIES_ALCREMIE_STAR_VANILLA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1254": {
      "name": "Alcremie-Star-Ruby-Cream",
      "define": "SPECIES_ALCREMIE_STAR_RUBY_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1255": {
      "name": "Alcremie-Star-Matcha-Cream",
      "define": "SPECIES_ALCREMIE_STAR_MATCHA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1256": {
      "name": "Alcremie-Star-Mint-Cream",
      "define": "SPECIES_ALCREMIE_STAR_MINT_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1257": {
      "name": "Alcremie-Star-Lemon-Cream",
      "define": "SPECIES_ALCREMIE_STAR_LEMON_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1258": {
      "name": "Alcremie-Star-Salted-Cream",
      "define": "SPECIES_ALCREMIE_STAR_SALTED_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1259": {
      "name": "Alcremie-Star-Ruby-Swirl",
      "define": "SPECIES_ALCREMIE_STAR_RUBY_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1260": {
      "name": "Alcremie-Star-Caramel-Swirl",
      "define": "SPECIES_ALCREMIE_STAR_CARAMEL_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1261": {
      "name": "Alcremie-Star-Rainbow-Swirl",
      "define": "SPECIES_ALCREMIE_STAR_RAINBOW_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1262": {
      "name": "Alcremie-Clover-Vanilla-Cream",
      "define": "SPECIES_ALCREMIE_CLOVER_VANILLA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1263": {
      "name": "Alcremie-Clover-Ruby-Cream",
      "define": "SPECIES_ALCREMIE_CLOVER_RUBY_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1264": {
      "name": "Alcremie-Clover-Matcha-Cream",
      "define": "SPECIES_ALCREMIE_CLOVER_MATCHA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1265": {
      "name": "Alcremie-Clover-Mint-Cream",
      "define": "SPECIES_ALCREMIE_CLOVER_MINT_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1266": {
      "name": "Alcremie-Clover-Lemon-Cream",
      "define": "SPECIES_ALCREMIE_CLOVER_LEMON_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1267": {
      "name": "Alcremie-Clover-Salted-Cream",
      "define": "SPECIES_ALCREMIE_CLOVER_SALTED_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1268": {
      "name": "Alcremie-Clover-Ruby-Swirl",
      "define": "SPECIES_ALCREMIE_CLOVER_RUBY_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1269": {
      "name": "Alcremie-Clover-Caramel-Swirl",
      "define": "SPECIES_ALCREMIE_CLOVER_CARAMEL_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1270": {
      "name": "Alcremie-Clover-Rainbow-Swirl",
      "define": "SPECIES_ALCREMIE_CLOVER_RAINBOW_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1271": {
      "name": "Alcremie-Flower-Vanilla-Cream",
      "define": "SPECIES_ALCREMIE_FLOWER_VANILLA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1272": {
      "name": "Alcremie-Flower-Ruby-Cream",
      "define": "SPECIES_ALCREMIE_FLOWER_RUBY_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1273": {
      "name": "Alcremie-Flower-Matcha-Cream",
      "define": "SPECIES_ALCREMIE_FLOWER_MATCHA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1274": {
      "name": "Alcremie-Flower-Mint-Cream",
      "define": "SPECIES_ALCREMIE_FLOWER_MINT_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1275": {
      "name": "Alcremie-Flower-Lemon-Cream",
      "define": "SPECIES_ALCREMIE_FLOWER_LEMON_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1276": {
      "name": "Alcremie-Flower-Salted-Cream",
      "define": "SPECIES_ALCREMIE_FLOWER_SALTED_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1277": {
      "name": "Alcremie-Flower-Ruby-Swirl",
      "define": "SPECIES_ALCREMIE_FLOWER_RUBY_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1278": {
      "name": "Alcremie-Flower-Caramel-Swirl",
      "define": "SPECIES_ALCREMIE_FLOWER_CARAMEL_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1279": {
      "name": "Alcremie-Flower-Rainbow-Swirl",
      "define": "SPECIES_ALCREMIE_FLOWER_RAINBOW_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1280": {
      "name": "Alcremie-Ribbon-Vanilla-Cream",
      "define": "SPECIES_ALCREMIE_RIBBON_VANILLA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1281": {
      "name": "Alcremie-Ribbon-Ruby-Cream",
      "define": "SPECIES_ALCREMIE_RIBBON_RUBY_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1282": {
      "name": "Alcremie-Ribbon-Matcha-Cream",
      "define": "SPECIES_ALCREMIE_RIBBON_MATCHA_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1283": {
      "name": "Alcremie-Ribbon-Mint-Cream",
      "define": "SPECIES_ALCREMIE_RIBBON_MINT_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1284": {
      "name": "Alcremie-Ribbon-Lemon-Cream",
      "define": "SPECIES_ALCREMIE_RIBBON_LEMON_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1285": {
      "name": "Alcremie-Ribbon-Salted-Cream",
      "define": "SPECIES_ALCREMIE_RIBBON_SALTED_CREAM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1286": {
      "name": "Alcremie-Ribbon-Ruby-Swirl",
      "define": "SPECIES_ALCREMIE_RIBBON_RUBY_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1287": {
      "name": "Alcremie-Ribbon-Caramel-Swirl",
      "define": "SPECIES_ALCREMIE_RIBBON_CARAMEL_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1288": {
      "name": "Alcremie-Ribbon-Rainbow-Swirl",
      "define": "SPECIES_ALCREMIE_RIBBON_RAINBOW_SWIRL",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        "Aroma Veil"
      ]
    },
    "1289": {
      "name": "Sprigatito",
      "define": "SPECIES_SPRIGATITO",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Protean"
      ]
    },
    "1290": {
      "name": "Floragato",
      "define": "SPECIES_FLORAGATO",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Protean"
      ]
    },
    "1291": {
      "name": "Meowscarada",
      "define": "SPECIES_MEOWSCARADA",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Overgrow",
        null,
        "Protean"
      ]
    },
    "1292": {
      "name": "Fuecoco",
      "define": "SPECIES_FUECOCO",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Unaware"
      ]
    },
    "1293": {
      "name": "Crocalor",
      "define": "SPECIES_CROCALOR",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Unaware"
      ]
    },
    "1294": {
      "name": "Skeledirge",
      "define": "SPECIES_SKELEDIRGE",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Blaze",
        null,
        "Unaware"
      ]
    },
    "1295": {
      "name": "Quaxly",
      "define": "SPECIES_QUAXLY",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Moxie"
      ]
    },
    "1296": {
      "name": "Quaxwell",
      "define": "SPECIES_QUAXWELL",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Moxie"
      ]
    },
    "1297": {
      "name": "Quaquaval",
      "define": "SPECIES_QUAQUAVAL",
      "genderRatio": 31,
      "growthRate": 3,
      "abilities": [
        "Torrent",
        null,
        "Moxie"
      ]
    },
    "1298": {
      "name": "Lechonk",
      "define": "SPECIES_LECHONK",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Aroma Veil",
        "Gluttony",
        "Thick Fat"
      ]
    },
    "1299": {
      "name": "Oinkologne-M",
      "define": "SPECIES_OINKOLOGNE_M",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Lingering Aroma",
        "Gluttony",
        "Thick Fat"
      ]
    },
    "1300": {
      "name": "Oinkologne-F",
      "define": "SPECIES_OINKOLOGNE_F",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Aroma Veil",
        "Gluttony",
        "Thick Fat"
      ]
    },
    "1301": {
      "name": "Tarountula",
      "define": "SPECIES_TAROUNTULA",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Insomnia",
        null,
        "Stakeout"
      ]
    },
    "1302": {
      "name": "Spidops",
      "define": "SPECIES_SPIDOPS",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Insomnia",
        null,
        "Stakeout"
      ]
    },
    "1303": {
      "name": "Nymble",
      "define": "SPECIES_NYMBLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        "Tinted Lens"
      ]
    },
    "1304": {
      "name": "Lokix",
      "define": "SPECIES_LOKIX",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        "Tinted Lens"
      ]
    },
    "1305": {
      "name": "Pawmi",
      "define": "SPECIES_PAWMI",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        "Natural Cure",
        "Iron Fist"
      ]
    },
    "1306": {
      "name": "Pawmo",
      "define": "SPECIES_PAWMO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Volt Absorb",
        "Natural Cure",
        "Iron Fist"
      ]
    },
    "1307": {
      "name": "Pawmot",
      "define": "SPECIES_PAWMOT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Volt Absorb",
        "Natural Cure",
        "Iron Fist"
      ]
    },
    "1308": {
      "name": "Tandemaus",
      "define": "SPECIES_TANDEMAUS",
      "genderRatio": 255,
      "growthRate": 4,
      "abilities": [
        "Run Away",
        "Pickup",
        "Own Tempo"
      ]
    },
    "1309": {
      "name": "Maushold-Three",
      "define": "SPECIES_MAUSHOLD_THREE",
      "genderRatio": 255,
      "growthRate": 4,
      "abilities": [
        "Friend Guard",
        "Cheek Pouch",
        "Technician"
      ]
    },
    "1310": {
      "name": "Maushold-Four",
      "define": "SPECIES_MAUSHOLD_FOUR",
      "genderRatio": 255,
      "growthRate": 4,
      "abilities": [
        "Friend Guard",
        "Cheek Pouch",
        "Technician"
      ]
    },
    "1311": {
      "name": "Fidough",
      "define": "SPECIES_FIDOUGH",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Own Tempo",
        null,
        "Klutz"
      ]
    },
    "1312": {
      "name": "Dachsbun",
      "define": "SPECIES_DACHSBUN",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Well-Baked Body",
        null,
        "Aroma Veil"
      ]
    },
    "1313": {
      "name": "Smoliv",
      "define": "SPECIES_SMOLIV",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Early Bird",
        null,
        "Harvest"
      ]
    },
    "1314": {
      "name": "Dolliv",
      "define": "SPECIES_DOLLIV",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Early Bird",
        null,
        "Harvest"
      ]
    },
    "1315": {
      "name": "Arboliva",
      "define": "SPECIES_ARBOLIVA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Seed Sower",
        null,
        "Harvest"
      ]
    },
    "1316": {
      "name": "Squawkabilly-Green",
      "define": "SPECIES_SQUAWKABILLY_GREEN",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Intimidate",
        "Hustle",
        "Guts"
      ]
    },
    "1317": {
      "name": "Squawkabilly-Blue",
      "define": "SPECIES_SQUAWKABILLY_BLUE",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Intimidate",
        "Hustle",
        "Guts"
      ]
    },
    "1318": {
      "name": "Squawkabilly-Yellow",
      "define": "SPECIES_SQUAWKABILLY_YELLOW",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Intimidate",
        "Hustle",
        "Sheer Force"
      ]
    },
    "1319": {
      "name": "Squawkabilly-White",
      "define": "SPECIES_SQUAWKABILLY_WHITE",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Intimidate",
        "Hustle",
        "Sheer Force"
      ]
    },
    "1320": {
      "name": "Nacli",
      "define": "SPECIES_NACLI",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Purifying Salt",
        "Sturdy",
        "Clear Body"
      ]
    },
    "1321": {
      "name": "Naclstack",
      "define": "SPECIES_NACLSTACK",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Purifying Salt",
        "Sturdy",
        "Clear Body"
      ]
    },
    "1322": {
      "name": "Garganacl",
      "define": "SPECIES_GARGANACL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Purifying Salt",
        "Sturdy",
        "Clear Body"
      ]
    },
    "1323": {
      "name": "Charcadet",
      "define": "SPECIES_CHARCADET",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Flash Fire",
        null,
        "Flame Body"
      ]
    },
    "1324": {
      "name": "Armarouge",
      "define": "SPECIES_ARMAROUGE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Flash Fire",
        null,
        "Weak Armor"
      ]
    },
    "1325": {
      "name": "Ceruledge",
      "define": "SPECIES_CERULEDGE",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Flash Fire",
        null,
        "Weak Armor"
      ]
    },
    "1326": {
      "name": "Tadbulb",
      "define": "SPECIES_TADBULB",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Own Tempo",
        "Static",
        "Damp"
      ]
    },
    "1327": {
      "name": "Bellibolt",
      "define": "SPECIES_BELLIBOLT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Electromorphosis",
        "Static",
        "Damp"
      ]
    },
    "1328": {
      "name": "Wattrel",
      "define": "SPECIES_WATTREL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Wind Power",
        "Volt Absorb",
        "Competitive"
      ]
    },
    "1329": {
      "name": "Kilowattrel",
      "define": "SPECIES_KILOWATTREL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Wind Power",
        "Volt Absorb",
        "Competitive"
      ]
    },
    "1330": {
      "name": "Maschiff",
      "define": "SPECIES_MASCHIFF",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        "Run Away",
        "Stakeout"
      ]
    },
    "1331": {
      "name": "Mabosstiff",
      "define": "SPECIES_MABOSSTIFF",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Intimidate",
        "Guard Dog",
        "Stakeout"
      ]
    },
    "1332": {
      "name": "Shroodle",
      "define": "SPECIES_SHROODLE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Unburden",
        "Pickpocket",
        "Prankster"
      ]
    },
    "1333": {
      "name": "Grafaiai",
      "define": "SPECIES_GRAFAIAI",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Unburden",
        "Poison Touch",
        "Prankster"
      ]
    },
    "1334": {
      "name": "Bramblin",
      "define": "SPECIES_BRAMBLIN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Wind Rider",
        null,
        "Infiltrator"
      ]
    },
    "1335": {
      "name": "Brambleghast",
      "define": "SPECIES_BRAMBLEGHAST",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Wind Rider",
        null,
        "Infiltrator"
      ]
    },
    "1336": {
      "name": "Toedscool",
      "define": "SPECIES_TOEDSCOOL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Mycelium Might",
        null,
        null
      ]
    },
    "1337": {
      "name": "Toedscruel",
      "define": "SPECIES_TOEDSCRUEL",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Mycelium Might",
        null,
        null
      ]
    },
    "1338": {
      "name": "Klawf",
      "define": "SPECIES_KLAWF",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Anger Shell",
        "Shell Armor",
        "Regenerator"
      ]
    },
    "1339": {
      "name": "Capsakid",
      "define": "SPECIES_CAPSAKID",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Insomnia",
        "Klutz"
      ]
    },
    "1340": {
      "name": "Scovillain",
      "define": "SPECIES_SCOVILLAIN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Chlorophyll",
        "Insomnia",
        "Moody"
      ]
    },
    "1341": {
      "name": "Rellor",
      "define": "SPECIES_RELLOR",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Compound Eyes",
        null,
        "Shed Skin"
      ]
    },
    "1342": {
      "name": "Rabsca",
      "define": "SPECIES_RABSCA",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Synchronize",
        null,
        "Telepathy"
      ]
    },
    "1343": {
      "name": "Flittle",
      "define": "SPECIES_FLITTLE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Anticipation",
        "Frisk",
        "Speed Boost"
      ]
    },
    "1344": {
      "name": "Espathra",
      "define": "SPECIES_ESPATHRA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Opportunist",
        "Frisk",
        "Speed Boost"
      ]
    },
    "1345": {
      "name": "Tinkatink",
      "define": "SPECIES_TINKATINK",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Mold Breaker",
        "Own Tempo",
        "Pickpocket"
      ]
    },
    "1346": {
      "name": "Tinkatuff",
      "define": "SPECIES_TINKATUFF",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Mold Breaker",
        "Own Tempo",
        "Pickpocket"
      ]
    },
    "1347": {
      "name": "Tinkaton",
      "define": "SPECIES_TINKATON",
      "genderRatio": 254,
      "growthRate": 3,
      "abilities": [
        "Mold Breaker",
        "Own Tempo",
        "Pickpocket"
      ]
    },
    "1348": {
      "name": "Wiglett",
      "define": "SPECIES_WIGLETT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gooey",
        "Rattled",
        "Sand Veil"
      ]
    },
    "1349": {
      "name": "Wugtrio",
      "define": "SPECIES_WUGTRIO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Gooey",
        "Rattled",
        "Sand Veil"
      ]
    },
    "1350": {
      "name": "Bombirdier",
      "define": "SPECIES_BOMBIRDIER",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Big Pecks",
        "Keen Eye",
        "Rocky Payload"
      ]
    },
    "1351": {
      "name": "Finizen",
      "define": "SPECIES_FINIZEN",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Water Veil",
        null,
        null
      ]
    },
    "1352": {
      "name": "Palafin-Zero",
      "define": "SPECIES_PALAFIN_ZERO",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Zero to Hero",
        null,
        null
      ]
    },
    "1353": {
      "name": "Palafin-Hero",
      "define": "SPECIES_PALAFIN_HERO",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Zero to Hero",
        null,
        null
      ]
    },
    "1354": {
      "name": "Varoom",
      "define": "SPECIES_VAROOM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Overcoat",
        null,
        "Slow Start"
      ]
    },
    "1355": {
      "name": "Revavroom",
      "define": "SPECIES_REVAVROOM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Overcoat",
        null,
        "Filter"
      ]
    },
    "1356": {
      "name": "Cyclizar",
      "define": "SPECIES_CYCLIZAR",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Shed Skin",
        null,
        "Regenerator"
      ]
    },
    "1357": {
      "name": "Orthworm",
      "define": "SPECIES_ORTHWORM",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Earth Eater",
        null,
        "Sand Veil"
      ]
    },
    "1358": {
      "name": "Glimmet",
      "define": "SPECIES_GLIMMET",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Toxic Debris",
        null,
        "Corrosion"
      ]
    },
    "1359": {
      "name": "Glimmora",
      "define": "SPECIES_GLIMMORA",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Toxic Debris",
        null,
        "Corrosion"
      ]
    },
    "1360": {
      "name": "Greavard",
      "define": "SPECIES_GREAVARD",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Pickup",
        null,
        "Fluffy"
      ]
    },
    "1361": {
      "name": "Houndstone",
      "define": "SPECIES_HOUNDSTONE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Sand Rush",
        null,
        "Fluffy"
      ]
    },
    "1362": {
      "name": "Flamigo",
      "define": "SPECIES_FLAMIGO",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Scrappy",
        "Tangled Feet",
        "Costar"
      ]
    },
    "1363": {
      "name": "Cetoddle",
      "define": "SPECIES_CETODDLE",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Thick Fat",
        "Snow Cloak",
        "Sheer Force"
      ]
    },
    "1364": {
      "name": "Cetitan",
      "define": "SPECIES_CETITAN",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Thick Fat",
        "Slush Rush",
        "Sheer Force"
      ]
    },
    "1365": {
      "name": "Veluza",
      "define": "SPECIES_VELUZA",
      "genderRatio": 127,
      "growthRate": 4,
      "abilities": [
        "Mold Breaker",
        null,
        "Sharpness"
      ]
    },
    "1366": {
      "name": "Dondozo",
      "define": "SPECIES_DONDOZO",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Unaware",
        "Oblivious",
        "Water Veil"
      ]
    },
    "1367": {
      "name": "Tatsugiri-Curly",
      "define": "SPECIES_TATSUGIRI_CURLY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Commander",
        null,
        "Storm Drain"
      ]
    },
    "1368": {
      "name": "Tatsugiri-Droopy",
      "define": "SPECIES_TATSUGIRI_DROOPY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Commander",
        null,
        "Storm Drain"
      ]
    },
    "1369": {
      "name": "Tatsugiri-Stretchy",
      "define": "SPECIES_TATSUGIRI_STRETCHY",
      "genderRatio": 127,
      "growthRate": 3,
      "abilities": [
        "Commander",
        null,
        "Storm Drain"
      ]
    },
    "1370": {
      "name": "Annihilape",
      "define": "SPECIES_ANNIHILAPE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Vital Spirit",
        "Inner Focus",
        "Defiant"
      ]
    },
    "1371": {
      "name": "Clodsire",
      "define": "SPECIES_CLODSIRE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Water Absorb",
        "Unaware"
      ]
    },
    "1372": {
      "name": "Farigiraf",
      "define": "SPECIES_FARIGIRAF",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Cud Chew",
        "Armor Tail",
        "Sap Sipper"
      ]
    },
    "1373": {
      "name": "Dudunsparce-Two-Segment",
      "define": "SPECIES_DUDUNSPARCE_TWO_SEGMENT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Serene Grace",
        "Run Away",
        "Rattled"
      ]
    },
    "1374": {
      "name": "Dudunsparce-Three-Segment",
      "define": "SPECIES_DUDUNSPARCE_THREE_SEGMENT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Serene Grace",
        "Run Away",
        "Rattled"
      ]
    },
    "1375": {
      "name": "Kingambit",
      "define": "SPECIES_KINGAMBIT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Defiant",
        "Supreme Overlord",
        "Pressure"
      ]
    },
    "1376": {
      "name": "Great-Tusk",
      "define": "SPECIES_GREAT_TUSK",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1377": {
      "name": "Scream-Tail",
      "define": "SPECIES_SCREAM_TAIL",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1378": {
      "name": "Brute-Bonnet",
      "define": "SPECIES_BRUTE_BONNET",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1379": {
      "name": "Flutter-Mane",
      "define": "SPECIES_FLUTTER_MANE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1380": {
      "name": "Slither-Wing",
      "define": "SPECIES_SLITHER_WING",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1381": {
      "name": "Sandy-Shocks",
      "define": "SPECIES_SANDY_SHOCKS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1382": {
      "name": "Iron-Treads",
      "define": "SPECIES_IRON_TREADS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1383": {
      "name": "Iron-Bundle",
      "define": "SPECIES_IRON_BUNDLE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1384": {
      "name": "Iron-Hands",
      "define": "SPECIES_IRON_HANDS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1385": {
      "name": "Iron-Jugulis",
      "define": "SPECIES_IRON_JUGULIS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1386": {
      "name": "Iron-Moth",
      "define": "SPECIES_IRON_MOTH",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1387": {
      "name": "Iron-Thorns",
      "define": "SPECIES_IRON_THORNS",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1388": {
      "name": "Frigibax",
      "define": "SPECIES_FRIGIBAX",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Thermal Exchange",
        null,
        "Ice Body"
      ]
    },
    "1389": {
      "name": "Arctibax",
      "define": "SPECIES_ARCTIBAX",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Thermal Exchange",
        null,
        "Ice Body"
      ]
    },
    "1390": {
      "name": "Baxcalibur",
      "define": "SPECIES_BAXCALIBUR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Thermal Exchange",
        null,
        "Ice Body"
      ]
    },
    "1391": {
      "name": "Gimmighoul-Chest",
      "define": "SPECIES_GIMMIGHOUL_CHEST",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Rattled",
        null,
        null
      ]
    },
    "1392": {
      "name": "Gimmighoul-Roaming",
      "define": "SPECIES_GIMMIGHOUL_ROAMING",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Run Away",
        null,
        null
      ]
    },
    "1393": {
      "name": "Gholdengo",
      "define": "SPECIES_GHOLDENGO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Good as Gold",
        null,
        null
      ]
    },
    "1394": {
      "name": "Wo-Chien",
      "define": "SPECIES_WO_CHIEN",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Tablets of Ruin",
        null,
        null
      ]
    },
    "1395": {
      "name": "Chien-Pao",
      "define": "SPECIES_CHIEN_PAO",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Sword of Ruin",
        null,
        null
      ]
    },
    "1396": {
      "name": "Ting-Lu",
      "define": "SPECIES_TING_LU",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Vessel of Ruin",
        null,
        null
      ]
    },
    "1397": {
      "name": "Chi-Yu",
      "define": "SPECIES_CHI_YU",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Beads of Ruin",
        null,
        null
      ]
    },
    "1398": {
      "name": "Roaring-Moon",
      "define": "SPECIES_ROARING_MOON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1399": {
      "name": "Iron-Valiant",
      "define": "SPECIES_IRON_VALIANT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1400": {
      "name": "Koraidon",
      "define": "SPECIES_KORAIDON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Orichalcum Pulse",
        null,
        null
      ]
    },
    "1401": {
      "name": "Miraidon",
      "define": "SPECIES_MIRAIDON",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Hadron Engine",
        null,
        null
      ]
    },
    "1402": {
      "name": "Tauros-Paldea-Combat",
      "define": "SPECIES_TAUROS_PALDEA_COMBAT",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Anger Point",
        "Cud Chew"
      ]
    },
    "1403": {
      "name": "Tauros-Paldea-Blaze",
      "define": "SPECIES_TAUROS_PALDEA_BLAZE",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Anger Point",
        "Cud Chew"
      ]
    },
    "1404": {
      "name": "Tauros-Paldea-Aqua",
      "define": "SPECIES_TAUROS_PALDEA_AQUA",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Intimidate",
        "Anger Point",
        "Cud Chew"
      ]
    },
    "1405": {
      "name": "Wooper-Paldea",
      "define": "SPECIES_WOOPER_PALDEA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Poison Point",
        "Water Absorb",
        "Unaware"
      ]
    },
    "1406": {
      "name": "Walking-Wake",
      "define": "SPECIES_WALKING_WAKE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1407": {
      "name": "Iron-Leaves",
      "define": "SPECIES_IRON_LEAVES",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1408": {
      "name": "Dipplin",
      "define": "SPECIES_DIPPLIN",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Supersweet Syrup",
        "Gluttony",
        "Sticky Hold"
      ]
    },
    "1409": {
      "name": "Poltchageist-Counterfeit",
      "define": "SPECIES_POLTCHAGEIST_COUNTERFEIT",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Hospitality",
        null,
        "Heatproof"
      ]
    },
    "1410": {
      "name": "Poltchageist-Artisan",
      "define": "SPECIES_POLTCHAGEIST_ARTISAN",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Hospitality",
        null,
        "Heatproof"
      ]
    },
    "1411": {
      "name": "Sinistcha-Unremarkable",
      "define": "SPECIES_SINISTCHA_UNREMARKABLE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Hospitality",
        null,
        "Heatproof"
      ]
    },
    "1412": {
      "name": "Sinistcha-Masterpiece",
      "define": "SPECIES_SINISTCHA_MASTERPIECE",
      "genderRatio": 255,
      "growthRate": 0,
      "abilities": [
        "Hospitality",
        null,
        "Heatproof"
      ]
    },
    "1413": {
      "name": "Okidogi",
      "define": "SPECIES_OKIDOGI",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Toxic Chain",
        null,
        "Guard Dog"
      ]
    },
    "1414": {
      "name": "Munkidori",
      "define": "SPECIES_MUNKIDORI",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Toxic Chain",
        null,
        "Frisk"
      ]
    },
    "1415": {
      "name": "Fezandipiti",
      "define": "SPECIES_FEZANDIPITI",
      "genderRatio": 0,
      "growthRate": 5,
      "abilities": [
        "Toxic Chain",
        null,
        "Technician"
      ]
    },
    "1416": {
      "name": "Ogerpon-Teal",
      "define": "SPECIES_OGERPON_TEAL",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Defiant",
        null,
        null
      ]
    },
    "1417": {
      "name": "Ogerpon-Wellspring",
      "define": "SPECIES_OGERPON_WELLSPRING",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Water Absorb",
        null,
        null
      ]
    },
    "1418": {
      "name": "Ogerpon-Hearthflame",
      "define": "SPECIES_OGERPON_HEARTHFLAME",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Mold Breaker",
        null,
        null
      ]
    },
    "1419": {
      "name": "Ogerpon-Cornerstone",
      "define": "SPECIES_OGERPON_CORNERSTONE",
      "genderRatio": 254,
      "growthRate": 5,
      "abilities": [
        "Sturdy",
        null,
        null
      ]
    },
    "1424": {
      "name": "Ursaluna-Bloodmoon",
      "define": "SPECIES_URSALUNA_BLOODMOON",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Mind's Eye",
        null,
        null
      ]
    },
    "1425": {
      "name": "Archaludon",
      "define": "SPECIES_ARCHALUDON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Stamina",
        "Sturdy",
        "Stalwart"
      ]
    },
    "1426": {
      "name": "Hydrapple",
      "define": "SPECIES_HYDRAPPLE",
      "genderRatio": 127,
      "growthRate": 1,
      "abilities": [
        "Supersweet Syrup",
        "Regenerator",
        "Sticky Hold"
      ]
    },
    "1427": {
      "name": "Gouging-Fire",
      "define": "SPECIES_GOUGING_FIRE",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1428": {
      "name": "Raging-Bolt",
      "define": "SPECIES_RAGING_BOLT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Protosynthesis",
        null,
        null
      ]
    },
    "1429": {
      "name": "Iron-Boulder",
      "define": "SPECIES_IRON_BOULDER",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1430": {
      "name": "Iron-Crown",
      "define": "SPECIES_IRON_CROWN",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Quark Drive",
        null,
        null
      ]
    },
    "1431": {
      "name": "Terapagos-Normal",
      "define": "SPECIES_TERAPAGOS_NORMAL",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Tera Shift",
        null,
        null
      ]
    },
    "1432": {
      "name": "Terapagos-Terastal",
      "define": "SPECIES_TERAPAGOS_TERASTAL",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Tera Shell",
        null,
        null
      ]
    },
    "1433": {
      "name": "Terapagos-Stellar",
      "define": "SPECIES_TERAPAGOS_STELLAR",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Teraform Zero",
        null,
        null
      ]
    },
    "1434": {
      "name": "Pecharunt",
      "define": "SPECIES_PECHARUNT",
      "genderRatio": 255,
      "growthRate": 5,
      "abilities": [
        "Poison Puppeteer",
        null,
        null
      ]
    },
    "1436": {
      "name": "Mothim-Sandy",
      "define": "SPECIES_MOTHIM_SANDY",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        "Tinted Lens"
      ]
    },
    "1437": {
      "name": "Mothim-Trash",
      "define": "SPECIES_MOTHIM_TRASH",
      "genderRatio": 0,
      "growthRate": 0,
      "abilities": [
        "Swarm",
        null,
        "Tinted Lens"
      ]
    },
    "1438": {
      "name": "Scatterbug-Polar",
      "define": "SPECIES_SCATTERBUG_POLAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1439": {
      "name": "Scatterbug-Tundra",
      "define": "SPECIES_SCATTERBUG_TUNDRA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1440": {
      "name": "Scatterbug-Continental",
      "define": "SPECIES_SCATTERBUG_CONTINENTAL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1441": {
      "name": "Scatterbug-Garden",
      "define": "SPECIES_SCATTERBUG_GARDEN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1442": {
      "name": "Scatterbug-Elegant",
      "define": "SPECIES_SCATTERBUG_ELEGANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1443": {
      "name": "Scatterbug-Meadow",
      "define": "SPECIES_SCATTERBUG_MEADOW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1444": {
      "name": "Scatterbug-Modern",
      "define": "SPECIES_SCATTERBUG_MODERN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1445": {
      "name": "Scatterbug-Marine",
      "define": "SPECIES_SCATTERBUG_MARINE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1446": {
      "name": "Scatterbug-Archipelago",
      "define": "SPECIES_SCATTERBUG_ARCHIPELAGO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1447": {
      "name": "Scatterbug-High-Plains",
      "define": "SPECIES_SCATTERBUG_HIGH_PLAINS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1448": {
      "name": "Scatterbug-Sandstorm",
      "define": "SPECIES_SCATTERBUG_SANDSTORM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1449": {
      "name": "Scatterbug-River",
      "define": "SPECIES_SCATTERBUG_RIVER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1450": {
      "name": "Scatterbug-Monsoon",
      "define": "SPECIES_SCATTERBUG_MONSOON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1451": {
      "name": "Scatterbug-Savanna",
      "define": "SPECIES_SCATTERBUG_SAVANNA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1452": {
      "name": "Scatterbug-Sun",
      "define": "SPECIES_SCATTERBUG_SUN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1453": {
      "name": "Scatterbug-Ocean",
      "define": "SPECIES_SCATTERBUG_OCEAN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1454": {
      "name": "Scatterbug-Jungle",
      "define": "SPECIES_SCATTERBUG_JUNGLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1455": {
      "name": "Scatterbug-Fancy",
      "define": "SPECIES_SCATTERBUG_FANCY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1456": {
      "name": "Scatterbug-Pokeball",
      "define": "SPECIES_SCATTERBUG_POKEBALL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shield Dust",
        "Compound Eyes",
        "Friend Guard"
      ]
    },
    "1457": {
      "name": "Spewpa-Polar",
      "define": "SPECIES_SPEWPA_POLAR",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1458": {
      "name": "Spewpa-Tundra",
      "define": "SPECIES_SPEWPA_TUNDRA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1459": {
      "name": "Spewpa-Continental",
      "define": "SPECIES_SPEWPA_CONTINENTAL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1460": {
      "name": "Spewpa-Garden",
      "define": "SPECIES_SPEWPA_GARDEN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1461": {
      "name": "Spewpa-Elegant",
      "define": "SPECIES_SPEWPA_ELEGANT",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1462": {
      "name": "Spewpa-Meadow",
      "define": "SPECIES_SPEWPA_MEADOW",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1463": {
      "name": "Spewpa-Modern",
      "define": "SPECIES_SPEWPA_MODERN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1464": {
      "name": "Spewpa-Marine",
      "define": "SPECIES_SPEWPA_MARINE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1465": {
      "name": "Spewpa-Archipelago",
      "define": "SPECIES_SPEWPA_ARCHIPELAGO",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1466": {
      "name": "Spewpa-High-Plains",
      "define": "SPECIES_SPEWPA_HIGH_PLAINS",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1467": {
      "name": "Spewpa-Sandstorm",
      "define": "SPECIES_SPEWPA_SANDSTORM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1468": {
      "name": "Spewpa-River",
      "define": "SPECIES_SPEWPA_RIVER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1469": {
      "name": "Spewpa-Monsoon",
      "define": "SPECIES_SPEWPA_MONSOON",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1470": {
      "name": "Spewpa-Savanna",
      "define": "SPECIES_SPEWPA_SAVANNA",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1471": {
      "name": "Spewpa-Sun",
      "define": "SPECIES_SPEWPA_SUN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1472": {
      "name": "Spewpa-Ocean",
      "define": "SPECIES_SPEWPA_OCEAN",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1473": {
      "name": "Spewpa-Jungle",
      "define": "SPECIES_SPEWPA_JUNGLE",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1474": {
      "name": "Spewpa-Fancy",
      "define": "SPECIES_SPEWPA_FANCY",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1475": {
      "name": "Spewpa-Pokeball",
      "define": "SPECIES_SPEWPA_POKEBALL",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Shed Skin",
        null,
        "Friend Guard"
      ]
    },
    "1476": {
      "name": "Raticate-Alola-Totem",
      "define": "SPECIES_RATICATE_ALOLA_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Thick Fat",
        null,
        null
      ]
    },
    "1477": {
      "name": "Gumshoos-Totem",
      "define": "SPECIES_GUMSHOOS_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Adaptability",
        null,
        null
      ]
    },
    "1478": {
      "name": "Vikavolt-Totem",
      "define": "SPECIES_VIKAVOLT_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Levitate",
        null,
        null
      ]
    },
    "1479": {
      "name": "Lurantis-Totem",
      "define": "SPECIES_LURANTIS_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Leaf Guard",
        null,
        null
      ]
    },
    "1480": {
      "name": "Salazzle-Totem",
      "define": "SPECIES_SALAZZLE_TOTEM",
      "genderRatio": 254,
      "growthRate": 0,
      "abilities": [
        "Corrosion",
        null,
        null
      ]
    },
    "1481": {
      "name": "Mimikyu-Totem-Disguised",
      "define": "SPECIES_MIMIKYU_TOTEM_DISGUISED",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Disguise",
        null,
        null
      ]
    },
    "1482": {
      "name": "Kommo-o-Totem",
      "define": "SPECIES_KOMMO_O_TOTEM",
      "genderRatio": 127,
      "growthRate": 5,
      "abilities": [
        "Overcoat",
        null,
        null
      ]
    },
    "1483": {
      "name": "Marowak-Alola-Totem",
      "define": "SPECIES_MAROWAK_ALOLA_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Rock Head",
        null,
        null
      ]
    },
    "1484": {
      "name": "Ribombee-Totem",
      "define": "SPECIES_RIBOMBEE_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sweet Veil",
        null,
        null
      ]
    },
    "1485": {
      "name": "Araquanid-Totem",
      "define": "SPECIES_ARAQUANID_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Water Bubble",
        null,
        null
      ]
    },
    "1486": {
      "name": "Togedemaru-Totem",
      "define": "SPECIES_TOGEDEMARU_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Sturdy",
        null,
        null
      ]
    },
    "1487": {
      "name": "Pikachu-Starter",
      "define": "SPECIES_PIKACHU_STARTER",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Static",
        null,
        "Lightning Rod"
      ]
    },
    "1488": {
      "name": "Eevee-Starter",
      "define": "SPECIES_EEVEE_STARTER",
      "genderRatio": 31,
      "growthRate": 0,
      "abilities": [
        "Run Away",
        "Adaptability",
        "Anticipation"
      ]
    },
    "1523": {
      "name": "Mimikyu-Busted-Totem",
      "define": "SPECIES_MIMIKYU_BUSTED_TOTEM",
      "genderRatio": 127,
      "growthRate": 0,
      "abilities": [
        "Disguise",
        null,
        null
      ]
    }
  },
  "moves": [
    "(No Move)",
    "Pound",
    "Karate Chop",
    "Double Slap",
    "Comet Punch",
    "Mega Punch",
    "Pay Day",
    "Fire Punch",
    "Ice Punch",
    "Thunder Punch",
    "Scratch",
    "Vise Grip",
    "Guillotine",
    "Razor Wind",
    "Swords Dance",
    "Cut",
    "Gust",
    "Wing Attack",
    "Whirlwind",
    "Fly",
    "Bind",
    "Slam",
    "Vine Whip",
    "Stomp",
    "Double Kick",
    "Mega Kick",
    "Jump Kick",
    "Rolling Kick",
    "Sand Attack",
    "Headbutt",
    "Horn Attack",
    "Fury Attack",
    "Horn Drill",
    "Tackle",
    "Body Slam",
    "Wrap",
    "Take Down",
    "Thrash",
    "Double-Edge",
    "Tail Whip",
    "Poison Sting",
    "Twineedle",
    "Pin Missile",
    "Leer",
    "Bite",
    "Growl",
    "Roar",
    "Sing",
    "Supersonic",
    "Sonic Boom",
    "Disable",
    "Acid",
    "Ember",
    "Flamethrower",
    "Mist",
    "Water Gun",
    "Hydro Pump",
    "Surf",
    "Ice Beam",
    "Blizzard",
    "Psybeam",
    "Bubble Beam",
    "Aurora Beam",
    "Hyper Beam",
    "Peck",
    "Drill Peck",
    "Submission",
    "Low Kick",
    "Counter",
    "Seismic Toss",
    "Strength",
    "Absorb",
    "Mega Drain",
    "Leech Seed",
    "Growth",
    "Razor Leaf",
    "Solar Beam",
    "Poison Powder",
    "Stun Spore",
    "Sleep Powder",
    "Petal Dance",
    "String Shot",
    "Dragon Rage",
    "Fire Spin",
    "Thunder Shock",
    "Thunderbolt",
    "Thunder Wave",
    "Thunder",
    "Rock Throw",
    "Earthquake",
    "Fissure",
    "Dig",
    "Toxic",
    "Confusion",
    "Psychic",
    "Hypnosis",
    "Meditate",
    "Agility",
    "Quick Attack",
    "Rage",
    "Teleport",
    "Night Shade",
    "Mimic",
    "Screech",
    "Double Team",
    "Recover",
    "Harden",
    "Minimize",
    "Smokescreen",
    "Confuse Ray",
    "Withdraw",
    "Defense Curl",
    "Barrier",
    "Light Screen",
    "Haze",
    "Reflect",
    "Focus Energy",
    "Bide",
    "Metronome",
    "Mirror Move",
    "Self-Destruct",
    "Egg Bomb",
    "Lick",
    "Smog",
    "Sludge",
    "Bone Club",
    "Fire Blast",
    "Waterfall",
    "Clamp",
    "Swift",
    "Skull Bash",
    "Spike Cannon",
    "Constrict",
    "Amnesia",
    "Kinesis",
    "Soft-Boiled",
    "High Jump Kick",
    "Glare",
    "Dream Eater",
    "Poison Gas",
    "Barrage",
    "Leech Life",
    "Lovely Kiss",
    "Sky Attack",
    "Transform",
    "Bubble",
    "Dizzy Punch",
    "Spore",
    "Flash",
    "Psywave",
    "Splash",
    "Acid Armor",
    "Crabhammer",
    "Explosion",
    "Fury Swipes",
    "Bonemerang",
    "Rest",
    "Rock Slide",
    "Hyper Fang",
    "Sharpen",
    "Conversion",
    "Tri Attack",
    "Super Fang",
    "Slash",
    "Substitute",
    "Struggle",
    "Sketch",
    "Triple Kick",
    "Thief",
    "Spider Web",
    "Mind Reader",
    "Nightmare",
    "Flame Wheel",
    "Snore",
    "Curse",
    "Flail",
    "Conversion 2",
    "Aeroblast",
    "Cotton Spore",
    "Reversal",
    "Spite",
    "Powder Snow",
    "Protect",
    "Mach Punch",
    "Scary Face",
    "Feint Attack",
    "Sweet Kiss",
    "Belly Drum",
    "Sludge Bomb",
    "Mud-Slap",
    "Octazooka",
    "Spikes",
    "Zap Cannon",
    "Foresight",
    "Destiny Bond",
    "Perish Song",
    "Icy Wind",
    "Detect",
    "Bone Rush",
    "Lock-On",
    "Outrage",
    "Sandstorm",
    "Giga Drain",
    "Endure",
    "Charm",
    "Rollout",
    "False Swipe",
    "Swagger",
    "Milk Drink",
    "Spark",
    "Fury Cutter",
    "Steel Wing",
    "Mean Look",
    "Attract",
    "Sleep Talk",
    "Heal Bell",
    "Return",
    "Present",
    "Frustration",
    "Safeguard",
    "Pain Split",
    "Sacred Fire",
    "Magnitude",
    "Dynamic Punch",
    "Megahorn",
    "Dragon Breath",
    "Baton Pass",
    "Encore",
    "Pursuit",
    "Rapid Spin",
    "Sweet Scent",
    "Iron Tail",
    "Metal Claw",
    "Vital Throw",
    "Morning Sun",
    "Synthesis",
    "Moonlight",
    "Hidden Power",
    "Cross Chop",
    "Twister",
    "Rain Dance",
    "Sunny Day",
    "Crunch",
    "Mirror Coat",
    "Psych Up",
    "Extreme Speed",
    "Ancient Power",
    "Shadow Ball",
    "Future Sight",
    "Rock Smash",
    "Whirlpool",
    "Beat Up",
    "Fake Out",
    "Uproar",
    "Stockpile",
    "Spit Up",
    "Swallow",
    "Heat Wave",
    "Hail",
    "Torment",
    "Flatter",
    "Will-O-Wisp",
    "Memento",
    "Facade",
    "Focus Punch",
    "Smelling Salts",
    "Follow Me",
    "Nature Power",
    "Charge",
    "Taunt",
    "Helping Hand",
    "Trick",
    "Role Play",
    "Wish",
    "Assist",
    "Ingrain",
    "Superpower",
    "Magic Coat",
    "Recycle",
    "Revenge",
    "Brick Break",
    "Yawn",
    "Knock Off",
    "Endeavor",
    "Eruption",
    "Skill Swap",
    "Imprison",
    "Refresh",
    "Grudge",
    "Snatch",
    "Secret Power",
    "Dive",
    "Arm Thrust",
    "Camouflage",
    "Tail Glow",
    "Luster Purge",
    "Mist Ball",
    "Feather Dance",
    "Teeter Dance",
    "Blaze Kick",
    "Mud Sport",
    "Ice Ball",
    "Needle Arm",
    "Slack Off",
    "Hyper Voice",
    "Poison Fang",
    "Crush Claw",
    "Blast Burn",
    "Hydro Cannon",
    "Meteor Mash",
    "Astonish",
    "Weather Ball",
    "Aromatherapy",
    "Fake Tears",
    "Air Cutter",
    "Overheat",
    "Odor Sleuth",
    "Rock Tomb",
    "Silver Wind",
    "Metal Sound",
    "Grass Whistle",
    "Tickle",
    "Cosmic Power",
    "Water Spout",
    "Signal Beam",
    "Shadow Punch",
    "Extrasensory",
    "Sky Uppercut",
    "Sand Tomb",
    "Sheer Cold",
    "Muddy Water",
    "Bullet Seed",
    "Aerial Ace",
    "Icicle Spear",
    "Iron Defense",
    "Block",
    "Howl",
    "Dragon Claw",
    "Frenzy Plant",
    "Bulk Up",
    "Bounce",
    "Mud Shot",
    "Poison Tail",
    "Covet",
    "Volt Tackle",
    "Magical Leaf",
    "Water Sport",
    "Calm Mind",
    "Leaf Blade",
    "Dragon Dance",
    "Rock Blast",
    "Shock Wave",
    "Water Pulse",
    "Doom Desire",
    "Psycho Boost",
    "Roost",
    "Gravity",
    "Miracle Eye",
    "Wake-Up Slap",
    "Hammer Arm",
    "Gyro Ball",
    "Healing Wish",
    "Brine",
    "Natural Gift",
    "Feint",
    "Pluck",
    "Tailwind",
    "Acupressure",
    "Metal Burst",
    "U-turn",
    "Close Combat",
    "Payback",
    "Assurance",
    "Embargo",
    "Fling",
    "Psycho Shift",
    "Trump Card",
    "Heal Block",
    "Wring Out",
    "Power Trick",
    "Gastro Acid",
    "Lucky Chant",
    "Me First",
    "Copycat",
    "Power Swap",
    "Guard Swap",
    "Punishment",
    "Last Resort",
    "Worry Seed",
    "Sucker Punch",
    "Toxic Spikes",
    "Heart Swap",
    "Aqua Ring",
    "Magnet Rise",
    "Flare Blitz",
    "Force Palm",
    "Aura Sphere",
    "Rock Polish",
    "Poison Jab",
    "Dark Pulse",
    "Night Slash",
    "Aqua Tail",
    "Seed Bomb",
    "Air Slash",
    "X-Scissor",
    "Bug Buzz",
    "Dragon Pulse",
    "Dragon Rush",
    "Power Gem",
    "Drain Punch",
    "Vacuum Wave",
    "Focus Blast",
    "Energy Ball",
    "Brave Bird",
    "Earth Power",
    "Switcheroo",
    "Giga Impact",
    "Nasty Plot",
    "Bullet Punch",
    "Avalanche",
    "Ice Shard",
    "Shadow Claw",
    "Thunder Fang",
    "Ice Fang",
    "Fire Fang",
    "Shadow Sneak",
    "Mud Bomb",
    "Psycho Cut",
    "Zen Headbutt",
    "Mirror Shot",
    "Flash Cannon",
    "Rock Climb",
    "Defog",
    "Trick Room",
    "Draco Meteor",
    "Discharge",
    "Lava Plume",
    "Leaf Storm",
    "Power Whip",
    "Rock Wrecker",
    "Cross Poison",
    "Gunk Shot",
    "Iron Head",
    "Magnet Bomb",
    "Stone Edge",
    "Captivate",
    "Stealth Rock",
    "Grass Knot",
    "Chatter",
    "Judgment",
    "Bug Bite",
    "Charge Beam",
    "Wood Hammer",
    "Aqua Jet",
    "Attack Order",
    "Defend Order",
    "Heal Order",
    "Head Smash",
    "Double Hit",
    "Roar of Time",
    "Spacial Rend",
    "Lunar Dance",
    "Crush Grip",
    "Magma Storm",
    "Dark Void",
    "Seed Flare",
    "Ominous Wind",
    "Shadow Force",
    "Hone Claws",
    "Wide Guard",
    "Guard Split",
    "Power Split",
    "Wonder Room",
    "Psyshock",
    "Venoshock",
    "Autotomize",
    "Rage Powder",
    "Telekinesis",
    "Magic Room",
    "Smack Down",
    "Storm Throw",
    "Flame Burst",
    "Sludge Wave",
    "Quiver Dance",
    "Heavy Slam",
    "Synchronoise",
    "Electro Ball",
    "Soak",
    "Flame Charge",
    "Coil",
    "Low Sweep",
    "Acid Spray",
    "Foul Play",
    "Simple Beam",
    "Entrainment",
    "After You",
    "Round",
    "Echoed Voice",
    "Chip Away",
    "Clear Smog",
    "Stored Power",
    "Quick Guard",
    "Ally Switch",
    "Scald",
    "Shell Smash",
    "Heal Pulse",
    "Hex",
    "Sky Drop",
    "Shift Gear",
    "Circle Throw",
    "Incinerate",
    "Quash",
    "Acrobatics",
    "Reflect Type",
    "Retaliate",
    "Final Gambit",
    "Bestow",
    "Inferno",
    "Water Pledge",
    "Fire Pledge",
    "Grass Pledge",
    "Volt Switch",
    "Struggle Bug",
    "Bulldoze",
    "Frost Breath",
    "Dragon Tail",
    "Work Up",
    "Electroweb",
    "Wild Charge",
    "Drill Run",
    "Dual Chop",
    "Heart Stamp",
    "Horn Leech",
    "Sacred Sword",
    "Razor Shell",
    "Heat Crash",
    "Leaf Tornado",
    "Steamroller",
    "Cotton Guard",
    "Night Daze",
    "Psystrike",
    "Tail Slap",
    "Hurricane",
    "Head Charge",
    "Gear Grind",
    "Searing Shot",
    "Techno Blast",
    "Relic Song",
    "Secret Sword",
    "Glaciate",
    "Bolt Strike",
    "Blue Flare",
    "Fiery Dance",
    "Freeze Shock",
    "Ice Burn",
    "Snarl",
    "Icicle Crash",
    "V-create",
    "Fusion Flare",
    "Fusion Bolt",
    "Flying Press",
    "Mat Block",
    "Belch",
    "Rototiller",
    "Sticky Web",
    "Fell Stinger",
    "Phantom Force",
    "Trick-or-Treat",
    "Noble Roar",
    "Ion Deluge",
    "Parabolic Charge",
    "Forest's Curse",
    "Petal Blizzard",
    "Freeze-Dry",
    "Disarming Voice",
    "Parting Shot",
    "Topsy-Turvy",
    "Draining Kiss",
    "Crafty Shield",
    "Flower Shield",
    "Grassy Terrain",
    "Misty Terrain",
    "Electrify",
    "Play Rough",
    "Fairy Wind",
    "Moonblast",
    "Boomburst",
    "Fairy Lock",
    "King's Shield",
    "Play Nice",
    "Confide",
    "Diamond Storm",
    "Steam Eruption",
    "Hyperspace Hole",
    "Water Shuriken",
    "Mystical Fire",
    "Spiky Shield",
    "Aromatic Mist",
    "Eerie Impulse",
    "Venom Drench",
    "Powder",
    "Geomancy",
    "Magnetic Flux",
    "Happy Hour",
    "Electric Terrain",
    "Dazzling Gleam",
    "Celebrate",
    "Hold Hands",
    "Baby-Doll Eyes",
    "Nuzzle",
    "Hold Back",
    "Infestation",
    "Power-Up Punch",
    "Oblivion Wing",
    "Thousand Arrows",
    "Thousand Waves",
    "Land's Wrath",
    "Light of Ruin",
    "Origin Pulse",
    "Precipice Blades",
    "Dragon Ascent",
    "Hyperspace Fury",
    "Shore Up",
    "First Impression",
    "Baneful Bunker",
    "Spirit Shackle",
    "Darkest Lariat",
    "Sparkling Aria",
    "Ice Hammer",
    "Floral Healing",
    "High Horsepower",
    "Strength Sap",
    "Solar Blade",
    "Leafage",
    "Spotlight",
    "Toxic Thread",
    "Laser Focus",
    "Gear Up",
    "Throat Chop",
    "Pollen Puff",
    "Anchor Shot",
    "Psychic Terrain",
    "Lunge",
    "Fire Lash",
    "Power Trip",
    "Burn Up",
    "Speed Swap",
    "Smart Strike",
    "Purify",
    "Revelation Dance",
    "Core Enforcer",
    "Trop Kick",
    "Instruct",
    "Beak Blast",
    "Clanging Scales",
    "Dragon Hammer",
    "Brutal Swing",
    "Aurora Veil",
    "Shell Trap",
    "Fleur Cannon",
    "Psychic Fangs",
    "Stomping Tantrum",
    "Shadow Bone",
    "Accelerock",
    "Liquidation",
    "Prismatic Laser",
    "Spectral Thief",
    "Sunsteel Strike",
    "Moongeist Beam",
    "Tearful Look",
    "Zing Zap",
    "Nature's Madness",
    "Multi-Attack",
    "Mind Blown",
    "Plasma Fists",
    "Photon Geyser",
    "Zippy Zap",
    "Splishy Splash",
    "Floaty Fall",
    "Pika Papow",
    "Bouncy Bubble",
    "Buzzy Buzz",
    "Sizzly Slide",
    "Glitzy Glow",
    "Baddy Bad",
    "Sappy Seed",
    "Freezy Frost",
    "Sparkly Swirl",
    "Veevee Volley",
    "Double Iron Bash",
    "Dynamax Cannon",
    "Snipe Shot",
    "Jaw Lock",
    "Stuff Cheeks",
    "No Retreat",
    "Tar Shot",
    "Magic Powder",
    "Dragon Darts",
    "Teatime",
    "Octolock",
    "Bolt Beak",
    "Fishious Rend",
    "Court Change",
    "Clangorous Soul",
    "Body Press",
    "Decorate",
    "Drum Beating",
    "Snap Trap",
    "Pyro Ball",
    "Behemoth Blade",
    "Behemoth Bash",
    "Aura Wheel",
    "Breaking Swipe",
    "Branch Poke",
    "Overdrive",
    "Apple Acid",
    "Grav Apple",
    "Spirit Break",
    "Strange Steam",
    "Life Dew",
    "Obstruct",
    "False Surrender",
    "Meteor Assault",
    "Eternabeam",
    "Steel Beam",
    "Expanding Force",
    "Steel Roller",
    "Scale Shot",
    "Meteor Beam",
    "Shell Side Arm",
    "Misty Explosion",
    "Grassy Glide",
    "Rising Voltage",
    "Terrain Pulse",
    "Skitter Smack",
    "Burning Jealousy",
    "Lash Out",
    "Poltergeist",
    "Corrosive Gas",
    "Coaching",
    "Flip Turn",
    "Triple Axel",
    "Dual Wingbeat",
    "Scorching Sands",
    "Jungle Healing",
    "Wicked Blow",
    "Surging Strikes",
    "Thunder Cage",
    "Dragon Energy",
    "Freezing Glare",
    "Fiery Wrath",
    "Thunderous Kick",
    "Glacial Lance",
    "Astral Barrage",
    "Eerie Spell",
    "Dire Claw",
    "Psyshield Bash",
    "Power Shift",
    "Stone Axe",
    "Springtide Storm",
    "Mystical Power",
    "Raging Fury",
    "Wave Crash",
    "Chloroblast",
    "Mountain Gale",
    "Victory Dance",
    "Headlong Rush",
    "Barb Barrage",
    "Esper Wing",
    "Bitter Malice",
    "Shelter",
    "Triple Arrows",
    "Infernal Parade",
    "Ceaseless Edge",
    "Bleakwind Storm",
    "Wildbolt Storm",
    "Sandsear Storm",
    "Lunar Blessing",
    "Take Heart",
    "Tera Blast",
    "Silk Trap",
    "Axe Kick",
    "Last Respects",
    "Lumina Crash",
    "Order Up",
    "Jet Punch",
    "Spicy Extract",
    "Spin Out",
    "Population Bomb",
    "Ice Spinner",
    "Glaive Rush",
    "Revival Blessing",
    "Salt Cure",
    "Triple Dive",
    "Mortal Spin",
    "Doodle",
    "Fillet Away",
    "Kowtow Cleave",
    "Flower Trick",
    "Torch Song",
    "Aqua Step",
    "Raging Bull",
    "Make It Rain",
    "Ruination",
    "Collision Course",
    "Electro Drift",
    "Shed Tail",
    "Chilly Reception",
    "Tidy Up",
    "Snowscape",
    "Pounce",
    "Trailblaze",
    "Chilling Water",
    "Hyper Drill",
    "Twin Beam",
    "Rage Fist",
    "Armor Cannon",
    "Bitter Blade",
    "Double Shock",
    "Gigaton Hammer",
    "Comeuppance",
    "Aqua Cutter",
    "Blazing Torque",
    "Wicked Torque",
    "Noxious Torque",
    "Combat Torque",
    "Magical Torque",
    "Psyblade",
    "Hydro Steam",
    "Blood Moon",
    "Matcha Gotcha",
    "Syrup Bomb",
    "Ivy Cudgel",
    "Electro Shot",
    "Tera Starstorm",
    "Fickle Beam",
    "Burning Bulwark",
    "Thunderclap",
    "Mighty Cleave",
    "Tachyon Cutter",
    "Hard Press",
    "Dragon Cheer",
    "Alluring Voice",
    "Temper Flare",
    "Supercell Slam",
    "Psychic Noise",
    "Upper Hand",
    "Malignant Chain",
    "Breakneck Blitz",
    "All-Out Pummeling",
    "Supersonic Skystrike",
    "Acid Downpour",
    "Tectonic Rage",
    "Continental Crush",
    "Savage Spin-Out",
    "Never-Ending Nightmare",
    "Corkscrew Crash",
    "Inferno Overdrive",
    "Hydro Vortex",
    "Bloom Doom",
    "Gigavolt Havoc",
    "Shattered Psyche",
    "Subzero Slammer",
    "Devastating Drake",
    "Black Hole Eclipse",
    "Twinkle Tackle",
    "Catastropika",
    "10,000,000 Volt Thunderbolt",
    "Stoked Sparksurfer",
    "Extreme Evoboost",
    "Pulverizing Pancake",
    "Genesis Supernova",
    "Sinister Arrow Raid",
    "Malicious Moonsault",
    "Oceanic Operetta",
    "Splintered Stormshards",
    "Let's Snuggle Forever",
    "Clangorous Soulblaze",
    "Guardian of Alola",
    "Searing Sunraze Smash",
    "Menacing Moonraze Maelstrom",
    "Light That Burns the Sky",
    "Soul-Stealing 7-Star Strike",
    "Max Guard",
    "Max Strike",
    "Max Knuckle",
    "Max Airstream",
    "Max Ooze",
    "Max Quake",
    "Max Rockfall",
    "Max Flutterby",
    "Max Phantasm",
    "Max Steelspike",
    "Max Flare",
    "Max Geyser",
    "Max Overgrowth",
    "Max Lightning",
    "Max Mindstorm",
    "Max Hailstorm",
    "Max Wyrmwind",
    "Max Darkness",
    "Max Starfall",
    "G-Max Vine Lash",
    "G-Max Wildfire",
    "G-Max Cannonade",
    "G-Max Befuddle",
    "G-Max Volt Crash",
    "G-Max Gold Rush",
    "G-Max Chi Strike",
    "G-Max Terror",
    "G-Max Foam Burst",
    "G-Max Resonance",
    "G-Max Cuddle",
    "G-Max Replenish",
    "G-Max Malodor",
    "G-Max Meltdown",
    "G-Max Drum Solo",
    "G-Max Fireball",
    "G-Max Hydrosnipe",
    "G-Max Wind Rage",
    "G-Max Gravitas",
    "G-Max Stonesurge",
    "G-Max Volcalith",
    "G-Max Tartness",
    "G-Max Sweetness",
    "G-Max Sandblast",
    "G-Max Stun Shock",
    "G-Max Centiferno",
    "G-Max Smite",
    "G-Max Snooze",
    "G-Max Finale",
    "G-Max Steelsurge",
    "G-Max Depletion",
    "G-Max One Blow",
    "G-Max Rapid Flow"
  ],
  "items": [
    "????????",
    "Poke Ball",
    "Great Ball",
    "Ultra Ball",
    "Master Ball",
    "Premier Ball",
    "Heal Ball",
    "Net Ball",
    "Nest Ball",
    "Dive Ball",
    "Dusk Ball",
    "Timer Ball",
    "Quick Ball",
    "Repeat Ball",
    "Luxury Ball",
    "Level Ball",
    "Lure Ball",
    "Moon Ball",
    "Friend Ball",
    "Love Ball",
    "Fast Ball",
    "Heavy Ball",
    "Dream Ball",
    "Safari Ball",
    "Sport Ball",
    "Park Ball",
    "Beast Ball",
    "Cherish Ball",
    "Potion",
    "Super Potion",
    "Hyper Potion",
    "Max Potion",
    "Full Restore",
    "Revive",
    "Max Revive",
    "Fresh Water",
    "Soda Pop",
    "Lemonade",
    "Moomoo Milk",
    "Energy Powder",
    "Energy Root",
    "Heal Powder",
    "Revival Herb",
    "Antidote",
    "Paralyze Heal",
    "Burn Heal",
    "Ice Heal",
    "Awakening",
    "Full Heal",
    "Ether",
    "Max Ether",
    "Elixir",
    "Max Elixir",
    "Berry Juice",
    "Sacred Ash",
    "Sweet Heart",
    "Max Honey",
    "Pewter Crunchies",
    "Rage Candy Bar",
    "Lava Cookie",
    "Old Gateau",
    "Casteliacone",
    "Lumiose Galette",
    "Shalour Sable",
    "Big Malasada",
    "Hp Up",
    "Protein",
    "Iron",
    "Calcium",
    "Zinc",
    "Carbos",
    "Pp Up",
    "Pp Max",
    "Health Feather",
    "Muscle Feather",
    "Resist Feather",
    "Genius Feather",
    "Clever Feather",
    "Swift Feather",
    "Ability Capsule",
    "Ability Patch",
    "Lonely Mint",
    "Adamant Mint",
    "Naughty Mint",
    "Brave Mint",
    "Bold Mint",
    "Impish Mint",
    "Lax Mint",
    "Relaxed Mint",
    "Modest Mint",
    "Mild Mint",
    "Rash Mint",
    "Quiet Mint",
    "Calm Mint",
    "Gentle Mint",
    "Careful Mint",
    "Sassy Mint",
    "Timid Mint",
    "Hasty Mint",
    "Jolly Mint",
    "Naive Mint",
    "Serious Mint",
    "Rare Candy",
    "Exp. Candy Xs",
    "Exp. Candy S",
    "Exp. Candy M",
    "Exp. Candy L",
    "Exp. Candy Xl",
    "Dynamax Candy",
    "Blue Flute",
    "Yellow Flute",
    "Red Flute",
    "Black Flute",
    "White Flute",
    "Repel",
    "Super Repel",
    "Max Repel",
    "Lure",
    "Super Lure",
    "Max Lure",
    "Escape Rope",
    "X Attack",
    "X Defense",
    "X Sp. Atk",
    "X Sp. Def",
    "X Speed",
    "X Accuracy",
    "Dire Hit",
    "Guard Spec.",
    "Poké Doll",
    "Fluffy Tail",
    "Poké Toy",
    "Max Mushrooms",
    "Bottle Cap",
    "Gold Bottle Cap",
    "Nugget",
    "Big Nugget",
    "Tiny Mushroom",
    "Big Mushroom",
    "Balm Mushroom",
    "Pearl",
    "Big Pearl",
    "Pearl String",
    "Stardust",
    "Star Piece",
    "Comet Shard",
    "Shoal Salt",
    "Shoal Shell",
    "Red Shard",
    "Blue Shard",
    "Yellow Shard",
    "Green Shard",
    "Heart Scale",
    "Honey",
    "Rare Bone",
    "Odd Keystone",
    "Pretty Feather",
    "Relic Copper",
    "Relic Silver",
    "Relic Gold",
    "Relic Vase",
    "Relic Band",
    "Relic Statue",
    "Relic Crown",
    "Strange Souvenir",
    "Helix Fossil",
    "Dome Fossil",
    "Old Amber",
    "Root Fossil",
    "Claw Fossil",
    "Armor Fossil",
    "Skull Fossil",
    "Cover Fossil",
    "Plume Fossil",
    "Jaw Fossil",
    "Sail Fossil",
    "Fossilized Bird",
    "Fossilized Fish",
    "Fossilized Drake",
    "Fossilized Dino",
    "Growth Mulch",
    "Damp Mulch",
    "Stable Mulch",
    "Gooey Mulch",
    "Rich Mulch",
    "Surprise Mulch",
    "Boost Mulch",
    "Amaze Mulch",
    "Red Apricorn",
    "Blue Apricorn",
    "Yellow Apricorn",
    "Green Apricorn",
    "Pink Apricorn",
    "White Apricorn",
    "Black Apricorn",
    "Wishing Piece",
    "Galarica Twig",
    "Armorite Ore",
    "Dynite Ore",
    "Orange Mail",
    "Harbor Mail",
    "Glitter Mail",
    "Mech Mail",
    "Wood Mail",
    "Wave Mail",
    "Bead Mail",
    "Shadow Mail",
    "Tropic Mail",
    "Dream Mail",
    "Fab Mail",
    "Retro Mail",
    "Fire Stone",
    "Water Stone",
    "Thunder Stone",
    "Leaf Stone",
    "Ice Stone",
    "Sun Stone",
    "Moon Stone",
    "Shiny Stone",
    "Dusk Stone",
    "Dawn Stone",
    "Sweet Apple",
    "Tart Apple",
    "Cracked Pot",
    "Chipped Pot",
    "Galarica Cuff",
    "Galarica Wreath",
    "Dragon Scale",
    "Up-Grade",
    "Protector",
    "Electirizer",
    "Magmarizer",
    "Dubious Disc",
    "Reaper Cloth",
    "Prism Scale",
    "Whipped Dream",
    "Sachet",
    "Oval Stone",
    "Strawberry Sweet",
    "Love Sweet",
    "Berry Sweet",
    "Clover Sweet",
    "Flower Sweet",
    "Star Sweet",
    "Ribbon Sweet",
    "Everstone",
    "Red Nectar",
    "Yellow Nectar",
    "Pink Nectar",
    "Purple Nectar",
    "Flame Plate",
    "Splash Plate",
    "Zap Plate",
    "Meadow Plate",
    "Icicle Plate",
    "Fist Plate",
    "Toxic Plate",
    "Earth Plate",
    "Sky Plate",
    "Mind Plate",
    "Insect Plate",
    "Stone Plate",
    "Spooky Plate",
    "Draco Plate",
    "Dread Plate",
    "Iron Plate",
    "Pixie Plate",
    "Douse Drive",
    "Shock Drive",
    "Burn Drive",
    "Chill Drive",
    "Fire Memory",
    "Water Memory",
    "Electric Memory",
    "Grass Memory",
    "Ice Memory",
    "Fighting Memory",
    "Poison Memory",
    "Ground Memory",
    "Flying Memory",
    "Psychic Memory",
    "Bug Memory",
    "Rock Memory",
    "Ghost Memory",
    "Dragon Memory",
    "Dark Memory",
    "Steel Memory",
    "Fairy Memory",
    "Rusted Sword",
    "Rusted Shield",
    "Red Orb",
    "Blue Orb",
    "Venusaurite",
    "Charizardite X",
    "Charizardite Y",
    "Blastoisinite",
    "Beedrillite",
    "Pidgeotite",
    "Alakazite",
    "Slowbronite",
    "Gengarite",
    "Kangaskhanite",
    "Pinsirite",
    "Gyaradosite",
    "Aerodactylite",
    "Mewtwonite X",
    "Mewtwonite Y",
    "Ampharosite",
    "Steelixite",
    "Scizorite",
    "Heracronite",
    "Houndoominite",
    "Tyranitarite",
    "Sceptilite",
    "Blazikenite",
    "Swampertite",
    "Gardevoirite",
    "Sablenite",
    "Mawilite",
    "Aggronite",
    "Medichamite",
    "Manectite",
    "Sharpedonite",
    "Cameruptite",
    "Altarianite",
    "Banettite",
    "Absolite",
    "Glalitite",
    "Salamencite",
    "Metagrossite",
    "Latiasite",
    "Latiosite",
    "Lopunnite",
    "Garchompite",
    "Lucarionite",
    "Abomasite",
    "Galladite",
    "Audinite",
    "Diancite",
    "Normal Gem",
    "Fire Gem",
    "Water Gem",
    "Electric Gem",
    "Grass Gem",
    "Ice Gem",
    "Fighting Gem",
    "Poison Gem",
    "Ground Gem",
    "Flying Gem",
    "Psychic Gem",
    "Bug Gem",
    "Rock Gem",
    "Ghost Gem",
    "Dragon Gem",
    "Dark Gem",
    "Steel Gem",
    "Fairy Gem",
    "Normalium Z",
    "Firium Z",
    "Waterium Z",
    "Electrium Z",
    "Grassium Z",
    "Icium Z",
    "Fightinium Z",
    "Poisonium Z",
    "Groundium Z",
    "Flyinium Z",
    "Psychium Z",
    "Buginium Z",
    "Rockium Z",
    "Ghostium Z",
    "Dragonium Z",
    "Darkinium Z",
    "Steelium Z",
    "Fairium Z",
    "Pikanium Z",
    "Eevium Z",
    "Snorlium Z",
    "Mewnium Z",
    "Decidium Z",
    "Incinium Z",
    "Primarium Z",
    "Lycanium Z",
    "Mimikium Z",
    "Kommonium Z",
    "Tapunium Z",
    "Solganium Z",
    "Lunalium Z",
    "Marshadium Z",
    "Aloraichium Z",
    "Pikashunium Z",
    "Ultranecrozium Z",
    "Light Ball",
    "Leek",
    "Thick Club",
    "Lucky Punch",
    "Metal Powder",
    "Quick Powder",
    "Deep Sea Scale",
    "Deep Sea Tooth",
    "Soul Dew",
    "Adamant Orb",
    "Lustrous Orb",
    "Griseous Orb",
    "Sea Incense",
    "Lax Incense",
    "Odd Incense",
    "Rock Incense",
    "Full Incense",
    "Wave Incense",
    "Rose Incense",
    "Luck Incense",
    "Pure Incense",
    "Red Scarf",
    "Blue Scarf",
    "Pink Scarf",
    "Green Scarf",
    "Yellow Scarf",
    "Macho Brace",
    "Power Weight",
    "Power Bracer",
    "Power Belt",
    "Power Lens",
    "Power Band",
    "Power Anklet",
    "Silk Scarf",
    "Charcoal",
    "Mystic Water",
    "Magnet",
    "Miracle Seed",
    "Never-Melt Ice",
    "Black Belt",
    "Poison Barb",
    "Soft Sand",
    "Sharp Beak",
    "Twisted Spoon",
    "Silver Powder",
    "Hard Stone",
    "Spell Tag",
    "Dragon Fang",
    "Black Glasses",
    "Metal Coat",
    "Choice Band",
    "Choice Specs",
    "Choice Scarf",
    "Flame Orb",
    "Toxic Orb",
    "Damp Rock",
    "Heat Rock",
    "Smooth Rock",
    "Icy Rock",
    "Electric Seed",
    "Psychic Seed",
    "Misty Seed",
    "Grassy Seed",
    "Absorb Bulb",
    "Cell Battery",
    "Luminous Moss",
    "Snowball",
    "Bright Powder",
    "White Herb",
    "Exp. Share",
    "Quick Claw",
    "Soothe Bell",
    "Mental Herb",
    "King's Rock",
    "Amulet Coin",
    "Cleanse Tag",
    "Smoke Ball",
    "Focus Band",
    "Lucky Egg",
    "Scope Lens",
    "Leftovers",
    "Shell Bell",
    "Wide Lens",
    "Muscle Band",
    "Wise Glasses",
    "Expert Belt",
    "Light Clay",
    "Life Orb",
    "Power Herb",
    "Focus Sash",
    "Zoom Lens",
    "Metronome",
    "Iron Ball",
    "Lagging Tail",
    "Destiny Knot",
    "Black Sludge",
    "Grip Claw",
    "Sticky Barb",
    "Shed Shell",
    "Big Root",
    "Razor Claw",
    "Razor Fang",
    "Eviolite",
    "Float Stone",
    "Rocky Helmet",
    "Air Balloon",
    "Red Card",
    "Ring Target",
    "Binding Band",
    "Eject Button",
    "Weakness Policy",
    "Assault Vest",
    "Safety Goggles",
    "Adrenaline Orb",
    "Terrain Extender",
    "Protective Pads",
    "Throat Spray",
    "Eject Pack",
    "Heavy-Duty Boots",
    "Blunder Policy",
    "Room Service",
    "Utility Umbrella",
    "Cheri Berry",
    "Chesto Berry",
    "Pecha Berry",
    "Rawst Berry",
    "Aspear Berry",
    "Leppa Berry",
    "Oran Berry",
    "Persim Berry",
    "Lum Berry",
    "Sitrus Berry",
    "Figy Berry",
    "Wiki Berry",
    "Mago Berry",
    "Aguav Berry",
    "Iapapa Berry",
    "Razz Berry",
    "Bluk Berry",
    "Nanab Berry",
    "Wepear Berry",
    "Pinap Berry",
    "Pomeg Berry",
    "Kelpsy Berry",
    "Qualot Berry",
    "Hondew Berry",
    "Grepa Berry",
    "Tamato Berry",
    "Cornn Berry",
    "Magost Berry",
    "Rabuta Berry",
    "Nomel Berry",
    "Spelon Berry",
    "Pamtre Berry",
    "Watmel Berry",
    "Durin Berry",
    "Belue Berry",
    "Chilan Berry",
    "Occa Berry",
    "Passho Berry",
    "Wacan Berry",
    "Rindo Berry",
    "Yache Berry",
    "Chople Berry",
    "Kebia Berry",
    "Shuca Berry",
    "Coba Berry",
    "Payapa Berry",
    "Tanga Berry",
    "Charti Berry",
    "Kasib Berry",
    "Haban Berry",
    "Colbur Berry",
    "Babiri Berry",
    "Roseli Berry",
    "Liechi Berry",
    "Ganlon Berry",
    "Salac Berry",
    "Petaya Berry",
    "Apicot Berry",
    "Lansat Berry",
    "Starf Berry",
    "Enigma Berry",
    "Micle Berry",
    "Custap Berry",
    "Jaboca Berry",
    "Rowap Berry",
    "Kee Berry",
    "Maranga Berry",
    "Enigma Berry",
    "Tm01",
    "Tm02",
    "Tm03",
    "Tm04",
    "Tm05",
    "Tm06",
    "Tm07",
    "Tm08",
    "Tm09",
    "Tm10",
    "Tm11",
    "Tm12",
    "Tm13",
    "Tm14",
    "Tm15",
    "Tm16",
    "Tm17",
    "Tm18",
    "Tm19",
    "Tm20",
    "Tm21",
    "Tm22",
    "Tm23",
    "Tm24",
    "Tm25",
    "Tm26",
    "Tm27",
    "Tm28",
    "Tm29",
    "Tm30",
    "Tm31",
    "Tm32",
    "Tm33",
    "Tm34",
    "Tm35",
    "Tm36",
    "Tm37",
    "Tm38",
    "Tm39",
    "Tm40",
    "Tm41",
    "Tm42",
    "Tm43",
    "Tm44",
    "Tm45",
    "Tm46",
    "Tm47",
    "Tm48",
    "Tm49",
    "Tm50",
    "Tm51",
    "Tm52",
    "Tm53",
    "Tm54",
    "Tm55",
    "Tm56",
    "Tm57",
    "Tm58",
    "Tm59",
    "Tm60",
    "Tm61",
    "Tm62",
    "Tm63",
    "Tm64",
    "Tm65",
    "Tm66",
    "Tm67",
    "Tm68",
    "Tm69",
    "Tm70",
    "Tm71",
    "Tm72",
    "Tm73",
    "Tm74",
    "Tm75",
    "Tm76",
    "Tm77",
    "Tm78",
    "Tm79",
    "Tm80",
    "Tm81",
    "Tm82",
    "Tm83",
    "Tm84",
    "Tm85",
    "Tm86",
    "Tm87",
    "Tm88",
    "Tm89",
    "Tm90",
    "Tm91",
    "Tm92",
    "Tm93",
    "Tm94",
    "Tm95",
    "Tm96",
    "Tm97",
    "Tm98",
    "Tm99",
    "Tm100",
    "Hm01",
    "Hm02",
    "Hm03",
    "Hm04",
    "Hm05",
    "Hm06",
    "Hm07",
    "Hm08",
    "Oval Charm",
    "Shiny Charm",
    "Catching Charm",
    "Exp. Charm",
    "Rotom Catalog",
    "Gracidea",
    "Reveal Glass",
    "Dna Splicers",
    "Zygarde Cube",
    "Prison Bottle",
    "N-Solarizer",
    "N-Lunarizer",
    "Reins Of Unity",
    "Mega Ring",
    "Z-Power Ring",
    "Dynamax Band",
    "Bike",
    "Mach Bike",
    "Acro Bike",
    "Old Rod",
    "Good Rod",
    "Super Rod",
    "Dowsing Machine",
    "Town Map",
    "Vs. Seeker",
    "Tm Case",
    "Berry Pouch",
    "ウエ Box Link",
    "Coin Case",
    "Powder Jar",
    "Wailmer Pail",
    "Poké Radar",
    "オカキクケ Case",
    "Soot Sack",
    "Poké Flute",
    "Fame Checker",
    "Teachy Tv",
    "S.S. Ticket",
    "Eon Ticket",
    "Mystic Ticket",
    "Aurora Ticket",
    "Old Sea Map",
    "Letter",
    "Devon Parts",
    "Go-Goggles",
    "Devon Scope",
    "Basement Key",
    "Scanner",
    "Storage Key",
    "Key To Room 1",
    "Key To Room 2",
    "Key To Room 4",
    "Key To Room 6",
    "Meteorite",
    "Magma Emblem",
    "Contest Pass",
    "Parcel",
    "Secret Key",
    "Bike Voucher",
    "Gold Teeth",
    "Card Key",
    "Lift Key",
    "Silph Scope",
    "Tri-Pass",
    "Rainbow Pass",
    "Tea",
    "Ruby",
    "Sapphire",
    "Ability Shield",
    "Clear Amulet",
    "Punching Glove",
    "Covert Cloak",
    "Loaded Dice",
    "Auspicious Armor",
    "Booster Energy",
    "Big Bamboo Shoot",
    "Gimmighoul Coin",
    "Leader’S Crest",
    "Malicious Armor",
    "Mirror Herb",
    "Scroll Of Darkness",
    "Scroll Of Waters",
    "Tera Orb",
    "Tiny Bamboo Shoot",
    "Bug Tera Shard",
    "Dark Tera Shard",
    "Dragon Tera Shard",
    "Electric Tera Shard",
    "Fairy Tera Shard",
    "Fighting Tera Shard",
    "Fire Tera Shard",
    "Flying Tera Shard",
    "Ghost Tera Shard",
    "Grass Tera Shard",
    "Ground Tera Shard",
    "Ice Tera Shard",
    "Normal Tera Shard",
    "Poison Tera Shard",
    "Psychic Tera Shard",
    "Rock Tera Shard",
    "Steel Tera Shard",
    "Water Tera Shard",
    "Adamant Crystal",
    "Griseous Core",
    "Lustrous Globe",
    "Black Augurite",
    "Linking Cord",
    "Peat Block",
    "Berserk Gene",
    "Fairy Feather",
    "Syrupy Apple",
    "Unremarkable Teacup",
    "Masterpiece Teacup",
    "Cornerstone Mask",
    "Wellspring Mask",
    "Hearthflame Mask",
    "Health Mochi",
    "Muscle Mochi",
    "Resist Mochi",
    "Genius Mochi",
    "Clever Mochi",
    "Swift Mochi",
    "Fresh-Start Mochi",
    "Glimmering Charm",
    "Metal Alloy",
    "Stellar Tera Shard",
    "Jubilife Muffin",
    "Remedy",
    "Fine Remedy",
    "Superb Remedy",
    "Aux Evasion",
    "Aux Guard",
    "Aux Power",
    "Aux Powerguard",
    "Choice Dumpling",
    "Swap Snack",
    "Twice-Spiced Radish",
    "Pokéshi Doll",
    "Strange Ball",
    "Clefablite",
    "Victreebelite",
    "Starminite",
    "Dragoninite",
    "Meganiumite",
    "Feraligite",
    "Skarmorite",
    "Froslassite",
    "Emboarite",
    "Excadrite",
    "Scolipite",
    "Scraftinite",
    "Eelektrossite",
    "Chandelurite",
    "Chesnaughtite",
    "Delphoxite",
    "Greninjite",
    "Pyroarite",
    "Floettite",
    "Malamarite",
    "Barbaracite",
    "Dragalgite",
    "Hawluchanite",
    "Zygardite",
    "Drampanite",
    "Falinksite",
    "Heatranite",
    "Darkranite",
    "Zeraorite",
    "Raichunite X",
    "Raichunite Y",
    "Chimechite",
    "Absolite Z",
    "Staraptite",
    "Garchompite Z",
    "Lucarionite Z",
    "Golurkite",
    "Meowsticite",
    "Crabominite",
    "Golisopite",
    "Magearnite",
    "Scovillainite",
    "Baxcalibrite",
    "Tatsugirinite",
    "Glimmoranite",
    "Gb Player",
    "Gs Ball",
    "Growth Mulch",
    "Exp. Share S",
    "Healing Heart",
    "Infin. Repel",
    "Rarecandy Box",
    "Clear Bell",
    "Lost Item",
    "Machine Part",
    "Mystery Egg",
    "Pass",
    "Rainbow Wing",
    "Red Scale",
    "Secretpotion",
    "Silver Wing",
    "Tidal Bell",
    "Radio",
    "Squirtbottle",
    "Rm. 1 Key",
    "Rm. 2 Key",
    "Rm. 4 Key",
    "Rm. 6 Key",
    "Sitrus Berry",
    "????????",
    "????????",
    "Azure Flute"
  ],
  "abilities": [
    "-------",
    "Stench",
    "Drizzle",
    "Speed Boost",
    "Battle Armor",
    "Sturdy",
    "Damp",
    "Limber",
    "Sand Veil",
    "Static",
    "Volt Absorb",
    "Water Absorb",
    "Oblivious",
    "Cloud Nine",
    "Compound Eyes",
    "Insomnia",
    "Color Change",
    "Immunity",
    "Flash Fire",
    "Shield Dust",
    "Own Tempo",
    "Suction Cups",
    "Intimidate",
    "Shadow Tag",
    "Rough Skin",
    "Wonder Guard",
    "Levitate",
    "Effect Spore",
    "Synchronize",
    "Clear Body",
    "Natural Cure",
    "Lightning Rod",
    "Serene Grace",
    "Swift Swim",
    "Chlorophyll",
    "Illuminate",
    "Trace",
    "Huge Power",
    "Poison Point",
    "Inner Focus",
    "Magma Armor",
    "Water Veil",
    "Magnet Pull",
    "Soundproof",
    "Rain Dish",
    "Sand Stream",
    "Pressure",
    "Thick Fat",
    "Early Bird",
    "Flame Body",
    "Run Away",
    "Keen Eye",
    "Hyper Cutter",
    "Pickup",
    "Truant",
    "Hustle",
    "Cute Charm",
    "Plus",
    "Minus",
    "Forecast",
    "Sticky Hold",
    "Shed Skin",
    "Guts",
    "Marvel Scale",
    "Liquid Ooze",
    "Overgrow",
    "Blaze",
    "Torrent",
    "Swarm",
    "Rock Head",
    "Drought",
    "Arena Trap",
    "Vital Spirit",
    "White Smoke",
    "Pure Power",
    "Shell Armor",
    "Air Lock",
    "Tangled Feet",
    "Motor Drive",
    "Rivalry",
    "Steadfast",
    "Snow Cloak",
    "Gluttony",
    "Anger Point",
    "Unburden",
    "Heatproof",
    "Simple",
    "Dry Skin",
    "Download",
    "Iron Fist",
    "Poison Heal",
    "Adaptability",
    "Skill Link",
    "Hydration",
    "Solar Power",
    "Quick Feet",
    "Normalize",
    "Sniper",
    "Magic Guard",
    "No Guard",
    "Stall",
    "Technician",
    "Leaf Guard",
    "Klutz",
    "Mold Breaker",
    "Super Luck",
    "Aftermath",
    "Anticipation",
    "Forewarn",
    "Unaware",
    "Tinted Lens",
    "Filter",
    "Slow Start",
    "Scrappy",
    "Storm Drain",
    "Ice Body",
    "Solid Rock",
    "Snow Warning",
    "Honey Gather",
    "Frisk",
    "Reckless",
    "Multitype",
    "Flower Gift",
    "Bad Dreams",
    "Pickpocket",
    "Sheer Force",
    "Contrary",
    "Unnerve",
    "Defiant",
    "Defeatist",
    "Cursed Body",
    "Healer",
    "Friend Guard",
    "Weak Armor",
    "Heavy Metal",
    "Light Metal",
    "Multiscale",
    "Toxic Boost",
    "Flare Boost",
    "Harvest",
    "Telepathy",
    "Moody",
    "Overcoat",
    "Poison Touch",
    "Regenerator",
    "Big Pecks",
    "Sand Rush",
    "Wonder Skin",
    "Analytic",
    "Illusion",
    "Imposter",
    "Infiltrator",
    "Mummy",
    "Moxie",
    "Justified",
    "Rattled",
    "Magic Bounce",
    "Sap Sipper",
    "Prankster",
    "Sand Force",
    "Iron Barbs",
    "Zen Mode",
    "Victory Star",
    "Turboblaze",
    "Teravolt",
    "Aroma Veil",
    "Flower Veil",
    "Cheek Pouch",
    "Protean",
    "Fur Coat",
    "Magician",
    "Bulletproof",
    "Competitive",
    "Strong Jaw",
    "Refrigerate",
    "Sweet Veil",
    "Stance Change",
    "Gale Wings",
    "Mega Launcher",
    "Grass Pelt",
    "Symbiosis",
    "Tough Claws",
    "Pixilate",
    "Gooey",
    "Aerilate",
    "Parental Bond",
    "Dark Aura",
    "Fairy Aura",
    "Aura Break",
    "Primordial Sea",
    "Desolate Land",
    "Delta Stream",
    "Stamina",
    "Wimp Out",
    "Emergency Exit",
    "Water Compaction",
    "Merciless",
    "Shields Down",
    "Stakeout",
    "Water Bubble",
    "Steelworker",
    "Berserk",
    "Slush Rush",
    "Long Reach",
    "Liquid Voice",
    "Triage",
    "Galvanize",
    "Surge Surfer",
    "Schooling",
    "Disguise",
    "Battle Bond",
    "Power Construct",
    "Corrosion",
    "Comatose",
    "Queenly Majesty",
    "Innards Out",
    "Dancer",
    "Battery",
    "Fluffy",
    "Dazzling",
    "Soul-Heart",
    "Tangling Hair",
    "Receiver",
    "Power of Alchemy",
    "Beast Boost",
    "RKS System",
    "Electric Surge",
    "Psychic Surge",
    "Misty Surge",
    "Grassy Surge",
    "Full Metal Body",
    "Shadow Shield",
    "Prism Armor",
    "Neuroforce",
    "Intrepid Sword",
    "Dauntless Shield",
    "Libero",
    "Ball Fetch",
    "Cotton Down",
    "Propeller Tail",
    "Mirror Armor",
    "Gulp Missile",
    "Stalwart",
    "Steam Engine",
    "Punk Rock",
    "Sand Spit",
    "Ice Scales",
    "Ripen",
    "Ice Face",
    "Power Spot",
    "Mimicry",
    "Screen Cleaner",
    "Steely Spirit",
    "Perish Body",
    "Wandering Spirit",
    "Gorilla Tactics",
    "Neutralizing Gas",
    "Pastel Veil",
    "Hunger Switch",
    "Quick Draw",
    "Unseen Fist",
    "Curious Medicine",
    "Transistor",
    "Dragon's Maw",
    "Chilling Neigh",
    "Grim Neigh",
    "As One",
    "As One",
    "Lingering Aroma",
    "Seed Sower",
    "Thermal Exchange",
    "Anger Shell",
    "Purifying Salt",
    "Well-Baked Body",
    "Wind Rider",
    "Guard Dog",
    "Rocky Payload",
    "Wind Power",
    "Zero to Hero",
    "Commander",
    "Electromorphosis",
    "Protosynthesis",
    "Quark Drive",
    "Good as Gold",
    "Vessel of Ruin",
    "Sword of Ruin",
    "Tablets of Ruin",
    "Beads of Ruin",
    "Orichalcum Pulse",
    "Hadron Engine",
    "Opportunist",
    "Cud Chew",
    "Sharpness",
    "Supreme Overlord",
    "Costar",
    "Toxic Debris",
    "Armor Tail",
    "Earth Eater",
    "Mycelium Might",
    "Hospitality",
    "Mind's Eye",
    "Embody Aspect",
    "Embody Aspect",
    "Embody Aspect",
    "Embody Aspect",
    "Toxic Chain",
    "Supersweet Syrup",
    "Tera Shift",
    "Tera Shell",
    "Teraform Zero",
    "Poison Puppeteer"
  ],
  "legendaryAbilities": {
    "144": "Water Veil",
    "145": "Lightning Rod",
    "146": "Flame Body",
    "150": "Synchronize",
    "243": "Volt Absorb",
    "244": "Flash Fire",
    "245": "Water Absorb",
    "249": "Marvel Scale",
    "250": "Serene Grace"
  },
  "charmap": {
    "0": " ",
    "1": "À",
    "2": "Á",
    "3": "Â",
    "4": "Ç",
    "5": "È",
    "6": "É",
    "7": "Ê",
    "8": "Ë",
    "9": "Ì",
    "11": "Î",
    "12": "Ï",
    "13": "Ò",
    "14": "Ó",
    "15": "Ô",
    "16": "Œ",
    "17": "Ù",
    "18": "Ú",
    "19": "Û",
    "20": "Ñ",
    "21": "ß",
    "22": "à",
    "23": "á",
    "25": "ç",
    "26": "è",
    "27": "é",
    "28": "ê",
    "29": "ë",
    "30": "ì",
    "32": "î",
    "33": "ï",
    "34": "ò",
    "35": "ó",
    "36": "ô",
    "37": "œ",
    "38": "ù",
    "39": "ú",
    "40": "û",
    "41": "ñ",
    "42": "º",
    "43": "ª",
    "45": "&",
    "46": "+",
    "53": "=",
    "54": ";",
    "57": "~",
    "81": "¿",
    "82": "¡",
    "90": "Í",
    "91": "%",
    "92": "(",
    "93": ")",
    "104": "â",
    "111": "í",
    "133": "<",
    "134": ">",
    "161": "0",
    "162": "1",
    "163": "2",
    "164": "3",
    "165": "4",
    "166": "5",
    "167": "6",
    "168": "7",
    "169": "8",
    "170": "9",
    "171": "!",
    "172": "?",
    "173": ".",
    "174": "-",
    "175": "·",
    "176": "…",
    "177": "“",
    "178": "”",
    "179": "‘",
    "180": "’",
    "181": "♂",
    "182": "♀",
    "183": "¥",
    "184": ",",
    "185": "×",
    "186": "/",
    "187": "A",
    "188": "B",
    "189": "C",
    "190": "D",
    "191": "E",
    "192": "F",
    "193": "G",
    "194": "H",
    "195": "I",
    "196": "J",
    "197": "K",
    "198": "L",
    "199": "M",
    "200": "N",
    "201": "O",
    "202": "P",
    "203": "Q",
    "204": "R",
    "205": "S",
    "206": "T",
    "207": "U",
    "208": "V",
    "209": "W",
    "210": "X",
    "211": "Y",
    "212": "Z",
    "213": "a",
    "214": "b",
    "215": "c",
    "216": "d",
    "217": "e",
    "218": "f",
    "219": "g",
    "220": "h",
    "221": "i",
    "222": "j",
    "223": "k",
    "224": "l",
    "225": "m",
    "226": "n",
    "227": "o",
    "228": "p",
    "229": "q",
    "230": "r",
    "231": "s",
    "232": "t",
    "233": "u",
    "234": "v",
    "235": "w",
    "236": "x",
    "237": "y",
    "238": "z",
    "239": "▶",
    "240": ":",
    "241": "Ä",
    "242": "Ö",
    "243": "Ü",
    "244": "ä",
    "245": "ö",
    "246": "ü",
    "255": "$",
    "10": "こ",
    "24": "ね",
    "31": "ま",
    "44": "わ",
    "47": "ぁ",
    "48": "ぃ",
    "49": "ぅ",
    "50": "ぇ",
    "51": "ぉ",
    "52": "ゃ",
    "55": "が",
    "56": "ぎ",
    "58": "げ",
    "59": "ご",
    "60": "ざ",
    "61": "じ",
    "62": "ず",
    "63": "ぜ",
    "64": "ぞ",
    "65": "だ",
    "66": "ぢ",
    "67": "づ",
    "68": "で",
    "69": "ど",
    "70": "ば",
    "71": "び",
    "72": "ぶ",
    "73": "べ",
    "74": "ぼ",
    "75": "ぱ",
    "76": "ぴ",
    "77": "ぷ",
    "78": "ぺ",
    "79": "ぽ",
    "80": "っ",
    "83": "ウ",
    "84": "エ",
    "85": "オ",
    "86": "カ",
    "87": "キ",
    "88": "ク",
    "89": "ケ",
    "94": "セ",
    "95": "ソ",
    "96": "タ",
    "97": "チ",
    "98": "ツ",
    "99": "テ",
    "100": "ト",
    "101": "ナ",
    "102": "ニ",
    "103": "ヌ",
    "105": "ノ",
    "106": "ハ",
    "107": "ヒ",
    "108": "フ",
    "109": "ヘ",
    "110": "ホ",
    "112": "ミ",
    "113": "ム",
    "114": "メ",
    "115": "モ",
    "116": "ヤ",
    "117": "ユ",
    "118": "ヨ",
    "119": "ラ",
    "120": "リ",
    "121": "ル",
    "122": "レ",
    "123": "ロ",
    "124": "ワ",
    "125": "ヲ",
    "126": "ン",
    "127": "ァ",
    "128": "ィ",
    "129": "ゥ",
    "130": "ェ",
    "131": "ォ",
    "132": "ャ",
    "135": "ガ",
    "136": "ギ",
    "137": "グ",
    "138": "ゲ",
    "139": "ゴ",
    "140": "ザ",
    "141": "ジ",
    "142": "ズ",
    "143": "ゼ",
    "144": "ゾ",
    "145": "ダ",
    "146": "ヂ",
    "147": "ヅ",
    "148": "デ",
    "149": "ド",
    "150": "バ",
    "151": "ビ",
    "152": "ブ",
    "153": "ベ",
    "154": "ボ",
    "155": "パ",
    "156": "ピ",
    "157": "プ",
    "158": "ペ",
    "159": "ポ",
    "160": "ッ",
    "250": " ",
    "251": " ",
    "254": " "
  },
  "natures": [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Bold",
    "Docile",
    "Relaxed",
    "Impish",
    "Lax",
    "Timid",
    "Hasty",
    "Serious",
    "Jolly",
    "Naive",
    "Modest",
    "Mild",
    "Quiet",
    "Bashful",
    "Rash",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful",
    "Quirky"
  ],
  "experienceTables": [
    [
      0,
      1,
      8,
      27,
      64,
      125,
      216,
      343,
      512,
      729,
      1000,
      1331,
      1728,
      2197,
      2744,
      3375,
      4096,
      4913,
      5832,
      6859,
      8000,
      9261,
      10648,
      12167,
      13824,
      15625,
      17576,
      19683,
      21952,
      24389,
      27000,
      29791,
      32768,
      35937,
      39304,
      42875,
      46656,
      50653,
      54872,
      59319,
      64000,
      68921,
      74088,
      79507,
      85184,
      91125,
      97336,
      103823,
      110592,
      117649,
      125000,
      132651,
      140608,
      148877,
      157464,
      166375,
      175616,
      185193,
      195112,
      205379,
      216000,
      226981,
      238328,
      250047,
      262144,
      274625,
      287496,
      300763,
      314432,
      328509,
      343000,
      357911,
      373248,
      389017,
      405224,
      421875,
      438976,
      456533,
      474552,
      493039,
      512000,
      531441,
      551368,
      571787,
      592704,
      614125,
      636056,
      658503,
      681472,
      704969,
      729000,
      753571,
      778688,
      804357,
      830584,
      857375,
      884736,
      912673,
      941192,
      970299,
      1000000
    ],
    [
      0,
      1,
      15,
      52,
      122,
      237,
      406,
      637,
      942,
      1326,
      1800,
      2369,
      3041,
      3822,
      4719,
      5737,
      6881,
      8155,
      9564,
      11111,
      12800,
      14632,
      16610,
      18737,
      21012,
      23437,
      26012,
      28737,
      31610,
      34632,
      37800,
      41111,
      44564,
      48155,
      51881,
      55737,
      59719,
      63822,
      68041,
      72369,
      76800,
      81326,
      85942,
      90637,
      95406,
      100237,
      105122,
      110052,
      115015,
      120001,
      125000,
      131324,
      137795,
      144410,
      151165,
      158056,
      165079,
      172229,
      179503,
      186894,
      194400,
      202013,
      209728,
      217540,
      225443,
      233431,
      241496,
      249633,
      257834,
      267406,
      276458,
      286328,
      296358,
      305767,
      316074,
      326531,
      336255,
      346965,
      357812,
      367807,
      378880,
      390077,
      400293,
      411686,
      423190,
      433572,
      445239,
      457001,
      467489,
      479378,
      491346,
      501878,
      513934,
      526049,
      536557,
      548720,
      560922,
      571333,
      583539,
      591882,
      600000
    ],
    [
      0,
      1,
      4,
      13,
      32,
      65,
      112,
      178,
      276,
      393,
      540,
      745,
      967,
      1230,
      1591,
      1957,
      2457,
      3046,
      3732,
      4526,
      5440,
      6482,
      7666,
      9003,
      10506,
      12187,
      14060,
      16140,
      18439,
      20974,
      23760,
      26811,
      30146,
      33780,
      37731,
      42017,
      46656,
      50653,
      55969,
      60505,
      66560,
      71677,
      78533,
      84277,
      91998,
      98415,
      107069,
      114205,
      123863,
      131766,
      142500,
      151222,
      163105,
      172697,
      185807,
      196322,
      210739,
      222231,
      238036,
      250562,
      267840,
      281456,
      300293,
      315059,
      335544,
      351520,
      373744,
      390991,
      415050,
      433631,
      459620,
      479600,
      507617,
      529063,
      559209,
      582187,
      614566,
      639146,
      673863,
      700115,
      737280,
      765275,
      804997,
      834809,
      877201,
      908905,
      954084,
      987754,
      1035837,
      1071552,
      1122660,
      1160499,
      1214753,
      1254796,
      1312322,
      1354652,
      1415577,
      1460276,
      1524731,
      1571884,
      1640000
    ],
    [
      0,
      1,
      9,
      57,
      96,
      135,
      179,
      236,
      314,
      419,
      560,
      742,
      973,
      1261,
      1612,
      2035,
      2535,
      3120,
      3798,
      4575,
      5460,
      6458,
      7577,
      8825,
      10208,
      11735,
      13411,
      15244,
      17242,
      19411,
      21760,
      24294,
      27021,
      29949,
      33084,
      36435,
      40007,
      43808,
      47846,
      52127,
      56660,
      61450,
      66505,
      71833,
      77440,
      83335,
      89523,
      96012,
      102810,
      109923,
      117360,
      125126,
      133229,
      141677,
      150476,
      159635,
      169159,
      179056,
      189334,
      199999,
      211060,
      222522,
      234393,
      246681,
      259392,
      272535,
      286115,
      300140,
      314618,
      329555,
      344960,
      360838,
      377197,
      394045,
      411388,
      429235,
      447591,
      466464,
      485862,
      505791,
      526260,
      547274,
      568841,
      590969,
      613664,
      636935,
      660787,
      685228,
      710266,
      735907,
      762160,
      789030,
      816525,
      844653,
      873420,
      902835,
      932903,
      963632,
      995030,
      1027103,
      1059860
    ],
    [
      0,
      1,
      6,
      21,
      51,
      100,
      172,
      274,
      409,
      583,
      800,
      1064,
      1382,
      1757,
      2195,
      2700,
      3276,
      3930,
      4665,
      5487,
      6400,
      7408,
      8518,
      9733,
      11059,
      12500,
      14060,
      15746,
      17561,
      19511,
      21600,
      23832,
      26214,
      28749,
      31443,
      34300,
      37324,
      40522,
      43897,
      47455,
      51200,
      55136,
      59270,
      63605,
      68147,
      72900,
      77868,
      83058,
      88473,
      94119,
      100000,
      106120,
      112486,
      119101,
      125971,
      133100,
      140492,
      148154,
      156089,
      164303,
      172800,
      181584,
      190662,
      200037,
      209715,
      219700,
      229996,
      240610,
      251545,
      262807,
      274400,
      286328,
      298598,
      311213,
      324179,
      337500,
      351180,
      365226,
      379641,
      394431,
      409600,
      425152,
      441094,
      457429,
      474163,
      491300,
      508844,
      526802,
      545177,
      563975,
      583200,
      602856,
      622950,
      643485,
      664467,
      685900,
      707788,
      730138,
      752953,
      776239,
      800000
    ],
    [
      0,
      1,
      10,
      33,
      80,
      156,
      270,
      428,
      640,
      911,
      1250,
      1663,
      2160,
      2746,
      3430,
      4218,
      5120,
      6141,
      7290,
      8573,
      10000,
      11576,
      13310,
      15208,
      17280,
      19531,
      21970,
      24603,
      27440,
      30486,
      33750,
      37238,
      40960,
      44921,
      49130,
      53593,
      58320,
      63316,
      68590,
      74148,
      80000,
      86151,
      92610,
      99383,
      106480,
      113906,
      121670,
      129778,
      138240,
      147061,
      156250,
      165813,
      175760,
      186096,
      196830,
      207968,
      219520,
      231491,
      243890,
      256723,
      270000,
      283726,
      297910,
      312558,
      327680,
      343281,
      359370,
      375953,
      393040,
      410636,
      428750,
      447388,
      466560,
      486271,
      506530,
      527343,
      548720,
      570666,
      593190,
      616298,
      640000,
      664301,
      689210,
      714733,
      740880,
      767656,
      795070,
      823128,
      851840,
      881211,
      911250,
      941963,
      973360,
      1005446,
      1038230,
      1071718,
      1105920,
      1140841,
      1176490,
      1212873,
      1250000
    ],
    [
      0,
      1,
      8,
      27,
      64,
      125,
      216,
      343,
      512,
      729,
      1000,
      1331,
      1728,
      2197,
      2744,
      3375,
      4096,
      4913,
      5832,
      6859,
      8000,
      9261,
      10648,
      12167,
      13824,
      15625,
      17576,
      19683,
      21952,
      24389,
      27000,
      29791,
      32768,
      35937,
      39304,
      42875,
      46656,
      50653,
      54872,
      59319,
      64000,
      68921,
      74088,
      79507,
      85184,
      91125,
      97336,
      103823,
      110592,
      117649,
      125000,
      132651,
      140608,
      148877,
      157464,
      166375,
      175616,
      185193,
      195112,
      205379,
      216000,
      226981,
      238328,
      250047,
      262144,
      274625,
      287496,
      300763,
      314432,
      328509,
      343000,
      357911,
      373248,
      389017,
      405224,
      421875,
      438976,
      456533,
      474552,
      493039,
      512000,
      531441,
      551368,
      571787,
      592704,
      614125,
      636056,
      658503,
      681472,
      704969,
      729000,
      753571,
      778688,
      804357,
      830584,
      857375,
      884736,
      912673,
      941192,
      970299,
      1000000
    ],
    [
      0,
      1,
      8,
      27,
      64,
      125,
      216,
      343,
      512,
      729,
      1000,
      1331,
      1728,
      2197,
      2744,
      3375,
      4096,
      4913,
      5832,
      6859,
      8000,
      9261,
      10648,
      12167,
      13824,
      15625,
      17576,
      19683,
      21952,
      24389,
      27000,
      29791,
      32768,
      35937,
      39304,
      42875,
      46656,
      50653,
      54872,
      59319,
      64000,
      68921,
      74088,
      79507,
      85184,
      91125,
      97336,
      103823,
      110592,
      117649,
      125000,
      132651,
      140608,
      148877,
      157464,
      166375,
      175616,
      185193,
      195112,
      205379,
      216000,
      226981,
      238328,
      250047,
      262144,
      274625,
      287496,
      300763,
      314432,
      328509,
      343000,
      357911,
      373248,
      389017,
      405224,
      421875,
      438976,
      456533,
      474552,
      493039,
      512000,
      531441,
      551368,
      571787,
      592704,
      614125,
      636056,
      658503,
      681472,
      704969,
      729000,
      753571,
      778688,
      804357,
      830584,
      857375,
      884736,
      912673,
      941192,
      970299,
      1000000
    ]
  ]
};
if (typeof module === "object" && module.exports) module.exports = heartAndSoulSaveConstants;
