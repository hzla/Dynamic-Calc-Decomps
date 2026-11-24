"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {TYPE_CHART} = require("../data/types");

Object.assign(global, {
    TITLE: "Recipe test",
    settings: {typeChart: 6, damageGen: 5, critGen: 5},
    gameGen: 5,
    typeChart: TYPE_CHART[6],
    pokedex: {},
    FIELD_EFFECTS: {},
    $: () => ({val: () => ""})
});

const calc = require("../index");
const rules = require("../mechanics/pokeweb-rules");
const condition = (value) => ({kind: "weather", value});
const effect = (kind, value, parameters, conditions) => ({kind, value, parameters, conditions});
const rule = (...effects) => ({effects});
const dataset = (overrides = {}) => ({pokewebBattleRules: {
    version: 1,
    names: {abilities: [[74, "Pure Power"], [172, "Refrigerate"], [173, "Test Ability"]],
        items: [[220, "Choice Band"], [640, "Test Vest"], [249, "Charcoal"]]},
    moveData: [[33, "Tackle", 9, 0, [1]], [55, "Water Gun", 8, 0], [420, "Ice Shard", 8, 0],
        [57, "Surf", 8, 0], [89, "Earthquake", 8, 0], [573, "Freeze-Dry", 8, 0], [52, "Ember", 8, 0]],
    ...overrides
}});

function damage(data, {attacker = {}, defender = {}, move = "Tackle", field = {}, target = "Blastoise", bp} = {}) {
    global.backup_data = data;
    const defaults = {item: "", ability: "", moves: [new calc.Move(5, move)]};
    return calc.calculate(5, new calc.Pokemon(5, "Snorlax", {...defaults, ...attacker}),
        new calc.Pokemon(5, target, {...defaults, ...defender}),
        new calc.Move(5, move, {overrides: bp ? {basePower: bp} : undefined}), new calc.Field(field));
}

test("an edited ability replaces its stock modifier and matches an independent doubled-Attack reference", () => {
    const data = dataset({abilities: [[74, rule(effect("attack", 2))]]});
    const options = {attacker: {ability: "Pure Power"}};
    assert.deepEqual(damage(data, options).damage, damage(undefined, options).damage);
    const weaker = dataset({abilities: [[74, rule(effect("attack", 1))]]});
    assert.deepEqual(damage(weaker, options).damage, damage(undefined).damage);
});

test("conversion and its multiplier apply only to eligible moves", () => {
    const data = dataset({abilities: [[172, rule(effect("abilityRecipe:convertType", 3, {moveClass: 0, sourceType: 0, type: 14, scope: 0}))]]});
    const attacker = {ability: "Refrigerate"};
    const similarlyPowered = damage(undefined, {move: "Ice Shard", bp: 150});
    const converted = damage(data, {attacker, bp: 50});
    assert.equal(converted.move.type, "Ice");
    assert.deepEqual(converted.damage, similarlyPowered.damage);
    assert.deepEqual(damage(data, {attacker, move: "Ice Shard"}).damage, damage(undefined, {move: "Ice Shard"}).damage);
});

test("per-effect conditions combine with the holder's own side and field after field cloning", () => {
    const data = dataset({abilities: [[173, {
        conditions: {kind: "group", mode: "any", children: [condition(3), {kind: "fieldEffect", value: 2}]},
        effects: [effect("defense", 2, {}, {kind: "sideEffect", side: "own", value: 4})]
    }]]});
    const defender = {ability: "Test Ability"};
    const own = {isGravity: true, defenderSide: {isTailwind: true}};
    const other = {isGravity: true, attackerSide: {isTailwind: true}};
    assert.deepEqual(damage(data, {defender, field: own}).damage, damage(undefined, {defender: {boosts: {def: 2}}}).damage);
    assert.deepEqual(damage(data, {defender, field: other}).damage, damage(undefined).damage);
});

