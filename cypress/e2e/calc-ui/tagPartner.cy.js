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

  it('lets the user manually choose a tag partner team without changing the left-side set', () => {
    cy.window().then((win) => {
      const speciesKeys = Object.keys(win.setdex)
      const sourceSpecies = speciesKeys[0]
      const leftLoadedSpecies = speciesKeys[1]
      const autoPartnerLeadSpecies = speciesKeys[2]
      const autoPartnerSecondSpecies = speciesKeys[3]
      const manualPartnerLeadSpecies = speciesKeys[4]
      const manualPartnerSecondSpecies = speciesKeys[5]
      const nextSourceSpecies = speciesKeys[6]
      const nextAutoPartnerSpecies = speciesKeys[7]

      const sourceSetName = 'Lvl 30 Cypress Manual Source'
      const leftLoadedSetName = 'Lvl 30 Cypress Left Loaded'
      const autoPartnerLeadSetName = 'Lvl 30 Cypress Auto Tag Lead'
      const autoPartnerSecondSetName = 'Lvl 30 Cypress Auto Tag Slot2'
      const manualPartnerLeadSetName = 'Lvl 30 Cypress Manual Tag Lead'
      const manualPartnerSecondSetName = 'Lvl 30 Cypress Manual Tag Slot2'
      const nextSourceSetName = 'Lvl 30 Cypress Reset Source'
      const nextAutoPartnerSetName = 'Lvl 30 Cypress Reset Tag Lead'

      const sourceTrainerId = 992101
      const autoPartnerTrainerId = 992102
      const manualPartnerTrainerId = 992103
      const nextSourceTrainerId = 992104
      const nextAutoPartnerTrainerId = 992105

      const sourceSetId = `${sourceSpecies} (${sourceSetName})`
      const leftLoadedSetId = `${leftLoadedSpecies} (${leftLoadedSetName})`
      const autoPartnerLeadSetId = `${autoPartnerLeadSpecies} (${autoPartnerLeadSetName})`
      const manualPartnerLeadSetId = `${manualPartnerLeadSpecies} (${manualPartnerLeadSetName})`
      const nextSourceSetId = `${nextSourceSpecies} (${nextSourceSetName})`
      const nextAutoPartnerSetId = `${nextAutoPartnerSpecies} (${nextAutoPartnerSetName})`

      const sourceBase = Object.values(win.setdex[sourceSpecies])[0]
      const leftLoadedBase = Object.values(win.setdex[leftLoadedSpecies])[0]
      const autoPartnerLeadBase = Object.values(win.setdex[autoPartnerLeadSpecies])[0]
      const autoPartnerSecondBase = Object.values(win.setdex[autoPartnerSecondSpecies])[0]
      const manualPartnerLeadBase = Object.values(win.setdex[manualPartnerLeadSpecies])[0]
      const manualPartnerSecondBase = Object.values(win.setdex[manualPartnerSecondSpecies])[0]
      const nextSourceBase = Object.values(win.setdex[nextSourceSpecies])[0]
      const nextAutoPartnerBase = Object.values(win.setdex[nextAutoPartnerSpecies])[0]

      win.setdex[sourceSpecies][sourceSetName] = {
        ...sourceBase,
        tr_id: sourceTrainerId,
        sub_index: 0,
        partner: autoPartnerTrainerId,
        tagPartner: autoPartnerTrainerId,
        moves: ['Protect', 'Tackle', 'Growl', 'Tail Whip']
      }

      win.setdex[leftLoadedSpecies][leftLoadedSetName] = {
        ...leftLoadedBase,
        tr_id: 992100,
        sub_index: 0,
        moves: ['Protect', 'Tackle', 'Growl', 'Tail Whip']
      }

      win.setdex[autoPartnerLeadSpecies][autoPartnerLeadSetName] = {
        ...autoPartnerLeadBase,
        tr_id: autoPartnerTrainerId,
        sub_index: 0,
        moves: ['Reflect', 'Helping Hand', 'Encore', 'Protect']
      }

      win.setdex[autoPartnerSecondSpecies][autoPartnerSecondSetName] = {
        ...autoPartnerSecondBase,
        tr_id: autoPartnerTrainerId,
        sub_index: 1,
        moves: ['Light Screen', 'Thunder Wave', 'Follow Me', 'Protect']
      }

      win.setdex[manualPartnerLeadSpecies][manualPartnerLeadSetName] = {
        ...manualPartnerLeadBase,
        tr_id: manualPartnerTrainerId,
        sub_index: 0,
        moves: ['Surf', 'Ice Beam', 'Protect', 'Helping Hand']
      }

      win.setdex[manualPartnerSecondSpecies][manualPartnerSecondSetName] = {
        ...manualPartnerSecondBase,
        tr_id: manualPartnerTrainerId,
        sub_index: 1,
        moves: ['Heat Wave', 'Tailwind', 'Protect', 'Roost']
      }

      win.setdex[nextSourceSpecies][nextSourceSetName] = {
        ...nextSourceBase,
        tr_id: nextSourceTrainerId,
        sub_index: 0,
        tagPartner: nextAutoPartnerTrainerId,
        moves: ['Protect', 'Tackle', 'Growl', 'Tail Whip']
      }

      win.setdex[nextAutoPartnerSpecies][nextAutoPartnerSetName] = {
        ...nextAutoPartnerBase,
        tr_id: nextAutoPartnerTrainerId,
        sub_index: 0,
        moves: ['Earthquake', 'Rock Slide', 'Protect', 'Swords Dance']
      }

      win.customLeads[sourceTrainerId] = `${sourceSetId}[0]`
      win.customLeads[autoPartnerTrainerId] = `${autoPartnerLeadSetId}[0]`
      win.customLeads[manualPartnerTrainerId] = `${manualPartnerLeadSetId}[0]`
      win.customLeads[nextSourceTrainerId] = `${nextSourceSetId}[0]`
      win.customLeads[nextAutoPartnerTrainerId] = `${nextAutoPartnerSetId}[0]`

      win.CURRENT_TRAINER_POKS = [`${sourceSetId}[0]`, `${autoPartnerLeadSetId}[0]`]

      win.$('.player.set-selector').first().val(leftLoadedSetId)
      win.$('.player .select2-chosen').first().text(leftLoadedSetId)
      win.$('.opposing.set-selector').first().val(sourceSetId)
      win.$('.opposing .select2-chosen').first().text(sourceSetId)
      win.refreshTagPartnerPreview()

      win.__manualTagPartnerTestData = {
        leftLoadedSetId,
        autoPartnerLeadSetId,
        manualPartnerLeadSetId,
        nextSourceSetId,
        nextAutoPartnerSetId
      }
    })

    cy.get('.tag-partner-preview-wrapper').should('be.visible')
    cy.get('.tag-partner-change').should('have.text', 'Change').click()
    cy.get('.select2-search input:visible').first().type('Cypress Manual Tag Lead{enter}')

    cy.get('.tag-partner-preview .trainer-pok-container').should('have.length', 2)

    cy.window().then((win) => {
      expect(win.$('.player .select2-chosen').first().text()).to.equal(win.__manualTagPartnerTestData.leftLoadedSetId)
      expect(win.$('.tag-partner-preview .tag-partner-pok').first().attr('data-id')).to.equal(win.__manualTagPartnerTestData.manualPartnerLeadSetId)

      win.setOpposing(win.__manualTagPartnerTestData.autoPartnerLeadSetId)
    })

    cy.window().then((win) => {
      expect(win.$('.tag-partner-preview .tag-partner-pok').first().attr('data-id')).to.equal(win.__manualTagPartnerTestData.manualPartnerLeadSetId)

      win.setOpposing(win.__manualTagPartnerTestData.nextSourceSetId)
    })

    cy.window().then((win) => {
      expect(win.$('.tag-partner-preview .tag-partner-pok').first().attr('data-id')).to.equal(win.__manualTagPartnerTestData.nextAutoPartnerSetId)
    })
  })
})
