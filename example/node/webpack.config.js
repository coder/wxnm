const path = require("path")

module.exports = {
  mode: "development",
  target: "node",
  entry: path.join(__dirname, "src/index.ts"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
          "ts-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".mjs", ".json"],
    modules: [path.join(__dirname, "../node_modules")],
  },
}
