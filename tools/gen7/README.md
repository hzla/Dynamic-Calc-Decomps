# Gen 7 ROM → Dynamic Calc / Ddex

Python 3.10+ and Node.js are sufficient. No Python packages, Windows, pk3DS runtime, Citra, or emulator execution are used. The parsers follow the local pk3DS/PKHeX binary layouts. The trainer ability algorithm was established from the supplied Ultra Sun 1.2 executable, rather than the old Gen 6 exporter.

## Input preparation

Supply an **extracted, decrypted and merged** RomFS plus its **decompressed** ExeFS `code.bin`. Apply base game → matching title update → hack overlay, and apply any `code.ips` to the decompressed executable before exporting. A directory containing only LayeredFS mod files is insufficient. Keep the original ROM and update separate from generated output.

The existing `photonic-sun/extracted/romfs` and `photonic-sun/extracted/exefs/code.bin` already satisfy this. A future `.3ds`/`.cia` needs an extractor such as 3dstool; the native copy built for this task is in `photonic-sun/tools/3dstool/bin/Release/3dstool`. This exporter deliberately consumes prepared files; it does not claim to merge arbitrary CIA updates or apply arbitrary patch formats itself.

## Export

Run from the Dynamic Calc repository:

```sh
python3 tools/gen7/export_dynamic_calc.py \
  --romfs /path/to/merged/romfs \
  --code /path/to/merged/exefs/code.bin \
  --game usum --title 'My Gen 7 Hack' --slug myhack \
  --out /path/to/export
```

`--game sm` selects Sun/Moon archive/text indexes. That profile has not been exercised against a supplied Sun/Moon ROM. `usum` was validated with Photonic Sun Rebalanced + Ultra Sun 1.2. Moon's encounter archive is detected from the nonempty version-specific file.

Output:

- `myhack.js` / `myhack.json`: Dynamic Calc `backup_data` with Pokémon stats/types/abilities/weights/forms/learnsets, moves and all nonempty trainer records.
- `myhack.order.js`: `trainerOrders`. Default ordering is **ROM record ID order**, not story order.
- `myhack.ddex.js` / `myhack.ddex.json`: Ddex species, evolutions, moves, abilities, items, and regular encounter tables.
- `trainers.json`, `trainers.showdown.txt`, `trainers.calc.txt`, `teams/`: traceable trainer records and Showdown text.
- `encounters.raw.json`: all regular, caller-specific SOS, and weather SOS slots. Ddex displays regular day/night pools under area/table numbers; it does not invent terrain names or unconditional SOS odds.
- `dynamic_calc_manifest.json`: input hashes, coverage counts, assumptions, and whether the executable is the exact audited build. `export_manifest.json`/`warnings.csv` provide additional trainer provenance.

The generic trainer export includes unused/placeholder records. It preserves duplicate Pokémon using the calc's `Lvl 20*` naming convention, true `tr_id`, and zero-based `sub_index`. Battle scripts, progression, starter branches and partnered trainer IDs are separate information.

## Configuration for another hack

Optional `--config config.json`:

```json
{
  "trainer_labels": {"7": "Fisherman Carl |Route 1|"},
  "trainer_order": [7, 18, 22],
  "partners": {"18": 22, "22": 18},
  "forms": {"744:1": "Rockruff-Own-Tempo"},
  "archives": {"trdata": "a/1/0/6", "trpoke": "a/1/0/7"}
}
```

Labels omit the `Lvl N` prefix; the exporter adds it per Pokémon. Parentheses/brackets in labels are removed because the calc uses those delimiters. If `trainer_order` is supplied, only its IDs receive previous/next links; trainer records themselves remain complete.

Optional `tm_moves` replaces all 100 TM move IDs if the code signature moved. Otherwise the actual patched TM table is located and read from `code.bin`. `type_tutors` and `beach_tutors` can replace the standard pk3DS tutor index lists. Compatibility bits are always read from the ROM. Unknown or mechanically different forms that would share a name cause an error requesting a `forms` mapping.

