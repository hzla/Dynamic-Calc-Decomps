# Expert AI effect explanations


## Effect 1: Causes Sleep

Start
  - If the attacker has a move with the following effect: Damages sleeping target; heals user up to 50% of damage dealt, jump to Function 4
  - If the attacker has a move with the following effect: If asleep; target takes damage equal to 1/4 its max HP at the end of every turn, jump to Function 4
  - If the defender has a move with the following effect: Sleep Talk effect, jump to Function 2
  - If the defender has a move with the following effect: Reflects status moves back at their user, jump to Function 3
  - If the defender has a move with the following effect: Can only be used while asleep; chance of causing Flinch, jump to Function 3
  - Get the defender's ability
  - If it's No Guard, jump to Function 4
  - If it's Early Bird, jump to Function 3
  - Jump to End

Function 2
  - Change Score: -1

Function 3
  - 50% chance to jump to End
  - Change Score: -1
  - Jump to End

Function 4
  - 50% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 3: Damages target; heals user up to 50% of damage dealt

Start
  - Check Move Type Effectiveness: 0, jump to Function 1
  - Check Move Type Effectiveness: 1.2, jump to Function 1
  - Check Move Type Effectiveness: 1.4, jump to Function 1
  - Get the defender's ability
  - If it's Liquid Ooze, jump to Function 1
  - Jump to Function 2

Function 1
  - 19.5% chance to jump to Function 2
  - Change Score: -3

Function 2
  - END

## Effect 7: Selfdestruct/ Explosion effect

Start
  - If the defender's Evasion stat is under 7, jump to Function 1
  - Change Score: -1
  - If the defender's Evasion stat is under 10, jump to Function 1
  - 50% chance to jump to Function 1
  - Change Score: -1

Function 1
  - If the attacker's HP% < 80%, jump to Function 2
  - If Player is faster, jump to Function 2
  - 19.5% chance to jump to Function 5
  - Jump to AI_DEC3

Function 2
  - If the attacker's HP% > 50%, jump to Function 4
  - 50% chance to jump to Function 3
  - Change Score: +1

Function 3
  - If the attacker's HP% > 30%, jump to Function 5
  - 50% chance to jump to Function 5
  - Change Score: +1
  - Jump to Function 5

Function 4
  - 19.5% chance to jump to Function 5
  - Change Score: -1

Function 5
  - END

Function table

## Effect 8: Damages sleeping target; heals user up to 50% of damage dealt

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng1
  - Check Move Type Effectiveness: 1.2, jump to Function Ng1
  - Get the defender's ability
  - If it's Liquid Ooze, jump to Function ng
  - If Player has the status condition: Asleep
  - Jump to End

Function ok
  - 19.9% chance to jump to End
  - Change Score: +3
  - Jump to End

Function ng
  - 19.5% chance to jump to Function ng1
  - Change Score: -2

Function ng1
  - 19.5% chance to jump to End
  - Change Score: -1

End
  - END

## Effect 9: Mirror Move effect

Start
  - If Player is faster, jump to Function 1
  - Check last move used by Player
  - If it's in the table:: Expertai 9 Table, jump to Function 1
  - 50% chance to jump to Function 3
  - Change Score: 2
  - Jump to Function 3

Function 1
  - Check last move used by Player
  - If Table Jump: Expertai 9 Table, jump to Function 3
  - 31.2% chance to jump to Function 3
  - Change Score: -1

Function 3
  - END

Function Table

## Effect 10: Raises Atk

Start
  - If the attacker's Atk stat is under 9, jump to Function 1
  - 39.1% chance to jump to Function 3
  - Change Score: -1
  - Jump to Function 3

Function 1
  - If the attacker's HP% != 100%, jump to Function 3
  - If the attacker has a move with the following effect: Baton Pass effect, jump to Function 2
  - 50% chance to jump to Function 3

Function 2
  - Change Score: 2

Function 3
  - If the attacker's HP% > 70%, jump to End
  - If the attacker's HP% < 40%, jump to Function 4
  - 15.6% chance to jump to End

Function 4
  - Change Score: -2

End
  - END

## Effect 11: Raises Def

Start
  - If the attacker's Def stat is under 9, jump to Function 1
  - 39.1% chance to jump to Function 2
  - Change Score: -1
  - Jump to Function 2

Function 1
  - If the attacker's HP% != 100%, jump to Function 2_2
  - If the attacker has a move with the following effect: Baton Pass effect, jump to Function 2
  - 50% chance to jump to Function 2_2

Function 2
  - Change Score: 2

Function 2
  - If the attacker's HP% < 70%, jump to Function 3
  - 78.1% chance to jump to End

Function 3
  - If the attacker's HP% < 40%, jump to Function 5
  - Check last move used by Player
  - Check Damage
  - If it's 0, jump to Function 4
  - Check Last Move Category
  - If it's Special, jump to Function 5
  - 23.4% chance to jump to End

Function 4
  - 23.4% chance to jump to End

Function 5
  - Change Score: -2

End
  - END

## Effect 12: Raises Spd

Start
  - If Player is faster, jump to Function 1
  - Change Score: -3
  - Jump to End

Function 1
  - If the attacker has a move with the following effect: Chance to Flinch, jump to Function 2
  - If the attacker has a move with the following effect: Restores up to Heal% max HP, jump to Function 2
  - If the attacker has a move with the following effect: Causes Sleep and restores all HP, jump to Function 2
  - If the attacker has a move with the following effect: Synthesis effect, jump to Function 2
  - If the attacker has a move with the following effect: Roost effect, jump to Function 2
  - If the attacker has a move with the following effect: Substitute effect, jump to Function 2
  - If the attacker has a move with the following effect: Pain Split effect, jump to Function 2
  - If the attacker has a move with the following effect: Causes flinch and 2x damage if target has used Minimize, jump to Function 2
  - If the attacker has a move with the following effect: Destiny Bond effect, jump to Function 2
  - If the attacker has a move with the following effect: Baton Pass effect, jump to Function 2
  - Jump to Function 3

Function 2
  - 27.3% chance to jump to Function 3
  - Change Score: 2

Function 3
  - 27.3% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 13: Raises SpAtk

Start
  - If the attacker's SpAtk stat is under 9, jump to Function 1
  - 39.1% chance to jump to Function 2
  - Change Score: -1
  - Jump to Function 2

Function 1
  - If the attacker's HP% != 100%, jump to Function 2
  - If the attacker has a move with the following effect: Baton Pass effect, jump to Function 1_2
  - 50% chance to jump to Function 2

Function 2
  - Change Score: 2

Function 2
  - If the attacker's HP% > 70%, jump to End
  - If the attacker's HP% < 40%, jump to Function 3
  - 27.3% chance to jump to End

Function 3
  - Change Score: -2

End
  - END

## Effect 14: Raises SpDef

Start
  - If the attacker's Spedef stat is under 9, jump to Function 1
  - 39.1% chance to jump to Function 2
  - Change Score: -1
  - Jump to Function 2

Function 1
  - If the attacker's HP% != 100%, jump to Function 2
  - If the attacker has a move with the following effect: Baton Pass effect, jump to Function 1_2
  - 50% chance to jump to Function 2

Function 2
  - Change Score: 2

Function 2
  - If the attacker's HP% < 70%, jump to Function 3
  - 78.1% chance to jump to End

Function 3
  - If the attacker's HP% < 40%, jump to Function 5
  - Check last move used by Player
  - Check Damage
  - If it's 0, jump to Function 4
  - Check Last Move Category
  - If it's Physical, jump to Function 5
  - 23.4% chance to jump to End

Function 4
  - 23.4% chance to jump to End

Function 5
  - Change Score: -2

End
  - END

## Effect 15: Raises Move Accuracy

Start
  - If the attacker's HP stat is under 9, jump to Function 1
  - 19.5% chance to jump to Function 1
  - Change Score: -2

Function 1
  - If the attacker's HP% > 70%, jump to End
  - Change Score: -2

End
  - END

## Effect 16: Raises Evasion

Start
  - Get the attacker's ability
  - If it's No Guard, jump to Function ng
  - Get the defender's ability
  - If it's No Guard, jump to Function ng
  - Check last move used by Player
  - Check Move
  - If it's 17, jump to Function ng
  - If it's 235, jump to Function ng
  - If it's 272, jump to Function ng
  - If AI has the status condition: Cursed
  - If AI has the status condition: Foresight
  - Check Weather
  - If it's not Weather Rain, jump to Function arare
  - Check last move used by Player
  - Check Move
  - If it's 152, jump to Function ng

Function arare
  - Check Weather
  - If it's not Weather Hail, jump to Function weather_end
  - Check last move used by Player
  - Check Move
  - If it's 260, jump to Function ng

End
  - If the attacker has a move with the following effect: Restores up to Heal% max HP, jump to Function 1
  - If the attacker has a move with the following effect: Synthesis effect, jump to Function 1
  - If the attacker has a move with the following effect: Raises Def and 2x Rollout/ Ice Ball power, jump to Function 1
  - If the attacker has a move with the following effect: Swallow effect, jump to Function 1
  - If the attacker has a move with the following effect: Roost effect, jump to Function 1
  - Get the attacker's ability
  - If it's Magic Guard, jump to Function 1
  - If AI has the status condition: Leech Seeded
  - If the attacker is badly poisoned, jump to Function atk_poison
  - If AI has the status condition: Poisoned
  - If AI has the status condition: Burned
  - Jump to Function 1

Function doku
  - Get the attacker's ability
  - If it's Poison Heal, jump to Function atk_poison_ok
  - Jump to Function atk_ng

Function ok
  - 19.5% chance to jump to Function 1
  - Change Score: 1
  - Jump to Function 1

Function ng
  - 19.5% chance to jump to Function 1
  - Change Score: -1

Function 1
  - If AI has the status condition: Ingrained
  - If AI does not have the status condition: Aqua Ring
  - If the attacker is holding Leftovers, jump to Function atk_ok
  - If it's not Weather Rain, jump to Function 2
  - Get the attacker's ability
  - If it's Dry Skin, jump to Function atk_ok
  - If it's Rain Dish, jump to Function atk_ok
  - Jump to Function 2

Function ok
  - 19.5% chance to jump to Function 2
  - Change Score: 1

Function 2
  - Get the defender's ability
  - If it's Magic Guard, jump to Function 3
  - If Player has the status condition: Cursed
  - If the defender has a move with the following effect: Restores up to Heal% max HP, jump to Function 3
  - If the defender has a move with the following effect: Synthesis effect, jump to Function 3
  - If the defender has a move with the following effect: Raises Def and 2x Rollout/ Ice Ball power, jump to Function 3
  - If the defender has a move with the following effect: Swallow effect, jump to Function 3
  - If the defender has a move with the following effect: Roost effect, jump to Function 3
  - If Player has the status condition: Leech Seeded
  - If Player has the status condition: Burned
  - If the defender is badly poisoned, jump to Function def_poison
  - If Player has the status condition: Poisoned
  - If it's not Weather Sun, jump to Function 3
  - Get the defender's ability
  - If it's Dry Skin, jump to Function def_ok
  - Jump to Function 3

Function doku
  - Get the defender's ability
  - If it's Poison Heal, jump to Function 3
  - Jump to Function def_ok

Function ok
  - 19.5% chance to jump to Function 3
  - Change Score: 1
  - Jump to Function 3

Function 3
  - If the attacker's Evasion stat is under 9, jump to Function 4
  - If the attacker's HP% > 70%, jump to Function 4
  - 19.5% chance to jump to Function 4
  - Change Score: -1

Function 4
  - If the attacker does NOT have a move with the following effect: Baton Pass effect, jump to Function 5
  - If the attacker's HP% < 70%, jump to Function 5
  - 19.5% chance to jump to Function 5
  - Change Score: 1

Function 5
  - If the attacker's HP% > 50%, jump to End
  - 27.3% chance to jump to End

Function ng
  - Change Score: -2

End
  - END

## Effect 17: Always hits

Start
  - If the defender's Evasion stat is over 10, jump to Function 1
  - If the attacker's HP stat is under 2, jump to Function 1
  - If the defender's Evasion stat is at +3 or more, jump to Function 2
  - If the attacker's HP stat is under 4, jump to Function 2
  - Jump to End

Function 1
  - Change Score: 1

Function 2
  - 39.1% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 18: Lowers Atk

