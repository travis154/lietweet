var socket = io.connect('http://'+window.location.hostname + ":3003");
socket.on('news', function (data) {
	console.log(data);
	if(data.user){
		var a = String(data.text);
		_.each(data.entities.urls,function(i){a =  a.replace(i.url,"<a href='"+i.expanded_url+"'>"+i.expanded_url+"</a>"); console.log("<a href='"+i.expanded_url+"'>"+i.expanded_url+"</a>") });
		var b = a.match(/(^|\s)@(\w+)/g);
		var tweet;
		if(b){
			b.forEach(function(x){
				var n = tweet ? tweet : a;
				tweet = new String(n.replace(new RegExp(x,"g"),x.trim() == "@epicloser" ?"<span style='color:red;font-weight:bold'>"+x+"</span>" : "<span style='color:greenYellow;font-weight:bold'>"+x+"</span>"));
			});
	
		}else
			tweet = String(data.text);
		var pics = '';
		if(data.entities.media){
			pics = _.map(data.entities.media,function(e){ if(e.type == "photo") return extract(e.media_url).get().render();}).join('');
		}else if(data.entities.urls){
			
			pics = _.map(data.entities.urls,function(e){ 
				if(e.expanded_url){  
					return extract(e.expanded_url).get().render();
				} 
			}).join('');
		}
		var a = $("<section class='tweet' style='display:none' data-id='"+data.id_str+"'>"+"<span style='color:greenYellow;font-weight:bold'>"+data.user.screen_name+"</span> " +tweet+" <a class='panel retweet'>RT</a> <a class='panel favorite'>FV</a>"+pics+"</section>");
		$("body").prepend(a);
		a.fadeIn();
	}
});
//new extract("http://i.imgur.com/xBGpM.jpg").get().render()
var extract = function(url){
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
			return "undefined" !== typeof this.extracted ? '<img src="' + this.extracted +'" />' : '';
		}
	}
}

var conv = function(text){
	var ascii = { 'h' : '1920', 'S' : '1921', 'n' : '1922', 'r' : '1923', 'b' : '1924', 'L' : '1925', 'k' : '1926', 'a' : '1927', 'v' : '1928', 'm' : '1929', 'f' : '1930', 'd' : '1931', 't' : '1932', 'l' : '1933', 'g' : '1934', 'N' : '1935', 's' : '1936', 'D' : '1937', 'z' : '1938', 'T' : '1939', 'y' : '1940', 'p' : '1941', 'j' : '1942', 'C' : '1943', 'X' : '1944', 'H' : '1945', 'K' : '1946', 'J' : '1947', 'R' : '1948', 'x' : '1949', 'B' : '1950', 'F' : '1951', 'Y' : '1952', 'Z' : '1953', 'A' : '1954', 'G' : '1955', 'q' : '1956', 'V' : '1957', 'w' : '1958', 'W' : '1959', 'i' : '1960', 'I' : '1961', 'u' : '1962', 'U' : '1963', 'e' : '1964', 'E' : '1965', 'o' : '1966', 'O' : '1967', 'c' : '1968', ',' : '1548', ';' : '1563', '?' : '1567', ')' : '0041', '(' : '0040', 'Q' : '65010'};
}

/*
extract.prototype = {
	get : function(){
		var i = URI(this.img);
		if(i.host() == "i.imgur.com" && i.suffix().search(/jpg|png|gif/) != -1){
			this.extracted = img;
			return this;
		}
	},
	render : function(){
		return '<img src="' + this.extracted +'" />';
	}
}
*/
$(function(){
	$('body').append('<section style="display:none;background-color: rgba(0, 0, 0, 0.597656); position: fixed; top: 250px; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; box-shadow: 0px 0px 33px white;border-radius: 7px;left: 50%;"><input type="text" id="status" style="padding: 10px;font-size: 16px;background: #f0f0f0;border: none;background: #1e5799;   background: -webkit-linear-gradient(top, rgba(30, 87, 153, .6) 0%,rgba(41, 137, 216, .6) 50%,rgba(32, 124, 202, .9) 100%);   color : white;.;text-shadow: 1px 1px black;font-weight: bold;min-width: 500px;" placeholder="tweet"></section>');
	$('body').keydown(function(e){ 
		var n = $("#status").parent(), t = $("#status"); 
		var view = n.css("display"); 
		if(e.keyCode == 13){
			if(view == 'none'){
				n.fadeIn();
				t.focus();
			}else{
				if(t.val().length > 0 ){
					$.post("/tweet",{tweet:t.val()});
					t.val('');
				}
			}
		}
		if(e.keyCode == 27){
			n.fadeOut();
			t.val('');
		}
	});
	$(".retweet").live('click',function(){
		$.get("/retweet/" + $(this).parent().attr("data-id"));
		$(this).css("visibility","visible");
		//TODO: fadeout if cancelled
	});
	$(".favorite").live('click',function(){
		$.get("/favorite/" + $(this).parent().attr("data-id"));
		$(this).css("visibility","visible");
		//TODO: fadeout if cancelled
	});
});
