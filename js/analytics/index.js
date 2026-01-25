// ==== SUPABASE / TELEMETRY CONFIG ====
window.SUPABASE_PROJECT_REF = "tmtxxtngxgqsikfahhix";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdHh4dG5neGdxc2lrZmFoaGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDcwOTUsImV4cCI6MjA4NDUyMzA5NX0.Dnx73Xp97wikHiiQh8iX-O_o_SSV7znWH8OHLR7sKl8"


function supabaseUsageUrl() {
	return "https://" + window.SUPABASE_PROJECT_REF + ".functions.supabase.co/usage";
}

// Simple debounce guard so you don't accidentally spam on rapid UI events
window.__lastUsagePostMs = window.__lastUsagePostMs || 0;
window.USAGE_MIN_INTERVAL_MS = window.USAGE_MIN_INTERVAL_MS || 1500;


// ==== YOUR EXISTING LOGIC (slightly hardened) ====

function getPartyData() {
	const partyData = [];
	for (const speciesName of currentParty) {
		const setData = customSets?.[speciesName]?.["My Box"];
		if (!setData) continue;

		partyData.push({
			s: String(speciesName || "").trim(),
			m: Array.isArray(setData.moves) ? setData.moves.slice(0, 4) : [],
			i: setData.item ?? null,
			n: setData.nature ?? null,
			a: setData.ability ?? null,
		});
	}
	return partyData;
}

function getBoxData() {
  const boxIds = [];
  const pok_names = TITLE.includes("Imperium") ? emImpMons : sav_pok_names;

  for (const speciesName in (customSets || {})) {
    const speciesId = pok_names.indexOf(speciesName);
    if (speciesId !== -1) boxIds.push(speciesId);
  }

  const boxCount = boxIds.length;

  // already returns base64
  const boxDataB64 = pack12BitIntsToBase64(boxIds);

  function b64ByteLen(b64) {
	  // base64 length to byte length (no padding issues if you do it this way)
	  const bin = atob(b64);
	  return bin.length;
	}

	console.log("boxCount:", boxCount);
	console.log("b64 bytes:", b64ByteLen(boxDataB64));
	console.log("expected packed bytes:", Math.ceil((boxCount * 12) / 8));

	// also inspect the first few decoded chars; packed data will look non-printable
	const sample = atob(boxDataB64).slice(0, 40);
	console.log("decoded sample:", sample);

  return { boxDataB64, boxCount };
}

function getSnapshot() {
  const partyData = getPartyData();
  const currentAiPok = get_current_in?.();
  const { boxDataB64, boxCount } = getBoxData();

  if (partyData.length < 6) return null;

  const snapshot = {};
  snapshot.tr =
    (currentAiPok && currentAiPok.tr_id != null && String(currentAiPok.tr_id)) ||
    lastAiTrainerName ||
    "";

  snapshot.party = partyData;
  snapshot.title = typeof TITLE !== "undefined" ? String(TITLE) : "";
  snapshot.tid = (localStorage && localStorage.lastTid) ? String(localStorage.lastTid) : "";

  // NEW:
  snapshot.box_count = boxCount;
  snapshot.box_data_b64 = boxDataB64; // send base64 string; Edge will decode to bytea

  if (!snapshot.title || !snapshot.tid || !snapshot.tr) return null;

  return snapshot;
}


// ==== NEW: POST SNAPSHOT TO SUPABASE EDGE FUNCTION ====

async function postSnapshotToSupabase(snapshot) {
	// Throttle (avoid accidental double-posts from UI)
	const now = Date.now();
	if (now - window.__lastUsagePostMs < window.USAGE_MIN_INTERVAL_MS) {
		return { ok: false, skipped: true, reason: "throttled" };
	}
	window.__lastUsagePostMs = now;

	const url = supabaseUsageUrl();

	const headers = {
		"Content-Type": "application/json",
	};

	const res = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify(snapshot),
	});

	// Edge Function returns JSON; if error, show body to help debug
	const text = await res.text();
	let data;
	try { data = JSON.parse(text); } catch { data = { raw: text }; }

	if (!res.ok) {
		// Don't throw by default; return structured error for UI to handle
		return { ok: false, status: res.status, data };
	}
	lastSentSnapshot = snapshot
	return data;
}

// Convenience wrapper: build snapshot and post it
async function submitCurrentSnapshot() {
	const snapshot = getSnapshot();
	if (!snapshot) return { ok: false, skipped: true, reason: "snapshot-null" };
	return await postSnapshotToSupabase(snapshot);
}


