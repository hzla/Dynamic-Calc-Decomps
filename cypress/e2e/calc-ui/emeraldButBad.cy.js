describe('Emerald but Bad calc configuration', () => {
  const calcUrl = './index.html?data=badem&dmgGen=3&gen=3&switchIn=3&types=3&view=calculator'

  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit(calcUrl)
  })

  it('loads as a vanilla Gen 3 Emerald profile with Dex enabled', () => {
    cy.get('#rom-title').should('have.text', 'Emerald but Bad')
    cy.window().its('backup_data.title').should('eq', 'Emerald but Bad')

    cy.window().then((win) => {
      const runtimeSettings = win.eval('settings')

      expect(runtimeSettings.gen).to.eq(3)
      expect(runtimeSettings.damageGen).to.eq(3)
      expect(runtimeSettings.gameSwitchIn).to.eq(3)
      expect(runtimeSettings.switchIn).to.eq(3)
      expect(runtimeSettings.typeChart).to.eq(3)
      expect(runtimeSettings.critGen).to.eq(5)
      expect(runtimeSettings.sourceType).to.eq('full')
      expect(runtimeSettings.physSpecSplit).to.eq(false)
      expect(win.eval('mechanics')).to.eq('vanilla')

      expect(win.baseGame).to.eq('g3')
      expect(win.$('#read-save').attr('for')).to.eq('save-upload')

      expect(win.$('#main-nav-dex').is(':visible')).to.eq(true)
      expect(win.$('#dex-show').is(':visible')).to.eq(true)
      expect(win.eval('getDexGameIdForTitle("Emerald but Bad")')).to.eq('badem')

      expect(win.$('.main-view-tab[data-view="fragsheet"]').is(':visible')).to.eq(false)
      expect(win.$('#main-nav-battle-log').is(':visible')).to.eq(false)
      expect(win.$('#show-ai').is(':visible')).to.eq(false)
    })
  })

  it('falls back to the calculator when the Fragsheet view is requested', () => {
    cy.visit(calcUrl.replace('view=calculator', 'view=fragsheet'))
    cy.get('#rom-title').should('have.text', 'Emerald but Bad')
    cy.window().its('backup_data.title').should('eq', 'Emerald but Bad')
    cy.window().invoke('getCurrentMainPageView').should('eq', 'calculator')
  })
})
