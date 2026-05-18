const NULL_SUBSTRUCT_SELECTOR = [
    [0, 1, 2, 3],
    [0, 1, 3, 2],
    [0, 2, 1, 3],
    [0, 3, 1, 2],
    [0, 2, 3, 1],
    [0, 3, 2, 1],
    [1, 0, 2, 3],
    [1, 0, 3, 2],
    [2, 0, 1, 3],
    [3, 0, 1, 2],
    [2, 0, 3, 1],
    [3, 0, 2, 1],
    [1, 2, 0, 3],
    [1, 3, 0, 2],
    [2, 1, 0, 3],
    [3, 1, 0, 2],
    [2, 3, 0, 1],
    [3, 2, 0, 1],
    [1, 2, 3, 0],
    [1, 3, 2, 0],
    [2, 1, 3, 0],
    [3, 1, 2, 0],
    [2, 3, 1, 0],
    [3, 2, 1, 0],
];
const NULL_GEN3_SECTION_COUNT = 14;
const NULL_GEN3_SECTION_SIZE = 0x1000;
const NULL_GEN3_SECTION_DATA_SIZE = 0x0FF4;
const NULL_GEN3_BLOCK_SIZE = NULL_GEN3_SECTION_COUNT * NULL_GEN3_SECTION_SIZE; // 0xE000
const NULL_GEN3_BLOCK_A_OFFSET = 0x0000;
const NULL_GEN3_BLOCK_B_OFFSET = NULL_GEN3_BLOCK_SIZE;
const NULL_GEN3_SECTION_ID_OFFSET = 0x0FF4;
const NULL_GEN3_SIGNATURE_OFFSET = 0x0FF8;
const NULL_GEN3_SAVE_INDEX_OFFSET = 0x0FFC;
const NULL_GEN3_SECTION_SIGNATURE = 0x08012025;
const NULL_MON_LAYOUT_PARTY = {
    structSize: 104,
    encryptedBase: 36,
    nicknameOffset: 8,
    nicknameLength: 10,
    languageOffset: 18,
    flagsOffset: 19,
    levelOffset: 88,
};
const NULL_MON_LAYOUT_BOX_SAVE = {
    structSize: 84,
    encryptedBase: 36,
    nicknameOffset: 8,
    nicknameLength: 10,
    languageOffset: 20,
    flagsOffset: 21,
    levelOffset: null,
};

