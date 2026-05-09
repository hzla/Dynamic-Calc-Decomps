(function () {
    const DB_NAME = "calcAnalyticsDevData";
    const DB_VERSION = 1;
    const STORE_NAME = "calcDataOverrides";
    const BLANK_SOURCE_ID = "__blank_dev_calc__";
    const CONFIG_STORAGE_PREFIX = "calcDevConfig";
    const DDEX_CALC_READY_MESSAGE_TYPE = "ddex:calc-ready";
    const DDEX_CALC_SYNC_MESSAGE_TYPE = "ddex:calc-sync";
    const DDEX_CALC_SYNC_STARTED_MESSAGE_TYPE = "ddex:calc-sync-started";
    const DDEX_CALC_SYNC_ERROR_MESSAGE_TYPE = "ddex:calc-sync-error";

    const DEV_CONFIG_FIELDS = [
        {
            name: "gen",
            label: "Calc Gen",
            type: "select",
            options: ["1", "2", "3", "4", "5", "6", "7", "8"],
            help: "Generation used for species, items, and move data tables."
        },
        {
            name: "damageGen",
            label: "Damage Gen",
            type: "select",
            options: ["1", "2", "3", "4", "5", "6", "7", "8"],
            help: "Generation of battle mechanics for the calculator."
        },
        {
            name: "typeChart",
            label: "Type Chart",
            type: "number",
            min: "1",
            max: "11",
            help: "Numeric type chart id used by calc.TYPE_CHART."
        },
        {
            name: "critGen",
            label: "Crit Gen",
            type: "number",
            min: "1",
            max: "8",
            help: "Controls the critical-hit multiplier rules."
        },
        {
            name: "switchIn",
            label: "Switch In",
            type: "number",
            min: "0",
            max: "11",
            help: "General switch preview ruleset id."
        },
        {
            name: "gameSwitchIn",
            label: "Game Switch In",
            type: "number",
            min: "0",
            max: "11",
            help: "Game-specific switch preview logic id."
        },
        {
            name: "sourceType",
            label: "Source Type",
            type: "select",
            options: [
                { value: "full", label: "full" },
                { value: "onlyTrainers", label: "onlyTrainers" }
            ],
            help: "How uploaded backup_data should be interpreted."
        },
        {
            name: "baseGame",
            label: "Base Game",
            type: "select",
            options: [
                { value: "", label: "Auto" },
                { value: "Pt", label: "Pt" },
                { value: "HGSS", label: "HGSS" },
                { value: "BW", label: "BW" },
                { value: "null", label: "null" },
                { value: "imp", label: "imp" },
                { value: "inc_em", label: "inc_em" },
                { value: "g3", label: "g3" },
                { value: "g6", label: "g6" },
                { value: "g7", label: "g7" }
            ],
            help: "Save reader family and Lua sync behavior."
        },
        {
            name: "mechanics",
            label: "Mechanics",
            type: "select",
            options: [
                { value: "vanilla", label: "vanilla" },
                { value: "hge", label: "hge" }
            ],
            help: "Advanced mechanics mode used by some save readers."
        },
        {
            name: "showDex",
            label: "Show Dex",
            type: "checkbox",
            help: "Display Dex nav and overlays."
        },
        {
            name: "showAI",
            label: "Show AI",
            type: "checkbox",
            help: "Display the AI panel button."
        },
        {
            name: "noSwitch",
            label: "No Switch",
            type: "checkbox",
            help: "Disable switch preview assumptions."
        },
        {
            name: "physSpecSplit",
            label: "Phys/Spec Split",
            type: "checkbox",
            help: "Use move-data categories instead of pre-split type categories."
        },
        {
            name: "invertTypes",
            label: "Invert Types",
            type: "checkbox",
            help: "Treat every calc as an inverse battle where supported."
        },
        {
            name: "hasEvs",
            label: "Use EVs",
            type: "checkbox",
            help: "Enable EV columns and EV-aware imports."
        },
        {
            name: "customPoks",
            label: "Custom Mons",
            type: "checkbox",
            help: "Allow species that do not exist in the stock calc dex."
        },
        {
            name: "challengeMode",
            label: "Challenge Mode",
            type: "checkbox",
            help: "Enable challenge-mode adjustments where supported."
        },
        {
            name: "customCascadeSwitchAI",
            label: "Cascade Switch AI",
            type: "checkbox",
            help: "Use Cascade-specific switch preview BP adjustments."
        },
        {
            name: "customCascadeSwitchAIG4",
            label: "Cascade Switch AI G4",
            type: "checkbox",
            help: "Use the Cascade G4-hybrid switch preview ordering."
        },
        {
            name: "readIncludes",
            label: "Read Includes",
            type: "checkbox",
            help: "Load include arrays from uploaded backup_data."
        },
        {
            name: "hasMastersheet",
            label: "Has Mastersheet",
            type: "checkbox",
            help: "Show the mastersheet link in the settings menu."
        },
        {
            name: "saveExpansion",
            label: "Save Expansion",
            type: "checkbox",
            help: "Use expanded save structure handling."
        }
    ];

    function getUrlParams() {
        return new URLSearchParams(window.location.search || "");
    }

    function getBridgeOrigin() {
        const origin = String(getUrlParams().get("ddexBridgeOrigin") || "").trim();
        return origin || "";
    }

    function hasBridgeOpener() {
        return !!(window.opener && window.opener !== window && typeof window.opener.postMessage === "function");
    }

    function postBridgeMessage(message) {
        const targetOrigin = getBridgeOrigin();
        if (!targetOrigin || !hasBridgeOpener()) {
            return;
        }

        window.opener.postMessage(message, targetOrigin);
    }

    function isTrustedBridgeMessage(event) {
        const targetOrigin = getBridgeOrigin();
        if (!targetOrigin || !hasBridgeOpener()) {
            return false;
        }
        if (event.origin !== targetOrigin) {
            return false;
        }
        return event.source === window.opener;
    }

    function isDevModeEnabled() {
        return getUrlParams().get("dev") === "1";
    }

    function isBlankDevMode() {
        return isDevModeEnabled() && !getUrlParams().get("data");
    }

    function getCurrentSourceId() {
        const params = getUrlParams();
        return params.get("data") || BLANK_SOURCE_ID;
    }

    function getOverrideStorageKey() {
        return `calc:${window.location.pathname}:${getCurrentSourceId()}`;
    }

    function getConfigStorageKey() {
        return `${CONFIG_STORAGE_PREFIX}:${window.location.pathname}:${getCurrentSourceId()}`;
    }

    function getStoredDevConfig() {
        const raw = window.localStorage.getItem(getConfigStorageKey());
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error("[DevDataOverride] Failed to parse stored config", error);
            return null;
        }
    }

    function saveStoredDevConfig(config) {
        window.localStorage.setItem(getConfigStorageKey(), JSON.stringify(config || {}));
    }

    function clearStoredDevConfig() {
        window.localStorage.removeItem(getConfigStorageKey());
    }

    function openOverrideDb() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error("IndexedDB is unavailable"));
                return;
            }

            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: "key" });
                }
            };

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error || new Error("Failed to open override database"));
            };
        });
    }

    async function withOverrideStore(mode, action) {
        const db = await openOverrideDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, mode);
            const store = transaction.objectStore(STORE_NAME);
            let settled = false;
            let actionResult;

            transaction.oncomplete = function () {
                db.close();
                if (!settled) {
                    settled = true;
                    resolve(actionResult);
                }
            };

            transaction.onerror = function () {
                db.close();
                if (!settled) {
                    settled = true;
                    reject(transaction.error || new Error("IndexedDB transaction failed"));
                }
            };

            transaction.onabort = function () {
                db.close();
                if (!settled) {
                    settled = true;
                    reject(transaction.error || new Error("IndexedDB transaction aborted"));
                }
            };

            try {
                action(store, function (value) {
                    actionResult = value;
                });
            } catch (error) {
                if (!settled) {
                    settled = true;
                    reject(error);
                }
            }
        });
    }

    async function getStoredOverrideRecord() {
        return withOverrideStore("readonly", function (store, setResult) {
            const request = store.get(getOverrideStorageKey());
            request.onsuccess = function () {
                setResult(request.result || null);
            };
            request.onerror = function () {
                throw request.error || new Error("Failed to read override");
            };
        });
    }

    async function saveStoredOverrideRecord(record) {
        return withOverrideStore("readwrite", function (store) {
            const request = store.put(record);
            request.onerror = function () {
                throw request.error || new Error("Failed to save override");
            };
        });
    }

    async function clearStoredOverrideRecord() {
        return withOverrideStore("readwrite", function (store) {
            const request = store.delete(getOverrideStorageKey());
            request.onerror = function () {
                throw request.error || new Error("Failed to clear override");
            };
        });
    }

    function parseBackupDataScript(sourceText) {
        const wrappedSource = [
            "var backup_data;",
            "var window = {};",
            "var self = window;",
            "var globalThis = window;",
            sourceText,
            "return typeof backup_data !== 'undefined' ? backup_data : window.backup_data;"
        ].join("\n");

        const parsedData = new Function(wrappedSource)();
        if (!parsedData || typeof parsedData !== "object") {
            throw new Error("Uploaded file did not define backup_data");
        }

        return parsedData;
    }

    function buildBackupDataScriptText(payload) {
        return "var backup_data = " + JSON.stringify(payload) + ";";
    }

    async function handleBridgeSyncMessage(event) {
        if (!isTrustedBridgeMessage(event)) {
            return;
        }

        const data = event.data || {};
        if (data.type !== DDEX_CALC_SYNC_MESSAGE_TYPE) {
            return;
        }

        try {
            if (!isDevModeEnabled()) {
                throw new Error("Calc sync is only available in dev mode.");
            }

            const scriptText =
                typeof data.scriptText === "string" && data.scriptText.trim()
                    ? data.scriptText
                    : data.backupData && typeof data.backupData === "object"
                        ? buildBackupDataScriptText(data.backupData)
                        : "";

            if (!scriptText) {
                throw new Error("No calc data payload was provided.");
            }

            parseBackupDataScript(scriptText);

            if (data.config && typeof data.config === "object") {
                saveStoredDevConfig(data.config);
            }

            await saveStoredOverrideRecord({
                key: getOverrideStorageKey(),
                fileName: data.fileName || "backup_data.js",
                sourceId: getCurrentSourceId(),
                text: scriptText,
                updatedAt: Date.now()
            });

            postBridgeMessage({
                type: DDEX_CALC_SYNC_STARTED_MESSAGE_TYPE,
                title: typeof data.title === "string" ? data.title : "",
            });

            window.location.reload();
        } catch (error) {
            console.error("[DevDataOverride] Bridge sync failed", error);
            postBridgeMessage({
                type: DDEX_CALC_SYNC_ERROR_MESSAGE_TYPE,
                error: error && error.message ? error.message : "Failed to sync calc data.",
            });
        }
    }

    function readFileText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(String(reader.result || ""));
            };
            reader.onerror = function () {
                reject(reader.error || new Error("Failed to read uploaded file"));
            };
            reader.readAsText(file);
        });
    }

    function getControls() {
        return {
            container: document.getElementById("dev-data-controls"),
            uploadButton: document.getElementById("dev-upload-data"),
            configButton: document.getElementById("dev-open-configs"),
            clearButton: document.getElementById("dev-clear-data"),
            uploadInput: document.getElementById("dev-data-upload")
        };
    }

    function getConfigModalElements() {
        return {
            modal: document.getElementById("dev-config-modal"),
            form: document.getElementById("dev-config-form"),
            fields: document.getElementById("dev-config-fields")
        };
    }

    function setControlVisibility(hasOverride, hasConfig) {
        const controls = getControls();
        if (!controls.container) {
            return;
        }

        const shouldShow = isDevModeEnabled();
        const shouldShowConfig = isBlankDevMode();
        const shouldShowClear = shouldShow && (hasOverride || hasConfig || isBlankDevMode());

        controls.container.hidden = !shouldShow;
        controls.container.style.display = shouldShow ? "inline-flex" : "none";

        if (controls.configButton) {
            controls.configButton.style.display = shouldShowConfig ? "inline-flex" : "none";
        }

        if (controls.clearButton) {
            controls.clearButton.style.display = shouldShowClear ? "inline-flex" : "none";
        }
    }

    async function refreshControlState() {
        if (!isDevModeEnabled()) {
            setControlVisibility(false, false);
            return;
        }

        const storedConfig = getStoredDevConfig();
        try {
            const record = await getStoredOverrideRecord();
            setControlVisibility(!!record, !!storedConfig);
        } catch (error) {
            console.error("[DevDataOverride] Failed to inspect stored override", error);
            setControlVisibility(false, !!storedConfig);
        }
    }

    function closeConfigModal() {
        const elements = getConfigModalElements();
        if (elements.modal) {
            elements.modal.hidden = true;
        }
    }

    function openConfigModal() {
        if (!isBlankDevMode()) {
            return;
        }

        renderConfigForm();
        const elements = getConfigModalElements();
        if (elements.modal) {
            elements.modal.hidden = false;
        }
    }

    function getCurrentBlankConfigValues() {
        if (typeof window.getCurrentDevBlankConfig === "function") {
            return window.getCurrentDevBlankConfig();
        }
        return getStoredDevConfig() || {};
    }

    function createFieldNode(field, value) {
        const fieldWrapper = document.createElement("div");
        fieldWrapper.className = `dev-config-field${field.type === "checkbox" ? " dev-config-checkbox" : ""}`;

        const label = document.createElement("label");
        label.setAttribute("for", `dev-config-${field.name}`);
        label.textContent = field.label;

        let input;
        if (field.type === "select") {
            input = document.createElement("select");
            (field.options || []).forEach(function (option) {
                const optionEl = document.createElement("option");
                if (typeof option === "object") {
                    optionEl.value = String(option.value);
                    optionEl.textContent = option.label;
                } else {
                    optionEl.value = String(option);
                    optionEl.textContent = String(option);
                }
                if (String(value) === optionEl.value) {
                    optionEl.selected = true;
                }
                input.appendChild(optionEl);
            });
        } else {
            input = document.createElement("input");
            input.type = field.type;
            if (field.type === "checkbox") {
                input.checked = !!value;
            } else {
                input.value = value == null ? "" : String(value);
            }
            if (field.min != null) {
                input.min = field.min;
            }
            if (field.max != null) {
                input.max = field.max;
            }
        }

        input.id = `dev-config-${field.name}`;
        input.name = field.name;

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(input);

        if (field.help) {
            const help = document.createElement("div");
            help.className = "dev-config-help";
            help.textContent = field.help;
            fieldWrapper.appendChild(help);
        }

        return fieldWrapper;
    }

    function renderConfigForm() {
        const elements = getConfigModalElements();
        if (!elements.fields) {
            return;
        }

        const config = getCurrentBlankConfigValues();
        elements.fields.innerHTML = "";

        DEV_CONFIG_FIELDS.forEach(function (field) {
            elements.fields.appendChild(createFieldNode(field, config[field.name]));
        });
    }

    function coerceConfigValue(field, value) {
        if (field.type === "checkbox") {
            return !!value;
        }

        if (field.type === "number") {
            const parsed = parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : 0;
        }

        if (field.type === "select") {
            const firstOption = Array.isArray(field.options) ? field.options[0] : null;
            const sampleValue = typeof firstOption === "object" ? firstOption && firstOption.value : firstOption;
            if (/^\d+$/.test(String(sampleValue))) {
                const parsed = parseInt(value, 10);
                return Number.isFinite(parsed) ? parsed : 0;
            }
        }

        return String(value == null ? "" : value);
    }

    function collectConfigFormValues(form) {
        const values = {};

        DEV_CONFIG_FIELDS.forEach(function (field) {
            const input = form.elements[field.name];
            if (!input) {
                return;
            }

            if (field.type === "checkbox") {
                values[field.name] = !!input.checked;
                return;
            }

            values[field.name] = coerceConfigValue(field, input.value);
        });

        return values;
    }

    async function handleUploadSelection(event) {
        const input = event && event.target;
        const file = input && input.files ? input.files[0] : null;

        if (!file) {
            return;
        }

        try {
            const sourceText = await readFileText(file);
            parseBackupDataScript(sourceText);

            await saveStoredOverrideRecord({
                key: getOverrideStorageKey(),
                fileName: file.name || "backup_data.js",
                sourceId: getCurrentSourceId(),
                text: sourceText,
                updatedAt: Date.now()
            });

            window.location.reload();
        } catch (error) {
            console.error("[DevDataOverride] Upload failed", error);
            window.alert(error && error.message ? error.message : "Failed to upload backup data.");
        } finally {
            if (input) {
                input.value = "";
            }
            refreshControlState();
        }
    }

    async function handleClearClick() {
        try {
            await clearStoredOverrideRecord();
        } catch (error) {
            console.error("[DevDataOverride] Failed to clear override", error);
        }

        clearStoredDevConfig();
        window.location.reload();
    }

    function bindConfigModalEvents() {
        const elements = getConfigModalElements();
        if (!elements.modal || !elements.form) {
            return;
        }

        document.querySelectorAll("[data-close-dev-config]").forEach(function (node) {
            node.addEventListener("click", closeConfigModal);
        });

        elements.form.addEventListener("submit", function (event) {
            event.preventDefault();
            const values = collectConfigFormValues(elements.form);
            saveStoredDevConfig(values);
            window.location.reload();
        });
    }

    function initializeControls() {
        const controls = getControls();
        if (!controls.container || !controls.uploadButton || !controls.clearButton || !controls.uploadInput) {
            return;
        }

        controls.uploadButton.addEventListener("click", function () {
            controls.uploadInput.click();
        });

        if (controls.configButton) {
            controls.configButton.addEventListener("click", openConfigModal);
        }

        controls.uploadInput.addEventListener("change", handleUploadSelection);
        controls.clearButton.addEventListener("click", handleClearClick);

        bindConfigModalEvents();
        refreshControlState();
    }

    window.devDataOverrides = {
        BLANK_SOURCE_ID,
        DEV_CONFIG_FIELDS,
        isDevModeEnabled,
        isBlankDevMode,
        getCurrentSourceId,
        getOverrideStorageKey,
        getStoredOverrideRecord,
        saveStoredOverrideRecord,
        clearStoredOverrideRecord,
        getStoredDevConfig,
        saveStoredDevConfig,
        clearStoredDevConfig,
        parseBackupDataScript,
        refreshControlState
    };

    window.addEventListener("message", function (event) {
        handleBridgeSyncMessage(event);
    });

    postBridgeMessage({
        type: DDEX_CALC_READY_MESSAGE_TYPE,
        href: window.location.href,
    });

    document.addEventListener("DOMContentLoaded", initializeControls);
})();
