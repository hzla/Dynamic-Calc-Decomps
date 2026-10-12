const ddexConfig = {
  gen: 8, damageGen: 4, typeChart: 4, critGen: 3, switchIn: 4,
  gameSwitchIn: 4, sourceType: 'full', baseGame: '', mechanics: 'vanilla',
  customPoks: true, readIncludes: false, saveExpansion: false,
}
const romData = {
  title: 'DDEX Gen 4 layout regression',
  poks: {}, moves: {}, custom_moves: {}, order: {}, trainers: {},
  formatted_sets: {
    Hitmonlee: {
      'Lvl 41 Black Belt Kenji': {
        level: 41, nature: 'Lonely', ability: 'Unburden',
        moves: ['Rock Slide', 'High Jump Kick', 'Shadow Sneak', 'Double-Edge'],
        ivs: { hp: 31, at: 31, df: 31, sa: 31, sd: 31, sp: 31 },
        evs: { hp: 0, at: 0, df: 0, sa: 0, sd: 0, sp: 0 },
        ai: 7, tr_id: 605, sub_index: 0,
      },
    },
  },
}

describe('DDEX synced calculator layout', () => {
  it('keeps synced Gen 4 panels within the viewport', () => {
    const bridgeOrigin = 'https://ddex-chi.vercel.app'
    cy.visit(`./index.html?dev=1&forceBlankConfig=1&gen=8&dmgGen=4&types=4&critGen=3&switchIn=4&mechanics=vanilla&readIncludes=0&saveExpansion=0&ddexBridgeOrigin=${encodeURIComponent(bridgeOrigin)}&view=calculator`, {
      onBeforeLoad(win) {
        win.opener = win.parent
        win.localStorage.clear()
        win.localStorage.right = 'Hitmonlee (Lvl 41 Black Belt Kenji)'
        win.localStorage.showAdditionalFieldOptions = '1'
        win.localStorage.setItem('calcCustomOpponentTeams:__blank_dev_calc__:only', '1')
      },
    })
    cy.window().should(win => {
      expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
      expect(win.eval('initializing')).to.eq(false)
    })
    cy.get('#custom-opponent-teams-filter').should('be.visible')
    cy.get('#custom-opponent-teams-only').should('be.checked')
    cy.window().then(win => {
      win.dispatchEvent(new win.MessageEvent('message', {
        origin: bridgeOrigin,
        source: win.opener,
        data: {
          type: 'ddex:calc-sync', config: ddexConfig,
          backupData: romData, fileName: 'ddex-gen4.js',
        },
      }))
    })
    cy.get('#rom-title').should('have.text', romData.title)
    cy.window().should(win => expect(win.eval('initializing')).to.eq(false))
    cy.get('#ai-tags').should('be.visible')
    cy.get('#ai1, #ai2, #ai3').should('be.visible')
    cy.get('#custom-opponent-teams-filter').should('not.be.visible')
    cy.window().then(win => {
      expect(win.customOpponentTeams.showCustomTeamsOnly()).to.eq(false)
      let options
      win.$('#p2 input.set-selector').data('select2').opts.query({
        term: 'Black Belt Kenji', page: 1, callback(data) { options = data.results },
      })
      expect(options.some(option => option.id === 'Hitmonlee (Lvl 41 Black Belt Kenji)')).to.eq(true)
    })
    cy.get('#levelR1').should('have.value', '41')
    for (const width of [1920, 1600, 1540, 1440, 1280, 390]) {
      cy.viewport(width, 1080)
      cy.window().should(win => {
        const panel = win.document.querySelector('#p2').getBoundingClientRect()
        const selectors = win.document.querySelector('#p2 .info-selectors').getBoundingClientRect()
        expect(panel.right, `opponent panel at ${width}px`).to.be.at.most(width)
        expect(selectors.left, `opponent controls at ${width}px`).to.be.at.least(panel.left)
        expect(selectors.right, `opponent controls at ${width}px`).to.be.at.most(panel.right)
      })
    }
    cy.viewport(1920, 1080)
    cy.reload()
    cy.get('#rom-title').should('have.text', romData.title)
    cy.get('#ai-tags').should('be.visible')
    cy.window().should(win => {
      const tags = win.document.querySelector('#ai-tags').getBoundingClientRect()
      const panel = win.document.querySelector('#p2').getBoundingClientRect()
      const selector = win.document.querySelector('#p2 .select2-container.set-selector .select2-choice').getBoundingClientRect()
      const save = win.document.querySelector('#save-pok').getBoundingClientRect()
      const info = win.document.querySelector('#p2 .info-group.top').getBoundingClientRect()
      expect(tags.top, 'AI tags beneath the opponent selector').to.be.at.least(selector.bottom)
      expect(tags.top, 'AI tags aligned with the player buttons').to.be.closeTo(save.top, 1)
      expect(tags.bottom, 'AI tags above the opponent info').to.be.at.most(info.top)
      expect(tags.left).to.be.at.least(panel.left)
      expect(tags.right).to.be.at.most(panel.right)
      expect(panel.right).to.be.at.most(1920)
    })
    cy.get('#custom-opponent-teams-filter').should('not.be.visible')
    cy.window().then(win => win.devDataOverrides.clearStoredOverrideRecord())
    cy.reload()
    cy.get('#rom-title').should('have.text', 'Blank Slate Dev Calc')
    cy.get('#custom-opponent-teams-filter').should('be.visible')
    cy.get('#custom-opponent-teams-only').should('be.checked')
  })
})
