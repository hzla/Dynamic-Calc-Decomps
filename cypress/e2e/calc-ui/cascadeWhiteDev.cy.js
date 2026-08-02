describe('Cascade White Dev calc initialization', () => {
  it('loads the backup profile without reading TITLE before it is defined', () => {
    const startupErrors = []

    cy.clearLocalStorage()
    cy.on('window:before:load', (win) => {
      win.addEventListener('error', (event) => {
        startupErrors.push(event.error?.message || event.message)
      })
    })
    cy.visit('./index.html?data=casc2&view=calculator')

    cy.get('#rom-title').should('have.text', 'Cascade White Dev')
    cy.window().then((win) => {
      const runtimeSettings = win.eval('settings')

      expect(win.backup_data.title).to.eq('Cascade White')
      expect(runtimeSettings.damageGen).to.eq(5)
      expect(runtimeSettings.gameSwitchIn).to.eq(5)
      expect(runtimeSettings.sourceType).to.eq('full')
      expect(win.baseGame).to.eq('BW')
      expect(win.eval('baseVersion')).to.eq('BW2')
      expect(startupErrors.filter((message) => message.includes('TITLE'))).to.deep.eq([])
    })
  })
})
