// Functions managing UI for right side player box

function sort_box_by_set(attr) {
    var box = $('.player-poks'),
    mons = box.children('.trainer-pok');
 
    mons.sort(function(a,b){
        mon1_id = a.getAttribute('data-id')
        mon1_species = mon1_id.split(" (")[0]
        mon1_data = setdex[mon1_species]["My Box"]

        mon2_id = b.getAttribute('data-id')
        mon2_species = mon2_id.split(" (")[0]
        mon2_data = setdex[mon2_species]["My Box"]

        var an = mon1_data[attr],
            bn = mon2_data[attr];
     
        if(an > bn) {
            return 1;
        }
        if(an < bn) {
            return -1;
        }
        return 0;
    });   
    mons.detach().appendTo(box);
}

function setBoxToLevelCap() {
    const levelCap = parseInt($('#lvl-cap').val());
    if (confirm(`Set Box to level ${levelCap}?`)) {
        for (set in customSets) {
            if (customSets[set]["My Box"]){
                customSets[set]["My Box"].level = levelCap;
                setdex[set]['My Box'].level = levelCap;
            }
        }
        localStorage.customsets = JSON.stringify(customSets);
        updateBoxAnim();
    }
}

$('#lvl-cap').on('contextmenu', function(e) {
    e.preventDefault()
    setBoxToLevelCap()
})

function sort_box_by_dex(attr) {
    var box = $('.player-poks'),
    mons = box.children('.trainer-pok');
 
    mons.sort(function(a,b){
        mon1_id = a.getAttribute('data-id')
        mon1_species = mon1_id.split(" (")[0]
        mon1_data = pokedex[mon1_species]

        mon2_id = b.getAttribute('data-id')
        mon2_species = mon2_id.split(" (")[0]
        mon2_data = pokedex[mon2_species]

        var an = mon1_data[attr],
            bn = mon2_data[attr];
     
        

        if(an > bn) {
            return 1;
        }
        if(an < bn) {
            return -1;
        }
        return 0;
    });   
    mons.detach().appendTo(box);
}

function abv(s, containerSelector = '.player-party') {
    if (!s) {
        return ""
    }

    var container = $(containerSelector)
    var containerWidth = container.width() || container.parent().width() || $('.player-party').width() || $('.trainer-poks').first().width() || 0
    if ((containerWidth / s.length <= 50)) {
        if (s.split(" ")[1]) {
            return (s.split(" ")[0][0] + " " + s.split(" ")[1]).slice(0,13)
        } else {
            return s.slice(0,13)
        }
        
    } else {
        return s
    }
}

function getPreviewSpriteName(species_name) {
    return species_name.toLowerCase().replace(" ","-").replace(".","").replace("’","").replace(":","-")
}

var manualTagPartnerSelectionPending = false
var manualTagPartnerTrainerId = false
var manualTagPartnerLockedTrainerIds = []

function getSelectedTagPartnerSourceSetId() {
    return $('.opposing.set-selector').first().val() || $('.opposing .select2-chosen').first().text() || ""
}

function getSetDataBySetId(setId) {
    if (!setId || !setId.includes(" (")) {
        return null
    }

    var species_name = setId.substring(0, setId.indexOf(" ("))
    var set_name = setId.substring(setId.indexOf("(") + 1, setId.lastIndexOf(")"))
    set_name = set_name.replace(/\)\[\d+\]$/, "").replace(/\[\d+\]$/, "")

    if (!setdex[species_name] || !setdex[species_name][set_name]) {
        return null
    }

    return setdex[species_name][set_name]
}

function getTrainerIdFromSet(setId) {
    var setData = getSetDataBySetId(setId)
    if (!setData || !setData.tr_id) {
        return false
    }

    return Number(setData.tr_id)
}

function getTagPartnerIdFromSet(setId) {
    var set_data = getSetDataBySetId(setId)
    if (!set_data) {
        return false
    }
    return set_data.tagPartner || false
}

