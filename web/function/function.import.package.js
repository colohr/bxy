(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.import.export',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.import.export')?_.get('function.import.export'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const {dot,http,wait} = window.modules
	//exports
	return import_package

	//scope actions
	function define_module(item){
		const define = dot.get(item, 'mode.define')
		if(define && 'node_modules' in item) window.modules.set(item.name, Object.defineProperties(window.modules.get(item.name)||{}, item.node_modules.reduce(reduce, {})))
		if(item.defined !== true) item.defined = define === false || window.modules.has(item.name)
		return item = null
	}

	function define_module_alias(item, dependency){ Object.defineProperties(window.modules, [{notation: item.name, variable: dependency.variable}].reduce(reduce, {})) }

	async function import_package(...x){
		const name = x.filter(window.modules.is.text)[0]
		let item = get_module(name)
		if(item === null) item = await load_module(name)
		if(item === null) item = get_module(name)
		return item !== null ? item:await http.assets(http.locator.unpack(name, ...x))
	}

	function get_module(name){ return window.modules.has(name) ? window.modules.get(name):null }

	async function load_dependency(dependency){
		try{ return await http.assets(dependency.locator).then(on_load).then(on_module) }
		catch(error){ console.trace(error)}
		return null
		//scope actions
		function on_load(){ return dependency.wait ? wait(...dependency.wait):true }
		function on_module(){ return dependency.notation?window.modules.set(dependency.notation, dot.get(window, dependency.variable)):dot.get(window, dependency.variable) }
	}

	async function load_es_dependency(dependency){
		try{ return await import(dependency.locator).then(on_module) }
		catch(error){ console.trace(error)}
		return null

		//scope actions
		function on_module(definition){ return dependency.notation ? window.modules.set(dependency.notation, definition):definition }
	}

	async function load_module(name){
		const internal = await window.modules.import.internal()
		let item = internal.module(name)
		if(item){
			name = item.name
			if(item.defined !== true && dot.has(item,'mode.entry') && dot.get(item, 'mode.entry').loaded !== true){
				dot.get(item, 'mode.entry').loaded = await (dot.get(item, 'mode.entry').es ? load_es_dependency(dot.get(item, 'mode.entry')):load_dependency(dot.get(item, 'mode.entry'))) !== null
			}
			if(item.defined !== true && 'node_modules' in item){
				for(const dependency of item.node_modules){
					if(dependency.loaded !== true) dependency.loaded =  await (dependency.es ? load_es_dependency(dependency):load_dependency(dependency)) !== null
					if(dependency.alias) define_module_alias(item, dependency)
				}
				define_module(item)
			}
			return (item = null, window.modules.get(name))
		}
		return null
	}

	function reduce(){ return (arguments[0][arguments[1].notation] = eval(`({get(){ return window.modules.dot.get(window,"${arguments[1].variable}") }})`), arguments[0]) }

})


