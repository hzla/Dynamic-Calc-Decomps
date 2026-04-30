
// Default trainer name list
function get_trainer_names() {
    var all_poks = setdex
    var trainer_names = [] 

    if (!all_poks || typeof all_poks !== "object") {
        return trainer_names
    }

    for (const [pok_name, poks] of Object.entries(all_poks)) {
        if (!poks || typeof poks !== "object") {
            continue
        }
        var pok_tr_names = Object.keys(poks)
        for (i in pok_tr_names) {
           var trainer_name = pok_tr_names[i]
           var sub_index = poks[trainer_name]["sub_index"]
           trainer_names.push(`${pok_name} (${trainer_name})[${sub_index}]`) 
        }      
    }
    return trainer_names
}

// Used for making next/prev button function
function get_custom_trainer_names() {
    var all_poks = setdex
    var trainer_names = {} 

    if (!all_poks || typeof all_poks !== "object") {
        return trainer_names
    }

    for (const [pok_name, poks] of Object.entries(all_poks)) {
        if (!poks || typeof poks !== "object") {
            continue
        }
        var pok_tr_names = Object.keys(poks)
        for (i in pok_tr_names) {
           var trainer_name = pok_tr_names[i]
           var sub_index = poks[trainer_name]["sub_index"]

           // If there's a mastersheet
           if (npoint_data["order"]) {
                // If this trainer is listed in the mastersheet
                if (npoint_data["order"][poks[trainer_name]["tr_id"]]) {
                    next = npoint_data["order"][poks[trainer_name]["tr_id"]]["next"]
                    prev = npoint_data["order"][poks[trainer_name]["tr_id"]]["prev"]
                    setdex[pok_name][trainer_name]["next"] = next
                    setdex[pok_name][trainer_name]["prev"] = prev
                }      
           }
           if (sub_index == 0 && !trainer_name.includes("Slot2") && !trainer_name.includes("Slot3") ) {
                trainer_names[poks[trainer_name]["tr_id"] || 0] = `${pok_name} (${trainer_name})[${sub_index}]`
           }     
        }      
    }
    return trainer_names
}

function get_trainer_name(set_name) {
    if (!set_name) {
        return null
    }

    return getTrainerName(set_name)
}

function maybeRenderTeamVariations(tr_id) {
    
    $('#alt-team-bar').hide()

    let altTeamHtml = ""

    if (typeof rivalVariations != "undefined" && rivalVariations[tr_id]){
        if (rivalVariations[tr_id].length == 3) {
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][0] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][0]}">${starters[0]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][1] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][1]}">${starters[1]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][2] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][2]}">${starters[2]}</div>`
        } else if (rivalVariations[tr_id].length == 6) {
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][0] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][0]}">Dawn ${starters[0]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][1] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][1]}">Dawn ${starters[1]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][2] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][2]}">Dawn ${starters[2]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][3] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][3]}">Lucas ${starters[0]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][4] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][4]}">Lucas ${starters[1]}</div>`
            altTeamHtml += `<div class="rival alt-team ${rivalVariations[tr_id][5] == tr_id ? "curr" : ""}" data-next="${rivalVariations[tr_id][5]}">Lucas ${starters[2]}</div>`
        }
        $('#alt-team-bar').html(altTeamHtml).show()
    }

    if (typeof teamVariations != "undefined" && teamVariations[tr_id]){
        console.log(`Alt teams: ${teamVariations[tr_id]}`)

        for (let teamIdx in teamVariations[tr_id]) {
            altTeamHtml += `<div class="alt-team ${teamVariations[tr_id][teamIdx] == tr_id ? "curr" : ""}" data-next="${teamVariations[tr_id][teamIdx]}">Team ${parseInt(teamIdx) + 1}</div>`
        }
        $('#alt-team-bar').html(altTeamHtml).show()
    }
}

function get_partner_name_from_tr_id(tr_id) {
    if (!tr_id || typeof customLeads === "undefined" || !customLeads || !customLeads[tr_id]) {
        return null
    }

    return get_trainer_name(customLeads[tr_id])
}

function get_set_partner_name(set_id) {
    if (!set_id) {
        return null
    }

    var pok_name = set_id.split(" (")[0]
    var tr_name = set_id.split(" (")[1]

    if (!pok_name || !tr_name) {
        return null
    }

    tr_name = tr_name.replace(/\)\[\d+\]$/, "").replace(/\)$/, "")

    if (!setdex[pok_name] || !setdex[pok_name][tr_name]) {
        return null
    }

    return get_partner_name_from_tr_id(setdex[pok_name][tr_name]["partner"])
}

