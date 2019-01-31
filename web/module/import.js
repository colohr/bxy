(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function Import(){
	const module_import = {assets: await window.modules.wait('modules.http.assets',true), class: load_class, component: extend('import.component'), content: extend('import.document'), data: extend('import.metadata'), design: load_design, document: extend('import.document'), element: extend('import.document'), export: load_es_module, function: load_function, internal: extend('import.internal'), json: load_json, meta: extend('import.metadata'), mixin: load_mixin, module: load_module, package: extend('import.package'), script: load_script, storage: storage_module, type: load_type, web: load_web, worker: extend('import.worker')}
	const {http, is, wait} = window.modules
	for(const field in module_import) load_scoped_module[field] = module_import[field]

	//exports
	return window.modules.define('import',{value:load_scoped_module})

	//scope actions
	function extend(name){ return async function extended_functionality(){ return (await load_function(`function.${name}`)).apply(module_import,arguments) } }

	async function load_base(type, name, result = 'module'){ return http(http.locator[type](name)).then(response=>response[result]).catch(console.trace) }

	async function load_design(){ return await http.assets(http.locator.design(...arguments)).catch(console.trace) }

	async function load_class(name){
		if(window.modules.has(name)) return window.modules.get(name)
		await http.assets(http.locator.class(name)).catch(console.trace)
		await wait(`modules.${name}`)
		return window.modules.get(name)
	}

	function load_es_module(locator){ return import(`${uniform_locator(locator, x=>http.locator.unpack(x))}`) }

	async function load_function(name){
		if(window.modules.has(name)) return window.modules.get(name)
		else if(window.modules.has(`function.${name}`)) return window.modules.get(`function.${name}`)
		return await http.module(http.locator.function(name)).catch(console.error)
	}

	async function load_json(name){ return await load_base('json', name, 'data').catch(console.error) }

	async function load_mixin(){ return await load_base('mixin', ...arguments) }

	async function load_module(locator, ...wait_notations){
		let is_es = locator.extension === 'mjs'
		if(is_es===false && locator.searchParams.has('type')) is_es = locator.searchParams.get('type') === 'module'
		return (is_es ? load_es_module(locator):http.module(locator)).then(on_load)
		//scope actions
		async function on_load(){ return (wait_notations.length>0? await wait(...wait_notations):null,arguments[0]) }
	}

	async function load_scoped_module(locator, ...notation){
		if(arguments.length === 0) return null
		locator = uniform_locator(locator, x=>http.locator.module(x))
		const definition = notation.filter(is.TF)[0] !== true
		const option = notation.filter(is.data)[0] || {}
		if(!option.name && locator.file === 'index.js') option.name = locator.at('./').basename
		else if(!option.name) option.name = locator.file.replace(`.${locator.extension}`,'')
		if(definition && window.modules.has(option.name)) return window.modules.get(option.name)
		return load_module(locator,...notation.filter(is.text))
	}

	async function load_script(){ return await load_base('script', ...arguments) }
	async function load_type(){ return await load_base('type', ...arguments) }
	async function load_web(){ return await load_base('web', ...arguments) }

	function storage_module(){
		return {
			async clear(){ return await (await storage()).clear() },
			async count(){ return await (await storage()).length() },
			async delete(...x){ return await (await storage()).removeItem(...x) },
			async drop(...x){ return await (await storage()).dropInstance(...x) },
			async field(...x){ return await (await storage()).key(...x) },
			async fields(){ return await (await storage()).keys() },
			async get(field){ return await (await storage()).getItem(field) },
			async has(field){ return await (await this.get(field)) !== null },
			get id(){ return `user@${window.modules.id.underscore(`${window.modules.window_locator}`)}` },
			async iterate(...x){ return await (await storage()).iterate(...x) },
			async load(...x){ return await storage(...x) },
			get name(){ return window.modules.get('Storage._config.name') || window.modules.http.locator.storage() },
			async set(field, value){ return await (await storage()).setItem(field, value) },
			user: user_storage
		}

		//scope actions
		async function storage(...configuration){
			if(window.modules.has('Storage') === false) await window.modules.import.package('Storage')
			if(window.modules['storage-name']) return window.modules.Storage
			if(configuration.length === 0) configuration = [{name: window.modules.http.locator.storage()}]
			window.modules.Storage.config(...configuration)
			window.modules['storage-name'] = window.modules.Storage._config.name
			return window.modules.Storage
		}

		async function user_storage(update){
			let user = await this.has(this.id) ? await this.get(this.id):null
			if(window.modules.is.data(update)) await this.set(this.id, user = Object.assign({}, user, update, {updated: new Date()}))
			else if(update === false) (await this.delete(this.id), user = null)
			return user
		}
	}

	function uniform_locator(url, create=(...x)=>URL.join(...x)){ return (is.url.text(url)?url=new URL(url):null,is.url(url)?url:create(url)) }

})
