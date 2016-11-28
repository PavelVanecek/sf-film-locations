const https = require('https')
const fs = require('fs')
const path = require('path')

const writeStream = fs.createWriteStream(path.join(__dirname, '..', 'src', 'sf-movie-locations.json'))

https.get('https://data.sfgov.org/resource/wwmu-gmzc.json?$limit=2000', res =>
  res
    .pipe(writeStream)
    .on('finish', () => {
      console.log('Download done')
    })
)
