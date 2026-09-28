#!/usr/bin/env python3
"""Read Gen 7 trainer GARCs using layouts documented in pk3DS.

No Windows runtime or third-party Python packages required. Source files are read-only.
"""
import argparse
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import re
import struct
from gen7_trainer import ability_slot as resolve_ability_slot, effective_evs, trainer_random


def u16(data, offset):
    return struct.unpack_from('<H', data, offset)[0]


def u32(data, offset):
    return struct.unpack_from('<I', data, offset)[0]


def lz11(data):
    if not data or data[0] != 0x11:
        return data
    size = int.from_bytes(data[1:4], 'little')
    pos = 4
    if not size:
        size, pos = u32(data, 4), 8
    out = bytearray()
    while len(out) < size:
        flags = data[pos]
        pos += 1
        for bit in range(7, -1, -1):
            if len(out) >= size:
                break
            if not flags & (1 << bit):
                out.append(data[pos])
                pos += 1
                continue
            a, b = data[pos:pos + 2]
            pos += 2
            kind = a >> 4
            if kind == 0:
                c = data[pos]
                pos += 1
                length, distance = ((a & 15) << 4 | b >> 4) + 0x11, ((b & 15) << 8 | c) + 1
            elif kind == 1:
                c, d = data[pos:pos + 2]
                pos += 2
                length = ((a & 15) << 12 | b << 4 | c >> 4) + 0x111
                distance = ((c & 15) << 8 | d) + 1
            else:
                length, distance = kind + 1, ((a & 15) << 8 | b) + 1
            if distance > len(out) or len(out) + length > size:
                raise ValueError('Invalid LZ11 back-reference')
            for _ in range(length):
                out.append(out[-distance])
    return bytes(out)


def garc(path, decompress=False):
    data = Path(path).read_bytes()
    assert data[:4] == b'CRAG', f'Not a GARC: {path}'
    assert u16(data, 10) in (0x400, 0x600)
    assert u32(data, 20) == len(data), f'Incorrect archive length: {path}'
    fato, base = u32(data, 4), u32(data, 16)
    assert data[fato:fato + 4] == b'OTAF'
    count = u16(data, fato + 8)
    fatb = fato + u32(data, fato + 4)
    assert data[fatb:fatb + 4] == b'BTAF'
    result = []
    for index in range(count):
        pos = fatb + 12 + u32(data, fato + 12 + index * 4)
        vector = u32(data, pos)
        assert vector == 1, f'Multi-member entry {index}: {path}'
        start, end, length = struct.unpack_from('<III', data, pos + 4)
        assert start + length <= end and base + end <= len(data)
        entry = data[base + start:base + start + length]
        result.append(lz11(entry) if decompress else entry)
    return result


def text_lines(data, descriptions=False):
    assert u16(data, 0) == 1 and u32(data, 8) == 0
    base = u32(data, 12)
    assert base + u32(data, 4) == len(data)
    lines = []
    for index in range(u16(data, 2)):
        pos = base + u32(data, base + 4 + index * 8)
        length = u16(data, base + 8 + index * 8)
        key = (0x7C89 + index * 0x2983) & 0xFFFF
        values = []
        for j in range(length):
            val = u16(data, pos + 2 * j) ^ key
            key = ((key << 3) | (key >> 13)) & 0xFFFF
            values.append(val)
        if values and values[-1] == 0:
            values.pop()
        if values[:3] == [0x10, 1, 0xBDFF]:
            s = f'[unused text {index}]'
        else:
            if descriptions:
                decoded, j = [], 0
                while j < len(values):
                    if values[j] == 0:
                        break
                    if values[j] == 0x10:
                        size = values[j + 1]
                        token = values[j + 2:j + 2 + size]
                        decoded.extend(map(ord, ' ' if token[0] in (0xBE00, 0xBE01) else '[text variable]'))
                        j += 2 + size
                    else:
                        decoded.append(values[j])
                        j += 1
                values = decoded
            elif 0 in values:
                values = values[:values.index(0)]
            s = ''.join(chr(v) for v in values)
            if descriptions:
                s = s.replace('\n', ' ').replace('\r', ' ')
            assert not any(ord(c) < 32 for c in s), f'Unexpected control code in text {index}: {s!r}'
        s = s.translate(str.maketrans({'\ue08e': '♂', '\ue08f': '♀', '\ue07f': ' ', '\ue08d': '…'}))
        lines.append(s)
    return lines


