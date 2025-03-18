document.addEventListener("DOMContentLoaded", function () {
    const rentalDetails = JSON.parse(localStorage.getItem("savedBattery"));

    if (rentalDetails) {
        document.getElementById("batteryName").innerText = rentalDetails.name || "Battery Name";
        document.getElementById("batteryType").innerText = `Type: ${rentalDetails.cableType}`;
        document.getElementById("batteryCapacity").innerText = `Power Capacity: ${rentalDetails.capacity} mAh`;
        document.getElementById("batteryCondition").innerText = `Condition: ${rentalDetails.condition || "New"}`;
        document.getElementById("rentalPrice").innerText = `Price: $${rentalDetails.price}/day`;
        document.getElementById("rentalLocation").innerText = `Location: ${rentalDetails.location || "Unknown"}`;

        if (rentalDetails.imageUrl) {
            document.getElementById("batteryImage").src = rentalDetails.imageUrl;
        }
    }
});

// Rent function (redirects to main.html)
function rentBattery() {
    alert("Battery rented successfully!");
    window.location.href = "main.html";
}

// Back function (redirects to post-listing.html)
function goBack() {
    window.location.href = "post-listing.html";
}
