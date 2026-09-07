# Battle sprite migration

Replaced **1,155 static battle sprites** (**342 front**, **813 back**) and added **38 missing Z-A Mega sprites** (**19 front**, **19 back**). Existing filenames and source GIF bytes are preserved, including dimensions, transparency, timing, and looping.

The final sources are **1,105 Essentials GIFs**, **48 RetroNC GIFs** from `sprites/retromc`, and **40 Aronousqui20 GIFs**. RetroNC fronts take priority wherever available. All **46 Z-A Mega forms supported by `ZA_PATCH`** now have front and back sprites; the existing Floette and Zygarde legacy filename aliases are also retained. Verified Essentials animations fill the artist packs' missing sides, including the distinct Original Color Mega Magearna.

The footer credits Sprites Animados Contributors, Aronousqui20, and RetroNC, with the requested DeviantArt links for the latter two.

The migration preserved all **2,036 existing animations** and left box/trainer icons unchanged. There are **650 other unmatched/custom/helper files** and the **22 vanilla-variant files** listed below that remain unchanged.

## Verification

- All replacements fully decode, have multiple visually distinct frames, and match their source SHA-256 checksums.
- Exactly 1,155 of 11,610 original image files changed; all 10,455 others retained their original checksums. The only additions are the 38 approved Z-A sprites; no images were deleted.
- A final dry run with both source packs and missing Z-A additions enabled proposes zero changes; eight isolated migration tests pass.
- Checked identity, orientation, loading, and fit in both calculator panels with Annihilape, Charizard-Mega-Y, Arcanine-Hisui, Meowstic-F, Xerneas, and the preserved custom Ababo sprite. Also checked Baxcalibur-Mega, Absol-Mega-Z, Meganium-Mega, and Magearna-Original-Mega after applying the artist preferences. Successive browser captures show animated pose changes.
- Verified all three footer credits and both exact link destinations in the rendered calculator.

## Remaining vanilla variants

| Filename (without `.gif`) | Side | Reason |
| --- | --- | --- |
| eevee-starter-f | front and back | No dedicated female counterpart in this pack; preserve the existing gender detail |
| eternatus-eternamax | back | Matching Essentials back sprite is absent |
| gourgeist-large | front and back | Pack supplies only the default size artwork; preserve the existing distinct size variant |
| gourgeist-small | front and back | Pack supplies only the default size artwork; preserve the existing distinct size variant |
| gourgeist-super | front and back | Pack supplies only the default size artwork; preserve the existing distinct size variant |
| pichu-spikyeared | back | Matching Essentials file is static |
| pumpkaboo-large | front and back | Pack supplies only the default size artwork; preserve the existing distinct size variant |
| pumpkaboo-small | front and back | Pack supplies only the default size artwork; preserve the existing distinct size variant |
| pumpkaboo-super | front and back | Pack supplies only the default size artwork; preserve the existing distinct size variant |
| spiky-eared-pichu | back | Matching Essentials file is static |
| venusaur-mega-f | front and back | No dedicated female counterpart in this pack; preserve the existing gender detail |
| xerneas-neutral | front and back | Matching Essentials file is static |
| zarude-dada | back | Matching Essentials file is static |

## Reusing the migration utility

Requires Python 3 and Pillow. From the calculator repository, run a dry run:

```sh
python3 scripts/migrate_battle_sprites.py --source /path/to/essentials_gifs
```

Add `--apply` to copy eligible animations. Add `--report /path/to/audit.json` to save the complete audit; use a new report path to retain the original migration record.

To also select the preferred Z-A artist sprites and include missing supported Z-A files:

```sh
python3 scripts/migrate_battle_sprites.py \
  --source /path/to/essentials_gifs \
  --za-sprites /path/to/sprites \
  --add-missing-za \
  --report /path/to/new-audit.json
```

This still defaults to a dry run. `--za-sprites` enables replacement with the explicitly mapped preferred Z-A artwork, even if that form already animates. `--add-missing-za` separately allows additions from that mapping. Ordinary existing animations remain protected. In this migration, the Z-A preference pass superseded 54 of the newly copied Essentials animations, added 38 files, and retained four already matching Essentials fallbacks; it did not change any animation that existed before the migration.

The [form mapping](battle_sprite_form_mapping.json) contains explicit numbered forms and reviewed aliases. The [full audit](battle_sprite_migration_report.json) records every file, its original image format/frame counts/checksum, source mapping, and replacement or skip reason. The utility never infers a form by removing an unknown suffix.

Run the isolated checks with:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s scripts -p test_migrate_battle_sprites.py
```
