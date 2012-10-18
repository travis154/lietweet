
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
colors = require('./colors.js');
var util = require('util'),
    twitter = require('twitter');
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

twit.stream('user', {track:'epicloser'}, function(stream) {
	stream.on('data', function(data) {
		var twt = new s({tweet:data});
		//twt.save();
		if(xx)xx.emit('news', data);
		if(data.user){
			var fb_tweet;
			if(typeof data.retweeted_status == 'object'){
				fb_tweet = "@" + data.retweeted_status.user.screen_name + " – " + data.retweeted_status.text;
			}else{
				fb_tweet = "@" + data.user.screen_name + " – " + data.text;
			}
			var pics = '';
			if(data.entities.media){
				_.each(data.entities.media,function(e){ 
					if(e.type == "photo") {
						var img = extract(e.media_url).get().render().replace('http','https');
						if(img) postFB(img, fb_tweet);
					}
				});
			}else if(data.entities.urls){
				_.each(data.entities.urls,function(e){ 
					if(e.expanded_url){  
						var img = extract(e.expanded_url).get().render();
						if(img) postFB(img, fb_tweet);
					} 
				});
			}
		}
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
			}else if(i.host() == "p.twimg.com"){
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
