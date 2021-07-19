//Includes------------------------------------------------------------------------------------------------------
// var extend = require('extend');
var _ = require('lodash');
// var moment = require('moment-timezone');
var async = require('async');
// const axios = require('axios');
// const url = require('url');
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



var fnMutate3 = function(meta, next){
	try {
		meta.input.parameters.ruler = 'Ian the Fucking Great';
		next();
	} catch(err){
		next(err);
	}
};

var triggerFunction = function(triggerData, meta, next){
	try {
		meta.input.parameters.ruler = 'Ian the Fucking Great';
		next();
	} catch(err){
		next(err);
	}
}



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


function fnMiddleware(triggerObject, arMiddleware){
	var ctx = {
		meta: glOptions.schema,
		outputs: []
	};
	
	var fnPrmTrigger = wrapTriggerFunction(triggerObject, glOptions.fnTriggerMapper);
	var arPrmFunctions = [];
	arMiddleware.forEach(function(fnMiddleware){
		arPrmFunctions.push(wrapFunction(fnMiddleware));
	});
	
	
	fnPrmTrigger(triggerObject, ctx.meta)
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
			}); 
		}; 
	}
	
	function wrapTriggerFunction(triggerObject, mapperFunction){
		return function(meta){
			return new Promise(function(fulfill, reject){
				function fnNext(err){
					if (err){
						reject(err);
					}
					fulfill(meta);
				}
				try {
					mapperFunction(triggerObject, meta, fnNext);
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