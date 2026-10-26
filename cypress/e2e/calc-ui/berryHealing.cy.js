function ready() {
  cy.window().should(win => {
    expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
    expect(win.eval('initializing')).to.eq(false)
    expect(win.$('input.player').data('select2')).to.be.an('object')
  })
}

function loadPokemon(side, species = 'Mew') {
  cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
  cy.window().then(win => {
    win.$(`#${side} input.set-selector`).val(`${species} (Blank Set)`).change()
    win.$(`#${side} .select2-chosen`).first().text(`${species} (Blank Set)`)
  })
  cy.get(`#${side} .nature`).select('Hardy')
  cy.get(`#${side} .level`).clear().type('50').trigger('change')
}

function visitBlank(generation = 8) {
  cy.visit(`/index.html?dev=1&gen=${generation}&dmgGen=${generation}&view=calculator`, {
    onBeforeLoad(win) { win.localStorage.clear() },
  })
  cy.get('#rom-title').should('have.text', 'Blank Slate Dev Calc')
  ready()
  loadPokemon('p1')
  loadPokemon('p2')
}

function expectRecovery(side, divisor, suffix = '') {
  cy.get(`#${side} .max-hp`).invoke('text').then(text => {
    cy.get(`#${side} .chip-damage--berry-healing`).should('have.text', `+${Math.max(1, Math.floor(Number(text) / divisor))}${suffix}`)
  })
}

