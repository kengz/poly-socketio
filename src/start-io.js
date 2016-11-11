// The socket.io server and polyglot clients. Called by scripts/_init.js
const Promise = require('bluebird')
const { spawn, execSync } = require('child_process')
const express = require('express')
const fs = require('fs')
const http = require('http')
const _ = require('lodash')
const path = require('path')
const socketIO = require('socket.io')
const log = require(path.join(__dirname, 'log'))
const app = express()
const server = http.Server(app)

/**
 * Start a Socket IO server connecting to a brand new Express server for use in dev. Sets global.io too.
 * Has a failsafe for not starting multiple times even when called repeatedly by accident in the same thread.
 * @param  {*} robot The hubot object
 * @return {server} server
 */
/* istanbul ignore next */
function ioServer(port = 6466, clientCount = 1, timeoutMs = 100000) {
  if (global.io) {
    // if already started
    return Promise.resolve()
  }

  log.info(`Starting poly-socketio server on port: ${port}, expecting ${clientCount} IO clients`)
  global.io = socketIO(server)
  var count = clientCount
  global.ioPromise = new Promise((resolve, reject) => {
      global.io.sockets.on('connection', (socket) => {
        // serialize for direct communication by using join room
        socket.on('join', (id) => {
          socket.join(id)
          count--
          log.debug(`${id} ${socket.id} joined, ${count} remains`)
          if (count <= 0) {
            log.info(`All ${clientCount} IO clients have joined`)
            resolve(server) // resolve with the server
          }
        })
        socket.on('disconnect', () => { log.info(socket.id, 'left') })
      })
    })
    .timeout(timeoutMs)
    .catch((err) => {
      log.error(JSON.stringify(err, null, 2))
      log.error("Expected number of IO clients failed to join in time")
      process.exit(1)
    })

  global.io.on('connection', (socket) => {
    // generic pass to other script
    socket.on('pass', (msg, fn) => {
      log.debug(`IO on pass, msg: ${JSON.stringify(msg, null, 2)} fn: ${fn}`)
      try {
        // e.g. split 'hello.py' into ['hello', 'py']
        // lang = 'py', module = 'hello'
        var tokens = msg.to.split('.'),
          lang = tokens.pop(),
          module = _.join(tokens, '.')
          // reset of <to> for easy calling. May be empty if just passing to client.<lang>
        msg.to = module
        global.io.sockets.in(lang).emit('take', msg)
      } catch (e) { log.error(JSON.stringify(e, null, 2)) }
    })
  })

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve()
    })
  })
}

/**
 * The main method to start the io server.
 * options = {port, clientCount, timeoutMs, debug}
 */
/* istanbul ignore next */
function ioStart(options) {
  options = options || {}
  log.transports.console.level = options.debug ? 'debug' : 'info'
  return ioServer(options.port, options.clientCount, options.timeoutMs)
}

/* istanbul ignore next */
const cleanExit = () => { process.exit() }
process.on('SIGINT', cleanExit) // catch ctrl-c
process.on('SIGTERM', cleanExit) // catch kill
process.on('uncaughtException', log.error)

// export for use by hubot
module.exports = ioStart

// if this file is run directly by `node server.js`
/* istanbul ignore next */
if (require.main === module) {
  ioStart()
}
