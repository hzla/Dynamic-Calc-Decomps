(function(root) {
    "use strict";

    var enabled = false;
    var previewOpen = false;
    var STORAGE_PREFIX = "calcMoveAiPreview:";
    var lastStatus = {
        reason: "disabled"
    };

    function getGlobalValue(name) {
        if (typeof root[name] !== "undefined") return root[name];
        try {
            return Function("return typeof " + name + " !== 'undefined' ? " + name + " : undefined")();
        } catch (err) {
            return undefined;
        }
    }

    function getSettings() {
        return getGlobalValue("settings");
    }

    function getTitle() {
        return getGlobalValue("TITLE") || "";
    }

    function getBaseGame() {
        return getGlobalValue("baseGame") || "";
    }

    function titleKey(title) {
        return STORAGE_PREFIX + (title || getTitle() || "NONE");
    }

    function isPlatinumKaizo(title) {
        return (title || getTitle()) === "Platinum Kaizo";
    }

    function canUseMoveAiPreviewSetting(title) {
        var calcSettings = getSettings();
        return !!(calcSettings && calcSettings.damageGen === 4 && !isPlatinumKaizo(title));
    }

    function getEnabled(title) {
        if (!canUseMoveAiPreviewSetting(title)) return false;
        if (typeof localStorage === "undefined") return false;
        return localStorage.getItem(titleKey(title)) === "1";
    }

    function setStoredEnabled(value, title) {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(titleKey(title), value ? "1" : "0");
        }
    }

    function isPlatinumFamily() {
        var title = getTitle();
        return getBaseGame() === "Pt" || (typeof title === "string" && title.indexOf("Platinum") !== -1);
    }

    function canRender() {
        var calcSettings = getSettings();
        return !!(root.PlatinumMoveAiPreview && calcSettings && calcSettings.damageGen === 4 && isPlatinumFamily());
    }

    function getDamageResults() {
        return getGlobalValue("damageResults");
    }

    function updateStatus(reason, extras) {
        lastStatus = Object.assign({
            enabled: enabled,
            reason: reason,
            title: getTitle(),
            baseGame: getBaseGame(),
            damageGen: getSettings() ? getSettings().damageGen : null,
            hasEngine: !!root.PlatinumMoveAiPreview,
            canUseSetting: canUseMoveAiPreviewSetting(),
            isPlatinumFamily: isPlatinumFamily(),
            isSingles: !$("#doubles-format").is(":checked"),
            hasDamageResults: !!(getDamageResults() && getDamageResults()[1]),
            panelVisible: $("#move-ai-preview:visible").length > 0
        }, extras || {});
        return lastStatus;
    }

    function escapeHtml(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatPct(value) {
        return (Math.round((Number(value) || 0) * 1000) / 10).toFixed(1).replace(/\.0$/, "") + "%";
    }

    function getSelectedSetName() {
        var raw = $("#p2 .set-selector").val() || $(".opposing.set-selector").first().val() || localStorage.right || "";
        return String(raw);
    }

    function getP2SetData(attacker) {
        var full = getSelectedSetName();
        var species = full.split(" (")[0] || (attacker && attacker.name) || "";
        var setName = "";
        if (full.indexOf(" (") !== -1) {
            setName = full.split(" (")[1].split(")")[0];
        }
        if (!setName && attacker && attacker.setName) {
            setName = attacker.setName;
        }
        if (root.setdex && root.setdex[species] && root.setdex[species][setName]) {
            return root.setdex[species][setName];
        }
        if (attacker && root.setdex && root.setdex[attacker.name]) {
            var names = Object.keys(root.setdex[attacker.name]);
            if (names.length) return root.setdex[attacker.name][names[0]];
        }
        return null;
    }

    function getAiMask(attacker, assumptions) {
        var setData = getP2SetData(attacker);
        if (setData && Number.isFinite(Number(setData.ai))) {
            return Number(setData.ai);
        }

        var mask = 0;
        if ($("#ai1:visible").length) mask |= root.PlatinumMoveAiPreview.AI_FLAGS.BASIC;
        if ($("#ai2:visible").length) mask |= root.PlatinumMoveAiPreview.AI_FLAGS.EVAL_ATTACK;
        if ($("#ai3:visible").length) mask |= root.PlatinumMoveAiPreview.AI_FLAGS.EXPERT;
        if (mask) {
            assumptions.push("AI mask unavailable on set data; using visible AI badges.");
            return mask;
        }

        assumptions.push("AI mask unavailable; assuming Basic only.");
        return root.PlatinumMoveAiPreview.AI_FLAGS.BASIC;
    }

    function ensurePanel() {
        var panel = $("#move-ai-preview");
        var target = $(".move-result-group");
        if (!panel.length) {
            panel = $('<div id="move-ai-preview" class="move-ai-preview" aria-live="polite"></div>');
        }
        if (target.length) {
            if (panel.parent()[0] !== target[0]) {
                target.append(panel);
            }
        } else {
            target = $("#nav-tags");
            if (!target.length) target = $("#show-ai");
            if (!target.length) target = $("#ai-container");
            if (target.length && panel.prev()[0] !== target[0]) {
                target.after(panel);
            }
        }
        return panel;
    }

    function clearPanel() {
        ensurePanel().hide().empty();
        $("#show-move-ai-preview").removeClass("active");
    }

    function closePreview() {
        previewOpen = false;
        clearPanel();
    }

    function scoreRange(move) {
        if (!move.outcomes || !move.outcomes.length) return "0";
        var scores = move.outcomes.map(function(outcome) { return Number(outcome.finalScore); });
        var min = Math.min.apply(Math, scores);
        var max = Math.max.apply(Math, scores);
        return min === max ? String(min) : min + "-" + max;
    }

    function renderTrace(trace) {
        if (!trace || !trace.length) {
            return '<div class="move-ai-preview-trace-empty">No score modifiers.</div>';
        }
        return trace.map(function(entry) {
            var delta = Number(entry.delta) > 0 ? "+" + entry.delta : String(entry.delta);
            return '<div class="move-ai-preview-trace-line">'
                + '<span class="move-ai-preview-trace-delta">' + escapeHtml(delta) + '</span>'
                + '<span class="move-ai-preview-trace-source">' + escapeHtml(entry.flag || "") + '</span>'
                + '<span class="move-ai-preview-trace-label">' + escapeHtml(entry.label || "") + '</span>'
                + '<span class="move-ai-preview-trace-condition">' + escapeHtml(entry.condition || "") + '</span>'
                + '<span class="move-ai-preview-trace-score">' + escapeHtml(entry.scoreBefore) + " -> " + escapeHtml(entry.scoreAfter) + '</span>'
                + '</div>';
        }).join("");
    }

    function renderMove(move) {
        var outcomes = (move.outcomes || []).map(function(outcome) {
            return '<div class="move-ai-preview-outcome">'
                + '<div class="move-ai-preview-outcome-head">Score ' + escapeHtml(outcome.finalScore)
                + ' <span>' + formatPct(outcome.probability) + ' of score paths</span></div>'
                + renderTrace(outcome.trace)
                + '</div>';
        }).join("");

        return '<details class="move-ai-preview-move">'
            + '<summary>'
            + '<span class="move-ai-preview-score">Score ' + escapeHtml(scoreRange(move)) + '</span>'
            + '<span class="move-ai-preview-prob">' + formatPct(move.probability) + '</span>'
            + '</summary>'
            + '<div class="move-ai-preview-outcomes">' + outcomes + '</div>'
            + '</details>';
    }

    function renderResult(result) {
        var html = "";

        if (result.warnings && result.warnings.length) {
            html += '<div class="move-ai-preview-warnings">'
                + result.warnings.map(function(warning) { return '<div>' + escapeHtml(warning) + '</div>'; }).join("")
                + '</div>';
        }

        html += '<div class="move-ai-preview-list">'
            + (result.moves || []).map(renderMove).join("")
            + '</div>';

        ensurePanel().html(html).show();
    }

    function refresh() {
        var panel = ensurePanel();
        if (!enabled) {
            updateStatus("disabled");
            clearPanel();
            return;
        }
        if (!previewOpen) {
            updateStatus("closed");
            clearPanel();
            return;
        }
        if (!canUseMoveAiPreviewSetting()) {
            enabled = false;
            previewOpen = false;
            if (isPlatinumKaizo()) setStoredEnabled(false);
            syncToggle();
            updateStatus("disabled-by-title-or-gen");
            clearPanel();
            return;
        }
        if (!canRender()) {
            updateStatus("unsupported-title-or-gen");
            clearPanel();
            return;
        }
        if ($("#doubles-format").is(":checked")) {
            updateStatus("doubles-not-supported");
            clearPanel();
            return;
        }
        var currentDamageResults = getDamageResults();
        if (!currentDamageResults || !currentDamageResults[1]) {
            updateStatus("missing-damage-results");
            clearPanel();
            return;
        }

        try {
            var attacker = currentDamageResults[1][0] && currentDamageResults[1][0].attacker ? currentDamageResults[1][0].attacker : root.createPokemon($("#p2"));
            var defender = currentDamageResults[1][0] && currentDamageResults[1][0].defender ? currentDamageResults[1][0].defender : root.createPokemon($("#p1"));
            var assumptions = [];
            var aiMask = getAiMask(attacker, assumptions);
            var result = root.PlatinumMoveAiPreview.evaluate({
                attacker: attacker,
                defender: defender,
                field: root.createField ? root.createField().clone().swap() : null,
                damageResults: currentDamageResults[1],
                moveTable: root.backup_moves || (getGlobalValue("backup_data") && getGlobalValue("backup_data").moves) || getGlobalValue("moves"),
                aiMask: aiMask,
                stateOverrides: {},
                options: { branchCap: 2048 }
            });
            result.assumptions = assumptions.concat(result.assumptions || []);
            renderResult(result);
            $("#show-move-ai-preview").addClass("active");
            updateStatus("rendered", {
                panelVisible: true,
                moveCount: result.moves ? result.moves.length : 0
            });
        } catch (err) {
            console.error("[Move AI Preview] failed", err);
            updateStatus("evaluation-error", {
                error: err && err.message ? err.message : String(err)
            });
            clearPanel();
        }
    }

    function normalizeEnabledArg(value) {
        if (typeof value === "undefined") return !enabled;
        if (typeof value === "string") {
            var normalized = value.toLowerCase();
            if (normalized === "on" || normalized === "true" || normalized === "1" || normalized === "enable" || normalized === "enabled") return true;
            if (normalized === "off" || normalized === "false" || normalized === "0" || normalized === "disable" || normalized === "disabled") return false;
            if (normalized === "toggle") return !enabled;
        }
        return !!value;
    }

    function setEnabled(value) {
        var nextEnabled = normalizeEnabledArg(value);
        if (nextEnabled && !canUseMoveAiPreviewSetting()) {
            enabled = false;
            previewOpen = false;
            if (isPlatinumKaizo()) setStoredEnabled(false);
            syncToggle();
            updateStatus("disabled-by-title-or-gen");
            clearPanel();
            return false;
        }
        enabled = nextEnabled;
        setStoredEnabled(enabled);
        syncToggle();
        if (enabled) {
            if (previewOpen) {
                refresh();
                if (!lastStatus.panelVisible && root.console && root.console.info) {
                    root.console.info("[Move AI Preview] enabled but hidden:", lastStatus);
                }
            } else {
                updateStatus("closed");
                clearPanel();
            }
        } else {
            previewOpen = false;
            updateStatus("disabled");
            clearPanel();
        }
        return enabled;
    }

    function syncToggle() {
        var isVisible = canUseMoveAiPreviewSetting();
        $("#toggle-move-ai-preview").toggle(isVisible);
        $("#toggle-move-ai-preview input").prop("checked", isVisible && getEnabled());
        $("#show-move-ai-preview").toggle(isVisible && enabled);
        if (!isVisible || !enabled) {
            previewOpen = false;
            clearPanel();
        }
    }

    function openPreview() {
        if (!enabled || !canUseMoveAiPreviewSetting()) return false;
        previewOpen = true;
        refresh();
        return $("#move-ai-preview:visible").length > 0;
    }

    function togglePreview() {
        if (previewOpen) {
            closePreview();
            return false;
        }
        return openPreview();
    }

    root.MoveAiPreviewSettings = {
        getEnabled: getEnabled,
        setEnabled: setEnabled,
        syncToggle: function() {
            syncToggle();
            setEnabled(getEnabled());
            return enabled;
        },
        canUse: canUseMoveAiPreviewSetting
    };

    root.PlatinumMoveAiPreviewUI = {
        refresh: refresh,
        enable: function() { return setEnabled(true); },
        disable: function() { return setEnabled(false); },
        toggle: function() { return setEnabled(!enabled); },
        open: openPreview,
        close: closePreview,
        togglePreview: togglePreview,
        setEnabled: setEnabled,
        isEnabled: function() { return enabled; },
        isOpen: function() { return previewOpen; }
    };

    root.moveAiPreview = setEnabled;
    root.moveAiPreviewStatus = function() {
        updateStatus(lastStatus.reason || "unknown", {
            panelVisible: $("#move-ai-preview:visible").length > 0
        });
        return lastStatus;
    };
    root.enableMoveAiPreview = function() {
        if (!setEnabled(true)) return false;
        return openPreview();
    };
    root.disableMoveAiPreview = function() { return setEnabled(false); };
    root.toggleMoveAiPreview = function() { return setEnabled(!enabled); };

    $(document).ready(function() {
        updateStatus("disabled");
        syncToggle();
        setEnabled(getEnabled());

        $(document).on("click.moveAiPreview", "#show-move-ai-preview", function(event) {
            event.preventDefault();
            event.stopPropagation();
            togglePreview();
        });

        $(document).on("mousedown.moveAiPreview", function(event) {
            if (!previewOpen) return;
            var target = $(event.target);
            if (target.closest("#move-ai-preview, #show-move-ai-preview").length) return;
            closePreview();
        });
    });
})(window);