test("native Choice Band modifier respects Magic Room and explicit move flag IDs", () => {
    const data = dataset({
        abilities: [[173, rule(effect("ability:power", 2, {moveClass: 14}))]],
        items: [[220, rule(effect("native:220", 2))]]
    });
    const attacker = {item: "Choice Band", ability: "Test Ability"};
    assert.deepEqual(damage(data, {attacker, bp: 50}).damage,
        damage(undefined, {attacker: {ability: "Pure Power"}, bp: 100}).damage);
    assert.deepEqual(damage(data, {attacker, bp: 50, field: {isMagicRoom: true}}).damage,
        damage(undefined, {bp: 100}).damage);
    assert.deepEqual(damage(data, {attacker, move: "Ice Shard", bp: 40}).damage,
        damage(undefined, {move: "Ice Shard", bp: 40, attacker: {ability: "Pure Power"}}).damage);
});

test("move power edits, requirements and manual battle history notices", () => {
    const data = dataset({moves: [[33, {
        prerequisites: {kind: "hp", subject: "user", comparison: "lte", percent: 50},
        effects: [effect("power", 2), effect("statStage", 1)]
    }]]});
    const blocked = damage(data);
    assert.equal(blocked.damage, 0);
    assert.match(blocked.fullDesc("%", false), /prevent use/);
    const usable = damage(data, {attacker: {curHP: 40}, bp: 50});
    assert.deepEqual(usable.damage, damage(undefined, {bp: 100}).damage);
    assert.match(usable.fullDesc("%", false), /Manual adjustment/);
    data.pokewebBattleRules = {...data.pokewebBattleRules, moves: [[33, {
        prerequisites: {kind: "ateBerry", subject: "user", value: 1},
        effects: [effect("power", 1)]
    }]]};
    assert.equal(damage(data).rawDesc.pokewebManual.size, 1);
});

test("trainer opening normalizes side direction, hazards and global fields", () => {
    const opening = rules.openingValues({fieldLeft: ["reflect", "lightscreen"], fieldRight: ["tailwind"],
        fieldGlobal: ["gravity", "trickroom", "unknown"], spikesLeft: 2, toxicSpikesRight: 1});
    assert.deepEqual(opening, {global: {gravity: 1, trickroom: 1}, left: {reflect: 1, lightscreen: 1, spikes: 2},
        right: {tailwind: 1, toxicspikes: 1}});
    const field = new calc.Field({isGravity: true, pokeweb: {trickroom: 1},
        attackerSide: {pokeweb: opening.left}, defenderSide: {pokeweb: opening.right}});
    assert.deepEqual(field.clone().swap().attackerSide.pokeweb, opening.right);
    assert.deepEqual(field.clone().pokeweb, {trickroom: 1});
});

test("protection bypass scales damage only when a matching move hits through Protect", () => {
    const data = dataset({abilities: [[173, rule(effect("abilityRecipe:protectBypass", 0.25, {moveClass: 1}))]]});
    const attacker = {ability: "Test Ability"};
    const field = {defenderSide: {isProtected: true}};
    const unprotected = damage(undefined);
    assert.deepEqual(damage(data, {attacker}).damage, unprotected.damage);
    assert.equal(damage(undefined, {field}).damage, 0);
    assert.deepEqual(damage(data, {attacker, field}).damage, unprotected.damage.map(value => Math.floor(value / 4 + 0.49)));
    assert.equal(damage(data, {attacker, field, move: "Water Gun"}).damage, 0);
});

test("field-wide power can come from the opponent and is inverted by a second provider", () => {
    const aura = rule(effect("abilityRecipe:fieldPower", 2, {type: 0, invertedPercent: 50}));
    const inversion = rule(effect("abilityRecipe:auraInvert", 1, {}));
    const data = dataset({abilities: [[173, aura], [172, inversion]]});
    const defender = {ability: "Test Ability"};
    assert.deepEqual(damage(data, {defender, bp: 40}).damage, damage(undefined, {bp: 80}).damage);
    assert.deepEqual(damage(data, {defender, attacker: {ability: "Refrigerate"}, bp: 40}).damage,
        damage(undefined, {bp: 20}).damage);
});

test("move-sequence weather is used for damage without changing the shared field", () => {
    const data = dataset({abilities: [[173, rule(effect("abilityRecipe:moveWeather", 1, {weather: 2}))]]});
    assert.deepEqual(damage(data, {attacker: {ability: "Test Ability"}, move: "Water Gun", field: {weather: "Sun"}}).damage,
        damage(undefined, {move: "Water Gun", field: {weather: "Rain"}}).damage);
});

