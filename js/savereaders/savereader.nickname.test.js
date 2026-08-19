const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const test = require("node:test")
const vm = require("node:vm")

function loadSaveReader(baseGame, textTable = {}) {
    const source = fs.readFileSync(path.join(__dirname, "savereader.js"), "utf8")
    const jqueryStub = {
        click() { return this },
        ready() { return this },
    }
    const context = {
        $: () => jqueryStub,
        baseGame,
        document: {},
        textTable,
    }

    vm.createContext(context)
    vm.runInContext(source, context)
    return context
}

test("Gen 5 nickname decoding stops at the first string terminator", () => {
    const context = loadSaveReader("BW")
    const nicknameWords = [
        0x0041, 0x0061, 0xFFFF, 0x0068, 0x006F,
        0x0070, 0xFFFF, 0x0000, 0x0000, 0x0000,
    ]

    assert.equal(context.decodeDsNickname(nicknameWords, 0), "Aa")
})

test("nickname decoding preserves a full ten-character name", () => {
    const context = loadSaveReader("BW")
    const nicknameWords = Array.from("Abcdefghij", character => character.charCodeAt(0))

    assert.equal(context.decodeDsNickname(nicknameWords, 0), "Abcdefghij")
})

for (const baseGame of ["DP", "Pt", "HGSS"]) {
    test(`${baseGame} nickname decoding stops at the string terminator`, () => {
        const context = loadSaveReader(baseGame, { 1: "A", 2: "a", 3: "h" })
        const nicknameWords = [1, 2, 0xFFFF, 3]

        assert.equal(context.decodeDsNickname(nicknameWords, 0), "Aa")
    })
}
