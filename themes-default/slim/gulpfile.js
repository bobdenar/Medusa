#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const runSequence = require('run-sequence');
const livereload = require('gulp-livereload');
const gulpif = require('gulp-if');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const { argv } = require('yargs');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const xo = require('xo');

const xoReporter = xo.getFormatter('eslint-formatter-pretty');

/*
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const reporter = require('postcss-reporter');
*/

const PROD = process.env.NODE_ENV === 'production';
const pkg = require('./package.json');

const { config, xo: xoConfig } = pkg;
let cssTheme = argv.csstheme;
let buildDest = '';

/*
const processors = [
    reporter({
        clearMessages: true
    }),
    autoprefixer()
];

if (PROD) {
    processors.push(cssnano());
}
*/

// List JS files handled by Webpack
// These files will be ignored by the gulp tasks
const webpackedJsFiles = [
    'static/js/app.js',
    'static/js/index.js',
    'static/js/api.js',
    'static/js/router.js',
    'static/js/store/**/*.js',
    'static/js/templates/**/*'
];

const staticAssets = [
    'static/browserconfig.xml',
    'static/favicon.ico',
    'static/fonts/**/*',
    'static/js/**/*',

    // Webpacked files
    ...webpackedJsFiles.map(file => '!' + file)
];

/**
 * Get theme object.
 * @param {*} theme name passed by yargs.
 */
const getCssTheme = theme => {
    // Using the --csstheme is mandatory.
    if (argv.csstheme === undefined && !theme) {
        console.log('You need to pass a csstheme to build with the param --csstheme');
        process.exit(1);
    }

    // Check if the theme provided is available in the package.json config.
    if (!config.cssThemes[theme]) {
        console.log(`Please provide a valid theme with the --cssTheme parameter, theme ${theme} is not available in the package.json config section.`);
        process.exit(1);
    }
    return config.cssThemes[theme];
};

/**
 * Attemt to get the cssTheme config object from the package.json.
 */
const setCsstheme = theme => {
    cssTheme = getCssTheme(theme || cssTheme);
    if (cssTheme) {
        buildDest = path.normalize(cssTheme.dest);
    }
};

/**
 * Run a single js file through the xo linter. The lintFile function is triggered by a gulp.onChange event.
 * @param {*} file object that has been changed.
 */
const lintFile = file => {
    const files = [file.path];
    return xo.lintFiles(files, {}).then(report => {
        const formatted = xoReporter(report.results);
        if (formatted) {
            log(formatted);
        }
    });
};

/**
 * Run all js files through the xo (eslint) linter.
 */
const lint = () => {
    return xo.lintFiles([], {}).then(report => {
        const formatted = xoReporter(report.results);
        if (formatted) {
            log(formatted);
        }
        let error = null;
        if (report.errorCount > 0) {
            error = new Error('Lint failed, see errors above.');
            error.showStack = false;
            throw error;
        }
    });
};

const watch = () => {
    livereload.listen({ port: 35729 });
    // Image changes
    gulp.watch([
        'static/images/**/*.gif',
        'static/images/**/*.png',
        'static/images/**/*.jpg'
    ], ['img']);

    // Js Changes
    gulp.watch([
        'static/js/**/*.{js,vue}',
        ...xoConfig.ignores.map(ignore => '!' + ignore)
    ]).on('change', lintFile);
};

const moveStatic = () => {
    const dest = `${buildDest}/assets`;
    return gulp
        .src(staticAssets, {
            base: 'static'
        })
        .pipe(changed(buildDest))
        .pipe(gulp.dest(dest));
};

const moveImages = () => {
    const dest = `${buildDest}/assets/img`;
    return gulp
        .src('static/images/**/*', {
            base: 'static/images/'
        })
        .pipe(changed(dest))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }, { cleanupIDs: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dest))
        .pipe(gulpif(!PROD, livereload({ port: 35729 })))
        .pipe(gulpif(PROD, gulp.dest(dest)));
};

/** Gulp tasks */

/**
 * By default build.
 */
gulp.task('default', ['build']);

/**
 * Build the current theme and copy all files to the location configured in the package.json config attribute.
 * It's required to pass the theme name through the `--csstheme` parameter.
 * For example: gulp build --csstheme light, will build the theme and rename the light.css to themed.css and
 * copy all files to /themes/[theme dest]/. Themes destination is configured in the package.json.
 */
gulp.task('build', done => {
    // Whe're building the light and dark theme. For this we need to run two sequences.
    // If we need a yargs parameter name csstheme.
    setCsstheme();
    runSequence('lint', 'img', 'static', () => {
        if (!PROD) {
            done();
        }
    });
});

const syncTheme = (theme, sequence) => {
    return new Promise(resolve => {
        console.log(`Starting syncing for theme: ${theme[0]}`);
        setCsstheme(theme[0]);
        runSequence(sequence, resolve);
    });
};

/**
 * Build the current theme and copy all files to the location configured in the package.json config attribute.
 * It's required to pass the theme name through the `--csstheme` parameter.
 * For example: gulp build --csstheme light, will build the theme and rename the light.css to themed.css and
 * copy all files to /themes/[theme dest]/. Themes destination is configured in the package.json.
 *
 * Do not run the xo build, as this takes a lot of time.
 */
gulp.task('sync', async () => {
    // Whe're building the light and dark theme. For this we need to run two sequences.
    // If we need a yargs parameter name csstheme.
    for (const theme of Object.entries(config.cssThemes)) {
        await syncTheme(theme, ['img', 'static']);
    }
});

/**
 * Watch file changes and build.
 */
gulp.task('watch', ['build'], watch);

/**
 * Task for compressing and copying images to it's destination.
 * Should save up to 50% of total filesize.
 */
gulp.task('img', moveImages);

/**
 * Task for linting the js files using xo.
 * https://github.com/sindresorhus/xo
 */
gulp.task('lint', lint);

/**
 * Task for moving the static files to the destinations assets directory.
 */
gulp.task('static', moveStatic);
