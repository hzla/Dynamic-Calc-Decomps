describe('FireRed omega calc configuration', () => {
  const calcUrl = './index.html?data=frol&dmgGen=3&gen=3&switchIn=3&types=3&view=calculator'

  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit(calcUrl)
  })

  it('loads with vanilla Gen 3 mechanics and the FRLG save reader', () => {
    cy.get('#rom-title').should('have.text', 'FireRed ω')
    cy.window().its('backup_data.title').should('eq', 'FireRed ω')

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
      expect(win.requestedBaseGame).to.eq('FRLG')
      expect(win.eval('g3ShouldHandleSaveUpload()')).to.eq(true)
      expect(win.$('#read-save').attr('for')).to.eq('save-upload')

      expect(win.$('#main-nav-dex').is(':visible')).to.eq(false)
      expect(win.$('#dex-show').is(':visible')).to.eq(false)
      expect(win.$('#show-ai').is(':visible')).to.eq(false)

      expect(win.backup_data.moves['Hyper Beam'].category).to.eq('Physical')
      expect(win.backup_data.moves['Play Rough'].type).to.eq('Fairy')
    })
  })

  it('lists FireRed omega separately from the older Fire Red Omega profile', () => {
    cy.get('#open-romhack-modal').click()

    cy.get('#romhack-browser-content .romhack-browser-game-title').then(($titles) => {
      const titles = [...$titles].map((title) => title.textContent.trim())

      expect(titles.filter((title) => title === 'Fire Red Omega')).to.have.length(1)
      expect(titles.filter((title) => title === 'FireRed ω')).to.have.length(1)
    })

    cy.window().then((win) => {
      const game = win.romhackGameIndex['firered-omega']

      expect(game.title).to.eq('FireRed ω')
      expect(game.variants[0].source).to.include('data=frol&')
    })
  })
})
