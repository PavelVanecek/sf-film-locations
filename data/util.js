/**
 * Right pads or truncated string
 * @param {string} str that will be padded
 * @param {number} len desired length
 * @param {string} [fill=' '] fill used when str is shorter than len
 */
exports.pad = function pad (str, len, fill = ' ') {
  return (str + fill.repeat(len)).substring(0, len)
}

/**
 * Accepts a generator and runs it asynchronously until exhaustion
 * Inspired by https://davidwalsh.name/async-generators
 */
exports.run = function run (g) {
  const it = g()
  let ret
  (function iterate (val) {
    ret = it.next(val)
    if (ret.done) {
      return
    }
    if (typeof ret.value.then === 'function') {
      ret.value.then(iterate)
    } else {
      setTimeout(() => iterate(ret.value), 0)
    }
  })()
}

/**
 * Turns query params object into string
 * @param {Object} params
 * @return {string}
 */
exports.queryParams = function queryParams (params) {
  return Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')
}
