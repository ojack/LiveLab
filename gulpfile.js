var gulp = require("gulp"),
    less = require("gulp-less"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat"),
    minifycss = require("gulp-minify-css");

gulp.task("less", function() {
    return gulp.src("./public/css/main.less")
    .pipe(less())
    .pipe(minifycss())
    .pipe(gulp.dest("./public/css/"));
});

gulp.task("videoless", function() {
    return gulp.src("./public/css/video.less")
    .pipe(less())
    .pipe(minifycss())
    .pipe(gulp.dest("./public/css/"));
});

gulp.task("watch-less", function() {
    gulp.watch("./public/css/*.less", ["less"]);
});

gulp.task("compile4alex", function() {
    gulp.start("videoless");
    gulp.watch("./public/css/*.less", ["less"]);
});

gulp.task("default", function() {
    gulp.start("less");
    gulp.start("watch-less");
});

