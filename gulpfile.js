'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var DEST = 'public/';

gulp.task('taskone', function() {
  return gulp.src('backend.js')
    .pipe(uglify())
    .pipe(gulp.dest(DEST));
});

gulp.task('tasktwo', function() {
  return gulp.src('pixel.js')
    .pipe(uglify())
    .pipe(gulp.dest(DEST));
});

gulp.task('taskthree', function() {
  return gulp.src('backend.html')
    .pipe(gulp.dest(DEST));
});

gulp.task('taskfour', function() {
  return gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest(DEST));
});

gulp.task('taskfive', function() {
  return gulp.src('node_modules/raphael/raphael-min.js')
    .pipe(gulp.dest(DEST));
});

gulp.task('tasksix', function() {
  return gulp.src('index.html')
    .pipe(gulp.dest(DEST));
});

gulp.task('default', ['taskone', 'tasktwo', 'taskthree', 'taskfour', 'taskfive', 'tasksix']);


