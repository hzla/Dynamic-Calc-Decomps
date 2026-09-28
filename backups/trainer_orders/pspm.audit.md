# Photonic Sun source audit

Baseline: supplied Photonic Sun Rebalanced overlay + Ultra Sun v1.2. These are confirmed differences against that build, not a claim about every release.

| Field | Original pspm.js | Community sheet |
|---|---:|---:|
| Nature | 6 | 3 |
| Ability | 136 | 14 |
| Moves | 20 | 17 |

Spelling-only ability differences are excluded: 8 in JS and 11 in the sheet. Another 123 JS move-field changes are spelling, order, or Hidden Power qualification. The 192 sheet entries listing multiple possible abilities are not wrong when the ROM result is included; two unspecified 50/50 entries are also excluded.

The JS lacked seven whole trainer teams (26 Pokémon): Deedra and the six Kantonian Gym teams (Adrian, Blair, Lee, Dallas, Gym Leader, Ryuki). It also lacked 11 members of existing parties: Tatiana’s Horsea, Portia’s second Luvdisc, five of Carl’s Magikarp, and four duplicate Pelipper/Tentacruel in the Lysandre-path Rocket battle. The sheet omits Dylan’s Drifloon. Both sources have four incorrect levels.

The sheet comparison checks 1,520 ordinary trainer Pokémon entries, including displayed Mega stages. Static, Totem, and legendary encounters are outside the ordinary trainer archive and are not counted as ROM-verified nature/ability errors.

All 427 sheet battle blocks (457 component parties/static groups), plus 46 legendary entries, are represented in the corrected JS. There are 1,732 sets and 508 order IDs, including 64 documented synthetic IDs for static encounters. Duplicate party members use level-star labels so the calc displays the full party.

## Original JS: nature differences

| Pokémon / battle | Before | ROM value |
|---|---|---|
| Litten — Lvl 5 Rival Hau \|Route 1\|{Popplio Chosen} | Hardy | Adamant |
| Rowlet — Lvl 5 Rival Hau \|Route 1\|{Litten Chosen} | Hardy | Jolly |
| Popplio — Lvl 5 Rival Hau \|Route 1\|{Rowlet Chosen} | Hardy | Modest |
| Smeargle — Lvl 12 Captain Ilima {Litten Chosen} | Jolly | Hasty |
| Smeargle — Lvl 12 Captain Ilima {Rowlet Chosen} | Jolly | Hasty |
| Smeargle — Lvl 12 Captain Ilima {Popplio Chosen} | Jolly | Hasty |

## Sheet: nature differences

| Pokémon / battle | Before | ROM value |
|---|---|---|
| Popplio — Rival Hau (Rowlet Chosen) | Hardy | Modest |
| Rowlet — Rival Hau (Litten Chosen) | Hardy | Jolly |
| Litten — Rival Hau (Popplio Chosen) | Hardy | Adamant |

## Original JS: moves differences

