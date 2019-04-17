'use strict';

const gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	notifier = require('node-notifier'),
	pug = require('gulp-pug'),
	miss = require('mississippi'),
	del = require('del'),
	server = require('gulp-server-livereload'),
	runSequence = require('run-sequence').use(gulp),
	file = require('gulp-file'),
	insert = require('gulp-insert'),
	args   = require('yargs').argv,
	chokidar = require('chokidar'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	postcss = require('gulp-postcss'),
	cssnext = require('postcss-cssnext'),
	atImport = require("postcss-import"),
	postcssMixins = require('postcss-mixins'),
	gulpif = require('gulp-if'),
	csso = require('gulp-csso'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	wait = require('gulp-wait'),

	webpack = require('webpack'),
	webpackStream = require('webpack-stream'),
	named = require('vinyl-named'),
	VueLoaderPlugin = require('vue-loader/lib/plugin');

const config = {
	src: {
		html:  'src/pug/*.pug',
		css: [
			'src/css/style.css',
			'src/css/blocks/**/*.css'
		],
		js: 'src/js/*.js',				
		fonts: 'src/fonts/*.*',	
		images: [
			'src/images/*.jpg',
			'src/images/*.png'
		],
		manifest: 'src/manifest/*.*',
	},
	dist: {
		html:  './dist',
		css: './dist/css',
		js: './dist/js',
		fonts: './dist/fonts',
		manifest: './dist/manifest',
		images: './dist/images',
	},	
	watch: {
		html:  'src/pug/*.pug',
		css: 'src/css/**/*.css',
		js: 'src/js/*.js',
		fonts: 'src/fonts/*.*',
		images: [
			'src/images/*.jpg',
			'src/images/*.png'
		],
		manifest: 'src/manifest/*.*',	
	},
	browsers: ['last 2 versions','ie >= 11','> 1%'],
	css: {
		blocksFile: 'src/css/blocks/items.json',
	}	
}	

function err_log(error) { 
	console.log([ 
		'', 
		"----------ERROR MESSAGE START----------", 
		("[" + error.name + " in " + error.plugin + "]"), 
		error.message, 
		"----------ERROR MESSAGE END----------", 
		'' 
	].join('\n')); 
	notifier.notify({ title: 'Error', message: error.plugin }); 
}

function copyFiles(src, dest){
	miss.pipe(
		gulp.src(src),
		gulp.dest( dest ), 		
		(err) => { 
			if (err) return err_log(err); 
		} 
	)	
}

function html(src, dest){
	miss.pipe(
		gulp.src(src),
		pug({pretty: '\t', doctype: 'html', locals: {config: config, path: path, args: args}}),
		gulp.dest( dest ), 		
		(err) => { 
			if (err) return err_log(err); 
		} 
	)
}

function css(src, dest){
	miss.pipe(
		gulp.src( src ),
		sourcemaps.init(),
		gulpif( Array.isArray(src), concat('style.css')),
		postcss([
			postcssMixins({
				mixins: {
					cssLock: function (mixin, prop, breakpoint1, breakpoint2, y1, y2) {
						function breakpointToPx(breakpoint){
							switch(breakpoint){
								case 'sm': 
									return 576;
								break;
								case 'md': 
									return 768;
								break;
								case 'lg': 
									return 992;
								break;
								case 'xl': 
									return 1200;
								break;
								default: 
									return breakpoint;
								break;
							}
						}
						let x1 = breakpointToPx(breakpoint1);
						let x2 = breakpointToPx(breakpoint2);
						let m = (y2 - y1) / (x2 - x1);
						let b = y1 - m*x1;	
						//toFixed(10) - ie11 тупит при >10 знаков после запятой				
						let rule = `${prop}: calc( ${m.toFixed(10)}*100vw ${b>0 ? '+ ' : '- '} ${Math.abs(b.toFixed(10))}px);`;
						mixin.replaceWith(rule);
					}
				}
			}),
			atImport({ path: 'src/css' }),
			cssnext({
				browsers: config.browsers,
				features: {
					customProperties: {
						preserve: true
					},
					calc: false
				} 
			}),
		]),	
		gulpif(
			(args.prod || args.production) || args.cleanCSS,
			csso()		
		),				
		sourcemaps.write('/'),
		gulp.dest( dest ), 			
		(err) => {
			if (err) return err_log(err);
		}	
	);			
}

function scss(src, dest){
	miss.pipe(
		gulp.src( src ),
		wait(500),
		sass(), 
		autoprefixer({
			browsers: config.browsers,
		}),
		gulpif(
			(args.prod || args.production) || args.cleanCSS,
			csso()			
		),		  
		gulp.dest( dest ), 
		(err) => {
			if (err) return err_log(err);
		}
	);	
}

function js(src, dest){
	return miss.pipe(        
		gulp.src(src),
		named(),
		webpackStream({
			mode: `${(args.prod || args.production) ? 'production' : 'development'}`,
			module: {
				rules: [
					{
						test: /\.vue$/,
						loader: 'vue-loader'
					},
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader'
					},
					{
						test: /\.css$/,
						use: [
							'vue-style-loader',
							'css-loader'
						]
					},
					{
						test: /\.pug$/,
						loader: 'pug-plain-loader'
					}					
				]
			},
			output: {
				chunkFilename: 'chunk[name].app.js',
			},	
			resolve: {
				//default: mainFields: ['browser', 'module', 'main'] - ie11 fail
				mainFields: ['browser', 'main']
			},
			plugins: [
				new VueLoaderPlugin()
			],
		}),
		gulp.dest(dest),
		(err) => { 
			if (err) return err_log(err); 
		} 
	)
}


gulp.task('css', [], ()=>{
	css(
		config.src.css,
		config.dist.css
	)	
});

gulp.task('js', [], ()=>{
	return js(
		config.src.js,
		config.dist.js
	)
});

gulp.task('fonts', [], ()=>{
	copyFiles(
		config.src.fonts,
		config.dist.fonts
	)
});

gulp.task('manifest', [], ()=>{
	copyFiles(
		config.src.manifest,
		config.dist.manifest
	)
});

gulp.task('images', [], ()=>{
	copyFiles(
		config.src.images,
		config.dist.images
	)
});

gulp.task('html', [], ()=>{
	html(
		config.src.html,
		config.dist.html
	)
});

gulp.task('server', [], ()=>{
	return gulp.src( './dist' )
			.pipe( 
				server({ 
					livereload: true,
					defaultFile: 'index.html', 
					open: false, 
					directoryListing: false,
				}) 
			);
});

gulp.task('clean', [], ()=>{
	del.sync( ['./dist/**/*'] );
});

gulp.task('watch', function() { 

	['css', 'js', 'fonts', 'images'].map((task)=>{
		let watcher = chokidar.watch( config.watch[task], { ignoreInitial: true } ); 
		watcher.on('change', (file) => { gulp.start(task) }); 
		watcher.on('add', (file) => { gulp.start(task) }); 
	})	

	let html_watcher = chokidar.watch( config.watch.html, { ignoreInitial: true } ); 
	html_watcher.on('change', (file) => { html(file, config.dist.html) }); 
	html_watcher.on('add', (file) => { html(file, config.dist.html) }); 		

});

gulp.task( 'build', ['clean'], function(){
	runSequence(
		'html',
		'css',
		'js',
		'fonts',
		'manifest',
		'images'
	)
});

gulp.task('default', [ 
	'build', 
	'server', 
	'watch' 
]);

const   BEM = require('./bem.js'); 
gulp.task('bem', function() { 
	new Promise((resolve,reject)=>{ 
		gulp.src( config.css.blocksFile ) 
		.pipe(insert.transform(function(contents, file) { 
			resolve( JSON.parse(contents) ); 
			return contents; 
		})); 
	}).then((items)=>{ 
		if( items.length === 0 ){ 
			err_log({message:'empty items.json', plugin: 'bem'}) 
		} 
		BEM(args, items); 
		return items; 
	});     
});