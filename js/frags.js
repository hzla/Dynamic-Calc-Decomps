dbName = "Frags"


// Add any new mons to encounters found in custom sets
// Adds frag count of prevos to any new mons found
function importEncounters() {
	// Initialize encounter list if doesn't exist
	if (localStorage.encounters) {
		currentEncounters = JSON.parse(localStorage.encounters)
	} else {
		currentEncounters = {}
	}
	for (const [speciesName, setData] of Object.entries(customSets)) {
		
	  // add to encounters if doesn't exist
	  if (!currentEncounters[speciesName] && setData["My Box"]) {
		// console.log(currentEncounters)s

	  	let encounter = {setData: structuredClone(setData), fragCount: 0, frags: [], prevoFragCount: 0, alive: true, hide: false}

	  		  	
	  	delete encounter.setData["My Box"].moves
	  	delete encounter.setData["My Box"].isCustomSet
	  	delete encounter.setData["My Box"].level

	  	currentEncounters[speciesName] = encounter

	  	let preFrags = prevoData(speciesName, currentEncounters)
	
	  	encounter.prevoFragCount = preFrags[0]


	  	encounter.fragCount = preFrags[0]
	  	encounter.frags = preFrags[1]



	  	if (preFrags[2]) {
	  		encounter.setData["My Box"].met = preFrags[2]
	  	}

	  	if (preFrags[3]) {
	  		encounter.setData["My Box"].nn = preFrags[3]
	  	}	  	
	  } 
	}
	localStorage.encounters = JSON.stringify(currentEncounters)  	
	return currentEncounters
}

function watchLocalStorageProperty(propertyName, callback) {
  window.addEventListener('storage', (event) => {
    // The storage event only fires when localStorage is changed in OTHER tabs/windows
    if (event.key === propertyName) {
      callback({
        key: event.key,
        oldValue: event.oldValue,
        newValue: event.newValue,
        url: event.url
      });
    }
  });
}

function getEncounters() {
	if (localStorage.encounters && localStorage.encounters != "" ) {
		return JSON.parse(localStorage.encounters)
	} else {
		return {}
	}	
}

function resetEncounters() {
	localStorage.encounters = ""
	if (typeof customSets != "undefined") {
		return importEncounters()
	}
	console.log("Encounters cleared")
}

function extractLevel(str) {
    const match = str.match(/Lvl (-?\d+)/);
    return match ? match[1] : null;
}

function addFrag(e) {
	e.preventDefault()
	let speciesName = $('.select2-chosen')[0].innerHTML.split(" (")[0]
	let fragged =  $('.select2-chosen')[5].innerHTML

	const internalLevel = extractLevel(fragged)
	let actualLevel = $('#levelR1').val()

	if (parseInt(actualLevel) <= 0) {
		actualLevel = $('#levelL1').val() || "1"
	}

	fragged = fragged.replace(internalLevel, actualLevel);





	let currentEncounters = JSON.parse(localStorage.encounters)

	if (currentEncounters[speciesName] && currentEncounters[speciesName].frags.indexOf(fragged) == -1 ) {
		currentEncounters[speciesName].fragCount += 1
		currentEncounters[speciesName].frags.push(fragged) 
		localStorage.encounters = JSON.stringify(currentEncounters)

		$('#p2 .frag-text').show()

		$('#frag-count').text(`Frags: ${currentEncounters[speciesName].fragCount}`)

		setTimeout(function() {
			$('#p2 .frag-text').hide()
		},300)

		console.log(`${speciesName} fragged ${fragged}, frag count now at ${currentEncounters[speciesName].fragCount}`)
	} else if (currentEncounters[speciesName].frags.indexOf(fragged) != -1) {
		currentEncounters[speciesName].frags = currentEncounters[speciesName].frags.filter(item => item !== fragged)
		currentEncounters[speciesName].fragCount -= 1
		localStorage.encounters = JSON.stringify(currentEncounters)

		$('#p2 .unfrag-text').show()

		setTimeout(function() {
			$('#p2 .unfrag-text').hide()
		},300)
		$('#frag-count').text(`Frags: ${currentEncounters[speciesName].fragCount}`)

		console.log(`${speciesName} unfragged ${fragged}, frag count now at ${currentEncounters[speciesName].fragCount}`)
	} else {
		alert(`${speciesName} not found in encounter list`)
	}
	return currentEncounters
}

