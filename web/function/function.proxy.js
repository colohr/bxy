(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.proxy',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.proxy')?_.get('function.proxy'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function module_definition(){
	const proxy_handler = {apply: proxy_apply, construct: proxy_construct, get: proxy_get}
	const proxy_field = Symbol.for('proxy')
	//exports
	return proxy_promise

	//scope actions
	function get(target, property, receiver){
		const value = typeof target === 'object' ? Reflect.get(target, property, receiver):target[property]
		if(typeof value === 'function' && typeof value.bind === 'function'){
			return Object.assign(value.bind(target), value)
		}
		return value
	}

	function proxy_apply(target, this_reference, arguments_reference){
		if(target[proxy_field]) target = target()
		if(typeof target.then === 'function'){
			return proxy_promise(target.then(value=>Reflect.apply(value, this_reference, arguments_reference)))
		}
		return proxy_promise(Reflect.apply(target, this_reference, arguments_reference))
	}

	function proxy_construct(target, argumentsList){
		if(target[proxy_field]) target = target()
		return proxy_promise(Reflect.construct(target, argumentsList))
	}

	function proxy_get(target, property, receiver){
		if(target[proxy_field]) target = target()
		if(property !== 'then' && property !== 'catch' && typeof target.then === 'function'){
			return proxy_promise(target.then(value=>get(value, property, receiver)))
		}
		return proxy_promise(get(target, property, receiver))
	}

	function proxy_promise(target){
		if(typeof target === 'object'){
			const proxy = ()=>target
			proxy[proxy_field] = true
			return new Proxy(proxy, proxy_handler)
		}
		return typeof target === 'function' ? new Proxy(target, proxy_handler):target
	}


})
/* https://github.com/kozhevnikov/proxymise/blob/master/README.md Lightweight ES6 Proxy for Promises with no additional dependencies. Allows for method and property chaining without need for intermediate then() or await for cleaner and simpler code.*/
/*	directory: / | file: Proxy.js | module: Proxy | type: Proxy | tag: proxy | field: proxy*/



