/*
 * A proof of concept to compare deflate vs gzip vs no compression
 *
 * How to run this:
 * $ node index.js
 */

/*
 * Testing results:
 *
 * Original file: 826753 bytes
 * File compressed using BSD gzip: 132328 bytes (84% reduction)
 *
 * $ curl -so /dev/null -w 'downloaded: %{size_download} bytes\n' localhost:8000
 * > downloaded: 826753 bytes
 * $ curl -so /dev/null -H 'Accept-Encoding: deflate' -w 'downloaded: %{size_download} bytes\n' localhost:8000
 * > downloaded: 132292 bytes
 * $ curl -so /dev/null -H 'Accept-Encoding: gzip' -w 'downloaded: %{size_download} bytes\n' localhost:8000
 * downloaded: 132304 bytes
*/

// https://nodejs.org/api/zlib.html#zlib_compressing_http_requests_and_responses
const zlib = require('zlib')
const http = require('http')
const fs = require('fs')

const isDeflate = /\bdeflate\b/i
const isGzip = /\bgzip\b/i

const handler = (req, res) => {
  const reader = fs.createReadStream('../src/sf-movie-locations.json')
  const accept = req.headers['accept-encoding']
  if (isDeflate.test(accept)) {
    res.writeHead(200, { 'Content-Encoding': 'deflate' })
    reader.pipe(zlib.createDeflate()).pipe(res)
    return
  }

  if (isGzip.test(accept)) {
    res.writeHead(200, { 'Content-Encoding': 'gzip' })
    reader.pipe(zlib.createGzip()).pipe(res)
    return
  }

  res.writeHead(200, {})
  reader.pipe(res)
}

const port = 8000
http.createServer(handler).listen(port, err => {
  if (err) {
    console.error(err)
    return
  }
  console.log('Listening on port ' + port)
})
