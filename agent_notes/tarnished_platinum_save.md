# Tarnished Platinum Save Import

In the blank-slate calculator (`?dev=1` without `data`), select **Calc Configs > Mechanics > Tarnished Platinum**, save the config, and use **Read .sav**. This is a read-only import. The preset selects the Gen 9 data catalog for its expanded roster; damage generation and the other battle settings remain configurable.

## Layout

- The 512 KiB battery save has two banks at `0x0` and `0x40000`.
- Within each bank, the general block starts at `0x0` and spans `0xD158` bytes. Party count is a little-endian u32 at `0x9C`, and the first 236-byte party record starts at `0xA0`.
- The storage block starts at `0xD158` and spans `0x134E0` bytes. Its first 136-byte boxed record starts at `0xD15C`, followed by the rest of the 18 contiguous 30-slot boxes.
- Both blocks end with a 20-byte footer containing a generation, a revision, the block length, magic `0x20060623`, the block ID, and a CRC16. Match the generation across general and storage blocks; they may be in different banks. Reject corrupt blocks before selecting the newest pair.
- Records use the existing Gen 4 block shuffle and checksum-seeded encryption. Party level comes from the decrypted party extension; boxed level is derived from experience and the growth table.

## ID Tables

The built-in tables follow the supplied `species.txt`, `moves.txt`, `items.txt`, and `abilities.txt` in zero-based ROM order. Count markers are not entries. The sample's active party decodes as level 5 Shinx, with level 3 Lechonk (species ID `494`) in the active PC in the opposite bank.

Box levels use the supplied `growth_rates.txt`. The generator checks each row's ID and species constant against `species.txt` before assigning its curve. The Pikachu costumes and Winter Sawsbuck use vanilla base-species stats until custom stats are supplied. New item and ability labels do not add custom battle effects.

An uploaded `backup_data.js` may provide complete `includes.poks`, `includes.moves`, `includes.items`, `includes.growths`, and `includes.abilities` arrays indexed by the save's IDs. The selected Calc Gen or uploaded species data must contain the mapped species.

To regenerate the built-in arrays, pass the directory containing the four ID lists and `growth_rates.txt`:

```sh
node scripts/generate_tarnished_platinum_save_constants.cjs <constants-directory>
```
