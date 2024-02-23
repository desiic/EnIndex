module.exports = {
    entry: {
        eidb: "./src/eidb.js"
    },
    mode: "development",
    devtool: "source-map", // Important to have code readable
    output: {
        path: `${__dirname}/dist`,
        filename: "[name].bundle.js",
        library: {
            type: "module"
        }
    },
    experiments: {
        outputModule: true
    },
    module: {
        parser: {
            javascript: {
                importMeta: false
            }
        }
    },
    optimization: {
        minimize: false
    }
};
// EOF
