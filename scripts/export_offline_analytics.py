#!/usr/bin/env python3
"""Export offline analytics JSON assets from a local Postgres restore."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = ROOT / "data" / "analytics"
DEFAULT_HISTORY_LIMIT = 100

TITLE_TO_SLUG = {
    "Emerald Imperium 1.3": "emerald-imperium-1-3",
    "Platinum Kaizo": "platinum-kaizo",
    "Pokemon Null": "pokemon-null",
    "Cascade White": "cascade-white",
    "Vintage White Plus": "vintage-white-plus",
}

TITLE_TO_BACKUP = {
    "Emerald Imperium 1.3": ROOT / "backups" / "imp_1-3.js",
    "Platinum Kaizo": ROOT / "backups" / "pk.js",
    "Pokemon Null": ROOT / "backups" / "null.js",
    "Cascade White": ROOT / "backups" / "casc.js",
    "Vintage White Plus": ROOT / "backups" / "vwplus.js",
}

CONFIG_PATH = ROOT / "js" / "analytics" / "dashboard_game_config.js"
EVOS_PATH = ROOT / "calc" / "data" / "evos.js"
EM_IMP_PRIMARY_MONS_PATH = ROOT / "js" / "savereaders" / "save_constants" / "em_imp_primary_mons.js"
TRAINER_ORDERS_DIR = ROOT / "backups" / "trainer_orders"
EM_IMP_ORDERS_PATH = ROOT / "js" / "savereaders" / "save_constants" / "orders.js"

TRAINER_NAME_RE = re.compile(r"Lvl\s+-?\d+\s+(.+?)\s*$")
IMPORTANT_TRAINER_RE = re.compile(r"(Leader|Elite Four|Champion)", re.I)
EM_IMP_ORDER_NAME_RE = re.compile(r"^(.*?) \(Lvl [^ ]+ (.*?) \)$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dsn", help="Postgres DSN. Overrides individual connection flags.")
    parser.add_argument("--host", default="localhost", help="Database host")
    parser.add_argument("--port", default=5432, type=int, help="Database port")
    parser.add_argument("--dbname", default="postgres", help="Database name")
    parser.add_argument("--user", default="postgres", help="Database user")
    parser.add_argument("--password", help="Database password")
    parser.add_argument(
        "--password-env",
        default="PGPASSWORD",
        help="Environment variable to read the database password from if --password is omitted",
    )
    parser.add_argument(
        "--title",
        action="append",
        dest="titles",
        help="Limit export to one or more supported game titles",
    )
    parser.add_argument(
        "--history-limit",
        default=DEFAULT_HISTORY_LIMIT,
        type=int,
        help="Maximum number of recent battles to keep in each trainer detail file",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Directory to write analytics JSON into",
    )
    return parser.parse_args()


def import_db_driver():
    try:
        import psycopg  # type: ignore

        return "psycopg", psycopg
    except ImportError:
        try:
            import psycopg2  # type: ignore
            import psycopg2.extras  # type: ignore

            return "psycopg2", psycopg2
        except ImportError as exc:  # pragma: no cover - environment dependent
            raise SystemExit(
                "Install a Postgres driver first: `python -m pip install psycopg[binary]` "
                "or `python -m pip install psycopg2-binary`."
            ) from exc


def connect_db(args: argparse.Namespace):
    driver_name, module = import_db_driver()
    password = args.password if args.password is not None else os.environ.get(args.password_env)

    if args.dsn:
        if driver_name == "psycopg":
            return module.connect(args.dsn, row_factory=module.rows.dict_row)
        connection = module.connect(args.dsn)
        connection.autocommit = False
        return connection

    kwargs = {
        "host": args.host,
        "port": args.port,
        "dbname": args.dbname,
        "user": args.user,
    }
    if password:
        kwargs["password"] = password

    if driver_name == "psycopg":
        return module.connect(**kwargs, row_factory=module.rows.dict_row)
    connection = module.connect(**kwargs)
    connection.autocommit = False
    return connection


def dict_cursor(connection):
    driver_name, module = import_db_driver()
    if driver_name == "psycopg":
        return connection.cursor()
    return connection.cursor(cursor_factory=module.extras.RealDictCursor)


def extract_js_literal(source: str, variable_name: str) -> Any:
    match = re.search(rf"(?:window\.)?{re.escape(variable_name)}\s*=\s*", source)
    if not match:
        raise ValueError(f"Could not find assignment for {variable_name}")

    index = match.end()
    while index < len(source) and source[index].isspace():
        index += 1
    if index >= len(source) or source[index] not in "[{":
        raise ValueError(f"Assignment for {variable_name} does not start with JSON-compatible data")

    opening = source[index]
    closing = "]" if opening == "[" else "}"
    depth = 0
    in_string = False
    escape = False

    for pos in range(index, len(source)):
        char = source[pos]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
            continue
        if char == opening:
            depth += 1
            continue
        if char == closing:
            depth -= 1
            if depth == 0:
                literal = source[index : pos + 1]
                literal = re.sub(r",(\s*[}\]])", r"\1", literal)
                literal = re.sub(
                    r"'([^'\\]*(?:\\.[^'\\]*)*)'",
                    lambda match: json.dumps(match.group(1)),
                    literal,
                )
                return json.loads(literal)

    raise ValueError(f"Could not parse literal for {variable_name}")


def load_json_literal(path: Path, variable_name: str) -> Any:
    source = path.read_text(encoding="utf-8")
    try:
        return extract_js_literal(source, variable_name)
    except (json.JSONDecodeError, ValueError):
        command = [
            "node",
            "-e",
            (
                "const fs=require('fs');"
                "const vm=require('vm');"
                "const file=process.argv[1];"
                "const varName=process.argv[2];"
                "const source=fs.readFileSync(file,'utf8');"
                "const sandbox={window:{}};"
                "vm.createContext(sandbox);"
                "vm.runInContext(source, sandbox);"
                "const value=(varName in sandbox)?sandbox[varName]:sandbox.window[varName];"
                "if (value === undefined) { throw new Error(`Missing ${varName}`); }"
                "process.stdout.write(JSON.stringify(value));"
            ),
            str(path),
            variable_name,
        ]
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        return json.loads(result.stdout)


def load_dashboard_config() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        return {}
    return load_json_literal(CONFIG_PATH, "DASHBOARD_GAME_CONFIG")


def load_evo_data() -> dict[str, Any]:
    return load_json_literal(EVOS_PATH, "evoData")


def load_em_imp_primary_mons() -> dict[str, Any]:
    return load_json_literal(EM_IMP_PRIMARY_MONS_PATH, "em_imp_primary_mons")


def species_name_table(title: str) -> list[str]:
    if "Imperium" in title:
        return load_json_literal(
            ROOT / "js" / "savereaders" / "save_constants" / "em_imp_constants.js",
            "emImpMons",
        )
    return load_json_literal(ROOT / "js" / "savereaders" / "enums.js", "sav_pok_names")


def normalize_usage_key(title: str, trainer_name: str, tr_id: Any) -> str:
    if " Null" in title:
        return trainer_name
    if tr_id in (None, ""):
        return trainer_name
    return str(tr_id)


def safe_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if value is None:
        return None
    text = str(value).strip()
    if re.fullmatch(r"-?\d+", text):
        return int(text)
    return None


def build_backup_trainer_entries(title: str) -> list[dict[str, Any]]:
    backup = load_json_literal(TITLE_TO_BACKUP[title], "backup_data")
    all_poks = backup if title == "Emerald Imperium 1.3" else backup["formatted_sets"]

    trainers_by_name: dict[str, list[dict[str, Any]]] = {}
    for species_name, sets in all_poks.items():
        for set_name, raw_data in sets.items():
            match = TRAINER_NAME_RE.search(set_name)
            if not match:
                continue
            trainer_name = match.group(1)
            entry = dict(raw_data)
            entry["species"] = species_name
            trainers_by_name.setdefault(trainer_name, []).append(entry)

    results = []
    for trainer_name, team in trainers_by_name.items():
        lead = team[0] if team else {}
        levels = [safe_int(mon.get("level")) for mon in team]
        valid_levels = [level for level in levels if level is not None]
        tr_id = lead.get("tr_id")
        results.append(
            {
                "displayName": trainer_name,
                "usageKey": normalize_usage_key(title, trainer_name, tr_id),
                "leadLevel": safe_int(lead.get("level")) if lead else None,
                "maxLevel": max(valid_levels) if valid_levels else None,
                "isBoss": bool(IMPORTANT_TRAINER_RE.search(trainer_name)),
                "partySize": len(team),
                "trId": safe_int(tr_id),
            }
        )
    return results


def relation_columns(cur, schema: str, relation: str) -> set[str]:
    cur.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = %s AND table_name = %s
        """,
        (schema, relation),
    )
    return {row["column_name"] for row in cur.fetchall()}


