// Generic Utility Functoins

function cleanString(str) {return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()};

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME  = 0x01000193;
const stats = ["hp","atk","def","spa","spd","spe"];

function hashStr(h, s) {
  for (let i = 0, n = s.length; i < n; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME);
  }
  return h;
}

function hashPokemonPair(arr) {
  let h = FNV_OFFSET;

  // -------------------------
  // First full object
  // -------------------------
  const o = arr[0];

  // s stats
  const s = o.ss;
  h ^= s.hp;  h = Math.imul(h, FNV_PRIME);
  h ^= s.atk; h = Math.imul(h, FNV_PRIME);
  h ^= s.def; h = Math.imul(h, FNV_PRIME);
  h ^= s.spa; h = Math.imul(h, FNV_PRIME);
  h ^= s.spd; h = Math.imul(h, FNV_PRIME);
  h ^= s.spe; h = Math.imul(h, FNV_PRIME);

  // types t[0], t[1]
  const t = o.t;
  h = hashStr(h, t[0]);
  h = hashStr(h, t[1]);

  // level
  h ^= o.l; h = Math.imul(h, FNV_PRIME);

  // ability
  h = hashStr(h, o.a);

  // species name
  h = hashStr(h, o.s);

  // ao boolean
  h ^= o.ao ? 1 : 0;
  h = Math.imul(h, FNV_PRIME);

  // item, nature
  h = hashStr(h, o.i);
  h = hashStr(h, o.n);

  const iv = o.iv, ev = o.ev, b = o.b;
  for (let i = 0; i < 6; i++) {
    const k = stats[i];
    h ^= iv[k]; h = Math.imul(h, FNV_PRIME);
    h ^= ev[k]; h = Math.imul(h, FNV_PRIME);
    h ^= b[k];  h = Math.imul(h, FNV_PRIME);
  }

  // resulting stat hp
  h ^= o.h; h = Math.imul(h, FNV_PRIME);

  // status string
  h = hashStr(h, o.st);

  // moves
  h = hashStr(h, o.m0);
  h = hashStr(h, o.m1);
  h = hashStr(h, o.m2);
  h = hashStr(h, o.m3);

  // -------------------------
  // Second stripped object
  // -------------------------
  const o2 = arr[1];

  h ^= o2.l; h = Math.imul(h, FNV_PRIME);
  h = hashStr(h, o2.a);
  h = hashStr(h, o2.s);

  h = hashStr(h, o2.i);

  h = hashStr(h, o2.m0);
  h = hashStr(h, o2.m1);
  h = hashStr(h, o2.m2);
  h = hashStr(h, o2.m3);

  return (h >>> 0).toString(16).padStart(8, '0');
}


function updateBoxAnim() {
    // Shake box
    $('.player-poks').addClass('shake')
    setTimeout(function(){
        $('.player-poks').removeClass('shake')
    }, 500)
}

function pack12BitInts(values, maxLen) {
  if (!Array.isArray(values)) throw new TypeError("values must be an array");
  if (Number.isFinite(maxLen) && values.length > maxLen) {
    throw new RangeError(`max ${maxLen} values`);
  }

  const n = values.length;
  const totalBits = n * 12;
  const out = new Uint8Array((totalBits + 7) >> 3);

  let bitPos = 0;

  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (!Number.isInteger(v)) throw new TypeError(`values[${i}] not an integer`);
    if (v < 0 || v > 2047) throw new RangeError(`values[${i}] out of range: ${v}`);

    let x = v; // already 0..2047
    for (let b = 0; b < 12; b++) {
      const byteIndex = bitPos >> 3;
      const bitIndex = bitPos & 7;
      if (x & 1) out[byteIndex] |= (1 << bitIndex);
      x >>= 1;
      bitPos++;
    }
  }
  return out;
}

function bytesToBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function pack12BitIntsToBase64(values, maxLen) {
  return bytesToBase64(pack12BitInts(values, maxLen));
}

/**
 * Optional decoder (useful for testing roundtrips).
 */
function unpack12BitInts(bytes, count) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError("bytes must be Uint8Array");
  if (!Number.isInteger(count) || count < 0) throw new RangeError("bad count");

  const neededBits = count * 12;
  if (bytes.length * 8 < neededBits) throw new RangeError("not enough data");

  const out = new Array(count);
  let bitPos = 0;

  for (let i = 0; i < count; i++) {
    let x = 0;
    for (let b = 0; b < 12; b++) {
      const byteIndex = bitPos >> 3;
      const bitIndex = bitPos & 7;
      const bit = (bytes[byteIndex] >> bitIndex) & 1;
      x |= (bit << b); // LSB-first
      bitPos++;
    }
    out[i] = x + 1; // back to 1..2048
  }

  return out;
}


