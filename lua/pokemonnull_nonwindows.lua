-- AUTO-GENERATED. Edit files in null/src and run null/build_bundle.py

NULL_BUILD_PLATFORM = "nonwindows"

-- >>> BEGIN 00_data_showdown.lua
-- Module Index: 00_data_showdown
-- Owns: static game data tables, Gen3 decode/export helpers, showdown/hidden-power output helpers.

-- you do not need this lua script, though it will allow you to with mgba 0.10 to export your pokemon to the calc
-- to use download this file on mgba select tools->scripting then file->open and open this file

move = {"",
"Pound",
"Karate Chop",
"Double Slap",
"Comet Punch",
"Mega Punch",
"Pay Day",
"Fire Punch",
"Ice Punch",
"Thunder Punch",
"Scratch",
"Vise Grip",
"Guillotine",
"Razor Wind",
"Swords Dance",
"Cut",
"Gust",
"Wing Attack",
"Whirlwind",
"Fly",
"Bind",
"Slam",
"Vine Whip",
"Stomp",
"Double Kick",
"Mega Kick",
"Jump Kick",
"Rolling Kick",
"Sand Attack",
"Headbutt",
"Horn Attack",
"Fury Attack",
"Horn Drill",
"Tackle",
"Body Slam",
"Wrap",
"Take Down",
"Thrash",
"Double-Edge",
"Tail Whip",
"Poison Sting",
"Twineedle",
"Pin Missile",
"Leer",
"Bite",
"Growl",
"Roar",
"Sing",
"Supersonic",
"Sonic Boom",
"Disable",
"Acid",
"Ember",
"Flamethrower",
"Mist",
"Water Gun",
"Hydro Pump",
"Surf",
"Ice Beam",
"Blizzard",
"Psybeam",
"Bubble Beam",
"Aurora Beam",
"Hyper Beam",
"Peck",
"Drill Peck",
"Submission",
"Low Kick",
"Counter",
"Seismic Toss",
"Strength",
"Absorb",
"Mega Drain",
"Leech Seed",
"Growth",
"Razor Leaf",
"Solar Beam",
"Poison Powder",
"Stun Spore",
"Sleep Powder",
"Petal Dance",
"String Shot",
"Dragon Rage",
"Fire Spin",
"Thunder Shock",
"Thunderbolt",
"Thunder Wave",
"Thunder",
"Rock Throw",
"Earthquake",
"Fissure",
"Dig",
"Toxic",
"Confusion",
"Psychic",
"Hypnosis",
"Meditate",
"Agility",
"Quick Attack",
"Rage",
"Teleport",
"Night Shade",
"Mimic",
"Screech",
"Double Team",
"Recover",
"Harden",
"Minimize",
"Smokescreen",
"Confuse Ray",
"Withdraw",
"Defense Curl",
"Barrier",
"Light Screen",
"Haze",
"Reflect",
"Focus Energy",
"Bide",
"Metronome",
"Mirror Move",
"Self-Destruct",
"Egg Bomb",
"Lick",
"Smog",
"Sludge",
"Bone Club",
"Fire Blast",
"Waterfall",
"Clamp",
"Swift",
"Skull Bash",
"Spike Cannon",
"Constrict",
"Amnesia",
"Kinesis",
"Soft Boiled",
"High Jump Kick",
"Glare",
"Dream Eater",
"Poison Gas",
"Barrage",
"Leech Life",
"Lovely Kiss",
"Sky Attack",
"Transform",
"Bubble",
"Dizzy Punch",
"Spore",
"Flash",
"Psywave",
"Splash",
"Acid Armor",
"Crabhammer",
"Explosion",
"Fury Swipes",
"Bonemerang",
"Rest",
"Rock Slide",
"Hyper Fang",
"Sharpen",
"Conversion",
"Tri Attack",
"Super Fang",
"Slash",
"Substitute",
"Struggle",
"Sketch",
"Triple Kick",
"Thief",
"Spider Web",
"Mind Reader",
"Nightmare",
"Flame Wheel",
"Snore",
"Curse",
"Flail",
"Conversion 2",
"Aeroblast",
"Cotton Spore",
"Reversal",
"Spite",
"Powder Snow",
"Protect",
"Mach Punch",
"Scary Face",
"Feint Attack",
"Sweet Kiss",
"Belly Drum",
"Sludge Bomb",
"Mud-Slap",
"Octazooka",
"Spikes",
"Zap Cannon",
"Foresight",
"Destiny Bond",
"Perish Song",
"Icy Wind",
"Detect",
"Bone Rush",
"Lock-On",
"Outrage",
"Sandstorm",
"Giga Drain",
"Endure",
"Charm",
"Rollout",
"False Swipe",
"Swagger",
"Milk Drink",
"Spark",
"Fury Cutter",
"Steel Wing",
"Mean Look",
"Attract",
"Sleep Talk",
"Heal Bell",
"Return",
"Present",
"Frustration",
"Safeguard",
"Pain Split",
"Sacred Fire",
"Magnitude",
"Dynamic Punch",
"Megahorn",
"Dragon Breath",
"Baton Pass",
"Encore",
"Pursuit",
"Rapid Spin",
"Sweet Scent",
"Iron Tail",
"Metal Claw",
"Vital Throw",
"Morning Sun",
"Synthesis",
"Moonlight",
"Hidden Power",
"Cross Chop",
"Twister",
"Rain Dance",
"Sunny Day",
"Crunch",
"Mirror Coat",
"Psych Up",
"Extreme Speed",
"Ancient Power",
"Shadow Ball",
"Future Sight",
"Rock Smash",
"Whirlpool",
"Beat Up",
"Fake Out",
"Uproar",
"Stockpile",
"Spit Up",
"Swallow",
"Heat Wave",
"Hail",
"Torment",
"Flatter",
"Will-O-Wisp",
"Memento",
"Facade",
"Focus Punch",
"Smelling Salts",
"Follow Me",
"Nature Power",
"Charge",
"Taunt",
"Helping Hand",
"Trick",
"Role Play",
"Wish",
"Assist",
"Ingrain",
"Superpower",
"Magic Coat",
"Recycle",
"Revenge",
"Brick Break",
"Yawn",
"Knock Off",
"Endeavor",
"Eruption",
"Skill Swap",
"Imprison",
"Refresh",
"Grudge",
"Snatch",
"Secret Power",
"Dive",
"Arm Thrust",
"Camouflage",
"Tail Glow",
"Luster Purge",
"Mist Ball",
"Feather Dance",
"Teeter Dance",
"Blaze Kick",
"Mud Sport",
"Ice Ball",
"Needle Arm",
"Slack Off",
"Hyper Voice",
"Poison Fang",
"Crush Claw",
"Blast Burn",
"Hydro Cannon",
"Meteor Mash",
"Astonish",
"Weather Ball",
"Aromatherapy",
"Fake Tears",
"Air Cutter",
"Overheat",
"Odor Sleuth",
"Rock Tomb",
"Silver Wind",
"Metal Sound",
"Grass Whistle",
"Tickle",
"Cosmic Power",
"Water Spout",
"Signal Beam",
"Shadow Punch",
"Extrasensory",
"Sky Uppercut",
"Sand Tomb",
"Sheer Cold",
"Muddy Water",
"Bullet Seed",
"Aerial Ace",
"Icicle Spear",
"Iron Defense",
"Block",
"Howl",
"Dragon Claw",
"Frenzy Plant",
"Bulk Up",
"Bounce",
"Mud Shot",
"Poison Tail",
"Covet",
"Volt Tackle",
"Magical Leaf",
"Water Sport",
"Calm Mind",
"Leaf Blade",
"Dragon Dance",
"Rock Blast",
"Shock Wave",
"Water Pulse",
"Doom Desire",
"Psycho Boost",
"Roost",
"Gravity",
"Miracle Eye",
"Wake-Up Slap",
"Hammer Arm",
"Gyro Ball",
"Healing Wish",
"Brine",
"Natural Gift",
"Feint",
"Pluck",
"Tailwind",
"Acupressure",
"Metal Burst",
"U-turn",
"Close Combat",
"Payback",
"Assurance",
"Embargo",
"Fling",
"Psycho Shift",
"Trump Card",
"Heal Block",
"Wring Out",
"Power Trick",
"Gastro Acid",
"Lucky Chant",
"Me First",
"Copycat",
"Power Swap",
"Guard Swap",
"Punishment",
"Last Resort",
"Worry Seed",
"Sucker Punch",
"Toxic Spikes",
"Heart Swap",
"Aqua Ring",
"Magnet Rise",
"Flare Blitz",
"Force Palm",
"Aura Sphere",
"Rock Polish",
"Poison Jab",
"Dark Pulse",
"Night Slash",
"Aqua Tail",
"Seed Bomb",
"Air Slash",
"X-Scissor",
"Bug Buzz",
"Dragon Pulse",
"Dragon Rush",
"Power Gem",
"Drain Punch",
"Vacuum Wave",
"Focus Blast",
"Energy Ball",
"Brave Bird",
"Earth Power",
"Switcheroo",
"Giga Impact",
"Nasty Plot",
"Bullet Punch",
"Avalanche",
"Ice Shard",
"Shadow Claw",
"Thunder Fang",
"Ice Fang",
"Fire Fang",
"Shadow Sneak",
"Mud Bomb",
"Psycho Cut",
"Zen Headbutt",
"Mirror Shot",
"Flash Cannon",
"Rock Climb",
"Defog",
"Trick Room",
"Draco Meteor",
"Discharge",
"Lava Plume",
"Leaf Storm",
"Power Whip",
"Rock Wrecker",
"Cross Poison",
"Gunk Shot",
"Iron Head",
"Magnet Bomb",
"Stone Edge",
"Captivate",
"Stealth Rock",
"Grass Knot",
"Chatter",
"Judgment",
"Bug Bite",
"Charge Beam",
"Wood Hammer",
"Aqua Jet",
"Attack Order",
"Defend Order",
"Heal Order",
"Head Smash",
"Double Hit",
"Roar of Time",
"Spacial Rend",
"Lunar Dance",
"Crush Grip",
"Magma Storm",
"Dark Void",
"Seed Flare",
"Ominous Wind",
"Shadow Force",
"Hone Claws",
"Wide Guard",
"Guard Split",
"Power Split",
"Wonder Room",
"Psyshock",
"Venoshock",
"Autotomize",
"Rage Powder",
"Telekinesis",
"Magic Room",
"Smack Down",
"Storm Throw",
"Flame Burst",
"Sludge Wave",
"Quiver Dance",
"Heavy Slam",
"Synchronoise",
"Electro Ball",
"Soak",
"Flame Charge",
"Coil",
"Low Sweep",
"Acid Spray",
"Foul Play",
"Simple Beam",
"Entrainment",
"After You",
"Round",
"Echoed Voice",
"Chip Away",
"Clear Smog",
"Stored Power",
"Quick Guard",
"Ally Switch",
"Scald",
"Shell Smash",
"Heal Pulse",
"Hex",
"Sky Drop",
"Shift Gear",
"Circle Throw",
"Incinerate",
"Quash",
"Acrobatics",
"Reflect Type",
"Retaliate",
"Final Gambit",
"Bestow",
"Inferno",
"Water Pledge",
"Fire Pledge",
"Grass Pledge",
"Volt Switch",
"Struggle Bug",
"Bulldoze",
"Frost Breath",
"Dragon Tail",
"Work Up",
"Electroweb",
"Wild Charge",
"Drill Run",
"Dual Chop",
"Heart Stamp",
"Horn Leech",
"Sacred Sword",
"Razor Shell",
"Heat Crash",
"Leaf Tornado",
"Steamroller",
"Cotton Guard",
"Night Daze",
"Psystrike",
"Tail Slap",
"Hurricane",
"Head Charge",
"Gear Grind",
"Searing Shot",
"Techno Blast",
"Relic Song",
"Secret Sword",
"Glaciate",
"Bolt Strike",
"Blue Flare",
"Fiery Dance",
"Freeze Shock",
"Ice Burn",
"Snarl",
"Icicle Crash",
"V-create",
"Fusion Flare",
"Fusion Bolt",
"Flying Press",
"Mat Block",
"Belch",
"Rototiller",
"Sticky Web",
"Fell Stinger",
"Phantom Force",
"Trick-or-Treat",
"Noble Roar",
"Ion Deluge",
"Parabolic Charge",
"Forest's Curse",
"Petal Blizzard",
"Freeze-Dry",
"Disarming Voice",
"Parting Shot",
"Topsy-Turvy",
"Draining Kiss",
"Crafty Shield",
"Flower Shield",
"Grassy Terrain",
"Misty Terrain",
"Electrify",
"Play Rough",
"Fairy Wind",
"Moonblast",
"Boomburst",
"Fairy Lock",
"King's Shield",
"Play Nice",
"Confide",
"Diamond Storm",
"Steam Eruption",
"Hyperspace Hole",
"Water Shuriken",
"Mystical Fire",
"Spiky Shield",
"Aromatic Mist",
"Eerie Impulse",
"Venom Drench",
"Powder",
"Geomancy",
"Magnetic Flux",
"Happy Hour",
"Electric Terrain",
"Dazzling Gleam",
"Celebrate",
"Hold Hands",
"Baby-Doll Eyes",
"Nuzzle",
"Hold Back",
"Infestation",
"Power-Up Punch",
"Oblivion Wing",
"Thousand Arrows",
"Thousand Waves",
"Land's Wrath",
"Light of Ruin",
"Origin Pulse",
"Precipice Blades",
"Dragon Ascent",
"Hyperspace Fury",
"Shore Up",
"First Impression",
"Baneful Bunker",
"Spirit Shackle",
"Darkest Lariat",
"Sparkling Aria",
"Ice Hammer",
"Floral Healing",
"High Horsepower",
"Strength Sap",
"Solar Blade",
"Leafage",
"Spotlight",
"Toxic Thread",
"Laser Focus",
"Gear Up",
"Throat Chop",
"Pollen Puff",
"Anchor Shot",
"Psychic Terrain",
"Lunge",
"Fire Lash",
"Power Trip",
"Burn Up",
"Speed Swap",
"Smart Strike",
"Purify",
"Revelation Dance",
"Core Enforcer",
"Trop Kick",
"Instruct",
"Beak Blast",
"Clanging Scales",
"Dragon Hammer",
"Brutal Swing",
"Aurora Veil",
"Shell Trap",
"Fleur Cannon",
"Psychic Fangs",
"Stomping Tantrum",
"Shadow Bone",
"Accelerock",
"Liquidation",
"Prismatic Laser",
"Spectral Thief",
"Sunsteel Strike",
"Moongeist Beam",
"Tearful Look",
"Zing Zap",
"Nature's Madness",
"Multi-Attack",
"Mind Blown",
"Plasma Fists",
"Photon Geyser",
"Zippy Zap",
"Splishy Splash",
"Floaty Fall",
"Pika Papow",
"Bouncy Bubble",
"Buzzy Buzz",
"Sizzly Slide",
"Glitzy Glow",
"Baddy Bad",
"Sappy Seed",
"Freezy Frost",
"Sparkly Swirl",
"Veevee Volley",
"Double Iron Bash",
"Dynamax Cannon",
"Snipe Shot",
"Jaw Lock",
"Stuff Cheeks",
"No Retreat",
"Tar Shot",
"Magic Powder",
"Dragon Darts",
"Teatime",
"Octolock",
"Bolt Beak",
"Fishious Rend",
"Court Change",
"Clangorous Soul",
"Body Press",
"Decorate",
"Drum Beating",
"Snap Trap",
"Pyro Ball",
"Behemoth Blade",
"Behemoth Bash",
"Aura Wheel",
"Breaking Swipe",
"Branch Poke",
"Overdrive",
"Apple Acid",
"Grav Apple",
"Spirit Break",
"Strange Steam",
"Life Dew",
"Obstruct",
"False Surrender",
"Meteor Assault",
"Eternabeam",
"Steel Beam",
"Expanding Force",
"Steel Roller",
"Scale Shot",
"Meteor Beam",
"Shell Side Arm",
"Misty Explosion",
"Grassy Glide",
"Rising Voltage",
"Terrain Pulse",
"Skitter Smack",
"Burning Jealousy",
"Lash Out",
"Poltergeist",
"Corrosive Gas",
"Coaching",
"Flip Turn",
"Triple Axel",
"Dual Wingbeat",
"Scorching Sands",
"Jungle Healing",
"Wicked Blow",
"Surging Strikes",
"Thunder Cage",
"Dragon Energy",
"Freezing Glare",
"Fiery Wrath",
"Thunderous Kick",
"Glacial Lance",
"Astral Barrage",
"Eerie Spell",
"Dire Claw",
"Psyshield Bash",
"Power Shift",
"Stone Axe",
"Springtide Storm",
"Mystical Power",
"Raging Fury",
"Wave Crash",
"Chloroblast",
"Mountain Gale",
"Victory Dance",
"Headlong Rush",
"Barb Barrage",
"Esper Wing",
"Bitter Malice",
"Shelter",
"Triple Arrows",
"Infernal Parade",
"Ceaseless Edge",
"Bleakwind Storm",
"Wildbolt Storm",
"Sandsear Storm",
"Lunar Blessing",
"Take Heart",
"Tera Blast",
"Silk Trap",
"Axe Kick",
"Last Respects",
"Lumina Crash",
"Order Up",
"Jet Punch",
"Spicy Extract",
"Spin Out",
"Population Bomb",
"Ice Spinner",
"Glaive Rush",
"Revival Blessing",
"Salt Cure",
"Triple Dive",
"Mortal Spin",
"Doodle",
"Fillet Away",
"Kowtow Cleave",
"Flower Trick",
"Torch Song",
"Aqua Step",
"Raging Bull",
"Make It Rain",
"Ruination",
"Collision Course",
"Electro Drift",
"Shed Tail",
"Chilly Reception",
"Tidy Up",
"Snowscape",
"Pounce",
"Trailblaze",
"Chilling Water",
"Hyper Drill",
"Twin Beam",
"Rage Fist",
"Armor Cannon",
"Bitter Blade",
"Double Shock",
"Gigaton Hammer",
"Comeuppance",
"Aqua Cutter",
"Blazing Torque",
"Wicked Torque",
"Noxious Torque",
"Combat Torque",
"Magical Torque",
"Psyblade",
"Hydro Steam",
"Blood Moon",
"Matcha Gotcha",
"Syrup Bomb",
"Ivy Cudgel",
"Electro Shot",
"Tera Starstorm",
"Fickle Beam",
"Burning Bulwark",
"Thunderclap", 
"Mighty Cleave",
"Tachyon Cutter", 
"Hard Press", 
"Dragon Cheer",
"Alluring Voice",
"Temper Flare",
"Supercell Slam",
"Psychic Noise",
"Upper Hand",
"Malignant Chain",
"Nihil Light"
}

