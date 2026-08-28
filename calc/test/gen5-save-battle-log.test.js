"use strict";

const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const parser = require("../../js/savereaders/gen5_save_battle_log.js");

function writeU16(bytes, offset, value) {
    bytes[offset] = value & 0xFF;
    bytes[offset + 1] = (value >>> 8) & 0xFF;
}

function writeU32(bytes, offset, value) {
    writeU16(bytes, offset, value & 0xFFFF);
    writeU16(bytes, offset + 2, value >>> 16);
}

function writeBits(bytes, bitOffset, width, value) {
    for (let bit = 0; bit < width; bit += 1) {
        const absoluteBit = bitOffset + bit;
        const byteIndex = absoluteBit >> 3;
        const bitIndex = absoluteBit & 7;
        if (((value >>> bit) & 1) !== 0) {
            bytes[byteIndex] |= 1 << bitIndex;
        }
    }
}

function encodeRecord(record) {
    const bytes = new Uint8Array(parser.RECORD_SIZE);
    writeBits(bytes, 0, 10, record.trainerId);
    writeBits(bytes, 10, 3, record.playerCount);
    for (let slot = 0; slot < 6; slot += 1) {
        writeBits(bytes, 13 + slot * 10, 10, record.playerSpeciesIds[slot] || 0);
        writeBits(bytes, 73 + slot * 3, 3, record.playerKoCreditsByEnemy[slot] || 0);
        writeBits(bytes, 91 + slot * 3, 3, record.aiKoCreditsByPlayer[slot] || 0);
    }
    return bytes;
}

function initializeCopy(bytes, copyOffset, blockCounts) {
    parser.BLOCKS.forEach((block, index) => {
        const offset = copyOffset + block.offset;
        writeU32(bytes, offset, parser.MAGIC);
        writeU16(bytes, offset + 4, parser.VERSION);
        writeU16(bytes, offset + 6, blockCounts[index] || 0);
        writeU16(bytes, offset + 8, block.capacity);
    });
}

function writeRecord(bytes, copyOffset, blockIndex, recordIndex, record) {
    const block = parser.BLOCKS[blockIndex];
    const offset = copyOffset + block.offset + parser.HEADER_SIZE + recordIndex * parser.RECORD_SIZE;
    bytes.set(encodeRecord(record), offset);
}

function makeRecord(trainerId, creditedSlot) {
    return {
        trainerId,
        playerCount: 3,
        playerSpeciesIds: [4, 5, 6, 0, 0, 0],
        playerKoCreditsByEnemy: [creditedSlot, 0, 0, 0, 0, 0],
        aiKoCreditsByPlayer: [0, 2, 0, 0, 0, 0],
    };
}

function makeBridgeSnapshot(save, baseVersion) {
    const secondCopyOffset = baseVersion === "BW2" ? 0x26000 : 0x24000;
    const ranges = [];
    for (const copyOffset of [0, secondCopyOffset]) {
        for (const block of parser.BLOCKS) {
            ranges.push({ offset: copyOffset + block.offset, size: block.size });
        }
    }
    const totalSize = 8 + ranges.reduce((sum, range) => sum + 8 + range.size, 0);
    const bridge = new Uint8Array(totalSize);
    bridge.set(Buffer.from(parser.BRIDGE_MAGIC, "ascii"), 0);
    bridge[4] = baseVersion === "BW2" ? 2 : 1;
    bridge[5] = ranges.length;
    let cursor = 8;
    ranges.forEach((range) => {
        writeU32(bridge, cursor, range.offset);
        writeU32(bridge, cursor + 4, range.size);
        cursor += 8;
        bridge.set(save.subarray(range.offset, range.offset + range.size), cursor);
        cursor += range.size;
    });
    return bridge;
}

function permutations(values) {
    if (values.length <= 1) return [values.slice()];
    const result = [];
    values.forEach((value, index) => {
        const rest = values.slice(0, index).concat(values.slice(index + 1));
        permutations(rest).forEach((tail) => result.push([value].concat(tail)));
    });
    return result;
}

