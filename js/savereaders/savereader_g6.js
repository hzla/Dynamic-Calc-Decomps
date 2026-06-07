const G67_PK_STORED_SIZE = 0xE8;
const G67_PK_PARTY_SIZE = 0x104;
const G67_PARTY_SLOTS = 6;
const G67_BOX_SLOTS = 30;
const G67_BEEF_FOOTER_OFFSET = 0x1F0;
const G67_ANCESTRAL_X_FAST_GROWTH = 4;
const G67_ANCESTRAL_X_SLOW_GROWTH = 5;
const G67_ANCESTRAL_X_FAST_EXP_SPECIES = new Set([
    'Articuno',
    'Zapdos',
    'Moltres',
    'Raikou',
    'Entei',
    'Suicune',
    'Regirock',
    'Regice',
    'Registeel',
    'Latias',
    'Latios',
    'Uxie',
    'Mesprit',
    'Azelf',
    'Heatran',
    'Regigigas',
    'Cresselia',
    'Cobalion',
    'Terrakion',
    'Virizion',
    'Tornadus',
    'Thundurus',
    'Landorus',
    'Mewtwo',
    'Mew',
    'Lugia',
    'Ho-Oh',
    'Celebi',
    'Kyogre',
    'Groudon',
    'Rayquaza',
    'Jirachi',
    'Deoxys',
    'Dialga',
    'Palkia',
    'Giratina',
    'Phione',
    'Manaphy',
    'Darkrai',
    'Shaymin',
    'Arceus',
    'Victini',
    'Reshiram',
    'Zekrom',
    'Kyurem',
    'Keldeo',
    'Meloetta',
    'Genesect',
    'Xerneas',
    'Yveltal',
    'Zygarde',
    'Diancie',
    'Hoopa',
    'Volcanion'
].map((speciesName) => g67ToID(speciesName)));
const G67_BLOCK_POSITIONS = [
    0, 1, 2, 3, 0, 1, 3, 2, 0, 2, 1, 3, 0, 3, 1, 2,
    0, 2, 3, 1, 0, 3, 2, 1, 1, 0, 2, 3, 1, 0, 3, 2,
    2, 0, 1, 3, 3, 0, 1, 2, 2, 0, 3, 1, 3, 0, 2, 1,
    1, 2, 0, 3, 1, 3, 0, 2, 2, 1, 0, 3, 3, 1, 0, 2,
    2, 3, 0, 1, 3, 2, 0, 1, 1, 2, 3, 0, 1, 3, 2, 0,
    2, 1, 3, 0, 3, 1, 2, 0, 2, 3, 1, 0, 3, 2, 1, 0,
    0, 1, 2, 3, 0, 1, 3, 2, 0, 2, 1, 3, 0, 3, 1, 2,
    0, 2, 3, 1, 0, 3, 2, 1, 1, 0, 2, 3, 1, 0, 3, 2
];
const G67_FORM_OVERRIDES = {
    6: {
        Aegislash: {
            0: 'Aegislash-Shield',
            1: 'Aegislash-Blade',
            2: 'Aegislash-Both'
        }
    },
    7: {
        Aegislash: {
            0: 'Aegislash-Shield',
            1: 'Aegislash-Blade',
            2: 'Aegislash-Both'
        },
        Greninja: {
            1: 'Greninja-Bond'
        }
    }
};
const G6_VARIANTS = {
    XY: {
        generation: 6,
        detectedGame: 'XY',
        expectedBaseGame: 'g6',
        saveSize: 0x65600,
        metadataOffset: 0x65400,
        boxCount: 31,
        checksum: g67CRC16CCITT,
        locationResolver: resolveGen6MetLocationName,
        requiredBlocks: {
            boxLayout: { id: 12, offset: 0x04400, length: 0x0440 },
            party: { id: 18, offset: 0x14200, length: 0x061C },
            boxes: { id: 53, offset: 0x22600, length: 0x34AD0 }
        }
    },
    ORAS: {
        generation: 6,
        detectedGame: 'ORAS',
        expectedBaseGame: 'g6',
        saveSize: 0x76000,
        metadataOffset: 0x75E00,
        boxCount: 31,
        checksum: g67CRC16CCITT,
        locationResolver: resolveGen6MetLocationName,
        requiredBlocks: {
            boxLayout: { id: 12, offset: 0x04400, length: 0x0440 },
            party: { id: 18, offset: 0x14200, length: 0x061C },
            boxes: { id: 56, offset: 0x33000, length: 0x34AD0 }
        }
    }
};

