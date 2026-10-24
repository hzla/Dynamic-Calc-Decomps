"""Compare generated interpreter instructions to an actual ROM's AI script.
Usage: python3 tools/ai/verify_platinum_script.py /path/to/pokeplatinum game.nds
Requires ndspy. Reads the ROM; never writes or patches it.
"""
import hashlib
import json
import pathlib
import re
import struct
import sys
import ndspy.rom

source = pathlib.Path(sys.argv[1])
rom_path = pathlib.Path(sys.argv[2])
bundle = pathlib.Path(__file__).resolve().parents[2] / 'js/calc_ui/move_ai_preview/platinum_ai_script.js'
data = json.loads(bundle.read_text().split('var data = ', 1)[1].split(';\n    root.PlatinumAiScript', 1)[0])
source_text = (source / 'asm/trainer_ai/trainer_ai_script.s').read_text()
assert hashlib.sha256(source_text.encode()).hexdigest() == data['sourceSha256'], 'Regenerate the interpreter data first'
macros = {}
for name, body in re.findall(r'\.macro\s+(\w+)[^\n]*\n(.*?)\.endm', (source / 'asm/macros/aicmd.inc').read_text(), re.S):
    words = re.findall(r'\.long (.*)', body)
    macros[name.lower()] = (len(words), int(words[0]) if words[0].isdigit() else None)
labels = {}; entries = []; offset = 0; current = ''
for line_no, raw in enumerate(source_text.splitlines(), 1):
    line = raw.split(';')[0].strip()
    if not line or line.startswith(('.', '#')): continue
    if line.endswith(':'):
        current = line[:-1]; labels[current] = offset; continue
    op, *rest = line.split(None, 1)
    length, opcode = macros[op.lower()]
    args = [s.strip() for s in rest[0].split(',')] if rest else []
    entries.append((line_no, op, args, offset, length, opcode, current))
    offset += length
by_line = {ins[3]: ins for ins in data['code']}
table_index = {}; expected = []
for line_no, op, args, at, length, opcode, label in entries:
    if op == 'LabelDistance':
        expected.append(labels[args[0]] - labels[args[1]])
    elif op == 'TableEntry':
        i = table_index.get(label, 0)
        expected.append(data['tables'][label][i]); table_index[label] = i + 1
    else:
        ins = by_line[line_no]
        assert ins[0].lower() == op.lower()
        expected.append(opcode)
        for arg in ins[1]: expected.append(labels[arg] - at - length if isinstance(arg, str) else arg)
expected_bytes = struct.pack('<' + 'I' * len(expected), *(w & 0xffffffff for w in expected))
rom = ndspy.rom.NintendoDSRom.fromFile(str(rom_path))
overlay = bytes(rom.loadArm9Overlays([14])[14].data)
flag_table = expected_bytes[:128]
start = overlay.find(flag_table)
assert start >= 0, 'Could not locate the Platinum flag table in overlay 14'
actual = overlay[start:start + len(expected_bytes)]
if actual != expected_bytes:
    diffs = [(i//4, a, b) for i in range(0,len(actual),4) if (a:=actual[i:i+4]) != (b:=expected_bytes[i:i+4])]
    raise SystemExit(f'{len(diffs)} differing instruction/table words; first differences: {diffs[:5]}')
print(f'{rom_path.name}: {len(expected)} words ({len(data["code"])} instructions plus tables) match at overlay 14 + {start:#x}')
print('ROM SHA256:', hashlib.sha256(rom_path.read_bytes()).hexdigest())
print('Overlay SHA256:', hashlib.sha256(overlay).hexdigest())
