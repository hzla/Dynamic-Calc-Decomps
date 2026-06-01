
function setSettingsDefaults() {

  saveUploaded = false
  boxSprites = ["pokesprite", "pokesprite"]
  themes = ["old", "new"]
  trueHP = true
  fainted = []
  lastSetName = ""
  lastAiTrainerName = ""
  consecutiveSetChangesOnAiTrainer = 0;
  lastPartyData = {}
  lastSentSnapshot = {}
  customSets = {}
  disableKOChanceCalcs = false
  start = 0
  pokChanges = {}
  calcing = false

  // local storage settings defaults
  if (typeof localStorage.partnerName === 'undefined') {
     partnerName = null 
  } else {
    partnerName = localStorage.partnerName
  }

  if (typeof localStorage.currentParty == "undefined" || localStorage.currentParty == "") {
    currentParty = []
  } else {
    currentParty = localStorage.currentParty.split(",")
  }

  if (typeof localStorage.boxspriteindex === 'undefined') {
    localStorage.boxspriteindex = 1
  }

  if (typeof localStorage.enableAnalytics === 'undefined') {
    localStorage.enableAnalytics = 1
  }

  if (typeof localStorage.showAdditionalFieldOptions === 'undefined') {
    localStorage.showAdditionalFieldOptions = 0
  }

  if (typeof localStorage.highlightMoves === 'undefined') {
    localStorage.highlightMoves = 0
  }

  if (typeof localStorage.switchInfo === 'undefined') {
    localStorage.switchInfo = 0
  }

  if (typeof localStorage.switchPreview === 'undefined') {
    localStorage.switchPreview = 0
  }

  if (typeof localStorage.switchAiInfo === 'undefined') {
    localStorage.switchAiInfo = 0
  }

  if (typeof localStorage.showTrainerPreviewExpBars === 'undefined') {
    localStorage.showTrainerPreviewExpBars = 1
  }

  if (typeof localStorage.hidePrevos === 'undefined') {
    localStorage.hidePrevos = 1
  }

  if (typeof localStorage.watchSaveFile === 'undefined') {
    localStorage.watchSaveFile = 0
  }

  if (typeof localStorage.rememberHpStatus === 'undefined') {
    localStorage.rememberHpStatus = 0
  }

  if (typeof localStorage.syncLua === 'undefined') {
    localStorage.syncLua = 0
  }

  if (typeof localStorage.randomized === 'undefined') {
    localStorage.randomized = 0
  }

  if (typeof localStorage.filterSaveFile === 'undefined') {
    localStorage.filterSaveFile = 0
  }

  if (typeof localStorage.filterAbilities === 'undefined') {
    localStorage.filterAbilities = 1
  }

  if (typeof localStorage.autoImportMegas === 'undefined') {
    localStorage.autoImportMegas = 1
  }

  if (typeof localStorage.importPartyPreview === 'undefined') {
    localStorage.importPartyPreview = 1
  }

  if (typeof localStorage.calcHasEvs === 'undefined') {
    localStorage.calcHasEvs = settings && settings.hasEvs ? 1 : 0
  }

  if (typeof localStorage.physSpecSplit === 'undefined') {
    localStorage.physSpecSplit = settings && settings.physSpecSplit ? 1 : 0
  }

  if (typeof localStorage.invertTypes === 'undefined') {
    localStorage.invertTypes = settings && settings.invertTypes ? 1 : 0
  }

  if (typeof localStorage.platinumReduxTypeChart === 'undefined') {
    localStorage.platinumReduxTypeChart = 1
  }
  var devBlankConfig = typeof window.getCurrentDevBlankConfig === "function" ? window.getCurrentDevBlankConfig() : null
  if (devBlankConfig && Object.prototype.hasOwnProperty.call(devBlankConfig, "platinumReduxTypeChart")) {
    localStorage.platinumReduxTypeChart = devBlankConfig.platinumReduxTypeChart ? '1' : '0'
  }

  if (typeof localStorage.dynamicTypeBug === 'undefined') {
    localStorage.dynamicTypeBug = 1
  }

  if (typeof localStorage.themeIndex === 'undefined') {
    localStorage.themeIndex = 1
  }

  if (typeof localStorage.dexSpeciesModalMode === 'undefined') {
    localStorage.dexSpeciesModalMode = 0
  }

  if (typeof localStorage.hideCurrentAiMon === 'undefined') {
    localStorage.hideCurrentAiMon = 1
  }

  if (typeof localStorage.showAbilitySlot === 'undefined') {
    localStorage.showAbilitySlot = 0
  }

  if (typeof settings !== 'undefined' && settings) {
    settings.hasEvs = localStorage.calcHasEvs == '1'
    settings.physSpecSplit = localStorage.physSpecSplit == '1'
    settings.invertTypes = localStorage.invertTypes == '1'
  }
  if (typeof localStorage.lvlCap != 'undefined') {
    $('#lvl-cap').val(localStorage.lvlCap)
  }
  localStorage.toDelete = ""

  if (parseInt(localStorage.themeIndex) == 0) {
    $('body, html').addClass('old')
  }
  sprite_style = boxSprites[parseInt(localStorage.boxspriteindex)]
  
  if (!parseInt(localStorage.boxrolls)) {
    localStorage.boxrolls = 0
  } else {
    $('#player-poks-filter').show()
  }

  if (parseInt(localStorage.showAdditionalFieldOptions)) {
    $('#additional-field-options').show()
    $('#toggle-additional-field-options').text(`Show ${['More', 'Less'][parseInt(localStorage.showAdditionalFieldOptions)]}`)
  }



  // if first time
  if (typeof localStorage.battlenotes === 'undefined') {
    localStorage.battlenotes = '1'
  } else if (localStorage.battlenotes == '0'){
    $('.poke-import').first().hide()
  } 

  if (localStorage.states && isValidJSON(localStorage.states)) {
    states = JSON.parse(localStorage.states)
  } else {
    states = {}
  }

  calcing = false
  changingSets = false

  if (localStorage.notes) {
    $('#battle-notes .notes-text').html(localStorage.notes);
  }

  applyImperiumOnlySettingsVisibility()
  setSettingsTogglesFromLocalStorage()
}

