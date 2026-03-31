# Move Effect Changes

Compared `pt.js` against `pkv5h.js`.

Found **71** moves where the shared move name has a different `e_id`.

---

## Aeroblast

- Old ID: `43`
- New ID: `36`
- Old Effect: High crit chance (43)
- New Effect: May Paralyze, Burn, or Freeze (Hit) (36)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old RISKY AI (pt.js)

```text
50% of the time, score +2.
```

### New RISKY AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Attack Order

- Old ID: `43`
- New ID: `2`
- Old Effect: High crit chance (43)
- New Effect: May Poison (Hit) (2)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old RISKY AI (pt.js)

```text
50% of the time, score +2.
```

### New RISKY AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Aurora Beam

- Old ID: `68`
- New ID: `17`
- Old Effect: Lowers Target's Atk (Hit) (68)
- New Effect: Guaranteed hit (17)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the user's current accuracy is reduced to -5 or lower, or the target's current evasion is boosted to +5 or more:
  Score +1 and continue

If the user's current accuracy is reduced to -3 or lower, or the target's current evasion is boosted to +3 or more:
  60.9% (156/256) chance of score +1 and terminate
```

---

## Avalanche

- Old ID: `185`
- New ID: `274`
- Old Effect: 2x power if User has been hit this turn (185)
- New Effect: May cause Flinch and/or Freeze (Hit) (274)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
If the target is asleep, infatuated, or confused:
  Score -2 and terminate

With a 70.3% (180/256) chance:
  Score -2 and terminate
Else:
  Score +2 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old RISKY AI (pt.js)

```text
50% of the time, score +2.
```

### New RISKY AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Bide

- Old ID: `26`
- New ID: `227`
- Old Effect: Bide effect (26)
- New Effect: Metal Burst effect (227)

- Changed non-expert AI sections: BASIC AI, RISKY AI

### Old Expert AI (pt.js)

```text
If the user's HP is under 91%:
  Score -2 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the foe is asleep, infatuated, or confused:
  Score -1 and terminate

If the foe knows the move Revenge, Avalanche, Focus Punch, or Vital Throw:
  Score -1 and terminate

If the user's HP is under 31%:
  96.1% (246/256) chance of score -1 and continue

If the user's HP is under 51%:
  60.9% (156/256) chance of score -1 and continue

Unconditionally:
  25% (64/256) chance of score +1 and continue

If the target is under the effect of Taunt, and the last move used by the target deals damage:
  60.9% (156/256) chance of score +1 and continue

If the target is under the effect of Taunt:
  60.9% (156/256) chance of score +1 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Stall, or the target is holding a Shiny Stone:
  Score -10 and terminate

If the user's ability is Stall, or the user is holding a Shiny Stone:
  No scoring change and terminate

If the user will attack before the target:
  Score -10 and terminate
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Blast Burn

- Old ID: `80`
- New ID: `253`
- Old Effect: Requires recharge turn (80)
- New Effect: 1/3 damage recoil and Thaws User; May cause Burn to Target (Hit) (253)

- Changed non-expert AI sections: BASIC AI, EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's ability is Truant:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Flash Fire, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Bounce

- Old ID: `263`
- New ID: `6`
- Old Effect: User charges, becomes invulnerable until attack next turn, may cause Paralysis (263)
- New Effect: May Paralyze (Hit) (6)

### Old Expert AI (pt.js)

