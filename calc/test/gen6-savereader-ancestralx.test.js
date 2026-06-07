"use strict";

function installDomStubs() {
  const chain = {
    ready: function () { return chain; },
    off: function () { return chain; },
    on: function () { return chain; },
  };

  global.document = {};
  global.$ = function () { return chain; };
}

function toID(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function installSpeciesDex() {
  global.calc = {
    toID,
    SPECIES: {
      6: {
        Charmander: { gr: 3 },
        Mewtwo: { gr: 5 },
        Keldeo: { gr: 3 },
        Giratina: { gr: 5 },
        "Giratina-Origin": { baseSpecies: "Giratina", gr: 5 },
      },
    },
  };
}

function writeU32LE(bytes, offset, value) {
  bytes[offset] = value & 0xFF;
  bytes[offset + 1] = (value >>> 8) & 0xFF;
  bytes[offset + 2] = (value >>> 16) & 0xFF;
  bytes[offset + 3] = (value >>> 24) & 0xFF;
}

describe("Gen 6 save reader Ancestral X EXP tables", function () {
  var reader;

  beforeEach(function () {
    jest.resetModules();
    installDomStubs();
    installSpeciesDex();
    global.window = global;
    global.TITLE = "Ancestral X";
    reader = require("../../js/savereaders/savereader_g6.js").__test;
  });

  afterEach(function () {
    delete global.calc;
    delete global.document;
    delete global.$;
    delete global.window;
    delete global.TITLE;
    delete global.expTables;
    delete global.get_level;
  });

  test("uses Slow for non-legendary XY imports on Ancestral X", function () {
    expect(reader.g67ResolveGrowthRate(4, "Charmander", 6, "XY")).toBe(reader.G67_ANCESTRAL_X_SLOW_GROWTH);
  });

  test("uses Fast for listed legendary XY imports on Ancestral X", function () {
    expect(reader.g67ResolveGrowthRate(150, "Mewtwo", 6, "XY")).toBe(reader.G67_ANCESTRAL_X_FAST_GROWTH);
  });

  test("uses Fast for mythic XY imports on Ancestral X", function () {
    expect(reader.g67ResolveGrowthRate(647, "Keldeo", 6, "XY")).toBe(reader.G67_ANCESTRAL_X_FAST_GROWTH);
  });

  test("uses Fast for listed legendary formes through their base species", function () {
    expect(reader.g67ResolveGrowthRate(487, "Giratina-Origin", 6, "XY")).toBe(reader.G67_ANCESTRAL_X_FAST_GROWTH);
  });

  test("keeps vanilla growth rates outside the Ancestral X XY context", function () {
    expect(reader.g67ResolveGrowthRate(150, "Mewtwo", 6, "ORAS")).toBe(5);

    global.TITLE = "Pokemon X";
    expect(reader.g67ResolveGrowthRate(4, "Charmander", 6, "XY")).toBe(3);
  });

  test("routes boxed levels through the overridden EXP tables", function () {
    const decrypted = new Uint8Array(0x104);
    writeU32LE(decrypted, 0x10, 12345);
    global.expTables = [];
    global.expTables[reader.G67_ANCESTRAL_X_FAST_GROWTH] = ["fast"];
    global.expTables[reader.G67_ANCESTRAL_X_SLOW_GROWTH] = ["slow"];
    global.get_level = jest.fn(function (table) {
      return table[0] === "fast" ? 44 : 55;
    });

    expect(reader.g67ResolveLevel(decrypted, 150, "Mewtwo", 6, false, "XY")).toBe(44);
    expect(reader.g67ResolveLevel(decrypted, 4, "Charmander", 6, false, "XY")).toBe(55);
  });

  test("keeps using the stored party level when one is available", function () {
    const decrypted = new Uint8Array(0x104);
    decrypted[0xEC] = 17;
    global.expTables = [];
    global.get_level = jest.fn();

    expect(reader.g67ResolveLevel(decrypted, 4, "Charmander", 6, true, "XY")).toBe(17);
    expect(global.get_level).not.toHaveBeenCalled();
  });
});