if (typeof TITLE === "string" && TITLE.includes(" Null")) {
    let fileHandle = null;
    let lastContents = null;
    let watchIntervalId = null;

    $('#read-save').click(function () {
        if ($('#save-upload').length > 0) {
            $('#save-upload')[0].value = null;
        }
    });

    let saveOpenSelector = 'save-upload';
    let saveOpenEvent = 'change';

    if ('showOpenFilePicker' in window && localStorage.watchSaveFile == '1') {
        saveOpenSelector = 'read-save';
        saveOpenEvent = 'click';
    }

    const openTarget = document.getElementById(saveOpenSelector);
    if (!openTarget) {
        console.warn("Pokemon Null save reader could not find save input element.");
    } else {
        openTarget.addEventListener(saveOpenEvent, function (event) {
            (async () => {
                let file = null;

                if ('showOpenFilePicker' in window && localStorage.watchSaveFile == '1') {
                    try {
                        [fileHandle] = await window.showOpenFilePicker({
                            types: [{
                                description: 'Save Files',
                                accept: { 'application/octet-stream': ['.sav', '.ss1', '.ss2', '.ss3', '.ss4', '.ss5', '.ss6', '.ss7', '.ss8', '.ss9', '.srm'] }
                            }]
                        });
                        file = await fileHandle.getFile();
                    } catch (err) {
                        console.warn("User cancelled save file selection.", err);
                        fileHandle = null;
                        return;
                    }
                } else {
                    fileHandle = null;
                    file = event.target.files[0];
                }

                if (!file) {
                    return;
                }

                const reader = new FileReader();
                let selectedName = ($('#save-upload').val() || "").split("\\").pop();
                if (!selectedName && fileHandle && fileHandle.name) {
                    selectedName = fileHandle.name;
                }
                if (!selectedName && file.name) {
                    selectedName = file.name;
                }

                saveFileName = selectedName || "save.sav";
                savExt = (saveFileName.split('.').pop() || "").toLowerCase();

                reader.onload = function (e) {
                    try {
                        let buffer = e.target.result;

                        if ((savExt.startsWith("ss") || savExt === "srm") &&
                            buffer &&
                            buffer.byteLength < 100000 &&
                            typeof extractSaveState === "function") {
                            try {
                                buffer = extractSaveState(buffer);
                            } catch (decompressErr) {
                                console.warn("Unable to extract embedded save data from state file.", decompressErr);
                            }
                        }

                        if (buffer instanceof Uint8Array) {
                            buffer = buffer.buffer;
                        }

                        const saveFile = new DataView(buffer);
                        saveUploaded = true;
                        const saveBlockInfo = nullDetermineActiveSaveBlock(saveFile);
                        nullLogSaveBlockInfo(saveBlockInfo, saveFile);

                        const partyReadResult = nullReadPartyFromActiveSection(saveFile, saveBlockInfo);
                        const boxReadResult = nullReadBoxFromActiveSection(saveFile, saveBlockInfo, 120);
                        const now = new Date();
                        const timeString = now.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                        });

                        let changelogText = "<h4>Changelog:</h4>";
                        changelogText += `<p>${saveFileName} loaded at ${timeString}</p>`;

                        if ($('#changelog').length == 0) {
                            $('#clearSets').after("<p id='changelog'></p>");
                        }
                        $('#changelog').html(changelogText).show();

                        if (typeof window.applyImportedSnapshot === 'function') {
                            window.applyImportedSnapshot({
                                showdownImport: partyReadResult.showdownText + boxReadResult.showdownText,
                                deadMons: [],
                                source: 'save-file',
                                replaceDeadMons: true
                            });
                        } else {
                            $('.import-team-text').val(partyReadResult.showdownText + boxReadResult.showdownText);
                            $('#import').click();
                        }
                    } catch (err) {
                        console.error("Failed to parse Pokemon Null save file.", err);
                        alert("Unable to parse this Pokemon Null save file.");
                    }
                };

                reader.readAsArrayBuffer(file);

                if (fileHandle) {
                    if (watchIntervalId) {
                        clearInterval(watchIntervalId);
                        watchIntervalId = null;
                    }

                    async function checkFile() {
                        const newFile = await fileHandle.getFile();
                        const contents = new Uint8Array(await newFile.arrayBuffer());

                        if (lastContents && !nullArraysEqual(contents, lastContents)) {
                            reader.readAsArrayBuffer(newFile);
                        }
                        lastContents = contents;
                    }

                    await checkFile();
                    watchIntervalId = setInterval(checkFile, 2000);
                }
            })();
        });
    }
}

function scanNullSaveFile(saveFile) {
    const magicValue = 0x0202;
    const bestBySpecies = new Map();

    for (let offset = 0; offset < saveFile.byteLength - 1; offset += 2) {
        const value = saveFile.getUint16(offset, true);
        if (value !== magicValue) {
            continue;
        }

        const attempts = [
            { label: "a-20-party", res: parseNullCandidate(saveFile, offset - 20, 36, offset, "party") },
            { label: "a-20-box", res: parseNullCandidate(saveFile, offset - 20, 36, offset, "box") },
        ];
        const winner = attempts.find((attempt) => attempt.res.mon);
        const mon = winner ? winner.res.mon : null;

        if (!mon) {
            continue;
        }

        const speciesKey = mon.speciesName.toLowerCase();
        const existing = bestBySpecies.get(speciesKey);
        if (!existing) {
            bestBySpecies.set(speciesKey, mon);
            continue;
        }

        if (mon.exp > existing.exp ||
            (mon.exp === existing.exp && mon.scanOffset >= existing.scanOffset)) {
            bestBySpecies.set(speciesKey, mon);
        }
    }

    const mons = Array.from(bestBySpecies.values())
        .sort((a, b) => a.scanOffset - b.scanOffset);

    let showdownText = "";
    for (const mon of mons) {
        showdownText += nullMonToShowdown(mon);
    }

    return { mons, showdownText };
}

