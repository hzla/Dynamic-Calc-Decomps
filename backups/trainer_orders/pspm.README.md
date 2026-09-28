# Photonic Sun / Prismatic Moon trainer data

`../pspm.js` uses the calculator's existing `tr_id` and zero-based `sub_index`
fields. `pspm.js` in this directory provides the normal `trainerOrders` global
with numeric `id`, `prev`, and `next` links. No loader or data-format changes are
required.

The order follows the tabs and rows in [Questionable Specimen's trainer sheet](https://docs.google.com/spreadsheets/d/1QIgp4jYaldLcrq10PFlwjtVSanGw7kdgZwYtOUCweP0/edit),
using the workbook snapshot retrieved on 2026-09-28. Optional battles, starter
branches, allies, and both versions are included in the sheet's sequence; this
is a reference browsing order, not a claim that one playthrough encounters every
entry. Legendary encounters are appended in their sheet column order.

## Coverage

- All 427 battle blocks are represented, including both sides of 30 double
  battles: 457 trainer parties or static encounter groups.
- All 46 encounters in `Legendary_Docs` are also represented.
- 1,732 calculator sets, including the existing Mega and other battle forms;
  121 sets were added to the original 1,611.
- 508 order entries: 444 real ROM trainer IDs and 64 calculator-only IDs.
- `pspm.coverage.json` maps every sheet block to its IDs and records the source
  workbook hash. Sheet headers such as locations and notes are not battles.

IDs below 10000 are actual trainer archive indices from the supplied Photonic
Sun Rebalanced files over Ultra Sun v1.2. IDs at or above 10000 identify sheet
encounters outside that archive, such as Totems, trial wild encounters, and
legendaries. **Those high IDs are not game trainer IDs and must not be used to
interpret save-file trainer flags.**

Three Hau ally teams have identical ROM records: `220/447/450`, `221/448/451`,
and `449/452`. Each real ID has an entry; the additional copies have `ROM ID`
labels. The sheet alone cannot identify which scripted occurrence uses which
copy. No arbitrary claim is made that one ID is the only correct match.

## Data precedence

For matched ordinary trainers, the extracted ROM supplies the complete party,
level, item, moves, effective EVs, IVs, nature, and ability. Automatic abilities
are resolved with Ultra Sun's trainer TinyMT routine. They do not inherit the
preceding party member's ability. Natures are stored directly in the trainer
record. Typed Hidden Power names are derived from the ROM IVs.

The community's Mega/Primal display variants use the modified form's abilities;
their nature, item, stats, and party index agree with the underlying ROM member.
The species and move definition tables in `../pspm.js` were not changed.

ROM data resolves several sheet discrepancies: Audrey's Buneary is level 3,
Hau's Iki Town Litten is level 8, Rowlet-branch Ilima's Yungoos is level 11,
Hau's Diglett's Tunnel Tangrowth is level 41, and Dylan also has Drifloon.
These are source disagreements, not omitted sheet battles.

Totems and other static encounters use the sheet's data, not the ordinary trainer
RNG rule. The five literal ability-slot `1` entries in the trial tables use the
first ability from the existing modified species table. Obvious spellings such
as `Stealth Rocks`, `Aerialate`, and `Terabolt` are normalized. Legendary entries
have no nature or IV spread specified in the sheet, so those fields are left
unspecified; the calculator's defaults do not establish their in-game values.

## Verification and regeneration

The local tooling is in `../../../photonic-sun/` relative to this directory
(the sibling `photonic-sun` directory beside
`Dynamic-Calc-Hgengine`). In that directory:

```sh
python3 sync_pspm.py
node verify_pspm.cjs
python3 sync_pspm.py --apply
node ../Dynamic-Calc-Hgengine/tools/gen7/install_calc_data.cjs output/dynamic-calc/photonicsun.json ../Dynamic-Calc-Hgengine/backups/pspm.js
node verify_pspm.cjs --installed
```

The generator starts from the preserved `work/pspm.original.js`, downloaded
workbook JSON, and `output/trainers.json`; it is repeatable for those inputs.
The full set-level change report is `output/pspm_sync_audit.json` there.

Verification independently enumerates sheet table headers, checks every party
slot, compares ordinary trainer values to the ROM export, validates every order
link, and exercises the calculator's actual lead-index and trainer-preview
functions for all IDs and double battles. The installed Pokémon/move definitions
now come from the reusable Gen 7 ROM exporter; verification compares them with
that export. Duplicate party members use level-star labels so the application's
trainer-name filter keeps the entire party visible. No emulator testing is part
of this sync or its verification.

See [the audit](pspm.audit.md) for the original JS/sheet disagreement counts and
individual nature, ability, and moveset differences. The reusable exporter and
Ddex installation commands are documented in [tools/gen7](../../tools/gen7/README.md).
