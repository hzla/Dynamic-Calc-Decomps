dbName = "Frags"

function cloneEncounterSetData(setData) {
	if (!setData || typeof setData !== "object") {
		return {}
	}

	if (typeof structuredClone === "function") {
		return structuredClone(setData)
	}

	return JSON.parse(JSON.stringify(setData))
}

function sanitizeEncounterSetData(setData) {
	let sanitizedSetData = cloneEncounterSetData(setData)
	if (!sanitizedSetData["My Box"]) {
		sanitizedSetData["My Box"] = {}
	}

	delete sanitizedSetData["My Box"].moves
	delete sanitizedSetData["My Box"].isCustomSet
	delete sanitizedSetData["My Box"].level

	return sanitizedSetData
}

function getStoredDeadMons() {
	if (!localStorage.deadMons) {
		return []
	}

	try {
		const parsed = JSON.parse(localStorage.deadMons)
		return Array.isArray(parsed) ? parsed : []
	} catch (_error) {
		return []
	}
}

function buildMinimalDeadEncounterSet(deadMon) {
	const speciesName = String(deadMon && deadMon.speciesName || "").trim()
	const met = String(deadMon && deadMon.met || "").trim()
	const nickname = String(deadMon && deadMon.nickname || "").trim()
	return {
		"My Box": {
			nn: nickname,
			met: met,
		}
	}
}

function syncImportedEncounterState(customsetsInput, deadMonsInput) {
	const currentEncounters = getEncounters()
	const nextEncounters = {}
	const customsetsMap = (customsetsInput && typeof customsetsInput === "object") ? customsetsInput : {}
	const deadMons = Array.isArray(deadMonsInput) ? deadMonsInput : getStoredDeadMons()
	const deadSpeciesLookup = {}
	const touchedSpecies = {}

	for (const [speciesName, encounter] of Object.entries(currentEncounters)) {
		nextEncounters[speciesName] = {
			setData: cloneEncounterSetData(encounter && encounter.setData),
			fragCount: typeof encounter.fragCount === "number" ? encounter.fragCount : 0,
			frags: Array.isArray(encounter.frags) ? [...encounter.frags] : [],
			prevoFragCount: typeof encounter.prevoFragCount === "number" ? encounter.prevoFragCount : 0,
			alive: typeof encounter.alive === "boolean" ? encounter.alive : true,
			hide: Boolean(encounter.hide)
		}
	}

	for (const deadMon of deadMons) {
		const speciesName = String(deadMon && deadMon.speciesName || "").trim()
		if (!speciesName) {
			continue
		}
		deadSpeciesLookup[speciesName] = true
	}

	for (const [speciesName, setData] of Object.entries(customsetsMap)) {
		if (!setData || !setData["My Box"]) {
			continue
		}

		const previousEncounter = currentEncounters[speciesName] || {}
		const encounter = {
			setData: sanitizeEncounterSetData(setData),
			fragCount: typeof previousEncounter.fragCount === "number" ? previousEncounter.fragCount : 0,
			frags: Array.isArray(previousEncounter.frags) ? [...previousEncounter.frags] : [],
			prevoFragCount: typeof previousEncounter.prevoFragCount === "number" ? previousEncounter.prevoFragCount : 0,
			alive: !deadSpeciesLookup[speciesName],
			hide: Boolean(previousEncounter.hide)
		}

		nextEncounters[speciesName] = encounter
		touchedSpecies[speciesName] = true
	}

	for (const deadMon of deadMons) {
		const speciesName = String(deadMon && deadMon.speciesName || "").trim()
		if (!speciesName) {
			continue
		}

		if (!nextEncounters[speciesName]) {
			const previousEncounter = currentEncounters[speciesName] || {}
			nextEncounters[speciesName] = {
				setData: buildMinimalDeadEncounterSet(deadMon),
				fragCount: typeof previousEncounter.fragCount === "number" ? previousEncounter.fragCount : 0,
				frags: Array.isArray(previousEncounter.frags) ? [...previousEncounter.frags] : [],
				prevoFragCount: typeof previousEncounter.prevoFragCount === "number" ? previousEncounter.prevoFragCount : 0,
				alive: false,
				hide: Boolean(previousEncounter.hide)
			}
		} else {
			nextEncounters[speciesName].alive = false
			if (deadMon.met) {
				nextEncounters[speciesName].setData["My Box"].met = String(deadMon.met).trim()
			}
			if (deadMon.nickname) {
				nextEncounters[speciesName].setData["My Box"].nn = String(deadMon.nickname).trim()
			}
		}
		touchedSpecies[speciesName] = true
	}

	for (const [speciesName, encounter] of Object.entries(nextEncounters)) {
		if (!touchedSpecies[speciesName]) {
			continue
		}

		let preFrags = [0, [], false, false]
		try {
			preFrags = prevoData(speciesName, nextEncounters) || preFrags
		} catch (_error) {
			preFrags = [0, [], false, false]
		}

		encounter.prevoFragCount = Number(preFrags[0]) || 0
		if (!Array.isArray(encounter.frags)) {
			encounter.frags = []
		}
		encounter.fragCount = encounter.frags.length

		if (!encounter.setData["My Box"].met && preFrags[2]) {
			encounter.setData["My Box"].met = preFrags[2]
		}

		if (!encounter.setData["My Box"].nn && preFrags[3]) {
			encounter.setData["My Box"].nn = preFrags[3]
		}
	}

	localStorage.encounters = JSON.stringify(nextEncounters)
	window.encounters = nextEncounters
	if (typeof encounters !== "undefined") {
		encounters = nextEncounters
	}
	if (typeof window.refreshTables === "function" && window.gridApi) {
		try {
			window.refreshTables()
		} catch (_error) {
		}
	}

	return nextEncounters
}

