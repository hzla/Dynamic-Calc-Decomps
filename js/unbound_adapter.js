(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  var api = factory();
  root.normalizeUnboundMode = api.normalizeUnboundMode;
  root.normalizeUnboundDataSource = api.normalizeUnboundDataSource;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var VALID_UNBOUND_MODES = ["difficult", "expert", "insane"];
  var DEFAULT_UNBOUND_MODE = "insane";
  var CANONICAL_UNBOUND_TITLE = "Pokemon Unbound";

  function normalizeUnboundMode(mode) {
    return VALID_UNBOUND_MODES.indexOf(mode) !== -1 ? mode : DEFAULT_UNBOUND_MODE;
  }

  function getUnboundMode(modeOrSearch) {
    if (typeof modeOrSearch !== "string" || !modeOrSearch) {
      return DEFAULT_UNBOUND_MODE;
    }

    if (modeOrSearch.charAt(0) === "?" || modeOrSearch.indexOf("=") !== -1) {
      try {
        return normalizeUnboundMode(new URLSearchParams(modeOrSearch).get("m"));
      } catch (error) {
        return DEFAULT_UNBOUND_MODE;
      }
    }

    return normalizeUnboundMode(modeOrSearch);
  }

  function normalizeUnboundDataSource(legacyData, modeOrSearch) {
    var source = legacyData || {};
    var mode = getUnboundMode(modeOrSearch);
    var allFormattedSets = source.formatted_sets || {};

    return {
      title: CANONICAL_UNBOUND_TITLE,
      formatted_sets: allFormattedSets[mode] || allFormattedSets[DEFAULT_UNBOUND_MODE] || {},
      poks: source.pokedex || {},
      moves: source.unbound_moves || {},
      custom_moves: {},
      unboundModes: allFormattedSets
    };
  }

  return {
    CANONICAL_UNBOUND_TITLE: CANONICAL_UNBOUND_TITLE,
    DEFAULT_UNBOUND_MODE: DEFAULT_UNBOUND_MODE,
    VALID_UNBOUND_MODES: VALID_UNBOUND_MODES,
    normalizeUnboundMode: normalizeUnboundMode,
    normalizeUnboundDataSource: normalizeUnboundDataSource
  };
});