function shouldImportPartyPreview() {
  return localStorage.importPartyPreview != '0'
}

function getMoveAiPreviewStorageKey(title) {
    return "calcMoveAiPreview:" + (title || "NONE")
}

function getMoveAiPreviewSettingEnabled() {
    if (typeof MoveAiPreviewSettings !== "undefined" && MoveAiPreviewSettings.getEnabled) {
        return MoveAiPreviewSettings.getEnabled()
    }
    var title = typeof TITLE === "string" ? TITLE : "NONE"
    return localStorage.getItem(getMoveAiPreviewStorageKey(title)) === "1"
}

function setMoveAiPreviewSettingEnabled(enabled) {
    if (typeof MoveAiPreviewSettings !== "undefined" && MoveAiPreviewSettings.setEnabled) {
        return MoveAiPreviewSettings.setEnabled(enabled)
    }
    var title = typeof TITLE === "string" ? TITLE : "NONE"
    localStorage.setItem(getMoveAiPreviewStorageKey(title), enabled ? "1" : "0")
    return enabled
}

// Settings toggle
function setSettingsTogglesFromLocalStorage() {
    $('#save-toggle input, #toggle-remember-hp-status input, #toggle-use-evs input, #toggle-phys-spec-split input, #toggle-invert-types input, #toggle-platinum-redux-type-chart input, #toggle-challenge-mode input, #toggle-import-party-preview input, #toggle-sync-lua input, #save-filter-toggle input, #theme-toggle input, #toggle-mobile-dual-panel input, #toggle-mobile-party-moves input, #toggle-mobile-move-ui input, #toggle-boxroll input, #toggle-battle-notes input, #toggle-rand input, #toggle-abil input, #toggle-switch-info input, #toggle-switch-preview input, #toggle-switch-ai-info input, #toggle-move-ai-preview input, #toggle-exp-bars input, #toggle-hl-moves input, #toggle-analytics input, #dynamic-type-bug input, #toggle-dex-species-modal input, #toggle-show-ability-slot input, #toggle-hide-current-ai-mon input').prop('checked', false)

    if (sprite_style == "pokesprite") {
        $('#sprite-toggle input').prop('checked', true)
    }
  if (localStorage.watchSaveFile == "1") {
    $('#save-toggle input').prop('checked', true)
  }
  if (localStorage.rememberHpStatus == "1") {
    $('#toggle-remember-hp-status input').prop('checked', true)
  }
  if (typeof settings !== 'undefined' && settings && settings.hasEvs) {
    $('#toggle-use-evs input').prop('checked', true)
  }
  if (typeof settings !== 'undefined' && settings && settings.physSpecSplit) {
    $('#toggle-phys-spec-split input').prop('checked', true)
  }
  if (typeof settings !== 'undefined' && settings && settings.invertTypes) {
    $('#toggle-invert-types input').prop('checked', true)
  }
  if (localStorage.platinumReduxTypeChart != '0') {
    $('#toggle-platinum-redux-type-chart input').prop('checked', true)
  }
  if (typeof settings !== 'undefined' && settings && settings.challengeMode) {
    $('#toggle-challenge-mode input').prop('checked', true)
  }
  if (shouldImportPartyPreview()) {
    $('#toggle-import-party-preview input').prop('checked', true)
  }
  if (localStorage.syncLua == "1") {
    $('#toggle-sync-lua input').prop('checked', true)
  }
    if (localStorage.filterSaveFile == "1") {
        $('#save-filter-toggle input').prop('checked', true)
    }
    if (localStorage.themeIndex == '1') {
        $('#theme-toggle input').prop('checked', true)
    }
    var savedMobileDualPanelLayout = localStorage.getItem('mobileDualPanelLayout')
    if (savedMobileDualPanelLayout == '1' || (savedMobileDualPanelLayout === null && window.innerWidth <= 960)) {
        $('#toggle-mobile-dual-panel input').prop('checked', true)
    }
    if (localStorage.mobileShowPartyMoves == '1') {
        $('#toggle-mobile-party-moves input').prop('checked', true)
    }
    if (shouldShowMobileMoveUi()) {
        $('#toggle-mobile-move-ui input').prop('checked', true)
    }
    if (localStorage.boxrolls == '1') {
        $('#toggle-boxroll input').prop('checked', true)
    }
    if (localStorage.battlenotes == '1') {
        $('#toggle-battle-notes input').prop('checked', true)
    }

    if (localStorage.randomized == '1') {
        $('#toggle-rand input').prop('checked', true)
    }

    if (localStorage.filterAbilities == '1') {
        $('#toggle-abil input').prop('checked', true)
    }

    if (localStorage.switchInfo == '1') {
        $('#toggle-switch-info input').prop('checked', true)
        $('#dynamic-type-bug').css('display', 'flex')
    } else {
        $('#dynamic-type-bug').hide()
    }
    if (localStorage.switchPreview == '1') {
        $('#toggle-switch-preview input').prop('checked', true)
    }
    if (localStorage.switchAiInfo == '1') {
        $('#toggle-switch-ai-info input').prop('checked', true)
    }
    if (getMoveAiPreviewSettingEnabled()) {
        $('#toggle-move-ai-preview input').prop('checked', true)
    }
    if (localStorage.showTrainerPreviewExpBars == '1') {
        $('#toggle-exp-bars input').prop('checked', true)
    }
    if (localStorage.highlightMoves == '1') {
        $('#toggle-hl-moves input').prop('checked', true)
    }
    syncAutoImportMegaToggles()
    if (localStorage.enableAnalytics == '1') {
        $('#toggle-analytics input').prop('checked', true)
    }

    if (localStorage.dynamicTypeBug == '1') {
        $('#dynamic-type-bug input').prop('checked', true)
    }

    if (localStorage.dexSpeciesModalMode == '1') {
        $('#toggle-dex-species-modal input').prop('checked', true)
    }

    if (localStorage.showAbilitySlot == '1') {
        $('#toggle-show-ability-slot input').prop('checked', true)
    }

    if (localStorage.hideCurrentAiMon == '1') {
        $('#toggle-hide-current-ai-mon input').prop('checked', true)
    }

    applySyncLuaVisibility()
    applyAutoImportMegasVisibility()
    applySwitchPreviewVisibility()
    applySwitchAiInfoVisibility()
    applyMoveAiPreviewVisibility()
    if (typeof MoveAiPreviewSettings !== "undefined" && MoveAiPreviewSettings.syncToggle) {
        MoveAiPreviewSettings.syncToggle()
    }
    applyPhysSpecSplitVisibility()
    applyInvertTypesVisibility()
    applyPlatinumReduxTypeChartVisibility()
    applyChallengeModeVisibility()
    applyTrainerPreviewExpBarVisibility()
    applyHideCurrentAiMonVisibility()
    applyMobilePartyMovesPreference()
    applyMobileMoveUiPreference()
}

