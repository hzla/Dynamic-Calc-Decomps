   $(document).on('click', '#show-ai', function() {
        
        let selectedMoveBtn = $(".results-right .visually-hidden:checked + .btn")
        if (selectedMoveBtn.length === 0) {
            alert("Select an AI trainer move first to view its AI logic.")
            return
        }

        if (gameGen == 4) {
            $("#ai-container").toggle()
            if ($('#ai-container:visible').length === 0) {
                return
            }

            let move = selectedMoveBtn.text()
            if (!move) {
                return
            }

            let moveData = moves[move]
            function escapeHtml(text) {
                return String(text)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;")
            }

            if (!moveData || moveData.e_id === undefined || moveData.e_id === null) {
                $("#ai-container").html(`<div class="ai-empty">No AI data found for ${escapeHtml(move)}.</div>`)
                return
            }

            let effectId = moveData.e_id

            let doublesOn = $('#doubles-format').is(':checked')
            let aiInfo = getAiTextByEffectId(effectId, { basic: true, strong: true, expert: true, double: doublesOn, moveType: moves[move].type})
            let aiHtml = ""

            aiHtml += `<div class="ai-header"><h2>${escapeHtml(move)} AI: Effect ${escapeHtml(aiInfo.effectId)}</h2></div>`

            let sectionsRendered = 0
            let sectionOrder = ["basic", "strong", "expert", "doubleEnemy"]
            for (let i = 0; i < sectionOrder.length; i++) {
                let sectionKey = sectionOrder[i]
                if (!aiInfo || !aiInfo.ai || !aiInfo.ai[sectionKey]) {
                    continue
                }

                let section = aiInfo.ai[sectionKey]
                aiHtml += `<div class="ai-section">`
                aiHtml += `<div class="ai-section-title">${escapeHtml(sectionKey.replace("doubleEnemy", "Doubles").toUpperCase())} AI</div>`
                aiHtml += `<div class="ai-lines">`

                if (Array.isArray(section.blocks)) {
                    for (let b = 0; b < section.blocks.length; b++) {
                        let block = section.blocks[b]
                        if (!block || !block.type) {
                            continue
                        }

                        if (block.type === "spacer") {
                            aiHtml += `<div class="ai-spacer"></div>`
                            continue
                        }

                        if (block.type === "line") {
                            let indent = Number.isFinite(block.indent) ? block.indent : 0
                            let text = block.text ? block.text : ""
                            aiHtml += `<div class="ai-line" style="--ai-indent:${indent};">${escapeHtml(text)}</div>`
                        }
                    }
                }

                aiHtml += `</div></div>`
                sectionsRendered += 1
            }

            if (sectionsRendered === 0) {
                aiHtml += `<div class="ai-empty">No AI logic found for this move.</div>`
            }

            $("#ai-container").html(aiHtml)


            return
        }    
        // For game gen 5
        $("#ai-container").toggle()

        if ($('#ai-container:visible').length > 0) {
             var move = $(".results-right .visually-hidden:checked + .btn").text()
            if (move == "") {
                return
            }
            var effect_code = backup_data.moves[move]["e_id"]
            var ai_content = g5Effects[effect_code]

            ai_html = ""
            ai_html += `<h2>${move} AI</h2><br>`

            for (n in ai_content) {
                ai_html += ai_content[n].replace("\t", "&ensp;")
                ai_html += "<br>"
            }
            $("#ai-container").html(ai_html)
        }
   })