Start
  - If the defender's Atk stat is 6, jump to Function 2
  - Change Score: -1
  - If the attacker's HP% > 90%, jump to Function 1
  - Change Score: -1

Function 1
  - If the defender's Atk stat is over 3, jump to Function 2
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's HP% > 70%, jump to Function 3
  - Change Score: -2

Function 3
  - Check Last Move Category
  - If it's not Special, jump to End
  - 50% chance to jump to End
  - Change Score: -2

End
  - END

Function Table

## Effect 19: Lowers Def

Start
  - If the attacker's HP% < 70%, jump to Function 1
  - If the defender's Def stat is over 3, jump to Function 2

Function 1
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's HP% > 70%, jump to End
  - Change Score: -2

End
  - END

## Effect 20: Lowers Spd

Start
  - If Player is faster, jump to Function 1
  - Change Score: -3
  - Jump to End

Function 1
  - 27.3% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 21: Lowers SpAtk

Start
  - If the defender's SpAtk stat is 6, jump to Function 2
  - Change Score: -1
  - If the attacker's HP% > 90%, jump to Function 1
  - Change Score: -1

Function 1
  - If the defender's SpAtk stat is over 3, jump to Function 2
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's HP% > 70%, jump to Function 3
  - Change Score: -2

Function 3
  - Check Last Move Category
  - If it's not Physical, jump to End
  - 50% chance to jump to End
  - Change Score: -2

End
  - END

Function Table

## Effect 22: Lowers SpDef

Start
  - If the attacker's HP% < 70%, jump to Function 1
  - If the defender's Spedef stat is over 3, jump to Function 2

Function 1
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's HP% > 70%, jump to End
  - Change Score: -2

End
  - END

## Effect 23: Lowers Move Accuracy

Start
  - If the attacker's HP% < 70%, jump to Function 2
  - If the defender's HP% > 70%, jump to Function 3

Function 2
  - 39.1% chance to jump to Function 3
  - Change Score: -1

Function 3
  - If the attacker's HP stat is over 4, jump to Function 4
  - 31.2% chance to jump to Function 4
  - Change Score: -2

Function 4
  - If the defender is NOT badly poisoned, jump to Function 5
  - 27.3% chance to jump to Function 5
  - Change Score: 2

Function 5
  - If Player does not have the status condition: Leech Seeded
  - 27.3% chance to jump to Function 6
  - Change Score: 2

Function 6
  - If AI does not have the status condition: Ingrained
  - 50% chance to jump to Function 7
  - Change Score: 1
  - Jump to Function 7

Function 1
  - If AI does not have the status condition: Aqua Ring
  - 50% chance to jump to Function 7
  - Change Score: 1

Function 7
  - If Player does not have the status condition: Cursed
  - 27.3% chance to jump to Function 8
  - Change Score: 2

Function 8
  - If the attacker's HP% > 70%, jump to End
  - If the defender's HP stat is 6, jump to End
  - If the attacker's HP% < 40%, jump to Function 9
  - If the defender's HP% < 40%, jump to Function 9
  - 27.3% chance to jump to End

Function 9
  - Change Score: -2

End
  - END

## Effect 24: Lowers Evasion

Start
  - If the attacker's HP% < 70%, jump to Function 1
  - If the defender's Evasion stat is over 3, jump to Function 2

Function 1
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's HP% > 70%, jump to End
  - Change Score: -2

End
  - END

## Effect 25: Resets stat changes

Start
  - If the attacker's Atk stat is at +3 or more, jump to Function 1
  - If the attacker's Def stat is at +3 or more, jump to Function 1
  - If the attacker's SpAtk stat is at +3 or more, jump to Function 1
  - If the attacker's Spedef stat is at +3 or more, jump to Function 1
  - If the attacker's Evasion stat is at +3 or more, jump to Function 1
  - If the defender's Atk stat is under 4, jump to Function 1
  - If the defender's Def stat is under 4, jump to Function 1
  - If the defender's SpAtk stat is under 4, jump to Function 1
  - If the defender's Spedef stat is under 4, jump to Function 1
  - If the defender's HP stat is under 4, jump to Function 1
  - Jump to Function 2

Function 1
  - 19.5% chance to jump to Function 2
  - Change Score: -3

Function 2
  - If the defender's Atk stat is at +3 or more, jump to Function 3
  - If the defender's Def stat is at +3 or more, jump to Function 3
  - If the defender's SpAtk stat is at +3 or more, jump to Function 3
  - If the defender's Spedef stat is at +3 or more, jump to Function 3
  - If the defender's Evasion stat is at +3 or more, jump to Function 3
  - If the attacker's Atk stat is under 4, jump to Function 3
  - If the attacker's Def stat is under 4, jump to Function 3
  - If the attacker's SpAtk stat is under 4, jump to Function 3
  - If the attacker's Spedef stat is under 4, jump to Function 3
  - If the attacker's HP stat is under 4, jump to Function 3
  - 19.5% chance to jump to Function 4
  - Change Score: -1
  - Jump to Function 4

Function 3
  - 19.5% chance to jump to Function 4
  - Change Score: 3

Function 4
  - END

## Effect 26: Bide effect

Start
  - If the attacker's HP% > 90%, jump to Function 1
  - Change Score: -2

Function 1
  - END

## Effect 28: Whirlwind/ Roar effect

Start
  - Check Slowstart Turn: Check Defence
  - If it's over 3, jump to Function ok1
  - If Sideeff: Check Defence, Field Condition Makibisi, jump to Function 1
  - If Sideeff: Check Defence, Field Condition Stealthrock, jump to Function 1
  - If Sideeff: Check Defence, Field Condition Poisonbisi, jump to Function 1
  - If the defender's Atk stat is at +3 or more, jump to Function 1
  - If the defender's Def stat is at +3 or more, jump to Function 1
  - If the defender's SpAtk stat is at +3 or more, jump to Function 1
  - If the defender's Spedef stat is at +3 or more, jump to Function 1
  - If the defender's Evasion stat is at +3 or more, jump to Function 1
  - Change Score: -3
  - Jump to End

Function ok1
  - 25% chance to jump to Function 1
  - Change Score: 2

Function 1
  - 50% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 30: Changes user's type to match one of its moves

Start
  - If the attacker's HP% > 90%, jump to Function 1
  - Change Score: -2

Function 1
  - Check Turn
  - If it's 0, jump to End
  - 78.1% chance to jump to AI_DEC2

End
  - END

## Effect 32: Restores up to Heal% max HP

Start
  - If the attacker's HP% == 100%, jump to Function 2
  - If Player is faster, jump to Function 3
  - Change Score: -8
  - Jump to End

Function 1
  - If the attacker's HP% < 50%, jump to Function 4
  - If the attacker's HP% > 80%, jump to Function 2
  - 27.3% chance to jump to Function 4

Function 2
  - Change Score: -3
  - Jump to End

Function 3
  - If the attacker's HP% < 70%, jump to Function 4
  - 11.7% chance to jump to Function 4
  - Change Score: -3
  - Jump to End

Function 4
  - If the defender does NOT have a move with the following effect: If any Pokemon uses a beneficial status move; the user uses it instead, jump to Function 5
  - 39.1% chance to jump to End

Function 5
  - 7.8% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 33: Badly Poisons

Start
  - If not Have Damage Move: Function 2
  - If the attacker's HP% > 50%, jump to Function 1
  - 19.5% chance to jump to Function 1
  - Change Score: -3

Function 1
  - If the defender's HP% > 50%, jump to Function 2
  - 19.5% chance to jump to Function 2
  - Change Score: -3

Function 2
  - If the attacker has a move with the following effect: Raises SpDef, jump to Function 3
  - If the attacker has a move with the following effect: Protect/ Detect effect, jump to Function 3
  - Jump to End

Function 3
  - 23.4% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 35: 1/2 damage from Special attacks

Start
  - If the attacker's HP% < 50%, jump to Function 2
  - If the attacker's HP% < 90%, jump to Function 1
  - 11.7% chance to jump to Function 1
  - Change Score: 1

Function 1
  - If Dmg Physic Over: Check Defence, jump to Function 2
  - 25% chance to jump to End
  - Change Score: 1
  - Jump to End

Function 2
  - 11.7% chance to jump to End
  - Change Score: -2

End
  - END

## Effect 37: Causes Sleep and restores all HP

Start
  - If Player is faster, jump to Function 3
  - If the attacker's HP% != 100%, jump to Function 1
  - Change Score: -8
  - Jump to End

Function 1
  - If the attacker's HP% < 40%, jump to Function 5
  - If the attacker's HP% > 50%, jump to Function 2
  - 27.3% chance to jump to Function 5

Function 2
  - Change Score: -3
  - Jump to End

Function 3
  - If the attacker's HP% < 60%, jump to Function 5
  - If the attacker's HP% > 70%, jump to Function 4
  - 19.5% chance to jump to Function 5

Function 4
  - Change Score: -3
  - Jump to End

Function 5
  - If the defender does NOT have a move with the following effect: If any Pokemon uses a beneficial status move; the user uses it instead, jump to Function 6
  - 19.5% chance to jump to End

Function 6
  - 3.9% chance to jump to End
  - Change Score: 3

End
  - END

## Effect 38: OHKO

Start
  - 75% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 39: Charging turn; high crit ratio

Start

## Effect 40: Deals damage equal to 1/2 target's current hp

Start
  - If the defender's HP% > 60%, jump to End
  - Change Score: -1

End
  - END

## Effect 42: Binding move effect

Start
  - If the defender is badly poisoned, jump to Function inc
  - If Player has the status condition: Cursed
  - If Player has the status condition: Perish Song
  - If Player has the status condition: Infatuated
  - Jump to End

Function inc
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 43: High crit ratio

Start

Function 1
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 48: Recoil% damage dealt to self

Start

## Effect 49: Guaranteed Confusion

Start
  - If the defender's HP% > 70%, jump to End
  - 50% chance to jump to Function 1
  - Change Score: -1

Function 1
  - If the defender's HP% > 50%, jump to End
  - Change Score: -1
  - If the defender's HP% > 30%, jump to End
  - Change Score: -1

End
  - END

## Effect 50: Sharply raises Atk

Start

## Effect 51: Sharply raises Def

Start

## Effect 52: Sharply raises Spd

Start

## Effect 53: Sharply raises SpAtk

Start

## Effect 54: Sharply raises SpDef

Start

## Effect 55: Sharply raises Move Accuracy

Start

## Effect 56: Sharply raises Evasion

Start

## Effect 58: Sharply lowers Atk

Start

## Effect 59: Sharply lowers Def

Start

## Effect 60: Sharply lowers Spd

Start

## Effect 61: Sharply lowers SpAtk

Start

## Effect 62: Sharply lowers SpDef

Start

## Effect 63: Sharply lowers Move Accuracy

Start

## Effect 64: Sharply lowers Evasion

Start

## Effect 65: 1/2 damage from Physical attacks

Start
  - If the attacker's HP% < 50%, jump to Function 2
  - If the attacker's HP% < 90%, jump to Function 1
  - 11.7% chance to jump to Function 1
  - Change Score: 1

Function 1
  - If Dmg Physic Under: Check Defence, jump to Function 2
  - 25% chance to jump to End
  - Change Score: 1
  - Jump to End

Function 2
  - 11.7% chance to jump to End
  - Change Score: -2

End
  - END

## Effect 66: Guaranteed Poison

Start
  - If the attacker's HP% < 50%, jump to Function 1
  - If the defender's HP% > 50%, jump to End

Function 1
  - Change Score: -1

End
  - END

## Effect 67: Guaranteed Paralysis

Start
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 70%, jump to End
  - Change Score: -1
  - Jump to End

Function 1
  - 7.8% chance to jump to End
  - Change Score: 3

End
  - END

## Effect 70: Lowers Spd

Start
  - Check Move Type Effectiveness: 0, End
  - If Moveno: Icy Wind, Start
  - If Moveno: Rock Tomb, Start
  - If Moveno: Mud Shot, Start
  - If Moveno: Low Sweep, Start
  - If Moveno: Electroweb, Start
  - If Moveno: Bulldoze, Start
  - If Moveno: Glaciate, Start
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, End
  - END

End
  - END

## Effect 75: Attacks next turn; chance of flinch; increased crit ratio

Start

## Effect 78: Vital Throw effect

Start
  - If Player is faster, End
  - If the attacker's HP% > 60%, jump to End
  - If the attacker's HP% < 40%, jump to Function 2
  - 70.3% chance to jump to End

