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
    mastersheetTitle: 'Cascade White Dev August',
    dexData: 'cascadewhitedev',
    trainerSpriteFiles: [
      'cascadewhite2-falkner.png',
      'cascadewhite2-morty.png',
      'cascadewhite2-bugsy.png',
      'cascadewhite2-gardenia.png',
      'cascadewhite2-bess.png',
      'cascadewhite2-roxanne.png',
      'cascadewhite2-flannery.png',
      'cascadewhite2-lt-surge.png',
      'cascadewhite2-nate.png',
      'cascadewhite2-rosa.png',
      'cascadewhite2-victini.png',
      'cosplayer.png',
      'guyinsuit.png',
      'girlinsuit.png',
      'ghostlychild.png',
      'ghostlyman.png',
      'ghostlygent.png',
      'oldstatue.png',
    ],
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
      const trainerSpriteFiles = profile.trainerSpriteFiles || []
      trainerSpriteFiles.forEach((spriteFile) => {
        cy.get(`img[src$="${spriteFile}"]`).first().scrollIntoView().should(($image) => {
          expect($image[0].naturalWidth).to.be.greaterThan(0)
          expect($image[0].naturalHeight).to.be.greaterThan(0)
          expect($image).to.have.css('height', '160px')
          expect($image).to.have.css('object-fit', 'contain')
        })
      })
      cy.get('iframe.dex-window').should(($iframe) => {
        const target = new URL($iframe.prop('src'))
        expect(target.searchParams.get('game')).to.eq(profile.dexData)
      })
    })
  })

  it('resizes and restores the mastersheet sidebar', () => {
    cy.clearLocalStorage()
    cy.visit('./mastersheet.html?data=cascadewhite2')

    cy.get('.master-sidebar').then(($sidebar) => {
      const initialWidth = $sidebar[0].getBoundingClientRect().width
      const pointerId = 1
      const dragDistance = 80

      cy.get('.master-sidebar-resize-handle')
        .should('have.attr', 'role', 'separator')
        .trigger('pointerdown', { button: 0, clientX: initialWidth, pointerId })
        .trigger('pointermove', { clientX: initialWidth + dragDistance, pointerId })
        .trigger('pointerup', { clientX: initialWidth + dragDistance, pointerId })

      cy.get('.master-sidebar').should(($resizedSidebar) => {
        expect($resizedSidebar[0].getBoundingClientRect().width).to.be.closeTo(initialWidth + dragDistance, 1)
      })

      cy.get('.master-sidebar-resize-handle')
        .focus()
        .type('{rightarrow}')

      cy.get('.master-sidebar').should(($resizedSidebar) => {
        expect($resizedSidebar[0].getBoundingClientRect().width).to.be.closeTo(initialWidth + dragDistance + 16, 1)
      })
    })

    cy.get('.master-sidebar').then(($sidebar) => {
      const persistedWidth = $sidebar[0].getBoundingClientRect().width
      cy.reload()
      cy.get('.master-sidebar').should(($restoredSidebar) => {
        expect($restoredSidebar[0].getBoundingClientRect().width).to.be.closeTo(persistedWidth, 1)
      })
    })
  })

  it('renders dodgeable trainer notes as green tags', () => {
    cy.visit('./mastersheet.html?data=cascadewhite2')
    cy.get('.dodgeable-tag')
      .should('have.length.greaterThan', 0)
      .first()
      .should('have.text', 'Dodgeable')
      .and('have.css', 'background-color', 'rgb(70, 158, 98)')
    cy.get('#mastersheet').should('not.contain.text', '(DODGEABLE)')
  })
})
