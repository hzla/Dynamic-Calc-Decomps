const originalUrl = './?data=vw&gen=8&dmgGen=5&types=5&view=calculator'

function waitForCalc(title) {
  cy.get('#rom-title').should('have.text', title)
  cy.window({ timeout: 30000 }).should(win => {
    expect(win.backup_data && win.backup_data.formatted_sets).to.be.an('object')
    expect(win.eval('initializing')).to.eq(false)
    expect(win.eval('changingSets')).to.eq(false)
  })
}

describe('Vintage White Original variant', () => {
  let pageErrors

  beforeEach(() => {
    pageErrors = []
    cy.on('window:before:load', win => {
      win.addEventListener('error', event => pageErrors.push(event.message))
    })
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
  })

  afterEach(() => {
    expect(pageErrors, 'uncaught page errors').to.deep.eq([])
  })

  it('lists Original on the existing Plus card with its own source title', () => {
    cy.visit(originalUrl)
    waitForCalc('Vintage White')
    cy.get('#open-romhack-modal').click()
    cy.contains('.romhack-browser-game', 'Vintage White Plus').within(() => {
      cy.contains('a', 'Vintage White Plus').should('have.attr', 'href').and('include', 'data=vwplus')
      cy.contains('a', /^Original$/).should('have.attr', 'href').and('include', 'data=vw&')
    })
    cy.window().then(win => {
      expect(win.romhackSourceTitles.vw).to.eq('Vintage White')
      expect(win.romhackSourceTitles.vwplus).to.eq('Vintage White Plus')
      expect(win.romhackGameIndex['vintage-white-plus'].variants).to.have.length(2)
    })
    cy.get('.calc-select option').filter((_, option) => option.textContent === 'Vintage White Original')
      .should('have.attr', 'data-source').and('include', 'data=vw&')
    cy.screenshot('vintage-white-variants')
  })

  it('loads master data and trainer order with Gen 5 mechanics and no Dex', () => {
    cy.intercept('GET', '**/backups/vw.js*').as('originalData')
    cy.visit(originalUrl)
    cy.wait('@originalData').its('response.statusCode').should('be.oneOf', [200, 304])
    waitForCalc('Vintage White')
    cy.window().then(win => {
      const settings = win.eval('settings')
      expect(settings.gen).to.eq(8)
      expect(settings.damageGen).to.eq(5)
      expect(settings.typeChart).to.eq(5)
      expect(settings.critGen).to.eq(5)
      expect(settings.gameSwitchIn).to.eq(5)
      expect(settings.switchIn).to.eq(5)
      expect(settings.sourceType).to.eq('full')
      expect(win.eval('gameGen')).to.eq(5)
      expect(win.eval('save_expansion')).to.eq(false)
      expect(win.baseGame).to.eq('BW')
      expect(win.eval('baseVersion')).to.eq('BW')
      expect(win.eval('showDex')).to.eq(false)
      expect(Object.keys(win.backup_data.poks)).to.have.length(666)
      expect(Object.keys(win.backup_data.order)).to.have.length(391)
      expect(win.backup_data.order[1]).to.deep.eq({ id: 1, next: 2, prev: 64 })
    })
    cy.get('#main-nav-dex, #open-dex, #dex-show').should('not.be.visible')
    cy.get('#read-save').should('be.visible')
    cy.screenshot('vintage-white-original')
  })

  it('navigates forward and backward using the original trainer order', () => {
    cy.visit(originalUrl)
    waitForCalc('Vintage White')
    cy.window().then(win => {
      const option = win.getSetOptions().find(option => option.set && win.setdex[option.pokemon]?.[option.set]?.tr_id === 1)
      expect(option).to.exist
      win.$('input.opposing.set-selector').val(option.id).trigger('change')
    })
    cy.get('.nav-tag.next').first().should('be.visible').and('have.attr', 'data-next', '2').click()
    cy.window().should(win => {
      expect(win.get_current_in(false).tr_id).to.eq(2)
      expect(win.eval('changingSets')).to.eq(false)
    })
    cy.get('.nav-tag.prev').first().should('be.visible').and('have.attr', 'data-next', '1').click()
    cy.window().should(win => expect(win.get_current_in(false).tr_id).to.eq(1))
  })

  it('also resolves the original master-branch data alias locally', () => {
    cy.visit('./?data=da1eedc0e39ea07b75bf&gen=5&types=5&view=calculator')
    waitForCalc('Vintage White')
    cy.window().then(win => {
      expect(win.backup_data.order[2].next).to.eq(85)
      expect(win.eval('showDex')).to.eq(false)
    })
  })

  it('preserves the Plus title, data source, mechanics, and Dex access', () => {
    cy.visit('./?data=vwplus&view=calculator')
    waitForCalc('Vintage White Plus')
    cy.window().then(win => {
      const settings = win.eval('settings')
      expect(settings.damageGen).to.eq(5)
      expect(settings.typeChart).to.eq(5)
      expect(settings.gameSwitchIn).to.eq(5)
      expect(win.eval('showDex')).to.eq(true)
      expect(win.eval('getDexGameQuery()')).to.eq('game=vintagewhiteplus')
    })
    cy.get('#main-nav-dex').should('be.visible')
  })
})
