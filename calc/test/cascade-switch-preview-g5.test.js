"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { TYPE_CHART } = require("../data/types");

const previewSource = fs.readFileSync(path.join(__dirname, "../../js/calc_ui/switch_preview/g5.js"), "utf8");
const utilitySource = fs.readFileSync(path.join(__dirname, "../../js/calc_ui/utility_functions.js"), "utf8");

function makeMove(name, bp, type) {
    return {
        name, bp, type, flags: {}, isCrit: false,
        named(...names) { return names.includes(name); },
        hasType(moveType) { return type === moveType; }
    };
}

function makePokemon(ability, moves) {
    return {
        ability, item: "", level: 62, stats: { spe: 153 }, moves,
        hasAbility(...names) { return names.includes(this.ability); },
        hasItem(...names) { return names.includes(this.item); },
        curHP() { return this.hp === undefined ? 100 : this.hp; },
        maxHP() { return this.maxHp || 100; }
    };
}

function previewScores(flags, leafeonAbility = "Tinted Lens") {
    const player = {
        item: "", level: 62, stats: { spe: 154 }, moves: [],
        hasItem() { return false; }
    };
    const roserade = makePokemon("Majesty", [makeMove("Hyper Beam", 160, "Normal")]);
    const leafeon = makePokemon(leafeonAbility, [makeMove("Frenzy Plant", 150, "Grass")]);
    const context = {
        TITLE: "Cascade White Dev",
        settings: { customCascadeSwitchAI: !!flags.cascAI, customCascadeSwitchAIG4: !!flags.cascAIG4, critGen: 5 },
        CURRENT_TRAINER_POKS: ["Roserade (Gardenia)[4]", "Leafeon (Gardenia)[3]"],
        pokedex: { Roserade: { types: ["Grass", "Poison"] }, Leafeon: { types: ["Grass"] } },
        SETDEX_BW: {
            Roserade: { Gardenia: { moves: ["Hyper Beam"], item: "", ability: "Majesty" } },
            Leafeon: { Gardenia: { moves: ["Frenzy Plant"], item: "", ability: leafeonAbility } }
        },
        moves: { "Hyper Beam": {}, "Frenzy Plant": {} },
        expYields: {},
        cleanString: name => name,
        createPokemon: name => typeof name !== "string" ? player : name.startsWith("Roserade") ? roserade : leafeon,
        get_type_info: types => types[0] === "Bug"
            ? { Normal: 1, Grass: 0.25 }
            : { Bug: 1, Flying: 2 },
        sort_trpoks: (a, b) => b[1] - a[1],
        sort_subindex: (a, b) => Number(a[3]) - Number(b[3]),
        console: { log() {} },
        $: selector => ({
            first() { return this; },
            val() { return ({ ".type1": "Bug", ".type2": "Flying", "#abilityL1": "", "#statusL1": "Healthy" })[selector] || ""; },
            find(query) { return query === "input:checked" ? [] : { val: () => "100" }; }
        })
    };
    vm.runInNewContext(previewSource, context);
    return Object.fromEntries(context.get_next_in_g5().map(row => [row[0].split(" (")[0], { power: row[1], move: row[2] }]));
}

test("cascAIG4 keeps the ordinary Cascade phase 2 move powers", () => {
    for (const cascAIG4 of [false, true]) {
        const scores = previewScores({ cascAIG4 });
        assert.deepEqual(scores.Roserade, { power: 160, move: "Hyper Beam" });
        assert.deepEqual(scores.Leafeon, { power: 112, move: "Frenzy Plant" });
    }
});

test("Tinted Lens doubles a quarter-effective phase 2 move once", () => {
    assert.equal(previewScores({ cascAIG4: true }, "None").Leafeon.power, 56);
    assert.equal(previewScores({ cascAIG4: true }, "Tinted Lens").Leafeon.power, 112);
});

test("the optional cascAI modifier is excluded from the game-faithful G4 scorer", () => {
    assert.equal(previewScores({ cascAI: true }).Roserade.power, 120);
    assert.equal(previewScores({ cascAI: true, cascAIG4: true }).Roserade.power, 160);
});

