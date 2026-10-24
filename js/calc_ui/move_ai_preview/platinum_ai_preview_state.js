(function(root) {
    "use strict";
    // Preview-only state. Nothing here changes imported sets or saved parties.
    var values = {}, partyEdits = {}, selected = {}, current = {}, openSections = {};
    var C = root.PlatinumAiScript.constants;
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function(c) { return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]; }); }
    function list(s) { return String(s || "").split(",").map(function(v) { return v.trim(); }).filter(Boolean); }
    function defaults() {
        var state = { turnCount: 0, friendship: 255, defenderFriendship: 255, defenderKnownMoves: [], defenderKnownItem: "", damageState: {} };
        ["attacker", "defender"].forEach(function(b) {
            Object.assign(state, { [b + "FirstTurn"]: true, [b + "TurnsActive"]: 0, [b + "ProtectChain"]: 0,
                [b + "StockpileCount"]: 0, [b + "RecycleItem"]: "", [b + "PreviousMove"]: "",
                [b + "ChoiceLockedMove"]: "", [b + "CanUseLastResort"]: false, [b + "QuickClawActivated"]: "auto" });
        });
        return state;
    }
    function cleanId(id) { return String(id || "").replace(/\[\d+\]$/, ""); }
    function party(side) {
        var active = selected[side], ids = [];
        var activeSet = typeof root.getSetDataFromSetId === "function" ? root.getSetDataFromSetId(active) : null;
        if (side === "attacker" && Array.isArray(root.CURRENT_TRAINER_POKS)) {
            ids = root.CURRENT_TRAINER_POKS.map(function(r) { return Array.isArray(r) ? r[0] : r; });
        } else if (side === "defender" && Array.isArray(root.currentParty)) {
            ids = root.currentParty.map(function(name) { return name + " (My Box)"; });
        } else {
            $(side === "attacker" ? ".opposing.trainer-pok-list .trainer-pok.right-side" : ".player-party .trainer-pok.left-side").each(function() { ids.push($(this).attr("data-id")); });
        }
        var activeSkipped = false, rows = [], fainted = root.fainted || [], remembered = typeof root.getRememberedEnemyStateMap === "function" && typeof root.rememberHpStatusEnabled === "function" && root.rememberHpStatusEnabled() ? root.getRememberedEnemyStateMap() : {};
        ids.forEach(function(id, slot) {
            var clean = cleanId(id);
            if (!clean) return;
            // Exclude one active slot, not every matching species/set.
            if (!activeSkipped && clean === cleanId(active)) { activeSkipped = true; return; }
            var set = typeof root.getSetDataFromSetId === "function" ? root.getSetDataFromSetId(clean) : null;
            if (!set || side === "attacker" && activeSet && activeSet.tr_id && set.tr_id !== activeSet.tr_id) return;
            var mon = root.createPokemon(clean), dataId = typeof root.getTrainerPreviewDataId === "function" ? root.getTrainerPreviewDataId(id) : id;
            var slotSet = side === "defender" && typeof root.getPartyPreviewSlotOverride === "function" ? root.getPartyPreviewSlotOverride(mon.name, slot) : null;
            if (slotSet) {
                var ivs = {}, evs = {};
                [["hp","hp"],["atk","at"],["def","df"],["spa","sa"],["spd","sd"],["spe","sp"]].forEach(function(pair) {
                    ivs[pair[0]] = slotSet.ivs && slotSet.ivs[pair[1]] !== undefined ? slotSet.ivs[pair[1]] : mon.ivs[pair[0]];
                    evs[pair[0]] = slotSet.evs && slotSet.evs[pair[1]] !== undefined ? slotSet.evs[pair[1]] : mon.evs[pair[0]];
                });
                mon = new root.calc.Pokemon(mon.gen, mon.name, { level: slotSet.level || mon.level, ivs: ivs, evs: evs,
                    nature: slotSet.nature || mon.nature, ability: slotSet.ability || mon.ability, item: slotSet.item || "",
                    moves: (slotSet.moves || []).map(function(n) { return new root.calc.Move(mon.gen, n); }), overrides: mon.species });
            }
            var saved = side === "attacker" ? remembered[dataId] || remembered[id] : typeof root.getSetDataFromSetId === "function" ? root.getSetDataFromSetId(clean) : null;
            if (slotSet) saved = slotSet;
            var row = { id: side + ":" + id + ":" + slot, name: mon.name, hp: mon.maxHP(), maxHP: mon.maxHP(), status: mon.status,
                moves: mon.moves.map(function(m) { return m.originalName || m.name; }), ivs: mon.ivs, item: mon.item, ability: mon.ability, pp: [1], maxPP: [1] };
            if (saved) {
                if (Number.isFinite(Number(saved.currentHp))) row.hp = Math.max(0, Math.min(row.maxHP, Number(saved.currentHp)));
                if (saved.status) row.status = (root.CALC_STATUS || {})[saved.status] || saved.status;
            }
            if (side === "attacker" && (fainted.includes(id) || fainted.includes(dataId) || fainted.includes(clean))) row.hp = 0;
            Object.assign(row, partyEdits[row.id]);
            row.pp = [row.usedPP ? 0 : 1];
            if (!row.excluded) rows.push(row);
        });
        return rows;
    }
    function snapshot(attacker, defender) {
        ["attacker", "defender"].forEach(function(b) {
            var id = $(b === "attacker" ? "#p2 .set-selector" : "#p1 .set-selector").val();
            if (selected[b] !== id) {
                Object.keys(values).forEach(function(k) { if (k.startsWith(b) || k.startsWith("damageState." + b)) delete values[k]; });
                selected[b] = id;
            }
        });
        var state = defaults();
        Object.keys(values).forEach(function(k) {
            if (k.startsWith("damageState.")) state.damageState[k.slice(12)] = values[k];
            else state[k] = values[k];
        });
        state.attackerParty = party("attacker"); state.defenderParty = party("defender");
        if (state.defenderKnownAbility === "") delete state.defenderKnownAbility;
        var external = root.platinumAiStateOverrides || {};
        state.damageState = Object.assign({}, state.damageState, external.damageState);
        Object.keys(external).forEach(function(k) { if (k !== "damageState") state[k] = external[k]; });
        // Keep scoring flags and the native damage helper in sync.
        ["attacker", "defender"].forEach(function(b) {
            var suffix = b === "attacker" ? "R" : "L";
            var effects = state[b + "MoveEffects"] || 0, volatile = state[b + "VolatileStatus"] || 0;
            [["HealBlocked", "HEAL_BLOCK"], ["AbilitySuppressed", "ABILITY_SUPPRESSED"]].forEach(function(pair) { if (state[b + pair[0]]) effects |= C["MOVE_EFFECT_" + pair[1]]; });
            if (state.damageState[b + "Embargo"]) effects |= C.MOVE_EFFECT_EMBARGO;
            if ($("#leechSeed" + suffix).prop("checked")) effects |= C.MOVE_EFFECT_LEECH_SEED;
            if ($("#powerTrick" + suffix).prop("checked")) effects |= C.MOVE_EFFECT_POWER_TRICK;
            if ($("#foresight" + suffix).prop("checked")) volatile |= C.VOLATILE_CONDITION_FORESIGHT;
            if (state[b + "Tormented"]) volatile |= C.VOLATILE_CONDITION_TORMENT;
            state[b + "MoveEffects"] = effects; state[b + "VolatileStatus"] = volatile;
            [["Ingrain","INGRAIN"],["MagnetRise","MAGNET_RISE"],["MiracleEye","MIRACLE_EYE"],["AbilitySuppressed","ABILITY_SUPPRESSED"],["Embargo","EMBARGO"]].forEach(function(pair) {
                state.damageState[b + pair[0]] = !!(effects & C["MOVE_EFFECT_" + pair[1]]) || !!state.damageState[b + pair[0]];
            });
            if (effects & C.MOVE_EFFECT_ABILITY_SUPPRESSED) state[b + "AbilitySuppressed"] = true;
            if (effects & C.MOVE_EFFECT_MUD_SPORT) state.damageState.mudSport = true;
            if (effects & C.MOVE_EFFECT_WATER_SPORT) state.damageState.waterSport = true;
        });
        current = { state: state, attacker: attacker, defender: defender };
        return state;
    }
    function field(name, label, type, options, limits) {
        var state = current.state, value = name.startsWith("damageState.") ? state.damageState[name.slice(12)] : state[name];
        var attrs = ' data-ai-state="' + name + '"';
        var input;
        if (type === "select") input = '<select' + attrs + '>' + options.map(function(o) { return '<option value="' + esc(o[0]) + '"' + (String(value === undefined ? "" : value) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join("") + '</select>';
        else if (type === "checkbox") input = '<input type="checkbox"' + attrs + (value ? ' checked' : '') + '>';
        else input = '<input type="' + (type === "number" ? "number" : "text") + '"' + attrs + (type === "list" ? ' data-ai-list="1"' : '') + (type === "number" ? ' min="0" max="' + (limits || 999) + '" step="1"' : '') + ' value="' + esc(Array.isArray(value) ? value.join(", ") : value || 0 === value ? value : "") + '"' + (type === "move" ? ' list="ai-history-moves"' : '') + '>';
        return '<label class="move-ai-state-field"><span>' + esc(label) + '</span>' + input + '</label>';
    }
    function section(id, title, body) { return '<details data-ai-section="' + id + '"' + (openSections[id] ? ' open' : '') + '><summary>' + title + '</summary>' + body + '</details>'; }
    function partyHtml(b) {
        var rows = current.state[b + "Party"] || [];
        return '<h4>' + (b === "attacker" ? 'AI reserves' : 'Player reserves') + ' (' + rows.length + ')</h4>' + rows.map(function(m) {
            return '<div class="move-ai-reserve" data-ai-reserve="' + esc(m.id) + '"><strong>' + esc(m.name) + '</strong>'
                + '<label>HP <input aria-label="' + esc(m.name) + ' reserve HP" type="number" min="0" max="' + m.maxHP + '" value="' + m.hp + '" data-ai-party="hp"> / ' + m.maxHP + '</label>'
                + '<label>Status <select data-ai-party="status">' + [["","Healthy"],["slp","Asleep"],["par","Paralyzed"],["brn","Burned"],["psn","Poisoned"],["tox","Badly poisoned"],["frz","Frozen"]].map(function(o) { return '<option value="' + o[0] + '"' + (m.status === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join("") + '</select></label>'
                + '<label><input type="checkbox" data-ai-party="usedPP"' + (m.usedPP ? ' checked' : '') + '> PP spent</label>'
                + '<button type="button" data-ai-remove="' + esc(m.id) + '">Exclude</button>'
                + '<small>' + esc(m.moves.join(" / ")) + '</small></div>';
        }).join("") + (rows.length ? '' : '<small>No reserves in the current party preview.</small>');
    }
    function maskFields(b, kind, ops, prefix) {
        var used = new Set();
        root.PlatinumAiScript.code.forEach(function(ins) { if (ops.includes(ins[0])) used.add(ins[1][1]); });
        var fields = Object.keys(C).filter(function(n) { return n.startsWith(prefix) && used.has(C[n]) && C[n] && n !== prefix + "ALL" && !["MOVE_EFFECT_EMBARGO", "MOVE_EFFECT_HEAL_BLOCK", "MOVE_EFFECT_ABILITY_SUPPRESSED", "MOVE_EFFECT_POWER_TRICK", "MOVE_EFFECT_LEECH_SEED", "VOLATILE_CONDITION_TORMENT", "VOLATILE_CONDITION_FORESIGHT"].includes(n)
                && (kind !== "ExtraSideConditions" || ["SIDE_CONDITION_SAFEGUARD", "SIDE_CONDITION_MIST", "SIDE_CONDITION_FUTURE_SIGHT", "SIDE_CONDITION_LUCKY_CHANT"].includes(n)); });
        return fields.map(function(n) {
            var mask = C[n], label = n.slice(prefix.length).toLowerCase().replace(/_/g, " ");
            return '<label class="move-ai-effect"><input type="checkbox" data-ai-mask="' + b + kind + '" data-ai-bit="' + mask + '"' + ((current.state[b + kind] || 0) & mask ? ' checked' : '') + '> ' + esc(label) + '</label>';
        }).join("");
    }
    function html() {
        $("#move-ai-preview details[data-ai-section]").each(function() { openSections[$(this).attr("data-ai-section")] = this.open; });
        var common = field("turnCount", "Completed battle turns", "number") + field("trickRoom", "Trick Room", "checkbox");
        var memory = field("defenderKnownMoves", "Player moves revealed to AI (comma separated)", "list")
            + field("defenderKnownItem", "Player item revealed to AI", "text")
            + field("defenderKnownAbility", "Player ability revealed to AI", "select", [["","Unrevealed"],[current.defender.ability,current.defender.ability],["None","None (suppressed)"]]);
        var sides = ["attacker", "defender"].map(function(b) {
            var mon = current[b];
            var content = field(b + "FirstTurn", "First turn since entering", "checkbox") + field(b + "TurnsActive", "Completed turns since entering", "number")
                + field(b + "PreviousMove", "Previous move (blank = none)", "move") + field(b + "ProtectChain", "Consecutive successful Protects", "number")
                + field(b === "attacker" ? "friendship" : "defenderFriendship", "Friendship", "number", null, 255);
            if (mon.item === "Quick Claw") content += field(b + "QuickClawActivated", "Quick Claw this turn", "select", [["auto","Average activation chance"],["true","Activated"],["false","Not activated"]]);
            var extra = field(b + "ChoiceLockedMove", "Choice-locked move", "move") + field(b + "DisabledMove", "Disabled move", "move") + field(b + "EncoredMove", "Encored move", "move")
                + field(b + "Taunted", "Taunted", "checkbox") + field(b + "Tormented", "Tormented", "checkbox") + field(b + "HealBlocked", "Heal Block", "checkbox")
                + field(b + "StockpileCount", "Stockpile count", "number", null, 3) + field(b + "RecycleItem", "Consumed item (Recycle)", "text")
                + field(b + "CanUseLastResort", "All other moves used (Last Resort)", "checkbox")
                + field("damageState." + b + "Charge", "Charge boost active", "checkbox")
                + field("damageState." + b + "Roost", "Roost type change active", "checkbox")
                + field(b + "AbilitySuppressed", "Ability suppressed", "checkbox") + field("damageState." + b + "Embargo", "Embargo", "checkbox");
            if (b === "attacker") extra += field(b + "ImprisonedMoves", "Moves blocked by Imprison (comma separated)", "list");
            if (b === "defender") extra += field(b + "Switching", "Switch already selected", "checkbox");
            extra += maskFields(b, "VolatileStatus", ["IfVolatileStatus","IfNotVolatileStatus"], "VOLATILE_CONDITION_")
                + maskFields(b, "MoveEffects", ["IfMoveEffect","IfNotMoveEffect"], "MOVE_EFFECT_")
                + maskFields(b, "ExtraSideConditions", ["IfSideCondition","IfNotSideCondition"], "SIDE_CONDITION_")
                + field(b + "ToxicSpikes", "Toxic Spikes layers", "number", null, 2);
            return section(b, (b === "attacker" ? "AI: " : "Player: ") + esc(mon.name), content + section(b + "effects", "Move locks and other effects", extra));
        }).join("");
        var parties = '<p>Loaded from the trainer and player party previews; the active Pokémon is excluded. Unrecorded reserves start at full HP and PP.</p>'
            + partyHtml("attacker") + partyHtml("defender") + '<button type="button" data-ai-reset-party>Reset reserve edits</button>';
        var table = root.backup_moves || root.moves || {};
        return section("state", "Battle state", common + sides + section("memory", "What the AI has seen", memory) + section("parties", "Reserve Pokémon", parties)
            + '<button type="button" data-ai-reset-history>Reset history to first turn</button>')
            + '<datalist id="ai-history-moves">' + Object.keys(table).map(function(n) { return '<option value="' + esc(n) + '">'; }).join("") + '</datalist>';
    }
    function bind(panel, refresh) {
        panel.off(".aiState");
        panel.on("toggle.aiState", "details[data-ai-section]", function() { openSections[$(this).attr("data-ai-section")] = this.open; });
        // toggle does not bubble in every browser; record open sections before edits.
        function remember() { panel.find("details[data-ai-section]").each(function() { openSections[$(this).attr("data-ai-section")] = this.open; }); }
        panel.on("change.aiState", "[data-ai-state], [data-ai-party], [data-ai-mask]", function(e) {
            e.stopPropagation(); remember();
            var el = $(this), name = el.attr("data-ai-state"), val = this.type === "checkbox" ? this.checked : this.value;
            if (this.type === "number") val = Math.max(0, Math.min(Number(this.max) || 999, Math.floor(Number(val) || 0)));
            if (el.attr("data-ai-list")) val = list(val);
            if (val === "true" || val === "false") val = val === "true";
            if (name) {
                values[name] = val;
                if (name.endsWith("FirstTurn")) values[name.replace("FirstTurn", "TurnsActive")] = val ? 0 : 1;
                if (name.endsWith("TurnsActive")) values[name.replace("TurnsActive", "FirstTurn")] = val === 0;
                if (name.endsWith("AbilitySuppressed")) values["damageState." + name] = val;
            } else if (el.attr("data-ai-mask")) {
                name = el.attr("data-ai-mask"); var bit = Number(el.attr("data-ai-bit"));
                values[name] = this.checked ? (current.state[name] || 0) | bit : (current.state[name] || 0) & ~bit;
            } else {
                var id = el.closest("[data-ai-reserve]").attr("data-ai-reserve");
                partyEdits[id] = Object.assign({}, partyEdits[id], { [el.attr("data-ai-party")]: val });
            }
            refresh();
        });
        panel.on("click.aiState", "[data-ai-reset-party], [data-ai-reset-history], [data-ai-remove]", function(e) {
            e.preventDefault(); e.stopPropagation(); remember();
            if ($(this).is("[data-ai-reset-party]")) partyEdits = {};
            else if ($(this).is("[data-ai-remove]")) partyEdits[$(this).attr("data-ai-remove")] = { excluded: true };
            else values = {};
            refresh();
        });
    }
    root.PlatinumAiPreviewState = { snapshot: snapshot, html: html, bind: bind, defaults: defaults };
})(window);
