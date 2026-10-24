describe('Platinum move-choice AI', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.visit('./index.html?data=renegadeplatinum&view=calculator')
    cy.window().should(win => {
      expect(win.SETDEX_BW).to.be.an('object')
      expect(win.setdex && win.setdex.Infernape && win.setdex.Infernape['Lvl 38 Leader Maylene ']).to.be.an('object')
    })
  })

  it('replays the Crawdaunt versus Maylene report using AI damage and +6 priority KOs', () => {
    cy.window().then(win => {
      win.customSets = win.customSets || {}
      win.customSets.Crawdaunt = {
        ability: 'Adaptability', level: 40, nature: 'Careful', item: 'Sitrus Berry',
        ivs: { hp: 8, at: 0, df: 30, sa: 14, sd: 25, sp: 0 },
        moves: ['Protect', 'Crabhammer', 'Knock Off', 'Aqua Jet'], isCustomSet: true
      }
      win.SETDEX_BW.Crawdaunt = win.SETDEX_BW.Crawdaunt || {}
      win.SETDEX_BW.Crawdaunt['My Box'] = win.customSets.Crawdaunt
      win.$('#p1 .set-selector').val('Crawdaunt (My Box)').trigger('change')
      win.$('#p2 .set-selector').val('Infernape (Lvl 38 Leader Maylene )').trigger('change')
      win.$('#p1 .current-hp').val(60).trigger('change')
      win.$('#p1 .status').val('Asleep').trigger('change')
      win.PlatinumMoveAiPreviewUI.enable()
      win.PlatinumMoveAiPreviewUI.open()
    })
    cy.window().should(win => {
      const r = win.lastPlatinumMoveAiResult
      expect(r, 'preview result').to.be.an('object')
      expect(r.warnings).to.deep.eq([])
      expect(r.supported).to.eq(true)
      expect(r.moves.map(m => m.aiMaxDamage)).to.deep.eq([140, 30, 27, 60])
      const mach = r.moves.find(m => m.moveName === 'Mach Punch')
      const cc = r.moves.find(m => m.moveName === 'Close Combat')
      expect(mach.aiMaxDamage).to.eq(60)
      expect(mach.outcomes[0].finalScore).to.eq(106)
      expect(cc.outcomes[0].finalScore).to.eq(104)
      expect(mach.probability).to.eq(1)
      expect(cc.probability).to.eq(0)
    })
    cy.get('#move-ai-preview').should('contain', '106').and('contain', 'Model and battle-state assumptions')
  })

  it('provides first-turn controls and the requested history footnote', () => {
    cy.window().then(win => {
      win.$('#p1 .set-selector, #p2 .set-selector').val('Mew (Blank Set)').trigger('change')
      win.platinumAiStateOverrides = {}
      // Use a concrete trainer mask without borrowing an unrelated Mew set.
      win.setdex.Mew = win.setdex.Mew || {}
      win.setdex.Mew['Blank Set'] = { ai: 7 }
      win.$('#p2 .move1 select.move-selector').val('Fake Out').trigger('change')
      win.PlatinumMoveAiPreviewUI.enable()
      win.PlatinumMoveAiPreviewUI.open()
    })
    cy.get('#move-ai-preview').should('contain', 'previous turn history required for fully accurate %s')
    cy.window().should(win => expect(win.lastPlatinumMoveAiResult.supported, win.lastPlatinumMoveAiResult.warnings.join(' ')).to.eq(true))
    cy.get('[data-ai-section="state"] > summary').click()
    cy.get('[data-ai-section="attacker"] > summary').click()
    cy.get('[data-ai-state="attackerFirstTurn"]').should('be.checked').uncheck()
    cy.window().should(win => {
      expect(win.lastPlatinumMoveAiResult.supported, win.lastPlatinumMoveAiResult.warnings.join(' ')).to.eq(true)
      expect(win.lastPlatinumMoveAiResult.moves[0].outcomes[0].finalScore).to.be.below(100)
    })
    cy.get('[data-ai-state="attackerTurnsActive"]').should('have.value', '1')
    cy.get('[data-ai-state="attackerFirstTurn"]').check()
    cy.window().should(win => expect(win.lastPlatinumMoveAiResult.moves[0].outcomes[0].finalScore).to.be.at.least(100))
    cy.get('[data-ai-section="state"]').should('have.attr', 'open')
  })
  it('loads trainer reserves and updates Heal Bell scoring from status and fainting controls', () => {
    cy.window().then(win => {
      win.$('#p1 .set-selector').val('Mew (Blank Set)').trigger('change')
      win.$('#p2 .set-selector').val('Infernape (Lvl 38 Leader Maylene )').trigger('change')
      win.setdex.Infernape['Lvl 38 Leader Maylene '].ai = 4
      win.$('#p2 .move1 select.move-selector').val('Heal Bell').trigger('change')
      win.enableMoveAiPreview()
    })
    cy.window().should(win => {
      expect(win.lastPlatinumMoveAiResult.supported, win.lastPlatinumMoveAiResult.warnings.join(' ')).to.eq(true)
      expect(win.lastPlatinumMoveAiResult.moves[0].outcomes[0].finalScore).to.eq(95)
    })
    cy.get('[data-ai-section="state"] > summary').click()
    cy.get('[data-ai-section="parties"] > summary').click()
    cy.get('[data-ai-reserve]').should('have.length.at.least', 1)
    cy.get('[data-ai-party="status"]').first().select('par')
    cy.window().should(win => expect(win.lastPlatinumMoveAiResult.moves[0].outcomes[0].finalScore).to.eq(100))
    cy.get('[data-ai-party="hp"]').first().clear().type('0').blur()
    cy.window().should(win => expect(win.lastPlatinumMoveAiResult.moves[0].outcomes[0].finalScore).to.eq(95))
    cy.get('[data-ai-party="usedPP"]').first().check()
    cy.get('[data-ai-reset-party]').click()
    cy.get('[data-ai-party="status"]').first().should('have.value', '')
    cy.get('[data-ai-party="usedPP"]').first().should('not.be.checked')
  })

  it('renders Psywave score distributions rather than an unavailable random-damage warning', () => {
    cy.window().then(win => {
      win.$('#p1 .set-selector, #p2 .set-selector').val('Mew (Blank Set)').trigger('change')
      win.setdex.Mew = win.setdex.Mew || {}
      win.setdex.Mew['Blank Set'] = { ai: 2 }
      ;['Psywave', 'Seismic Toss', '(No Move)', '(No Move)'].forEach((name, i) => win.$('#p2 .move' + (i + 1) + ' select.move-selector').val(name).trigger('change'))
      win.$('#p2 .level').val(50).trigger('change')
      win.$('#p1 .current-hp').val(50).trigger('change')
      win.enableMoveAiPreview()
    })
    cy.window().should(win => {
      const r = win.lastPlatinumMoveAiResult
      expect(r.supported).to.eq(true)
      expect(r.moves[0].outcomes.length).to.be.greaterThan(1)
      expect(r.moves[0].probability).to.be.greaterThan(0)
      expect(r.moves[0].probability).to.be.lessThan(0.5)
      expect(r.moves.reduce((p, m) => p + m.probability, 0)).to.be.closeTo(1, 1e-10)
    })
  })
})
