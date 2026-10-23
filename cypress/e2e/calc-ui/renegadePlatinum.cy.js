describe('Renegade Platinum Gen 4 switch preview', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
  })

  it('uses Renegade Platinum type-chart ordering for Phase 1 immunity flags', () => {
    cy.visit('./index.html?data=renegadeplatinum&view=calculator')

    cy.window().then((win) => {
      const vanilla = win.getGen4Phase1FlagOrderExceptions('Platinum')
      const renegade = win.getGen4Phase1FlagOrderExceptions('Renegade Platinum')

      expect(vanilla.Electric).to.include('Gliscor')
      expect(renegade.Electric).not.to.include('Gliscor')
      expect(renegade.Electric).not.to.include('Gligar')
      expect(renegade.Electric).to.include('Gastrodon')
      expect(renegade.Electric).to.include('Quagsire')
      expect(renegade.Ground).to.include('Crobat')
      expect(renegade.Ground).to.include('Zapdos')
    })
  })

  it('scores Flint6 Eruption at table power against the reported Garchomp', () => {
    cy.visit('./index.html?data=renegadeplatinum&view=calculator', {
      onBeforeLoad(win) {
        win.localStorage.setItem('customsets', JSON.stringify({
          Garchomp: { 'My Box': {
            ability: 'Rough Skin', level: 78, nature: 'Jolly', item: 'Yache Berry',
            ivs: { hp: 29, at: 29, df: 29, sa: 29, sd: 29, sp: 29 },
            moves: ['Earthquake', 'Outrage', 'Stone Edge', 'Swords Dance'],
            status: 'Healthy', isCustomSet: true
          } }
        }))
        win.localStorage.setItem('left', 'Garchomp (My Box)')
        win.localStorage.setItem('right', 'Torkoal (Lvl 73 Elite Four Flint6 )')
      }
    })
    cy.get('#rom-title').should('have.text', 'Renegade Platinum')
    cy.window().then((win) => {
      const rankings = win.get_next_in()
      const typhlosion = rankings.find(row => row[0].startsWith('Typhlosion '))
      expect(typhlosion[6]).to.eq('Eruption')
      expect(typhlosion[5]).to.eq(99)
      expect(rankings[0]).to.eq(typhlosion)
      expect(win.eval('calcingForSwitchIns')).to.eq(false)
    })
  })

  it('scores conditional moves once at table power without halving slower attackers', () => {
    cy.visit('./index.html?data=renegadeplatinum&view=calculator')
    cy.get('#rom-title').should('have.text', 'Renegade Platinum')
    cy.window().then((win) => {
      win.$('#p1 .set-selector, #p2 .set-selector').val('Mew (Blank Set)').trigger('change')
      win.$('#p1 .level, #p2 .level').val('50').trigger('change')
      win.$('#p1 .nature, #p2 .nature').val('Serious').trigger('change')
      win.$('#p1 .ability, #p2 .ability, #p1 .item, #p2 .item').val('')
      win.$('#p1 .type1').val('Water')
      win.$('#p2 .type1').val('Normal')
      win.$('#p1 .type2, #p2 .type2').val('')
      win.$('#p2 .sp .base').val('40').trigger('change')
      win.$('#p2 .move-crit').prop('checked', true)
      win.$('#clear').prop('checked', true)

      const cases = [
        ['Payback', 24], ['Avalanche', 14],
        // Renegade's table has 60 BP Assurance, rather than vanilla's 50.
        ['Assurance', 28], ['Triple Kick', 6], ['Beat Up', 6]
      ]
      win.SETDEX_BW.Mew = win.SETDEX_BW.Mew || {}
      win.CURRENT_TRAINER_POKS = cases.map(([move], index) => {
        const name = `Phase 2 audit ${index}`
        win.SETDEX_BW.Mew[name] = { level: 50, sub_index: index,
          moves: [move, 'Splash', 'Splash', 'Splash'] }
        return `Mew (${name})[${index}]`
      })
      const rankings = win.get_next_in()
      cases.forEach(([move, score]) => {
        const row = rankings.find(row => row[4][0] === move)
        expect(row[1], `${move} reaches phase 2`).to.eq(0)
        expect(row[6], `${move} best move`).to.eq(move)
        expect(row[5], `${move} score`).to.eq(score)
      })
    })
  })
})