function nullReadPartyFromActiveSection(saveFile, saveBlockInfo) {
    const activeBlock = nullGetActiveBlock(saveBlockInfo);

    if (!activeBlock || !activeBlock.sectionsById || !activeBlock.sectionsById[1]) {
        return {
            mons: [],
            partyCount: 0,
            showdownText: "",
        };
    }

    const section1 = activeBlock.sectionsById[1];
    const partyCountAddr = section1.sectionOffset + 0x234;
    const partyDataBase = section1.sectionOffset + 0x238;
    const rawPartyCount = nullReadU8(saveFile, partyCountAddr);
    const partyCount = Number.isFinite(rawPartyCount) ? Math.max(0, Math.min(rawPartyCount, 6)) : 0;

    const mons = [];
    for (let i = 0; i < partyCount; i++) {
        const chunk = nullReadLogicalSectionChunk(saveFile, activeBlock, 1, 0x238 + (i * 104), 104);
        const mon = nullParseMonChunkExact(chunk, true, i + 1);
        if (mon) {
            mons.push(mon);
        }
    }

    let showdownText = "";
    for (const mon of mons) {
        showdownText += nullMonToShowdown(mon);
    }

    return {
        mons,
        partyCount,
        showdownText,
    };
}

function nullReadBoxFromActiveSection(saveFile, saveBlockInfo, slotsRequested = 120) {
    const activeBlock = nullGetActiveBlock(saveBlockInfo);
    const totalSlots = Math.max(0, Number(slotsRequested) || 0);
    if (!activeBlock || !activeBlock.sectionsById || !activeBlock.sectionsById[5]) {
        console.log("[Null Save Scan] Box read start unresolved: active block or logical section 5 missing.");
        return {
            mons: [],
            slotsRequested: totalSlots,
            showdownText: "",
        };
    }

    const boxSection = activeBlock.sectionsById[5];
    const boxStartAbs = boxSection.sectionOffset + 0x0004;
    console.log(
        `[Null Save Scan] Box read start -> activeBlock=${activeBlock.label} ` +
        `logicalSection=5 physicalSlot=${boxSection.slot} ` +
        `sectionBase=0x${boxSection.sectionOffset.toString(16).padStart(8, "0")} ` +
        `startOffset=0x${boxStartAbs.toString(16).padStart(8, "0")} ` +
        `(decimal ${boxStartAbs}), slots=${totalSlots}, bytesPerMon=84`
    );

    const mons = [];
    for (let i = 0; i < totalSlots; i++) {
        const chunk = nullReadLogicalSectionChunk(saveFile, activeBlock, 5, 0x0004 + (i * 84), 84);
        const mon = nullParseMonChunkExact(chunk, false, i + 1);
        if (mon) {
            mons.push(mon);
        }
    }

    let showdownText = "";
    for (const mon of mons) {
        showdownText += nullMonToShowdown(mon);
    }

    return {
        mons,
        slotsRequested: totalSlots,
        showdownText,
    };
}

