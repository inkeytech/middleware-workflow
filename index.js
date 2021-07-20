//Includes------------------------------------------------------------------------------------------------------
var _ = require('lodash');
var async = require('async');
var pjson = require('./package.json');
// --------------------------------------------------------------------------------------------------

var glOptions;
const defDefshema = {
	user: {},
	parameter: {},
	object: {},
	objectSet: {},
	message: {},
	messageSets: {},
	record: {},
	recordSet: {},
	lookup: {},
	binary: {},
	spreadsheet: {}
};


var fnTriggerValidator = function(triggerData, next, exit){
	try {
		if (triggerData.apikey){
			exit('NO API KEY IN TRIGGER DATA'); //GRACEFUL EXIT PAYLOAD
		}
		next(); // NO PAYLOAD SHOULD BE PROVIDED OR PROCESSED BY HANDLER
	} catch(err){
		exit(err); //error Exit
	}
};

var fnTriggerActor = function(triggerData, meta, next){
	try {
		meta.input.parameters.ruler = 'Ian the Fucking Great';
		next('TRIGGER DATA PROCESSED'); //PAYLOAD SUGGESTED BUT OPTIONAL
	} catch(err){
		next(err); //ERROR PAYLOAD
	}
};

var triggerAction = {validator: fnTriggerValidator, actor: fnTriggerActor};

var fnValidator = function(meta, next, exit){
	try {
		if (meta.user.userId){
			exit('USER NOT AUTHENTICATED');
		}
		next();
	} catch(err){
		exit(err);
	}
};

var fnActor= function(meta, next, exit){
	try {
		if (!meta.user.userid){
			exit('NOT AUTHENTICATED');
		}
		meta.user = 
		
		next('USER DATA SET');
	} catch(err){
		exit(err);
	}
};

var setUserAction = {validator: fnValidator, actor: fnActor};



module.exports = function(schema = defDefshema, fnTriggerMapper, moduleOptions){
	var defOptions = {};
	glOptions = _.extend(defOptions, moduleOptions);
	glOptions.schema = schema;
	glOptions.fnTriggerMapper = fnTriggerMapper;
	
	
	var module = {
		run: fnMiddleware,
		version: fnGetVersion
	};
	
	return module;
};


// ------------------------     BASE FUNCTIONS ------------------------------------


function fnMiddleware(triggerObject, arActions){
	var ctx = {
		meta: glOptions.schema,
		outputs: []
	};
	
		var arPrmFunctions = [];
	arActions.forEach(function(oAction){
		arPrmFunctions.push(wrapValidator(oAction.validator));
		arPrmFunctions.push(wrapActor(oAction.actor));
	});
	
	
	processTriggerAction(triggerObject, glOptions.triggerAction)
	.then(function(meta){
		ctx.meta = meta;
		return new Promise(function(fulfill, reject){
			async.reduce(arPrmFunctions, ctx.meta, function(meta, item, callback){
				item(meta)
				.then(function(meta){
					callback(null, meta);
				})
				.catch(function(err){
					callback(err);
				});
			}, function(err, result){
				if (err){
					reject(err);
				}
				fulfill(result);
			});
		});
	});


	function processTriggerAction(triggerObject, triggerAction){
		var fnPrmTriggerValidator = wrapTriggerValidator(triggerObject, triggerAction.validator);
		var fnPrmTriggerActor = wrapTriggerActor(triggerObject, triggerAction.actor);
		return new Promise(function(fulfill, reject){
			fnPrmTriggerValidator
			.then(function(validatorResult){
				fnPrmTriggerActor
				.then(function(meta){
					fulfill(meta);
				})
				.catch(function(err){
					reject(err);
				});
			})
			.catch(function(err){
				reject(err);
			});
		});
	}

	function wrapTriggerValidator(triggerObject, fnIn){
		return function(meta){
			return new Promise(function(fulfill, reject){
				function fnNext(err){
					if (err){
						reject(err);
					}
					fulfill(meta);
				}
				
				try {
					fnIn(triggerObject, meta, fnNext);
				} catch(err){
					reject(err);
				}
			}); 
		}; 
	}
	
	function wrapTriggerActor(triggerObject, fnIn){
		return function(meta){
			return new Promise(function(fulfill, reject){
				function fnNext(err){
					if (err){
						reject(err);
					}
					fulfill(meta);
				}
				
				try {
					fnIn(triggerObject, meta, fnNext);
				} catch(err){
					reject(err);
				}
			}); 
		}; 
	}
	
	function wrapValidator(fnIn){
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
			}); 
		}; 
	}
	
	
	function wrapActor(fnIn){
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
			}); 
		}; 
	}
	
	
}


function fnGetVersion(){
	return pjson.version;
}

// function isObject(a){
// 	return (!!a) && (a.constructor === Object);
// }