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

  test("treats RR saves with randomized abilities enabled as randomized regardless of the UI toggle", function () {
    expect(parser.__test.randomizedAbilitiesEnabled({ randomizedAbilitiesEnabled: false }, { randomAbilities: true })).toBe(true);
    expect(parser.__test.randomizedAbilitiesEnabled({ randomizedAbilitiesEnabled: false }, { randomAbilities: false })).toBe(false);
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
    }
  });
});
