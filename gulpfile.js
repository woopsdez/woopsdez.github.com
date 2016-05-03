var gulp        = require('gulp');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var git         = require('gulp-git');
var imageResize = require('gulp-image-resize');
var browserSync = require('browser-sync');
var cp          = require('child_process');
var minimist    = require('minimist');
var runSequence = require('run-sequence');
const imagemin  = require('gulp-imagemin');
const pngquant  = require('imagemin-pngquant');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

/**
 * Build the Jekyll Site
 */
var messages = {jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'};

gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Make thumbnail
 */ 
gulp.task('thumbnail', function() {
    gulp.src('assets/images/privateworks/*.{jpg,png}', {base: 'assets/images/privateworks/'})
      .pipe(imageResize({
        width: 350,
        height:350,
        crop: true,
        upscale: false
        }))
    .pipe(gulp.dest('assets/images/privateworks/thumbnail/'));
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('assets/css'))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('assets/css/*.scss', ['sass']);
    gulp.watch('assets/js/*.js', ['jekyll-rebuild']);
    gulp.watch(['index.html', '*.md', '_layouts/*.html', '_posts/*', 'assets/css/*.css'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */ 
gulp.task('default', ['browser-sync', 'watch']);
gulp.task('deploy', function (callback) {
    runSequence('jekyll-build', 'add', 'commit', 'push', callback);
});