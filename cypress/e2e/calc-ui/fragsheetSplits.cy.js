const unovaLeaders = ['Cheren', 'Roxie', 'Burgh', 'Elesa', 'Clay', 'Skyla', 'Drayden', 'Marlon', 'Elite 4']
const kantoLeaders = ['Brock', 'Misty', 'Lt. Surge', 'Erika', 'Koga', 'Sabrina', 'Blaine', 'Giovanni', 'Elite 4']

const profiles = [
  {
    name: 'Blaze Black 2 Redux',
    query: 'data=bb2redux&gen=8&types=6',
    caps: [13, 21, 29, 36, 45, 52, 61, 64, 74],
    leaders: unovaLeaders,
  },
  {
    name: 'Blaze Black 2 Redux Challenge Mode',
    query: 'data=bb2redux&gen=8&types=6&challengeMode=true',
    caps: [13, 21, 29, 36, 45, 52, 61, 64, 74],
    leaders: unovaLeaders,
  },
  ...[['frd', 'Hard', 16], ['frdnormal', 'Normal', 15]].map(([slug, mode, brockCap]) => ({
    name: `Fire Red Deluxe ${mode} Mode`,
    query: `data=${slug}&gen=8&dmgGen=3&types=3&switchIn=3`,
    caps: [brockCap, 23, 27, 34, 43, 47, 49, 51, 100],
    leaders: kantoLeaders,
  })),
]

describe('Fragsheet game-specific level splits', () => {
  for (const profile of profiles) {
    it(`uses the correct splits and filters for ${profile.name}`, () => {
      cy.clearLocalStorage()
      cy.viewport(1920, 1080)
      cy.visit(`./index.html?${profile.query}&view=fragsheet`)
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.backup_data && win.backup_data.title).to.be.a('string')
        expect(win.eval('initializing')).to.eq(false)
        expect(win.gridApi).to.exist
        expect(win.getFragsheetSplitData(win.TITLE).lvls).to.deep.eq(profile.caps)
      })
      cy.get('.main-view-tab[data-view="fragsheet"]').should('be.visible').and('have.class', 'active')
      profile.leaders.forEach((leader, index) => {
        cy.get(`#split-${index}-tab`).should('be.visible').and('have.text', leader)
      })

      const levels = profile.caps.flatMap((cap, index) => [index ? profile.caps[index - 1] + 1 : 1, cap])
      cy.window().then(win => {
        win.encounters = {
          Bulbasaur: {
            setData: { 'My Box': {} }, alive: true,
            frags: levels.map((level, index) => `Pidgey (Lvl ${level} Test Trainer ${index} )`),
            fragCount: levels.length,
          },
        }
        win.refreshTables()
        const row = win.gridApi.getDisplayedRowAtIndex(0).data
        expect(row.totalKo).to.eq(levels.length)
        expect(Array.from({ length: 9 }, (_, index) => row[`split${index}`])).to.deep.eq(Array(9).fill(2))
      })
      cy.get('#split-8-tab').click()
      cy.window().then(win => {
        const row = win.gridApi.getDisplayedRowAtIndex(0).data
        expect(row.totalKo).to.eq(2)
        expect(row.split7).to.eq(0)
        expect(row.split8).to.eq(2)
      })
    })
  }
})
