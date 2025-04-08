let currentUserID = null;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUserID = user.uid;
    populateUserBatteries();
  } else {
    console.log("No user signed in.");
  }
});

function populateUserBatteries() {
  let batteryCardTemplate = document.getElementById("BatteryCard");
  let batteryCardGroup = document.getElementById("batteryCardGroup");

  db.collection("batteries")
    .where("userID", "==", currentUserID)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const battery = doc.data();

        let batteryCard = batteryCardTemplate.content.cloneNode(true);
        batteryCard.querySelector(".batteryName").innerText = battery.batteryName;
        batteryCard.querySelector(".batteryCable").innerText = `Cable Type: ${battery.batteryCable}`;
        batteryCard.querySelector(".batteryCapacity").innerText = `Battery Capacity: ${battery.batteryCapacity} mAh`;
        batteryCard.querySelector(".batteryPort").innerText = `Ports: ${battery.batteryPort}`;
        batteryCard.querySelector(".userName").innerText = `You`;

        batteryCardGroup.appendChild(batteryCard);
      });
    })
    .catch((error) => {
      console.error("Error loading user batteries:", error);
    });
}
