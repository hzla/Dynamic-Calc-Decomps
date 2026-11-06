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
            expect(win.backup_data.moves['Weather Ball (Water)'].pp).to.eq(15)
          }
        })
        cy.get('#main-nav-dex').should('be.visible')
        cy.get('#show-ai').should('not.be.visible')
      })

      if (slug === 'frd') {
        it('loads the revised hard-mode teams from the patched ROM', () => {
          cy.window().then(win => {
            const party = Object.entries(win.setdex).flatMap(([species, sets]) =>
              Object.entries(sets).map(([name, set]) => ({ species, name, ...set })))
            expect(party).to.have.length(2331)
            const electabuzz = party.find(mon => mon.tr_id === 221 && mon.species === 'Electabuzz')
            expect(electabuzz.level).to.eq(25)
            expect(electabuzz.ai).to.eq(7)
            expect(electabuzz.ivs.hp).to.eq(20)
            expect(electabuzz.moves).to.deep.eq(['Thunder Shock', 'Light Screen', 'Swift', 'Thunder Punch'])
            const lori = party.filter(mon => mon.tr_id === 267).sort((a, b) => a.sub_index - b.sub_index)
            expect(lori.map(mon => mon.species)).to.deep.eq(['Exeggutor', 'Venusaur', 'Starmie'])
            expect(lori.map(mon => mon.item)).to.deep.eq(['Choice Band', 'Miracle Seed', 'Mystic Water'])
            expect(lori.every(mon => mon.level === 33)).to.eq(true)
            win.expYields = win.expYields || {}
            win.setOpposing(`Venusaur (${lori[1].name})`)
          })
          cy.get('#levelR1').should('have.value', '33')
          cy.get('.opposing.trainer-pok-list img.trainer-pok.right-side').should('have.length', 2)
          cy.get('.opposing.trainer-pok-list img[data-id^="Starmie ("]').click()
          cy.get('input.opposing.set-selector').invoke('val').should('include', 'Starmie (Lvl 33 Beauty Lori')
        })

        it('renders the new Mega trainer sprites with their ROM-specific stats', () => {
          for (const [name, trainerId, speciesId, attack, speed, ability] of [
            ['Pinsir-Mega', 574, 271, 155, 105, 'Hyper Cutter'],
            ['Pidgeot-Mega', 714, 270, 145, 131, 'Limber'],
          ]) {
            cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
            cy.window().then(win => {
              expect(win.eval('g3GetFireRedDeluxeTables()').species[speciesId]).to.eq(name)
              const lead = win.getSetOptions().find(option => {
                const set = option.set && win.setdex[option.pokemon]?.[option.set]
                return set && set.tr_id === trainerId && set.sub_index === 0
              })
              expect(lead).to.exist
              win.expYields = win.expYields || {}
              win.setOpposing(lead.id)
            })
            cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
            cy.get(`.opposing.trainer-pok-list img[data-id^="${name} ("]`)
              .should($img => expect($img[0].naturalWidth).to.be.greaterThan(0)).click()
            cy.get('#p2 .at .base').should('have.value', String(attack))
            cy.get('#p2 .sp .base').should('have.value', String(speed))
            cy.get('#p2 .ability').should('have.value', ability)
            cy.get('#p2 .poke-sprite').should($img => {
              expect($img.attr('src')).to.include(name.toLowerCase())
              expect($img[0].naturalWidth).to.be.greaterThan(0)
            })
            cy.window().then(win => {
              const mon = win.createPokemon(win.$('#p2'))
              expect(mon.name).to.eq(name)
              expect(mon.species.baseStats.atk).to.eq(attack)
              expect(mon.species.baseStats.spe).to.eq(speed)
            })
          }
        })
      }

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
