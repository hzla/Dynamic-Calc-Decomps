function importSheet() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // Handle file selection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    // Parse JSON content and set encounters variable
                    encounters = JSON.parse(e.target.result);
                    localStorage.encounters = JSON.stringify(encounters)                    
                    
                    location.reload()

                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    alert('Invalid fragsheet file. Please select a valid fragsheet file.');
                }
            };
            
            reader.onerror = function() {
                console.error('Error reading file');
                alert('Error reading file. Please try again.');
            };
            
            // Read file as text
            reader.readAsText(file);
        }
    });
    
    // Trigger file selector
    fileInput.click();
}

function exportSheet(obj, filename = 'data.json') {
  // Convert object to JSON string with pretty formatting
  const jsonString = JSON.stringify(encounters, null, 2);
  
  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${TITLE} Fragsheet.json`.replace(" ", "_");
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetSheet() {
    if (confirm("Are you sure you want to wipe all encounter and frag data? Remember to download a backup of your fragsheet if you would like to save your data.")) {
        localStorage.encounters = ""
        location.reload()
    }
}

function cloneEncounterSetData(setData) {
    if (!setData || typeof setData !== "object") {
        return {}
    }

    if (typeof structuredClone === "function") {
        return structuredClone(setData)
    }

    return JSON.parse(JSON.stringify(setData))
}

function getCurrentBoxSetsForReload() {
    if (typeof customSets === "object" && customSets) {
        return customSets
    }

    try {
        return JSON.parse(localStorage.customsets || "{}")
    } catch (_error) {
        return {}
    }
}

function rebuildFragsheetFromCurrentBox() {
    const currentBoxSets = getCurrentBoxSetsForReload()
    const rebuiltEncounters = {}

    for (const [speciesName, setData] of Object.entries(currentBoxSets)) {
        if (!setData || !setData["My Box"]) {
            continue
        }

        const encounter = {
            setData: cloneEncounterSetData(setData),
            fragCount: 0,
            frags: [],
            prevoFragCount: 0,
            alive: true,
            hide: false
        }

        delete encounter.setData["My Box"].moves
        delete encounter.setData["My Box"].isCustomSet
        delete encounter.setData["My Box"].level

        rebuiltEncounters[speciesName] = encounter

        let preFrags = [0, [], false, false]
        if (typeof window.prevoData === "function") {
            try {
                preFrags = window.prevoData(speciesName, rebuiltEncounters) || preFrags
            } catch (_error) {
                preFrags = [0, [], false, false]
            }
        }

        encounter.prevoFragCount = Number(preFrags[0]) || 0
        encounter.fragCount = encounter.prevoFragCount
        encounter.frags = Array.isArray(preFrags[1]) ? [...preFrags[1]] : []

        if (preFrags[2]) {
            encounter.setData["My Box"].met = preFrags[2]
        }

        if (preFrags[3]) {
            encounter.setData["My Box"].nn = preFrags[3]
        }
    }

    localStorage.encounters = JSON.stringify(rebuiltEncounters)
    window.encounters = rebuiltEncounters
    if (typeof encounters !== "undefined") {
        encounters = rebuiltEncounters
    }

    return rebuiltEncounters
}

function reloadFragsheetFromBoxAndBattleLog() {
    if (!confirm("Reload the fragsheet from your current box and then reapply frag counts from the battle log? This will clear current fragsheet encounter and frag data first.")) {
        return
    }

    rebuildFragsheetFromCurrentBox()

    if (typeof window.refreshTables === "function" && window.gridApi) {
        window.refreshTables()
    }

    if (typeof window.renderBattleLogView === "function") {
        window.renderBattleLogView(true)
    } else if (typeof window.refreshTables === "function" && window.gridApi) {
        window.refreshTables()
    }
}

let fragsheetControlsInitialized = false;

function ensureFragsheetControlsInitialized() {
    if (fragsheetControlsInitialized) {
        return true;
    }

    if (!document.getElementById('import-sheet') || !document.getElementById('export-sheet') || !document.getElementById('reset-sheet') || !document.getElementById('reload-box-battlelog')) {
        return false;
    }

    $('input').on('cellValueChanged', function(e) {
      console.log(e)
    })

    $('#import-sheet').off('click', importSheet).on('click', importSheet);
    $('#export-sheet').off('click', exportSheet).on('click', exportSheet);
    $('#reload-box-battlelog').off('click', reloadFragsheetFromBoxAndBattleLog).on('click', reloadFragsheetFromBoxAndBattleLog);
    $('#reset-sheet').off('click', resetSheet).on('click', resetSheet);
    fragsheetControlsInitialized = true;
    return true;
}

window.ensureFragsheetControlsInitialized = ensureFragsheetControlsInitialized;
window.reloadFragsheetFromBoxAndBattleLog = reloadFragsheetFromBoxAndBattleLog;

document.addEventListener('DOMContentLoaded', ensureFragsheetControlsInitialized);
