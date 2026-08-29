"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadPokemonNullData() {
    var source = fs.readFileSync(path.join(__dirname, "../../backups/null12.js"), "utf8");
    var context = {};
    vm.runInNewContext(source, context);
    return context.backup_data;
}

function loadTrainerPreviewContext(data) {
    var context = {
        setdex: data.formatted_sets,
        TITLE: "Pokemon Null 1.2",
        partnerName: null,
        customLeads: {},
        stripTrainerLevelDuplicateMarkers: function (setId) { return setId; },
        getTrainerName: function (setId) {
            var match = String(setId || "").match(/^[^(]+ \((.*)\)(?:\[\d+\])?$/);
            return match ? match[1] : null;
        },
        getTrainerPreviewTrainerIdFromSet: function (setId) {
            var species = String(setId || "").split(" (")[0];
            var setName = String(setId || "").split(" (")[1];
            if (!species || !setName) return false;
            setName = setName.replace(/\)\[\d+\]$/, "").replace(/\)$/, "");
            return context.setdex[species] && context.setdex[species][setName]
                ? context.setdex[species][setName].tr_id
                : false;
        }
    };
    vm.createContext(context);
    vm.runInContext(
        fs.readFileSync(path.join(__dirname, "../../js/calc_ui/trainer_preview.js"), "utf8"),
        context
    );
    return context;
}

describe("Pokemon Null generated data", function () {
    var data = loadPokemonNullData();

    test("uses current-generation Azumarill data", function () {
        expect(data.poks.Azumarill.types).toEqual(["Water", "Fairy"]);
        expect(data.poks.Azumarill.bs.sa).toBe(60);
        expect(data.moves.lusterpurge.bp).toBe(95);
        expect(data.moves.mistball.bp).toBe(95);
        expect(data.moves.zippyzap.eff).toBe("EVASION");
    });

    test("keeps Palafin base and Hero forms distinct", function () {
        expect(data.poks.Palafin.bs).toEqual({
            hp: 100, at: 70, df: 72, sa: 53, sd: 62, sp: 100
        });
        expect(data.poks["Palafin-Hero"].bs).toEqual({
            hp: 100, at: 160, df: 97, sa: 106, sd: 100, sp: 100
        });
    });

    test("double-battle trainer partners are reciprocal", function () {
        var trainerPartners = new Map();
        var taggedSets = 0;

        Object.values(data.formatted_sets).forEach(function (speciesSets) {
            Object.values(speciesSets).forEach(function (setData) {
                if (!setData.partner) {
                    return;
                }

                taggedSets += 1;
                trainerPartners.set(Number(setData.tr_id), Number(setData.partner));
                expect(setData.battle_type).toBe("Doubles");
            });
        });

        expect(taggedSets).toBeGreaterThan(0);
        expect(trainerPartners.size).toBeGreaterThan(0);
        trainerPartners.forEach(function (partnerId, trainerId) {
            expect(trainerPartners.get(partnerId)).toBe(trainerId);
        });
    });

    test("only Mega Stone sets receive generated Mega counterparts", function () {
        var ordinarySet = "Lvl 34 Fisherman Darian |Route 104|";
        var stoneSet = "Lvl 87 Team Aqua Admin Matt |Aqua Hideout|";

        expect(data.formatted_sets.Gyarados[ordinarySet].item).toBe("Adrenaline Orb");
        expect(data.formatted_sets["Gyarados-Mega"][ordinarySet]).toBeUndefined();
        expect(data.formatted_sets.Gyarados[stoneSet].item).toBe("Gyaradosite");
        expect(data.formatted_sets["Gyarados-Mega"][stoneSet]).toBeDefined();
    });

    test("trainer preview returns both members of a generated partner battle", function () {
        var context = loadTrainerPreviewContext(data);
        context.TR_NAMES = context.get_trainer_names();

        context.TR_NAMES.forEach(function (setId) {
            var trainerId = Number(context.getTrainerPreviewTrainerIdFromSet(setId));
            if (trainerId && !context.customLeads[trainerId]) {
                context.customLeads[trainerId] = setId;
            }
        });

        var primarySetId = context.TR_NAMES.find(function (setId) {
            var species = setId.split(" (")[0];
            var setName = setId.split(" (")[1].replace(/\)\[\d+\]$/, "");
            return data.formatted_sets[species][setName].partner;
        });
        var primaryTrainerId = Number(context.getTrainerPreviewTrainerIdFromSet(primarySetId));
        var species = primarySetId.split(" (")[0];
        var setName = primarySetId.split(" (")[1].replace(/\)\[\d+\]$/, "");
        var partnerTrainerId = Number(data.formatted_sets[species][setName].partner);
        var previewSets = context.get_trainer_poks(primarySetId, partnerTrainerId);
        var previewTrainerIds = new Set(previewSets.map(function (setId) {
            return Number(context.getTrainerPreviewTrainerIdFromSet(setId));
        }));

        expect(previewSets.length).toBeGreaterThan(1);
        expect(Array.from(previewTrainerIds).sort()).toEqual(
            [primaryTrainerId, partnerTrainerId].sort()
        );
    });
});
