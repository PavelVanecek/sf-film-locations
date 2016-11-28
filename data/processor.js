const ProgressBar = require('progress')
const fs = require('fs')
const path = require('path')
const { pad } = require('./util')

// Later, the same file will be overwritten
const FILENAME = path.join(__dirname, '..', 'src', 'sf-movie-locations.json')

/*
 * This could be a stream.
 * But, given that there are ~300kB of data (~1600 records total)
 * the memory consumption is negligible anyway.
 * This array is however not iterated synchronously anywhere,
 * instead using a generator
 */
const sfMovies = require(FILENAME)

/**
 * Yay Generators! Enables lazy iteration on array.
 * If we were to switch to streams later, this would need to change;
 * rest of the code however stays the same, which is nice.
 */
function* movies () {
  let index = 0
  while (index < sfMovies.length) {
    yield sfMovies[index++]
  }
}

/*
 * The script can take several minutes.
 * Let's display something to entertain the waiting user
 */
const bar = new ProgressBar('Processing :movietitle [:bar] (:current/:total)', {
  total: sfMovies.length
})

function save () {
  return new Promise((resolve, reject) =>
    fs.writeFile(FILENAME, JSON.stringify(sfMovies), (err) => {
      if (err) { return reject(err) }
      resolve()
    })
  )
}

/**
 * Iterates on all movies and process them using given callback
 * @param {Function*} process generator function
 */
exports.main = function main (process) {
  return function* () {
    for (let movie of movies()) {
      bar.tick({ movietitle: pad(movie.title, 10) })
      yield* process(movie)
      yield save()
    }
  }
}
