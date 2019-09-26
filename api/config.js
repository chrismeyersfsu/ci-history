if (process.env.CI_HISTORY_DEV) {
  module.exports = require('./config_dev');
} else {
  module.exports = require('./config_prod');
}
