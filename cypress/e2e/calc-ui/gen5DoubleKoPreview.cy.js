describe('Vanilla Gen 5+ double-KO switch preview', () => {
  const warning = 'Switch-In order can be different if you double KO in this position'
  const reserves = ['Armaldo', 'Aerodactyl', 'Cradily', 'Tyrantrum']

  function expectOrder(order) {
    cy.get('.opposing.trainer-pok-list .trainer-pok.right-side').should(($cards) => {
      const names = Array.from($cards, card => card.dataset.id.split(' (')[0])
        .filter(name => reserves.includes(name))
      expect(names).to.deep.eq(order)
    })
  }

  function loadPlayer(species) {
    cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
    cy.window().then(win => {
      win.$('#p1 input.set-selector').val(`${species} (Blank Set)`).change()
      win.$('#p1 .select2-chosen').first().text(`${species} (Blank Set)`)
      win.refresh_next_in()
    })
  }

  beforeEach(() => {
    // The calculation uses local game data; allow only the page's static CDN dependencies.
    cy.intercept('https://**', req => {
      if (/^https:\/\/(ajax\.googleapis\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com)\//.test(req.url)) {
        req.continue()
      } else {
        req.reply({ statusCode: 204, body: '' })
      }
    })
    cy.clearLocalStorage()
    cy.viewport(1600, 1100)
    cy.visit('/index.html?data=ax&dmgGen=6&gen=8&view=calculator')
    cy.get('#rom-title').should('have.text', 'Ancestral X')
    cy.window().should(win => {
      expect(win.setdex.Gigalith).to.exist
      expect(win.eval('initializing')).to.eq(false)
      expect(win.eval('changingSets')).to.eq(false)
    })
    cy.window().then(win => {
      const trainer = Object.keys(win.setdex.Gigalith).find(name => name.includes('Lvl 31 Grant'))
      win.setOpposing(`Gigalith (${trainer})`)
      win.fainted = [`Corsola (${trainer})`]
      win.$('#doubles-format').click()
    })
    loadPlayer('Hariyama')
  })

  it('keeps separate KOs by default and toggles the actual double-KO order for either player target', () => {
    cy.get('.trainer-preview-double-ko').should('be.visible').and('contain.text', warning)
    cy.get('.trainer-preview-double-ko-toggle').should('have.css', 'display', 'flex')
    cy.get('#double-ko-preview-toggle').should('not.be.checked')
    expectOrder(['Armaldo', 'Aerodactyl', 'Cradily', 'Tyrantrum'])
    cy.get('.trainer-preview-double-ko-toggle').click()
    cy.get('#double-ko-preview-toggle').should('be.checked')
    expectOrder(['Armaldo', 'Cradily', 'Aerodactyl', 'Tyrantrum'])
    cy.get('.trainer-preview-double-ko').scrollIntoView().screenshot('double-ko-preview-desktop', { overwrite: true })
    loadPlayer('Sunflora')
    cy.get('#double-ko-preview-toggle').should('be.checked')
    expectOrder(['Armaldo', 'Cradily', 'Aerodactyl', 'Tyrantrum'])
    cy.get('.trainer-preview-double-ko-toggle').click()
    expectOrder(['Armaldo', 'Aerodactyl', 'Cradily', 'Tyrantrum'])
  })

  it('hides and resets on Singles or when a KO removes the ambiguity', () => {
    cy.get('.trainer-preview-double-ko-toggle').click()
    cy.get('#singles-format').click({ force: true })
    cy.get('.trainer-preview-double-ko').should('not.exist')
    cy.get('#doubles-format').click({ force: true })
    cy.get('#double-ko-preview-toggle').should('not.be.checked')
    cy.get('.trainer-preview-double-ko-toggle').click()
    cy.window().then(win => {
      const armaldo = win.CURRENT_TRAINER_POKS.find(id => id.startsWith('Armaldo ('))
      win.toggleTrainerPreviewFaint(armaldo)
    })
    cy.get('.trainer-preview-double-ko').should('not.exist')
    cy.window().then(win => {
      const armaldo = win.CURRENT_TRAINER_POKS.find(id => id.startsWith('Armaldo ('))
      win.toggleTrainerPreviewFaint(armaldo)
    })
    cy.get('#double-ko-preview-toggle').should('not.be.checked')
    expectOrder(['Armaldo', 'Aerodactyl', 'Cradily', 'Tyrantrum'])
  })

  it('keeps the warning and toggle visible in the mobile dual-panel layout', () => {
    cy.viewport(760, 1000)
    cy.window().then(win => win.$('.panel-wrapper').addClass('mobile-dual-panel-layout'))
    cy.get('.trainer-preview-double-ko').should('be.visible').then($warning => {
      const rect = $warning[0].getBoundingClientRect()
      expect(rect.width).to.be.greaterThan(150)
      expect(rect.right).to.be.at.most(760)
    })
    cy.get('.trainer-preview-double-ko-toggle').should('have.css', 'display', 'flex')
    cy.get('.trainer-preview-double-ko-toggle').click()
    cy.get('#double-ko-preview-toggle').should('be.checked')
    expectOrder(['Armaldo', 'Cradily', 'Aerodactyl', 'Tyrantrum'])
    cy.get('.trainer-preview-double-ko').scrollIntoView().screenshot('double-ko-preview-mobile', { overwrite: true })
  })
})