function isImperiumTitle() {
    return typeof TITLE === "string" && TITLE.includes("Imperium")
}

function canShowRandomizedToggleForTitle() {
    return typeof TITLE === "string" && (
        TITLE.includes("Imperium") ||
        TITLE.includes("Radical Red")
    )
}

function applyImperiumOnlySettingsVisibility() {
    var imperiumOnlySettings = [
        { selector: '#toggle-switch-info', storageKey: 'switchInfo' },
        { selector: '#save-filter-toggle', storageKey: 'filterSaveFile' },
        { selector: '#toggle-abil', storageKey: 'filterAbilities' }
    ]
    var shouldShow = isImperiumTitle()

    imperiumOnlySettings.forEach(function(setting) {
        $(setting.selector).toggle(shouldShow)

        if (!shouldShow) {
            localStorage[setting.storageKey] = 0
            $(setting.selector + ' input').prop('checked', false)
        }
    })

    var shouldShowRandomizedToggle = canShowRandomizedToggleForTitle()
    $('#toggle-rand').toggle(shouldShowRandomizedToggle)
    if (!shouldShowRandomizedToggle) {
        localStorage.randomized = 0
        $('#toggle-rand input').prop('checked', false)
    }

    if (!shouldShow) {
        $('#dynamic-type-bug').hide()
    }
}

