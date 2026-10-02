"""Read ARM compiler layouts; never trust the historical offsets in comments."""
import json
from pathlib import Path
import re
import struct
import subprocess
import tempfile


class Elf:
    def __init__(self, path):
        self.data = Path(path).read_bytes()
        assert self.data[:6] == b'\x7fELF\x01\x01', 'Expected little-endian ELF32'
        shoff = struct.unpack_from('<I', self.data, 32)[0]
        size, count, names_index = struct.unpack_from('<HHH', self.data, 46)
        self.sections = [struct.unpack_from('<10I', self.data, shoff+i*size) for i in range(count)]
        self.symbols = {}
        for section in self.sections:
            if section[1] != 2:
                continue
            strings = self.bytes(self.sections[section[6]])
            for pos in range(section[4], section[4]+section[5], section[9]):
                name, address, length, info, other, index = struct.unpack_from('<IIIBBH', self.data, pos)
                key = strings[name:strings.find(b'\0', name)].decode()
                if key and index and index < len(self.sections):
                    self.symbols[key] = (address, length, index)

    def bytes(self, section):
        return self.data[section[4]:section[4]+section[5]]

    def read(self, name):
        address, length, index = self.symbols[name]
        section = self.sections[index]
        start = section[4] + address - section[3]
        return self.data[start:start+length]


FIELDS = {
    'SpeciesInfo': 'baseHP baseAttack baseDefense baseSpeed baseSpAttack baseSpDefense types genderRatio growthRate abilities speciesName weight height levelUpLearnset teachableLearnset eggMoveLearnset formSpeciesIdTable'.split(),
    'MoveInfo': 'name description effect pp argument'.split(),
    'AbilityInfo': ['name', 'description'],
    'ItemInfo': ['name', 'description'],
    'TrainerMon': 'nickname ev iv moves species heldItem ability lvl ball friendship tags'.split(),
    'Trainer': 'aiFlags party items trainerClass trainerPic trainerName partySize poolSize poolRuleIndex'.split(),
    'TrainerClass': ['name'],
    'LevelUpMove': ['move', 'level'],
    'SaveBlock1': ['saveVersion', 'playerPartyCount', 'playerParty'],
    'SaveBlock2': ['playerName', 'playerTrainerId'],
    'SaveBlock3': ['challengeSettings'],
    'PokemonStorage': ['boxes', 'boxNames', 'fusions'],
    'BoxPokemon': ['personality', 'otId', 'nickname', 'checksum', 'secure'],
    'Pokemon': ['status', 'level', 'hp', 'maxHP'],
}
BITS = {
    'MoveInfo': 'type category power accuracy target priority strikeCount multiHit explosion criticalHitStage alwaysCriticalHit makesContact ignoresProtect magicCoatAffected snatchAffected punchingMove bitingMove pulseMove soundMove ballisticMove powderMove danceMove windMove slicingMove healingMove ignoresTargetAbility ignoresTargetDefenseEvasionStages ignoresSubstitute'.split(),
    'TrainerMon': ['nature', 'gender', 'isShiny', 'teraType'],
    'Trainer': ['gender', 'battleType'],
    'BoxPokemon': ['hiddenNatureModifier', 'isBadEgg', 'hasSpecies', 'isEgg', 'shinyModifier'],
    'PokemonSubstruct0': ['species', 'heldItem', 'experience', 'nickname11', 'nickname12'],
    'PokemonSubstruct1': ['move1', 'move2', 'move3', 'move4', 'hyperTrainedHP', 'hyperTrainedAttack', 'hyperTrainedDefense', 'hyperTrainedSpeed', 'hyperTrainedSpAttack', 'hyperTrainedSpDefense'],
    'PokemonSubstruct3': ['abilityNum', 'isEgg'],
    'ChallengeSettings': ['tx_Mode_Fairy_Types', 'tx_Mode_Modern_Moves', 'tx_Mode_Legendary_Abilities', 'tx_Challenges_NoEVs', 'tx_Random_Abilities', 'tx_Random_Type', 'tx_Random_Moves', 'tx_Random_Trainer', 'tx_Challenges_TrainerScalingIVs', 'tx_Challenges_TrainerScalingEVs', 'tx_Challenges_BaseStatEqualizer'],
}


