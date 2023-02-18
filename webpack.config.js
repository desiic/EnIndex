module.exports = {
    entry: {
        eidb: "./dist/eidb.js"
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
    }
};
// EOF