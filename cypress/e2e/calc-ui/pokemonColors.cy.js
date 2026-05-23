const pokemonColorsCalcs = [
  { title: 'Pokemon Colors Normal', data: 'colorsnormal' },
  { title: 'Pokemon Colors Classic', data: 'colorsclassic' }
]

describe('Pokemon Colors calc configuration', () => {
  pokemonColorsCalcs.forEach((calc) => {
    describe(calc.title, () => {
      beforeEach(() => {
        cy.on('uncaught:exception', () => false)
        cy.clearLocalStorage()
        cy.viewport(1920, 1080)
        cy.visit(`./index.html?data=${calc.data}&dmgGen=3&gen=8&switchIn=3&types=3`)
      })

      it('loads with Royal Sapphire-style Gen 3 settings', () => {
        cy.get('#rom-title').should('have.text', calc.title)
        cy.window().its('backup_data.title').should('eq', calc.title)

        cy.window().then((win) => {
          const runtimeSettings = win.eval('settings')

          expect(runtimeSettings.damageGen).to.eq(3)
          expect(runtimeSettings.gameSwitchIn).to.eq(3)
          expect(runtimeSettings.switchIn).to.eq(3)
          expect(runtimeSettings.typeChart).to.eq(3)
          expect(runtimeSettings.critGen).to.eq(5)
          expect(runtimeSettings.sourceType).to.eq('full')
          expect(runtimeSettings.physSpecSplit).to.eq(true)
          expect(win.baseGame).to.eq('g3')
          expect(win.$('#read-save').attr('for')).to.eq('save-upload')

          expect(win.backup_data.moves['Hyper Beam'].category).to.eq('Special')
          expect(win.backup_data.moves.Pound.category).to.eq('Physical')
          expect(win.MOVES_BY_ID[8].hyperbeam.category).to.eq('Special')
          expect(win.MOVES_BY_ID[8].pound.category).to.eq('Physical')

          expect(win.$('#open-dex').is(':visible')).to.eq(false)
          expect(win.$('#main-nav-dex').is(':visible')).to.eq(false)
          expect(win.$('#dex-show').is(':visible')).to.eq(false)
          expect(win.$('#show-ai').is(':visible')).to.eq(false)
        })
      })
    })
  })
})