function erikaPhase1Rankings(cherrimAbility, weather) {
    const cherrim = makePokemon(cherrimAbility, [
        makeMove("Seed Bomb", 80, "Grass"), makeMove("Fire Lash", 80, "Fire"),
        makeMove("Slam", 105, "Normal"), makeMove("Quick Attack", 50, "Normal")
    ]);
    const nidoqueen = makePokemon("Sheer Force", [
        makeMove("Sludge Bomb", 90, "Poison"), makeMove("Earth Power", 90, "Ground"),
        makeMove("Flamethrower", 90, "Fire"), makeMove("Solar Beam", 120, "Grass")
    ]);
    const context = vm.createContext({
        TITLE: "Cascade White Dev",
        settings: { typeChart: 6 },
        sort_trpoks: (a, b) => b[1] - a[1] || Number(a[3]) - Number(b[3])
    });
    vm.runInContext(utilitySource, context);
    vm.runInContext(previewSource, context);
    context.g5GetCascadeTrainerPreviewInfo = trainerPok => {
        const isCherrim = trainerPok.startsWith("Cherrim");
        const opposing = isCherrim ? cherrim : nidoqueen;
        return {
            trainerPok, opposing, subIndex: isCherrim ? "2" : "4", expYield: 0,
            types: isCherrim ? ["Grass", "Fire"] : ["Poison", "Ground"],
            pokData: { moves: opposing.moves.map(move => move.name) }
        };
    };
    // Erika's Cherrim comes before Nidoqueen in party order, so a false tie
    // reproduces the reported Cherrim-first prediction against Victreebel.
    const results = context.g5BuildCascadeHybridPhase1Rankings([
        "Cherrim (Lvl 38 Kanto Leader Erika - Nimbasa City)[2]",
        "Nidoqueen (Lvl 39 Kanto Leader Erika - Nimbasa City)[4]"
    ], null, {
        playerType1: "Grass", playerType2: "Poison", playerTypePair: ["Grass", "Poison"],
        playerAbility: "", immunities: {}, weather,
        weatherTypes: { Sun: "Fire", Hail: "Ice", Sand: "Rock", Rain: "Water" }
    });
    return context.g5FinalizeCascadeHybridRankings(results.phase1Mons, [])
        .map(row => ({ species: row[0].split(" (")[0], score: row[1], moves: row[2] }));
}

test("Erika's Nidoqueen outranks Cherrim against Victreebel in Cascade G4 phase 1", () => {
    const rankings = erikaPhase1Rankings("Flower Gift", "Sun");
    assert.deepEqual(Array.from(rankings, row => row.species), ["Nidoqueen", "Cherrim"]);
    assert.equal(rankings[0].score, 16); // Neutral Poison x neutral Ground: 4 x 4.
    assert.equal(rankings[1].score, 8); // Quarter-effective Grass x super-effective Fire: 1 x 8.
    assert.equal(rankings[0].moves, "Flamethrower");
    assert.equal(rankings[1].moves, "Fire Lash");
});

test("Flower Gift and sun do not change Erika's phase 1 typing scores", () => {
    for (const ability of ["Flower Gift", "None"]) {
        for (const weather of ["Sun", ""]) {
            const rankings = erikaPhase1Rankings(ability, weather);
            assert.deepEqual(Array.from(rankings, row => [row.species, row.score]), [
                ["Nidoqueen", 16], ["Cherrim", 8]
            ]);
        }
    }
});