function getTrainerSetsById(trainerId) {
    if (!trainerId || !setdex) {
        return []
    }

    var normalizedTrainerId = Number(trainerId)
    var trainerSets = []
    var orderIndex = 0

    for (const [speciesName, sets] of Object.entries(setdex)) {
        for (const [setName, setData] of Object.entries(sets)) {
            if (!setData || Number(setData.tr_id) !== normalizedTrainerId) {
                continue
            }

            trainerSets.push({
                setId: `${speciesName} (${setName})`,
                speciesName: speciesName,
                setData: setData,
                subIndex: Number.isFinite(Number(setData.sub_index)) ? Number(setData.sub_index) : Number.MAX_SAFE_INTEGER,
                orderIndex: orderIndex
            })
            orderIndex++
        }
    }

    trainerSets.sort(function(a, b) {
        if (a.subIndex !== b.subIndex) {
            return a.subIndex - b.subIndex
        }
        return a.orderIndex - b.orderIndex
    })

    return trainerSets
}

function getTagPartnerTrainerName(trainerId) {
    if (typeof customLeads !== "undefined" && customLeads && customLeads[trainerId]) {
        return get_trainer_name(customLeads[trainerId]) || "Tag Partner"
    }

    return "Tag Partner"
}

function setTagPartnerLabel(labelText, titleText) {
    $('.tag-partner-label').text(labelText).attr('title', titleText || labelText)
    $('.tag-partner-header').attr('title', titleText || labelText)
}

function beginManualTagPartnerSelection() {
    manualTagPartnerSelectionPending = true
    $('.player.set-selector').first().select2('open')
}

function clearManualTagPartnerSelectionPending() {
    manualTagPartnerSelectionPending = false
}

function isManualTagPartnerSelectionPending() {
    return manualTagPartnerSelectionPending
}

function clearManualTagPartnerOverride() {
    manualTagPartnerTrainerId = false
    manualTagPartnerLockedTrainerIds = []
}

function getCurrentTrainerPreviewIds() {
    var trainerIds = []

    function pushTrainerId(setId) {
        var trainerId = getTrainerIdFromSet((setId || "").split("[")[0])
        if (trainerId && !trainerIds.includes(trainerId)) {
            trainerIds.push(trainerId)
        }
    }

    if (typeof CURRENT_TRAINER_POKS !== "undefined" && CURRENT_TRAINER_POKS && CURRENT_TRAINER_POKS.length) {
        for (const trainerSet of CURRENT_TRAINER_POKS) {
            pushTrainerId(Array.isArray(trainerSet) ? trainerSet[0] : trainerSet)
        }
    }

    if (!trainerIds.length) {
        pushTrainerId(getSelectedTagPartnerSourceSetId())
    }

    return trainerIds
}

function setManualTagPartnerFromSet(setId) {
    var trainerId = getTrainerIdFromSet(setId)
    if (!trainerId) {
        return false
    }

    manualTagPartnerTrainerId = trainerId
    manualTagPartnerLockedTrainerIds = getCurrentTrainerPreviewIds()
    refreshTagPartnerPreview()
    return true
}

function maybeClearManualTagPartnerOverride(selectedSetId) {
    if (!manualTagPartnerTrainerId || !manualTagPartnerLockedTrainerIds.length) {
        return
    }

    var currentTrainerId = getTrainerIdFromSet(selectedSetId)
    if (!currentTrainerId || manualTagPartnerLockedTrainerIds.includes(currentTrainerId)) {
        return
    }

    clearManualTagPartnerOverride()
}

function sort_box_by_name(aToZ = true, selector = '.player-poks') {
    var box = $(selector),
    mons = box.children('.trainer-pok');
 
    mons.sort(function(a,b){
        mon1_id = a.getAttribute('data-id');
        mon1_species = mon1_id.split(" (")[0];

        mon2_id = b.getAttribute('data-id');
        mon2_species = mon2_id.split(" (")[0];

        if(mon1_species > mon2_species) {
            return aToZ ? 1 : -1;
        }
        if(mon1_species < mon2_species) {
            return aToZ ? -1 : 1;
        }
        return 0;
    });   
    mons.detach().appendTo(box);
}

function isMegaBoxEntry(speciesName) {
    return typeof speciesName === "string" && speciesName.includes("-Mega")
}

function toggleMegaBoxVisibility(hasMegas) {
    $('.player-megas-wrapper').toggle(Boolean(settings && settings.damageGen >= 6 && hasMegas))
}

function buildBoxSpriteHTML(setId, highlights) {
    var pok_name = setId.split(" (")[0].toLowerCase().replace(" ","-").replace(".","").replace(".","").replace("’","").replace(":","-")
    return `<img class="trainer-pok left-side ${sprite_style} ${highlights}" src="./img/${sprite_style}/${pok_name}.png" data-id="${setId}">`
}

