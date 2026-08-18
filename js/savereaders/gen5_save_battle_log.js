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
    const BRIDGE_MAGIC = "GBL1";
    const BRIDGE_HEADER_SIZE = 8;
    const BRIDGE_RANGE_HEADER_SIZE = 8;
    const BRIDGE_MAX_RANGE_COUNT = 16;
    const BRIDGE_MAX_SAVE_SIZE = 0x100000;
    const BLOCKS = [
        { offset: 0x19600, size: 0x1338, capacity: 350 },
        { offset: 0x1AA00, size: 0x07C4, capacity: 140 },
        { offset: 0x1B200, size: 0x0D54, capacity: 110 },
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
        return {
            koCount: (koLow | (koHigh << 8)) >>> 0,
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

        return {
            trainerId: readBits(recordBytes, 0, 10),
            playerCount: readBits(recordBytes, 10, 3),
            playerSpeciesIds,
            playerKoCreditsByEnemy,
            aiKoCreditsByPlayer,
        };
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
        headers.forEach((header) => {
            for (let index = 0; index < header.count; index += 1) {
                const start = header.offset + HEADER_SIZE + index * RECORD_SIZE;
                const record = decodeRecord(bytes.subarray(start, start + RECORD_SIZE));
                if (record.trainerId > 0 && record.playerCount > 0 && record.playerCount <= 6) {
                    records.push(record);
                }
            }
        });

        return {
            valid: true,
            copyOffset,
            headers,
            records,
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
        BLOCKS,
        BRIDGE_MAGIC,
        decodePokemonCounters,
        decodeRecord,
        parseCopy,
        parse,
        parseBridgeSnapshot,
    };
});
