(function(xd){
window.xd = xd;
xd.core = function(){
	var _hashPairDelim = '|=|', _hashValDelim = '|&|',
	
	hashPairDelim = function(key){
		if(key!=undefined){
			_hashPairDelim = key;
		}
		return _hashPairDelim;
	},
	hashValDelim = function(key){
		if(key!=undefined){
			_hashValDelim = key;
		}
		return _hashValDelim;
	},
	getHash = function(){
		var pathname = document.URL;
		var hashIndex = pathname.indexOf('#');
		if(hashIndex > 0) {
			return pathname.substring(hashIndex + 1);
		}
		return false;
	},
	getHashVar = function(){
		var vars,
		getVar  = function(key){
			if(!key){return getVars();}
			return getVars()[key];
		},
		getVars = function(){
			if(vars){return vars;}
			vars = {};
			var hashes;
			if(!!(hashes = getHash())) {
				var hash;
				hashes = hashes.split(hashValDelim());
				for(var i=hashes.length;i--;){
					hash = hashes[i].split(hashPairDelim());
					vars[hash[0]] = hash[1];
				}	
			}	
			return vars;
		};
		return getVar;
	}();
	return {
		getHashVar:getHashVar,hashPairDelim:hashPairDelim,hashValDelim:hashValDelim
	}
}();
})(window.xd||{})