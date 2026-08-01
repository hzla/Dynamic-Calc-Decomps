const fs = require('fs')
const path = require('path')
const vm = require('vm')

const EXCLUDED_BACKUP_FILES = new Set([
  'compare-move-effects.js',
  'title_to_backup_mappings.js',
])

const EMPTY_MOVE_NAMES = new Set(['', '0', '-', '(No Move)', 'None', '-----'])
const EMPTY_ITEM_NAMES = new Set(['', '-', '(none)', 'None', 'No Item'])
const UNBOUND_MODES = new Set(['insane', 'expert', 'difficult'])

function readContextValue(context, name) {
  return vm.runInContext(`typeof ${name} === 'undefined' ? undefined : ${name}`, context)
}

function getDefinitionNames(value) {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (typeof entry === 'string') return [entry]
      if (entry && typeof entry.name === 'string') return [entry.name]
      return []
    })
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
  }
  return []
}

function addDefinitionNames(target, ...sources) {
  sources.forEach((source) => {
    getDefinitionNames(source).forEach((name) => target.add(name))
  })
}

function evaluateBackupFile(filePath) {
  const context = {
    console: { log() {}, warn() {}, error() {} },
    location: { search: '' },
    normalizeUnboundDataSource(data) { return data },
    pokedex: {},
    window: { location: { search: '' } },
  }
  vm.createContext(context)
  vm.runInContext(fs.readFileSync(filePath, 'utf8'), context, {
    filename: filePath,
    timeout: 30000,
  })
  return context
}

function loadBackupTitleAliases(backupsDir) {
  const mappingPath = path.join(backupsDir, 'title_to_backup_mappings.js')
  const context = {}
  vm.createContext(context)
  vm.runInContext(fs.readFileSync(mappingPath, 'utf8'), context, { filename: mappingPath })
  const backupFiles = readContextValue(context, 'backupFiles') || {}
  const aliases = {}
  Object.entries(backupFiles).forEach(([title, slug]) => {
    if (!aliases[slug]) aliases[slug] = title
  })
  return aliases
}

function looksLikeSetMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).some((setData) => {
    if (!setData || typeof setData !== 'object' || Array.isArray(setData)) return false
    return Array.isArray(setData.moves)
      || Object.prototype.hasOwnProperty.call(setData, 'level')
      || Object.prototype.hasOwnProperty.call(setData, 'item')
  })
}

function getSetSources(context, backupData) {
  const formattedSets = backupData && backupData.formatted_sets
  if (formattedSets && typeof formattedSets === 'object') {
    const modeNames = Object.keys(formattedSets)
    if (modeNames.length && modeNames.every((name) => UNBOUND_MODES.has(name))) {
      return modeNames.map((name) => ({ label: name, sets: formattedSets[name] }))
    }
    return [{ label: '', sets: formattedSets }]
  }

  const globalFormattedSets = readContextValue(context, 'formatted_sets')
  if (globalFormattedSets && typeof globalFormattedSets === 'object') {
    const modeNames = Object.keys(globalFormattedSets)
    if (modeNames.length && modeNames.every((name) => UNBOUND_MODES.has(name))) {
      return modeNames.map((name) => ({ label: name, sets: globalFormattedSets[name] }))
    }
  }

  return [{ label: '', sets: backupData }]
}

function normalizeName(name) {
  return String(name || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

function levenshtein(left, right) {
  if (left === right) return 0
  if (!left.length) return right.length
  if (!right.length) return left.length

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex]
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      )
    }
    previous = current
  }
  return previous[right.length]
}

function buildSuggestionFinder(validNames) {
  const names = Array.from(validNames)
  const normalizedNames = new Map()
  names.forEach((name) => {
    const normalized = normalizeName(name)
    if (normalized && !normalizedNames.has(normalized)) normalizedNames.set(normalized, name)
  })

  return (invalidName) => {
    const normalizedInvalid = normalizeName(invalidName)
    if (!normalizedInvalid) return ''
    if (normalizedNames.has(normalizedInvalid)) return normalizedNames.get(normalizedInvalid)

    let closestName = ''
    let closestDistance = Infinity
    normalizedNames.forEach((name, normalized) => {
      if (Math.abs(normalized.length - normalizedInvalid.length) > 2) return
      const distance = levenshtein(normalizedInvalid, normalized)
      if (distance < closestDistance) {
        closestDistance = distance
        closestName = name
      }
    })
    return closestDistance <= 2 ? closestName : ''
  }
}

function addIssue(issueMap, file, title, kind, name, contextLabel) {
  const key = `${file}\u0000${kind}\u0000${name}`
  let issue = issueMap.get(key)
  if (!issue) {
    issue = { file, title, kind, name, count: 0, examples: [] }
    issueMap.set(key, issue)
  }
  issue.count += 1
  if (contextLabel && issue.examples.length < 3 && !issue.examples.includes(contextLabel)) {
    issue.examples.push(contextLabel)
  }
}

