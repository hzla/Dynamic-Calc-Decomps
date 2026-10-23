"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var parser = require("../../js/savereaders/savereader_radicalred.js");
var rrConstants = require("../../js/savereaders/save_constants/radical_red_constants.js");
var rrDexAbilityConstants = require("../../js/savereaders/save_constants/radical_red_dex_ability_constants.js");

function loadGlobalScript(relativePath) {
  var absolutePath = path.resolve(__dirname, relativePath);
  var code = fs.readFileSync(absolutePath, "utf8");
  vm.runInThisContext(code, { filename: absolutePath });
}

function ensureLevelDependenciesLoaded() {
  if (typeof global.expTables === "undefined" || typeof global.get_level !== "function") {
    loadGlobalScript("../../js/savereaders/enums.js");
  }
}

function writeU16LE(bytes, offset, value) {
  bytes[offset] = value & 0xFF;
  bytes[offset + 1] = (value >>> 8) & 0xFF;
}

function writeU32LE(bytes, offset, value) {
  bytes[offset] = value & 0xFF;
  bytes[offset + 1] = (value >>> 8) & 0xFF;
  bytes[offset + 2] = (value >>> 16) & 0xFF;
  bytes[offset + 3] = (value >>> 24) & 0xFF;
}

function makeMonStruct(speciesId, isParty) {
  var bytes = new Uint8Array(isParty ? 100 : 58);
  writeU32LE(bytes, 0, 2);
  bytes[18] = 2;
  bytes[19] = 2;
  writeU16LE(bytes, isParty ? 32 : 28, speciesId);
  return bytes;
}

function makeSave(party, boxes) {
  var bytes = new Uint8Array(0x20000);
  writeU16LE(bytes, 0xEFFC, 0xFFFF);
  bytes[0x1034] = party.length;
  party.forEach(function (mon, index) { bytes.set(mon, 0x1038 + index * 100); });
  boxes.forEach(function (mon, index) { bytes.set(mon, 0x5004 + index * 58); });
  return bytes;
}

function setSaveRandomizerFlags(bytes, randomAbilities, restricted) {
  // Keep unused sectors out of the latest trainer/game-sector lookup.
  for (var offset = 0; offset < 0x1C000; offset += 0x1000) {
    writeU16LE(bytes, offset + 0xFF4, 0xFFFF);
  }
  writeU16LE(bytes, 0xFF4, 0);
  writeU16LE(bytes, 0x4FF4, 4);
  writeU32LE(bytes, 0x00A, 2251340371);
  bytes[0xF2C] = 1 | (randomAbilities ? 4 : 0);
  bytes[0x4DC3] = restricted ? 0x40 : 0;
}

