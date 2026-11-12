const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

function runtime() {
    const ctx = {
        console: { log() {}, warn() {} },
        document: {},
        $: () => ({ ready() {}, click() {} }),
        baseGame: "Pt",
        gameGen: 4,
        gen: 9,
        mechanics: "tarnished-platinum",
        save_expansion: false,
        cleanString: name => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
        SPECIES_BY_ID: { 9: { shinx: { name: "Shinx" }, bidoof: { name: "Bidoof" }, lechonk: { name: "Lechonk" } } },
    };
    ctx.window = ctx;
    vm.createContext(ctx);
    for (const file of ["enums.js", "save_constants/tarnished_platinum.js", "savereader.js", "savereader_tarnished_platinum.js"]) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, "../../js/savereaders", file), "utf8"), ctx);
    }
    const defaults = ctx.TARNISHED_PLATINUM_SAVE_INCLUDES;
    ctx.sav_pok_names = defaults.poks.slice();
    ctx.sav_move_names = defaults.moves.slice();
    ctx.sav_item_names = defaults.items.slice();
    ctx.sav_pok_growths = defaults.growths.slice();
    ctx.sav_abilities = defaults.abilities.slice();
    return ctx;
}

function crc16(bytes) {
    let crc = 0xFFFF;
    for (const byte of bytes) {
        crc ^= byte << 8;
        for (let i = 0; i < 8; i++) crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 0xFFFF;
    }
    return crc;
}

function finishBlock(bytes, start, length, generation, revision, id) {
    const footer = start + length - 20;
    bytes.writeUInt32LE(generation, footer);
    bytes.writeUInt32LE(revision, footer + 4);
    bytes.writeUInt32LE(length, footer + 8);
    bytes.writeUInt32LE(0x20060623, footer + 12);
    bytes.writeUInt16LE(id, footer + 16);
    bytes.writeUInt16LE(crc16(bytes.subarray(start, footer)), footer + 18);
}

function encryptWords(bytes, target, offset, seed) {
    for (let i = 0; i < bytes.length; i += 2) {
        seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
        target.writeUInt16LE(bytes.readUInt16LE(i) ^ (seed >>> 16), offset + i);
    }
}

function writePokemon(save, offset, species, name, level = null, overrides = {}) {
    const pid = 1; // Identity block order, Lonely nature.
    const data = Buffer.alloc(128);
    data.writeUInt16LE(species, 0);
    data.writeUInt16LE(overrides.item ?? 0, 2);
    data.writeUInt32LE(27, 8);
    data[13] = overrides.ability ?? (species === 403 ? 22 : 47);
    data[15] = 2;
    (overrides.moves ?? [33, 43]).forEach((move, slot) => data.writeUInt16LE(move, 32 + slot * 2));
    for (let i = 0; i < name.length; i++) data.writeUInt16LE(0x12B + name.charCodeAt(i) - 65, 64 + i * 2);
    data.writeUInt16LE(0xFFFF, 64 + name.length * 2);
    let checksum = 0;
    for (let i = 0; i < data.length; i += 2) checksum = (checksum + data.readUInt16LE(i)) & 0xFFFF;
    save.writeUInt32LE(pid, offset);
    save.writeUInt16LE(checksum, offset + 6);
    encryptWords(data, save, offset + 8, checksum);
    if (level !== null) {
        const party = Buffer.alloc(100);
        party[4] = level;
        encryptWords(party, save, offset + 136, pid);
    }
}

function sampleLayout() {
    const save = Buffer.alloc(0x80000);
    save.writeUInt32LE(1, 0x9C);
    save.writeUInt32LE(1, 0x4009C);
    writePokemon(save, 0xA0, 399, "BIDOOF", 4);
    writePokemon(save, 0x400A0, 403, "SHINX", 5);
    writePokemon(save, 0xD15C, 494, "LECHONK");
    writePokemon(save, 0xD15C + 539 * 136, 399, "BIDOOF");
    writePokemon(save, 0x4D15C, 403, "SHINX");
    finishBlock(save, 0, 0xD158, 3, 6, 0);
    finishBlock(save, 0x40000, 0xD158, 4, 7, 0);
    finishBlock(save, 0xD158, 0x134E0, 4, 5, 1);
    finishBlock(save, 0x4D158, 0x134E0, 3, 3, 1);
    return save;
}