PROFILES = {
    'usum': dict(trdata='a/1/0/6', trpoke='a/1/0/7', max_species=807,
        text=dict(species=60,moves=118,items=40,abilities=101,natures=92,trainer_names=110,classes=111,forms=119)),
    'sm': dict(trdata='a/1/0/5', trpoke='a/1/0/6', max_species=802,
        text=dict(species=55,moves=113,items=36,abilities=96,natures=87,trainer_names=105,classes=106,forms=114)),
}


def archive_paths(game='usum', overrides=None):
    p=PROFILES[game]
    return dict(text='a/0/3/2',personal='a/0/1/7',levelup='a/0/1/3',moves='a/0/1/1',mega='a/0/1/5',evolutions='a/0/1/4',eggs='a/0/1/2',
                trdata=p['trdata'],trpoke=p['trpoke'],**{}) | (overrides or {})


def load(root, game='usum', overrides=None):
    paths=archive_paths(game,overrides)
    texts = garc(root / paths['text'], True)
    tables = {k: text_lines(texts[i]) for k, i in {
        **PROFILES[game]['text'],
    }.items()}
    trainers = garc(root / paths['trdata'])
    parties = garc(root / paths['trpoke'])
    personal = garc(root / paths['personal'])
    return tables, trainers, parties, personal


STATS = ('hp', 'atk', 'def', 'spa', 'spd', 'spe')
STAT_LABELS = ('HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe')
TYPES = ('Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost',
         'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark', 'Fairy')
ALOLAN = {19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 74, 75, 76, 88, 89, 103, 105}
FORM_SUFFIXES = {
    413: ('', 'Sandy', 'Trash'), 423: ('', 'East'),
    479: ('', 'Heat', 'Wash', 'Frost', 'Fan', 'Mow'), 492: ('', 'Sky'),
    550: ('', 'Blue-Striped'),
    666: ('Icy Snow', 'Polar', 'Tundra', 'Continental', 'Garden', 'Elegant', 'Meadow',
          'Modern', 'Marine', 'Archipelago', 'High Plains', 'Sandstorm', 'River',
          'Monsoon', 'Savanna', 'Sun', 'Ocean', 'Jungle', 'Fancy', 'Pokeball'),
    669: ('', 'Yellow', 'Orange', 'Blue', 'White'),
    671: ('', 'Yellow', 'Orange', 'Blue', 'White'),
    676: ('', 'Heart', 'Star', 'Diamond', 'Debutante', 'Matron', 'Dandy', 'La Reine', 'Kabuki', 'Pharaoh'),
    711: ('', 'Small', 'Large', 'Super'), 718: ('', '10%', '10%', '', 'Complete'),
    720: ('', 'Unbound'), 741: ('', 'Pom-Pom', "Pa'u", 'Sensu'),
    745: ('', 'Midnight', 'Dusk'),
}


def form_name(species, form, base, item):
    if species == 773:
        if form == 255:
            assert item.endswith(' Memory'), f'Cannot resolve Silvally form from {item}'
            return f'Silvally-{item[:-7]}', 'Inferred from held Memory; raw form is 255'
        return base + (f'-{TYPES[form]}' if form else ''), None
    if species == 774:
        return ('Minior-Meteor' if form < 7 else
                ['Minior', 'Minior-Orange', 'Minior-Yellow', 'Minior-Green', 'Minior-Blue', 'Minior-Indigo', 'Minior-Violet'][form - 7]), None
    if not form:
        return {'Nidoran♀': 'Nidoran-F', 'Nidoran♂': 'Nidoran-M'}.get(base, base), None
    if species in ALOLAN and form == 1:
        return base + '-Alola', None
    if species not in FORM_SUFFIXES or form >= len(FORM_SUFFIXES[species]):
        raise ValueError(f'Unmapped form: {base} #{species} form {form}')
    suffix = FORM_SUFFIXES[species][form].replace(' ', '-')
    return base + ('-' + suffix if suffix else ''), None


