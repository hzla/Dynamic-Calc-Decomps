TITLE = document.title.split(" Usage Data")[0];

window.allPoks = {};
window.analyticsIndexData = null;
window.analyticsManifest = null;
window.analyticsOverviewData = null;
window.analyticsOverviewState = {
  minDepth: 1,
  currentSnapshot: null,
  starterSorts: {},
  trainerSectionTab: "important",
};
window.analyticsPokemonState = {
  selectedSpecies: null,
  familyMode: true,
  pokemonIndexData: null,
  pokemonDetailData: null,
};
window.dashboardCalculatorUrl = null;
window.dashboardCalculatorUrlPromise = null;

const TRAINERS = {};
const TYPE_COLORS = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Electric: "#F7D02C",
  Grass: "#7AC74C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Dark: "#705746",
  Steel: "#B7B7CE",
  Fairy: "#D685AD",
};
const TYPE_ORDER = Object.keys(TYPE_COLORS);
const OVERVIEW_CHART_FALLBACK_COLOR = "#bb86fc";
const STARTER_SLICE_SPRITE_THRESHOLD_PCT = 4;
const STARTER_SLICE_SPRITE_CENTER_OFFSET_PX = 15;
const starterChartSpriteCache = new Map();

let latestAnalyticsRequestId = 0;
let overviewCharts = [];
let isRoutingDashboardState = false;

const CALCULATOR_TITLE_CANDIDATES = {
  "Emerald Imperium 1.3": ["Emerald Imperium 1.3 w/ EVs", "Emerald Imperium 1.3 No EVs"],
  "Pokemon Null": ["Pokemon Null 1.2", "Pokemon Null 1.1"],
  "Cascade White": ["Cascade White (NEW)", "Cascade White 2"],
};
const CALCULATOR_URL_FALLBACKS = {
  "Emerald Imperium 1.3": "?data=imp13&dmgGen=8&gen=8&types=6&noSwitch=1&evs=1",
  "Renegade Platinum": "?data=renegadeplatinum",
  "Platinum Kaizo": "?data=pk&noSwitch=1",
  "Pokemon Null 1.2": "?data=null",
  "Pokemon Null 1.1": "?data=null11",
  "Pokemon Null": "?data=null",
  "Cascade White": "?data=casc&critGen=5",
  "Vintage White Plus": "?data=vwplus",
};

getTrainerNames();

function isBossTrainer(name) {
  return /\b(Admin|Leader|Rival)\b/i.test(name);
}

function leadLevel(teamArr) {
  return teamArr && teamArr.length && Number.isFinite(+teamArr[0].level) ? +teamArr[0].level : -1;
}

function dashboardConfig() {
  const config = window.DASHBOARD_GAME_CONFIG || {};
  const resolvedTitle = typeof window.resolveOfflineAnalyticsTitle === "function"
    ? window.resolveOfflineAnalyticsTitle(TITLE, window.analyticsManifest || { titles: config })
    : TITLE;
  return config[TITLE] || config[resolvedTitle] || {};
}

function dashboardAssetBase() {
  return String(window.DASHBOARD_ASSET_BASE || ".").replace(/\/+$/, "");
}

function resolvedDashboardTitle() {
  return typeof window.resolveOfflineAnalyticsTitle === "function"
    ? window.resolveOfflineAnalyticsTitle(TITLE, window.analyticsManifest || { titles: {} })
    : TITLE;
}

function isPokemonNullDashboardTitle(title) {
  return typeof title === "string" && title.startsWith("Pokemon Null");
}

function isNullDashboard() {
  return isPokemonNullDashboardTitle(resolvedDashboardTitle());
}

function stripLocationSuffix(name) {
  return String(name ?? "").replace(/\s+\|[^|]+\|$/g, "").trim();
}

function displayTrainerName(name) {
  const text = String(name ?? "").trim();
  if (!text) return "";
  return isNullDashboard() ? stripLocationSuffix(text) : text;
}

function calculatorTitleCandidates() {
  const resolvedTitle = resolvedDashboardTitle();
  const candidates = [
    ...(CALCULATOR_TITLE_CANDIDATES[resolvedTitle] || []),
    resolvedTitle,
    TITLE,
  ].filter(Boolean);
  return [...new Set(candidates)];
}

function relativeCalculatorUrlFromSource(source) {
  const url = new URL(source, `${window.location.origin}${dashboardAssetBase()}/index.html`);
  return `${dashboardAssetBase()}/index.html${url.search || ""}${url.hash || ""}`;
}

function findCalculatorOption(options) {
  const candidates = calculatorTitleCandidates();
  for (const candidate of candidates) {
    const exact = options.find((option) => option.label === candidate);
    if (exact) return exact;
  }
  for (const candidate of candidates) {
    const partial = options.find((option) => option.label.includes(candidate) || candidate.includes(option.label));
    if (partial) return partial;
  }
  return null;
}

function fallbackCalculatorUrl() {
  const resolvedTitle = resolvedDashboardTitle();
  const query = CALCULATOR_URL_FALLBACKS[resolvedTitle] || CALCULATOR_URL_FALLBACKS[TITLE];
  return query ? `${dashboardAssetBase()}/index.html${query}` : "";
}

