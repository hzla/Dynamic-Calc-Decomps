function getDexGameQuery() {
	const gameId = cleanString(TITLE);
	return gameId ? `game=${gameId}` : '';
}

function withDexGameContext(path) {
	const route = typeof path === 'string' ? path.replace(/^\/+/, '') : '';
	const routeParts = route.split('?');
	const routePath = routeParts.shift() || '';
	const params = new URLSearchParams(routeParts.join('?'));
	const gameId = cleanString(TITLE);

	if (!params.has('embedded')) {
		params.set('embedded', '1');
	}
	if (gameId && !params.has('game')) {
		params.set('game', gameId);
	}

	const query = params.toString();
	if (!routePath) {
		return query ? `?${query}` : '';
	}
	return query ? `${routePath}?${query}` : routePath;
}

function getDexFrameUrl(path) {
	// return `http://localhost:3000/${withDexGameContext(path)}`;
	return `https://ddex-chi.vercel.app/${withDexGameContext(path)}`;
}

function getDexViewSlot() {
	return document.getElementById('dex-view-frame-slot');
}

function getDexFrame() {
	return document.querySelector('#dex-view-frame-slot iframe.dex-window');
}

function getCalculatorViewHeight() {
	const calculatorView = document.getElementById('calculator-view');
	const visibleHeight = calculatorView ? Math.max(
		calculatorView.getBoundingClientRect().height || 0,
		calculatorView.scrollHeight || 0
	) : 0;
	if (visibleHeight > 0) {
		window.__DEX_VIEW_HEIGHT__ = visibleHeight;
		return visibleHeight;
	}
	return window.__DEX_VIEW_HEIGHT__ || 0;
}

function syncDexFrameLayout() {
	const dexView = document.getElementById('dex-view');
	const dexSlot = getDexViewSlot();
	const iframe = getDexFrame();
	const targetHeight = getCalculatorViewHeight();

	if (dexView && targetHeight > 0) {
		dexView.style.minHeight = `${targetHeight}px`;
	}
	if (dexSlot && targetHeight > 0) {
		dexSlot.style.minHeight = `${targetHeight}px`;
	}
	if (iframe && targetHeight > 0) {
		iframe.style.height = `${targetHeight}px`;
	}
}

function ensureDexFrame(frameUrl) {
	const dexSlot = getDexViewSlot();
	if (!dexSlot) {
		return null;
	}

	let iframe = getDexFrame();
	if (!iframe) {
		iframe = document.createElement('iframe');
		iframe.className = 'dex-window';
		iframe.src = frameUrl;
		iframe.setAttribute('title', 'Dynamic Dex');
		iframe.setAttribute('loading', 'eager');
		dexSlot.appendChild(iframe);
	}
	return iframe;
}

function ensureDexViewLoaded() {
	const frameUrl = getDexFrameUrl('');
	const iframe = ensureDexFrame(frameUrl);
	if (!iframe) {
		return null;
	}
	if (!iframe.src) {
		iframe.src = frameUrl;
	}
	syncDexFrameLayout();
	return iframe;
}

function loadDex(url, options) {
	const settings = options || {};
	const frameUrl = getDexFrameUrl(url);
	const iframe = ensureDexFrame(frameUrl);

	if (!iframe) {
		return;
	}

	if (iframe.src !== frameUrl) {
		iframe.src = frameUrl;
	}

	syncDexFrameLayout();

	if (settings.activateTab !== false && typeof window.setMainPageView === 'function') {
		window.setMainPageView('dex');
	}
}

function silentLoadDex(url) {
	if (!getDexGameQuery()) {
		return;
	}
	loadDex(url || '', { activateTab: false })
	console.log("Dex initialized")
}

$(document).ready(function() {
	syncDexFrameLayout()

	if (showDex) {
		silentLoadDex()
	}
	
	 $('#open-dex, #main-nav-dex').click(function(e) {
	 	e.preventDefault()
	 	loadDex('')
	 })

	 if ($('#open-dex:visible, #main-nav-dex:visible').length > 0) {
	 	$('.poke-sprite').click(function() {
	 		
	 		if ($(this).parent().attr('id') == "p2") {
	 			if (!TITLE.includes("Pokemon Null") && TITLE != "Platinum Kaizo") {
	 				return
	 			}
	 		}

	 		var dexPok = $(this).attr('src').split("/")[3].split(".")[0]
	 		loadDex(`pokemon/${dexPok}`)
	 	})

	 	$('#dex-show').click(function() {
	 		var dexPok = $(this).parents('.panel').find('.poke-sprite').attr('src').split("/")[3].split(".")[0]
	 		console.log(dexPok)
	 		loadDex(`pokemon/${dexPok}`)
	 	})
	 }

	$(window).on('resize', syncDexFrameLayout)
	window.ensureDexViewLoaded = ensureDexViewLoaded
	window.syncDexFrameLayout = syncDexFrameLayout
})
