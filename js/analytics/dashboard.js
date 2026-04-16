TITLE = document.title.split(" Usage Data")[0];

window.allPoks = {};
window.analyticsIndexData = null;
window.analyticsManifest = null;

const TRAINERS = {};
const OVERVIEW_CHART_COLORS = [
  "#8be9fd",
  "#50fa7b",
  "#ff79c6",
  "#bd93f9",
  "#f1fa8c",
  "#ffb86c",
  "#ff5555",
  "#7df9ff",
];

let latestAnalyticsRequestId = 0;
let overviewCharts = [];

getTrainerNames();

function isBossTrainer(name) {
  return /\b(Admin|Leader|Rival)\b/i.test(name);
}

function leadLevel(teamArr) {
  return teamArr && teamArr.length && Number.isFinite(+teamArr[0].level) ? +teamArr[0].level : -1;
}

function dashboardConfig() {
  return (window.DASHBOARD_GAME_CONFIG && window.DASHBOARD_GAME_CONFIG[TITLE]) || {};
}

function dashboardAssetBase() {
  return String(window.DASHBOARD_ASSET_BASE || ".").replace(/\/+$/, "");
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

function buildSelect2Data(trainers) {
  const bossesByLvl = new Map();
  const othersByLvl = new Map();

  for (const trainer of trainers) {
    const displayName = trainer.displayName || String(trainer.usageKey || "");
    const team = TRAINERS[displayName] || [];
    const lvl = Number.isFinite(+trainer.leadLevel) ? +trainer.leadLevel : leadLevel(team);

    const entry = {
      id: displayName,
      text: displayName,
      _leadLevel: lvl,
      _usageKey: String(trainer.usageKey ?? displayName),
      tr_id: trainer.trId ?? null,
      _partySize: trainer.partySize ?? team.length,
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

  let controlsMeta = document.querySelector(".controlsMeta");
  if (!controlsMeta) {
    controlsMeta = document.createElement("div");
    controlsMeta.className = "controlsMeta";
    const controls = document.querySelector(".controls");
    if (controls) controls.appendChild(controlsMeta);
  }

  return { titleSub, overviewBtn, controlsMeta };
}

function renderHeader(mode, options) {
  const { titleSub, overviewBtn, controlsMeta } = ensureHeaderElements();
  const generatedAt = options?.generatedAt ? formatGeneratedAt(options.generatedAt) : "";

  if (titleSub) {
    titleSub.textContent = generatedAt ? `Offline data updated ${generatedAt}` : "Offline analytics";
  }

  if (overviewBtn) {
    overviewBtn.textContent = mode === "overview" ? "Overview" : "Back to overview";
    overviewBtn.disabled = mode === "overview";
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

function renderImportantTrainerSection(overview) {
  const items = Array.isArray(overview?.importantTrainerBattles) ? overview.importantTrainerBattles : [];
  const cards = items.length
    ? items
        .map(
          (item) => `
            <button type="button" class="importantCard" data-trainer-name="${escapeHtml(item.sourceDisplayName || item.displayName)}">
              <div class="importantSprite">
                <img src="${trainerSpriteSrc(item.displayName)}" alt="${escapeHtml(item.displayName)}" loading="lazy"
                     onerror="this.style.opacity=.35;this.title='Missing trainer sprite'">
              </div>
              <div class="importantCardBody">
                <div class="importantName">${escapeHtml(item.displayName)}</div>
                <div class="importantCount">${escapeHtml(formatNumber(item.runCount))} runs</div>
              </div>
            </button>
          `
        )
        .join("")
    : `<div class="emptyState">No important trainer data configured for this game.</div>`;

  return `
    <section class="overviewSection">
      <div class="sectionHeader">
        <h2>Important Trainers</h2>
      </div>
      <div class="importantGrid">${cards}</div>
    </section>
  `;
}

function filteredRunDepthMarkers(runDepth) {
  const markers = Array.isArray(runDepth?.importantTrainerMarkers)
    ? runDepth.importantTrainerMarkers.filter((marker) => String(marker?.label || "").trim())
    : [];

  const champions = markers.filter((marker) => /Champion/i.test(marker.label));
  const championToShow = champions.length
    ? champions.reduce((best, marker) => (Number(marker.step) > Number(best.step) ? marker : best))
    : null;

  return markers.filter((marker) => {
    if (/Elite Four/i.test(marker.label)) return false;
    if (/Champion/i.test(marker.label)) return championToShow && marker === championToShow;
    return true;
  });
}

function sortedGroupSlices(group) {
  return [...(group?.slices || [])].sort((a, b) => (b.count - a.count) || a.species.localeCompare(b.species));
}

function starterChartLegend(group) {
  return sortedGroupSlices(group)
    .map(
      (slice, index) => `
        <div class="chartLegendRow">
          <div class="chartLegendMain">
            <img class="chartLegendSprite" src="${spriteSrc(slice.species)}" alt="${escapeHtml(slice.species)}" loading="lazy"
                 onerror="this.style.opacity=.35;this.title='Missing sprite'">
            <span>${escapeHtml(slice.species)}</span>
          </div>
          <span class="chartLegendPct">${escapeHtml(formatPercent(slice.pct))}</span>
        </div>
      `
    )
    .join("");
}

function renderStarterGiftCharts(overview) {
  const groups = Array.isArray(overview?.starterGiftGroups) ? overview.starterGiftGroups : [];
  if (!groups.length) {
    return "";
  }

  const cards = groups
    .map(
      (group, index) => `
        <div class="chartCard">
          <h3>${escapeHtml(group.label)}</h3>
          <div class="chartWrap">
            <canvas id="starter-chart-${index}" aria-label="${escapeHtml(group.label)} distribution"></canvas>
          </div>
          <div class="chartLegend">${starterChartLegend(group)}</div>
        </div>
      `
    )
    .join("");

  return `
    <section class="overviewSection">
      <div class="sectionHeader">
        <h2>Starter / Gift Distribution</h2>
      </div>
      <div class="chartGrid">${cards}</div>
    </section>
  `;
}

function hydrateStarterGiftCharts(overview) {
  clearOverviewCharts();

  if (typeof Chart === "undefined") return;

  const groups = Array.isArray(overview?.starterGiftGroups) ? overview.starterGiftGroups : [];
  groups.forEach((group, index) => {
    const canvas = document.getElementById(`starter-chart-${index}`);
    if (!canvas) return;

    const slices = sortedGroupSlices(group);
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
            backgroundColor: labels.map((_, colorIndex) => OVERVIEW_CHART_COLORS[colorIndex % OVERVIEW_CHART_COLORS.length]),
            borderColor: "#1f2230",
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
                return `${slice.species}: ${slice.pct}%`;
              },
            },
          },
        },
      },
    });
    overviewCharts.push(chart);
  });
}

