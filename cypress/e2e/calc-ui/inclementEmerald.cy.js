const inclementEmeraldUrl = './index.html?data=inc&gen=8&types=6&dmgGen=8&switchIn=11&view=calculator'

describe('Inclement Emerald calc routing', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
  })

  it('loads the local data through the semantic slug and uses the EV setting', () => {
    cy.visit(inclementEmeraldUrl)
    cy.get('#rom-title').should('have.text', 'Inclement Emerald')
    cy.get('#mainResult', { timeout: 15000 }).should('not.have.text', 'Loading...')
    cy.get('#lvl-cap').should('not.have.css', 'display', 'none')

    cy.window().then((win) => {
      const runtimeSettings = win.eval('settings')

      expect(win.backup_data.poks).to.be.an('object').and.not.be.empty
      expect(win.backup_data.formatted_sets).to.be.an('object').and.not.be.empty
      expect(runtimeSettings.damageGen).to.eq(8)
      expect(runtimeSettings.switchIn).to.eq(11)
      expect(runtimeSettings.gameSwitchIn).to.eq(11)
      expect(runtimeSettings.sourceType).to.eq('full')
      expect(runtimeSettings.hasEvs).to.eq(true)
      expect(win.baseGame).to.eq('inc_em')
      expect(win.eval('INC_EM')).to.eq(true)
      expect(win.localStorage.calcHasEvs).to.eq('1')
    })

    cy.get('#open-menu').click()
    cy.get('#toggle-use-evs input').should('be.checked')
    cy.get('#toggle-use-evs .slider').click()

    cy.get('#rom-title').should('have.text', 'Inclement Emerald')
    cy.window().then((win) => {
      expect(win.eval('settings').hasEvs).to.eq(false)
      expect(win.localStorage.calcHasEvs).to.eq('0')
    })
  })

  it('offers one current-branch link in the game selection modal and legacy select', () => {
    cy.visit('./index.html')
    cy.get('#open-romhack-modal').click()

    cy.get('[data-section-id="buffel-saft"] .romhack-browser-game-title')
      .contains('Inclement Emerald')
      .should(($title) => {
        const target = new URL($title.closest('a').prop('href'))

        expect(target.origin).to.eq('https://hzla.github.io')
        expect(target.pathname).to.eq('/Dynamic-Calc-Decomps/')
        expect(target.searchParams.get('data')).to.eq('inc')
        expect(target.searchParams.get('view')).to.eq('calculator')
      })

    cy.window().then((win) => {
      const game = win.romhackGameIndex['inclement-emerald']
      const legacyOptions = [...win.document.querySelectorAll('.calc-select option')]
        .filter((option) => option.textContent.trim().startsWith('Inclement Emerald'))

      expect(game.variants).to.have.length(1)
      expect(legacyOptions).to.have.length(1)
      expect(legacyOptions[0].dataset.source).to.include('data=inc&')
    })
  })

  it('shows each enemy preview maximum against the currently loaded left-side Pokemon', () => {
    cy.visit(inclementEmeraldUrl)
    cy.get('#rom-title').should('have.text', 'Inclement Emerald')
    cy.get('#mainResult', { timeout: 15000 }).should('not.have.text', 'Loading...')
    cy.get('.select2-container.set-selector.player .select2-chosen:visible').first().click({ force: true })
    cy.get('.select2-results li:visible').should('have.length.greaterThan', 0)
    cy.get('.select2-search input:visible').first().type('Cynthia{enter}')
    cy.get('input.player.set-selector').invoke('val').should('include', 'Cynthia')
    cy.get('.select2-container.set-selector.opposing .select2-chosen:visible').first().click({ force: true })
    cy.get('.select2-results li:visible').should('have.length.greaterThan', 0)
    cy.get('.select2-search input:visible').first().type('Nicolas3{enter}')
    cy.get('.trainer-preview-damage').should('have.length.greaterThan', 0)

    cy.window().then((win) => {
      win.localStorage.hideCurrentAiMon = '0'
      win.refresh_next_in()

      const expectedDamage = win.get_next_in()
        .map((entry) => entry[10])
        .sort((a, b) => b - a)
      const displayedDamage = [...win.document.querySelectorAll('.trainer-preview-damage')]
        .map((row) => Number(row.textContent.replace('Damage:', '').trim()))

      expect(displayedDamage).to.deep.eq(expectedDamage)
      expect(displayedDamage).to.deep.eq([...displayedDamage].sort((a, b) => b - a))
      expect(displayedDamage).to.have.length.greaterThan(0)
      expect(displayedDamage.every(Number.isFinite)).to.eq(true)

      const singleHit = {
        damage: new Array(16).fill(20),
        move: { hits: 3 },
        range: () => [10, 20]
      }
      const perHit = {
        damage: [new Array(16).fill(20), new Array(16).fill(20)],
        move: { hits: 2 },
        range: () => [20, 40]
      }

      expect(win.getTrainerPreviewMaximumDamage(singleHit)).to.eq(60)
      expect(win.getTrainerPreviewMaximumDamage(perHit)).to.eq(40)
      expect(win.getHighestTrainerPreviewDamage([singleHit, perHit])).to.eq(60)
    })

    cy.get('.opposing.trainer-pok-list')
      .should('not.have.class', 'dual-trainer-preview')
      .find('.trainer-pok-container')
      .should('have.length', 5)
    cy.get('.opposing.trainer-pok-list .trainer-preview-label').should('not.exist')
    cy.get('.opposing.trainer-pok-list .trainer-preview-separator').should('not.exist')
    cy.get('.trainer-preview-damage .p2-dmg').first().should('have.text', 'Damage:')
  })
})
