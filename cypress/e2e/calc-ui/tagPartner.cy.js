const calc = (Cypress.env('calcs') || [])[0]

(calc ? describe : describe.skip)('Tag Partner preview', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.viewport(1920, 1080)
    cy.visit(calc.url)
    cy.get('#rom-title').should('have.text', calc.title)
  })

  it('renders, loads, and hides the left-side tag partner preview', () => {
    cy.window().then((win) => {
      const speciesKeys = Object.keys(win.setdex)
      const sourceSpecies = speciesKeys[0]
      const earlierPartnerSpecies = speciesKeys[1]
      const laterPartnerSpecies = speciesKeys[2]
      const noTagSpecies = speciesKeys[3]

      const sourceSetName = 'Lvl 20 Cypress Tag Source'
      const noTagSetName = 'Lvl 20 Cypress No Tag'
      const partnerLeadSetName = 'Lvl 20 Cypress Tag Ally'
      const partnerSecondSetName = 'Lvl 20 Cypress Tag Ally Slot2'

      const sourceSetId = `${sourceSpecies} (${sourceSetName})`
      const noTagSetId = `${noTagSpecies} (${noTagSetName})`
      const partnerLeadSetId = `${laterPartnerSpecies} (${partnerLeadSetName})`
      const partnerSecondSetId = `${earlierPartnerSpecies} (${partnerSecondSetName})`

      const sourceBase = Object.values(win.setdex[sourceSpecies])[0]
      const leadBase = Object.values(win.setdex[laterPartnerSpecies])[0]
      const secondBase = Object.values(win.setdex[earlierPartnerSpecies])[0]
      const noTagBase = Object.values(win.setdex[noTagSpecies])[0]

      const tagPartnerTrainerId = 991002

      win.setdex[sourceSpecies][sourceSetName] = {
        ...sourceBase,
        tr_id: 991001,
        sub_index: 0,
        tagPartner: tagPartnerTrainerId,
        moves: ['Protect', 'Tackle', 'Growl', 'Tail Whip']
      }

      win.setdex[noTagSpecies][noTagSetName] = {
        ...noTagBase,
        tr_id: 991003,
        sub_index: 0,
        moves: ['Protect', 'Tackle', 'Growl', 'Tail Whip']
      }

      win.setdex[laterPartnerSpecies][partnerLeadSetName] = {
        ...leadBase,
        tr_id: tagPartnerTrainerId,
        sub_index: 0,
        nature: 'Bold',
        ability: 'Overgrow',
        item: 'Leftovers',
        moves: ['Hidden Power Fire', 'Reflect', 'Light Screen', 'Protect']
      }

      win.setdex[earlierPartnerSpecies][partnerSecondSetName] = {
        ...secondBase,
        tr_id: tagPartnerTrainerId,
        sub_index: 1,
        nature: 'Calm',
        ability: 'Blaze',
        item: 'Sitrus Berry',
        moves: ['Thunder Wave', 'Helping Hand', 'Encore', 'Protect']
      }

      win.customLeads[tagPartnerTrainerId] = `${laterPartnerSpecies} (${partnerLeadSetName})[0]`
      win.__tagPartnerTestData = {
        sourceSetId,
        noTagSetId,
        partnerLeadSetId,
        partnerSecondSetId
      }

      win.$('.player.set-selector').first().val(sourceSetId)
      win.$('.player .select2-chosen').first().text(sourceSetId)
      win.refreshTagPartnerPreview()
    })

    cy.get('.tag-partner-preview-wrapper').should('be.visible')
    cy.get('.tag-partner-label').should('have.text', 'Tag Partner')
    cy.get('.tag-partner-preview .trainer-pok-container').should('have.length', 2)
    cy.get('.tag-partner-preview .nature-info').should('not.exist')
    cy.get('.tag-partner-preview .extra-info').should('not.exist')
    cy.get('.tag-partner-preview .trainer-pok-item').should('not.exist')

    cy.window().then((win) => {
      const firstId = win.$('.tag-partner-preview .tag-partner-pok').first().attr('data-id')
      const firstMove = win.$('.tag-partner-preview .trainer-pok-container').first().find('.bp-info').first().text()

      expect(firstId).to.equal(win.__tagPartnerTestData.partnerLeadSetId)
      expect(firstMove).to.equal(win.abv('HP Fire', '.tag-partner-preview'))
    })

    cy.get('.player-party .trainer-pok-container').then(($partyBefore) => {
      const beforeCount = $partyBefore.length
      cy.get('.tag-partner-preview .tag-partner-pok').first().rightclick({ force: true })
      cy.get('.player-party .trainer-pok-container').should('have.length', beforeCount)
    })

    cy.get('.tag-partner-preview .tag-partner-pok').first().click({ force: true })

    cy.window().then((win) => {
      expect(win.$('.player.set-selector').first().val()).to.equal(win.__tagPartnerTestData.partnerLeadSetId)
      expect(win.$('.player .select2-chosen').first().text()).to.equal(win.__tagPartnerTestData.partnerLeadSetId)

      win.$('.player.set-selector').first().val(win.__tagPartnerTestData.noTagSetId)
      win.$('.player .select2-chosen').first().text(win.__tagPartnerTestData.noTagSetId)
      win.refreshTagPartnerPreview()
    })

    cy.get('.tag-partner-preview-wrapper').should('not.be.visible')
  })
})
