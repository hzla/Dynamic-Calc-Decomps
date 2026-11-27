describe('Published calcs', () => {
  const worker = 'https://calc-share.test'
  const id = 'ab'.repeat(16)
  const sets = {
    Pikachu: {
      'Lvl 5 Community Trainer': {
        level: 5, nature: 'Hardy', moves: ['Thunder Shock'], sub_index: 0, tr_id: 7,
      },
    },
  }
  const data = {
    title: 'Community Calc', formatted_sets: sets, poks: {}, moves: {},
    pokewebBattleRules: {
      version: 1, baseGame: 'BW2',
      names: { items: [[620, 'Fixture Vest']] },
      items: [[620, { effects: [{ kind: 'specialDefense', value: 1.5 }] }]],
      abilities: [], moves: [], moveData: [],
    },
  }
  const bridgeOrigin = 'https://ddex.example.invalid'
  const cors = { 'access-control-allow-origin': '*' }

  function expectCommunityTrainer() {
    cy.window({ timeout: 30000 }).should(win => {
      expect(win.setdex?.Pikachu?.['Lvl 5 Community Trainer']?.tr_id).to.eq(7)
    })
  }

  it('publishes bridged data only from the dev calc and reopens it with Pokeweb rules', () => {
    cy.intercept('**/shared_calc_config.mjs', {
      headers: { 'content-type': 'text/javascript' },
      body: `export const CALC_SHARE_ORIGIN = "${worker}";`,
    })
    cy.intercept('https://challenges.cloudflare.com/turnstile/**', {
      headers: { 'content-type': 'text/javascript' },
      body: 'window.turnstile = { render(_, options) { options.callback("test-token"); return "widget"; }, reset() {} };',
    })
    cy.intercept('GET', worker + '/config', { headers: cors, body: { siteKey: 'test-key' } })
    cy.intercept('OPTIONS', worker + '/calcs', {
      statusCode: 204,
      headers: { ...cors, 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'Content-Type,X-Turnstile-Token' },
    })
    cy.intercept('POST', worker + '/calcs', request => {
      expect(request.headers['x-turnstile-token']).to.eq('test-token')
      expect(typeof request.body === 'string' ? JSON.parse(request.body) : request.body).to.deep.eq(data)
      request.reply({ statusCode: 201, headers: cors, body: { id } })
    }).as('publish')
    cy.intercept('GET', worker + '/calcs/' + id, { headers: cors, body: data })

    cy.visit('/?data=null125&view=calculator')
    cy.get('#open-publish-calc').should('not.be.visible')
    cy.visit(`/?dev=1&view=calculator&ddexBridgeOrigin=${encodeURIComponent(bridgeOrigin)}`, {
      onBeforeLoad(win) { win.opener = win.parent },
    })
    cy.get('#open-publish-calc').should('not.be.visible')
    cy.window().then(win => {
      win.dispatchEvent(new win.MessageEvent('message', {
        origin: bridgeOrigin, source: win.opener,
        data: {
          type: 'ddex:calc-sync',
          config: { gen: 5, damageGen: 5, typeChart: 5, switchIn: 5, sourceType: 'full', baseGame: 'BW2' },
          backupData: { ...data, _meta: { raw: '<not published>' } },
        },
      }))
    })
    cy.get('#rom-title').should('have.text', 'Community Calc')
    expectCommunityTrainer()
    cy.window().then(win => {
      win.setdex.Pikachu['My Box'] = { level: 99, moves: ['Tackle'] }
    })
    cy.get('#open-publish-calc').click()
    cy.get('#publish-calc-name').should('have.text', 'Community Calc')
    cy.get('#publish-calc-submit').click()
    cy.wait('@publish')
    cy.get('#published-calc-link').invoke('val').then(href => {
      const url = new URL(href)
      expect(url.searchParams.get('share')).to.eq(id)
      expect(url.searchParams.get('dmgGen')).to.eq('5')
      expect(url.searchParams.has('data')).to.eq(false)
      expect(url.searchParams.has('dev')).to.eq(false)
      expect(url.searchParams.has('ddexBridgeOrigin')).to.eq(false)
      cy.visit(href)
    })
    cy.get('#rom-title').should('have.text', 'Community Calc')
    expectCommunityTrainer()
    cy.window().should(win => {
      expect(win.eval('settings.damageGen')).to.eq(5)
      expect(win.backup_data.pokewebBattleRules).to.deep.eq(data.pokewebBattleRules)
      expect(win.setdex.Pikachu).not.to.have.property('My Box')
    })
    cy.get('#open-publish-calc').should('not.be.visible')
  })

  it('continues to load unbundled npoint IDs', () => {
    cy.intercept('GET', 'https://api.npoint.io/community-test-id', { headers: cors, body: sets })
    cy.visit('/?data=community-test-id&view=calculator')
    expectCommunityTrainer()
  })
})
