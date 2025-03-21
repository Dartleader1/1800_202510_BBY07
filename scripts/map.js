mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGlucmMiLCJhIjoiY204NHVldm9xMjlwNjJzcHlucHZ6ZTQyYSJ9.71yZqTl1XmBdfK3scyPyzA';

function showMap() {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.9641, 49.2513], // Centered around Burnaby
        zoom: 13
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
        addUserPin(map);
        addRedPins(map);
    });

    adjustMapHeight();
    window.addEventListener("resize", adjustMapHeight);
}

// Adjusts map height based on screen size
function adjustMapHeight() {
    const mapElement = document.getElementById("map");
    if (window.innerWidth < 768) {
        mapElement.style.height = "33vh";
    } else {
        mapElement.style.height = "100vh";
    }
}

// Adds a blue pin for BCIT Burnaby Campus (User Location)
function addUserPin(map) {
    const userCoordinates = [-122.9641, 49.2505];

    new mapboxgl.Marker({ color: "blue" })
        .setLngLat(userCoordinates)
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Your Location: BCIT Burnaby Campus</strong>"))
        .addTo(map);
}

// Add red pins for battery locations
function addRedPins(map) {
    const userCoordinates = [-122.9641, 49.2505]; // BCIT Burnaby Campus
    const locations = [
        {
            coordinates: [-122.9975, 49.2664],
            name: "The Amazing Brentwood",
            batteryType: "USB A"
        },
        {
            coordinates: [-122.9753, 49.2485],
            name: "Burnaby Hospital",
            batteryType: "Type C"
        },
        {
            coordinates: [-122.9696, 49.2480],
            name: "BCIT Parking Lot L",
            batteryType: "USB B"
        },
        {
            coordinates: [-123.0006, 49.2276],
            name: "Cineplex Cinemas Metropolis",
            batteryType: "Micro USB"
        }
    ];

    locations.forEach(location => {
        // Calculate distance (approximate using Haversine formula)
        location.distance = calculateDistance(userCoordinates, location.coordinates);

        new mapboxgl.Marker({ color: "red" })
            .setLngLat(location.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location.name}</strong><br>Battery Type: ${location.batteryType}<br>Distance: ${location.distance.toFixed(2)} km`))
            .addTo(map);
    });

    // Sort locations by distance (closest to farthest)
    locations.sort((a, b) => a.distance - b.distance);

    // Display battery list on the bottom-right (for desktop users)
    if (window.innerWidth >= 768) {
        displayBatteryList(locations);
    }
}

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1, coord2) {
    function toRad(value) {
        return value * Math.PI / 180;
    }

    const R = 6371; // Radius of Earth in km
    const dLat = toRad(coord2[1] - coord1[1]);
    const dLon = toRad(coord2[0] - coord1[0]);
    const lat1 = toRad(coord1[1]);
    const lat2 = toRad(coord2[1]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Display the list of available batteries
function displayBatteryList(locations) {
    let batteryList = document.createElement("div");
    batteryList.id = "battery-list";
    batteryList.innerHTML = "<h3>Available Battery Around You</h3>";

    locations.forEach(location => {
        let item = document.createElement("div");
        item.classList.add("battery-item");
        item.innerHTML = `<strong>${location.name}</strong><br>Battery Type: ${location.batteryType}<br>Distance: ${location.distance.toFixed(2)} km`;
        batteryList.appendChild(item);
    });

    document.body.appendChild(batteryList);
}

// Initialize the map
showMap();