test("a custom immunity observes configured Mold Breaker bypass", () => {
    const immunity = effect("ability:immunity", 1, {moveClass: 9, type: 4});
    const mod = (bypassable) => dataset({abilities: [[173, rule({...immunity, bypassable})]]});
    const defender = {ability: "Test Ability"};
    const attacker = {ability: "Mold Breaker"};
    const move = "Earthquake";
    assert.equal(damage(mod(true), {defender, move}).damage, 0);
    assert.deepEqual(damage(mod(true), {attacker, defender, move}).damage, damage(undefined, {move}).damage);
    assert.equal(damage(mod(false), {attacker, defender, move}).damage, 0);
});

test("a native type item edit replaces the calculator's baked-in item bonus", () => {
    const data = dataset({items: [[249, rule(effect("itemRecipe:power", 1.5, {type: 9, category: 0}))]]});
    assert.deepEqual(damage(data, {attacker: {item: "Charcoal"}, move: "Ember", bp: 40}).damage,
        damage(undefined, {move: "Ember", bp: 60}).damage);
    assert.deepEqual(damage(data, {attacker: {item: "Charcoal"}, bp: 40}).damage,
        damage(undefined, {bp: 40}).damage);
});

const catalog = require("../mechanics/pokeweb-ability-catalog");
const sync = require("../mechanics/pokeweb-ability-sync");
const template = id => catalog.entries.find(([slot]) => slot === id)[2];

test("every catalog entry resolves its reference and owns only its assigned ROM slot", () => {
    for (const [id, name, recipe] of catalog.entries) {
        const portable = dataset({names: {abilities: [[174, "Renamed " + name]]}, abilities: [[174, recipe]]});
        const compact = dataset({names: portable.pokewebBattleRules.names, abilities: [], abilityTemplates: [[174, id]],
            abilityTemplateCatalog: catalog.fingerprint});
        const expanded = sync.expand(compact);
        assert.deepEqual(expanded, portable, name);
        const snapshot = damage(expanded, {attacker: {ability: "Renamed " + name, pokewebAbilityId: 174}});
        assert.deepEqual(snapshot.damage, damage(portable, {attacker: {ability: "Renamed " + name, pokewebAbilityId: 174}}).damage, name);
        const effectNote = snapshot.rawDesc.pokewebManual;
        assert.ok(!effectNote.size || [...effectNote].every(note => note.startsWith("Renamed " + name + " (") && note.length > name.length + 11), name);
    }
});

test("stale catalogs, missing entries, and collisions fail before replacing the stored dataset", () => {
    const compact = dataset({abilities: [], abilityTemplates: [[173, 174]], abilityTemplateCatalog: catalog.fingerprint});
    for (const overrides of [{abilityTemplateCatalog: "stale"}, {abilityTemplates: [[173, -1]]},
        {abilityTemplates: [[172, 174], [172, 174]]}, {abilities: [[173, rule(effect("attack", 2))]]}]) {
        const invalid = {pokewebBattleRules: {...compact.pokewebBattleRules, ...overrides}};
        const before = JSON.stringify(invalid);
        assert.throws(() => sync.expand(invalid), /catalog|reference/i);
        assert.equal(JSON.stringify(invalid), before);
    }
    const old = dataset();
    assert.equal(sync.expand(old), old);
});

test("a duplicate display name needs an explicit ROM slot and retains its distinct recipe", () => {
    const names = {abilities: [[172, "Twin"], [173, "Twin"]]};
    const data = dataset({names, abilities: [[172, rule(effect("attack", 2))], [173, rule(effect("attack", 0.5))]]});
    const first = damage(data, {attacker: {ability: "Twin", pokewebAbilityId: 172}});
    const second = damage(data, {attacker: {ability: "Twin", pokewebAbilityId: 173}});
    assert.ok(first.range()[0] > second.range()[1]);
    const ambiguous = damage(data, {attacker: {ability: "Twin"}});
    assert.match(ambiguous.fullDesc("%", false), /choose the ability’s ROM slot/);
});

