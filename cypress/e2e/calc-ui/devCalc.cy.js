const teamKey = 'calcCustomOpponentTeams:__blank_dev_calc__'
const charizard = [
  'Ace (Charizard) (M) @ Leftovers',
  'Ability: Blaze',
  'Level: 50',
  'EVs: 252 SpA / 4 SpD / 252 Spe',
  'IVs: 0 Atk',
  'Timid Nature',
  '- Flamethrower',
  '- Air Slash',
].join('\n')
const pikachu = [
  'Pikachu @ Light Ball',
  'Ability: Static',
  'Level: 40',
  'Jolly Nature',
  '- Thunderbolt',
  '- Quick Attack',
].join('\n')
const teamText = [charizard, pikachu, charizard.replace('Leftovers', 'Life Orb')].join('\n\n')

function waitForCalcReady() {
  cy.window().should((win) => {
    expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
    expect(win.eval('initializing')).to.eq(false)
    expect(win.$('#p2 input.set-selector').data('select2')).to.be.an('object')
  })
}

function visitBlank(generation = 8) {
  cy.visit(`/index.html?dev=1&gen=${generation}&dmgGen=${generation}`, {
    onBeforeLoad(win) {
      win.localStorage.clear()
      win.localStorage.hideCurrentAiMon = '0'
    },
  })
  cy.get('#rom-title').should('have.text', 'Blank Slate Dev Calc')
  waitForCalcReady()
}

function importTeam(name, text = teamText) {
  cy.window().then((win) => cy.stub(win, 'prompt').returns(name).as('teamName'))
  cy.get('.import-team-text').invoke('val', text)
  cy.get('#import-right').click()
  cy.get('@teamName').should('have.been.calledOnce')
  cy.window().then((win) => win.prompt.restore())
}

function querySets(win, side, term = '') {
  let results
  win.$(`#${side} input.set-selector`).data('select2').opts.query({
    term, page: 1, callback(data) { results = data.results },
  })
  return results
}

