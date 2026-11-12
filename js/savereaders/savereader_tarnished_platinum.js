const TARNISHED_PLATINUM_SAVE = {
    bankSize: 0x40000,
    generalSize: 0xD158,
    storageSize: 0x134E0,
    footerSize: 20,
    magic: 0x20060623,
    partyCountOffset: 0x9C,
    partySize: 236,
    boxSize: 136,
    boxCount: 18,
    slotsPerBox: 30,
};

function addTarnishedPlatinumCosmeticForms(species) {
    const forms = {
        "Sawsbuck-Winter": "Sawsbuck",
        "Pikachu-Belle": "Pikachu",
        "Pikachu-Rock-Star": "Pikachu",
        "Pikachu-Pop-Star": "Pikachu",
        "Pikachu-Libre": "Pikachu",
    };
    for (const [name, base] of Object.entries(forms)) {
        if (!species[name]) {
            const { otherFormes, ...data } = JSON.parse(JSON.stringify(species[base]));
            species[name] = { ...data, baseSpecies: base };
        }
    }
}

function getTarnishedPlatinumSaveBlocks(bytes) {
    const layout = TARNISHED_PLATINUM_SAVE;
    if (bytes.length < 2 * layout.bankSize) {
        throw new Error("Expected a 512 KiB Tarnished Platinum save.");
    }

    const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    function readBlock(start, size, id) {
        const footer = start + size - layout.footerSize;
        if (data.getUint32(footer + 8, true) !== size ||
            data.getUint32(footer + 12, true) !== layout.magic ||
            data.getUint16(footer + 16, true) !== id ||
            data.getUint16(footer + 18, true) !== Number(getCheckSum(bytes.subarray(start, footer)))) {
            return null;
        }
        return { start, generation: data.getUint32(footer, true), revision: data.getUint32(footer + 4, true) };
    }

    const general = [];
    const storage = [];
    for (const bank of [0, layout.bankSize]) {
        const generalBlock = readBlock(bank, layout.generalSize, 0);
        if (generalBlock && data.getUint32(bank + layout.partyCountOffset, true) <= 6) general.push(generalBlock);
        const storageBlock = readBlock(bank + layout.generalSize, layout.storageSize, 1);
        if (storageBlock) storage.push(storageBlock);
    }
    const newestFirst = (a, b) => b.generation - a.generation || b.revision - a.revision;
    general.sort(newestFirst);
    storage.sort(newestFirst);

    // The two blocks are written independently and need not be in the same bank.
    for (const party of general) {
        const pc = storage.find(block => block.generation === party.generation);
        if (pc) return { partyOffset: party.start + layout.partyCountOffset, boxOffset: pc.start + 4 };
    }
    throw new Error("No matching, checksum-valid Tarnished Platinum party and PC blocks found.");
}

function parseTarnishedPlatinumSave(bytes) {
    const layout = TARNISHED_PLATINUM_SAVE;
    const { partyOffset, boxOffset } = getTarnishedPlatinumSaveBlocks(bytes);
    const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const unmappedIds = { species: new Set(), moves: new Set(), items: new Set(), abilities: new Set() };
    let showdownImport = "";

    resetParsedPokemonGlobalsForGen4Import();
    for (let i = 0; i < data.getUint32(partyOffset, true); i++) {
        const offset = partyOffset + 4 + i * layout.partySize;
        showdownImport += parsePKM(bytes.subarray(offset, offset + layout.partySize), true, offset, {
            partySlot: i, useStoredPartyLevel: true, unmappedIds,
        });
    }
    for (let i = 0; i < layout.boxCount * layout.slotsPerBox; i++) {
        const offset = boxOffset + i * layout.boxSize;
        showdownImport += parsePKM(bytes.subarray(offset, offset + layout.boxSize), false, offset, { unmappedIds });
    }

    const trainerIdSecret = data.getUint32(partyOffset - layout.partyCountOffset + 0x78, true);
    return {
        showdownImport,
        unmappedIds,
        source: "save-file",
        trainerIdSecret,
        trainerId: trainerIdSecret & 0xFFFF,
        secretId: trainerIdSecret >>> 16,
    };
}

async function importTarnishedPlatinumSave(file) {
    try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        runWithImportPartyPreviewPolicy(function () {
            const snapshot = parseTarnishedPlatinumSave(bytes);
            const missing = Object.entries(snapshot.unmappedIds)
                .filter(([, ids]) => ids.size)
                .map(([kind, ids]) => `${kind} ${Array.from(ids).sort((a, b) => a - b).join(", ")}`);

            saveUploaded = false;
            $("#edge").hide();
            if (snapshot.showdownImport || !missing.length) window.applyImportedSnapshot(snapshot);

            if (!$("#changelog").length) $("#clearSets").after($("<p>", { id: "changelog" }));
            const message = missing.length ? ` Unmapped IDs: ${missing.join("; ")}.` : "";
            $("#changelog").text(`${file.name} loaded (read-only).${message}`).show();
        });
    } catch (error) {
        window.alert(error.message || "Could not read Tarnished Platinum save.");
    }
}
