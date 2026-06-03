describe('Ancestral X calc configuration', () => {
  const typhlosionImport = [
    'Typhlosion',
    'Level: 100',
    'Rash Nature',
    'Ability: Blaze',
    'IVs: 1 HP / 16 Atk / 8 Def / 8 SpA / 16 SpD / 24 Spe',
    '- Aqua Step',
    '- Vice Grip',
    '- Earth Power',
    '- Flamethrower'
  ].join('\n')

  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
    cy.viewport(1920, 1080)
    cy.visit('./index.html?data=ax&dmgGen=6&gen=8&view=calculator')
  })

  it('loads the local backup data with Gen 6 runtime settings', () => {
    cy.get('#rom-title').should('have.text', 'Ancestral X')

    cy.window().then((win) => {
      const runtimeSettings = win.eval('settings')

      expect(win.TITLE).to.eq('Ancestral X')
      expect(win.romhackSourceTitles.ax).to.eq('Ancestral X')
      expect(win.backup_data).to.have.property('poks')
      expect(win.backup_data).to.have.property('moves')
      expect(runtimeSettings.gen).to.eq(8)
      expect(runtimeSettings.damageGen).to.eq(6)
      expect(runtimeSettings.gameSwitchIn).to.eq(6)
      expect(runtimeSettings.switchIn).to.eq(6)
      expect(runtimeSettings.sourceType).to.eq('full')
      expect(runtimeSettings.typeChart).to.eq(6)
      expect(runtimeSettings.critGen).to.eq(6)
      expect(win.baseGame).to.eq('g6')
      expect(win.eval('baseVersion')).to.eq('')
      expect(win.$('#read-save').attr('for')).to.eq('save-upload')

      expect(win.$('#open-dex').is(':visible')).to.eq(false)
      expect(win.$('#main-nav-dex').is(':visible')).to.eq(false)
      expect(win.$('#dex-show').is(':visible')).to.eq(false)
      expect(win.$('#show-ai').is(':visible')).to.eq(false)
    })
  })

  it('loads baked-in Ancestral X move replacement aliases for imports', () => {
    const expectedMoveReplacements = {
      'Fury Attack': 'Scorching Swarm',
      Scratch: 'Breaking Swipe',
      'Fairy Wind': 'Spirit Break',
      'Vice Grip': 'Tussle',
      'Vise Grip': 'Tussle',
      'Wing Attack': 'Dual Wingbeat',
      'Needle Arm': 'Trailblaze',
      'Vine Whip': 'Trop Kick',
      Stomp: 'Ground Pound',
      'Horn Attack': 'Headlong Rush',
      'Powder Snow': 'Ice Hammer',
      Bind: 'Esper Wing',
      'Rolling Kick': "Fate's Flourish",
      'Rock Throw': 'Accelerock',
      'Crush Claw': 'Smart Strike',
      'Double Slap': 'Steel Beam',
      Lick: 'Aqua Step',
      'Water Gun': 'Chilling Water',
      Pound: 'Wave Crash'
    }

    cy.window().its('backup_data.move_replacements').should('deep.include', expectedMoveReplacements)

    cy.window().then((win) => {
      expect(win.moveChanges['Ancestral X']).to.deep.include(expectedMoveReplacements)
      expect(win.eval('normalizeImportedMoveName("Fury Attack", { applyRomReplacements: true })')).to.eq('Scorching Swarm')
      expect(win.eval('normalizeImportedMoveName("Vise Grip", { applyRomReplacements: true })')).to.eq('Tussle')
    })
  })

  it('applies baked-in replacements when adding regular custom sets', () => {
    cy.window().its('backup_data.move_replacements').should('have.property', 'Vice Grip', 'Tussle')

    cy.get('.import-team-text').clear().invoke('val', typhlosionImport)
    cy.get('#import').click()

    cy.window().its('localStorage.customsets').should('include', 'Tussle')

    cy.window().then((win) => {
      const customsets = JSON.parse(win.localStorage.customsets)
      expect(customsets.Typhlosion['My Box'].moves).to.deep.eq([
        'Aqua Step',
        'Tussle',
        'Earth Power',
        'Flamethrower'
      ])
    })
  })
})
