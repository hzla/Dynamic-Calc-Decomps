describe('Cascade White Dev post-KO switch preview', () => {
  it('scores Erika and Gardenia using the loaded game data', () => {
    cy.clearLocalStorage()
    cy.visit('./index.html?data=casc2&view=calculator')
    cy.get('#rom-title').should('have.text', 'Cascade White Dev')
    cy.window().then((win) => {
      expect(win.eval('settings').customCascadeSwitchAIG4).to.eq(true)
      // Normally initialized by get_next_in before it dispatches to the scorer.
      win.expYields = win.vanillaG5ExpYields
      const player = (name, level) => new win.calc.Pokemon(5, name, {
        level, ability: 'No Ability', moves: [new win.calc.Move(5, 'Tackle')]
      })
      const trainerId = (species, trainerPart) => {
        const name = Object.keys(win.SETDEX_BW[species]).find(name => name.includes(trainerPart))
        expect(name, `${species} trainer set`).to.be.a('string')
        return `${species} (${name})[${win.SETDEX_BW[species][name].sub_index}]`
      }

      const victreebel = player('Victreebel', 42)
      const erikaContext = win.g5BuildCascadeContext(victreebel, 'Grass', 'Poison')
      erikaContext.playerAbility = ''
      const erika = win.g5BuildCascadeDevHybridRankings([
        trainerId('Cherrim', 'Kanto Leader Erika'),
        trainerId('Nidoqueen', 'Kanto Leader Erika')
      ], victreebel, erikaContext)
      expect(erika[0][0]).to.match(/^Nidoqueen /)
      expect(erika[0][1]).to.eq(16)
      expect(erika[1][1]).to.eq(8)

      win.CURRENT_TRAINER_POKS = erika.map(row => row[0])
      win.$('.type1').first().val('Grass')
      win.$('.type2').first().val('Poison')
      const dispatched = win.get_next_in_g5()
      expect(dispatched[0][0]).to.match(/^Nidoqueen /)
      expect(dispatched[0][1]).to.eq(16)

      const scyther = player('Scyther', 62)
      const gardeniaContext = win.g5BuildCascadeContext(scyther, 'Bug', 'Flying')
      gardeniaContext.playerAbility = ''
      const gardenia = win.g5BuildCascadeDevPhase2Rankings([
        trainerId('Roserade', 'Sinnoh Leader Gardenia2'),
        trainerId('Leafeon', 'Sinnoh Leader Gardenia2')
      ], scyther, gardeniaContext, false)
      expect(gardenia[0][1]).to.eq(160)
      expect(gardenia[0][2]).to.eq('Hyper Beam')
      expect(gardenia[1][1]).to.eq(120)
      expect(gardenia[1][2]).to.eq('Double-Edge')
    })
  })

  it('uses the selected Cascade field and still accepts an explicit legacy-mode opt-out', () => {
    cy.visit('./index.html?data=casc2&view=calculator&cascAIG4=0')
    cy.get('#rom-title').should('have.text', 'Cascade White Dev')
    cy.get('#chargestone').click({ force: true })
    cy.window().then((win) => {
      expect(win.eval('settings').customCascadeSwitchAIG4).to.eq(false)
      const player = new win.calc.Pokemon(5, 'Sandslash', { level: 50, moves: [new win.calc.Move(5, 'Tackle')] })
      const context = win.g5BuildCascadeContext(player, 'Ground', 'Ground')
      expect(context.fieldEffects.chargestone).to.eq(true)
      expect(win.g5CascadeGameTypeInfo(['Ground', 'Ground'], false, context).Electric).to.eq(0.5)
      win.$('#clear-cascade').prop('checked', true)
      const resetContext = win.g5BuildCascadeContext(player, 'Ground', 'Ground')
      expect(resetContext.fieldEffects.chargestone).not.to.eq(true)
      expect(win.g5CascadeGameTypeInfo(['Ground', 'Ground'], false, resetContext).Electric).to.eq(0)
      win.$('#p1 .move1 .move-pp').val('0')
      const copiedContext = win.g5BuildCascadeContext(player, 'Ground', 'Ground')
      expect(copiedContext.playerMovePPs[0]).to.eq(0)
    })
  })
})
