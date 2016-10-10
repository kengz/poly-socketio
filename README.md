# poly-socketio [![npm version](https://badge.fury.io/js/poly-socketio.svg)](https://badge.fury.io/js/poly-socketio) [![CircleCI](https://circleci.com/gh/kengz/poly-socketio.svg?style=shield)](https://circleci.com/gh/kengz/poly-socketio) [![Code Climate](https://codeclimate.com/github/kengz/poly-socketio/badges/gpa.svg)](https://codeclimate.com/github/kengz/poly-socketio) [![Test Coverage](https://codeclimate.com/github/kengz/poly-socketio/badges/coverage.svg)](https://codeclimate.com/github/kengz/poly-socketio/coverage)
Polyglot SocketIO server that allows cross-language communication via JSON

## Installation

```shell
npm i --save poly-socketio
```

## Usage

This is used in [AIVA](https://github.com/kengz/aiva) to communicate JSON data among the Nodejs, Python and Ruby runtimes.

```js
const polyIO = require('poly-socketio')
const IOPORT = 6466
var ioPromise = polyIO.server({port: IOPORT, clientCount: 1, timeoutMs: 15000, debug: false})
polyIO.client({port: IOPORT}) // this exposes a global.client

var msg = {
  input: 'hello js',
  to: 'echo.js',
  intent: 'ping'
}
global.client.pass(msg)
  .then((reply) => {
    if (reply.output === 'ping hello js') {
      console.log('success!')
    } else {
      console.log('error')
    }
  })
```
