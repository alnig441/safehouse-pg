var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var watch = require('gulp-watch');
var minify = require('gulp-minify-css');
var vendors = ['./node_modules/ng-file-upload/dist/ng-file-upload.min.js', './node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js'];
var dev = ['./development/jade_templates/*.jade', './development/javascripts/*.js', './development/modules/*.js', './development/styles/*.css']

gulp.task('jade-templates', function(){
    gulp.src('./development/jade_templates/*.jade')
        .pipe(jade({}))
        .pipe(gulp.dest('./public/views/'))
});

/*
gulp.task('watch', function(){
    gulp.watch('./development/jade_templates/!*.jade', ['jade-templates']);
})
*/

gulp.task('watch', function(){
    gulp.watch(dev, ['jade-templates', 'move-js', 'move-modules', 'move-css']);
})


gulp.task('default',['watch', 'move-vendors', 'move-css', 'move-js', 'move-modules'], function(){
    gulp.start('jade-templates');
});

gulp.task('move-vendors', function(){
    gulp.src(vendors)
        .pipe(gulp.dest('./public/vendors/'))
})

gulp.task('move-js', function(){
    return gulp.src('./development/javascripts/*.js')
        //.pipe(sourcemaps.init())
        //.pipe(concat('app.min.js'))
        //.pipe(uglify())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('move-css', function(){
    return gulp.src('./development/styles/*.css')
        .pipe(minify())
        .pipe(gulp.dest('./public/stylesheets'))
})

gulp.task('move-modules', function(){
    return gulp.src('./development/modules/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/javascripts'));
})