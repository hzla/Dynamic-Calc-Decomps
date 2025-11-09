

if (TITLE.includes("Imperium")) {
    let fileHandle = null;
    let lastContents = null;
    let file = null

    let isRandom = localStorage.randomized == '1'


    $('#read-save').click(function(){
        $('#save-upload')[0].value = null
    })



    if ('showOpenFilePicker' in window && localStorage.watchSaveFile == '1') {
        saveOpenSelector = 'read-save'
        saveOpenEvent = 'click' 
    } else {
        saveOpenSelector = 'save-upload'
        saveOpenEvent = 'change' 
    }

    document.getElementById(saveOpenSelector).addEventListener(saveOpenEvent, function(event) {
        (async () => {

            // Try to get a persistent handle via File System Access API (if supported)
            if ('showOpenFilePicker' in window && localStorage.watchSaveFile == '1') {
               
               try {
                    [fileHandle] = await window.showOpenFilePicker({
                        types: [{
                            description: 'Save Files',
                            accept: { 'application/octet-stream': ['.sav','.ss1','.ss2','.ss3','.ss4','.ss5','.ss6','.ss7','.ss8','.ss9'] }
                        }]
                    });
                } catch (err) {
                    console.warn("User cancelled file handle selection, falling back to input-only mode.");
                    fileHandle = null;
                }
                file = await fileHandle.getFile();
            } else {
                file = event.target.files[0];
            }

            if (file) {
                const reader = new FileReader();
                saveFileName = $('#save-upload').val().split("\\").pop()
                savExt = saveFileName.slice(-3)

                if (saveFileName == '') {
                    saveFileName = fileHandle.name
                }

                savExt = saveFileName.slice(-3)


                reader.onload = function(e) {
                    console.log("reloading new save file")
                    // Convert the binary string to ArrayBuffer for easier access
                    let buffer = e.target.result;
                    // view = new Uint8Array(buffer);

                    if (savExt.includes("ss")) {

                        // decompress compressed mgba save state
                        if (buffer.byteLength < 100000) {
                          buffer = extractSaveState(buffer)  
                        }
                 
                        buffer = new Uint8Array(buffer.slice(205168, 397312).slice(0, 157477)).buffer.slice(
                            buffer.byteOffset,
                            buffer.byteOffset + buffer.byteLength
                        );

                    }


                    saveFile = new DataView(buffer);

                    saveUploaded = true;


                    let lvlCap = $('#lvl-cap').val()  || 1

                    const now = new Date();
                    const timeString = now.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    });

                    changelog = "<h4>Changelog:</h4>"
                    changelog += `<p>${saveFileName} loaded at ${timeString}</p>`
                    if ($('#changelog').length == 0) {
                       $('#clearSets').after("<p id='changelog'></p>") 
                    }
                    $('#changelog').html(changelog).show()
                    

                    save_index_a_offset = 0xffc
                    save_block_b_offset = 0x00E000
                    trainer_id_offset = 0xa
                    save_index_b_offset = save_block_b_offset + save_index_a_offset

                    const save_index_a = saveFile.getUint16(save_index_a_offset, true)
                    const save_index_b = saveFile.getUint16(save_index_b_offset, true)
                    var block_offset = 0


                    if (save_index_b > save_index_a || save_index_a == 65535) {
                         block_offset = save_block_b_offset
                    }

                    var save_index = Math.max(save_index_a, save_index_b)
                    // console.log(save_index_a)
                    // console.log(save_index_b)
                    // if (save_index_b == 65535) {save_index = save_index_a }
                    // if (save_index_a == 65535) { save_index = save_index_b }

                    let rotation = save_index % 14


                    // console.log(`save_index: ${save_index}, rotation: ${rotation}`)
                    let retries = 0
                    if (!savExt.includes("ss")) {
                        localStorage.legalTms = ''
                        getTms(saveFile, 0)
                    }
                    


                    let offset = 0;
                    const magicValue = 0x0202;

                    let pokCount = 0


                    let lastFoundAt = 0

                    let showdownText = ""

                    saveFile 

                    while (offset < saveFile.byteLength - 1) { 
                        const value = saveFile.getUint16(offset, true); 
                        
                        if (value === magicValue) {
                            lastFoundAt = offset

                            // move back 18 bytes and get PID, TID, and custom nature info
                            offset -= 18
                            let pid = saveFile.getUint32(offset, true)
                            offset += 4
                            let tid = saveFile.getUint32(offset, true)
                            offset += 4


                            let nn = ""

                            for (let i = 0; i <10; i++) {
                                let letter = gen3TextTable[saveFile.getUint8(offset + i, true)] || ""
                                nn += letter
                            }


                            // let moddedNature = (saveFile.getUint16(offset, true) >> 13) && 0b11111

                            // substructs are scrambled according to PID
                            let suborder = orderFormats[pid % 24]
                           

                            let key = pid ^ tid
                            let decrypted = []


                            offset = lastFoundAt + 14


                            invalidData = false
                            // decrypt substructs
                            for (let i = 0; i <= 11; i++) {
                                let block = null
                                try {
                                   block = saveFile.getUint32(offset , true) ^ key 
                                } catch {
                                    invalidData = true
                                    block = []
                                    break;
                                }
                                
                                decrypted.push(block)
                                offset += 4
                            }

                            if (invalidData) {
                                offset = lastFoundAt + 2
                                continue
                            }

                            let growth_index = suborder.indexOf(1)
                            let moves_index = suborder.indexOf(2)
                            let evs_index = suborder.indexOf(3)
                            let misc_index = suborder.indexOf(4)


                            // get Species
                            let speciesId = [decrypted[growth_index * 3]] & 0x07FF
                            // for Inclement Emerald
                            if (TITLE.includes("Inclement") && speciesId > 899) {
                                speciesId += 7
                            }
                            let speciesName = emImpMons[speciesId]


                            



                            // Skip if species id out of bounds
                            if (!speciesName || speciesName == "None") {
                                offset = lastFoundAt + 2
                                continue
                            }


                            // console.log(`${speciesName}: ${tid}`)


                            // Try Substitute Spaces for Dashes if pokemon name doesn't exist

                            if (!pokedex[speciesName]) {
               
                                speciesName = speciesName.replaceAll(" ", "-")
                            }

                            // get Item
                            let itemId = [decrypted[growth_index * 3]] >> 16 & 0x07FF

                            // skip if invalid item
                            if (itemId >= emImpItems.length) {
                                offset = lastFoundAt + 2
                                continue
                            }


                            // get Level
                            let speciesNameId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
                            let exp = [decrypted[growth_index * 3 + 1]] & 0x1FFFFF
                            let gr = 0

                            // todo consolidate files
                            if (em_imp_primary_mons[speciesName] && em_imp_primary_mons[speciesName]["gr"]) {
                                gr =  em_imp_primary_mons[speciesName]["gr"]
                            } else {
                                if (typeof learnsets[speciesNameId] == "undefined") {
                                    speciesName = speciesName.split("-").slice(0,2).join("-")
                                    speciesNameId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
                                } 

                                if (typeof learnsets[speciesNameId] == "undefined") {
                                    speciesName = speciesName.split("-")[0]
                                    speciesNameId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
                                } 


                                if (typeof learnsets[speciesNameId] == "undefined") {
                                    console.log(`can't find growth for ${speciesName}`)
                                } else {
                                    gr = learnsets[speciesNameId].gr 
                                }
                            }
                            
                        

                            
                            if (typeof gr == "unefined") {
                               console.log(learnsets[speciesNameId])
                               console.log(`${speciesNameId} growth not found`)
                               gr = 0 
                            }

                            let level;
                            try {
                                level = get_level(expTables[gr], exp)
                            } catch {
                                offset = lastFoundAt + 2
                                continue
                            }

                   


                            let nn11 = gen3TextTable[decrypted[growth_index * 3 + 1] >> 21 & 0xFF] || ""
                            let nn12 = gen3TextTable[decrypted[growth_index * 3 + 2] >> 14 & 0xFF] || ""

                            nn += nn11
                            nn += nn12

                            met = locations["EM"][decrypted[misc_index * 3] >> 8 & 0xFF] 



                            // console.log(nn)
                            
                            // get nature
                            let monNature = 0
                            if (TITLE.includes("Inclement")) {
                                let natureByte = [decrypted[misc_index * 3]] >> 16 & 0x07FF
                                monNature = natures[natureByte & 31744 >> 10]   
                            } else {
                                monNature = natures[pid % 25]
                                // if (moddedNature <= 26) {
                                //     monNature = natures[moddedNature]
                                // }
                            }

                            // get evs
                            let int1 = decrypted[evs_index * 3]
                            let int2 = decrypted[evs_index * 3 + 1]

                            let evs = []

                            evs[0] = (int1 & 0xFF)
                            evs[1] = ((int1 >> 8) & 0xFF)
                            evs[2] = ((int1 >> 16) & 0xFF)
                            evs[3]= ((int1 >> 24) & 0xFF)
                            evs[4] = (int2 & 0xFF)
                            evs[5] = ((int2 >> 8) & 0xFF)

                            // skip if pokemon has evs and evs are turned off
                            if (evs[0] +  evs[1] +  evs[2] +  evs[3] +  evs[4] +  evs[5] > 0 && !hasEvs) {
                                offset = lastFoundAt + 2
                                continue
                            }

                            // get moves
                            let move1 = pokeemeraldMoves[[decrypted[moves_index * 3]] & 0x07FF]
                            let move2 = pokeemeraldMoves[[decrypted[moves_index * 3]] >> 16 & 0x07FF]
                            let move3 = pokeemeraldMoves[[decrypted[moves_index * 3 + 1]] & 0x07FF]
                            let move4 = pokeemeraldMoves[[decrypted[moves_index * 3 + 1]] >> 16 & 0x07FF]

                            let moves = [move1, move2, move3, move4]
                            let illegalMoveFound = false



                            if (move1 == "None") {
                                illegalMoveFound = true
                            }

                            
                            // filter for legal moves

                            try {
                                if (localStorage.filterSaveFile == '1' && localStorage.randomized != '1') {
                                    let legalMoves = getFamilyLegalMoves(speciesName)
                                    for (move of moves) {

                                        if (!move) {
                                            illegalMoveFound = true
                                            continue
                                        }

                                        if (legalMoves.indexOf(move.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()) == -1 && move != "None" && !move.includes("Hidden Power") && !move.includes("Return")) {
                                            console.log(`Ilegal move found on ${speciesName}: ${move}`)
                                            illegalMoveFound = true
                                        }
                                    }
                                }
                            } catch {
                                console.log(`Unable to filter illegal moves for ${speciesName}`)
                            }
                            

                            // skip if any moves out of bounds or duplicates moves that aren't "None"
                            if (hasInvalidMoves(moves) || illegalMoveFound) {
                                offset = lastFoundAt + 2
                                continue
                            }

                            // get ivs 
                            let ivs = getIVs(decrypted[misc_index * 3 + 1])

                            // get ability

                            let abilitySlot = 0

                            if (TITLE.includes("Inclement")) {
                                abilitySlot = decrypted[misc_index * 3 + 2] & 96 >> 5
                            } else {
                                abilitySlot = decrypted[misc_index * 3 + 2] >> 29 & 0b11
                                
                                // todo: get final ability list
                                if (abilsPrimary[speciesName]) {
                                    abilitySlot = abilsPrimary[speciesName][abilitySlot]
                                }
                                else if (abils[speciesName]) {
                                    abilitySlot = abils[speciesName][abilitySlot]
                                } else {
                                    console.log(`${speciesName} no ability found`)
                                }          
                            }

                            if (localStorage.randomized == '1') {

                                try {
                                    let slotIndex = decrypted[misc_index * 3 + 2] >> 29 & 0b11

                                    // console.log(`${speciesName}: Ability Slot: ${slotIndex}, abilities: ${abilsPrimary[speciesName]}`)

                                    if (abilsPrimary[speciesName][slotIndex] == "None") {
                                        slotIndex = 0
                                        // console.log(`Setting ability slot to 0`)
                                    } 
                                    abilitySlot = sav_abilities[randomizeAbility(speciesId, slotIndex, tid)]

                                    // console.log(`running randomizeAbility(${speciesId}, ${slotIndex}, ${tid}): returns ${randomizeAbility(speciesId, slotIndex, tid)}, ${sav_abilities[randomizeAbility(speciesId, slotIndex, tid)]}`)


                                    

                                } catch {
                                    abilitySlot = "None"
                                }                  
                            }


                            



                            if (nn.toLowerCase() != speciesName.toLowerCase() && !(speciesName.toLowerCase().includes(nn.toLowerCase().trim()))) {
                            
                                if (nn.toLowerCase().includes(speciesName.toLowerCase())) {
                                    showdownText += `${speciesName}`
                                } else {
                                    showdownText += `${nn} (${speciesName})`
                                }

                               
                            } else {
                                showdownText += `${speciesName}`
                            }

                            
                            if (itemId != 0) {
                                showdownText += ` @ ${itemTitleize(emImpItems[itemId])}`
                            }
                            showdownText += "\n"
                            showdownText += `Level: ${level}\n`
                            showdownText += `${monNature} Nature\n`

                            if (hasEvs) {
                                showdownText += `EVs: ${evs[0]} HP / ${evs[1]} Atk / ${evs[2]} Def / ${evs[3]} Spe / ${evs[4]} SpA / ${evs[5]} SpD\n`
                            }
                            showdownText += `IVs: ${ivs[0]} HP / ${ivs[1]} Atk / ${ivs[2]} Def / ${ivs[3]} Spe / ${ivs[4]} SpA / ${ivs[5]} SpD\n`

                            showdownText += `Ability: ${abilitySlot}\n`
                            showdownText += `- ${move1}\n`
                            showdownText += `- ${move2}\n`
                            showdownText += `- ${move3}\n`
                            showdownText += `- ${move4}\n`
                            showdownText += `Met: ${met}\n\n`
                            offset = lastFoundAt + 2
                        } else {
                            offset += 2; 
                        }   
                    }
                    $('.import-team-text').val(showdownText)
                    $('#import').click()    
                };
                reader.readAsArrayBuffer(file);

                // Start watching immediately
                if (fileHandle) {
                    async function checkFile() {
                        const newFile = await fileHandle.getFile();

                        const contents = new Uint8Array(await newFile.arrayBuffer());

                        if (lastContents && !arraysEqual(contents, lastContents)) {
                            // console.log("File changed! New contents:", contents);
                            reader.readAsArrayBuffer(newFile);
                        }

                        lastContents = contents;
                    }

                    // Run once now
                    await checkFile();
                    // Poll every 2s
                    setInterval(checkFile, 2000);
                } else {
                    console.warn("No persistent file handle, cannot watch for changes continuously.");
                }
            }
        })()
    });
}