def probe(source, compiler='arm-none-eabi-gcc'):
    code = ['#include <stddef.h>', '#include "global.h"', '#include "data.h"', '#include "move.h"', '#include "item.h"', '#include "pokemon_storage_system.h"', '#include "save.h"']
    fields_by_type = dict(FIELDS)
    weather_struct = re.search(r'struct TrainerWeatherOverride\s*\{[^}]+\};', (source/'src/battle_main.c').read_text())
    if weather_struct:
        code.append(weather_struct[0])
        fields_by_type['TrainerWeatherOverride'] = ['trainerId', 'weather', 'tailwind', 'startingStatus']
    names = []
    for typ, fields in fields_by_type.items():
        names.append((typ, 'size'))
        for field in fields:
            names.append((typ, field))
    expressions = [f'sizeof(struct {typ})' if field == 'size' else f'offsetof(struct {typ}, {field})' for typ, field in names]
    code.append('const unsigned offsets[] = {' + ','.join(expressions) + '};')
    for typ, fields in BITS.items():
        for field in fields:
            code.append(f'const struct {typ} mask_{typ}_{field} = {{ .{field} = -1 }};')
    constants = ['NUM_SPECIES', 'MOVES_COUNT_ALL', 'ABILITIES_COUNT', 'ITEMS_COUNT', 'TRAINERS_COUNT', 'DIFFICULTY_COUNT', 'DIFFICULTY_NORMAL', 'SECTOR_DATA_SIZE', 'SAVE_VERSION', 'TOTAL_BOXES_COUNT', 'TARGET_BOTH', 'TARGET_FOES_AND_ALLY', 'TARGET_USER', 'PARTNER_COUNT', 'MAX_TRAINERS_COUNT']
    if weather_struct:
        constants.extend(['B_WEATHER_RAIN', 'B_WEATHER_SUN', 'B_WEATHER_SANDSTORM', 'B_WEATHER_HAIL', 'STARTING_STATUS_ELECTRIC_TERRAIN', 'STARTING_STATUS_PSYCHIC_TERRAIN', 'STARTING_STATUS_TOXIC_SPIKES_PLAYER_L2'])
    code.append('const unsigned constants[] = {' + ','.join(constants) + '};')
    with tempfile.TemporaryDirectory() as tmp:
        c = Path(tmp)/'layout.c'; obj = Path(tmp)/'layout.o'
        c.write_text('\n'.join(code))
        subprocess.run([compiler, '-c', str(c), '-o', str(obj), '-iquote', str(source/'include'), '-iquote', str(source), '-DPOKEMON_HNS', '-DMODERN=1', '-DRELEASE', '-std=gnu17', '-mthumb', '-march=armv4t', '-mabi=apcs-gnu', '-w'], check=True)
        elf = Elf(obj)
        layout = {}
        values = struct.unpack('<'+'I'*len(names), elf.read('offsets'))
        for (typ, field), value in zip(names, values):
            layout.setdefault(typ, {})[field] = value
        for typ, fields in BITS.items():
            for field in fields:
                mask = int.from_bytes(elf.read(f'mask_{typ}_{field}'), 'little')
                shift = (mask & -mask).bit_length()-1
                width = mask.bit_count()
                assert mask >> shift == (1 << width)-1
                layout.setdefault(typ, {})[field] = dict(bit=shift, width=width)
        layout['constants'] = dict(zip(constants, struct.unpack('<'+'I'*len(constants), elf.read('constants'))))
        return layout


def bits(raw, definition):
    return (int.from_bytes(raw, 'little') >> definition['bit']) & ((1 << definition['width'])-1)