function nullParseMonChunkExact(chunk, isParty = false, slot = 0) {
    const layout = isParty ? NULL_MON_LAYOUT_PARTY : NULL_MON_LAYOUT_BOX_SAVE;
    if (!chunk || chunk.length < layout.structSize) {
        return null;
    }

    const personality = nullReadU32FromBytes(chunk, 0);
    const otId = nullReadU32FromBytes(chunk, 4);
    if (!Number.isFinite(personality) || !Number.isFinite(otId) || personality === 0) {
        return null;
    }

    const suborder = NULL_SUBSTRUCT_SELECTOR[personality % 24];
    if (!suborder) {
        return null;
    }

    const key = (personality ^ otId) >>> 0;
    const ss = [[], [], [], []]; // growth, moves, evs, misc

    for (let block = 0; block < 4; block++) {
        const blockIndex = suborder[block];
        for (let i = 0; i < 3; i++) {
            const enc = nullReadU32FromBytes(chunk, layout.encryptedBase + (blockIndex * 12) + (i * 4));
            if (!Number.isFinite(enc)) {
                return null;
            }
            ss[block][i] = (enc ^ key) >>> 0;
        }
    }

    const growth0 = ss[0][0] >>> 0;
    const growth1 = ss[0][1] >>> 0;
    const growth2 = ss[0][2] >>> 0;
    const moves0 = ss[1][0] >>> 0;
    const moves1 = ss[1][1] >>> 0;
    const misc1 = ss[3][1] >>> 0;
    const misc2 = ss[3][2] >>> 0;

    const speciesId = growth0 & 0xFFFF;
    if (speciesId <= 0) {
        return null;
    }

    const speciesName = (speciesId <= nullMons.length && nullMons[speciesId - 1])
        ? nullMons[speciesId - 1]
        : `Species-${speciesId}`;

    const itemId = (growth0 >>> 16) & 0xFFFF;
    const itemName = itemId > 0
        ? ((itemId <= nullItems.length && nullItems[itemId - 1]) ? nullItems[itemId - 1] : `Item #${itemId}`)
        : "";

    const moveIds = [
        moves0 & 0xFFFF,
        (moves0 >>> 16) & 0xFFFF,
        moves1 & 0xFFFF,
        (moves1 >>> 16) & 0xFFFF,
    ];
    const moveNames = moveIds
        .filter((id) => id > 0)
        .map((id) => (id < nullMoves.length && nullMoves[id]) ? nullMoves[id] : `Move ${id}`);

    const hiddenNature = (growth2 >>> 21) & 0x1F;
    const natureIndex = (hiddenNature !== 26 && hiddenNature <= 24) ? hiddenNature : (personality % 25);
    const natureName = nullNatures[natureIndex] || "Hardy";

    const abilitySlot = ((misc2 >>> 29) & 0x3) >>> 0;
    const abilityName = nullResolveAbilityName(speciesName, abilitySlot);
    const ivs = nullReadIvs(misc1);
    const language = nullReadU8FromBytes(chunk, layout.languageOffset);
    const flags = nullReadU8FromBytes(chunk, layout.flagsOffset);
    const hasSpecies = Number.isFinite(flags) ? (((flags >> 1) & 0x1) === 1) : null;

    let level = Number.isFinite(layout.levelOffset) ? nullReadU8FromBytes(chunk, layout.levelOffset) : null;
    if (!isParty || !Number.isFinite(level) || level <= 0 || level > 100) {
        level = nullResolveLevel(speciesName, growth1 >>> 0);
    }

    return {
        slot,
        isParty,
        monKind: isParty ? "party" : "box",
        personality,
        otId,
        tid: otId & 0xFFFF,
        sid: (otId >>> 16) & 0xFFFF,
        speciesId,
        speciesName,
        nickname: nullDecodeNicknameFromBytes(chunk, layout.nicknameOffset, layout.nicknameLength),
        itemId,
        itemName,
        exp: growth1 >>> 0,
        level,
        natureName,
        abilitySlot,
        abilityName,
        moveIds,
        moveNames,
        ivs,
        language,
        flags,
        hasSpecies,
    };
}

function nullGetActiveBlock(saveBlockInfo) {
    if (!saveBlockInfo) {
        return null;
    }
    if (saveBlockInfo.selectedLabel === "A") {
        return saveBlockInfo.blockA;
    }
    if (saveBlockInfo.selectedLabel === "B") {
        return saveBlockInfo.blockB;
    }
    return null;
}

function nullReadLogicalSectionChunk(saveFile, activeBlock, startSectionId, startDataOffset, length) {
    if (!saveFile || !activeBlock || !activeBlock.sectionsById || !Number.isFinite(length) || length <= 0) {
        return null;
    }
    const out = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        const linear = startDataOffset + i;
        const sectionAdvance = Math.floor(linear / NULL_GEN3_SECTION_DATA_SIZE);
        const offsetInSection = linear % NULL_GEN3_SECTION_DATA_SIZE;
        const sectionId = (startSectionId + sectionAdvance) % NULL_GEN3_SECTION_COUNT;
        const sectionInfo = activeBlock.sectionsById[sectionId];
        if (!sectionInfo) {
            return null;
        }
        const absOffset = sectionInfo.sectionOffset + offsetInSection;
        const byte = nullReadU8(saveFile, absOffset);
        if (!Number.isFinite(byte)) {
            return null;
        }
        out[i] = byte & 0xFF;
    }
    return out;
}

