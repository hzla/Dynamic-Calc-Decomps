(function () {
    const games = {
        "ancestral-x": {
            id: "ancestral-x",
            title: "Ancestral X",
            coverImage: "./img/boxart/ancestralx.jpg",
            description: "",
            sourceTitle: "Ancestral X",
            variants: [
                {
                    label: "Ancestral X",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=7a1ed35468b22ea01103&dmgGen=6&gen=6",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "blaze-black": {
            id: "blaze-black",
            title: "Blaze Black",
            coverImage: "",
            description: "",
            sourceTitle: "Blaze Black/Volt White",
            variants: [
                {
                    label: "Blaze Black",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=9aa37533b7c000992d92&gen=5&types=5",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "blaze-black-2": {
            id: "blaze-black-2",
            title: "Blaze Black 2 Redux",
            coverImage: "./img/boxart/blazeblack2redux.webp",
            description: "",
            sourceTitle: "Blaze Black 2/Volt White 2 Redux",
            variants: [
                {
                    label: "Original",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=04770c9a89687b02a9f5&gen=8&types=5",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Redux",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=bb2redux&gen=8&types=6",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Redux CM",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=bb2redux&gen=8&challengeMode=true&types=6",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "blinding-white-2": {
            id: "blinding-white-2",
            title: "Blinding White 2",
            coverImage: "",
            description: "",
            sourceTitle: "Blinding White 2",
            variants: [
                {
                    label: "Blinding White 2 Normal Mode",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=blind",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Blinding White 2 Challenge Mode",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=blind&challengeMode=true",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "cascade-white": {
            id: "cascade-white",
            title: "Cascade White",
            coverImage: "",
            description: "",
            sourceTitle: "Cascade White",
            variants: [
                {
                    label: "Cascade White",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=casc&critGen=5",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "emerald": {
            id: "emerald",
            title: "Emerald",
            coverImage: "",
            description: "",
            sourceTitle: "Emerald",
            variants: [
                {
                    label: "Emerald",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=aeb373b7631d4afd7a53&dmgGen=3&gen=3&noSwitch=1&types=3",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "emerald-imperium-1-3": {
            id: "emerald-imperium-1-3",
            title: "Emerald Imperium",
            coverImage: "./img/boxart/emeraldimperium.webp",
            description: "",
            sourceTitle: "Emerald Imperium 1.3",
            variants: [
                {
                    label: "No EVs",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=imp13&dmgGen=8&gen=8&types=6&noSwitch=1&evs=0",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "w/ EVs",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=imp13&dmgGen=8&gen=8&types=6&noSwitch=1&evs=1",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "emerald-kaizo": {
            id: "emerald-kaizo",
            title: "Emerald Kaizo",
            coverImage: "",
            description: "",
            sourceTitle: "Emerald Kaizo",
            variants: [
                {
                    label: "Emerald Kaizo",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=ek",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "eternal-x-wilting-y": {
            id: "eternal-x-wilting-y",
            title: "Eternal X/Wilting Y",
            coverImage: "",
            description: "",
            sourceTitle: "Eternal X/Wilting Y Insanity Rebalanced",
            variants: [
                {
                    label: "Eternal X/Wilting Y Insanity Rebalanced",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=8d1ab90a3b3c494d8485&dmgGen=6&gen=6",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "fire-red": {
            id: "fire-red",
            title: "Fire Red",
            coverImage: "",
            description: "",
            sourceTitle: "Fire Red",
            variants: [
                {
                    label: "Fire Red",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=12f82557ed0e08145660&dmgGen=3&gen=3&noSwitch=1&types=3",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "fire-red-omega": {
            id: "fire-red-omega",
            title: "Fire Red Omega",
            coverImage: "",
            description: "",
            sourceTitle: "Fire Red Omega",
            variants: [
                {
                    label: "Fire Red Omega",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=fro",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "heart-gold-soul-silver": {
            id: "heart-gold-soul-silver",
            title: "Heart Gold/Soul Silver",
            coverImage: "",
            description: "",
            sourceTitle: "Heart Gold/Soul Silver",
            variants: [
                {
                    label: "Heart Gold/Soul Silver",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=be0a4fedbe0ff31e47b0&gen=7&switchIn=4&types=5&dmgGen=4",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "inclement-emerald": {
            id: "inclement-emerald",
            title: "Inclement Emerald",
            coverImage: "",
            description: "",
            sourceTitle: "Inclement Emerald",
            variants: [
                {
                    label: "Inclement Emerald",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=68bfb2ccba14b7f6b1f0&gen=8&types=6&dmgGen=8&switchIn=11",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Inclement Emerald No EVs",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=6875151cfa5eea00eafa&gen=8&types=6&dmgGen=8&switchIn=11",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "luminescent-platinum": {
            id: "luminescent-platinum",
            title: "Luminescent Platinum",
            coverImage: "",
            description: "",
            sourceTitle: "Luminescent Platinum",
            variants: [
                {
                    label: "Luminescent Platinum",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=006ac04e900ccb3110df&dmgGen=8&gen=8&switchIn=6&types=6",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "little-emerald": {
            id: "little-emerald",
            title: "Little Emerald",
            coverImage: "",
            description: "",
            sourceTitle: "Little Emerald",
            variants: [
                {
                    label: "Normal Mode",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=le_normal&dmgGen=8&gen=8&types=6&noSwitch=1",
                    sourceTitle: "Little Emerald - Normal Mode",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Hard Mode",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=le_hard&dmgGen=8&gen=8&types=6&noSwitch=1",
                    sourceTitle: "Little Emerald - Hard Mode",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "maximum-platinum": {
            id: "maximum-platinum",
            title: "Maximum Platinum",
            coverImage: "",
            description: "",
            sourceTitle: "Maximum Platinum",
            variants: [
                {
                    label: "Maximum Platinum",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=de22f896c09fceb0b273&gen=8&switchIn=4&types=5&dmgGen=4",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "navy-sapphire": {
            id: "navy-sapphire",
            title: "Navy Sapphire",
            coverImage: "",
            description: "",
            sourceTitle: "Navy Sapphire",
            variants: [
                {
                    label: "Navy Sapphire",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=navysapphire",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "royal-sapphire": {
            id: "royal-sapphire",
            title: "Royal Sapphire",
            coverImage: "",
            description: "",
            sourceTitle: "Royal Sapphire",
            variants: [
                {
                    label: "Royal Sapphire",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=bb8579a3798fd63b429d&dmgGen=3&gen=8&switchIn=3&types=3",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "photonic-sun-prismatic-moon": {
            id: "photonic-sun-prismatic-moon",
            title: "Photonic Sun/Prismatic Moon",
            coverImage: "",
            description: "",
            sourceTitle: "Photonic Sun/Prismatic Moon",
            variants: [
                {
                    label: "Photonic Sun/Prismatic Moon",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=pspm&dmgGen=7&gen=7&types=6",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "pitch-black-2": {
            id: "pitch-black-2",
            title: "Pitch Black 2",
            coverImage: "",
            description: "",
            sourceTitle: "Pitch Black 2",
            variants: [
                {
                    label: "Pitch Black 2 Normal Mode",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=eae4ac1396d4b82d8b87&gen=8&dmgGen=5&types=5",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "platinum": {
            id: "platinum",
            title: "Platinum",
            coverImage: "",
            description: "",
            sourceTitle: "Platinum",
            variants: [
                {
                    label: "Platinum",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=13fc25a3b19071978dd6&gen=7&switchIn=4&types=5&dmgGen=4",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "platinum-kaizo": {
            id: "platinum-kaizo",
            title: "Platinum Kaizo",
            coverImage: "./img/boxart/platinumkaizo.png",
            description: "",
            sourceTitle: "Platinum Kaizo",
            variants: [
                {
                    label: "Platinum Kaizo",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=pk&noSwitch=1",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "platinum-redux": {
            id: "platinum-redux",
            title: "Platinum Redux",
            coverImage: "",
            description: "",
            sourceTitle: "Platinum Redux 2.6",
            variants: [
                {
                    label: "Platinum Redux 2.6",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=5b789b0056c18c5c668b&gen=8&switchIn=4&types=6&dmgGen=4&type_mod=plat_redux",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "pokemon-null": {
            id: "pokemon-null",
            title: "Pokemon Null",
            coverImage: "./img/boxart/pokemonnull.png",
            description: "",
            sourceTitle: "Pokemon Null",
            variants: [
                {
                    label: "1.2",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=null",
                    sourceTitle: "Pokemon Null 1.2",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "1.1",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=null11",
                    sourceTitle: "Pokemon Null 1.1",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "radical-red": {
            id: "radical-red",
            title: "Radical Red 4.1",
            coverImage: "",
            description: "",
            sourceTitle: "Radical Red 4.1",
            variants: [
                {
                    label: "Radical Red 4.1 Hardcore",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=e91164d90d06a009e6cc&dmgGen=8&gen=8&types=6&noSwitch=1",
                    sourceTitle: "Radical Red 4.1 Hardcore",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Radical Red 4.1 Normal",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=ced457ba9aa55731616c&dmgGen=8&gen=8&types=6&noSwitch=1",
                    sourceTitle: "Radical Red 4.1 Normal",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "renegade-platinum": {
            id: "renegade-platinum",
            title: "Renegade Platinum",
            coverImage: "./img/boxart/renegadeplatinum.webp",
            description: "",
            sourceTitle: "Renegade Platinum",
            variants: [
                {
                    label: "Renegade Platinum",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=renegadeplatinum",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "righteous-red": {
            id: "righteous-red",
            title: "Righteous Red",
            coverImage: "",
            description: "",
            sourceTitle: "Righteous Red",
            variants: [
                {
                    label: "Righteous Red",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=4d69b577b07a86fe790c&dmgGen=1&gen=7&noSwitch=1&types=6",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "rising-ruby-sinking-sapphire": {
            id: "rising-ruby-sinking-sapphire",
            title: "Rising Ruby",
            coverImage: "",
            description: "",
            sourceTitle: "Rising Ruby",
            variants: [
                {
                    label: "Rising Ruby",
                    source: "https://hzla.github.io/Dynamic-Calc/?data=rrss",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "rigorous-red": {
            id: "rigorous-red",
            title: "Rigorous Red",
            coverImage: "",
            description: "",
            sourceTitle: "Rigorous Red",
            variants: [
                {
                    label: "Rigorous Red",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=e3f8f8f3adf1aef7c139&dmgGen=3&gen=8&types=3",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "autumn-red": {
            id: "autumn-red",
            title: "Autumn Red",
            coverImage: "",
            description: "",
            sourceTitle: "Autumn Red",
            variants: [
                {
                    label: "Autumn Red",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=autumnred&gen=8",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "sacred-gold-storm-silver": {
            id: "sacred-gold-storm-silver",
            title: "Sacred Gold/Storm Silver",
            coverImage: "",
            description: "",
            sourceTitle: "Sacred Gold/Storm Silver",
            variants: [
                {
                    label: "Sacred Gold/Storm Silver No Fairy",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=sgss",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "sterling-silver": {
            id: "sterling-silver",
            title: "Sterling Silver",
            coverImage: "./img/boxart/sterlingsilver.png",
            description: "",
            sourceTitle: "Sterling Silver 1.17",
            variants: [
                {
                    label: "Sterling Silver 1.17",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=sterlingsilver",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "unbound": {
            id: "unbound",
            title: "Pokemon Unbound",
            coverImage: "",
            description: "",
            sourceTitle: "Pokemon Unbound",
            variants: [
                {
                    label: "Pokemon Unbound Difficult",
                    source: "?data=unbound&gen=8&dmgGen=8&noSwitch=1&types=6&critGen=6&m=difficult",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Pokemon Unbound Expert",
                    source: "?data=unbound&gen=8&dmgGen=8&noSwitch=1&types=6&critGen=6&m=expert",
                    coverImage: "",
                    description: ""
                },
                {
                    label: "Pokemon Unbound Insane",
                    source: "?data=unbound&gen=8&dmgGen=8&noSwitch=1&types=6&critGen=6&m=insane",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "vintage-white-plus": {
            id: "vintage-white-plus",
            title: "Vintage White Plus",
            coverImage: "./img/boxart/vintagewhite.png",
            description: "",
            sourceTitle: "Vintage White Plus",
            variants: [
                {
                    label: "Vintage White Plus",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=vwplus",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "black-white": {
            id: "black-white",
            title: "Black/White",
            coverImage: "",
            description: "",
            sourceTitle: "Black/White",
            variants: [
                {
                    label: "Black/White",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=78381c312866ee2e6ff9&gen=5&types=5",
                    coverImage: "",
                    description: ""
                }
            ]
        },
        "black-2-white-2": {
            id: "black-2-white-2",
            title: "Black 2/White 2",
            coverImage: "",
            description: "",
            sourceTitle: "Black 2/White 2",
            variants: [
                {
                    label: "Black 2/White 2",
                    source: "https://hzla.github.io/Dynamic-Calc-Decomps/?data=83c196dce6759252b3f4&gen=5&types=5",
                    coverImage: "",
                    description: ""
                }
            ]
        }
    };

    const sections = [
        {
            id: "featured",
            title: "Featured",
            gameIds: [
                "renegade-platinum",
                "emerald-imperium-1-3",
                "platinum-kaizo",
                "pokemon-null",
                "ancestral-x",
                "sterling-silver",
                "blaze-black-2",
                "vintage-white-plus"
            ]
        },
        {
            id: "drayano",
            title: "Drayano Hacks",
            gameIds: [
                "fire-red-omega",
                "renegade-platinum",
                "sacred-gold-storm-silver",
                "blaze-black",
                "blaze-black-2",
                "rising-ruby-sinking-sapphire"
            ]
        },
        {
            id: "kaizo",
            title: "Kaizo Hacks",
            gameIds: [
                "emerald-kaizo",
                "platinum-kaizo"
            ]
        },
        {
            id: "buffel-saft",
            title: "Buffel Saft Hacks",
            gameIds: [
                "inclement-emerald",
                "eternal-x-wilting-y",
                "photonic-sun-prismatic-moon"
            ]
        },
        {
            id: "vanilla",
            title: "Vanilla Hacks",
            gameIds: [
                "emerald",
                "fire-red",
                "platinum",
                "heart-gold-soul-silver",
                "black-white",
                "black-2-white-2"
            ]
        },
        {
            id: "more",
            title: "More Hacks",
            sortGames: "alphabetical",
            gameIds: [
                "ancestral-x",
                "autumn-red",
                "blinding-white-2",
                "cascade-white",
                "little-emerald",
                "luminescent-platinum",
                "maximum-platinum",
                "navy-sapphire",
                "pitch-black-2",
                "platinum-redux",
                "radical-red",
                "royal-sapphire",
                "righteous-red",
                "sterling-silver",
                "unbound",
                "vintage-white-plus",
                "rigorous-red"
            ]
        }
    ];

    function getDataKey(source) {
        try {
            return new URL(source).searchParams.get("data") || "";
        } catch (error) {
            return "";
        }
    }

    const sourceTitles = {};
    const linkOptions = [];
    const seenLinkOptions = new Set();

    Object.keys(games).forEach((gameId) => {
        const game = games[gameId];
        if (!game || !Array.isArray(game.variants)) {
            return;
        }

        game.variants.forEach((variant) => {
            if (!variant || !variant.source || !variant.label) {
                return;
            }

            const dataKey = getDataKey(variant.source);
            if (dataKey && !sourceTitles[dataKey]) {
                sourceTitles[dataKey] = variant.sourceTitle || game.sourceTitle || game.title || variant.label;
            }

            const uniqueKey = `${variant.label}::${variant.source}`;
            if (seenLinkOptions.has(uniqueKey)) {
                return;
            }

            seenLinkOptions.add(uniqueKey);
            linkOptions.push({
                gameId: game.id,
                gameTitle: game.title,
                label: variant.label,
                source: variant.source
            });
        });
    });

    window.romhackCatalog = {
        sections: sections,
        games: games
    };
    window.romhackGameIndex = games;
    window.romhackLinkOptions = linkOptions;
    window.romhackSourceTitles = sourceTitles;
})();
