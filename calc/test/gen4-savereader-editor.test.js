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
});
