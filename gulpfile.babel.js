import gulp from 'gulp';
import imagemin from "gulp-imagemin";
import newer from "gulp-newer";
import less from 'gulp-less';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import del from 'del';
import browserSync from 'browser-sync';

const server = browserSync.create();

const paths = {
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img/'
  },
  styles: {
    src: 'src/styles/**/*.less',
    dest: 'dist/styles/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'dist/scripts/'
  },
  pages: {
    src: 'src/**/*.html',
    dest: 'dist/'
  }
};

/*
 * For small tasks you can export arrow functions
 */
export const clean = () => del(['dist']);

/*
 * You can also declare named functions and export them as tasks
 */

export function images() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.src))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}]
      })
    )
    .pipe(gulp.dest(paths.images.dest))
}

export function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(less())
    .pipe(cleanCSS())
    // pass in options to the stream
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

export function scripts() {
  return gulp
    .src(paths.scripts.src, {
      sourcemaps: true
    })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));
}

export function htmls() {
  return gulp
    .src(paths.pages.src)
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(paths.pages.dest))
}

/*
 * Set up reload
 */
export function reload(done) {
  server.reload();
  done();
};

/*
 * Set up serve to init the page
 */
export function serve(done) {
  server.init({
    server: {
      baseDir: './dist'
    },
    port: 3000
  });
  done();
};


/*
 * You could even use `export as` to rename exported tasks
 */
function watchFiles() {
  gulp.watch(paths.images.src, gulp.series(images, reload));
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
  gulp.watch(paths.styles.src, gulp.series(styles, reload));
  gulp.watch(paths.pages.src, gulp.series(htmls, reload));
}
export {
  watchFiles as watch
};

/*
 * You can still use `gulp.task` create the build task that can be called alone
 * for example to set task names that would otherwise be invalid
 */
const build = gulp.series(clean, gulp.parallel(images, styles, scripts, htmls));
gulp.task('build', build);

/*
 * 
 * Here we set up the default process to fire up the server and watch
 */
const dev = gulp.series(clean, build, serve, watchFiles)


/*
 * Export a default task
 */
export default dev;