// include gulp and plugins
var	gulp = require('gulp'),
	newer = require('gulp-newer'),
	concat = require('gulp-concat'),
	preprocess = require('gulp-preprocess'),
	htmlclean = require('gulp-htmlclean'),
	imagemin = require('gulp-imagemin'),
	sass = require('gulp-sass'),
	pleeease = require('gulp-pleeease'),
	deporder = require('gulp-deporder'),
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	size = require('gulp-size'),
	del = require('del'),
	browsersync = require('browser-sync');
	mainBowerFiles = require('main-bower-files'),
	pkg = require('./package.json');
var $ = require('gulp-load-plugins')();






var devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),
	source = 'app/',
	dest = 'dist/',

	jade = {
		in: [source + '*.jade','!' + source + '_layout.jade'],
		watch: source + '**/*.jade',
		out: dest
	},



	images = {
		in: source + 'images/**/*.{png,jpeg,jpg}',
		out: dest + 'assets/images/'
	},
	css = {
		in: [source + 'scss/main.scss',source + 'scss/embed.scss'],
		watch: [source + 'scss/*.scss'],
		out: dest + 'assets/css/',
		sassOpts: {
			outputStyle: 'nested',
			imagePath: '../../images',
			precision: 3,
			errLogToConsole: true
		}
	},
	// fonts = {
	// 	in: source + 'fonts/*.*',
	// 	out: css.out + 'fonts/'
	// },

	js = {
		in: source + 'js/**/*',
		out: dest + 'assets/js/',
		filename: 'main.js',
		watch: [source + 'js/main.js',source + 'js/embed.js',source + 'js/profile.js']

	},
	
	syncOpts = {
		server: {
			baseDir: dest,
			index: 'index.html'
		},
		open: false,
		notify: true
	};


// show build type
console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + ' build');

// // build HTML files
// gulp.task('html', function() {
// 	var page = gulp.src(html.in).pipe(wiredep()).pipe(preprocess({ context: html.context }));
// 	if (!devBuild) {
// 		page = page
// 			.pipe(size({ title: 'HTML in' }))
// 			.pipe(htmlclean())
// 			.pipe(size({ title: 'HTML out' }));
// 	}
// 	return page.pipe(gulp.dest(html.out));
// });

// create a TASK to compile Jade to HTML using gulp-jade
gulp.task('html', function() {
   gulp.src(jade.in)
   .pipe($.jade({basedir: '/app',pretty: true, doctype: 'html'}))
   .on('error', $.util.log)
   .pipe(gulp.dest(jade.out));
});


// manage images
gulp.task('images', function() {
	return gulp.src(images.in)
		.pipe(newer(images.out))
		.pipe(imagemin())
		.pipe(gulp.dest(images.out));
});



// // copy fonts
// gulp.task('fonts', function() {
// 	return gulp.src(fonts.in)
// 		.pipe(newer(fonts.out))
// 		.pipe(gulp.dest(fonts.out));
// });

// compile Sass
gulp.task('sass', function() {
	return gulp.src(css.in)
		.pipe(sass(css.sassOpts))
		//.pipe(size({title: 'CSS in '}))
		//.pipe(pleeease(css.pleeeaseOpts))
		//.pipe(size({title: 'CSS out '}))
		.pipe(gulp.dest(css.out))
		.pipe(browsersync.reload({ stream: true }));
});

gulp.task('js', function() {
	if (devBuild) {
		return gulp.src(js.in)
			.pipe(newer(js.out))
			// .pipe(jshint())
			// .pipe(jshint.reporter('default'))
			// .pipe(jshint.reporter('fail'))
			.pipe(gulp.dest(js.out));
	}
	else {
		del([
			dest + 'js/*'
		]);
		return gulp.src(js.in)
			.pipe(deporder())
			.pipe(concat(js.filename))
			.pipe(size({ title: 'JS in '}))
			.pipe(stripdebug())
			.pipe(uglify())
			.pipe(size({ title: 'JS out '}))
			.pipe(gulp.dest(js.out));
	}
});



// browser sync
gulp.task('serve', function() {
	browsersync(syncOpts);
});

// default task
gulp.task('default', ['html','sass','js','serve'], function() {



});

// clean the build folder
gulp.task('clean', function() {
	del([
		dest + '*'
	]);
});

gulp.task('watch', function() {
    	// html changes
	gulp.watch(jade.watch, ['html', browsersync.reload]);

	// image changes
	//gulp.watch(images.in, ['images']);

	// // font changes
	// gulp.watch(fonts.in, ['fonts']);

	// sass changes
	gulp.watch([css.watch], ['sass',browsersync.reload]);

	// javascript changes
	gulp.watch(js.watch, ['js', browsersync.reload]);
});
