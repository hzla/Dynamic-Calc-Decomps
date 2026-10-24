"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
global.settings = { gen: 4, type_chart: 4, typeChart: 4, damageGen: 4, critGen: 4 };
global.TITLE = 'Platinum'; global.gameGen = 4; global.pokedex = {}; global.calcingForSwitchIns = false;
const calc = require('../../../calc'); global.typeChart = calc.TYPE_CHART[4];
const ai = require('./platinum_ai_preview_core');
const damage = require('./platinum_ai_damage');
const script = require('./platinum_ai_script');
const C = script.constants;
function pokemon(name = 'Mew', opts = {}) { return new calc.Pokemon(4, name, Object.assign({ level: 50, ability: 'No Ability', gender: 'M', nature: 'Serious' }, opts)); }
function input(names, extra = {}) {
  const a = extra.attacker || pokemon(); a.moves = names.map(name => new calc.Move(4, name));
  return Object.assign({ attacker: a, defender: pokemon(), field: new calc.Field(), aiMask: 7, defenderAbilities: ['No Ability'] }, extra, { attacker: a });
}
function evaluate(names, extra) { const r = ai.evaluate(input(names, extra)); assert.equal(r.supported, true, r.warnings.join(' ')); return r; }
const scores = m => m.outcomes.map(o => o.finalScore);
function info(name) { return ai._private.normalizeMoveData(new calc.Move(4, name), {}, 0); }
function estimate(name, extra = {}) { const i = input([name], extra); return damage.estimate(i, info(name)); }

