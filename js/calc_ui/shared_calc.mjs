import { CALC_SHARE_ORIGIN } from "../shared_calc_config.mjs";
import { MAX_CALC_BYTES, SHARE_ID, parseSharedCalc, serializeBridgedCalc } from "../shared_calc_payload.mjs";

async function api(path, options) {
    if (!CALC_SHARE_ORIGIN) throw new Error("Shared calc hosting is not configured.");
    const response = await fetch(new URL(path, CALC_SHARE_ORIGIN), {
        credentials: "omit", redirect: "error", signal: AbortSignal.timeout(30000), ...options
    });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "The sharing service is unavailable.");
    }
    return response;
}

export async function loadSharedCalc(id) {
    if (!SHARE_ID.test(id)) throw new Error("This share ID is invalid.");
    const response = await api("/calcs/" + id);
    const file = await response.blob();
    if (file.size > MAX_CALC_BYTES) throw new Error("The shared file exceeds 5 MB.");
    return parseSharedCalc(await file.text());
}

function getShareUrl(id, mechanics) {
    const url = new URL(location.href);
    url.search = new URLSearchParams({ share: id, view: "calculator", ...mechanics }).toString();
    url.hash = "";
    return url.href;
}

let turnstileScript;
function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (!turnstileScript) {
        turnstileScript = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.onload = resolve;
            script.onerror = () => {
                turnstileScript = null;
                script.remove();
                reject(new Error("Could not load verification."));
            };
            document.head.append(script);
        });
    }
    return turnstileScript;
}

const open = document.getElementById("open-publish-calc");
if (open && CALC_SHARE_ORIGIN && window.devDataOverrides?.isBlankDevMode() &&
    !new URLSearchParams(location.search).has("share")) {
    const dialog = document.getElementById("publish-calc-dialog");
    const form = document.getElementById("publish-calc-form");
    const calcName = document.getElementById("publish-calc-name");
    const status = document.getElementById("publish-calc-status");
    const submit = document.getElementById("publish-calc-submit");
    const result = document.getElementById("publish-calc-result");
    const link = document.getElementById("published-calc-link");
    let widget;
    let token = "";
    let busy = false;
    let setup;

    function syncSubmit() {
        submit.disabled = busy || !token;
    }

    function showPublishControl() {
        open.hidden = !window.devDataOverrides.getActiveBridgeData();
    }

    window.addEventListener("calc:bridge-data-ready", showPublishControl);
    showPublishControl();
    open.addEventListener("click", async () => {
        const bridge = window.devDataOverrides.getActiveBridgeData();
        if (!bridge) return;
        calcName.textContent = bridge.data.title;
        if (!dialog.open) dialog.showModal();
        if (widget !== undefined) return;
        status.textContent = "Loading verification...";
        try {
            setup ||= Promise.all([api("/config").then(response => response.json()), loadTurnstile()]);
            const [{ siteKey }] = await setup;
            if (!siteKey) throw new Error("Publishing is not configured.");
            if (widget !== undefined) return;
            widget = window.turnstile.render("#publish-calc-verification", {
                sitekey: siteKey,
                action: "publish-calc",
                size: "flexible",
                callback(value) { token = value; syncSubmit(); },
                "expired-callback"() { token = ""; syncSubmit(); },
                "error-callback"() { token = ""; syncSubmit(); status.textContent = "Verification is unavailable."; }
            });
            status.textContent = "";
        } catch (error) {
            setup = null;
            status.textContent = error.message;
        }
    });
    document.getElementById("close-publish-calc").addEventListener("click", () => dialog.close());
    document.getElementById("copy-published-calc").addEventListener("click", async () => {
        link.select();
        try {
            await navigator.clipboard.writeText(link.value);
            status.textContent = "Link copied.";
        } catch {
            status.textContent = "The link is selected for copying.";
        }
    });
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const bridge = window.devDataOverrides.getActiveBridgeData();
        if (!token || busy || !bridge) return;
        result.hidden = true;
        busy = true;
        syncSubmit();
        status.textContent = "Publishing...";
        try {
            const payload = serializeBridgedCalc(bridge.data);
            const response = await api("/calcs", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Turnstile-Token": token },
                body: payload
            });
            const { id } = await response.json();
            if (!SHARE_ID.test(id)) throw new Error("The sharing service returned an invalid link.");
            link.value = getShareUrl(id, bridge.mechanics);
            result.hidden = false;
            link.focus();
            link.select();
            status.textContent = "Published.";
        } catch (error) {
            status.textContent = error.message;
        } finally {
            busy = false;
            token = "";
            syncSubmit();
            window.turnstile.reset(widget);
        }
    });
}
