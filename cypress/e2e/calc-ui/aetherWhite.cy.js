describe('Aether White 2 calc configuration', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./index.html?data=aetherwhite&gen=8&types=5')
  })

  it('loads the Aether White 2 data source with the expected runtime settings', () => {
    cy.get('#rom-title').should('have.text', 'Aether White 2')

    cy.window().then((win) => {
      const runtimeSettings = win.eval('settings')

      expect(runtimeSettings.damageGen).to.eq(5)
      expect(runtimeSettings.gameSwitchIn).to.eq(5)
      expect(runtimeSettings.typeChart).to.eq(5)
      expect(runtimeSettings.critGen).to.eq(5)
      expect(win.baseGame).to.eq('BW')
      expect(win.eval('baseVersion')).to.eq('BW2')
      expect(win.backup_data && win.backup_data.title).to.eq('Aether White 2')

      expect(win.$('#open-dex').is(':visible')).to.eq(false)
      expect(win.$('#main-nav-dex').is(':visible')).to.eq(false)
      expect(win.$('#dex-show').is(':visible')).to.eq(false)
    })
  })

  it('shows Gen 5 switch AI info by default for Aether White 2', () => {
    cy.get('#open-menu').click()

    cy.window().then((win) => {
      expect(win.$('#toggle-switch-ai-info').is(':visible')).to.eq(true)
      expect(win.$('#toggle-switch-ai-info input').prop('checked')).to.eq(true)
      expect(win.eval('shouldShowSwitchAiInfo()')).to.eq(true)
    })
  })
})
