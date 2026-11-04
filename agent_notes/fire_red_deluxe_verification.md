# Fire Red Deluxe Verification

ROM data is authoritative. The v20.5 workbook is used for comparison and trainer navigation, not to overwrite ROM values.
The Trainer List is read top-to-bottom within each location column, then left-to-right. Rival alternatives share navigation links.
Encounter checks compare species, combined slot rates and level ranges. Documented floors are grouped by their ROM location name; unmapped names are reported, not treated as matches.
Boss comparisons ignore move-slot and party ordering, but compare species, levels, abilities, natures, held items and moves.

Regional abbreviations resolve to canonical species. Surfing/Flying Pikachu use Pikachu sprites. Legacy/custom forms without dedicated assets use matching base-species sprites; their distinct ROM stats and names are preserved.

Hard Mode has three Weather Ball records. The Water and Fire variants are explicitly named Weather Ball (Water) and Weather Ball (Fire), preserving their distinct move IDs, types and PP.

## Hard Mode Calc Update: 2026-11-03

Current calc ROM: `1636 - Pokemon Fire Red (U)(Squirrels) (patched).gba`.
SHA256: `d86893c7e48c8ac0b72c8e21bd993ffe8013fac68e279ad42a815b016f904e63`.

Regenerated only `backups/frd.js` using the existing Fire Red Deluxe layout and exporter.
Re-extracting the previous `frd.gba` reproduced the prior calc exactly before applying this update.

- 202 trainer records changed, including species, levels, moves, held items, abilities, IVs, natures and AI flags.
- 497 existing party slots changed; 2 slots were added and 20 removed. The calc now contains 2331 trainer-party entries.
- Weather Ball (Water) PP changed from 10 to 15. No other move records or species definitions changed.
- Save-reader constants and all 512 existing trainer-order entries remain valid and unchanged.
- Normal Mode and DDex were not regenerated. The workbook comparison below describes the original v20.5 baseline, not a fresh verification of this ROM.

The detailed local ROM comparison is generated at `reports/fire-red-deluxe-hard-20261103.json` in the calc repository (ignored by Git).

## Normal Mode

ROM: frd-normal.gba. SHA256: 5741f0f72374d56879628b4c2484573f8c6f3c266d82b0b0df501640d5859b08.

Checked 382 documented species, 3847 level-up entries, 348 moves, 178 boss entries and 1218 encounter entries.
Linked 512 ROM trainer IDs in 481 documented fights.
Reported 382 data/name discrepancies and 0 unmatched trainer-order entries.

All trainer rows resolved; no unmatched navigation entries.

## Hard Mode: Original v20.5 Baseline

ROM: frd.gba. SHA256: 59ff0b9dad658ceb23b30e28337a1366f7c2e6b2f1cb91272bafd8bc64155da6.

Checked 382 documented species, 3847 level-up entries, 348 moves, 178 boss entries and 1218 encounter entries.
Linked 512 ROM trainer IDs in 481 documented fights.
Reported 422 data/name discrepancies and 0 unmatched trainer-order entries.

All trainer rows resolved; no unmatched navigation entries.

Full cell-level comparisons and trainer-order mappings: ddex/rom/reports/fire-red-deluxe-verification.json.

## Regeneration

Run from the ddex repository. Python requires openpyxl. Keep ROMs and the original workbook outside the repositories.

```sh
python3 scripts/extract-fire-red-deluxe-workbook.py "PATH_TO_WORKBOOK.xlsx" /tmp/frd-workbook.json
node scripts/extract-fire-red-deluxe.mjs --hard-rom "PATH_TO_HARD_ROM.gba" --normal-rom "PATH_TO_NORMAL_ROM.gba" --workbook-json /tmp/frd-workbook.json
```

The extractor validates relocated table pointers and refuses a changed ROM layout instead of silently exporting misaligned data.
