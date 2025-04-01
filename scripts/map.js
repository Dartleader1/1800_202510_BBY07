mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGlucmMiLCJhIjoiY204NHVldm9xMjlwNjJzcHlucHZ6ZTQyYSJ9.71yZqTl1XmBdfK3scyPyzA';
function showMap() {

    // Replace with your own Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGlucmMiLCJhIjoiY204NHVldm9xMjlwNjJzcHlucHZ6ZTQyYSJ9.71yZqTl1XmBdfK3scyPyzA';

    // Default location (YVR city hall) 49.26504440741209, -123.11540318587558
    let defaultCoords = { lat: 49.26504440741209, lng: -123.11540318587558};

    // FIRST, Find out where the user is 
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // User allowed location access
                let userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                initializeMap(userCoords);
                
            },
            (error) => {
                console.warn("Geolocation error:", error);
                initializeMap(defaultCoords); // Load with default location
            }
        );
    } else {
        console.error("Geolocation is not supported.");
        initializeMap(defaultCoords); // Load with default location
    }

    // NEXT load the map
    function initializeMap(coords) {
        // Create a new Mapbox map
        const map = new mapboxgl.Map({
            container: 'map', // The ID of the div
            style: 'mapbox://styles/mapbox/streets-v11', // Map style
            center: [coords.lng, coords.lat], // Center at user's location
            zoom: 17 // Zoom level
        });
    // Add user controls to map, zoom bar
    map.addControl(new mapboxgl.NavigationControl());

    //------------------------------------------------
    // Add listener for when the map finishes loading.
    // After loading, we can add map features
    //------------------------------------------------
    map.on('load', () => {

        //---------------------------------
        // Add interactive pins for the hikes WILL E BATTERIES
        //---------------------------------
        addBatteryPins(map);
        
        addUserPinCircle(map);
        
        
         });
    }
}
showMap();   // Call it! 

function addBatteryPins(map){
    map.loadImage(
        'https://cdn.iconscout.com/icon/free/png-256/pin-locate-marker-location-navigation-16-28668.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('eventpin', image); // Pin Icon

            // READING information from "events" collection in Firestore
            db.collection('batteries').get().then(allEvents => {
                const features = []; // Defines an empty array for information to be added to

                allEvents.forEach(doc => {
                    lat = doc.data().latitude;
                    lng = doc.data().longitude;
                    console.log(lat, lng);
                    coordinates = [lng, lat];
                    console.log(coordinates);
                    // Coordinates
                    event_name = doc.data().batteryName; // Event Name
                    owner = doc.data().name; // Text Preview
                    // img = doc.data().posterurl; // Image
                    // url = doc.data().link; // URL

                    // Pushes information into the features array
                    features.push({
                        'type': 'Feature',
                        'properties': {
                            'description': 
                            `<strong>${event_name}</strong><p>${owner}</p> 
                            <br> <a href="/hike.html?id=${doc.id}" target="_blank" 
                            `
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coordinates
                        }
                    });
                });

                // Adds features (in our case, pins) to the map
                // "places" is the name of this array of features
                map.addSource('places', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': features
                    }
                });

                // Creates a layer above the map displaying the pins
                map.addLayer({
                    'id': 'places',
                    'type': 'symbol',
                    'source': 'places',
                    'layout': {
                        'icon-image': 'eventpin', // Pin Icon
                        'icon-size': 0.1, // Pin Size
                        'icon-allow-overlap': true // Allows icons to overlap
                    }
                });

                // When one of the "places" markers are clicked,
                // create a popup that shows information 
                // Everything related to a marker is save in features[] array
                map.on('click', 'places', (e) => {
                    // Copy coordinates array.
                    const coordinates = e.features[0].geometry.coordinates.slice();
                    const description = e.features[0].properties.description;

                    // Ensure that if the map is zoomed out such that multiple 
                    // copies of the feature are visible, the popup appears over 
                    // the copy being pointed to.
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                });

                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on('mouseenter', 'places', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Defaults cursor when not hovering over the places layer
                map.on('mouseleave', 'places', () => {
                    map.getCanvas().style.cursor = '';
                });
            });
        }
    );
} 

