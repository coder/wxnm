const path = require("path")
const webpack = require("webpack")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  mode: "development",
  target: "web",
  entry: path.join(__dirname, "src/popup.ts"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "popup.js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".mjs", ".json"],
    modules: [path.join(__dirname, "../node_modules")],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/popup.html"),
      filename: "popup.html",
      inject: true,
    }),
    new CopyWebpackPlugin([{ from: path.join(__dirname, "static/*"), flatten: true }]),
  ],
}
