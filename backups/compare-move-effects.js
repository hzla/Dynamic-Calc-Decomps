const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BACKUPS_DIR = __dirname;
const DEFAULT_HGSS_PATH = path.join(BACKUPS_DIR, 'pt.js');
const DEFAULT_PK_PATH = path.join(BACKUPS_DIR, 'pk.js');
const DEFAULT_EFFECTS_PATH = path.resolve(BACKUPS_DIR, '../../../Pokeweb-Live/Reference_Files/g4_effects.txt');
const DEFAULT_AI_HELPER_PATH = path.resolve(BACKUPS_DIR, '../js/vendor/ai.min.js');
const DEFAULT_OUTPUT_PATH = path.join(BACKUPS_DIR, 'move-effect-changes.md');
const GEN4_AI_SECTIONS = [
  { option: 'basic', title: 'BASIC AI' },
  { option: 'strong', title: 'EVALUATE ATKS AI' },
  { option: 'expert', title: 'EXPERT AI' },
  { option: 'setupFirstTurn', title: '1ST TURN SETUP AI' },
  { option: 'risky', title: 'RISKY AI' },
  { option: 'damagePriority', title: 'PRIO DAMAGE AI' },
  { option: 'batonPass', title: 'BATON PASS AI' },
  { option: 'checkHp', title: 'CHECK HP AI' },
  { option: 'weather', title: 'WEATHER AI' },
  { option: 'harrassment', title: 'HARASS AI' },
];

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

function loadAiTextHelper(filePath) {
  const source = fs
    .readFileSync(filePath, 'utf8')
    // Preserve effect-driven battleEffect overrides even when the mapped value is null or 0.
    .replace(
      [
        'const effectBattleEffect = getEffectBattleEffect(effectId);',
        '\t\tif (effectBattleEffect) {',
        '\t\t\tbaseData.battleEffect = effectBattleEffect;',
        '\t\t}',
      ].join('\n'),
      [
        'const effectBattleEffect = getEffectBattleEffect(effectId);',
        '\t\tif (typeof eidToBattleEffect === "object" && eidToBattleEffect !== null && Object.hasOwn(eidToBattleEffect, String(effectId))) {',
        '\t\t\tbaseData.battleEffect = effectBattleEffect;',
        '\t\t}',
      ].join('\n')
    );
  const context = {
    window: {},
    console,
  };
  context.window = context;

  vm.createContext(context);
  vm.runInContext(source, context, { filename: filePath });

  if (typeof context.getAiTextByEffectId !== 'function') {
    throw new Error(`Could not load getAiTextByEffectId from ${filePath}`);
  }

  return context.getAiTextByEffectId;
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

function renderAiBlocks(blocks) {
  const renderedLines = [];

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return '(No applicable AI procedures)';
  }

  for (const block of blocks) {
    if (!block || !block.type) {
      continue;
    }

    if (block.type === 'spacer') {
      renderedLines.push('');
      continue;
    }

    if (block.type === 'line') {
      const indent = Number.isFinite(block.indent) ? '  '.repeat(block.indent) : '';
      renderedLines.push(`${indent}${block.text || ''}`);
      continue;
    }

    if (block.type === 'list') {
      if (block.title) {
        renderedLines.push(block.title);
      }
      if (Array.isArray(block.items)) {
        for (const item of block.items) {
          renderedLines.push(`- ${item}`);
        }
      }
    }
  }

  return renderedLines.join('\n').trim() || '(No applicable AI procedures)';
}

function getAiSections(getAiTextByEffectId, effectId, moveName, moveType) {
  const options = {
    basic: false,
    strong: false,
    expert: false,
    double: false,
    doubleEnemy: false,
    doubleAlly: false,
    setupFirstTurn: false,
    risky: false,
    damagePriority: false,
    batonPass: false,
    checkHp: false,
    weather: false,
    harrassment: false,
    moveName,
    moveType,
  };

  for (const section of GEN4_AI_SECTIONS) {
    options[section.option] = true;
  }

  const result = getAiTextByEffectId(effectId, options);
  if (!result || result.error) {
    const errorText = `Error loading AI${result && result.error ? `: ${result.error}` : ''}`;
    return Object.fromEntries(GEN4_AI_SECTIONS.map((section) => [section.option, errorText]));
  }

  const aiSections = result.ai || {};
  const renderedSections = {};

  for (const section of GEN4_AI_SECTIONS) {
    const sectionData = aiSections[section.option];
    renderedSections[section.option] = renderAiBlocks(sectionData ? sectionData.blocks : null);
  }

  return renderedSections;
}

