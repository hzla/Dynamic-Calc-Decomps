describe('Emerald but Bad calc configuration', () => {
  const calcUrl = './index.html?data=badem&dmgGen=3&gen=3&switchIn=3&types=3&view=calculator'

  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit(calcUrl)
  })

  it('doubles Pursuit against the reported Tangela when Switching Out is checked', () => {
    const trainer = 'Lvl 68 Team Aqua Grunt 20 - Aqua Hideout'
    cy.window({ timeout: 30000 }).should((win) => {
      expect(win.setdex && win.setdex.Sharpedo).to.have.property(trainer)
      expect(win.eval('initializing')).to.eq(false)
    }).then((win) => {
      win.expYields = win.expYields || {}
      win.updateDex({ Tangela: { 'My Box': {
        level: 68, ability: 'Chlorophyll', nature: 'Brave', item: 'Leftovers',
        ivs: { hp: 31, at: 22, df: 1, sa: 12, sd: 3, sp: 9 },
        moves: ['Leech Seed', 'Giga Drain', 'Toxic', 'Ancient Power'], isCustomSet: true
      } } })
      win.$('#p1 .set-selector').val('Tangela (My Box)').trigger('change')
    })
    cy.window().should((win) => expect(win.eval('changingSets')).to.eq(false)).then((win) => {
      win.$('#p2 .set-selector').val(`Sharpedo (${trainer})`).trigger('change')
    })
    cy.get('#resultDamageR3').should('contain', '25.3 - 29.8%')
    cy.get('#switchingL').check({ force: true })
    cy.get('#resultDamageR3').should('contain', '50.6 - 59.7%')
    cy.window().then((win) => {
      expect(win.createField().clone().swap().defenderSide.isSwitching).to.eq(true)
      expect(win.damageResults[1][2].range()).to.deep.eq([122, 144])
      expect(win.damageResults[1][2].rawDesc.isSwitching).to.eq('out')
    })
    cy.get('#switchingL').uncheck({ force: true })
    cy.get('#switchingR').check({ force: true })
    cy.get('#resultDamageR3').should('contain', '25.3 - 29.8%')
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

  it('loads the 1.0.8 move changes and trainer natures into the calculator', () => {
    cy.window().its('backup_data.title').should('eq', 'Emerald but Bad')
    cy.window().should((win) => {
      expect(win.eval('initializing')).to.eq(false)
      expect(win.MOVES_BY_ID[3].facade.basePower).to.eq(70)
    }).then((win) => {
      const movePowers = {
        Facade: 70,
        'Wing Attack': 80,
        'Poison Fang': 80,
        'Drill Run': 95,
        'Crush Claw': 130,
        'Double-Edge': 130,
        'Ancient Power': 75,
        'Silver Wind': 75,
        Octazooka: 90
      }
      Object.entries(movePowers).forEach(([name, power]) => {
        expect(win.MOVES_BY_ID[3][win.cleanString(name)].basePower, name).to.eq(power)
      })
      expect(win.MOVES_BY_ID[3].facade.pp).to.eq(2)
      expect(win.MOVES_BY_ID[3].hyperbeam.accuracy).to.eq(100)
      expect(win.MOVES_BY_ID[3].hyperbeam.recoil).to.deep.eq([33, 100])
      expect(win.pokedex.Chansey.bs.at).to.eq(75)
      expect(win.pokedex.Golem.bs.at).to.eq(120)

      const expectedNatures = [
        [471, 1, 'Dragonair', 'Jolly'],
        [471, 2, 'Altaria', 'Gentle'],
        [471, 3, 'Wigglytuff', 'Gentle'],
        [627, 1, 'Golem', 'Careful'],
        [627, 2, 'Sudowoodo', 'Calm'],
        [712, 1, 'Chansey', 'Brave'],
        [653, 0, 'Blissey', 'Jolly'],
        [653, 1, 'Rhydon', 'Relaxed'],
        [653, 2, 'Crobat', 'Lonely'],
        [653, 3, 'Raticate', 'Timid'],
        [653, 4, 'Sceptile', 'Mild'],
        [764, 1, 'Yanma', 'Quirky'],
        [764, 2, 'Pinsir', 'Calm'],
        [764, 3, 'Venomoth', 'Timid'],
        [764, 4, 'Gligar', 'Calm'],
        [764, 5, 'Flygon', 'Bold'],
        [586, 0, 'Golem', 'Sassy'],
        [586, 1, 'Victreebel', 'Careful'],
        [586, 2, 'Torkoal', 'Sassy'],
        [586, 3, 'Sableye', 'Impish'],
        [586, 4, 'Alakazam', 'Quiet'],
        [116, 1, 'Chansey', 'Lax'],
        [116, 2, 'Venusaur', 'Quiet'],
        [116, 3, 'Latias', 'Naive'],
        [116, 4, 'Banette', 'Relaxed'],
        [116, 5, 'Entei', 'Lax']
      ]
      expectedNatures.forEach(([trainerId, slot, species, nature]) => {
        const sets = Object.values(win.setdex[species])
          .filter((set) => set.tr_id === trainerId && set.sub_index === slot)
        expect(sets, `${species} trainer ${trainerId} slot ${slot}`).to.have.length(1)
        expect(sets[0].nature, species).to.eq(nature)
      })
    })
  })

  it('loads the 1.0.8.3 base stats, enemy movesets and held items', () => {
    cy.window({ timeout: 30000 }).should((win) => {
      expect(win.backup_data && win.backup_data.title).to.eq('Emerald but Bad')
      expect(win.pokedex && win.pokedex.Mightyena).to.exist
      expect(win.eval('initializing')).to.eq(false)
      expect(win.pokedex.Mightyena.bs).to.deep.eq({
        hp: 90, at: 90, df: 70, sp: 80, sa: 90, sd: 70
      })
    }).then((win) => {
      const expectedMovesets = [
        [4, 1, 'Kingdra', ['Octazooka', 'Icy Wind', 'Twister', 'Smokescreen']],
        [4, 2, 'Dragonite', ['Twister', 'Thunder', 'Waterfall', 'Wing Attack']],
        [8, 4, 'Kingdra', ['Octazooka', 'Dragon Breath', 'Body Slam', 'Flash Cannon']],
        [78, 1, 'Girafarig', ['Body Slam', 'Psybeam', 'Earthquake', 'Jump Kick']],
        [78, 4, 'Raichu', ['Volt Tackle', 'Quick Attack', 'Submission', 'Petal Dance']],
        [91, 0, 'Tauros', ['Return', 'Pursuit', 'HP Ground', 'Quick Attack']],
        [94, 2, 'Beautifly', ['Leech Life', 'Heat Wave', 'Aerial Ace', 'Giga Drain']],
        [201, 0, 'Kecleon', ['Extreme Speed', 'HP Rock', 'Shadow Ball', 'Brick Break']],
        [265, 1, 'Lileep', ['Cosmic Power', 'Mud Shot', 'Mega Drain', 'Sandstorm']],
        [601, 0, 'Arcanine', ['Heat Wave', 'Dragon Breath', 'Iron Tail', 'Extreme Speed']],
        [602, 4, 'Sunflora', ['Sacred Fire', 'Giga Drain', 'HP Ice', 'Sunny Day']],
        [626, 1, 'Kabutops', ['Surf', 'Submission', 'Rock Tomb', 'Agility']],
        [626, 2, 'Armaldo', ['Rock Tomb', 'Surf', 'Brick Break', 'Twineedle']],
        [648, 2, 'Octillery', ['Flamethrower', 'Octazooka', 'Icy Wind', 'Flash Cannon']],
        [717, 0, 'Magcargo', ['Eruption', 'Explosion', 'Rock Tomb']],
        [721, 3, 'Tangela', ['Giga Drain', 'Body Slam', 'Sludge Bomb', 'Ancient Power']],
        [730, 1, 'Dodrio', ['Double-Edge', 'Sky Attack', 'Heat Wave', 'Quick Attack']]
      ]
      expectedMovesets.forEach(([trainerId, slot, species, moves]) => {
        const sets = Object.values(win.setdex[species])
          .filter((set) => set.tr_id === trainerId && set.sub_index === slot)
        expect(sets, `${species} trainer ${trainerId} slot ${slot}`).to.have.length(1)
        expect(sets[0].moves, species).to.deep.eq(moves)
      })

      const expectedItems = [
        [4, 1, 'Kingdra', 'Sitrus Berry'],
        [32, 1, 'Lapras', 'Sitrus Berry'],
        [32, 3, 'Blastoise', 'Wiki Berry'],
        [78, 4, 'Raichu', 'Leftovers'],
        [96, 2, 'Swampert', 'Mystic Water'],
        [201, 0, 'Kecleon', 'Sitrus Berry'],
        [201, 2, 'Armaldo', 'Silver Powder'],
        [398, 3, 'Shedinja', 'Spell Tag'],
        [601, 5, 'Houndoom', 'Lum Berry'],
        [602, 3, 'Sudowoodo', 'Sitrus Berry'],
        [626, 1, 'Kabutops', 'Sitrus Berry']
      ]
      expectedItems.forEach(([trainerId, slot, species, item]) => {
        const sets = Object.values(win.setdex[species])
          .filter((set) => set.tr_id === trainerId && set.sub_index === slot)
        expect(sets, `${species} trainer ${trainerId} slot ${slot}`).to.have.length(1)
        expect(sets[0].item, species).to.eq(item)
      })
    })

    cy.window().should((win) => expect(win.eval('changingSets')).to.eq(false)).then((win) => {
      win.expYields = win.expYields || {}
      win.$('input.opposing.set-selector')
        .val('Lileep (Lvl 16 Leader Roxanne - Rustboro City / Underwater)')
        .trigger('change')
    })
    cy.get('#p2 .move2 select.move-selector').should('have.value', 'Mud Shot')
    cy.get('#p2 .move3 select.move-selector').should('have.value', 'Mega Drain')

    cy.window().should((win) => expect(win.eval('changingSets')).to.eq(false)).then((win) => {
      win.$('input.opposing.set-selector')
        .val('Kingdra (Lvl 68 Team Aqua Grunt 3 - Aqua Hideout)')
        .trigger('change')
    })
    cy.get('#p2 select.item').should('have.value', 'Sitrus Berry')
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
