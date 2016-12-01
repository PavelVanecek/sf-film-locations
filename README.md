# Film locations in San Francisco

Simple web app to browse movies shot in San Francisco.

See it online: https://pavelvanecek.cz/sf-movies/

Data sources:
- List of movies and their locations comes from: https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am
- Geolocation data from: https://developers.google.com/maps/documentation/geocoding/intro
- Other movie data from: https://www.omdbapi.com

## How to run

This repository does not include data source; instead, there is a script to download them. Then you may open the web app in your browser.

If you do not wish to bother with any of that, see it live: https://pavelvanecek.cz/sf-movies/

### How to download data

First, obtain a Google Maps API key. Here is how: https://developers.google.com/maps/documentation/javascript/get-api-key

When you have it, paste it to `data/geolocate.lib.js` file:

```javascript
// put your key where it says so
const GOOGLE_MAPS_API_KEY = 'PUT_YOUR_API_KEY_HERE'
```

Next, install dependencies:

```bash
npm install
```

Then you are ready to download. There are several steps:

```bash
# downloads the dataset; must be first!
node data/download.js

# fetches geolocation data; requires the dataset already downloaded
node data/geolocate.js

# fetches OMDB info; requires the dataset already downloaded
node data/openmoviedb.js

# removes not necessary properties to save data; should come last
node data/optimize.js
```

### How to open the web app

A web server is required. If you happen to have python installed, you may use that:

```bash
python -m SimpleHTTPServer
```

... or get some other HTTP server. This app _will not run_ using `file://` protocol.

Then navigate to `http://localhost:8000/src`

## Running tests

There are two test suites:

Unit tests: run in terminal with `npm test`
Browser tests: run by opening `test/browser/index.html` in your browser