mons = {
"Bulbasaur",
"Ivysaur",
"Venusaur",
"Charmander",
"Charmeleon",
"Charizard",
"Squirtle",
"Wartortle",
"Blastoise",
"Caterpie",
"Metapod",
"Butterfree",
"Weedle",
"Kakuna",
"Beedrill",
"Pidgey",
"Pidgeotto",
"Pidgeot",
"Rattata",
"Raticate",
"Spearow",
"Fearow",
"Ekans",
"Arbok",
"Pikachu",
"Raichu",
"Sandshrew",
"Sandslash",
"Nidoran-F",
"Nidorina",
"Nidoqueen",
"Nidoran-M",
"Nidorino",
"Nidoking",
"Clefairy",
"Clefable",
"Vulpix",
"Ninetales",
"Jigglypuff",
"Wigglytuff",
"Zubat",
"Golbat",
"Oddish",
"Gloom",
"Vileplume",
"Paras",
"Parasect",
"Venonat",
"Venomoth",
"Diglett",
"Dugtrio",
"Meowth",
"Persian",
"Psyduck",
"Golduck",
"Mankey",
"Primeape",
"Growlithe",
"Arcanine",
"Poliwag",
"Poliwhirl",
"Poliwrath",
"Abra",
"Kadabra",
"Alakazam",
"Machop",
"Machoke",
"Machamp",
"Bellsprout",
"Weepinbell",
"Victreebel",
"Tentacool",
"Tentacruel",
"Geodude",
"Graveler",
"Golem",
"Ponyta",
"Rapidash",
"Slowpoke",
"Slowbro",
"Magnemite",
"Magneton",
"Farfetch’d",
"Doduo",
"Dodrio",
"Seel",
"Dewgong",
"Grimer",
"Muk",
"Shellder",
"Cloyster",
"Gastly",
"Haunter",
"Gengar",
"Onix",
"Drowzee",
"Hypno",
"Krabby",
"Kingler",
"Voltorb",
"Electrode",
"Exeggcute",
"Exeggutor",
"Cubone",
"Marowak",
"Hitmonlee",
"Hitmonchan",
"Lickitung",
"Koffing",
"Weezing",
"Rhyhorn",
"Rhydon",
"Chansey",
"Tangela",
"Kangaskhan",
"Horsea",
"Seadra",
"Goldeen",
"Seaking",
"Staryu",
"Starmie",
"Mr. Mime",
"Scyther",
"Jynx",
"Electabuzz",
"Magmar",
"Pinsir",
"Tauros",
"Magikarp",
"Gyarados",
"Lapras",
"Ditto",
"Eevee",
"Vaporeon",
"Jolteon",
"Flareon",
"Porygon",
"Omanyte",
"Omastar",
"Kabuto",
"Kabutops",
"Aerodactyl",
"Snorlax",
"Articuno",
"Zapdos",
"Moltres",
"Dratini",
"Dragonair",
"Dragonite",
"Mewtwo",
"Mew",
"Chikorita",
"Bayleef",
"Meganium",
"Cyndaquil",
"Quilava",
"Typhlosion",
"Totodile",
"Croconaw",
"Feraligatr",
"Sentret",
"Furret",
"Hoothoot",
"Noctowl",
"Ledyba",
"Ledian",
"Spinarak",
"Ariados",
"Crobat",
"Chinchou",
"Lanturn",
"Pichu",
"Cleffa",
"Igglybuff",
"Togepi",
"Togetic",
"Natu",
"Xatu",
"Mareep",
"Flaaffy",
"Ampharos",
"Bellossom",
"Marill",
"Azumarill",
"Sudowoodo",
"Politoed",
"Hoppip",
"Skiploom",
"Jumpluff",
"Aipom",
"Sunkern",
"Sunflora",
"Yanma",
"Wooper",
"Quagsire",
"Espeon",
"Umbreon",
"Murkrow",
"Slowking",
"Misdreavus",
"Unown",
"Wobbuffet",
"Girafarig",
"Pineco",
"Forretress",
"Dunsparce",
"Gligar",
"Steelix",
"Snubbull",
"Granbull",
"Qwilfish",
"Scizor",
"Shuckle",
"Heracross",
"Sneasel",
"Teddiursa",
"Ursaring",
"Slugma",
"Magcargo",
"Swinub",
"Piloswine",
"Corsola",
"Remoraid",
"Octillery",
"Delibird",
"Mantine",
"Skarmory",
"Houndour",
"Houndoom",
"Kingdra",
"Phanpy",
"Donphan",
"Porygon2",
"Stantler",
"Smeargle",
"Tyrogue",
"Hitmontop",
"Smoochum",
"Elekid",
"Magby",
"Miltank",
"Blissey",
"Raikou",
"Entei",
"Suicune",
"Larvitar",
"Pupitar",
"Tyranitar",
"Lugia",
"Ho-Oh",
"Celebi",
"Treecko",
"Grovyle",
"Sceptile",
"Torchic",
"Combusken",
"Blaziken",
"Mudkip",
"Marshtomp",
"Swampert",
"Poochyena",
"Mightyena",
"Zigzagoon",
"Linoone",
"Wurmple",
"Silcoon",
"Beautifly",
"Cascoon",
"Dustox",
"Lotad",
"Lombre",
"Ludicolo",
"Seedot",
"Nuzleaf",
"Shiftry",
"Taillow",
"Swellow",
"Wingull",
"Pelipper",
"Ralts",
"Kirlia",
"Gardevoir",
"Surskit",
"Masquerain",
"Shroomish",
"Breloom",
"Slakoth",
"Vigoroth",
"Slaking",
"Nincada",
"Ninjask",
"Shedinja",
"Whismur",
"Loudred",
"Exploud",
"Makuhita",
"Hariyama",
"Azurill",
"Nosepass",
"Skitty",
"Delcatty",
"Sableye",
"Mawile",
"Aron",
"Lairon",
"Aggron",
"Meditite",
"Medicham",
"Electrike",
"Manectric",
"Plusle",
"Minun",
"Volbeat",
"Illumise",
"Roselia",
"Gulpin",
"Swalot",
"Carvanha",
"Sharpedo",
"Wailmer",
"Wailord",
"Numel",
"Camerupt",
"Torkoal",
"Spoink",
"Grumpig",
"Spinda",
"Trapinch",
"Vibrava",
"Flygon",
"Cacnea",
"Cacturne",
"Swablu",
"Altaria",
"Zangoose",
"Seviper",
"Lunatone",
"Solrock",
"Barboach",
"Whiscash",
"Corphish",
"Crawdaunt",
"Baltoy",
"Claydol",
"Lileep",
"Cradily",
"Anorith",
"Armaldo",
"Feebas",
"Milotic",
"Castform",
"Kecleon",
"Shuppet",
"Banette",
"Duskull",
"Dusclops",
"Tropius",
"Chimecho",
"Absol",
"Wynaut",
"Snorunt",
"Glalie",
"Spheal",
"Sealeo",
"Walrein",
"Clamperl",
"Huntail",
"Gorebyss",
"Relicanth",
"Luvdisc",
"Bagon",
"Shelgon",
"Salamence",
"Beldum",
"Metang",
"Metagross",
"Regirock",
"Regice",
"Registeel",
"Latias",
"Latios",
"Kyogre",
"Groudon",
"Rayquaza",
"Jirachi",
"Deoxys",
"Turtwig",
"Grotle",
"Torterra",
"Chimchar",
"Monferno",
"Infernape",
"Piplup",
"Prinplup",
"Empoleon",
"Starly",
"Staravia",
"Staraptor",
"Bidoof",
"Bibarel",
"Kricketot",
"Kricketune",
"Shinx",
"Luxio",
"Luxray",
"Budew",
"Roserade",
"Cranidos",
"Rampardos",
"Shieldon",
"Bastiodon",
"Burmy",
"Wormadam",
"Mothim",
"Combee",
"Vespiquen",
"Pachirisu",
"Buizel",
"Floatzel",
"Cherubi",
"Cherrim",
"Shellos",
"Gastrodon",
"Ambipom",
"Drifloon",
"Drifblim",
"Buneary",
"Lopunny",
"Mismagius",
"Honchkrow",
"Glameow",
"Purugly",
"Chingling",
"Stunky",
"Skuntank",
"Bronzor",
"Bronzong",
"Bonsly",
"Mime Jr.",
"Happiny",
"Chatot",
"Spiritomb",
"Gible",
"Gabite",
"Garchomp",
"Munchlax",
"Riolu",
"Lucario",
"Hippopotas",
"Hippowdon",
"Skorupi",
"Drapion",
"Croagunk",
"Toxicroak",
"Carnivine",
"Finneon",
"Lumineon",
"Mantyke",
"Snover",
"Abomasnow",
"Weavile",
"Magnezone",
"Lickilicky",
"Rhyperior",
"Tangrowth",
"Electivire",
"Magmortar",
"Togekiss",
"Yanmega",
"Leafeon",
"Glaceon",
"Gliscor",
"Mamoswine",
"Porygon-Z",
"Gallade",
"Probopass",
"Dusknoir",
"Froslass",
"Rotom",
"Uxie",
"Mesprit",
"Azelf",
"Dialga",
"Palkia",
"Heatran",
"Regigigas",
"Giratina",
"Cresselia",
"Phione",
"Manaphy",
"Darkrai",
"Shaymin",
"Arceus",
"Victini",
"Snivy",
"Servine",
"Serperior",
"Tepig",
"Pignite",
"Emboar",
"Oshawott",
"Dewott",
"Samurott",
"Patrat",
"Watchog",
"Lillipup",
"Herdier",
"Stoutland",
"Purrloin",
"Liepard",
"Pansage",
"Simisage",
"Pansear",
"Simisear",
"Panpour",
"Simipour",
"Munna",
"Musharna",
"Pidove",
"Tranquill",
"Unfezant",
"Blitzle",
"Zebstrika",
"Roggenrola",
"Boldore",
"Gigalith",
"Woobat",
"Swoobat",
"Drilbur",
"Excadrill",
"Audino",
"Timburr",
"Gurdurr",
"Conkeldurr",
"Tympole",
"Palpitoad",
"Seismitoad",
"Throh",
"Sawk",
"Sewaddle",
"Swadloon",
"Leavanny",
"Venipede",
"Whirlipede",
"Scolipede",
"Cottonee",
"Whimsicott",
"Petilil",
"Lilligant",
"Basculin",
"Sandile",
"Krokorok",
"Krookodile",
"Darumaka",
"Darmanitan",
"Maractus",
"Dwebble",
"Crustle",
"Scraggy",
"Scrafty",
"Sigilyph",
"Yamask",
"Cofagrigus",
"Tirtouga",
"Carracosta",
"Archen",
"Archeops",
"Trubbish",
"Garbodor",
"Zorua",
"Zoroark",
"Minccino",
"Cinccino",
"Gothita",
"Gothorita",
"Gothitelle",
"Solosis",
"Duosion",
"Reuniclus",
"Ducklett",
"Swanna",
"Vanillite",
"Vanillish",
"Vanilluxe",
"Deerling",
"Sawsbuck",
"Emolga",
"Karrablast",
"Escavalier",
"Foongus",
"Amoonguss",
"Frillish",
"Jellicent",
"Alomomola",
"Joltik",
"Galvantula",
"Ferroseed",
"Ferrothorn",
"Klink",
"Klang",
"Klinklang",
"Tynamo",
"Eelektrik",
"Eelektross",
"Elgyem",
"Beheeyem",
"Litwick",
"Lampent",
"Chandelure",
"Axew",
"Fraxure",
"Haxorus",
"Cubchoo",
"Beartic",
"Cryogonal",
"Shelmet",
"Accelgor",
"Stunfisk",
"Mienfoo",
"Mienshao",
"Druddigon",
"Golett",
"Golurk",
"Pawniard",
"Bisharp",
"Bouffalant",
"Rufflet",
"Braviary",
"Vullaby",
"Mandibuzz",
"Heatmor",
"Durant",
"Deino",
"Zweilous",
"Hydreigon",
"Larvesta",
"Volcarona",
"Cobalion",
"Terrakion",
"Virizion",
"Tornadus",
"Thundurus",
"Reshiram",
"Zekrom",
"Landorus",
"Kyurem",
"Keldeo",
"Meloetta",
"Genesect",
"Chespin",
"Quilladin",
"Chesnaught",
"Fennekin",
"Braixen",
"Delphox",
"Froakie",
"Frogadier",
"Greninja",
"Bunnelby",
"Diggersby",
"Fletchling",
"Fletchinder",
"Talonflame",
"Scatterbug",
"Spewpa",
"Vivillon",
"Litleo",
"Pyroar",
"Flabébé",
"Floette",
"Florges",
"Skiddo",
"Gogoat",
"Pancham",
"Pangoro",
"Furfrou",
"Espurr",
"Meowstic",
"Honedge",
"Doublade",
"Aegislash-Both",
"Spritzee",
"Aromatisse",
"Swirlix",
"Slurpuff",
"Inkay",
"Malamar",
"Binacle",
"Barbaracle",
"Skrelp",
"Dragalge",
"Clauncher",
"Clawitzer",
"Helioptile",
"Heliolisk",
"Tyrunt",
"Tyrantrum",
"Amaura",
"Aurorus",
"Sylveon",
"Hawlucha",
"Dedenne",
"Carbink",
"Goomy",
"Sliggoo",
"Goodra",
"Klefki",
"Phantump",
"Trevenant",
"Pumpkaboo",
"Gourgeist",
"Bergmite",
"Avalugg",
"Noibat",
"Noivern",
"Xerneas",
"Yveltal",
"Zygarde",
"Diancie",
"Hoopa",
"Volcanion",
"Rowlet",
"Dartrix",
"Decidueye",
"Litten",
"Torracat",
"Incineroar",
"Popplio",
"Brionne",
"Primarina",
"Pikipek",
"Trumbeak",
"Toucannon",
"Yungoos",
"Gumshoos",
"Grubbin",
"Charjabug",
"Vikavolt",
"Crabrawler",
"Crabominable",
"Oricorio",
"Cutiefly",
"Ribombee",
"Rockruff",
"Lycanroc",
"Wishiwashi",
"Mareanie",
"Toxapex",
"Mudbray",
"Mudsdale",
"Dewpider",
"Araquanid",
"Fomantis",
"Lurantis",
"Morelull",
"Shiinotic",
"Salandit",
"Salazzle",
"Stufful",
"Bewear",
"Bounsweet",
"Steenee",
"Tsareena",
"Comfey",
"Oranguru",
"Passimian",
"Wimpod",
"Golisopod",
"Sandygast",
"Palossand",
"Pyukumuku",
"Type: Null",
"Silvally",
"Minior",
"Komala",
"Turtonator",
"Togedemaru",
"Mimikyu",
"Bruxish",
"Drampa",
"Dhelmise",
"Jangmo-o",
"Hakamo-o",
"Kommo-o",
"Tapu Koko",
"Tapu Lele",
"Tapu Bulu",
"Tapu Fini",
"Cosmog",
"Cosmoem",
"Solgaleo",
"Lunala",
"Nihilego",
"Buzzwole",
"Pheromosa",
"Xurkitree",
"Celesteela",
"Kartana",
"Guzzlord",
"Necrozma",
"Magearna",
"Marshadow",
"Poipole",
"Naganadel",
"Stakataka",
"Blacephalon",
"Zeraora",
"Meltan",
"Melmetal",
"Grookey",
"Thwackey",
"Rillaboom",
"Scorbunny",
"Raboot",
"Cinderace",
"Sobble",
"Drizzile",
"Inteleon",
"Skwovet",
"Greedent",
"Rookidee",
"Corvisquire",
"Corviknight",
"Blipbug",
"Dottler",
"Orbeetle",
"Nickit",
"Thievul",
"Gossifleur",
"Eldegoss",
"Wooloo",
"Dubwool",
"Chewtle",
"Drednaw",
"Yamper",
"Boltund",
"Rolycoly",
"Carkol",
"Coalossal",
"Applin",
"Flapple",
"Appletun",
"Silicobra",
"Sandaconda",
"Cramorant",
"Arrokuda",
"Barraskewda",
"Toxel",
"Toxtricity",
"Sizzlipede",
"Centiskorch",
"Clobbopus",
"Grapploct",
"Sinistea",
"Polteageist",
"Hatenna",
"Hattrem",
"Hatterene",
"Impidimp",
"Morgrem",
"Grimmsnarl",
"Obstagoon",
"Perrserker",
"Cursola",
"Sirfetch’d",
"Mr. Rime",
"Runerigus",
"Milcery",
"Alcremie",
"Falinks",
"Pincurchin",
"Snom",
"Frosmoth",
"Stonjourner",
"Eiscue",
"Indeedee",
"Morpeko",
"Cufant",
"Copperajah",
"Dracozolt",
"Arctozolt",
"Dracovish",
"Arctovish",
"Duraludon",
"Dreepy",
"Drakloak",
"Dragapult",
"Zacian",
"Zamazenta",
"Eternatus",
"Kubfu",
"Urshifu",
"Zarude",
"Regieleki",
"Regidrago",
"Glastrier",
"Spectrier",
"Calyrex",
"Wyrdeer",
"Kleavor",
"Ursaluna",
"Basculegion",
"Sneasler",
"Overqwil",
"Enamorus",
"Sprigatito",
"Floragato",
"Meowscarada",
"Fuecoco",
"Crocalor",
"Skeledirge",
"Quaxly",
"Quaxwell",
"Quaquaval",
"Lechonk",
"Oinkologne",
"Tarountula",
"Spidops",
"Nymble",
"Lokix",
"Pawmi",
"Pawmo",
"Pawmot",
"Tandemaus",
"Maushold",
"Fidough",
"Dachsbun",
"Smoliv",
"Dolliv",
"Arboliva",
"Squawkabilly",
"Nacli",
"Naclstack",
"Garganacl",
"Charcadet",
"Armarouge",
"Ceruledge",
"Tadbulb",
"Bellibolt",
"Wattrel",
"Kilowattrel",
"Maschiff",
"Mabosstiff",
"Shroodle",
"Grafaiai",
"Bramblin",
"Brambleghast",
"Toedscool",
"Toedscruel",
"Klawf",
"Capsakid",
"Scovillain",
"Rellor",
"Rabsca",
"Flittle",
"Espathra",
"Tinkatink",
"Tinkatuff",
"Tinkaton",
"Wiglett",
"Wugtrio",
"Bombirdier",
"Finizen",
"Palafin",
"Varoom",
"Revavroom",
"Cyclizar",
"Orthworm",
"Glimmet",
"Glimmora",
"Greavard",
"Houndstone",
"Flamigo",
"Cetoddle",
"Cetitan",
"Veluza",
"Dondozo",
"Tatsugiri",
"Annihilape",
"Clodsire",
"Farigiraf",
"Dudunsparce",
"Kingambit",
"Great Tusk",
"Scream Tail",
"Brute Bonnet",
"Flutter Mane",
"Slither Wing",
"Sandy Shocks",
"Iron Treads",
"Iron Bundle",
"Iron Hands",
"Iron Jugulis",
"Iron Moth",
"Iron Thorns",
"Frigibax",
"Arctibax",
"Baxcalibur",
"Gimmighoul",
"Gholdengo",
"Wo-Chien",
"Chien-Pao",
"Ting-Lu",
"Chi-Yu",
"Roaring Moon",
"Iron Valiant",
"Koraidon",
"Miraidon",
"Walking Wake",
"Iron Leaves",
"Dipplin",
"Poltchageist",
"Sinistcha",
"Okidogi",
"Munkidori",
"Fezandipiti",
"Ogerpon",
"Archaludon",
"Hydrapple",
"Gouging-Fire",
"Raging-Bolt",
"Iron-Boulder",
"Iron-Crown",
"Terapagos",
"Pecharunt",
"Venusaur-Mega",
"Charizard-Mega-X",
"Charizard-Mega-Y",
"Blastoise-Mega",
"Beedrill-Mega",
"Pidgeot-Mega",
"Alakazam-Mega",
"Slowbro-Mega",
"Gengar-Mega",
"Kangaskhan-Mega",
"Pinsir-Mega",
"Gyarados-Mega",
"Aerodactyl-Mega",
"Mewtwo-Mega-X",
"Mewtwo-Mega-Y",
"Ampharos-Mega",
"Steelix-Mega",
"Scizor-Mega",
"Heracross-Mega",
"Houndoom-Mega",
"Tyranitar-Mega",
"Sceptile-Mega",
"Blaziken-Mega",
"Swampert-Mega",
"Gardevoir-Mega",
"Sableye-Mega",
"Mawile-Mega",
"Aggron-Mega",
"Medicham-Mega",
"Manectric-Mega",
"Sharpedo-Mega",
"Camerupt-Mega",
"Altaria-Mega",
"Banette-Mega",
"Absol-Mega",
"Glalie-Mega",
"Salamence-Mega",
"Metagross-Mega",
"Latias-Mega",
"Latios-Mega",
"Lopunny-Mega",
"Garchomp-Mega",
"Lucario-Mega",
"Abomasnow-Mega",
"Gallade-Mega",
"Audino-Mega",
"Diancie-Mega",
"Rayquaza-Mega",
"Kyogre-Primal",
"Groudon-Primal",
"Rattata-Alola",
"Raticate-Alola",
"Raichu-Alola",
"Sandshrew-Alola",
"Sandslash-Alola",
"Vulpix-Alola",
"Ninetales-Alola",
"Diglett-Alola",
"Dugtrio-Alola",
"Meowth-Alola",
"Persian-Alola",
"Geodude-Alola",
"Graveler-Alola",
"Golem-Alola",
"Grimer-Alola",
"Muk-Alola",
"Exeggutor-Alola",
"Marowak-Alola",
"Meowth-Galar",
"Ponyta-Galar",
"Rapidash-Galar",
"Slowpoke-Galar",
"Slowbro-Galar",
"Farfetch’d-Galar",
"Weezing-Galar",
"Mr. Mime-Galar",
"Articuno-Galar",
"Zapdos-Galar",
"Moltres-Galar",
"Slowking-Galar",
"Corsola-Galar",
"Zigzagoon-Galar",
"Linoone-Galar",
"Darumaka-Galar",
"Darmanitan-Galar",
"Yamask-Galar",
"Stunfisk-Galar",
"Growlithe-Hisui",
"Arcanine-Hisui",
"Voltorb-Hisui",
"Electrode-Hisui",
"Typhlosion-Hisui",
"Qwilfish-Hisui",
"Sneasel-Hisui",
"Samurott-Hisui",
"Lilligant-Hisui",
"Zorua-Hisui",
"Zoroark-Hisui",
"Braviary-Hisui",
"Sliggoo-Hisui",
"Goodra-Hisui",
"Avalugg-Hisui",
"Decidueye-Hisui",
"Wooper-Paldea",
"Tauros-Paldea-Combat",
"Pikachu-Cosplay",
"Pikachu-Rock-Star",
"Pikachu-Belle",
"Pikachu-Pop-Star",
"Pikachu-PhD",
"Pikachu-Libre",
"Pikachu-Original",
"Pikachu-Hoenn",
"Pikachu-Sinnoh",
"Pikachu-Unova",
"Pikachu-Kalos",
"Pikachu-Alola",
"Pikachu-Partner",
"Pikachu-World",
"Pichu-Spiky-eared",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Unown",
"Castform-Sunny",
"Castform-Rainy",
"Castform-Snowy",
"Deoxys-Attack",
"Deoxys-Defense",
"Deoxys-Speed",
"Burmy",
"Burmy",
"Wormadam-Sandy",
"Wormadam-Trash",
"Cherrim-Sunshine",
"Shellos",
"Gastrodon",
"Rotom-Heat",
"Rotom-Wash",
"Rotom-Frost",
"Rotom-Fan",
"Rotom-Mow",
"Dialga-Origin",
"Palkia-Origin",
"Giratina-Origin",
"Shaymin-Sky",
"Arceus-Fighting",
"Arceus-Flying",
"Arceus-Poison",
"Arceus-Ground",
"Arceus-Rock",
"Arceus-Bug",
"Arceus-Ghost",
"Arceus-Steel",
"Arceus-Fire",
"Arceus-Water",
"Arceus-Grass",
"Arceus-Electric",
"Arceus-Psychic",
"Arceus-Ice",
"Arceus-Dragon",
"Arceus-Dark",
"Arceus-Fairy",
"Basculin-Blue-Striped",
"Basculin-White-Striped",
"Darmanitan-Zen",
"Darmanitan-Galar-Zen",
"Deerling",
"Deerling",
"Deerling",
"Sawsbuck",
"Sawsbuck",
"Sawsbuck",
"Tornadus-Therian",
"Thundurus-Therian",
"Landorus-Therian",
"Enamorus-Therian",
"Kyurem-White",
"Kyurem-Black",
"Keldeo-Resolute",
"Meloetta-Pirouette",
"Genesect-Douse",
"Genesect-Shock",
"Genesect-Burn",
"Genesect-Chill",
"Greninja",
"Greninja-Ash",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Vivillon",
"Flabébé",
"Flabébé",
"Flabébé",
"Flabébé",
"Floette",
"Floette",
"Floette",
"Floette",
"Floette-Eternal",
"Florges",
"Florges",
"Florges",
"Florges",
"Furfrou",
"Furfrou",
"Furfrou",
"Furfrou",
"Furfrou",
"Furfrou",
"Furfrou",
"Furfrou",
"Furfrou",
"Meowstic-F",
"Aegislash-Blade",
"Pumpkaboo-Small",
"Pumpkaboo-Large",
"Pumpkaboo-Super",
"Gourgeist-Small",
"Gourgeist-Large",
"Gourgeist-Super",
"Xerneas",
"Zygarde-10",
"Zygarde-10",
"Zygarde",
"Zygarde-Complete",
"Hoopa-Unbound",
"Oricorio-Pom-Pom",
"Oricorio-Pa'u ",
"Oricorio-Sensu",
"Rockruff",
"Lycanroc-Midnight",
"Lycanroc-Dusk",
"Wishiwashi-School",
"Silvally-Fighting",
"Silvally-Flying",
"Silvally-Poison",
"Silvally-Ground",
"Silvally-Rock",
"Silvally-Bug",
"Silvally-Ghost",
"Silvally-Steel",
"Silvally-Fire",
"Silvally-Water",
"Silvally-Grass",
"Silvally-Electric",
"Silvally-Psychic",
"Silvally-Ice",
"Silvally-Dragon",
"Silvally-Dark",
"Silvally-Fairy",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Minior",
"Mimikyu-Busted",
"Necrozma-Dusk-Mane",
"Necrozma-Dawn-Wings",
"Necrozma-Ultra",
"Magearna-Original",
"Cramorant-Gulping",
"Cramorant-Gorging",
"Toxtricity-Low-Key",
"Sinistea-Antique",
"Polteageist-Antique",
"Alcremie",
"Alcremie",
"Alcremie",
"Alcremie",
"Alcremie",
"Alcremie",
"Alcremie",
"Alcremie",
"Eiscue-Noice",
"Indeedee-F",
"Morpeko-Hangry",
"Zacian-Crowned",
"Zamazenta-Crowned",
"Eternatus-Eternamax",
"Urshifu-Rapid-Strike",
"Zarude-Dada",
"Calyrex-Ice",
"Calyrex-Shadow",
"Basculegion-F",
"Oinkologne-F",
"Maushold-Four",
"Squawkabilly-Blue",
"Squawkabilly-Yellow",
"Squawkabilly-White",
"Palafin-Hero",
"Tatsugiri",
"Tatsugiri",
"Dudunsparce-Three-Segment",
"Gimmighoul-Roaming",
"Tauros-Paldea-Blaze",
"Tauros-Paldea-Aqua",
"Ogerpon-Wellspring",
"Ogerpon-Hearthflame",
"Ogerpon-Cornerstone",
"Ogerpon-Teal-Tera",
"Ogerpon-Wellspring-Tera",
"Ogerpon-Hearthflame-Tera",
"Ogerpon-Cornerstone-Tera",
"Ursaluna-Bloodmoon",
"Terapagos-Terastal",
"Terapagos-Stellar",
"Clefable-Mega",
"Victreebel-Mega",
"Starmie-Mega",
"Dragonite-Mega",
"Meganium-Mega",
"Feraligatr-Mega",
"Skarmory-Mega",
"Froslass-Mega",
"Emboar-Mega",
"Excadrill-Mega",
"Scolipede-Mega",
"Scrafty-Mega",
"Eelektross-Mega",
"Chandelure-Mega",
"Chesnaught-Mega",
"Delphox-Mega",
"Greninja-Mega",
"Pyroar-Mega",
"Floette-Eternal-Mega",
"Malamar-Mega",
"Barbaracle-Mega",
"Dragalge-Mega",
"Hawlucha-Mega",
"Zygarde-Complete-Mega",
"Drampa-Mega",
"Falinks-Mega"
}

