import { MAX_CALC_BYTES, SHARE_ID, parseSharedCalc } from "../../js/shared_calc_payload.mjs";

async function readUpload(request) {
    const reader = request.body.getReader();
    const chunks = [];
    let size = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_CALC_BYTES) {
                await reader.cancel();
                return null;
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    return new Uint8Array(await new Blob(chunks).arrayBuffer());
}

async function verifyTurnstile(token, origin, env) {
    if (!token || token.length > 2048) return false;
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
        signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error("Turnstile verification unavailable");
    const result = await response.json();
    return result.success === true && result.hostname === new URL(origin).hostname && result.action === "publish-calc";
}

export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);
        const origin = request.headers.get("Origin");
        const allowed = !!origin && (env.ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).includes(origin);
        const headers = new Headers({
            "Vary": "Origin",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store"
        });
        if (allowed) headers.set("Access-Control-Allow-Origin", origin);
        const json = (body, status = 200) => Response.json(body, { status, headers });
        const fail = (error, status) => json({ error }, status);

        try {
            if (request.method === "OPTIONS" && pathname === "/calcs") {
                if (!allowed) return fail("Origin not allowed.", 403);
                headers.set("Access-Control-Allow-Methods", "POST");
                headers.set("Access-Control-Allow-Headers", "Content-Type, X-Turnstile-Token");
                headers.set("Access-Control-Max-Age", "600");
                return new Response(null, { status: 204, headers });
            }
            if (request.method === "GET" && pathname === "/config") {
                return json({ siteKey: env.TURNSTILE_SITE_KEY || "" });
            }
            if (request.method === "GET" && pathname.startsWith("/calcs/")) {
                const id = pathname.slice("/calcs/".length);
                if (!SHARE_ID.test(id)) return fail("Calc not found.", 404);
                const object = await env.CALCS.get(id);
                if (!object) return fail("Calc not found.", 404);
                headers.set("Content-Type", "application/json; charset=utf-8");
                headers.set("Cache-Control", "public, max-age=86400, immutable");
                return new Response(object.body, { headers });
            }
            if (request.method !== "POST" || pathname !== "/calcs") return fail("Not found.", 404);
            if (!allowed) return fail("Origin not allowed.", 403);
            if (env.UPLOADS_ENABLED !== "true") return fail("Publishing is paused. Existing share links still work.", 503);
            if (!env.TURNSTILE_SECRET || !env.TURNSTILE_SITE_KEY) return fail("Publishing is not configured.", 503);
            if (!request.body || request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/json" ||
                request.headers.has("Content-Encoding")) return fail("Upload an uncompressed JSON file.", 415);
            if (Number(request.headers.get("Content-Length")) > MAX_CALC_BYTES) return fail("The file exceeds 5 MB.", 413);
            const ip = request.headers.get("CF-Connecting-IP") || "unknown";
            if (!(await env.UPLOAD_LIMIT.limit({ key: ip })).success ||
                !(await env.TOTAL_UPLOAD_LIMIT.limit({ key: "publish" })).success) {
                return fail("Too many publish attempts. Try again in a minute.", 429);
            }
            if (!await verifyTurnstile(request.headers.get("X-Turnstile-Token"), origin, env)) {
                return fail("Complete the verification and try again.", 403);
            }
            const bytes = await readUpload(request);
            if (!bytes) return fail("The file exceeds 5 MB.", 413);
            try {
                parseSharedCalc(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
            } catch (error) {
                return fail(error instanceof TypeError ? "Use a UTF-8 JSON file." : error.message, 400);
            }
            const { body, status } = await env.PUBLISH_QUOTA.getByName("global").publish(bytes);
            return json(body, status);
        } catch (error) {
            console.error("Calc share request failed", error);
            return fail("The sharing service is temporarily unavailable.", 503);
        }
    }
};