function sourcePreview(specs, options = {}) {
    const player = Object.assign(makePokemon(options.playerAbility || "None", []), {
        stats: { spe: 150 }, hp: 100, weightkg: 100, status: ""
    }, options.player);
    const context = vm.createContext({
        TITLE: "Cascade White Dev", settings: { typeChart: 6, noSwitch: false },
        calc: { TYPE_CHART }, moves: { ...options.moveData }, fainted: options.fainted || [],
        pokedex: options.pokedex || {},
        movePPs: options.movePPs || {},
        getOpposingFaintDataId: () => options.current || "",
        sort_subindex: (a, b) => Number(a[3]) - Number(b[3])
    });
    vm.runInContext(utilitySource, context);
    vm.runInContext(previewSource, context);
    const infos = specs.map((spec, i) => {
        const monMoves = spec.moves || [makeMove("Tackle", 100, "Normal")];
        for (const move of monMoves) context.moves[move.name] = { type: move.type, basePower: move.bp, category: "Physical", ...move.data };
        const opposing = Object.assign(makePokemon(spec.ability || "None", monMoves), { types: spec.types || ["Normal"], stats: { spe: 150 } }, spec.pokemon);
        return {
            trainerPok: `${spec.name} (Test)[${i}]`, subIndex: String(i), opposing,
            isDittoPreview: !!spec.isDittoPreview,
            types: spec.types || ["Normal"], pokData: { moves: monMoves.map(move => move.name) }, expYield: 0
        };
    });
    context.g5GetCascadeTrainerPreviewInfo = id => infos.find(info => info.trainerPok === id);
    const typePair = options.types || ["Normal", "Normal"];
    const cascadeContext = {
        player, playerType1: typePair[0], playerType2: typePair[1], playerTypePair: typePair,
        playerMatchupTypes: [...new Set(typePair)], playerAbility: player.ability,
        playerStatus: options.status || "Healthy", playerHp: player.hp,
        playerMovePPs: options.playerMovePPs,
        playerAllyFaintedThisTurn: options.playerAllyFaintedThisTurn,
        fieldEffects: options.fieldEffects || {}, field: options.field,
        weather: options.weather || "", weatherTypes: { Sun: "Fire", Rain: "Water", Hail: "Ice", Sand: "Rock" },
        immunities: { "Dry Skin": "Water", "Flash Fire": "Fire", "Well-Baked Body": "Fire", Levitate: "Ground", "Sap Sipper": "Grass", "Volt Absorb": "Electric" }
    };
    const ids = infos.map(info => info.trainerPok);
    const rankings = options.phase2
        ? context.g5BuildCascadeDevPhase2Rankings(ids, player, cascadeContext, false)
        : context.g5BuildCascadeDevHybridRankings(ids, player, cascadeContext);
    return Array.from(rankings, row => ({ name: row[0].split(" (")[0], score: row[1], move: row[2] }));
}

test("phase 1 exactly matches ConvertToEffectivenessScore including immunity", () => {
    const context = {};
    vm.runInNewContext(previewSource, context);
    assert.deepEqual([0, 0.25, 0.5, 1, 2, 4].map(context.g5GetCascadeHybridScoreMultiplier), [1, 1, 2, 4, 8, 16]);
    assert.equal(context.g5GetCascadeHybridScoreMultiplier(NaN), 4);
});

test("a successful phase 1 leaves all nonqualifiers at zero instead of using phase 2", () => {
    const rows = sourcePreview([
        { name: "Nonqualifier", types: ["Grass"], moves: [makeMove("Explosion", 250, "Normal")] },
        { name: "Qualifier", types: ["Fire"], moves: [makeMove("Energy Ball", 80, "Grass")] }
    ], { types: ["Water", "Water"] });
    assert.deepEqual(rows.map(row => [row.name, row.score]), [["Qualifier", 4], ["Nonqualifier", 0]]);
});

test("no qualifying candidate triggers the global phase 2 fallback", () => {
    const rows = sourcePreview([
        { name: "Weak", moves: [makeMove("Tackle", 50, "Normal")] },
        { name: "Strong", moves: [makeMove("Hyper Beam", 160, "Normal")] }
    ]);
    assert.deepEqual(rows.map(row => [row.name, row.score]), [["Strong", 240], ["Weak", 75]]);
});

test("the ROM's pair swaps can reverse an existing tie", () => {
    const rows = sourcePreview([
        { name: "A", types: ["Water"], moves: [makeMove("Fire Lash", 80, "Fire")] },
        { name: "B", types: ["Water"], moves: [makeMove("Fire Lash", 80, "Fire")] },
        { name: "C", types: ["Fire"], moves: [makeMove("Fire Lash", 80, "Fire")] }
    ], { types: ["Grass", "Grass"] });
    assert.deepEqual(rows.map(row => row.name), ["C", "B", "A"]);
});

