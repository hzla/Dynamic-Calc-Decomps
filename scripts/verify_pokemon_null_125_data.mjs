import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2]);
const read = relative => fs.readFileSync(path.join(source, relative), 'utf8');
const provenance = JSON.parse(fs.readFileSync(path.join(repo, 'backups/null125-source.json'), 'utf8'));
assert.equal(execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), provenance.commit);
assert.equal(execFileSync('git', ['-C', source, 'diff', '--name-only', 'HEAD', '--', '.'], {encoding: 'utf8'}).trim(), '');
for (const [filename, expected] of [['pokeemerald.gba', provenance.rom.sha256], ['pokeemerald.map', provenance.rom.mapSha256]]) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(source, filename))).digest('hex'), expected);
}
function load(relative, binding) {
    const context = {};
    vm.runInNewContext(fs.readFileSync(path.join(repo, relative), 'utf8'), context);
    return JSON.parse(JSON.stringify(context[binding]));
}
const calc = load('backups/null125.js', 'backup_data');
const dex = load('../ddex/data/overrides/pokemonnull.js', 'overrides');
const generated = JSON.parse(read('calc/output/npoint.json'));
for (const sets of Object.values(generated.formatted_sets)) {
    for (const name of Object.keys(sets)) {
        const formatted = name.replace(/ \(([^)]+ Room)\) \|Petalburg Gym\|/, ' - $1 |Petalburg Gym|');
        if (formatted !== name) { sets[formatted] = sets[name]; delete sets[name]; }
    }
}
assert.deepEqual(calc, generated, 'Installed calc data differs from the pinned export');
for (const name of ['pokemonnull.js', 'pokemonnull_searchindex.js']) {
    assert.equal(fs.readFileSync(path.join(repo, '../ddex/data/overrides', name), 'utf8'), read(`ddex/output/${name}`));
}

const constants = new Map([...read('include/constants/species.h').matchAll(/^#define\s+(\w+)\s+([^\n]+)/gm)]
    .map(match => [match[1], match[2].split('//')[0].trim()]));
function number(name) {
    const expression = constants.get(name)?.replace(/\b[A-Z][A-Z0-9_]*\b/g, token => String(number(token)));
    assert(expression && /^[\d\s()+*/-]+$/.test(expression), `Unresolved species ID ${name}`);
    return Function(`return (${expression})`)();
}
const names = JSON.parse(execFileSync('ruby', ['-e', `
require_relative "ddex/lib/name_resolver"
resolver = Ddex::NameResolver.new(repo_root: Dir.pwd)
rows = File.read("include/constants/species.h").scan(/^#define\\s+(SPECIES_[A-Z0-9_]+)\\s+/).flatten
puts JSON.generate(rows.map { |constant| [constant, resolver.species_constant_to_name(constant)] })
`], {cwd: source, encoding: 'utf8'}));
const id = text => text.toLowerCase().replace(/[^a-z0-9]/g, '');
const byName = new Map();
for (const [constant, name] of names) {
    const existing = byName.get(id(name));
    if (!existing || id(constant.replace('SPECIES_', '')) === id(name)) byName.set(id(name), constant);
}
const types = new Map([...read('include/constants/pokemon.h').matchAll(/^#define TYPE_(\w+)\s+(\d+)\s*$/gm)]
    .map(match => [+match[2], match[1][0] + match[1].slice(1).toLowerCase()]));
const map = read('pokeemerald.map');
const address = Number.parseInt(map.match(/0x([\da-f]+)\s+gSpeciesInfo\b/)[1], 16) - 0x08000000;
const rom = fs.readFileSync(path.join(source, 'pokeemerald.gba'));
const issues = [];
const counts = {};
for (const [label, records] of [['calc', calc.poks], ['dex', dex.poks]]) {
    let checked = 0;
    for (const [name, mon] of Object.entries(records)) {
        if (name === 'None' || /^Species\d+$/.test(name)) continue;
        // The calc follows Showdown's Core-as-base naming; ddex's base is Meteor.
        const constant = label === 'calc' && name === 'Minior' ? 'SPECIES_MINIOR_CORE_RED' : byName.get(id(name));
        if (!constant) continue; // Export-only learnset aliases have no ROM species slot.
        // Match the canonical ROM form, never a different alias with coincidentally matching stats.
        const offset = address + number(constant) * 36;
        checked++;
        for (const [index, stat] of ['hp', 'at', 'df', 'sp', 'sa', 'sd'].entries()) {
            if (mon.bs?.[stat] !== rom[offset + index]) issues.push(`${label}: ${name} ${stat}: ${mon.bs?.[stat]} != ROM ${rom[offset + index]}`);
        }
        const expectedTypes = [...new Set([rom[offset + 6], rom[offset + 7]].map(type => types.get(type)))];
        if (JSON.stringify(mon.types) !== JSON.stringify(expectedTypes)) issues.push(`${label}: ${name} types: ${mon.types} != ROM ${expectedTypes}`);
    }
    counts[label] = checked;
}
assert.equal(issues.length, 0, issues.join('\n'));
console.log(`Pinned exports match installed files; ROM stats/types verified for ${counts.calc} calc and ${counts.dex} dex species.`);