function generateCompactPreviewHTML({ setData, speciesName, dataId, interactiveClass = "", containerSelector = ".player-party", showItem = true, showNature = true, showAbility = true }) {
    var sprite_name = getPreviewSpriteName(speciesName)
    var imageClass = interactiveClass ? ` ${interactiveClass}` : ""
    var pok = `<div class="trainer-pok-container">
        <img class="trainer-pok${imageClass}" src="./img/${sprite_style}/${sprite_name}.png" data-id="${dataId}">`

    if (showItem && setData['item']) {
        var item_name = setData['item'].toLowerCase().replace(" ", "_").replace("'", "")
        pok += `<img class="trainer-pok-item" src="./img/items/${item_name}.png">`
    }

    var moves = setData['moves'] || []
    for (var i = 0; i < 4; i++) {
        if (moves[i]) {
            pok += `<div class="bp-info">${abv(moves[i].replace("Hidden Power", "HP"), containerSelector)}</div>`
        } else {
            pok += `<div class="bp-info"> - </div>`
        }
    }

    if (showNature) {
        pok += `<div class="bp-info nature-info">${setData['nature'] || ""}</div>`
    }

    if (showAbility) {
        pok += `<div class="bp-info extra-info">${setData['ability'] || ""}</div>`
    }

    pok += `</div>`
    return pok
}

function generatePartyHTML(set_data, species_name) {
    return generateCompactPreviewHTML({
        setData: set_data,
        speciesName: species_name,
        dataId: species_name + " (My Box)",
        interactiveClass: "left-side",
        containerSelector: ".player-party",
        showItem: true,
        showNature: true,
        showAbility: true
    })
}

function refreshTagPartnerPreview() {
    var wrapper = $('.tag-partner-preview-wrapper')
    var destination = $('.tag-partner-preview')
    var selectedSetId = getSelectedTagPartnerSourceSetId()
    maybeClearManualTagPartnerOverride(selectedSetId)
    var tagPartnerId = manualTagPartnerTrainerId || getTagPartnerIdFromSet(selectedSetId)

    destination.html("")

    if (!tagPartnerId) {
        wrapper.hide()
        setTagPartnerLabel('Tag Partner', 'Tag Partner')
        return
    }

    console.log('[Tag Partner] detected tag partner on right-side set', {
        sourceSetId: selectedSetId,
        tagPartnerId: tagPartnerId,
        selectedSetData: getSetDataBySetId(selectedSetId)
    })

    var trainerSets = getTrainerSetsById(tagPartnerId)
    if (!trainerSets.length) {
        console.warn('[Tag Partner] no sets found for detected tag partner trainer id', {
            sourceSetId: selectedSetId,
            tagPartnerId: tagPartnerId
        })
        wrapper.hide()
        setTagPartnerLabel('Tag Partner', 'Tag Partner')
        return
    }

    var trainerName = getTagPartnerTrainerName(tagPartnerId)
    console.log('[Tag Partner] rendering tag partner preview', {
        sourceSetId: selectedSetId,
        tagPartnerId: tagPartnerId,
        trainerName: trainerName,
        trainerSetIds: trainerSets.map(function(trainerSet) {
            return trainerSet.setId
        })
    })
    setTagPartnerLabel('Tag Partner', `Tag Partner: ${trainerName}`)

    for (const trainerSet of trainerSets) {
        destination.append(generateCompactPreviewHTML({
            setData: trainerSet.setData,
            speciesName: trainerSet.speciesName,
            dataId: trainerSet.setId,
            interactiveClass: "tag-partner-pok",
            containerSelector: ".tag-partner-preview",
            showItem: false,
            showNature: false,
            showAbility: false
        }))
    }

    wrapper.show()
}

function displayParty() {
    var destination = $('.player-party')
    $('.player-party').html("")


    if (currentParty.length > 0) {
        $('.player-party').css('display', 'flex')
        $('#clear-party').css('display', 'inline-block')

        if (saveUploaded) {
            $('#edge').css('display', 'inline-block')
        }

        for (i in currentParty) {


            let pok = ""
            try {
                species_name = currentParty[i]
                if (!setdex[species_name]) {
                    continue;
                }
                var sprite_name = species_name.toLowerCase().replace(" ","-").replace(".","").replace("’","").replace(":","-")
                var set_data = setdex[species_name]["My Box"]
                pok = generatePartyHTML(set_data, species_name)
            } catch {
                $('.player-party').html("")
                $('.player-party').hide()
                $('#clear-party').hide()
                $('#edge').hide()
                break;
            }            
            destination.append(pok)
        }
    }

    refreshTagPartnerPreview()
}


