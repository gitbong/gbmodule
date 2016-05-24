/**************************** Config ****************************/


var SRC_PATH = 'src';                                                  //开发目录
var RELEASE_PATH = 'release';                                          //发布目录

var ASSET_PATH = '';
var ENTRY_PATH = '';                                                    //入口目录,SRC_PATH/ENTRY_PATH

var htmlList = ['index.html'];                                          //需要发布的html文件,相对SRC_PATH/PROJECT_NAME
var ignoreFolders = [];                                                 //ASSET_PATH下,不需要发布的文件夹,
var packCssFile = ['css/lib.css'];                                      //ASSET_PATH下,需要打包的css文件

/**************************** Gulp content ****************************/

var gulp = require('gulp');
var clean = require('gulp-clean');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var gulpSequence = require('gulp-sequence');
var html2js = require('gulp-html2js');
var base64 = require('gulp-base64');
var replace = require('gulp-replace');

/**************************** clean ****************************/

gulp.task('clean', function () {
	return gulp.src(RELEASE_PATH + '*', {read: false})
		.pipe(clean())
});
gulp.task('cleanTempFiles', function () {
	return gulp.src(releasePath('_tempfile', ASSET_PATH), {read: false})
		.pipe(clean())
});

/**************************** html & css ****************************/

gulp.task('build', function () {
	console.log(srcPath(htmlList, ENTRY_PATH));
	return gulp.src(srcPath(htmlList, ENTRY_PATH))
		.pipe(useref())
		.pipe(gulpif('*.css', minifyCss()))
		.pipe(gulp.dest(releasePath('', ENTRY_PATH)));
});
gulp.task('fixcss', function () {
	return gulp.src(releasePath("css/*", ASSET_PATH))
		.pipe(autoprefixer())
		.pipe(gulp.dest(releasePath('css', ASSET_PATH)));
});
gulp.task('htmlmin', function () {
	return gulp.src(releasePath('*.html', ENTRY_PATH))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(releasePath('', ENTRY_PATH)))
});

/**************************** tpl & js ****************************/

gulp.task('html2js', function () {
	return gulp.src(srcPath('tpl/*.html', ASSET_PATH))
		.pipe(html2js('tpl.js', {
			adapter: 'javascript',
			name: '__gbTplData__',
			useStrict: false,
			target: 'js'
		}))
		.pipe(gulp.dest(releasePath('/_tempfile', ASSET_PATH)))
});

gulp.task('concatJsAndTpl', function () {
	return gulp.src([releasePath('js/*.js', ASSET_PATH), releasePath('_tempfile/*.js', ASSET_PATH)])
		.pipe(concat('index.min.js'))
		.pipe(
			uglify({
				mangle: {
					except: ['$scope', '$router', '_$dom', '$Signal', '_$scopeMgr', '$htmlLoader', '$libsLoader', '_$scopeLoading', '_$ctor']
				}
			})
		)
		.pipe(gulp.dest(RELEASE_PATH + '/' + ASSET_PATH + '/js'));
});

/**************************** base64 ****************************/

gulp.task('copyPackCss', function () {
	return gulp.src(srcPath(packCssFile, ASSET_PATH))
		// .pipe(replace('../img/aaa', '../img/aaaaaa'))
		.pipe(gulp.dest(releasePath('css', ASSET_PATH)));
});

gulp.task('base64css', function () {
	return gulp.src(releasePath(packCssFile, ASSET_PATH))
		.pipe(base64({
			maxImageSize: 999999 * 1024 // bytes
		}))
		.pipe(minifyCss())
		.pipe(gulp.dest(releasePath('css', ASSET_PATH)));
});

/**************************** copys ****************************/

gulp.task('copy', function () {
	ignoreFolders = ignoreFolders.concat(['js', 'css', 'tpl']);
	var str = ignoreFolders.join('|');
	var arg = srcPath("!(" + str + ")**/**", ASSET_PATH);
	return gulp.src(arg)
		.pipe(gulp.dest(releasePath('', ASSET_PATH)));
});

function srcPath(url_, path_) {
	if (typeof url_ === 'string') {
		return SRC_PATH + '/' + (path_ ? path_ + '/' : '') + url_;
	} else {
		var arr = [];
		for (var i in url_) {
			var u = SRC_PATH + '/' + (path_ ? path_ + '/' : '') + url_[i];
			arr.push(u);
		}
		return arr;
	}
}
function releasePath(url_, path_) {
	if (typeof url_ === 'string') {
		return RELEASE_PATH + '/' + (path_ ? path_ + '/' : '') + url_;
	} else {
		var arr = [];
		for (var i in url_) {
			var u = RELEASE_PATH + '/' + (path_ ? path_ + '/' : '') + url_;
			arr.push(u);
		}
		return arr;
	}
}

gulp.task('Release', gulpSequence('clean', ["copy", "build", 'html2js', "copyPackCss"], 'base64css', 'fixcss', "htmlmin", "concatJsAndTpl", "cleanTempFiles"));



