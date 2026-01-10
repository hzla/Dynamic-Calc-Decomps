/**
 * Convert mastersheet JSON (masterData + trainers + encounters) into HTML.
 *
 * Assumptions / conventions (adjust in the helpers below if yours differ):
 * - masterData elements:
 *   - { tag: "h1"|"h3"|"h4"|"p", content, content_parts? }
 *   - { tag: "li", content, content_parts? }   // auto-grouped into <ul>...</ul>
 *   - { tag: "br" }
 *   - { tag: "trainer", id, class, notes? }
 *   - { tag: "encounter", id }
 * - trainers and encounters are arrays indexed by id (trainers[id], encounters[id]).
 *   If yours are 1-indexed or use different keys, change getTrainer/getEncounter.
 *
 * Usage:
 *   const html = renderMasterData(masterData, trainers, encounters);
 *   document.querySelector("#content-container").innerHTML = renderMasterData(masterData, trainersById, encountersById);
 */

function renderMasterData(masterData, trainersById, encountersById) {
  let html = "";
  let ulOpen = false;

  const closeUlIfOpen = () => {
    if (ulOpen) {
      html += `</ul>\n`;
      ulOpen = false;
    }
  };

  for (let i = 0; i < masterData.length; i++) {
    const el = masterData[i];
    const tag = el?.tag;

    // list grouping
    if (tag !== "li") closeUlIfOpen();

    switch (tag) {
      case "br":
        html += `<br>\n`;
        break;

      case "h1":
      case "h3":
      case "h4":
      case "p":
        html += `<${tag}>${renderInlineParts(el)}</${tag}>\n`;
        break;

      case "li":
        if (!ulOpen) {
          ulOpen = true;
          html += `<ul>\n`;
        }
        html += `<li>${renderInlineParts(el)}</li>\n`;
        break;

      case "trainer": {
        const trainer = getTrainer(trainersById, el.id);
        html += renderTrainerCard(el, trainer, i);
        break;
      }

      case "encounter": {
        const enc = getEncounter(encountersById, el.id);
        html += renderEncounterCard(el, enc);
        break;
      }

      default: {
        // If you have other custom tags, handle them here.
        // For now, ignore unknown tags.
        break;
      }
    }
  }

  closeUlIfOpen();
  return html;
}

/* ----------------------------- inline rendering ---------------------------- */