function get_box() {
    var names = get_trainer_names()
    encounters = getEncounters()

    var box = []

    var box_html = ""
    var mega_box_html = ""
    var megaCount = 0

    for (i in names) {
        if (names[i].includes("My Box")) {
            var setId = names[i].split("[")[0]
            var speciesName = setId.split(" (")[0]
            box.push(setId)

            if (encounters && encounters[speciesName] && !encounters[speciesName].alive) {
                continue
            }

            var set_name = setId.trim()
            var highlights = ""

            if (typeof monHighlights != "undefined") {
                if (set_name in monHighlights.defenders) {
                    highlights += ' defender'
                }
                if (set_name in monHighlights.killers) {
                    highlights += ' killer'
                }
                if (set_name in monHighlights.faster) {
                    highlights += ' faster'
                }
                if (set_name in monHighlights.baiters) {
                    highlights += ' baiter'
                }
            }
            var pok = buildBoxSpriteHTML(setId, highlights)

            if (isMegaBoxEntry(speciesName)) {
                mega_box_html += pok
                megaCount += 1
            } else {
                box_html += pok
            }
        }   
    }


    $('.player-poks').html(box_html)
    $('.player-megas').html(mega_box_html)
    sort_box_by_name(true, '.player-poks')
    sort_box_by_name(true, '.player-megas')
    toggleMegaBoxVisibility(megaCount > 0)

    if ($('.player-poks .trainer-pok.left-side, .player-megas .trainer-pok.left-side').length >= 10) {
        $('#search-row').css('display', 'flex')
    }
    filter_box()



    return box
}

function applyHighlights() {

}

function filter_box() {
    let search_string = $('#search-box').val().toLowerCase()
    let containers = $('.trainer-pok-list.player-poks, .trainer-pok-list.player-megas')

    // Hide Prevos
    if (localStorage.hidePrevos == '1' && typeof customSets != 'undefined') {
        containers.find('.trainer-pok.left-side').show()
        for (set in customSets) {
            let set_id = `${set} (My Box)`
            if (typeof window.shouldHideImportedPrevo === "function" && window.shouldHideImportedPrevo(set, customSets)) {
               containers.find(`[data-id='${set_id}']`).hide()
            }
        }
    }

    // Return if search string is too short
    if (search_string.length < 2) {
        containers.find('.trainer-pok.left-side').removeClass('active')
        return
    }

    containers.find('.trainer-pok.left-side').removeClass('active')
    for (set in customSets) {

        // remove megas
        let baseSet = set
        if (set.includes("-Mega")) {
            baseSet = set.replace("-Mega-X", "").replace("-Mega-Y", "").replace("-Mega-D", "").replace("-Mega-O", "").replace("-Mega", "")
        }
        
        let setInfo = JSON.stringify(customSets[set]).toLowerCase()
        let pokedexInfo = JSON.stringify(pokedex[set]).toLowerCase()
            
        let backupDataInfo = ""
        if (backup_data && backup_data.poks && backup_data.poks[set]) {
            backupDataInfo = JSON.stringify(backup_data.poks[set]).toLowerCase()
        }

        let set_id = `${set} (My Box)`

        let learnset = null



        try {
            if (TITLE.includes("Imperium")) {
                 learnset = JSON.stringify(learnsets[baseSet.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()]).toLowerCase()
            }
        } catch {
            
        }        


        const lowerCasePokName = set.toLowerCase()
        if (setInfo.includes(search_string) || lowerCasePokName.includes(search_string) || pokedexInfo.includes(search_string) || backupDataInfo.includes(search_string)) {
            containers.find(`[data-id='${set_id}']`).addClass('active')
        }

        if (learnset) {
            if (learnset.includes(search_string)) {
                containers.find(`[data-id='${set_id}']`).addClass('active')
            }
        }
    }
}