function parseNullCandidate(saveFile, candidateStart, encryptedStartOffset, scanOffset, monKind = "box") {
    const reject = (reason, speciesName = "Unknown", tid = null, sid = null) => ({
        mon: null,
        reason,
        speciesName,
        tid,
        sid,
    });

    const minStructLength = (monKind === "party") ? 104 : 80;
    if (candidateStart < 0 || (candidateStart + minStructLength) > saveFile.byteLength) {
        return reject("candidate_out_of_bounds");
    }

    const personality = nullReadU32(saveFile, candidateStart);
    const otId = nullReadU32(saveFile, candidateStart + 4);
    const tid = (otId === null) ? null : (otId & 0xFFFF);
    const sid = (otId === null) ? null : ((otId >>> 16) & 0xFFFF);

    if (personality === null || otId === null || personality === 0) {
        return reject("invalid_personality_or_otid", "Unknown", tid, sid);
    }

    let language = 0;
    let flags = 0;
    try {
        // In save scan context, the magic hit itself is the language/flags word.
        language = saveFile.getUint8(scanOffset);
        flags = saveFile.getUint8(scanOffset + 1);
    } catch (_err) {
        return reject("language_or_flags_read_failed", "Unknown", tid, sid);
    }
    const hasSpecies = ((flags >> 1) & 0x1) === 1;

    const suborder = NULL_SUBSTRUCT_SELECTOR[personality % 24];
    if (!suborder) {
        return reject("invalid_suborder", "Unknown", tid, sid);
    }

    const encryptedStart = candidateStart + encryptedStartOffset;
    if (encryptedStart < 0 || encryptedStart + 48 > saveFile.byteLength) {
        return reject(`encrypted_block_out_of_bounds(+${encryptedStartOffset})`, "Unknown", tid, sid);
    }

    const key = (personality ^ otId) >>> 0;
    const decrypted = [];
    for (let i = 0; i < 12; i++) {
        const enc = nullReadU32(saveFile, encryptedStart + (i * 4));
        if (enc === null) {
            return reject(`decrypt_word_read_failed(index:${i})`, "Unknown", tid, sid);
        }
        decrypted.push((enc ^ key) >>> 0);
    }

    const growthIndex = suborder.indexOf(0);
    const movesIndex = suborder.indexOf(1);
    const miscIndex = suborder.indexOf(3);
    if (growthIndex < 0 || movesIndex < 0 || miscIndex < 0) {
        return reject("substruct_index_missing", "Unknown", tid, sid);
    }

    const growthWord0 = decrypted[growthIndex * 3] >>> 0;
    const growthWord1 = decrypted[growthIndex * 3 + 1] >>> 0;
    const growthWord2 = decrypted[growthIndex * 3 + 2] >>> 0;

    const speciesId = growthWord0 & 0xFFFF;
    if (speciesId <= 0 || speciesId > nullMons.length) {
        return reject(`species_id_out_of_bounds(${speciesId})`, `Species#${speciesId}`, tid, sid);
    }

    const speciesName = nullMons[speciesId - 1];
    if (!speciesName || speciesName === "None") {
        return reject("species_name_unresolved", `Species#${speciesId}`, tid, sid);
    }

    const itemId = (growthWord0 >>> 16) & 0xFFFF;
    if (itemId > nullItems.length) {
        return reject(`item_id_out_of_bounds(${itemId})`, speciesName, tid, sid);
    }

    const itemName = itemId === 0 ? "" : nullItems[itemId - 1];
    if (itemId > 0 && !itemName) {
        return reject(`item_name_unresolved(${itemId})`, speciesName, tid, sid);
    }

    const moveWord0 = decrypted[movesIndex * 3] >>> 0;
    const moveWord1 = decrypted[movesIndex * 3 + 1] >>> 0;
    const moveIds = [
        moveWord0 & 0xFFFF,
        (moveWord0 >>> 16) & 0xFFFF,
        moveWord1 & 0xFFFF,
        (moveWord1 >>> 16) & 0xFFFF,
    ];

    if (nullHasDuplicateNonZeroMoveIds(moveIds)) {
        return reject(`duplicate_non_zero_moves(${moveIds.join(",")})`, speciesName, tid, sid);
    }

    for (const moveId of moveIds) {
        if (moveId >= nullMoves.length) {
            return reject(`move_id_out_of_bounds(${moveId})`, speciesName, tid, sid);
        }
    }

    const moveNames = [];
    for (const moveId of moveIds) {
        if (moveId === 0) {
            continue;
        }
        const moveName = nullMoves[moveId];
        if (!moveName || moveName === "None") {
            return reject(`move_name_unresolved(${moveId})`, speciesName, tid, sid);
        }
        moveNames.push(moveName);
    }
    if (moveNames.length === 0) {
        return reject("no_usable_moves", speciesName, tid, sid);
    }

    const hiddenNature = (growthWord2 >>> 21) & 0x1F;
    const natureIndex = (hiddenNature >= 0 && hiddenNature <= 24 && hiddenNature !== 26)
        ? hiddenNature
        : (personality % 25);
    const natureName = nullNatures[natureIndex] || nullNatures[personality % 25] || "Hardy";

    const ivWord = decrypted[miscIndex * 3 + 1] >>> 0;
    const ivs = nullReadIvs(ivWord);
    const abilitySlot = ((decrypted[miscIndex * 3 + 2] >>> 29) & 0x3) >>> 0;
    const abilityName = nullResolveAbilityName(speciesName, abilitySlot);
    const nickname = nullDecodeNickname(saveFile, candidateStart + 8, 10);
    const exp = growthWord1 >>> 0;
    let level = nullResolveLevel(speciesName, exp);
    if (monKind === "party") {
        const partyLevel = nullReadU8(saveFile, candidateStart + 88);
        if (partyLevel !== null && partyLevel > 0 && partyLevel <= 100) {
            level = partyLevel;
        }
    }

    return {
        mon: {
            scanOffset,
            personality,
            otId,
            speciesName,
            nickname,
            itemId,
            itemName,
            exp,
            level,
            natureName,
            abilitySlot,
            abilityName,
            moveNames,
            ivs,
            monKind,
            tid,
            sid,
            language,
            flags,
            hasSpecies,
        },
        reason: null,
        speciesName,
        tid,
        sid,
    };
}

