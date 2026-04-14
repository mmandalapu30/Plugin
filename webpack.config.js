const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  return [
    // Main plugin code (runs in Figma sandbox)
    {
      mode: argv.mode,
      target: "web",
      entry: "./src/code.ts",
      output: {
        filename: "code.js",
        path: path.resolve(__dirname, "dist"),
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
        extensions: [".ts", ".js"],
      },
      devtool: isDev ? "inline-source-map" : false,
    },
    // UI code (runs in browser iframe)
    {
      mode: argv.mode,
      target: "web",
      entry: "./src/ui.ts",
      output: {
        filename: "ui.js",
        path: path.resolve(__dirname, "dist"),
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
        extensions: [".ts", ".js"],
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: "./src/ui.html",
          filename: "ui.html",
          chunks: ["ui"],
          inject: "body",
        }),
      ],
      devtool: isDev ? "inline-source-map" : false,
    },
  ];
};