Function 2
  - 19.5% chance to jump to End
  - Change Score: -1

End
  - END

## Effect 79: Substitute effect

Start
  - If not Have Move: Check Attack, Focus Punch, jump to Function Hp
  - 37.5% chance to jump to Function hp
  - Change Score: +1

Function hp
  - If the attacker's HP% > 90%, jump to Function 3
  - If the attacker's HP% > 70%, jump to Function 2
  - If the attacker's HP% > 50%, jump to Function 1
  - 39.1% chance to jump to Function 1
  - Change Score: -1

Function 1
  - 39.1% chance to jump to Function 2
  - Change Score: -1

Function 2
  - 39.1% chance to jump to Function 3
  - Change Score: -1

Function 3
  - If Player is faster, End
  - Check last move used by Player
  - Check Move
  - If it's 1, jump to Function 6
  - If it's 33, jump to Function 6
  - If it's 66, jump to Function 6
  - If it's 67, jump to Function 6
  - If it's 167, jump to Function 6
  - If it's 49, jump to Function 7
  - If it's 84, jump to Function 8
  - Jump to End

Function 6
  - If AI is healthy, jump to Function Ok
  - Jump to End

Function 7
  - If Player does not have the status condition: Confused
  - Jump to End

Function 8
  - If Player has the status condition: Leech Seeded

Function ok
  - 39.1% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 80: Recharge turn

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Get the attacker's ability
  - If it's Truant, jump to Function ok
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 40%, jump to Function ng
  - Jump to End

Function ok
  - 31.2% chance to jump to End
  - Change Score: +1
  - Jump to End

Function 1
  - If the attacker's HP% < 60%, jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 84: Leech Seed effect

Start

## Effect 86: Disables last move used for 4-7 turns

Start
  - If Player is faster, End
  - Check last move used by Player
  - Check Damage
  - If it's 0, jump to Function 1
  - Change Score: 1
  - Jump to End

Function 1
  - 39.1% chance to jump to End
  - Change Score: -1

End
  - END

## Effect 89: 2x last amount of damage received

Start
  - If Player has the status condition: Asleep
  - If Player has the status condition: Infatuated
  - If Player has the status condition: Confused
  - If the attacker's HP% > 30%, jump to Function 1
  - 3.9% chance to jump to Function 1
  - Change Score: -1

Function 1
  - If the attacker's HP% > 50%, jump to Function 2
  - 39.1% chance to jump to Function 2
  - Change Score: -1

Function 2
  - If AI has the move, Mirror Coat, jump to Function 6
  - Check last move used by Player
  - Check Damage
  - If it's 0, jump to Function 4
  - If not Taunted: Function 3
  - 39.1% chance to jump to Function 3
  - Change Score: 1

Function 3
  - Check Last Move Category
  - If it's not Physical, jump to Function ng

Function 2
  - 39.1% chance to jump to End
  - Change Score: 1
  - Jump to End

Function 4
  - If not Taunted: Function 5
  - 39.1% chance to jump to Function 5
  - Change Score: 1

Function 5
  - Get defender's Type1
  - If Table Jump: Expertai 89 Table, End
  - Get defender's Type2
  - If Table Jump: Expertai 89 Table, End
  - 19.5% chance to jump to End

Function 6
  - 39.1% chance to jump to Function 6_end
  - Change Score: 4

End
  - END

Function ng
  - Change Score: -1

End
  - END

Function Table

## Effect 90: Locks target into last move used for 3-7 turns

Start
  - If Player has the status condition: Disabled
  - If Player is faster, jump to Function 6
  - Check last move used by Player
  - Check Move
  - If it's in the table:: Expertai 90 Table, jump to Function 6

Function 1
  - 11.7% chance to jump to End
  - Change Score: 3
  - Jump to End

Function 6
  - Change Score: -2

End
  - END

Function Table

## Effect 91: Pain Split effect

Start
  - If the defender's HP% < 80%, jump to Function 2
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 40%, jump to Function 2
  - Change Score: 1
  - Jump to End

Function 1
  - If the attacker's HP% > 60%, jump to Function 2
  - Change Score: 1
  - Jump to End

Function 2
  - Change Score: -1

End
  - END

## Effect 92: Can only be used while asleep; chance of causing Flinch

Start
  - Change Score: 2
  - END

## Effect 94: Next move used by user guaranteed to hit

Start
  - 50% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 97: Sleep Talk effect

Start
  - If AI has the status condition: Asleep
  - Change Score: -5
  - END

## Effect 98: Destiny Bond effect

Start
  - Change Score: -1
  - If Player is faster, End
  - If the attacker's HP% > 70%, jump to End
  - 50% chance to jump to Function 1
  - Change Score: 1

Function 1
  - If the attacker's HP% > 50%, jump to End
  - 50% chance to jump to Function 2
  - Change Score: 1

Function 2
  - If the attacker's HP% > 30%, jump to End
  - 39.1% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 99: Higher power the less HP the user has

Start
  - If Player is faster, jump to Function 2
  - If the attacker's HP% > 33%, jump to Function ng
  - If the attacker's HP% > 20%, jump to End
  - If the attacker's HP% < 8%, jump to Function ok1
  - Jump to Function ok2

Function 2
  - If the attacker's HP% > 60%, jump to Function ng
  - If the attacker's HP% > 40%, jump to End
  - Jump to Function ok2

Function ok1
  - Change Score: 1

Function ok2
  - 39.1% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 102: Heal Bell effect

Start
  - If Player is statused, End
  - If AI has party member statused, End
  - Change Score: -5

End
  - END

## Effect 105: Steals target's held item

Start
  - Check AI Held Item
  - If it's in the table:: Expertai 105 Table, jump to Function Ng
  - 19.5% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -2

End
  - END

Function Table

## Effect 106: Prevents target from switching out or fleeing

Start

## Effect 108: Raises Evasion; weak to Stomp/Rollout/Bodyslam

Start

## Effect 109: Curse effect

Start
  - Get attacker's Type1
  - If it's Ghost, jump to Function 4
  - Get attacker's Type2
  - If it's Ghost, jump to Function 4
  - If the attacker's Def stat is over 9, jump to End
  - If AI has the move, Gyro Ball, jump to Function Zyairo
  - If AI has the move, Trick Room, jump to Function Zyairo
  - Jump to Function nozyairo

## Effect 111: Protect/ Detect effect

Start
  - If the player has the move, Feint, jump to Function Mamoriyaburi
  - If the player has the move, Shadow Force, jump to Function Mamoriyaburi
  - Jump to Function mamoriyaburanai

Function mamoriyaburi
  - 50% chance to jump to Function mamoriyaburanai
  - Change Score: -2

Function mamoriyaburanai
  - Check Mamoru Count: Check Attack
  - If it's over 1, jump to Function ng2
  - If the attacker is badly poisoned, jump to Function ng1
  - If AI has the status condition: Cursed
  - If AI has the status condition: Perish Song
  - If AI has the status condition: Infatuated
  - If AI has the status condition: Leech Seeded
  - If AI has the status condition: Sleepy
  - If Player has the status condition: Cursed
  - If Player has the status condition: Perish Song
  - If the defender has a move with the following effect: Restores up to Heal% max HP, jump to Function ng1
  - If the defender has a move with the following effect: Raises Def and 2x Rollout/ Ice Ball power, jump to Function ng1
  - If the defender has a move with the following effect: Synthesis effect, jump to Function ng1
  - If the defender has a move with the following effect: Swallow effect, jump to Function ng1
  - If the defender has a move with the following effect: Roost effect, jump to Function ng1
  - If the defender is badly poisoned, jump to Function ok
  - If Player has the status condition: Infatuated
  - If Player has the status condition: Leech Seeded
  - If Player has the status condition: Sleepy
  - If AI has the status condition: Cannot Miss
  - 33.2% chance to jump to Function ok
  - Jump to Function 1

Function ok
  - Change Score: 2

Function 1
  - 50% chance to jump to Function 1_2
  - Change Score: -2

Function 2
  - Check Mamoru Count: Check Attack
  - If it's 0, jump to End
  - Change Score: -1
  - 50% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ng1
  - If AI has the status condition: Cannot Miss

Function ng2
  - Change Score: -2

End
  - END

## Effect 112: Spikes effect

Start
  - 50% chance to jump to End
  - Change Score: +1
  - If AI has the move, Roar, jump to Function Ok
  - If AI has the move, Whirlwind, jump to Function Ok
  - Jump to End

Function ok
  - 25% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 113: Ignores type immunities

Start
  - Get attacker's Type1
  - If it's Ghost, jump to Function ok1
  - Get attacker's Type2
  - If it's Ghost, jump to Function ok1
  - If the defender's Evasion stat is at +3 or more, jump to Function ok2
  - Change Score: -2
  - Jump to End

Function ok1
  - 31.2% chance to jump to End

Function ok2
  - 31.2% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 116: Allows user to endure a fatal hit and survive at 1 HP

Start
  - If the attacker's HP% < 4%, jump to Function ng
  - If the attacker's HP% < 35%, jump to Function ok

Function ng
  - Change Score: -1
  - Jump to End

Function ok
  - 27.3% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 118: Sharply raises target's Atk and causes Confusion

Start
  - If AI has the move, Psych Up, Expertai Ibaruanzicombo

## Effect 120: Infatuates target of opposite gender

Start

## Effect 127: Baton Pass effect

Start
  - If the attacker's Atk stat is at +3 or more, jump to Function 1
  - If the attacker's Def stat is at +3 or more, jump to Function 1
  - If the attacker's SpAtk stat is at +3 or more, jump to Function 1
  - If the attacker's Spedef stat is at +3 or more, jump to Function 1
  - If the attacker's Evasion stat is at +3 or more, jump to Function 1
  - Jump to Function 5

Function 1
  - If Player is faster, jump to Function 2
  - If the attacker's HP% > 60%, jump to End
  - Jump to Function 3

Function 2
  - If the attacker's HP% > 70%, jump to End

Function 3
  - 31.2% chance to jump to End
  - Change Score: 2
  - Jump to End

Function 5
  - If the attacker's Atk stat is at +2 or more, jump to Function 6
  - If the attacker's Def stat is at +2 or more, jump to Function 6
  - If the attacker's SpAtk stat is at +2 or more, jump to Function 6
  - If the attacker's Spedef stat is at +2 or more, jump to Function 6
  - If the attacker's Evasion stat is at +2 or more, jump to Function 6
  - Jump to Function ng

Function 6
  - If Player is faster, jump to Function 7
  - If the attacker's HP% > 60%, jump to Function ng
  - Jump to End

Function 7
  - If the attacker's HP% < 70%, jump to End

Function ng
  - Change Score: -2

End
  - END

## Effect 128: Pursuit effect

Start
  - Check Fake Out: Check Attack
  - If it's not 0, jump to Function ok1
  - Get defender's Type1
  - If it's Ghost, jump to Function ok1
  - Get defender's Type1
  - If it's Psychic, jump to Function ok1
  - Get defender's Type2
  - If it's Ghost, jump to Function ok1
  - Get defender's Type2
  - If it's Psychic, jump to Function ok1
  - Jump to Function ok2

Function ok1
  - 50% chance to jump to Function ok2
  - Change Score: 1

Function ok2
  - If not Have Move: Check Defence, U-Turn, End
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 132: Synthesis effect

Start

## Effect 133: 133

Start

## Effect 134: 134

Start
  - Check Weather
  - If it's Weather Hail, jump to Function 1
  - If it's Weather Rain, jump to Function 1
  - If it's Weather Sand, jump to Function 1
  - Jump to Start

Function 1
  - Change Score: -2

## Effect 136: Causes Rain

Start
  - If AI is faster, jump to Function 1
  - Get the attacker's ability
  - If it's Swift Swim, jump to Function ok

Function 1
  - If the attacker's HP% < 40%, jump to Function ng
  - Check Weather
  - If it's Weather Hail, jump to Function ok
  - If it's Weather Sun, jump to Function ok
  - If it's Weather Sand, jump to Function ok
  - Get the attacker's ability
  - If it's Rain Dish, jump to Function ok
  - If it's Dry Skin, jump to Function ok
  - If it's not Hydration, jump to End
  - If Player is statused, jump to Function Ok
  - Jump to End

Function ok
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 137: Causes Harsh Sunlight