test("active and fainted candidates cannot qualify or prevent phase 2 fallback", () => {
    const rows = sourcePreview([
        { name: "Active", moves: [makeMove("Flamethrower", 90, "Fire")] },
        { name: "Fainted", moves: [makeMove("Ice Beam", 95, "Ice")] },
        { name: "Reserve" }
    ], { types: ["Grass", "Grass"], current: "Active (Test)", fainted: ["Fainted (Test)"] });
    assert.deepEqual(rows.map(row => [row.name, row.score]), [["Reserve", 150], ["Active", 0], ["Fainted", 0]]);
});

test("moves with zero remaining PP are skipped in both phases", () => {
    const fire = Object.assign(makeMove("Fire Lash", 80, "Fire"), { pp: 0 });
    const rows = sourcePreview([{ name: "Reserve", moves: [fire, makeMove("Tackle", 50, "Normal")] }], { types: ["Grass", "Grass"] });
    assert.equal(rows[0].score, 75);
    assert.equal(rows[0].move, "Tackle");
});

function sourcePower(move, options = {}) {
    return sourcePreview([{ name: "Attacker", types: options.attackerTypes || ["Normal"], ability: options.ability, pokemon: options.attacker, moves: [move] }], { ...options, phase2: true })[0].score;
}

test("Flower Gift changes Weather Ball/Crash without adding an attack-stat bonus", () => {
    for (const name of ["Weather Ball", "Weather Crash"]) {
        assert.equal(sourcePower(makeMove(name, 50, "Normal"), { ability: "Flower Gift", attackerTypes: ["Grass", "Fire"], types: ["Grass", "Grass"] }), 300);
    }
    assert.equal(sourcePower(makeMove("Fire Lash", 80, "Fire"), { ability: "Flower Gift", attackerTypes: ["Grass", "Fire"], types: ["Grass", "Grass"] }), 240);
});

test("source phase 2 uses the 1.1 type conversion modifier and move-table Technician BP", () => {
    assert.equal(sourcePower(makeMove("Hyper Beam", 100, "Normal"), { ability: "Aerilate" }), 110);
    assert.equal(sourcePower(makeMove("Weather Ball", 50, "Normal"), { ability: "Technician", weather: "Sun" }), 150);
});

test("Solar Beam is halved without sun and usable at full power with Flower Gift", () => {
    assert.equal(sourcePower(makeMove("Solar Beam", 120, "Grass"), { attackerTypes: ["Grass"] }), 90);
    assert.equal(sourcePower(makeMove("Solar Beam", 120, "Grass"), { ability: "Flower Gift", attackerTypes: ["Grass"] }), 180);
});

test("Electro Ball and slow-move ratios use strict speed comparisons", () => {
    assert.equal(sourcePower(makeMove("Electro Ball", 80, "Electric"), { attacker: { stats: { spe: 151 } } }), 160);
    assert.equal(sourcePower(makeMove("Gyro Ball", 80, "Steel")), 80);
    assert.equal(sourcePower(makeMove("Gyro Ball", 80, "Steel"), { attacker: { stats: { spe: 149 } } }), 160);
});

test("five-hit moves use the source's 2/4/6 hit multipliers", () => {
    const move = Object.assign(makeMove("Tail Slap", 25, "Normal"), { data: { multihit: [2, 5] } });
    assert.equal(sourcePower(move), 75);
    assert.equal(sourcePower(move, { attacker: { item: "Loaded Dice" } }), 150);
    assert.equal(sourcePower(move, { ability: "Skill Link" }), 225);
});

test("phase 2 counts automatic critical hits, not a manually checked crit box", () => {
    assert.equal(sourcePower(Object.assign(makeMove("Tackle", 80, "Normal"), { isCrit: true })), 120);
    const move = Object.assign(makeMove("Storm Throw", 80, "Fighting"), { data: { willCrit: true } });
    assert.equal(sourcePower(move), 320);
    assert.equal(sourcePower(move, { ability: "Sniper" }), 480);
    assert.equal(sourcePower(move, { playerAbility: "Battle Armor" }), 160);
});

test("defensive ability modifiers match the source, including Sand Rush and Dry Skin", () => {
    assert.equal(sourcePower(makeMove("Power Gem", 80, "Rock"), { playerAbility: "Sand Rush" }), 40);
    assert.equal(sourcePower(makeMove("Earth Power", 80, "Ground"), { playerAbility: "Sand Rush" }), 80);
    assert.equal(sourcePower(makeMove("Fire Lash", 80, "Fire"), { playerAbility: "Dry Skin" }), 160);
    assert.equal(sourcePower(makeMove("Fire Lash", 80, "Fire"), { playerAbility: "Fluffy" }), 160);
});