| Pokémon / battle | Before | ROM value |
|---|---|---|
| Onix — Lvl 36 Hiker Gabriel | Rock Climb, Rock Slide, Slam, Screech | Dig, Dragon Dance, Sand Tomb, Earthquake |
| Paras — Lvl 24 Pokemon Breeder Cory | Fury Cutter, Spore, Leech Seed, Absorb | Stun Spore, Fury Cutter, Spore, Leech Seed |
| Pichu — Lvl 7 Rival Hau \|Iki Town\|{Popplio Chosen} | Thunder Shock, Charm, Tickle | Thunder Shock, Charm, Tail Whip |
| Gligar — Lvl 34 Hiker Calhoun | Slash, U-Turn, Feint Attack, Acrobatics | Acrobatics, Slash, U-turn, Rock Climb |
| Buneary — Lvl 4 Lass Audrey | Foresight, Splash, Pound | Splash, Pound, Foresight, Defense Curl |
| Noctowl — Lvl 35 Golfer Alan | Take Down, Reflect, Air Slash, Night Shade | Take Down, Reflect, Uproar, Air Slash |
| Noctowl — Lvl 40 Police Officer Haruki | Take Down, Reflect, Air Slash, Uproar | Reflect, Uproar, Air Slash, Roost |
| Pikachu — Lvl 11 Pokemon Breeder Ikue | Quick Attack, Thundershock, Growl, Play Nice | Tail Whip, Growl, Play Nice, Quick Attack |
| Popplio — Lvl 8 Rival Hau \|Iki Town\|{Rowlet Chosen} | Water Gun, Growl, Disarming Voice | Pound, Water Gun, Growl, Disarming Voice |
| Steelix — Lvl 39 Worker Frank | Crunch, Sandstorm, Screech, Rock Slide | Dragon Dance, Sand Tomb, Earthquake, Iron Tail |
| Swellow — Lvl 35 Golfer Alan | Double Team, Wing Attack, Quick Attack, Agility | Double Team, Wing Attack, Quick Guard, Agility |
| Basculin-Blue-Striped — Lvl 45 Swimmer Lawrence | Thrash, Psychic Fangs, Flail, Final Gambit | Scary Face, Flail, Final Gambit, Thrash |
| Croagunk — Lvl 25 Backpacker Mikiko | Pursuit, Feint Attack, Revenge, Swagger | Revenge, Swagger, Venoshock, Vacuum Wave |
| Ludicolo — Lvl 100 Swimmer Girls Kylie and Ashlyn | Waterfall, Seed Bomb, Thunder Punch, Rain Dance | Waterfall, Seed Bomb, Thunder Punch, Swords Dance |
| Magikarp — Lvl 26 Fisherman Carl | Splash | Splash, Tackle |
| Purrloin — Lvl 10 Lass Isabella | Scratch, Growl, Assist, Sand Attack | Growl, Assist, Sand Attack, Fury Swipes |
| Venipede — Lvl 20 Bellhop Jody | Pursuit, Protect, Poison Tail, Screech | Rollout, Pursuit, Protect, Poison Tail |
| Reshiram — Lvl 100 Team Plasma Leader Ghetsis \|Prismatic Moon\| | Blue Flare, Draco Meteor, Focus Blast, Surf | Blue Flare, Draco Meteor, Focus Blast, Earth Power |
| Masquerain — Lvl 33 Swimmer Casey | Mud Shot, Silver Wind, Air Cutter, Stun Spore | Mud Shot, Rain Dance, Silver Wind, Air Slash |
| Tentacruel — Lvl 41 Fisherman Mike | Brine, Screech, Barrier, Poison Jab | Poison Jab, Brine, Reflect Type, Screech |

## Sheet: moves differences

| Pokémon / battle | Before | ROM value |
|---|---|---|
| Popplio — Rival Hau (Rowlet Chosen) | Water Gun, Growl, Disarming Voice | Pound, Water Gun, Growl, Disarming Voice |
| Pichu — Rival Hau (Popplio Chosen) | Thunder Shock, Charm, Tickle | Thunder Shock, Charm, Tail Whip |
| Purrloin — Lass Isabella | Scratch, Growl, Assist, Sand Attack | Growl, Assist, Sand Attack, Fury Swipes |
| Pikachu — Pokemon Breeder Ikue | Quick Attack, Thundershock, Growl, Play Nice | Tail Whip, Growl, Play Nice, Quick Attack |
| Venipede — Bellhop Jody | Pursuit, Protect, Poison Tail, Screech | Rollout, Pursuit, Protect, Poison Tail |
| Paras — Pokemon Breeder Cory | Fury Cutter, Spore, Leech Seed, Absorb | Stun Spore, Fury Cutter, Spore, Leech Seed |
| Croagunk — Backpacker Mikiko | Pursuit, Feint Attack, Revenge, Swagger | Revenge, Swagger, Venoshock, Vacuum Wave |
| Masquerain — Swimmer Casey | Mud Shot, Silver Wind, Air Cutter, Stun Spore | Mud Shot, Rain Dance, Silver Wind, Air Slash |
| Gligar — Hiker Calhoun | Slash, U-Turn, Feint Attack, Acrobatics | Acrobatics, Slash, U-turn, Rock Climb |
| Noctowl — Golfer Alan | Take Down, Reflect, Air Slash, Night Shade | Take Down, Reflect, Uproar, Air Slash |
| Swellow — Golfer Alan | Double Team, Wing Attack, Quick Attack, Agility | Double Team, Wing Attack, Quick Guard, Agility |
| Onix — Hiker Gabriel | Rock Climb, Rock Slide, Slam, Screech | Dig, Dragon Dance, Sand Tomb, Earthquake |
| Steelix — Worker Frank (Right side of cave entrence) | Crunch, Sandstorm, Screech, Rock Slide | Dragon Dance, Sand Tomb, Earthquake, Iron Tail |
| Noctowl — Police Officer Haruki | Take Down, Reflect, Air Slash, Uproar | Reflect, Uproar, Air Slash, Roost |
| Tentacruel — Fisherman Mike | Brine, Screech, Barrier, Poison Jab | Poison Jab, Brine, Reflect Type, Screech |
| Basculin-Blue-Striped — Swimmer Lawrence | Thrash, Psychic Fangs, Flail, Final Gambit | Scary Face, Flail, Final Gambit, Thrash |
| Ludicolo — Swimmer Girls Kylie and Ashlyn | Waterfall, Seed Bomb, Thunder Punch, Rain Dance | Waterfall, Seed Bomb, Thunder Punch, Swords Dance |

