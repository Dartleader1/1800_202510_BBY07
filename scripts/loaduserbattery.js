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

        let clone = batteryCardTemplate.content.cloneNode(true);
        clone.querySelector(".batteryName").innerText = battery.batteryName;
        clone.querySelector(".batteryCable").innerText = `Cable Type: ${battery.batteryCable}`;
        clone.querySelector(".batteryCapacity").innerText = `Battery Capacity: ${battery.batteryCapacity} mAh`;
        clone.querySelector(".batteryPort").innerText = `Ports: ${battery.batteryPort}`;
        clone.querySelector(".userName").innerText = `You`;
        clone.querySelector(".delete-battery").setAttribute("data-id", doc.id);

        batteryCardGroup.appendChild(clone);
      });
    })
    .catch((error) => {
      console.error("Error loading user batteries:", error);
    });
}


document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("delete-battery")) {
    const docId = e.target.getAttribute("data-id");
    if (!docId) {
      alert("Missing document ID.");
      return;
    }

    if (!confirm("Are you sure you want to delete this battery?")) {
      return;
    }

    // ✅ Delete from Firestore
    db.collection("batteries").doc(docId).delete()
      .then(() => {
        console.log("Document deleted:", docId);
        // ✅ Remove card from DOM
        e.target.closest(".card").remove();
      })
      .catch((error) => {
        console.error("Error deleting battery:", error);
        alert("Failed to delete battery. Please try again.");
      });
  }
});
