(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('http', {value:await module(...inputs)}); return window.modules.has('http')?window.modules.get('http'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(content_types, get_assets_loader){
	const loaders = [
		async function set_modules_http(options={}){

			//exports
			return new Proxy(get_http_resource, {
				get(o, field){
					switch(field){
						case 'base': return window.modules.directory.base
						case 'assets': return options.assets
						case 'connected': return is_connected
						case 'content':
							return get_http_content_type(true)
						case 'content_headers':
							return get_http_content_type('headers')
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
							return get_http_content_type()

					}
					return field in options ? options[field]:null
				},
				set(o, field, value){ return (options[field] = value, true) }
			})

			//scope actions
			function get_http_content_type(header = false){
				return new Proxy(content_types, {get: get_value})

				//scope actions
				function get_category_value({categories}, field){
					if(field === 'text') return 'text/plain'
					for(const category in categories){
						if(categories[category].includes(field)) return `${category}/${field}`
					}
					return `text/${field}`
				}

				function get_value(o, field, type = null){ return (type = field in o.alias ? o.alias[field]:get_category_value(o, field), header === false ? type:(type = {'Content-Type': type}, header === 'headers' ? {headers: type}:type)) }
			}

			function get_http_document(text, content_type = 'text/html'){ return new DOMParser().parseFromString(text, content_type) }

			function get_http_response(locator, headers = {}){
				return {
					get content(){ return locator.responseText },
					get data(){ return get_json(true) },
					get document(){ return get_http_document(locator.responseText, headers['Content-Type']) },
					async eval(){ return await get_module(locator.responseText) },
					async export(exporter){ return await get_module(locator.responseText, exporter) },
					async json(...x){ return get_json(...x) },
					get module(){ try{ return get_module(locator.responseText).catch(e=>log_error('module',e)) }catch(e){ return log_error('module',e) } },
					get response(){ return locator.response },
					async text(){ return locator.responseText }
				}

				//scope actions
				function get_json(return_response=false, default_value=null){
					try{ return JSON.parse(locator.response) }
					catch(e){
						if(return_response === true) return locator.response
						else if(default_value === null) console.error(e)
					}
					return default_value
				}
				function log_error(type, error, ...x){
					if(window.modules.log) window.modules.log.bug(`http.${type} -> ${locator.responseURL}`, error , locator,...x)
					else console.error(`http.${type} -> ${locator.responseURL}`, error, locator, ...x)
				}
				async function get_module(content, exporter){ return await (typeof(exporter) === 'function' ? await exporter(content):await eval(content)) }
			}

			function get_http_setting(method, type, preset_headers){
				method = method.toUpperCase()
				return (location, options, headers)=>{
					return get_http_resource(location, get_method_options(options, headers))
				}

				//shared actions
				function get_method_options(input, headers){
					const options = Object.assign({method, headers: {}}, type === 'data' ? {body:input}:input)
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
					locator.responseType = 'text'
					locator.open(options.method || 'GET', location)
					set_http_headers(locator, options).send(get_body())
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
					function on_load(){ return success(get_http_response(locator, options.headers)) }
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
				if(options.body instanceof FormData && headers['Content-Type']) delete headers['Content-Type']
				if(headers) for(let name in headers) request.setRequestHeader(name, headers[name])
				return request
			}


		},
		function set_modules_assets_loader(http){
			http.assets_loader = get_assets_loader(http)
			http.assets = http.assets_loader(window.modules)
			return http
		}
	]

	//exports
	return await loaders[0]().then(loaders[1]).catch(console.error)

},function get_assets_loader(http){
	//exports
	return function assets_loader(results={},url=(location,origin)=>new URL(location,origin||window.location.origin)){
		//exports
		return function load(...assets){
			return new Promise(function load_assets_promise(success, error){
				return next()

				//scope actions
				async function load_element(item, asset = null){
					return new Promise(function load_element_asset(load_success, load_error){
						return (function get_asset(options){
							return has_item(options) ? true:(options[options.source]=item.url, document[options.container].appendChild(window.modules.element.create(options.tag, Object.assign(options,item), load_success, load_error)), asset = null)
						})({get container(){ return this.tag === 'link' ? 'head':'body' }, extension: `${item.url}`.split('.').filter((x, i, l)=>i === l.length - 1)[0], get tag(){ return ['css', 'html'].includes(this.extension) ? 'link':'script' }, get source(){ return this.tag === 'link' ? 'href':'src' }, locator:item.url }) === true ? load_success():true
					})
				}

				function load_items(...items){
					return Promise.all(items.map(create_item))

					//scope actions
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
					let name = typeof(module) === 'string' ? module:null
					value = notation ? window.modules.data.get(window, notation):null
					if(value === null) value = await load_module_value()
					if(name === null && typeof(value) === 'function') name = value.name

					//exports
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
		}
	}
	//scope actions
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
	//scope actions
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
		//scope actions
		function content_loaded(){ return success(content_types()) }
	}
})