$(document).ready(function () {
    if (window.baseGame !== 'g6' && (typeof settings === 'undefined' || settings.damageGen != 6)) {
        return;
    }

    $('#read-save').off('click.g6save').on('click.g6save', function () {
        if ($('#save-upload').length > 0) {
            $('#save-upload')[0].value = null;
        }
    });

    const saveInput = document.getElementById('save-upload');
    if (!saveInput) {
        return;
    }

    saveInput.addEventListener('change', function (event) {
        if (!g67ShouldHandleSaveUpload(6, 'g6')) {
            return;
        }

        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const selectedName = ($('#save-upload').val() || '').split('\\').pop() || file.name || 'save.sav';
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const result = parseGen6Save(e.target.result);
                saveUploaded = true;
                saveFileName = selectedName;
                savExt = ((selectedName.split('.').pop()) || '').toLowerCase();
                g67ShowLoadSuccess(selectedName, result.detectedGame);
                if (typeof window.applyImportedSnapshot === 'function') {
                    window.applyImportedSnapshot({
                        showdownImport: result.showdownImport,
                        deadMons: result.deadMons || [],
                        source: 'save-file',
                        replaceDeadMons: true
                    });
                } else {
                    $('.import-team-text').val(result.showdownImport);
                    $('#import').click();
                }
            } catch (err) {
                $('.import-team-text').val('');
                console.error('Failed to parse Gen 6 save file.', err);
                alert('Unable to parse this save. Only raw X/Y and Omega Ruby/Alpha Sapphire .sav files are supported right now.');
            }
        };

        reader.readAsArrayBuffer(file);
    });
});

function parseGen6Save(arrayBuffer) {
    return g67ParseSaveFile(arrayBuffer, G6_VARIANTS);
}

function g67ShouldHandleSaveUpload(expectedDamageGen, expectedBaseGame) {
    if (window.baseGame !== expectedBaseGame) {
        return false;
    }
    if ((typeof TITLE === 'string' && TITLE.includes('Imperium')) || TITLE === 'Pokemon Null') {
        return false;
    }
    return true;
}

function g67ParseSaveFile(arrayBuffer, variants) {
    const bytes = new Uint8Array(arrayBuffer || 0);
    const variant = g67DetectVariant(bytes, variants);
    g67ValidateRequiredBlocks(bytes, variant);

    const partyMons = [];
    const boxMons = [];
    const partyBlock = variant.requiredBlocks.party;
    const boxesBlock = variant.requiredBlocks.boxes;
    const partyCount = Math.max(0, Math.min(g67ReadU8(bytes, partyBlock.offset + (G67_PARTY_SLOTS * G67_PK_PARTY_SIZE)), G67_PARTY_SLOTS));

    for (let i = 0; i < partyCount; i++) {
        const offset = partyBlock.offset + (i * G67_PK_PARTY_SIZE);
        const chunk = bytes.slice(offset, offset + G67_PK_PARTY_SIZE);
        const mon = g67ParseMonChunk(chunk, variant, true, i + 1);
        if (mon) {
            partyMons.push(mon);
        }
    }

    const totalBoxSlots = variant.boxCount * G67_BOX_SLOTS;
    for (let i = 0; i < totalBoxSlots; i++) {
        const offset = boxesBlock.offset + (i * G67_PK_STORED_SIZE);
        const chunk = bytes.slice(offset, offset + G67_PK_STORED_SIZE);
        const mon = g67ParseMonChunk(chunk, variant, false, i + 1);
        if (mon) {
            boxMons.push(mon);
        }
    }

    let showdownImport = '';
    for (const mon of partyMons) {
        showdownImport += g67MonToShowdown(mon);
    }
    for (const mon of boxMons) {
        showdownImport += g67MonToShowdown(mon);
    }

    if (!showdownImport.trim()) {
        throw new Error('No valid party or boxed Pokemon were found.');
    }

    return {
        detectedGame: variant.detectedGame,
        partyMons,
        boxMons,
        deadMons: [],
        partyCount,
        importedBoxCount: boxMons.length,
        showdownImport
    };
}

