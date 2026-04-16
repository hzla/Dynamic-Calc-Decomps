(function () {
  const DEFAULT_BASE = "data/analytics";
  let manifestPromise = null;
  const indexPromises = new Map();
  const detailPromises = new Map();

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

  async function loadAnalyticsIndexByTitle(title) {
    const manifest = await loadAnalyticsManifest();
    const slug = manifest?.titles?.[title];

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

  window.loadAnalyticsManifest = loadAnalyticsManifest;
  window.loadAnalyticsIndexByTitle = loadAnalyticsIndexByTitle;
  window.loadTrainerAnalyticsDetail = loadTrainerAnalyticsDetail;
})();
