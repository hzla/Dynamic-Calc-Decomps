"use strict";

if (typeof global.settings === "undefined") {
    global.settings = { type_chart: 6, typeChart: 6 };
}

var helper_1 = require("./helper");
var types_1 = require("../data/types");

var DEFAULT_SETTINGS = {
    type_chart: 6,
    typeChart: 6,
    damageGen: 5,
    critGen: 5,
    challengeMode: false,
    switchIn: 0,
    levelCaps: [],
    challengeExceptionListPresent: false
};

function withGlobals(title, overrides, fn) {
    var prev = {
        TITLE: global.TITLE,
        settings: global.settings,
        gameGen: global.gameGen,
        typeChart: global.typeChart,
        FIELD_EFFECTS: global.FIELD_EFFECTS,
        pokedex: global.pokedex,
        get_current_in: global.get_current_in,
        $: global.$,
        params: global.params
    };
    var settings = Object.assign({}, DEFAULT_SETTINGS, (overrides && overrides.settings) || {});
    var hasParamsOverride = overrides && Object.prototype.hasOwnProperty.call(overrides, 'params');
    global.TITLE = title;
    global.settings = settings;
    global.gameGen = settings.damageGen || 6;
    global.typeChart = types_1.TYPE_CHART[settings.typeChart];
    global.FIELD_EFFECTS = (overrides && overrides.fieldEffects) || {};
    global.pokedex = (overrides && overrides.pokedex) || {};
    global.get_current_in = (overrides && overrides.get_current_in) || function () { return null; };
    global.$ = (overrides && overrides.$) || function () { return ({ value: "" }); };
    global.params = hasParamsOverride ? overrides.params : undefined;
    try {
        return fn();
    }
    finally {
        global.TITLE = prev.TITLE;
        global.settings = prev.settings;
        global.gameGen = prev.gameGen;
        global.typeChart = prev.typeChart;
        global.FIELD_EFFECTS = prev.FIELD_EFFECTS;
        global.pokedex = prev.pokedex;
        global.get_current_in = prev.get_current_in;
        global.$ = prev.$;
        if (typeof prev.params === "undefined") {
            delete global.params;
        }
        else {
            global.params = prev.params;
        }
    }
}

function calcResult(ctx, title, spec, overrides) {
    return withGlobals(title, overrides, function () {
        var attacker = spec.attacker(ctx);
        var defender = spec.defender(ctx);
        var move = spec.move(ctx);
        var field = spec.field ? spec.field(ctx) : ctx.Field({});
        return ctx.calculate(attacker, defender, move, field);
    });
}

function expectRatio(result, baseline, expected, tol) {
    if (tol === void 0) { tol = 0.02; }
    var rDamage = result.damage;
    var bDamage = baseline.damage;
    if (Array.isArray(rDamage) && Array.isArray(bDamage)) {
        var ratios = [];
        for (var i = 0; i < rDamage.length; i++) {
            var bVal = bDamage[i];
            if (bVal > 0) {
                ratios.push(rDamage[i] / bVal);
            }
        }
        if (!ratios.length) {
            throw new Error('Baseline damage is zero; ratio check invalid.');
        }
        var avgRatio = ratios.reduce(function (sum, val) { return sum + val; }, 0) / ratios.length;
        expect(Math.abs(avgRatio - expected)).toBeLessThanOrEqual(tol);
        return;
    }
    var _a = result.range(), rMin = _a[0], rMax = _a[1];
    var _b = baseline.range(), bMin = _b[0], bMax = _b[1];
    if (bMin === 0 || bMax === 0) {
        throw new Error('Baseline damage is zero; ratio check invalid.');
    }
    var minRatio = rMin / bMin;
    var maxRatio = rMax / bMax;
    expect(Math.abs(minRatio - expected)).toBeLessThanOrEqual(tol);
    expect(Math.abs(maxRatio - expected)).toBeLessThanOrEqual(tol);
}

function expectZero(result) {
    var _a = result.range(), min = _a[0], max = _a[1];
    expect(min).toBe(0);
    expect(max).toBe(0);
}

