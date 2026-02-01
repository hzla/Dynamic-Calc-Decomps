// ===== For Communication with Mastersheet =====


const channel = new BroadcastChannel("my_app_channel");
const TAB_ID = crypto.randomUUID?.() ?? String(Date.now()) + Math.random();

function onMessage(handler) {
  channel.addEventListener("message", (e) => {
    const msg = e.data;
    if (!msg || msg.sender === TAB_ID) return;
    handler(msg);
  });
}

onMessage((msg) => {
  if (msg.type !== "SET_ID") return;

  const setId = msg.payload?.setId;
  if (!setId) return;

  setTrainerFromId(setId)
  console.log("Received SET_ID:", setId);

});

function setTrainerFromId(setId) {
  currentTrainerSet = customLeads[setId].split("[")[0]
  localStorage["right"] = currentTrainerSet

  $('.opposing').val(currentTrainerSet)
  $('.opposing').change()
  $('.opposing .select2-chosen').text(currentTrainerSet)
  if ($('.info-group.opp > * > .forme').is(':visible')) {
      $('.info-group.opp > * > .forme').change()
  }
}

