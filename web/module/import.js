(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('import', {value:await module(...inputs)}); return window.modules.has('import')?window.modules.get('import'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(window_modules){

	const module_import = {
		get assets(){ return window_modules.http.assets },
		class: load_class,
		component: load_component,
		content: load_element,
		element: load_element,
		function: load_function,
		json: load_json,
		meta: load_meta,
		mixin: load_mixin,
		module: load_module,
		package: load_package,
		prototypes: load_prototype,
		type: load_type,
		web: load_web
	}

	//exports
	return new Proxy(load_scoped_module, {
		get(o, field){ return field in module_import ? module_import[field]:null },
		has(o, field){ return field in module_import }
	})

	//scope actions
	async function load_base(type, name, result = 'module'){ return await (await window_modules.http(window_modules.directory.base[type](name)))[result] }

	async function load_class(name){
		if(window_modules.has(name)) return window_modules.get(name)
		await window_modules.http.assets(window_modules.directory.base.class(name))
		await window_modules.wait(`modules.${name}`)
		return window_modules.get(name)
	}

	async function load_component(name, ...definition){
		const tag = (name instanceof URL ? name.filename:name).replace('.js','')
		if(window_modules.is.defined(tag)) return window_modules.element.create(tag,...definition)
		await window_modules.http.assets(window_modules.directory.base.component(name))
		return window_modules.element.create(tag, ...definition)
	}

	async function load_element(url){
		if(url instanceof URL === false) url = url.indexOf('http') === 0 ? new URL(url):new URL(url, window.location.href)
		const identifier = window_modules.phrase(`${url}`).dash
		const type = get_type()
		let element = window.document.querySelector(`${type}[import-id="${identifier}"]`)
		if(element) return element
		const response_type = type === 'css' ? 'content':'document'
		const response = (await window_modules.http(url))[response_type]
		switch(type){
			case 'css':
				return create_css()
			case 'svg':
				return create_svg()
			case 'template':
				return create_template()
		}
		return null

		//scope actions
		function get_type(){
			if(url.extension === 'svg') return 'svg'
			else if(url.extension === 'css') return 'style'
			return 'template'
		}

		function create_template(){
			element = window.document.createElement('template')
			const all_styles = Array.from(response.querySelectorAll('style')).map(i=>i.outerHTML).join('\n')
			const all_content = response.body.innerHTML
			element.innerHTML = `${all_styles}\n${all_content}`
			element.setAttribute('import-id', identifier)
			return (window.document.body.appendChild(element), element)
		}

		function create_svg(){
			element = response.body.querySelector('svg')
			if(element){
				element.remove()
				element.setAttribute('import-id', identifier)
				return (window.document.body.appendChild(element), element)
			}
			return element
		}

		function create_css(){
			element = window.document.createElement('style')
			element.innerHTML = response
			element.setAttribute('import-id', identifier)
			return (window.document.head.appendChild(element), element)
		}
	}

	async function load_function(name){
		if(window_modules.has(name)) return window_modules.get(name)
		else if(window_modules.has(`function.${name}`)) return window_modules.get(`function.${name}`)
		return await load_base('function', name)
	}

	async function load_json(name){ return await load_base('json', name, 'data') }

	async function load_meta(locator, cache_result = false){
		if(window.modules.has('meta') === false) await window.modules.import('meta')
		locator = locator instanceof URL ? locator:window_modules.directory.base.meta(locator)
		const notation = locator.basename.replace('.meta','').replace('.yaml','')
		if(has_meta_import()) return window.modules.dot.get(window.modules[window.modules.meta.symbol], notation)

		//exports
		return window.modules.meta.import(locator).then(set_meta_import)

		//scope actions
		function has_meta_import(){ return window.modules.meta.symbol in window.modules && window.modules.dot.has(window.modules[window.modules.meta.symbol], notation) }

		function set_meta_import(data){
			if(window.modules.is.object(data) !== true || cache_result === false) return data
			if(window.modules.meta.symbol in window.modules === false) window.modules[window.modules.meta.symbol] = {}
			return window.modules.dot.set(window.modules[window.modules.meta.symbol], notation, data)
		}
	}

	async function load_mixin(name){ return await load_base('mixin', name) }

	function load_module(locator){
		locator = uniform_locator(locator, x=>window_modules.directory.unpack(x))
		return import(`${locator}`)
	}

	async function load_scoped_module(locator, ...notation){
		locator = uniform_locator(locator, (x)=>window_modules.directory.base.module(x))
		const name = locator.file.replace(`.js`, '')
		if(window_modules.has(name)) return window_modules.get(name)
		const request = await window_modules.http(locator)
		const module = await request.module
		if(notation.length) await window_modules.wait(...notation)
		return module
	}

	async function load_package(...x){
		const locator = window_modules.directory.locator('package', ...x)
		if(locator.name && window_modules.has(locator.name)) return window_modules[locator.name]
		return await window_modules.http.assets(locator.url).then(()=>{
			if(locator.name && locator.notation){
				return window_modules.define(locator.name, {value: window_modules.directory.get(locator.notation)})
			}
			return window_modules
		})
	}

	async function load_prototype(name){ return await load_base('proto', name) }

	async function load_type(name){ return await load_base('type', name) }

	async function load_web(...x){
		const locator = window_modules.directory.locator('web', ...x)
		const web_module = (await window_modules.http(locator.url)).module
		if(typeof locator.name === 'string'){
			Object.defineProperty(window_modules, locator.name, {value: web_module})
			return window_modules[locator.name]
		}
		return window_modules
	}

	function uniform_locator(locator, resource_type = (...x)=>URL.join(...x)){
		if(locator instanceof URL === false){
			if(locator.indexOf('http') === 0) locator = new URL(locator)
		}
		return locator instanceof URL ? locator:resource_type(locator)
	}
},
async function load_assets(){ return window.modules },
async function Directory(){

	class Directory{
		static get base(){ return window.modules.constructor.url }
		constructor(){
			this.base = {
				class(file){ return URL.join('classes', get_file(file, 'js'), Directory.base) },
				component(file){ return URL.join('component', get_file(file, 'js'), Directory.base) },
				function(file){
					if(file.indexOf('function.') !== 0) file = `function.${file}`
					return URL.join('function', get_file(file, 'js'), Directory.base)
				},
				json(file){ return URL.join('json', get_file(file, 'json'), Directory.base) },
				meta(file){ return URL.join('json', get_file(file, 'meta', 'yaml'), Directory.base) },
				mixin(file){ return URL.join('mixin', get_file(file, 'js'), Directory.base) },
				module(file){ return URL.join('module', get_file(file, 'js'), Directory.base) },
				get package(){ return Directory.base },
				script(file){ return URL.join('script', get_file(`${file}/index.js`, 'js'), Directory.base) },
				type(file){ return URL.join('type', get_file(file, 'js'), Directory.base) },
				web(file){ return URL.join(get_file(file, 'js'), Directory.base) }
			}
			this.url={}

			this.modules = {
				Calendar: new Directory.Module('Calendar', 'luxon', {
					file: 'build/cjs-browser/luxon.js',
					notation: 'window.luxon',
					version: '1.8.2'
				}),
				d3: new Directory.Module('d3', 'd3', {
					file: 'dist/d3.min.js',
					notation: 'window.d3',
					version: '5.7.0'
				}),
				moment: new Directory.Module('moment', 'moment', {
					file: 'min/moment.min.js',
					notation: 'window.moment',
					version: '2.22.0'
				}),
				Navigo: new Directory.Module('Navigo', 'navigo', {version: '7.1.2', file: 'lib/navigo.min.js', notation: 'window.Navigo'}),
				Storage: new Directory.Module('Storage', 'localforage', {
					file: 'dist/localforage.nopromises.min.js',
					notation: 'window.localforage',
					version: '1.7.2'
				}),
				turf: new Directory.Module('turf', '@turf/turf', {
					file: 'turf.min.js',
					notation: 'window.turf',
					version: 'latest'
				}),
				YAML: new Directory.Module('YAML', 'js-yaml', {
					file: 'dist/js-yaml.min.js',
					notation: 'window.jsyaml',
					version: '3.12.0'
				})

			}
		}
		create(...x){ return new Directory.Module(...x) }
		get(notation){ return window.modules.dot.get({window}, notation) }
		locator(...x){ return get_locator(this, ...x) }
		get package(){ return window.modules.constructor.package }
		set(module){
			if(module instanceof Directory.Module !== true) throw new Error(`Invalid DirectoryModule definition. Create a DirectoryModule instance by using directory.create.`)
			return (this.modules[module.identifier] = module, this)
		}
		unpack(...x){ return new URL(`https://unpkg.com/${x.filter(i=>i.length).join('/')}`) }
	}

	window.modules.dot.set(Directory, 'Module', class DirectoryModule{
		constructor(identifier, name, locator = {}){
			this.identifier = identifier
			this.name = name || this.identifier
			this.file = locator.file || ''
			this.version = locator.version ? `@${locator.version}`:''
			this.notation = locator.notation || `window.${this.name}`
			if(locator.url instanceof URL) this.locator = locator.url
		}
		get url(){
			if('locator' in this) return this.locator
			return window.modules.directory.unpack(`${this.name}${this.version}`, this.file)
		}
	})

	//exports
	return window.modules.define('directory', {value:new Directory()})

	//scope actions
	function get_file(file, type, type_b){
		if(file.includes('.')){
			const parts = file.split('.')
			if(parts.indexOf(type) !== parts.length-1){
				if(type_b && parts.indexOf(type_b) === parts.length - 1){
					return file
				}
				file = `${file}.${type}`
			}
		}
		else file = `${file}.${type}`
		return file
	}

	function get_locator(directory, type, ...x){
		const locator = {name: x[1] ? x[1]:x[0]}
		if(x[0] instanceof URL === false && locator.name in directory.modules){
			locator.url = directory.modules[locator.name].url
			locator.notation = directory.modules[locator.name].notation
		}
		else locator.url = x[0]
		if(type in directory.url || type in directory.base){
			const url_type = type in directory.url ? directory.url:directory.base
			const url = type in directory.url ? directory.url[type]:directory.base[type]
			locator.url = typeof url === 'function' ? url.call(url_type, locator.url):new URL(locator.url, url)
		}
		if(locator.url instanceof URL !== true) locator.url = new URL(locator.url)
		return locator
	}
})
