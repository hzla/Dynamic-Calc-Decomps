describe('Physical/special split URL override', () => {
  beforeEach(() => cy.clearLocalStorage())

  it('overrides saved settings, updates move fields, and lets the menu change the URL', () => {
    cy.visit('./index.html?data=heartandsoul&psSplit=0', {
      onBeforeLoad(win) {
        win.localStorage.setItem('calcPhysSpecSplit:Heart & Soul 2.0.6', '1')
      }
    })
    cy.window({ timeout: 30000 }).should(win => {
      expect(win.eval('settings').physSpecSplit).to.eq(false)
      expect(win.moves['Thunder Punch'].category).to.eq('Special')
      expect(win.MOVES_BY_ID[8].thunderpunch.category).to.eq('Special')
      expect(new win.calc.Move(8, 'Thunder Wave').category).to.eq('Status')
    })
    cy.get('#p1 .move1 select.move-selector').select('Thunder Punch', { force: true })
    cy.window().should(win => expect(win.damageResults[0][0].move.category).to.eq('Special'))
    cy.get('#open-menu').click()
    cy.get('#toggle-phys-spec-split').should('be.visible').find('input').should('not.be.checked')
    cy.get('#toggle-phys-spec-split .slider').click()
    cy.location('search').should('contain', 'psSplit=1')
    cy.window({ timeout: 30000 }).should(win => {
      expect(win.eval('settings').physSpecSplit).to.eq(true)
      expect(new win.calc.Move(8, 'Thunder Punch').category).to.eq('Physical')
    })
  })

  it('overrides a game that normally requires the split', () => {
    cy.visit('./index.html?data=rp&psSplit=0')
    cy.window({ timeout: 30000 }).should(win => {
      expect(win.eval('settings').damageGen).to.eq(4)
      expect(win.eval('settings').physSpecSplit).to.eq(false)
      expect(win.moves['Thunder Punch'].category).to.eq('Special')
    })
    cy.get('#open-menu').click()
    cy.get('#toggle-phys-spec-split').should('be.visible')
  })

  it('honors the URL override when loading a blank developer calc', () => {
    cy.visit('./index.html?dev=1&psSplit=0')
    cy.window({ timeout: 30000 }).should(win => {
      expect(win.eval('settings').blankDevMode).to.eq(true)
      expect(win.eval('settings').physSpecSplit).to.eq(false)
      expect(win.moves['Thunder Punch'].category).to.eq('Special')
      expect(new win.calc.Move(8, 'Thunder Punch').category).to.eq('Special')
    })
    cy.get('#open-menu').click()
    cy.get('#toggle-phys-spec-split').should('be.visible').find('input').should('not.be.checked')
  })
})
