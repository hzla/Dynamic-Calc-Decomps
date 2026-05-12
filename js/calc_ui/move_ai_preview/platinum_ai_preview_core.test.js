const assert = require("assert");
const PlatinumMoveAiPreview = require("./platinum_ai_preview_core.js");

function mon(overrides) {
    return Object.assign({
        moves: [],
        types: ["Normal"],
        ability: "Run Away",
        status: "Healthy",
        originalCurHP: 100,
        stats: { spe: 100 },
        boosts: {},
        maxHP: function() { return 100; }
    }, overrides || {});
}

function evaluate(extra) {
    const moveTable = {
        Tackle: { id: 33, type: "Normal", basePower: 40, category: "Physical", e_id: 0 },
        Thunderbolt: { id: 85, type: "Electric", basePower: 95, category: "Special", e_id: 6 },
        ThunderWave: { id: 86, type: "Electric", basePower: 0, category: "Status", e_id: 67 },
        Explosion: { id: 153, type: "Normal", basePower: 250, category: "Physical", e_id: 7 }
    };

    return PlatinumMoveAiPreview.evaluate(Object.assign({
        attacker: mon({ moves: [{ name: "Tackle" }, { name: "Thunderbolt" }, { name: "ThunderWave" }, { name: "Explosion" }] }),
        defender: mon({ types: ["Water"], originalCurHP: 80, stats: { spe: 70 } }),
        moveTable,
        damageResults: [{ damage: [20] }, { damage: [80] }, { damage: 0 }, { damage: [90] }],
        aiMask: 7,
        options: { branchCap: 2048 }
    }, extra || {}));
}

{
    const result = evaluate();
    const thunderbolt = result.moves.find((move) => move.moveName === "Thunderbolt");
    assert(thunderbolt.probability > 0, "KO-capable high damage move should receive probability");
}

{
    const result = evaluate({
        attacker: mon({ moves: [{ name: "Tackle" }, { name: "Tackle" }, { name: "Tackle" }, { name: "Tackle" }] }),
        damageResults: [{ damage: [20] }, { damage: [20] }, { damage: [20] }, { damage: [20] }],
        aiMask: 1
    });
    result.moves.forEach((move) => assert.strictEqual(move.probability, 0.25, "tied scores split evenly"));
}

{
    const result = evaluate({
        attacker: mon({ moves: [{ name: "ThunderWave" }, null, null, null] }),
        defender: mon({ types: ["Ground"], status: "Healthy" }),
        damageResults: [{ damage: 0 }, { damage: 0 }, { damage: 0 }, { damage: 0 }],
        aiMask: 1
    });
    const thunderWave = result.moves[0];
    assert(thunderWave.outcomes.some((outcome) => outcome.finalScore === 90), "Basic should penalize ineffective Thunder Wave");
}

console.log("platinum_ai_preview_core tests passed");
