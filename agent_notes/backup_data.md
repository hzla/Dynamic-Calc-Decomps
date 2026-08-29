# Backup Data Schema (Calc Source Files)

Purpose: compact, LLM-friendly schema guide for generating `backup_data` JS files used by the calc. Optimized for ROM-reading pipelines that emit backup_data.

Key idea: a backup file is a JS module that defines a global object (commonly `backup_data`) with the fields below. The calc reads these fields in `js/initialize.js`.

## 1) Top-Level Object

Required for full sources:
- `formatted_sets`
- `poks`
- `moves`

Optional:
- `custom_moves`
- `poks_replacements`
- `move_replacements`
- `ability_replacements`
- `item_replacements`
- `includes`
- `type_chart`
- `title`
- `order`

Compact JSON schema example:
```json
{
  "title": "Sterling Silver 1.17",
  "formatted_sets": { "<PokemonName>": { "<SetName>": { /* Set */ } } },
  "poks": { "<PokemonNameOrId>": { /* Species */ } },
  "moves": { "<MoveName>": { /* Move */ } },
  "custom_moves": { "<MoveName>": { /* Move */ } },
  "poks_replacements": { "<OldName>": "<NewName>" },
  "move_replacements": { "<OldName>": "<NewName>" },
  "ability_replacements": { "<OldName>": "<NewName>" },
  "item_replacements": { "<OldName>": "<NewName>" },
  "type_chart": {
    "Normal": { "Normal": 1, "Ghost": 0 },
    "Ghost": { "Normal": 0, "Ghost": 2 }
  },
  "includes": {
    "poks": ["<PokemonName>"],
    "moves": ["<MoveName>"],
    "items": ["<ItemName>"],
    "growths": ["<GrowthName>"],
    "abilities": ["<AbilityName>"]
  },
  "order": [/* trainer ordering data, if present */]
}
```

Notes:
- `order` can be omitted if a separate trainer order file exists.
- Replacement maps are applied by name to bridge ROM naming quirks.
- `type_chart` is an attacking-type to defending-type effectiveness table. When present, it overrides the URL `types` parameter and the title's default type chart.

## 2) `formatted_sets` Schema

Structure: `formatted_sets[pokemonName][setName] = Set`

Required fields (set):
- `level` (number)
- `tr_id` (number) internal trainer ID (trainer NARC index)
- `ai` (number) AI flags bitfield
- `battle_type` (string, usually `"Singles"`)
- `reward_item` (string; Gen 5 only, else empty string)
- `form` (string; empty if none)
- `item` (string; `"-"` or `"None"` when empty)
- `ivs` (object with `hp`, `at`, `df`, `sa`, `sd`, `sp`)
- `nature` (string)
- `moves` (array of move name strings, usually length 4)
- `sub_index` (number) index within trainer party
- `ability` (string)
- `evs` (object; partial allowed)

Compact JSON schema example:
```json
{
  "formatted_sets": {
    "Yanmega": {
      "Lvl 56 Pkmn Trainer Lucas ": {
        "level": 56,
        "tr_id": 141,
        "ai": 7,
        "battle_type": "Singles",
        "reward_item": "",
        "form": "",
        "item": "Focus Sash",
        "ivs": { "hp": 31, "at": 31, "df": 31, "sa": 31, "sd": 31, "sp": 31 },
        "nature": "Gentle",
        "moves": ["U-turn", "Energy Ball", "Dragon Pulse", "Aura Sphere"],
        "sub_index": 0,
        "ability": "Speed Boost",
        "evs": { "df": 0 }
      }
    }
  }
}
```

## 3) `poks` Schema (Species Data)

Required:
- `bs` (base stats) with keys `hp`, `at`, `df`, `sa`, `sd`, `sp`

Optional:
- `types` (array of type strings)
- `abilities` (object mapping slots to ability names)

Compact JSON schema example:
```json
{
  "poks": {
    "Yanmega": {
      "bs": { "hp": 86, "at": 76, "df": 86, "sa": 116, "sd": 56, "sp": 95 },
      "types": ["Bug", "Flying"],
      "abilities": { "0": "Speed Boost", "1": "Tinted Lens" }
    }
  }
}
```

Notes:
- Keys may be display names or cleaned IDs; both are accepted.
- `abilities` follows a Showdown-style slot map.

## 4) `moves` Schema (Move Data)

Required:
- `basePower` (number)

Optional fields (copied if present):
- `type`, `category`, `e_id`, `multihit`, `target`, `critRatio`, `recoil`, `drain`, `heal`, `overrideBP`, `secondaries`, `priority`, `willCrit`

`recoil`, `drain`, and `heal` use Showdown fraction arrays such as `[1, 4]` for 25%. A supplied field replaces the vanilla move value; an omitted field leaves the vanilla value intact for older data sources.

Optional flag fields:
- `makesContact`, `isPunch`, `isBite`, `isBullet`, `isSound`, `isPulse`, `isKick`, `isSword`, `isBone`, `isWind`

