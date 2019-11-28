(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('http',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('http')?_.get('http'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function (Assets, Response, Option, get_locator){
	if(typeof this.FormData === 'undefined') this.FormData = Object
	const HTTPModule = {
		assets(){ return Assets.load_assets },
		connected(){ return is_connected },
		content(){ return get_http_content_type(true) },
		content_headers(){ return get_http_content_type('headers') },
		content_types(){ return window.modules.is.dictionary.content },
		data(){ return get_http_setting('post', arguments[0], {'Content-Type': 'application/json', 'Accept': 'application/json'}) },
		blob(){ return get_http_setting(Option({as:'blob'})) },
		export(){ return get_http_evaluated_module },
		import(){ return get_http_evaluated_module },
		module(){ return get_http_evaluated_module },
		get(){ return get_http_setting(arguments[0]) },
		post(){ return get_http_setting(arguments[0]) },
		search(){ return get_http_setting(arguments[0]) },
		put(){ return get_http_setting(arguments[0]) },
		locator(){ return get_locator() },
		load(){ return get_http_load },
		type(){ return get_http_content_type() },
		Option(){ return Option },
		Response(){ return Response }
	}

	//exports
	return Assets(new Proxy(get_http_resource, {
		get(o, field){
			if(field in HTTPModule) return HTTPModule[field](field)
			else if(field in o) return (typeof (o[field]) ? o[field].bind(o):o[field])
			else if(field === Symbol.toPrimitive) return undefined
			return null
		},
		has(o, field){ return field in HTTPModule || field in o },
		ownKeys(target){ return Array.from(new Set(Object.getOwnPropertyNames(target).concat(Object.keys(HTTPModule)))) },
		set(o, field, value){ return (Assets[field] = value, true) },
	}), window.modules)

	//scope actions
	function get_http_content_type(header = false){
		return new Proxy(window.modules.is.dictionary.content , {get: get_value})
		//scope actions
		function get_category_value({categories}, field){
			for(const category in categories) if(categories[category].includes(field)) return `${category}/${field}`
			return `text/${field}`
		}
		function get_value(o, field, type = null){ return (type = field in o.alias ? o.alias[field]:get_category_value(o, field), header === false ? type:(type = {'Content-Type': type}, header === 'headers' ? {headers: type}:type)) }
	}

	async function get_http_evaluated_module(){ return (await get_http_resource(...arguments)).import() }

	function get_http_load(...asset){
		const field = asset.filter(window.modules.is.text)[0] || null
		return get_http_resource(...asset.filter(window.modules.is.not.text)).then(on_response).catch(console.trace)
		//scope actions
		function on_response(response){ return field ? response[field]:response }
	}

	function get_http_setting(){
		const method = (Array.from(arguments).filter(item=>typeof(item)==='string')[0] || 'get').toUpperCase()
		const type = Array.from(arguments).filter(item=>typeof (item) === 'string')[1] || null
		const preset_headers = Array.from(arguments).filter(item=>item instanceof Object && (item instanceof Option === false))[0] || null
		const preset_options = Array.from(arguments).filter(item=>item instanceof Option)[0] || {method, headers: {}}
		return function Setting(location, options, headers){ return get_http_resource(location, get_method_options(options, headers)) }

		//scope actions
		function get_method_options(input, headers){
			const options = Object.assign(Option(preset_options), type === 'data' ? {body:input}:input)
			if(preset_headers) options.headers = Object.assign(options.headers, preset_headers)
			if(headers) options.headers = Object.assign(options.headers, headers)
			return options
		}
	}

	function get_http_request(load, error, options){
		const request = new XMLHttpRequest()
		request.addEventListener('load', load, false)
		request.addEventListener('error', error, false)
		return options.listen ? options.listen(request):request
	}

	function get_http_resource(location, options){
		options = typeof options === 'object' && options !== null ? options:{}
		return new Promise((success, error)=>{
			const locator = get_http_request(on_load, on_error, options)
			locator.responseType = options.as || 'text'
			locator.open(options.method || 'GET', location)
			set_http_headers(locator, options, location).send(get_body())
			//scope actions
			function get_body(){
				if(typeof options.body === 'object' && options.body !== null){
					if(options.body instanceof FormData) return options.body
					try{ return JSON.stringify(options.body) }
					catch(e){ console.error(e) }
				}
				return undefined
			}
			function on_error(e){ return (console.warn(location),error(e)) }
			function on_load(){ return success(Response(locator, options.headers)) }
		})
	}

	function is_connected(){
		return new Promise(success=>{
			try{ if(window.navigator.onLine === false) return success(false) }
			catch(e){}
			const request = new XMLHttpRequest()
			request.open('GET', 'https://google.com')
			request.addEventListener('load', ()=>success(true), false)
			request.addEventListener('error', ()=>success(false), false)
		})
	}

	function set_http_headers(request, options){
		const headers = options.headers || {}
		if(window.modules.is.url(arguments[2]) && arguments[2].extension) Object.assign(headers,window.modules.http.content[arguments[2].extension])
		if(options.body instanceof FormData && headers['Content-Type']) delete headers['Content-Type']
		if(headers) for(let name in headers) request.setRequestHeader(name, headers[name])
		return request
	}

},[function Assets(){
	const scope = this.constructor.name === 'Window' ? 'window':'worker'
	if(scope === 'worker') return worker_assets_loader
	return function assets_loader(http,results={},url=(location,origin)=>new URL(location,origin||URL.base())){
		return (http.load_assets = function load(...assets){
			return new Promise(function load_assets_promise(success, error){
				return next()

				//scope actions
				function load_items(...items){
					return Promise.all(items.map(create_item))
					//scope actions
					async function create_item(item){
						if(window.modules.is.text(item.url)){
							if(!item.url.includes('/')) return window.modules.wait(item.url)
							if(!window.modules.is.url.text(item.url)) item.url = url(item.url)
						}
						if('wait' in item) await window.modules.wait(...(Array.isArray(item.wait)?item.wait:[item.wait]))
						return item.module ? load_module(item):load_element(item)
					}
				}

				async function load_module(item, value = null){
					const {calls, url, inputs, module, notation} = Object.assign({inputs: [], calls: true, url: null, module: null}, item)
					let name = typeof(module) === 'string' ? module:null
					value = notation ? window.modules.data.get(window, notation):null
					if(value === null) value = await load_module_value()
					if(name === null && typeof(value) === 'function') name = value.name
					return name !== null ? results[name] = value:value

					//scope actions
					async function load_module_value(){
						const loaded = await load_type(`${url}`.includes('.json') ? 'json':'text')
						return call_loaded() ? await loaded(...inputs):loaded
						//scope actions
						function call_loaded(){ return calls === true && typeof(loaded) === 'function' && (loaded.name.indexOf('export') === 0 || !('prototype' in loaded)) }
						async function load_type(type, x){ return (x = await http(url).then(response=>response[type]()),type==='json'?x:await eval(x)) }
					}
				}

				function next(){
					for(const i of assets) return (assets.splice(0, 1), load_items(...(Array.isArray(i) ? i:[i]).map(item=>Object.assign({async: true, defer: true}, (typeof(item) === 'string' || item instanceof URL) ? {url: item}:item))).then(next).catch(error))
					return success(results)
				}
			})
		},http)
	}
	//scope actions
	function has_item({element, container, module, notation, selector, tag, source, locator}){
		if(element && window.modules.element.defined(element)) return true
		if(module && window.modules.has(module)) return true
		if(notation && window.modules.dot.has(window, notation)) return true
		if(selector && window.modules.element.has(selector, document[container])) return true
		if(source && window.modules.element.has(`${tag || ''}[${source}="${locator || ''}"]`, document[container])) return true
		return false
	}

	function load_element(item, asset=null){
		return new Promise(function load_element_asset(load_success, load_error){ (function add_asset(options= asset_options()){ return has_item(options) ? load_success():(options[options.source]=item.url, document[options.container].appendChild(window.modules.element.create(options.tag, Object.assign(options,item), load_success, load_error)), asset = null) })() })
		//scope actions
		function asset_options(){ return {get container(){ return this.tag === 'link' ? 'head':'body' }, extension: `${item.url}`.split('.').filter((x, i, l)=>i === l.length - 1)[0], get tag(){ return ['css', 'html'].includes(this.extension) ? 'link':'script' }, get source(){ return this.tag === 'link' ? 'href':'src' }, locator: item.url} }
	}

	function worker_assets_loader(http){
		return (http.load_assets =  async function import_scripts(...location){
			location = location.reduce(reduce_asset, [])
			return importScripts(...location)
			//scope actions
			function reduce_asset(list, asset){
				if(Array.isArray(asset) === false){
					if(asset instanceof URL) list.push(asset)
					else if(asset instanceof Object) list.push(asset.url)
					else if(URL.is(asset)) list.push(asset)
					return list
				}
				return asset.reduce(reduce_asset, list)
			}
		},http)
	}

}, function Response(){
	function Response(locator,headers){
		if(this instanceof Response === false) return new Response(...arguments)
		this.locator = locator
	}
	Response.prototype = {
		get content(){ return this.locator.responseText },
		get content_type(){ return this.locator.getResponseHeader('Content-Type') || 'text/plain' },

		get data(){ return get_json.call(this,true) },
		get document(){ return get_http_document(this.content, this.media_type) },
		async eval(){ return await get_module(this.content) },
		async export(exporter){ return await get_module(this.content, exporter) },
		async import(){ return await get_module(this.content) },
		async json(...x){ return get_json.call(this,...x) },
		get media_type(){ return this.content_type.split(';')[0] },
		get meta(){ return get_meta.call(this,true) },
		get module(){
			try{ return get_module(this.content).catch(e=>log_error.call(this,'module', e)) }
			catch(e){ return log_error.call(this,'module', e) }
		},
		get response(){ return this.locator.response },
		async text(){ return this.locator.responseText },
		async yaml(...x){ return get_meta.call(this,...x) }
	}

	//exports
	return Response

	//scope actions
	function get_http_document(text, content_type = 'text/html'){ return new DOMParser().parseFromString(text, content_type) }

	function get_json(return_response = false, default_value = null){
		try{ return JSON.parse(this.locator.response) }
		catch(e){
			if(return_response === true) return this.locator.response
			else if(default_value === null) console.error(e)
		}
		return default_value
	}

	function get_meta(return_response = false, default_value = null){
		try{ return window.modules.meta.data(this.locator.response) }
		catch(e){
			if(return_response === true) return this.locator.response
			else if(default_value === null) console.error(e)
		}
		return default_value
	}

	async function get_module(content, exporter){ return await (typeof (exporter) === 'function' ? await exporter(content):await eval(content)) }

	function log_error(type, error, ...x){
		if(window.modules.log) window.modules.log.bug(`http.${type} -> ${this.locator.responseURL}`, error, this.locator, ...x)
		else console.error(`http.${type} -> ${this.locator.responseURL}`, error, this.locator, ...x)
	}

}, function Option(){

	function Option(){
		if(this instanceof Option === false) return new Option(...arguments)
		Object.assign(this, ...arguments)
	}
	Option.prototype = {method:'GET'}
	//exports
	return Option

}],function get_locator(){
	const unpkg = new URL(`https://unpkg.com/`)
	const locators = {class: null, classes: {folder: 'class'}, component: null, data: null, external(){ return unpkg.origin === window.modules.get('@url').origin }, function: {prefix: 'function.'}, json: {extension: 'json',folder:'data'}, meta: {folder: 'data', extension: 'meta'}, mixin: {extension: 'js'}, module: null, package: null, prototype: {suffix: '.prototype'}, script: {index: true}, storage:storage_name, type: null, unpack(...x){ return unpkg.at(...x) }, web: {folder: './'}, worker: null}
	return new Proxy(locators,{ get(o,field){ return field in o ? get_url(field, o[field]):Reflect.get(o,field) || get_url(field, {local:true}) } })

	//scope actions
	function get_url(folder, setting){

		if(window.modules.is.function(setting)) return setting
		setting = Object.assign({extension:'js'}, setting)
		if('folder' in setting) folder = setting.folder
		return function get_locator(locator){
			if(window.modules.is.url(locator) === false) locator = setting.local ? URL.join(...arguments):window.modules.get('@url').at(folder, locator)
			if(setting.prefix) set_prefix(locator,locator.basename)
			if(setting.suffix) set_suffix(locator, locator.basename, locator.extension)
			if(setting.index) locator = locator.file !== 'index.js' ? locator.at('index.js'):locator
			if(!locator.extension || (locator.extension !== setting.extension)) locator.extension = setting.extension || 'js'
			return locator
		}
		//scope actions
		function set_prefix(locator,basename){
			if(basename.startsWith(setting.prefix) === false){
				locator.pathname = locator.pathname.replace(locator.basename, `${setting.prefix}${locator.basename}`)
			}
		}
		function set_suffix(locator, basename, extension){
			if(extension) basename = basename.replace(`.${extension}`, '')
			if(basename.endsWith(setting.suffix) === false){
				locator.pathname = locator.pathname.replace(locator.basename, `${basename}${setting.suffix}`)
			}
		}
	}

	function storage_name(name=null){
		if(window.modules['storage-name']) name = window.modules['storage-name']
		else if(window.modules.has('project.package')) name = window.modules.id.underscore([window.modules.get('project.package.name'),'version', window.modules.get('project.package.version')].filter(window.modules.is.text).join(' '))
		else name = window.modules.id.underscore(`${URL.join().hostname} @ ${URL.join().pathname}`)
		return name
	}
})

