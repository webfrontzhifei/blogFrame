var path = require('path');
var fs = require('fs');
var MarkdownIt = require('markdown-it');
var ejs = require('ejs');
var rd = require('rd');

var md = new MarkdownIt({
	html: true,
	langPrefix: 'code-'
});

	//去掉文件的扩展名
	function stripExtname( name) {
		var i = 0 - path.extname(name).length;
		if(i==0) {
			i = name.length;
		}
		return name.slice(0, i);
	}

	//将markdown转换为html
	function markdownToHTML( content) {
		return md.render(content || '');
	}

	//解析文章内容
	function parseSourceContent( data) {
		var split = '---';
		var i = data.indexOf(split);
		var info = {};
		if(i != -1) {
			
			var j = data.indexOf(split, i+split.length);
			if(j != -1) {

				var str = data.slice(i + split.length, j).trim();
				data = data.slice(j+split.length);
				str.split(/[\r]\n/).forEach(function( line) {
					var item = line.split(':');
					var name = item[0];
					var value = item[1];
					info[name] = value;
				});
			}
		}

		info.source = data;
		return info;
	}

	//渲染模板
	function renderFile( file, data) {
		return ejs.render(fs.readFileSync(file).toString(), data, {
			filename: file
		});
	}

	//遍历所有文章
	function eachSourceFile(sourceDir, callback) {
		rd.eachFileFilterSync(sourceDir, /\.md$/, callback);
	}

	//渲染文章
	function renderPost( dir, file) {
		var content = fs.readFileSync(file).toString();
		var post = parseSourceContent(content);
		post.content = markdownToHTML(post.source);
		post.layout = post.layout || 'post';
		var config = loadConfig(dir);
		var html = renderFile(path.resolve(dir, '_layout',post.layout+'.html'), {post:post, config:config});
		return html;
	}

	//渲染文章列表
	function renderIndex( dir) {
		var list = [];
		var sourceDir = path.resolve(dir, '_posts');
		eachSourceFile(sourceDir, function(f, s) {
			var source = fs.readFileSync(f).toString();
			var post = parseSourceContent(source);
			post.timestamp = new Date(post.date);
			post.url = '/posts/'+stripExtname(f.slice(sourceDir.length+1))+'.html';
			list.push(post);
		});

		list.sort(function(a, b) {
			return b.timestamp - a.timestamp;
		});

		var config = loadConfig(dir);
		var html = renderFile(path.resolve(dir, '_layout','index.html'),{config: config, posts:list});
		return html;
	}

	//读取配置文件
	function loadConfig( dir) {
		var content = fs.readFileSync(path.resolve(dir, 'config.json')).toString();
		var data = JSON.parse(content);
		return data;
	}

	exports.renderPost = renderPost;
	exports.renderIndex = renderIndex;
	exports.stripExtname = stripExtname;
	exports.eachSourceFile = eachSourceFile;
	exports.loadConfig = loadConfig;