def encounter_moves(data, level):
    """Game move queue: keep the last four, skipping moves already in the queue."""
    assert len(data) % 4 == 0 and data[-4:] == b'\xff' * 4
    moves = []
    for move, learned in struct.iter_unpack('<HH', data[:-4]):
        if learned > level:
            break
        if move and move not in moves:
            moves.append(move)
            moves = moves[-4:]
    return moves


def showdown_set(p, nickname=None):
    name = p['showdown_species']
    if nickname:
        name = f'{nickname} ({name})'
    if p['gender']:
        name += f" ({p['gender']})"
    if p['item']:
        name += ' @ ' + p['item']
    lines = [name]
    if p['ability']:
        lines.append('Ability: ' + p['ability'])
    lines.append(f"Level: {p['level']}")
    lines.append(f"Happiness: {p['happiness']}")
    if p['shiny']:
        lines.append('Shiny: Yes')
    # Print every stat, including zero: avoid defaults when importing ROM data.
    lines.append('EVs: ' + ' / '.join(f'{p["evs"][s]} {label}' for s, label in zip(STATS, STAT_LABELS)))
    lines.append(p['nature'] + ' Nature')
    lines.append('IVs: ' + ' / '.join(f'{p["ivs"][s]} {label}' for s, label in zip(STATS, STAT_LABELS)))
    lines.extend('- ' + m for m in p['moves'])
    return '\n'.join(lines)


