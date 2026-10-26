const customTeamsKey = 'calcCustomOpponentTeams:__blank_dev_calc__'
const previewKey = 'calcOpposingPreview:__blank_dev_calc__:Blank Slate Dev Calc'
const teamName = index => `Cypress Team ${String.fromCharCode(65 + index)}${index === 3 ? ' with a long trainer title "Team" Route 101' : ''}`
const setId = (index, species = 'Charizard') => `${species} (Lvl 50 ${teamName(index)})`

function storedTeams() {
  return Array.from({ length: 6 }, (_, index) => ({
    name: teamName(index), trainerId: -800 - index,
    pokemon: ['Charizard', 'Pikachu'].map((speciesName, subIndex) => ({
      speciesName, setName: `Lvl 50 ${teamName(index)}`,
      setData: {
        level: 50, nature: 'Hardy', item: '-',
        ability: subIndex ? 'Static' : 'Blaze',
        moves: ['Tackle', 'Protect', 'Growl', 'Tail Whip'],
        tr_id: -800 - index, sub_index: subIndex,
        battle_type: index === 2 ? 'Doubles' : 'Singles', isCustomOpponentTeam: true,
      },
    })),
  }))
}

function ready() {
  cy.window().should(win => {
    expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
    expect(win.eval('initializing')).to.eq(false)
    expect(win.opposingPreviewReady).to.eq(true)
    expect(win.$('input.opposing').data('select2')).to.be.an('object')
  })
}

function visit(generation = 8, prepare = () => {}) {
  cy.visit(`/index.html?dev=1&gen=${generation}&dmgGen=${generation}`, {
    onBeforeLoad(win) {
      win.localStorage.clear()
      win.localStorage.setItem(customTeamsKey, JSON.stringify(storedTeams()))
      win.localStorage.right = setId(0)
      win.localStorage.hideCurrentAiMon = '0'
      win.localStorage.enableAnalytics = '0'
      prepare(win)
    },
  })
  ready()
  cy.get('input.opposing').should('not.have.value', '')
}

function add(index, mode = 'b2b') {
  cy.get(mode === 'partner' ? '#add-opposing-partner' : '#add-opposing-team').click()
  cy.get('.select2-search input:visible').first().clear().type(teamName(index))
  cy.contains('.select2-drop-active .select2-result-label', `${teamName(index)})`).click()
}

function selectOpponent(index) {
  cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
  cy.window().then(win => win.setOpposing(setId(index)))
  cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
}

function selectTeam(index) {
  cy.get(`.opposing-team-group[data-team-index="${index}"] .trainer-pok.right-side`).first().click()
  cy.get('input.opposing').should('have.value', setId(index))
}