window.syncImportedEncounterState = syncImportedEncounterState


// Add any new mons to encounters found in custom sets
// Adds frag count of prevos to any new mons found
function importEncounters() {
	return syncImportedEncounterState(customSets, getStoredDeadMons())
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
	if (TITLE != "Pokemon Null" && TITLE != "Platinum Kaizo") {
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
    let resolvedSpeciesName = speciesName
    let evoEntry = evoData[resolvedSpeciesName]

    if (!evoEntry && speciesName.includes("-")) {
        resolvedSpeciesName = speciesName.split("-")[0]
        evoEntry = evoData[resolvedSpeciesName]
    }

    if (!evoEntry) {
        return [0, [], false, false]
    }

    let ancestor = evoEntry["anc"] || resolvedSpeciesName
    let ancestorEntry = evoData[ancestor]

    if (!ancestorEntry && ancestor.includes("-")) {
        ancestor = ancestor.split("-")[0]
        ancestorEntry = evoData[ancestor]
    }

    if (!ancestorEntry) {
        return [0, [], false, false]
    }

    if (ancestor == resolvedSpeciesName) {
        return [0, [], false, false]
    }

    let evos = [ancestor].concat(ancestorEntry["evos"] || [])

    // Look for later evolutions first
    for (let i = evos.length - 1; i >= 0; i--) {
        mon = evos[i]
        if (encounters[mon] && mon != resolvedSpeciesName) {
            return [encounters[mon].fragCount, encounters[mon].frags, encounters[mon].setData["My Box"].met, encounters[mon].setData["My Box"].nn]
        }
    }

    return [0, [], false, false]
}

function shouldHidePrevo(speciesName) {
	if (typeof window.shouldHideImportedPrevo === "function") {
		return window.shouldHideImportedPrevo(speciesName, customSets)
	}

	return false
}


$(document).ready(function(){

	let url = location.href.replace("index.html", "frags.html")
	if (location.href.includes("Dynamic-Calc-Decomps/?data") || location.href.includes("localhost:3001/?data")){
	  url = url.split("?data").join("frags.html?data");
	}
	$('#fragsheet-link').attr('href', url)

	$(document).on('click', '#p2 .poke-sprite', addFrag)
	if (localStorage.encounters && localStorage.encounters != "") {
		$('#fragsheet-howto').show()
	}

	watchLocalStorageProperty('customsets', (data) => {
	  console.log("Customsets Updated, refreshing table")

	  customSets = JSON.parse(localStorage.customsets)

	  delete SETDEX_BW[localStorage.toDelete]['My Box']

            // $(`[data-id='${$('.set-selector')[0].value}']`).remove()

	  get_box()
      box_rolls()
	});

})