test("selects the matching latest party and PC blocks even in opposite banks", () => {
    const ctx = runtime();
    const save = sampleLayout();
    const original = Buffer.from(save);
    const { partyOffset, boxOffset } = ctx.getTarnishedPlatinumSaveBlocks(save);
    assert.equal(partyOffset, 0x4009C);
    assert.equal(boxOffset, 0xD15C);
    const result = ctx.parseTarnishedPlatinumSave(save);
    assert.match(result.showdownImport, /^Shinx \(M\) @ None\nLevel: 5\nLonely Nature\nAbility: Intimidate/);
    assert.match(result.showdownImport, /- Tackle\n- Leer\n/);
    assert.match(result.showdownImport, /Lechonk \(M\) @ None\nLevel: 3\nLonely Nature\nAbility: Thick Fat/);
    assert.match(result.showdownImport, /Bidoof \(M\)/);
    assert.equal(ctx.boxPokOffsets.Bidoof.offset, boxOffset + 539 * 136);
    assert.equal(result.unmappedIds.species.size, 0);
    assert.doesNotMatch(result.showdownImport, /Victini|undefined|-----/);
    assert.deepEqual(Array.from(ctx.currentParty), ["Shinx"]);
    assert.deepEqual(save, original);
});

test("preserves ROM indices for reordered move, held item and ability constants", () => {
    const ctx = runtime();
    const save = sampleLayout();
    writePokemon(save, 0xD15C, 494, "LECHONK", null, { item: 529, ability: 194, moves: [543, 562, 595, 637] });
    finishBlock(save, 0xD158, 0x134E0, 4, 5, 1);
    const result = ctx.parseTarnishedPlatinumSave(save);
    assert.match(result.showdownImport, /Lechonk \(M\) @ Air Balloon\nLevel: 3\nLonely Nature\nAbility: Moxie/);
    assert.match(result.showdownImport, /- High Horsepower\n- Stomping Tantrum\n- Triple Arrows\n- Hidden Power Psychic\n/);
    assert.ok(Object.values(result.unmappedIds).every(ids => ids.size === 0));
});

test("built-in tables have no shifted indices or missing growth curves", () => {
    const ctx = runtime();
    const { poks, moves, items, growths, abilities } = ctx.TARNISHED_PLATINUM_SAVE_INCLUDES;
    assert.deepEqual([poks.length, moves.length, items.length, growths.length, abilities.length], [811, 640, 532, 811, 198]);
    assert.ok(growths.every(rate => Number.isInteger(rate) && rate >= 0 && rate <= 5));
    assert.equal(poks[548], "Meowth-Alola");
    assert.equal(poks[650], "Gardevoir-Mega");
    assert.equal(poks[698], "Basculegion-F");
    assert.equal(poks[773], "Tauros-Paldea-Aqua");
    assert.equal(poks[810], "Bad Egg");
    assert.equal(growths[494], 0);
    assert.deepEqual(Array.from(growths.slice(809)), [5, 5]);
    assert.equal(moves[639], "Circle Throw");
    assert.equal(items[531], "Charizardite X");
    assert.equal(abilities[175], "Dragonize");
    assert.equal(abilities[177], "Eelevate");
});

test("reports species IDs beyond the supplied constants without misidentifying them", () => {
    const ctx = runtime();
    const save = sampleLayout();
    writePokemon(save, 0xD15C, 900, "UNKNOWN");
    finishBlock(save, 0xD158, 0x134E0, 4, 5, 1);
    const result = ctx.parseTarnishedPlatinumSave(save);
    assert.deepEqual(Array.from(result.unmappedIds.species), [900]);
    assert.doesNotMatch(result.showdownImport, /UNKNOWN|Lechonk/);
});

test("falls back to an intact pair and rejects a save without one", () => {
    const ctx = runtime();
    const save = sampleLayout();
    save[0xD15C + 8] ^= 1;
    const older = ctx.getTarnishedPlatinumSaveBlocks(save);
    assert.equal(older.partyOffset, 0x9C);
    assert.equal(older.boxOffset, 0x4D15C);
    save[0x4D15C + 8] ^= 1;
    assert.throws(() => ctx.getTarnishedPlatinumSaveBlocks(save), /No matching, checksum-valid/);
    assert.throws(() => ctx.getTarnishedPlatinumSaveBlocks(save.subarray(0, 0x40000)), /512 KiB/);
});
