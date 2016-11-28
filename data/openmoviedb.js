const { run } = require('./util')
const { main } = require('./processor')
const { addMeta } = require('./openmoviedb.lib')
run(main(addMeta))