function nullMonToShowdown(mon) {
    const species = mon.speciesName;
    const nick = (mon.nickname || "").trim();
    let lead = species;

    if (nick &&
        nick.toLowerCase() !== species.toLowerCase() &&
        !species.toLowerCase().includes(nick.toLowerCase())) {
        if (nick.toLowerCase().includes(species.toLowerCase())) {
            lead = species;
        } else {
            lead = `${nick} (${species})`;
        }
    }

    if (mon.itemId > 0 && mon.itemName) {
        lead += ` @ ${mon.itemName}`;
    }

    const lines = [];
    lines.push(lead);
    lines.push(`Ability: ${mon.abilityName || mon.abilitySlot}`);
    lines.push(`Level: ${mon.level}`);
    lines.push(`${mon.natureName} Nature`);
    lines.push(`IVs: ${mon.ivs.hp} HP / ${mon.ivs.atk} Atk / ${mon.ivs.def} Def / ${mon.ivs.spa} SpA / ${mon.ivs.spd} SpD / ${mon.ivs.spe} Spe`);

    for (const moveName of mon.moveNames) {
        lines.push(`- ${moveName}`);
    }

    return `${lines.join("\n")}\n\n`;
}

function nullResolveGrowthRate(speciesName) {
    if (typeof learnsets === "undefined" || !speciesName) {
        return null;
    }

    let candidate = speciesName;
    let key = candidate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (learnsets[key] && Number.isFinite(learnsets[key].gr)) {
        return learnsets[key].gr;
    }

    candidate = speciesName.split("-").slice(0, 2).join("-");
    key = candidate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (learnsets[key] && Number.isFinite(learnsets[key].gr)) {
        return learnsets[key].gr;
    }

    candidate = speciesName.split("-")[0];
    key = candidate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (learnsets[key] && Number.isFinite(learnsets[key].gr)) {
        return learnsets[key].gr;
    }

    return null;
}

function nullResolveLevel(speciesName, exp) {
    if (!Number.isFinite(exp) || exp < 0) {
        return 1;
    }

    try {
        const gr = nullResolveGrowthRate(speciesName);
        if (Number.isFinite(gr) && typeof expTables !== "undefined" && expTables[gr] && typeof get_level === "function") {
            const level = get_level(expTables[gr], exp);
            if (Number.isFinite(level) && level > 0) {
                return level;
            }
        }

        if (typeof expTables !== "undefined" && expTables[0] && typeof get_level === "function") {
            const fallbackLevel = get_level(expTables[0], exp);
            if (Number.isFinite(fallbackLevel) && fallbackLevel > 0) {
                return fallbackLevel;
            }
        }
    } catch (_err) {
    }

    return 1;
}

function nullResolveAbilityName(speciesName, abilitySlot) {
    if (typeof nullAbilities !== "object" || !nullAbilities) {
        return null;
    }

    const speciesKey = nullNormalizeSpeciesKey(speciesName);
    if (!speciesKey || typeof nullAbilities[speciesKey] !== "object" || !nullAbilities[speciesKey]) {
        return null;
    }

    const abilitiesForSpecies = nullAbilities[speciesKey];
    const preferredKeys = (abilitySlot === 0)
        ? ["0", "1", "H"]
        : (abilitySlot === 1)
            ? ["1", "0", "H"]
            : ["H", "0", "1"];

    for (const key of preferredKeys) {
        const ability = abilitiesForSpecies[key];
        if (ability && ability !== "-" && ability !== "None") {
            return ability;
        }
    }

    return null;
}

