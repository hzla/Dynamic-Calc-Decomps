const GEN4_AI_FLAG_RENDER_ORDER = {
    ai1: { option: "basic", title: "BASIC AI" },
    ai2: { option: "strong", title: "EVALUATE ATKS AI" },
    ai3: { option: "expert", title: "EXPERT AI" },
    ai4: { option: "setupFirstTurn", title: "1ST TURN SETUP AI" },
    ai5: { option: "risky", title: "RISKY AI" },
    ai6: { option: "damagePriority", title: "PRIO DAMAGE AI" },
    ai7: { option: "batonPass", title: "BATON PASS AI" },
    ai9: { option: "checkHp", title: "CHECK HP AI" },
    ai10: { option: "weather", title: "WEATHER AI" },
    ai11: { option: "harrassment", title: "HARASS AI" }
}

const GEN4_DOUBLES_AI_RENDER_ORDER = [
    { option: "doubleEnemy", title: "DOUBLES ENEMY AI" },
    { option: "doubleAlly", title: "DOUBLES ALLY AI" }
]

function escapeAiHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function getVisibleGen4AiSections() {
    let visibleSections = []

    $('#ai-tags .ai-tag:visible').each(function() {
        let sectionConfig = GEN4_AI_FLAG_RENDER_ORDER[this.id]
        if (sectionConfig) {
            visibleSections.push(sectionConfig)
        }
    })

    return visibleSections
}

function shouldRenderGen4DoublesAi() {
    return $('#doubles-format').is(':checked') || $('#ai8:visible').length > 0
}

function renderAiBlocks(blocks) {
    let html = ""

    if (!Array.isArray(blocks)) {
        return html
    }

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i]
        if (!block || !block.type) {
            continue
        }

        if (block.type === "spacer") {
            html += `<div class="ai-spacer"></div>`
            continue
        }

        if (block.type === "line") {
            let indent = Number.isFinite(block.indent) ? block.indent : 0
            let text = block.text ? block.text : ""
            html += `<div class="ai-line" style="--ai-indent:${indent};">${escapeAiHtml(text)}</div>`
            continue
        }

        if (block.type === "list") {
            let title = block.title ? `<div class="ai-list-title">${escapeAiHtml(block.title)}</div>` : ""
            let items = Array.isArray(block.items) ? block.items : []
            let itemHtml = items.map(item => `<li>${escapeAiHtml(item)}</li>`).join("")
            html += `<div class="ai-list-block">${title}<ul class="ai-list">${itemHtml}</ul></div>`
        }
    }

    return html
}

function getAiHeaderLinkHtml() {
    if (TITLE !== "Platinum Kaizo") {
        return ""
    }

    return `<a class="ai-header-link" href="https://gist.github.com/hzla/2af68d802a571d6f1ba5e061981a36cc" target="_blank" rel="noopener noreferrer">Click Here to see detailed PK AI changes</a>`
}

const PLATINUM_KAIZO_MOVE_AI_BASE_URL = "https://bparkpk.github.io/PKMoveScoring/"

// Exact PKMoveScoring filenames where calculator spelling or casing differs.
const PLATINUM_KAIZO_MOVE_AI_PAGE_NAMES = {
    "Feint Attack": "FaintAttack",
    "High Jump Kick": "HiJumpKick",
    "Judgment": "Judgement",
    "Self-Destruct": "Selfdestruct",
    "Smelling Salts": "SmellingSalt",
    "Smokescreen": "SmokeScreen",
    "Soft-Boiled": "Softboiled",
    // The charging move and PK's separate Solar-Beam move have different AI.
    "Solar Beam": "SolarBeam2",
    "SolarBeam": "SolarBeam2",
    "Solar-Beam": "SolarBeam",
    "U-turn": "U-turn",
    "Vise Grip": "ViceGrip"
}

