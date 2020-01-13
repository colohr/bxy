(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.window',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.window')?_.get('function.window'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(WindowLocation) {
	const {is} = window.modules
	const instance = {
		listeners:['popstate', 'message'],
		title: 'popup',
		opened: null,
		features(size){ return (size =size||this.size, `height=${this.size},width=${this.size},alwaysLowered`) },
		get size(){ return Math.min(window.innerHeight, window.innerWidth) * 0.7 }
	}

	function WindowController(target=window, url=null, state){
		if(this instanceof WindowController === false) return new WindowController(...arguments)
		this.target = target
		this.url = is.url(url) ? url:URL.get(url || this.target.location.href)
		this.location = new WindowLocation(this,state)
	}
	WindowController.prototype={
		get history(){ return this.target.history },
		listen: window_listen,
		get parameters(){ return this.url.searchParams },

	}
	WindowController.open = window_open

	//exports
	return WindowController

	//scope actions
	function window_open(url, title=instance.title, size=instance.size){
		if(is.nothing(instance.opened) || instance.opened.closed){
			instance.opened = window.open(url, title,instance.features(size))
		}
		return instance.opened
	}

	function window_listen(type, listener, options){
		if(instance.listeners.includes(type)) this.target.addEventListener(type,listener,options)
		else throw new Error(`WindowController: Invalid event type. Types -> ${instance.listeners}`)
		return this
	}

},[
	function WindowLocation(){
		const {is} = window.modules
		//exports
		return class WindowLocation{
			constructor(controller, state){
				this.controller=controller
				this.state = state
			}
			backward(){ return go_backward.apply(this, arguments) }
			get field(){ return this.meta.field }
			forward(){ return go_forward.apply(this, arguments) }
			get history(){ return this.controller.history }
			get id(){ return this.meta.id }
			get meta(){ return this.state.meta = this.state.meta || {} }
			push(){ return push.apply(this, arguments) }
			replace(){ return replace.apply(this, arguments) }
			get state(){ return this[Symbol.for('state')] = this[Symbol.for('state')] || {} }
			set state(value){ return is.data(value) ? this[Symbol.for('state')] = value:null }
			to(){ return go_to_index.apply(this, arguments) }
			get url(){ return this.controller.url }
			variables(state = {}, title = window.title, url){ return [state, title, url || this.url.href] }
		}

		//scope actions
		function go_backward(history = window.history){ return this.history.back() }
		function go_forward(history = window.history){ return this.history.forward() }
		function go_to_index(index, history = window.history){ return this.history.go(index) }
		function push(variables, history = window.history){ return this.history.pushState(...variables) }
		function replace(variables, history = window.history){ return this.history.replaceState(...variables) }
	}

])
