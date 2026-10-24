# Gen 4 “View %” move-choice audit

Audit date: 2026-10-23. This covers the move-choice probability analyzer, not the post-KO switch preview.

Reference: local `pokeplatinum` revision `d92f23036b5ef011134ea66d08c83dc77ee99d4c`, particularly:

- `asm/trainer_ai/trainer_ai_script.s` (the scoring program).
- `src/battle/trainer_ai/trainer_ai.c` (commands, damage estimation, trainer flags, final choice).
- `src/battle/battle_lib.c` (damage, type application, speed, move restrictions).
- `include/battle/ai_context.h` (`s8` scores, stored rolls, learned moves/abilities/items).

## Result

The original analyzer was a small heuristic approximation, despite presenting precise percentages. Multiple independent defects explain the community reports. Fixing the priority constant alone would leave substantial errors.

The replacement interprets a generated copy of the Platinum instruction stream and uses a separate move-choice damage estimate. It shows probabilities only when every reached scoring path can be evaluated. It preserves source quirks instead of correcting them to intuitive Pokémon behavior. Results remain conditional on the displayed state and the explicit assumptions described below.

This is a Platinum source comparison, **not proof of every Gen 4 ROM's behavior**. The local Renegade ROM's complete trainer-AI overlay was verified byte-for-byte identical to clean Platinum. Renegade uses its loaded move/species/type data with that script. Other ROM builds or patches that change AI code or item effects require their own comparison. HGSS, Diamond/Pearl, doubles, Platinum Kaizo and Platinum Redux are not represented as validated implementations by this UI.

## Reported Infernape versus Crawdaunt example

Recreated from the screenshot: level 38 Hasty Iron Fist Infernape, 30 IVs, Life Orb; level 40 Careful Adaptability Crawdaunt, the shown IVs, Sitrus Berry, asleep, **60 current HP**. Basic, Evaluate Attacks and Expert are enabled.

| Move | AI maximum damage | Final score | Choice probability |
| --- | ---: | ---: | ---: |
| Close Combat | 140 | 104 | 0% |
| Rock Slide | 30 | 99 | 0% |
| Fire Punch | 27 | 99 | 0% |
| Mach Punch | 60 | 106 | 100% |

`EvalAttack_ScorePlus2` falls through into `EvalAttack_ScorePlus4` (script lines 6402–6406). Priority-effect KO moves therefore receive **+6**, not +2. The old implementation returned after +2. The bonus checks `BATTLE_EFFECT_PRIORITY_1`; it is not a blanket bonus for every positive-priority move.

Evaluate Attacks deliberately uses **maximum AI-estimated damage** for this KO check. A 60-damage maximum against 60 HP qualifies even though the actual battle move only has a small OHKO chance. Selection probability and actual KO probability are different quantities.

## Findings and corrections

