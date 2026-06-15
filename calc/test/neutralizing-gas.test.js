"use strict";

var helper_1 = require("./helper");
var types_1 = require("../data/types");

function withEmeraldImperiumGlobals(fn) {
    var prev = {
        TITLE: global.TITLE,
        settings: global.settings,
        gameGen: global.gameGen,
        typeChart: global.typeChart,
        calcingForSwitchIns: global.calcingForSwitchIns,
        localStorage: global.localStorage,
        backup_moves: global.backup_moves,
        pokedex: global.pokedex
    };
    global.TITLE = "Emerald Imperium 1.3";
    global.settings = {
        type_chart: 6,
        typeChart: 6,
        damageGen: 8,
        critGen: 6,
        switchIn: 0,
        noSwitch: true,
        challengeMode: false,
        hasEvs: false
    };
    global.gameGen = 8;
    global.typeChart = types_1.TYPE_CHART[6];
    global.calcingForSwitchIns = false;
    global.localStorage = { dynamicTypeBug: "0" };
    global.backup_moves = {};
    global.pokedex = {};
    try {
        return fn();
    }
    finally {
        global.TITLE = prev.TITLE;
        global.settings = prev.settings;
        global.gameGen = prev.gameGen;
        global.typeChart = prev.typeChart;
        global.calcingForSwitchIns = prev.calcingForSwitchIns;
        global.localStorage = prev.localStorage;
        global.backup_moves = prev.backup_moves;
        global.pokedex = prev.pokedex;
    }
}

function P(ctx, name, options) {
    if (options === void 0) { options = {}; }
    return ctx.Pokemon(name, Object.assign({
        level: 25,
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    }, options));
}

function knockOffIntoKoffing(ctx, koffingAbility, hariyamaAbility) {
    return withEmeraldImperiumGlobals(function () {
        return ctx.calculate(
            P(ctx, "Hariyama", {
                ability: hariyamaAbility,
                item: "Flame Orb",
                status: "brn",
                nature: "Adamant"
            }),
            P(ctx, "Koffing", {
                ability: koffingAbility,
                nature: "Bold"
            }),
            ctx.Move("Knock Off"),
            ctx.Field({})
        );
    });
}

describe("Neutralizing Gas", function () {
    (0, helper_1.inGen)(8, function (_a) {
        var calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test("suppresses Guts before burned physical damage is calculated", function () {
            var boosted = knockOffIntoKoffing(ctx, "Levitate", "Guts");
            var suppressed = knockOffIntoKoffing(ctx, "Neutralizing Gas", "Guts");
            var noAbility = knockOffIntoKoffing(ctx, "Levitate", "No Ability");

            expect(boosted.range()).toEqual([24, 29]);
            expect(suppressed.range()).toEqual([8, 10]);
            expect(suppressed.range()).toEqual(noAbility.range());
            expect(suppressed.rawDesc.attackerAbility).toBeUndefined();
            expect(suppressed.rawDesc.isBurned).toBe(true);
        });
    });
});