function g67DetectVariant(bytes, variants) {
    const requested = typeof window.requestedBaseGame === 'string' ? window.requestedBaseGame : '';
    const candidates = requested && variants[requested] ? [variants[requested]] : Object.values(variants);
    const matched = candidates.find((variant) => bytes.length === variant.saveSize);
    if (!matched) {
        const suffix = requested && variants[requested] ? ` for ${requested}` : '';
        throw new Error(`Unsupported save size${suffix}: 0x${bytes.length.toString(16)}`);
    }
    if (!g67HasBEEFFooter(bytes)) {
        throw new Error('Missing BEEF footer.');
    }
    return matched;
}

function g67HasBEEFFooter(bytes) {
    if (!bytes || bytes.length <= G67_BEEF_FOOTER_OFFSET) {
        return false;
    }
    return g67ReadU32LE(bytes, bytes.length - G67_BEEF_FOOTER_OFFSET) === 0x42454546;
}

function g67ValidateRequiredBlocks(bytes, variant) {
    const metadataOffset = variant.metadataOffset;
    if (g67ReadU32LE(bytes, metadataOffset + 0x10) !== 0x42454546) {
        throw new Error('Missing BEEF metadata magic.');
    }

    for (const blockName of Object.keys(variant.requiredBlocks)) {
        const block = variant.requiredBlocks[blockName];
        const footerOffset = metadataOffset + 0x14 + (block.id * 8);
        const storedLength = g67ReadU32LE(bytes, footerOffset);
        const storedId = g67ReadU16LE(bytes, footerOffset + 4);
        const storedChecksum = g67ReadU16LE(bytes, footerOffset + 6);
        if (storedLength !== block.length || storedId !== block.id) {
            throw new Error(`Block metadata mismatch for ${blockName}.`);
        }
        const dataEnd = block.offset + block.length;
        if (dataEnd > bytes.length) {
            throw new Error(`Block range overflow for ${blockName}.`);
        }
        const actualChecksum = variant.checksum(bytes.subarray(block.offset, dataEnd));
        if (actualChecksum !== storedChecksum) {
            throw new Error(`Checksum mismatch for ${blockName}.`);
        }
    }
}

function g67ParseMonChunk(chunk, variant, isParty, slot) {
    const expectedSize = isParty ? G67_PK_PARTY_SIZE : G67_PK_STORED_SIZE;
    if (!chunk || chunk.length < expectedSize) {
        return null;
    }

    const decrypted = g67DecryptPk67(chunk.slice(0, expectedSize));
    if (!g67IsValidPk67(decrypted)) {
        return null;
    }

    const speciesId = g67ReadU16LE(decrypted, 0x08);
    const rawSpeciesName = g67ResolveRawSpeciesName(speciesId);
    if (!rawSpeciesName) {
        return null;
    }

    const form = (g67ReadU8(decrypted, 0x1D) >> 3) & 0x1F;
    const abilityId = g67ReadU8(decrypted, 0x14);
    const speciesName = g67ResolveSpeciesFormKey(speciesId, form, variant.generation, abilityId);
    if (!speciesName) {
        return null;
    }

    const itemId = g67ReadU16LE(decrypted, 0x0A);
    const moveIds = [
        g67ReadU16LE(decrypted, 0x5A),
        g67ReadU16LE(decrypted, 0x5C),
        g67ReadU16LE(decrypted, 0x5E),
        g67ReadU16LE(decrypted, 0x60)
    ];
    const moveNames = moveIds
        .map((moveId) => g67ResolveMoveName(moveId))
        .filter(Boolean);
    const iv32 = g67ReadU32LE(decrypted, 0x74);
    const isNicknamed = ((iv32 >>> 31) & 1) === 1;
    const isEgg = ((iv32 >>> 30) & 1) === 1;
    if (isEgg) {
        return null;
    }

    const nickname = g67DecodeString(decrypted.subarray(0x40, 0x5A), variant.generation);
    const level = g67ResolveLevel(decrypted, speciesId, speciesName, variant.generation, isParty, variant.detectedGame);
    const natureName = (typeof natures !== 'undefined' && natures[g67ReadU8(decrypted, 0x1C)]) ? natures[g67ReadU8(decrypted, 0x1C)] : '';
    const metLocationId = g67ReadU16LE(decrypted, 0xDA);

    return {
        slot,
        isParty,
        speciesId,
        speciesName,
        rawSpeciesName,
        nickname,
        isNicknamed,
        itemId,
        itemName: g67ResolveItemName(itemId),
        abilityId,
        abilityName: g67ResolveAbilityName(abilityId),
        natureName,
        evs: [
            g67ReadU8(decrypted, 0x1E),
            g67ReadU8(decrypted, 0x1F),
            g67ReadU8(decrypted, 0x20),
            g67ReadU8(decrypted, 0x21),
            g67ReadU8(decrypted, 0x22),
            g67ReadU8(decrypted, 0x23)
        ],
        ivs: [
            iv32 & 0x1F,
            (iv32 >>> 5) & 0x1F,
            (iv32 >>> 10) & 0x1F,
            (iv32 >>> 15) & 0x1F,
            (iv32 >>> 20) & 0x1F,
            (iv32 >>> 25) & 0x1F
        ],
        moveNames,
        level,
        metLocationId,
        metLocationName: variant.locationResolver(metLocationId)
    };
}