Start
  - If the attacker's HP% < 40%, jump to Function ng
  - Check Weather
  - If it's Weather Hail, jump to Function ok
  - If it's Weather Rain, jump to Function ok
  - If it's Weather Sand, jump to Function ok
  - Get the attacker's ability
  - If it's Flower Gift, jump to Function ok
  - If it's not Leaf Guard, jump to End
  - If Player is statused, jump to Function Ok
  - Jump to End

Function ok
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 142: Belly Drum effect

Start
  - If the attacker's HP% < 90%, jump to Function ng
  - Jump to End

Function ng
  - Change Score: -2

End
  - END

## Effect 143: Copies all of target's stat boosts

Start
  - If the defender's Atk stat is at +3 or more, jump to Function 1
  - If the defender's Def stat is at +3 or more, jump to Function 1
  - If the defender's SpAtk stat is at +3 or more, jump to Function 1
  - If the defender's Spedef stat is at +3 or more, jump to Function 1
  - If the defender's Evasion stat is at +3 or more, jump to Function 1
  - Jump to Function ng

Function 1
  - If the attacker's Atk stat is under 7, jump to Function ok2
  - If the attacker's Def stat is under 7, jump to Function ok2
  - If the attacker's SpAtk stat is under 7, jump to Function ok2
  - If the attacker's Spedef stat is under 7, jump to Function ok2
  - If the attacker's Evasion stat is under 7, jump to Function ok1
  - 19.5% chance to jump to End
  - Jump to Function ng

Function ok1
  - Change Score: 1

Function ok2
  - Change Score: 1
  - END

Function ng
  - Change Score: -2

End
  - END

## Effect 144: Mirror Coat effect

Start
  - If Player has the status condition: Asleep
  - If Player has the status condition: Infatuated
  - If Player has the status condition: Confused
  - If the attacker's HP% > 30%, jump to Function 1
  - 3.9% chance to jump to Function 1
  - Change Score: -1

Function 1
  - If the attacker's HP% > 50%, jump to Function 2
  - 39.1% chance to jump to Function 2
  - Change Score: -1

Function 2
  - If AI has the move, Counter, jump to Function 6
  - Check last move used by Player
  - Check Damage
  - If it's 0, jump to Function 4
  - If not Taunted: Function 3
  - 39.1% chance to jump to Function 3
  - Change Score: 1

Function 3
  - Check Last Move Category
  - If it's not Special, jump to Function ng

Function 2
  - 39.1% chance to jump to End
  - Change Score: 1
  - Jump to End

Function 4
  - If not Taunted: Function 5
  - 39.1% chance to jump to Function 5
  - Change Score: 1

Function 5
  - Get defender's Type1
  - If Table Jump: Expertai 144 Table, End
  - Get defender's Type2
  - If Table Jump: Expertai 144 Table, End
  - 19.5% chance to jump to End

Function 6
  - 39.1% chance to jump to Function 6_end
  - Change Score: 4

End
  - END

Function ng
  - Change Score: -1

End
  - END

Function Table

## Effect 145: Raises Def; attacks next turn

Start

## Effect 151: Charging turn unless in Harsh Sunlight

Start

Function hare
  - Check Weather
  - If it's not Weather Sun, jump to Function itemcheck
  - Change Score: +2
  - Jump to End

Function itemcheck
  - If the attacker is holding Power Herb, jump to Function 1_item
  - Jump to Function 1_noitem

Function item
  - Change Score: +2
  - Jump to End

Function noitem
  - If the defender has a move with the following effect: Protect/ Detect effect, jump to Function ng1
  - If the attacker's HP% > 38%, jump to End
  - Change Score: -1
  - Jump to End

Function ng1
  - Change Score: -2

End
  - END

## Effect 152: Always hits in rain; chance to Paralyze

Start
  - Check Move Type Effectiveness: 0, jump to Function 1
  - Check Move Type Effectiveness: 1.2, jump to Function 1
  - Check Move Type Effectiveness: 1.4, jump to Function 1
  - Check Weather
  - If it's Weather Sun, jump to Function 1
  - If it's not Weather Rain, jump to Function 2
  - Change Score: +1
  - Jump to Function 2

Function 1
  - 19.5% chance to jump to Function 2
  - Change Score: -3

Function 2
  - END

## Effect 155: Fly effect

Start
  - If the attacker is holding Power Herb, jump to Function 1_item
  - If the defender does NOT have a move with the following effect: Protect/ Detect effect, jump to Function 1
  - Change Score: -1
  - Jump to End

Function 1
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - If the attacker is holding Power Herb, jump to Function 1_item
  - Jump to Function 1_noitem

Function item
  - Change Score: +1
  - Jump to End

Function noitem
  - If AI is faster, jump to Function 1 Iban Pass
  - If the attacker's HP% > 24%, jump to Function 1_IBAN_PASS
  - If the attacker is holding Custap Berry, jump to Function ok

Function PASS
  - If the defender is badly poisoned, jump to Function ok
  - If Player has the status condition: Cursed
  - If Player has the status condition: Leech Seeded
  - Check Weather
  - If it's Weather Sand, jump to Function 2
  - If it's Weather Hail, jump to Function 3
  - Jump to Function 4

Function 2
  - Get attacker's Type1
  - If Table Jump: Expertai 155 Table, jump to Function Ok
  - Get attacker's Type2
  - If Table Jump: Expertai 155 Table, jump to Function Ok
  - Jump to Function 4

Function 3
  - Get attacker's Type1
  - If it's Ice, jump to Function ok
  - Get attacker's Type2
  - If it's Ice, jump to Function ok
  - Jump to Function 4

Function 4
  - If Player is faster, End
  - Check last move used by Player
  - Check Move
  - If it's not 94, jump to Function ok
  - Jump to End

Function ok
  - 31.2% chance to jump to End
  - Change Score: 1

End
  - END

Function ng
  - Change Score: 1
  - END

Function Table

## Effect 157: 157

Start

## Effect 158: Guaranteed Flinch; can only be used turn 1

Start
  - Change Score: 2

End
  - END

## Effect 160: Stockpile effect

Start
  - If the attacker's HP% != 100%, jump to Function 2_2
  - If the attacker has a move with the following effect: Baton Pass effect, jump to Function 2
  - 50% chance to jump to Function 2_2

Function 2
  - Change Score: 2

Function 2
  - If the attacker's HP% < 70%, jump to Function 3
  - 78.1% chance to jump to End

Function 3
  - If the attacker's HP% < 40%, jump to Function 5
  - 23.4% chance to jump to End

Function 5
  - Change Score: -2

End
  - END

## Effect 161: Spit Up effect

Start
  - Check AI Stockpile Count
  - If it's under 2, jump to End
  - 31.2% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 162: Swallow effect

Start

## Effect 164: Causes Hail

Start
  - If the attacker's HP% < 40%, jump to Function ng
  - Check Weather
  - If it's Weather Sun, jump to Function ok
  - If it's Weather Rain, jump to Function ok
  - If it's Weather Sand, jump to Function ok
  - Jump to End

Function ok
  - Change Score: 1

Function hubuki
  - If not Have Move: Check Attack, Blizzard, jump to Function Aisubodhi
  - Change Score: 2

Function aisubodhi
  - Get the attacker's ability
  - If it's not Ice Body, jump to End
  - Change Score: 2
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 166: Raises target's SpAtk and causes Confusion

Start
  - 50% chance to jump to Start
  - Change Score: 1

## Effect 168: User faints and target's Atk and SpAtk are lowered sharply

Start

## Effect 169: 2x power if user is Poisoned; Paralyzed; or Burned.

Start
  - If Player has the status condition: Poisoned
  - If Player has the status condition: Burned
  - If Player has the status condition: Paralyzed
  - If the defender is NOT badly poisoned, jump to End

Function ok
  - Change Score: 1

End
  - END

## Effect 170: Focus Punch effect

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - If AI is behind substitute, Ai Inc2
  - If Player has the status condition: Asleep
  - If Player has the status condition: Sleepy
  - If Player has the status condition: Infatuated
  - If Player has the status condition: Confused
  - Check Fake Out: Check Attack
  - If it's not 0, jump to End
  - 78.1% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1
  - Jump to End

Function ok1
  - 39.1% chance to jump to End

Function ok2
  - Change Score: 1

End
  - END

## Effect 171: 2x power if target is Paralyzed; cures target of Paralysis

Start
  - If Player has the status condition: Paralyzed
  - Jump to End

Function ok
  - Change Score: 1

End
  - END

## Effect 177: User switches held items with target

Start
  - Check Player Held Item
  - If Table Jump: Expertai 177 Table2, jump to Function Hachimaki
  - If Table Jump: Expertai 177 Table3, jump to Function Poison
  - If Table Jump: Expertai 177 Table4, jump to Function Yakedo
  - If Table Jump: Expertai 177 Table5, jump to Function Hedoro
  - If Table Jump: Expertai 177 Table, jump to Function Ok

Function ng
  - Change Score: -3
  - Jump to End

Function hachimaki
  - Check AI Held Item
  - If Table Jump: Expertai 177 Tableng2, jump to Function Ng
  - Change Score: 5
  - Jump to End

Function doku
  - Check AI Held Item
  - If Table Jump: Expertai 177 Tableng2, jump to Function Ng
  - If AI is statused, jump to Function Poison Check
  - If Sideeff: Check Defence, Field Condition Sinpinomamori, jump to Function Poison Check
  - Get defender's Type1
  - If it's Steel, jump to Function poison_check
  - If it's Poison, jump to Function poison_check
  - Get defender's Type2
  - If it's Steel, jump to Function poison_check
  - If it's Poison, jump to Function poison_check
  - Get the defender's ability
  - If it's Immunity, jump to Function poison_check
  - If it's Magic Guard, jump to Function poison_check
  - If it's Poison Heal, jump to Function poison_check
  - If it's Toxic Boost, jump to Function poison_check
  - Change Score: 5
  - Jump to End

Function check
  - If Player is statused, jump to Function Ng
  - If Sideeff: Check Attack, Field Condition Sinpinomamori, jump to Function Ng
  - Get attacker's Type1
  - If it's Steel, jump to Function ng
  - If it's Poison, jump to Function ng
  - Get attacker's Type2
  - If it's Steel, jump to Function ng
  - If it's Poison, jump to Function ng
  - Get the attacker's ability
  - If it's Immunity, jump to Function ng
  - If it's Magic Guard, jump to Function ng
  - If it's Poison Heal, jump to Function ng
  - If it's Klutz, jump to Function ng
  - If it's Toxic Boost, jump to Function ng
  - Change Score: 5
  - Jump to End

Function yakedo
  - Check AI Held Item
  - If Table Jump: Expertai 177 Tableng2, jump to Function Ng
  - Get the defender's ability
  - If it's Water Veil, jump to Function yakedo_check
  - If it's Magic Guard, jump to Function yakedo_check
  - If it's Flare Boost, jump to Function yakedo_check
  - If AI is statused, jump to Function Yakedo Check
  - If Sideeff: Check Defence, Field Condition Sinpinomamori, jump to Function Yakedo Check
  - Get defender's Type1
  - If it's Fire, jump to Function yakedo_check
  - Get defender's Type2
  - If it's Fire, jump to Function yakedo_check
  - Change Score: 5
  - Jump to End

Function check
  - Get the attacker's ability
  - If it's Water Veil, jump to Function ng
  - If it's Magic Guard, jump to Function ng
  - If it's Klutz, jump to AI_DEC5
  - If it's Flare Boost, jump to Function ng
  - If Player is statused, jump to Function Ng
  - If Sideeff: Check Attack, Field Condition Sinpinomamori, jump to Function Ng
  - Get attacker's Type1
  - If it's Fire, jump to Function ng
  - Get attacker's Type2
  - If it's Fire, jump to Function ng
  - Change Score: 5
  - Jump to End

Function hedoro
  - Check AI Held Item
  - If Table Jump: Expertai 177 Tableng2, jump to Function Ng
  - Get defender's Type1
  - If it's Poison, jump to Function hedoro_check
  - Get defender's Type2
  - If it's Poison, jump to Function hedoro_check
  - Get the defender's ability
  - If it's Magic Guard, jump to Function poison_check
  - If it's Toxic Boost, jump to Function poison_check
  - Change Score: 5
  - Jump to End

