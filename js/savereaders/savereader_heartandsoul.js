(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("./save_constants/heartandsoul_constants.js"));
    } else {
        root.parseHeartAndSoulSaveFile = factory(root.heartAndSoulSaveConstants).parseHeartAndSoulSaveFile;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function (defaultConstants) {
    "use strict";

    function createReader(constants) {
        var layout = constants.layout;
        var dataSize = layout.constants.SECTOR_DATA_SIZE;
        var orders = [
            [0,1,2,3],[0,1,3,2],[0,2,1,3],[0,2,3,1],[0,3,1,2],[0,3,2,1],
            [1,0,2,3],[1,0,3,2],[1,2,0,3],[1,2,3,0],[1,3,0,2],[1,3,2,0],
            [2,0,1,3],[2,0,3,1],[2,1,0,3],[2,1,3,0],[2,3,0,1],[2,3,1,0],
            [3,0,1,2],[3,0,2,1],[3,1,0,2],[3,1,2,0],[3,2,0,1],[3,2,1,0]
        ];
        var stats = ["hp", "at", "df", "sp", "sa", "sd"];
        var statNames = ["HP", "Atk", "Def", "Spe", "SpA", "SpD"];

        function u16(bytes, offset) { return bytes[offset] | (bytes[offset+1] << 8); }
        function u32(bytes, offset) { return (u16(bytes,offset) | (u16(bytes,offset+2) << 16)) >>> 0; }
        function field(bytes, definition) {
            var value = 0;
            for (var i = 0; i < definition.width; i++) {
                var bit = definition.bit+i;
                if (bytes[bit >>> 3] & (1 << (bit & 7))) value += Math.pow(2,i);
            }
            return value;
        }
        function decode(bytes) {
            var text = "";
            for (var i = 0; i < bytes.length && bytes[i] !== 255; i++) text += constants.charmap[bytes[i]] || "";
            return text.trim();
        }
        function join(parts) {
            var out = new Uint8Array(parts.reduce(function (n,p) { return n+p.length; },0));
            var offset = 0;
            parts.forEach(function (p) { out.set(p,offset); offset += p.length; });
            return out;
        }
        function sectorLength(id) {
            var size = id === 0 ? layout.SaveBlock2.size : id < 5 ? layout.SaveBlock1.size : layout.PokemonStorage.size;
            var index = id === 0 ? 0 : id < 5 ? id-1 : id-5;
            return Math.min(dataSize, size-index*dataSize);
        }
        function checksum(bytes, length) {
            var sum = 0;
            for (var i = 0; i < length; i += 4) sum = (sum+u32(bytes,i)) >>> 0;
            return ((sum & 65535)+(sum >>> 16)) & 65535;
        }
        function loadBlocks(bytes) {
            if (![0x10000,0x20000,0x20010].includes(bytes.length)) {
                throw new Error("Expected a raw Heart & Soul 2.0.6 .sav/.srm (64 or 128 KiB, with optional 16-byte trailer).");
            }
            var candidates = [];
            for (var slot = 0; slot < 2; slot++) {
                var sectors = new Array(14), counter = null, valid = true;
                for (var physical = 0; physical < 14; physical++) {
                    var offset = (slot*14+physical)*4096;
                    if (offset+4096 > bytes.length) { valid = false; break; }
                    var sector = bytes.subarray(offset,offset+4096);
                    var id = u16(sector,4084), count = u32(sector,4092);
                    if (id > 13 || u32(sector,4088) !== 0x8012025 || sectors[id]
                        || (counter !== null && counter !== count)
                        || checksum(sector,sectorLength(id)) !== u16(sector,4086)) {
                        valid = false; break;
                    }
                    sectors[id] = sector; counter = count;
                }
                if (valid && sectors.every(Boolean)) candidates.push({slot:slot,counter:counter,sectors:sectors});
            }
            if (!candidates.length) throw new Error("No complete Heart & Soul save slot passed sector signature and checksum validation.");
            var selected = candidates[0];
            if (candidates.length > 1 && ((candidates[1].counter-selected.counter) >>> 0) < 0x80000000
                && candidates[1].counter !== selected.counter) selected = candidates[1];
            var s = selected.sectors;
            selected.small = s[0].slice(0,layout.SaveBlock2.size);
            selected.large = join(s.slice(1,5).map(function (v) { return v.slice(0,dataSize); }));
            selected.storage = join(s.slice(5).map(function (v) { return v.slice(0,dataSize); }));
            selected.extra = join(s.map(function (v) { return v.slice(dataSize,4084); }));
            if (u16(selected.large,layout.SaveBlock1.saveVersion) !== layout.constants.SAVE_VERSION) {
                throw new Error("This reader supports Heart & Soul 2.0.6 save version 5.");
            }
            return selected;
        }

        function parseMon(raw, location, warnings, options) {
            if (raw.length < layout.BoxPokemon.size || !field(raw,layout.BoxPokemon.hasSpecies)) return null;
            if (field(raw,layout.BoxPokemon.isBadEgg)) {
                warnings.push({location:location,reason:"Bad Egg"}); return null;
            }
            var pid = u32(raw,0), otId = u32(raw,4), key = (pid ^ otId) >>> 0;
            var secure = raw.slice(layout.BoxPokemon.secure,layout.BoxPokemon.size);
            for (var i = 0; i < secure.length; i += 4) {
                var word = (u32(secure,i) ^ key) >>> 0;
                for (var j = 0; j < 4; j++) secure[i+j] = (word >>> (j*8)) & 255;
            }
            var sum = 0;
            for (i = 0; i < secure.length; i += 2) sum = (sum+u16(secure,i)) & 65535;
            if (sum !== u16(raw,layout.BoxPokemon.checksum)) {
                warnings.push({location:location,reason:"Pokémon checksum mismatch"}); return null;
            }
            var order = orders[pid % 24];
            var blocks = [];
            for (i = 0; i < 4; i++) blocks[order[i]] = secure.subarray(i*12,(i+1)*12);
            var speciesId = field(blocks[0],layout.PokemonSubstruct0.species);
            var species = constants.species[speciesId];
            if (!species) { warnings.push({location:location,reason:"Unknown species "+speciesId}); return null; }
            var experience = field(blocks[0],layout.PokemonSubstruct0.experience);
            var level = 1, table = constants.experienceTables[species.growthRate];
            for (i = 2; i <= 100 && experience >= table[i]; i++) level = i;
            var natureId = (pid % 25) ^ field(raw,layout.BoxPokemon.hiddenNatureModifier);
            if (natureId >= 25) { warnings.push({location:location,reason:"Invalid mint nature"}); return null; }
            var abilitySlot = field(blocks[3],layout.PokemonSubstruct3.abilityNum);
            var ability = species.abilities[abilitySlot] || species.abilities.find(Boolean);
            if (abilitySlot === 0 && options.tx_Mode_Legendary_Abilities) ability = constants.legendaryAbilities[speciesId] || ability;
            if (!ability) { warnings.push({location:location,reason:"Invalid ability slot"}); return null; }
            var nicknameBytes = Array.from(raw.subarray(8,18));
            if (!nicknameBytes.includes(255)) {
                nicknameBytes.push(field(blocks[0],layout.PokemonSubstruct0.nickname11));
                nicknameBytes.push(field(blocks[0],layout.PokemonSubstruct0.nickname12));
            }
            var itemId = field(blocks[0],layout.PokemonSubstruct0.heldItem);
            var moveIds = [1,2,3,4].map(function (n) { return field(blocks[1],layout.PokemonSubstruct1["move"+n]); });
            if (!constants.items[itemId] || moveIds.some(function (n) { return !constants.moves[n]; })) {
                warnings.push({location:location,reason:"Unknown held item or move"}); return null;
            }
            var ivWord = u32(blocks[3],4), ivs = {}, rawIvs = {}, evs = {};
            var hyperNames = ["HP","Attack","Defense","Speed","SpAttack","SpDefense"];
            stats.forEach(function (stat,index) {
                rawIvs[stat] = (ivWord >>> (index*5)) & 31;
                ivs[stat] = field(blocks[1],layout.PokemonSubstruct1["hyperTrained"+hyperNames[index]]) ? 31 : rawIvs[stat];
                evs[stat] = blocks[2][index];
            });
            var ratio = species.genderRatio;
            var gender = ratio === 255 ? "N" : ratio === 254 ? "F" : ratio === 0 ? "M" : (pid & 255) < ratio ? "F" : "M";
            var mon = Object.assign({species:species.name,speciesId:speciesId,nickname:decode(nicknameBytes),pid:pid,otId:otId,
                level:level,experience:experience,nature:constants.natures[natureId],originalNature:constants.natures[pid % 25],
                gender:gender,ability:ability,abilitySlot:abilitySlot,item:itemId ? constants.items[itemId] : null,
                itemId:itemId,moves:moveIds.filter(Boolean).map(function (n) { return constants.moves[n]; }),moveIds:moveIds,
                ivs:ivs,rawIvs:rawIvs,evs:evs,happiness:blocks[0][9],isEgg:!!field(blocks[3],layout.PokemonSubstruct3.isEgg),
                shiny:(((otId & 65535) ^ (otId >>> 16) ^ (pid & 65535) ^ (pid >>> 16)) < 8) !== !!field(raw,layout.BoxPokemon.shinyModifier)},location);
            if (location.storage === "party") {
                mon.hp = u16(raw,layout.Pokemon.hp); mon.maxHP = u16(raw,layout.Pokemon.maxHP);
                mon.status = u32(raw,layout.Pokemon.status);
            }
            return mon;
        }

        function showdown(mon) {
            var header = mon.nickname && mon.nickname !== mon.species ? mon.nickname+" ("+mon.species+")" : mon.species;
            var text = header+(mon.gender !== "N" ? " ("+mon.gender+")" : "")+(mon.item ? " @ "+mon.item : "")+"\n";
            text += "Level: "+mon.level+"\nAbility: "+mon.ability+"\n"+mon.nature+" Nature\n";
            text += "EVs: "+stats.map(function (s,i) { return mon.evs[s]+" "+statNames[i]; }).join(" / ")+"\n";
            text += "IVs: "+stats.map(function (s,i) { return mon.ivs[s]+" "+statNames[i]; }).join(" / ")+"\n";
            text += "Happiness: "+mon.happiness+"\n";
            if (mon.shiny) text += "Shiny: Yes\n";
            if (mon.isEgg) text += "Egg: Yes\n";
            mon.moves.forEach(function (move) { text += "- "+move+"\n"; });
            return text+"\n";
        }

        function parseHeartAndSoulSaveFile(input) {
            var bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
            var blocks = loadBlocks(bytes), warnings = [], party = [], boxes = [], fusions = [];
            var challenge = blocks.extra.subarray(layout.SaveBlock3.challengeSettings);
            var options = {};
            Object.keys(layout.ChallengeSettings).forEach(function (key) { options[key] = field(challenge,layout.ChallengeSettings[key]); });
            if (options.tx_Random_Abilities || options.tx_Random_Type) {
                throw new Error("Heart & Soul saves with randomized abilities or types require randomized calculator data and are not supported by this reader.");
            }
            var count = blocks.large[layout.SaveBlock1.playerPartyCount];
            if (count > 6) throw new Error("Invalid Heart & Soul party count.");
            for (var i = 0; i < count; i++) {
                var offset = layout.SaveBlock1.playerParty+i*layout.Pokemon.size;
                var mon = parseMon(blocks.large.subarray(offset,offset+layout.Pokemon.size),{storage:"party",partySlot:i},warnings,options);
                if (mon) party.push(mon);
            }
            for (var box = 0; box < layout.constants.TOTAL_BOXES_COUNT; box++) {
                var members = [];
                for (var slot = 0; slot < 30; slot++) {
                    offset = layout.PokemonStorage.boxes+(box*30+slot)*layout.BoxPokemon.size;
                    mon = parseMon(blocks.storage.subarray(offset,offset+layout.BoxPokemon.size),{storage:"box",box:box,slot:slot},warnings,options);
                    if (mon) members.push(mon);
                }
                offset = layout.PokemonStorage.boxNames+box*9;
                boxes.push({name:decode(blocks.storage.subarray(offset,offset+9)),mons:members});
            }
            for (i = 0; i < 4; i++) {
                offset = layout.PokemonStorage.fusions+i*layout.Pokemon.size;
                mon = parseMon(blocks.storage.subarray(offset,offset+layout.Pokemon.size),{storage:"fusion",slot:i},warnings,options);
                if (mon) fusions.push(mon);
            }
            var mons = party.concat.apply(party, boxes.map(function (b) { return b.mons; })).concat(fusions);
            // Match the other Gen 3 readers: the final PC box is the death box.
            var deadBox = boxes[boxes.length-1];
            var deadMons = deadBox.mons.map(function (m) {
                return {speciesName:m.species,speciesId:m.speciesId,nickname:m.nickname,box:m.box+1,slot:m.slot+1,source:"save-file"};
            });
            var liveMons = mons.filter(function (m) { return m.storage !== "box" || m.box < boxes.length-1; });
            var trainerId = u32(blocks.small,layout.SaveBlock2.playerTrainerId);
            return {detectedGame:constants.title || "Heart & Soul 2.0.6",slot:blocks.slot,saveCounter:blocks.counter,
                trainerName:decode(blocks.small.subarray(0,8)),trainerId:trainerId & 65535,secretId:trainerId >>> 16,
                party:party,boxes:boxes,fusions:fusions,mons:mons,options:options,warnings:warnings,
                showdownImport:liveMons.map(showdown).join(""),deadMons:deadMons,
                importedMonsMetadata:liveMons.map(function (m) { return {abilityIndex:m.abilitySlot,trainerIdSecret:m.otId}; })};
        }
        return parseHeartAndSoulSaveFile;
    }

    function parseHeartAndSoulSaveFile(input, saveConstants) {
        return createReader(saveConstants || defaultConstants)(input);
    }

    if (typeof window !== "undefined" && typeof document !== "undefined" && typeof $ === "function") {
        $(document).ready(function () {
            $("#read-save").off("click.heartandsoulsave").on("click.heartandsoulsave",function () {
                if (window.baseGame === "heartandsoul" && $("#save-upload").length) $("#save-upload")[0].value = null;
            });
            var input = document.getElementById("save-upload");
            if (!input) return;
            input.addEventListener("change",function (event) {
                if (window.baseGame !== "heartandsoul") return;
                var file = event.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        var saveConstants = window.backup_data && window.backup_data.title === "Heart & Soul Difficult Teams"
                            ? window.heartAndSoulDifficultSaveConstants : defaultConstants;
                        var result = parseHeartAndSoulSaveFile(e.target.result, saveConstants);
                        window.saveUploaded = true; window.saveFileName = file.name;
                        window.savExt = (file.name.split(".").pop() || "").toLowerCase();
                        window.lastHeartAndSoulSave = result;
                        if (result.warnings.length) console.warn("Heart & Soul skipped invalid Pokémon:",result.warnings);
                        if (typeof window.applyImportedSnapshot === "function") {
                            window.applyImportedSnapshot({showdownImport:result.showdownImport,deadMons:result.deadMons,importedMonsMetadata:result.importedMonsMetadata,trainerId:result.trainerId,
                                secretId:result.secretId,trainerIdSecret:((result.secretId << 16) | result.trainerId) >>> 0,source:"save-file",replaceDeadMons:true});
                        } else { $(".import-team-text").val(result.showdownImport); $("#import").click(); }
                    } catch (error) { console.error(error); alert(error.message); }
                };
                reader.readAsArrayBuffer(file);
            });
        });
    }
    return {parseHeartAndSoulSaveFile:parseHeartAndSoulSaveFile};
});