describe('Dev calculator custom opponent teams', () => {
  beforeEach(() => visitBlank())

  it('imports all team members, preserves duplicate species and stats, and saves only opponent teams', () => {
    cy.get('#custom-opponent-teams-filter').should('be.visible')
    cy.get('#ai-tags').should('not.be.visible')
    importTeam('Enemy Team #1')
    cy.get('#ai-tags').should('not.be.visible')
    cy.window().then((win) => {
      const teams = JSON.parse(win.localStorage.getItem(teamKey))
      expect(teams).to.have.length(1)
      expect(teams[0].name).to.eq('Enemy Team #1')
      expect(teams[0].pokemon).to.have.length(3)
      expect(teams[0].pokemon[0].setData).to.include({
        level: 50, nature: 'Timid', ability: 'Blaze', item: 'Leftovers', nn: 'Ace', gender: 'M',
      })
      expect(teams[0].pokemon[0].setData.evs).to.deep.eq({ sa: 252, sd: 4, sp: 252 })
      expect(teams[0].pokemon[0].setData.ivs).to.deep.eq({ at: 0 })
      expect(teams[0].pokemon[2].setData.item).to.eq('Life Orb')
      expect(teams[0].pokemon[2].setName).to.not.eq(teams[0].pokemon[0].setName)
      expect(win.localStorage.customsets).to.eq(undefined)
      expect(querySets(win, 'p1', 'Enemy Team')).to.have.length(0)
      expect(querySets(win, 'p2', 'Enemy Team')).to.have.length(3)
      expect(win.eval('CURRENT_TRAINER_POKS')).to.have.length(3)
    })
    cy.get('#levelR1').should('have.value', '50')
    cy.get('#p2 .nature').should('have.value', 'Timid')
    cy.get('#p2 .trainer-pok-list .trainer-pok-container').should('have.length', 3)
    cy.get('#p2 .trainer-pok-list [data-id="Pikachu (Lvl 40 Enemy Team #1)"]').click()
    cy.get('#levelR1').should('have.value', '40')
    cy.get('#p2 .nature').should('have.value', 'Jolly')
  })

  it('filters the real dropdown and restores the team, selection, and filter after reload', () => {
    importTeam('Enemy Team #1')
    cy.get('#custom-opponent-teams-only').check()
    cy.window().then((win) => {
      expect(querySets(win, 'p2')).to.have.length(3)
      expect(querySets(win, 'p2').every((option) => option.isCustomOpponentTeam)).to.eq(true)
      expect(querySets(win, 'p1', 'Pikachu').some((option) => option.set === 'Blank Set')).to.eq(true)
    })
    cy.reload()
    cy.get('#custom-opponent-teams-only').should('be.checked')
    cy.get('#p2 .select2-container.set-selector .select2-chosen').should('contain.text', 'Enemy Team #1')
    cy.get('#p2 .select2-container.set-selector .select2-choice').click()
    cy.get('#select2-drop .select2-result-selectable').should('have.length', 3)
    cy.get('#select2-drop .select2-input').type('{esc}')
    cy.get('#custom-opponent-teams-only').uncheck()
    cy.window().then((win) => {
      expect(querySets(win, 'p2', 'Pikachu').some((option) => option.set === 'Blank Set')).to.eq(true)
    })
  })

  it('keeps separate named teams when importing the same species and duplicate names', () => {
    importTeam('Enemy Team #1', charizard)
    importTeam('Enemy Team #1', pikachu)
    cy.window().then((win) => {
      const teams = JSON.parse(win.localStorage.getItem(teamKey))
      expect(teams.map((team) => team.name)).to.deep.eq(['Enemy Team #1', 'Enemy Team #1 - 2'])
      expect(win.eval('CURRENT_TRAINER_POKS')).to.have.length(1)
      expect(querySets(win, 'p2', 'Enemy Team #1')).to.have.length(2)
    })
  })

  it('removes the selected duplicate set, updates the trainer lead and preview, and persists the deletion', () => {
    cy.get('.import-team-text').invoke('val', pikachu)
    cy.get('#import').click()
    cy.get('.player-poks .trainer-pok').first().click()
    let playerSets
    cy.window().then((win) => { playerSets = win.localStorage.customsets })
    importTeam('Enemy Team #1')
    cy.get('#custom-opponent-remove').should('be.visible').and('have.text', 'Remove')
    cy.on('window:confirm', (message) => {
      expect(message).to.eq('Delete Charizard from Enemy Team #1?')
      return true
    })
    cy.get('#custom-opponent-remove').click()
    cy.get('#p2 .select2-container.set-selector .select2-chosen').should('have.text', 'Pikachu (Lvl 40 Enemy Team #1)')
    cy.get('#p2 .trainer-pok-list .trainer-pok-container').should('have.length', 2)
    cy.window().then((win) => {
      const [team] = JSON.parse(win.localStorage.getItem(teamKey))
      expect(team.pokemon).to.have.length(2)
      expect(team.pokemon.map((pokemon) => pokemon.setData.sub_index)).to.deep.eq([0, 1])
      expect(team.pokemon[1].setData.item).to.eq('Life Orb')
      expect(win.eval('setdex.Charizard["Lvl 50 Enemy Team #1"]')).to.eq(undefined)
      expect(win.eval('customLeads')[team.trainerId]).to.eq('Pikachu (Lvl 40 Enemy Team #1)[0]')
      expect(win.eval('CURRENT_TRAINER_POKS')).to.have.length(2)
      expect(querySets(win, 'p2', 'Enemy Team #1')).to.have.length(2)
      expect(win.localStorage.customsets).to.eq(playerSets)
      expect(querySets(win, 'p2', 'Charizard').some((option) => option.set === 'Blank Set')).to.eq(true)
    })
    cy.reload()
    waitForCalcReady()
    cy.get('#ai-tags').should('not.be.visible')
    cy.get('#custom-opponent-remove').should('be.visible')
    cy.get('#p2 .trainer-pok-list .trainer-pok-container').should('have.length', 2)
    cy.window().then((win) => expect(querySets(win, 'p2', 'Enemy Team #1')).to.have.length(2))
  })

  it('deletes empty trainers, selects another custom team, and hides Remove after the final team is gone', () => {
    importTeam('First Enemy', charizard)
    importTeam('Second Enemy', pikachu)
    cy.get('#custom-opponent-teams-only').check()
    cy.on('window:confirm', () => true)
    cy.get('#custom-opponent-remove').click()
    cy.get('#p2 .select2-container.set-selector .select2-chosen').should('have.text', 'Charizard (Lvl 50 First Enemy)')
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem(teamKey)).map((team) => team.name)).to.deep.eq(['First Enemy'])
      expect(querySets(win, 'p2', 'Second Enemy')).to.have.length(0)
      expect(win.eval('TR_NAMES').some((id) => id.includes('Second Enemy'))).to.eq(false)
      expect(win.eval('customLeads')[-2]).to.eq(undefined)
    })
    cy.get('#custom-opponent-remove').should('be.visible').click()
    cy.get('#custom-opponent-remove').should('not.be.visible')
    cy.get('#p2 .select2-container.set-selector .select2-chosen').should('have.text', 'Charizard (Blank Set)')
    cy.get('#p2 .trainer-pok-list .trainer-pok-container').should('not.exist')
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem(teamKey))).to.deep.eq([])
      expect(querySets(win, 'p2')).to.have.length(0)
      expect(win.eval('TR_NAMES').some((id) => id.includes('First Enemy'))).to.eq(false)
      expect(win.eval('customLeads')[-1]).to.eq(undefined)
      expect(win.localStorage.right).to.eq('Charizard (Blank Set)')
    })
    cy.reload()
    waitForCalcReady()
    cy.get('#custom-opponent-remove').should('not.be.visible')
    cy.window().then((win) => {
      expect(querySets(win, 'p2')).to.have.length(0)
      expect(win.eval('CURRENT_TRAINER_POKS')).to.have.length(0)
    })
  })

  it('keeps a set when removal is canceled and only shows Remove while a custom opponent is selected', () => {
    cy.get('#custom-opponent-remove').should('not.be.visible')
    importTeam('Enemy Team #1', charizard)
    cy.on('window:confirm', () => false)
    cy.get('#custom-opponent-remove').click()
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem(teamKey))[0].pokemon).to.have.length(1)
      expect(querySets(win, 'p2', 'Enemy Team #1')).to.have.length(1)
    })
    cy.get('#p2 .select2-choice').first().click()
    cy.get('#select2-drop .select2-input').type('Charizard')
    cy.get('#select2-drop .select2-result-selectable').contains('Charizard (Blank Set)').click()
    cy.get('#custom-opponent-remove').should('not.be.visible')
    cy.get('#p2 .select2-choice').first().click()
    cy.get('#select2-drop .select2-input').type('Enemy Team #1')
    cy.get('#select2-drop .select2-result-selectable').contains('Charizard (Lvl 50 Enemy Team #1)').click()
    cy.get('#custom-opponent-remove').should('be.visible')
  })

  it('shows AI tags for loaded AI data and hides them when the last team with AI is removed', () => {
    visitBlank(5)
    importTeam('AI Trainer', charizard)
    cy.get('#ai-tags').should('not.be.visible')
    cy.window().then((win) => {
      const teams = JSON.parse(win.localStorage.getItem(teamKey))
      teams[0].pokemon[0].setData.ai = 7
      win.localStorage.setItem(teamKey, JSON.stringify(teams))
    })
    cy.reload()
    waitForCalcReady()
    cy.get('#ai-tags').should('be.visible')
    cy.get('#ai1, #ai2, #ai3').should('be.visible')
    cy.on('window:confirm', () => true)
    cy.get('#custom-opponent-remove').click()
    cy.get('#ai-tags').should('not.be.visible')
    cy.reload()
    waitForCalcReady()
    cy.get('#ai-tags').should('not.be.visible')
  })

  it('handles cancel, empty text and invalid names without saving teams', () => {
    importTeam(null)
    cy.window().then((win) => {
      expect(win.localStorage.getItem(teamKey)).to.eq(null)
      cy.stub(win, 'alert').as('importAlert')
    })
    cy.get('.import-team-text').invoke('val', 'this is not a Pokemon set')
    cy.get('#import-right').click()
    cy.get('@importAlert').should('have.been.calledOnce')
    importTeam('  ')
    importTeam('<invalid>')
    cy.window().then((win) => expect(win.localStorage.getItem(teamKey)).to.eq(null))
  })

  it('keeps player box imports separate, including a team named My Box', () => {
    cy.get('.import-team-text').invoke('val', pikachu)
    cy.get('#import').click()
    cy.get('.player-poks .trainer-pok').should('have.length', 1)
    importTeam('My Box', charizard)
    cy.window().then((win) => win.get_box())
    cy.get('.player-poks .trainer-pok').should('have.length', 1)
    cy.get('#clearSets').click()
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem(teamKey))).to.have.length(1)
      expect(querySets(win, 'p2', 'My Box').filter((option) => option.isCustomOpponentTeam)).to.have.length(1)
    })
  })
})

