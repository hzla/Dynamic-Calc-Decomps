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
    hasLoadedOnce: false
  };

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

      const boxSignature = computeSectionSignature(parsedMaster.box ?? null);
      const battleSnapshotSignature = computeSectionSignature(parsedMaster.battleSnapshot ?? null);
      const isFirstSuccessfulLoad = !state.hasLoadedOnce;

      window.latestPolledMasterSheetData = parsedMaster;
      state.lastMasterRawText = rawText;
      state.lastReadAt = new Date().toISOString();
      state.lastError = null;
      state.selectedFileName = state.selectedFileName || file.name || null;

      if (isFirstSuccessfulLoad) {
        state.lastBoxSignature = boxSignature;
        state.lastBattleSnapshotSignature = battleSnapshotSignature;
        state.hasLoadedOnce = true;

        console.log("[MasterPoller] initial master loaded", {
          trainerId: parsedMaster?.trainerId,
          file: state.selectedFileName
        });
        return true;
      }

      if (boxSignature !== state.lastBoxSignature) {
        state.lastBoxSignature = boxSignature;
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

    const initialOk = await window.pollMasterFileOnce();
    window.startMasterFilePolling();
    return initialOk;
  }

  function getCurrentMasterFileHandle() {
    return window.masterSheetPollerState.fileHandle || null;
  }

  window.pollMasterFileOnce = pollMasterFileOnce;
  window.stopMasterFilePolling = stopMasterFilePolling;
  window.startMasterFilePolling = startMasterFilePolling;
  window.selectAndStartMasterFilePolling = selectAndStartMasterFilePolling;
  window.getCurrentMasterFileHandle = getCurrentMasterFileHandle;
})();
