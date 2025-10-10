// Tests for basic functionality across the most popular calcs



let skipNextSetup = false;

let calcs = Cypress.env('calcs')


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

      // Check to see if 8 pokemon were loaded (spiritomb, heatran, cramorany, zamazenta, xerneas, garchomp, mega garchomp, zamazenta-crowned)
      cy.get('.trainer-pok-list.opposing .trainer-pok-container').should('have.length', 8)

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



  })  
}









// check to make sure every listed move exists



