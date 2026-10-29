const logFormat = require('../../js/savereaders/gen5_save_battle_log.js')

function writeU16(bytes, offset, value) {
  bytes[offset] = value & 0xff
  bytes[offset + 1] = (value >>> 8) & 0xff
}

function writeU32(bytes, offset, value) {
  writeU16(bytes, offset, value & 0xffff)
  writeU16(bytes, offset + 2, value >>> 16)
}

function writeBits(bytes, offset, width, value) {
  for (let bit = 0; bit < width; bit++) {
    if ((value >>> bit) & 1) bytes[(offset + bit) >>> 3] |= 1 << ((offset + bit) & 7)
  }
}

function createBoxedBulbasaur() {
  const mon = new Uint8Array(136)
  const core = new Uint8Array(128)
  writeU16(core, 0, 1)
  writeU32(core, 8, 1000)
  core[0x0d] = 65 // Overgrow
  writeU16(core, 0x20, 33) // Tackle
  const nickname = 'Bulbasaur'
  for (let index = 0; index < nickname.length; index++) writeU16(core, 0x40 + index * 2, nickname.charCodeAt(index))
  writeU16(core, 0x40 + nickname.length * 2, 0xffff)
  let checksum = 0
  for (let offset = 0; offset < core.length; offset += 2) checksum = (checksum + core[offset] + (core[offset + 1] << 8)) & 0xffff
  writeU16(mon, 6, checksum)
  let seed = checksum
  for (let offset = 0; offset < core.length; offset += 2) {
    seed = (Math.imul(seed, 0x41c64e6d) + 0x6073) >>> 0
    writeU16(mon, 8 + offset, (core[offset] | (core[offset + 1] << 8)) ^ (seed >>> 16))
  }
  return mon
}

function createGen5BattleLogSave(trainerId, baseVersion, withLogs = true) {
  const bytes = new Uint8Array(0x80000)
  bytes.set(createBoxedBulbasaur(), 0x400)
  if (!withLogs) return bytes

  const trainerIds = Array.isArray(trainerId) ? trainerId : [trainerId]
  if (trainerIds.length > logFormat.BLOCKS[0].capacity) throw new Error('Test save exceeds the first log block')

  // Use the secondary copy to exercise the different BW and BW2 layouts.
  const copyOffset = baseVersion === 'BW2' ? 0x26000 : 0x24000
  logFormat.BLOCKS.forEach((block, index) => {
    const offset = copyOffset + block.offset
    writeU32(bytes, offset, logFormat.MAGIC)
    writeU16(bytes, offset + 4, logFormat.VERSION)
    writeU16(bytes, offset + 6, index === 0 ? trainerIds.length : 0)
    writeU16(bytes, offset + 8, block.capacity)
  })
  trainerIds.forEach((id, index) => {
    const record = new Uint8Array(logFormat.RECORD_SIZE)
    writeBits(record, 0, 10, id)
    writeBits(record, 10, 3, 1)
    writeBits(record, 13, 10, 1)
    writeBits(record, 73, 3, 1)
    bytes.set(record, copyOffset + logFormat.BLOCKS[0].offset + logFormat.HEADER_SIZE + index * logFormat.RECORD_SIZE)
  })
  return bytes
}

module.exports = { createGen5BattleLogSave }
