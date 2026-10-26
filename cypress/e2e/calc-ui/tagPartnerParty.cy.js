const trainerSet = (index, species = 'Charizard') => `${species} (Lvl 50 Partner Party Test ${index})`
const partySpecies = ['Charizard', 'Pikachu', 'Blastoise']

function visitWithParty(party = partySpecies, generation = 8, prepare = () => {}) {
  cy.visit(`/index.html?dev=1&gen=${generation}&dmgGen=${generation}`, {
    onBeforeLoad(win) {
      win.localStorage.clear()
      const teams = [0, 1, 2].map(index => ({
        name: `Partner Party Test ${index}`, trainerId: -900 - index,
        pokemon: ['Charizard', 'Pikachu'].map((speciesName, subIndex) => ({
          speciesName, setName: `Lvl 50 Partner Party Test ${index}`,
          setData: {
            level: 50, nature: 'Hardy', item: '-',
            ability: subIndex ? 'Static' : 'Blaze',
            moves: ['Tackle', 'Protect', 'Growl', 'Tail Whip'],
            tr_id: -900 - index, sub_index: subIndex, battle_type: 'Singles',
          },
        })),
      }))
      const customsets = Object.fromEntries(partySpecies.map(species => [species, {
        'My Box': {
          level: 50, nature: 'Hardy', item: 'Leftovers', isCustomSet: true,
          ability: species === 'Charizard' ? 'Blaze' : species === 'Pikachu' ? 'Static' : 'Torrent',
          moves: ['Tackle', 'Protect', 'Growl', 'Tail Whip'],
        },
      }]))
      win.localStorage.setItem('calcCustomOpponentTeams:__blank_dev_calc__', JSON.stringify(teams))
      win.localStorage.customsets = JSON.stringify(customsets)
      win.localStorage.currentParty = party.join(',')
      win.localStorage.left = 'Blastoise (My Box)'
      win.localStorage.right = trainerSet(0)
      win.localStorage.hideCurrentAiMon = '0'
      win.localStorage.enableAnalytics = '0'
      prepare(win)
    },
  })
  cy.window().should(win => {
    expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
    expect(win.eval('initializing')).to.eq(false)
    expect(win.$('input.player').data('select2')).to.be.an('object')
  })
  cy.get('input.opposing').should('have.value', trainerSet(0))
}

function choosePartner(index = 1, shortcut = false) {
  if (shortcut) cy.get('body').trigger('keydown', { key: 't', altKey: true })
  else cy.get('#add-player-partner').click()
  cy.get('.select2-search input:visible').first().clear().type(`Partner Party Test ${index}`)
  cy.contains('.select2-drop-active .select2-result-label', `Partner Party Test ${index})`).click()
}

function expectPartner(index = 1) {
  cy.get('.tag-partner-preview-wrapper').should('be.visible')
  cy.get('.tag-partner-preview .tag-partner-pok').should('have.length', 2)
    .first().should('have.attr', 'data-id', trainerSet(index))
  cy.window().then(win => {
    expect(win.manualTagPartnerTrainerId).to.eq(-900 - index)
    expect(win.getSelectedTagPartnerSourceSetId()).to.eq(trainerSet(0))
  })
}

describe('Left tag partner with a populated party', () => {
  beforeEach(() => cy.viewport(1920, 1080))

  it('keeps the partner alongside the party when loading party and partner Pokemon', () => {
    visitWithParty()
    cy.get('.player-party .trainer-pok').should('have.length', 3)
    choosePartner()
    expectPartner()
    cy.get('input.player').should('have.value', 'Blastoise (My Box)')
    cy.get('.player-party .trainer-pok').first().click()
    cy.get('input.player').should('have.value', 'Charizard (My Box)')
    expectPartner()
    cy.get('.tag-partner-preview .tag-partner-pok').last().click()
    cy.get('input.player').should('have.value', trainerSet(1, 'Pikachu'))
    expectPartner()
    cy.get('.player-party .trainer-pok').last().click()
    expectPartner()
  })

  it('keeps the partner through party additions, removals and imported box refreshes', () => {
    visitWithParty([])
    choosePartner(1, true)
    expectPartner()
    cy.get('.player-poks [data-id="Charizard (My Box)"]').rightclick()
    cy.get('.player-party .trainer-pok').should('have.length', 1)
    expectPartner()
    cy.window().then(win => win.displayParty())
    expectPartner()
    cy.window().then(win => win.applyImportedBoxPreview(JSON.parse(win.localStorage.customsets)))
    expectPartner()
    choosePartner(2)
    expectPartner(2)
    cy.get('.player-party .trainer-pok').first().rightclick()
    expectPartner(2)
    cy.get('.player-poks [data-id="Pikachu (My Box)"]').rightclick()
    cy.get('#clear-party').click()
    expectPartner(2)
  })

  for (const generation of [3, 4, 5]) {
    it(`keeps the partner with a party in generation ${generation}`, () => {
      visitWithParty(partySpecies, generation)
      choosePartner()
      cy.get('.player-party .trainer-pok').first().click()
      cy.window().then(win => win.displayParty())
      expectPartner()
    })
  }

  it('shows the partner with a party in the mobile dual-panel layout', () => {
    cy.viewport(780, 1000)
    visitWithParty()
    choosePartner()
    cy.get('.player-party .trainer-pok').should('have.length', 3)
    expectPartner()
    cy.get('#p1').screenshot('tag-partner-with-party-mobile')
  })

  it('shows a chosen partner in the mobile single-panel layout', () => {
    cy.viewport(390, 844)
    visitWithParty(partySpecies, 8, win => {
      win.localStorage.mobileDualPanelLayout = '0'
      win.localStorage.mobileCalcSidePanel = 'p1'
    })
    choosePartner()
    expectPartner()
  })
})
