function makeSave(win, generation, game, deadOnly = false) {
  const variant = win.eval(`G${generation}_VARIANTS.${game}`)
  const bytes = new Uint8Array(variant.saveSize)
  const view = new DataView(bytes.buffer)

  function writeMon(offset, species, party = false) {
    const mon = new Uint8Array(party ? 0x104 : 0xE8)
    const data = new DataView(mon.buffer)
    data.setUint32(0, 123, true) // Identity block order.
    data.setUint16(8, species, true)
    data.setUint32(0x10, 8000, true)
    data.setUint16(0xDA, 7, true)
    if (party) mon[0xEC] = 20
    data.setUint16(6, win.g67Add16(mon.subarray(8, 0xE8)), true)
    win.g67CryptArray(mon.subarray(8, 0xE8), 123)
    if (party) win.g67CryptArray(mon.subarray(0xE8), 123)
    bytes.set(mon, offset)
  }

  if (!deadOnly) {
    writeMon(variant.requiredBlocks.party.offset, 1, true)
    bytes[variant.requiredBlocks.party.offset + 6 * 0x104] = 1
    writeMon(variant.requiredBlocks.boxes.offset + 179 * 0xE8, 2)
  }
  writeMon(variant.requiredBlocks.boxes.offset + 180 * 0xE8, 4)
  view.setUint32(variant.metadataOffset + 0x10, 0x42454546, true)
  for (const block of Object.values(variant.requiredBlocks)) {
    const entry = variant.metadataOffset + 0x14 + block.id * 8
    view.setUint32(entry, block.length, true)
    view.setUint16(entry + 4, block.id, true)
    view.setUint16(entry + 6, variant.checksum(bytes.subarray(block.offset, block.offset + block.length)), true)
  }
  return Cypress.Buffer.from(bytes)
}

for (const [generation, game, url] of [
  [6, 'XY', '/index.html?data=ax&gen=8&dmgGen=6&view=calculator'],
  [7, 'USUM', '/index.html?dev=1&gen=7&dmgGen=7&baseGame=g7&view=calculator'],
]) {
  describe(`Gen ${generation} dead-box save uploads`, () => {
    it('imports party and box 6 as living, box 7 as dead, and handles a dead-only reimport', () => {
      cy.visit(url, { onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.enableAnalytics = '0'
        win.localStorage.autoImportMegas = '0'
      } })
      cy.window({ timeout: 30000 }).should(win => {
        expect(win.eval('DEFAULTS_LOADED')).to.eq(true)
        expect(win.eval('initializing')).to.eq(false)
        expect(win.baseGame).to.eq(`g${generation}`)
      })
      cy.window().then(win => {
        cy.get('#save-upload').selectFile({
          contents: makeSave(win, generation, game), fileName: 'living-and-dead.sav',
        }, { force: true })
      })
      cy.window().should(win => {
        const living = JSON.parse(win.localStorage.customsets)
        expect(living).to.have.all.keys('Bulbasaur', 'Ivysaur')
        expect(living.Bulbasaur['My Box'].level).to.eq(20)
        expect(JSON.parse(win.localStorage.deadMons)).to.have.length(1)
        expect(JSON.parse(win.localStorage.deadMons)[0]).to.include({
          speciesName: 'Charmander', box: 7, slot: 1, source: 'save-file',
        })
        expect(JSON.parse(win.localStorage.encounters).Charmander.alive).to.eq(false)
      })
      cy.window().then(win => {
        cy.get('#save-upload').selectFile({
          contents: makeSave(win, generation, game, true), fileName: 'dead-only.sav',
        }, { force: true })
      })
      cy.window().should(win => {
        expect(JSON.parse(win.localStorage.customsets)).to.deep.eq({})
        expect(JSON.parse(win.localStorage.deadMons)).to.have.length(1)
      })
    })
  })
}