function toggleBoxSpriteStyle() {
    var oldStyle = boxSprites[parseInt(localStorage.boxspriteindex)]
    localStorage.boxspriteindex = (parseInt(localStorage.boxspriteindex) + 1) % 2
    sprite_style = boxSprites[parseInt(localStorage.boxspriteindex)]

    $('.player-poks').removeClass(oldStyle)
    $('.player-poks').addClass(sprite_style)

    $('.trainer-pok').each(function() {
        $(this).removeClass(oldStyle)
        var newURL = $(this).attr('src').replace(oldStyle, sprite_style)
        $(this).attr('src', newURL)
    })
}

function toggleThemes() {
    var oldStyle = themes[parseInt(localStorage.themeIndex)]
    localStorage.themeIndex = (parseInt(localStorage.themeIndex) + 1) % 2
    themeStyle = themes[parseInt(localStorage.themeIndex)]

    $('html, body').removeClass(oldStyle)
    $('html, body').addClass(themeStyle)
}

function toggle_box_rolls() {
    localStorage.boxrolls = (parseInt(localStorage.boxrolls) + 1) % 2
}

function toggle_dynamic_type_bug() {
    localStorage.dynamicTypeBug = (parseInt(localStorage.dynamicTypeBug) + 1) % 2
    location.reload()     
}

function toggleHasEvs() {
    localStorage.calcHasEvs = (parseInt(localStorage.calcHasEvs, 10) + 1) % 2
    if (typeof settings !== 'undefined' && settings) {
        settings.hasEvs = localStorage.calcHasEvs == '1'
    }
    location.reload()
}

function togglePhysSpecSplit() {
    if (!canShowPhysSpecSplitToggle()) {
        $('#toggle-phys-spec-split').hide()
        return
    }
    var nextValue = localStorage.physSpecSplit != '1'
    if (typeof setPhysSpecSplitEnabled === "function") {
        setPhysSpecSplitEnabled(nextValue)
    } else {
        localStorage.physSpecSplit = nextValue ? '1' : '0'
        if (typeof settings !== 'undefined' && settings) {
            settings.physSpecSplit = nextValue
        }
    }
    location.reload()
}

function toggleInvertTypes() {
    var nextValue = localStorage.invertTypes != '1'
    if (typeof setInvertTypesEnabled === "function") {
        setInvertTypesEnabled(nextValue)
    } else {
        localStorage.invertTypes = nextValue ? '1' : '0'
        if (typeof settings !== 'undefined' && settings) {
            settings.invertTypes = nextValue
        }
    }
    location.reload()
}

function toggle_analytics() {
    localStorage.enableAnalytics = (parseInt(localStorage.enableAnalytics) + 1) % 2   
}

