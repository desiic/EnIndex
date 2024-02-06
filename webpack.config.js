module.exports = {
    entry: {
        eidb: "./src/eidb.js"
    },
    mode: "production",
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
        minimize: true
    }
};
// EOF