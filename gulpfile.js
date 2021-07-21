"use strict";
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const critical = require("critical").stream;
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
const terser = require("gulp-terser");
const webp = require("gulp-webp");
sass.compiler = require("node-sass");

// const responsive = require('gulp-responsive');

// tasks
// CSS
const styles = () => {
  const config = {
    src: [
      "./source/normalize/normalize.css",
      "./source/sass/variables.scss",
      "./source/sass/style.scss",
      "./source/sass/mixins.scss",
      "./source/sass/blocks/**/*.scss",
    ],
    dest: "./build/css",
    fileName: "style.min.scss",
  };

  return gulp
    .src(config.src, {
      allowEmpty: true,
    })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat(config.fileName))
    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("./"))
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream());
};
exports.styles = styles;

// Generate & Inline Critical-path CSS
const criticalCss = () => {
  const config = {
    src: "./build/*.html",
    dest: "./build",
  };

  return gulp
    .src(config.src)
    .pipe(
      critical({
        base: "./build",
        inline: true,
      })
    )
    .on("error", (err) => {
      log.error(err.message);
    })
    .pipe(gulp.dest(config.dest));
};
exports.criticalCss = criticalCss;

// Copy
const copy = () => {
  const config = {
    src: [
      "./source/fonts/**/*.{woff,woff2}",
      "./source/img/**",
      "./source/robots.txt",
      "./source/favicon.png",
      // "./source/js/**/*.js",
      // ".source/*.html"
    ],
    dest: "./build",
  };

  return gulp
    .src(config.src, {
      base: "source",
    })
    .pipe(gulp.dest(config.dest));
};
exports.copy = copy;

// deliting files and dir's
const clean = () => del("./build");
exports.clean = clean;

// SVG sprite creator
const createSVGSprite = () => {
  const config = {
    src: "./source/img/icon-*.svg",
    dest: "./build/img",
  };

  return gulp
    .src(config.src)
    .pipe(
      svgstore({
        inlineSvg: true,
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(config.dest));
};
exports.createSVGSprite = createSVGSprite;

// posthtml processing
const html = () => {
  const config = {
    src: "./source/*.html",
    dest: "./build",
  };

  return gulp
    .src(config.src)
    .pipe(posthtml([include()]))
    .pipe(
      htmlmin({
        // collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest(config.dest));
};
exports.html = html;

// browser-sync
const bSyncServer = () => {
  return bSyncServer({
    notify: false,
    server: {
      baseDir: "./build",
      port: 3000,
    },
  });
};
exports.bSyncServer = bSyncServer;

// IMGs
// images processing в source
const imgOptimization = () => {
  const config = {
    src: "source/img/**/*.{png,jpg,svg,PNG,JPG,SVG}",
    dest: "./source/img",
  };

  return gulp
    .src(config.src)
    .pipe(
      imagemin([
        imagemin.optipng({
          optimizationLevel: 3,
        }),
        imagemin.jpegtran({
          progressive: true,
        }),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest(config.dest));
};
exports.imgOptimization = imgOptimization;

const createWebp = () => {
  const config = {
    src: "./source/img/**/*.{png,jpg}",
    dest: "./build/img",
  };

  return gulp
    .src(config.src)
    .pipe(
      webp({
        quality: 90,
      })
    )
    .pipe(gulp.dest(config.dest));
};
exports.createWebp = createWebp;

// responsive images
// export const respImgsProsessing = () => {
//   return gulp
//     .src("source/img/*.{png,jpg}")
//     .pipe(
//       responsive({
//         "bg-*.jpg": {
//           width: 600,
//           height: 360,
//           progressive: true,
//         },
//       })
//     )
//     .pipe(gulp.dest("build/respimg"));
// };

// JS scripts optimizaton
const scripts = () => {
  return gulp
    .src("./source/js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(concat("scripts.js"))
    .pipe(terser())
    .pipe(
      rename({
        prefix: "",
        suffix: ".min",
      })
    )
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./build/js"));
};
exports.scripts = scripts;

// watchers
const server = async () => {
  browserSync.init({
    browser: "chrome",
    server: "./build",
    notify: false,
    port: 3000,
  });

  const src = {
    styles: "./source/sass/**/*.scss",
    js: "./source/js/**/*.js",
    html: "./source/**/*.html",
  };

  gulp.watch(src.styles, gulp.series(styles));
  gulp.watch(src.js, gulp.series(scripts));
  gulp.watch(src.html, gulp.series(html)).on("change", browserSync.reload);
};
exports.server = server;

const build = gulp.series(
  clean,
  gulp.parallel(imgOptimization, styles, scripts),
  copy,
  gulp.parallel(createSVGSprite, createWebp),
  html,
  criticalCss
);
exports.build = build;

// default
exports.default = build;