def resolve_source_relation(cur) -> tuple[str, str, set[str]]:
    required_columns = {"title", "tr", "party", "box_data", "box_count", "created_at"}
    candidates = ["v_usage_events_with_party", "usage_events_with_party", "usage_events"]

    for relation in candidates:
        cur.execute(
            """
            SELECT n.nspname AS schema_name, c.relname AS relation_name
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = %s AND c.relkind IN ('v', 'm', 'r', 'f', 'p')
            ORDER BY CASE WHEN n.nspname = 'public' THEN 0 ELSE 1 END, n.nspname
            LIMIT 1
            """,
            (relation,),
        )
        row = cur.fetchone()
        if not row:
            continue
        columns = relation_columns(cur, row["schema_name"], row["relation_name"])
        if required_columns.issubset(columns):
            return row["schema_name"], row["relation_name"], columns

    raise SystemExit(
        "Could not find a relation with the analytics fields expected by the export script. "
        "Restore the database view `v_usage_events_with_party`, or extend the script for your schema."
    )


def fetch_titles(cur, relation_sql: str) -> list[str]:
    cur.execute(f"SELECT DISTINCT title FROM {relation_sql} ORDER BY title")
    return [row["title"] for row in cur.fetchall() if row["title"] in TITLE_TO_SLUG]


