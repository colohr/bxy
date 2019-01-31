const π = Math.PI;
(async function DefineModules(environment, ...x){
	if('modules' in environment) return define_modules(environment.modules);
	return await (async ([exporter], asyncs, ...inputs)=>await define_modules(exporter, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1), (x = x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l, i)=>((typeof(i) === 'function' && i.constructor.name === 'AsyncFunction') ? l[0].push(i()):l.push(i), l), [[]]))[0], ...x.slice(1, x.length));
	//scope actions
	function define_modules(exporter, ...inputs){ return exporter(environment, ...inputs).then(dispatch_modules) }
	async function dispatch_modules(modules){ environment.dispatchEvent(new CustomEvent('modules', {bubbles:true,composed:true,detail: modules})); }
})(this, async function ModulesExporter(environment, element, Project, Cookie, Logger){
	let load = []
	class Modules{
		static get base(){ return this.element.base }
		static get url(){ return this.element.url }
		static get version(){ return this.package.version }
		get ['@meta'](){ return this.constructor.element.getAttribute('meta') }
		get ['@modules'](){ return this.get('@package.modules')  }
		get ['@package'](){ return this.constructor.package }
		get ['@url'](){ return this.constructor.url }
		get base(){ return this.get('project.package') || {} }
		define(...x){ return define_module(this, ...x) }
		get(notation){ return get_module(this, notation) }
		has(notation){ return has_module(this, notation) }
		get let(){ return let_module(this) }
		get locations(){ return this.get('project') || {} }
		set(notation, module){ return set_module(this, notation, module) }
		get storage(){ return this.import.storage() }
		tick(action){  return window.setTimeout(action,10) }
		get url(){ return URL.get }
		get window_locator(){ return window.location.href.replace(`${window.location.search}`, '').replace(`${window.location.hash}`, '') }
	}
	Modules.element = element
	Modules.package = await environment.fetch(element.package).then(x=>x.json())
	if(element.url.href.includes('bxy@latest')) element.url = new URL(element.url.href.replace('bxy@latest', `bxy@${Modules.package.version}`))

	//exports
	return await load_assets(environment.modules = new Modules())

	//scope actions
	async function load_assets(modules){
		return new Promise(load_assets_promise)

		//scope actions
		function evaluate_asset(url){ return window.fetch(new URL(url, element.url)).then(x=>x.text()).then(x=>{try{ return eval(x) } catch(error){ return url.extension === 'json' ? {}:null }}) }

		async function load_assets_promise(success){
			await evaluate_asset('prototype/URL.prototype.js')
			evaluate_asset('prototype/HTMLElement.prototype.js')
			for(const initial of load) once_module(modules,initial,set_asset)
			add_asset('is','phrase', 'dot')

			//scope actions
			function add_asset(...asset){
				asset = asset.filter(i=>load.includes(i)===false)
				load.push(...asset)
				for(const field of asset) (once_module(modules, field, set_asset), evaluate_asset(`module/${field}.js`))
			}
			function done(){ return load.length === 0 ? (load=null,true):false  }
			function set_asset(event){
				Object.defineProperty(modules, event.type, {configurable: false, value: event.detail, writable: false})
				if(event.type === 'dot') add_asset('wait')
				else if(event.type === 'wait') (add_asset('element'), evaluate_asset('prototype/Event.prototype.js'))
				else if(event.type === 'element') add_asset('http', 'import')
				else if(event.type === 'import' && Modules.element.hasAttribute('meta')) add_asset('meta')
				else if(done()) set_project()
			}
			function set_project(){
				return Project(Modules.base).then(on_project).then(success)
				//scope actions
				function on_project(project){ return (Cookie(modules),Logger(),project.at('design')?modules.import.class('Design'):null,project) }
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

}, function Project(element){
	const {dot, is} = window.modules
	return new Promise(async success=>(new class Project{
		constructor(data){
			if(dot.has(data, 'project') === false) data.project = {}
			this.package = data
			this.element = element
			this.main = create_main(this, dot.get(data, 'project.main'))
			this.domain = create_domain(this,data)
			this.subdomain = create_subdomain(this, dot.get(data, 'project.subdomain'))
			load_project(window.modules.set('project', this)).then(success).catch(console.error)

			//scope actions
			async function load_project(project, assets=[]){
				for(const field in project.subdomain) dot.set(project,field,project.subdomain[field])
				if(dot.has(project, 'package.project.locations')) await create_locations(dot.get(project,'package.project.locations'))
				if(dot.has(project, 'main.define')) await define_base_data(dot.get(project,'main.define'))
				Object.defineProperty(project.package, 'locations', {get(){ return window.modules.project }})
				if(dot.has(project, 'main.assets')){
					for(const item of dot.get(project, 'main.assets')){
						if(typeof item === 'string') assets.push({url: project.main.url(item)})
						else assets.push(item)
					}
				}
				if(assets.length) window.modules.import.assets(...assets)
				if(dot.has(project,'main.wait')) await window.modules.wait(...project.main.wait)

				//exports
				return project

				//scope actions
				async function create_location(){
					const folder = get_folder(arguments[1])
					const origin = get_origin(arguments[1])
					const location = dot.has(arguments[1], 'field') ? arguments[1].field:arguments[0]
					dot.set(project, location, Object.assign(URL.join(`${folder}/`, origin), arguments[1]))
					await create_location_type_values(arguments[1], 'assets', {folder, location, origin})
					await create_location_type_values(arguments[1], 'items', {folder, location, origin})
					await create_location_type_values(arguments[1], 'locations', {folder, location, origin})
				}

				async function create_location_type_values(type, field, {origin,location,folder}){
					if(dot.has(type, field)) for(const item of Object.entries(dot.get(type, field))){
						const entry = field==='locations' ?item[0]:item[1]
						const locator = field==='locations'? join_locations(folder, item[1]):join_locations(folder, entry)
						const url = await get_url(origin, field === 'items' ? `${locator}/`:locator)
						if(field === 'assets') assets.push({location, url})
						else dot.set(project,entry, Object.assign(url,dot.has(project,entry)?dot.get(project, entry):null))
					}
				}

				async function create_locations(locations){
					project[Symbol.for('locations')] = locations
					return await Promise.all(Object.entries(locations).map(get_location))
					//scope actions
					function get_location(fieldset){ return create_location(...fieldset) }
				}

				async function define_base_data(definitions){
					for(const field in definitions) dot.set(project, field, await (await window.modules.http(get_base_item(definitions[field]))).data)
					//scope actions
					function get_base_item(item){
						if(item.includes('http')) return new URL(item)
						else if(item.includes('@')) return (item=item.split('@'), new URL(item[0], dot.get(project, item[1])))
						return project.main.url(item)
					}
				}

				function get_folder(location, locations = []){
					if(dot.has(location, 'folder')) locations.push(dot.get(location, 'folder'))
					if(dot.has(location, 'version')) locations.push(dot.get(location, 'version'))
					return join_locations(...locations)
				}

				function get_origin(location){ return dot.has(location,'subdomain') ? project.subdomain[location.subdomain]:URL.join() }
				async function get_url(origin, value){ return (value=is.text(value)&&value.includes('${')?window.modules.tag(value):value,is.dictionary.locator.url(new URL(is.text(value)?value:'/',origin))) }
				function join_locations(...location){ return location.join('/').split('/').filter(i=>i.trim().length).join('/') }
			}

			function create_domain(project, data){
				if(dot.has(data, 'project.domain') === false) data.project.domain = {}
				if(dot.has(data, 'project.domain.protocol') === false) data.project.domain.protocol = project.element.url.protocol.replace(':','')
				if(dot.has(data, 'project.domain.name') === false) data.project.domain.name = project.element.url.hostname
				return data.project.domain
			}

			function create_main(project,data){
				if(is.data(data) === false) data = {}
				data.url = get_main_url
				return data

				//scope actions
				function get_main_url(...locator){
					let location = undefined
					if(dot.has(project, locator[0])) location = dot.get(project, locator[0])
					if(location instanceof URL === false) location = undefined
					else locator.splice(0,1)
					if(is.nothing(location) && dot.has(project, 'main.location')) location = dot.get(project, 'main.location')
					if(location instanceof URL === false) location = undefined
					if(is.nothing(location) === false) locator.push(location)
					return URL.join(...locator)
				}
			}

			function create_subdomain(project, data, subdomain={}){
				if(is.array(data) === false) data = []
				for(const name of data) subdomain[name] = new URL(`${project.domain.protocol}://${name}.${project.domain.name}/`)
				return subdomain
			}
		}
		get at(){ return project_package_attribute(this.package) }
		get dependencies(){ return this.package.dependencies }
	}(await load_meta(element))))

	//scope actions
	async function load_meta(element,base=null){
		try{ base = await (element.url.extension==='meta'?window.modules.meta.import(element.url):(await window.modules.http(element.url)).json(false, {})) }catch(e){  }
		return window.modules.is.data(base) ? base:{}
	}

	function project_package_attribute(){
		return notation=>dot.get(get_target(arguments[0]),notation)
		//scope actions
		function get_target(){
			return new Proxy(window.modules.is.object(arguments[0])? arguments[0]:{}, {get(o,field){ return get_value(get_object(o,field), field)},has(o, field){return has_value(get_object(o,field), field)}})
			//scope actions
			function get_object(o,field){
				if(has_value(o,field) === false) for(const notation of ['project','package','@','locations', 'global']){
					if(has_value(o,notation)) try{
						if(dot.has(o[notation], `@${field}`)) return o[notation]
						else if(dot.has(o[notation], field)) return o[notation]
						else if(dot.has(o[`@${notation}`], `@${field}`)) return o[`@${notation}`]
						else if(dot.has(o[`@${notation}`], field)) return o[`@${notation}`]
					}catch(error){ }
				}
				return o
			}
			function get_value(o,field){ return dot.has(o, `@${field}`) ? dot.get(o, `@${field}`):(dot.has(o, field) ? dot.get(o, field):null) }
			function has_value(o,field){ return dot.has(o, field) || dot.has(o, `@${field}`) }
		}
	}

},function Cookie(modules){
	const package_field = '@cookie'
	return modules.set('cookie',load({ field: package_field, delete:delete_cookie, set: set_cookie, get: get_cookie }))

	//scope actions
	function delete_cookie(field){ return this.set(field, '', -1) }
	function get_cookie(field){
		const name = `${field}=`;
		const cookies = window.document.cookie.split(';')
		for(let index = 0; index < cookies.length; index++){
			let cookie = cookies[index]
			while(cookie.charAt(0) === ' ') cookie = cookie.substring(1)
			if(cookie.indexOf(name) === 0) return modules.meta.data(decodeURIComponent(cookie.substring(name.length, cookie.length)))
		}
		return null
	}

	function load(cookies){
		const cookie = modules.get(`project.package.${package_field}`)
		if(cookie) set_cookie(cookie.field, encodeURIComponent(modules.meta.text(cookie.value)))
		return cookies
	}

	function set_cookie(field, value, days = 1, path='/'){
		const date = new Date()
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
		const expires = `expires=${date.toUTCString()}`
		window.document.cookie = `${field}=${value}; ${expires}; path=${path}`
		return this
	}
},
function Logger(){
	const Log = log_bug
	Log.bug = log_bug
	Log.error = log_error
	Log.label = label
	Log.value = log_value

	//exports
	return window.modules.set('log','log' in window ? Log:window.log = Log)

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
