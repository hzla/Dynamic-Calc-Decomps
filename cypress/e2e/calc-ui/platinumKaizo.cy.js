describe('Platinum Kaizo calc configuration', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./?data=pk&view=calculator')
  })

  it('resolves calculator and in-game move names to exact scoring pages', () => {
    cy.window().then((win) => {
      const cases = [
        ['Aerial Ace', 'AerialAce'],
        ['Brave Bird', 'BraveBird'],
        ['Feint Attack', 'FaintAttack'],
        ['Faint Attack', 'FaintAttack'],
        ['High Jump Kick', 'HiJumpKick'],
        ['Hi Jump Kick', 'HiJumpKick'],
        ['Judgment', 'Judgement'],
        ['Self-Destruct', 'Selfdestruct'],
        [' Self-Destruct ', 'Selfdestruct'],
        ['Selfdestruct', 'Selfdestruct'],
        ['Smelling Salts', 'SmellingSalt'],
        ['SmellingSalt', 'SmellingSalt'],
        ['Smokescreen', 'SmokeScreen'],
        ['SmokeScreen', 'SmokeScreen'],
        ['Soft-Boiled', 'Softboiled'],
        ['Softboiled', 'Softboiled'],
        ['Solar Beam', 'SolarBeam2'],
        ['SolarBeam', 'SolarBeam2'],
        ['Solar-Beam', 'SolarBeam'],
        ['U-turn', 'U-turn'],
        ['Vise Grip', 'ViceGrip'],
        ['ViceGrip', 'ViceGrip'],
        ['Ancient Power', 'AncientPower'],
        ['AncientPower', 'AncientPower'],
        ['HP Ice', 'HPIce']
      ]

      cases.forEach(([move, page]) => {
        expect(win.getPlatinumKaizoMoveAiUrl(move), move).to.eq(
          `https://bparkpk.github.io/PKMoveScoring/move${page}.html`
        )
      })
      expect(win.getPlatinumKaizoMoveAiUrl('')).to.eq('')
    })
  })

  it('opens the selected scoring page when View AI is clicked', () => {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen').returns({ opener: win })
    })

    cy.wrap([
      ['Brave Bird', 'BraveBird'],
      ['Self-Destruct', 'Selfdestruct'],
      ['U-turn', 'U-turn'],
      ['Solar Beam', 'SolarBeam2'],
      ['Solar-Beam', 'SolarBeam']
    ]).each(([move, page]) => {
      cy.window().then((win) => {
        win.$('#resultMoveR1').prop('checked', true)
        win.$('label[for="resultMoveR1"]').text(move)
        win.$('#ai-container').show().html('<div>old AI modal content</div>')
      })

      cy.get('#show-ai').click()

      cy.get('@windowOpen').should(
        'have.been.calledWith',
        `https://bparkpk.github.io/PKMoveScoring/move${page}.html`,
        '_blank',
        'noopener,noreferrer'
      )
      cy.get('#ai-container').should('not.be.visible').and('be.empty')
    })
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