test("Explosion and table BP 1 are not replaced by invented fallback powers", () => {
    assert.equal(sourcePower(makeMove("Explosion", 250, "Normal")), 375);
    assert.equal(sourcePower(makeMove("Sonic Boom", 1, "Normal")), 1);
});

test("source HP steps and the weight-helper u16 truncation are preserved", () => {
    assert.equal(sourcePower(makeMove("Eruption", 150, "Fire"), { attacker: { hp: 60 } }), 84);
    assert.equal(sourcePower(makeMove("Eruption", 150, "Fire"), { attacker: { hp: 49 } }), 0);
    assert.equal(sourcePower(makeMove("Low Kick", 20, "Fighting")), 0);
});

test("speed ratios include the ability and item modifiers used by the game", () => {
    const electroBall = makeMove("Electro Ball", 80, "Electric");
    assert.equal(sourcePower(electroBall, { ability: "Chlorophyll", weather: "Sun" }), 160);
    assert.equal(sourcePower(electroBall, { attacker: { item: "Choice Scarf" } }), 160);
    assert.equal(sourcePower(electroBall, { ability: "Light Metal" }), 160);
    assert.equal(sourcePower(makeMove("Gyro Ball", 80, "Steel"), { ability: "Heavy Metal" }), 160);
});

test("ability immunity lists and Mold Breaker handling match the game helper", () => {
    assert.equal(sourcePower(makeMove("Diamond Storm", 80, "Rock"), { playerAbility: "Wind Rider" }), 0);
    assert.equal(sourcePower(makeMove("Fire Lash", 80, "Fire"), { ability: "Neutralizing Gas", playerAbility: "Flash Fire" }), 0);
    assert.equal(sourcePower(makeMove("Fire Lash", 80, "Fire"), { ability: "Mold Breaker", playerAbility: "Flash Fire" }), 80);
    assert.equal(sourcePower(makeMove("Fire Lash", 80, "Fire"), { attacker: { item: "Ability Drill" }, playerAbility: "Flash Fire" }), 80);
});

test("Scrappy typing scores do not inherit unrelated altered-chart matchups", () => {
    const rows = sourcePreview([
        { name: "Ice", types: ["Ice"], ability: "Scrappy", moves: [makeMove("Thunderbolt", 90, "Electric")] }
    ], { types: ["Water", "Water"] });
    assert.equal(rows[0].score, 4); // Ice remains half-effective against Water.
});

test("Ditto's source preview substitutes the defender including its held item", () => {
    const context = {};
    vm.runInNewContext(previewSource, context);
    const target = Object.assign(makePokemon("Chlorophyll", [makeMove("Weather Ball", 50, "Normal")]), {
        item: "Power Herb", types: ["Grass", "Poison"], clone() { return { ...this }; }
    });
    const ditto = Object.assign(makePokemon("Imposter", []), { item: "Choice Scarf" });
    const info = context.g5BuildCascadeDittoPreviewInfo(target, ditto, ["Normal"], { moves: ["Transform"] });
    assert.equal(info.opposing.item, "Power Herb");
    assert.equal(info.opposing.ability, "Chlorophyll");
});

test("switch effectiveness applies Chargestone and Celestial, but not damage-only Opelucid rules", () => {
    assert.equal(sourcePower(makeMove("Thunderbolt", 80, "Electric"), { types: ["Ground", "Ground"], fieldEffects: { chargestone: true } }), 40);
    assert.equal(sourcePower(makeMove("Shadow Ball", 80, "Ghost"), { fieldEffects: { celestial: true } }), 40);
    assert.equal(sourcePower(makeMove("Psychic", 80, "Psychic"), { types: ["Dark", "Dark"], fieldEffects: { celestial: true } }), 40);
    assert.equal(sourcePower(makeMove("Aura Sphere", 80, "Fighting"), { types: ["Ghost", "Ghost"], fieldEffects: { opelucid: true } }), 0);
    assert.equal(sourcePower(makeMove("Dragon Pulse", 80, "Dragon"), { types: ["Fairy", "Fairy"], fieldEffects: { opelucid: true } }), 0);
});

