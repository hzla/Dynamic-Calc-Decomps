const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BACKUPS_DIR = __dirname;
const DEFAULT_HGSS_PATH = path.join(BACKUPS_DIR, 'hgss.js');
const DEFAULT_PK_PATH = path.join(BACKUPS_DIR, 'pk.js');
const DEFAULT_EFFECTS_PATH = path.resolve(BACKUPS_DIR, '../../../Pokeweb-Live/Reference_Files/effects.txt');
const DEFAULT_OUTPUT_PATH = path.join(BACKUPS_DIR, 'move-effect-changes.txt');

function loadBackupData(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const context = { backup_data: null };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: filePath });

  if (!context.backup_data || typeof context.backup_data !== 'object') {
    throw new Error(`Could not load backup_data from ${filePath}`);
  }

  return context.backup_data;
}

function loadEffects(filePath) {
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
}

function getEffectDescription(effects, effectId) {
  if (!Number.isInteger(effectId)) {
    return 'Unknown Effect';
  }

  const description = effects[effectId];
  if (description === undefined || description === '') {
    return 'Unknown Effect';
  }

  return description;
}

function buildReport(hgssMoves, pkMoves, effects) {
  const sharedMoveNames = Object.keys(hgssMoves)
    .filter((moveName) => Object.prototype.hasOwnProperty.call(pkMoves, moveName))
    .sort((a, b) => a.localeCompare(b));

  const changedMoves = [];

  for (const moveName of sharedMoveNames) {
    const hgssMove = hgssMoves[moveName];
    const pkMove = pkMoves[moveName];
    const oldId = hgssMove.e_id;
    const newId = pkMove.e_id;

    if (oldId === newId) {
      continue;
    }

    changedMoves.push({
      moveName,
      oldId,
      newId,
      oldDescription: getEffectDescription(effects, oldId),
      newDescription: getEffectDescription(effects, newId),
    });
  }

  const lines = [];

  for (const move of changedMoves) {
    lines.push('================');
    lines.push('');
    lines.push(move.moveName);
    lines.push('');
    lines.push(`Old ID (hgss): ${move.oldId}`);
    lines.push(`New ID (pk.js): ${move.newId}`);
    lines.push(`Old Effect: ${move.oldDescription} (${move.oldId})`);
    lines.push(`New Effect: ${move.newDescription} (${move.newId})`);
    lines.push('');
  }

  return {
    changedMoves,
    reportText: lines.join('\n').trimEnd() + '\n',
  };
}

function main() {
  const [, , hgssArg, pkArg, effectsArg, outputArg] = process.argv;
  const hgssPath = hgssArg ? path.resolve(process.cwd(), hgssArg) : DEFAULT_HGSS_PATH;
  const pkPath = pkArg ? path.resolve(process.cwd(), pkArg) : DEFAULT_PK_PATH;
  const effectsPath = effectsArg ? path.resolve(process.cwd(), effectsArg) : DEFAULT_EFFECTS_PATH;
  const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : DEFAULT_OUTPUT_PATH;

  const hgssData = loadBackupData(hgssPath);
  const pkData = loadBackupData(pkPath);
  const effects = loadEffects(effectsPath);

  if (!hgssData.moves || !pkData.moves) {
    throw new Error('Expected both backup files to contain backup_data.moves');
  }

  const { changedMoves, reportText } = buildReport(hgssData.moves, pkData.moves, effects);
  fs.writeFileSync(outputPath, reportText, 'utf8');

  console.log(`Compared ${path.basename(hgssPath)} -> ${path.basename(pkPath)}`);
  console.log(`Found ${changedMoves.length} moves with changed e_id values.`);
  console.log(`Wrote report to ${outputPath}`);
}

main();
