(function () {
	"use strict";

	if (window.__DDEX_BOX_BRIDGE_INSTALLED__) {
		return;
	}
	window.__DDEX_BOX_BRIDGE_INSTALLED__ = true;

	var BOX_REQUEST_TYPE = "ddex:nuzlocke-box:request";
	var BOX_RESPONSE_TYPE = "ddex:nuzlocke-box:response";
	var BOX_ENDPOINTS = [
		"http://127.0.0.1:31124/box",
		"http://localhost:31124/box",
	];
	var BOX_FETCH_TIMEOUT = 1500;
	var STATIC_ALLOWED_ORIGINS = [
		"https://ddex-chi.vercel.app",
		"http://localhost:3001",
		"http://127.0.0.1:3001",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	];

	function safeOrigin(url) {
		if (!url) return "";
		try {
			return new URL(url, window.location.href).origin;
		} catch (error) {
			return "";
		}
	}

	function collectAllowedOrigins() {
		var allowedOrigins = {};
		for (var i = 0; i < STATIC_ALLOWED_ORIGINS.length; i++) {
			allowedOrigins[STATIC_ALLOWED_ORIGINS[i]] = true;
		}

		if (typeof window.DEX_URL === "string") {
			var configuredOrigin = safeOrigin(window.DEX_URL);
			if (configuredOrigin) {
				allowedOrigins[configuredOrigin] = true;
			}
		}

		var iframes = document.querySelectorAll("iframe.dex-window, iframe[src*='ddex']");
		for (var j = 0; j < iframes.length; j++) {
			var iframeOrigin = safeOrigin(iframes[j].src);
			if (iframeOrigin) {
				allowedOrigins[iframeOrigin] = true;
			}
		}

		return allowedOrigins;
	}

	function isAllowedDexOrigin(origin) {
		if (!origin || origin === "null") return false;
		return !!collectAllowedOrigins()[origin];
	}

	function buildErrorMessage(error) {
		return String((error && error.message) || error || "Unknown error");
	}

	function fetchEndpoint(url) {
		var controller =
			typeof window.AbortController === "function" ? new AbortController() : null;
		var timeoutId = null;

		if (controller) {
			timeoutId = window.setTimeout(function () {
				controller.abort();
			}, BOX_FETCH_TIMEOUT);
		}

		return window
			.fetch(url, {
				method: "GET",
				cache: "no-store",
				signal: controller ? controller.signal : undefined,
			})
			.then(function (response) {
				if (!response || response.status !== 200) {
					throw new Error(
						"Unexpected response status: " + (response && response.status),
					);
				}
				return response.text();
			})
			.finally(function () {
				if (timeoutId !== null) clearTimeout(timeoutId);
			});
	}

	function fetchBoxPayload() {
		var index = 0;
		var lastError = null;

		function tryNextEndpoint() {
			if (index >= BOX_ENDPOINTS.length) {
				return Promise.reject(lastError || new Error("No box endpoints configured"));
			}

			var endpoint = BOX_ENDPOINTS[index++];
			return fetchEndpoint(endpoint).catch(function (error) {
				lastError = new Error(endpoint + " failed: " + buildErrorMessage(error));
				return tryNextEndpoint();
			});
		}

		return tryNextEndpoint();
	}

	window.addEventListener("message", function (event) {
		var data = event.data || {};
		if (data.type !== BOX_REQUEST_TYPE || !data.requestId) {
			return;
		}
		if (!event.source || !isAllowedDexOrigin(event.origin)) {
			return;
		}

		fetchBoxPayload()
			.then(function (payloadText) {
				event.source.postMessage(
					{
						type: BOX_RESPONSE_TYPE,
						requestId: data.requestId,
						ok: true,
						payloadText: payloadText,
					},
					event.origin,
				);
			})
			.catch(function (error) {
				event.source.postMessage(
					{
						type: BOX_RESPONSE_TYPE,
						requestId: data.requestId,
						ok: false,
						error: buildErrorMessage(error),
					},
					event.origin,
				);
			});
	});
})();
