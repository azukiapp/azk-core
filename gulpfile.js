var babel      = require('gulp-babel');
var gulp       = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var mocha      = require('gulp-mocha');
var rimraf     = require('rimraf');
var sourcemaps = require('gulp-sourcemaps');
var yargs      = require('yargs');
require('babel/polyfill');
require('source-map-support').install();

/*
   babel
*/
gulp.task('babel-src', ['clean-lib-src'], function () {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('lib/src'));
});

gulp.task('babel-spec', ['clean-lib-spec'], function () {
  return gulp.src('spec/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('lib/spec'));
});

gulp.task('babel', ['babel-src', 'babel-spec']);

/*
   clean
*/
gulp.task('clean-lib-src', function (cb) {
  rimraf('./lib/src', cb);
});

gulp.task('clean-lib-spec', function (cb) {
  rimraf('./lib/spec', cb);
});

/*
   watch
*/
gulp.task('watch-src', function() {
  gulp.watch('src/**/*.js', ['babel-src']);
});

gulp.task('watch-spec', function() {
  gulp.watch(['src/**/*.js', 'spec/**/*.js'], ['mocha']);
});

/*
   mocha
*/
gulp.task('test', ['mocha', 'watch-spec']);

gulp.task('mocha', ['babel', 'jshint', 'jscs'], function() {
  return gulp.src('lib/spec/**/*.js', { read: false })
    .pipe( mocha( {
      reporter: 'spec', growl: 'true', grep: yargs.argv.grep, timeout: 4000
    } ));
});

/*
   lint: jshint + jscs
*/
gulp.task('jshint', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jscs', function() {
  return gulp.src(['src/**/*.js', 'spec/**/*.js'])
    .pipe(jscs());
});

gulp.task('lint', ['jscs', 'jshint']);

/*
   default
*/
gulp.task('default', ['babel-src', 'watch-src']);