```text
If the user is holding a Power Herb:
  Score +2 and terminate

If the target knows the move Protect or Detect:
  Score -1 and terminate

If the effectiveness of the move is 1/4x, 1/2x or 0x:
  Score +1 and terminate

If the target is badly poisoned, or under the effect or Curse or Leech Seed:
  68.8% (176/256) chance of score +1 and terminate

If the current weather is hail and the user is Ice type, or the current weather is sandstorm and the user is Rock, Ground, or Steel type:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target:
  No scoring change and terminate

If the last move used by the target was Lock-On or Mind Reader:
  No scoring change and terminate

Otherwise:
  68.8% (176/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Brave Bird

- Old ID: `198`
- New ID: `182`
- Old Effect: 1/3 damage recoil (198)
- New Effect: Lowers User's Atk and Def (182)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's attack is reduced to -1 or lower:
  Score -1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Clamp

- Old ID: `42`
- New ID: `261`
- Old Effect: Prevents Target from escaping, deals 1/16 Target's max HP damage for 5 turns (Hit) (42)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the target is badly poisoned, or infatuated, or under the effect or Curse, or Perish Song:
  50% (128/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Close Combat

- Old ID: `229`
- New ID: `182`
- Old Effect: Lowers User's Def and Sp. Def (Hit) (229)
- New Effect: Lowers User's Atk and Def (182)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user will move after the target, and the user's HP is under 81%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is under 61%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's attack is reduced to -1 or lower:
  Score -1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Constrict

- Old ID: `70`
- New ID: `0`
- Old Effect: Lowers Target's Speed (Hit) (70)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
If the game version is not Diamond or Pearl, and the effectiveness of the move is 1/2x, 1/4x or 0x:
  No scoring change and terminate

If the user will move before the target:
  Score -3 and terminate

Otherwise:
  72.7% (186/256) chance of score +2 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Crush Grip

- Old ID: `237`
- New ID: `261`
- Old Effect: Higher power the more HP Target has (237)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: BASIC AI, 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x, or the target's HP is under 50%:
  Score -1 and terminate

If the target's HP is full:
  Score +1 and continue

If the target's HP is full, and the user will move before the target:
  Score +1 and continue

If the target's HP is over 85%:
  90.2% (231/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Dig

- Old ID: `256`
- New ID: `0`
- Old Effect: User charges, becomes invulnerable until attack next turn; vulnerable to Move Effect IDs #89, #222 (256)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
If the user is holding a Power Herb:
  Score +2 and terminate

If the target knows the move Protect or Detect:
  Score -1 and terminate

If the effectiveness of the move is 1/4x, 1/2x or 0x:
  Score +1 and terminate

If the target is badly poisoned, or under the effect or Curse or Leech Seed:
  68.8% (176/256) chance of score +1 and terminate

If the current weather is hail and the user is Ice type, or the current weather is sandstorm and the user is Rock, Ground, or Steel type:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target:
  No scoring change and terminate

If the last move used by the target was Lock-On or Mind Reader:
  No scoring change and terminate

Otherwise:
  68.8% (176/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Dive

- Old ID: `255`
- New ID: `0`
- Old Effect: User charges, becomes invulnerable until attack next turn; vulnerable to Move Effect ID #257 (255)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
If the user is holding a Power Herb:
  Score +2 and terminate

If the target knows the move Protect or Detect:
  Score -1 and terminate

If the effectiveness of the move is 1/4x, 1/2x or 0x:
  Score +1 and terminate

If the target is badly poisoned, or under the effect or Curse or Leech Seed:
  68.8% (176/256) chance of score +1 and terminate

If the current weather is hail and the user is Ice type, or the current weather is sandstorm and the user is Rock, Ground, or Steel type:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target:
  No scoring change and terminate

If the last move used by the target was Lock-On or Mind Reader:
  No scoring change and terminate

Otherwise:
  68.8% (176/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Double Slap

- Old ID: `29`
- New ID: `44`
- Old Effect: Multi-hit (2-5 times) (29)
- New Effect: Hits twice (44)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Draco Meteor

- Old ID: `204`
- New ID: `48`
- Old Effect: Harshly Lowers User's Sp. Atk (204)
- New Effect: 1/4 damage recoil (48)

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user will move after the target, and the user's HP is under 81%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is under 61%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

---

## Dragon Claw

- Old ID: `0`
- New ID: `43`
- Old Effect: Hit (0)
- New Effect: High crit chance (43)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Dragon Pulse

- Old ID: `0`
- New ID: `17`
- Old Effect: Hit (0)
- New Effect: Guaranteed hit (17)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the user's current accuracy is reduced to -5 or lower, or the target's current evasion is boosted to +5 or more:
  Score +1 and continue

If the user's current accuracy is reduced to -3 or lower, or the target's current evasion is boosted to +3 or more:
  60.9% (156/256) chance of score +1 and terminate
```

---

## Drill Peck

- Old ID: `0`
- New ID: `43`
- Old Effect: Hit (0)
- New Effect: High crit chance (43)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Drill Run