function nullNormalizeSpeciesKey(speciesName) {
    return String(speciesName || "").toLowerCase().replace(/[^a-z0-9]/g, '');
}

function nullDetermineActiveSaveBlock(saveFile) {
    const blockA = nullReadGen3SaveBlockMeta(saveFile, NULL_GEN3_BLOCK_A_OFFSET, "A");
    const blockB = nullReadGen3SaveBlockMeta(saveFile, NULL_GEN3_BLOCK_B_OFFSET, "B");
    const indexA = blockA.saveIndex;
    const indexB = blockB.saveIndex;

    let selectedLabel = "unknown";
    if (Number.isFinite(indexA) && Number.isFinite(indexB)) {
        // Gen III rule: if A > B use A, otherwise use B.
        selectedLabel = (indexA > indexB) ? "A" : "B";
    } else if (Number.isFinite(indexA)) {
        selectedLabel = "A";
    } else if (Number.isFinite(indexB)) {
        selectedLabel = "B";
    }

    return {
        blockA,
        blockB,
        indexA,
        indexB,
        selectedLabel,
    };
}

function nullReadGen3SaveBlockMeta(saveFile, baseOffset, label) {
    const sections = [];
    const sectionsById = {};
    const seenIds = new Set();
    let validSignatureCount = 0;
    let section13 = null;

    for (let slot = 0; slot < NULL_GEN3_SECTION_COUNT; slot++) {
        const sectionOffset = baseOffset + (slot * NULL_GEN3_SECTION_SIZE);
        if (sectionOffset + NULL_GEN3_SECTION_SIZE > saveFile.byteLength) {
            break;
        }

        const sectionId = nullReadU16(saveFile, sectionOffset + NULL_GEN3_SECTION_ID_OFFSET);
        const signature = nullReadU32(saveFile, sectionOffset + NULL_GEN3_SIGNATURE_OFFSET);
        const saveIndex = nullReadU32(saveFile, sectionOffset + NULL_GEN3_SAVE_INDEX_OFFSET);
        const signatureOk = signature === NULL_GEN3_SECTION_SIGNATURE;

        if (signatureOk) {
            validSignatureCount += 1;
        }
        const sectionInfo = {
            slot,
            sectionOffset,
            sectionId,
            signature,
            saveIndex,
            signatureOk,
        };
        sections.push(sectionInfo);

        if (Number.isFinite(sectionId)) {
            seenIds.add(sectionId);
            if (typeof sectionsById[sectionId] === "undefined") {
                sectionsById[sectionId] = sectionInfo;
            }
        }

        if (sectionId === 13) {
            section13 = sectionInfo;
        }
    }

    const saveIndex = section13 ? section13.saveIndex : null;

    return {
        label,
        baseOffset,
        sectionsRead: sections.length,
        validSignatureCount,
        uniqueSectionIds: seenIds.size,
        section13,
        saveIndex,
        sectionsById,
    };
}

