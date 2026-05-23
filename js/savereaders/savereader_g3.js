const G3_SECTOR_SIZE = 0x1000;
const G3_SECTOR_DATA_SIZE = 0x0F80;
const G3_MAIN_SECTION_COUNT = 14;
const G3_SLOT_SIZE = G3_SECTOR_SIZE * G3_MAIN_SECTION_COUNT;
const G3_FULL_SAVE_SIZE = 0x20000;
const G3_HALF_SAVE_SIZE = 0x10000;
const G3_PARTY_STRUCT_SIZE = 100;
const G3_BOX_STRUCT_SIZE = 80;
const G3_BOXES_TO_IMPORT = 13;
const G3_TOTAL_BOX_COUNT = 14;
const G3_SLOTS_PER_BOX = 30;
const G3_FIRST_UNALIGNED_NATIONAL = 252;
const G3_FIRST_UNALIGNED_INTERNAL = 277;
const G3_SPECIES_INTERNAL_TO_NATIONAL = [
    -25, -25, -25,
    -25, -25, -25, -25, -25, -25, -25, -25, -25, -25,
    -25, -25, -25, -25, -25, -25, -25, -25, -25, -25,
    -25, -11, -11, -11, -28, -28, -21, -21, 19, -31,
    -31, -28, -28, 7, 7, -15, -15, 35, 25, 25,
    -21, 3, -20, 16, 16, 45, 15, 15, 21, 21,
    -12, -12, -4, -4, -4, -39, -39, -28, -28, -17,
    -17, 22, 22, 22, -13, -13, 15, 15, -11, -11,
    -52, -26, -26, -42, -42, -52, -49, -49, -25, -25,
    0, -6, -6, -48, -77, -77, -77, -51, -51, -12,
    -77, -77, -77, -7, -7, -7, -17, -24, -24, -43,
    -45, -12, -78, -78, -78, -34, -73, -73, -43, -43,
    -43, -43, -112, -112, -112, -24, -24, -24, -24, -24,
    -24, -24, -24, -24, -22, -22, -22, -27, -27, -24,
    -24, -53
];
const G3_VARIANT_EMERALD = {
    key: 'Emerald',
    partyCountOffset: 0x234,
    partyBaseOffset: 0x238,
    securityKeyOffset: 0x0AC,
    largeMoneyOffset: 0x0490
};
const G3_VARIANT_RS = {
    key: 'RS',
    partyCountOffset: 0x234,
    partyBaseOffset: 0x238,
    securityKeyOffset: null,
    largeMoneyOffset: 0x0490
};
const G3_VARIANT_FRLG = {
    key: 'FRLG',
    partyCountOffset: 0x034,
    partyBaseOffset: 0x038,
    securityKeyOffset: 0xF20,
    largeMoneyOffset: 0x0290
};

$(document).ready(function () {
    if (window.baseGame !== 'g3' && (typeof settings === 'undefined' || settings.damageGen != 3)) {
        return;
    }

    $('#read-save').off('click.g3save').on('click.g3save', function () {
        if ($('#save-upload').length > 0) {
            $('#save-upload')[0].value = null;
        }
    });

    const saveInput = document.getElementById('save-upload');
    if (!saveInput) {
        return;
    }

    saveInput.addEventListener('change', function (event) {
        if (!g3ShouldHandleSaveUpload()) {
            return;
        }

        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        const selectedName = ($('#save-upload').val() || '').split('\\').pop() || file.name || 'save.sav';

        reader.onload = function (e) {
            try {
                const result = parseGen3SaveFile(e.target.result);
                saveUploaded = true;
                saveFileName = selectedName;
                savExt = ((selectedName.split('.').pop()) || '').toLowerCase();
                g3ShowLoadSuccess(selectedName, result.detectedGame);
                if (typeof window.applyImportedSnapshot === 'function') {
                    window.applyImportedSnapshot({
                        showdownImport: result.showdownImport,
                        deadMons: result.deadMons || [],
                        source: 'save-file',
                        replaceDeadMons: true
                    });
                } else {
                    if (typeof importShowdownTextIntoImporter === 'function') {
                        importShowdownTextIntoImporter(result.showdownImport, false, { applyRomReplacements: true });
                    } else {
                        $('.import-team-text').val(result.showdownImport);
                        $('#import').click();
                    }
                }
            } catch (err) {
                console.error('Failed to parse vanilla Gen 3 save file.', err);
                alert('Unable to parse this save. Only raw Emerald/FireRed/LeafGreen .sav/.srm saves are supported right now.');
            }
        };

        reader.readAsArrayBuffer(file);
    });
});

