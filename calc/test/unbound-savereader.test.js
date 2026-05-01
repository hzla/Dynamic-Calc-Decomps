"use strict";

var fs = require("fs");
var path = require("path");

var constants = require("../../js/savereaders/save_constants/unbound_2_1_constants.js");
var parser = require("../../js/savereaders/savereader_unbound.js");

var SAVE_DIR = path.resolve(__dirname, "../../../Unbound-Cloud/server/pytests/data/saves");
var DATA_DIR = path.resolve(__dirname, "../../../Unbound-Cloud/server/pytests/data");

var SPECIES_ID_BY_DEFINE = reverseLookup(constants.SPECIES_BY_ID);
var ITEM_ID_BY_DEFINE = reverseLookup(constants.ITEMS_BY_ID);
var MOVE_ID_BY_DEFINE = reverseLookup(constants.MOVES_BY_ID);

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

function reverseLookup(idToDefineMap) {
  var reversed = Object.create(null);
  Object.keys(idToDefineMap || {}).forEach(function (rawId) {
    reversed[idToDefineMap[rawId]] = Number(rawId);
  });
  return reversed;
}

function loadSaveArrayBuffer(name) {
  var savePath = path.join(SAVE_DIR, name);
  var buffer = fs.readFileSync(savePath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
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

function expectedAbility(mon, speciesDefine) {
  var baseStats = constants.BASE_STATS_BY_SPECIES[speciesDefine];
  if (mon.hiddenAbility && baseStats.hiddenAbility !== "ABILITY_NONE") {
    return {
      abilitySlot: 2,
      abilityName: constants.ABILITY_DISPLAY_NAMES_BY_DEFINE[baseStats.hiddenAbility]
    };
  }
  if ((mon.personality & 1) === 0 || baseStats.ability2 === "ABILITY_NONE") {
    return {
      abilitySlot: 0,
      abilityName: constants.ABILITY_DISPLAY_NAMES_BY_DEFINE[baseStats.ability1]
    };
  }
  return {
    abilitySlot: 1,
    abilityName: constants.ABILITY_DISPLAY_NAMES_BY_DEFINE[baseStats.ability2]
  };
}

function expectedMoveNames(moveDefines) {
  return moveDefines.map(function (moveDefine) {
    if (!moveDefine || moveDefine === "MOVE_NONE") {
      return "-";
    }
    return constants.MOVE_DISPLAY_NAMES_BY_DEFINE[moveDefine];
  });
}

function expectedMetGameName(metGame) {
  if (metGame === "unbound") {
    return "unbound";
  }
  return metGame;
}

function toExpectedParsedBox(mon) {
  var speciesDefine = normalizeSpeciesDefine(mon.species);
  var ability = expectedAbility(mon, speciesDefine);

  return {
    speciesId: SPECIES_ID_BY_DEFINE[speciesDefine],
    speciesName: constants.SPECIES_DISPLAY_NAMES_BY_DEFINE[speciesDefine],
    nickname: (mon.nickname || "").trim(),
    itemId: ITEM_ID_BY_DEFINE[mon.item],
    itemName: mon.item === "ITEM_NONE" ? null : constants.ITEM_DISPLAY_NAMES_BY_DEFINE[mon.item],
    moveIds: mon.moves.map(function (moveDefine) { return MOVE_ID_BY_DEFINE[moveDefine]; }),
    moveNames: expectedMoveNames(mon.moves),
    abilitySlot: ability.abilitySlot,
    abilityName: ability.abilityName,
    natureName: constants.NATURE_DISPLAY_NAMES[mon.personality % 25],
    ivs: mon.ivs,
    evs: mon.evs,
    shiny: mon.shiny,
    gender: mon.gender,
    metGame: expectedMetGameName(mon.metGame),
    metLevel: mon.metLevel,
    metLocationId: mon.metLocaton,
    nicknameTrimmed: (mon.nickname || "").trim()
  };
}

describe("Pokemon Unbound 2.1 save reader", function () {
  test("accepts a supported Unbound 2.1 save and reports the expected profile metadata", function () {
    var result = parser.parseUnboundSaveFile(loadSaveArrayBuffer("flex.sav"));
    expect(result.fileSignature).toBe(constants.FILE_SIGNATURE);
    expect(result.profileKey).toBe("unbound_2_1");
    expect(result.deadMons).toEqual([]);
    expect(Array.isArray(result.parsedParty)).toBe(true);
    expect(Array.isArray(result.parsedBoxes)).toBe(true);
    expect(result.showdownImport.trim().length).toBeGreaterThan(0);
  });

  test("rejects non-Unbound-2.1 saves", function () {
    expect(function () {
      parser.parseUnboundSaveFile(loadSaveArrayBuffer("old_unbound_version.sav"));
    }).toThrow(/Unbound 2\.1/i);
  });

  test("rejects randomized Unbound saves", function () {
    expect(function () {
      parser.parseUnboundSaveFile(loadSaveArrayBuffer("single_save_randomizer.sav"));
    }).toThrow(/Randomized/i);
  });

  test("matches the Unbound-Cloud flex fixture for parsed live box data", function () {
    var result = parser.parseUnboundSaveFile(loadSaveArrayBuffer("flex.sav"));
    var expectedBoxes = loadJson("flex.json").filter(function (mon) {
      return mon.species !== "SPECIES_NONE" && !mon.isEgg;
    });
    var expectedTitles = loadJson("flex_titles.json");

    expect(result.boxTitles).toEqual(expectedTitles);
    expect(result.parsedBoxes.length).toBe(expectedBoxes.length);

    for (var i = 0; i < expectedBoxes.length; i++) {
      var expected = toExpectedParsedBox(expectedBoxes[i]);
      var actual = result.parsedBoxes[i];

      expect(actual.speciesId).toBe(expected.speciesId);
      expect(actual.speciesName).toBe(expected.speciesName);
      expect(actual.nickname).toBe(expected.nicknameTrimmed);
      expect(actual.itemId).toBe(expected.itemId);
      expect(actual.itemName).toBe(expected.itemName);
      expect(actual.moveIds).toEqual(expected.moveIds);
      expect(actual.moveNames).toEqual(expected.moveNames);
      expect(actual.abilitySlot).toBe(expected.abilitySlot);
      expect(actual.abilityName).toBe(expected.abilityName);
      expect(actual.natureName).toBe(expected.natureName);
      expect(actual.ivs).toEqual(expected.ivs);
      expect(actual.evs).toEqual(expected.evs);
      expect(actual.shiny).toBe(expected.shiny);
      expect(actual.gender).toBe(expected.gender);
      expect(actual.metGame).toBe(expected.metGame);
      expect(actual.metLevel).toBe(expected.metLevel);
      expect(actual.metLocationId).toBe(expected.metLocationId);
    }
  });

  test("formats Showdown export text from the parsed snapshot", function () {
    var result = parser.parseUnboundSaveFile(loadSaveArrayBuffer("flex.sav"));
    var lines = result.showdownImport.split("\n");

    expect(result.parsedParty.length).toBeGreaterThan(0);
    expect(lines[0]).toContain(result.parsedParty[0].speciesName);
    expect(lines).toContain("Ability: Aftermath");
    expect(lines).toContain("- Discharge");
    expect(lines).toContain("Roly-Poly (Electrode)");
    expect(lines).not.toContain("Met: null");
  });
});
