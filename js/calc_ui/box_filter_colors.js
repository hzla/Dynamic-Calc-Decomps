(function () {
    const STORAGE_KEY = "boxFilterColors";
    const OPTION_DEFS = [
        { key: "minDealt", label: "Min % Dealt" },
        { key: "maxTaken", label: "Max % Taken" },
        { key: "speed", label: "Speed" },
        { key: "ohko", label: "OHKO" },
        { key: "ohkod", label: "Is OHKOd" }
    ];
    const CSS_VAR_MAP = {
        minDealt: "--box-filter-min-dealt-rgb",
        maxTaken: "--box-filter-max-taken-rgb",
        speed: "--box-filter-speed-rgb",
        ohko: "--box-filter-ohko-rgb",
        ohkod: "--box-filter-ohkod-rgb"
    };

    const modal = document.getElementById("box-filter-colors-modal");
    const openTrigger = document.getElementById("open-box-filter-colors");
    const optionContainer = document.getElementById("box-filter-colors-options");
    const currentLabel = document.getElementById("box-filter-colors-current-label");
    const colorPicker = document.getElementById("box-filter-color-picker");
    const hexInput = document.getElementById("box-filter-color-hex");
    const preview = document.getElementById("box-filter-colors-preview");
    const resetButton = document.getElementById("reset-box-filter-colors");

    if (!modal || !openTrigger || !optionContainer || !currentLabel || !colorPicker || !hexInput || !preview || !resetButton) {
        return;
    }

    let activeKey = "minDealt";
    let currentColors = loadBoxFilterColors();
    let lastFocusedElement = null;

    function getDefaultBoxFilterColors() {
        return {
            minDealt: "#FF5555",
            maxTaken: "#6272A4",
            speed: "#8BE9FD",
            ohko: "#50FA7B",
            ohkod: "#FF5555"
        };
    }

    function isValidHexColor(value) {
        return /^#[0-9A-F]{6}$/i.test(String(value || "").trim());
    }

    function normalizeHexInput(value) {
        let normalized = String(value || "").trim().toUpperCase();
        if (/^[0-9A-F]{6}$/.test(normalized)) {
            normalized = `#${normalized}`;
        }
        return normalized;
    }

    function hexToRgbTuple(value) {
        const normalized = normalizeHexInput(value);
        if (!isValidHexColor(normalized)) {
            return null;
        }
        return [
            parseInt(normalized.slice(1, 3), 16),
            parseInt(normalized.slice(3, 5), 16),
            parseInt(normalized.slice(5, 7), 16)
        ].join(", ");
    }

    function mergeWithDefaults(raw) {
        const defaults = getDefaultBoxFilterColors();
        const next = Object.assign({}, defaults);
        if (!raw || typeof raw !== "object") {
            return next;
        }

        Object.keys(defaults).forEach(function (key) {
            const normalized = normalizeHexInput(raw[key]);
            if (isValidHexColor(normalized)) {
                next[key] = normalized;
            }
        });

        return next;
    }

    function loadBoxFilterColors() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return getDefaultBoxFilterColors();
            }
            return mergeWithDefaults(JSON.parse(raw));
        } catch (_error) {
            return getDefaultBoxFilterColors();
        }
    }

    function saveBoxFilterColors(colors) {
        const merged = mergeWithDefaults(colors);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
    }

    function applyBoxFilterColors(colors) {
        Object.keys(CSS_VAR_MAP).forEach(function (key) {
            const tuple = hexToRgbTuple(colors[key]);
            if (tuple) {
                document.documentElement.style.setProperty(CSS_VAR_MAP[key], tuple);
            }
        });
    }

    function createPreviewChip(title, className, styleText) {
        return [
            '<div class="box-filter-colors-preview-chip">',
            `<div class="box-filter-colors-preview-title">${title}</div>`,
            `<div class="box-filter-colors-preview-sample${className ? ` ${className}` : ""}" style="${styleText}">${title}</div>`,
            "</div>"
        ].join("");
    }

    function renderPreview() {
        const rgb = hexToRgbTuple(currentColors[activeKey]);
        if (!rgb) {
            preview.innerHTML = "";
            return;
        }

        if (activeKey === "minDealt") {
            preview.innerHTML = [
                createPreviewChip("Label", "", `color: rgb(${rgb}); background: rgba(255,255,255,0.02);`),
                createPreviewChip("Highlight", "", `background: rgba(${rgb}, 0.4);`)
            ].join("");
            return;
        }

        if (activeKey === "maxTaken") {
            preview.innerHTML = [
                createPreviewChip("Label", "", `color: rgb(${rgb}); background: rgba(255,255,255,0.02);`),
                createPreviewChip("Highlight", "", `background: rgb(${rgb});`)
            ].join("");
            return;
        }

        if (activeKey === "speed") {
            preview.innerHTML = [
                createPreviewChip("Label", "", `color: rgb(${rgb}); background: rgba(255,255,255,0.02);`),
                createPreviewChip("Highlight", "speed", `border-bottom-color: rgb(${rgb});`)
            ].join("");
            return;
        }

        preview.innerHTML = [
            createPreviewChip("Strong", "", `background: rgba(${rgb}, 0.8);`),
            createPreviewChip("Faded", "", `background: rgba(${rgb}, 0.35);`)
        ].join("");
    }

    function renderOptions() {
        optionContainer.innerHTML = OPTION_DEFS.map(function (option) {
            const isActive = option.key === activeKey;
            return [
                `<button type="button" class="box-filter-colors-option${isActive ? " active" : ""}" data-box-filter-key="${option.key}" role="tab" aria-selected="${isActive ? "true" : "false"}">`,
                `<span class="box-filter-colors-option-label">${option.label}</span>`,
                `<span class="box-filter-colors-option-swatch" style="background: ${currentColors[option.key]};"></span>`,
                "</button>"
            ].join("");
        }).join("");
    }

    function renderEditor() {
        const option = OPTION_DEFS.find(function (entry) {
            return entry.key === activeKey;
        });
        currentLabel.textContent = option ? option.label : activeKey;
        colorPicker.value = currentColors[activeKey];
        hexInput.value = currentColors[activeKey];
        hexInput.classList.remove("invalid");
        renderPreview();
    }

    function render() {
        renderOptions();
        renderEditor();
    }

    function selectOption(key) {
        if (!Object.prototype.hasOwnProperty.call(CSS_VAR_MAP, key)) {
            return;
        }
        activeKey = key;
        render();
    }

    function updateColor(key, value) {
        const normalized = normalizeHexInput(value);
        if (!isValidHexColor(normalized)) {
            return false;
        }

        currentColors[key] = normalized;
        currentColors = saveBoxFilterColors(currentColors);
        applyBoxFilterColors(currentColors);
        render();
        return true;
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("box-filter-colors-open");
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    function openModal() {
        lastFocusedElement = document.activeElement;
        activeKey = "minDealt";
        currentColors = loadBoxFilterColors();
        applyBoxFilterColors(currentColors);
        render();
        modal.hidden = false;
        document.body.classList.add("box-filter-colors-open");
        const firstOption = optionContainer.querySelector(".box-filter-colors-option");
        if (firstOption) {
            firstOption.focus();
        }
    }

    applyBoxFilterColors(currentColors);
    render();

    openTrigger.addEventListener("click", openModal);

    optionContainer.addEventListener("click", function (event) {
        const button = event.target instanceof Element ? event.target.closest(".box-filter-colors-option") : null;
        if (!button) {
            return;
        }
        selectOption(button.getAttribute("data-box-filter-key"));
    });

    colorPicker.addEventListener("input", function () {
        updateColor(activeKey, colorPicker.value);
    });

    hexInput.addEventListener("input", function () {
        const uppercaseValue = hexInput.value.toUpperCase();
        hexInput.value = uppercaseValue;
        if (updateColor(activeKey, uppercaseValue)) {
            hexInput.classList.remove("invalid");
            return;
        }
        hexInput.classList.add("invalid");
    });

    hexInput.addEventListener("blur", function () {
        if (!isValidHexColor(normalizeHexInput(hexInput.value))) {
            hexInput.value = currentColors[activeKey];
            hexInput.classList.remove("invalid");
        }
    });

    resetButton.addEventListener("click", function () {
        currentColors = saveBoxFilterColors(getDefaultBoxFilterColors());
        applyBoxFilterColors(currentColors);
        render();
    });

    modal.addEventListener("click", function (event) {
        if (event.target instanceof Element && event.target.hasAttribute("data-close-box-filter-colors")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });
})();
