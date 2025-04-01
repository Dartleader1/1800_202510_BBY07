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
           let userPhoto = userDoc.data().profileImage;

            // show user pfp when also showing name
           displayProfileImage(userPhoto);


           document.getElementById("name-goes-here").innerText = userName
         })
     } else {
       console.log("No user is logged in");
     }
   });
 }
 function displayProfileImage(base64String) {
  var imgElement = document.getElementById("userpfp");
  imgElement.src = "data:image/png;base64," + base64String; 
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