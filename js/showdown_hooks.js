// Event bindings for calc ui

function getCurrentOpposingPreviewSetId() {
    return $('.opposing.set-selector').first().val() || $('.opposing .select2-chosen').first().text() || currentTrainerSet || localStorage["right"] || ""
}

function syncOpposingKoButton() {
    var button = $('#opposing-ko-toggle')
    if (!button.length) {
        return
    }

    var setId = getCurrentOpposingPreviewSetId()
    var isFainted = Boolean(setId) && fainted.includes(setId)

    button
        .toggleClass('is-fainted', isFainted)
        .text(isFainted ? "KO'd" : "KO")
        .prop('disabled', !setId)
        .attr('aria-pressed', isFainted ? 'true' : 'false')
        .attr('title', isFainted ? 'Unmark enemy as fainted' : 'Mark enemy as fainted')
}

function toggleTrainerPreviewFaint(setId) {
    var targetSet = setId || getCurrentOpposingPreviewSetId()
    if (!targetSet) {
        syncOpposingKoButton()
        return
    }

    if (fainted.includes(targetSet)) {
        fainted = fainted.filter(function(entry) { return entry !== targetSet })
    } else {
        fainted.push(targetSet)
    }

    refresh_next_in()
    syncOpposingKoButton()
}

var MID_PANEL_LAYOUT_STORAGE_KEY = "midPanelBottomLayout"

function isMidPanelLayoutToggleViewport() {
    return window.innerWidth <= 1439 && window.innerWidth > 960
}

function applyMidPanelLayoutPreference() {
    var shouldMoveToBottom = localStorage.getItem(MID_PANEL_LAYOUT_STORAGE_KEY) == "1"
    $('.panel-wrapper').toggleClass('mid-panel-bottom-layout', shouldMoveToBottom)
    syncMidPanelLayoutToggle()
}

function syncMidPanelLayoutToggle() {
    var button = $('#mid-panel-layout-toggle')
    if (!button.length) {
        return
    }

    var isBottomLayout = $('.panel-wrapper').hasClass('mid-panel-bottom-layout')
    var inViewportRange = isMidPanelLayoutToggleViewport()

    button
        .text(isBottomLayout ? '↑' : '↓')
        .attr('aria-pressed', isBottomLayout ? 'true' : 'false')
        .attr('aria-label', isBottomLayout ? 'Move field panel between side panels' : 'Move field panel below side panels')
        .attr('title', isBottomLayout ? 'Move field panel between side panels' : 'Move field panel below side panels')
        .prop('disabled', !inViewportRange)
}

function toggleMidPanelLayout() {
    var nextIsBottom = !$('.panel-wrapper').hasClass('mid-panel-bottom-layout')
    localStorage.setItem(MID_PANEL_LAYOUT_STORAGE_KEY, nextIsBottom ? "1" : "0")
    applyMidPanelLayoutPreference()
}