item = {"Poke Ball",
"Great Ball",
"Ultra Ball",
"Master Ball",
"Premier Ball",
"Heal Ball",
"Net Ball",
"Nest Ball",
"Dive Ball",
"Dusk Ball",
"Timer Ball",
"Quick Ball",
"Repeat Ball",
"Luxury Ball",
"Level Ball",
"Lure Ball",
"Moon Ball",
"Friend Ball",
"Love Ball",
"Fast Ball",
"Heavy Ball",
"Dream Ball",
"Safari Ball",
"Sport Ball",
"Park Ball",
"Beast Ball",
"Cherish Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Berry Juice",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Bottle Cap",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Rare Bone",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Helix Fossil",
"Dome Fossil",
"Old Amber",
"Root Fossil",
"Claw Fossil",
"Armor Fossil",
"Skull Fossil",
"Cover Fossil",
"Plume Fossil",
"Jaw Fossil",
"Sail Fossil",
"Fossilized Bird",
"Fossilized Fish",
"Fossilized Drake",
"Fossilized Dino",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Mail",
"Fire Stone",
"Water Stone",
"Thunder Stone",
"Leaf Stone",
"Ice Stone",
"Sun Stone",
"Moon Stone",
"Shiny Stone",
"Dusk Stone",
"Dawn Stone",
"Sweet Apple",
"Tart Apple",
"Cracked Pot",
"Chipped Pot",
"Galarica Cuff",
"Galarica Wreath",
"Dragon Scale",
"Up-Grade",
"Protector",
"Electirizer",
"Magmarizer",
"Dubious Disc",
"Reaper Cloth",
"Prism Scale",
"Whipped Dream",
"Sachet",
"Oval Stone",
"Strawberry Sweet",
"Love Sweet",
"Berry Sweet",
"Clover Sweet",
"Flower Sweet",
"Star Sweet",
"Ribbon Sweet",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Flame Plate",
"Splash Plate",
"Zap Plate",
"Meadow Plate",
"Icicle Plate",
"Fist Plate",
"Toxic Plate",
"Earth Plate",
"Sky Plate",
"Mind Plate",
"Insect Plate",
"Stone Plate",
"Spooky Plate",
"Draco Plate",
"Dread Plate",
"Iron Plate",
"Pixie Plate",
"Douse Drive",
"Shock Drive",
"Burn Drive",
"Chill Drive",
"Fire Memory",
"Water Memory",
"Electric Memory",
"Grass Memory",
"Ice Memory",
"Fighting Memory",
"Poison Memory",
"Ground Memory",
"Flying Memory",
"Psychic Memory",
"Bug Memory",
"Rock Memory",
"Ghost Memory",
"Dragon Memory",
"Dark Memory",
"Steel Memory",
"Fairy Memory",
"Rusted Sword",
"Rusted Shield",
"Red Orb",
"Blue Orb",
"Venusaurite",
"Charizardite X",
"Charizardite Y",
"Blastoisinite",
"Beedrillite",
"Pidgeotite",
"Alakazite",
"Slowbronite",
"Gengarite",
"Kangaskhanite",
"Pinsirite",
"Gyaradosite",
"Aerodactylite",
"Mewtwonite X",
"Mewtwonite Y",
"Ampharosite",
"Steelixite",
"Scizorite",
"Heracronite",
"Houndoominite",
"Tyranitarite",
"Sceptilite",
"Blazikenite",
"Swampertite",
"Gardevoirite",
"Sablenite",
"Mawilite",
"Aggronite",
"Medichamite",
"Manectite",
"Sharpedonite",
"Cameruptite",
"Altarianite",
"Banettite",
"Absolite",
"Glalitite",
"Salamencite",
"Metagrossite",
"Latiasite",
"Latiosite",
"Lopunnite",
"Garchompite",
"Lucarionite",
"Abomasite",
"Galladite",
"Audinite",
"Diancite",
"Normal Gem",
"Fire Gem",
"Water Gem",
"Electric Gem",
"Grass Gem",
"Ice Gem",
"Fighting Gem",
"Poison Gem",
"Ground Gem",
"Flying Gem",
"Psychic Gem",
"Bug Gem",
"Rock Gem",
"Ghost Gem",
"Dragon Gem",
"Dark Gem",
"Steel Gem",
"Fairy Gem",
"Normalium Z",
"Firium Z",
"Waterium Z",
"Electrium Z",
"Grassium Z",
"Icium Z",
"Fightinium Z",
"Poisonium Z",
"Groundium Z",
"Flyinium Z",
"Psychium Z",
"Buginium Z",
"Rockium Z",
"Ghostium Z",
"Dragonium Z",
"Darkinium Z",
"Steelium Z",
"Fairium Z",
"Pikanium Z",
"Eevium Z",
"Snorlium Z",
"Mewnium Z",
"Decidium Z",
"Incinium Z",
"Primarium Z",
"Lycanium Z",
"Mimikium Z",
"Kommonium Z",
"Tapunium Z",
"Solganium Z",
"Lunalium Z",
"Marshadium Z",
"Aloraichium Z",
"Pikashunium Z",
"Ultranecrozium Z",
"Light Ball",
"Leek",
"Thick Club",
"Lucky Punch",
"Metal Powder",
"Quick Powder",
"Deep Sea Scale",
"Deep Sea Tooth",
"Soul Dew",
"Adamant Orb",
"Lustrous Orb",
"Griseous Orb",
"Sea Incense",
"Lax Incense",
"Odd Incense",
"Rock Incense",
"Full Incense",
"Wave Incense",
"Rose Incense",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Macho Brace",
"Power Weight",
"Power Bracer",
"Power Belt",
"Power Lens",
"Power Band",
"Power Anklet",
"Silk Scarf",
"Charcoal",
"Mystic Water",
"Magnet",
"Miracle Seed",
"Never-Melt Ice",
"Black Belt",
"Poison Barb",
"Soft Sand",
"Sharp Beak",
"Twisted Spoon",
"Silver Powder",
"Hard Stone",
"Spell Tag",
"Dragon Fang",
"Black Glasses",
"Metal Coat",
"Choice Band",
"Choice Specs",
"Choice Scarf",
"Flame Orb",
"Toxic Orb",
"Damp Rock",
"Heat Rock",
"Smooth Rock",
"Icy Rock",
"Electric Seed",
"Psychic Seed",
"Misty Seed",
"Grassy Seed",
"Absorb Bulb",
"Cell Battery",
"Luminous Moss",
"Snowball",
"Bright Powder",
"White Herb",
"Poke Ball",
"Quick Claw",
"Poke Ball",
"Mental Herb",
"King's Rock",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Focus Band",
"Poke Ball",
"Scope Lens",
"Leftovers",
"Shell Bell",
"Wide Lens",
"Muscle Band",
"Wise Glasses",
"Expert Belt",
"Light Clay",
"Life Orb",
"Power Herb",
"Focus Sash",
"Zoom Lens",
"Metronome",
"Iron Ball",
"Lagging Tail",
"Destiny Knot",
"Black Sludge",
"Grip Claw",
"Sticky Barb",
"Shed Shell",
"Big Root",
"Razor Claw",
"Razor Fang",
"Eviolite",
"Float Stone",
"Rocky Helmet",
"Air Balloon",
"Red Card",
"Ring Target",
"Binding Band",
"Eject Button",
"Weakness Policy",
"Assault Vest",
"Safety Goggles",
"Adrenaline Orb",
"Terrain Extender",
"Protective Pads",
"Throat Spray",
"Eject Pack",
"Heavy-Duty Boots",
"Blunder Policy",
"Room Service",
"Utility Umbrella",
"Cheri Berry",
"Chesto Berry",
"Pecha Berry",
"Rawst Berry",
"Aspear Berry",
"Leppa Berry",
"Oran Berry",
"Persim Berry",
"Lum Berry",
"Sitrus Berry",
"Figy Berry",
"Wiki Berry",
"Mago Berry",
"Aguav Berry",
"Iapapa Berry",
"Razz Berry",
"Bluk Berry",
"Nanab Berry",
"Wepear Berry",
"Pinap Berry",
"Pomeg Berry",
"Kelpsy Berry",
"Qualot Berry",
"Hondew Berry",
"Grepa Berry",
"Tamato Berry",
"Cornn Berry",
"Magost Berry",
"Rabuta Berry",
"Nomel Berry",
"Spelon Berry",
"Pamtre Berry",
"Watmel Berry",
"Durin Berry",
"Belue Berry",
"Chilan Berry",
"Occa Berry",
"Passho Berry",
"Wacan Berry",
"Rindo Berry",
"Yache Berry",
"Chople Berry",
"Kebia Berry",
"Shuca Berry",
"Coba Berry",
"Payapa Berry",
"Tanga Berry",
"Charti Berry",
"Kasib Berry",
"Haban Berry",
"Colbur Berry",
"Babiri Berry",
"Roseli Berry",
"Liechi Berry",
"Ganlon Berry",
"Salac Berry",
"Petaya Berry",
"Apicot Berry",
"Lansat Berry",
"Starf Berry",
"Enigma Berry",
"Micle Berry",
"Custap Berry",
"Jaboca Berry",
"Rowap Berry",
"Kee Berry",
"Maranga Berry",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Ability Shield",
"Clear Amulet",
"Punching Glove",
"Covert Cloak",
"Loaded Dice",
"Auspicious Armor",
"Booster Energy",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Malicious Armor",
"Mirror Herb",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Black Augurite",
"Linking Cord",
"Peat Block",
"Berserk Gene",
"Fairy Feather",
"Syrupy Apple",
"Poke Ball",
"Poke Ball",
"Cornerstone Mask",
"Wellspring Mask",
"Hearthflame Mask",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
"Poke Ball",
}
abilities = {
"Stench",
"Drizzle",
"Speed Boost",
"Battle Armor",
"Sturdy",
"Damp",
"Limber",
"Sand Veil",
"Static",
"Volt Absorb",
"Water Absorb",
"Oblivious",
"Cloud Nine",
"Compound Eyes",
"Insomnia",
"Color Change",
"Immunity",
"Flash Fire",
"Shield Dust",
"Own Tempo",
"Suction Cups",
"Intimidate",
"Shadow Tag",
"Rough Skin",
"Wonder Guard",
"Levitate",
"Effect Spore",
"Synchronize",
"Clear Body",
"Natural Cure",
"Lightning Rod",
"Serene Grace",
"Swift Swim",
"Chlorophyll",
"Illuminate",
"Trace",
"Huge Power",
"Poison Point",
"Inner Focus",
"Magma Armor",
"Water Veil",
"Magnet Pull",
"Soundproof",
"Rain Dish",
"Sand Stream",
"Pressure",
"Thick Fat",
"Early Bird",
"Flame Body",
"Run Away",
"Keen Eye",
"Hyper Cutter",
"Pickup",
"Truant",
"Hustle",
"Cute Charm",
"Plus",
"Minus",
"Forecast",
"Sticky Hold",
"Shed Skin",
"Guts",
"Marvel Scale",
"Liquid Ooze",
"Overgrow",
"Blaze",
"Torrent",
"Swarm",
"Rock Head",
"Drought",
"Arena Trap",
"Vital Spirit",
"White Smoke",
"Pure Power",
"Shell Armor",
"Air Lock",
"Tangled Feet",
"Motor Drive",
"Rivalry",
"Steadfast",
"Snow Cloak",
"Gluttony",
"Anger Point",
"Unburden",
"Heatproof",
"Simple",
"Dry Skin",
"Download",
"Iron Fist",
"Poison Heal",
"Adaptability",
"Skill Link",
"Hydration",
"Solar Power",
"Quick Feet",
"Normalize",
"Sniper",
"Magic Guard",
"No Guard",
"Stall",
"Technician",
"Leaf Guard",
"Klutz",
"Mold Breaker",
"Super Luck",
"Aftermath",
"Anticipation",
"Forewarn",
"Unaware",
"Tinted Lens",
"Filter",
"Slow Start",
"Scrappy",
"Storm Drain",
"Ice Body",
"Solid Rock",
"Snow Warning",
"Honey Gather",
"Frisk",
"Reckless",
"Multitype",
"Flower Gift",
"Bad Dreams",
"Pickpocket",
"Sheer Force",
"Contrary",
"Unnerve",
"Defiant",
"Defeatist",
"Cursed Body",
"Healer",
"Friend Guard",
"Weak Armor",
"Heavy Metal",
"Light Metal",
"Multiscale",
"Toxic Boost",
"Flare Boost",
"Harvest",
"Telepathy",
"Moody",
"Overcoat",
"Poison Touch",
"Regenerator",
"Big Pecks",
"Sand Rush",
"Wonder Skin",
"Analytic",
"Illusion",
"Imposter",
"Infiltrator",
"Mummy",
"Moxie",
"Justified",
"Rattled",
"Magic Bounce",
"Sap Sipper",
"Prankster",
"Sand Force",
"Iron Barbs",
"Zen Mode",
"Victory Star",
"Turboblaze",
"Teravolt",
"Aroma Veil",
"Flower Veil",
"Cheek Pouch",
"Protean",
"Fur Coat",
"Magician",
"Bulletproof",
"Competitive",
"Strong Jaw",
"Refrigerate",
"Sweet Veil",
"Stance Change",
"Gale Wings",
"Mega Launcher",
"Grass Pelt",
"Symbiosis",
"Tough Claws",
"Pixilate",
"Gooey",
"Aerilate",
"Parental Bond",
"Dark Aura",
"Fairy Aura",
"Aura Break",
"Primordial Sea",
"Desolate Land",
"Delta Stream",
"Stamina",
"Wimp Out",
"Emergency Exit",
"Water Compaction",
"Merciless",
"Shields Down",
"Stakeout",
"Water Bubble",
"Steelworker",
"Berserk",
"Slush Rush",
"Long Reach",
"Liquid Voice",
"Triage",
"Galvanize",
"Surge Surfer",
"Schooling",
"Disguise",
"Battle Bond",
"Power Construct",
"Corrosion",
"Comatose",
"Queenly Majesty",
"Innards Out",
"Dancer",
"Battery",
"Fluffy",
"Dazzling",
"Soul Heart",
"Tangling Hair",
"Receiver",
"Power Of Alchemy",
"Beast Boost",
"Rks System",
"Electric Surge",
"Psychic Surge",
"Misty Surge",
"Grassy Surge",
"Full Metal Body",
"Shadow Shield",
"Prism Armor",
"Neuroforce",
"Intrepid Sword",
"Dauntless Shield",
"Libero",
"Ball Fetch",
"Cotton Down",
"Propeller Tail",
"Mirror Armor",
"Gulp Missile",
"Stalwart",
"Steam Engine",
"Punk Rock",
"Sand Spit",
"Ice Scales",
"Ripen",
"Ice Face",
"Power Spot",
"Mimicry",
"Screen Cleaner",
"Steely Spirit",
"Perish Body",
"Wandering Spirit",
"Gorilla Tactics",
"Neutralizing Gas",
"Pastel Veil",
"Hunger Switch",
"Quick Draw",
"Unseen Fist",
"Curious Medicine",
"Transistor",
"Dragons Maw",
"Chilling Neigh",
"Grim Neigh",
"As One (Glastrier)",
"As One (Spectrier)",
"Lingering Aroma",
"Seed Sower",
"Thermal Exchange",
"Anger Shell",
"Purifying Salt",
"Well Baked Body",
"Wind Rider",
"Guard Dog",
"Rocky Payload",
"Wind Power",
"Zero To Hero",
"Commander",
"Electromorphosis",
"Protosynthesis",
"Quark Drive",
"Good As Gold",
"Vessel Of Ruin",
"Sword Of Ruin",
"Tablets Of Ruin",
"Beads Of Ruin",
"Orichalcum Pulse",
"Hadron Engine",
"Opportunist",
"Cud Chew",
"Sharpness",
"Supreme Overlord",
"Costar",
"Toxic Debris",
"Armor Tail",
"Earth Eater",
"Mycelium Might",
"Hospitality",
"Mind's Eye",
"Embody Aspect (Teal)",
"Embody Aspect (Hearthflame)",
"Embody Aspect (Wellspring)",
"Embody Aspect (Cornerstone)",
"Toxic Chain",
"Supersweet Syrup"
}

local metLocations = {
	[0x00] = "Littleroot Town",
	[0x01] = "Oldale Town",
	[0x02] = "Dewford Town",
	[0x03] = "Lavaridge Town",
	[0x04] = "Fallarbor Town",
	[0x05] = "Verdanturf Town",
	[0x06] = "Pacifidlog Town",
	[0x07] = "Petalburg City",
	[0x08] = "Slateport City",
	[0x09] = "Mauville City",
	[0x0A] = "Rustboro City",
	[0x0B] = "Fortree City",
	[0x0C] = "Lilycove City",
	[0x0D] = "Mossdeep City",
	[0x0E] = "Sootopolis City",
	[0x0F] = "Ever Grande City",
	[0x10] = "Route 101",
	[0x11] = "Route 102",
	[0x12] = "Route 103",
	[0x13] = "Route 104",
	[0x14] = "Route 105",
	[0x15] = "Route 106",
	[0x16] = "Route 107",
	[0x17] = "Route 108",
	[0x18] = "Route 109",
	[0x19] = "Route 110",
	[0x1A] = "Route 111",
	[0x1B] = "Route 112",
	[0x1C] = "Route 113",
	[0x1D] = "Route 114",
	[0x1E] = "Route 115",
	[0x1F] = "Route 116",
	[0x20] = "Route 117",
	[0x21] = "Route 118",
	[0x22] = "Route 119",
	[0x23] = "Route 120",
	[0x24] = "Route 121",
	[0x25] = "Route 122",
	[0x26] = "Route 123",
	[0x27] = "Route 124",
	[0x28] = "Route 125",
	[0x29] = "Route 126",
	[0x2A] = "Route 127",
	[0x2B] = "Route 128",
	[0x2C] = "Route 129",
	[0x2D] = "Route 130",
	[0x2E] = "Route 131",
	[0x2F] = "Route 132",
	[0x30] = "Route 133",
	[0x31] = "Route 134",
	[0x32] = "Underwater (Route 124)",
	[0x33] = "Underwater (Route 126)",
	[0x34] = "Underwater (Route 127)",
	[0x35] = "Underwater (Route 128)",
	[0x36] = "Underwater (Sootopolis City)",
	[0x37] = "Granite Cave",
	[0x38] = "Mt. Chimney",
	[0x39] = "Safari Zone",
	[0x3A] = "Battle Frontier",
	[0x3B] = "Petalburg Woods",
	[0x3C] = "Rusturf Tunnel",
	[0x3D] = "Abandoned Ship",
	[0x3E] = "New Mauville",
	[0x3F] = "Meteor Falls",
	[0x40] = "Meteor Falls (unused)",
	[0x41] = "Mt. Pyre",
	[0x42] = "Magma/Aqua Hideout",
	[0x43] = "Shoal Cave",
	[0x44] = "Seafloor Cavern",
	[0x45] = "Underwater (Seafloor Cavern)",
	[0x46] = "Victory Road",
	[0x47] = "Mirage Island",
	[0x48] = "Cave of Origin",
	[0x49] = "Southern Island",
	[0x4A] = "Fiery Path",
	[0x4B] = "Fiery Path (unused)",
	[0x4C] = "Jagged Pass",
	[0x4D] = "Jagged Pass (unused)",
	[0x4E] = "Sealed Chamber",
	[0x4F] = "Underwater (Route 134)",
	[0x50] = "Scorched Slab",
	[0x51] = "Island Cave",
	[0x52] = "Desert Ruins",
	[0x53] = "Ancient Tomb",
	[0x54] = "Inside of Truck",
	[0x55] = "Sky Pillar",
	[0x56] = "Secret Base",
	[0x57] = "Ferry",
	[0xC5] = "Aqua Hideout",
	[0xC6] = "Magma Hideout",
	[0xC7] = "Mirage Tower",
	[0xC8] = "Birth Island",
	[0xC9] = "Faraway Island",
	[0xCA] = "Artisan Cave",
	[0xCB] = "Marine Cave",
	[0xCC] = "Underwater (Marine Cave)",
	[0xCD] = "Terra Cave",
	[0xCE] = "Underwater (Route 105)",
	[0xCF] = "Underwater (Route 125)",
	[0xD0] = "Underwater (Route 129)",
	[0xD1] = "Desert Underpass",
	[0xD2] = "Altering Cave",
	[0xD3] = "Navel Rock",
	[0xD4] = "Trainer Hill",
	[0xD5] = "Littleroot Grove",
	[0xD6] = "Oldale Grove",
	[0xD7] = "Petalburg Grove",
	[0xD8] = "Verdanturf Tunnel",
	[0xD9] = "Silent Grove",
	[0xDA] = "Moonlit Grove",
	[0xDB] = "Route 102 Grove",
	[0xDC] = "Rustboro Grove",
	[0xDD] = "Rustboro Grove",
	[0xDE] = "Trainer Hill",
	[0xDF] = "Land Cave",
	[0xE0] = "Altering Grove",
	[0xE1] = "Navel Rock",
	[0xE2] = "Battle Frontier",
	[0xE3] = "Artisan Cave",
	[0xE4] = "Southern Island",
	[0xFF] = "Starter",
}

nature = {"Hardy","Lonely","Brave","Adamant","Naughty",
			"Bold","Docile","Relaxed","Impish","Lax",
			"Timid","Hasty","Serious","Jolly","Naive",
			"Modest","Mild","Quiet","Bashful","Rash",
			"Calm","Gentle","Sassy","Careful","Quirky"}

charmap = { [0]=
	" ", "À", "Á", "Â", "Ç", "È", "É", "Ê", "Ë", "Ì", "こ", "Î", "Ï", "Ò", "Ó", "Ô",
	"Œ", "Ù", "Ú", "Û", "Ñ", "ß", "à", "á", "ね", "ç", "è", "é", "ê", "ë", "ì", "ま",
	"î", "ï", "ò", "ó", "ô", "œ", "ù", "ú", "û", "ñ", "º", "ª", "�", "&", "+", "あ",
	"ぃ", "ぅ", "ぇ", "ぉ", "v", "=", "ょ", "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ",
	"ぞ", "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ",
	"っ", "¿", "¡", "P\u{200d}k", "M\u{200d}n", "P\u{200d}o", "K\u{200d}é", "�", "�", "�", "Í", "%", "(", ")", "セ", "ソ",
	"タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "â", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "í",
	"ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "⬆", "⬇", "⬅", "➡", "ヲ", "ン", "ァ",
	"ィ", "ゥ", "ェ", "ォ", "ャ", "ュ", "ョ", "ガ", "ギ", "グ", "ゲ", "ゴ", "ザ", "ジ", "ズ", "ゼ",
	"ゾ", "ダ", "ヂ", "ヅ", "デ", "ド", "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ",
	"ッ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "!", "?", ".", "-", "・",
	"…", "“", "”", "‘", "’", "♂", "♀", "$", ",", "×", "/", "A", "B", "C", "D", "E",
	"F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U",
	"V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
	"l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "▶",
	":", "Ä", "Ö", "Ü", "ä", "ö", "ü", "⬆", "⬇", "⬅", "�", "�", "�", "�", "�", ""
}

local terminator=0xFF
local monNameLength=12
local speciesNameLength=13
local playerNameLength=10
local boxMonSize=84
local partyMonSize=104
local partyloc=0x2005370 --gPlayerParty
local partyCount=0x200536d --gPlayerPartyCount
local storageLoc=0x200a154 -- gPokemonStorage
local speciesInfo=0x83db1f4 -- gSpeciesInfo

local speciesNameTable=0x83b4db8
function getCurve(n)
	return emu:read8(speciesInfo+(36*n)+21)
end
function slowCurve(n)
    return math.floor((5*(n^3))/4)
end
function fastCurve(n)
    return math.floor((4*(n^3))/5)
end
function medfastCurve(n)
    return n^3
end
function medslowCurve(n)
    return math.floor((6 * (n)^3) / 5) - (15 * (n)^2) + (100 * n) - 140
end
function erraticCurve(n)
    if (n<=50) then
        return math.floor(((100 - n)*n^3)/50)
    end
    if (n<=68) then
        return math.floor(((150 - n)*n^3)/100)
    end
    if (n<=98) then
        return math.floor(math.floor((1911 - 10 * n) / 3) * n^3 / 500)
    end
    return math.floor((160 - n) * n^3 / 100)
end
function flutuatingCurve(n)
	if (n<15) then
	  return math.floor((math.floor((n + 1) / 3) + 24) * n^3 / 50)
	end
	if (n<=36) then
		return math.floor((n + 14) * n^3 / 50)
	end
	return math.floor((math.floor(n / 2) + 32) * n^3 / 50)
end

function calcLevel(exp, species)
	level = 1
	while (exp>=expRequired(species,level+1)) do
		level=level+1
	end
	return level
end

function expRequired(species,level)
	expCurve = getCurve(species)
	if (expCurve == 0) then return medfastCurve(level) end
	if (expCurve == 1) then return erraticCurve(level) end
	if (expCurve == 2) then return flutuatingCurve(level) end
	if (expCurve == 3) then return medslowCurve(level) end
	if (expCurve == 4) then return fastCurve(level) end
	if (expCurve == 5) then return slowCurve(level) end
end

function getParty()
	local party = {}
	local monStart = partyloc
	for i = 1, emu:read8(partyCount) do
		party[i] = readPartyMon(monStart)
		monStart = monStart + partyMonSize
	end
	return party
end

