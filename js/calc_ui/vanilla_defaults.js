(function () {
    var loading;
    var flagNames = {
        makesContact: "contact", isPunch: "punch", isBite: "bite", isBullet: "bullet",
        isSound: "sound", isPulse: "pulse", isSlicing: "slicing", isWind: "wind"
    };

    function restoreData() {
        calc.SPECIES = JSON.parse(JSON.stringify(window.calcVanillaData.species));
        calc.MOVES = JSON.parse(JSON.stringify(window.calcVanillaData.moves));
        SPECIES_BY_ID.length = 0;
        MOVES_BY_ID.length = 0;
        calc.SPECIES.forEach(function (species, generation) {
            var map = {};
            Object.keys(species).forEach(function (name) {
                var data = species[name];
                var stats = data.bs;
                if (generation >= 2) delete stats.sl;
                var entry = Object.assign({}, data, {
                    kind: "Species", id: calc.toID(name), name: name,
                    baseStats: {
                        hp: stats.hp, atk: stats.at, def: stats.df, spe: stats.sp,
                        spa: generation === 1 ? stats.sl : stats.sa,
                        spd: generation === 1 ? stats.sl : stats.sd
                    }
                });
                delete entry.bs;
                map[entry.id] = entry;
            });
            SPECIES_BY_ID.push(map);
        });
        calc.MOVES.forEach(function (moves, generation) {
            var map = {};
            Object.keys(moves).forEach(function (name) {
                var data = moves[name];
                var entry = Object.assign({}, data, {
                    kind: "Move", id: calc.toID(name), name: name,
                    basePower: data.bp, flags: {}
                });
                Object.keys(flagNames).forEach(function (flag) {
                    if (data[flag]) entry.flags[flagNames[flag]] = 1;
                    delete entry[flag];
                });
                delete entry.bp;
                delete entry.zp;
                delete entry.maxPower;
                if (data.zp) entry.zMove = { basePower: data.zp };
                if (data.maxPower) entry.maxMove = { basePower: data.maxPower };
                if (!entry.category && generation >= 4) entry.category = "Status";
                if (entry.struggleRecoil) delete entry.recoil;
                map[entry.id] = entry;
            });
            MOVES_BY_ID.push(map);
        });
        pokedex = calc.SPECIES[settings.gen];
        moves = calc.MOVES[settings.gen];
    }

    function load() {
        if (!loading) {
            loading = Promise.resolve($.getScript("./calc/data/vanilla/base-game-data.js?1"))
                .then(restoreData);
        }
        return loading;
    }

    window.blankDevDefaults = { load: load };
})();
