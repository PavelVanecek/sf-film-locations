window.sf = { fetchLocations: function fetchLocations () {
  return fetch('sf-movie-locations.json')
    .then(res => res.json())
} }
