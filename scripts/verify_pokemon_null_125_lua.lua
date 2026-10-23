-- Verify the shipped Lua decoder against a freshly built 1.2.5 ROM.
-- lua scripts/verify_pokemon_null_125_lua.lua /path/to/PokemonNull/pokeemerald.gba
local function readFile(path)
    local file = assert(io.open(path, "rb"))
    local contents = file:read("*a")
    file:close()
    return contents
end

local rom = readFile(assert(arg[1], "Provide the rebuilt 1.2.5 ROM path"))
local bundle = readFile("lua/pokemonnull1.2.5.lua")
local module = assert(bundle:match("%-%- >>> BEGIN 00_data_showdown.lua\n(.-)%-%- <<< END 00_data_showdown.lua"))
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
local function write32(address, value)
    for i = 0, 3 do ram[address + i] = (value >> (i * 8)) & 0xFF end
end
assert(load(module, "Null 1.2.5 data module"))()

assert(getAbility({species = 199, altAbility = 0}) == "Regenerator", "Slowking normal ability")
assert(getAbility({species = 199, altAbility = 2}) == "Shell Armor", "Slowking hidden ability")
assert(item[690] == "Recall Charm", "Recall Charm item ID")
local speciesInfo = assert(tonumber(module:match("local speciesInfo=(0x%x+)")))
assert(emu:read8(speciesInfo + 36 * 964 + 1) == 70, "Palafin base Attack")

-- PC box index 9, using the zero-personality identity that previously hid Overqwil.
local address = 0x0200A154 + 4 + 9 * 84
local owner = 42069
write32(address, 0)
write32(address + 4, owner)
ram[address + 20] = 2
ram[address + 21] = 2
local words = {
    904, 91125, 7 << 21,
    (242 << 16) | 269, (103 << 16) | 92, 0,
    0, 0, 0,
    0, 31, 0,
}
for i, word in ipairs(words) do write32(address + 36 + (i - 1) * 4, word ~ owner) end
local mon = readBoxMon(address)
assert(mon.personality == 0 and mon.species == 904, "Zero-personality boxed Overqwil")
assert(mon.moves[1] == 269 and mon.moves[4] == 103, "Overqwil moves")
assert(calcLevel(mon.experience, mon.species) == 45, "ROM growth table and boxed level")
assert(getAbility(mon) == "Intimidate", "Overqwil ability")
print("Lua/ROM verification passed: relocated tables, Slowking abilities, Recall Charm, Palafin, boxed Overqwil level/moves/ability")
