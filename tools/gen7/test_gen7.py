"""Regression checks using fixed captured trainer values and binary edge cases.
No emulator or ROM is needed for these tests.
"""
import struct
import unittest
from gen7_trainer import ability_slot, trainer_random, effective_evs
from evolutions import decode
from forms import FormNames
from rom_data import encounter_moves
from export_dynamic_calc import decode_move, trainer_outputs

class Gen7Tests(unittest.TestCase):
    def test_captured_rng_values(self):
        # Captured from the supplied USUM 1.2 constructor during the original audit.
        for species,level,cls,word,slot in [(734,6,3,1718614902,2),(273,7,3,4266833838,1),
                (270,7,3,1880881153,2),(734,5,3,1021953114,2),(734,5,30,4088728885,2),
                (734,5,37,2263993489,2)]:
            self.assertEqual(trainer_random(species,level,cls),word)
            self.assertEqual(ability_slot(species,level,cls,0),slot)
            for explicit in (1,2,3):self.assertEqual(ability_slot(species,level,cls,explicit),explicit)

    def test_ev_clamping_uses_game_stat_order(self):
        self.assertEqual(effective_evs([255,255,255,255,255,255]),[252,252,6,0,0,0])

    def test_move_queue_skips_duplicates_without_refreshing_them(self):
        rows=[(1,1),(2,1),(3,2),(4,2),(1,3),(5,4),(6,9)]
        blob=b''.join(struct.pack('<HH',*x) for x in rows)+b'\xff'*4
        self.assertEqual(encounter_moves(blob,4),[2,3,4,5])

    def test_evolution_level_and_item_are_separate(self):
        raw=struct.pack('<HHHbB',20,1,2,-1,30)+bytes(56)
        branch=decode(raw,1,{(2,1):'Target-Alola'},{'items':['','Razor Fang']})[0]
        self.assertEqual((branch['target'],branch['method'],branch['param'],branch['level']),
                         ('Target-Alola','levelHoldNight','Razor Fang',30))

    def test_gen7_dark_party_and_version_parameters(self):
        raw=struct.pack('<HHHbB',30,0,675,-1,32)+bytes(56)
        self.assertEqual(decode(raw,0,{(675,0):'Pangoro'},{} )[0]['method'],'levelDarkParty')
        raw=struct.pack('<HHHbB',36,33,791,-1,53)+bytes(56)
        self.assertEqual(decode(raw,0,{(791,0):'Solgaleo'},{} )[0]['param'],'Ultra Moon')

    def test_move_drain_priority_and_flags_come_from_record(self):
        raw=bytearray(40);raw[0]=17;raw[2]=2;raw[3]=75;raw[4]=100;raw[5]=10
        raw[6]=255;raw[18]=50;raw[36]=1
        calc,dex=decode_move(raw,'Draining Kiss',577,'')
        self.assertEqual(calc['drain'],[50,100]);self.assertEqual(calc['priority'],-1)
        self.assertTrue(calc['makesContact']);self.assertEqual(dex['bp'],75)

    def test_forms_and_unknown_form_rejection(self):
        f=FormNames()
        self.assertEqual(f(6,2,'Charizard')[0],'Charizard-Mega-Y')
        self.assertEqual(f(773,255,'Silvally','Fire Memory')[0],'Silvally-Fire')
        with self.assertRaises(ValueError):f(1,3,'Bulbasaur')

    def test_duplicate_party_members_and_explicit_order(self):
        q=dict(showdown_species='Magikarp',moves=['Splash'],ivs=dict.fromkeys(('hp','atk','def','spa','spd','spe'),31),
               evs=dict.fromkeys(('hp','atk','def','spa','spd','spe'),0),level=20,nature='Hardy',ability='Swift Swim',
               slot=1,item=None,happiness=255,gender=None,shiny=False)
        teams=[dict(id=7,trainer_class='Fisherman',name='Carl',battle_mode='Singles',pokemon=[q,q|{'slot':2}])]
        sets,order=trainer_outputs(teams,{'Magikarp':{}},lambda x,k:x,{'trainer_order':[7]})
        self.assertEqual(sorted(v['sub_index'] for v in sets['Magikarp'].values()),[0,1])
        self.assertEqual(order['7'],dict(id=7,prev=None,next=None))

if __name__=='__main__':unittest.main()