test("altered-effectiveness helpers bypass field changes only for the relevant attacking types", () => {
    assert.equal(sourcePower(makeMove("Freeze-Dry", 80, "Ice"), { types: ["Water", "Water"], fieldEffects: { celestial: true } }), 160);
    assert.equal(sourcePower(makeMove("Thunderbolt", 80, "Electric"), { ability: "Scrappy", types: ["Ground", "Ground"], fieldEffects: { chargestone: true } }), 40);
});

test("the source's item whitelist excludes a reserve Tera Plate from projected Tera typing and STAB", () => {
    for (const [item, score, power] of [["Tera Plate", 16, 80], ["Tera Orb", 64, 120]]) {
        const rows = sourcePreview([{ name: "Reserve", pokemon: { item }, moves: [makeMove("Fire Lash", 80, "Fire")] }], { types: ["Grass", "Grass"] });
        assert.equal(rows[0].score, score, item);
        assert.equal(sourcePower(makeMove("Fire Lash", 80, "Fire"), { attacker: { item } }), power, item);
    }
});

test("phase 1 reproduces the game's packed-type bug for a Tera defender", () => {
    const rows = sourcePreview([{ name: "Ghost", types: ["Ghost"], moves: [makeMove("Surf", 90, "Water")] }], {
        types: ["Fire", "Fire"], player: { item: "Tera Orb", moves: [makeMove("Fire Lash", 80, "Fire")] }
    });
    assert.equal(rows[0].score, 1); // Ghost into Normal + Fire, as the source actually packs it.
    assert.equal(rows[0].move, "Surf"); // Qualification still checks the actual mono-Fire defender.
});

test("Tera projection uses the first move's table type instead of an edited display type", () => {
    const editedMove = Object.assign(makeMove("Tackle", 40, "Fire"), { data: { type: "Normal" } });
    const rows = sourcePreview([{ name: "Reserve", types: ["Grass"], pokemon: { item: "Tera Orb" }, moves: [editedMove, makeMove("Flamethrower", 90, "Fire")] }], { types: ["Grass", "Grass"] });
    assert.equal(rows[0].score, 16); // Normal + Normal, not Fire + Fire.
});

test("Ditto checks the copied player's PP instead of Transform's stored PP", () => {
    const spec = { name: "Ditto", isDittoPreview: true, types: ["Grass"], moves: [makeMove("Fire Lash", 80, "Fire")] };
    const options = { types: ["Grass", "Grass"], movePPs: { "Ditto (Test)": [0] }, playerMovePPs: [5] };
    assert.equal(sourcePreview([spec], options)[0].move, "Fire Lash");
    assert.equal(sourcePreview([spec], { ...options, playerMovePPs: [0] })[0].score, 0);
});

test("paralysis replaces the speed modifier result and uses fixed-point rounding", () => {
    const move = makeMove("Electro Ball", 80, "Electric");
    assert.equal(sourcePower(move, { attacker: { stats: { spe: 50 } }, player: { stats: { spe: 151 }, status: "par", item: "Choice Scarf" } }), 160);
    assert.equal(sourcePower(move, { attacker: { stats: { spe: 38 } }, player: { stats: { spe: 151 }, status: "par" } }), 80);
});

test("Skyla's field boosts floating Pokemon and respects grounding", () => {
    const move = makeMove("Electro Ball", 80, "Electric");
    const options = { attackerTypes: ["Flying"], attacker: { stats: { spe: 120 } }, fieldEffects: { mistralton: true } };
    assert.equal(sourcePower(move, options), 160);
    assert.equal(sourcePower(move, { ...options, field: { isGravity: true } }), 80);
    assert.equal(sourcePower(move, { ...options, attacker: { stats: { spe: 240 }, item: "Iron Ball" } }), 80);
});

test("speed respects Tera Scarf, Magic Room and Unburden's no-item requirement", () => {
    const move = makeMove("Electro Ball", 80, "Electric");
    assert.equal(sourcePower(move, { attacker: { stats: { spe: 120 }, item: "Tera Scarf" } }), 240); // Speed ratio plus projected Electric STAB.
    assert.equal(sourcePower(move, { attacker: { stats: { spe: 120 }, item: "Choice Scarf" }, field: { isMagicRoom: true } }), 80);
    assert.equal(sourcePower(move, { ability: "Unburden", attacker: { stats: { spe: 90 }, item: "Choice Band", abilityOn: true } }), 80);
});