Function check
  - Get attacker's Type1
  - If it's Poison, jump to Function ng
  - Get attacker's Type2
  - If it's Poison, jump to Function ng
  - Get the attacker's ability
  - If it's Magic Guard, jump to Function ng
  - If it's Klutz, jump to Function ng
  - If it's Toxic Boost, jump to Function ng
  - Change Score: 5
  - Jump to End

Function ok
  - Check AI Held Item
  - If Table Jump: Expertai 177 Tableng1, jump to Function Ng
  - 19.5% chance to jump to End
  - Change Score: 2

End
  - END

Function Table

Function Table2

Function Table3

Function Table4

Function Table5

Function TableNG1

Function TableNG2

## Effect 178: User copies target's Ability

Start

Function ng
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 2

End
  - END

Function Table

Function Table

## Effect 181: Ingrain effect

Start
  - END

## Effect 182: Lowers user's Atk and Def

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - If the attacker's Atk stat is under 6, jump to Function ng
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 40%, jump to Function ng
  - Jump to End

Function 1
  - If the attacker's HP% < 60%, jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 183: Reflects status moves back at their user

Start
  - If the defender's HP% > 30%, jump to Function 0
  - 39.1% chance to jump to Function 0
  - Change Score: -1

Function 0
  - Check Fake Out: Check Attack
  - If it's 0, jump to Function ng

Function 1
  - 58.6% chance to jump to End
  - Change Score: 1
  - Jump to End

Function 2
  - 19.5% chance to jump to End

Function ng
  - 11.7% chance to jump to End
  - Change Score: -1

End
  - END

## Effect 184: User regains a consumed held item

Start
  - Check Recycle Item: Check Attack
  - If it's in the table:: Expertai 184 Table, jump to Function Ng
  - 19.5% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -2

End
  - END

Function Table

## Effect 185: 2x power if the user has been hit this turn

Start
  - If Player has the status condition: Asleep
  - If Player has the status condition: Infatuated
  - If Player has the status condition: Confused
  - 70.3% chance to jump to Function ng
  - Change Score: 2
  - Jump to End

Function ng
  - Change Score: -2

End
  - END

## Effect 186: Removes Light Screen/ Reflect from target's side of the field

Start
  - If Sideeff: Check Defence, Reflect, jump to Function Ok
  - If Sideeff: Check Defence, Light Screen, jump to Function Ok
  - Jump to End

Function ok
  - Change Score: 1

End
  - END

## Effect 188: Renders the target's held item unusable

Start
  - Get the defender's ability
  - If it's Harvest, jump to AI_DEC5
  - If the defender's HP% < 30%, jump to End
  - Check Fake Out: Check Attack
  - If it's over 0, jump to End
  - 70.3% chance to jump to End

Function ok
  - Change Score: 1

End
  - END

## Effect 189: Target's HP becomes equal to the user's current HP

Start
  - If the defender's HP% < 70%, jump to Function 2
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 40%, jump to Function 2
  - Change Score: 1
  - Jump to End

Function 1
  - If the attacker's HP% > 50%, jump to Function 2
  - Change Score: 1
  - Jump to End

Function 2
  - Change Score: -1

End
  - END

## Effect 190: Power= Base power x(user's current HP/ user's max HP)

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 90%, jump to Function ok
  - If the attacker's HP% > 50%, jump to End
  - Jump to Function ng

Function ok
  - 11.7% chance to jump to End
  - Change Score: 1
  - If the attacker is holding Choice Scarf, jump to Function KODAWARISUKAAHU
  - Jump to End

Function KODAWARISUKAAHU
  - Change Score: 1
  - Jump to End

Function 1
  - If the attacker's HP% > 80%, jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 191: User swaps Abilities with the target

Start
  - Get the attacker's ability
  - If Table Jump: Expertai 178 Table, jump to Function Ng
  - Get the defender's ability
  - If Table Jump: Expertai 178 Table, jump to Function Ok
  - Check Battle Type
  - If it's Battle Type Single, jump to Function ng
  - Get the defender's ability
  - If Table Jump: Expertai 178 Double Table, jump to Function Ok

## Effect 192: Target is prevented from using moves shared with the user

Start
  - Check Fake Out: Check Attack
  - If it's over 0, jump to End
  - 39.1% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 193: Cures user of Burn; Poison; or Paralysis

Start
  - If the defender's HP% < 50%, jump to Function ng
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 195: If any Pokemon uses a beneficial status move; the user uses it instead

Start
  - Check Fake Out: Check Attack
  - If it's 1, jump to Function ok1
  - 11.7% chance to jump to End
  - If Player is faster, jump to Function 1
  - If the attacker's HP% != 100%, jump to Function ng
  - If the defender's HP% < 70%, jump to Function ng
  - 23.4% chance to jump to End
  - Jump to Function ng

Function 1
  - If the defender's HP% > 25%, jump to Function ng
  - If the defender has a move with the following effect: Restores up to Heal% max HP, jump to Function ok1
  - If the defender has a move with the following effect: Raises Def and 2x Rollout/ Ice Ball power, jump to Function ok1
  - If the defender has a move with the following effect: Roost effect, jump to Function ok1
  - Jump to Function ok2

Function ok1
  - 58.6% chance to jump to End
  - Change Score: 2
  - Jump to End

Function ok2
  - 89.8% chance to jump to Function ng
  - Change Score: 1
  - Jump to End

Function ng
  - 11.7% chance to jump to End
  - Change Score: -2

End
  - END

## Effect 198: 1/3 damage dealt recoil

Start

## Effect 200: Chance of causing Burn; increased Crit ratio

Start

## Effect 201: Weakens Electric-type moves by 50% until user switches out

Start
  - If the attacker's HP% < 50%, jump to Function ng
  - Get defender's Type1
  - If it's Electric, jump to Function ok
  - Get defender's Type2
  - If it's Electric, jump to Function ok
  - Jump to Function ng

Function ok
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 204: Lowers user's SpAtk harshly

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Get the attacker's ability
  - If it's Contrary, jump to Function AMANOZYAKU
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 60%, jump to End
  - Jump to Function ng

Function AMANOZYAKU
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, jump to Function 1
  - If the attacker's HP% < 50%, jump to End
  - 19.5% chance to jump to Function 1
  - Change Score: 2
  - Jump to End

Function 1
  - If the attacker's HP% > 80%, jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 205: Lowers target's Atk and Def

Start

## Effect 206: Raises user's Def and SpDef

Start

## Effect 208: Raises user's Atk and Def

Start

## Effect 209: Chance of causing Poison; increased crit ratio

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, End
  - Check Move Type Effectiveness: 2, jump to Function 1
  - Check Move Type Effectiveness: 4, jump to Function 1
  - 50% chance to jump to End

## Effect 210: Weakens Fire-type moves by 50% until user switches out

Start
  - If the attacker's HP% < 50%, jump to Function ng
  - Get defender's Type1
  - If it's Fire, jump to Function ok
  - Get defender's Type2
  - If it's Fire, jump to Function ok
  - Jump to Function ng

Function ok
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 211: Raises user's SpAtk and SpDef

Start

## Effect 212: Raises user's Atk and Spd

Start
  - If Player is faster, jump to Function Ok
  - If the attacker's HP% > 50%, jump to End
  - 19.5% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 214: Roost effect

Start

## Effect 215: Gravity effect

Start
  - Get the defender's ability
  - If it's Levitate, jump to Function 1
  - If Player has the status condition: Floating
  - Get defender's Type1
  - If it's Flying, jump to Function 1
  - Get defender's Type2
  - If it's Flying, jump to Function 1
  - If the attacker's HP% < 60%, jump to End
  - 50% chance to jump to Function 1
  - Jump to End

Function 1
  - 25% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 216: 2x power if target is asleep; wakes up target

Start
  - Get defender's Type1
  - If it's Dark, jump to Function ok1
  - Get defender's Type2
  - If it's Dark, jump to Function ok1
  - If the defender's Evasion stat is at +3 or more, jump to Function ok2
  - Change Score: -2
  - END

Function ok1
  - 31.2% chance to jump to End

Function ok2
  - 31.2% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 217: Causes all moves to ignore changes to the target's Evasiveness

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - If Player has the status condition: Asleep
  - Jump to End

Function ng
  - Change Score: -1
  - Jump to End

Function ok
  - Change Score: 1

End
  - END

## Effect 218: Lowers user's Spd

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - If Player is faster, jump to Function Ok
  - Jump to End

Function ng
  - Change Score: -1
  - END

Function ok
  - Change Score: 1

End
  - END

## Effect 219: Power = min(150; (25 x Target's Current Speed / User's Current Speed) + 1)

Start
  - END

## Effect 220: Healing Wish effect

Start

## Effect 221: 2x power if target is at or below 1/2 HP

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - If the defender's HP% > 50%, jump to End
  - Change Score: 1
  - 50% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 223: Can only hit targets that have used Protect/ Detect

Start
  - If the defender has a move with the following effect: Protect/ Detect effect, jump to Function mamoru
  - 25% chance to jump to Function mamoru
  - Jump to End

Function mamoru
  - Get the attacker's ability
  - If it's not Guts, jump to Function konjopass
  - If the attacker is holding Flame Orb, jump to Function konjo
  - If the attacker is holding Toxic Orb, jump to Function konjo
  - Jump to Function konjopass

Function konjo
  - Check Turn
  - If it's not 0, jump to Function konjopass
  - Change Score: 2

Function konjopass
  - If the attacker is badly poisoned, jump to Function ok1
  - If AI has the status condition: Cursed
  - If AI has the status condition: Perish Song
  - If AI has the status condition: Infatuated
  - If AI has the status condition: Leech Seeded
  - If AI has the status condition: Sleepy
  - If the defender's HP% == 100%, jump to Function count
  - Check AI Held Item
  - If it's in the table:: Expertai 223 Table, jump to Function Count

Function ok1
  - 50% chance to jump to Function count
  - Change Score: 1

Function count
  - Check Mamoru Count: Check Defence
  - If it's 0, jump to Function 1
  - If it's 1, jump to Function 2
  - If it's over 2, jump to Function ng

Function 1
  - 50% chance to jump to End
  - Change Score: 1
  - Jump to End

Function 2
  - 75% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -2

End
  - END

Function Table

## Effect 224: Consumes target's berry

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Fake Out: Check Attack
  - If it's 0, jump to Function 1
  - 25% chance to jump to Function 1
  - Change Score: 1

Function 1
  - 50% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 225: 2x Spd for user's party for 3 turns

Start
  - 25% chance to jump to End
  - If AI is faster, jump to Function Ng
  - If the attacker's HP% < 31%, jump to Function ng
  - If the attacker's HP% > 75%, jump to Function ok
  - 25% chance to jump to End

Function ok
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 226: Sharply raises a random stat of the target

Start
  - If the attacker's HP% < 51%, jump to Function ng
  - If the attacker's HP% > 90%, jump to Function ok
  - 50% chance to jump to End

Function ok
  - 25% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 227: Damage= 1.5x damage dealt by the target's last attack

Start
  - If Player has the status condition: Asleep
  - If Player has the status condition: Infatuated
  - If Player has the status condition: Confused
  - If the defender has a move with the following effect: 2x power if the user has been hit this turn, jump to Function ng
  - If the defender has a move with the following effect: Focus Punch effect, jump to Function ng
  - If the defender has a move with the following effect: Vital Throw effect, jump to Function ng
  - If the attacker's HP% > 30%, jump to Function 1
  - 3.9% chance to jump to Function 1
  - Change Score: -1

Function 1
  - If the attacker's HP% > 50%, jump to Function koukou
  - 39.1% chance to jump to Function koukou
  - Change Score: -1

Function koukou
  - 75% chance to jump to Function 2
  - Change Score: 1

Function 2
  - Check last move used by Player
  - Check Damage
  - If it's 0, jump to Function 3
  - If not Taunted: Function 3
  - 39.1% chance to jump to Function 3
  - Change Score: 1

Function 3
  - If not Taunted: End
  - 39.1% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 228: Switches user out after dealing damage

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Bench Count: Check Attack
  - If it's 0, jump to End
  - If Have Batsugun: Expertai 228 Ng1
  - Jump to Function 1

Function ng
  - Change Score: -1
  - Jump to End

Function ng1
  - 25% chance to jump to Function 1
  - Change Score: -2

Function 1
  - If Bench Damage Max: Loss Calc Off, jump to Function 2
  - 25% chance to jump to Function 2
  - Change Score: -2
  - Jump to End

