describe('Platinum Kaizo calc configuration', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./index.html?data=pk&view=calculator')
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
})