test("Supreme Overlord inherits the existing count and uses the configured bonus and cap", () => {
    const data = dataset({abilities: [[173, rule(effect("abilityRecipe:fallenPower", 25, {cap: 2}))]]});
    const options = {attacker: {ability: "Test Ability", alliesFainted: 5}};
    assert.deepEqual(damage(data, {...options, bp: 40}).damage, damage(undefined, {bp: 60}).damage);
    assert.deepEqual(damage(data, {attacker: {...options.attacker, alliesFainted: 0}, bp: 40}).damage,
        damage(undefined, {bp: 40}).damage);
    assert.equal(rules.abilityControls(rules.active(data), "Test Ability").fainted, true);
});

test("charge and hit stages in one recipe use independent toggles, survive clone, and never accumulate", () => {
    const data = dataset({abilities: [[173, rule(effect("abilityRecipe:windCharge", 2, {type: 10}),
        effect("abilityRecipe:statAction", 2, {activation: 1, stat: 3, scope: 0}))]]});
    const options = {move: "Water Gun", attacker: {ability: "Test Ability", pokewebAbilityActive: {0: true}}};
    assert.deepEqual(damage(data, {...options, bp: 40}).damage, damage(undefined, {move: options.move, bp: 80}).damage);
    options.attacker.pokewebAbilityActive = {1: true};
    const first = damage(data, options), again = damage(data, options);
    assert.deepEqual(first.damage, again.damage);
    assert.deepEqual(first.damage, damage(undefined, {move: options.move, attacker: {boosts: {spa: 2}}}).damage);
    assert.match(first.fullDesc("%", false), /\+2 Sp\. Atk/);
    assert.equal(damage(data, {...options, attacker: {...options.attacker, pokewebAbilitySuppressed: true}}).attacker.boosts.spa, 0);
    assert.equal(damage(data, {...options, attacker: {...options.attacker, boosts: {spa: 5}}}).attacker.boosts.spa, 6);
});

test("checked opponent drops respect prevention and Contrary", () => {
    const stages = effect("abilityRecipe:statAction", -1, {activation: 0, stat: 3, scope: 2});
    const data = dataset({abilities: [[173, rule(stages)]]});
    const attacker = {ability: "Test Ability", pokewebAbilityActive: {0: true}};
    assert.equal(damage(data, {attacker}).defender.boosts.spa, -1);
    assert.equal(damage(data, {attacker, defender: {ability: "Clear Body"}}).defender.boosts.spa, 0);
    assert.equal(damage(data, {attacker, defender: {ability: "Contrary"}}).defender.boosts.spa, 1);
});

test("Parental Bond adds a native-ratio second hit and excludes existing multi-hit or unavailable spread targets", () => {
    const data = dataset({abilities: [[173, template(185)]]});
    const attacker = {ability: "Test Ability"};
    const attack = damage(data, {attacker, bp: 80});
    const baseline = damage(undefined, {bp: 80});
    assert.deepEqual(attack.damage[0], baseline.damage);
    assert.deepEqual(attack.damage[1], baseline.damage.map(value => Math.max(1, Math.floor(value / 4 + 0.49))));
    assert.match(attack.fullDesc("%", false), /extra strike/);
    assert.equal(damage(data, {attacker, move: "Surf", field: {gameType: "Doubles"}}).damage.length, 16);
});

test("Queenly Majesty blocks boosted priority and Liquid Voice keeps its 1x damage", () => {
    const data = dataset({abilities: [[172, template(204)], [173, template(214)]]});
    data.pokewebBattleRules.moveData.push([98,"Quick Attack",9,0], [304,"Hyper Voice",264,0]);
    assert.equal(damage(data, {move: "Quick Attack", defender: {ability: "Test Ability"}}).damage, 0);
    const voice = damage(data, {move: "Hyper Voice", attacker: {ability: "Refrigerate"}, bp: 80});
    assert.equal(voice.move.type, "Water");
    assert.deepEqual(voice.damage, damage(undefined, {move: "Water Gun", bp: 80}).damage);
});

