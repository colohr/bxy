(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.scope.frame', {value:await module(...inputs)}); return window.modules.has('function.scope.frame')?window.modules.get('function.scope.frame'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(WebFrame){
	const uid = await window.modules.import.function('uid')
	const {dot,is} = window.modules
	const frame_source = Symbol('frame source')
	if(window.modules.has('meta') === false) await window.modules.import('meta')

	function ScopeFrame(){
		if(this instanceof ScopeFrame === false) return new ScopeFrame(...arguments)
		this.element = window.modules.element.create('iframe', {id: uid('frame-'), src: 'about:blank'})
		this.module_origin = HTMLElement.SourceCode.url('bxy/web/modules.js')
		this.page_origin = URL.get()

	}
	ScopeFrame.prototype = {
		attach: attach_source,
		connect(){ return embed_scope_frame(this) },
		create(){ return create_source(this.id) },
		get container(){ return this.controller.body },
		get controller(){ return this.element.contentDocument },
		evaluate(){ return this.scope.eval(...arguments) },
		get(){ return dot.get(this, ...arguments) },
		has(){ return dot.has(this, ...arguments) },
		get id(){ return this.element.getAttribute('id') },
		import: import_source,
		get modules(){ return this.get('scope.modules') },
		off(){ return (this.web.off(...arguments),this) },
		on(){ return (this.web.on(...arguments), this) },
		once(){ return (this.web.once(...arguments), this) },
		pack: import_project_package,
		get scope(){ return this.element.contentWindow },
		send(){ return (this.web.send(...arguments),this) },
		set(){ return dot.set(this, ...arguments) },
		get source(){ return frame_source in this ? this[frame_source]:this[frame_source]=this.create() }
	}


	//exports

	ScopeFrame.embed = embed_scope_frame
	ScopeFrame.source = create_source
	return ScopeFrame

	//scope actions
	async function attach_source(root, on){
		if(root) (root.shadowRoot || root).appendChild(this.element)
		await on.source.call(this,this)
		return (this.controller.replaceChild(this.controller.importNode(this.source.documentElement, true), this.controller.documentElement), await this.pack(on.meta))
	}

	function create_source(label){ return window.document.implementation.createHTMLDocument(label || 'document frame') }

	async function embed_scope_frame(frame){
		return new Promise(frame_promise)

		//scope actions
		function frame_promise(success){
			frame.evaluate(`(async (WebFrame)=>{
				if(window.modules.has('meta') === false) await window.modules.import('meta');
				window.web = new (WebFrame(true));
				window.web.send('environment');
			})(${WebFrame.toString()})`);

			frame.web.state('connected', once_connected)

			//scope actions
			async function once_connected(){
				frame.web.once('environment', once_environment_configured)
				frame.web.send('environment')
				function once_environment_configured(){ success(frame) }
			}
		}
	}


	async function import_modules(frame){
		let script = frame.controller.querySelector(`script[src="${frame.module_origin}"]`)
		if(script !== null) return  script
		const modules_script = window.modules.constructor.element
		script = frame.controller.createElement('script')
		script.setAttribute('defer', '')
		script.setAttribute('src', frame.module_origin)
		script.setAttribute('embedded', '')
		frame.controller.head.appendChild(modules_script.base.cloneNode(true))
		return new Promise(import_modules_promise)
		//scope actions
		async function import_modules_promise(success,failed){
			frame.scope.addEventListener('modules', on_modules)
			frame.scope.URL = window.URL
			script.onerror = error=>failed(error)
			frame.controller.head.appendChild(script)
			//scope actions
			function on_modules(){ success(script) }
		}
	}

	async function import_project_package(on_project_meta=(x=>x)){
		await import_modules(this)
		//const package_url = 'meta' in window.modules.constructor.element.xml ? URL.join('package.meta'):URL.join('package.json')
		let package_file = 'package.json'
		if(window.modules.constructor.element.xml.meta){
			this.modules.constructor.element.setAttribute('meta', '')
			package_file = 'package.meta'
		}
		const package_url = this.page_origin.at(package_file)
		const Project = (await this.modules.import('project')).constructor
		delete this.modules.project
		this.project = new Project(await on_project_meta.call(this,await this.modules.import.meta(package_url),this.source))
		this.web = new (WebFrame())(this.page_origin, this)
		return this.connect()
	}

	async function import_source(locator){
		console.log({locator})
		if(window.modules.is.url(locator) === false) locator = URL.get(locator)
		return await this.evaluate(await window.modules.http(locator).then(({content})=>content))
	}



}, function WebFrame(is_frame){
	const window_location = window.location
	return class WebFrame extends Object{
		constructor(url = window_location,frame){
			super(url)
			const custom_events = typeof self.CustomEvent !== 'undefined'
			this.status = {connected: false}
			this.detail = detail
			this.dispatch = dispatch
			this.emit = emit
			this.off = off
			this.on = on
			this.once = once
			this.state = state
			this.send = send
			this.dispatchEvent = (...x)=>self.dispatchEvent(...x)
			this.addEventListener = (...x)=>self.addEventListener(...x)
			this.removeEventListener = (...x)=>self.removeEventListener(...x)

			this.addEventListener('message', event=>this.dispatch(event))
			if(is_frame){
				this.postMessage = (...x)=>self.top.postMessage(...x)
				this.status.connected = this.connected = true
				this.send('state', {state: 'connected'})
			}
			else{
				//this.addEventListener('message', event=>this.dispatch(event))
				this.postMessage = (...x)=>frame.scope.postMessage(...x)
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
					if(typeof event.data === 'string' && event.data.indexOf('type: environment') >= 0) event = {type: 'environment'}
					else event = typeof event.data === 'string' ? JSON.parse(event.data):event.data
				}
				this.dispatchEvent(message(event.type, detail(event)))
				return (event = null, this)
			}

			function emit(type, detail){ return this.dispatch({data: {type, detail}}) }

			function message(type, data){
				if(custom_events) return new CustomEvent(type, {detail: data})
				return new MessageEvent(type, {data})
			}

			function off(type, listener){ return (this.removeEventListener(type, listener, false), this) }

			function on(type, listener){ return (this.addEventListener(type, listener, false), this) }

			function once(type, listener){
				let once = event=>(listener(event), this.removeEventListener(type, once, false), once = null)
				return (this.addEventListener(type, once, false), this)
			}

			function send(){
				try{ this.postMessage(window.modules.meta.outgoing({type: arguments[0], detail: arguments[1]})) }
				catch(error){ (console.error(error), console.dir(arguments), this.postMessage(JSON.stringify({type: arguments[0], detail: arguments[1]}))) }
				return this
			}

			function state(type, listener = ()=>{}){
				if(type in this.status && this[type] === true) return listener(true)
				else this.once('state', event=>update_status.call(this, detail(event)))
				return this

				//scope actions
				function update_status(data){
					if(data && data instanceof Object && data.state) this.status[data.state] = true
					this.connected = this.status.connected === true
					listener(true)
				}
			}
		}
	}
})