function g3ShouldHandleSaveUpload() {
    if (window.baseGame !== 'g3') {
        return false;
    }
    if (typeof TITLE === 'string' && TITLE.includes('Unbound')) {
        return false;
    }
    if ((typeof TITLE === 'string' && TITLE.includes('Imperium')) || TITLE === 'Pokemon Null') {
        return false;
    }
    return true;
}

function parseGen3SaveFile(arrayBuffer) {
    const rawBytes = new Uint8Array(arrayBuffer || 0);
    if (rawBytes.length < G3_HALF_SAVE_SIZE) {
        throw new Error(`Gen 3 save is too small: 0x${rawBytes.length.toString(16)}`);
    }
    const targetSize = rawBytes.length >= G3_FULL_SAVE_SIZE ? G3_FULL_SAVE_SIZE : G3_HALF_SAVE_SIZE;
    const bytes = rawBytes.slice(0, targetSize);

    const activeSlot = g3DetermineActiveSlot(bytes);
    const buffers = g3RebuildLogicalBuffers(bytes, activeSlot);
    const variant = g3DetectGameVariant(buffers);
    const parsedParty = [];
    const parsedBoxes = [];

    const partyCount = Math.max(0, Math.min(g3ReadU8(buffers.largeBuffer, variant.partyCountOffset), 6));
    for (let i = 0; i < partyCount; i++) {
        const start = variant.partyBaseOffset + (i * G3_PARTY_STRUCT_SIZE);
        const chunk = buffers.largeBuffer.slice(start, start + G3_PARTY_STRUCT_SIZE);
        const mon = g3ParseMonChunk(chunk, true, i + 1);
        if (mon) {
            parsedParty.push(mon);
        }
    }

    const totalStorageSlots = G3_TOTAL_BOX_COUNT * G3_SLOTS_PER_BOX;
    const deadMons = [];
    for (let i = 0; i < totalStorageSlots; i++) {
        const start = 4 + (i * G3_BOX_STRUCT_SIZE);
        const chunk = buffers.storageBuffer.slice(start, start + G3_BOX_STRUCT_SIZE);
        const mon = g3ParseMonChunk(chunk, false, i + 1);
        if (mon) {
            if (i < (G3_BOXES_TO_IMPORT * G3_SLOTS_PER_BOX)) {
                parsedBoxes.push(mon);
            } else {
                deadMons.push({
                    speciesName: mon.speciesName,
                    speciesId: mon.speciesId,
                    nickname: mon.nickname || '',
                    met: mon.metLocation || '',
                    box: Math.floor(i / G3_SLOTS_PER_BOX) + 1,
                    slot: (i % G3_SLOTS_PER_BOX) + 1,
                    source: 'save-file'
                });
            }
        }
    }

    let showdownImport = '';
    for (const mon of parsedParty) {
        showdownImport += g3MonToShowdown(mon);
    }
    for (const mon of parsedBoxes) {
        showdownImport += g3MonToShowdown(mon);
    }

    return {
        detectedGame: variant.key,
        partyMons: parsedParty,
        boxMons: parsedBoxes,
        deadMons,
        partyCount,
        importedBoxCount: parsedBoxes.length,
        showdownImport
    };
}

function g3DetermineActiveSlot(bytes) {
    const slotsToCheck = bytes.length >= G3_FULL_SAVE_SIZE ? [0, 1] : [0];
    const slotInfos = slotsToCheck
        .map((slotIndex) => g3ReadSlotInfo(bytes, slotIndex))
        .filter((info) => info && info.valid);

    if (slotInfos.length === 0) {
        throw new Error('No valid Gen 3 save slot found.');
    }

    let active = slotInfos[0];
    for (let i = 1; i < slotInfos.length; i++) {
        if (g3CompareCounters(slotInfos[i].counter, active.counter) > 0) {
            active = slotInfos[i];
        }
    }
    return active;
}

