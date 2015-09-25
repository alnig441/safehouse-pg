var gulp = require('gulp');
var jade = require('gulp-jade');
var watch = require('gulp-watch');

gulp.task('jade-templates', function(){
    gulp.src('./private/jade_templates/*.jade')
        .pipe(jade({}))
        .pipe(gulp.dest('./private/views/'))
});

gulp.task('watch', function(){
    gulp.watch('./private/jade_templates/*.jade', ['jade-templates']);
})

gulp.task('default',['watch'], function(){
    gulp.start('jade-templates');
});

