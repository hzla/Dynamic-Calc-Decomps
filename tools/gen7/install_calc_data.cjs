#!/usr/bin/env node
// Merge ROM species/moves into an existing curated backup, retaining its trainer labels/order.
const fs = require('node:fs');
const vm = require('node:vm');
const [input, target] = process.argv.slice(2);
if (!input || !target) throw new Error('Usage: node tools/gen7/install_calc_data.cjs <export.json> <backups/game.js>');
const incoming = JSON.parse(fs.readFileSync(input, 'utf8'));
const context = {};
vm.runInNewContext(fs.readFileSync(target, 'utf8'), context, {timeout: 5000});
const data = context.backup_data;
if (!data?.formatted_sets || !incoming.poks || !incoming.moves) throw new Error('Invalid backup_data');
const norm = s => s.normalize('NFKD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
const byID = Object.fromEntries(Object.keys(incoming.poks).map(n => [norm(n), n]));
// Keep the existing display spelling for species used by curated trainer entries.
const aliases = {};
for (const name of Object.keys(data.formatted_sets)) {
  const canonical = byID[norm(name)];
  if (!canonical) throw new Error(`Export lacks trainer species ${name}`);
  if (canonical !== name) aliases[name] = incoming.poks[canonical];
}
data.poks = {...incoming.poks, ...aliases};
data.moves = incoming.moves;
fs.writeFileSync(target, 'backup_data = ' + JSON.stringify(data, null, 4) + '\n');
console.log(`Updated ${target}; preserved ${Object.values(data.formatted_sets).reduce((n, x) => n + Object.keys(x).length, 0)} curated sets.`);
