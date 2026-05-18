if (typeof TITLE === "string" && TITLE.includes("Imperium")) {
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
                    

                    if (save_index_b > save_index_a || save_index_a == 65535) {
                         block_offset = save_block_b_offset
                    }

                    var save_index = Math.max(save_index_a, save_index_b)
                    let rotation = save_index % 14


                    console.log(`save_index: ${save_index}, rotation: ${rotation}`)
                    let retries = 0
                    if (!savExt.includes("ss")) {
                        localStorage.legalTms = ''
                        getTms(saveFile, 0)
                    }
                    


                    let offset = 0;
                    const magicValue = 0x0202;

                    offset = 0

                    let pokCount = 0


                    let lastFoundAt = 0

                    let showdownText = ""
                    let deadMons = []

                    saveFile 

                    // --- pokeemerald-expansion sector reader (single-slot, 28 logical sectors) ---
                    // Sector is always 0x1000 bytes; footer fields are at the end.
                    // In your modified save system: SECTOR_DATA_SIZE = 4084 (0xFF4), footer = 12 bytes.
                    const SECTOR_SIZE = 0x1000;
                    const SECTOR_DATA_SIZE = 0x0FF4; // 4084
                    const FOOTER_ID_OFF = 0x0FF4;     // u16
                    const FOOTER_SUM_OFF = 0x0FF6;    // u16
                    const FOOTER_SIG_OFF = 0x0FF8;    // u32
                    const FOOTER_CNT_OFF = 0x0FFC;    // u32

                    const SECTOR_SIGNATURE = 0x08012025; // from your save.h (0x8012025)
                    const NUM_LOGICAL = 28;              // ids 0..27 are the main save data

                    // Gen 3 struct sizes (these are stable for Emerald-style saves)
                    const PARTYMON_SIZE = 0x64; // 100 bytes (Pokemon)

                    // Boxes: 30 slots * 14 boxes = 420 boxed mons
                    // --- Deterministic PokemonStorage offsets from your struct ---
                    // PokemonStorage layout (actual on-disk, accounting for padding)
                    const TOTAL_BOXES_COUNT = 14;
                    const IN_BOX_COUNT = 30;
                    const BOXMON_SIZE = 0x50;        // BoxPokemon
                    const BOX_BASE_OFFSET = 0x0004;  // <-- IMPORTANT: padding after currentBox

                    const BOXMON_COUNT = TOTAL_BOXES_COUNT * IN_BOX_COUNT;

                    // --- 1) Build newest logical sectors map (by footer id, choosing highest counter) ---
                    function buildNewestLogicalSectors(saveDv) {
                      const totalSectors = Math.floor(saveDv.byteLength / SECTOR_SIZE);
                      const newest = new Array(NUM_LOGICAL).fill(null); // {counter, dataU8}

                      // Scan physical sectors 0..(totalSectors-1). For .sav this is usually 32.
                      for (let phys = 0; phys < totalSectors; phys++) {
                        const base = phys * SECTOR_SIZE;
                        // Quick bounds check
                        if (base + SECTOR_SIZE > saveDv.byteLength) break;

                        const sig = saveDv.getUint32(base + FOOTER_SIG_OFF, true);
                        if (sig !== SECTOR_SIGNATURE) continue;

                        const id = saveDv.getUint16(base + FOOTER_ID_OFF, true);
                        if (id >= NUM_LOGICAL) continue;

                        const counter = saveDv.getUint32(base + FOOTER_CNT_OFF, true);

                        const prev = newest[id];
                        if (!prev || counter > prev.counter) {
                          // Copy out the sector data area only (0..SECTOR_DATA_SIZE)
                          const dataU8 = new Uint8Array(saveDv.buffer, saveDv.byteOffset + base, SECTOR_DATA_SIZE);
                          // Make a real copy so later buffer slicing doesn’t alias unexpectedly
                          const copy = new Uint8Array(SECTOR_DATA_SIZE);
                          copy.set(dataU8);
                          newest[id] = { counter, data: copy };
                        }
                      }

                      return newest;
                    }

                    // --- 2) Assemble SaveBlock1 (ids 1..16) and PokemonStorage (ids 17..27) ---
                    function concatLogicalRange(logical, startId, endIdInclusive) {
                      const chunks = [];
                      let total = 0;
                      for (let id = startId; id <= endIdInclusive; id++) {
                        const entry = logical[id];
                        if (!entry) {
                          console.warn(`Missing logical sector id ${id} (signature OK sectors did not include it).`);
                          // Still push zeros so offsets remain consistent
                          const z = new Uint8Array(SECTOR_DATA_SIZE);
                          chunks.push(z);
                          total += z.length;
                          continue;
                        }
                        chunks.push(entry.data);
                        total += entry.data.length;
                      }

                      const out = new Uint8Array(total);
                      let off = 0;
                      for (const c of chunks) {
                        out.set(c, off);
                        off += c.length;
                      }
                      return new DataView(out.buffer);
                    }

                    // --- 3) Your existing “decrypt + validate mon” logic wrapped as a function ---
                    // Returns a normalized object or null if invalid.
                    function parseGen3MonAt(dv, baseOffset, isParty) {
                      // Bounds check for the struct size we intend to read
                      const need = baseOffset + (isParty ? PARTYMON_SIZE : BOXMON_SIZE);
                      if (need > dv.byteLength) return null;

                      // Read PID/TID from start of struct (this matches Gen 3 Pokemon/BoxPokemon layout)
                      let offset = baseOffset;
                      const pid = dv.getUint32(offset, true); offset += 4;



                      if (pid === 0) return null;
                      const tid = dv.getUint32(offset, true); offset += 4;

                      // Nickname (10 bytes Gen3 text) starts immediately after TID in both BoxPokemon/Pokemon
                      let nn = "";
                      for (let i = 0; i < 10; i++) {
                        const b = dv.getUint8(offset + i);
                        nn += (gen3TextTable[b] || "");
                      }
                      offset += 10;

                      // Skip language/flags etc until encrypted substruct area.
                      // In your original brute-force, you effectively jumped to:
                      // lastFoundAt + 14 then read 12 u32 blocks.
                      // For real structs, encrypted data begins at 0x20 for BoxPokemon and 0x20 for Pokemon as well.
                      // So: encryptedStart = baseOffset + 0x20
                      const encryptedStart = baseOffset + 0x20;

                      const key = pid ^ tid;
                      const suborder = orderFormats[pid % 24];
                      const decrypted = [];

                      // Decrypt 12 u32s (48 bytes) = 4 substructs * 12 bytes each
                      let eoff = encryptedStart;
                      for (let i = 0; i < 12; i++) {
                        const block = dv.getUint32(eoff, true) ^ key;
                        decrypted.push(block >>> 0);
                        eoff += 4;
                      }

                      const growth_index = suborder.indexOf(1);
                      const moves_index  = suborder.indexOf(2);
                      const evs_index    = suborder.indexOf(3);
                      const misc_index   = suborder.indexOf(4);

                      // Species
                      let speciesId = (decrypted[growth_index * 3] & 0x07FF);
                      let speciesName = emImpMons[speciesId];
                      if (!speciesName || speciesName === "None") return null;

                      if (!pokedex[speciesName]) speciesName = speciesName.replaceAll(" ", "-");

                      // Item
                      const itemId = (decrypted[growth_index * 3] >>> 16) & 0x07FF;
                      if (itemId >= emImpItems.length) return null;

                      // Exp / Level
                      const exp = (decrypted[growth_index * 3 + 1] & 0x1FFFFF);

                      let speciesNameId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                      let gr = 0;

                      if (em_imp_primary_mons[speciesName] && em_imp_primary_mons[speciesName]["gr"]) {
                        gr = em_imp_primary_mons[speciesName]["gr"];
                      } else {
                        if (typeof learnsets[speciesNameId] === "undefined") {
                          speciesName = speciesName.split("-").slice(0,2).join("-");
                          speciesNameId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        }
                        if (typeof learnsets[speciesNameId] === "undefined") {
                          speciesName = speciesName.split("-")[0];
                          speciesNameId = speciesName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        }
                        if (typeof learnsets[speciesNameId] !== "undefined") gr = learnsets[speciesNameId].gr;
                      }

                      let level;
                      try {
                        level = get_level(expTables[gr], exp);
                      } catch {
                        return null;
                      }

                      // Extend nickname by 2 bytes you were deriving from decrypted fields (keep same behavior)
                      const nn11 = gen3TextTable[(decrypted[growth_index * 3 + 1] >>> 21) & 0xFF] || "";
                      const nn12 = gen3TextTable[(decrypted[growth_index * 3 + 2] >>> 14) & 0xFF] || "";
                      nn += nn11 + nn12;

                      // Met location
                      const met = locations["EM"][(decrypted[misc_index * 3] >>> 8) & 0xFF];

                      // Nature
                      let monNature = 0;
                      if (TITLE.includes("Inclement")) {
                        const natureByte = (decrypted[misc_index * 3] >>> 16) & 0x07FF;
                        monNature = natures[(natureByte & 31744) >> 10];
                      } else {
                        monNature = natures[pid % 25];
                      }

                      // EVs
                      const int1 = decrypted[evs_index * 3];
                      const int2 = decrypted[evs_index * 3 + 1];
                      const evs = [
                        (int1 & 0xFF),
                        ((int1 >>> 8) & 0xFF),
                        ((int1 >>> 16) & 0xFF),
                        ((int1 >>> 24) & 0xFF),
                        (int2 & 0xFF),
                        ((int2 >>> 8) & 0xFF),
                      ];

                      // Moves
                      const move1 = pokeemeraldMoves[decrypted[moves_index * 3] & 0x07FF];
                      const move2 = pokeemeraldMoves[(decrypted[moves_index * 3] >>> 16) & 0x07FF];
                      const move3 = pokeemeraldMoves[decrypted[moves_index * 3 + 1] & 0x07FF];
                      const move4 = pokeemeraldMoves[(decrypted[moves_index * 3 + 1] >>> 16) & 0x07FF];
                      const moves = [move1, move2, move3, move4];

                      // IVs
                      const ivs = getIVs(decrypted[misc_index * 3 + 1]);

                      // Ability
                      let abilitySlot = 0;
                      if (TITLE.includes("Inclement")) {
                        abilitySlot = (decrypted[misc_index * 3 + 2] & 96) >> 5;
                      } else {
                        abilitySlot = (decrypted[misc_index * 3 + 2] >>> 29) & 0b11;
                        if (abilsPrimary[speciesName]) abilitySlot = abilsPrimary[speciesName][abilitySlot];
                        else if (abils[speciesName]) abilitySlot = abils[speciesName][abilitySlot];
                      }

                      // Randomized ability branch (keep your behavior)
                      if (localStorage.randomized == '1') {
                        try {
                          let slotIndex = (decrypted[misc_index * 3 + 2] >>> 29) & 0b11;
                          if (abilsPrimary[speciesName][slotIndex] === "None") slotIndex = 0;
                          abilitySlot = sav_abilities[randomizeAbility(speciesId, slotIndex, tid)];
                        } catch {
                          abilitySlot = "None";
                        }
                      }

                      return {
                        pid, tid,
                        nn, speciesName, speciesId,
                        itemId,
                        level, monNature,
                        evs, ivs,
                        abilitySlot,
                        moves,
                        met
                      };
                    }

                    // --- 5) Build Showdown text from structured party + boxes ---
                    function monToShowdown(mon) {
                      let out = "";

                      // nickname formatting (your existing behavior)
                      if (
                        mon.nn.toLowerCase() !== mon.speciesName.toLowerCase() &&
                        !(mon.speciesName.toLowerCase().includes(mon.nn.toLowerCase().trim()))
                      ) {
                        if (mon.nn.toLowerCase().includes(mon.speciesName.toLowerCase())) out += `${mon.speciesName}`;
                        else out += `${mon.nn} (${mon.speciesName})`;
                      } else {
                        out += `${mon.speciesName}`;
                      }

                      if (mon.itemId !== 0) out += ` @ ${itemTitleize(emImpItems[mon.itemId])}`;
                      out += "\n";
                      out += `Level: ${mon.level}\n`;
                      out += `${mon.monNature} Nature\n`;

                      if (settings.hasEvs) {
                        const e = mon.evs;
                        out += `EVs: ${e[0]} HP / ${e[1]} Atk / ${e[2]} Def / ${e[3]} Spe / ${e[4]} SpA / ${e[5]} SpD\n`;
                      }
                      const iv = mon.ivs;
                      out += `IVs: ${iv[0]} HP / ${iv[1]} Atk / ${iv[2]} Def / ${iv[3]} Spe / ${iv[4]} SpA / ${iv[5]} SpD\n`;

                      out += `Ability: ${mon.abilitySlot}\n`;
                      out += `- ${mon.moves[0]}\n`;
                      out += `- ${mon.moves[1]}\n`;
                      out += `- ${mon.moves[2]}\n`;
                      out += `- ${mon.moves[3]}\n`;
                      out += `Met: ${mon.met}\n\n`;
                      return out;
                    }

                    // --- Run the structured read ---
                    const logical = buildNewestLogicalSectors(saveFile);

                    // Assemble blocks from logical ids (pokeemerald-expansion: single slot, 28 sectors)
                    const saveBlock1 = concatLogicalRange(logical, 1, 16);
                    const pokemonStorage = concatLogicalRange(logical, 17, 27);

                    // --- Deterministic party offsets from your SaveBlock1 ---
                    const PARTY_COUNT_OFFSET = 0x234;
                    const PARTY_BASE_OFFSET  = 0x238;
                    const PARTY_SIZE         = 6;


                    // read count (clamp 0..6)
                    let partyCount = saveBlock1.getUint8(PARTY_COUNT_OFFSET);
                    if (partyCount > PARTY_SIZE) partyCount = PARTY_SIZE;

                    for (let i = 0; i < partyCount; i++) {
                      const off = PARTY_BASE_OFFSET + i * PARTYMON_SIZE;
                      const mon = parseGen3MonAt(saveBlock1, off, true);
                      if (mon) showdownText += monToShowdown(mon);
                    }

                    const LIVE_BOX_COUNT = TOTAL_BOXES_COUNT - 1;
                    const LIVE_BOX_MON_COUNT = LIVE_BOX_COUNT * IN_BOX_COUNT;
                    for (let i = 0; i < BOXMON_COUNT; i++) {
                      const off = BOX_BASE_OFFSET + i * BOXMON_SIZE;
                      const mon = parseGen3MonAt(pokemonStorage, off, false);
                      if (!mon) continue;
                      if (i < LIVE_BOX_MON_COUNT) {
                        showdownText += monToShowdown(mon);
                      } else {
                        deadMons.push({
                          speciesName: mon.speciesName,
                          speciesId: mon.speciesId,
                          nickname: mon.nn || "",
                          met: mon.met || "",
                          box: Math.floor(i / IN_BOX_COUNT) + 1,
                          slot: (i % IN_BOX_COUNT) + 1,
                          source: "save-file",
                        });
                      }
                    }

                    if (typeof window.applyImportedSnapshot === 'function') {
                        window.applyImportedSnapshot({
                            showdownImport: showdownText,
                            deadMons: deadMons,
                            source: 'save-file',
                            replaceDeadMons: true
                        });
                    } else {
                        $('.import-team-text').val(showdownText);
                        $('#import').click();
                    }
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
                    checkFile();
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

    pooledTms = {}
    magicCounts = {}

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
            magicCounts[tmMagic] ||= 0 
            magicCounts[tmMagic] += 1
            if (tmMagic && moveName) {
               pooledTms[tmMagic] ||= [] 
               pooledTms[tmMagic].push(moveName.replace("U Turn", "U-turn").replace("Will O Wisp", "Will-O-Wisp")) 
            }
        } else if (itemName.includes("HM")) {
            moveName = invertedHms[itemName.slice(2)]
            magicCounts[tmMagic] ||= 0
            magicCounts[tmMagic] += 1
            if (tmMagic && moveName) {
               pooledTms[tmMagic] ||= [] 
               pooledTms[tmMagic].push(moveName) 
            }
        }         
        tmOffset += 4
    }

    if (Object.keys(pooledTms).length === 0) {
        localStorage.legalTms = [] 
        return
    }
    
    localStorage.legalTms = Object.values(pooledTms).reduce((a, b) => (b.length > a.length ? b : a));
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


