const path = require('path')
module.exports = {
  server: require(path.join(__dirname, 'src', 'start-io')),
  gClient: require(path.join(__dirname, 'src', 'global-client'))
}