## Original JS: ability differences

| Pokémon / battle | Before | ROM value |
|---|---|---|
| Seel — Lvl 26 Swimmer Shelby | Thick Fat | Fur Coat |
| Absol — Lvl 85 Aether President Lusamine | Super Luck | Justified |
| Aipom — Lvl 40 Preschooler Liam | Run Away | Pickup |
| Budew — Lvl 10 Pokemon Breeder Jay | Natural Cure | Poison Point |
| Golem — Lvl 100 Team Rainbow Rocket Grunt 5 \|Maxie Path\| | Sturdy | Rock Head |
| Inkay — Lvl 7 Youngster Kevin | Contrary | Suction Cups |
| Munna — Lvl 10 Preschooler Malia | Forewarn | Synchronize |
| Ralts — Lvl 4 Lass Audrey | Synchronize | Trace |
| Yanma — Lvl 35 Golfer Maile | Speed Boost | Compound Eyes |
| Amaura — Lvl 33 Scientist Tyrone | Refrigerate | Snow Warning |
| Feebas — Lvl 25 Fisherman Hal | Swift Swim | Oblivious |
| Flaaffy — Lvl 27 Pokemon Breeder William | Static | Mold Breaker |
| Furret — Lvl 33 Backpacker Kiana | Fur Coat | Keen Eye |
| Gengar — Lvl 100 Punk Pair Marie and Troy | Levitate | Cursed Body |
| Gengar — Lvl 68 Team Skull Grunt 1 \|Route 17\| | Levitate | Cursed Body |
| Gligar — Lvl 34 Hiker Calhoun | Hyper Cutter | Sand Veil |
| Horsea — Lvl 26 Swimmer Shelby | Swift Swim | Sniper |
| Horsea — Lvl 25 Fisherman Ernest | Swift Swim | Sniper |
| Ivysaur — Lvl 27 Beauty Brittney | Overgrow | Effect Spore |
| Ledian — Lvl 40 Preschooler Liam | Early Bird | Aerilate |
| Meowth — Lvl 21 Sightseer Perdita | Pickup | Technician |
| Mewtwo — Lvl 100 Team Rainbow Rocket Giovanni \|Photonic Sun\| | Steadfast | Pressure |
| Mewtwo — Lvl 100 Team Rainbow Rocket Giovanni \|Prismatic Moon\| | Insomnia | Pressure |
| Pinsir — Lvl 100 Team Skull Boss Guzma \|Rainbow Rocket Ally\| | Mold Breaker | Hyper Cutter |
| Pinsir — Lvl 75 Team Skull Boss Guzma \|Shady House\| | Mold Breaker | Hyper Cutter |
| Pinsir — Lvl 82 Team Skull Boss Guzma \|Aether Paradise\| | Mold Breaker | Hyper Cutter |
| Rhydon — Lvl 48 Sightseer Mitch | Rock Head | Lightning Rod |
| Rowlet — Lvl 5 Rival Hau \|Route 1\|{Litten Chosen} | Overgrow | Tinted Lens |
| Rowlet — Lvl 8 Rival Hau \|Iki Town\|{Litten Chosen} | Long Reach | Tinted Lens |
| Scizor — Lvl 100 Veteran Leon | Technician | Light Metal |
| Scizor — Lvl 94 Ace Trainer Seth | Technician | Light Metal |
| Seedot — Lvl 7 Lass Madison | Early Bird | Chlorophyll |
| Seadra — Lvl 45 Swimmer Robby | Sniper | Poison Point |
| Skrelp — Lvl 32 Swimmer Vanessa | Poison Point | Poison Touch |
| Staryu — Lvl 33 Swimmer Casey | Natural Cure | Illuminate |
| Togepi — Lvl 47 Preschooler Nancy | Serene Grace | Hustle |
| Ariados — Lvl 70 Team Skull Grunt 1 \|Po Town\| | Merciless | Insomnia |
| Azurill — Lvl 47 Preschooler Nancy | Huge Power | Thick Fat |
| Azurill — Lvl 10 Pokemon Breeder Jay | Huge Power | Thick Fat |
| Banette — Lvl 85 Veteran Harry | Prankster | Insomnia |
| Bruxish — Lvl 64 Swimmer Alexandria | Strong Jaw | Dazzling |
| Buneary — Lvl 4 Lass Audrey | Run Away | Klutz |
| Bunnelby — Lvl 4 Preschooler Oliver | Cheeck Pouch | Pickup |
| Cradily — Lvl 78 Aether Foundation Employees 12 & 13  | Storm Drain | Suction Cups |
| Dedenne — Lvl 49 Preschooler Hayden | Pixilate | Galvanize |
| Dewgong — Lvl 64 Surfer Jennis | Fur Coat | Hydration |
| Dugtrio — Lvl 100 Team Rainbow Rocket Giovanni \|Photonic Sun\| | Sheer Force | Sand Force |
| Dugtrio — Lvl 100 Team Rainbow Rocket Giovanni \|Prismatic Moon\| | Sheer Force | Sand Force |
| Dwebble — Lvl 24 Pokemon Breeder Cory | Sturdy | Shell Armor |
| Florges — Lvl 68 Dancer Mireille | Misty Surge | Flower Veil |
| Glameow — Lvl 21 Madame Elizabeth | Limber | Own Tempo |
| Goldeen — Lvl 25 Fisherman Ernest | Lightning Rod | Swift Swim |
| Haunter — Lvl 100 Team Rainbow Rocket Grunt 3 \|Entrance\| | Levitate | Cursed Body |
| Linoone — Lvl 84 Team Skull Grunt 1 \|Ancient Poni Path\| | Gluttony | Pickup |
| Lopunny — Lvl 93 Trial Captain Ilima \|Mina's Trial\| | Scrappy | Limber |
| Machamp — Lvl 35 Karate Family Samuel and Guy | No Guard | Guts |
| Noctowl — Lvl 35 Golfer Alan | Insomnia | Keen Eye |
| Omanyte — Lvl 33 Scientist Tyrone | Shell Armor | Swift Swim |
| Persian — Lvl 34 Sightseer Mariah | Technician | Super Luck |
| Persian — Lvl 100 Team Rainbow Rocket Grunt 2 \|Entrance\| | Technician | Super Luck |
| Pidgeot — Lvl 58 Lass Rika | No Guard | Tangled Feet |
| Pidgeot — Lvl 100 Pokemon Trainer Blue | No Guard | Tangled Feet |
| Pikipek — Lvl 10 Office Worker Jeremy | Keen Eye | Skill Link |
| Psyduck — Lvl 16 Rising Star Ian | Damp | Cloud Nine |
| Rattata — Lvl 21 Sightseer Scotty | Guts | Run Away |
| Rhyhorn — Lvl 39 Worker Jeff | Rock Head | Lightning Rod |
| Sableye — Lvl 22 Gentleman Gerald | Keen Eye | Stall |
| Sableye — Lvl 77 Island Kahuna Nanu | Keen Eye | Prankster |
| Sableye — Lvl 93 Island Kahuna Nanu \|Mina's Trial\| | Keen Eye | Prankster |
| Seaking — Lvl 45 Swimmer Laura | Swift Swim | Water Veil |
| Seviper — Lvl 70 Team Skull Grunt 7 \|Po Town\| | Merciless | Shed Skin |
| Shellos — Lvl 7 Youngster Kevin | Storm Drain | Sticky Hold |
| Slaking — Lvl 62 Team Skull Grunt \|Route 15\| | Truant | Slow Start |
| Slakoth — Lvl 10 Office Worker Jeremy | Truant | Slow Start |
| Starmie — Lvl 45 Swimmer Laura | Natural Cure | Illuminate |
| Wailmer — Lvl 33 Swimmer Tiare | Water Veil | Oblivious |
| Yungoos — Lvl 6 Lass Madison | Stakeout | Strong Jaw |
| Accelgor — Lvl 54 Team Skull Grunt 2 \|Route 10\| | Dry Skin | Sticky Hold |
| Ampharos — Lvl 95 Ace Trainer Jada | Mold Breaker | Static |
| Ampharos — Lvl 100 Ace Trainer Angela | Mold Breaker | Static |
| Bronzong — Lvl 42 Team Skull Grunt \|Memorial Hill\| | Levitate | Heatproof |
| Camerupt — Lvl 100 Team Magma Leader Maxie | Sheer Force | Solid Rock |
| Clefable — Lvl 54 Office Worker Jessica | Magic Guard | Cute Charm |
| Cranidos — Lvl 33 Scientist Tyrone | Mold Breaker | Sheer Force |
| Cutiefly — Lvl 10 Beauty Krystal | Shield Dust | Honey Gather |
| Fennekin — Lvl 27 Pokemon Breeder William | Blaze | Magic Guard |
| Houndoom — Lvl 54 Team Skull Grunt 1 \|Route 10\| | Flash Fire | Early Bird |
| Jangmo-o — Lvl 19 Collector Bryan | Bulletproof | Soundproof |
| Ludicolo — Lvl 100 Team Rainbow Rocket Grunt 5 \|Archie Path\| | Swift Swim | Rain Dish |
| Lumineon — Lvl 61 Swimmer Kyra | Storm Drain | Swift Swim |
| Medicham — Lvl 100 Black Belt Duane | Huge Power | Pure Power |
| Morelull — Lvl 22 Pokemon Breeder Yuka | Effect Spore | Illuminate |
| Nidorina — Lvl 21 Sightseer Perdita | Rivalry | Poison Point |
| Raticate — Lvl 48 Sightseer Mitch | Guts | Strong Jaw |
| Raticate — Lvl 58 Youngster Tyler | Guts | Strong Jaw |
| Remoraid — Lvl 26 Swimmer Kalani | Hustle | Sniper |
| Rockruff — Lvl 10 Pokemon Breeder Jay | Keen Eye | Vital Spirit |
| Sceptile — Lvl 93 Trial Captain Mallow | Overgrow | Solar Power |
| Sceptile — Lvl 100 Trial Captain Mallow \|Rematch\| | Overgrow | Solar Power |
| Sharpedo — Lvl 81 Ace Trainer Kekoa | Strong Jaw | Speed Boost |
| Sharpedo — Lvl 100 Team Aqua Leader Archie | Strong Jaw | Speed Boost |
| Swampert — Lvl 61 Surfer Robert | Torrent | Swift Swim |
| Swampert — Lvl 93 Trial Captain Lana | Swift Swim | Damp |
| Venomoth — Lvl 37 Youngster Caleb | Tinted Lens | Shield Dust |
| Venusaur — Lvl 88 Veteran Heather | Overgrow | Chlorophyll |
| Whiscash — Lvl 83 Swimmer Derek | Oblivious | Adaptability |
| Alomomola — Lvl 33 Swimmer Tiare | Healer | Hydration |
| Blastoise — Lvl 100 Firefighter Aiden | Torrent | Rain Dish |
| Bounsweet — Lvl 27 Pokemon Breeder William | Oblivious | Leaf Guard |
| Charizard — Lvl 96 Master & Apprentice Kaimana and Breon | Blaze | Tough Claws |
| Gardevoir — Lvl 100 Ace Trainer Jackson | Trace | Synchronize |
| Gastrodon — Lvl 65 Team Skull Grunt \|Route 16\| | Storm Drain | Sticky Hold |
| Heracross — Lvl 87 Black Belt Terry | Moxie | Guts |
| Jellicent — Lvl 46 Swimmer Chelsea | Water Absorb | Cursed Body |
| Muk-Alola — Lvl 65 Scientist Reid | Poison Touch | Gluttony |
| Octillery — Lvl 45 Swimmer Laura | Sniper | Suction Cups |
| Pachirisu — Lvl 49 Preschooler Hayden | Fur Coat | Pickup |
| Palossand — Lvl 61 Surfer Robert | Sand Stream | Water Compaction |
| Poliwhirl — Lvl 26 Fisherman Herbert | Water Absorb | Damp |
| Poliwrath — Lvl 45 Swimmer Lawrence | Damp | Water Absorb |
| Reuniclus — Lvl 65 Team Skull Grunt \|Route 16\| | Magic Guard | Overcoat |
| Toucannon — Lvl 75 Aether Foundation Employee 1  | Skill Link | Keen Eye |
| Vanilluxe — Lvl 50 Beauty Andrea | Snow Warning | Ice Body |
| Vespiquen — Lvl 54 Collector Todd | Pressure | Intimidate |
| Aerodactyl — Lvl 95 Collector Minty | Rock Head | Pressure |
| Barbaracle — Lvl 61 Swimmer Sara | Poison Point | Tough Claws |
| Conkeldurr — Lvl 35 Karate Family Samuel and Guy | Sheer Force | Guts |
| Jigglypuff — Lvl 26 Dancing Family Jen and Fumiko | Fur Coat | Competitive |
| Seismitoad — Lvl 49 Janitor Melvin | Water Absorb | Poison Touch |
| Tentacruel — Lvl 61 Swimmer Keoni | Clear Body | Liquid Ooze |
| Turtonator — Lvl 84 Collector Raymond | Iron Barbs | Shell Armor |
| Crabominable — Lvl 42 Black Belt Kenji | Iron Fist | Hyper Cutter |
| Crabominable — Lvl 87 Black Belt Terry | Iron Fist | Hyper Cutter |
| Gardevoir-Mega — Lvl 95 Veteran Ella | Trace | Pixilate |
| Gardevoir-Mega — Lvl 100 Ace Trainer Jackson | Trace | Pixilate |
| Raticate-Alola — Lvl 68 Team Skull Grunt 1 \|Route 17\| | Gluttony | Strong Jaw |

