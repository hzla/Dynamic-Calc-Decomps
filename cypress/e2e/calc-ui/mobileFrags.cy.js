describe('Mobile KO fragsheet controls', () => {
  it('records a frag once and shows only three mobile columns, restoring desktop columns on resize', () => {
    cy.clearLocalStorage()
    cy.viewport(390, 844)
    cy.visit('./index.html?data=aetherwhite&gen=8&types=5&view=calculator')
    cy.window().should(win => expect(win.eval('initializing')).to.eq(false))
    cy.window().should(win => expect(win.eval('changingSets')).not.to.eq(true))
    cy.window().then(win => win.$('#p1 .set-selector').val('Pikachu (Blank Set)').trigger('change'))
    cy.window().should(win => expect(win.eval('changingSets')).not.to.eq(true))
    let playerSpecies
    cy.window().then(win => {
      const playerSet = win.$('.player.set-selector').first().val()
      playerSpecies = playerSet.split(' (')[0]
      expect(playerSpecies).to.eq('Pikachu')
      const sets = { [playerSpecies]: { 'My Box': { nature: 'Hardy', ability: 'Unknown' } } }
      win.customSets = sets
      win.localStorage.customsets = JSON.stringify(sets)
      win.syncImportedEncounterState(sets, [])
      const setdex = win.eval('setdex')
      let opponent
      for (const [species, trainers] of Object.entries(setdex)) {
        const entry = Object.keys(trainers).find(name => /^Lvl \d+ /.test(name))
        if (entry) { opponent = species + ' (' + entry + ')'; break }
      }
      expect(opponent).to.be.a('string')
      win.$('#p2 .set-selector').val(opponent).trigger('change')
      win.fainted = []
      win.syncOpposingKoButton()
    })
    cy.window().should(win => expect(win.eval('changingSets')).not.to.eq(true))
    cy.get('#opposing-ko-toggle').should('be.visible').click()
    cy.window().should(win => {
      const encounter = JSON.parse(win.localStorage.encounters)[playerSpecies]
      expect(encounter.fragCount).to.eq(1)
      expect(encounter.manualFrags).to.deep.eq(encounter.frags)
    })
    cy.get('#opposing-ko-toggle').should('have.text', "KO'd").click()
    cy.get('#opposing-ko-toggle').should('have.text', 'KO').click()
    cy.window().then(win => {
      expect(JSON.parse(win.localStorage.encounters)[playerSpecies].fragCount).to.eq(1)
      win.refreshMainPageHeaderState()
      win.setMainPageView('fragsheet')
    })
    cy.get('#myGrid .ag-header-cell-text:visible').should($headers => {
      expect([...$headers].map(el => el.textContent)).to.deep.eq(['Status', 'Img', 'KOs'])
    })
    cy.get('#myGrid .ag-row [col-id="totalKo"]').first().should('have.text', '1')
    cy.get('#stats-tab').should('not.be.visible')
    cy.get('#myGrid .ag-header').scrollIntoView()
    cy.screenshot('mobile-fragsheet-three-columns', { capture: 'viewport' })
    cy.viewport(1440, 900)
    cy.get('#myGrid .ag-header-cell-text:visible').should($headers => {
      expect([...$headers].map(el => el.textContent)).to.include.members(['Status', 'Img', 'KOs', 'Species', 'Met Location'])
    })
    cy.get('#stats-tab').should('be.visible')
  })
})