function getTms(tmData, rotation) {   
    let tmOffset = 0;
    legalTms = []

    while (tmOffset < tmData.byteLength - 1) {
        let itemId = tmData.getUint16(tmOffset, true);
        let tmMagic = tmData.getUint16(tmOffset + 2, true);
        let moveName


        

        let itemName = emImpItems[itemId]

        if (typeof itemName == 'undefined') {
            tmOffset += 4;
            continue
        } else {
            itemName = itemName.replace("M0", "M")
        }

        

        // console.log(itemName)

        if (itemName.includes("TM")) {
            moveName = invertedTms[itemName.slice(2)]
            console.log(tmMagic)
            if (tmMagic ) {
               legalTms.push(moveName)
            }
        } else if (itemName.includes("HM")) {
            moveName = invertedHms[itemName.slice(2)]
            if (tmMagic) {
               legalTms.push(moveName)
            }
        }         
        tmOffset += 4
    }
    localStorage.legalTms = legalTms
}

function getIVs(ivValue) {

    // Extract each stat using bitwise operations
    const hp = (ivValue >> 0) & 0x1F;         // 5 bits for HP
    const attack = (ivValue >> 5) & 0x1F;     // 5 bits for Attack
    const defense = (ivValue >> 10) & 0x1F;   // 5 bits for Defense
    const speed = (ivValue >> 15) & 0x1F;     // 5 bits for Speed
    const spAttack = (ivValue >> 20) & 0x1F;  // 5 bits for Special Attack
    const spDefense = (ivValue >> 25) & 0x1F; // 5 bits for Special Defense

    return [
        hp,
        attack,
        defense,  
        speed,
        spAttack,
        spDefense,
    ];
}

