"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

function loadExportedMoveMerger() {
    var source = fs.readFileSync(path.join(__dirname, "../../js/initialize.js"), "utf8");
    var start = source.indexOf("function applyExportedMoveData");
    var end = source.indexOf("\nfunction loadMovesData", start);
    var context = {};
    vm.runInNewContext(source.slice(start, end), context);
    return context.applyExportedMoveData;
}

describe("exported move metadata", function () {
    test("ROM effect data replaces stale vanilla always-crit metadata", function () {
        var merge = loadExportedMoveMerger();

        var zippyZap = merge({ willCrit: true, flags: {} }, {
            bp: 80,
            eff: "EVASION"
        }, "Zippy Zap", "zippyzap");
        var stormThrow = merge({ flags: {} }, {
            bp: 60,
            eff: "ALWAYS"
        }, "Storm Throw", "stormthrow");

        expect(zippyZap.willCrit).toBe(false);
        expect(stormThrow.willCrit).toBe(true);
    });

    test("replaces supplied recovery fields", function () {
        var merge = loadExportedMoveMerger();
        var vanilla = {
            recoil: [1, 3],
            drain: [1, 2],
            heal: [1, 2],
            critRatio: 2,
            flags: { contact: 1 }
        };

        var result = merge(vanilla, {
            basePower: 90,
            recoil: [1, 4],
            drain: [3, 4],
            heal: [2, 3],
            critRatio: 3
        }, "Test Move", "testmove");

        expect(result.recoil).toEqual([1, 4]);
        expect(result.drain).toEqual([3, 4]);
        expect(result.heal).toEqual([2, 3]);
        expect(result.critRatio).toBe(3);
    });

    test("preserves vanilla recovery fields when the source omits them", function () {
        var merge = loadExportedMoveMerger();
        var vanilla = {
            recoil: [1, 3],
            drain: [1, 2],
            heal: [1, 2],
            critRatio: 2,
            flags: {}
        };

        var result = merge(vanilla, { basePower: 95 }, "Test Move", "testmove");

        expect(result.recoil).toEqual([1, 3]);
        expect(result.drain).toEqual([1, 2]);
        expect(result.heal).toEqual([1, 2]);
        expect(result.critRatio).toBe(2);
    });

    test("supplied drain and recoil fractions drive calculated result text", function () {
        var merge = loadExportedMoveMerger();
        var desc = require("../desc");
        var attacker = {
            hasAbility: function () { return false; },
            hasItem: function () { return false; },
            maxHP: function () { return 200; }
        };
        var defender = {
            curHP: function () { return 100; },
            maxHP: function () { return 100; }
        };
        var baseMove = {
            named: function () { return false; },
            hits: 1,
            flags: {}
        };
        var drainingMove = merge(Object.assign({}, baseMove), {
            basePower: 75,
            drain: [1, 4]
        }, "Drain Test", "draintest");
        var recoilMove = merge(Object.assign({}, baseMove), {
            basePower: 90,
            recoil: [1, 4]
        }, "Recoil Test", "recoiltest");

        var damageRange = [40, 60, 80];
        expect(desc.getRecovery({ num: 5 }, attacker, defender, drainingMove, damageRange, "%").text)
            .toBe("5 - 10% healed");
        expect(desc.getRecoil({ num: 5 }, attacker, defender, recoilMove, damageRange, "%").text)
            .toBe("5 - 10% recoil");
    });
});