function expectNonZero(result) {
    var _a = result.range(), _min = _a[0], max = _a[1];
    expect(max).toBeGreaterThan(0);
}

function logDamage(label, result) {
    console.log(label, result.damage);
}

function expectModifier(ctx, title, withSpec, baseSpec, expected, overrides, tol) {
    var withRes = calcResult(ctx, title, withSpec, overrides);
    var baseRes = calcResult(ctx, title, baseSpec, overrides);
    expectRatio(withRes, baseRes, expected, tol);
}

function P(ctx, name, options) {
    if (options === void 0) { options = {}; }
    var merged = Object.assign({ ability: 'No Ability', item: '', abilityOn: true, level: 100, nature: 'Serious', moves: ['Giga Impact'] }, options);
    var moveList = merged.moves || ['Giga Impact'];
    var pokemonMoves = moveList.map(function (moveName) {
        if (typeof moveName === 'string') {
            return ctx.Move(moveName, { ability: merged.ability, item: merged.item });
        }
        return moveName;
    });
    merged.moves = pokemonMoves;
    return ctx.Pokemon(name, merged);
}

function M(ctx, name, options) {
    if (options === void 0) { options = {}; }
    return ctx.Move(name, options);
}

function F(ctx, options) {
    if (options === void 0) { options = {}; }
    return ctx.Field(options);
}

