-- Run from the calculator root: lua scripts/verify_pokemon_null_126_lua.lua /path/to/null126.gba [/path/to/null12.gba]
local function readFile(path)
    local file = assert(io.open(path, "rb"))
    local contents = file:read("*a")
    file:close()
    return contents
end

local rom = readFile(assert(arg[1], "Provide the Pokemon Null 1.2.6 ROM"))
local ram = {}
emu = {}
function emu:read8(address)
    if address >= 0x08000000 then
        return rom:byte(address - 0x08000000 + 1) or 0
    end
    return ram[address] or 0
end
function emu:read16(address)
    return self:read8(address) | (self:read8(address + 1) << 8)
end
function emu:read32(address)
    return self:read16(address) | (self:read16(address + 2) << 16)
end
function emu:readRange(address, length)
    local bytes = {}
    for i = 0, length - 1 do bytes[#bytes + 1] = string.char(self:read8(address + i)) end
    return table.concat(bytes)
end

local function loadDataModule(version)
    local bundle = readFile("lua/pokemonnull" .. version .. ".lua")
    local module = assert(bundle:match("%-%- >>> BEGIN 00_data_showdown.lua\n(.-)%-%- <<< END 00_data_showdown.lua"))
    assert(load(module, "Null " .. version .. " data module"))()
end

local function write32(address, value)
    for i = 0, 3 do ram[address + i] = (value >> (i * 8)) & 0xFF end
end

local function writeMon(address, species, exp)
    local pid, owner = 24, 42069
    write32(address, pid)
    write32(address + 4, owner)
    ram[address + 21] = 2
    local words = {species, exp, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}
    for i, word in ipairs(words) do write32(address + 36 + (i - 1) * 4, word ~ pid ~ owner) end
end

local function assertPackedMon(bytes, slot, species, level)
    local bits = string.unpack("<I3", bytes, 9 + (slot - 1) * 14)
    assert((bits & 0x7FF) == species and ((bits >> 11) & 0x7F) == level,
        string.format("Slot %d should pack species %d at level %d", slot, species, level))
end

local speciesInfo, expTable = 0x083E4BF0, 0x083E3F50
assert(emu:read32(0x08089034) == expTable and emu:read32(0x08089038) == speciesInfo, "Wrong ROM")
local quaquaval, wyrdeer = 914, 899
for _, version in ipairs({"1.2", "1.2.5", "1.2.6"}) do
    loadDataModule(version)
    local sampleByCurve = {}
    for species = 1, 1426 do
        local curve = emu:read8(speciesInfo + 36 * species + 21)
        assert(curve <= 5 and getCurve(species) == curve, "Wrong growth group for species " .. species)
        sampleByCurve[curve] = species
    end
    for curve = 0, 5 do
        local species = assert(sampleByCurve[curve])
        for level = 2, 100 do
            local threshold = emu:read32(expTable + (curve * 101 + level) * 4)
            assert(expRequired(species, level) == threshold)
            assert(calcLevel(threshold, species) == level)
            assert(calcLevel(threshold - 1, species) == level - 1)
        end
    end
    assert(calcLevel(1500000, quaquaval) == 100, "Level cap")

    -- Reproduce the reported PC levels and verify the actual sync payload.
    assert(expRequired(quaquaval, 38) == 47846 and expRequired(wyrdeer, 38) == 68590)
    local party, box = 0x02005370, 0x0200A154 + 4
    ram[0x0200536D] = 1
    writeMon(party, 904, 91125)
    ram[party + 88] = 45
    writeMon(box, quaquaval, 47846)
    writeMon(box + 84, wyrdeer, 68590)
    local packed = buildPackedBoxBytes()
    assert(packed:sub(1, 4) == "NBX1" and #packed == 50)
    assertPackedMon(packed, 1, 904, 45)
    assertPackedMon(packed, 2, quaquaval, 38)
    assertPackedMon(packed, 3, wyrdeer, 38)
    print("Sync " .. version .. ": 1.2.6 species assignments, every EXP boundary, and /box levels verified")
end

if arg[2] then
    rom = readFile(arg[2])
    loadDataModule("1.2")
    assert(getCurve(quaquaval) == 3 and getCurve(wyrdeer) == 5)
    local packed = buildPackedBoxBytes()
    assertPackedMon(packed, 2, quaquaval, 38)
    assertPackedMon(packed, 3, wyrdeer, 38)
    print("Sync 1.2: original ROM fallback verified")

    loadDataModule("1.2.6")
    local ok, err = pcall(buildPackedBoxBytes)
    assert(not ok and tostring(err):find("requires the Pokemon Null 1.2.6 ROM", 1, true))
end
