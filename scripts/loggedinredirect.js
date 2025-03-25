// redirects user from login page to main if logged in
function loggedInRedirect() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = "main.html";
            console.log("redirecting logged in user...");
        } else {
            console.log("No user is logged in.");
        }
    });
}

loggedInRedirect();