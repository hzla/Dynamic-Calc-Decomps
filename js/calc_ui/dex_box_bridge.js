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
	var BOX_FETCH_TIMEOUT = 10000;
	var BOX_MAX_ATTEMPTS = 4;
	var BOX_BASE_RETRY_MS = 400;
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

	function safeJsonParse(rawValue, fallback) {
		try {
			return rawValue ? JSON.parse(rawValue) : fallback;
		} catch (error) {
			return fallback;
		}
	}

	function delayMs(ms) {
		return new Promise(function (resolve) {
			window.setTimeout(resolve, ms);
		});
	}

	function computeRetryDelayMs(attempt) {
		var step = Math.max(0, (Number(attempt) || 1) - 1);
		var next = Math.min(1800, BOX_BASE_RETRY_MS * Math.pow(2, step));
		return Math.floor(next);
	}

	function isRetryableFetchError(error) {
		var message = buildErrorMessage(error).toLowerCase();
		return (
			message.indexOf("failed to fetch") !== -1 ||
			message.indexOf("networkerror") !== -1 ||
			message.indexOf("load failed") !== -1 ||
			message.indexOf("empty response") !== -1 ||
			message.indexOf("signal is aborted") !== -1
		);
	}

	function logBridge(eventName, details) {
		if (details !== undefined) {
			console.log("[DDEX Bridge][Calc]", eventName, details);
			return;
		}
			console.log("[DDEX Bridge][Calc]", eventName);
	}

	function getCustomSetsMap() {
		if (window.customSets && typeof window.customSets === "object") {
			return window.customSets;
		}
		return safeJsonParse(window.localStorage && window.localStorage.customsets, {});
	}

	function getDeadMonsList() {
		return safeJsonParse(window.localStorage && window.localStorage.deadMons, []);
	}

	function normalizeNumber(value, fallbackValue) {
		var numeric = Number(value);
		return Number.isFinite(numeric) ? numeric : fallbackValue;
	}

	function formatHeader(speciesName, setData) {
		var nickname = String((setData && setData.nn) || "").trim();
		var gender = String((setData && setData.gender) || "").trim().toUpperCase();
		var item = String((setData && setData.item) || "").trim();
		var header = "";

		if (nickname && nickname !== speciesName) {
			header = nickname + " (" + speciesName + ")";
		} else {
			header = speciesName;
		}

		if (gender === "M" || gender === "F") {
			header += " (" + gender + ")";
		}
		if (item) {
			header += " @ " + item;
		}

		return header;
	}

	function formatStatLine(label, valuesByStat, order, fallbackValue) {
		var parts = [];
		for (var i = 0; i < order.length; i++) {
			var statInfo = order[i];
			var amount = normalizeNumber(valuesByStat && valuesByStat[statInfo.key], fallbackValue);
			parts.push(amount + " " + statInfo.label);
		}
		return label + ": " + parts.join(" / ");
	}

	function serializeCustomSet(speciesName, setData) {
		if (!setData || typeof setData !== "object") return "";

		var canonicalStatus = typeof window.normalizeStoredStatus === "function"
			? window.normalizeStoredStatus(setData.status)
			: "Healthy";
		var lines = [];
		lines.push(formatHeader(speciesName, setData));
		lines.push("Level: " + normalizeNumber(setData.level, 100));

		if (setData.nature) {
			lines.push(String(setData.nature).trim() + " Nature");
		}
		if (setData.ability) {
			lines.push("Ability: " + String(setData.ability).trim());
		}

		lines.push(
			formatStatLine(
				"EVs",
				setData.evs,
				[
					{ key: "hp", label: "HP" },
					{ key: "at", label: "Atk" },
					{ key: "df", label: "Def" },
					{ key: "sa", label: "SpA" },
					{ key: "sd", label: "SpD" },
					{ key: "sp", label: "Spe" },
				],
				0,
			),
		);
		lines.push(
			formatStatLine(
				"IVs",
				setData.ivs,
				[
					{ key: "hp", label: "HP" },
					{ key: "at", label: "Atk" },
					{ key: "df", label: "Def" },
					{ key: "sa", label: "SpA" },
					{ key: "sd", label: "SpD" },
					{ key: "sp", label: "Spe" },
				],
				31,
			),
		);
		if (canonicalStatus !== "Healthy") {
			lines.push("Status: " + canonicalStatus);
		}

		var moves = Array.isArray(setData.moves) ? setData.moves : [];
		for (var moveIndex = 0; moveIndex < moves.length; moveIndex++) {
			var moveName = String(moves[moveIndex] || "").trim();
			if (!moveName) continue;
			lines.push("- " + moveName);
		}

		if (setData.met) {
			lines.push("Met: " + String(setData.met).trim());
		}

		return lines.join("\n");
	}

	function serializeDeadMon(deadMon) {
		if (!deadMon || typeof deadMon !== "object") return "";

		var speciesName = String(deadMon.speciesName || deadMon.species || "").trim();
		if (!speciesName) return "";

		var nickname = String(deadMon.nickname || deadMon.nn || "").trim();
		var header = nickname && nickname !== speciesName
			? nickname + " (" + speciesName + ")"
			: speciesName;

		var lines = [header, "Dead: Yes"];
		var met = String(deadMon.met || deadMon.location || "").trim();
		if (met) {
			lines.push("Met: " + met);
		}

		return lines.join("\n");
	}

	function buildCustomSetsPayload() {
		var customSetsMap = getCustomSetsMap();
		var deadMons = getDeadMonsList();
		var speciesNames = Object.keys(customSetsMap || {});
		var blocks = [];

		speciesNames.sort();

		for (var i = 0; i < speciesNames.length; i++) {
			var speciesName = speciesNames[i];
			var speciesSets = customSetsMap[speciesName];
			if (!speciesSets || typeof speciesSets !== "object" || !speciesSets["My Box"]) {
				continue;
			}

			var block = serializeCustomSet(speciesName, speciesSets["My Box"]);
			if (!block) continue;
			blocks.push(block);
		}

		for (var deadIndex = 0; deadIndex < deadMons.length; deadIndex++) {
			var deadBlock = serializeDeadMon(deadMons[deadIndex]);
			if (!deadBlock) continue;
			blocks.push(deadBlock);
		}

		return {
			payloadText: blocks.join("\n\n"),
			count: blocks.length,
		};
	}

	function fetchEndpoint(url, attempt) {
		var controller =
			typeof window.AbortController === "function" ? new AbortController() : null;
		var timeoutId = null;
		var currentAttempt = Number(attempt) || 1;

		if (controller) {
			timeoutId = window.setTimeout(function () {
				controller.abort();
			}, BOX_FETCH_TIMEOUT);
		}
		logBridge("fetch start", {
			url: url,
			attempt: currentAttempt,
			timeoutMs: BOX_FETCH_TIMEOUT,
		});

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
				return response.text().then(function (payloadText) {
					if (!payloadText || !payloadText.trim()) {
						throw new Error("Empty response from " + url);
					}
					logBridge("fetch success", {
						url: url,
						attempt: currentAttempt,
						payloadLength: payloadText.length,
					});
					return payloadText;
				});
			})
			.catch(function (error) {
				logBridge("fetch failed", {
					url: url,
					attempt: currentAttempt,
					error: buildErrorMessage(error),
				});
				if (!isRetryableFetchError(error) || currentAttempt >= BOX_MAX_ATTEMPTS) {
					throw error;
				}
				return delayMs(computeRetryDelayMs(currentAttempt)).then(function () {
					return fetchEndpoint(url, currentAttempt + 1);
				});
			})
			.finally(function () {
				if (timeoutId !== null) clearTimeout(timeoutId);
			});
	}

	function fetchBoxPayload() {
		var customSetsPayload = buildCustomSetsPayload();
		if (customSetsPayload.count > 0 && customSetsPayload.payloadText.trim()) {
			logBridge("using customSets payload", {
				entryCount: customSetsPayload.count,
				payloadLength: customSetsPayload.payloadText.length,
			});
			return Promise.resolve(customSetsPayload.payloadText);
		}

		var index = 0;
		var lastError = null;

		function tryNextEndpoint() {
			if (index >= BOX_ENDPOINTS.length) {
				return Promise.reject(lastError || new Error("No box endpoints configured"));
			}

			var endpoint = BOX_ENDPOINTS[index++];
			return fetchEndpoint(endpoint, 1).catch(function (error) {
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
		logBridge("request received", {
			requestId: data.requestId,
			origin: event.origin,
		});
		if (!event.source || !isAllowedDexOrigin(event.origin)) {
			logBridge("request rejected", {
				requestId: data.requestId,
				origin: event.origin,
			});
			return;
		}

		fetchBoxPayload()
			.then(function (payloadText) {
				logBridge("response sent", {
					requestId: data.requestId,
					origin: event.origin,
					payloadLength: payloadText.length,
				});
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
				logBridge("response failed", {
					requestId: data.requestId,
					origin: event.origin,
					error: buildErrorMessage(error),
				});
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
