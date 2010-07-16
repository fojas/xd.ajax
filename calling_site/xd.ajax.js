(function(xd){
	window.xd = xd;
	
	xd._ajaxConf = {};
	
	xd.configure = function(host,key,value){
		if(key){
			if(key.constructor === String){
				if(value!=undefined){
					xd._ajaxConf[host][key] = value;
				}
				return xd._ajaxConf[host][key];
			} else {
				xd._ajaxConf[host] = key;
			}
		} else {
			if(host.constructor === String){
				return xd._ajaxConf[host];
			}
			xd._ajaxConf = host;
			return;
		}
		return xd._ajaxConf[host];
	};
	
	xd.getHost = function(url){
		var re = new RegExp('^((?:f|ht)tp(?:s)?\://(?:[^/]+))', 'im');
		return url.match(re)[1].toString();
	};
	
	xd.ajax = function(args){
		var frame = xd.createIframe(),
			callback = 'cb_'+frame.frameId,
			url = args.url,
			host = xd.getHost(url),
			conf = xd.configure(host),
			scope = args.scope || window,
			success = args.success,
			failure = args.error,
			type = args.type || conf.type || 'GET',
			sender = args.sender || conf.sender,
			receiver = args.receiver || conf.receiver,
			data = args.data,
			kpDelim = xd.core.hashPairDelim()
			valDelim = xd.core.hashValDelim();
		if(!/^http/i.test(receiver)){
			receiver = xd.getHost(document.location.toString())+receiver;
		}
		try{
			if(data != null && typeof data != 'string'){
				data = Object.toJSON? Object.toJSON(data) :  JSON.stringify(data);
			}
		}catch(e){}
		var garbageCollect = function(){
			frame.kill();
			window[callback] = undefined;
			try{delete window[callback];}catch(e){}
		}
		
		window[callback] = {};
		
		if(typeof success === 'function'){
			window[callback]["success"] = function(data){
				success.apply(scope,[xd.parseData(data)]);
				garbageCollect();
			};
		}
		
		if(typeof failure === 'function'){
			window[callback]["failure"] = function(data){
				failure.apply(scope,[xd.parseData(data)]);
				garbageCollect();
			};
		}
		var fsrc = [
			sender, 
			'#receiver',kpDelim,receiver,
			valDelim,'type',kpDelim,type,
			valDelim,'cbFunc',kpDelim,callback,
			valDelim,'url',kpDelim,url,
			valDelim,'data',kpDelim,(data || '')
		].join('');
		frame.getFrame().src = fsrc;
	};
	
	xd.parseData = function(data){
		try{data = (typeof JSON !== 'undefined')? JSON.parse(data) : window.eval('('+data+')');}catch(e){};
		return data;
	};
	
	xd.createIframe = function(){
		return new xdFrame();
	};
	
	var xdFrame = function(){
		var e = document.createElement('div');
		this.frameId = 'xd_frame_'+(new Date).getTime()+Math.floor(Math.random()*1001);
		e.innerHTML =  '<iframe id="'+this.frameId+'" style="display:none;"></iframe>';
		document.body.appendChild(e.firstChild);
		this.frameEl = document.getElementById(this.frameId);
		return this;
	};
	
	xdFrame.prototype = {
		getFrame : function(){
			return this.frameEl;
		},
		kill : function(){
			//this.frameEl.parentNode.removeChild(document.getElementById(this.frameId));
		}
	};
	
})(window.xd||{});

// everything below here is optional
if(window.jQuery && window.xd){
jQuery.ajax = (function(_ajax,_xdajax){
	
	var isExternal = function(){
		var protocol = location.protocol,
				hostname = location.hostname,
				exRegex = RegExp('^'+protocol + '//' + hostname);

		var _isExternal = function(url) {
			return !exRegex.test(url) && /^https?:\/\//.test(url);
		};

		return _isExternal;
	}();

	return function(opts){
		if(/callback=\?/.test(opts.url)){
			opts.dataType = 'json';
		}
		if(!opts.type) {opts.type = 'GET';}
		if((!/get/i.test(opts.type) || !/json|script/i.test(opts.dataType)) && isExternal(opts.url)){
			return _xdajax.apply(this,arguments);
		}
		return _ajax.apply(this,arguments);
	};
})(jQuery.ajax,xd.ajax);
}

(function(){
	// initializer will take data between open/close script tags and initialize
	// js client with it.
	var xd_script = document.getElementsByTagName('script');
	xd_script = xd_script[xd_script.length-1];
	// src.match required to protect against deferred or dom injected script loads
	if(xd_script.innerHTML.length && xd_script.src.match(/xd\.ajax\.js/)){
		var text = xd_script.innerHTML;
		try{xd_data = JSON.parse(text);}catch(e){xd_data = window["eval"]("("+text+")");};
		xd.configure(xd_data);
	}
})();
