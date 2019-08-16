"use strict";
// modules
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const concat = require("gulp-concat");
const del = require("del");
const imagemin = require("gulp-imagemin");
const include = require("posthtml-include");
const plumber = require("gulp-plumber");
const posthtml = require("gulp-posthtml");
const htmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const svgstore = require("gulp-svgstore");
const watch = require("gulp-watch");
const webp = require("gulp-webp");
sass.compiler = require("node-sass");

const terser = require('gulp-terser');
// const responsive = require('gulp-responsive');

// tasks
// подготовка css
gulp.task("styling", (done) => {
  gulp.src([
      "./source/normalize/normalize.css",
      "./source/sass/variables.scss",
      "./source/sass/style.scss",
      "./source/sass/mixins.scss",
      "./source/sass/blocks/**/*.scss"
    ], {
      allowEmpty: true
    })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat("style.min.scss"))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("./"))
    .pipe(plumber.stop())
    .pipe(gulp.dest("./build/css"))
    .pipe(browserSync.stream());
  done();
});

// Копирование
gulp.task("copy", (done) => {
  gulp.src([
      "./source/fonts/**/*.{woff,woff2}",
      "./source/img/**"
      // "./source/js/**",
      // ".source/*.html"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("./build"));
  done();
});

// удаление файлов и директорий
gulp.task("clean", () => del("build/*"));

// сборка спрайта
gulp.task("svg-sprite", () => {
  return gulp.src("./source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("./build/img"));
});

// обработка html
gulp.task("html", () => {
  return gulp.src("./source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      // collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest("build/"));
});

// живой сервер
gulp.task("browser-sync", () => {
  browserSync({
    notify: false,
    server: {
      baseDir: "./build",
      port: 3000
    }
  });
});







// IMGs
// images processing в source
gulp.task("images", (done) => {
  gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("./source/img"));
  done();
});

// преобразуем необходимые изображения в webp в source
gulp.task("webp", (done) => {
  gulp.src("./source/img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("./build/img"));
  done();
});


// responsive images
// gulp.task('respimg', function () {
//   return gulp.src('source/img/*.{png,jpg}')
//     .pipe(responsive({
//       'bg-*.jpg': {
//         width: 600,
//         height: 360,
//         progressive: true
//       }
//     }))
//     .pipe(gulp.dest('build/respimg'));
// });








// JS
gulp.task("scripts", () => {
  return gulp.src("./source/js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(concat("scripts.js"))
    .pipe(terser())
    .pipe(rename({
      prefix: "",
      suffix: ".min"
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("./build/js"));
});






// watchers
gulp.task("serve", () => {
  browserSync.init({
    browser: "chrome",
    server: "./build",
    notify: false,
    port: 3000
  });

  gulp.watch("./source/sass/**/*.scss", gulp.series("styling"));
  gulp.watch("./source/js/**/*.js", gulp.series("scripts"));
  gulp.watch("./source/*.html", gulp.series("html")).on("change", browserSync.reload);
});






// финальный набор
// gulp.task("build",
//   gulp.series("clean",
//     gulp.parallel(
//       gulp.series("images", "webp"),
//       "styling", "scripts"),
//     "copy",
//     "svg-sprite",
//     "html"
//   ));


// вариант 2
gulp.task("build",
  gulp.series("clean",
    gulp.parallel(
      "styling",
      "scripts",
      "images"
    ),
    "copy",
    gulp.parallel("svg-sprite", "webp"),
    "html"
  )
);