describe('Fire Red Deluxe variants', () => {
  for (const [slug, mode, brockSize] of [['frd', 'Hard', 6], ['frdnormal', 'Normal', 5]]) {
    describe(mode + ' Mode', () => {
      beforeEach(() => {
        cy.clearLocalStorage()
        cy.viewport(1920, 1080)
        cy.visit(`./index.html?data=${slug}&gen=8&dmgGen=3&types=3&switchIn=3&view=calculator`)
        cy.window({ timeout: 30000 }).should(win => {
          expect(win.backup_data && win.backup_data.title).to.eq(`Fire Red Deluxe ${mode} Mode`)
          expect(win.pokedex && win.pokedex['Corsola-Galar'].bs.df).to.eq(150)
          expect(win.eval('initializing')).to.eq(false)
          expect(win.eval('changingSets')).to.eq(false)
        })
      })

      it('uses Gen 3 mechanics, canonical regional data, FRLG saves and its own Dex', () => {
        cy.window().then(win => {
          const settings = win.eval('settings')
          expect(settings.gen).to.eq(8)
          expect(settings.damageGen).to.eq(3)
          expect(settings.typeChart).to.eq(3)
          expect(settings.physSpecSplit).to.eq(false)
          expect(settings.gameSwitchIn).to.eq(3)
          expect(win.baseGame).to.eq('g3')
          expect(win.requestedBaseGame).to.eq('FRLG')
          expect(win.eval('g3ShouldHandleSaveUpload()')).to.eq(true)
          expect(win.getDexGameIdForTitle(win.backup_data.title)).to.eq(slug)
          expect(win.eval('g3GetFireRedDeluxeTables()').species).to.include('Corsola-Galar')
          if (slug === 'frd') {
            expect(win.MOVES_BY_ID[8].weatherballwater.type).to.eq('Water')
            expect(win.MOVES_BY_ID[8].weatherballfire.type).to.eq('Fire')
          }
        })
        cy.get('#main-nav-dex').should('be.visible')
        cy.get('#show-ai').should('not.be.visible')
      })

      it('renders the right Brock team with regional sprites', () => {
        cy.window().then(win => {
          win.expYields = win.expYields || {}
          const entry = Object.entries(win.setdex['Geodude-Alola']).find(([, set]) => set.tr_id === 414)
          const team = Object.values(win.setdex).flatMap(sets => Object.values(sets)).filter(set => set.tr_id === 414)
          expect(team).to.have.length(brockSize)
          win.$('input.opposing.set-selector').val(`Geodude-Alola (${entry[0]})`).trigger('change')
        })
        cy.get('.opposing.trainer-pok-list img.trainer-pok.right-side').should('have.length', brockSize - 1)
        cy.get('#p2 .poke-sprite').invoke('attr', 'src').should('include', 'geodude-alola')
        cy.get('.opposing.trainer-pok-list img[src$="growlithe-hisui.png"]').should('exist')
        cy.get('.opposing.trainer-pok-list img.trainer-pok.right-side').each($img => {
          cy.wrap($img).should($el => expect($el[0].naturalWidth).to.be.greaterThan(0))
        })
      })

      it('navigates forward and backward in spreadsheet order', () => {
        cy.window().should(win => expect(win.eval('npoint_data.order')).to.have.property('211'))
        cy.window().then(win => {
          win.expYields = win.expYields || {}
          const option = win.getSetOptions().find(option => option.set && win.setdex[option.pokemon]?.[option.set]?.tr_id === 211)
          win.$('input.opposing.set-selector').val(option.id).trigger('change')
        })
        cy.get('.nav-tag.next').first().should('be.visible').and('have.attr', 'data-next', '49').click()
        cy.window().should(win => expect(win.get_current_in(false).tr_id).to.eq(49))
        cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
        cy.get('.nav-tag.prev').first().should('be.visible').and('have.attr', 'data-next', '211').click()
        cy.window().should(win => expect(win.get_current_in(false).tr_id).to.eq(211))
      })
    })
  }
})
