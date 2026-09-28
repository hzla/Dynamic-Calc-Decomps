"""Regular Gen 7 encounter tables, with zone names and unmodified SOS metadata.

Area table numbers are retained: script/terrain assignments are not guessed.
SOS probabilities depend on callers/weather and are not regular encounter rates.
"""
import mmap
import struct
from pathlib import Path
import rom_data as rom


def selected_garc(path,predicate):
    with Path(path).open('rb') as file, mmap.mmap(file.fileno(),0,access=mmap.ACCESS_READ) as data:
        if data[:4]!=b'CRAG': raise ValueError(f'Not a GARC: {path}')
        fato,base=rom.u32(data,4),rom.u32(data,16)
        fatb=fato+rom.u32(data,fato+4)
        result={}
        for index in range(rom.u16(data,fato+8)):
            if not predicate(index): continue
            pos=fatb+12+rom.u32(data,fato+12+index*4)
            if rom.u32(data,pos)!=1: raise ValueError('Multi-member encounter GARC unsupported')
            start,_,length=struct.unpack_from('<III',data,pos+4)
            result[index]=rom.lz11(data[base+start:base+start+length])
        return result


def unpack_mini(data,magic):
    if data[:2]!=magic: raise ValueError(f'Expected {magic!r} mini archive')
    count=rom.u16(data,2)
    offsets=struct.unpack_from('<'+'I'*(count+1),data,4)
    if offsets[-1]!=len(data): raise ValueError('Invalid mini archive length')
    return [data[a:b] for a,b in zip(offsets,offsets[1:])]


def export(root,game,texts,names,config):
    paths=dict(zones='a/0/7/7',worlds='a/0/9/1',encounters='a/0/8/2')|config.get('archives',{})
    if not (root/paths['encounters']).stat().st_size and 'encounters' not in config.get('archives',{}):
        paths['encounters']='a/0/8/3'  # Moon/Ultra Moon
    locations=rom.text_lines(texts[72 if game=='usum' else 67])
    zone_files=rom.garc(root/paths['zones'],True)
    worlds=[unpack_mini(x,b'WD')[0] for x in rom.garc(root/paths['worlds'],True)]
    area_zones={}
    for i in range(len(zone_files[0])//0x54):
        parent=rom.u32(zone_files[0],i*0x54+0x1c)
        world=worlds[rom.u16(zone_files[1],i*2)]
        mapping=rom.u32(world,8)
        for zone,area in struct.iter_unpack('<HH',world[mapping:]):
            if zone==i:
                name=locations[parent]
                if parent%2==0 and locations[parent+1] and not locations[parent+1].startswith('['):
                    name+=f' ({locations[parent+1]})'
                area_zones.setdefault(area,[]).append(dict(zone=i,name=name))
                break
    dex={'rates':{}}; raw_tables=[]
    for file_index,blob in selected_garc(root/paths['encounters'],lambda i:i%11==9).items():
        if not blob: continue
        area=file_index//11
        tables=unpack_mini(blob,b'EA')
        if not any(tables): continue
        zones=area_zones.get(area,[])
        label=' / '.join(dict.fromkeys(x['name'] for x in zones)) or 'Unknown zone'
        label+=f' [Area {area}]'
        location=dict(name=label)
        for index,table in enumerate(tables):
            if not table: continue
            if len(table)<0x2cc: raise ValueError(f'Truncated encounter table {len(table)}')
            for part,time in enumerate(('Day','Night')):
                b=table[4+part*0x164:4+(part+1)*0x164]
                minimum,maximum=b[:2]
                slots=[];rates=[];encoded=[]
                for value in struct.unpack_from('<86I',b,12):
                    species,form=value&0x7ff,(value>>11)&31
                    if species:
                        # 31 is the game's dynamic form sentinel, not a literal form.
                        if form==31 and len({name for (s,_),name in names.items() if s==species})!=1:
                            raise ValueError(f'Dynamic encounter form for species {species} needs an explicit form-selection decoder')
                        key=(species,0 if form==31 else form)
                        if key not in names: raise ValueError(f'Unmapped encounter form {key}')
                        encoded.append(dict(s=names[key],mn=minimum,mx=maximum,species_id=species,form=form))
                    else: encoded.append(None)
                for i,slot in enumerate(encoded[:10]):
                    if slot and b[2+i]: slots.append({k:slot[k] for k in ('s','mn','mx')});rates.append(b[2+i])
                if slots:
                    location[f'table{index+1}_{time.lower()}']=dict(name=f'Table {index+1} — {time}',rates=rates,encs=slots)
                raw_tables.append(dict(area=area,zones=zones,table=index+1,time=time,rates=list(b[2:12]),
                                       regular=encoded[:10],sos=[encoded[10+n*10:20+n*10] for n in range(7)],weather_sos=encoded[80:]))
        if len(location)>1: dex[f'area{area}']=location
    return dex,raw_tables,{k:paths[k] for k in ('zones','worlds','encounters')}