| Severity | Finding in original implementation | Source behavior / corrective change |
| --- | --- | --- |
| High | Priority KO was +2 and returned. | Preserve source fall-through: +2 then +4 = +6. |
| High | Normal calculator roll maxima were used as AI damage. | Run the AI estimator: core damage and type application, without actual-move scripts, Life Orb, resist berries, Protect, critical hits or repeated hits. |
| High | Every sufficiently damaging move could earn the KO bonus or enter the highest-damage comparison. | Use `sRiskyMoves` and `sAltPowerCalcMoves` from `trainer_ai.c`. Superpower, Eruption, Dream Eater, charge/recharge moves and several other effects are excluded from these comparisons. Close Combat is eligible. |
| High | A weaker move could receive subsequent risky/quad-effective scoring after its -1 penalty. | The source branches to `ScoreMinus1`, which ends that flag. |
| High | Extra effects such as recharge, Solar Beam and counters were assigned the same random -2 penalty as Explosion. | Eval Attack has only three explicit risky branches: Explosion/Selfdestruct, Focus Punch and Sucker Punch. Other flags have their own rules. |
| High | Only a small part of Basic and Expert was modeled; generic substitutes were used for many effects. | Interpret all 3,581 source instructions, including dispatch tables, jumps, subroutines and fall-through. An unimplemented reached command prevents percentage output. |
| High | Hardcoded effect groupings included incorrect IDs and overlapping unrelated effects. | Generate effect IDs from source; honor the loaded ROM move table's effect data. For example, ATK_UP is 10, ATK_UP_2 is 50, and several old “stat up” entries were unrelated effects. |
| High | Only the first three trainer flags were applied. | Execute the applicable source entry points for ordinary singles flags, including First Turn Setup, Risky, Damage Priority, Baton Pass, Check HP, Weather and Harassment. Partner/special battle flags are explicitly unsupported. |
| High | Branch overflow discarded unvisited branches and truncated groups, while claiming equivalent branches were merged. | Merge identical interpreter states without dropping mass. Combine per-move score distributions analytically. If the work limit is reached, withhold percentages. |
| High | Unavailable trainer metadata could borrow the first unrelated species set, or assume Basic. | Require the selected trainer's actual mask. Do not silently borrow another set or infer a partial mask from badges. |
| Medium | Basic setup penalties inspected any maxed stat; debuffs inspected any minimized stat. | Follow the source's specific stat and exact threshold checks, including multi-stat effects and source bugs. |
| Medium | Explosion was penalized at half HP by Basic. | Basic checks immunity, Damp/Mold Breaker and remaining party members; HP heuristics belong to separate Expert branches. |
| Medium | Protect checkbox was treated as repeated Protect history. | Use the Protect-chain control/history when the script reads it. The current protection flag is not that history. |
| Medium | `hpPercent()` attempted to convert a `curHP` function to a number; `||` also discarded zero HP. | Call `curHP()` and preserve explicit zero values. |
| Medium | Every speed tie was treated as “attacker faster,” and speed context was incomplete. | Source speed order, Simple, weather, items, paralysis, Slow Start, Unburden, Stall, Trick Room and tie outcomes are modeled. A tie command returns FASTER or TIE, rather than FASTER or SLOWER. |
| Medium | Opponent ability and moves were treated as fully known. | Ability loads guess from species ability slots until revealed, as the source does. Known-move and known-item commands require the AI's memory, not the player's full visible moveset. |
| Medium | Inputs reused damage-result clones already changed by Intimidate, Download, Mold Breaker or item processing. | Build fresh combatants from visible fields; do not replay entry abilities in AI damage. |
| Medium | PP, Choice locks and other move restrictions were absent. | Read visible PP; apply supplied Disable, Encore, Taunt, Torment, Imprison, Heal Block, Choice-lock and invalid-mask state, plus visible Gravity. Expose Choice history in the battle-state controls. |
| Medium | All “invalid” moves were treated alike. | The source initializes invalid slots to zero but can still score them. Zero PP prevents scoring entirely. All unavailable slots are reported as forced Struggle. |
| Medium | Scores used unbounded JavaScript arithmetic. | Reproduce the source's signed-byte addition and clamp negative results to zero. |
| Medium | Type effectiveness came from ordinary damage or a simple type product. | Use the source type-application probe and its specific STAB normalization, including Filter, Expert Belt, Tinted Lens and immunity quirks. |
| Medium | The settings toggle was offered for Gen 4 games that the renderer could not handle. | Match UI availability to the supported Platinum family and vanilla mechanics profile. |
| Medium | Assumptions were generated but not rendered. | Display model/state assumptions. Do not display stale/partial score percentages when evaluation fails. |
| Low | A single trace was presented as representing every path ending at a score. | Label it an example trace and attach the corresponding source label and line number. |

## Damage and speed audit details

Move-choice AI and post-KO AI share `BattleSystem_CalcMoveDamage` / `BattleSystem_ApplyTypeChart`, but their callers differ substantially:

