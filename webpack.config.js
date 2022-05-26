const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development", // "production" | "development" | "none"
    entry: {
        "script": "./src/index.js",
    },
    devtool: "inline-source-map",
    output: {
        path: path.resolve(__dirname, "buildResults"),
        filename: "[name].js",
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "./src/index.html", to: "."},

            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.mpts$/,
                use: [
                    "mpts-loader"
                ]
            }
        ]
    }
}