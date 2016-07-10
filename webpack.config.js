var path = require('path');
var webpack = require('webpack');
// var nodeModules = path.resolve(__dirname, '../node_modules');
// var pathToAngular = path.resolve(nodeModules, 'angular/angular.min.js');

module.exports = {
  entry: {
    app: ['webpack/hot/dev-server', path.resolve(__dirname, './app/app.js')],
    vendors: ['angular', 'angular-animate', 'angular-messages', 'angular-sanitize', 'angular-material', 'restangular', 'angular-ui-router', 'angular-ui-router-title', 'angular-aria', 'lodash']
  },
  // resolve: {
  //   alias: {
  //     'angular': pathToAngular
  //   }
  // },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    // noParse: [pathToAngular],
    loaders: [
      {
        test: /\.html$/, // Only .html files
        loader: 'ngtemplate!html' // Run html loader
      },
      {
        test: /\.scss$/,
        loader: 'style!css!sass'
      },
      {
        test: /\.js$/,
        loader: 'ng-annotate!babel?presets[]=es2015',
        exclude: /(node_modules|bower_components)/
      },
      {
        //convert css images les than 25k to base64 and inline
        test: /\.(png|jpg)$/,
        loader: 'url?limit=25000'
      },
      {
        loader: 'exports?window.angular',
        test: require.resolve('angular')
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    // TODO: minimise all JS, CSS, HTML and Images
    // new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
  ]
};
