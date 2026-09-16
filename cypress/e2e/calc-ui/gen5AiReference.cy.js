describe('Gen V move AI reference', () => {
  function showMove(move, mask) {
    cy.window().then(win => {
      win.syncConfiguredTrainerAi(mask, 5)
      win.$('#p2 .move1 .move-selector').val(move).trigger('change')
    })
    cy.get('label[for="resultMoveR1"]').should('have.text', move)
    cy.get('label[for="resultMoveR1"]').click()
    cy.get('#resultMoveR1').should('be.checked')
    cy.get('#show-ai').click()
    cy.get('#ai-container').should('be.visible').and('contain.text', move + ' AI')
  }

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./index.html?data=aetherwhite&gen=8&types=5&view=calculator')
    cy.window().should(win => {
      expect(win.eval('gameGen')).to.eq(5)
      expect(win.eval('moves["Swords Dance"].e_id')).to.eq(50)
    })
    cy.get('#p2 .move1 .move-selector option[value="Swords Dance"]').should('exist')
    cy.window().should(win => expect(win.eval('initializing')).to.eq(false))
  })

  it('shows enabled sections, plain score changes and working controls', () => {
    showMove('Swords Dance', 13)
    cy.get('#ai-container [data-ai-flag]').should('have.length', 3)
    cy.get('[data-ai-flag="setup"]').should('contain.text', '68.8% chance to add 2 points')
    cy.get('[data-ai-flag="strong"]').should('not.exist')
    cy.get('.ai-section details').should('not.exist')
    cy.get('.ai-reading-notes summary').click()
    cy.get('#ai-container').should('be.visible')
    cy.get('.ai-reading-notes summary').click()
    cy.get('#ai-container').scrollTo('top', { ensureScrollable: false })
    cy.screenshot('gen5-ai-desktop', { capture: 'viewport' })
    cy.get('.ai-close').click()
    cy.get('#ai-container').should('not.be.visible')
    cy.get('#show-ai').click()
    cy.get('#ai-container').should('be.visible')
    cy.get('#show-ai').click()
    cy.get('#ai-container').should('not.be.visible')
    cy.get('#show-ai').click()
    cy.get('body').type('{esc}')
    cy.get('#ai-container').should('not.be.visible')
    cy.get('#show-ai').focus().type('{enter}')
    cy.get('#ai-container').should('be.visible')
    cy.get('body').click(10, 10)
    cy.get('#ai-container').should('not.be.visible')
  })

  it('keeps the configured mask on mobile and uses abbreviated Gen V badges', () => {
    showMove('Swords Dance', 61)
    cy.get('#ai5').should('have.text', 'Easy').invoke('attr', 'title').should('contain', 'Opening-battle AI')
    cy.get('#ai6').should('have.text', 'Legend')
    cy.get('#ai-container [data-ai-flag]').should('have.length', 5)
    cy.get('.ai-close').click()
    cy.window().then(win => win.$('label[for="resultMoveR1"]').text('Sw. Dance'))
    cy.get('#show-ai').click()
    cy.get('#ai-container').should('contain.text', 'Swords Dance AI')
    cy.viewport(390, 844)
    cy.get('#ai5').should('not.be.visible')
    cy.get('.ai-close').click()
    cy.get('#show-ai').click()
    cy.get('#ai-container [data-ai-flag]').should('have.length', 5)
    cy.get('#gen5-ai-move').select('Ancient Power')
    cy.get('#ai-container').should('be.visible')
    cy.get('#gen5-ai-move').should('have.value', 'Ancient Power').and('be.focused')
    cy.get('#ai-container [data-ai-flag]').should('have.length', 5)
    cy.get('#ai-container').then($panel => {
      const box = $panel[0].getBoundingClientRect()
      expect(box.left).to.be.at.least(0)
      expect(box.right).to.be.at.most(390)
      expect($panel[0].scrollWidth).to.be.at.most($panel[0].clientWidth + 1)
    })
    cy.screenshot('gen5-ai-mobile', { capture: 'viewport' })
  })

  it('browses all Gen V moves with the same flags and honors loaded move data', () => {
    showMove('Tackle', 36)
    cy.get('#gen5-ai-move').should('have.value', 'Tackle')
    cy.get('#gen5-ai-move option').not('[value=""]').should('have.length', 559)
    cy.get('#gen5-ai-move option[value="Moonblast"]').should('not.exist')
    cy.get('#gen5-ai-move').select('Sleep Powder')
    cy.get('[data-ai-flag="expert"]').should('contain.text', 'Dream Eater').and('contain.text', '50% chance to add 1 point')
    cy.get('#ai-container [data-ai-flag]').should('have.length', 2)
    cy.get('#ai-container .ai-meta').should('have.text', 'Enabled: Expert, Legend')
    cy.window().its('configuredTrainerAiMask').should('eq', 36)
    cy.get('#p2 select.move-selector').first().should('have.value', 'Tackle')
    cy.get('label[for="resultMoveR1"]').should('have.text', 'Tackle')

    // Loaded hack metadata takes precedence over the standard move effect.
    cy.window().then(win => { win.eval('moves')["Thunderbolt"].e_id = 50 })
    cy.get('#gen5-ai-move').select('Thunderbolt')
    cy.get('[data-ai-flag="expert"]').should('contain.text', "Attack stage")

    // A standard Gen V move is still available when absent from the loaded hack.
    cy.window().then(win => {
      delete win.eval('moves')["Fusion Bolt"]
      delete win.eval('backup_data').moves["Fusion Bolt"]
    })
    cy.get('#gen5-ai-move').select('Fusion Bolt')
    cy.get('[data-ai-flag="legend"]').should('contain.text', 'Zekrom').and('contain.text', 'Add 10 points')
    cy.get('#gen5-ai-move').should('be.focused')
    cy.get('#ai-container').should('be.visible')
  })

  it('opens an empty move picker with the configured flags when no trainer move is selected', () => {
    cy.window().then(win => {
      win.syncConfiguredTrainerAi(13, 5)
      win.$('.result-move').prop('checked', false)
      cy.stub(win, 'alert').as('alert')
    })
    cy.get('#show-ai').click()
    cy.get('#ai-container').should('be.visible')
    cy.get('#gen5-ai-move').should('have.value', '').and('be.focused')
    cy.get('#ai-container .ai-meta').should('have.text', 'Enabled: Basic, Expert, 1st Turn Setup')
    cy.get('#ai-container .ai-section, #ai-container .ai-reading-notes, #ai-container .ai-empty').should('not.exist')
    cy.get('@alert').should('not.have.been.called')
    cy.get('#gen5-ai-move').select('Swords Dance')
    cy.get('[data-ai-flag="setup"]').should('contain.text', '68.8% chance to add 2 points')
    cy.get('#ai-container [data-ai-flag]').should('have.length', 3)
    cy.get('#gen5-ai-move').select('')
    cy.get('#ai-container .ai-section').should('not.exist')
    cy.get('#ai-container .ai-meta').should('have.text', 'Enabled: Basic, Expert, 1st Turn Setup')
    cy.get('.ai-close').click()
    cy.get('label[for="resultMoveL1"]').click()
    cy.get('#show-ai').click()
    cy.get('#gen5-ai-move').should('have.value', '')
    cy.get('#ai-container').should('be.visible')
  })

  it('invalidates changes and handles missing flags and no-op effects', () => {
    showMove('Tackle', 4)
    cy.get('#ai-container').should('contain.text', 'No additional score changes')
    cy.get('#resultMoveR2').check({ force: true })
    cy.get('#ai-container').should('not.be.visible').and('be.empty')
    showMove('Tackle', null)
    cy.get('#ai-container').should('contain.text', 'no configured AI flags')
    cy.get('#ai-container [data-ai-flag]').should('not.exist')
    cy.window().then(win => win.syncConfiguredTrainerAi(0, 5))
    cy.get('#ai-container').should('not.be.visible').and('be.empty')
    cy.get('#show-ai').click()
    cy.get('#ai-container').should('contain.text', 'No AI scoring flags are enabled')
  })

  it('covers opponent-target Doubles only when enabled and in the right format', () => {
    showMove('Thunderbolt', 128)
    cy.get('#ai-container').should('contain.text', 'only apply in Doubles or Triples')
    cy.get('#doubles-format').check({ force: true })
    cy.get('#ai-container').should('not.be.visible')
    cy.get('label[for="resultMoveR1"]').click()
    cy.get('#show-ai').click()
    cy.get('[data-ai-flag="double"]').should('contain.text', 'opponent targets').and('not.contain.text', 'only apply in Doubles')
    cy.window().then(win => win.syncConfiguredTrainerAi(1, 5))
    cy.get('#show-ai').click()
    cy.get('[data-ai-flag="double"]').should('not.exist')
  })

  it('updates flags through real trainer selections and clears a blank set', () => {
    cy.window().should(win => expect(win.eval('changingSets')).not.to.eq(true))
    cy.window().then(win => {
      const sets = win.eval('setdex')
      let choice
      for (const [species, trainers] of Object.entries(sets)) {
        const entry = Object.entries(trainers).find(([, set]) => Number.isInteger(set.ai) && set.ai > 0)
        if (entry) { choice = { value: species + ' (' + entry[0] + ')', ai: entry[1].ai }; break }
      }
      expect(choice).to.exist
      win.$('#p2 .set-selector').val(choice.value).trigger('change')
      expect(win.configuredTrainerAiMask).to.eq(choice.ai)
    })
    cy.window().should(win => expect(win.eval('changingSets')).not.to.eq(true))
    cy.window().then(win => win.$('#p2 .set-selector').val('Pikachu (Blank Set)').trigger('change'))
    cy.window().its('configuredTrainerAiMask').should('eq', null)
  })

  it('restores Gen IV names and the existing Gen IV reference', () => {
    cy.visit('./index.html?data=renegadeplatinum&view=calculator')
    cy.window().should(win => expect(win.eval('gameGen')).to.eq(4))
    cy.window().should(win => expect(win.eval('moves["Swords Dance"].e_id')).to.eq(50))
    cy.get('#p2 .move1 .move-selector option[value="Swords Dance"]').should('exist')
    cy.window().should(win => expect(win.eval('initializing')).to.eq(false))
    cy.window().then(win => {
      win.syncConfiguredTrainerAi(63, 4)
      win.$('#p2 .move1 .move-selector').val('Swords Dance').trigger('change')
    })
    cy.get('#ai5').should('have.text', 'Risky')
    cy.get('#ai6').should('have.text', 'Prio Damage')
    cy.get('label[for="resultMoveR1"]').click()
    cy.get('#resultMoveR1').should('be.checked')
    cy.get('#show-ai').click()
    cy.get('#ai-container').should('be.visible').and('contain.text', 'EXPERT AI')
    cy.get('#ai-container').should('not.have.class', 'gen5-ai-panel')
    cy.get('#gen5-ai-move').should('not.exist')
  })
})