describe("Radical Red save reader helpers", function () {
  test("falls back to the zero-adjustment slot when the initial party count is empty", function () {
    var bytes = new Uint8Array(0x20000);
    bytes[0x0FFC] = 80;
    bytes[0x0FFD] = 0;
    bytes[0xE000 + 0x0FFC] = 79;
    bytes[0xE000 + 0x0FFD] = 0;
    bytes[0xB038 - 4] = 6;

    var layout = parser.__test.resolveActiveLayout(bytes);

    expect(layout.blockOffset).toBe(0);
    expect(layout.rotation).toBe(10);
    expect(layout.adjustment).toBe(0);
    expect(layout.totalOffset).toBe(0xA000);
    expect(layout.partyOffset).toBe(0xB038);
    expect(layout.partyCount).toBe(6);
  });

  test("decodes boxed 10-bit packed move ids", function () {
    var packedMoves = Uint8Array.from([0xF5, 0xC8, 0xAB, 0xDC, 0xCE, 0x00]);
    expect(parser.__test.decodePackedMoveIds(packedMoves)).toEqual([245, 754, 458, 827]);
  });

  test("resolves a level from a supplied exp table", function () {
    var expTable = [0, 0, 100, 300, 600, 1000];
    function getLevel(table, exp) {
      var level = 1;
      for (var i = 1; i < table.length; i++) {
        if (table[i] <= exp) {
          level = i;
        }
      }
      return level;
    }

    expect(parser.__test.resolveLevelFromExpTable(expTable, 350, getLevel)).toBe(3);
    expect(parser.__test.resolveLevelFromExpTable(expTable, 999, getLevel)).toBe(4);
  });

  test("maps randomized abilities through the normal and restricted pools", function () {
    expect(parser.__test.randomizeAbilityId(434248518, false, 49, 771)).toBe(93);
    expect(parser.__test.randomizeAbilityId(434248518, true, 49, 771)).toBe(116);
  });

  test("maps RR randomized ability ids back to RR ability names", function () {
    expect(parser.__test.resolveAbilityNameById(93)).toBe("Iron Fist");
    expect(parser.__test.resolveAbilityNameById(110)).toBe("Good as Gold");
    expect(parser.__test.resolveAbilityNameById(117)).toBe("Gale Wings");
    expect(parser.__test.resolveAbilityNameById(233)).toBe("Bone Zone");
  });

  test("maps saved RR ability slots to the matching RR dex ability ids for the species", function () {
    expect(parser.__test.resolveBaseAbilityId("Clodsire", 931, 1)).toBe(11);
    expect(parser.__test.resolveBaseAbilityId("Tsareena", 980, 1)).toBe(221);
    expect(parser.__test.resolveBaseAbilityId("Brute Bonnet", 1243, 0)).toBe(229);
    expect(parser.__test.resolveBaseAbilityId("Dragalge", 799, 0)).toBe(209);
    expect(parser.__test.resolveBaseAbilityId("Sandy Shocks", 1244, 0)).toBe(229);
    expect(parser.__test.resolveBaseAbilityId("Dragapult", 1179, 0)).toBe(29);
  });

  test("resolves Radical Red held item names by item id", function () {
    expect(parser.__test.resolveItemName(0)).toBe(null);
    expect(parser.__test.resolveItemName(140)).toBe("Persim Berry");
    expect(parser.__test.resolveItemName(208)).toBe("Magnet");
    expect(parser.__test.resolveItemName(675)).toBe("Wise Glasses");
    expect(parser.__test.resolveItemName(747)).toBe("Punching Glove");
    expect(parser.__test.resolveItemName(749)).toBe(null);
  });

  test("reads held items from Radical Red party and boxed structs", function () {
    var boltundId = rrConstants.mons.indexOf("Boltund");
    var rabscaId = rrConstants.mons.indexOf("Rabsca");
    expect(boltundId).toBeGreaterThan(0);
    expect(rabscaId).toBeGreaterThan(0);

    var partyMon = new Uint8Array(100);
    writeU32LE(partyMon, 0, 2);
    writeU16LE(partyMon, 32, boltundId);
    writeU16LE(partyMon, 34, 208);
    writeU32LE(partyMon, 36, 1);
    partyMon[84] = 27;

    var parsedPartyMon = parser.__test.parsePartyMon(partyMon, 1, { randomAbilities: false }, {});
    expect(parsedPartyMon.itemId).toBe(208);
    expect(parsedPartyMon.itemName).toBe("Magnet");
    expect(parser.__test.monToShowdown(parsedPartyMon).split("\n")[0]).toBe("Boltund @ Magnet");

    var boxedMon = new Uint8Array(58);
    writeU32LE(boxedMon, 0, 2);
    writeU16LE(boxedMon, 28, rabscaId);
    writeU16LE(boxedMon, 30, 675);
    writeU32LE(boxedMon, 32, 1);

    var parsedBoxedMon = parser.__test.parseBoxMon(boxedMon, 1, { randomAbilities: false }, {});
    expect(parsedBoxedMon.itemId).toBe(675);
    expect(parsedBoxedMon.itemName).toBe("Wise Glasses");
    expect(parser.__test.monToShowdown(parsedBoxedMon).split("\n")[0]).toBe("Rabsca @ Wise Glasses");
  });

  test("uses the active level cap instead of deriving Radical Red levels from EXP", function () {
    var boltundId = rrConstants.mons.indexOf("Boltund");
    var rabscaId = rrConstants.mons.indexOf("Rabsca");
    expect(boltundId).toBeGreaterThan(0);
    expect(rabscaId).toBeGreaterThan(0);

    var partyMon = new Uint8Array(100);
    writeU32LE(partyMon, 0, 2);
    writeU16LE(partyMon, 32, boltundId);
    writeU32LE(partyMon, 36, 1);
    partyMon[84] = 27;

    var parsedPartyMon = parser.__test.parsePartyMon(partyMon, 1, { randomAbilities: false }, {
      levelCap: 44,
      learnsets: { boltund: { gr: 4 } },
      expTables: [[0], [0], [0], [0], [0, 1]],
      getLevelFn: function () { return 2; }
    });
    expect(parsedPartyMon.exp).toBe(1);
    expect(parsedPartyMon.level).toBe(44);

    var boxedMon = new Uint8Array(58);
    writeU32LE(boxedMon, 0, 2);
    writeU16LE(boxedMon, 28, rabscaId);
    writeU32LE(boxedMon, 32, 1);

    var parsedBoxedMon = parser.__test.parseBoxMon(boxedMon, 1, { randomAbilities: false }, {
      levelCap: 44,
      learnsets: { rabsca: { gr: 4 } },
      expTables: [[0], [0], [0], [0], [0, 1]],
      getLevelFn: function () { return 2; }
    });
    expect(parsedBoxedMon.exp).toBe(1);
    expect(parsedBoxedMon.level).toBe(44);
  });

  test("reads the current app level cap when no explicit Radical Red level cap is supplied", function () {
    var previousGetActiveLevelCap = global.getActiveLevelCap;
    global.getActiveLevelCap = function () { return "36"; };

    try {
      expect(parser.__test.resolveLevelCap(27, {})).toBe(36);
    } finally {
      if (typeof previousGetActiveLevelCap === "undefined") {
        delete global.getActiveLevelCap;
      } else {
        global.getActiveLevelCap = previousGetActiveLevelCap;
      }
    }
  });

  test("treats RR saves with randomized abilities enabled as randomized regardless of the UI toggle", function () {
    expect(parser.__test.randomizedAbilitiesEnabled({ randomizedAbilitiesEnabled: false }, { randomAbilities: true })).toBe(true);
    expect(parser.__test.randomizedAbilitiesEnabled({ randomizedAbilitiesEnabled: false }, { randomAbilities: false })).toBe(false);
  });

  test("reads party hidden ability from the IV word before PID parity fallback", function () {
    var monStruct = new Uint8Array(100);
    monStruct[0] = 0x01;
    monStruct[72] = 0xFF;
    monStruct[73] = 0xFF;
    monStruct[74] = 0xFF;
    monStruct[75] = 0xBF; // 0xBFFFFFFF -> hidden ability bit set

    expect(parser.__test.resolvePartyAbilitySlot(monStruct)).toBe(2);
  });

  test("reads boxed hidden ability from the IV word before PID parity fallback", function () {
    var monStruct = new Uint8Array(58);
    monStruct[0] = 0x01;
    monStruct[54] = 0xFF;
    monStruct[55] = 0xFF;
    monStruct[56] = 0xFF;
    monStruct[57] = 0xBF; // 0xBFFFFFFF -> hidden ability bit set

    expect(parser.__test.resolveBoxAbilitySlot(monStruct)).toBe(2);
  });

  test("maps female Radical Red Jellicent saves to the female calc forme", function () {
    expect(parser.__test.resolveGenderedSpeciesName("Jellicent", 646, 0)).toBe("Jellicent-F");
    expect(parser.__test.resolveGenderedSpeciesName("Jellicent", 646, 255)).toBe("Jellicent");
    expect(parser.__test.resolveGenderedSpeciesName("Jellicent", 705, 255)).toBe("Jellicent-F");
  });
});

