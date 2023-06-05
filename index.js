//Includes------------------------------------------------------------------------------------------------------
var _ = require('lodash');
var async = require('async');
var pjson = require('./package.json');
// --------------------------------------------------------------------------------------------------

var glOptions;
const defDefshema = {
	// user: {},
	parameter: {},
	// object: {},
	// objectSet: {},
	// message: {},
	// messageSets: {},
	// record: {},
	// recordSet: {},
	// lookup: {},
	// binary: {},
	// spreadsheet: {}
};

// Private Example
function fnConditional(parameter, next, exit){
	try {
		if (!parameter.zipFile){
			next('STEP SKIPPED: parameter.zipFile=' + parameter.zipFile);
		}
		if (!parameter.outputFormat){
			next('STEP SKIPPED: parameter.outputFormat=' + parameter.zipFile);
		}
		next(); // NO MESSAGE PAYLOAD SHOULD BE PROVIDED OR PROCESSED BY HANDLER FOR "TRUE" RESULT
	} catch(err){
		exit(err);
	}
}

// Private Example
function fnTransformer(parameter, next, exit){
	try {
		parameter.localStartDate = parameter.startDate.substr(0, 6);
		next('Transformation done');
	} catch(err){
		exit(err);
	}
	return fnConditional;
}

// ------------------------------------------------------------


// Private


// public


		

// private
function buildValidator(entrypoint, meta, message, fnLogic){
	//ian make something to build these functions
	var fnSuccess = function(meta, next, exit){
		next('somehow in a successful way');
	};
	var fnFail = function(meta, next, exit){
		exit(message);
	};
	if (fnLogic(returnMetaComponent(entrypoint, meta))){
		return fnFail;
	} else {
		return fnSuccess;
	}
}

//private
function buildActor(entrypoint, message){
	return function(meta, next, exit){
		
	};
	
}

// public
function wrapMetaFunction(entrypoint, fnLogic){
	return function(meta, next, exit){
		var metaComponent = returnMetaComponent(entrypoint, meta) //IW MUST FLESH THIS OUT TO USE A DEFAULT PATH IF NONE IS SUPPLIED
		return fnLogic(metaComponent, next, exit);
	};
}// public

function wrapFnAssert(entrypoint, fnLogic){
	return function(meta, next, exit){
		var metaComponent = returnMetaComponent(entrypoint, meta) //IW MUST FLESH THIS OUT TO USE A DEFAULT PATH IF NONE IS SUPPLIED
		return fnLogic(metaComponent, next, exit);
	};
}

// //Public
// function wrapConditional(entrypoint, fnConditionalLogic){
// 	return function(meta, next, exit){
// 		var metaComponent = returnMetaComponent(entrypoint, meta) //IW MUST FLESH THIS OUT TO USE A DEFAULT PATH IF NONE IS SUPPLIED
// 		return fnConditionalLogic(metaComponent, next, exit);
// 	};
// }

// // public
// function wrapValidator(entrypoint, fnTransformLogic){
// 	return function(meta, next, exit){
// 		var metaComponent = returnMetaComponent(entrypoint, meta) //IW MUST FLESH THIS OUT TO USE A DEFAULT PATH IF NONE IS SUPPLIED
// 		return fnTransformLogic(metaComponent, next, exit);
// 	};
// }

// // public
// function wrapTransformer(entrypoint, fnTransformLogic){
// 	return function(meta, next, exit){
// 		var metaComponent = returnMetaComponent(entrypoint, meta) //IW MUST FLESH THIS OUT TO USE A DEFAULT PATH IF NONE IS SUPPLIED
// 		return fnTransformLogic(metaComponent, next, exit);
// 	};
// }

//public 

// Work here tomorrow



//public



//public
function packAction(entrypoint, actionName, fnValidator, fnActor){
	var wrappedValidator = wrapMetaFunction(entrypoint, fnValidator);
	var wrappedActor = wrapMetaFunction(entrypoint, fnActor);
	var action = {name: actionName, validator: wrappedValidator, actor: wrappedActor};
	return action;
}







