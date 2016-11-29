/* global google */

(function () {
  const SFPosition = {
    lat: 37.76,
    lng: -122.4194
  }

  const filtersOverlay = document.getElementById('overlay')
  const genresList = document.getElementById('genres-list')
  let genreControlBtn

  let map
  // this name is specified in index.html
  window.initMap = function () {
    map = new google.maps.Map(document.getElementById('map'), {
      center: SFPosition,
      zoom: 13,
      /*
       * In fullscreen mode, the overlay does not show up.
       * The vanilla mode is close to fullscreen experience already
       * so let's just disable the control
       */
      fullscreenControl: false
    })
    attachHandlers()
    return fetchLocations().then(function () {
      createControls()
    })
  }

  function closeOverlay () {
    filtersOverlay.classList.remove('open')
  }

  /**
   * @param {string} label
   * @return {Element}
   */
  function createButton (label) {
    const btn = document.createElement('button')
    btn.className = 'sf-button'
    btn.textContent = label
    return btn
  }

  /**
   * Attaches controls to map DOM
   */
  function createControls () {
    genreControlBtn = createButton('Genres')
    genreControlBtn.addEventListener('click', function () {
      filtersOverlay.classList.add('open')
    })
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(genreControlBtn)
  }

  /**
   * Attaches genres to DOM
   */
  function renderGenreFilters (genres) {
    const genreElements = Object.keys(genres)
    .map(function (genre) {
      return `
      <label class="radio">
        <input type="radio" name="genre" value="${genre}">
        ${genre}
      </label>`
    }).join('')
    const showAll = `
    <label class="radio">
      <input type="radio" checked name="genre" value="show-all">
      Show all genres
    </label>`
    genresList.innerHTML = showAll + genreElements
  }

  /**
   * Attaches handlers to static buttons
   */
  function attachHandlers () {
    const closeBtn = document.getElementById('btn-close')
    closeBtn.addEventListener('click', closeOverlay)
    genresList.addEventListener('change', function (e) {
      const genre = genresList.genre.value
      if (genre === 'show-all') {
        clearGenreFilter()
      } else {
        filterByGenre(genre)
      }
      closeOverlay()
    })
  }

  /**
   * Not all movies have posters defined.
   * @param {Object} movie
   * @return {boolean}
   */
  function hasPoster (movie) {
    return (
      movie && movie.meta && movie.meta.omdb &&
      movie.meta.omdb.posterUrl &&
      movie.meta.omdb.posterUrl !== 'N/A'
    )
  }

  /**
   * @param {Object} movie
   * @return {string} outerHTML of the image Element
   */
  function createPoster (movie) {
    if (!hasPoster(movie)) {
      // nothing to create
      return ''
    }
    return `<img class="poster" src="${movie.meta.omdb.posterUrl}" alt="${movie.title} poster">`
  }

  /**
   * @param {Object} movie
   * @return {string} omdb box to be included inside infoWindow
   */
  function createOmdbBox (movie) {
    if (!movie || !movie.meta || !movie.meta.omdb) {
      // nothing to create
      return ''
    }
    const omdb = movie.meta.omdb
    let box = '<p>'
    if (omdb.imdbRating && omdb.imdbRating !== 'N/A') {
      box += '⭐ ' + omdb.imdbRating + '/10'
    }
    if (omdb.imdbID) {
      box += `&nbsp;<a href="http://www.imdb.com/title/${movie.meta.omdb.imdbID}/">Open on IMDB</a>`
    }
    box += '</p>'
    return box
  }

  /**
   * @param {Object} movie
   * @return {string} genre box to be included inside infoWindow
   */
  function createGenre (movie) {
    if (!movie || !movie.meta || !movie.meta.omdb) {
      // nothing to create
      return ''
    }
    return '<p>' + movie.meta.omdb.genres.join(', ') + '</p>'
  }

  /**
   * @param {Object} movie
   * @return {string} infoWindow outerHTML content
   */
  function createInfoWindow (movie) {
    return `
      <section class="sf-movie-infoWindow${hasPoster(movie) && ' has-poster'}">
        ${createPoster(movie)}
        <article class="text-content">
          <h2>${movie.title} (${movie.release_year})</h2>
          ${createGenre(movie)}
          ${movie.locations
            ? `<p>📍 Location: ${movie.locations}</p>`
            : ''
          }
          ${(movie.meta.omdb && movie.meta.omdb.plot)
            ? '<p>' + movie.meta.omdb.plot + '</p>'
            : ''
          }
          ${(movie.fun_facts)
            ? '<p>' + movie.fun_facts + '</p>'
            : ''
          }
          ${createOmdbBox(movie)}
        </article>
      </section>
    `
  }

  // Keep reference to the open window so that we are able to close it
  let openInfoWindow
  // Save all markers so that we are able to hide and show them following the filter
  const markers = []

  function createMarker (loc) {
    const marker = new google.maps.Marker({
      position: loc.meta.location,
      map,
      title: loc.title
    })
    marker.addListener('click', function () {
      if (openInfoWindow) {
        openInfoWindow.close()
      }
      /*
       * InfoWindow is created on demand, not in batch up front.
       * This optimization is very important since it brings down the
       * page weight down by +- 8MB.
       * Show some <3 for mobile users and their FUPs!
       */
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindow(loc)
      })
      infoWindow.open(map, marker)
      openInfoWindow = infoWindow
    })
    // this reference is necessary for filtering markers (by genre)
    loc.marker = marker
    markers.push(marker)
  }

  const genres = {}
  /**
   * Parses locations and finds all genres
   *
   * @param {Array<Object>} locations
   */
  function findAllGenres (locations) {
    locations.forEach(loc => {
      if (!loc.meta || !loc.meta.omdb || !loc.meta.omdb.genres) {
        return
      }
      loc.meta.omdb.genres.forEach(genre => {
        if (!genres[genre]) { genres[genre] = [] }
        genres[genre].push(loc)
      })
    })
    renderGenreFilters(genres)
  }

  /**
   * Filters markers based on provided genre
   *
   * @param {string} genreStr
   */
  function filterByGenre (genreStr) {
    const genre = genres[genreStr]
    if (!genre) {
      console.warn('Unknown genre', genreStr)
      return
    }
    markers
      .filter(m => !(m in genre))
      .forEach(m => m.setMap(null))
    genre.forEach(loc =>
      loc.marker.setMap(map)
    )
    genreControlBtn.textContent = genreStr
  }

  /**
   * Shows all markers
   */
  function clearGenreFilter () {
    markers.forEach(m => m.setMap(map))
    genreControlBtn.textContent = 'Genres'
  }

  /**
   * @return {Promise}
   */
  function fetchLocations () {
    return window.sf.fetchLocations()
      .then(locations => {
        findAllGenres(locations)
        return locations
      })
    .then(locations => locations
      .filter(loc => !!loc.meta)
      .forEach(createMarker)
    )
  }
})()
