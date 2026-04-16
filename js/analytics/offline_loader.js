(function () {
  const DEFAULT_BASE = "data/analytics";
  const TITLE_ALIASES = {
    "Pokemon Null 1.1": "Pokemon Null",
    "Pokemon Null 1.2": "Pokemon Null",
  };
  let manifestPromise = null;
  const indexPromises = new Map();
  const overviewPromises = new Map();
  const detailPromises = new Map();
  const pokemonIndexPromises = new Map();
  const pokemonDetailPromises = new Map();

  function analyticsBase() {
    return String(window.OFFLINE_ANALYTICS_BASE || DEFAULT_BASE).replace(/\/+$/, "");
  }

  function withVersion(url, version) {
    if (!version) return url;
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}v=${encodeURIComponent(version)}`;
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.json();
  }

  async function loadAnalyticsManifest() {
    if (!manifestPromise) {
      manifestPromise = fetchJson(`${analyticsBase()}/manifest.json`);
    }
    return manifestPromise;
  }

  function resolveAnalyticsTitle(title, manifest) {
    const titleText = String(title || "");
    if (!titleText) return "";

    if (manifest?.titles?.[titleText]) {
      return titleText;
    }

    if (TITLE_ALIASES[titleText] && manifest?.titles?.[TITLE_ALIASES[titleText]]) {
      return TITLE_ALIASES[titleText];
    }

    const manifestTitles = Object.keys(manifest?.titles || {});
    const prefixMatch = manifestTitles
      .sort((left, right) => right.length - left.length)
      .find((candidate) => titleText.includes(candidate));

    return prefixMatch || titleText;
  }

  async function loadAnalyticsIndexByTitle(title) {
    const manifest = await loadAnalyticsManifest();
    const resolvedTitle = resolveAnalyticsTitle(title, manifest);
    const slug = manifest?.titles?.[resolvedTitle];

    if (!slug) {
      throw new Error(`No offline analytics dataset configured for "${title}"`);
    }

    const version = manifest.version || "";
    const cacheKey = `${slug}@${version}`;
    if (!indexPromises.has(cacheKey)) {
      const url = withVersion(`${analyticsBase()}/${slug}/index.json`, version);
      indexPromises.set(
        cacheKey,
        fetchJson(url).then((indexData) => ({
          ...indexData,
          slug,
          version,
          resolvedTitle,
        }))
      );
    }
    return indexPromises.get(cacheKey);
  }

  async function loadTrainerAnalyticsDetail(indexData, usageKey) {
    const keyText = String(usageKey ?? "");
    const trainer = (indexData?.trainers || []).find((entry) => String(entry.usageKey) === keyText);

    if (!trainer) {
      throw new Error(`No offline analytics detail found for trainer key "${keyText}"`);
    }
    if (!trainer.detailFile) {
      throw new Error(`Trainer "${trainer.displayName}" is missing a detail file`);
    }

    const version = indexData.version || indexData.generatedAt || "";
    const cacheKey = `${indexData.slug}/${trainer.detailFile}@${version}`;
    if (!detailPromises.has(cacheKey)) {
      const url = withVersion(`${analyticsBase()}/${indexData.slug}/${trainer.detailFile}`, version);
      detailPromises.set(cacheKey, fetchJson(url));
    }
    return detailPromises.get(cacheKey);
  }

  async function loadAnalyticsOverviewByIndex(indexData) {
    if (!indexData?.overviewFile) {
      if (indexData?.overview) {
        return {
          title: indexData.title,
          generatedAt: indexData.generatedAt,
          maxStep: indexData.overviewMeta?.maxStep || indexData.overview?.runDepth?.maxStep || 0,
          defaultMinDepth: indexData.overviewMeta?.defaultMinDepth || 1,
          milestones: indexData.overview?.runDepth?.importantTrainerMarkers || [],
          byMinDepth: {
            "1": indexData.overview,
          },
        };
      }
      throw new Error(`No offline analytics overview file configured for "${indexData?.title || "unknown title"}"`);
    }

    const version = indexData.version || indexData.generatedAt || "";
    const cacheKey = `${indexData.slug}/${indexData.overviewFile}@${version}`;
    if (!overviewPromises.has(cacheKey)) {
      const url = withVersion(`${analyticsBase()}/${indexData.slug}/${indexData.overviewFile}`, version);
      overviewPromises.set(cacheKey, fetchJson(url));
    }
    return overviewPromises.get(cacheKey);
  }

  async function loadPokemonIndexByGame(indexData) {
    if (!indexData?.pokemonIndexFile) {
      throw new Error(`No offline pokemon index configured for "${indexData?.title || "unknown title"}"`);
    }

    const version = indexData.version || indexData.generatedAt || "";
    const cacheKey = `${indexData.slug}/${indexData.pokemonIndexFile}@${version}`;
    if (!pokemonIndexPromises.has(cacheKey)) {
      const url = withVersion(`${analyticsBase()}/${indexData.slug}/${indexData.pokemonIndexFile}`, version);
      pokemonIndexPromises.set(
        cacheKey,
        fetchJson(url).then((pokemonIndexData) => ({
          ...pokemonIndexData,
          slug: indexData.slug,
          version,
        }))
      );
    }
    return pokemonIndexPromises.get(cacheKey);
  }

  async function loadPokemonFamilyDetail(pokemonIndexData, species) {
    const speciesText = String(species || "");
    const indexEntry = (pokemonIndexData?.species || []).find((entry) => entry.species === speciesText);
    if (!indexEntry) {
      throw new Error(`No offline pokemon detail found for "${speciesText}"`);
    }
    if (!indexEntry.detailFile) {
      throw new Error(`Pokemon "${speciesText}" is missing a detail file`);
    }

    const version = pokemonIndexData.version || pokemonIndexData.generatedAt || "";
    const cacheKey = `${pokemonIndexData.slug}/${indexEntry.detailFile}@${version}`;
    if (!pokemonDetailPromises.has(cacheKey)) {
      const url = withVersion(`${analyticsBase()}/${pokemonIndexData.slug}/pokemon/${indexEntry.detailFile}`, version);
      pokemonDetailPromises.set(cacheKey, fetchJson(url));
    }

    const detail = await pokemonDetailPromises.get(cacheKey);
    return {
      detail,
      speciesEntry: detail?.speciesEntries?.[speciesText] || null,
      indexEntry,
    };
  }

  window.loadAnalyticsManifest = loadAnalyticsManifest;
  window.loadAnalyticsIndexByTitle = loadAnalyticsIndexByTitle;
  window.loadAnalyticsOverviewByIndex = loadAnalyticsOverviewByIndex;
  window.loadTrainerAnalyticsDetail = loadTrainerAnalyticsDetail;
  window.loadPokemonIndexByGame = loadPokemonIndexByGame;
  window.loadPokemonFamilyDetail = loadPokemonFamilyDetail;
  window.resolveOfflineAnalyticsTitle = resolveAnalyticsTitle;
})();