function toggle_additional_field_options() {
    localStorage.showAdditionalFieldOptions = (parseInt(localStorage.showAdditionalFieldOptions) + 1) % 2   
}

function applySyncLuaVisibility() {
    var syncEnabled = localStorage.syncLua == '1';
    var usesHttpLuaSync = typeof TITLE === "string" && (
        TITLE.includes("Imperium") ||
        TITLE.includes(" Null") ||
        TITLE.includes("Platinum")
    );

    $('#sync-master').toggle(syncEnabled && !usesHttpLuaSync);
    $('#sync-lua').toggle(syncEnabled && usesHttpLuaSync);

    if (typeof updateHeaderShellState === "function") {
        updateHeaderShellState();
    }
}

function applyAutoImportMegasVisibility() {
    var isVisible = Boolean(settings && settings.damageGen >= 6)
    $('#toggle-auto-import-megas').toggle(isVisible)
    $('#toggle-auto-import-megas-inline').toggle(isVisible)
}

function canShowSwitchPreviewToggle() {
    return Boolean(settings && settings.damageGen >= 3 && settings.damageGen <= 8)
}

function applySwitchPreviewVisibility() {
    $('#toggle-switch-preview').toggle(canShowSwitchPreviewToggle())
}

function canShowSwitchAiInfoToggle() {
    if (typeof canUseSwitchAiInfoForTitle === "function") {
        return canUseSwitchAiInfoForTitle()
    }
    return Boolean(settings && settings.damageGen === 4)
}

function applySwitchAiInfoVisibility() {
    $('#toggle-switch-ai-info').toggle(canShowSwitchAiInfoToggle())
}

function canShowMoveAiPreviewToggle() {
    return Boolean(typeof TITLE === "string" && TITLE !== "Platinum Kaizo" && settings && settings.damageGen === 4)
}

function applyMoveAiPreviewVisibility() {
    var isVisible = canShowMoveAiPreviewToggle()
    $('#toggle-move-ai-preview').toggle(isVisible)
    if (!isVisible) {
        $('#toggle-move-ai-preview input').prop('checked', false)
        if (typeof TITLE === "string" && TITLE === "Platinum Kaizo") {
            setMoveAiPreviewSettingEnabled(false)
        }
    }
}

function canShowPhysSpecSplitToggle() {
    return Boolean(settings && settings.damageGen === 3)
}

function applyPhysSpecSplitVisibility() {
    $('#toggle-phys-spec-split').toggle(canShowPhysSpecSplitToggle())
}

function canShowInvertTypesToggle() {
    if (typeof canUseInvertTypesSetting === "function") {
        return canUseInvertTypesSetting()
    }
    return Boolean(settings && settings.damageGen >= 3 && settings.damageGen <= 8)
}

function applyInvertTypesVisibility() {
    var isVisible = canShowInvertTypesToggle()
    $('#toggle-invert-types').toggle(isVisible)
    if (!isVisible) {
        $('#toggle-invert-types input').prop('checked', false)
    }
}

function canShowPlatinumReduxTypeChartToggle() {
    if (typeof isPlatinumReduxTitle === "function") {
        return isPlatinumReduxTitle()
    }
    return typeof TITLE === "string" && TITLE.includes("Platinum Redux")
}

function applyPlatinumReduxTypeChartVisibility() {
    var isVisible = canShowPlatinumReduxTypeChartToggle()
    $('#toggle-platinum-redux-type-chart').toggle(isVisible)
    if (!isVisible) {
        $('#toggle-platinum-redux-type-chart input').prop('checked', false)
    }
}

function togglePlatinumReduxTypeChart() {
    localStorage.platinumReduxTypeChart = localStorage.platinumReduxTypeChart == '0' ? '1' : '0'
    location.reload()
}

function canShowChallengeModeToggle() {
    if (typeof canUseChallengeModeSetting === "function") {
        return canUseChallengeModeSetting()
    }
    return Boolean(settings && settings.damageGen === 5)
}

function applyChallengeModeVisibility() {
    var isVisible = canShowChallengeModeToggle()
    $('#toggle-challenge-mode').toggle(isVisible)
    if (!isVisible) {
        $('#toggle-challenge-mode input').prop('checked', false)
    }
}

