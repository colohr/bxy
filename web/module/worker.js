(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('worker',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('worker')?_.get('worker'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(load_worker_content) {
	const window_location = new URL(window.location.href)
	class WebWorker extends (self.constructor.name === 'Window'?Worker:Object){
		static get create(){ return create_worker }
		static get embed(){ return embed_worker }
		static get load(){ return load_web_workers }
		static get script(){ return load_web_worker_from_script }
		constructor(url=window_location){
			super(url)
			const custom_events = typeof self.CustomEvent !== 'undefined'
			this.status = {connected:false}
			this.detail = detail
			this.dispatch = dispatch
			this.emit = emit
			this.off = off
			this.on = on
			this.once = once
			this.state = state
			this.send = send

			if(self.constructor.name !== 'Window'){
				this.dispatchEvent = (...x)=>self.dispatchEvent(...x)
				this.addEventListener = (...x)=>self.addEventListener(...x)
				this.removeEventListener = (...x)=>self.removeEventListener(...x)
				this.postMessage = (...x)=>self.postMessage(...x)
				self.addEventListener('message', event=>this.dispatch(event))
				this.status.connected = this.connected = true
				this.send('state', {state: 'connected'})
			}
			else{
				this.addEventListener('message', event=>this.dispatch(event))
				this.status.connected = this.connected = true
				this.state('connected')
			}

			//scope actions
			function detail(event){
				if(event instanceof Object){
					try{
						if('detail' in event) return event.detail
						else if('data' in event) return event.data
					}
					catch(error){
						console.error(error);
						if('data' in event) return event.data
					}
				}
				return null
			}

			function dispatch(event){
				try{ event = typeof event.data === 'string' ? window.modules.meta.incoming(event.data):event.data }
				catch(error){
					console.error(error);
					console.dir(event);
					if(typeof event.data === 'string' && event.data.indexOf('type: environment') >= 0) event = {type:'environment'}
					else event = typeof event.data === 'string' ? JSON.parse(event.data):event.data
				}
				this.dispatchEvent(message(event.type, detail(event)))
				return (event = null, this)
			}
			function emit(type, detail){ return this.dispatch({data:{type,detail}}) }
			function message(type, data){
				if(custom_events) return new CustomEvent(type, {detail: data})
				return new MessageEvent(type, {data})
			}
			function off(type, listener){ return (this.removeEventListener(type, listener, false), this) }
			function on(type, listener){ return (this.addEventListener(type,listener,false), this) }
			function once(type,listener){
				let once = event=>(listener(event),this.removeEventListener(type,once,false),once=null)
				return (this.addEventListener(type, once, false),this)
			}
			function send(){
				try{ this.postMessage(window.modules.meta.outgoing({type: arguments[0], detail: arguments[1]})) }
				catch(error){ (console.error(error), console.dir(arguments), this.postMessage(JSON.stringify({type: arguments[0], detail: arguments[1]}))) }
				return this
			}
			function state(type, listener = ()=>{}){
				if(type in this.status && this[type] === true) return listener(true)
				else this.once('state', event=>update_status.call(this,detail(event)))
				return this
				//scope actions
				function update_status(data){
					if(data && data instanceof Object && data.state) this.status[data.state] = true
					this.connected = this.status.connected===true
					listener(true)
				}
			}
		}
	}

	//exports
	return window.modules.set('WebWorker', WebWorker)

	//scope actions
	function create_worker(...content){ return new WebWorker(window.URL.createObjectURL(new Blob(content, {type: 'text/javascript'}))) }

	async function embed_worker(...worker){
		worker = create_worker(...(await load_worker_content(WebWorker.toString(),...worker)))
		return new Promise(geo_worker_promise)
		//scope actions
		function geo_worker_promise(success){
			worker.state('connected', once_connected)
			//scope actions
			async function once_connected(){
				worker.once('environment', once_environment_configured)
				worker.send('environment')
				function once_environment_configured(){ success(worker) }
			}
		}
	}

	function load_web_worker_from_script(script){
		if(script instanceof HTMLElement === false) script = window.document.querySelector(script)
		return create_worker(script.textContent)
	}

	function load_web_workers(){
		let worker = null
		for(const script of  Array.from(window.document.querySelectorAll('script[web-worker=""]'))){
			if(worker === null) worker = []
			worker.push(script.textContent)
		}
		worker = Array.isArray(worker)? create_worker(...worker):{}
		for(const script of  Array.from(window.document.querySelectorAll('script[web-worker]'))){
			if(script.getAttribute('web-worker').length){
				worker[script.getAttribute('web-worker')] = create_worker(script.textContent)
			}
		}
		return worker
	}
}, function load_worker_content(){
	//exports
	return load_worker_assets(...arguments)

	//scope actions
	async function load_worker_assets(worker_type, ...assets){
		return [
			`const window = this.window = this;const window_location = this.window_location = new URL("${window.location.href}");`,
			await load_modules(worker_type),
			await load_environment(...assets)
		]
	}

	async function load_assets(...urls){
		const intact = urls.filter(window.modules.is.TF)[0]
		urls = urls.filter(window.modules.is.not.TF)
		const delimiters =  intact ? ['','','']:['\n',';\n','\n\n']
		return await Promise.all(urls.map(get_content)).then(contents=>contents.join(delimiters[2]))

		//scope actions
		function get_content(url){
			if(window.modules.is.text(url) && url.indexOf('http') === 0) url = new URL(url)
			if(url instanceof URL) return window.modules.http(url).then(({content})=>`${delimiters[0]}${content.trim()}${delimiters[1]}`)
			return url
		}
	}

	async function load_environment(...assets){ return `\nasync function web_worker_environment(){\n${await load_assets(...assets)}\n}` }

	async function load_modules(worker_type){
		const module_names = ['modules.is', 'modules.id','modules.dot','URL.prototyped','modules.import','modules.meta', 'Event.prototyped']
		const assets = await modules_assets(
			window.modules.http.locator.module('is'),
			window.modules.http.locator.module('phrase'),
			window.modules.http.locator.module('dot'),
			window.modules.http.locator.module('wait'),
			window.modules.http.locator.prototype('URL'),
			window.modules.http.locator.module('http'),
			window.modules.http.locator.module('import'),
			window.modules.http.locator.module('meta'),
			window.modules.http.locator.prototype('Event'))
		//scope actions
		return await load_assets(`
const modules = this.modules = {
	get ['@modules'](){ return this.get('@package.modules')  },
	define(notation, {value}){ return this.set(notation, value) },
	get(notation){
		if(this.has(notation) === false) return null
		return 'dot' in this ? this.dot.get(this, notation):this[notation]
	},
	has(notation){ return notation in this || ('dot' in this && this.dot.has(this, notation)) },
	set(notation, value){
		if('dot' in this) this.dot.set(this, notation, value)
		else this[notation] = value
		return value
	}, 
	get url(){ return URL.get },
	get storage(){ return this.import.storage() },
	tick(action){ return setTimeout(action, 10) },
	get window_locator(){ return "${window.modules.window_locator}" }
};
`,
`(async function module_assets(){ 
	await worker_environment(${JSON.stringify(await worker_environment_data())},arguments[0]);
	${worker_type}
	//exports
	this.worker = new WebWorker();
	await web_worker_environment();
	if(typeof on_environment === 'function') await on_environment();
	(environment_ready(), worker.once('environment', environment_ready));
	//scope actions
	function environment_ready(){ worker.send('environment') }
	${worker_environment.toString()}
})(${assets})`)
		//scope actions
		async function modules_assets(...locations){
			return `async function(){
				for(let item of [${(await Promise.all(locations.map(get_module))).join(',')}]) {
					const name = item.name;
					if((item = item()) instanceof Promise) {
						try{ await item }
						catch(error){  console.log(name); console.trace(error); }
						item=null
					}
				}
				return (await modules.wait(...${JSON.stringify(module_names)}),true)
			}`
			//scope actions
			async function get_module(location){ return `function ${window.modules.id.underscore(location.basename)}(){ return (function resolve(){ return ${await load_assets(location, true)} })() }` }
		}
	}

	async function worker_environment(data){
		modules['@url'] = new URL(data['@url']);
		modules['@meta'] = typeof(data['@meta']) === 'string' ? new URL(data['@meta']):data['@meta']
		modules['@package'] = data['@package'];
		if(await arguments[1]()){
			modules.set('project', set_locators(data.project))
			modules.set('project.package', data.package)
			this.postMessage('modules')
		}
		//scope actions
		function set_locators(data, locators={}){
			for(const entry of Object.entries(data)) {
				if(URL.is(entry[1])) modules.dot.set(locators, entry[0],new URL(entry[1]))
				else modules.dot.set(locators, entry[0], entry[1])
			}
			return (data=null,locators)
		}
		//await (await modules.wait('modules.meta', 'Event.prototyped',true)).constructor.load();
		//modules.directory['@meta'] = data.directory['@meta']?new URL(data.directory['@meta']):data.directory['@meta']
		//modules.set('directory.package', data.directory.package)
		//modules.set('directory.base', set_locators(data.directory.base))
	}

	function worker_environment_data(){

		return window.modules.import.function('notate').then(on_notate)
		//scope actions
		function on_notate(notate){
			return {['@meta']:window.modules['@meta'], ['@package']: window.modules['@package'], ['@url']:window.modules['@url'], package: get_package(), project: get_project()}

			//scope actions
			function get_directory(base={}){
				for(const field in  window.modules.directory.base){
					if(typeof window.modules.directory.base[field] === 'function') {
						base[field] = window.modules.directory.base[field]('')
						if(base[field].extension) base[field].pathname= base[field].pathname.replace(base[field].basename, '')
						if(base[field].pathname.endsWith('//')) base[field].pathname= base[field].pathname.slice(0,base[field].pathname.length-2)
					}
					else base[field] = window.modules.directory.base[field]
				}
				return {base,package: window.modules.directory.package, ['@meta']: window.modules['@meta']}
			}

			function get_package(data=Object.assign({}, window.modules.project.package)){ return (delete data.project, delete data.locations, data) }

			function get_project(project=window.modules.project){
				return Object.keys(notate(project)).reduce(reduce, {})
				//scope actions
				function reduce(data, notation){
					const dots = []
					for(const dot of notation.split('.')){
						const field = (dots.push(dot),dots.join('.'))
						if(window.modules.dot.get(project, field) instanceof URL){
							if(field in data === false) data[field]=`${window.modules.dot.get(project, field)}`
						}
					}
					return data
				}
			}
		}
	}
})
