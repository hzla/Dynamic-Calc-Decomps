
function syncToBattle() {
	fetch("http://127.0.0.1:31124/battle_state")
	  .then((res) => res.json())
	  .then((data) => {
	    console.log(data)
	    let side = "#p1"
	    let monData = data.playerActive[0]
	    $('#currentHpL1').val(monData.currentHp)


	  })
	  .catch((err) => {
	    console.error("Failed to fetch /battle_state:", err);
	  });
}

syncToBattle()