"use strict";
// modules
const gulp = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const browserSync = require("browser-sync").create()
const cleanCSS = require("gulp-clean-css")
const critical = require("critical").stream
const concat = require("gulp-concat")
const del = require("del")
const imagemin = require("gulp-imagemin")
const include = require("posthtml-include")
const plumber = require("gulp-plumber")
const posthtml = require("gulp-posthtml")
const htmlmin = require("gulp-htmlmin")
const rename = require("gulp-rename")
const sass = require("gulp-sass")
const sourcemaps = require("gulp-sourcemaps")
const svgstore = require("gulp-svgstore")
const webp = require("gulp-webp")
sass.compiler = require("node-sass")

const terser = require('gulp-terser')
// const responsive = require('gulp-responsive');

// tasks
// подготовка css
gulp.task("styling", async () => {
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
});

//critical css
// gulp.task("critical", async () => {
//   critical.generate({
//       inline: true,
//       base: './build',
//       src: 'index.html',
//       css: ['./build/css/style.min.css'],
//       dest: './index.html',
//       minify: true,
//       width: 320,
//       height: 480
//   })
// })
// Generate & Inline Critical-path CSS
gulp.task('critical', async () => {
  return gulp
    .src('./build/*.html')
    .pipe(critical({
      base: './build',
      inline: true,
    }))
    .on('error', err => {
      log.error(err.message);
    })
    .pipe(gulp.dest('./build'));
});

// Копирование
gulp.task("copy", async () => {
  gulp.src([
      "./source/fonts/**/*.{woff,woff2}",
      "./source/img/**",
      "./source/robots.txt",
      "./source/favicon.png"
      // "./source/js/**",
      // ".source/*.html"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("./build"));
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
    .pipe(gulp.dest("./build"));
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
gulp.task("images", async () => {
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
});

// преобразуем необходимые изображения в webp в source
gulp.task("webp", async () => {
  gulp.src("./source/img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("./build/img"));
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
  })

  gulp.watch("./source/sass/**/*.scss", gulp.series("styling"))
  gulp.watch("./source/js/**/*.js", gulp.series("scripts"))
  gulp.watch("./source/**/*.html", gulp.series("html")).on("change", browserSync.reload)
})









// final
gulp.task("build",
  gulp.series("clean",
    gulp.parallel(
      "images",
      "styling",
      "scripts"
    ),
    "copy",
    gulp.parallel("svg-sprite", "webp"),
    "html",
    "critical"
  )
);