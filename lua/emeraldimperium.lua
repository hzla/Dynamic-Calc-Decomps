-- Gen 3 Milestone 2 (turn-by-turn battle logger)
-- Trainer battles only. Logs move-use, HP deltas, KO attribution, and session data to JSONL.

local SCRIPT_VERSION = "v3.3"

local CONFIG = {
    addresses = {
        -- Optional (main.h): struct Main gMain, inBattle bit at +0x439 (bit 1)
        gMain = 0x03004218,

        -- Pinned from gen3/pokeemerald.map for the matching ROM build.
        gBattleTypeFlags = 0x020002C0,
        gBattleStruct = 0x02000830, -- pointer variable: struct BattleStruct *gBattleStruct
        gBattlersCount = 0x02000344,
        gBattlerPartyIndexes = 0x02000348,
        gBattlerPositions = 0x02000350,
        gBattleMons = 0x02000360,
        gPlayerParty = 0x0203769C,
        gEnemyParty = 0x020378F4,
        gEnemyPartyCount = 0x0203769A,
        gPlayerPartyCount = 0x02037699,
        gPokemonStoragePtr = 0x03006220,
        gSaveBlock2Ptr = 0x0300621C,
        gTrainerBattleOpponent_A = 0x020008DA,
        gTrainerBattleOpponent_B = 0x020008DC,

        -- Optional overrides
        -- (set to nil to disable individual fields)
    },

    layout = {
        -- Relative to gBattleTypeFlags = 0x020002C0 in this build:
        -- gBattlersCount      @ +0x84 (0x02000344)
        -- gBattlerPartyIndexes@ +0x88 (0x02000348)
        -- gBattlerPositions   @ +0x90 (0x02000350)
        -- gBattleMons         @ +0xA0 (0x02000360)
        candidate_layouts = {
            {
                name = "map_pinned_abs",
                absolute = true,
            },
            {
                name = "name12_derived",
                battlers_count_offset = 0x84,
                battler_party_indexes_offset = 0x86,
                battler_positions_offset = 0x8E,
                battle_mons_offset = 0x9C,
            },
            {
                name = "map_like",
                battlers_count_offset = 0x84,
                battler_party_indexes_offset = 0x86,
                battler_positions_offset = 0x8E,
                battle_mons_offset = 0xA0,
            },
            {
                name = "name12_shifted",
                battlers_count_offset = 0x88,
                battler_party_indexes_offset = 0x8A,
                battler_positions_offset = 0x92,
                battle_mons_offset = 0xA0,
            },
            {
                name = "map_offsets",
                battlers_count_offset = 0x84,
                battler_party_indexes_offset = 0x88,
                battler_positions_offset = 0x90,
                battle_mons_offset = 0xA0,
            },
            {
                name = "classic",
                battlers_count_offset = 0x78,
                battler_party_indexes_offset = 0x7A,
                battler_positions_offset = 0x82,
                battle_mons_offset = 0x90,
            },
        },
    },

    struct = {
        party_size = 6,
        party_mon_size = 100, -- sizeof(struct Pokemon)
        box_mon_size = 80, -- sizeof(struct BoxPokemon)
        total_boxes_count = 14,
        in_box_count = 30,
        -- NOTE: Although header comments may show boxes at +0x0001, this build aligns
        -- struct BoxPokemon to 4 bytes, so boxes[] begins at +0x0004 in memory.
        pokemon_storage_boxes_offset = 0x0004,

        battle_mon_size = 0x60, -- preferred sizeof(struct BattlePokemon), name length=12 fork
        battle_mon_size_candidates = { 0x60, 0x5C },
        battle_mon_species_offset = 0x00,
        battle_mon_moves_offset = 0x0C,
        battle_mon_pp_offset = 0x25,
        battle_mon_hp_offset = 0x29,
        battle_mon_level_offset = 0x2B,
        battle_mon_maxhp_offset = 0x2D,
        -- Calibrated from runtime probe on this ROM build.
        battle_struct_ai_final_score_offset = 0x2A0,
        -- Keep nil to derive from aiFinalScore (+0x100 / +0x104).
        battle_struct_ai_move_or_action_offset = nil,
        battle_struct_ai_chosen_target_offset = nil,
        max_battlers_count = 4,
        max_mon_moves = 4,

        box_secure_offset = 0x20,
        box_flags_offset = 0x13,
        level_offset = 0x54,
        hp_offset = 0x56,
        maxhp_offset = 0x58,
        substruct_size = 12,
        main_in_battle_offset = 0x439,

        max_species_id = 0x7FF,
        max_move_id = 0x7FF,
        max_item_id = 0x3FF,
    },

    session_reset_frames = 90,
    log_runtime_unresolved_warnings = false,

    enable_runtime_scan = false, -- keep false for performance; set true only if pinned map symbols are unavailable.
    scan = {
        ewram_start = 0x02000000,
        ewram_end = 0x02040000, -- exclusive; full EWRAM
    },

    output = {
        path = "/Users/andylee/Repos/vsrecorder/logs/Battle_Log_gen3.jsonl",
        condensed_path = nil, -- default: /logs/Battle_Log_<playerTrainerId>.jsonl
        write_full_log = false, -- when false, full M2 event stream is not written to disk
        mirror_console_events = false,
        mirror_console_startup = true,
    },

    http = {
        enabled = true,
        host = nil, -- nil = all interfaces (same as pokenav-minus)
        port = 31124,
        update_path = "/box",
        update_alias_path = "/update",
        box_path = "/box",
        battle_log_path = "/battle_log",
        update_legacy_path = "/update_legacy",
        ping_path = "/ping",
        battle_state_path = "/battle_state",
        box_slots_dumped_default = nil, -- nil => all boxes
    },
}

local BATTLE_TYPE = {
    TRAINER = (1 << 3),
}

local SUBSTRUCT_ORDER = {
    {0, 1, 2, 3}, {0, 1, 3, 2}, {0, 2, 1, 3}, {0, 3, 1, 2},
    {0, 2, 3, 1}, {0, 3, 2, 1}, {1, 0, 2, 3}, {1, 0, 3, 2},
    {2, 0, 1, 3}, {3, 0, 1, 2}, {2, 0, 3, 1}, {3, 0, 2, 1},
    {1, 2, 0, 3}, {1, 3, 0, 2}, {2, 1, 0, 3}, {3, 1, 0, 2},
    {2, 3, 0, 1}, {3, 2, 0, 1}, {1, 2, 3, 0}, {1, 3, 2, 0},
    {2, 1, 3, 0}, {3, 1, 2, 0}, {2, 3, 1, 0}, {3, 2, 1, 0},
}

local state = {
    frame = 0,
    frameDedup = {},

    sessionActive = false,
    sessionSignature = nil,
    sessionSyntheticTrainerId = nil,
    inactiveFrames = 0,

    actionIndex = 0,
    lastMoveByBattler = {},
    prevBattlers = {},
    prevEnemyParty = {},
    emittedKoKeys = {},
    recordedEnemyKos = {},
    lastLayoutName = nil,
    lastBattleMonSize = nil,
    runtimeFlagsAddr = nil,
    lastRuntimeWarnFrame = -1000000,
    warnedRuntimeUnresolved = false,
    didRuntimeScanThisSession = false,
    trainerA = nil,
    trainerB = nil,
    lastOutputErrorFrame = -1000000,
    lastBoxDumpPath = nil,
    lastCondensedBattleLogPath = nil,

    httpStarted = false,
    httpServer = nil,
    httpSocketModule = nil,
    httpUpdateRequests = 0,
    httpUpdateLegacyRequests = 0,
    httpBattleLogRequests = 0,
    httpBattleStateRequests = 0,
    scriptStarted = false,

    export = {
        mapLoaded = false,
        mapData = nil,
        current = {
            trainerId = nil,
            secretId = nil,
            trainerKey = "unknown:unknown",
            attempt = nil,
            attemptDir = nil,
            masterPath = nil,
        },
        eventsByAttempt = {},
        sessionCounterByAttempt = {},
        lastBoxMetaByAttempt = {},
        cachedBoxPayloadByAttempt = {},
    },
}

local EMERALD_SINGLETON_KEY = "__EMERALDIMPERIUM_HTTP_SINGLETON__"
local THIS_SCRIPT_TOKEN = tostring({})

local buildPartyBoxPayload
local buildPartyBoxPayloadJson
local buildLegacyPartyBoxPayloadJson
local getLogsDir
local getPlayerTrainerIds
local ensureDirExistsForPath
local appendBattleLogEvent
local emitCondensedRecord
local howToUseBuffer

local JSON_NULL = rawget(_G, "JSON_NULL")
if JSON_NULL == nil or type(JSON_NULL) ~= "table" then
    JSON_NULL = {}
    _G.JSON_NULL = JSON_NULL
end

local function getScriptDirectory()
    local info = debug and debug.getinfo and debug.getinfo(1, "S") or nil
    local source = info and info.source or nil
    if type(source) ~= "string" or source == "" then
        return "."
    end
    if source:sub(1, 1) == "@" then
        source = source:sub(2)
    end
    source = source:gsub("\\", "/")
    local dir = source:match("^(.*)/[^/]+$")
    if type(dir) == "string" and dir ~= "" then
        return dir
    end
    return "."
end

local NULL_EXPORT = {
    baseDir = getScriptDirectory(),
    mapFile = "attempt_map.json",
    version = "pokeemerald-expansion",
    defaultTrainerKey = "unknown:unknown",
}

local function log(msg)
    if console and console.log then
        console:log(msg)
    else
        print(msg)
    end
end

local function hex8(v)
    if v == nil then
        return "n/a"
    end
    return string.format("0x%08X", v & 0xFFFFFFFF)
end

local function hex4(v)
    if v == nil then
        return "n/a"
    end
    return string.format("0x%04X", v & 0xFFFF)
end

local function jsonEscape(str)
    if str == nil then
        return ""
    end
    str = tostring(str)
    str = str:gsub("\\", "\\\\")
    str = str:gsub("\"", "\\\"")
    str = str:gsub("\n", "\\n")
    str = str:gsub("\r", "\\r")
    str = str:gsub("\t", "\\t")
    return str
end

local function isArrayTable(t)
    if type(t) ~= "table" then
        return false
    end
    local n = #t
    for k, _ in pairs(t) do
        if type(k) ~= "number" or k < 1 or k > n or k % 1 ~= 0 then
            return false
        end
    end
    return true
end

