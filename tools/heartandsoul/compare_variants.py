#!/usr/bin/env python3
"""Record calculator-data and save-layout differences between HnS variants."""
import argparse
from collections import Counter
import json
from pathlib import Path
from export import write_json


def read(folder, name):
    return json.loads((folder/name).read_text())


def compare(base, difficult, report_path):
    a = read(base, 'heartandsoul.json')
    b = read(difficult, 'heartandsoul.json')
    species = []
    for name in sorted(set(a['poks']) | set(b['poks'])):
        left, right = a['poks'].get(name, {}), b['poks'].get(name, {})
        fields = {key:dict(base=left.get(key),difficult=right.get(key))
                  for key in sorted(set(left) | set(right)) if left.get(key) != right.get(key)}
        if fields:
            species.append(dict(species=name,fields=fields))
    left = {t['define']:t for t in read(base, 'trainers.json')}
    right = {t['define']:t for t in read(difficult, 'trainers.json')}
    changed = []
    for define in sorted(set(left) & set(right)):
        def party(trainer):
            return [{k:v for k,v in mon.items() if k not in ['tr_id','sub_index','default_moves']}
                    for mon in trainer['party']]
        if party(left[define]) != party(right[define]):
            changed.append(dict(trainer=define,baseCount=len(left[define]['party']),
                                difficultCount=len(right[define]['party'])))
    ca = read(base, 'save_constants.json')
    cb = read(difficult, 'save_constants.json')
    save_types = ['SaveBlock1','SaveBlock2','SaveBlock3','ChallengeSettings','PokemonStorage',
                  'BoxPokemon','Pokemon','PokemonSubstruct0','PokemonSubstruct1','PokemonSubstruct3']
    layouts_match = all(ca['layout'][key] == cb['layout'][key] for key in save_types)
    report = dict(baseCommit=read(base,'manifest.json')['sourceCommit'],
                  difficultCommit=read(difficult,'manifest.json')['sourceCommit'],
                  counts=dict(changedSpecies=len(species),changedTrainerParties=len(changed),
                              addedTrainers=len(set(right)-set(left))),
                  changedSpeciesFields=dict(Counter(k for s in species for k in s['fields'])),
                  movesIdentical=a['moves']==b['moves'],saveLayoutsMatch=layouts_match,
                  speciesChanges=species,changedTrainerParties=changed,
                  addedTrainers=sorted(set(right)-set(left)),
                  trainerIdChanges=[dict(trainer=d,base=left[d]['id'],difficult=right[d]['id'])
                                    for d in sorted(set(left)&set(right)) if left[d]['id']!=right[d]['id']],
                  startingFields=[dict(trainer=t['define'],field=t['starting_field'])
                                  for t in right.values() if t.get('starting_field')],
                  notes=['Difficult Teams changes Pokémon as well as teams and starting field effects.',
                         'Official documentation describes the base game, so modified teams are verified against this fork.',
                         'Save layout compatibility does not imply matching Pokémon abilities; use variant-specific constants.'])
    write_json(report_path,report)
    print(json.dumps({k:report[k] for k in ['counts','changedSpeciesFields','movesIdentical','saveLayoutsMatch']},indent=2))


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--base',type=Path,required=True)
    p.add_argument('--difficult',type=Path,required=True)
    p.add_argument('--report',type=Path,required=True)
    args = p.parse_args()
    compare(args.base,args.difficult,args.report)