Function 2
  - If the defender's HP% > 70%, jump to Function 3
  - If the defender's HP% > 30%, jump to Function 4
  - 50% chance to jump to Function 5
  - Jump to Function 4

Function 3
  - 25% chance to jump to Function 4
  - Change Score: +1

Function 4
  - 50% chance to jump to Function 5
  - Change Score: +1

Function 5
  - If AI is faster, jump to Function Ok
  - 50% chance to jump to End

Function ok
  - Change Score: 1

End
  - END

## Effect 229: Lowers user's Def and SpDef

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - If Player is faster, jump to Function 1
  - If the attacker's HP% > 60%, jump to End
  - Jump to Function ng

Function 1
  - If the attacker's HP% > 80%, jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 230: 2x Power if user moves after target

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - If AI is faster, End
  - If the attacker's HP% < 30%, jump to End
  - 25% chance to jump to End
  - Change Score: 1
  - END

Function ng
  - Change Score: -1

End
  - END

## Effect 231: 2x damage if the target has already taken damage this turn

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - If AI is faster, End
  - Get the attacker's ability
  - If it's Rough Skin, jump to Function 1
  - Check Held Item Item: Check Attack
  - If Table Jump: Expertai 231 Table, jump to Function 1
  - 50% chance to jump to Function 1
  - Jump to End

Function ng
  - Change Score: -1
  - Jump to End

Function 1
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

Function Table

## Effect 232: Prevents the target from using its held item or having items used on it

Start
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 233: Power and effect determined by held item

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Nagetsukeru Iryoku: Check Attack
  - If it's under 30, jump to Function nagenai
  - If it's over 90, jump to Function nageru1
  - If it's over 60, jump to Function nageru2
  - 50% chance to jump to End
  - Change Score: -1
  - Jump to End

Function nagenai
  - Change Score: -2
  - Jump to End

Function nageru1
  - Check Move Type Effectiveness: 2, jump to Function Nageru1 Ok
  - Check Move Type Effectiveness: 4, jump to Function Nageru1 Ok
  - 50% chance to jump to Function nageru2
  - Change Score: 1
  - Jump to Function nageru2

Function ok
  - Change Score: 4

Function nageru2
  - 25% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Check Player Held Item
  - If Table Jump: Expertai 233 Table, End
  - Change Score: -1

End
  - END

Function Table

## Effect 234: Cures user of any status condition and afflicts the target with it

Start
  - If Player is healthy, Ai Dec10
  - 50% chance to jump to End
  - If the defender's HP% < 30%, jump to End
  - Change Score: 1

End
  - END

## Effect 235: The less PP the move has; the greater its Power

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Pp Remain
  - If it's 1, jump to Function ok
  - If it's 2, jump to Function 2
  - If it's 3, jump to Function 3
  - Get the defender's ability
  - If it's not Pressure, jump to Function 1
  - 11.7% chance to jump to Function 1
  - Change Score: 1

Function 1
  - If the defender's Evasion stat is over 10, jump to Function 2
  - If the attacker's HP stat is under 2, jump to Function 2
  - If the defender's Evasion stat is at +3 or more, jump to Function 3
  - If the attacker's HP stat is under 4, jump to Function 3
  - Jump to End

Function 2
  - Change Score: 1

Function 3
  - 39.1% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ok
  - Change Score: 3
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 236: Heal Block effect

Start
  - If the defender has a move with the following effect: Damages sleeping target; heals user up to 50% of damage dealt, jump to Function ok
  - If the defender has a move with the following effect: Restores up to Heal% max HP, jump to Function ok
  - If the defender has a move with the following effect: Roost effect, jump to Function ok
  - If the defender has a move with the following effect: 157, jump to Function ok
  - If the defender has a move with the following effect: Synthesis effect, jump to Function ok
  - If the defender has a move with the following effect: Causes Sleep and restores all HP, jump to Function ok
  - If the defender has a move with the following effect: Swallow effect, jump to Function ok
  - If the defender has a move with the following effect: Damages target; heals user up to 50% of damage dealt, jump to Function ok
  - If the defender has a move with the following effect: Ingrain effect, jump to Function ok
  - If the defender has a move with the following effect: Restores 1/16 of the user's max HP at the end of every turn, jump to Function ok
  - If the defender has a move with the following effect: Leech Seed effect, jump to Function ok
  - If the defender has a move with the following effect: Healing Wish effect, jump to Function ok
  - If the defender has a move with the following effect: Lunar Dance effect, jump to Function ok
  - If AI has the status condition: Leech Seeded
  - If Player has the status condition: Aqua Ring
  - If Player has the status condition: Ingrained
  - 37.5% chance to jump to Function ok
  - Jump to End

Function ok
  - 9.8% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 237: Power = Base power + 120 x (Target's Current HP / Target's Maximum HP)

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - If the defender's HP% < 50%, jump to Function ng
  - If the defender's HP% == 100%, jump to Function ok1
  - If the defender's HP% > 85%, jump to Function ok2
  - Jump to End

Function ok1
  - If Player is faster, jump to Function Ok1 1
  - Change Score: 1

Function 1
  - Change Score: 1

Function ok2
  - 9.8% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 238: Swaps the user's Atk stat with its Def stat

Start
  - If the attacker's HP% > 90%, jump to Function 1
  - If the attacker's HP% > 60%, jump to Function 2
  - If the attacker's HP% > 30%, jump to Function 3
  - Jump to AI_DEC2

Function 1
  - 37.5% chance to jump to End
  - Change Score: +1
  - Jump to End

Function 2
  - 50% chance to jump to End
  - Change Score: +1
  - Jump to End

Function 3
  - 64.1% chance to jump to End
  - Change Score: +1
  - Jump to End

End
  - END

## Effect 239: Suppresses the target's Ability

Start
  - Get the attacker's ability
  - If Table Jump: Expertai 239 Table, jump to Function Ok
  - 25% chance to jump to End
  - Change Score: 1
  - If the defender's HP% > 70%, jump to End
  - 50% chance to jump to Function 1
  - Change Score: -1

Function 1
  - If the defender's HP% > 50%, jump to End
  - Change Score: -1
  - If the defender's HP% > 30%, jump to End
  - Change Score: -1
  - Jump to End

Function ng
  - Change Score: -1
  - Jump to End

Function ok
  - 15.6% chance to jump to End
  - Change Score: 1

End
  - END

Function Table
  - If it's No Guard, jump to Function 4

## Effect 240: Prevents opponents from landing critical hits on the user's party for 5 turns

Start
  - If the attacker's HP% < 70%, jump to Function ng
  - If the defender has a move with the following effect: High crit ratio, jump to Function ok
  - If the defender has a move with the following effect: Chance of causing Burn; increased Crit ratio, jump to Function ok
  - If the defender has a move with the following effect: Chance of causing Poison; increased crit ratio, jump to Function ok
  - 25% chance to jump to Function ok
  - Jump to End

Function ok
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 241: If the target has not moved yet; the user copies their move and uses it with 1.5x power

Start
  - If Player is faster, jump to Function Ng
  - If Last Move Damage Check: Check Defence, Loss Calc Off, jump to Function Ok
  - Jump to Function 1

Function Ok
  - 12.5% chance to jump to Function 1
  - Change Score: 1

Function 1
  - Check Last Move Category
  - If it's Wazadata Dmg None, jump to Function 2
  - 50% chance to jump to End
  - Change Score: 1

Function 2
  - 25% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -2

End
  - END

## Effect 242: User uses the last move that was used in battle

Start
  - If Player is faster, jump to Function 1
  - If Last Move Damage Check: Check Defence, Loss Calc Off, jump to Function Ok
  - Check last move used by Player
  - If it's in the table:: Expertai 242 Table, jump to Function 1
  - 50% chance to jump to Function 3
  - Change Score: 2
  - Jump to Function 3

Function ok
  - 12.5% chance to jump to Function 3
  - Change Score: 2
  - Jump to Function 3

Function 1
  - If Last Move Damage Check: Check Defence, Loss Calc Off, jump to Function 3
  - Check last move used by Player
  - If Table Jump: Expertai 242 Table, jump to Function 3
  - 31.2% chance to jump to Function 3
  - Change Score: -1

Function 3
  - END

Function Table

## Effect 243: Swaps the user's Atk and SpAtk buffs with the target's Atk and SpAtk buffs

Start
  - Check Status Diff: Check Defence, Ptl Ability Atk
  - If it's over 3, jump to Function ok1
  - If it's over 1, jump to Function ok2
  - If it's over 0, jump to Function ok3
  - If it's 0, jump to Function ok4
  - Jump to End

Function ok1
  - Check Status Diff: Check Defence, Ptl Ability Spatk
  - If it's over 3, jump to Function 05
  - If it's over 1, jump to Function 04
  - If it's 0, jump to Function 03
  - Jump to End

Function ok2
  - Check Status Diff: Check Defence, Ptl Ability Spatk
  - If it's over 3, jump to Function 04
  - If it's over 1, jump to Function 03
  - If it's 0, jump to Function 02
  - Jump to End

Function ok3
  - Check Status Diff: Check Defence, Ptl Ability Spatk
  - If it's over 3, jump to Function 03
  - If it's over 1, jump to Function 02
  - If it's 0, jump to Function 01
  - Jump to End

Function ok4
  - Check Status Diff: Check Defence, Ptl Ability Spatk
  - If it's over 3, jump to Function 03
  - If it's over 1, jump to Function 02
  - If it's over 0, jump to Function 01
  - Jump to End

Function 05
  - 50% chance to jump to Function 04
  - Change Score: +5
  - Jump to End

Function 04
  - 50% chance to jump to Function 03
  - Change Score: +4
  - Jump to End

Function 03
  - 50% chance to jump to Function 02
  - Change Score: +3
  - Jump to End

Function 02
  - 50% chance to jump to Function 01
  - Change Score: +2
  - Jump to End

Function 01
  - 50% chance to jump to End
  - Change Score: +1
  - Jump to End

End
  - END

## Effect 244: Swaps the user's Def and SpDef buffs with the target's Def and SpDef buffs

Start
  - Check Status Diff: Check Defence, Ptl Ability Def
  - If it's over 3, jump to Function ok1
  - If it's over 1, jump to Function ok2
  - If it's over 0, jump to Function ok3
  - If it's 0, jump to Function ok4
  - Jump to End

Function ok1
  - Check Status Diff: Check Defence, Ptl Ability Spdef
  - If it's over 3, jump to Function 05
  - If it's over 1, jump to Function 04
  - If it's 0, jump to Function 03
  - Jump to End

Function ok2
  - Check Status Diff: Check Defence, Ptl Ability Spdef
  - If it's over 3, jump to Function 04
  - If it's over 1, jump to Function 03
  - If it's 0, jump to Function 02
  - Jump to End

Function ok3
  - Check Status Diff: Check Defence, Ptl Ability Spdef
  - If it's over 3, jump to Function 03
  - If it's over 1, jump to Function 02
  - If it's 0, jump to Function 01
  - Jump to End

Function ok4
  - Check Status Diff: Check Defence, Ptl Ability Spdef
  - If it's over 3, jump to Function 03
  - If it's over 1, jump to Function 02
  - If it's over 0, jump to Function 01
  - Jump to End

Function 05
  - 50% chance to jump to Function 04
  - Change Score: +5
  - Jump to End

Function 04
  - 50% chance to jump to Function 03
  - Change Score: +4
  - Jump to End

Function 03
  - 50% chance to jump to Function 02
  - Change Score: +3
  - Jump to End

Function 02
  - 50% chance to jump to Function 01
  - Change Score: +2
  - Jump to End

Function 01
  - 50% chance to jump to End
  - Change Score: +1
  - Jump to End

End
  - END

## Effect 245: Power= 60 + (20x # of stat increases of target)

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.2, End
  - Check Move Type Effectiveness: 1.4, End
  - Check Status Up: Check Defence
  - If it's over 6, jump to Function ok1
  - If it's over 5, jump to Function ok2
  - If it's over 4, jump to Function ok3
  - If it's over 3, jump to Function ok4
  - If it's over 2, jump to Function ok4
  - Jump to End

Function ok1
  - 50% chance to jump to Function ok2
  - Change Score: +4

Function ok2
  - 50% chance to jump to Function ok3
  - Change Score: +3

Function ok3
  - 50% chance to jump to Function ok4
  - Change Score: +2

