const imperiumUrl = './?data=imp13&dmgGen=8&gen=8&types=6&evs=0&view=calculator'
const reportedEnemy = 'Poochyena (Lvl -2 Team Aqua Grunt Petalburg Woods )'

function waitForPreview() {
  cy.window({ timeout: 30000 }).should(win => {
    expect(win.TITLE).to.eq('Emerald Imperium 1.3')
    expect(win.setdex?.Poochyena).to.exist
    expect(win.refresh_next_in).to.be.a('function')
    expect(win.eval('initializing')).to.eq(false)
    expect(win.eval('changingSets')).to.eq(false)
  })
  cy.get('.opposing.trainer-pok-list .trainer-pok.right-side').should('have.length', 1)
    .should($images => {
      expect($images[0].naturalWidth).to.be.greaterThan(0)
      expect($images[0].getBoundingClientRect().width).to.be.greaterThan(0)
    })
}

describe('Imperium trainer previews with a missing imported player', { testIsolation: true }, () => {
  let pageErrors

  beforeEach(() => {
    pageErrors = []
    cy.on('window:before:load', win => {
      win.addEventListener('error', event => pageErrors.push(event.message))
    })
    cy.clearLocalStorage()
    cy.viewport(1440, 1000)
  })

  afterEach(() => {
    expect(pageErrors, 'uncaught page errors').to.deep.eq([])
  })

  for (const randomized of ['0', '1']) {
    it(`keeps enemy sprites clickable and recovers matchup info (randomized ${randomized})`, () => {
      cy.visit(imperiumUrl, {
        onBeforeLoad(win) {
          Object.entries({
            left: 'Noctowl (My Box)',
            right: reportedEnemy,
            customsets: '{}',
            randomized,
            switchInfo: '1',
            hideCurrentAiMon: '1',
            dynamicTypeBug: '1',
            alerted: '1',
            lvlCap: '15',
          }).forEach(([key, value]) => win.localStorage.setItem(key, value))
        },
      })
      waitForPreview()
      cy.window().then(win => {
        expect(win.createPokemon(win.$('#p1')).name).to.eq('')
        expect(win.localStorage.switchInfo).to.eq('1')
      })
      cy.get('.opposing.trainer-pok-list .ai-infos, .opposing.trainer-pok-list .switch-info').should('not.exist')
      cy.get('.opposing.trainer-pok-list .trainer-pok-container').click()
      cy.get('input.opposing.set-selector').should('have.value', reportedEnemy.replace('Poochyena', 'Carvanha'))
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))

      if (randomized === '1') {
        cy.get('#open-menu').click()
        cy.get('#toggle-rand input').should('be.checked')
        cy.get('#toggle-rand .slider').click()
        waitForPreview()
        cy.window().then(win => expect(win.localStorage.randomized).to.eq('0'))
      } else {
        cy.reload()
        waitForPreview()
      }

      cy.window().then(win => {
        win.setdex.Noctowl['My Box'] = {
          level: 15, ability: 'Insomnia', nature: 'Hardy',
          moves: ['Tackle', 'Confusion', 'Peck', 'Hypnosis'],
        }
        win.$('input.player.set-selector').val('Noctowl (My Box)').trigger('change')
      })
      cy.window().should(win => expect(win.eval('changingSets')).to.eq(false))
      cy.get('.opposing.trainer-pok-list .ai-infos').should('have.length', 1).and('be.visible')
      cy.get('.opposing.trainer-pok-list .trainer-pok.right-side').should('have.length', 1)
    })
  }

  it('hashes absent optional Pokemon fields as empty strings', () => {
    cy.visit(imperiumUrl)
    cy.window({ timeout: 30000 }).should(win => expect(win.memoizedCalc).to.be.a('function'))
    cy.window().then(win => {
      const player = win.compressPlayerPok(win.createPokemon(win.$('#p1')))
      const trainer = win.compressTrainerPok(win.createPokemon(reportedEnemy))
      const hash = win.hashPokemonPair([player, trainer])
      const normalizedPlayer = { ...player, a: '', t: [player.t[0], ''] }
      expect(hash).to.eq(win.hashPokemonPair([normalizedPlayer, trainer]))
      expect(win.hashStr(123, undefined)).to.eq(win.hashStr(123, ''))
      expect(win.hashStr(123, null)).to.eq(win.hashStr(123, ''))
    })
  })
})
