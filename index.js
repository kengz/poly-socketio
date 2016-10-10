const path = require('path')
const server = require(path.join(__dirname, 'src', 'start-io'))
const client = require(path.join(__dirname, 'src', 'global-client'))

module.exports = {
  server: server,
  client: client
}
