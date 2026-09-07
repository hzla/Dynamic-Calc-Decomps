"""Small isolated migration checks; no repository sprite is modified."""

from io import BytesIO
from pathlib import Path
import tempfile
import unittest

from PIL import Image

from migrate_battle_sprites import inspect_image, migrate


def image_bytes(animated=False, colors=("red", "blue"), format="GIF"):
    frames = [Image.new("RGBA", (8, 8), color) for color in colors]
    out = BytesIO()
    options = dict(save_all=True, append_images=frames[1:], duration=80, loop=0) if animated else {}
    frames[0].save(out, format=format, **options)
    return out.getvalue()


class MigrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "calc"
        self.source = Path(self.temp.name) / "source"
        for side in ("front", "back"):
            (self.root / "img" / side).mkdir(parents=True)
            (self.source / side.title()).mkdir(parents=True)

    def destination(self, name, data, side="front"):
        path = self.root / "img" / side / (name + ".gif")
        path.write_bytes(data)
        return path

    def source_file(self, name, data, side="Front"):
        path = self.source / side / (name + ".gif")
        path.write_bytes(data)
        return path

    def test_dry_run_apply_orientation_and_idempotence(self):
        static = image_bytes(format="PNG")
        front = image_bytes(True)
        back = image_bytes(True, ("yellow", "green"))
        paths = [self.destination("pikachu", static, side) for side in ("front", "back")]
        self.source_file("PIKACHU", front)
        self.source_file("PIKACHU", back, "Back")
        result = migrate(self.root, self.source, {})
        self.assertEqual([r["status"] for r in result["files"]], ["would_replace"] * 2)
        self.assertTrue(all(p.read_bytes() == static for p in paths))
        migrate(self.root, self.source, {}, apply=True)
        self.assertEqual([p.read_bytes() for p in paths], [front, back])
        again = migrate(self.root, self.source, {}, apply=True)
        self.assertEqual([r["status"] for r in again["files"]], ["preserved_animated"] * 2)

    def test_preserves_animations_even_when_not_encoded_as_gif(self):
        for name, format in (("pikachu", "GIF"), ("raichu", "PNG")):
            original = image_bytes(True, format=format)
            path = self.destination(name, original)
            self.source_file(name.upper(), image_bytes(True, ("black", "white")))
            migrate(self.root, self.source, {}, apply=True)
            self.assertEqual(path.read_bytes(), original)

    def test_form_mapping_takes_precedence_and_does_not_fall_back(self):
        static = image_bytes(format="PNG")
        self.destination("unown-f", static)
        custom = self.destination("pikachu-sevii", static)
        missing = self.destination("sneasel-hisui-f", static, "back")
        expected = image_bytes(True)
        self.source_file("UNOWN_5", expected)
        self.source_file("UNOWN_female", image_bytes(True, ("green", "white")))
        self.source_file("PIKACHU", expected)
        self.source_file("SNEASEL_1_female", expected)
        self.source_file("SNEASEL_1", expected, "Back")
        mappings = {"unown-f": {"source": "UNOWN_5.gif", "note": "Letter F"},
                    "sneasel-hisui-f": {"source": "SNEASEL_1_female.gif", "note": "Female"}}
        result = migrate(self.root, self.source, mappings, apply=True)
        records = {Path(r["destination"]).stem: r for r in result["files"]}
        self.assertEqual(records["unown-f"]["status"], "replaced")
        self.assertEqual(records["sneasel-hisui-f"]["status"], "source_missing")
        self.assertEqual(custom.read_bytes(), static)
        self.assertEqual(missing.read_bytes(), static)

    def test_invalid_and_static_sources_are_skipped_but_invalid_targets_can_be_repaired(self):
        static = image_bytes(format="PNG")
        paths = {name: self.destination(name, static) for name in ("pikachu", "raichu")}
        self.source_file("PIKACHU", b"not an image")
        self.source_file("RAICHU", image_bytes())
        repaired = self.destination("eevee", b"broken original")
        animation = image_bytes(True)
        self.source_file("EEVEE", animation)
        result = migrate(self.root, self.source, {}, apply=True)
        statuses = {Path(r["destination"]).stem: r["status"] for r in result["files"]}
        self.assertEqual(statuses, {"eevee": "replaced", "pikachu": "source_invalid", "raichu": "source_static"})
        self.assertTrue(all(p.read_bytes() == static for p in paths.values()))
        self.assertEqual(repaired.read_bytes(), animation)

    def test_explicit_skip_and_normalization_collision(self):
        static = image_bytes(format="PNG")
        original = self.destination("hooh", static)
        self.source_file("HO-OH", image_bytes(True))
        self.source_file("HOOH", image_bytes(True))
        result = migrate(self.root, self.source, {}, apply=True)
        self.assertEqual(result["files"][0]["status"], "ambiguous_source")
        result = migrate(self.root, self.source, {"hooh": {"skip": "no_form_counterpart", "note": "Preserve"}}, apply=True)
        self.assertEqual(result["files"][0]["status"], "no_form_counterpart")
        self.assertEqual(original.read_bytes(), static)

    def test_inspection_decodes_all_frames(self):
        data = image_bytes(True)
        info = inspect_image(data)
        self.assertEqual(info["frames"], 2)
        self.assertEqual(info["distinct_frames"], 2)
        self.assertEqual(info["duration_ms"], 160)
        self.assertEqual(info["loop"], 0)
        self.assertIn("error", inspect_image(data[:len(data) // 2]))

    def test_za_preferences_only_override_mapped_forms_and_additions_are_opt_in(self):
        artist_root = Path(self.temp.name) / "artists"
        (artist_root / "retromc").mkdir(parents=True)
        preferred = image_bytes(True, ("orange", "green"))
        (artist_root / "retromc" / "meganium-mega-front.gif").write_bytes(preferred)
        original = image_bytes(True)
        mapped = self.destination("meganium-mega", original)
        unrelated = self.destination("absol-mega", original)
        self.source_file("ABSOL", preferred)
        entry = {"collection": "za", "source": "retromc/meganium-mega-front.gif", "note": "Fixture"}
        za = {"meganium-mega": {"front": entry}, "fixture-mega": {"back": entry}}
        result = migrate(self.root, self.source, {}, True, artist_root, za)
        self.assertEqual(mapped.read_bytes(), preferred)
        self.assertEqual(unrelated.read_bytes(), original)
        missing = self.root / "img/back/fixture-mega.gif"
        self.assertFalse(missing.exists())
        self.assertIn("destination_missing", [r["status"] for r in result["files"]])
        result = migrate(self.root, self.source, {}, False, artist_root, za, True)
        self.assertIn("would_add", [r["status"] for r in result["files"]])
        self.assertFalse(missing.exists())
        result = migrate(self.root, self.source, {}, True, artist_root, za, True)
        self.assertEqual(missing.read_bytes(), preferred)
        again = migrate(self.root, self.source, {}, False, artist_root, za, True)
        self.assertFalse(any(r["status"].startswith("would_") for r in again["files"]))

    def test_za_can_use_an_explicit_essentials_fallback(self):
        animation = image_bytes(True)
        self.source_file("FLOETTE_6", animation, "Back")
        za = {"floette-mega": {"back": {"collection": "essentials",
              "source": "Back/FLOETTE_6.gif", "note": "Verified fallback"}}}
        migrate(self.root, self.source, {}, True, self.source, za, True)
        self.assertEqual((self.root / "img/back/floette-mega.gif").read_bytes(), animation)


if __name__ == "__main__":
    unittest.main()
