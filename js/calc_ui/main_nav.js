(function () {
    let currentMainPageView = "calculator";
    let mainNavInitialized = false;
    const MAIN_PAGE_VIEW_QUERY_PARAM = "view";
    const dashboardRoutes = {
        "Emerald Imperium 1.3": "./dashboards/emeraldimperium.html",
        "Renegade Platinum": "./dashboards/renegadeplatinum.html",
        "Platinum Kaizo": "./dashboards/platinumkaizo.html",
        "Pokemon Null 1.2": "./dashboards/pokemonnull12.html",
        "Pokemon Null 1.1": "./dashboards/pokemonnull.html",
        "Pokemon Null": "./dashboards/pokemonnull12.html",
        "Cascade White": "./dashboards/cascadewhite.html",
        "Vintage White Plus": "./dashboards/vintagewhiteplus.html",
    };

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
        renderGameVersionTabs(title);
        updateDashboardLink(title);
    }

    function getDashboardRoute(title) {
        if (typeof title !== "string" || !title) {
            return null;
        }

        return Object.keys(dashboardRoutes)
            .sort((left, right) => right.length - left.length)
            .find((key) => title.includes(key)) || null;
    }

    function ensureDashboardLink() {
        const primaryTabs = document.querySelector(".main-view-tabs-primary");
        if (!primaryTabs) {
            return null;
        }

        let link = document.getElementById("main-nav-dashboard");
        if (link) {
            return link;
        }

        link = document.createElement("a");
        link.id = "main-nav-dashboard";
        link.className = "main-view-tab";
        link.textContent = "Statistics";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "none";
        primaryTabs.appendChild(link);
        return link;
    }

    function updateDashboardLink(title) {
        const link = ensureDashboardLink();
        if (!link) {
            return;
        }

        const routeKey = getDashboardRoute(title);
        if (!routeKey) {
            link.style.display = "none";
            link.removeAttribute("href");
            return;
        }

        link.href = new URL(dashboardRoutes[routeKey], window.location.href).toString();
        link.style.display = "inline-flex";
    }

    function getMatchingGameVersionKey(title) {
        if (typeof title !== "string" || !title || typeof window.gameVersions !== "object" || !window.gameVersions) {
            return null;
        }

        return Object.keys(window.gameVersions)
            .sort((left, right) => right.length - left.length)
            .find((key) => title.includes(key)) || null;
    }

    function normalizeComparableUrl(urlLike) {
        const url = new URL(urlLike, window.location.href);
        const params = Array.from(url.searchParams.entries())
            .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
                if (leftKey === rightKey) {
                    return leftValue.localeCompare(rightValue);
                }
                return leftKey.localeCompare(rightKey);
            })
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join("&");

        return `${url.pathname}${params ? `?${params}` : ""}`;
    }

    function isCurrentGameVersion(version, title) {
        if (!version || !version.url) {
            return false;
        }

        if (normalizeComparableUrl(version.url) === normalizeComparableUrl(window.location.href)) {
            return true;
        }

        return typeof title === "string" && title.includes(version.id);
    }

    function renderGameVersionTabs(title) {
        const versionTabs = document.getElementById("main-view-version-tabs");
        if (!versionTabs) {
            return;
        }

        versionTabs.innerHTML = "";
        versionTabs.style.display = "none";

        const versionKey = getMatchingGameVersionKey(title);
        if (!versionKey) {
            return;
        }

        const versions = window.gameVersions[versionKey];
        if (!Array.isArray(versions) || versions.length < 2) {
            return;
        }

        versions.forEach((version) => {
            if (!version || !version.id || !version.url) {
                return;
            }

            const link = document.createElement("a");
            const isActive = isCurrentGameVersion(version, title);
            link.className = `main-view-version-link${isActive ? " active" : ""}`;
            link.href = version.url;
            link.textContent = version.id;

            if (isActive) {
                link.setAttribute("aria-current", "page");
            }

            versionTabs.appendChild(link);
        });

        if (versionTabs.childElementCount > 0) {
            versionTabs.style.display = "flex";
        }
    }

    function updateBodyViewClasses(viewName) {
        document.body.classList.remove(
            "main-page-calculator-view",
            "main-page-dex-view",
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
        const dexView = document.getElementById("dex-view");
        const fragsheetShell = document.getElementById("fragsheet-shell");
        const boxView = document.getElementById("box-view");

        if (calculatorView) {
            calculatorView.style.display = viewName === "calculator" ? "block" : "none";
        }
        if (dexView) {
            dexView.style.display = viewName === "dex" ? "block" : "none";
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
        if (["calculator", "dex", "box", "fragsheet", "battle-log"].includes(requested)) {
            return requested;
        }
        return "calculator";
    }

    function getMainPageViewUrl(viewName) {
        const url = new URL(window.location.href);
        url.searchParams.set(MAIN_PAGE_VIEW_QUERY_PARAM, viewName);
        return url;
    }

    function getRequestedMainPageViewFromUrl() {
        const url = new URL(window.location.href);
        return url.searchParams.get(MAIN_PAGE_VIEW_QUERY_PARAM);
    }

    function getHistoryStateForView(viewName) {
        const previousState = window.history && window.history.state && typeof window.history.state === "object"
            ? window.history.state
            : {};
        return {
            ...previousState,
            mainPageView: viewName
        };
    }

    function syncHistoryForMainPageView(viewName, replaceHistory) {
        if (!window.history || typeof window.history.pushState !== "function" || typeof window.history.replaceState !== "function") {
            return;
        }

        const url = getMainPageViewUrl(viewName);
        const nextState = getHistoryStateForView(viewName);
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const nextUrl = `${url.pathname}${url.search}${url.hash}`;

        if (replaceHistory || currentUrl === nextUrl) {
            window.history.replaceState(nextState, "", nextUrl);
            return;
        }

        window.history.pushState(nextState, "", nextUrl);
    }

    function getInitialMainPageView() {
        const requestedFromUrl = getRequestedMainPageViewFromUrl();
        if (requestedFromUrl) {
            return requestedFromUrl;
        }

        const stateView = window.history && window.history.state && typeof window.history.state === "object"
            ? window.history.state.mainPageView
            : null;
        return stateView || "calculator";
    }

    function setMainPageView(viewName, options) {
        if (!hasMainNavShell()) {
            return null;
        }

        const settings = options && typeof options === "object" ? options : {};
        const nextView = normalizeRequestedView(viewName);
        ensureFragsheetShellInitialized();

        if (nextView === "fragsheet") {
            ensureFragsheetGridReady();
            setEmbeddedMode("fragsheet");
        } else if (nextView === "battle-log") {
            setEmbeddedMode("battle-log");
        } else if (nextView === "dex") {
            if (typeof window.ensureDexViewLoaded === "function") {
                window.ensureDexViewLoaded();
            }
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

        if (!settings.skipHistory) {
            syncHistoryForMainPageView(nextView, settings.replaceHistory === true);
        }

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
            setMainPageView("fragsheet", { replaceHistory: true });
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

        window.addEventListener("popstate", function (event) {
            const stateView = event && event.state && typeof event.state === "object"
                ? event.state.mainPageView
                : null;
            const requestedView = stateView || getRequestedMainPageViewFromUrl() || "calculator";
            setMainPageView(requestedView, { skipHistory: true });
        });

        ensureDashboardLink();
        updateMainPageTitle(typeof window.TITLE === "string" ? window.TITLE : "");
        setMainPageView(getInitialMainPageView(), { replaceHistory: true });
    }

    window.setMainPageView = setMainPageView;
    window.updateMainPageHeaderState = updateMainPageHeaderState;
    window.updateMainPageTitle = updateMainPageTitle;

    document.addEventListener("DOMContentLoaded", initializeMainNav);
})();
