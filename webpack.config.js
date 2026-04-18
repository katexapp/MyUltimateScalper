const path = require('path');
const { name } = require('./package.json');

module.exports = {
    optimization: {
        minimize: false
    },
    experiments: {
        outputModule: true,
    },
    mode: 'production',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: `${name}.js`,
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'module',
        },
        globalObject: 'typeof self !== "undefined" ? self : window'
    }
};
