(function () {
  if (window.__masterFilePollerInitialized) {
    return;
  }
  window.__masterFilePollerInitialized = true;

  const DEFAULT_POLL_INTERVAL_MS = 2000;

  window.latestPolledMasterSheetData = null;

  window.masterSheetPollerState = {
    fileHandle: null,
    pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
    timerId: null,
    isPolling: false,
    isReadInFlight: false,
    lastMasterRawText: null,
    lastBoxSignature: null,
    lastBattleSnapshotSignature: null,
    lastReadAt: null,
    lastError: null,
    selectedFileName: null,
    hasLoadedOnce: false,
    hasWatchFailureAlerted: false
  };

  function setSyncButtonLabel(label) {
    const syncBtn = document.getElementById("sync-master");
    if (!syncBtn) return;
    syncBtn.textContent = label;
  }

  function handleMasterWatchFailure(err) {
    const state = window.masterSheetPollerState;
    const fileName = state.selectedFileName || "Selected file";

    if (!state.hasWatchFailureAlerted) {
      state.hasWatchFailureAlerted = true;
      alert(`${fileName} cannot be watched, please re upload to re enable lua updates`);
    }

    stopMasterFilePolling();
    state.fileHandle = null;
    setSyncButtonLabel("Sync");
  }

  function hasFileSystemAccessApi() {
    return typeof window !== "undefined" && typeof window.showOpenFilePicker === "function";
  }

  function computeSectionSignature(sectionValue) {
    try {
      return JSON.stringify(sectionValue == null ? null : sectionValue);
    } catch (err) {
      return "__SERIALIZE_ERROR__";
    }
  }

  function safeParseMasterJson(rawText) {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Master file JSON root must be an object");
    }
    return parsed;
  }

  function syncBattleLogToLocalStorage(parsedMaster) {
    try {
      const battleLogPayload = parsedMaster && parsedMaster.battlelog ? parsedMaster.battlelog : null;
      localStorage.setItem("battleLog", JSON.stringify(battleLogPayload));
    } catch (err) {
      console.error("[MasterPoller] failed to sync localStorage.battleLog", err);
    }
  }

  function importPartyBoxFromMaster(parsedMaster, reason) {
    try {
      const boxWrapper = parsedMaster && parsedMaster.box ? parsedMaster.box : null;
      const boxData = boxWrapper && boxWrapper.data ? boxWrapper.data : null;
      if (!boxData) {
        return false;
      }

      if (typeof window.loadPokeLuaGen4RawBoxDump !== "function") {
        console.warn("[MasterPoller] Lua box importer is unavailable");
        return false;
      }

      window.loadPokeLuaGen4RawBoxDump(boxData);

      const importBtn = document.getElementById("import");
      if (importBtn && typeof importBtn.click === "function") {
        importBtn.click();
      } else {
        console.warn("[MasterPoller] import button not found after loading Lua box dump");
      }

      console.log("[MasterPoller] imported party/box from master", {
        reason,
        trainerId: parsedMaster?.trainerId
      });
      return true;
    } catch (err) {
      console.error("[MasterPoller] failed to import party/box from master", err);
      return false;
    }
  }

  async function pollMasterFileOnce() {
    const state = window.masterSheetPollerState;

    if (!state.fileHandle) {
      return false;
    }

    if (state.isReadInFlight) {
      return false;
    }

    state.isReadInFlight = true;

    try {
      const file = await state.fileHandle.getFile();
      const rawText = await file.text();
      const parsedMaster = safeParseMasterJson(rawText);
      const previousRawText = state.lastMasterRawText;

      const boxSignature = computeSectionSignature(parsedMaster.box ?? null);
      const battleSnapshotSignature = computeSectionSignature(parsedMaster.battleSnapshot ?? null);
      const isFirstSuccessfulLoad = !state.hasLoadedOnce;

      window.latestPolledMasterSheetData = parsedMaster;
      syncBattleLogToLocalStorage(parsedMaster);
      state.lastMasterRawText = rawText;
      state.lastReadAt = new Date().toISOString();
      state.lastError = null;
      state.selectedFileName = state.selectedFileName || file.name || null;

      if (isFirstSuccessfulLoad) {
        state.lastBoxSignature = boxSignature;
        state.lastBattleSnapshotSignature = battleSnapshotSignature;
        state.hasLoadedOnce = true;
        importPartyBoxFromMaster(parsedMaster, "initial-load");

        console.log("[MasterPoller] initial master loaded", {
          trainerId: parsedMaster?.trainerId,
          file: state.selectedFileName
        });
        return true;
      }

      if (previousRawText !== rawText) {
        console.log("[MasterPoller] master data change detected", {
          trainerId: parsedMaster?.trainerId,
          file: state.selectedFileName
        });
      }

      if (boxSignature !== state.lastBoxSignature) {
        state.lastBoxSignature = boxSignature;
        importPartyBoxFromMaster(parsedMaster, "box-change");
        console.log("[MasterPoller] box changed", parsedMaster.box ?? null);
      }

      if (battleSnapshotSignature !== state.lastBattleSnapshotSignature) {
        state.lastBattleSnapshotSignature = battleSnapshotSignature;
        console.log("[MasterPoller] battleSnapshot changed", parsedMaster.battleSnapshot ?? null);
      }

      return true;
    } catch (err) {
      window.masterSheetPollerState.lastError = err;
      console.error("[MasterPoller] poll failed", err);
      handleMasterWatchFailure(err);
      return false;
    } finally {
      window.masterSheetPollerState.isReadInFlight = false;
    }
  }

  function stopMasterFilePolling() {
    const state = window.masterSheetPollerState;
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    state.isPolling = false;
  }

  function startMasterFilePolling() {
    const state = window.masterSheetPollerState;

    if (!state.fileHandle) {
      console.warn("[MasterPoller] no file selected; call selectAndStartMasterFilePolling() first");
      return false;
    }

    if (state.isPolling && state.timerId) {
      return true;
    }

    state.timerId = setInterval(function () {
      void window.pollMasterFileOnce();
    }, state.pollIntervalMs);

    state.isPolling = true;
    return true;
  }

  async function selectAndStartMasterFilePolling() {
    const state = window.masterSheetPollerState;

    if (!hasFileSystemAccessApi()) {
      console.error("[MasterPoller] File System Access API is unavailable in this browser");
      return false;
    }

    let handles;
    try {
      handles = await window.showOpenFilePicker({
        multiple: false,
        types: [{
          description: "Master JSON Files",
          accept: { "application/json": [".json"] }
        }]
      });
    } catch (err) {
      console.warn("[MasterPoller] file selection cancelled", err);
      return false;
    }

    if (!handles || !handles[0]) {
      console.warn("[MasterPoller] no file handle returned");
      return false;
    }

    state.fileHandle = handles[0];
    state.selectedFileName = handles[0].name || null;
    state.hasWatchFailureAlerted = false;
    state.lastError = null;
    state.hasLoadedOnce = false;
    state.lastMasterRawText = null;
    state.lastBoxSignature = null;
    state.lastBattleSnapshotSignature = null;

    const initialOk = await window.pollMasterFileOnce();
    if (initialOk) {
      setSyncButtonLabel("Synced");
      window.startMasterFilePolling();
    } else {
      setSyncButtonLabel("Sync");
    }
    return initialOk;
  }

  function getCurrentMasterFileHandle() {
    return window.masterSheetPollerState.fileHandle || null;
  }

  function bindMasterSyncButton() {
    function attach() {
      const syncBtn = document.getElementById("sync-master");
      if (!syncBtn || syncBtn.__masterSyncBound) {
        return;
      }
      syncBtn.__masterSyncBound = true;
      syncBtn.addEventListener("click", function () {
        void window.selectAndStartMasterFilePolling();
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attach);
    } else {
      attach();
    }
  }

  window.pollMasterFileOnce = pollMasterFileOnce;
  window.stopMasterFilePolling = stopMasterFilePolling;
  window.startMasterFilePolling = startMasterFilePolling;
  window.selectAndStartMasterFilePolling = selectAndStartMasterFilePolling;
  window.getCurrentMasterFileHandle = getCurrentMasterFileHandle;

  bindMasterSyncButton();
})();
