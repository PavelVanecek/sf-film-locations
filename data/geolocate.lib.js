/*
 * The selected dataset does sometimes contain a street address or
 * a business name, but never actual lat/lng location.
 * This file is responsible for fetching geolocation information in bulk
 * and adding it to movie locations.
 * For that, it uses the Google Places API web service:
 * https://developers.google.com/places/web-service/search
 *
 * The script only ever fires one request at a time.
 * I wanted to see how that's done using generators, and it works great.
 * There is definitely room for improvement; it could be sent in batches for example.
 * On the other hand, this is one time script only.
 */

const { queryParams } = require('./util')
const fetchLib = require('node-fetch')

/*
 * Google Places API is limited to 1000 requests without they key
 * which is not enough for our dataset (~1600 items).
 * If you wish to use it you will have to set your key here.
 *
 * Here is how to obtain it: https://developers.google.com/places/web-service/get-api-key
 *
 * https://developers.google.com/places/web-service/usage
 */
const GOOGLE_MAPS_API_KEY = 'PUT_YOUR_API_KEY_HERE'

/*
 * Many locations are not defined well (e. g. "City Hall")
 * Let's limit the search to SF area only.
 * This does not really guarantee anything but it should make the results
 * slightly better
 */
const SFLocation = '37.76,-122.4194'
// Maximum allowed radius
const radius = 50000

/**
 * Fetches geolocation data for given place
 * uses Google Places service
 * @param {string} place will be fed to Google Places
 * @return {Promise<Object>} response from API
 */
function findLocationFromPlaces (place, fetch = fetchLib) {
  const query = queryParams({
    /*
     * I tried to combine results from Places API and Geocode API
     * I tried to use location + radius query param
     * I tried to limit it by geo box boundaries
     * But it turns out that I get the best results by
     * appending "San Francisco" to every search query
     * ¯\_(ツ)_/¯
     */
    query: place + 'San Francisco',
    key: GOOGLE_MAPS_API_KEY,
    location: SFLocation,
    radius
  })
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${query}`
  return fetch(url)
    .then(
      res => res.json(),
      err => console.error('Error when fetching Places textsearch', err)
    )
}

function* geolocate (movie, fetch = fetchLib) {
  if (movie.meta && movie.meta.location) {
    // location was already fetched before, let's not waste API quota
    return
  }
  const location = yield findLocationFromPlaces(movie.locations, fetch)
  movie.meta = movie.meta || {}
  if (!location.results[0]) {
    movie.meta.location = null
  } else {
    movie.meta.location = location.results[0].geometry.location
  }
}

module.exports = { geolocate }