describe('Cascade gen56 damage modifiers', function () {
    (0, helper_1.inGen)(6, function (_a) {
        var gen = _a.gen, calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { gen: gen, calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test('Inner Focus lets Psychic hit Dark', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Inner Focus' }); },
                defender: function (c) { return P(c, 'Umbreon'); },
                move: function (c) { return M(c, 'Psychic'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Gen 5 Challenge Mode uses loaded set level diff for damage level', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew', { level: 20, evs: { atk: 0 } }); },
                defender: function (c) { return P(c, 'Mew', { level: 20, evs: { hp: 0, def: 0 } }); },
                move: function (c) { return M(c, 'Tackle'); }
            };
            var baseRes = calcResult(ctx, 'Aether White 2', spec);
            var challengeRes = calcResult(ctx, 'Aether White 2', spec, {
                settings: { challengeMode: true },
                get_current_in: function () { return { level: 20, diff: 5, noCh: false }; },
                $: function () { return [{}, {}, {}, { value: 'Mew (Lvl 20 Trainer)' }]; }
            });
            expect(challengeRes.range()[0]).toBeGreaterThan(baseRes.range()[0]);
        });

        test('Gen 5 Challenge Mode accepts zero loaded set level diff', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew', { level: 20, evs: { atk: 0 } }); },
                defender: function (c) { return P(c, 'Mew', { level: 20, evs: { hp: 0, def: 0 } }); },
                move: function (c) { return M(c, 'Tackle'); }
            };
            var baseRes = calcResult(ctx, 'Wishy Washy White 2', spec);
            var challengeRes = calcResult(ctx, 'Wishy Washy White 2', spec, {
                settings: { challengeMode: true },
                get_current_in: function () { return { level: 20, diff: 0, noCh: false }; },
                $: function () { return [{}, {}, {}, { value: 'Mew (Lvl 20 Trainer)' }]; }
            });
            expect(challengeRes.damage).toEqual(baseRes.damage);
        });

        test('Chip Away neutralizes -ate type immunities', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Galvanize' }); },
                defender: function (c) { return P(c, 'Golem'); },
                move: function (c) { return M(c, 'Chip Away'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Sacred Sword hits Ghost in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Gengar'); },
                move: function (c) { return M(c, 'Sacred Sword'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Relic Song hits Ghost in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Gengar'); },
                move: function (c) { return M(c, 'Relic Song'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Sky Uppercut is super-effective vs Flying in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Pidgeot'); },
                move: function (c) { return M(c, 'Sky Uppercut'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectRatio(cascRes, baseRes, 4.0);
        });

        test('Field effect chargestone lets Electric hit Ground', function () {
            var overrides = { fieldEffects: { chargestone: true } };
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Golem'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec, overrides);
            var cascRes = calcResult(ctx, 'Cascade', spec, overrides);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Field effect celestial lets Ghost hit Normal', function () {
            var overrides = { fieldEffects: { celestial: true } };
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Snorlax'); },
                move: function (c) { return M(c, 'Shadow Ball'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec, overrides);
            var cascRes = calcResult(ctx, 'Cascade', spec, overrides);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Field effect celestial lets Psychic hit Dark', function () {
            var overrides = { fieldEffects: { celestial: true } };
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Umbreon'); },
                move: function (c) { return M(c, 'Psychic'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec, overrides);
            var cascRes = calcResult(ctx, 'Cascade', spec, overrides);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Field effect opelucid lets Fighting hit Ghost', function () {
            var overrides = { fieldEffects: { opelucid: true } };
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Gengar'); },
                move: function (c) { return M(c, 'Brick Break'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec, overrides);
            var cascRes = calcResult(ctx, 'Cascade', spec, overrides);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Field effect opelucid lets Dragon hit Fairy', function () {
            var overrides = { fieldEffects: { opelucid: true } };
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Clefable'); },
                move: function (c) { return M(c, 'Dragon Claw'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec, overrides);
            var cascRes = calcResult(ctx, 'Cascade', spec, overrides);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Electro Ball doubles BP if faster in Cascade', function () {
            var fastSpec = {
                attacker: function (c) { return P(c, 'Mew', { boosts: { spe: 2 } }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); }
            };
            var slowSpec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { boosts: { spe: 2 } }); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); }
            };
            var fastRes = calcResult(ctx, 'Cascade', fastSpec);
            var slowRes = calcResult(ctx, 'Cascade', slowSpec);
            logDamage('Electro Ball fast', fastRes);
            logDamage('Electro Ball slow', slowRes);
            expectRatio(fastRes, slowRes, 2.0, 0.05);
        });

        test('Gyro Ball doubles BP if slower in Cascade', function () {
            var slowSpec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { boosts: { spe: 2 } }); },
                move: function (c) { return M(c, 'Gyro Ball', { basePower: 55 }); }
            };
            var fastSpec = {
                attacker: function (c) { return P(c, 'Mew', { boosts: { spe: 2 } }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Gyro Ball', { basePower: 55 }); }
            };
            var slowRes = calcResult(ctx, 'Cascade', slowSpec);
            var fastRes = calcResult(ctx, 'Cascade', fastSpec);
            expectRatio(slowRes, fastRes, 2.0, 0.05);
        });

        test('Heavy Slam uses fixed BP in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Snorlax'); },
                defender: function (c) { return P(c, 'Joltik'); },
                move: function (c) { return M(c, 'Heavy Slam', { basePower: 80 }); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectRatio(cascRes, baseRes, 80 / 120);
        });

        test('Stored Power boost multiplier is 25 in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew', { boosts: { atk: 2 } }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Stored Power'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectRatio(cascRes, baseRes, 70 / 60);
        });

        test('Sand Force (Sand) multiplier differs in Cascade vs base', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Sand Force' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Earthquake'); },
                field: function (c) { return F(c, { weather: 'Sand' }); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Earthquake'); },
                field: function (c) { return F(c, { weather: 'Sand' }); }
            };
            expectModifier(ctx, 'NONE', withAbility, baseAbility, 1.3);
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.4);
        });

        test('Sand Force (No Sand) is boosted only in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Sand Force' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Earthquake'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Earthquake'); }
            };
            expectModifier(ctx, 'NONE', withAbility, baseAbility, 1.0);
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.2);
        });

        test('Iron Fist multiplier differs in Cascade vs base', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Iron Fist' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Sky Uppercut'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Sky Uppercut'); }
            };
            expectModifier(ctx, 'NONE', withAbility, baseAbility, 1.2, undefined, 0.05);
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.3, undefined, 0.05);
        });

        test('Heatproof multiplier differs in Cascade vs base', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Heatproof' }); },
                move: function (c) { return M(c, 'Flamethrower'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Flamethrower'); }
            };
            expectModifier(ctx, 'NONE', withAbility, baseAbility, 0.5);
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.25);
        });

        test('Slush Rush reduces Ice damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Slush Rush' }); },
                move: function (c) { return M(c, 'Ice Beam'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Ice Beam'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.5);
        });

        test('Swift Swim reduces Water damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Swift Swim' }); },
                move: function (c) { return M(c, 'Surf'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Surf'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.5);
        });

        test('Sand Rush reduces Rock damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Sand Rush' }); },
                move: function (c) { return M(c, 'Stone Edge'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Stone Edge'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.5);
        });

        test('Toxic Boost reduces Poison damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Toxic Boost' }); },
                move: function (c) { return M(c, 'Sludge Bomb'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Sludge Bomb'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.5);
        });

        test('Permafrost reduces Special damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Permafrost' }); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.5);
        });

        test('Justified reduces Dark damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Justified' }); },
                move: function (c) { return M(c, 'Crunch'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Crunch'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.5);
        });

        test('Light Metal currently has no effect in Cascade (hitsPhysical unset)', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Light Metal' }); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.0);
        });

        test('Heavy Metal currently has no effect in Cascade (hitsPhysical unset)', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Heavy Metal' }); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.0);
        });

        test('Solid Rock/Filter reduction differs for 4x in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Dragonite', { ability: 'Filter' }); },
                move: function (c) { return M(c, 'Ice Beam'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Dragonite'); },
                move: function (c) { return M(c, 'Ice Beam'); }
            };
            expectModifier(ctx, 'NONE', withAbility, baseAbility, 0.75);
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.5625);
        });

        test('Merciless (defender) reduces damage when attacker is statused', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { status: 'brn' }); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Merciless' }); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew', { status: 'brn' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.75);
        });

        test('Merciless (attacker) boosts damage when defender is statused', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Merciless' }); },
                defender: function (c) { return P(c, 'Mew', { status: 'brn' }); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { status: 'brn' }); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.25);
        });

        test('Infiltrator boosts super-effective moves in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Infiltrator' }); },
                defender: function (c) { return P(c, 'Charizard'); },
                move: function (c) { return M(c, 'Surf'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Charizard'); },
                move: function (c) { return M(c, 'Surf'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.2);
        });

        test('Mold Breaker/Teravolt/Turboblaze boost damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Mold Breaker' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.1);
        });

        test('Normalize boost applies in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Normalize' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.2);
        });

        test('Normalize neutralizes immunities in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Normalize' }); },
                defender: function (c) { return P(c, 'Gengar'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(baseRes);
            expectNonZero(cascRes);
        });

        test('Ate abilities are 1.3x base, 1.2x in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Aerilate' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'NONE', withAbility, baseAbility, 1.3, undefined, 0.03);
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.2, undefined, 0.03);
        });

        test('Moisturize boosts Normal->Water moves in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Moisturize' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.2);
        });

        test('Hyper Cutter boosts slicing moves in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Hyper Cutter' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Aerial Ace'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Aerial Ace'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.3);
        });

        test('Overgrow boosts Grass moves above 1/3 HP in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Overgrow' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Energy Ball'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Energy Ball'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.25);
        });

        test('Blaze boosts Fire moves above 1/3 HP in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Blaze' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Flamethrower'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Flamethrower'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.25);
        });

        test('Torrent boosts Water moves above 1/3 HP in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Torrent' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Surf'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Surf'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.25);
        });

        test('Swarm boosts Bug moves above 1/3 HP in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Swarm' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Bug Buzz'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Bug Buzz'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.25);
        });

        test('Ballistics boosts bullet moves in Singles', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Snorlax', { ability: 'Ballistics' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Snorlax'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 1.2);
        });

        test('Ballistics boosts bullet moves but becomes spread in Doubles', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Snorlax', { ability: 'Ballistics' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); },
                field: function (c) { return F(c, { gameType: 'Doubles' }); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Snorlax'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); },
                field: function (c) { return F(c, { gameType: 'Doubles' }); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.9);
        });

        test('Colossal reduces damage in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Colossal' }); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 0.75);
        });

        test('Farfetch\u2019d + Stick currently has no effect in Cascade (hitsPhysical unset)', function () {
            var withItem = {
                attacker: function (c) { return P(c, 'Farfetch\u2019d', { item: 'Stick' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseItem = {
                attacker: function (c) { return P(c, 'Farfetch\u2019d'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withItem, baseItem, 1.0);
        });

        test('Eevee + Light Ball doubles damage in Cascade', function () {
            var withItem = {
                attacker: function (c) { return P(c, 'Eevee', { item: 'Light Ball' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseItem = {
                attacker: function (c) { return P(c, 'Eevee'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withItem, baseItem, 2.0, undefined, 0.05);
        });

        test('Dry Skin multiplier differs in Cascade vs base', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Dry Skin' }); },
                move: function (c) { return M(c, 'Flamethrower'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Flamethrower'); }
            };
            expectModifier(ctx, 'NONE', withAbility, baseAbility, 1.25);
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 2.0);
        });

        test('Helping Hand multiplier differs in Cascade vs base', function () {
            var withHH = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); },
                field: function (c) { return F(c, { attackerSide: { isHelpingHand: true } }); }
            };
            var base = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseRes = calcResult(ctx, 'NONE', base);
            var noneRes = calcResult(ctx, 'NONE', withHH);
            var cascRes = calcResult(ctx, 'Cascade', withHH);
            logDamage('Helping Hand base', baseRes);
            logDamage('Helping Hand NONE', noneRes);
            logDamage('Helping Hand Cascade', cascRes);
            expectRatio(noneRes, baseRes, 1.5);
            expectRatio(cascRes, baseRes, 2.0);
        });

        test('Cascade buff flags apply correct ratios', function () {
            var base = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var buffs = [
                { key: 'is10Buff', ratio: 1.10 },
                { key: 'is15Buff', ratio: 1.15 },
                { key: 'is20Buff', ratio: 1.20 },
                { key: 'is25Buff', ratio: 1.25 },
                { key: 'is30Buff', ratio: 1.30 },
                { key: 'is50Buff', ratio: 1.50 }
            ];
            buffs.forEach(function (buff) {
                var withBuff = {
                    attacker: function (c) { return P(c, 'Mew'); },
                    defender: function (c) { return P(c, 'Mew'); },
                    move: function (c) { return M(c, 'Giga Impact'); },
                    field: function (c) {
                        var side = {};
                        side[buff.key] = true;
                        return F(c, { attackerSide: side });
                    }
                };
                var baseRes = calcResult(ctx, 'Cascade', base);
                var buffRes = calcResult(ctx, 'Cascade', withBuff);
                logDamage("Buff ".concat(buff.key, " base"), baseRes);
                logDamage("Buff ".concat(buff.key, " with"), buffRes);
                expectRatio(buffRes, baseRes, buff.ratio);
            });
        });

        test('Hail + Ice defender boosts physical defense in Cascade', function () {
            var withHail = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Glaceon'); },
                move: function (c) { return M(c, 'Giga Impact'); },
                field: function (c) { return F(c, { weather: 'Hail' }); }
            };
            var base = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Glaceon'); },
                move: function (c) { return M(c, 'Giga Impact'); },
                field: function (c) { return F(c, {}); }
            };
            expectModifier(ctx, 'Cascade', withHail, base, 2 / 3);
        });

        test('Explosion always crits in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Explosion'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec, { settings: { critGen: 6 } });
            var cascRes = calcResult(ctx, 'Cascade', spec, { settings: { critGen: 6 } });
            expectRatio(cascRes, baseRes, 1.5);
        });

        test('Final Gambit halves defense for casc2 data', function () {
            var casc2Params = { get: function (key) { return key === 'data' ? 'casc2' : null; } };
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Final Gambit', { basePower: 250, overrides: { type: 'Dark', category: 'Physical' } }); }
            };
            var control = {
                attacker: spec.attacker,
                defender: spec.defender,
                move: function (c) { return M(c, 'Tackle', { basePower: 250, overrides: { type: 'Dark', category: 'Physical' } }); }
            };
            var baseRes = calcResult(ctx, 'Cascade White', control, { params: casc2Params });
            var cascRes = calcResult(ctx, 'Cascade White', spec, { params: casc2Params });
            expectRatio(cascRes, baseRes, 2, 0.11);
        });

        test('Forewarn reduces crit damage in Cascade', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Forewarn' }); },
                move: function (c) { return M(c, 'Psychic', { isCrit: true }); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec, { settings: { critGen: 6 } });
            var cascRes = calcResult(ctx, 'Cascade', spec, { settings: { critGen: 6 } });
            expectRatio(cascRes, baseRes, 0.75);
        });

        test('Defender Rivalry reduces damage vs same type in Cascade', function () {
            var withAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Rivalry' }); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseAbility = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            expectModifier(ctx, 'Cascade', withAbility, baseAbility, 2744 / 4096);
        });

        test('Attacker Rivalry extra Cascade mod applies on shared types', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew', { ability: 'Rivalry', gender: 'N' }); },
                defender: function (c) { return P(c, 'Mew', { gender: 'N' }); },
                move: function (c) { return M(c, 'Giga Impact'); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectRatio(cascRes, baseRes, 5448 / 4096);
        });

        test('Overcoat suppresses weather damage boost in Cascade', function () {
            var withOvercoat = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Overcoat' }); },
                move: function (c) { return M(c, 'Flamethrower'); },
                field: function (c) { return F(c, { weather: 'Sun' }); }
            };
            var baseNoOvercoat = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Flamethrower'); },
                field: function (c) { return F(c, { weather: 'Sun' }); }
            };
            expectModifier(ctx, 'Cascade', withOvercoat, baseNoOvercoat, 2 / 3);
        });

        test('Weather Ball type becomes Normal in Cascade with Overcoat', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Bulbasaur', { ability: 'Overcoat' }); },
                move: function (c) { return M(c, 'Weather Ball'); },
                field: function (c) { return F(c, { weather: 'Sun' }); }
            };
            var baseRes = calcResult(ctx, 'NONE', spec);
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectRatio(cascRes, baseRes, 1 / 3);
        });

        test('Sap Sipper remains an immunity (Cascade branch is unreachable)', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Sap Sipper' }); },
                move: function (c) { return M(c, 'Energy Ball'); }
            };
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(cascRes);
        });

        test('Motor Drive remains an immunity (Cascade branch is unreachable)', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Motor Drive' }); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(cascRes);
        });

        test('Water Absorb remains an immunity (Cascade branch is unreachable)', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Water Absorb' }); },
                move: function (c) { return M(c, 'Surf'); }
            };
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(cascRes);
        });

        test('Flash Fire remains an immunity (Cascade branch is unreachable)', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { ability: 'Flash Fire' }); },
                move: function (c) { return M(c, 'Flamethrower'); }
            };
            var cascRes = calcResult(ctx, 'Cascade', spec);
            expectZero(cascRes);
        });

        test('Casc items: CLRS Booster boosts offensive stats', function () {
            var withItem = {
                attacker: function (c) { return P(c, 'Mew', { item: 'CLRS Booster' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var baseItem = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            expectModifier(ctx, 'Cascade', withItem, baseItem, 1.5);
        });

        test('Casc items: CLRS Armor boosts defensive stats', function () {
            var withItem = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew', { item: 'CLRS Armor' }); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var baseItem = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            expectModifier(ctx, 'Cascade', withItem, baseItem, 2 / 3);
        });

        test('Casc items: CLRS Accelerator can flip Electro Ball damage', function () {
            var withItem = {
                attacker: function (c) { return P(c, 'Mew', { item: 'CLRS Accelerator' }); },
                defender: function (c) { return P(c, 'Jolteon'); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); }
            };
            var baseItem = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Jolteon'); },
                move: function (c) { return M(c, 'Electro Ball', { basePower: 55 }); }
            };
            var baseRes = calcResult(ctx, 'Cascade', baseItem);
            var withRes = calcResult(ctx, 'Cascade', withItem);
            logDamage('CLRS Accelerator base', baseRes);
            logDamage('CLRS Accelerator with', withRes);
            expectRatio(withRes, baseRes, 2.0, 0.03);
        });

        test('Casc items: CLRS Invention boosts offensive stats', function () {
            var withItem = {
                attacker: function (c) { return P(c, 'Mew', { item: 'CLRS Invention' }); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            var baseItem = {
                attacker: function (c) { return P(c, 'Mew'); },
                defender: function (c) { return P(c, 'Mew'); },
                move: function (c) { return M(c, 'Thunderbolt'); }
            };
            expectModifier(ctx, 'Cascade', withItem, baseItem, 1.5);
        });
    });
});

