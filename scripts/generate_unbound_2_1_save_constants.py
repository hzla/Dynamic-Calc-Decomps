#!/usr/bin/env python3
import json
from pathlib import Path


UNBOUND_2_1_FILE_SIGNATURE = 0x01121999
UNBOUND_RANDOMIZER_FLAGS = [0x9FD, 0x9FE]
UNBOUND_BOX_COUNT = 25
UNBOUND_SHINY_ODDS = 16
UNBOUND_VERSION = 15
UNBOUND_BASE_VERSION = 4

BASE_VERSION_NAMES = {
    1: "sapphire",
    2: "ruby",
    3: "emerald",
    4: "firered",
    5: "leafgreen",
}

CUSTOM_HACK_VERSIONS = {
    14: "magm",
    15: "unbound",
}

CFRU_LAYOUT = {
    "saveSize": 0xE000,
    "blockSize": 0x1000,
    "blockDataSize": 0xFF0,
    "blockIdOffset": 0xFF4,
    "checksumOffset": 0xFF6,
    "fileSignatureOffset": 0xFF8,
    "saveIndexOffset": 0xFFC,
    "fixedExtraBlockIds": [30, 31],
    "saveBlockNumbers": list(range(14)) + [30, 31],
    "compressedMonSize": 58,
    "monsPerBox": 30,
    "boxNameLength": 9,
    "boxNamesSaveBlock": 13,
    "boxNamesOffset": 0x361,
    "boxNamesEndOffset": 0x442,
    "startingBoxMemoryOffsets": {
        "0": 0xB0,
        "2": 0xF18,
        "3": 0x0,
        "5": 0x4,
        "6": 0x0,
        "7": 0x0,
        "8": 0x0,
        "9": 0x0,
        "10": 0x0,
        "11": 0x0,
        "12": 0x0,
        "13": 0x0,
        "30": 0xB0C,
        "31": 0x0,
    },
    "frlgPartyCountOffset": 0x34,
    "frlgPartyBaseOffset": 0x38,
    "partyStructSize": 100,
    "boxStructSize": 80,
    "cfruFlagsA": {
        "saveBlock": 0,
        "offset": 0xF24,
    },
    "cfruFlagsB": {
        "saveBlock": 4,
        "offset": 0xD98,
        "size": 0x200,
    },
}


def load_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def parse_charmap(path: Path):
    char_map = {}
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            row = line.rstrip("\n")
            if not row or "=" not in row:
                continue
            raw_key, raw_value = row.split("=", 1)
            raw_key = raw_key.strip()
            if not raw_key:
                continue
            char_map[str(int(raw_key, 16))] = raw_value
    return char_map


def format_nature_name(token: str) -> str:
    token = token.replace("NATURE_", "")
    return " ".join(piece.capitalize() for piece in token.split("_"))


def build_constants():
    repo_root = Path(__file__).resolve().parents[1]
    unbound_cloud_root = repo_root.parent / "Unbound-Cloud"
    server_data_root = unbound_cloud_root / "server" / "src" / "data"
    client_data_root = unbound_cloud_root / "src" / "data"
    profile_root = server_data_root / "unbound_2_1"

    species_by_id = load_json(profile_root / "Species.json")
    items_by_id = load_json(profile_root / "Items.json")
    moves_by_id = load_json(profile_root / "Moves.json")
    base_stats_by_species = load_json(profile_root / "BaseStats.json")

    species_names = load_json(client_data_root / "SpeciesNames.json")
    species_alt_names = load_json(client_data_root / "SpeciesNamesAlts.json")
    item_names = load_json(client_data_root / "ItemNames.json")
    move_names = load_json(client_data_root / "MoveNames.json")
    ability_names = load_json(client_data_root / "AbilityNames.json")

    natures = load_json(server_data_root / "Natures.json")
    languages = load_json(server_data_root / "Languages.json")
    experience_curves = load_json(client_data_root / "ExperienceCurves.json")
    char_map = parse_charmap(server_data_root / "charmap.tbl")

    display_species_names = {}
    for species_define in set(species_by_id.values()) | set(base_stats_by_species.keys()):
        if species_define in species_alt_names:
            display_species_names[species_define] = species_alt_names[species_define]
        else:
            display_species_names[species_define] = species_names.get(species_define, species_define)

    display_item_names = {}
    for item_define in set(items_by_id.values()):
        raw_item = item_names.get(item_define)
        if isinstance(raw_item, dict):
            display_item_names[item_define] = raw_item.get("name", item_define)
        else:
            display_item_names[item_define] = raw_item or item_define

    display_move_names = {}
    for move_define in set(moves_by_id.values()):
        display_move_names[move_define] = move_names.get(move_define, move_define)

    constants = {
        "PROFILE_KEY": "unbound_2_1",
        "CURRENT_GAME_NAME": "unbound",
        "FILE_SIGNATURE": UNBOUND_2_1_FILE_SIGNATURE,
        "BOX_COUNT": UNBOUND_BOX_COUNT,
        "SHINY_ODDS": UNBOUND_SHINY_ODDS,
        "CURRENT_VERSION": UNBOUND_VERSION,
        "BASE_VERSION": UNBOUND_BASE_VERSION,
        "BASE_VERSION_NAMES": BASE_VERSION_NAMES,
        "CUSTOM_HACK_VERSIONS": CUSTOM_HACK_VERSIONS,
        "RANDOMIZER_FLAGS": UNBOUND_RANDOMIZER_FLAGS,
        "CFRU_LAYOUT": CFRU_LAYOUT,
        "SPECIES_BY_ID": species_by_id,
        "ITEMS_BY_ID": items_by_id,
        "MOVES_BY_ID": moves_by_id,
        "BASE_STATS_BY_SPECIES": base_stats_by_species,
        "SPECIES_DISPLAY_NAMES_BY_DEFINE": display_species_names,
        "ITEM_DISPLAY_NAMES_BY_DEFINE": display_item_names,
        "MOVE_DISPLAY_NAMES_BY_DEFINE": display_move_names,
        "ABILITY_DISPLAY_NAMES_BY_DEFINE": ability_names,
        "NATURE_TOKENS": natures,
        "NATURE_DISPLAY_NAMES": [format_nature_name(token) for token in natures],
        "LANGUAGE_TOKENS": languages,
        "EXPERIENCE_CURVES_BY_GROWTH": experience_curves,
        "CHAR_MAP": char_map,
    }

    output_path = repo_root / "js" / "savereaders" / "save_constants" / "unbound_2_1_constants.js"
    payload = json.dumps(constants, ensure_ascii=False, indent=2, sort_keys=True)
    output = f"""(function (root, factory) {{
  if (typeof module === "object" && module.exports) {{
    module.exports = factory();
    return;
  }}

  root.unbound21SaveConstants = factory();
}})(typeof globalThis !== "undefined" ? globalThis : this, function () {{
  "use strict";

  return {payload};
}});
"""
    output_path.write_text(output, encoding="utf-8")
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    build_constants()