describe('Opposing partner and B2B trainer lists', () => {
  beforeEach(() => cy.viewport(1920, 1080))

  it('adds a partner without changing the selected opponent, and removes it immediately', () => {
    visit()
    add(1, 'partner')
    cy.get('input.opposing').should('have.value', setId(0))
    cy.get('#doubles-format').should('be.checked')
    cy.get('#opposing-partner-active').should('be.visible').and('have.text', 'Partner Mode Active')
    cy.get('#add-opposing-team, #add-opposing-partner').should('be.disabled')
    cy.get('.opposing-team-group').should('have.length', 2)
    cy.get('.trainer-preview-primary .trainer-pok').should('have.length', 2)
    cy.get('.trainer-preview-partner .trainer-pok').should('have.length', 2)
    selectTeam(1)
    cy.get('.opposing-team-remove').click()
    cy.get('input.opposing').should('have.value', setId(0))
    cy.get('#singles-format').should('be.checked')
    cy.get('#opposing-partner-active').should('not.be.visible')
    cy.get('.opposing-team-remove').should('not.exist')
    cy.get('#add-opposing-team, #add-opposing-partner').should('not.be.disabled')
  })

  for (const generation of [3, 4, 5, 8]) {
    it(`keeps four B2B teams separate from active AI reserves in generation ${generation}`, () => {
      visit(generation)
      add(1)
      cy.get('#singles-format').should('be.checked')
      add(2)
      add(3)
      cy.get('.opposing-team-group').should('have.length', 4)
      cy.get('.opposing-team-remove').should('have.length', 3)
      cy.get('#add-opposing-team, #add-opposing-partner').should('be.disabled')
      cy.get('#opposing-partner-active').should('not.be.visible')
      cy.get('.opposing-team-group').each($team => {
        cy.wrap($team).find('.trainer-pok').should('have.length', 2)
        cy.wrap($team).find('.bp-info').should('have.length', 8)
      })
      selectTeam(2)
      cy.get('#doubles-format').should('be.checked')
      cy.window().then(win => {
        expect(win.eval('CURRENT_TRAINER_POKS')).to.deep.eq([`${setId(2)}[0]`, `${setId(2, 'Pikachu')}[1]`])
        expect(win.get_next_in().map(entry => entry[0]).sort()).to.deep.eq([`${setId(2)}[0]`, `${setId(2, 'Pikachu')}[1]`].sort())
        expect(win.eval('partnerName')).to.eq(null)
        expect(win.opposingPreviewState.teams.map(team => team.name)).to.deep.eq([0, 1, 2, 3].map(teamName))
        expect(win.addOpposingPreviewTeam(setId(4), 'b2b')).to.eq(false)
      })
      selectTeam(1)
      cy.get('#singles-format').should('be.checked')
      if (generation === 8) {
        cy.viewport(1280, 720)
        cy.get('#p2').screenshot('b2b-four-teams-desktop')
      }
    })
  }

  it('cancels cleanly, rejects duplicates, and returns to ordinary mode after removal', () => {
    visit()
    cy.get('#add-opposing-team').click()
    cy.get('.select2-search input:visible').type('{esc}')
    cy.window().then(win => expect(win.opposingPreviewState.pending).to.eq(null))
    cy.get('.opposing-team-group').should('not.exist')
    add(0)
    cy.get('#opposing-preview-message').should('contain', 'already in the list')
    cy.get('.opposing-team-group').should('not.exist')
    cy.get('label[for="doubles-format"]').click()
    add(1)
    cy.get('#doubles-format').should('be.checked')
    add(1)
    cy.get('.opposing-team-group').should('have.length', 2)
    add(2)
    selectTeam(2)
    cy.get('.opposing-team-remove[data-team-index="1"]').click()
    cy.get('input.opposing').should('have.value', setId(2))
    cy.get('.opposing-team-remove').click()
    cy.get('input.opposing').should('have.value', setId(0))
    cy.get('.opposing-team-group').should('not.exist')
    cy.get('#add-opposing-partner').should('not.be.disabled')
  })

  it('restores the list, selection and format after reload, and resets on outside navigation', () => {
    visit()
    add(1)
    add(2)
    selectTeam(2)
    cy.reload()
    ready()
    cy.get('input.opposing').should('have.value', setId(2))
    cy.get('.opposing-team-group').should('have.length', 3)
    cy.get('#doubles-format').should('be.checked')
    cy.window().then(win => {
      expect(win.opposingPreviewState.teams.map(team => team.name)).to.deep.eq([0, 1, 2].map(teamName))
      win.$('.trainer-preview-mobile-actions').css('display', 'flex')
        .find('.nav-tag.next').attr('data-next', '-804').show()
    })
    cy.get('.trainer-preview-mobile-actions .nav-tag.next').click()
    cy.get('input.opposing').should('have.value', setId(4))
    cy.get('.opposing-team-group').should('not.exist')
    cy.get('#singles-format').should('be.checked')
    cy.reload()
    ready()
    cy.get('.opposing-team-group').should('not.exist')
  })

  it('removes automatic partners without reintroducing them, including after reload', () => {
    visit(8, win => {
      const teams = storedTeams()
      teams[0].pokemon.forEach(pokemon => { pokemon.setData.partner = -801 })
      win.localStorage.setItem(customTeamsKey, JSON.stringify(teams))
    })
    cy.get('.trainer-preview-partner .trainer-pok').should('have.length', 2)
    cy.get('#opposing-partner-active').should('be.visible')
    cy.get('.opposing-team-remove').click()
    cy.get('#singles-format').should('be.checked')
    cy.reload()
    ready()
    cy.get('.opposing-team-group').should('not.exist')
    cy.get('#singles-format').should('be.checked')
    selectOpponent(4)
    cy.get('input.opposing').should('have.value', setId(4))
    selectOpponent(0)
    cy.get('.trainer-preview-partner .trainer-pok').should('have.length', 2)
  })

  it('uses the remaining trainer’s native Doubles format after partner removal', () => {
    visit()
    selectOpponent(2)
    cy.get('input.opposing').should('have.value', setId(2))
    add(1, 'partner')
    cy.get('.opposing-team-remove').click()
    cy.get('#doubles-format').should('be.checked')
    cy.get('#opposing-partner-active').should('not.be.visible')
  })

  it('preserves the Alt+P pin workflow and migrates valid legacy partners', () => {
    visit(8, win => { win.localStorage.partnerName = teamName(1) })
    cy.get('.trainer-preview-partner .trainer-pok').should('have.length', 2)
    cy.window().then(win => expect(win.localStorage.partnerName).to.eq(undefined))
    cy.get('body').trigger('keydown', { key: 'p', altKey: true })
    cy.get('#opposing-partner-active').should('not.be.visible')
    cy.get('body').trigger('keydown', { key: 'p', altKey: true })
    selectOpponent(2)
    cy.get('.trainer-preview-partner .trainer-pok').should('have.length', 2)
    cy.get('#opposing-partner-active').should('be.visible')
    cy.get('#doubles-format').should('be.checked')
    cy.get('body').trigger('keydown', { key: 't', altKey: true })
    cy.window().then(win => {
      expect(win.isManualTagPartnerSelectionPending()).to.eq(true)
      expect(win.$('input.player').data('select2').opened()).to.eq(true)
    })
    cy.get('.select2-search input:visible').type('{esc}')
  })

  it('discards unavailable saved teams and ignores another game’s list', () => {
    visit(8, win => {
      const saved = { version: 1, mode: 'b2b', teams: [setId(0), 'Missing (Lvl 50 Missing)', setId(2)], selectedSetId: setId(2) }
      win.localStorage.setItem(previewKey, JSON.stringify(saved))
      win.localStorage.setItem(previewKey.replace('__blank_dev_calc__', 'other-game'), JSON.stringify({ ...saved, teams: [setId(0), setId(3)] }))
    })
    cy.get('input.opposing').should('have.value', setId(2))
    cy.get('.opposing-team-group').should('have.length', 2)
    cy.window().then(win => {
      win.localStorage.removeItem(previewKey)
      win.localStorage.right = setId(0)
    })
    cy.reload()
    ready()
    cy.get('.opposing-team-group').should('not.exist')
    cy.window().then(win => win.localStorage.setItem(previewKey, '{broken'))
    cy.reload()
    ready()
    cy.get('#add-opposing-team').should('not.be.disabled')
  })

  it('keeps the left partner button and Alt+T independent of the opposing partner picker', () => {
    visit(8, win => {
      const teams = storedTeams()
      teams[0].pokemon.forEach(pokemon => { pokemon.setData.tagPartner = -801 })
      teams[2].pokemon.forEach(pokemon => { pokemon.setData.isCustomOpponentTeam = false })
      teams[4].pokemon.forEach(pokemon => { pokemon.setData.isCustomOpponentTeam = false })
      win.localStorage.setItem(customTeamsKey, JSON.stringify(teams))
    })
    cy.get('.tag-partner-preview .tag-partner-pok').should('have.length', 2)
    cy.get('input.player').invoke('val').as('originalPlayerSet')
    cy.get('body').trigger('keydown', { key: 't', altKey: true })
    cy.get('.select2-search input:visible').first().clear().type(teamName(2))
    cy.contains('.select2-drop-active .select2-result-label', `${teamName(2)})`).click()
    cy.get('.tag-partner-preview .tag-partner-pok').first().should('have.attr', 'data-id', setId(2))
    add(1, 'partner')
    cy.get('input.opposing').should('have.value', setId(0))
    cy.get('@originalPlayerSet').then(value => cy.get('input.player').should('have.value', value))
    cy.get('.tag-partner-preview .tag-partner-pok').first().should('have.attr', 'data-id', setId(2))
    cy.get('#opposing-partner-active').should('be.visible')
    cy.get('#add-player-partner').click()
    cy.get('.select2-search input:visible').first().clear().type(teamName(4))
    cy.contains('.select2-drop-active .select2-result-label', `${teamName(4)})`).click()
    cy.get('.tag-partner-preview .tag-partner-pok').first().should('have.attr', 'data-id', setId(4))
    cy.get('@originalPlayerSet').then(value => cy.get('input.player').should('have.value', value))
    cy.get('input.opposing').should('have.value', setId(0))
    cy.get('#opposing-partner-active').should('be.visible')
    cy.get('#add-player-partner').click()
    cy.get('.select2-search input:visible').type('{esc}')
    cy.get('.tag-partner-preview .tag-partner-pok').first().should('have.attr', 'data-id', setId(4))
    cy.window().then(win => {
      const footer = win.document.querySelector('.player-preview-footer').getBoundingClientRect()
      const panel = win.document.querySelector('#p1').getBoundingClientRect()
      expect(Math.abs(footer.bottom - panel.bottom)).to.be.lessThan(2)
    })
  })

  it('keeps remembered health across list edits and B2B trainer switches', () => {
    visit()
    cy.window().then(win => {
      const player = { level: 50, nature: 'Hardy', ability: 'Torrent', moves: ['Tackle', 'Protect', 'Growl', 'Tail Whip'], isCustomSet: true }
      win.customSets = { Blastoise: { 'My Box': player } }
      win.updateDex(win.customSets)
      win.$('input.player').val('Blastoise (My Box)').change()
      win.$('.player .select2-chosen').text('Blastoise (My Box)')
    })
    cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
    cy.window().then(win => {
      win.localStorage.rememberHpStatus = '1'
      win.localStorage.rememberedEnemyHpStatus = JSON.stringify({ [setId(0)]: { status: 'Poisoned', currentHp: 12 } })
      win.$('#statusR1').val('Poisoned').change()
      win.$('#p2 .current-hp').val(12).change()
      win.$('#statusL1').val('Paralyzed').change()
      win.$('#p1 .current-hp').val(35).change()
    })
    add(1)
    add(2)
    cy.get('#statusR1').should('have.value', 'Poisoned')
    cy.get('#p2 .current-hp').should('have.value', '12')
    selectTeam(1)
    cy.get('#statusR1').select('Burned')
    cy.get('#p2 .current-hp').clear().type('21').blur()
    selectTeam(0)
    cy.get('#statusR1').should('have.value', 'Poisoned')
    cy.get('#p2 .current-hp').should('have.value', '12')
    cy.get('.opposing-team-remove[data-team-index="2"]').click()
    selectTeam(1)
    cy.get('#statusR1').should('have.value', 'Burned')
    cy.get('#p2 .current-hp').should('have.value', '21')
    cy.get('#statusL1').should('have.value', 'Paralyzed')
    cy.get('#p1 .current-hp').should('have.value', '35')
  })

  it('wraps footer controls on mobile without overlapping the four team previews', () => {
    visit()
    add(1)
    add(2)
    add(3)
    cy.viewport(390, 844)
    cy.get('.opposing-preview-footer').scrollIntoView()
    cy.get('#add-opposing-team').should('be.visible')
    cy.get('.opposing-team-heading').each($heading => cy.wrap($heading).should('be.visible'))
    cy.get('.opposing-team-remove').each($button => cy.wrap($button).should('be.visible'))
    cy.get('.opposing-team-remove[data-team-index="3"]').should('have.attr', 'aria-label', `Remove ${teamName(3)}`)
    cy.window().then(win => {
      const footer = win.document.querySelector('.opposing-preview-footer').getBoundingClientRect()
      const previews = win.document.querySelector('.opposing.trainer-pok-list').getBoundingClientRect()
      expect(footer.top).to.be.at.least(previews.bottom)
      expect(footer.right).to.be.at.most(390)
    })
    cy.get('#p2').screenshot('b2b-four-teams-mobile')
    cy.get('.opposing-team-remove[data-team-index="3"]').click()
    cy.get('.opposing-team-group').should('have.length', 3)
    cy.get('#add-player-partner').should('be.visible').click()
    cy.get('.select2-search input:visible').type('{esc}')
    cy.window().then(win => expect(win.isManualTagPartnerSelectionPending()).to.eq(false))
  })
})