function formatPlatinumKaizoMoveAiPageName(moveName) {
    let normalizedMoveName = String(moveName || "").trim()
    if (typeof normalizedMoveName.normalize === "function") {
        normalizedMoveName = normalizedMoveName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    }

    if (Object.prototype.hasOwnProperty.call(PLATINUM_KAIZO_MOVE_AI_PAGE_NAMES, normalizedMoveName)) {
        return PLATINUM_KAIZO_MOVE_AI_PAGE_NAMES[normalizedMoveName]
    }

    return normalizedMoveName
        .replace(/['\u2019]/g, "")
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(function(part) {
            return part.charAt(0).toUpperCase() + part.slice(1)
        })
        .join("")
}

function getPlatinumKaizoMoveAiUrl(moveName) {
    let pageName = formatPlatinumKaizoMoveAiPageName(moveName)
    return pageName ? PLATINUM_KAIZO_MOVE_AI_BASE_URL + "move" + pageName + ".html" : ""
}

function openPlatinumKaizoMoveAiPage(moveName) {
    let url = getPlatinumKaizoMoveAiUrl(moveName)
    if (!url) {
        return false
    }

    let openedWindow = window.open(url, "_blank", "noopener,noreferrer")
    if (openedWindow) {
        openedWindow.opener = null
    }
    return true
}

if (typeof window !== "undefined") {
    window.getPlatinumKaizoMoveAiUrl = getPlatinumKaizoMoveAiUrl
}

// One configured mask drives both the badges and Gen V reference. CSS visibility
// is not state: the responsive calculator deliberately hides these badges.
window.configuredTrainerAiMask = null
function syncConfiguredTrainerAi(ai, generation) {
    let valid = ai !== null && ai !== undefined && ai !== "" && Number.isInteger(Number(ai)) && Number(ai) >= 0
    window.configuredTrainerAiMask = valid && (generation == 4 || generation == 5) ? Number(ai) : null
    $('#ai-container').hide().empty().removeClass('gen5-ai-panel').removeAttr('role aria-labelledby')
    if (generation != 4 && generation != 5) {
        $('#ai5').text('Risky').removeAttr('title')
        $('#ai6').text('Prio Damage').removeAttr('title')
        return
    }
    Gen5AiReference.FLAGS.forEach(function(flag, index) {
        let id = 'ai' + (index + 1)
        if (!document.getElementById(id)) $('#ai-tags').append($('<div>').attr('id', id).addClass('ai-tag'))
        let label = generation == 4 && index === 4 ? 'Risky' : generation == 4 && index === 5 ? 'Prio Damage' : flag.badge
        let title = generation == 4 && index === 4 ? 'Risky AI' : generation == 4 && index === 5 ? 'Prioritize Damage AI' : flag.title
        if (generation == 5 && index === 4) title += ': favors damaging moves on turn one and may favor status moves against a weakened target.'
        if (generation == 5 && index === 5) title += ': favors Fusion Flare for Reshiram and Fusion Bolt for Zekrom on turn one.'
        $('#' + id).text(label).attr('title', title).toggle(valid && !!(Number(ai) & flag.bit))
    })
}

function gen5AiConditionText(condition) {
    let text = condition.text
    if (condition.negated) {
        if (text.includes('predicts no damage')) text = text.replace('predicts no damage', 'predicts some damage')
        else if (text.includes(' has not ')) text = text.replace(' has not ', ' has ')
        else if (text.includes(' knows ')) text = text.replace(' knows ', ' does not know ')
        else if (text.includes(' estimates ')) text = text.replace(' estimates ', ' does not estimate ')
        else if (text.includes(' gives ')) text = text.replace(' gives ', ' does not give ')
        else if (text.includes(' have ')) text = text.replace(' have ', ' do not have ')
        else if (text.includes(' is below ')) text = text.replace(' is below ', ' is at least ')
        else if (text.includes(' is above ')) text = text.replace(' is above ', ' is at most ')
        else if (text.includes(' is not ')) text = text.replace(' is not ', ' is ')
        else if (text.includes(' is ')) text = text.replace(' is ', ' is not ')
        else if (text.includes(' are ')) text = text.replace(' are ', ' are not ')
        else if (text.includes(' has ')) text = text.replace(' has ', ' does not have ')
        else if (text.includes(' knows ')) text = text.replace(' knows ', ' does not know ')
        else if (text.includes(' holds ')) text = text.replace(' holds ', ' does not hold ')
        else if (text.includes(' matches ')) text = text.replace(' matches ', ' does not match ')
        else if (text.includes(' assigns ')) text = text.replace(' assigns ', ' does not assign ')
        else if (text.includes(' ties or beats ')) text = text.replace(' ties or beats ', ' does not tie or beat ')
        else throw new Error('Missing English negation: ' + text)
    }
    return text
}

function renderGen5AiCondition(condition) {
    if (condition.any || condition.all) {
        let conditions = condition.any || condition.all
        let label = condition.any ? (condition.negated ? 'none of these apply' : 'any of these apply') : (condition.negated ? 'at least one of these does not apply' : 'all of these apply')
        return label + ':<ul class="ai-conditions">' + conditions.map(function(child) {
            return '<li>' + renderGen5AiCondition(child) + '</li>'
        }).join('') + '</ul>'
    }
    let text = escapeAiHtml(gen5AiConditionText(condition))
    if (condition.items && condition.items.length) {
        if (condition.items.length <= 3) text += ' ' + condition.items.map(escapeAiHtml).join(' / ')
        else text += '<details class="ai-name-list"><summary>See the list (' + condition.items.length + ')</summary><ul>' + condition.items.map(item => '<li>' + escapeAiHtml(item) + '</li>').join('') + '</ul></details>'
    }
    return text
}

function gen5AiScoreHtml(delta, sentenceStart) {
    let verb = delta > 0 ? 'add' : 'subtract'
    if (sentenceStart) verb = verb.charAt(0).toUpperCase() + verb.slice(1)
    return '<span class="ai-score ' + (delta > 0 ? 'ai-score-up' : 'ai-score-down') + '">' + verb + ' ' + Math.abs(delta) + (Math.abs(delta) === 1 ? ' point' : ' points') + '</span>'
}

function renderGen5AiRules(rules) {
    return rules.map(function(rule) {
        if (rule.type === 'end') return '<p class="ai-end">No further changes from this flag.</p>'
        if (rule.type === 'score') return '<p class="ai-outcome">' + gen5AiScoreHtml(rule.delta, true) + '.</p>'
        let heading
        if (rule.type === 'chance') {
            let chance = Gen5AiReference.chancePercent(rule.numerator, rule.denominator)
            let shared = rule.shared ? ' <span class="ai-shared-roll" title="This check reuses the shared roll. Chances shown here account for earlier checks in this flag.">shared roll</span>' : ''
            if (rule.yes.length === 1 && rule.yes[0].type === 'score' && rule.no.length === 0) {
                return '<p class="ai-outcome">' + chance + ' chance to ' + gen5AiScoreHtml(rule.yes[0].delta) + '.' + shared + '</p>'
            }
            heading = chance + ' chance:' + shared
        } else heading = 'If ' + renderGen5AiCondition(rule.condition) + (rule.condition.any || rule.condition.all || rule.condition.items && rule.condition.items.length > 3 ? '' : ':')
        let html = '<div class="ai-rule"><div class="ai-condition">' + heading + '</div><div class="ai-branch">' + renderGen5AiRules(rule.yes) + '</div>'
        if (rule.no.length) html += '<div class="ai-otherwise">Otherwise:</div><div class="ai-branch">' + renderGen5AiRules(rule.no) + '</div>'
        return html + '</div>'
    }).join('')
}

function renderGen5AiReference(moveName, focusMove) {
    moveName = moveName && moveName !== '(No Move)' ? moveName : ''
    let loadedMove = typeof moves !== 'undefined' && moves ? moves[moveName] : null
    let exportedMove = typeof backup_data !== 'undefined' && backup_data.moves ? backup_data.moves[moveName] : null
    let moveData = Object.assign({}, Gen5AiData.moves[moveName] || {}, exportedMove || {}, loadedMove || {})
    let info = moveName ? Gen5AiReference.describeMove({ moveName: moveName, moveData: moveData,
        aiMask: window.configuredTrainerAiMask, battleFormat: $('#doubles-format').is(':checked') ? 'Doubles' : 'Singles' }) : {
        flags: Gen5AiReference.FLAGS.filter(flag => window.configuredTrainerAiMask & flag.bit), sections: [], notices: []
    }
    let moveNames = Object.keys(Gen5AiData.moves)
    if (moveName && !moveNames.includes(moveName)) moveNames.push(moveName)
    let options = '<option value=""' + (!moveName ? ' selected' : '') + '>Select a move</option>'
    options += moveNames.sort((a, b) => a.localeCompare(b)).map(function(name) {
        return '<option value="' + escapeAiHtml(name) + '"' + (name === moveName ? ' selected' : '') + '>' + escapeAiHtml(name) + '</option>'
    }).join('')
    let html = '<div class="ai-header"><h2 id="gen5-ai-title" class="visually-hidden">' + escapeAiHtml(moveName || 'Move') + ' AI</h2><div class="ai-move-title"><select id="gen5-ai-move" aria-label="Move for AI explanation">' + options + '</select></div><button type="button" class="ai-close" aria-label="Close AI reference">×</button></div>'
    html += '<p class="ai-meta">' + (info.flags.length ? 'Enabled: ' + info.flags.map(flag => escapeAiHtml(flag.badge)).join(', ') : 'No scoring flags') + '</p>'
    if (moveName) html += '<details class="ai-reading-notes"><summary>How to read these checks</summary><p>The user is the trainer’s Pokémon; the target is its opponent. Read each flag from top to bottom. Score changes add together, and a score cannot fall below zero. “No further changes” ends that flag’s checks; the other enabled flags still apply.</p><p>A chance applies once its preceding conditions are met. Checks marked “shared roll” reuse one random number, across moves and flags in the same decision, so their outcomes are linked. Other chance checks use fresh rolls.</p><p>These are possible conditions, not a reading of the current battle. An opponent’s moves count only after being revealed. For an unrevealed ability, the AI can pick from the species’ nonempty ability slots with equal chances per slot; repeated abilities therefore have more weight. The AI recognizes Shadow Tag, Magnet Pull and Arena Trap even before they are revealed.</p><p>HP percentages are rounded down. Speed checks include stat stages, field effects and Trick Room, but do not include move priority. Damage checks use the game’s AI estimate, which may differ from the calculator’s displayed damage.</p></details>'
    info.notices.forEach(notice => { html += '<p class="ai-empty">' + escapeAiHtml(notice) + '</p>' })
    info.sections.forEach(function(section) {
        html += '<section class="ai-section" data-ai-flag="' + escapeAiHtml(section.key) + '"><h3 class="ai-section-title">' + escapeAiHtml(section.title) + '</h3>'
        html += section.rules.length ? renderGen5AiRules(section.rules) : '<p class="ai-empty">' + escapeAiHtml(section.empty) + '</p>'
        html += '</section>'
    })
    $('#ai-container').addClass('gen5-ai-panel').attr({ role: 'dialog', 'aria-labelledby': 'gen5-ai-title' }).html(html).show().scrollTop(0)
    $(focusMove || !moveName ? '#gen5-ai-move' : '#ai-container .ai-close').trigger('focus')
}

$(document).on('change', '#gen5-ai-move', function() {
    renderGen5AiReference($(this).val(), true)
})
$(document).on('click', '#ai-container .ai-close', function() {
    $('#ai-container').hide()
    $('#show-ai').trigger('focus')
})
$(document).on('keydown', function(event) {
    if (event.key === 'Escape') $('#ai-container').hide()
})
$(document).on('keydown', '#show-ai', function(event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $(this).trigger('click') }
})
$(document).on('change', '.result-move, #p2 .move-selector, #p2 .set-selector, #singles-format, #doubles-format', function() {
    if (gameGen == 5) $('#ai-container').hide().empty()
})

$(document).on('click', '#show-ai', function(event) {
        
        let selectedMoveBtn = $(".results-right .visually-hidden:checked + .btn")
        if (selectedMoveBtn.length === 0 && gameGen != 5) {
            alert("Select an AI trainer move first to view its AI logic.")
            return
        }

        let move = (gameGen == 5 ? selectedMoveBtn.attr('title') || selectedMoveBtn.text() : selectedMoveBtn.text()).trim()
        if (TITLE === "Platinum Kaizo") {
            event.preventDefault()
            $("#ai-container").hide().empty()
            openPlatinumKaizoMoveAiPage(move)
            return
        }

        if (gameGen == 4) {
            $("#ai-container").toggle()
            if ($('#ai-container:visible').length === 0) {
                return
            }

            if (!move) {
                return
            }

            let moveData = moves[move]
            if (!moveData || moveData.e_id === undefined || moveData.e_id === null) {
                $("#ai-container").html(`<div class="ai-empty">No AI data found for ${escapeAiHtml(move)}.</div>`)
                return
            }

            let visibleSections = getVisibleGen4AiSections()
            let sectionsToRender = visibleSections.slice()
            let aiQueryOptions = {
                moveName: move,
                moveType: moveData.type
            }

            if (shouldRenderGen4DoublesAi()) {
                aiQueryOptions.double = true
                aiQueryOptions.doubleEnemy = true
                aiQueryOptions.doubleAlly = true
                sectionsToRender = sectionsToRender.concat(GEN4_DOUBLES_AI_RENDER_ORDER)
            }

            for (let i = 0; i < visibleSections.length; i++) {
                aiQueryOptions[visibleSections[i].option] = true
            }

            let aiInfo = getAiTextByEffectId(moveData.e_id, aiQueryOptions)
            let aiHtml = ""

            aiHtml += `<div class="ai-header"><h2>${escapeAiHtml(move)} AI: Effect ${escapeAiHtml(aiInfo.effectId)}</h2>${getAiHeaderLinkHtml()}</div>`

            let sectionsRendered = 0
            for (let i = 0; i < sectionsToRender.length; i++) {
                let sectionConfig = sectionsToRender[i]
                let section = aiInfo && aiInfo.ai ? aiInfo.ai[sectionConfig.option] : null
                if (!section) {
                    continue
                }

                aiHtml += `<div class="ai-section">`
                aiHtml += `<div class="ai-section-title">${escapeAiHtml(sectionConfig.title)}</div>`
                aiHtml += `<div class="ai-lines">${renderAiBlocks(section.blocks)}</div>`
                aiHtml += `</div>`
                sectionsRendered += 1
            }

            if (sectionsRendered === 0) {
                aiHtml += `<div class="ai-empty">No AI logic found for the flags visible on this trainer set.</div>`
            }

            $("#ai-container").html(aiHtml)
            return
        }    
        if (gameGen != 5) return
        if ($('#ai-container:visible').length) $('#ai-container').hide()
        else renderGen5AiReference(move)
   })
