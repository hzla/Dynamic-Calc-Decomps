"use strict";

var adapter = require("../../js/unbound_adapter.js");

describe("Pokemon Unbound data adapter", function () {
    var source = {
        formatted_sets: {
            difficult: { Pikachu: { Difficult: { level: 50 } } },
            expert: { Raichu: { Expert: { level: 60 } } },
            insane: { Mew: { Insane: { level: 70 } } }
        },
        unbound_moves: {
            Tackle: { bp: 40, type: "Normal", category: "Physical" }
        },
        pokedex: {
            Pikachu: { types: ["Electric"], bs: { hp: 35, at: 55, df: 40, sa: 50, sd: 50, sp: 90 } }
        }
    };

    test("selects the requested mode bucket", function () {
        expect(adapter.normalizeUnboundDataSource(source, "difficult").formatted_sets).toEqual(source.formatted_sets.difficult);
        expect(adapter.normalizeUnboundDataSource(source, "expert").formatted_sets).toEqual(source.formatted_sets.expert);
        expect(adapter.normalizeUnboundDataSource(source, "insane").formatted_sets).toEqual(source.formatted_sets.insane);
    });

    test("falls back to insane for missing or invalid modes", function () {
        expect(adapter.normalizeUnboundDataSource(source, "").formatted_sets).toEqual(source.formatted_sets.insane);
        expect(adapter.normalizeUnboundDataSource(source, "challenge").formatted_sets).toEqual(source.formatted_sets.insane);
        expect(adapter.normalizeUnboundDataSource(source, "?m=invalid").formatted_sets).toEqual(source.formatted_sets.insane);
    });

    test("normalizes the legacy Unbound shape into current loader fields", function () {
        var normalized = adapter.normalizeUnboundDataSource(source, "?m=expert");
        expect(normalized.title).toBe("Pokemon Unbound");
        expect(normalized.moves).toBe(source.unbound_moves);
        expect(normalized.poks).toBe(source.pokedex);
        expect(normalized.custom_moves).toEqual({});
    });
});
