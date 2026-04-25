(function () {
    const BOX_IV_STATS = [
        { key: "hp", label: "HP" },
        { key: "at", label: "Atk" },
        { key: "df", label: "Def" },
        { key: "sa", label: "SpA" },
        { key: "sd", label: "SpD" },
        { key: "sp", label: "Spe" }
    ];
    const BOX_BASE_STAT_MAX = 255;
    const BOX_TYPE_FILTERS = [
        "normal", "fire", "water", "electric", "grass", "ice",
        "fighting", "poison", "ground", "flying", "psychic", "bug",
        "rock", "ghost", "dragon", "dark", "steel", "fairy"
    ];
    const BOX_SORT_OPTIONS = [
        { key: "frags", label: "Frags" },
        { key: "battles", label: "Battles" },
        { key: "bst", label: "BST" },
        { key: "hp", label: "HP" },
        { key: "at", label: "Atk" },
        { key: "df", label: "Def" },
        { key: "sa", label: "SpA" },
        { key: "sd", label: "SpD" },
        { key: "sp", label: "Spe" }
    ];
    const NATURE_STAT_KEY_MAP = {
        hp: "hp",
        at: "atk",
        df: "def",
        sa: "spa",
        sd: "spd",
        sp: "spe"
    };
    const OFFENSIVE_IV_KEYS = ["at", "sa", "sp"];
    const DEFENSIVE_IV_KEYS = ["hp", "df", "sd"];
    const boxViewState = {
        search: "",
        sortKey: "frags",
        activeTypeSlugs: new Set()
    };
    const OFFENSIVE_IV_DISTRIBUTION = buildIvSumDistribution(OFFENSIVE_IV_KEYS.length);
    const DEFENSIVE_IV_DISTRIBUTION = buildIvSumDistribution(DEFENSIVE_IV_KEYS.length);
    let lastRenderedFingerprint = null;
    let boxViewWatcherStarted = false;
    let boxControlsInitialized = false;

    function buildIvSumDistribution(statCount) {
        const maxSum = statCount * 31;
        let distribution = new Array(maxSum + 1).fill(0);
        distribution[0] = 1;

        for (let statIndex = 0; statIndex < statCount; statIndex += 1) {
            const next = new Array(maxSum + 1).fill(0);
            for (let sum = 0; sum < distribution.length; sum += 1) {
                const current = distribution[sum];
                if (!current) {
                    continue;
                }
                for (let iv = 0; iv <= 31; iv += 1) {
                    next[sum + iv] += current;
                }
            }
            distribution = next;
        }

        const betterCountsBySum = new Array(distribution.length).fill(0);
        let runningBetter = 0;
        for (let sum = distribution.length - 1; sum >= 0; sum -= 1) {
            betterCountsBySum[sum] = runningBetter;
            runningBetter += distribution[sum];
        }

        return {
            total: Math.pow(32, statCount),
            betterCountsBySum
        };
    }

    function safeJsonParse(raw, fallback) {
        try {
            return raw ? JSON.parse(raw) : fallback;
        } catch (_err) {
            return fallback;
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalizeSlug(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/♀/g, "-f")
            .replace(/♂/g, "-m")
            .replace(/[’']/g, "")
            .replace(/\./g, "")
            .replace(/:/g, "-")
            .replace(/[\s_]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function titleCaseSlug(value) {
        return String(value || "")
            .split("-")
            .map((part) => part ? (part.charAt(0).toUpperCase() + part.slice(1)) : "")
            .join(" ");
    }

    function getCurrentBoxViewFingerprint() {
        return [
            localStorage.getItem("customsets") || "",
            localStorage.getItem("encounters") || "",
            localStorage.getItem("battleLogs") || "",
            localStorage.getItem("battleLogImportantTrainersOnly") || ""
        ].join("::");
    }

    function getCustomSetsMap() {
        if (window.customSets && typeof window.customSets === "object") {
            return window.customSets;
        }
        return safeJsonParse(localStorage.customsets, {});
    }

    function getEncountersMap() {
        if (window.encounters && typeof window.encounters === "object") {
            return window.encounters;
        }
        return safeJsonParse(localStorage.encounters, {});
    }

    function getBattleCountMap() {
        if (typeof window.getBattleLogSpeciesBattleCounts === "function") {
            try {
                const counts = window.getBattleLogSpeciesBattleCounts();
                return counts && typeof counts === "object" ? counts : {};
            } catch (_err) {
                return {};
            }
        }
        return {};
    }

    function getSpeciesTypes(speciesName) {
        const species = window.pokedex && window.pokedex[speciesName];
        return species && Array.isArray(species.types) ? species.types.filter(Boolean) : [];
    }

    function getSpeciesBaseStats(speciesName) {
        const baseStats = window.pokedex && window.pokedex[speciesName] && window.pokedex[speciesName].bs
            ? window.pokedex[speciesName].bs
            : {};
        return {
            hp: Number(baseStats.hp) || 0,
            at: Number(baseStats.at) || 0,
            df: Number(baseStats.df) || 0,
            sa: Number(baseStats.sa) || 0,
            sd: Number(baseStats.sd) || 0,
            sp: Number(baseStats.sp) || 0
        };
    }

    function getBattleLogMoveType(moveName) {
        const activeGen = typeof window.gen === "number" ? window.gen : 8;
        const moveId = typeof window.cleanString === "function"
            ? window.cleanString(moveName)
            : normalizeSlug(moveName).replace(/-/g, "");
        const moveData = window.MOVES_BY_ID && window.MOVES_BY_ID[activeGen] ? window.MOVES_BY_ID[activeGen][moveId] : null;
        return moveData && moveData.type ? moveData.type : "Normal";
    }

    function getEncounterFragCount(speciesName, encountersMap) {
        const encounters = encountersMap && typeof encountersMap === "object" ? encountersMap : {};
        const encounter = encounters[speciesName];
        if (!encounter) {
            return 0;
        }

        const directFrags = Array.isArray(encounter.frags) ? encounter.frags : [];
        let mergedFrags = directFrags.slice();

        if (typeof window.prevoData === "function") {
            try {
                const prevo = window.prevoData(speciesName, encounters);
                const prevoFrags = Array.isArray(prevo && prevo[1]) ? prevo[1] : [];
                mergedFrags = [...new Set(mergedFrags.concat(prevoFrags))];
            } catch (_err) {
            }
        }

        return mergedFrags.length || Number(encounter.fragCount) || 0;
    }

    function getDisplayName(speciesName, setData) {
        if (setData && setData.isEgg) {
            return `${speciesName} (Egg)`;
        }
        const nickname = setData && setData.nn ? String(setData.nn).trim() : "";
        if (nickname && nickname !== speciesName) {
            return nickname;
        }
        return speciesName;
    }

    function getGenderMarkup(setData) {
        const gender = setData && setData.gender ? String(setData.gender).trim().toUpperCase() : "";
        if (gender === "M") {
            return '<span class="box-card-gender gender-male">♂</span>';
        }
        if (gender === "F") {
            return '<span class="box-card-gender gender-female">♀</span>';
        }
        return "";
    }

    function getItemSpriteMarkup(itemName) {
        if (!itemName) {
            return "";
        }
        const itemSlug = String(itemName)
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[’']/g, "")
            .replace(/[.:]/g, "");
        return `<img class="box-card-item" src="./img/items/${escapeHtml(itemSlug)}.png" alt="${escapeHtml(itemName)}" onerror="this.style.display='none'">`;
    }

    function getAbilityDisplayText(setData) {
        const abilityName = String(setData && setData.ability || "Unknown").trim() || "Unknown";
        const abilitySlotId = Number(setData && setData.abilitySlotId);
        if (gameGen == 4 && Number.isInteger(abilitySlotId) && abilitySlotId > 0) {
            return `${abilityName} (${abilitySlotId})`;
        }
        return abilityName;
    }

    function getTypeIconMarkup(typeName, extraClass) {
        if (!typeName) {
            return "";
        }
        const slug = normalizeSlug(typeName);
        const classSuffix = extraClass ? ` ${extraClass}` : "";
        return `<span class="box-type-icon type-icon-${escapeHtml(slug)}${classSuffix}" aria-hidden="true" title="${escapeHtml(typeName)}"></span>`;
    }

    function getMoveMarkup(moveName) {
        if (!moveName) {
            return `<div class="box-move box-move-empty">-</div>`;
        }
        const moveType = getBattleLogMoveType(moveName);
        const moveTypeSlug = normalizeSlug(moveType);
        return `
            <div class="box-move ${escapeHtml(moveTypeSlug)}-type">
                ${getTypeIconMarkup(moveType, "box-move-type-icon")}
                <span>${escapeHtml(moveName)}</span>
            </div>
        `;
    }

    function getIvValue(setData, statKey) {
        const ivs = setData && setData.ivs ? setData.ivs : null;
        const value = ivs && ivs[statKey] != null ? Number(ivs[statKey]) : 31;
        return Number.isFinite(value) ? value : 31;
    }

    function getNatureModifiers(setData) {
        const natureName = setData && setData.nature ? String(setData.nature).trim() : "";
        const natureMap = window.natMods && typeof window.natMods === "object" ? window.natMods : null;
        const natureInfo = natureMap && natureMap[natureName] ? natureMap[natureName] : null;
        return {
            plus: natureInfo && natureInfo.plus ? String(natureInfo.plus) : "",
            minus: natureInfo && natureInfo.minus ? String(natureInfo.minus) : ""
        };
    }

    function getIvTopPercent(setData, keys, distribution) {
        const ivTotal = keys.reduce((sum, key) => sum + getIvValue(setData, key), 0);
        const betterCounts = distribution.betterCountsBySum[ivTotal] || 0;
        return (betterCounts / distribution.total) * 100;
    }

    function getIvPercentileMarkup(label, percentileValue) {
        const isTopHalf = percentileValue <= 50;
        const className = isTopHalf ? "good" : "bad";
        const descriptor = isTopHalf ? "Top" : "Bottom";
        const displayValue = isTopHalf ? percentileValue : (100 - percentileValue);
        return `
            <div class="box-card-meta">
                <span class="box-iv-percentile ${className}">${descriptor} ${escapeHtml(displayValue.toFixed(1))}% ${escapeHtml(label)}</span>
            </div>
        `;
    }

    function openDexEntryForSpecies(speciesName) {
        if (!speciesName || typeof window.loadDex !== "function") {
            return;
        }
        if (!$("#open-dex:visible, #main-nav-dex:visible").length) {
            return;
        }

        window.loadDex(`pokemon/${normalizeSlug(speciesName)}`);
    }

    function polarPoint(angleDeg, radius, center) {
        const radians = (Math.PI / 180) * angleDeg;
        return {
            x: center + Math.cos(radians) * radius,
            y: center + Math.sin(radians) * radius
        };
    }

    function buildRadarPolygon(values, radius, center, maxValue) {
        const safeMax = Number(maxValue) > 0 ? Number(maxValue) : 31;
        return values.map((value, index) => {
            const normalized = Math.max(0, Math.min(safeMax, Number(value) || 0));
            const point = polarPoint(-90 + index * 60, (normalized / safeMax) * radius, center);
            return `${point.x},${point.y}`;
        }).join(" ");
    }

    function getRadarMarkup(options) {
        const center = 60;
        const radius = 42;
        const stats = Array.isArray(options && options.stats) ? options.stats : BOX_IV_STATS;
        const values = stats.map((stat) => Number(stat && stat.value) || 0);
        const levels = [1, 0.75, 0.5, 0.25];
        const maxValue = Number(options && options.maxValue) > 0 ? Number(options.maxValue) : 31;
        const chartClass = options && options.chartClass ? String(options.chartClass) : "";
        const shapeClass = options && options.shapeClass ? String(options.shapeClass) : "";
        const axisClassName = options && options.axisClassName ? String(options.axisClassName) : "";
        const ariaLabel = options && options.ariaLabel ? String(options.ariaLabel) : "Radar chart";
        const title = options && options.title ? String(options.title) : "";

        const gridPolygons = levels.map((level) => {
            const points = stats.map((_, index) => {
                const point = polarPoint(-90 + index * 60, radius * level, center);
                return `${point.x},${point.y}`;
            }).join(" ");
            return `<polygon class="box-radar-grid" points="${points}"></polygon>`;
        }).join("");

        const axes = stats.map((stat, index) => {
            const axisClass = stat && stat.axisClass ? String(stat.axisClass) : "";
            const point = polarPoint(-90 + index * 60, radius, center);
            const labelPoint = polarPoint(-90 + index * 60, radius + 14, center);
            const valuePoint = polarPoint(-90 + index * 60, radius + 2, center);
            return `
                <g class="box-radar-axis-group ${escapeHtml(axisClassName)} ${escapeHtml(axisClass)}">
                    <line class="box-radar-axis" x1="${center}" y1="${center}" x2="${point.x}" y2="${point.y}"></line>
                    <circle class="box-radar-point" cx="${valuePoint.x}" cy="${valuePoint.y}" r="3"></circle>
                    <text class="box-radar-axis-label" x="${labelPoint.x}" y="${labelPoint.y}">${escapeHtml(stat.value)} ${escapeHtml(stat.label)}</text>
                </g>
            `;
        }).join("");

        return `
            <svg class="box-radar ${escapeHtml(chartClass)}" viewBox="0 0 120 120" aria-label="${escapeHtml(ariaLabel)}">
                <title>${escapeHtml(title)}</title>
                ${gridPolygons}
                ${axes}
                <polygon class="box-radar-shape ${escapeHtml(shapeClass)}" points="${buildRadarPolygon(values, radius, center, maxValue)}"></polygon>
                <circle class="box-radar-center" cx="${center}" cy="${center}" r="2"></circle>
            </svg>
        `;
    }

    function getIvRadarMarkup(setData) {
        const nature = getNatureModifiers(setData);
        const stats = BOX_IV_STATS.map((stat) => {
            const normalizedStatKey = NATURE_STAT_KEY_MAP[stat.key];
            let axisClass = "neutral";
            if (normalizedStatKey && normalizedStatKey !== "hp") {
                if (nature.plus === normalizedStatKey && nature.minus !== normalizedStatKey) {
                    axisClass = "nature-plus";
                } else if (nature.minus === normalizedStatKey && nature.plus !== normalizedStatKey) {
                    axisClass = "nature-minus";
                }
            }

            return {
                label: stat.label,
                value: getIvValue(setData, stat.key),
                axisClass
            };
        });

        return getRadarMarkup({
            stats,
            maxValue: 31,
            chartClass: "box-iv-radar",
            shapeClass: "box-iv-shape",
            axisClassName: "box-iv-axis-group",
            ariaLabel: "IV radar chart",
            title: stats.map((stat) => `${stat.label} ${stat.value}`).join(" / ")
        });
    }

    function getBaseStatBarClass(value) {
        const numericValue = Number(value) || 0;
        if (numericValue >= 120) {
            return "teal";
        }
        if (numericValue >= 90) {
            return "lime";
        }
        if (numericValue >= 60) {
            return "yellow";
        }
        return "orange";
    }

    function getBaseStatPanelMarkup(baseStats) {
        const stats = [
            { label: "HP", value: Number(baseStats && baseStats.hp) || 0 },
            { label: "Atk", value: Number(baseStats && baseStats.at) || 0 },
            { label: "Def", value: Number(baseStats && baseStats.df) || 0 },
            { label: "Sp Atk", value: Number(baseStats && baseStats.sa) || 0 },
            { label: "Sp Def", value: Number(baseStats && baseStats.sd) || 0 },
            { label: "Spd", value: Number(baseStats && baseStats.sp) || 0 }
        ];
        const total = stats.reduce((sum, stat) => sum + stat.value, 0);

        return `
            <div class="box-base-stat-panel" aria-label="Base stats summary">
                ${stats.map((stat) => `
                    <div class="box-base-stat-row">
                        <div class="box-base-stat-label">${escapeHtml(stat.label)}</div>
                        <div class="box-base-stat-value">${escapeHtml(stat.value)}</div>
                        <div class="box-base-stat-bar-track">
                            <div
                                class="box-base-stat-bar ${escapeHtml(getBaseStatBarClass(stat.value))}"
                                style="width: ${escapeHtml(((Math.max(0, Math.min(BOX_BASE_STAT_MAX, stat.value)) / BOX_BASE_STAT_MAX) * 100).toFixed(1))}%"
                            ></div>
                        </div>
                    </div>
                `).join("")}
                <div class="box-base-stat-total-row">
                    <div class="box-base-stat-total-label">Total</div>
                    <div class="box-base-stat-total-value">${escapeHtml(total)}</div>
                </div>
            </div>
        `;
    }

    function getRadarTabsMarkup(entry) {
        return `
            <div class="box-card-radar-panels">
                <div class="box-card-radar-panel active" data-radar-panel="ivs">
                    ${getIvRadarMarkup(entry.setData)}
                </div>
                <div class="box-card-radar-panel box-card-radar-panel-stats" data-radar-panel="base-stats">
                    ${getBaseStatPanelMarkup(entry.baseStats)}
                </div>
            </div>
            <div class="box-card-radar-tabs" role="tablist" aria-label="Radar chart view">
                <button type="button" role="tab" class="box-radar-tab active" data-radar-view="ivs" aria-selected="true">IVs</button>
                <button type="button" role="tab" class="box-radar-tab" data-radar-view="base-stats" aria-selected="false">Base Stats</button>
            </div>
        `;
    }

    function getLearnsetSearchInfo(speciesName) {
        const baseSpecies = String(speciesName || "")
            .replace(/-Mega-X|-Mega-Y|-Mega-D|-Mega-O|-Mega/gi, "");
        const key = baseSpecies.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const learnsetMap = typeof window.learnsets !== "undefined" ? window.learnsets : (typeof learnsets !== "undefined" ? learnsets : null);

        if (!learnsetMap || typeof learnsetMap !== "object") {
            return "";
        }

        if (learnsetMap[key]) {
            return JSON.stringify(learnsetMap[key]).toLowerCase();
        }
        if (learnsetMap[baseSpecies]) {
            return JSON.stringify(learnsetMap[baseSpecies]).toLowerCase();
        }
        return "";
    }

    function buildEntrySearchBlob(speciesName, speciesSets, encountersMap) {
        const pokedexInfo = window.pokedex && window.pokedex[speciesName] ? window.pokedex[speciesName] : {};
        const encounterInfo = encountersMap && encountersMap[speciesName] ? encountersMap[speciesName] : {};
        const backupInfo = window.backup_data && window.backup_data.poks && window.backup_data.poks[speciesName]
            ? window.backup_data.poks[speciesName]
            : {};

        return [
            speciesName,
            JSON.stringify(speciesSets || {}),
            JSON.stringify(pokedexInfo),
            JSON.stringify(encounterInfo),
            JSON.stringify(backupInfo),
            getLearnsetSearchInfo(speciesName)
        ].join(" ").toLowerCase();
    }

    function buildBoxMetaEntries() {
        const customSetsMap = getCustomSetsMap();
        const encountersMap = getEncountersMap();
        const battleCountMap = getBattleCountMap();
        const entries = [];
        let eggEntryCount = 0;

        Object.keys(customSetsMap).forEach((speciesName) => {
            const speciesSets = customSetsMap[speciesName];
            if (!speciesSets || typeof speciesSets !== "object" || !speciesSets["My Box"]) {
                return;
            }

            const setData = speciesSets["My Box"];
            if (setData && setData.isEgg) {
                eggEntryCount += 1;
                console.log("[egg-debug][box-view] found egg custom set", {
                    speciesName,
                    setData,
                });
            }
            const baseStats = getSpeciesBaseStats(speciesName);
            const typeNames = getSpeciesTypes(speciesName);
            const typeSlugs = typeNames.map(normalizeSlug);

            entries.push({
                speciesName,
                speciesSets,
                setData,
                spriteSlug: normalizeSlug(speciesName),
                displayName: getDisplayName(speciesName, setData),
                genderMarkup: getGenderMarkup(setData),
                level: setData.level != null ? setData.level : "--",
                typeNames,
                typeSlugs,
                baseStats,
                bst: baseStats.hp + baseStats.at + baseStats.df + baseStats.sa + baseStats.sd + baseStats.sp,
                fragCount: getEncounterFragCount(speciesName, encountersMap),
                battleCount: Number(battleCountMap[speciesName]) || 0,
                offensiveIvPercent: getIvTopPercent(setData, OFFENSIVE_IV_KEYS, OFFENSIVE_IV_DISTRIBUTION),
                defensiveIvPercent: getIvTopPercent(setData, DEFENSIVE_IV_KEYS, DEFENSIVE_IV_DISTRIBUTION),
                searchBlob: buildEntrySearchBlob(speciesName, speciesSets, encountersMap),
                dexNumber: window.pokedex && window.pokedex[speciesName] ? Number(window.pokedex[speciesName].num) || Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
            });
        });

        if (eggEntryCount > 0) {
            console.log("[egg-debug][box-view] total egg entries", {
                eggEntryCount,
                totalEntries: entries.length,
            });
        } else {
            console.log("[egg-debug][box-view] no egg entries found in custom sets");
        }

        return entries;
    }

    function getSortValue(entry) {
        switch (boxViewState.sortKey) {
        case "frags":
            return entry.fragCount;
        case "battles":
            return entry.battleCount;
        case "bst":
            return entry.bst;
        case "hp":
        case "at":
        case "df":
        case "sa":
        case "sd":
        case "sp":
            return entry.baseStats[boxViewState.sortKey] || 0;
        default:
            return entry.fragCount;
        }
    }

    function compareBoxEntries(a, b) {
        const diff = getSortValue(b) - getSortValue(a);
        if (diff !== 0) {
            return diff;
        }
        if (b.fragCount !== a.fragCount) {
            return b.fragCount - a.fragCount;
        }
        if (a.dexNumber !== b.dexNumber) {
            return a.dexNumber - b.dexNumber;
        }
        return String(a.speciesName).localeCompare(String(b.speciesName));
    }

    function matchesSearch(entry) {
        const search = boxViewState.search.trim().toLowerCase();
        if (search.length < 2) {
            return true;
        }
        return entry.searchBlob.includes(search);
    }

    function matchesTypes(entry) {
        if (!boxViewState.activeTypeSlugs.size) {
            return true;
        }
        return entry.typeSlugs.some((typeSlug) => boxViewState.activeTypeSlugs.has(typeSlug));
    }

    function getBoxTypeCounts(entries) {
        const counts = {};
        BOX_TYPE_FILTERS.forEach((typeSlug) => {
            counts[typeSlug] = 0;
        });

        const safeEntries = Array.isArray(entries) ? entries : [];
        safeEntries.forEach((entry) => {
            const typeSlugs = Array.isArray(entry && entry.typeSlugs) ? entry.typeSlugs : [];
            typeSlugs.forEach((typeSlug) => {
                if (typeof counts[typeSlug] === "number") {
                    counts[typeSlug] += 1;
                }
            });
        });

        return counts;
    }

    function setBoxEmptyState(kicker, title, copy) {
        const kickerEl = document.getElementById("box-empty-kicker");
        const titleEl = document.getElementById("box-empty-title");
        const copyEl = document.getElementById("box-empty-copy");
        if (kickerEl) kickerEl.textContent = kicker;
        if (titleEl) titleEl.textContent = title;
        if (copyEl) copyEl.textContent = copy;
    }

    function renderBoxCard(entry) {
        const moves = Array.isArray(entry.setData.moves) ? entry.setData.moves.slice(0, 4) : [];
        const metLocation = entry.setData.met ? String(entry.setData.met).trim() : "";
        const statRows = [];
        const typeIcons = Array.isArray(entry.typeNames) ? entry.typeNames.map((typeName) => (
            getTypeIconMarkup(typeName, "box-card-sprite-type-icon")
        )).join("") : "";
        while (moves.length < 4) {
            moves.push("");
        }

        if (entry.fragCount > 0) {
            statRows.push(`
                <div class="box-card-stat-row">
                    <span class="box-card-stat-value">${escapeHtml(entry.fragCount)} Frags</span>
                </div>
            `);
        }
        if (entry.battleCount > 0) {
            statRows.push(`
                <div class="box-card-stat-row">
                    <span class="box-card-stat-value">${escapeHtml(entry.battleCount)} Battles</span>
                </div>
            `);
        }

        return `
            <article class="box-card" data-species="${escapeHtml(entry.speciesName)}">
                <div class="box-card-top">
                    <div class="box-card-side">
                        <div class="box-card-sprite-wrap" data-dex-species="${escapeHtml(entry.speciesName)}">
                            <img class="box-card-sprite" src="./img/newhd/${escapeHtml(entry.spriteSlug)}.png" alt="${escapeHtml(entry.speciesName)}" onerror="this.src='./img/default.png'">
                            ${getItemSpriteMarkup(entry.setData.item)}
                            ${typeIcons ? `<div class="box-card-sprite-types">${typeIcons}</div>` : ""}
                        </div>
                    </div>
                    <div class="box-card-main">
                        <div class="box-card-heading">
                            <div class="box-card-title-group">
                                <div class="box-card-name">${escapeHtml(entry.displayName)}${entry.genderMarkup ? ` ${entry.genderMarkup}` : ""}</div>
                                <div class="box-card-level">Lv. ${escapeHtml(entry.level)}</div>
                                ${metLocation ? `<div class="box-card-level">${escapeHtml(metLocation)}</div>` : ""}
                                <div class="box-card-level box-card-submeta">${escapeHtml(getAbilityDisplayText(entry.setData))}</div>
                                <div class="box-card-stats">
                                    ${statRows.join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-card-radar-wrap">
                        ${getRadarTabsMarkup(entry)}
                        <div class="box-card-radar-meta">
                            ${getIvPercentileMarkup("Offense", entry.offensiveIvPercent)}
                            ${getIvPercentileMarkup("Defense", entry.defensiveIvPercent)}
                        </div>
                    </div>
                </div>
                <div class="box-card-moves">
                    ${moves.map(getMoveMarkup).join("")}
                </div>
            </article>
        `;
    }

    function syncBoxControlsUi() {
        const searchInput = document.getElementById("box-search-input");
        if (searchInput && searchInput.value !== boxViewState.search) {
            searchInput.value = boxViewState.search;
        }

        document.querySelectorAll(".box-filter-btn[data-box-sort]").forEach((button) => {
            button.classList.toggle("active", button.getAttribute("data-box-sort") === boxViewState.sortKey);
        });

        document.querySelectorAll(".box-type-filter[data-box-type]").forEach((button) => {
            button.classList.toggle("active", boxViewState.activeTypeSlugs.has(button.getAttribute("data-box-type")));
        });
    }

    function renderBoxControlsUi(typeCounts) {
        const sortButtons = document.getElementById("box-sort-buttons");
        const typeFilters = document.getElementById("box-type-filters");
        const counts = typeCounts && typeof typeCounts === "object" ? typeCounts : {};

        if (sortButtons) {
            sortButtons.innerHTML = BOX_SORT_OPTIONS.map((option) => `
                <button type="button" class="box-filter-btn${option.key === boxViewState.sortKey ? " active" : ""}" data-box-sort="${escapeHtml(option.key)}">
                    ${escapeHtml(option.label)}
                </button>
            `).join("");
        }

        if (typeFilters) {
            typeFilters.innerHTML = BOX_TYPE_FILTERS.map((typeSlug) => `
                <button
                    type="button"
                    class="box-type-filter${boxViewState.activeTypeSlugs.has(typeSlug) ? " active" : ""}"
                    data-box-type="${escapeHtml(typeSlug)}"
                    aria-label="${escapeHtml(`${titleCaseSlug(typeSlug)} (${Number(counts[typeSlug]) || 0})`)}"
                    title="${escapeHtml(`${titleCaseSlug(typeSlug)} (${Number(counts[typeSlug]) || 0})`)}"
                >
                    ${getTypeIconMarkup(typeSlug, "box-type-filter-icon")}
                    <span class="box-type-filter-count">(${escapeHtml(Number(counts[typeSlug]) || 0)})</span>
                </button>
            `).join("");
        }
    }

    function initializeBoxControls() {
        if (boxControlsInitialized) {
            syncBoxControlsUi();
            return;
        }

        const controls = document.getElementById("box-controls");
        if (!controls) {
            return;
        }

        boxControlsInitialized = true;
        renderBoxControlsUi();
        syncBoxControlsUi();

        $(document).on("input", "#box-search-input", function () {
            boxViewState.search = String($(this).val() || "");
            renderBoxView(true);
        });

        $(document).on("click", "#box-clear-filters", function () {
            boxViewState.search = "";
            boxViewState.sortKey = "frags";
            boxViewState.activeTypeSlugs.clear();
            renderBoxView(true);
        });

        $(document).on("click", ".box-filter-btn[data-box-sort]", function () {
            boxViewState.sortKey = $(this).attr("data-box-sort") || "frags";
            renderBoxView(true);
        });

        $(document).on("click", ".box-type-filter[data-box-type]", function () {
            const typeSlug = $(this).attr("data-box-type");
            if (!typeSlug) {
                return;
            }
            if (boxViewState.activeTypeSlugs.has(typeSlug)) {
                boxViewState.activeTypeSlugs.delete(typeSlug);
            } else {
                boxViewState.activeTypeSlugs.add(typeSlug);
            }
            renderBoxView(true);
        });

        $(document).on("click", ".box-card-sprite-wrap", function () {
            openDexEntryForSpecies($(this).attr("data-dex-species"));
        });

        $(document).on("click", ".box-radar-tab[data-radar-view]", function () {
            const nextView = $(this).attr("data-radar-view");
            const radarWrap = $(this).closest(".box-card-radar-wrap");
            if (!nextView || !radarWrap.length) {
                return;
            }

            radarWrap.find(".box-radar-tab").each(function () {
                const isActive = $(this).attr("data-radar-view") === nextView;
                $(this).toggleClass("active", isActive).attr("aria-selected", isActive ? "true" : "false");
            });

            radarWrap.find(".box-card-radar-panel").each(function () {
                $(this).toggleClass("active", $(this).attr("data-radar-panel") === nextView);
            });
        });
    }

    function renderBoxView(force) {
        const cardGrid = document.getElementById("box-card-grid");
        const emptyState = document.getElementById("box-view-empty");
        if (!cardGrid || !emptyState) {
            return;
        }

        initializeBoxControls();

        const fingerprint = getCurrentBoxViewFingerprint();
        if (!force && fingerprint === lastRenderedFingerprint) {
            return;
        }

        const allEntries = buildBoxMetaEntries();
        const typeCounts = getBoxTypeCounts(allEntries);

        renderBoxControlsUi(typeCounts);
        syncBoxControlsUi();

        if (!allEntries.length) {
            cardGrid.innerHTML = "";
            setBoxEmptyState(
                "No Box Data",
                "Import a save or box payload",
                "The box view populates from customSets. Use the existing save or import flow in the calculator to load your box."
            );
            emptyState.style.display = "block";
            lastRenderedFingerprint = fingerprint;
            return;
        }

        const filteredEntries = allEntries
            .filter(matchesSearch)
            .filter(matchesTypes)
            .sort(compareBoxEntries);

        if (!filteredEntries.length) {
            cardGrid.innerHTML = "";
            setBoxEmptyState(
                "No Matches",
                "No Pokemon match the current filters",
                "Clear the search or type filters to show more of your box."
            );
            emptyState.style.display = "block";
            lastRenderedFingerprint = fingerprint;
            return;
        }

        emptyState.style.display = "none";
        cardGrid.innerHTML = filteredEntries.map(renderBoxCard).join("");
        lastRenderedFingerprint = fingerprint;
    }

    function startBoxViewWatcher() {
        if (boxViewWatcherStarted) {
            return;
        }
        boxViewWatcherStarted = true;

        window.addEventListener("storage", function (event) {
            if (
                (event.key === "customsets" || event.key === "encounters" || event.key === "battleLogs" || event.key === "battleLogImportantTrainersOnly") &&
                document.body.classList.contains("main-page-box-view")
            ) {
                renderBoxView(true);
            }
        });

        setInterval(function () {
            if (!document.body.classList.contains("main-page-box-view")) {
                return;
            }
            renderBoxView(false);
        }, 1000);
    }

    window.renderBoxView = renderBoxView;

    document.addEventListener("DOMContentLoaded", function () {
        startBoxViewWatcher();
        renderBoxView(true);
    });
})();
