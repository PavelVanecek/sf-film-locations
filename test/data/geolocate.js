const chai = require('chai')
chai.use(require('chai-is-generator'))
const { assert } = chai
const sinon = require('sinon')
require('mocha-generators').install()
const { geolocate } = require('../../data/geolocate.lib')

describe('geolocate.lib.js', () => {
  describe('geolocate', () => {
    it('should be a function', () => {
      assert.isGenerator(geolocate)
    })

    it('should not call API if the movie already has location', function* () {
      const spy = sinon.stub().returns(Promise.resolve({
        json: assert.fail
      }))
      const movie = { meta: { location: {} } }
      yield* geolocate(movie, spy)
      sinon.assert.notCalled(spy)
    })

    it('should call API and modify the movie object', function* () {
      // mimicking google geocoding API response
      const apiResponse = {
        results: [ { geometry: { location: 'apiresponse' } } ]
      }
      const spy = sinon.stub().returns(Promise.resolve({
        json: () => Promise.resolve(apiResponse)
      }))
      const movie = { locations: 'somelocation' }
      yield* geolocate(movie, spy)
      sinon.assert.calledOnce(spy)
      sinon.assert.calledWith(spy, sinon.match(/somelocation/))
      assert.equal(movie.meta.location, 'apiresponse')
    })
  })
})
