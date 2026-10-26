function ready(title) {
  cy.get('#rom-title', {timeout: 30000}).should('have.text', title)
  cy.window().should(win => {
    expect(win.opposingPreviewReady).to.eq(true)
    expect(win.eval('initializing')).to.eq(false)
    expect(win.eval('changingSets')).to.eq(false)
  })
}

function selectTrainer(id) {
  cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
  cy.window().then(win => win.setOpposing(win.getTrainerSetsById(id)[0].setId))
  cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
}

function calculationTrainers(win) {
  return [...new Set(win.eval('CURRENT_TRAINER_POKS').map(id => win.getSetDataBySetId(id).tr_id))].sort((a, b) => a - b)
}

describe('Pokemon Null preset gauntlets', () => {
  beforeEach(() => cy.viewport(1280, 900))
  for (const [slug, title] of [['null', 'Pokemon Null 1.2'], ['null125', 'Pokemon Null 1.2.5']]) {
    function visit() {
      cy.visit(`/index.html?data=${slug}`, {onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.hideCurrentAiMon = '0'
        win.localStorage.enableAnalytics = '0'
      }})
      ready(title)
    }

    it(`automatically groups and restores consecutive trainers in ${title}`, () => {
      visit()
      selectTrainer(696)
      cy.get('.opposing-team-group').should('have.length', 3)
      cy.get('.opposing-team-remove').should('not.exist')
      cy.get('.opposing-team-heading').should('have.length', 1).and('contain', 'Darian')
      cy.get('.inactive-team .bp-info, .inactive-team .opposing-team-heading').should('not.exist')
      cy.get('.active-team .bp-info').its('length').should('be.gt', 0)
      cy.window().then(win => {
        expect(win.opposingPreviewState.presetGauntletId).to.eq('route-104')
        expect(win.opposingPreviewState.teams.map(team => win.getSetDataBySetId(team.leadSetId).tr_id)).to.deep.eq([319, 696, 114])
        expect(calculationTrainers(win)).to.deep.eq([696])
        win.removeOpposingPreviewTeam(1)
        expect(win.opposingPreviewState.teams).to.have.length(3)
      })
      cy.get('.opposing-team-group[data-team-index="2"] .trainer-pok').first().click()
      cy.get('.opposing-team-heading').should('have.length', 1).and('contain', 'Cindy')
      cy.reload()
      ready(title)
      cy.get('.opposing-team-group').should('have.length', 3)
      cy.get('.opposing-team-heading').should('contain', 'Cindy')
      cy.window().then(win => {
        expect(calculationTrainers(win)).to.deep.eq([114])
        const outside = win.eval('TR_NAMES').find(id => {
          const data = win.getSetDataBySetId(id)
          return !data.partner && !win.getPokemonNullGauntlet(data.tr_id, title)
        })
        win.setOpposing(outside.replace(/\[\d+\]$/, ''))
      })
      cy.get('.opposing-team-group').should('not.exist')
    })

    it(`keeps a gauntlet's partnered battle separate from its next fight in ${title}`, () => {
      visit()
      selectTrainer(631)
      cy.get('.opposing-team-group').should('have.length', 3)
      cy.get('#doubles-format').should('be.checked')
      cy.window().then(win => {
        expect(calculationTrainers(win)).to.deep.eq([631, 754])
        expect([...new Set(win.get_next_in().map(entry => win.getSetDataBySetId(entry[0]).tr_id))].sort((a, b) => a - b)).to.deep.eq([631, 754])
      })
      selectTrainer(753)
      cy.get('#singles-format').should('be.checked')
      cy.window().then(win => {
        expect(calculationTrainers(win)).to.deep.eq([753])
        expect([...new Set(win.get_next_in().map(entry => win.getSetDataBySetId(entry[0]).tr_id))]).to.deep.eq([753])
      })
      cy.get('.opposing-team-remove').should('not.exist')
    })

    it(`keeps long gauntlets compact on desktop and mobile in ${title}`, () => {
      visit()
      selectTrainer(143)
      cy.get('.opposing-team-group').should('have.length', 8)
      cy.get('.opposing-team-heading').should('have.length', 1)
      cy.get('.inactive-team .bp-info').should('not.exist')
      cy.get('.opposing.trainer-pok-list').screenshot(`null-gauntlet-${slug}-desktop`)
      cy.viewport(390, 844)
      cy.get('.panel-wrapper').should('have.class', 'mobile-dual-panel-layout')
      cy.get('.opposing.trainer-pok-list').should('be.visible')
      cy.get('.inactive-team .trainer-preview-section').each($section => {
        cy.wrap($section).children('.trainer-pok-container').each($card => {
          expect($card[0].getBoundingClientRect().width).to.be.at.most($section[0].getBoundingClientRect().width / 3 + 1)
        })
      })
      cy.get('.opposing-preview-footer').scrollIntoView()
      cy.window().then(win => {
        const preview = win.document.querySelector('.opposing.trainer-pok-list').getBoundingClientRect()
        const footer = win.document.querySelector('.opposing-preview-footer').getBoundingClientRect()
        expect(footer.top).to.be.at.least(preview.bottom)
        expect(footer.right).to.be.at.most(390)
        expect(win.document.documentElement.scrollWidth).to.be.at.most(390)
      })
      cy.get('.opposing-team-group').should('have.length', 8)
      cy.get('.opposing.trainer-pok-list').screenshot(`null-gauntlet-${slug}-mobile`)
      cy.window().then(win => {
        win.localStorage.mobileDualPanelLayout = '0'
        win.applyMobileDualPanelPreference()
      })
      cy.get('.mobile-calc-side-tab[data-mobile-calc-side="p2"]').click()
      cy.get('.opposing.trainer-pok-list').should('be.visible')
      cy.get('.inactive-team .bp-info, .inactive-team .opposing-team-heading').should('not.exist')
      cy.get('.opposing.trainer-pok-list').screenshot(`null-gauntlet-${slug}-mobile-ai`)
    })
  }
})
