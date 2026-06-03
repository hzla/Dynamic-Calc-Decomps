"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function cleanString(value) {
    return String(value || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function loadImportNormalizer(overrides) {
    overrides = overrides || {};
    var source = fs.readFileSync(path.resolve(__dirname, "../../js/moveset_import.js"), "utf8");
    var normalizerSource = source.slice(0, source.indexOf("function placeBsBtn()"));
    if (overrides.includeStatsParser) {
        normalizerSource += source.slice(
            source.indexOf("function statToLegacyStat"),
            source.indexOf("function isInt")
        );
    }
    if (overrides.includeImportParser) {
        normalizerSource += source.slice(
            source.indexOf("function extractGenderFromImportHeader"),
            source.indexOf("function isImportedSetBoundaryLine")
        );
        normalizerSource += source.slice(
            source.indexOf("function checkExeptions"),
            source.indexOf("$(\"#clearSets\").click")
        );
    }
    var context = Object.assign({
        console: console,
        TITLE: "Autumn Red",
        gen: 3,
        cleanString: cleanString,
        calc: {
            SPECIES: {
                8: {
                    Jellicent: { name: "Jellicent" },
                    "Jellicent-F": { name: "Jellicent-F" }
                }
            }
        },
        pokedex: {
            Jellicent: {},
            "Jellicent-F": {}
        },
        MOVES_BY_ID: {
            3: {
                drillrun: { name: "Drill Run" },
                faintattack: { name: "Faint Attack" },
                hiddenpowergrass: { name: "Hidden Power Grass" }
            }
        },
        backup_data: {
            move_replacements: {
                "Gravity": "Drill Run"
            }
        },
        isImportedSetBoundaryLine: function () {
            return false;
        }
    }, overrides);

    vm.createContext(context);
    vm.runInContext(normalizerSource, context, { filename: "moveset_import.js" });
    return context;
}

describe("import move replacements", function () {
    test("applies Autumn Red display-name backup replacements", function () {
        var context = loadImportNormalizer();

        expect(context.normalizeImportedMoveName("Gravity", { applyRomReplacements: true })).toBe("Drill Run");
    });

    test("still applies normalized backup replacement maps", function () {
        var context = loadImportNormalizer({
            backup_data: {
                move_replacements: {
                    gravity: "drillrun"
                }
            }
        });

        expect(context.normalizeImportedMoveName("Gravity", { applyRomReplacements: true })).toBe("Drill Run");
    });

    test("leaves save moves unchanged when ROM replacements are disabled", function () {
        var context = loadImportNormalizer();

        expect(context.normalizeImportedMoveName("Gravity", { applyRomReplacements: false })).toBe("Gravity");
    });
});

describe("Radical Red gendered species imports", function () {
    test("maps female Jellicent text imports to the Radical Red female forme", function () {
        var context = loadImportNormalizer({
            TITLE: "Radical Red",
            includeImportParser: true
        });

        var parsed = context.findImportedSpeciesMatchFromHeader("Jellicent (F) @", {});

        expect(parsed.match.speciesName).toBe("Jellicent-F");
        expect(parsed.headerInfo.gender).toBe("F");
    });

    test("leaves female Jellicent text imports unchanged outside Radical Red", function () {
        var context = loadImportNormalizer({
            includeImportParser: true
        });

        var parsed = context.findImportedSpeciesMatchFromHeader("Jellicent (F) @", {});

        expect(parsed.match.speciesName).toBe("Jellicent");
        expect(parsed.headerInfo.gender).toBe("F");
    });
});

describe("imported egg state", function () {
    test("clears stale egg state when the next import block has no Egg line", function () {
        var context = loadImportNormalizer({
            includeStatsParser: true,
            calc: {
                SPECIES: {
                    8: {
                        Chimchar: { name: "Chimchar" }
                    }
                }
            }
        });
        var stalePokemon = { name: "Chimchar", isEgg: true };

        var parsed = context.getStats(stalePokemon, [
            "Chimchar (M) @ None",
            "Level: 12",
            "Naughty Nature",
            "- Scratch"
        ], 1, {});

        expect(parsed.isEgg).toBe(false);
    });

    test("keeps egg state when the import block explicitly says Egg: Yes", function () {
        var context = loadImportNormalizer({
            includeStatsParser: true,
            calc: {
                SPECIES: {
                    8: {
                        Chimchar: { name: "Chimchar" }
                    }
                }
            }
        });

        var parsed = context.getStats({ name: "Chimchar" }, [
            "Chimchar (Egg) @ None",
            "Level: 1",
            "Egg: Yes",
            "Naughty Nature"
        ], 1, {});

        expect(parsed.isEgg).toBe(true);
    });
});
