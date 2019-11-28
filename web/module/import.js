(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function Import(){
	const module_import = {assets: await window.modules.wait('modules.http.assets',true), class: load_class, component: extend('import.component'), content: extend('import.document'), data: extend('import.metadata'), design: load_design, document: extend('import.document'), element: extend('import.document'), export: load_es_module, function: load_function, global:load_global, internal: extend('import.internal'), json: load_json, meta: extend('import.metadata'), mixin: load_mixin, module: load_module, package: extend('import.package'), script: load_script, storage: storage_module, structure: load_structure, template: extend('import.document'), type: load_type, web: load_web, worker: extend('import.worker')}
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

	async function load_global(name){
		if(window.modules.dot.has(window, `${name}.prototyped`)) return window[name]
		http.assets(http.locator.prototype(name)).catch(console.error)
		return await wait(name, `${name}.prototyped`, true).catch(console.error)
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
	async function load_structure(){ return window.modules.has(arguments[0]) ? window.modules.get(arguments[0]):await load_base('structure', ...arguments) }
	async function load_type(){ return await load_base('type', ...arguments) }
	async function load_web(){ return await load_base('web', ...arguments) }

	function storage_module(){
		return {
			async clear(){ return await (await storage()).clear() },
			async count(){ return await (await storage()).length() },
			async delete(...x){ return await (await storage()).removeItem(...x) },
			async drop(...x){ return await (await storage()).dropInstance(...x) },
			get entries(){ return async ()=>await Promise.all((await this.fields()).map(async field=>[field, await this.get(field)])) },
			async field(...x){ return await (await storage()).key(...x) },
			async fields(){ return await (await storage()).keys() },
			async get(field){ return await (await storage()).getItem(field) },
			get has(){ return async field=>await this.get(field) !== null },
			get id(){ return `user@${window.modules.id.underscore(`${window.modules.window_locator}`)}` },
			async iterate(...x){ return await (await storage()).iterate(...x) },
			get json(){ return async ()=>storage_reduce(await this.entries()) },
			async load(...x){ return await storage(...x) },
			get meta(){ return storage_meta.call(this) },
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

		function storage_meta(){
			return new Proxy(this,{get})
			//scope actions
			function get(target,field){
				if(field==='entries') return meta_entries.bind(target)
				else if(field==='get'||field==='set') return meta_field.bind(target)
				else if(field==='json') return meta_json.bind(target)
				else if(field === 'text') return meta_text.bind(target)
				return field in target ? target[field]:null
			}
			async function meta_entries(){ return await metadata().then(async meta=>(await this.entries()).map(entry=>[entry[0],meta.incoming(entry[1])])) }
			async function meta_field(){ return await metadata().then(async meta=>meta.incoming(arguments.length===2?await this.set(arguments[0],meta.outgoing(arguments[1])):await this.get(arguments[0]))) }
			async function meta_json(){ return storage_reduce(await meta_entries.call(this)) }
			async function meta_text(){ return await metadata().then(async meta=>meta.outgoing(await meta_json.call(this))) }
			async function metadata(){ return window.modules.has('meta') ? window.modules.meta:await window.modules.import('meta') }
		}
		function storage_reduce(){ return arguments[0].map(entry=>({[entry[0]]: entry[1]})).reduce((json, entry)=>Object.assign(json, entry), {}) }

		async function user_storage(update){
			let user = await this.has(this.id) ? await this.get(this.id):null
			if(window.modules.is.data(update)) await this.set(this.id, user = Object.assign({}, user, update, {updated: new Date()}))
			else if(update === false) (await this.delete(this.id), user = null)
			return user
		}

	}

	function uniform_locator(url, create=(...x)=>URL.join(...x)){ return (is.url.text(url)?url=new URL(url):null,is.url(url)?url:create(url)) }

})
