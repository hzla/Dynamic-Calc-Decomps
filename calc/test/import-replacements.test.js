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