test("stock Intimidate respects ROM stage guards and copied Simple still doubles a drop", () => {
    const attacker = {ability: "Intimidate", abilityOn: true};
    const defender = {ability: "Test Ability"};
    const guardDog = dataset({abilities: [[173, template(275)]]});
    assert.match(damage(guardDog, {attacker, defender}).fullDesc("%", false), /Test Ability: Blastoise \+1 Atk/);
    const guard = dataset({abilities: [[173, rule(effect("abilityRecipe:abilityStatGuard", 1, {stat: 8}))]]});
    assert.deepEqual(damage(guard, {attacker: defender, defender: attacker}).damage, damage(undefined).damage);
    const simple = dataset({abilities: [[173, rule(effect("nativeAbility:86", -1))]]});
    assert.match(damage(simple, {attacker, defender}).fullDesc("%", false), /Intimidate: Blastoise -2 Atk/);
});

test("a renamed native ability retains stock behavior while using the ROM display name", () => {
    const data = dataset({names: {abilities: [[74, "Double Strength"]]}, stockAbilityAliases: [[74, "Pure Power"]]});
    const renamed = damage(data, {attacker: {ability: "Double Strength", pokewebAbilityId: 74}});
    assert.deepEqual(renamed.damage, damage(undefined, {attacker: {ability: "Pure Power"}}).damage);
    assert.equal(renamed.attacker.ability, "Double Strength");
});