Function ok4
  - 50% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 246: Fails unless the user has used all of its other moves at least once

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - If Totteoki: Check Attack, jump to Function Ok
  - Jump to End

Function ng
  - Change Score: -1
  - Jump to End

Function ok
  - Change Score: 1

End
  - END

## Effect 247: Changes the target's Ability to Insomnia

Start
  - If not Have Move: Check Defence, Rest, jump to Function 1
  - Change Score: +1

Function 1
  - If the attacker's HP% < 50%, jump to Function 2
  - 50% chance to jump to Function 2
  - Change Score: +1

Function 2
  - 25% chance to jump to End
  - Change Score: +1
  - Jump to End

End
  - END

## Effect 248: Fails if the target did not select a damaging move or has already moved

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - 25% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 249: Toxic Spikes effect

Start
  - 50% chance to jump to End
  - Change Score: +1
  - If AI has the move, Roar, jump to Function Ok
  - If AI has the move, Whirlwind, jump to Function Ok
  - Jump to End

Function ok
  - 25% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 250: Swaps the user's stat changes with the target's

Start
  - If the defender's Atk stat is at +2 or more, jump to Function 1
  - If the defender's Def stat is at +2 or more, jump to Function 1
  - If the defender's SpAtk stat is at +2 or more, jump to Function 1
  - If the defender's Spedef stat is at +2 or more, jump to Function 1
  - If the defender's Evasion stat is at +2 or more, jump to Function 1
  - If the defender has condition flag Bpp Contflg Kiaidame, jump to Function 1
  - Jump to Function ng

Function 1
  - If the attacker's Atk stat is under 7, jump to Function ok2
  - If the attacker's Def stat is under 7, jump to Function ok2
  - If the attacker's SpAtk stat is under 7, jump to Function ok2
  - If the attacker's Spedef stat is under 7, jump to Function ok2
  - If the attacker's Evasion stat is under 7, jump to Function ok1
  - If the attacker does NOT have condition flag Bpp Contflg Kiaidame, jump to Function ok2
  - 19.5% chance to jump to End
  - Jump to Function ng

Function ok1
  - Change Score: 1

Function ok2
  - Change Score: 1
  - END

Function ng
  - Change Score: -2

End
  - END

## Effect 251: Restores 1/16 of the user's max HP at the end of every turn

Start
  - If the attacker's HP% < 50%, jump to End
  - 50% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 252: User becomes immune to Ground-type attacks and field hazards for 5 turns

Start
  - If the attacker's HP% < 50%, jump to End
  - If the player has the move, Earthquake, jump to Function Ok1
  - If the player has the move, Earth Power, jump to Function Ok1
  - If the player has the move, Fissure, jump to Function Ok1
  - Jump to Function 1

Function ok1
  - Change Score: 1

Function 1
  - Get defender's Type1
  - If it's Ground, jump to Function ok2
  - Get defender's Type2
  - If it's Ground, jump to Function ok2
  - 50% chance to jump to End

Function ok2
  - Change Score: 1

End
  - END

## Effect 253: Chance of causing Burn; 1/3 damage dealt recoil

Start

## Effect 254: Struggle effect

Start
  - END
  - END
  - END

## Effect 255: Dive effect

Start

## Effect 256: Dig effect

Start

## Effect 257: 2x Damage on Pokemon using Dive

Start
  - END

## Effect 258: Defog effect

Start
  - If Sideeff: Check Defence, Light Screen, jump to Function Ok1
  - If Sideeff: Check Defence, Reflect, jump to Function Ok1
  - If Sideeff: Check Defence, Field Condition Makibisi, jump to Function Ng1
  - If Sideeff: Check Defence, Field Condition Stealthrock, jump to Function Ng1
  - If Sideeff: Check Defence, Field Condition Poisonbisi, jump to Function Ng1
  - Jump to Function avoid

Function ok1
  - If the attacker's HP% > 30%, jump to Function ok1_1
  - Check Bench Count: Check Attack
  - If it's 0, jump to Function 1

Function 1
  - Change Score: 1
  - Check Bench Count: Check Defence
  - If it's 0, jump to End
  - If Sideeff: Check Defence, Field Condition Makibisi, jump to Function Ng2
  - If Sideeff: Check Defence, Field Condition Stealthrock, jump to Function Ng2
  - If Sideeff: Check Defence, Field Condition Poisonbisi, jump to Function Ng2
  - Jump to Function avoid

Function ng1
  - Change Score: -2
  - Jump to Function avoid

Function ng2
  - 50% chance to jump to Function avoid
  - Change Score: -1
  - Jump to Function avoid

Function avoid
  - If the attacker's HP% < 70%, jump to Function 1
  - If the defender's Evasion stat is over 3, jump to Function 2

Function 1
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's HP% > 70%, jump to End
  - Change Score: -2

End
  - END

## Effect 259: Trick Room effect

Start
  - Check Battle Type
  - If it's Battle Type Double, jump to End
  - If the attacker's HP% > 30%, jump to Function 1
  - Check Bench Count: Check Attack
  - If it's 0, jump to End

Function 1
  - If Player is faster, jump to Function Ok
  - Change Score: -1
  - Jump to End

Function ok
  - 25% chance to jump to End
  - Change Score: 3

End
  - END

## Effect 260: Always hits in Hail

Start
  - Check Move Type Effectiveness: 0, jump to Function 1
  - Check Move Type Effectiveness: 1.2, jump to Function 1
  - Check Move Type Effectiveness: 1.4, jump to Function 1
  - Check Weather
  - If it's not Weather Hail, jump to End
  - Change Score: 1
  - Jump to End

Function 1
  - 19.5% chance to jump to End
  - Change Score: -3

End
  - END
  - END

## Effect 262: 1/3 damage dealt recoil

Start

## Effect 263: Bounce effect

Start

## Effect 265: Lowers opposite gender target's SpAtk harshly

Start
  - If the defender's SpAtk stat is 6, jump to Function 2
  - Change Score: -1
  - If the attacker's HP% > 90%, jump to Function 1
  - Change Score: -1

Function 1
  - If the defender's SpAtk stat is over 3, jump to Function 2
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's HP% > 70%, jump to Function 3
  - Change Score: -2

Function 3
  - Check Last Move Category
  - If it's not Physical, jump to End
  - 25% chance to jump to End
  - Change Score: -1

End
  - END

## Effect 266: Stealth Rocks effect

Start
  - 50% chance to jump to End
  - Change Score: +1
  - If AI has the move, Roar, jump to Function Ok
  - If AI has the move, Whirlwind, jump to Function Ok
  - Jump to End

Function ok
  - 25% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 267: Chatter effect

Start
  - END

## Effect 268: Type= Type of Plate held by user

Start
  - END

## Effect 269: 1/2 damage dealt recoil

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.2, End
  - Check Move Type Effectiveness: 1.4, End
  - Get the attacker's ability
  - If it's Rock Head, jump to Function ok
  - If it's Magic Guard, jump to Function ok
  - Jump to End

Function ok
  - Change Score: +1

End
  - END

## Effect 270: Lunar Dance effect

Start

Function 1
  - If the attacker's HP% < 80%, jump to Function 2
  - If Player is faster, jump to Function 2
  - 75% chance to jump to Function 5
  - Jump to AI_DEC5

Function 2
  - If the attacker's HP% > 50%, jump to Function 4
  - 75% chance to jump to Function 3
  - Change Score: +1
  - If Have Batsugun: Expertai 270 Hikae Batugun
  - 75% chance to jump to Function hikae_batugun
  - Change Score: +1

Function batugun
  - If Bench Damage Max: Loss Calc Off, jump to Function Hikae Nostrong
  - Jump to Function 3

Function nostrong
  - 50% chance to jump to Function 3
  - Change Score: +1

Function 3
  - If the attacker's HP% > 30%, jump to Function 5
  - 50% chance to jump to Function 5
  - Change Score: +1
  - Jump to Function 5

Function 4
  - 19.5% chance to jump to Function 5
  - Change Score: -1

Function 5
  - END

## Effect 272: Shadow Force effect

Start

## Effect 277: Boost Attack and Move Accuracy

Start
  - If the attacker's HP stat is under 9, jump to Function 1
  - 19.5% chance to jump to Function 1
  - Change Score: -2

Function 1
  - If the attacker's HP% > 80%, jump to End
  - Change Score: -2

End
  - END

## Effect 278: Block multi targeting moves

Start
  - END

## Effect 279: Split Def and SpDef with target

Start
  - Check Fake Out: Check Attack
  - If it's not 0, jump to Function dec
  - If the attacker's Def stat is at +2 or more, jump to Function dec
  - If the attacker's Spedef stat is at +2 or more, jump to Function dec
  - If the defender's Def stat is under 8, jump to Function 2
  - If the defender's Spedef stat is under 8, jump to Function 2
  - 19.5% chance to jump to Function 1
  - Change Score: 1

Function 1
  - If the defender's Def stat is under 10, jump to Function 2
  - If the defender's Spedef stat is under 10, jump to Function 2
  - 19.5% chance to jump to Function 2
  - Change Score: 1

Function 2
  - Check Monsno: Check Attack
  - If Table Jump: Expertai 279 Bougyo Table, jump to Function Bougyo
  - If Table Jump: Expertai 279 Tokubou Table, jump to Function Bougyo
  - Check Monsno: Check Defence
  - If Table Jump: Expertai 279 Bougyo Table, jump to Function Inc
  - If Table Jump: Expertai 279 Tokubou Table, jump to Function Inc
  - Jump to End

Function bougyo
  - Check Battle Type
  - If it's Battle Type Single, jump to AI_DEC10
  - Jump to End

Function inc
  - 19.5% chance to jump to End
  - Change Score: 1
  - Jump to End

Function dec
  - Change Score: -1

End
  - END

Function table

Function table

## Effect 280: Split Atk and SpAtk with target

Start
  - Check Fake Out: Check Attack
  - If it's not 0, jump to Function dec
  - If the attacker's Atk stat is at +2 or more, jump to Function dec
  - If the attacker's SpAtk stat is at +2 or more, jump to Function dec
  - If the defender's Atk stat is under 8, jump to Function 2
  - If the defender's SpAtk stat is under 8, jump to Function 2
  - 19.5% chance to jump to Function 1
  - Change Score: 1

Function 1
  - If the defender's Atk stat is under 10, jump to Function 2
  - If the defender's SpAtk stat is under 10, jump to Function 2
  - 19.5% chance to jump to Function 2
  - Change Score: 1

Function 2
  - Check Monsno: Check Attack
  - If Table Jump: Expertai 280 Kougeki Table, jump to Function Kougeki
  - If Table Jump: Expertai 280 Tokukou Table, jump to Function Kougeki
  - Check Monsno: Check Defence
  - If Table Jump: Expertai 280 Kougeki Table, jump to Function Inc
  - If Table Jump: Expertai 280 Tokukou Table, jump to Function Inc
  - Jump to End

Function kougeki
  - Check Battle Type
  - If it's Battle Type Single, jump to AI_DEC10
  - Jump to End

Function inc
  - 19.5% chance to jump to End
  - Change Score: 1
  - Jump to End

Function dec
  - Change Score: -1

End
  - END

Function table

Function table

## Effect 281: Swap Def and SpDef of all Pokemon

Start
  - END

## Effect 282: Deal Physical dmg with SpAtk stat

Start
  - END

## Effect 283: Deal double dmg to poisoned targets

Start
  - END

## Effect 284: Sharply Raise Speed and reduce weight

Start
  - If the defender does NOT have a move with the following effect: Inflicts greater damage on heavier targets, jump to Start
  - 23.4% chance to jump to Start
  - Change Score: 1

## Effect 285: Make all moves hit target

Start
  - If the attacker's HP stat is under 9, jump to Function 1
  - 19.5% chance to jump to Function 1
  - Change Score: -2

Function 1
  - If the attacker's HP% > 70%, jump to Function 2
  - 19.5% chance to jump to Function 2
  - Change Score: -2

Function 2
  - If the defender's Evasion stat is under 9, jump to End
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 286: Suppress all held item effects

Start
  - If the attacker is holding 0, jump to Function ok
  - If the defender is holding Leftovers, jump to Function ok
  - If the defender is holding Choice Scarf, jump to Function ok
  - Check Battle Type
  - If it's Battle Type Single, jump to End
  - If the defender is holding Float Stone, jump to Function ok
  - Jump to End

