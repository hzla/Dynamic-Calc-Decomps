// Gen 5 UI: an optional look for the calculator, styled after the Black 2 / White 2 battle screen (css/gen5.css).
// It is off unless the "Gen 5 UI" setting is on (localStorage.gen5ui = "1") or the page is opened with ?gen5ui=1;
// the <head> sets the html class before the page paints, so there is no flash of the other look.
//
// The stylesheet does most of it. This script keeps a few data attributes current, so the stylesheet can draw art that
// depends on the calc's state (each move's type for the move button frames, the nature's raised and lowered stats), and
// puts game-style pickers over the type, gender and form selects. The selects stay in the page and stay in charge: a
// picker only reads a select's options and sets its value, as choosing from the select would.
(function () {
    var STORAGE_KEY = "gen5ui";
    var root = document.documentElement;
    var STAT_ROWS = { Atk: "at", Def: "df", SpA: "sa", SpD: "sd", Spe: "sp" };

    function enabled() {
        return root.classList.contains("gen5ui");
    }

    // ---------- Party card text ----------
    // In this layout the calc puts whole move names on party cards (abv in player_box.js), and a name too long for its
    // card takes the calc's short form ("H Pump" for Hydro Pump) only then: the card's own width decides, and a wider
    // card gets the whole name back. Names that still don't fit end in an ellipsis (gen5.css).
    var PARTY_LISTS = "#calculator-view .trainer-pok-list:is(.player-party, .tag-partner-preview)";
    var PARTY_MOVE_LINES = ":scope > .trainer-pok-container > .bp-info:not(.nature-info):not(.extra-info)";
    var partyFitQueued = false;

    function shortMoveName(name) {
        var words = String(name).trim().split(/\s+/);
        return words.length > 1 && words[0] ? words[0][0] + " " + words.slice(1).join(" ") : name;
    }

    function fitPartyText() {
        partyFitQueued = false;
        if (!enabled()) return;
        var lines = [];
        document.querySelectorAll(PARTY_LISTS).forEach(function (list) {
            Array.prototype.push.apply(lines, list.querySelectorAll(PARTY_MOVE_LINES));
        });
        // Whole names first, then the ones that overflow take the short form.
        lines.forEach(function (line) {
            var shown = line.textContent;
            var full = line.getAttribute("data-g5-full");
            if (full === null || (shown !== full && shown !== shortMoveName(full))) {
                full = shown;
                line.setAttribute("data-g5-full", full);
            }
            if (shown !== full) line.textContent = full;
        });
        var overflowing = lines.filter(function (line) { return line.scrollWidth > line.clientWidth + 0.5; });
        overflowing.forEach(function (line) {
            var short = shortMoveName(line.getAttribute("data-g5-full"));
            if (short !== line.textContent) line.textContent = short;
        });
    }

    function queuePartyFit() {
        if (partyFitQueued) return;
        partyFitQueued = true;
        requestAnimationFrame(fitPartyText);
    }

    function watchPartyText() {
        var lists = document.querySelectorAll(PARTY_LISTS);
        if (!lists.length) return;
        if (typeof MutationObserver !== "undefined") {
            var added = new MutationObserver(queuePartyFit);
            lists.forEach(function (list) { added.observe(list, { childList: true }); });
        }
        if (typeof ResizeObserver !== "undefined") {
            var resized = new ResizeObserver(queuePartyFit);
            lists.forEach(function (list) { resized.observe(list); });
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(queuePartyFit);
    }

    function setEnabled(on) {
        try {
            localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
        } catch (error) {
            // Storage may be blocked; the setting then lasts until the page closes.
        }
        root.classList.toggle("gen5ui", on);
        if (on) {
            mountPickers();
            applyBand();
            refresh();
        } else {
            unmountPickers();
            removeMoveDamage();
            root.classList.remove("g5-band");
            unmountBand();
        }
        applyTabs(on);
        redrawTabs(on);
        if (typeof displayParty === "function") {
            try {
                displayParty();
            } catch (error) {
                // The party is drawn again with the next change instead.
            }
        }
    }

    // ---------- Box, Fragsheet and Battle Log ----------

    // Labels the Gen 5 UI words differently. The classic text comes back when it is turned off.
    var RELABELS = [
        // The crit toggle beside each move; its tooltip still spells it out.
        ["#calculator-view .crit-btn", "C"],
        ["#box-search-input", "Search by name, move, ability or item", "placeholder"],
        [".box-stat-view-option[data-box-card-stat-view=\"base-stats\"]", "Base stats"],
        ["#box-clear-filters", "Clear filters"],
        ["#import-sheet", "Import"],
        ["#export-sheet", "Export"],
        ["#reload-box-battlelog", "Reload from box and battle log"],
        ["#all-simple-tab", "Totals"],
        ["#all-tab", "By split"],
        ["#stats-tab", "Stats and IVs"],
        ["#reset-sheet", "Reset sheet"],
        ["#load-battle-log-file", "Load battle log"],
        ["#download-edited-battle-log-file", "Download edited attempt"],
        ["#clear-save-file-battle-log", "Clear battle log and download save"],
        [".battle-log-toolbar-toggle > span:first-child", "Important trainers only"]
    ];
    var STAT_TITLE = "Click Row to Show Battle History";
    var G5_STAT_TITLE = "Pick a Pokémon to see its battles";
    var moved = [];

    function relabel(on) {
        RELABELS.forEach(function (entry) {
            document.querySelectorAll(entry[0]).forEach(function (element) {
                var attribute = entry[2];
                if (on) {
                    if (!element.hasAttribute("data-g5-orig")) {
                        element.setAttribute("data-g5-orig", attribute ? (element.getAttribute(attribute) || "") : element.innerHTML);
                    }
                    if (attribute) element.setAttribute(attribute, entry[1]);
                    else element.textContent = entry[1];
                } else if (element.hasAttribute("data-g5-orig")) {
                    if (attribute) element.setAttribute(attribute, element.getAttribute("data-g5-orig"));
                    else element.innerHTML = element.getAttribute("data-g5-orig");
                    element.removeAttribute("data-g5-orig");
                }
            });
        });
        var statTitle = document.getElementById("stat-title");
        if (statTitle) {
            if (on && statTitle.textContent === STAT_TITLE) statTitle.textContent = G5_STAT_TITLE;
            else if (!on && statTitle.textContent === G5_STAT_TITLE) statTitle.textContent = STAT_TITLE;
            else if (!on) statTitle.textContent = statTitle.textContent.replace(/'s battles$/, "'s Battles");
        }
    }

    // Load battle log names the folder it reads in a line beside it, not in the button.
    function loadHint(on) {
        var hint = document.getElementById("g5-load-hint");
        var load = document.getElementById("load-battle-log-file");
        if (on && !hint && load) {
            hint = document.createElement("span");
            hint.id = "g5-load-hint";
            hint.textContent = "Opens the JSON file DeSmuME saves in Battery/Dumps.";
            load.insertAdjacentElement("afterend", hint);
        } else if (!on && hint) {
            hint.remove();
        }
    }

    // Reset sheet joins the sheet's other commands; Delete moves into the battles panel of the Pokémon it deletes.
    function moveButtons(on) {
        if (on) {
            if (moved.length) return;
            [["reset-sheet", "sheet-btns"], ["delete-enc", "frag-history"]].forEach(function (pair) {
                var element = document.getElementById(pair[0]);
                var target = document.getElementById(pair[1]);
                if (!element || !target) return;
                moved.push({ element: element, parent: element.parentNode, next: element.nextSibling });
                target.appendChild(element);
            });
        } else {
            moved.reverse().forEach(function (entry) {
                entry.parent.insertBefore(entry.element, entry.next && entry.next.parentNode === entry.parent ? entry.next : null);
            });
            moved = [];
        }
    }

    function applyTabs(on) {
        relabel(on);
        loadHint(on);
        moveButtons(on);
    }

    // Each tab draws itself differently in the Gen 5 UI, so a switch redraws whichever have been drawn.
    function redrawTabs(on) {
        if (typeof window.renderBoxView === "function") window.renderBoxView(true);
        if (typeof window.renderBattleLogView === "function" && document.getElementById("battle-log-container")) window.renderBattleLogView(true);
        if (window.gridApi && typeof window.refreshTables === "function") {
            try {
                window.gridApi.setGridOption("rowHeight", on ? 56 : 80);
                window.gridApi.setGridOption("headerHeight", on ? 34 : 40);
                window.refreshTables();
                window.gridApi.resetRowHeights();
            } catch (error) {
                // The grid may not be ready yet; it reads the setting when it is created.
            }
        }
    }

    // Still sprites: the Box and the Battle Log show each Pokémon's animated front sprite as a still (its first frame,
    // drawn once on a canvas), and play the animation only while the pointer or focus is on it. Both call
    // g5HydrateStills after they render. A missing sprite falls back to the next source (HD art or the box icon).
    function hydrateStills(container) {
        (container || document).querySelectorAll("canvas.g5-still:not([data-g5-drawn])").forEach(function (canvas) {
            canvas.setAttribute("data-g5-drawn", "");
            var max = String(canvas.getAttribute("data-max") || "140x120").split("x").map(Number);
            var sources = [canvas.getAttribute("data-gif"), canvas.getAttribute("data-fallback")].filter(Boolean);
            var fallbackIsPixelArt = canvas.hasAttribute("data-fallback-pixel");
            var anim = canvas.parentNode ? canvas.parentNode.querySelector("img.g5-anim") : null;
            var image = new Image();
            var index = 0;
            image.onload = function () {
                var width = image.naturalWidth;
                var height = image.naturalHeight;
                if (!width || !height) {
                    image.onerror();
                    return;
                }
                var pixelArt = index === 0 || fallbackIsPixelArt;
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d").drawImage(image, 0, 0);
                var scale = Math.min(pixelArt ? 1.5 : 1, max[0] / width, max[1] / height);
                canvas.style.width = Math.round(width * scale) + "px";
                canvas.style.height = Math.round(height * scale) + "px";
                canvas.classList.toggle("g5-smooth", !pixelArt);
                if (anim && index === 0) {
                    anim.setAttribute("data-src", sources[0]);
                    anim.style.width = canvas.style.width;
                    anim.style.height = canvas.style.height;
                }
            };
            image.onerror = function () {
                index += 1;
                if (index < sources.length) image.src = sources[index];
                else canvas.classList.add("g5-missing");
            };
            image.src = sources[0];
        });
    }

    function playStill(event) {
        var host = event.target && event.target.closest ? event.target.closest(".g5-anim-host") : null;
        var anim = host ? host.querySelector("img.g5-anim[data-src]:not([src])") : null;
        if (!anim) return;
        anim.addEventListener("load", function () { anim.classList.add("g5-ready"); }, { once: true });
        anim.src = anim.getAttribute("data-src");
    }

    // "Roark split"; names that are already a stage of their own, such as "Elite 4", stay as they are.
    window.g5SplitTitle = function (label) {
        var name = String(label || "").trim();
        if (!name) return "Other battles";
        return /elite|champion|league/i.test(name) ? name : name + " split";
    };

    window.g5HydrateStills = hydrateStills;
    document.addEventListener("pointerover", playStill);
    document.addEventListener("focusin", playStill);

    function typeKey(value) {
        var type = String(value || "").trim().toLowerCase();
        return /^[a-z]+$/.test(type) ? type : "";
    }

    function setType(element, value) {
        if (!element) return;
        var key = typeKey(value);
        if (element.getAttribute("data-g5-type") !== key) element.setAttribute("data-g5-type", key);
    }

    function refreshSide(side, letter) {
        var panel = document.getElementById(side);
        if (!panel) return;
        for (var i = 1; i <= 4; i++) {
            var row = panel.querySelector(".move" + i);
            if (!row) continue;
            var typeSelect = row.querySelector("select.move-type");
            var moveSelect = row.querySelector("select.move-selector");
            var move = moveSelect ? moveSelect.value : "";
            var type = !move || move === "(No Move)" ? "" : typeSelect && typeSelect.value;
            // The type's plate goes on the move picker itself, not its row: the plate's pieces are inherited custom
            // properties, and on the row a new type restyled the row's every descendant, the move list's ~1000 options.
            setType(row.querySelector(".select2-container.move-selector .select2-choice"), type);
            setType(typeSelect, typeSelect && typeSelect.value);
            setType(document.querySelector('label[for="resultMove' + letter + i + '"]'), type);
        }
        refreshMoveDamage(panel, side === "p1" ? 0 : 1);
        setType(panel.querySelector("select.type1"), panel.querySelector("select.type1") && panel.querySelector("select.type1").value);
        setType(panel.querySelector("select.type2"), panel.querySelector("select.type2") && panel.querySelector("select.type2").value);

        // The nature's raised and lowered stats, as the summary screen colours them.
        var nature = panel.querySelector("select.nature");
        var text = nature && nature.selectedOptions[0] ? nature.selectedOptions[0].textContent : "";
        var match = /\(\+(\w+), -(\w+)\)/.exec(text);
        Object.keys(STAT_ROWS).forEach(function (stat) {
            var tr = panel.querySelector("tr." + STAT_ROWS[stat]);
            if (!tr) return;
            var mark = match && match[1] === stat ? "up" : match && match[2] === stat ? "down" : "";
            if ((tr.getAttribute("data-g5-nature") || "") !== mark) tr.setAttribute("data-g5-nature", mark);
        });
    }

    // ---------- Move damage ----------
    // Each move row ends with that move's damage as a share of the target's HP: the lowest roll for your moves, the
    // highest for the foe's. The figures come from the same results the results bar shows (moveDesc in %), so the two
    // always agree. css/gen5.css shows the column only on the widest panels, where the row has room for it.
    var MOVE_ROWS = ".move1, .move2, .move3, .move4";

    function damagePercents(result) {
        if (!result || typeof result.moveDesc !== "function") return null;
        try {
            var match = /^(\d+(?:\.\d+)?) - (\d+(?:\.\d+)?)%/.exec(result.moveDesc("%"));
            return match ? [match[1], match[2]] : null;
        } catch (error) {
            return null;
        }
    }

    // The dropdowns some moves add to their row: hits for a multi-hit move, uses in a row for one that lowers its
    // user's stats, and Metronome's streak while that item is held. They show as compact count pickers after C.
    var MOVE_EXTRAS = "select.move-hits, select.stat-drops, select.metronome";

    function shown(element) {
        return getComputedStyle(element).display !== "none";
    }

    function highlightOn() {
        try {
            return localStorage.getItem("highlightMoves") === "1";
        } catch (error) {
            return false;
        }
    }

    function highlightOf(slot) {
        var result = document.getElementById("resultDamageR" + slot);
        var mark = result ? result.getAttribute("data-highlight") : "";
        return mark === "kill" || mark === "crit" ? mark : "";
    }

    // The setting takes effect at once rather than at the next calculation.
    document.addEventListener("click", function (event) {
        if (!enabled() || !event.target.closest || !event.target.closest("#toggle-hl-moves .slider")) return;
        setTimeout(function () {
            if (highlightOn() && typeof highlightMoves === "function" && window.damageResults) highlightMoves();
            refresh();
        }, 0);
    });

    function refreshMoveDamage(panel, sideIndex) {
        var results = window.damageResults && window.damageResults[sideIndex];
        // The most count pickers any row on this side shows (0, 1 or 2): the stylesheet hides the side's damage
        // column when they leave no room for it, so the column is all there or not at all.
        var extras = 0;
        panel.querySelectorAll(MOVE_ROWS).forEach(function (row) {
            var inRow = Array.prototype.filter.call(row.querySelectorAll(MOVE_EXTRAS), shown).length;
            extras = Math.max(extras, inRow);
        });
        if (panel.getAttribute("data-g5-extras") !== String(extras)) panel.setAttribute("data-g5-extras", String(extras));
        for (var i = 1; i <= 4; i++) {
            var row = panel.querySelector(".move" + i);
            if (!row) continue;
            var cell = row.querySelector(":scope > .g5-move-dmg");
            if (!cell) {
                cell = document.createElement("span");
                cell.className = "g5-move-dmg";
                row.appendChild(cell);
            }
            var moveSelect = row.querySelector("select.move-selector");
            var move = moveSelect ? moveSelect.value : "";
            var result = results && results[i - 1];
            var percents = move && move !== "(No Move)" ? damagePercents(result) : null;
            if (root.classList.contains("g5-band")) {
                // The compact layout: the whole range, and the KO chance beneath it.
                var range = percents ? percents[0] + " - " + percents[1] + "%" : "";
                var ko = percents ? koText(result) : "";
                var key = range + "|" + ko;
                if (cell.getAttribute("data-g5-key") !== key) {
                    cell.setAttribute("data-g5-key", key);
                    cell.textContent = "";
                    if (range) {
                        var figure = document.createElement("b");
                        figure.textContent = range;
                        cell.appendChild(figure);
                    }
                    if (ko) {
                        var chance = document.createElement("small");
                        chance.textContent = ko;
                        cell.appendChild(chance);
                    }
                    cell.classList.toggle("g5-zero", !!percents && Number(percents[1]) === 0);
                    cell.title = range ? range + (ko ? ", " + ko : "") : "";
                }
                // Move Highlighting (a setting): the calc marks the foe's moves that can knock your Pokémon out, or
                // can with a critical hit, on its results; the row shows the same.
                var mark = sideIndex === 1 && range && highlightOn() ? highlightOf(i) : "";
                if ((cell.getAttribute("data-g5-ko") || "") !== mark) {
                    if (mark) cell.setAttribute("data-g5-ko", mark);
                    else cell.removeAttribute("data-g5-ko");
                }
                continue;
            }
            if (cell.hasAttribute("data-g5-key")) {
                cell.removeAttribute("data-g5-key");
                cell.classList.remove("g5-zero");
                cell.textContent = "";
            }
            var value = percents ? Number(percents[sideIndex]) : NaN;
            var text = percents ? (value >= 100 ? String(Math.floor(value)) : percents[sideIndex]) + "%" : "";
            var title = percents ? (sideIndex === 0 ? "Lowest roll: " : "Highest roll: ") + text + " of the target's HP" : "";
            if (cell.textContent !== text) cell.textContent = text;
            if (cell.title !== title) cell.title = title;
        }
    }

    // "guaranteed OHKO", "90.4% chance to 3HKO"; nothing for a move that does no damage.
    function koText(result) {
        if (!result || typeof result.kochance !== "function") return "";
        try {
            var chance = result.kochance();
            return chance && chance.text ? chance.text : "";
        } catch (error) {
            return "";
        }
    }

    function removeMoveDamage() {
        document.querySelectorAll(".g5-move-dmg").forEach(function (cell) { cell.remove(); });
        document.querySelectorAll("[data-g5-extras]").forEach(function (panel) { panel.removeAttribute("data-g5-extras"); });
    }

    // A click on a move row's empty space (not on its menu, fields or buttons) picks that move in the results bar, as
    // clicking the move's name there does.
    var ROW_CONTROLS = "select, input, textarea, label, button, a, [tabindex], .select2-container";
    document.addEventListener("click", function (event) {
        if (!enabled() || !event.target.closest) return;
        var row = event.target.closest(MOVE_ROWS);
        var panel = row && row.closest("#p1, #p2");
        var control = event.target.closest(ROW_CONTROLS);
        if (!panel || (control && row.contains(control))) return;
        var slot = /\bmove([1-4])\b/.exec(row.className);
        var input = slot && document.getElementById("resultMove" + (panel.id === "p1" ? "L" : "R") + slot[1]);
        if (input && !input.disabled) input.click();
    });

    var queued = false;
    function refresh() {
        if (queued || !enabled()) return;
        queued = true;
        requestAnimationFrame(function () {
            queued = false;
            // The setting may have been turned off since (its own change event queues a refresh first).
            if (!enabled()) return;
            refreshSide("p1", "L");
            refreshSide("p2", "R");
            placeCounts();
            paintPickers();
            tagSwitchInfo();
            refreshBand();
        });
    }

    // ---------- Compact layout ----------
    // On desktop (wider than 960px) the calculator is two columns, your side and the foe's. Above them a battle bar
    // holds the selected move's full result, the format, the weather and the field; Battle Notes opens as a window you
    // can move and minimise. Each side's title bar has a Side Conditions button for that side's conditions (screens,
    // hazards, Tailwind...), with the ones that are on named beside it. Each side shows its whole set at once: under the
    // set picker, a row of three columns (the sprite with the held item on it, the types, level and gender, HP and form;
    // the stats and stat stages; nature, ability and status), then the four moves across the panel, each ending in its
    // damage and KO chance, then your party and box or the foe's team. Your box ends with the import buttons.
    // The calc's elements stay inside the elements its code looks in (#p1, #p2, .field-info, each .info-group); the
    // stylesheet places them, and this moves a few of them (the sprite, the field, the notes) and adds the HP field
    // and the item button, all undone when the layout ends.
    var BAND_QUERY = "(min-width: 961px)";
    var bandMedia = window.matchMedia ? window.matchMedia(BAND_QUERY) : null;

    var SIDES = [
        { id: "p1", content: ".player-panel-content" },
        { id: "p2", content: ".opposing-panel-content" }
    ];

    function bandMode() {
        return enabled() && !!bandMedia && bandMedia.matches;
    }

    // Each side's sprite sits in a tile at the top of the set's first column, the held item's button on it.
    // ---------- Layout states ----------
    // Some of the layout follows the calc's own state: the weather tints the title bars, a side without a form picker
    // gives the set picker the whole line, and a level cap moves the level row. The calc changes these through classes
    // and inline styles deep in the page. Matching them with :has() made every change in the page (each option the calc
    // swaps in a list, each field it shows or hides) re-check the whole calculator and restyle its thousands of
    // <option>s, so they are copied here into attributes the stylesheet reads.
    var WEATHERS = [["snow", ".field-info.snow, .field-info.hail"], ["sand", ".field-info.sand"], ["rain", ".field-info.rain"], ["sun", ".field-info.sun"]];
    var stateObserver = null;

    function setState(element, name, value) {
        if (!element) return;
        if (value === null) {
            if (element.hasAttribute(name)) element.removeAttribute(name);
        } else if (element.getAttribute(name) !== value) {
            element.setAttribute(name, value);
        }
    }

    function sideContent(side) {
        var fieldset = document.getElementById(side.id);
        return fieldset && fieldset.querySelector(":scope > " + side.content);
    }

    function formeRow(content) {
        return content && content.querySelector(":scope > .info-group.top > div:nth-child(2)");
    }

    function syncStates() {
        var view = document.getElementById("calculator-view");
        if (!view) return;
        // The last weather rule the stylesheet had wins, so the weathers are tried in that order backwards.
        var weather = null;
        for (var i = 0; i < WEATHERS.length && weather === null; i++) {
            if (view.querySelector(WEATHERS[i][1])) weather = WEATHERS[i][0];
        }
        SIDES.forEach(function (side) {
            setState(document.getElementById(side.id), "data-g5-weather", weather);
            var content = sideContent(side);
            if (!content) return;
            var row = formeRow(content);
            var style = row ? row.getAttribute("style") || "" : "";
            var noForme = !!row && (row.classList.contains("hide") || style.indexOf("display: none") !== -1) && style.indexOf("display: block") === -1;
            setState(content, "data-g5-noforme", noForme ? "" : null);
            setState(content, "data-g5-cap", content.querySelector("#panel-lvl-cap:not([hidden])") ? "" : null);
        });
    }

    function mountStates() {
        if (!stateObserver && typeof MutationObserver !== "undefined") {
            stateObserver = new MutationObserver(syncStates);
            document.querySelectorAll("#calculator-view .field-info").forEach(function (info) {
                stateObserver.observe(info, { attributes: true, attributeFilter: ["class"] });
            });
            SIDES.forEach(function (side) {
                var row = formeRow(sideContent(side));
                if (row) stateObserver.observe(row, { attributes: true, attributeFilter: ["class", "style"] });
            });
            var cap = document.getElementById("panel-lvl-cap");
            if (cap) stateObserver.observe(cap, { attributes: true, attributeFilter: ["hidden"] });
        }
        syncStates();
    }

    function unmountStates() {
        if (stateObserver) {
            stateObserver.disconnect();
            stateObserver = null;
        }
        SIDES.forEach(function (side) {
            setState(document.getElementById(side.id), "data-g5-weather", null);
            var content = sideContent(side);
            setState(content, "data-g5-noforme", null);
            setState(content, "data-g5-cap", null);
        });
    }

    function mountBand() {
        SIDES.forEach(function (side) {
            var fieldset = document.getElementById(side.id);
            var content = fieldset && fieldset.querySelector(":scope > " + side.content);
            if (!content || content.querySelector(":scope > .g5-tile")) return;
            var tile = document.createElement("div");
            tile.className = "g5-tile";
            content.insertBefore(tile, content.querySelector(":scope > .info-group.top"));
        });
    }

    // Read .sav, Sync, Download .sav, Clear Imported Sets and DeSmuME fill your box, so in this layout they sit in a
    // row at the foot of the box. The Showdown text box opens from that row only when wanted (or when Export writes
    // into it). The calc's own elements move there whole and move back when the layout ends; its code finds them by id.
    var boxIO = null;
    var PASTE_LABEL = "Import from Showdown";

    function setPasteOpen(open) {
        if (!boxIO) return;
        boxIO.bar.classList.toggle("g5-paste-open", open);
        boxIO.toggle.setAttribute("aria-expanded", open ? "true" : "false");
        boxIO.toggle.setAttribute("aria-pressed", open ? "true" : "false");
    }

    function mountBoxIO() {
        if (boxIO) return;
        var wrapper = document.getElementById("import-1_wrapper");
        var fieldset = wrapper && wrapper.closest("fieldset.poke-import");
        var panel = document.querySelector("#calculator-view .mobile-side-panel-p1");
        var p1 = document.getElementById("p1");
        if (!wrapper || !fieldset || !panel || !p1) return;
        var bar = document.createElement("div");
        bar.className = "g5-boxio";
        bar.setAttribute("role", "group");
        bar.setAttribute("aria-label", "Import to your box");
        var toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "g5-paste-toggle";
        toggle.textContent = PASTE_LABEL;
        toggle.title = "Paste sets in Showdown format to add them to your box";
        toggle.addEventListener("click", function () {
            var open = !bar.classList.contains("g5-paste-open");
            setPasteOpen(open);
            var text = bar.querySelector("textarea.import-team-text");
            if (open && text) text.focus();
        });
        var moved = [];
        [wrapper, fieldset.querySelector(":scope > #desmume"), fieldset.querySelector(":scope > .importedSetsOptions")].forEach(function (element) {
            if (!element) return;
            moved.push({ element: element, parent: element.parentNode, next: element.nextSibling });
            bar.appendChild(element);
        });
        bar.insertBefore(toggle, bar.firstChild.nextSibling);
        p1.insertAdjacentElement("afterend", bar);
        fieldset.classList.add("g5-emptied");
        boxIO = { bar: bar, toggle: toggle, moved: moved, fieldset: fieldset };
        setPasteOpen(false);
    }

    function unmountBoxIO() {
        if (!boxIO) return;
        boxIO.moved.slice().reverse().forEach(function (entry) {
            entry.parent.insertBefore(entry.element, entry.next && entry.next.parentNode === entry.parent ? entry.next : null);
        });
        boxIO.fieldset.classList.remove("g5-emptied");
        boxIO.bar.remove();
        boxIO = null;
    }

    // Export writes the set into the text box, so it opens to show it.
    document.addEventListener("click", function (event) {
        if (boxIO && event.target.closest && event.target.closest("#exportL, #exportR, #exportAllL")) setPasteOpen(true);
    });

    // The sprite moves into its tile; the HP group gets the HP field. Everything else stays where the calc put it.
    var sideMover = null;
    var hpFields = [];

    function mountSideFields() {
        if (sideMover) return;
        sideMover = new Mover();
        SIDES.forEach(function (side) {
            var fieldset = document.getElementById(side.id);
            var content = fieldset && fieldset.querySelector(":scope > " + side.content);
            var tile = content && content.querySelector(":scope > .g5-tile");
            if (!tile) return;
            sideMover.move(fieldset.querySelector(":scope > img.poke-sprite"), tile, tile.firstChild);
            var group = content.querySelector(":scope > .info-group.hp-cntrl");
            if (group) mountHpField(fieldset, group);
        });
        root.classList.add("g5-side-fields");
    }

    function unmountSideFields() {
        if (sideMover) sideMover.restore();
        sideMover = null;
        hpFields.forEach(function (field) {
            if (field.frame) cancelAnimationFrame(field.frame);
            field.control.remove();
        });
        hpFields = [];
        root.classList.remove("g5-side-fields");
    }

    // ---------- HP ----------
    // One field holds the current HP over the maximum and the percent, with a gauge along its foot in the calc's HP bar
    // colours. Drag across it (or click a spot) to set the HP; click a number to type it. As a slider it takes the
    // arrow keys (1 HP), Page Up and Down (a tenth), Home and End; Enter or a digit starts typing the HP. It writes into
    // the calc's own HP fields, which stay in the page out of sight. The calc's per-turn chip damage and healing
    // (weather, status, Leftovers, berries) shows under it, as the calc writes it, and as a band on the gauge.
    function hpPercent(current, max) {
        if (!max) return 0;
        var percent = Math.round(100 * current / max);
        if (percent === 0 && current > 0) percent = 1;
        else if (percent === 100 && current < max) percent = 99;
        return percent;
    }

    function hpValues(field) {
        var max = parseInt(field.maxEl.textContent, 10) || 0;
        var current = field.pending !== null ? field.pending : parseInt(field.current.value, 10);
        if (isNaN(current)) current = max;
        current = Math.max(0, Math.min(max, current));
        var percent = field.pending !== null ? hpPercent(current, max) : parseInt(field.percent.value, 10);
        if (isNaN(percent)) percent = hpPercent(current, max);
        return { max: max, current: current, percent: percent };
    }

    // The net HP a turn's chip damage and healing would move, from the calc's own chip list ("-13 per turn",
    // "+13 per turn"; a berry's line reads differently and is left out of the band).
    function chipNet(field) {
        var net = 0;
        field.group.querySelectorAll(".chip-damage-list .chip-damage").forEach(function (chip) {
            var match = /^([+-])\s*(\d+)\s+per turn/.exec(chip.textContent.trim());
            if (match) net += (match[1] === "+" ? 1 : -1) * Number(match[2]);
        });
        return net;
    }

    function paintHp(field) {
        var v = hpValues(field);
        var share = v.max ? 100 * v.current / v.max : 0;
        if (field.curButton.textContent !== String(v.current)) field.curButton.textContent = String(v.current);
        var maxText = "/" + v.max;
        if (field.maxLabel.textContent !== maxText) field.maxLabel.textContent = maxText;
        var pctText = v.percent + "%";
        if (field.pctButton.textContent !== pctText) field.pctButton.textContent = pctText;
        field.fill.style.width = share.toFixed(1) + "%";
        // The calc's own HP bar colours: green over half, yellow over a fifth, red below.
        field.fill.className = share > 50 ? "g5-hp-green" : share > 20 ? "g5-hp-yellow" : "g5-hp-red";
        // A turn's chip: the HP it takes (from the end of the fill back) or gives (past the end of the fill).
        var net = field.pending === null && v.max ? chipNet(field) : 0;
        var after = Math.max(0, Math.min(v.max, v.current + net));
        var from = Math.min(v.current, after), to = Math.max(v.current, after);
        field.chip.hidden = from === to;
        field.chip.className = net < 0 ? "g5-hp-chip-down" : "g5-hp-chip-up";
        field.chip.style.left = (v.max ? 100 * from / v.max : 0).toFixed(1) + "%";
        field.chip.style.width = (v.max ? 100 * (to - from) / v.max : 0).toFixed(1) + "%";
        var name = speciesOf(field.fieldset);
        field.control.setAttribute("aria-label", (name ? name + "’s" : "Pokémon’s") + " HP");
        field.control.setAttribute("aria-valuemax", String(v.max));
        field.control.setAttribute("aria-valuenow", String(v.current));
        field.control.setAttribute("aria-valuetext", v.current + " of " + v.max + " HP, " + v.percent + "%");
    }

    function sendHp(field, value) {
        if (String(value) === field.current.value) return;
        field.current.value = String(value);
        field.current.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Writes the HP into the calc's field as if typed, so the calc works out the percent and recalculates.
    function commitHp(field, value) {
        var max = hpValues(field).max;
        var current = Math.max(0, Math.min(max, Math.round(value)));
        if (field.frame) cancelAnimationFrame(field.frame);
        field.frame = 0;
        field.pending = null;
        sendHp(field, current);
        paintHp(field);
    }

    // While dragging, the field follows the pointer and the calc catches up once a frame.
    function setHpLive(field, value) {
        var max = hpValues(field).max;
        field.pending = Math.max(0, Math.min(max, Math.round(value)));
        paintHp(field);
        if (field.frame) return;
        field.frame = requestAnimationFrame(function () {
            field.frame = 0;
            if (field.pending !== null) sendHp(field, field.pending);
        });
    }

    function hpFromX(field, clientX) {
        var rect = field.control.getBoundingClientRect();
        var share = rect.width ? (clientX - rect.left) / rect.width : 1;
        return Math.max(0, Math.min(1, share)) * hpValues(field).max;
    }

    function editHp(field, which, firstKey) {
        if (field.editing) return;
        var button = which === "percent" ? field.pctButton : field.curButton;
        var source = which === "percent" ? field.percent : field.current;
        var input = make("input", "g5-hp-edit" + (which === "percent" ? " g5-hp-edit-pct" : ""));
        input.type = "text";
        input.inputMode = "numeric";
        input.setAttribute("aria-label", which === "percent" ? "HP percent" : "Current HP");
        input.value = firstKey || source.value;
        button.hidden = true;
        button.insertAdjacentElement("afterend", input);
        field.editing = { input: input };
        input.focus({ preventScroll: true });
        if (!firstKey) input.select();
        var done = function (keep, refocus) {
            if (!field.editing) return;
            var number = parseInt(input.value, 10);
            field.editing = null;
            input.remove();
            button.hidden = false;
            if (keep && !isNaN(number)) {
                var limit = which === "percent" ? 100 : hpValues(field).max;
                var value = String(Math.max(0, Math.min(limit, number)));
                if (value !== source.value) {
                    source.value = value;
                    source.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }
            paintHp(field);
            if (refocus) field.control.focus({ preventScroll: true });
        };
        input.addEventListener("keydown", function (event) {
            event.stopPropagation();
            if (event.key === "Enter") {
                event.preventDefault();
                done(true, true);
            } else if (event.key === "Escape") {
                event.preventDefault();
                done(false, true);
            }
        });
        input.addEventListener("blur", function () { done(true, false); });
    }

    function mountHpField(fieldset, group) {
        var current = group.querySelector("input.current-hp");
        var percent = group.querySelector("input.percent-hp");
        var maxEl = group.querySelector(".max-hp");
        if (!current || !percent || !maxEl) return;
        var control = make("div", "g5-hp");
        control.setAttribute("role", "slider");
        control.setAttribute("tabindex", "0");
        control.setAttribute("aria-valuemin", "0");
        control.title = "Drag to set the HP, or click a number to type it";
        var label = make("span", "g5-hp-label", "HP");
        label.setAttribute("aria-hidden", "true");
        var curButton = make("button", "g5-hp-num g5-hp-cur");
        curButton.type = "button";
        curButton.tabIndex = -1;
        curButton.title = "Type the current HP";
        var maxLabel = make("span", "g5-hp-max");
        var pctButton = make("button", "g5-hp-num g5-hp-pct");
        pctButton.type = "button";
        pctButton.tabIndex = -1;
        pctButton.title = "Type the HP percent";
        var gauge = make("span", "g5-hp-gauge");
        gauge.setAttribute("aria-hidden", "true");
        var fill = make("i", "");
        var chip = make("b", "");
        chip.hidden = true;
        gauge.append(fill, chip);
        control.append(label, curButton, maxLabel, pctButton, gauge);
        group.insertBefore(control, group.firstChild);
        var field = { fieldset: fieldset, group: group, control: control, curButton: curButton, maxLabel: maxLabel, pctButton: pctButton,
            fill: fill, chip: chip, current: current, percent: percent, maxEl: maxEl, pending: null, frame: 0, editing: null };

        control.addEventListener("pointerdown", function (event) {
            if (event.button !== 0 || (event.target.closest && event.target.closest(".g5-hp-edit"))) return;
            event.preventDefault();
            control.focus({ preventScroll: true });
            var startX = event.clientX;
            var number = event.target.closest && event.target.closest(".g5-hp-num");
            var dragging = false;
            control.setPointerCapture(event.pointerId);
            var stop = function () {
                control.removeEventListener("pointermove", move);
                control.removeEventListener("pointerup", up);
                control.removeEventListener("pointercancel", cancel);
                control.classList.remove("g5-hp-drag");
            };
            var move = function (moveEvent) {
                if (!dragging && Math.abs(moveEvent.clientX - startX) < 4) return;
                dragging = true;
                control.classList.add("g5-hp-drag");
                setHpLive(field, hpFromX(field, moveEvent.clientX));
            };
            var up = function (upEvent) {
                stop();
                if (!dragging && number) editHp(field, number === pctButton ? "percent" : "current");
                else commitHp(field, hpFromX(field, upEvent.clientX));
            };
            var cancel = function () {
                stop();
                if (dragging) commitHp(field, field.pending !== null ? field.pending : hpValues(field).current);
            };
            control.addEventListener("pointermove", move);
            control.addEventListener("pointerup", up);
            control.addEventListener("pointercancel", cancel);
        });

        control.addEventListener("keydown", function (event) {
            if (event.target !== control) return;
            var v = hpValues(field);
            var tenth = Math.max(1, Math.round(v.max / 10));
            var next = null;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = v.current - 1;
            else if (event.key === "ArrowRight" || event.key === "ArrowUp") next = v.current + 1;
            else if (event.key === "PageDown") next = v.current - tenth;
            else if (event.key === "PageUp") next = v.current + tenth;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = v.max;
            else if (event.key === "Enter" || event.key === "F2") {
                event.preventDefault();
                editHp(field, "current");
                return;
            } else if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                editHp(field, "current", event.key);
                return;
            }
            if (next === null) return;
            event.preventDefault();
            commitHp(field, next);
        });

        hpFields.push(field);
        paintHp(field);
    }

    function unmountBand() {
        unmountStates();
        unmountItemPickers();
        unmountSideFields();
        unmountBoxIO();
        unmountBattleBar();
        document.querySelectorAll(".g5-tile").forEach(function (element) { element.remove(); });
        SIDES.forEach(function (side) {
            var fieldset = document.getElementById(side.id);
            if (!fieldset) return;
            fieldset.style.removeProperty("--g5-band-pad");
            var first = fieldset.querySelector(".move1");
            if (first) first.style.removeProperty("--g5-band-pad");
        });
        document.querySelectorAll("#calculator-view .g5-on").forEach(function (row) { row.classList.remove("g5-on"); });
        document.querySelectorAll("#calculator-view .g5-dmg-wrap").forEach(function (row) { row.classList.remove("g5-dmg-wrap"); });
        document.querySelectorAll("#calculator-view .g5-ko-off").forEach(function (cell) { cell.classList.remove("g5-ko-off"); });
        var view = document.getElementById("calculator-view");
        if (view) view.style.removeProperty("--g5-band-h");
    }

    function applyBand() {
        var on = bandMode();
        var changed = root.classList.contains("g5-band") !== on;
        root.classList.toggle("g5-band", on);
        if (on) {
            mountBand();
            mountBoxIO();
            mountSideFields();
            mountBattleBar();
            mountItemPickers();
            mountStates();
        } else {
            unmountStates();
            unmountItemPickers();
            unmountBattleBar();
            unmountBoxIO();
            unmountSideFields();
            document.querySelectorAll(".g5-tile").forEach(function (element) { element.remove(); });
        }
        if (changed) {
            // The damage cells read the layout.
            document.querySelectorAll(".g5-move-dmg").forEach(function (cell) { cell.removeAttribute("data-g5-key"); });
            refresh();
        }
        syncBand();
    }

    // Moves a calc element into the layout and remembers where it came from.
    function Mover() {
        this.list = [];
    }
    Mover.prototype.move = function (element, target, before) {
        if (!element || !target) return;
        this.list.push({ element: element, parent: element.parentNode, next: element.nextSibling });
        target.insertBefore(element, before || null);
    };
    Mover.prototype.restore = function () {
        this.list.slice().reverse().forEach(function (entry) {
            entry.parent.insertBefore(entry.element, entry.next && entry.next.parentNode === entry.parent ? entry.next : null);
        });
        this.list = [];
    };

    function make(tag, className, text) {
        var element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    }

    // ---------- The battle bar: the full result, then format, weather and field, then Battle Notes ----------
    var battleBar = null;
    var NOTES_KEY = "g5Notes";

    function mountBattleBar() {
        if (battleBar) return;
        var view = document.getElementById("calculator-view");
        var wrapper = view && view.querySelector(":scope > .panel-wrapper");
        var result = view && view.querySelector(".main-result-group");
        var field = view && view.querySelector("fieldset.field-info");
        if (!wrapper || !result || !field) return;
        var mover = new Mover();
        var created = [];

        var bar = make("div", "g5-battlebar");
        bar.setAttribute("role", "region");
        bar.setAttribute("aria-label", "Result and field");
        var left = make("div", "g5-bb-result");
        var acts = make("div", "g5-bb-acts");
        var right = make("div", "g5-bb-field");
        var notesButton = make("button", "g5-notes-btn", "Battle Notes");
        notesButton.type = "button";
        notesButton.setAttribute("aria-haspopup", "dialog");
        bar.append(left, right, notesButton);
        view.insertBefore(bar, wrapper);
        created.push(bar);

        mover.move(result, left);
        left.appendChild(acts);
        ["show-ai", "show-move-ai-preview", "sync-battle"].forEach(function (id) {
            mover.move(document.getElementById(id), acts);
        });
        mover.move(field, right);

        // Format, weather and field each get a labelled row (inside .field-info, where the calc looks for them).
        var rows = {};
        [["format", "Format"], ["weather", "Weather"], ["field", "Field"]].forEach(function (pair) {
            var row = make("div", "g5-frow");
            row.setAttribute("data-row", pair[0]);
            var label = make("span", "g5-flabel", pair[1]);
            label.id = "g5-flabel-" + pair[0];
            var body = make("div", "g5-fbody");
            body.setAttribute("role", "group");
            body.setAttribute("aria-labelledby", label.id);
            row.append(label, body);
            field.appendChild(row);
            created.push(row);
            rows[pair[0]] = body;
        });
        mover.move(field.querySelector('[aria-labelledby="selectBattleFormatInstruction"]'), rows.format);
        mover.move(document.getElementById("weather-bar"), rows.weather);
        mover.move(field.querySelector('[aria-labelledby="selectGscWeatherInstruction"]'), rows.weather);
        var gravity = document.getElementById("gravity");
        mover.move(gravity && gravity.parentNode, rows.field);
        mover.move(document.getElementById("terrain-bar"), rows.field);
        mover.move(field.querySelector(".cascade-effects"), rows.field);
        // The rarer conditions on both sides (Magic Room, Wonder Room...) open from More field, under the Field row.
        var moreToggle = document.getElementById("toggle-additional-field-options");
        var more = document.getElementById("additional-field-options");
        mover.move(moreToggle, rows.field);
        mover.move(more, rows.field);
        mover.move(document.getElementById("pokeweb-opening-global"), more);
        if (moreToggle) {
            moreToggle.setAttribute("role", "button");
            moreToggle.setAttribute("tabindex", "0");
            moreToggle.setAttribute("aria-expanded", "false");
            moreToggle.setAttribute("aria-label", "More field conditions");
            if (more) moreToggle.setAttribute("aria-controls", "additional-field-options");
        }
        var sync = document.getElementById("sync-battle");
        if (sync) {
            sync.setAttribute("role", "button");
            sync.setAttribute("tabindex", "0");
        }

        // Each side's conditions: the calc's table of both sides, shown one side at a time from a side's title bar.
        var pop = make("div", "");
        pop.id = "g5-sidepop";
        pop.setAttribute("role", "dialog");
        pop.hidden = true;
        var head = make("div", "g5-sidepop-head");
        var title = make("h2", "", "Side conditions");
        var close = make("button", "", "Close");
        close.type = "button";
        close.addEventListener("click", function () { closeSidePop(true); });
        head.append(title, close);
        pop.appendChild(head);
        field.appendChild(pop);
        created.push(pop);
        mover.move(field.querySelector("table.field"), pop);
        mover.move(document.getElementById("pokeweb-opening-side-l"), pop);
        mover.move(document.getElementById("pokeweb-opening-side-r"), pop);
        pop.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                closeSidePop(true);
            }
        });

        SIDES.forEach(function (side) {
            var legend = document.querySelector("#" + side.id + " > legend");
            if (!legend) return;
            var sum = make("span", "g5-sidesum");
            sum.setAttribute("data-g5-side", side.id === "p1" ? "L" : "R");
            var button = make("button", "g5-sidebtn", "Side Conditions");
            button.type = "button";
            button.setAttribute("aria-haspopup", "dialog");
            button.setAttribute("aria-expanded", "false");
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                openSidePop(side.id === "p1" ? "L" : "R", button);
            });
            legend.append(sum, button);
            created.push(sum, button);
        });

        var notes = mountNotes(view, created, mover);
        notesButton.addEventListener("click", function () {
            setNotes(notes && notes.win.hidden ? "open" : notes && notes.state === "min" ? "open" : "closed");
        });
        battleBar = { mover: mover, created: created, notes: notes, notesButton: notesButton };
        refreshBattleBar();
        setNotes(notesState().state, true);
    }

    function unmountBattleBar() {
        if (!battleBar) return;
        closeSidePop(false);
        setMore(false);
        ["toggle-additional-field-options", "sync-battle"].forEach(function (id) {
            var element = document.getElementById(id);
            if (!element) return;
            ["role", "tabindex", "aria-expanded", "aria-label", "aria-controls"].forEach(function (name) { element.removeAttribute(name); });
        });
        document.querySelectorAll("#calculator-view .g5-off").forEach(function (element) {
            element.classList.remove("g5-off");
            if (!element.className) element.removeAttribute("class");
        });
        battleBar.mover.restore();
        battleBar.created.forEach(function (element) { element.remove(); });
        battleBar = null;
    }

    // More field opens as a pop-up of its own here, so the calc's Show More setting (and its saved state) is left as
    // it was for the classic layout.
    function setMore(on) {
        var field = document.querySelector("#calculator-view .g5-battlebar .field-info");
        var toggle = document.getElementById("toggle-additional-field-options");
        if (!field) return;
        if (on) field.setAttribute("data-g5-more", "");
        else field.removeAttribute("data-g5-more");
        if (toggle) toggle.setAttribute("aria-expanded", String(!!on));
    }

    document.addEventListener("click", function (event) {
        if (!battleBar) return;
        var toggle = event.target.closest && event.target.closest("#toggle-additional-field-options");
        if (!toggle || !toggle.closest(".g5-battlebar")) return;
        event.stopPropagation();
        event.preventDefault();
        closeSidePop(false);
        setMore(toggle.getAttribute("aria-expanded") !== "true");
    }, true);

    document.addEventListener("keydown", function (event) {
        if (!battleBar) return;
        var target = event.target;
        if ((event.key === "Enter" || event.key === " ") && target.closest && target.closest(".g5-battlebar") &&
            (target.id === "toggle-additional-field-options" || target.id === "sync-battle")) {
            event.preventDefault();
            target.click();
        } else if (event.key === "Escape" && target.closest && target.closest("#additional-field-options, #toggle-additional-field-options")) {
            setMore(false);
            var toggle = document.getElementById("toggle-additional-field-options");
            if (toggle) toggle.focus({ preventScroll: true });
        }
    });

    document.addEventListener("pointerdown", function (event) {
        if (!battleBar || !event.target.closest) return;
        if (event.target.closest("#additional-field-options, #toggle-additional-field-options")) return;
        setMore(false);
    }, true);

    // ---------- Each side's field ----------
    function sideSummary(letter) {
        var table = document.querySelector("#calculator-view table.field");
        if (!table) return "";
        var names = [];
        var hidden = function (input) { return !!input.closest('.hide, [hidden], [style*="display: none"]'); };
        table.querySelectorAll((letter === "L" ? ".left" : ".right") + " input:checked").forEach(function (input) {
            if (hidden(input)) return;
            if (input.type === "radio") {
                if (/^spikes/.test(input.name) && input.value !== "0") names.push(input.value + " Spikes");
                return;
            }
            var label = table.querySelector('label[for="' + input.id + '"]');
            var text = label ? label.textContent.trim() : input.id;
            names.push(text === "LScreen" ? "Light Screen" : text);
        });
        var opening = document.getElementById(letter === "L" ? "pokeweb-opening-side-l" : "pokeweb-opening-side-r");
        var details = document.getElementById("pokeweb-opening-fields");
        if (opening && details && !details.hidden) {
            opening.querySelectorAll("input:checked").forEach(function (input) {
                var label = input.closest("label");
                if (label) names.push(label.textContent.trim());
            });
            opening.querySelectorAll("select").forEach(function (select) {
                if (select.value && select.value !== "0") names.push(select.value + " Toxic Spikes");
            });
        }
        return names.join(", ");
    }

    function refreshBattleBar() {
        if (!battleBar) return;
        var details = document.getElementById("pokeweb-opening-fields");
        var opening = !!details && !details.hidden;
        ["pokeweb-opening-global", "pokeweb-opening-side-l", "pokeweb-opening-side-r"].forEach(function (id) {
            var element = document.getElementById(id);
            if (element) element.classList.toggle("g5-off", !opening);
        });
        // More field only when this game has something in it.
        var more = document.getElementById("additional-field-options");
        var toggle = document.getElementById("toggle-additional-field-options");
        if (more && toggle) {
            var any = Array.prototype.some.call(more.children, function (child) {
                return !child.classList.contains("g5-off") && !child.hidden && child.style.display !== "none" && !child.classList.contains("hide") && child.children.length > 0;
            });
            toggle.classList.toggle("g5-off", !any);
            if (!any) setMore(false);
        }
        var notes = battleBar.notes;
        if (notes) {
            var fieldset = notes.win.querySelector(".g5-notes-body > fieldset");
            var off = !!fieldset && fieldset.style.display === "none";
            battleBar.notesButton.hidden = off;
            if (off && notes.state !== "closed") {
                notes.win.hidden = true;
                notes.pill.hidden = true;
            }
        }
        refreshSideSummaries();
    }

    function refreshSideSummaries() {
        document.querySelectorAll("#calculator-view .g5-sidesum").forEach(function (sum) {
            var text = sideSummary(sum.getAttribute("data-g5-side"));
            if (sum.textContent !== text) sum.textContent = text;
            sum.title = text ? "On this side: " + text : "";
        });
    }

    function openSidePop(letter, button) {
        var pop = document.getElementById("g5-sidepop");
        if (!pop) return;
        if (!pop.hidden && pop.getAttribute("data-side") === letter) {
            closeSidePop(true);
            return;
        }
        closeSidePop(false);
        closePicker(false);
        var fieldset = document.getElementById(letter === "L" ? "p1" : "p2");
        var name = fieldset ? speciesOf(fieldset) : "";
        pop.querySelector(".g5-sidepop-head h2").textContent = (name ? name + "’s" : letter === "L" ? "Your" : "The foe’s") + " side conditions";
        pop.setAttribute("aria-label", pop.querySelector(".g5-sidepop-head h2").textContent);
        pop.setAttribute("data-side", letter);
        pop.hidden = false;
        pop.g5Button = button;
        button.setAttribute("aria-expanded", "true");
        // Under the button, its right edges level, kept inside the window.
        var host = pop.offsetParent || document.body;
        var hostRect = host.getBoundingClientRect();
        var rect = button.getBoundingClientRect();
        var width = pop.offsetWidth;
        var left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
        pop.style.left = Math.round(left - hostRect.left) + "px";
        pop.style.top = Math.round(rect.bottom + 4 - hostRect.top) + "px";
        var focusable = pop.querySelector(".g5-sidepop-head button");
        if (focusable) focusable.focus({ preventScroll: true });
    }

    function closeSidePop(returnFocus) {
        var pop = document.getElementById("g5-sidepop");
        if (!pop || pop.hidden) return;
        pop.hidden = true;
        var button = pop.g5Button;
        if (button) {
            button.setAttribute("aria-expanded", "false");
            if (returnFocus) button.focus({ preventScroll: true });
        }
    }

    document.addEventListener("pointerdown", function (event) {
        var pop = document.getElementById("g5-sidepop");
        if (!pop || pop.hidden) return;
        if (pop.contains(event.target) || (event.target.closest && event.target.closest(".g5-sidebtn"))) return;
        closeSidePop(false);
    }, true);

    document.addEventListener("change", function (event) {
        if (event.target.closest && event.target.closest("#g5-sidepop")) refreshSideSummaries();
    });

    // ---------- Battle Notes, a window of its own ----------
    function notesState() {
        try {
            var saved = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
            return { state: saved.state === "open" || saved.state === "min" ? saved.state : "closed", x: saved.x, y: saved.y, w: saved.w, h: saved.h };
        } catch (error) {
            return { state: "closed" };
        }
    }

    function saveNotes(patch) {
        try {
            var saved = notesState();
            Object.keys(patch).forEach(function (key) { saved[key] = patch[key]; });
            localStorage.setItem(NOTES_KEY, JSON.stringify(saved));
        } catch (error) {
            // Without storage the window forgets its place when the page closes.
        }
    }

    function mountNotes(view, created, mover) {
        var notesText = document.querySelector("#battle-notes");
        var fieldset = notesText && notesText.closest("fieldset");
        if (!fieldset) return null;
        var win = make("div", "g5-notes");
        win.id = "g5-notes";
        win.setAttribute("role", "dialog");
        win.setAttribute("aria-label", "Battle Notes");
        win.hidden = true;
        var head = make("div", "g5-notes-head");
        var title = make("span", "g5-notes-title", "Battle Notes");
        title.title = "Drag to move";
        var minimise = make("button", "", "Minimize");
        minimise.type = "button";
        var close = make("button", "", "Close");
        close.type = "button";
        head.append(title, minimise, close);
        var body = make("div", "g5-notes-body");
        win.append(head, body);
        var pill = make("button", "g5-notes-pill", "Battle Notes");
        pill.type = "button";
        pill.hidden = true;
        pill.setAttribute("aria-label", "Battle Notes, minimized. Open");
        view.append(win, pill);
        created.push(win, pill);
        mover.move(fieldset, body);

        var saved = notesState();
        if (typeof saved.x === "number") win.style.left = saved.x + "px";
        if (typeof saved.y === "number") win.style.top = saved.y + "px";
        if (typeof saved.w === "number") win.style.width = saved.w + "px";
        if (typeof saved.h === "number") win.style.height = saved.h + "px";

        minimise.addEventListener("click", function () { setNotes("min"); });
        close.addEventListener("click", function () { setNotes("closed"); });
        pill.addEventListener("click", function () { setNotes("open"); });

        // Drag by the title; kept inside the window.
        head.addEventListener("pointerdown", function (event) {
            if (event.target.closest("button")) return;
            event.preventDefault();
            var rect = win.getBoundingClientRect();
            var dx = event.clientX - rect.left, dy = event.clientY - rect.top;
            head.setPointerCapture(event.pointerId);
            var moveTo = function (moveEvent) {
                var x = Math.max(0, Math.min(window.innerWidth - rect.width, moveEvent.clientX - dx));
                var y = Math.max(0, Math.min(window.innerHeight - 40, moveEvent.clientY - dy));
                win.style.left = Math.round(x) + "px";
                win.style.top = Math.round(y) + "px";
            };
            var stop = function () {
                head.removeEventListener("pointermove", moveTo);
                head.removeEventListener("pointerup", stop);
                head.removeEventListener("pointercancel", stop);
                saveNotes({ x: parseInt(win.style.left, 10), y: parseInt(win.style.top, 10) });
            };
            head.addEventListener("pointermove", moveTo);
            head.addEventListener("pointerup", stop);
            head.addEventListener("pointercancel", stop);
        });
        // A resized window keeps its size.
        if (typeof ResizeObserver !== "undefined") {
            new ResizeObserver(function () {
                if (win.hidden || !win.offsetWidth) return;
                saveNotes({ w: win.offsetWidth, h: win.offsetHeight });
            }).observe(win);
        }
        win.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !event.target.closest(".notes-text")) setNotes("min");
        });
        return { win: win, pill: pill, state: "closed" };
    }

    function setNotes(state, initial) {
        var notes = battleBar && battleBar.notes;
        if (!notes) return;
        notes.state = state;
        notes.win.hidden = state !== "open";
        notes.pill.hidden = state !== "min";
        battleBar.notesButton.setAttribute("aria-pressed", state === "open" ? "true" : "false");
        if (state === "open" && !notes.win.style.left) {
            // First time: at the right of the window, under the battle bar.
            notes.win.style.left = Math.max(8, window.innerWidth - 460) + "px";
            notes.win.style.top = "120px";
        } else if (state === "open") {
            notes.win.style.left = Math.max(0, Math.min(parseInt(notes.win.style.left, 10) || 0, window.innerWidth - Math.min(notes.win.offsetWidth || 420, window.innerWidth))) + "px";
            notes.win.style.top = Math.max(0, Math.min(parseInt(notes.win.style.top, 10) || 0, window.innerHeight - 40)) + "px";
        }
        if (!initial) {
            saveNotes({ state: state });
            if (state === "open") {
                var text = notes.win.querySelector(".notes-text");
                if (text) text.focus({ preventScroll: true });
            }
        }
    }

    // ---------- The item picker ----------
    // The item shows as its Gen 5 bag icon and name; a click opens the held items the calc's damage and stat code
    // reads, grouped, as icons (the ones that hit one type in a table under the types), and a search for the rest.
    // The item select and the "held" checkbox stay in the page, laid out but out of sight, and stay in charge.
    var ITEM_TYPES = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground",
        "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
    var ITEM_TYPE_GROUPS = [
        ["Type boosts", ["Silk Scarf", "Charcoal", "Mystic Water", "Miracle Seed", "Magnet", "Never-Melt Ice", "Black Belt", "Poison Barb", "Soft Sand",
            "Sharp Beak", "Twisted Spoon", "Silver Powder", "Hard Stone", "Spell Tag", "Dragon Fang", "Black Glasses", "Metal Coat", "Fairy Feather"]],
        ["Gems", ITEM_TYPES.map(function (type) { return type + " Gem"; })],
        ["Resist berries", ["Chilan Berry", "Occa Berry", "Passho Berry", "Rindo Berry", "Wacan Berry", "Yache Berry", "Chople Berry", "Kebia Berry", "Shuca Berry",
            "Coba Berry", "Payapa Berry", "Tanga Berry", "Charti Berry", "Kasib Berry", "Haban Berry", "Colbur Berry", "Babiri Berry", "Roseli Berry"]]
    ];
    var ITEM_GROUPS = [
        ["Choice items", ["Choice Band", "Choice Specs", "Choice Scarf"]],
        ["Damage boosts", ["Life Orb", "Expert Belt", "Muscle Band", "Wise Glasses", "Metronome", "Punching Glove"]],
        ["Healing", ["Leftovers", "Black Sludge", "Sitrus Berry", "Figy Berry", "Wiki Berry", "Mago Berry", "Aguav Berry", "Iapapa Berry", "Shell Bell", "Big Root"]],
        ["Bulk", ["Eviolite", "Assault Vest", "Kee Berry", "Maranga Berry"]],
        ["Signature items", ["Light Ball", "Thick Club", "Deep Sea Tooth", "Deep Sea Scale", "Metal Powder", "Quick Powder", "Soul Dew", "Adamant Orb",
            "Lustrous Orb", "Griseous Orb", ["Leek", "Stick"]]],
        ["Other effects", ["Iron Ball", "Air Balloon", "Ring Target", "Binding Band", "Sticky Barb", "White Herb", "Safety Goggles", "Heavy-Duty Boots",
            "Utility Umbrella", "Clear Amulet", "Covert Cloak", "Ability Shield", "Booster Energy"]]
    ];
    var ITEM_GROUP_OF = {};
    ITEM_TYPE_GROUPS.concat(ITEM_GROUPS).forEach(function (group) {
        group[1].forEach(function (name) { [].concat(name).forEach(function (alias) { ITEM_GROUP_OF[alias] = group[0]; }); });
    });
    var itemPickers = [];

    function itemArt(name) {
        var key = String(name).toLowerCase().replace(/['’.]/g, "").replace(/é/g, "e");
        return {
            gen5: "./img/item_sprites/gen5/" + (key === "leek" ? "stick" : key.replace(/ /g, "-")) + ".png",
            other: "./img/items/" + key.replace(/ /g, "_") + ".png"
        };
    }

    function itemImage(name, size) {
        var art = itemArt(name);
        var img = document.createElement("img");
        img.alt = "";
        img.draggable = false;
        img.width = size;
        img.height = size;
        img.src = art.gen5;
        img.addEventListener("error", function () {
            if (img.src.indexOf("/item_sprites/gen5/") >= 0) {
                img.src = art.other;
                return;
            }
            // No art for this item: its initials in a dashed square.
            var noArt = make("span", "g5-item-noart", String(name).split(/[\s-]+/).map(function (word) { return word.charAt(0); }).join("").slice(0, 3));
            noArt.style.width = noArt.style.height = size + "px";
            noArt.setAttribute("aria-hidden", "true");
            if (img.parentNode) img.replaceWith(noArt);
        });
        return img;
    }

    // What each item does, for the picker's readout.
    var ITEM_EFFECTS = {
        "Choice Band": "1.5× Attack; locked into one move",
        "Choice Specs": "1.5× Sp. Atk; locked into one move",
        "Choice Scarf": "1.5× Speed; locked into one move",
        "Life Orb": "1.3× damage; loses 10% of max HP per hit",
        "Expert Belt": "1.2× damage on super-effective hits",
        "Muscle Band": "1.1× power of physical moves",
        "Wise Glasses": "1.1× power of special moves",
        "Metronome": "More power each time the same move is used in a row",
        "Punching Glove": "1.1× power of punching moves, which no longer make contact",
        "Leftovers": "Restores 1/16 of max HP each turn",
        "Black Sludge": "Poison types restore 1/16 of max HP each turn; others lose 1/8",
        "Sitrus Berry": "Restores HP at half HP or less, then it is eaten",
        "Figy Berry": "Restores HP at low HP; confuses if the flavor is disliked",
        "Wiki Berry": "Restores HP at low HP; confuses if the flavor is disliked",
        "Mago Berry": "Restores HP at low HP; confuses if the flavor is disliked",
        "Aguav Berry": "Restores HP at low HP; confuses if the flavor is disliked",
        "Iapapa Berry": "Restores HP at low HP; confuses if the flavor is disliked",
        "Shell Bell": "Restores 1/8 of the damage it deals",
        "Big Root": "1.3× HP from draining moves",
        "Eviolite": "1.5× Defense and Sp. Def while it can still evolve",
        "Assault Vest": "1.5× Sp. Def; status moves can't be used",
        "Kee Berry": "+1 Defense when hit by a physical move",
        "Maranga Berry": "+1 Sp. Def when hit by a special move",
        "Light Ball": "2× Attack and Sp. Atk for Pikachu",
        "Thick Club": "2× Attack for Cubone and Marowak",
        "Deep Sea Tooth": "2× Sp. Atk for Clamperl",
        "Deep Sea Scale": "2× Sp. Def for Clamperl",
        "Metal Powder": "2× Defense for Ditto",
        "Quick Powder": "2× Speed for Ditto",
        "Soul Dew": "Boosts Latias and Latios",
        "Adamant Orb": "1.2× Dragon and Steel moves for Dialga",
        "Lustrous Orb": "1.2× Dragon and Water moves for Palkia",
        "Griseous Orb": "1.2× Dragon and Ghost moves for Giratina",
        "Leek": "Higher critical-hit ratio for Farfetch’d",
        "Stick": "Higher critical-hit ratio for Farfetch’d",
        "Iron Ball": "Halves Speed and grounds the holder",
        "Air Balloon": "Immune to Ground moves until it is hit",
        "Ring Target": "The holder loses its type immunities",
        "Binding Band": "Binding moves do more damage each turn",
        "Sticky Barb": "Loses 1/8 of max HP each turn",
        "White Herb": "Restores lowered stats once",
        "Safety Goggles": "Immune to weather damage and powder moves",
        "Heavy-Duty Boots": "No damage from entry hazards",
        "Utility Umbrella": "Ignores sun and rain",
        "Clear Amulet": "Other Pokémon can't lower its stats",
        "Covert Cloak": "Blocks the added effects of moves",
        "Ability Shield": "Its ability can't be changed or ignored",
        "Booster Energy": "Boosts a Paradox Pokémon's highest stat"
    };

    function itemEffect(name) {
        if (ITEM_EFFECTS[name]) return ITEM_EFFECTS[name];
        var game = typeof gen === "number" ? gen : 5;
        for (var g = 0; g < ITEM_TYPE_GROUPS.length; g++) {
            var index = -1;
            ITEM_TYPE_GROUPS[g][1].forEach(function (entry, i) { if (entry === name) index = i; });
            if (index < 0) continue;
            var type = ITEM_TYPES[index];
            if (g === 0) return (game <= 3 ? "1.1×" : "1.2×") + " power of " + type + "-type moves";
            if (g === 1) return (game === 5 ? "1.5×" : "1.3×") + " power of the first " + type + "-type move, then it is used up";
            return type === "Normal" ? "Halves one Normal-type hit, then it is eaten" : "Halves one super-effective " + type + "-type hit, then it is eaten";
        }
        return "";
    }

    function itemToggleOf(select) {
        var holder = select.closest(".info-group, .inline-toggle-field") || select.parentNode;
        return holder ? holder.querySelector("input.itemToggle") : null;
    }

    function paintItem(picker) {
        var select = picker.select, button = picker.button;
        var value = select.value;
        var toggle = itemToggleOf(select);
        var used = !!value && !!toggle && shown(toggle) && !toggle.checked;
        var key = value + "|" + used;
        if (button.getAttribute("data-g5-key") === key) return;
        button.setAttribute("data-g5-key", key);
        button.textContent = "";
        if (value) {
            button.appendChild(itemImage(value, 24));
        } else {
            button.appendChild(make("span", "g5-noicon", "+"));
        }
        button.classList.toggle("g5-none", !value);
        button.appendChild(make("span", "g5-item-name", value ? value + (used ? " (used up)" : "") : "No item"));
        button.classList.toggle("g5-used", used);
        button.setAttribute("aria-label", "Item: " + (value || "none") + (used ? ", used up" : "") + ". Change");
        button.title = value || "No item";
    }

    function mountItemPickers() {
        if (itemPickers.length) return;
        document.querySelectorAll("#p1 select.item, #p2 select.item").forEach(function (select) {
            var button = make("button", "g5-pick g5-itembtn");
            button.type = "button";
            button.setAttribute("aria-haspopup", "dialog");
            button.setAttribute("aria-expanded", "false");
            var picker = { select: select, button: button, kind: "item", tabindex: select.getAttribute("tabindex") };
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (open && open.picker === picker) closePicker(true);
                else openItemPicker(picker);
            });
            var fieldset = select.closest("fieldset");
            var tile = fieldset && fieldset.querySelector(".g5-tile");
            if (tile) tile.appendChild(button);
            else select.insertAdjacentElement("afterend", button);
            select.classList.add("g5-picked");
            select.setAttribute("tabindex", "-1");
            var toggle = itemToggleOf(select);
            if (toggle) {
                toggle.classList.add("g5-item-held");
                toggle.setAttribute("tabindex", "-1");
            }
            var field = select.closest(".inline-toggle-field");
            if (field) field.classList.add("g5-itemfield");
            itemPickers.push(picker);
            paintItem(picker);
        });
    }

    function unmountItemPickers() {
        if (open && open.picker && open.picker.kind === "item") closePicker(false);
        itemPickers.forEach(function (picker) {
            picker.button.remove();
            picker.select.classList.remove("g5-picked");
            if (picker.tabindex === null) picker.select.removeAttribute("tabindex");
            else picker.select.setAttribute("tabindex", picker.tabindex);
            var toggle = itemToggleOf(picker.select);
            if (toggle) {
                toggle.classList.remove("g5-item-held");
                toggle.removeAttribute("tabindex");
            }
            var field = picker.select.closest(".inline-toggle-field");
            if (field) field.classList.remove("g5-itemfield");
        });
        itemPickers = [];
    }

    function chooseItem(picker, value) {
        var select = picker.select;
        if (select.value !== value) {
            select.value = value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        var toggle = itemToggleOf(select);
        if (value && toggle && shown(toggle) && !toggle.checked) {
            toggle.checked = true;
            toggle.dispatchEvent(new Event("change", { bubbles: true }));
        }
        paintItem(picker);
        closePicker(true);
    }

    // Beside the item where it fits, else under or over it; taller than the window, it scrolls inside.
    function placeItemPicker(box, button) {
        var rect = button.getBoundingClientRect();
        var width = box.offsetWidth;
        var room = window.innerHeight - 16;
        box.style.maxHeight = room + "px";
        var height = Math.min(box.scrollHeight + 4, room);
        var left, top;
        if (rect.right + 8 + width <= window.innerWidth - 8) left = rect.right + 8;
        else if (rect.left - 8 - width >= 8) left = rect.left - 8 - width;
        else left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
        var beside = left >= rect.right || left + width <= rect.left;
        if (beside) top = Math.min(Math.max(8, rect.top - 60), window.innerHeight - height - 8);
        else if (rect.bottom + 4 + height <= window.innerHeight - 8) top = rect.bottom + 4;
        else if (rect.top - 4 - height >= 8) top = rect.top - 4 - height;
        else top = 8;
        box.style.left = Math.round(Math.max(8, left) + window.scrollX) + "px";
        box.style.top = Math.round(Math.max(8, top) + window.scrollY) + "px";
    }

    function openItemPicker(picker) {
        closePicker(false);
        closeSidePop(false);
        var select = picker.select;
        var have = {};
        Array.prototype.forEach.call(select.options, function (option) { if (option.value) have[option.value] = true; });
        var resolve = function (entry) {
            var names = [].concat(entry);
            for (var i = 0; i < names.length; i++) if (have[names[i]]) return names[i];
            return "";
        };
        var fieldset = select.closest("fieldset");
        var who = fieldset ? speciesOf(fieldset) : "";
        var box = make("div", "g5-pop g5-pop-item");
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-label", (who ? who + "’s" : "Choose an") + " item");
        var cells = [];
        var readout = make("p", "g5-item-readout");
        readout.setAttribute("aria-live", "polite");

        var cell = function (name) {
            var choice = make("button", "g5-item-cell");
            choice.type = "button";
            choice.setAttribute("aria-pressed", String(name === select.value));
            choice.setAttribute("aria-label", name);
            choice.title = name;
            choice.appendChild(itemImage(name, 48));
            choice.addEventListener("click", function () { chooseItem(picker, name); });
            var show = function () {
                readout.textContent = "";
                readout.appendChild(make("b", "", name));
                var effect = itemEffect(name);
                if (effect) readout.appendChild(document.createTextNode(": " + effect));
            };
            choice.addEventListener("mouseenter", show);
            choice.addEventListener("focus", show);
            cells.push(choice);
            return choice;
        };

        // The current item, whether it is still held, and No item.
        var current = select.value;
        var head = make("div", "g5-item-head");
        var big = make("span", "g5-item-big");
        if (current) big.appendChild(itemImage(current, 48));
        var info = make("div", "g5-item-info");
        info.appendChild(make("strong", "", current || "No item"));
        info.appendChild(make("span", "", current ? itemEffect(current) || ITEM_GROUP_OF[current] || "" : "Pick an item below"));
        var acts = make("div", "g5-item-acts");
        var toggle = itemToggleOf(select);
        if (current && toggle && shown(toggle)) {
            var seg = make("span", "g5-item-held-seg");
            seg.setAttribute("role", "radiogroup");
            seg.setAttribute("aria-label", "Is the item still held?");
            [["Held", true], ["Used up", false]].forEach(function (pair) {
                var b = make("button", "", pair[0]);
                b.type = "button";
                b.setAttribute("aria-pressed", String(toggle.checked === pair[1]));
                b.addEventListener("click", function () {
                    if (toggle.checked !== pair[1]) {
                        toggle.checked = pair[1];
                        toggle.dispatchEvent(new Event("change", { bubbles: true }));
                    }
                    paintItem(picker);
                    closePicker(true);
                });
                seg.appendChild(b);
            });
            acts.appendChild(seg);
        }
        var none = make("button", "", "No item");
        none.type = "button";
        none.addEventListener("click", function () { chooseItem(picker, ""); });
        acts.appendChild(none);
        head.append(big, info, acts);
        box.appendChild(head);

        // One type per column: a row of type labels, then a row for each group that has items in this game. Narrow
        // windows fold the table at Ground.
        var fold = window.innerWidth < 1180;
        var halves = fold ? [ITEM_TYPES.slice(0, 9), ITEM_TYPES.slice(9)] : [ITEM_TYPES];
        halves.forEach(function (types) {
            var rows = ITEM_TYPE_GROUPS.map(function (group) {
                return [group[0], types.map(function (type) { return resolve(group[1][ITEM_TYPES.indexOf(type)]); })];
            }).filter(function (row) { return row[1].some(Boolean); });
            if (!rows.length) return;
            var table = make("div", "g5-item-table");
            table.style.setProperty("--g5-cols", String(types.length));
            table.appendChild(make("span", ""));
            types.forEach(function (type) {
                var label = make("span", "g5-item-type");
                var img = make("img", "");
                img.src = IMG + "types/" + type.toLowerCase() + ".png";
                img.alt = type;
                label.appendChild(img);
                table.appendChild(label);
            });
            rows.forEach(function (row) {
                table.appendChild(make("span", "g5-item-group", row[0]));
                row[1].forEach(function (name) {
                    table.appendChild(name ? cell(name) : make("span", "g5-item-gap"));
                });
            });
            box.appendChild(table);
        });
        ITEM_GROUPS.forEach(function (group) {
            var names = group[1].map(resolve).filter(Boolean);
            if (!names.length) return;
            var row = make("div", "g5-item-row");
            row.setAttribute("role", "group");
            row.setAttribute("aria-label", group[0]);
            row.appendChild(make("span", "g5-item-group", group[0]));
            var icons = make("div", "g5-item-icons");
            names.forEach(function (name) { icons.appendChild(cell(name)); });
            row.appendChild(icons);
            box.appendChild(row);
        });
        box.appendChild(readout);

        // Every other item: a search over the select's own list.
        var search = make("div", "g5-item-search");
        search.appendChild(make("span", "g5-item-group", "Other items"));
        var field = make("div", "");
        var input = make("input", "");
        input.type = "text";
        input.placeholder = "Search every item";
        input.setAttribute("aria-label", "Search every item");
        input.setAttribute("role", "combobox");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-autocomplete", "list");
        var list = make("ul", "g5-item-results");
        list.setAttribute("role", "listbox");
        list.hidden = true;
        var all = Object.keys(have).sort();
        var results = [];
        var active = 0;
        var render = function () {
            var term = input.value.trim().toLowerCase();
            list.textContent = "";
            results = term ? all.filter(function (name) { return name.toLowerCase().indexOf(term) >= 0; }).slice(0, 12) : [];
            active = 0;
            results.forEach(function (name, index) {
                var li = make("li", "");
                li.setAttribute("role", "option");
                li.setAttribute("aria-selected", String(index === active));
                li.appendChild(itemImage(name, 24));
                li.appendChild(make("span", "", name));
                li.addEventListener("mousedown", function (event) { event.preventDefault(); chooseItem(picker, name); });
                list.appendChild(li);
            });
            list.hidden = !results.length;
            input.setAttribute("aria-expanded", String(!!results.length));
        };
        input.addEventListener("input", render);
        input.addEventListener("keydown", function (event) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                if (!results.length) return;
                event.preventDefault();
                active = (active + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
                Array.prototype.forEach.call(list.children, function (li, index) { li.setAttribute("aria-selected", String(index === active)); });
            } else if (event.key === "Enter" && results.length) {
                event.preventDefault();
                chooseItem(picker, results[active]);
            }
        });
        field.append(input, list);
        search.appendChild(field);
        box.appendChild(search);

        box.addEventListener("keydown", function (event) {
            var index = cells.indexOf(document.activeElement);
            if (event.key === "Escape") {
                event.preventDefault();
                closePicker(true);
            } else if (index >= 0 && /^Arrow(Right|Down|Left|Up)$/.test(event.key)) {
                event.preventDefault();
                var step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
                cells[(index + step + cells.length) % cells.length].focus();
            }
        });

        document.body.appendChild(box);
        placeItemPicker(box, picker.button);
        picker.button.setAttribute("aria-expanded", "true");
        open = { picker: picker, box: box };
        var focus = cells.filter(function (choice) { return choice.getAttribute("aria-pressed") === "true"; })[0] || cells[0] || input;
        focus.focus({ preventScroll: true });
    }

    function speciesOf(fieldset) {
        var chosen = fieldset.querySelector(".set-selector .select2-chosen");
        var text = chosen ? chosen.textContent.trim() : "";
        var paren = text.indexOf(" (");
        return paren > 0 ? text.slice(0, paren) : text;
    }

    // ---------- One line per move ----------
    // A move row keeps its damage beside the move when the range fits there, and shows the KO chance under the range
    // only when that fits on one line: when it doesn't, it's left out rather than given a second line. Only a row too
    // narrow for the range itself puts the damage on a line of its own (gen5.css: g5-dmg-wrap, g5-ko-off). The widths
    // are read once the page is laid out (at the end of a refresh, and after a resize), then the classes written.
    var MOVE_ROW_LIST = ["p1", "p2"].map(function (side) {
        return [1, 2, 3, 4].map(function (slot) { return "#" + side + " .move" + slot; }).join(", ");
    }).join(", ");

    function fitMoveRows() {
        if (!root.classList.contains("g5-band")) return;
        var plans = [];
        document.querySelectorAll(MOVE_ROW_LIST).forEach(function (row) {
            var cell = row.querySelector(":scope > .g5-move-dmg");
            if (!cell || !row.offsetParent) return;
            var range = cell.querySelector(":scope > b");
            var ko = cell.querySelector(":scope > small");
            var style = getComputedStyle(row);
            var gap = parseFloat(style.columnGap) || 0;
            var avail = row.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
            var used = 0;
            var count = 0;
            Array.prototype.forEach.call(row.children, function (child) {
                if (child === cell) return;
                var childStyle = getComputedStyle(child);
                if (childStyle.display === "none" || childStyle.position === "absolute" || childStyle.position === "fixed") return;
                used += child.getBoundingClientRect().width + (parseFloat(childStyle.marginLeft) || 0) + (parseFloat(childStyle.marginRight) || 0);
                count++;
            });
            used += gap * Math.max(0, count - 1);
            var room = avail - used - gap;
            var rangeWidth = range ? range.offsetWidth : 0;
            var koWidth = ko ? ko.scrollWidth : 0;
            var wrap = !!range && rangeWidth > room + 0.5;
            var showKo = !!ko && (wrap ? rangeWidth + 10 + koWidth <= avail + 0.5 : koWidth <= room + 0.5);
            plans.push([row, cell, wrap, showKo]);
        });
        plans.forEach(function (plan) {
            if (plan[0].classList.contains("g5-dmg-wrap") !== plan[2]) plan[0].classList.toggle("g5-dmg-wrap", plan[2]);
            if (plan[1].classList.contains("g5-ko-off") === plan[3]) plan[1].classList.toggle("g5-ko-off", !plan[3]);
        });
    }

    function refreshBand() {
        if (!root.classList.contains("g5-band")) return;
        var checked = document.querySelector("#calculator-view .result-move:checked");
        var on = checked ? /^resultMove([LR])([1-4])$/.exec(checked.id) : null;
        SIDES.forEach(function (side) {
            var fieldset = document.getElementById(side.id);
            if (!fieldset) return;
            for (var i = 1; i <= 4; i++) {
                var row = fieldset.querySelector(".move" + i);
                if (row) row.classList.toggle("g5-on", !!on && on[1] === (side.id === "p1" ? "L" : "R") && on[2] === String(i));
            }
        });
        hpFields.forEach(function (field) {
            if (field.pending === null && !field.editing) paintHp(field);
        });
        refreshBattleBar();
        fitMoveRows();
        syncBand();
    }

    // The two sides' moves start on one line: the side whose set is shorter gets the difference above its moves.
    var syncing = false;
    function syncBand() {
        if (syncing) return;
        syncing = true;
        try {
            if (!root.classList.contains("g5-band")) return;
            var raw = [];
            SIDES.forEach(function (side) {
                var fieldset = document.getElementById(side.id);
                var panel = fieldset && fieldset.closest(".panel");
                var first = fieldset && fieldset.querySelector(".move1");
                if (!panel || !first || !first.offsetParent) return;
                var pad = parseFloat(first.style.getPropertyValue("--g5-band-pad")) || 0;
                raw.push({ first: first, height: first.getBoundingClientRect().top - panel.getBoundingClientRect().top - pad });
            });
            if (raw.length < 2) return;
            var tallest = Math.max.apply(null, raw.map(function (entry) { return entry.height; }));
            raw.forEach(function (entry) {
                var value = Math.round(tallest - entry.height) + "px";
                if (entry.first.style.getPropertyValue("--g5-band-pad") !== value) entry.first.style.setProperty("--g5-band-pad", value);
            });
        } finally {
            syncing = false;
        }
    }

    function watchBand() {
        var onChange = function () { applyBand(); };
        if (bandMedia) {
            if (bandMedia.addEventListener) bandMedia.addEventListener("change", onChange);
            else if (bandMedia.addListener) bandMedia.addListener(onChange);
        }
        if (typeof ResizeObserver === "undefined") return;
        var observer = new ResizeObserver(function () {
            requestAnimationFrame(function () {
                fitMoveRows();
                syncBand();
            });
        });
        // The damage figures are set in the game's font, which may arrive after the first layout.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                fitMoveRows();
                syncBand();
            });
        }
        ["p1", "p2"].forEach(function (id) {
            var fieldset = document.getElementById(id);
            if (fieldset) observer.observe(fieldset);
        });
        var box = document.querySelector("#calculator-view .main-result-group");
        if (box) observer.observe(box);
    }

    // ---------- Pickers ----------
    // Types and genders are shown as the game's graphics, the form as its name; each opens a small box of choices.

    var TYPES = ["normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"];
    var IMG = "./img/gen5/";
    var pickers = [];
    var open = null;

    function typeArt(value) {
        var key = typeKey(value);
        return TYPES.indexOf(key) >= 0 ? IMG + "types/" + key + ".png" : "";
    }

    // The party menu's status icons (BW2 a/0/8/2), by the calc's status names; Healthy and Confused have none.
    var STATUS_ART = { "Poisoned": "psn", "Badly Poisoned": "tox", "Burned": "brn", "Paralyzed": "par", "Asleep": "slp", "Frozen": "frz" };
    function statusArt(value) {
        return STATUS_ART[value] ? IMG + "status/status-" + STATUS_ART[value] + ".png" : "";
    }

    function genderArt(value) {
        return value === "Male" ? IMG + "ui/gender-male.png" : value === "Female" ? IMG + "ui/gender-female.png" : "";
    }

    function iconArt(species) {
        // As the box names its icons (player_box.js buildBoxSpriteHTML).
        var name = typeof getSpriteSpeciesName === "function" ? getSpriteSpeciesName(species) : String(species || "").replace(/-Totem$/i, "");
        name = name.toLowerCase().replace(" ", "-").replace(".", "").replace(".", "").replace("’", "").replace(":", "-");
        return "./img/" + (typeof sprite_style === "string" && sprite_style ? sprite_style : "pokesprite") + "/" + name + ".png";
    }

    // What a count picker counts, by the select it stands for.
    function countWhat(select) {
        return select.classList.contains("move-hits") ? "Hits" : select.classList.contains("stat-drops") ? "Uses in a row" : "Metronome uses";
    }

    function optionLabel(kind, value, text) {
        if (kind === "gender") return value === "" ? "Genderless" : text || value;
        if (kind === "type") return value === "" ? "No second type" : text || value;
        return text || value;
    }

    // What an option looks like, in the picker button and in the box of choices.
    function face(kind, value, text, inBox) {
        var art = kind === "type" ? typeArt(value) : kind === "gender" ? genderArt(value) : kind === "status" ? statusArt(value) : kind === "forme" && inBox ? iconArt(value) : "";
        if (art) {
            var img = document.createElement("img");
            img.src = art;
            img.alt = "";
            img.draggable = false;
            if (kind === "forme") {
                img.addEventListener("error", function () {
                    var span = document.createElement("span");
                    span.className = "g5-pick-text";
                    span.textContent = text || value;
                    img.replaceWith(span);
                });
            }
            return img;
        }
        var span = document.createElement("span");
        span.className = "g5-pick-text";
        if (kind === "gender") span.textContent = value === "" ? "—" : value === "Random" ? "?" : text || value;
        else if (kind === "type") span.textContent = value === "" ? "—" : text || value;
        else if (kind === "status" && value === "Healthy" && !inBox) span.textContent = "Set Status";
        else if (kind === "count" && !inBox) span.textContent = "\u00d7" + value;
        else span.textContent = text || value;
        if ((kind === "type" || kind === "gender") && value === "") span.classList.add("g5-pick-empty");
        return span;
    }

    function selectedText(select) {
        var option = select.selectedOptions && select.selectedOptions[0];
        return option ? option.textContent : "";
    }

    function paint(picker) {
        var select = picker.select, button = picker.button, kind = picker.kind;
        var value = select.value, text = selectedText(select);
        if (button.getAttribute("data-value") === value && button.getAttribute("data-text") === text && button.firstChild) return;
        button.setAttribute("data-value", value);
        button.setAttribute("data-text", text);
        button.textContent = "";
        button.appendChild(face(kind, value, text, false));
        var what = kind === "type" ? "Type" : kind === "gender" ? "Gender" : kind === "status" ? "Status" : kind === "count" ? countWhat(select) : "Form";
        button.setAttribute("aria-label", what + ": " + optionLabel(kind, value, text) + ". Change");
        button.title = kind === "count" ? what + ": " + optionLabel(kind, value, text) : optionLabel(kind, value, text);
    }

    function paintPickers() {
        itemPickers.forEach(paintItem);
        pickers.forEach(function (picker) {
            paint(picker);
            // A count picker shows only while the calc shows its dropdown.
            if (picker.kind === "count") {
                var hide = !shown(picker.select);
                if (picker.button.hidden !== hide) picker.button.hidden = hide;
            }
        });
    }

    function attach(select, kind, into) {
        if (select.g5Picker) return;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "g5-pick g5-pick-" + kind;
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");
        var picker = { select: select, button: button, kind: kind, tabindex: select.getAttribute("tabindex") };
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (open && open.picker === picker) closePicker(true);
            else openPicker(picker);
        });
        if (into) into.appendChild(button);
        else select.insertAdjacentElement("afterend", button);
        // The select stays laid out (1px, see-through) so the calc's :visible checks on it still hold.
        select.classList.add("g5-picked");
        select.setAttribute("tabindex", "-1");
        select.g5Picker = picker;
        pickers.push(picker);
        paint(picker);
    }

    function mountPickers() {
        var panels = document.querySelector("#calculator-view .panel-wrapper");
        if (!panels) return;
        Array.prototype.forEach.call(panels.querySelectorAll("select.type1, select.type2, select.move-type"), function (select) { attach(select, "type"); });
        Array.prototype.forEach.call(panels.querySelectorAll("select.gender"), function (select) { attach(select, "gender"); });
        Array.prototype.forEach.call(panels.querySelectorAll("select.forme"), function (select) { attach(select, "forme"); });
        Array.prototype.forEach.call(panels.querySelectorAll("select.status"), function (select) { attach(select, "status"); });
        // Count pickers go in a group after C, own count first and Metronome's second, so they line up down a side
        // and every row of that side wraps the same way when a narrow panel has no room for them.
        Array.prototype.forEach.call(panels.querySelectorAll(MOVE_EXTRAS), function (select) {
            var row = select.closest(MOVE_ROWS);
            if (!row) return;
            var group = countGroups.filter(function (one) { return one.g5Row === row; })[0];
            if (!group) {
                group = document.createElement("span");
                group.className = "g5-counts";
                group.g5Row = row;
                countGroups.push(group);
                row.insertBefore(group, row.querySelector(":scope > .g5-move-dmg"));
            }
            attach(select, "count", group);
            if (select.classList.contains("metronome")) select.g5Picker.button.classList.add("g5-pick-metronome");
        });
        placeCounts();
        paintPickers();
    }

    // In the wide layout a move's counts sit on the right end of its move button, so a multi-hit move takes no more
    // room in its row than any other and its damage stays beside it. Elsewhere they follow C. The groups are kept here,
    // not looked up: the calc can set its move pickers up again, replacing the button a group sat on.
    var countGroups = [];

    function placeCounts() {
        var band = root.classList.contains("g5-band");
        countGroups.forEach(function (group) {
            var row = group.g5Row;
            var plate = band ? row.querySelector(":scope > .select2-container.move-selector") : null;
            if (plate) {
                if (group.parentNode !== plate) plate.appendChild(group);
            } else if (group.parentNode !== row) {
                row.insertBefore(group, row.querySelector(":scope > .g5-move-dmg"));
            }
        });
    }

    function unmountPickers() {
        closePicker(false);
        pickers.forEach(function (picker) {
            picker.button.remove();
            picker.select.classList.remove("g5-picked");
            if (picker.tabindex === null) picker.select.removeAttribute("tabindex");
            else picker.select.setAttribute("tabindex", picker.tabindex);
            delete picker.select.g5Picker;
        });
        pickers = [];
        document.querySelectorAll(".g5-counts").forEach(function (group) { group.remove(); });
        countGroups.forEach(function (group) { group.remove(); });
        countGroups = [];
    }

    // The choices, grouped as the select groups them (the left form select has Alt Forms and Evo Line).
    function groupsOf(select) {
        var groups = [];
        var loose = { label: "", options: [] };
        Array.prototype.forEach.call(select.children, function (child) {
            if (child.tagName === "OPTGROUP") {
                var group = { label: child.label, options: Array.prototype.slice.call(child.querySelectorAll("option")) };
                if (group.options.length) groups.push(group);
            } else if (child.tagName === "OPTION") {
                loose.options.push(child);
            }
        });
        if (loose.options.length) groups.unshift(loose);
        return groups;
    }

    function choose(picker, value) {
        var select = picker.select;
        if (select.value !== value) {
            select.value = value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        paint(picker);
        closePicker(true);
    }

    function openPicker(picker) {
        closePicker(false);
        var kind = picker.kind, select = picker.select;
        var box = document.createElement("div");
        box.className = "g5-pop g5-pop-" + kind;
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-label", kind === "type" ? "Choose a type" : kind === "gender" ? "Choose a gender" : kind === "status" ? "Choose a status" : kind === "count" ? countWhat(select) : "Choose a form");

        var options = [];
        var readout = null;
        if (kind === "forme") {
            readout = document.createElement("div");
            readout.className = "g5-pop-name";
        }
        groupsOf(select).forEach(function (group) {
            var section = document.createElement("div");
            section.className = "g5-pop-group";
            if (group.label && kind === "forme") {
                var label = document.createElement("div");
                label.className = "g5-pop-label";
                label.textContent = group.label === "Alt Forms" ? "Forms" : group.label === "Evo Line" ? "Evolutions" : group.label;
                section.appendChild(label);
            }
            var grid = document.createElement("div");
            grid.className = "g5-pop-grid";
            group.options.forEach(function (option) {
                if (option.disabled) return;
                var value = option.value, text = option.textContent;
                var choice = document.createElement("button");
                choice.type = "button";
                choice.className = "g5-pop-opt";
                choice.setAttribute("aria-pressed", String(value === select.value));
                choice.setAttribute("aria-label", optionLabel(kind, value, text));
                choice.title = optionLabel(kind, value, text);
                choice.appendChild(face(kind, value, text, true));
                if (kind === "gender" && (value === "" || value === "Random")) {
                    choice.appendChild(document.createTextNode(value === "" ? " Genderless" : " Random"));
                    choice.classList.add("g5-pop-opt-wide");
                }
                choice.addEventListener("click", function () { choose(picker, value); });
                if (readout) {
                    var show = function () { readout.textContent = text; };
                    choice.addEventListener("mouseenter", show);
                    choice.addEventListener("focus", show);
                }
                grid.appendChild(choice);
                options.push(choice);
            });
            section.appendChild(grid);
            box.appendChild(section);
        });
        if (!options.length) return;
        if (readout) {
            readout.textContent = selectedText(select);
            box.appendChild(readout);
        }

        box.addEventListener("keydown", function (event) {
            var index = options.indexOf(document.activeElement);
            if (event.key === "Escape") {
                event.preventDefault();
                closePicker(true);
            } else if (index >= 0 && /^Arrow(Right|Down|Left|Up)$/.test(event.key)) {
                event.preventDefault();
                var step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
                options[(index + step + options.length) % options.length].focus();
            }
        });

        document.body.appendChild(box);
        place(box, picker.button);
        picker.button.setAttribute("aria-expanded", "true");
        open = { picker: picker, box: box };
        var current = options.filter(function (choice) { return choice.getAttribute("aria-pressed") === "true"; })[0] || options[0];
        current.focus({ preventScroll: true });
    }

    // Below the button, kept inside the window; above it if there's no room below.
    function place(box, button) {
        var rect = button.getBoundingClientRect();
        var width = box.offsetWidth, height = box.offsetHeight;
        var left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
        var top = rect.bottom + 4;
        if (top + height > window.innerHeight - 8 && rect.top - height - 4 > 8) top = rect.top - height - 4;
        box.style.left = Math.max(8, left) + window.scrollX + "px";
        box.style.top = top + window.scrollY + "px";
    }

    function closePicker(returnFocus) {
        if (!open) return;
        var picker = open.picker;
        open.box.remove();
        open = null;
        picker.button.setAttribute("aria-expanded", "false");
        if (returnFocus) picker.button.focus({ preventScroll: true });
    }

    document.addEventListener("pointerdown", function (event) {
        if (open && !open.box.contains(event.target) && event.target !== open.picker.button && !open.picker.button.contains(event.target)) closePicker(false);
    }, true);
    window.addEventListener("resize", function () {
        closePicker(false);
        closeSidePop(false);
        // Battle Notes stays inside the window.
        var notes = document.getElementById("g5-notes");
        if (notes && !notes.hidden && notes.style.left) {
            notes.style.left = Math.max(0, Math.min(parseInt(notes.style.left, 10), window.innerWidth - notes.offsetWidth)) + "px";
            notes.style.top = Math.max(0, Math.min(parseInt(notes.style.top, 10), window.innerHeight - 40)) + "px";
        }
    });

    function initToggle() {
        var item = document.getElementById("toggle-gen5-ui");
        if (!item) return;
        var input = item.querySelector("input");
        if (!input) return;
        input.checked = enabled();
        // Like the newer settings switches (dual panel, party data), this follows the checkbox itself, so the keyboard works too.
        input.addEventListener("change", function () {
            setEnabled(input.checked);
        });
    }

    // The chip rows under the set pickers (Dex, Save, Remove; the foe's AI flags) sit over the panel, placed
    // absolutely by the calc. When a row wraps, such as a foe with many AI flags, the stylesheet moves the fields
    // below down by the extra height, which this keeps in --g5-tags-extra.
    // One row is as tall as a chip (26px, or 34px when a full-size panel sets its text at 20px).
    var ONE_ROW = 26;
    function chipHeight(row) {
        var chips = row.querySelectorAll(".ai-tag, .nav-tag, #dex-show, #learnset-show, #save-pok, #box-remove, #add-party-pok");
        for (var i = 0; i < chips.length; i++) {
            if (chips[i].offsetHeight) return chips[i].offsetHeight;
        }
        return ONE_ROW;
    }

    // The elements the extra room moves (gen5.css adds --g5-tags-extra to their offsets). It is set on them, not on the
    // panel, so a change restyles them alone.
    var TAG_ROOM_USERS = ":scope :is(.player-panel-content, .opposing-panel-content) > :is(.info-group.top, .select2-container.set-selector), :scope .poke-info > img.poke-sprite";

    function updateTagRoom() {
        var panels = document.querySelectorAll("#calculator-view .panel-wrapper > .panel.third:not(.panel-mid)");
        Array.prototype.forEach.call(panels, function (panel) {
            var extra = 0;
            Array.prototype.forEach.call(panel.querySelectorAll("#player-tags, #ai-tags, #mobile-tags, #nav-tags"), function (row) {
                if (row.offsetParent !== null) extra = Math.max(extra, row.offsetHeight - chipHeight(row));
            });
            var value = extra > 0 ? extra + "px" : "";
            Array.prototype.forEach.call(panel.querySelectorAll(TAG_ROOM_USERS), function (element) {
                if (element.style.getPropertyValue("--g5-tags-extra") === value) return;
                if (value) element.style.setProperty("--g5-tags-extra", value);
                else element.style.removeProperty("--g5-tags-extra");
            });
        });
    }

    function watchTagRows() {
        if (typeof ResizeObserver === "undefined") return;
        var observer = new ResizeObserver(updateTagRoom);
        ["player-tags", "ai-tags", "mobile-tags", "nav-tags"].forEach(function (id) {
            var row = document.getElementById(id);
            if (row) observer.observe(row);
        });
    }

    // ---------- Result rows ----------
    // A click anywhere on a move's result row picks that move, as clicking its name does. A click on the damage figures
    // also toggles that move's crit (the calc's own handler, after this one) and locks the row, so the calculation that
    // follows keeps this move shown instead of jumping back to the strongest one. Picking another move unlocks it.
    document.addEventListener("click", function (event) {
        if (!enabled()) return;
        var row = event.target.closest && event.target.closest(".move-result-subgroup > div:not(.result-move-header)");
        if (!row || event.target.closest("label, input, button")) return;
        var input = row.querySelector("input.result-move");
        if (!input || input.disabled) return;
        if (!input.checked) input.click();
        if (event.target.closest(".resultDamage")) input.classList.add("locked-move");
    }, true);

    // ---------- Party cards ----------
    // The card's set is listed under its icon, so a click or right click anywhere on the card acts on the icon:
    // a click loads the set, a right click takes it out of the party, as the calc does for the icon itself.
    function cardIcon(event) {
        if (!enabled()) return null;
        var card = event.target.closest && event.target.closest(".player-party .trainer-pok-container");
        if (!card || event.target.closest("img.trainer-pok")) return null;
        return card.querySelector("img.trainer-pok.left-side");
    }

    document.addEventListener("click", function (event) {
        var icon = cardIcon(event);
        if (icon) icon.click();
    });

    document.addEventListener("contextmenu", function (event) {
        var icon = cardIcon(event);
        if (!icon) return;
        event.preventDefault();
        if (window.jQuery) window.jQuery(icon).trigger("contextmenu");
    });

    // ---------- Save ----------
    // Saving gives no sign of its own, so the Save icon hops in its selected colours and the panel's edge flashes.
    var savedTimer = null;
    document.addEventListener("click", function (event) {
        if (!enabled() || !event.target.closest || !event.target.closest("#save-pok")) return;
        var chip = document.getElementById("save-pok");
        var panel = chip.closest(".panel");
        [chip, panel].forEach(function (element) {
            if (!element) return;
            element.classList.remove("g5-saved");
            void element.offsetWidth; // restart the animation on a second click
            element.classList.add("g5-saved");
        });
        clearTimeout(savedTimer);
        savedTimer = setTimeout(function () {
            chip.classList.remove("g5-saved");
            if (panel) panel.classList.remove("g5-saved");
        }, 700);
    });

    // ---------- Advanced switch info (Emerald Imperium) ----------
    // The calc writes the AI's reasoning as plain lines. In this look each row colours a good or bad matchup, greys
    // the label of a line that names a move ("Fast Ohko", "Deals 62") and lights that move in the move list, and
    // turns "Mid Turn Prio: 1" / "Post KO Prio: 5" into a label and a number for the plates. The text stays the
    // same, so the classic look reads exactly as before.
    var PRIORITY = /^(?:Mid Turn|Post KO) Prio: (\d+)$/;
    var NAMES_A_MOVE = /^((?:Fast|Slow) (?:Ohko|\d*Hko)|Deals \d+)\s+(.+)$/;
    var GOOD = /^(?:Wins 1v1|Good MU|Trapper)$/;
    var BAD = /^(?:Loses 1v1|Is Ohko'd)$/;

    function labelled(line, label, rest, restClass) {
        var key = document.createElement("span");
        key.className = "g5-k";
        key.textContent = label;
        var value = document.createElement("span");
        if (restClass) value.className = restClass;
        value.textContent = rest;
        line.textContent = "";
        line.append(key, " ", value);
    }

    function tagSwitchInfo() {
        if (!enabled()) return;
        document.querySelectorAll("#p2 .trainer-pok-container").forEach(function (card) {
            var reasons = card.querySelector(":scope > .ai-infos");
            if (!reasons) return;
            var named = "";
            reasons.querySelectorAll(":scope > .bp-info").forEach(function (line) {
                var text = line.textContent.trim();
                var match = text.match(NAMES_A_MOVE);
                if (match) named = match[2];
                if (line.dataset.g5Tagged) return;
                line.dataset.g5Tagged = "1";
                if (GOOD.test(text)) line.classList.add("g5-good");
                else if (BAD.test(text)) line.classList.add("g5-bad");
                if (match) {
                    labelled(line, match[1], match[2], "g5-mv");
                } else if ((match = text.match(/^(Type MU): (.+)$/)) || (match = text.match(/^(Walls You) \((.+)\)$/))) {
                    labelled(line, match[1], match[2]);
                }
            });
            card.querySelectorAll(":scope > .bp-infos > .bp-info").forEach(function (move) {
                move.classList.toggle("g5-hit", named !== "" && move.textContent.trim() === named);
            });
            card.querySelectorAll(":scope > .switch-infos > .bp-info").forEach(function (plate) {
                var label = plate.classList.contains("switch-score") ? "Post KO" : plate.classList.contains("mt-switch-score") ? "Mid turn" : "";
                if (!label || plate.classList.contains("loses")) return;
                var number = plate.textContent.trim().match(PRIORITY);
                plate.dataset.g5K = label;
                if (number) {
                    plate.dataset.g5V = number[1];
                    plate.classList.remove("g5-word");
                } else {
                    delete plate.dataset.g5V;
                    plate.classList.add("g5-word");
                }
            });
        });
    }

    function watchSwitchInfo() {
        var team = document.querySelector("#p2");
        if (!team || typeof MutationObserver === "undefined") return;
        var queued = false;
        new MutationObserver(function () {
            if (queued || !enabled()) return;
            queued = true;
            requestAnimationFrame(function () {
                queued = false;
                tagSwitchInfo();
            });
        }).observe(team, { childList: true, subtree: true, characterData: true });
    }

    function init() {
        initToggle();
        watchTagRows();
        watchPartyText();
        watchSwitchInfo();
        watchBand();
        if (enabled()) {
            mountPickers();
            applyTabs(true);
            applyBand();
        }
        // Every calculation rewrites the results, so watching them catches set, move and nature changes alike.
        var results = document.querySelector(".move-result-group");
        if (results) new MutationObserver(refresh).observe(results, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-highlight"] });
        document.addEventListener("change", refresh, true);
        refresh();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