describe("Radical Red Silvally forms", function () {
  var forms = [
    [990, "Silvally"],
    [1048, "Silvally-Fighting"], [1049, "Silvally-Flying"],
    [1050, "Silvally-Poison"], [1051, "Silvally-Ground"],
    [1052, "Silvally-Rock"], [1053, "Silvally-Bug"],
    [1054, "Silvally-Ghost"], [1055, "Silvally-Steel"],
    [1056, "Silvally-Fire"], [1057, "Silvally-Water"],
    [1058, "Silvally-Grass"], [1059, "Silvally-Electric"],
    [1060, "Silvally-Psychic"], [1061, "Silvally-Ice"],
    [1062, "Silvally-Dragon"], [1063, "Silvally-Dark"],
    [1064, "Silvally-Fairy"]
  ];

  test.each(forms)("imports species %i as %s from both party and boxes", function (speciesId, speciesName) {
    var parsed = parser.parseRadicalRedSaveFile(makeSave(
      [makeMonStruct(speciesId, true), makeMonStruct(501, true)],
      [makeMonStruct(speciesId, false), makeMonStruct(801, false)]
    ), { randomizedAbilitiesEnabled: false });

    expect(parsed.parsedParty.map(function (mon) { return mon.speciesName; })).toEqual([speciesName, "Lucario"]);
    expect(parsed.parsedBoxes.map(function (mon) { return mon.speciesName; })).toEqual([speciesName, "Clawitzer"]);
    expect(parsed.parsedParty[0].abilityName).toBe("Battle Armor");
    expect(parsed.parsedBoxes[0].abilityName).toBe("Battle Armor");
    expect(parsed.showdownImport).toContain(speciesName + "\n");
  });

  // Reference rolls for trainer ID 2251340371:
  // https://github.com/JwowSquared/Radical-Red-Pokedex/blob/master/src/abilityRandomizer.js
  test.each([
    [false, ["Steam Engine", "Shadow Shield", "Sweet Veil", "Skill Link", "Plus", "Minus", "Hustle", "Cute Charm", "Pickup", "Truant", "Stalwart", "Hyper Cutter", "Blaze", "Torrent", "Liquid Ooze", "Overgrow", "Guts", "Marvel Scale"]],
    [true, ["Heavy Metal", "Mountaineer", "Friend Guard", "Dazzling", "Gluttony", "Liquid Voice", "Innards Out", "Berserk", "Primal Armor", "Frisk", "Unnerve", "Earth Eater", "Toxic Chain", "Grass Pelt", "Anger Point", "Parasitic Waste", "Surge Surfer", "Merciless"]]
  ])("uses saved randomized abilities for every form with restricted=%s and the UI toggle off", function (restricted, expectedAbilities) {
    var abilities = forms.map(function (form) {
      var save = makeSave([makeMonStruct(form[0], true)], [makeMonStruct(form[0], false)]);
      setSaveRandomizerFlags(save, true, restricted);
      var parsed = parser.parseRadicalRedSaveFile(save, { randomizedAbilitiesEnabled: false });

      expect(parsed.rrSaveInfo.randomAbilities).toBe(true);
      expect(parsed.rrSaveInfo.restricted).toBe(restricted);
      return [parsed.parsedParty[0].abilityName, parsed.parsedBoxes[0].abilityName];
    });

    expect(abilities).toEqual(expectedAbilities.map(function (abilityName) { return [abilityName, abilityName]; }));
  });

  test("keeps normal abilities when only species randomization is saved and the UI toggle is on", function () {
    var save = makeSave([makeMonStruct(1063, true)], [makeMonStruct(1063, false)]);
    setSaveRandomizerFlags(save, false, false);
    var parsed = parser.parseRadicalRedSaveFile(save, { randomizedAbilitiesEnabled: true });

    expect(parsed.rrSaveInfo.normalSpecies).toBe(true);
    expect(parsed.rrSaveInfo.randomAbilities).toBe(false);
    expect(parsed.parsedParty[0].abilityName).toBe("Battle Armor");
    expect(parsed.parsedBoxes[0].abilityName).toBe("Battle Armor");
  });

  test("imports the reported Dark Silvally record with its held item, moves, and randomized ability", function () {
    var boxedMon = Buffer.from("7be61da653ba3086bddcdde1d5dde6d5ffff0202c4d9dce9ffffff0027048e006aff050000ff03afc9e3d79500000000000000590482ffffff3f", "hex");
    var mon = parser.__test.parseBoxMon(boxedMon, 4, {
      randomAbilities: true,
      trainerIdSecret: 2251340371,
      restricted: false
    }, { levelCap: 85 });

    expect(mon).toMatchObject({
      speciesId: 1063,
      speciesName: "Silvally-Dark",
      abilityName: "Guts",
      itemName: "Sitrus Berry",
      moveNames: ["Fire Fang", "Crunch", "Iron Head", "Multi-Attack"]
    });
    expect(parser.__test.monToShowdown(mon)).toContain("Silvally-Dark @ Sitrus Berry\n");
  });

  test("keeps boxed records separate when a party species is unsupported", function () {
    var parsed = parser.parseRadicalRedSaveFile(makeSave(
      [makeMonStruct(0x7FFF, true), makeMonStruct(501, true)],
      [makeMonStruct(801, false), makeMonStruct(634, false)]
    ), { randomizedAbilitiesEnabled: false });

    expect(parsed.parsedParty.map(function (mon) { return mon.speciesName; })).toEqual(["Lucario"]);
    expect(parsed.parsedBoxes.map(function (mon) { return mon.speciesName; })).toEqual(["Clawitzer", "Swanna"]);
  });
});

