mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: restaurantInfo.geometry.coordinates, // starting position [lng, lat]
zoom: 10 // starting zoom
});

new mapboxgl.Marker()
.setLngLat(restaurantInfo.geometry.coordinates)
.setPopup(
  new mapboxgl.Popup({offset: 25})
    .setHTML(
      `<h5>${restaurantInfo.title}</h5><p>${restaurantInfo.location}</p>`
    )
)
.addTo(map);