function nullLogSaveBlockInfo(info, saveFile) {
    if (!info) {
        return;
    }

    const a = info.blockA;
    const b = info.blockB;
    const aIndex = Number.isFinite(info.indexA) ? info.indexA : "unknown";
    const bIndex = Number.isFinite(info.indexB) ? info.indexB : "unknown";
    const aSection13Slot = (a.section13 && Number.isFinite(a.section13.slot)) ? a.section13.slot : "missing";
    const bSection13Slot = (b.section13 && Number.isFinite(b.section13.slot)) ? b.section13.slot : "missing";

    console.log(`[Null Save Scan] Save Block A @0x${a.baseOffset.toString(16).padStart(6, "0")} -> saveIndex=${aIndex}, section13Slot=${aSection13Slot}, signatures=${a.validSignatureCount}/${a.sectionsRead}, uniqueSectionIds=${a.uniqueSectionIds}`);
    console.log(`[Null Save Scan] Save Block B @0x${b.baseOffset.toString(16).padStart(6, "0")} -> saveIndex=${bIndex}, section13Slot=${bSection13Slot}, signatures=${b.validSignatureCount}/${b.sectionsRead}, uniqueSectionIds=${b.uniqueSectionIds}`);
    console.log(`[Null Save Scan] Active save block selection: ${info.selectedLabel} (rule: A>B => A else B)`);

    if (!saveFile) {
        return;
    }

    const activeBlock = info.selectedLabel === "A" ? a : (info.selectedLabel === "B" ? b : null);
    if (!activeBlock) {
        console.log("[Null Save Scan] Active block unknown; cannot resolve trainer ID / party count.");
        return;
    }

    const trainerSection = activeBlock.sectionsById[0];
    const partySection = activeBlock.sectionsById[1];

    if (trainerSection) {
        const trainerIdAddr = trainerSection.sectionOffset + 0x00A;
        const trainerIdRaw = nullReadU32(saveFile, trainerIdAddr);
        if (Number.isFinite(trainerIdRaw)) {
            const tid = trainerIdRaw & 0xFFFF;
            const sid = (trainerIdRaw >>> 16) & 0xFFFF;
            console.log(`[Null Save Scan] Active block ${activeBlock.label} section0(slot=${trainerSection.slot}, id=0) trainerId@+0x00A (abs 0x${trainerIdAddr.toString(16).padStart(8, "0")}): raw=${trainerIdRaw} TID=${tid} SID=${sid}`);
        } else {
            console.log(`[Null Save Scan] Active block ${activeBlock.label} section0(slot=${trainerSection.slot}, id=0) trainerId@+0x00A unavailable`);
        }
    } else {
        console.log(`[Null Save Scan] Active block ${activeBlock.label} missing logical section 0 (trainer info).`);
    }

    if (partySection) {
        const partyCountAddr = partySection.sectionOffset + 0x234;
        const partyCount = nullReadU8(saveFile, partyCountAddr);
        console.log(`[Null Save Scan] Active block ${activeBlock.label} section1(slot=${partySection.slot}, id=1) partyCount@+0x0234 (abs 0x${partyCountAddr.toString(16).padStart(8, "0")}): ${Number.isFinite(partyCount) ? partyCount : "unknown"}`);
    } else {
        console.log(`[Null Save Scan] Active block ${activeBlock.label} missing logical section 1 (team/items).`);
    }
}

function nullReadU32(saveFile, offset) {
    try {
        return saveFile.getUint32(offset, true) >>> 0;
    } catch (_err) {
        return null;
    }
}

function nullReadU16(saveFile, offset) {
    try {
        return saveFile.getUint16(offset, true) & 0xFFFF;
    } catch (_err) {
        return null;
    }
}

function nullReadU8(saveFile, offset) {
    try {
        return saveFile.getUint8(offset) & 0xFF;
    } catch (_err) {
        return null;
    }
}

function nullReadU8FromBytes(bytes, offset) {
    if (!bytes || offset < 0 || offset >= bytes.length) {
        return null;
    }
    return bytes[offset] & 0xFF;
}

function nullReadU32FromBytes(bytes, offset) {
    if (!bytes || offset < 0 || offset + 3 >= bytes.length) {
        return null;
    }
    return (
        (bytes[offset]) |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)
    ) >>> 0;
}

function nullDecodeNickname(saveFile, startOffset, length) {
    if (typeof nullCharmap === "undefined") {
        return "";
    }

    let out = "";
    for (let i = 0; i < length; i++) {
        const v = saveFile.getUint8(startOffset + i) & 0xFF;
        if (v === 0x00 || v === 0xFF) {
            break;
        }
        out += nullCharmap[v] || "";
    }
    return out.trim();
}

function nullDecodeNicknameFromBytes(bytes, startOffset, length) {
    if (typeof nullCharmap === "undefined" || !bytes) {
        return "";
    }

    let out = "";
    for (let i = 0; i < length; i++) {
        const idx = startOffset + i;
        if (idx < 0 || idx >= bytes.length) {
            break;
        }
        const v = bytes[idx] & 0xFF;
        if (v === 0x00 || v === 0xFF) {
            break;
        }
        out += nullCharmap[v] || "";
    }
    return out.trim();
}

function nullReadIvs(ivWord) {
    return {
        hp: (ivWord >>> 0) & 0x1F,
        atk: (ivWord >>> 5) & 0x1F,
        def: (ivWord >>> 10) & 0x1F,
        spe: (ivWord >>> 15) & 0x1F,
        spa: (ivWord >>> 20) & 0x1F,
        spd: (ivWord >>> 25) & 0x1F,
    };
}

function nullHasDuplicateNonZeroMoveIds(moveIds) {
    const seen = new Set();
    for (const moveId of moveIds) {
        if (moveId === 0) {
            continue;
        }
        if (seen.has(moveId)) {
            return true;
        }
        seen.add(moveId);
    }
    return false;
}

function nullArraysEqual(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
