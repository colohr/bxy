(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('worker',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('worker')?_.get('worker'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(load_worker_content, worker_environment) {
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
			this.data = detail
			this.detail = self.detail = detail
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
				this.status.connected=this.connected=true
				this.send('state',{state:'connected'})
			}
			else{
				this.addEventListener('message',event=>this.dispatch(event))
				this.state('connected')
			}
			//scope actions
			function detail(event){
				if(event instanceof Object){
					if('detail' in event) return event.detail
					else if('data' in event) return event.data
				}
				return null
			}
			function dispatch(event){
				event = typeof event.data === 'string' ? JSON.parse(event.data):event.data
				this.dispatchEvent(message(event.type, detail(event)))
				return (event = null, this)
			}

			function emit(type, detail){ return this.dispatch({data:{type,detail}}) }

			function message(type, data){
				if(custom_events) return new CustomEvent(type, {detail: data})
				return new MessageEvent(type, {data})
			}
			function off(type, listener){
				this.removeEventListener(type, listener, false)
				return this
			}
			function on(type, listener){
				this.addEventListener(type,listener,false)
				return this
			}
			function once(type,listener){
				let once = (event)=>{
					listener(event)
					this.removeEventListener(type,once, false)
					once = null
				}
				this.addEventListener(type, once, false)
				return this
			}
			function send(){
				this.postMessage(JSON.stringify({type:arguments[0],detail:arguments[1]}))
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
	function create_worker(...content){
		content.unshift('\nconst worker = new WebWorker();\n')
		content.unshift(WebWorker.toString())
		content.unshift(`const window_location=new URL("${window.location.href}");\n`)
		content.unshift(`this.FormData = Map;`)
		content.unshift(`const window = this.window = this;\n`)
		return new WebWorker(window.URL.createObjectURL(new Blob(content, {type: 'text/javascript'})))
	}

	async function embed_worker(...worker){
		worker = create_worker(...(await load_worker_content(...worker)))
		return new Promise(geo_worker_promise)
		//scope actions
		function geo_worker_promise(success){
			worker.state('connected', once_connected)
			//scope actions
			async function once_connected(){
				worker.once('environment', once_environment_configured)
				worker.send('environment', await worker_environment())
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
	async function load_worker_assets(...assets){ return [await load_contents(), await load_assets(...assets)] }

	async function load_assets(...urls){
		return await Promise.all(urls.map(get_content)).then(contents=>contents.join('\n\n'))

		//scope actions
		function get_content(url){
			if(window.modules.is.text(url) && url.indexOf('http') === 0) url = new URL(url)
			if(url instanceof URL) return window.modules.http(url).then(({content})=>`\n${content.trim()};\n`)
			return url
		}
	}

	async function load_contents(){
		return await load_assets(
			window.modules.directory.base.prototype('URL'),
			window.modules.directory.base.worker('modules'),
			window.modules.directory.base.module('dot'),
			window.modules.directory.base.module('is'),
			window.modules.directory.base.module('wait'),
			window.modules.directory.base.module('http')
		)
	}
},
function worker_environment(){
	return window.modules.import.function('notate').then(on_notate)
	//scope actions
	function on_notate(notate){
		return {directory: get_directory(), project: get_project()}

		//scope actions
		function get_directory(base={}){
			for(const field in  window.modules.directory.base){
				if(typeof window.modules.directory.base[field] === 'function') {
					base[field] = window.modules.directory.base[field]('index.js')
				}
				else base[field] = window.modules.directory.base[field]
			}
			return {base,package: window.modules.directory.package}
		}

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
})
