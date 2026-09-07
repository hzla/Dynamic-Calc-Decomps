"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadNullSaveReader() {
    var context = {
        console: {
            log: function () {},
            warn: function () {},
            error: function () {}
        },
        window: { baseGame: "test" }
    };
    vm.createContext(context);
    [
        "../../js/savereaders/save_constants/null_constants.js",
        "../../js/savereaders/savereader_null.js"
    ].forEach(function (relativePath) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, relativePath), "utf8"), context);
    });
    return context;
}

function writeUint32(bytes, offset, value) {
    bytes[offset] = value & 0xFF;
    bytes[offset + 1] = (value >>> 8) & 0xFF;
    bytes[offset + 2] = (value >>> 16) & 0xFF;
    bytes[offset + 3] = (value >>> 24) & 0xFF;
}

function makeZeroPersonalityOverqwilChunk() {
    var bytes = new Uint8Array(84);
    var personality = 0;
    var otId = 42069;
    var encryptionKey = (personality ^ otId) >>> 0;
    var logicalWords = [
        [904, 91125, 0],
        [(242 << 16) | 269, (103 << 16) | 92, 0],
        [0, 0, 0],
        [0, 31, 0]
    ];

    writeUint32(bytes, 0, personality);
    writeUint32(bytes, 4, otId);
    bytes[20] = 2;
    bytes[21] = 2;

    logicalWords.forEach(function (words, block) {
        words.forEach(function (word, index) {
            writeUint32(bytes, 36 + (block * 12) + (index * 4), (word ^ encryptionKey) >>> 0);
        });
    });
    return bytes;
}

describe("Pokemon Null save reader", function () {
    test("decodes a valid boxed Pokemon whose personality value is zero", function () {
        var context = loadNullSaveReader();
        var mon = context.nullParseMonChunkExact(makeZeroPersonalityOverqwilChunk(), false, 10);

        expect(mon).not.toBeNull();
        expect(mon.slot).toBe(10);
        expect(mon.personality).toBe(0);
        expect(mon.otId).toBe(42069);
        expect(mon.speciesId).toBe(904);
        expect(mon.speciesName).toBe("Overqwil");
        expect(mon.moveNames).toEqual(["Taunt", "Crunch", "Toxic", "Screech"]);
    });

    test("still ignores a genuinely empty boxed slot", function () {
        var context = loadNullSaveReader();

        expect(context.nullParseMonChunkExact(new Uint8Array(84), false, 10)).toBeNull();
    });
});