test("every shipped template applies an expected matchup result or reports the missing input", () => {
    const covered = new Set();
    const rows = [
        [33, "Tackle", 9, 0], [55, "Water Gun", 8, 2], [52, "Ember", 8, 4], [44, "Bite", 9, 1],
        [89, "Earthquake", 8, 0], [420, "Ice Shard", 8, 0], [314, "Air Cutter", 8, 40], [304, "Hyper Voice", 264, 0],
        [105, "Recover", 4096, 64], [430, "Flash Cannon", 8, 0], [85, "Thunderbolt", 8, 0],
        [337, "Dragon Claw", 9, 8], [157, "Rock Slide", 8, 0], [399, "Dark Pulse", 8, 2],
        [583, "Play Rough", 9, 0], [311, "Weather Ball", 8, 4], [45, "Growl", 264, 0]
    ];
    function snapshot(id, side, options = {}, extra = {}) {
        covered.add(id);
        return damage(dataset({moveData: rows, abilities: [[173, template(id)], ...(extra.abilities || [])],
            names: {abilities: [[173, "Test Ability"], ...(extra.names || [])]}}), {
            ...options, [side]: {ability: "Test Ability", ...options[side]}
        });
    }
    const max = result => result.range()[1];
    const activated = {pokewebAbilityActive: {0: true}};
    const neutral = damage(undefined, {bp: 60});
    const manual = [
        [[165, 166, 175, 257], /status prevention or curing/],
        [[167, 299], /set the HP after healing/],
        [[170, 180], /select the held item after the transfer/],
        [[212], /immunity affects infliction/],
        [[215], /set the HP after retaliation/],
        [[217, 249], /ally damage requires the ally’s matchup/],
        [[239], /redirection needs the other active targets/],
        [[240, 290], /apply the copied or reflected stage changes/],
        [[253], /counters depend on subsequent turns/],
        [[261, 294], /enter the ally’s copied or cleared stages|enter the ally's copied or cleared stages/],
        [[272], /burn prevention or curing/],
        [[295], /set the hazards created by a previous hit/],
        [[305], /status inflicted by a previous action/],
        [[310], /condition caused by a previous action/]
    ];
    for (const [ids, reason] of manual) for (const id of ids) {
        const result = snapshot(id, "attacker", {field: {gameType: "Doubles"}});
        assert.match([...result.rawDesc.pokewebManual].join("\n"), reason, String(id));
    }
    for (const id of [168, 236]) {
        assert.deepEqual(snapshot(id, "attacker", {attacker: activated, move: "Thunderbolt"}).attacker.types, ["Electric"]);
    }
    assert.deepEqual(snapshot(169, "defender", {bp: 60}).damage,
        damage(undefined, {bp: 60, defender: {boosts: {def: 2}}}).damage);
    for (const [id, move] of [[171, "Ember"], [214, "Ice Shard"], [219, "Ice Shard"], [273, "Ember"],
        [274, "Air Cutter"], [283, "Growl"], [296, "Ice Shard"], [297, "Earthquake"]]) {
        assert.equal(snapshot(id, "defender", {move}).damage, 0, String(id));
        assert.match(snapshot(id, "defender", {move}).rawDesc.pokewebBlocked, /blocks this move/, String(id));
    }
    for (const [id, move, ratio] of [[173, "Bite", 1.5], [178, "Dark Pulse", 1.5], [181, "Tackle", 1.3],
        [186, "Dark Pulse", 4 / 3], [187, "Play Rough", 4 / 3], [244, "Hyper Voice", 1.3],
        [292, "Dragon Claw", 1.5], [293, "Tackle", 1.5], [277, "Thunderbolt", 2]]) {
        assert.deepEqual(snapshot(id, "attacker", {move, bp: 60, attacker: {...activated, alliesFainted: 5}}).damage,
            damage(undefined, {move, bp: 60 * ratio}).damage, String(id));
    }
    for (const [id, move, stat, stages] of [[199, "Water Gun", "spa", 2], [200, "Flash Cannon", "spa", 1],
        [252, "Flash Cannon", "spa", 1], [263, "Dragon Claw", "atk", 1], [276, "Rock Slide", "atk", 1],
        [198, "Tackle", "atk", 2]]) {
        const actual = snapshot(id, "attacker", {move, bp: 60, attacker: activated});
        const expected = id === 252 ? damage(undefined, {move, bp: 90}) :
            damage(undefined, {move, bp: 60, attacker: {boosts: {[stat]: stages}}});
        assert.deepEqual(actual.damage, expected.damage, String(id));
    }
    const transistor = snapshot(262, "attacker", {move: "Thunderbolt"});
    assert.ok(max(transistor) > max(damage(undefined, {move: "Thunderbolt"})));
    for (const [id, type, move] of [[174, "Ice"], [182, "Fairy"], [184, "Flying"], [206, "Electric"], [204, "Water", "Hyper Voice"]]) {
        assert.equal(snapshot(id, "attacker", {move}).move.type, type, String(id));
        assert.equal(snapshot(id, "attacker", {move: "Ember"}).move.type, "Fire", String(id));
    }
    for (const [id, move, priority] of [[177, "Air Cutter", 1], [205, "Recover", 3]]) {
        assert.equal(snapshot(id, "attacker", {move}).move.priority, priority, String(id));
        assert.equal(snapshot(id, "attacker").move.priority, 0, String(id));
    }
    for (const [id, side, stat, stage] of [[172, "attacker", "spa", 2], [192, "defender", "def", 1],
        [195, "defender", "def", 2], [201, "attacker", "spa", 1], [220, "attacker", "spa", 1],
        [224, "attacker", "hp", 0], [234, "attacker", "atk", 1], [235, "defender", "def", 1],
        [243, "attacker", "spe", 6], [264, "attacker", "atk", 1], [265, "attacker", "spa", 1],
        [270, "attacker", "atk", 1], [271, "attacker", "spd", -1], [306, "attacker", "evasion", -1]]) {
        const result = snapshot(id, side, {[side]: activated});
        if (id === 224) assert.equal(Object.values(result.attacker.boosts).reduce((a, b) => a + b, 0), 1);
        else assert.equal(result[id === 306 ? "defender" : side].boosts[stat], stage, String(id));
    }
    for (const [id, side] of [[183, "defender"], [221, "defender"], [238, "defender"]]) {
        assert.equal(snapshot(id, side, {[side]: activated}).attacker.boosts.spe, -1, String(id));
    }
    assert.equal(snapshot(185, "attacker").damage.length, 2);
    assert.deepEqual(snapshot(188, "defender", {move: "Dark Pulse", bp: 60, attacker: {ability: "Aura"}}, {
        abilities: [[172, template(186)]], names: [[172, "Aura"]]
    }).damage, damage(undefined, {move: "Dark Pulse", bp: 45}).damage);
    assert.ok(max(snapshot(196, "attacker", {defender: {status: "psn"}})) > max(damage(undefined, {defender: {status: "psn"}})));
    assert.equal(snapshot(202, "attacker", {field: {weather: "Hail"}}).attacker.stats.spe, neutral.attacker.stats.spe * 2);
    assert.ok(max(snapshot(218, "defender", {bp: 60})) < max(neutral));
    assert.ok(max(snapshot(218, "defender", {move: "Ember"})) > max(damage(undefined, {move: "Ember"})));
    const intim = {ability: "Intimidate", abilityOn: true};
    assert.equal(snapshot(230, "defender", {attacker: intim}).defender.boosts.atk, 0);
    assert.equal(snapshot(275, "defender", {attacker: intim}).defender.boosts.atk, 1);
    assert.ok(max(snapshot(231, "defender", {bp: 60})) < max(neutral));
    assert.ok(max(snapshot(232, "defender", {move: "Thunderbolt"})) < max(damage(undefined, {move: "Thunderbolt"})));
    assert.ok(max(snapshot(233, "attacker", {move: "Thunderbolt"})) > max(damage(undefined, {move: "Thunderbolt"})));
    assert.equal(snapshot(245, "attacker", {attacker: activated}).field.weather, "Sand");
    assert.ok(max(snapshot(246, "defender", {move: "Thunderbolt"})) < max(damage(undefined, {move: "Thunderbolt"})));
    assert.deepEqual(snapshot(251, "defender", {bp: 60, defender: activated, field: {defenderSide: {isReflect: true}}}).damage, neutral.damage);
    for (const [id, scale] of [[260, 1], [1000, .25]]) {
        assert.deepEqual(snapshot(id, "attacker", {bp: 60, field: {defenderSide: {isProtected: true}}}).damage,
            neutral.damage.map(value => Math.floor(value * scale + .499)), String(id));
    }
    for (const [id, side, move, direction] of [[284, "defender", "Thunderbolt", -1], [285, "attacker", "Tackle", 1],
        [286, "defender", "Tackle", -1], [287, "attacker", "Thunderbolt", 1]]) {
        assert.equal(Math.sign(max(snapshot(id, side, {move})) - max(damage(undefined, {move}))), direction, String(id));
    }
    assert.ok(max(snapshot(288, "attacker", {bp: 60, attacker: activated})) > max(neutral));
    assert.ok(max(snapshot(300, "attacker", {target: "Gengar"})) > 0);
    assert.ok(max(snapshot(308, "defender", {bp: 60})) < max(neutral));
    for (const [id, weather, type] of [[1001, "Sun", "Fire"], [1002, "Rain", "Water"], [1003, "Hail", "Ice"], [1004, "Sand", "Rock"]]) {
        const result = snapshot(id, "attacker", {move: "Weather Ball"});
        assert.equal(result.move.type, type, String(id));
        assert.deepEqual(result.damage, damage(undefined, {move: "Weather Ball", field: {weather}}).damage, String(id));
        assert.equal(result.field.weather, undefined, String(id));
    }
    assert.deepEqual([...covered].sort((a, b) => a - b), catalog.entries.map(([id]) => id));
});

test("copied native Adaptability and Unaware keep their calculation stages", () => {
    const adaptability = dataset({abilities: [[173, rule(effect("nativeAbility:91", -1, {stab: 2}))]]});
    assert.deepEqual(damage(adaptability, {attacker: {ability: "Test Ability"}}).damage,
        damage(undefined, {attacker: {ability: "Adaptability"}}).damage);
    const unaware = dataset({abilities: [[173, rule(effect("nativeAbility:109", -1))]]});
    const boosted = {boosts: {atk: 4}};
    assert.deepEqual(damage(unaware, {attacker: boosted, defender: {ability: "Test Ability"}}).damage,
        damage(undefined).damage);
    const edited = dataset({abilities: [[173, rule(effect("nativeAbility:91", -1, {stab: 2.5}))]]});
    assert.ok(damage(edited, {attacker: {ability: "Test Ability"}}).range()[1] >
        damage(adaptability, {attacker: {ability: "Test Ability"}}).range()[1]);
});
