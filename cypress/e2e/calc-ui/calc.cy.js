// Tests for basic functionality across the most popular calcs



let skipNextSetup = false;

let calcs = Cypress.env('calcs')

const charizardBaseImport = [
  'Charizard @ Charizardite X',
  'Ability: Blaze',
  'Level: 50',
  'Timid Nature',
  '- Flamethrower',
  '- Air Slash',
  '- Roost',
  '- Dragon Pulse'
].join('\n')

const charizardLeftoversImport = [
  'Charizard @ Leftovers',
  'Ability: Blaze',
  'Level: 50',
  'Timid Nature',
  '- Flamethrower',
  '- Air Slash',
  '- Roost',
  '- Dragon Pulse'
].join('\n')

const charizardMegaExplicitImport = [
  'Charizard-Mega-X @ Leftovers',
  'Ability: Tough Claws',
  'Level: 50',
  'Adamant Nature',
  '- Flare Blitz',
  '- Dragon Claw',
  '- Roost',
  '- Earthquake'
].join('\n')

const charizardMegaYExplicitImport = [
  'Charizard-Mega-Y @ Leftovers',
  'Ability: Drought',
  'Level: 50',
  'Modest Nature',
  '- Fire Blast',
  '- Solar Beam',
  '- Roost',
  '- Focus Blast'
].join('\n')

function importSetText(text) {
  cy.get('.import-team-text').clear().invoke('val', text)
  cy.get('#import').click()
}

function enableRememberHpStatus(win) {
  win.localStorage.rememberHpStatus = '1'
  win.$('#toggle-remember-hp-status input').prop('checked', true)
}

function installConsoleCapture(win) {
  if (!win.__codexConsoleCaptureInstalled) {
    const originalLog = win.console.log.bind(win.console)
    const originalWarn = win.console.warn.bind(win.console)

    win.__consoleLogCalls = []
    win.__consoleWarnCalls = []
    win.console.log = (...args) => {
      win.__consoleLogCalls.push(args)
      return originalLog(...args)
    }
    win.console.warn = (...args) => {
      win.__consoleWarnCalls.push(args)
      return originalWarn(...args)
    }
    win.__codexConsoleCaptureInstalled = true
  }

  win.__consoleLogCalls.length = 0
  win.__consoleWarnCalls.length = 0
}

function consoleCallsContain(calls, pattern) {
  return (calls || []).some((args) =>
    (args || []).some((arg) => typeof arg === 'string' && pattern.test(arg))
  )
}

function findTrainerSwitchTargets(win) {
  const trainerGroups = new Map()

  for (const [speciesName, speciesSets] of Object.entries(win.setdex || {})) {
    for (const [setName, setData] of Object.entries(speciesSets || {})) {
      const trainerId = Number(setData && setData.tr_id)
      if (!Number.isFinite(trainerId) || !trainerId) {
        continue
      }

      const setId = `${speciesName} (${setName})`
      if (!trainerGroups.has(trainerId)) {
        trainerGroups.set(trainerId, [])
      }
      trainerGroups.get(trainerId).push(setId)
    }
  }

  const groups = [...trainerGroups.entries()]
    .map(([trainerId, setIds]) => ({ trainerId, setIds }))
    .filter((group) => group.setIds.length > 0)

  const sameTrainerGroup = groups.find((group) => group.setIds.length > 1)
  if (!sameTrainerGroup) {
    return null
  }

  const differentTrainerGroup = groups.find((group) => group.trainerId !== sameTrainerGroup.trainerId)
  if (!differentTrainerGroup) {
    return null
  }

  return {
    initialSetId: sameTrainerGroup.setIds[0],
    sameTrainerSetId: sameTrainerGroup.setIds[1],
    differentTrainerSetId: differentTrainerGroup.setIds[0]
  }
}

const statusImportText = [
  'Eevee',
  'Ability: Run Away',
  'Level: 50',
  'Jolly Nature',
  '- Quick Attack',
  '- Bite',
  '- Protect',
  '- Swift',
  '',
  'Pikachu',
  'Ability: Static',
  'Level: 50',
  'Timid Nature',
  '- Thunderbolt',
  '- Quick Attack',
  '- Iron Tail',
  '- Volt Tackle'
].join('\n')


