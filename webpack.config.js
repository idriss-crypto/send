const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const setup = (mode) => {
    if (mode === 'production') {
        return {
            SEND_TO_HASH_CONTRACT_ADDRESS: `'senttohashconPROD'`
        }
    } else {
        return {
            SEND_TO_HASH_CONTRACT_ADDRESS: `'senttohashconDEV'`
        }
    }
}

module.exports = (env, argv) => {
    console.log(`This is the Webpack 5 'mode': ${argv.mode}`);

    return {
        mode: `{$argv.mode}`, // "production" | "development" | "none"
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
            new webpack.DefinePlugin(setup(argv.mode))
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
                },
            ]
        },
        optimization: {
            //runtimeChunk: 'single',
        },
    };
}
// module.exports = {
//     mode: "development", // "production" | "development" | "none"
//     entry: {
//         "scriptSendToAnyone": "./src/index.js",
//         "generateSendToAnyoneCode": "./src/generateSendToAnyoneCode.js",
//         "idrissSendToAnyoneSDK": "./src/idrissSendToAnyoneSDK/idrissSendToAnyoneSDK.js",
//     },
//     devtool: "inline-source-map",
//     output: {
//         path: path.resolve(__dirname, "buildResults"),
//         filename: "static/js/[name].js",
//     },
//     plugins: [
//         new CopyPlugin({
//             patterns: [
//                 {from: "./src/send-to-anyone.html", to: "."},
//                 {from: "./src/generateSendToAnyoneCode.html", to: "."},
//
//             ],
//         }),
//         //new BundleAnalyzerPlugin()
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.scss$/,
//                 use: [
//                     "css-loader", // translates CSS into CommonJS
//                     "sass-loader" // compiles Sass to CSS, using Node Sass by default
//                 ]
//             },
//             {
//                 test: /\.mpts$/,
//                 use: [
//                     "mpts-loader"
//                 ]
//             },
//             {
//                 test: /\.json$/,
//                 loader: 'json-loader'
//             }
//         ]
//     },
//     optimization: {
//         //runtimeChunk: 'single',
//     },
// }
