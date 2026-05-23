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
    var context = Object.assign({
        console: console,
        TITLE: "Autumn Red",
        gen: 3,
        cleanString: cleanString,
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
