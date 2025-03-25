var currentUser;
  function getNameFromAuth() {
      firebase.auth().onAuthStateChanged(user => {
          // Check if a user is signed in:
          if (user) {
            currentUser = db.collection("users").doc(user.uid)
            currentUser.get()
              // Do something for the currently logged-in user here: 
              .then(userDoc => {
           // get the data fields of the user
           let userName = userDoc.data().name;
           document.getElementById("name-goes-here").innerText = userName
         })
     } else {
       console.log("No user is logged in");
     }
   });
 }
 //run the code
 getNameFromAuth();
 
function logout() {
  firebase.auth().signOut().then(() => {
      // Sign-out successful.
      console.log("logging out user");
      window.location.href = "index.html";
    }).catch((error) => {
      // An error happened.
    });
}