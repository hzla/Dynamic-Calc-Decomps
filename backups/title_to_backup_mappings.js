backupFiles = {
	"Blaze Black/Volt White": "bb",
	"Blaze Black 2/Volt White 2 Original": "bb2",
	"Blaze Black 2/Volt White 2 Redux": "bb2redux1-4",
	"Vintage White": "vw",
	"Renegade Platinum": "rp",
	"Sacred Gold/Storm Silver": "sgss",
	"Ancestral X": "ax",
	"Rising Ruby/Sinking Saphire": "rrss",
	"Emerald Kaizo": "ek",
	"Platinum": "pt",
	"Heart Gold/Soul Silver": "hgss",
	"Black/White": "bw",
	"Black 2/White 2": "bw2",
	"Eternal X/Wilting Y Insanity Rebalanced": "exwy",
	"Emerald Imperium 1.2": "imp",
	"Emerald Imperium 1.3": "imp_1-3",
	"Inclement Emerald": "inc",
	"Inclement Emerald No EVs": "inc",
	"Sterling Silver": "ster117",
	"Sterling Silver 1.17": "ster117",
	"Cascade White": "casc",
	"Cascade White Dev": "casc2",
	"Photonic Sun/Prismatic Moon": "pspm",
	"Pitch Black 2": "pitch",
	"Fire Red Omega": "fro",
	"Fire Red": "fr",
	"Emerald": "em",
	"Luminescent Platinum": "lumi",
	"Radical Red 4.1 Hardcore": "radredhc",
	"Radical Red 4.1 Normal": "radrednmnew",
	"Rising Ruby": "rrss",
	"Hardlove Gold": "hardlove",
	"Heart Gold Engine Rom": "hgenginerom",
	"Vintage White Plus": "vwplus",
	"Blinding White 2": "blind",
	"Emerald Kaizo": "ek",
	"Royal Sapphire": "roysaph",
	"Pokemon Null 1.2": "null12",
	"Pokemon Null 1.1": "null",
	"Platinum Kaizo": "pkv5h",
	"Platinum Kaizo v4": "pk",
	"Navy Sapphire": "navy",
	"Rigorous Red": "rigred",
	"Autumn Red": "autumn",
	"Little Emerald - Normal Mode": "le_normal",
	"Little Emerald - Hard Mode": "le_hard",
	"Pokemon Unbound": "unbound",
	"Unbound": "unbound",
	"Unbound 2.1.1": "unbound"
}

sourceTitleAliases = {
	"bb2redux": "Blaze Black 2/Volt White 2 Redux",
	"bb8579a3798fd63b429d": "Royal Sapphire",
	"68bfb2ccba14b7f6b1f0": "Pokemon Unbound"
}

if (typeof window !== "undefined") {
	window.romhackSourceTitles = window.romhackSourceTitles || {}

	Object.keys(backupFiles).forEach(function(title) {
		var alias = backupFiles[title]
		if (alias && !window.romhackSourceTitles[alias]) {
			window.romhackSourceTitles[alias] = title
		}
	})

	Object.keys(sourceTitleAliases).forEach(function(sourceId) {
		if (!window.romhackSourceTitles[sourceId]) {
			window.romhackSourceTitles[sourceId] = sourceTitleAliases[sourceId]
		}
	})
}

gameVersions = {
	"Radical Red": [
		{
			url: "?data=e91164d90d06a009e6cc&dmgGen=8&gen=8&types=6&noSwitch=1",
			id: "HC"
		},
		{
			url: "?data=ced457ba9aa55731616c&dmgGen=8&gen=8&types=6&noSwitch=1",
			id: "Normal"
		},
	],
	"Emerald Imperium": [
		{
			url: "?data=imp13&dmgGen=8&gen=8&types=6&evs=1",
			id: "Evs"
		},
		{
			url: "?data=imp13&dmgGen=8&gen=8&types=6&evs=0",
			id: "no Evs"
		}
	],
	"Pokemon Null": [
		{
			url: "?data=null",
			id: "1.2"
		},
		{
			url: "?data=null11",
			id: "1.1"
		}
	],
	"Little Emerald": [
		{
			url: "?data=le_normal&dmgGen=8&gen=8&types=6&noSwitch=1",
			id: "Normal"
		},
		{
			url: "?data=le_hard&dmgGen=8&gen=8&types=6&noSwitch=1",
			id: "Hard"
		}
	],
	"Pokemon Unbound": [
		{
			url: "?data=unbound&gen=8&dmgGen=8&noSwitch=1&types=6&critGen=6&m=difficult",
			id: "Difficult"
		},
		{
			url: "?data=unbound&gen=8&dmgGen=8&noSwitch=1&types=6&critGen=6&m=expert",
			id: "Expert"
		},
		{
			url: "?data=unbound&gen=8&dmgGen=8&noSwitch=1&types=6&critGen=6&m=insane",
			id: "Insane"
		}
	]
}
