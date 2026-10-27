const spirit = '.opposing-team-group[data-team-index="7"]'
const boxSets = {
  Pikachu: {'My Box': {level: 81, nature: 'Timid', ability: 'Static', item: 'Light Ball',
    moves: ['Thunderbolt', 'Surf', 'Protect', 'Thunder Wave'], ivs: {hp: 27, at: 19, df: 25, sa: 31, sd: 29, sp: 30},
    evs: {hp: 4, sa: 252, sp: 252}, gender: 'F', isCustomSet: true}},
  Charizard: {'My Box': {level: 82, nature: 'Modest', ability: 'Blaze', item: 'Leftovers',
    moves: ['Flamethrower', 'Air Slash', 'Dragon Pulse', 'Protect'], isCustomSet: true}},
  'Palafin-Hero': {'My Box': {level: 83, nature: 'Adamant', ability: 'Zero to Hero', item: 'Mystic Water',
    moves: ['Jet Punch', 'Wave Crash', 'Close Combat', 'Flip Turn'], isCustomSet: true}}
}

function ready(title) {
  cy.get('#rom-title', {timeout: 30000}).should('have.text', title)
  cy.window().should(win => {
    expect(win.opposingPreviewReady).to.eq(true)
    expect(win.eval('initializing')).to.eq(false)
    expect(win.eval('changingSets')).to.eq(false)
  })
}

function visit(slug, title, party = Object.keys(boxSets)) {
  cy.visit(`/index.html?data=${slug}`, {onBeforeLoad(win) {
    win.localStorage.clear()
    win.localStorage.customsets = JSON.stringify(boxSets)
    win.localStorage.currentParty = party.join(',')
    win.localStorage.left = 'Pikachu (My Box)'
    win.localStorage.hideCurrentAiMon = '0'
    win.localStorage.enableAnalytics = '0'
  }})
  ready(title)
  cy.window().then(win => win.setOpposing(win.getTrainerSetsById(475)[0].setId))
  cy.get('.opposing-team-group').should('have.length', 8)
  cy.get('.opposing-team-heading').should('contain', 'Cedric')
}

function expectCopies(species) {
  cy.get(`${spirit} .trainer-pok`).should('have.length', species.length)
  cy.window().should(win => {
    const team = win.opposingPreviewState.teams[7]
    expect(team.setIds.map(id => id.split(' (')[0])).to.deep.eq(species)
    team.setIds.forEach((id, index) => {
      expect(win.getSetDataBySetId(id).tr_id).to.eq(843)
      expect(win.getSetDataBySetId(id).sub_index).to.eq(index)
    })
  })
}