// Public
function buildTransformAction(entrypoint, actionName, arValidationRules, arTransformRules){
	var fnValidator = buildValidator(entrypoint, arValidationRules);
	var fnActor = buildRulesTransformer(entrypoint, arTransformRules);
	return packAction(entrypoint, actionName, fnValidator, fnActor);
}



//public
function buildValidatorWithRules(entryPoint, arValidationRules){
	//do logic on arValidationRules to build resulting function
	
	function fnValidator(meta, next, exit){
		try {
			if (meta.user.userId){
				exit('USER NOT AUTHENTICATED');
			}
			next(); // NO MESSAGE PAYLOAD SHOULD BE PROVIDED OR PROCESSED BY HANDLER
		} catch(err){
			exit(err);
		}
	}
	return fnValidator;
}





//public
function buildRulesTransformerActor(entrypoint, arTransformRules){
	function fnActor(meta, next, exit){
		try {
			
			//BUILD FUNCTION BASED ON ENTRYPOINT AND RULES PROVIDED
			//it will return a fnTransformer
			var fnTransformer = function(meta, next, exit){
				
				next('Transformation done');
			}
			
			var fnWrappedTransformer = wrapMetaFunction(entrypoint, fnTransformer);
			
			
			meta.user = {firstName: 'Ian'};
			
			
			
			next('USER DATA SET');
		} catch(err){
			exit(err);
		}
	}
	return fnActor;
}







function buildTransformTriggerAction(arValidationRules, arTransformRules){
	var fnTriggerValidator = function(triggerData, next, exit){
		try {
			if (triggerData.apikey){
				exit('NO API KEY IN TRIGGER DATA'); //GRACEFUL EXIT PAYLOAD
			}
			next(); // NO MESSAGE PAYLOAD SHOULD BE PROVIDED OR PROCESSED BY HANDLER
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
	return triggerAction;
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


function fnMiddleware(triggerObject, arActions, arReusables = []){
	
	
	var ctx = {
		meta: glOptions.schema,
		reusables: {},
		outputs: []
	};
	
	//eg.
	// arReusables = [['sql', 'winsms4', sqlWinSms4], ['sql', 'winsmsint', sqlWinSmsInt], ['queue', 'sendSMS', tQueueSender]];
	arReusables.forEach(function(arReusable){
		ctx['reusables'][arReusable[0]][arReusable[1]] = arReusable[2];
	});
	
	
	var arPrmFunctions = [];
	arActions.forEach(function(oAction){
		arPrmFunctions.push(wrapValidator(oAction.validator));
		arPrmFunctions.push(wrapActor(oAction.actor));
	});
	
	//private
	function addOutput(output){
		ctx.outputs.push(output);
	};
	
	
	
	processTriggerAction(triggerObject, glOptions.triggerAction)
	.then(function(meta){
		// THIS IS THE META I NEED FOR PRIVATE FUNCTIONS
		
		function getMetaComponent(entryPoint){
			//IW - 2021-07-03 - STUB - User JmesPath to return correct bit of meta
			return meta.parameter;
		}
		
		var pFn = {};
		pFn.getMetaComponent = getMetaComponent;
		
		
		meta.function = pFn;
		ctx.meta = meta;
		return new Promise(function(fulfill, reject){
			function buildDone(message){
				if (message){
					addOutput('done', message);
				}
				fulfill();
			}
			
			// private
			function buildError(err){
				reject(err);
			}
			
			// private
			function buildFailer(message = 'User not populated'){
				addOutput('fail', message);
				reject();
			}
			
			// public
			function buildExiter(message = 'parameters.zipFile is not true'){
				addOutput('exit', message);
				fulfill();
			}
			
			function conditionExiter(entrypoint, fnAssert, message = 'User Id Not set - cannot run this process'){
				try {
					if (fnAssert(pFn.getMetaComponent(entrypoint))){
						return buildDone();
					} else {
						return buildExiter(message);
					}
				} catch(err){
					return buildError(err);
				}
			}
			
			function conditionFailer(entrypoint, fnAssert, message = 'User Id Not set - cannot run this process'){
				try {
					if (fnAssert(pFn.getMetaComponent(entrypoint))){
						return buildDone();
					} else {
						return buildFailer(message);
					}
				} catch(err){
					return buildError(err);
				}
			}
			
			
			
			
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

	
	//private
	
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