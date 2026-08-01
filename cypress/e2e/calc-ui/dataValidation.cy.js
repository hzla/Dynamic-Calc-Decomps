// Validates exact Pokemon, move, and item display names across every top-level
// backup data source. Run with validationReportOnly=true to audit without failing.

describe('Backup data name validation', () => {
  before(() => {
    cy.on('uncaught:exception', () => false)
    cy.viewport(1920, 1080)
    cy.visit('./index.html?data=badem&dmgGen=3&gen=3&switchIn=3&types=3&view=calculator')
    cy.window().its('backup_data.title').should('eq', 'Emerald but Bad')
  })

  it('uses canonical or explicitly defined custom names in every backup', () => {
    cy.window().then((win) => {
      const canonicalNames = {
        species: Object.keys(win.calc.SPECIES[8] || {}),
        moves: Object.keys(win.calc.MOVES[8] || {}),
        items: win.calc.ITEMS[8] || [],
      }

      cy.task('validateBackupDataSources', canonicalNames).then((report) => {
        const hasIssue = (file, kind, name) => report.issues.some((issue) => (
          issue.file === file && issue.kind === kind && issue.name === name
        ))
        const invalidNameCount = report.totals.species.unique
          + report.totals.moves.unique
          + report.totals.items.unique
        const totalErrors = invalidNameCount + report.loadErrors.length
        const reportOnly = ['1', 'true'].includes(String(Cypress.env('validationReportOnly')).toLowerCase())

        expect(canonicalNames.species).to.include('Ting-Lu')
        expect(canonicalNames.species).not.to.include('Tinglu')
        expect(canonicalNames.species).to.include('Ho-Oh')
        expect(canonicalNames.species).not.to.include('Ho-oh')
        expect(canonicalNames.moves).to.include('Vise Grip')
        expect(canonicalNames.moves).not.to.include('Vice Grip')
        expect(canonicalNames.moves).to.include('Self-Destruct')
        expect(canonicalNames.moves).not.to.include('Selfdestruct')
        expect(canonicalNames.moves).not.to.include('Tussle')

        expect(hasIssue('imp.js', 'moves', 'Vice Grip')).to.eq(true)
        expect(hasIssue('imp.js', 'moves', 'Self Destruct')).to.eq(true)
        expect(hasIssue('ax.js', 'moves', 'Tussle')).to.eq(false)
        expect(hasIssue('aetherwhite.js', 'moves', '0')).to.eq(false)
        expect(report.filesScanned + report.loadErrors.length).to.eq(report.filesFound)
        if (!reportOnly) {
          expect(totalErrors, 'backup validation errors; see the terminal report').to.eq(0)
        }
      })
    })
  })
})
