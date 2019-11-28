void function window_prototype(){ return 'prototyped' in Window ? null:arguments[0].apply(this, Array.from(arguments).slice(1,arguments.length));
}(function WindowPrototype(){
	Window.prototyped = Symbol('modules.prototype')
	//exports
	void static(arguments[0], {define, direct, join, static, superset, supertype})

	//global actions
	function define(object, definitions, statements = {configurable: true, enumerable: true}){
		return Object.defineProperties(arguments[0], Object.entries(arguments[1]).reduce(reduce, {}))
		//scope actions
		function reduce(properties, [field, value]){ return Object.assign(properties, {[field]: join(statements, {value})}) }
	}

	function direct(target, directives, statements = {configurable: true, enumerable: true}){
		return Object.defineProperties(arguments[0], Object.entries(directives).reduce(reduce, {}))
		//scope actions
		function reduce(properties, entry){ return Object.assign(properties, {[entry[0]]: join(statements, (typeof (entry[1]) === 'function' ? {get: entry[1]}:entry[1]))}) }
	}

	function join(...assets){ return Object.assign({}, ...assets.map(object=>({...object}))) }

	function static(object, statics, statements = {configurable: false, enumerable: false, writable: false}){
		return Object.defineProperties(object, Object.entries(statics).reduce(reduce, {}))
		//scope actions
		function reduce(properties, [field, value]){ return Object.assign(properties, {[field]: join(statements, {value})}) }
	}

	function superset(){ return (define(arguments[0].prototype, arguments[1], {configurable: false, enumerable: false, writable: false}), arguments[0]) }

	function supertype(){ return (direct(arguments[0].prototype, arguments[1], {configurable: false, enumerable: false}), arguments[0]) }


}, this)
/*	file: Window.prototype.js | module: Window.prototype | type: WindowPrototype | tag: window-prototype | field: window_prototype - created: 2019-11-09T05:25:26.442-0600*/


