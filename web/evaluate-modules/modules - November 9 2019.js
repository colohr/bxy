const π = Math.PI;
(async function DefineModules(environment, ...x){
	if('modules' in environment) return define_modules(environment.modules);
	return await (async ([exporter], asyncs, ...inputs)=>await define_modules(exporter, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1), (x = x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l, i)=>((typeof(i) === 'function' && i.constructor.name === 'AsyncFunction') ? l[0].push(i()):l.push(i), l), [[]]))[0], ...x.slice(1, x.length));
	//scope actions
	function define_modules(exporter, ...inputs){ return exporter(environment, ...inputs).then(dispatch_modules) }
	async function dispatch_modules(modules){ environment.dispatchEvent(new CustomEvent('modules', {bubbles:true,composed:true,detail: modules})); }
})(this, async function ModulesExporter(environment, element, Project, Cookie, Keyboard){
	let load = []

	class Modules extends static_mixin(){
		static get base(){ return this.element.base }
		static get url(){ return this.element.url }
		static get version(){ return this.package.version }
		get ['@meta'](){ return this.constructor.element.getAttribute('meta') }
		get ['@modules'](){ return this.get('@package.modules')  }
		get ['@package'](){ return this.constructor.package }
		get ['@url'](){ return this.constructor.url }
		get ['@emitter'](){ return this.dot.get(window, 'document.documentElement') || window }
		get base(){ return this.get('project.package') || {} }
		create(){ return create_type(this, ...arguments) }
		define(...x){ return define_module(this, ...x) }
		get(notation){ return get_module(this, notation) }
		has(notation){ return has_module(this, notation) }
		get let(){ return let_module(this) }
		get locations(){ return this.get('project') || {} }
		get resource(){ return this.ProjectPackage.ModuleResource }
		set(notation, module){ return set_module(this, notation, module) }
		get storage(){ return this.import.storage() }
		tick(action){  return window.setTimeout(action,10) }
		get url(){ return URL.get }
		get window_locator(){ return window.location.href.replace(`${window.location.search}`, '').replace(`${window.location.hash}`, '') }
	}
	Modules.prototype.keyboard=Keyboard()
	Modules.prototype.static = static_module
	Modules.prototype.static.mixin = static_mixin
	Modules.element = element
	Modules.package = await environment.fetch(element.package).then(x=>x.json())
	if(element.url.href.includes('bxy@latest')) element.url = new URL(element.url.href.replace('bxy@latest', `bxy@${Modules.package.version}`))

	//exports
	return await load_assets(environment.modules = new Modules())

	//scope actions
	function create_type(modules, Type, ...properties){
		if(modules.is.function(Type)) return new Type(...properties)
		else if(modules.is.object(Type)) Type = Object.create(Type)
		return new Object(properties.reduce((object,entry)=>Object.assign(object,entry)),Type)
	}

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
				function on_project(project){ return (Cookie(modules),project.at('design')?modules.import.class('Design'):null,project) }
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

	function static_mixin(Base){
		return class StaticMixin extends (Base=Base||class StaticBase{}){
			dispatch(){ return (environment.modules['@emitter'].dispatch(...arguments), this) }
			off(){ return (environment.modules['@emitter'].off(...arguments),this) }
			on(){ return (environment.modules['@emitter'].on(...arguments),this) }
			once(){ return (environment.modules['@emitter'].once(...arguments), this) }
			send(){ return this.dispatch(...arguments) }
		}
	}
	function static_module(notation){ return this.dot.get(this.constructor, notation) }

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
		const embedded = element.hasAttribute('embedded')
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
		if(embedded) element.base.setAttribute('embedded','')
		return element
	}

}, function Project(element){
	const {dot, is} = window.modules
	const Project = window.modules.set('ProjectPackage', class Project{
		constructor(data, on_load){
			if(dot.has(data, 'project') === false) data.project = {}
			this.package = data
			if(element.hasAttribute('embedded')) delete this.package.project.main
			this.element = element
			this.main = create_main(this, dot.get(data, 'project.main'))
			this.domain = create_domain(this, data)
			if(is.text(this.domain.name) && this.domain.name.startsWith('localhost')) this.domain.local = true
			this.subdomain = create_subdomain(this, dot.get(data, 'project.subdomain'))
			load_project(window.modules.set('project', this)).then(on_load).catch(console.error)

			//scope actions
			async function load_project(project, assets = []){
				for(const field in project.subdomain) dot.set(project, field, project.subdomain[field])
				if(dot.has(project, 'package.project.locations')) await create_locations(dot.get(project, 'package.project.locations'))
				if(dot.has(project, 'main.define')) await define_base_data(dot.get(project, 'main.define'))
				Object.defineProperty(project.package, 'locations', {get(){ return window.modules.project }})
				if(dot.has(project, 'main.assets')){
					for(const item of dot.get(project, 'main.assets')){
						if(typeof item === 'string') assets.push({url: project.main.url(item)})
						else assets.push(item)
					}

				}
				if(assets.length) window.modules.import.assets(...assets)
				if(dot.has(project, 'main.wait')) await window.modules.wait(...project.main.wait)

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

				async function create_location_type_values(type, field, {origin, location, folder}){
					if(dot.has(type, field)) for(const item of Object.entries(dot.get(type, field))){
						const entry = field === 'locations' ? item[0]:item[1]
						const locator = field === 'locations' ? join_locations(folder, item[1]):join_locations(folder, entry)
						const url = await get_url(origin, field === 'items' ? `${locator}/`:locator)
						if(field === 'assets') assets.push({location, url})
						else dot.set(project, entry, Object.assign(url, dot.has(project, entry) ? dot.get(project, entry):null))
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
						else if(item.includes('@')) return (item = item.split('@'), new URL(item[0], dot.get(project, item[1])))
						return project.main.url(item)
					}
				}

				function get_folder(location, locations = []){
					if(dot.has(location, 'folder')) locations.push(dot.get(location, 'folder'))
					if(dot.has(location, 'version')) locations.push(dot.get(location, 'version'))
					return join_locations(...locations)
				}

				function get_origin(location){
					const has_subdomain = dot.has(location, 'subdomain')
					if(project.domain.local && (dot.has(location, 'local') || has_subdomain)) return URL.join('/')
					return has_subdomain ? project.subdomain[location.subdomain]:URL.join()
				}

				async function get_url(origin, value){ return (value = is.text(value) && value.includes('${') ? window.modules.tag(value):value, is.dictionary.locator.url(new URL(is.text(value) ? value:'/', origin))) }

				function join_locations(...location){ return location.join('/').split('/').filter(i=>i.trim().length).join('/') }
			}

			function create_domain(project, data){
				if(dot.has(data, 'project.domain') === false) data.project.domain = {}
				if(dot.has(data, 'project.domain.protocol') === false) data.project.domain.protocol = project.element.url.protocol.replace(':', '')
				if(dot.has(data, 'project.domain.name') === false) data.project.domain.name = project.element.url.hostname
				return data.project.domain
			}

			function create_main(project, data){
				if(is.data(data) === false) data = {}
				data.url = get_main_url
				return data

				//scope actions
				function get_main_url(...locator){
					let location = undefined
					if(dot.has(project, locator[0])) location = dot.get(project, locator[0])
					if(location instanceof URL === false) location = undefined
					else locator.splice(0, 1)
					if(is.nothing(location) && dot.has(project, 'main.location')) location = dot.get(project, 'main.location')
					if(location instanceof URL === false) location = undefined
					if(is.nothing(location) === false) locator.push(location)
					return URL.join(...locator)
				}
			}

			function create_subdomain(project, data, subdomain = {}){
				if(is.array(data) === false) data = []
				for(const name of data) subdomain[name] = new URL(`${project.domain.protocol}://${name}.${project.domain.name}/`)
				return subdomain
			}
		}
		get at(){ return project_package_attribute(this.package) }
		get dependencies(){ return this.package.dependencies }
	})
	Project.ModuleResource = project_package_module_resource()
	return new Promise(async success=>(new Project(await load_meta(element), success)))

	//scope actions
	async function load_meta(element,base=null){
		try{
			if(element.xml.variable){
				base = window.modules.dot.get(window, element.xml.variable)
				window.modules.dot.delete(window, element.xml.variable)
				if(window.modules.is.text(base)) base = window.modules.meta.data(base)
			}
			else if (element.url.extension === 'meta') base = await window.modules.meta.import(element.url).catch(on_invalid_package)
			else base = (await window.modules.http(element.url).catch(on_invalid_package)).json(false, {})
		}
		catch(error){ on_invalid_package(error)  }
		return window.modules.is.data(base) ? base:{}
		//scope actions
		function on_invalid_package(error){
			console.warn(`No valid package assigned to 'modules.project' from -> "${element.url}"\nError: ${error.message}`)
		}
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

	function project_package_module_resource(){
		function PackageModuleResource(location, ...package_annotation){
			if(this instanceof PackageModuleResource === false) return load_package_json(new PackageModuleResource(...arguments), ...package_annotation)
			this.location = location instanceof URL ? location:HTMLElement.SourceCode.url(location)
		}
		PackageModuleResource.prototype = {
			get assets(){ return [this.index,this.dependencies] },
			get dependencies(){ return Object.entries(window.modules.dot.get(this, `nest.dependencies`) || {}).map(map_asset_location, this)  },
			get identity(){ return this.location.basename.replace(`.${this.location.extension}`, '') },
			get index(){ return package_index.call(this) },
			get nest(){ return window.modules.dot.get(this, `json.nest.${this.identity}`) }
		}
		//exports
		return PackageModuleResource

		//scope actions
		async function load_package_json(package_module_resource, ...package_annotation){
			const annotated = package_annotation.filter(notation=>window.modules.has(notation) || window.modules.is.defined(notation)).length === package_annotation.length
			try{
				if(annotated === false){
					if(window.modules.has('meta') === false) await window.modules.import('meta')
					package_module_resource.json = await window.modules.import.meta(package_module_resource.location.at('package.json'))
					await window.modules.import.assets(...package_module_resource.assets)
				}
			}
			catch(error){
				console.warn(`Modules: load_package_json() -> \nInvalid package.json from -> "${package_module_resource}"\nError: ${package_module_resource.error = error}`)
			}
			return package_module_resource
		}

		function map_asset_location(asset){ return URL.is(asset[1]) ? URL.get(asset[1]):this.location.at(asset[1]) }

		function package_index(){
			const file = window.modules.dot.get(this, 'json.browser') || window.modules.dot.get(this, 'json.main')
			return file ? this.location.at(file):null
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
}, function Keyboard(){

	const numeric = {lock: 144, 0:96, 1:97, 2:98, 3:99, 4:100, 5:101, 6:102, 7:103, 8:104, 9:105, multiply:106, add:107, subtract:109, decimal:110, divide:111}
	const functional = {scroll: 145, end: 35, home: 36, up: 33, down: 34, insert: 45, delete: 46, f1: 112, f2: 113, f3: 114, f4: 115, f5: 116, f6: 117, f7: 118, f8: 119, f9: 120, f10: 121, f11: 122, f12: 123 }
	const keymap = {
		0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,
		a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,
		accent: 192, get alt(){ return this.option }, get arrow(){ return {down:this.down,left:this.left,right:this.right,up:this.up} },
		backslash: 220, backspace: 8, get bracket(){ return {close:this.close, open:this.open} }, break: 19,
		capitals:20, get caps(){ return this.capitals }, close: 221, comma: 188, command: { left: 91, right:93 }, control: 17,
		dash: 189, down: 40, enter: 13, equal:187, escape: 27,
		left: 37, open: 219, option: 18, period: 190, quote: 222, right: 39,
		semicolon: 186, get select(){ return this.command.right }, shift: 16, slash:191, space: 32,
		tab: 9, up: 38, get windows(){ return {left:this.command.left, right: 92} }
	}

	function Keyboard(event){
		if(this instanceof Keyboard === false) return new Keyboard(...arguments)
		if(arguments[0] instanceof Event) this.event = arguments[0]
		else this.field = arguments[0]
		this.field = this.event ? this.event.keyCode || this.event.charCode || this.event.which:arguments[0]
		this.key = get(this.field) || null
		if(this.key){
			if(typeof(this.key.code)==='number') this[this.key.code]=true
			this[this.key.name]=true
			this[this.key.fieldset]=true
			this.name=this.key.name
		}
	}
	Keyboard.numeric=numeric
	Keyboard.functional=functional
	Keyboard.keymap=keymap

	//exports
	return new Proxy(Keyboard,{get(target,field){return get(field)} })


	//scope actions
	function get(field){
		if(field in Keyboard) return fieldset(Keyboard[field], field)
		if(typeof(field)==='string') field = field.toLowerCase()
		let value = fieldset(keymap, 'keymap').get(field)
		if(value === null){
			if((value = fieldset(functional, 'functional').get(field)) === null){
				value = fieldset(numeric, 'numeric').get(field)
			}
		}
		return value
	}
	function fieldset(){
		if(arguments[0] instanceof Object === false) return null
		return {
			data:arguments[0],
			entry:arguments.length > 1 ? arguments[1]:null,
			get fields(){ return Object.keys(this.data) },
			get entries(){ return Object.entries(this.data) },
			get sets(){ return this.values.map(fieldset).filter(code=>code!==null) },
			get(){
				let value = {entry:null,index:-1, get code(){ return this.entry[1] }, get name(){ return this.entry[0] } }
				if(invalid(value.index = this.fields.indexOf(arguments[0]))){
					if(invalid(value.index = this.values.indexOf(arguments[0]))){
						for(const set of this.sets){
							if(invalid(value = set.get(arguments[0])) === false){
								value.index = set.entry
								break
							}
						}
					}
				}
				if(invalid(value)===false && invalid(value.index) === false) {
					value.entry=this.entries[value.index]
					value.fieldset=this.entry
				}
				return invalid(value) || invalid(value.index) ? null:value
			},
			get values(){ return Object.values(this.data) }
		}
		//scope actions
		function invalid(index){ return index === null || index === -1 }
	}
})