async function loadCalculatorUrlFromIndex() {
  if (window.dashboardCalculatorUrl !== null) {
    return window.dashboardCalculatorUrl;
  }
  if (window.dashboardCalculatorUrlPromise) {
    return window.dashboardCalculatorUrlPromise;
  }

  window.dashboardCalculatorUrlPromise = fetch(`${dashboardAssetBase()}/js/romhack_catalog.js`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load romhack catalog (${response.status})`);
      }
      return response.text();
    })
    .then((scriptText) => {
      const sandboxWindow = {};
      const options = new Function("window", `${scriptText}; return window.romhackLinkOptions || [];`)(sandboxWindow)
        .map((option) => ({
          label: String(option.label || "").trim(),
          source: String(option.source || "").trim(),
        }))
        .filter((option) => option.label && option.source);
      const match = findCalculatorOption(options);
      window.dashboardCalculatorUrl = match ? relativeCalculatorUrlFromSource(match.source) : fallbackCalculatorUrl();
      return window.dashboardCalculatorUrl;
    })
    .catch(() => {
      window.dashboardCalculatorUrl = fallbackCalculatorUrl();
      return window.dashboardCalculatorUrl;
    })
    .finally(() => {
      window.dashboardCalculatorUrlPromise = null;
    });

  return window.dashboardCalculatorUrlPromise;
}

function spriteFileFromSpecies(species) {
  const s = String(species ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "unknown";
}

function spriteSrc(species) {
  return `${dashboardAssetBase()}/img/pokesprite/${spriteFileFromSpecies(species)}.png`;
}

function dashboardCssVar(name, fallback) {
  if (typeof document === "undefined" || typeof window.getComputedStyle !== "function") {
    return fallback;
  }
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function dashboardChartDevicePixelRatio() {
  if (typeof window === "undefined" || !Number.isFinite(window.devicePixelRatio)) {
    return 2;
  }
  return clampNumber(window.devicePixelRatio, 2, 3);
}

function applyDashboardChartDefaults() {
  if (typeof Chart === "undefined" || !Chart.defaults) return;

  Chart.defaults.devicePixelRatio = dashboardChartDevicePixelRatio();
  Chart.defaults.color = dashboardCssVar("--text-muted", "rgba(248, 248, 242, 0.72)");
  Chart.defaults.borderColor = dashboardCssVar("--chart-grid", "rgba(255, 255, 255, 0.1)");
  if (Chart.defaults.font) {
    Chart.defaults.font.family = "Verdana, sans-serif";
  }
  if (Chart.defaults.elements?.arc) {
    Chart.defaults.elements.arc.borderAlign = "inner";
  }
  if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
    Chart.defaults.plugins.tooltip.backgroundColor = dashboardCssVar("--surface-1", "rgba(24, 24, 24, 0.92)");
    Chart.defaults.plugins.tooltip.borderColor = dashboardCssVar("--border-2", "#44475a");
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = dashboardCssVar("--text-1", "#f8f8f2");
    Chart.defaults.plugins.tooltip.bodyColor = dashboardCssVar("--text-1", "#f8f8f2");
  }
  if (Chart.defaults.scale && Chart.defaults.scale.grid) {
    Chart.defaults.scale.grid.color = dashboardCssVar("--chart-grid", "rgba(255, 255, 255, 0.1)");
    Chart.defaults.scale.alignToPixels = true;
  }
}

function starterSliceColor(slice) {
  const firstType = String(slice?.firstType || "").trim();
  return TYPE_COLORS[firstType] || dashboardCssVar("--chart-pie-fallback", OVERVIEW_CHART_FALLBACK_COLOR);
}

function starterSliceType(slice) {
  return String(slice?.firstType || "").trim() || "Unknown";
}

function orderedStarterPieSlices(group) {
  const slices = Array.isArray(group?.slices) ? [...group.slices] : [];
  const typeTotals = new Map();
  const typeRank = new Map(TYPE_ORDER.map((type, index) => [type, index]));

  slices.forEach((slice) => {
    const type = starterSliceType(slice);
    typeTotals.set(type, (typeTotals.get(type) || 0) + (Number(slice?.count) || 0));
  });

  return slices.sort((left, right) => {
    const leftType = starterSliceType(left);
    const rightType = starterSliceType(right);

    if (leftType !== rightType) {
      const typeTotalDelta = (typeTotals.get(rightType) || 0) - (typeTotals.get(leftType) || 0);
      if (typeTotalDelta) return typeTotalDelta;

      const typeRankDelta = (typeRank.get(leftType) ?? Number.MAX_SAFE_INTEGER)
        - (typeRank.get(rightType) ?? Number.MAX_SAFE_INTEGER);
      if (typeRankDelta) return typeRankDelta;

      return leftType.localeCompare(rightType);
    }

    const countDelta = (Number(right?.count) || 0) - (Number(left?.count) || 0);
    if (countDelta) return countDelta;

    return String(left?.species || "").localeCompare(String(right?.species || ""));
  });
}

function starterSpriteLayout(slices) {
  const smallestVisiblePct = (Array.isArray(slices) ? slices : [])
    .map((slice) => Number(slice?.pct))
    .filter((pct) => Number.isFinite(pct) && pct >= STARTER_SLICE_SPRITE_THRESHOLD_PCT)
    .reduce(
      (smallest, pct) => Math.min(smallest, pct),
      Number.POSITIVE_INFINITY
    );
  const resolvedSmallestPct = Number.isFinite(smallestVisiblePct)
    ? smallestVisiblePct
    : STARTER_SLICE_SPRITE_THRESHOLD_PCT;
  const comfort = clampNumber((resolvedSmallestPct - STARTER_SLICE_SPRITE_THRESHOLD_PCT) / 8, 0, 1);

  return {
    minSize: 16 + (comfort * 5),
    maxSize: 34 + (comfort * 14),
    sizeMultiplier: 0.92 + (comfort * 0.18),
    chordFactor: 0.58 + (comfort * 0.14),
    radialLimitFactor: 0.8 + (comfort * 0.15),
    radialFactor: 0.68 - (comfort * 0.1),
  };
}

function loadStarterChartSprite(species, chart) {
  const src = spriteSrc(species);
  if (starterChartSpriteCache.has(src)) {
    return starterChartSpriteCache.get(src);
  }

  const image = new Image();
  image.onload = () => {
    if (chart && typeof chart.update === "function") chart.update("none");
  };
  image.onerror = () => {
    image.dataset.failed = "1";
  };
  image.src = src;
  starterChartSpriteCache.set(src, image);
  return image;
}

function starterSliceSpritePlugin(slices) {
  const layout = starterSpriteLayout(slices);

  return {
    id: "starterSliceSpritePlugin",
    afterDatasetsDraw(chart) {
      const datasetMeta = chart.getDatasetMeta(0);
      if (!datasetMeta?.data?.length) return;

      const ctx = chart.ctx;
      datasetMeta.data.forEach((arc, index) => {
        const slice = slices[index];
        if (!slice || Number(slice.pct) < STARTER_SLICE_SPRITE_THRESHOLD_PCT) return;

        const image = loadStarterChartSprite(slice.species, chart);
        if (!image || !image.complete || image.dataset.failed === "1") return;

        const {
          startAngle,
          endAngle,
          outerRadius,
          innerRadius,
          x: centerX,
          y: centerY,
        } = typeof arc.getProps === "function"
          ? arc.getProps(["startAngle", "endAngle", "outerRadius", "innerRadius", "x", "y"], true)
          : arc;

        const angle = Math.abs(endAngle - startAngle);
        const maxChord = outerRadius * angle * layout.chordFactor;
        const maxRadial = (outerRadius - innerRadius) * layout.radialLimitFactor;
        const availableSize = Math.min(maxChord, maxRadial);
        const size = clampNumber(
          availableSize * layout.sizeMultiplier,
          Math.min(layout.minSize, availableSize),
          Math.min(layout.maxSize, availableSize)
        );
        if (!Number.isFinite(size) || size < 12) return;

        const midAngle = (startAngle + endAngle) / 2;
        const desiredRadius = innerRadius
          + (outerRadius - innerRadius) * layout.radialFactor
          + STARTER_SLICE_SPRITE_CENTER_OFFSET_PX;
        const maxRadius = Math.max(innerRadius, outerRadius - (size / 2) - 2);
        const radius = Math.min(desiredRadius, maxRadius);
        const x = centerX + Math.cos(midAngle) * radius;
        const y = centerY + Math.sin(midAngle) * radius;

        ctx.save();
        ctx.fillStyle = dashboardCssVar("--chart-neutral-fill", "rgba(24, 24, 24, 0.94)");
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = dashboardCssVar("--chart-neutral-border", "#44475a");
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, x - (size / 2), y - (size / 2), size, size);
        ctx.restore();
      });
    },
  };
}

function pokemonLinkMarkup(species, innerHtml, className = "") {
  const safeSpecies = String(species || "");
  if (!safeSpecies) return innerHtml;
  const extraClass = className ? ` ${className}` : "";
  return `<button type="button" class="pokemonLink${extraClass}" data-species="${escapeHtml(safeSpecies)}">${innerHtml}</button>`;
}

function buildSelect2Data(trainers) {
  const bossesByLvl = new Map();
  const othersByLvl = new Map();

  for (const trainer of trainers) {
    const displayName = trainer.displayName || String(trainer.usageKey || "");
    const team = TRAINERS[displayName] || [];
    const lvl = Number.isFinite(+trainer.leadLevel) ? +trainer.leadLevel : leadLevel(team);
    const visibleName = displayTrainerName(displayName);

    const entry = {
      id: displayName,
      text: visibleName,
      _leadLevel: lvl,
      _usageKey: String(trainer.usageKey ?? displayName),
      tr_id: trainer.trId ?? null,
      _partySize: trainer.partySize ?? team.length,
      _teamVariantNames: Array.isArray(trainer.teamVariantNames) ? trainer.teamVariantNames : [],
      _isBoss: trainer.isBoss != null ? Boolean(trainer.isBoss) : isBossTrainer(displayName),
    };
    const map = entry._isBoss ? bossesByLvl : othersByLvl;
    if (!map.has(lvl)) map.set(lvl, []);
    map.get(lvl).push(entry);
  }

  function mapToLevelGroups(map) {
    const levels = Array.from(map.keys()).sort((a, b) => a - b);
    return levels.map((lvl) => ({
      text: `Lv ${lvl}`,
      children: map.get(lvl).sort((a, b) => a.text.localeCompare(b.text)),
    }));
  }

  return [
    { text: "Bosses", children: mapToLevelGroups(bossesByLvl) },
    { text: "Others", children: mapToLevelGroups(othersByLvl) },
  ];
}

function buildPokemonSelectData(speciesEntries) {
  return (speciesEntries || [])
    .map((entry) => ({
      id: entry.species,
      text: entry.species,
      detailFile: entry.detailFile,
      familyKey: entry.familyKey,
      familyMembers: entry.familyMembers || [],
    }))
    .sort((left, right) => left.text.localeCompare(right.text));
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString();
}

function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0%";
  return `${Math.round(num)}%`;
}

function formatGeneratedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatDepthValue(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

function formatDepthSummary(step, pct) {
  if (!Number.isFinite(Number(step))) return "Avg depth —";
  return `Avg depth ${formatDepthValue(step)} (${formatPercent(pct)})`;
}

function formatPieChartDepthText(step) {
  if (!Number.isFinite(Number(step))) return "Average run depth —";
  return `Average run depth ${formatDepthValue(step)} battles`;
}

function ensureHeaderElements() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return {};

  let titleSub = topbar.querySelector(".title .sub");
  if (!titleSub) {
    titleSub = document.createElement("div");
    titleSub.className = "sub";
    const title = topbar.querySelector(".title");
    if (title) title.appendChild(titleSub);
  }

  let actions = topbar.querySelector(".header-actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "header-actions";
    topbar.appendChild(actions);
  }

  let overviewBtn = actions.querySelector("[data-action='overview']");
  if (!overviewBtn) {
    overviewBtn = document.createElement("button");
    overviewBtn.type = "button";
    overviewBtn.className = "header-btn";
    overviewBtn.dataset.action = "overview";
    overviewBtn.addEventListener("click", () => {
      void navigateToOverview();
    });
    actions.appendChild(overviewBtn);
  }

  let calculatorLink = actions.querySelector("[data-action='calculator']");
  if (!calculatorLink) {
    calculatorLink = document.createElement("a");
    calculatorLink.className = "header-btn";
    calculatorLink.dataset.action = "calculator";
    calculatorLink.textContent = "Calculator";
    calculatorLink.style.display = "none";
    actions.appendChild(calculatorLink);
  }

  let controlsMeta = document.querySelector(".controlsMeta");
  if (!controlsMeta) {
    controlsMeta = document.createElement("div");
    controlsMeta.className = "controlsMeta";
    const controls = document.querySelector(".controls");
    if (controls) controls.appendChild(controlsMeta);
  }

  return { titleSub, overviewBtn, calculatorLink, controlsMeta };
}

function renderHeader(mode, options) {
  const { titleSub, overviewBtn, calculatorLink, controlsMeta } = ensureHeaderElements();
  const generatedAt = options?.generatedAt ? formatGeneratedAt(options.generatedAt) : "";

  if (titleSub) {
    titleSub.textContent = generatedAt ? `Offline data updated ${generatedAt}` : "Offline analytics";
  }

  if (overviewBtn) {
    overviewBtn.textContent = mode === "overview" ? "Overview" : "Back to overview";
    overviewBtn.disabled = mode === "overview";
  }

  if (calculatorLink) {
    if (window.dashboardCalculatorUrl) {
      calculatorLink.href = window.dashboardCalculatorUrl;
      calculatorLink.style.display = "inline-flex";
    } else {
      calculatorLink.removeAttribute("href");
      calculatorLink.style.display = "none";
    }
  }

  if (controlsMeta) {
    controlsMeta.textContent = "";
  }
}

function clearOverviewCharts() {
  for (const chart of overviewCharts) {
    if (chart && typeof chart.destroy === "function") {
      chart.destroy();
    }
  }
  overviewCharts = [];
}

function overviewCard(title, value) {
  return `
    <div class="overviewCard">
      <h3>${escapeHtml(title)}</h3>
      <div class="overviewStat">${escapeHtml(value)}</div>
    </div>
  `;
}

function trainerSpriteSlug(name) {
  return String(name ?? "")
    .replace(/^(Leader|Elite Four|Champion)\s+/i, "")
    .replace(/\s+With\s+.*$/i, "")
    .split(/[\s/&|]+/)[0]
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase();
}

function trainerSpriteSrc(name) {
  return `${dashboardAssetBase()}/img/trainer_sprites/${trainerSpriteSlug(name) || "unknown"}.png`;
}

function renderTrainerOverviewSprite(item) {
  const displayName = String(item?.displayName || "");
  const usageKey = String(item?.usageKey || "");
  if (isNullDashboard() && (usageKey === "Elite Four Rival" || /Elite Four Rival/i.test(displayName))) {
    const brendanSrc = `${dashboardAssetBase()}/img/trainer_sprites/brendan.png`;
    const maySrc = `${dashboardAssetBase()}/img/trainer_sprites/may.png`;
    return `
      <div class="importantSprite importantSpriteDual">
        <img src="${brendanSrc}" alt="Brendan" loading="lazy"
             onerror="this.style.opacity=.35;this.title='Missing trainer sprite'">
        <img src="${maySrc}" alt="May" loading="lazy"
             onerror="this.style.opacity=.35;this.title='Missing trainer sprite'">
      </div>
    `;
  }

  return `
    <div class="importantSprite">
      <img src="${trainerSpriteSrc(displayName)}" alt="${escapeHtml(displayTrainerName(displayName))}" loading="lazy"
           onerror="this.style.opacity=.35;this.title='Missing trainer sprite'">
    </div>
  `;
}

function overviewState() {
  return window.analyticsOverviewState || { minDepth: 1, currentSnapshot: null, starterSorts: {}, trainerSectionTab: "important" };
}

function pokemonState() {
  return window.analyticsPokemonState || {
    selectedSpecies: null,
    familyMode: true,
    pokemonIndexData: null,
    pokemonDetailData: null,
  };
}

function clampMinDepth(value, overviewData) {
  const maxStep = Math.max(
    1,
    Number(overviewData?.maxStep || window.analyticsIndexData?.overviewMeta?.maxStep || 1)
  );
  const raw = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(raw)) {
    return Math.max(1, Math.min(maxStep, Number(overviewData?.defaultMinDepth || 1)));
  }
  return Math.max(1, Math.min(maxStep, raw));
}

function getOverviewSnapshot(overviewData, minDepth) {
  const byMinDepth = overviewData?.byMinDepth || {};
  const key = String(clampMinDepth(minDepth, overviewData));
  return byMinDepth[key] || byMinDepth["1"] || null;
}

function setOverviewMinDepth(nextMinDepth) {
  const state = overviewState();
  state.minDepth = clampMinDepth(nextMinDepth, window.analyticsOverviewData);
  state.currentSnapshot = getOverviewSnapshot(window.analyticsOverviewData, state.minDepth);
  window.analyticsOverviewState = state;
  return state.currentSnapshot;
}

function currentTrainerSectionTab() {
  const state = overviewState();
  return state.trainerSectionTab === "run-enders" ? "run-enders" : "important";
}

function setTrainerSectionTab(nextTab) {
  const state = overviewState();
  state.trainerSectionTab = nextTab === "run-enders" ? "run-enders" : "important";
  window.analyticsOverviewState = state;
}

function formatRunMetric(value) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return `${formatNumber(value)} runs`;
}

function renderTrainerOverviewCard(item) {
  return `
    <button type="button" class="importantCard" data-trainer-key="${escapeHtml(item.usageKey || item.displayName)}">
      ${renderTrainerOverviewSprite(item)}
      <div class="importantCardBody">
        <div class="importantName">${escapeHtml(displayTrainerName(item.displayName))}</div>
        <div class="importantStats">
          <div class="importantStatRow"><span>Reached</span><strong>${escapeHtml(formatRunMetric(item.reachedCount))}</strong></div>
          <div class="importantStatRow"><span>Ended</span><strong>${escapeHtml(formatRunMetric(item.endedCount))}</strong></div>
        </div>
      </div>
    </button>
  `;
}

function renderImportantTrainerSection(snapshot) {
  const activeTab = currentTrainerSectionTab();
  const importantItems = Array.isArray(snapshot?.importantTrainerBattles) ? snapshot.importantTrainerBattles : [];
  const topRunEnders = Array.isArray(snapshot?.topRunEnders) ? snapshot.topRunEnders : [];
  const items = activeTab === "run-enders" ? topRunEnders : importantItems;
  const emptyMessage = activeTab === "run-enders"
    ? "Run-ender data is not available for this game."
    : "No important trainer data configured for this game.";
  const cards = items.length
    ? items.map((item) => renderTrainerOverviewCard(item)).join("")
    : `<div class="emptyState">${emptyMessage}</div>`;

  return `
    <section class="overviewSection">
      <div class="sectionHeader">
        <h2>Important Trainers</h2>
        <div class="sectionTabs" role="tablist" aria-label="Trainer overview sections">
          <button type="button" class="sectionTab${activeTab === "important" ? " active" : ""}" data-section-tab="important" role="tab" aria-selected="${activeTab === "important" ? "true" : "false"}">Important Trainers</button>
          <button type="button" class="sectionTab${activeTab === "run-enders" ? " active" : ""}" data-section-tab="run-enders" role="tab" aria-selected="${activeTab === "run-enders" ? "true" : "false"}">Top Run Enders</button>
        </div>
      </div>
      <div class="importantGrid">${cards}</div>
    </section>
  `;
}

function filteredRunDepthMarkers(source, minDepth = 1) {
  const rawMarkers = Array.isArray(source)
    ? source
    : Array.isArray(source?.importantTrainerMarkers)
      ? source.importantTrainerMarkers
      : [];
  const markers = rawMarkers.filter((marker) => String(marker?.label || "").trim());
  const minStep = Math.max(1, Number(minDepth) || 1);

  const eligibleMarkers = markers.filter((marker) => Number(marker?.step) >= minStep);
  const champions = eligibleMarkers.filter((marker) => /Champion/i.test(marker.label));
  const championToShow = champions.length
    ? champions.reduce((best, marker) => (Number(marker.step) > Number(best.step) ? marker : best))
    : null;
  return eligibleMarkers.filter((marker) => {
    if (/Elite Four/i.test(marker.label)) return false;
    if (/Champion/i.test(marker.label)) return championToShow && marker === championToShow;
    return true;
  }).reduce((acc, marker) => {
    if (/Leader Tate\b/i.test(marker.label) || /Leader Liza\b/i.test(marker.label)) {
      const existing = acc.find((item) => item._mergedTateLiza);
      const step = Number(marker.step);
      if (existing) {
        if (Number.isFinite(step) && step < Number(existing.step)) {
          existing.step = step;
        }
        return acc;
      }
      acc.push({
        ...marker,
        label: "Leader Tate & Liza",
        _mergedTateLiza: true,
      });
      return acc;
    }
    acc.push(marker);
    return acc;
  }, []);
}

function starterLegendSortMode(groupLabel) {
  const state = overviewState();
  state.starterSorts ||= {};
  window.analyticsOverviewState = state;
  return state.starterSorts[groupLabel] || "pick-rate";
}

function setStarterLegendSortMode(groupLabel, mode) {
  const state = overviewState();
  state.starterSorts ||= {};
  state.starterSorts[groupLabel] = mode === "run-depth" ? "run-depth" : "pick-rate";
  window.analyticsOverviewState = state;
}

function sortedGroupSlices(group, sortMode) {
  const mode = sortMode || starterLegendSortMode(group?.label);
  return [...(group?.slices || [])].sort((a, b) => {
    if (mode === "run-depth") {
      const depthDelta = Number(b.averageRunDepthStep ?? -1) - Number(a.averageRunDepthStep ?? -1);
      if (depthDelta) return depthDelta;
    }
    const countDelta = (b.count - a.count);
    if (countDelta) return countDelta;
    return a.species.localeCompare(b.species);
  });
}

function starterChartLegend(group) {
  const slices = sortedGroupSlices(group);
  return slices
    .map(
      (slice) => `
        <div class="chartLegendRow">
          ${pokemonLinkMarkup(
            slice.species,
            `
              <img class="chartLegendSprite" src="${spriteSrc(slice.species)}" alt="${escapeHtml(slice.species)}" loading="lazy"
                   onerror="this.style.opacity=.35;this.title='Missing sprite'">
              <div class="chartLegendText">
                <span>${escapeHtml(slice.species)}</span>
                ${slice.averageRunDepthStep != null
                  ? `<div class="chartLegendDepth">${escapeHtml(formatPieChartDepthText(slice.averageRunDepthStep))}</div>`
                  : ""}
              </div>
            `,
            "chartLegendMain"
          )}
          <span class="chartLegendPct">${escapeHtml(formatPercent(slice.pct))}</span>
        </div>
      `
    )
    .join("");
}

function renderStarterGiftCharts(snapshot) {
  const groups = Array.isArray(snapshot?.starterGiftGroups) ? snapshot.starterGiftGroups : [];
  if (!groups.length) {
    return "";
  }

  if (!snapshot?.runCount) {
    return `
      <section class="overviewSection">
        <div class="sectionHeader">
          <h2>Starter / Gift Distribution</h2>
        </div>
        <div class="emptyState">No runs matched this filter.</div>
      </section>
    `;
  }

  const cards = groups
    .map(
      (group, index) => {
        const hasData = sortedGroupSlices(group).some((slice) => Number(slice.count) > 0);
        const supportsRunDepthSort = sortedGroupSlices(group).some((slice) => slice.averageRunDepthStep != null);
        const sortMode = supportsRunDepthSort ? starterLegendSortMode(group.label) : "pick-rate";
        if (!hasData) {
          return `
            <div class="chartCard">
              <h3>${escapeHtml(group.label)}</h3>
              <div class="emptyState">No matching runs for this filter.</div>
            </div>
          `;
        }
        return `
        <div class="chartCard">
          <div class="chartCardHeader">
            <h3>${escapeHtml(group.label)}</h3>
            <label class="chartSortControl">
              <span>Sort rows</span>
              <select class="starterSortSelect" data-group-label="${escapeHtml(group.label)}">
                <option value="pick-rate"${sortMode === "pick-rate" ? " selected" : ""}>Pick rate</option>
                <option value="run-depth"${sortMode === "run-depth" ? " selected" : ""}${supportsRunDepthSort ? "" : " disabled"}>Run depth</option>
              </select>
            </label>
          </div>
          <div class="chartWrap">
            <canvas id="starter-chart-${index}" aria-label="${escapeHtml(group.label)} distribution"></canvas>
          </div>
          <div class="chartLegend">${starterChartLegend(group)}</div>
        </div>
      `;
      }
    )
    .join("");

  return `
    <section class="overviewSection">
      <div class="sectionHeader">
        <h2>Starter / Gift Distribution</h2>
      </div>
      <div class="sectionMeta">Average run depth means how far a runner was able to get on average when they have this Pokemon.</div>
      <div class="chartGrid">${cards}</div>
    </section>
  `;
}

function hydrateStarterGiftCharts(snapshot) {
  clearOverviewCharts();

  if (typeof Chart === "undefined") return;
  applyDashboardChartDefaults();

  const groups = Array.isArray(snapshot?.starterGiftGroups) ? snapshot.starterGiftGroups : [];
  groups.forEach((group, index) => {
    const canvas = document.getElementById(`starter-chart-${index}`);
    if (!canvas) return;

    const slices = orderedStarterPieSlices(group);
    const labels = slices.map((slice) => slice.species);
    const data = slices.map((slice) => slice.count);
    if (!data.length) return;

    const chart = new Chart(canvas, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: slices.map((slice) => starterSliceColor(slice)),
            borderColor: dashboardCssVar("--chart-neutral-border", "#44475a"),
            borderWidth: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                const slice = slices[context.dataIndex];
                const depthText = slice.averageRunDepthStep != null
                  ? ` • ${formatPieChartDepthText(slice.averageRunDepthStep)}`
                  : "";
                return `${slice.species}: ${slice.pct}%${depthText}`;
              },
            },
          },
        },
      },
      plugins: [starterSliceSpritePlugin(slices)],
    });
    overviewCharts.push(chart);
  });
}

function hydrateRunDepthChart(runDepth, minDepth) {
  if (typeof Chart === "undefined" || !runDepth || runDepth.available === false) return;
  applyDashboardChartDefaults();

  const canvas = document.getElementById("run-depth-chart");
  const histogram = Array.isArray(runDepth.histogram) ? runDepth.histogram : [];
  if (!canvas || !histogram.length) return;

  const labels = histogram.map((entry) => entry.step);
  const data = histogram.map((entry) => entry.count);
  const visibleMarkers = filteredRunDepthMarkers(runDepth?.importantTrainerMarkers || [], minDepth);
  const markerMap = new Map();
  visibleMarkers.forEach((marker) => {
    const step = Number(marker.step);
    if (!Number.isFinite(step)) return;
    if (!markerMap.has(step)) markerMap.set(step, []);
    markerMap.get(step).push(marker.label);
  });

  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: dashboardCssVar("--chart-fill", "rgba(187, 134, 252, 0.34)"),
          borderColor: dashboardCssVar("--chart-stroke", "#bb86fc"),
          borderWidth: 1,
          borderRadius: 2,
          barPercentage: 1,
          categoryPercentage: 1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title(items) {
              return `Run depth ${labels[items[0].dataIndex]}`;
            },
            label(context) {
              return `${context.raw} runs reached at least this point`;
            },
            afterBody(items) {
              const step = labels[items[0].dataIndex];
              const markers = markerMap.get(Number(step)) || [];
              return markers.length ? `Important trainer: ${markers.join(", ")}` : "";
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Run depth",
          },
          ticks: {
            autoSkip: false,
            maxRotation: 65,
            minRotation: 65,
            callback(value, index) {
              const step = labels[index];
              const markers = markerMap.get(Number(step));
              if (markers && markers.length) return markers.map((marker) => displayTrainerName(marker));
              return "";
            },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          title: {
            display: true,
            text: "Runs reached",
          },
        },
      },
    },
  });
  overviewCharts.push(chart);
}

async function selectTrainerByName(trainerName) {
  if (!trainerName) return;
  const select2Data = Array.isArray(window.select2TrainerData) ? window.select2TrainerData : [];
  const selectedTrainer = findTrainerOptionById(select2Data, trainerName);
  if (!selectedTrainer) return;

  $("#trainerSelect").val(selectedTrainer.id).trigger("change");
  await renderTrainerSelection(selectedTrainer);
}

function renderOverviewControls(overviewData, minDepth) {
  return "";
}

function renderTopPokemonByAverageDepth(snapshot) {
  return "";
}

function wireOverviewInteractions() {
  $(".importantCard").off("click").on("click", function () {
    const trainerKey = this.dataset.trainerKey;
    if (!trainerKey) return;
    void selectTrainerByName(trainerKey);
  });

  $(".sectionTab").off("click").on("click", function () {
    const nextTab = this.dataset.sectionTab;
    if (!nextTab || nextTab === currentTrainerSectionTab()) return;
    setTrainerSectionTab(nextTab);
    renderOverview(window.analyticsIndexData, window.analyticsOverviewData, overviewState().currentSnapshot);
  });

  $(".starterSortSelect").off("change").on("change", function () {
    const groupLabel = this.dataset.groupLabel;
    if (!groupLabel) return;
    setStarterLegendSortMode(groupLabel, this.value);
    renderOverview(window.analyticsIndexData, window.analyticsOverviewData, overviewState().currentSnapshot);
  });
}

function renderRunDepthSection(runDepth) {
  if (!runDepth || runDepth.available === false) {
    return `
      <section class="overviewSection">
        <div class="sectionHeader">
          <h2>Players by Run Depth</h2>
        </div>
        <div class="emptyState">Not available for this game.</div>
      </section>
    `;
  }

  if (!runDepth.runsCounted) {
    return `
      <section class="overviewSection">
        <div class="sectionHeader">
          <h2>Players by Run Depth</h2>
        </div>
        <div class="emptyState">No runs matched this filter.</div>
      </section>
    `;
  }

  return `
    <section class="overviewSection">
      <div class="sectionHeader">
        <h2>Players by Run Depth</h2>
      </div>
      <div class="runDepthWrap">
        <canvas id="run-depth-chart" aria-label="Players by run depth distribution"></canvas>
      </div>
    </section>
  `;
}

function renderOverview(indexData, overviewData, snapshot) {
  clearOverviewCharts();
  renderHeader("overview", { generatedAt: overviewData?.generatedAt || indexData?.generatedAt });

  const state = overviewState();
  const currentSnapshot = snapshot || state.currentSnapshot || getOverviewSnapshot(overviewData, state.minDepth);
  state.currentSnapshot = currentSnapshot;
  window.analyticsOverviewState = state;

  const starterSection = renderStarterGiftCharts(currentSnapshot);
  const topPokemonSection = renderTopPokemonByAverageDepth(currentSnapshot);

  const html = `
    <div class="overview">
      ${renderOverviewControls(overviewData, state.minDepth)}
      <div class="overviewGrid">
        ${overviewCard("Runs", formatNumber(currentSnapshot?.runCount || 0))}
      </div>
      ${renderImportantTrainerSection(currentSnapshot)}
      ${renderRunDepthSection(currentSnapshot?.runDepth)}
      ${starterSection}
      ${topPokemonSection}
    </div>
  `;

  $("#out").html(html);
  hydrateStarterGiftCharts(currentSnapshot);
  hydrateRunDepthChart(currentSnapshot?.runDepth, state.minDepth);
  wireOverviewInteractions();
}

function renderSingleTeamCard(trainerName, team) {
  const leadLvl = leadLevel(team);
  const visibleTrainerName = displayTrainerName(trainerName);

  let html = `
    <div class="team">
      <div class="teamHeader">
        <div>
          <div class="name">${escapeHtml(visibleTrainerName)}</div>
          <div class="meta">Lead level: <span style="color:var(--accent);font-weight:700;">${leadLvl}</span> • Party size: ${team.length}</div>
        </div>
      </div>

      <div class="monGrid">
  `;

  for (const mon of team) {
    const species = mon.species ?? "Unknown";
    const level = mon.level ?? "?";
    const nature = mon.nature ?? "";
    const ability = mon.ability ?? "";
    const item = mon.item ?? "";
    const moves = Array.isArray(mon.moves) ? mon.moves : [];
    const img = spriteSrc(species);

    html += `
      <div class="monCard">
        <div class="monTop">
          ${pokemonLinkMarkup(
            species,
            `<img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
                 onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">`,
            "pokemonSpriteButton"
          )}
        </div>
        <div class="monBody">
          <div class="monTitle">
            ${pokemonLinkMarkup(
              species,
              escapeHtml(species),
              "species pokemonNameLink"
            )}
            <div class="lvl">Lv ${escapeHtml(level)}</div>
          </div>

          <div class="monFacts">
            <div class="factRow"><span>Nature</span><span>${escapeHtml(nature)}</span></div>
            <div class="factRow"><span>Ability</span><span>${escapeHtml(ability)}</span></div>
            <div class="factRow"><span>Item</span><span>${escapeHtml(item)}</span></div>
          </div>

          <ul class="moves">
            ${moves.slice(0, 4).map((move) => `<li>${escapeHtml(move)}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }

  html += `</div></div>`;
  return html;
}

function renderTeam(trainerName, team, teamVariantNames = []) {
  const variantNames = Array.isArray(teamVariantNames) && teamVariantNames.length
    ? teamVariantNames
    : [trainerName];
  const teamEntries = variantNames
    .map((variantName) => ({
      trainerName: variantName,
      team: Array.isArray(TRAINERS[variantName]) ? TRAINERS[variantName] : [],
    }))
    .filter((entry) => entry.team.length);

  if (!teamEntries.length) {
    teamEntries.push({
      trainerName,
      team: Array.isArray(team) ? team : [],
    });
  }

  let html = "";
  if (teamEntries.length > 1) {
    html += `
      <div class="dashTitle" style="margin-top:14px;">
        <h3>Team Variations</h3>
        <div class="meta">${teamEntries.length} variations</div>
      </div>
    `;
  }

  for (const entry of teamEntries) {
    html += renderSingleTeamCard(entry.trainerName, entry.team);
  }

  html += `
    <div id="usageDash" class="dash"></div>
    <div id="battlesDash" class="dash"></div>
  `;
  $("#out").html(html);
}

function renderOutMessage(message, details) {
  clearOverviewCharts();
  const detailHtml = details ? `<div class="meta">${escapeHtml(details)}</div>` : "";
  $("#out").html(`<div class="emptyState">${escapeHtml(message)}${detailHtml}</div>`);
}

function renderDashMessage(elementId, title, details) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const detailHtml = details ? `<div class="meta">${escapeHtml(details)}</div>` : `<div class="meta"></div>`;
  el.innerHTML = `<div class="dashTitle"><h3>${escapeHtml(title)}</h3>${detailHtml}</div>`;
}

function templateResult(item) {
  if (item.children || !item.id) return item.text;
  const $row = $("<div></div>");
  $row.append($("<span></span>").text(item.text));
  $row.append($("<span class=\"opt-level\"></span>").text(`Lead Lv ${item._leadLevel}`));
  return $row;
}

function templateSelection(item) {
  if (!item || !item.id) return item?.text || "Search trainer name…";
  return item.text;
}

function templatePokemonResult(item) {
  if (!item.id) return item.text;
  const $row = $("<div class=\"pokemonOption\"></div>");
  const $img = $("<img>").attr({
    src: spriteSrc(item.text),
    alt: item.text,
    loading: "lazy",
  }).on("error", function () {
    this.style.opacity = ".35";
    this.title = "Missing sprite";
  });
  $row.append($img);
  $row.append($("<span></span>").text(item.text));
  return $row;
}

function templatePokemonSelection(item) {
  if (!item || !item.id) return item?.text || "Search pokemon…";
  return item.text;
}

function getUsageTrainerKey(data) {
  return String(data?._usageKey ?? data?.tr_id ?? data?.id ?? "");
}

function updateDashboardQueryParams(updates, options = {}) {
  const url = new URL(window.location.href);
  Object.entries(updates || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false || value === "") {
      url.searchParams.delete(key);
      return;
    }
    url.searchParams.set(key, String(value));
  });
  if (url.href === window.location.href) return;
  if (options.replace) {
    window.history.replaceState({}, "", url);
    return;
  }
  window.history.pushState({}, "", url);
}

function updateTrainerQueryParam(trainerName, options) {
  updateDashboardQueryParams({
    trainer: trainerName || null,
    pokemon: null,
    family: null,
  }, options);
}

function updatePokemonQueryParams(species, familyMode, options) {
  updateDashboardQueryParams({
    trainer: null,
    pokemon: species || null,
    family: familyMode ? null : "0",
  }, options);
}

function currentPokemonFamilyMode() {
  return new URLSearchParams(window.location.search).get("family") !== "0";
}

function findTrainerOptionById(select2Data, trainerName) {
  for (const section of select2Data) {
    if (!Array.isArray(section.children)) continue;
    for (const group of section.children) {
      if (!Array.isArray(group.children)) continue;
      const match = group.children.find((child) => child.id === trainerName || child._usageKey === trainerName);
      if (match) return match;
    }
  }
  return null;
}

function topCountsToChips(entries) {
  return Array.isArray(entries) ? entries.slice(0, 8) : [];
}

function renderSummaryChips(entries) {
  const chips = topCountsToChips(entries);
  if (!chips.length) return `<span class="chip">—</span>`;
  return chips
    .map((entry) => `<span class="chip">${escapeHtml(entry.name)} <b>${escapeHtml(String(entry.pct ?? 0))}%</b></span>`)
    .join("");
}

function renderUsageDash(summary) {
  const dashEl = document.getElementById("usageDash");
  if (!dashEl) return;

  const totalBattles = summary?.totalBattles ?? 0;
  const topPokemon = Array.isArray(summary?.topPokemon) ? summary.topPokemon : [];

  let html = `
    <div class="dashTitle">
      <h3>Top used Pokémon (across ${totalBattles} battles)</h3>
      <div class="meta">Percentages are the percent of time this pokemon was used when it has been caught by the player.</div>
    </div>
    <div class="usageGrid">
  `;

  for (const st of topPokemon) {
    const species = st.species || "Unknown";
    const img = spriteSrc(species);
    const participation = st.participationPct != null ? `${st.participationPct}%` : "—";
    const caughtCount = st.caughtCount ?? 0;
    const inParty = st.inParty ?? 0;

    html += `
      <div class="usageCard">
        <div class="usageCardTop">
          ${pokemonLinkMarkup(
            species,
            `
              <img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
                   onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">
              <div>
                <div class="name">${escapeHtml(species)}</div>
                <div class="sub">
                  Used in party: <b style="color:var(--accent)">${inParty}</b> / ${caughtCount}
                  • Participation: <b style="color:var(--accent)">${participation}</b>
                </div>
              </div>
            `,
            "usageCardPokemonLink"
          )}
        </div>

        <div class="usageBody">
          <div class="kvRow"><span>Moves</span><span>${inParty ? "top 8" : ""}</span></div>
          <div class="chips">${renderSummaryChips(st.moves)}</div>

          <div class="kvRow"><span>Items</span><span>${inParty ? "top 8" : ""}</span></div>
          <div class="chips">${renderSummaryChips(st.items)}</div>

          <div class="kvRow"><span>Abilities</span><span>${inParty ? "top 8" : ""}</span></div>
          <div class="chips">${renderSummaryChips(st.abilities)}</div>

          <div class="kvRow"><span>Natures</span><span>${inParty ? "top 8" : ""}</span></div>
          <div class="chips">${renderSummaryChips(st.natures)}</div>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  dashEl.innerHTML = html;
}

function formatBattleTimestamp(createdAt) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return String(createdAt);
  return date.toLocaleString();
}

function renderBattlesDash(battles) {
  const battlesEl = document.getElementById("battlesDash");
  if (!battlesEl) return;

  const rows = Array.isArray(battles) ? battles : [];
  let html = `
    <div class="dashTitle">
      <h3>Recent battles</h3>
      <div class="meta">${rows.length ? `${rows.length} displayed` : "No battles available."}</div>
    </div>
    <div class="battlesList">
  `;

  for (const battle of rows) {
    const party = Array.isArray(battle.party) ? battle.party : [];
    const createdAt = formatBattleTimestamp(battle.createdAt);
    html += `<div class="battleCard">`;
    if (createdAt) {
      html += `<div class="meta">${escapeHtml(createdAt)}</div>`;
    }
    html += `<div class="monGrid">`;

    for (const mon of party) {
      const species = mon?.species ?? "Unknown";
      const moves = Array.isArray(mon?.moves) ? mon.moves : [];
      const img = spriteSrc(species);

      html += `
        <div class="monCard">
          <div class="monTop">
            ${pokemonLinkMarkup(
              species,
              `<img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
                   onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">`,
              "pokemonSpriteButton"
            )}
          </div>
          <div class="monBody">
            <div class="monTitle">
              ${pokemonLinkMarkup(
                species,
                escapeHtml(species),
                "species pokemonNameLink"
              )}
              <div class="lvl"></div>
            </div>

            <div class="monFacts">
              <div class="factRow"><span>Nature</span><span>${escapeHtml(mon?.nature ?? "")}</span></div>
              <div class="factRow"><span>Ability</span><span>${escapeHtml(mon?.ability ?? "")}</span></div>
              <div class="factRow"><span>Item</span><span>${escapeHtml(mon?.item ?? "")}</span></div>
            </div>

            <ul class="moves">
              ${moves.slice(0, 4).map((move) => `<li>${escapeHtml(move)}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
  }

  html += `</div>`;
  battlesEl.innerHTML = html;
}

async function renderTrainerUsageDashboard(trainerData) {
  const requestId = ++latestAnalyticsRequestId;
  renderDashMessage("usageDash", "Top used Pokémon", "Loading…");
  renderDashMessage("battlesDash", "Recent battles", "Loading…");

  try {
    const detail = await window.loadTrainerAnalyticsDetail(window.analyticsIndexData, getUsageTrainerKey(trainerData));
    if (requestId !== latestAnalyticsRequestId) return;
    renderUsageDash(detail.summary || {});
    renderBattlesDash(detail.battles || []);
  } catch (error) {
    if (requestId !== latestAnalyticsRequestId) return;
    renderDashMessage("usageDash", "Top used Pokémon", error.message || "Failed to load offline analytics.");
    renderDashMessage("battlesDash", "Recent battles", error.message || "Failed to load offline analytics.");
  }
}

async function ensureOverviewDataLoaded() {
  if (window.analyticsOverviewData) {
    return window.analyticsOverviewData;
  }

  window.analyticsOverviewData = await window.loadAnalyticsOverviewByIndex(window.analyticsIndexData);
  const state = overviewState();
  state.minDepth = 1;
  state.currentSnapshot = getOverviewSnapshot(window.analyticsOverviewData, state.minDepth);
  window.analyticsOverviewState = state;
  return window.analyticsOverviewData;
}

async function ensurePokemonIndexLoaded() {
  const state = pokemonState();
  if (state.pokemonIndexData) {
    return state.pokemonIndexData;
  }
  state.pokemonIndexData = await window.loadPokemonIndexByGame(window.analyticsIndexData);
  window.analyticsPokemonState = state;
  return state.pokemonIndexData;
}

function getPokemonSnapshot(pokemonDetailData, species, familyMode, minDepth) {
  const safeSpecies = String(species || "");
  const key = String(clampMinDepth(minDepth, window.analyticsOverviewData || window.analyticsIndexData?.overviewMeta));
  if (familyMode) {
    return pokemonDetailData?.familyCombined?.byMinDepth?.[key] || pokemonDetailData?.familyCombined?.byMinDepth?.["1"] || null;
  }
  return pokemonDetailData?.speciesEntries?.[safeSpecies]?.byMinDepth?.[key]
    || pokemonDetailData?.speciesEntries?.[safeSpecies]?.byMinDepth?.["1"]
    || null;
}

function renderPokemonOverviewPage(snapshot, options) {
  clearOverviewCharts();
  const species = options?.species || "Unknown";
  const familyMode = Boolean(options?.familyMode);
  const familyMembers = Array.isArray(options?.familyMembers) ? options.familyMembers : [];
  const showToggle = familyMembers.length > 1;
  const hasRunDepth = window.analyticsIndexData?.overviewMeta?.runDepthAvailable;
  const averageRunDepth = snapshot?.averageRunDepthStep != null
    ? `${formatDepthValue(snapshot.averageRunDepthStep)} • ${formatPercent(snapshot.averageRunDepthPct)}`
    : "—";
  const familyLabel = familyMode ? `Aggregating ${familyMembers.join(", ")}.` : "";
  const topBattles = Array.isArray(snapshot?.topBattles) ? snapshot.topBattles : [];

  renderHeader("pokemon-detail", {
    generatedAt: options?.generatedAt || window.analyticsIndexData?.generatedAt,
  });

  const html = `
    <div class="overview">
      ${renderOverviewControls(window.analyticsOverviewData, overviewState().minDepth)}
      <section class="overviewSection pokemonOverview">
        <div class="pokemonOverviewHeader">
          <div class="pokemonHero">
            <img src="${spriteSrc(species)}" alt="${escapeHtml(species)}" loading="lazy"
                 onerror="this.style.opacity=.35;this.title='Missing sprite'">
            <div>
              <h2>${escapeHtml(species)}</h2>
              ${familyMode && familyMembers.length
                ? `<div class="sectionMeta">${escapeHtml(familyMembers.join(", "))}</div>`
                : ""}
            </div>
          </div>
          ${showToggle ? `
            <label class="familyToggle">
              <input id="pokemonFamilyToggle" type="checkbox"${familyMode ? " checked" : ""}>
              <span>Include full family</span>
            </label>
          ` : ""}
        </div>
        ${familyLabel ? `<div class="sectionMeta">${escapeHtml(familyLabel)}</div>` : ""}
        <div class="overviewGrid">
          ${overviewCard("Runs with this Pokemon", formatNumber(snapshot?.runCount || 0))}
          ${overviewCard("Avg participation", snapshot?.averageParticipationPct != null ? formatPercent(snapshot.averageParticipationPct) : "—")}
          ${overviewCard("Avg run depth", hasRunDepth ? averageRunDepth : "—")}
        </div>
        ${snapshot?.runCount ? "" : `<div class="emptyState">No runs matched the current depth filter.</div>`}
      </section>
      <section class="overviewSection">
        <div class="sectionHeader">
          <h2>Top 10 Battles</h2>
        </div>
        ${topBattles.length ? `
          <div class="overviewTableWrap">
            <table class="overviewTable">
              <thead>
                <tr>
                  <th>Battle</th>
                  <th>Recorded uses</th>
                  <th>Participation</th>
                </tr>
              </thead>
              <tbody>
                ${topBattles.map((battle) => `
                  <tr>
                    <td>
                      <div>${escapeHtml(displayTrainerName(battle.displayName || battle.usageKey || "Unknown"))}</div>
                      ${battle.leadLevel != null ? `<div class="sectionMeta">Lead Lv ${escapeHtml(String(battle.leadLevel))}</div>` : ""}
                    </td>
                    <td>${escapeHtml(formatNumber(battle.partyCount || 0))}</td>
                    <td>${escapeHtml(formatPercent(battle.participationPct || 0))}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<div class="emptyState">No battle usage data available for this filter.</div>`}
      </section>
    </div>
  `;

  $("#out").html(html);
}

function wirePokemonInteractions() {
  $("#pokemonFamilyToggle").off("change").on("change", function () {
    const state = pokemonState();
    state.familyMode = Boolean(this.checked);
    window.analyticsPokemonState = state;
    updatePokemonQueryParams(state.selectedSpecies, state.familyMode);
    void renderPokemonDetailMode(state.selectedSpecies, state.familyMode);
  });
}

async function renderPokemonDetailMode(species, familyMode, options = {}) {
  const safeSpecies = String(species || "");
  if (!safeSpecies) {
    await renderOverviewMode(options);
    return;
  }

  try {
    if (window.analyticsIndexData?.overviewMeta?.runDepthAvailable) {
      await ensureOverviewDataLoaded();
    }
    const pokemonIndexData = await ensurePokemonIndexLoaded();
    const { detail, indexEntry } = await window.loadPokemonFamilyDetail(pokemonIndexData, safeSpecies);
    const state = pokemonState();
    state.selectedSpecies = safeSpecies;
    state.familyMode = Boolean(familyMode);
    state.pokemonIndexData = pokemonIndexData;
    state.pokemonDetailData = detail;
    window.analyticsPokemonState = state;
    if (options.updateUrl !== false) {
      updatePokemonQueryParams(safeSpecies, state.familyMode, { replace: Boolean(options.replaceHistory) });
    }
    renderPokemonOverviewPage(
      getPokemonSnapshot(detail, safeSpecies, state.familyMode, overviewState().minDepth),
      {
        species: safeSpecies,
        familyMode: state.familyMode,
        familyMembers: indexEntry?.familyMembers || detail?.familyMembers || [],
        generatedAt: detail?.generatedAt,
      }
    );
    wirePokemonInteractions();
  } catch (error) {
    renderHeader("pokemon-detail", { generatedAt: window.analyticsIndexData?.generatedAt });
    renderOutMessage("Pokemon data unavailable.", error.message || "Failed to load offline pokemon analytics.");
  }
}

async function renderOverviewMode() {
  try {
    const overviewData = await ensureOverviewDataLoaded();
    const state = overviewState();
    const snapshot = state.currentSnapshot || getOverviewSnapshot(overviewData, state.minDepth);
    renderOverview(window.analyticsIndexData, overviewData, snapshot);
  } catch (error) {
    renderHeader("overview", { generatedAt: window.analyticsIndexData?.generatedAt });
    renderOutMessage("Offline overview unavailable.", error.message || "Failed to load overview analytics.");
  }
}

async function selectPokemonBySpecies(species) {
  if (!species) return;
  const pokemonIndexData = await ensurePokemonIndexLoaded();
  const entry = (pokemonIndexData?.species || []).find((item) => item.species === species);
  if (!entry) return;
  $("#pokemonSelect").val(species).trigger("change.select2");
  await renderPokemonDetailMode(species, currentPokemonFamilyMode());
}

async function renderTrainerSelection(data, options = {}) {
  if (!data || !data.id) return;

  clearOverviewCharts();
  const displayName = data.id;
  const team = TRAINERS[displayName] || [];
  const teamVariantNames = Array.isArray(data._teamVariantNames) ? data._teamVariantNames : [];

  if (options.updateUrl !== false) {
    updateTrainerQueryParam(displayName, { replace: Boolean(options.replaceHistory) });
  }
  renderHeader("trainer-detail", {
    generatedAt: window.analyticsIndexData?.generatedAt,
    trainerName: displayName,
  });
  renderTeam(displayName, team, teamVariantNames);
  await renderTrainerUsageDashboard(data);
}

async function navigateToOverview(options = {}) {
  if (options.updateUrl !== false) {
    updateDashboardQueryParams({
      trainer: null,
      pokemon: null,
      family: null,
    }, { replace: Boolean(options.replaceHistory) });
  }
  $("#trainerSelect").val(null).trigger("change.select2");
  $("#pokemonSelect").val(null).trigger("change.select2");
  await renderOverviewMode();
}

async function syncDashboardFromUrl(options = {}) {
  const params = new URLSearchParams(window.location.search);
  const queriedTrainer = params.get("trainer");
  const queriedPokemon = params.get("pokemon");
  const familyMode = currentPokemonFamilyMode();
  const trainerData = queriedTrainer ? findTrainerOptionById(window.select2TrainerData || [], queriedTrainer) : null;
  const pokemonEntries = window.select2PokemonData || [];
  const pokemonExists = queriedPokemon && pokemonEntries.some((entry) => entry.id === queriedPokemon);

  isRoutingDashboardState = true;
  try {
    if (trainerData) {
      $("#trainerSelect").val(trainerData.id).trigger("change.select2");
      $("#pokemonSelect").val(null).trigger("change.select2");
      await renderTrainerSelection(trainerData, { updateUrl: false, replaceHistory: options.replaceHistory });
      return;
    }

    if (pokemonExists) {
      $("#trainerSelect").val(null).trigger("change.select2");
      $("#pokemonSelect").val(queriedPokemon).trigger("change.select2");
      await renderPokemonDetailMode(queriedPokemon, familyMode, { updateUrl: false, replaceHistory: options.replaceHistory });
      return;
    }

    await navigateToOverview({ updateUrl: false, replaceHistory: options.replaceHistory });
  } finally {
    isRoutingDashboardState = false;
  }
}

function getTrainerNames() {
  let allPoks = {};
  if (TITLE === "Emerald Imperium 1.3") {
    allPoks = backup_data;
  } else {
    allPoks = backup_data.formatted_sets;
  }

  window.trainersByName = {};

  for (const [pokName, poks] of Object.entries(allPoks)) {
    for (const trainerKey of Object.keys(poks)) {
      const trainerName = trainerKey.match(/Lvl\s+-?\d+\s+(.+?)\s*$/)?.[1] ?? null;
      if (!trainerName) continue;

      window.trainersByName[trainerName] ||= [];

      const pokData = { ...poks[trainerKey], species: pokName };
      window.trainersByName[trainerName].push(pokData);
    }
  }

  Object.assign(TRAINERS, window.trainersByName);
}

async function initializeDashboard() {
  try {
    window.analyticsManifest = await window.loadAnalyticsManifest();
    window.analyticsIndexData = await window.loadAnalyticsIndexByTitle(TITLE);
  } catch (error) {
    renderHeader("overview", {});
    renderOutMessage("Offline analytics unavailable.", error.message || "Failed to load analytics index.");
    return;
  }

  window.dashboardCalculatorUrl = fallbackCalculatorUrl();
  renderHeader("overview", { generatedAt: window.analyticsIndexData?.generatedAt });
  window.dashboardCalculatorUrl = await loadCalculatorUrlFromIndex();

  const trainerEntries = window.analyticsIndexData?.trainers || [];
  if (!trainerEntries.length) {
    renderHeader("overview", { generatedAt: window.analyticsIndexData?.generatedAt });
    renderOutMessage("Offline analytics not generated yet.", "Run the export script to create trainer data for this game.");
    return;
  }

  const data = buildSelect2Data(trainerEntries);
  window.select2TrainerData = data;
  let pokemonData = [];

  try {
    const pokemonIndexData = await ensurePokemonIndexLoaded();
    pokemonData = buildPokemonSelectData(pokemonIndexData?.species || []);
    window.select2PokemonData = pokemonData;
  } catch (error) {
    console.warn(error);
  }

  $("#trainerSelect").select2({
    data,
    placeholder: "Search trainer name…",
    allowClear: true,
    width: "100%",
    templateResult,
    templateSelection,
    matcher: function (params, result) {
      if ($.trim(params.term) === "") return result;

      if (result.children) {
        const term = params.term.toLowerCase();
        const kids = result.children
          .map((group) => {
            if (!group.children) return null;
            const matched = group.children.filter((child) => (child.text || "").toLowerCase().includes(term));
            if (!matched.length) return null;
            return { ...group, children: matched };
          })
          .filter(Boolean);
        return kids.length ? { ...result, children: kids } : null;
      }

      return (result.text || "").toLowerCase().includes(params.term.toLowerCase()) ? result : null;
    },
  });

  $("#pokemonSelect").select2({
    data: pokemonData,
    placeholder: "Search pokemon…",
    allowClear: true,
    width: "100%",
    templateResult: templatePokemonResult,
    templateSelection: templatePokemonSelection,
  });

  $("#trainerSelect")
    .on("select2:select", function (e) {
      if (isRoutingDashboardState) return;
      $("#pokemonSelect").val(null).trigger("change.select2");
      void renderTrainerSelection(e.params.data);
    })
    .on("select2:clear", function () {
      if (isRoutingDashboardState) return;
      if ($("#pokemonSelect").val()) return;
      void navigateToOverview();
    });

  $("#pokemonSelect")
    .on("select2:select", function (e) {
      if (isRoutingDashboardState) return;
      $("#trainerSelect").val(null).trigger("change.select2");
      void renderPokemonDetailMode(e.params.data.id, true);
    })
    .on("select2:clear", function () {
      if (isRoutingDashboardState) return;
      if ($("#trainerSelect").val()) return;
      void navigateToOverview();
    });

  $(document)
    .off("click.analyticsPokemonLink", ".pokemonLink")
    .on("click.analyticsPokemonLink", ".pokemonLink", function (event) {
      event.preventDefault();
      const species = this.dataset.species;
      if (!species) return;
      void selectPokemonBySpecies(species);
    });

  window.addEventListener("popstate", () => {
    void syncDashboardFromUrl({ replaceHistory: true });
  });

  await syncDashboardFromUrl({ replaceHistory: true });
}

$(function () {
  void initializeDashboard();
});