describe('Redux Challenge Mode level fallback', function () {
    (0, helper_1.inGen)(5, function (_a) {
        var gen = _a.gen, calculate = _a.calculate, Pokemon = _a.Pokemon, Move = _a.Move, Field = _a.Field;
        var ctx = { gen: gen, calculate: calculate, Pokemon: Pokemon, Move: Move, Field: Field };

        test('level 12 Cheren Aipom uses +1 formula level instead of generic +4', function () {
            var spec = {
                attacker: function (c) { return P(c, 'Aipom', { level: 12, item: 'Water Gem', evs: { spa: 0 }, ivs: { spa: 31 } }); },
                defender: function (c) { return P(c, 'Magby', { level: 15, evs: { hp: 0, spd: 0 }, ivs: { hp: 4, spd: 15 } }); },
                move: function (c) { return M(c, 'Water Pulse'); }
            };
            var reduxFallbackRes = calcResult(ctx, 'Blaze Black 2/Volt White 2 Redux', spec, {
                settings: { challengeMode: true },
                get_current_in: function () { return { level: 12, noCh: false }; },
                $: function () { return [{}, {}, {}, { value: 'Aipom (Lvl 12 Leader Cheren2)' }]; }
            });
            var explicitDeltaRes = calcResult(ctx, 'Blaze Black 2/Volt White 2 Redux', spec, {
                settings: { challengeMode: true },
                get_current_in: function () { return { level: 12, diff: 1, noCh: false }; },
                $: function () { return [{}, {}, {}, { value: 'Aipom (Lvl 12 Leader Cheren2)' }]; }
            });
            var nonReduxNoDiffRes = calcResult(ctx, 'Aether White 2', spec, {
                settings: { challengeMode: true },
                get_current_in: function () { return { level: 12, noCh: false }; },
                $: function () { return [{}, {}, {}, { value: 'Aipom (Lvl 12 Leader Cheren2)' }]; }
            });
            var noChallengeRes = calcResult(ctx, 'Blaze Black 2/Volt White 2 Redux', spec, {
                settings: { challengeMode: true },
                get_current_in: function () { return { level: 12, diff: 4, noCh: true }; },
                $: function () { return [{}, {}, {}, { value: 'Aipom (Lvl 12 Leader Cheren2)' }]; }
            });
            var disabledRes = calcResult(ctx, 'Blaze Black 2/Volt White 2 Redux', spec, {
                settings: { challengeMode: false },
                get_current_in: function () { return { level: 12, noCh: false }; },
                $: function () { return [{}, {}, {}, { value: 'Aipom (Lvl 12 Leader Cheren2)' }]; }
            });
            expect(reduxFallbackRes.damage).toEqual(explicitDeltaRes.damage);
            expect(reduxFallbackRes.range()).toEqual([18, 22]);
            expect(disabledRes.range()).toEqual([16, 20]);
            expect(nonReduxNoDiffRes.range()).toEqual(disabledRes.range());
            expect(noChallengeRes.range()).toEqual(disabledRes.range());
        });
    });
});
