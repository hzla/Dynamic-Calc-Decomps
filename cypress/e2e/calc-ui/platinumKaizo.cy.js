describe('Platinum Kaizo calc configuration', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./?data=pk&view=calculator')
    cy.window({ timeout: 30000 }).should(win => {
      expect(win.TITLE).to.eq('Platinum Kaizo')
      expect(win.eval('initializing || changingSets')).to.eq(false)
      expect(win.setdex?.Clamperl).to.exist
    })
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

  it('keeps the affected trainer held items and Empoleon move in the opponent panel', () => {
    cy.wrap([
      ['Clamperl', 47, 'Deep Sea Scale'],
      ['Clamperl', 304, 'Deep Sea Tooth'],
      ['Clamperl', 632, 'Deep Sea Tooth'],
      ['Buneary', 236, 'Pink Scarf'],
      ['Kadabra', 612, 'Pink Scarf'],
      ['Happiny', 608, 'Lucky Egg'],
      ['Misdreavus', 674, 'RageCandyBar'],
      ['Ursaring', 629, 'RageCandyBar'],
      ['Wigglytuff', 650, 'RageCandyBar']
    ]).each(([species, trainerId, item]) => {
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false)).then(win => {
        const set = win.getTrainerSetsById(trainerId).find(entry => entry.speciesName === species)
        win.setOpposing(set.setId)
        expect(win.createPokemon(win.$('#p2')).item, set.setId).to.eq(item)
      })
      cy.get('#p2 select.item').should('have.value', item)
    })
    cy.window().should(win => expect(win.eval('changingSets')).to.eq(false)).then(win => {
      win.setOpposing('Empoleon (Lvl 90 Clown Julia)')
    })
    cy.get('#p2 .move4 select.move-selector').should('have.value', 'Feather Dance')
  })

  it('routes the first Mercury fight to the ROM trainer with the correct natures', () => {
    cy.window().then(win => {
      const id = win.trainerOrders[14].next
      expect(id).to.eq(296)
      expect(win.trainerOrders[id]).to.deep.eq({ id: 296, prev: 14, next: 297 })
      expect(win.trainerOrders[297].prev).to.eq(id)
      expect(win.setdex.Glameow['Lvl 18 Galactic Mercury2'].tr_id).to.eq(id)
      expect(win.getTrainerSetsById(211)).to.be.empty
      expect(win.getTrainerSetsById(id).map(({ speciesName, setData }) =>
        [speciesName, setData.nature, setData.gender || ''])).to.deep.eq([
        ['Glameow', 'Naughty', 'Female'],
        ['Wynaut', 'Timid', 'Male'],
        ['Skorupi', 'Bold', 'Male'],
        ['Staryu', 'Quirky', '']
      ])
    })
  })

  it('uses reference damage for Thief and Chatter and fixed power for typed Hidden Power', () => {
    cy.window().then(win => {
      const { calc, gen } = win
      const damageGen = win.eval('settings.damageGen')
      const chatot = new calc.Pokemon(gen, 'Chatot', { level: 50 })
      const snorlax = new calc.Pokemon(gen, 'Snorlax', { level: 50 })
      const range = (move, gameType) => calc.calculate(
        damageGen, chatot, snorlax, new calc.Move(gen, move), new calc.Field({ gameType })
      ).range()
      expect(range('Thief', 'Singles')).to.deep.eq([0, 0])
      expect(range('Chatter', 'Singles')).to.deep.eq([64, 76])
      expect(range('Chatter', 'Doubles')).to.deep.eq([48, 57])

      const types = [
        'Bug', 'Dark', 'Dragon', 'Electric', 'Fighting', 'Fire', 'Flying', 'Ghost',
        'Grass', 'Ground', 'Ice', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'
      ]
      types.forEach(type => {
        const move = new calc.Move(gen, `Hidden Power ${type}`)
        expect([move.type, move.bp], move.name).to.deep.eq([type, 70])
      })

      const set = win.setdex.Clamperl['Lvl 40 Ruin Maniac Calvin']
      const slot = set.moves.indexOf('HP Grass')
      expect(slot).to.be.gte(0)
      const originalMove = set.moves[slot]
      set.moves[slot] = 'Hidden Power Grass'
      try {
        win.setOpposing('Clamperl (Lvl 40 Ruin Maniac Calvin)')
        const move = win.createPokemon(win.$('#p2')).moves[slot]
        expect([move.name, move.type, move.bp]).to.deep.eq(['Hidden Power Grass', 'Grass', 70])
      } finally {
        set.moves[slot] = originalMove
      }
    })
  })
})

it('does not apply Platinum Kaizo typed Hidden Power to other calculators', () => {
  cy.visit('./?data=imp13&noSwitch=1&view=calculator')
  cy.window({ timeout: 30000 }).should(win => {
    expect(win.TITLE).to.eq('Emerald Imperium 1.3')
    expect(win.eval('initializing')).to.eq(false)
    expect(win.shouldUseTypedHiddenPowerMoveData('Hidden Power Water')).to.eq(false)
    expect(new win.calc.Move(win.gen, 'Hidden Power Water').bp).to.eq(60)
  })
})