function validateSetSource({
  file,
  title,
  source,
  validSpecies,
  validMoves,
  validItems,
  issueMap,
}) {
  if (!source.sets || typeof source.sets !== 'object') return

  Object.entries(source.sets).forEach(([speciesName, speciesSets]) => {
    if (!looksLikeSetMap(speciesSets)) return
    const sourcePrefix = source.label ? `${source.label}: ` : ''
    if (!validSpecies.has(speciesName)) {
      addIssue(issueMap, file, title, 'species', speciesName, source.label)
    }

    Object.entries(speciesSets).forEach(([setName, setData]) => {
      if (!setData || typeof setData !== 'object') return
      const contextLabel = `${sourcePrefix}${setName}`
      const moves = Array.isArray(setData.moves) ? setData.moves : []
      moves.forEach((moveName) => {
        const normalizedMoveName = typeof moveName === 'string' ? moveName : String(moveName || '')
        if (!EMPTY_MOVE_NAMES.has(normalizedMoveName) && !validMoves.has(normalizedMoveName)) {
          addIssue(issueMap, file, title, 'moves', normalizedMoveName, contextLabel)
        }
      })

      const itemName = typeof setData.item === 'string' ? setData.item : ''
      if (!EMPTY_ITEM_NAMES.has(itemName) && !validItems.has(itemName)) {
        addIssue(issueMap, file, title, 'items', itemName, contextLabel)
      }
    })
  })
}

function validateBackupDataSources({ backupsDir, canonicalNames }) {
  const files = fs.readdirSync(backupsDir)
    .filter((file) => file.endsWith('.js') && !EXCLUDED_BACKUP_FILES.has(file))
    .sort()
  const titleAliases = loadBackupTitleAliases(backupsDir)
  const canonicalSets = {
    species: new Set(canonicalNames.species || []),
    moves: new Set(canonicalNames.moves || []),
    items: new Set(canonicalNames.items || []),
  }
  const issueMap = new Map()
  const loadErrors = []
  const scannedFiles = []

  files.forEach((file) => {
    const filePath = path.join(backupsDir, file)
    try {
      const context = evaluateBackupFile(filePath)
      const backupData = readContextValue(context, 'backup_data')
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('backup_data was not defined as an object')
      }

      const slug = path.basename(file, '.js')
      const title = backupData.title || titleAliases[slug] || slug
      const validSpecies = new Set(canonicalSets.species)
      const validMoves = new Set(canonicalSets.moves)
      const validItems = new Set(canonicalSets.items)
      addDefinitionNames(
        validSpecies,
        backupData.poks,
        readContextValue(context, 'backup_poks'),
        slug === 'unbound' ? readContextValue(context, 'pokedex') : null,
      )
      addDefinitionNames(
        validMoves,
        backupData.moves,
        readContextValue(context, 'backup_moves'),
        readContextValue(context, 'unbound_moves'),
      )
      addDefinitionNames(validItems, backupData.items, readContextValue(context, 'backup_items'))

      getSetSources(context, backupData).forEach((source) => {
        validateSetSource({
          file,
          title,
          source,
          validSpecies,
          validMoves,
          validItems,
          issueMap,
        })
      })
      scannedFiles.push(file)
    } catch (error) {
      loadErrors.push({ file, error: error.message })
    }
  })

  const issues = Array.from(issueMap.values()).sort((left, right) => {
    return left.kind.localeCompare(right.kind)
      || left.file.localeCompare(right.file)
      || left.name.localeCompare(right.name)
  })
  const suggestionFinders = {
    species: buildSuggestionFinder(canonicalSets.species),
    moves: buildSuggestionFinder(canonicalSets.moves),
    items: buildSuggestionFinder(canonicalSets.items),
  }
  issues.forEach((issue) => {
    issue.suggestion = suggestionFinders[issue.kind](issue.name)
  })

  const totals = {}
  ;['species', 'moves', 'items'].forEach((kind) => {
    const kindIssues = issues.filter((issue) => issue.kind === kind)
    totals[kind] = {
      unique: kindIssues.length,
      references: kindIssues.reduce((sum, issue) => sum + issue.count, 0),
    }
  })

  return {
    filesFound: files.length,
    filesScanned: scannedFiles.length,
    loadErrors,
    issues,
    totals,
  }
}

function formatBackupValidationReport(report) {
  const lines = [
    '',
    'Backup data validation report',
    `Files scanned: ${report.filesScanned}/${report.filesFound}`,
    `Unresolved Pokemon: ${report.totals.species.unique} unique, ${report.totals.species.references} references`,
    `Unresolved moves: ${report.totals.moves.unique} unique, ${report.totals.moves.references} references`,
    `Unresolved items: ${report.totals.items.unique} unique, ${report.totals.items.references} references`,
  ]

  if (report.loadErrors.length) {
    lines.push('', `Load errors (${report.loadErrors.length})`)
    report.loadErrors.forEach(({ file, error }) => lines.push(`- ${file}: ${error}`))
  }

  const labels = { species: 'Pokemon', moves: 'moves', items: 'items' }
  ;['species', 'moves', 'items'].forEach((kind) => {
    const kindIssues = report.issues.filter((issue) => issue.kind === kind)
    const totals = report.totals[kind]
    lines.push('', `Invalid ${labels[kind]} (${totals.unique} unique, ${totals.references} references)`)
    if (!kindIssues.length) {
      lines.push('- None')
      return
    }
    kindIssues.forEach((issue) => {
      const suggestion = issue.suggestion ? `; possible canonical match: ${issue.suggestion}` : ''
      const examples = issue.examples.length ? `; e.g. ${issue.examples.join(' | ')}` : ''
      lines.push(`- ${issue.file} [${issue.title}]: ${issue.name} (${issue.count}${examples})${suggestion}`)
    })
  })

  return lines.join('\n')
}

module.exports = {
  formatBackupValidationReport,
  validateBackupDataSources,
}
