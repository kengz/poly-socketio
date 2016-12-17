// the global client to enter the poly-socketio server
const Promise = require('bluebird')
const _ = require('lodash')
const path = require('path')
const socketIOClient = require('socket.io-client')
const log = require(path.join(__dirname, 'log'))
const hasher = require(path.join(__dirname, 'hasher')) // the js handler hasher
const ioid = 'global-client-js' // the id of this script for io client registration
var client

// init a global client at port
function init(options) {
  options = options || {}
  var port = options.port || 6466
  global.client = global.client || socketIOClient(`http://localhost:${port}`)
  client = global.client
  log.debug(`Started global js socketIO client for ${process.env.ADAPTER} at ${port}`)
  client.emit('join', ioid) // first join for serialization
  client.on('disconnect', client.disconnect)
  client.on('take', hasher.handle) // add listener
  
  // add methods
  client.pass = pass
  client.clientPass = clientPass
  return client
}

/**
 * Pass that returns a promise for getting client replies conveniently.
 * Has promise timeout of 60s; is properly binded.
 * @param  {string|JSON} to   Name of the to script, or a JSON msg containing at least to, input
 * @param  {*} input    Input for the client to pass
 * @return {Promise}        The promise object that will be resolved when target script replies.
 */
function pass(to, input) {
  var defer = cdefer()
  clientPass(defer.resolve, to, input)
  return defer.promise.catch((err) => {
    console.log(`global-client-js promise exception with input: ${input}, to: ${JSON.stringify(to)}`)
  })
}

/**
 * Wrapper for passing an msg using the client; must specify the callback handler function (properly binded), and an extension of msg including the target, input keys.
 * @param  {Function} cbBinded A properly binded callback handler.
 * @param  {string|JSON} to   Name of the to script, or a JSON msgect containing at least to, input
 * @param  {*} input    Input for the client to pass
 *
 * @example
 * // shorthand
 * clientPass(log.info, 'hello.rb', 'Hello ruby.')
 *
 * // full msgect
 * clientPass(log.info, {
 *   input: '我是机器人',
 *   to: 'nlp.py',
 *   intent: 'translate',
 * })
 */
/* istanbul ignore next */
function clientPass(cbBinded, to, input) {
  var baseObj = {
    hash: hasher.gen(ioid, cbBinded),
    from: ioid
  }

  // build up the msgect to pass to target
  if (_.isPlainObject(to)) {
    // if an msgect is supplied directly
    _.assign(baseObj, to);
    /* istanbul ignore next */
  } else if (_.isString(to)) {
    // or supplied string to and input
    _.assign(baseObj, { to: to, input: input })
  } else {
    throw new Error('You must supply at least target and input to pass to io client.')
  }

  // pass to target client
  client.emit('pass', baseObj)
}

/**
 * Promise constructor using defer pattern to expose its promise, resolve, reject. Has a timeout of 60s.
 * @return {defer} The Promise.defer legacy msg.
 */
/* istanbul ignore next */
function cdefer() {
  const maxWait = 20000
  var resolve, reject
  var promise = new Promise((...args) => {
      resolve = args[0]
      reject = args[1]
    })
    .timeout(maxWait)
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  }
}

// clientPass(log.info, {
//   input: '我是机器人',
//   to: 'nlp.py',
//   intent: 'translate',
// })

// pass({
//   input: 'Hello from user',
//   to: 'hello.py',
//   intent: 'sayHi',
// }).then(log.info).catch(log.info)

module.exports = init
