import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Generate calc/output/mons.json with the fixed parser in this historical checkout first.
// Only repair stats; keep the old version's trainers, moves, learnsets and other data intact.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2]);
const sourceCommit = 'f97e7bbf4db5d806707f3a73e346d6f3a8a3519e'; // Null 1.2.4
const git = (...args) => execFileSync('git', ['-C', source, ...args], {encoding: 'utf8'}).trim();
assert.equal(git('rev-parse', 'HEAD'), sourceCommit);
assert.equal(git('diff', '--name-only', sourceCommit, '--', '.'), '');
const context = {};
const filename = path.join(repo, 'backups/null12.js');
vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.backup_data));
const original = structuredClone(data);
const generated = JSON.parse(fs.readFileSync(path.join(source, 'calc/output/mons.json'), 'utf8'));
const stats = ['hp', 'at', 'df', 'sa', 'sd', 'sp'];
const changed = [];
for (const [name, mon] of Object.entries(data.poks)) {
    const expected = generated[name]?.bs;
    if (!expected || !stats.every(stat => Number.isFinite(expected[stat]))) continue;
    if (stats.some(stat => mon.bs?.[stat] !== expected[stat])) {
        mon.bs = expected;
        changed.push(name);
    }
}
function withoutStats(payload) {
    const copy = structuredClone(payload);
    for (const mon of Object.values(copy.poks)) delete mon.bs;
    return copy;
}
assert.deepEqual(withoutStats(data), withoutStats(original), 'Do not replace old-version non-stat data');
if (changed.length) {
    const formatted = JSON.stringify(data, null, 4).replace(/^( *)("(?:\\.|[^"])*":) ([{\[])/gm, '$1$2\n$1$3');
    fs.writeFileSync(filename, `backup_data = ${formatted}\n`);
}
console.log(JSON.stringify({sourceCommit, correctedStats: changed}, null, 2));
