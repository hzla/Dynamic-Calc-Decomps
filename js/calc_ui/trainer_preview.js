
// Default trainer name list
function get_trainer_names() {
    var all_poks = setdex
    var trainer_names = [] 

    for (const [pok_name, poks] of Object.entries(all_poks)) {
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

    for (const [pok_name, poks] of Object.entries(all_poks)) {
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
           if (sub_index == 0) {
                trainer_names[poks[trainer_name]["tr_id"] || 0] = `${pok_name} (${trainer_name})[${sub_index}]`
           }     
        }      
    }
    return trainer_names
}
    

// Gets the trainers list of pokemon
function get_trainer_poks(trainer_name)
{
    if (typeof TR_NAMES == 'undefined') {
        return []
    }

    var all_poks = setdex
    var matches = []

    trainer_name = trainer_name.replace("*", "")
    var og_trainer_name = trainer_name.split(/Lvl [-+]?\d+ /)[1]


    if (og_trainer_name) {
        og_trainer_name = og_trainer_name.replace(/.?\)/, "")
    }

    let og_white_space = " "
    let partner_white_space = " "

    if (og_trainer_name && og_trainer_name.includes(" - ")) {
        og_white_space = ""
    }

    if (partnerName && partnerName.includes(" - ")) {
        partner_white_space = ""
    }

    for (i in TR_NAMES) {

        if (TR_NAMES[i].includes(og_trainer_name + og_white_space) || ((TR_NAMES[i].includes(partnerName + partner_white_space)))) {
            

            // To avoid cases where grunt1 matches grunt11, we check the last word in the set string to make sure it's  an actual match
            if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
               matches.push(TR_NAMES[i])

            }
            if (partnerName) {
                if (partnerName.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (partnerName.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
                   matches.push(TR_NAMES[i])
                }  
            }    
        }
    }

    if (matches.length == 0) {
        for (i in TR_NAMES) {

            if (TR_NAMES[i].includes(og_trainer_name)) {
                if (og_trainer_name.split(" ").at(-1) == TR_NAMES[i].split(" ").at(-2) || (og_trainer_name.split(" ").at(-2) == TR_NAMES[i].split(" ").at(-2))) {
                   matches.push(TR_NAMES[i])
                }    
            }
        }
    }
    return matches
}

// Get the current selected trainer pokemon
function get_current_in() {
    var setInfo = $('.set-selector')[3].value
    var pok_name = setInfo.split(" (")[0]
    var tr_name = setInfo.split(" (")[1].replace(")", "").split("[")[0]

    box_rolls()
    return setdex[pok_name][tr_name]
}

function setOpposing(id) {
    // if in multi battle mode and user selects pokemon from already set partner, switch partners
    if (partnerName && id.includes(partnerName)) {
        partnerName = $('.set-selector .select2-chosen')[1].innerHTML.split(/Lvl [-+]?\d+ /)[1]
        if (partnerName) {
            partnerName = partnerName.replace(/\s?\)/, "").replace(/\s$/, "")
            console.log(`Switching partners: ${partnerName}`)
        }
        localStorage.partnerName = partnerName
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
