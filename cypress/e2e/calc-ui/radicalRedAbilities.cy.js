function ready() {
  cy.get('#rom-title', {timeout: 30000}).should('have.text', 'Radical Red 4.1 Normal')
  cy.window({timeout: 30000}).should(win => {
    // This older dataset is a direct trainer-set map, not a formatted_sets bundle.
    expect(win.backup_data).to.be.an('object')
    expect(win.eval('TR_NAMES').length).to.be.greaterThan(0)
    expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
    expect(win.$('input.player').data('select2')).to.be.an('object')
    expect(win.eval('initializing')).to.eq(false)
    expect(win.eval('changingSets')).to.eq(false)
    expect(win.radicalRedSaveReader).to.be.an('object')
  })
}

function importEscavalier(slot, randomized) {
  cy.window().then(win => {
    const mon = new Uint8Array(100)
    const data = new DataView(mon.buffer)
    data.setUint32(0, slot === 1 ? 3 : 2, true)
    data.setUint16(32, 642, true)
    data.setUint32(72, slot === 2 ? 0xBFFFFFFF : 0x3FFFFFFF, true)
    mon[84] = 34
    for (const [index, move] of ['Slash', 'Pounce', 'Aerial Ace', 'Bug Bite'].entries()) {
      data.setUint16(44 + index * 2, win.radicalRedSaveConstants.moves.indexOf(move), true)
    }
    const parser = win.radicalRedSaveReader.__test
    const parsed = parser.parsePartyMon(mon, 1, {
      randomAbilities: randomized, restricted: false, trainerIdSecret: (19 << 16) | 212
    }, {levelCap: 34})
    win.applyImportedSnapshot({showdownImport: parser.monToShowdown(parsed), source: 'save-file', replaceDeadMons: true, deadMons: []})
  })
  cy.get('.player-poks [data-id="Escavalier (My Box)"]').click()
}

describe('Radical Red numeric ability slots', () => {
  beforeEach(() => {
    cy.visit('/index.html?data=ced457ba9aa55731616c&dmgGen=8&gen=8&types=6&noSwitch=1', {onBeforeLoad(win) {
      win.localStorage.clear()
      win.localStorage.randomized = '1'
      win.localStorage.filterAbilities = '0'
      win.localStorage.enableAnalytics = '0'
      win.localStorage.autoImportMegas = '0'
      win.localStorage.lvlCap = '34'
    }})
    ready()
  })

  for (const [randomized, abilities] of [
    [false, ['Swarm', 'Battle Armor', 'Overcoat']],
    [true, ['Gluttony', 'Toxic Boost', 'Volt Absorb']]
  ]) {
    it(`updates all three ability slots through the importer and calculator (randomized=${randomized})`, () => {
      for (const [slot, ability] of abilities.entries()) {
        importEscavalier(slot, randomized)
        cy.get('#p1 .ability').should('have.value', ability)
        cy.window().then(win => {
          expect(JSON.parse(win.localStorage.customsets).Escavalier['My Box'].ability).to.eq(ability)
          expect(win.createPokemon(win.$('#p1')).ability).to.eq(ability)
        })
      }
      cy.reload()
      ready()
      cy.get('.player-poks [data-id="Escavalier (My Box)"]').click()
      cy.get('#p1 .ability').should('have.value', abilities[2])
    })
  }

  const savePath = Cypress.env('radicalRedSavePath')
  const testSave = savePath ? it : it.skip
  testSave('corrects the reported save through the actual file-upload control', () => {
    importEscavalier(0, true)
    cy.get('#p1 .ability').should('have.value', 'Gluttony')
    cy.get('#save-upload').selectFile(savePath, {force: true})
    cy.window().should(win => {
      const sets = JSON.parse(win.localStorage.customsets)
      expect(sets.Escavalier['My Box'].ability).to.eq('Toxic Boost')
      expect(sets.Starmie['My Box'].ability).to.eq('Hadron Engine')
      expect(sets.Toedscruel['My Box'].ability).to.eq('Unaware')
      expect(Object.keys(sets)).to.have.length(19)
    })
    for (const [species, ability] of [['Escavalier', 'Toxic Boost'], ['Starmie', 'Hadron Engine'], ['Toedscruel', 'Unaware']]) {
      cy.get(`.player-poks [data-id="${species} (My Box)"]`).click()
      cy.get('#p1 .ability').should('have.value', ability)
      cy.window().then(win => expect(win.createPokemon(win.$('#p1')).ability).to.eq(ability))
    }
  })
})
