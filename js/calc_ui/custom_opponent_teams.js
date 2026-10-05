(function () {
    function isEnabled() {
        return window.devDataOverrides && window.devDataOverrides.isDevModeEnabled();
    }

    function getStorageKey() {
        return "calcCustomOpponentTeams:" + window.devDataOverrides.getCurrentSourceId();
    }

    function getStoredTeams() {
        try {
            var teams = JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
            return Array.isArray(teams) ? teams.filter(function (team) {
                return team && typeof team.name === "string" && Number.isFinite(team.trainerId) &&
                    Array.isArray(team.pokemon) && team.pokemon.every(function (pokemon) {
                        return pokemon && typeof pokemon.speciesName === "string" &&
                            typeof pokemon.setName === "string" && pokemon.setData &&
                            typeof pokemon.setData === "object";
                    });
            }) : [];
        } catch (error) {
            console.error("Failed to read custom opponent teams", error);
            return [];
        }
    }

    function applyTeam(team) {
        team.pokemon.forEach(function (pokemon) {
            if (!pokedex[pokemon.speciesName]) return;
            if (!setdex[pokemon.speciesName]) setdex[pokemon.speciesName] = {};
            setdex[pokemon.speciesName][pokemon.setName] = cloneImportedSetData(pokemon.setData);
        });
    }

    function refreshTrainerNames() {
        TR_NAMES = get_trainer_names();
        customLeads = get_custom_trainer_names();
        localStorage.customLeads = JSON.stringify(customLeads);
        syncTrainerAiTagAvailability();
    }

    function loadStoredTeams() {
        if (!isEnabled()) return;
        getStoredTeams().forEach(applyTeam);
        refreshTrainerNames();
    }

    function getSetId(pokemon) {
        return pokemon.speciesName + " (" + pokemon.setName + ")";
    }

    function selectPokemon(pokemon) {
        var setId = getSetId(pokemon);
        var selector = $("#p2 input.set-selector");
        selector.select2("close");
        selector.select2("data", {
            id: setId, text: setId, pokemon: pokemon.speciesName, set: pokemon.setName
        });
        currentTrainerSet = setId;
        selector.change();
    }

    function getSelectedMember(teams) {
        if (!isEnabled()) return null;
        var selectedId = String($("#p2 input.set-selector").val() || "").replace(/\[\d+\]$/, "");
        for (var teamIndex = 0; teamIndex < teams.length; teamIndex++) {
            var team = teams[teamIndex];
            for (var pokemonIndex = 0; pokemonIndex < team.pokemon.length; pokemonIndex++) {
                var pokemon = team.pokemon[pokemonIndex];
                if (getSetId(pokemon) !== selectedId) continue;
                var activeSet = typeof setdex !== "undefined" && setdex[pokemon.speciesName] &&
                    setdex[pokemon.speciesName][pokemon.setName];
                if (!activeSet || !activeSet.isCustomOpponentTeam) return null;
                return { team: team, teamIndex: teamIndex, pokemon: pokemon, pokemonIndex: pokemonIndex };
            }
        }
        return null;
    }

    function refreshRemoveButton() {
        var member = isEnabled() ? getSelectedMember(getStoredTeams()) : null;
        $("#custom-opponent-remove").prop("hidden", !member);
    }

    function removeSelectedPokemon() {
        if (!isEnabled()) return false;
        try {
            var teams = getStoredTeams();
            var member = getSelectedMember(teams);
            if (!member) return false;
            if (!window.confirm("Delete " + member.pokemon.speciesName + " from " + member.team.name + "?")) {
                return false;
            }

            member.team.pokemon.splice(member.pokemonIndex, 1);
            // The first remaining member becomes the trainer lead used by navigation.
            member.team.pokemon.forEach(function (pokemon, index) {
                pokemon.setData.sub_index = index;
            });
            if (!member.team.pokemon.length) teams.splice(member.teamIndex, 1);
            localStorage.setItem(getStorageKey(), JSON.stringify(teams));

            delete setdex[member.pokemon.speciesName][member.pokemon.setName];
            if (!Object.keys(setdex[member.pokemon.speciesName]).length) {
                delete setdex[member.pokemon.speciesName];
            }
            applyTeam(member.team);
            refreshTrainerNames();

            var remainingPokemon = member.team.pokemon.filter(function (pokemon) {
                return !!pokedex[pokemon.speciesName];
            });
            var nextPokemon = remainingPokemon[Math.min(member.pokemonIndex, remainingPokemon.length - 1)];
            if (!nextPokemon) {
                teams.some(function (team) {
                    nextPokemon = team.pokemon.find(function (pokemon) { return !!pokedex[pokemon.speciesName]; });
                    return !!nextPokemon;
                });
            }
            selectPokemon(nextPokemon || { speciesName: member.pokemon.speciesName, setName: "Blank Set" });
            refreshRemoveButton();
            return true;
        } catch (error) {
            window.alert(error.message || "Failed to remove the enemy set.");
            return false;
        }
    }

    function parseTeam(text) {
        var importOptions = getShowdownImportOptions(text);
        var rows = String(text || "").replace(/\r/g, "").split("\n").map(function (row) {
            return row.trim();
        });
        var blocks = [];
        var block = null;
        rows.forEach(function (row, index) {
            if (!row || /^===/.test(row)) {
                block = null;
                return;
            }
            if (isImportedSetBoundaryLine(rows, index, -1, importOptions)) {
                block = [];
                blocks.push(block);
            }
            if (block) block.push(row);
        });

        return blocks.map(function (rows) {
            var header = findImportedSpeciesMatchFromHeader(rows[0], importOptions);
            var speciesName = header.match.speciesName;
            var poke = {
                name: speciesName,
                gender: header.headerInfo.gender,
                item: getItem(header.parts, header.match.index + 1),
                nn: header.match.index > 0 ? header.parts[0].trim() : undefined,
                isCustomSet: true
            };
            getStats(poke, rows, 1, importOptions);
            getMoves(poke, rows, 0, importOptions);
            var imported = buildDexObject(poke, importOptions);
            if (!pokedex[imported.speciesName]) {
                throw new Error(imported.speciesName + " is unavailable in this calc.");
            }
            if (!Number.isFinite(imported.dexObject.level) || imported.dexObject.level < 1 || imported.dexObject.level > 100) {
                throw new Error("Use a level between 1 and 100 for " + imported.speciesName + ".");
            }
            return { speciesName: imported.speciesName, setData: imported.dexObject };
        });
    }

    function importFromText(text) {
        if (!isEnabled()) return false;
        try {
            var pokemon = parseTeam(text);
            if (!pokemon.length) {
                throw new Error("No sets imported. Paste Showdown sets and try again.");
            }
            var teams = getStoredTeams();
            var name = window.prompt("Name this enemy team:", "Enemy Team #" + (teams.length + 1));
            if (name === null) return false;
            name = name.trim();
            if (!name) throw new Error("Enter a name for the enemy team.");
            // These characters delimit set IDs or attributes in the existing trainer UI.
            if (/[()[\]<>"']/.test(name)) {
                throw new Error("Use a team name without brackets, parentheses, angle brackets, or quotes.");
            }

            var usedNames = teams.map(function (team) { return team.name; });
            var trainerId = 0;
            Object.keys(setdex).forEach(function (speciesName) {
                Object.keys(setdex[speciesName]).forEach(function (setName) {
                    var set = setdex[speciesName][setName];
                    usedNames.push(stripTrainerLevelPrefix(setName));
                    trainerId = Math.min(trainerId, Number(set.tr_id) || 0);
                });
            });
            var baseName = name;
            var suffix = 2;
            while (usedNames.includes(name)) name = baseName + " - " + suffix++;
            // Imported teams use negative IDs so they do not collide with ROM trainers.
            teams.forEach(function (team) { trainerId = Math.min(trainerId, team.trainerId); });
            trainerId--;
            var usedSetIds = {};
            pokemon.forEach(function (pokemon, index) {
                var levelPrefix = "Lvl " + pokemon.setData.level;
                var setName = levelPrefix + " " + name;
                while (usedSetIds[pokemon.speciesName + " (" + setName + ")"]) {
                    levelPrefix += "*";
                    setName = levelPrefix + " " + name;
                }
                usedSetIds[pokemon.speciesName + " (" + setName + ")"] = true;
                pokemon.setName = setName;
                pokemon.setData.isCustomOpponentTeam = true;
                pokemon.setData.tr_id = trainerId;
                pokemon.setData.sub_index = index;
            });
            var team = { name: name, trainerId: trainerId, pokemon: pokemon };
            teams.push(team);
            localStorage.setItem(getStorageKey(), JSON.stringify(teams));
            applyTeam(team);
            refreshTrainerNames();

            selectPokemon(pokemon[0]);
            return true;
        } catch (error) {
            window.alert(error.message || "Failed to import the enemy team.");
            return false;
        }
    }

    function showCustomTeamsOnly() {
        return isEnabled() && $("#custom-opponent-teams-only").prop("checked");
    }

    $(document).ready(function () {
        if (!isEnabled()) return;
        $("#custom-opponent-teams-controls").prop("hidden", false);
        $("#custom-opponent-teams-filter").prop("hidden", false);
        $("#custom-opponent-teams-only")
            .prop("checked", localStorage.getItem(getStorageKey() + ":only") === "1")
            .on("change", function () {
                localStorage.setItem(getStorageKey() + ":only", this.checked ? "1" : "0");
                $("#p2 .set-selector").select2("close");
            });
        $(document).on("click", "#import-right", function (event) {
            event.preventDefault();
            importFromText($(".import-team-text").first().val());
        });
        $(document).on("change", "#p2 input.set-selector", refreshRemoveButton);
        $(document).on("click", "#custom-opponent-remove", function (event) {
            event.preventDefault();
            removeSelectedPokemon();
        });
        refreshRemoveButton();
    });

    window.customOpponentTeams = {
        isEnabled: isEnabled,
        loadStoredTeams: loadStoredTeams,
        importFromText: importFromText,
        showCustomTeamsOnly: showCustomTeamsOnly
    };
})();
