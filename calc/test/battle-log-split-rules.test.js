"use strict";

const rules = require("../../js/fragsheet/battle_log_split_rules.js");

function makeOrder(ids) {
    const order = {};
    ids.forEach((id, index) => {
        order[id] = {
            id,
            prev: index > 0 ? ids[index - 1] : null,
            next: index + 1 < ids.length ? ids[index + 1] : null,
        };
    });
    return order;
}

describe("save-file battle log split rules", function () {
    const progression = rules.getProgressionForTitle("Cascade White");

    test("registers Cascade White's ordered gym trainer IDs", function () {
        expect(progression.gymLeaderTrainerIds).toEqual([
            156, 157, 154, 153, 158, 155, 159, 160,
        ]);
        expect(rules.getProgressionForTitle("Cascade White Dev").gymLeaderTrainerIds)
            .toEqual(progression.gymLeaderTrainerIds);
        expect(rules.getProgressionForTitle("Black 2/White 2")).toBeNull();
    });

    test("uses linked trainer order positions as the primary split source", function () {
        const order = makeOrder([10, 156, 20, 157, 30, 154, 40]);
        expect(rules.assignSplitIndexes(
            [10, 156, 20, 157, 30, 154, 40],
            order,
            progression
        )).toEqual([0, 0, 1, 1, 2, 2, 3]);
    });

    test("infers unknown trainers from the closest previous defeated gym", function () {
        expect(rules.assignSplitIndexes(
            [900, 156, 901, 157, 902, 160, 903],
            {},
            progression
        )).toEqual([0, 0, 1, 1, 2, 7, 8]);
    });

    test("keeps known linked trainers authoritative over save-history inference", function () {
        const order = makeOrder([10, 156, 20]);
        expect(rules.assignSplitIndexes(
            [153, 10, 999],
            order,
            progression
        )).toEqual([3, 0, 4]);
    });

    test("terminates safely on malformed cyclic predecessor links", function () {
        const order = {
            10: { id: 10, prev: 11, next: 11 },
            11: { id: 11, prev: 10, next: 10 },
        };
        expect(rules.assignSplitIndexes([10], order, progression)).toEqual([0]);
    });
});
