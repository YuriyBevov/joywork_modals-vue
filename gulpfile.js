'use strict';

const gulp = require('gulp');

// CONFIG

const { PATHS, BUILD_PATH } = require('./gulp.config')

// SERVICES

const plumber = require("gulp-plumber");
const del = require("del");
const rename = require("gulp-rename");
const sourcemap = require("gulp-sourcemaps");

// HTML

const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");

// Css

const css = require("gulp-sass")(require("sass"));
const csso = require("gulp-csso");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");

// IMAGES AND SVG

const svgstore = require("gulp-svgstore");
// const webp = require("gulp-webp");
// const imagemin = require('gulp-imagemin');

// JS

// const webpack = require("webpack-stream");

// SERVER

const browserSync = require('browser-sync').create();

// TASKS

const clean = () => {
  return del(BUILD_PATH);
}

const fonts = () => {
  return gulp.src([PATHS.fonts.src])
  .pipe(gulp.dest(PATHS.fonts.output));
}

const html = () => {
  return gulp.src([PATHS.html.src])
    .pipe(plumber())
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(BUILD_PATH));
};

const styles = () => {
  return gulp.src([PATHS.styles.inputFileName])
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(css())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe(csso())
    .pipe(rename(PATHS.styles.outputFileName))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe(browserSync.stream());
};
 
const images = () => (
    gulp.src(PATHS.images.src)
    .pipe(gulp.dest(PATHS.images.dest))
);

/*const toWebp = () => {
  return gulp.src(PATHS.images.webpSrc)
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(PATHS.images.webpDest));
}

const js = () => {
  return gulp.src([PATHS.scripts.inputFileName])
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest(BUILD_PATH));
}; */

const server = () => {
  browserSync.init({
    server: BUILD_PATH,
    notify: false,
    open: true,
    cors: true,
    ui: false,
    port: 3000
  });

  gulp.watch(PATHS.styles.src, gulp.series(styles, refresh));
  gulp.watch(PATHS.html.srcWatch, gulp.series(html, refresh));
  //gulp.watch(PATHS.scripts.srcWatch, gulp.series(js, refresh));
  //gulp.watch(PATHS.vue.srcWatch, gulp.series(js, refresh));
};

const refresh = (done) => {
  browserSync.reload();
  done();
}

const sprite = () => {
  return gulp.src([PATHS.images.spriteSrc])
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename(PATHS.images.spriteFileName))
    .pipe(gulp.dest(PATHS.images.spriteDest));
}

const build = gulp.series(clean, fonts,html, styles/*, js,*/, images, sprite);
const start = gulp.series(build, server);
//const convertToWebp = gulp.series(toWebp, start);

exports.build = build;
exports.start = start;
// exports.convertToWebp = convertToWebp;

