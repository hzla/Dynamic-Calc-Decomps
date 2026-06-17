"use strict";

function installDomStubs() {
  const chain = {
    ready: function () { return chain; },
    click: function () { return chain; },
    val: function () { return "21"; },
    text: function () { return ""; },
    find: function () { return chain; },
    first: function () { return chain; },
    show: function () { return chain; },
    hide: function () { return chain; },
    html: function () { return chain; },
    after: function () { return chain; },
    remove: function () { return chain; },
    append: function () { return chain; },
    is: function () { return false; },
    length: 0,
  };

  global.document = {};
  global.$ = function () { return chain; };
  global.alert = jest.fn();
}

describe("Gen 4 save editor party slot bookkeeping", function () {
  var reader;

  beforeEach(function () {
    jest.resetModules();
    installDomStubs();
    jest.spyOn(console, "warn").mockImplementation(function () {});
    global.sav_pok_growths = [];
    global.sav_pok_growths[301] = 3;
    global.sav_pok_growths[999] = undefined;
    global.expTables = [];
    global.expTables[3] = Array.from({ length: 101 }, function (_, i) { return i * 1000; });
    reader = require("../../js/savereaders/savereader.js").__test;
    reader.resetParsedPokemonGlobalsForGen4Import();
  });

  afterEach(function () {
    console.warn.mockRestore();
  });

  test("keeps party core arrays aligned when an earlier slot is unrecognized", function () {
    var unknownCore = [999];
    var delcattyCore = [301];

    global.decryptedBattleStats[1] = [0, 0, 21];
    reader.recordDsPartySlotMetadata({
      slotIndex: 1,
      speciesName: "",
      rawSpeciesId: 999,
      pv: 0x11111111,
      decryptedData: unknownCore,
      monDataOffset: 0,
      moveDataOffset: 16,
      valid: false,
      isEgg: false,
    });

    global.decryptedBattleStats[2] = [0, 0, 21];
    reader.recordDsPartySlotMetadata({
      slotIndex: 2,
      speciesName: "Delcatty",
      rawSpeciesId: 301,
      pv: 0x22222222,
      decryptedData: delcattyCore,
      monDataOffset: 0,
      moveDataOffset: 16,
      valid: true,
      isEgg: false,
    });

    expect(global.partyMons.Delcatty).toBe(2);
    expect(global.savParty[1]).toBe(unknownCore);
    expect(global.savParty[2]).toBe(delcattyCore);
    expect(global.partyPIDs[2]).toBe(0x22222222);
    expect(global.partyExpTables[2]).toBe(3);
    expect(reader.isWritableDsPartySlot(2, "Delcatty")).toBe(true);
  });

  test("refuses to write eggs or unrecognized species", function () {
    global.decryptedBattleStats[0] = [0, 0, 21];
    reader.recordDsPartySlotMetadata({
      slotIndex: 0,
      speciesName: "Egg",
      rawSpeciesId: 650,
      pv: 0x33333333,
      decryptedData: [650],
      monDataOffset: 0,
      moveDataOffset: 16,
      valid: true,
      isEgg: true,
    });

    expect(reader.isWritableDsPartySlot(0, "Egg")).toBe(false);
    expect(global.alert).toHaveBeenCalled();
  });

  test("allows a valid party slot with PID zero", function () {
    var validCore = [301];

    global.decryptedBattleStats[0] = [0, 0, 21];
    reader.recordDsPartySlotMetadata({
      slotIndex: 0,
      speciesName: "Delcatty",
      rawSpeciesId: 301,
      pv: 0,
      decryptedData: validCore,
      monDataOffset: 0,
      moveDataOffset: 16,
      valid: true,
      isEgg: false,
    });

    expect(global.partyMons.Delcatty).toBe(0);
    expect(global.partyPIDs[0]).toBe(0);
    expect(reader.isWritableDsPartySlot(0, "Delcatty")).toBe(true);
    expect(global.alert).not.toHaveBeenCalled();
  });

  test("does not treat a zero-exp hatched Gen 4 Pokemon as an egg", function () {
    global.baseGame = "HGSS";
    global.gameGen = 4;
    global.gen = 4;
    global.mechanics = "";
    global.settings = { devMode: false };
    global.blockOrders = [[0, 1, 2, 3]];
    global.mon_forms = {};
    global.pokedex = {};
    global.sav_pok_names = [];
    global.sav_pok_names[175] = "Togepi";
    global.sav_item_names = ["None"];
    global.sav_move_names = ["-----", "Growl", "Charm"];
    global.sav_abilities = [];
    global.sav_abilities[1] = "Hustle";
    global.sav_pok_growths[175] = 3;
    global.locations = { HGSS: ["Mystery Zone"] };
    global.natures = ["Hardy"];
    global.textTable = {
      1: "T",
      2: "o",
      3: "g",
      4: "e",
      5: "p",
      6: "i",
    };
    global.SPECIES_BY_ID = [];
    global.SPECIES_BY_ID[4] = { togepi: { name: "Togepi" } };
    global.cleanString = function (value) {
      return String(value || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    };
    global.resolveSavLevelFromExperience = function () {
      return 1;
    };

    var decrypted = Array(64).fill(0);
    decrypted[0] = 175;
    decrypted[6] = 1 << 8;
    decrypted[16] = 1;
    decrypted[17] = 2;
    decrypted[32] = 1;
    decrypted[33] = 2;
    decrypted[34] = 3;
    decrypted[35] = 4;
    decrypted[36] = 5;
    decrypted[37] = 6;

    var checksum = 0x1234;
    var encrypted = reader.encryptData(decrypted, checksum);
    var chunk = new Uint8Array(136);
    chunk[6] = checksum & 0xFF;
    chunk[7] = (checksum >>> 8) & 0xFF;
    for (var i = 0; i < encrypted.length; i++) {
      chunk[8 + (i * 2)] = encrypted[i] & 0xFF;
      chunk[9 + (i * 2)] = (encrypted[i] >>> 8) & 0xFF;
    }

    var result = reader.parsePKM(chunk, false, 0);

    expect(reader.isDsSaveEggPokemon("Togepi", 0)).toBe(false);
    expect(result).toContain("Togepi");
    expect(result).toContain("@ None");
    expect(result).toContain("Level: 1");
    expect(result).not.toContain("(Egg)");
    expect(result).not.toContain("Egg: Yes");
  });

  test("skips encrypted-empty Gen 5 box slots with species id zero", function () {
    global.baseGame = "BW";
    global.gameGen = 5;
    global.gen = 5;
    global.blockOrders = [[0, 1, 2, 3]];

    var decrypted = Array(64).fill(0);
    var encrypted = reader.encryptData(decrypted, 0);
    var chunk = new Uint8Array(136);
    for (var i = 0; i < encrypted.length; i++) {
      chunk[8 + (i * 2)] = encrypted[i] & 0xFF;
      chunk[9 + (i * 2)] = (encrypted[i] >>> 8) & 0xFF;
    }

    expect(Array.from(chunk).some(function (byte) { return byte !== 0; })).toBe(true);
    expect(reader.parsePKM(chunk, false, 0x510)).toBe("");
  });

});