Optional compatibility:
- `flags` object (e.g., `{ "punch": 1, "sound": 1 }`) will set `isPunch`/`isSound`.

Compact JSON schema example:
```json
{
  "moves": {
    "U-turn": {
      "basePower": 70,
      "type": "Bug",
      "category": "Physical",
      "priority": 0,
      "makesContact": true
    },
    "Dragon Pulse": {
      "basePower": 85,
      "type": "Dragon",
      "category": "Special",
      "flags": { "sound": 0 }
    }
  }
}
```

## Generation Checklist (LLM-Oriented)

- Emit `formatted_sets`, `poks`, and `moves` for full sources.
- Use canonical move and Pokemon names; add `*_replacements` if ROM naming differs.
- Always include `ivs` with all six stats; `evs` can be partial.
- For Gen 5, set `reward_item` if the trainer gives one; otherwise use empty string.
- Use `item: "-"` or `"None"` when a Pokemon has no held item.
- Keep set schema consistent across all trainers in a file.

## 5) Gen 4 Trainer Nature Derivation (HGSS / Platinum)

Trainer Pokemon natures are not stored directly; derive them from `trpok`, `trdata`, and `personal` data with the PRNG below. A gender table for HGSS or Platinum is required.

Inputs per Pokemon:
- `file_name`: trainer file id (string/number).
- `sub_index`: Pokemon index within trainer party.
- `trpok`: `trpok/{file_name}.json`
  - `readable.ability_{sub_index}` for ability slot.
  - `raw` for `species_id_{sub_index}`, `ivs_{sub_index}`, `level_{sub_index}`.
- `trdata`: `trdata/{file_name}.json` → `raw.class` (trainer class).
- `personal`: `personal/{species_id}.json` → `readable` (loaded, but not used in the PRNG in this implementation).
- `gender_table`: `texts/hgss_genders.txt` or `texts/plat_genders.txt`
  - `"01"` means female, otherwise male.

Derived fields:
- `trainer_id = file_name.to_i`
- `trainer_class = trdata.raw.class`
- `difficulty = trpok.raw.ivs_{sub_index}`
- `level = trpok.raw.level_{sub_index}`
- `raw_ability = (trpok.readable.ability_{sub_index} / 16) - 1`
- `ability = raw_ability >= 0 ? raw_ability : last_non_zero_ability_or_0`
  - `last_non_zero_ability_or_0` is tracked within the same trainer party
  - if all previous Pokemon have `raw_ability < 0`, use `0` (ability 1)
- `species = species_id % 1024` (if > 1024)
- `gender = (gender_table[trainer_class] == "01") ? "female" : "male"`

Compact JS-like pseudocode:
```js
function getNatureG4({
  fileName, subIndex, trpokReadable, trpokRaw, trdataRaw, genderTable, baseRom, lastNonZeroAbility = 0
}) {
  let species = trpokRaw[`species_id_${subIndex}`] | 0;
  if (species > 1024) species = species % 1024;

  const trainerId = Number(fileName);
  const trainerClass = trdataRaw.class | 0;
  const difficulty = trpokRaw[`ivs_${subIndex}`] | 0;
  const level = trpokRaw[`level_${subIndex}`] | 0;
  const abilitySlot = trpokReadable[`ability_${subIndex}`] | 0;
  const rawAbility = Math.floor(abilitySlot / 16) - 1;
  const ability = rawAbility >= 0 ? rawAbility : lastNonZeroAbility;
  const nextLastNonZeroAbility = rawAbility >= 0 ? rawAbility : lastNonZeroAbility;

  const gender = (genderTable[trainerClass] === "01") ? "female" : "male";

  // PRNG
  let seedHex = (level + species + difficulty + trainerId).toString(16);
  for (let i = 0; i < trainerClass; i++) {
    const seed = parseInt(seedHex, 16) >>> 0;
    const result = (0x41C64E6D * seed + 0x00006073) >>> 0;
    seedHex = result.toString(16).slice(-8);
  }

  let result = seedHex.slice(0, -4);
  const midBytes = result !== "" ? result.slice(-4) : seedHex;
  const lowBytes = (gender === "male") ? "88" : "78";
  const highBytes = "00";
  const pidHex = highBytes + midBytes + lowBytes;

  const pidLastTwo = parseInt(pidHex, 16).toString().slice(-2);
  const baseNature = (parseInt(pidLastTwo, 10) % 25);
  const ab = (ability > 0) ? 1 : 0;

  const natureId = (baseRom === "HGSS")
    ? ((parseInt(pidLastTwo, 10) + ab) % 25)
    : baseNature;

  return {
    nature: NATURES[natureId], // NATURES = array of 25 names
    nextLastNonZeroAbility,
  };
}
```

Notes:
- The gender table is indexed by `trainer_class`.
- Iterate the trainer party in order and pass `nextLastNonZeroAbility` into the next Pokemon; start at `0` (ability 1) for the first Pokemon in a trainer.
- The PRNG uses a hex seed and iterates `trainer_class` times.
- For HGSS only, add `ab` before modulo 25.