- Old ID: `38`
- New ID: `43`
- Old Effect: OHKO (38)
- New Effect: High crit chance (43)

- Changed non-expert AI sections: BASIC AI

### Old Expert AI (pt.js)

```text
Unconditionally:
  25% (64/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Sturdy and the user's ability is not Mold Breaker:
  Score -10 and terminate

If the target is a higher level than the user:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Levitate, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

---

## Eruption

- Old ID: `190`
- New ID: `253`
- Old Effect: Higher power the less damage User has taken (190)
- New Effect: 1/3 damage recoil and Thaws User; May cause Burn to Target (Hit) (253)

- Changed non-expert AI sections: BASIC AI, EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user will attack after the target:
  If the target's HP is over 70%:
    No scoring change and terminate
  Else:
    Score -1 and terminate

If the target's HP is over 50%:
  No score change and terminate

Otherwise:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### Old BASIC AI (pt.js)

```text
(No applicable AI procedures)
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Flash Fire, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Extreme Speed

- Old ID: `103`
- New ID: `0`
- Old Effect: Priority +1 (103)
- New Effect: Hit (0)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the move can KO the target:
  Score +6 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Fake Tears

- Old ID: `62`
- New ID: `60`
- Old Effect: Sharply lowers Target's Sp. Def (Status) (62)
- New Effect: Sharply lowers Target's Speed (Status) (60)

- Changed non-expert AI sections: BASIC AI

### Old Expert AI (pt.js)

```text
If the user's HP is under 70%, or the target's special defense is reduced to -3 or lower:
  80.5% (206/256) chance of score -2 and continue

If the target's HP is under 71%:
  Score -2 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the user will move before the target:
  Score -3 and terminate

Otherwise:
  72.7% (186/256) chance of score +2 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's special defense is reduced to -6:
  Score -10 and terminate

If the target's ability is Clear Body or White Smoke:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If Trick Room is currently active:
  Score -10 and terminate

If the target's speed is reduced to -6:
  Score -10 and terminate

If the target's ability is certainly Speed Boost:
  Score -10 and terminate

If the target's ability is Clear Body or White Smoke:
  Score -10 and terminate
```

---

## Fire Spin