function g3ReadSlotInfo(bytes, slotIndex) {
    const slotBase = slotIndex * G3_SLOT_SIZE;
    if (slotBase + G3_SLOT_SIZE > bytes.length) {
        return null;
    }

    const sectorOffsets = new Array(G3_MAIN_SECTION_COUNT);
    let sectorZeroOffset = -1;

    for (let sector = 0; sector < G3_MAIN_SECTION_COUNT; sector++) {
        const sectorOffset = slotBase + (sector * G3_SECTOR_SIZE);
        const sectionId = g3ReadU16LE(bytes, sectorOffset + 0xFF4);
        if (!Number.isFinite(sectionId) || sectionId < 0 || sectionId >= G3_MAIN_SECTION_COUNT) {
            return { slotIndex, valid: false };
        }
        if (sectorOffsets[sectionId] !== undefined) {
            return { slotIndex, valid: false };
        }
        sectorOffsets[sectionId] = sectorOffset;
        if (sectionId === 0) {
            sectorZeroOffset = sectorOffset;
        }
    }

    if (sectorOffsets.some((offset) => typeof offset !== 'number') || sectorZeroOffset < 0) {
        return { slotIndex, valid: false };
    }

    return {
        slotIndex,
        slotBase,
        sectorOffsets,
        sectorZeroOffset,
        counter: g3ReadU32LE(bytes, sectorZeroOffset + 0xFFC),
        valid: true
    };
}

function g3CompareCounters(counterA, counterB) {
    if (counterA === 0xFFFFFFFF && counterB !== 0xFFFFFFFE) {
        return -1;
    }
    if (counterB === 0xFFFFFFFF && counterA !== 0xFFFFFFFE) {
        return 1;
    }
    if (counterA > counterB) {
        return 1;
    }
    if (counterA < counterB) {
        return -1;
    }
    return 0;
}

function g3RebuildLogicalBuffers(bytes, slotInfo) {
    const smallBuffer = new Uint8Array(G3_SECTOR_DATA_SIZE);
    const largeBuffer = new Uint8Array(4 * G3_SECTOR_DATA_SIZE);
    const storageBuffer = new Uint8Array(9 * G3_SECTOR_DATA_SIZE);

    for (let sectionId = 0; sectionId < G3_MAIN_SECTION_COUNT; sectionId++) {
        const sectorOffset = slotInfo.sectorOffsets[sectionId];
        const data = bytes.slice(sectorOffset, sectorOffset + G3_SECTOR_DATA_SIZE);
        if (sectionId === 0) {
            smallBuffer.set(data, 0);
        } else if (sectionId >= 1 && sectionId <= 4) {
            largeBuffer.set(data, (sectionId - 1) * G3_SECTOR_DATA_SIZE);
        } else {
            storageBuffer.set(data, (sectionId - 5) * G3_SECTOR_DATA_SIZE);
        }
    }

    return { smallBuffer, largeBuffer, storageBuffer };
}

function g3DetectGameVariant(buffers) {
    const requested = typeof window.requestedBaseGame === 'string' ? window.requestedBaseGame : '';
    const requestedVariants = {
        RS: G3_VARIANT_RS,
        E: G3_VARIANT_EMERALD,
        FRLG: G3_VARIANT_FRLG
    };
    const variants = requestedVariants[requested] ? [requestedVariants[requested]] : [G3_VARIANT_EMERALD, G3_VARIANT_RS, G3_VARIANT_FRLG];
    let best = null;

    for (const variant of variants) {
        const partyCount = g3ReadU8(buffers.largeBuffer, variant.partyCountOffset);
        if (!Number.isFinite(partyCount) || partyCount < 0 || partyCount > 6) {
            continue;
        }

        let score = 1;
        const securityKey = variant.securityKeyOffset === null ? 0 : g3ReadU32LE(buffers.smallBuffer, variant.securityKeyOffset) >>> 0;
        const money = (g3ReadU32LE(buffers.largeBuffer, variant.largeMoneyOffset) ^ securityKey) >>> 0;
        if (money <= 999999) {
            score += 1;
        }

        let firstMon = null;
        if (partyCount > 0) {
            const chunkStart = variant.partyBaseOffset;
            const chunk = buffers.largeBuffer.slice(chunkStart, chunkStart + G3_PARTY_STRUCT_SIZE);
            firstMon = g3ParseMonChunk(chunk, true, 1);
            if (!firstMon) {
                continue;
            }
            score += 3;
            if (Number.isFinite(firstMon.level) && firstMon.level >= 1 && firstMon.level <= 100) {
                score += 1;
            }
        }

        if (!best || score > best.score) {
            best = {
                key: variant.key,
                partyCountOffset: variant.partyCountOffset,
                partyBaseOffset: variant.partyBaseOffset,
                securityKeyOffset: variant.securityKeyOffset,
                largeMoneyOffset: variant.largeMoneyOffset,
                score,
                firstMon
            };
        }
    }

    if (!best) {
        throw new Error('Unable to detect Emerald or FRLG layout.');
    }
    return best;
}