test("Flail and Reversal use the game's rounded HP ratio at a threshold", () => {
    assert.equal(sourcePower(makeMove("Flail", 20, "Normal"), { attacker: { hp: 27, maxHp: 259 } }), 300);
    assert.equal(sourcePower(makeMove("Reversal", 10, "Fighting"), { attacker: { hp: 27, maxHp: 259 } }), 200);
});

test("server weather suppression affects charge and speed checks, but Weather Ball reads raw weather", () => {
    const options = { weather: "Sun", playerAbility: "Cloud Nine" };
    assert.equal(sourcePower(makeMove("Solar Beam", 120, "Grass"), options), 60);
    assert.equal(sourcePower(makeMove("Electro Ball", 80, "Electric"), { ...options, ability: "Chlorophyll" }), 80);
    assert.equal(sourcePower(makeMove("Weather Ball", 50, "Normal"), options), 100);
});

test("Ditto's copied attacker uses the player's side for speed and Retaliate checks", () => {
    const spec = { name: "Ditto", isDittoPreview: true, moves: [makeMove("Electro Ball", 80, "Electric")] };
    assert.equal(sourcePreview([spec], { phase2: true, field: { defenderSide: { isTailwind: true } } })[0].score, 80);
    const retaliate = { ...spec, moves: [makeMove("Retaliate", 70, "Normal")] };
    assert.equal(sourcePreview([retaliate], { phase2: true })[0].score, 105);
    assert.equal(sourcePreview([retaliate], { phase2: true, playerAllyFaintedThisTurn: true })[0].score, 210);
});

test("a copied Tera defender keeps the original species' STAB", () => {
    const spec = {
        name: "Ditto", isDittoPreview: true, types: ["Fire"],
        pokemon: { name: "Venusaur", item: "Tera Orb", types: ["Fire"] },
        moves: [makeMove("Ember", 1, "Fire"), makeMove("Energy Ball", 80, "Grass")]
    };
    const rows = sourcePreview([spec], { phase2: true, pokedex: { Venusaur: { types: ["Grass", "Poison"] } } });
    assert.equal(rows[0].score, 120);
});

test("Magic Room disables Iron Ball's grounding as well as its speed penalty", () => {
    assert.equal(sourcePower(makeMove("Electro Ball", 80, "Electric"), {
        attackerTypes: ["Flying"], attacker: { stats: { spe: 120 }, item: "Iron Ball" },
        fieldEffects: { mistralton: true }, field: { isMagicRoom: true }
    }), 160);
});

test("PML_MoveIsDamaging uses table power rather than the displayed move category", () => {
    const move = Object.assign(makeMove("Tackle", 50, "Normal"), { data: { category: "Status" } });
    assert.equal(sourcePower(move), 75);
    assert.equal(sourcePower(Object.assign(makeMove("Tackle", 100, "Normal"), { data: { basePower: 0 } })), 0);
});

test("Showdown critRatio is one greater than the game's critical stage", () => {
    assert.equal(sourcePower(Object.assign(makeMove("Storm Throw", 80, "Fighting"), { data: { critRatio: 7 } })), 320);
    assert.equal(sourcePower(Object.assign(makeMove("Storm Throw", 80, "Fighting"), { data: { critRatio: 6 } })), 160);
});

test("typed Hidden Power aliases use the ROM's base move entry in switch calculations", () => {
    const moveData = { "Hidden Power": { type: "Normal", basePower: 60, category: "Special" } };
    const move = makeMove("Hidden Power Fire", 60, "Fire");
    assert.equal(sourcePower(move, { moveData, types: ["Ghost", "Ghost"] }), 0);
    const rows = sourcePreview([{ name: "Reserve", pokemon: { item: "Tera Orb" }, moves: [move] }], { moveData, types: ["Grass", "Grass"] });
    assert.equal(rows[0].score, 90); // Normal Hidden Power does not qualify for phase 1 against Grass.
});
