#!/usr/bin/env python3
"""Export Heart & Soul's compiled source tables to Dynamic Calc and save constants."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import unicodedata
import zlib
from layout import Elf, probe, bits

HERE = Path(__file__).resolve().parent
NATURES = 'Hardy Lonely Brave Adamant Naughty Bold Docile Relaxed Impish Lax Timid Hasty Serious Jolly Naive Modest Mild Quiet Bashful Rash Calm Gentle Sassy Careful Quirky'.split()
TYPES = ['None', 'Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel', '???', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark', 'Fairy', 'Stellar']
STATS = ['hp', 'at', 'df', 'sp', 'sa', 'sd']


def norm(s):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')


def write_js(path, variable, value):
    path.write_text('var '+variable+' = '+json.dumps(value, ensure_ascii=False, indent=2)+';\n')


def u16(b, n): return struct.unpack_from('<H', b, n)[0]
def u32(b, n): return struct.unpack_from('<I', b, n)[0]


def charmap(source):
    result = {}
    for line in (source/'charmap.txt').read_text().splitlines():
        m = re.match(r"'(.+)'\s*=\s*([0-9A-F]{2})(?:\s|$)", line)
        if m:
            value = m[1]
            if value.startswith('\\'):
                value = ' ' if value in ['\\n', '\\l', '\\p'] else value[1:]
            result.setdefault(int(m[2], 16), value)
    return result


class Tables:
    def __init__(self, source, elf, compiler):
        self.layout = probe(source, compiler)
        self.elf = Elf(elf)
        self.chars = charmap(source)
        self.canonical_names = json.loads((HERE.parent/'gen7/calc_names.json').read_text())

    def text(self, raw):
        out = []
        for b in raw:
            if b == 255: break
            out.append(self.chars.get(b, ''))
        return re.sub(r'\s+', ' ', ''.join(out)).strip()

    def pointer(self, address, size=2048):
        if not address: return b''
        for section in self.elf.sections:
            if section[3] <= address < section[3]+section[5] and section[1] != 8:
                offset = section[4]+address-section[3]
                return self.elf.data[offset:offset+size]
        raise ValueError(f'Invalid ROM pointer {address:08x}')

    def name(self, text, kind):
        return self.canonical_names.get(kind, {}).get(norm(text), text.title())

    def records(self, name, typ):
        raw = self.elf.read(name)
        size = self.layout[typ]['size']
        assert len(raw) % size == 0
        return [raw[i:i+size] for i in range(0, len(raw), size)]

    def learnset(self, address):
        raw = self.pointer(address, 4096)
        result = []
        for pos in range(0, len(raw), 4):
            move, level = struct.unpack_from('<HH', raw, pos)
            if move == 65535: return result
            result.append([level, move])
        if address: raise ValueError('Unterminated level-up learnset')
        return result


def gender_for(ratio, pid):
    if ratio == 255: return 'N'
    if ratio == 254: return 'F'
    if ratio == 0: return 'M'
    return 'F' if (pid & 255) < ratio else 'M'


def trainer_gender(raw, trainer, ratio, layout):
    # GeneratePartyHash is CRC32 of the ARM TrainerMon, including pointer bytes.
    h = zlib.crc32(raw)
    start = 128 if bits(trainer, layout['Trainer']['battleType']) else (120 if bits(trainer, layout['Trainer']['gender']) else 136)
    mode = bits(raw, layout['TrainerMon']['gender'])
    choices = [1, 2] if mode == 3 else [mode]
    genders = []
    personalities = []
    nature = bits(raw, layout['TrainerMon']['nature'])
    for choice in choices:
        low = start
        if choice == 1: low = (255-ratio)//2+ratio
        elif choice == 2: low = ratio//2
        pid = ((h << 8)+low) & 0xffffffff
        diff = abs(pid % 25-nature)
        sign = 1 if pid % 25 > nature else -1
        if diff > 12: diff = 25-diff; sign *= -1
        pid = (pid-diff*sign) & 0xffffffff
        personalities.append(pid)
        genders.append(gender_for(ratio, pid))
    genders = list(dict.fromkeys(genders))
    return (genders[0] if len(genders) == 1 else 'Random'), genders, mode, personalities


def export(args):
    source = args.source.resolve()
    args.out.mkdir(parents=True, exist_ok=True)
    t = Tables(source, args.elf, args.compiler)
    l = t.layout
    c = l['constants']
    species_defines = {int(m[2]):m[1] for m in re.finditer(r'^#define (SPECIES_\w+)\s+(\d+)\s*$', (source/'include/constants/species.h').read_text(), re.M)}
    trainer_defines = {int(m[2]):m[1] for m in re.finditer(r'^#define (TRAINER_\w+_HNS)\s+(\d+)\s*$', (source/'include/constants/opponents_hns.h').read_text(), re.M)}
    engine_names = json.loads(subprocess.check_output(['node','-e',
        "const c=require('./calc'); console.log(JSON.stringify({abilities:c.ABILITIES[8],items:c.ITEMS[8]}));"],cwd=HERE.parent.parent,text=True))
    def engine_name(name,kind):
        matches = {norm(n):n for n in engine_names[kind]}
        return matches.get(norm(name),name.title())
    abilities = [engine_name(t.text(raw[:l['AbilityInfo']['description']]),'abilities') for raw in t.records('gAbilitiesInfo', 'AbilityInfo')]
    items = [engine_name(t.text(t.pointer(u32(raw, l['ItemInfo']['name']))),'items') for raw in t.records('gItemsInfo', 'ItemInfo')]
    legendary_raw = t.elf.read('sLegendaryCustomAbilities')
    legendary = {str(u16(legendary_raw,i)):abilities[u16(legendary_raw,i+2)] for i in range(0,len(legendary_raw),4)}
    moves = {}; move_names = []
    for i, raw in enumerate(t.records('gMovesInfo', 'MoveInfo')):
        name = t.name(t.text(t.pointer(u32(raw, l['MoveInfo']['name']))), 'moves') if i else '(No Move)'
        if i and name in moves:
            name += f" ({['Physical','Special','Status'][bits(raw,l['MoveInfo']['category'])]})"
        assert name not in moves
        move_names.append(name)
        if not i: continue
        fields = {k:bits(raw,v) for k,v in l['MoveInfo'].items() if isinstance(v,dict)}
        priority = fields['priority']; priority = priority-16 if priority >= 8 else priority
        flags = {}
        for field, key in dict(makesContact='contact', punchingMove='punch', bitingMove='bite', pulseMove='pulse', soundMove='sound', ballisticMove='bullet', powderMove='powder', danceMove='dance', windMove='wind', slicingMove='slicing').items():
            if fields[field]: flags[key] = 1
        if not fields['ignoresProtect']: flags['protect'] = 1
        if fields['magicCoatAffected']: flags['reflectable'] = 1
        if fields['snatchAffected']: flags['snatch'] = 1
        value = dict(name=name, num=i, basePower=fields['power'], type=TYPES[fields['type']], category=['Physical','Special','Status'][fields['category']], pp=raw[l['MoveInfo']['pp']], accuracy=fields['accuracy'] or True, priority=priority, flags=flags, effect=u16(raw,l['MoveInfo']['effect']), desc=t.text(t.pointer(u32(raw,l['MoveInfo']['description']))))
        target = fields['target']
        if target == c['TARGET_BOTH']: value['target'] = 'allAdjacentFoes'
        elif target == c['TARGET_FOES_AND_ALLY']: value['target'] = 'allAdjacent'
        elif target == c['TARGET_USER']: value['target'] = 'self'
        else: value['target'] = 'normal'
        if fields['multiHit']: value['multihit'] = [2,5]
        elif fields['strikeCount'] > 1: value['multihit'] = fields['strikeCount']
        if fields['alwaysCriticalHit']: value['willCrit'] = True
        if fields['ignoresTargetDefenseEvasionStages']: value['ignoreDefensive'] = True
        if fields['ignoresSubstitute']: value['bypasssub'] = True
        moves[name] = value
    poks = {}; species_names = [None]*c['NUM_SPECIES']; species = {}; growths = [0]*c['NUM_SPECIES']
    gen3_pointers = t.elf.read('gLevelUpLearnsets_Gen3')
    for i, raw in enumerate(t.records('gSpeciesInfo', 'SpeciesInfo')):
        if not i or not raw[0]: continue
        define = species_defines[i]
        token = define.removeprefix('SPECIES_').replace('_', '-')
        name = t.name(token, 'species')
        # Distinct forms must never overwrite one another, including cosmetics.
        species_names[i] = name
        assert name not in poks, f'Duplicate species name: {define} -> {name}'
        o = l['SpeciesInfo']
        ab_ids = list(struct.unpack_from('<HHH',raw,o['abilities']))
        ab = {k:abilities[v] for k,v in zip(['0','1','H'], ab_ids) if v}
        if args.legendary_abilities and str(i) in legendary: ab['0'] = legendary[str(i)]
        modern = t.learnset(u32(raw,o['levelUpLearnset']))
        gen3_address = u32(gen3_pointers,i*4)
        gen3 = t.learnset(gen3_address) if gen3_address else modern
        levelups = modern if args.learnsets == 'modern' else gen3
        teach = []; pointer = u32(raw,o['teachableLearnset'])
        if pointer:
            buf = t.pointer(pointer,4096)
            for pos in range(0,len(buf),2):
                m = u16(buf,pos)
                if m == 65535: break
                teach.append(move_names[m])
        value = dict(name=name, bs=dict(zip(STATS,raw[:6])), types=list(dict.fromkeys(TYPES[v] for v in raw[o['types']:o['types']+2])), abilities=ab, weightkg=u16(raw,o['weight'])/10, heightm=u16(raw,o['height'])/10, genderRatio=raw[o['genderRatio']], learnset_info=dict(learnset=[[lv,move_names[m]] for lv,m in levelups], tms=teach))
        ratio = raw[o['genderRatio']]
        if ratio in [0,254,255]: value['gender'] = {0:'M',254:'F',255:'N'}[ratio]
        poks[name] = value
        growths[i] = raw[o['growthRate']]
        species[str(i)] = dict(name=name, define=define, genderRatio=ratio, growthRate=growths[i], abilities=[abilities[a] if a else None for a in ab_ids], modernLearnset=modern, gen3Learnset=gen3)
    # The two fixed tables implement the game's Fairy option.
    no_fairy_species = {}
    for pos in range(0,len(t.elf.read('sPreFairyTypes')),4):
        raw = t.elf.read('sPreFairyTypes')[pos:pos+4]
        no_fairy_species[species_names[u16(raw,0)]] = list(dict.fromkeys(TYPES[v] for v in raw[2:4]))
    no_fairy_moves = {}
    for pos in range(0,len(t.elf.read('sFairyMoveAltTypes')),4):
        raw = t.elf.read('sFairyMoveAltTypes')[pos:pos+4]
        no_fairy_moves[move_names[u16(raw,0)]] = TYPES[raw[2]]
    if not args.fairy:
        for name,value in poks.items():
            if name in no_fairy_species: value['types'] = no_fairy_species[name]
        for name,value in moves.items():
            if value['type'] == 'Fairy': value['type'] = no_fairy_moves.get(name,'Normal')
    classes = [t.text(raw[:13]).title() for raw in t.records('gTrainerClasses','TrainerClass')]
    starting_fields = {}
    if 'sTrainerWeatherOverrides' in t.elf.symbols:
        o = l['TrainerWeatherOverride']
        for raw in t.records('sTrainerWeatherOverrides', 'TrainerWeatherOverride'):
            tid = u16(raw, o['trainerId'])
            if tid == 65535: break
            field = {}
            for key, name in [('B_WEATHER_RAIN','Rain'), ('B_WEATHER_SUN','Sun'), ('B_WEATHER_SANDSTORM','Sand'), ('B_WEATHER_HAIL','Hail')]:
                if u32(raw, o['weather']) == c[key]: field['weather'] = name
            if u32(raw, o['tailwind']): field['tailwind'] = True
            status = raw[o['startingStatus']]
            if status == c['STARTING_STATUS_ELECTRIC_TERRAIN']: field['terrain'] = 'Electric'
            elif status == c['STARTING_STATUS_PSYCHIC_TERRAIN']: field['terrain'] = 'Psychic'
            elif status == c['STARTING_STATUS_TOXIC_SPIKES_PLAYER_L2']: field['playerToxicSpikes'] = 2
            starting_fields[tid] = field
    trainer_records = []; sets = {}
    all_trainers = t.records('gTrainers','Trainer')
    normal_start = c['DIFFICULTY_NORMAL']*c['TRAINERS_COUNT']
    records = [(tid,raw,False) for tid,raw in enumerate(all_trainers[normal_start:normal_start+c['TRAINERS_COUNT']])]
    partners = t.records('gBattlePartners','Trainer')
    partner_defines = {int(m[2]):m[1] for m in re.finditer(r'^#define (PARTNER_\w+_HNS)\s+(\d+)\s*$', (source/'include/constants/battle_partner.h').read_text(), re.M)}
    records.extend((c['MAX_TRAINERS_COUNT']+i,partners[c['DIFFICULTY_NORMAL']*c['PARTNER_COUNT']+i],True) for i in partner_defines)
    for tid, raw, is_partner in records:
        o = l['Trainer']; party_size = raw[o['partySize']]
        if not tid or not party_size: continue
        assert not raw[o['poolSize']], 'Party pools require separate selection modeling'
        tr_name = t.text(raw[o['trainerName']:o['trainerName']+11]).title()
        label = f"{classes[raw[o['trainerClass']]]} {tr_name} #{tid}"
        define = partner_defines[tid-c['MAX_TRAINERS_COUNT']] if is_partner else trainer_defines[tid]
        team = dict(id=tid, define=define, name=tr_name, trainerClass=classes[raw[o['trainerClass']]], label=label, battle_type='Doubles' if bits(raw,o['battleType']) else 'Singles', aiFlags=int.from_bytes(raw[:8],'little'), party=[], is_partner=is_partner)
        if tid in starting_fields: team['starting_field'] = starting_fields[tid]
        party = t.pointer(u32(raw,o['party']),party_size*l['TrainerMon']['size'])
        for slot in range(party_size):
            p = party[slot*l['TrainerMon']['size']:(slot+1)*l['TrainerMon']['size']]
            a = l['TrainerMon']; sid = u16(p,a['species']); s = species[str(sid)]
            mid = list(struct.unpack_from('<4H',p,a['moves'])); default_moves = not any(mid)
            if default_moves:
                mid = []
                for lv,m in (s['modernLearnset'] if args.learnsets == 'modern' else s['gen3Learnset']):
                    if lv > p[a['lvl']]: break
                    if lv and m not in mid:
                        mid.append(m)
                        if len(mid)>4: mid.pop(0)
            ev = t.pointer(u32(p,a['ev']),6)
            iv = u32(p,a['iv']); ivs = dict(zip(STATS,[(iv >> (i*5)) & 31 for i in range(6)]))
            nature = NATURES[bits(p,a['nature'])]
            gender, gender_options, mode, pids = trainer_gender(p,raw,s['genderRatio'],l)
            if is_partner and mode == 3 and s['genderRatio'] not in [0,254,255]:
                gender, gender_options = 'Random', ['M','F']
            # The Sabrina check compares the inline trainerName array's address
            # with a separate compound literal; it cannot match this ROM table.
            ability_id = u16(p,a['ability'])
            source_ability = abilities[ability_id] if ability_id else s['abilities'][0]
            ability_slot = s['abilities'].index(source_ability)
            ability = legendary.get(str(sid),source_ability) if args.legendary_abilities and ability_slot == 0 else source_ability
            value = dict(level=p[a['lvl']], nature=nature, gender=gender, gender_policy='random' if mode == 3 and len(gender_options)>1 else 'fixed', gender_options=gender_options, ability=ability, moves=[move_names[m] for m in mid if m], evs=dict(zip(['hp','at','df','sa','sd','sp'],ev or [0]*6)), ivs=ivs, tr_id=tid, sub_index=slot, happiness=p[a['friendship']])
            if tid in starting_fields:
                value['starting_field'] = starting_fields[tid]
                if 'weather' in starting_fields[tid]: value['weather'] = starting_fields[tid]['weather']
            item_id = u16(p,a['heldItem'])
            if item_id: value['item'] = items[item_id]
            if team['battle_type'] == 'Doubles': value['battle_type'] = 'Doubles'
            if bits(p,a['isShiny']): value['shiny'] = True
            mon = dict(species=s['name'], speciesId=sid, source_gender=mode, source_nature=bits(p,a['nature']), sourceAbility=source_ability, default_moves=default_moves, **value)
            team['party'].append(mon)
            per_species = sets.setdefault(s['name'],{})
            key = f"Lvl {value['level']} {label}"
            while key in per_species: key = key.replace(' '+label, '* '+label)
            per_species[key] = value
        trainer_records.append(team)
    includes = dict(poks=species_names, moves=move_names, items=items, growths=growths, abilities=abilities)
    backup = dict(title=args.title, poks=poks, moves=moves, formatted_sets=sets, includes=includes, heartandsoul_options=dict(fairy=args.fairy, learnsets=args.learnsets, legendaryAbilities=args.legendary_abilities))
    write_js(args.out/'heartandsoul.js','backup_data',backup)
    write_json(args.out/'heartandsoul.json',backup)
    write_json(args.out/'trainers.json',trainer_records)
    write_json(args.out/'species.raw.json',species)
    ids = [tr['id'] for tr in trainer_records if not tr['is_partner']]
    order = {str(tid):dict(id=tid, prev=ids[i-1] if i else None, next=ids[i+1] if i+1<len(ids) else None) for i,tid in enumerate(ids)}
    write_js(args.out/'heartandsoul.order.js','trainerOrders',order)
    save_species = {i:{k:v for k,v in s.items() if k not in ['modernLearnset','gen3Learnset']} for i,s in species.items()}
    constants = dict(title=args.title, layout=l, species=save_species, moves=move_names, items=items, abilities=abilities, legendaryAbilities=legendary, charmap=t.chars, natures=NATURES, experienceTables=[list(struct.unpack('<101I',t.elf.read('gExperienceTables')[i*404:(i+1)*404])) for i in range(8)])
    write_json(args.out/'save_constants.json',constants)
    (args.out/'heartandsoul_constants.js').write_text('var '+args.constants_variable+' = '+json.dumps(constants,ensure_ascii=False,indent=2)+';\nif (typeof module === "object" && module.exports) module.exports = '+args.constants_variable+';\n')
    manifest = dict(sourceCommit=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip(), elfSha256=hashlib.sha256(args.elf.read_bytes()).hexdigest(), options=backup['heartandsoul_options'], counts=dict(species=len(poks), moves=len(moves), trainers=len(trainer_records), trainerPokemon=sum(len(tr['party']) for tr in trainer_records)), genderCounts={gender:sum(m['gender']==gender for tr in trainer_records for m in tr['party']) for gender in ['M','F','N','Random']}, assumptions=['Normal trainer table; no scripted stat scaling or randomizer.', 'Trainer ID order is not story progression.', 'Random gender remains unknown until the battle is generated.', 'Move tables use compiled settings; custom mixed-generation engine mechanics are not reimplemented.'])
    write_json(args.out/'manifest.json',manifest)
    print(json.dumps(manifest,indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',type=Path,required=True)
    parser.add_argument('--elf',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--compiler',default='arm-none-eabi-gcc')
    parser.add_argument('--title',default='Heart & Soul 2.0.6')
    parser.add_argument('--constants-variable',default='heartAndSoulSaveConstants')
    parser.add_argument('--learnsets',choices=['modern','gen3'],default='modern')
    parser.add_argument('--fairy',action=argparse.BooleanOptionalAction,default=True)
    parser.add_argument('--legendary-abilities',action=argparse.BooleanOptionalAction,default=True)
    export(parser.parse_args())