// ==== Expose helpers globally ====
window.getPartyData = getPartyData;
window.getSnapshot = getSnapshot;
window.postSnapshotToSupabase = postSnapshotToSupabase;
window.submitCurrentSnapshot = submitCurrentSnapshot;


// ==== SUPABASE STATS (plain JS, no modules) ====

// Returns: https://<ref>.supabase.co/rest/v1/<view>?...
function supabaseRestUrl(viewName) {
	return "https://" + window.SUPABASE_PROJECT_REF + ".supabase.co/rest/v1/" + viewName;
}

// Encode for PostgREST filters: title=eq.<value>
function postgrestEq(key, value) {
	return key + "=eq." + encodeURIComponent(String(value));
}

async function fetchFromStatsView(viewName, { title, tr, limit }) {
	if (!window.SUPABASE_PROJECT_REF) {
		throw new Error("SUPABASE_PROJECT_REF not set");
	}
	if (!window.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY === "<YOUR_SUPABASE_ANON_KEY>") {
		throw new Error("SUPABASE_ANON_KEY not set");
	}

	const q = [];
	q.push("select=*");
	if (title != null) q.push(postgrestEq("title", title));
	if (tr != null) q.push(postgrestEq("tr", tr));
	q.push("order=uses.desc");
	q.push("limit=" + (limit || 50));

	const url = supabaseRestUrl(viewName) + "?" + q.join("&");

	const res = await fetch(url, {
		method: "GET",
		headers: {
			apikey: window.SUPABASE_ANON_KEY,
			Authorization: "Bearer " + window.SUPABASE_ANON_KEY,
		},
	});

	const text = await res.text();
	let data;
	try { data = JSON.parse(text); } catch { data = { raw: text }; }

	if (!res.ok) {
		return { ok: false, status: res.status, data };
	}
	return { ok: true, data };
}

async function fetchEventsWithParty({ title, tr, limit = 50, offset = 0 }) {
  const ref = window.SUPABASE_PROJECT_REF;
  const anon = window.SUPABASE_ANON_KEY;

  const url =
    `https://${ref}.supabase.co/rest/v1/v_usage_events_with_party` +
    `?title=eq.${encodeURIComponent(title)}` +
    `&tr=eq.${encodeURIComponent(String(tr))}` +
    `&order=created_at.desc` +
    `&limit=${limit}` +
    `&offset=${offset}`;

  const res = await fetch(url, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
  });

  if (!res.ok) throw new Error(`fetchEventsWithParty failed: ${res.status} ${await res.text()}`);
  return res.json(); // array of rows
}

// To Test

// const rows = await fetchEventsWithParty({
//   title: TITLE,
//   tr: lastAiTrainerName.trim(),
//   limit: 100,
//   offset: 0
// });

// console.log("events:", rows.length);
// console.log(rows[0]);

// Convenience: infer current title/tr from your existing state
function getCurrentTitleAndTr() {
	const snap = (typeof getSnapshot === "function") ? getSnapshot() : null;
	const title = (snap && snap.title) ? snap.title : (typeof TITLE !== "undefined" ? String(TITLE) : "");
	const tr = (snap && snap.tr) ? snap.tr : "";
	return { title, tr };
}

// --- Public helpers ---

async function fetchTopSpecies(opts) {
	opts = opts || {};
	const { title, tr } = getCurrentTitleAndTr();
	return await fetchFromStatsView("v_stats_species", {
		title: opts.title != null ? opts.title : title,
		tr: opts.tr != null ? opts.tr : tr,
		limit: opts.limit != null ? opts.limit : 50,
	});
}

async function fetchTopMoves(opts) {
	opts = opts || {};
	const { title, tr } = getCurrentTitleAndTr();
	return await fetchFromStatsView("v_stats_moves", {
		title: opts.title != null ? opts.title : title,
		tr: opts.tr != null ? opts.tr : tr,
		limit: opts.limit != null ? opts.limit : 50,
	});
}

async function fetchTopItems(opts) {
	opts = opts || {};
	const { title, tr } = getCurrentTitleAndTr();
	return await fetchFromStatsView("v_stats_items", {
		title: opts.title != null ? opts.title : title,
		tr: opts.tr != null ? opts.tr : tr,
		limit: opts.limit != null ? opts.limit : 50,
	});
}

// Expose globally (no modules)
window.fetchTopSpecies = fetchTopSpecies;
window.fetchTopMoves = fetchTopMoves;
window.fetchTopItems = fetchTopItems;



