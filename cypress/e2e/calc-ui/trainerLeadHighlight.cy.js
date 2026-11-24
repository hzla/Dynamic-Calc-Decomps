describe('Trainer lead highlight', () => {
  for (const [slug, title, trainerId] of [
    ['frd', 'Fire Red Deluxe Hard Mode', 414],
    ['null125', 'Pokemon Null 1.2.5', 590],
  ]) {
    for (const switchPreview of [true, false]) {
      it(`marks the original lead in ${slug} with Switch Preview ${switchPreview ? 'on' : 'off'}`, () => {
        cy.viewport(1440, 1000)
        cy.visit(`/?data=${slug}&view=calculator${switchPreview ? '' : '&noSwitch=1'}`, {
          onBeforeLoad(win) {
            win.localStorage.hideCurrentAiMon = '1'
          }
        })
        cy.window({ timeout: 30000 }).should(win => {
          expect(win.backup_data?.title).to.eq(title)
          expect(win.eval('initializing')).to.eq(false)
          expect(win.setdex).to.be.an('object')
          expect(win.$('input.opposing.set-selector').data('select2')).to.be.an('object')
          expect(win.eval('settings.noSwitch')).to.eq(!switchPreview)
        })
        cy.window().then(win => {
          const team = win.getSetOptions().filter(option =>
            option.set && win.setdex[option.pokemon]?.[option.set]?.tr_id === trainerId)
          const slot = index => team.find(option =>
            win.setdex[option.pokemon][option.set].sub_index === index).id
          cy.wrap({ lead: slot(0), reserve: slot(1) }).as('team')
        })

        cy.get('@team').then(({ lead, reserve }) => {
          const leadIcon = `.opposing.trainer-pok-list .right-side[data-id="${lead}"]`
          cy.window().then(win => win.setOpposing(lead))
          if (switchPreview) {
            cy.get(leadIcon).should('not.exist')
            cy.get('#p2 .poke-sprite').should('have.class', 'lead')
              .and('have.css', 'outline-color', 'rgb(187, 134, 252)')
          } else {
            cy.get(leadIcon).should('have.class', 'lead')
            cy.get('#p2 .poke-sprite').should('not.have.class', 'lead')
          }

          cy.window().then(win => win.setOpposing(reserve))
          cy.get(leadIcon).should('have.class', 'lead')
            .and('have.css', 'border-top-color', 'rgb(187, 134, 252)')
          cy.get('#p2 .poke-sprite').should('not.have.class', 'lead')

          cy.window().then(win => {
            win.localStorage.hideCurrentAiMon = '0'
            win.setOpposing(lead)
          })
          cy.get(leadIcon).should('have.class', 'lead')
          cy.get('#p2 .poke-sprite').should('not.have.class', 'lead')
        })
      })
    }
  }
})