function box_rolls() {
    if (!parseInt(localStorage.boxrolls)) {
        return
    }
    var box = get_box()

    var dealt_min_roll = $("#min-dealt").val()
    var taken_max_roll = $("#max-taken").val()



    if ($("#min-dealt").val() == "") {
        dealt_min_roll=10000000
    } 

    if ($("#max-taken").val() == "") {
        taken_max_roll=-100000
    }

    

    $('.killer').removeClass('killer')
    $('.defender').removeClass('defender')
    $('.faster').removeClass('faster')

    var p1field = createField();
    var p2field = p1field.clone().swap();

    var p1info = $("#p2");
    var p1 = createPokemon(p1info);
    var p1hp = $('#p2').find('#currentHpL1').val()
    var p1speed = parseInt($('.total.totalMod')[1].innerHTML)

    if (p1.ability == "Intimidate") {
        p1.ability = "Honey Gather"
    }

    var killers = []
    var defenders = []
    var faster = []
    for (m = 0; m < box.length; m++) {
        if (p1.level < 1) {
            break;
        }
        var mon = createPokemon(box[m])
        var monSpeed = mon.rawStats.spe

        if (mon.ability == "Intimidate") {
            mon.ability = "Honey Gather"
        }

        if (monSpeed > p1speed) {
            faster.push({"set": box[m]})
            $(`.trainer-pok[data-id='${box[m]}']`).addClass('faster')
        }

        var monHp = mon.originalCurHP
        var selected_move_index = $('#filter-move option:selected').index()


        if (!p1.name) {
            return {"killers": killers, "defenders": defenders, "faster": faster}  
        }
        
        var all_results = calculateAllMoves(settings.damageGen, p1, p1field, mon, p2field, false);

        var opposing_results = all_results[0]
        var player_results = all_results[1]

        var defend_count = 0


 
        for (j = 0; j < 4; j++) {
            player_dmg = player_results[j].damage


            var playerMon = player_results[j].attacker
            var playerMove = player_results[j].move
            
            if (moves[playerMove.name] && moves[playerMove.name].multihit && playerMon.ability == "Skill Link") {
                // pad dmg matrix to max
                while (player_dmg.length < moves[playerMove.name].multihit[moves[playerMove.name].multihit.length - 1]) {
                    player_dmg.push(player_dmg[0])
                }
            }


            if (can_kill(player_dmg, p1hp * dealt_min_roll / 100)) {
                killers.push({"set": box[m], "move": player_results[j].move.originalName})
                $(`.trainer-pok[data-id='${box[m]}']`).addClass('killer')
            }

            opposing_dmg = opposing_results[j].damage

            var opposingMon = opposing_results[j].attacker
            var opposingMove = opposing_results[j].move

            // assume ai always gets max hits
            if (moves[opposingMove.name] && moves[opposingMove.name].multihit) {
                // pad dmg matrix to max
                while (opposing_dmg.length < moves[opposingMove.name].multihit[moves[opposingMove.name].multihit.length - 1]) {
                    opposing_dmg.push(opposing_dmg[0])
                }
            }



            if (!can_topkill(opposing_dmg, monHp * taken_max_roll / 100) && (selected_move_index == 0 || j == selected_move_index - 1)) {
                defend_count += 1
                if (defend_count == 4 || selected_move_index > 0) {
                    defenders.push({"set": box[m], "move": opposing_results[j].move.originalName})
                    $(`.trainer-pok[data-id='${box[m]}']`).addClass('defender')
                }         
            }
        }
    }
    return {"killers": killers, "defenders": defenders, "faster": faster}  
}



// check if ai mon has >= 50% chance kills player
function can_kill(damages, hp) {
    damages = normalize_damage(damages)
    kill_count = 0
    for (n in damages) {
        if (damages[n] >= hp) {
            kill_count += 1
        }
    }
    return (kill_count >= 16)
}

// check if ai mon highest roll kills player
function can_topkill(damages, hp) {
    if (hp < 0) return true;
    kill_count = 0
    damages = normalize_damage(damages)

    for (n in damages) {
        if (damages[n] > hp) {
            kill_count += 1
        }
    }
    return (kill_count > 0)
}

function getTurnsToKill(damages, hp) {
    if (hp < 0) return 1;

    damages = normalize_damage(damages)

    return Math.ceil(hp / damages[damages.length - 1])
}