function checkAndLoadScript(src, options = {}) {
    const {
        onLoad = null,
        onError = null,
        onNotFound = null,
        timeout = 10000
    } = options;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        
        let timeoutId;
        let resolved = false;

        // Set up timeout
        if (timeout > 0) {
            timeoutId = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.error(`Timeout loading: ${src}`);
                    if (onError) onError(src, new Error('Timeout'));
                    resolve(false);
                }
            }, timeout);
        }

        script.onload = () => {
            if (!resolved) {
                resolved = true;
                if (timeoutId) clearTimeout(timeoutId);
                console.log(`Successfully loaded: ${src}`);
                if (onLoad) onLoad(src);
                resolve(true);
            }
        };
        
        script.onerror = (error) => {
            if (!resolved) {
                resolved = true;
                if (timeoutId) clearTimeout(timeoutId);
                console.log(`File not found or failed to load: ${src}`);
                if (onNotFound) onNotFound(src, error);
                resolve(false);
            }
        };
        
        // Add script to document head
        document.head.appendChild(script);
    });
}

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function getLastInteger(str) {
  // find all numbers
  let matches = str.match(/\d+/g);
  if (!matches) return null;
  return parseInt(matches[matches.length - 1], 10);
}

function filterStringsByNumber(targetNum, strArray) {
    // Define the acceptable range
    const minNum = targetNum - 3;
    const maxNum = targetNum + 3;
    
    // Helper function to find numbers that follow "Lvl " in a string
    const findLevelNumbersInString = (str) => {
        const matches = str.match(/Lvl (-?\d+)/g);
        if (!matches) return [];
        
        // Extract just the numbers from the matches
        return matches.map(match => parseInt(match.replace('Lvl ', '')));
    };
    
    // Filter the array
    return strArray.filter(str => {
        const numbers = findLevelNumbersInString(str);
        
        // Check if any number in the string is within range
        return numbers.some(num => 
            num >= minNum && num <= maxNum
        );
    });
}
function extractPokemonName(str) {
    // Match everything before the opening parenthesis and trim whitespace
    const match = str.match(/^(.+?)\s*\(/);
    return match ? match[1].trim() : null;
}

function toTitleCase(str) {
  if (!str) {
    return ""
  }
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatString(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function deepEqualJSON(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getTrainerName(str) {
  const m = str.match(/\(Lvl\s+-?\d+\s+([^)]+)\)/);
  return m ? m[1] : null;
}

function padArray(array, length, fill) {   return length > array.length ? array.concat(Array(length - array.length).fill(fill)) : array; }

function construct_type_chart() {
    var type_names = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice",
             "Fighting", "Poison", "Ground", "Flying", "Psychic",
             "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy","???"]

    var types = TYPES_BY_ID[settings.type_chart]
    var chart = []

    for (i = 0; i < type_names.length; i++) {
        var effectiveness = []

        for (j = 0; j < type_names.length; j++) {
            effectiveness.push(types[type_names[i].toLowerCase().replace("???", "")].effectiveness[type_names[j]])
        }
        chart.push(effectiveness)
    }

    return chart
}

function get_type_info(pok_types, modifier=false) {
    if (pok_types[1] == pok_types[0]) {
        pok_types[1] = "None"
    }

    if (modifier == "Chip Away" || modifier == "Normalize") {
        return {
            "Normal": 1,
            "Fire": 1,
            "Water": 1,
            "Electric": 1,
            "Grass": 1,
            "Ice": 1,
            "Fighting": 1,
            "Poison": 1,
            "Ground": 1,
            "Flying": 1,
            "Psychic": 1,
            "Bug": 1,
            "Rock": 1,
            "Ghost": 1,
            "Dragon": 1,
            "Dark": 1,
            "Steel": 1,
            "Fairy": 1,
            "None": 1
        }
    }


    var type_name = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice",
                 "Fighting", "Poison", "Ground", "Flying", "Psychic",
                 "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy","None"]

    var result = {}

    if (typeof final_type_chart !== 'undefined') {
        var types = final_type_chart

    } else {

        var types = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1, 1, 0.5, 1,1],
                [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5, 1, 2, 1,1],
                [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5, 1, 1, 1,1],
                [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5, 1, 1, 1,1],
                [1, 0.5, 2, 1, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5, 1, 0.5, 1,1],
                [1, 0.5, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2, 1, 0.5, 1,1],
                [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1, 2, 2, 0.5,1],
                [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 0, 2,1],
                [1, 2, 1, 2, 0.5, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1, 1, 2, 1,1],
                [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 0.5, 1,1],
                [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1, 0, 0.5, 1,1],
                [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1, 2, 0.5, 0.5,1],
                [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 0.5, 1,1],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 1,1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0.5, 0,1],
                [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 2, 1, 1, 2, 1, 0.5, 1, 0.5,1],
                [1, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0.5, 2,1],
                [1, 0.5, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 1, 2, 2, 0.5, 1,1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]

        if (settings.typeChart < 6) {

            types[13][16] = 0.5
            types[15][16] = 0.5
        } else {
           types[13][16] = 1
            types[15][16] = 1 
        }

        if (modifier == "Corrosion") {
            types[7][16] = 2
        } else if (modifier == "Inner Focus") {
          types[10][15] = 1
        } else if (modifier == "Scrappy" || modifier == "Sacred Sword" || modifier == "Relic Song") {
            types[0][13] = 1
            types[6][13] = 1
        } else if (modifier == "Freeze-Dry") {
          types[5][[2]] = 2
        } else if (modifier == "Sky Uppercut") {
          types[6][9] = 2
        }

        

        
    }
   
    var type1 = type_name.indexOf(pok_types[0])
    var type2 = type_name.indexOf(pok_types[1])


    for (i in types) {    
      result[type_name[i]] = (types[i][type1] * types[i][type2])  
    }
    return result
}