function hasInvalidMoves(arr) {
    const seen = new Set();
    
    for (const item of arr) {
        // Check for undefined
        if (item === undefined) {
            return true;
        }

        if (item !== "None") {
            if (seen.has(item)) {
                return true;
            }
            seen.add(item);
        }
    }    
    return false;
}
function arraysEqual(a, b) {
    if (a.byteLength !== b.byteLength) return false;
    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function itemTitleize(item) {
    return item.toLowerCase().split(/([ _-])/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('').replace("_", " ").replace("Never Melt_Ice", "Never-Melt Ice")
}

function getLegalMoves(speciesName) {
    if (speciesName.includes("-Mega")) return [];



    let speciesNameId = speciesName.replace(/[^a-zA-Z0-9é]/g, '').toLowerCase()
    let moves = learnsets[speciesNameId]
    let ls = moves["ls"] || []
    let tms = moves["tms"] || []

    let legalMoves = []

    for (l of ls) {
        legalMoves.push(l[1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
    }
    for (tm of tms) {
        legalMoves.push(tm.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
    }
    return legalMoves
}

function getFamilyLegalMoves(speciesName) {
    let anc = evoData[speciesName]["anc"]
    let possibleMiddleEvo = evoData[anc]["evos"][0]

    let legalMoves = getLegalMoves(speciesName)

    if (anc != speciesName) {
        legalMoves = legalMoves.concat(getLegalMoves(anc))
    }

    if (possibleMiddleEvo && possibleMiddleEvo != speciesName) {
        legalMoves = legalMoves.concat(getLegalMoves(possibleMiddleEvo))
    }
    return [...new Set(legalMoves)]
}

const orderFormats = [[1,2,3,4],         
                        [1,2,4,3],          
                        [1,3,2,4],          
                        [1,3,4,2],          
                        [1,4,2,3],          
                        [1,4,3,2],          
                        [2,1,3,4],
                        [2,1,4,3],
                        [2,3,1,4],
                        [2,3,4,1],
                        [2,4,1,3],
                        [2,4,3,1],
                        [3,1,2,4],
                        [3,1,4,2],
                        [3,2,1,4],
                        [3,2,4,1],
                        [3,4,1,2],
                        [3,4,2,1],
                        [4,1,2,3],
                        [4,1,3,2],
                        [4,2,1,3],
                        [4,2,3,1],
                        [4,3,1,2],
                        [4,3,2,1]]

function parsePngChunks(arrayBuffer) {
  const dv = new DataView(arrayBuffer);
  const chunks = [];
  // verify PNG signature (optional)
  // PNG signature is: 89 50 4E 47 0D 0A 1A 0A
  const pngSig = [0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A];
  for (let i = 0; i < 8; i++) {
    if (dv.getUint8(i) !== pngSig[i]) {
      throw new Error('Not a PNG file');
    }
  }
  let offset = 8;
  while (offset + 8 <= dv.byteLength) {
    const length = dv.getUint32(offset, false); // big-endian
    const typeChars = [];
    for (let i = 0; i < 4; i++) {
      typeChars.push(String.fromCharCode(dv.getUint8(offset + 4 + i)));
    }
    const type = typeChars.join('');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > dv.byteLength) break;
    const data = new Uint8Array(arrayBuffer.slice(dataStart, dataEnd));
    const crc = dv.getUint32(dataEnd, false);
    chunks.push({ type, length, data, crc });
    offset = dataEnd + 4;
  }
  return chunks;
}

function getChunksByName(chunks, name) {
  return chunks.filter(c => c.type === name).map(c => c.data);
}

function concatUint8Arrays(arrays) {
  if (arrays.length === 0) return new Uint8Array();
  let total = 0;
  arrays.forEach(a => total += a.length);
  const out = new Uint8Array(total);
  let pos = 0;
  arrays.forEach(a => { out.set(a, pos); pos += a.length; });
  return out;
}

function decompressZlib(u8arr) {
  return pako.inflate(u8arr);
}

function rotateDataViewLeft(dv, n) {
  const bytes = new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength);
  const len = bytes.length;
  n = n % len;

  // Create rotated copy
  const rotated = new Uint8Array(len);
  rotated.set(bytes.subarray(n));
  rotated.set(bytes.subarray(0, n), len - n);

  return new DataView(rotated.buffer);
}


function extractSaveState(file) {
  const ab = file;
  let chunks;
  try {
    chunks = parsePngChunks(ab);
  } catch (e) {
    console.error('PNG parse error:', e);
    return;
  }

  const gbAs = getChunksByName(chunks, 'gbAs');


  if (gbAs.length > 0) {
    const combined = concatUint8Arrays(gbAs);
    try {
      const inflated = decompressZlib(combined);
      return inflated
    } catch (e) {
      console.error('Error inflating gbAs', e);
    }
  }
}