describe("Radical Red other alternate forms", function () {
  // Audited against https://github.com/JwowSquared/Radical-Red-Pokedex/blob/master/data.js
  var arceusTypes = [
    "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel",
    "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark"
  ];
  var forms = Array.from({ length: 27 }, function (_, index) { return [413 + index, "Unown"]; })
    .concat(arceusTypes.map(function (type, index) { return [720 + index, "Arceus-" + type]; }))
    .concat([[834, "Arceus-Fairy"], [751, "Cherrim-Sunshine"], [757, "Keldeo-Resolute"]])
    .concat(Array.from({ length: 6 }, function (_, index) { return [1066 + index, "Minior"]; }))
    .concat([
      [1072, "Mimikyu-Busted"], [1073, "Magearna-Original"], [1087, "Pikachu-Cosplay"],
      [1093, "Pikachu-Original"], [1094, "Pikachu-Hoenn"], [1095, "Pikachu-Sinnoh"],
      [1096, "Pikachu-Unova"], [1097, "Pikachu-Kalos"], [1098, "Pikachu-Alola"],
      [1099, "Pikachu-Partner"], [1190, "Cramorant-Gulping"], [1191, "Cramorant-Gorging"],
      [1203, "Morpeko-Hangry"]
    ]);

  test.each(forms)("imports species %i as %s without dropping adjacent party or box records", function (speciesId, speciesName) {
    var parsed = parser.parseRadicalRedSaveFile(makeSave(
      [makeMonStruct(speciesId, true), makeMonStruct(501, true)],
      [makeMonStruct(speciesId, false), makeMonStruct(801, false)]
    ), { randomizedAbilitiesEnabled: false });

    expect(parsed.parsedParty.map(function (mon) { return mon.speciesName; })).toEqual([speciesName, "Lucario"]);
    expect(parsed.parsedBoxes.map(function (mon) { return mon.speciesName; })).toEqual([speciesName, "Clawitzer"]);
    expect(parsed.parsedParty[0].speciesId).toBe(speciesId);
    expect(parsed.parsedBoxes[0].speciesId).toBe(speciesId);
    expect(parsed.parsedParty[0].abilityName).not.toBe("Unknown");
    expect(parsed.parsedBoxes[0].abilityName).not.toBe("Unknown");
    expect(parsed.showdownImport).toContain(speciesName + "\n");
  });

  test("uses calculator-supported names for every restored form", function () {
    var species = require("../data/species.js").SPECIES[8];
    expect(forms.filter(function (form) { return !species[form[1]]; })).toEqual([]);
  });

  test("has a species name for every populated Radical Red dex entry", function () {
    var missing = [];
    rrDexAbilityConstants.abilityIdsBySpeciesId.forEach(function (abilities, speciesId) {
      if (Array.isArray(abilities) && (!rrConstants.mons[speciesId] || rrConstants.mons[speciesId] === "-----")) {
        missing.push(speciesId);
      }
    });
    expect(missing).toEqual([]);
  });

  test("continues rejecting unused species IDs and padding", function () {
    var unusedIds = [0, 412, 920, 1036, 1038, 1214, 1224, 1376, 1377, 1378]
      .concat(Array.from({ length: 25 }, function (_, index) { return 252 + index; }));
    unusedIds.forEach(function (speciesId) {
      expect(parser.__test.parsePartyMon(makeMonStruct(speciesId, true), 1, {}, {})).toBeNull();
      expect(parser.__test.parseBoxMon(makeMonStruct(speciesId, false), 1, {}, {})).toBeNull();
    });
  });
});

