#!/usr/bin/env node
// Verify actual application import/navigation helpers without a browser/emulator.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('js/initialize.js');
const code=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const context={console:{log(){}},TITLE:'Photonic Sun/Prismatic Moon',gen:7,settings:{customPoks:true},
  cleanString:s=>s.normalize('NFKD').replace(/[^a-z0-9]/gi,'').toLowerCase()};
vm.runInNewContext(read('backups/pspm.js'),context);
context.poksData=context.backup_data.poks;
context.pokedex={Bulbasaur:{bs:{},abilities:{}},Arbok:{bs:{},abilities:{}}};
context.SPECIES_BY_ID={7:{bulbasaur:{name:'Bulbasaur'},arbok:{name:'Arbok'}}};
vm.runInNewContext(code('function toImportedBaseStats(', 'var PLATINUM_KAIZO_RECOIL_BY_ID'),context);
context.loadPoksData();
assert.equal(context.SPECIES_BY_ID[7].bulbasaur.weightkg,6.9);
assert.equal(context.SPECIES_BY_ID[7].bulbasaur.heightm,0.7);
assert.deepEqual(Array.from(context.SPECIES_BY_ID[7].arbok.types),['Poison','Dark']);
assert.equal(context.SPECIES_BY_ID[7].rockruffowntempo.baseSpecies,'Rockruff');
const dexCode=read('js/calc_ui/dex.js');
const nav={window:{location:{hostname:'localhost',port:'3001'}},URLSearchParams,TITLE:context.TITLE,cleanString:context.cleanString};
vm.runInNewContext(dexCode.slice(0,dexCode.indexOf('function normalizeDexRoute(')),nav);
assert.equal(nav.getDexFrameUrl('pokemon/arbok'),'http://localhost:3000/pokemon/arbok?embedded=1&game=photonicsun');
nav.window.location={hostname:'hzla.github.io',port:''};
assert.match(nav.getDexFrameUrl(''),/^https:\/\/ddex-chi.vercel.app\/\?embedded=1&game=photonicsun$/);
assert.match(context.backup_data.moves['Draining Kiss'].category,/Special/);
assert.equal(context.backup_data.moves['Return'].basePower,102);
assert.equal(context.backup_data.moves['Cosmic Power'].accuracy,true);
const trainerData=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):context.backup_data;
const navigation={setdex:trainerData.formatted_sets,npoint_data:{order:{}},TITLE:context.TITLE,partnerName:null};
const utility=read('js/calc_ui/utility_functions.js');
vm.runInNewContext(utility.slice(utility.indexOf('function stripTrainerLevelDuplicateMarkers('),utility.indexOf('function padArray(')),navigation);
const shared=read('js/shared_controls.js');
vm.runInNewContext(shared.slice(shared.indexOf('function getTrainerPreviewTrainerIdFromSet('),shared.indexOf('function getTrainerPreviewBattleType(')),navigation);
vm.runInNewContext(read('js/calc_ui/trainer_preview.js'),navigation);
navigation.TR_NAMES=navigation.get_trainer_names();
navigation.customLeads=navigation.get_custom_trainer_names();
const sizes={};
for(const sets of Object.values(trainerData.formatted_sets))for(const set of Object.values(sets)){
  (sizes[set.tr_id]??=new Set()).add(set.sub_index);
}
for(const [id,lead] of Object.entries(navigation.customLeads)){
  assert.ok(navigation.getTrainerName(lead),lead);
  const party=navigation.get_trainer_poks(lead).filter(x=>navigation.getTrainerPreviewTrainerIdFromSet(x)===Number(id));
  assert.ok(party.length>=sizes[id].size,`Trainer ${id} lost a party member`);
}
assert.equal(Object.keys(navigation.customLeads).length,Object.keys(sizes).length);
console.log(`Calculator imports, weights, forms, move metadata, Dex routes and ${Object.keys(sizes).length} trainer previews passed.`);
