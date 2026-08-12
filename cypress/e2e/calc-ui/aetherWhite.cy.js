const white2BaseRomCalcs = [
  { title: 'Aether White 2', data: 'aetherwhite', showDex: false },
  { title: 'Wishy Washy White 2', data: 'wishywashy', showDex: false },
  {
    title: 'Wishy Washy White 2 Redux',
    data: 'wishywashywhite2redux',
    showDex: true,
    dexGame: 'wishywashywhite2redux'
  }
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

          expect(win.eval('showDex')).to.eq(calc.showDex)
          expect(win.$('#main-nav-dex').is(':visible')).to.eq(calc.showDex)
          expect(win.$('#dex-show').is(':visible')).to.eq(calc.showDex)

          if (!calc.showDex) {
            expect(win.$('#open-dex').is(':visible')).to.eq(false)
          }

          if (calc.dexGame) {
            expect(win.eval('getDexGameQuery()')).to.eq(`game=${calc.dexGame}`)
          }
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

  it('lists the original and Redux releases as separate romhack cards', () => {
    cy.visit('./index.html')
    cy.get('#open-romhack-modal').click()

    cy.get('#romhack-browser-content .romhack-browser-game-title').then(($titles) => {
      const titles = [...$titles].map((title) => title.textContent.trim())

      expect(titles.filter((title) => title === 'Wishy Washy White 2')).to.have.length(1)
      expect(titles.filter((title) => title === 'Wishy Washy White 2 Redux')).to.have.length(1)
    })

    cy.window().then((win) => {
      const original = win.romhackGameIndex['wishy-washy-white-2']
      const redux = win.romhackGameIndex['wishy-washy-white-2-redux']

      expect(original.title).to.eq('Wishy Washy White 2')
      expect(redux.title).to.eq('Wishy Washy White 2 Redux')
      expect(original.variants[0].source).to.include('data=wishywashy&')
      expect(redux.variants[0].source).to.include('data=wishywashywhite2redux&')
    })
  })
})
