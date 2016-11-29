const { run } = require('./util')
const { main } = require('./processor')
run(main(function* removeUnwantedProperties (movie) {
  /*
   * None of these properties is used so they do not need to take up space
   * during transfer.
   * This removes +- 200 kB from the file size.
   */
  delete movie.actor_1
  delete movie.actor_2
  delete movie.actor_3
  delete movie.director
  delete movie.production_company
  delete movie.writer
  return movie
}))