function g3ParseMonChunk(chunk, isParty, slot) {
    if (!chunk || chunk.length < G3_BOX_STRUCT_SIZE) {
        return null;
    }

    const pid = g3ReadU32LE(chunk, 0x00);
    const otId = g3ReadU32LE(chunk, 0x04);
    if (!pid) {
        return null;
    }

    const flags = g3ReadU8(chunk, 0x13);
    if (((flags >> 1) & 0x1) !== 1) {
        return null;
    }

    const suborder = orderFormats[pid % 24];
    if (!suborder) {
        return null;
    }

    const key = (pid ^ otId) >>> 0;
    const decrypted = [];
    for (let i = 0; i < 12; i++) {
        decrypted.push((g3ReadU32LE(chunk, 0x20 + (i * 4)) ^ key) >>> 0);
    }

    const growthIndex = suborder.indexOf(1);
    const movesIndex = suborder.indexOf(2);
    const evsIndex = suborder.indexOf(3);
    const miscIndex = suborder.indexOf(4);
    if (growthIndex < 0 || movesIndex < 0 || evsIndex < 0 || miscIndex < 0) {
        return null;
    }

    const growthWord0 = decrypted[growthIndex * 3] >>> 0;
    const growthWord1 = decrypted[(growthIndex * 3) + 1] >>> 0;
    const speciesInternalId = growthWord0 & 0xFFFF;
    const speciesId = g3GetNationalSpeciesId(speciesInternalId);
    const speciesName = sav_pok_names[speciesId];
    if (!g3IsValidSpeciesName(speciesName)) {
        return null;
    }

    const itemId = (growthWord0 >>> 16) & 0xFFFF;
    const itemName = g3NormalizeItemName(emImpItems[itemId]);
    const nickname = g3DecodeText(chunk, 0x08, 10);
    const natureName = natures[pid % 25] || null;

    const moveWord0 = decrypted[movesIndex * 3] >>> 0;
    const moveWord1 = decrypted[(movesIndex * 3) + 1] >>> 0;
    const moveIds = [
        moveWord0 & 0xFFFF,
        (moveWord0 >>> 16) & 0xFFFF,
        moveWord1 & 0xFFFF,
        (moveWord1 >>> 16) & 0xFFFF
    ];
    const moveNames = moveIds
        .filter((id) => id > 0 && pokeemeraldMoves[id] && pokeemeraldMoves[id] !== 'None')
        .map((id) => pokeemeraldMoves[id]);

    const evWord0 = decrypted[evsIndex * 3] >>> 0;
    const evWord1 = decrypted[(evsIndex * 3) + 1] >>> 0;
    const evs = [
        evWord0 & 0xFF,
        (evWord0 >>> 8) & 0xFF,
        (evWord0 >>> 16) & 0xFF,
        (evWord0 >>> 24) & 0xFF,
        evWord1 & 0xFF,
        (evWord1 >>> 8) & 0xFF
    ];

    const ivWord = decrypted[(miscIndex * 3) + 1] >>> 0;
    const ivs = [
        ivWord & 0x1F,
        (ivWord >>> 5) & 0x1F,
        (ivWord >>> 10) & 0x1F,
        (ivWord >>> 15) & 0x1F,
        (ivWord >>> 20) & 0x1F,
        (ivWord >>> 25) & 0x1F
    ];
    const abilityBit = (ivWord >>> 31) & 0x1;
    const abilityName = g3ResolveAbilityName(speciesName, abilityBit);
    const isEgg = ((ivWord >>> 30) & 0x1) === 1 || ((flags >> 2) & 0x1) === 1;
    if (isEgg) {
        return null;
    }

    let level = null;
    if (isParty && chunk.length >= G3_PARTY_STRUCT_SIZE) {
        const partyLevel = g3ReadU8(chunk, 0x54);
        if (partyLevel >= 1 && partyLevel <= 100) {
            level = partyLevel;
        }
    }
    if (!Number.isFinite(level)) {
        level = g3ResolveLevel(speciesName, growthWord1 >>> 0);
    }

    return {
        slot,
        isParty,
        pid,
        otId,
        speciesId,
        speciesName,
        nickname,
        itemId,
        itemName,
        level,
        natureName,
        evs,
        ivs,
        abilityName,
        moveNames
    };
}