local function jsonEncode(value)
    local valueType = type(value)
    if value == nil or value == JSON_NULL then
        return "null"
    elseif valueType == "boolean" then
        return value and "true" or "false"
    elseif valueType == "number" then
        if value ~= value or value == math.huge or value == -math.huge then
            return "null"
        end
        return string.format("%s", value)
    elseif valueType == "string" then
        return "\"" .. jsonEscape(value) .. "\""
    elseif valueType == "table" then
        if isArrayTable(value) then
            local parts = {}
            for i = 1, #value do
                parts[#parts + 1] = jsonEncode(value[i])
            end
            return "[" .. table.concat(parts, ",") .. "]"
        end
        local keys = {}
        for k, _ in pairs(value) do
            keys[#keys + 1] = { key = k, keyText = tostring(k) }
        end
        table.sort(keys, function(a, b)
            return a.keyText < b.keyText
        end)
        local parts = {}
        for i = 1, #keys do
            local key = keys[i].key
            local keyText = keys[i].keyText
            parts[#parts + 1] = "\"" .. jsonEscape(keyText) .. "\":" .. jsonEncode(value[key])
        end
        return "{" .. table.concat(parts, ",") .. "}"
    end
    return "null"
end

local function appendJsonRecordToPath(path, record)
    if not path or path == "" then
        return false
    end

    local f = io.open(path, "a")
    if not f then
        if state.frame - (state.lastOutputErrorFrame or -1000000) > 300 then
            log(string.format("[Gen3 M2] WARN unable to open log output path: %s", tostring(path)))
            state.lastOutputErrorFrame = state.frame
        end
        return false
    end

    f:write(jsonEncode(record))
    f:write("\n")
    f:close()
    return true
end

local function appendJsonRecord(record)
    if not (CONFIG.output and CONFIG.output.write_full_log) then
        return false
    end
    local path = CONFIG.output and CONFIG.output.path or nil
    return appendJsonRecordToPath(path, record)
end

local function emitRecord(record)
    appendJsonRecord(record)
    if CONFIG.output and CONFIG.output.mirror_console_events then
        log("[Gen3 M2] " .. jsonEncode(record))
    end
end

local function ensureOutputDirExists()
    local path = nil
    if CONFIG.output then
        if CONFIG.output.write_full_log then
            path = CONFIG.output.path
        else
            path = CONFIG.output.condensed_path or CONFIG.output.path
        end
    end
    if not path or path == "" then
        return
    end
    if not os or not os.execute then
        return
    end

    local dir = path:match("^(.*)/[^/]+$")
    if not dir or dir == "" then
        return
    end
    os.execute(string.format("mkdir -p \"%s\"", dir))
end

local function getDefaultCondensedBattleLogPath(trainerId)
    local idText = (trainerId ~= nil) and tostring(trainerId) or "unknown"
    return string.format("%s/attempt_for_%s.json", NULL_EXPORT.baseDir, idText)
end

ensureDirExistsForPath = function(path)
    if not path or path == "" then
        return
    end
    if not os or not os.execute then
        return
    end

    local dir = path:match("^(.*)/[^/]+$")
    if not dir or dir == "" then
        return
    end
    os.execute(string.format("mkdir -p \"%s\"", dir))
end

local function trim(s)
    if not s then
        return ""
    end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function fileExists(path)
    if not path then
        return false
    end
    local f = io.open(path, "r")
    if f then
        f:close()
        return true
    end
    return false
end

local function readFileText(path)
    local f = io.open(path, "r")
    if not f then
        return nil
    end
    local content = f:read("*a")
    f:close()
    return content
end

local function isLikelyJsonObjectText(text)
    if not text then
        return false
    end
    local t = trim(text)
    return t:match("^%b{}$") ~= nil
end

getLogsDir = function()
    local battleLogPath = CONFIG.output and CONFIG.output.path or nil
    if not battleLogPath then
        return "/Users/andylee/Repos/vsrecorder/logs"
    end
    local dir = battleLogPath:match("^(.*)/[^/]+$")
    if not dir or dir == "" then
        return "/Users/andylee/Repos/vsrecorder/logs"
    end
    return dir
end

local function jsonOrNull(value)
    if value == nil then
        return JSON_NULL
    end
    return value
end

local function jsonDecode(raw)
    if type(raw) ~= "string" then
        return nil, "json decode input must be string"
    end

    local len = #raw
    local idx = 1

    local function skipWs()
        while idx <= len do
            local c = raw:sub(idx, idx)
            if c == " " or c == "\t" or c == "\n" or c == "\r" then
                idx = idx + 1
            else
                break
            end
        end
    end

    local parseValue

    local function parseString()
        if raw:sub(idx, idx) ~= "\"" then
            return nil, string.format("expected '\"' at %d", idx)
        end
        idx = idx + 1
        local out = {}
        while idx <= len do
            local c = raw:sub(idx, idx)
            if c == "\"" then
                idx = idx + 1
                return table.concat(out), nil
            end
            if c == "\\" then
                idx = idx + 1
                if idx > len then
                    return nil, "unterminated escape"
                end
                local esc = raw:sub(idx, idx)
                if esc == "\"" then
                    out[#out + 1] = "\""
                elseif esc == "\\" then
                    out[#out + 1] = "\\"
                elseif esc == "/" then
                    out[#out + 1] = "/"
                elseif esc == "b" then
                    out[#out + 1] = "\b"
                elseif esc == "f" then
                    out[#out + 1] = "\f"
                elseif esc == "n" then
                    out[#out + 1] = "\n"
                elseif esc == "r" then
                    out[#out + 1] = "\r"
                elseif esc == "t" then
                    out[#out + 1] = "\t"
                elseif esc == "u" then
                    local hex = raw:sub(idx + 1, idx + 4)
                    if #hex < 4 or not hex:match("^[0-9A-Fa-f]+$") then
                        return nil, string.format("invalid unicode escape at %d", idx)
                    end
                    local code = tonumber(hex, 16) or 0
                    if code >= 32 and code <= 126 then
                        out[#out + 1] = string.char(code)
                    else
                        out[#out + 1] = "?"
                    end
                    idx = idx + 4
                else
                    return nil, string.format("invalid escape '%s' at %d", esc, idx)
                end
                idx = idx + 1
            else
                out[#out + 1] = c
                idx = idx + 1
            end
        end
        return nil, "unterminated string"
    end

    local function parseNumber()
        local start = idx
        local c = raw:sub(idx, idx)
        if c == "-" then
            idx = idx + 1
        end
        if idx > len then
            return nil, "unexpected end in number"
        end
        c = raw:sub(idx, idx)
        if c == "0" then
            idx = idx + 1
        elseif c:match("%d") then
            while idx <= len and raw:sub(idx, idx):match("%d") do
                idx = idx + 1
            end
        else
            return nil, string.format("invalid number at %d", start)
        end
        if idx <= len and raw:sub(idx, idx) == "." then
            idx = idx + 1
            if idx > len or not raw:sub(idx, idx):match("%d") then
                return nil, string.format("invalid decimal number at %d", start)
            end
            while idx <= len and raw:sub(idx, idx):match("%d") do
                idx = idx + 1
            end
        end
        if idx <= len then
            local e = raw:sub(idx, idx)
            if e == "e" or e == "E" then
                idx = idx + 1
                if idx <= len then
                    local sign = raw:sub(idx, idx)
                    if sign == "+" or sign == "-" then
                        idx = idx + 1
                    end
                end
                if idx > len or not raw:sub(idx, idx):match("%d") then
                    return nil, string.format("invalid exponent at %d", start)
                end
                while idx <= len and raw:sub(idx, idx):match("%d") do
                    idx = idx + 1
                end
            end
        end
        local text = raw:sub(start, idx - 1)
        local n = tonumber(text)
        if n == nil then
            return nil, string.format("invalid number token '%s'", text)
        end
        return n, nil
    end

    local function parseArray()
        if raw:sub(idx, idx) ~= "[" then
            return nil, string.format("expected '[' at %d", idx)
        end
        idx = idx + 1
        skipWs()
        local out = {}
        if raw:sub(idx, idx) == "]" then
            idx = idx + 1
            return out, nil
        end
        local n = 1
        while idx <= len do
            local v, err = parseValue()
            if err then
                return nil, err
            end
            out[n] = v
            n = n + 1
            skipWs()
            local c = raw:sub(idx, idx)
            if c == "," then
                idx = idx + 1
                skipWs()
            elseif c == "]" then
                idx = idx + 1
                return out, nil
            else
                return nil, string.format("expected ',' or ']' at %d", idx)
            end
        end
        return nil, "unterminated array"
    end

    local function parseObject()
        if raw:sub(idx, idx) ~= "{" then
            return nil, string.format("expected '{' at %d", idx)
        end
        idx = idx + 1
        skipWs()
        local out = {}
        if raw:sub(idx, idx) == "}" then
            idx = idx + 1
            return out, nil
        end
        while idx <= len do
            local key, keyErr = parseString()
            if keyErr then
                return nil, keyErr
            end
            skipWs()
            if raw:sub(idx, idx) ~= ":" then
                return nil, string.format("expected ':' at %d", idx)
            end
            idx = idx + 1
            skipWs()
            local value, valueErr = parseValue()
            if valueErr then
                return nil, valueErr
            end
            out[key] = value
            skipWs()
            local c = raw:sub(idx, idx)
            if c == "," then
                idx = idx + 1
                skipWs()
            elseif c == "}" then
                idx = idx + 1
                return out, nil
            else
                return nil, string.format("expected ',' or '}' at %d", idx)
            end
        end
        return nil, "unterminated object"
    end

    parseValue = function()
        skipWs()
        if idx > len then
            return nil, "unexpected end of input"
        end
        local c = raw:sub(idx, idx)
        if c == "\"" then
            return parseString()
        elseif c == "{" then
            return parseObject()
        elseif c == "[" then
            return parseArray()
        elseif c == "-" or c:match("%d") then
            return parseNumber()
        elseif raw:sub(idx, idx + 3) == "true" then
            idx = idx + 4
            return true, nil
        elseif raw:sub(idx, idx + 4) == "false" then
            idx = idx + 5
            return false, nil
        elseif raw:sub(idx, idx + 3) == "null" then
            idx = idx + 4
            return JSON_NULL, nil
        end
        return nil, string.format("unexpected token at %d", idx)
    end

    local value, err = parseValue()
    if err then
        return nil, err
    end
    skipWs()
    if idx <= len then
        return nil, string.format("trailing tokens at %d", idx)
    end
    return value, nil
end

local function makeTrainerKey(trainerId, secretId)
    if trainerId == nil or secretId == nil then
        return NULL_EXPORT.defaultTrainerKey
    end
    return string.format("%d:%d", trainerId, secretId)
end

local function splitTrainerKey(key)
    if type(key) ~= "string" then
        return nil, nil
    end
    local tid, sid = key:match("^(%d+):(%d+)$")
    if not tid or not sid then
        return nil, nil
    end
    return tonumber(tid), tonumber(sid)
end

local function getAttemptMapPath()
    return NULL_EXPORT.baseDir .. "/" .. NULL_EXPORT.mapFile
end

local function defaultAttemptMap()
    return {
        version = 1,
        nextAttempt = 1,
        map = {},
    }
end

local function loadAttemptMap()
    local path = getAttemptMapPath()
    local f = io.open(path, "r")
    if not f then
        return defaultAttemptMap()
    end
    local raw = f:read("*a")
    f:close()
    if type(raw) ~= "string" or raw == "" then
        return defaultAttemptMap()
    end

    local data = defaultAttemptMap()
    data.version = tonumber(raw:match("\"version\"%s*:%s*(%d+)")) or 1
    data.nextAttempt = tonumber(raw:match("\"nextAttempt\"%s*:%s*(%d+)")) or 1
    if data.nextAttempt < 1 then
        data.nextAttempt = 1
    end
    local mapBody = raw:match("\"map\"%s*:%s*{(.-)}")
    if mapBody then
        for key, attempt in mapBody:gmatch("\"([^\"]+)\"%s*:%s*(%d+)") do
            data.map[key] = tonumber(attempt)
        end
    end
    return data
end

local function saveAttemptMap(data)
    if type(data) ~= "table" then
        return false
    end
    local path = getAttemptMapPath()
    ensureDirExistsForPath(path)
    local f = io.open(path, "w")
    if not f then
        return false
    end
    local keys = {}
    for key, _ in pairs(data.map or {}) do
        keys[#keys + 1] = key
    end
    table.sort(keys)

    f:write("{\n")
    f:write(string.format("  \"version\": %d,\n", tonumber(data.version) or 1))
    f:write(string.format("  \"nextAttempt\": %d,\n", tonumber(data.nextAttempt) or 1))
    f:write("  \"map\": {\n")
    for i = 1, #keys do
        local key = keys[i]
        local attempt = tonumber(data.map[key]) or 1
        local comma = (i < #keys) and "," or ""
        f:write(string.format("    \"%s\": %d%s\n", jsonEscape(key), attempt, comma))
    end
    f:write("  }\n")
    f:write("}\n")
    f:close()
    return true
end

local function ensureAttemptMapLoaded()
    if state.export.mapLoaded and state.export.mapData then
        return state.export.mapData
    end
    local data = loadAttemptMap()
    state.export.mapLoaded = true
    state.export.mapData = data
    return data
end

local function resolveExportIdentity(existingKey)
    local trainerId, secretId = getPlayerTrainerIds()
    local trainerKey
    if trainerId ~= nil and secretId ~= nil then
        trainerKey = makeTrainerKey(trainerId, secretId)
    elseif type(existingKey) == "string" and existingKey ~= "" then
        trainerKey = existingKey
        trainerId, secretId = splitTrainerKey(existingKey)
    else
        trainerKey = NULL_EXPORT.defaultTrainerKey
    end
    return {
        trainerId = trainerId,
        secretId = secretId,
        trainerKey = trainerKey,
    }
end

local function getOrCreateAttemptForKey(trainerKey)
    local mapData = ensureAttemptMapLoaded()
    local key = trainerKey or NULL_EXPORT.defaultTrainerKey
    local existing = mapData.map[key]
    if existing and existing >= 1 then
        return existing
    end
    local attempt = tonumber(mapData.nextAttempt) or 1
    if attempt < 1 then
        attempt = 1
    end
    mapData.map[key] = attempt
    mapData.nextAttempt = attempt + 1
    saveAttemptMap(mapData)
    return attempt
end

local function getAttemptDir(attempt)
    return string.format("%s/imperium_attempt_%d", NULL_EXPORT.baseDir, tonumber(attempt) or 1)
end

local function getMasterPath(attempt)
    local n = tonumber(attempt) or 1
    return string.format("%s/attempt_%d.json", getAttemptDir(n), n)
end

local function trimIncompleteBattleEvents(events)
    if type(events) ~= "table" then
        return {}, false
    end
    local out = {}
    local currentSessionStart = nil
    local dropped = false
    for i = 1, #events do
        local ev = events[i]
        local evType = type(ev) == "table" and ev.type or nil
        if evType == "session_start" then
            if currentSessionStart ~= nil then
                while #out >= currentSessionStart do
                    out[#out] = nil
                end
                dropped = true
            end
            currentSessionStart = #out + 1
            out[#out + 1] = ev
        elseif evType == "session_end" then
            if currentSessionStart ~= nil then
                out[#out + 1] = ev
                currentSessionStart = nil
            else
                out[#out + 1] = ev
            end
        else
            out[#out + 1] = ev
        end
    end
    if currentSessionStart ~= nil then
        while #out >= currentSessionStart do
            out[#out] = nil
        end
        dropped = true
    end
    return out, dropped
end

local function loadMasterTable(path)
    if not fileExists(path) then
        return nil, nil
    end
    local raw = readFileText(path)
    if type(raw) ~= "string" or trim(raw) == "" then
        return nil, "empty_file"
    end
    local parsed, err = jsonDecode(raw)
    if not parsed or err then
        return nil, err or "decode_failed"
    end
    if type(parsed) ~= "table" then
        return nil, "decoded_master_not_object"
    end
    return parsed, nil
end

local function hydrateAttemptStateFromMaster(attempt, masterPath)
    local parsed, err = loadMasterTable(masterPath)
    local events = {}
    if parsed then
        local battlelog = parsed.battlelog
        if type(battlelog) == "table" and type(battlelog.events) == "table" then
            events = battlelog.events
        end
        local box = parsed.box
        if type(box) == "table" then
            if box.payload ~= nil and box.payload ~= JSON_NULL then
                state.export.cachedBoxPayloadByAttempt[attempt] = box.payload
            end
            state.export.lastBoxMetaByAttempt[attempt] = {
                updatedAt = (box.updatedAt ~= JSON_NULL) and box.updatedAt or nil,
                partyCount = (box.partyCount ~= JSON_NULL) and box.partyCount or nil,
                boxSlotsDumped = (box.boxSlotsDumped ~= JSON_NULL) and box.boxSlotsDumped or nil,
            }
        end
    elseif err and err ~= "empty_file" then
        log(string.format("[Gen3 M2] WARN failed to parse existing attempt master %s (%s)", tostring(masterPath), tostring(err)))
    end
    local normalizedEvents, dropped = trimIncompleteBattleEvents(events)
    state.export.eventsByAttempt[attempt] = normalizedEvents
    local sessionCount = 0
    for i = 1, #normalizedEvents do
        if type(normalizedEvents[i]) == "table" and normalizedEvents[i].type == "session_start" then
            sessionCount = sessionCount + 1
        end
    end
    state.export.sessionCounterByAttempt[attempt] = sessionCount
    if dropped then
        log("[Gen3 M2] BATTLELOG trimmed trailing incomplete session on load.")
    end
end

local function ensureExportContext()
    local existingKey = state.export.current and state.export.current.trainerKey or NULL_EXPORT.defaultTrainerKey
    local identity = resolveExportIdentity(existingKey)
    local attempt = getOrCreateAttemptForKey(identity.trainerKey)
    local attemptDir = getAttemptDir(attempt)
    ensureDirExistsForPath(attemptDir .. "/.keep")

    state.export.current.trainerId = identity.trainerId
    state.export.current.secretId = identity.secretId
    state.export.current.trainerKey = identity.trainerKey
    state.export.current.attempt = attempt
    state.export.current.attemptDir = attemptDir
    state.export.current.masterPath = getMasterPath(attempt)

    if state.export.eventsByAttempt[attempt] == nil then
        hydrateAttemptStateFromMaster(attempt, state.export.current.masterPath)
    end
    return state.export.current
end

local function getCurrentAttemptEvents()
    local ctx = ensureExportContext()
    local attempt = ctx.attempt
    if state.export.eventsByAttempt[attempt] == nil then
        hydrateAttemptStateFromMaster(attempt, ctx.masterPath)
    end
    return state.export.eventsByAttempt[attempt], ctx
end

local function getCurrentAttemptBattleLogEvents()
    local events = getCurrentAttemptEvents()
    if type(events) ~= "table" then
        return {}
    end
    return events
end

local function readCurrentAttemptMasterRawJson()
    local ctx = ensureExportContext()
    local raw = readFileText(ctx.masterPath)
    if type(raw) ~= "string" then
        return nil
    end
    raw = trim(raw)
    if raw == "" then
        return nil
    end
    local parsed, err = jsonDecode(raw)
    if parsed == nil or err ~= nil or type(parsed) ~= "table" then
        return nil
    end
    return jsonEncode(parsed)
end

local function nextSyntheticSessionTrainerId()
    local ctx = ensureExportContext()
    local attempt = ctx.attempt or 0
    local n = (state.export.sessionCounterByAttempt[attempt] or 0) + 1
    state.export.sessionCounterByAttempt[attempt] = n
    return attempt * 1000000 + n
end

local function cacheCurrentAttemptBoxPayload(ctx)
    local payload = buildPartyBoxPayload(CONFIG.http and CONFIG.http.box_slots_dumped_default)
    if not payload then
        return nil
    end
    state.export.cachedBoxPayloadByAttempt[ctx.attempt] = payload
    state.export.lastBoxMetaByAttempt[ctx.attempt] = {
        updatedAt = os.date("%Y-%m-%dT%H:%M:%S"),
        partyCount = payload.partyCount ~= JSON_NULL and payload.partyCount or nil,
        boxSlotsDumped = payload.boxSlotsDumped ~= JSON_NULL and payload.boxSlotsDumped or nil,
    }
    return payload
end

local function writeCurrentAttemptMaster(refreshBoxPayload)
    local events, ctx = getCurrentAttemptEvents()
    local boxPayload
    if refreshBoxPayload then
        boxPayload = cacheCurrentAttemptBoxPayload(ctx)
    else
        boxPayload = state.export.cachedBoxPayloadByAttempt[ctx.attempt]
    end
    local boxMeta = state.export.lastBoxMetaByAttempt[ctx.attempt] or {}
    if boxPayload ~= nil then
        boxMeta = {
            updatedAt = os.date("%Y-%m-%dT%H:%M:%S"),
            partyCount = boxPayload.partyCount ~= JSON_NULL and boxPayload.partyCount or nil,
            boxSlotsDumped = boxPayload.boxSlotsDumped ~= JSON_NULL and boxPayload.boxSlotsDumped or nil,
        }
        state.export.lastBoxMetaByAttempt[ctx.attempt] = boxMeta
    end

    local out = {
        version = NULL_EXPORT.version,
        attempt = ctx.attempt,
        trainerId = jsonOrNull(ctx.trainerId),
        secretId = jsonOrNull(ctx.secretId),
        trainerKey = ctx.trainerKey or NULL_EXPORT.defaultTrainerKey,
        battlelog = {
            events = events or {},
            eventCount = #(events or {}),
        },
        box = {
            updatedAt = jsonOrNull(boxMeta.updatedAt),
            partyCount = jsonOrNull(boxMeta.partyCount),
            boxSlotsDumped = jsonOrNull(boxMeta.boxSlotsDumped),
            payload = boxPayload or JSON_NULL,
        },
    }

    ensureDirExistsForPath(ctx.masterPath)
    local f = io.open(ctx.masterPath, "w")
    if not f then
        log(string.format("[Gen3 M2] WARN unable to write attempt master file: %s", tostring(ctx.masterPath)))
        return false
    end
    f:write(jsonEncode(out))
    f:write("\n")
    f:close()
    return true
end

local function updateMasterFile(_trainerId, _secretId)
    return writeCurrentAttemptMaster(true)
end

appendBattleLogEvent = function(record)
    if type(record) ~= "table" then
        return
    end
    local events, ctx = getCurrentAttemptEvents()
    if record.type == "session_start" then
        local normalized, dropped = trimIncompleteBattleEvents(events)
        if dropped or normalized ~= events then
            events = normalized
            state.export.eventsByAttempt[ctx.attempt] = events
            if dropped then
                log("[Gen3 M2] BATTLELOG removed incomplete trailing session before appending new session.")
            end
        end
    end
    events[#events + 1] = record
    writeCurrentAttemptMaster(false)
end

emitCondensedRecord = function(record, _trainerIdOverride)
    appendBattleLogEvent(record)
end

local function read8(addr)
    if not addr then
        return nil
    end
    return emu:read8(addr)
end

local function read16(addr)
    if not addr then
        return nil
    end
    return emu:read16(addr)
end

local function read32(addr)
    if not addr then
        return nil
    end
    return emu:read32(addr)
end

local function asSigned32(v)
    if v == nil then
        return nil
    end
    v = v & 0xFFFFFFFF
    if v >= 0x80000000 then
        return v - 0x100000000
    end
    return v
end

local function read16le(addr)
    local b0 = read8(addr)
    local b1 = read8(addr and (addr + 1) or nil)
    if b0 == nil or b1 == nil then
        return nil
    end
    return (b0 | (b1 << 8)) & 0xFFFF
end

local function readMainInBattleBit()
    if not CONFIG.addresses.gMain then
        return nil
    end
    local v = read8(CONFIG.addresses.gMain + CONFIG.struct.main_in_battle_offset)
    if v == nil then
        return nil
    end
    return (v & 0x02) ~= 0
end

local function getPlayerPartyBase()
    if CONFIG.addresses.gPlayerParty then
        return CONFIG.addresses.gPlayerParty
    end
    if CONFIG.addresses.gEnemyParty then
        return CONFIG.addresses.gEnemyParty - (CONFIG.struct.party_size * CONFIG.struct.party_mon_size)
    end
    return nil
end

local function isEwramPtr(ptr)
    return ptr ~= nil and ptr >= 0x02000000 and ptr < 0x02040000
end

local function readBattleStructPtr()
    local ptrAddr = CONFIG.addresses.gBattleStruct
    if not ptrAddr then
        return nil, "gBattleStruct address is not configured"
    end

    local battleStructPtr = read32(ptrAddr)
    if not isEwramPtr(battleStructPtr) then
        return battleStructPtr, "gBattleStruct pointer is nil/unreadable"
    end
    return battleStructPtr, nil
end

local function readAiFinalScore(aiBattler, targetBattler, moveSlotZeroBased, aiFinalScoreOffsetOverride)
    local battleStructPtr, ptrErr = readBattleStructPtr()
    if ptrErr then
        return nil, nil, battleStructPtr, ptrErr
    end

    if aiBattler < 0 or aiBattler >= CONFIG.struct.max_battlers_count then
        return nil, nil, battleStructPtr, "invalid aiBattler"
    end
    if targetBattler < 0 or targetBattler >= CONFIG.struct.max_battlers_count then
        return nil, nil, battleStructPtr, "invalid targetBattler"
    end
    if moveSlotZeroBased < 0 or moveSlotZeroBased >= CONFIG.struct.max_mon_moves then
        return nil, nil, battleStructPtr, "invalid move slot"
    end

    local aiFinalScoreOffset = aiFinalScoreOffsetOverride or CONFIG.struct.battle_struct_ai_final_score_offset
    local index = ((aiBattler * CONFIG.struct.max_battlers_count + targetBattler) * CONFIG.struct.max_mon_moves) + moveSlotZeroBased
    local scoreAddr = battleStructPtr + aiFinalScoreOffset + index * 4
    local raw = read32(scoreAddr)
    if raw == nil then
        return nil, scoreAddr, battleStructPtr, "score unreadable"
    end
    return asSigned32(raw), scoreAddr, battleStructPtr, nil
end

local function readAiMoveOrAction(battler)
    local battleStructPtr, ptrErr = readBattleStructPtr()
    if ptrErr then
        return nil, nil, battleStructPtr, ptrErr
    end
    if battler < 0 or battler >= CONFIG.struct.max_battlers_count then
        return nil, nil, battleStructPtr, "invalid battler"
    end
    local baseOffset = CONFIG.struct.battle_struct_ai_move_or_action_offset
    if baseOffset == nil then
        -- aiFinalScore is [4][4][4] s32 = 0x100 bytes.
        baseOffset = CONFIG.struct.battle_struct_ai_final_score_offset + 0x100
    end
    local addr = battleStructPtr + baseOffset + battler
    local v = read8(addr)
    return v, addr, battleStructPtr, nil
end

local function readAiChosenTarget(battler)
    local battleStructPtr, ptrErr = readBattleStructPtr()
    if ptrErr then
        return nil, nil, battleStructPtr, ptrErr
    end
    if battler < 0 or battler >= CONFIG.struct.max_battlers_count then
        return nil, nil, battleStructPtr, "invalid battler"
    end
    local baseOffset = CONFIG.struct.battle_struct_ai_chosen_target_offset
    if baseOffset == nil then
        -- aiChosenTarget is immediately after aiMoveOrAction (4 bytes).
        baseOffset = CONFIG.struct.battle_struct_ai_final_score_offset + 0x104
    end
    local addr = battleStructPtr + baseOffset + battler
    local v = read8(addr)
    return v, addr, battleStructPtr, nil
end

local function getEnemyPartyCountAddr()
    if CONFIG.addresses.gEnemyPartyCount then
        return CONFIG.addresses.gEnemyPartyCount
    end
    local playerPartyBase = getPlayerPartyBase()
    if playerPartyBase then
        -- EWRAM order in this fork's pokemon.c:
        -- gPlayerPartyCount, gEnemyPartyCount, gPlayerParty[6], gEnemyParty[6]
        return playerPartyBase - 1
    end
    return nil
end

local function getPlayerPartyCountAddr()
    if CONFIG.addresses.gPlayerPartyCount then
        return CONFIG.addresses.gPlayerPartyCount
    end

    local enemyCountAddr = getEnemyPartyCountAddr()
    if enemyCountAddr then
        return enemyCountAddr - 1
    end
    return nil
end

local function decryptSubstructWords(monAddr, personality, otId)
    local key = (personality ~ otId) & 0xFFFFFFFF
    local order = SUBSTRUCT_ORDER[(personality % 24) + 1]
    if not order then
        return nil
    end

    local blocks = {}
    for logicalIndex = 1, 4 do
        local physicalIndex = order[logicalIndex]
        local base = monAddr + CONFIG.struct.box_secure_offset + (physicalIndex * CONFIG.struct.substruct_size)
        local w0 = read32(base + 0)
        local w1 = read32(base + 4)
        local w2 = read32(base + 8)
        if w0 == nil or w1 == nil or w2 == nil then
            return nil
        end
        blocks[logicalIndex] = {
            (w0 ~ key) & 0xFFFFFFFF,
            (w1 ~ key) & 0xFFFFFFFF,
            (w2 ~ key) & 0xFFFFFFFF,
        }
    end
    return blocks
end

local function decodePartyMon(monAddr, slotIndex)
    local personality = read32(monAddr + 0x00)
    local otId = read32(monAddr + 0x04)
    local flags = read8(monAddr + CONFIG.struct.box_flags_offset)
    local level = read8(monAddr + CONFIG.struct.level_offset)
    local curHP = read16le(monAddr + CONFIG.struct.hp_offset)
    local maxHP = read16le(monAddr + CONFIG.struct.maxhp_offset)
    if personality == nil or otId == nil or flags == nil or level == nil then
        return nil
    end

    local hasSpecies = ((flags >> 1) & 0x1) == 1
    if not hasSpecies then
        return nil
    end

    local blocks = decryptSubstructWords(monAddr, personality, otId)
    if not blocks then
        return nil
    end

    local ss0 = blocks[1]
    local ss1 = blocks[2]
    local ss3 = blocks[4]

    local species = ss0[1] & CONFIG.struct.max_species_id
    local heldItem = (ss0[1] >> 16) & CONFIG.struct.max_item_id
    local experience = ss0[2] or 0

    local move1 = ss1[1] & CONFIG.struct.max_move_id
    local move2 = (ss1[1] >> 16) & CONFIG.struct.max_move_id
    local move3 = ss1[2] & CONFIG.struct.max_move_id
    local move4 = (ss1[2] >> 16) & CONFIG.struct.max_move_id
    local misc0 = ss3[1] or 0
    local misc1 = ss3[2] or 0
    local misc2 = ss3[3] or 0
    local abilityNum = (misc2 >> 29) & 0x3
    local altAbility = abilityNum
    local isEgg = ((flags >> 2) & 0x1) == 1
    local natureId = personality % 25
    local metLocation = (misc0 >> 8) & 0xFF
    local metLevel = (misc0 >> 16) & 0x7F
    local hpIV = misc1 & 0x1F
    local attackIV = (misc1 >> 5) & 0x1F
    local defenseIV = (misc1 >> 10) & 0x1F
    local speedIV = (misc1 >> 15) & 0x1F
    local spAttackIV = (misc1 >> 20) & 0x1F
    local spDefenseIV = (misc1 >> 25) & 0x1F

    if species == 0 or species > CONFIG.struct.max_species_id then
        return nil
    end

    return {
        slot = slotIndex,
        species = species,
        level = level,
        heldItem = heldItem,
        moves = { move1, move2, move3, move4 },
        personality = personality,
        otId = otId,
        abilityNum = abilityNum,
        altAbility = altAbility,
        isEgg = isEgg,
        natureId = natureId,
        metLocation = metLocation,
        metLevel = metLevel,
        experience = experience,
        hpIV = hpIV,
        attackIV = attackIV,
        defenseIV = defenseIV,
        spAttackIV = spAttackIV,
        spDefenseIV = spDefenseIV,
        speedIV = speedIV,
        currentHP = curHP,
        maxHP = maxHP,
    }
end

local function decodeBoxMon(boxMonAddr, boxIndex, slotIndex)
    local personality = read32(boxMonAddr + 0x00)
    local otId = read32(boxMonAddr + 0x04)
    local flags = read8(boxMonAddr + CONFIG.struct.box_flags_offset)
    if personality == nil or otId == nil or flags == nil then
        return nil
    end

    local hasSpecies = ((flags >> 1) & 0x1) == 1
    if not hasSpecies then
        return nil
    end

    local blocks = decryptSubstructWords(boxMonAddr, personality, otId)
    if not blocks then
        return nil
    end

    local ss0 = blocks[1]
    local ss1 = blocks[2]
    local ss3 = blocks[4]

    local species = ss0[1] & CONFIG.struct.max_species_id
    local heldItem = (ss0[1] >> 16) & CONFIG.struct.max_item_id
    local experience = ss0[2] or 0
    local move1 = ss1[1] & CONFIG.struct.max_move_id
    local move2 = (ss1[1] >> 16) & CONFIG.struct.max_move_id
    local move3 = ss1[2] & CONFIG.struct.max_move_id
    local move4 = (ss1[2] >> 16) & CONFIG.struct.max_move_id
    local misc0 = ss3[1] or 0
    local misc1 = ss3[2] or 0
    local misc2 = ss3[3] or 0
    local abilityNum = (misc2 >> 29) & 0x3
    local altAbility = abilityNum
    local isEgg = ((flags >> 2) & 0x1) == 1
    local natureId = personality % 25
    local metLocation = (misc0 >> 8) & 0xFF
    local metLevel = (misc0 >> 16) & 0x7F
    local hpIV = misc1 & 0x1F
    local attackIV = (misc1 >> 5) & 0x1F
    local defenseIV = (misc1 >> 10) & 0x1F
    local speedIV = (misc1 >> 15) & 0x1F
    local spAttackIV = (misc1 >> 20) & 0x1F
    local spDefenseIV = (misc1 >> 25) & 0x1F

    if species == 0 or species > CONFIG.struct.max_species_id then
        return nil
    end

    return {
        box = boxIndex,
        slot = slotIndex,
        species = species,
        heldItem = heldItem,
        moves = { move1, move2, move3, move4 },
        personality = personality,
        otId = otId,
        abilityNum = abilityNum,
        altAbility = altAbility,
        isEgg = isEgg,
        natureId = natureId,
        metLocation = metLocation,
        metLevel = metLevel,
        experience = experience,
        hpIV = hpIV,
        attackIV = attackIV,
        defenseIV = defenseIV,
        spAttackIV = spAttackIV,
        spDefenseIV = spDefenseIV,
        speedIV = speedIV,
    }
end

local function countLikelyPartyMons(base)
    if not base then
        return nil
    end
    local count = 0
    for slot = 0, CONFIG.struct.party_size - 1 do
        local monAddr = base + slot * CONFIG.struct.party_mon_size
        if decodePartyMon(monAddr, slot) then
            count = count + 1
        end
    end
    return count
end

local function getEnemyPartyCount()
    local addr = getEnemyPartyCountAddr()
    local c = read8(addr)
    if c ~= nil and c >= 1 and c <= CONFIG.struct.party_size then
        return c
    end
    return countLikelyPartyMons(CONFIG.addresses.gEnemyParty)
end

local function getPlayerPartyCount()
    local addr = getPlayerPartyCountAddr()
    local c = read8(addr)
    if c ~= nil and c >= 1 and c <= CONFIG.struct.party_size then
        return c
    end
    return countLikelyPartyMons(getPlayerPartyBase())
end

local function buildPlayerPartySnapshot()
    local out = {}
    local playerParty = getPlayerPartyBase()
    if not playerParty then
        return out
    end

    local partyCount = getPlayerPartyCount() or CONFIG.struct.party_size
    if partyCount < 1 or partyCount > CONFIG.struct.party_size then
        partyCount = CONFIG.struct.party_size
    end

    for slot = 0, partyCount - 1 do
        local mon = decodePartyMon(playerParty + slot * CONFIG.struct.party_mon_size, slot)
        if mon then
            out[#out + 1] = {
                slot = slot + 1,
                species = mon.species,
                level = mon.level,
                hp = mon.currentHP,
                maxHP = mon.maxHP,
                heldItem = mon.heldItem,
                abilitySlot = mon.abilityNum,
                nature = mon.natureId,
                isEgg = mon.isEgg,
                personality = mon.personality,
                moves = mon.moves,
            }
        end
    end
    return out
end

local function buildEnemyPartySnapshot()
    local out = {}
    if not CONFIG.addresses.gEnemyParty then
        return out
    end

    local enemyCount = getEnemyPartyCount() or CONFIG.struct.party_size
    if enemyCount < 1 or enemyCount > CONFIG.struct.party_size then
        enemyCount = CONFIG.struct.party_size
    end

    for slot = 0, enemyCount - 1 do
        local mon = decodePartyMon(CONFIG.addresses.gEnemyParty + slot * CONFIG.struct.party_mon_size, slot)
        if mon then
            out[slot] = {
                slot = slot,
                species = mon.species,
                hp = mon.currentHP,
                maxHP = mon.maxHP,
                personality = mon.personality,
            }
        end
    end
    return out
end

local function getHighestPartyLevelFromSnapshot(partySnapshot)
    local highest = 0
    if type(partySnapshot) ~= "table" then
        return 0
    end
    for i = 1, #partySnapshot do
        local mon = partySnapshot[i]
        if type(mon) == "table" then
            local level = tonumber(mon.level)
            if level ~= nil then
                level = math.floor(level)
                if level > highest then
                    highest = level
                end
            end
        end
    end
    if highest < 0 then highest = 0 end
    if highest > 127 then highest = 127 end
    return highest
end

local function buildPlayerPartySnapshotCondensed(partySnapshot)
    local out = {}
    local party = partySnapshot
    if type(party) ~= "table" then
        party = buildPlayerPartySnapshot()
    end
    for i = 1, #party do
        local mon = party[i]
        out[#out + 1] = {
            slot = mon.slot,
            species = mon.species,
            moves = mon.moves,
            ability = mon.abilitySlot,
            nature = mon.nature,
            heldItem = mon.heldItem,
        }
    end
    return out
end

local function getEnemyPartyMonPid(slotIndex)
    if not CONFIG.addresses.gEnemyParty then
        return nil
    end
    if slotIndex == nil or slotIndex < 0 or slotIndex >= CONFIG.struct.party_size then
        return nil
    end
    local monAddr = CONFIG.addresses.gEnemyParty + slotIndex * CONFIG.struct.party_mon_size
    local pid = read32(monAddr + 0x00)
    if pid == nil or pid == 0 then
        return nil
    end
    return pid
end

local function getSaveBlock2Base()
    local ptrAddr = CONFIG.addresses.gSaveBlock2Ptr
    if not ptrAddr then
        return nil
    end
    local ptr = read32(ptrAddr)
    if not isEwramPtr(ptr) then
        return nil
    end
    return ptr
end

getPlayerTrainerIds = function()
    local save2 = getSaveBlock2Base()
    if not save2 then
        return nil, nil
    end
    -- struct SaveBlock2:
    -- 0x0A playerTrainerId[4], where low16=trainerId, high16=secretId
    local trainerId = read16le(save2 + 0x0A)
    local secretId = read16le(save2 + 0x0C)
    return trainerId, secretId
end

local function bytesToHex(baseAddr, byteCount)
    if not baseAddr or not byteCount or byteCount <= 0 then
        return ""
    end

    local parts = {}
    for i = 0, byteCount - 1 do
        local b = read8(baseAddr + i)
        if b == nil then
            parts[#parts + 1] = "00"
        else
            parts[#parts + 1] = string.format("%02X", b & 0xFF)
        end
    end
    return table.concat(parts, "")
end

local function getPokemonStorageBase()
    local ptrAddr = CONFIG.addresses.gPokemonStoragePtr
    if not ptrAddr then
        return nil
    end
    local ptr = read32(ptrAddr)
    if not isEwramPtr(ptr) then
        return nil
    end
    return ptr
end

local function buildPlayerPartyAndBoxSpeciesSnapshot()
    local out = {}

    local playerParty = getPlayerPartyBase()
    if playerParty then
        for slot = 0, CONFIG.struct.party_size - 1 do
            local mon = decodePartyMon(playerParty + slot * CONFIG.struct.party_mon_size, slot)
            if mon and mon.species then
                out[#out + 1] = mon.species
            end
        end
    end

    local storageBase = getPokemonStorageBase()
    if not storageBase then
        return out
    end

    local boxesBase = storageBase + CONFIG.struct.pokemon_storage_boxes_offset
    local boxSize = CONFIG.struct.in_box_count * CONFIG.struct.box_mon_size
    for box = 0, CONFIG.struct.total_boxes_count - 1 do
        local boxBase = boxesBase + box * boxSize
        for slot = 0, CONFIG.struct.in_box_count - 1 do
            local boxMonAddr = boxBase + slot * CONFIG.struct.box_mon_size
            local boxMon = decodeBoxMon(boxMonAddr, box, slot)
            if boxMon and boxMon.species then
                out[#out + 1] = boxMon.species
            end
        end
    end

    return out
end

local function buildPartySpeciesSet(base, countHint)
    local set = {}
    if not base then
        return set
    end

    local limit = CONFIG.struct.party_size
    if countHint and countHint >= 1 and countHint <= CONFIG.struct.party_size then
        limit = countHint
    end

    for slot = 0, limit - 1 do
        local mon = decodePartyMon(base + slot * CONFIG.struct.party_mon_size, slot)
        if mon and mon.species then
            set[mon.species] = true
        end
    end
    return set
end

local function readTrainerOpponentIds()
    return read16(CONFIG.addresses.gTrainerBattleOpponent_A), read16(CONFIG.addresses.gTrainerBattleOpponent_B)
end

local function getFlagsAddr()
    if state.runtimeFlagsAddr then
        return state.runtimeFlagsAddr
    end
    return CONFIG.addresses.gBattleTypeFlags
end

local function readFlags()
    local addr = getFlagsAddr()
    local flags = read32(addr)
    return flags, addr
end

local function buildBattleMonSizeCandidates()
    local out = {}
    local seen = {}

    local function add(v)
        if v and v > 0 and not seen[v] then
            seen[v] = true
            out[#out + 1] = v
        end
    end

    add(CONFIG.struct.battle_mon_size)
    for i = 1, #CONFIG.struct.battle_mon_size_candidates do
        add(CONFIG.struct.battle_mon_size_candidates[i])
    end
    return out
end

local function buildLayoutCandidates()
    return CONFIG.layout.candidate_layouts
end

local function getBattlersCountForLayout(flagsAddr, layout)
    local addr = layout.absolute and CONFIG.addresses.gBattlersCount or (flagsAddr + layout.battlers_count_offset)
    local v = read8(addr)
    if v == 2 or v == 4 then
        return v
    end
    return nil
end

local function readBattlerSnapshot(flagsAddr, battler, layout, monSize)
    local monAddr = nil
    local positionAddr = nil
    local partyIdxAddr = nil

    if layout.absolute then
        monAddr = CONFIG.addresses.gBattleMons + battler * monSize
        positionAddr = CONFIG.addresses.gBattlerPositions + battler
        partyIdxAddr = CONFIG.addresses.gBattlerPartyIndexes + battler * 2
    else
        monAddr = flagsAddr + layout.battle_mons_offset + battler * monSize
        positionAddr = flagsAddr + layout.battler_positions_offset + battler
        partyIdxAddr = flagsAddr + layout.battler_party_indexes_offset + battler * 2
    end
    local species = read16le(monAddr + CONFIG.struct.battle_mon_species_offset)
    local battleLevel = read8(monAddr + CONFIG.struct.battle_mon_level_offset)
    local battleHp = read16le(monAddr + CONFIG.struct.battle_mon_hp_offset)
    local battleMaxHP = read16le(monAddr + CONFIG.struct.battle_mon_maxhp_offset)
    local position = read8(positionAddr)
    local partyIndex = read16(partyIdxAddr)

    if species == nil or battleLevel == nil or battleHp == nil or battleMaxHP == nil or position == nil or partyIndex == nil then
        return nil
    end
    if species == 0 or species > CONFIG.struct.max_species_id then
        return nil
    end
    if position > 3 then
        return nil
    end
    if partyIndex > 5 then
        return nil
    end

    local side = position & 0x1
    local partyBase = (side == 1) and CONFIG.addresses.gEnemyParty or getPlayerPartyBase()
    local partyLevel = nil
    local partyHp = nil
    local partyMaxHP = nil
    if partyBase then
        local partyMonAddr = partyBase + partyIndex * CONFIG.struct.party_mon_size
        partyLevel = read8(partyMonAddr + CONFIG.struct.level_offset)
        partyHp = read16le(partyMonAddr + CONFIG.struct.hp_offset)
        partyMaxHP = read16le(partyMonAddr + CONFIG.struct.maxhp_offset)
    end

    local level = partyLevel or battleLevel
    local hp = partyHp or battleHp
    local maxHP = partyMaxHP or battleMaxHP

    if level == nil or hp == nil or maxHP == nil then
        return nil
    end
    if level < 0 or level > 100 then
        return nil
    end
    if maxHP > 3000 then
        return nil
    end
    if hp > maxHP and maxHP > 0 then
        return nil
    end

    local moves = {}
    local pps = {}
    for i = 0, 3 do
        moves[i + 1] = read16le(monAddr + CONFIG.struct.battle_mon_moves_offset + i * 2)
        pps[i + 1] = read8(monAddr + CONFIG.struct.battle_mon_pp_offset + i)
        if moves[i + 1] == nil or pps[i + 1] == nil then
            return nil
        end
    end

    return {
        battler = battler,
        species = species,
        level = level,
        hp = hp,
        maxHP = maxHP,
        moves = moves,
        pp = pps,
        position = position,
        side = side,
        partyIndex = partyIndex,
        monAddr = monAddr,
    }
end

local function readActiveSnapshots(flagsAddr, battlersCount, layout, monSize)
    local out = {}
    for b = 0, battlersCount - 1 do
        local snap = readBattlerSnapshot(flagsAddr, b, layout, monSize)
        if not snap then
            return nil
        end
        out[b] = snap
    end
    return out
end

local function scoreSnapshotSet(snapshots, battlersCount, enemySpeciesSet, playerSpeciesSet)
    if not snapshots then
        return -1
    end

    local score = 0
    local sides = { [0] = false, [1] = false }
    local seenPos = {}
    local oppMatch = 0
    local playerMatch = 0
    local enemyHasSpecies = false

    for b = 0, battlersCount - 1 do
        local s = snapshots[b]
        if not s then
            return -1
        end

        score = score + 4
        if s.species >= 1 and s.species <= CONFIG.struct.max_species_id then score = score + 2 end
        if s.level >= 1 and s.level <= 100 then score = score + 2 end
        if s.maxHP >= 1 and s.maxHP <= 3000 then score = score + 2 end
        if s.hp >= 0 and s.hp <= s.maxHP then score = score + 2 end

        if s.moves[1] and s.moves[1] <= CONFIG.struct.max_move_id then score = score + 1 end
        if s.moves[2] and s.moves[2] <= CONFIG.struct.max_move_id then score = score + 1 end

        sides[s.side] = true
        if seenPos[s.position] then
            score = score - 3
        else
            seenPos[s.position] = true
        end

        if s.side == 1 and enemySpeciesSet and enemySpeciesSet[s.species] then
            oppMatch = oppMatch + 1
        elseif s.side == 0 and playerSpeciesSet and playerSpeciesSet[s.species] then
            playerMatch = playerMatch + 1
        end
    end

    if enemySpeciesSet then
        for _ in pairs(enemySpeciesSet) do
            enemyHasSpecies = true
            break
        end
    end

    if sides[0] and sides[1] then
        score = score + 8
    else
        return -1
    end

    if battlersCount == 2 then
        if not (seenPos[0] and seenPos[1]) then
            return -1
        end
        score = score + 3
    end

    if oppMatch > 0 then
        score = score + 6 + oppMatch
    elseif enemyHasSpecies then
        score = score - 12
    end
    if playerMatch > 0 then
        score = score + 2 + playerMatch
    end

    return score
end

local function selectBestBattleRuntime(flagsAddr)
    local best = nil
    local bestScore = -1
    local monSizes = buildBattleMonSizeCandidates()
    local layouts = buildLayoutCandidates()
    local enemyCount = getEnemyPartyCount()
    local enemySpeciesSet = buildPartySpeciesSet(CONFIG.addresses.gEnemyParty, enemyCount)
    local playerSpeciesSet = buildPartySpeciesSet(getPlayerPartyBase(), nil)

    for i = 1, #layouts do
        local layout = layouts[i]
        local battlersCount = getBattlersCountForLayout(flagsAddr, layout)
        if battlersCount then
            for m = 1, #monSizes do
                local monSize = monSizes[m]
                local snapshots = readActiveSnapshots(flagsAddr, battlersCount, layout, monSize)
                local score = scoreSnapshotSet(snapshots, battlersCount, enemySpeciesSet, playerSpeciesSet)
                if score > bestScore then
                    bestScore = score
                    best = {
                        layout = layout,
                        layoutName = layout.name,
                        battlersCount = battlersCount,
                        monSize = monSize,
                        snapshots = snapshots,
                    }
                end
            end
        end
    end

    if best and best.snapshots and bestScore >= 10 then
        return best
    end
    return nil
end

local function scanForBattleRuntime(expectedFlags)
    local best = nil
    local bestScore = -1
    local monSizes = buildBattleMonSizeCandidates()
    local layouts = buildLayoutCandidates()
    local enemyCount = getEnemyPartyCount()
    local enemySpeciesSet = buildPartySpeciesSet(CONFIG.addresses.gEnemyParty, enemyCount)
    local playerSpeciesSet = buildPartySpeciesSet(getPlayerPartyBase(), nil)
    local scanStart = CONFIG.scan.ewram_start
    local scanEnd = CONFIG.scan.ewram_end

    for addr = scanStart, scanEnd - 4, 4 do
        local flags = read32(addr)
        if flags and (flags & BATTLE_TYPE.TRAINER) ~= 0 then
            for i = 1, #layouts do
                local layout = layouts[i]
                local battlersCount = getBattlersCountForLayout(addr, layout)
                if battlersCount then
                    for m = 1, #monSizes do
                        local monSize = monSizes[m]
                        local snapshots = readActiveSnapshots(addr, battlersCount, layout, monSize)
                        local score = scoreSnapshotSet(snapshots, battlersCount, enemySpeciesSet, playerSpeciesSet)

                        if expectedFlags and (flags & BATTLE_TYPE.TRAINER) == (expectedFlags & BATTLE_TYPE.TRAINER) then
                            score = score + 1
                        end

                        if score > bestScore then
                            bestScore = score
                            best = {
                                flags = flags,
                                flagsAddr = addr,
                                runtime = {
                                    layout = layout,
                                    layoutName = layout.name,
                                    battlersCount = battlersCount,
                                    monSize = monSize,
                                    snapshots = snapshots,
                                },
                            }
                        end
                    end
                end
            end
        end
    end

    if best and best.runtime and bestScore >= 10 then
        return best
    end
    return nil
end

local function buildSessionSignature(flags, trainerA, trainerB, enemyCount, enemyPartyBase)
    local firstPersonality = 0
    if enemyPartyBase then
        firstPersonality = read32(enemyPartyBase) or 0
    end
    return string.format(
        "%08X:%04X:%04X:%02d:%08X",
        (flags or 0) & 0xFFFFFFFF,
        (trainerA or 0xFFFF) & 0xFFFF,
        (trainerB or 0xFFFF) & 0xFFFF,
        (enemyCount or 0) & 0xFF,
        firstPersonality & 0xFFFFFFFF
    )
end

local function resetFrameDedup()
    state.frameDedup = {}
end

local function shouldEmitInFrame(key)
    if state.frameDedup[key] then
        return false
    end
    state.frameDedup[key] = true
    return true
end

local function emitSessionStart(flags, flagsAddr, battlersCount, signature, layoutName, monSize)
    local trainerA = state.trainerA
    local trainerB = state.trainerB
    local function isUsableTrainerId(id)
        local n = tonumber(id)
        if n == nil then
            return false
        end
        n = math.floor(n)
        if n == 0 or n == 0xFFFF then
            return false
        end
        return true
    end

    local eventTrainerId = nil
    if isUsableTrainerId(trainerA) then
        eventTrainerId = math.floor(tonumber(trainerA))
    elseif isUsableTrainerId(trainerB) then
        eventTrainerId = math.floor(tonumber(trainerB))
    else
        eventTrainerId = nextSyntheticSessionTrainerId()
    end
    state.sessionSyntheticTrainerId = eventTrainerId
    local key = "SESSION_START:" .. signature
    if not shouldEmitInFrame(key) then
        return
    end
    local partySnapshot = buildPlayerPartySnapshot()
    local partySnapshotHighestLevel = getHighestPartyLevelFromSnapshot(partySnapshot)

    emitRecord({
        type = "session_start",
        loggerVersion = SCRIPT_VERSION,
        trainerId = trainerA,
        trainerA = trainerA,
        trainerB = trainerB,
        battleTypeFlags = flags,
        flagsAddr = flagsAddr,
        battlers = battlersCount,
        layout = layoutName,
        monSize = monSize,
        actionIndex = state.actionIndex,
        signature = signature,
        pPartyHighestLevel = partySnapshotHighestLevel,
        pParty = partySnapshot,
    })

    emitCondensedRecord({
        type = "session_start",
        trainerId = eventTrainerId,
        enemyTrainerIdA = trainerA,
        enemyTrainerIdB = trainerB,
        pPartyHighestLevel = partySnapshotHighestLevel,
        pParty = buildPlayerPartySnapshotCondensed(partySnapshot),
    })
end

local function emitSessionEnd(signature)
    local key = "SESSION_END:" .. tostring(signature)
    if not shouldEmitInFrame(key) then
        return
    end
    emitRecord({
        type = "session_end",
        ok = true,
        frame = state.frame,
        actionIndex = state.actionIndex,
        signature = signature,
        pBox = buildPlayerPartyAndBoxSpeciesSnapshot(),
    })

    emitCondensedRecord({
        type = "session_end",
    })
    updateMasterFile()
end

local function emitMoveEvent(snap, slot, ppBefore, ppAfter, moveId)
    local moveText = (moveId and tostring(moveId)) or "null"
    local key = string.format("MOVE:%d:%d:%d:%d:%d:%s", state.actionIndex, snap.battler, snap.species, slot, ppBefore, moveText)
    if not shouldEmitInFrame(key) then
        return
    end
    emitRecord({
        type = "move",
        frame = state.frame,
        actionIndex = state.actionIndex,
        battler = snap.battler,
        side = snap.side,
        species = snap.species,
        moveId = moveId,
        moveSlot = slot,
        ppBefore = ppBefore,
        ppAfter = ppAfter,
    })
end

local function emitHpEvent(snap, hpBefore, hpAfter)
    local key = string.format("HP:%d:%d:%d:%d", state.actionIndex, snap.battler, hpBefore, hpAfter)
    if not shouldEmitInFrame(key) then
        return
    end
    emitRecord({
        type = "hp",
        frame = state.frame,
        actionIndex = state.actionIndex,
        battler = snap.battler,
        side = snap.side,
        species = snap.species,
        hpBefore = hpBefore,
        hpAfter = hpAfter,
        maxHP = snap.maxHP,
    })
end

local function emitSessionActiveHp(snap)
    local key = string.format("SESSION_ACTIVE_HP:%d:%d:%d:%d", state.actionIndex, snap.battler, snap.hp, snap.maxHP)
    if not shouldEmitInFrame(key) then
        return
    end
    emitRecord({
        type = "session_active_hp",
        frame = state.frame,
        actionIndex = state.actionIndex,
        battler = snap.battler,
        side = snap.side,
        species = snap.species,
        hp = snap.hp,
        maxHP = snap.maxHP,
    })
end

local function emitRuntimeRawDiag()
    local flagsAddr = getFlagsAddr()
    if not flagsAddr then
        return
    end

    local function diagLayout(name, countOff, idxOff, posOff, monOff, monSize)
        local bc = read8(flagsAddr + countOff)
        local p0 = read8(flagsAddr + posOff + 0)
        local p1 = read8(flagsAddr + posOff + 1)
        local pi0 = read16(flagsAddr + idxOff + 0)
        local pi1 = read16(flagsAddr + idxOff + 2)
        local monBase = flagsAddr + monOff

        local function monBrief(monAddr)
            local species = read16le(monAddr + CONFIG.struct.battle_mon_species_offset)
            local level = read8(monAddr + CONFIG.struct.battle_mon_level_offset)
            local hp = read16le(monAddr + CONFIG.struct.battle_mon_hp_offset)
            local maxHP = read16le(monAddr + CONFIG.struct.battle_mon_maxhp_offset)
            return string.format("sp=%s lv=%s hp=%s max=%s", tostring(species), tostring(level), tostring(hp), tostring(maxHP))
        end

        log(string.format(
            "[Gen3 M2] runtime-raw[%s] battlers=%s pos=[%s,%s] partyIdx=[%s,%s] mon0@%X{%s} mon1@%X{%s}",
            name,
            tostring(bc),
            tostring(p0),
            tostring(p1),
            tostring(pi0),
            tostring(pi1),
            monSize,
            monBrief(monBase + monSize * 0),
            monSize,
            monBrief(monBase + monSize * 1)
        ))
    end

    diagLayout("derived", 0x84, 0x86, 0x8E, 0x9C, 0x5C)
    diagLayout("map_like", 0x84, 0x88, 0x90, 0xA0, 0x5C)
    diagLayout("shifted", 0x88, 0x8A, 0x92, 0xA0, 0x5C)
    if CONFIG.addresses.gBattlersCount and CONFIG.addresses.gBattlerPositions and CONFIG.addresses.gBattlerPartyIndexes and CONFIG.addresses.gBattleMons then
        local bc = read8(CONFIG.addresses.gBattlersCount)
        local p0 = read8(CONFIG.addresses.gBattlerPositions + 0)
        local p1 = read8(CONFIG.addresses.gBattlerPositions + 1)
        local pi0 = read16(CONFIG.addresses.gBattlerPartyIndexes + 0)
        local pi1 = read16(CONFIG.addresses.gBattlerPartyIndexes + 2)
        local function monBriefAbs(monAddr)
            local species = read16le(monAddr + CONFIG.struct.battle_mon_species_offset)
            local level = read8(monAddr + CONFIG.struct.battle_mon_level_offset)
            local hp = read16le(monAddr + CONFIG.struct.battle_mon_hp_offset)
            local maxHP = read16le(monAddr + CONFIG.struct.battle_mon_maxhp_offset)
            return string.format("sp=%s lv=%s hp=%s max=%s", tostring(species), tostring(level), tostring(hp), tostring(maxHP))
        end
        log(string.format(
            "[Gen3 M2] runtime-raw[abs] battlers=%s pos=[%s,%s] partyIdx=[%s,%s] mon0@60{%s} mon1@60{%s}",
            tostring(bc),
            tostring(p0),
            tostring(p1),
            tostring(pi0),
            tostring(pi1),
            monBriefAbs(CONFIG.addresses.gBattleMons + 0x60 * 0),
            monBriefAbs(CONFIG.addresses.gBattleMons + 0x60 * 1)
        ))
    end
end

local function getBestAttributionOpp(snapshots, koBattler, koSide)
    local candidates = {}
    for b, snap in pairs(snapshots) do
        if b ~= koBattler and snap and snap.side ~= koSide and snap.hp and snap.hp > 0 then
            candidates[#candidates + 1] = b
        end
    end

    if #candidates == 0 then
        return nil
    end

    table.sort(candidates)

    if #candidates == 1 then
        return candidates[1]
    end

    local bestBattler = nil
    local bestAction = -1
    for i = 1, #candidates do
        local b = candidates[i]
        local lm = state.lastMoveByBattler[b]
        local ai = lm and lm.actionIndex or -1
        if ai > bestAction then
            bestAction = ai
            bestBattler = b
        elseif ai == bestAction then
            if bestBattler == nil or b < bestBattler then
                bestBattler = b
            end
        end
    end

    return bestBattler or candidates[1]
end

local function makeEnemyKoKey(slotIndex, speciesId)
    return string.format("%s:%d:%d", tostring(state.sessionSignature), tonumber(slotIndex) or -1, tonumber(speciesId) or 0)
end

local function hasRecordedEnemyKo(slotIndex, speciesId)
    return state.recordedEnemyKos[makeEnemyKoKey(slotIndex, speciesId)] == true
end

local function recordEnemyKo(slotIndex, speciesId)
    state.recordedEnemyKos[makeEnemyKoKey(slotIndex, speciesId)] = true
end

local function emitEnemyKoFallbackEvent(snapshots, enemyMon)
    if not enemyMon or enemyMon.species == nil then
        return
    end
    if hasRecordedEnemyKo(enemyMon.slot, enemyMon.species) then
        return
    end

    state.actionIndex = state.actionIndex + 1
    recordEnemyKo(enemyMon.slot, enemyMon.species)

    local nonKoBattler = getBestAttributionOpp(snapshots, nil, 1)
    local nonKoSnap = (nonKoBattler ~= nil) and snapshots[nonKoBattler] or nil

    log(string.format(
        "[Gen3 M2] fallback assigned missed enemy KO: turn=%d enemySlot=%s enemySpecies=%s playerSlot=%s playerSpecies=%s",
        state.actionIndex,
        tostring(enemyMon.slot),
        tostring(enemyMon.species),
        nonKoSnap and tostring(nonKoSnap.partyIndex) or "nil",
        nonKoSnap and tostring(nonKoSnap.species) or "nil"
    ))

    emitRecord({
        type = "ko",
        frame = state.frame,
        actionIndex = state.actionIndex,
        koSide = 1,
        koSpecies = enemyMon.species,
        aiPartySlot = enemyMon.slot,
        nonKoBattler = nonKoSnap and nonKoSnap.battler or nil,
        nonKoSide = nonKoSnap and nonKoSnap.side or nil,
        nonKoSpecies = nonKoSnap and nonKoSnap.species or nil,
        source = "enemy_party_fallback",
    })

    emitCondensedRecord({
        type = "pKo",
        turn = state.actionIndex,
        pSlot = nonKoSnap and nonKoSnap.partyIndex or nil,
        pSpecies = nonKoSnap and nonKoSnap.species or nil,
        aiSpecies = enemyMon.species,
        aiPartySlot = enemyMon.slot,
    })
end

local function emitMissingEnemyPartyKoEvents(snapshots, enemyParty)
    for slot = 0, CONFIG.struct.party_size - 1 do
        local prevMon = state.prevEnemyParty[slot]
        local currMon = enemyParty[slot]
        if prevMon and currMon and prevMon.hp and currMon.hp and prevMon.hp > 0 and currMon.hp == 0 then
            emitEnemyKoFallbackEvent(snapshots, currMon)
        end
    end
end

local function emitKoEvent(snapshots, koSnap, hpBefore, hpAfter)
    local koKey = string.format("%s:%d:%d:%d:%d", tostring(state.sessionSignature), koSnap.battler, state.actionIndex, hpBefore, hpAfter)
    if state.emittedKoKeys[koKey] then
        return
    end
    state.emittedKoKeys[koKey] = true

    local nonKoBattler = getBestAttributionOpp(snapshots, koSnap.battler, koSnap.side)
    local nonKoSide = nil
    local nonKoSpecies = nil
    local lastMoveId = nil
    local lastMoveActionIndex = nil

    if nonKoBattler ~= nil then
        local ns = snapshots[nonKoBattler]
        if ns then
            nonKoSide = ns.side
            nonKoSpecies = ns.species
        end

        local lm = state.lastMoveByBattler[nonKoBattler]
        if lm and lm.moveId and lm.moveId > 0 then
            lastMoveId = lm.moveId
            lastMoveActionIndex = lm.actionIndex
        end
    end

    local key = string.format("KO:%d:%d:%d", state.actionIndex, koSnap.battler, hpBefore)
    if not shouldEmitInFrame(key) then
        return
    end

    emitRecord({
        type = "ko",
        frame = state.frame,
        actionIndex = state.actionIndex,
        koBattler = koSnap.battler,
        koSide = koSnap.side,
        koSpecies = koSnap.species,
        nonKoBattler = nonKoBattler,
        nonKoSide = nonKoSide,
        nonKoSpecies = nonKoSpecies,
        lastMoveId = lastMoveId,
        lastMoveActionIndex = lastMoveActionIndex,
    })

    if koSnap.side == 1 then
        recordEnemyKo(koSnap.partyIndex, koSnap.species)
        local nonKoSnap = (nonKoBattler ~= nil) and snapshots[nonKoBattler] or nil
        emitCondensedRecord({
            type = "pKo",
            turn = state.actionIndex,
            pSlot = nonKoSnap and nonKoSnap.partyIndex or nil,
            pSpecies = nonKoSpecies,
            aiSpecies = koSnap.species,
            aiPartySlot = koSnap.partyIndex,
        })
    else
        emitCondensedRecord({
            type = "aiKo",
            turn = state.actionIndex,
            pSlot = koSnap.partyIndex,
            pSpecies = koSnap.species,
            aiSpecies = nonKoSpecies,
        })
    end
end

local function detectMoveUse(prev, cur)
    local bestSlot = nil
    local bestDrop = -1
    local bestBefore = nil
    local bestAfter = nil

    for i = 1, 4 do
        local ppPrev = prev.pp[i]
        local ppCur = cur.pp[i]
        if ppPrev and ppCur and ppPrev > ppCur then
            local drop = ppPrev - ppCur
            if drop > bestDrop or (drop == bestDrop and (bestSlot == nil or i < bestSlot)) then
                bestDrop = drop
                bestSlot = i
                bestBefore = ppPrev
                bestAfter = ppCur
            end
        end
    end

    if bestSlot == nil then
        return nil
    end

    local moveId = cur.moves[bestSlot]
    if not moveId or moveId <= 0 then
        moveId = nil
    end

    return {
        slot = bestSlot,
        ppBefore = bestBefore,
        ppAfter = bestAfter,
        moveId = moveId,
    }
end

local function resetBattleState(signature)
    state.sessionActive = true
    state.sessionSignature = signature
    state.sessionSyntheticTrainerId = nil
    state.inactiveFrames = 0
    state.actionIndex = 0
    state.lastMoveByBattler = {}
    state.prevEnemyParty = {}
    state.emittedKoKeys = {}
    state.recordedEnemyKos = {}
    state.lastLayoutName = nil
    state.lastBattleMonSize = nil
    state.warnedRuntimeUnresolved = false
    state.didRuntimeScanThisSession = false
    state.trainerA = nil
    state.trainerB = nil
end

local function clearBattleState()
    state.sessionActive = false
    state.sessionSignature = nil
    state.sessionSyntheticTrainerId = nil
    state.inactiveFrames = 0
    state.actionIndex = 0
    state.lastMoveByBattler = {}
    state.prevBattlers = {}
    state.prevEnemyParty = {}
    state.emittedKoKeys = {}
    state.recordedEnemyKos = {}
    state.lastLayoutName = nil
    state.lastBattleMonSize = nil
    state.warnedRuntimeUnresolved = false
    state.didRuntimeScanThisSession = false
end

local function isValidBattleGate(flags, enemyCount)
    if flags == nil then
        return false
    end
    if (flags & BATTLE_TYPE.TRAINER) == 0 then
        return false
    end
    if enemyCount ~= nil and (enemyCount < 1 or enemyCount > CONFIG.struct.party_size) then
        return false
    end
    return true
end

local function pollBattleState()
    state.frame = state.frame + 1
    resetFrameDedup()

    local flags, flagsAddr = readFlags()
    local enemyCount = getEnemyPartyCount()
    local enemyLead = nil
    if CONFIG.addresses.gEnemyParty then
        enemyLead = decodePartyMon(CONFIG.addresses.gEnemyParty, 0)
    end

    local runtime = nil
    local battlersCount = nil
    local snapshots = nil
    local enemyParty = buildEnemyPartySnapshot()
    if flagsAddr then
        runtime = selectBestBattleRuntime(flagsAddr)
        if runtime then
            battlersCount = runtime.battlersCount
            snapshots = runtime.snapshots
        end
    end

    local inBattleBit = readMainInBattleBit()
    local battleBaseOk = isValidBattleGate(flags, enemyCount)
    local activeBattle
    if inBattleBit ~= nil then
        activeBattle = inBattleBit and battleBaseOk
    else
        activeBattle = battleBaseOk
    end

    if activeBattle then
        state.inactiveFrames = 0
        local trainerA, trainerB = readTrainerOpponentIds()
        local signature = buildSessionSignature(flags, trainerA, trainerB, enemyCount, CONFIG.addresses.gEnemyParty)

        if not state.sessionActive or state.sessionSignature ~= signature then
            if not snapshots then
                if CONFIG.enable_runtime_scan and (not state.didRuntimeScanThisSession) then
                    state.didRuntimeScanThisSession = true
                    local scanned = scanForBattleRuntime(flags)
                    if scanned then
                        state.runtimeFlagsAddr = scanned.flagsAddr
                        flagsAddr = scanned.flagsAddr
                        flags = scanned.flags
                        runtime = scanned.runtime
                        battlersCount = runtime.battlersCount
                        snapshots = runtime.snapshots
                        log(string.format(
                            "[Gen3 M2] Auto-relocated runtime base: gBattleTypeFlags=%s layout=%s monSize=0x%X",
                            hex8(flagsAddr),
                            tostring(runtime.layoutName or "n/a"),
                            runtime.monSize or 0
                        ))
                    end
                end
            end

            if not snapshots then
                if not state.warnedRuntimeUnresolved then
                    if CONFIG.log_runtime_unresolved_warnings then
                        log(string.format(
                            "[Gen3 M2] WARN runtime unresolved while trainer battle gate is active (flags=%s enemyCount=%s enemyLead=%s)",
                            hex8(flags),
                            tostring(enemyCount),
                            enemyLead and tostring(enemyLead.species) or "n/a"
                        ))
                        emitRuntimeRawDiag()
                    end
                    state.lastRuntimeWarnFrame = state.frame
                    state.warnedRuntimeUnresolved = true
                end
                return
            end
            resetBattleState(signature)
            state.trainerA = trainerA
            state.trainerB = trainerB
            state.prevBattlers = snapshots
            state.prevEnemyParty = enemyParty
            state.lastLayoutName = runtime and runtime.layoutName or nil
            state.lastBattleMonSize = runtime and runtime.monSize or nil
            emitSessionStart(flags, flagsAddr, battlersCount, signature, state.lastLayoutName, state.lastBattleMonSize)
            for b = 0, battlersCount - 1 do
                local snap = snapshots[b]
                if snap then
                    emitSessionActiveHp(snap)
                end
            end
            return
        end

        -- Keep battle session alive even if snapshot decode temporarily fails.
        if not snapshots then
            return
        end

        state.lastLayoutName = runtime and runtime.layoutName or state.lastLayoutName
        state.lastBattleMonSize = runtime and runtime.monSize or state.lastBattleMonSize

        -- 1) Detect move-use events (primary). May increment action index multiple times per frame.
        for b = 0, battlersCount - 1 do
            local prev = state.prevBattlers[b]
            local cur = snapshots[b]
            if prev and cur then
                local moveEvent = detectMoveUse(prev, cur)
                if moveEvent then
                    state.actionIndex = state.actionIndex + 1
                    emitMoveEvent(cur, moveEvent.slot, moveEvent.ppBefore, moveEvent.ppAfter, moveEvent.moveId)
                    state.lastMoveByBattler[b] = {
                        moveId = moveEvent.moveId,
                        actionIndex = state.actionIndex,
                        species = cur.species,
                        side = cur.side,
                    }
                end
            end
        end

        -- 2) Detect HP deltas and KO transitions.
        for b = 0, battlersCount - 1 do
            local prev = state.prevBattlers[b]
            local cur = snapshots[b]
            if prev and cur and prev.hp ~= nil and cur.hp ~= nil and prev.hp ~= cur.hp then
                emitHpEvent(cur, prev.hp, cur.hp)
                if prev.hp > 0 and cur.hp == 0 then
                    emitKoEvent(snapshots, cur, prev.hp, cur.hp)
                end
            end
        end

        emitMissingEnemyPartyKoEvents(snapshots, enemyParty)

        state.prevBattlers = snapshots
        state.prevEnemyParty = enemyParty
        return
    end

    if state.sessionActive then
        state.inactiveFrames = state.inactiveFrames + 1
        if state.inactiveFrames >= CONFIG.session_reset_frames then
            emitSessionEnd(state.sessionSignature)
            clearBattleState()
        end
    end
end

local function tableLookupName(t, id)
    if type(t) ~= "table" then
        return nil
    end
    local name = t[id]
    if type(name) == "string" and name ~= "" then
        return name
    end
    return nil
end

local function getSpeciesName(speciesId)
    local n = tonumber(speciesId)
    if n == nil or n <= 0 then
        return nil
    end
    local byMons = tableLookupName(rawget(_G, "mons"), n)
    if byMons ~= nil then
        return byMons
    end
    return tostring(n)
end

local function getMoveName(moveId)
    local n = tonumber(moveId)
    if n == nil or n <= 0 then
        return nil
    end
    local byMove = tableLookupName(rawget(_G, "move"), n) or tableLookupName(rawget(_G, "moves"), n)
    if byMove ~= nil then
        return byMove
    end
    return tostring(n)
end

local function getHeldItemName(itemId)
    local n = tonumber(itemId)
    if n == nil or n <= 0 then
        return nil
    end
    local byItem = tableLookupName(rawget(_G, "item"), n) or tableLookupName(rawget(_G, "items"), n)
    if byItem ~= nil then
        return byItem
    end
    return tostring(n)
end

local NATURE_NAMES = {
    "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
    "Bold", "Docile", "Relaxed", "Impish", "Lax",
    "Timid", "Hasty", "Serious", "Jolly", "Naive",
    "Modest", "Mild", "Quiet", "Bashful", "Rash",
    "Calm", "Gentle", "Sassy", "Careful", "Quirky",
}

local function getNatureNameFromId(natureId)
    local n = tonumber(natureId)
    if n == nil then
        return nil
    end
    n = math.floor(n)
    if n >= 0 and n < #NATURE_NAMES then
        return NATURE_NAMES[n + 1]
    end
    return nil
end

local function buildShowdownText()
    local party = buildPlayerPartySnapshot()
    if #party == 0 then
        return ""
    end
    local lines = {}
    for i = 1, #party do
        local mon = party[i]
        local speciesName = getSpeciesName(mon.species) or ("Species " .. tostring(mon.species or 0))
        local heldItemName = getHeldItemName(mon.heldItem)
        if heldItemName then
            lines[#lines + 1] = string.format("%s @ %s", speciesName, heldItemName)
        else
            lines[#lines + 1] = speciesName
        end
        if mon.level then
            lines[#lines + 1] = string.format("Level: %d", mon.level)
        end
        local natureName = getNatureNameFromId(mon.nature or mon.natureId)
        if natureName then
            lines[#lines + 1] = string.format("%s Nature", natureName)
        end
        for m = 1, 4 do
            local moveName = getMoveName(mon.moves and mon.moves[m])
            if moveName then
                lines[#lines + 1] = "- " .. moveName
            end
        end
        if i < #party then
            lines[#lines + 1] = ""
        end
    end
    return table.concat(lines, "\n")
end

local function buildPackedBoxBytes()
    local monsToPack = {}
    local trainerId = 0
    local secretId = 0
    local partyHighestLevel = 1

    local function normalizeNatureId(mon)
        local n = tonumber(mon and mon.natureId)
        if n == nil then
            n = tonumber(mon and mon.nature)
        end
        if n == nil and mon and mon.personality then
            n = (tonumber(mon.personality) or 0) % 25
        end
        n = math.floor(tonumber(n) or 0)
        if n < 0 then n = 0 end
        if n > 31 then n = 31 end
        return n
    end

    local function normalizeAbilitySlot(mon)
        local n = tonumber(mon and mon.abilitySlot)
        if n == nil then n = tonumber(mon and mon.altAbility) end
        if n == nil then n = tonumber(mon and mon.abilityNum) end
        if n == nil then n = tonumber(mon and mon.ability) end
        n = math.floor(tonumber(n) or 0)
        if n < 0 then n = 0 end
        if n > 3 then n = 3 end
        return n
    end

    local function normalizeLevel(mon, isParty)
        local level = nil
        if isParty then
            level = tonumber(mon and mon.level)
        else
            level = tonumber(partyHighestLevel)
        end
        level = math.floor(level or 1)
        if level < 1 then level = 1 end
        if level > 127 then level = 127 end
        return level
    end

    local function appendMon(mon, isParty)
        if not mon or not mon.species or mon.species <= 0 then
            return
        end
        if isParty then
            local candidateLevel = tonumber(mon and mon.level)
            if candidateLevel ~= nil then
                candidateLevel = math.floor(candidateLevel)
                if candidateLevel > partyHighestLevel then
                    partyHighestLevel = candidateLevel
                end
            end
        end
        if isParty and (trainerId == 0 and secretId == 0) and mon.otId and mon.otId ~= 0 then
            trainerId = mon.otId & 0xFFFF
            secretId = (mon.otId >> 16) & 0xFFFF
        end
        monsToPack[#monsToPack + 1] = {
            species = (tonumber(mon.species) or 0) & 0x7FF,
            level = normalizeLevel(mon, isParty) & 0x7F,
            hpIV = (tonumber(mon.hpIV) or 0) & 0x1F,
            atkIV = (tonumber(mon.attackIV) or 0) & 0x1F,
            defIV = (tonumber(mon.defenseIV) or 0) & 0x1F,
            spaIV = (tonumber(mon.spAttackIV) or 0) & 0x1F,
            spdIV = (tonumber(mon.spDefenseIV) or 0) & 0x1F,
            speIV = (tonumber(mon.speedIV) or 0) & 0x1F,
            move1 = (tonumber(mon.moves and mon.moves[1]) or 0) & 0x3FF,
            move2 = (tonumber(mon.moves and mon.moves[2]) or 0) & 0x3FF,
            move3 = (tonumber(mon.moves and mon.moves[3]) or 0) & 0x3FF,
            move4 = (tonumber(mon.moves and mon.moves[4]) or 0) & 0x3FF,
            nature = normalizeNatureId(mon) & 0x1F,
            item = (tonumber(mon.heldItem) or 0) & 0x3FF,
            abilitySlot = normalizeAbilitySlot(mon) & 0x3,
            metLocation = (tonumber(mon.metLocation) or 0) & 0xFF,
        }
    end

    local partyBase = getPlayerPartyBase()
    local partyCount = getPlayerPartyCount() or CONFIG.struct.party_size
    if partyCount < 0 then partyCount = 0 end
    if partyCount > CONFIG.struct.party_size then partyCount = CONFIG.struct.party_size end
    if partyBase then
        for slot = 0, partyCount - 1 do
            appendMon(decodePartyMon(partyBase + slot * CONFIG.struct.party_mon_size, slot), true)
        end
    end
    if trainerId == 0 and secretId == 0 then
        local tid, sid = getPlayerTrainerIds()
        trainerId = tonumber(tid) or 0
        secretId = tonumber(sid) or 0
    end

    local storageBase = getPokemonStorageBase()
    if storageBase then
        local boxBase = storageBase + CONFIG.struct.pokemon_storage_boxes_offset
        for slot = 0, 119 do
            local boxMonAddr = boxBase + slot * CONFIG.struct.box_mon_size
            if (read32(boxMonAddr) or 0) ~= 0 then
                appendMon(decodeBoxMon(boxMonAddr, math.floor(slot / CONFIG.struct.in_box_count), slot % CONFIG.struct.in_box_count), false)
            end
        end
    end

    local totalBits = #monsToPack * 113
    local totalBytes = math.floor((totalBits + 7) / 8)
    local bytes = {}
    for i = 1, totalBytes do
        bytes[i] = 0
    end
    local bitPos = 0
    local function writeBits(value, width)
        local v = tonumber(value) or 0
        for b = 0, width - 1 do
            local byteIndex = math.floor(bitPos / 8) + 1
            local bitIndex = bitPos % 8
            if ((v >> b) & 1) ~= 0 then
                bytes[byteIndex] = bytes[byteIndex] | (1 << bitIndex)
            end
            bitPos = bitPos + 1
        end
    end

    for i = 1, #monsToPack do
        local mon = monsToPack[i]
        writeBits(mon.species, 11)
        writeBits(mon.level, 7)
        writeBits(mon.hpIV, 5)
        writeBits(mon.atkIV, 5)
        writeBits(mon.defIV, 5)
        writeBits(mon.spaIV, 5)
        writeBits(mon.spdIV, 5)
        writeBits(mon.speIV, 5)
        writeBits(mon.move1, 10)
        writeBits(mon.move2, 10)
        writeBits(mon.move3, 10)
        writeBits(mon.move4, 10)
        writeBits(mon.nature, 5)
        writeBits(mon.item, 10)
        writeBits(mon.abilitySlot, 2)
        writeBits(mon.metLocation, 8)
    end

    local out = {
        "NBX1",
        string.char(
            trainerId & 0xFF,
            (trainerId >> 8) & 0xFF,
            secretId & 0xFF,
            (secretId >> 8) & 0xFF
        ),
    }
    for i = 1, totalBytes do
        out[#out + 1] = string.char(bytes[i])
    end
    return table.concat(out)
end

local function buildPackedBattleLogResponseBody()
    local events = getCurrentAttemptBattleLogEvents()
    local m1, m2, m3, m4 = string.byte("NBL1", 1, 4)
    local bytes = { m1 or 78, m2 or 66, m3 or 76, m4 or 49, 2 }
    local bitPos = #bytes * 8

    local function toInt(raw, fallback)
        local n = tonumber(raw)
        if n == nil then
            return fallback
        end
        return math.floor(n)
    end

    local function writeBits(value, width)
        local v = toInt(value, 0) or 0
        if v < 0 then
            v = 0
        end
        for b = 0, width - 1 do
            local byteIndex = math.floor(bitPos / 8) + 1
            local bitIndex = bitPos % 8
            local cur = bytes[byteIndex] or 0
            if ((v >> b) & 1) ~= 0 then
                cur = cur | (1 << bitIndex)
            end
            bytes[byteIndex] = cur
            bitPos = bitPos + 1
        end
    end

    local function resolveTrainerId(raw)
        local n = toInt(raw, nil)
        if n == nil or raw == JSON_NULL then
            return 0xFFFF
        end
        if n < 0 then n = 0 end
        if n >= 0xFFFF then n = 0xFFFE end
        return n
    end

    local function resolveNatureId(mon)
        if type(mon) ~= "table" then
            return 0
        end
        local n = toInt(mon.natureId, nil)
        if n == nil then
            n = toInt(mon.nature, nil)
        end
        if n ~= nil and n >= 0 and n <= 31 then
            return n
        end
        if type(mon.nature) == "string" then
            for i = 1, #NATURE_NAMES do
                if NATURE_NAMES[i] == mon.nature then
                    return i - 1
                end
            end
        end
        return 0
    end

    local function resolveAbilitySlot(mon)
        if type(mon) ~= "table" then
            return 0
        end
        local n = toInt(mon.abilitySlot, nil)
        if n == nil then n = toInt(mon.altAbility, nil) end
        if n == nil then n = toInt(mon.abilityNum, nil) end
        if n == nil then n = toInt(mon.ability, nil) end
        if n ~= nil and n >= 0 and n <= 3 then
            return n
        end
        return 0
    end

    local function resolvePartySlot(ev, currentPartySpecies)
        local slot = toInt(ev and ev.pSlot, nil)
        if slot ~= nil and slot >= 0 and slot <= 5 then
            return slot
        end
        local species = toInt(ev and ev.pSpecies, nil)
        if species ~= nil and species > 0 and type(currentPartySpecies) == "table" then
            for i = 1, #currentPartySpecies do
                if currentPartySpecies[i] == species then
                    return i - 1
                end
            end
        end
        return 7
    end

    local function resolvePartyHighestLevel(ev, party)
        local direct = toInt(ev and ev.pPartyHighestLevel, nil)
        if direct ~= nil then
            if direct < 0 then direct = 0 end
            if direct > 127 then direct = 127 end
            return direct
        end
        local highest = 0
        if type(party) == "table" then
            for i = 1, #party do
                local mon = party[i]
                if type(mon) == "table" then
                    local level = toInt(mon.level, nil)
                    if level ~= nil and level > highest then
                        highest = level
                    end
                end
            end
        end
        if highest < 0 then highest = 0 end
        if highest > 127 then highest = 127 end
        return highest
    end

    local currentPartySpecies = {}
    for i = 1, #events do
        local ev = events[i]
        local evType = type(ev) == "table" and ev.type or nil
        if evType == "session_start" then
            local party = type(ev.pParty) == "table" and ev.pParty or {}
            local packedParty = {}
            local partySpecies = {}
            for p = 1, #party do
                local mon = party[p]
                if type(mon) == "table" then
                    local species = toInt(mon.species, 0) or 0
                    if species > 0 then
                        packedParty[#packedParty + 1] = {
                            species = species & 0x7FF,
                            heldItem = (toInt(mon.heldItem, 0) or 0) & 0x3FF,
                            natureId = resolveNatureId(mon) & 0x1F,
                            abilitySlot = resolveAbilitySlot(mon) & 0x3,
                            move1 = (toInt(mon.moves and mon.moves[1], 0) or 0) & 0x3FF,
                            move2 = (toInt(mon.moves and mon.moves[2], 0) or 0) & 0x3FF,
                            move3 = (toInt(mon.moves and mon.moves[3], 0) or 0) & 0x3FF,
                            move4 = (toInt(mon.moves and mon.moves[4], 0) or 0) & 0x3FF,
                        }
                        partySpecies[#partySpecies + 1] = species
                        if #packedParty >= 6 then
                            break
                        end
                    end
                end
            end
            writeBits(0, 2)
            writeBits(resolveTrainerId(ev.enemyTrainerIdA), 16)
            writeBits(resolveTrainerId(ev.enemyTrainerIdB), 16)
            writeBits(#packedParty, 3)
            writeBits(resolvePartyHighestLevel(ev, party), 7)
            for p = 1, #packedParty do
                local mon = packedParty[p]
                writeBits(mon.species, 11)
                writeBits(mon.heldItem, 10)
                writeBits(mon.natureId, 5)
                writeBits(mon.abilitySlot, 2)
                writeBits(mon.move1, 10)
                writeBits(mon.move2, 10)
                writeBits(mon.move3, 10)
                writeBits(mon.move4, 10)
            end
            currentPartySpecies = partySpecies
        elseif evType == "session_end" then
            writeBits(1, 2)
        elseif evType == "pKo" then
            local turn = toInt(ev.turn, 0) or 0
            local aiSpecies = toInt(ev.aiSpecies, 0) or 0
            writeBits(2, 2)
            writeBits(turn & 0xFFFF, 16)
            writeBits(resolvePartySlot(ev, currentPartySpecies), 3)
            writeBits(aiSpecies & 0x7FF, 11)
        elseif evType == "aiKo" then
            local turn = toInt(ev.turn, 0) or 0
            writeBits(3, 2)
            writeBits(turn & 0xFFFF, 16)
            writeBits(resolvePartySlot(ev, currentPartySpecies), 3)
        end
    end

    local out = {}
    for i = 1, #bytes do
        out[i] = string.char(bytes[i] or 0)
    end
    return table.concat(out), nil
end

local function buildUpdateJsonResponseBody()
    local showdownText = buildShowdownText()
    writeCurrentAttemptMaster(true)
    local battleLogsRaw = readCurrentAttemptMasterRawJson() or "null"
    return string.format("{\"box\":%s,\"battleLogs\":%s}", jsonEncode(showdownText or ""), battleLogsRaw)
end

local function readPlayerPartyMonByPartyIndex(partyIndex)
    if partyIndex == nil or partyIndex < 0 or partyIndex >= CONFIG.struct.party_size then
        return nil, nil
    end
    local base = getPlayerPartyBase()
    if not base then
        return nil, nil
    end
    local addr = base + partyIndex * CONFIG.struct.party_mon_size
    local mon = decodePartyMon(addr, partyIndex)
    return mon, addr
end

local BATTLE_STATE_STAT_NAMES = {
    "hp",
    "atk",
    "def",
    "speed",
    "spAtk",
    "spDef",
    "accuracy",
    "evasion",
}

local function buildBattleStateStatStages()
    local out = {}
    for i = 1, #BATTLE_STATE_STAT_NAMES do
        out[BATTLE_STATE_STAT_NAMES[i]] = JSON_NULL
    end
    return out
end

local function buildBattleStateBattlerObject(snap, _prevSnap)
    local battler = tonumber(snap and snap.battler) or 0
    local partyIndex = tonumber(snap and snap.partyIndex)
    local sideText = ((snap and snap.side) == 1) and "enemy" or "player"
    local moves = {}
    local movePPs = {}
    for i = 1, 4 do
        local moveId = snap and snap.moves and snap.moves[i] or nil
        if moveId ~= nil and moveId > 0 then
            moves[i] = getMoveName(moveId) or tostring(moveId)
        else
            moves[i] = JSON_NULL
        end
        movePPs[i] = jsonOrNull(tonumber(snap and snap.pp and snap.pp[i]))
    end

    local out = {
        battler = battler,
        side = sideText,
        activePartySlot = (partyIndex ~= nil and partyIndex >= 0) and (partyIndex + 1) or JSON_NULL,
        battleMonAddr = jsonOrNull(snap and snap.monAddr),
        partyMonAddr = JSON_NULL,
        pid = JSON_NULL,
        species = jsonOrNull(getSpeciesName(snap and snap.species)),
        currentHp = jsonOrNull(tonumber(snap and snap.hp)),
        moves = moves,
        ability = JSON_NULL,
        nature = JSON_NULL,
        heldItem = JSON_NULL,
        status = JSON_NULL,
        statusRaw = JSON_NULL,
        movePPs = movePPs,
        statStages = buildBattleStateStatStages(),
        statStageChanges = {},
        rawBattleStats = {
            attack = JSON_NULL,
            defense = JSON_NULL,
            speed = JSON_NULL,
            spAttack = JSON_NULL,
            spDefense = JSON_NULL,
        },
    }

    if sideText ~= "player" then
        return out
    end

    local partyMon, partyMonAddr = readPlayerPartyMonByPartyIndex(partyIndex)
    if not partyMon then
        return out
    end
    out.partyMonAddr = jsonOrNull(partyMonAddr)
    out.pid = jsonOrNull(partyMon.personality)
    out.heldItem = jsonOrNull(getHeldItemName(partyMon.heldItem))
    out.nature = jsonOrNull(getNatureNameFromId(partyMon.natureId))
    return out
end

local function buildBattleStatePayload()
    local trainerId, secretId = getPlayerTrainerIds()
    local payload = {
        trainerId = jsonOrNull(trainerId),
        secretId = jsonOrNull(secretId),
        playerActive = {},
        trainerActive = {},
    }

    local baselineSnapshots = type(state.prevBattlers) == "table" and state.prevBattlers or nil
    local flagsAddr = getFlagsAddr()
    local runtime = flagsAddr and selectBestBattleRuntime(flagsAddr) or nil
    if runtime == nil and state.sessionActive and baselineSnapshots ~= nil then
        local trackedCount = 0
        for b = 0, 3 do
            if type(baselineSnapshots[b]) == "table" then
                trackedCount = trackedCount + 1
            end
        end
        if trackedCount > 0 then
            runtime = { battlersCount = 4, snapshots = baselineSnapshots }
        end
    end
    if not runtime or type(runtime.snapshots) ~= "table" then
        return payload
    end

    for b = 0, runtime.battlersCount - 1 do
        local snap = runtime.snapshots[b]
        local species = tonumber(snap and snap.species) or 0
        if species > 0 then
            local prevSnap = baselineSnapshots and baselineSnapshots[b] or nil
            local battlerPayload = buildBattleStateBattlerObject(snap, prevSnap)
            if snap.side == 1 then
                payload.trainerActive[#payload.trainerActive + 1] = battlerPayload
            else
                payload.playerActive[#payload.playerActive + 1] = battlerPayload
            end
        end
    end
    return payload
end

local HTTP_STATUS_TEXT = {
    [200] = "OK",
    [400] = "Bad Request",
    [404] = "Not Found",
    [405] = "Method Not Allowed",
    [500] = "Internal Server Error",
}

local function closeHttpSocketQuiet(sock)
    if not sock then
        return
    end
    pcall(function()
        sock:close()
    end)
end

local function removeCallbackQuiet(cbid)
    if not cbid then
        return
    end
    pcall(function()
        callbacks:remove(cbid)
    end)
end

local function parseHttpRequestHead(data)
    if not data then
        return nil
    end
    local head = data:match("^(.-)\r\n\r\n")
    if not head then
        return nil
    end
    local requestLine = head:match("([^\r\n]+)")
    if not requestLine then
        return nil
    end
    local method, path, version = requestLine:match("^(%S+)%s+(%S+)%s+(%S+)$")
    if not method then
        return nil
    end
    return {
        method = method,
        path = path,
        version = version,
    }
end

local function sendHttpResponse(sock, statusCode, body, contentType)
    if not sock then
        return
    end
    local statusText = HTTP_STATUS_TEXT[statusCode] or "OK"
    body = body or ""
    contentType = contentType or "text/plain; charset=utf-8"
    local response = string.format(
        "HTTP/1.1 %d %s\r\n" ..
        "Access-Control-Allow-Origin: *\r\n" ..
        "Access-Control-Allow-Methods: GET, OPTIONS\r\n" ..
        "Access-Control-Allow-Headers: Content-Type\r\n" ..
        "Content-Length: %d\r\n" ..
        "Content-Type: %s\r\n" ..
        "Connection: close\r\n" ..
        "\r\n%s",
        statusCode,
        statusText,
        #body,
        contentType,
        body
    )
    pcall(function()
        sock:send(response)
    end)
    closeHttpSocketQuiet(sock)
end

local function handleHttpRequest(method, path)
    local httpCfg = CONFIG.http or {}
    local normalizedPath = (path and path:match("^[^?]+")) or path
    local boxPath = httpCfg.box_path or "/box"
    local updatePath = httpCfg.update_path or "/box"
    local updateAliasPath = httpCfg.update_alias_path or "/update"
    local battleLogPath = httpCfg.battle_log_path or "/battle_log"
    if method ~= "GET" then
        return 405, "Method Not Allowed", "text/plain; charset=utf-8"
    end

    if normalizedPath == (httpCfg.ping_path or "/ping") then
        return 200, "Pong", "text/plain; charset=utf-8"
    end

    if normalizedPath == boxPath or normalizedPath == updatePath or normalizedPath == updateAliasPath or normalizedPath == "/update" then
        state.httpUpdateRequests = (state.httpUpdateRequests or 0) + 1
        local ok, bodyOrErr = pcall(buildPackedBoxBytes)
        if not ok then
            return 500, tostring(bodyOrErr), "text/plain; charset=utf-8"
        end
        return 200, bodyOrErr or "", "application/octet-stream"
    end

    if normalizedPath == battleLogPath then
        state.httpBattleLogRequests = (state.httpBattleLogRequests or 0) + 1
        local ok, bodyOrErr, maybeErr = pcall(buildPackedBattleLogResponseBody)
        if not ok then
            return 500, tostring(bodyOrErr), "text/plain; charset=utf-8"
        end
        if bodyOrErr == nil then
            return 500, tostring(maybeErr), "text/plain; charset=utf-8"
        end
        return 200, bodyOrErr, "application/octet-stream"
    end

    if normalizedPath == (httpCfg.update_legacy_path or "/update_legacy") then
        state.httpUpdateLegacyRequests = (state.httpUpdateLegacyRequests or 0) + 1
        local payloadJson, err = buildLegacyPartyBoxPayloadJson(httpCfg.box_slots_dumped_default)
        if not payloadJson then
            local errBody = jsonEncode({
                ok = false,
                error = tostring(err or "failed to build party/box payload"),
            })
            return 500, errBody, "application/json; charset=utf-8"
        end
        return 200, payloadJson, "application/json; charset=utf-8"
    end

    if normalizedPath == (httpCfg.battle_state_path or "/battle_state") then
        state.httpBattleStateRequests = (state.httpBattleStateRequests or 0) + 1
        local ok, payloadOrErr = pcall(buildBattleStatePayload)
        if not ok then
            return 500, tostring(payloadOrErr), "text/plain; charset=utf-8"
        end
        local okJson, encodedOrErr = pcall(jsonEncode, payloadOrErr or {})
        if not okJson then
            return 500, tostring(encodedOrErr), "text/plain; charset=utf-8"
        end
        return 200, encodedOrErr or "{}", "application/json; charset=utf-8"
    end

    return 404, "Not Found", "text/plain; charset=utf-8"
end

local function handleHttpClientReceive(sock)
    local data = ""
    local socketModule = state.httpSocketModule or rawget(_G, "socket")
    while true do
        local chunk, err = sock:receive(1024)
        if chunk then
            data = data .. chunk
        else
            local again = socketModule and socketModule.ERRORS and socketModule.ERRORS.AGAIN
            if err ~= again then
                closeHttpSocketQuiet(sock)
                return
            end

            local req = parseHttpRequestHead(data)
            if not req then
                sendHttpResponse(sock, 400, "Bad Request", "text/plain; charset=utf-8")
                return
            end
            local statusCode, body, contentType = handleHttpRequest(req.method, req.path)
            sendHttpResponse(sock, statusCode, body, contentType)
            return
        end
    end
end

local function acceptHttpConnection()
    local server = state.httpServer
    if not server then
        return
    end
    local sock, _err = server:accept()
    if not sock then
        return
    end
    sock:add("received", function()
        handleHttpClientReceive(sock)
    end)
    sock:add("error", function()
        closeHttpSocketQuiet(sock)
    end)
end

local function setupHttpServer()
    local httpCfg = CONFIG.http or {}
    if not httpCfg.enabled then
        return
    end
    if state.httpStarted and state.httpServer then
        return
    end

    local socketModule = rawget(_G, "socket")
    if socketModule == nil then
        local ok, required = pcall(require, "socket")
        if ok and required then
            socketModule = required
        end
    end
    if not socketModule or not socketModule.bind then
        log("[Gen3 M2] WARN socket module unavailable; HTTP API disabled.")
        return
    end

    local server, bindErr = socketModule.bind(httpCfg.host, httpCfg.port or 31124)
    if bindErr or not server then
        log(string.format("[Gen3 M2] WARN HTTP bind failed on port %s: %s", tostring(httpCfg.port or 31124), tostring(bindErr)))
        return
    end

    local _ok, listenErr = server:listen()
    if listenErr then
        closeHttpSocketQuiet(server)
        log(string.format("[Gen3 M2] WARN HTTP listen failed: %s", tostring(listenErr)))
        return
    end

    state.httpSocketModule = socketModule
    state.httpServer = server
    state.httpStarted = true
    server:add("received", acceptHttpConnection)
    log(string.format("[Gen3 M2] HTTP API listening on http://localhost:%d%s", httpCfg.port or 31124, httpCfg.update_path or "/update"))
end

local function stopHttpServer()
    if state.httpServer then
        closeHttpSocketQuiet(state.httpServer)
    end
    state.httpServer = nil
    state.httpSocketModule = nil
    state.httpStarted = false
end

local function renderHowToUseBuffer(ctx)
    if not console or not console.createBuffer then
        return
    end

    if not howToUseBuffer then
        howToUseBuffer = console:createBuffer("How to Use This Script")
        if howToUseBuffer and howToUseBuffer.setSize then
            howToUseBuffer:setSize(220, 320)
        end
    end
    if not howToUseBuffer then
        return
    end

    local attempt = (ctx and ctx.attempt) or "n/a"
    local attemptDir = (ctx and ctx.attemptDir) or "n/a"

    howToUseBuffer:clear()
    howToUseBuffer:print("How to Use This Script\n\n")
    howToUseBuffer:print("Showdown Calc:\n")
    howToUseBuffer:print("- https://hzla.github.io/Dynamic-Calc-Decomps/?data=imp13&dmgGen=8&gen=8&types=6&evs=0\n")
    howToUseBuffer:print("  Click Sync under the Import Team box to automatically import your Party/Box\n\n")
    howToUseBuffer:print("Output files location:\n")
    howToUseBuffer:print(string.format("- Script/output directory: %s\n", tostring(NULL_EXPORT.baseDir)))
    howToUseBuffer:print(string.format("- Current attempt #%s directory: %s\n\n", tostring(attempt), tostring(attemptDir)))
    howToUseBuffer:print("Battle logging:\n")
    howToUseBuffer:print("- Battles are automatically detected while you play\n")
    howToUseBuffer:print("- KOs are automatically recorded into the battle logs\n")
    howToUseBuffer:print("- Battle Logs/Fragsheet can be viewed by clicking the 'View Fragsheet' button in the calc\n\n")
    howToUseBuffer:print("Troubleshooting:\n")
    howToUseBuffer:print("- Contact Hzla on discord if you encounter any bugs or other issues while using this script\n")
end

local function forceCloseHttpState(httpState)
    if type(httpState) ~= "table" then
        return
    end
    if httpState.httpServer then
        closeHttpSocketQuiet(httpState.httpServer)
    end
    httpState.httpServer = nil
    httpState.httpSocketModule = nil
    httpState.httpStarted = false
    httpState.scriptStarted = false
end

local function teardownThisScriptInstance(_reason)
    local g = rawget(_G, EMERALD_SINGLETON_KEY)
    if type(g) == "table" and g.callbackOwnerToken == THIS_SCRIPT_TOKEN then
        removeCallbackQuiet(g.startCallbackId)
        removeCallbackQuiet(g.frameCallbackId)
        g.startCallbackId = nil
        g.frameCallbackId = nil
        g.callbackOwnerToken = nil
    end

    forceCloseHttpState(state)

    if type(g) == "table" then
        if g.httpState == state then
            g.httpState = nil
        end
        if g.teardown == teardownThisScriptInstance then
            g.teardown = nil
        end
    end
end

local function teardownPreviousSingletonInstance()
    local g = rawget(_G, EMERALD_SINGLETON_KEY)
    if type(g) ~= "table" then
        return
    end

    if type(g.teardown) == "function" then
        pcall(g.teardown, "script_reload")
    end

    -- Fallback cleanup in case a prior version did not expose teardown.
    removeCallbackQuiet(g.startCallbackId)
    removeCallbackQuiet(g.frameCallbackId)
    g.startCallbackId = nil
    g.frameCallbackId = nil
    g.callbackOwnerToken = nil

    forceCloseHttpState(g.httpState)
    g.httpState = nil
    g.teardown = nil
end

local function onStart()
    if state.scriptStarted then
        return
    end
    state.scriptStarted = true
    log("Lua Script Loaded")
    ensureOutputDirExists()
    local ctx = ensureExportContext()
    renderHowToUseBuffer(ctx)
    setupHttpServer()
    if CONFIG.output and CONFIG.output.mirror_console_startup then
        log(string.format("[Gen3 M2] Turn battle logger loaded (%s).", SCRIPT_VERSION))
        log(string.format(
            "[Gen3 M2] output condensed=%s fullEnabled=%s fullPath=%s",
            tostring(getDefaultCondensedBattleLogPath(0)),
            tostring(CONFIG.output and CONFIG.output.write_full_log),
            tostring(CONFIG.output and CONFIG.output.path)
        ))
        log(string.format(
            "[Gen3 M2] gMain=%s gBattleTypeFlags=%s gEnemyParty=%s gEnemyPartyCount=%s gPokemonStoragePtr=%s gSaveBlock2Ptr=%s",
            hex8(CONFIG.addresses.gMain),
            hex8(CONFIG.addresses.gBattleTypeFlags),
            hex8(CONFIG.addresses.gEnemyParty),
            hex8(getEnemyPartyCountAddr()),
            hex8(CONFIG.addresses.gPokemonStoragePtr),
            hex8(CONFIG.addresses.gSaveBlock2Ptr)
        ))
        log(string.format(
            "[Gen3 M2] map symbols: gBattlersCount=%s gBattlerPartyIndexes=%s gBattlerPositions=%s gBattleMons=%s",
            hex8(CONFIG.addresses.gBattlersCount),
            hex8(CONFIG.addresses.gBattlerPartyIndexes),
            hex8(CONFIG.addresses.gBattlerPositions),
            hex8(CONFIG.addresses.gBattleMons)
        ))
    end
end

function milestone2_debug_runtime()
    if not (CONFIG.addresses.gBattlersCount and CONFIG.addresses.gBattlerPositions and CONFIG.addresses.gBattlerPartyIndexes and CONFIG.addresses.gBattleMons) then
        log("[Gen3 M2] debug-runtime: absolute runtime addresses are not configured.")
        return
    end

    local flags = read32(CONFIG.addresses.gBattleTypeFlags)
    local battlersCount = read8(CONFIG.addresses.gBattlersCount)
    log(string.format(
        "[Gen3 M2] debug-runtime flags=%s gBattlersCount=%s @%s",
        hex8(flags),
        tostring(battlersCount),
        hex8(CONFIG.addresses.gBattlersCount)
    ))

    if battlersCount == nil or battlersCount == 0 or battlersCount > 4 then
        log("[Gen3 M2] debug-runtime: battlersCount not in expected range 1..4.")
        return
    end

    local monSizes = buildBattleMonSizeCandidates()
    for b = 0, battlersCount - 1 do
        local pos = read8(CONFIG.addresses.gBattlerPositions + b)
        local pidx = read16(CONFIG.addresses.gBattlerPartyIndexes + b * 2)
        log(string.format(
            "[Gen3 M2] debug-runtime battler=%d position=%s partyIndex=%s posAddr=%s idxAddr=%s",
            b,
            tostring(pos),
            tostring(pidx),
            hex8(CONFIG.addresses.gBattlerPositions + b),
            hex8(CONFIG.addresses.gBattlerPartyIndexes + b * 2)
        ))

        for i = 1, #monSizes do
            local monSize = monSizes[i]
            local monAddr = CONFIG.addresses.gBattleMons + b * monSize
            local species = read16le(monAddr + CONFIG.struct.battle_mon_species_offset)
            local level = read8(monAddr + CONFIG.struct.battle_mon_level_offset)
            local hp = read16le(monAddr + CONFIG.struct.battle_mon_hp_offset)
            local maxHP = read16le(monAddr + CONFIG.struct.battle_mon_maxhp_offset)
            local move1 = read16le(monAddr + CONFIG.struct.battle_mon_moves_offset + 0)
            local move2 = read16le(monAddr + CONFIG.struct.battle_mon_moves_offset + 2)
            local pp1 = read8(monAddr + CONFIG.struct.battle_mon_pp_offset + 0)
            local pp2 = read8(monAddr + CONFIG.struct.battle_mon_pp_offset + 1)
            log(string.format(
                "[Gen3 M2] debug-runtime battler=%d monSize=0x%X addr=%s species=%s level=%s hp=%s/%s move1=%s move2=%s pp1=%s pp2=%s",
                b,
                monSize,
                hex8(monAddr),
                tostring(species),
                tostring(level),
                tostring(hp),
                tostring(maxHP),
                tostring(move1),
                tostring(move2),
                tostring(pp1),
                tostring(pp2)
            ))
        end
    end
end

function milestone2_print_runtime()
    milestone2_debug_runtime()
end

function milestone2_log_enemy_ai_move_scores(probeNearbyOffsets)
    local flags, flagsAddr = readFlags()
    local enemyCount = getEnemyPartyCount()
    local inBattleBit = readMainInBattleBit()
    if flags == nil or (flags & BATTLE_TYPE.TRAINER) == 0 then
        log("[Gen3 M2] ai-scores: not in a trainer battle (or flags unreadable).")
        return
    end
    if inBattleBit ~= nil and not inBattleBit then
        log("[Gen3 M2] ai-scores: gMain reports not in battle.")
        return
    end
    if enemyCount ~= nil and (enemyCount < 1 or enemyCount > CONFIG.struct.party_size) then
        log(string.format("[Gen3 M2] ai-scores: enemy party count out of range: %s", tostring(enemyCount)))
        return
    end

    local runtime = nil
    if flagsAddr then
        runtime = selectBestBattleRuntime(flagsAddr)
    end
    if not runtime or not runtime.snapshots or runtime.battlersCount == nil then
        log("[Gen3 M2] ai-scores: battle runtime unresolved.")
        return
    end
    if runtime.battlersCount ~= 2 then
        log(string.format("[Gen3 M2] ai-scores: singles-only helper; battlers=%d", runtime.battlersCount))
        return
    end

    local enemySnap = nil
    local playerSnap = nil
    for b = 0, runtime.battlersCount - 1 do
        local snap = runtime.snapshots[b]
        if snap then
            if snap.side == 1 and enemySnap == nil then
                enemySnap = snap
            elseif snap.side == 0 and playerSnap == nil then
                playerSnap = snap
            end
        end
    end

    if not enemySnap or not playerSnap then
        log("[Gen3 M2] ai-scores: could not identify enemy/player active battlers.")
        return
    end

    local _, _scoreAddr, battleStructPtr, err = readAiFinalScore(enemySnap.battler, playerSnap.battler, 0)
    if err then
        log(string.format(
            "[Gen3 M2] ai-scores: %s (gBattleStructVar=%s ptr=%s)",
            tostring(err),
            hex8(CONFIG.addresses.gBattleStruct),
            hex8(battleStructPtr)
        ))
        return
    end

    local aiChosenTarget, aiChosenTargetAddr = readAiChosenTarget(enemySnap.battler)
    local aiMoveOrAction, aiMoveOrActionAddr = readAiMoveOrAction(enemySnap.battler)
    log(string.format(
        "[Gen3 M2] AI_SCORES enemyBattler=%d enemySpecies=%d enemyPartyIndex=%d targetBattler=%d targetSpecies=%d flags=%s gBattleStructVar=%s ptr=%s aiFinalScoreOff=0x%X aiChosenTarget=%s @%s aiMoveOrAction=%s @%s",
        enemySnap.battler,
        enemySnap.species or 0,
        enemySnap.partyIndex or 0,
        playerSnap.battler,
        playerSnap.species or 0,
        hex8(flags),
        hex8(CONFIG.addresses.gBattleStruct),
        hex8(battleStructPtr),
        CONFIG.struct.battle_struct_ai_final_score_offset,
        tostring(aiChosenTarget),
        hex8(aiChosenTargetAddr),
        tostring(aiMoveOrAction),
        hex8(aiMoveOrActionAddr)
    ))

    local function logScoresForTarget(targetBattler, aiOffset)
        local bestScore = nil
        local bestSlots = {}
        local nonZeroCount = 0
        local rowText = {}
        for i = 1, 4 do
            local moveId = enemySnap.moves[i]
            local score, scoreAddr = readAiFinalScore(enemySnap.battler, targetBattler, i - 1, aiOffset)
            local moveText = (moveId and moveId > 0) and tostring(moveId) or "null"
            rowText[#rowText + 1] = string.format("%s:%s@%s", moveText, tostring(score), hex8(scoreAddr))

            if score ~= nil and score ~= 0 then
                nonZeroCount = nonZeroCount + 1
            end
            if moveId and moveId > 0 and score ~= nil then
                if bestScore == nil or score > bestScore then
                    bestScore = score
                    bestSlots = { i }
                elseif score == bestScore then
                    bestSlots[#bestSlots + 1] = i
                end
            end
        end

        if nonZeroCount == 0 then
            return 0
        end

        log(string.format(
            "[Gen3 M2] AI_SCORE_ROW aiBattler=%d target=%d off=0x%X values=[%s]",
            enemySnap.battler,
            targetBattler,
            aiOffset,
            table.concat(rowText, " | ")
        ))

        if bestScore == nil then
            log(string.format("[Gen3 M2] AI_BEST target=%d no scored moves available.", targetBattler))
        else
            log(string.format("[Gen3 M2] AI_BEST target=%d score=%d slots=%s", targetBattler, bestScore, table.concat(bestSlots, ",")))
        end
        return nonZeroCount
    end

    local totalNonZero = 0
    for target = 0, runtime.battlersCount - 1 do
        totalNonZero = totalNonZero + logScoresForTarget(target, CONFIG.struct.battle_struct_ai_final_score_offset)
    end

    local doProbe = probeNearbyOffsets == true or probeNearbyOffsets == 1 or probeNearbyOffsets == "true"
    if totalNonZero == 0 and doProbe then
        log("[Gen3 M2] AI_SCORE probe: all configured-offset scores are zero; scanning nearby offsets...")
        local baseOff = CONFIG.struct.battle_struct_ai_final_score_offset
        local candidates = {}
        for delta = -0x80, 0x80, 4 do
            local off = baseOff + delta
            if off >= 0 then
                local nz = 0
                local sumAbs = 0
                local vals = {}
                for i = 1, 4 do
                    local score = readAiFinalScore(enemySnap.battler, playerSnap.battler, i - 1, off)
                    vals[i] = score
                    if score and score ~= 0 then
                        nz = nz + 1
                    end
                    if score then
                        sumAbs = sumAbs + math.abs(score)
                    end
                end

                if nz > 0 then
                    candidates[#candidates + 1] = {
                        off = off,
                        nz = nz,
                        sumAbs = sumAbs,
                        vals = vals,
                    }
                end
            end
        end

        table.sort(candidates, function(a, b)
            if a.nz ~= b.nz then
                return a.nz > b.nz
            end
            if a.sumAbs ~= b.sumAbs then
                return a.sumAbs > b.sumAbs
            end
            return a.off < b.off
        end)

        if #candidates == 0 then
            log("[Gen3 M2] AI_SCORE probe: no nearby non-zero rows found.")
            return
        end

        local limit = (#candidates < 8) and #candidates or 8
        for i = 1, limit do
            local c = candidates[i]
            log(string.format(
                "[Gen3 M2] AI_SCORE probe cand[%d] off=0x%X nz=%d sumAbs=%d row=[%s,%s,%s,%s]",
                i,
                c.off,
                c.nz,
                c.sumAbs,
                tostring(c.vals[1]),
                tostring(c.vals[2]),
                tostring(c.vals[3]),
                tostring(c.vals[4])
            ))
        end
    end
end

function moveScores(probeNearbyOffsets)
    milestone2_log_enemy_ai_move_scores(probeNearbyOffsets)
end

function milestone2_dump_ewram_head(path)
    local startAddr = 0x02000000
    local endAddr = 0x020005C0 -- inclusive
    local outPath = path or "gen3_m2_ewram_02000000_020005C0.txt"
    local f = io.open(outPath, "w")
    if not f then
        log(string.format("[Gen3 M2] dump failed: could not open file '%s' for writing.", tostring(outPath)))
        return
    end

    f:write(string.format("; [Gen3 M2] EWRAM dump %s..%s (inclusive)\n", hex8(startAddr), hex8(endAddr)))
    f:write("; format: address: 16 bytes (hex)\n")

    local addr = startAddr
    while addr <= endAddr do
        local line = string.format("%08X:", addr)
        for i = 0, 15 do
            local a = addr + i
            if a <= endAddr then
                local b = read8(a)
                if b == nil then
                    line = line .. " ??"
                else
                    line = line .. string.format(" %02X", b & 0xFF)
                end
            else
                line = line .. "   "
            end
        end
        f:write(line .. "\n")
        addr = addr + 16
    end

    f:close()
    log(string.format(
        "[Gen3 M2] dump written: %s (%d bytes, %s..%s)",
        tostring(outPath),
        (endAddr - startAddr + 1),
        hex8(startAddr),
        hex8(endAddr)
    ))
end

function milestone2_dump_ewram(path)
    milestone2_dump_ewram_head(path)
end

local function resolveRequestedBoxSlots(boxSlotsDumped)
    local requestedSlots = tonumber(boxSlotsDumped)
    if requestedSlots == nil then
        requestedSlots = tonumber(CONFIG.http and CONFIG.http.box_slots_dumped_default)
    end
    if requestedSlots == nil then
        requestedSlots = CONFIG.struct.total_boxes_count * CONFIG.struct.in_box_count
    end
    requestedSlots = math.floor(requestedSlots)
    if requestedSlots < 0 then
        requestedSlots = 0
    end
    local maxSlots = CONFIG.struct.total_boxes_count * CONFIG.struct.in_box_count
    if requestedSlots > maxSlots then
        requestedSlots = maxSlots
    end
    return requestedSlots
end

local function buildLegacyPartyBoxPayload(boxSlotsDumped)
    local playerPartyBase = getPlayerPartyBase()
    local storageBase = getPokemonStorageBase()
    if not playerPartyBase then
        return nil, "gPlayerParty base unavailable"
    end
    if not storageBase then
        return nil, "gPokemonStoragePtr unavailable"
    end

    local trainerId, secretId = getPlayerTrainerIds()
    if trainerId == nil then trainerId = 0 end
    if secretId == nil then secretId = 0 end

    local partyCount = getPlayerPartyCount() or CONFIG.struct.party_size
    if partyCount < 0 then
        partyCount = 0
    end
    if partyCount > CONFIG.struct.party_size then
        partyCount = CONFIG.struct.party_size
    end

    local requestedSlots = resolveRequestedBoxSlots(boxSlotsDumped)

    local partyHex = bytesToHex(playerPartyBase, partyCount * CONFIG.struct.party_mon_size)
    local boxesBase = storageBase + CONFIG.struct.pokemon_storage_boxes_offset
    local boxesHex = bytesToHex(boxesBase, requestedSlots * CONFIG.struct.box_mon_size)

    local payload = {
        trainerId = trainerId,
        secretId = secretId,
        partyCount = partyCount,
        partyStructSize = CONFIG.struct.party_mon_size,
        boxStructSize = CONFIG.struct.box_mon_size,
        boxSlotsDumped = requestedSlots,
        partyEncoding = "hex",
        boxesEncoding = "hex",
        party = partyHex,
        boxes = boxesHex,
    }
    return payload, nil
end

buildLegacyPartyBoxPayloadJson = function(boxSlotsDumped)
    local payload, err = buildLegacyPartyBoxPayload(boxSlotsDumped)
    if not payload then
        return nil, err
    end
    return jsonEncode(payload), nil
end

buildPartyBoxPayload = function(boxSlotsDumped)
    local playerPartyBase = getPlayerPartyBase()
    local storageBase = getPokemonStorageBase()
    if not playerPartyBase then
        return nil, "gPlayerParty base unavailable"
    end
    if not storageBase then
        return nil, "gPokemonStoragePtr unavailable"
    end

    local trainerId, secretId = getPlayerTrainerIds()

    local partyCount = getPlayerPartyCount() or CONFIG.struct.party_size
    if partyCount < 0 then
        partyCount = 0
    end
    if partyCount > CONFIG.struct.party_size then
        partyCount = CONFIG.struct.party_size
    end

    local requestedSlots = resolveRequestedBoxSlots(boxSlotsDumped)

    local partyHex = bytesToHex(playerPartyBase, partyCount * CONFIG.struct.party_mon_size)

    local boxesBase = storageBase + CONFIG.struct.pokemon_storage_boxes_offset
    local packedBoxBytes = {}
    local packedCount = 0
    for slot = 0, requestedSlots - 1 do
        local slotAddr = boxesBase + slot * CONFIG.struct.box_mon_size
        local hasAny = false
        for i = 0, CONFIG.struct.box_mon_size - 1 do
            local b = read8(slotAddr + i) or 0
            if (b & 0xFF) ~= 0 then
                hasAny = true
                break
            end
        end
        if hasAny then
            packedCount = packedCount + 1
            for i = 0, CONFIG.struct.box_mon_size - 1 do
                local b = read8(slotAddr + i) or 0
                packedBoxBytes[#packedBoxBytes + 1] = string.format("%02X", b & 0xFF)
            end
        end
    end
    local boxesHex = table.concat(packedBoxBytes, "")

    local payload = {
        trainerId = jsonOrNull(trainerId),
        secretId = jsonOrNull(secretId),
        partyCount = partyCount,
        partyStructSize = CONFIG.struct.party_mon_size,
        boxStructSize = CONFIG.struct.box_mon_size,
        boxSlotsDumped = packedCount,
        partyEncoding = "hex",
        boxesEncoding = "hex",
        party = partyHex,
        boxes = boxesHex,
    }
    return payload, nil
end

buildPartyBoxPayloadJson = function(boxSlotsDumped)
    local payload, err = buildPartyBoxPayload(boxSlotsDumped)
    if not payload then
        return nil, err
    end
    return jsonEncode(payload), nil
end

function milestone2_dump_party_box_hex(path, boxSlotsDumped)
    local payload, err = buildPartyBoxPayload(boxSlotsDumped)
    if not payload then
        log(string.format("[Gen3 M2] dump-party-box failed: %s", tostring(err)))
        return
    end

    local trainerId, _secretId = getPlayerTrainerIds()
    local defaultPath = string.format("/Users/andylee/Repos/vsrecorder/logs/Box-%d.json", trainerId or 0)
    local outPath = path or defaultPath
    ensureDirExistsForPath(outPath)

    local f = io.open(outPath, "w")
    if not f then
        log(string.format("[Gen3 M2] dump-party-box failed: could not open '%s' for writing.", tostring(outPath)))
        return
    end
    f:write(jsonEncode(payload))
    f:write("\n")
    f:close()
    state.lastBoxDumpPath = outPath

    log(string.format(
        "[Gen3 M2] dump-party-box written: %s (trainerId=%d partyCount=%d boxSlots=%d)",
        tostring(outPath),
        trainerId or 0,
        tonumber(payload.partyCount) or 0,
        tonumber(payload.boxSlotsDumped) or 0
    ))

    writeCurrentAttemptMaster(true)
end

function milestone2_dump_box_hex(path, boxSlotsDumped)
    milestone2_dump_party_box_hex(path, boxSlotsDumped)
end

function milestone2_update_master()
    if writeCurrentAttemptMaster(true) then
        local ctx = ensureExportContext()
        log(string.format("[Gen3 M2] master updated: %s", tostring(ctx and ctx.masterPath or "n/a")))
    end
end

function milestone2_http_status()
    local httpCfg = CONFIG.http or {}
    log(string.format(
        "[Gen3 M2] HTTP status enabled=%s started=%s host=%s port=%s boxPath=%s updateAliasPath=%s battleLogPath=%s updateLegacyPath=%s battleStatePath=%s",
        tostring(httpCfg.enabled),
        tostring(state.httpStarted and state.httpServer ~= nil),
        tostring(httpCfg.host or "*"),
        tostring(httpCfg.port or 31124),
        tostring(httpCfg.box_path or httpCfg.update_path or "/box"),
        tostring(httpCfg.update_alias_path or "/update"),
        tostring(httpCfg.battle_log_path or "/battle_log"),
        tostring(httpCfg.update_legacy_path or "/update_legacy"),
        tostring(httpCfg.battle_state_path or "/battle_state")
    ))
end

function milestone2_http_start()
    setupHttpServer()
    milestone2_http_status()
end

function milestone2_http_stop()
    stopHttpServer()
    log("[Gen3 M2] HTTP API stopped.")
end

function milestone2_http_update_json(boxSlotsDumped)
    local payloadJson, err = buildLegacyPartyBoxPayloadJson(boxSlotsDumped)
    if not payloadJson then
        log(string.format("[Gen3 M2] HTTP payload build failed: %s", tostring(err)))
        return nil
    end
    return payloadJson
end

function milestone2_http_handle_debug(method, path)
    return handleHttpRequest(method or "GET", path or "/ping")
end

function milestone2_debug_party_read()
    local playerPartyBase = getPlayerPartyBase()
    local partyCountAddr = getPlayerPartyCountAddr()
    local partyCount = getPlayerPartyCount()

    log(string.format(
        "[Gen3 M2] party-read base=%s partyCountAddr=%s partyCount=%s partyMonSize=%s",
        hex8(playerPartyBase),
        hex8(partyCountAddr),
        tostring(partyCount),
        tostring(CONFIG.struct.party_mon_size)
    ))

    if not playerPartyBase then
        log("[Gen3 M2] party-read: player party base unavailable.")
        return
    end

    for slot = 0, CONFIG.struct.party_size - 1 do
        local slotAddr = playerPartyBase + slot * CONFIG.struct.party_mon_size
        local rawHex = bytesToHex(slotAddr, CONFIG.struct.party_mon_size)
        local mon = decodePartyMon(slotAddr, slot)
        if mon then
            local moveNames = {}
            for i = 1, 4 do
                moveNames[i] = getMoveName(mon.moves and mon.moves[i]) or tostring(mon.moves and mon.moves[i] or 0)
            end
            log(string.format(
                "[Gen3 M2] party-read slot=%d addr=%s species=%s(%s) level=%s hp=%s/%s item=%s(%s) nature=%s abilitySlot=%s pid=%s otId=%s moves=[%s | %s | %s | %s]",
                slot,
                hex8(slotAddr),
                getSpeciesName(mon.species) or "Unknown",
                tostring(mon.species),
                tostring(mon.level),
                tostring(mon.currentHP),
                tostring(mon.maxHP),
                getHeldItemName(mon.heldItem) or "None",
                tostring(mon.heldItem),
                getNatureNameFromId(mon.natureId) or tostring(mon.natureId),
                tostring(mon.abilityNum),
                tostring(mon.personality),
                tostring(mon.otId),
                moveNames[1],
                moveNames[2],
                moveNames[3],
                moveNames[4]
            ))
        else
            log(string.format(
                "[Gen3 M2] party-read slot=%d addr=%s decode=nil",
                slot,
                hex8(slotAddr)
            ))
        end
        log(string.format(
            "[Gen3 M2] party-read slot=%d rawHex=%s",
            slot,
            rawHex
        ))
    end

    local snapshot = buildPlayerPartySnapshot()
    log(string.format("[Gen3 M2] party-read snapshotCount=%d", #snapshot))
    for i = 1, #snapshot do
        local mon = snapshot[i]
        log(string.format(
            "[Gen3 M2] party-read snapshot slot=%s species=%s(%s) level=%s hp=%s/%s item=%s(%s)",
            tostring(mon.slot),
            getSpeciesName(mon.species) or "Unknown",
            tostring(mon.species),
            tostring(mon.level),
            tostring(mon.hp),
            tostring(mon.maxHP),
            getHeldItemName(mon.heldItem) or "None",
            tostring(mon.heldItem)
        ))
    end

    local payload, err = buildPartyBoxPayload()
    if not payload then
        log(string.format("[Gen3 M2] party-read buildPartyBoxPayload failed: %s", tostring(err)))
        return
    end

    log(string.format(
        "[Gen3 M2] party-read /box payload partyCount=%s partyHexLen=%d boxSlotsDumped=%s boxesHexLen=%d",
        tostring(payload.partyCount),
        type(payload.party) == "string" and #payload.party or 0,
        tostring(payload.boxSlotsDumped),
        type(payload.boxes) == "string" and #payload.boxes or 0
    ))
    log(string.format(
        "[Gen3 M2] party-read /box payload partyHex=%s",
        tostring(payload.party or "")
    ))
end

function milestone2_debug_append_event(record)
    appendBattleLogEvent(record)
end

function milestone2_debug_get_export_paths()
    local ctx = ensureExportContext()
    return {
        attemptMapPath = getAttemptMapPath(),
        attemptDir = ctx and ctx.attemptDir or nil,
        masterPath = ctx and ctx.masterPath or nil,
    }
end

function milestone2_debug_poll_frame()
    pollBattleState()
end

function printNullHttpDiagnostics()
    local httpCfg = CONFIG.http or {}
    log(string.format(
        "[null-http] DIAG started=%s server=%s boxRequests=%s battleLogRequests=%s updateLegacyRequests=%s battleStateRequests=%s",
        tostring(state.httpStarted),
        tostring(state.httpServer ~= nil),
        tostring(state.httpUpdateRequests or 0),
        tostring(state.httpBattleLogRequests or 0),
        tostring(state.httpUpdateLegacyRequests or 0),
        tostring(state.httpBattleStateRequests or 0)
    ))
    log(string.format(
        "[null-http] DIAG host=%s port=%s boxPath=%s updateAliasPath=%s battleLogPath=%s updateLegacyPath=%s battleStatePath=%s",
        tostring(httpCfg.host or "*"),
        tostring(httpCfg.port or 31124),
        tostring(httpCfg.box_path or httpCfg.update_path or "/box"),
        tostring(httpCfg.update_alias_path or "/update"),
        tostring(httpCfg.battle_log_path or "/battle_log"),
        tostring(httpCfg.update_legacy_path or "/update_legacy"),
        tostring(httpCfg.battle_state_path or "/battle_state")
    ))
end

teardownPreviousSingletonInstance()

local emeraldSingleton = rawget(_G, EMERALD_SINGLETON_KEY)
if type(emeraldSingleton) ~= "table" then
    emeraldSingleton = {}
    _G[EMERALD_SINGLETON_KEY] = emeraldSingleton
end

emeraldSingleton.startCallbackId = callbacks:add("start", onStart)
emeraldSingleton.frameCallbackId = callbacks:add("frame", pollBattleState)
emeraldSingleton.callbackOwnerToken = THIS_SCRIPT_TOKEN
emeraldSingleton.teardown = teardownThisScriptInstance
emeraldSingleton.httpState = state

if emu then
    onStart()
end
