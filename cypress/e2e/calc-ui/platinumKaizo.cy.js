describe('Platinum Kaizo calc configuration', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./?data=pk&view=calculator')
  })

  it('opens external move scoring when View AI is clicked', () => {
    cy.window().then((win) => {
      expect(win.getPlatinumKaizoMoveAiUrl('Aerial Ace')).to.eq(
        'https://bparkpk.github.io/PKMoveScoring/moveAerialAce.html'
      )
      expect(win.getPlatinumKaizoMoveAiUrl('Brave Bird')).to.eq(
        'https://bparkpk.github.io/PKMoveScoring/moveBraveBird.html'
      )

      cy.stub(win, 'open').as('windowOpen').returns({ opener: win })
      win.$('#resultMoveR1').prop('checked', true)
      win.$('label[for="resultMoveR1"]').text('Brave Bird')
      win.$('#ai-container').show().html('<div>old AI modal content</div>')
    })

    cy.get('#show-ai').click()

    cy.get('@windowOpen').should(
      'have.been.calledWith',
      'https://bparkpk.github.io/PKMoveScoring/moveBraveBird.html',
      '_blank',
      'noopener,noreferrer'
    )
    cy.get('#ai-container').should('not.be.visible').and('be.empty')
  })

  it('corrects Vice Grip imports to Vise Grip', () => {
    cy.window().then((win) => {
      expect(win.eval('normalizeImportedMoveName("Vice Grip", { applyRomReplacements: true })')).to.eq('Vise Grip')
    })
  })

  it('loads PKCalc recoil data', () => {
    cy.window().should((win) => {
      expect(win.eval('TITLE')).to.eq('Platinum Kaizo')
      expect(win.eval('moves["Superpower"].recoil')).to.deep.eq([1, 2])
      expect(win.eval('moves["Roar of Time"].recoil')).to.deep.eq([1, 3])
      expect(win.eval('moves["Submission"].recoil')).to.eq(undefined)
      expect(win.eval('MOVES_BY_ID[g].superpower.recoil')).to.deep.eq([1, 2])
      expect(win.eval('MOVES_BY_ID[g].submission.recoil')).to.eq(undefined)
    })
  })
})