function toggleEncounterStatus(e) {
	e.preventDefault()
	if (!splitData[TITLE]) {
		return
	}
	let speciesName = $('.select2-chosen')[0].innerHTML.split(" (")[0]
	let currentEncounters = JSON.parse(localStorage.encounters)

	currentEncounters[speciesName].alive = !currentEncounters[speciesName].alive
	localStorage.encounters = JSON.stringify(currentEncounters)

	if (currentEncounters[speciesName].alive) {
		$('#p1 .unfrag-text').show()

		setTimeout(function() {
			$('#p1 .unfrag-text').hide()
		},300)
	} else {
		$('#p1 .frag-text').show()

		setTimeout(function() {
			$('#p1 .frag-text').hide()
		},300)
	}

	console.log(`${speciesName} marked as alive: ${currentEncounters[speciesName].alive}`)
}

// Returns [fragCount, frags, met location, nickname]
function prevoData(speciesName, encounters) {
    
    let ancestor = {}

    console.log(speciesName)
	try {
		ancestor = evoData[speciesName]["anc"]
	} catch {
		console.log(speciesName)
		speciesName = speciesName.split("-")[0]
		ancestor = evoData[speciesName]
	}
    

    if (ancestor == speciesName) {
        console.log("Does not evolve")
        return [0, [], false, false]
    }



    let evos = [ancestor].concat(evoData[ancestor]["evos"])

    // Look for later evolutions first
    for (let i = evos.length - 1; i >= 0; i--) {
        mon = evos[i]
        if (encounters[mon] && mon != speciesName) {
            return [encounters[mon].fragCount, encounters[mon].frags, encounters[mon].setData["My Box"].met, encounters[mon].setData["My Box"].nn]
        }
    }

    console.log("prevo data not found")
    return [0, [], false, false]
}

function shouldHidePrevo(speciesName) {
	let evos = []

	try {
		evos = evoData[speciesName]["evos"]
	} catch {
		return false
	}
	

	for (evo of evos) {
		if (evo == speciesName) {
			continue
		} else {
			if (customSets[evo] && !evo.includes("-Mega") && Object.keys(customSets[evo]).length != 0) {
				return true
			}
		}
	}
	return false
}


$(document).ready(function(){

	let url = location.href.replace("index.html", "frags.html")
	if (location.href.includes("Dynamic-Calc-Decomps/?data")){
	  url = url.split("?data").join("frags.html?data");
	}
	$('#fragsheet-link').attr('href', url)

	$(document).on('click', '#p2 .poke-sprite', addFrag)
	if (localStorage.encounters && localStorage.encounters != "") {
		$('#fragsheet-howto').show()
	}
	// $(document).on('contextmenu', '#p1 .poke-sprite', toggleEncounterStatus)

	// $(document).on('click', '#p1 .poke-sprite, #fragsheet-howto', function() {
	// 	let url = location.href.replace("index.html", "frags.html")
	// 	if (location.href.includes("Dynamic-Calc-Decomps/?data")){
	// 	  url = url.split("?data").join("frags.html?data");
	// 	}
	// 	window.open(url, '_blank');
	// })

	watchLocalStorageProperty('customsets', (data) => {
	  console.log("Customsets Updated, refreshing table")

	  customSets = JSON.parse(localStorage.customsets)

	  delete SETDEX_BW[localStorage.toDelete]['My Box']

            // $(`[data-id='${$('.set-selector')[0].value}']`).remove()

	  get_box()
      box_rolls()
	});

})





