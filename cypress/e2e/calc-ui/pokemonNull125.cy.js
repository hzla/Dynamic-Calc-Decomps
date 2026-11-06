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
      cy.window().should(win => expect(win.backup_data && win.backup_data.formatted_sets).to.be.an('object'))
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

    it(`uses Null's 20-BP Water Shuriken against Winston in ${title}`, () => {
      cy.visit(`/?data=${slug}&evs=0&view=calculator`)
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.TITLE).to.eq(title)
        expect(win.setdex?.Magcargo).to.exist
        expect(win.eval('initializing')).to.eq(false)
        expect(win.eval('changingSets')).to.eq(false)
      })
      cy.window().then(win => {
        win.setdex.Greninja = win.setdex.Greninja || {}
        win.setdex.Greninja['My Box'] = {
          level: 38, ability: 'Protean', nature: 'Naive', item: '',
          ivs: { hp: 31, at: 19, df: 31, sa: 31, sd: 24, sp: 25 },
          moves: ['Water Shuriken', 'Icy Wind', 'Waterfall', 'Low Kick'],
        }
        win.$('input.player.set-selector').val('Greninja (My Box)').trigger('change')
      })
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
      cy.window().then(win => {
        win.setOpposing('Magcargo (Lvl 36 Rich Boy Winston |Route 104|)')
      })
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
      cy.get('#p1 .move1 .move-bp').should('have.value', '20')
      cy.get('#p1 .move1 .move-hits').select('2')
      cy.get('label[for="resultMoveL1"]').click()
      cy.get('#resultDamageL1').should('have.text', '96 - 120%')
      cy.get('#mainResult').should('contain.text', 'Water Shuriken').and('contain.text', '96-120')
      cy.get('#p1 .move1 .move-hits').select('3')
      cy.get('#resultDamageL1').should('have.text', '144 - 180%')
    })
  }
})
