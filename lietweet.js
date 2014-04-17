/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
colors = require('./colors.js');
var util = require('util'),
    twitter = require('ntwitter');
var _ = require('underscore');
var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost','twitter');
var fb = require('fb');
var arg = require('optimist').argv;
var s = db.model('tweets', new mongoose.Schema({tweet:{}}));
var URI = require("URIjs");
//var settings = require('./settings.js');

xx=null;
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app,{log:false});
// Configuration
io.sockets.on('connection', function (socket) {
  xx = io.sockets;
  //console.log(a);
io.sockets.emit('news',{a:1});
});



var twit = new twitter({
    consumer_key: arg.ck,
    consumer_secret: arg.cs,
    access_token_key: arg.atk,
    access_token_secret: arg.ats
});



fb.setAccessToken(arg.fb);
twit.stream('statuses/filter',{track:'nodejs,node.js,javascript,maldives,mohamednasheed,ganjabo,haveeru,drwaheed,baaghee,baagee,golhaa,golhaabo,raaje,rajje,rajjey,rayyithun,gaumu','locations':'73.2,4,73.7,4.6,73,-0.7,73.4,-0.1,72.9,0.1,73.5,0.9,72.7,1.7,73.1,3.8,72.7,4.9,73.7,7.3'}, function(s){
	s.on('data', function(d){
		if(xx)xx.emit('news', d);
		if(arg.save){
			twt.save();
		}
	});
	s.on('error', console.log);
});

twit.stream('user', {track:'epicloser'}, function(stream) {
	stream.on('data', function(data) {
		var twt = new s({tweet:data});
		if(arg.save){
			twt.save();
		}
		if(xx)xx.emit('news', data);
	});
	stream.on('error', function(err){
		console.log(err)
	});
});
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

function postFB(url, msg){
	fb.api('3890078733770/photos', 'post', 
	{        
		url:url,
		message: msg,
	}
	, function(res){
		if(res.error){
			postFB(url,msg);
		}
	});
}

function extract(url){
	if("undefined" === typeof URI)
		throw "URI NOT FOUND";
	var url = url;
	return {
		get : function(){
			var i = URI(url);
			if(i.host() == "i.imgur.com" && i.suffix().search(/jpg|png|gif/) != -1){
				this.extracted = url;
				return this;
			}else if(i.host() == "instagr.am"){
				this.extracted = url + "media/?size=l";
				return this;
			}else if(i.host().indexOf("twimg.com") !== -1){
				this.extracted = url;
				return this;
			}else if(i.host() == "twitpic.com"){
				this.extracted = "http://twitpic.com/show/large"+i.path();
				return this;
			}else if(i.host() == "akamaihd.net" && i.suffix().search(/jpg|png|gif/) != -1){
				this.extracted = url;
				return this;
			}else{
				return this
			}
		},
		render : function(){
			return this.extracted;
		}
	}
}
app.get('/', routes.index);
app.get('/retweet/:id',function(req,res){
	twit.retweetStatus(req.params.id,function(x){});
	res.end();
});
app.get('/favorite/:id',function(req,res){
	twit.createFavorite(req.params.id,function(x){});
	res.end();
});
app.post('/facebook',function(req,res){
	var img = req.body.img;
	var message = unescape(req.body.message);
	fb.api('3890078733770/photos', 'post', 
	{        
		url:img,
		message: unescape(message),
	}
	, function(res){
		console.log(res);
	});
	res.end();
});
app.post("/tweet",function(req,res){
	twit.updateStatus(req.body.tweet,function(){});
	res.end();
});

app.listen(3003, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
