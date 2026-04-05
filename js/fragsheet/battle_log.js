(function () {
    const BATTLE_LOG_STORAGE_KEY = "battleLogs";
    const BATTLE_LOG_SOURCE_META_KEY = "battleLogSourceMeta";
    const BATTLE_LOG_SYNC_URL = "http://127.0.0.1:31124/battle_log";
    const BATTLE_LOG_SYNC_MAX_ATTEMPTS = 6;
    const BATTLE_LOG_SYNC_BASE_RETRY_MS = 400;
    const BATTLE_LOG_PACKED_MAGIC = "NBL1";
    const BATTLE_LOG_PACKED_MIN_VERSION = 1;
    const BATTLE_LOG_PACKED_MAX_VERSION = 2;
    let lastRenderedBattleLogRaw = null;
    let lastRenderedCustomLeadsRaw = null;
    let syncBattleLogsInFlight = false;
    let activeBattleLogSplitFilter = "all";
    let battleLogUiInitialized = false;
    const BATTLE_LOG_ID_PLACEHOLDERS = {
        species: "Unknown",
        move: "Unknown",
        item: "None",
        ability: "Unknown"
    };

    function escHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function safeCleanString(value) {
        if (typeof window.cleanString === "function") {
            return window.cleanString(String(value ?? ""));
        }
        return String(value ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    }

    function toBattleSpriteSlug(value) {
        const raw = String(value ?? "").toLowerCase();
        return raw
            .replace(/[\s_.-]+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function spritePath(species) {
        const slug = toBattleSpriteSlug(species) || safeCleanString(species);
        return `./img/pokesprite/${slug}.png`;
    }

    function getBattleLogMoveDisplayName(moveName) {
        const baseName = String(moveName ?? "");
        if (!baseName) return baseName;

        const title = typeof window.TITLE === "string" ? window.TITLE : "";
        const allMoveChanges = window.moveChanges;
        if (!title || !allMoveChanges || typeof allMoveChanges !== "object") {
            return baseName;
        }

        const titleMoveChanges = allMoveChanges[title];
        if (!titleMoveChanges || typeof titleMoveChanges !== "object") {
            return baseName;
        }

        const substituted = titleMoveChanges[baseName];
        return (typeof substituted === "string" && substituted) ? substituted : baseName;
    }

    function readLocalStorageJson(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function getCurrentTitle() {
        return typeof window.TITLE === "string" ? window.TITLE : "";
    }

    function cleanSpeciesKey(speciesName) {
        return String(speciesName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    function formatImperiumItemName(rawName) {
        if (!rawName) return "";
        const raw = String(rawName || "");
        if (!raw || raw === "NONE") return "";

        if (typeof window.itemTitleize === "function") {
            try {
                const titleized = window.itemTitleize(raw);
                if (typeof titleized === "string" && titleized.trim()) {
                    return titleized.trim();
                }
            } catch (_err) {
            }
        }

        return raw
            .toLowerCase()
            .split(/[_\s-]+/)
            .map((part) => (part ? (part.charAt(0).toUpperCase() + part.slice(1)) : ""))
            .join(" ")
            .trim();
    }

    function applyBattleLogTabVisibility() {
        const $battleLogTab = $('.view-tab[data-view="battle-log"]');
        if (!$battleLogTab.length) return;

        if (isBattleLogEnabledForTitle()) {
            $battleLogTab.show();
            return;
        }

        $battleLogTab.hide();

        if (document.body.classList.contains("battle-log-mode")) {
            setViewMode("fragsheet");
        }
    }

    function getCustomLeadsMap() {
        const customLeadsMap = readLocalStorageJson("customLeads");
        return (customLeadsMap && typeof customLeadsMap === "object") ? customLeadsMap : null;
    }

    function resolveBattleLogSource() {
        const data = readLocalStorageJson(BATTLE_LOG_STORAGE_KEY);
        if (data == null) {
            return { source: null, data: null };
        }
        const meta = readLocalStorageJson(BATTLE_LOG_SOURCE_META_KEY);
        const source = (meta && typeof meta === "object" && meta.label)
            ? String(meta.label)
            : `localStorage:${BATTLE_LOG_STORAGE_KEY}`;
        return { source, data };
    }

    function getBattleLogStorageFingerprint() {
        const raw = localStorage.getItem(BATTLE_LOG_STORAGE_KEY);
        return raw == null ? "" : raw;
    }

    function setBattleLogUploadStatus(message, isError) {
        const el = document.getElementById("battle-log-upload-status");
        if (!el) return;
        el.style.display = message ? "block" : "none";
        el.textContent = String(message || "");
        el.style.borderColor = isError ? "#b65b63" : "#68686e";
        el.style.color = isError ? "#ffb6bd" : "#bdbdbd";
    }

    function setBattleLogSourceMeta(meta) {
        try {
            if (!meta) {
                localStorage.removeItem(BATTLE_LOG_SOURCE_META_KEY);
                return;
            }
            localStorage.setItem(BATTLE_LOG_SOURCE_META_KEY, JSON.stringify(meta));
        } catch (_err) {
        }
    }

    function delayMs(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function computeBattleLogRetryDelayMs(attempt, baseDelayMs) {
        let base = Number(baseDelayMs) || 200;
        if (base < 50) base = 50;
        const step = Math.max(0, (Number(attempt) || 1) - 1);
        return Math.floor(Math.min(1800, base * Math.pow(2, step)));
    }

    function isRetryableBattleLogSyncError(err) {
        if (!err) return false;
        const msg = String(err.message || err || "").toLowerCase();
        return (
            msg.includes("err_empty_response") ||
            msg.includes("connection refused") ||
            msg.includes("empty /battle_log response") ||
            msg.includes("empty response") ||
            msg.includes("failed to fetch") ||
            msg.includes("networkerror") ||
            msg.includes("load failed")
        );
    }

    function resolveNullAbilityNameForBattleLog(speciesId, abilitySlot) {
        const speciesList = Array.isArray(window.nullMons) ? window.nullMons : [];
        const abilitiesBySpecies = (window.nullAbilities && typeof window.nullAbilities === "object") ? window.nullAbilities : null;
        const speciesName = (speciesId > 0 && speciesId <= speciesList.length) ? speciesList[speciesId - 1] : null;
        if (!speciesName || !abilitiesBySpecies) return "Unknown";

        const speciesKey = String(speciesName).toLowerCase().replace(/[^a-z0-9]/g, "");
        const abilities = abilitiesBySpecies[speciesKey];
        if (!abilities || typeof abilities !== "object") return "Unknown";

        const normalizedSlot = (Number.isInteger(abilitySlot) && abilitySlot >= 0 && abilitySlot <= 3) ? abilitySlot : 0;
        const preferredKeys = (normalizedSlot === 0)
            ? ["0", "1", "H"]
            : (normalizedSlot === 1)
                ? ["1", "0", "H"]
                : ["H", "0", "1"];

        for (let i = 0; i < preferredKeys.length; i += 1) {
            const ability = abilities[preferredKeys[i]];
            if (ability && ability !== "-" && ability !== "None") {
                return ability;
            }
        }
        return "Unknown";
    }

    function resolveImperiumAbilityNameForBattleLog(speciesId, abilitySlot) {
        const speciesList = Array.isArray(window.emImpMons) ? window.emImpMons : [];
        const primaryAbilitiesBySpecies = (window.abilsPrimary && typeof window.abilsPrimary === "object") ? window.abilsPrimary : null;
        const fallbackAbilitiesBySpecies = (window.abils && typeof window.abils === "object") ? window.abils : null;
        const speciesName = (speciesId >= 0 && speciesId < speciesList.length) ? speciesList[speciesId] : null;
        if (!speciesName || speciesName === "None") return "Unknown";

        function resolveAbilityListFromMap(abilityMap) {
            if (!abilityMap || typeof abilityMap !== "object") return null;
            let list = abilityMap[speciesName];
            if (Array.isArray(list)) return list;
            const speciesKey = cleanSpeciesKey(speciesName);
            for (const abilitySpecies in abilityMap) {
                if (!Object.prototype.hasOwnProperty.call(abilityMap, abilitySpecies)) continue;
                if (cleanSpeciesKey(abilitySpecies) === speciesKey) {
                    list = abilityMap[abilitySpecies];
                    break;
                }
            }
            return Array.isArray(list) ? list : null;
        }

        let abilities = resolveAbilityListFromMap(primaryAbilitiesBySpecies);
        if (!Array.isArray(abilities)) {
            abilities = resolveAbilityListFromMap(fallbackAbilitiesBySpecies);
        }
        if (!Array.isArray(abilities)) return "Unknown";

        const normalizedSlot = (Number.isInteger(abilitySlot) && abilitySlot >= 0 && abilitySlot <= 3) ? abilitySlot : 0;
        const preferredIndexes = (normalizedSlot === 0)
            ? [0, 1, 2]
            : (normalizedSlot === 1)
                ? [1, 0, 2]
                : [2, 0, 1];

        for (let i = 0; i < preferredIndexes.length; i += 1) {
            const ability = abilities[preferredIndexes[i]];
            if (ability && ability !== "-" && ability !== "None") {
                return ability;
            }
        }
        for (let i = 0; i < abilities.length; i += 1) {
            const fallback = abilities[i];
            if (fallback && fallback !== "-" && fallback !== "None") {
                return fallback;
            }
        }
        return "Unknown";
    }

    function getPlatinumNatureList() {
        if (Array.isArray(window.natures) && window.natures.length) {
            return window.natures;
        }
        return [
            "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
            "Bold", "Docile", "Relaxed", "Impish", "Lax",
            "Timid", "Hasty", "Serious", "Jolly", "Naive",
            "Modest", "Mild", "Quiet", "Bashful", "Rash",
            "Calm", "Gentle", "Sassy", "Careful", "Quirky"
        ];
    }

    function isPlatinumStyleBattleLogTitle(title) {
        return typeof title === "string" && (
            title.includes("Platinum") ||
            title.includes("Black") ||
            title.includes("White") ||
            title.includes("Gold") ||
            title.includes("Silver")
        );
    }

    function resolvePlatinumAbilityNameForBattleLog(speciesId, abilityValue, abilitySlot) {
        const directAbilityId = Number(abilityValue);
        if (Number.isInteger(directAbilityId) && directAbilityId > 0) {
            return decodeEnumId(directAbilityId, "ability");
        }

        const speciesName = decodeEnumId(Number(speciesId), "species");
        const pokedexEntry = speciesName && window.pokedex ? window.pokedex[speciesName] : null;
        const abilities = pokedexEntry && pokedexEntry.abilities ? pokedexEntry.abilities : null;
        if (!abilities || typeof abilities !== "object") {
            return "Unknown";
        }

        const normalizedSlot = Number(abilitySlot);
        const preferredKeys = normalizedSlot === 2
            ? ["1", "0", "H"]
            : normalizedSlot === 3
                ? ["H", "0", "1"]
                : ["0", "1", "H"];

        for (let i = 0; i < preferredKeys.length; i += 1) {
            const abilityName = abilities[preferredKeys[i]];
            if (abilityName && abilityName !== "-" && abilityName !== "None") {
                return abilityName;
            }
        }

        return "Unknown";
    }

    function getNullEnumList(kind) {
        if (kind === "species" && Array.isArray(window.nullMons)) {
            return ["", ...window.nullMons];
        }
        if (kind === "move" && Array.isArray(window.nullMoves)) {
            return window.nullMoves;
        }
        if (kind === "item" && Array.isArray(window.nullItems)) {
            return ["None", ...window.nullItems];
        }
        return null;
    }

    function getImperiumEnumList(kind) {
        if (kind === "species" && Array.isArray(window.emImpMons)) {
            return window.emImpMons;
        }
        if (kind === "move" && Array.isArray(window.pokeemeraldMoves)) {
            return window.pokeemeraldMoves;
        }
        if (kind === "item" && Array.isArray(window.emImpItems)) {
            return window.emImpItems.map((raw, idx) => {
                if (idx === 0) return "None";
                const formatted = formatImperiumItemName(raw);
                return formatted || "None";
            });
        }
        return null;
    }

    const BATTLE_LOG_ROM_ADAPTERS = [
        {
            id: "null",
            matchesTitle: (title) => title === "Pokemon Null",
            enabled: true,
            getEnumList: getNullEnumList,
            getNatureList: () => Array.isArray(window.nullNatures) ? window.nullNatures : [],
            resolveAbilityName: resolveNullAbilityNameForBattleLog,
        },
        {
            id: "emerald-imperium",
            matchesTitle: (title) => typeof title === "string" && title.includes("Emerald Imperium"),
            enabled: true,
            getEnumList: getImperiumEnumList,
            getNatureList: () => Array.isArray(window.natures) ? window.natures : [],
            resolveAbilityName: resolveImperiumAbilityNameForBattleLog,
        },
        {
            id: "platinum",
            matchesTitle: (title) => isPlatinumStyleBattleLogTitle(title),
            enabled: true,
            getNatureList: getPlatinumNatureList,
            resolveAbilityName: resolvePlatinumAbilityNameForBattleLog,
        },
    ];

    function getActiveBattleLogRomAdapter() {
        const title = getCurrentTitle();
        for (let i = 0; i < BATTLE_LOG_ROM_ADAPTERS.length; i += 1) {
            const adapter = BATTLE_LOG_ROM_ADAPTERS[i];
            if (adapter && typeof adapter.matchesTitle === "function" && adapter.matchesTitle(title)) {
                return adapter;
            }
        }
        return null;
    }

    function logActiveBattleLogRomAdapter(contextLabel) {
        const adapter = getActiveBattleLogRomAdapter();
        const adapterId = adapter && adapter.id ? adapter.id : "none";
        const title = getCurrentTitle() || "(empty)";
        const context = contextLabel ? String(contextLabel) : "runtime";
        console.log(`[battle_log] adapter=${adapterId} title="${title}" context=${context}`);
    }

    function isBattleLogEnabledForTitle() {
        const adapter = getActiveBattleLogRomAdapter();
        return !!(adapter && adapter.enabled);
    }

    function decodePackedBattleLogPayload(payloadBytes) {
        const bytes = payloadBytes instanceof Uint8Array
            ? payloadBytes
            : new Uint8Array(payloadBytes || new ArrayBuffer(0));
        const romAdapter = getActiveBattleLogRomAdapter();

        if (bytes.length < 5) {
            throw new Error("Packed /battle_log payload too short");
        }

        const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
        if (magic !== BATTLE_LOG_PACKED_MAGIC) {
            throw new Error(`Invalid /battle_log magic: ${magic}`);
        }
        const version = bytes[4];
        if (version < BATTLE_LOG_PACKED_MIN_VERSION || version > BATTLE_LOG_PACKED_MAX_VERSION) {
            throw new Error(`Unsupported /battle_log packed version: ${version}`);
        }

        const natureList = (romAdapter && typeof romAdapter.getNatureList === "function")
            ? (romAdapter.getNatureList() || [])
            : [];
        const resolveAbilityName = (romAdapter && typeof romAdapter.resolveAbilityName === "function")
            ? romAdapter.resolveAbilityName
            : (() => "Unknown");
        const totalBits = bytes.length * 8;
        let bitPos = 40;
        const events = [];
        let currentPartySpecies = [];

        function bitsRemaining() {
            return totalBits - bitPos;
        }

        function readBits(width) {
            if (bitPos + width > totalBits) {
                throw new Error(`Truncated packed /battle_log payload (need ${width} bits)`);
            }
            let value = 0;
            for (let i = 0; i < width; i += 1) {
                const absoluteBit = bitPos + i;
                const byteIndex = absoluteBit >> 3;
                const bitIndex = absoluteBit & 7;
                if (((bytes[byteIndex] >> bitIndex) & 1) !== 0) {
                    value |= (1 << i);
                }
            }
            bitPos += width;
            return value >>> 0;
        }

        while (bitsRemaining() >= 2) {
            const eventType = readBits(2);
            if (eventType === 0) {
                const hasPartyHighestLevel = version >= 2;
                const sessionStartExtraBits = hasPartyHighestLevel ? 7 : 0;
                if (bitsRemaining() < (16 + 16 + 3 + sessionStartExtraBits)) {
                    break;
                }
                const enemyTrainerIdA = readBits(16);
                const enemyTrainerIdB = readBits(16);
                let partyCount = readBits(3);
                const pPartyHighestLevel = hasPartyHighestLevel ? readBits(7) : null;
                if (partyCount > 6) {
                    partyCount = 6;
                }
                if (bitsRemaining() < (partyCount * (11 + 10 + 5 + 2 + 10 + 10 + 10 + 10))) {
                    break;
                }

                const party = [];
                currentPartySpecies = [];
                for (let i = 0; i < partyCount; i += 1) {
                    const species = readBits(11);
                    const heldItem = readBits(10);
                    const natureId = readBits(5);
                    const abilitySlot = readBits(2);
                    const move1 = readBits(10);
                    const move2 = readBits(10);
                    const move3 = readBits(10);
                    const move4 = readBits(10);
                    const natureName = (natureId >= 0 && natureId < natureList.length && natureList[natureId])
                        ? natureList[natureId]
                        : "Hardy";
                    const abilityName = resolveAbilityName(species, abilitySlot);
                    party.push({
                        species,
                        ability: abilityName,
                        abilitySlot,
                        heldItem,
                        nature: natureName,
                        natureId,
                        slot: i,
                        moves: [move1, move2, move3, move4],
                    });
                    currentPartySpecies.push(species);
                }

                events.push({
                    type: "session_start",
                    enemyTrainerIdA: enemyTrainerIdA === 0xFFFF ? null : enemyTrainerIdA,
                    enemyTrainerIdB: enemyTrainerIdB === 0xFFFF ? null : enemyTrainerIdB,
                    pPartyHighestLevel: Number.isFinite(pPartyHighestLevel) ? pPartyHighestLevel : null,
                    pParty: party,
                });
            } else if (eventType === 1) {
                events.push({ type: "session_end" });
            } else if (eventType === 2) {
                if (bitsRemaining() < (16 + 3 + 11)) {
                    break;
                }
                const turn = readBits(16);
                const pSlot = readBits(3);
                const aiSpecies = readBits(11);
                const pSpecies = (pSlot >= 0 && pSlot < currentPartySpecies.length) ? currentPartySpecies[pSlot] : null;
                const ev = { type: "pKo", turn, pSlot };
                if (pSpecies != null) ev.pSpecies = pSpecies;
                if (aiSpecies > 0) ev.aiSpecies = aiSpecies;
                events.push(ev);
            } else if (eventType === 3) {
                if (bitsRemaining() < (16 + 3)) {
                    break;
                }
                const turn = readBits(16);
                const pSlot = readBits(3);
                const pSpecies = (pSlot >= 0 && pSlot < currentPartySpecies.length) ? currentPartySpecies[pSlot] : null;
                const ev = { type: "aiKo", turn, pSlot };
                if (pSpecies != null) ev.pSpecies = pSpecies;
                events.push(ev);
            } else {
                throw new Error(`Unknown packed event type ${eventType}`);
            }
        }

        return { events };
    }

    function decodeBattleLogResponsePayload(payloadBytes) {
        const bytes = payloadBytes instanceof Uint8Array
            ? payloadBytes
            : new Uint8Array(payloadBytes || new ArrayBuffer(0));

        if (!bytes || bytes.length === 0) {
            throw new Error("Empty /battle_log response");
        }

        const hasPackedMagic = bytes.length >= 4 &&
            String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === BATTLE_LOG_PACKED_MAGIC;
        if (hasPackedMagic) {
            return decodePackedBattleLogPayload(bytes);
        }

        const text = new TextDecoder("utf-8").decode(bytes).trim();
        if (!text) {
            throw new Error("Empty /battle_log response");
        }

        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error(`Invalid JSON /battle_log payload: ${err && err.message ? err.message : String(err)}`);
        }
    }

    async function syncBattleLogsFromLuaUpdate() {
        if (syncBattleLogsInFlight) {
            return;
        }
        logActiveBattleLogRomAdapter("sync");
        syncBattleLogsInFlight = true;
        setBattleLogUploadStatus("Syncing...", false);
        try {
            let payload = null;
            let lastErr = null;

            for (let attempt = 1; attempt <= BATTLE_LOG_SYNC_MAX_ATTEMPTS; attempt += 1) {
                try {
                    const response = await fetch(BATTLE_LOG_SYNC_URL, { cache: "no-store" });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const bytes = new Uint8Array(await response.arrayBuffer());
                    payload = decodeBattleLogResponsePayload(bytes);
                    if (typeof payload === "undefined") {
                        throw new Error("Invalid /battle_log payload");
                    }
                    lastErr = null;
                    break;
                } catch (err) {
                    lastErr = err;
                    if (attempt >= BATTLE_LOG_SYNC_MAX_ATTEMPTS || !isRetryableBattleLogSyncError(err)) {
                        throw err;
                    }
                    await delayMs(computeBattleLogRetryDelayMs(attempt, BATTLE_LOG_SYNC_BASE_RETRY_MS));
                }
            }

            if (typeof payload === "undefined") {
                throw (lastErr || new Error("Failed to sync from /battle_log"));
            }

            localStorage.setItem(BATTLE_LOG_STORAGE_KEY, JSON.stringify(payload ?? null));
            setBattleLogSourceMeta({
                type: "live_sync",
                label: "Source: Live Sync",
                loadedAt: Date.now()
            });
            setBattleLogUploadStatus(`Synced @ ${new Date().toLocaleTimeString()}`, false);
            renderBattleLogView(true);
        } catch (err) {
            console.error("Failed to sync battle logs from /battle_log", err);
            setBattleLogUploadStatus(`Sync failed: ${err && err.message ? err.message : String(err)}`, true);
        } finally {
            syncBattleLogsInFlight = false;
        }
    }

    function getEnumList(kind) {
        const adapter = getActiveBattleLogRomAdapter();
        if (adapter && typeof adapter.getEnumList === "function") {
            const adapterEnumList = adapter.getEnumList(kind);
            if (adapterEnumList) return adapterEnumList;
        }

        if (kind === "species" && Array.isArray(window.sav_pok_names)) return window.sav_pok_names;
        if (kind === "move" && Array.isArray(window.sav_move_names)) return window.sav_move_names;
        if (kind === "item" && Array.isArray(window.sav_item_names)) return window.sav_item_names;
        if (kind === "ability" && Array.isArray(window.sav_abilities)) return window.sav_abilities;
        return null;
    }

    function decodeEnumId(value, kind) {
        if (!Number.isInteger(value)) return value;

        const list = getEnumList(kind);
        if (!list || value < 0 || value >= list.length) return value;

        const decoded = list[value];
        if (typeof decoded !== "string") return value;

        const trimmed = decoded.trim();
        if (!trimmed || trimmed === "???" || /^-+$/.test(trimmed)) {
            return BATTLE_LOG_ID_PLACEHOLDERS[kind] || value;
        }

        return decoded;
    }

    function decodeNatureId(natureId, adapter) {
        if (!Number.isInteger(natureId)) return natureId;
        const natureList = adapter && typeof adapter.getNatureList === "function"
            ? (adapter.getNatureList() || [])
            : [];
        if (natureId < 0 || natureId >= natureList.length) {
            return natureId;
        }
        return natureList[natureId] || natureId;
    }

    function decodeMoveId(moveId) {
        const decoded = decodeEnumId(moveId, "move");
        return typeof decoded === "string" ? getBattleLogMoveDisplayName(decoded) : decoded;
    }

    function decodeBattleLogRecordIds(record) {
        if (!record || typeof record !== "object") return record;

        const cloned = JSON.parse(JSON.stringify(record));
        const type = cloned.type;
        const adapter = getActiveBattleLogRomAdapter();

        if (type === "session_start" && Array.isArray(cloned.pParty)) {
            cloned.pParty = cloned.pParty.map((mon) => {
                if (!mon || typeof mon !== "object") return mon;

                const nextMon = { ...mon };
                const speciesId = Number(nextMon.species);
                nextMon.species = decodeEnumId(speciesId, "species");
                nextMon.heldItem = decodeEnumId(nextMon.heldItem, "item");
                if (Number.isInteger(nextMon.natureId)) {
                    nextMon.nature = decodeNatureId(nextMon.natureId, adapter);
                }

                if (adapter && adapter.id === "platinum") {
                    nextMon.ability = resolvePlatinumAbilityNameForBattleLog(
                        speciesId,
                        nextMon.ability,
                        nextMon.abilitySlot
                    );
                } else {
                    nextMon.ability = decodeEnumId(nextMon.ability, "ability");
                }

                if (Array.isArray(nextMon.moves)) {
                    nextMon.moves = nextMon.moves.map((moveId) => decodeMoveId(moveId));
                }

                return nextMon;
            });
        } else if (type === "pKo" || type === "aiKo") {
            cloned.pSpecies = decodeEnumId(cloned.pSpecies, "species");
            cloned.aiSpecies = decodeEnumId(cloned.aiSpecies, "species");
            if ("move" in cloned) {
                cloned.move = decodeMoveId(cloned.move);
            }
        }

        return cloned;
    }

    function decodeBattleLogIds(records) {
        if (!Array.isArray(records)) return [];
        return records.map(decodeBattleLogRecordIds);
    }

    function normalizeRecords(input) {
        const parseErrors = [];
        let records = [];

        if (!input) return { records, parseErrors };

        if (Array.isArray(input)) {
            records = decodeBattleLogIds(input.filter((r) => r && typeof r === "object"));
            return { records, parseErrors };
        }

        if (typeof input === "object") {
            if (Array.isArray(input.events)) {
                records = decodeBattleLogIds(input.events.filter((r) => r && typeof r === "object"));
                return { records, parseErrors };
            }
            if (input.battlelog && Array.isArray(input.battlelog.events)) {
                records = decodeBattleLogIds(input.battlelog.events.filter((r) => r && typeof r === "object"));
                return { records, parseErrors };
            }
            records = decodeBattleLogIds([input]);
            return { records, parseErrors };
        }

        if (typeof input !== "string") {
            return { records, parseErrors: ["Unsupported battle log data type"] };
        }

        const trimmed = input.trim();
        if (!trimmed) return { records, parseErrors };

        try {
            const parsed = JSON.parse(trimmed);
            return normalizeRecords(parsed);
        } catch (e) {
            return { records, parseErrors: [`Invalid JSON: ${e.message}`] };
        }
    }

    function extractBattleLogImportPayload(parsed) {
        if (parsed == null) {
            throw new Error("Battle log file is empty");
        }

        if (Array.isArray(parsed)) {
            return parsed;
        }

        if (typeof parsed !== "object") {
            throw new Error("Unsupported battle log file format");
        }

        if (Array.isArray(parsed.events)) {
            return { events: parsed.events };
        }

        if (parsed.battlelog && typeof parsed.battlelog === "object" && Array.isArray(parsed.battlelog.events)) {
            return { battlelog: parsed.battlelog };
        }

        throw new Error("JSON file does not contain battlelog.events");
    }

    async function importBattleLogFromAttemptFile(file) {
        if (!file) {
            return;
        }

        setBattleLogUploadStatus(`Loading ${file.name}...`, false);
        try {
            const text = await file.text();
            if (!text || !text.trim()) {
                throw new Error("Selected file is empty");
            }
            const parsed = JSON.parse(text);
            const payload = extractBattleLogImportPayload(parsed);
            localStorage.setItem(BATTLE_LOG_STORAGE_KEY, JSON.stringify(payload));
            setBattleLogSourceMeta({
                type: "attempt_file",
                fileName: file.name,
                label: `Source: ${file.name}`,
                loadedAt: Date.now()
            });
            setBattleLogUploadStatus(`Loaded ${file.name}`, false);
            renderBattleLogView(true);
        } catch (err) {
            console.error("Failed to import battle log attempt file", err);
            setBattleLogUploadStatus(`Load failed: ${err && err.message ? err.message : String(err)}`, true);
        }
    }

    function groupSessions(records) {
        const sessions = [];
        let current = null;

        records.forEach((record) => {
            const type = record && record.type;

            if (type === "session_start") {
                if (current) {
                    current.incomplete = true;
                    sessions.push(current);
                }
                current = {
                    start: record,
                    events: [],
                    end: null,
                    incomplete: false
                };
                return;
            }

            if (!current) return;

            if (type === "session_end") {
                current.end = record;
                sessions.push(current);
                current = null;
                return;
            }

            current.events.push(record);
        });

        if (current) {
            current.incomplete = true;
            sessions.push(current);
        }

        return sessions;
    }

    function getSessionTrainerId(session) {
        const start = session && session.start ? session.start : null;
        if (!start || typeof start !== "object") return undefined;

        const enemyTrainerIdA = Number(start.enemyTrainerIdA);
        if (Number.isFinite(enemyTrainerIdA) && enemyTrainerIdA > 0) {
            return enemyTrainerIdA;
        }

        const legacyTrainerId = Number(start.trainerId);
        if (Number.isFinite(legacyTrainerId) && legacyTrainerId > 0) {
            return legacyTrainerId;
        }

        return undefined;
    }

    function dedupeSessionsByTrainerId(sessions) {
        const lastSessionIndexByTrainerId = {};

        sessions.forEach((session, index) => {
            const trainerId = getSessionTrainerId(session);
            if (trainerId == null) {
                return;
            }

            lastSessionIndexByTrainerId[String(trainerId)] = index;
        });

        return sessions.filter((session, index) => {
            const trainerId = getSessionTrainerId(session);
            if (trainerId == null) {
                return true;
            }

            return lastSessionIndexByTrainerId[String(trainerId)] === index;
        });
    }

    function parseTrainerNamePreserveTrailingSpace(trainerId) {
        const trainerIdNum = Number(trainerId);
        const fallback = (Number.isFinite(trainerIdNum) && trainerIdNum >= 520 && trainerIdNum <= 537)
            ? "Rival"
            : `Trainer #${trainerId ?? "?"}`;
        const customLeadsMap = getCustomLeadsMap();

        if (!customLeadsMap || typeof customLeadsMap !== "object") {
            return fallback;
        }

        const raw = customLeadsMap[trainerId];
        if (!raw) return fallback;

        const lvlMatch = String(raw).match(/Lvl\s+-?\d+\s+(.+?)\)\[\d+\]\s*$/i);
        if (lvlMatch && lvlMatch[1]) {
            return lvlMatch[1];
        }

        const beforeBracket = String(raw).split("[")[0].trim();
        return beforeBracket || fallback;
    }

    function parseTrainerLeadLevel(trainerId) {
        const customLeadsMap = getCustomLeadsMap();
        if (!customLeadsMap || typeof customLeadsMap !== "object") {
            return 10;
        }

        const raw = customLeadsMap[trainerId];
        if (!raw) return 10;

        const lvlMatch = String(raw).match(/Lvl\s+(-?\d+)/i);
        if (!lvlMatch || typeof lvlMatch[1] === "undefined") {
            return 10;
        }

        const parsed = parseInt(lvlMatch[1], 10);
        return Number.isFinite(parsed) ? parsed : 10;
    }

    function tryParseTrainerLeadLevel(trainerId) {
        const customLeadsMap = getCustomLeadsMap();
        if (!customLeadsMap || typeof customLeadsMap !== "object") {
            return null;
        }

        const raw = customLeadsMap[trainerId];
        if (!raw) return null;

        const lvlMatch = String(raw).match(/Lvl\s+(-?\d+)/i);
        if (!lvlMatch || typeof lvlMatch[1] === "undefined") {
            return null;
        }

        const parsed = parseInt(lvlMatch[1], 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }

    function parseTrainerName(trainerId) {
        return String(parseTrainerNamePreserveTrailingSpace(trainerId)).trim();
    }

    function buildFragTrainerNamePreserveTrailingSpace(trainerId) {
        const parsed = parseTrainerNamePreserveTrailingSpace(trainerId);
        if (String(parsed).startsWith("Trainer #")) {
            return `${parsed} `;
        }
        return parsed;
    }

    function getBattleLogSplitIndexForLevel(level) {
        if (!Number.isFinite(level)) return null;
        if (typeof window.TITLE !== "string" || !window.TITLE) return null;
        if (!window.splitData || !window.splitData[window.TITLE]) return null;

        const splitCfg = window.splitData[window.TITLE];
        const lvlcaps = Array.isArray(splitCfg.lvls) ? splitCfg.lvls : null;
        const types = Array.isArray(splitCfg.types) ? splitCfg.types : null;
        if (!lvlcaps || !types || !lvlcaps.length) return null;

        let splitIndex = null;
        for (let i = 0; i < lvlcaps.length; i += 1) {
            const maxCap = Number(lvlcaps[i]);
            const minCap = i > 0 ? Number(lvlcaps[i - 1]) : 0;
            if (!Number.isFinite(maxCap)) continue;

            if (level <= maxCap && level > minCap) {
                splitIndex = i;
                break;
            }

            if (i === lvlcaps.length - 1 && level > minCap) {
                splitIndex = i;
            }
        }

        return splitIndex;
    }

    function getSessionPartyHighestLevel(session) {
        const start = session && session.start;
        if (!start || typeof start !== "object") {
            return null;
        }

        const direct = Number(start.pPartyHighestLevel);
        if (Number.isFinite(direct) && direct > 0) {
            return direct;
        }

        const party = Array.isArray(start.pParty) ? start.pParty : [];
        let highest = 0;
        party.forEach((mon) => {
            const level = Number(mon && mon.level);
            if (Number.isFinite(level) && level > highest) {
                highest = level;
            }
        });
        return highest > 0 ? highest : null;
    }

    function getBattleLogSessionLevel(session) {
        const trainerId = getSessionTrainerId(session);
        const trainerLeadLevel = tryParseTrainerLeadLevel(trainerId);
        if (Number.isFinite(trainerLeadLevel) && trainerLeadLevel > 0) {
            return trainerLeadLevel;
        }
        return getSessionPartyHighestLevel(session);
    }

    function getBattleLogSessionSplitIndex(session) {
        return getBattleLogSplitIndexForLevel(getBattleLogSessionLevel(session));
    }

    function getBattleLogSessionSplitTypeClass(session) {
        const splitIndex = getBattleLogSessionSplitIndex(session);
        if (splitIndex == null) return "";
        if (typeof window.TITLE !== "string" || !window.TITLE) return "";
        if (!window.splitData || !window.splitData[window.TITLE]) return "";
        const splitCfg = window.splitData[window.TITLE];
        const types = Array.isArray(splitCfg.types) ? splitCfg.types : null;
        if (!types || typeof types[splitIndex] === "undefined") return "";
        const typeName = types[splitIndex];
        return typeName ? `${String(typeName)}-type` : "";
    }

    function getBattleLogSplitTabsConfig() {
        if (typeof window.TITLE !== "string" || !window.TITLE) return null;
        if (!window.splitData || !window.splitData[window.TITLE]) return null;

        const splitCfg = window.splitData[window.TITLE];
        const titlesRaw = splitCfg && splitCfg.titles;
        if (!titlesRaw) return null;

        const entries = [];
        if (Array.isArray(titlesRaw)) {
            titlesRaw.forEach((label, idx) => {
                if (typeof label !== "undefined" && label !== null && String(label).trim() !== "") {
                    entries.push({ index: idx, label: String(label) });
                }
            });
        } else if (typeof titlesRaw === "object") {
            Object.keys(titlesRaw)
                .sort((a, b) => Number(a) - Number(b))
                .forEach((key) => {
                    const idx = Number(key);
                    const label = titlesRaw[key];
                    if (Number.isFinite(idx) && typeof label !== "undefined" && label !== null && String(label).trim() !== "") {
                        entries.push({ index: idx, label: String(label) });
                    }
                });
        }

        return entries.length ? entries : null;
    }

    function renderBattleLogSplitTabs() {
        const container = document.getElementById("battle-log-split-tabs");
        if (!container) return;

        const splitTabs = getBattleLogSplitTabsConfig();
        if (!splitTabs) {
            container.innerHTML = "";
            return;
        }

        if (activeBattleLogSplitFilter !== "all") {
            const activeIndex = Number(activeBattleLogSplitFilter);
            const exists = splitTabs.some((tab) => tab.index === activeIndex);
            if (!exists) activeBattleLogSplitFilter = "all";
        }

        let html = `<div class="battle-log-split-tab${activeBattleLogSplitFilter === "all" ? " active" : ""}" data-battle-log-split="all">All Splits</div>`;
        html += splitTabs.map((tab) => {
            const isActive = Number(activeBattleLogSplitFilter) === Number(tab.index);
            return `<div class="battle-log-split-tab${isActive ? " active" : ""}" data-battle-log-split="${escHtml(tab.index)}">${escHtml(tab.label)}</div>`;
        }).join("");
        container.innerHTML = html;
    }

    function rebuildEncounterFragsFromBattleLog(sessions) {
        if (!window.encounters || typeof window.encounters !== "object") {
            return;
        }

        function resolveEncounterSpeciesForBattleLogMon(species) {
            if (!species || !window.encounters || typeof window.encounters !== "object") {
                return null;
            }

            if (window.encounters[species]) {
                return species;
            }

            const evoMap = (window.evoData && typeof window.evoData === "object") ? window.evoData : null;
            if (!evoMap) {
                return null;
            }

            let speciesKey = species;
            let evoEntry = evoMap[speciesKey];

            if (!evoEntry && String(species).includes("-")) {
                speciesKey = String(species).split("-")[0];
                evoEntry = evoMap[speciesKey];
            }

            if (!evoEntry || !evoEntry.anc || !evoMap[evoEntry.anc]) {
                return null;
            }

            const evolutionChain = [evoEntry.anc].concat(evoMap[evoEntry.anc].evos || []);
            const sourceIndex = evolutionChain.indexOf(speciesKey);
            if (sourceIndex < 0) {
                return null;
            }

            for (let i = evolutionChain.length - 1; i > sourceIndex; i -= 1) {
                const evolvedSpecies = evolutionChain[i];
                if (window.encounters[evolvedSpecies]) {
                    return evolvedSpecies;
                }
            }

            return null;
        }

        const speciesPresent = {};

        sessions.forEach((session) => {
            const party = Array.isArray(session && session.start && session.start.pParty) ? session.start.pParty : [];
            party.forEach((mon) => {
                const species = resolveEncounterSpeciesForBattleLogMon(mon && mon.species);
                if (species) {
                    speciesPresent[species] = true;
                }
            });
        });

        for (const species of Object.keys(speciesPresent)) {
            const enc = window.encounters[species];
            if (!enc) continue;
            enc.frags = [];
            enc.fragCount = 0;
            enc.prevoFragCount = 0;
        }

        sessions.forEach((session) => {
            const trainerId = getSessionTrainerId(session);
            const trainerNameWithSpace = buildFragTrainerNamePreserveTrailingSpace(trainerId);
            const sessionLevel = getBattleLogSessionLevel(session);
            const trainerLeadLevel = Number.isFinite(sessionLevel) ? sessionLevel : 10;
            const events = Array.isArray(session && session.events) ? session.events : [];

            events.forEach((event) => {
                if (event && event.type === "aiKo") {
                    const aiKoSpecies = event.pSpecies;
                    if (aiKoSpecies && window.encounters[aiKoSpecies]) {
                        window.encounters[aiKoSpecies].alive = false;
                    }
                    return;
                }

                if (!event || event.type !== "pKo") return;
                const pSpecies = resolveEncounterSpeciesForBattleLogMon(event.pSpecies);
                const aiSpecies = event.aiSpecies || "Unknown";
                if (!pSpecies || !window.encounters[pSpecies]) return;

                const fragEntry = `${aiSpecies} (Lvl ${trainerLeadLevel} ${trainerNameWithSpace})`;
                const fragList = Array.isArray(window.encounters[pSpecies].frags) ? window.encounters[pSpecies].frags : [];
                if (fragList.indexOf(fragEntry) === -1) {
                    fragList.push(fragEntry);
                    window.encounters[pSpecies].frags = fragList;
                    window.encounters[pSpecies].fragCount = fragList.length;
                }
            });
        });

        for (const species of Object.keys(speciesPresent)) {
            if (!window.encounters[species]) continue;
            try {
                if (typeof window.prevoData === "function") {
                    const prevo = window.prevoData(species, window.encounters);
                    window.encounters[species].prevoFragCount = Number(prevo && prevo[0]) || 0;
                } else {
                    window.encounters[species].prevoFragCount = 0;
                }
            } catch (e) {
                window.encounters[species].prevoFragCount = 0;
            }
        }

        try {
            localStorage.encounters = JSON.stringify(window.encounters);
        } catch (e) {
            console.error("Failed to persist rebuilt encounter frags from battle log", e);
        }

        if (typeof window.refreshTables === "function") {
            try {
                window.refreshTables();
            } catch (e) {
                console.error("Failed to refresh fragsheet after battle log rebuild", e);
            }
        }
    }

    function getKoLookup(session) {
        const team = Array.isArray(session.start && session.start.pParty) ? session.start.pParty : [];
        const firstSpeciesIndex = {};
        const koLookup = {};

        team.forEach((mon, idx) => {
            const key = String(mon && mon.species || "").toLowerCase();
            if (key && typeof firstSpeciesIndex[key] === "undefined") {
                firstSpeciesIndex[key] = idx;
            }
        });

        session.events.forEach((event) => {
            if (event.type !== "aiKo") return;
            const key = String(event.pSpecies || "").toLowerCase();
            const idx = firstSpeciesIndex[key];
            if (typeof idx !== "undefined") {
                koLookup[idx] = true;
            }
        });

        return koLookup;
    }

    function renderTeam(session) {
        const team = Array.isArray(session.start && session.start.pParty) ? session.start.pParty : [];
        if (!team.length) {
            return '<div class="battle-team-empty">No player party snapshot found for this battle.</div>';
        }

        const koLookup = getKoLookup(session);
        const cards = team.map((mon, idx) => {
            const moves = Array.isArray(mon.moves) ? mon.moves : [];
            const moveList = moves.length
                ? `<ul class="battle-team-moves">${moves.map((move) => `<li>${escHtml(getBattleLogMoveDisplayName(move))}</li>`).join("")}</ul>`
                : "";

            return `
                <div class="battle-team-card${koLookup[idx] ? " ko" : ""}">
                    <div class="battle-team-head">
                        <img src="${spritePath(mon.species)}" alt="${escHtml(mon.species)}" onerror="this.style.visibility='hidden'">
                        <div class="battle-team-species">${escHtml(mon.species || "Unknown")}</div>
                    </div>
                    <div class="battle-team-lines"><span class="label">Ability:</span> ${escHtml(mon.ability || "Unknown")}</div>
                    <div class="battle-team-lines"><span class="label">Nature:</span> ${escHtml(mon.nature || "Unknown")}</div>
                    <div class="battle-team-lines"><span class="label">Item:</span> ${escHtml(mon.heldItem || "None")}</div>
                    ${moveList}
                </div>
            `;
        }).join("");

        return `<div class="battle-team">${cards}</div>`;
    }

    function renderEvents(session) {
        const pKos = session.events.filter((event) => event.type === "pKo");

        if (!pKos.length) {
            return `
                <div class="battle-events">
                    <div class="battle-events-header">
                        <div>You</div>
                        <div>Enemy KO'd</div>
                    </div>
                    <div class="battle-events-empty">No player KO events recorded in this session.</div>
                </div>
            `;
        }

        const rows = pKos.map((event) => {
            return `
                <div class="battle-event-row">
                    <div>
                        <div class="battle-event-cell">
                            <img src="${spritePath(event.pSpecies)}" alt="${escHtml(event.pSpecies)}" onerror="this.style.visibility='hidden'">
                            <div>
                                <div class="battle-event-main">${escHtml(event.pSpecies || "Unknown")}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="battle-event-cell">
                            <img src="${spritePath(event.aiSpecies)}" alt="${escHtml(event.aiSpecies)}" onerror="this.style.visibility='hidden'">
                            <div>
                                <div class="battle-event-main">${escHtml(event.aiSpecies || "Unknown")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        return `
            <div class="battle-events">
                <div class="battle-events-header">
                    <div>You</div>
                    <div>Enemy KO'd</div>
                </div>
                ${rows}
            </div>
        `;
    }

    function getPlayerDeathCount(session) {
        const uniqueDeaths = new Set();
        const events = Array.isArray(session && session.events) ? session.events : [];

        events.forEach((event) => {
            if (!event || event.type !== "aiKo") return;

            if (typeof event.pSlot === "number") {
                uniqueDeaths.add(`slot:${event.pSlot}`);
                return;
            }

            if (event.pSpecies) {
                uniqueDeaths.add(`species:${String(event.pSpecies).toLowerCase()}`);
            }
        });

        return uniqueDeaths.size;
    }

    function renderSession(session, index) {
        const trainerId = getSessionTrainerId(session);
        const trainerName = parseTrainerName(trainerId);
        const splitTypeClass = getBattleLogSessionSplitTypeClass(session);
        const deathCount = getPlayerDeathCount(session);
        const deathSummaryClass = deathCount > 0 ? "deaths" : "deathless";
        const deathSummaryText = deathCount > 0 ? `${deathCount} Deaths` : "Deathless";

        return `
            <div class="battle-session" data-battle-index="${index}">
                <div class="battle-session-header${splitTypeClass ? ` ${escHtml(splitTypeClass)}` : ""}" role="button" tabindex="0" aria-expanded="false">
                    <div class="battle-session-title">Vs ${escHtml(trainerName)}</div>
                    <div class="battle-session-meta ${deathSummaryClass}">${escHtml(deathSummaryText)}</div>
                </div>
                <div class="battle-session-body">
                    ${renderTeam(session)}
                    ${renderEvents(session)}
                </div>
            </div>
        `;
    }

    function getEncounterMiniRows() {
        if (!window.encounters || typeof window.encounters !== "object") {
            return [];
        }

        const rows = [];
        for (const species of Object.keys(window.encounters)) {
            const enc = window.encounters[species];
            if (!enc || typeof enc !== "object") continue;
            if (enc.hide === true) continue;

            const kos = Number(enc.fragCount) || 0;
            rows.push({
                species,
                kos
            });
        }

        rows.sort((a, b) => {
            if (b.kos !== a.kos) return b.kos - a.kos;
            return String(a.species).localeCompare(String(b.species));
        });

        rows.forEach((row, idx) => {
            row.rank = idx + 1;
        });

        return rows;
    }

    function renderBattleLogFragsheetPanel() {
        const panel = document.getElementById("battle-log-fragsheet-panel");
        if (!panel) return;

        const rows = getEncounterMiniRows();
        if (!rows.length) {
            panel.innerHTML = `
                <div class="battle-log-mini-title">Battle Log Fragsheet</div>
                <div class="battle-log-empty battle-log-mini-empty">No encounter data available.</div>
            `;
            return;
        }

        const bodyRows = rows.map((row) => {
            const rankClass = row.rank === 1 ? " rank-1" : row.rank === 2 ? " rank-2" : row.rank === 3 ? " rank-3" : "";
            return `
                <div class="battle-log-mini-row">
                    <div class="battle-log-mini-rank${rankClass}">${escHtml(row.rank)}</div>
                    <div class="battle-log-mini-species">${escHtml(row.species)}</div>
                    <div class="battle-log-mini-img-wrap">
                        <img src="${spritePath(row.species)}" alt="${escHtml(row.species)}" onerror="this.style.visibility='hidden'">
                    </div>
                    <div class="battle-log-mini-kos">${escHtml(row.kos)}</div>
                </div>
            `;
        }).join("");

        panel.innerHTML = `
            <div class="battle-log-mini-title">Battle Log Fragsheet</div>
            <div class="battle-log-mini-header">
                <div>#</div>
                <div>Species</div>
                <div>Img</div>
                <div style="text-align:right;">KOs</div>
            </div>
            ${bodyRows}
        `;
    }

    function renderBattleLogView(force) {
        const container = document.getElementById("battle-log-container");
        if (!container) return;

        const currentBattleLogRaw = getBattleLogStorageFingerprint();
        const currentCustomLeadsRaw = localStorage.getItem("customLeads");
        const hasInputChanged =
            currentBattleLogRaw !== lastRenderedBattleLogRaw ||
            currentCustomLeadsRaw !== lastRenderedCustomLeadsRaw;

        if (!force && !hasInputChanged) {
            return;
        }

        const resolved = resolveBattleLogSource();
        if (!resolved.data) {
            lastRenderedBattleLogRaw = currentBattleLogRaw;
            lastRenderedCustomLeadsRaw = currentCustomLeadsRaw;
            container.innerHTML = '<div class="battle-log-empty">No battle log data found.</div>';
            renderBattleLogFragsheetPanel();
            return;
        }

        const { records, parseErrors } = normalizeRecords(resolved.data);
        const sessions = dedupeSessionsByTrainerId(groupSessions(records));
        rebuildEncounterFragsFromBattleLog(sessions);
        renderBattleLogFragsheetPanel();
        renderBattleLogSplitTabs();

        const filteredSessions = sessions.filter((session) => {
            if (activeBattleLogSplitFilter === "all") return true;
            const splitIndex = getBattleLogSessionSplitIndex(session);
            return splitIndex != null && Number(splitIndex) === Number(activeBattleLogSplitFilter);
        });

        if (!sessions.length) {
            lastRenderedBattleLogRaw = currentBattleLogRaw;
            lastRenderedCustomLeadsRaw = currentCustomLeadsRaw;
            container.innerHTML = `
                <div class="battle-log-empty">No battle sessions found in battle log data.</div>
                ${parseErrors.length ? `<div class="battle-log-note">${escHtml(parseErrors.length)} parse error(s) ignored.</div>` : ""}
            `;
            return;
        }

        let html = "";
        if (resolved.source) {
            html += `<div class="battle-log-note">${escHtml(resolved.source)}</div>`;
        }
        html += `<div class="battle-log-note">${escHtml(filteredSessions.length)} battle(s)${activeBattleLogSplitFilter === "all" ? "" : ` (filtered)`}</div>`;
        if (parseErrors.length) {
            html += `<div class="battle-log-note">${escHtml(parseErrors.length)} parse error(s) encountered while parsing battle log JSON.</div>`;
        }
        if (!filteredSessions.length) {
            html += `<div class="battle-log-empty">No battles found for the selected split filter.</div>`;
        } else {
            html += filteredSessions.map(renderSession).join("");
        }
        container.innerHTML = html;
        lastRenderedBattleLogRaw = currentBattleLogRaw;
        lastRenderedCustomLeadsRaw = currentCustomLeadsRaw;
    }

    function getBattleLogSpeciesBattleCounts() {
        const resolved = resolveBattleLogSource();
        if (!resolved.data) {
            return {};
        }

        const { records } = normalizeRecords(resolved.data);
        const sessions = dedupeSessionsByTrainerId(groupSessions(records));
        const speciesBattleCounts = {};

        sessions.forEach((session) => {
            const speciesSeenThisBattle = {};
            const party = Array.isArray(session && session.start && session.start.pParty) ? session.start.pParty : [];

            party.forEach((mon) => {
                const species = mon && mon.species ? String(mon.species) : "";
                if (species) {
                    speciesSeenThisBattle[species] = true;
                }
            });

            if (!Object.keys(speciesSeenThisBattle).length) {
                const events = Array.isArray(session && session.events) ? session.events : [];
                events.forEach((event) => {
                    const species = event && event.pSpecies ? String(event.pSpecies) : "";
                    if (species) {
                        speciesSeenThisBattle[species] = true;
                    }
                });
            }

            Object.keys(speciesSeenThisBattle).forEach((species) => {
                speciesBattleCounts[species] = (speciesBattleCounts[species] || 0) + 1;
            });
        });

        return speciesBattleCounts;
    }

    function setViewMode(mode) {
        if (mode === "battle-log" && !isBattleLogEnabledForTitle()) {
            mode = "fragsheet";
        }

        const isBattleLog = mode === "battle-log";
        document.body.classList.toggle("battle-log-mode", isBattleLog);

        $(".view-tab").removeClass("active");
        $(`.view-tab[data-view="${mode}"]`).addClass("active");

        if (isBattleLog) {
            renderBattleLogSplitTabs();
            renderBattleLogView(true);
            return;
        }

        if (window.gridApi && typeof window.gridApi.sizeColumnsToFit === "function") {
            try {
                window.gridApi.sizeColumnsToFit();
            } catch (e) {
                // Grid may not be ready yet.
            }
        }
    }

    function bindUi() {
        if (battleLogUiInitialized) {
            return;
        }
        battleLogUiInitialized = true;

        $(document).on("click", ".view-tab", function () {
            setViewMode($(this).attr("data-view"));
        });

        $(document).on("click", ".battle-session-header", function () {
            const $session = $(this).closest(".battle-session");
            const nextExpanded = !$session.hasClass("expanded");
            $session.toggleClass("expanded", nextExpanded);
            $(this).attr("aria-expanded", nextExpanded ? "true" : "false");
        });

        $(document).on("keydown", ".battle-session-header", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                $(this).trigger("click");
            }
        });

        window.addEventListener("storage", function (event) {
            if (!event.key) return;
            if (event.key !== BATTLE_LOG_STORAGE_KEY && event.key !== "customLeads") return;
            if (document.body.classList.contains("battle-log-mode")) {
                renderBattleLogView(false);
            }
        });

        let lastBattleLogRaw = getBattleLogStorageFingerprint();
        let lastCustomLeadsRaw = localStorage.getItem("customLeads");
        let lastSyncLuaRaw = localStorage.getItem("syncLua");
        setInterval(function () {
            const nextBattleLogRaw = getBattleLogStorageFingerprint();
            const nextCustomLeadsRaw = localStorage.getItem("customLeads");
            const nextSyncLuaRaw = localStorage.getItem("syncLua");
            const changed =
                nextBattleLogRaw !== lastBattleLogRaw ||
                nextCustomLeadsRaw !== lastCustomLeadsRaw ||
                nextSyncLuaRaw !== lastSyncLuaRaw;
            if (!changed) return;

            lastBattleLogRaw = nextBattleLogRaw;
            lastCustomLeadsRaw = nextCustomLeadsRaw;
            lastSyncLuaRaw = nextSyncLuaRaw;
            applyBattleLogTabVisibility();

            if (document.body.classList.contains("battle-log-mode")) {
                renderBattleLogView(false);
            }
        }, 2000);

        const syncBattleLogBtn = document.getElementById("sync-battle-log");
        if (syncBattleLogBtn) {
            syncBattleLogBtn.textContent = "Sync";
            syncBattleLogBtn.addEventListener("click", function () {
                syncBattleLogsFromLuaUpdate();
            });
        }

        const battleLogFileInput = document.getElementById("battle-log-file-input");
        const loadBattleLogFileBtn = document.getElementById("load-battle-log-file");
        if (loadBattleLogFileBtn && battleLogFileInput) {
            loadBattleLogFileBtn.addEventListener("click", function () {
                battleLogFileInput.click();
            });
            battleLogFileInput.addEventListener("change", function (event) {
                const file = event && event.target && event.target.files && event.target.files[0]
                    ? event.target.files[0]
                    : null;
                importBattleLogFromAttemptFile(file);
                battleLogFileInput.value = "";
            });
        }

        $(document).on("click", ".battle-log-split-tab", function () {
            const next = $(this).attr("data-battle-log-split");
            activeBattleLogSplitFilter = next === "all" ? "all" : parseInt(next, 10);
            renderBattleLogSplitTabs();
            if (document.body.classList.contains("battle-log-mode")) {
                renderBattleLogView(true);
            }
        });

        window.renderBattleLogView = renderBattleLogView;
        window.setFragsheetViewMode = setViewMode;
    }

    function initializeBattleLogUi() {
        bindUi();
        logActiveBattleLogRomAdapter("DOMContentLoaded");
        applyBattleLogTabVisibility();
        if (document.getElementById("main-view-tabs")) {
            setViewMode("fragsheet");
            return;
        }
        if (isBattleLogEnabledForTitle()) {
            setViewMode("battle-log");
        } else {
            setViewMode("fragsheet");
        }
    }

    window.ensureBattleLogUiInitialized = initializeBattleLogUi;
    window.setEmbeddedFragsheetMode = function (mode) {
        initializeBattleLogUi();
        setViewMode(mode);
    };
    window.isBattleLogEnabledForTitle = isBattleLogEnabledForTitle;
    window.getBattleLogSpeciesBattleCounts = getBattleLogSpeciesBattleCounts;

    document.addEventListener("DOMContentLoaded", initializeBattleLogUi);
})();
