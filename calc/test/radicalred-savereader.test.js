"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var parser = require("../../js/savereaders/savereader_radicalred.js");

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

  maybeTest("parses a local Radical Red save with EXP-derived levels and randomized abilities", function () {
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
      expect(randomized.parsedParty.slice(0, 6).map(function (mon) { return mon.level; })).toEqual([85, 78, 85, 85, 85, 85]);
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
