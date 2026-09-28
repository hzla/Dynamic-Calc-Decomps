"""Gen 7's eight-byte evolution records; method IDs are NOT Gen 4 IDs."""
import struct
from forms import TYPES

METHODS={1:'levelFriendship',2:'levelFriendshipDay',3:'levelFriendshipNight',4:'level',
5:'trade',6:'tradeItem',7:'tradeSpecies',8:'useItem',9:'levelAttackGreater',10:'levelAttackEqual',
11:'levelAttackLess',12:'levelEncryptionConstantLow',13:'levelEncryptionConstantHigh',
14:'levelNinjask',15:'levelShedinja',16:'beauty',17:'useItemMale',18:'useItemFemale',
19:'levelHoldDay',20:'levelHoldNight',21:'levelMove',22:'levelParty',23:'levelMale',
24:'levelFemale',25:'levelMagneticField',26:'levelMossRock',27:'levelIceRock',
28:'levelInverted',29:'levelAffectionMoveType',30:'levelDarkParty',31:'levelRain',
32:'levelDay',33:'levelNight',34:'levelFemale',36:'levelVersion',37:'levelVersionDay',
38:'levelVersionNight',39:'levelSummit',40:'levelDusk',41:'levelWormhole',42:'useItemWormhole'}
LEVEL_PARAM={4,9,10,11,12,13,14,15,23,24,28,30,31,32,33,34,40}
ITEM_PARAM={6,8,17,18,19,20,42}


def decode(data, form, names, tables):
    result=[]
    if len(data)!=64: raise ValueError(f'Expected 64-byte evolution table, got {len(data)}')
    for method,arg,species,target_form,level in struct.iter_unpack('<HHHbB',data):
        if not method: continue
        if method not in METHODS: raise ValueError(f'Unknown Gen 7 evolution method {method}; supply a decoder before exporting')
        target_form=form if target_form==-1 else target_form
        param=''
        if method in LEVEL_PARAM: param=level or arg
        elif method in ITEM_PARAM: param=tables['items'][arg]
        elif method in (7,22): param=tables['species'][arg]
        elif method==21: param=tables['moves'][arg]
        elif method==29: param=TYPES[arg]
        elif method in (36,37,38): param={30:'Sun',31:'Moon',32:'Ultra Sun',33:'Ultra Moon'}.get(arg,f'Game version {arg}')
        elif method==16: param=arg
        result.append(dict(target=names[(species,target_form)],method=METHODS[method],method_id=method,
                           param=param,level=level,argument=arg,target_form=target_form))
    return result