test('community screenshot: Mach Punch +6 wins over Close Combat +4 at 60 HP', () => {
  const a = pokemon('Infernape', { level:38, ability:'Iron Fist', nature:'Hasty', item:'Life Orb', ivs:{hp:30,atk:30,def:30,spa:30,spd:30,spe:30} });
  const d = pokemon('Crawdaunt', { level:40, ability:'Adaptability', nature:'Careful', curHP:60, status:'slp', ivs:{hp:8,atk:0,def:30,spa:14,spd:25,spe:0}, item:'Sitrus Berry' });
  const r = evaluate(['Close Combat','Rock Slide','Fire Punch','Mach Punch'], { attacker:a, defender:d });
  assert.deepEqual(r.moves.map(m=>m.aiMaxDamage), [140,30,27,60]);
  assert.deepEqual(r.moves.map(scores), [[104],[99],[99],[106]]);
  assert.deepEqual(r.moves.map(m=>m.probability), [0,0,0,1]);
});
test('the +6 bonus tests PRIORITY_1 effect, not every move with positive priority', () => {
  const r=evaluate(['Mach Punch','Fake Out'], { aiMask:2, aiDamage:[200,200] });
  assert.deepEqual(r.moves.slice(0,2).map(scores), [[106],[104]]);
});
test('source risky and alternate-power lists control eligibility', () => {
  for (const name of ['Explosion','Dream Eater','Superpower','Eruption','Water Spout','Focus Punch','Sucker Punch','Hyper Beam','Solar Beam']) assert.equal(damage.eligible(info(name)),false,name);
  for (const name of ['Close Combat','Mach Punch','Hidden Power','Gyro Ball','Grass Knot','Night Shade']) assert.equal(damage.eligible(info(name)),true,name);
});
test('lower-damage branch ends the flag before quad-effective or risky bonuses', () => {
  const r=evaluate(['Tackle','Thunderbolt'], { aiMask:2, aiDamage:[10,20], aiEffectiveness:[160,40] });
  assert.deepEqual(scores(r.moves[0]),[99]);
  assert.deepEqual(scores(r.moves[1]),[100]);
});
test('Eval Attack only penalizes the three risky effects in its actual script', () => {
  const r=evaluate(['Explosion','Focus Punch','Sucker Punch','Hyper Beam'], { aiMask:2, aiEffectiveness:[40,40,40,40] });
  for (const m of r.moves.slice(0,3)) { assert.deepEqual(scores(m),[100,98]); assert.equal(m.outcomes[0].probability,51/256); }
  assert.deepEqual(scores(r.moves[3]),[100]);
});
test('quad effectiveness random threshold follows instructions, not incorrect source comment', () => {
  const r=evaluate(['Thunderbolt'], { aiMask:2, aiDamage:[1], aiEffectiveness:[160] });
  assert.equal(r.moves[0].outcomes.find(o=>o.finalScore===102).probability,176/256);
});
test('trainer flags beyond Basic/Evaluate/Expert are evaluated', () => {
  const first=evaluate(['Swords Dance','Tackle'],{aiMask:8,stateOverrides:{turnCount:0},aiDamage:[0,10]});
  assert.equal(first.moves[0].outcomes.find(o=>o.finalScore===102).probability,176/256);
  const later=evaluate(['Swords Dance','Tackle'],{aiMask:8,stateOverrides:{turnCount:1},aiDamage:[0,10]});
  assert.deepEqual(scores(later.moves[0]),[100]);
  assert.equal(later.moves[0].probability,.5);
});
test('Basic stat checks inspect the move-specific stat; Swords Dance is ATK_UP_2', () => {
  const attack=evaluate(['Swords Dance'], {aiMask:1,attacker:pokemon('Mew',{boosts:{atk:6}})});
  const defense=evaluate(['Swords Dance'], {aiMask:1,attacker:pokemon('Mew',{boosts:{def:6}})});
  assert.deepEqual(scores(attack.moves[0]),[90]); assert.deepEqual(scores(defense.moves[0]),[100]);
});
test('Basic Explosion checks living reserves, not user HP', () => {
  const reserves=evaluate(['Explosion'], {aiMask:1,attacker:pokemon('Mew',{curHP:1}),stateOverrides:{attackerReserveCount:1}});
  const last=evaluate(['Explosion'], {aiMask:1,stateOverrides:{attackerReserveCount:0,defenderReserveCount:1}});
  assert.deepEqual(scores(reserves.moves[0]),[100]); assert.deepEqual(scores(last.moves[0]),[90]);
});
test('Expert Close Combat uses speed and precise HP boundaries', () => {
  const full=evaluate(['Close Combat'],{aiMask:4,aiEffectiveness:[40],stateOverrides:{speedCompare:0}});
  const low=evaluate(['Close Combat'],{aiMask:4,attacker:pokemon('Mew',{curHP:100}),aiEffectiveness:[40],stateOverrides:{speedCompare:0}});
  assert.deepEqual(scores(full.moves[0]),[100]); assert.deepEqual(scores(low.moves[0]),[99]);
});
test('unknown ability loads branch between species abilities instead of reading selected ability', () => {
  const r=evaluate(['Thunderbolt'], {aiMask:1,aiEffectiveness:[40],aiDamage:[20],defenderAbilities:['Volt Absorb','Illuminate']});
  assert.equal(r.moves[0].outcomes.find(o=>o.finalScore===88).probability,.5);
  assert.equal(r.moves[0].outcomes.find(o=>o.finalScore===100).probability,.5);
});
test('unavailable history and unsupported flags suppress all percentages', () => {
  for (const extra of [{aiMask:8},{aiMask:128},{aiMask:null}]) {
    const r=ai.evaluate(input(['Swords Dance'],extra)); assert.equal(r.supported,false); assert.ok(r.warnings.length); assert.ok(r.moves.every(m=>m.probability===null));
  }
  const r=ai.evaluate(input(['Fake Out'])); assert.equal(r.supported,false); assert.match(r.warnings[0],/first turn/);
});
test('zero PP stops scoring; invalid moves start at zero but still run scripts', () => {
  const r=evaluate(['Mach Punch','Tackle'],{aiMask:2,aiDamage:[200,200],stateOverrides:{attackerPP:[0,10]}});
  assert.deepEqual(scores(r.moves[0]),[0]); assert.equal(r.moves[0].probability,0);
  const locked=evaluate(['Mach Punch','Tackle'],{aiMask:2,aiDamage:[200,200],stateOverrides:{invalidMoveMask:1}});
  assert.deepEqual(scores(locked.moves[0]),[6]); assert.equal(locked.moves[0].probability,0);
});
test('HP percentages call curHP() and preserve zero', () => {
  assert.equal(ai._private.hpPercent({curHP:()=>50,maxHP:()=>100}),50);
  assert.equal(ai._private.hpPercent({originalCurHP:0,curHP:99,maxHP:100}),0);
});
test('probability convolution agrees with exhaustive independent score-path enumeration', () => {
  for (let n=1;n<=4;n++) {
    const moves=Array.from({length:n},(_,i)=>({valid:true,outcomes:[{finalScore:99+i%2,probability:.2},{finalScore:100+i%2,probability:.3},{finalScore:102,probability:.5}]}));
    ai._private.selectionProbabilities(moves);
    const expected=Array(n).fill(0);
    const visit=(picked,p)=>{if(picked.length===n){const max=Math.max(...picked),win=picked.map((s,i)=>s===max?i:-1).filter(i=>i>=0);win.forEach(i=>expected[i]+=p/win.length);return;} for(const o of moves[picked.length].outcomes)visit([...picked,o.finalScore],p*o.probability);}; visit([],1);
    moves.forEach((m,i)=>assert.ok(Math.abs(m.probability-expected[i])<1e-12));
    assert.ok(Math.abs(moves.reduce((s,m)=>s+m.probability,0)-1)<1e-12);
  }
});
test('work limit never drops probability mass and displays a partial result as exact', () => {
  const r=ai.evaluate(input(['Thunderbolt'],{aiMask:2,aiDamage:[1],aiEffectiveness:[160],options:{branchCap:1}}));
  assert.equal(r.supported,false); assert.match(r.warnings[0],/work limit/); assert.equal(r.moves[0].probability,null);
});
test('AI damage excludes Life Orb, resist berries, Protect and critical-hit checkboxes', () => {
  const base=estimate('Flamethrower');
  assert.equal(estimate('Flamethrower',{attacker:pokemon('Mew',{item:'Life Orb'}),defender:pokemon('Mew',{item:'Occa Berry'}),field:new calc.Field({defenderSide:{isProtected:true}})}),base);
  const i=input(['Flamethrower']);i.attacker.moves[0].isCrit=true; assert.equal(damage.estimate(i,info('Flamethrower')),base);
});
test('AI damage keeps living attacker HP, boosts, Flower Gift and Flash Fire state', () => {
  assert.ok(estimate('Bite',{attacker:pokemon('Mew',{boosts:{atk:2}})})>estimate('Bite'));
  assert.ok(estimate('Ember',{attacker:pokemon('Mew',{ability:'Blaze',curHP:1})})>estimate('Ember',{attacker:pokemon('Mew',{ability:'Blaze'})}));
  assert.ok(estimate('Bite',{attacker:pokemon('Mew',{ability:'Flower Gift'}),field:new calc.Field({weather:'Sun'})})>estimate('Bite',{field:new calc.Field({weather:'Sun'})}));
  assert.ok(estimate('Ember',{attacker:pokemon('Mew',{ability:'Flash Fire',abilityOn:true})})>estimate('Ember',{attacker:pokemon('Mew',{ability:'Flash Fire',abilityOn:false})}));
});
test('AI damage does not simulate entry abilities or truncate to a byte', () => {
  assert.equal(estimate('Bite',{defender:pokemon('Mew',{ability:'Intimidate'})}),estimate('Bite'));
  const hit=estimate('Explosion',{attacker:pokemon('Mew',{level:100,boosts:{atk:6}})}); assert.ok(hit>255);
});
test('AI fixed damage applies immunities without STAB or effectiveness multipliers', () => {
  assert.equal(estimate('Seismic Toss',{attacker:pokemon('Machamp'),defender:pokemon('Blissey')}),50);
  assert.equal(estimate('Seismic Toss',{defender:pokemon('Gengar')}),0);
});
test('conditional moves retain table power, multihit is one hit, and Weather Ball differs between damage and type probe', () => {
  assert.equal(estimate('Payback'),estimate('Payback',{defender:pokemon('Mew',{boosts:{spe:6}})}));
  const i=input(['Triple Kick']);i.attacker.moves[0].hits=3; assert.equal(damage.estimate(i,info('Triple Kick')),estimate('Triple Kick'));
  const rain=input(['Weather Ball'],{field:new calc.Field({weather:'Rain'}),defender:pokemon('Charmander')});
  assert.equal(damage.estimate(rain,info('Weather Ball')),damage.estimate({...rain,field:new calc.Field()},info('Weather Ball')));
  assert.equal(damage.estimate(rain,info('Weather Ball'),40),80);
});
test('weight boundaries use source inclusive hectogram thresholds', () => {
  const lo=estimate('Grass Knot',{defender:pokemon('Mew',{overrides:{weightkg:10}})}); const hi=estimate('Grass Knot',{defender:pokemon('Mew',{overrides:{weightkg:10.1}})}); assert.ok(hi>lo);
});
test('Platinum speed uses Simple, raw speed-halving items despite Klutz, and no item for Unburden', () => {
  const f=new calc.Field(), d=pokemon(), a=pokemon('Mew',{ability:'Simple',boosts:{spe:1}});
  assert.equal(damage.speed(a,d,f,f.attackerSide),a.rawStats.spe*2);
  a.ability='Klutz';a.item='Iron Ball';a.boosts.spe=0; assert.equal(damage.speed(a,d,f,f.attackerSide),Math.floor(a.rawStats.spe/2));
  a.ability='Unburden';a.abilityOn=true; assert.equal(damage.speed(a,d,f,f.attackerSide),Math.floor(a.rawStats.spe/2));
  a.item=''; assert.equal(damage.speed(a,d,f,f.attackerSide),a.rawStats.spe*2);
});
test('Quick Claw speed checks need cached activation, rather than rolling anew per move', () => {
  const r=ai.evaluate(input(['Close Combat'],{attacker:pokemon('Mew',{item:'Quick Claw'}),aiEffectiveness:[40]}));
  assert.equal(r.supported,false); assert.match(r.warnings[0],/Quick Claw activated/);
});
test('generated script contains every entry point, all valid jumps, and source provenance', () => {
  assert.equal(script.flags.length,32); assert.equal(script.code.length,3581); assert.equal(script.sourceCommit.length,40);
  for(const [op,args,label,line] of script.code){assert.ok(script.labels[label]!==undefined);assert.ok(line>0);for(const a of args)if(typeof a==='string')assert.ok(script.labels[a]!==undefined,op+' '+a);}
  const content=fs.readFileSync(path.join(__dirname,'platinum_ai_script.js'),'utf8');assert.match(content,/Generated by tools\/ai/);
});

