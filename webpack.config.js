const webpack = require('webpack')
const { resolve } = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const rel = resolve.bind(null, __dirname, 'src')
const contentCss = new ExtractTextPlugin('content.css')
const optionsCss = new ExtractTextPlugin('options.css')

module.exports = [
  // content scripts and manifest
  {
    entry: [
      'file?name=manifest.json!./src/manifest.json',
      '!file?name=assets/icon.png!./src/assets/icon.png',
      './src/content.js',
    ],
    devtool: 'source-map',
    output: {
      path: rel('../extension'),
      filename: 'content.js',
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: { cacheDirectory: false },
        },
        {
          test: /\.css$/,
          loader: contentCss.extract('style-loader', 'css-loader?sourceMap'),
        },
        { test: /\.svg?/, loader: 'raw-loader' },
        { test: /\.(eot|ttf)$/, loader: 'file-loader' },
        { test: /\.(png|jpg|jpeg|gif|woff|woff2)$/, loader: 'url-loader?limit=1000' },
      ],
    },

    resolve: {
      modulesDirectories: ['node_modules'],
      extensions: ['', '.js', '.jsx'],
    },

    plugins: [
      contentCss,
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ],
  },

  // options page
  {
    entry: './src/options.js',

    output: {
      path: rel('../extension'),
      filename: 'options.js',
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: { cacheDirectory: false },
        },
        {
          test: /\.css$/,
          loader: optionsCss.extract('style-loader', 'css-loader?sourceMap'),
        },
        { test: /\.svg?/, loader: 'raw-loader' },
        { test: /\.(eot|ttf)$/, loader: 'file-loader' },
        { test: /\.(png|jpg|jpeg|gif|woff|woff2)$/, loader: 'url-loader?limit=1000' },
      ],
    },

    resolve: {
      modulesDirectories: ['node_modules'],
      extensions: ['', '.js', '.jsx'],
    },

    plugins: [
      optionsCss,
      new HtmlWebpackPlugin({
        filename: 'options.html',
        template: './src/options.html',
        inject: 'body',
        hash: true,
      }),
    ],
  },
]
