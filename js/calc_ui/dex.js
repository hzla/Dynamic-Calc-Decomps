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

	// Comment out for prod
	// iframe.src = `http://localhost:3000/${url}`;

	iframe.style.position = 'fixed';
	iframe.style.top = '50%';
	iframe.style.left = '50%';
	iframe.style.transform = 'translate(-50%, -50%)';
	iframe.style.width = '40vw';
	iframe.style.height = '90vh';
	iframe.style.border = '2px solid #333';
	iframe.style.borderRadius = '8px';
	iframe.style.zIndex = '999999';
	iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';

	// Optional: Add a close button
	const closeBtn = document.createElement('button');
	closeBtn.className = 'iframe-close-btn';
	closeBtn.textContent = '✕';
	closeBtn.style.position = 'fixed';
	closeBtn.style.top = 'calc(5vh - 20px)';
	closeBtn.style.left = 'calc(70vw - 20px)';
	closeBtn.style.zIndex = '1000000';
	closeBtn.style.background = '#ff4444';
	closeBtn.style.color = 'white';
	closeBtn.style.border = 'none';
	closeBtn.style.borderRadius = '50%';
	closeBtn.style.width = '40px';
	closeBtn.style.height = '40px';
	closeBtn.style.cursor = 'pointer';
	closeBtn.style.fontSize = '20px';
	closeBtn.style.fontWeight = 'bold';

	closeBtn.onclick = () => {
	    iframe.style.display = 'none';
	    closeBtn.style.display = 'none';
	};

	// Add elements to page
	document.body.appendChild(iframe);
	document.body.appendChild(closeBtn);
}

function silentLoadDex(url) {
	loadDex(`?game=${cleanString(TITLE)}`)
	console.log("Dex initialized")
	$('iframe').hide()
	$('.iframe-close-btn').hide()
}

$(document).ready(function() {
	if (showDex) {
		silentLoadDex()
	}
	
	 $('#open-dex, #main-nav-dex').click(function(e) {
	 	e.preventDefault()
	 	loadDex(`?game=${cleanString(TITLE)}`)
	 })

	 if ($('#open-dex:visible, #main-nav-dex:visible').length > 0) {
	 	$('.poke-sprite').click(function() {
	 		
	 		if ($(this).parent().attr('id') == "p2") {
	 			if (TITLE != "Pokemon Null" && TITLE != "Platinum Kaizo") {
	 				return
	 			}
	 		}

	 		var dexPok = $(this).attr('src').split("/")[3].split(".")[0]
	 		

	 		$('iframe').remove()
	 		$('.iframe-close-btn').remove()
	 		loadDex(`pokemon/${dexPok}`)
	 	})

	 	$('#dex-show').click(function() {
	 		var dexPok = $(this).parents('.panel').find('.poke-sprite').attr('src').split("/")[3].split(".")[0]
	 		console.log(dexPok)
	 		$('iframe').remove()
	 		$('.iframe-close-btn').remove()
	 		loadDex(`pokemon/${dexPok}`)
	 	})
	 }
})







