"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function extractSourceBetween(source, startNeedle, endNeedle) {
	var start = source.indexOf(startNeedle);
	var end = source.indexOf(endNeedle, start);
	if (start === -1 || end === -1) {
		throw new Error("Unable to extract moveset_import.js test source");
	}

	return source.slice(start, end);
}

function loadExportAllContext(customsets) {
	var source = fs.readFileSync(path.resolve(__dirname, "../../js/moveset_import.js"), "utf8");
	var exporterSource = extractSourceBetween(source, "function getExportStatValue", "$(\"#exportAllL\").click");
	exporterSource += extractSourceBetween(source, "function getStoredCustomSets", "function createBoxImportBatchId");
	var context = {
		localStorage: {
			customsets: JSON.stringify(customsets || {})
		},
		normalizeStoredStatus: function (status) {
			return status || "Healthy";
		},
		serialize: function (parts, separator) {
			return parts.join(separator);
		},
		$: function () {
			return {
				val: function (value) {
					context.exportedText = value;
				}
			};
		}
	};

	vm.createContext(context);
	vm.runInContext(exporterSource, context, { filename: "moveset_import.js" });
	return context;
}

describe("exportAllCustomSets", function () {
	test("exports stored My Box custom sets without import-only snapshot state", function () {
		var context = loadExportAllContext({
			Charizard: {
				"My Box": {
					level: 50,
					item: "Leftovers",
					nature: "Timid",
					ability: "Blaze",
					evs: { spa: 252, spe: 252 },
					ivs: { atk: 0 },
					status: "Healthy",
					moves: ["Flamethrower", "Air Slash", "Roost", "Dragon Pulse"]
				}
			}
		});

		expect(function () {
			context.exportAllCustomSets();
		}).not.toThrow();
		expect(context.exportedText).toBe([
			"Charizard @ Leftovers",
			"Level: 50",
			"Timid Nature",
			"Ability: Blaze",
			"EVs: 252 SpA / 252 Spe",
			"IVs: 0 Atk",
			"- Flamethrower",
			"- Air Slash",
			"- Roost",
			"- Dragon Pulse"
		].join("\n"));
	});
});
