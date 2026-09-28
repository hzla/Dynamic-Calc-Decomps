#!/usr/bin/env python3
"""Export an extracted SM/USUM RomFS and decompressed code.bin to Dynamic Calc and Ddex.

Python 3.10+, standard library only. Inputs are read-only. See README.md for scope.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import unicodedata
import rom_data as rom
from forms import FormNames, clean_name, TYPES
from evolutions import decode as decode_evolutions
import encounters

HERE=Path(__file__).resolve().parent
STAT_KEYS={'hp':'hp','atk':'at','def':'df','spa':'sa','spd':'sd','spe':'sp'}
TYPE_TUTORS=[520,519,518,338,307,308,434,620]
BEACH_TUTORS=[450,343,162,530,324,442,402,529,340,67,441,253,9,7,8,277,335,414,492,356,393,334,387,276,527,196,401,428,406,304,231,20,173,282,235,257,272,215,366,143,220,202,409,264,351,352,380,388,180,495,270,271,478,472,283,200,278,289,446,285,477,502,432,710,707,675,673]
TARGETS=['allAdjacent','adjacentAllyOrSelf','adjacentAlly','normal','allAdjacent','allAdjacentFoes','allies','self','all','randomNormal','all','foeSide','allySide','scripted']
FLAG_NAMES={0:'contact',1:'charge',2:'recharge',3:'protect',4:'reflectable',5:'snatch',6:'mirror',7:'punch',8:'sound',9:'gravity',10:'defrost',11:'distance',12:'heal',13:'authentic',14:'nonsky',15:'allyanim',16:'dance'}
KNOWN_CODE_SHA='5e6a0f74ff2cc601c2d1b0941c7886e9c0a5876f6b0adf7cfae9579dd6dc2174'


def norm(s):
    return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())


def write_json(path,data):
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')


def write_js(path,var,data):
    path.write_text(f'var {var} = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')


def signed(v): return v if v<128 else v-256


def mini(data):
    if data[:2]!=b'WD': raise ValueError('Expected WD move mini archive')
    count=rom.u16(data,2)
    offsets=struct.unpack_from('<'+'I'*(count+1),data,4)
    if offsets[-1]!=len(data): raise ValueError('Invalid WD move offsets')
    return [data[a:b] for a,b in zip(offsets,offsets[1:])]


def tm_list(code,game,config):
    if 'tm_moves' in config: return config['tm_moves']
    signature=bytes.fromhex('034003410342034303')
    pos=code.find(signature,0x400000)
    if pos<0 or code.find(signature,pos+1)>=0:
        raise ValueError('Cannot uniquely locate TM table; provide tm_moves in config')
    pos+=len(signature)+(0x22 if game=='usum' else 0)
    return list(struct.unpack_from('<100H',code,pos))


def decode_move(raw,name,number,description):
    if len(raw)!=40: raise ValueError(f'Move {number} is not a Gen 7 40-byte record')
    flags=rom.u32(raw,36)
    effect=rom.u16(raw,16)
    # The calculator represents these variable moves at their conventional power.
    calc_power={121:102,123:102,126:70}.get(effect,raw[3]) if raw[3]==1 else raw[3]
    calc=dict(name=name,num=number,type=TYPES[raw[0]],category=('Status','Physical','Special')[raw[2]],
        basePower=calc_power,pp=raw[5],accuracy=True if raw[4] in (0,101) else raw[4],priority=signed(raw[6]),target=TARGETS[raw[20]],
        critRatio=raw[14]+1,willCrit=raw[14]>=6,e_id=effect,zp=raw[32],
        flags={v: int(bool(flags&(1<<k))) for k,v in FLAG_NAMES.items()},
        makesContact=bool(flags&1),isPunch=bool(flags&(1<<7)),isSound=bool(flags&(1<<8)))
    lo,hi=raw[7]&15,raw[7]>>4
    calc['multihit']=lo if lo==hi and lo>1 else [lo,hi] if hi>1 else None
    fraction=signed(raw[18])
    calc['recoil']=[-fraction,100] if fraction<0 else None
    calc['drain']=[fraction,100] if fraction>0 else None
    dex=dict(name=name,num=number,t=calc['type'],bp=raw[3],cat=calc['category'],pp=raw[5],
             acc=calc['accuracy'],prio=calc['priority'],desc=description,e_id=effect)
    for key in ('flags','critRatio','willCrit','recoil','drain','multihit','target'):
        dex[key]=calc[key]
    return calc,dex


def trainer_outputs(teams,poks,canonical,config):
    sets={}; labels=config.get('trainer_labels',{})
    partners=config.get('partners',{})
    for team in teams:
        tid=team['id']; label=labels.get(str(tid),f"{team['trainer_class']} {team['name']} #{tid}")
        label=re.sub(r'[\[\]()]','',label)
        for q in team['pokemon']:
            name=canonical(q['showdown_species'],'species')
            if name not in poks: raise ValueError(f'Trainer {tid} uses an unexported species {name}')
            moves=[]
            for move in q['moves']:
                if norm(move)=='hiddenpower':
                    bits=sum((q['ivs'][k]&1)<<i for i,k in enumerate(('hp','atk','def','spe','spa','spd')))
                    move+=' '+TYPES[1+bits*15//63]
                moves.append(canonical(move,'moves'))
            value=dict(level=q['level'],nature=q['nature'],ability=q['ability'],moves=moves,
                evs={STAT_KEYS[k]:v for k,v in q['evs'].items()},ivs={STAT_KEYS[k]:v for k,v in q['ivs'].items()},
                tr_id=tid,sub_index=q['slot']-1)
            if q['item']: value['item']=clean_name(q['item'])
            if q['happiness']!=255: value['happiness']=q['happiness']
            if q['gender']: value['gender']=q['gender']
            if q['shiny']: value['shiny']=True
            if str(tid) in partners: value.update(partner=partners[str(tid)],battle_type='Doubles')
            elif team['battle_mode']=='Doubles': value['battle_type']='Doubles'
            per_species=sets.setdefault(name,{})
            duplicate=0
            key=f"Lvl {q['level']} {label}"
            while key in per_species:
                duplicate+=1
                key=f"Lvl {q['level']}{'*'*duplicate} {label}"
            per_species[key]=value
    ids=config.get('trainer_order',[t['id'] for t in teams])
    if len(ids)!=len(set(ids)): raise ValueError('trainer_order contains duplicate IDs')
    known={t['id'] for t in teams}
    if any(i not in known for i in ids): raise ValueError('trainer_order contains unknown IDs')
    order={str(i):dict(id=i,prev=ids[n-1] if n else None,next=ids[n+1] if n+1<len(ids) else None) for n,i in enumerate(ids)}
    return sets,order


def export(args):
    config=json.loads(args.config.read_text()) if args.config else {}
    paths=rom.archive_paths(args.game,config.get('archives'))
    tables,_,_,personal=rom.load(args.romfs,args.game,config.get('archives'))
    canonical_names=json.loads((HERE/'calc_names.json').read_text())
    def canonical(s,kind): return canonical_names.get(kind,{}).get(norm(s),clean_name(s))
    resolver=FormNames(config.get('forms'))
    rom.form_name=lambda species,form,base,item: (canonical(resolver(species,form,base,item)[0],'species'),resolver(species,form,base,item)[1])
    args.out.mkdir(parents=True,exist_ok=True)
    teams,counts=rom.export(args.romfs,args.out,args.title,args.game,config.get('archives'))
    code=args.code.read_bytes()
    code_sha=hashlib.sha256(code).hexdigest()
    tm=tm_list(code,args.game,config)
    if len(tm)!=100 or not all(0<i<len(tables['moves']) for i in tm): raise ValueError('Invalid TM move IDs')
    archives={k:rom.garc(args.romfs/paths[k]) for k in ('moves','levelup','evolutions','eggs')}
    texts=rom.garc(args.romfs/paths['text'],True)
    flavor_ids=([117,102,39] if args.game=='usum' else [112,97,35])
    flavors={key:rom.text_lines(texts[index],True) for key,index in zip(('moves','abilities','items'),flavor_ids)}
    names={}; indices={}; poks={}; dex_poks={}
    for species in range(1,rom.PROFILES[args.game]['max_species']+1):
        base=personal[species]
        for form in range(max(1,base[32])):
            name=canonical(resolver(species,form,tables['species'][species])[0],'species')
            index=rom.u16(base,28)+form-1 if form and rom.u16(base,28) else species
            names[(species,form)]=name; indices[(species,form)]=index
    for (species,form),name in names.items():
        index=indices[(species,form)]; raw=personal[index]
        if len(raw)!=84: raise ValueError(f'Personal {index} has unexpected size')
        bs=dict(zip(('hp','at','df','sp','sa','sd'),raw[:6]))
        types=list(dict.fromkeys(TYPES[i] for i in raw[6:8]))
        abilities=[clean_name(tables['abilities'][i]) for i in raw[24:27]]
        stats=dict(name=name,num=species,bs=bs,types=types,abilities=abilities,weightkg=rom.u16(raw,38)/10,
                   heightm=rom.u16(raw,36)/100)
        rows=archives['levelup'][index]
        if rows[-4:]!=b'\xff'*4: raise ValueError(f'Unterminated learnset {index}')
        learnset=[[level,canonical(tables['moves'][move],'moves')] for move,level in struct.iter_unpack('<HH',rows[:-4])]
        tm_moves=[canonical(tables['moves'][m],'moves') for n,m in enumerate(tm) if raw[40+n//8]&(1<<(n%8))]
        type_tutors=config.get('type_tutors',TYPE_TUTORS)
        beach_tutors=config.get('beach_tutors',BEACH_TUTORS if args.game=='usum' else [])
        tutors=[]
        for offset,ids in ((56,type_tutors),(60,beach_tutors)):
            tutors.extend(canonical(tables['moves'][m],'moves') for n,m in enumerate(ids) if raw[offset+n//8]&(1<<(n%8)))
        egg_index=species
        if form:
            start=rom.u16(archives['eggs'][species],0)
            if start!=species: egg_index=start+form-1
        egg=archives['eggs'][egg_index]
        egg_moves=[canonical(tables['moves'][rom.u16(egg,4+2*i)],'moves') for i in range(rom.u16(egg,2))]
        dex=dict(name=name,num=species,bs=bs,types=types,abs=abilities,
                 items=[clean_name(tables['items'][rom.u16(raw,x)]) if rom.u16(raw,x) else None for x in (12,14,16)],
                 catchRate=raw[8],heightm=stats['heightm'],weightkg=stats['weightkg'],
                 learnset_info=dict(learnset=learnset,tms=tm_moves,tutors=list(dict.fromkeys(tutors)),eggMoves=egg_moves))
        stats['learnset_info']=dex['learnset_info']
        base_name=names[(species,0)]
        if name!=base_name:
            stats.update(baseSpecies=base_name,forme=name.removeprefix(base_name+'-'))
            dex.update(baseSpecies=base_name,forme=stats['forme'])
        branches=decode_evolutions(archives['evolutions'][index],form,names,tables)
        if branches:
            dex.update(evos=[x['target'] for x in branches],evoMethods=[x['method'] for x in branches],
                       evoMethodIds=[x['method_id'] for x in branches],evoParams=[x['param'] for x in branches],
                       evoLevels=[x['level'] for x in branches])
        if name in poks:
            # Collapsed cosmetic forms must be mechanically identical.
            if poks[name]!=stats or dex_poks[name]!=dex:
                differences={k:(dex_poks[name].get(k),v) for k,v in dex.items() if dex_poks[name].get(k)!=v}
                raise ValueError(f'Forms sharing {name} differ mechanically; name {species}:{form} in config.forms: {differences}')
        else: poks[name]=stats; dex_poks[name]=dex
    for species in range(1,rom.PROFILES[args.game]['max_species']+1):
        all_names=list(dict.fromkeys(n for (s,_),n in names.items() if s==species))
        if len(all_names)>1:
            for collection in (poks,dex_poks):
                collection[all_names[0]].update(otherFormes=all_names[1:],formeOrder=all_names)
    calc_moves={};dex_moves={}
    for i,raw in enumerate(mini(archives['moves'][0])):
        if not i: continue
        name=canonical(tables['moves'][i],'moves')
        # Each generic Z-Move has separate physical and special records.
        # Keep both instead of silently replacing the first record.
        if name in calc_moves:
            name+=f" ({('Status','Physical','Special')[raw[2]]})"
        if name in calc_moves: raise ValueError(f'Duplicate move name {name}; needs an explicit mapping')
        c,d=decode_move(raw,name,i,flavors['moves'][i])
        calc_moves[name]=c;dex_moves[name]=d
    sets,order=trainer_outputs(teams,poks,canonical,config)
    backup=dict(title=args.title,poks=poks,moves=calc_moves,formatted_sets=sets)
    encounter_dex,raw_encounters,encounter_paths=encounters.export(args.romfs,args.game,texts,names,config)
    paths.update(encounter_paths)
    write_json(args.out/'encounters.raw.json',raw_encounters)
    dex=dict(poks=dex_poks,moves=dex_moves,abilities={},items={},encs=encounter_dex)
    for kind in ('abilities','items'):
        for i,name in enumerate(tables[kind]):
            if not i or name.startswith('[unused') or not name: continue
            desc=flavors[kind][i] if i<len(flavors[kind]) else ''
            if '[text variable]' in desc: desc=''
            dex[kind][norm(name)]=dict(name=clean_name(name),num=i,desc=desc)
    write_js(args.out/f'{args.slug}.js','backup_data',backup)
    write_json(args.out/f'{args.slug}.json',backup)
    write_js(args.out/f'{args.slug}.order.js','trainerOrders',order)
    write_js(args.out/f'{args.slug}.ddex.js','overrides',dex)
    write_json(args.out/f'{args.slug}.ddex.json',dex)
    manifest=dict(title=args.title,game=args.game,counts=counts|dict(species_forms=len(poks),moves=len(calc_moves),encounter_areas=len(encounter_dex)-1),
        code_sha256=code_sha,trainer_algorithm='USUM 1.2 TinyMT32, independent per party member',
        trainer_algorithm_verified_code=code_sha==KNOWN_CODE_SHA,
        sha256={k:hashlib.sha256((args.romfs/v).read_bytes()).hexdigest() for k,v in paths.items()},
        trainer_order_source='config' if 'trainer_order' in config else 'archive ID order (not story progression)',
        tutor_mapping_source='config or standard pk3DS Gen 7 tutor index lists',
        limitations=['Wild tables retain area/table numbers; terrain/script activation is not inferred. SOS/weather slots are retained in encounters.raw.json, not assigned unconditional encounter rates. Static/gift locations are not mapped.',
          'Story order and battle-script conditions are not extracted.',
          'Executable changes to ability/move/evolution mechanics require a separate code audit; table data does not establish custom effects.',
          'SM layouts are supported; this trainer-generation algorithm has only been verified against the supplied USUM 1.2 executable.',
          'Tutor move mapping defaults to pk3DS lists; configure replacements if the hack changes tutor assignments.'])
    write_json(args.out/'dynamic_calc_manifest.json',manifest)
    print(json.dumps(manifest['counts'],indent=2))


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--romfs',required=True,type=Path)
    parser.add_argument('--code',required=True,type=Path,help='Decompressed merged ExeFS code.bin (needed for TMs)')
    parser.add_argument('--game',choices=rom.PROFILES,default='usum')
    parser.add_argument('--title',required=True)
    parser.add_argument('--slug',required=True)
    parser.add_argument('--out',required=True,type=Path)
    parser.add_argument('--config',type=Path)
    args=parser.parse_args()
    if not re.fullmatch('[a-z0-9_-]+',args.slug): parser.error('--slug must be lowercase letters, digits, _ or -')
    export(args)

if __name__=='__main__': main()