function g67IsValidPk67(decrypted) {
    if (!decrypted || decrypted.length < G67_PK_STORED_SIZE) {
        return false;
    }
    if (g67ReadU16LE(decrypted, 0x04) !== 0) {
        return false;
    }
    const storedChecksum = g67ReadU16LE(decrypted, 0x06);
    const actualChecksum = g67Add16(decrypted.subarray(0x08, G67_PK_STORED_SIZE));
    if (storedChecksum !== actualChecksum) {
        return false;
    }
    const speciesId = g67ReadU16LE(decrypted, 0x08);
    return speciesId > 0 && Boolean(g67ResolveRawSpeciesName(speciesId));
}

function g67DecryptPk67(chunk) {
    const data = new Uint8Array(chunk);
    const pv = g67ReadU32LE(data, 0x00);
    const sv = (pv >>> 13) & 31;
    g67CryptArray(data.subarray(0x08, G67_PK_STORED_SIZE), pv);
    if (data.length > G67_PK_STORED_SIZE) {
        g67CryptArray(data.subarray(G67_PK_STORED_SIZE), pv);
    }
    const order = G67_BLOCK_POSITIONS.slice(sv * 4, (sv * 4) + 4);
    if (!order.length) {
        return data;
    }
    const shuffled = data.slice(0x08, G67_PK_STORED_SIZE);
    const unshuffled = new Uint8Array(shuffled.length);
    for (let i = 0; i < 4; i++) {
        const sourceIndex = order[i] * 56;
        const destIndex = i * 56;
        unshuffled.set(shuffled.subarray(sourceIndex, sourceIndex + 56), destIndex);
    }
    data.set(unshuffled, 0x08);
    return data;
}

function g67CryptArray(bytes, seed) {
    for (let i = 0; i + 1 < bytes.length; i += 2) {
        seed = (Math.imul(0x41C64E6D, seed) + 0x6073) >>> 0;
        const xorValue = (seed >>> 16) & 0xFFFF;
        const word = (bytes[i] | (bytes[i + 1] << 8)) ^ xorValue;
        bytes[i] = word & 0xFF;
        bytes[i + 1] = (word >>> 8) & 0xFF;
    }
}

function g67ResolveRawSpeciesName(speciesId) {
    const raw = (typeof sav_pok_names !== 'undefined' && sav_pok_names[speciesId]) ? String(sav_pok_names[speciesId]).trim() : '';
    if (!raw || raw === 'Egg' || raw === 'Bad Egg') {
        return '';
    }
    return raw;
}

