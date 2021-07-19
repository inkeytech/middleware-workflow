var fnMutate3 = function(meta, next){
	try {
		meta.input.parameters.ruler = 'Ian the Fucking Great';
		next();
	} catch(err){
		next(err);
	}
};

var wrapFnMutate3 = wrapFunction(fnMutate3);

function wrapFunction(fnIn){
	return function(meta){
		return new Promise(function(fulfill, reject){
			function fnNext(err){
				if (err){
					reject(err);
				}
				fulfill(meta);
			}
			
			try {
				fnIn(meta, fnNext);
			} catch(err){
				reject(err);
			}
		}); //end of promise
	}; //end of returned function
}