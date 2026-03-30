(function () {
    let currentMainPageView = "calculator";
    let mainNavInitialized = false;

    function hasMainNavShell() {
        return !!document.getElementById("main-view-tabs");
    }

    function updateMainPageTitle(title) {
        const titleEl = document.getElementById("rom-title");
        if (!titleEl) {
            return;
        }
        titleEl.textContent = title || "";
        titleEl.style.display = title ? "block" : "none";
    }

    function updateBodyViewClasses(viewName) {
        document.body.classList.remove(
            "main-page-calculator-view",
            "main-page-box-view",
            "main-page-fragsheet-view",
            "main-page-battle-log-view"
        );
        document.body.classList.add(`main-page-${viewName}-view`);
    }

    function setActiveMainTab(viewName) {
        document.querySelectorAll(".main-view-tab[data-view]").forEach((tab) => {
            tab.classList.toggle("active", tab.getAttribute("data-view") === viewName);
        });
    }

    function setViewVisibility(viewName) {
        const calculatorView = document.getElementById("calculator-view");
        const fragsheetShell = document.getElementById("fragsheet-shell");
        const boxView = document.getElementById("box-view");

        if (calculatorView) {
            calculatorView.style.display = viewName === "calculator" ? "block" : "none";
        }
        if (fragsheetShell) {
            fragsheetShell.style.display = (viewName === "fragsheet" || viewName === "battle-log") ? "block" : "none";
        }
        if (boxView) {
            boxView.style.display = viewName === "box" ? "block" : "none";
        }
    }

    function ensureFragsheetShellInitialized() {
        if (typeof window.ensureFragsheetControlsInitialized === "function") {
            window.ensureFragsheetControlsInitialized();
        }
        if (typeof window.ensureBattleLogUiInitialized === "function") {
            window.ensureBattleLogUiInitialized();
        }
    }

    function ensureFragsheetGridReady() {
        if (typeof window.ensureFragsheetGridInitialized !== "function") {
            return null;
        }
        return window.ensureFragsheetGridInitialized();
    }

    function setEmbeddedMode(mode) {
        if (typeof window.setEmbeddedFragsheetMode === "function") {
            window.setEmbeddedFragsheetMode(mode);
        }
    }

    function isBattleLogAvailable() {
        return typeof window.isBattleLogEnabledForTitle === "function" && window.isBattleLogEnabledForTitle();
    }

    function normalizeRequestedView(viewName) {
        const requested = String(viewName || "calculator");
        if (requested === "battle-log" && !isBattleLogAvailable()) {
            return "fragsheet";
        }
        if (["calculator", "box", "fragsheet", "battle-log"].includes(requested)) {
            return requested;
        }
        return "calculator";
    }

    function setMainPageView(viewName) {
        if (!hasMainNavShell()) {
            return null;
        }

        const nextView = normalizeRequestedView(viewName);
        ensureFragsheetShellInitialized();

        if (nextView === "fragsheet") {
            ensureFragsheetGridReady();
            setEmbeddedMode("fragsheet");
        } else if (nextView === "battle-log") {
            setEmbeddedMode("battle-log");
        } else if (nextView === "box") {
            if (typeof window.renderBoxView === "function") {
                window.renderBoxView(true);
            }
        } else if (document.body.classList.contains("battle-log-mode")) {
            setEmbeddedMode("fragsheet");
        }

        currentMainPageView = nextView;
        setActiveMainTab(nextView);
        setViewVisibility(nextView);
        updateBodyViewClasses(nextView);
        return nextView;
    }

    function updateMainPageHeaderState(options) {
        const state = options || {};
        if (typeof state.title === "string") {
            updateMainPageTitle(state.title);
        }

        const mainTabs = document.getElementById("main-view-tabs");
        const showMainNav = state.showMainNav !== false;
        if (mainTabs) {
            mainTabs.classList.toggle("main-view-tabs-hidden", !showMainNav);
        }

        const dexTab = document.getElementById("main-nav-dex");
        if (dexTab) {
            dexTab.style.display = state.showDex ? "inline-flex" : "none";
        }

        const battleLogTab = document.getElementById("main-nav-battle-log");
        if (battleLogTab) {
            battleLogTab.style.display = state.showBattleLog ? "inline-flex" : "none";
        }

        if (currentMainPageView === "battle-log" && !state.showBattleLog) {
            setMainPageView("fragsheet");
        }
    }

    function initializeMainNav() {
        if (mainNavInitialized || !hasMainNavShell()) {
            return;
        }
        mainNavInitialized = true;

        document.querySelectorAll(".main-view-tab[data-view]").forEach((tab) => {
            tab.addEventListener("click", function () {
                setMainPageView(this.getAttribute("data-view"));
            });
        });

        setMainPageView("calculator");
    }

    window.setMainPageView = setMainPageView;
    window.updateMainPageHeaderState = updateMainPageHeaderState;
    window.updateMainPageTitle = updateMainPageTitle;

    document.addEventListener("DOMContentLoaded", initializeMainNav);
})();
