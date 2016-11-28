const { queryParams } = require('./util')
const fetchLib = require('node-fetch')

/**
 * Attempts to fetch movie metadata from OMDb
 * https://www.omdbapi.com/
 * @param {string} title of the movie
 * @param {number} releaseYear
 * @return {Promise<Object>}
 */
function fetchMovieMetadata (title, releaseYear, fetch = fetchLib) {
  const query = queryParams({
    t: title,
    y: releaseYear
  })
  const url = `http://www.omdbapi.com/?${query}`
  return fetch(url)
    .then(
      res => res.json(),
      err => console.error('Error when fetch OMDb data', err)
    )
}

function* addMeta (movie) {
  if (movie.meta && movie.meta.omdb) {
    // already fetched before
    return
  }
  const meta = yield fetchMovieMetadata(movie.title, movie.release_year)
  movie.meta = movie.meta || {}
  if (meta.Error) {
    movie.meta.omdb = null
  } else {
    /*
     * Some data are duplicate and some are not interesting
     * but this file is then included on frontend.
     * Let's keep the saved data to minimum.
     */
    movie.meta.omdb = {
      imdbRating: meta.imdbRating,
      imdbID: meta.imdbID,
      posterUrl: meta.Poster,
      plot: meta.Plot,
      genres: meta.Genre.split(/[, ]+/)
    }
  }
}

module.exports = {
  addMeta,
  fetchMovieMetadata
}