function g67ResolveSpeciesFormKey(speciesId, form, generation, abilityId) {
    const rawSpeciesName = g67ResolveRawSpeciesName(speciesId);
    if (!rawSpeciesName) {
        return '';
    }

    const dex = g67GetSpeciesDex(generation);
    const baseKey = g67GetCanonicalSpeciesKey(rawSpeciesName, generation) || rawSpeciesName;
    const overrides = (G67_FORM_OVERRIDES[generation] && (G67_FORM_OVERRIDES[generation][baseKey] || G67_FORM_OVERRIDES[generation][rawSpeciesName])) || null;
    if (overrides && overrides[form] && dex[overrides[form]]) {
        return overrides[form];
    }

    const baseEntry = dex[baseKey];
    if (form > 0 && baseEntry && Array.isArray(baseEntry.otherFormes) && baseEntry.otherFormes[form - 1] && dex[baseEntry.otherFormes[form - 1]]) {
        return baseEntry.otherFormes[form - 1];
    }

    if (generation === 7 && baseKey === 'Greninja' && form > 0) {
        if (dex['Greninja-Bond']) {
            return 'Greninja-Bond';
        }
        if (dex['Greninja-Ash']) {
            return 'Greninja-Ash';
        }
    }

    if (baseEntry) {
        return baseKey;
    }

    const directAlt = g67GetCanonicalSpeciesKey(`${rawSpeciesName}-${form}`, generation);
    if (directAlt && dex[directAlt]) {
        return directAlt;
    }

    return baseKey;
}

function g67GetSpeciesDex(generation) {
    if (typeof calc === 'undefined' || !calc.SPECIES || !calc.SPECIES[generation]) {
        return {};
    }
    return calc.SPECIES[generation];
}

function g67GetCanonicalSpeciesKey(rawName, generation) {
    const cache = g67GetSpeciesNameCache(generation);
    const direct = cache[g67ToID(rawName)];
    if (direct) {
        return direct;
    }
    const normalized = String(rawName || '')
        .replace(/[’‘]/g, "'")
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m');
    return cache[g67ToID(normalized)] || '';
}

function g67GetSpeciesNameCache(generation) {
    window._g67SpeciesNameCaches ||= {};
    if (window._g67SpeciesNameCaches[generation]) {
        return window._g67SpeciesNameCaches[generation];
    }
    const dex = g67GetSpeciesDex(generation);
    const cache = {};
    for (const key of Object.keys(dex)) {
        cache[g67ToID(key)] = key;
    }
    window._g67SpeciesNameCaches[generation] = cache;
    return cache;
}

function g67ResolveLevel(decrypted, speciesId, speciesName, generation, isParty, detectedGame) {
    if (isParty) {
        const level = g67ReadU8(decrypted, 0xEC);
        if (level >= 1 && level <= 100) {
            return level;
        }
    }
    const growthRate = g67ResolveGrowthRate(speciesId, speciesName, generation, detectedGame);
    if (!Number.isFinite(growthRate) || typeof expTables === 'undefined' || !expTables[growthRate] || typeof get_level !== 'function') {
        return null;
    }
    try {
        return get_level(expTables[growthRate], g67ReadU32LE(decrypted, 0x10));
    } catch (err) {
        return null;
    }
}

function g67ResolveGrowthRate(speciesId, speciesName, generation, detectedGame) {
    const ancestralXGrowthRate = g67ResolveAncestralXGrowthRate(speciesName, generation, detectedGame);
    if (Number.isFinite(ancestralXGrowthRate)) {
        return ancestralXGrowthRate;
    }

    const dex = g67GetSpeciesDex(generation);
    const entry = dex[speciesName];
    if (entry && Number.isFinite(entry.gr)) {
        return entry.gr;
    }
    if (entry && entry.baseSpecies && dex[entry.baseSpecies] && Number.isFinite(dex[entry.baseSpecies].gr)) {
        return dex[entry.baseSpecies].gr;
    }
    const fallback = generation === 6 ? window.g6GrowthGroups : window.g7GrowthGroups;
    if (Array.isArray(fallback) && Number.isInteger(speciesId) && speciesId >= 0 && speciesId < fallback.length) {
        const growthRate = fallback[speciesId];
        if (Number.isFinite(growthRate)) {
            return growthRate;
        }
    }
    return null;
}

function g67ResolveAncestralXGrowthRate(speciesName, generation, detectedGame) {
    if (!g67ShouldUseAncestralXExpTables(generation, detectedGame)) {
        return null;
    }
    return g67IsAncestralXFastExpSpecies(speciesName, generation)
        ? G67_ANCESTRAL_X_FAST_GROWTH
        : G67_ANCESTRAL_X_SLOW_GROWTH;
}

function g67ShouldUseAncestralXExpTables(generation, detectedGame) {
    return generation === 6
        && detectedGame === 'XY'
        && typeof TITLE === 'string'
        && TITLE === 'Ancestral X';
}