function toggleChallengeMode() {
    var nextValue = !(settings && settings.challengeMode)
    if (typeof setChallengeModeEnabled === "function") {
        setChallengeModeEnabled(nextValue)
    } else if (typeof settings !== "undefined" && settings) {
        settings.challengeMode = nextValue
    }
    $('#toggle-challenge-mode input').prop('checked', nextValue)
    if (typeof performCalculations === "function") {
        performCalculations()
    }
}

function canShowTrainerPreviewExpBarToggle() {
    return Boolean(settings && settings.damageGen >= 3 && settings.damageGen <= 5)
}

function applyTrainerPreviewExpBarVisibility() {
    $('#toggle-exp-bars').toggle(canShowTrainerPreviewExpBarToggle())
}

function shouldShowTrainerPreviewExpBars() {
    return localStorage.showTrainerPreviewExpBars == '1'
}

function canShowHideCurrentAiMonToggle() {
    return Boolean(settings && !settings.noSwitch && settings.damageGen >= 3 && settings.damageGen <= 8)
}

function applyHideCurrentAiMonVisibility() {
    $('#toggle-hide-current-ai-mon').toggle(canShowHideCurrentAiMonToggle())
}

function shouldShowMobilePartyMoves() {
    return localStorage.mobileShowPartyMoves == '1'
}

function applyMobilePartyMovesPreference() {
    $('body').toggleClass('mobile-show-party-moves', shouldShowMobilePartyMoves())
}

function shouldShowMobileMoveUi() {
    return localStorage.mobileShowMoveUi !== '0'
}

function applyMobileMoveUiPreference() {
    $('body').toggleClass('mobile-hide-move-ui', !shouldShowMobileMoveUi())
}

function syncAutoImportMegaToggles() {
    var enabled = localStorage.autoImportMegas == '1'
    $('#toggle-auto-import-megas input').prop('checked', enabled)
    $('#toggle-auto-import-megas-inline input').prop('checked', enabled)
}

function toggleAutoImportMegas() {
    localStorage.autoImportMegas = (parseInt(localStorage.autoImportMegas) + 1) % 2
    location.reload()
}


// Settings Event Bindings

$('#theme-toggle .slider').click(toggleThemes)
$('#dynamic-type-bug .slider').click(toggle_dynamic_type_bug)

$('#toggle-analytics .slider').click(toggle_analytics)

$('#toggle-mobile-dual-panel input').on('change', function(){
    localStorage.mobileDualPanelLayout = $(this).prop('checked') ? '1' : '0'
    if (typeof applyMobileDualPanelPreference === "function") {
        applyMobileDualPanelPreference()
    }
})

$('#toggle-mobile-party-moves input').on('change', function(){
    localStorage.mobileShowPartyMoves = $(this).prop('checked') ? '1' : '0'
    applyMobilePartyMovesPreference()
})

$('#toggle-mobile-move-ui input').on('change', function(){
    localStorage.mobileShowMoveUi = $(this).prop('checked') ? '1' : '0'
    applyMobileMoveUiPreference()
})

$('#toggle-boxroll .slider').click(function(){
    toggle_box_rolls()
    $('#player-poks-filter').toggle()
    if ($('#player-poks-filter:visible').length > 0) {
        box_rolls()
    } else {
        $('.faster, .killer, .defender').removeClass('faster killer defender')
    }
})

$('#toggle-battle-notes .slider').click(function(){
    localStorage.battlenotes = (parseInt(localStorage.battlenotes) + 1) % 2   
    $('.poke-import').first().toggle()
})

$('#toggle-hl-moves .slider').click(function(){
    localStorage.highlightMoves = (parseInt(localStorage.highlightMoves) + 1) % 2   
})

$('#toggle-dex-species-modal .slider').click(function(){
    localStorage.dexSpeciesModalMode = (parseInt(localStorage.dexSpeciesModalMode) + 1) % 2
})

$('#toggle-show-ability-slot .slider').click(function(){
    localStorage.showAbilitySlot = (parseInt(localStorage.showAbilitySlot) + 1) % 2
    if (typeof refreshAbilitySlotDisplays === 'function') {
        refreshAbilitySlotDisplays()
    }
})

$('#toggle-hide-current-ai-mon .slider').click(function(){
    localStorage.hideCurrentAiMon = (parseInt(localStorage.hideCurrentAiMon) + 1) % 2
    refresh_next_in()
})

