#!/usr/bin/env node

var program = require('commander');

program.version(require('../package.json').version);

//help命令
program
	.command('help')
	.description('显示使用帮助')
	.action(function() {
		program.outputHelp();
	});

//create命令
program
	.command('create [dir]')
	.description('创建一个空的博客')
	.action(function(dir) {
		require('../lib/cmd_create.js')(dir);
	});

//preview命令
program
	.command('preview [dir]')
	.description('实时预览')
	.action(function(dir) {
		require('../lib/cmd_preview.js')(dir);
	});

//build命令
program
	.command('build [dir]')
	.description('生成整站静态html')
	.option('-o, --output <dir>', '生成的静态html存放目录')
	.action(function(dir, options) {
		require('../lib/cmd_build.js')(dir, options);
	});


program.parse(process.argv);