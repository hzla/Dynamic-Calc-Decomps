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

    if (calc.title) {
      it('can import a save', () => {
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
      }) 

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
