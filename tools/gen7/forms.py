"""Gen 7 form numbering from pk3DS/PKHeX; no dependency on either program.

Overrides let hacks replace species/form names without changing parser code.
Cosmetic forms share the calculator name when their mechanics are identical.
"""
TYPES=('Normal','Fighting','Flying','Poison','Ground','Rock','Bug','Ghost','Steel',
       'Fire','Water','Grass','Electric','Psychic','Ice','Dragon','Dark','Fairy')
MEGAS={3,9,15,18,65,80,94,115,127,130,142,181,208,212,214,229,248,254,257,260,
       282,302,303,306,308,310,319,323,334,354,359,362,373,376,380,381,384,428,445,448,460,475,531,719}
ALOLAN={19,20,26,27,28,37,38,50,51,52,53,74,75,76,88,89,103,105}
TOTEMS={735,738,743,752,754,758,777,784}
SUFFIX={
 25:('','Original','Hoenn','Sinnoh','Unova','Kalos','Alola','Partner'),
 351:('','Sunny','Rainy','Snowy'),386:('','Attack','Defense','Speed'),
 412:('','Sandy','Trash'),413:('','Sandy','Trash'),421:('','Sunshine'),422:('','East'),423:('','East'),479:('','Heat','Wash','Frost','Fan','Mow'),
 487:('','Origin'),492:('','Sky'),550:('','Blue-Striped'),555:('','Zen'),
 641:('','Therian'),642:('','Therian'),645:('','Therian'),646:('','White','Black'),
 647:('','Resolute'),648:('','Pirouette'),649:('','Douse','Shock','Burn','Chill'),
 658:('','Bond','Ash'),669:('','Yellow','Orange','Blue','White'),
 670:('','Yellow','Orange','Blue','White','Eternal'),671:('','Yellow','Orange','Blue','White'),678:('','F'),
 681:('Shield','Blade'),710:('','Small','Large','Super'),711:('','Small','Large','Super'),
 676:('','Heart','Star','Diamond','Debutante','Matron','Dandy','La-Reine','Kabuki','Pharaoh'),
 718:('','10%','10%-Power-Construct','Power-Construct','Complete'),720:('','Unbound'),
 741:('','Pom-Pom',"Pa'u",'Sensu'),744:('','Own-Tempo'),745:('','Midnight','Dusk'),
 746:('','School'),778:('','Busted','Totem','Busted-Totem'),
 800:('','Dusk-Mane','Dawn-Wings','Ultra'),801:('','Original'),
}
COSMETIC={201,414,585,586,664,665,666,716}


def clean_name(s):
    return s.translate(str.maketrans({'’':"'",'‘':"'",'♀':'-F','♂':'-M'}))


class FormNames:
    def __init__(self, overrides=None): self.overrides=overrides or {}

    def __call__(self,species,form,base,item=''):
        key=f'{species}:{form}'
        if key in self.overrides: return self.overrides[key],None
        base=clean_name(base)
        if species==773 and form==255:
            if not item.endswith(' Memory'): raise ValueError(f'Cannot resolve {base} form 255 without a Memory')
            return f'{base}-{item[:-7]}','Form 255 inferred from held Memory'
        if species in (493,773):
            return base+('-'+TYPES[form] if form else ''),None
        if species==774: return ('Minior-Meteor' if form<7 else 'Minior'),None
        if species in (6,150):
            return base+('' if not form else '-Mega-'+('X','Y')[form-1]),None
        if species in MEGAS:
            if form not in (0,1): raise ValueError(f'Unknown Mega form {key}; supply forms override')
            return base+('-Mega' if form else ''),None
        if species in (382,383): return base+('-Primal' if form else ''),None
        if species in ALOLAN:
            suffix=('','-Alola','-Alola-Totem')[form]
            return base+suffix,None
        if species in TOTEMS: return base+('-Totem' if form else ''),None
        if species in SUFFIX:
            suffix=SUFFIX[species][form]
            return base+('-'+suffix if suffix else ''),None
        if species in COSMETIC: return base,None
        if not form: return base,None
        raise ValueError(f'Unrecognized species/form {key} ({base}); add an explicit forms override in the config')
