const routes = [
  { name: 'custom gen789', url: '/index.html?data=inc&gen=8&dmgGen=8&types=6&switchIn=11&view=calculator' },
  { name: 'vanilla gen789', url: '/index.html?dev=1&gen=9&dmgGen=9&view=calculator' },
]

describe('Electromorphosis charge toggle', () => {
  for (const route of routes) {
    it(`toggles Electric move power on both sides in ${route.name}`, () => {
      cy.visit(route.url, { onBeforeLoad(win) { win.localStorage.clear() } })
      cy.viewport(1280, 900)
      cy.get('#rom-title').should('have.text', route.name === 'custom gen789' ? 'Inclement Emerald' : 'Blank Slate Dev Calc')
      cy.window().should(win => {
        expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
        expect(win.eval('initializing')).to.eq(false)
        expect(win.$('input.player').data('select2')).to.be.an('object')
        expect(win.setdex).to.be.an('object')
      })
      cy.window().then(win => {
        win.$('input.player').val('Mew (Blank Set)').change()
        win.$('.player .select2-chosen').text('Mew (Blank Set)')
      })
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
      cy.window().then(win => {
        win.$('input.opposing').val('Mew (Blank Set)').change()
        win.$('.opposing .select2-chosen').text('Mew (Blank Set)')
      })
      for (const side of ['p1', 'p2']) {
        cy.get(`#${side} .ability`).select('Electromorphosis')
        cy.get(`#${side} .abilityToggle`).should('be.visible').and('not.be.checked')
        cy.get(`#${side} .move1 select.move-selector`).select('Thunderbolt', { force: true })
        cy.get(`#${side} .move2 select.move-selector`).select('Flamethrower', { force: true })
        cy.window().then(win => {
          const attacker = win.createPokemon(win.$(`#${side}`))
          const defender = win.createPokemon(win.$(`#${side === 'p1' ? 'p2' : 'p1'}`))
          const field = win.createField()
          const damage = attacker.moves.slice(0, 2).map(move => win.calc.calculate(win.eval('gen'), attacker, defender, move, field).damage)
          win.__electromorphosisBaseline = damage
        })
        cy.get(`#${side} .abilityToggle`).check()
        cy.window().should(win => {
          expect(win.damageResults[side === 'p1' ? 0 : 1][0].rawDesc.attackerAbility).to.eq('Electromorphosis')
        })
        cy.window().then(win => {
          const attacker = win.createPokemon(win.$(`#${side}`))
          const defender = win.createPokemon(win.$(`#${side === 'p1' ? 'p2' : 'p1'}`))
          const field = win.createField()
          const gen = win.eval('gen')
          expect(attacker.abilityOn).to.eq(true)
          const electric = attacker.moves[0]
          const reference = new win.calc.Move(gen, electric.name, { overrides: { basePower: electric.bp * 2 } })
          const ordinaryAttacker = attacker.clone()
          ordinaryAttacker.ability = 'No Ability'
          const result = win.calc.calculate(gen, attacker, defender, electric, field)
          expect(result.damage).to.deep.eq(win.calc.calculate(gen, ordinaryAttacker, defender, reference, field).damage)
          expect(result.range()[1]).to.be.greaterThan(Math.max(...win.__electromorphosisBaseline[0]))
          expect(win.calc.calculate(gen, attacker, defender, attacker.moves[1], field).damage).to.deep.eq(win.__electromorphosisBaseline[1])
        })
        // Editing moves retains the user's charge setting; changing the ability resets it.
        cy.get(`#${side} .move2 select.move-selector`).select('Ice Beam', { force: true })
        cy.get(`#${side} .abilityToggle`).should('be.checked').uncheck()
        cy.get(`#${side} .ability`).select('Flash Fire')
        cy.get(`#${side} .abilityToggle`).check()
        cy.get(`#${side} .ability`).select('Electromorphosis')
        cy.get(`#${side} .abilityToggle`).should('not.be.checked')
      }
    })
  }

  it('leaves newly loaded sets, box matchups and trainer previews uncharged', () => {
    cy.visit(routes[0].url, { onBeforeLoad(win) { win.localStorage.clear() } })
    cy.get('#rom-title').should('have.text', 'Inclement Emerald')
    cy.window().should(win => {
      expect(win.setdex).to.be.an('object')
      expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
      expect(win.eval('initializing')).to.eq(false)
    })
    cy.window().then(win => {
      const setName = 'Lvl 50 Electromorphosis Test'
      const data = { level: 50, ability: 'Electromorphosis', nature: 'Hardy', item: '-',
        moves: ['Thunderbolt', 'Spark', 'Flamethrower', 'Protect'], tr_id: 990801, sub_index: 0 }
      win.setdex.Mew = win.setdex.Mew || {}
      win.setdex.Mew[setName] = data
      win.TR_NAMES = win.get_trainer_names()
      win.__electromorphosisSetId = `Mew (${setName})`
      win.$('input.opposing').val(win.__electromorphosisSetId).change()
      win.$('.opposing .select2-chosen').text(win.__electromorphosisSetId)
      expect(win.createPokemon(win.__electromorphosisSetId).abilityOn).to.eq(false)
      const boxed = new win.calc.Pokemon(8, 'Mew', { ability: 'Electromorphosis', abilityOn: true })
      expect(win.normalizeBoxAbilityForCalc(boxed).abilityOn).to.eq(false)
      expect(win.eval('defaultOffAbilities')).to.include('Electromorphosis')
    })
    cy.get('#p2 .abilityToggle').should('be.visible').and('not.be.checked').check()
    cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
    cy.window().then(win => win.setOpposing(win.__electromorphosisSetId))
    cy.get('#p2 .abilityToggle').should('not.be.checked')
  })
})
