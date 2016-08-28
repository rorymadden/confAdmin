// Assigning modules to local variables
var gulp = require('gulp');
var del = require('del');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
// var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
// var pkg = require('./package.json');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var templateCache = require('gulp-angular-templatecache');

// Set the banner content
// var banner = ['/*!\n',
//     ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
//     ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
//     ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
//     ' */\n',
//     ''
// ].join('');

// Default task
gulp.task('default', ['minify-css','minify-html', 'minify-img', 'copy', 'templates']);

gulp.task('clean', function () {
	// return gulp.src('dist', {read: false})
	// 	.pipe(clean());
	return del(['dist/**/*', 'dist/*']);
});

// Less task to compile the sass files and add the banner
gulp.task('sass', function() {
    return gulp.src('./app/sass/app.scss')
        .pipe(sass())
//         .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Minify CSS
gulp.task('minify-css', ['sass'], function() {
    return gulp.src('./app/css/app.css')
        .pipe(cleanCSS({ compatibility: 'ie9' }))
        .pipe(rename({ suffix: '.min' }))
        // .pipe(gulp.dest('app/css'))
        .pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Minify JS

//TODO: Bunch up scripts & template html files
// gulp.task('minify-js', ['clean'],function() {
// //     return gulp.src(['app/**/*.js'])
// //         .pipe(uglify())
// // 				.pipe(concat('app.js'))
// // //         .pipe(header(banner, { pkg: pkg }))
// //         .pipe(rename({ suffix: '.min' }))
// //         .pipe(gulp.dest('app/'))
// //         .pipe(gulp.dest('dist/'))
// //         .pipe(browserSync.reload({
// //             stream: true
// //         }));
//
// 		return gulp.src('app/**/*.js')
//         .pipe(sourcemaps.init())
//         .pipe(babel({
//             presets: ['es2015']
//         }))
//         .pipe(concat('all.js'))
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('dist/js'))
// 				.pipe(browserSync.reload({
//             stream: true
//         }));
// });


gulp.task('templates', function () {
  return gulp.src('app/components/**/*.html')
    .pipe(templateCache())
    .pipe(gulp.dest('app'));
});

gulp.task('minify-html', ['templates'],function() {
  return gulp.src('app/*.html')
    // .pipe(htmlmin({collapseWhitespace: true}))
		.pipe(useref())
		// .pipe(gulpif('*.js', babel({ presets: ['es2015'] })))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-img',function () {
  return gulp.src(['app/img/**/*', 'app/img/*'])
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'));
});

gulp.task('CNAME', ['clean'], function() {
    return gulp.src(['CNAME', 'favicon.ico'])
        .pipe(gulp.dest('dist'))
})


// Copy all third party dependencies from node_modules to vendor directory
// gulp.task('copy', ['bootstrap', 'jquery', 'fontawesome', 'CNAME']);
gulp.task('copy', ['CNAME']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
        port: 8080
    });
});

// Watch Task that compiles LESS and watches for HTML or JS changes and reloads with browserSync
gulp.task('dev', ['browserSync', 'minify-css', 'minify-html', 'minify-img','templates'], function() {
    gulp.watch('app/sass/*.scss', ['sass', 'minify-css']);
    gulp.watch('app/components/**/*.html', ['templates', browserSync.reload]);
    gulp.watch('app/**/*.js', ['minify-html', browserSync.reload]);
    gulp.watch('app/img/**/*', ['minify-img']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('app/*.html', ['minify-html', browserSync.reload]);
    // gulp.watch('app/**/*.js', browserSync.reload);
});

// gulp.task('deploy', function() {
//   return gulp.src('./dist/**/*')
//     .pipe(ghPages({
// 			remoteUrl: 'https://github.com/rorymaddeninitiate/uxdx2016.git'
// 		}));
// });
