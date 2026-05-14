const DEX_NAVIGATE_MESSAGE_TYPE = 'ddex:navigate';
const DEX_READY_MESSAGE_TYPE = 'ddex:ready';
const dexBridgeSlots = {
	view: { ready: false, pendingFragment: '', pendingReason: '' },
	modal: { ready: false, pendingFragment: '', pendingReason: '' }
};
let dexBridgeRequestCounter = 0;
const dexGameIdsByTitle = {
	'Blaze Black 2/Volt White 2 Redux': 'blazeblack2redux'
};

function getDexGameIdForTitle(title) {
	if (typeof title !== 'string' || !title) {
		return '';
	}

	if (dexGameIdsByTitle[title]) {
		return dexGameIdsByTitle[title];
	}

	return cleanString(title);
}

function getDexGameQuery() {
	const gameId = getDexGameIdForTitle(TITLE);
	return gameId ? `game=${gameId}` : '';
}

function isDexSpeciesModalEnabled() {
	return typeof localStorage !== 'undefined' && localStorage.dexSpeciesModalMode === '1';
}

function withDexGameContext(path, options) {
	const settings = options || {};
	const route = typeof path === 'string' ? path.replace(/^\/+/, '') : '';
	const routeParts = route.split('?');
	const routePath = routeParts.shift() || '';
	const params = new URLSearchParams(routeParts.join('?'));
	let gameId = getDexGameIdForTitle(TITLE);

	if (gameId.includes('pokemonnull')) {
		gameId = 'pokemonnull';
	}

	if (!params.has('embedded')) {
		params.set('embedded', '1');
	}
	if (gameId && !params.has('game')) {
		params.set('game', gameId);
	}
	if (settings.layout) {
		params.set('layout', settings.layout);
	}

	const query = params.toString();
	if (!routePath) {
		return query ? `?${query}` : '';
	}
	return query ? `${routePath}?${query}` : routePath;
}

function getDexFrameUrl(path, options) {
	return `https://ddex-chi.vercel.app/${withDexGameContext(path, options)}`;
}

function normalizeDexRoute(path) {
	return typeof path === 'string' ? path.replace(/^\/+/, '') : '';
}

function getDexBridgeState(slotKey) {
	return dexBridgeSlots[slotKey] || dexBridgeSlots.view;
}

function getDexSlotByKey(slotKey) {
	return slotKey === 'modal' ? getDexModalSlot() : getDexViewSlot();
}

function getDexFrameBySlot(slotKey) {
	return slotKey === 'modal' ? getDexModalFrame() : getDexFrame();
}

function getDexFrameOrigin(iframe) {
	try {
		const frameUrl = iframe ? (iframe.dataset.dexFrameUrl || iframe.src || '') : '';
		return frameUrl ? new URL(frameUrl, window.location.href).origin : '';
	} catch (error) {
		return '';
	}
}

function markDexBridgePending(slotKey) {
	getDexBridgeState(slotKey).ready = false;
}

function markDexBridgeReady(slotKey) {
	getDexBridgeState(slotKey).ready = true;
}

function clearDexPendingBridgeNavigation(slotKey) {
	const state = getDexBridgeState(slotKey);
	state.pendingFragment = '';
	state.pendingReason = '';
}

function setDexFrameSource(slotKey, iframe, frameUrl) {
	if (!iframe || iframe.dataset.dexFrameUrl === frameUrl) {
		return;
	}

	if (slotKey) {
		iframe.dataset.dexBridgeSlot = slotKey;
	}
	iframe.dataset.dexFrameUrl = frameUrl;
	clearDexPendingBridgeNavigation(slotKey);
	markDexBridgePending(slotKey);
	iframe.src = frameUrl;
}

function postDexBridgeNavigation(slotKey, path, reason) {
	const iframe = getDexFrameBySlot(slotKey);
	const fragment = normalizeDexRoute(path);
	const targetOrigin = getDexFrameOrigin(iframe);

	if (!iframe || !iframe.contentWindow || !targetOrigin) {
		return false;
	}

	iframe.contentWindow.postMessage(
		{
			type: DEX_NAVIGATE_MESSAGE_TYPE,
			fragment,
			requestId: `ddex-nav-${slotKey}-${Date.now()}-${dexBridgeRequestCounter++}`,
			reason: reason || 'calc-species-click'
		},
		targetOrigin
	);

	return true;
}

function queueDexBridgeNavigation(slotKey, path, reason) {
	const state = getDexBridgeState(slotKey);
	const fragment = normalizeDexRoute(path);
	state.pendingFragment = fragment;
	state.pendingReason = reason || 'calc-species-click';

	if (!postDexBridgeNavigation(slotKey, fragment, state.pendingReason)) {
		return false;
	}

	if (state.ready) {
		clearDexPendingBridgeNavigation(slotKey);
	}

	return true;
}

