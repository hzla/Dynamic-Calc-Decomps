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