function normalize_damage(damages) {
    if (!Array.isArray(damages)) {
        return []
    }
    if (!Array.isArray(damages[0])) {
        return damages
    }
    var summed = []
    for (var i = 0; i < damages[0].length; i++) {
        summed[i] = 0
        for (var hit = 0; hit < damages.length; hit++) {
            summed[i] += damages[hit][i] || 0
        }
    }
    return summed
}

function sortTms () {
      let rows = $(".tms .ls-row").get();

      rows.sort(function (a, b) {
        let aText = $(a).find(".ls-level").text();
        let bText = $(b).find(".ls-level").text();

        // Extract type (TM/HM) and number
        let aMatch = aText.match(/(TM|HM)(\d+)/);
        let bMatch = bText.match(/(TM|HM)(\d+)/);

        if (!aMatch || !bMatch) return 0;

        let aType = aMatch[1];
        let bType = bMatch[1];
        let aNum = parseInt(aMatch[2], 10);
        let bNum = parseInt(bMatch[2], 10);

        // Sort by type: TM first, then HM
        if (aType !== bType) {
          return aType === "TM" ? -1 : 1;
        }

        // Sort by number
        return aNum - bNum;
      });

      // Append in sorted order
      $(".tms").append(rows);
    }

function get_current_learnset() {
    var pok_name = createPokemon($("#p1")).name
    if (pok_name.includes("-Mega")) {
        pok_name = pok_name.split("-Mega")[0]
    } else if (pok_name.includes("-Primal")) {
         pok_name = pok_name.split("-Primal")[0]
    }
    if (pok_name.includes("Ogerpon")) {
        pok_name = "Ogerpon"
    }

    if (pok_name.includes("Maushold")) {
        pok_name = "Maushold"
    }

    console.log(pok_name)
    pok_name = pok_name.replaceAll("é", "é")
    current_learnset = em_imp_primary_mons[pok_name]
    
    if (!current_learnset || !TITLE.includes("1.3")) {
        // $("#learnset-show").hide()
        return
    } else {
        $("#learnset-show").show()
    }

    current_learnset = current_learnset["learnset_info"]

    var ls_html = ""

    for (let i = 0; i < current_learnset["learnset"].length; i++) {
        var lvl = current_learnset["learnset"][i][0]
        var mv_name = current_learnset["learnset"][i][1]
        ls_html += `<div class='ls-row'><div class='ls-level'>${lvl}</div><div class='ls-name'>${mv_name}</div></div>`
    }
    $(".lvl-up-moves").html(ls_html)

    var tm_html = ""

    if (current_learnset["tms"]) {
        for (let i = 0; i < current_learnset["tms"].length; i++) {
            var mv_name = current_learnset["tms"][i]

            let tm_index = ""
            if (tms["tms"][mv_name]) {
                tm_index = `TM${tms["tms"][mv_name]}`
            } else if (tms["hms"][mv_name]) {
                tm_index = `HM${tms["hms"][mv_name]}`
            }

            let isLegal = (localStorage.legalTms && localStorage.legalTms.includes(mv_name)) || typeof localStorage.legalTms == 'undefined'

            tm_html += `<div class='ls-row ${isLegal ? '' : 'illegal'}'><div class='ls-level'>${tm_index}</div><div class='ls-name'>${mv_name}</div></div>`
        }
    }    
    $(".tms").html(tm_html)
    sortTms()

    var egg_html = ""

    var eggData = []
    if (evoData[pok_name] && evoData[pok_name].anc && em_imp_primary_mons[evoData[pok_name].anc]["learnset_info"]["egg"]) {
        eggData = em_imp_primary_mons[evoData[pok_name].anc]["learnset_info"]["egg"]
    }
    
    for (let i = 0; i < eggData.length; i++) {
        var mv_name = eggData[i]
        egg_html += `<div class='ls-row'><div class='ls-name'>${mv_name}</div></div>`
    }

    $(".egg").html(egg_html)

    let evo_html = ""
    if (em_imp_primary_mons[pok_name] && em_imp_primary_mons[pok_name]["evos"]) {
        let evos = em_imp_primary_mons[pok_name]["evos"]

    
        for (evo of evos) {
            let method = formatString(evo.method)
            let parameter = formatString(evo.parameter)
            let target = formatString(evo.target)
            
            evo_html += `<div class='ls-row'><div class='ls-level'>${method}: ${parameter}</div><div class='ls-name'>${target}</div></div>`
        }
        $(".evos").html(evo_html)   
    }
    return current_learnset    
}