//-----------------------------------------------------
// Add pin for showing where the user is.
// This is a separate function so that we can use a different
// looking pin for the user.  
// This version uses a pin that is just a circle. 
//------------------------------------------------------
function addUserPinCircle(map) {

    // Adds user's current location as a source to the map
    navigator.geolocation.getCurrentPosition(position => {
        const userLocation = [position.coords.longitude, position.coords.latitude];
        console.log(userLocation);
        if (userLocation) {
            map.addSource('userLocation', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': userLocation
                        },
                        'properties': {
                            'description': 'Your location'
                        }
                    }]
                }
            });

            // Creates a layer above the map displaying the pins
            // Add a layer showing the places.
            map.addLayer({
                'id': 'userLocation',
                'type': 'circle', // what the pins/markers/points look like
                'source': 'userLocation',
                'paint': { // customize colour and size
                    'circle-color': 'blue',
                    'circle-radius': 9,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });
            
            getClickedLocation(map, (clickedLocation) => {
                getRoute(map, userLocation, clickedLocation);
            });

            // Map On Click function that creates a popup displaying the user's location
            map.on('click', 'userLocation', (e) => {
                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(map);
            });

            // Change the cursor to a pointer when the mouse is over the userLocation layer.
            map.on('mouseenter', 'userLocation', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Defaults
            // Defaults cursor when not hovering over the userLocation layer
            map.on('mouseleave', 'userLocation', () => {
                map.getCanvas().style.cursor = '';
            });
        }
    });
}

        //-----------------------------------------------------------------------------
        // This function is asynchronous event listener for when the user clicks on the map.
        // This function will return in the callback, the coordinates of the clicked location
        // and display a pin at that location as a map layer
        //
        // @params   map:  the map object;
        //           callback:  a function that will be called with the clicked location
        //-----------------------------------------------------------------------------
        function getClickedLocation(map, callback) {
            map.on('click', (event) => {
                const clickedLocation = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
                const end = {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: clickedLocation
                            }
                        }
                    ]
                };
                if (map.getLayer('end')) {
                    map.getSource('end').setData(end);
                } else {
                    map.addLayer({
                        id: 'end',
                        type: 'circle',
                        source: {
                            type: 'geojson',
                            data: {
                                type: 'FeatureCollection',
                                features: [
                                    {
                                        type: 'Feature',
                                        properties: {},
                                        geometry: {
                                            type: 'Point',
                                            coordinates: clickedLocation
                                        }
                                    }
                                ]
                            }
                        },
                        paint: {
                            'circle-radius': 10,
                            'circle-color': '#f30'
                        }
                    });
                }
                console.log(clickedLocation);
                callback(clickedLocation);
            });
        }

        // --------------------------------------------------------------
        // This is an asynchronous function that will use the API to get
        // the route from start to end. It will display the route on the map
        // and provide turn-by-turn directions in the sidebar.
        //
        // @params   map:  the start and end coordinates;
        //           start and end:  arrays of [lng, lat] coordinates
        // -------------------------------------------------------------
        async function getRoute(map, start, end) {
            // make a directions request using cycling profile
            // an arbitrary start will always be the same
            // only the end or destination will change
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry.coordinates;
            console.log("route is " + route);
            const geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            };
            // if the route already exists on the map, we'll reset it using setData
            if (map.getSource('route')) {
                map.getSource('route').setData(geojson);
            }
            // otherwise, we'll make a new request
            else {
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                        type: 'geojson',
                        data: geojson
                    },
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#3887be',
                        'line-width': 5,
                        'line-opacity': 0.75
                    }
                });
            }
            //--------------------------------------------
            // display the turn-by-turn legs of the route
            // get the sidebar and add the instructions
            // we use a bicycle icon for fun!  :)
            //--------------------------------------------
            const instructions = document.getElementById('instructions');
            const steps = data.legs[0].steps;

            let tripInstructions = '';
            for (const step of steps) {
                tripInstructions += `<li>${step.maneuver.instruction}</li>`;
            }
            instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
                data.duration / 60
            )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
        }