def fetch_rows_for_title(cur, relation_sql: str, columns: set[str], title: str) -> list[dict[str, Any]]:
    tid_sql = "tid" if "tid" in columns else "NULL::text AS tid"
    cur.execute(
        f"""
        SELECT title, tr, {tid_sql}, event_id, created_at, party, box_data, box_count
        FROM {relation_sql}
        WHERE title = %s
        ORDER BY created_at DESC NULLS LAST, event_id DESC NULLS LAST
        """,
        (title,),
    )
    return list(cur.fetchall())


def ensure_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return json.loads(value)
    return list(value)


def decode_bytea_hex(value: Any) -> bytes:
    if value is None:
        return b""
    if isinstance(value, memoryview):
        return value.tobytes()
    if isinstance(value, bytes):
        return value
    text = str(value).strip()
    if (text.startswith("'") and text.endswith("'")) or (text.startswith('"') and text.endswith('"')):
        text = text[1:-1]
    if text.startswith("\\x") or text.startswith("0x"):
        text = text[2:]
    return bytes.fromhex(text)


def unpack_12bit_values(raw_bytes: bytes, count: int) -> list[int]:
    out = []
    bit_pos = 0
    for _ in range(max(count, 0)):
        value = 0
        for bit_index in range(12):
            byte_index = bit_pos >> 3
            inner_bit_index = bit_pos & 7
            if byte_index >= len(raw_bytes):
                return out
            bit = (raw_bytes[byte_index] >> inner_bit_index) & 1
            value |= bit << bit_index
            bit_pos += 1
        out.append(value)
    return out


def decode_box_species(title: str, box_data: Any, box_count: Any, species_table: list[str]) -> list[str]:
    if box_count in (None, 0, "0"):
        return []
    count = safe_int(box_count)
    if count is None:
        return []
    values = unpack_12bit_values(decode_bytea_hex(box_data), count)
    species_names = []
    for value in values:
        if 0 <= value < len(species_table):
            species_name = species_table[value]
            if species_name:
                species_names.append(species_name)
    return species_names


def normalize_party(party_value: Any) -> list[dict[str, Any]]:
    party = ensure_list(party_value)
    normalized = []
    for mon in party:
        mon = mon or {}
        normalized.append(
            {
                "species": str(mon.get("s", "")).strip() if mon.get("s") is not None else "",
                "moves": [str(move).strip() for move in ensure_list(mon.get("m")) if str(move).strip()],
                "item": mon.get("i") or "",
                "ability": mon.get("a") or "",
                "nature": mon.get("n") or "",
            }
        )
    return normalized


