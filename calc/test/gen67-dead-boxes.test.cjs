const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function runtime() {
  const ctx = {
    document: {},
    $: () => ({ ready() {} }),
    sav_pok_names: ['', 'Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon'],
  };
  ctx.window = ctx;
  for (const gen of [6, 7]) {
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../../js/savereaders/savereader_g${gen}.js`), 'utf8'), ctx);
  }
  return ctx;
}

function crypt(bytes, start, end, seed) {
  for (let i = start; i < end; i += 2) {
    seed = (Math.imul(0x41C64E6D, seed) + 0x6073) >>> 0;
    bytes.writeUInt16LE(bytes.readUInt16LE(i) ^ (seed >>> 16), i);
  }
}

function mon(species, party = false, egg = false) {
  const bytes = Buffer.alloc(party ? 0x104 : 0xE8);
  // Shuffle value 0 keeps the four data blocks in identity order.
  const seed = 123;
  bytes.writeUInt32LE(seed, 0);
  bytes.writeUInt16LE(species, 8);
  bytes.writeUInt32LE(egg ? 0xC0000000 : 0x80000000, 0x74);
  bytes.write('Buddy', 0x40, 'utf16le');
  bytes.writeUInt16LE(7, 0xDA);
  if (party) bytes[0xEC] = 17;
  let checksum = 0;
  for (let i = 8; i < 0xE8; i += 2) checksum = (checksum + bytes.readUInt16LE(i)) & 0xFFFF;
  bytes.writeUInt16LE(checksum, 6);
  crypt(bytes, 8, 0xE8, seed);
  if (party) crypt(bytes, 0xE8, 0x104, seed);
  return bytes;
}

function makeSave(ctx, game, placements, includeParty = true) {
  const variant = vm.runInNewContext(`(typeof G6_VARIANTS === 'object' && G6_VARIANTS['${game}']) || G7_VARIANTS['${game}']`, ctx);
  const bytes = Buffer.alloc(variant.saveSize);
  if (includeParty) {
    mon(3, true).copy(bytes, variant.requiredBlocks.party.offset);
    bytes[variant.requiredBlocks.party.offset + 6 * 0x104] = 1;
  }
  for (const [index, record] of placements) {
    record.copy(bytes, variant.requiredBlocks.boxes.offset + index * 0xE8);
  }
  bytes.writeUInt32LE(0x42454546, variant.metadataOffset + 0x10);
  for (const block of Object.values(variant.requiredBlocks)) {
    const entry = variant.metadataOffset + 0x14 + block.id * 8;
    bytes.writeUInt32LE(block.length, entry);
    bytes.writeUInt16LE(block.id, entry + 4);
    bytes.writeUInt16LE(variant.checksum(bytes.subarray(block.offset, block.offset + block.length)), entry + 6);
  }
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length);
}

for (const [game, generation, finalSlot] of [['XY', 6, 929], ['ORAS', 6, 929], ['SM', 7, 959], ['USUM', 7, 959]]) {
  function parse(ctx, save) {
    return ctx[`parseGen${generation}Save`](save);
  }

  test(`${game}: party and PC boxes 1-6 are living, boxes 7 onward are dead`, () => {
    const ctx = runtime();
    const parsed = parse(ctx, makeSave(ctx, game, [
      [0, mon(1)], [150, mon(1)], [179, mon(2)],
      [180, mon(4)], [209, mon(4)], [finalSlot, mon(5)],
      [181, mon(4, false, true)],
    ]));
    assert.deepEqual(Array.from(parsed.partyMons, m => [m.speciesName, m.level]), [['Venusaur', 17]]);
    assert.deepEqual(Array.from(parsed.boxMons, m => [m.speciesName, m.slot]), [
      ['Bulbasaur', 1], ['Bulbasaur', 151], ['Ivysaur', 180],
    ]);
    assert.equal(parsed.importedBoxCount, 3);
    assert.deepEqual(Array.from(parsed.deadMons, m => [m.speciesName, m.box, m.slot]), [
      ['Charmander', 7, 1], ['Charmander', 7, 30], ['Charmeleon', generation === 6 ? 31 : 32, 30],
    ]);
    for (const dead of parsed.deadMons) {
      assert.equal(dead.nickname, 'Buddy');
      assert.equal(dead.met, 'Unknown Location (0x0007)');
      assert.equal(dead.metLocationId, 7);
      assert.equal(dead.source, 'save-file');
    }
    assert.match(parsed.showdownImport, /Venusaur/);
    assert.match(parsed.showdownImport, /Ivysaur/);
    assert.doesNotMatch(parsed.showdownImport, /Charmander|Charmeleon/);
  });

  test(`${game}: a dead-only save still returns an import snapshot`, () => {
    const ctx = runtime();
    const parsed = parse(ctx, makeSave(ctx, game, [[180, mon(4)]], false));
    assert.equal(parsed.showdownImport, '');
    assert.equal(parsed.partyMons.length, 0);
    assert.equal(parsed.boxMons.length, 0);
    assert.equal(parsed.importedBoxCount, 0);
    assert.equal(parsed.deadMons[0].speciesName, 'Charmander');
  });

  test(`${game}: invalid records and empty saves are not imported as dead`, () => {
    const ctx = runtime();
    const corrupted = mon(4);
    corrupted[0x20] ^= 1;
    const save = makeSave(ctx, game, [[180, corrupted], [finalSlot, mon(4, false, true)]], false);
    assert.throws(() => parse(ctx, save), /No valid party or boxed Pokemon/);
  });
}