- The move-choice attacker is alive: keep its current HP and attacking stages, active Slow Start/Flash Fire, Charge and relevant field state. Its Flower Gift and weather-suppression ability can count.
- Damage remains full-width; do not apply the post-KO preview's byte truncation.
- The AI explicitly handles Natural Gift, Judgment, Hidden Power, Gyro Ball, Dragon Rage, Seismic Toss, Night Shade, Psywave, Return, Frustration, Magnitude, Sonic Boom, Low Kick and Grass Knot. Other moves use table power/type in this estimator.
- Return/Frustration require actual friendship. Low Kick/Grass Knot use the source's inclusive hectogram thresholds. Hidden Power uses the attacker's IVs.
- Weather Ball is unusual: its AI damage estimate uses table power/type, while the type-check command uses its variable type. Clear/suppressed/foggy-weather variable typing is uninitialized in the decompiled source; the preview does not invent a verified answer for that case.
- Fixed damage retains immunity checks and skips ordinary STAB/type damage multipliers.
- Native item/ability/stat modifier order and rounding are shared with the audited core. Life Orb, Metronome boosts, resist berries and critical-hit multipliers are absent from this AI caller.
- The source can make counterintuitive decisions around absorption abilities: Basic checks some of them separately, while the damage helper does not run real hit scripts. The known Dry Skin/Levitate typo in Basic is retained.
- Fling's AI power loader checks Embargo but does not suppress raw Fling power for Klutz. This differs from a generic “item inactive” rule.
- Speed-halving items still halve speed under Klutz/Embargo. Quick Powder doubles Ditto's raw staged speed; Unburden requires no held item.
- Despite the `ignoreQuickClaw` parameter name, AI speed comparisons still read cached Quick Claw activation. Re-rolling independently for each move would destroy correlations; the preview conditions the whole evaluation on that activation state, then averages scenarios when the control is set to automatic.

## Explicit remaining boundaries

These are not claimed as completed or exact:

1. **History is user-supplied, not reconstructed.** A collapsed Battle state editor now supplies first-turn/turn counts, Protect chains, previous moves, revealed moves/ability/item, Choice and other locks, friendship, relevant effects, and Quick Claw activation. Defaults are first turn, friendship 255, no revealed history and no unshown effects. The requested footnote reads: “previous turn history required for fully accurate %s”. API callers can still supply `stateOverrides`; the UI accepts `window.platinumAiStateOverrides`. Battle-state defaults are assumptions, not a recovered turn log.
2. **Party source.** Reserves are read from the selected trainer's preview roster and the player's party preview, excluding one active slot. Reserve HP/status and whether any PP was spent can be edited without changing imported sets. Recorded HP/status and trainer faint markers are used; other reserves default to full HP/PP. Users must include their actual party in the player party preview. Empty previews mean zero reserves.
3. **Implemented party and random commands.** All seven formerly missing singles predicates are now implemented: party status/not-status, wounded/used-PP, reserve damage, super-effective move availability, and previous-battler damage. Psywave and Magnitude use fresh distributions at every CalcDamage call, including their u16 modulo bias. Highest-damage comparisons reuse the current move's draw within one vector, while subsequent commands draw again. Cached 85–100 rolls are shared across commands/moves and integrated by conditioning the whole evaluation (the stock singles script uses the maximum-damage argument). Quick Claw uses the same conditioning approach. Work limits still fail explicitly without dropping probability mass.

    Native quirks retained: fainted reserves count for wounded/PP checks, but not status or damage checks; NotStatus means *any* eligible reserve without the status. Reserve damage uses the active battler's stats/ordinary item, with reserve metadata only for variable-power/type cases. The previous player's move targets the player itself and borrows the AI's IVs. Magnitude's native power 1 excludes it from CalcAllDamage, but direct previous-move calculations still roll it. MOVE_NONE metadata is available for first-turn history checks.