$('#toggle-switch-preview .slider').click(function(){
    var nextValue = localStorage.switchPreview != '1'
    if (typeof setSwitchPreviewEnabled === "function") {
        setSwitchPreviewEnabled(nextValue)
    } else {
        localStorage.switchPreview = nextValue ? '1' : '0'
    }
    location.reload()
})

$('#toggle-switch-ai-info .slider').click(function(){
    var nextValue = localStorage.switchAiInfo != '1'
    if (typeof setSwitchAiInfoEnabled === "function") {
        setSwitchAiInfoEnabled(nextValue)
    } else {
        localStorage.switchAiInfo = nextValue ? '1' : '0'
    }
    refresh_next_in()
})

$('#toggle-move-ai-preview input').on('change', function(){
    if (!canShowMoveAiPreviewToggle()) {
        $('#toggle-move-ai-preview input').prop('checked', false)
        if (typeof TITLE === "string" && TITLE === "Platinum Kaizo") {
            setMoveAiPreviewSettingEnabled(false)
        }
        return
    }
    var isEnabled = setMoveAiPreviewSettingEnabled($(this).prop('checked'))
    $('#toggle-move-ai-preview input').prop('checked', isEnabled)
    if (typeof PlatinumMoveAiPreviewUI !== "undefined" && PlatinumMoveAiPreviewUI.refresh) {
        PlatinumMoveAiPreviewUI.refresh()
    }
})

$('#toggle-exp-bars .slider').click(function(){
    localStorage.showTrainerPreviewExpBars = (parseInt(localStorage.showTrainerPreviewExpBars, 10) + 1) % 2
    refresh_next_in()
})

$('#toggle-auto-import-megas .slider').click(toggleAutoImportMegas)
$('#toggle-auto-import-megas-inline .slider').click(toggleAutoImportMegas)

$('#toggle-additional-field-options').click(function(){
    localStorage.showAdditionalFieldOptions = (parseInt(localStorage.showAdditionalFieldOptions) + 1) % 2   
    $('#additional-field-options').toggle()
    $(this).text(`Show ${['More', 'Less'][parseInt(localStorage.showAdditionalFieldOptions)]}`)
})

$('#toggle-rand .slider').click(function(){
    localStorage.randomized = (parseInt(localStorage.randomized) + 1) % 2
    location.reload()   
})

$('#save-toggle .slider').click(function(){
    localStorage.watchSaveFile = (parseInt(localStorage.watchSaveFile) + 1) % 2;
    location.reload()   
})

$('#toggle-remember-hp-status .slider').click(function(){
    localStorage.rememberHpStatus = (parseInt(localStorage.rememberHpStatus) + 1) % 2;
    if (localStorage.rememberHpStatus == "0" && typeof resetAllPlayerCustomSetStatusesToHealthy === "function") {
        resetAllPlayerCustomSetStatusesToHealthy({
            syncActiveUi: true
        });
    }
})

$('#toggle-use-evs .slider').click(toggleHasEvs)
$('#toggle-phys-spec-split .slider').click(togglePhysSpecSplit)
$('#toggle-invert-types .slider').click(toggleInvertTypes)
$('#toggle-platinum-redux-type-chart .slider').click(togglePlatinumReduxTypeChart)
$('#toggle-challenge-mode .slider').click(toggleChallengeMode)

$('#toggle-import-party-preview .slider').click(function(){
    localStorage.importPartyPreview = (parseInt(localStorage.importPartyPreview, 10) + 1) % 2
})

$('#toggle-sync-lua .slider').click(function(){
    localStorage.syncLua = (parseInt(localStorage.syncLua) + 1) % 2;
    applySyncLuaVisibility()
})

$('#toggle-switch-info .slider').click(function(){
    localStorage.switchInfo = (parseInt(localStorage.switchInfo) + 1) % 2;   
    location.reload()
})

$('#toggle-abil .slider').click(function(){
    localStorage.filterAbilities = (parseInt(localStorage.filterAbilities) + 1) % 2;
    location.reload()   
})

$('#save-filter-toggle .slider').click(function(){
    localStorage.filterSaveFile = (parseInt(localStorage.filterSaveFile) + 1) % 2;
    location.reload()   
})
