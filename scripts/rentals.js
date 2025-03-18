document.addEventListener("DOMContentLoaded", function() {
    const rentalListings = document.getElementById("rentalListings");
    const savedBattery = JSON.parse(localStorage.getItem("savedBattery")) || {
        name: "Power Bank 1",
        cableType: "USB-C",
        capacity: "10000",
    };

    rentalListings.innerHTML = `
        <div class="col-md-6">
            <div class="card p-3">
                <img src="../images/default-battery.jpg" class="card-img-top" alt="Battery Image" style="max-width: 100%;">
                <div class="card-body">
                    <h5 class="card-title">${savedBattery.name}</h5>
                    <p class="card-text">Type: ${savedBattery.cableType}</p>
                    <p class="card-text">Distance: 3.2 km</p>
                    <button class="btn btn-primary w-100" onclick="selectRental()">Rent This</button>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="card p-3">
                <img src="../images/default-battery.jpg" class="card-img-top" alt="Battery Image" style="max-width: 100%;">
                <div class="card-body">
                    <h5 class="card-title">Power Bank 2</h5>
                    <p class="card-text">Type: Micro USB</p>
                    <p class="card-text">Distance: 4.5 km</p>
                    <button class="btn btn-primary w-100" onclick="selectRental()">Rent This</button>
                </div>
            </div>
        </div>
    `;
});

// Redirect to rental-details.html
function selectRental() {
    window.location.href = "rental-details.html";
}
