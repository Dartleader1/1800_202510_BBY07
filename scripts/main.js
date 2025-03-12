function writeBattery() {
    //define a variable for the collection you want to create in Firestore to populate data
    var batteriesRef = db.collection("batteries");

    batteriesRef.add({
        code: "BBY01",
        name: "Burnaby Lake Park Trail", //replace with your own city?
        city: "Burnaby",
        province: "BC",
				details: "A lovely place for lunch walk",
        lat: 49.2467097082573,
        lng: -122.9187029619698,
        last_updated: firebase.firestore.FieldValue.serverTimestamp()  //current system time
    });
}
function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
      // Check if a user is signed in:
      if (user) {
          // Do something for the currently logged-in user here: 
          console.log("user id: " + user.uid); //print the uid in the browser console
          console.log("user name: " + user.displayName);  //print the user name in the browser console
          userName = user.displayName;

          document.getElementById("name-goes-here").innerText = userName;    
      } else {
          // No user is signed in.
          console.log ("No user is logged in");
      }
  });
}
getNameFromAuth();
function logout() {
  firebase.auth().signOut().then(() => {
      // Sign-out successful.
      console.log("logging out user");
    }).catch((error) => {
      // An error happened.
    });
}
