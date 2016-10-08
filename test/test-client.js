const Promise = require('bluebird')
const chai = require('chai')
const socketIOClient = require('socket.io-client')
const should = chai.should()
const polyIO = require('../index')
const client = require('../src/client')
const ioid = 'global-client-js'
var globalClient

describe('start poly-socketio', () => {
  var ioPromise = polyIO({debug: true, clientCount: 2})

  it('resolve global.ioPromise when all joined', () => {
    client.join()
    globalClient = socketIOClient(`http://localhost:6466`)
    globalClient.on('disconnect', globalClient.disconnect)
    globalClient.emit('join', ioid)
    return ioPromise
  })

  it('resolve global.ioPromise when all joined', () => {
    var msg = {
      input: 'hello js',
      to: 'echo.js',
      intent: 'ping',
      from: ioid
    }
    return new Promise((resolve, reject) => {
      globalClient.on('take', (msg) => {
        console.log('taking reply output')
        console.log(msg)
        if (msg.output === 'ping hello js') {
          resolve()
        } else {
          reject()
        }
      })
      globalClient.emit('pass', msg)
    })
  })
})