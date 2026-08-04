const cascadeProfiles = [
  {
    calcData: 'casc',
    calcTitle: 'Cascade White',
    mastersheetData: 'cascadewhite',
    mastersheetTitle: 'Cascade White',
    dexData: 'cascadewhite',
  },
  {
    calcData: 'casc2',
    calcTitle: 'Cascade White Dev',
    mastersheetData: 'cascadewhite2',
    mastersheetTitle: 'Cascade White Dev',
    dexData: 'cascadewhitedev',
  },
]

describe('Cascade White mastersheet routing', () => {
  cascadeProfiles.forEach((profile) => {
    it(`links ${profile.calcTitle} to its corresponding mastersheet`, () => {
      cy.clearLocalStorage()
      cy.visit(`./index.html?data=${profile.calcData}&view=calculator`)
      cy.get('#rom-title').should('have.text', profile.calcTitle)
      cy.get('#ms-link a').should(($link) => {
        const target = new URL($link.prop('href'))
        expect(target.pathname).to.match(/\/mastersheet$/)
        expect(target.searchParams.get('data')).to.eq(profile.mastersheetData)
      })
    })

    it(`loads the ${profile.mastersheetTitle} data and dex routes`, () => {
      // Cypress's internal file server does not resolve clean extensionless URLs.
      cy.visit(`./mastersheet.html?data=${profile.mastersheetData}`)
      cy.window().should((win) => {
        expect(win.mastersheetDataSource).to.eq(profile.mastersheetData)
        expect(win.gameDataSlug).to.eq(profile.calcData)
        expect(win.dexDataSlug).to.eq(profile.dexData)
      })
      cy.get('#mastersheet h1').first().should('have.text', profile.mastersheetTitle)
      cy.get('#mastersheet img').first().should('have.css', 'image-rendering', 'pixelated')
      cy.get('iframe.dex-window').should(($iframe) => {
        const target = new URL($iframe.prop('src'))
        expect(target.searchParams.get('game')).to.eq(profile.dexData)
      })
    })
  })
})