def export(root, out, title='Gen 7', game='usum', overrides=None):
    game_title=title
    t, trainers, parties, personal = load(root,game,overrides)
    paths=archive_paths(game,overrides)
    learnsets = garc(root / paths['levelup'])
    assert len(trainers) == len(parties) == len(t['trainer_names'])
    teams, warnings = [], []
    for tid, (tr, party) in enumerate(zip(trainers, parties)):
        assert len(tr) == 20 and tr[3] <= 6
        if not tr[3]:
            continue
        assert len(party) == 32 * tr[3], (tid, len(party), tr[3])
        tc = u16(tr, 0)
        team = dict(id=tid, name=t['trainer_names'][tid], trainer_class=t['classes'][tc],
                    class_id=tc, battle_mode={0: 'Singles', 1: 'Doubles', 2: 'Multi'}[tr[2]],
                    ai=tr[12], flag=tr[13], trainer_items=[u16(tr, x) for x in (4, 6, 8, 10)],
                    raw_trdata=tr.hex(), placeholder_name=t['trainer_names'][tid].startswith('[unused'), pokemon=[])
        for slot in range(tr[3]):
            raw = party[slot * 32:(slot + 1) * 32]
            species, form, item_id, level = u16(raw, 16), raw[18], u16(raw, 20), raw[14]
            assert raw[15] == raw[19] == 0 and 1 <= level <= 100 and 0 < species < len(t['species'])
            pi = personal[species]
            fi = u16(pi, 28)
            if form and fi and form < pi[32]:
                pi = personal[fi + form - 1]
                personal_index = fi + form - 1
            else:
                personal_index = species
            assert len(pi) == 84
            ability_slot = (raw[0] >> 4) & 3
            resolved_slot = resolve_ability_slot(species, level, tc, ability_slot)
            options = list(dict.fromkeys(pi[24:26] if not ability_slot else [pi[23 + ability_slot]]))
            candidates = [t['abilities'][i] for i in options]
            item = t['items'][item_id] if item_id else None
            species_name, form_note = form_name(species, form, t['species'][species], item or '')
            ivword = u32(raw, 8)
            raw_moves = [u16(raw, 24 + i * 2) for i in range(4)]
            inferred_moves = not any(raw_moves)
            move_ids = encounter_moves(learnsets[personal_index], level) if inferred_moves else [m for m in raw_moves if m]
            p = dict(slot=slot + 1, species_id=species, species=t['species'][species], form=form,
                     showdown_species=species_name, personal_index=personal_index, form_note=form_note,
                     level=level, item_id=item_id, item=item, nature_id=raw[1], nature=t['natures'][raw[1]],
                     ability_slot=ability_slot, ability_ids=options, ability_options=candidates,
                     ability=t['abilities'][pi[23 + resolved_slot]], resolved_ability_slot=resolved_slot,
                     ability_source='explicit_trainer_record' if ability_slot else 'deterministic_tinymt',
                     trainer_random=trainer_random(species, level, tc),
                     gender={0: None, 1: 'M', 2: 'F'}[raw[0] & 3], gender_flag=raw[0] & 3,
                     shiny=bool(ivword & 0x40000000), iv_word=ivword,
                     raw_evs=dict(zip(STATS, raw[2:8])), evs=dict(zip(STATS, effective_evs(raw[2:8]))),
                     ivs=dict(zip(STATS, [(ivword >> (5 * i)) & 31 for i in range(6)])),
                     happiness=0 if 218 in move_ids else 255,
                     raw_move_ids=raw_moves, move_ids=move_ids, moves=[t['moves'][i] for i in move_ids],
                     moves_source='derived_from_modded_levelup' if inferred_moves else 'explicit_trainer_record',
                     base_stats=dict(zip(('hp', 'atk', 'def', 'spe', 'spa', 'spd'), pi[:6])),
                     types=[TYPES[i] for i in dict.fromkeys(pi[6:8])], raw_trpoke=raw.hex())
            notes = []
            if inferred_moves:
                notes.append('Moves derived from modified level-up learnset; trainer record contains four zero move IDs')
            if sum(raw[2:8]) > 510:
                notes.append(f'Raw EV total {sum(raw[2:8])} exceeds 510; game setter caps in HP/Atk/Def/SpA/SpD/Spe order; raw values retained in JSON')
            if form_note:
                notes.append(form_note)
            for note in notes:
                warnings.append(dict(trainer_id=tid, trainer_name=team['name'], slot=slot + 1, species=species_name, note=note))
            team['pokemon'].append(p)
        teams.append(team)
    out.mkdir(parents=True, exist_ok=True)
    per_team = out / 'teams'
    per_team.mkdir(exist_ok=True)
    blocks, calc_blocks = [], []
    for team in teams:
        title = f"{team['id']:03d} - {team['trainer_class']} {team['name']}"
        sets = '\n\n'.join(showdown_set(p) for p in team['pokemon'])
        blocks.append(f'=== [gen7customgame] {game_title}/{title} ===\n\n{sets}')
        filename = re.sub(r'[^\w .-]+', '', title).replace(' ', '_') + '.txt'
        team['showdown_file'] = 'teams/' + filename
        (per_team / filename).write_text(sets + '\n', encoding='utf-8')
        for p in team['pokemon']:
            calc_blocks.append(showdown_set(p, f"{team['trainer_class']} {team['name']} #{team['id']} slot {p['slot']}"))
    (out / 'trainers.showdown.txt').write_text('\n\n'.join(blocks) + '\n', encoding='utf-8')
    (out / 'trainers.calc.txt').write_text('\n\n'.join(calc_blocks) + '\n', encoding='utf-8')
    (out / 'trainers.json').write_text(json.dumps(teams, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    with (out / 'warnings.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['trainer_id', 'trainer_name', 'slot', 'species', 'note'])
        writer.writeheader()
        writer.writerows(warnings)
    counts = dict(trainers=len(teams), pokemon=sum(len(t['pokemon']) for t in teams),
                  placeholder_named_trainers=sum(t['placeholder_name'] for t in teams),
                  automatic_moves=sum(p['moves_source'].startswith('derived') for t in teams for p in t['pokemon']),
                  ambiguous_abilities=sum(p['ability'] is None for t in teams for p in t['pokemon']),
                  abilities_resolved_with_tinymt=sum(p['ability_source'] == 'deterministic_tinymt' for t in teams for p in t['pokemon']),
                  raw_ev_totals_above_510=sum(sum(p['raw_evs'].values()) > 510 for t in teams for p in t['pokemon']),
                  form_inferences=sum(bool(p['form_note']) for t in teams for p in t['pokemon']))
    sources = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
               for p in [root / paths[k] for k in ('text','personal','levelup','trdata','trpoke')]}
    (out / 'export_manifest.json').write_text(json.dumps(dict(counts=counts, source_romfs=str(root.resolve()), sha256=sources), indent=2) + '\n')
    return teams, counts


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--romfs', type=Path, required=True)
    parser.add_argument('--out', type=Path, default=Path(__file__).resolve().parent / 'output')
    args = parser.parse_args()
    export(args.romfs, args.out)