## Sheet: ability differences

| Pokémon / battle | Before | ROM value |
|---|---|---|
| Rowlet — Rival Hau (Litten Chosen) | Long Reach | Tinted Lens |
| Amaura — Scientist Tyrone (starts fight with an X Attack) | Refrigerate | Snow Warning |
| Primeape — Black Belt Ross | Vital Spirit/Anger Point | Defiant |
| Malamar — Kantonian Gym Dallas | Contrary | Infiltrator |
| Cradily — Aether Foundation Employees (Tag with Hau) | Storm Drain | Suction Cups |
| Whiscash — Swimmer Derek | Oblivious | Adaptability |
| Manectric-Mega — Trial Captain Sophocles (PHOTONIC SUN ONLY) | Static->Intimidate | Lightning Rod->Intimidate |
| Gardevoir-Mega — Veteran Ella (Guards Icium Z) | Trace | Pixilate |
| Charizard-Mega-X — Master & Apprentice Kaimana and Breon | Blaze->Tough Claws | Tough Claws->Tough Claws |
| Haunter — Team Rainbow Rocket Grunt | Levitate | Cursed Body |
| Ludicolo — Team Rainbow Rocket Grunt (Teleporter 2) | Swift Swim | Rain Dish |
| Dugtrio — Team Rainbow Rocket Giovanni (PHOTONIC SUN) (2 Full Restores) | Sheer Force | Sand Force |
| Gardevoir-Mega — Ace Trainer Jackson | Synchronize->Trace | Synchronize->Pixilate |
| Medicham — Black Belt Duane | Huge Power | Pure Power |

## Sheet: level differences

| Pokémon / battle | Before | ROM value |
|---|---|---|
| Buneary — Lass Audrey | 4 | 3 |
| Litten — Rival Hau (Popplio Chosen) | 7 | 8 |
| Yungoos — Ilima (Rowlet Chosen) (1 Potion, 1 Full Heal) | 10 | 11 |
| Tangrowth — Rival Hau (Popplio Chosen) (Ally) | 42 | 41 |

