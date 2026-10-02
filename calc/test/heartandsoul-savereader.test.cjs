const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const {parseHeartAndSoulSaveFile:parse} = require('../../js/savereaders/savereader_heartandsoul.js');
const constants = require('../../js/savereaders/save_constants/heartandsoul_constants.js');
const difficultConstants = require('../../js/savereaders/save_constants/heartandsoul_difficult_constants.js');
const sample = fs.readFileSync(path.resolve(__dirname,'../../cypress/fixtures/saves/heartandsoul206.sav'));
const box1 = ['Goldeen','Elekid','Murkrow','Wooper','Ekans','Pineco','Spinarak','Misdreavus','Sandshrew','Rattata','Psyduck','Bellsprout','Vulpix','Cyndaquil','Togepi','Geodude','Gligar','Aipom','Venonat','Exeggcute','Magnemite','Meowth','Staryu','Krabby','Magikarp'];

test('sample agrees with the party and Box 1 screenshots, using the newest rotated slot',()=>{
    const r = parse(sample);
    assert.equal(r.slot,1); assert.equal(r.saveCounter,101);
    assert.deepEqual(r.party.map(m=>[m.species,m.nickname,m.level,m.gender,m.hp,m.maxHP]),[
        ['Gastly','Gaster',31,'M',66,66],['Snubbull','Snubster',31,'F',84,84],
        ['Paras','Paraster',31,'M',65,65],['Munchlax','Munchster',31,'M',127,127],
        ['Hoothoot','Hootster',31,'F',80,80],['Poliwag','Polister',31,'F',75,75]
    ]);
    assert.deepEqual(r.boxes[0].mons.map(m=>m.species),box1);
    assert.deepEqual(r.boxes[0].mons.map(m=>m.slot),Array.from({length:25},(_,i)=>i));
    assert.deepEqual(r.party.map(m=>m.ability),['Levitate','Intimidate','Dry Skin','Thick Fat','Keen Eye','Damp']);
    assert.deepEqual(r.party.map(m=>m.nature),['Serious','Docile','Naughty','Hasty','Lax','Lax']);
    assert.equal(r.mons.length,33); assert.equal(r.showdownImport.split(' Nature').length-1,31);
    assert.deepEqual(r.deadMons.map(m=>m.speciesName),['Zubat','Mareep']);
    assert.equal(r.boxes[13].name,'dw o7');
    assert.equal(r.options.tx_Mode_Fairy_Types,1); assert.equal(r.options.tx_Mode_Modern_Moves,1);
    assert.deepEqual(r.warnings,[]);
});

test('sector corruption falls back to the older complete slot and rejects two broken slots',()=>{
    const bytes = Buffer.from(sample); bytes[14*4096+300] ^= 1;
    assert.equal(parse(bytes).saveCounter,100);
    bytes[300] ^= 1;
    assert.throws(()=>parse(bytes),/No complete/);
    assert.throws(()=>parse(bytes.subarray(0,123)),/raw Heart/);
    assert.equal(parse(sample.subarray(0,0x20000)).saveCounter,101);
    assert.equal(parse(sample.subarray(0,0x10000)).saveCounter,100);
});

function repairSector(bytes,physical) {
    const offset = physical*4096, id = bytes.readUInt16LE(offset+4084);
    const size = id === 0 ? constants.layout.SaveBlock2.size : id < 5 ? constants.layout.SaveBlock1.size : constants.layout.PokemonStorage.size;
    const index = id === 0 ? 0 : id < 5 ? id-1 : id-5;
    const length = Math.min(3968,size-index*3968);
    let sum = 0;
    for (let i=0;i<length;i+=4) sum = (sum+bytes.readUInt32LE(offset+i)) >>> 0;
    bytes.writeUInt16LE(((sum & 65535)+(sum >>> 16)) & 65535,offset+4086);
}
function partyOffset(bytes) {
    for (let p=14;p<28;p++) if (bytes.readUInt16LE(p*4096+4084)===1) return p*4096+572;
    throw new Error('Party section missing');
}

test('mint modifier changes the stat nature while retaining original nature and PID gender',()=>{
    const bytes = Buffer.from(sample), offset = partyOffset(bytes);
    // Gastly is Serious (12); XOR with 15 selects Adamant (3).
    bytes[offset+18] = (bytes[offset+18] & 7) | (15 << 3);
    repairSector(bytes,Math.floor(offset/4096));
    const mon = parse(bytes).party[0];
    assert.equal(mon.nature,'Adamant'); assert.equal(mon.originalNature,'Serious'); assert.equal(mon.gender,'M');
});

test('a corrupted populated Pokémon is skipped even when the sector checksum is valid',()=>{
    const bytes = Buffer.from(sample), offset = partyOffset(bytes);
    bytes[offset+32] ^= 1; repairSector(bytes,Math.floor(offset/4096));
    const r = parse(bytes);
    assert.equal(r.party.length,5); assert.equal(r.warnings[0].reason,'Pokémon checksum mismatch');
});

