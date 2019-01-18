const π = Math.PI;
(async function DefineModules(environment, ...x){
	if('modules' in environment) return define_modules(environment.modules);
	return await (async ([exporter], asyncs, ...inputs)=>await define_modules(exporter, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1), (x = x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l, i)=>((typeof(i) === 'function' && i.constructor.name === 'AsyncFunction') ? l[0].push(i()):l.push(i), l), [[]]))[0], ...x.slice(1, x.length));
	//scope actions
	function define_modules(exporter, ...inputs){ return exporter(environment, ...inputs).then(dispatch_modules) }
	async function dispatch_modules(modules){ environment.dispatchEvent(new CustomEvent('modules', {bubbles:true,composed:true,detail: modules})); }
})(this, async function ModulesExporter(environment, element){
	let load = ['directory']

	class Modules{
		static get base(){ return this.element.base }
		static get url(){ return this.element.url }
		static get version(){ return this.package.version }
		get ['@meta'](){ return this.constructor.element.getAttribute('meta') }
		get base(){ return this.get('project.package') || {} }
		define(...x){ return define_module(this, ...x) }
		get(notation){ return get_module(this, notation) }
		has(notation){ return has_module(this, notation) }
		get let(){ return let_module(this) }
		get locations(){ return this.get('project') || {} }
		set(notation, module){ return set_module(this, notation, module) }
		get storage(){ return get_storage(this) }
		tick(action){  return window.setTimeout(action,10) }
		get url(){ return (notation, ...locator)=>this.has(`project.${notation}`) ? URL.join(this.get(`project.${notation}`), ...locator):URL.join(notation, ...locator) }
		get window_locator(){ return window.location.href.replace(`${window.location.search}`, '').replace(`${window.location.hash}`, '') }
	}
	Modules.element = element
	Modules.package = await environment.fetch(element.package).then(x=>x.json())
	if(element.url.href.includes('bxy@latest')) element.url = new URL(element.url.href.replace('bxy@latest', `bxy@${Modules.package.version}`))

	//exports
	return await load_assets(environment.modules = new Modules())

	//scope actions
	async function load_assets(modules){
		//exports
		return new Promise(load_assets_promise)

		//scope actions
		function evaluate_asset(url){ return window.fetch(new URL(url, element.url)).then(x=>x.text()).then(x=>{try{ return eval(x) } catch(error){ return url.extension === 'json' ? {}:null }}) }

		async function load_assets_promise(success){
			await evaluate_asset('prototype/URL.prototype.js')
			for(const initial of load) once_module(modules,initial,set_asset)
			add_asset('is', 'phrase', 'dot','wait')

			//scope actions
			function done(){ return load.length === 0 ? (load=null,true):false  }

			function set_project(assets = [modules.directory.locator('module', 'project')], wait = ['modules.constructor.Project',true]){
				if(Modules.element.hasAttribute('meta')) {
					assets.push(modules.directory.locator('module', 'meta'))
					wait.push('modules.meta')
				}
				window.modules.import.assets(assets)
				window.modules.wait(...wait).then(on_project).then(success)

				//scope actions
				function on_project(Project){ return Project(Modules.base,'project') }
			}
			function add_asset(...asset){
				asset = asset.filter(i=>load.includes(i)===false)
				load.push(...asset)
				for(const field of asset) {
					once_module(modules, field, set_asset)
					evaluate_asset(`module/${field}.js`)
				}
			}
			function set_asset(event){
				Object.defineProperty(modules, event.type, {enumerable: false, configurable: false, value: event.detail, writable: false})
				if(event.type === 'wait') (add_asset( 'element'), evaluate_asset('prototype/Event.prototype.js'))
				else if(event.type === 'element') add_asset('http', 'import')
				else if(done()) set_project()
			}

		}
	}

	function once_module(modules, type, action){
		environment.addEventListener(type, once_listener, false)
		//scope actions
		function once_listener(event){
			environment.removeEventListener(event.type, once_listener, false)
			load.splice(load.indexOf(event.type), 1)
			action(event)
		}
	}

	function define_module(modules, notation, module, define_property = false){
		if(!module) console.warn(`Invalid module: "${notation}"`)
		if(load && load.includes(notation)) return (window.dispatchEvent(new CustomEvent(notation, {detail:module.value})),module)
		if(define_property === true) return (Object.defineProperty(modules, notation, module),modules[notation])
		return set_module(modules, notation, module.value)
	}

	function get_module(modules, notation){ return notation in modules ? modules[notation]:'dot' in modules ? modules.dot.get(modules, notation):null }

	function get_storage(window_modules){
		return {
			async clear(){ return await (await Storage()).clear() },
			async count(){ return await (await Storage()).length() },
			async delete(...x){ return await (await Storage()).removeItem(...x) },
			async drop(...x){ return await (await Storage()).dropInstance(...x) },
			async field(...x){ return await (await Storage()).key(...x) },
			async fields(){ return await (await Storage()).keys() },
			async get(field){ return await (await Storage()).getItem(field) },
			async has(field){ return await (await this.get(field)) !== null },
			async iterate(...x){ return await (await Storage()).iterate(...x) },
			async load(...x){ return await Storage(...x) },
			async set(field, value){ return await (await Storage()).setItem(field, value) },
			async user(update){
				const identifier = `user@${window_modules.phrase(`${window_modules.window_locator}`).underscore}`
				let user = null
				if(await this.has(identifier)) user = await this.get(identifier)
				if(typeof update === 'object' && update !== null){
					if(user) user = Object.assign(user, update)
					else user = update
					user.updated = new Date()
					await this.set(identifier, user)
				}
				else if(update === false) return (await this.delete(identifier), null)
				return user
			}
		}

		async function Storage(...configuration){
			//exports
			return 'storage-name' in window_modules ? await storage_module():configure_storage(await storage_module())

			//scope actions
			function configure_storage(storage){
				if(configuration.length){
					storage.config(...configuration)
					window_modules['storage-name'] = storage.config.name
				}
				else if(window_modules.base && 'version' in window_modules.base && 'name' in window_modules.base){
					window_modules['storage-name'] = window_modules.phrase(`${window_modules.base.name} version ${window_modules.base.version}`).underscore
					storage.config({name: window_modules['storage-name']})
				}
				else window_modules['storage-name'] = storage.config.name
				return storage
			}

			async function storage_module(){ return 'Storage' in window_modules ? window_modules.Storage:await window_modules.import.package(window_modules, 'Storage') }
		}
	}

	function has_module(modules, notation){ return notation in modules ? true:'dot' in modules && modules.dot.has(modules, notation) }

	//Let defines all fields of an object as individual properties in modules
	function let_module(modules){
		return function let_module_properties(properties){
			if(modules.is.object(properties) === false) throw new Error(`modules.let expects a valid object.`)
			return Object.entries(properties).reduce(reduce_properties, modules)

			//scope actions
			function reduce_properties(o, property){ return (o.set(...property), o) }
		}
	}

	function set_module(modules, notation, module){
		if('dot' in modules) modules.dot.set(modules, notation, module)
		else define_module(modules, notation, {value: module}, true)
		return modules.get(notation)
	}

},
async function get_element(script = null){

	//exports
	return set_element(get_script())

	//scope actions
	function get_script(expression = new RegExp('/bxy')){
		for(let i = 0; i < window.document.scripts.length; i++){
			script = window.document.scripts.item(i)
			if(script.hasAttribute('src') && expression.test(script.getAttribute('src'))){
				return script
			}
		}
		return script
	}

	function set_element(element){
		element.setAttribute('id', 'bxy')
		element.base = window.document.head.querySelector('base')
		if(!element.base) (element.base = window.document.createElement('base'), element.base.href = new URL(window.location.href))
		try{  element.source_url = new URL(element.getAttribute('src'));  }
		catch(error){  element.source_url = new URL(element.getAttribute('src'), window.location.href);  }
		if(element.source_url.pathname.includes('/web/')) element.module_url = new URL(`${element.source_url.href.split('/web/')[0]}/`)
		else element.module_url = element.source_url
		if(element.module_url.origin.includes('https://unpkg.com') && !element.module_url.href.includes('@')) element.module_url = new URL('https://unpkg.com/bxy@latest/')
		element.url = new URL('web/', element.module_url)
		element.package =  new URL('package.json', element.module_url)
		element.base.url = element.hasAttribute('meta') ? new URL('package.meta', element.base.href):new URL('package.json', element.base.href)
		return element
	}


}, async function export_log(){
	const Log = log_value
	Log.bug = log_bug
	Log.error = log_error
	Log.label = label

	//exports
	return 'log' in window ? Log:window.log = Log

	//shared actions
	function label(text, style = 'rgba(0,123,255,1)'){
		return [`%c${text}`, get_style()]

		//shared actions
		function get_style(){
			if(typeof style === 'string') return `color:${style}`
			else if(typeof style === 'object' && style !== null) return Object.keys(style).map(field=>`${field}:${style[field]};`).join(' ')
			return ''
		}
	}

	function log_bug(name, ...logs){
		console.group(...label(`Bug -> ${name}`, 'rgba(85,65,236,1)'))
		for(const item of logs){
			log_value(item)
			console.log(`%c-------------------`, 'color:#ddd')
		}
		console.groupEnd()
	}

	function log_error(log){
		console.group(...label(`Error -------------------- \n\t -> "${log.message}"`, 'rgba(255,115,0,1)'))
		console.error(log)
		console.groupEnd()
	}

	function log_table(value){
		if(console.table && value instanceof HTMLElement === false){
			console.groupCollapsed(`%c•••••••••TABLE••••••••••`, 'color:rgba(89,73,81,1)')
			console.table(value)
			console.groupEnd()
		}
		else console.dir(value)
	}

	function log_value(value, ...labels){

		if(labels.length) console.log(label(...labels))
		if(value instanceof Error) log_error(value)
		else if(typeof value === 'object' && value !== null){
			if(value instanceof HTMLElement) console.log(value)
			else try{ console.log(`%c==============\n${JSON.stringify(value, null, 2)}\n==============`, 'color:seagreen') }
			catch(e){ }
			log_table(value)
		}
		else console.log(value)
	}

})
