const Promise = require('bluebird')
const chai = require('chai')
const _ = require('lodash')
const socketIOClient = require('socket.io-client')
const should = chai.should()
const polyIO = require('../index')
const client = require('../src/client')
var globalClient

describe('start poly-socketio', () => {
  var ioPromise = polyIO.server({ debug: true, clientCount: 2 })

  it('resolve global.ioPromise when all joined', () => {
    client.join()
    globalClient = polyIO.gClient()
    return ioPromise
  })

  it('has a working globalClient', () => {
    var msg = {
      input: 'hello js',
      to: 'echo.js',
      intent: 'ping'
    }
    return new Promise((resolve, reject) => {
      globalClient.pass(msg)
        .then((reply) => {
          if (reply.output === 'ping hello js') {
            resolve()
          } else {
            reject()
          }
        })
    })
  })
})
