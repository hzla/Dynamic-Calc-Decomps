
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


// Settings toggle
function setSettingsTogglesFromLocalStorage() {
    $('#save-toggle input, #toggle-remember-hp-status input, #toggle-sync-lua input, #save-filter-toggle input, #theme-toggle input, #toggle-boxroll input, #toggle-battle-notes input, #toggle-rand input, #toggle-abil input, #toggle-switch-info input, #toggle-hl-moves input, #toggle-analytics input, #dynamic-type-bug input, #toggle-dex-species-modal input, #toggle-hide-current-ai-mon input').prop('checked', false)

    if (sprite_style == "pokesprite") {
        $('#sprite-toggle input').prop('checked', true)
    }
  if (localStorage.watchSaveFile == "1") {
    $('#save-toggle input').prop('checked', true)
  }
  if (localStorage.rememberHpStatus == "1") {
    $('#toggle-remember-hp-status input').prop('checked', true)
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

    if (localStorage.hideCurrentAiMon == '1') {
        $('#toggle-hide-current-ai-mon input').prop('checked', true)
    }

    applySyncLuaVisibility()
    applyAutoImportMegasVisibility()
    applyHideCurrentAiMonVisibility()
}

function isImperiumTitle() {
    return typeof TITLE === "string" && TITLE.includes("Imperium")
}

function applyImperiumOnlySettingsVisibility() {
    var imperiumOnlySettings = [
        { selector: '#toggle-switch-info', storageKey: 'switchInfo' },
        { selector: '#save-filter-toggle', storageKey: 'filterSaveFile' },
        { selector: '#toggle-abil', storageKey: 'filterAbilities' },
        { selector: '#toggle-rand', storageKey: 'randomized' }
    ]
    var shouldShow = isImperiumTitle()

    imperiumOnlySettings.forEach(function(setting) {
        $(setting.selector).toggle(shouldShow)

        if (!shouldShow) {
            localStorage[setting.storageKey] = 0
            $(setting.selector + ' input').prop('checked', false)
        }
    })

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

function canShowHideCurrentAiMonToggle() {
    return Boolean(settings && !settings.noSwitch && settings.damageGen >= 3 && settings.damageGen <= 8)
}

function applyHideCurrentAiMonVisibility() {
    $('#toggle-hide-current-ai-mon').toggle(canShowHideCurrentAiMonToggle())
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

$('#toggle-hide-current-ai-mon .slider').click(function(){
    localStorage.hideCurrentAiMon = (parseInt(localStorage.hideCurrentAiMon) + 1) % 2
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
