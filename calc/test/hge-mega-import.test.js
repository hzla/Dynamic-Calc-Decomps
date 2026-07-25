"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadMegaImportContext(overrides) {
	var source = fs.readFileSync(path.resolve(__dirname, "../../js/moveset_import.js"), "utf8");
	var start = source.indexOf("function hasBackupDataSpecies");
	var end = source.indexOf("function getMegaPrimaryAbility", start);
	if (start === -1 || end === -1) {
		throw new Error("Unable to extract mega import helpers");
	}

	var context = Object.assign({
		backup_data: undefined,
		mechanics: "vanilla",
		cleanString: function (value) {
			return String(value || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
		},
		isMegaSpeciesName: function (speciesName) {
			return typeof speciesName === "string" && speciesName.includes("-Mega");
		},
		ZA_PATCH: null
	}, overrides || {});
	vm.createContext(context);
	vm.runInContext(source.slice(start, end), context, { filename: "moveset_import.js" });
	return context;
}

describe("HGE automatic mega imports", function () {
	test("does not import a global-only mega when HGE backup data is unavailable", function () {
		var context = loadMegaImportContext({ mechanics: "hge" });

		expect(context.shouldAutoImportMegaForme("Torterra-Mega")).toBe(false);
	});

	test("does not import a mega omitted by the HGE ROM species data", function () {
		var context = loadMegaImportContext({
			mechanics: "hge",
			backup_data: {
				poks: {
					Torterra: {}
				}
			}
		});

		expect(context.shouldAutoImportMegaForme("Torterra-Mega")).toBe(false);
	});

	test("still imports a mega explicitly supplied by the HGE ROM", function () {
		var context = loadMegaImportContext({
			mechanics: "hge",
			backup_data: {
				poks: {
					"Torterra-Mega": {}
				}
			}
		});

		expect(context.shouldAutoImportMegaForme("Torterra-Mega")).toBe(true);
	});

	test("recognizes HGE species data keyed by normalized species id", function () {
		var context = loadMegaImportContext({
			mechanics: "hge",
			backup_data: {
				poks: {
					torterramega: {}
				}
			}
		});

		expect(context.shouldAutoImportMegaForme("Torterra-Mega")).toBe(true);
	});

	test("preserves the global fallback outside HGE mode", function () {
		var context = loadMegaImportContext({ mechanics: "vanilla" });

		expect(context.shouldAutoImportMegaForme("Torterra-Mega")).toBe(true);
	});

	test("removes a persisted HGE mega that is absent from the ROM species data", function () {
		var context = loadMegaImportContext({
			mechanics: "hge",
			backup_data: {
				poks: {
					Torterra: {}
				}
			}
		});
		var customsets = {
			Torterra: {
				"My Box": { level: 42 }
			},
			"Torterra-Mega": {
				"My Box": { level: 42 }
			}
		};

		expect(context.pruneUnavailableHgeMegaCustomSets(customsets)).toBe(true);
		expect(customsets.Torterra).toBeDefined();
		expect(customsets["Torterra-Mega"]).toBeUndefined();
	});

	test("keeps a persisted HGE mega explicitly supplied by the ROM", function () {
		var context = loadMegaImportContext({
			mechanics: "hge",
			backup_data: {
				poks: {
					"Torterra-Mega": {}
				}
			}
		});
		var customsets = {
			"Torterra-Mega": {
				"My Box": { level: 42 }
			}
		};

		expect(context.pruneUnavailableHgeMegaCustomSets(customsets)).toBe(false);
		expect(customsets["Torterra-Mega"]).toBeDefined();
	});

	test("waits for a real HGE species catalog before pruning persisted megas", function () {
		var context = loadMegaImportContext({
			mechanics: "hge",
			backup_data: {}
		});
		var customsets = {
			"Torterra-Mega": {
				"My Box": { level: 42 }
			}
		};

		expect(context.pruneUnavailableHgeMegaCustomSets(customsets)).toBe(false);
		expect(customsets["Torterra-Mega"]).toBeDefined();
	});
});
