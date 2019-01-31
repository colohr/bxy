(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.import.internal', {value:await module(...inputs)}); return window.modules.has('function.import.internal')?window.modules.get('function.import.internal'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(AnnotatedData){
	const internal_modules = Symbol('AnnotatedData for internal modules with package-lock.json')
	//export
	return import_internal

	//scope actions
	function get_module(name){
		let item = null
		if(this.has(`modules.${name}.name`)) item = this.get(`modules.${name}`)
		if(this.has(`modules.${name}`)) item = (this.set(`modules.${name}.name`, name), this.get(`modules.${name}`))
		if(!item) for(const field in this.get('modules')){
			item = this.find(`modules.${field}.node_modules`, {name})
			if(!item) item = this.find(`modules.${field}.node_modules`, {notation: name})
			if(item) break
		}
		return item ? ensure_item.call(this):null
		//scope actions
		function ensure_item(){
			const dependencies = []
			if(window.modules.dot.has(item,'mode.entry')) dependencies.push(item.mode.entry)
			if('node_modules' in item) dependencies.push(...item.node_modules)
			if(dependencies.length){
				for(const dependency of dependencies){
					if(!dependency.variable) dependency.variable = ['modules',dependency.notation || dependency.name].join('.')
					if(!dependency.loaded){
						if(window.modules.dot.get(item,'mode.alias')===dependency.name) dependency.alias = true
						dependency.locator = this.locator(dependency)
						if(dependency.notation) dependency.loaded = window.modules.has(dependency.notation)
						if(!dependency.loaded) dependency.loaded = window.modules.dot.get(window, dependency.variable)
					}
				}
			}
			return item
		}
	}

	function get_module_dependency(name){
		for(const field in this.modules){
			const item = this.module(field)
			if(item && item.node_modules){
				for(const dependency of item.node_modules){
					if(dependency.name === name) return dependency
					else if(dependency.notation === name) return dependency
					else if(dependency.variable === name) return dependency
				}
			}
		}
		return null
	}

	async function import_internal(){
		if(internal_modules in window.modules) return window.modules[internal_modules]
		const external = window.modules.http.locator.external()
		if(external === false && window.modules.has('@package.lock') === false) await load_package_lock()

		window.modules[internal_modules] = new AnnotatedData(get_package_json())
		window.modules[internal_modules].external = external
		window.modules[internal_modules].is = get_is(window.modules[internal_modules])
		window.modules[internal_modules].locator = get_locator
		window.modules[internal_modules].module = get_module
		window.modules[internal_modules].dependency = get_module_dependency
		window.modules[internal_modules].requires = window.modules.get('@package.lock.requires') === true
		return window.modules[internal_modules]
	}

	function get_is(internal){
		const defined = is_defined
		defined.alias = is_defined_alias
		return {
			alias: is_alias,
			defined
		}
		//scope actions
		function is_alias(){ return internal.get(`modules.${arguments[0]}.mode.alias`) === arguments[1] }
		function is_defined(){ return internal.get(`modules.${arguments[0]}.defined`) === true }
		function is_defined_alias(){ return is_defined(arguments[0]) && is_alias(...arguments)  }
	}

	function get_package_json(){
		try{return JSON.parse(JSON.stringify(window.modules.get('@package') || {}))}
		catch(error){}
		return {}
	}

	function get_locator(dependency){
		const internal = 'external' in dependency === false || this.requires && this.has(`lock.dependencies.${dependency.name}`)
		if(internal) return window.modules.get('@url').at(`../${dependency.internal}`)
		return new URL(dependency.external)
	}

	async function load_package_lock(internal = {}){
		try{ internal = await window.modules.http(window.modules.get('@url').at('../package-lock.json')).then(({data})=>data) }
		catch(error){ internal = {} }
		return window.modules.set('@package.lock', internal)
	}
}, async function AnnotatedData(){

	return class AnnotatedData extends (await window.modules.wait('modules.dot.Mix', true))(Object){
		constructor(data = {}){ (super(), Object.assign(this, data)) }
		filter(notation, filter){ return this.has(notation) ? filter_values(this.has(notation), filter):[] }
		find(notation, value){ return this.filter(notation, value_filter(value))[0] || null }
	}

	//scope actions
	function filter_values(object, filter){ return window.modules.is.array(object) ? object.filter(filter):[object].filter(filter) }

	function get_type(...x){
		for(const entry in Object.entries(window.modules.is)) if(typeof entry[1] === 'function' && type_matches(entry[1])) return entry[0]
		return null
		//scope actions
		function type_matches(is){
			try{ for(const item of x) if(is(item) === false) return false }
			catch(error){ return false }
			return true
		}
	}

	function value_filter(value){
		const type = get_type(value)
		return function filter(entry){
			if(window.modules.is[type](entry)){
				if(type === 'data'){
					for(const field in value){
						if(window.modules.dot.get(entry, field) !== value[field]){
							return false
						}
					}
				}
				else return entry === value
			}
			return false
		}
	}
})

