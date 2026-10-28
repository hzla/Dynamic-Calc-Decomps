# Fire Red Deluxe Verification

ROM data is authoritative. The v20.5 workbook is used for comparison and trainer navigation, not to overwrite ROM values.
The Trainer List is read top-to-bottom within each location column, then left-to-right. Rival alternatives share navigation links.
Encounter checks compare species, combined slot rates and level ranges. Documented floors are grouped by their ROM location name; unmapped names are reported, not treated as matches.
Boss comparisons ignore move-slot and party ordering, but compare species, levels, abilities, natures, held items and moves.

Regional abbreviations resolve to canonical species. Surfing/Flying Pikachu use Pikachu sprites. Legacy/custom forms without dedicated assets use matching base-species sprites; their distinct ROM stats and names are preserved.

Hard Mode has three Weather Ball records. The Water and Fire variants are explicitly named Weather Ball (Water) and Weather Ball (Fire), preserving their distinct move IDs, types and PP.

## Normal Mode

ROM: frd-normal.gba. SHA256: 5741f0f72374d56879628b4c2484573f8c6f3c266d82b0b0df501640d5859b08.

Checked 382 documented species, 3847 level-up entries, 348 moves, 178 boss entries and 1218 encounter entries.
Linked 512 ROM trainer IDs in 481 documented fights.
Reported 382 data/name discrepancies and 0 unmatched trainer-order entries.

All trainer rows resolved; no unmatched navigation entries.

## Hard Mode

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
