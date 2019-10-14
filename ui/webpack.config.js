var LiveReloadPlugin = require('webpack-livereload-plugin');
var webpack = require("webpack");

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  plugins: [
    new LiveReloadPlugin({
      port: 3001,
    }),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
    })
  ]
}