test('modern move spellings resolve to the correct Platinum move IDs', () => {
  for (const name of ['High Jump Kick','Vise Grip','Feint Attack','Smelling Salts']) assert.ok(info(name).moveId,name);
});
test('score arithmetic uses signed bytes before clamping negative values', () => {
  const states=ai._private.runFlag([{score:126,temp:0,probability:1,trace:[],stack:[]}], 'EvalAttack_ScorePlus4', {}, [], {}, 20);
  assert.equal(states[0].score,0);
});
test('Gravity, Disable, Taunt, Encore, and Choice locks affect initial scores', () => {
  const disabled=evaluate(['Tackle','Bite'],{aiMask:0,stateOverrides:{attackerDisabledMove:'Tackle'}});
  assert.deepEqual(disabled.moves.slice(0,2).map(scores),[[0],[100]]);
  const gravity=evaluate(['High Jump Kick','Tackle'],{aiMask:0,field:new calc.Field({isGravity:true})});
  assert.equal(gravity.moves[0].probability,0);
  const taunt=evaluate(['Swords Dance','Tackle'],{aiMask:0,stateOverrides:{attackerTaunted:true}});
  assert.equal(taunt.moves[0].probability,0);
  const encore=evaluate(['Tackle','Bite'],{aiMask:0,stateOverrides:{attackerEncoredMove:'Bite'}});
  assert.equal(encore.moves[0].probability,0);
  const choice=evaluate(['Tackle','Bite'],{aiMask:0,attacker:pokemon('Mew',{item:'Choice Band'}),stateOverrides:{attackerChoiceLockedMove:'Bite'}});
  assert.equal(choice.moves[0].probability,0);
  const unknown=ai.evaluate(input(['Tackle','Bite'],{aiMask:0,attacker:pokemon('Mew',{item:'Choice Band'})}));
  assert.equal(unknown.supported,false);
});
test('Fling scoring checks raw item fling power even with Klutz, but respects Embargo', () => {
  const klutz=evaluate(['Fling'],{aiMask:4,attacker:pokemon('Mew',{ability:'Klutz',item:'Iron Ball'}),aiEffectiveness:[40]});
  assert.ok(scores(klutz.moves[0]).includes(102));
  const embargo=evaluate(['Fling'],{aiMask:4,attacker:pokemon('Mew',{item:'Iron Ball'}),aiEffectiveness:[40],stateOverrides:{damageState:{attackerEmbargo:true}}});
  assert.deepEqual(scores(embargo.moves[0]),[98]);
});
test('all unusable moves report forced Struggle instead of inventing normal move chances', () => {
  const r=ai.evaluate(input(['Tackle'],{stateOverrides:{attackerPP:[0]}}));
  assert.equal(r.supported,false);assert.match(r.warnings[0],/Struggle/);
});
test('undefined clear-weather Weather Ball typing is an explicit coverage boundary', () => {
  const i=input(['Weather Ball']);assert.throws(()=>damage.estimate(i,info('Weather Ball'),40),/undefined/);
});

