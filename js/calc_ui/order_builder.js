orders = {}
prevSetName = null
$('#p2 legend').on('click', function() {
	setName = $('.opposing .select2-chosen').text()
	orders[setName] = {}

	// update next pointer for prev trainer to point to current trainer
	// update prev pointer for current trainer to point to prev trainer
	if (prevSetName) {
		orders[setName].prev = prevSetName
		orders[prevSetName].next = setName
	}
	prevSetName = setName
	console.log(orders)
})