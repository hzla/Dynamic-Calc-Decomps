(function (factory) {
    if (typeof module === "object" && module.exports) module.exports = factory(require("./pokeweb-ability-catalog"));
    else globalThis.PokewebAbilitySync = factory(globalThis.PokewebAbilityCatalog);
})(function (catalog) {
    const recipes = new Map((catalog?.entries || []).map(([id, , recipe]) => [id, recipe]));
    const capability = catalog && {protocol: catalog.protocol, fingerprint: catalog.fingerprint};

    function expand(data) {
        const block = data?.pokewebBattleRules;
        if (!block || (!Object.hasOwn(block, "abilityTemplates") && !Object.hasOwn(block, "abilityTemplateCatalog"))) return data;
        if (block.version !== 1 || !capability || block.abilityTemplateCatalog !== capability.fingerprint ||
            !Array.isArray(block.abilityTemplates) || block.abilityTemplates.length > 255 ||
            !Array.isArray(block.abilities)) {
            throw Error("This calculator cannot resolve the ability catalog. Reopen Calc and sync again.");
        }
        const abilities = new Map(block.abilities);
        const slots = new Set((block.names?.abilities || []).map(([id]) => id));
        const added = new Set();
        for (const row of block.abilityTemplates) {
            const [slot, template] = Array.isArray(row) ? row : [];
            if (row?.length !== 2 || !Number.isInteger(slot) || slot <= 0 || slot > 255 ||
                !slots.has(slot) || added.has(slot) || abilities.has(slot) || !recipes.has(template)) {
                throw Error("Invalid ability template reference. Export or sync the full recipes again.");
            }
            added.add(slot);
            abilities.set(slot, recipes.get(template));
        }
        const {abilityTemplates, abilityTemplateCatalog, ...rest} = block;
        return {...data, pokewebBattleRules: {...rest, abilities: [...abilities].sort(([a], [b]) => a - b)}};
    }

    return {capability, expand};
});
