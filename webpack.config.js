module.exports = {
    entry: "./src/client/app",
    output: {
        path: __dirname + "/dist/client",
        filename: "app.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel"
            }
        ]
    }
};
