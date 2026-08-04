(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.battleLogSplitRules = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    // Add a title here only after its ordered leader trainer IDs are known.
    const CASCADE_WHITE_PROGRESSION = Object.freeze({
        gymLeaderTrainerIds: Object.freeze([156, 157, 154, 153, 158, 155, 159, 160]),
        splitTitles: Object.freeze([
            "Cheren",
            "Roxie",
            "Burgh",
            "Elesa",
            "Clay",
            "Skyla",
            "Drayden",
            "Marlon",
            "Elite 4",
        ]),
    });
    const PROGRESSION_BY_TITLE = Object.freeze({
        "Cascade White": CASCADE_WHITE_PROGRESSION,
        "Cascade White Dev": CASCADE_WHITE_PROGRESSION,
    });

    function getProgressionForTitle(title) {
        return PROGRESSION_BY_TITLE[String(title || "")] || null;
    }

    function getOrderNode(order, trainerId) {
        if (!order || typeof order !== "object") return null;
        const node = order[String(trainerId)] || order[trainerId];
        return node && typeof node === "object" ? node : null;
    }

    function getLinkedOrderSplitIndex(trainerId, order, gymIndexByTrainerId) {
        let node = getOrderNode(order, trainerId);
        if (!node) return null;

        let highestPreviousGymIndex = -1;
        const visited = new Set();
        let previousTrainerId = node.prev;

        while (previousTrainerId !== null && typeof previousTrainerId !== "undefined") {
            const normalizedId = Number(previousTrainerId);
            if (!Number.isInteger(normalizedId) || visited.has(normalizedId)) break;
            visited.add(normalizedId);

            if (gymIndexByTrainerId.has(normalizedId)) {
                highestPreviousGymIndex = Math.max(
                    highestPreviousGymIndex,
                    gymIndexByTrainerId.get(normalizedId)
                );
            }

            node = getOrderNode(order, normalizedId);
            if (!node) break;
            previousTrainerId = node.prev;
        }

        return highestPreviousGymIndex + 1;
    }

    function assignSplitIndexes(trainerIds, order, progression) {
        const ids = Array.isArray(trainerIds) ? trainerIds : [];
        const gymLeaderTrainerIds = progression && Array.isArray(progression.gymLeaderTrainerIds)
            ? progression.gymLeaderTrainerIds.map(Number)
            : [];
        if (!gymLeaderTrainerIds.length) {
            return ids.map(function () { return null; });
        }

        const gymIndexByTrainerId = new Map();
        gymLeaderTrainerIds.forEach(function (trainerId, index) {
            if (Number.isInteger(trainerId)) {
                gymIndexByTrainerId.set(trainerId, index);
            }
        });

        const finalSplitIndex = gymLeaderTrainerIds.length;
        let mostRecentDefeatedGymIndex = -1;

        return ids.map(function (rawTrainerId) {
            const trainerId = Number(rawTrainerId);
            if (!Number.isInteger(trainerId)) {
                return Math.min(mostRecentDefeatedGymIndex + 1, finalSplitIndex);
            }

            const gymIndex = gymIndexByTrainerId.has(trainerId)
                ? gymIndexByTrainerId.get(trainerId)
                : null;
            let splitIndex;

            if (gymIndex !== null) {
                // A leader belongs to the split that culminates in that leader battle.
                splitIndex = gymIndex;
            } else {
                const linkedSplitIndex = getLinkedOrderSplitIndex(
                    trainerId,
                    order,
                    gymIndexByTrainerId
                );
                splitIndex = linkedSplitIndex === null
                    ? mostRecentDefeatedGymIndex + 1
                    : linkedSplitIndex;
            }

            if (gymIndex !== null) {
                mostRecentDefeatedGymIndex = gymIndex;
            }

            return Math.min(Math.max(splitIndex, 0), finalSplitIndex);
        });
    }

    return Object.freeze({
        PROGRESSION_BY_TITLE,
        getProgressionForTitle,
        assignSplitIndexes,
    });
});