for (let calc of calcs) {
  describe(calc.title, () => {
    before(() => {
        
      cy.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.viewport(1920, 1080)
      cy.visit(calc.url)
      // Visit Calc
      
    })

    it('displays the Rom Title', () => {
      cy.get('#rom-title').should('have.text', calc.title)
    })

    it('shows version links for multi-version games', () => {
      const versionConfig = (() => {
        if (calc.title.includes('Emerald Imperium')) {
          return calc.url.includes('evs=1')
            ? { active: 'Evs', inactive: 'no Evs', href: 'evs=0' }
            : { active: 'no Evs', inactive: 'Evs', href: 'evs=1' }
        }

        if (calc.title.includes('Pokemon Null')) {
          return calc.url.includes('data=null12')
            ? { active: '1.2', inactive: '1.1', href: 'data=null' }
            : { active: '1.1', inactive: '1.2', href: 'data=null12' }
        }

        if (calc.title.includes('Radical Red')) {
          return calc.url.includes('ced457ba9aa55731616c')
            ? { active: 'Normal', inactive: 'HC', href: 'e91164d90d06a009e6cc' }
            : { active: 'HC', inactive: 'Normal', href: 'ced457ba9aa55731616c' }
        }

        return null
      })()

      if (!versionConfig) {
        cy.get('#main-view-version-tabs').should('not.be.visible')
        return
      }

      cy.get('#main-view-version-tabs').should('be.visible')
      cy.contains('#main-view-version-tabs .main-view-version-link.active', versionConfig.active).should('exist')
      cy.contains('#main-view-version-tabs .main-view-version-link', versionConfig.inactive)
        .should('have.attr', 'href')
        .and('include', versionConfig.href)
    })


    it('can display and navigate trainer sets', () => {
      cy.get('#clearSets').click()
      
      // Check to see if trainer sets are loaded
      cy.get('.select2-container.set-selector.opposing .select2-chosen:visible').first().click({force: true})
      cy.get('.select2-results li:visible').should('have.length.greaterThan', 0)
      


      // Check to see if it loads Cynthia's Pokemon
      cy.get('.select2-search input:visible').first().type(`${calc.testTrainer}{enter}`)

      // Check to see if 8 pokemon were loaded (spiritomb, heatran, cramorant, xerneas, garchomp, mega garchomp, zamazenta-crowned)
      cy.get('.trainer-pok-list.opposing .trainer-pok-container').should('have.length', 7)

      // Check to see if clicking on Cynthia's pokemon loads moveset info and damage numbers  
      cy.get("label[for='resultMoveR1']").should('have.text', calc.testTrainerMonFirstMove)

      // Check to make sure first move is dealing non zero damage
      cy.get('#resultDamageR1').should(($el) => {
        const text = $el.text();
        const numbers = text.match(/(\d+\.?\d*)/g);
        
        expect(numbers).to.have.length.at.least(2);
        
        const num1 = parseFloat(numbers[0]);
        const num2 = parseFloat(numbers[1]);
        
        expect(num1).to.be.greaterThan(0);
        expect(num2).to.be.greaterThan(0);
      });
    })

    it('groups combined-name trainers by tr_id before falling back to sub_index', () => {
      cy.window().then((win) => {
        const speciesKeys = Object.keys(win.setdex)
        const [primaryLead, primarySecond, partnerLead, partnerSecond, partnerExtra, partnerMega] = speciesKeys.slice(0, 6)
        const trainerSetName = 'Lvl 63 Cypress Trainer One & Trainer Two |Route 110|'
        const opposingSetId = `${primaryLead} (${trainerSetName})`
        const primaryTrainerId = 359
        const partnerTrainerId = 351
        const primaryExpected = [
          `${primaryLead} (${trainerSetName})`,
          `${primarySecond} (${trainerSetName})`
        ]
        const partnerExpected = [
          `${partnerLead} (${trainerSetName})`,
          `${partnerSecond} (${trainerSetName})`,
          `${partnerExtra} (${trainerSetName})`,
          `${partnerMega} (${trainerSetName})`
        ]
        const baseSets = [
          win.setdex[primaryLead],
          win.setdex[primarySecond],
          win.setdex[partnerLead],
          win.setdex[partnerSecond],
          win.setdex[partnerExtra],
          win.setdex[partnerMega]
        ]

        ;[
          [primaryLead, 0, primaryTrainerId],
          [primarySecond, 1, primaryTrainerId],
          [partnerLead, 0, partnerTrainerId],
          [partnerSecond, 1, partnerTrainerId],
          [partnerExtra, 2, partnerTrainerId],
          [partnerMega, 6, partnerTrainerId]
        ].forEach(([speciesName, subIndex, trainerId], idx) => {
          const sourceSet = Object.values(baseSets[idx])[0]
          win.setdex[speciesName][trainerSetName] = {
            ...sourceSet,
            item: '-',
            level: 63,
            sub_index: subIndex,
            tr_id: trainerId,
            moves: ['Protect', 'Tackle', 'Tailwind', 'Helping Hand']
          }
        })

        win.$('input.opposing').val(opposingSetId)
        win.partnerName = null
        win.localStorage.switchInfo = '0'
        win.__duplicateSubIndexOriginalGetNextIn = win.get_next_in
        win.__duplicateSubIndexExpected = {
          primary: primaryExpected,
          partner: partnerExpected
        }
        win.get_next_in = () => ([
          [`${primaryLead} (${trainerSetName})[0]`, 0, '', 0, ['Protect', 'Tackle', 'Tailwind', 'Helping Hand'], '', '', '', 0],
          [`${primarySecond} (${trainerSetName})[1]`, 0, '', 1, ['Protect', 'Tackle', 'Tailwind', 'Helping Hand'], '', '', '', 0],
          [`${partnerLead} (${trainerSetName})[0]`, 0, '', 0, ['Protect', 'Tackle', 'Tailwind', 'Helping Hand'], '', '', '', 0],
          [`${partnerSecond} (${trainerSetName})[1]`, 0, '', 1, ['Protect', 'Tackle', 'Tailwind', 'Helping Hand'], '', '', '', 0],
          [`${partnerExtra} (${trainerSetName})[2]`, 0, '', 2, ['Protect', 'Tackle', 'Tailwind', 'Helping Hand'], '', '', '', 0],
          [`${partnerMega} (${trainerSetName})[6]`, 0, '', 6, ['Protect', 'Tackle', 'Tailwind', 'Helping Hand'], '', '', '', 0]
        ])

        win.refresh_next_in()
      })

      cy.get('.opposing.trainer-pok-list').should('have.class', 'dual-trainer-preview')
      cy.get('.trainer-preview-primary .trainer-pok').should('have.length', 2)
      cy.get('.trainer-preview-partner .trainer-pok').should('have.length', 4)

      cy.window().then((win) => {
        const primaryIds = win.$('.trainer-preview-primary .trainer-pok').map((_, el) => win.$(el).attr('data-id')).get()
        const partnerIds = win.$('.trainer-preview-partner .trainer-pok').map((_, el) => win.$(el).attr('data-id')).get()

        expect(primaryIds).to.deep.equal(win.__duplicateSubIndexExpected.primary)
        expect(partnerIds).to.deep.equal(win.__duplicateSubIndexExpected.partner)

        win.get_next_in = win.__duplicateSubIndexOriginalGetNextIn
      })
    })

    it('can import and navigate basic imported sets with no met location', () => {
      
      // Check that imports will show sprites in import box
      cy.fixture(`./texts/${calc.title}_save_paste.txt`).then((text) => {
        cy.get('textarea').invoke('val', text)
      })
      cy.get('#import').click()
      cy.get('.player-poks .trainer-pok').should('have.length', 33)

      // Check that clicking a sprite loads a pokemon
      cy.get("[data-id='Chikorita (My Box)']").click()
      cy.get('.select2-chosen').first().should('have.text', "Chikorita (My Box)")
    }) 



    it('can clear sets', () => { 
      cy.get('#clearSets').click()
      cy.get('.player-poks .trainer-pok').should('have.length', 0)
    }) 

    it('defaults imported sets without status to healthy', () => {
      cy.get('#clearSets').click()
      importSetText([
        'Eevee',
        'Ability: Run Away',
        'Level: 50',
        'Jolly Nature',
        '- Quick Attack',
        '- Bite',
        '- Protect',
        '- Swift'
      ].join('\n'))

      cy.window().then((win) => {
        expect(win.customSets.Eevee['My Box'].status).to.eq('Healthy')
      })

      cy.get("[data-id='Eevee (My Box)']").click()
      cy.get('#statusL1').should('have.value', 'Healthy')
    })

    it('persists status through the save button export-import roundtrip', () => {
      cy.get('#clearSets').click()
      importSetText(statusImportText)

      cy.get("[data-id='Eevee (My Box)']").click()
      cy.get('#statusL1').select('Burned')
      cy.get('#save-pok').click()

      cy.window().then((win) => {
        expect(win.customSets.Eevee['My Box'].status).to.eq('Burned')
      })

      cy.get("[data-id='Pikachu (My Box)']").click()
      cy.get("[data-id='Eevee (My Box)']").click()
      cy.get('#statusL1').should('have.value', 'Burned')
    })

    it('treats legacy custom sets with missing status as healthy', () => {
      cy.window().then((win) => {
        const legacySets = {
          Bulbasaur: {
            'My Box': {
              level: 50,
              ability: 'Overgrow',
              item: '',
              nature: 'Calm',
              evs: { hp: 0, at: 0, df: 0, sa: 0, sd: 0, sp: 0 },
              ivs: { hp: 31, at: 31, df: 31, sa: 31, sd: 31, sp: 31 },
              moves: ['Giga Drain', 'Sleep Powder', 'Protect', 'Sludge Bomb'],
              nn: ''
            }
          }
        }

        win.localStorage.customsets = JSON.stringify(legacySets)
        win.customSets = JSON.parse(win.localStorage.customsets)
        win.updateDex(win.customSets)
        win.get_box()
      })

      cy.get("[data-id='Bulbasaur (My Box)']").click()
      cy.get('#statusL1').should('have.value', 'Healthy')
    })

    it('automatically remembers hp and status for both sides when enabled', () => {
      cy.get('#clearSets').click()
      importSetText(statusImportText)

      cy.window().then((win) => {
        enableRememberHpStatus(win)
      })

      cy.get("[data-id='Eevee (My Box)']").click()
      cy.get('#statusL1').select('Burned')
      cy.get('#p1 .current-hp').clear().type('41').blur()
      cy.get("[data-id='Pikachu (My Box)']").click()
      cy.get("[data-id='Eevee (My Box)']").click()
      cy.get('#statusL1').should('have.value', 'Burned')
      cy.get('#p1 .current-hp').should('have.value', '41')

      cy.window().then((win) => {
        const targets = findTrainerSwitchTargets(win)
        expect(targets, 'trainer switch targets').to.not.equal(null)

        win.lastOpposingTrainerIdentity = null
        win.$('.opposing.set-selector').first().val(targets.initialSetId).change()
      })

      cy.get('#statusR1').select('Poisoned')
      cy.get('#p2 .current-hp').clear().type('12').blur()

      cy.window().then((win) => {
        const targets = findTrainerSwitchTargets(win)
        win.$('.opposing.set-selector').first().val(targets.sameTrainerSetId).change()
        win.$('.opposing.set-selector').first().val(targets.initialSetId).change()
      })

      cy.get('#statusR1').should('have.value', 'Poisoned')
      cy.get('#p2 .current-hp').should('have.value', '12')
    })

    it('resets remembered hp and status when switching to a different opposing trainer', () => {
      cy.get('#clearSets').click()
      importSetText(statusImportText)

      cy.window().then((win) => {
        enableRememberHpStatus(win)
      })

      cy.get("[data-id='Eevee (My Box)']").click()
      cy.get('#statusL1').select('Burned')
      cy.get('#p1 .current-hp').clear().type('41').blur()
      cy.get('#statusL1').should('have.value', 'Burned')

      cy.window().then((win) => {
        const targets = findTrainerSwitchTargets(win)
        expect(targets, 'trainer switch targets').to.not.equal(null)

        win.lastOpposingTrainerIdentity = null
        win.$('.opposing.set-selector').first().val(targets.initialSetId).change()
      })

      cy.get('#statusR1').select('Poisoned')
      cy.get('#p2 .current-hp').clear().type('12').blur()

      cy.window().then((win) => {
        const targets = findTrainerSwitchTargets(win)
        win.$('.opposing.set-selector').first().val(targets.differentTrainerSetId).change()

        expect(win.customSets.Eevee['My Box'].status).to.eq('Healthy')
        expect(win.customSets.Eevee['My Box'].currentHp).to.eq(undefined)
        expect(win.localStorage.rememberedEnemyHpStatus).to.eq('{}')
      })

      cy.get('#statusL1').should('have.value', 'Healthy')
      cy.window().then((win) => {
        const maxHp = String(parseInt(win.$('#p1 .max-hp').text(), 10))
        expect(win.$('#p1 .current-hp').val()).to.eq(maxHp)
      })
    })

    it('colors status dropdowns based on the selected status', () => {
      cy.get('#clearSets').click()
      importSetText(statusImportText)
      cy.get("[data-id='Eevee (My Box)']").click()

      cy.get('#statusL1').select('Healthy').then(($select) => {
        const defaultColor = getComputedStyle($select[0]).color

        cy.wrap($select).select('Burned').should('have.css', 'color', 'rgb(163, 77, 20)')
        cy.wrap($select).select('Paralyzed').should('have.css', 'color', 'rgb(241, 250, 140)')
        cy.wrap($select).select('Poisoned').should('have.css', 'color', 'rgb(255, 121, 198)')
        cy.wrap($select).select('Badly Poisoned').should('have.css', 'color', 'rgb(255, 121, 198)')
        cy.wrap($select).select('Frozen').should('have.css', 'color', 'rgb(139, 233, 253)')
        cy.wrap($select).select('Asleep').should('have.css', 'color', defaultColor)
        cy.wrap($select).select('Healthy').should('have.css', 'color', defaultColor)
      })

      cy.get('#statusR1').select('Paralyzed').should('have.css', 'color', 'rgb(241, 250, 140)')
    })

    it('includes status in exports only when the status is not healthy', () => {
      cy.get('#clearSets').click()
      importSetText(statusImportText)
      cy.get("[data-id='Eevee (My Box)']").click()

      cy.get('#statusL1').select('Burned')
      cy.get('#exportL').click()
      cy.get('.import-team-text').should('contain.value', 'Status: Burned')

      cy.get('#statusL1').select('Healthy')
      cy.get('#exportL').click()
      cy.get('.import-team-text').invoke('val').should('not.contain', 'Status:')
    })

    if (calc.title) {
      it('can import a save', () => {
        if (calc.title.includes('Emerald Imperium')) {
          cy.window().then((win) => installConsoleCapture(win))
        }

        cy.get('#save-upload').selectFile(`cypress/fixtures/saves/${calc.title}.sav`, {force: true})

        cy.fixture(`./texts/${calc.title}_save_paste.txt`).then((expectedContent) => {
          cy.get('.import-team-text').first().should('have.value', expectedContent);
        });

        cy.get('.player-poks .trainer-pok').should('have.length', 33)

        // Check that clicking a sprite loads a pokemon
        cy.get("[data-id='Chikorita (My Box)']").click()
        cy.get('.select2-chosen').first().should('have.text', "Chikorita (My Box)")


        // Check that importing a save imports encounter data
        let isFullValid = true
        cy.window().then((win) => {
          let encounter = win.getEncounters()
          let customSets = win.customSets

          for (let pok in customSets) {
            // Make sure mon exists
            if (typeof encounter[pok] == "undefined") {
              isFullValid = false
              console.log(pok)
              assert.fail(`${pok} not found in encounters`);
            }
            if (isFullValid == false) {
              break
            }
          }
        });

        if (calc.title.includes('Emerald Imperium')) {
          cy.window().then((win) => {
            expect(consoleCallsContain(win.__consoleLogCalls, /\[PokeEmerald deterministic TM pocket\]/)).to.equal(true)
            expect(consoleCallsContain(win.__consoleWarnCalls, /Falling back to brute-force scan/i)).to.equal(false)
            expect(String(win.localStorage.legalTms || '')).to.not.equal('')
          })
        }
      }) 

      if (calc.title.includes('Emerald Imperium')) {
        it('can import an ss1 save without TM pocket logging', () => {
          cy.window().then((win) => installConsoleCapture(win))
          cy.get('#save-upload').selectFile('cypress/fixtures/saves/Emerald Imperium 1.3.ss1', {force: true})
          cy.get('.import-team-text').first().should('contain.value', 'Chikorita')
          cy.window().then((win) => {
            expect(consoleCallsContain(win.__consoleLogCalls, /\[PokeEmerald deterministic TM pocket\]/)).to.equal(false)
            expect(consoleCallsContain(win.__consoleWarnCalls, /Falling back to brute-force scan/i)).to.equal(false)
          })
        })
      }

      it('shows box sort controls and preserves search highlights while sorting', () => {
        cy.get('.player-poks .trainer-pok').its('length').should('be.gt', 0)
        cy.get('#search-row').should('be.visible')
        cy.get('#box-sort-select').should('have.value', 'species_name')
        cy.get('#box-sort-direction').should('contain', '↑')

        cy.get('.player-poks .trainer-pok').then(($mons) => {
          const species = [...$mons].map((el) => el.getAttribute('data-id').split(' (')[0])
          const expected = [...species].sort((left, right) => left.localeCompare(right))
          expect(species).to.deep.equal(expected)
        })

        cy.get('#box-sort-direction').click()
        cy.get('.player-poks .trainer-pok').then(($mons) => {
          const species = [...$mons].map((el) => el.getAttribute('data-id').split(' (')[0])
          const expected = [...species].sort((left, right) => right.localeCompare(left))
          expect(species).to.deep.equal(expected)
        })

        cy.get('#box-sort-direction').click()
        cy.get('#box-sort-select').select('bst')
        cy.window().then((win) => {
          const ids = [...win.document.querySelectorAll('.player-poks .trainer-pok')].map((el) => el.getAttribute('data-id'))
          const bstValues = ids.map((id) => {
            const species = id.split(' (')[0]
            const stats = win.pokedex[species].baseStats || win.pokedex[species].bs
            return stats.hp + (stats.atk ?? stats.at) + (stats.def ?? stats.df) + (stats.spa ?? stats.sa) + (stats.spd ?? stats.sd) + (stats.spe ?? stats.sp)
          })
          expect(bstValues).to.deep.equal([...bstValues].sort((left, right) => left - right))
          win.get_box()
        })

        cy.get('#box-sort-select').should('have.value', 'bst')
        cy.get('#search-box').clear().type('overgrow')
        cy.get('.player-poks .trainer-pok.active, .player-megas .trainer-pok.active').its('length').should('be.gt', 0)
        cy.get('#box-sort-select').select('spe')
        cy.get('.player-poks .trainer-pok.active, .player-megas .trainer-pok.active').its('length').should('be.gt', 0)
      })

      if (calc.title.includes('Pokemon Null')) {
        it('sorts by species id using nullMons order', () => {
          cy.get('#box-sort-direction').then(($button) => {
            if ($button.text().includes('↓')) {
              cy.wrap($button).click()
            }
          })
          cy.get('#box-sort-select').select('species_id')
          cy.window().then((win) => {
            const ids = [...win.document.querySelectorAll('.player-poks .trainer-pok')].map((el) => el.getAttribute('data-id'))
            const speciesIds = ids.map((id) => win.nullMons.indexOf(id.split(' (')[0]) + 1)
            expect(speciesIds).to.deep.equal([...speciesIds].sort((left, right) => left - right))
          })
        })
      }

      it('sorts by damage metrics and shows the hover tooltip for damage thresholds', () => {
        cy.window().then((win) => {
          win.localStorage.boxrolls = '1'
          win.$('#player-poks-filter').show()
          win.$('#min-dealt').val('')
          win.$('#max-taken').val('')
          win.box_rolls()
        })

        cy.get('#box-sort-select').select('damage_dealt')
        cy.window().then((win) => {
          const ids = [...win.document.querySelectorAll('.player-poks .trainer-pok')].map((el) => el.getAttribute('data-id'))
          const dealtValues = ids
            .map((id) => win.getBoxMatchupMetrics(id).bestMinDealtPercent)
            .filter((value) => Number.isFinite(value))
          expect(dealtValues).to.deep.equal([...dealtValues].sort((left, right) => left - right))
        })

        cy.get('.player-poks .trainer-pok').first().trigger('mouseenter', { pageX: 320, pageY: 460, force: true })
        cy.get('#box-damage-tooltip').should('be.visible').and('contain', 'Min dealt:')

        cy.get('#filter-move option').then(($options) => {
          if ($options.length > 1) {
            cy.get('#filter-move').select($options.eq(1).val())
          }
        })

        cy.get('#box-sort-select').select('damage_taken')
        cy.window().then((win) => {
          const ids = [...win.document.querySelectorAll('.player-poks .trainer-pok')].map((el) => el.getAttribute('data-id'))
          const takenValues = ids
            .map((id) => win.getBoxMatchupMetrics(id).worstMaxTakenPercent)
            .filter((value) => Number.isFinite(value))
          expect(takenValues).to.deep.equal([...takenValues].sort((left, right) => left - right))
        })

        cy.get('#box-sort-select').select('species_name')
        cy.get('#max-taken').clear().type('40').blur()
        cy.get('.player-poks .trainer-pok').first().trigger('mouseenter', { pageX: 340, pageY: 480, force: true })
        cy.get('#box-damage-tooltip').should('be.visible').and('contain', 'Max taken:')
      })
    }

    if (calc.url.includes('dmgGen=8')) {
      it('shows the mega toggle only for supported damage gens', () => {
        cy.get('#open-menu').click()
        cy.get('#toggle-auto-import-megas').should('be.visible')
        cy.window().then((win) => {
          const previousDamageGen = win.settings.damageGen
          win.settings.damageGen = 5
          win.applyAutoImportMegasVisibility()
          expect(win.$('#toggle-auto-import-megas').is(':visible')).to.eq(false)
          win.settings.damageGen = previousDamageGen
          win.applyAutoImportMegasVisibility()
          expect(win.$('#toggle-auto-import-megas').is(':visible')).to.eq(true)
        })
      })

      it('imports item-gated megas into the mega box only', () => {
        cy.get('#clearSets').click()
        importSetText(charizardBaseImport)
        cy.get('.player-poks .trainer-pok').should('have.length', 1)
        cy.get('.player-megas-wrapper').should('be.visible')
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").should('exist')
        cy.get(".player-megas [data-id='Charizard-Mega-Y (My Box)']").should('not.exist')
        cy.get(".player-poks [data-id='Charizard (My Box)']").should('exist')
      })

      it('does not auto-import megas without the required item when the toggle is off', () => {
        cy.get('#clearSets').click()
        cy.window().then((win) => {
          win.localStorage.autoImportMegas = '0'
          win.$('#toggle-auto-import-megas input').prop('checked', false)
        })
        importSetText(charizardLeftoversImport)
        cy.get('.player-poks .trainer-pok').should('have.length', 1)
        cy.get('.player-megas .trainer-pok').should('have.length', 0)
        cy.get('.player-megas-wrapper').should('not.be.visible')
      })

      it('auto-imports all megas for a base species when the toggle is enabled', () => {
        cy.get('#clearSets').click()
        cy.window().then((win) => {
          win.localStorage.autoImportMegas = '1'
          win.$('#toggle-auto-import-megas input').prop('checked', true)
        })
        importSetText(charizardLeftoversImport)
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").should('exist')
        cy.get(".player-megas [data-id='Charizard-Mega-Y (My Box)']").should('exist')
      })

      it('keeps explicitly imported megas regardless of held item requirements', () => {
        cy.get('#clearSets').click()
        importSetText(charizardMegaYExplicitImport)
        cy.get(".player-megas [data-id='Charizard-Mega-Y (My Box)']").should('exist')
        cy.window().then((win) => {
          expect(win.customSets['Charizard-Mega-Y']['My Box'].megaImportMode).to.eq('explicit')
        })
      })

      it('removes stale auto-derived megas when the base import no longer qualifies', () => {
        cy.get('#clearSets').click()
        cy.window().then((win) => {
          win.localStorage.autoImportMegas = '0'
          win.$('#toggle-auto-import-megas input').prop('checked', false)
        })
        importSetText(charizardBaseImport)
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").should('exist')
        importSetText(charizardLeftoversImport)
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").should('not.exist')
      })

      it('preserves explicit megas when later base imports would otherwise clean them up', () => {
        cy.get('#clearSets').click()
        cy.window().then((win) => {
          win.localStorage.autoImportMegas = '0'
          win.$('#toggle-auto-import-megas input').prop('checked', false)
        })
        importSetText(charizardBaseImport)
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").should('exist')
        importSetText(charizardMegaExplicitImport)
        importSetText(charizardLeftoversImport)
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").should('exist')
        cy.window().then((win) => {
          expect(win.customSets['Charizard-Mega-X']['My Box'].megaImportMode).to.eq('explicit')
          expect(win.customSets['Charizard-Mega-X']['My Box'].moves[0]).to.eq('Flare Blitz')
        })
      })

      it('supports mega box interactions and search highlighting', () => {
        cy.get('#clearSets').click()
        cy.window().then((win) => {
          win.localStorage.autoImportMegas = '1'
          win.$('#toggle-auto-import-megas input').prop('checked', true)
        })
        importSetText(charizardLeftoversImport)
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").click()
        cy.get('.select2-chosen').first().should('have.text', 'Charizard-Mega-X (My Box)')
        cy.get('#search-box').clear().type('tough claws')
        cy.get(".player-megas [data-id='Charizard-Mega-X (My Box)']").should('have.class', 'active')
      })
    }



  })  
}









// check to make sure every listed move exists
