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
  const batteryCardTemplate = document.getElementById("BatteryCard");
  const batteryCardGroup = document.getElementById("batteryCardGroup");

  firebase.auth().onAuthStateChanged((user) => {
    if (!user) return;

    db.collection("batteries")
      .where("userID", "==", user.uid)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const battery = doc.data();
          const clone = batteryCardTemplate.content.cloneNode(true);

          clone.querySelector(".batteryName").innerText = battery.batteryName;
          clone.querySelector(".batteryCable").innerText = "Cable: " + battery.batteryCable;
          clone.querySelector(".batteryCapacity").innerText = "Capacity: " + battery.batteryCapacity + " mAh";
          clone.querySelector(".batteryPort").innerText = "Ports: " + battery.batteryPort;
          clone.querySelector(".userName").innerText = "You";

          // ✅ Set data-id for delete button
          const deleteBtn = clone.querySelector(".delete-battery");
          deleteBtn.setAttribute("data-id", doc.id);

          const editBtn = clone.querySelector(".edit-battery");
          editBtn.addEventListener("click", function () {
            window.location.href = `/pages/editbattery.html?id=${doc.id}`;
          });
          batteryCardGroup.appendChild(clone);
        });
      });
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

    db.collection("batteries").doc(docId).delete()
      .then(() => {
        console.log("Document deleted:", docId);
        e.target.closest(".card").remove();
      })
      .catch((error) => {
        console.error("Error deleting battery:", error);
        alert("Failed to delete battery. Please try again.");
      });
  }
});
