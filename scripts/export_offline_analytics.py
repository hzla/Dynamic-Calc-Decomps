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
    "Renegade Platinum": "renegade-platinum",
    "Platinum Kaizo": "platinum-kaizo",
    "Pokemon Null 1.1": "pokemon-null",
    "Pokemon Null 1.2": "pokemon-null-1-2",
    "Cascade White": "cascade-white",
    "Vintage White Plus": "vintage-white-plus",
}

TITLE_TO_BACKUP = {
    "Emerald Imperium 1.3": ROOT / "backups" / "imp_1-3.js",
    "Renegade Platinum": ROOT / "backups" / "rp.js",
    "Platinum Kaizo": ROOT / "backups" / "pk.js",
    "Pokemon Null 1.1": ROOT / "backups" / "null.js",
    "Pokemon Null 1.2": ROOT / "backups" / "null12.js",
    "Cascade White": ROOT / "backups" / "casc.js",
    "Vintage White Plus": ROOT / "backups" / "vwplus.js",
}

TITLE_ALIASES = {
    "Pokemon Null": "Pokemon Null 1.2",
}

TITLE_CONFIG_FALLBACKS = {
    "Pokemon Null": ["Pokemon Null 1.2", "Pokemon Null 1.1"],
    "Pokemon Null 1.2": ["Pokemon Null 1.1"],
}

TITLE_SOURCE_OVERRIDES = {
    "Pokemon Null 1.1": ["Pokemon Null", "Pokemon Null 1.1"],
}

CONFIG_PATH = ROOT / "js" / "analytics" / "dashboard_game_config.js"
EVOS_PATH = ROOT / "calc" / "data" / "evos.js"
EM_IMP_PRIMARY_MONS_PATH = ROOT / "js" / "savereaders" / "save_constants" / "em_imp_primary_mons.js"
TRAINER_ORDERS_DIR = ROOT / "backups" / "trainer_orders"
EM_IMP_ORDERS_PATH = ROOT / "js" / "savereaders" / "save_constants" / "orders.js"

TRAINER_NAME_RE = re.compile(r"Lvl\s+-?\d+\s+(.+?)\s*$")
IMPORTANT_TRAINER_RE = re.compile(r"(Leader|Elite Four|Champion)", re.I)
EM_IMP_ORDER_NAME_RE = re.compile(r"^(.*?) \(Lvl [^ ]+ (.*?) \)$")
EMERALD_GYM_ALIAS_RE = re.compile(r"^(Leader [A-Za-z& ]+?)(\d+)$")
LOCATION_SUFFIX_RE = re.compile(r"\s+\|[^|]+\|$")


def is_pokemon_null_title(title: str) -> bool:
    return str(title or "").startswith("Pokemon Null")


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


def get_title_config(title: str, dashboard_config: dict[str, Any]) -> dict[str, Any]:
    if title in dashboard_config:
        return dashboard_config[title]

    for fallback in TITLE_CONFIG_FALLBACKS.get(title, []):
        if fallback in dashboard_config:
            return dashboard_config[fallback]

    for key in sorted(dashboard_config, key=len, reverse=True):
        if title in key or key in title:
            return dashboard_config[key]

    return {}


def canonical_title(title: str) -> str:
    title_text = str(title or "").strip()
    if not title_text:
        return ""
    if title_text in TITLE_TO_SLUG:
        return title_text
    return TITLE_ALIASES.get(title_text, title_text)


def strip_location_suffix(value: str) -> str:
    return LOCATION_SUFFIX_RE.sub("", str(value or "").strip()).strip()


def extract_location_suffix(value: str) -> str | None:
    match = LOCATION_SUFFIX_RE.search(str(value or "").strip())
    if not match:
        return None
    return match.group(0).strip()


def source_titles_for_title(title: str) -> list[str]:
    requested = str(title or "").strip()
    canonical = canonical_title(requested)
    if not canonical:
        return []

    source_titles = {canonical}
    if requested and requested != canonical:
        source_titles.add(requested)
    for source_title in TITLE_SOURCE_OVERRIDES.get(requested, []):
        if source_title:
            source_titles.add(source_title)
    return sorted(source_titles)


def load_evo_data() -> dict[str, Any]:
    return load_json_literal(EVOS_PATH, "evoData")


