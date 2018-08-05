const fs = require('fs');
const path = require('path');
const glob = require('glob');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const PostCompilePlugin = require('post-compile-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

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
        new ImageminPlugin({
            disable: true, // This disables the plugin!
            externalImages: {
                context: 'static/images', // Important! This tells the plugin where to "base" the paths at
                sources: glob.sync('static/images/**/*.*'),
                destination: 'dist/img'
            },
            jpegtran: {
                progressive: true
            },
            pngquant: {}, // Empty object to enable with default options
            svgo: {
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            }
        }),
        new PostCompilePlugin(() => {
            // Executed after bundle compilation is done.

            // Create each built theme's `package.json`
            Object.values(cssThemes).forEach(theme => {
                const { name, dest } = theme;
                const { version, author } = pkg;
                const themeObject = JSON.stringify({
                    name,
                    version,
                    author
                }, undefined, 2);
                const pkgFilePath = path.join(path.normalize(dest), 'package.json');

                try {
                    fs.writeFileSync(pkgFilePath, themeObject);
                } catch (error) {
                    console.error(`Failed to write ${pkgFilePath}: ${error}`);
                }
            });
        }),
        new FileManagerPlugin({
            onStart: {
                delete: [
                    './dist/js/**',
                    './dist/img/**'
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

                    // Copy minified images
                    operations.push({
                        source: './dist/img/**',
                        destination: path.join(dest, 'assets', 'img')
                    });

                    // Copy files from the source root
                    const rootFiles = [
                        'index.html'
                    ];
                    if (rootFiles.length !== 0) {
                        const source = rootFiles.length === 1 ? rootFiles[0] : (`{${rootFiles.join(',')}}`);
                        operations.push({
                            source: `./${source}`,
                            destination: dest
                        });
                    }

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