function g67IsAncestralXFastExpSpecies(speciesName, generation) {
    const dex = g67GetSpeciesDex(generation);
    let currentSpeciesName = speciesName;
    for (let depth = 0; currentSpeciesName && depth < 4; depth++) {
        if (G67_ANCESTRAL_X_FAST_EXP_SPECIES.has(g67ToID(currentSpeciesName))) {
            return true;
        }
        const entry = dex[currentSpeciesName];
        if (!entry || !entry.baseSpecies || entry.baseSpecies === currentSpeciesName) {
            break;
        }
        currentSpeciesName = entry.baseSpecies;
    }
    return false;
}

function g67ResolveAbilityName(abilityId) {
    if (!abilityId) {
        return '';
    }
    const name = (typeof sav_abilities !== 'undefined' && sav_abilities[abilityId]) ? sav_abilities[abilityId] : '';
    return g67NormalizeToken(name);
}

function g67ResolveItemName(itemId) {
    if (!itemId) {
        return '';
    }
    let itemName = '';
    if (typeof sav_item_names !== 'undefined' && sav_item_names[itemId]) {
        itemName = sav_item_names[itemId];
    } else if (Array.isArray(window.g67SupplementalItemNames) && Number.isFinite(window.g67SupplementalItemStart)) {
        const extraIndex = itemId - window.g67SupplementalItemStart;
        if (extraIndex >= 0 && extraIndex < window.g67SupplementalItemNames.length) {
            itemName = window.g67SupplementalItemNames[extraIndex];
        }
    }
    itemName = g67NormalizeToken(itemName);
    if (!itemName || itemName.indexOf('?') !== -1) {
        return '';
    }
    return itemName;
}

function g67ResolveMoveName(moveId) {
    if (!moveId) {
        return '';
    }
    const moveName = (typeof sav_move_names !== 'undefined' && sav_move_names[moveId]) ? sav_move_names[moveId] : '';
    return g67NormalizeToken(moveName || `Move ${moveId}`);
}

function g67MonToShowdown(mon) {
    if (!mon || !mon.speciesName) {
        return '';
    }

    const lines = [];
    const species = g67NormalizeToken(mon.speciesName);
    const nickname = String(mon.nickname || '').trim();
    let lead = species;
    if (mon.isNicknamed && nickname) {
        const normalizedNick = g67NormalizeToken(nickname);
        if (normalizedNick && g67ToID(normalizedNick) !== g67ToID(species)) {
            lead = `${nickname} (${species})`;
        }
    }

    if (mon.itemName) {
        lead += ` @ ${mon.itemName}`;
    }
    lines.push(lead);

    if (Number.isFinite(mon.level) && mon.level > 0) {
        lines.push(`Level: ${mon.level}`);
    }
    if (mon.abilityName) {
        lines.push(`Ability: ${mon.abilityName}`);
    }
    if (mon.natureName) {
        lines.push(`${mon.natureName} Nature`);
    }
    if (typeof settings !== 'undefined' && settings && settings.hasEvs) {
        lines.push(`EVs: ${mon.evs[0]} HP / ${mon.evs[1]} Atk / ${mon.evs[2]} Def / ${mon.evs[3]} Spe / ${mon.evs[4]} SpA / ${mon.evs[5]} SpD`);
    }
    lines.push(`IVs: ${mon.ivs[0]} HP / ${mon.ivs[1]} Atk / ${mon.ivs[2]} Def / ${mon.ivs[3]} Spe / ${mon.ivs[4]} SpA / ${mon.ivs[5]} SpD`);
    for (const moveName of mon.moveNames) {
        lines.push(`- ${moveName}`);
    }
    lines.push(`Met: ${mon.metLocationName || g67FormatUnknownLocation(mon.metLocationId)}`);

    return `${lines.join('\n')}\n\n`;
}

function g67DecodeString(bytes, generation) {
    const chars = [];
    for (let i = 0; i + 1 < bytes.length; i += 2) {
        const value = g67ReadU16LE(bytes, i);
        if (value === 0) {
            break;
        }
        if (value === 0xE08E) {
            chars.push('♂');
            continue;
        }
        if (value === 0xE08F) {
            chars.push('♀');
            continue;
        }
        chars.push(String.fromCharCode(value));
    }
    let decoded = chars.join('').trim();
    if (generation === 7) {
        decoded = decoded.replace(/[\uE800-\uF8FF]/g, '');
    }
    return decoded;
}