describe("Gen 5 save-file battle log decoder", function () {
    test("keeps the battle-session body inside a balanced session wrapper", function () {
        const source = readFileSync(resolve(__dirname, "../../js/fragsheet/battle_log.js"), "utf8");
        const functionStart = source.indexOf("function renderSession(");
        const functionEnd = source.indexOf("function renderBattleLogSessions(", functionStart);
        const renderSessionSource = source.slice(functionStart, functionEnd);
        const templateMatch = renderSessionSource.match(/return `([\s\S]*?)`;\n\s*}/);

        expect(functionStart).toBeGreaterThanOrEqual(0);
        expect(functionEnd).toBeGreaterThan(functionStart);
        expect(templateMatch).not.toBeNull();

        const template = templateMatch[1];
        const openingDivs = (template.match(/<div\b/g) || []).length;
        const closingDivs = (template.match(/<\/div>/g) || []).length;
        expect(closingDivs).toBe(openingDivs);
        expect(template).toMatch(/<div class="battle-session-body">[\s\S]*<\/div>\s*<\/div>\s*$/);
        expect(source).not.toMatch(/onerror="[^"\n]*>/);
    });

    test("decodes trainer, party, and both KO attribution directions", function () {
        const decoded = parser.decodeRecord(encodeRecord(makeRecord(219, 1)));
        expect(decoded).toEqual(makeRecord(219, 1));
    });

    test("preserves value 7 as an AI-partner KO attribution", function () {
        const record = makeRecord(219, parser.PARTNER_KO_CREDIT);
        const decoded = parser.decodeRecord(encodeRecord(record));
        expect(parser.PARTNER_KO_CREDIT).toBe(7);
        expect(decoded.playerKoCreditsByEnemy[0]).toBe(parser.PARTNER_KO_CREDIT);
    });

    test("selects the mirrored BW2 copy with the most complete log", function () {
        const mirrorOffset = 0x26000;
        const bytes = new Uint8Array(mirrorOffset + 0x1C000);
        initializeCopy(bytes, 0, [1, 0, 0]);
        writeRecord(bytes, 0, 0, 0, makeRecord(1, 1));
        initializeCopy(bytes, mirrorOffset, [2, 0, 0]);
        writeRecord(bytes, mirrorOffset, 0, 0, makeRecord(1, 1));
        writeRecord(bytes, mirrorOffset, 0, 1, makeRecord(2, 2));

        const result = parser.parse(bytes, { baseVersion: "BW2" });
        expect(result.valid).toBe(true);
        expect(result.copyOffset).toBe(mirrorOffset);
        expect(result.records.map((record) => record.trainerId)).toEqual([1, 2]);
    });

    test("uses Black/White's smaller mirror stride", function () {
        const mirrorOffset = 0x24000;
        const bytes = new Uint8Array(mirrorOffset + 0x1C000);
        initializeCopy(bytes, mirrorOffset, [1, 0, 0]);
        writeRecord(bytes, mirrorOffset, 0, 0, makeRecord(33, 2));

        const result = parser.parse(bytes, { baseVersion: "BW" });
        expect(result.valid).toBe(true);
        expect(result.copyOffset).toBe(mirrorOffset);
        expect(result.records[0].trainerId).toBe(33);
    });

    test("accepts the repairable legacy save with a missing middle block header", function () {
        const bytes = new Uint8Array(0x1C000);
        initializeCopy(bytes, 0, [1, 0, 0]);
        writeRecord(bytes, 0, 0, 0, makeRecord(7, 3));
        bytes.fill(0, parser.BLOCKS[1].offset, parser.BLOCKS[1].offset + parser.HEADER_SIZE);

        const result = parser.parse(bytes, { baseVersion: "BW2" });
        expect(result.valid).toBe(true);
        expect(result.records).toHaveLength(1);
        expect(result.headers[1].repairedLegacyHeader).toBe(true);
    });

    test("rejects records that skip an earlier block", function () {
        const bytes = new Uint8Array(0x1C000);
        initializeCopy(bytes, 0, [0, 1, 0]);
        writeRecord(bytes, 0, 1, 0, makeRecord(9, 1));

        const result = parser.parse(bytes, { baseVersion: "BW2" });
        expect(result.valid).toBe(false);
        expect(result.hasLogs).toBe(false);
    });

    test("decodes the split PK5 counters in every block permutation", function () {
        permutations([0, 1, 2, 3]).forEach((order) => {
            const words = new Array(64).fill(0);
            const blockB = order.indexOf(1) * 16;
            const blockC = order.indexOf(2) * 16;
            words[blockB + 13] = 0xEF00;
            words[blockC + 11] = 0x00BE;
            words[blockB + 14] = 321;
            words[blockB + 15] = 123;
            expect(parser.decodePokemonCounters(words, order)).toEqual({
                koCount: 0xBEEF,
                battlesBrought: 321,
                battlesUsed: 123,
            });
        });
    });

    test("reconstructs battle history from a DeSmuME bridge snapshot", function () {
        const bytes = new Uint8Array(0x42000);
        initializeCopy(bytes, 0, [1, 0, 0]);
        writeRecord(bytes, 0, 0, 0, makeRecord(156, 1));

        const result = parser.parseBridgeSnapshot(makeBridgeSnapshot(bytes, "BW2"));
        expect(result.valid).toBe(true);
        expect(result.bridge).toBe(true);
        expect(result.baseVersion).toBe("BW2");
        expect(result.records).toEqual([makeRecord(156, 1)]);
    });

    test("rejects a truncated DeSmuME bridge snapshot", function () {
        const bytes = new Uint8Array(0x42000);
        initializeCopy(bytes, 0, [1, 0, 0]);
        writeRecord(bytes, 0, 0, 0, makeRecord(156, 1));
        const bridge = makeBridgeSnapshot(bytes, "BW2");

        const result = parser.parseBridgeSnapshot(bridge.subarray(0, bridge.length - 1));
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("invalid-bridge-range");
    });

    test("converts partner credit into a history-only Partner KO event", function () {
        const stored = new Map();
        global.localStorage = {
            getItem: (key) => stored.has(key) ? stored.get(key) : null,
            setItem: (key, value) => stored.set(key, String(value)),
            removeItem: (key) => stored.delete(key),
        };
        global.window = {
            sav_pok_names: ["Unknown", "Bulbasaur"],
            setdex: { Patrat: { Trainer: { tr_id: 1, sub_index: 0 } } },
            getSpeciesFamilyMembers: () => ["Bulbasaur", "Ivysaur", "Venusaur"],
        };
        global.document = {
            getElementById: () => null,
            addEventListener: () => {},
            querySelectorAll: () => [],
            body: { classList: { contains: () => false } },
        };
        global.$ = () => ({ length: 0 });

        jest.resetModules();
        require("../../js/fragsheet/battle_log.js");
        window.updateSaveFileBattleLog({
            valid: true,
            hasLogs: true,
            records: [makeRecord(1, parser.PARTNER_KO_CREDIT)],
        }, [{
            rawSpeciesId: 1,
            species: "Bulbasaur",
            battleCounters: { koCount: 4, battlesBrought: 12, battlesUsed: 8 },
        }], "tag-battle.sav");

        const payload = JSON.parse(stored.get("saveFileBattleLogs"));
        expect(payload.pokemonBattleCounters).toEqual([{
            species: "Bulbasaur",
            rawSpeciesId: 1,
            koCount: 4,
            battlesBrought: 12,
            battlesUsed: 8,
        }]);
        expect(payload.events.filter((event) => event.type === "pKo")).toEqual([]);
        expect(payload.events.find((event) => event.type === "partnerKo")).toMatchObject({
            aiSpecies: "Patrat",
            aiPartySlot: 0,
        });
        expect(window.isSaveFileBattleLogActive()).toBe(true);
        expect(window.getSaveFileBattlesBroughtForSpecies("Ivysaur")).toBe(12);
    });

    test("keeps recorded evolution stages and only applies exact-ID imported forms", function () {
        const stored = new Map();
        stored.set("customsets", JSON.stringify({
            Charizard: { "My Box": { ability: "Blaze" } },
            "Rotom-Wash": { "My Box": { ability: "Levitate" } },
        }));
        global.localStorage = {
            getItem: (key) => stored.has(key) ? stored.get(key) : null,
            setItem: (key, value) => stored.set(key, String(value)),
            removeItem: (key) => stored.delete(key),
        };

        const speciesNames = new Array(488).fill("");
        speciesNames[4] = "Charmander";
        speciesNames[479] = "Rotom";
        speciesNames[487] = "Giratina";
        global.window = {
            sav_pok_names: speciesNames,
            setdex: {
                Purrloin: { Trainer: { tr_id: 1, sub_index: 0 } },
                Patrat: { Trainer: { tr_id: 1, sub_index: 1 } },
                Gible: { Trainer: { tr_id: 1, sub_index: 2 } },
            },
            getSpeciesFamilyMembers: (speciesName) => {
                if (["Charmander", "Charmeleon", "Charizard"].includes(speciesName)) {
                    return ["Charmander", "Charmeleon", "Charizard"];
                }
                if (["Rotom", "Rotom-Wash"].includes(speciesName)) {
                    return ["Rotom", "Rotom-Wash"];
                }
                if (["Giratina", "Giratina-Origin"].includes(speciesName)) {
                    return ["Giratina", "Giratina-Origin"];
                }
                return [speciesName];
            },
        };
        global.document = {
            getElementById: () => null,
            addEventListener: () => {},
            querySelectorAll: () => [],
            body: { classList: { contains: () => false } },
        };
        global.$ = () => ({ length: 0 });

        const record = makeRecord(1, 1);
        record.playerSpeciesIds = [4, 479, 487, 0, 0, 0];
        record.playerKoCreditsByEnemy = [1, 2, 3, 0, 0, 0];
        record.aiKoCreditsByPlayer = [0, 0, 0, 0, 0, 0];

        jest.resetModules();
        require("../../js/fragsheet/battle_log.js");
        window.updateSaveFileBattleLog({
            valid: true,
            hasLogs: true,
            records: [record],
        }, [
            { rawSpeciesId: 6, species: "Charizard", ability: "Blaze" },
            { rawSpeciesId: 479, species: "Rotom-Wash", ability: "Levitate" },
            { rawSpeciesId: 487, species: "Giratina-Origin", ability: "Pressure" },
        ], "historical-stages.sav");

        const payload = JSON.parse(stored.get("saveFileBattleLogs"));
        const party = payload.events.find((event) => event.type === "session_start").pParty;
        expect(party).toEqual(expect.arrayContaining([
            expect.objectContaining({
                species: "Charmander",
                loggedSpecies: "Charmander",
                currentSpecies: "Charizard",
                currentSpeciesId: 6,
                recordedSpeciesId: 4,
                rawSpeciesId: 4,
            }),
            expect.objectContaining({
                species: "Rotom-Wash",
                loggedSpecies: "Rotom",
                currentSpecies: "Rotom-Wash",
                currentSpeciesId: 479,
                recordedSpeciesId: 479,
                rawSpeciesId: 479,
            }),
            expect.objectContaining({
                species: "Giratina",
                loggedSpecies: "Giratina",
                currentSpecies: "Giratina-Origin",
                currentSpeciesId: 487,
                recordedSpeciesId: 487,
                rawSpeciesId: 487,
            }),
        ]));
        expect(payload.events.filter((event) => event.type === "pKo").map((event) => event.pSpecies))
            .toEqual(["Charmander", "Rotom-Wash", "Giratina"]);
    });

    test("normalizes cached save-log parties created before historical stages were authoritative", function () {
        const stored = new Map();
        stored.set("battleLogActiveSource", "save-file");
        stored.set("customsets", JSON.stringify({
            "Rotom-Wash": { "My Box": { ability: "Levitate" } },
        }));
        stored.set("saveFileBattleLogs", JSON.stringify({
            version: "gen5-save-v2",
            sourceType: "save-file",
            preserveDuplicateTrainers: true,
            events: [
                {
                    type: "session_start",
                    enemyTrainerIdA: 1,
                    pParty: [
                        { species: "Charizard", loggedSpecies: "Charmander", rawSpeciesId: 6 },
                        { species: "Rotom-Wash", loggedSpecies: "Rotom", rawSpeciesId: 479 },
                    ],
                },
                { type: "pKo", pSlot: 0, pSpecies: "Charizard", aiSpecies: "Patrat" },
                { type: "pKo", pSlot: 1, pSpecies: "Rotom-Wash", aiSpecies: "Purrloin" },
                { type: "session_end" },
            ],
        }));
        global.localStorage = {
            getItem: (key) => stored.has(key) ? stored.get(key) : null,
            setItem: (key, value) => stored.set(key, String(value)),
            removeItem: (key) => stored.delete(key),
        };

        const speciesNames = new Array(480).fill("");
        speciesNames[4] = "Charmander";
        speciesNames[6] = "Charizard";
        speciesNames[479] = "Rotom";
        global.window = {
            sav_pok_names: speciesNames,
            setdex: {},
            getSpeciesFamilyMembers: (speciesName) => [speciesName],
        };
        global.document = {
            getElementById: () => null,
            addEventListener: () => {},
            querySelectorAll: () => [],
            body: { classList: { contains: () => false } },
        };
        global.$ = () => ({ length: 0 });

        jest.resetModules();
        require("../../js/fragsheet/battle_log.js");

        expect(window.getBattleLogSpeciesBattleCounts()).toEqual({
            Charmander: 1,
            "Rotom-Wash": 1,
        });
        expect(Object.keys(window.getBattleLogPlayerPartyReconstructionSets()).sort())
            .toEqual(["Charmander", "Rotom-Wash"]);
    });
});
