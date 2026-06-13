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

function formatPlatinumKaizoMoveAiPageName(moveName) {
    let normalizedMoveName = String(moveName || "").trim()
    if (typeof normalizedMoveName.normalize === "function") {
        normalizedMoveName = normalizedMoveName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
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

$(document).on('click', '#show-ai', function(event) {
        
        let selectedMoveBtn = $(".results-right .visually-hidden:checked + .btn")
        if (selectedMoveBtn.length === 0) {
            alert("Select an AI trainer move first to view its AI logic.")
            return
        }

        let move = selectedMoveBtn.text().trim()
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
        // For game gen 5
        $("#ai-container").toggle()

        if ($('#ai-container:visible').length > 0) {
             var gen5Move = $(".results-right .visually-hidden:checked + .btn").text()
            if (gen5Move == "") {
                return
            }
            var effect_code = backup_data.moves[gen5Move]["e_id"]
            var ai_content = g5Effects[effect_code]

            ai_html = ""
            ai_html += `<div class="ai-header"><h2>${gen5Move} AI</h2>${getAiHeaderLinkHtml()}</div><br>`

            for (n in ai_content) {
                ai_html += ai_content[n].replace("\t", "&ensp;")
                ai_html += "<br>"
            }
            $("#ai-container").html(ai_html)
        }
   })
