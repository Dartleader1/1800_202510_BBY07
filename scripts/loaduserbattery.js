// displays batteries the logged in user owns from firebase in browser
var currentUser;
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        currentUser = db.collection("users").doc(user.uid);
        populateBatteries(currentUser);
    } else {
      // No user is signed in.
    }
  });


  function displayuserbats(){
    db.collection("batteries").get()
    .then(snap=>{
        snap.forEach(doc=>{
            var name = doc.data().name;
            var details = doc.data().details;
                        let newcard = document.getElementById("cardtemplate").content.cloneNode(true);
            newcard.querySelector('.card-title').innerHTML = name;
            newcard.querySelector('.card-text').innerHTML = details;
            newcard.querySelector('.favourite').setAttribute("id", doc.id);
            newcard.querySelector('.favourite').setAttribute("onclick", "savefave(doc.id)");
            document.getElementById("posts-go-here").appendChild(newcard);
       })
    })
}

displayuserbats();
function populateBatteries() {
    let batteryCard = document.getElementById("BatteryCard");
    let batteryCardGroup = document.getElementById("batteryCardGroup");

    db.collection("batteries").get()
        .then((allBatteries) => {
            batteries = allBatteries.docs;
            console.log(batteries);
            batteries.forEach((doc) => {
                var title = doc.data().batteryName;
                var cable = doc.data().batteryCable;
                var capacity = doc.data().batteryCapacity;
                var port = doc.data().batteryPort;
                var userID = doc.data().userID;

                if(currentUser == userID){
                    console.log("User ID: " + userID);
                let batteryCards = batteryCard.content.cloneNode(true);
                batteryCards.querySelector(".batteryName").innerHTML = title;
                batteryCards.querySelector(".batteryCable").innerHTML = `Cable Type: ${cable}`;
                batteryCards.querySelector(".batteryCapacity").innerHTML = `BatteryCapacity: ${capacity} mAh`;
                batteryCards.querySelector(".batteryPort").innerHTML = `Ports: ${port} `;
                batteryCards.querySelector(".userName").innerHTML = `User: ${user} `;

                batteryCardGroup.appendChild(batteryCards);
                }
 
            });
        });
}