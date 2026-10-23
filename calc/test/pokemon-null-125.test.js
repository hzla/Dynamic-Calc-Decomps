"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");
var crypto = require("crypto");

function load(relative, binding) {
    var context = {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../..", relative), "utf8"), context);
    return context[binding];
}

var data = load("backups/null125.js", "backup_data");
function set(species, trainer) {
    var matches = Object.entries(data.formatted_sets[species]).filter(function (entry) {
        return entry[0].includes(trainer);
    });
    expect(matches).toHaveLength(1);
    return matches[0][1];
}

describe("Pokemon Null 1.2.5 patch data", function () {
    test("pins every generated artifact to the requested source commit", function () {
        var provenance = JSON.parse(fs.readFileSync(path.join(__dirname, "../../backups/null125-source.json"), "utf8"));
        expect(provenance.commit).toBe("4cae2aa036f2184cb3ea549436bbedae3bc6990f");
        for (var [filename, hash] of Object.entries(provenance.artifacts)) {
            var contents = fs.readFileSync(path.join(__dirname, "../..", filename));
            expect(crypto.createHash("sha256").update(contents).digest("hex")).toBe(hash);
        }
    });

    test("keeps a separate title and trainer order", function () {
        expect(data.title).toBe("Pokemon Null 1.2.5");
        expect(load("backups/title_to_backup_mappings.js", "backupFiles")[data.title]).toBe("null125");
        expect(load("backups/trainer_orders/null125.js", "trainerOrders")[175]).toBeDefined();
    });

    test("uses this commit's learnsets rather than later additions", function () {
        function levelMoves(name) {
            return data.poks[name].learnset_info.learnset.map(function (entry) { return entry[1]; });
        }
        expect(levelMoves("Poliwrath")).not.toContain("Fake Out");
        expect(levelMoves("Articuno")).not.toContain("Flip Turn");
        expect(levelMoves("Pawmot")).not.toContain("Plasma Fists");
        expect(levelMoves("Archaludon")).toEqual(expect.arrayContaining(["Mirror Coat", "Metal Burst"]));
        expect(levelMoves("Archaludon")).not.toContain("Counter");
        expect(data.poks.Archaludon.learnset_info.tms).not.toContain("Counter");
        expect(data.poks["Deoxys-Attack"].abilities[0]).toBe("Scrappy");
    });

    test("exports updated items, levels, statuses and abilities from trainers", function () {
        expect(set("Floette-Eternal", "Charlie").level).toBe(65);
        expect(set("Iron Moth", "Courtney 2").level).toBe(68);
        expect(set("Conkeldurr", "Nob").item).toBe("Flame Orb");
        expect(set("Conkeldurr", "Nob").status).toBeUndefined();
        expect(set("Yveltal", "Zeldest").item).toBe("Apicot Berry");
        expect(set("Iron Jugulis", "Archie 2").item).toBe("Assault Vest");
        expect(set("Kingdra", "Juan").item).toBe("Kee Berry");
        expect(set("Weezing", "Rocket Grunt #2").item).toBe("Ability Shield");
        expect(set("Deoxys-Attack", "Leaf 2").ability).toBe("Scrappy");
    });

    test("takes macro-defined and alternate-form personal data from the ROM", function () {
        expect(data.poks.Oricorio.types).toEqual(["Fire", "Flying"]);
        expect(data.poks.Castform.types).toEqual(["Normal"]);
        expect(data.poks.Silvally.bs).toEqual({hp: 95, at: 95, df: 95, sa: 95, sd: 95, sp: 95});
        expect(data.poks["Basculegion-F"].bs.at).toBe(92);
        expect(data.poks["Basculegion-F"].bs.sa).toBe(100);
        expect(data.poks["Greninja-Ash"].bs.at).toBe(145);
    });

    test.each([
        ["Noctowl", "Lao", "Air Slash"],
        ["Celesteela", "Winona 1", "Air Slash"],
        ["Landorus-Therian", "Winona 1", "Fly"],
        ["Yveltal", "Zeldest", "Dark Pulse"],
        ["Iron Jugulis", "Archie 2", "Earth Power"],
        ["Ogerpon-Hearthflame", "Stephin", "Upper Hand"],
        ["Iron Jugulis", "John & Jay", "Thunderbolt"],
        ["Chi-Yu", "Bethany", "Ruination"],
        ["Kingdra", "Juan", "Laser Focus"],
        ["Blaziken", "Youngster Des", "Thunder Punch"],
        ["Kricketune", "Reli&Ian", "Triple Axel"],
        ["Mawile", "Noland", "Spirit Break"],
        ["Groudon", "Trainer Maxie", "High Horsepower"],
        ["Kyogre", "Trainer Archie", "Whirlpool"]
    ])("exports %s / %s with %s", function (species, trainer, move) {
        expect(set(species, trainer).moves).toContain(move);
    });

    test("preserves partners and marks the new Regenor battle as doubles", function () {
        expect(set("Groudon", "Trainer Maxie").partner).toBe(861);
        expect(set("Kyogre", "Trainer Archie").partner).toBe(860);
        expect(set("Raichu", "Regenor").battle_type).toBe("Doubles");
        expect(set("Raichu-Mega-X", "Regenor").ability).toBe("Motor Drive");
    });

    test("imports 1.2.5 ability slots and Recall Charm without changing old versions", function () {
        function tables(title) {
            var context = {TITLE: title};
            vm.createContext(context);
            ["null_constants.js", "null125_constants.js"].forEach(function (file) {
                vm.runInContext(fs.readFileSync(path.join(__dirname, "../../js/savereaders/save_constants", file), "utf8"), context);
            });
            return context;
        }
        var latest = tables("Pokemon Null 1.2.5");
        var legacy = tables("Pokemon Null 1.2");
        expect(latest.nullItems[689]).toBe("Recall Charm");
        expect(latest.nullAbilities.slowking[0]).toBe("Regenerator");
        expect(latest.nullAbilities.slowking.H).toBe("Shell Armor");
        expect(legacy.nullItems[689]).not.toBe("Recall Charm");
        expect(legacy.nullAbilities.slowking[0]).toBe("Shell Armor");
    });
});