- Old ID: `42`
- New ID: `261`
- Old Effect: Prevents Target from escaping, deals 1/16 Target's max HP damage for 5 turns (Hit) (42)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the target is badly poisoned, or infatuated, or under the effect or Curse, or Perish Song:
  50% (128/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Frenzy Plant

- Old ID: `80`
- New ID: `262`
- Old Effect: Requires recharge turn (80)
- New Effect: 1/3 damage recoil, may cause Paralysis (Hit) (262)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's ability is Truant:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Frustration

- Old ID: `123`
- New ID: `0`
- Old Effect: Power based on low Friendship (123)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Fury Cutter

- Old ID: `119`
- New ID: `88`
- Old Effect: 2x power for every consecutive hit (119)
- New Effect: Deals damage equal to User's level x1.5 (88)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Giga Impact

- Old ID: `80`
- New ID: `48`
- Old Effect: Requires recharge turn (80)
- New Effect: 1/4 damage recoil (48)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's ability is Truant:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Heart Swap

- Old ID: `250`
- New ID: `3`
- Old Effect: Swap stat changes (250)
- New Effect: Restore own HP by 1/2 damage dealt (3)

- Changed non-expert AI sections: BASIC AI

### Old Expert AI (pt.js)

```text
If the target's current attack, defense, special attack, special defense, or evasion is boosted to +2 or more, or the target is under the effect of Focus energy:
  If the user's current attack, defense, special attack, or special defense level is at +0 or below:
    Score +1 and terminate

  If the user's current evasion level is at +0 or below:
    Score +2 and terminate

  If the user is not under the effect of Focus Energy:
    Score +1 and terminate

  Otherwise:
    19.5% (50/256) chance of score -2 and terminate

Else:
  Score -2 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  80.5% (206/256) of score -3 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If any of the user's stats are reduced:
  No scoring change and terminate

If any of the target's stats are boosted:
  No scoring change and terminate

Otherwise:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Water Absorb, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

---

## Hydro Cannon

- Old ID: `80`
- New ID: `48`
- Old Effect: Requires recharge turn (80)
- New Effect: 1/4 damage recoil (48)

- Changed non-expert AI sections: BASIC AI, EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's ability is Truant:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Water Absorb, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Hyper Beam

- Old ID: `80`
- New ID: `48`
- Old Effect: Requires recharge turn (80)
- New Effect: 1/4 damage recoil (48)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's ability is Truant:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Ice Ball

- Old ID: `117`
- New ID: `260`
- Old Effect: Double power each turn, locked into move (117)
- New Effect: Always hits in Hail, may cause Freeze (260)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  80.5% (206/256) chance of score -3 and terminate

If the current weather is hail:
  Score +1 and terminate
```

---

## Kinesis

- Old ID: `23`
- New ID: `62`
- Old Effect: Lowers Target's Accuracy (Status) (23)
- New Effect: Sharply lowers Target's Sp. Def (Status) (62)

- Changed non-expert AI sections: BASIC AI

### Old Expert AI (pt.js)

```text
If the user's HP is under 70%, or the target's HP is under 71%:
  60.9% (156/256) chance of score -1 and continue

If the user's accuracy is reduced to -2 or lower:
  68.8% (176/256) chance of score -2 and continue

If the target is badly poisoned:
  72.7% (186/256) chance of score +2 and continue

If the target is under the effect of Leech Seed:
  72.7% (186/256) chance of score +2 and continue

If the user is under the effect of Ingrain or Aqua Ring:
  50% (128/256) chance of score +1 and continue

If the target is under the effect of Curse:
  72.7% (186/256) chance of score +2 and continue

If the user's HP is over 70%, or the target's current accuracy level is +0:
  No scoring change and terminate

If the user's HP is under 40%, or the target's HP is under 40%:
  Score -2 and terminate

Otherwise:
  72.7% (186/256) chance of score -2 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the user's HP is under 70%, or the target's special defense is reduced to -3 or lower:
  80.5% (206/256) chance of score -2 and continue

If the target's HP is under 71%:
  Score -2 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's accuracy is reduced to -6:
  Score -10 and terminate

If the user's ability is No Guard:
  Score -10 and terminate

If the target's ability is No Guard or Keen Eye:
  Score -10 and terminate

If the target's ability is Clear Body or White Smoke:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's special defense is reduced to -6:
  Score -10 and terminate

If the target's ability is Clear Body or White Smoke:
  Score -10 and terminate
```

---

## Leaf Storm

- Old ID: `204`
- New ID: `0`
- Old Effect: Harshly Lowers User's Sp. Atk (204)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user will move after the target, and the user's HP is under 81%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is under 61%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Magma Storm

- Old ID: `42`
- New ID: `261`
- Old Effect: Prevents Target from escaping, deals 1/16 Target's max HP damage for 5 turns (Hit) (42)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the target is badly poisoned, or infatuated, or under the effect or Curse, or Perish Song:
  50% (128/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Megahorn

- Old ID: `0`
- New ID: `43`
- Old Effect: Hit (0)
- New Effect: High crit chance (43)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Memento

- Old ID: `168`
- New ID: `7`
- Old Effect: KOs self and sharply lowers Target's Atk and Sp. Atk (168)
- New Effect: Halves target's defense + KOs self (7)

- Changed non-expert AI sections: BASIC AI, EVALUATE ATKS AI, RISKY AI

### Old Expert AI (pt.js)

```text
If the target's evasion is boosted to +1 or more:
  Score -1 and continue

If the target's evasion is boosted to +3 or more:
  50% (128/256) chance of score -1 and continue

If the user's HP is under 80%, or the user will attack after the target:
  If the user's HP is over 50%:
    80.5% (206/256) chance of score -1 and terminate

  If the user's HP is under 51%:
    50% (128/256) chance of score +1 and continue

  If the user's HP is under 31%:
    80.5% (206/256) chance of score +1 and terminate
Else:
  80.5% (206/256) chance of score -3 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the target's evasion is boosted to +1 or more:
  Score -1 and continue

If the target's evasion is boosted to +3 or more:
  50% (128/256) chance of score -1 and continue

If the user's HP is under 80%, or the user will attack after the target:
  If the user's HP is over 50%:
    80.5% (206/256) chance of score -1 and terminate

  If the user's HP is under 51%:
    50% (128/256) chance of score +1 and continue

  If the user's HP is under 31%:
    80.5% (206/256) chance of score +1 and terminate
Else:
  80.5% (206/256) chance of score -3 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Clear Body or White Smoke and the user's ability is not Mold Breaker:
  Score -10 and terminate

If the target's current attack is reduced to -6:
  Score -10 and terminate

If the target's current special attack is reduced to -6:
  Score -8 and terminate

If the user has no living party members:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Damp, and the user's ability is not Mold Breaker:
  Score -10 and terminate

If the user has other living party members:
  No score change and terminate

If the target has other living party members:
  Score -10 and terminate

Otherwise:
  Score -1 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
Unconditionally:
  80.1% (205/256) chance of score -2 and continue

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Metal Sound

- Old ID: `62`
- New ID: `60`
- Old Effect: Sharply lowers Target's Sp. Def (Status) (62)
- New Effect: Sharply lowers Target's Speed (Status) (60)

- Changed non-expert AI sections: BASIC AI

### Old Expert AI (pt.js)

```text
If the user's HP is under 70%, or the target's special defense is reduced to -3 or lower:
  80.5% (206/256) chance of score -2 and continue

If the target's HP is under 71%:
  Score -2 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the user will move before the target:
  Score -3 and terminate

Otherwise:
  72.7% (186/256) chance of score +2 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Soundproof, and the user's ability is not Mold Breaker:
  Score -10 and terminate

If the target's special defense is reduced to -6:
  Score -10 and terminate

If the target's ability is Clear Body or White Smoke:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Soundproof, and the user's ability is not Mold Breaker:
  Score -10 and terminate

If Trick Room is currently active:
  Score -10 and terminate

If the target's speed is reduced to -6:
  Score -10 and terminate

If the target's ability is certainly Speed Boost:
  Score -10 and terminate

If the target's ability is Clear Body or White Smoke:
  Score -10 and terminate
```

---

## Needle Arm

- Old ID: `31`
- New ID: `0`
- Old Effect: May cause Flinch (Hit) (31)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Outrage

- Old ID: `27`
- New ID: `48`
- Old Effect: Locked into move for 2-3 turns; confuses User after (27)
- New Effect: 1/4 damage recoil (48)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

---

## Overheat

- Old ID: `204`
- New ID: `253`
- Old Effect: Harshly Lowers User's Sp. Atk (204)
- New Effect: 1/3 damage recoil and Thaws User; May cause Burn to Target (Hit) (253)

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user will move after the target, and the user's HP is under 81%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is under 61%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

---

## Petal Dance

- Old ID: `27`
- New ID: `76`
- Old Effect: Locked into move for 2-3 turns; confuses User after (27)
- New Effect: May Confuse (Hit) (76)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Poison Gas

- Old ID: `66`
- New ID: `33`
- Old Effect: Causes Poison (66)
- New Effect: Badly Poisons (33)

- Changed non-expert AI sections: 1ST TURN SETUP AI, HARASS AI

### Old Expert AI (pt.js)

```text
If the user's HP is under 50%, or the target's HP is under 51%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the user has a move that inflicts damage:
  If the user's HP is under 51%:
    80.5% (206/256) chance of score -3 and continue

  If the target's HP is under 51%:
    80.5% (206/256) chance of score -3 and continue

If the user knows the move Protect or Detect:
  76.6% (196/256) chance of score +2 and terminate
```

### Old 1ST TURN SETUP AI (pt.js)

```text
68.75% of the time, score +2.
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old HARASS AI (pt.js)

```text
50% of the time, score +2.
```

### New HARASS AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Power Whip

- Old ID: `0`
- New ID: `43`
- Old Effect: Hit (0)
- New Effect: High crit chance (43)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Psycho Boost

- Old ID: `204`
- New ID: `0`
- Old Effect: Harshly Lowers User's Sp. Atk (204)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user will move after the target, and the user's HP is under 81%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is under 61%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Rage

- Old ID: `81`
- New ID: `128`
- Old Effect: Raises User's Atk when hit; locked into move until User is KO'd or battle ends (81)
- New Effect: If Target switches, hits first with 2x damage (128)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If this is the user's first turn in battle, or the target is Ghost or Psychic type:
  50% (128/256) chance of score +1 and continue

If the target knows the move U-Turn:
  50% (128/256) chance of score +1 and terminate
```

---

## Return

- Old ID: `121`
- New ID: `0`
- Old Effect: Power based on high Friendship (121)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Revenge

- Old ID: `185`
- New ID: `230`
- Old Effect: 2x power if User has been hit this turn (185)
- New Effect: 2x Power if user moves after target (230)

### Old Expert AI (pt.js)

```text
If the target is asleep, infatuated, or confused:
  Score -2 and terminate

With a 70.3% (180/256) chance:
  Score -2 and terminate
Else:
  Score +2 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user will move after the target, and the user's HP is over 29%:
  75% (192/256) chance of score +1 and terminate
```

---

## Rock Wrecker

- Old ID: `80`
- New ID: `104`
- Old Effect: Requires recharge turn (80)
- New Effect: Hit 3 times (104)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's ability is Truant:
  68.8% (176/256) chance of score +1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Rollout

- Old ID: `117`
- New ID: `0`
- Old Effect: Double power each turn, locked into move (117)
- New Effect: Hit (0)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Sand Tomb

- Old ID: `42`
- New ID: `261`
- Old Effect: Prevents Target from escaping, deals 1/16 Target's max HP damage for 5 turns (Hit) (42)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the target is badly poisoned, or infatuated, or under the effect or Curse, or Perish Song:
  50% (128/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Shadow Claw

- Old ID: `43`
- New ID: `29`
- Old Effect: High crit chance (43)
- New Effect: Multi-hit (2-5 times) (29)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old RISKY AI (pt.js)

```text
50% of the time, score +2.
```

### New RISKY AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Sheer Cold

- Old ID: `38`
- New ID: `260`
- Old Effect: OHKO (38)
- New Effect: Always hits in Hail, may cause Freeze (260)

- Changed non-expert AI sections: BASIC AI, RISKY AI

### Old Expert AI (pt.js)

```text
Unconditionally:
  25% (64/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  80.5% (206/256) chance of score -3 and terminate

If the current weather is hail:
  Score +1 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target's ability is Sturdy and the user's ability is not Mold Breaker:
  Score -10 and terminate

If the target is a higher level than the user:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old RISKY AI (pt.js)

```text
50% of the time, score +2.
```

### New RISKY AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Sky Attack

- Old ID: `75`
- New ID: `262`
- Old Effect: User charges this turn, attacks next turn with Flinch chance and high crit chance (75)
- New Effect: 1/3 damage recoil, may cause Paralysis (Hit) (262)

- Changed non-expert AI sections: BASIC AI, EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -2 and terminate

If the user is holding a Power Herb:
  Score +2 and terminate

If the target knows the move Protect or Detect:
  Score -2 and terminate

If the user's HP is under 39%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old BASIC AI (pt.js)

```text
(No applicable AI procedures)
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Sky Uppercut

- Old ID: `207`
- New ID: `149`
- Old Effect: Can hit Target using Move with Move Effect IDs #155, #263 (Hit) (207)
- New Effect: 2x Damage on Pokemon using Bounce/Fly (149)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Slam

- Old ID: `0`
- New ID: `6`
- Old Effect: Hit (0)
- New Effect: May Paralyze (Hit) (6)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Stockpile

- Old ID: `160`
- New ID: `206`
- Old Effect: Stockpile +1, raises Def and Sp. Def; Stacks up to 3 (160)
- New Effect: Raises User's Def and Sp. Def (206)

- Changed non-expert AI sections: BASIC AI, 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the user's current special defense is boosted to +3 or more:
  60.9% (156/256) chance of score -1 and continue

If the user's HP is full and its current special defense is boosted to under +3:
  50% (128/256) chance of score +2 and continue

If the user's HP is over 69%:
  With a 78.1% (200/256) chance:
    No scoring change and terminate

If the user's HP is under 40%:
  Score -2 and terminate

If the last move used by the foe was nondamaging, or the foe has not yet used a move:
  76.6% (196/256) chance of score -2 and terminate

If the last move used by the foe was physical:
  Score -2 and terminate

Otherwise:
  58.6% (2401/4096) chance of score -2 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the user's Stockpile count is 3:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the user's ability is Simple, and its current defense or special defense is boosted to +3 or more:
  Score -10 and terminate

If the user's current defense is boosted to +6:
  Score -10 and terminate

If the user's current special defense is boosted to +6:
  Score -8 and terminate
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Submission

- Old ID: `48`
- New ID: `261`
- Old Effect: 1/4 damage recoil (48)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Sucker Punch

- Old ID: `248`
- New ID: `0`
- Old Effect: Fails if Target selected a status move or has already moved; Moves first (248)
- New Effect: Hit (0)

- Changed non-expert AI sections: BASIC AI, EVALUATE ATKS AI, RISKY AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

Unconditionally:
  75% (192/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old BASIC AI (pt.js)

```text
(No applicable AI procedures)
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
Unconditionally:
  80.1% (205/256) chance of score -2 and continue

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### Old RISKY AI (pt.js)

```text
50% of the time, score +2.
```

### New RISKY AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Superpower

- Old ID: `182`
- New ID: `48`
- Old Effect: Lowers User's Atk and Def (182)
- New Effect: 1/4 damage recoil (48)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's attack is reduced to -1 or lower:
  Score -1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Swallow

- Old ID: `162`
- New ID: `261`
- Old Effect: Healing determined by Stockpile level (162)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: BASIC AI, 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the user's HP is full:
  Score -3 and terminate

If the user will move before the target:
  Score -8 and terminate

If the user's HP is over 69%:
  With a 88.3% (226/256) chance:
    Score -3 and terminate

If the foe knows the move Snatch:
  56.2% (2301/4096) chance of score +2 and terminate

Otherwise:
  92.2% (236/256) chance of score +2 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the effectiveness of the move is 0x:
  Score -10 and terminate

If the user's Stockpile count is 0:
  Score -10 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Take Down

- Old ID: `48`
- New ID: `182`
- Old Effect: 1/4 damage recoil (48)
- New Effect: Lowers User's Atk and Def (182)

- Changed non-expert AI sections: EVALUATE ATKS AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the user's ability is Rock Head or Magic Guard:
  Score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the user's attack is reduced to -1 or lower:
  Score -1 and terminate

If the user will move after the target, and the user's HP is over 59%:
  Score -1 and terminate

If the user will move before the target, and the user's HP is over 40%:
  Score -1 and terminate
```

### Old EVALUATE ATKS AI (pt.js)

```text
If the move can KO the target:
  Score +4 and terminate

If this is a damaging move, and the move cannot KO the target, and a different move the user knows would do more damage to the target:
  Score -1 and terminate

If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

### New EVALUATE ATKS AI (pkv5h.js)

```text
If the effectiveness of the move is 4x (damaging or non damaging):
  68.8% (176/256) chance of score +2 and terminate
```

---

## Teeter Dance

- Old ID: `199`
- New ID: `49`
- Old Effect: Guaranteed Confusion (Hit) (199)
- New Effect: Causes confusion (49)

- Changed non-expert AI sections: BASIC AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the target's HP is over 70%:
  No scoring change and terminate

Unconditionally:
  50% (128/256) chance of score -1 and continue

If the target's HP is under 51%:
  Score -1 and continue

If the target's HP is under 31%:
  Score -1 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the target is already confused:
  Score -5 and terminate

If the target's ability is Own Tempo:
  Score -10 and terminate

If the target is protected by Safeguard:
  Score -10 and terminate
```

---

## Thief

- Old ID: `105`
- New ID: `85`
- Old Effect: User steals Target's held item (105)
- New Effect: Do nothing (85)

### Old Expert AI (pt.js)

```text
If the user is holding an item in the list below:
  80.5% (206/256) chance of score +1 and terminate

Otherwise:
  Score -2 and terminate
Attached list
- Chesto Berry
- Lum Berry
- Berry Juice
- Oran Berry
- BrightPowder
- Lax Incense
- Leftovers
- Light Ball
- Thick Club
- Occa Berry
- Passho Berry
- Wacan Berry
- Rindo Berry
- Yache Berry
- Chople Berry
- Kebia Berry
- Shuca Berry
- Coba Berry
- Payapa Berry
- Tanga Berry
- Charti Berry
- Kasib Berry
- Haban Berry
- Colbur Berry
- Babiri Berry
- Chilan Berry
- Black Sludge
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Thrash

- Old ID: `27`
- New ID: `262`
- Old Effect: Locked into move for 2-3 turns; confuses User after (27)
- New Effect: 1/3 damage recoil, may cause Paralysis (Hit) (262)

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

---

## Twister

- Old ID: `146`
- New ID: `261`
- Old Effect: Can hit target currently in Fly/Bounce, May cause Flinch (Hit) (146)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Vital Throw

- Old ID: `78`
- New ID: `17`
- Old Effect: Priority -1, guaranteed hit (78)
- New Effect: Guaranteed hit (17)

### Old Expert AI (pt.js)

```text
If the user will move after the target, or the user's HP is over 60%:
  No score change and terminate

If the user's HP is under 40%:
  80.5% (206/256) chance of score -1 and terminate

Otherwise:
  23.9% (1957/8192) chance of score -1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the user's current accuracy is reduced to -5 or lower, or the target's current evasion is boosted to +5 or more:
  Score +1 and continue

If the user's current accuracy is reduced to -3 or lower, or the target's current evasion is boosted to +3 or more:
  60.9% (156/256) chance of score +1 and terminate
```

---

## Wrap

- Old ID: `42`
- New ID: `261`
- Old Effect: Prevents Target from escaping, deals 1/16 Target's max HP damage for 5 turns (Hit) (42)
- New Effect: Traps Target; deals 1/16th max HP damage per turn; Can hit Targets using move with Move Effect ID #255 (261)

- Changed non-expert AI sections: 1ST TURN SETUP AI

### Old Expert AI (pt.js)

```text
If the target is badly poisoned, or infatuated, or under the effect or Curse, or Perish Song:
  50% (128/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old 1ST TURN SETUP AI (pt.js)

```text
(No applicable AI procedures)
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
68.75% of the time, score +2.
```

---

## Wring Out

- Old ID: `237`
- New ID: `221`
- Old Effect: Higher power the more HP Target has (237)
- New Effect: 2x power when Target is below 1/2 HP (221)

- Changed non-expert AI sections: BASIC AI

### Old Expert AI (pt.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x, or the target's HP is under 50%:
  Score -1 and terminate

If the target's HP is full:
  Score +1 and continue

If the target's HP is full, and the user will move before the target:
  Score +1 and continue

If the target's HP is over 85%:
  90.2% (231/256) chance of score +1 and terminate
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  Score -1 and terminate

If the target's HP is under 51%:
  Score +1 and continue
  50% (128/256) chance of score +1 and terminate
```

### Old BASIC AI (pt.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate

If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

### New BASIC AI (pkv5h.js)

```text
If the effectiveness of the move is 0x:
  Score -10 and terminate

If the target's ability is Wonder Guard, and the effectiveness of the move is not 2x or 4x, and the user's ability is not Mold Breaker:
  Score -12 and terminate
```

---

## X-Scissor

- Old ID: `0`
- New ID: `43`
- Old Effect: Hit (0)
- New Effect: High crit chance (43)

- Changed non-expert AI sections: RISKY AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the effectiveness of the move is 1/2x, 1/4x, or 0x:
  No scoring change and terminate

If the effectiveness of the move is 2x or 4x:
  50% (128/256) chance of score +1 and terminate

Otherwise:
  25% (64/256) chance of score +1 and terminate
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```

---

## Yawn

- Old ID: `187`
- New ID: `1`
- Old Effect: Causes sleep next turn (187)
- New Effect: Causes Sleep (1)

- Changed non-expert AI sections: 1ST TURN SETUP AI, RISKY AI

### Old Expert AI (pt.js)

```text
(No applicable AI procedures)
```

### New Expert AI (pkv5h.js)

```text
If the user also knows the move Nightmare or Dream Eater:
  50% (128/256) chance of score +1 and terminate
```

### Old 1ST TURN SETUP AI (pt.js)

```text
68.75% of the time, score +2.
```

### New 1ST TURN SETUP AI (pkv5h.js)

```text
(No applicable AI procedures)
```

### Old RISKY AI (pt.js)

```text
(No applicable AI procedures)
```

### New RISKY AI (pkv5h.js)

```text
50% of the time, score +2.
```
