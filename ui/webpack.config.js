var LiveReloadPlugin = require('webpack-livereload-plugin');
var webpack = require("webpack");

module.exports = {
  entry: './src/index.js',
  plugins: [
    new LiveReloadPlugin(),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
    })
  ]
}
