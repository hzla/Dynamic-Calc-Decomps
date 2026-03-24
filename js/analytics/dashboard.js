
TITLE = document.title.split(" Usage Data")[0]


window.allPoks = {}
getTrainerNames()

const TRAINERS = window.trainersByName 

function isBossTrainer(name) {
  return /\b(Admin|Leader|Rival)\b/i.test(name);
}

function leadLevel(teamArr) {
  return (teamArr && teamArr.length && Number.isFinite(+teamArr[0].level)) ? +teamArr[0].level : -1;
}

// downcase, spaces->dashes, remove punctuation except dashes
function spriteFileFromSpecies(species) {
  const s = String(species ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")   // keep dashes, drop everything else
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "unknown";
}

function spriteSrc(species) {
  return "../img/pokesprite/" + spriteFileFromSpecies(species) + ".png";
}

function buildSelect2Data(trainersObj) {
  const bossesByLvl = new Map();
  const othersByLvl = new Map();

  for (const [name, team] of Object.entries(trainersObj)) {
    const lvl = leadLevel(team);

    const entry = {
      id: name,
      text: name,
      _leadLevel: lvl,
      tr_id: team[0].tr_id || null
    };
    const map = isBossTrainer(name) ? bossesByLvl : othersByLvl;
    if (!map.has(lvl)) map.set(lvl, []);
    map.get(lvl).push(entry);
  }

  function mapToLevelGroups(map) {
    // ascending levels, trainer name asc
    const levels = Array.from(map.keys()).sort((a,b) => a - b);
    return levels.map(lvl => {
      const kids = map.get(lvl).sort((a,b) => a.text.localeCompare(b.text));
      return { text: `Lv ${lvl}`, children: kids };
    });
  }

  return [
    { text: "Bosses", children: mapToLevelGroups(bossesByLvl) },
    { text: "Others", children: mapToLevelGroups(othersByLvl) },
  ];
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function renderTeam(trainerName, team) {
  const leadLvl = leadLevel(team);

  let html = `
    <div class="team">
      <div class="teamHeader">
        <div>
          <div class="name">${escapeHtml(trainerName)}</div>
          <div class="meta">Lead level: <span style="color:var(--accent);font-weight:700;">${leadLvl}</span> • Party size: ${team.length}</div>
        </div>
      </div>

      <div class="monGrid">
  `;

  for (const mon of team) {
    const species = mon.species ?? "Unknown";
    const level = (mon.level ?? "?");
    const nature = mon.nature ?? "";
    const ability = mon.ability ?? "";
    const item = mon.item ?? "";
    const moves = Array.isArray(mon.moves) ? mon.moves : [];
    const img = spriteSrc(species);

    html += `
      <div class="monCard">
        <div class="monTop">
          <img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
               onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">
        </div>
        <div class="monBody">
          <div class="monTitle">
            <div class="species" title="${escapeHtml(species)}">${escapeHtml(species)}</div>
            <div class="lvl">Lv ${escapeHtml(level)}</div>
          </div>

          <div class="monFacts">
            <div class="factRow"><span>Nature</span><span>${escapeHtml(nature)}</span></div>
            <div class="factRow"><span>Ability</span><span>${escapeHtml(ability)}</span></div>
            <div class="factRow"><span>Item</span><span>${escapeHtml(item)}</span></div>
          </div>

          <ul class="moves">
            ${moves.slice(0,4).map(m => `<li>${escapeHtml(m)}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }

  html += `</div></div>`;

  html += `
    <div id="usageDash" class="dash"></div>
    <div id="battlesDash" class="dash"></div>
  `;
  $("#out").html(html);
}

// Remove custom group-title elements: just plain options + a small lead-lv suffix
function templateResult(item) {
  if (item.children || !item.id) return item.text; // keep default rendering for group labels
  const $row = $('<div></div>');
  $row.append($('<span></span>').text(item.text));
  $row.append($('<span class="opt-level"></span>').text(`Lead Lv ${item._leadLevel}`));
  return $row;
}

function templateSelection(item) {
  if (!item || !item.id) return item?.text || "Search trainer name…";
  return item.text;
}

function getUsageTrainerKey(data) {
  if (TITLE === "Pokemon Null") return data.id;
  return data.tr_id ?? data.id;
}

function updateTrainerQueryParam(trainerName) {
  const url = new URL(window.location.href);
  if (trainerName) {
    url.searchParams.set("trainer", trainerName);
  } else {
    url.searchParams.delete("trainer");
  }
  window.history.replaceState({}, "", url);
}

function findTrainerOptionById(select2Data, trainerName) {
  for (const section of select2Data) {
    if (!Array.isArray(section.children)) continue;
    for (const group of section.children) {
      if (!Array.isArray(group.children)) continue;
      const match = group.children.find(child => child.id === trainerName);
      if (match) return match;
    }
  }
  return null;
}

function renderTrainerSelection(data) {
  if (!data || !data.id) return;

  const displayName = data.id;               // what you render the team with
  const usageName   = getUsageTrainerKey(data); // what you query usage with
  const team = TRAINERS[displayName] || [];

  updateTrainerQueryParam(displayName);
  renderTeam(displayName, team);
  renderTrainerUsageDashboard(usageName);
}

$(function () {
  const data = buildSelect2Data(TRAINERS);

  $("#trainerSelect").select2({
    data,
    placeholder: "Search trainer name…",
    allowClear: true,
    width: "100%",
    templateResult,
    templateSelection,
    matcher: function(params, data) {
      // keep group structure searchable
      if ($.trim(params.term) === "") return data;

      if (data.children) {
        const term = params.term.toLowerCase();
        const kids = data.children
          .map(group => {
            if (!group.children) return null;
            const matched = group.children.filter(ch => (ch.text || "").toLowerCase().includes(term));
            if (!matched.length) return null;
            return { ...group, children: matched };
          })
          .filter(Boolean);
        return kids.length ? { ...data, children: kids } : null;
      }

      return (data.text || "").toLowerCase().includes(params.term.toLowerCase()) ? data : null;
    }
  });

  $("#trainerSelect")
  .on("select2:select", function (e) {
    renderTrainerSelection(e.params.data);
  })
  .on("select2:clear", function () {
    updateTrainerQueryParam("");
    $("#out").html('<div class="emptyState">Select a trainer to render their team.</div>');
  });

  const queriedTrainer = new URLSearchParams(window.location.search).get("trainer");
  const selectedTrainer = queriedTrainer ? findTrainerOptionById(data, queriedTrainer) : null;
  if (selectedTrainer) {
    $("#trainerSelect").val(selectedTrainer.id).trigger("change");
    renderTrainerSelection(selectedTrainer);
  }
 });


async function getTrainerUsage(trainerName) {
  const rows = await fetchEventsWithParty({
    title: TITLE,
    tr: trainerName,
    limit: 1000,
    offset: 0
  });

  for (let battleIdx in rows) {
    battle = rows[battleIdx]
    let boxData = battle.box_data 
    let boxCount = battle.box_count
    const bytes = decodeByteaHexToBytes(boxData);
    const values = unpack12BitInts(bytes, boxCount);

    rows[battleIdx].boxPokNames = []

    for (let pokId of values) {
      const speciesName = emImpMons[pokId]
      rows[battleIdx].boxPokNames.push(speciesName)
    }
  }
  return rows
}

function getTrainerNames() {
    allPoks = {}
    if (TITLE == "Emerald Imperium 1.3") {
      allPoks = backup_data
    } else {
      allPoks = backup_data.formatted_sets
    }

    var trainer_names = []

    window.trainersByName = {}

    for (const [pokName, poks] of Object.entries(allPoks)) {
        var pok_tr_names = Object.keys(poks)


        for (i in pok_tr_names) {
           var trainerName = pok_tr_names[i].match(/Lvl\s+-?\d+\s+(.+?)\s*$/)?.[1] ?? null;

           window.trainersByName[trainerName] ||= []

           var pokData = poks[pok_tr_names[i]]
           pokData.species = pokName
           window.trainersByName[trainerName].push(pokData)
           trainer_names.push(trainerName) 
        }      
    }
}

function decodeByteaHexToBytes(byteaHex) {
  if (typeof byteaHex !== "string") {
    throw new TypeError("byteaHex must be a string");
  }

  let s = byteaHex.trim();

  // Remove surrounding quotes if present
  if (
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('"') && s.endsWith('"'))
  ) {
    s = s.slice(1, -1);
  }

  // Normalize \x prefix
  if (s.startsWith("\\x")) {
    s = s.slice(2);
  } else if (s.startsWith("0x")) {
    s = s.slice(2);
  }

  if (s.length % 2 !== 0) {
    throw new Error("invalid bytea hex length");
  }

  const bytes = new Uint8Array(s.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}


function unpack12BitInts(bytes, count) {
  const neededBits = count * 12;
  if (bytes.length * 8 < neededBits) {
    throw new Error("not enough data for boxCount");
  }

  const out = new Array(count);
  let bitPos = 0;

  for (let i = 0; i < count; i++) {
    let v = 0;
    for (let b = 0; b < 12; b++) {
      const byteIndex = bitPos >> 3;
      const bitIndex = bitPos & 7;
      const bit = (bytes[byteIndex] >> bitIndex) & 1;
      v |= bit << b;
      bitPos++;
    }
    out[i] = v;
  }

  return out;
}

function pct(n, d) {
  if (!d) return "0%";
  return Math.round((n / d) * 100) + "%";
}

function topCountsToChips(countsMap, denom) {
  // countsMap: Map<string, number>
  return Array.from(countsMap.entries())
    .sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([k, c]) => ({ k, c, p: denom ? (c / denom) : 0 }));
}

function buildUsageStats(rows) {
  const battles = Array.isArray(rows) ? rows : [];
  const totalBattles = battles.length;

  const bySpecies = new Map(); // species -> stats

  function get(species) {
    if (!bySpecies.has(species)) {
      bySpecies.set(species, {
        species,
        inParty: 0,
        inBox: 0,
        inBoth: 0,
        boxOnly: 0,
        moves: new Map(),
        items: new Map(),
        abilities: new Map(),
        natures: new Map(),
      });
    }
    return bySpecies.get(species);
  }

  for (const b of battles) {
    const party = Array.isArray(b.party) ? b.party : [];
    const box = Array.isArray(b.boxPokNames) ? b.boxPokNames : [];

    const partySet = new Set(party.map(p => String(p?.s ?? "").trim()).filter(Boolean));
    const boxSet   = new Set(box.map(s => String(s ?? "").trim()).filter(Boolean));

    // box presence
    for (const s of boxSet) get(s).inBox++;

    // party presence + per-mon breakdown
    for (const p of party) {
      const s = String(p?.s ?? "").trim();
      if (!s) continue;

      const st = get(s);
      // count each species once per battle for "inParty" denominators
      // (if duplicates ever happen, treat as present once)
      if (!st._seenPartyBattleIdSet) st._seenPartyBattleIdSet = new Set();
      const battleKey = b.event_id || b.created_at || Math.random().toString(36);
      if (!st._seenPartyBattleIdSet.has(battleKey)) {
        st._seenPartyBattleIdSet.add(battleKey);
        st.inParty++;
      }

      // moves (count presence per battle, not per slot)
      const moves = Array.isArray(p?.m) ? p.m : [];
      const moveSet = new Set(moves.map(m => String(m ?? "").trim()).filter(Boolean));
      for (const m of moveSet) st.moves.set(m, (st.moves.get(m) || 0) + 1);

      // item / ability / nature (presence per battle)
      const it = String(p?.i ?? "").trim();
      if (it) st.items.set(it, (st.items.get(it) || 0) + 1);

      const ab = String(p?.a ?? "").trim();
      if (ab) st.abilities.set(ab, (st.abilities.get(ab) || 0) + 1);

      const nt = String(p?.n ?? "").trim();
      if (nt) st.natures.set(nt, (st.natures.get(nt) || 0) + 1);
    }

    // participation buckets
    for (const s of boxSet) {
      const st = get(s);
      if (partySet.has(s)) st.inBoth++;
      else st.boxOnly++;
    }
  }

  // cleanup internal set
  for (const st of bySpecies.values()) delete st._seenPartyBattleIdSet;

  return { totalBattles, bySpecies };
}

function renderUsageDash(rows) {
  const { totalBattles, bySpecies } = buildUsageStats(rows);

  // "top used pokemon against this trainer" => sort by party appearances desc
  const top = Array.from(bySpecies.values())
    .filter(st => st.inParty > 0)
    .sort((a,b) => b.inParty - a.inParty || a.species.localeCompare(b.species))
    .slice(0, 100);

  const dashEl = document.getElementById("usageDash");
  if (!dashEl) return;

  let html = `
    <div class="dashTitle">
      <h3>Top used Pokémon (across ${totalBattles} battles)</h3>
      <div class="meta">Percentages are the percent of time this pokemon was used when it has been caught by the player.</div>
    </div>
    <div class="usageGrid">
  `;

  for (const st of top) {
    const species = st.species;
    const img = spriteSrc(species); // already in your file :contentReference[oaicite:4]{index=4}

    const moveChips = topCountsToChips(st.moves, st.inParty);
    const itemChips = topCountsToChips(st.items, st.inParty);
    const abilChips = topCountsToChips(st.abilities, st.inParty);
    const natChips  = topCountsToChips(st.natures, st.inParty);

    const caughtCount = st.inParty + st.boxOnly;   // same as st.inBox if you prefer
    const participation = caughtCount > 0 ? pct(st.inParty, caughtCount) : "—";


    html += `
      <div class="usageCard">
        <div class="usageCardTop">
          <img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
               onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">
          <div>
            <div class="name">${escapeHtml(species)}</div>
            <div class="sub">
              Used in party: <b style="color:var(--accent)">${st.inParty}</b> / ${caughtCount}
              • Participation: <b style="color:var(--accent)">${participation}</b>
            </div>
          </div>
        </div>

        <div class="usageBody">
          <div class="kvRow"><span>Moves</span><span>${st.inParty ? "top 8" : ""}</span></div>
          <div class="chips">
            ${moveChips.map(x => `<span class="chip">${escapeHtml(x.k)} <b>${pct(x.c, st.inParty)}</b></span>`).join("") || `<span class="chip">—</span>`}
          </div>

          <div class="kvRow"><span>Items</span><span>${st.inParty ? "top 8" : ""}</span></div>
          <div class="chips">
            ${itemChips.map(x => `<span class="chip">${escapeHtml(x.k)} <b>${pct(x.c, st.inParty)}</b></span>`).join("") || `<span class="chip">—</span>`}
          </div>

          <div class="kvRow"><span>Abilities</span><span>${st.inParty ? "top 8" : ""}</span></div>
          <div class="chips">
            ${abilChips.map(x => `<span class="chip">${escapeHtml(x.k)} <b>${pct(x.c, st.inParty)}</b></span>`).join("") || `<span class="chip">—</span>`}
          </div>

          <div class="kvRow"><span>Natures</span><span>${st.inParty ? "top 8" : ""}</span></div>
          <div class="chips">
            ${natChips.map(x => `<span class="chip">${escapeHtml(x.k)} <b>${pct(x.c, st.inParty)}</b></span>`).join("") || `<span class="chip">—</span>`}
          </div>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  dashEl.innerHTML = html;
}

function renderBattlesDash(rows) {
  const battlesEl = document.getElementById("battlesDash");
  if (!battlesEl) return;

  const battles = Array.isArray(rows) ? rows : [];

  let html = `
    <div class="dashTitle">
      <h3>All battles</h3>
      <div class="meta"></div>
    </div>
    <div class="battlesList">
  `;

  for (const b of battles) {
    const party = Array.isArray(b.party) ? b.party : [];
    html += `<div class="battleCard"><div class="monGrid">`;

    for (const p of party) {
      const species = p?.s ?? "Unknown";
      const moves = Array.isArray(p?.m) ? p.m : [];
      const img = spriteSrc(species);

      html += `
        <div class="monCard">
          <div class="monTop">
            <img src="${img}" alt="${escapeHtml(species)}" loading="lazy"
                 onerror="this.style.opacity=.35;this.title='Missing sprite: ${img}'">
          </div>
          <div class="monBody">
            <div class="monTitle">
              <div class="species" title="${escapeHtml(species)}">${escapeHtml(species)}</div>
              <div class="lvl"></div>
            </div>

            <div class="monFacts">
              <div class="factRow"><span>Nature</span><span>${escapeHtml(p?.n ?? "")}</span></div>
              <div class="factRow"><span>Ability</span><span>${escapeHtml(p?.a ?? "")}</span></div>
              <div class="factRow"><span>Item</span><span>${escapeHtml(p?.i ?? "")}</span></div>
            </div>

            <ul class="moves">
              ${moves.slice(0,4).map(m => `<li>${escapeHtml(m)}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
  }

  html += `</div>`;
  battlesEl.innerHTML = html;
}

async function renderTrainerUsageDashboard(trainerName) {
  // clears quickly so UI feels responsive
  const dashEl = document.getElementById("usageDash");
  const battlesEl = document.getElementById("battlesDash");
  if (dashEl) dashEl.innerHTML = `<div class="dashTitle"><h3>Top used Pokémon</h3><div class="meta">Loading…</div></div>`;
  if (battlesEl) battlesEl.innerHTML = `<div class="dashTitle"><h3>All battles</h3><div class="meta">Loading…</div></div>`;

  const rows = await getTrainerUsage(trainerName);
  renderUsageDash(rows);
  renderBattlesDash(rows);
}
