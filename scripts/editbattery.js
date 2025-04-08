function getBatteryIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

document.addEventListener("DOMContentLoaded", function () {
  const batteryId = getBatteryIdFromURL();
  if (!batteryId) {
    alert("Battery ID missing from URL.");
    return;
  }

  const nameInput = document.getElementById("batteryName");
  const cableInput = document.getElementById("batteryCable");
  const capacityInput = document.getElementById("batteryCapacity");
  const portInput = document.getElementById("batteryPort");
  const cableLengthInput = document.getElementById("batteryCableLength");

  db.collection("batteries").doc(batteryId).get().then((doc) => {
    if (!doc.exists) {
      alert("Battery not found.");
      return;
    }

    const battery = doc.data();
    nameInput.value = battery.batteryName;
    cableInput.value = battery.batteryCable;
    capacityInput.value = battery.batteryCapacity;
    portInput.value = battery.batteryPort;
    cableLengthInput.value = battery.batteryCableLength || 3;

    document.getElementById("capacityValue").innerText = battery.batteryCapacity + " mAh";
    document.getElementById("portValue").innerText = battery.batteryPort;
    document.getElementById("lengthValue").innerText = (battery.batteryCableLength || 3) + " ft";
  });

  document.getElementById("editBatteryForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const batteryName = nameInput.value.trim();
    const batteryCable = cableInput.value;
    const batteryCapacity = capacityInput.value;
    const batteryPort = portInput.value;
    const batteryCableLength = cableLengthInput.value;

    if (!batteryName) {
      alert("Battery name is required.");
      return;
    }

    db.collection("batteries").doc(batteryId).update({
      batteryName,
      batteryCable,
      batteryCapacity,
      batteryPort,
      batteryCableLength,
      last_updated: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      window.location.href = "rent.html";
    }).catch((err) => {
      console.error("Failed to update battery:", err);
      alert("Something went wrong.");
    });
  });

  document.getElementById("deleteBatteryButton").addEventListener("click", function () {
    if (!confirm("Are you sure you want to delete this battery?")) return;

    db.collection("batteries").doc(batteryId).delete()
      .then(() => {
        window.location.href = "rent.html";
      })
      .catch((error) => {
        console.error("Failed to delete battery:", error);
        alert("Could not delete battery.");
      });
  });
});
