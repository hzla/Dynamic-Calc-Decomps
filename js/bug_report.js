(function () {
    var BUG_REPORT_STORAGE_KEYS = [
        "alerted",
        "autoImportMegas",
        "battleLogImportantTrainersOnly",
        "battleLogSourceMeta",
        "battleLogs",
        "battlenotes",
        "boxFilterColors",
        "boxSortDirection",
        "boxSortKey",
        "boxrolls",
        "boxspriteindex",
        "calcHasEvs",
        "currentParty",
        "customLeads",
        "customsets",
        "deadMons",
        "dexSpeciesModalMode",
        "dynamicTypeBug",
        "enemyPreviewBoxrolls",
        "enableAnalytics",
        "encounters",
        "filterAbilities",
        "filterSaveFile",
        "fragsheetRunTrainerKey",
        "hideCurrentAiMon",
        "hidePrevos",
        "highlightMoves",
        "importPartyPreview",
        "invertTypes",
        "lastTid",
        "latestBoxImportBatchId",
        "left",
        "legalTms",
        "lvlCap",
        "midPanelBottomLayout",
        "notes",
        "partnerName",
        "physSpecSplit",
        "randomized",
        "rememberHpStatus",
        "rememberedEnemyHpStatus",
        "right",
        "showAbilitySlot",
        "showAdditionalFieldOptions",
        "showTrainerPreviewExpBars",
        "states",
        "switchAiInfo",
        "switchInfo",
        "switchPreview",
        "syncLua",
        "themeIndex",
        "toDelete",
        "watchSaveFile"
    ];

    var BUG_REPORT_STORAGE_PREFIXES = [
        "calcSwitchPreview:",
        "calcSwitchAiInfo:",
        "calcMoveAiPreview:",
        "calcPhysSpecSplit:",
        "calcInvertTypes:",
        "calcDevConfig:"
    ];

    var SENSITIVE_KEY_PATTERN = /(password|passwd|token|secret|auth|cookie|session|email|phone|address|jwt|bearer|credential)/i;
    var GAME_ID_KEY_PATTERN = /^(lastTid|trainerId|secretId|trainerIdSecret|trainerKey|compareKey|tid|sid)$/i;
    var USER_FREEFORM_KEYS = {
        notes: true
    };
    var REDACTED_VALUE = "[redacted]";

    function isAllowedStorageKey(key) {
        if (BUG_REPORT_STORAGE_KEYS.indexOf(key) !== -1) {
            return true;
        }
        return BUG_REPORT_STORAGE_PREFIXES.some(function (prefix) {
            return key.indexOf(prefix) === 0;
        });
    }

    function shouldRedactKey(key) {
        return SENSITIVE_KEY_PATTERN.test(key) || GAME_ID_KEY_PATTERN.test(key) || !!USER_FREEFORM_KEYS[key];
    }

    function redactString(value) {
        return String(value)
            .replace(/\bTID:\s*\d+:\d+\b/gi, "TID: [redacted]")
            .replace(/\b(trainerIdSecret|secretId|trainerId|trainerKey|compareKey)\s*[:=]\s*["']?[^"',\s<]+/gi, "$1: [redacted]");
    }

    function scrubValue(value, keyPath, redactions) {
        var currentKey = keyPath.length ? keyPath[keyPath.length - 1] : "";
        if (shouldRedactKey(currentKey)) {
            redactions.push(keyPath.join(".") || currentKey);
            return "[redacted]";
        }

        if (Array.isArray(value)) {
            return value.map(function (entry, index) {
                return scrubValue(entry, keyPath.concat(String(index)), redactions);
            });
        }

        if (value && typeof value === "object") {
            return Object.keys(value).reduce(function (next, key) {
                next[key] = scrubValue(value[key], keyPath.concat(key), redactions);
                return next;
            }, {});
        }

        if (typeof value === "string") {
            return redactString(value);
        }

        return value;
    }

    function parseStorageValue(rawValue) {
        if (typeof rawValue !== "string") {
            return rawValue;
        }

        try {
            return JSON.parse(rawValue);
        } catch (_error) {
            return rawValue;
        }
    }

    function isBugReportDebugEnabled() {
        var params = new URLSearchParams(window.location.search || "");
        return params.get("dev") === "1" ||
            params.get("debug") === "1" ||
            params.get("bugReportDebug") === "1" ||
            (typeof settings !== "undefined" && settings && settings.devMode);
    }

    function getStorageString(value) {
        if (typeof value === "string") {
            return value;
        }
        return JSON.stringify(value);
    }

    function removeRedactedValues(value) {
        if (value === REDACTED_VALUE) {
            return undefined;
        }

        if (Array.isArray(value)) {
            return value.map(function (entry) {
                var cleaned = removeRedactedValues(entry);
                return cleaned === undefined ? null : cleaned;
            });
        }

        if (value && typeof value === "object") {
            return Object.keys(value).reduce(function (next, key) {
                var cleaned = removeRedactedValues(value[key]);
                if (cleaned !== undefined) {
                    next[key] = cleaned;
                }
                return next;
            }, {});
        }

        return value;
    }

    function readBugReportFile(file) {
        return new Promise(function (resolve, reject) {
            if (!file || typeof file.text !== "function") {
                reject(new Error("Expected a bug report File object."));
                return;
            }

            file.text()
                .then(function (text) {
                    try {
                        resolve(JSON.parse(text));
                    } catch (error) {
                        reject(new Error("Bug report file is not valid JSON."));
                    }
                })
                .catch(reject);
        });
    }

    function pickBugReportFile() {
        if (typeof window.showOpenFilePicker === "function") {
            return window.showOpenFilePicker({
                multiple: false,
                types: [{
                    description: "Dynamic Calc bug report",
                    accept: { "application/json": [".json"] }
                }]
            }).then(function (handles) {
                if (!handles || !handles[0]) {
                    throw new Error("No bug report selected.");
                }
                return handles[0].getFile();
            });
        }

        return new Promise(function (resolve, reject) {
            var input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json,.json";
            input.style.display = "none";
            input.addEventListener("change", function () {
                var file = input.files && input.files[0];
                document.body.removeChild(input);
                if (!file) {
                    reject(new Error("No bug report selected."));
                    return;
                }
                resolve(file);
            });
            document.body.appendChild(input);
            input.click();
        });
    }

    function validateBugReportPayload(payload) {
        if (!payload || typeof payload !== "object") {
            throw new Error("Bug report payload must be an object.");
        }
        if (payload.app !== "Dynamic Calc") {
            throw new Error("This does not look like a Dynamic Calc bug report.");
        }
        if (!payload.localStorage || typeof payload.localStorage !== "object" || Array.isArray(payload.localStorage)) {
            throw new Error("Bug report is missing localStorage data.");
        }
    }

    function getCurrentAllowedStorageKeys() {
        var keys = [];
        if (typeof window.localStorage === "undefined") {
            return keys;
        }

        for (var i = 0; i < window.localStorage.length; i += 1) {
            var key = window.localStorage.key(i);
            if (key && isAllowedStorageKey(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    function summarizeUrlMatch(reportUrl) {
        if (!reportUrl) {
            return { matches: null, message: "Bug report did not include a URL." };
        }

        try {
            var current = new URL(window.location.href);
            var reported = new URL(reportUrl);
            var matches = current.origin === reported.origin &&
                current.pathname === reported.pathname &&
                current.searchParams.get("data") === reported.searchParams.get("data");

            return {
                matches: matches,
                message: matches ? "Current URL matches the bug report target." : "Current URL differs from the bug report target."
            };
        } catch (_error) {
            return { matches: null, message: "Unable to compare current URL with bug report URL." };
        }
    }

    function applyBugReportPayload(payload, options) {
        var restoreOptions = Object.assign({
            reload: true,
            replace: true
        }, options || {});
        var restoredKeys = [];
        var skippedKeys = [];
        var removedKeys = [];

        if (!isBugReportDebugEnabled()) {
            throw new Error("Bug report restore is debug-only. Add ?dev=1, ?debug=1, or ?bugReportDebug=1 to enable it.");
        }
        if (typeof window.localStorage === "undefined") {
            throw new Error("localStorage is unavailable.");
        }

        validateBugReportPayload(payload);

        var reportStorage = payload.localStorage;
        var reportKeys = Object.keys(reportStorage).filter(isAllowedStorageKey);
        var reportKeyMap = reportKeys.reduce(function (next, key) {
            next[key] = true;
            return next;
        }, {});

        if (restoreOptions.replace) {
            getCurrentAllowedStorageKeys().forEach(function (key) {
                if (!reportKeyMap[key]) {
                    window.localStorage.removeItem(key);
                    removedKeys.push(key);
                }
            });
        }

        reportKeys.forEach(function (key) {
            var cleanedValue = removeRedactedValues(reportStorage[key]);
            if (cleanedValue === undefined) {
                window.localStorage.removeItem(key);
                skippedKeys.push(key);
                return;
            }

            window.localStorage.setItem(key, getStorageString(cleanedValue));
            restoredKeys.push(key);
        });

        var result = {
            restoredKeys: restoredKeys.sort(),
            skippedRedactedKeys: skippedKeys.sort(),
            removedKeys: removedKeys.sort(),
            url: summarizeUrlMatch(payload.url)
        };

        if (restoreOptions.reload) {
            window.setTimeout(function () {
                window.location.reload();
            }, 0);
        }

        return result;
    }

    function initDebugBugReportRestore() {
        if (!isBugReportDebugEnabled()) {
            return;
        }

        window.loadCalcBugReportStateFromFile = function (file, options) {
            return readBugReportFile(file).then(function (payload) {
                return applyBugReportPayload(payload, options);
            });
        };

        window.loadCalcBugReportState = function (options) {
            return pickBugReportFile().then(function (file) {
                return window.loadCalcBugReportStateFromFile(file, options);
            });
        };

        window.applyCalcBugReportState = applyBugReportPayload;
    }

    function getSanitizedUrl() {
        var redactedParams = [];
        var url;

        try {
            url = new URL(window.location.href);
        } catch (_error) {
            return {
                href: "",
                redactedParams: redactedParams
            };
        }

        url.searchParams.forEach(function (_value, key) {
            if (SENSITIVE_KEY_PATTERN.test(key) || GAME_ID_KEY_PATTERN.test(key)) {
                url.searchParams.set(key, "[redacted]");
                redactedParams.push(key);
            }
        });

        if (url.hash) {
            try {
                var hashText = url.hash.slice(1);
                var hashParams = new URLSearchParams(hashText);
                var changedHash = false;
                hashParams.forEach(function (_value, key) {
                    if (SENSITIVE_KEY_PATTERN.test(key) || GAME_ID_KEY_PATTERN.test(key)) {
                        hashParams.set(key, "[redacted]");
                        redactedParams.push("#" + key);
                        changedHash = true;
                    }
                });
                if (changedHash) {
                    url.hash = hashParams.toString();
                }
            } catch (_hashError) {
                url.hash = "";
                redactedParams.push("#");
            }
        }

        return {
            href: url.toString(),
            redactedParams: redactedParams
        };
    }

    function collectCalcLocalStorage() {
        var storageData = {};
        var includedKeys = [];
        var redactions = [];
        var totalKeys = 0;

        if (typeof window.localStorage === "undefined") {
            return {
                data: storageData,
                includedKeys: includedKeys,
                redactions: redactions,
                totalKeys: totalKeys
            };
        }

        totalKeys = window.localStorage.length;
        for (var i = 0; i < window.localStorage.length; i += 1) {
            var key = window.localStorage.key(i);
            if (!key || !isAllowedStorageKey(key)) {
                continue;
            }

            var parsedValue = parseStorageValue(window.localStorage.getItem(key));
            storageData[key] = scrubValue(parsedValue, [key], redactions);
            includedKeys.push(key);
        }

        includedKeys.sort();

        return {
            data: storageData,
            includedKeys: includedKeys,
            redactions: redactions,
            totalKeys: totalKeys
        };
    }

    function buildBugReportPayload() {
        var storage = collectCalcLocalStorage();
        var url = getSanitizedUrl();

        return {
            schemaVersion: 1,
            app: "Dynamic Calc",
            generatedAt: new Date().toISOString(),
            title: typeof window.TITLE === "string" ? window.TITLE : document.title,
            url: url.href,
            localStorage: storage.data,
            metadata: {
                includedLocalStorageKeys: storage.includedKeys,
                exportedLocalStorageKeyCount: storage.includedKeys.length,
                totalLocalStorageKeyCount: storage.totalKeys,
                redactedFields: storage.redactions.concat(url.redactedParams.map(function (param) {
                    return "url." + param;
                }))
            }
        };
    }

    function downloadJson(payload) {
        var timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        var link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = "dynamic-calc-bug-report-" + timestamp + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.setTimeout(function () {
            URL.revokeObjectURL(link.href);
        }, 0);
    }

    function initBugReportDownload() {
        var button = document.getElementById("download-bug-report");
        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            downloadJson(buildBugReportPayload());
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            initBugReportDownload();
            initDebugBugReportRestore();
        });
    } else {
        initBugReportDownload();
        initDebugBugReportRestore();
    }
}());
