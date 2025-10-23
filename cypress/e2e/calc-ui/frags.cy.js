// Tests for basic functionality across the most popular calcs



let skipNextSetup = false;

const calcs = [
    {
	    title: "Emerald Imperium 1.3",
	    url: './index.html?data=imp13&dmgGen=8&gen=8&types=6&evs=0',
	    testTrainer: 'Cynthia',
	    monCount: 33
	}
]


for (let calc of calcs) {
  describe(calc.title, () => {
    before(() => {
        
      cy.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.viewport(1920, 1080)
      cy.clearLocalStorage()
      cy.visit(calc.url)

      
      // Visit Calc
      
    })


   
    it('can record a frag', () => {
      // Select First Cynthia mon 
      cy.get('.select2-container.set-selector.opposing .select2-chosen:visible').first().click({force: true})
      cy.get('.select2-results li:visible').should('have.length.greaterThan', 0)
      cy.get('.select2-search input:visible').first().type(`${calc.testTrainer}{enter}`)

      // import save
      cy.get('#save-upload').selectFile(`cypress/fixtures/saves/${calc.title}.sav`, {force: true})
      cy.get('#import').click()

      // Check that importing a save imports encounter data
      
      // Select Chikorita
      cy.get("[data-id='Chikorita (My Box)']").click()

      // Click sprite
      cy.get('#p2 .poke-sprite').click()

      cy.get('#met-loc').should('have.text', 'Fallarbor Town')
      cy.get('#frag-count').should('have.text', 'Frags: 1')

      // Click sprite
      // cy.get('#p2 .poke-sprite').click()
      // cy.get('#frag-count').should('have.text', 'Frags: 0')
    })


    it('can merge frag into from pre evolutions', () => {
      // Import updated sets with evolved mons 
      cy.fixture(`./texts/${calc.title}_save_evolved_encounters_paste.txt`).then((text) => {
        cy.get('textarea').invoke('val', text)
      })
      cy.get('#import').click()

      cy.window().then((win) => {
          let encounters = win.getEncounters()

          let setData = encounters.Chikorita.setData["My Box"]
          expect(encounters.Bayleef.frags).to.deep.equal(encounters.Chikorita.frags)
          expect(encounters.Bayleef.fragCount).to.equal(encounters.Chikorita.fragCount)

          expect(setData.met).to.equal(encounters.Bayleef.setData["My Box"].met)
          expect(setData.nn).to.equal(encounters.Bayleef.setData["My Box"].nn)         
        });
    })      
  })  

  // describe(`${calc.title} Fragsheet`, () => {
  //   before(() => {
        
  //     cy.viewport(1920, 1080)

  //     cy.visit(calc.url.replace("index", "frags"))
      
  //   })


  //   it('can display a list of encounters', () => {


  //     // make sure first displayed encounter is the encounter with most frags (Bayleef with 1)
  //     cy.get('.field-species').first().should('have.text', "Bayleef")
  //     // cy.get('.field-nickname').first().should('have.text', "NICKNAME")
  //     cy.get('.field-encounterLocation').first().should('have.text', "Fallarbor Town")




  //     // Count number of rendered rows, 27 means evos were successfully merged
  //     cy.window().its('gridApi').invoke('getDisplayedRowCount').should('eq', calc.monCount);
      
  //   })

  //   it('can display detailed frag history', () => {


  //     // make sure first displayed encounter is the encounter with most frags (Bayleef with 1)
  //     cy.get('.field-species').first().click()

  //     // Count number of rendered rows, 27 means evos were successfully merged
  //     cy.get('.tr-name').first().should('have.text', 'Champion Elite Four Cynthia ')

  //     cy.get('.fragged-mons > img').should('have.length', 1)
      
  //   })


  //   it('can display delete an encounter', () => {
  //     // Click gyarados name
  //     cy.get('.field-species').eq(1).click()

  //     // Click Delete
  //     cy.get('#delete-enc').click()

  //     // Check that number of rows is now 1 less
  //     cy.window().its('gridApi').invoke('getDisplayedRowCount').should('eq', calc.monCount - 1);  
  //   })

  //   it('can clear a sheet', () => {


  //     // Click Reset Sheet
  //     cy.get('#reset-sheet').click()

  //     // Check that all rows are cleared
  //     cy.window().its('gridApi').invoke('getDisplayedRowCount').should('eq', 0);  
  //   })

  //   it('can import a sheet', () => {

  //     cy.window().invoke('importSheet')

  //     cy.get('input[type="file"][accept=".json"]')
  //     .selectFile(`cypress/fixtures/fragsheets/rp_test_sheet.json`, { force: true })

  //     // check that the new rows have been loaded
  //     cy.window().its('gridApi').invoke('getDisplayedRowCount').should('eq', 32);  
  //   })
  // })
}









// check to make sure every listed move exists