function get_set_split(set_id) {
    if (!set_id) {
        return null
    }

    var pok_name = set_id.split(" (")[0]
    var tr_name = set_id.split(" (")[1]

    if (!pok_name || !tr_name) {
        return null
    }

    tr_name = tr_name.replace(/\)\[\d+\]$/, "").replace(/\)$/, "")

    if (!setdex[pok_name] || !setdex[pok_name][tr_name]) {
        return null
    }

    return setdex[pok_name][tr_name]["split"] || null
}
    

// Gets the trainers list of pokemon
// maybePartner is tr_id of possible partner
function get_trainer_poks(trainer_name, maybePartner=false)
{
    if (typeof TR_NAMES == 'undefined') {
        return []
    }

    var all_poks = setdex
    var matches = []
    function push_match(match) {
        if (!matches.includes(match)) {
            matches.push(match)
        }
    }

    trainer_name = stripTrainerLevelDuplicateMarkers(trainer_name)
    var og_trainer_name = get_trainer_name(trainer_name)

    let og_white_space = " "
    let partner_white_space = " "

    if (og_trainer_name && og_trainer_name.includes(" - ")) {
        og_white_space = ""
    }

    var maybePartnerName = get_partner_name_from_tr_id(maybePartner)
    var selectedSplit = TITLE == "Radical Red 4.1 Normal" ? get_set_split(trainer_name) : null

    var tempPartnerName = maybePartnerName || partnerName

    if (tempPartnerName && tempPartnerName.includes(" - ")) {
        partner_white_space = ""
    }


    for (i in TR_NAMES) {
        if (selectedSplit && get_set_split(TR_NAMES[i]) !== selectedSplit) {
            continue
        }

        if (TR_NAMES[i].includes(og_trainer_name + og_white_space) || ((TR_NAMES[i].includes(tempPartnerName + partner_white_space)))) {
            

            // To avoid cases where grunt1 matches grunt11, we check the last word in the set string to make sure it's  an actual match
            if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
               push_match(TR_NAMES[i])

            }
            if (tempPartnerName) {
                if (tempPartnerName.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (tempPartnerName.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
                   push_match(TR_NAMES[i])
                }  
            }    
        }
    }

    if (matches.length == 0) {
        for (i in TR_NAMES) {
            if (selectedSplit && get_set_split(TR_NAMES[i]) !== selectedSplit) {
                continue
            }

            if (TR_NAMES[i].includes(og_trainer_name)) {
                if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
                   push_match(TR_NAMES[i])
                }    
            }
        }
    }
    return matches
}

// Get the current selected trainer pokemon
function get_current_in() {
    var setInfo = $('.opposing.set-selector').first().val() || $('.opposing .select2-chosen').first().text()
    var pok_name = setInfo.split(" (")[0]
    var tr_name = setInfo.split(" (")[1].replace(")", "").split("[")[0]

    box_rolls()
    return setdex[pok_name][tr_name]
}

function setOpposing(id) {
    var selectedTrainerSet = $('.set-selector .select2-chosen')[1] ? $('.set-selector .select2-chosen')[1].innerHTML : currentTrainerSet
    var setPartnerName = get_set_partner_name(selectedTrainerSet)
    var tempPartnerName = setPartnerName || partnerName

    // if in multi battle mode and user selects pokemon from already set partner, switch partners
    if (!setPartnerName && tempPartnerName && id.includes(tempPartnerName)) {
        partnerName = get_trainer_name(selectedTrainerSet)
        if (partnerName) {
            console.log(`Switching partners: ${partnerName}`)
            localStorage.partnerName = partnerName
        }
    }

    currentTrainerSet = id
    localStorage["right"] = currentTrainerSet

    $('.opposing').val(currentTrainerSet)

    // turn set setting into a function and just call it manually here
    $($('.opposing')[1]).change()
    $('.opposing .select2-chosen').text(currentTrainerSet)
    // if ($('.info-group.opp > * > .forme').is(':visible')) {
    //     $('.info-group.opp > * > .forme').change()
    // }
    if ($('#player-poks-filter:visible').length > 0) {
       box_rolls() 
    } 
}