describe('Inline berry recovery', () => {
  beforeEach(() => cy.viewport(1280, 900))

  it('shows one-time Sitrus recovery at full HP on both sides and responds to item/HP/selection changes', () => {
    visitBlank()
    for (const side of ['p1', 'p2']) {
      cy.get(`#${side} .item`).select('Sitrus Berry')
      expectRecovery(side, 4)
      cy.get(`#${side} .chip-damage--berry-healing`).should('have.css', 'background-color', 'rgb(80, 250, 123)')
      cy.get(`#${side} .max-hp`).invoke('text').then(maxHp => cy.get(`#${side} .current-hp`).should('have.value', maxHp))
      cy.get(`#${side} .itemToggle`).uncheck()
      cy.get(`#${side} .chip-damage--berry-healing`).should('not.exist')
      cy.get(`#${side} .itemToggle`).check()
      expectRecovery(side, 4)
      cy.get(`#${side} .level`).clear().type('60').trigger('change')
      expectRecovery(side, 4)
      cy.get(`#${side} .item`).should('have.value', 'Sitrus Berry')
    }
    loadPokemon('p2', 'Pikachu')
    cy.get('#p2 .chip-damage--berry-healing').should('not.exist')
    cy.get('#p2 .item').select('Sitrus Berry')
    expectRecovery('p2', 4)
    cy.get('#p1 .item').select('Oran Berry')
    cy.get('#p1 .chip-damage--berry-healing').should('not.exist')
  })

  it('updates all flavor warnings immediately and accounts for Own Tempo, Ripen and opposing Neutralizing Gas', () => {
    visitBlank()
    for (const [berry, nature] of [
      ['Figy Berry', 'Timid'], ['Wiki Berry', 'Adamant'], ['Mago Berry', 'Brave'],
      ['Aguav Berry', 'Naive'], ['Iapapa Berry', 'Hasty'],
    ]) {
      cy.get('#p1 .item').select(berry)
      cy.get('#p1 .nature').select(nature)
      expectRecovery('p1', 3, ' + ??')
      cy.get('#p1 .chip-damage--berry-healing').should('have.attr', 'title').and('include', 'causes confusion')
      cy.get('#p1 .nature').select('Hardy')
      expectRecovery('p1', 3)
    }
    cy.get('#p1 .item').select('Figy Berry')
    cy.get('#p1 .nature').select('Timid')
    cy.get('#p1 .ability').select('Own Tempo')
    expectRecovery('p1', 3)
    cy.get('#p2 .ability').select('Neutralizing Gas')
    expectRecovery('p1', 3, ' + ??')
    cy.get('#p1 .ability').select('Ripen')
    expectRecovery('p1', 3, ' + ??')
    cy.get('#p2 .ability').select('Run Away')
    cy.get('#p1 .max-hp').invoke('text').then(hp => {
      cy.get('#p1 .chip-damage--berry-healing').should('have.text', `+${2 * Math.floor(Number(hp) / 3)} + ??`)
    })
    cy.get('#p1 .chip-damage--berry-healing').should('have.attr', 'title').and('include', 'Ripen doubles recovery')
    cy.get('#p2 .item').select('Wiki Berry')
    cy.get('#p2 .nature').select('Adamant')
    cy.get('#p2 .ability').select('Own Tempo')
    expectRecovery('p2', 3)
    cy.get('#p1 .ability').select('Neutralizing Gas')
    expectRecovery('p2', 3, ' + ??')
  })

  it('keeps berry recovery separate from per-turn healing and preserves passive item totals', () => {
    visitBlank()
    cy.get('#p1 .ability').select('Ice Body')
    // The blank calculator hides its hail button; set the weather fixture directly.
    cy.window().then(win => win.$('#hail').prop('checked', true).trigger('change'))
    cy.get('#p1 .item').select('Figy Berry')
    expectRecovery('p1', 3)
    cy.get('#p1 .max-hp').invoke('text').then(hp => {
      cy.get('#p1 .chip-damage--healing').should('have.text', `+${Math.floor(Number(hp) / 16)} per turn`)
      cy.get('#p1 .item').select('Leftovers')
      cy.get('#p1 .chip-damage--berry-healing').should('not.exist')
      cy.get('#p1 .chip-damage--healing').should('have.text', `+${2 * Math.floor(Number(hp) / 16)} per turn`)
    })
    cy.get('#p1 .ability').select('Run Away')
    cy.get('label[for="clear"]').click()
    cy.get('#p1 .type1').select('Poison')
    cy.get('#p1 .item').select('Black Sludge')
    cy.get('#p1 .max-hp').invoke('text').then(hp => {
      cy.get('#p1 .chip-damage--healing').should('have.text', `+${Math.floor(Number(hp) / 16)} per turn`)
    })
    cy.get('#p1 .ability').select('Poison Heal')
    cy.get('#statusL1').select('Poisoned')
    cy.get('#p1 .item').select('Sitrus Berry')
    expectRecovery('p1', 4)
    cy.get('#p1 .max-hp').invoke('text').then(hp => {
      cy.get('#p1 .chip-damage--healing').should('have.text', `+${Math.floor(Number(hp) / 8)} per turn`)
    })
  })

  for (const generation of [3, 4, 7]) {
    it(`uses the configured berry rules with generation ${generation} mechanics`, () => {
      visitBlank(generation)
      cy.get('#p1 .item').select('Sitrus Berry')
      if (generation === 3) cy.get('#p1 .chip-damage--berry-healing').should('not.exist')
      else expectRecovery('p1', 4)
      cy.get('#p1 .item').select('Figy Berry')
      expectRecovery('p1', generation === 7 ? 3 : 8)
    })
  }

  it('uses half-HP flavor berries in Photonic Sun/Prismatic Moon', () => {
    cy.visit('/index.html?data=pspm&dmgGen=7&gen=7&types=6&view=calculator', {
      onBeforeLoad(win) { win.localStorage.clear() },
    })
    cy.get('#rom-title').should('have.text', 'Photonic Sun/Prismatic Moon')
    ready()
    loadPokemon('p1')
    cy.get('#p1 .item').select('Figy Berry')
    expectRecovery('p1', 2)
    cy.get('#p1 .nature').select('Modest')
    expectRecovery('p1', 2, ' + ??')
  })

  it('keeps healing and confusion badges readable on desktop and mobile', () => {
    visitBlank()
    for (const [side, berry, nature] of [['p1', 'Figy Berry', 'Timid'], ['p2', 'Wiki Berry', 'Adamant']]) {
      cy.get(`#${side} .item`).select(berry)
      cy.get(`#${side} .nature`).select(nature)
      expectRecovery(side, 3, ' + ??')
    }
    cy.get('#p1 .hp-cntrl').screenshot('berry-healing-desktop')
    cy.viewport(390, 844)
    for (const side of ['p1', 'p2']) {
      cy.get(`#${side} .chip-damage--berry-healing`).scrollIntoView({ offset: { top: -180 } }).should('be.visible')
      cy.get(`#${side} .chip-damage--berry-healing`).then($badge => {
        const badge = $badge[0].getBoundingClientRect()
        const row = $badge.closest('.hp-cntrl')[0].getBoundingClientRect()
        expect(badge.left).to.be.at.least(row.left)
        expect(badge.right).to.be.at.most(row.right)
      })
    }
    cy.get('#p1 .hp-cntrl').scrollIntoView({ offset: { top: -180 } })
    cy.screenshot('berry-healing-mobile', { capture: 'viewport' })
  })
})
