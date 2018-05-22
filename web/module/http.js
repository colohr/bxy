(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('http', {value:await module(...inputs)}); return window.modules.has('http')?window.modules.get('http'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(content_types, get_assets_loader){
	const loaders = [
		async function set_modules_http(options={}){
			try{
				await (await get_http_resource(window.modules.directory.base.prototype('URL.prototype.js'), {'Content-Type': 'application/javascript'})).module
				await (await get_http_resource(window.modules.directory.base.prototype('HTMLElement.prototype.js'), {'Content-Type': 'application/javascript'})).module
				window.modules.define('data', {value: await (await get_http_resource(window.modules.directory.base.function('function.data.js'), {'Content-Type': 'application/javascript'})).module})
				window.modules.define('element', {value: await (await get_http_resource(window.modules.directory.base.function('function.element.js'), {'Content-Type': 'application/javascript'})).module})
				window.modules.define('phrase', {value: await (await get_http_resource(window.modules.directory.base.function('function.phrase.js'), {'Content-Type': 'application/javascript'})).module})
				window.modules.define('wait', {value: await (await get_http_resource(window.modules.directory.base.function('function.wait.js'), {'Content-Type': 'application/javascript'})).module})
			}
			catch(e){console.log(e)}

			//returning value
			return new Proxy(get_http_resource, {
				get(o, field){
					switch(field){
						case 'base': return window.modules.directory.base
						case 'assets': return options.assets
						case 'content':
							return get_http_content_type(content_types, true)
						case 'content_headers':
							return get_http_content_type(content_types, 'headers')
						case 'content_types':
							return content_types
						case 'data':
							return get_http_setting('post', field, {'Content-Type': 'application/json', 'Accept': 'application/json'})
						case 'loader': return options.assets_loader
						case 'get':
						case 'post':
						case 'search':
						case 'put':
							return get_http_setting(field)
						case 'type':
							return get_http_content_type(content_types)

					}
					return field in options ? options[field]:null
				},
				set(o, field, value){ return (options[field] = value, true) }
			})

			//shared actions
			function get_http_content_type(x, header = false){
				return new Proxy(x, {get: get_value})

				//shared actions
				function get_category_value({categories}, field){
					if(field === 'text') return 'text/plain'
					for(const category of categories){
						if(categories[category].includes(field)) return `${category}/${field}`
					}
					return `text/${field}`
				}

				function get_value(o, field, type = null){ return (type = field in o.alias ? get_category_value(o, field):o.alias[field], header === false ? type:(type = {'Content-Type': type}, header === 'headers' ? {headers: type}:type)) }
			}

			function get_http_document(text, content_type = 'text/html'){ return new DOMParser().parseFromString(text, content_type) }

			function get_http_response(locator, headers = {}){
				return {
					get data(){ return get_json() },
					get document(){ return get_http_document(locator.responseText, headers['Content-Type']) },
					async eval(){ return await get_module(locator.responseText) },
					async export(exporter){ return await get_module(locator.responseText, exporter) },
					async json(){ return get_json() },
					get module(){ return get_module(locator.responseText) },
					get response(){ return locator.response },
					async text(){ return locator.responseText }
				}

				//shared actions
				function get_json(){
					try{ return JSON.parse(locator.response) }
					catch(e){ console.error(e) }
					return null
				}

				async function get_module(content, exporter){ return await (typeof(exporter) === 'function' ? await exporter(content):await eval(content)) }
			}

			function get_http_setting(method, type, preset_headers){
				method = method.toUpperCase()
				return (location, options, headers)=>{
					return get_http_resource(location, get_method_options(options))

					//shared actions
					function get_method_options(input){
						const options = Object.assign({method, headers: {}}, typeof options === 'object' && options !== null ? options:{})
						if(type === 'data') options.body = input
						else if(typeof input === 'object') Object.assign(options, input)
						if(preset_headers) options.headers = Object.assign(options.headers, preset_headers)
						if(headers) options.headers = Object.assign(options.headers, headers)
						return options
					}
				}
			}

			function get_http_request(load, error, upload){
				const request = new XMLHttpRequest()
				if(upload){
					request.upload.addEventListener('load', load, false)
					request.upload.addEventListener('error', error, false)
					if(typeof upload === 'object'){
						if(upload.progress) request.upload.addEventListener('progress', upload.progress, false)
						if(upload.canceled) request.upload.addEventListener('abort', upload.canceled, false)
					}
				}
				else{
					request.addEventListener('load', load, false)
					request.addEventListener('error', error, false)
				}
				return request
			}

			function get_http_resource(location, options){
				options = typeof options === 'object' && options !== null ? options:{}
				const {body, headers, method} = options
				return new Promise((success, error)=>{
					const locator = get_http_request(on_load, on_error, options.upload)

					if(headers) for(let name in headers) locator.setRequestHeader(name, headers[name])

					locator.open(method || 'GET', location)

					if(!options.upload){
						locator.responseType = 'text'
						locator.send(get_body())
					}

					//shared actions
					function get_body(){
						if(typeof body === 'object' && body !== null){
							try{ return JSON.stringify(body) }
							catch(e){ console.error(e) }
						}
						return undefined
					}

					function on_error(e){ return error(e) }

					function on_load(){ return success(get_http_response(locator, headers)) }

				})
			}

		},
		function set_modules_assets_loader(http){
			http.assets_loader = get_assets_loader(http)
			http.assets = http.assets_loader(window.modules)
			return http
		},
		async function set_modules_assets(http){
			try{ await http.assets({url: http.base.Type('Fragment.js'), module: 'Fragment'}) }
			catch(e){console.error(e)}
			return http
		}
	]

	//exports
	return loaders[0]().then(loaders[1]).then(loaders[2]).catch(console.error)

},function get_assets_loader(http){
	//exports
	return function assets_loader(results={},url=(location,origin)=>new URL(location,origin||window.location.origin)){
		//exports
		return function load(...assets){
			return new Promise(function load_assets_promise(success, error){
				return next()

				//shared actions
				async function load_element(item, asset = null){
					return new Promise(function load_element_asset(load_success, load_error){
						return (function get_asset(options){
							return has_item(options) ? true:(options[options.source]=item.url, document[options.container].appendChild(window.modules.element.create(options.tag, options, load_success, load_error)), asset = null)
						})({get container(){ return this.tag === 'link' ? 'head':'body' }, extension: `${item.url}`.split('.').filter((x, i, l)=>i === l.length - 1)[0], get tag(){ return ['css', 'html'].includes(this.extension) ? 'link':'script' }, get source(){ return this.tag === 'link' ? 'href':'src' }, locator:item.url }) === true ? load_success():true
					})
				}

				function load_items(...items){
					return Promise.all(items.map(create_item))

					//shared actions
					async function create_item(item){
						if(typeof(item.url) === 'string'){
							if(item.url.indexOf('/') === -1) return window.modules.wait(item.url)
							if(item.url.indexOf('http') !== 0) item.url = url(item.url)
						}
						if('wait' in item) await window.modules.wait(...(Array.isArray(item.wait)?item.wait:[item.wait]))
						return item.module ? load_module(item):load_element(item)
					}
				}

				async function load_module(item, value = null){
					const {calls, url, inputs, module, notation} = Object.assign({inputs: [], calls: true, url: null, module: null}, item)
					let name = typeof(module === 'string') ? module:null
					value = notation ? web.data.get(window, notation):null
					if(value === null) value = await load_module_value()
					if(name === null && typeof(value) === 'function') name = value.name

					//exports
					return name !== null ? results[name] = value:value

					//shared actions
					async function load_module_value(){
						const loaded = await load_type(`${url}`.includes('.json') ? 'json':'text')
						return call_loaded() ? await loaded(...inputs):loaded
						//shared actions
						function call_loaded(){ return calls === true && typeof(loaded) === 'function' && (loaded.name.indexOf('export') === 0 || !('prototype' in loaded)) }
						async function load_type(type, x){ return (x = await http(url).then(response=>response[type]()),type==='json'?x:await eval(x)) }
					}

				}

				function next(){
					for(const i of assets) return (assets.splice(0, 1), load_items(...(Array.isArray(i) ? i:[i]).map(item=>Object.assign({async: true, defer: true}, (typeof(item) === 'string' || item instanceof URL) ? {url: item}:item))).then(next).catch(error))
					return success(results)
				}
			})
		}
	}
	//shared actions
	function has_item({element, container, module, notation, selector, tag, source, locator}){
		if(element && window.modules.element.defined(element)) return true
		if(module && window.modules.has(module)) return true
		if(notation && window.modules.data.has(window, notation)) return true
		if(selector && window.modules.element.has(selector, document[container])) return true
		if(source && window.modules.element.has(`${tag || ''}[${source}="${locator || ''}"]`, document[container])) return true
		return false
	}
}, async function get_content_types(){
	return new Promise(wait_for_content)
	//shared actions
	function content_types(){
		return {
			alias: {
				es: 'application/ecmascript',
				form: 'multipart/form-data',
				svg: 'image/svg+xml',
				jpg: 'image/jpeg',
				js: 'application/javascript',
				stream: 'application/octet-stream',
				url: 'application/x-www-form-urlencoded'
			},
			categories: {
				application: ['ecmascript', 'json', 'javascript', 'octet-stream', 'pdf', 'pkcs12', 'svg+xml', 'x-www-form-urlencoded', 'xml', 'ogg', 'vnd.mspowerpoint'],
				audio: ['midi', 'mpeg', 'ogg', 'webm', 'wave', 'wav', 'x-pn-wav', 'x-wav'],
				image: ['png', 'jpeg', 'gif', 'ico', 'webp'],
				multipart: ['form-data', 'byteranges'],
				video: ['mp4', 'webm', 'ogg']
			}
		}
	}
	function wait_for_content(success){
		return typeof(document)==='undefined'||(typeof(document)!=='undefined'&&document.body)?content_loaded():document.window.addEventListener('DOMContentLoaded', content_loaded, false)
		//shared actions
		function content_loaded(){ return success(content_types()) }
	}
})

