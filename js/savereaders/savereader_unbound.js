(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./save_constants/unbound_2_1_constants.js"));
    return;
  }

  var api = factory(root.unbound21SaveConstants || null);
  root.parseUnboundSaveFile = api.parseUnboundSaveFile;
})(typeof globalThis !== "undefined" ? globalThis : this, function (constants) {
  "use strict";

  if (!constants) {
    throw new Error("Unbound 2.1 save constants are required.");
  }

  var CFRU_LAYOUT = constants.CFRU_LAYOUT;
  var SAVE_SIZE = CFRU_LAYOUT.saveSize;
  var BLOCK_SIZE = CFRU_LAYOUT.blockSize;
  var BLOCK_DATA_SIZE = CFRU_LAYOUT.blockDataSize;
  var BLOCK_ID_OFFSET = CFRU_LAYOUT.blockIdOffset;
  var CHECKSUM_OFFSET = CFRU_LAYOUT.checksumOffset;
  var FILE_SIGNATURE_OFFSET = CFRU_LAYOUT.fileSignatureOffset;
  var SAVE_INDEX_OFFSET = CFRU_LAYOUT.saveIndexOffset;
  var SUPPORTED_FILE_SIGNATURE = constants.FILE_SIGNATURE >>> 0;
  var MONS_PER_BOX = CFRU_LAYOUT.monsPerBox;
  var COMPRESSED_MON_SIZE = CFRU_LAYOUT.compressedMonSize;
  var PARTY_STRUCT_SIZE = CFRU_LAYOUT.partyStructSize;
  var G3_SECTOR_DATA_SIZE = BLOCK_DATA_SIZE;
  var G3_MAIN_SECTION_COUNT = 14;
  var G3_FULL_SAVE_SIZE = 0x20000;
  var G3_FLASHCART_SAVE_SIZE = 0x20010;
  var MAX_LEVEL = 100;
  var UNSUPPORTED_VERSION_MESSAGE = "Only Pokemon Unbound 2.1.x non-randomized saves are supported.";
  var RANDOMIZED_SAVE_MESSAGE = "Randomized Pokemon Unbound 2.1 saves are not supported yet.";
  var INVALID_SAVE_MESSAGE = "Unable to parse this Unbound save.";

  var ORDER_FORMATS = [
    [1, 2, 3, 4],
    [1, 2, 4, 3],
    [1, 3, 2, 4],
    [1, 3, 4, 2],
    [1, 4, 2, 3],
    [1, 4, 3, 2],
    [2, 1, 3, 4],
    [2, 1, 4, 3],
    [2, 3, 1, 4],
    [2, 3, 4, 1],
    [2, 4, 1, 3],
    [2, 4, 3, 1],
    [3, 1, 2, 4],
    [3, 1, 4, 2],
    [3, 2, 1, 4],
    [3, 2, 4, 1],
    [3, 4, 1, 2],
    [3, 4, 2, 1],
    [4, 1, 2, 3],
    [4, 1, 3, 2],
    [4, 2, 1, 3],
    [4, 2, 3, 1],
    [4, 3, 1, 2],
    [4, 3, 2, 1]
  ];

  // Forms that should normalize back to their out-of-battle species.
  var BASE_FORMS_OF_BANNED_SPECIES = {
    SPECIES_CHERRIM_SUN: "SPECIES_CHERRIM",
    SPECIES_HIPPOPOTAS_F: "SPECIES_HIPPOPOTAS",
    SPECIES_HIPPOWDON_F: "SPECIES_HIPPOWDON",
    SPECIES_UNFEZANT_F: "SPECIES_UNFEZANT",
    SPECIES_DARMANITANZEN: "SPECIES_DARMANITAN",
    SPECIES_DARMANITAN_G_ZEN: "SPECIES_DARMANITAN_G",
    SPECIES_FRILLISH_F: "SPECIES_FRILLISH",
    SPECIES_JELLICENT_F: "SPECIES_JELLICENT",
    SPECIES_MELOETTA_PIROUETTE: "SPECIES_MELOETTA",
    SPECIES_AEGISLASH_BLADE: "SPECIES_AEGISLASH",
    SPECIES_ASHGRENINJA: "SPECIES_GRENINJA",
    SPECIES_PYROAR_FEMALE: "SPECIES_PYROAR",
    SPECIES_XERNEAS_NATURAL: "SPECIES_XERNEAS",
    SPECIES_ZYGARDE_COMPLETE: "SPECIES_ZYGARDE",
    SPECIES_WISHIWASHI_S: "SPECIES_WISHIWASHI",
    SPECIES_MIMIKYU_BUSTED: "SPECIES_MIMIKYU",
    SPECIES_NECROZMA_ULTRA: "SPECIES_NECROZMA",
    SPECIES_CRAMORANT_GULPING: "SPECIES_CRAMORANT",
    SPECIES_CRAMORANT_GORGING: "SPECIES_CRAMORANT",
    SPECIES_EISCUE_NOICE: "SPECIES_EISCUE",
    SPECIES_MORPEKO_HANGRY: "SPECIES_MORPEKO",
    SPECIES_ZACIAN_CROWNED: "SPECIES_ZACIAN",
    SPECIES_ZAMAZENTA_CROWNED: "SPECIES_ZAMAZENTA",
    SPECIES_ETERNATUS_ETERNAMAX: "SPECIES_ETERNATUS",
    SPECIES_PALAFIN_HERO: "SPECIES_PALAFIN",
    SPECIES_TERAPAGOS_TERASTAL: "SPECIES_TERAPAGOS",
    SPECIES_TERAPAGOS_STELLAR: "SPECIES_TERAPAGOS",
    SPECIES_SHAYMIN_SKY: "SPECIES_SHAYMIN"
  };

  function readU8(bytes, offset) {
    return bytes[offset] >>> 0;
  }

  function readU16LE(bytes, offset) {
    return ((bytes[offset] || 0) | ((bytes[offset + 1] || 0) << 8)) >>> 0;
  }

  function readU32LE(bytes, offset) {
    return (((bytes[offset] || 0))
      | ((bytes[offset + 1] || 0) << 8)
      | ((bytes[offset + 2] || 0) << 16)
      | ((bytes[offset + 3] || 0) << 24)) >>> 0;
  }

  function readUIntLE(bytes, offset, length) {
    var value = 0;
    var factor = 1;
    for (var i = 0; i < length; i++) {
      value += (bytes[offset + i] || 0) * factor;
      factor *= 256;
    }
    return value;
  }

  function compareCounters(counterA, counterB) {
    if (counterA === 0xFFFFFFFF && counterB !== 0xFFFFFFFE) {
      return -1;
    }
    if (counterB === 0xFFFFFFFF && counterA !== 0xFFFFFFFE) {
      return 1;
    }
    if (counterA > counterB) {
      return 1;
    }
    if (counterA < counterB) {
      return -1;
    }
    return 0;
  }

  function normalizeSpeciesDefine(speciesDefine) {
    if (!speciesDefine || speciesDefine === "SPECIES_NONE") {
      return null;
    }
    if (BASE_FORMS_OF_BANNED_SPECIES[speciesDefine]) {
      return BASE_FORMS_OF_BANNED_SPECIES[speciesDefine];
    }
    if (speciesDefine.indexOf("SPECIES_UNOWN") === 0) {
      return "SPECIES_UNOWN";
    }
    return speciesDefine;
  }

  function displayNameForSpecies(speciesDefine) {
    if (!speciesDefine) {
      return null;
    }
    return constants.SPECIES_DISPLAY_NAMES_BY_DEFINE[speciesDefine] || speciesDefine;
  }

  function displayNameForItem(itemDefine) {
    if (!itemDefine || itemDefine === "ITEM_NONE") {
      return null;
    }
    return constants.ITEM_DISPLAY_NAMES_BY_DEFINE[itemDefine] || itemDefine;
  }

  function displayNameForMove(moveDefine) {
    if (!moveDefine || moveDefine === "MOVE_NONE") {
      return null;
    }
    return constants.MOVE_DISPLAY_NAMES_BY_DEFINE[moveDefine] || moveDefine;
  }

  function displayNameForAbility(abilityDefine) {
    if (!abilityDefine || abilityDefine === "ABILITY_NONE") {
      return null;
    }
    return constants.ABILITY_DISPLAY_NAMES_BY_DEFINE[abilityDefine] || abilityDefine;
  }

  function decodeCharBytes(bytes, offset, length) {
    var out = [];
    for (var i = 0; i < length; i++) {
      var value = bytes[offset + i] >>> 0;
      if (value === 0xFF) {
        break;
      }
      var mapped = constants.CHAR_MAP[String(value)];
      out.push(typeof mapped === "string" ? mapped : "");
    }
    return out.join("").replace(/\u0000/g, "").trim();
  }

  function calculateChecksum(saveBlock, saveBlockId) {
    var size = BLOCK_DATA_SIZE;
    if (saveBlockId === 0) {
      size = 0xF24;
    } else if (saveBlockId === 4) {
      size = 0xD98;
    } else if (saveBlockId === 13) {
      size = 0x450;
    }

    var checksum = 0;
    for (var i = 0; i < size; i += 4) {
      checksum += readU32LE(saveBlock, i);
      while (checksum > 0xFFFFFFFF) {
        checksum -= 0x100000000;
      }
    }

    var upperBits = (checksum >>> 16) & 0xFFFF;
    var lowerBits = checksum & 0xFFFF;
    checksum = upperBits + lowerBits;
    while (checksum > 0xFFFF) {
      checksum -= 0x10000;
    }
    return checksum >>> 0;
  }

  function inspectSaveRange(bytes, startOffset) {
    var seenBlockIds = Object.create(null);
    var sectorOffsets = new Array(G3_MAIN_SECTION_COUNT);
    var fileSignature = null;
    var saveIndex = null;
    var sectorZeroOffset = -1;

    for (var offset = startOffset; offset < startOffset + SAVE_SIZE; offset += BLOCK_SIZE) {
      var blockId = readU16LE(bytes, offset + BLOCK_ID_OFFSET);
      if (CFRU_LAYOUT.saveBlockNumbers.indexOf(blockId) === -1) {
        return { valid: false };
      }
      if (seenBlockIds[blockId]) {
        return { valid: false };
      }
      seenBlockIds[blockId] = true;

      var currentSignature = readU32LE(bytes, offset + FILE_SIGNATURE_OFFSET) >>> 0;
      if (fileSignature === null) {
        fileSignature = currentSignature;
      } else if (fileSignature !== currentSignature) {
        return { valid: false };
      }

      var currentSaveIndex = readU32LE(bytes, offset + SAVE_INDEX_OFFSET) >>> 0;
      if (saveIndex === null) {
        saveIndex = currentSaveIndex;
      } else if (saveIndex !== currentSaveIndex) {
        return { valid: false };
      }

      var saveBlockData = bytes.slice(offset, offset + BLOCK_DATA_SIZE);
      var checksum = readU16LE(bytes, offset + CHECKSUM_OFFSET);
      if (calculateChecksum(saveBlockData, blockId) !== checksum) {
        return { valid: false };
      }

      if (blockId < G3_MAIN_SECTION_COUNT) {
        sectorOffsets[blockId] = offset;
        if (blockId === 0) {
          sectorZeroOffset = offset;
        }
      }
    }

    for (var sectionId = 0; sectionId < G3_MAIN_SECTION_COUNT; sectionId++) {
      if (typeof sectorOffsets[sectionId] !== "number") {
        return { valid: false };
      }
    }

    if (sectorZeroOffset < 0 || fileSignature !== SUPPORTED_FILE_SIGNATURE) {
      return { valid: false, fileSignature: fileSignature >>> 0 };
    }

    return {
      valid: true,
      fileSignature: fileSignature >>> 0,
      saveIndex: saveIndex >>> 0,
      startOffset: startOffset >>> 0,
      sectorOffsets: sectorOffsets,
      sectorZeroOffset: sectorZeroOffset >>> 0
    };
  }

  function loadSupportedSaveBlocks(bytes) {
    if (!bytes || (bytes.length !== G3_FULL_SAVE_SIZE && bytes.length !== G3_FLASHCART_SAVE_SIZE)) {
      throw new Error(INVALID_SAVE_MESSAGE);
    }

    var normalized = bytes.length === G3_FLASHCART_SAVE_SIZE ? bytes.slice(0, G3_FULL_SAVE_SIZE) : bytes;
    var saveA = inspectSaveRange(normalized, 0);
    var saveB = inspectSaveRange(normalized, SAVE_SIZE);
    var active = null;

    if (saveA.valid && saveB.valid) {
      active = compareCounters(saveA.saveIndex, saveB.saveIndex) >= 0 ? saveA : saveB;
    } else if (saveA.valid) {
      active = saveA;
    } else if (saveB.valid) {
      active = saveB;
    }

    if (!active) {
      var rawSignatures = [
        readU32LE(normalized, FILE_SIGNATURE_OFFSET) >>> 0,
        readU32LE(normalized, SAVE_SIZE + FILE_SIGNATURE_OFFSET) >>> 0
      ].filter(function (signature) {
        return signature !== 0 && signature !== 0xFFFFFFFF;
      });
      if (rawSignatures.length) {
        throw new Error(UNSUPPORTED_VERSION_MESSAGE);
      }
      throw new Error(INVALID_SAVE_MESSAGE);
    }

    var saveBlocks = {};
    for (var i = 0; i < CFRU_LAYOUT.saveBlockNumbers.length; i++) {
      saveBlocks[CFRU_LAYOUT.saveBlockNumbers[i]] = [];
    }

    for (var blockOffset = 0; blockOffset < SAVE_SIZE; blockOffset += BLOCK_SIZE) {
      var absoluteOffset = active.startOffset + blockOffset;
      var blockId = readU16LE(normalized, absoluteOffset + BLOCK_ID_OFFSET);
      if (typeof saveBlocks[blockId] !== "undefined") {
        saveBlocks[blockId] = Array.prototype.slice.call(normalized.slice(absoluteOffset, absoluteOffset + BLOCK_DATA_SIZE));
      }
    }

    for (var extraIndex = 0; extraIndex < CFRU_LAYOUT.fixedExtraBlockIds.length; extraIndex++) {
      var extraBlockId = CFRU_LAYOUT.fixedExtraBlockIds[extraIndex];
      var fixedOffset = extraBlockId * BLOCK_SIZE;
      saveBlocks[extraBlockId] = Array.prototype.slice.call(normalized.slice(fixedOffset, fixedOffset + BLOCK_DATA_SIZE));
    }

    return {
      bytes: normalized,
      saveBlocks: saveBlocks,
      fileSignature: active.fileSignature >>> 0,
      slotInfo: active
    };
  }

  function isRandomizedSave(saveBlocks) {
    if (!saveBlocks || !saveBlocks[0] || !saveBlocks[4]) {
      return false;
    }

    var flagsAOffset = CFRU_LAYOUT.cfruFlagsA.offset;
    var flagsA = saveBlocks[CFRU_LAYOUT.cfruFlagsA.saveBlock].slice(flagsAOffset);
    var flagsASize = BLOCK_DATA_SIZE - flagsAOffset;
    var flagsBSize = 0x200 - flagsASize;
    var flagsBOffset = CFRU_LAYOUT.cfruFlagsB.offset;
    var flagsB = saveBlocks[CFRU_LAYOUT.cfruFlagsB.saveBlock].slice(flagsBOffset, flagsBOffset + flagsBSize);
    var flags = flagsA.concat(flagsB);

    for (var i = 0; i < constants.RANDOMIZER_FLAGS.length; i++) {
      var flag = constants.RANDOMIZER_FLAGS[i];
      if (flag >= 0x900 && flag < 0x1900) {
        var adjusted = flag - 0x900;
        if ((flags[adjusted >> 3] & (1 << (flag % 8))) !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  function rebuildFrlgBuffers(bytes, slotInfo) {
    var smallBuffer = new Uint8Array(G3_SECTOR_DATA_SIZE);
    var largeBuffer = new Uint8Array(4 * G3_SECTOR_DATA_SIZE);

    for (var sectionId = 0; sectionId < G3_MAIN_SECTION_COUNT; sectionId++) {
      var sectorOffset = slotInfo.sectorOffsets[sectionId];
      var data = bytes.slice(sectorOffset, sectorOffset + G3_SECTOR_DATA_SIZE);
      if (sectionId === 0) {
        smallBuffer.set(data, 0);
      } else if (sectionId >= 1 && sectionId <= 4) {
        largeBuffer.set(data, (sectionId - 1) * G3_SECTOR_DATA_SIZE);
      }
    }

    return { smallBuffer: smallBuffer, largeBuffer: largeBuffer };
  }

  function getAllCfruBoxesData(saveBlocks) {
    var offsets = CFRU_LAYOUT.startingBoxMemoryOffsets;
    var res = saveBlocks[5].slice(4);
    for (var blockId = 6; blockId <= 13; blockId++) {
      res = res.concat(saveBlocks[blockId]);
    }
    res = res.slice(0, 19 * MONS_PER_BOX * COMPRESSED_MON_SIZE);

    if (constants.BOX_COUNT >= 20) {
      res = res
        .concat(saveBlocks[30].slice(offsets["30"], BLOCK_DATA_SIZE))
        .concat(saveBlocks[31].slice(offsets["31"], 0xF80));
    }
    if (constants.BOX_COUNT >= 23) {
      res = res
        .concat(saveBlocks[2].slice(offsets["2"], BLOCK_DATA_SIZE))
        .concat(saveBlocks[3].slice(offsets["3"], 0xCC0));
    }
    if (constants.BOX_COUNT >= 25) {
      res = res.concat(saveBlocks[0].slice(offsets["0"], offsets["0"] + (COMPRESSED_MON_SIZE * MONS_PER_BOX)));
    }
    return res;
  }

  function parseBoxTitles(saveBlocks) {
    var titles = [];
    var boxNamesEndOffset = CFRU_LAYOUT.boxNamesEndOffset;
    var boxNameLength = CFRU_LAYOUT.boxNameLength;
    var numBoxesAfterVanillaAmount = constants.BOX_COUNT - 14;
    var titleData = saveBlocks[CFRU_LAYOUT.boxNamesSaveBlock].slice(
      boxNamesEndOffset - (boxNameLength * constants.BOX_COUNT),
      boxNamesEndOffset
    );

    for (var i = 0; i < titleData.length; i += boxNameLength) {
      var titleBytes = titleData.slice(i, i + boxNameLength);
      var title = decodeCharBytes(titleBytes, 0, titleBytes.length);
      if (title.toLowerCase().indexOf("box") === 0 && title.length >= 4 && /\d/.test(title.charAt(3))) {
        title = title.slice(0, 3) + " " + title.slice(3);
      }
      titles.push(title);
    }

    return titles
      .slice(numBoxesAfterVanillaAmount)
      .concat(titles.slice(1, numBoxesAfterVanillaAmount).reverse())
      .concat([titles[0]]);
  }

  function getSpeciesDefineById(speciesId) {
    return normalizeSpeciesDefine(constants.SPECIES_BY_ID[String(speciesId)] || null);
  }

  function getSpeciesIdByDefine(speciesDefine) {
    if (!speciesDefine) {
      return 0;
    }

    var entries = constants.SPECIES_BY_ID || {};
    for (var rawId in entries) {
      if (Object.prototype.hasOwnProperty.call(entries, rawId) && entries[rawId] === speciesDefine) {
        return Number(rawId) >>> 0;
      }
    }
    return 0;
  }

  function getItemDefineById(itemId) {
    return constants.ITEMS_BY_ID[String(itemId)] || null;
  }

  function getMoveDefineById(moveId) {
    return constants.MOVES_BY_ID[String(moveId)] || null;
  }

  function getBaseStats(speciesDefine) {
    return speciesDefine ? (constants.BASE_STATS_BY_SPECIES[speciesDefine] || null) : null;
  }

  function resolveAbility(speciesDefine, personality, hiddenAbility) {
    var baseStats = getBaseStats(speciesDefine);
    if (!baseStats) {
      return { abilitySlot: 0, abilityName: null };
    }

    var abilitySlot = 0;
    var abilityDefine = baseStats.ability1;
    if (hiddenAbility && baseStats.hiddenAbility && baseStats.hiddenAbility !== "ABILITY_NONE") {
      abilitySlot = 2;
      abilityDefine = baseStats.hiddenAbility;
    } else if ((personality & 1) === 0 || baseStats.ability2 === "ABILITY_NONE") {
      abilitySlot = 0;
      abilityDefine = baseStats.ability1;
    } else {
      abilitySlot = 1;
      abilityDefine = baseStats.ability2;
    }

    return {
      abilitySlot: abilitySlot,
      abilityName: displayNameForAbility(abilityDefine)
    };
  }

  function resolveGender(speciesDefine, personality) {
    var baseStats = getBaseStats(speciesDefine);
    if (!baseStats) {
      return "U";
    }

    var ratio = baseStats.genderRatio;
    if (ratio === "MON_MALE" || ratio === "PERCENT_FEMALE(0)") {
      return "M";
    }
    if (ratio === "MON_FEMALE" || ratio === "PERCENT_FEMALE(100)") {
      return "F";
    }
    if (ratio === "MON_GENDERLESS") {
      return "U";
    }
    if (typeof ratio === "string" && ratio.indexOf("PERCENT_FEMALE(") === 0) {
      var percent = parseFloat(ratio.split("(")[1].split(")")[0]);
      var femaleThreshold = Math.min(254, Math.floor((percent * 255) / 100));
      return femaleThreshold > (personality & 0xFF) ? "F" : "M";
    }
    return "U";
  }

  function isShiny(otId, personality) {
    if (!personality) {
      return false;
    }
    var shinyValue = ((otId >>> 16) & 0xFFFF) ^ (otId & 0xFFFF) ^ ((personality >>> 16) & 0xFFFF) ^ (personality & 0xFFFF);
    return shinyValue < constants.SHINY_ODDS;
  }

  function calculateLevel(speciesDefine, experience) {
    var baseStats = getBaseStats(speciesDefine);
    if (!baseStats) {
      return 1;
    }
    var expCurve = constants.EXPERIENCE_CURVES_BY_GROWTH[baseStats.growthRate];
    if (!Array.isArray(expCurve) || expCurve.length <= MAX_LEVEL) {
      return 1;
    }

    var lowLevel = 1;
    var highLevel = MAX_LEVEL;
    while (lowLevel < highLevel) {
      var mid = (lowLevel + highLevel) >> 1;
      if (expCurve[mid] === experience) {
        return mid;
      } else if (expCurve[mid] < experience) {
        lowLevel = mid + 1;
      } else {
        highLevel = mid - 1;
      }
    }

    if (expCurve[highLevel] > experience) {
      return Math.max(1, highLevel - 1);
    }
    return Math.max(1, highLevel);
  }

  function getMetGameName(metGameId) {
    var gameName = constants.CURRENT_GAME_NAME;
    var customHackGameName = constants.CUSTOM_HACK_VERSIONS[String(metGameId)] || constants.CUSTOM_HACK_VERSIONS[metGameId];
    if (customHackGameName) {
      if (gameName === customHackGameName) {
        return constants.BASE_VERSION_NAMES[String(constants.BASE_VERSION)] || constants.BASE_VERSION_NAMES[constants.BASE_VERSION] || gameName;
      }
      return customHackGameName;
    }
    return gameName;
  }

  function toParsedMonShape(source) {
    var normalizedSpeciesDefine = normalizeSpeciesDefine(source.speciesDefine);
    var normalizedSpeciesId = getSpeciesIdByDefine(normalizedSpeciesDefine) || (source.speciesId >>> 0);
    var speciesDisplayName = displayNameForSpecies(normalizedSpeciesDefine);
    var natureIndex = source.personality % 25;
    var moveNames = [];
    var visibleMoveNames = [];
    for (var i = 0; i < source.moveIds.length; i++) {
      var moveDefine = getMoveDefineById(source.moveIds[i]);
      var moveDisplayName = displayNameForMove(moveDefine);
      moveNames.push(moveDisplayName || "-");
      if (moveDisplayName) {
        visibleMoveNames.push(moveDisplayName);
      }
    }

    var ability = resolveAbility(normalizedSpeciesDefine, source.personality, source.hiddenAbility);
    return {
      speciesId: normalizedSpeciesId,
      speciesName: speciesDisplayName,
      nickname: source.nickname || "",
      itemId: source.itemId >>> 0,
      itemName: displayNameForItem(getItemDefineById(source.itemId)),
      moveIds: source.moveIds.slice(),
      moveNames: moveNames,
      visibleMoveNames: visibleMoveNames,
      abilitySlot: ability.abilitySlot,
      abilityName: ability.abilityName,
      natureName: constants.NATURE_DISPLAY_NAMES[natureIndex] || null,
      level: source.level >>> 0,
      ivs: source.ivs.slice(),
      evs: source.evs.slice(),
      shiny: isShiny(source.otId, source.personality),
      gender: resolveGender(normalizedSpeciesDefine, source.personality),
      metGame: getMetGameName(source.metGameId),
      metLevel: source.metLevel >>> 0,
      metLocationId: source.metLocationId >>> 0,
      metLocationName: null,
      isParty: !!source.isParty
    };
  }

  function parseCompressedPcMonChunk(allBoxes, monOffset) {
    var personality = readU32LE(allBoxes, monOffset);
    var speciesId = readU16LE(allBoxes, monOffset + 28);
    if (!personality || !speciesId) {
      return null;
    }

    var sanity = readU8(allBoxes, monOffset + 19);
    if ((sanity & 1) !== 0) {
      return null;
    }

    var speciesDefine = getSpeciesDefineById(speciesId);
    if (!speciesDefine) {
      return null;
    }

    var ivWord = readU32LE(allBoxes, monOffset + 54);
    var isEgg = ((ivWord >>> 30) & 0x1) === 1 || (sanity & 4) !== 0;
    if (isEgg) {
      return null;
    }

    return toParsedMonShape({
      isParty: false,
      personality: personality >>> 0,
      otId: readU32LE(allBoxes, monOffset + 4) >>> 0,
      nickname: decodeCharBytes(allBoxes, monOffset + 8, 10),
      speciesId: speciesId >>> 0,
      speciesDefine: speciesDefine,
      itemId: readU16LE(allBoxes, monOffset + 30) >>> 0,
      moveIds: (function () {
        var compressedMoves = readUIntLE(allBoxes, monOffset + 39, 5);
        var moveIds = [];
        for (var i = 0; i < 4; i++) {
          moveIds.push(compressedMoves & 0x3FF);
          compressedMoves = Math.floor(compressedMoves / 0x400);
        }
        return moveIds;
      })(),
      hiddenAbility: ((ivWord >>> 31) & 0x1) === 1,
      ivs: [
        ivWord & 0x1F,
        (ivWord >>> 5) & 0x1F,
        (ivWord >>> 10) & 0x1F,
        (ivWord >>> 15) & 0x1F,
        (ivWord >>> 20) & 0x1F,
        (ivWord >>> 25) & 0x1F
      ],
      evs: [
        readU8(allBoxes, monOffset + 44),
        readU8(allBoxes, monOffset + 45),
        readU8(allBoxes, monOffset + 46),
        readU8(allBoxes, monOffset + 47),
        readU8(allBoxes, monOffset + 48),
        readU8(allBoxes, monOffset + 49)
      ],
      level: calculateLevel(speciesDefine, readU32LE(allBoxes, monOffset + 32) >>> 0),
      metLocationId: readU8(allBoxes, monOffset + 51),
      metLevel: readU16LE(allBoxes, monOffset + 52) & 0x7F,
      metGameId: (readU16LE(allBoxes, monOffset + 52) & 0x780) >>> 7
    });
  }

  function parsePartyMonChunk(chunk, slot) {
    if (!chunk || chunk.length < 80) {
      return null;
    }

    var personality = readU32LE(chunk, 0x00) >>> 0;
    var otId = readU32LE(chunk, 0x04) >>> 0;
    if (!personality) {
      return null;
    }

    var flags = readU8(chunk, 0x13);
    if (((flags >>> 1) & 0x1) !== 1) {
      return null;
    }

    // In Unbound 2.1 saves, party mons in the FRLG saveblocks are stored as
    // direct party structs rather than encrypted/shuffled boxed data.
    var speciesId = readU16LE(chunk, 0x20) >>> 0;
    var speciesDefine = getSpeciesDefineById(speciesId);
    if (!speciesDefine) {
      return null;
    }

    var ivWord = readU32LE(chunk, 0x48) >>> 0;
    var isEgg = ((ivWord >>> 30) & 0x1) === 1 || ((flags >>> 2) & 0x1) === 1;
    if (isEgg) {
      return null;
    }

    var originInfo = readU16LE(chunk, 0x46) >>> 0;

    return toParsedMonShape({
      isParty: true,
      personality: personality,
      otId: otId,
      nickname: decodeCharBytes(chunk, 0x08, 10),
      speciesId: speciesId >>> 0,
      speciesDefine: speciesDefine,
      itemId: readU16LE(chunk, 0x22) >>> 0,
      moveIds: [
        readU16LE(chunk, 0x2C) >>> 0,
        readU16LE(chunk, 0x2E) >>> 0,
        readU16LE(chunk, 0x30) >>> 0,
        readU16LE(chunk, 0x32) >>> 0
      ],
      hiddenAbility: ((ivWord >>> 31) & 0x1) === 1,
      ivs: [
        ivWord & 0x1F,
        (ivWord >>> 5) & 0x1F,
        (ivWord >>> 10) & 0x1F,
        (ivWord >>> 15) & 0x1F,
        (ivWord >>> 20) & 0x1F,
        (ivWord >>> 25) & 0x1F
      ],
      evs: [
        readU8(chunk, 0x38),
        readU8(chunk, 0x39),
        readU8(chunk, 0x3A),
        readU8(chunk, 0x3B),
        readU8(chunk, 0x3C),
        readU8(chunk, 0x3D)
      ],
      level: readU8(chunk, 0x54),
      metLocationId: readU8(chunk, 0x45),
      metLevel: originInfo & 0x7F,
      metGameId: (originInfo >>> 7) & 0xF
    });
  }

  function monToShowdown(mon) {
    if (!mon || !mon.speciesName) {
      return "";
    }

    var out = [];
    var species = mon.speciesName;
    var nickname = String(mon.nickname || "").trim();
    var header = species;
    if (nickname && nickname.toLowerCase() !== species.toLowerCase() && nickname.toLowerCase().indexOf(species.toLowerCase()) === -1) {
      header = nickname + " (" + species + ")";
    }
    if (mon.itemName) {
      header += " @ " + mon.itemName;
    }
    out.push(header);

    if (mon.level > 0) {
      out.push("Level: " + mon.level);
    }
    if (mon.natureName) {
      out.push(mon.natureName + " Nature");
    }
    out.push("EVs: " + mon.evs[0] + " HP / " + mon.evs[1] + " Atk / " + mon.evs[2] + " Def / " + mon.evs[3] + " Spe / " + mon.evs[4] + " SpA / " + mon.evs[5] + " SpD");
    out.push("IVs: " + mon.ivs[0] + " HP / " + mon.ivs[1] + " Atk / " + mon.ivs[2] + " Def / " + mon.ivs[3] + " Spe / " + mon.ivs[4] + " SpA / " + mon.ivs[5] + " SpD");
    if (mon.abilityName) {
      out.push("Ability: " + mon.abilityName);
    }

    for (var i = 0; i < mon.moveNames.length; i++) {
      if (mon.moveNames[i] && mon.moveNames[i] !== "-") {
        out.push("- " + mon.moveNames[i]);
      }
    }

    if (mon.metLocationName) {
      out.push("Met: " + mon.metLocationName);
    }

    return out.join("\n") + "\n\n";
  }

  function parseUnboundSaveFile(arrayBuffer) {
    var rawBytes = new Uint8Array(arrayBuffer || 0);
    var loaded = loadSupportedSaveBlocks(rawBytes);
    if (isRandomizedSave(loaded.saveBlocks)) {
      throw new Error(RANDOMIZED_SAVE_MESSAGE);
    }

    var parsedParty = [];
    var parsedBoxes = [];
    var frlgBuffers = rebuildFrlgBuffers(loaded.bytes, loaded.slotInfo);
    var partyCount = Math.max(0, Math.min(readU8(frlgBuffers.largeBuffer, CFRU_LAYOUT.frlgPartyCountOffset), 6));
    for (var partyIndex = 0; partyIndex < partyCount; partyIndex++) {
      var partyOffset = CFRU_LAYOUT.frlgPartyBaseOffset + (partyIndex * PARTY_STRUCT_SIZE);
      var partyChunk = frlgBuffers.largeBuffer.slice(partyOffset, partyOffset + PARTY_STRUCT_SIZE);
      var parsedPartyMon = parsePartyMonChunk(partyChunk, partyIndex + 1);
      if (parsedPartyMon) {
        parsedParty.push(parsedPartyMon);
      }
    }

    var allBoxes = getAllCfruBoxesData(loaded.saveBlocks);
    for (var monOffset = 0; monOffset < allBoxes.length; monOffset += COMPRESSED_MON_SIZE) {
      var parsedBoxMon = parseCompressedPcMonChunk(allBoxes, monOffset);
      if (parsedBoxMon) {
        parsedBoxes.push(parsedBoxMon);
      }
    }

    var showdownImport = "";
    for (var i = 0; i < parsedParty.length; i++) {
      showdownImport += monToShowdown(parsedParty[i]);
    }
    for (var j = 0; j < parsedBoxes.length; j++) {
      showdownImport += monToShowdown(parsedBoxes[j]);
    }

    return {
      showdownImport: showdownImport,
      deadMons: [],
      parsedParty: parsedParty,
      parsedBoxes: parsedBoxes,
      fileSignature: loaded.fileSignature >>> 0,
      profileKey: constants.PROFILE_KEY,
      boxTitles: parseBoxTitles(loaded.saveBlocks),
      randomized: false
    };
  }

  function shouldHandleUnboundSaveUpload() {
    return typeof window !== "undefined"
      && typeof window.baseGame === "string"
      && window.baseGame === "unbound"
      && typeof window.TITLE === "string"
      && window.TITLE.indexOf("Unbound") !== -1;
  }

  function showLoadSuccess(selectedName) {
    if (typeof $ !== "function") {
      return;
    }

    var changelog = "<h4>Changelog:</h4>";
    changelog += "<p>" + selectedName + " loaded</p>";
    if ($("#changelog").length === 0) {
      $("#clearSets").after("<p id='changelog'></p>");
    }
    $("#changelog").html(changelog).show();
  }

  if (typeof window !== "undefined" && typeof document !== "undefined" && typeof $ === "function") {
    $(document).ready(function () {
      $("#read-save").off("click.unboundsave").on("click.unboundsave", function () {
        if ($("#save-upload").length > 0) {
          $("#save-upload")[0].value = null;
        }
      });

      var saveInput = document.getElementById("save-upload");
      if (!saveInput) {
        return;
      }

      saveInput.addEventListener("change", function (event) {
        if (!shouldHandleUnboundSaveUpload()) {
          return;
        }

        var file = event.target.files[0];
        if (!file) {
          return;
        }

        var reader = new FileReader();
        var selectedName = ($("#save-upload").val() || "").split("\\").pop() || file.name || "save.sav";
        reader.onload = function (e) {
          try {
            var result = parseUnboundSaveFile(e.target.result);
            if (typeof window !== "undefined") {
              window.saveUploaded = true;
              window.saveFileName = selectedName;
              window.savExt = ((selectedName.split(".").pop()) || "").toLowerCase();
            }
            showLoadSuccess(selectedName);
            if (typeof window.applyImportedSnapshot === "function") {
              window.applyImportedSnapshot({
                showdownImport: result.showdownImport,
                deadMons: [],
                source: "save-file",
                replaceDeadMons: true
              });
            } else {
              $(".import-team-text").val(result.showdownImport);
              $("#import").click();
            }
          } catch (error) {
            console.error("Failed to parse Pokemon Unbound 2.1 save.", error);
            alert(error && error.message ? error.message : INVALID_SAVE_MESSAGE);
          }
        };
        reader.readAsArrayBuffer(file);
      });
    });
  }

  return {
    parseUnboundSaveFile: parseUnboundSaveFile,
    loadSupportedSaveBlocks: loadSupportedSaveBlocks
  };
});