function renderInlineParts(el) {
  const parts = Array.isArray(el.content_parts) ? el.content_parts : null;

  if (!parts) return escapeHtml(el.content ?? "");

  return parts
    .map((p) => {
      if (p?.type === "text") return escapeHtml(p.text ?? "");
      if (p?.type === "link") {
        const href = sanitizeUrl(p.href ?? "#");
        const text = escapeHtml(p.text ?? href);
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      // fallback
      return escapeHtml(p?.text ?? "");
    })
    .join("");
}

/* ----------------------------- trainer rendering --------------------------- */

function renderTrainerCard(masterEl, trainer, elementIndex) {
  // masterEl.class is your mastersheet-specific grouping class (e.g. "mand")
  const msClass = masterEl.class ? escapeAttr(masterEl.class) : "";
  const notes = Array.isArray(masterEl.notes) ? masterEl.notes : [];

  // You can tweak these to match your exact naming convention
  const dataIndex = masterEl.id ?? "";
  const dataElement = ""; // in your sample it was empty; you can set to elementIndex if you want.

  const trainerDisplayName = buildTrainerDisplayName(trainer);
  const trainerSpriteSrc = buildTrainerSpriteSrc(trainer);

  let html = "";
  html += `<div class="expanded-field filterable ms-trainer ${msClass} " data-index="${escapeAttr(
    String(dataIndex)
  )}" data-element="${escapeAttr(String(dataElement))}" >\n`;
  html += `  <div class="expanded-field-main">\n`;
  html += `    <div class="trainer-name">`;
  html += `<img src="${escapeAttr(trainerSpriteSrc)}" class="" loading="lazy" data-="" /> `;
  html += `${trainerDisplayName}\n`;
  html += `      <div class="tr-notes">\n`;
  // If notes contain markup you want to preserve, remove escapeHtml here.
  for (const n of notes) html += `        ${escapeHtml(String(n))}\n`;
  html += `      </div>\n`;
  html += `    </div>\n`;
  html += `  </div>\n\n`;

  html += `  <div class="expanded-card-content expanded-docs">\n`;
  html += renderTrainerDocs(trainer);
  html += `  </div>\n`;
  html += `</div>\n`;

  return html;
}

function renderTrainerDocs(trainer) {
  if (!trainer) return ``;

  const count = Number(trainer.count ?? 0);
  if (!Number.isFinite(count) || count <= 0) return ``;

  let html = "";

  for (let slot = 0; slot < count; slot++) {
    const speciesRaw = trainer[`species_id_${slot}`] ?? ""; // e.g. "CHIMECHO"
    const rawSpeciesId = trainer[`raw_species_id_${slot}`]; // numeric dex id if present
    const level = trainer[`level_${slot}`] ?? "";
    const nature = trainer[`nature_${slot}`] ?? "";
    const abilityName = trainer[`ability_name_${slot}`] ?? "";

    const displaySpecies = prettifyEnumName(speciesRaw); // "CHIMECHO" -> "Chimecho"
    const spriteSrc = buildPokeSpriteSrc(displaySpecies);

    html += `    <div class="trainer-doc-item">\n`;
    html += `      <img src="${escapeAttr(spriteSrc)}" class="doc-sprite" loading="lazy" data-species-id="${escapeAttr(
      String(rawSpeciesId ?? "")
    )}" />\n`;

    html += `      <div class="trpok-item-info doc-species" data-species-id="${escapeAttr(
      String(rawSpeciesId ?? "")
    )}">Lv ${escapeHtml(String(level))} ${escapeHtml(displaySpecies)}</div>\n`;

    html += `      <div class="trpok-item-info">-</div>\n`;

    html += `      <div class="trpok-item-info doc-held-item">\n        ${escapeHtml(String(nature))} \n      </div>\n`;
    html += `      <div class="trpok-item-info doc-ab">\n        ${escapeHtml(String(abilityName))}\n      </div>\n`;
    html += `      <br>\n\n`;

    for (let m = 1; m <= 4; m++) {
      const move = trainer[`move_${m}_${slot}`] ?? "";
      const moveDisplay = prettifyMoveName(move); // "PERISH SONG" -> "Perish Song"
      // If you have numeric move ids, swap data-id to that.
      html += `      <div class="trpok-item-info doc-move" data-id="0">${escapeHtml(moveDisplay)}</div>\n\n`;
    }

    html += `    </div>\n\n`;
  }

  return html;
}

function buildTrainerDisplayName(trainer) {
  // Sample output shows: "PkMn Trainer Bianca"
  // Your trainer object has "class": "Team Plasma" etc.
  const cls = trainer?.class ? escapeHtml(String(trainer.class)) : "Trainer";
  // If you have a separate name field, use it. Otherwise, just class.
  const name = trainer?.name ? escapeHtml(String(trainer.name)) : cls;
  return `PkMn ${escapeHtml("Trainer")} ${name}`;
}

function buildTrainerSpriteSrc(trainer) {
  // In your trainer objects you have: tr_sprite: "trainer_sprites/teamplasma.png"
  // Your HTML sample used "/img/trainer_sprites/bianca.png"
  const raw = trainer?.tr_sprite ?? "";
  if (!raw) return `/img/trainer_sprites/unknown.png`;

  // if already looks like a path fragment
  if (raw.startsWith("/img/")) return raw;
  if (raw.startsWith("trainer_sprites/")) return `/img/${raw}`;
  if (raw.startsWith("/")) return raw;

  // fallback
  return `/img/${raw}`;
}

/* ---------------------------- encounter rendering -------------------------- */

function renderEncounterCard(masterEl, encounter) {
  if (!encounter) return ``;

  const dataIndex = masterEl.id ?? "";

  // Your sample has an extra hidden h3 preceding encounter card
  let html = "";
  html += `<h3 style="display: none;">${escapeHtml(encounter.name ?? "")}</h3>\n`;
  html += `<div class="expanded-field filterable doc-enc" data-index="${escapeAttr(
    String(dataIndex)
  )}">\n`;
  html += `  <div class="expanded-field-main">\n`;
  html += `    <div class="encounter-locations">\n`;
  html += `      ${escapeHtml(encounter.name ?? "")}\n`;
  html += `    </div>\n\n`;

  html += `    <div class="encounter-wilds" >\n`;
  const wilds = Array.isArray(encounter.wilds) ? encounter.wilds : [];
  for (const w of wilds) {
    const speciesName = String(w);
    const spriteSrc = buildPokeSpriteSrc(speciesName);

    html += `      <div class="wild" data-species-name="${escapeAttr(speciesName)}">\n`;
    html += `        <img src="${escapeAttr(
      spriteSrc
    )}" class="" loading="lazy" data-="" />\n`;
    html += `      </div>\n`;
  }
  html += `    </div>\n`;
  html += `  </div>\n`;
  html += `</div>\n`;

  return html;
}

/* ------------------------------- data access ------------------------------ */

function getTrainer(trainersById, id) {
  if (!trainersById) return null;

  // if it's an array indexed by id
  if (Array.isArray(trainersById)) return trainersById[id] ?? null;

  // if it's a map/dict keyed by id
  return trainersById[String(id)] ?? trainersById[id] ?? null;
}

function getEncounter(encountersById, id) {
  if (!encountersById) return null;

  if (Array.isArray(encountersById)) return encountersById[id] ?? null;
  return encountersById[String(id)] ?? encountersById[id] ?? null;
}

/* --------------------------------- sprites -------------------------------- */

function buildPokeSpriteSrc(speciesName) {
  // sample uses: /images/pokesprite/natu.png
  // Make sure your sprite naming matches this:
  // - lowercase
  // - spaces/hyphens normalized if needed
  const file = normalizeSpriteFileName(speciesName);
  return `./img/pokesprite/${file}.png`;
}

function normalizeSpriteFileName(name) {
  // "Mr. Mime" -> "mr_mime" (adjust if your sprite pack differs)
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/['’]/g, "")
    .replace(/[♀]/g, "f")
    .replace(/[♂]/g, "m")
    .replace(/[\s-]+/g, "_");
}

/* ------------------------------ text utilities ---------------------------- */

function prettifyEnumName(s) {
  // "CHIMECHO" -> "Chimecho", "PERISH SONG" -> "Perish Song"
  const str = String(s ?? "").trim();
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/[\s_]+/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function prettifyMoveName(s) {
  // If your move strings are already nice, you can just return s.
  return prettifyEnumName(s);
}

/* ------------------------------ Dex ---------------------------- */

function loadDex(url) {
  // Create iframe element

  if ($('iframe').length > 0) {
    $('iframe').show()
    $('.iframe-close-btn').show()
    return;
  }

  const iframe = document.createElement('iframe');

  // Set iframe properties
  iframe.src = `https://ddex-chi.vercel.app/${url}`;
  iframe.style.position = 'fixed';
  iframe.style.top = '0%';
  iframe.style.left = '0%';
  iframe.style.width = '20vw';
  iframe.style.height = '100vh';
  iframe.style.border = '2px solid #333';
  iframe.style.zIndex = '999999';
  iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';

  // Add elements to page
  document.body.appendChild(iframe);
}

function extractPokemonName(str) {
  const match = str.match(/^(?:Lv|Lvl)\s*\d+\s+(.*)$/i);
  return match ? match[1] : null;
}

function loadDexPage(collection, speciesName) {
  $('iframe').remove()
  loadDex(`${collection}/${speciesName}`)
}

/* ------------------------------ safety helpers ---------------------------- */

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s) {
  // Keep it simple; attributes should be escaped too
  return escapeHtml(s).replaceAll("`", "&#096;");
}

function sanitizeUrl(url) {
  const u = String(url ?? "").trim();
  // allow http(s) only; otherwise, neutralize
  if (/^https?:\/\//i.test(u)) return u;
  return "#";
}

$(document).ready(function() {
    document.querySelector("#mastersheet").innerHTML = renderMasterData(masterData, trainersById, encountersById);
    loadDex("?game=vintagewhiteplus")

    $('.doc-sprite, .doc-species').click(function() {
      let speciesName = cleanString(extractPokemonName($(this).parent().find('.doc-species').text()))
      loadDexPage("pokemon", speciesName)
    })



    $('.doc-move').click(function() {
      let moveName = cleanString($(this).text())
      loadDexPage("moves", moveName)
    })

    $('.doc-ab').click(function() {
      let abName = cleanString($(this).text())
      loadDexPage("abilities", abName)
    })

    $('.doc-held-item').click(function() {
      let itemName = cleanString($(this).text())
      loadDexPage("items", itemName)
    })

    $('.doc-enc').click(function() {
      let encName = cleanString($(this).find('.encounter-locations').text())
      console.log(encName)
      loadDexPage("encounters", encName)
    })

    $('.wild').click(function() {
      let speciesName = cleanString($(this).attr('data-species-name'))
      loadDexPage("pokemon", speciesName)
    })

})








