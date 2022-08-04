const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: "development", // "production" | "development" | "none"
    entry: {
        "scriptSendToAnyone": "./src/index.js",
        "generateSendToAnyoneCode": "./src/generateSendToAnyoneCode.js",
        "idrissSendToAnyoneSDK": "./src/idrissSendToAnyoneSDK/idrissSendToAnyoneSDK.js",
    },
    devtool: "inline-source-map",
    output: {
        path: path.resolve(__dirname, "buildResults"),
        filename: "static/js/[name].js",
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "./src/send-to-anyone.html", to: "."},
                {from: "./src/generateSendToAnyoneCode.html", to: "."},

            ],
        }),
        //new BundleAnalyzerPlugin()
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
    },
    optimization: {
        //runtimeChunk: 'single',
    },
}