function hydrateRunDepthChart(runDepth) {
  if (typeof Chart === "undefined" || !runDepth || runDepth.available === false) return;

  const canvas = document.getElementById("run-depth-chart");
  const histogram = Array.isArray(runDepth.histogram) ? runDepth.histogram : [];
  if (!canvas || !histogram.length) return;

  const labels = histogram.map((entry) => entry.step);
  const exactCounts = histogram.map((entry) => entry.count);
  const data = new Array(exactCounts.length);
  let runningTotal = 0;
  for (let index = exactCounts.length - 1; index >= 0; index -= 1) {
    runningTotal += Number(exactCounts[index]) || 0;
    data[index] = runningTotal;
  }
  const visibleMarkers = filteredRunDepthMarkers(runDepth);
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
          backgroundColor: "rgba(139, 233, 253, 0.45)",
          borderColor: "#8be9fd",
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
              if (markers && markers.length) return [`${step}`, ...markers];
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

function wireOverviewInteractions() {
  $(".importantCard").off("click").on("click", function () {
    const trainerName = this.dataset.trainerName;
    if (!trainerName) return;
    void selectTrainerByName(trainerName);
  });
}

function renderRunDepthSection(runDepth) {
  if (!runDepth || runDepth.available === false) {
    return `
      <section class="overviewSection">
        <div class="sectionHeader">
          <h2>Average Run Depth</h2>
        </div>
        <div class="emptyState">Not available for this game.</div>
      </section>
    `;
  }

  return `
    <section class="overviewSection">
      <div class="sectionHeader">
        <h2>Average Run Depth</h2>
      </div>
      <div class="runDepthWrap">
        <canvas id="run-depth-chart" aria-label="Average run depth distribution"></canvas>
      </div>
    </section>
  `;
}

function renderOverview(indexData) {
  clearOverviewCharts();
  renderHeader("overview", { generatedAt: indexData?.generatedAt });

  const overview = indexData?.overview || {};
  const starterSection = renderStarterGiftCharts(overview);

  const html = `
    <div class="overview">
      <div class="overviewGrid">
        ${overviewCard("Runs", formatNumber(overview.runCount || 0))}
      </div>
      ${renderImportantTrainerSection(overview)}
      ${renderRunDepthSection(overview.runDepth)}
      ${starterSection}
    </div>
  `;

  $("#out").html(html);
  hydrateStarterGiftCharts(overview);
  hydrateRunDepthChart(overview.runDepth);
  wireOverviewInteractions();
}

function renderTeam(trainerName, team) {
  const leadLvl = leadLevel(team);

  let html = `
    <div class="team">
      <div class="teamHeader">
        <div>
          <div class="name">${escapeHtml(trainerName)}</div>
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
          <img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
               onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">
        </div>
        <div class="monBody">
          <div class="monTitle">
            <div class="species" title="${escapeHtml(species)}">${escapeHtml(species)}</div>
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

function getUsageTrainerKey(data) {
  return String(data?._usageKey ?? data?.tr_id ?? data?.id ?? "");
}

function updateTrainerQueryParam(trainerName) {
  const url = new URL(window.location.href);
  if (trainerName) {
    url.searchParams.set("trainer", trainerName);
  } else {
    url.searchParams.delete("trainer");
  }
  window.history.replaceState({}, "", url);
}

function findTrainerOptionById(select2Data, trainerName) {
  for (const section of select2Data) {
    if (!Array.isArray(section.children)) continue;
    for (const group of section.children) {
      if (!Array.isArray(group.children)) continue;
      const match = group.children.find((child) => child.id === trainerName);
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
          <img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
               onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">
          <div>
            <div class="name">${escapeHtml(species)}</div>
            <div class="sub">
              Used in party: <b style="color:var(--accent)">${inParty}</b> / ${caughtCount}
              • Participation: <b style="color:var(--accent)">${participation}</b>
            </div>
          </div>
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
            <img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
                 onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">
          </div>
          <div class="monBody">
            <div class="monTitle">
              <div class="species" title="${escapeHtml(species)}">${escapeHtml(species)}</div>
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

async function renderTrainerSelection(data) {
  if (!data || !data.id) return;

  clearOverviewCharts();
  const displayName = data.id;
  const team = TRAINERS[displayName] || [];

  updateTrainerQueryParam(displayName);
  renderHeader("trainer-detail", {
    generatedAt: window.analyticsIndexData?.generatedAt,
    trainerName: displayName,
  });
  renderTeam(displayName, team);
  await renderTrainerUsageDashboard(data);
}

async function navigateToOverview() {
  updateTrainerQueryParam("");
  renderOverview(window.analyticsIndexData);
  $("#trainerSelect").val(null).trigger("change");
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

  const trainerEntries = window.analyticsIndexData?.trainers || [];
  if (!trainerEntries.length) {
    renderHeader("overview", { generatedAt: window.analyticsIndexData?.generatedAt });
    renderOutMessage("Offline analytics not generated yet.", "Run the export script to create trainer data for this game.");
    return;
  }

  const data = buildSelect2Data(trainerEntries);
  window.select2TrainerData = data;

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

  $("#trainerSelect")
    .on("select2:select", function (e) {
      void renderTrainerSelection(e.params.data);
    })
    .on("select2:clear", function () {
      void navigateToOverview();
    });

  const queriedTrainer = new URLSearchParams(window.location.search).get("trainer");
  const selectedTrainer = queriedTrainer ? findTrainerOptionById(data, queriedTrainer) : null;
  if (selectedTrainer) {
    await selectTrainerByName(selectedTrainer.id);
    return;
  }

  renderOverview(window.analyticsIndexData);
}

$(function () {
  void initializeDashboard();
});
