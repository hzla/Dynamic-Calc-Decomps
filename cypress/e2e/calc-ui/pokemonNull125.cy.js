describe('Pokemon Null versions', () => {
  beforeEach(() => cy.clearLocalStorage())

  for (const [slug, title, slowkingAbility] of [
    ['null125', 'Pokemon Null 1.2.5', 'Regenerator'],
    ['null', 'Pokemon Null 1.2', 'Shell Armor']
  ]) {
    it(`loads ${title} with its matching data and import tables`, () => {
      cy.visit(`/index.html?data=${slug}`)
      cy.get('#rom-title', {timeout: 30000}).should('have.text', title)
      cy.get('#mainResult', {timeout: 30000}).should('not.have.text', 'Loading...')
      cy.window().then(win => {
        expect(win.eval('TITLE')).to.eq(title)
        expect(win.eval('settings').damageGen).to.eq(8)
        expect(win.baseGame).to.eq('null')
        expect(win.nullAbilities.slowking[0]).to.eq(slowkingAbility)
        expect(win.backup_data.formatted_sets).not.to.be.empty
        expect(win.eval('moves["Zippy Zap"].willCrit')).to.eq(false)
        expect(win.romhackGameIndex['pokemon-null'].variants.map(v => v.label)).to.include.members(['1.2.5', '1.2', '1.1'])
        if (slug === 'null125') {
          expect(win.nullItems[689]).to.eq('Recall Charm')
          expect(win.backup_data.moves.hurricane.isWind).to.eq(true)
          expect(win.backup_data.poks['Deoxys-Attack'].abilities[0]).to.eq('Scrappy')
          expect(win.nullAbilities.deoxysattack[0]).to.eq('Scrappy')
        }
      })
    })

    it(`uses distinct alternate-form stats in ${title}'s UI and damage engine`, () => {
      cy.visit(`/index.html?data=${slug}`)
      cy.get('#rom-title', {timeout: 30000}).should('have.text', title)
      cy.get('#mainResult', {timeout: 30000}).should('not.have.text', 'Loading...')
      for (const [base, forme, attack, specialAttack, speed] of [
        ['Greninja', 'Greninja-Ash', 145, 153, 132],
        ['Palafin', 'Palafin-Hero', 160, 106, 100]
      ]) {
        cy.window().then(win => {
          win.$('#p1 input.set-selector').val(`${base} (Blank Set)`).change()
        })
        cy.get('#p1 .forme').select(forme)
        cy.get('#p1 .at .base').should('have.value', String(attack))
        cy.get('#p1 .sa .base').should('have.value', String(specialAttack))
        cy.get('#p1 .sp .base').should('have.value', String(speed))
        cy.window().then(win => {
          const mon = win.createPokemon(win.$('#p1'))
          expect(mon.species.baseStats.atk).to.eq(attack)
          expect(mon.species.baseStats.spa).to.eq(specialAttack)
          expect(mon.species.baseStats.spe).to.eq(speed)
        })
        cy.get('#p1 .forme').select(base)
      }
    })
  }
})
