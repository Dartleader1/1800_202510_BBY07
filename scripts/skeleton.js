//---------------------------------------------------
// This function loads the parts of your skeleton 
// (navbar, footer, and other things) into html doc. 
//---------------------------------------------------
function loadSkeleton() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {                   
		        // If the "user" variable is not null, then someone is logged in
            // User is signed in.
            // Do something for the user here.
            console.log($('#navbarPlaceholder').load('/text/nav_after_login.html'));
        } else {
            // No user is signed in.
            console.log($('#navbarPlaceholder').load('/text/nav_before_login.html'));
        }
    });
}
loadSkeleton(); //invoke the function

//show login dropdown
function showDropDown(){
    if (document.getElementById("profileDropDown").style.display == "block") {
    document.getElementById("profileDropDown").style.display = "none"
    document.getElementById("close-profile").style.display = "none";

    } else {
        document.getElementById("profileDropDown").style.display = "block";
        document.getElementById("close-profile").style.display = "block";

        getNameFromAuth();

    }
};
