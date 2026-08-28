(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.Gen5SaveBattleLog = api;
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    "use strict";

    const MAGIC = 0x474F4C4B;
    const VERSION = 2;
    const HEADER_SIZE = 16;
    const RECORD_SIZE = 14;
    const PARTNER_KO_CREDIT = 7;
    const BRIDGE_MAGIC = "GBL1";
    const BRIDGE_HEADER_SIZE = 8;
    const BRIDGE_RANGE_HEADER_SIZE = 8;
    const BRIDGE_MAX_RANGE_COUNT = 16;
    const BRIDGE_MAX_SAVE_SIZE = 0x100000;
    const RAW_SAVE_SIZE = 0x80000;
    const BLOCKS = [
        { id: 29, offset: 0x19600, size: 0x1338, capacity: 350 },
        { id: 30, offset: 0x1AA00, size: 0x07C4, capacity: 140 },
        { id: 31, offset: 0x1B200, size: 0x0D54, capacity: 110 },
    ];
    const SAVE_LAYOUTS = {
        BW: {
            copyOffsets: [0, 0x24000],
            checksumTableOffset: 0x23F00,
            checksumTableLength: 0x8C,
            checksumTableChecksumOffset: 0x23F9A,
        },
        BW2: {
            copyOffsets: [0, 0x26000],
            checksumTableOffset: 0x25F00,
            checksumTableLength: 0x94,
            checksumTableChecksumOffset: 0x25FA2,
        },
    };
    const BOX_COUNT = 24;
    const BOX_BLOCK_OFFSET = 0x400;
    const BOX_BLOCK_STRIDE = 0x1000;
    const BOX_DATA_LENGTH = 0xFF0;
    const BOX_CHECKSUM_OFFSET = 0xFF2;
    const BOX_SLOT_COUNT = 30;
    const PK5_STORED_SIZE = 136;
    const PARTY_BLOCK_OFFSET = 0x18E00;
    const PARTY_BLOCK_LENGTH = 0x534;
    const PARTY_COUNT_OFFSET = PARTY_BLOCK_OFFSET + 4;
    const PARTY_SLOTS_OFFSET = PARTY_BLOCK_OFFSET + 8;
    const PARTY_SLOT_COUNT = 6;
    const PARTY_SLOT_SIZE = 220;
    const PARTY_CHECKSUM_OFFSET = 0x19336;
    const PARTY_CHECKSUM_INDEX = 26;
    const PK5_CORE_OFFSET = 8;
    const PK5_CORE_SIZE = 128;
    const PK5_BLOCK_SIZE = 32;
    const PK5_BLOCK_ORDERS = [
        [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1],
        [0, 3, 1, 2], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
        [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
        [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0],
        [2, 3, 0, 1], [2, 3, 1, 0], [3, 0, 1, 2], [3, 0, 2, 1],
        [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0],
    ];

    function toBytes(input) {
        if (input instanceof Uint8Array) {
            return input;
        }
        if (input instanceof ArrayBuffer) {
            return new Uint8Array(input);
        }
        if (ArrayBuffer.isView(input)) {
            return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
        }
        return new Uint8Array(0);
    }

    function readU16(bytes, offset) {
        return bytes[offset] | (bytes[offset + 1] << 8);
    }

    function readU32(bytes, offset) {
        return (bytes[offset]
            | (bytes[offset + 1] << 8)
            | (bytes[offset + 2] << 16)
            | (bytes[offset + 3] << 24)) >>> 0;
    }

    function writeU16(bytes, offset, value) {
        bytes[offset] = value & 0xFF;
        bytes[offset + 1] = (value >>> 8) & 0xFF;
    }

    function writeU32(bytes, offset, value) {
        bytes[offset] = value & 0xFF;
        bytes[offset + 1] = (value >>> 8) & 0xFF;
        bytes[offset + 2] = (value >>> 16) & 0xFF;
        bytes[offset + 3] = (value >>> 24) & 0xFF;
    }

    function crc16Ccitt(bytes) {
        let top = 0xFF;
        let bottom = 0xFF;
        for (let index = 0; index < bytes.length; index += 1) {
            let value = bytes[index] ^ top;
            value ^= value >>> 4;
            top = (bottom ^ (value >>> 3) ^ (value << 4)) & 0xFF;
            bottom = (value ^ (value << 5)) & 0xFF;
        }
        return ((top << 8) | bottom) & 0xFFFF;
    }

    function add16(bytes) {
        let sum = 0;
        for (let offset = 0; offset + 1 < bytes.length; offset += 2) {
            sum = (sum + readU16(bytes, offset)) & 0xFFFF;
        }
        return sum;
    }

    function cryptPk5Core(bytes, seed) {
        const output = new Uint8Array(bytes);
        let state = seed >>> 0;
        for (let offset = 0; offset < output.length; offset += 2) {
            state = (Math.imul(state, 0x41C64E6D) + 0x6073) >>> 0;
            writeU16(output, offset, readU16(output, offset) ^ (state >>> 16));
        }
        return output;
    }

    function isZeroRange(bytes, offset, length) {
        for (let index = 0; index < length; index += 1) {
            if (bytes[offset + index] !== 0) return false;
        }
        return true;
    }

    function clearPk5BattleCounters(bytes, offset) {
        if (offset < 0 || offset + PK5_STORED_SIZE > bytes.length) return "invalid";
        if (isZeroRange(bytes, offset, PK5_STORED_SIZE)) return "empty";

        const sanity = readU16(bytes, offset + 4);
        if ((sanity & 2) !== 0) return "invalid";
        const checksum = readU16(bytes, offset + 6);
        const storedCore = bytes.slice(offset + PK5_CORE_OFFSET, offset + PK5_CORE_OFFSET + PK5_CORE_SIZE);
        const decryptedCandidate = cryptPk5Core(storedCore, checksum);
        let physicalCore;
        let wasEncrypted;
        if (add16(decryptedCandidate) === checksum) {
            physicalCore = decryptedCandidate;
            wasEncrypted = true;
        } else if (add16(storedCore) === checksum) {
            physicalCore = storedCore;
            wasEncrypted = false;
        } else {
            return "invalid";
        }

        const personality = readU32(bytes, offset);
        const order = PK5_BLOCK_ORDERS[((personality & 0x3E000) >>> 13) % 24];
        const blockB = order.indexOf(1) * PK5_BLOCK_SIZE;
        const blockC = order.indexOf(2) * PK5_BLOCK_SIZE;
        const counterOffsets = [
            blockB + 0x1B,
            blockB + 0x1C,
            blockB + 0x1D,
            blockB + 0x1E,
            blockB + 0x1F,
            blockC + 0x16,
            blockC + 0x1C,
            blockC + 0x1D,
        ];
        const hasCounters = counterOffsets.some((counterOffset) => physicalCore[counterOffset] !== 0);
        if (!hasCounters) return "unchanged";
        counterOffsets.forEach((counterOffset) => {
            physicalCore[counterOffset] = 0;
        });

        const nextChecksum = add16(physicalCore);
        writeU16(bytes, offset + 6, nextChecksum);
        bytes.set(
            wasEncrypted ? cryptPk5Core(physicalCore, nextChecksum) : physicalCore,
            offset + PK5_CORE_OFFSET
        );
        return "cleared";
    }

    function refreshSaveBlockChecksum(bytes, halfOffset, dataOffset, dataLength, tableIndex, layout) {
        const start = halfOffset + dataOffset;
        const checksum = crc16Ccitt(bytes.subarray(start, start + dataLength));
        writeU16(bytes, start + dataLength + 2, checksum);
        writeU16(bytes, halfOffset + layout.checksumTableOffset + tableIndex * 2, checksum);
    }

    function refreshChecksumTable(bytes, halfOffset, layout) {
        const start = halfOffset + layout.checksumTableOffset;
        const checksum = crc16Ccitt(bytes.subarray(start, start + layout.checksumTableLength));
        writeU16(bytes, halfOffset + layout.checksumTableChecksumOffset, checksum);
    }

    function initializeEmptyLogBlock(bytes, halfOffset, spec) {
        const start = halfOffset + spec.offset;
        bytes.fill(0, start, start + spec.size);
        writeU32(bytes, start, MAGIC);
        writeU16(bytes, start + 4, VERSION);
        writeU16(bytes, start + 8, spec.capacity);
    }

    function clearSaveBattleLogData(input, options) {
        const source = toBytes(input);
        if (source.length < RAW_SAVE_SIZE) {
            throw new Error(`Gen 5 save is ${source.length} bytes; expected at least ${RAW_SAVE_SIZE}`);
        }
        const normalizedVersion = String(options && options.baseVersion || "BW2").toUpperCase();
        const layout = SAVE_LAYOUTS[normalizedVersion];
        if (!layout) throw new Error(`Unsupported Gen 5 save version: ${normalizedVersion}`);

        const bytes = new Uint8Array(source);
        const copies = [];
        let clearedPokemonInstances = 0;
        let skippedInvalidPokemon = 0;
        layout.copyOffsets.forEach((halfOffset, copyIndex) => {
            if (halfOffset + layout.checksumTableChecksumOffset + 2 > bytes.length) {
                throw new Error(`Gen 5 save copy ${copyIndex + 1} is truncated`);
            }

            let declaredRecordCount = 0;
            BLOCKS.forEach((spec) => {
                const blockStart = halfOffset + spec.offset;
                if (readU32(bytes, blockStart) === MAGIC && readU16(bytes, blockStart + 4) === VERSION) {
                    declaredRecordCount += Math.min(readU16(bytes, blockStart + 6), spec.capacity);
                }
                initializeEmptyLogBlock(bytes, halfOffset, spec);
                refreshSaveBlockChecksum(bytes, halfOffset, spec.offset, spec.size, spec.id, layout);
            });

            const touchedBoxes = new Set();
            let partyTouched = false;
            const partyCount = Math.min(bytes[halfOffset + PARTY_COUNT_OFFSET] || 0, PARTY_SLOT_COUNT);
            for (let slot = 0; slot < partyCount; slot += 1) {
                const result = clearPk5BattleCounters(
                    bytes,
                    halfOffset + PARTY_SLOTS_OFFSET + slot * PARTY_SLOT_SIZE
                );
                if (result === "cleared") {
                    clearedPokemonInstances += 1;
                    partyTouched = true;
                } else if (result === "invalid") {
                    skippedInvalidPokemon += 1;
                }
            }

            for (let box = 0; box < BOX_COUNT; box += 1) {
                const boxStart = halfOffset + BOX_BLOCK_OFFSET + box * BOX_BLOCK_STRIDE;
                for (let slot = 0; slot < BOX_SLOT_COUNT; slot += 1) {
                    const result = clearPk5BattleCounters(
                        bytes,
                        boxStart + slot * PK5_STORED_SIZE
                    );
                    if (result === "cleared") {
                        clearedPokemonInstances += 1;
                        touchedBoxes.add(box);
                    } else if (result === "invalid") {
                        skippedInvalidPokemon += 1;
                    }
                }
            }

            touchedBoxes.forEach((box) => {
                refreshSaveBlockChecksum(
                    bytes,
                    halfOffset,
                    BOX_BLOCK_OFFSET + box * BOX_BLOCK_STRIDE,
                    BOX_DATA_LENGTH,
                    box + 1,
                    layout
                );
            });
            if (partyTouched) {
                const partyStart = halfOffset + PARTY_BLOCK_OFFSET;
                const checksum = crc16Ccitt(bytes.subarray(partyStart, partyStart + PARTY_BLOCK_LENGTH));
                writeU16(bytes, halfOffset + PARTY_CHECKSUM_OFFSET, checksum);
                writeU16(
                    bytes,
                    halfOffset + layout.checksumTableOffset + PARTY_CHECKSUM_INDEX * 2,
                    checksum
                );
            }
            refreshChecksumTable(bytes, halfOffset, layout);
            copies.push({ copyIndex, halfOffset, declaredRecordCount });
        });

        return {
            bytes,
            baseVersion: normalizedVersion,
            clearedRecordCount: Math.max(...copies.map((copy) => copy.declaredRecordCount), 0),
            clearedPokemonInstances,
            skippedInvalidPokemon,
            copies,
        };
    }

    function decodePokemonCounters(decryptedWords, shiftOrder) {
        if (!Array.isArray(decryptedWords) || decryptedWords.length < 64
            || !Array.isArray(shiftOrder) || shiftOrder.length !== 4) {
            return { koCount: 0, battlesBrought: 0, battlesUsed: 0 };
        }

        const blockB = shiftOrder.indexOf(1) * 16;
        const blockC = shiftOrder.indexOf(2) * 16;
        if (blockB < 0 || blockC < 0) {
            return { koCount: 0, battlesBrought: 0, battlesUsed: 0 };
        }

        // The current battle-counter patch stores the KO low byte at logical
        // PK5 byte 0x43 and the high byte at 0x5E. The other two counters use
        // the reserved Block B words at 0x44 and 0x46.
        const koLow = (decryptedWords[blockB + 13] >>> 8) & 0xFF;
        const koHigh = decryptedWords[blockC + 11] & 0xFF;
        const splitKoCount = (koLow | (koHigh << 8)) >>> 0;
        const legacyKoCount = decryptedWords[blockC + 14] & 0xFFFF;
        return {
            koCount: splitKoCount || legacyKoCount,
            battlesBrought: decryptedWords[blockB + 14] & 0xFFFF,
            battlesUsed: decryptedWords[blockB + 15] & 0xFFFF,
        };
    }

    function readBits(bytes, bitOffset, width) {
        let value = 0;
        for (let bit = 0; bit < width; bit += 1) {
            const absoluteBit = bitOffset + bit;
            const byteIndex = absoluteBit >> 3;
            const bitIndex = absoluteBit & 7;
            value |= ((bytes[byteIndex] >> bitIndex) & 1) << bit;
        }
        return value >>> 0;
    }

    function decodeRecord(recordBytes) {
        const playerSpeciesIds = [];
        const playerKoCreditsByEnemy = [];
        const aiKoCreditsByPlayer = [];

        for (let slot = 0; slot < 6; slot += 1) {
            playerSpeciesIds.push(readBits(recordBytes, 13 + slot * 10, 10));
            playerKoCreditsByEnemy.push(readBits(recordBytes, 73 + slot * 3, 3));
            aiKoCreditsByPlayer.push(readBits(recordBytes, 91 + slot * 3, 3));
        }

        const storedPlayerCount = readBits(recordBytes, 10, 3);
        // Some older v2 tag/multi-battle builds stored the runtime client
        // party count (2) even though they snapshotted all six player party
        // species and attributed KOs to those original slots. Recover that
        // unambiguous shape so valid records after it are not treated as a
        // corrupt tail. Keep the packed value available for diagnostics.
        const hasLegacyExpandedParty = storedPlayerCount === 2
            && playerSpeciesIds.every((speciesId) => speciesId > 0);

        const record = {
            trainerId: readBits(recordBytes, 0, 10),
            playerCount: hasLegacyExpandedParty ? 6 : storedPlayerCount,
            playerSpeciesIds,
            playerKoCreditsByEnemy,
            aiKoCreditsByPlayer,
        };
        if (hasLegacyExpandedParty) {
            record.storedPlayerCount = storedPlayerCount;
            record.recoveredLegacyTagPlayerCount = true;
        }
        return record;
    }

    function getRecordStructuralError(record) {
        if (!record || !Number.isInteger(record.trainerId) || record.trainerId <= 0) {
            return "invalid-trainer-id";
        }
        if (!Number.isInteger(record.playerCount) || record.playerCount < 1 || record.playerCount > 6) {
            return "invalid-player-count";
        }

        for (let slot = 0; slot < 6; slot += 1) {
            const speciesId = Number(record.playerSpeciesIds[slot]) || 0;
            if (slot < record.playerCount && (speciesId < 1 || speciesId > 1023)) {
                return "missing-player-species";
            }
            if (slot >= record.playerCount && speciesId !== 0) {
                return "species-after-player-count";
            }

            const playerCredit = Number(record.playerKoCreditsByEnemy[slot]) || 0;
            if (playerCredit !== 0 && playerCredit !== PARTNER_KO_CREDIT
                && (playerCredit < 1 || playerCredit > record.playerCount)) {
                return "player-ko-credit-outside-party";
            }

            const enemyCredit = Number(record.aiKoCreditsByPlayer[slot]) || 0;
            if (enemyCredit < 0 || enemyCredit > 6) {
                return "invalid-ai-ko-credit";
            }
            if (slot >= record.playerCount && enemyCredit !== 0) {
                return "ai-ko-credit-after-player-count";
            }
        }
        return null;
    }

    function readBlockHeader(bytes, copyOffset, spec) {
        const offset = copyOffset + spec.offset;
        if (offset < 0 || offset + spec.size > bytes.length) {
            return { valid: false, reason: "outside-save" };
        }

        const magic = readU32(bytes, offset);
        const version = readU16(bytes, offset + 4);
        const count = readU16(bytes, offset + 6);
        const capacity = readU16(bytes, offset + 8);
        const flags = readU16(bytes, offset + 10);
        const valid = magic === MAGIC
            && version === VERSION
            && capacity === spec.capacity
            && count <= spec.capacity
            && HEADER_SIZE + count * RECORD_SIZE <= spec.size;

        return { valid, offset, magic, version, count, capacity, flags };
    }

    function parseCopy(bytes, copyOffset) {
        const headers = BLOCKS.map((spec) => readBlockHeader(bytes, copyOffset, spec));
        const repairableMissingMiddle = headers[0].valid
            && !headers[1].valid
            && headers[2].valid
            && headers[0].count < BLOCKS[0].capacity
            && headers[2].count === 0;

        if (repairableMissingMiddle) {
            headers[1] = {
                valid: true,
                repairedLegacyHeader: true,
                offset: copyOffset + BLOCKS[1].offset,
                count: 0,
                capacity: BLOCKS[1].capacity,
                flags: 0,
            };
        }

        if (!headers.every((header) => header.valid)) {
            return { valid: false, copyOffset, headers, records: [] };
        }

        if ((headers[0].count < BLOCKS[0].capacity && (headers[1].count !== 0 || headers[2].count !== 0))
            || (headers[1].count < BLOCKS[1].capacity && headers[2].count !== 0)) {
            return { valid: false, copyOffset, headers, records: [], reason: "noncontiguous-records" };
        }

        const records = [];
        const declaredRecordCount = headers.reduce((sum, header) => sum + header.count, 0);
        let corruptRecordIndex = null;
        let corruptRecordReason = null;
        headers.some((header) => {
            for (let index = 0; index < header.count; index += 1) {
                const start = header.offset + HEADER_SIZE + index * RECORD_SIZE;
                const record = decodeRecord(bytes.subarray(start, start + RECORD_SIZE));
                const structuralError = getRecordStructuralError(record);
                if (structuralError) {
                    corruptRecordIndex = records.length;
                    corruptRecordReason = structuralError;
                    return true;
                }
                records.push(record);
            }
            return false;
        });

        return {
            valid: true,
            copyOffset,
            headers,
            records,
            declaredRecordCount,
            corruptRecordIndex,
            corruptRecordReason,
            omittedCorruptRecordCount: corruptRecordIndex === null
                ? 0
                : declaredRecordCount - corruptRecordIndex,
            overflow: headers.some((header) => (header.flags & 1) !== 0),
        };
    }

    function getCopyOffsets(baseVersion) {
        const normalized = String(baseVersion || "").toUpperCase();
        if (normalized === "BW2") {
            return [0, 0x26000];
        }
        if (normalized === "BW") {
            return [0, 0x24000];
        }
        return [0, 0x24000, 0x26000];
    }

    function parse(input, options) {
        const bytes = toBytes(input);
        const settings = options && typeof options === "object" ? options : {};
        const candidates = getCopyOffsets(settings.baseVersion)
            .filter((offset, index, all) => all.indexOf(offset) === index)
            .map((offset) => parseCopy(bytes, offset))
            .filter((candidate) => candidate.valid);

        if (!candidates.length) {
            return { valid: false, hasLogs: false, records: [], copies: [] };
        }

        candidates.sort((left, right) => {
            if (right.records.length !== left.records.length) {
                return right.records.length - left.records.length;
            }
            return left.copyOffset - right.copyOffset;
        });

        const selected = candidates[0];
        return {
            valid: true,
            hasLogs: selected.records.length > 0,
            records: selected.records,
            overflow: selected.overflow,
            declaredRecordCount: selected.declaredRecordCount,
            corruptRecordIndex: selected.corruptRecordIndex,
            corruptRecordReason: selected.corruptRecordReason,
            omittedCorruptRecordCount: selected.omittedCorruptRecordCount,
            copyOffset: selected.copyOffset,
            headers: selected.headers,
            copies: candidates,
        };
    }

    function parseBridgeSnapshot(input) {
        const bytes = toBytes(input);
        if (bytes.length < BRIDGE_HEADER_SIZE) {
            return { valid: false, hasLogs: false, records: [], reason: "bridge-too-short" };
        }

        const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
        const baseVersionId = bytes[4];
        const rangeCount = bytes[5];
        if (magic !== BRIDGE_MAGIC || (baseVersionId !== 1 && baseVersionId !== 2)
            || rangeCount === 0 || rangeCount > BRIDGE_MAX_RANGE_COUNT) {
            return { valid: false, hasLogs: false, records: [], reason: "invalid-bridge-header" };
        }

        let cursor = BRIDGE_HEADER_SIZE;
        let saveSize = 0;
        const ranges = [];
        for (let index = 0; index < rangeCount; index += 1) {
            if (cursor + BRIDGE_RANGE_HEADER_SIZE > bytes.length) {
                return { valid: false, hasLogs: false, records: [], reason: "truncated-bridge-range-header" };
            }
            const offset = readU32(bytes, cursor);
            const length = readU32(bytes, cursor + 4);
            cursor += BRIDGE_RANGE_HEADER_SIZE;
            if (!length || offset > BRIDGE_MAX_SAVE_SIZE || length > BRIDGE_MAX_SAVE_SIZE - offset
                || cursor + length > bytes.length) {
                return { valid: false, hasLogs: false, records: [], reason: "invalid-bridge-range" };
            }
            ranges.push({ offset, length, cursor });
            saveSize = Math.max(saveSize, offset + length);
            cursor += length;
        }
        if (cursor !== bytes.length || saveSize > BRIDGE_MAX_SAVE_SIZE) {
            return { valid: false, hasLogs: false, records: [], reason: "invalid-bridge-length" };
        }

        const reconstructedSave = new Uint8Array(saveSize);
        ranges.forEach((range) => {
            reconstructedSave.set(bytes.subarray(range.cursor, range.cursor + range.length), range.offset);
        });
        const parsed = parse(reconstructedSave, { baseVersion: baseVersionId === 2 ? "BW2" : "BW" });
        parsed.bridge = true;
        parsed.baseVersion = baseVersionId === 2 ? "BW2" : "BW";
        return parsed;
    }

    return {
        MAGIC,
        VERSION,
        HEADER_SIZE,
        RECORD_SIZE,
        PARTNER_KO_CREDIT,
        BLOCKS,
        BRIDGE_MAGIC,
        SAVE_LAYOUTS,
        crc16Ccitt,
        clearSaveBattleLogData,
        decodePokemonCounters,
        decodeRecord,
        getRecordStructuralError,
        parseCopy,
        parse,
        parseBridgeSnapshot,
    };
});
