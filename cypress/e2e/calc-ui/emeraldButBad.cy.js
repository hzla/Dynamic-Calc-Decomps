describe('Emerald but Bad calc configuration', () => {
  const calcUrl = './index.html?data=badem&dmgGen=3&gen=3&switchIn=3&types=3&view=calculator'

  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit(calcUrl)
  })

  it('loads as a vanilla Gen 3 Emerald profile with Dex enabled', () => {
    cy.get('#rom-title').should('have.text', 'Emerald but Bad')
    cy.window().its('backup_data.title').should('eq', 'Emerald but Bad')

    cy.window().then((win) => {
      const runtimeSettings = win.eval('settings')

      expect(runtimeSettings.gen).to.eq(3)
      expect(runtimeSettings.damageGen).to.eq(3)
      expect(runtimeSettings.gameSwitchIn).to.eq(3)
      expect(runtimeSettings.switchIn).to.eq(3)
      expect(runtimeSettings.typeChart).to.eq(3)
      expect(runtimeSettings.critGen).to.eq(5)
      expect(runtimeSettings.sourceType).to.eq('full')
      expect(runtimeSettings.physSpecSplit).to.eq(false)
      expect(win.eval('mechanics')).to.eq('vanilla')

      expect(win.baseGame).to.eq('g3')
      expect(win.$('#read-save').attr('for')).to.eq('save-upload')

      expect(win.$('#main-nav-dex').is(':visible')).to.eq(true)
      expect(win.$('#dex-show').is(':visible')).to.eq(true)
      expect(win.eval('getDexGameIdForTitle("Emerald but Bad")')).to.eq('badem')

      expect(win.$('.main-view-tab[data-view="fragsheet"]').is(':visible')).to.eq(false)
      expect(win.$('#main-nav-battle-log').is(':visible')).to.eq(false)
      expect(win.$('#show-ai').is(':visible')).to.eq(false)
    })
  })

  it('falls back to the calculator when the Fragsheet view is requested', () => {
    cy.visit(calcUrl.replace('view=calculator', 'view=fragsheet'))
    cy.get('#rom-title').should('have.text', 'Emerald but Bad')
    cy.window().its('backup_data.title').should('eq', 'Emerald but Bad')
    cy.window().invoke('getCurrentMainPageView').should('eq', 'calculator')
  })

  it('preserves manual badge boosts between trainers and clears them on reload', () => {
    const badgeBoosts = ['#AtkL', '#SpeL', '#DefL', '#SpecL']
    let trainerSets

    cy.get('#rom-title').should('have.text', 'Emerald but Bad')
    cy.window({ timeout: 30000 }).should((win) => {
      expect(Object.keys(win.pokedex || {})).to.have.length.greaterThan(0)
      expect(Object.keys(win.setdex || {})).to.have.length.greaterThan(0)
      expect(win.eval('initializing')).to.eq(false)
      expect(win.eval('changingSets')).to.eq(false)
    }).then((win) => {
      const trainers = new Map()
      for (const option of win.getSetOptions()) {
        if (!option.set || option.set === 'Blank Set' || option.isCustom) continue
        const set = win.setdex[option.pokemon][option.set]
        if (set.partner) continue
        trainers.set(win.stripTrainerLevelPrefix(option.set), option.id)
        if (trainers.size === 2) break
      }
      trainerSets = [...trainers.values()]
      expect(trainerSets).to.have.length(2)
      win.$('input.opposing.set-selector').val(trainerSets[0]).change()
    })

    cy.window().should((win) => {
      expect(win.eval('changingSets')).to.eq(false)
    }).then((win) => {
      badgeBoosts.forEach((selector) => win.$(selector).prop('checked', true))
      win.$('#reflectL').prop('checked', true)
      win.$('input.opposing.set-selector').val(trainerSets[1]).change()
    })

    badgeBoosts.forEach((selector) => cy.get(selector).should('be.checked'))
    cy.get('#reflectL').should('not.be.checked')

    cy.window().should((win) => {
      expect(win.eval('changingSets')).to.eq(false)
    }).then((win) => {
      win.$('#SpeL, #DefL').prop('checked', false)
      win.$('input.opposing.set-selector').val(trainerSets[0]).change()
    })

    cy.get('#AtkL').should('be.checked')
    cy.get('#SpecL').should('be.checked')
    cy.get('#SpeL').should('not.be.checked')
    cy.get('#DefL').should('not.be.checked')

    cy.reload()
    cy.get('#rom-title').should('have.text', 'Emerald but Bad')
    cy.window().should((win) => expect(win.eval('initializing')).to.eq(false))
    badgeBoosts.forEach((selector) => cy.get(selector).should('not.be.checked'))
  })

  it('uses indexed HP Water when choosing Jeffrey\'s post-KO switch against Gligar', () => {
    const trainer = 'Lvl 60 Bug Maniac Jeffrey - Route 120'
    const dustox = `Dustox (${trainer})`
    const volbeat = `Volbeat (${trainer})`

    cy.window({ timeout: 30000 }).should((win) => {
      expect(win.setdex && win.setdex.Dustox).to.have.property(trainer)
      expect(Object.keys(win.pokedex || {})).to.have.length.greaterThan(0)
      expect(win.eval('initializing')).to.eq(false)
      expect(win.eval('changingSets')).to.eq(false)
    }).then((win) => {
      // EXP display data does not participate in switch scoring.
      win.expYields = win.expYields || {}
      win.updateDex({ Gligar: { 'My Box': {
        level: 65, ability: 'Hyper Cutter', nature: 'Careful', item: 'Leftovers',
        ivs: { hp: 8, at: 26, df: 14, sa: 9, sd: 17, sp: 4 },
        moves: ['Rock Slide', 'Steel Wing', 'Aerial Ace', 'Earthquake'],
        isCustomSet: true
      } } })
      win.$('input.player.set-selector').val('Gligar (My Box)').change()
      win.$('.player .select2-chosen').text('Gligar (My Box)')
    })

    cy.get('#levelL1').should('have.value', '65')
    cy.window().should((win) => expect(win.eval('changingSets')).to.eq(false)).then((win) => {
      win.$('input.opposing.set-selector').val(dustox).change()
      win.$('.opposing .select2-chosen').text(dustox)
      win.$('#gen3-switch-guide .last-move-used select.move-selector').val('Rock Slide')
    })

    cy.window().then((win) => {
      const ranked = win.get_next_in_g3()
      const available = ranked.filter((entry) => !entry.gen3Switch.isUnavailable)
      expect(available[0][0].split('[')[0]).to.eq(volbeat)
      expect(available[0][5]).to.include('HP Water')

      win.fainted.push(volbeat)
      const afterVolbeat = win.get_next_in_g3().filter((entry) => !entry.gen3Switch.isUnavailable)
      expect(afterVolbeat[0][0].split(' (')[0]).to.eq('Heracross')
    })
  })
})
