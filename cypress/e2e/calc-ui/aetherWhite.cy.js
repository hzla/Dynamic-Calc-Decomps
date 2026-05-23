const white2BaseRomCalcs = [
  { title: 'Aether White 2', data: 'aetherwhite' },
  { title: 'Wishy Washy White 2', data: 'wishywashy' }
]

describe('White 2 base rom calc configuration', () => {
  white2BaseRomCalcs.forEach((calc) => {
    describe(calc.title, () => {
      beforeEach(() => {
        cy.on('uncaught:exception', () => false)
        cy.clearLocalStorage()
        cy.viewport(1920, 1080)
        cy.visit(`./index.html?data=${calc.data}&gen=8&types=5`)
      })

      it('loads the data source with the expected runtime settings', () => {
        cy.get('#rom-title').should('have.text', calc.title)
        cy.window().its('backup_data.title').should('eq', calc.title)

        cy.window().then((win) => {
          const runtimeSettings = win.eval('settings')

          expect(runtimeSettings.damageGen).to.eq(5)
          expect(runtimeSettings.gameSwitchIn).to.eq(5)
          expect(runtimeSettings.typeChart).to.eq(5)
          expect(runtimeSettings.critGen).to.eq(5)
          expect(win.baseGame).to.eq('BW')
          expect(win.eval('baseVersion')).to.eq('BW2')

          expect(win.$('#open-dex').is(':visible')).to.eq(false)
          expect(win.$('#main-nav-dex').is(':visible')).to.eq(false)
          expect(win.$('#dex-show').is(':visible')).to.eq(false)
        })
      })

      it('shows Gen 5 switch AI info by default', () => {
        cy.get('#open-menu').click()

        cy.window().then((win) => {
          expect(win.$('#toggle-switch-ai-info').is(':visible')).to.eq(true)
          expect(win.$('#toggle-switch-ai-info input').prop('checked')).to.eq(true)
          expect(win.eval('shouldShowSwitchAiInfo()')).to.eq(true)
        })
      })
    })
  })
})
