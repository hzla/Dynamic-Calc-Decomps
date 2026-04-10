(function () {
    const g67SpeciesAppend = `
Chespin
Quilladin
Chesnaught
Fennekin
Braixen
Delphox
Froakie
Frogadier
Greninja
Bunnelby
Diggersby
Fletchling
Fletchinder
Talonflame
Scatterbug
Spewpa
Vivillon
Litleo
Pyroar
Flabébé
Floette
Florges
Skiddo
Gogoat
Pancham
Pangoro
Furfrou
Espurr
Meowstic
Honedge
Doublade
Aegislash
Spritzee
Aromatisse
Swirlix
Slurpuff
Inkay
Malamar
Binacle
Barbaracle
Skrelp
Dragalge
Clauncher
Clawitzer
Helioptile
Heliolisk
Tyrunt
Tyrantrum
Amaura
Aurorus
Sylveon
Hawlucha
Dedenne
Carbink
Goomy
Sliggoo
Goodra
Klefki
Phantump
Trevenant
Pumpkaboo
Gourgeist
Bergmite
Avalugg
Noibat
Noivern
Xerneas
Yveltal
Zygarde
Diancie
Hoopa
Volcanion
Rowlet
Dartrix
Decidueye
Litten
Torracat
Incineroar
Popplio
Brionne
Primarina
Pikipek
Trumbeak
Toucannon
Yungoos
Gumshoos
Grubbin
Charjabug
Vikavolt
Crabrawler
Crabominable
Oricorio
Cutiefly
Ribombee
Rockruff
Lycanroc
Wishiwashi
Mareanie
Toxapex
Mudbray
Mudsdale
Dewpider
Araquanid
Fomantis
Lurantis
Morelull
Shiinotic
Salandit
Salazzle
Stufful
Bewear
Bounsweet
Steenee
Tsareena
Comfey
Oranguru
Passimian
Wimpod
Golisopod
Sandygast
Palossand
Pyukumuku
Type: Null
Silvally
Minior
Komala
Turtonator
Togedemaru
Mimikyu
Bruxish
Drampa
Dhelmise
Jangmo-o
Hakamo-o
Kommo-o
Tapu Koko
Tapu Lele
Tapu Bulu
Tapu Fini
Cosmog
Cosmoem
Solgaleo
Lunala
Nihilego
Buzzwole
Pheromosa
Xurkitree
Celesteela
Kartana
Guzzlord
Necrozma
Magearna
Marshadow
Poipole
Naganadel
Stakataka
Blacephalon
Zeraora
`.trim().split(/\r?\n/);

    const g67MoveAppend = `
Flying Press
Mat Block
Belch
Rototiller
Sticky Web
Fell Stinger
Phantom Force
Trick-or-Treat
Noble Roar
Ion Deluge
Parabolic Charge
Forest’s Curse
Petal Blizzard
Freeze-Dry
Disarming Voice
Parting Shot
Topsy-Turvy
Draining Kiss
Crafty Shield
Flower Shield
Grassy Terrain
Misty Terrain
Electrify
Play Rough
Fairy Wind
Moonblast
Boomburst
Fairy Lock
King’s Shield
Play Nice
Confide
Diamond Storm
Steam Eruption
Hyperspace Hole
Water Shuriken
Mystical Fire
Spiky Shield
Aromatic Mist
Eerie Impulse
Venom Drench
Powder
Geomancy
Magnetic Flux
Happy Hour
Electric Terrain
Dazzling Gleam
Celebrate
Hold Hands
Baby-Doll Eyes
Nuzzle
Hold Back
Infestation
Power-Up Punch
Oblivion Wing
Thousand Arrows
Thousand Waves
Land’s Wrath
Light of Ruin
Origin Pulse
Precipice Blades
Dragon Ascent
Hyperspace Fury
Breakneck Blitz
Breakneck Blitz
All-Out Pummeling
All-Out Pummeling
Supersonic Skystrike
Supersonic Skystrike
Acid Downpour
Acid Downpour
Tectonic Rage
Tectonic Rage
Continental Crush
Continental Crush
Savage Spin-Out
Savage Spin-Out
Never-Ending Nightmare
Never-Ending Nightmare
Corkscrew Crash
Corkscrew Crash
Inferno Overdrive
Inferno Overdrive
Hydro Vortex
Hydro Vortex
Bloom Doom
Bloom Doom
Gigavolt Havoc
Gigavolt Havoc
Shattered Psyche
Shattered Psyche
Subzero Slammer
Subzero Slammer
Devastating Drake
Devastating Drake
Black Hole Eclipse
Black Hole Eclipse
Twinkle Tackle
Twinkle Tackle
Catastropika
Shore Up
First Impression
Baneful Bunker
Spirit Shackle
Darkest Lariat
Sparkling Aria
Ice Hammer
Floral Healing
High Horsepower
Strength Sap
Solar Blade
Leafage
Spotlight
Toxic Thread
Laser Focus
Gear Up
Throat Chop
Pollen Puff
Anchor Shot
Psychic Terrain
Lunge
Fire Lash
Power Trip
Burn Up
Speed Swap
Smart Strike
Purify
Revelation Dance
Core Enforcer
Trop Kick
Instruct
Beak Blast
Clanging Scales
Dragon Hammer
Brutal Swing
Aurora Veil
Sinister Arrow Raid
Malicious Moonsault
Oceanic Operetta
Guardian of Alola
Soul-Stealing 7-Star Strike
Stoked Sparksurfer
Pulverizing Pancake
Extreme Evoboost
Genesis Supernova
Shell Trap
Fleur Cannon
Psychic Fangs
Stomping Tantrum
Shadow Bone
Accelerock
Liquidation
Prismatic Laser
Spectral Thief
Sunsteel Strike
Moongeist Beam
Tearful Look
Zing Zap
Nature’s Madness
Multi-Attack
10,000,000 Volt Thunderbolt
Mind Blown
Plasma Fists
Photon Geyser
Light That Burns the Sky
Searing Sunraze Smash
Menacing Moonraze Maelstrom
Let’s Snuggle Forever
Splintered Stormshards
Clangorous Soulblaze
`.trim().split(/\r?\n/);

    const g67ItemAppend = `
Weakness Policy
Assault Vest
Holo Caster
Prof’s Letter
Roller Skates
Pixie Plate
Ability Capsule
Whipped Dream
Sachet
Luminous Moss
Snowball
Safety Goggles
Poké Flute
Rich Mulch
Surprise Mulch
Boost Mulch
Amaze Mulch
Gengarite
Gardevoirite
Ampharosite
Venusaurite
Charizardite X
Blastoisinite
Mewtwonite X
Mewtwonite Y
Blazikenite
Medichamite
Houndoominite
Aggronite
Banettite
Tyranitarite
Scizorite
Pinsirite
Aerodactylite
Lucarionite
Abomasite
Kangaskhanite
Gyaradosite
Absolite
Charizardite Y
Alakazite
Heracronite
Mawilite
Manectite
Garchompite
Latiasite
Latiosite
Roseli Berry
Kee Berry
Maranga Berry
Sprinklotad
TM96
TM97
TM98
TM99
TM100
Power Plant Pass
Mega Ring
Intriguing Stone
Common Stone
Discount Coupon
Elevator Key
TMV Pass
Honor of Kalos
Adventure Guide
Strange Souvenir
Lens Case
Makeup Bag
Travel Trunk
Lumiose Galette
Shalour Sable
Jaw Fossil
Sail Fossil
Looker Ticket
Bike
Holo Caster
Fairy Gem
Mega Charm
Mega Glove
Mach Bike
Acro Bike
Wailmer Pail
Devon Parts
Soot Sack
Basement Key
Pokéblock Kit
Letter
Eon Ticket
Scanner
Go-Goggles
Meteorite
Key to Room 1
Key to Room 2
Key to Room 4
Key to Room 6
Storage Key
Devon Scope
S.S. Ticket
HM07
Devon Scuba Gear
Contest Costume
Contest Costume
Magma Suit
Aqua Suit
Pair of Tickets
Mega Bracelet
Mega Pendant
Mega Glasses
Mega Anchor
Mega Stickpin
Mega Tiara
Mega Anklet
Meteorite
Swampertite
Sceptilite
Sablenite
Altarianite
Galladite
Audinite
Metagrossite
Sharpedonite
Slowbronite
Steelixite
Pidgeotite
Glalitite
Diancite
Prison Bottle
Mega Cuff
Cameruptite
Lopunnite
Salamencite
Beedrillite
Meteorite
Meteorite
Key Stone
Meteorite Shard
Eon Flute
Normalium Z
Firium Z
Waterium Z
Electrium Z
Grassium Z
Icium Z
Fightinium Z
Poisonium Z
Groundium Z
Flyinium Z
Psychium Z
Buginium Z
Rockium Z
Ghostium Z
Dragonium Z
Darkinium Z
Steelium Z
Fairium Z
Pikanium Z
Bottle Cap
Gold Bottle Cap
Z-Ring
Decidium Z
Incinium Z
Primarium Z
Tapunium Z
Marshadium Z
Aloraichium Z
Snorlium Z
Eevium Z
Mewnium Z
Normalium Z
Firium Z
Waterium Z
Electrium Z
Grassium Z
Icium Z
Fightinium Z
Poisonium Z
Groundium Z
Flyinium Z
Psychium Z
Buginium Z
Rockium Z
Ghostium Z
Dragonium Z
Darkinium Z
Steelium Z
Fairium Z
Pikanium Z
Decidium Z
Incinium Z
Primarium Z
Tapunium Z
Marshadium Z
Aloraichium Z
Snorlium Z
Eevium Z
Mewnium Z
Pikashunium Z
Pikashunium Z
???
???
???
???
Forage Bag
Fishing Rod
Professor’s Mask
Festival Ticket
Sparkling Stone
Adrenaline Orb
Zygarde Cube
???
Ice Stone
Ride Pager
Beast Ball
Big Malasada
Red Nectar
Yellow Nectar
Pink Nectar
Purple Nectar
Sun Flute
Moon Flute
???
Enigmatic Card
Silver Razz Berry
Golden Razz Berry
Silver Nanab Berry
Golden Nanab Berry
Silver Pinap Berry
Golden Pinap Berry
???
???
???
???
???
Secret Key
S.S. Ticket
Silph Scope
Parcel
Card Key
Gold Teeth
Lift Key
Terrain Extender
Protective Pads
Electric Seed
Psychic Seed
Misty Seed
Grassy Seed
Stretchy Spring
Chalky Stone
Marble
Lone Earring
Beach Glass
Gold Leaf
Silver Leaf
Polished Mud Ball
Tropical Shell
Leaf Letter
Leaf Letter
Small Bouquet
???
???
???
Lure
Super Lure
Max Lure
Pewter Crunchies
Fighting Memory
Flying Memory
Poison Memory
Ground Memory
Rock Memory
Bug Memory
Ghost Memory
Steel Memory
Fire Memory
Water Memory
Grass Memory
Electric Memory
Psychic Memory
Ice Memory
Dragon Memory
Dark Memory
Fairy Memory
Solganium Z
Lunalium Z
Ultranecrozium Z
Mimikium Z
Lycanium Z
Kommonium Z
Solganium Z
Lunalium Z
Ultranecrozium Z
Mimikium Z
Lycanium Z
Kommonium Z
Z-Power Ring
Pink Petal
Orange Petal
Blue Petal
Red Petal
Green Petal
Yellow Petal
Purple Petal
Rainbow Flower
Surge Badge
N-Solarizer
N-Lunarizer
N-Solarizer
N-Lunarizer
Ilima’s Normalium Z
Left Poké Ball
Roto Hatch
Roto Bargain
Roto Prize Money
Roto Exp. Points
Roto Friendship
Roto Encounter
Roto Stealth
Roto HP Restore
Roto PP Restore
Roto Boost
Roto Catch
`.trim().split(/\r?\n/);

    const g67AbilityOfficial = `
None
Stench
Drizzle
Speed Boost
Battle Armor
Sturdy
Damp
Limber
Sand Veil
Static
Volt Absorb
Water Absorb
Oblivious
Cloud Nine
Compound Eyes
Insomnia
Color Change
Immunity
Flash Fire
Shield Dust
Own Tempo
Suction Cups
Intimidate
Shadow Tag
Rough Skin
Wonder Guard
Levitate
Effect Spore
Synchronize
Clear Body
Natural Cure
Lightning Rod
Serene Grace
Swift Swim
Chlorophyll
Illuminate
Trace
Huge Power
Poison Point
Inner Focus
Magma Armor
Water Veil
Magnet Pull
Soundproof
Rain Dish
Sand Stream
Pressure
Thick Fat
Early Bird
Flame Body
Run Away
Keen Eye
Hyper Cutter
Pickup
Truant
Hustle
Cute Charm
Plus
Minus
Forecast
Sticky Hold
Shed Skin
Guts
Marvel Scale
Liquid Ooze
Overgrow
Blaze
Torrent
Swarm
Rock Head
Drought
Arena Trap
Vital Spirit
White Smoke
Pure Power
Shell Armor
Air Lock
Tangled Feet
Motor Drive
Rivalry
Steadfast
Snow Cloak
Gluttony
Anger Point
Unburden
Heatproof
Simple
Dry Skin
Download
Iron Fist
Poison Heal
Adaptability
Skill Link
Hydration
Solar Power
Quick Feet
Normalize
Sniper
Magic Guard
No Guard
Stall
Technician
Leaf Guard
Klutz
Mold Breaker
Super Luck
Aftermath
Anticipation
Forewarn
Unaware
Tinted Lens
Filter
Slow Start
Scrappy
Storm Drain
Ice Body
Solid Rock
Snow Warning
Honey Gather
Frisk
Reckless
Multitype
Flower Gift
Bad Dreams
Pickpocket
Sheer Force
Contrary
Unnerve
Defiant
Defeatist
Cursed Body
Healer
Friend Guard
Weak Armor
Heavy Metal
Light Metal
Multiscale
Toxic Boost
Flare Boost
Harvest
Telepathy
Moody
Overcoat
Poison Touch
Regenerator
Big Pecks
Sand Rush
Wonder Skin
Analytic
Illusion
Imposter
Infiltrator
Mummy
Moxie
Justified
Rattled
Magic Bounce
Sap Sipper
Prankster
Sand Force
Iron Barbs
Zen Mode
Victory Star
Turboblaze
Teravolt
Aroma Veil
Flower Veil
Cheek Pouch
Protean
Fur Coat
Magician
Bulletproof
Competitive
Strong Jaw
Refrigerate
Sweet Veil
Stance Change
Gale Wings
Mega Launcher
Grass Pelt
Symbiosis
Tough Claws
Pixilate
Gooey
Aerilate
Parental Bond
Dark Aura
Fairy Aura
Aura Break
Primordial Sea
Desolate Land
Delta Stream
Stamina
Wimp Out
Emergency Exit
Water Compaction
Merciless
Shields Down
Stakeout
Water Bubble
Steelworker
Berserk
Slush Rush
Long Reach
Liquid Voice
Triage
Galvanize
Surge Surfer
Schooling
Disguise
Battle Bond
Power Construct
Corrosion
Comatose
Queenly Majesty
Innards Out
Dancer
Battery
Fluffy
Dazzling
Soul-Heart
Tangling Hair
Receiver
Power of Alchemy
Beast Boost
RKS System
Electric Surge
Psychic Surge
Misty Surge
Grassy Surge
Full Metal Body
Shadow Shield
Prism Armor
Neuroforce
`.trim().split(/\r?\n/);

    function g67ReplaceRange(base, startIndex, replacement) {
        if (!Array.isArray(base)) {
            return base;
        }
        const suffixStart = startIndex + replacement.length;
        const prefix = base.slice(0, startIndex);
        const suffix = base.length > suffixStart ? base.slice(suffixStart) : [];
        return prefix.concat(replacement, suffix);
    }

    function extendSavArraysToGen67() {
        if (typeof sav_pok_names !== 'undefined' && Array.isArray(sav_pok_names)) {
            const speciesTail = sav_pok_names.length > 808
                ? sav_pok_names.slice(808)
                : sav_pok_names.length > 650
                    ? sav_pok_names.slice(650)
                    : [];
            sav_pok_names = sav_pok_names.slice(0, 650).concat(g67SpeciesAppend, speciesTail);
            window.sav_pok_names = sav_pok_names;
        }
        if (typeof sav_move_names !== 'undefined' && Array.isArray(sav_move_names)) {
            sav_move_names = g67ReplaceRange(sav_move_names, 560, g67MoveAppend);
            window.sav_move_names = sav_move_names;
        }
        if (typeof sav_item_names !== 'undefined' && Array.isArray(sav_item_names)) {
            sav_item_names = g67ReplaceRange(sav_item_names, 639, g67ItemAppend);
            window.sav_item_names = sav_item_names;
        }
        if (typeof sav_abilities !== 'undefined' && Array.isArray(sav_abilities)) {
            sav_abilities = g67ReplaceRange(sav_abilities, 0, g67AbilityOfficial);
            window.sav_abilities = sav_abilities;
        }
    }

    window.extendSavArraysToGen67 = extendSavArraysToGen67;
    extendSavArraysToGen67();
})();
