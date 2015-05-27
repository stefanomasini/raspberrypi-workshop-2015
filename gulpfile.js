var gulp = require('gulp');
var gutil = require('gulp-util');
var dirSync = require( 'gulp-directory-sync' );


var DESTINATION_DIR = '/Volumes/Home Directory/workshop';


gulp.task('sync_public', function() {
    return gulp.src('')
        .pipe(dirSync('public', DESTINATION_DIR + '/public', { printSummary: true } ))
        .on('error', gutil.log);
});

gulp.task('sync_js', function() {
    return gulp.src('')
        .pipe(dirSync('js', DESTINATION_DIR + '/js', { printSummary: true } ))
        .on('error', gutil.log);
});

gulp.task('default', ['sync_public', 'sync_js'], function() {
    gulp.watch(['public/**/*.*', 'js/**/*.*'], function() {
        gulp.run(['sync_public', 'sync_js']);
    });
});
