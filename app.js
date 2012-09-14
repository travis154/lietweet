
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

var s = db.model('tweets', new mongoose.Schema({tweet:{}}));

xx=null;


var app = module.exports = express.createServer();
var io = require('socket.io').listen(app,{log:false});
// Configuration
io.sockets.on('connection', function (socket) {
  xx = io.sockets;
  //console.log(a);
io.sockets.emit('news',{a:1});
});

//console.log(_.methods(twit));

twit.stream('user', {track:'epicloser'}, function(stream) {
    stream.on('data', function(data) {
	var twt = new s({tweet:data});
	twt.save();
    	if(xx)xx.emit('news', data); //else console.log(xx);
        //console.log(JSON.stringify(data).replace(/\n/g,''));
	//console.log(data);
        //console.log(data.friends.length);
        if(data.user){
        	var a = String(data.text);
        	var b = a.match(/(^|\s)@(\w+)/g);
        	var tweet;
        	if(b){
        		b.forEach(function(x){
        			var n = tweet ? tweet : a;
        			tweet = new String(n.replace(new RegExp(x,"g"),x.trim() == "@epicloser" ? x.red.bold : x.green.bold));
        		});
        		
        	}else
        		tweet = String(data.text);
        //	console.log(String(data.user.screen_name).green.bold + " " +tweet);
        }
        
        //var tw = new tweet({tweet:data});
        //tw.save(function(){ });
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

app.get('/', routes.index);
app.get('/retweet/:id',function(req,res){
	twit.retweetStatus(req.params.id,function(x){});
	res.end();
});
app.get('/favorite/:id',function(req,res){
	twit.createFavorite(req.params.id,function(x){});
	res.end();
});

app.post("/tweet",function(req,res){
	twit.updateStatus(req.body.tweet,function(){});
	res.end();
});

app.listen(3003, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
