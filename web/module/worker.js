(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('worker',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('worker')?_.get('worker'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const window_location = new URL(window.location.href)
	class WebWorker extends (typeof window === 'undefined'?Object:Worker){
		static get create(){ return create_worker }
		static get embed(){ return embed_worker }
		static get load(){ return load_web_workers }
		static get script(){ return load_web_worker_from_script }
		constructor(url=window_location){
			super(url)
			this.status = {connected:false}
			if(typeof window === 'undefined'){
				this.dispatchEvent = (...x)=>self.dispatchEvent(...x)
				this.addEventListener = (...x)=>self.addEventListener(...x)
				this.removeEventListener = (...x)=>self.removeEventListener(...x)
				this.postMessage = (...x)=>self.postMessage(...x)
				self.addEventListener('message', event=>this.dispatch(event))
				this.status.connected=true
				this.send('state',{state:'connected'})
			}
			else{
				this.addEventListener('message',event=>this.dispatch(event))
				this.state('connected')
			}
		}
		get connected(){ return this.status.connected === true }
		dispatch(event){
			event = JSON.parse(event.data)
			this.dispatchEvent(new CustomEvent(event.type, {detail: event.detail}))
			return (event=null,this)
		}
		off(type, listener){
			this.removeEventListener(type, listener, false)
			return this
		}
		on(type, listener){
			this.addEventListener(type,listener,false)
			return this
		}
		once(type,listener){
			let once = (event)=>{
				listener(event)
				this.removeEventListener(type,once)
				once = null
			}
			this.addEventListener(type, once, false)
			return this
		}
		state(type, listener = ()=>{}){
			if(type in this.status && this[type] === true) return listener(true)
			else this.once('state', (event)=>listener(this.status[event.detail.state] = true))
			return this
		}
		send(type, detail){
			this.postMessage(JSON.stringify({type,detail}))
			return this
		}
	}


	//exports
	window.modules.set('WebWorker', WebWorker)
	return WebWorker

	//scope actions
	function create_worker(...content){
		content.unshift('\nconst worker = new WebWorker();\n')
		content.unshift(WebWorker.toString())
		content.unshift(`const window_location=new URL("${window.location.href}");\n`)
		return new WebWorker(window.URL.createObjectURL(new Blob(content, {type: 'text/javascript'})))
	}

	async function embed_worker(url){ return create_worker((await window.modules.http(url)).content) }

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
})
