//uploads battery information to the database
function saveBattery() {
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
            var displayName = user.displayName; 

            // Use device's location service
                 navigator.geolocation.getCurrentPosition((position) => {
                // Get location details
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                 
                    
            // Get the document for the current user.
            db.collection("batteries").add({
                batteryName: batteryName,
                // batteryPhoto: batteryPhoto,
                batteryCable: batteryCable,
                batteryPort: batteryPort,
                batteryCapacity: batteryCapacity,
                userID: userID,
                name: displayName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                latitude: lat,
                longitude: long,
                last_updated: firebase.firestore.FieldValue.serverTimestamp(), // Adds current system time
                active: false,
                reserved: false
            }).then((doc) => {
                console.log("Post document added with ID:", doc.id);
                // Optional: call another function, such as uploadPic, if you have an image to upload
                // uploadPic(doc.id);
                window.location.href = "main.html"; // Redirect to main page
            }).catch((error) => {
                console.error("Error adding document:", error);
            });
             (error) => {
            console.error("Error retrieving location:", error);
        }});;
    } else {
        console.log("Error: No user is logged in");
    }
}