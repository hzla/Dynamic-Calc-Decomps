const { createGen5BattleLogSave } = require('../../support/gen5BattleLogSave')

const profiles = [
  ['bb2redux', 'Blaze Black 2 Redux', 'BW2', false],
  ['bw', 'Black/White', 'BW', true],
  ['bw2', 'Black 2/White 2', 'BW2', false],
  ['brutalblack', 'Brutal Black', 'BW', true],
]

describe('Save-file battle logs outside Cascade White', () => {
  for (const [slug, title, baseVersion, defaultBattleLogTab] of profiles) {
    it(`reveals imported logs and frags for ${title}`, () => {
      cy.clearLocalStorage()
      cy.viewport(1920, 1080)
      cy.visit(`./index.html?data=${slug}&gen=8&view=calculator`)
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.baseGame).to.eq('BW')
        expect(win.eval('baseVersion')).to.eq(baseVersion)
        expect(win.eval('initializing')).to.eq(false)
        expect(win.eval('changingSets')).to.eq(false)
        expect(Object.values(win.setdex || {}).some(sets =>
          Object.values(sets).some(set => Number(set.tr_id) > 0 && Number(set.sub_index) === 0)
        ), 'loaded trainer data').to.eq(true)
      })
      cy.get('#main-nav-battle-log').should(defaultBattleLogTab ? 'be.visible' : 'not.be.visible')

      let enemySpecies
      let trainerId
      cy.window().then(win => {
        const lead = Object.entries(win.setdex).flatMap(([species, sets]) =>
          Object.values(sets).map(set => ({ species, ...set }))
        ).find(set => Number(set.tr_id) > 0 && Number(set.sub_index) === 0)
        expect(lead, 'loaded trainer lead').to.exist
        enemySpecies = lead.species
        trainerId = Number(lead.tr_id)
        const save = createGen5BattleLogSave(trainerId, baseVersion)
        cy.get('#save-upload-g45').selectFile({
          contents: Cypress.Buffer.from(save), fileName: `${slug}-logs.sav`, mimeType: 'application/octet-stream',
        }, { force: true })
      })

      cy.get('#main-nav-battle-log').should('be.visible').click()
      cy.get('#battle-log-container .battle-session').should('have.length', 1)
      cy.get('#battle-log-container').should('contain.text', 'Bulbasaur')
      cy.window().should(win => {
        expect(win.isSaveFileBattleLogActive()).to.eq(true)
        const payload = JSON.parse(win.localStorage.saveFileBattleLogs)
        expect(payload.events.find(event => event.type === 'session_start').enemyTrainerIdA).to.eq(trainerId)
        expect(payload.events.find(event => event.type === 'pKo').aiSpecies).to.eq(enemySpecies)
        const encounters = JSON.parse(win.localStorage.encounters)
        expect(encounters.Bulbasaur.fragCount).to.eq(1)
        expect(encounters.Bulbasaur.frags[0]).to.include(enemySpecies)
      })

      cy.get('.main-view-tab[data-view="fragsheet"]').click()
      cy.window().should(win => {
        const row = win.gridApi.getDisplayedRowAtIndex(0).data
        expect(row.species).to.eq('Bulbasaur')
        expect(row.totalKo).to.eq(1)
      })

      cy.get('#save-upload-g45').selectFile({
        contents: Cypress.Buffer.from(createGen5BattleLogSave(0, baseVersion, false)),
        fileName: `${slug}-no-logs.sav`, mimeType: 'application/octet-stream',
      }, { force: true })
      cy.get('#main-nav-battle-log').should(defaultBattleLogTab ? 'be.visible' : 'not.be.visible')
      cy.window().should(win => expect(win.isSaveFileBattleLogActive()).to.eq(false))
    })
  }
})

describe('Redux imported save-log gym splits', () => {
  const leaders = ['Cheren', 'Roxie', 'Burgh', 'Elesa', 'Clay', 'Skyla', 'Drayden', 'Marlon', 'Elite 4']
  // Out-of-order battles and shared IDs catch accidental Cascade order/history rules.
  const trainerIds = [160, 259, 156, 157, 154, 153, 158, 155, 159, 523, 19, 52, 38]
  const splitCounts = [1, 1, 1, 2, 1, 2, 2, 2, 1]

  for (const challengeMode of [false, true]) {
    it(`uses Redux splits in both views${challengeMode ? ' in Challenge Mode' : ''}, including after reload`, () => {
      cy.clearLocalStorage()
      cy.viewport(1920, 1080)
      cy.visit(`./index.html?data=bb2redux&gen=8&view=calculator&challengeMode=${challengeMode}`)
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.backup_data && win.backup_data.title).to.exist
        expect(win.eval('initializing')).to.eq(false)
        expect(win.eval('changingSets')).to.eq(false)
        expect(win.eval('npoint_data.order')).to.have.property('292')
        expect(win.localStorage.customLeads).to.exist
      })
      cy.get('#save-upload-g45').selectFile({
        contents: Cypress.Buffer.from(createGen5BattleLogSave(trainerIds, 'BW2')),
        fileName: 'redux-gyms.sav', mimeType: 'application/octet-stream',
      }, { force: true })

      function checkBothViews() {
        cy.get('#main-nav-battle-log').should('be.visible').click()
        cy.get('.battle-log-split-tab[data-battle-log-split="all"]').click()
        cy.get('#battle-log-container .battle-session').should('have.length', trainerIds.length)
        cy.get('#battle-log-container .battle-log-split-section-title').then($titles => {
          expect([...$titles].map(el => el.textContent)).to.deep.eq(leaders.map(leader => `${leader} Split`))
        })
        leaders.forEach((leader, index) => {
          cy.get(`.battle-log-split-tab[data-battle-log-split="${index}"]`).should('have.text', leader).click()
          cy.get('#battle-log-container .battle-session').should('have.length', splitCounts[index])
        })
        cy.get('.battle-log-split-tab[data-battle-log-split="all"]').click()
        cy.get('.main-view-tab[data-view="fragsheet"]').click()
        cy.get('#all-simple-tab').click()
        cy.window().should(win => {
          const row = win.gridApi.getDisplayedRowAtIndex(0).data
          expect(row.species).to.eq('Bulbasaur')
          expect(row.totalKo).to.eq(trainerIds.length)
          expect(Array.from({ length: 9 }, (_, index) => row[`split${index}`])).to.deep.eq(splitCounts)
        })
        leaders.forEach((leader, index) => {
          cy.get(`#split-${index}-tab`).should('have.text', leader).click()
          cy.window().should(win => expect(win.gridApi.getDisplayedRowAtIndex(0).data.totalKo).to.eq(splitCounts[index]))
        })
        cy.get('#all-simple-tab').click()
      }

      checkBothViews()
      cy.reload()
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.eval('initializing')).to.eq(false)
        expect(win.eval('changingSets')).to.eq(false)
        expect(win.eval('npoint_data.order')).to.have.property('292')
        expect(win.isSaveFileBattleLogActive()).to.eq(true)
      })
      checkBothViews()
    })
  }
})
