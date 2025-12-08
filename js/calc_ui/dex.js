function loadDex() {
	// Create iframe element

	if ($('iframe').length > 0) {
		$('iframe').show()
		$('.iframe-close-btn').show()
		return;
	}

	const iframe = document.createElement('iframe');

	// Set iframe properties
	iframe.src = 'https://ddex-chi.vercel.app/?game=blazeblack2redux';
	iframe.style.position = 'fixed';
	iframe.style.top = '50%';
	iframe.style.left = '50%';
	iframe.style.transform = 'translate(-50%, -50%)';
	iframe.style.width = '100vw';
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
	closeBtn.style.left = 'calc(100vw - 20px)';
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

$(document).ready(function() {
	 $(document).keydown(async function (e) {
        if ((e.altKey || e.ctrlKey) && (e.key == "d")){ 
            e.preventDefault()
            loadDex()
        } 
    })
})








