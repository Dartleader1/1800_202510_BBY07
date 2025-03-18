function populateReviews() {
    console.log("test");
    let hikeCardTemplate = document.getElementById("reviewCardTemplate");
    let hikeCardGroup = document.getElementById("reviewCardGroup");

    let params = new URL(window.location.href);

    db.collection("batteries")
        .get()
        .then((allReviews) => {
            reviews = allReviews.docs;
            console.log(reviews);
            reviews.forEach((doc) => {
                var title = doc.data().batteryName;
                var cable = doc.data().batteryCable;
                var capacity = doc.data().batteryCapacity;
                var port = doc.data().batteryPort;
                var user = doc.data().userID;

                let reviewCard = hikeCardTemplate.content.cloneNode(true);
                reviewCard.querySelector(".batteryName").innerHTML = title;
                reviewCard.querySelector(".batteryCable").innerHTML = `Cable Type: ${cable}`;
                reviewCard.querySelector(".batteryCapacity").innerHTML = `BatteryCapacity: ${capacity} mAh`;
                reviewCard.querySelector(".batteryPort").innerHTML = `Ports: ${port} `;
                reviewCard.querySelector(".batteryPort").innerHTML = `User: ${user} `;


                hikeCardGroup.appendChild(reviewCard);
            });
        });
}

populateReviews();