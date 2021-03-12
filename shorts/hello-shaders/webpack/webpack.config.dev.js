// This webpack config copied from https://github.com/lifenautjoe/webpack-starter-basic/blob/master/webpack.dev.js
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "eval-cheap-module-source-map",
  entry: "./src/js/index.js",
  mode: "development",
  devServer: {
    port: 8000,
    contentBase: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/transform-runtime",
          ],
        },
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            // creates style nodes from JS strings
            loader: "style-loader",
          },
          {
            // translates CSS into CommonJS
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          // Please note we are not running postcss here
        ],
      },
      {
        // Load all images as base64 encoding if they are smaller than 8192 bytes
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              // On development we want to see where the file is coming from, hence we preserve the [path]
              name: "[path][name].[ext]?hash=[hash:20]",
              limit: 8192,
            },
          },
        ],
      },
      {
        // Load all icons
        test: /\.(eot|woff|woff2|svg|ttf)([?]?.*)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.(glsl|vert|fs|vs|frag)$/,
        exclude: /node_modules/,
        use: ["raw-loader", "glslify-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../src/index.html"),
      inject: true,
    }),
  ],
};