function flushDexPendingBridgeNavigation(slotKey) {
	const state = getDexBridgeState(slotKey);
	if (!state.pendingFragment) {
		return false;
	}

	if (!postDexBridgeNavigation(slotKey, state.pendingFragment, state.pendingReason || 'calc-species-click')) {
		return false;
	}

	clearDexPendingBridgeNavigation(slotKey);
	return true;
}

function ensureDexRouteInSlot(slotKey, path, reason) {
	const route = normalizeDexRoute(path);
	const frameUrl = getDexFrameUrl(route);
	const hadExistingFrame = !!getDexFrameBySlot(slotKey);
	const iframe = ensureDexFrameInSlot(getDexSlotByKey(slotKey), frameUrl, slotKey);

	if (!iframe) {
		return null;
	}

	if (route && hadExistingFrame && queueDexBridgeNavigation(slotKey, route, reason)) {
		return iframe;
	}

	if (!iframe.dataset.dexFrameUrl || iframe.dataset.dexFrameUrl !== frameUrl) {
		setDexFrameSource(slotKey, iframe, frameUrl);
	}

	return iframe;
}

function getDexSlotKeyFromMessageEvent(event) {
	const dexFrame = getDexFrame();
	if (dexFrame && dexFrame.contentWindow === event.source) {
		return 'view';
	}

	const dexModalFrame = getDexModalFrame();
	if (dexModalFrame && dexModalFrame.contentWindow === event.source) {
		return 'modal';
	}

	return '';
}

function isDexMessageFromExpectedOrigin(event, iframe) {
	const expectedOrigin = getDexFrameOrigin(iframe);
	return !expectedOrigin || event.origin === expectedOrigin;
}

function handleDexBridgeMessage(event) {
	const data = event.data || {};
	if (data.type !== DEX_READY_MESSAGE_TYPE) {
		return;
	}

	const slotKey = getDexSlotKeyFromMessageEvent(event);
	if (!slotKey) {
		return;
	}

	const iframe = getDexFrameBySlot(slotKey);
	if (!iframe || !isDexMessageFromExpectedOrigin(event, iframe)) {
		return;
	}

	markDexBridgeReady(slotKey);
	flushDexPendingBridgeNavigation(slotKey);
}

function getDexViewSlot() {
	return document.getElementById('dex-view-frame-slot');
}

function getDexModalOverlay() {
	return document.getElementById('dex-modal-overlay');
}

function getDexModalDialog() {
	return document.getElementById('dex-modal-dialog');
}

function getDexModalSlot() {
	return document.getElementById('dex-modal-frame-slot');
}

function getDexFrame() {
	return document.querySelector('#dex-view-frame-slot iframe.dex-window');
}

