describe('Brutal Black calc configuration', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./index.html?data=brutalblack&dmgGen=5&gen=5&types=5')
  })

  it('loads as a Gen 5 Black/White romhack profile', () => {
    cy.get('#rom-title').should('have.text', 'Brutal Black')
    cy.window().its('backup_data.title').should('eq', 'Brutal Black')

    cy.window().then((win) => {
      const runtimeSettings = win.eval('settings')

      expect(runtimeSettings.gen).to.eq(5)
      expect(runtimeSettings.damageGen).to.eq(5)
      expect(runtimeSettings.gameSwitchIn).to.eq(5)
      expect(runtimeSettings.switchIn).to.eq(5)
      expect(runtimeSettings.typeChart).to.eq(5)
      expect(runtimeSettings.critGen).to.eq(5)
      expect(runtimeSettings.sourceType).to.eq('full')

      expect(win.baseGame).to.eq('BW')
      expect(win.eval('baseVersion')).to.eq('BW')
      expect(win.$('#read-save').attr('for')).to.eq('save-upload-g45')

      expect(win.$('#main-nav-dex').is(':visible')).to.eq(true)
      expect(win.$('#dex-show').is(':visible')).to.eq(true)
      expect(win.$('#show-ai').is(':visible')).to.eq(true)

      const brutalBlackSplits = win.eval('splitData["Brutal Black"]')
      expect(brutalBlackSplits.lvls).to.deep.eq([16, 27, 35, 44, 50, 62, 67, 76, 82])
      expect(brutalBlackSplits.titles).to.deep.eq([
        'Cilan/Chili/Cress',
        'Lenora',
        'Burgh',
        'Elesa',
        'Clay',
        'Skyla',
        'Brycen',
        'Drayden',
        'Elite 4'
      ])
      expect(win.eval('getDexGameIdForTitle("Brutal Black")')).to.eq('brutalblack')
    })
  })
})