def normalize_event_id(value: Any) -> str | None:
    if value in (None, ""):
        return None
    return str(value)


def normalize_tid(value: Any) -> str | None:
    if value in (None, ""):
        return None
    return str(value)


def normalize_created_at(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return str(value)


def top_counts(entries: dict[str, int], denominator: int) -> list[dict[str, int]]:
    sorted_entries = sorted(entries.items(), key=lambda item: (-item[1], item[0]))[:8]
    chips = []
    for name, count in sorted_entries:
        pct = round((count / denominator) * 100) if denominator else 0
        chips.append({"name": name, "count": count, "pct": pct})
    return chips


def build_summary(full_battles: list[dict[str, Any]]) -> dict[str, Any]:
    by_species: dict[str, dict[str, Any]] = {}

    def bucket(species: str) -> dict[str, Any]:
        if species not in by_species:
            by_species[species] = {
                "species": species,
                "inParty": 0,
                "inBox": 0,
                "inBoth": 0,
                "boxOnly": 0,
                "moves": defaultdict(int),
                "items": defaultdict(int),
                "abilities": defaultdict(int),
                "natures": defaultdict(int),
            }
        return by_species[species]

    for battle in full_battles:
        party = battle["party"]
        box = battle["boxPokemon"]
        party_set = {mon["species"] for mon in party if mon["species"]}
        box_set = {species for species in box if species}

        for species in box_set:
            bucket(species)["inBox"] += 1

        for mon in party:
            species = mon["species"]
            if not species:
                continue
            stats = bucket(species)
            if species in party_set:
                stats["inParty"] += 1
                party_set.remove(species)

            for move in set(mon["moves"]):
                stats["moves"][move] += 1

            if mon["item"]:
                stats["items"][mon["item"]] += 1
            if mon["ability"]:
                stats["abilities"][mon["ability"]] += 1
            if mon["nature"]:
                stats["natures"][mon["nature"]] += 1

        party_species = {mon["species"] for mon in party if mon["species"]}
        for species in box_set:
            stats = bucket(species)
            if species in party_species:
                stats["inBoth"] += 1
            else:
                stats["boxOnly"] += 1

    top_pokemon = []
    for stats in sorted(by_species.values(), key=lambda item: (-item["inParty"], item["species"]))[:100]:
        caught_count = stats["inParty"] + stats["boxOnly"]
        top_pokemon.append(
            {
                "species": stats["species"],
                "inParty": stats["inParty"],
                "caughtCount": caught_count,
                "participationPct": round((stats["inParty"] / caught_count) * 100) if caught_count else 0,
                "moves": top_counts(stats["moves"], stats["inParty"]),
                "items": top_counts(stats["items"], stats["inParty"]),
                "abilities": top_counts(stats["abilities"], stats["inParty"]),
                "natures": top_counts(stats["natures"], stats["inParty"]),
            }
        )

    return {
        "totalBattles": len(full_battles),
        "topPokemon": top_pokemon,
    }


def normalize_rows_for_title(title: str, rows: list[dict[str, Any]], species_table: list[str]) -> list[dict[str, Any]]:
    normalized_rows = []
    for row in rows:
        usage_key = str(row.get("tr"))
        normalized_rows.append(
            {
                "usageKey": usage_key,
                "tid": normalize_tid(row.get("tid")),
                "eventId": normalize_event_id(row.get("event_id")),
                "createdAt": normalize_created_at(row.get("created_at")),
                "party": normalize_party(row.get("party")),
                "boxPokemon": decode_box_species(title, row.get("box_data"), row.get("box_count"), species_table),
                "trainerId": safe_int(row.get("tr")),
            }
        )
    return normalized_rows


def load_trainer_orders(trainer_order_key: str | None) -> dict[str, Any] | None:
    if not trainer_order_key:
        return None
    path = TRAINER_ORDERS_DIR / f"{trainer_order_key}.js"
    if not path.exists():
        return None
    return load_json_literal(path, "trainerOrders")


def load_em_imp_orders() -> dict[str, Any] | None:
    if not EM_IMP_ORDERS_PATH.exists():
        return None
    return load_json_literal(EM_IMP_ORDERS_PATH, "emImpOrders")


def build_trainer_depth_map(trainer_orders: dict[str, Any] | None) -> tuple[dict[int, int], int]:
    if not trainer_orders:
        return {}, 0

    nodes: dict[int, dict[str, int | None]] = {}
    for raw_value in trainer_orders.values():
        trainer_id = safe_int(raw_value.get("id"))
        if trainer_id is None:
            continue
        nodes[trainer_id] = {
            "next": safe_int(raw_value.get("next")),
            "prev": safe_int(raw_value.get("prev")),
        }

    if not nodes:
        return {}, 0

    start_nodes = sorted(node_id for node_id, node in nodes.items() if node["prev"] not in nodes)
    remaining = sorted(nodes)
    traversal_order = start_nodes if start_nodes else remaining

    depth_map: dict[int, int] = {}
    next_depth = 1
    for start in traversal_order:
        current = start
        while current in nodes and current not in depth_map:
            depth_map[current] = next_depth
            next_depth += 1
            next_node = nodes[current]["next"]
            if next_node is None or next_node == current:
                break
            current = next_node

    for trainer_id in remaining:
        current = trainer_id
        while current in nodes and current not in depth_map:
            depth_map[current] = next_depth
            next_depth += 1
            next_node = nodes[current]["next"]
            if next_node is None or next_node == current:
                break
            current = next_node

    return depth_map, max(depth_map.values(), default=0)


def parse_em_imp_order_trainer_name(label: str) -> str | None:
    match = EM_IMP_ORDER_NAME_RE.match(label)
    if not match:
        return None
    return match.group(2).strip()


def build_name_depth_map(order_map: dict[str, Any] | None) -> tuple[dict[str, int], int]:
    if not order_map:
        return {}, 0

    nodes: dict[str, dict[str, str | None]] = {}
    for label, raw_value in order_map.items():
        trainer_name = parse_em_imp_order_trainer_name(label)
        if not trainer_name:
            continue
        next_label = raw_value.get("next")
        prev_label = raw_value.get("prev")
        nodes[label] = {
            "trainerName": trainer_name,
            "next": next_label if isinstance(next_label, str) else None,
            "prev": prev_label if isinstance(prev_label, str) else None,
        }

    if not nodes:
        return {}, 0

    start_nodes = sorted(label for label, node in nodes.items() if node["prev"] not in nodes)
    remaining = sorted(nodes)
    traversal_order = start_nodes if start_nodes else remaining

    depth_map: dict[str, int] = {}
    visited_labels: set[str] = set()
    next_depth = 1

    for start in traversal_order:
        current = start
        while current in nodes and current not in visited_labels:
            visited_labels.add(current)
            trainer_name = str(nodes[current]["trainerName"])
            depth_map[trainer_name] = next_depth
            next_depth += 1
            next_node = nodes[current]["next"]
            if not next_node or next_node == current:
                break
            current = next_node

    for label in remaining:
        current = label
        while current in nodes and current not in visited_labels:
            visited_labels.add(current)
            trainer_name = str(nodes[current]["trainerName"])
            depth_map[trainer_name] = next_depth
            next_depth += 1
            next_node = nodes[current]["next"]
            if not next_node or next_node == current:
                break
            current = next_node

    return depth_map, max(depth_map.values(), default=0)


def family_members(species: str, evo_data: dict[str, Any], exact_match: bool) -> set[str]:
    if exact_match or not species:
        return {species}

    entry = evo_data.get(species)
    resolved_species = species
    if entry is None and "-" in species:
        resolved_species = species.split("-")[0]
        entry = evo_data.get(resolved_species)
    if entry is None:
        return {species}

    ancestor = entry.get("anc") or resolved_species
    ancestor_entry = evo_data.get(ancestor)
    if ancestor_entry is None and "-" in ancestor:
        ancestor = ancestor.split("-")[0]
        ancestor_entry = evo_data.get(ancestor)

    if ancestor_entry is None:
        return {species}

    chain = [ancestor] + list(ancestor_entry.get("evos") or [])
    chain.append(species)
    return {member for member in chain if member}


def resolve_important_trainers(index_entries: list[dict[str, Any]], title_config: dict[str, Any]) -> list[dict[str, Any]]:
    configured = title_config.get("importantTrainers") or []
    by_usage_key = {str(entry["usageKey"]): entry for entry in index_entries}
    by_name = {entry["displayName"]: entry for entry in index_entries}

    if configured:
        resolved = []
        for item in configured:
            entry = None
            if item.get("usageKey") is not None:
                entry = by_usage_key.get(str(item["usageKey"]))
            if entry is None and item.get("displayName"):
                entry = by_name.get(item["displayName"])
            if entry is None:
                continue
            resolved.append(
                {
                    **entry,
                    "displayName": item.get("label") or entry["displayName"],
                }
            )
        return resolved

    derived = [entry for entry in index_entries if IMPORTANT_TRAINER_RE.search(entry["displayName"] or "")]
    derived.sort(key=lambda entry: ((entry.get("maxLevel") or entry.get("leadLevel") or 9999), entry["displayName"]))
    return derived


def build_run_buckets(normalized_rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    runs: dict[str, dict[str, Any]] = {}
    for row in normalized_rows:
        tid = row.get("tid")
        if not tid:
            continue
        bucket = runs.setdefault(
            tid,
            {
                "usageKeys": set(),
                "boxSpecies": set(),
                "trainerIds": set(),
                "trainerNames": set(),
            },
        )
        bucket["usageKeys"].add(row["usageKey"])
        bucket["boxSpecies"].update(row["boxPokemon"])
        if row["trainerId"] is not None:
            bucket["trainerIds"].add(row["trainerId"])
    return runs


def build_important_trainer_overview(index_entries: list[dict[str, Any]], runs_by_tid: dict[str, dict[str, Any]], title_config: dict[str, Any]) -> list[dict[str, Any]]:
    important_trainers = resolve_important_trainers(index_entries, title_config)
    output = []
    for trainer in important_trainers:
        usage_key = str(trainer["usageKey"])
        run_count = sum(1 for run in runs_by_tid.values() if usage_key in run["usageKeys"])
        output.append(
            {
                "displayName": trainer["displayName"],
                "usageKey": usage_key,
                "trId": trainer.get("trId"),
                "leadLevel": trainer.get("leadLevel"),
                "maxLevel": trainer.get("maxLevel"),
                "runCount": run_count,
            }
        )
    return output


def build_starter_gift_groups(
    runs_by_tid: dict[str, dict[str, Any]],
    title_config: dict[str, Any],
    evo_data: dict[str, Any],
) -> list[dict[str, Any]]:
    groups = title_config.get("starterGiftGroups") or {}
    if not groups or not runs_by_tid:
        return []

    exact_match_groups = set(title_config.get("exactMatchGroups") or [])
    results = []
    for label, configured_species in groups.items():
        if not configured_species:
            continue

        exact_match = label in exact_match_groups
        slices = []
        for species in configured_species:
            match_set = family_members(species, evo_data, exact_match)
            count = sum(1 for run in runs_by_tid.values() if run["boxSpecies"] & match_set)
            slices.append({"species": species, "count": count})

        total_runs_matched = sum(
            1
            for run in runs_by_tid.values()
            if any(run["boxSpecies"] & family_members(species, evo_data, exact_match) for species in configured_species)
        )
        total_detections = sum(slice_item["count"] for slice_item in slices)
        for slice_item in slices:
            slice_item["pct"] = round((slice_item["count"] / total_detections) * 100) if total_detections else 0
            slice_item["runPct"] = round((slice_item["count"] / total_runs_matched) * 100) if total_runs_matched else 0

        results.append(
            {
                "label": label,
                "totalRunsMatched": total_runs_matched,
                "slices": slices,
            }
        )

    return results


def build_run_depth_overview(
    title: str,
    runs_by_tid: dict[str, dict[str, Any]],
    index_entries: list[dict[str, Any]],
    trainer_order_key: str | None,
) -> dict[str, Any]:
    usage_key_to_name = {
        str(entry["usageKey"]): entry["displayName"]
        for entry in index_entries
        if entry.get("displayName") and entry.get("usageKey") is not None
    }
    for run in runs_by_tid.values():
        run["trainerNames"] = {
            usage_key_to_name[usage_key]
            for usage_key in run["usageKeys"]
            if usage_key in usage_key_to_name
        }

    if title == "Emerald Imperium 1.3":
        trainer_orders = load_em_imp_orders()
        depth_map, max_step = build_name_depth_map(trainer_orders)
        if not depth_map or not max_step:
            return {"available": False, "reason": "invalid_trainer_order"}

        run_max_steps = []
        for run in runs_by_tid.values():
            depths = [depth_map[name] for name in run["trainerNames"] if name in depth_map]
            if depths:
                run_max_steps.append(max(depths))

        if not run_max_steps:
            return {"available": False, "reason": "missing_trainer_name_matches"}

        average_step = sum(run_max_steps) / len(run_max_steps)
        return {
            "available": True,
            "averageStep": round(average_step, 1),
            "averagePct": round((average_step / max_step) * 100, 1) if max_step else 0,
            "maxStep": max_step,
            "runsCounted": len(run_max_steps),
        }

    if not trainer_order_key:
        return {"available": False, "reason": "no_trainer_order"}

    trainer_orders = load_trainer_orders(trainer_order_key)
    if not trainer_orders:
        return {"available": False, "reason": "no_trainer_order"}

    depth_map, max_step = build_trainer_depth_map(trainer_orders)
    if not depth_map or not max_step:
        return {"available": False, "reason": "invalid_trainer_order"}

    run_max_steps = []
    for run in runs_by_tid.values():
        depths = [depth_map[trainer_id] for trainer_id in run["trainerIds"] if trainer_id in depth_map]
        if depths:
            run_max_steps.append(max(depths))

    if not run_max_steps:
        return {"available": False, "reason": "missing_numeric_trainer_ids"}

    average_step = sum(run_max_steps) / len(run_max_steps)
    return {
        "available": True,
        "averageStep": round(average_step, 1),
        "averagePct": round((average_step / max_step) * 100, 1) if max_step else 0,
        "maxStep": max_step,
        "runsCounted": len(run_max_steps),
    }


def build_overview(
    title: str,
    index_entries: list[dict[str, Any]],
    normalized_rows: list[dict[str, Any]],
    title_config: dict[str, Any],
    evo_data: dict[str, Any],
) -> dict[str, Any]:
    runs_by_tid = build_run_buckets(normalized_rows)
    return {
        "runCount": len(runs_by_tid),
        "importantTrainerBattles": build_important_trainer_overview(index_entries, runs_by_tid, title_config),
        "starterGiftGroups": build_starter_gift_groups(runs_by_tid, title_config, evo_data),
        "runDepth": build_run_depth_overview(title, runs_by_tid, index_entries, title_config.get("trainerOrderKey")),
    }


def write_json(path: Path, payload: Any, *, pretty: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        if pretty:
            json.dump(payload, handle, indent=2)
        else:
            json.dump(payload, handle, separators=(",", ":"))
        handle.write("\n")


def export_title(
    title: str,
    rows: list[dict[str, Any]],
    generated_at: str,
    history_limit: int,
    output_dir: Path,
    dashboard_config: dict[str, Any],
    evo_data: dict[str, Any],
) -> None:
    slug = TITLE_TO_SLUG[title]
    title_dir = output_dir / slug
    title_dir.mkdir(parents=True, exist_ok=True)

    species_table = species_name_table(title)
    normalized_rows = normalize_rows_for_title(title, rows, species_table)

    grouped_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in normalized_rows:
        grouped_rows[row["usageKey"]].append(row)

    backup_entries = build_backup_trainer_entries(title)
    detail_file_by_usage_key = {}
    width = max(3, len(str(max(len(grouped_rows), 1))))
    for idx, usage_key in enumerate(sorted(grouped_rows.keys()), start=1):
        detail_file_by_usage_key[usage_key] = f"trainers/{idx:0{width}d}.json"

    index_entries: list[dict[str, Any]] = []
    seen_index_keys = set()
    fallback_entries: dict[str, dict[str, Any]] = {}

    for entry in backup_entries:
        usage_key = str(entry["usageKey"])
        if usage_key not in grouped_rows:
            continue
        composite_key = (entry["displayName"], usage_key)
        if composite_key in seen_index_keys:
            continue
        seen_index_keys.add(composite_key)
        normalized_entry = {
            "displayName": entry["displayName"],
            "usageKey": usage_key,
            "detailFile": detail_file_by_usage_key[usage_key],
            "leadLevel": entry["leadLevel"],
            "maxLevel": entry["maxLevel"],
            "isBoss": entry["isBoss"],
            "partySize": entry["partySize"],
            "trId": entry["trId"],
        }
        index_entries.append(normalized_entry)
        fallback_entries.setdefault(usage_key, normalized_entry)

    for usage_key in sorted(grouped_rows.keys()):
        if usage_key in fallback_entries:
            continue
        fallback_entry = {
            "displayName": usage_key,
            "usageKey": usage_key,
            "detailFile": detail_file_by_usage_key[usage_key],
            "leadLevel": None,
            "maxLevel": None,
            "isBoss": bool(IMPORTANT_TRAINER_RE.search(usage_key)),
            "partySize": 0,
            "trId": safe_int(usage_key),
        }
        fallback_entries[usage_key] = fallback_entry
        index_entries.append(fallback_entry)

    index_entries.sort(key=lambda entry: ((entry.get("leadLevel") if entry.get("leadLevel") is not None else 9999), entry["displayName"]))

    for usage_key, usage_rows in grouped_rows.items():
        full_battles = [
            {
                "eventId": row["eventId"],
                "createdAt": row["createdAt"],
                "party": row["party"],
                "boxPokemon": row["boxPokemon"],
            }
            for row in usage_rows
        ]
        summary = build_summary(full_battles)
        display_battles = full_battles[:history_limit]
        trainer_meta = fallback_entries[usage_key]
        detail_payload = {
            "title": title,
            "generatedAt": generated_at,
            "historyLimit": history_limit,
            "trainer": {
                "displayName": trainer_meta["displayName"],
                "usageKey": trainer_meta["usageKey"],
                "leadLevel": trainer_meta["leadLevel"],
                "maxLevel": trainer_meta["maxLevel"],
                "isBoss": trainer_meta["isBoss"],
                "partySize": trainer_meta["partySize"],
                "trId": trainer_meta["trId"],
            },
            "summary": summary,
            "battles": display_battles,
        }
        write_json(title_dir / detail_file_by_usage_key[usage_key], detail_payload, pretty=False)

    overview = build_overview(title, index_entries, normalized_rows, dashboard_config.get(title, {}), evo_data)
    index_payload = {
        "title": title,
        "slug": slug,
        "generatedAt": generated_at,
        "historyLimit": history_limit,
        "trainerCount": len(index_entries),
        "overview": overview,
        "trainers": index_entries,
    }
    write_json(title_dir / "index.json", index_payload, pretty=True)


def build_manifest(version: str) -> dict[str, Any]:
    return {
        "version": version,
        "titles": TITLE_TO_SLUG,
    }


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    dashboard_config = load_dashboard_config()
    evo_data = load_evo_data()
    if not evo_data and EM_IMP_PRIMARY_MONS_PATH.exists():
        evo_data = load_em_imp_primary_mons()

    with connect_db(args) as connection:
        with dict_cursor(connection) as cur:
            schema_name, relation_name, columns = resolve_source_relation(cur)
            relation_sql = f'"{schema_name}"."{relation_name}"'
            available_titles = fetch_titles(cur, relation_sql)

            if args.titles:
                requested_titles = [title for title in args.titles if title in TITLE_TO_SLUG]
                missing = sorted(set(args.titles) - set(requested_titles))
                if missing:
                    raise SystemExit(f"Unsupported titles requested: {', '.join(missing)}")
                titles = requested_titles
            else:
                titles = available_titles

            generated_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            for title in titles:
                rows = fetch_rows_for_title(cur, relation_sql, columns, title)
                export_title(title, rows, generated_at, args.history_limit, output_dir, dashboard_config, evo_data)

    write_json(output_dir / "manifest.json", build_manifest(generated_at), pretty=True)
    print(f"Exported offline analytics to {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