function getDexModalFrame() {
	return document.querySelector('#dex-modal-frame-slot iframe.dex-window');
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

function getDexModalAnchorRect() {
	const calculatorView = document.getElementById('calculator-view');
	if (!calculatorView) {
		return null;
	}

	const topSeparator = calculatorView.querySelector('hr');
	const panelWrapper = calculatorView.querySelector('.panel-wrapper');
	if (!panelWrapper) {
		return null;
	}

	const calculatorRect = calculatorView.getBoundingClientRect();
	const panelWrapperRect = panelWrapper.getBoundingClientRect();
	const separatorRect = topSeparator ? topSeparator.getBoundingClientRect() : null;
	return {
		left: calculatorRect.left,
		top: separatorRect ? separatorRect.bottom : panelWrapperRect.top,
		right: calculatorRect.right,
		bottom: panelWrapperRect.bottom
	};
}

function syncDexModalLayout() {
	const overlay = getDexModalOverlay();
	const dialog = getDexModalDialog();
	const iframe = getDexModalFrame();
	const anchorRect = getDexModalAnchorRect();

	if (!overlay || !dialog || overlay.hidden || !anchorRect) {
		return;
	}

	dialog.style.left = `${Math.max(0, anchorRect.left)}px`;
	dialog.style.top = `${Math.max(0, anchorRect.top)}px`;
	dialog.style.width = `${Math.max(320, anchorRect.right - anchorRect.left)}px`;
	dialog.style.height = `${Math.max(320, anchorRect.bottom - anchorRect.top)}px`;

	if (iframe) {
		iframe.style.height = '100%';
	}
}

function ensureDexFrameInSlot(slot, frameUrl, slotKey) {
	if (!slot) {
		return null;
	}

	let iframe = slot.querySelector('iframe.dex-window');
	if (!iframe) {
		iframe = document.createElement('iframe');
		iframe.className = 'dex-window';
		iframe.setAttribute('title', 'Dynamic Dex');
		iframe.setAttribute('loading', 'eager');
		slot.appendChild(iframe);
	}

	if (slotKey) {
		iframe.dataset.dexBridgeSlot = slotKey;
	}

	if (frameUrl && !iframe.dataset.dexFrameUrl) {
		if (iframe.getAttribute('src')) {
			iframe.dataset.dexFrameUrl = iframe.src || iframe.getAttribute('src');
		} else {
			setDexFrameSource(slotKey, iframe, frameUrl);
		}
	}

	return iframe;
}

function ensureDexViewLoaded() {
	const frameUrl = getDexFrameUrl('');
	const iframe = ensureDexFrameInSlot(getDexViewSlot(), frameUrl, 'view');
	if (!iframe) {
		return null;
	}
	if (!iframe.dataset.dexFrameUrl) {
		setDexFrameSource('view', iframe, frameUrl);
	}
	syncDexFrameLayout();
	return iframe;
}

function ensureDexModalLoaded(path) {
	return ensureDexRouteInSlot('modal', path || '', 'calc-species-click');
}

function openDexFullPage(path, options) {
	const settings = options || {};
	const route = normalizeDexRoute(path);
	const iframe = ensureDexRouteInSlot(
		'view',
		route,
		route ? 'calc-species-click' : 'nav-tab'
	);

	if (!iframe) {
		return;
	}

	closeDexModal();
	syncDexFrameLayout();

	if (settings.activateTab !== false && typeof window.setMainPageView === 'function') {
		window.setMainPageView('dex');
	}
}

function closeDexModal() {
	const overlay = getDexModalOverlay();
	if (!overlay) {
		return;
	}
	overlay.hidden = true;
}

function openDexModal(path) {
	const overlay = getDexModalOverlay();
	if (!overlay) {
		openDexFullPage(path);
		return;
	}

	const iframe = ensureDexModalLoaded(path);
	if (!iframe) {
		return;
	}

	overlay.hidden = false;
	syncDexModalLayout();
}

function openDexSpeciesLink(path) {
	if (isDexSpeciesModalEnabled()) {
		openDexModal(path);
		return;
	}
	openDexFullPage(path);
}

function silentLoadDex(url) {
	if (!getDexGameQuery()) {
		return;
	}
	openDexFullPage(url || '', { activateTab: false });
	console.log('Dex initialized');
}

function shouldAllowOpponentDexSprite($sprite) {
	if ($sprite.parent().attr('id') !== 'p2') {
		return true;
	}
	return TITLE.includes('Pokemon Null') || TITLE === 'Platinum Kaizo';
}

function getPokemonDexPathFromSpriteElement(spriteElement) {
	const $sprite = $(spriteElement);
	if (!$sprite.length || !shouldAllowOpponentDexSprite($sprite)) {
		return null;
	}

	const spriteSrc = $sprite.attr('src') || '';
	const spriteParts = spriteSrc.split('/');
	if (spriteParts.length < 4) {
		return null;
	}

	const spriteName = spriteParts[3].split('.')[0];
	return spriteName ? `pokemon/${spriteName}` : null;
}

function getPokemonDexPathFromPanelElement(panelElement) {
	const spriteElement = $(panelElement).find('.poke-sprite').get(0);
	if (!spriteElement) {
		return null;
	}
	return getPokemonDexPathFromSpriteElement(spriteElement);
}

$(document).ready(function() {
	window.addEventListener('message', handleDexBridgeMessage);

	syncDexFrameLayout();

	if (showDex) {
		silentLoadDex();
	}

	$('#main-nav-dex').click(function(e) {
		e.preventDefault();
		openDexFullPage('');
	});

	$('#open-dex').click(function(e) {
		e.preventDefault();
		const dexPath = getPokemonDexPathFromPanelElement($(this).closest('.panel'));
		if (dexPath) {
			openDexSpeciesLink(dexPath);
			return;
		}
		openDexFullPage('');
	});

	if ($('#open-dex:visible, #main-nav-dex:visible').length > 0) {
		$('.poke-sprite').click(function() {
			const dexPath = getPokemonDexPathFromSpriteElement(this);
			if (!dexPath) {
				return;
			}
			openDexSpeciesLink(dexPath);
		});

		$('#dex-show').click(function() {
			const dexPath = getPokemonDexPathFromPanelElement($(this).closest('.panel'));
			if (!dexPath) {
				return;
			}
			openDexSpeciesLink(dexPath);
		});
	}

	$(document).on('click', '[data-close-dex-modal]', function() {
		closeDexModal();
	});

	$(document).on('keydown', function(event) {
		if (event.key === 'Escape' && getDexModalOverlay() && !getDexModalOverlay().hidden) {
			closeDexModal();
		}
	});

	$(window).on('resize', function() {
		syncDexFrameLayout();
		syncDexModalLayout();
	});

	window.ensureDexViewLoaded = ensureDexViewLoaded;
	window.syncDexFrameLayout = syncDexFrameLayout;
	window.syncDexModalLayout = syncDexModalLayout;
	window.openDexFullPage = openDexFullPage;
	window.openDexSpeciesLink = openDexSpeciesLink;
	window.closeDexModal = closeDexModal;
});