describe("Radical Red checked-in randomized save", function () {
  var repoSavePath = path.resolve(__dirname, "../../../radred.sav");
  var maybeTest = fs.existsSync(repoSavePath) ? test : test.skip;

  maybeTest("imports the expected randomized abilities from radred.sav", function () {
    var save = fs.readFileSync(repoSavePath);
    var parsed = parser.parseRadicalRedSaveFile(save, {
      randomizedAbilitiesEnabled: false
    });

    expect(parsed.rrSaveInfo.randomAbilities).toBe(true);
    expect(parsed.parsedParty.map(function (mon) { return mon.speciesName; })).toEqual([
      "Clodsire",
      "Tsareena",
      "Brute Bonnet",
      "Dragalge",
      "Sandy Shocks"
    ]);
    expect(parsed.parsedParty.map(function (mon) { return mon.abilityName; })).toEqual([
      "As One",
      "Rivalry",
      "Tinted Lens",
      "Damp",
      "Dry Skin"
    ]);
    expect(parsed.parsedBoxes[0].speciesName).toBe("Dragapult");
    expect(parsed.parsedBoxes[0].abilityName).toBe("Download");
  });
});

describe("Radical Red local save validation", function () {
  var savePath = process.env.RADICAL_RED_SAVE_PATH;
  var maybeTest = savePath ? test : test.skip;

  maybeTest("parses a local Radical Red save with level-cap levels and randomized abilities", function () {
    ensureLevelDependenciesLoaded();

    var save = fs.readFileSync(savePath);
    var sampledLearnsets = {
      talonflame: { gr: 3 },
      gholdengo: { gr: 5 },
      kommoo: { gr: 5 },
      lunala: { gr: 5 },
      lopunny: { gr: 0 },
      tapufini: { gr: 5 },
      samurotthisui: { gr: 3 },
      ursalunabloodmoon: { gr: 0 },
      fluttermane: { gr: 5 },
    };
    var randomized = parser.parseRadicalRedSaveFile(save, {
      randomizedAbilitiesEnabled: false,
      levelCap: 85,
      learnsets: sampledLearnsets,
      expTables: global.expTables,
      getLevelFn: global.get_level,
    });

    expect(randomized.parsedParty.length).toBeGreaterThan(0);
    expect(randomized.showdownImport).toContain(randomized.parsedParty[0].speciesName);
    expect(randomized.rrSaveInfo.valid).toBe(true);

    if (path.basename(savePath) === "Radical Red 4.1.sav") {
      expect(randomized.parsedParty.slice(0, 6).map(function (mon) { return mon.speciesName; })).toEqual([
        "Talonflame",
        "Gholdengo",
        "Kommo-o",
        "Lunala",
        "Lopunny",
        "Tapu Fini",
      ]);
      expect(randomized.parsedParty.slice(0, 6).map(function (mon) { return mon.level; })).toEqual([85, 85, 85, 85, 85, 85]);
      expect(randomized.parsedBoxes[0].speciesName).toBe("Samurott-Hisui");
      expect(randomized.parsedBoxes[0].level).toBe(85);
      expect(randomized.rrSaveInfo.randomAbilities).toBe(true);
      expect(randomized.parsedParty[0].abilityName).toBe("Iron Fist");
      expect(randomized.parsedParty[1].abilityName).toBe("Bone Zone");
      expect(randomized.parsedParty[5].speciesName).toBe("Dragapult");
      expect(randomized.parsedParty[5].abilityName).toBe("Download");
      expect(randomized.parsedBoxes[1].speciesName).toBe("Wobbuffet");
      expect(randomized.parsedBoxes[1].abilityName).toBe("Delta Stream");
      expect(randomized.parsedBoxes[9].speciesName).toBe("Leavanny");
      expect(randomized.parsedBoxes[9].abilityName).toBe("Pickup");
    }
  });
});
