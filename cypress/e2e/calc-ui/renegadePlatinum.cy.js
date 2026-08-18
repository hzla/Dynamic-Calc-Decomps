describe('Renegade Platinum Gen 4 switch preview', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.clearLocalStorage()
  })

  it('uses Renegade Platinum type-chart ordering for Phase 1 immunity flags', () => {
    cy.visit('./index.html?data=renegadeplatinum&view=calculator')

    cy.window().then((win) => {
      const vanilla = win.getGen4Phase1FlagOrderExceptions('Platinum')
      const renegade = win.getGen4Phase1FlagOrderExceptions('Renegade Platinum')

      expect(vanilla.Electric).to.include('Gliscor')
      expect(renegade.Electric).not.to.include('Gliscor')
      expect(renegade.Electric).not.to.include('Gligar')
      expect(renegade.Electric).to.include('Gastrodon')
      expect(renegade.Electric).to.include('Quagsire')
      expect(renegade.Ground).to.include('Crobat')
      expect(renegade.Ground).to.include('Zapdos')
    })
  })
})
