(function(root) {
    "use strict";

    var AI_FLAGS = {
        BASIC: 1 << 0,
        EVAL_ATTACK: 1 << 1,
        EXPERT: 1 << 2
    };

    var EFFECT = {
        HIT: 0,
        SLEEP: 1,
        EXPLOSION: 7,
        DREAM_EATER: 8,
        ATK_DOWN: 18,
        DEF_DOWN: 19,
        FORCE_SWITCH: 28,
        RECOVER_HALF: 32,
        TOXIC: 33,
        LIGHT_SCREEN: 35,
        REST: 37,
        ATK_UP: 50,
        REFLECT: 65,
        POISON: 66,
        PARALYZE: 67,
        RECHARGE: 80,
        DISABLE: 86,
        COUNTER: 89,
        ENCORE: 90,
        PRIORITY_1: 103,
        CURSE: 109,
        PROTECT: 111,
        SPIKES: 112,
        SANDSTORM: 115,
        BATON_PASS: 127,
        HIDDEN_POWER: 135,
        RAIN: 136,
        SUN: 137,
        MIRROR_COAT: 144,
        SOLAR_BEAM: 151,
        FAKE_OUT: 158,
        HAIL: 164,
        BURN: 167,
        FOCUS_PUNCH: 170,
        TAUNT: 175,
        ROOST: 214,
        U_TURN: 228,
        SUCKER_PUNCH: 248,
        TRICK_ROOM: 259,
        STEALTH_ROCK: 266
    };

    var STAT_UP_EFFECTS = {};
    [50, 51, 52, 53, 54, 55, 56, 69, 70, 71, 72, 73, 74, 75, 76, 109, 139, 167, 182, 183, 184, 185, 186, 187, 188, 191, 192].forEach(function(effect) {
        STAT_UP_EFFECTS[effect] = true;
    });

    var STAT_DOWN_EFFECTS = {};
    [18, 19, 20, 21, 22, 23, 24, 59, 60, 61, 62, 63, 64, 65, 69, 70, 190, 193].forEach(function(effect) {
        STAT_DOWN_EFFECTS[effect] = true;
    });

    var RISKY_DAMAGE_EFFECTS = {};
    [EFFECT.EXPLOSION, EFFECT.FOCUS_PUNCH, EFFECT.SUCKER_PUNCH, EFFECT.RECHARGE, EFFECT.SOLAR_BEAM, EFFECT.COUNTER, EFFECT.MIRROR_COAT].forEach(function(effect) {
        RISKY_DAMAGE_EFFECTS[effect] = true;
    });

    function pct(value) {
        return Math.max(0, Math.min(100, Number(value) || 0));
    }

    function hpPercent(mon) {
        var current = Number(mon && (mon.curHP || mon.originalCurHP || mon.hp || mon.currentHP));
        var max = Number(mon && (typeof mon.maxHP === "function" ? mon.maxHP() : mon.maxHP || mon.maxhp || mon.hp));
        if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return 100;
        return Math.floor(current * 100 / max);
    }

    function monStatus(mon) {
        return String((mon && mon.status) || "").toLowerCase();
    }

    function hasStatus(mon) {
        var status = monStatus(mon);
        return !!status && status !== "healthy" && status !== "none" && status !== "undefined";
    }

    function hasType(mon, type) {
        return !!(mon && Array.isArray(mon.types) && mon.types.indexOf(type) !== -1);
    }

    function hasAbility(mon, ability) {
        return String(mon && mon.ability || "") === ability;
    }

    function getMoveName(move) {
        if (!move) return "";
        if (typeof move === "string") return move;
        return move.originalName || move.name || "";
    }

    function cleanMoveName(name) {
        return String(name || "").replace(/^HP /, "Hidden Power ").trim();
    }

    function lookupMoveData(moveTable, moveName) {
        if (!moveTable || !moveName) return null;
        return moveTable[moveName] || moveTable[cleanMoveName(moveName)] || moveTable[String(moveName).replace("Hidden Power", "HP")] || null;
    }

    function normalizeMoveData(move, moveTable, slot) {
        var moveName = cleanMoveName(getMoveName(move));
        var tableData = lookupMoveData(moveTable, moveName) || {};
        var calcMove = typeof move === "object" && move ? move : {};
        var bp = Number.isFinite(Number(tableData.basePower)) ? Number(tableData.basePower)
            : Number.isFinite(Number(tableData.bp)) ? Number(tableData.bp)
            : Number.isFinite(Number(calcMove.basePower)) ? Number(calcMove.basePower)
            : Number.isFinite(Number(calcMove.bp)) ? Number(calcMove.bp)
            : 0;

        return {
            slot: slot,
            moveName: moveName || "(No Move)",
            moveId: Number.isFinite(Number(tableData.id)) ? Number(tableData.id) : null,
            effectId: Number.isFinite(Number(tableData.e_id)) ? Number(tableData.e_id) : null,
            type: tableData.type || calcMove.type || "Normal",
            category: tableData.category || calcMove.category || "Status",
            basePower: bp,
            priority: Number(calcMove.priority || tableData.priority || 0),
            target: tableData.target || tableData.range || calcMove.target || "",
            tableData: tableData,
            valid: !!moveName && moveName !== "(No Move)" && moveName !== "-"
        };
    }

    function damageArrayMax(damage) {
        if (typeof damage === "number") return damage;
        if (!Array.isArray(damage)) return 0;
        var max = 0;
        for (var i = 0; i < damage.length; i++) {
            if (Array.isArray(damage[i])) {
                max += damageArrayMax(damage[i]);
            } else if (Number.isFinite(Number(damage[i]))) {
                max = Math.max(max, Number(damage[i]));
            }
        }
        return max;
    }

    function getDamageInfo(damageResults, slot) {
        var result = damageResults && damageResults[slot];
        var damage = result && result.damage;
        var max = damageArrayMax(damage);
        return {
            result: result,
            maxDamage: max,
            doesDamage: max > 0
        };
    }

    function getEffectiveness(moveInfo, defender, field, damageInfo) {
        if (damageInfo && damageInfo.maxDamage === 0 && moveInfo.basePower > 0) {
            return 0;
        }
        if (typeof root.getCombinedTypeChartEffectiveness === "function") {
            try {
                return root.getCombinedTypeChartEffectiveness(moveInfo.type, defender.types || [], field);
            } catch (err) {
                return 1;
            }
        }
        return 1;
    }

    function cloneTrace(trace) {
        return trace.map(function(entries) {
            return entries.slice();
        });
    }

    function makeInitialBranch(moveCount) {
        var trace = [];
        var scores = [];
        for (var i = 0; i < moveCount; i++) {
            trace.push([]);
            scores.push(100);
        }
        return { probability: 1, scores: scores, trace: trace };
    }

    function addScore(branch, slot, delta, entry) {
        var before = branch.scores[slot];
        var after = Math.max(0, before + delta);
        branch.scores[slot] = after;
        if (delta !== 0) {
            branch.trace[slot].push({
                flag: entry.flag,
                label: entry.label,
                condition: entry.condition,
                delta: delta,
                scoreBefore: before,
                scoreAfter: after
            });
        }
    }

    function deterministic(branches, slot, delta, entry) {
        branches.forEach(function(branch) {
            addScore(branch, slot, delta, entry);
        });
        return branches;
    }

    function splitRandom(branches, slot, chance, delta, entry, capState) {
        chance = Math.max(0, Math.min(1, chance));
        if (chance <= 0) return branches;
        if (chance >= 1) return deterministic(branches, slot, delta, entry);

        var next = [];
        for (var i = 0; i < branches.length; i++) {
            var branch = branches[i];
            var miss = {
                probability: branch.probability * (1 - chance),
                scores: branch.scores.slice(),
                trace: cloneTrace(branch.trace)
            };
            var hit = {
                probability: branch.probability * chance,
                scores: branch.scores.slice(),
                trace: cloneTrace(branch.trace)
            };
            addScore(hit, slot, delta, entry);
            next.push(miss, hit);
            if (next.length > capState.branchCap) {
                capState.exceeded = true;
                return mergeBranches(next, capState.branchCap);
            }
        }
        return next;
    }

    function mergeBranches(branches, limit) {
        var grouped = {};
        for (var i = 0; i < branches.length; i++) {
            var key = JSON.stringify(branches[i].scores) + "|" + branches[i].trace.map(function(t) {
                return t.map(function(e) { return e.flag + ":" + e.label + ":" + e.delta; }).join(",");
            }).join("|");
            if (!grouped[key]) grouped[key] = branches[i];
            else grouped[key].probability += branches[i].probability;
        }
        return Object.keys(grouped).slice(0, limit).map(function(key) { return grouped[key]; });
    }

    function getBoost(mon, stat) {
        var boosts = mon && mon.boosts;
        if (!boosts) return 0;
        return Number(boosts[stat]) || 0;
    }

    function hasAnyMaxBoost(mon) {
        var boosts = mon && mon.boosts;
        if (!boosts) return false;
        return ["atk", "def", "spa", "spd", "spe", "accuracy", "evasion"].some(function(stat) {
            return Number(boosts[stat]) >= 6;
        });
    }

    function hasAnyMinBoost(mon) {
        var boosts = mon && mon.boosts;
        if (!boosts) return false;
        return ["atk", "def", "spa", "spd", "spe", "accuracy", "evasion"].some(function(stat) {
            return Number(boosts[stat]) <= -6;
        });
    }

    function isSideConditionActive(id) {
        if (!root.document) return false;
        var el = root.document.getElementById(id);
        return !!(el && el.checked);
    }

    function applyBasicRule(branches, slot, moveInfo, ctx) {
        var attacker = ctx.attacker;
        var defender = ctx.defender;
        var effectiveness = ctx.effectiveness[slot];
        var e = moveInfo.effectId;

        if (moveInfo.basePower > 0 && effectiveness === 0) {
            return deterministic(branches, slot, -10, {
                flag: "Basic",
                label: "Basic_NoEffect",
                condition: "move has no effect on the target"
            });
        }

        if (e === EFFECT.SLEEP) {
            if (hasStatus(defender) || hasAbility(defender, "Insomnia") || hasAbility(defender, "Vital Spirit")) {
                return deterministic(branches, slot, -10, {
                    flag: "Basic",
                    label: "Basic_CheckCannotSleep",
                    condition: "target cannot be put to sleep"
                });
            }
        } else if (e === EFFECT.TOXIC || e === EFFECT.POISON) {
            if (hasStatus(defender) || hasType(defender, "Poison") || hasType(defender, "Steel") || hasAbility(defender, "Immunity")) {
                return deterministic(branches, slot, -10, {
                    flag: "Basic",
                    label: "Basic_CheckCannotPoison",
                    condition: "target cannot be poisoned"
                });
            }
        } else if (e === EFFECT.PARALYZE) {
            var electricStatusImmune = moveInfo.type === "Electric" && hasType(defender, "Ground");
            if (hasStatus(defender) || hasAbility(defender, "Limber") || effectiveness === 0 || electricStatusImmune) {
                return deterministic(branches, slot, -10, {
                    flag: "Basic",
                    label: "Basic_CheckCannotParalyze",
                    condition: "target cannot be paralyzed"
                });
            }
        } else if (e === EFFECT.BURN) {
            if (hasStatus(defender) || hasType(defender, "Fire") || hasAbility(defender, "Water Veil")) {
                return deterministic(branches, slot, -10, {
                    flag: "Basic",
                    label: "Basic_CheckCannotBurn",
                    condition: "target cannot be burned"
                });
            }
        } else if (STAT_UP_EFFECTS[e] && hasAnyMaxBoost(attacker)) {
            return deterministic(branches, slot, -10, {
                flag: "Basic",
                label: "Basic_CheckHighStatStage",
                condition: "attacker already has a maxed boosted stat"
            });
        } else if (STAT_DOWN_EFFECTS[e] && (hasAnyMinBoost(defender) || hasAbility(defender, "Clear Body") || hasAbility(defender, "White Smoke"))) {
            return deterministic(branches, slot, -10, {
                flag: "Basic",
                label: "Basic_CheckLowStatStage",
                condition: "target stat cannot be lowered usefully"
            });
        } else if ((e === EFFECT.RECOVER_HALF || e === EFFECT.ROOST || e === EFFECT.REST) && hpPercent(attacker) >= 100) {
            return deterministic(branches, slot, -8, {
                flag: "Basic",
                label: "Basic_CheckCanRecoverHP",
                condition: "attacker is already at full HP"
            });
        } else if (e === EFFECT.EXPLOSION && hpPercent(attacker) <= 50) {
            return deterministic(branches, slot, -10, {
                flag: "Basic",
                label: "Basic_CheckCannotExplode",
                condition: "attacker is at half HP or lower"
            });
        } else if (e === EFFECT.LIGHT_SCREEN && isSideConditionActive("lightScreenR")) {
            return deterministic(branches, slot, -8, {
                flag: "Basic",
                label: "Basic_CheckAlreadyUnderLightScreen",
                condition: "AI side already has Light Screen"
            });
        } else if (e === EFFECT.REFLECT && isSideConditionActive("reflectR")) {
            return deterministic(branches, slot, -8, {
                flag: "Basic",
                label: "Basic_CheckAlreadyUnderReflect",
                condition: "AI side already has Reflect"
            });
        } else if (e === EFFECT.PROTECT && isSideConditionActive("protectR")) {
            return deterministic(branches, slot, -10, {
                flag: "Basic",
                label: "Basic_CheckProtectChain",
                condition: "AI is already marked as protected"
            });
        } else if (e === EFFECT.SPIKES && isSideConditionActive("spikesL3")) {
            return deterministic(branches, slot, -10, {
                flag: "Basic",
                label: "Basic_CheckSpikes",
                condition: "target side already has max Spikes"
            });
        } else if (e === EFFECT.STEALTH_ROCK && isSideConditionActive("srL")) {
            return deterministic(branches, slot, -10, {
                flag: "Basic",
                label: "Basic_CheckStealthRock",
                condition: "target side already has Stealth Rock"
            });
        }

        return branches;
    }

    function applyEvalAttackRule(branches, slot, moveInfo, ctx, capState) {
        var damage = ctx.damage[slot];
        var e = moveInfo.effectId;
        if (damage.maxDamage <= 0 && moveInfo.basePower <= 1) return branches;

        if (damage.maxDamage >= ctx.defenderCurrentHp && e !== EFFECT.EXPLOSION) {
            if (e === EFFECT.PRIORITY_1 || moveInfo.priority > 0) {
                return deterministic(branches, slot, 2, {
                    flag: "Evaluate Attacks",
                    label: "EvalAttack_ScorePlus2",
                    condition: "current priority move can KO"
                });
            }
            return deterministic(branches, slot, 4, {
                flag: "Evaluate Attacks",
                label: "EvalAttack_ScorePlus4",
                condition: "current move can KO"
            });
        }

        if (damage.maxDamage < ctx.highestDamage && moveInfo.basePower > 1) {
            branches = deterministic(branches, slot, -1, {
                flag: "Evaluate Attacks",
                label: "EvalAttack_NotHighestDamage",
                condition: "move does not out-damage all other moves"
            });
        }

        if (RISKY_DAMAGE_EFFECTS[e]) {
            branches = splitRandom(branches, slot, 205 / 256, -2, {
                flag: "Evaluate Attacks",
                label: "EvalAttack_RiskyAttack",
                condition: "risky attacking effect"
            }, capState);
        }

        if (ctx.effectiveness[slot] >= 4) {
            branches = splitRandom(branches, slot, 176 / 256, 2, {
                flag: "Evaluate Attacks",
                label: "EvalAttack_TryScorePlus2",
                condition: "move is quad-effective"
            }, capState);
        }

        return branches;
    }

    function attackerKnowsEffect(ctx, effects) {
        return ctx.moves.some(function(moveInfo) {
            return effects.indexOf(moveInfo.effectId) !== -1;
        });
    }

    function applyExpertRule(branches, slot, moveInfo, ctx, capState) {
        var e = moveInfo.effectId;
        var attackerHp = hpPercent(ctx.attacker);
        var defenderHp = hpPercent(ctx.defender);
        var attackerFaster = Number(ctx.attacker && ctx.attacker.stats && ctx.attacker.stats.spe) >= Number(ctx.defender && ctx.defender.stats && ctx.defender.stats.spe);

        if (e === EFFECT.SLEEP && attackerKnowsEffect(ctx, [EFFECT.DREAM_EATER])) {
            return splitRandom(branches, slot, 128 / 256, 1, {
                flag: "Expert",
                label: "Expert_StatusSleep_TryScorePlus1",
                condition: "attacker knows a sleep-dependent move"
            }, capState);
        }

        if (e === EFFECT.DREAM_EATER && (ctx.effectiveness[slot] === 0 || monStatus(ctx.defender).indexOf("sleep") === -1)) {
            return splitRandom(branches, slot, 206 / 256, -3, {
                flag: "Expert",
                label: "Expert_DreamEater",
                condition: "target is not asleep or move is ineffective"
            }, capState);
        }

        if (e === EFFECT.EXPLOSION) {
            if (attackerHp >= 80 && attackerFaster) {
                return splitRandom(branches, slot, 206 / 256, -3, {
                    flag: "Expert",
                    label: "Expert_Explosion_CheckUserHighHP",
                    condition: "attacker is healthy and faster"
                }, capState);
            }
            if (attackerHp > 50) {
                return splitRandom(branches, slot, 206 / 256, -1, {
                    flag: "Expert",
                    label: "Expert_Explosion_TryScoreMinus1",
                    condition: "attacker is above half HP"
                }, capState);
            }
            if (attackerHp <= 30) {
                return splitRandom(branches, slot, 206 / 256, 1, {
                    flag: "Expert",
                    label: "Expert_Explosion_CheckUserLowHP",
                    condition: "attacker is at low HP"
                }, capState);
            }
            return splitRandom(branches, slot, 128 / 256, 1, {
                flag: "Expert",
                label: "Expert_Explosion_CheckUserMediumHP",
                condition: "attacker is at medium HP"
            }, capState);
        }

        if ((e === EFFECT.RECOVER_HALF || e === EFFECT.ROOST || e === EFFECT.REST) && attackerHp <= 50) {
            return splitRandom(branches, slot, 156 / 256, 2, {
                flag: "Expert",
                label: "Expert_Recovery",
                condition: "attacker is at half HP or lower"
            }, capState);
        }

        if (e === EFFECT.PROTECT) {
            if (defenderHp <= 30 || hasStatus(ctx.defender)) {
                return splitRandom(branches, slot, 171 / 256, 2, {
                    flag: "Expert",
                    label: "Expert_Protect_ScorePlus2",
                    condition: "protect can buy a useful turn"
                }, capState);
            }
            return splitRandom(branches, slot, 128 / 256, -1, {
                flag: "Expert",
                label: "Expert_Protect",
                condition: "protect has no obvious immediate value"
            }, capState);
        }

        if (STAT_UP_EFFECTS[e] && attackerHp > 70) {
            return splitRandom(branches, slot, 156 / 256, 1, {
                flag: "Expert",
                label: "Expert_StatusStatUp",
                condition: "attacker has enough HP to set up"
            }, capState);
        }

        if ((e === EFFECT.TOXIC || e === EFFECT.POISON || e === EFFECT.BURN || e === EFFECT.PARALYZE || e === EFFECT.SLEEP) && defenderHp > 50) {
            return splitRandom(branches, slot, 128 / 256, 1, {
                flag: "Expert",
                label: "Expert_StatusMove",
                condition: "target has enough HP for status to matter"
            }, capState);
        }

        if (e === EFFECT.STEALTH_ROCK || e === EFFECT.SPIKES) {
            return splitRandom(branches, slot, 128 / 256, 1, {
                flag: "Expert",
                label: e === EFFECT.STEALTH_ROCK ? "Expert_StealthRock" : "Expert_Spikes",
                condition: "entry hazard setup"
            }, capState);
        }

        if (e === EFFECT.U_TURN && ctx.damage[slot].maxDamage > 0) {
            return splitRandom(branches, slot, 128 / 256, 1, {
                flag: "Expert",
                label: "Expert_UTurn",
                condition: "pivoting move deals damage"
            }, capState);
        }

        return branches;
    }

    function finalize(branches, moveInfos) {
        var moveResults = moveInfos.map(function(moveInfo) {
            return {
                slot: moveInfo.slot,
                moveName: moveInfo.moveName,
                moveId: moveInfo.moveId,
                effectId: moveInfo.effectId,
                probability: 0,
                outcomes: []
            };
        });

        branches.forEach(function(branch) {
            var maxScore = -1;
            var winners = [];
            for (var i = 0; i < moveInfos.length; i++) {
                if (!moveInfos[i].valid) continue;
                if (branch.scores[i] > maxScore) {
                    maxScore = branch.scores[i];
                    winners = [i];
                } else if (branch.scores[i] === maxScore) {
                    winners.push(i);
                }
            }
            if (!winners.length) return;
            winners.forEach(function(slot) {
                moveResults[slot].probability += branch.probability / winners.length;
            });
            for (var j = 0; j < moveInfos.length; j++) {
                moveResults[j].outcomes.push({
                    finalScore: branch.scores[j],
                    probability: branch.probability,
                    trace: branch.trace[j]
                });
            }
        });

        moveResults.forEach(function(moveResult) {
            var grouped = {};
            moveResult.outcomes.forEach(function(outcome) {
                var key = String(outcome.finalScore);
                if (!grouped[key]) {
                    grouped[key] = {
                        finalScore: outcome.finalScore,
                        probability: 0,
                        trace: outcome.trace
                    };
                }
                grouped[key].probability += outcome.probability;
                if (outcome.trace.length > grouped[key].trace.length) {
                    grouped[key].trace = outcome.trace;
                }
            });
            moveResult.outcomes = Object.keys(grouped).map(function(key) {
                return grouped[key];
            }).sort(function(a, b) {
                return b.probability - a.probability || b.finalScore - a.finalScore;
            });
        });

        return moveResults;
    }

    function evaluate(input) {
        input = input || {};
        var warnings = [];
        var assumptions = [];
        var attacker = input.attacker;
        var defender = input.defender;
        var moveTable = input.moveTable || {};
        var damageResults = input.damageResults || [];
        var options = input.options || {};
        var branchCap = Number(options.branchCap) || 2048;
        var aiMask = Number(input.aiMask);

        if (!attacker || !defender) {
            return { supported: false, warnings: ["Missing attacker or defender."], moves: [], assumptions: [] };
        }
        if (!Number.isFinite(aiMask)) {
            aiMask = AI_FLAGS.BASIC;
            assumptions.push("AI mask unavailable; assuming Basic only.");
        }

        var moves = (attacker.moves || []).slice(0, 4).map(function(move, slot) {
            return normalizeMoveData(move, moveTable, slot);
        });
        while (moves.length < 4) {
            moves.push(normalizeMoveData(null, moveTable, moves.length));
        }

        moves.forEach(function(moveInfo) {
            if (moveInfo.valid && moveInfo.effectId === null) {
                warnings.push(moveInfo.moveName + " is missing e_id; effect-specific AI is limited.");
            }
            if (moveInfo.valid && moveInfo.moveId === null) {
                assumptions.push(moveInfo.moveName + " move id inferred by name only.");
            }
        });

        var damage = moves.map(function(_, slot) {
            return getDamageInfo(damageResults, slot);
        });
        var highestDamage = damage.reduce(function(max, info) {
            return Math.max(max, info.maxDamage || 0);
        }, 0);
        var effectiveness = moves.map(function(moveInfo, slot) {
            return getEffectiveness(moveInfo, defender, input.field, damage[slot]);
        });

        var branches = [makeInitialBranch(moves.length)];
        var capState = { branchCap: branchCap, exceeded: false };
        var ctx = {
            attacker: attacker,
            defender: defender,
            field: input.field,
            moves: moves,
            damage: damage,
            highestDamage: highestDamage,
            effectiveness: effectiveness,
            defenderCurrentHp: Number(defender.originalCurHP || defender.curHP || (typeof defender.maxHP === "function" ? defender.maxHP() : defender.hp) || 0)
        };

        moves.forEach(function(moveInfo, slot) {
            if (!moveInfo.valid) {
                branches.forEach(function(branch) {
                    branch.scores[slot] = 0;
                    branch.trace[slot].push({
                        flag: "Basic",
                        label: "InvalidMove",
                        condition: "empty or invalid move slot",
                        delta: -100,
                        scoreBefore: 100,
                        scoreAfter: 0
                    });
                });
                return;
            }

            if (aiMask & AI_FLAGS.BASIC) {
                branches = applyBasicRule(branches, slot, moveInfo, ctx);
            }
            if (aiMask & AI_FLAGS.EVAL_ATTACK) {
                branches = applyEvalAttackRule(branches, slot, moveInfo, ctx, capState);
            }
            if (aiMask & AI_FLAGS.EXPERT) {
                branches = applyExpertRule(branches, slot, moveInfo, ctx, capState);
            }
        });

        if (capState.exceeded) {
            warnings.push("AI random branches exceeded the exact preview cap; equivalent branches were merged.");
        }
        if (!input.stateOverrides || !input.stateOverrides.hasOwnProperty("turnCount")) {
            assumptions.push("Turn count unavailable; using current visible state only.");
        }
        assumptions.push("Switch and item choices are not included; preview is conditional on the AI choosing Fight.");

        return {
            supported: true,
            warnings: warnings,
            moves: finalize(branches, moves),
            assumptions: assumptions
        };
    }

    var api = {
        AI_FLAGS: AI_FLAGS,
        evaluate: evaluate,
        _private: {
            normalizeMoveData: normalizeMoveData,
            damageArrayMax: damageArrayMax,
            finalize: finalize
        }
    };

    root.PlatinumMoveAiPreview = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
