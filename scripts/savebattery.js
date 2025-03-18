//uploads battery information to the database
function saveBattery() {
    console.log("Saving battery for user");
    let batteryName = document.getElementById("batteryName").value;
    // let batteryPhoto = document.getElementById("batteryPhoto").value; UNIMPLEMENTED
    let batteryCable = document.getElementById("batteryCable").value;
    let batteryPort = document.getElementById("batteryPort").value;
    let batteryCapacity = document.getElementById("batteryCapacity").value;

console.log(batteryName, batteryCable, batteryPort, batteryCapacity);

var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Get the document for the current user.
        db.collection("batteries").add({
            batteryName: batteryName,
            // batteryPhoto: batteryPhoto,
            batteryCable: batteryCable,
            batteryPort: batteryPort,
            batteryCapacity: batteryCapacity,
            userID: userID,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            window.location.href = "main.html"; // Redirect to main page
        });
}
}