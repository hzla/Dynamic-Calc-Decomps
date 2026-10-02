describe('Heart & Soul 2.0.6', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('./index.html?data=heartandsoul&gen=8&dmgGen=8&types=6&critGen=5&noSwitch=1')
    cy.window().its('backup_data.title').should('eq', 'Heart & Soul 2.0.6')
  })

  it('loads source data and shows random trainer gender without selecting a fixed gender', () => {
    cy.window().then((win) => {
      const settings = win.eval('settings')
      expect(settings.sourceType).to.eq('full')
      expect(settings.damageGen).to.eq(8)
      expect(win.eval('gameGen')).to.eq(8)
      expect(settings.critGen).to.eq(5)
      expect(win.baseGame).to.eq('heartandsoul')
      const set = Object.keys(win.setdex.Clefairy).find((name) => name.includes('Whitney'))
      win.$('#p2 .set-selector').val(`Clefairy (${set})`).trigger('change')
      expect(win.$('#p2 .gender').val()).to.eq('Random')
      expect(win.getGender('Random')).to.eq('N')
      expect(win.MOVES_BY_ID[8].surf.target).to.eq('allAdjacent')
    })
  })

  it('persists the split toggle and changes damage categories while retaining Gen 7–9 mechanics', () => {
    let physicalDamage
    const thunderPunchDamage = (win, category) => {
      const move = new win.calc.Move(8, 'Thunder Punch')
      expect(move.category).to.eq(category)
      expect(new win.calc.Move(8, 'Thunder Wave').category).to.eq('Status')
      expect(win.eval('gameGen')).to.eq(8)
      expect(win.eval('settings').damageGen).to.eq(8)
      return win.calc.calculate(8,
        new win.calc.Pokemon(8, 'Alakazam', { level: 50, ability: 'None' }),
        new win.calc.Pokemon(8, 'Mew', { level: 50, ability: 'None' }),
        move).range()[1]
    }
    cy.window().then((win) => {
      expect(win.eval('settings').physSpecSplit).to.eq(true)
      physicalDamage = thunderPunchDamage(win, 'Physical')
    })
    cy.get('#open-menu').click()
    cy.get('#toggle-phys-spec-split').should('be.visible')
      .find('input').should('be.checked')
    cy.get('#toggle-phys-spec-split .slider').click()
    cy.window().should((win) => expect(win.eval('settings').physSpecSplit).to.eq(false))
    cy.window().then((win) => {
      expect(thunderPunchDamage(win, 'Special')).to.be.greaterThan(physicalDamage)
    })
    cy.reload()
    cy.window().should((win) => expect(win.eval('settings').physSpecSplit).to.eq(false))
    cy.get('#open-menu').click()
    cy.get('#toggle-phys-spec-split input').should('not.be.checked')
    cy.get('#toggle-phys-spec-split .slider').click()
    cy.window().should((win) => expect(win.eval('settings').physSpecSplit).to.eq(true))
    cy.window().then((win) => {
      expect(thunderPunchDamage(win, 'Physical')).to.eq(physicalDamage)
    })
  })

  it('imports the sample party, Box 1 and death box through the save upload control', () => {
    cy.get('#read-save').should('have.attr', 'for', 'save-upload')
    cy.get('#save-upload').selectFile('cypress/fixtures/saves/heartandsoul206.sav', { force: true })
    cy.window().its('lastHeartAndSoulSave.party').should('have.length', 6)
    cy.window().its('lastHeartAndSoulSave.boxes.0.mons').should('have.length', 25)
    cy.window().its('lastHeartAndSoulSave.deadMons').should('have.length', 2)
    cy.window().then((win) => {
      expect(win.lastHeartAndSoulSave.warnings).to.deep.eq([])
      expect(win.lastHeartAndSoulSave.party[2].ability).to.eq('Dry Skin')
      const imported = JSON.parse(win.localStorage.customsets)
      expect(Object.values(imported).filter((sets) => sets['My Box'])).to.have.length(31)
      expect(imported.Gastly['My Box'].nn).to.eq('Gaster')
      expect(imported.Paras['My Box'].ability).to.eq('Dry Skin')
      expect(JSON.parse(win.localStorage.deadMons).map((mon) => mon.speciesName)).to.deep.eq(['Zubat', 'Mareep'])
    })
    cy.get('#p1 .set-selector').should('exist')
  })
})

describe('Heart & Soul Difficult Teams', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('./index.html?data=heartandsouldifficult&gen=8&dmgGen=8&types=6&critGen=5&noSwitch=1')
    cy.window().its('backup_data.title').should('eq', 'Heart & Soul Difficult Teams')
  })

  it('loads the fork Pokémon, teams and starting field conditions', () => {
    cy.window().then((win) => {
      expect(win.eval('TITLE')).to.eq('Heart & Soul Difficult Teams')
      expect(win.eval('gameGen')).to.eq(8)
      expect(win.eval('settings').physSpecSplit).to.eq(true)
      expect(win.baseGame).to.eq('heartandsoul')
      expect(win.pokedex.Pidgey.bs.sp).to.eq(60)
      expect(Object.values(win.pokedex.Pidgey.abilities)).to.include('No Guard')
      expect(win.pokedex.Typhlosion.types).to.deep.eq(['Fire', 'Ground'])
      const selectTrainer = (species, id) => {
        const name = Object.keys(win.setdex[species]).find((name) => win.setdex[species][name].tr_id === id)
        expect(name).to.be.a('string')
        win.$('#p2 .set-selector').val(`${species} (${name})`).trigger('change')
      }
      selectTrainer('Skarmory', 414)
      expect(win.$('#rain').prop('checked')).to.eq(true)
      selectTrainer('Electrode', 426)
      expect(win.$('#electric').prop('checked')).to.eq(true)
      selectTrainer('Noctowl', 403)
      expect(win.$('#tailwindR').prop('checked')).to.eq(true)
      expect(win.$('#electric').prop('checked')).to.eq(false)
      selectTrainer('Forretress', 439)
      expect(win.$('#tailwindR').prop('checked')).to.eq(false)
      expect(win.$('#ai-tags').text()).to.include('2 Toxic Spikes layers on player side')
    })
    cy.get('#open-menu').click()
    cy.get('#toggle-phys-spec-split').should('be.visible')
  })

  it('uses the variant save constants when uploading the example save', () => {
    cy.get('#save-upload').selectFile('cypress/fixtures/saves/heartandsoul206.sav', { force: true })
    cy.window().its('lastHeartAndSoulSave.detectedGame').should('eq', 'Heart & Soul Difficult Teams')
    cy.window().then((win) => {
      expect(win.lastHeartAndSoulSave.party).to.have.length(6)
      expect(win.lastHeartAndSoulSave.boxes[0].mons).to.have.length(25)
      expect(win.lastHeartAndSoulSave.warnings).to.deep.eq([])
      expect(JSON.parse(win.localStorage.customsets).Gastly['My Box'].nn).to.eq('Gaster')
    })
  })
})
