const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function runtime(slug) {
  const ctx = { document: {}, $: () => ({ ready() {} }), orderFormats: { 0: [1, 2, 3, 4] },
    natures: Array(25).fill('Hardy'), gen3TextTable: {}, sav_pok_names: [], emImpItems: [], pokeemeraldMoves: [] };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(read(`backups/${slug}.js`), ctx);
  ctx.TITLE = ctx.backup_data.title;
  ctx.pokedex = ctx.backup_data.poks;
  vm.runInContext(read('js/savereaders/save_constants/fire_red_deluxe.js'), ctx);
  vm.runInContext(read('js/savereaders/savereader_g3.js'), ctx);
  return ctx;
}

function monChunk(speciesId, moveId, itemId) {
  const bytes = Buffer.alloc(100, 0xFF);
  bytes.fill(0, 0x20);
  bytes.writeUInt32LE(24, 0);
  bytes.writeUInt32LE(1, 4);
  bytes[0x13] = 2;
  bytes[0x54] = 42;
  const words = [speciesId | itemId << 16, 1000, 0, moveId, 0, 0, 0, 0, 0, 0, 0, 0];
  words.forEach((value, index) => bytes.writeUInt32LE((value ^ 25) >>> 0, 0x20 + index * 4));
  return bytes;
}

test('Fire Red Deluxe has one catalog card with separate Normal and Hard data links', () => {
  const ctx = { window: {} };
  vm.runInNewContext(read('js/romhack_catalog.js'), ctx);
  const game = ctx.window.romhackGameIndex['fire-red-deluxe'];
  assert.equal(game.title, 'Fire Red Deluxe');
  assert.equal(game.variants.length, 2);
  assert.match(game.variants[0].source, /data=frdnormal&/);
  assert.equal(game.variants[0].sourceTitle, 'Fire Red Deluxe Normal Mode');
  assert.match(game.variants[1].source, /data=frd&/);
  assert.equal(game.variants[1].sourceTitle, 'Fire Red Deluxe Hard Mode');
});

for (const slug of ['frd', 'frdnormal']) {
  test(`${slug} reads regional species and replacement moves from their original GBA slots`, () => {
    const ctx = runtime(slug);
    const tables = ctx.fireRedDeluxeSaveConstants[slug];
    const speciesId = tables.species.indexOf('Corsola-Galar');
    const moveId = tables.moves.indexOf('Double Iron Bash');
    const itemId = tables.items.indexOf('Alola Stone');
    assert.ok(speciesId > 251 && moveId > 0 && itemId > 0);
    const mon = ctx.g3ParseMonChunk(monChunk(speciesId, moveId, itemId), true, 1);
    assert.equal(mon.speciesName, 'Corsola-Galar');
    assert.equal(mon.abilityName, 'Clear Body');
    assert.equal(mon.itemName, 'Alola Stone');
    assert.deepEqual(Array.from(mon.moveNames), ['Double Iron Bash']);
    assert.equal(mon.level, 42);
    assert.equal(ctx.g3ResolveGrowthRate(mon.speciesName), tables.growthRates[mon.speciesName]);
    ctx.TITLE = 'Emerald but Bad';
    assert.equal(ctx.g3GetFireRedDeluxeTables(), null);
  });

  test(`${slug} trainer navigation follows the sheet and groups alternate rival starters`, () => {
    const ctx = runtime(slug);
    vm.runInContext(read(`backups/trainer_orders/${slug}.js`), ctx);
    const order = ctx.trainerOrders;
    assert.equal(Object.keys(order).length, 512);
    for (const id of [326, 327, 328]) {
      assert.equal(order[id].prev, null);
      assert.equal(order[id].next, 211);
    }
    assert.equal(order[211].next, 49);
    assert.equal(order[49].prev, 211);
    const ids = new Set(Object.values(ctx.backup_data.formatted_sets).flatMap(sets => Object.values(sets).map(set => set.tr_id)));
    for (const node of Object.values(order)) {
      assert.ok(ids.has(node.id));
      for (const key of ['next', 'prev']) if (node[key] !== null) assert.ok(order[node[key]]);
    }
  });
}

test('Deluxe Weather Ball variants retain their clear-weather type and use weather effects', () => {
  global.settings = { type_chart: 3, typeChart: 3, damageGen: 3, critGen: 5, gen: 3, physSpecSplit: false };
  global.TITLE = 'Fire Red Deluxe Hard Mode';
  global.gameGen = 3;
  global.pokedex = {};
  global.calcingForSwitchIns = false;
  const calc = require('../index');
  global.typeChart = calc.TYPE_CHART[3];
  const calculate = (name, type, weather) => calc.calculate(3,
    new calc.Pokemon(3, 'Castform', { ability: 'None' }),
    new calc.Pokemon(3, 'Blissey', { ability: 'None' }),
    new calc.Move(3, 'Weather Ball', { name, overrides: { type, basePower: 50 } }),
    new calc.Field({ weather }));
  const clear = calculate('Weather Ball (Water)', 'Water', '');
  assert.equal(clear.move.type, 'Water');
  assert.equal(clear.move.category, 'Special');
  const sun = calculate('Weather Ball (Water)', 'Water', 'Sun');
  assert.equal(sun.move.type, 'Fire');
  assert.equal(sun.rawDesc.moveBP, 100);
  assert.equal(calculate('Weather Ball', 'Normal', '').move.category, 'Physical');
  global.TITLE = 'Emerald but Bad';
  assert.equal(calculate('Weather Ball', 'Normal', 'Rain').move.type, 'Water');
  assert.equal(calculate('Weather Ball (Water)', 'Water', 'Sun').move.type, 'Water');
});
