"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadRecoilScrubber() {
    var source = fs.readFileSync(path.join(__dirname, "../../js/initialize.js"), "utf8");
    var start = source.indexOf("function scrubPlatinumKaizoRemovedRecoil");
    var end = source.indexOf("\nfunction loadMovesData", start);
    var context = { Array: Array };
    vm.runInNewContext(source.slice(start, end), context);
    return context.scrubPlatinumKaizoRemovedRecoil;
}

describe("Platinum Kaizo move-data cleanup", function () {
    test("removes inherited Submission recoil from the UI and every calc generation", function () {
        var scrub = loadRecoilScrubber();
        var uiMoves = {
            Submission: { recoil: [1, 4] },
            "Take Down": { recoil: [1, 4] }
        };
        var movesByGeneration = [
            {},
            { submission: { recoil: [1, 4] }, takedown: { recoil: [1, 4] } },
            { submission: { recoil: [1, 4] } },
            null,
            { submission: { recoil: [1, 4] } }
        ];

        scrub("Platinum Kaizo", uiMoves, movesByGeneration);

        expect(uiMoves.Submission.recoil).toBeUndefined();
        expect(uiMoves["Take Down"].recoil).toEqual([1, 4]);
        expect(movesByGeneration[1].submission.recoil).toBeUndefined();
        expect(movesByGeneration[1].takedown.recoil).toEqual([1, 4]);
        expect(movesByGeneration[2].submission.recoil).toBeUndefined();
        expect(movesByGeneration[4].submission.recoil).toBeUndefined();
    });

    test("does not alter Submission for other titles", function () {
        var scrub = loadRecoilScrubber();
        var uiMoves = { Submission: { recoil: [1, 4] } };
        var movesByGeneration = [{ submission: { recoil: [1, 4] } }];

        scrub("Renegade Platinum", uiMoves, movesByGeneration);

        expect(uiMoves.Submission.recoil).toEqual([1, 4]);
        expect(movesByGeneration[0].submission.recoil).toEqual([1, 4]);
    });
});
