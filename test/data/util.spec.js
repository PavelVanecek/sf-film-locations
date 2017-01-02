const { assert } = require('chai')
const { pad, run, queryParams } = require('../../data/util')
require('mocha-generators').install()

describe('util.js', () => {
  describe('pad', () => {
    it('should bad strings', () => {
      const actual = pad('Name', 10)
      const expected = 'Name      '
      assert.equal(actual, expected)
    })

    it('should truncate if the string is longer', () => {
      const actual = pad('In a galaxy far, far away', 5)
      const expected = 'In a '
      assert.equal(actual, expected)
    })

    it('should do nothing if the string is exactly the required length', () => {
      const actual = pad('Name', 4)
      const expected = 'Name'
      assert.equal(actual, expected)
    })
  })

  describe('run', () => {
    it('should be function', () => {
      assert.isFunction(run)
    })
    // not sure how to test this
    it('should stop when the generator stops')

    // setTimeout hack can break, but again - I am not sure how to do better
    it('should exhaust the generator', () => {
      let i = 0
      const myGen = function* () {
        while (i < 3) { yield i++ }
      }
      run(myGen)
      setTimeout(() => {
        assert.equal(i, 3)
      }, 30)
    })
  })

  describe('queryParams', () => {
    it('should turn object to string', () => {
      const query = {
        one: '1',
        two: '2'
      }
      const actual = queryParams(query)
      const expected = 'one=1&two=2'
      assert.equal(actual, expected)
    })
  })
})
