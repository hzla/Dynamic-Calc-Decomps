// Ordered trainer parties for consecutive battles. Partners share a battle step.
var pokemonNullGauntlets = [
    {id: 'route-104', battles: [[319], [696], [114]]},
    {id: 'clark-devan', battles: [[631, 754], [753]]},
    {id: 'route-109', battles: [[697], [64], [57], [491], [698], [490]]},
    {id: 'oceanic-museum', battles: [[20], [21]]},
    {id: 'verdanturf-tunnel', battles: [[605], [273], [694], [695], [334], [512, 700]]},
    {id: 'madeline-lilith', battles: [[434, 326], [573]]},
    {id: 'winstrate-family', battles: [[292], [299], [606], [312]]},
    {id: 'heidi-celia', battles: [[469, 744], [743]]},
    {id: 'shikamaru-marlene', battles: [[143], [206], [629, 712], [628], [183], [513], [752]]},
    {id: 'jagged-pass', battles: [[570], [474], [566]]},
    {id: 'route-118', battles: [[715, 408], [398]]},
    {id: 'mt-pyre', battles: [[247], [236], [109], [108], [145], [9], [475], [843]]},
    {id: 'space-center', battles: [[588], [589], [590]]},
    {id: 'halo-puffy', battles: [[670, 674], [671]]},
    {id: 'rocket-grunts', battles: [[430], [431], [432]]},
    {id: 'anabel-noland', battles: [[805], [809]]},
    {id: 'isabel-kaleb', battles: [[302], [699]]}
]

function getPokemonNullGauntlet(trainerId, title) {
    if (title !== 'Pokemon Null 1.2' && title !== 'Pokemon Null 1.2.5') return null
    var id = Number(trainerId)
    return pokemonNullGauntlets.find(function(group) {
        return group.battles.some(function(battle) { return battle.includes(id) })
    }) || null
}
