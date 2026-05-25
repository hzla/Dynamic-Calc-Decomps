(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      require("./save_constants/radical_red_constants.js"),
      require("./save_constants/radical_red_randomizer_constants.js"),
      require("./save_constants/radical_red_dex_ability_constants.js")
    );
    return;
  }

  var api = factory(
    root.radicalRedSaveConstants || null,
    root.radicalRedRandomizerConstants || null,
    root.radicalRedDexAbilityConstants || null
  );
  root.radicalRedSaveReader = api;
  root.parseRadicalRedSaveFile = api.parseRadicalRedSaveFile;
})(typeof globalThis !== "undefined" ? globalThis : this, function (constants, randomizerConstants, dexAbilityConstants) {
  "use strict";

  if (!constants) {
    throw new Error("Radical Red save constants are required.");
  }
  if (!randomizerConstants) {
    throw new Error("Radical Red randomizer constants are required.");
  }
  if (!dexAbilityConstants) {
    throw new Error("Radical Red dex ability constants are required.");
  }

  var RR_SAVE_BLOCK_SIZE = 0xE000;
  var RR_ACTIVE_SLOT_SIZE = 57344;
  var RR_SAVE_INDEX_A_OFFSET = 0x0FFC;
  var RR_SAVE_INDEX_B_OFFSET = RR_SAVE_BLOCK_SIZE + RR_SAVE_INDEX_A_OFFSET;
  var RR_MAGIC_A = 0x02;
  var RR_MAGIC_B = 0x02;
  var RR_PARTY_STRUCT_SIZE = 100;
  var RR_BOX_STRUCT_SIZE = 58;
  var RR_PARTY_DATA_LENGTH = 600;
  var RR_BOX_COUNT = 9;
  var RR_BOX_DATA_LENGTH = 4096;
  var RR_PARTY_OFFSET_BASE = 4096 + 0x38;
  var RR_BOX_OFFSET_BASE = 20480 + 4;
  var RR_MAX_LEVEL = 100;

  var RR_FIND_SECTOR_LIMIT = 0x1C000;
  var RR_SECTOR_SIZE = 0x1000;
  var RR_TRAINER_ID_OFFSET = 0x00A;
  var RR_HARDMODE_BITFLAG = 0xDB2;
  var RR_RESTRICTED_BITFLAG = 0xDC3;
  var RR_SCALED_SPECIES_BITFLAG = 0xF2B;
  var RR_RANDOMIZATION_BITFLAG = 0xF2C;

  var rrMons = constants.mons || [];
  var rrMoves = constants.moves || [];
  var rrAbilitiesBySpecies = constants.abilitiesBySpecies || {};
  var rrNormalAbilityPool = randomizerConstants.normalAbilityPool || [];
  var rrRestrictedAbilityPool = randomizerConstants.restrictedAbilityPool || [];
  var rrAbilityIdsBySpeciesId = dexAbilityConstants.abilityIdsBySpeciesId || [];
  var rrAbilityIdNameMapCache = null;
  var rrAbilityNameIdMapCache = null;
  var RR_ABILITY_DISPLAY_NAME_ALIASES = {
    "As One (Glastrier)": "As One",
    "As One (Spectrier)": "As One"
  };
  var RR_ABILITY_NAME_ALIASES = {
    airlock: "cloudnine",
    asoneglastrier: "asone",
    asonespectrier: "asone",
    clearbody: "clearbody",
    dazzling: "dazzling",
    emergencyexit: "emergencyexit",
    gooey: "gooey",
    grimneigh: "moxie",
    hugepower: "hugepower",
    insomnia: "insomnia",
    ironbarbs: "roughskin",
    libero: "protean",
    moldbreaker: "moldbreaker",
    powerofalchemy: "receiver",
    propellertail: "stalwart",
    propellortail: "stalwart",
    protean: "protean",
    purepower: "hugepower",
    queenlymajesty: "dazzling",
    receiver: "receiver",
    roughskin: "roughskin",
    solidrock: "filter",
    stalwart: "stalwart",
    tanglinghair: "gooey",
    teravolt: "moldbreaker",
    turboblaze: "moldbreaker",
    vitalspirit: "insomnia",
    whitesmoke: "clearbody",
    wimpout: "emergencyexit"
  };
  var rrNatures = [
    "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
    "Bold", "Docile", "Relaxed", "Impish", "Lax",
    "Timid", "Hasty", "Serious", "Jolly", "Naive",
    "Modest", "Mild", "Quiet", "Bashful", "Rash",
    "Calm", "Gentle", "Sassy", "Careful", "Quirky"
  ];

  function rrReadU8(bytes, offset) {
    return bytes[offset] >>> 0;
  }

  function rrReadU16LE(bytes, offset) {
    return ((bytes[offset] || 0) | ((bytes[offset + 1] || 0) << 8)) >>> 0;
  }

  function rrReadU32LE(bytes, offset) {
    return (((bytes[offset] || 0))
      | ((bytes[offset + 1] || 0) << 8)
      | ((bytes[offset + 2] || 0) << 16)
      | ((bytes[offset + 3] || 0) << 24)) >>> 0;
  }

  function rrGetGlobalValue(name) {
    if (typeof globalThis !== "undefined" && typeof globalThis[name] !== "undefined") {
      return globalThis[name];
    }
    return undefined;
  }

  function rrGetLearnsets(options) {
    if (options && options.learnsets) {
      return options.learnsets;
    }
    return rrGetGlobalValue("learnsets");
  }

  function rrGetExpTables(options) {
    if (options && options.expTables) {
      return options.expTables;
    }
    return rrGetGlobalValue("expTables");
  }

  function rrGetLevelFunction(options) {
    if (options && typeof options.getLevelFn === "function") {
      return options.getLevelFn;
    }
    var getLevelFn = rrGetGlobalValue("get_level");
    return typeof getLevelFn === "function" ? getLevelFn : null;
  }

  function rrLocalStorageFlag(key) {
    if (typeof localStorage === "undefined") {
      return false;
    }
    try {
      return localStorage.getItem(key) === "1";
    } catch (_err) {
      return false;
    }
  }

  function rrRandomizedAbilitiesEnabled(options, saveInfo) {
    if (saveInfo && saveInfo.randomAbilities) {
      return true;
    }
    if (options && typeof options.randomizedAbilitiesEnabled === "boolean") {
      return options.randomizedAbilitiesEnabled;
    }
    return rrLocalStorageFlag("randomized");
  }

  function rrNormalizeLookupCandidates(name) {
    if (!name) {
      return [];
    }

    var candidates = [String(name)];
    candidates.push(candidates[0].replace(/'/g, "\u2019"));
    candidates.push(candidates[0].replace(/\u2019/g, "'"));

    if (candidates[0].indexOf("-") >= 0) {
      candidates.push(candidates[0].split("-").slice(0, 2).join("-"));
      candidates.push(candidates[0].split("-")[0]);
    }

    var seen = Object.create(null);
    return candidates.filter(function (candidate) {
      if (!candidate || seen[candidate]) {
        return false;
      }
      seen[candidate] = true;
      return true;
    });
  }

  function rrGetAbilityList(speciesName) {
    var candidates = rrNormalizeLookupCandidates(speciesName);
    for (var i = 0; i < candidates.length; i++) {
      var abilityList = rrAbilitiesBySpecies[candidates[i]];
      if (Array.isArray(abilityList) && abilityList.length) {
        return abilityList;
      }
    }
    return [];
  }

  function rrGetAbilityIdsForSpeciesId(speciesId) {
    var abilityIds = rrAbilityIdsBySpeciesId[speciesId];
    return Array.isArray(abilityIds) ? abilityIds : [];
  }

  function rrNormalizeAbilityNameKey(abilityName) {
    if (!abilityName) {
      return "";
    }

    var normalized = String(abilityName)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    return RR_ABILITY_NAME_ALIASES[normalized] || normalized;
  }

  function rrBuildAbilityNameMaps() {
    if (rrAbilityIdNameMapCache && rrAbilityNameIdMapCache) {
      return {
        idToName: rrAbilityIdNameMapCache,
        nameToId: rrAbilityNameIdMapCache
      };
    }

    var candidatesById = Object.create(null);
    var frequenciesById = Object.create(null);
    var speciesCount = Math.min(rrMons.length, rrAbilityIdsBySpeciesId.length);

    for (var speciesId = 1; speciesId < speciesCount; speciesId++) {
      var speciesName = rrMons[speciesId];
      if (!rrIsValidSpeciesName(speciesName)) {
        continue;
      }

      var abilityNames = rrGetAbilityList(speciesName).filter(function (abilityName) {
        return Boolean(abilityName && abilityName !== "None");
      });
      var abilityIds = rrGetAbilityIdsForSpeciesId(speciesId).filter(function (abilityId) {
        return Boolean(abilityId);
      });

      if (!abilityNames.length || !abilityIds.length) {
        continue;
      }

      var uniqueNames = Array.from(new Set(abilityNames));
      var uniqueIds = Array.from(new Set(abilityIds));

      for (var idIndex = 0; idIndex < uniqueIds.length; idIndex++) {
        var abilityId = uniqueIds[idIndex];
        if (!candidatesById[abilityId]) {
          candidatesById[abilityId] = new Set(uniqueNames);
        } else {
          candidatesById[abilityId] = new Set(uniqueNames.filter(function (name) {
            return candidatesById[abilityId].has(name);
          }));
        }

        if (!frequenciesById[abilityId]) {
          frequenciesById[abilityId] = Object.create(null);
        }
        for (var nameIndex = 0; nameIndex < uniqueNames.length; nameIndex++) {
          var abilityName = uniqueNames[nameIndex];
          frequenciesById[abilityId][abilityName] = (frequenciesById[abilityId][abilityName] || 0) + 1;
        }
      }
    }

    var idToName = Object.create(null);
    var nameToId = Object.create(null);

    var unresolved = Object.keys(candidatesById).map(function (id) {
      return Number(id);
    });
    var keepResolving = true;

    while (keepResolving) {
      keepResolving = false;
      for (var unresolvedIndex = 0; unresolvedIndex < unresolved.length; unresolvedIndex++) {
        var unresolvedId = unresolved[unresolvedIndex];
        if (idToName[unresolvedId]) {
          continue;
        }

        var candidateSet = candidatesById[unresolvedId];
        if (!candidateSet || candidateSet.size !== 1) {
          continue;
        }

        var onlyName = Array.from(candidateSet)[0];
        if (nameToId[onlyName] && nameToId[onlyName] !== unresolvedId) {
          continue;
        }

        idToName[unresolvedId] = onlyName;
        nameToId[onlyName] = unresolvedId;
        keepResolving = true;

        for (var otherIndex = 0; otherIndex < unresolved.length; otherIndex++) {
          var otherId = unresolved[otherIndex];
          if (otherId !== unresolvedId && candidatesById[otherId]) {
            candidatesById[otherId].delete(onlyName);
          }
        }
      }
    }

    for (var frequencyIdText in frequenciesById) {
      if (!Object.prototype.hasOwnProperty.call(frequenciesById, frequencyIdText)) {
        continue;
      }

      var frequencyId = Number(frequencyIdText);
      if (idToName[frequencyId]) {
        continue;
      }

      var entries = Object.entries(frequenciesById[frequencyId]).sort(function (left, right) {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }
        return left[0].localeCompare(right[0]);
      });

      for (var entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        var candidateName = entries[entryIndex][0];
        if (nameToId[candidateName] && nameToId[candidateName] !== frequencyId) {
          continue;
        }
        idToName[frequencyId] = candidateName;
        nameToId[candidateName] = frequencyId;
        break;
      }
    }

    rrAbilityIdNameMapCache = idToName;
    rrAbilityNameIdMapCache = nameToId;
    return {
      idToName: idToName,
      nameToId: nameToId
    };
  }

  function rrResolveAbilityNameById(abilityId) {
    if (!abilityId) {
      return null;
    }
    var maps = rrBuildAbilityNameMaps();
    var resolvedName = maps.idToName[abilityId] || null;
    return RR_ABILITY_DISPLAY_NAME_ALIASES[resolvedName] || resolvedName;
  }

  function rrResolveAbilityIdByName(abilityName) {
    if (!abilityName) {
      return -1;
    }
    var maps = rrBuildAbilityNameMaps();
    if (Number.isFinite(maps.nameToId[abilityName])) {
      return maps.nameToId[abilityName];
    }

    var targetKey = rrNormalizeAbilityNameKey(abilityName);
    var knownNames = Object.keys(maps.nameToId);
    for (var i = 0; i < knownNames.length; i++) {
      if (rrNormalizeAbilityNameKey(knownNames[i]) === targetKey) {
        return maps.nameToId[knownNames[i]];
      }
    }
    return -1;
  }

  function rrResolveBaseAbilityName(speciesName, abilitySlot) {
    var abilityList = rrGetAbilityList(speciesName);
    if (!abilityList.length) {
      return null;
    }

    var slot = Number.isInteger(abilitySlot) ? abilitySlot : 0;
    if (!abilityList[slot] || abilityList[slot] === "None") {
      slot = 0;
    }
    return abilityList[slot] || abilityList[0] || null;
  }

  function rrResolveBaseAbilityId(speciesName, speciesId, abilitySlot) {
    var baseAbilityName = rrResolveBaseAbilityName(speciesName, abilitySlot);
    var abilityIds = rrGetAbilityIdsForSpeciesId(speciesId);
    var slot = Number.isInteger(abilitySlot) ? abilitySlot : 0;

    if (abilityIds.length) {
      var targetKey = rrNormalizeAbilityNameKey(baseAbilityName);
      if (targetKey) {
        for (var abilityIndex = 0; abilityIndex < abilityIds.length; abilityIndex++) {
          var candidateAbilityId = abilityIds[abilityIndex] || 0;
          if (!candidateAbilityId) {
            continue;
          }

          if (rrNormalizeAbilityNameKey(rrResolveAbilityNameById(candidateAbilityId)) === targetKey) {
            return candidateAbilityId;
          }
        }
      }

      var slotAbilityId = abilityIds[slot] || 0;
      if (slotAbilityId) {
        return slotAbilityId;
      }

      for (var fallbackIndex = 0; fallbackIndex < abilityIds.length; fallbackIndex++) {
        if (abilityIds[fallbackIndex]) {
          return abilityIds[fallbackIndex];
        }
      }
    }

    return rrResolveAbilityIdByName(baseAbilityName);
  }

  function rrResolveFallbackAbilitySlot(monStruct, hiddenAbilityOffset) {
    var abilitySlot = ((rrReadU32LE(monStruct, 0) & 0x1) === 0) ? 0 : 1;
    if (rrReadU8(monStruct, hiddenAbilityOffset) === 191) {
      abilitySlot = 2;
    }
    return abilitySlot;
  }

  function rrResolvePartyAbilitySlot(monStruct) {
    if ((rrReadU32LE(monStruct, 72) & 0x80000000) !== 0) {
      return 2;
    }
    return rrResolveFallbackAbilitySlot(monStruct, 74);
  }

  function rrResolveBoxAbilitySlot(monStruct) {
    if ((rrReadU32LE(monStruct, 54) & 0x80000000) !== 0) {
      return 2;
    }
    return rrResolveFallbackAbilitySlot(monStruct, 57);
  }

  function rrRandomizeAbilityId(trainerIdSecret, restricted, abilityId, speciesId) {
    if (!abilityId) {
      return 0;
    }

    var trainerId = Math.max(1, Number(trainerIdSecret) || 0) >>> 0;
    var pool = restricted ? rrRestrictedAbilityPool : rrNormalAbilityPool;
    if (!pool.length) {
      return abilityId >>> 0;
    }

    var abilityCount = pool.length;
    var secretIdLowerByte = (((trainerId >>> 16) & 0xFFFF) % 0xFF) >>> 0;
    var newAbilityIndex = ((trainerId & 0xFFFF) % abilityCount) >>> 0;
    newAbilityIndex = (newAbilityIndex + (speciesId >>> 0) + (abilityId >>> 0)) & 0xFFFF;
    if (newAbilityIndex > abilityCount) {
      newAbilityIndex = (newAbilityIndex - abilityCount + 2) & 0xFFFF;
    }
    newAbilityIndex = (newAbilityIndex ^ (secretIdLowerByte & 0xFFFF)) % abilityCount;
    return pool[newAbilityIndex] >>> 0;
  }

  function rrResolveAbilityName(speciesName, speciesId, abilitySlot, saveInfo, options) {
    var baseAbilityName = rrResolveBaseAbilityName(speciesName, abilitySlot);
    if (!baseAbilityName) {
      return "Unknown";
    }

    if (!rrRandomizedAbilitiesEnabled(options, saveInfo) || !saveInfo || !saveInfo.randomAbilities) {
      return baseAbilityName;
    }

    var baseAbilityId = rrResolveBaseAbilityId(speciesName, speciesId, abilitySlot);
    if (baseAbilityId < 1) {
      return baseAbilityName;
    }

    var randomizedAbilityId = rrRandomizeAbilityId(
      saveInfo.trainerIdSecret,
      saveInfo.restricted,
      baseAbilityId,
      speciesId
    );
    return rrResolveAbilityNameById(randomizedAbilityId) || baseAbilityName;
  }

  function rrResolveGrowthRate(speciesName, options) {
    var learnsets = rrGetLearnsets(options);
    if (!learnsets || !speciesName) {
      return null;
    }

    var candidates = rrNormalizeLookupCandidates(speciesName).map(function (candidate) {
      return candidate.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    });

    for (var i = 0; i < candidates.length; i++) {
      var learnset = learnsets[candidates[i]];
      if (learnset && Number.isFinite(learnset.gr)) {
        return learnset.gr;
      }
    }
    return null;
  }

  function rrResolveLevelFromExpTable(expTable, exp, getLevelFn) {
    if (!Array.isArray(expTable) || typeof getLevelFn !== "function") {
      return null;
    }
    try {
      var level = getLevelFn(expTable, exp);
      return (level >= 1 && level <= RR_MAX_LEVEL) ? level : null;
    } catch (_err) {
      return null;
    }
  }

  function rrResolveLevel(speciesName, exp, fallbackLevel, options) {
    var growthRate = rrResolveGrowthRate(speciesName, options);
    var expTables = rrGetExpTables(options);
    var getLevelFn = rrGetLevelFunction(options);

    if (Number.isFinite(growthRate) && expTables && expTables[growthRate]) {
      var resolvedLevel = rrResolveLevelFromExpTable(expTables[growthRate], exp, getLevelFn);
      if (resolvedLevel) {
        return resolvedLevel;
      }
    }

    if (Number.isFinite(fallbackLevel) && fallbackLevel >= 1 && fallbackLevel <= RR_MAX_LEVEL) {
      return fallbackLevel;
    }
    return RR_MAX_LEVEL;
  }

  function rrDecodePackedMoveIds(packedBytes) {
    if (!packedBytes || packedBytes.length < 5) {
      return [];
    }

    var moveIds = [];
    for (var moveIndex = 0; moveIndex < 4; moveIndex++) {
      var moveId = 0;
      for (var bit = 0; bit < 10; bit++) {
        var absoluteBit = (moveIndex * 10) + bit;
        var byteIndex = Math.floor(absoluteBit / 8);
        var bitIndex = absoluteBit % 8;
        moveId |= (((packedBytes[byteIndex] >>> bitIndex) & 0x1) << bit);
      }
      moveIds.push(moveId >>> 0);
    }
    return moveIds;
  }

  function rrMapMoveIdsToNames(moveIds) {
    return moveIds.map(function (moveId) {
      return rrMoves[moveId] || null;
    });
  }

  function rrIsValidSpeciesName(speciesName) {
    return Boolean(speciesName && speciesName !== "-----" && speciesName !== "None");
  }

  function rrResolveJellicentGender(speciesId, pid) {
    if (speciesId === 705) {
      return "F";
    }
    return ((pid >>> 0) & 0xFF) < 127 ? "F" : "M";
  }

  function rrResolveGenderedSpeciesName(speciesName, speciesId, pid) {
    if (speciesName === "Jellicent" && rrResolveJellicentGender(speciesId, pid) === "F") {
      return "Jellicent-F";
    }
    return speciesName;
  }

  function rrWrappedSlice(bytes, start, length) {
    var out = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      out[i] = bytes[(start + i) % bytes.length] || 0;
    }
    return out;
  }

  function rrResolveActiveLayout(rawBytes) {
    var bytes = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes || 0);
    if (bytes.length < RR_SAVE_INDEX_B_OFFSET + 2) {
      throw new Error("Radical Red save is too small.");
    }

    var saveIndexA = rrReadU16LE(bytes, RR_SAVE_INDEX_A_OFFSET);
    var saveIndexB = rrReadU16LE(bytes, RR_SAVE_INDEX_B_OFFSET);
    var hasValidA = saveIndexA !== 65535;
    var hasValidB = saveIndexB !== 65535;
    var blockOffset = 0;

    if (!hasValidA && hasValidB) {
      blockOffset = RR_SAVE_BLOCK_SIZE;
    } else if (hasValidA && hasValidB && saveIndexB > saveIndexA) {
      blockOffset = RR_SAVE_BLOCK_SIZE;
    }

    var activeSave = bytes.subarray(blockOffset, blockOffset + RR_ACTIVE_SLOT_SIZE);

    var saveIndex = Math.max(saveIndexA, saveIndexB);
    if (saveIndexB === 65535) {
      saveIndex = saveIndexA;
    } else if (saveIndexA === 65535) {
      saveIndex = saveIndexB;
    }

    var adjustment = (saveIndexA + saveIndexB >= 65535) ? 0 : 53248;
    var rotation = saveIndex % 14;
    var totalOffset = ((rotation * 4096) + adjustment) % RR_ACTIVE_SLOT_SIZE;
    var partyOffset = (totalOffset + RR_PARTY_OFFSET_BASE) % RR_ACTIVE_SLOT_SIZE;
    var partyCount = rrReadU8(activeSave, partyOffset - 4);

    if (partyCount === 0) {
      adjustment = 0;
      totalOffset = ((rotation * 4096) + adjustment) % RR_ACTIVE_SLOT_SIZE;
      partyOffset = (totalOffset + RR_PARTY_OFFSET_BASE) % RR_ACTIVE_SLOT_SIZE;
      partyCount = rrReadU8(activeSave, partyOffset - 4);
    }

    var boxOffset = (RR_BOX_OFFSET_BASE + totalOffset) % RR_ACTIVE_SLOT_SIZE;
    var boxData = new Uint8Array(RR_PARTY_DATA_LENGTH + (RR_BOX_COUNT * RR_BOX_DATA_LENGTH));
    boxData.set(rrWrappedSlice(activeSave, partyOffset, RR_PARTY_DATA_LENGTH), 0);
    for (var boxIndex = 0; boxIndex < RR_BOX_COUNT; boxIndex++) {
      var sourceOffset = ((boxIndex * RR_BOX_DATA_LENGTH) + boxOffset) % RR_ACTIVE_SLOT_SIZE;
      boxData.set(
        rrWrappedSlice(activeSave, sourceOffset, RR_BOX_DATA_LENGTH),
        RR_PARTY_DATA_LENGTH + (boxIndex * RR_BOX_DATA_LENGTH)
      );
    }

    return {
      blockOffset: blockOffset,
      saveIndexA: saveIndexA,
      saveIndexB: saveIndexB,
      saveIndex: saveIndex >>> 0,
      rotation: rotation >>> 0,
      adjustment: adjustment >>> 0,
      totalOffset: totalOffset >>> 0,
      partyOffset: partyOffset >>> 0,
      partyCount: partyCount >>> 0,
      boxOffset: boxOffset >>> 0,
      boxData: boxData
    };
  }

  function rrFindSector(bytes, sectorId) {
    var latestOffset = -1;
    var latestSaveIndex = -1;
    var limit = Math.min(bytes.length, RR_FIND_SECTOR_LIMIT);
    for (var offset = 0; offset < limit; offset += RR_SECTOR_SIZE) {
      var currentSectorId = rrReadU16LE(bytes, offset + 0xFF4);
      var currentSaveIndex = rrReadU32LE(bytes, offset + 0xFFC);
      if (currentSectorId === sectorId && currentSaveIndex > latestSaveIndex) {
        latestOffset = offset;
        latestSaveIndex = currentSaveIndex;
      }
    }
    return latestOffset;
  }

  function rrReadRandomizerSaveInfo(rawBytes) {
    var bytes = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes || 0);
    var trainerSector = rrFindSector(bytes, 0);
    var gameSector = rrFindSector(bytes, 4);

    if (trainerSector < 0 || gameSector < 0) {
      return {
        valid: false,
        trainerIdSecret: 0,
        restricted: false,
        hardmode: false,
        scaledSpecies: false,
        normalSpecies: false,
        randomLearnset: false,
        randomAbilities: false
      };
    }

    var randomizationFlags = rrReadU8(bytes, trainerSector + RR_RANDOMIZATION_BITFLAG);
    return {
      valid: true,
      trainerIdSecret: rrReadU32LE(bytes, trainerSector + RR_TRAINER_ID_OFFSET) >>> 0,
      restricted: (rrReadU8(bytes, gameSector + RR_RESTRICTED_BITFLAG) & 0x40) > 0,
      hardmode: (rrReadU8(bytes, gameSector + RR_HARDMODE_BITFLAG) & 0x10) > 0,
      scaledSpecies: (rrReadU8(bytes, trainerSector + RR_SCALED_SPECIES_BITFLAG) & 0x4) > 0,
      normalSpecies: (randomizationFlags & 0x1) > 0,
      randomLearnset: (randomizationFlags & 0x2) > 0,
      randomAbilities: (randomizationFlags & 0x4) > 0
    };
  }

  function rrParsePartyMon(monStruct, slot, saveInfo, options) {
    if (!monStruct || monStruct.length < RR_PARTY_STRUCT_SIZE) {
      return null;
    }

    var speciesId = rrReadU16LE(monStruct, 32);
    var speciesName = rrMons[speciesId];
    if (!rrIsValidSpeciesName(speciesName)) {
      return null;
    }

    var pid = rrReadU32LE(monStruct, 0);
    speciesName = rrResolveGenderedSpeciesName(speciesName, speciesId, pid);
    var abilitySlot = rrResolvePartyAbilitySlot(monStruct);

    var moveIds = [
      rrReadU16LE(monStruct, 44),
      rrReadU16LE(monStruct, 46),
      rrReadU16LE(monStruct, 48),
      rrReadU16LE(monStruct, 50)
    ];
    var moveNames = rrMapMoveIdsToNames(moveIds).filter(function (moveName) {
      return Boolean(moveName && moveName !== "(No Move)");
    });

    return {
      slot: slot,
      isParty: true,
      pid: pid >>> 0,
      speciesId: speciesId >>> 0,
      speciesName: speciesName,
      gender: speciesName === "Jellicent-F" ? "F" : undefined,
      exp: rrReadU32LE(monStruct, 36) >>> 0,
      level: rrResolveLevel(speciesName, rrReadU32LE(monStruct, 36) >>> 0, rrReadU8(monStruct, 84), options),
      natureName: rrNatures[pid % 25] || "Hardy",
      abilitySlot: abilitySlot,
      abilityName: rrResolveAbilityName(speciesName, speciesId, abilitySlot, saveInfo, options),
      moveIds: moveIds,
      moveNames: moveNames
    };
  }

  function rrParseBoxMon(monStruct, slot, saveInfo, options) {
    if (!monStruct || monStruct.length < RR_BOX_STRUCT_SIZE) {
      return null;
    }

    var speciesId = rrReadU16LE(monStruct, 28);
    var speciesName = rrMons[speciesId];
    if (!rrIsValidSpeciesName(speciesName)) {
      return null;
    }

    var pid = rrReadU32LE(monStruct, 0);
    speciesName = rrResolveGenderedSpeciesName(speciesName, speciesId, pid);
    var abilitySlot = rrResolveBoxAbilitySlot(monStruct);

    var moveIds = rrDecodePackedMoveIds(monStruct.subarray(39, 45));
    var moveNames = rrMapMoveIdsToNames(moveIds).filter(function (moveName) {
      return Boolean(moveName && moveName !== "(No Move)");
    });

    return {
      slot: slot,
      isParty: false,
      pid: pid >>> 0,
      speciesId: speciesId >>> 0,
      speciesName: speciesName,
      gender: speciesName === "Jellicent-F" ? "F" : undefined,
      exp: rrReadU32LE(monStruct, 32) >>> 0,
      level: rrResolveLevel(speciesName, rrReadU32LE(monStruct, 32) >>> 0, null, options),
      natureName: rrNatures[pid % 25] || "Hardy",
      abilitySlot: abilitySlot,
      abilityName: rrResolveAbilityName(speciesName, speciesId, abilitySlot, saveInfo, options),
      moveIds: moveIds,
      moveNames: moveNames
    };
  }

  function rrMonToShowdown(mon) {
    if (!mon) {
      return "";
    }

    var output = [];
    output.push(mon.speciesName + (mon.gender ? " (" + mon.gender + ")" : ""));
    output.push("Level: " + mon.level);
    output.push(mon.natureName + " Nature");
    output.push("Ability: " + mon.abilityName);
    mon.moveNames.forEach(function (moveName) {
      output.push("- " + moveName);
    });
    output.push("");
    return output.join("\n");
  }

  function rrScanBoxData(boxData, partyCount, saveInfo, options) {
    var parsedParty = [];
    var parsedBoxes = [];
    var foundMons = 0;

    for (var offset = 0; offset < boxData.length - 1;) {
      if (boxData[offset] !== RR_MAGIC_A || boxData[offset + 1] !== RR_MAGIC_B) {
        offset += 2;
        continue;
      }

      var isParty = foundMons < partyCount;
      var structSize = isParty ? RR_PARTY_STRUCT_SIZE : RR_BOX_STRUCT_SIZE;
      var structStart = offset - 18;
      if (structStart < 0 || (structStart + structSize) > boxData.length) {
        offset += 2;
        continue;
      }

      var monStruct = boxData.subarray(structStart, structStart + structSize);
      var mon = isParty
        ? rrParsePartyMon(monStruct, parsedParty.length + 1, saveInfo, options)
        : rrParseBoxMon(monStruct, parsedBoxes.length + 1, saveInfo, options);

      if (!mon) {
        offset += 2;
        continue;
      }

      if (isParty) {
        parsedParty.push(mon);
      } else {
        parsedBoxes.push(mon);
      }
      foundMons++;
      offset += structSize;
    }

    return {
      parsedParty: parsedParty,
      parsedBoxes: parsedBoxes
    };
  }

  function parseRadicalRedSaveFile(arrayBuffer, options) {
    var bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer || 0);
    var layout = rrResolveActiveLayout(bytes);
    var saveInfo = rrReadRandomizerSaveInfo(bytes);
    var parsed = rrScanBoxData(layout.boxData, layout.partyCount, saveInfo, options || {});
    var showdownImport = "";

    parsed.parsedParty.forEach(function (mon) {
      showdownImport += rrMonToShowdown(mon);
    });
    parsed.parsedBoxes.forEach(function (mon) {
      showdownImport += rrMonToShowdown(mon);
    });

    return {
      showdownImport: showdownImport,
      parsedParty: parsed.parsedParty,
      parsedBoxes: parsed.parsedBoxes,
      deadMons: [],
      partyCount: layout.partyCount,
      rrSaveInfo: saveInfo,
      layout: {
        blockOffset: layout.blockOffset,
        saveIndexA: layout.saveIndexA,
        saveIndexB: layout.saveIndexB,
        saveIndex: layout.saveIndex,
        rotation: layout.rotation,
        adjustment: layout.adjustment,
        totalOffset: layout.totalOffset,
        partyOffset: layout.partyOffset,
        boxOffset: layout.boxOffset
      }
    };
  }

  function rrShowLoadSuccess(fileName) {
    if (typeof document === "undefined") {
      return;
    }

    var now = new Date();
    var timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    var changelog = "<h4>Changelog:</h4>";
    changelog += "<p>" + fileName + " loaded at " + timeString + "</p>";
    if (typeof window.jQuery === "function") {
      if (window.jQuery("#changelog").length === 0) {
        window.jQuery("#clearSets").after("<p id='changelog'></p>");
      }
      window.jQuery("#changelog").html(changelog).show();
    }
  }

  function rrShouldHandleSaveUpload() {
    return (
      typeof window !== "undefined" &&
      typeof window.TITLE === "string" &&
      window.TITLE.indexOf("Radical Red") >= 0 &&
      window.baseGame === "rad_red"
    );
  }

  function rrBindSaveUpload() {
    if (typeof document === "undefined" || !rrShouldHandleSaveUpload()) {
      return;
    }

    var readSave = document.getElementById("read-save");
    var saveInput = document.getElementById("save-upload");
    if (!readSave || !saveInput || saveInput.dataset.rrSaveBound === "1") {
      return;
    }

    saveInput.dataset.rrSaveBound = "1";
    readSave.addEventListener("click", function () {
      saveInput.value = null;
    });

    saveInput.addEventListener("change", function (event) {
      if (!rrShouldHandleSaveUpload()) {
        return;
      }

      var file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }

      var selectedName = "";
      if (typeof window.jQuery === "function") {
        selectedName = (window.jQuery("#save-upload").val() || "").split("\\").pop();
      }
      if (!selectedName) {
        selectedName = file.name || "save.sav";
      }

      var reader = new FileReader();
      reader.onload = function (loadEvent) {
        try {
          var result = parseRadicalRedSaveFile(loadEvent.target.result);
          if (typeof window !== "undefined") {
            window.saveUploaded = true;
            window.saveFileName = selectedName;
            window.savExt = ((selectedName.split(".").pop()) || "").toLowerCase();
          }
          rrShowLoadSuccess(selectedName);

          if (typeof window.applyImportedSnapshot === "function") {
            window.applyImportedSnapshot({
              showdownImport: result.showdownImport,
              deadMons: [],
              source: "save-file",
              replaceDeadMons: true
            });
          } else if (typeof window.jQuery === "function") {
            window.jQuery(".import-team-text").val(result.showdownImport);
            window.jQuery("#import").click();
          }
        } catch (error) {
          console.error("Failed to parse Radical Red save.", error);
          alert("Unable to parse this Radical Red save. Only raw .sav/.srm files are supported right now.");
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (typeof window.jQuery === "function") {
      window.jQuery(function () {
        rrBindSaveUpload();
      });
    } else {
      document.addEventListener("DOMContentLoaded", rrBindSaveUpload);
    }
  }

  return {
    parseRadicalRedSaveFile: parseRadicalRedSaveFile,
    __test: {
      decodePackedMoveIds: rrDecodePackedMoveIds,
      randomizeAbilityId: rrRandomizeAbilityId,
      readRandomizerSaveInfo: rrReadRandomizerSaveInfo,
      resolveActiveLayout: rrResolveActiveLayout,
      resolveLevelFromExpTable: rrResolveLevelFromExpTable,
      resolveAbilityNameById: rrResolveAbilityNameById,
      resolveBaseAbilityId: rrResolveBaseAbilityId,
      resolveGenderedSpeciesName: rrResolveGenderedSpeciesName,
      randomizedAbilitiesEnabled: rrRandomizedAbilitiesEnabled,
      resolvePartyAbilitySlot: rrResolvePartyAbilitySlot,
      resolveBoxAbilitySlot: rrResolveBoxAbilitySlot
    }
  };
});
