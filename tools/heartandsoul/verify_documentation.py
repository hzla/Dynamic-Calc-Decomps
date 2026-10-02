#!/usr/bin/env python3
"""Compare generated data against the official documentation's rendered fields."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from export import norm, write_json


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag = tag; self.attrs = dict(attrs); self.children = []

    def text(self):
        return re.sub(r'\s+', ' ', ''.join(c.text() if isinstance(c,Node) else c for c in self.children)).strip()

    def find(self, tag=None, cls=None, **attrs):
        found = []
        for c in self.children:
            if isinstance(c,Node):
                if (not tag or c.tag == tag) and (not cls or cls in c.attrs.get('class','').split()) and all(c.attrs.get(k.replace('_','-')) == v for k,v in attrs.items()): found.append(c)
                found.extend(c.find(tag,cls,**attrs))
        return found


class Tree(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node(); self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        n = Node(tag,attrs); self.stack[-1].children.append(n)
        if tag not in ['img','br','hr','input','meta','link','source']: self.stack.append(n)

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag == tag: self.stack = self.stack[:i]; break

    def handle_data(self, data): self.stack[-1].children.append(data)


def cards(path):
    text = path.read_text()
    return json.loads(re.search(r'<script type="application/json" id="cards">(.*?)</script>',text,re.S)[1])


def verify(args):
    backup = json.loads((args.output/'heartandsoul.json').read_text())
    constants = json.loads((args.output/'save_constants.json').read_text())
    trainers = json.loads((args.output/'trainers.json').read_text())
    raw_species = {s['name']:s for s in json.loads((args.output/'species.raw.json').read_text()).values()}
    def move_id(name):
        key = norm(name)
        return dict(faintattack='feintattack',vicegrip='visegrip',hijumpkick='highjumpkick',smellingsalt='smellingsalts').get(key,key)
    by_trainer = {t['define']:t for t in trainers}
    by_move = {norm(k):v for k,v in backup['moves'].items()}
    by_species = {norm(v['define'].removeprefix('SPECIES_')):backup['poks'][v['name']] for v in constants['species'].values()}
    baseline_species = {v['name']:v for v in constants['species'].values()}
    differences = []; counts = dict(species=0,moves=0,trainers=0,trainerPokemon=0,fields=0)
    def check(kind,key,field,doc,actual):
        counts['fields'] += 1
        if doc != actual: differences.append(dict(kind=kind,key=key,field=field,documentation=doc,extracted=actual))
    for _, html in cards(args.documentation/'moves.html'):
        tree = Tree(html).root
        name = tree.find('h2')[0].find('a')[0].text()
        move = by_move.get(norm(name))
        if not move:
            differences.append(dict(kind='move',key=name,field='missing')); continue
        counts['moves'] += 1
        check('move',name,'type',tree.find('img','typeicon')[0].attrs['alt'],move['type'])
        check('move',name,'category',tree.find('img','caticon')[0].attrs['alt'],move['category'])
        kv = {x.find('dt')[0].text():x.find('dd')[0].text() for x in tree.find('dl')[0].children if isinstance(x,Node) and x.find('dt')}
        for label,field in [('Power','basePower'),('PP','pp')]:
            expected = int(kv[label]) if kv[label].isdigit() else 0
            check('move',name,field,expected,move[field])
        acc = int(kv['Accuracy'].removesuffix('%')) if kv['Accuracy'].removesuffix('%').isdigit() else True
        check('move',name,'accuracy',acc,move['accuracy'])
    for _, html in cards(args.documentation/'pokedex.html'):
        tree = Tree(html).root
        for swap in tree.find(cls='formswap'):
            form = swap.attrs['data-form']; images = swap.find('img','monpic')
            if not images: continue
            stem = Path(images[0].attrs['src']).stem
            species = by_species.get(norm(stem))
            name = swap.find(cls='mon-name')[0].text()
            if not species:
                differences.append(dict(kind='species',key=name,field='missing',sprite=stem)); continue
            panels = tree.find(cls='panel',data_form=form,data_panel='stats')
            if not panels: continue
            panel = panels[0]; counts['species'] += 1
            bs = {}
            for span in panel.find(cls='statline')[0].children:
                if not isinstance(span,Node) or not span.find('b') or 'total' in span.attrs.get('class',''): continue
                label = ''.join(x for x in span.children if isinstance(x,str)).strip()
                if label in ['HP','Atk','Def','SpA','SpD','Spe']:
                    bs[dict(HP='hp',Atk='at',Def='df',SpA='sa',SpD='sd',Spe='sp')[label]] = int(span.find('b')[0].text())
            check('species',name,'baseStats',bs,species['bs'])
            check('species',name,'types',[im.attrs['alt'] for im in swap.find('img','typeicon')],species['types'])
            rows = {r.find(cls='row-label')[0].text():r.find(cls='row-value')[0] for r in panel.find(cls='row')}
            ab = [a.text() for a in rows['Abilities'].find('a')]
            actual = [a for a in baseline_species[species['name']]['abilities'][:2] if a]
            check('species',name,'abilities',[norm(v) for v in ab],[norm(v) for v in actual])
            if 'Hidden ability' in rows:
                check('species',name,'hiddenAbility',norm(rows['Hidden ability'].text()),norm(baseline_species[species['name']]['abilities'][2] or ''))
            size = re.search(r'([\d.]+) m / ([\d.]+) kg',rows['Size'].text())
            if size:
                check('species',name,'weight',float(size[2]),species['weightkg'])
                check('species',name,'height',float(size[1]),species['heightm'])
            ratio = species['genderRatio']
            ratio_labels = {0:'0% female',31:'12.5% female',63:'25% female',127:'50% female',191:'75% female',223:'87.5% female',254:'100% female',255:'Genderless'}
            check('species',name,'genderRatio',rows['Gender'].text(),ratio_labels.get(ratio,str(ratio)))
            growth = ['Medium Fast','Erratic','Fluctuating','Medium Slow','Fast','Slow','Medium Fast','Medium Fast'][baseline_species[species['name']]['growthRate']]
            check('species',name,'growthRate',rows['Growth rate'].text(),growth)
            for pname,field in [('moves','modernLearnset'),('moves3','gen3Learnset')]:
                panel_moves = tree.find(cls='panel',data_form=form,data_panel=pname)
                if panel_moves:
                    cols = panel_moves[0].find(cls='movecol')
                    if cols:
                        learned = [[int(li.find(cls='lvl')[0].text()),norm(li.find('a')[0].text())] for li in cols[0].find('li') if li.find(cls='lvl')]
                        check('species',name,field,learned,[[lv,norm(constants['moves'][m])] for lv,m in raw_species[species['name']][field]])
    tree = Tree((args.documentation/'trainers.html').read_text()).root
    for panel in tree.find(cls='panel',data_panel='party'):
        notes = panel.find(cls='setting-note')
        if not notes: continue
        define = notes[0].text(); trainer = by_trainer.get(define)
        if not trainer:
            differences.append(dict(kind='trainer',key=define,field='missing')); continue
        mons = panel.find(cls='mon-card'); counts['trainers'] += 1
        check('trainer',define,'partySize',len(mons),len(trainer['party']))
        for slot,(doc,mon) in enumerate(zip(mons,trainer['party'])):
            counts['trainerPokemon'] += 1
            key = f'{define}:{slot}'
            name = doc.find('h4')[0].text()
            # Resolve documentation species via icon stem to retain regional forms.
            icon = doc.find('img','monicon')[0].attrs['src']
            s = by_species.get(norm(Path(icon).stem))
            check('trainer',key,'species',s['name'] if s else name,mon['species'])
            meta = doc.find(cls='meta')[0].text()
            m = re.search(r'Lv\. (\d+)\s*·\s*Item: (.*?)\s*·\s*Ability: (.*)',meta)
            assert m, meta
            check('trainer',key,'level',int(m[1]),mon['level'])
            check('trainer',key,'item',norm(m[2]),norm(mon.get('item','None')))
            check('trainer',key,'ability',norm(m[3].split('·')[0]),norm(mon['sourceAbility']))
            nature = re.search(r'Nature:\s*(\w+)',meta)
            if nature: check('trainer',key,'nature',nature[1],mon['nature'])
            learned = [move_id(li.text()) for ul in doc.find('ul') for li in ul.find('li')]
            check('trainer',key,'moves',learned,[move_id(m) for m in mon['moves']])
    overrides = [dict(trainer=t['define'],species=m['species'],baseline=m['sourceAbility'],effective=m['ability']) for t in trainers for m in t['party'] if m['sourceAbility']!=m['ability']]
    report = dict(documentationCommit=__import__('subprocess').check_output(['git','-C',str(args.documentation),'rev-parse','HEAD'],text=True).strip(),counts=counts,differenceCount=len(differences),differences=differences,profileOptions=backup['heartandsoul_options'],legendaryAbilityOverrides=overrides,
                  notes=['The documentation contains major trainer battles plus Lance as a battle partner.', 'The documentation prints some explicit natures; omitted natures default to Hardy. Trainer Pokémon gender is verified from trainerproc and battle_main.c.', 'Ability comparisons use baseline source slots printed in the docs. The sample save enables Legendary abilities; the export applies the nine source-defined slot-0 overrides.'])
    write_json(args.output/'documentation_comparison.json',report)
    from collections import Counter
    print(json.dumps(dict(counts=counts,differenceCount=len(differences),
                          differenceFields=dict(Counter(d['field'] for d in differences)),
                          report=str(args.output/'documentation_comparison.json')),indent=2))


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--documentation',type=Path,required=True); p.add_argument('--output',type=Path,required=True)
    verify(p.parse_args())
