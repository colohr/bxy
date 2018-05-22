(async function(get_loader, get_modules, get_directory, ...x){ return await get_loader(get_modules(...x), get_directory, window.directory).then(detail=>(window.dispatchEvent(new CustomEvent('modules', {detail})), detail)) })
(async function load_assets(modules, get_directory, ...x){
	//exports
	if('directory' in modules === false){
		return (modules.directory=get_directory(...x), await load_file('https://unpkg.com/bxy/web/modules/http.js'), modules)
	}
	return modules

	//shared actions
	async function load_file(attributes, element = null){
		return new Promise(function load_element_asset(load_success, load_error){
			if(typeof element === 'string') element = document.createElement(element)
			for(const field in attributes) element[field] = attributes[field]
			element.onload = ()=>load_success()
			element.onerror = e=>load_error(e)
			return (element.localName==='link'?document.head:document.body).appendChild(element)
		})
	}
}, function get_modules(get_import){
	if('modules' in window) return window.modules
	class WindowModules{
		get assets(){ return this.http.assets }
		define(name, definition){ return (Object.defineProperty(this, name, definition), this[name]) }
		gui(element = document){ return new Proxy(element && element.shadowRoot ? element.shadowRoot:element, {get(o, field){return o.getElementById(field)}}) }
		has(name){ return name in this }
		get import(){ return get_import(this) }
		get storage(){ return get_storage(this) }
		get window_locator(){ return window.location.href.replace(`${window.location.search}`, '').replace(`${window.location.hash}`, '') }
	}

	//exports
	return window.modules = new WindowModules()

	//shared actions
	function get_storage(window_modules){
		return {
			async clear(){ return (await Storage()).clear() },
			async count(){ return (await Storage()).length() },
			async delete(...x){ return (await Storage()).removeItem(...x) },
			async field(...x){ return (await Storage()).key(...x) },
			async fields(){ return (await Storage()).keys() },
			async get(field){ return (await Storage()).getItem(field) },
			async has(field){ return (await this.get(field)) !== null },
			async iterate(...x){ return (await Storage()).iterate(...x) },
			async set(field, value){ return (await Storage()).setItem(field, value) },
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
				else if(update === false) return (this.delete(identifier), null)
				return user
			}
		}

		//shared actions
		async function Storage(){ return await window_modules.import.package(window_modules, 'Storage') }
	}


}, function get_directory(app_directory = {}){
	return {
		base: {
			component(...x){ return this.web('component', ...x) },
			design(...x){ return this.web('design', ...x) },
			function(...x){ return this.web('function', ...x) },
			Mixin(...x){ return this.web('Mixin', ...x) },
			module(...x){ return this.web('module', ...x) },
			package: new URL('https://unpkg.com/'),
			prototype(...x){ return this.web('prototype', ...x) },
			Type(...x){ return this.web('Type', ...x) },
			url(...x){ return new URL(`https://unpkg.com/bxy/${x.join('/')}`) },
			web(...x){ return this.url('web', ...x) },
			worker(...x){ return this.web('worker', ...x) }
		},
		get(notation){ return window.modules.dot.get({window}, notation) },
		locator(type, ...x){
			const locator = {name: x[1] ? x[1]:x[0]}
			if(x[0] instanceof URL === false && locator.name in this.modules){
				locator.url = this.modules[locator.name].url
				locator.notation = this.modules[locator.name].notation
			}
			else locator.url = x[0]
			if(type in this.url){
				const url = this.url[type]
				locator.url = typeof url === 'function' ? url.call(this.url, locator.url.includes('.js') === false ? `${locator.url}.js`:locator.url):new URL(locator.url, url)
			}

			if(locator.url instanceof URL !== true) locator.url = new URL(locator.url)

			return locator
		},
		modules: {
			Storage: {
				url: 'localforage@1.7.1/dist/localforage.nopromises.min.js',
				notation: 'window.localforage'
			}
		}
	}

}, function get_import(window_modules){

	return {
		function: load_function,
		package: load_package,
		web: load_web
	}

	//shared actions
	async function load_web(...x){
		const locator = window_modules.directory.locator('web', ...x)
		const web_module = (await window_modules.http(locator.url)).module
		if(typeof locator.name === 'string'){
			Object.defineProperty(window_modules, locator.name, {value: web_module})
			return window_modules[locator.name]
		}
		return window_modules
	}

	async function load_function(...x){
		const locator = window_modules.directory.locator('function', ...x)
		return (await window_modules.http(locator.url)).module
	}

	async function load_package(...x){
		const locator = window_modules.directory.locator('package', ...x)
		if(locator.name && window_modules.has(locator.name)) return window_modules[locator.name]
		return await window_modules.assets(locator.url).then(()=>{
			if(locator.name && locator.notation){
				return window_modules.define(locator.name, {value: window_modules.directory.get(locator.notation)})
			}
			return window_modules
		})
	}
})