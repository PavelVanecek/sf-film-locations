window.sf = { fetchLocations: function fetchLocations () {
  // index.html has a polyfill for IE11 + Safari users
  // http://caniuse.com/#feat=fetch
  return fetch('sf-movie-locations.json')
    .then(res => res.json())
} }