describe('Blank dev base-game defaults', () => {
  ;[7, 8, 9].forEach((generation) => {
    it(`loads Smogon Gen ${generation} data and routes calculations through vanilla gen789`, () => {
      visitBlank(generation)
      cy.window().then((win) => {
        const species = win.eval('pokedex')
        const moves = win.eval('moves')
        expect(species.Raichu.bs).to.deep.eq({ hp: 60, at: 90, df: 55, sa: 90, sd: 80, sp: 110 })
        expect(species.Infernape.bs.sp).to.eq(108)
        expect(moves.Cut.bp).to.eq(50)
        expect(moves.Explosion.bp).to.eq(250)
        expect(moves['Mega Drain'].bp).to.eq(40)
        expect(species).to.deep.eq(win.calcVanillaData.species[generation])
        Object.keys(win.calcVanillaData.moves[generation]).forEach((name) => {
          expect(moves[name], name).to.deep.eq(win.calcVanillaData.moves[generation][name])
        })
        const spy = cy.spy(win.calc, 'calculateSMSSSVVanilla')
        const gen = win.calc.Generations.get(generation)
        const attacker = new win.calc.Pokemon(gen, 'Raichu')
        const defender = new win.calc.Pokemon(gen, 'Blastoise')
        const result = win.calc.calculate(generation, attacker, defender, new win.calc.Move(gen, 'Thunderbolt'))
        expect(spy).to.have.been.calledOnce
        expect(result.range()[1]).to.be.greaterThan(0)
        expect(attacker.rawStats.spa).to.eq(216)
      })
    })
  })

  it('imports and calculates with Gen 9 species', () => {
    visitBlank(9)
    importTeam('Paldea', 'Gholdengo @ Leftovers\nAbility: Good as Gold\nLevel: 50\n- Make It Rain\n- Shadow Ball')
    cy.get('#p2 .select2-container.set-selector .select2-chosen').should('have.text', 'Gholdengo (Lvl 50 Paldea)')
    cy.get('#levelR1').should('have.value', '50')
    cy.get('#p2 select.move-selector').first().should('have.value', 'Make It Rain')
  })

  it('lets explicit URL defaults override a saved Gen 8 configuration', () => {
    visitBlank()
    cy.window().then((win) => win.devDataOverrides.saveStoredDevConfig({ gen: 8, damageGen: 8 }))
    cy.visit('/index.html?dev=1&gen=9&dmgGen=9&critGen=9&types=6&mechanics=vanilla&forceBlankConfig=1')
    cy.get('#rom-title').should('have.text', 'Blank Slate Dev Calc')
    cy.window().should((win) => {
      expect(win.eval('settings.gen')).to.eq(9)
      expect(win.eval('settings.damageGen')).to.eq(9)
      expect(win.eval('settings.critGen')).to.eq(9)
      expect(win.eval('pokedex.Gholdengo.bs.sa')).to.eq(133)
    })
  })

  it('hides opponent import controls and retains ROM defaults outside dev mode', () => {
    cy.visit('/index.html?data=aetherwhite', { onBeforeLoad(win) { win.localStorage.clear() } })
    cy.get('#rom-title').should('have.text', 'Aether White 2')
    cy.get('#import-right').should('not.exist')
    cy.get('#custom-opponent-teams-filter').should('not.be.visible')
    cy.get('#custom-opponent-remove').should('not.be.visible')
    cy.window().then((win) => {
      expect(win.eval('settings.blankDevMode')).to.eq(false)
      expect(win.calcVanillaData).to.eq(undefined)
    })
  })

  it('shows the import option in a dev calc with a data source and scopes its teams to that source', () => {
    cy.visit('/index.html?dev=1&data=aetherwhite', { onBeforeLoad(win) { win.localStorage.clear() } })
    cy.get('#rom-title').should('have.text', 'Aether White 2')
    cy.get('#import-right').should('be.visible')
    importTeam('Custom Opponent', pikachu)
    cy.window().then((win) => {
      expect(JSON.parse(win.localStorage.getItem('calcCustomOpponentTeams:aetherwhite'))).to.have.length(1)
      expect(win.localStorage.getItem(teamKey)).to.eq(null)
      expect(querySets(win, 'p2', 'Custom Opponent')).to.have.length(1)
    })
  })

  it('applies uploaded overrides on top of the vanilla defaults', () => {
    visitBlank()
    cy.window().then((win) => win.devDataOverrides.saveStoredOverrideRecord({
      key: win.devDataOverrides.getOverrideStorageKey(),
      text: 'var backup_data = ' + JSON.stringify({
        title: 'Custom Dev Data', order: {}, formatted_sets: {}, custom_moves: {},
        poks: { Raichu: {
          bs: { hp: 90, at: 90, df: 55, sa: 90, sd: 80, sp: 110 },
          types: ['Electric'], abilities: { 0: 'Static' },
        } },
        moves: { Cut: { basePower: 80, type: 'Normal', category: 'Physical' } },
      }),
    }))
    cy.reload()
    cy.get('#rom-title').should('have.text', 'Custom Dev Data')
    cy.window().then((win) => {
      expect(win.eval('pokedex.Raichu.bs.hp')).to.eq(90)
      expect(win.eval('SPECIES_BY_ID[9] || SPECIES_BY_ID[8]')).to.be.an('object')
      expect(win.eval('moves.Cut.bp')).to.eq(80)
      expect(win.eval('moves["Mega Drain"].bp')).to.eq(40)
      expect(win.eval('pokedex.Infernape.bs.sp')).to.eq(108)
      return win.devDataOverrides.clearStoredOverrideRecord()
    })
  })
})