4. **Doubles and special battles.** Partner targeting/scoring, partner speed ranks, roaming, Safari and catch-tutorial action overrides are out of scope for this singles preview. No HGSS/Diamond/Pearl source equivalence is claimed. Modified mechanics profiles are disabled.
5. **Cartridge RNG.** Probabilities integrate uniform independent random draws. They do not predict a particular RNG seed, correlations from its generator, or the less-than-0.002% modulo bias in a three-way tie. This is a probability model, not an RNG manipulation predictor.
6. **ROM patches.** Loaded move/species/type data are used, but the generated script and item-effect table are Platinum's. The local Renegade build's entire AI overlay is verified identical to clean Platinum, but other versions and its item-effect table have not been compared. Unknown custom moves fail explicitly.
7. **Weather Ball source ambiguity.** Clear, foggy or suppressed weather needs ROM-level verification because `TrainerAI_MoveType` can return an uninitialized local in the decompilation.

## Validation and reproducibility

- The community screenshot is reproduced in a unit test and a browser test: Mach Punch 106 / 100%, Close Combat 104 / 0%.
- Unit coverage includes priority-effect discrimination, damage eligibility, early exits, random thresholds, extra trainer flags, stat-specific rules, Explosion party checks, Close Combat speed/HP checks, ability guessing, missing-history failures, PP/restrictions, probability mass, signed scores, native damage modifiers, fixed damage, weather/type probes, weight boundaries and speed rules.
- Probability combination is checked against exhaustive enumeration of score outcomes for one to four moves.
- The generated interpreter instruction arguments and tables match **all 10,607 ROM words** in both local clean Platinum and Renegade. Their entire 62,560-byte trainer-AI overlay is identical (SHA-256 `bb6b71585268cb00d10377bd2f3ba53c597441b154a2ff2c474ade702933687a`). This validates the instruction data, not the JavaScript semantics of every opcode.
- Independently compiled `pokeplatinum` C damage/type functions matched **19,276 living-attacker comparisons** and the existing **19,276 post-KO comparisons**. The fixtures exercise abilities, held items, stages, HP, status, weather and field conditions. This validates those routines on those fixtures; it does not validate every interpreter command or every ROM patch.
- **107 unit tests and 8 browser tests pass.** To reproduce, run the move-AI unit test plus the three Gen 4 switch test files; run `platinumMoveAi.cy.js` and `renegadePlatinum.cy.js` in Cypress.
- Regenerate the instruction data with `python3 tools/ai/build_platinum_ai.py /path/to/pokeplatinum`. The generated file records source revision and script SHA-256. It contains all source flag entry points, tables, effect lists and native move/item metadata.

The ROM check is reproducible with `python3 tools/ai/verify_platinum_script.py /path/to/pokeplatinum game.nds` (requires `ndspy`). No ROM data is distributed with this change.

Verified local ROM SHA-256 values:

- `cleanplat.nds`: `fbce4c4def0c7797f8dd238a3d7a5e48b4a7e3abd86890ac65f6321cef781bdb`
- `renagadeplatinumdex.nds`: `c76667d191a8c9032ced5650ba87206d5286102c83fb85bb7226484283bbf72c`

## Files changed

- `js/calc_ui/move_ai_preview/platinum_ai_preview_core.js`: source-script interpreter, complete-path guards and probability calculation.
- `js/calc_ui/move_ai_preview/platinum_ai_script.js`: generated source program and metadata.
- `js/calc_ui/move_ai_preview/platinum_ai_damage.js`: move-choice estimator and native speed handling.
- `calc/mechanics/gen4-switch.js`: shared core with separate move-choice/post-KO entry points.
- `js/calc_ui/move_ai_preview/platinum_ai_preview_ui.js`: fresh inputs, real trainer mask, supported-game gating and honest result display.
- `js/calc_ui/move_ai_preview/platinum_ai_preview_state.js`, `css/main.css`: compact battle-history and reserve controls; preview-only state and requested footnote.
- `index.html`: load generated program/estimator/state editor and refresh cache keys.
- `tools/ai/build_platinum_ai.py`, `tools/ai/verify_platinum_script.py`, `.gitignore`: reproducible data generation and ROM verification.
- Unit/browser regression tests and this audit.
