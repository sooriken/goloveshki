//дефолтные переменные gulp
const { src, dest, watch, parallel, series } = require('gulp');

//объявление переменных пакетов
const gulp         = require('gulp');
const pug          = require('gulp-pug');
const webpHTML     = require('gulp-webp-html')
const htmlclean    = require('gulp-htmlclean');
const sass         = require('gulp-sass')(require('sass'));
const sassGlob     = require('gulp-sass-glob');
const minCss       = require('gulp-minify-css');
const autoprefixer = require('gulp-autoprefixer');
const webpCss      = require('gulp-webp-css');
const imagemin     = require('gulp-imagemin');
const webp         = require('gulp-webp');
const changed      = require('gulp-changed');;
const server       = require('gulp-server-livereload');
const clean        = require('gulp-clean');
const fs           = require('fs');
const concat       = require('gulp-concat');
const rename       = require('gulp-rename');
const sourceMaps   = require('gulp-sourcemaps');
const plumber      = require('gulp-plumber');
const notify       = require('gulp-notify');

const webpack      = require('webpack-stream');
const babel        = require('gulp-babel');

// конфиг файлы
var sources = {
    // css
    css          : './app/src/sass/*.sass',
    destCss      : './app/css',
    // css min
    cssMin       : './app/css-min/**/*',
    destCssMin   : './app/css-min',
    // sass
    anySass      : './app/src/sass/**/*.sass',
    // pug
    pug          : './app/**/*.pug',
    blocksPug    : '!./app/blocks/*.pug',
    // html
    html         : './app/**/*.html',
    // image
    images       : './app/src/images/**/*',
    destImage    : 'dist/images-min',
    destMinImage : './app/images-min',
    minImage     : './app/images-min/**/*',
    // fonts
    fonts        : './app/fonts/**/*',
    destFonts    : './dist/fonts',
    // files
    files        : './app/files/**/*',
    destFiles    : './dist/files',
    // js
    js           : './app/src/js/*.js',
    destJs       : './app/js-bundle',
    bundleJs     : './app/js-bundle/*.js',
    anyJs        : './app/src/js/**/*.js',
    // webpack config
    webpackConfig: './webpack.config.js',
}

// настройки сервера
const serverOptions = {
			livereload: true,
			open: true
	}

// функция настроек plumber
const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
    }),
    };
};

// функция pug (преобразует index.pug)
gulp.task('pug', function() {
    return src([sources.pug, sources.blocksPug ])
        .pipe(plumber(plumberNotify('Pug')))
        .pipe(pug({pretty: true}))
		.pipe(webpHTML())
        .pipe(htmlclean())
        .pipe(dest('./app/'))
});

// функция sass (конвертирует все sass файлы)
gulp.task('sass', function() {
    return src(sources.css)
        .pipe(changed(sources.destCss))
        .pipe(plumber(plumberNotify('Sass')))
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
//        вывод экспандед версии css файла:
        .pipe(sass({
            outputStyle : 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourceMaps.write())
        .pipe(webpCss())
        .pipe(dest(sources.destCss))
        // вывод минифицированной версии css файла:
        .pipe(minCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourceMaps.write())
        .pipe(dest(sources.destCssMin))
});

// функция js webpack
gulp.task('js', function() {
    return src(sources.js)
        .pipe(changed(sources.destJs))
        .pipe(plumber(plumberNotify('Js')))
//        .pipe(babel)
        .pipe(webpack(require(sources.webpackConfig)))
        .pipe(dest(sources.destJs));
})

// функция лайв-сервера
gulp.task('server', function() {
	return src('./app/')
		.pipe(server(serverOptions));
});

// функция clean (очищает папку "dist")
gulp.task('clean', function(done) {
    if (fs.existsSync('./dist/')) {
	   return src('./dist/', {read: false})
           .pipe(clean({ force: true }));
    }
    done();
});

//функция сжатия изображений
gulp.task('images', function() {
    return src(sources.images)
    .pipe(changed(sources.destMinImage))
    .pipe(webp())
    .pipe(dest(sources.destMinImage))
    .pipe(src(sources.images))
    .pipe(changed(sources.destMinImage))
    .pipe(imagemin({ 
        verbose: true
    }))
    .pipe(dest(sources.destMinImage))
});

//функция билда изображений
gulp.task('imagesMin', function() {
    return src(sources.minImage)
        .pipe(dest(sources.destImage));
});

// функция копирования шрифтов в готовую папку dist
gulp.task('fonts', function() {
    return src(sources.fonts)
        .pipe(dest(sources.destFonts));
});

// функция копирования файлов в готовую папку dist
gulp.task('files', function() {
    return src(sources.files)
        .pipe(dest(sources.destFiles));
});

// функция копирования .html в готовую папку dist
gulp.task('html', function() {
    return src(sources.html)
        .pipe(dest('./dist'));
});

// функция копирования css файлов в готовую папку dist
gulp.task('css', function() {
    return src(sources.cssMin)
        .pipe(dest('./dist/css-min'));
});

// функция копирования css файлов в готовую папку dist
gulp.task('jsBundle', function() {
    return src(sources.bundleJs)
        .pipe(dest('./dist/js-bundle'));
});

// функция watch (слежение за sass и pug файлами)
gulp.task('watch', function() {
	gulp.watch(sources.anySass, gulp.parallel('sass'));
	gulp.watch(sources.pug, gulp.parallel('pug'));
	gulp.watch(sources.anyJs, gulp.parallel('js'));
	gulp.watch(sources.images, gulp.parallel('images'));
});

// функция default (clean, pug, sass, server, watch)
gulp.task('default', gulp.series(
    gulp.parallel('pug', 'sass', 'js', 'images'),
    gulp.parallel('server', 'watch')
));

// функция build
gulp.task('build', gulp.series(
    'clean',
    'html',
    'css',
    'jsBundle',
    'files',
    'fonts',
    'imagesMin'
));