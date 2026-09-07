#!/usr/bin/env python3
"""Replace static battle sprites with verified Essentials animations (requires Pillow).

Dry run:
  python3 scripts/migrate_battle_sprites.py --source /path/to/essentials_gifs
Apply and save the audit:
  python3 scripts/migrate_battle_sprites.py --source /path/to/essentials_gifs \
      --apply --report scripts/battle_sprite_migration_report.json

Only existing img/front/*.gif and img/back/*.gif are eligible by default.
--za-sprites enables the explicitly mapped artist preferences for Z-A Megas,
including replacement of existing animations in that narrowly defined set.
--add-missing-za additionally creates missing files for supported Z-A forms.
There is deliberately no fuzzy form fallback.
"""

import argparse
from collections import Counter, defaultdict
import hashlib
from io import BytesIO
import json
from pathlib import Path
import re
import sys

from PIL import Image


def normalize(name):
    return re.sub(r"[^a-z0-9]", "", name.lower())


def inspect_image(data):
    """Decode every composited frame, including transparency and disposal."""
    result = {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
    try:
        with Image.open(BytesIO(data)) as image:
            result.update(format=image.format, size=list(image.size), frames=image.n_frames,
                          loop=image.info.get("loop"))
            distinct = set()
            duration = 0
            for index in range(image.n_frames):
                image.seek(index)
                rgba = image.convert("RGBA")
                # Composite onto transparent black so invisible RGB values cannot
                # make a visually static image appear animated.
                visible = Image.new("RGBA", rgba.size)
                visible.alpha_composite(rgba)
                distinct.add(hashlib.sha256(visible.tobytes()).digest())
                duration += image.info.get("duration", 0)
            result.update(distinct_frames=len(distinct), duration_ms=duration)
    except (OSError, ValueError, EOFError, SyntaxError) as error:
        result["error"] = str(error)
    return result


def is_animated(info):
    return not info.get("error") and info.get("distinct_frames", 0) > 1


def source_index(directory):
    index = defaultdict(list)
    for path in sorted(directory.glob("*.gif")):
        index[normalize(path.stem)].append(path)
    return index


def resolve_source(stem, directory, index, mappings):
    if stem in mappings:
        entry = mappings[stem]
        if entry.get("skip"):
            return None, entry["skip"], entry["note"]
        name = entry["source"]
        if Path(name).name != name or not name.endswith(".gif"):
            raise ValueError("Mapping source must be a GIF basename: " + name)
        path = directory / name
        return path, "explicit_mapping", entry["note"]
    matches = index.get(normalize(stem), [])
    if len(matches) == 1:
        return matches[0], "species_name", "Normalized species name"
    if len(matches) > 1:
        return None, "ambiguous_source", "Multiple source names normalize identically"
    if stem.endswith("-f"):
        matches = index.get(normalize(stem[:-2] + "_female"), [])
        if len(matches) == 1:
            return matches[0], "female_sprite", "Explicit female filename"
    # Distinguish known species with unresolved forms from custom names.
    base = normalize(stem.split("-")[0])
    if any(normalize(path.stem.split("_")[0]) == base
           for paths in index.values() for path in paths):
        return None, "unresolved_form", "Species exists; no confirmed form mapping"
    return None, "no_counterpart", "No matching species in the supplied pack"


def migrate(root, source, mappings, apply=False, za_source=None, za_mappings=None,
            add_missing_za=False):
    za_mappings = za_mappings or {}
    if add_missing_za and za_source is None:
        raise ValueError("Adding Z-A sprites requires --za-sprites")
    records = []
    pending = []
    source_cache = {}
    # Complete the scan and validation before changing any destination.
    for side in ("front", "back"):
        destination_dir = root / "img" / side
        source_dir = source / side.title()
        if not destination_dir.is_dir() or not source_dir.is_dir():
            raise ValueError("Missing sprite directory for " + side)
        index = source_index(source_dir)
        destinations = set(destination_dir.glob("*.gif"))
        if za_source is not None:
            for stem, sides in za_mappings.items():
                if Path(stem).name != stem:
                    raise ValueError("Invalid Z-A destination basename: " + stem)
                if side in sides:
                    destinations.add(destination_dir / (stem + ".gif"))
        for destination in sorted(destinations):
            original = inspect_image(destination.read_bytes()) if destination.exists() else None
            record = {"destination": destination.relative_to(root).as_posix(),
                      "original": original}
            records.append(record)
            preferred = za_mappings.get(destination.stem, {}).get(side) if za_source else None
            if original is None and not add_missing_za:
                record["status"] = "destination_missing"
                continue
            if not preferred and is_animated(original):
                record["status"] = "preserved_animated"
                continue
            if preferred:
                collection = preferred["collection"]
                base = {"za": za_source, "essentials": source}[collection]
                relative = Path(preferred["source"])
                if relative.is_absolute() or ".." in relative.parts or relative.suffix != ".gif":
                    raise ValueError("Invalid preferred source path: " + str(relative))
                candidate = base / relative
                method, note = "preferred_za_source", preferred["note"]
            else:
                collection, base = "essentials", source
                candidate, method, note = resolve_source(
                    destination.stem, source_dir, index, mappings)
            record.update(match=method, note=note)
            if candidate is None:
                record["status"] = method
                continue
            record["source"] = candidate.relative_to(base).as_posix()
            record["source_collection"] = collection
            if not candidate.is_file():
                record["status"] = "source_missing"
                continue
            if candidate not in source_cache:
                source_cache[candidate] = inspect_image(candidate.read_bytes())
            replacement = source_cache[candidate]
            record["replacement"] = replacement
            if replacement.get("error") or replacement.get("format") != "GIF":
                record["status"] = "source_invalid"
            elif not is_animated(replacement):
                record["status"] = "source_static"
            elif original and original["sha256"] == replacement["sha256"]:
                record["status"] = "preserved_preferred_source"
            else:
                record["status"] = "would_replace" if original else "would_add"
                pending.append((destination, candidate, record))

    if apply:
        # Check the inputs again before writing, to avoid overwriting intervening edits.
        for destination, candidate, record in pending:
            for path, info in ((destination, record["original"]),
                               (candidate, record["replacement"])):
                if info is None:
                    if path.exists():
                        raise ValueError("Destination appeared during scan: " + str(path))
                    continue
                if hashlib.sha256(path.read_bytes()).hexdigest() != info["sha256"]:
                    raise ValueError("File changed during scan: " + str(path))
        for destination, candidate, record in pending:
            data = candidate.read_bytes()
            if hashlib.sha256(data).hexdigest() != record["replacement"]["sha256"]:
                raise ValueError("Source changed during copy: " + str(candidate))
            destination.write_bytes(data)
            if hashlib.sha256(destination.read_bytes()).hexdigest() != record["replacement"]["sha256"]:
                raise ValueError("Copy verification failed: " + str(destination))
            record["status"] = "replaced" if record["original"] else "added"

    return {"mode": "apply" if apply else "dry_run", "source_root": str(source),
            "za_source_root": str(za_source) if za_source else None,
            "summary": {side: dict(Counter(record["status"] for record in records
                                          if record["destination"].startswith("img/" + side + "/")))
                        for side in ("front", "back")},
            "files": records}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", type=Path, required=True, help="Essentials folder containing Front and Back")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--mapping", type=Path, default=Path(__file__).with_name("battle_sprite_form_mapping.json"))
    parser.add_argument("--apply", action="store_true", help="Copy eligible animations; otherwise only scan")
    parser.add_argument("--za-sprites", type=Path, help="Folder containing retromc and Aronousqui20; enables preferred Z-A replacements")
    parser.add_argument("--add-missing-za", action="store_true", help="Also add missing sprite files for explicitly mapped supported Z-A forms")
    parser.add_argument("--report", type=Path, help="Write the complete JSON audit to this path")
    args = parser.parse_args()
    mapping_data = args.mapping.read_bytes()
    mapping_document = json.loads(mapping_data)
    report = migrate(args.root.resolve(), args.source.resolve(), mapping_document["mappings"], args.apply,
                     args.za_sprites.resolve() if args.za_sprites else None,
                     mapping_document.get("za_mappings"), args.add_missing_za)
    report["mapping_sha256"] = hashlib.sha256(mapping_data).hexdigest()
    if args.report:
        args.report.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"mode": report["mode"], "summary": report["summary"]}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
