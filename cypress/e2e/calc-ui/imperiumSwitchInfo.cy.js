describe('Emerald Imperium Advanced Switch Info', () => {
  for (const [slug, evs] of [['imp13', 0], ['imp13', 1], ['imp_1-3', 0]]) {
    it(`persists and renders info on an iPad-sized viewport (${slug}, EVs ${evs})`, () => {
      cy.clearLocalStorage()
      cy.viewport(1024, 768)
      cy.visit(`./index.html?data=${slug}&dmgGen=8&gen=8&types=6&noSwitch=1&evs=${evs}`, {
        onBeforeLoad(win) {
          win.localStorage.switchInfo = '1'
          win.localStorage.alerted = '1'
        },
      })
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.TITLE).to.eq('Emerald Imperium 1.3')
        expect(win.setdex?.Parasect).to.exist
        expect(win.memoizedCalc).to.be.a('function')
        expect(win.eval('initializing')).to.eq(false)
        expect(win.eval('changingSets')).to.eq(false)
        expect(win.localStorage.switchInfo).to.eq('1')
      })
      cy.get('#open-menu').click()
      cy.get('#toggle-switch-info input').should('be.checked')
      cy.get('#toggle-switch-info .slider').click()
      cy.window().then(win => {
        expect(win.localStorage.switchInfo).to.eq('0')
        win.switchInfoPageMarker = true
        win.setdex.Simisage['My Box'] = {
          level: 56, ability: 'Gluttony', nature: 'Timid', item: 'Sitrus Berry',
          moves: ['Seed Bomb', 'Play Nice', 'Leaf Storm', 'Leech Seed'],
        }
        win.localStorage.customsets = JSON.stringify({ Simisage: { 'My Box': win.setdex.Simisage['My Box'] } })
        win.$('.player.set-selector').val('Simisage (My Box)')
        win.$('input.player.set-selector').trigger('change')
        win.$('#p1 .select2-chosen').first().text('Simisage (My Box)')
      })
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
      cy.window().then(win => {
        const [label] = Object.entries(win.setdex.Parasect).find(([name]) => name.includes('School Kid Ted'))
        win.setOpposing(`Parasect (${label})`)
      })
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
      cy.get('#toggle-switch-info .slider').click()
      cy.get('#toggle-switch-info input').should('be.checked')
      cy.window().then(win => {
        expect(win.switchInfoPageMarker).to.eq(true)
        expect(win.localStorage.switchInfo).to.eq('1')
      })
      cy.get('.opposing.trainer-pok-list').should('have.class', 'ai-show')
      cy.get('.opposing.trainer-pok-list .ai-infos').should('have.length.greaterThan', 0).first().should('be.visible')
      cy.get('#open-menu').click()
      cy.reload()
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.memoizedCalc).to.be.a('function')
        expect(win.eval('initializing')).to.eq(false)
        expect(win.eval('changingSets')).to.eq(false)
        expect(win.localStorage.switchInfo).to.eq('1')
      })
      cy.get('#open-menu').click()
      cy.get('#toggle-switch-info input').should('be.checked')
    })
  }
})
