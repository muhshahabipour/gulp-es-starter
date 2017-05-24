'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';

import compass from 'gulp-compass';
import browserSync from 'browser-sync';
import useref from 'gulp-useref';
import uglify from 'gulp-uglify';
import gulpIf from 'gulp-if';
import cssnano from 'gulp-cssnano';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';
import del from 'del';
import runSequence from 'run-sequence';

import uglifyes from 'uglify-es';
import composer from 'gulp-uglify/composer';
import pump from 'pump';

const minify = composer(uglifyes, console);

const dirs = {
  src: 'src',
  dest: 'dist'
};

const sassPaths = {
  src: `${dirs.src}/app.scss`,
  dest: `${dirs.dest}/styles/`
};

gulp.task('styles', () => {
  return gulp.src(paths.src)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', plugins.sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dest));
});



// Basic Gulp task syntax
gulp.task('hello', () => {
  console.log('Hello Zell!');
});

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', () => {
  browserSync({
    server: {
      baseDir: 'src'
    }
  })
})

gulp.task('sass', () => {
  return gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(gulp.dest('src/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

gulp.task('compass', function() {
  gulp.src('./src/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'src/css',
      sass: 'src/scss'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('compress', function (cb) {
  // the same options as described above
  var options = {};

  pump([
      gulp.src('lib/*.js'),
      minify(options),
      gulp.dest('dist')
    ],
    cb
  );
});



// Watchers
gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
})

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', () => {

  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Optimizing Images 
gulp.task('images', () => {
  return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});

// Copying fonts 
gulp.task('fonts', () => {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

// Cleaning 
gulp.task('clean', () => {
  return del.sync('dist').then((cb) => {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', () => {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', (callback) => {
  runSequence(['compass', 'compress', 'browserSync'], 'watch',
    callback
  )
})

gulp.task('build', (callback) => {
  runSequence(
    'clean:dist',
    'compass', 'compress',
    ['useref', 'images', 'fonts'],
    callback
  )
})
