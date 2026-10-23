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
})
