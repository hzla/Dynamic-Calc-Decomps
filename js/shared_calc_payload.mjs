export const MAX_CALC_BYTES = 5_000_000;
export const SHARE_ID = /^[a-f0-9]{32}$/;

const sections = new Set([
    "title", "formatted_sets", "poks", "moves", "order", "poks_replacements",
    "pok_replacements", "move_replacements", "ability_replacements", "item_replacements",
    "pokewebBattleRules"
]);
const unsafeKeys = new Set([
    "__proto__", "prototype", "constructor", "hasOwnProperty", "toString", "valueOf",
    "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__"
]);
const unsafeText = /[<>"`=\\]|&(?:#|[a-z]+;)|[\x00-\x08\x0b\x0c\x0e-\x1f]/i;
const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const table = value => Array.isArray(value) && value.every(row => Array.isArray(row) && row.length >= 2);

export function serializeBridgedCalc(data) {
    const text = JSON.stringify(Object.fromEntries([...sections]
        .filter(key => Object.hasOwn(data, key)).map(key => [key, data[key]])));
    if (new TextEncoder().encode(text).byteLength > MAX_CALC_BYTES) throw new Error("The bridged calc exceeds 5 MB.");
    parseSharedCalc(text);
    return text;
}

export function parseSharedCalc(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error("Choose a valid JSON file, not a backup_data JavaScript file.");
    }
    if (!record(data) || typeof data.title !== "string" || !data.title.trim() || data.title.length > 120 ||
        !record(data.formatted_sets) || !Object.keys(data.formatted_sets).length ||
        !record(data.poks) || !record(data.moves)) {
        throw new Error("Expected a title and formatted_sets, poks, and moves objects.");
    }
    if (Object.keys(data).some(key => !sections.has(key))) {
        throw new Error("The file contains unsupported calc data sections.");
    }
    for (const key of sections) {
        if (key !== "title" && Object.hasOwn(data, key) && !record(data[key])) {
            throw new Error("Expected an object for " + key + ".");
        }
    }
    if (Object.hasOwn(data, "pokewebBattleRules")) {
        const rules = data.pokewebBattleRules;
        if (rules.version !== 1 || !["BW", "BW2"].includes(rules.baseGame) || rules.abilityTemplates ||
            ["items", "abilities", "moves", "moveData", "stockAbilityAliases"]
                .some(key => Object.hasOwn(rules, key) && !table(rules[key])) ||
            (Object.hasOwn(rules, "names") && (!record(rules.names) || Object.values(rules.names).some(rows => !table(rows))))) {
            throw new Error("Expected expanded Pokeweb battle rules for BW or BW2.");
        }
    }
    for (const sets of Object.values(data.formatted_sets)) {
        if (!record(sets)) throw new Error("Expected a trainer set map for each species.");
        for (const set of Object.values(sets)) {
            if (!record(set) || !Array.isArray(set.moves) || set.moves.some(move => typeof move !== "string")) {
                throw new Error("Expected a moves list for each trainer set.");
            }
        }
    }
    // Some legacy calc views still insert dataset text into HTML templates.
    function check(value, depth) {
        if (depth > 24) throw new Error("The calc data is nested too deeply.");
        if (typeof value === "string" && unsafeKeys.has(value)) {
            throw new Error("The calc data contains a reserved name.");
        }
        if (typeof value === "string" && (unsafeText.test(value) || /(?:^|[^\p{L}])'|'(?:$|[^\p{L}])/u.test(value))) {
            throw new Error("Calc data must use plain text without markup or attribute syntax.");
        }
        if (Array.isArray(value)) {
            for (const item of value) check(item, depth + 1);
        } else if (record(value)) {
            for (const key in value) {
                if (unsafeKeys.has(key)) throw new Error("The calc data contains a reserved key.");
                check(key, depth + 1);
                check(value[key], depth + 1);
            }
        } else if (typeof value === "number" && !Number.isFinite(value)) {
            throw new Error("Calc data contains a non-finite number.");
        }
    }
    check(data, 0);
    return data;
}