test('backup trainer data distinguishes random gender and fixed species gender and retains EV stat order',()=>{
    const context = {};
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../backups/heartandsoul.js'),'utf8'),context);
    const data = JSON.parse(JSON.stringify(context.backup_data));
    assert.equal(Object.keys(data.poks).length,1427);
    assert.equal(Object.keys(data.moves).length,934);
    // Locate Whitney by the source label rather than relying on an invented gender.
    const whitney = Object.entries(data.formatted_sets.Clefairy).find(([k])=>k.includes('Whitney'))[1];
    assert.equal(whitney.nature,'Hardy'); assert.equal(whitney.gender,'Random');
    assert.deepEqual(whitney.gender_options,['M','F']);
    assert.ok(Object.values(data.formatted_sets.Miltank).every(m=>m.gender==='F'));
    const lance = Object.values(data.formatted_sets.Dragonair).find(m=>m.tr_id===866);
    assert.equal(lance.nature,'Adamant');
    assert.deepEqual(lance.evs,{hp:252,at:0,df:0,sa:0,sd:6,sp:252});
    assert.equal(data.poks['Marill'].types.includes('Fairy'),true);
    assert.equal(data.moves.Surf.target,'allAdjacent');
});

test('Difficult Teams uses its own Pokémon data with the same save layout',()=>{
    for (const type of ['SaveBlock1','SaveBlock2','SaveBlock3','ChallengeSettings','PokemonStorage','BoxPokemon','Pokemon','PokemonSubstruct0','PokemonSubstruct1','PokemonSubstruct3']) {
        assert.deepEqual(difficultConstants.layout[type],constants.layout[type]);
    }
    const r = parse(sample,difficultConstants);
    assert.equal(r.detectedGame,'Heart & Soul Difficult Teams');
    assert.deepEqual(r.party.map(m=>m.species),parse(sample).party.map(m=>m.species));
    assert.deepEqual(r.warnings,[]);
    const context = {};
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../backups/heartandsouldifficult.js'),'utf8'),context);
    const data = JSON.parse(JSON.stringify(context.backup_data));
    assert.equal(data.title,'Heart & Soul Difficult Teams');
    assert.equal(data.poks.Pidgey.bs.sp,60);
    assert.equal(data.poks.Pidgey.abilities[1],'No Guard');
    assert.deepEqual(data.poks.Typhlosion.types,['Fire','Ground']);
    assert.equal(data.poks.Typhlosion.abilities[1],'Earth Eater');
    assert.deepEqual(data.poks.Feraligatr.types,['Water','Dark']);
    const sets = Object.values(data.formatted_sets).flatMap(Object.values);
    assert.equal(sets.length,2497);
    const falkner = sets.filter(m=>m.tr_id===402);
    assert.equal(falkner.length,6);
    assert.equal(falkner[0].nature,'Jolly');
    assert.ok(sets.some(m=>m.tr_id===403 && m.starting_field.tailwind));
    assert.ok(sets.some(m=>m.tr_id===426 && m.starting_field.terrain==='Electric'));
    assert.ok(sets.some(m=>m.tr_id===414 && m.weather==='Rain'));
});

test('variant save constants resolve a changed ability slot from encrypted Pokémon data',()=>{
    const bytes = Buffer.from(sample), offset = partyOffset(bytes);
    const pid = bytes.readUInt32LE(offset), key = (pid ^ bytes.readUInt32LE(offset+4)) >>> 0;
    const secure = Buffer.from(bytes.subarray(offset+32,offset+80));
    for (let i=0;i<48;i+=4) secure.writeUInt32LE((secure.readUInt32LE(i)^key)>>>0,i);
    const permutations = (values) => values.length ? values.flatMap(v=>permutations(values.filter(n=>n!==v)).map(p=>[v,...p])) : [[]];
    const order = permutations([0,1,2,3])[pid%24];
    const setField = (block,definition,value) => {
        for (let i=0;i<definition.width;i++) {
            const bit=definition.bit+i, pos=order.indexOf(block)*12+(bit>>>3), mask=1<<(bit&7);
            secure[pos]=(secure[pos]&~mask)|(((value>>>i)&1)?mask:0);
        }
    };
    const cyndaquil = Number(Object.keys(constants.species).find(id=>constants.species[id].name==='Cyndaquil'));
    setField(0,constants.layout.PokemonSubstruct0.species,cyndaquil);
    setField(3,constants.layout.PokemonSubstruct3.abilityNum,1);
    let sum=0;
    for (let i=0;i<48;i+=2) sum=(sum+secure.readUInt16LE(i))&65535;
    bytes.writeUInt16LE(sum,offset+constants.layout.BoxPokemon.checksum);
    for (let i=0;i<48;i+=4) bytes.writeUInt32LE((secure.readUInt32LE(i)^key)>>>0,offset+32+i);
    repairSector(bytes,Math.floor(offset/4096));
    assert.equal(parse(bytes).party[0].ability,'Blaze');
    assert.equal(parse(bytes,difficultConstants).party[0].ability,'Earth Eater');
});