function resolveGen6MetLocationName(locationId) {
    return g67ResolveBankedLocationName(locationId, window.g6LocationBanks);
}

function resolveGen7MetLocationName(locationId) {
    return g67ResolveBankedLocationName(locationId, window.g7LocationBanks);
}

function g67ResolveBankedLocationName(locationId, banks) {
    if (!banks) {
        return g67FormatUnknownLocation(locationId);
    }
    let bank = 0;
    let index = locationId;
    if (locationId >= 60000) {
        bank = 6;
        index = locationId - 60000;
    } else if (locationId >= 40000) {
        bank = 4;
        index = locationId - 40000;
    } else if (locationId >= 30000) {
        bank = 3;
        index = locationId - 30000;
    }
    const names = banks[bank];
    const resolved = (names && index >= 0 && index < names.length) ? String(names[index] || '').trim() : '';
    if (!resolved || /^[-—\[]/.test(resolved)) {
        return g67FormatUnknownLocation(locationId);
    }
    return resolved;
}

function g67FormatUnknownLocation(locationId) {
    return `Unknown Location (0x${(locationId >>> 0).toString(16).toUpperCase().padStart(4, '0')})`;
}

function g67ShowLoadSuccess(fileName, detectedGame) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    let changelogText = '<h4>Changelog:</h4>';
    changelogText += `<p>${fileName} loaded at ${timeString} (${detectedGame})</p>`;
    if ($('#changelog').length == 0) {
        $('#clearSets').after("<p id='changelog'></p>");
    }
    $('#changelog').html(changelogText).show();
}

function g67NormalizeToken(text) {
    return String(text || '')
        .replace(/[’‘]/g, "'")
        .replace(/Poké/g, 'Poke')
        .replace(/\u00E9/g, 'e')
        .trim();
}

function g67ToID(text) {
    if (typeof calc !== 'undefined' && typeof calc.toID === 'function') {
        return calc.toID(text);
    }
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function g67Add16(bytes) {
    let checksum = 0;
    for (let i = 0; i + 1 < bytes.length; i += 2) {
        checksum = (checksum + (bytes[i] | (bytes[i + 1] << 8))) & 0xFFFF;
    }
    return checksum;
}

function g67CRC16CCITT(bytes) {
    let top = 0xFF;
    let bot = 0xFF;
    for (let i = 0; i < bytes.length; i++) {
        let x = (bytes[i] ^ top) & 0xFF;
        x ^= (x >>> 4);
        top = (bot ^ (x >>> 3) ^ ((x << 4) & 0xFF)) & 0xFF;
        bot = (x ^ ((x << 5) & 0xFF)) & 0xFF;
    }
    return ((top << 8) | bot) >>> 0;
}

function g67CRC16Invert(bytes) {
    let crc = 0xFFFF;
    for (let i = 0; i < bytes.length; i++) {
        crc ^= bytes[i];
        for (let bit = 0; bit < 8; bit++) {
            if (crc & 1) {
                crc = (crc >>> 1) ^ 0xA001;
            } else {
                crc >>>= 1;
            }
        }
    }
    return (~crc) & 0xFFFF;
}

function g67ReadU8(bytes, offset) {
    if (!bytes || offset < 0 || offset >= bytes.length) {
        return 0;
    }
    return bytes[offset] & 0xFF;
}

function g67ReadU16LE(bytes, offset) {
    if (!bytes || offset < 0 || offset + 1 >= bytes.length) {
        return 0;
    }
    return (bytes[offset] | (bytes[offset + 1] << 8)) >>> 0;
}

function g67ReadU32LE(bytes, offset) {
    if (!bytes || offset < 0 || offset + 3 >= bytes.length) {
        return 0;
    }
    return (
        (bytes[offset]) |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)
    ) >>> 0;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        __test: {
            G67_ANCESTRAL_X_FAST_GROWTH,
            G67_ANCESTRAL_X_SLOW_GROWTH,
            g67ResolveAncestralXGrowthRate,
            g67ResolveGrowthRate,
            g67ResolveLevel,
            g67ShouldUseAncestralXExpTables,
            g67IsAncestralXFastExpSpecies
        }
    };
}