function context(i) { const ms=i.attacker.moves.map((m,n)=>ai._private.normalizeMoveData(m,i.moveTable,n)); return [ai._private.makeContext(i,ms,new Set()),ms]; }
function reserve(extra={}) { return Object.assign({name:'Blissey',hp:100,maxHP:100,status:'',moves:['Tackle'],ivs:{hp:31,atk:31,def:31,spe:31,spa:31,spd:31},item:'',ability:'No Ability',pp:[10,0,0,0],maxPP:[10,0,0,0]},extra); }
function opcode(op,args,ctx,move={},moves=[]) {
  const start=script.code.length;
  script.labels.TestCommand=start;script.labels.TestYes=start+2;
  script.code.push([op,args.concat('TestYes'),'TestCommand',0],['PopOrEnd',[],'TestCommand',0],['AddToMoveScore',[1],'TestYes',0],['PopOrEnd',[],'TestYes',0]);
  try { return ai._private.runFlag([{score:0,temp:0,probability:1,trace:[],stack:[]}],'TestCommand',move,moves,ctx,8192).reduce((p,s)=>p+(s.score===1?s.probability:0),0); }
  finally {script.code.length=start;delete script.labels.TestCommand;delete script.labels.TestYes;}
}
test('Psywave enumerates all 11 fresh draws, including modulo bias and immunity',()=>{
  const i=input(['Psywave']); const rows=damage.distribution(i,info('Psywave'));
  assert.deepEqual(rows.map(r=>r[0]),[25,30,35,40,45,50,55,60,65,70,75]);
  assert.equal(rows.reduce((p,r)=>p+r[1],0),1);
  assert.equal(rows[0][1],5958/65536);assert.equal(rows[10][1],5957/65536);
  assert.deepEqual(damage.distribution({...i,defender:pokemon('Umbreon')},info('Psywave')),[[0,1]]);
});
test('Psywave KO and highest-damage commands draw again, instead of caching a sampled value',()=>{
  const r=evaluate(['Psywave','Seismic Toss'],{aiMask:2,defender:pokemon('Mew',{curHP:50})});
  const p=damage.distribution(input(['Psywave']),info('Psywave')).filter(r=>r[0]>=50).reduce((s,r)=>s+r[1],0);
  const rows=r.moves[0].outcomes;
  assert.ok(Math.abs(rows.find(o=>o.finalScore===104).probability-p)<1e-12);
  assert.ok(Math.abs(rows.find(o=>o.finalScore===100).probability-(1-p)*p)<1e-12);
  assert.ok(Math.abs(rows.find(o=>o.finalScore===99).probability-(1-p)*(1-p))<1e-12);
  assert.ok(Math.abs(r.moves[0].probability-p/2)<1e-12);
  assert.equal(r.moves[0].aiMaxDamage,75);
});
test('highest-damage comparisons reuse the current draw within the same four-move vector',()=>{
  const [ctx,moves]=context(input(['Psywave','Psywave']));
  const rows=damage.distribution(input(['Psywave']),info('Psywave'));
  const expected=rows.reduce((p,a)=>p+a[1]*rows.filter(b=>b[0]<=a[0]).reduce((s,b)=>s+b[1],0),0);
  assert.equal(ctx.highest(moves[0],false),expected);
});
test('Magnitude draws only through direct CalcDamage; native power 1 excludes it from CalcAllDamage',()=>{
  const i=input(['Magnitude']);const rows=damage.distribution(i,info('Magnitude'));
  assert.equal(rows.length,7);assert.equal(rows.reduce((p,r)=>p+r[1],0),1);
  assert.equal(rows[0][1],damage.residueProbability(100,0,5));
  assert.equal(rows[3][1],damage.residueProbability(100,35,65));
  assert.equal(damage.eligible(info('Magnitude')),false);
  assert.deepEqual(damage.distribution({...i,defender:pokemon('Pidgeot')},info('Magnitude')),[[0,1]]);
});
test('party status checks exclude fainted/egg reserves; NotStatus means any healthy reserve',()=>{
  const i=input(['Heal Bell'],{stateOverrides:{attackerParty:[reserve({status:'psn',hp:0}),reserve({status:'psn',isEgg:true}),reserve()]}});
  let [ctx]=context(i);
  assert.equal(opcode('IfPartyMemberStatus',[1,C.MON_CONDITION_POISON],ctx),0);
  assert.equal(opcode('IfPartyMemberNotStatus',[1,C.MON_CONDITION_POISON],ctx),1);
  i.stateOverrides.attackerParty.push(reserve({status:'psn'}));[ctx]=context(i);
  assert.equal(opcode('IfPartyMemberStatus',[1,C.MON_CONDITION_POISON],ctx),1);
  assert.equal(opcode('IfPartyMemberNotStatus',[1,C.MON_CONDITION_POISON],ctx),1);
});
test('healing and PP predicates include fainted reserves, matching the source loops',()=>{
  const [ctx]=context(input(['Lunar Dance'],{stateOverrides:{attackerParty:[reserve({hp:0,pp:[9,0,0,0]})]}}));
  assert.equal(opcode('IfAnyPartyMemberIsWounded',[1],ctx),1);
  assert.equal(opcode('IfAnyPartyMemberUsedPP',[1],ctx),1);
  const [full]=context(input(['Lunar Dance'],{stateOverrides:{attackerParty:[reserve()]}}));
  assert.equal(opcode('IfAnyPartyMemberIsWounded',[1],full),0);
  assert.equal(opcode('IfAnyPartyMemberUsedPP',[1],full),0);
});
test('party comparisons use active stats and active ordinary items, but reserve Hidden Power IVs',()=>{
  const i=input(['Tackle'],{attacker:pokemon('Machamp',{boosts:{atk:6},item:'Choice Band'}),stateOverrides:{attackerParty:[reserve({moves:['Body Slam']})]}});
  const [ctx]=context(i);assert.equal(ctx.partyMore(false),1);
  const body=info('Body Slam');const base=damage.distribution(i,body,{metadata:reserve({item:'Choice Specs',ability:'Huge Power'})});
  assert.deepEqual(base,damage.distribution(i,body,{metadata:reserve({item:'',ability:'No Ability'})}));
  const hidden=info('Hidden Power');
  assert.notDeepEqual(damage.distribution(i,hidden,{metadata:reserve()}),damage.distribution(i,hidden,{metadata:reserve({ivs:{hp:0,atk:0,def:0,spe:0,spa:0,spd:0}})}));
});
test('party comparison retains the active random max draw across all reserves',()=>{
  const i=input(['Psywave'],{stateOverrides:{attackerParty:[reserve({moves:['Seismic Toss']}),reserve({moves:['Seismic Toss']})]}});
  const [ctx]=context(i), rows=damage.distribution(i,info('Psywave'));
  const p=rows.filter(r=>r[0]<50).reduce((s,r)=>s+r[1],0);
  assert.equal(ctx.partyMore(false),p);
});
test('Me First and Copycat compare the player previous move against the player itself',()=>{
  const i=input(['Tackle'],{attacker:pokemon('Magikarp'),defender:pokemon('Machamp'),stateOverrides:{defenderPreviousMove:'Psychic'}});
  const [ctx]=context(i);
  const own=damage.distribution({...i,attacker:i.defender},info('Psychic'))[0][0];
  assert.deepEqual(ctx.distribution(info('Psychic'),false,null,0),[[own,1]]);
  assert.equal(ctx.battlerMore(0,false,0),1);
  i.stateOverrides.defenderPreviousMove='Magnitude';assert.doesNotThrow(()=>context(i)[0].battlerMore(0,false,0));
});
test('super-effective predicate uses native flags, respects switching, and includes excluded risky moves',()=>{
  const i=input(['Hyper Beam'],{defender:pokemon('Mew',{overrides:{types:['Normal']}})});
  let [ctx]=context(i);assert.equal(ctx.hasSuperEffective(),false);
  const j=input(['Solar Beam'],{defender:pokemon('Squirtle')});[ctx]=context(j);assert.equal(ctx.hasSuperEffective(),true);
  j.stateOverrides={defenderSwitching:true};assert.equal(context(j)[0].hasSuperEffective(),false);
  assert.equal(context(input(['Thunder Wave'],{defender:pokemon('Squirtle')}))[0].hasSuperEffective(),false);
});
test('Quick Claw activation is shared across move scores before selection probabilities are combined',()=>{
  const i=input(['Close Combat','Payback','Tackle'],{aiMask:4,attacker:pokemon('Mew',{item:'Quick Claw',curHP:120,boosts:{spe:-3}}),stateOverrides:{attackerQuickClawActivated:'auto'},aiEffectiveness:[40,40,40]});
  const average=ai.evaluate(i),on=ai.evaluate({...i,stateOverrides:{attackerQuickClawActivated:true}}),off=ai.evaluate({...i,stateOverrides:{attackerQuickClawActivated:false}});
  assert.equal(average.supported,true,average.warnings.join(' '));
  const p=damage.residueProbability(100,0,20);
  average.moves.forEach((m,n)=>assert.ok(Math.abs(m.probability-(on.moves[n].probability*p+off.moves[n].probability*(1-p)))<1e-12));
  assert.notDeepEqual(on.moves.map(m=>m.probability),off.moves.map(m=>m.probability));
});
test('blank previous move has the native MOVE_NONE metadata and CalcDamage result',()=>{
  const i=input(['Tackle'],{stateOverrides:{defenderPreviousMove:''}});const [ctx]=context(i);
  assert.equal(ctx.moveData(0).category,'Physical');assert.equal(ctx.moveData(0).basePower,0);assert.equal(ctx.moveData(0).type,'Normal');
  assert.deepEqual(ctx.distribution(ai._private.normalizeMoveData('',{},0),false,null,0),[[2,1]]);
});
test('stored 85–100 damage rolls remain shared between KO and highest-damage checks',()=>{
  // The stock singles script passes FALSE; exercise the opcode's TRUE mode as
  // well, so support cannot accidentally sample anew on each comparison.
  const changed=script.code.filter(i=>['IfCurrentMoveKills','IfCurrentMoveDoesNotKill','FlagMoveDamageScore'].includes(i[0])).map(i=>[i,i[1][0]]);
  changed.forEach(([i])=>i[1][0]=1);
  try {
    const r=evaluate(['Tackle','Bite'],{aiMask:2,aiDamage:[50,47],aiEffectiveness:[40,40],defender:pokemon('Mew',{curHP:46})});
    let expected=[0,0];
    for(let a=85;a<=100;a++)for(let b=85;b<=100;b++){
      const d=[Math.floor(50*a/100),Math.floor(47*b/100)];
      const s=d.map((hit,i)=>hit>=46?104:hit>=d[1-i]?100:99);
      if(s[0]===s[1]){expected[0]+=.5/256;expected[1]+=.5/256;}
      else expected[s[0]>s[1]?0:1]+=1/256;
    }
    r.moves.slice(0,2).forEach((m,i)=>assert.ok(Math.abs(m.probability-expected[i])<1e-12));
  } finally {changed.forEach(([i,old])=>i[1][0]=old);}
});
test('first-turn defensive rules can read native MOVE_NONE metadata even with empty move slots',()=>{
  for(const name of ['Counter','Mirror Coat','Amnesia','Disable','Encore','Metal Burst']) {
    const r=evaluate([name,'Tackle'],{aiMask:7,stateOverrides:{defenderPreviousMove:'',defenderKnownMoves:[],defenderKnownItem:'',attackerFirstTurn:true,attackerTurnsActive:0}});
    assert.ok(Math.abs(r.moves.reduce((sum,m)=>sum+m.probability,0)-1)<1e-10,name);
  }
});
