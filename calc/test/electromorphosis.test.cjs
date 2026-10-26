"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');

global.settings = { type_chart: 6, typeChart: 6 };
const calc = require('../index');
const routes = [
    { title: 'HG Engine' },
    { title: 'Pokemon Null 1.2.5' },
    { title: 'Blank Slate Dev Calc', blankDevMode: true }
];

function withRuntime(route, generation, fn) {
    const globals = {
        TITLE: route.title,
        settings: { type_chart: 6, typeChart: 6, damageGen: generation, critGen: generation,
            blankDevMode: !!route.blankDevMode, challengeMode: false, switchIn: 0 },
        gameGen: generation, typeChart: calc.TYPE_CHART[6], calcingForSwitchIns: false,
        pokedex: {}, backup_moves: {}, FIELD_EFFECTS: {}, localStorage: {}
    };
    const previous = {};
    for (const key of Object.keys(globals)) {
        previous[key] = global[key];
        global[key] = globals[key];
    }
    try { return fn(); }
    finally {
        for (const key of Object.keys(globals)) {
            if (previous[key] === undefined) delete global[key];
            else global[key] = previous[key];
        }
    }
}

function matchup(generation, options = {}) {
    const attacker = new calc.Pokemon(generation, 'Mew', {
        level: 50, nature: 'Serious', ability: 'Electromorphosis', abilityOn: options.active !== false,
        ...options.attacker
    });
    const defender = new calc.Pokemon(generation, options.defenderName || 'Mew', {
        level: 50, nature: 'Serious', ability: 'No Ability', ...options.defender
    });
    const move = new calc.Move(generation, options.move || 'Thunderbolt', {
        overrides: { basePower: 91, ...options.overrides }, ...options.moveOptions
    });
    return calc.calculate(generation, attacker, defender, move, new calc.Field());
}

for (const route of routes) {
    for (const generation of [7, 8]) {
        test(`${route.title}, gen ${generation}: charged Electric attacks use doubled power with Charge rounding`, () => {
            withRuntime(route, generation, () => {
                for (const move of ['Thunderbolt', 'Spark']) {
                    const charged = matchup(generation, { move });
                    const inactive = matchup(generation, { move, active: false });
                    const ordinary = matchup(generation, { move, attacker: { ability: 'No Ability' } });
                    const doublePower = matchup(generation, { move, attacker: { ability: 'No Ability' }, overrides: { basePower: 182 } });
                    assert.deepEqual(charged.damage, doublePower.damage);
                    assert.deepEqual(inactive.damage, ordinary.damage);
                    // This distinguishes Charge's power modifier from doubling final rolls.
                    assert.notDeepEqual(charged.damage, inactive.damage.map(damage => damage * 2));
                    assert.equal(charged.rawDesc.attackerAbility, 'Electromorphosis');
                    assert.equal(charged.rawDesc.moveBP, 182);
                    assert.equal(inactive.rawDesc.attackerAbility, undefined);
                    assert.equal(charged.move.bp, 91);
                }
            });
        });
    }

    test(`${route.title}: non-Electric, status, fixed damage, immunities and defender charge are unaffected`, () => {
        withRuntime(route, 8, () => {
            assert.deepEqual(matchup(8, { move: 'Flamethrower' }).damage,
                matchup(8, { move: 'Flamethrower', active: false }).damage);
            assert.equal(matchup(8, { move: 'Charge' }).damage, 0);
            assert.equal(matchup(8, { move: 'Sonic Boom', overrides: { type: 'Electric' } }).damage, 20);
            assert.deepEqual(matchup(8, { defenderName: 'Garchomp' }).range(), [0, 0]);
            assert.deepEqual(matchup(8, { active: false, defender: { ability: 'Electromorphosis', abilityOn: true } }).damage,
                matchup(8, { active: false }).damage);
            const suppressed = matchup(8, { defender: { ability: 'Neutralizing Gas' } });
            assert.deepEqual(suppressed.damage, matchup(8, { active: false, defender: { ability: 'Neutralizing Gas' } }).damage);
            assert.equal(suppressed.rawDesc.attackerAbility, undefined);
        });
    });

    test(`${route.title}: all hits of one move are charged, but later uses are not`, () => {
        withRuntime(route, 8, () => {
            const chargedHits = matchup(8, { overrides: { multihit: 2 } });
            const doubledHits = matchup(8, { attacker: { ability: 'No Ability' }, overrides: { basePower: 182, multihit: 2 } });
            assert.equal(chargedHits.damage.length, 2);
            assert.deepEqual(chargedHits.damage, doubledHits.damage);

            const repeated = { move: 'Overheat', overrides: { type: 'Electric' }, moveOptions: { timesUsed: 2 } };
            const chargedTurns = matchup(8, repeated);
            const normalTurns = matchup(8, { ...repeated, active: false });
            const doublePowerTurns = matchup(8, { ...repeated, attacker: { ability: 'No Ability' }, overrides: { type: 'Electric', basePower: 182 } });
            if (Array.isArray(chargedTurns.damage[0])) {
                assert.deepEqual(chargedTurns.damage[0], doublePowerTurns.damage[0]);
                assert.deepEqual(chargedTurns.damage[1], normalTurns.damage[1]);
            } else {
                // The vanilla route aggregates turns into one distribution.
                const first = matchup(8, { ...repeated, moveOptions: { timesUsed: 1 } });
                const unchargedFirst = matchup(8, { ...repeated, moveOptions: { timesUsed: 1 }, active: false });
                assert.deepEqual(chargedTurns.damage, first.damage.map((damage, i) => damage + normalTurns.damage[i] - unchargedFirst.damage[i]));
            }
        });
    });
}

test('the Electromorphosis modifier does not change gen 4 calculations', () => {
    withRuntime(routes[0], 4, () => {
        assert.deepEqual(matchup(4).damage, matchup(4, { active: false }).damage);
    });
});
