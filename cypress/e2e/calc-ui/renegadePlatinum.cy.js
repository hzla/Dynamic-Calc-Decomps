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
    cy.window().should(win => expect(win.pokedex && win.pokedex.Mew).to.be.an('object'))
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

  it('uses selected abilities, retained items and defender boosts after faint cleanup', () => {
    cy.visit('./index.html?data=renegadeplatinum&view=calculator')
    cy.get('#rom-title').should('have.text', 'Renegade Platinum')
    cy.window().should(win => expect(win.pokedex && win.pokedex.Mew).to.be.an('object'))
    cy.window().then((win) => {
      win.$('#p1 .set-selector, #p2 .set-selector').val('Mew (Blank Set)').trigger('change')
      win.$('#p1 .level, #p2 .level').val('50').trigger('change')
      win.$('#p1 .nature, #p2 .nature').val('Serious').trigger('change')
      win.$('#p1 .type1').val('Water')
      win.$('#p2 .type1').val('Normal')
      win.$('#p1 .type2, #p2 .type2').val('')
      win.$('#p1 .ability, #p2 .ability, #p1 .item, #p2 .item').val('')
      win.$('#clear').prop('checked', true)
      // A saved box ability must not overwrite the currently selected ability.
      win.eval('customSets.Mew = { "My Box": { ability: "Pressure" } }')
      win.SETDEX_BW.Mew = win.SETDEX_BW.Mew || {}
      const preview = move => {
        win.SETDEX_BW.Mew['Phase 2 damage audit'] = { level: 50, sub_index: 0,
          moves: [move, '(No Move)', '(No Move)', '(No Move)'] }
        win.CURRENT_TRAINER_POKS = ['Mew (Phase 2 damage audit)[0]']
        return win.get_next_in()[0][5]
      }
      win.$('#p1 .ability').val('Levitate')
      expect(preview('Earthquake'), 'selected Levitate').to.eq(0)
      win.$('#p1 .ability').val('')
      expect(preview('Earthquake'), 'selected ability changed').to.eq(46)
      win.$('#p2 .move1 .move-selector').val('Earthquake').trigger('change')
      win.$('#p2 .move1 .move-bp').val('999')
      win.$('#p2 .move1 .move-type').val('Fire')
      expect(preview('Earthquake'), 'move table data overrides active move edits').to.eq(46)
      win.$('#p1 .item').val('Chilan Berry')
      win.$('#p1 .itemToggle').prop('checked', true)
      expect(preview('Hyper Voice'), 'resist berries are ignored').to.eq(61)
      win.$('#p2 .ability').val('Slow Start')
      win.$('#p2 .abilityToggle').prop('checked', false)
      win.$('#p2 .item').val('Choice Band')
      win.$('#p2 .itemToggle').prop('checked', true)
      expect(win.createPokemon(win.$('#p2')).item).to.eq('Choice Band')
      win.$('#p2 .at .boost').val('6')
      win.$('#p1 .df .boost').val('1')
      expect(preview('Bite'), 'Slow Start resets, Choice Band stays, defending boost stays').to.eq(15)
    })
  })
})
