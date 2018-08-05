const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const pkg = require('./package.json');

const { config } = pkg;
const { cssThemes } = config;

const webpackConfig = mode => ({
    entry: {
        // Exports all window. objects for mako files
        index: './static/js/index.js',
        // Main Vue app
        app: './static/js/app.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist', 'js')
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js'
        }
    },
    performance: {
        hints: false
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: 'vendors'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [{
                    loader: 'vue-loader',
                    options: {
                        // This is a workaround because vue-loader can't get the webpack mode
                        productionMode: mode === 'production'
                    }
                }]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new FileManagerPlugin({
            onStart: {
                delete: [
                    './dist/js/**'
                ]
            },
            onEnd: {
                copy: Object.values(cssThemes).reduce((operations, theme) => {
                    const { dest } = theme;
                    // Queue operations for each theme

                    // Copy bundled application
                    operations.push({
                        source: './dist/js/**',
                        destination: path.join(dest, 'assets', 'js')
                    });
                    // Copy templates
                    operations.push({
                        source: './views/**/*',
                        destination: path.join(dest, 'templates')
                    });
                    return operations;
                }, [])
            }
        })
    ]
});

module.exports = (_env, argv) => webpackConfig(argv.mode);
