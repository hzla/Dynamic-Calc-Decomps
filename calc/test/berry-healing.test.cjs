"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { NATURES } = require('../data/natures');

const source = fs.readFileSync(path.resolve(__dirname, '../../js/shared_controls.js'), 'utf8');
const berryHelpers = source.slice(source.indexOf('function getBerryHealingGenNum()'), source.indexOf('function getChipDamageEntries('));
const berries = ['Figy Berry', 'Wiki Berry', 'Mago Berry', 'Aguav Berry', 'Iapapa Berry'];

function fixture(generation = 8, title = 'HG Engine') {
    const sides = {
        p1: { id: 'p1', item: 'Figy Berry', nature: 'Hardy', ability: '', itemActive: true },
        p2: { id: 'p2', item: 'Sitrus Berry', nature: 'Hardy', ability: '', itemActive: true }
    };
    const context = {
        gameGen: generation, TITLE: title, calc: { NATURES },
        getChipDamageGenNum: () => generation,
        getPokeInfoItem: poke => poke.itemActive ? poke.item : '',
        getPokeInfoAbility: poke => poke.ability,
        pokeInfoHasAbility: (poke, ability) => poke.ability === ability,
        $: poke => {
            if (typeof poke === 'string') return sides[poke.slice(1)];
            return { attr: name => poke[name], find: name => ({ val: () => poke[name.slice(1)] }) };
        }
    };
    vm.createContext(context);
    vm.runInContext(berryHelpers, context);
    return {
        sides, context,
        entry: (maxHp = 301, side = 'p1') => context.getBerryHealingEntry(sides[side], maxHp)
    };
}

for (const generation of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    test(`generation ${generation}: Sitrus and all five flavor berries use the specified recovery`, () => {
        const { sides, entry } = fixture(generation);
        sides.p1.item = 'Sitrus Berry';
        if (generation < 4) assert.equal(entry(), null);
        else assert.equal(entry().text, '+75');
        for (const berry of berries) {
            sides.p1.item = berry;
            if (generation < 3) assert.equal(entry(), null);
            else {
                const amount = generation <= 6 ? 37 : 100;
                assert.equal(entry().text, `+${amount}`);
                assert.equal(entry().damage, amount);
                assert.equal(entry().kind, 'berry-healing');
                assert.match(entry().label, new RegExp(berry));
                assert.doesNotMatch(entry().text, /per turn/);
            }
        }
    });
}

for (const title of ['Photonic Sun/Prismatic Moon', 'Photonic Sun Rebalanced']) {
    test(`${title}: all flavor berries restore half HP`, () => {
        const { sides, entry, context } = fixture(7, title);
        for (const berry of berries) {
            sides.p1.item = berry;
            assert.equal(entry().text, '+150');
        }
        sides.p1.item = 'Sitrus Berry';
        assert.equal(entry().text, '+75');
        assert.equal(context.getChipDamageGenNum(), 7);
    });
}

const dislikedNatures = {
    'Figy Berry': ['Bold', 'Modest', 'Calm', 'Timid'],
    'Wiki Berry': ['Adamant', 'Impish', 'Careful', 'Jolly'],
    'Mago Berry': ['Brave', 'Relaxed', 'Quiet', 'Sassy'],
    'Aguav Berry': ['Naughty', 'Lax', 'Rash', 'Naive'],
    'Iapapa Berry': ['Lonely', 'Mild', 'Gentle', 'Hasty']
};
for (const berry of berries) {
    test(`${berry}: warns for exactly its four disliked natures, including no neutral natures`, () => {
        const { sides, entry } = fixture();
        sides.p1.item = berry;
        for (const nature of Object.keys(NATURES)) {
            sides.p1.nature = nature;
            const confuses = dislikedNatures[berry].includes(nature);
            assert.equal(entry().text, `+100${confuses ? ' + ??' : ''}`, nature);
            assert.equal(entry().label.includes('causes confusion'), confuses, nature);
        }
    });
}

test('Ripen doubles the rounded recovery, and Own Tempo prevents confusion on either side', () => {
    const { sides, entry } = fixture();
    for (const side of ['p1', 'p2']) {
        sides[side].nature = 'Timid';
        sides[side].item = 'Figy Berry';
        sides[side].ability = 'Ripen';
        assert.equal(entry(302, side).text, '+200 + ??');
        assert.match(entry(302, side).label, /Ripen doubles recovery/);
        sides[side].item = 'Sitrus Berry';
        assert.equal(entry(302, side).text, '+150');
        sides[side].item = 'Figy Berry';
        sides[side].ability = 'Own Tempo';
        assert.equal(entry(302, side).text, '+100');
        assert.match(entry(302, side).label, /Own Tempo prevents confusion/);
        sides[side].ability = '';
    }
});

test('opposing Neutralizing Gas suppresses berry-related abilities on either side', () => {
    const { sides, entry } = fixture();
    for (const side of ['p1', 'p2']) {
        const opponent = side === 'p1' ? 'p2' : 'p1';
        sides[side].item = 'Figy Berry';
        sides[side].nature = 'Timid';
        sides[side].ability = 'Own Tempo';
        sides[opponent].ability = 'Neutralizing Gas';
        assert.equal(entry(302, side).text, '+100 + ??');
        sides[side].ability = 'Ripen';
        assert.equal(entry(302, side).text, '+100 + ??');
        sides[side].ability = sides[opponent].ability = '';
    }
});

test('recovery is informational, rounds down to a minimum of 1, and respects the item toggle', () => {
    const { sides, entry } = fixture();
    assert.equal(entry(1).text, '+1');
    assert.equal(entry(2).text, '+1');
    assert.equal(entry(0), null);
    for (const hp of [0, 1, 300, 301]) {
        sides.p1.currentHp = hp;
        assert.equal(entry().text, '+100');
        assert.equal(sides.p1.currentHp, hp);
    }
    sides.p1.itemActive = false;
    assert.equal(entry(), null);
    sides.p1.itemActive = true;
    for (const item of ['Oran Berry', 'Berry Juice', 'Leftovers', 'Black Sludge', '']) {
        sides.p1.item = item;
        assert.equal(entry(), null);
    }
});
