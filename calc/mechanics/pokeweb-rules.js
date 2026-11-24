(function (root, factory) {
    const rules = factory();
    if (typeof module === "object" && module.exports) module.exports = rules;
    else root.PokewebCalcRules = rules;
})(globalThis, function () {
    "use strict";

    const types = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost",
        "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy"];
    const categories = ["Status", "Physical", "Special"];
    const statuses = ["", "par", "slp", "frz", "brn", "psn"];
    const weather = ["", "Sun", "Rain", "Hail", "Sand"];
    const stats = ["", "atk", "def", "spa", "spd", "spe", "accuracy", "evasion"];
    const globalFields = {1: "trickroom", 2: "gravity", 4: "watersport", 5: "mudsport", 6: "wonderroom", 7: "magicroom"};
    const sideFields = {0: "reflect", 1: "lightscreen", 2: "safeguard", 3: "mist", 4: "tailwind", 5: "luckychant",
        6: "spikes", 7: "toxicspikes", 8: "stealthrock", 11: "rainbow", 12: "seaoffire", 13: "swamp"};
    const nativeGlobals = {gravity: "isGravity", wonderroom: "isWonderRoom", magicroom: "isMagicRoom"};
    const nativeSides = {reflect: "isReflect", lightscreen: "isLightScreen", tailwind: "isTailwind", stealthrock: "isSR", spikes: "spikes"};
    const id = value => String(value || "").toLowerCase().replace(/é/g, "e").replace(/[^a-z0-9]/g, "");
    const datasets = new WeakMap();
    const multiplier = value => Math.round(4096 * value);
    const weatherId = field => weather.indexOf(field.weather === "Snow" ? "Hail" : field.weather || "");
    const moveCategory = ctx => categories.indexOf(ctx.baseCategory);
    const typeId = ctx => types.indexOf(ctx.move.type);
    const hasStatus = (mon, status) => status === 0 ? !mon.status :
        status === 5 ? mon.hasStatus("psn", "tox") : status === 6 ? mon.hasStatus("cnf") || undefined :
        status > 0 && status < statuses.length ? mon.hasStatus(statuses[status]) : undefined;
    const compare = (a, op, b) => {
        if (typeof a !== "number" || !Number.isFinite(a)) return undefined;
        return {lt: a < b, lte: a <= b, gt: a > b, gte: a >= b}[op];
    };
    const hp = (mon, comparison, percent) => compare(mon.curHP() * 100, comparison, mon.maxHP() * percent);
    const and = values => values.includes(false) ? false : values.includes(undefined) ? undefined : true;
    const or = values => values.includes(true) ? true : values.includes(undefined) ? undefined : false;

    function lookup(rows) {
        const result = new Map();
        for (const row of rows || []) {
            if (!Array.isArray(row) || !Number.isInteger(row[0]) || typeof row[1] !== "string") continue;
            const key = id(row[1]);
            if (key) result.set(key, result.has(key) ? null : row);
        }
        return result;
    }

    function active(data) {
        const block = data && data.pokewebBattleRules;
        if (!block || block.version !== 1) return undefined;
        if (!datasets.has(block)) {
            datasets.set(block, {
                abilities: new Map(block.abilities || []),
                items: new Map(block.items || []),
                moves: new Map(block.moves || []),
                abilityNames: lookup(block.names && block.names.abilities),
                abilityIds: new Map(block.names?.abilities || []),
                stockAbilityAliases: new Map(block.stockAbilityAliases || []),
                itemNames: lookup(block.names && block.names.items),
                moveData: lookup(block.moveData),
                species: lookup(Object.entries(data.poks || {}).map(([name, p]) => [p.num, name])),
                warnings: Array.isArray(block.warnings) ? block.warnings.filter(warning => typeof warning === "string") : []
            });
        }
        return datasets.get(block);
    }

    const rowId = (lookup, name) => lookup.get(id(name))?.[0];

    function abilityId(data, label, explicit) {
        return data.abilityIds.get(explicit) === label && label ? explicit : rowId(data.abilityNames, label);
    }

    function condition(node, ctx, provider, bound) {
        if (!node) return true;
        if (node.kind === "group") {
            if (node.scope === "anyOpponent") {
                const known = condition({...node, scope: undefined}, ctx, provider, provider.opponent);
                return known === false && ctx.field.gameType !== "Singles" ? undefined : known;
            }
            if (!node.children.length) return true;
            const results = node.children.map(child => condition(child, ctx, provider, bound));
            return node.mode === "any" ? or(results) : and(results);
        }
        const mon = node.subject === "user" ? ctx.attacker : node.subject === "target" ? ctx.defender :
            node.subject === "opponent" || node.subject === "anyOpponent" ? provider.opponent : bound || provider.owner;
        const value = node.value;
        let matches;
        switch (node.kind) {
            case "hp": return hp(mon, node.comparison, node.percent);
            case "stage": return compare(mon.boosts[stats[node.stat]] + 6, node.comparison, value);
            case "type": matches = mon.hasType(types[value]); break;
            case "weather": matches = weatherId(ctx.field) === value; break;
            case "species": {
                const species = rowId(ctx.data.species, mon.species.baseSpecies || mon.name);
                if (species !== undefined) matches = species === value;
                break;
            }
            case "ability": {
                const ability = ctx.ignoreDefender && mon === ctx.defender ? 0 : abilityId(ctx.data, mon.ability, mon.pokewebAbilityId);
                if (ability !== undefined) matches = ability === value;
                else if (!mon.ability) matches = value === 0;
                break;
            }
            case "knowsMove": {
                const known = mon.moves.map(move => rowId(ctx.data.moveData, typeof move === "string" ? move : move.name));
                matches = known.includes(value) ? true : !known.includes(undefined) && known.length === 4 ? false : undefined;
                break;
            }
            case "heldItem": {
                const held = ctx.heldItems.get(mon);
                const item = rowId(ctx.data.itemNames, held);
                if (item !== undefined) matches = item === value;
                else if (!held) matches = value === 0;
                break;
            }
            case "hasItem": matches = Boolean(ctx.heldItems.get(mon)) === Boolean(value); break;
            case "berry": if (!ctx.heldItems.get(mon)) matches = !value; break;
            case "category": matches = moveCategory(ctx) === value; break;
            case "moveType": matches = typeId(ctx) === value; break;
            case "status": matches = hasStatus(mon, value); break;
            case "field":
            case "fieldEffect": {
                const field = globalFields[value];
                if (field) matches = nativeGlobals[field] ? Boolean(ctx.field[nativeGlobals[field]]) :
                    Boolean(ctx.field.pokeweb?.[field]);
                break;
            }
            case "sideEffect": {
                const side = (provider.owner === ctx.attacker) !== (node.side === "opposing") ?
                    ctx.field.attackerSide : ctx.field.defenderSide;
                const field = sideFields[value];
                if (field) matches = Number(nativeSides[field] ? side[nativeSides[field]] : side.pokeweb?.[field] || 0) >= (node.layers || 1);
                break;
            }
            case "effectiveness":
                if (ctx.effectiveness !== undefined) matches = ({0: 0, 0.25: 1, 0.5: 2, 1: 3, 2: 4, 4: 5})[ctx.effectiveness] === value;
                break;
            case "ally":
                if (ctx.field.gameType === "Singles" || mon === ctx.attacker) matches = (mon === ctx.attacker) === Boolean(value);
                break;
            case "sameMon":
                if (ctx.field.gameType === "Singles" || mon === ctx.attacker) matches = (mon === ctx.attacker) === Boolean(value);
                break;
            default: break;
        }
        const result = matches === undefined ? undefined : node.negate ? !matches : matches;
        return node.subject === "anyOpponent" && result === false && ctx.field.gameType !== "Singles" ? undefined : result;
    }

    function matchesFlag(ctx, params) {
        const flag = params.moveClass || 0;
        const row = ctx.moveRow;
        if (!flag) return true;
        if (flag === 9) return params.types ? Boolean(params.types & 1 << typeId(ctx)) : typeId(ctx) === params.type;
        if (flag === 10) return moveCategory(ctx) === params.category;
        if (flag === 11) return ctx.effectiveness === undefined ? undefined : ctx.effectiveness > 1;
        if (!row) return undefined;
        if (flag >= 256) return Boolean(row[2] & 1 << (flag - 256));
        if (flag >= 14) return Boolean(row[4]?.includes(flag - 13));
        const native = {1: 0, 2: 7, 5: 8}[flag];
        if (native !== undefined) return Boolean(row[2] & 1 << native);
        return Boolean(row[3] & ({3: 1, 4: 2, 6: 4, 7: 8, 8: 16, 12: 64, 13: 32}[flag] || 0));
    }

    const nativeOffense = new Set([37, 55, 57, 58, 62, 65, 66, 67, 68, 74, 94, 129]);
    const nativeSpeed = new Set([33, 34, 84, 95, 146]);
    const nativePower = new Set([79, 89, 101, 120, 125, 137, 138, 148, 159]);
    const nativeDirect = {
        2: "opening", 3: "stages", 4: "criticalGuard", 8: "residual", 10: "immunity", 11: "immunity", 13: "airLock",
        18: "immunity", 22: "stages", 25: "immunity", 26: "immunity", 31: "immunity", 43: "immunity", 45: "opening",
        47: "attack", 51: "stageGuard", 63: "defense", 69: "residual", 70: "opening", 75: "criticalGuard", 76: "airLock",
        78: "immunity", 80: "stages", 81: "residual", 83: "stages", 85: "power", 87: "immunity", 88: "stages",
        91: "stab", 96: "convertType", 97: "damage", 98: "residual", 104: "ignoreAbilities", 109: "ignoreStages",
        110: "damage", 111: "damage", 113: "scrappy", 114: "immunity", 116: "damage", 117: "opening", 127: "unnerve",
        128: "stages", 133: "stages", 136: "damage", 142: "residual", 151: "infiltrate", 153: "stages", 154: "stages",
        155: "stages", 157: "immunity", 158: "priority", 163: "ignoreAbilities", 164: "ignoreAbilities"
    };
    const nativePartial = new Map([
        [8, "evasion in sand changes the chance to hit"], [81, "evasion in hail changes the chance to hit"],
        [10, "set the HP after absorption"], [11, "set the HP after absorption"],
        [87, "weather or absorption can change HP"], [94, "set the HP after weather damage"],
        [7, "paralysis prevention or curing"], [15, "sleep prevention or curing"],
        [17, "poison prevention or curing"], [40, "freeze prevention or curing"], [41, "burn prevention or curing"],
        [21, "forced switching requires another action"], [105, "critical-hit chance; use the Critical checkbox to select the outcome"]
    ]);
    const indirectSources = [0, 1, 3, 5, 6, 7, 8, 9, 11, 12].reduce((mask, bit) => mask | 1 << bit, 0);
    const manualEffects = {
        accuracy: "accuracy changes the chance to hit",
        incomingAccuracy: "accuracy changes the chance to be hit",
        critical: "critical-hit chance; use the Critical checkbox to select the outcome",
        "abilityRecipe:ignoreEvasion": "evasion affects the chance to hit",
        "abilityRecipe:ignoreRedirection": "redirection needs the other active targets",
        "abilityRecipe:statusTypeBypass": "status immunity affects infliction",
        "abilityRecipe:zenMode": "choose the current form in the Pokémon panel",
        "abilityRecipe:stageOperation": "enter the ally's copied or cleared stages",
        "abilityRecipe:statEcho": "apply the copied or reflected stage changes",
        "abilityRecipe:transferItem": "select the held item after the transfer",
        "abilityRecipe:hazard": "set the hazards created by a previous hit",
        "abilityRecipe:healAction": "set the HP after healing",
        "abilityRecipe:statusGuard": "status prevention or curing",
        "abilityRecipe:statusGuardSet": "status prevention or curing",
        "abilityRecipe:statusFollowup": "set the condition caused by a previous action",
        "abilityRecipe:knockoutSplash": "splash damage requires a knockout and another recipient",
        "abilityRecipe:retaliate": "set the HP after retaliation from a knockout",
        "abilityRecipe:perish": "Perish Song counters depend on subsequent turns",
        status: "set any status inflicted by a previous action",
        recoil: "set the HP after contact retaliation"
    };
    const nativeIncoming = new Set([47, 63, 85, 87, 111, 116, 136]);
    const moveStages = {power: "rawPower", hpPower: "rawPower", damage: "damage", ignoreStages: "ignoreStages",
        ignoreAbilities: "ignoreAbilities", typeMatchup: "typeMatchup", moveUserType: "moveUserType", attackStat: "attackStat",
        damageWeather: "damageWeather", requireHeldItem: "requiresItem"};
    const abilityStages = {attack: "attack", specialAttack: "attack", defense: "defense", specialDefense: "defense",
        damage: "damage", speed: "speed", "ability:power": "power", "ability:damage": "damage",
        "ability:damageTaken": "damage", "ability:immunity": "immunity", "ability:priority": "priority",
        "abilityRecipe:convertType": "convertType", "abilityRecipe:weatherStat": "weatherStat",
        "abilityRecipe:criticalStatus": "critical", "abilityRecipe:moveGuard": "immunity",
        "abilityRecipe:fullHpEffectiveness": "typeMatchup", "abilityRecipe:allyPower": "power", "abilityRecipe:priorityGuard": "immunity",
        "abilityRecipe:fieldPower": "fieldPower", "abilityRecipe:auraInvert": "auraInvert", "abilityRecipe:fieldStat": "fieldStat",
        "abilityRecipe:protectBypass": "protection", "abilityRecipe:moveWeather": "moveWeather", "abilityRecipe:windAbsorb": "immunity",
        "abilityRecipe:fallenPower": "power", "abilityRecipe:windCharge": "power", "abilityRecipe:entryTargetStat": "attack",
        "abilityRecipe:additionalStrike": "extraStrike", "abilityRecipe:statAction": "stages", "abilityRecipe:statGroup": "stages",
        "ability:hitStat": "stages", statStage: "stages", "abilityRecipe:weatherAction": "opening",
        "abilityRecipe:clearScreens": "opening", "abilityRecipe:fieldEntry": "opening", "abilityRecipe:sideEntry": "opening",
        "abilityRecipe:moveUserType": "holderType", "abilityRecipe:statGuard": "stageGuard",
        "abilityRecipe:abilityStatGuard": "stageGuard", "abilityRecipe:intimidateCounter": "stageGuard",
        "abilityRecipe:weatherGuard": "residual", "abilityRecipe:damageGuard": "residual"};
    const itemStages = {attack: "attack", specialAttack: "attack", defense: "defense", specialDefense: "defense",
        damage: "damage", speed: "speed", "itemRecipe:power": "power", "itemRecipe:flagPower": "power",
        "itemRecipe:resist": "damage", "itemRecipe:nativeDamage": "damage", "itemRecipe:moveGuard": "immunity", "itemRecipe:moveRestriction": "restriction"};

    const extraStages = {
        "nativeAbility:18": ["attack"], "nativeAbility:112": ["attack", "speed"], "nativeAbility:86": ["stageGuard"],
        "nativeAbility:31": ["stages"], "nativeAbility:78": ["stages"], "nativeAbility:114": ["stages"],
        "nativeAbility:157": ["stages"], "nativeAbility:87": ["power"], "nativeAbility:146": ["residual"], "nativeAbility:159": ["residual"],
        "nativeAbility:126": ["stageGuard"], "nativeAbility:29": ["stageGuard"], "nativeAbility:52": ["stageGuard"],
        "nativeAbility:73": ["stageGuard"], "nativeAbility:145": ["stageGuard"], "abilityRecipe:windAbsorb": ["stages"]
    };
    const activationLabels = ["On entry / ability gain", "After taking a hit", "After crossing the HP threshold",
        "After another Pokémon fainted", "After a knockout", "After using a move"];
    const stageKeys = ["attackStages", "defenseStages", "specialAttackStages", "specialDefenseStages", "speedStages",
        "accuracyStages", "evasionStages"];

    function activationLabel(effect) {
        const p = effect.parameters || {};
        switch (effect.kind) {
            case "abilityRecipe:windCharge":
            case "nativeAbility:18": return "Charged";
            case "nativeAbility:112": return "Slow Start active";
            case "nativeAbility:57":
            case "nativeAbility:58": return "Plus / Minus ally active";
            case "abilityRecipe:entryTargetStat": return "Target just switched in";
            case "nativeAbility:3": return "After a turn";
            case "nativeAbility:80": return "After flinching";
            case "nativeAbility:83": return "After taking a critical hit";
            case "nativeAbility:84": return "Held item was lost";
            case "nativeAbility:148": return "Acting last";
            case "nativeAbility:133":
            case "nativeAbility:154":
            case "nativeAbility:155": return "After taking a qualifying hit";
            case "nativeAbility:31":
            case "nativeAbility:78":
            case "nativeAbility:114":
            case "nativeAbility:157": return "After absorbing a move";
            case "nativeAbility:128": return "After a stat drop";
            case "nativeAbility:153": return "After a knockout";
            case "ability:hitStat": return "After taking a hit";
            case "abilityRecipe:windAbsorb": return "After absorbing wind or gaining Tailwind";
            case "abilityRecipe:statAction":
            case "abilityRecipe:statGroup": return activationLabels[p.activation ?? 0];
            case "statStage": return ["On entry / ability gain", "After a turn", "After using a move", "After taking a hit",
                "After contact", "After an HP check"][["entry", "turnEnd", "afterAttack", "afterHit", "afterContact", "hpCheck"].indexOf(effect.trigger)];
            case "abilityRecipe:weatherAction": return p.activation ? "After taking a hit" : activationLabels[0];
            case "nativeAbility:2":
            case "nativeAbility:22":
            case "nativeAbility:45":
            case "nativeAbility:70":
            case "nativeAbility:88":
            case "nativeAbility:117":
            case "abilityRecipe:fieldEntry":
            case "abilityRecipe:sideEntry":
            case "abilityRecipe:clearScreens": return activationLabels[0];
            case "abilityRecipe:moveUserType": return "Type change available";
            default: return undefined;
        }
    }

    function abilityControls(data, label, explicit) {
        const slot = data && abilityId(data, label, explicit);
        const rule = data?.abilities.get(slot);
        if (!rule) return undefined;
        return {
            slot,
            toggles: rule.effects.flatMap((effect, index) => {
                const label = activationLabel(effect);
                return label ? [{index, label, title: effect.label || effect.kind}] : [];
            }),
            fainted: rule.effects.some(effect => effect.kind === "abilityRecipe:fallenPower")
        };
    }

    function stageFor(provider, effect) {
        if (provider.kind === "move") return moveStages[effect.kind];
        if (provider.kind === "item") {
            if (["native:220", "native:297"].includes(effect.kind)) return "attack";
            if (effect.kind === "native:287") return "speed";
            return itemStages[effect.kind];
        }
        if (effect.kind.startsWith("nativeAbility:")) {
            const native = Number(effect.kind.slice(14));
            return nativeDirect[native] || (nativeOffense.has(native) ? "attack" :
                nativeSpeed.has(native) ? "speed" : nativePower.has(native) ? "power" : undefined);
        }
        return abilityStages[effect.kind];
    }

    function createContext(data, attacker, defender, move, field, notes) {
        const moveRow = data.moveData.get(id(move.name)) ??
            (/^hidden power /i.test(move.name) ? data.moveData.get("hiddenpower") : undefined);
        if (moveRow) {
            const [, , native, expanded] = moveRow;
            move.flags = {...move.flags, contact: native & 1, punch: native >> 7 & 1, sound: native >> 8 & 1,
                bite: expanded & 1, pulse: expanded >> 1 & 1, bullet: expanded >> 2 & 1,
                slicing: expanded >> 3 & 1, powder: expanded >> 4 & 1, wind: expanded >> 5 & 1,
                healing: expanded >> 6 & 1};
            move.breaksProtect ||= !(native & 8);
        }
        const ctx = {data, attacker, defender, move, field, moveRow, notes, baseCategory: move.category, baseType: move.type,
            effectiveness: undefined, ignoreDefender: false, providers: [], applied: [],
            heldItems: new Map([[attacker, attacker.item], [defender, defender.item]])};
        for (const [owner, opponent] of [[attacker, defender], [defender, attacker]]) {
            for (const [kind, label, names, rules] of [
                ["ability", owner.ability, data.abilityNames, data.abilities], ["item", owner.item, data.itemNames, data.items]
            ]) {
                const romId = kind === "ability" ? abilityId(data, label, owner.pokewebAbilityId) : rowId(names, label);
                const rule = rules.get(romId);
                if (rule) ctx.providers.push({kind, label, romId, owner, opponent, rule,
                    suppressed: kind === "ability" && owner.pokewebAbilitySuppressed});
                else if (kind === "ability") {
                    const original = data.stockAbilityAliases.get(romId);
                    if (original) owner.hasAbility = (...labels) => owner.ability === label && labels.includes(original);
                    else if (names.get(id(label)) === null) {
                        notes.add(label + " (choose the ability’s ROM slot)");
                        owner.hasAbility = () => false;
                    }
                }
            }
        }
        const rule = data.moves.get(moveRow?.[0]);
        if (rule) {
            ctx.moveRule = rule;
            ctx.providers.push({kind: "move", label: move.name, owner: attacker, opponent: defender, rule});
        }
        return ctx;
    }

    function note(ctx, provider, detail) {
        ctx.notes.add(provider.label + " (" + detail + ")");
    }

    function prepare(ctx, kind) {
        for (const provider of ctx.providers.filter(p => p.kind === kind)) {
            if (kind === "item" && provider.owner.item !== provider.label) {
                provider.suppressed = true;
                continue;
            }
            if (kind !== "move") {
                // Preserve the selected identity for ID checks and display. Prevent
                // the calculator from also running its stock effect by name.
                provider.owner[kind === "ability" ? "hasAbility" : "hasItem"] = () => false;
            } else {
                ctx.move.named = () => false;
                ctx.move.ignoreDefensive = false;
                ctx.move.overrideDefensiveStat = undefined;
                ctx.move.dropsStats = 0;
                ctx.move.timesUsed = 1;
                ctx.move.recoil = undefined;
                ctx.move.drain = undefined;
                ctx.move.hasCrashDamage = false;
                ctx.move.mindBlownRecoil = false;
                ctx.move.struggleRecoil = false;
                ctx.move.breaksProtect = provider.rule.nativeBase === 364 || Boolean(ctx.moveRow && !(ctx.moveRow[2] & 8));
                if (provider.rule.nativeBase === 280) {
                    ctx.field.defenderSide.isReflect = false;
                    ctx.field.defenderSide.isLightScreen = false;
                }
            }
            if (provider.suppressed) continue;
            for (const effect of provider.rule.effects) {
                if (effect.additionalManualEffect) note(ctx, provider, effect.additionalManualEffect);
                const partial = nativePartial.get(Number(effect.kind.slice(14)));
                if (partial) note(ctx, provider, partial);
                if (!partial && !stageFor(provider, effect) && !Object.hasOwn(extraStages, effect.kind)) {
                    note(ctx, provider, manualEffects[effect.kind] || effect.label || (effect.kind.startsWith("nativeAbility:") ?
                        "copied native effect #" + effect.kind.slice(14) : effect.kind.replace(/^[^:]+:/, "")));
                }
                if (effect.kind === "abilityRecipe:damageGuard" && (effect.parameters?.sources & ~indirectSources)) {
                    note(ctx, provider, "indirect damage sources outside the current matchup");
                }
                if (effect.kind === "abilityRecipe:allyPower" && ctx.field.gameType !== "Singles" && !effect.parameters?.scope) {
                    note(ctx, provider, "ally damage requires the ally’s matchup");
                }
            }
        }
    }

    function eligible(ctx, provider, effect, bypass = ctx.ignoreDefender) {
        if (provider.suppressed || provider.kind === "ability" && provider.owner !== ctx.attacker &&
            bypass && effect.bypassable !== false) return false;
        const active = and([condition(provider.rule.conditions, ctx, provider), condition(effect.conditions, ctx, provider)]);
        if (active === undefined) note(ctx, provider, "condition needs additional battle context");
        return active === true;
    }

    function matching(ctx, stage) {
        if (!ctx) return [];
        const result = [];
        for (const provider of ctx.providers) for (const [index, effect] of provider.rule.effects.entries()) {
            const effectStage = stageFor(provider, effect);
            if ((stage === effectStage || extraStages[effect.kind]?.includes(stage) ||
                effectStage === "weatherStat" && (stage === "speed" || stage === "attack")) &&
                eligible(ctx, provider, effect)) result.push({provider, effect, index});
        }
        return result;
    }

    function prerequisites(ctx) {
        if (!ctx?.moveRule) return true;
        const provider = ctx.providers.find(p => p.kind === "move");
        const result = condition(provider.rule.prerequisites, ctx, provider);
        if (result === undefined) note(ctx, provider, "use prerequisite needs additional battle context");
        return result !== false && !matching(ctx, "requiresItem").some(({effect}) =>
            !ctx.heldItems.get(effect.target === "user" ? ctx.attacker : ctx.defender));
    }

    function nativeMatches(ctx, stage, provider, effect, options = {}) {
        const native = Number(effect.kind.slice(14)), p = effect.parameters || {}, mon = provider.owner;
        if (native === 26) return typeId(ctx) === 4 && !ctx.field.isGravity && !mon.hasItem("Iron Ball");
        if (native === 25) return ctx.effectiveness <= 1;
        if (native === 43) return matchesFlag(ctx, {moveClass: 5});
        if (stage === "immunity") return p.type === typeId(ctx);
        if (native === 85) return p.type === typeId(ctx);
        if (native === 97) return options.critical;
        if (native === 110) return ctx.effectiveness < 1;
        if (native === 111 || native === 116) return ctx.effectiveness > 1;
        if (native === 136) return hp(mon, "gte", p.hpMinimum);
        if (native === 47) return [p.type1, p.type2].includes(typeId(ctx));
        if (native === 63) return Boolean(mon.status) && moveCategory(ctx) === p.category;
        if (native === 158) return moveCategory(ctx) === p.category;
        if (stage === "speed") return native === 95 ? Boolean(mon.status) : weatherId(ctx.field) === effect.weather;
        if (stage === "attack") {
            if (native >= 65 && native <= 68) return typeId(ctx) === p.type && hp(mon, "lte", p.hpThreshold);
            if (native === 129) return hp(mon, "lte", p.hpPercent0);
            if (moveCategory(ctx) !== p.category) return false;
            if (native === 62) return Boolean(mon.status);
            if (native === 94) return weatherId(ctx.field) === effect.weather;
            return true;
        }
        if (native === 87) return typeId(ctx) === p.weakType;
        if (native === 89) return matchesFlag(ctx, {moveClass: 2});
        if (native === 101) return options.power <= p.powerThreshold;
        if (native === 79) return ["M", "F"].includes(ctx.attacker.gender) && ["M", "F"].includes(ctx.defender.gender);
        if (native === 120) return ctx.move.recoil || ctx.move.hasCrashDamage;
        if (native === 125) return ctx.move.secondaries || ctx.move.sf;
        if (native === 159) return [p.type1, p.type2, p.type3].includes(typeId(ctx)) && weatherId(ctx.field) === effect.weather;
        if (native === 137 || native === 138) return hasStatus(mon, p.triggerStatus) && moveCategory(ctx) === p.category;
        return false;
    }

    function modifiers(ctx, stage, mods, options = {}) {
        for (const {provider, effect, index} of matching(ctx, stage)) {
            const p = effect.parameters || {}, value = effect.value, kind = effect.kind;
            const outgoing = provider.owner === ctx.attacker;
            if (stage === "speed" && options.owner !== provider.owner) continue;
            let applies = false, ratio = value;
            if (kind.startsWith("nativeAbility:")) {
                const native = Number(kind.slice(14));
                if (stage !== "speed" && outgoing === nativeIncoming.has(native)) continue;
                applies = native === 84 ? checked(provider, index) && !provider.owner.item :
                    native === 148 ? checked(provider, index) :
                    native === 18 ? checked(provider, index) && typeId(ctx) === p.type :
                    native === 112 ? checked(provider, index) && (stage === "speed" || moveCategory(ctx) === 1) :
                    native === 57 || native === 58 ? checked(provider, index) && moveCategory(ctx) === 2 :
                    nativeMatches(ctx, stage, provider, effect, options);
                ratio = native === 55 ? p.attackRatio : native === 79 && ctx.attacker.gender !== ctx.defender.gender ?
                    p.ratio1 : p.power ?? p.ratio0 ?? value;
            } else if (kind.startsWith("native:")) {
                applies = stage === "speed" || outgoing && moveCategory(ctx) === (kind === "native:220" ? 1 : 2);
                if (value === -1) ratio = 1.5;
            } else if (kind === "abilityRecipe:fallenPower") {
                const count = Math.min(p.cap, Math.max(0, Math.trunc(provider.owner.alliesFainted || 0)));
                applies = outgoing && count > 0;
                ratio = (4096 + Math.floor((4096 * value * count + 50) / 100)) / 4096;
            } else if (kind === "abilityRecipe:windCharge" || kind === "abilityRecipe:entryTargetStat") {
                applies = outgoing && checked(provider, index) && (kind !== "abilityRecipe:windCharge" || typeId(ctx) === p.type);
            } else if (kind === "abilityRecipe:weatherStat") {
                applies = weatherId(ctx.field) === p.weather && (stage === "speed" ? p.stat === 5 :
                    outgoing && (p.stat === 1 && moveCategory(ctx) === 1 || p.stat === 3 && moveCategory(ctx) === 2));
            } else if (kind === "abilityRecipe:allyPower") {
                applies = outgoing && p.scope === 1 && (!p.category || p.category === moveCategory(ctx)) && matchesFlag(ctx, p);
            } else if (kind === "speed") {
                applies = true;
            } else if (kind === "attack" || kind === "specialAttack") {
                applies = outgoing && moveCategory(ctx) === (kind === "attack" ? 1 : 2);
            } else if (kind === "defense" || kind === "specialDefense") {
                applies = !outgoing && options.defenseCategory === (kind === "defense" ? 1 : 2);
            } else if (kind === "itemRecipe:resist") {
                applies = !outgoing && (!p.superEffective || ctx.effectiveness > 1) &&
                    (p.type === 18 || typeId(ctx) === p.type) && !ctx.attacker.hasAbility("Unnerve") && !nativePassive(ctx, "unnerve", ctx.attacker) &&
                    (!provider.rule.consumable || options.hit === 0);
            } else if (kind === "itemRecipe:nativeDamage") {
                applies = outgoing && (!p.superEffective || ctx.effectiveness > 1) &&
                    !(effect.additionalManualEffect === "recoil" && ctx.attacker.hasAbility("Sheer Force") && (ctx.move.secondaries || ctx.move.sf));
            } else if (kind.startsWith("itemRecipe:")) {
                applies = outgoing && (p.type === 18 || typeId(ctx) === p.type) &&
                    (!p.category || moveCategory(ctx) === p.category) && matchesFlag(ctx, p);
            } else if (kind.startsWith("ability:")) {
                applies = outgoing !== (kind === "ability:damageTaken") && matchesFlag(ctx, p);
            } else {
                applies = outgoing;
            }
            if (applies === undefined) note(ctx, provider, "move filter needs additional battle context");
            if (applies && Number.isFinite(ratio) && ratio > 0) {
                mods.push(multiplier(ratio));
                if (ctx.desc && ratio !== 1 && provider.kind !== "move") {
                    const side = outgoing ? "attacker" : "defender";
                    ctx.desc[side + (provider.kind === "ability" ? "Ability" : "Item")] = provider.label;
                }
            }
        }
        if (stage === "power" && ctx) {
            if (ctx.conversionRatio && ctx.move.type === ctx.convertedType) mods.push(multiplier(ctx.conversionRatio));
            const aura = fieldEffects(ctx, "fieldPower").find(({effect}) => effect.parameters.type === typeId(ctx));
            if (aura) mods.push(matching(ctx, "auraInvert").length ?
                Math.floor(4096 * aura.effect.parameters.invertedPercent / 100) : multiplier(aura.effect.value));
        }
        if (ctx && (stage === "attack" || stage === "defense")) {
            const attack = stage === "attack";
            const owner = attack ? ctx.attacker : ctx.defender;
            const category = attack ? moveCategory(ctx) : options.defenseCategory;
            const stat = attack ? {1: 1, 2: 3}[category] : {1: 2, 2: 4}[category];
            const providers = fieldEffects(ctx, "fieldStat").filter(({effect}) => effect.parameters.stat === stat);
            if (providers.length && !providers.some(({provider}) => provider.owner === owner)) mods.push(multiplier(providers[0].effect.value));
        }
        if (stage === "damage" && ctx?.protectionRatio) mods.push(multiplier(ctx.protectionRatio));
        if (stage === "damage" && options.extraStrike) mods.push(multiplier(options.extraStrike));
        return mods;
    }

    function fieldEffects(ctx, stage) {
        const side = owner => owner === ctx.attacker ? ctx.field.attackerSide : ctx.field.defenderSide;
        return matching(ctx, stage).sort((a, b) =>
            (side(a.provider.owner).pokewebPosition ?? 0) - (side(b.provider.owner).pokewebPosition ?? 0));
    }

    function protection(ctx) {
        if (!ctx.moveRow || !(ctx.moveRow[2] & 8)) return false;
        const bypass = matching(ctx, "protection").find(({provider, effect}) =>
            provider.owner === ctx.attacker && matchesFlag(ctx, effect.parameters));
        if (!bypass) return false;
        ctx.protectionRatio = bypass.effect.value;
        return true;
    }

    function moveWeather(ctx) {
        const match = matching(ctx, "moveWeather").find(({provider}) => provider.owner === ctx.attacker);
        if (match) ctx.field.weather = weather[match.effect.parameters.weather];
    }

    function flag(ctx, stage) {
        for (const {provider, effect} of matching(ctx, stage)) {
            const p = effect.parameters || {};
            const outgoing = provider.owner === ctx.attacker;
            if (stage === "immunity" && !outgoing) {
                const match = effect.kind.startsWith("nativeAbility:") ? nativeMatches(ctx, stage, provider, effect) :
                    effect.kind === "abilityRecipe:priorityGuard" ? ctx.move.priority >= effect.value : matchesFlag(ctx, p);
                if (match === undefined) note(ctx, provider, "move filter needs additional battle context");
                if (match) return true;
            } else if (stage === "restriction" && outgoing &&
                (p.type === 18 || types[p.type] === ctx.baseType) && (!p.category || p.category - 1 === moveCategory(ctx))) {
                return true;
            } else if (stage === "critical" && outgoing && hasStatus(ctx.defender, p.condition)) {
                return true;
            } else if (provider.kind === "move" || stage === "ignoreAbilities" && outgoing) {
                return true;
            }
        }
        return false;
    }

    function resolveType(ctx) {
        if (!ctx) return;
        for (const {provider, effect} of matching(ctx, "convertType")) {
            const p = effect.parameters || {};
            const source = effect.kind === "nativeAbility:96" ? 18 : p.sourceType;
            if (provider.owner !== ctx.attacker && p.scope !== 1) continue;
            if ([237, 311, 363, 449, 546].includes(ctx.moveRow?.[0]) || ctx.baseType === types[p.type] ||
                source !== 18 && ctx.baseType !== types[source] || !matchesFlag(ctx, p)) continue;
            ctx.move.type = types[p.type];
            ctx.convertedType = ctx.move.type;
            ctx.conversionRatio = effect.kind === "nativeAbility:96" ? 1 : effect.value;
            ctx.desc.attackerAbility = provider.label;
            ctx.desc.moveType = ctx.move.type;
        }
        const userType = matching(ctx, "moveUserType")[0];
        if (userType) ctx.move.type = ctx.attacker.types[userType.effect.value] || ctx.attacker.types[0];
    }

    function checked(provider, index) {
        return provider.owner.pokewebAbilityActive?.[index] === true;
    }

    function highestStat(mon) {
        return [1, 2, 3, 4, 5].reduce((best, stat) => mon.rawStats[stats[stat]] > mon.rawStats[stats[best]] ? stat : best);
    }

    function changeStage(ctx, provider, target, stat, delta) {
        const key = stats[stat];
        if (!key || !delta) return;
        const guards = matching(ctx, "stageGuard").filter(entry => entry.provider.owner === target);
        if (guards.some(({effect}) => effect.kind === "nativeAbility:126") || target.hasAbility("Contrary")) {
            delta = -delta;
        } else {
            const simple = guards.find(({effect}) => effect.kind === "nativeAbility:86");
            if (simple) delta *= simple.effect.parameters?.amountMultiplier ?? 2;
            else if (target.hasAbility("Simple")) delta *= 2;
        }
        const other = target !== provider.owner;
        if (other && delta < 0) {
            if (guards.some(({effect}) => {
                const p = effect.parameters || {};
                if (["abilityRecipe:intimidateCounter", "nativeAbility:126", "nativeAbility:86"].includes(effect.kind)) return false;
                if (effect.kind === "abilityRecipe:abilityStatGuard" && provider.kind !== "ability") return false;
                if (p.protectedType !== undefined && p.protectedType !== 18 && !target.hasType(types[p.protectedType])) return false;
                const nativeStat = {"nativeAbility:52": 1, "nativeAbility:73": 6, "nativeAbility:145": 2};
                const filter = p.guardStat ?? p.stat ?? nativeStat[effect.kind] ?? 8;
                return filter === stat || filter === 8;
            }) || target.hasAbility("Clear Body", "White Smoke") || stat === 1 && target.hasAbility("Hyper Cutter") ||
                stat === 2 && target.hasAbility("Big Pecks") || target.hasItem("Clear Amulet") ||
                ctx.field[target === ctx.attacker ? "attackerSide" : "defenderSide"].pokeweb?.mist) return;
            const counter = guards.find(({effect}) => effect.kind === "abilityRecipe:intimidateCounter" &&
                effect.parameters?.sourceAbility === provider.romId && effect.parameters?.sourceStat === stat);
            if (counter) {
                changeStage(ctx, counter.provider, target, counter.effect.parameters.stat, counter.effect.value);
                return;
            }
        }
        const before = target.boosts[key] || 0;
        target.boosts[key] = Math.max(-6, Math.min(6, before + delta));
        if (target.boosts[key] !== before) {
            const label = {atk:"Atk", def:"Def", spa:"Sp. Atk", spd:"Sp. Def", spe:"Spe", accuracy:"Accuracy", evasion:"Evasion"}[key];
            const change = target.boosts[key] - before;
            ctx.applied.push(provider.label + ": " + target.name + " " + (change > 0 ? "+" : "") + change + " " + label);
        }
    }

    function applyIntimidate(ctx, source, target) {
        if (!ctx || !source.abilityOn || !source.hasAbility("Intimidate") ||
            !matching(ctx, "stageGuard").some(({provider}) => provider.owner === target)) return false;
        changeStage(ctx, {kind: "ability", romId: 22, owner: source, label: source.ability}, target, 1, -1);
        return true;
    }

    function applyOpening(ctx) {
        if (!ctx) return;
        const openings = fieldEffects(ctx, "opening").filter(({provider, index}) => checked(provider, index));
        const weatherSet = effect => effect.kind === "abilityRecipe:weatherAction" ?
            effect.parameters?.weather : effect.parameters?.weatherSet;
        const setters = openings.filter(({effect}) => weatherSet(effect) !== undefined);
        const competingWeather = new Set(setters.map(({provider}) => provider.owner)).size > 1 &&
            new Set(setters.map(({effect}) => weatherSet(effect))).size > 1;
        for (const {provider, effect} of openings) {
            const p = effect.parameters || {};
            if (weatherSet(effect) !== undefined) {
                if (competingWeather) {
                    note(ctx, provider, "select the weather setter that resolved last");
                    continue;
                }
                ctx.field.weather = weather[weatherSet(effect)];
            }
            if (effect.kind === "abilityRecipe:clearScreens" || effect.kind === "abilityRecipe:sideEntry") {
                const side = effect.kind === "abilityRecipe:clearScreens" ? [2, 0, 1][p.scope] : p.side;
                const own = provider.owner === ctx.attacker ? ctx.field.attackerSide : ctx.field.defenderSide;
                const foe = provider.owner === ctx.attacker ? ctx.field.defenderSide : ctx.field.attackerSide;
                for (const target of side === 2 ? [own, foe] : side === 0 ? [own] : [foe]) {
                    if (effect.kind === "abilityRecipe:clearScreens") {
                        target.isReflect = target.isLightScreen = false;
                    } else {
                        const name = sideFields[p.condition];
                        if (nativeSides[name] === "spikes") target.spikes = Math.min(3, target.spikes + p.layers);
                        else if (nativeSides[name]) target[nativeSides[name]] = true;
                        else {
                            target.pokeweb ??= {};
                            target.pokeweb[name] = name === "toxicspikes" ?
                                Math.min(2, (target.pokeweb[name] || 0) + p.layers) : 1;
                        }
                    }
                }
            }
            if (effect.kind === "abilityRecipe:fieldEntry") {
                const name = globalFields[p.condition];
                if (nativeGlobals[name]) ctx.field[nativeGlobals[name]] = !(p.active && ctx.field[nativeGlobals[name]]);
                else {
                    ctx.field.pokeweb ??= {};
                    ctx.field.pokeweb[name] = !(p.active && ctx.field.pokeweb[name]);
                }
            }
            ctx.applied.push(provider.label + ": " + (effect.label || activationLabel(effect)));
        }
    }

    function applyStages(ctx, getModifiedStat) {
        if (!ctx) return;
        const entries = fieldEffects(ctx, "stages");
        for (const {provider, effect, index} of entries) {
            if (!checked(provider, index)) continue;
            const p = effect.parameters || {};
            // The checkbox confirms the historical trigger and any associated chance roll.
            if ((p.activationChance ?? effect.chance ?? 100) === 0) continue;
            const kind = effect.kind;
            let targets, changes = [[p.stat ?? effect.stat ?? 1, p.stages ?? effect.value]];
            if (kind === "nativeAbility:22") {
                targets = [provider.opponent];
                changes = [[effect.stat ?? 1, p.stages ?? -1]];
            } else if (kind === "nativeAbility:88") {
                const foe = provider.opponent;
                const def = getModifiedStat(foe.rawStats.def, foe.boosts.def);
                const spd = getModifiedStat(foe.rawStats.spd, foe.boosts.spd);
                targets = [provider.owner];
                changes = [[(ctx.field.isWonderRoom ? def <= spd : spd <= def) ? 3 : 1, p.stages]];
                if (ctx.field.gameType !== "Singles") {
                    note(ctx, provider, "compare both opponents’ defenses to select the boosted stat");
                    continue;
                }
            } else if (kind === "ability:hitStat" || kind === "statStage") {
                const target = kind === "ability:hitStat" ? (p.target === 1 ? provider.opponent : provider.owner) :
                    (effect.target === "attacker" ? ctx.attacker : effect.target === "defender" ? ctx.defender : provider.owner);
                targets = [target];
            } else {
                targets = [2, 3].includes(p.scope) ? [provider.opponent] :
                    p.scope === 4 ? [provider.opponent] : p.scope === 1 ? [] : [provider.owner];
            }
            if (ctx.field.gameType !== "Singles" && (kind === "nativeAbility:22" || [1, 2, 3, 4].includes(p.scope))) {
                note(ctx, provider, "stage changes involving other active Pokémon");
                if (p.scope === 4) continue;
            }
            if (kind === "nativeAbility:133") changes = [[p.statDown, p.stagesDown], [p.statUp, p.stagesUp]];
            if (kind === "abilityRecipe:statGroup") {
                const order = Array.from({length: 7}, (_, i) => p.statOrder >> (i * 3) & 7).filter(Boolean);
                changes = (order.length ? order : stageKeys.map((_, i) => i + 1)).map(stat => [stat, p[stageKeys[stat - 1]]]);
            }
            for (const target of targets) for (const [stat, delta] of changes) {
                const actual = stat === 8 ? highestStat(p.statSource ? target : provider.owner) : stat;
                changeStage(ctx, provider, target, actual, delta);
            }
        }
    }

    function applyResidualGuards(ctx) {
        for (const {provider, effect} of matching(ctx, "residual")) {
            const p = effect.parameters || {};
            const damagingWeather = p.weather ?? effect.weather ?? {
                "nativeAbility:8": 4, "nativeAbility:142": 0
            }[effect.kind];
            const weatherMask = {0: (1 << 5) | (1 << 6), 3: 1 << 5, 4: 1 << 6};
            let mask = weatherMask[damagingWeather] || 0;
            if (effect.kind === "abilityRecipe:damageGuard") mask = p.sources;
            if (effect.kind === "nativeAbility:98") mask = indirectSources;
            if (effect.kind === "nativeAbility:69" && ctx.move.recoil) mask = 1 << 7;
            if (mask) provider.owner.pokewebIndirectImmunity = (provider.owner.pokewebIndirectImmunity || 0) | mask;
        }
    }

    function stab(ctx) {
        const match = matching(ctx, "stab").find(({provider}) => provider.owner === ctx.attacker);
        return match && multiplier(match.effect.parameters.stab);
    }

    function activeType(ctx) {
        for (const {provider, effect, index} of matching(ctx, "holderType")) {
            if (provider.owner !== ctx.attacker || !checked(provider, index) || provider.owner.named("Arceus")) continue;
            const type = effect.parameters?.type === 18 ? ctx.move.type : types[effect.parameters?.type];
            if (type) {
                ctx.attacker.types = [type];
                ctx.applied.push(provider.label + ": changed type to " + type);
            }
        }
    }

    const strikeExcluded = new Set([12, 32, 90, 120, 153, 165, 205, 248, 253, 283, 301, 329, 353, 374, 515]);
    function extraStrike(ctx, fixedDamage, spread) {
        if (!ctx || fixedDamage || ctx.move.hits !== 1 || !ctx.moveRow ||
            strikeExcluded.has(ctx.moveRow[0]) || ctx.moveRow[2] & 2) return undefined;
        const effect = matching(ctx, "extraStrike").find(({provider}) => provider.owner === ctx.attacker);
        if (effect && spread) {
            note(ctx, effect.provider, "an extra strike needs exactly one target");
            return undefined;
        }
        if (effect) ctx.applied.push(effect.provider.label + ": extra strike");
        return effect?.effect.value;
    }

    function nativePassive(ctx, stage, mon, filter = () => true) {
        return matching(ctx, stage).some(({provider, effect}) => provider.owner === mon && filter(effect));
    }

    function priority(ctx, value) {
        for (const {provider, effect} of matching(ctx, "priority")) {
            if (provider.owner !== ctx.attacker) continue;
            const p = effect.parameters || {};
            if (effect.kind === "nativeAbility:158" ? moveCategory(ctx) === p.category : matchesFlag(ctx, p)) value += p.bonus ?? effect.value;
        }
        return value;
    }

    function matchup(ctx, type, value) {
        if (!value && nativePassive(ctx, "scrappy", ctx.attacker, effect => types[effect.parameters?.immuneType] === type)) {
            value = 1;
        }
        if (!value) return value;
        for (const {provider, effect} of matching(ctx, "typeMatchup")) {
            if (provider.kind === "move" && types[effect.value] === type) value = 2 ** (effect.parameters.effectiveness - 3);
        }
        return value;
    }

    function overallMatchup(ctx, value) {
        if (!value) return value;
        for (const {provider, effect} of matching(ctx, "typeMatchup")) {
            if (provider.owner === ctx.defender && effect.kind === "abilityRecipe:fullHpEffectiveness" &&
                hp(ctx.defender, "gte", effect.parameters.threshold)) value = effect.value;
        }
        return value;
    }

    function rawPower(ctx, power) {
        for (const {effect} of matching(ctx, "rawPower")) {
            power = effect.kind === "hpPower" ?
                Math.floor(effect.value * (effect.target === "target" ? ctx.defender.curHP() / ctx.defender.maxHP() :
                    ctx.attacker.curHP() / ctx.attacker.maxHP())) : Math.floor(power * multiplier(effect.value) / 4096);
            power = Math.max(1, Math.min(65535, power));
        }
        return power;
    }

    function damageWeather(ctx, current) {
        for (const {effect} of matching(ctx, "damageWeather")) {
            if (effect.value === weatherId(ctx.field) &&
                (effect.parameters.moveType === 255 || effect.parameters.moveType === typeId(ctx))) {
                current = weather[effect.parameters.replacement];
            }
        }
        return current;
    }

    function attackingStat(ctx, current) {
        const effect = matching(ctx, "attackStat")[0]?.effect;
        return effect ? stats[effect.value] : current;
    }

    // Burn and paralysis also check the fixed Gen 5 ability IDs outside the editable event table.
    function nativeException(ctx, kind, owner, romId) {
        return ctx?.providers.some(provider => provider.kind === kind && provider.owner === owner &&
            provider.romId === romId && !provider.suppressed);
    }

    function openingValues(set) {
        const result = {global: {}, left: {}, right: {}};
        const fill = (values, labels, target) => {
            if (Array.isArray(values)) for (const label of values) if (Object.values(labels).includes(label)) target[label] = 1;
        };
        fill(set?.fieldGlobal, globalFields, result.global);
        fill(set?.fieldLeft, sideFields, result.left);
        fill(set?.fieldRight, sideFields, result.right);
        for (const [field, limit] of [["spikes", 3], ["toxicspikes", 2]]) {
            const name = field === "spikes" ? "spikes" : "toxicSpikes";
            for (const [side, suffix] of [["left", "Left"], ["right", "Right"]]) {
                const value = set?.[name + suffix];
                if (Number.isInteger(value) && value > 0 && value <= limit) result[side][field] = value;
            }
        }
        return result;
    }

    return {active, createContext, prepare, prerequisites, modifiers, flag, resolveType, priority, matchup, overallMatchup,
        rawPower, attackingStat, damageWeather, protection, moveWeather, nativeException, openingValues,
        abilityControls, applyOpening, applyStages, applyIntimidate, applyResidualGuards, activeType, extraStrike, nativePassive, stab};
});
