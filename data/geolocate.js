const { run } = require('./util')
const { main } = require('./processor')
const { geolocate } = require('./geolocate.lib')
run(main(geolocate))