function toString(rawstring)
	local string = ""
	for _, char in ipairs({rawstring:byte(1, #rawstring)}) do
		if char == terminator then
			break
		end
		string = string..charmap[char]
	end
	return string
end

function _read16BE(emu, address)
	return (emu:read8(address) << 8) | emu:read8(address + 1)
end


function readBoxMon(address)
	local mon = {}
	mon.personality = emu:read32(address + 0)
	mon.otId = emu:read32(address + 4)
	mon.nickname = toString(emu:readRange(address + 8, monNameLength))
	mon.language = emu:read8(address + 18)
	local flags = emu:read8(address + 19)
	mon.isBadEgg = flags & 1
	mon.hasSpecies = (flags >> 1) & 1
	mon.isEgg = (flags >> 2) & 1
	mon.otName = toString(emu:readRange(address + 20, playerNameLength))
	mon.markings = emu:read8(address + 29)
	mon.checksum = emu:read16(address + 30)

	local key = mon.otId ~ mon.personality
	local substructSelector = {
		[ 0] = {0, 1, 2, 3},
		[ 1] = {0, 1, 3, 2},
		[ 2] = {0, 2, 1, 3},
		[ 3] = {0, 3, 1, 2},
		[ 4] = {0, 2, 3, 1},
		[ 5] = {0, 3, 2, 1},
		[ 6] = {1, 0, 2, 3},
		[ 7] = {1, 0, 3, 2},
		[ 8] = {2, 0, 1, 3},
		[ 9] = {3, 0, 1, 2},
		[10] = {2, 0, 3, 1},
		[11] = {3, 0, 2, 1},
		[12] = {1, 2, 0, 3},
		[13] = {1, 3, 0, 2},
		[14] = {2, 1, 0, 3},
		[15] = {3, 1, 0, 2},
		[16] = {2, 3, 0, 1},
		[17] = {3, 2, 0, 1},
		[18] = {1, 2, 3, 0},
		[19] = {1, 3, 2, 0},
		[20] = {2, 1, 3, 0},
		[21] = {3, 1, 2, 0},
		[22] = {2, 3, 1, 0},
		[23] = {3, 2, 1, 0},
	}

	local pSel = substructSelector[mon.personality % 24]
	local ss0 = {}
	local ss1 = {}
	local ss2 = {}
	local ss3 = {}

	for i = 0, 2 do
		ss0[i] = emu:read32(address + 32  + 4 + pSel[1] * 12 + i * 4) ~ key
		ss1[i] = emu:read32(address + 32 + 4 + pSel[2] * 12 + i * 4) ~ key
		ss2[i] = emu:read32(address + 32 + 4 + pSel[3] * 12 + i * 4) ~ key
		ss3[i] = emu:read32(address + 32 + 4 + pSel[4] * 12 + i * 4) ~ key
	end

	mon.species = ss0[0] & 0xFFFF
	mon.heldItem = ss0[0] >> 16
	mon.experience = ss0[1]
	mon.ppBonuses = ss0[2] & 0xFF
	mon.friendship = (ss0[2] >> 8) & 0xFF
	mon.pokeball = (ss0[2] >> 16) & 0x1F
	mon.hiddenNature = (ss0[2] >> 21) & 0x1F

	mon.moves = {
		ss1[0] & 0xFFFF,
		ss1[0] >> 16,
		ss1[1] & 0xFFFF,
		ss1[1] >> 16
	}
	mon.pp = {
		ss1[2] & 0xFF,
		(ss1[2] >> 8) & 0xFF,
		(ss1[2] >> 16) & 0xFF,
		ss1[2] >> 24
	}

	mon.hpEV = ss2[0] & 0xFF
	mon.attackEV = (ss2[0] >> 8) & 0xFF
	mon.defenseEV = (ss2[0] >> 16) & 0xFF
	mon.speedEV = ss2[0] >> 24
	mon.spAttackEV = ss2[1] & 0xFF
	mon.spDefenseEV = (ss2[1] >> 8) & 0xFF
	mon.cool = (ss2[1] >> 16) & 0xFF
	mon.beauty = ss2[1] >> 24
	mon.cute = ss2[2] & 0xFF
	mon.smart = (ss2[2] >> 8) & 0xFF
	mon.tough = (ss2[2] >> 16) & 0xFF
	mon.sheen = ss2[2] >> 24

	mon.pokerus = ss3[0] & 0xFF
	mon.metLocation = (ss3[0] >> 8) & 0xFF
	flags = ss3[0] >> 16
	mon.metLevel = flags & 0x7F
	mon.metGame = (flags >> 7) & 0xF
	mon.pokeball = (flags >> 11) & 0xF
	mon.otGender = (flags >> 15) & 0x1
	flags = ss3[1]
	mon.hpIV = (flags >> 0) & 0x1F
	mon.attackIV = (flags >> 5) & 0x1F
	mon.defenseIV = (flags >> 10) & 0x1F
	mon.speedIV = (flags >> 15) & 0x1F
	mon.spAttackIV = (flags >> 20) & 0x1F
	mon.spDefenseIV = (flags >> 25) & 0x1F
	-- Bit 30 is another "isEgg" bit
	flags = ss3[2]
	mon.coolRibbon = flags & 7
	mon.beautyRibbon = (flags >> 3) & 7
	mon.cuteRibbon = (flags >> 6) & 7
	mon.smartRibbon = (flags >> 9) & 7
	mon.toughRibbon = (flags >> 12) & 7
	mon.championRibbon = (flags >> 15) & 1
	mon.winningRibbon = (flags >> 16) & 1
	mon.victoryRibbon = (flags >> 17) & 1
	mon.artistRibbon = (flags >> 18) & 1
	mon.effortRibbon = (flags >> 19) & 1
	mon.marineRibbon = (flags >> 20) & 1
	mon.landRibbon = (flags >> 21) & 1
	mon.skyRibbon = (flags >> 22) & 1
	mon.countryRibbon = (flags >> 23) & 1
	mon.nationalRibbon = (flags >> 24) & 1
	mon.earthRibbon = (flags >> 25) & 1
	mon.worldRibbon = (flags >> 26) & 1
	mon.altAbility = (flags >> 29) & 3
	return mon
end

function readPartyMon(address)
	local mon = readBoxMon(address)
	mon.status = emu:read32(address + 80)
	mon.level = emu:read8(address + 84 + 4)
	mon.mail = emu:read32(address + 85 + 4)
	mon.hp = emu:read16(address + 86 + 4)
	mon.maxHP = emu:read16(address + 88 + 4)
	mon.attack = emu:read16(address + 90 + 4)
	mon.defense = emu:read16(address + 92 + 4)
	mon.speed = emu:read16(address + 94 + 4)
	mon.spAttack = emu:read16(address + 96 + 4)
	mon.spDefense = emu:read16(address + 98 + 4)
	return mon
end

function getTest(n)
	return console:log(string.format("%d",emu:read16(speciesInfo+(36*n)+24)))
end

function getAbility(mon)
	current = abilities[emu:read16(speciesInfo+(36*mon.species)+24+(mon.altAbility*2))]
    if (current == "None") then
        current = ability[(mon.species*3)+1]
    end
    return current
end

function getNature(mon)
	if (mon.hiddenNature ~= 26) then
		return nature[mon.hiddenNature + 1]
	end
	return nature[(mon.personality % 25)+1]
end

local function getMetLocationName(id)
	local locationId = tonumber(id) or 0
	return metLocations[locationId] or string.format("Unknown Location (0x%02X)", locationId & 0xFF)
end

function getPartyPrint(mon)
	str = ""
	if (mons[mon.species] == null) then
		return str
	end
	str = str .. mons[mon.species]
	if (item[mon.heldItem]) then
		str = str .. string.format(" @ %s", item[mon.heldItem])
	end
	str = str .. string.format("\n")
	str = str .. "Ability: " .. string.format("%s", getAbility(mon)) .. string.format("\n")
	str = str .. string.format("Level: %d\n", mon.level)
	str = str .. string.format("%s", getNature(mon)) .. " Nature" .. string.format("\n")
	str = str .. string.format("IVs: %d HP / %d Atk / %d Def / %d SpA / %d SpD / %d Spe", mon.hpIV, mon.attackIV, mon.defenseIV, mon.spAttackIV, mon.spDefenseIV, mon.speedIV) .. string.format("\n")
	for i=1,4 do
		local mv = move[mon.moves[i] + 1]
		if(mv == "Hidden Power") then
			str = str .. string.format("- Hidden Power %s\n", getHP(mon))
			else
			if(mv ~= "") then
				str = str .. string.format("- %s\n", mv)
			end
		end
	end
	str = str .. string.format("Met: %s\n", getMetLocationName(mon.metLocation))
	str = str .. string.format("\n")
	return str
end

function getPCPrint(mon)
	str = ""
	if (mons[mon.species] == null) then
		return str
	end
	str = str ..  mons[mon.species]
	if (item[mon.heldItem]) then
		str = str .. string.format(" @ %s", item[mon.heldItem])
	end
	str = str .. string.format("\n")
	str = str .. "Ability: " .. string.format("%s", getAbility(mon)) .. string.format("\n")
	str = str .. string.format("Level: %d\n", calcLevel(mon.experience, mon.species))
	str = str .. string.format("%s", getNature(mon)) .. " Nature" .. string.format("\n")
	str = str .. string.format("IVs: %d HP / %d Atk / %d Def / %d SpA / %d SpD / %d Spe", mon.hpIV, mon.attackIV, mon.defenseIV, mon.spAttackIV, mon.spDefenseIV, mon.speedIV) .. string.format("\n")
	for i=1,4 do
		local mv = move[mon.moves[i] + 1]
		if(mv == "Hidden Power") then
			str = str .. string.format("- Hidden Power %s\n", getHP(mon))
			else
			if(mv ~= "") then
				str = str .. string.format("- %s\n", mv)
			end
		end
	end
	str = str .. string.format("Met: %s\n", getMetLocationName(mon.metLocation))
	str = str .. string.format("\n")
	return str
end

function printPartyStatus(buffer)
    address = storageLoc + 4
    i = 0
	buffer:clear()
	for _, mon in ipairs(getParty()) do
		if (mon.species ~= 0) then
			buffer:print(getPartyPrint(mon))
		end
	end
    while i<120 do
		if (emu:read32(address) ~=0) then 
			buffer:print(getPCPrint(readBoxMon(address)))
		end
		i = i+1
		address = address + 84
	end
end

function getHP(mon)
    hptype = ((mon.hpIV%2 + (2*(mon.attackIV%2))+(4*(mon.defenseIV%2))+(8*(mon.speedIV%2))+(16*(mon.spAttackIV%2))+(32*(mon.spDefenseIV%2)))*5)/21
    hptype = math.floor(hptype)
	if (hptype == 0) then
		return "Fighting"
	end
	if (hptype == 1) then
		return "Flying"
	end
	if (hptype == 2) then
		return "Poison"
	end
	if (hptype == 3) then
		return "Ground"
	end
	if (hptype == 4) then
		return "Rock"
	end
	if (hptype ==5) then
		return "Bug"
	end
	if (hptype == 6) then
		return "Ghost"
	end
	if (hptype ==7) then
		return "Steel"
	end
	if (hptype == 8) then
		return "Fire"
	end
	if (hptype == 9) then
		return "Water"
	end
	if (hptype == 10) then
		return "Grass"
	end
	if (hptype == 11) then
		return "Electric"
	end
	if (hptype == 12) then
		return "Psychic"
	end
	if (hptype == 13) then
		return "Ice"
	end
	if (hptype == 14) then
		return "Dragon"
	end
	if (hptype == 15) then
		return "Dark"
	end
end

function getHiddens(buffer)
	address = storageLoc + 4
	i = 0
	buffer:clear()
	for _, mon in ipairs(getParty()) do
		if (mon.species ~= 0) then
			buffer:print(string.format("%s - %s\n", mons[mon.species], getHP(mon)))
		end
	end
	while i<120 do
		if (emu:read32(address) ~=0) then 
			buffer:print(string.format("%s - %s\n",mons[readBoxMon(address).species], getHP(readBoxMon(address))))
		end
		i = i+1
		address = address + 84
	end
end

function hiddens()
	if not hiddenBuffer then
		console:log("error")
		return
	end
	getHiddens(hiddenBuffer)
end

local function getShowdownTrainerIdLine(party)
	local trainerId = 0
	local secretId = 0
	for _, mon in ipairs(party or {}) do
		if mon and mon.species and mon.species > 0 and mon.otId then
			trainerId = mon.otId & 0xFFFF
			secretId = (mon.otId >> 16) & 0xFFFF
			break
		end
	end
	return string.format("TID: %d:%d\n", trainerId, secretId)
end

-- Build showdown export text without requiring a console buffer.
function buildShowdownText()
	local out = {}
	local party = getParty() or {}
	local address = storageLoc + 4
	local i = 0

	out[#out + 1] = getShowdownTrainerIdLine(party)

	for _, mon in ipairs(party) do
		if mon and mon.species and mon.species ~= 0 then
			out[#out + 1] = getPartyPrint(mon)
		end
	end

	while i < 120 do
		if emu:read32(address) ~= 0 then
			local mon = readBoxMon(address)
			if mon and mon.species and mon.species ~= 0 then
				out[#out + 1] = getPCPrint(mon)
			end
		end
		i = i + 1
		address = address + 84
	end

	return table.concat(out, "")
end
-- <<< END 00_data_showdown.lua

-- >>> BEGIN 01_battle_config_state.lua
-- Module Index: 01_battle_config_state
-- Owns: null battle/export constants and shared runtime state tables.

-- Null game battle logger (pinned runtime offsets).
local NULL_BATTLE = {
	addresses = {
		gBattlersCount = 0x02004D37,
		gBattlerPositions = 0x02004D3B,
		gBattlerPartyIndexes = 0x02004D42,
		gBattleMons = 0x02004D58,
	},
	struct = {
		battleMonSize = 0x60,
		speciesOffset = 0x00, -- best-effort; fallback to player-party decode for player side
		movesOffset = 0x0C,
		statStagesOffset = 0x18,
		statStagesCount = 8, -- hp/atk/def/spe/spa/spd/acc/evasion
		ppOffset = 0x25,
		hpOffset = 0x2A,
		levelOffset = 0x2C,
		maxHpOffset = 0x2E,
		otIdOffset = 0x55, -- BattlePokemon otId (unaligned); read bytewise
	},
	sessionResetFrames = 300,
	sessionStartPollFrames = 60,
	sessionActivePollFrames = 6,
	writeFullBattleLog = false,
	classifyWildByEnemyCount = true,
	consoleStartEndOnly = true,
}

local nullBattleState = {
	frame = 0,
	sessionActive = false,
	sessionSignature = nil,
	sessionTrainerDisplayId = nil,
	sessionFirstEnemySpecies = nil,
	sessionFirstEnemyLevel = nil,
	inactiveFrames = 0,
	pendingBoundary = false,
	pendingBoundaryFrames = 0,
	sessionOwnerTrainerKey = nil,
	lastSeenEnemyTrainerKey = nil,
	actionIndex = 0,
	prevSnapshots = {},
	koHistory = {},
	fullEvents = {},
	lastRuntimePollFrame = 0,
}

-- Optional hardcoded preset; set to nil to disable.
-- Example:
-- local NEXT_TRAINER_MOVESET_HARDCODE = { "Spore", "Sheer Cold", "Recover", "Protect" }
local NEXT_TRAINER_MOVESET_HARDCODE = nil

local nextTrainerMovesetState = {
	pending = nil,
	lastApplied = nil,
	moveNameToId = nil,
	defaultPp = 35,
}

local BOX_CREATE = {
	slotCount = 120,
	slotsPerBox = 30,
	slotStride = 84,
	secureOffset = 0x24, -- 36
	flagsOffset = 0x13, -- 19
	otNameOffset = 0x14, -- 20
	markingsOffset = 0x1D, -- 29
	checksumOffset = 0x1E, -- 30
	boxUnknownOffset = 0x20, -- 32
	substructSize = 12,
	defaultLanguage = 2,
	defaultFriendship = 70,
	defaultPp = 35,
	defaultLevel = 5,
	defaultPokeball = 4,
	defaultMetGame = 0,
	defaultMetLocation = 0,
	defaultOtGender = 0,
	defaultIv = 31,
}

local BOX_SUBSTRUCT_SELECTOR = {
	[ 0] = {0, 1, 2, 3},
	[ 1] = {0, 1, 3, 2},
	[ 2] = {0, 2, 1, 3},
	[ 3] = {0, 3, 1, 2},
	[ 4] = {0, 2, 3, 1},
	[ 5] = {0, 3, 2, 1},
	[ 6] = {1, 0, 2, 3},
	[ 7] = {1, 0, 3, 2},
	[ 8] = {2, 0, 1, 3},
	[ 9] = {3, 0, 1, 2},
	[10] = {2, 0, 3, 1},
	[11] = {3, 0, 2, 1},
	[12] = {1, 2, 0, 3},
	[13] = {1, 3, 0, 2},
	[14] = {2, 1, 0, 3},
	[15] = {3, 1, 0, 2},
	[16] = {2, 3, 0, 1},
	[17] = {3, 2, 0, 1},
	[18] = {1, 2, 3, 0},
	[19] = {1, 3, 2, 0},
	[20] = {2, 1, 3, 0},
	[21] = {3, 1, 2, 0},
	[22] = {2, 3, 1, 0},
	[23] = {3, 2, 1, 0},
}

local BOX_NULL = rawget(_G, "BOX_NULL")
if BOX_NULL == nil or type(BOX_NULL) ~= "table" then
	BOX_NULL = {}
	_G.BOX_NULL = BOX_NULL
end

local JSON_NULL = rawget(_G, "JSON_NULL")
if JSON_NULL == nil or type(JSON_NULL) ~= "table" then
	JSON_NULL = {}
	_G.JSON_NULL = JSON_NULL
end

local function getScriptDirectory()
	local info = debug and debug.getinfo and debug.getinfo(1, "S") or nil
	local source = info and info.source or nil
	if type(source) ~= "string" or source == "" then
		return "."
	end
	if source:sub(1, 1) == "@" then
		source = source:sub(2)
	end
	source = source:gsub("\\", "/")
	local dir = source:match("^(.*)/[^/]+$")
	if type(dir) == "string" and dir ~= "" then
		return dir
	end
	return "."
end

local NULL_EXPORT = {
	baseDir = getScriptDirectory(),
	mapFile = "attempt_map.json",
	fullBattleLogsDir = "full_battle_logs",
	version = "pokeemerald-expansion",
	defaultTrainerKey = "unknown:unknown",
	defaultBoxSlots = 120,
}

local nullExportState = {
	mapLoaded = false,
	mapData = nil,
	current = {
		trainerId = nil,
		secretId = nil,
		trainerKey = NULL_EXPORT.defaultTrainerKey,
		attempt = nil,
		attemptDir = nil,
		masterPath = nil,
	},
	eventsByAttempt = {},
	sessionCounterByAttempt = {},
	lastBoxMetaByAttempt = {},
	cachedBoxPayloadByAttempt = {},
}

-- Forward declaration for helpers defined later but used by early export writers.
local logNullBattle
-- <<< END 01_battle_config_state.lua

-- >>> BEGIN 02_json_fs_export.lua
-- Module Index: 02_json_fs_export
-- Owns: JSON encoding, filesystem helpers, attempt context, and battle log/master file writers.

local function battleHex8(v)
	if v == nil then
		return "n/a"
	end
	return string.format("0x%08X", v & 0xFFFFFFFF)
end

local function jsonEscape(str)
	str = tostring(str or "")
	str = str:gsub("\\", "\\\\")
	str = str:gsub("\"", "\\\"")
	str = str:gsub("\n", "\\n")
	str = str:gsub("\r", "\\r")
	str = str:gsub("\t", "\\t")
	return str
end

local function isArrayTable(t)
	if type(t) ~= "table" then
		return false
	end
	local n = #t
	for k, _ in pairs(t) do
		if type(k) ~= "number" or k < 1 or k > n or k % 1 ~= 0 then
			return false
		end
	end
	return true
end

local function jsonEncode(value)
	local valueType = type(value)
	if value == nil or value == JSON_NULL then
		return "null"
	elseif valueType == "boolean" then
		return value and "true" or "false"
	elseif valueType == "number" then
		if value ~= value or value == math.huge or value == -math.huge then
			return "null"
		end
		return string.format("%s", value)
	elseif valueType == "string" then
		return "\"" .. jsonEscape(value) .. "\""
	elseif valueType == "table" then
		if isArrayTable(value) then
			local parts = {}
			for i = 1, #value do
				parts[#parts + 1] = jsonEncode(value[i])
			end
			return "[" .. table.concat(parts, ",") .. "]"
		end
		local keys = {}
		for k, _ in pairs(value) do
			keys[#keys + 1] = tostring(k)
		end
		table.sort(keys)
		local parts = {}
		for i = 1, #keys do
			local keyText = keys[i]
			parts[#parts + 1] = "\"" .. jsonEscape(keyText) .. "\":" .. jsonEncode(value[keyText])
		end
		return "{" .. table.concat(parts, ",") .. "}"
	end
	return "null"
end

local ensuredDirCache = {}

local function pathExists(path)
	if not path or path == "" then
		return false
	end
	local ok, _err, code = os.rename(path, path)
	if ok then
		return true
	end
	-- Lua commonly returns code=13 when the path exists but permissions differ.
	return tonumber(code) == 13
end

local function quoteForCmd(path)
	return "\"" .. tostring(path or ""):gsub("\"", "\"\"") .. "\""
end

local function quoteForSh(path)
	return "'" .. tostring(path or ""):gsub("'", "'\\''") .. "'"
end

local function isLikelyWindowsPath(path)
	local text = tostring(path or "")
	if text:match("^%a:[/\\]") then
		return true
	end
	if text:find("\\", 1, true) then
		return true
	end
	if os and os.getenv then
		if os.getenv("ComSpec") or os.getenv("WINDIR") then
			return true
		end
	end
	return false
end

local function getBundlePlatformMode()
	local raw = rawget(_G, "NULL_BUILD_PLATFORM")
	if raw == nil then
		return "auto"
	end
	local mode = tostring(raw):lower()
	if mode == "windows" or mode == "nonwindows" then
		return mode
	end
	return "auto"
end

local function ensureDir(path)
	if not path or path == "" then
		return false
	end
	if ensuredDirCache[path] ~= nil then
		return ensuredDirCache[path]
	end
	if pathExists(path) then
		ensuredDirCache[path] = true
		return true
	end

	local normalizedWinPath = tostring(path):gsub("/", "\\")
	local windowsCmd = "mkdir " .. quoteForCmd(normalizedWinPath)
	local unixCmd = "mkdir -p " .. quoteForSh(path)
	local mode = getBundlePlatformMode()
	local likelyWindows = (mode == "windows") or (mode == "auto" and isLikelyWindowsPath(path))
	local commands
	if mode == "windows" then
		commands = { windowsCmd }
	elseif mode == "nonwindows" then
		commands = { unixCmd }
	elseif likelyWindows then
		commands = { windowsCmd, unixCmd }
	else
		commands = { unixCmd, windowsCmd }
	end

	for i = 1, #commands do
		local ok = os.execute(commands[i])
		if ok == true or ok == 0 then
			ensuredDirCache[path] = true
			return true
		end
		if pathExists(path) then
			ensuredDirCache[path] = true
			return true
		end
	end

	ensuredDirCache[path] = false
	return false
end

local function ensureDirForFile(path)
	if not path then
		return false
	end
	local norm = tostring(path):gsub("\\", "/")
	local dir = norm:match("^(.*)/[^/]+$")
	if not dir or dir == "" then
		return false
	end
	return ensureDir(dir)
end

local function splitTrainerKey(key)
	if type(key) ~= "string" then
		return nil, nil
	end
	local a, b = key:match("^(%d+):(%d+)$")
	if not a or not b then
		return nil, nil
	end
	return tonumber(a), tonumber(b)
end

local function makeTrainerKey(trainerId, secretId)
	if trainerId == nil or secretId == nil then
		return NULL_EXPORT.defaultTrainerKey
	end
	return string.format("%d:%d", trainerId, secretId)
end

local function getAttemptMapPath()
	return NULL_EXPORT.baseDir .. "/" .. NULL_EXPORT.mapFile
end

local function defaultAttemptMap()
	return {
		version = 1,
		nextAttempt = 1,
		map = {},
	}
end

local function loadAttemptMap()
	ensureDir(NULL_EXPORT.baseDir)
	local path = getAttemptMapPath()
	local f = io.open(path, "r")
	if not f then
		return defaultAttemptMap()
	end
	local raw = f:read("*a")
	f:close()
	if type(raw) ~= "string" or raw == "" then
		return defaultAttemptMap()
	end

	local data = defaultAttemptMap()
	data.version = tonumber(raw:match("\"version\"%s*:%s*(%d+)")) or 1
	data.nextAttempt = tonumber(raw:match("\"nextAttempt\"%s*:%s*(%d+)")) or 1
	if data.nextAttempt < 1 then
		data.nextAttempt = 1
	end

	local mapBody = raw:match("\"map\"%s*:%s*{(.-)}")
	if mapBody then
		for key, attempt in mapBody:gmatch("\"([^\"]+)\"%s*:%s*(%d+)") do
			data.map[key] = tonumber(attempt)
		end
	end
	return data
end

local function saveAttemptMap(data)
	if not data then
		return false
	end
	local mapKeys = {}
	for k, _ in pairs(data.map or {}) do
		mapKeys[#mapKeys + 1] = k
	end
	table.sort(mapKeys)

	local path = getAttemptMapPath()
	ensureDirForFile(path)
	local f = io.open(path, "w")
	if not f then
		return false
	end
	f:write("{\n")
	f:write(string.format("  \"version\": %d,\n", tonumber(data.version) or 1))
	f:write(string.format("  \"nextAttempt\": %d,\n", tonumber(data.nextAttempt) or 1))
	f:write("  \"map\": {\n")
	for i = 1, #mapKeys do
		local key = mapKeys[i]
		local attempt = tonumber(data.map[key]) or 1
		local comma = (i < #mapKeys) and "," or ""
		f:write(string.format("    \"%s\": %d%s\n", jsonEscape(key), attempt, comma))
	end
	f:write("  }\n")
	f:write("}\n")
	f:close()
	return true
end

local function ensureAttemptMapLoaded()
	if nullExportState.mapLoaded and nullExportState.mapData then
		return nullExportState.mapData
	end
	local data = loadAttemptMap()
	nullExportState.mapLoaded = true
	nullExportState.mapData = data
	return data
end

local function resolvePlayerIdentityFromParty()
	local party = getParty() or {}
	local counts = {}
	local valid = 0
	for i = 1, #party do
		local mon = party[i]
		if mon and mon.hasSpecies == 1 and mon.species and mon.species > 0 and mon.otId then
			local trainerId = mon.otId & 0xFFFF
			local secretId = (mon.otId >> 16) & 0xFFFF
			local key = makeTrainerKey(trainerId, secretId)
			counts[key] = (counts[key] or 0) + 1
			valid = valid + 1
		end
	end

	local topKey, topCount, secondCount = nil, 0, 0
	for key, c in pairs(counts) do
		if c > topCount then
			secondCount = topCount
			topCount = c
			topKey = key
		elseif c > secondCount then
			secondCount = c
		end
	end

	return {
		validCount = valid,
		topKey = topKey,
		topCount = topCount,
		secondCount = secondCount,
	}
end

local function resolveExportIdentity(existingKey)
	local mapData = ensureAttemptMapLoaded()
	local partyMode = resolvePlayerIdentityFromParty()
	local acceptMode = false
	if partyMode.topKey then
		if partyMode.topCount >= 2 then
			acceptMode = true
		elseif partyMode.topCount > partyMode.secondCount then
			acceptMode = true
		end
	end

	local chosenKey = nil
	if acceptMode then
		chosenKey = partyMode.topKey
	elseif existingKey and mapData.map and mapData.map[existingKey] then
		chosenKey = existingKey
	else
		chosenKey = NULL_EXPORT.defaultTrainerKey
	end

	local trainerId, secretId = splitTrainerKey(chosenKey)
	return {
		trainerId = trainerId,
		secretId = secretId,
		trainerKey = chosenKey,
		mode = partyMode,
	}
end

local function getOrCreateAttemptForKey(trainerKey)
	local mapData = ensureAttemptMapLoaded()
	local key = trainerKey or NULL_EXPORT.defaultTrainerKey
	local current = mapData.map[key]
	if current and current >= 1 then
		return current
	end

	local attempt = tonumber(mapData.nextAttempt) or 1
	if attempt < 1 then
		attempt = 1
	end
	mapData.map[key] = attempt
	mapData.nextAttempt = attempt + 1
	saveAttemptMap(mapData)
	return attempt
end

local function getAttemptDir(attempt)
	return string.format("%s/attempt_%d", NULL_EXPORT.baseDir, attempt)
end

local function getMasterPath(attempt)
	local dir = getAttemptDir(attempt)
	return string.format("%s/attempt_%d.json", dir, attempt)
end

local function getFullBattleLogsDir(attempt)
	return string.format("%s/%s", getAttemptDir(attempt), NULL_EXPORT.fullBattleLogsDir)
end

local function fileExists(path)
	if not path or path == "" then
		return false
	end
	local f = io.open(path, "r")
	if f then
		f:close()
		return true
	end
	return false
end

local function sanitizeFilenameComponent(value, fallback)
	local s = tostring(value or "")
	s = s:gsub("[^%w_%-]+", "_")
	s = s:gsub("_+", "_")
	s = s:gsub("^_+", "")
	s = s:gsub("_+$", "")
	if s == "" then
		return fallback or "unknown"
	end
	return s
end

local function ensureExportContext()
	local identity = resolveExportIdentity(nullExportState.current.trainerKey)
	local attempt = getOrCreateAttemptForKey(identity.trainerKey)
	local attemptDir = getAttemptDir(attempt)
	ensureDir(attemptDir)

	nullExportState.current.trainerId = identity.trainerId
	nullExportState.current.secretId = identity.secretId
	nullExportState.current.trainerKey = identity.trainerKey
	nullExportState.current.attempt = attempt
	nullExportState.current.attemptDir = attemptDir
	nullExportState.current.masterPath = getMasterPath(attempt)

	if not nullExportState.eventsByAttempt[attempt] then
		nullExportState.eventsByAttempt[attempt] = {}
	end
	return nullExportState.current
end

local function getCurrentAttemptEvents()
	local ctx = ensureExportContext()
	local attempt = ctx.attempt
	if not nullExportState.eventsByAttempt[attempt] then
		nullExportState.eventsByAttempt[attempt] = {}
	end
	return nullExportState.eventsByAttempt[attempt], ctx
end

local function bytesToHex(startAddr, size)
	local out = {}
	for i = 0, size - 1 do
		local b = emu:read8(startAddr + i) or 0
		out[#out + 1] = string.format("%02X", b & 0xFF)
	end
	return table.concat(out, "")
end

local function buildPartySnapshotForBattleLog()
	local list = {}
	local count = emu:read8(partyCount) or 0
	if count < 0 then count = 0 end
	if count > 6 then count = 6 end
	local monStart = partyloc
	for i = 1, count do
		local mon = readPartyMon(monStart)
		monStart = monStart + partyMonSize
		if mon and mon.species and mon.species > 0 then
			list[#list + 1] = {
				species = mon.species,
				ability = getAbility(mon),
				heldItem = mon.heldItem or 0,
				nature = getNature(mon),
				slot = i - 1,
				moves = {
					(mon.moves and mon.moves[1]) or 0,
					(mon.moves and mon.moves[2]) or 0,
					(mon.moves and mon.moves[3]) or 0,
					(mon.moves and mon.moves[4]) or 0,
				},
			}
		end
	end
	return list
end

local function getPartyStartSlotsForSession()
	local slots = {}
	local count = emu:read8(partyCount) or 0
	if count < 0 then count = 0 end
	if count > 6 then count = 6 end
	local monStart = partyloc
	for i = 1, count do
		local mon = readPartyMon(monStart)
		monStart = monStart + partyMonSize
		slots[#slots + 1] = {
			slot = i - 1,
			hasSpecies = mon and mon.hasSpecies or nil,
			species = mon and mon.species or nil,
			level = mon and mon.level or nil,
			hp = mon and mon.hp or nil,
			maxHP = mon and mon.maxHP or nil,
		}
	end
	return slots
end

local function buildPartyMetLocationsPayload(partySlots)
	local list = {}
	local monStart = partyloc
	for i = 1, partySlots do
		local mon = readPartyMon(monStart)
		monStart = monStart + partyMonSize
		if mon and mon.species and mon.species > 0 then
			list[#list + 1] = {
				slot = i - 1,
				species = mon.species,
				speciesName = mons[mon.species] or tostring(mon.species),
				metLocationId = mon.metLocation or 0,
				metLocation = getMetLocationName(mon.metLocation),
			}
		end
	end
	return list
end

local function buildBoxMetLocationsPayload(boxSlotsDumped)
	local list = {}
	local slotsPerBox = 30
	local address = storageLoc + 4
	for i = 0, boxSlotsDumped - 1 do
		local mon = readBoxMon(address + (i * boxMonSize))
		if mon and mon.species and mon.species > 0 then
			list[#list + 1] = {
				slot = i,
				box = math.floor(i / slotsPerBox) + 1,
				boxSlot = (i % slotsPerBox) + 1,
				species = mon.species,
				speciesName = mons[mon.species] or tostring(mon.species),
				metLocationId = mon.metLocation or 0,
				metLocation = getMetLocationName(mon.metLocation),
			}
		end
	end
	return list
end

local function buildPartyBoxPayloadForAttempt(ctx)
	local pCount = emu:read8(partyCount) or 0
	if pCount < 0 then pCount = 0 end
	if pCount > 6 then pCount = 6 end
	local slots = NULL_EXPORT.defaultBoxSlots
	if slots < 0 then slots = 0 end

	return {
		trainerId = ctx.trainerId,
		secretId = ctx.secretId,
		partyCount = pCount,
		partyStructSize = partyMonSize,
		boxStructSize = boxMonSize,
		boxSlotsDumped = slots,
		partyEncoding = "hex",
		boxesEncoding = "hex",
		party = bytesToHex(partyloc, pCount * partyMonSize),
		boxes = bytesToHex(storageLoc + 4, slots * boxMonSize),
		partyMetLocations = buildPartyMetLocationsPayload(pCount),
		boxMetLocations = buildBoxMetLocationsPayload(slots),
	}
end

local function cacheCurrentAttemptBoxPayload(ctx)
	local payload = buildPartyBoxPayloadForAttempt(ctx)
	nullExportState.lastBoxMetaByAttempt[ctx.attempt] = {
		updatedAt = os.date("%Y-%m-%dT%H:%M:%S"),
		partyCount = payload.partyCount,
		boxSlotsDumped = payload.boxSlotsDumped,
	}
	nullExportState.cachedBoxPayloadByAttempt[ctx.attempt] = payload
	return payload
end

local function writeCurrentAttemptMaster(refreshBoxPayload)
	local events, ctx = getCurrentAttemptEvents()
	local boxPayload = nil
	if refreshBoxPayload then
		boxPayload = cacheCurrentAttemptBoxPayload(ctx)
	else
		boxPayload = nullExportState.cachedBoxPayloadByAttempt[ctx.attempt]
	end
	local boxMeta = nullExportState.lastBoxMetaByAttempt[ctx.attempt] or {}
	if boxPayload then
		boxMeta = {
			updatedAt = os.date("%Y-%m-%dT%H:%M:%S"),
			partyCount = boxPayload.partyCount,
			boxSlotsDumped = boxPayload.boxSlotsDumped,
		}
		nullExportState.lastBoxMetaByAttempt[ctx.attempt] = boxMeta
	end
	ensureDirForFile(ctx.masterPath)
	local out = {
		version = NULL_EXPORT.version,
		attempt = ctx.attempt,
		trainerId = ctx.trainerId,
		secretId = ctx.secretId,
		trainerKey = ctx.trainerKey,
		battlelog = {
			events = events,
			eventCount = #events,
		},
		box = {
			updatedAt = boxMeta.updatedAt,
			partyCount = boxMeta.partyCount,
			boxSlotsDumped = boxMeta.boxSlotsDumped,
			payload = boxPayload or JSON_NULL,
		},
	}

	local f = io.open(ctx.masterPath, "w")
	if not f then
		logNullBattle(string.format("WARN: could not write master file %s", tostring(ctx.masterPath)))
		return false
	end
	f:write(jsonEncode(out))
	f:write("\n")
	f:close()
	return true
end

local function appendBattleLogEvent(record)
	if not record or type(record) ~= "table" then
		return
	end
	local events, _ctx = getCurrentAttemptEvents()
	events[#events + 1] = record
	writeCurrentAttemptMaster(nil)
end

local function appendFullBattleEvent(record)
	if not NULL_BATTLE.writeFullBattleLog then
		return
	end
	if not record or type(record) ~= "table" then
		return
	end
	if type(nullBattleState.fullEvents) ~= "table" then
		nullBattleState.fullEvents = {}
	end
	nullBattleState.fullEvents[#nullBattleState.fullEvents + 1] = record
end

local function getSpeciesNameForFile(species)
	if species and type(mons) == "table" then
		local name = mons[species]
		if name and name ~= "" then
			return tostring(name)
		end
	end
	if species == nil then
		return "Unknown"
	end
	return "Species" .. tostring(species)
end

local function getTrainerIdFoughtForFile()
	if type(nullBattleState.sessionOwnerTrainerKey) == "string" then
		local tid = tonumber(nullBattleState.sessionOwnerTrainerKey:match("^(%d+):"))
		if tid and tid > 0 then
			return tid
		end
	end
	if nullBattleState.sessionTrainerDisplayId ~= nil then
		return nullBattleState.sessionTrainerDisplayId
	end
	return "unknown"
end

local function getUniqueFullBattleLogPath(ctx)
	local dir = getFullBattleLogsDir(ctx.attempt)
	ensureDir(dir)
	local trainerPart = sanitizeFilenameComponent(getTrainerIdFoughtForFile(), "unknownTrainer")
	local levelPart = tonumber(nullBattleState.sessionFirstEnemyLevel) or 0
	local speciesPart = sanitizeFilenameComponent(getSpeciesNameForFile(nullBattleState.sessionFirstEnemySpecies), "unknownSpecies")
	local base = string.format("%s_lv%d_%s", trainerPart, levelPart, speciesPart)
	local path = string.format("%s/%s.json", dir, base)
	if not fileExists(path) then
		return path
	end
	local n = 2
	while n < 10000 do
		local cand = string.format("%s/%s_%d.json", dir, base, n)
		if not fileExists(cand) then
			return cand
		end
		n = n + 1
	end
	return string.format("%s/%s_%d.json", dir, base, os.time() or 0)
end

local function writeSessionFullBattleLog()
	local ctx = ensureExportContext()
	local path = getUniqueFullBattleLogPath(ctx)
	ensureDirForFile(path)
	local events = nullBattleState.fullEvents or {}
	local out = {
		version = NULL_EXPORT.version,
		attempt = ctx.attempt,
		playerTrainerId = ctx.trainerId,
		playerSecretId = ctx.secretId,
		playerTrainerKey = ctx.trainerKey,
		battle = {
			trainerIdFought = getTrainerIdFoughtForFile(),
			sessionSignature = nullBattleState.sessionSignature,
			syntheticTrainerId = nullBattleState.sessionTrainerDisplayId,
			ownerTrainerKey = nullBattleState.sessionOwnerTrainerKey,
			firstEnemySpecies = nullBattleState.sessionFirstEnemySpecies,
			firstEnemyLevel = nullBattleState.sessionFirstEnemyLevel,
			eventCount = #events,
			events = events,
		},
	}
	local f = io.open(path, "w")
	if not f then
		logNullBattle(string.format("WARN: could not write full battle log %s", tostring(path)))
		return false
	end
	f:write(jsonEncode(out))
	f:write("\n")
	f:close()
	logNullBattle(string.format("FULL_BATTLE_LOG file=%s events=%d", path, #events))
	return true
end

local function nextSyntheticSessionTrainerId()
	local ctx = ensureExportContext()
	local attempt = ctx.attempt or 0
	local nextCount = (nullExportState.sessionCounterByAttempt[attempt] or 0) + 1
	nullExportState.sessionCounterByAttempt[attempt] = nextCount
	return attempt * 1000000 + nextCount
end
-- <<< END 02_json_fs_export.lua

-- >>> BEGIN 03_battle_runtime_decode.lua
-- Module Index: 03_battle_runtime_decode
-- Owns: battle runtime reads/decoding and low-level write helpers for live battle state.

local function readU16LE(addr)
	local b0 = emu:read8(addr)
	local b1 = emu:read8(addr + 1)
	if b0 == nil or b1 == nil then
		return nil
	end
	return (b0 | (b1 << 8)) & 0xFFFF
end

local function readU32LE(addr)
	local b0 = emu:read8(addr)
	local b1 = emu:read8(addr + 1)
	local b2 = emu:read8(addr + 2)
	local b3 = emu:read8(addr + 3)
	if b0 == nil or b1 == nil or b2 == nil or b3 == nil then
		return nil
	end
	return ((b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)) & 0xFFFFFFFF)
end

local function readS8(addr)
	local b = emu:read8(addr)
	if b == nil then
		return nil
	end
	b = b & 0xFF
	if b >= 0x80 then
		return b - 0x100
	end
	return b
end

local function getEnemyPartyCountFallback()
	local enemyCount = emu:read8(partyCount + 1)
	if enemyCount ~= nil and enemyCount >= 0 and enemyCount <= 6 then
		return enemyCount
	end
	return nil
end

local function isTrainerBattleByEnemyCount(enemyCount)
	if not NULL_BATTLE.classifyWildByEnemyCount then
		return true
	end
	if enemyCount == nil then
		return false
	end
	return enemyCount > 1 and enemyCount <= 6
end

local function readPlayerSpeciesByPartyIndex(partyIndex)
	if partyIndex == nil or partyIndex < 0 then
		return nil
	end
	local count = emu:read8(partyCount)
	if count == nil or partyIndex >= count then
		return nil
	end
	local addr = partyloc + partyIndex * partyMonSize
	local mon = readPartyMon(addr)
	if mon and mon.species and mon.species > 0 then
		return mon.species
	end
	return nil
end

function readPlayerPartyMonByPartyIndex(partyIndex)
	if partyIndex == nil then
		return nil, nil
	end
	local idx = tonumber(partyIndex)
	if idx == nil then
		return nil, nil
	end
	idx = math.floor(idx)
	if idx < 0 then
		return nil, nil
	end
	local count = emu:read8(partyCount)
	if count == nil or idx >= count then
		return nil, nil
	end
	local monAddr = partyloc + idx * partyMonSize
	local mon = readPartyMon(monAddr)
	if not mon or not mon.species or mon.species <= 0 then
		return nil, nil
	end
	return mon, monAddr
end

local function readBattleSnapshot(battler)
	local posAddr = NULL_BATTLE.addresses.gBattlerPositions + battler
	local idxAddr = NULL_BATTLE.addresses.gBattlerPartyIndexes + battler * 2
	local monAddr = NULL_BATTLE.addresses.gBattleMons + battler * NULL_BATTLE.struct.battleMonSize

	local position = emu:read8(posAddr)
	local partyIndex = readU16LE(idxAddr)
	local hp = readU16LE(monAddr + NULL_BATTLE.struct.hpOffset)
	local maxHP = readU16LE(monAddr + NULL_BATTLE.struct.maxHpOffset)
	local level = emu:read8(monAddr + NULL_BATTLE.struct.levelOffset)
	if position == nil or partyIndex == nil or hp == nil or maxHP == nil or level == nil then
		return nil
	end

	local side = position & 1
	local species = readU16LE(monAddr + NULL_BATTLE.struct.speciesOffset)
	if (species == nil or species == 0) and side == 0 then
		species = readPlayerSpeciesByPartyIndex(partyIndex)
	end

	local moves = {}
	local pps = {}
	for i = 0, 3 do
		moves[i + 1] = readU16LE(monAddr + NULL_BATTLE.struct.movesOffset + i * 2)
		pps[i + 1] = emu:read8(monAddr + NULL_BATTLE.struct.ppOffset + i)
	end
	local statStages = {}
	for i = 0, (NULL_BATTLE.struct.statStagesCount or 0) - 1 do
		statStages[i + 1] = readS8(monAddr + NULL_BATTLE.struct.statStagesOffset + i)
	end

	return {
		battler = battler,
		position = position,
		partyIndex = partyIndex,
		side = side,
		species = species,
		hp = hp,
		maxHP = maxHP,
		level = level,
		moves = moves,
		pp = pps,
		statStages = statStages,
	}
end

function gatherBattleRuntime()
	local battlersCount = emu:read8(NULL_BATTLE.addresses.gBattlersCount)
	if battlersCount ~= 2 and battlersCount ~= 4 then
		return nil
	end

	local enemyPartyCount = getEnemyPartyCountFallback()
	if not isTrainerBattleByEnemyCount(enemyPartyCount) then
		return nil
	end

	local snapshots = {}
	local hasEnemy = false
	local hasPlayer = false
	for b = 0, battlersCount - 1 do
		local snap = readBattleSnapshot(b)
		if not snap then
			return nil
		end
		snapshots[b] = snap
		if snap.side == 1 then hasEnemy = true end
		if snap.side == 0 then hasPlayer = true end
	end
	if not (hasEnemy and hasPlayer) then
		return nil
	end

	return {
		battlersCount = battlersCount,
		enemyPartyCount = enemyPartyCount,
		snapshots = snapshots,
	}
end

local function isTrainerBattleGateActive()
	local enemyPartyCount = getEnemyPartyCountFallback()
	if not isTrainerBattleByEnemyCount(enemyPartyCount) then
		return false
	end

	local battlersCount = emu:read8(NULL_BATTLE.addresses.gBattlersCount)
	if battlersCount == nil then
		return false
	end
	if battlersCount == 0 or battlersCount == 0xFF then
		return false
	end

	return true
end

local formatMoveOverrideList
local formatPendingTrainerOverride

local function writeU16LE(addr, value)
	local v = (math.floor(tonumber(value) or 0)) & 0xFFFF
	emu:write8(addr, v & 0xFF)
	emu:write8(addr + 1, (v >> 8) & 0xFF)
end

local function writeU32LE(addr, value)
	local v = (math.floor(tonumber(value) or 0)) & 0xFFFFFFFF
	emu:write8(addr, v & 0xFF)
	emu:write8(addr + 1, (v >> 8) & 0xFF)
	emu:write8(addr + 2, (v >> 16) & 0xFF)
	emu:write8(addr + 3, (v >> 24) & 0xFF)
end

local function writeByteArray(addr, bytes)
	for i = 1, #bytes do
		emu:write8(addr + (i - 1), bytes[i] & 0xFF)
	end
end

local randomSeededForBoxCreate = false
local function ensureRandomSeededForBoxCreate()
	if randomSeededForBoxCreate then
		return
	end
	local seed = (os.time() or 0) ~ ((os.clock() * 1000000) or 0) ~ (partyloc or 0)
	math.randomseed(seed & 0x7FFFFFFF)
	-- Burn a few values to avoid weak first outputs from some Lua RNGs.
	math.random()
	math.random()
	math.random()
	randomSeededForBoxCreate = true
end

local function randomU32()
	ensureRandomSeededForBoxCreate()
	local hi = math.random(0, 0xFFFF)
	local lo = math.random(0, 0xFFFF)
	return (((hi << 16) | lo) & 0xFFFFFFFF)
end

local function getFirstEnemySnapshot(runtime)
	if not runtime or not runtime.snapshots then
		return nil
	end
	local best = nil
	for b = 0, runtime.battlersCount - 1 do
		local snap = runtime.snapshots[b]
		if snap and snap.side == 1 then
			if best == nil or snap.battler < best.battler then
				best = snap
			end
		end
	end
	return best
end

local function applyPendingTrainerOverrideToEnemySnapshot(snap, pending)
	if not snap or snap.side ~= 1 then
		return false, "no enemy battler available"
	end
	if not pending or type(pending) ~= "table" then
		return false, "missing pending override"
	end

	local monAddr = NULL_BATTLE.addresses.gBattleMons + snap.battler * NULL_BATTLE.struct.battleMonSize
	local wroteAny = false

	if pending.moves ~= nil then
		if type(pending.moves) ~= "table" then
			return false, "invalid pending moveset"
		end
		for i = 1, 4 do
			local moveId = tonumber(pending.moves[i]) or 0
			moveId = math.floor(moveId)
			if moveId < 0 then
				moveId = 0
			end

			local moveAddr = monAddr + NULL_BATTLE.struct.movesOffset + (i - 1) * 2
			local ppAddr = monAddr + NULL_BATTLE.struct.ppOffset + (i - 1)
			writeU16LE(moveAddr, moveId)

			local currentPp = emu:read8(ppAddr) or 0
			local nextPp = currentPp
			if moveId == 0 then
				nextPp = 0
			elseif currentPp <= 0 then
				nextPp = nextTrainerMovesetState.defaultPp
			end
			emu:write8(ppAddr, (math.floor(nextPp) or 0) & 0xFF)
		end
		wroteAny = true
	end

	local hpAddr = monAddr + NULL_BATTLE.struct.hpOffset
	local maxHpAddr = monAddr + NULL_BATTLE.struct.maxHpOffset
	if pending.maxHp ~= nil then
		local nextMaxHp = math.floor(tonumber(pending.maxHp) or 0)
		if nextMaxHp < 1 then
			nextMaxHp = 1
		end
		if nextMaxHp > 0xFFFF then
			nextMaxHp = 0xFFFF
		end
		writeU16LE(maxHpAddr, nextMaxHp)
		wroteAny = true
	end
	if pending.hp ~= nil then
		local nextHp = math.floor(tonumber(pending.hp) or 0)
		if nextHp < 0 then
			nextHp = 0
		end
		if nextHp > 0xFFFF then
			nextHp = 0xFFFF
		end
		local clampMax = readU16LE(maxHpAddr)
		if clampMax ~= nil and clampMax > 0 and nextHp > clampMax then
			nextHp = clampMax
		end
		writeU16LE(hpAddr, nextHp)
		wroteAny = true
	end

	if not wroteAny then
		return false, "override has no fields set"
	end
	return true, nil
end

local function tryApplyPendingNextTrainerMovesetOverride(runtime, phase)
	local pending = nextTrainerMovesetState.pending
	if pending == nil then
		return false
	end
	local targetSnap = getFirstEnemySnapshot(runtime)
	if not targetSnap then
		return false
	end

	local ok, err = applyPendingTrainerOverrideToEnemySnapshot(targetSnap, pending)
	if not ok then
		logNullBattle("TRAINER_OVERRIDE apply failed: " .. tostring(err))
		return false
	end

	local applied = {}
	if type(pending.moves) == "table" then
		applied.moves = {
			pending.moves[1],
			pending.moves[2],
			pending.moves[3],
			pending.moves[4],
		}
	end
	if pending.hp ~= nil then
		applied.hp = tonumber(pending.hp)
	end
	if pending.maxHp ~= nil then
		applied.maxHp = tonumber(pending.maxHp)
	end

	nextTrainerMovesetState.lastApplied = {
		appliedAt = os.date("%Y-%m-%dT%H:%M:%S"),
		frame = nullBattleState.frame,
		phase = phase,
		battler = targetSnap.battler,
		partyIndex = targetSnap.partyIndex,
		override = applied,
	}
	nextTrainerMovesetState.pending = nil
	logNullBattle(string.format(
		"TRAINER_OVERRIDE applied phase=%s battler=%d partyIndex=%d %s",
		tostring(phase or "unknown"),
		targetSnap.battler,
		targetSnap.partyIndex,
		formatPendingTrainerOverride(applied)
	))
	return true
end

local function makeSessionSignature(rt)
	local s0 = rt.snapshots[0]
	local s1 = rt.snapshots[1]
	return string.format(
		"%02X:%d:%d:%d:%d",
		rt.enemyPartyCount or 0,
		rt.battlersCount or 0,
		s0 and s0.partyIndex or 0,
		s1 and s1.partyIndex or 0,
		s1 and s1.moves and s1.moves[1] or 0
	)
end

local function makeTrainerKeyFromOtId(otId)
	if otId == nil then
		return nil
	end
	otId = otId & 0xFFFFFFFF
	if otId == 0 or otId == 0xFFFFFFFF then
		return nil
	end
	local trainerId = otId & 0xFFFF
	local secretId = (otId >> 16) & 0xFFFF
	if trainerId == 0 or trainerId == 0xFFFF then
		return nil
	end
	if (trainerId == 0 and secretId == 0) or (trainerId == 0xFFFF and secretId == 0xFFFF) then
		return nil
	end
	return string.format("%d:%d", trainerId, secretId)
end

local function readEnemyTrainerKeyFromBattleMon(enemyBattler)
	if enemyBattler == nil or enemyBattler < 0 then
		return nil
	end
	local monAddr = NULL_BATTLE.addresses.gBattleMons + enemyBattler * NULL_BATTLE.struct.battleMonSize
	local otId = readU32LE(monAddr + NULL_BATTLE.struct.otIdOffset)
	return makeTrainerKeyFromOtId(otId)
end

local function readEnemyTrainerKeyFromRuntime(runtime)
	if not runtime or not runtime.snapshots then
		return nil
	end
	local fallbackEnemyBattler = nil
	for b = 0, runtime.battlersCount - 1 do
		local snap = runtime.snapshots[b]
		if snap and snap.side == 1 then
			if fallbackEnemyBattler == nil then
				fallbackEnemyBattler = b
			end
			local trainerKey = readEnemyTrainerKeyFromBattleMon(b)
			if trainerKey then
				return trainerKey
			end
		end
	end
	if fallbackEnemyBattler ~= nil then
		return readEnemyTrainerKeyFromBattleMon(fallbackEnemyBattler)
	end
	return nil
end

local BATTLE_CONSOLE_EVENT_PREFIXES = {
	SESSION_START = true,
	SESSION_END = true,
	BATTLE_START = true,
	BATTLE_END = true,
	PARTY_START = true,
	PARTY_START_SLOT = true,
	SESSION_ACTIVE_HP = true,
	MOVE = true,
	HP = true,
	KO = true,
	KO_UPDATE = true,
	STAT_STAGE = true,
	BOUNDARY_PENDING = true,
	BOUNDARY_TIMEOUT = true,
	BOUNDARY_KEY_CHANGE = true,
	OWNER_TRAINER_KEY = true,
	FULL_BATTLE_LOG = true,
}
-- <<< END 03_battle_runtime_decode.lua

-- >>> BEGIN 04_shared_helpers.lua
-- Module Index: 04_shared_helpers
-- Owns: shared formatting/lookup/parse helpers and trainer key utilities.

local function shouldPrintNullBattleMessage(msg)
	if not NULL_BATTLE.consoleStartEndOnly then
		return true
	end
	local text = tostring(msg or "")
	local prefix = text:match("^([A-Z_]+)")
	if not prefix then
		return true
	end
	if not BATTLE_CONSOLE_EVENT_PREFIXES[prefix] then
		return true
	end
	return prefix == "BATTLE_START" or prefix == "BATTLE_END"
end

logNullBattle = function(msg)
	if not shouldPrintNullBattleMessage(msg) then
		return
	end
	console:log("[Null Battle] " .. msg)
end

local function formatSpeciesDisplay(species)
	if species == nil then
		return "unknown"
	end
	local name = nil
	if type(mons) == "table" then
		name = mons[species]
	end
	if name and name ~= "" then
		return string.format("%s(%d)", tostring(name), species)
	end
	return tostring(species)
end

local function formatKoHistory(history)
	if type(history) ~= "table" or #history == 0 then
		return "none"
	end
	local out = {}
	for i = 1, #history do
		out[#out + 1] = formatSpeciesDisplay(history[i])
	end
	return table.concat(out, ", ")
end

local function normalizeMoveNameKey(text)
	local s = tostring(text or ""):lower()
	s = s:gsub("[^%w]", "")
	return s
end

local function isBoxNullSentinel(value)
	if value == BOX_NULL then
		return true
	end
	if type(value) == "string" then
		return normalizeMoveNameKey(value) == "null"
	end
	return false
end

local function getMoveNameToIdMap()
	if nextTrainerMovesetState.moveNameToId then
		return nextTrainerMovesetState.moveNameToId
	end
	local map = {}
	for i = 2, #move do
		local name = move[i]
		if type(name) == "string" and name ~= "" then
			local key = normalizeMoveNameKey(name)
			if key ~= "" and map[key] == nil then
				map[key] = i - 1
			end
		end
	end
	nextTrainerMovesetState.moveNameToId = map
	return map
end

local function getMoveNameById(moveId)
	local id = tonumber(moveId)
	if id == nil then
		return "Unknown"
	end
	id = math.floor(id)
	if id <= 0 then
		return "None"
	end
	local name = move[id + 1]
	if type(name) == "string" and name ~= "" then
		return name
	end
	return "Move" .. tostring(id)
end

local function parseMoveOverrideEntry(entry, slot)
	if entry == nil then
		return 0, nil
	end
	local entryType = type(entry)
	if entryType == "number" then
		local id = math.floor(entry)
		if id < 0 or id > (#move - 1) then
			return nil, string.format("slot %d move id out of range: %s", slot, tostring(entry))
		end
		return id, nil
	end
	if entryType == "string" then
		local trimmed = entry:gsub("^%s+", ""):gsub("%s+$", "")
		if trimmed == "" then
			return 0, nil
		end
		local asNumber = tonumber(trimmed)
		if asNumber ~= nil then
			return parseMoveOverrideEntry(asNumber, slot)
		end
		local key = normalizeMoveNameKey(trimmed)
		local id = getMoveNameToIdMap()[key]
		if id == nil then
			return nil, string.format("slot %d unknown move: %s", slot, trimmed)
		end
		return id, nil
	end
	return nil, string.format("slot %d invalid value type: %s", slot, entryType)
end

local itemNameToId = nil
local natureNameToId = nil
local speciesNameToId = nil
local gameCharEncodeMap = nil

local function getItemNameToIdMap()
	if itemNameToId ~= nil then
		return itemNameToId
	end
	local map = {}
	for k, v in pairs(item) do
		if type(k) == "number" and type(v) == "string" and v ~= "" then
			local key = normalizeMoveNameKey(v)
			if key ~= "" and map[key] == nil then
				map[key] = k
			end
		end
	end
	itemNameToId = map
	return map
end

local function getNatureNameToIdMap()
	if natureNameToId ~= nil then
		return natureNameToId
	end
	local map = {}
	for i = 1, #nature do
		local n = nature[i]
		if type(n) == "string" and n ~= "" then
			local key = normalizeMoveNameKey(n)
			if key ~= "" and map[key] == nil then
				map[key] = i - 1
			end
		end
	end
	natureNameToId = map
	return map
end

local function getSpeciesNameToIdMap()
	if speciesNameToId ~= nil then
		return speciesNameToId
	end
	local map = {}
	if type(mons) == "table" then
		for k, v in pairs(mons) do
			if type(k) == "number" and k > 0 and type(v) == "string" and v ~= "" then
				local key = normalizeMoveNameKey(v)
				if key ~= "" and map[key] == nil then
					map[key] = k
				end
			end
		end
	end
	speciesNameToId = map
	return map
end

local function getGameCharEncodeMap()
	if gameCharEncodeMap ~= nil then
		return gameCharEncodeMap
	end
	local map = {}
	for k, v in pairs(charmap) do
		if type(k) == "number" and type(v) == "string" and v ~= "" and map[v] == nil then
			map[v] = k
		end
	end
	if map[" "] == nil then
		map[" "] = 0
	end
	gameCharEncodeMap = map
	return map
end

local function encodeGameText(text, maxLen)
	local out = {}
	for i = 1, maxLen do
		out[i] = terminator
	end
	local str = tostring(text or "")
	if str == "" then
		return out
	end
	local enc = getGameCharEncodeMap()
	local pos = 1
	for i = 1, #str do
		if pos > maxLen then
			break
		end
		local ch = str:sub(i, i)
		local code = enc[ch]
		if code == nil then
			code = enc[" "] or 0
		end
		out[pos] = code & 0xFF
		pos = pos + 1
	end
	return out
end

local function parseIntegerInRange(value, minValue, maxValue, label)
	local n = tonumber(value)
	if n == nil then
		return nil, string.format("%s must be a number", label)
	end
	n = math.floor(n)
	if n < minValue or n > maxValue then
		return nil, string.format("%s out of range (%d..%d): %s", label, minValue, maxValue, tostring(value))
	end
	return n, nil
end

local function parseBoxSlotSelector(slotValue)
	if type(slotValue) == "string" then
		local trimmed = slotValue:gsub("^%s+", ""):gsub("%s+$", "")
		local boxText, slotText = trimmed:match("^[Bb][Oo][Xx]%s*(%d+)%s*:%s*(%d+)$")
		if boxText and slotText then
			local boxNum = tonumber(boxText)
			local boxSlot = tonumber(slotText)
			if boxNum == nil or boxSlot == nil then
				return nil, "slotIndex box format parse failed"
			end
			local maxBoxes = math.floor(BOX_CREATE.slotCount / BOX_CREATE.slotsPerBox)
			if boxNum < 1 or boxNum > maxBoxes then
				return nil, string.format("box number out of range (1..%d): %s", maxBoxes, tostring(boxNum))
			end
			if boxSlot < 1 or boxSlot > BOX_CREATE.slotsPerBox then
				return nil, string.format("box slot out of range (1..%d): %s", BOX_CREATE.slotsPerBox, tostring(boxSlot))
			end
			local globalSlot = ((boxNum - 1) * BOX_CREATE.slotsPerBox) + boxSlot
			return globalSlot, nil
		end
	end
	return parseIntegerInRange(slotValue, 1, BOX_CREATE.slotCount, "slotIndex")
end

local function resolveIvsForCreate(ivsValue)
	local defaults = {
		hp = BOX_CREATE.defaultIv,
		atk = BOX_CREATE.defaultIv,
		def = BOX_CREATE.defaultIv,
		spa = BOX_CREATE.defaultIv,
		spd = BOX_CREATE.defaultIv,
		spe = BOX_CREATE.defaultIv,
	}
	if ivsValue == nil then
		return defaults, nil
	end
	if type(ivsValue) ~= "table" then
		return nil, "ivs must be a table (keys: hp/atk/def/spa/spd/spe or indices 1..6)"
	end

	local function ivFrom(value, label)
		local n, err = parseIntegerInRange(value, 0, 31, label)
		if n == nil then
			return nil, err
		end
		return n, nil
	end

	local aliases = {
		hp = "hp",
		atk = "atk",
		attack = "atk",
		def = "def",
		defense = "def",
		spa = "spa",
		spatk = "spa",
		spattack = "spa",
		spd = "spd",
		spdef = "spd",
		spdefense = "spd",
		spe = "spe",
		speed = "spe",
	}

	for k, v in pairs(ivsValue) do
		if type(k) == "number" then
			if k >= 1 and k <= 6 and k % 1 == 0 then
				local order = { "hp", "atk", "def", "spa", "spd", "spe" }
				local statKey = order[k]
				local parsed, err = ivFrom(v, "ivs[" .. tostring(k) .. "]")
				if parsed == nil then
					return nil, err
				end
				defaults[statKey] = parsed
			else
				return nil, "ivs numeric indexes must be 1..6"
			end
		elseif type(k) == "string" then
			local key = normalizeMoveNameKey(k)
			local statKey = aliases[key]
			if statKey == nil then
				return nil, "unknown iv key: " .. tostring(k)
			end
			local parsed, err = ivFrom(v, "ivs." .. tostring(k))
			if parsed == nil then
				return nil, err
			end
			defaults[statKey] = parsed
		else
			return nil, "ivs keys must be strings or indexes 1..6"
		end
	end

	return defaults, nil
end

local function resolveIvsPatchForEdit(ivsValue)
	if isBoxNullSentinel(ivsValue) then
		return {
			hp = BOX_CREATE.defaultIv,
			atk = BOX_CREATE.defaultIv,
			def = BOX_CREATE.defaultIv,
			spa = BOX_CREATE.defaultIv,
			spd = BOX_CREATE.defaultIv,
			spe = BOX_CREATE.defaultIv,
		}, nil
	end
	if type(ivsValue) ~= "table" then
		return nil, "ivs must be a table (keys: hp/atk/def/spa/spd/spe or indices 1..6)"
	end

	local patch = {}
	local function ivFrom(value, label)
		local n, err = parseIntegerInRange(value, 0, 31, label)
		if n == nil then
			return nil, err
		end
		return n, nil
	end

	local aliases = {
		hp = "hp",
		atk = "atk",
		attack = "atk",
		def = "def",
		defense = "def",
		spa = "spa",
		spatk = "spa",
		spattack = "spa",
		spd = "spd",
		spdef = "spd",
		spdefense = "spd",
		spe = "spe",
		speed = "spe",
	}
	local any = false
	for k, v in pairs(ivsValue) do
		if type(k) == "number" then
			if k >= 1 and k <= 6 and k % 1 == 0 then
				local order = { "hp", "atk", "def", "spa", "spd", "spe" }
				local statKey = order[k]
				local parsed, err = ivFrom(v, "ivs[" .. tostring(k) .. "]")
				if parsed == nil then
					return nil, err
				end
				patch[statKey] = parsed
				any = true
			else
				return nil, "ivs numeric indexes must be 1..6"
			end
		elseif type(k) == "string" then
			local key = normalizeMoveNameKey(k)
			local statKey = aliases[key]
			if statKey == nil then
				return nil, "unknown iv key: " .. tostring(k)
			end
			local parsed, err = ivFrom(v, "ivs." .. tostring(k))
			if parsed == nil then
				return nil, err
			end
			patch[statKey] = parsed
			any = true
		else
			return nil, "ivs keys must be strings or indexes 1..6"
		end
	end
	if not any then
		return nil, "ivs patch is empty"
	end
	return patch, nil
end

local function resolveSpeciesForCreate(speciesValue)
	local speciesId = nil
	if type(speciesValue) == "number" then
		local err
		speciesId, err = parseIntegerInRange(speciesValue, 1, 0xFFFF, "speciesId")
		if speciesId == nil then
			return nil, nil, err
		end
	elseif type(speciesValue) == "string" then
		local trimmed = speciesValue:gsub("^%s+", ""):gsub("%s+$", "")
		if trimmed == "" then
			return nil, nil, "speciesId/speciesName is required"
		end
		local asNum = tonumber(trimmed)
		if asNum ~= nil then
			local err
			speciesId, err = parseIntegerInRange(asNum, 1, 0xFFFF, "speciesId")
			if speciesId == nil then
				return nil, nil, err
			end
		else
			local key = normalizeMoveNameKey(trimmed)
			speciesId = getSpeciesNameToIdMap()[key]
			if speciesId == nil then
				return nil, nil, string.format("unknown species name: %s", trimmed)
			end
		end
	else
		return nil, nil, "speciesId/speciesName must be a number or string"
	end
	local speciesName = mons and mons[speciesId] or nil
	if type(speciesName) ~= "string" or speciesName == "" then
		return nil, nil, string.format("unknown species id: %d", speciesId)
	end
	return speciesId, speciesName, nil
end

local function resolveSpeciesForEdit(speciesValue)
	if isBoxNullSentinel(speciesValue) then
		return nil, nil, "species cannot be cleared in edit mode"
	end
	return resolveSpeciesForCreate(speciesValue)
end

local function resolveCreateMoves(movesValue)
	local out = { 0, 0, 0, 0 }
	if movesValue == nil then
		return out, nil
	end
	if type(movesValue) ~= "table" then
		return nil, "moves must be an array of up to 4 move names/ids"
	end

	local maxIndex = 0
	for k, _ in pairs(movesValue) do
		if type(k) ~= "number" or k < 1 or k % 1 ~= 0 then
			return nil, "moves must use numeric array indexes"
		end
		if k > maxIndex then
			maxIndex = k
		end
	end
	if maxIndex > 4 then
		return nil, "moves can contain at most 4 entries"
	end

	for i = 1, 4 do
		local moveId, moveErr = parseMoveOverrideEntry(movesValue[i], i)
		if moveId == nil then
			return nil, "moves " .. moveErr
		end
		out[i] = moveId
	end
	return out, nil
end

local function resolveMovesPatchForEdit(movesValue)
	if isBoxNullSentinel(movesValue) then
		return { clearAll = true, patch = nil }, nil
	end
	if type(movesValue) ~= "table" then
		return nil, "moves must be an array/object with indexes 1..4"
	end
	local patch = {}
	local any = false
	for k, v in pairs(movesValue) do
		if type(k) ~= "number" or k < 1 or k > 4 or k % 1 ~= 0 then
			return nil, "moves patch indexes must be 1..4"
		end
		local moveId
		local err
		if isBoxNullSentinel(v) then
			moveId = 0
		else
			moveId, err = parseMoveOverrideEntry(v, k)
			if moveId == nil then
				return nil, "moves " .. tostring(err)
			end
		end
		patch[k] = moveId
		any = true
	end
	if not any then
		return nil, "moves patch is empty"
	end
	return { clearAll = false, patch = patch }, nil
end

local function resolveHeldItemForCreate(itemValue)
	if itemValue == nil then
		return 0, nil
	end
	if type(itemValue) == "number" then
		return parseIntegerInRange(itemValue, 0, 0xFFFF, "heldItem")
	end
	if type(itemValue) ~= "string" then
		return nil, "heldItem must be item id or item name"
	end
	local trimmed = itemValue:gsub("^%s+", ""):gsub("%s+$", "")
	if trimmed == "" then
		return 0, nil
	end
	local asNumber = tonumber(trimmed)
	if asNumber ~= nil then
		return parseIntegerInRange(asNumber, 0, 0xFFFF, "heldItem")
	end
	local key = normalizeMoveNameKey(trimmed)
	local resolved = getItemNameToIdMap()[key]
	if resolved == nil then
		return nil, string.format("unknown held item: %s", trimmed)
	end
	return resolved, nil
end

local function resolveHeldItemForEdit(itemValue)
	if isBoxNullSentinel(itemValue) then
		return 0, nil
	end
	return resolveHeldItemForCreate(itemValue)
end

local function resolveNatureForCreate(natureValue)
	if natureValue == nil then
		return 26, "PID", nil
	end
	if type(natureValue) == "number" then
		local n, err = parseIntegerInRange(natureValue, 0, 24, "nature")
		if n == nil then
			return nil, nil, err
		end
		return n, nature[n + 1] or tostring(n), nil
	end
	if type(natureValue) ~= "string" then
		return nil, nil, "nature must be id or nature name"
	end
	local trimmed = natureValue:gsub("^%s+", ""):gsub("%s+$", "")
	if trimmed == "" then
		return 26, "PID", nil
	end
	local asNumber = tonumber(trimmed)
	if asNumber ~= nil then
		return resolveNatureForCreate(asNumber)
	end
	local key = normalizeMoveNameKey(trimmed)
	local n = getNatureNameToIdMap()[key]
	if n == nil then
		return nil, nil, string.format("unknown nature: %s", trimmed)
	end
	return n, nature[n + 1] or tostring(n), nil
end

local function resolveNatureForEdit(natureValue)
	if isBoxNullSentinel(natureValue) then
		return 26, "PID", nil
	end
	return resolveNatureForCreate(natureValue)
end

local function resolveCurrentPlayerOtId()
	local mode = resolvePlayerIdentityFromParty()
	if mode and mode.topKey then
		local tid, sid = splitTrainerKey(mode.topKey)
		if tid ~= nil and sid ~= nil then
			local otId = ((sid << 16) | tid) & 0xFFFFFFFF
			return otId, tid, sid, nil
		end
	end

	local party = getParty() or {}
	for i = 1, #party do
		local mon = party[i]
		if mon and mon.otId and mon.otId > 0 then
			local tid = mon.otId & 0xFFFF
			local sid = (mon.otId >> 16) & 0xFFFF
			return mon.otId & 0xFFFFFFFF, tid, sid, nil
		end
	end
	return nil, nil, nil, "could not resolve current player OT id from party"
end

STATUS1_SLEEP = 0x00000007
STATUS1_POISON = 0x00000008
STATUS1_BURN = 0x00000010
STATUS1_FREEZE = 0x00000020
STATUS1_PARALYSIS = 0x00000040
STATUS1_TOXIC_COUNTER = 0x00000F00
-- <<< END 04_shared_helpers.lua

-- >>> BEGIN 05_battle_state_payload.lua
-- Module Index: 05_battle_state_payload
-- Owns: /battle_state payload builders and battle-state view-model formatting.

function jsonOrNull(value)
	if value == nil then
		return JSON_NULL
	end
	return value
end

function decodeStatusNameFromRaw(statusRaw)
	local raw = tonumber(statusRaw)
	if raw == nil then
		return nil
	end
	raw = math.floor(raw) & 0xFFFFFFFF
	if (raw & STATUS1_SLEEP) ~= 0 then
		return "SLP"
	end
	if (raw & STATUS1_POISON) ~= 0 then
		if (raw & STATUS1_TOXIC_COUNTER) ~= 0 then
			return "TOX"
		end
		return "PSN"
	end
	if (raw & STATUS1_BURN) ~= 0 then
		return "BRN"
	end
	if (raw & STATUS1_FREEZE) ~= 0 then
		return "FRZ"
	end
	if (raw & STATUS1_PARALYSIS) ~= 0 then
		return "PAR"
	end
	return nil
end

function resolveCurrentTrainerIdsForHttp()
	local _otId, trainerId, secretId, _err = resolveCurrentPlayerOtId()
	if trainerId == nil or secretId == nil then
		return nil, nil
	end
	return trainerId, secretId
end

function getSpeciesNameForBattleState(speciesId)
	local species = tonumber(speciesId)
	if species == nil or species <= 0 then
		return "Unknown"
	end
	if type(mons) == "table" then
		local name = mons[species]
		if type(name) == "string" and name ~= "" then
			return name
		end
	end
	return tostring(species)
end

function getHeldItemNameForBattleState(heldItemId)
	local itemId = tonumber(heldItemId) or 0
	itemId = math.floor(itemId)
	if itemId <= 0 then
		return nil
	end
	if type(item) == "table" then
		local name = item[itemId]
		if type(name) == "string" and name ~= "" then
			return name
		end
	end
	return tostring(itemId)
end

BATTLE_STATE_STAT_NAMES = {
	"hp",
	"atk",
	"def",
	"speed",
	"spAtk",
	"spDef",
	"accuracy",
	"evasion",
}

function decodeBattleStateStageValue(raw)
	if raw == nil then
		return nil
	end
	local n = math.floor(tonumber(raw) or 0)
	if n >= 0 and n <= 12 then
		return n - 6
	end
	if n >= 128 then
		return n - 256
	end
	return n
end

function buildBattleStateStatStages(snap)
	local out = {}
	for i = 1, #BATTLE_STATE_STAT_NAMES do
		local name = BATTLE_STATE_STAT_NAMES[i]
		local raw = snap and snap.statStages and snap.statStages[i] or nil
		out[name] = jsonOrNull(decodeBattleStateStageValue(raw))
	end
	return out
end

function buildBattleStateStatStageChanges(prevSnap, currSnap)
	local changes = {}
	if type(prevSnap) ~= "table" or type(currSnap) ~= "table" then
		return changes
	end
	if type(prevSnap.statStages) ~= "table" or type(currSnap.statStages) ~= "table" then
		return changes
	end
	for i = 1, #BATTLE_STATE_STAT_NAMES do
		local beforeRaw = prevSnap.statStages[i]
		local afterRaw = currSnap.statStages[i]
		if beforeRaw ~= nil and afterRaw ~= nil and beforeRaw ~= afterRaw then
			local before = decodeBattleStateStageValue(beforeRaw)
			local after = decodeBattleStateStageValue(afterRaw)
			changes[#changes + 1] = {
				stat = BATTLE_STATE_STAT_NAMES[i],
				before = jsonOrNull(before),
				after = jsonOrNull(after),
				delta = (before ~= nil and after ~= nil) and (after - before) or JSON_NULL,
				beforeRaw = beforeRaw,
				afterRaw = afterRaw,
			}
		end
	end
	return changes
end

function buildBattleStateBattlerObject(snap, prevSnap)
	local battler = tonumber(snap and snap.battler) or 0
	local partyIndex = tonumber(snap and snap.partyIndex)
	if partyIndex ~= nil then
		partyIndex = math.floor(partyIndex)
	end
	local sideText = ((snap and snap.side) == 1) and "enemy" or "player"
	local battleMonAddr = NULL_BATTLE.addresses.gBattleMons + battler * NULL_BATTLE.struct.battleMonSize
	local moves = {}
	local movePps = {}
	for i = 1, 4 do
		local moveId = tonumber(snap and snap.moves and snap.moves[i]) or 0
		moveId = math.floor(moveId)
		if moveId < 0 then
			moveId = 0
		end
		moves[i] = getMoveNameById(moveId)
		movePps[i] = tonumber(snap and snap.pp and snap.pp[i]) or 0
	end

	local out = {
		battler = battler,
		side = sideText,
		activePartySlot = (partyIndex ~= nil and partyIndex >= 0) and (partyIndex + 1) or 0,
		battleMonAddr = battleMonAddr,
		partyMonAddr = JSON_NULL,
		pid = JSON_NULL,
		species = getSpeciesNameForBattleState(snap and snap.species),
		currentHp = tonumber(snap and snap.hp) or 0,
		moves = moves,
		ability = JSON_NULL,
		nature = JSON_NULL,
		heldItem = JSON_NULL,
		status = JSON_NULL,
		statusRaw = JSON_NULL,
		movePPs = movePps,
		statStages = buildBattleStateStatStages(snap),
		statStageChanges = buildBattleStateStatStageChanges(prevSnap, snap),
		rawBattleStats = {
			attack = JSON_NULL,
			defense = JSON_NULL,
			speed = JSON_NULL,
			spAttack = JSON_NULL,
			spDefense = JSON_NULL,
		},
	}

	if sideText ~= "player" then
		return out
	end

	local partyMon, partyMonAddr = readPlayerPartyMonByPartyIndex(partyIndex)
	if not partyMon then
		return out
	end
	out.partyMonAddr = jsonOrNull(partyMonAddr)
	out.pid = jsonOrNull(tonumber(partyMon.personality))
	out.heldItem = jsonOrNull(getHeldItemNameForBattleState(partyMon.heldItem))

	local okAbility, abilityName = pcall(getAbility, partyMon)
	if okAbility and type(abilityName) == "string" and abilityName ~= "" then
		out.ability = abilityName
	end

	local okNature, natureName = pcall(getNature, partyMon)
	if okNature and type(natureName) == "string" and natureName ~= "" then
		out.nature = natureName
	end

	local statusRaw = tonumber(partyMon.status)
	if statusRaw ~= nil then
		statusRaw = math.floor(statusRaw) & 0xFFFFFFFF
	end
	out.statusRaw = jsonOrNull(statusRaw)
	out.status = jsonOrNull(decodeStatusNameFromRaw(statusRaw))

	out.rawBattleStats = {
		attack = jsonOrNull(tonumber(partyMon.attack)),
		defense = jsonOrNull(tonumber(partyMon.defense)),
		speed = jsonOrNull(tonumber(partyMon.speed)),
		spAttack = jsonOrNull(tonumber(partyMon.spAttack)),
		spDefense = jsonOrNull(tonumber(partyMon.spDefense)),
	}
	return out
end

function buildBattleStatePayload()
	local trainerId, secretId = resolveCurrentTrainerIdsForHttp()
	local payload = {
		trainerId = jsonOrNull(trainerId),
		secretId = jsonOrNull(secretId),
		playerActive = {},
		trainerActive = {},
	}
	local baselineSnapshots = type(nullBattleState.prevSnapshots) == "table" and nullBattleState.prevSnapshots or nil
	local runtime = gatherBattleRuntime()
	if runtime == nil and nullBattleState.sessionActive and baselineSnapshots ~= nil then
		local trackedCount = 0
		for b = 0, 3 do
			if type(baselineSnapshots[b]) == "table" then
				trackedCount = trackedCount + 1
			end
		end
		if trackedCount > 0 then
			runtime = {
				battlersCount = 4,
				snapshots = baselineSnapshots,
			}
		end
	end
	if not runtime or type(runtime.snapshots) ~= "table" then
		return payload
	end
	for b = 0, runtime.battlersCount - 1 do
		local snap = runtime.snapshots[b]
		local speciesId = tonumber(snap and snap.species) or 0
		if speciesId > 0 then
			local prevSnap = baselineSnapshots and baselineSnapshots[b] or nil
			local monData = buildBattleStateBattlerObject(snap, prevSnap)
			if snap.side == 1 then
				payload.trainerActive[#payload.trainerActive + 1] = monData
			else
				payload.playerActive[#payload.playerActive + 1] = monData
			end
		end
	end
	return payload
end
-- <<< END 05_battle_state_payload.lua

-- >>> BEGIN 06_box_create_edit.lua
-- Module Index: 06_box_create_edit
-- Owns: box slot create/edit decode/encode logic and encrypted write helpers.

local function getCreateBoxDefaults(speciesName, level)
	local defaults = {
		language = BOX_CREATE.defaultLanguage,
		otName = "TRAINER",
		nickname = speciesName or "Pokemon",
		pokeball = BOX_CREATE.defaultPokeball,
		metGame = BOX_CREATE.defaultMetGame,
		metLocation = BOX_CREATE.defaultMetLocation,
		otGender = BOX_CREATE.defaultOtGender,
		metLevel = level or BOX_CREATE.defaultLevel,
	}
	local party = getParty() or {}
	for i = 1, #party do
		local mon = party[i]
		if mon and mon.species and mon.species > 0 then
			if mon.language ~= nil then
				defaults.language = mon.language & 0xFF
			end
			if type(mon.otName) == "string" and mon.otName ~= "" then
				defaults.otName = mon.otName
			end
			if mon.pokeball ~= nil then
				defaults.pokeball = mon.pokeball & 0x1F
			end
			if mon.metGame ~= nil then
				defaults.metGame = mon.metGame & 0xF
			end
			if mon.metLocation ~= nil then
				defaults.metLocation = mon.metLocation & 0xFF
			end
			if mon.otGender ~= nil then
				defaults.otGender = mon.otGender & 0x1
			end
			break
		end
	end
	return defaults
end

local function computeBoxSecureChecksum(logicalBlocks)
	local sum = 0
	for i = 1, 4 do
		local block = logicalBlocks[i]
		for j = 1, 3 do
			local w = (block[j] or 0) & 0xFFFFFFFF
			sum = (sum + (w & 0xFFFF) + ((w >> 16) & 0xFFFF)) & 0xFFFF
		end
	end
	return sum
end

local function writeEncryptedBoxSubstructs(slotAddr, personality, otId, logicalBlocks)
	local selector = BOX_SUBSTRUCT_SELECTOR[personality % 24]
	if selector == nil then
		return false, "substruct selector unavailable"
	end
	local key = (personality ~ otId) & 0xFFFFFFFF
	for logicalIndex = 1, 4 do
		local physicalIndex = selector[logicalIndex]
		local base = slotAddr + BOX_CREATE.secureOffset + physicalIndex * BOX_CREATE.substructSize
		local words = logicalBlocks[logicalIndex]
		for w = 1, 3 do
			local encrypted = ((words[w] or 0) ~ key) & 0xFFFFFFFF
			writeU32LE(base + (w - 1) * 4, encrypted)
		end
	end
	return true, nil
end

local function getMoveDisplayNameForCreate(moveId)
	if moveId == nil or moveId <= 0 then
		return "None"
	end
	local name = move[moveId + 1]
	if type(name) == "string" and name ~= "" then
		return name
	end
	return tostring(moveId)
end

local function getItemDisplayNameForCreate(itemId)
	if itemId == nil or itemId == 0 then
		return "None"
	end
	local name = item[itemId]
	if type(name) == "string" and name ~= "" then
		return name
	end
	return tostring(itemId)
end

local function extractMovesFromAttackWords(attacks0, attacks1)
	return {
		attacks0 & 0xFFFF,
		(attacks0 >> 16) & 0xFFFF,
		attacks1 & 0xFFFF,
		(attacks1 >> 16) & 0xFFFF,
	}
end

local function extractPpsFromAttackWord(attacks2)
	return {
		attacks2 & 0xFF,
		(attacks2 >> 8) & 0xFF,
		(attacks2 >> 16) & 0xFF,
		(attacks2 >> 24) & 0xFF,
	}
end

local function packMoveWords(moves)
	return (
		((moves[1] or 0) & 0xFFFF)
		| (((moves[2] or 0) & 0xFFFF) << 16)
	) & 0xFFFFFFFF, (
		((moves[3] or 0) & 0xFFFF)
		| (((moves[4] or 0) & 0xFFFF) << 16)
	) & 0xFFFFFFFF
end

local function packPpWord(pps)
	return (
		((pps[1] or 0) & 0xFF)
		| (((pps[2] or 0) & 0xFF) << 8)
		| (((pps[3] or 0) & 0xFF) << 16)
		| (((pps[4] or 0) & 0xFF) << 24)
	) & 0xFFFFFFFF
end

local function extractIvsFromMiscWord(misc1)
	return {
		hp = (misc1 >> 0) & 0x1F,
		atk = (misc1 >> 5) & 0x1F,
		def = (misc1 >> 10) & 0x1F,
		spe = (misc1 >> 15) & 0x1F,
		spa = (misc1 >> 20) & 0x1F,
		spd = (misc1 >> 25) & 0x1F,
	}
end

local function packIvsPreserveUpper(misc1, ivs)
	local encoded = (
		((ivs.hp or BOX_CREATE.defaultIv) & 0x1F)
		| (((ivs.atk or BOX_CREATE.defaultIv) & 0x1F) << 5)
		| (((ivs.def or BOX_CREATE.defaultIv) & 0x1F) << 10)
		| (((ivs.spe or BOX_CREATE.defaultIv) & 0x1F) << 15)
		| (((ivs.spa or BOX_CREATE.defaultIv) & 0x1F) << 20)
		| (((ivs.spd or BOX_CREATE.defaultIv) & 0x1F) << 25)
	) & 0x3FFFFFFF
	return ((misc1 & 0xC0000000) | encoded) & 0xFFFFFFFF
end

local function decodeBoxSlotForEdit(slot)
	local slotAddr = storageLoc + 4 + (slot - 1) * BOX_CREATE.slotStride
	local personality = readU32LE(slotAddr + 0)
	local otId = readU32LE(slotAddr + 4)
	local flags = emu:read8(slotAddr + BOX_CREATE.flagsOffset)
	local storedChecksum = readU16LE(slotAddr + BOX_CREATE.checksumOffset)
	if personality == nil or otId == nil or flags == nil then
		return nil, "slot header unreadable"
	end
	if ((flags >> 1) & 0x1) ~= 1 then
		return nil, "slot is empty (hasSpecies=0)"
	end

	local selector = BOX_SUBSTRUCT_SELECTOR[personality % 24]
	if selector == nil then
		return nil, "substruct selector unavailable"
	end
	local key = (personality ~ otId) & 0xFFFFFFFF
	local blocks = {}
	for logicalIndex = 1, 4 do
		local physicalIndex = selector[logicalIndex]
		local base = slotAddr + BOX_CREATE.secureOffset + physicalIndex * BOX_CREATE.substructSize
		local ew0 = readU32LE(base + 0)
		local ew1 = readU32LE(base + 4)
		local ew2 = readU32LE(base + 8)
		if ew0 == nil or ew1 == nil or ew2 == nil then
			return nil, "slot secure data unreadable"
		end
		blocks[logicalIndex] = {
			(ew0 ~ key) & 0xFFFFFFFF,
			(ew1 ~ key) & 0xFFFFFFFF,
			(ew2 ~ key) & 0xFFFFFFFF,
		}
	end
	local species = blocks[1][1] & 0xFFFF
	if species == 0 then
		return nil, "slot species is 0 (empty)"
	end
	local computedChecksum = computeBoxSecureChecksum(blocks)
	if storedChecksum == nil or storedChecksum ~= computedChecksum then
		return nil, string.format(
			"slot checksum mismatch (stored=0x%04X computed=0x%04X)",
			tonumber(storedChecksum) or 0,
			tonumber(computedChecksum) or 0
		)
	end
	return {
		slotAddr = slotAddr,
		personality = personality,
		otId = otId,
		flags = flags,
		storedChecksum = storedChecksum,
		logicalBlocks = blocks,
	}, nil
end

function createPokemonInBoxSlot(slotIndex, speciesIdOrName, opts)
	local slot, slotErr = parseBoxSlotSelector(slotIndex)
	if slot == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(slotErr))
		return false
	end

	local species, speciesName, speciesErr = resolveSpeciesForCreate(speciesIdOrName)
	if species == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(speciesErr))
		return false
	end

	if opts ~= nil and type(opts) ~= "table" then
		logNullBattle("BOX_CREATE failed: opts must be a table when provided")
		return false
	end
	local options = opts or {}

	local level, levelErr = parseIntegerInRange(
		options.level ~= nil and options.level or BOX_CREATE.defaultLevel,
		1,
		100,
		"level"
	)
	if level == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(levelErr))
		return false
	end

	local abilitySlot, abilityErr = parseIntegerInRange(
		options.abilitySlot ~= nil and options.abilitySlot or 1,
		1,
		3,
		"abilitySlot"
	)
	if abilitySlot == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(abilityErr))
		return false
	end

	local moves, movesErr = resolveCreateMoves(options.moves)
	if moves == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(movesErr))
		return false
	end

	local heldItem, itemErr = resolveHeldItemForCreate(options.heldItem)
	if heldItem == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(itemErr))
		return false
	end

	local hiddenNature, natureText, natureErr = resolveNatureForCreate(options.nature)
	if hiddenNature == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(natureErr))
		return false
	end

	local ivs, ivsErr = resolveIvsForCreate(options.ivs)
	if ivs == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(ivsErr))
		return false
	end

	local otId, trainerId, secretId, otErr = resolveCurrentPlayerOtId()
	if otId == nil then
		logNullBattle("BOX_CREATE failed: " .. tostring(otErr))
		return false
	end

	local exp = expRequired(species, level)
	if type(exp) ~= "number" or exp < 0 then
		logNullBattle(string.format("BOX_CREATE failed: could not compute exp for species=%d level=%d", species, level))
		return false
	end
	exp = math.floor(exp) & 0xFFFFFFFF

	local defaults = getCreateBoxDefaults(speciesName, level)
	local personality = randomU32()
	local altAbility = (abilitySlot - 1) & 0x3
	local pp1 = (moves[1] > 0) and BOX_CREATE.defaultPp or 0
	local pp2 = (moves[2] > 0) and BOX_CREATE.defaultPp or 0
	local pp3 = (moves[3] > 0) and BOX_CREATE.defaultPp or 0
	local pp4 = (moves[4] > 0) and BOX_CREATE.defaultPp or 0

	local growth0 = ((species & 0xFFFF) | ((heldItem & 0xFFFF) << 16)) & 0xFFFFFFFF
	local growth1 = exp
	local growth2 =
		((0 & 0xFF)
		| ((BOX_CREATE.defaultFriendship & 0xFF) << 8)
		| ((defaults.pokeball & 0x1F) << 16)
		| ((hiddenNature & 0x1F) << 21)) & 0xFFFFFFFF

	local attacks0 = ((moves[1] & 0xFFFF) | ((moves[2] & 0xFFFF) << 16)) & 0xFFFFFFFF
	local attacks1 = ((moves[3] & 0xFFFF) | ((moves[4] & 0xFFFF) << 16)) & 0xFFFFFFFF
	local attacks2 = ((pp1 & 0xFF) | ((pp2 & 0xFF) << 8) | ((pp3 & 0xFF) << 16) | ((pp4 & 0xFF) << 24)) & 0xFFFFFFFF

	local ivFlags = (
		((ivs.hp & 0x1F) << 0)
		| ((ivs.atk & 0x1F) << 5)
		| ((ivs.def & 0x1F) << 10)
		| ((ivs.spe & 0x1F) << 15)
		| ((ivs.spa & 0x1F) << 20)
		| ((ivs.spd & 0x1F) << 25)
	) & 0xFFFFFFFF
	local metFlags = (
		((defaults.metLevel or level) & 0x7F)
		| ((defaults.metGame & 0xF) << 7)
		| ((defaults.pokeball & 0xF) << 11)
		| ((defaults.otGender & 0x1) << 15)
	) & 0xFFFF
	local misc0 = ((0 & 0xFF) | ((defaults.metLocation & 0xFF) << 8) | (metFlags << 16)) & 0xFFFFFFFF
	local misc1 = ivFlags
	local misc2 = ((altAbility & 0x3) << 29) & 0xFFFFFFFF

	local logicalBlocks = {
		{ growth0, growth1, growth2 },
		{ attacks0, attacks1, attacks2 },
		{ 0, 0, 0 },
		{ misc0, misc1, misc2 },
	}
	local checksum = computeBoxSecureChecksum(logicalBlocks)
	local slotAddr = storageLoc + 4 + (slot - 1) * BOX_CREATE.slotStride

	for i = 0, BOX_CREATE.slotStride - 1 do
		emu:write8(slotAddr + i, 0)
	end

	writeU32LE(slotAddr + 0, personality)
	writeU32LE(slotAddr + 4, otId)
	writeByteArray(slotAddr + 8, encodeGameText(defaults.nickname, monNameLength))
	emu:write8(slotAddr + 18, defaults.language & 0xFF)
	emu:write8(slotAddr + BOX_CREATE.flagsOffset, 0x02) -- hasSpecies=1, isEgg=0, isBadEgg=0
	local otNameLen = BOX_CREATE.markingsOffset - BOX_CREATE.otNameOffset
	if otNameLen < 1 then
		otNameLen = playerNameLength
	end
	writeByteArray(slotAddr + BOX_CREATE.otNameOffset, encodeGameText(defaults.otName, otNameLen))
	emu:write8(slotAddr + BOX_CREATE.markingsOffset, 0)
	writeU16LE(slotAddr + BOX_CREATE.checksumOffset, checksum)
	writeU32LE(slotAddr + BOX_CREATE.boxUnknownOffset, 0)

	local ok, writeErr = writeEncryptedBoxSubstructs(slotAddr, personality, otId, logicalBlocks)
	if not ok then
		logNullBattle("BOX_CREATE failed: " .. tostring(writeErr))
		return false
	end
	local verifyCreate, verifyCreateErr = decodeBoxSlotForEdit(slot)
	if not verifyCreate then
		logNullBattle("BOX_CREATE failed: post-write validation failed: " .. tostring(verifyCreateErr))
		return false
	end

	logNullBattle(string.format(
		"BOX_CREATE ok slot=%d species=%s(%d) level=%d moves=[%s,%s,%s,%s] abilitySlot=%d nature=%s heldItem=%s(%d) ivs=%d/%d/%d/%d/%d/%d ot=%d:%d",
		slot,
		speciesName,
		species,
		level,
		getMoveDisplayNameForCreate(moves[1]),
		getMoveDisplayNameForCreate(moves[2]),
		getMoveDisplayNameForCreate(moves[3]),
		getMoveDisplayNameForCreate(moves[4]),
		abilitySlot,
		tostring(natureText),
		getItemDisplayNameForCreate(heldItem),
		heldItem,
		ivs.hp,
		ivs.atk,
		ivs.def,
		ivs.spa,
		ivs.spd,
		ivs.spe,
		trainerId,
		secretId
	))
	return true
end

function editPokemonInBoxSlot(slotIndex, opts)
	local slot, slotErr = parseBoxSlotSelector(slotIndex)
	if slot == nil then
		logNullBattle("BOX_EDIT failed: " .. tostring(slotErr))
		return false
	end
	if type(opts) ~= "table" then
		logNullBattle("BOX_EDIT failed: opts must be a table")
		return false
	end
	if rawget(opts, "pid") ~= nil or rawget(opts, "personality") ~= nil then
		logNullBattle("BOX_EDIT failed: PID/personality edits are not supported")
		return false
	end

	local allowedKeys = {
		species = true,
		moves = true,
		abilitySlot = true,
		nature = true,
		level = true,
		heldItem = true,
		ivs = true,
	}
	for k, _ in pairs(opts) do
		if not allowedKeys[k] then
			logNullBattle("BOX_EDIT failed: unknown opts key: " .. tostring(k))
			return false
		end
	end

	local decoded, decodeErr = decodeBoxSlotForEdit(slot)
	if not decoded then
		logNullBattle("BOX_EDIT failed: " .. tostring(decodeErr))
		return false
	end

	local blocks = decoded.logicalBlocks
	local growth = blocks[1]
	local attacks = blocks[2]
	local misc = blocks[4]

	local changed = {}
	local hasChanges = false
	local function markChanged(label)
		hasChanges = true
		changed[#changed + 1] = label
	end

	local finalSpecies = growth[1] & 0xFFFF
	local finalSpeciesName = (mons and mons[finalSpecies]) or tostring(finalSpecies)

	if rawget(opts, "species") ~= nil then
		local newSpecies, newSpeciesName, speciesErr = resolveSpeciesForEdit(opts.species)
		if newSpecies == nil then
			logNullBattle("BOX_EDIT failed: " .. tostring(speciesErr))
			return false
		end
		growth[1] = ((growth[1] & 0xFFFF0000) | (newSpecies & 0xFFFF)) & 0xFFFFFFFF
		finalSpecies = newSpecies
		finalSpeciesName = newSpeciesName
		markChanged("species")
	end

	if rawget(opts, "heldItem") ~= nil then
		local heldItem, itemErr = resolveHeldItemForEdit(opts.heldItem)
		if heldItem == nil then
			logNullBattle("BOX_EDIT failed: " .. tostring(itemErr))
			return false
		end
		growth[1] = ((growth[1] & 0xFFFF) | ((heldItem & 0xFFFF) << 16)) & 0xFFFFFFFF
		markChanged("heldItem")
	end

	if rawget(opts, "nature") ~= nil then
		local hiddenNature, _natureText, natureErr = resolveNatureForEdit(opts.nature)
		if hiddenNature == nil then
			logNullBattle("BOX_EDIT failed: " .. tostring(natureErr))
			return false
		end
		growth[3] = ((growth[3] & (~(0x1F << 21) & 0xFFFFFFFF)) | ((hiddenNature & 0x1F) << 21)) & 0xFFFFFFFF
		markChanged("nature")
	end

	if rawget(opts, "abilitySlot") ~= nil then
		local abilitySlot
		if isBoxNullSentinel(opts.abilitySlot) then
			abilitySlot = 1
		else
			local abilityErr
			abilitySlot, abilityErr = parseIntegerInRange(opts.abilitySlot, 1, 3, "abilitySlot")
			if abilitySlot == nil then
				logNullBattle("BOX_EDIT failed: " .. tostring(abilityErr))
				return false
			end
		end
		misc[3] = ((misc[3] & (~(0x3 << 29) & 0xFFFFFFFF)) | (((abilitySlot - 1) & 0x3) << 29)) & 0xFFFFFFFF
		markChanged("abilitySlot")
	end

	if rawget(opts, "ivs") ~= nil then
		local ivPatch, ivErr = resolveIvsPatchForEdit(opts.ivs)
		if ivPatch == nil then
			logNullBattle("BOX_EDIT failed: " .. tostring(ivErr))
			return false
		end
		local currIvs = extractIvsFromMiscWord(misc[2])
		for k, v in pairs(ivPatch) do
			currIvs[k] = v
		end
		misc[2] = packIvsPreserveUpper(misc[2], currIvs)
		markChanged("ivs")
	end

	if rawget(opts, "moves") ~= nil then
		local movesPatch, moveErr = resolveMovesPatchForEdit(opts.moves)
		if movesPatch == nil then
			logNullBattle("BOX_EDIT failed: " .. tostring(moveErr))
			return false
		end
		local currMoves = extractMovesFromAttackWords(attacks[1], attacks[2])
		local currPps = extractPpsFromAttackWord(attacks[3])
		if movesPatch.clearAll then
			for i = 1, 4 do
				currMoves[i] = 0
				currPps[i] = 0
			end
		else
			for i, moveId in pairs(movesPatch.patch) do
				currMoves[i] = moveId
				if moveId == 0 then
					currPps[i] = 0
				else
					currPps[i] = BOX_CREATE.defaultPp
				end
			end
		end
		attacks[1], attacks[2] = packMoveWords(currMoves)
		attacks[3] = packPpWord(currPps)
		markChanged("moves")
	end

	if rawget(opts, "level") ~= nil then
		local newLevel
		if isBoxNullSentinel(opts.level) then
			newLevel = BOX_CREATE.defaultLevel
		else
			local levelErr
			newLevel, levelErr = parseIntegerInRange(opts.level, 1, 100, "level")
			if newLevel == nil then
				logNullBattle("BOX_EDIT failed: " .. tostring(levelErr))
				return false
			end
		end
		local newExp = expRequired(finalSpecies, newLevel)
		if type(newExp) ~= "number" or newExp < 0 then
			logNullBattle(string.format("BOX_EDIT failed: could not compute exp for species=%d level=%d", finalSpecies, newLevel))
			return false
		end
		growth[2] = math.floor(newExp) & 0xFFFFFFFF
		markChanged("level")
	end

	if not hasChanges then
		logNullBattle("BOX_EDIT failed: no editable fields provided")
		return false
	end

	local checksum = computeBoxSecureChecksum(blocks)
	writeU16LE(decoded.slotAddr + BOX_CREATE.checksumOffset, checksum)
	local ok, writeErr = writeEncryptedBoxSubstructs(decoded.slotAddr, decoded.personality, decoded.otId, blocks)
	if not ok then
		logNullBattle("BOX_EDIT failed: " .. tostring(writeErr))
		return false
	end
	local verifyEdit, verifyEditErr = decodeBoxSlotForEdit(slot)
	if not verifyEdit then
		logNullBattle("BOX_EDIT failed: post-write validation failed: " .. tostring(verifyEditErr))
		return false
	end

	local finalSpeciesId = growth[1] & 0xFFFF
	local finalExp = growth[2]
	local finalLevel = calcLevel(finalExp, finalSpeciesId)
	local finalHeldItem = (growth[1] >> 16) & 0xFFFF
	local finalNatureId = (growth[3] >> 21) & 0x1F
	local finalNatureText = (finalNatureId == 26) and "PID" or (nature[finalNatureId + 1] or tostring(finalNatureId))
	local finalAbilitySlot = ((misc[3] >> 29) & 0x3) + 1
	local finalIvs = extractIvsFromMiscWord(misc[2])
	local finalMoves = extractMovesFromAttackWords(attacks[1], attacks[2])

	logNullBattle(string.format(
		"BOX_EDIT ok slot=%d changed=[%s] species=%s(%d) level=%d moves=[%s,%s,%s,%s] abilitySlot=%d nature=%s heldItem=%s(%d) ivs=%d/%d/%d/%d/%d/%d pidPreserved=yes",
		slot,
		table.concat(changed, ","),
		tostring((mons and mons[finalSpeciesId]) or finalSpeciesId),
		finalSpeciesId,
		finalLevel,
		getMoveDisplayNameForCreate(finalMoves[1]),
		getMoveDisplayNameForCreate(finalMoves[2]),
		getMoveDisplayNameForCreate(finalMoves[3]),
		getMoveDisplayNameForCreate(finalMoves[4]),
		finalAbilitySlot,
		tostring(finalNatureText),
		getItemDisplayNameForCreate(finalHeldItem),
		finalHeldItem,
		finalIvs.hp,
		finalIvs.atk,
		finalIvs.def,
		finalIvs.spa,
		finalIvs.spd,
		finalIvs.spe
	))
	return true
end

formatMoveOverrideList = function(moves)
	local out = {}
	for i = 1, 4 do
		local moveId = tonumber(moves and moves[i]) or 0
		if moveId < 0 then
			moveId = 0
		end
		moveId = math.floor(moveId)
		out[#out + 1] = string.format("%d:%s(%d)", i, getMoveNameById(moveId), moveId)
	end
	return table.concat(out, " | ")
end

formatPendingTrainerOverride = function(pending)
	if type(pending) ~= "table" then
		return "override=none"
	end
	local parts = {}
	if type(pending.moves) == "table" then
		parts[#parts + 1] = "moves=[" .. formatMoveOverrideList(pending.moves) .. "]"
	end
	if pending.hp ~= nil then
		if pending.maxHp ~= nil then
			parts[#parts + 1] = string.format("hp=%d/%d", tonumber(pending.hp) or 0, tonumber(pending.maxHp) or 0)
		else
			parts[#parts + 1] = string.format("hp=%d", tonumber(pending.hp) or 0)
		end
	end
	if #parts == 0 then
		return "override=none"
	end
	return table.concat(parts, " ")
end
-- <<< END 06_box_create_edit.lua

-- >>> BEGIN 07_trainer_override_session.lua
-- Module Index: 07_trainer_override_session
-- Owns: next-trainer overrides, session lifecycle logging, and battle event emission.

local function buildPendingMoveOverrideFromArgs(...)
	local args = { ... }
	if #args == 1 and type(args[1]) == "table" then
		args = args[1]
	end

	local moves = {}
	local hasAny = false
	for i = 1, 4 do
		local moveId, err = parseMoveOverrideEntry(args[i], i)
		if moveId == nil then
			return nil, err
		end
		moves[i] = moveId
		if moveId > 0 then
			hasAny = true
		end
	end
	if not hasAny then
		return nil, "at least one move must be non-zero"
	end

	return moves, nil
end

local function parseOverrideHpValue(raw, label, minValue)
	local n = tonumber(raw)
	if n == nil then
		return nil, string.format("%s must be a number", label)
	end
	n = math.floor(n)
	if n < minValue or n > 0xFFFF then
		return nil, string.format("%s out of range (%d..65535): %s", label, minValue, tostring(raw))
	end
	return n, nil
end

local function buildPendingHpOverrideFromArgs(hpValue, maxHpValue)
	local hp, hpErr = parseOverrideHpValue(hpValue, "hp", 0)
	if hp == nil then
		return nil, nil, hpErr
	end
	local maxHp = nil
	if maxHpValue ~= nil then
		local maxErr
		maxHp, maxErr = parseOverrideHpValue(maxHpValue, "maxHp", 1)
		if maxHp == nil then
			return nil, nil, maxErr
		end
		if hp > maxHp then
			return nil, nil, "hp cannot be greater than maxHp"
		end
	end
	return hp, maxHp, nil
end

local function ensurePendingTrainerOverride()
	local pending = nextTrainerMovesetState.pending
	if type(pending) ~= "table" then
		pending = {}
		nextTrainerMovesetState.pending = pending
	end
	return pending
end

local function maybeClearPendingTrainerOverrideWhenEmpty()
	local pending = nextTrainerMovesetState.pending
	if type(pending) ~= "table" then
		nextTrainerMovesetState.pending = nil
		return
	end
	if pending.moves == nil and pending.hp == nil and pending.maxHp == nil then
		nextTrainerMovesetState.pending = nil
	end
end

local function stampPendingTrainerOverride(pending)
	pending.armedAt = os.date("%Y-%m-%dT%H:%M:%S")
	pending.armedFrame = nullBattleState.frame
end

function setNextTrainerMoveset(...)
	local moves, err = buildPendingMoveOverrideFromArgs(...)
	if not moves then
		logNullBattle("TRAINER_OVERRIDE set moves failed: " .. tostring(err))
		return false
	end
	local pending = ensurePendingTrainerOverride()
	pending.moves = moves
	stampPendingTrainerOverride(pending)
	logNullBattle("TRAINER_OVERRIDE armed for next trainer enemy: " .. formatPendingTrainerOverride(pending))
	return true
end

function setNextTrainerPokemonHp(hpValue, maxHpValue)
	local hp, maxHp, err = buildPendingHpOverrideFromArgs(hpValue, maxHpValue)
	if hp == nil then
		logNullBattle("TRAINER_OVERRIDE set hp failed: " .. tostring(err))
		return false
	end
	local pending = ensurePendingTrainerOverride()
	pending.hp = hp
	pending.maxHp = maxHp
	stampPendingTrainerOverride(pending)
	logNullBattle("TRAINER_OVERRIDE armed for next trainer enemy: " .. formatPendingTrainerOverride(pending))
	return true
end

function setNextTrainerHp(hpValue, maxHpValue)
	return setNextTrainerPokemonHp(hpValue, maxHpValue)
end

function setNextTrainerCurrentHp(hpValue)
	return setNextTrainerPokemonHp(hpValue, nil)
end

function clearNextTrainerMovesetOverride()
	nextTrainerMovesetState.pending = nil
	logNullBattle("TRAINER_OVERRIDE cleared.")
	return true
end

function clearNextTrainerPokemonHpOverride()
	local pending = nextTrainerMovesetState.pending
	if type(pending) == "table" then
		pending.hp = nil
		pending.maxHp = nil
		maybeClearPendingTrainerOverrideWhenEmpty()
	end
	logNullBattle("TRAINER_OVERRIDE hp override cleared.")
	return true
end

function showNextTrainerMovesetOverride()
	local pending = nextTrainerMovesetState.pending
	if not pending then
		logNullBattle("TRAINER_OVERRIDE pending: none")
		return nil
	end
	logNullBattle(string.format(
		"TRAINER_OVERRIDE pending armedAt=%s frame=%s %s",
		tostring(pending.armedAt or "n/a"),
		tostring(pending.armedFrame or "n/a"),
		formatPendingTrainerOverride(pending)
	))
	return pending
end

local function armHardcodedNextTrainerMovesetIfConfigured()
	if type(NEXT_TRAINER_MOVESET_HARDCODE) ~= "table" then
		return
	end
	if nextTrainerMovesetState.pending ~= nil then
		return
	end
	local ok = setNextTrainerMoveset(NEXT_TRAINER_MOVESET_HARDCODE)
	if ok then
		logNullBattle("TRAINER_OVERRIDE hardcoded preset armed.")
	else
		logNullBattle("TRAINER_OVERRIDE hardcoded preset invalid; ignored.")
	end
end

local function emitSessionStart(rt, initialEnemyTrainerKey)
	local ctx = ensureExportContext()
	local sig = makeSessionSignature(rt)
	nullBattleState.sessionSignature = sig
	nullBattleState.sessionTrainerDisplayId = nextSyntheticSessionTrainerId()
	nullBattleState.sessionActive = true
	nullBattleState.inactiveFrames = 0
	nullBattleState.pendingBoundary = false
	nullBattleState.pendingBoundaryFrames = 0
	nullBattleState.sessionOwnerTrainerKey = initialEnemyTrainerKey
	nullBattleState.lastSeenEnemyTrainerKey = initialEnemyTrainerKey
	nullBattleState.sessionFirstEnemySpecies = nil
	nullBattleState.sessionFirstEnemyLevel = nil
	nullBattleState.actionIndex = 0
	nullBattleState.prevSnapshots = {}
	nullBattleState.koHistory = {}
	nullBattleState.fullEvents = {}

	logNullBattle(string.format(
		"SESSION_START actionIndex=0 battlers=%d enemyPartyCount=%s signature=%s",
		rt.battlersCount,
		tostring(rt.enemyPartyCount),
		sig
	))
	logNullBattle(string.format(
		"BATTLE_START attempt=%s trainerKey=%s syntheticTrainerId=%s",
		tostring(ctx and ctx.attempt or "n/a"),
		tostring(ctx and ctx.trainerKey or "n/a"),
		tostring(nullBattleState.sessionTrainerDisplayId or "n/a")
	))

	local partyStartSlots = getPartyStartSlotsForSession()
	logNullBattle(string.format(
		"PARTY_START slots=%d",
		#partyStartSlots
	))
	for i = 1, #partyStartSlots do
		local s = partyStartSlots[i]
		logNullBattle(string.format(
			"PARTY_START_SLOT slot=%s hasSpecies=%s species=%s level=%s hp=%s maxHP=%s",
			tostring(s.slot),
			tostring(s.hasSpecies),
			tostring(s.species),
			tostring(s.level),
			tostring(s.hp),
			tostring(s.maxHP)
		))
	end

	appendBattleLogEvent({
		type = "session_start",
		trainerId = nullBattleState.sessionTrainerDisplayId,
		pParty = buildPartySnapshotForBattleLog(),
	})
	if NULL_BATTLE.writeFullBattleLog then
		appendFullBattleEvent({
			type = "session_start",
			actionIndex = 0,
			signature = sig,
			syntheticTrainerId = nullBattleState.sessionTrainerDisplayId,
			battlers = rt.battlersCount,
			enemyPartyCount = rt.enemyPartyCount,
			ownerTrainerKey = nullBattleState.sessionOwnerTrainerKey,
			partyStart = partyStartSlots,
		})
	end

	for b = 0, rt.battlersCount - 1 do
		local snap = rt.snapshots[b]
		nullBattleState.prevSnapshots[b] = snap
		if snap.side == 1 and nullBattleState.sessionFirstEnemySpecies == nil then
			nullBattleState.sessionFirstEnemySpecies = snap.species
			nullBattleState.sessionFirstEnemyLevel = snap.level
		end
		logNullBattle(string.format(
			"SESSION_ACTIVE_HP actionIndex=0 battler=%d side=%d species=%s hp=%d maxHP=%d level=%d",
			b,
			snap.side,
			tostring(snap.species),
			snap.hp,
			snap.maxHP,
			snap.level
		))
		if NULL_BATTLE.writeFullBattleLog then
			appendFullBattleEvent({
				type = "session_active_hp",
				actionIndex = 0,
				battler = b,
				side = snap.side,
				species = snap.species,
				hp = snap.hp,
				maxHP = snap.maxHP,
				level = snap.level,
			})
		end
	end
end

local function emitSessionEnd()
	if not nullBattleState.sessionActive then
		return
	end
	logNullBattle(string.format(
		"SESSION_END actionIndex=%d signature=%s",
		nullBattleState.actionIndex,
		tostring(nullBattleState.sessionSignature)
	))
	appendBattleLogEvent({
		type = "session_end",
	})
	if NULL_BATTLE.writeFullBattleLog then
		appendFullBattleEvent({
			type = "session_end",
			actionIndex = nullBattleState.actionIndex,
			signature = nullBattleState.sessionSignature,
			koList = formatKoHistory(nullBattleState.koHistory),
		})
		writeSessionFullBattleLog()
	end
	writeCurrentAttemptMaster(true)
	logNullBattle(string.format(
		"BATTLE_END actionIndex=%d koList=[%s]",
		nullBattleState.actionIndex,
		formatKoHistory(nullBattleState.koHistory)
	))

	nullBattleState.sessionActive = false
	nullBattleState.sessionSignature = nil
	nullBattleState.sessionTrainerDisplayId = nil
	nullBattleState.sessionFirstEnemySpecies = nil
	nullBattleState.sessionFirstEnemyLevel = nil
	nullBattleState.prevSnapshots = {}
	nullBattleState.koHistory = {}
	nullBattleState.fullEvents = {}
	nullBattleState.actionIndex = 0
	nullBattleState.inactiveFrames = 0
	nullBattleState.pendingBoundary = false
	nullBattleState.pendingBoundaryFrames = 0
	nullBattleState.sessionOwnerTrainerKey = nil
	nullBattleState.lastSeenEnemyTrainerKey = nil
end

local function startBoundary(reason)
	if nullBattleState.pendingBoundary then
		return
	end
	nullBattleState.pendingBoundary = true
	nullBattleState.pendingBoundaryFrames = 0
	-- Runtime decode frequently drops during battle animations; avoid log spam.
	if reason == "runtime_unresolved" then
		return
	end
	logNullBattle(string.format(
		"BOUNDARY_PENDING reason=%s ownerTrainerKey=%s lastSeenEnemyTrainerKey=%s",
		tostring(reason or "unknown"),
		tostring(nullBattleState.sessionOwnerTrainerKey or "n/a"),
		tostring(nullBattleState.lastSeenEnemyTrainerKey or "n/a")
	))
end

local function pickKoAttribution(koSnap, runtime)
	local oppSide = koSnap.side ~ 1
	local bestSnap = nil
	for b = 0, runtime.battlersCount - 1 do
		local snap = runtime.snapshots[b]
		if snap and snap.side == oppSide and snap.hp > 0 then
			if not bestSnap then
				bestSnap = snap
			else
				if snap.battler < bestSnap.battler then
					bestSnap = snap
				end
			end
		end
	end
	return bestSnap
end

local function emitHpAndKoEvent(currSnap, prevSnap, runtime)
	local hpBefore = prevSnap.hp
	local hpAfter = currSnap.hp
	if hpBefore == hpAfter then
		return
	end
	if hpBefore > 0 and hpAfter == 0 then
		nullBattleState.actionIndex = nullBattleState.actionIndex + 1
		local nonKoSnap = pickKoAttribution(currSnap, runtime)
		nullBattleState.koHistory[#nullBattleState.koHistory + 1] = currSnap.species
		logNullBattle(string.format(
			"KO actionIndex=%d koBattler=%d koSide=%d koSpecies=%s nonKoBattler=%s nonKoSide=%s nonKoSpecies=%s",
			nullBattleState.actionIndex,
			currSnap.battler,
			currSnap.side,
			tostring(currSnap.species),
			nonKoSnap and tostring(nonKoSnap.battler) or "null",
			nonKoSnap and tostring(nonKoSnap.side) or "null",
			nonKoSnap and tostring(nonKoSnap.species) or "null"
		))
		if NULL_BATTLE.writeFullBattleLog then
			appendFullBattleEvent({
				type = "ko",
				actionIndex = nullBattleState.actionIndex,
				koBattler = currSnap.battler,
				koSide = currSnap.side,
				koSpecies = currSnap.species,
				nonKoBattler = nonKoSnap and nonKoSnap.battler or nil,
				nonKoSide = nonKoSnap and nonKoSnap.side or nil,
				nonKoSpecies = nonKoSnap and nonKoSnap.species or nil,
			})
		end
		logNullBattle(string.format(
			"KO_UPDATE latest=%s koList=[%s]",
			formatSpeciesDisplay(currSnap.species),
			formatKoHistory(nullBattleState.koHistory)
		))

		local killerSpecies = nonKoSnap and nonKoSnap.species or nil
		if currSnap.side == 1 then
			appendBattleLogEvent({
				type = "pKo",
				turn = nullBattleState.actionIndex,
				pSpecies = killerSpecies,
				aiSpecies = currSnap.species,
				aiPartySlot = currSnap.partyIndex,
			})
		else
			appendBattleLogEvent({
				type = "aiKo",
				turn = nullBattleState.actionIndex,
				pSpecies = currSnap.species,
				aiSpecies = killerSpecies,
			})
		end
	end
end

local function getConfiguredPollFrames(sessionActive)
	local raw = sessionActive and NULL_BATTLE.sessionActivePollFrames or NULL_BATTLE.sessionStartPollFrames
	local n = math.floor(tonumber(raw) or 1)
	if n < 1 then
		return 1
	end
	return n
end

local function shouldPollOnThisFrame(frameNow)
	local pollEvery = getConfiguredPollFrames(nullBattleState.sessionActive)
	local elapsed = frameNow - (tonumber(nullBattleState.lastRuntimePollFrame) or 0)
	if elapsed < 1 then
		elapsed = 1
	end
	local hasPendingOverride = (not nullBattleState.sessionActive) and type(nextTrainerMovesetState.pending) == "table"
	if hasPendingOverride then
		return true, elapsed
	end
	if elapsed < pollEvery then
		return false, elapsed
	end
	return true, elapsed
end

function updateNullBattleLogger()
	nullBattleState.frame = nullBattleState.frame + 1
	local shouldPoll, elapsedFrames = shouldPollOnThisFrame(nullBattleState.frame)
	if not shouldPoll then
		return
	end
	nullBattleState.lastRuntimePollFrame = nullBattleState.frame
	local runtime = gatherBattleRuntime()
	if runtime and tryApplyPendingNextTrainerMovesetOverride(runtime, nullBattleState.sessionActive and "session_active" or "session_start") then
		runtime = gatherBattleRuntime() or runtime
	end
	if not nullBattleState.sessionActive then
		if runtime then
			local initialEnemyTrainerKey = readEnemyTrainerKeyFromRuntime(runtime)
			emitSessionStart(runtime, initialEnemyTrainerKey)
		end
		return
	end

	if not runtime then
		local gateActive = isTrainerBattleGateActive()
		startBoundary(gateActive and "runtime_unresolved" or "trainer_gate_dropped")
		if gateActive then
			-- In-battle decode drops are expected during transitions; do not age timeout.
			return
		end
		nullBattleState.pendingBoundaryFrames = nullBattleState.pendingBoundaryFrames + elapsedFrames
		if nullBattleState.pendingBoundaryFrames >= NULL_BATTLE.sessionResetFrames then
			logNullBattle(string.format(
				"BOUNDARY_TIMEOUT frames=%d ownerTrainerKey=%s",
				nullBattleState.pendingBoundaryFrames,
				tostring(nullBattleState.sessionOwnerTrainerKey or "n/a")
			))
			emitSessionEnd()
		end
		return
	end

	nullBattleState.inactiveFrames = 0
	local enemyTrainerKey = readEnemyTrainerKeyFromRuntime(runtime)
	if enemyTrainerKey ~= nil then
		nullBattleState.lastSeenEnemyTrainerKey = enemyTrainerKey
		if nullBattleState.sessionOwnerTrainerKey == nil then
			nullBattleState.sessionOwnerTrainerKey = enemyTrainerKey
			logNullBattle(string.format(
				"OWNER_TRAINER_KEY key=%s",
				enemyTrainerKey
			))
		end
	end

	if nullBattleState.pendingBoundary then
		local ownerKey = nullBattleState.sessionOwnerTrainerKey
		if ownerKey ~= nil and enemyTrainerKey ~= nil and enemyTrainerKey ~= ownerKey then
			logNullBattle(string.format(
				"BOUNDARY_KEY_CHANGE oldTrainerKey=%s newTrainerKey=%s",
				ownerKey,
				enemyTrainerKey
			))
			emitSessionEnd()
			emitSessionStart(runtime, enemyTrainerKey)
			return
		end
		nullBattleState.pendingBoundary = false
		nullBattleState.pendingBoundaryFrames = 0
	end

	for b = 0, runtime.battlersCount - 1 do
		local curr = runtime.snapshots[b]
		local prev = nullBattleState.prevSnapshots[b]
		if prev then
			emitHpAndKoEvent(curr, prev, runtime)
		end
		nullBattleState.prevSnapshots[b] = curr
	end
end
-- <<< END 07_trainer_override_session.lua

-- >>> BEGIN 08_http_server.lua
-- Module Index: 08_http_server
-- Owns: HTTP transport/server lifecycle, singleton teardown, and request routing.

local HTTP_STATUS_TEXT = {
	[200] = "OK",
	[400] = "Bad Request",
	[404] = "Not Found",
	[405] = "Method Not Allowed",
	[500] = "Internal Server Error",
}
local HTTP_SEND_CHUNK_BYTES = 1024
local HTTP_SEND_MAX_AGAIN_RETRIES = 240
local HTTP_LISTEN_BACKLOG = 16
local HTTP_MAX_REQUEST_HEAD_BYTES = 32768

local nullHttpState = {
	started = false,
	server = nil,
	socketModule = nil,
	host = nil, -- all interfaces
	port = 31124,
	updatePath = "/update",
	pingPath = "/ping",
	battleStatePath = "/battle_state",
	clientBuffers = {},
	pendingSends = {},
	updateRequestCount = 0,
	battleStateRequestCount = 0,
}
local nullScriptStarted = false

local NULL_SINGLETON_KEY = "__VSRECORDER_NULL_HTTP_UPDATE_SINGLETON__"
local nullSingleton = rawget(_G, NULL_SINGLETON_KEY)
if type(nullSingleton) ~= "table" then
	nullSingleton = {
		activeToken = 0,
		frameCallbackId = nil,
		startCallbackId = nil,
		callbackOwnerToken = nil,
		httpState = nil,
		teardown = nil,
	}
end
nullSingleton.activeToken = (nullSingleton.activeToken or 0) + 1
local THIS_SCRIPT_TOKEN = nullSingleton.activeToken
_G[NULL_SINGLETON_KEY] = nullSingleton

local function isActiveScriptInstance()
	local g = rawget(_G, NULL_SINGLETON_KEY)
	return type(g) == "table" and g.activeToken == THIS_SCRIPT_TOKEN
end

local function closeHttpSocketQuiet(sock)
	if not sock then
		return
	end
	pcall(function()
		sock:close()
	end)
end

local function clearPendingHttpSend(sock)
	local pending = nullHttpState.pendingSends[sock]
	if not pending then
		return
	end
	if pending.frameCallbackId then
		pcall(function()
			callbacks:remove(pending.frameCallbackId)
		end)
	end
	nullHttpState.pendingSends[sock] = nil
end

local function closeHttpClient(sock)
	if not sock then
		return
	end
	nullHttpState.clientBuffers[sock] = nil
	clearPendingHttpSend(sock)
	closeHttpSocketQuiet(sock)
end

local function removeCallbackQuiet(cbid)
	if not cbid then
		return
	end
	pcall(function()
		callbacks:remove(cbid)
	end)
end

local function forceCloseHttpState(state)
	if type(state) ~= "table" then
		return
	end

	local sockets = {}
	local seenSockets = {}
	local function queueSocket(sock)
		if not sock or seenSockets[sock] then
			return
		end
		seenSockets[sock] = true
		sockets[#sockets + 1] = sock
	end

	if type(state.pendingSends) == "table" then
		for sock, pending in pairs(state.pendingSends) do
			if type(pending) == "table" and pending.frameCallbackId then
				removeCallbackQuiet(pending.frameCallbackId)
			end
			queueSocket(sock)
		end
	end
	if type(state.clientBuffers) == "table" then
		for sock, _ in pairs(state.clientBuffers) do
			queueSocket(sock)
		end
	end

	for i = 1, #sockets do
		closeHttpSocketQuiet(sockets[i])
	end
	closeHttpSocketQuiet(state.server)

	state.server = nil
	state.started = false
	state.clientBuffers = {}
	state.pendingSends = {}
end

local function teardownThisScriptInstance(_)
	local g = rawget(_G, NULL_SINGLETON_KEY)
	if type(g) == "table" and g.callbackOwnerToken == THIS_SCRIPT_TOKEN then
		removeCallbackQuiet(g.frameCallbackId)
		removeCallbackQuiet(g.startCallbackId)
		g.frameCallbackId = nil
		g.startCallbackId = nil
		g.callbackOwnerToken = nil
	end

	forceCloseHttpState(nullHttpState)
	nullHttpState.socketModule = nil
	nullScriptStarted = false

	if type(g) == "table" then
		if g.httpState == nullHttpState then
			g.httpState = nil
		end
		if g.teardown == teardownThisScriptInstance then
			g.teardown = nil
		end
	end
end

local function teardownPreviousSingletonInstance()
	local g = rawget(_G, NULL_SINGLETON_KEY)
	if type(g) ~= "table" then
		return
	end

	if type(g.teardown) == "function" then
		pcall(g.teardown, "script_reload")
	end

	-- Fallback cleanup in case a prior version did not define teardown.
	removeCallbackQuiet(g.frameCallbackId)
	removeCallbackQuiet(g.startCallbackId)
	g.frameCallbackId = nil
	g.startCallbackId = nil
	g.callbackOwnerToken = nil

	forceCloseHttpState(g.httpState)
	g.httpState = nil
	g.teardown = nil
end

local function parseHttpRequestHead(data)
	if not data then
		return nil
	end
	local head = data:match("^(.-)\r\n\r\n")
	if not head then
		return nil
	end
	local requestLine = head:match("([^\r\n]+)")
	if not requestLine then
		return nil
	end
	local method, path, version = requestLine:match("^(%S+)%s+(%S+)%s+(%S+)$")
	if not method then
		return nil
	end
	return {
		method = method,
		path = path,
		version = version,
	}
end

local flushHttpResponse

local function sendHttpResponse(sock, statusCode, body, contentType)
	if not sock then
		return
	end
	local statusText = HTTP_STATUS_TEXT[statusCode] or "OK"
	body = body or ""
	contentType = contentType or "text/plain; charset=utf-8"
	local response = string.format(
		"HTTP/1.1 %d %s\r\n" ..
		"Access-Control-Allow-Origin: *\r\n" ..
		"Content-Length: %d\r\n" ..
		"Content-Type: %s\r\n" ..
		"Connection: close\r\n" ..
		"\r\n%s",
		statusCode,
		statusText,
		#body,
		contentType,
		body
	)
	clearPendingHttpSend(sock)
	nullHttpState.pendingSends[sock] = {
		response = response,
		offset = 1,
		againRetries = 0,
		frameCallbackId = nil,
	}
	flushHttpResponse(sock)
end

flushHttpResponse = function(sock)
	local pending = nullHttpState.pendingSends[sock]
	if not pending then
		return
	end
	local socketModule = nullHttpState.socketModule or rawget(_G, "socket")
	local again = socketModule and socketModule.ERRORS and socketModule.ERRORS.AGAIN
	local timeout = socketModule and socketModule.ERRORS and socketModule.ERRORS.TIMEOUT

	while pending.offset <= #pending.response do
		local chunkEnd = math.min(pending.offset + HTTP_SEND_CHUNK_BYTES - 1, #pending.response)
		local sendOk, lastByteOrErr, sendErr = pcall(function()
			return sock:send(pending.response, pending.offset, chunkEnd)
		end)
		if not sendOk then
			console:log(string.format("[null-http] WARN HTTP send panic: %s", tostring(lastByteOrErr)))
			closeHttpClient(sock)
			return
		end
		if lastByteOrErr then
			if lastByteOrErr < pending.offset then
				pending.againRetries = pending.againRetries + 1
			else
				pending.offset = lastByteOrErr + 1
				pending.againRetries = 0
			end
		elseif sendErr == again or sendErr == timeout then
			pending.againRetries = pending.againRetries + 1
		else
			console:log(string.format("[null-http] WARN HTTP send failed: %s", tostring(sendErr)))
			closeHttpClient(sock)
			return
		end

		if pending.againRetries > HTTP_SEND_MAX_AGAIN_RETRIES then
			console:log(string.format("[null-http] WARN HTTP send retry limit hit (%s)", tostring(sendErr)))
			closeHttpClient(sock)
			return
		end
		if pending.offset <= #pending.response and pending.againRetries > 0 then
			if not pending.frameCallbackId then
				pending.frameCallbackId = callbacks:add("frame", function()
					flushHttpResponse(sock)
				end)
			end
			return
		end
	end

	closeHttpClient(sock)
end

local function handleHttpRequest(method, path)
	local normalizedPath = (path and path:match("^[^?]+")) or path

	if method ~= "GET" then
		return 405, "Method Not Allowed", "text/plain; charset=utf-8"
	end

	if normalizedPath == nullHttpState.pingPath then
		return 200, "Pong", "text/plain; charset=utf-8"
	end

	if normalizedPath == nullHttpState.updatePath then
		nullHttpState.updateRequestCount = (nullHttpState.updateRequestCount or 0) + 1
		console:log(string.format(
			"[null-http] /update hit #%d @ %s",
			nullHttpState.updateRequestCount,
			os.date("%H:%M:%S")
		))
		local ok, text = pcall(buildShowdownText)
		if not ok then
			return 500, tostring(text), "text/plain; charset=utf-8"
		end
		return 200, text or "", "text/plain; charset=utf-8"
	end

	if normalizedPath == nullHttpState.battleStatePath then
		nullHttpState.battleStateRequestCount = (nullHttpState.battleStateRequestCount or 0) + 1
		local okPayload, payloadOrErr = pcall(buildBattleStatePayload)
		if not okPayload then
			return 500, tostring(payloadOrErr), "text/plain; charset=utf-8"
		end
		local okJson, encodedOrErr = pcall(jsonEncode, payloadOrErr)
		if not okJson then
			return 500, tostring(encodedOrErr), "text/plain; charset=utf-8"
		end
		return 200, encodedOrErr or "{}", "application/json; charset=utf-8"
	end

	return 404, "Not Found", "text/plain; charset=utf-8"
end

local function handleHttpClientReceive(sock)
	local data = nullHttpState.clientBuffers[sock] or ""
	local socketModule = nullHttpState.socketModule or rawget(_G, "socket")
	local again = socketModule and socketModule.ERRORS and socketModule.ERRORS.AGAIN
	local function finishRequestFromBuffer()
		local req = parseHttpRequestHead(data)
		nullHttpState.clientBuffers[sock] = nil
		if not req then
			sendHttpResponse(sock, 400, "Bad Request", "text/plain; charset=utf-8")
			return true
		end
		local statusCode, body, contentType = handleHttpRequest(req.method, req.path)
		sendHttpResponse(sock, statusCode, body, contentType)
		return true
	end
	while true do
		local chunk, err = sock:receive(1024)
		if chunk then
			data = data .. chunk
			if #data > HTTP_MAX_REQUEST_HEAD_BYTES then
				nullHttpState.clientBuffers[sock] = nil
				sendHttpResponse(sock, 400, "Bad Request", "text/plain; charset=utf-8")
				return
			end
			if data:find("\r\n\r\n", 1, true) then
				finishRequestFromBuffer()
				return
			end
		else
			if err == again then
				nullHttpState.clientBuffers[sock] = data
				return
			end
			if data:find("\r\n\r\n", 1, true) then
				finishRequestFromBuffer()
				return
			end
			closeHttpClient(sock)
			return
		end
	end
end

local function acceptHttpConnection()
	local server = nullHttpState.server
	if not server then
		return
	end
	local socketModule = nullHttpState.socketModule or rawget(_G, "socket")
	local again = socketModule and socketModule.ERRORS and socketModule.ERRORS.AGAIN
	while true do
		local sock, err = server:accept()
		if not sock then
			if err ~= again then
				return
			end
			return
		end
		sock:add("received", function()
			handleHttpClientReceive(sock)
		end)
		sock:add("error", function()
			closeHttpClient(sock)
		end)
	end
end

function setupNullHttpServer()
	if not isActiveScriptInstance() then
		return
	end
	if nullHttpState.started and nullHttpState.server then
		return
	end

	local socketModule = rawget(_G, "socket")
	if socketModule == nil then
		local ok, required = pcall(require, "socket")
		if ok and required then
			socketModule = required
		end
	end
	if not socketModule or not socketModule.bind then
		console:log("[null-http] WARN socket module unavailable; HTTP disabled.")
		return
	end

	local server, bindErr = socketModule.bind(nullHttpState.host, nullHttpState.port)
	if bindErr or not server then
		console:log(string.format("[null-http] WARN HTTP bind failed on port %s: %s", tostring(nullHttpState.port), tostring(bindErr)))
		return
	end

	local _ok, listenErr = server:listen(HTTP_LISTEN_BACKLOG)
	if listenErr then
		closeHttpSocketQuiet(server)
		console:log(string.format("[null-http] WARN HTTP listen failed: %s", tostring(listenErr)))
		return
	end

	nullHttpState.socketModule = socketModule
	nullHttpState.server = server
	nullHttpState.started = true
	nullSingleton.httpState = nullHttpState
	server:add("received", acceptHttpConnection)
	console:log("Now connected to https://hzla.github.io/Dynamic-Calc-Decomps/?data=null")
end
-- <<< END 08_http_server.lua

-- >>> BEGIN 09_ui_main.lua
-- Module Index: 09_ui_main
-- Owns: help buffer rendering, startup wiring, and frame callback registration.

local function renderHowToUseBuffer(ctx)
	if not howToUseBuffer then
		howToUseBuffer = console:createBuffer("How to Use This Script")
		howToUseBuffer:setSize(220, 320)
	end

	local attempt = (ctx and ctx.attempt) or "n/a"
	local trainerKey = (ctx and ctx.trainerKey) or "n/a"
	local attemptDir = (ctx and ctx.attemptDir) or "n/a"

	howToUseBuffer:clear()
	howToUseBuffer:print("How to Use This Script\n\n")
	howToUseBuffer:print("Web tools/endpoints:\n")
	howToUseBuffer:print("- https://hzla.github.io/Dynamic-Calc-Decomps/?data=null\n")
	howToUseBuffer:print("  Click Sync under the Import Team box to automatically import your Party/Box\n\n")
	howToUseBuffer:print("Output files location:\n")
	howToUseBuffer:print(string.format("- Script/output directory: %s\n", tostring(NULL_EXPORT.baseDir)))
	howToUseBuffer:print(string.format("- Current attempt #%s directory: %s\n\n", tostring(attempt), tostring(attemptDir)))
	howToUseBuffer:print("Attempts are tracked by trainer ID key:\n")
	howToUseBuffer:print(string.format("- Current key: %s\n", tostring(trainerKey)))
	howToUseBuffer:print("- Key format: <trainerId>:<secretId>\n\n")
	howToUseBuffer:print("Battle logging behavior:\n")
	howToUseBuffer:print("- Battles are automatically detected while you play\n")
	howToUseBuffer:print("- KOs are automatically recorded into the battle logs\n")
	howToUseBuffer:print("- Stat stage changes are recorded in full battle log events (type=\"stat_stage\")\n\n")
	howToUseBuffer:print("DEBUGGING FUNCTIONS:\n\n")
	howToUseBuffer:print("Next trainer override (moves + HP):\n")
	howToUseBuffer:print("- setNextTrainerMoveset sets the enemy lead's 4 moves (IDs or names)\n")
	howToUseBuffer:print("- setNextTrainerPokemonHp(hp, maxHp?) sets next trainer enemy HP (maxHp optional)\n")
	howToUseBuffer:print("- setNextTrainerCurrentHp(hp) sets only current HP and keeps max HP unchanged\n")
	howToUseBuffer:print("- Overrides are one-shot: consumed after they apply once\n")
	howToUseBuffer:print("- Overrides apply only in trainer battles (wild battles are ignored)\n")
	howToUseBuffer:print("- clearNextTrainerMovesetOverride() clears queued move+HP overrides\n")
	howToUseBuffer:print("- clearNextTrainerPokemonHpOverride() clears only queued HP override\n")
	howToUseBuffer:print("- showNextTrainerMovesetOverride() shows current queued override state\n\n")
	howToUseBuffer:print("Usage examples:\n")
	howToUseBuffer:print("- setNextTrainerMoveset(\"Spore\", \"Sheer Cold\", \"Recover\", \"Protect\")\n")
	howToUseBuffer:print("- setNextTrainerMoveset(147, 90, 105, 182)\n")
	howToUseBuffer:print("- setNextTrainerMoveset({\"Spore\", \"Sheer Cold\", \"Recover\", \"Protect\"})\n")
	howToUseBuffer:print("- setNextTrainerPokemonHp(1)\n")
	howToUseBuffer:print("- setNextTrainerPokemonHp(50, 200)\n\n")
	howToUseBuffer:print("PC box creation (new mon in slot):\n")
	howToUseBuffer:print("- createPokemonInBoxSlot(slotIndex, speciesIdOrName, opts)\n")
	howToUseBuffer:print("- slotIndex accepts global 1..120 OR \"BoxN:S\" (example: \"Box1:15\")\n")
	howToUseBuffer:print("- Required: species id or species name string\n")
	howToUseBuffer:print("- Optional opts fields: moves, abilitySlot, nature, level, heldItem, ivs\n")
	howToUseBuffer:print("- Defaults: level=5, empty moves, abilitySlot=1, no held item\n")
	howToUseBuffer:print("- heldItem accepts item ID or item name string\n")
	howToUseBuffer:print("- ivs accepts keys {hp,atk,def,spa,spd,spe} or indexes {1..6}, each 0..31\n")
	howToUseBuffer:print("- OT is always your current trainer TID/SID and PID is randomized\n\n")
	howToUseBuffer:print("PC box creation examples:\n")
	howToUseBuffer:print("- createPokemonInBoxSlot(1, 25)\n")
	howToUseBuffer:print("- createPokemonInBoxSlot(1, \"Pikachu\")\n")
	howToUseBuffer:print("- createPokemonInBoxSlot(2, 6, { level=50, moves={\"Flamethrower\",\"Fly\"}, nature=\"Timid\", abilitySlot=2, heldItem=299 })\n\n")
	howToUseBuffer:print("- createPokemonInBoxSlot(\"Box1:15\", 150, { heldItem=\"Leftovers\", ivs={hp=31,atk=0,def=31,spa=31,spd=31,spe=31} })\n\n")
	howToUseBuffer:print("PC box edit (patch existing slot, PID unchanged):\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(slotIndex, opts)\n")
	howToUseBuffer:print("- Edits only fields in opts; omitted fields stay unchanged\n")
	howToUseBuffer:print("- Works only if slot currently has a Pokemon\n")
	howToUseBuffer:print("- PID/personality edits are not allowed in edit mode\n")
	howToUseBuffer:print("- Null sentinel for clear/reset: BOX_NULL (preferred) or \"null\"\n\n")
	howToUseBuffer:print("PC box edit examples:\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(\"Box1:15\", { moves={[2]=\"Surf\"} })\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(1, { species=\"Charizard\" })\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(1, { heldItem=\"Leftovers\", ivs={atk=0,spe=31} })\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(1, { heldItem=BOX_NULL })\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(1, { moves=BOX_NULL })\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(1, { nature=BOX_NULL })\n\n")
	howToUseBuffer:print("Available commands:\n")
	howToUseBuffer:print("- export()\n")
	howToUseBuffer:print("- createPokemonInBoxSlot(slotIndex, speciesIdOrName[, opts])\n")
	howToUseBuffer:print("- editPokemonInBoxSlot(slotIndex, opts)\n")
	howToUseBuffer:print("- BOX_NULL (global sentinel table for edit clears)\n")
	howToUseBuffer:print("- setNextTrainerMoveset(m1, m2, m3, m4)\n")
	howToUseBuffer:print("- setNextTrainerMoveset({m1, m2, m3, m4})\n")
	howToUseBuffer:print("- setNextTrainerPokemonHp(hp[, maxHp])\n")
	howToUseBuffer:print("- setNextTrainerHp(hp[, maxHp])\n")
	howToUseBuffer:print("- setNextTrainerCurrentHp(hp)\n")
	howToUseBuffer:print("- clearNextTrainerMovesetOverride()\n")
	howToUseBuffer:print("- clearNextTrainerPokemonHpOverride()\n")
	howToUseBuffer:print("- showNextTrainerMovesetOverride()\n")
end

function startScript()
	if not isActiveScriptInstance() then
		return
	end
	if nullScriptStarted then
		return
	end
	nullScriptStarted = true
	armHardcodedNextTrainerMovesetIfConfigured()
	local ctx = ensureExportContext()
	writeCurrentAttemptMaster(false)
	renderHowToUseBuffer(ctx)
	setupNullHttpServer()
	if not partyBuffer then
		partyBuffer = console:createBuffer("Showdown Export")
		partyBuffer:setSize(200,1000)
		export()
	end
	if not hiddenBuffer then
		hiddenBuffer = console:createBuffer("Hidden Powers")
		hiddenBuffer:setSize(200,200)
		hiddens()
	end
end

function export()
	if not partyBuffer then
		console:log("error")
		return
	end
	printPartyStatus(partyBuffer)
	if not hiddenBuffer then
		console:log("error")
		return
	end
	hiddens()
end

teardownPreviousSingletonInstance()
nullSingleton.teardown = teardownThisScriptInstance
nullSingleton.httpState = nullHttpState
nullSingleton.startCallbackId = callbacks:add("start", function()
	if not isActiveScriptInstance() then
		return
	end
	startScript()
end)
nullSingleton.frameCallbackId = callbacks:add("frame", function()
	if not isActiveScriptInstance() then
		return
	end
	updateNullBattleLogger()
end)
nullSingleton.callbackOwnerToken = THIS_SCRIPT_TOKEN
if emu then
	startScript()
end
-- <<< END 09_ui_main.lua

