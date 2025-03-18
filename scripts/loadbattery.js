function populateReviews() {
    console.log("test");
    let hikeCardTemplate = document.getElementById("reviewCardTemplate");
    let hikeCardGroup = document.getElementById("reviewCardGroup");

    let params = new URL(window.location.href); // Get the URL from the search bar
    let hikeID = params.searchParams.get("docID");

    // Double-check: is your collection called "Reviews" or "reviews"?
    db.collection("batteries")
        .get()
        .then((allReviews) => {
            reviews = allReviews.docs;
            console.log(reviews);
            reviews.forEach((doc) => {
                var title = doc.data().batteryName;
                var level = doc.data().batteryCable;
                var season = doc.data().batteryCapacity;
                var description = doc.data().batteryPort;
                var scrambled = doc.data().userID;

                let reviewCard = hikeCardTemplate.content.cloneNode(true);
                reviewCard.querySelector(".batteryName").innerHTML = title;
                reviewCard.querySelector(".batteryCable").innerHTML = `Cable Type: ${level}`;
                reviewCard.querySelector(".batteryCapacity").innerHTML = `BatteryCapacity: ${season} mAh`;
                reviewCard.querySelector(".batteryPort").innerHTML = `Ports: ${description} `;

                hikeCardGroup.appendChild(reviewCard);
            });
        });
}

populateReviews();