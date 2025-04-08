mapboxgl.accessToken = 'pk.eyJ1IjoianVzdGlucmMiLCJhIjoiY204NHVldm9xMjlwNjJzcHlucHZ6ZTQyYSJ9.71yZqTl1XmBdfK3scyPyzA';

function showMap() {
  let defaultCoords = { lat: 49.26504440741209, lng: -123.11540318587558 };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        initializeMap(userCoords);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        initializeMap(defaultCoords);
      }
    );
  } else {
    console.error("Geolocation not supported.");
    initializeMap(defaultCoords);
  }

  function initializeMap(coords) {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [coords.lng, coords.lat],
      zoom: 17
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
      addBatteryPins(map);
      addUserPinCircle(map);
    });
  }
}

function addBatteryPins(map) {
  map.loadImage(
    '/images/batteryping.png',
    (error, image) => {
      if (error) throw error;

      map.addImage('eventpin', image);

      db.collection('batteries').get().then(snapshot => {
        const features = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          const coordinates = [data.longitude, data.latitude];

          features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            properties: {
              description: `
                <div style="max-width: 220px;">
                  <strong>${data.batteryName}</strong>
                  <p>Owner: ${data.name}</p>
                  <p>Capacity: ${data.batteryCapacity} mAh</p>
                  <p>Ports: ${data.batteryPort}</p>
                  <p>Cable: ${data.batteryCable}</p>
                  <button class="btn btn-sm btn-primary" onclick="window.location.href='/pages/rentbattery.html?id=${doc.id}'">
                    Rent Battery
                  </button>
                </div>
              `
            }
          });
        });

        map.addSource('places', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features
          }
        });

        map.addLayer({
          id: 'places',
          type: 'symbol',
          source: 'places',
          layout: {
            'icon-image': 'eventpin',
            'icon-size': 0.2,
            'icon-allow-overlap': true
          }
        });

        map.on('click', 'places', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const description = e.features[0].properties.description;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });

        map.on('mouseenter', 'places', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'places', () => {
          map.getCanvas().style.cursor = '';
        });
      });
    }
  );
}

function addUserPinCircle(map) {
  navigator.geolocation.getCurrentPosition(position => {
    const userLocation = [position.coords.longitude, position.coords.latitude];

    map.addSource('userLocation', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: userLocation
          },
          properties: {
            description: 'Your location'
          }
        }]
      }
    });

    map.addLayer({
      id: 'userLocation',
      type: 'circle',
      source: 'userLocation',
      paint: {
        'circle-color': 'blue',
        'circle-radius': 9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    map.on('click', 'userLocation', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });

    map.on('mouseenter', 'userLocation', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'userLocation', () => {
      map.getCanvas().style.cursor = '';
    });
  });
}

showMap();
