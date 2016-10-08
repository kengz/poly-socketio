// The sample function for js; For test only
const _ = require('lodash')

function ping(input) {
  if (_.isString(input)) {
    return `ping ${input}`
  } else {
    throw Error
  }
}

module.exports = {
  ping: ping
}