def load_species_js_first_type_lookup() -> dict[str, str]:
    command = [
        "node",
        "-e",
        (
            "const speciesMod=require(process.argv[1]);"
            "const gens=speciesMod.SPECIES||[];"
            "const out={};"
            "for (const species of gens) {"
            "  if (!species) continue;"
            "  for (const [name, data] of Object.entries(species)) {"
            "    if (data && Array.isArray(data.types) && data.types.length && !out[name]) out[name]=data.types[0];"
            "  }"
            "}"
            "for (let i=gens.length-1;i>=0;i--) {"
            "  const species=gens[i]||{};"
            "  for (const [name, data] of Object.entries(species)) {"
            "    if (data && Array.isArray(data.types) && data.types.length) out[name]=data.types[0];"
            "  }"
            "}"
            "process.stdout.write(JSON.stringify(out));"
        ),
        str(ROOT / "calc" / "data" / "species.js"),
    ]
    result = subprocess.run(command, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def resolve_species_first_type(species: str, type_lookup: dict[str, str]) -> str | None:
    if not species:
        return None
    if species in type_lookup:
        return type_lookup[species]
    if "-" in species:
        return type_lookup.get(species.split("-")[0])
    return None


def load_title_species_first_type_lookup(title: str) -> dict[str, str]:
    backup_path = TITLE_TO_BACKUP.get(title)
    if backup_path and backup_path.exists():
        backup = load_json_literal(backup_path, "backup_data")
        poks = backup.get("poks") if isinstance(backup, dict) else None
        if isinstance(poks, dict):
            type_lookup = {}
            for species, data in poks.items():
                if not isinstance(data, dict):
                    continue
                types = data.get("types")
                if isinstance(types, list) and types:
                    first_type = str(types[0]).strip()
                    if first_type:
                        type_lookup[str(species)] = first_type
            if type_lookup:
                return type_lookup

    if title == "Emerald Imperium 1.3":
        return load_species_js_first_type_lookup()

    return {}


def load_em_imp_primary_mons() -> dict[str, Any]:
    return load_json_literal(EM_IMP_PRIMARY_MONS_PATH, "em_imp_primary_mons")


def species_name_table(title: str) -> list[str]:
    if "Imperium" in title:
        return load_json_literal(
            ROOT / "js" / "savereaders" / "save_constants" / "em_imp_constants.js",
            "emImpMons",
        )
    if is_pokemon_null_title(title):
        null_mons = load_json_literal(
            ROOT / "js" / "savereaders" / "save_constants" / "null_constants.js",
            "nullMons",
        )
        return ["", *null_mons]
    return load_json_literal(ROOT / "js" / "savereaders" / "enums.js", "sav_pok_names")


def normalize_usage_key(title: str, trainer_name: str, tr_id: Any) -> str:
    if " Null" in title:
        return trainer_name
    if tr_id in (None, ""):
        return trainer_name
    return str(tr_id)


def emerald_gym_leader_alias_map(
    title: str,
    title_config: dict[str, Any],
    backup_entries: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    if title != "Emerald Imperium 1.3":
        return {}

    configured_leaders = {}
    for item in title_config.get("importantTrainers") or []:
        label = str(item.get("label") or "").strip()
        usage_key = str(item.get("usageKey") or "").strip()
        if not label.startswith("Leader ") or not usage_key:
            continue
        configured_leaders[label] = usage_key

    leader_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for entry in backup_entries:
        display_name = str(entry.get("displayName") or "").strip()
        if not display_name.startswith("Leader "):
            continue
        match = EMERALD_GYM_ALIAS_RE.match(display_name)
        canonical_label = match.group(1) if match else display_name
        leader_groups[canonical_label].append(entry)

    if not leader_groups:
        return {}

    alias_map: dict[str, dict[str, Any]] = {}
    for canonical_label, entries in leader_groups.items():
        canonical_usage_key = configured_leaders.get(canonical_label)
        if not canonical_usage_key:
            preferred_entry = min(
                entries,
                key=lambda entry: (
                    0 if str(entry.get("displayName") or "").strip() == canonical_label else 1,
                    0 if safe_int(entry.get("trId")) is not None or safe_int(entry.get("usageKey")) is not None else 1,
                    safe_int(entry.get("trId"))
                    if safe_int(entry.get("trId")) is not None
                    else (
                        safe_int(entry.get("usageKey"))
                        if safe_int(entry.get("usageKey")) is not None
                        else 10**9
                    ),
                    str(entry.get("usageKey") or "").strip() or str(entry.get("displayName") or "").strip(),
                ),
            )
            canonical_usage_key = (
                str(preferred_entry.get("usageKey") or "").strip()
                or str(preferred_entry.get("trId") or "").strip()
                or canonical_label
            )

        for entry in entries:
            display_name = str(entry.get("displayName") or "").strip()
            for alias in {
                display_name,
                str(entry.get("usageKey") or "").strip(),
                str(entry.get("trId") or "").strip(),
            }:
                if alias:
                    alias_map[alias] = {
                        "displayName": canonical_label,
                        "usageKey": canonical_usage_key,
                    }

        for alias in {canonical_label, canonical_usage_key}:
            if alias:
                alias_map[alias] = {
                    "displayName": canonical_label,
                    "usageKey": canonical_usage_key,
                }

    return alias_map


def build_important_trainer_variant_alias_map(
    title: str,
    title_config: dict[str, Any],
    backup_entries: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    def alias_forms(value: str) -> set[str]:
        text = str(value or "").strip()
        if not text:
            return set()
        stripped = LOCATION_SUFFIX_RE.sub("", text).strip()
        return {candidate for candidate in {text, stripped} if candidate}

    backup_entry_by_alias: dict[str, dict[str, Any]] = {}
    for entry in backup_entries:
        display_name = str(entry.get("displayName") or "").strip()
        usage_key = str(entry.get("usageKey") or "").strip()
        for alias in alias_forms(display_name) | alias_forms(usage_key):
            backup_entry_by_alias.setdefault(alias, entry)

    def resolve_backup_entry(display_name: str, usage_key: str) -> dict[str, Any] | None:
        candidates = [
            display_name,
            usage_key,
            LOCATION_SUFFIX_RE.sub("", display_name).strip(),
            LOCATION_SUFFIX_RE.sub("", usage_key).strip(),
        ]
        for candidate in candidates:
            if candidate and candidate in backup_entry_by_alias:
                return backup_entry_by_alias[candidate]
        return None

    alias_map: dict[str, dict[str, Any]] = {}
    for item in title_config.get("importantTrainerVariants") or []:
        canonical_display_name = str(item.get("label") or item.get("displayName") or "").strip()
        canonical_usage_key = str(item.get("usageKey") or canonical_display_name).strip()
        if not canonical_display_name or not canonical_usage_key:
            continue

        variants = item.get("variants") or []
        if not is_pokemon_null_title(title):
            aliases = set()
            aliases.update(alias_forms(canonical_display_name))
            aliases.update(alias_forms(canonical_usage_key))
            for variant in variants:
                variant_display_name = str(variant.get("displayName") or "").strip()
                variant_usage_key = str(variant.get("usageKey") or "").strip()
                aliases.update(alias_forms(variant_display_name))
                aliases.update(alias_forms(variant_usage_key))

            for alias in aliases:
                if alias:
                    alias_map[alias] = {
                        "displayName": canonical_display_name,
                        "usageKey": canonical_usage_key,
                    }
            continue

        variant_groups: dict[int | None, list[dict[str, str]]] = defaultdict(list)
        for variant in variants:
            variant_display_name = str(variant.get("displayName") or "").strip()
            variant_usage_key = str(variant.get("usageKey") or variant_display_name).strip()
            if not variant_display_name and not variant_usage_key:
                continue
            backup_entry = resolve_backup_entry(variant_display_name, variant_usage_key)
            lead_level = backup_entry.get("leadLevel") if backup_entry else None
            variant_groups[lead_level].append(
                {
                    "displayName": variant_display_name,
                    "usageKey": variant_usage_key,
                }
            )

        if not variant_groups:
            continue

        numeric_levels = sorted(level for level in variant_groups if level is not None)
        primary_level = numeric_levels[0] if numeric_levels else next(iter(variant_groups))

        for lead_level, grouped_variants in variant_groups.items():
            if lead_level == primary_level:
                target_display_name = canonical_display_name
                target_usage_key = canonical_usage_key
                aliases = alias_forms(canonical_display_name) | alias_forms(canonical_usage_key)
            else:
                primary_variant = grouped_variants[0]
                target_display_name = primary_variant["displayName"] or primary_variant["usageKey"]
                target_usage_key = primary_variant["usageKey"] or target_display_name
                aliases = set()

            for grouped_variant in grouped_variants:
                aliases.update(alias_forms(grouped_variant["displayName"]))
                aliases.update(alias_forms(grouped_variant["usageKey"]))

            for alias in aliases:
                if alias:
                    alias_map[alias] = {
                        "displayName": target_display_name,
                        "usageKey": target_usage_key,
                    }
    return alias_map


def explicit_multi_team_usage_keys(title_config: dict[str, Any]) -> set[str]:
    usage_keys = set()
    for item in title_config.get("importantTrainerVariants") or []:
        canonical_display_name = str(item.get("label") or item.get("displayName") or "").strip()
        canonical_usage_key = str(item.get("usageKey") or canonical_display_name).strip()
        variants = item.get("variants") or []
        if canonical_usage_key and len(variants) > 1:
            usage_keys.add(canonical_usage_key)
    return usage_keys


def configured_important_trainer_usage_keys(title_config: dict[str, Any]) -> list[str]:
    usage_keys: list[str] = []
    seen: set[str] = set()
    for item in title_config.get("importantTrainers") or []:
        usage_key = str(item.get("usageKey") or item.get("displayName") or item.get("label") or "").strip()
        if not usage_key or usage_key in seen:
            continue
        seen.add(usage_key)
        usage_keys.append(usage_key)
    return usage_keys


def build_null_location_alias_map(
    rows: list[dict[str, Any]],
    backup_entries: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    groups: dict[str, list[str]] = defaultdict(list)

    def push_name(name: str) -> None:
        text = str(name or "").strip()
        if not text:
            return
        base_name = strip_location_suffix(text)
        if not base_name:
            return
        if text not in groups[base_name]:
            groups[base_name].append(text)

    for entry in backup_entries:
        push_name(str(entry.get("displayName") or "").strip())
    for row in rows:
        push_name(str(row.get("tr") or "").strip())

    alias_map: dict[str, dict[str, Any]] = {}
    for base_name, names in groups.items():
        preferred_name = next((name for name in names if extract_location_suffix(name)), base_name)
        for alias in {base_name, *names}:
            if not alias:
                continue
            alias_map[alias] = {
                "displayName": preferred_name,
                "usageKey": base_name,
            }
    return alias_map


def canonicalize_trainer_identity(
    display_name: str,
    usage_key: str,
    alias_stages: list[dict[str, dict[str, Any]]],
) -> tuple[str, str]:
    current_display = str(display_name or "").strip()
    current_usage_key = str(usage_key or current_display).strip()

    for alias_map in alias_stages:
        if not alias_map:
            continue
        alias = (
            alias_map.get(current_usage_key)
            or alias_map.get(current_display)
            or alias_map.get(strip_location_suffix(current_display))
        )
        if not alias:
            continue
        current_display = str(alias.get("displayName") or current_display).strip()
        current_usage_key = str(alias.get("usageKey") or current_usage_key).strip()

    return current_display, current_usage_key


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
    titles = {
        canonical_title(row["title"])
        for row in cur.fetchall()
        if canonical_title(row["title"]) in TITLE_TO_SLUG
    }
    return sorted(titles)


def fetch_rows_for_title(cur, relation_sql: str, columns: set[str], title: str) -> list[dict[str, Any]]:
    tid_sql = "tid" if "tid" in columns else "NULL::text AS tid"
    source_titles = source_titles_for_title(title)
    cur.execute(
        f"""
        SELECT title, tr, {tid_sql}, event_id, created_at, party, box_data, box_count
        FROM {relation_sql}
        WHERE title = ANY(%s)
        ORDER BY created_at DESC NULLS LAST, event_id DESC NULLS LAST
        """,
        (source_titles,),
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
            species_name = str(species_table[value]).strip()
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
    for index, row in enumerate(rows):
        trainer_name = str(row.get("tr") or "").strip()
        usage_key = trainer_name
        event_id = normalize_event_id(row.get("event_id"))
        created_at = normalize_created_at(row.get("created_at"))
        party = normalize_party(row.get("party"))
        party_species = {mon["species"] for mon in party if mon["species"]}
        box_pokemon = decode_box_species(title, row.get("box_data"), row.get("box_count"), species_table)
        owned_species = sorted({species for species in box_pokemon if species} | party_species)
        normalized_rows.append(
            {
                "displayName": trainer_name,
                "usageKey": usage_key,
                "tid": normalize_tid(row.get("tid")),
                "eventId": event_id,
                "createdAt": created_at,
                "battleKey": event_id or f"{created_at or 'unknown'}#{index}",
                "party": party,
                "boxPokemon": box_pokemon,
                "ownedSpecies": owned_species,
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


def build_trainer_depth_map_with_anchor(
    trainer_orders: dict[str, Any] | None,
    anchor_id: int | None,
) -> tuple[dict[int, int], int]:
    if not trainer_orders or anchor_id is None:
        return build_trainer_depth_map(trainer_orders)

    nodes: dict[int, dict[str, int | None]] = {}
    for raw_value in trainer_orders.values():
        trainer_id = safe_int(raw_value.get("id"))
        if trainer_id is None:
            continue
        nodes[trainer_id] = {
            "next": safe_int(raw_value.get("next")),
            "prev": safe_int(raw_value.get("prev")),
        }

    if anchor_id not in nodes:
        return build_trainer_depth_map(trainer_orders)

    depth_map: dict[int, int] = {}
    next_depth = 1
    current = anchor_id
    while current in nodes and current not in depth_map:
        depth_map[current] = next_depth
        next_depth += 1
        next_node = nodes[current]["next"]
        if next_node is None or next_node == current:
            break
        current = next_node

    for trainer_id in sorted(nodes):
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


def slugify_name(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", str(value or "").lower())).strip("-") or "unknown"


def resolve_family_key_and_members(species: str, evo_data: dict[str, Any]) -> tuple[str, list[str]]:
    if not species:
        return "unknown", []

    members = sorted(family_members(species, evo_data, False))
    entry = evo_data.get(species)
    resolved_species = species
    if entry is None and "-" in species:
        resolved_species = species.split("-")[0]
        entry = evo_data.get(resolved_species)

    ancestor = None
    if entry is not None:
        ancestor = entry.get("anc") or resolved_species
    if ancestor is None:
        ancestor = members[0] if members else species
    if ancestor not in members:
        members = sorted(set(members + [ancestor]))
    return slugify_name(str(ancestor)), members


def resolve_important_trainers(
    title: str,
    index_entries: list[dict[str, Any]],
    title_config: dict[str, Any],
) -> list[dict[str, Any]]:
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
                    "sourceDisplayName": entry.get("sourceDisplayName") or entry["displayName"],
                    "displayName": (
                        entry["displayName"]
                        if is_pokemon_null_title(title)
                        else (item.get("label") or entry["displayName"])
                    ),
                }
            )
        return resolved

    derived = [entry for entry in index_entries if IMPORTANT_TRAINER_RE.search(entry["displayName"] or "")]
    for entry in derived:
        entry["sourceDisplayName"] = entry["displayName"]
    derived.sort(key=lambda entry: ((entry.get("maxLevel") or entry.get("leadLevel") or 9999), entry["displayName"]))
    return derived


def build_null_trainer_id_to_name_map(
    title: str,
    alias_stages: list[dict[str, dict[str, Any]]],
) -> dict[int, str]:
    backup = load_json_literal(TITLE_TO_BACKUP[title], "backup_data")
    formatted_sets = backup.get("formatted_sets") or {}

    tr_id_to_name: dict[int, str] = {}
    conflicts: dict[int, set[str]] = defaultdict(set)

    for _, sets in formatted_sets.items():
        for set_name, raw_data in (sets or {}).items():
            match = TRAINER_NAME_RE.search(str(set_name))
            if not match:
                continue

            trainer_name = match.group(1).strip()
            if "Slot2" in trainer_name or "Slot3" in trainer_name:
                continue

            sub_index = safe_int((raw_data or {}).get("sub_index"))
            tr_id = safe_int((raw_data or {}).get("tr_id"))
            if sub_index != 0 or tr_id is None:
                continue

            canonical_display_name, _ = canonicalize_trainer_identity(
                trainer_name,
                normalize_usage_key(title, trainer_name, tr_id),
                alias_stages,
            )
            if not canonical_display_name:
                continue

            existing = tr_id_to_name.get(tr_id)
            if existing is None:
                tr_id_to_name[tr_id] = canonical_display_name
                continue
            if existing != canonical_display_name:
                conflicts[tr_id].update({existing, canonical_display_name})

    for tr_id, names in sorted(conflicts.items()):
        print(f"Pokemon Null: conflicting trainer-id mapping for tr_id={tr_id} -> {sorted(names)}")
        tr_id_to_name.pop(tr_id, None)

    return tr_id_to_name


def resolve_null_anchor_trainer_id(title: str) -> int | None:
    backup = load_json_literal(TITLE_TO_BACKUP[title], "backup_data")
    formatted_sets = backup.get("formatted_sets") or {}

    for species_name, sets in formatted_sets.items():
        if str(species_name).strip() != "Oshawott":
            continue
        for set_name, raw_data in (sets or {}).items():
            match = TRAINER_NAME_RE.search(str(set_name))
            if not match:
                continue
            trainer_name = match.group(1).strip()
            if trainer_name != "Route 103 Rival |Route 103|":
                continue
            if safe_int((raw_data or {}).get("sub_index")) != 0:
                continue
            trainer_id = safe_int((raw_data or {}).get("tr_id"))
            if trainer_id is not None:
                return trainer_id
    return None


def build_starter_group_matchers(title_config: dict[str, Any], evo_data: dict[str, Any]) -> dict[str, dict[str, set[str]]]:
    groups = title_config.get("starterGiftGroups") or {}
    exact_match_groups = set(title_config.get("exactMatchGroups") or [])
    matchers: dict[str, dict[str, set[str]]] = {}
    for label, configured_species in groups.items():
        species_matchers: dict[str, set[str]] = {}
        for species in configured_species or []:
            species_matchers[species] = family_members(species, evo_data, label in exact_match_groups)
        matchers[label] = species_matchers
    return matchers


def build_run_buckets(
    normalized_rows: list[dict[str, Any]],
    starter_group_matchers: dict[str, dict[str, set[str]]],
) -> dict[str, dict[str, Any]]:
    runs: dict[str, dict[str, Any]] = {}
    for row in normalized_rows:
        tid = row.get("tid")
        if not tid:
            continue
        bucket = runs.setdefault(
            tid,
            {
                "tid": tid,
                "usageKeys": set(),
                "boxSpecies": set(),
                "trainerIds": set(),
                "trainerNames": set(),
                "starterMatches": {},
                "maxDepth": None,
                "battleCount": 0,
                "speciesOwnedBattleKeys": defaultdict(set),
                "speciesPartyBattleKeys": defaultdict(set),
                "rows": [],
            },
        )
        bucket["usageKeys"].add(row["usageKey"])
        bucket["battleCount"] += 1
        box_species = {species for species in row["boxPokemon"] if species}
        party_species = {mon["species"] for mon in row["party"] if mon["species"]}
        owned_species = set(row.get("ownedSpecies") or box_species | party_species)
        battle_key = row.get("battleKey")

        bucket["boxSpecies"].update(owned_species)
        if row["trainerId"] is not None:
            bucket["trainerIds"].add(row["trainerId"])
        for species in owned_species:
            bucket["speciesOwnedBattleKeys"][species].add(battle_key)
        for species in party_species:
            bucket["speciesPartyBattleKeys"][species].add(battle_key)
        bucket["rows"].append(
            {
                "usageKey": row["usageKey"],
                "ownedSpecies": owned_species,
                "boxSpecies": box_species,
                "partySpecies": party_species,
            }
        )

    if starter_group_matchers:
        for run in runs.values():
            starter_matches: dict[str, set[str]] = {}
            for label, species_matchers in starter_group_matchers.items():
                starter_matches[label] = {
                    species
                    for species, match_set in species_matchers.items()
                    if run["boxSpecies"] & match_set
                }
            run["starterMatches"] = starter_matches

    return runs


def build_important_trainer_overview(
    important_trainers: list[dict[str, Any]],
    runs: list[dict[str, Any]],
    progression_by_usage_key: dict[str, dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    output = []
    for trainer in important_trainers:
        usage_key = str(trainer["usageKey"])
        progression_entry = (progression_by_usage_key or {}).get(usage_key)
        run_count = sum(1 for run in runs if usage_key in run["usageKeys"])
        reached_count = progression_entry.get("reachedCount") if progression_entry else run_count
        ended_count = progression_entry.get("endedCount") if progression_entry else None
        output.append(
            {
                "displayName": trainer["displayName"],
                "sourceDisplayName": trainer.get("sourceDisplayName") or trainer["displayName"],
                "usageKey": usage_key,
                "trId": trainer.get("trId"),
                "leadLevel": trainer.get("leadLevel"),
                "maxLevel": trainer.get("maxLevel"),
                "runCount": reached_count,
                "reachedCount": reached_count,
                "endedCount": ended_count,
            }
        )
    return output


def build_trainer_progression_overview(
    filtered_runs: list[dict[str, Any]],
    depth_context: dict[str, Any],
) -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    if not depth_context.get("available"):
        return {}, []

    max_step = int(depth_context.get("maxStep") or 0)
    if max_step <= 0:
        return {}, []

    exact_histogram = [0] * (max_step + 2)
    for run in filtered_runs:
        step = run.get("maxDepth")
        if isinstance(step, int) and 1 <= step <= max_step:
            exact_histogram[step] += 1

    reached_by_step = [0] * (max_step + 3)
    running_total = 0
    for step in range(max_step, 0, -1):
        running_total += exact_histogram[step]
        reached_by_step[step] = running_total

    progression_by_usage_key: dict[str, dict[str, Any]] = {}
    progression_entries: list[dict[str, Any]] = []
    for trainer in depth_context.get("trainerSteps") or []:
        step = int(trainer.get("step") or 0)
        if step <= 0 or step > max_step:
            continue

        reached_count = reached_by_step[step]
        next_reached = reached_by_step[step + 1] if step < max_step else reached_count
        ended_count = max(reached_count - next_reached, 0)
        entry = {
            **trainer,
            "runCount": reached_count,
            "reachedCount": reached_count,
            "endedCount": ended_count,
        }
        usage_key = str(trainer.get("usageKey") or "")
        if usage_key:
            progression_by_usage_key[usage_key] = entry
        progression_entries.append(entry)

    top_run_enders = sorted(
        [entry for entry in progression_entries if entry.get("endedCount", 0) > 0],
        key=lambda entry: (
            -int(entry.get("endedCount") or 0),
            -int(entry.get("reachedCount") or 0),
            int(entry.get("step") or 10**9),
            str(entry.get("displayName") or ""),
        ),
    )[:10]

    return progression_by_usage_key, top_run_enders


def resolve_run_depth_context(
    title: str,
    runs_by_tid: dict[str, dict[str, Any]],
    important_trainers: list[dict[str, Any]],
    index_entries: list[dict[str, Any]],
    trainer_order_key: str | None,
    null_tr_id_to_name: dict[int, str] | None = None,
) -> dict[str, Any]:
    usage_key_to_name = {}
    for entry in index_entries:
        if not entry.get("displayName") or entry.get("usageKey") is None:
            continue
        usage_key_to_name[str(entry["usageKey"])] = (
            entry["displayName"]
            if is_pokemon_null_title(title)
            else (entry.get("sourceDisplayName") or entry["displayName"])
        )
    for run in runs_by_tid.values():
        run["trainerNames"] = {
            usage_key_to_name[usage_key]
            for usage_key in run["usageKeys"]
            if usage_key in usage_key_to_name
        }

    def unavailable(reason: str) -> dict[str, Any]:
        for run in runs_by_tid.values():
            run["maxDepth"] = None
        return {
            "available": False,
            "reason": reason,
            "maxStep": 0,
            "markers": [],
            "trainerSteps": [],
        }

    if title == "Emerald Imperium 1.3":
        trainer_orders = load_em_imp_orders()
        depth_map, max_step = build_name_depth_map(trainer_orders)
        if not depth_map or not max_step:
            return unavailable("invalid_trainer_order")

        for run in runs_by_tid.values():
            depths = [depth_map[name] for name in run["trainerNames"] if name in depth_map]
            run["maxDepth"] = max(depths) if depths else None

        if not any(run["maxDepth"] is not None for run in runs_by_tid.values()):
            return unavailable("missing_trainer_name_matches")

        markers = []
        for trainer in important_trainers:
            source_name = trainer.get("sourceDisplayName") or trainer["displayName"]
            step = depth_map.get(str(source_name))
            if step is None:
                continue
            markers.append(
                {
                    "label": trainer["displayName"],
                    "step": step,
                    "usageKey": str(trainer["usageKey"]),
                }
            )

        return {
            "available": True,
            "reason": None,
            "maxStep": max_step,
            "markers": sorted(markers, key=lambda item: (item["step"], item["label"])),
            "trainerSteps": sorted(
                [
                    {
                        "displayName": entry["displayName"],
                        "sourceDisplayName": entry.get("sourceDisplayName") or entry["displayName"],
                        "usageKey": str(entry["usageKey"]),
                        "trId": entry.get("trId"),
                        "leadLevel": entry.get("leadLevel"),
                        "maxLevel": entry.get("maxLevel"),
                        "step": depth_map.get(str(entry.get("sourceDisplayName") or entry["displayName"])),
                    }
                    for entry in index_entries
                    if depth_map.get(str(entry.get("sourceDisplayName") or entry["displayName"])) is not None
                ],
                key=lambda item: (item["step"], item["displayName"]),
            ),
        }

    if is_pokemon_null_title(title):
        trainer_orders = load_trainer_orders(trainer_order_key)
        if not trainer_orders:
            return unavailable("no_trainer_order")

        anchor_id = resolve_null_anchor_trainer_id(title)
        if anchor_id is None:
            anchor_id = next(
                (
                    trainer.get("trId")
                    for trainer in important_trainers
                    if trainer.get("trId") is not None
                ),
                None,
            )
        numeric_depth_map, max_step = build_trainer_depth_map_with_anchor(trainer_orders, anchor_id)
        if not numeric_depth_map or not max_step:
            return unavailable("invalid_trainer_order")

        if not null_tr_id_to_name:
            return unavailable("missing_trainer_name_matches")

        name_depth_map: dict[str, int] = {}
        for trainer_id, trainer_name in null_tr_id_to_name.items():
            step = numeric_depth_map.get(trainer_id)
            if step is None or not trainer_name:
                continue
            existing_step = name_depth_map.get(trainer_name)
            name_depth_map[trainer_name] = step if existing_step is None else max(existing_step, step)

        if not name_depth_map:
            return unavailable("missing_trainer_name_matches")

        for run in runs_by_tid.values():
            depths = [name_depth_map[name] for name in run["trainerNames"] if name in name_depth_map]
            run["maxDepth"] = max(depths) if depths else None

        if not any(run["maxDepth"] is not None for run in runs_by_tid.values()):
            return unavailable("missing_trainer_name_matches")

        markers = []
        for trainer in important_trainers:
            step = name_depth_map.get(str(trainer["displayName"]))
            if step is None:
                continue
            markers.append(
                {
                    "label": trainer["displayName"],
                    "step": step,
                    "usageKey": str(trainer["usageKey"]),
                }
            )

        return {
            "available": True,
            "reason": None,
            "maxStep": max_step,
            "markers": sorted(markers, key=lambda item: (item["step"], item["label"])),
            "trainerSteps": sorted(
                [
                    {
                        "displayName": entry["displayName"],
                        "sourceDisplayName": entry.get("sourceDisplayName") or entry["displayName"],
                        "usageKey": str(entry["usageKey"]),
                        "trId": entry.get("trId"),
                        "leadLevel": entry.get("leadLevel"),
                        "maxLevel": entry.get("maxLevel"),
                        "step": name_depth_map.get(str(entry["displayName"])),
                    }
                    for entry in index_entries
                    if name_depth_map.get(str(entry["displayName"])) is not None
                ],
                key=lambda item: (item["step"], item["displayName"]),
            ),
        }

    if not trainer_order_key:
        return unavailable("no_trainer_order")

    trainer_orders = load_trainer_orders(trainer_order_key)
    if not trainer_orders:
        return unavailable("no_trainer_order")

    depth_map, max_step = build_trainer_depth_map(trainer_orders)
    if not depth_map or not max_step:
        return unavailable("invalid_trainer_order")

    for run in runs_by_tid.values():
        depths = [depth_map[trainer_id] for trainer_id in run["trainerIds"] if trainer_id in depth_map]
        run["maxDepth"] = max(depths) if depths else None

    if not any(run["maxDepth"] is not None for run in runs_by_tid.values()):
        return unavailable("missing_numeric_trainer_ids")

    markers = []
    for trainer in important_trainers:
        trainer_id = trainer.get("trId")
        if trainer_id is None or trainer_id not in depth_map:
            continue
        markers.append(
            {
                "label": trainer["displayName"],
                "step": depth_map[trainer_id],
                "usageKey": str(trainer["usageKey"]),
            }
        )

    return {
        "available": True,
        "reason": None,
        "maxStep": max_step,
        "markers": sorted(markers, key=lambda item: (item["step"], item["label"])),
        "trainerSteps": sorted(
            [
                {
                    "displayName": entry["displayName"],
                    "sourceDisplayName": entry.get("sourceDisplayName") or entry["displayName"],
                    "usageKey": str(entry["usageKey"]),
                    "trId": entry.get("trId"),
                    "leadLevel": entry.get("leadLevel"),
                    "maxLevel": entry.get("maxLevel"),
                    "step": depth_map.get(entry["trId"]),
                }
                for entry in index_entries
                if entry.get("trId") is not None and depth_map.get(entry["trId"]) is not None
            ],
            key=lambda item: (item["step"], item["displayName"]),
        ),
    }


def filter_runs_by_min_depth(
    runs_by_tid: dict[str, dict[str, Any]],
    depth_context: dict[str, Any],
    min_depth: int,
) -> list[dict[str, Any]]:
    runs = list(runs_by_tid.values())
    if not depth_context["available"]:
        return runs
    return [
        run for run in runs
        if run.get("maxDepth") is not None and run["maxDepth"] >= min_depth
    ]


def build_starter_gift_groups(
    filtered_runs: list[dict[str, Any]],
    title_config: dict[str, Any],
    depth_context: dict[str, Any],
    species_first_type_lookup: dict[str, str],
) -> list[dict[str, Any]]:
    groups = title_config.get("starterGiftGroups") or {}
    if not groups:
        return []

    results = []
    for label, configured_species in groups.items():
        if not configured_species:
            continue

        slices = []
        total_runs_matched = 0
        for run in filtered_runs:
            if run["starterMatches"].get(label):
                total_runs_matched += 1

        for species in configured_species:
            matching_runs = [
                run for run in filtered_runs
                if species in run["starterMatches"].get(label, set())
            ]
            count = len(matching_runs)
            slice_payload = {
                "species": species,
                "count": count,
            }
            first_type = resolve_species_first_type(species, species_first_type_lookup)
            if first_type:
                slice_payload["firstType"] = first_type
            if depth_context["available"] and count:
                average_step = sum(run["maxDepth"] for run in matching_runs if run["maxDepth"] is not None) / count
                slice_payload["averageRunDepthStep"] = round(average_step, 1)
                slice_payload["averageRunDepthPct"] = round((average_step / depth_context["maxStep"]) * 100, 1)
            slices.append(slice_payload)

        total_detections = sum(slice_item["count"] for slice_item in slices)
        for slice_item in slices:
            slice_item["pct"] = round((slice_item["count"] / total_detections) * 100) if total_detections else 0
            slice_item["runPct"] = round((slice_item["count"] / total_runs_matched) * 100) if total_runs_matched else 0

        slices.sort(key=lambda slice_item: (-slice_item["count"], slice_item["species"]))
        results.append(
            {
                "label": label,
                "totalRunsMatched": total_runs_matched,
                "slices": slices,
            }
        )

    return results


def build_top_pokemon_by_average_depth(
    filtered_runs: list[dict[str, Any]],
    depth_context: dict[str, Any],
) -> list[dict[str, Any]]:
    if not depth_context["available"]:
        return []

    by_species: dict[str, dict[str, float | int]] = {}
    for run in filtered_runs:
        max_depth = run.get("maxDepth")
        if max_depth is None:
            continue
        for species in run["boxSpecies"]:
            if not species:
                continue
            bucket = by_species.setdefault(
                species,
                {
                    "runCount": 0,
                    "depthSum": 0.0,
                },
            )
            bucket["runCount"] += 1
            bucket["depthSum"] += max_depth

    rows = []
    for species, bucket in by_species.items():
        run_count = int(bucket["runCount"])
        if run_count < 5:
            continue
        average_step = float(bucket["depthSum"]) / run_count
        rows.append(
            {
                "species": species,
                "runCount": run_count,
                "averageRunDepthStep": round(average_step, 1),
                "averageRunDepthPct": round((average_step / depth_context["maxStep"]) * 100, 1),
            }
        )

    rows.sort(
        key=lambda item: (
            -item["averageRunDepthStep"],
            -item["runCount"],
            item["species"],
        )
    )
    return rows[:20]


def build_run_depth_snapshot(
    filtered_runs: list[dict[str, Any]],
    depth_context: dict[str, Any],
) -> dict[str, Any]:
    if not depth_context["available"]:
        return {
            "available": False,
            "reason": depth_context["reason"],
        }

    max_step = depth_context["maxStep"]
    exact_histogram = [0] * max(max_step, 0)
    run_max_steps = [run["maxDepth"] for run in filtered_runs if run.get("maxDepth") is not None]
    for step in run_max_steps:
        if 1 <= step <= max_step:
            exact_histogram[step - 1] += 1

    cumulative_histogram = [0] * max(max_step, 0)
    running_total = 0
    for index in range(max_step - 1, -1, -1):
        running_total += exact_histogram[index]
        cumulative_histogram[index] = running_total

    average_step = (sum(run_max_steps) / len(run_max_steps)) if run_max_steps else 0
    return {
        "available": True,
        "averageStep": round(average_step, 1) if run_max_steps else 0,
        "averagePct": round((average_step / max_step) * 100, 1) if run_max_steps and max_step else 0,
        "maxStep": max_step,
        "runsCounted": len(run_max_steps),
        "histogram": [
            {"step": step, "count": cumulative_histogram[step - 1]}
            for step in range(1, max_step + 1)
        ],
        "importantTrainerMarkers": depth_context["markers"],
    }


def build_snapshot(
    filtered_runs: list[dict[str, Any]],
    important_trainers: list[dict[str, Any]],
    title_config: dict[str, Any],
    depth_context: dict[str, Any],
    species_first_type_lookup: dict[str, str],
) -> dict[str, Any]:
    progression_by_usage_key, top_run_enders = build_trainer_progression_overview(filtered_runs, depth_context)
    return {
        "runCount": len(filtered_runs),
        "importantTrainerBattles": build_important_trainer_overview(
            important_trainers,
            filtered_runs,
            progression_by_usage_key,
        ),
        "topRunEnders": top_run_enders,
        "starterGiftGroups": build_starter_gift_groups(
            filtered_runs,
            title_config,
            depth_context,
            species_first_type_lookup,
        ),
        "topPokemonByAverageDepth": build_top_pokemon_by_average_depth(filtered_runs, depth_context),
        "runDepth": build_run_depth_snapshot(filtered_runs, depth_context),
    }


def prepare_title_export_context(
    title: str,
    index_entries: list[dict[str, Any]],
    normalized_rows: list[dict[str, Any]],
    title_config: dict[str, Any],
    evo_data: dict[str, Any],
    null_tr_id_to_name: dict[int, str] | None = None,
) -> dict[str, Any]:
    starter_group_matchers = build_starter_group_matchers(title_config, evo_data)
    runs_by_tid = build_run_buckets(normalized_rows, starter_group_matchers)
    important_trainers = resolve_important_trainers(title, index_entries, title_config)
    depth_context = resolve_run_depth_context(
        title,
        runs_by_tid,
        important_trainers,
        index_entries,
        title_config.get("trainerOrderKey"),
        null_tr_id_to_name,
    )
    min_depth_values = range(1, depth_context["maxStep"] + 1) if depth_context["available"] else [1]
    return {
        "runsByTid": runs_by_tid,
        "importantTrainers": important_trainers,
        "depthContext": depth_context,
        "minDepthValues": list(min_depth_values),
        "titleConfig": title_config,
        "evoData": evo_data,
        "trainerLookup": {str(entry["usageKey"]): entry for entry in index_entries},
        "speciesFirstTypeLookup": load_title_species_first_type_lookup(title),
    }


def build_overview_payload(
    title: str,
    export_context: dict[str, Any],
    generated_at: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
    runs_by_tid = export_context["runsByTid"]
    important_trainers = export_context["importantTrainers"]
    depth_context = export_context["depthContext"]
    min_depth_values = export_context["minDepthValues"]
    title_config = export_context["titleConfig"]
    species_first_type_lookup = export_context["speciesFirstTypeLookup"]

    by_min_depth = {}
    for min_depth in min_depth_values:
        filtered_runs = filter_runs_by_min_depth(runs_by_tid, depth_context, min_depth)
        by_min_depth[str(min_depth)] = build_snapshot(
            filtered_runs,
            important_trainers,
            title_config,
            depth_context,
            species_first_type_lookup,
        )

    overview_payload = {
        "title": title,
        "generatedAt": generated_at,
        "maxStep": depth_context["maxStep"],
        "defaultMinDepth": 1,
        "milestones": depth_context["markers"],
        "byMinDepth": by_min_depth,
    }
    overview_meta = {
        "runDepthAvailable": depth_context["available"],
        "maxStep": depth_context["maxStep"],
        "defaultMinDepth": 1,
    }
    return overview_payload, overview_meta


def pokemon_metric_snapshot(
    qualifying_runs: list[tuple[dict[str, Any], int, int]],
    depth_context: dict[str, Any],
) -> dict[str, Any]:
    if not qualifying_runs:
        return {
            "runCount": 0,
            "averageParticipationPct": None,
            "averageRunDepthStep": None,
            "averageRunDepthPct": None,
            "averageBattlesUsed": None,
        }

    participation_values = [(party_count / owned_count) * 100 for _, owned_count, party_count in qualifying_runs if owned_count]
    average_participation = sum(participation_values) / len(participation_values) if participation_values else None
    average_battles_used = sum(party_count for _, _, party_count in qualifying_runs) / len(qualifying_runs)

    snapshot = {
        "runCount": len(qualifying_runs),
        "averageParticipationPct": round(average_participation, 1) if average_participation is not None else None,
        "averageRunDepthStep": None,
        "averageRunDepthPct": None,
        "averageBattlesUsed": round(average_battles_used, 1),
    }

    if depth_context["available"]:
        run_depths = [run["maxDepth"] for run, _, _ in qualifying_runs if run.get("maxDepth") is not None]
        if run_depths:
            average_depth = sum(run_depths) / len(run_depths)
            snapshot["averageRunDepthStep"] = round(average_depth, 1)
            snapshot["averageRunDepthPct"] = round((average_depth / depth_context["maxStep"]) * 100, 1)

    return snapshot


def finalize_top_battles(
    aggregated: dict[str, dict[str, int]],
    trainer_lookup: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    rows = []
    for usage_key, bucket in aggregated.items():
        trainer = trainer_lookup.get(usage_key, {})
        owned_count = int(bucket["ownedCount"])
        party_count = int(bucket["partyCount"])
        rows.append(
            {
                "usageKey": usage_key,
                "displayName": trainer.get("displayName") or usage_key,
                "leadLevel": trainer.get("leadLevel"),
                "partyCount": party_count,
                "ownedCount": owned_count,
                "participationPct": round((party_count / owned_count) * 100) if owned_count else 0,
            }
        )

    rows.sort(
        key=lambda item: (
            -item["partyCount"],
            -item["participationPct"],
            item["displayName"],
        )
    )
    return rows[:10]


def build_pokemon_run_records(
    runs_by_tid: dict[str, dict[str, Any]],
    match_species: set[str],
) -> list[dict[str, Any]]:
    records = []
    for run in runs_by_tid.values():
        usage_aggregate: dict[str, dict[str, int]] = {}
        for row in run.get("rows", []):
            usage_key = str(row.get("usageKey") or "")
            if not usage_key:
                continue
            owned_matched = bool(set(row.get("ownedSpecies") or row.get("boxSpecies") or set()) & match_species)
            party_matched = bool(set(row.get("partySpecies") or set()) & match_species)
            if not (owned_matched or party_matched):
                continue
            bucket = usage_aggregate.setdefault(usage_key, {"ownedCount": 0, "partyCount": 0})
            if owned_matched:
                bucket["ownedCount"] += 1
            if party_matched:
                bucket["partyCount"] += 1

        owned_count = sum(bucket["ownedCount"] for bucket in usage_aggregate.values())
        if not owned_count:
            continue
        party_count = sum(bucket["partyCount"] for bucket in usage_aggregate.values())
        records.append(
            {
                "maxDepth": run.get("maxDepth"),
                "ownedCount": owned_count,
                "partyCount": party_count,
                "usageAggregate": usage_aggregate,
            }
        )
    return records


def build_pokemon_snapshots_for_records(
    records: list[dict[str, Any]],
    depth_context: dict[str, Any],
    min_depth_values: list[int],
    trainer_lookup: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    if not depth_context["available"]:
        snapshot = pokemon_metric_snapshot(
            [
                (
                    {"maxDepth": record.get("maxDepth")},
                    record["ownedCount"],
                    record["partyCount"],
                )
                for record in records
            ],
            depth_context,
        )
        aggregated: dict[str, dict[str, int]] = {}
        for record in records:
            for usage_key, bucket in record["usageAggregate"].items():
                battle_bucket = aggregated.setdefault(usage_key, {"ownedCount": 0, "partyCount": 0})
                battle_bucket["ownedCount"] += bucket["ownedCount"]
                battle_bucket["partyCount"] += bucket["partyCount"]
        snapshot["topBattles"] = finalize_top_battles(aggregated, trainer_lookup)
        return {"1": snapshot}

    eligible_records = [
        record for record in records
        if record.get("maxDepth") is not None and isinstance(record.get("maxDepth"), int | float)
    ]
    eligible_records.sort(key=lambda item: item["maxDepth"], reverse=True)

    snapshots: dict[str, Any] = {}
    index = 0
    run_count = 0
    participation_sum = 0.0
    party_count_sum = 0.0
    depth_sum = 0.0
    aggregated_battles: dict[str, dict[str, int]] = {}

    for min_depth in sorted(min_depth_values, reverse=True):
        while index < len(eligible_records) and eligible_records[index]["maxDepth"] >= min_depth:
            record = eligible_records[index]
            run_count += 1
            participation_sum += (record["partyCount"] / record["ownedCount"]) * 100 if record["ownedCount"] else 0
            party_count_sum += record["partyCount"]
            depth_sum += record["maxDepth"]
            for usage_key, bucket in record["usageAggregate"].items():
                battle_bucket = aggregated_battles.setdefault(usage_key, {"ownedCount": 0, "partyCount": 0})
                battle_bucket["ownedCount"] += bucket["ownedCount"]
                battle_bucket["partyCount"] += bucket["partyCount"]
            index += 1

        if not run_count:
            snapshots[str(min_depth)] = {
                "runCount": 0,
                "averageParticipationPct": None,
                "averageRunDepthStep": None,
                "averageRunDepthPct": None,
                "averageBattlesUsed": None,
                "topBattles": [],
            }
            continue

        snapshots[str(min_depth)] = {
            "runCount": run_count,
            "averageParticipationPct": round(participation_sum / run_count, 1),
            "averageRunDepthStep": round(depth_sum / run_count, 1),
            "averageRunDepthPct": round(((depth_sum / run_count) / depth_context["maxStep"]) * 100, 1),
            "averageBattlesUsed": round(party_count_sum / run_count, 1),
            "topBattles": finalize_top_battles(aggregated_battles, trainer_lookup),
        }

    return snapshots


def build_pokemon_exports(
    title: str,
    export_context: dict[str, Any],
    generated_at: str,
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    runs_by_tid = export_context["runsByTid"]
    depth_context = export_context["depthContext"]
    min_depth_values = export_context["minDepthValues"]
    evo_data = export_context["evoData"]
    trainer_lookup = export_context["trainerLookup"]

    observed_species = sorted({species for run in runs_by_tid.values() for species in run["boxSpecies"] if species})
    families: dict[str, dict[str, Any]] = {}
    pokemon_index_entries = []

    for species in observed_species:
        family_key, family_members = resolve_family_key_and_members(species, evo_data)
        family_detail_file = f"families/{family_key}.json"
        family_bucket = families.setdefault(
            family_key,
            {
                "familyKey": family_key,
                "familyMembers": set(),
                "observedSpecies": set(),
                "detailFile": family_detail_file,
            },
        )
        family_bucket["familyMembers"].update(family_members)
        family_bucket["observedSpecies"].add(species)
        pokemon_index_entries.append(
            {
                "species": species,
                "familyKey": family_key,
                "detailFile": family_detail_file,
                "familyMembers": sorted(set(family_members)),
            }
        )

    family_payloads = {}
    for family_key, family_info in families.items():
        family_members = sorted(family_info["familyMembers"])
        observed_family_species = sorted(family_info["observedSpecies"])

        species_entries = {}
        for species in observed_family_species:
            species_records = build_pokemon_run_records(runs_by_tid, {species})
            species_entries[species] = {
                "byMinDepth": build_pokemon_snapshots_for_records(
                    species_records,
                    depth_context,
                    min_depth_values,
                    trainer_lookup,
                )
            }

        family_records = build_pokemon_run_records(runs_by_tid, set(family_members))
        family_combined = {
            "byMinDepth": build_pokemon_snapshots_for_records(
                family_records,
                depth_context,
                min_depth_values,
                trainer_lookup,
            )
        }

        family_payloads[family_key] = {
            "title": title,
            "generatedAt": generated_at,
            "familyKey": family_key,
            "familyMembers": family_members,
            "speciesEntries": species_entries,
            "familyCombined": family_combined,
        }

    pokemon_index_entries.sort(key=lambda entry: entry["species"])
    pokemon_index_payload = {
        "title": title,
        "generatedAt": generated_at,
        "species": pokemon_index_entries,
    }
    pokemon_meta = {
        "available": bool(pokemon_index_entries),
        "familyToggleDefault": "family",
    }
    return pokemon_index_payload, pokemon_meta, family_payloads


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
    title_config = get_title_config(title, dashboard_config)
    explicit_multi_team_keys = explicit_multi_team_usage_keys(title_config)
    backup_entries = build_backup_trainer_entries(title)
    gym_alias_map = emerald_gym_leader_alias_map(title, title_config, backup_entries)
    variant_alias_map = build_important_trainer_variant_alias_map(title, title_config, backup_entries)
    null_location_alias_map = build_null_location_alias_map(rows, backup_entries) if is_pokemon_null_title(title) else {}
    alias_stages: list[dict[str, dict[str, Any]]] = []
    if title == "Emerald Imperium 1.3" and gym_alias_map:
        alias_stages.append(gym_alias_map)
    if variant_alias_map:
        alias_stages.append(variant_alias_map)
    if is_pokemon_null_title(title) and null_location_alias_map:
        alias_stages.append(null_location_alias_map)

    species_table = species_name_table(title)
    normalized_rows = normalize_rows_for_title(title, rows, species_table)
    if alias_stages:
        for row in normalized_rows:
            row["sourceDisplayName"] = str(row.get("displayName") or row.get("usageKey") or "").strip()
            row["displayName"], row["usageKey"] = canonicalize_trainer_identity(
                row.get("displayName") or "",
                row.get("usageKey") or "",
                alias_stages,
            )
    else:
        for row in normalized_rows:
            row["sourceDisplayName"] = str(row.get("displayName") or row.get("usageKey") or "").strip()

    grouped_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in normalized_rows:
        grouped_rows[row["usageKey"]].append(row)
    for usage_key in configured_important_trainer_usage_keys(title_config):
        grouped_rows.setdefault(usage_key, [])

    if alias_stages:
        for entry in backup_entries:
            source_display_name = str(entry.get("displayName") or "").strip()
            entry["sourceDisplayName"] = source_display_name
            entry["displayName"], entry["usageKey"] = canonicalize_trainer_identity(
                entry.get("displayName") or "",
                entry.get("usageKey") or "",
                alias_stages,
            )
    else:
        for entry in backup_entries:
            entry["sourceDisplayName"] = str(entry.get("displayName") or "").strip()
    detail_file_by_usage_key = {}
    width = max(3, len(str(max(len(grouped_rows), 1))))
    for idx, usage_key in enumerate(sorted(grouped_rows.keys()), start=1):
        detail_file_by_usage_key[usage_key] = f"trainers/{idx:0{width}d}.json"

    index_entries: list[dict[str, Any]] = []
    fallback_entries: dict[str, dict[str, Any]] = {}
    seen_variant_names: dict[str, set[str]] = defaultdict(set)

    for entry in backup_entries:
        usage_key = str(entry["usageKey"])
        if usage_key not in grouped_rows:
            continue
        source_display_name = str(entry.get("sourceDisplayName") or entry["displayName"]).strip()
        normalized_entry = fallback_entries.get(usage_key)
        if normalized_entry is None:
            normalized_entry = {
                "displayName": entry["displayName"],
                "usageKey": usage_key,
                "detailFile": detail_file_by_usage_key[usage_key],
                "leadLevel": entry["leadLevel"],
                "maxLevel": entry["maxLevel"],
                "isBoss": entry["isBoss"],
                "partySize": entry["partySize"],
                "trId": entry["trId"],
                "sourceDisplayName": source_display_name or entry["displayName"],
                "teamVariantNames": [],
            }
            index_entries.append(normalized_entry)
            fallback_entries[usage_key] = normalized_entry
        else:
            if normalized_entry.get("leadLevel") is None and entry.get("leadLevel") is not None:
                normalized_entry["leadLevel"] = entry["leadLevel"]
            if entry.get("maxLevel") is not None:
                existing_max = normalized_entry.get("maxLevel")
                normalized_entry["maxLevel"] = entry["maxLevel"] if existing_max is None else max(existing_max, entry["maxLevel"])
            normalized_entry["isBoss"] = bool(normalized_entry.get("isBoss")) or bool(entry.get("isBoss"))
            normalized_entry["partySize"] = max(int(normalized_entry.get("partySize") or 0), int(entry.get("partySize") or 0))
            if normalized_entry.get("trId") is None and entry.get("trId") is not None:
                normalized_entry["trId"] = entry["trId"]
            if (
                normalized_entry.get("sourceDisplayName") != normalized_entry["displayName"]
                and source_display_name == normalized_entry["displayName"]
            ):
                normalized_entry["sourceDisplayName"] = source_display_name

        if (
            usage_key in explicit_multi_team_keys
            and source_display_name
            and source_display_name not in seen_variant_names[usage_key]
        ):
            normalized_entry["teamVariantNames"].append(source_display_name)
            seen_variant_names[usage_key].add(source_display_name)

    for entry in index_entries:
        usage_key = str(entry["usageKey"])
        if usage_key in explicit_multi_team_keys:
            if not entry["teamVariantNames"]:
                fallback_name = str(entry.get("sourceDisplayName") or entry["displayName"]).strip()
                entry["teamVariantNames"] = [fallback_name] if fallback_name else []
            continue

        canonical_team_name = str(entry["displayName"] or "").strip()
        entry["teamVariantNames"] = [canonical_team_name] if canonical_team_name else []

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
            "sourceDisplayName": usage_key,
            "teamVariantNames": [],
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

    export_context = prepare_title_export_context(
        title,
        index_entries,
        normalized_rows,
        title_config,
        evo_data,
        build_null_trainer_id_to_name_map(title, alias_stages) if is_pokemon_null_title(title) else None,
    )
    overview_payload, overview_meta = build_overview_payload(
        title,
        export_context,
        generated_at,
    )
    write_json(title_dir / "overview.json", overview_payload, pretty=True)
    pokemon_index_payload, pokemon_meta, family_payloads = build_pokemon_exports(
        title,
        export_context,
        generated_at,
    )
    write_json(title_dir / "pokemon" / "index.json", pokemon_index_payload, pretty=True)
    for family_key, payload in family_payloads.items():
        write_json(title_dir / "pokemon" / "families" / f"{family_key}.json", payload, pretty=True)

    index_payload = {
        "title": title,
        "slug": slug,
        "generatedAt": generated_at,
        "historyLimit": history_limit,
        "trainerCount": len(index_entries),
        "overviewFile": "overview.json",
        "overviewMeta": overview_meta,
        "pokemonIndexFile": "pokemon/index.json",
        "pokemonMeta": pokemon_meta,
        "trainers": [
            {
                key: value
                for key, value in entry.items()
                if key != "sourceDisplayName"
            }
            for entry in index_entries
        ],
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
                requested_titles = []
                missing = []
                for requested_title in args.titles:
                    canonical = canonical_title(requested_title)
                    if canonical in TITLE_TO_SLUG:
                        if canonical not in requested_titles:
                            requested_titles.append(canonical)
                    else:
                        missing.append(requested_title)
                missing = sorted(set(missing))
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