Function ok
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 287: Ground the target

Start
  - Get the defender's ability
  - If it's Levitate, jump to Function 1
  - If Player has the status condition: Floating
  - Get defender's Type1
  - If it's Flying, jump to Function 1
  - Get defender's Type2
  - If it's Flying, jump to Function 1
  - Jump to End

Function 1
  - 25% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 288: Always crit

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, End
  - If Moveno: Storm Throw, jump to Function Buturi
  - If the attacker's Spedef stat is under 8, jump to End
  - Jump to Function ok

Function buturi
  - If the attacker's Def stat is under 8, jump to End

Function ok
  - 25% chance to jump to End
  - Change Score: +1

End
  - END

## Effect 289: Flame Blurst effect

Start
  - END

## Effect 290: Raise SpAtk, SpDef, and Speed

Start
  - If Player is faster, jump to Function Ok
  - If the attacker's HP% > 50%, jump to End
  - 19.5% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 291: Deal more damage the heavier the user

Start
  - END

## Effect 292: Hits all adjacent Pokémon that share a type

Start
  - END

## Effect 293: Deal more damage the faster the user

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, End
  - If Player is faster, jump to Function Ng
  - If the attacker's Agi stat is under 8, jump to End
  - 27.3% chance to jump to End
  - Change Score: 1
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 294: Change target type to water

Start
  - END

## Effect 295: Deal damage and raise speed

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, End
  - If Player is faster, jump to Function Ok
  - 19.5% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 296: Deal damage and sharply lower Def of target

Start
  - If the defender's Spedef stat is over 5, jump to End
  - If the defender's Spedef stat is over 3, jump to Function ng2

Function ng
  - Change Score: -1

Function ng2
  - 50% chance to jump to End
  - Change Score: -1

End
  - END

## Effect 297: Deal damage using target's Atk stat

Start
  - END

## Effect 298: Change target ability to Simple

Start
  - If the defender has a move with the following effect: Raises Atk, jump to Function ng
  - If the defender has a move with the following effect: Raises Def, jump to Function ng
  - If the defender has a move with the following effect: Raises Spd, jump to Function ng
  - If the defender has a move with the following effect: Raises SpAtk, jump to Function ng
  - If the defender has a move with the following effect: Raises SpDef, jump to Function ng
  - If the defender has a move with the following effect: Raises Move Accuracy, jump to Function ng
  - If the defender has a move with the following effect: Raises Evasion, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises Atk, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises Def, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises Spd, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises SpAtk, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises SpDef, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises Move Accuracy, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises Evasion, jump to Function ng
  - If the defender has a move with the following effect: Curse effect, jump to Function ng
  - If the defender has a move with the following effect: Raises user's Def and SpDef, jump to Function ng
  - If the defender has a move with the following effect: Raises user's Atk and Def, jump to Function ng
  - If the defender has a move with the following effect: Raises user's SpAtk and SpDef, jump to Function ng
  - If the defender has a move with the following effect: Raises user's Atk and Spd, jump to Function ng
  - If the defender has a move with the following effect: Sharply raises a random stat of the target, jump to Function ng
  - If the defender has a move with the following effect: Boost Attack and Move Accuracy, jump to Function ng
  - If the defender has a move with the following effect: Raise SpAtk, SpDef, and Speed, jump to Function ng
  - If the defender has a move with the following effect: Lower Def and SpDef, Sharply raise Atk, SpAtk, and Speed, jump to Function ng
  - If the defender has a move with the following effect: Raise Atk and SpAtk, doubled in sunlight, jump to Function ng
  - If the defender has a move with the following effect: Raise Atk, Def, and Move Accuracy, jump to Function ng
  - If the attacker has a move with the following effect: Lowers Atk, jump to Function ok
  - If the attacker has a move with the following effect: Lowers Def, jump to Function ok
  - If the attacker has a move with the following effect: Lowers Spd, jump to Function ok
  - If the attacker has a move with the following effect: Lowers SpAtk, jump to Function ok
  - If the attacker has a move with the following effect: Lowers SpDef, jump to Function ok
  - If the attacker has a move with the following effect: Lowers Move Accuracy, jump to Function ok
  - If the attacker has a move with the following effect: Lowers Evasion, jump to Function ok
  - If the attacker has a move with the following effect: Sharply lowers Atk, jump to Function ok
  - If the attacker has a move with the following effect: Sharply lowers Def, jump to Function ok
  - If the attacker has a move with the following effect: Sharply lowers Spd, jump to Function ok
  - If the attacker has a move with the following effect: Sharply lowers SpAtk, jump to Function ok
  - If the attacker has a move with the following effect: Sharply lowers SpDef, jump to Function ok
  - If the attacker has a move with the following effect: Sharply lowers Move Accuracy, jump to Function ok
  - If the attacker has a move with the following effect: Sharply lowers Evasion, jump to Function ok

## Effect 299: Make the target's ability the same as the user's

Start
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 300: Force the target to attack first next turn

Start
  - END

## Effect 301: Round effect

Start
  - END

## Effect 302: Echoes Voice effect

Start
  - END

## Effect 303: Deal damage ignoring target stat changes

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, End
  - If the attacker's Def stat is under 9, jump to End
  - If the attacker's Spedef stat is under 9, jump to End
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 304: Deal damage and remove target stat changes

Start
  - If the defender's Atk stat is at +3 or more, jump to Function ok
  - If the defender's Def stat is at +3 or more, jump to Function ok
  - If the defender's SpAtk stat is at +3 or more, jump to Function ok
  - If the defender's Spedef stat is at +3 or more, jump to Function ok
  - If the defender's Evasion stat is at +3 or more, jump to Function ok
  - 19.5% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 305: Deal damage based on amount of user's stat increases

Start
  - Check Move Type Effectiveness: 0, End
  - Check Move Type Effectiveness: 1.4, End
  - Check Move Type Effectiveness: 1.2, End
  - If the attacker's Atk stat is at +3 or more, jump to Function next
  - If the attacker's Def stat is at +3 or more, jump to Function next
  - If the attacker's SpAtk stat is at +3 or more, jump to Function next
  - If the attacker's Spedef stat is at +3 or more, jump to Function next
  - If the attacker's Evasion stat is at +3 or more, jump to Function next
  - Jump to End

Function next
  - If the attacker has a move with the following effect: Curse effect, jump to Function ok
  - If the attacker has a move with the following effect: Raises user's Def and SpDef, jump to Function ok
  - If the attacker has a move with the following effect: Raises user's Atk and Def, jump to Function ok
  - If the attacker has a move with the following effect: Raises user's SpAtk and SpDef, jump to Function ok
  - If the attacker has a move with the following effect: Raises user's Atk and Spd, jump to Function ok
  - If the attacker has a move with the following effect: Sharply raises a random stat of the target, jump to Function ok
  - If the attacker has a move with the following effect: Boost Attack and Move Accuracy, jump to Function ok
  - If the attacker has a move with the following effect: Raise SpAtk, SpDef, and Speed, jump to Function ok
  - If the attacker has a move with the following effect: Lower Def and SpDef, Sharply raise Atk, SpAtk, and Speed, jump to Function ok
  - If the attacker has a move with the following effect: Raise Atk and SpAtk, doubled in sunlight, jump to Function ok
  - If the attacker has a move with the following effect: Raise Atk, Def, and Move Accuracy, jump to Function ok
  - If the attacker's Atk stat is over 10, jump to Function ok
  - If the attacker's Def stat is over 10, jump to Function ok
  - If the attacker's SpAtk stat is over 10, jump to Function ok
  - If the attacker's Spedef stat is over 10, jump to Function ok
  - If the attacker's Evasion stat is over 10, jump to Function ok
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 306: Protect allies against priority moves

Start
  - Check Fake Out: Check Defence
  - If it's 0, jump to Function ok
  - Change Score: -1

Function ok
  - 50% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 307: Swap positions with ally

Start
  - END

## Effect 308: Lower Def and SpDef, Sharply raise Atk, SpAtk, and Speed

Start
  - If the attacker's Def stat is under 6, jump to Function ng
  - If the attacker's Spedef stat is under 6, jump to Function ng
  - Jump to End

Function ng
  - Change Score: -1

End
  - END

## Effect 309: Restore target's hp

Start
  - END

## Effect 310: Deal double damage to status inflicted targets

Start
  - END

## Effect 311: Sky Drop Effect

Start

## Effect 312: Raise Atk and sharply raise Speed

Start
  - If Player is faster, jump to Function Ok
  - If the attacker's HP% > 50%, jump to End
  - 19.5% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 313: Circle Throw effect

Start

## Effect 314: Deal damage and remove target's berry

Start
  - Check Turn
  - If it's not 0, jump to End
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 315: Force target to move last this turn

Start
  - END

## Effect 316: Raise Atk and SpAtk, doubled in sunlight

Start
  - If the attacker's HP% > 70%, jump to End
  - 19.5% chance to jump to End
  - Change Score: -1

End
  - END

## Effect 317: Double damage when not holding an item

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng
  - Check Move Type Effectiveness: 1.4, jump to Function Ng
  - Check Move Type Effectiveness: 1.2, jump to Function Ng
  - If the attacker is holding 0, jump to Function ok

Function ng
  - 19.5% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

## Effect 318: Change user's type to target's

Start
  - Get attacker's Type1
  - If Table Jump: Expertai 318 Ok Table, jump to Function Ok
  - If Table Jump: Expertai 318 Ng Table, jump to Function Ng
  - Get attacker's Type2
  - If Table Jump: Expertai 318 Ok Table, jump to Function Ok
  - If Table Jump: Expertai 318 Ng Table, jump to Function Ng
  - Jump to End

Function ng
  - 19.5% chance to jump to End
  - Change Score: -1
  - Jump to End

Function ok
  - 19.5% chance to jump to End
  - Change Score: 1

End
  - END

Function Table

Function Table

## Effect 319: Deal double damage if a teamate fainted last turn

Start
  - END

## Effect 320: Deal damage equal to user's HP

Start
  - If Migawari: Check Defence, jump to Function Ng
  - If Have Batsugun: Expertai 320 Ng
  - If the defender's HP% < 40%, jump to Function ng
  - If the attacker's HP% > 40%, jump to End
  - 19.5% chance to jump to End

Function ng
  - Change Score: -2

End
  - END

## Effect 321: Raise SpAtk by 3 Stages

Start

## Effect 322: Raise Atk, Def, and Move Accuracy

Start

## Effect 323: Give held item to target

Start
  - END

## Effect 324: Water Pledge effect

Start
  - END

## Effect 325: Fire Pledge effect

Start
  - END

## Effect 326: Grass Pledge effect

Start
  - END

## Effect 327: Raise Atk and SpAtk

Start
  - If the attacker's Atk stat is under 9, jump to Function 1
  - 39.1% chance to jump to Function 3
  - Change Score: -1
  - Jump to Function 3

Function 1
  - If the attacker's SpAtk stat is under 9, jump to Function 2
  - 39.1% chance to jump to Function 3
  - Change Score: -1
  - Jump to Function 3

Function 2
  - If the attacker's HP% != 100%, jump to Function 4
  - If the attacker has a move with the following effect: Baton Pass effect, jump to Function 3
  - 50% chance to jump to Function 4

Function 3
  - Change Score: 2

Function 4
  - If the attacker's HP% > 70%, jump to End
  - If the attacker's HP% < 40%, jump to Function 5
  - 15.6% chance to jump to End

Function 5
  - Change Score: -2

End
  - END

## Effect 328: Raise Def by 3 Stages

Start

## Effect 329: Chance to put target to sleep

Start
  - END

## Effect 330: Deal damage and lower target's speed

Start
  - If Player is faster, jump to Function 1
  - Change Score: -1
  - Jump to End

Function 1
  - 27.3% chance to jump to End
  - Change Score: 2

End
  - END

## Effect 331: Freeze Shock effect

Start

## Effect 332: Ice Burn effect

Start
  - Check Move Type Effectiveness: 0, jump to Function Ng1
  - Check Move Type Effectiveness: 1.4, jump to Function Ng1
  - Check Move Type Effectiveness: 1.2, jump to Function Ng1
  - If Move Seqno Jump: 151, jump to Function Sun
  - Jump to Function itemcheck

## Effect 333: Unknown

Start
  - END

## Effect 337: Hurricane effect

Start