function getChangedNonExpertSections(oldSections, newSections) {
  return GEN4_AI_SECTIONS
    .filter((section) => section.option !== 'expert')
    .map((section) => ({
      ...section,
      oldText: oldSections[section.option],
      newText: newSections[section.option],
    }))
    .filter((section) => section.oldText !== section.newText);
}

function escapeMarkdownHeading(text) {
  return String(text).replace(/#/g, '\\#');
}

function buildReport(hgssMoves, pkMoves, effects, getAiTextByEffectId, hgssLabel, pkLabel) {
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

    const oldAiSections = getAiSections(getAiTextByEffectId, oldId, moveName, hgssMove.type);
    const newAiSections = getAiSections(getAiTextByEffectId, newId, moveName, pkMove.type);

    changedMoves.push({
      moveName,
      oldId,
      newId,
      oldDescription: getEffectDescription(effects, oldId),
      newDescription: getEffectDescription(effects, newId),
      oldAiSections,
      newAiSections,
      changedNonExpertSections: getChangedNonExpertSections(oldAiSections, newAiSections),
    });
  }

  const lines = [
    '# Move Effect Changes',
    '',
    `Compared \`${hgssLabel}\` against \`${pkLabel}\`.`,
    '',
    `Found **${changedMoves.length}** moves where the shared move name has a different \`e_id\`.`,
  ];

  if (changedMoves.length === 0) {
    lines.push('');
    lines.push('No changed move effects were found.');
  }

  for (const move of changedMoves) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`## ${escapeMarkdownHeading(move.moveName)}`);
    lines.push('');
    lines.push(`- Old ID: \`${move.oldId}\``);
    lines.push(`- New ID: \`${move.newId}\``);
    lines.push(`- Old Effect: ${move.oldDescription} (${move.oldId})`);
    lines.push(`- New Effect: ${move.newDescription} (${move.newId})`);
    lines.push('');
    if (move.changedNonExpertSections.length > 0) {
      lines.push(`- Changed non-expert AI sections: ${move.changedNonExpertSections.map((section) => section.title).join(', ')}`);
      lines.push('');
    }
    lines.push(`### Old Expert AI (${hgssLabel})`);
    lines.push('');
    lines.push('```text');
    lines.push(move.oldAiSections.expert);
    lines.push('```');
    lines.push('');
    lines.push(`### New Expert AI (${pkLabel})`);
    lines.push('');
    lines.push('```text');
    lines.push(move.newAiSections.expert);
    lines.push('```');

    if (move.changedNonExpertSections.length > 0) {
      for (const section of move.changedNonExpertSections) {
        lines.push('');
        lines.push(`### Old ${section.title} (${hgssLabel})`);
        lines.push('');
        lines.push('```text');
        lines.push(section.oldText);
        lines.push('```');
        lines.push('');
        lines.push(`### New ${section.title} (${pkLabel})`);
        lines.push('');
        lines.push('```text');
        lines.push(section.newText);
        lines.push('```');
      }
    }
  }

  return {
    changedMoves,
    reportText: lines.join('\n').trimEnd() + '\n',
  };
}

function main() {
  const [, , hgssArg, pkArg, effectsArg, outputArg, aiHelperArg] = process.argv;
  const hgssPath = hgssArg ? path.resolve(process.cwd(), hgssArg) : DEFAULT_HGSS_PATH;
  const pkPath = pkArg ? path.resolve(process.cwd(), pkArg) : DEFAULT_PK_PATH;
  const effectsPath = effectsArg ? path.resolve(process.cwd(), effectsArg) : DEFAULT_EFFECTS_PATH;
  const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : DEFAULT_OUTPUT_PATH;
  const aiHelperPath = aiHelperArg ? path.resolve(process.cwd(), aiHelperArg) : DEFAULT_AI_HELPER_PATH;

  const hgssData = loadBackupData(hgssPath);
  const pkData = loadBackupData(pkPath);
  const effects = loadEffects(effectsPath);
  const getAiTextByEffectId = loadAiTextHelper(aiHelperPath);

  if (!hgssData.moves || !pkData.moves) {
    throw new Error('Expected both backup files to contain backup_data.moves');
  }

  const { changedMoves, reportText } = buildReport(
    hgssData.moves,
    pkData.moves,
    effects,
    getAiTextByEffectId,
    path.basename(hgssPath),
    path.basename(pkPath)
  );
  fs.writeFileSync(outputPath, reportText, 'utf8');

  console.log(`Compared ${path.basename(hgssPath)} -> ${path.basename(pkPath)}`);
  console.log(`Found ${changedMoves.length} moves with changed e_id values.`);
  console.log(`Wrote report to ${outputPath}`);
}

main();