describe('Pokemon Null Wandering Spirit mirror party', () => {
  beforeEach(() => cy.viewport(1280, 1000))
  for (const [slug, title] of [['null', 'Pokemon Null 1.2'], ['null125', 'Pokemon Null 1.2.5']]) {
    it(`copies complete sets and follows live party edits in ${title}`, () => {
      visit(slug, title)
      expectCopies(Object.keys(boxSets))
      cy.get(`${spirit} .bp-info, ${spirit} .opposing-team-heading, ${spirit} .opposing-team-remove`).should('not.exist')
      cy.get(`${spirit} .trainer-pok`).first().click()
      cy.get('.opposing-team-heading').should('contain', 'Wandering Spirit')
      cy.get('#p2 .level').should('have.value', '81')
      cy.get('#p2 .nature').should('have.value', 'Timid')
      cy.get('#p2 .ability').should('have.value', 'Static')
      cy.get('#p2 .item').should('have.value', 'Light Ball')
      cy.get('#p2 .hp .ivs').should('have.value', '27')
      cy.get('#p2 .at .ivs').should('have.value', '19')
      cy.get('#p2 .move1 select.move-selector').should('have.value', 'Thunderbolt')
      cy.window().then(win => {
        expect(win.eval('CURRENT_TRAINER_POKS').every(id => win.getSetDataBySetId(id).tr_id === 843)).to.eq(true)
        const sets = JSON.parse(win.localStorage.customsets)
        sets.Pikachu['My Box'].level = 85
        sets.Pikachu['My Box'].nature = 'Modest'
        sets.Pikachu['My Box'].item = 'Leftovers'
        sets.Pikachu['My Box'].moves[0] = 'Discharge'
        sets.Pikachu['My Box'].ivs.hp = 23
        win.applyImportedBoxPreview(sets)
      })
      cy.get('#p2 .level').should('have.value', '85')
      cy.get('#p2 .nature').should('have.value', 'Modest')
      cy.get('#p2 .item').should('have.value', 'Leftovers')
      cy.get('#p2 .hp .ivs').should('have.value', '23')
      cy.get('#p2 .move1 select.move-selector').should('have.value', 'Discharge')
      cy.reload()
      ready(title)
      expectCopies(Object.keys(boxSets))
      cy.get('.opposing-team-heading').should('contain', 'Wandering Spirit')
      cy.get('#p2 .level').should('have.value', '85')
      cy.window().then(win => {
        const sets = JSON.parse(win.localStorage.customsets)
        sets.Pikachu['My Box'].item = 'Magnet'
        sets.Pikachu['My Box'].moves[0] = 'Thunder'
        win.applyImportedBoxPreview(sets)
      })
      // Same species/level keeps the same ID, but the right-side fields still reload.
      cy.get('#p2 .item').should('have.value', 'Magnet')
      cy.get('#p2 .move1 select.move-selector').should('have.value', 'Thunder')
      cy.get('.player-party [data-id="Charizard (My Box)"]').rightclick('top')
      expectCopies(['Pikachu', 'Palafin-Hero'])
      cy.get('.player-poks [data-id="Charizard (My Box)"]').rightclick()
      expectCopies(['Pikachu', 'Palafin-Hero', 'Charizard'])
      cy.get(`${spirit} .trainer-pok`).eq(1).click()
      cy.get('#p2 .at .base').should('have.value', '160')
      cy.get('#p2 .move1 select.move-selector').should('have.value', 'Jet Punch')
      cy.get('.player-party [data-id="Palafin-Hero (My Box)"]').rightclick('top')
      expectCopies(['Pikachu', 'Charizard'])
      cy.get('input.opposing').should('have.value', 'Charizard (Lvl 82 Wandering Spirit Slot2 |Mt. Pyre|)')
      cy.get('#p2 .ability').should('have.value', 'Blaze')
      cy.get('#clear-party').click()
      cy.get(`${spirit} .trainer-pok`).should('not.exist')
      cy.get(`${spirit} .wandering-spirit-empty`).should('be.visible')
      cy.get('.opposing-team-heading').should('contain', 'Cedric')
      cy.window().then(win => expect(win.getTrainerSetsById(843)).to.have.length(0))
      cy.get('.player-poks [data-id="Pikachu (My Box)"]').rightclick()
      expectCopies(['Pikachu'])
      cy.get(`${spirit} .trainer-pok`).click()
      cy.get('#p2 .level').should('have.value', '85')
    })

    it(`mirrors preserved duplicate/form slots and shows empty-party guidance in ${title}`, () => {
      visit(slug, title, [])
      cy.get(`${spirit} .wandering-spirit-empty`).should('contain', 'Add Pokémon')
      cy.window().then(win => {
        const first = JSON.parse(JSON.stringify(boxSets.Pikachu['My Box']))
        const second = {...first, level: 72, nature: 'Adamant', item: 'Choice Band', moves: ['Volt Tackle', 'Quick Attack']}
        win.restorePartyPreviewSnapshot({speciesList: ['Pikachu', 'Pikachu', 'Palafin-Hero'], previewSlots: [
          {speciesName: 'Pikachu', setData: first}, {speciesName: 'Pikachu', setData: second},
          {speciesName: 'Palafin-Hero', setData: boxSets['Palafin-Hero']['My Box']}
        ]})
      })
      expectCopies(['Pikachu', 'Pikachu', 'Palafin-Hero'])
      cy.get(`${spirit} .trainer-pok`).eq(1).click()
      cy.get('#p2 .level').should('have.value', '72')
      cy.get('#p2 .nature').should('have.value', 'Adamant')
      cy.get('#p2 .item').should('have.value', 'Choice Band')
      cy.get('#p2 .move1 select.move-selector').should('have.value', 'Volt Tackle')
      cy.window().then(win => {
        const replacement = JSON.parse(JSON.stringify(boxSets))
        replacement.Pikachu['My Box'].level = 50
        replacement.Pikachu['My Box'].moves = ['Tackle']
        // Updating the underlying box must not replace a preserved party slot.
        win.localStorage.importPartyPreview = '0'
        win.runWithImportPartyPreviewPolicy(() => win.applyImportedBoxPreview(replacement))
      })
      // Explicit snapshot overrides remain authoritative when just re-rendered.
      cy.get('#p2 .level').should('have.value', '72')
      cy.viewport(390, 844)
      cy.get('.panel-wrapper').should('have.class', 'mobile-dual-panel-layout')
      cy.get(`${spirit} .trainer-pok`).last().click()
      cy.get('#p2 .at .base').should('have.value', '160')
      cy.window().then(win => win.eval('stickyMoves.clearStickyMove()'))
      cy.get(spirit).scrollIntoView({offset: {top: -100, left: 0}})
      cy.screenshot(`wandering-spirit-${slug}-mobile`, {capture: 'viewport'})
    })
  }
})
