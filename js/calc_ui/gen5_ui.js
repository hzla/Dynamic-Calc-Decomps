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

    function setEnabled(on) {
        try {
            localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
        } catch (error) {
            // Storage may be blocked; the setting then lasts until the page closes.
        }
        root.classList.toggle("gen5ui", on);
        if (on) {
            mountPickers();
            mountPin();
            refresh();
        } else {
            unmountPickers();
            unmountPin();
        }
        applyTabs(on);
        redrawTabs(on);
    }

    // ---------- Box, Fragsheet and Battle Log ----------

    // Labels the Gen 5 UI words differently. The classic text comes back when it is turned off.
    var RELABELS = [
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
            setType(row, type);
            setType(typeSelect, typeSelect && typeSelect.value);
            setType(document.querySelector('label[for="resultMove' + letter + i + '"]'), type);
        }
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

    var queued = false;
    function refresh() {
        if (queued || !enabled()) return;
        queued = true;
        requestAnimationFrame(function () {
            queued = false;
            refreshSide("p1", "L");
            refreshSide("p2", "R");
            paintPickers();
            tagSwitchInfo();
        });
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
        var what = kind === "type" ? "Type" : kind === "gender" ? "Gender" : kind === "status" ? "Status" : "Form";
        button.setAttribute("aria-label", what + ": " + optionLabel(kind, value, text) + ". Change");
        button.title = optionLabel(kind, value, text);
    }

    function paintPickers() {
        pickers.forEach(paint);
    }

    function attach(select, kind) {
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
        select.insertAdjacentElement("afterend", button);
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
        box.setAttribute("aria-label", kind === "type" ? "Choose a type" : kind === "gender" ? "Choose a gender" : kind === "status" ? "Choose a status" : "Choose a form");

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
    window.addEventListener("resize", function () { closePicker(false); });

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
    // below down by the extra height, which this keeps in --g5-tags-extra on the panel.
    // One row is as tall as a chip (26px, or 34px when a full-size panel sets its text at 20px).
    var ONE_ROW = 26;
    function chipHeight(row) {
        var chips = row.querySelectorAll(".ai-tag, .nav-tag, #dex-show, #learnset-show, #save-pok, #box-remove, #add-party-pok");
        for (var i = 0; i < chips.length; i++) {
            if (chips[i].offsetHeight) return chips[i].offsetHeight;
        }
        return ONE_ROW;
    }

    function updateTagRoom() {
        var panels = document.querySelectorAll("#calculator-view .panel-wrapper > .panel.third:not(.panel-mid)");
        Array.prototype.forEach.call(panels, function (panel) {
            var extra = 0;
            Array.prototype.forEach.call(panel.querySelectorAll("#player-tags, #ai-tags, #mobile-tags, #nav-tags"), function (row) {
                if (row.offsetParent !== null) extra = Math.max(extra, row.offsetHeight - chipHeight(row));
            });
            var value = extra > 0 ? extra + "px" : "";
            if (panel.style.getPropertyValue("--g5-tags-extra") !== value) {
                if (value) panel.style.setProperty("--g5-tags-extra", value);
                else panel.style.removeProperty("--g5-tags-extra");
            }
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

    // ---------- Pinned results ----------
    // The pin at the left of the result box keeps the move results and that box at the top of the window while the
    // page scrolls (desktop; phones already keep the results at the top). The choice is remembered.
    var PIN_KEY = "g5PinResults";
    var pinButton = null;
    // A pushpin, drawn on a 12px grid.
    var PIN_ART = '<svg viewBox="0 0 12 12" width="24" height="24" aria-hidden="true" focusable="false" shape-rendering="crispEdges" fill="currentColor">' +
        '<rect x="4" y="0" width="4" height="1"/><rect x="3" y="1" width="6" height="1"/><rect x="4" y="2" width="4" height="3"/>' +
        '<rect x="3" y="5" width="6" height="1"/><rect x="2" y="6" width="8" height="1"/><rect x="5" y="7" width="2" height="3"/>' +
        '<rect x="5" y="10" width="1" height="1"/></svg>';

    function pinWanted() {
        try {
            return localStorage.getItem(PIN_KEY) === "1";
        } catch (error) {
            return false;
        }
    }

    function syncPinOffsets() {
        var view = document.getElementById("calculator-view");
        var moves = view && view.querySelector(".move-result-group");
        var box = view && view.querySelector(".main-result-group");
        if (!moves || !box) return;
        view.style.setProperty("--g5-pin-moves", moves.offsetHeight + "px");
        view.style.setProperty("--g5-pin-box", box.offsetHeight + "px");
    }

    function applyPin(on) {
        root.classList.toggle("g5-pin-results", on);
        if (pinButton) {
            pinButton.setAttribute("aria-pressed", on ? "true" : "false");
            pinButton.setAttribute("aria-label", on ? "Unpin the results" : "Pin the results to the top");
            pinButton.title = on ? "Unpin the results" : "Pin the results to the top";
        }
        syncPinOffsets();
    }

    function mountPin() {
        var box = document.querySelector("#calculator-view .main-result-group");
        if (!box || pinButton) return;
        pinButton = document.createElement("button");
        pinButton.type = "button";
        pinButton.className = "g5-pin";
        pinButton.innerHTML = PIN_ART;
        pinButton.addEventListener("click", function (event) {
            event.preventDefault();
            var on = !root.classList.contains("g5-pin-results");
            try {
                localStorage.setItem(PIN_KEY, on ? "1" : "0");
            } catch (error) {
                // Without storage the pin lasts until the page closes.
            }
            applyPin(on);
        });
        box.insertBefore(pinButton, box.firstChild);
        applyPin(pinWanted());
    }

    function unmountPin() {
        if (pinButton) pinButton.remove();
        pinButton = null;
        root.classList.remove("g5-pin-results");
    }

    function watchPin() {
        if (typeof ResizeObserver === "undefined") return;
        var observer = new ResizeObserver(syncPinOffsets);
        ["#calculator-view .move-result-group", "#calculator-view .main-result-group"].forEach(function (selector) {
            var element = document.querySelector(selector);
            if (element) observer.observe(element);
        });
    }

    function init() {
        initToggle();
        watchTagRows();
        watchPin();
        watchSwitchInfo();
        if (enabled()) {
            mountPickers();
            mountPin();
            applyTabs(true);
        }
        // Every calculation rewrites the results, so watching them catches set, move and nature changes alike.
        var results = document.querySelector(".move-result-group");
        if (results) new MutationObserver(refresh).observe(results, { subtree: true, childList: true, characterData: true });
        document.addEventListener("change", refresh, true);
        refresh();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
