// displays batteries the logged in user owns from firebase in browser
function populateBatteries() {
    let batteryCard = document.getElementById("BatteryCard");
    let batteryCardGroup = document.getElementById("batteryCardGroup");
    currentUser = db.collection("users").doc(user.uid)

    db.collection("batteries")
        .get()
        .then((allBatteries) => {
            batteries = allBatteries.docs;
            console.log(batteries);
            batteries.forEach((doc) => {
                var title = doc.data().batteryName;
                var cable = doc.data().batteryCable;
                var capacity = doc.data().batteryCapacity;
                var port = doc.data().batteryPort;
                var user = doc.data().name;

                let batteryCards = batteryCard.content.cloneNode(true);
                batteryCards.querySelector(".batteryName").innerHTML = title;
                batteryCards.querySelector(".batteryCable").innerHTML = `Cable Type: ${cable}`;
                batteryCards.querySelector(".batteryCapacity").innerHTML = `BatteryCapacity: ${capacity} mAh`;
                batteryCards.querySelector(".batteryPort").innerHTML = `Ports: ${port} `;
                batteryCards.querySelector(".userName").innerHTML = `User: ${user} `;

                batteryCardGroup.appendChild(batteryCards);
            });
        });
}
populateBatteries();