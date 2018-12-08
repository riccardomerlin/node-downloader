const { src } = require('gulp');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const del = require('del');

function jsLint() {
  return src([
    'src/**/*.js',
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
  return del('downloads/*.*');
}

module.exports = {
  lint: jsLint,
  cleanup: cleanUp
};
