const gulp = require('gulp');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const del = require('del');

gulp.task('lint', jsLint);
gulp.task('cleanup', cleanUp);

function jsLint() {
  return gulp.src([
    'lib/**/*.js',
    'console*.js',
    '**/*.test.js',
    '!coverage/**/*',
    '!node_modules/**/*'
  ])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function cleanUp() {
  return del('downloads');
}
