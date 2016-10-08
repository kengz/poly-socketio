const path = require('path')
const server = require(path.join(__dirname, 'src', 'start-io'))
const gClient = require(path.join(__dirname, 'src', 'global-client'))

module.exports = {
  server: server,
  gClient: gClient
}