function g3ResolveLevel(speciesName, exp) {
    const growthRate = g3ResolveGrowthRate(speciesName);
    if (!Number.isFinite(growthRate) || typeof expTables === 'undefined' || !expTables[growthRate] || typeof get_level !== 'function') {
        return null;
    }
    try {
        const level = get_level(expTables[growthRate], exp);
        return (level >= 1 && level <= 100) ? level : null;
    } catch (_err) {
        return null;
    }
}

function g3ResolveGrowthRate(speciesName) {
    if (typeof learnsets === 'undefined' || !speciesName) {
        return null;
    }

    const candidates = [
        speciesName,
        speciesName.split('-').slice(0, 2).join('-'),
        speciesName.split('-')[0]
    ];

    for (const candidate of candidates) {
        const key = candidate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (learnsets[key] && Number.isFinite(learnsets[key].gr)) {
            return learnsets[key].gr;
        }
    }
    return null;
}

function g3ResolveAbilityName(speciesName, abilityBit) {
    if (!speciesName) {
        return null;
    }

    const normalizedAbilityBit = abilityBit === 1 ? 1 : 0;
    const gameSpecificAbilityList = g3GetGameSpecificAbilityList(speciesName);
    const gameSpecificAbilityName = g3ResolveAbilityNameFromList(gameSpecificAbilityList, normalizedAbilityBit);
    if (gameSpecificAbilityName) {
        return gameSpecificAbilityName;
    }

    let abilityList = null;
    if (typeof abilsPrimary === 'object' && abilsPrimary) {
        abilityList = abilsPrimary[speciesName] || abilsPrimary[speciesName.replace(/'/g, '\u2019')] || abilsPrimary[speciesName.replace(/\u2019/g, "'")] || null;
    }
    if (!abilityList && typeof abils === 'object' && abils) {
        abilityList = abils[speciesName] || abils[speciesName.replace(/'/g, '\u2019')] || abils[speciesName.replace(/\u2019/g, "'")] || null;
    }
    return g3ResolveAbilityNameFromList(abilityList, normalizedAbilityBit);
}

function g3GetGameSpecificAbilityList(speciesName) {
    const candidates = [
        speciesName,
        speciesName.replace(/'/g, '\u2019'),
        speciesName.replace(/\u2019/g, "'")
    ];
    const sources = [];

    if (typeof window !== 'undefined') {
        if (window.pokedex && typeof window.pokedex === 'object') {
            sources.push(window.pokedex);
        }
        if (window.poksData && typeof window.poksData === 'object') {
            sources.push(window.poksData);
        }
    }

    if (typeof pokedex === 'object' && pokedex) {
        sources.push(pokedex);
    }
    if (typeof poksData === 'object' && poksData) {
        sources.push(poksData);
    }

    for (const source of sources) {
        for (const candidate of candidates) {
            const speciesEntry = source && source[candidate];
            if (speciesEntry && typeof speciesEntry === 'object' && speciesEntry.abilities && typeof speciesEntry.abilities === 'object') {
                return speciesEntry.abilities;
            }
        }
    }

    return null;
}

function g3ResolveAbilityNameFromList(abilityList, abilityBit) {
    if (!abilityList || typeof abilityList !== 'object') {
        return null;
    }

    const preferredKeys = abilityBit === 1
        ? [1, '1', 0, '0', 2, '2', 'H', 'h']
        : [0, '0', 1, '1', 2, '2', 'H', 'h'];

    for (const key of preferredKeys) {
        const abilityName = abilityList[key];
        if (abilityName && abilityName !== 'None' && abilityName !== '-') {
            return abilityName;
        }
    }

    for (const abilityName of Object.values(abilityList)) {
        if (abilityName && abilityName !== 'None' && abilityName !== '-') {
            return abilityName;
        }
    }

    return null;
}

function g3MonToShowdown(mon) {
    if (!mon) {
        return '';
    }

    const lines = [];
    const speciesName = mon.speciesName || `Species-${mon.speciesId}`;
    const nickname = (mon.nickname || '').trim();
    let lead = speciesName;

    if (nickname && nickname.toLowerCase() !== speciesName.toLowerCase() && !speciesName.toLowerCase().includes(nickname.toLowerCase())) {
        lead = `${nickname} (${speciesName})`;
    }

    if (mon.itemId && mon.itemName) {
        lead += ` @ ${mon.itemName}`;
    }
    lines.push(lead);

    if (Number.isFinite(mon.level) && mon.level >= 1 && mon.level <= 100) {
        lines.push(`Level: ${mon.level}`);
    }
    if (mon.natureName) {
        lines.push(`${mon.natureName} Nature`);
    }
    if (typeof settings !== 'undefined' && settings && settings.hasEvs) {
        lines.push(`EVs: ${mon.evs[0]} HP / ${mon.evs[1]} Atk / ${mon.evs[2]} Def / ${mon.evs[3]} Spe / ${mon.evs[4]} SpA / ${mon.evs[5]} SpD`);
    }
    lines.push(`IVs: ${mon.ivs[0]} HP / ${mon.ivs[1]} Atk / ${mon.ivs[2]} Def / ${mon.ivs[3]} Spe / ${mon.ivs[4]} SpA / ${mon.ivs[5]} SpD`);
    if (mon.abilityName) {
        lines.push(`Ability: ${mon.abilityName}`);
    }
    for (const moveName of mon.moveNames) {
        lines.push(`- ${moveName}`);
    }

    return `${lines.join('\n')}\n\n`;
}

function g3ShowLoadSuccess(fileName, detectedGame) {
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

function g3ReadU8(bytes, offset) {
    if (!bytes || offset < 0 || offset >= bytes.length) {
        return 0;
    }
    return bytes[offset] & 0xFF;
}

function g3ReadU16LE(bytes, offset) {
    if (!bytes || offset < 0 || (offset + 1) >= bytes.length) {
        return 0;
    }
    return (bytes[offset] | (bytes[offset + 1] << 8)) >>> 0;
}

function g3ReadU32LE(bytes, offset) {
    if (!bytes || offset < 0 || (offset + 3) >= bytes.length) {
        return 0;
    }
    return (
        (bytes[offset]) |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)
    ) >>> 0;
}

function g3DecodeText(bytes, start, length) {
    if (!bytes || typeof gen3TextTable === 'undefined') {
        return '';
    }
    let out = '';
    for (let i = 0; i < length; i++) {
        const value = g3ReadU8(bytes, start + i);
        if (value === 0xFF || value === 0x00) {
            break;
        }
        out += gen3TextTable[value] || '';
    }
    return out.trim();
}

function g3GetNationalSpeciesId(rawSpeciesId) {
    if (rawSpeciesId < G3_FIRST_UNALIGNED_NATIONAL) {
        return rawSpeciesId;
    }
    const shift = rawSpeciesId - G3_FIRST_UNALIGNED_INTERNAL;
    if (shift < 0 || shift >= G3_SPECIES_INTERNAL_TO_NATIONAL.length) {
        return 0;
    }
    return rawSpeciesId + G3_SPECIES_INTERNAL_TO_NATIONAL[shift];
}

function g3IsValidSpeciesName(speciesName) {
    if (!speciesName || typeof speciesName !== 'string') {
        return false;
    }
    if (speciesName === 'Egg' || speciesName === 'Bad Egg') {
        return false;
    }
    if (!speciesName.replace(/\s/g, '')) {
        return false;
    }
    return true;
}

function g3NormalizeItemName(itemName) {
    if (!itemName || itemName === 'NONE' || itemName === 'None') {
        return '';
    }
    return g3TitleizeItem(itemName);
}

function g3TitleizeItem(itemName) {
    return itemName
        .toLowerCase()
        .split(/([ _-])/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
        .replace('_', ' ')
        .replace('Never Melt_Ice', 'Never-Melt Ice');
}
