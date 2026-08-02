"use strict";

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

describe("Gen 5 save-file battle log decoder", function () {
    test("decodes trainer, party, and both KO attribution directions", function () {
        const decoded = parser.decodeRecord(encodeRecord(makeRecord(219, 1)));
        expect(decoded).toEqual(makeRecord(219, 1));
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
});
