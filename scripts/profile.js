var currentUser;               //points to the document of the user who is logged in
function populateUserInfo() {
            firebase.auth().onAuthStateChanged(user => {
                // Check if user is signed in:
                if (user) {
                    //go to the correct user document by referencing to the user uid
                    currentUser = db.collection("users").doc(user.uid)
                    //get the document for current user.
                    currentUser.get()
                        .then(userDoc => {
                            //get the data fields of the user
                            let userName = userDoc.data().name;
                            let userEmail = userDoc.data().email;
                            let userCountry = userDoc.data().country;
                            let userPhoto = userDoc.data().profileImage;

                            function displayProfileEditImage(base64String) {
                                var imgElement = document.getElementById("uploadPhoto");
                                imgElement.src = "data:image/png;base64," + base64String; 
                              }

                              displayProfileEditImage(userPhoto);
                            //if the data fields are not empty, then write them in to the form.
                            if (userName != null) {
                                document.getElementById("nameInput").value = userName;
                            }
                            if (userEmail != null) {
                                document.getElementById("emailInput").value = userEmail;
                            }
                            if (userCountry != null) {
                                document.getElementById("countryInput").value = userCountry;
                            }
                        })
                } else {
                    // No user is signed in.
                    console.log ("No user is signed in");
                }
        });
}

//call the function to run it 
populateUserInfo();

function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
 }

 function saveUserInfo() {
    //a) get user entered values
    userName = document.getElementById('nameInput').value;       //get the value of the field with id="nameInput"
    userEmail = document.getElementById('emailInput').value;     //get the value of the field with id="schoolInput"
    userCountry = document.getElementById('countryInput').value;       //get the value of the field with id="cityInput"
    //b) update user's document in Firestore
    currentUser.update({
        name: userName,
        email: userEmail,
        country: userCountry
    })
    .then(() => {
        console.log("Document successfully updated!");
    })
    //c) disable edit 
    document.getElementById('personalInfoFields').disabled = true;
}

function uploadImage(){
// Attach event listener to the file input
// Function to handle file selection and Base64 encoding
document.getElementById("fileInput").addEventListener("change", handleFileSelect);
function handleFileSelect(event) {
    var file = event.target.files[0]; // Get the selected file

    if (file) {
        var reader = new FileReader(); // Create a FileReader to read the file

        // When file reading is complete
        reader.onload = function (e) {
            var base64String = e.target.result.split(',')[1]; // Extract Base64 data

            // Save the Base64 string to Firestore under the user's profile
            saveProfileImage(base64String);
        };

        // Read the file as a Data URL (Base64 encoding)
        reader.readAsDataURL(file);
    }
}
        // Function to save the Base64 image to Firestore
        function saveProfileImage(base64String) {
            // Save Base64 image as a field in the user's Firestore document
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    userId = user.uid;
                    db.collection("users").doc(userId).set({
                        profileImage: base64String
                    }, { merge: true }) // Merge prevents overwriting existing data
                        .then(function () {
                            console.log("Profile image saved successfully!");
                            displayProfileImage(base64String); // Display the saved image
                            displayProfileEditImage(base64String); // Display the saved image in navbar
                        })
                        .catch(function (error) {
                            console.error("Error saving profile image: ", error);
                        });
                } else {
                    console.error("No user is signed in.");
                }   
            });
        }
        function displayProfileEditImage(base64String) {
            var imgElement = document.getElementById("uploadPhoto");
            imgElement.src = "data:image/png;base64," + base64String; 
          }
                // Function to display the stored Base64 image on the profile page
                function displayProfileImage(base64String) {
                    var imgElement = document.getElementById("userpfp");
                    imgElement.src = "data:image/png;base64," + base64String; // Set the image source
                }
}