## Install calculator data

For a new source, copy `myhack.js` to `backups/myhack.js` and `myhack.order.js` to `backups/trainer_orders/myhack.js`, then register its title/settings in the existing calculator catalog. Use Gen 7 data/damage/critical-hit mechanics, type chart 6, full source, and custom Pokémon enabled. Alternatively upload the JS through the calc's Dev data uploader and select those settings. A new title cannot automatically establish custom engine mechanics.

For an existing curated source whose trainer labels/order should be kept:

```sh
node tools/gen7/install_calc_data.cjs /path/to/export/myhack.json backups/myhack.js
```

This replaces Pokémon/moves and preserves `formatted_sets` and other existing top-level fields. It checks that every curated species exists in the export. It does **not** synchronize those curated trainer sets: use the raw trainer export or a hack-specific sheet mapping for that step.

For Photonic Sun, the separate `photonic-sun/sync_pspm.py` maintains the sheet mapping, static encounters, IDs, and order. Run that first, then `install_calc_data.cjs`; otherwise that older synchronization stage intentionally restores the original species/move tables. The installed `pspm.js` now includes the newly extracted tables.

## Install Ddex data

From the Ddex repository:

```sh
node scripts/import-gen7.mjs /path/to/export/myhack.ddex.json myhack
npm test
npm run build
```

This writes `data/overrides/myhack.js` and `myhack_searchindex.js`. Register the slug/title in `js/overrides.js` and map the calculator's title in `js/calc_ui/dex.js`; enable `showDex` for the title. Photonic Sun is already registered as `photonicsun`, with `pspm` as an alias. Local calc port 3001 opens local Ddex port 3000; the production URL continues to use the existing hosted Ddex.

Gen 7 evolution exports use semantic `evoMethods` plus separate `evoLevels`, preserving both a minimum level and an item/move/location condition. Ddex now understands upside-down leveling, affection + move type, Dark-type party members, version-specific evolution, Mount Lanakila, dusk, Ultra Space, and encryption-constant branches. `learnset_info.eggMoves` is imported as egg moves.

## Accuracy boundaries

- Nature is the trainer record's byte directly: 0 = Hardy, 12 = Serious. There is no missing-nature randomization for these records.
- Ability flags 1/2/3 select first/second/hidden. Flag 0 uses a fresh TinyMT32 seed of species + level, advances by trainer class, and uses bit 16 of the next result. It does **not** inherit the preceding party member's slot.
- The exact supplied executable is recognized by SHA-256. Other executables are clearly marked unverified in the manifest; a hack can modify constructor code. SM uses the same assumed algorithm until independently audited.
- EVs use the game's 252-per-stat / 510-total clamp in HP/Atk/Def/SpA/SpD/Spe order. All-zero move records use the modified learnset's four-move queue.
- The malformed Silvally form 255 record is resolved from its held Memory and recorded as an inference.
- Move IDs/effect IDs/flags are preserved where the destination supports them. Arbitrary executable changes to ability effects, move effects, and evolution conditions cannot be inferred from tables alone. Hardcoded bite/pulse/bullet behavior stays with the calc's base engine unless separately patched. Return/Frustration are exported at 102 power, Magnitude at 70; raw Ddex power remains in-ROM. Paired physical/special Z-Move records remain separate.
- Tutor move assignments default to the standard index lists unless configured. Static/gift encounter locations and battle-script conditions are not mapped by this generic exporter.

## Checks (no emulator)

```sh
python3 -m unittest discover -s tools/gen7 -p 'test_*.py'
node tools/gen7/verify_calc.cjs
node tools/gen7/verify_calc.cjs /path/to/export/myhack.json
```

The Node check uses the application's real trainer navigation and species import functions. Its species/move regression examples are for the installed Photonic Sun data; the optional JSON argument additionally checks the generic trainer export's preview coverage. Ddex's tests cover merger behavior, all evolution arrays, move metadata, and encounter references/rates.