$(document).ready(function() {
    function loadLeftSideSet(set) {
        localStorage["left"] = set
        $('.player').val(set)

        let speciesName = extractPokemonName(set)

        if (typeof localStorage.encounters != "undefined") {
            let encounters = getEncounters()

            // get encounter setdata from customSets if empty
            if (customSets[speciesName] && encounters[speciesName] && encounters[speciesName].setData == {}) {
                encounters[speciesName].setData = customSets[speciesName]
            }

            if (encounters[speciesName] && encounters[speciesName].setData && encounters[speciesName].setData["My Box"] && encounters[speciesName].setData["My Box"].met) {
                const met = toTitleCase(encounters[speciesName].setData["My Box"].met)
                const fragCount = encounters[speciesName].fragCount

                $('#met-loc').text(`${met}`).show()
                $('#frag-count').text(`Frags: ${fragCount}`).show()
            } else {
                $('#met-loc, #frag-count').hide()
            }
        } else {
            $('#met-loc, #frag-count').hide()
        }

        $('.player').change()
        $('.set-selector').first().change()
        $('.player .select2-chosen').text(set)

        get_box()
        box_rolls()

        currentLvl = parseInt($('#levelL1').val())
    }

    $(document).on('blur', 'input, select', function() {
        refresh_next_in()
        localStorage.lvlCap = $('#lvl-cap').val()
    })

    // Apply highest damage roll to max HP
    $('.results-right label').on('contextmenu', function(e) {
        e.preventDefault()
        $(this).click()
        let matches = $('#damageValues').text().match(/\d+/g)
        let dmg = parseInt(matches[matches.length - 1])

        let newHP = Math.max(parseInt($('#p1 .max-hp').text()) - dmg, 0)

        $('#p1 .current-hp').val(newHP).change()

    })

    $('#battle-notes .notes-text').blur(function() {
        localStorage.notes = $('#battle-notes .notes-text').html()
    })

    $('[aria-labelledby="resultHeaderL"] label').on('contextmenu', function(e) {
        e.preventDefault()
        $(this).click()
        let matches = $('#damageValues').text().match(/\d+/g)
        let dmg = parseInt(matches[matches.length - 1])

        let newHP = Math.max(parseInt($('#p2 .max-hp').text()) - dmg, 0)

        $('#p2 .current-hp').val(newHP).change()

    })

    $(document).on('change', '.set-selector', function() {
        setTimeout(function() {
            let weather = $('#weather-bar input:checked').first().val().toLowerCase()
            $('.field-info').attr('class', 'field-info')
            $('.field-info').addClass(weather)

        }, 1)  
    })

    $(document).on('click', '#weather-bar input', function() {
        let weather = $('#weather-bar input:checked').first().val().toLowerCase()
        $('.field-info').attr('class', 'field-info')
        $('.field-info').addClass(weather)
    })

    $(document).on('click', '#terrain-bar input', function() {
        let terrain = $('#terrain-bar input:checked').first().val().toLowerCase()
        $('.field-info').attr('class', 'field-info')
        $('.field-info').addClass(terrain)
    })


    $(document).on('change', '.calc-select', function() {
        location.href = $('.calc-select option:selected').attr('data-source')
    })

   $(document).on('click', '.trainer-name', function() {
        var tr_id = parseInt($(this).parent().parent().attr('data-index'))

        currentTrainerSet = customLeads[tr_id].split("[")[0]
        localStorage["right"] = currentTrainerSet

        $('.opposing').val(currentTrainerSet)
        $('.opposing').change()
        $('.opposing .select2-chosen').text(currentTrainerSet)
        if ($('.info-group.opp > * > .forme').is(':visible')) {
            $('.info-group.opp > * > .forme').change()
        }

        $('.wrapper').show()
        $('#content-container').hide()

   })

   $(document).on('change', '.field-info input', function() {
      console.log("expiring results cache")
      resultsCache = new Map();
   })
  
   $(document).on('click', '.opposing .trainer-pok-container', function() {
        
        // start = performance.now();
        if ($(this).hasClass('trainer-pok-container')) {
          let trainerPok = $(this).find('.trainer-pok.right-side')
          if (trainerPok.length > 0) {
            setOpposing(trainerPok.attr('data-id'))
          } 
        } else {
          setOpposing($(this).attr('data-id'))
        } 
   })

   $(document).on('click', '.trainer-pok-item', function() {
        $(this).prev().click()
   })
   
   $(document).on('click', '.nav-tag, .alt-team', function() {
        var set = ""
        const nextIdRaw = $(this).attr('data-next')
        const nextId = parseInt(nextIdRaw, 10)
        const pokemonNullOrderReroutes = {
            5000: "Spewpa (Lvl 11 Root Academy Trainer #1 Slot2 |Root Academy|)",
            5001: "Pidgey (Lvl 12 Root Academy Trainer #1 Slot3 |Root Academy|)",
            5002: "Pineco (Lvl 17 Root Academy Trainer #2 Slot2 |Root Academy|)",
            5003: "Bagon (Lvl 17 Root Academy Trainer #2 Slot3 |Root Academy|)",
            5004: "Karrablast (Lvl 23 Root Academy Trainer #3 Slot2 |Root Academy|)",
            5005: "Chinchou (Lvl 24 Root Academy Trainer #3 Slot3 |Root Academy|)",
            5006: "Farfetch’d-Galar (Lvl 28 Root Academy Trainer #4 Slot2 |Root Academy|)",
            5007: "Ponyta (Lvl 28 Root Academy Trainer #4 Slot3 |Root Academy|)"
        }

        if (TITLE.includes(" Null") && !Number.isNaN(nextId) && pokemonNullOrderReroutes[nextId]) {
            set = pokemonNullOrderReroutes[nextId]
        }
        else if (TITLE.includes("Imperium")) {
            set = nextIdRaw
        }
        else {
            set = customLeads[nextIdRaw].split("[")[0]
        }

        $("#weather-bar label").first().click()

        $('.opposing').val(set) 
        $('.opposing .select2-chosen').text(set)
        $('.opposing').change()
   })

   $(document).on('click', '#show-mid .slider', function() {
        $('.panel-mid').toggle()
        $('.panel:not(.panel-mid)').toggleClass('third')
   })

   $(document).on('click', '#open-menu', function() {
        $('#settings-menu').toggle()
   })

   $(document).on('keyup', '#search-box', filter_box)

   $(document).on('change', '#box-sort-select', function() {
        setBoxSortState($(this).val(), null)
        refreshBoxDisplay()
   })

   $(document).on('click', '#box-sort-direction', function() {
        toggleBoxSortDirection()
        refreshBoxDisplay()
   })

   $(document).on('mouseenter', '.trainer-pok.left-side', maybeShowBoxDamageTooltip)
   $(document).on('mousemove', '.trainer-pok.left-side', function(e) {
        maybeShowBoxDamageTooltip(e)
   })
   $(document).on('mouseleave', '.trainer-pok.left-side', hideBoxDamageTooltip)


   $(document).on('click', '#learnset-show', function(e) {
        get_current_learnset()
        $('#learnset-container').toggle()
         e.stopPropagation();
   })

   $(document).on('click', 'body', function() {
      $('#learnset-container').hide()
   })

   $(document).on('click', '#box-remove', function() {
        var species = $('.set-selector')[0].value.split(" (")[0]
        var sets = JSON.parse(localStorage.customsets)
        if (confirm(`Delete ${species} from imported sets?`)) {
            delete sets[species]['My Box']
            if (sets[species] && Object.keys(sets[species]).length === 0) {
                delete sets[species]
            }
            delete SETDEX_BW[species]['My Box']
            localStorage.customsets = JSON.stringify(sets)
            $(`[data-id='${$('.set-selector')[0].value}']`).closest('.box-sort-card').remove()
        }
   })

   $('body').on('click', function() {
        $("#ai-container").hide()
   })

   $(document).on('click', '#img-toggle', function() {
        let url = window.location.href;    
        if (url.indexOf('?') > -1){
           url += '&backup=true'
        } else {
           url += '?backup=true'
        }
        window.location.href = url;
   })

   $(document).on('change', '#p2 .move-pp', function() {
       let newPP = $(this).val()
       let moveIndex = parseInt($(this).parent().attr('class')[4]) - 1
       movePPs[$('.set-selector')[3].value][moveIndex] = newPP
   })

   function toggleParam(name, value = "1") {
      const url = new URL(window.location.href);

      if (url.searchParams.has(name)) {
        // remove it if it exists
        url.searchParams.delete(name);
      } else {
        // add it if missing
        url.searchParams.set(name, value);
      }

      // navigate (reload) to the new URL
      window.location.href = url.toString();
    }

    $(document).on('contextmenu', '.trainer-pok.right-side', function(e) {
        e.preventDefault()
        toggleTrainerPreviewFaint($(this).attr('data-id'))
    })

    $(document).on('click', '#add-party-pok', function() {
        var currentPok = $('.set-selector')[1].value
        $(`[data-id="${currentPok}"]`).trigger('contextmenu')
    })

    $(document).on('click', '#opposing-ko-toggle', function() {
        toggleTrainerPreviewFaint()
    })

    $(document).on('click', '#mid-panel-layout-toggle', function() {
        if (!isMidPanelLayoutToggleViewport()) {
            return
        }
        toggleMidPanelLayout()
    })

   $(document).on('contextmenu', '.trainer-pok.left-side', function(e) {
        e.preventDefault()
        var parentBox = $(this).parent()


        var data_id = $(this).attr('data-id')
        var species_name = data_id.split(" (")[0]
        var sprite_name = species_name.toLowerCase().replace(" ","-").replace(".","").replace("’","").replace(":","-")
        var set_data = customSets[species_name]["My Box"]


        let pok = generatePartyHTML(set_data, species_name)

        if (!parentBox.hasClass('trainer-pok-container')) {
            destination = $('.player-party')
            $('.player-party').css('display', 'flex')
            $('#clear-party').css('display', 'inline-block')

            if (saveUploaded) {
                $('#edge').css('display', 'inline-block')
            }
            destination.append(pok)

            currentParty.push(species_name)
            currentParty = [...new Set(currentParty)]
            
        } else {
            $(this).parent().remove()

            currentParty = currentParty.filter(item => item !== species_name);

            if ($('.player-party').children().length == 0) {
                $('.player-party').hide()
                $('#clear-party').hide()
                $('#edge').hide()
            }
        }
        localStorage.currentParty = currentParty
   })

   $(document).on('click', '#clear-party', function() {
        $('.player-party').html("")
        $('.player-party').hide()
        $('#clear-party').hide()
        $('#edge').hide()
        currentParty = []
        localStorage.currentParty = ""
        refreshTagPartnerPreview()
   })

   $(document).on('click', '.resultDamage', function() {
       const index = $(this).attr('id').slice(-2)
       $(`#crit${index}`).click()
       $(this).toggleClass('crit-text')
   })

   $(document).on('click', '.cascade-effects input', function() {
        var effect = $(this).attr('id')
        FIELD_EFFECTS = {}
        FIELD_EFFECTS[effect] = true
   })

   function setPartner() {
        if (partnerName) {
            partnerName = null
            
            $('#set-partner').text('Toggle as Partner')
            alert("Partner trainer cleared")
            localStorage.removeItem("partnerName")
            console.log(localStorage.partnerName)
        } else {
            partnerName = getTrainerName($('.set-selector .select2-chosen')[1].innerHTML)
            $('#set-partner').text(`Partner: ${partnerName}`.slice(0,34))

            alert(`${partnerName} set as doubles partner for next trainer selected`)  
            localStorage.partnerName = partnerName
        }
    }

    $(document).on('click', '#set-partner', setPartner)

    function isCalculatorHotkeyContextActive() {
        if (!document.getElementById('main-view-tabs')) {
            return true
        }

        if (typeof window.getCurrentMainPageView === 'function') {
            return window.getCurrentMainPageView() === 'calculator'
        }

        return document.body.classList.contains('main-page-calculator-view')
    }

    $(document).keydown(async function (e) {
        if (!isCalculatorHotkeyContextActive()) {
            return
        }

        if ($('.select2-drop-active:visible').length == 0 && 
            document.activeElement != $('textarea.import-team-text')[0] && 
            $('.pokemon-filter:visible').length === 0 && 
            document.activeElement != $('#battle-notes .notes-text')[0]) {
            

            if ((e.altKey || e.metaKey) && (e.key == "f" || e.key == "ƒ")){ 
                e.preventDefault()
                $('.panel-mid').toggle()
                $('.panel:not(.panel-mid)').toggleClass('third')
            } else if ((e.altKey || e.metaKey) && (e.key == "b" || e.key == "∫") && saveUploaded && (baseGame == "Pt" || baseGame == "HGSS")) {
                e.preventDefault()
                if (confirm("Put full party to sleep?")) {
                    bedtime()
                }
            } else if (e.altKey && e.key == "c" || e.key == "ç") {
                e.preventDefault()
                $("#critR1")[0].checked = !$("#critR1")[0].checked
                $("#critR2")[0].checked = !$("#critR2")[0].checked
                $("#critR3")[0].checked = !$("#critR3")[0].checked
                $("#critR4")[0].checked = !$("#critR4")[0].checked
                $('#resultDamageR1, #resultDamageR2, #resultDamageR3, #resultDamageR4').toggleClass('crit-text')
                $('.move-crit').last().change()
            } else if (e.altKey && e.key == "s" || e.key == "ß") {
                toggleBoxSpriteStyle()
            } else if (e.altKey && e.key == "p" || e.key == "π") {
                setPartner()       
            }
        }
    })

    $(document).keydown(function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 9) {
         if (location.href.includes("mastersheet")) {
            $('.wrapper').toggle();
            $('#content-container').toggle()
         }
         
        }   
    });

   $(document).on('click', '#invert-types', function() {
        let url = window.location.href;    
        if (url.indexOf('?') > -1){
           url += '&invert=true'
        } else {
           url += '?invert=true'
        }
        window.location.href = url;
   })

   $(document).on('click', '#sprite-toggle label', function() {
        toggleBoxSpriteStyle()
   })

    $('.set-selector, .move-selector').on("select2-close", function () {
        setTimeout(function() {
            $('.select2-container-active').removeClass('select2-container-active');
            $(':focus').blur();
        }, 1);
    });

    $('.player.set-selector').on('select2-selecting', function(e) {
        if (!isManualTagPartnerSelectionPending()) {
            return
        }

        var selectedSetId = (e.choice && e.choice.id) || e.val || ""
        clearManualTagPartnerSelectionPending()
        e.preventDefault()

        if (selectedSetId) {
            setManualTagPartnerFromSet(selectedSetId)
        }

        $(this).select2('close')
    })

    $('.player.set-selector').on('select2-close', function() {
        clearManualTagPartnerSelectionPending()
    })

    $('body').on('change', 'select', function(e) {
        if (!e.originalEvent) return;
        if (this.id == 'box-sort-select') return;
        console.log("refreshing team preview")
        refresh_next_in()
    })


   $(document).on('click', '#weather-bar label', function() {
        var weather = $(this).text()
        var sprite = $('#p2 .poke-sprite').attr('src')

        lastClickedWeather = weather

        var cast_regx = /castform-?[a-z]*/i
        var cherr_regx = /cherrim-?[a-z]*/i

        if ($('.opposing .forme:visible').length < 1) {
            return
        }
   
        if (weather == "Rain" && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform-Rainy").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform-rainy"))
        } else if (weather == "Sun" && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform-Sunny").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform-sunny"))
        } else if (weather == "Hail" && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform-Snowy").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform-snowy"))
        } else if (weather == "Sun" && $('.forme').last().val().includes("Cherrim")){
            $('.forme').last().val("Cherrim-Sunshine").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cherr_regx, "cherrim-sunshine"))
        } else if (weather == "None"  && $('.forme').last().val().includes("Cherrim")) {
            $('.forme').last().val("Cherrim").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cherr_regx, "cherrim"))
        } else if (weather == "None"  && $('.forme').last().val().includes("Castform")) {
            $('.forme').last().val("Castform").change()
            $('#p2 .poke-sprite').attr('src', sprite.replace(cast_regx, "castform"))
        }     
   })

    $(document).on('click', '.trainer-pok.left-side', function() {
        loadLeftSideSet($(this).attr('data-id'))
    })

    $(document).on('click', '.tag-partner-preview .tag-partner-pok', function() {
        loadLeftSideSet($(this).attr('data-id'))
    })

    $(document).on('click', '.tag-partner-change', function(e) {
        e.preventDefault()
        beginManualTagPartnerSelection()
    })

    $(document).on('contextmenu', '.tag-partner-preview .tag-partner-pok', function(e) {
        e.preventDefault()
    })

    $(document).on('change', '.opposing.set-selector', function() {
        syncOpposingKoButton()
        if (isDamageBoxSortKey(BOX_SORT_STATE.key) || $('#player-poks-filter:visible').length > 0) {
            refreshBoxDisplay()
        }
    })

    $(document).on('change', '#p1 input, #p1 select, #p2 input, #p2 select, .field-info input, .field-info select', function() {
        if (isDamageBoxSortKey(BOX_SORT_STATE.key) && $('#player-poks-filter:visible').length === 0) {
            get_box()
        }
    })

    $(document).on('blur', '#max-taken, #min-dealt', box_rolls)
    $(document).on('change', '#filter-move', box_rolls)
    $(document).on('change', '#adv-boxrolls', box_rolls)

    $(document).on('click', '#clear-filters', function(){
        $('#max-taken').val("")
        $('#min-dealt').val("")
        box_rolls()
        hideBoxDamageTooltip()
    })

    applyMidPanelLayoutPreference()
    $(window).on('resize.mid-panel-layout-toggle', syncMidPanelLayoutToggle)
    syncOpposingKoButton()
})
