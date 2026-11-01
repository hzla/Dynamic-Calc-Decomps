const partySpecies = ['Charizard', 'Pikachu', 'Blastoise']
const toggle = '#toggle-party-data'
const dataRows = '.player-party .bp-info'
const savedKeys = ['showPartyData', 'mobileShowPartyMoves']

function waitForParty() {
  cy.window().should(win => {
    expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
    expect(win.eval('initializing')).to.eq(false)
    expect(win.$('input.player').data('select2')).to.be.an('object')
  })
  cy.get('.player-party .trainer-pok').should('have.length', partySpecies.length)
  cy.get(dataRows).should('have.length', partySpecies.length * 6)
}

function visitWithParty(preferences = {}, dualPanel = true) {
  cy.visit('/index.html?dev=1&gen=8&dmgGen=8', {
    onBeforeLoad(win) {
      win.localStorage.clear()
      const customsets = Object.fromEntries(partySpecies.map((species, index) => [species, {
        'My Box': {
          level: 50, nature: 'Hardy', item: 'Leftovers', isCustomSet: true,
          ability: ['Blaze', 'Static', 'Torrent'][index],
          moves: ['Tackle', 'Protect', 'Growl', 'Tail Whip'],
        },
      }]))
      win.localStorage.customsets = JSON.stringify(customsets)
      win.localStorage.currentParty = partySpecies.join(',')
      win.localStorage.left = 'Charizard (My Box)'
      win.localStorage.enableAnalytics = '0'
      win.localStorage.mobileDualPanelLayout = dualPanel ? '1' : '0'
      win.localStorage.mobileCalcSidePanel = 'p1'
      Object.entries(preferences).forEach(([key, value]) => win.localStorage.setItem(key, value))
    },
  })
  waitForParty()
}

function expectPartyData(shown, previewVisible = true) {
  cy.get(`${toggle} input`).should(shown ? 'be.checked' : 'not.be.checked')
  cy.get(dataRows).each($row => cy.wrap($row).should('have.css', 'display', shown ? 'block' : 'none'))
  cy.get('.player-party .trainer-pok, .player-party .trainer-pok-item').each($image => {
    cy.wrap($image).should(previewVisible ? 'be.visible' : 'not.be.visible')
  })
  cy.window().then(win => {
    expect(win.localStorage.showPartyData).to.eq(shown ? '1' : '0')
    expect(win.localStorage.currentParty).to.eq(partySpecies.join(','))
    expect(JSON.parse(win.localStorage.customsets).Charizard['My Box'].moves)
      .to.deep.eq(['Tackle', 'Protect', 'Growl', 'Tail Whip'])
  })
}

function clickToggle() {
  cy.get(toggle).scrollIntoView().find('.slider').click()
}

describe('Show Party Data display setting', () => {
  let pageErrors

  beforeEach(() => {
    pageErrors = []
    cy.on('window:before:load', win => {
      win.addEventListener('error', event => {
        // The original page also emits opaque cross-origin errors under Cypress.
        if (event.message === 'Script error.' && !event.filename && !event.error) return
        pageErrors.push(event.message)
      })
    })
  })

  afterEach(() => {
    expect(pageErrors, 'uncaught page errors').to.deep.eq([])
  })

  const layouts = [
    { width: 1920, height: 1080 },
    { width: 1024, height: 900 },
    { width: 960, height: 900 },
    { width: 780, height: 1000 },
    { width: 390, height: 844 },
    { width: 390, height: 844, dualPanel: false },
  ]

  for (const { width, height, dualPanel = true } of layouts) {
    it(`toggles all party data repeatedly and persists both states at ${width}px (${dualPanel ? 'dual' : 'single'} panel)`, () => {
      cy.viewport(width, height)
      visitWithParty({}, dualPanel)
      const previewVisible = dualPanel || width > 960
      expectPartyData(true, previewVisible)
      cy.get('.player-party .nature-info').first().should('have.text', 'Hardy')
      cy.get('.player-party .extra-info').first().should('have.text', 'Blaze')
      cy.get('#open-menu').click()
      cy.get(toggle).should('have.length', 1).find('.menu-label').should('contain.text', 'Show Party Data')
      cy.get(toggle).prevAll('.menu-section-header').first().should('have.text', 'UI/Display')
      cy.get('#toggle-mobile-party-moves').should('not.exist')

      for (let repeat = 0; repeat < 2; repeat++) {
        clickToggle()
        expectPartyData(false, previewVisible)
        clickToggle()
        expectPartyData(true, previewVisible)
      }

      clickToggle()
      if (previewVisible) cy.get('.player-party').screenshot(`party-data-off-${width}-dual`)
      cy.reload()
      waitForParty()
      expectPartyData(false, previewVisible)
      cy.get('#open-menu').click()
      clickToggle()
      cy.reload()
      waitForParty()
      expectPartyData(true, previewVisible)
      if (!previewVisible) {
        // Single-panel mode already hides the inline party. Its saved data choice
        // must also apply when the user reveals it by enabling dual-panel mode.
        cy.get('#open-menu').click()
        cy.get('#toggle-mobile-dual-panel').scrollIntoView().find('.slider').click()
        expectPartyData(true)
      }
      cy.get('.player-party').screenshot(`party-data-on-${width}-${dualPanel ? 'dual' : 'single-to-dual'}`)
    })
  }

  for (const width of [1920, 390]) {
    for (const legacy of ['0', '1']) {
      it(`migrates the saved ${legacy === '1' ? 'ON' : 'OFF'} mobile preference at ${width}px`, () => {
        cy.viewport(width, 1080)
        visitWithParty({ mobileShowPartyMoves: legacy })
        expectPartyData(legacy === '1')
        cy.get('#open-menu').click()
        clickToggle()
        cy.reload()
        waitForParty()
        expectPartyData(legacy !== '1')
        cy.window().then(win => expect(win.localStorage.mobileShowPartyMoves).to.eq(legacy))
      })
    }
  }

  for (const value of ['0', '1']) {
    it(`keeps a saved Show Party Data ${value === '1' ? 'ON' : 'OFF'} choice over the old mobile setting`, () => {
      cy.viewport(1920, 1080)
      visitWithParty({ showPartyData: value, mobileShowPartyMoves: value === '1' ? '0' : '1' })
      expectPartyData(value === '1')
      cy.reload()
      waitForParty()
      expectPartyData(value === '1')
    })
  }

  it('keeps the preference when resizing and rebuilding party cards without changing another preview', () => {
    cy.viewport(1920, 1080)
    visitWithParty()
    // Another preview uses the same data row classes but is outside the player party.
    cy.window().then(win => {
      const html = win.generateCompactPreviewHTML({
        setData: JSON.parse(win.localStorage.customsets).Charizard['My Box'],
        speciesName: 'Charizard', dataId: 'Charizard (Other Preview)',
        containerSelector: '.tag-partner-preview',
      })
      win.$('.tag-partner-preview').html(html)
      win.$('.tag-partner-preview-wrapper').show()
    })
    cy.get('#open-menu').click()
    clickToggle()
    expectPartyData(false)
    cy.get('.tag-partner-preview .bp-info').each($row => cy.wrap($row).should('have.css', 'display', 'block'))
    cy.viewport(390, 844)
    expectPartyData(false)
    cy.window().then(win => win.displayParty())
    expectPartyData(false)
    clickToggle()
    expectPartyData(true)
    cy.viewport(1920, 1080)
    expectPartyData(true)
    cy.window().then(win => {
      savedKeys.forEach(key => expect(win.localStorage.getItem(key)).to.eq(key === 'showPartyData' ? '1' : null))
    })
  })
})
