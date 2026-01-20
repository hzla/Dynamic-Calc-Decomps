// ==== SUPABASE / TELEMETRY CONFIG ====
window.SUPABASE_PROJECT_REF = "tmtxxtngxgqsikfahhix";


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

function getSnapshot() {
	const partyData = getPartyData();
	const currentAiPok = get_current_in?.();

	if (partyData.length < 6) return null;

	const snapshot = {};
	// tr can be string or int; normalize to string-ish here
	snapshot.tr =
		(currentAiPok && currentAiPok.tr_id != null && String(currentAiPok.tr_id)) ||
		(lastSetName && String(lastSetName).includes("(") ? String(lastSetName).split("(")[1].split(")")[0] : "") ||
		"";

	snapshot.party = partyData;
	snapshot.title = typeof TITLE !== "undefined" ? String(TITLE) : "";
	snapshot.tid = (localStorage && localStorage.lastTid) ? String(localStorage.lastTid) : "";

	// Basic validity (avoid junk writes)
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

	// Only include if you're actually enforcing it in the function
	if (window.SUPABASE_USAGE_SECRET && window.SUPABASE_USAGE_SECRET !== "<USAGE_SECRET>") {
		headers["X-Usage-Secret"] = window.SUPABASE_USAGE_SECRET;
	}

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
	return data;
}

// Convenience wrapper: build snapshot and post it
async function submitCurrentSnapshot() {
	const snapshot = getSnapshot();
	if (!snapshot) return { ok: false, skipped: true, reason: "snapshot-null" };
	return await postSnapshotToSupabase(snapshot);
}


// ==== Expose helpers globally (since you're not using modules) ====
window.getPartyData = getPartyData;
window.getSnapshot = getSnapshot;
window.postSnapshotToSupabase = postSnapshotToSupabase;
window.submitCurrentSnapshot = submitCurrentSnapshot;



