(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof(i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function EventEmitter(){
	const Events = await window.modules.import.class('Events')

	//exports
	return Base=>class extends Base{
		on(...x){ return on_event_listener(this, ...x) }
		off(...x){ return off_event_listener(this, ...x) }
		once(...x){ return once_event_listener(this, ...x) }
		dispatch(...x){ return dispatch_event(this, ...x) }
		disconnect(){ return (Events.delete(this),this) }
		disconnectedCallback(){
			this.disconnect()
			if(super.disconnectedCallback) super.disconnectedCallback()
		}
	}


	//scope actions
	function dispatch_event(emitter, ...x){
		const {data, event, options, type} = get_inputs(...x)
		if(event instanceof CustomEvent && 'dispatchEvent' in emitter) emitter.dispatchEvent(event)
		if(Events.has(emitter)){
			for(const listener of Events.get(emitter).listeners(type)){
				listener.apply(emitter, type, data, ...options)
			}
		}
		return this
	}

	function on_event_listener(emitter, ...x){
		const {listener, type} = get_inputs(...x)
		return (get_events(emitter).set(type,listener),emitter)
	}

	function off_event_listener(emitter, ...x){
		const {listener,type} = get_inputs(...x)
		if(listener && 'removeEventListener' in emitter) emitter.removeEventListener(type, listener, true)
		if(Events.has(emitter)) get_events(emitter).delete(type)
		return emitter
	}
	function get_events(emitter){ return Events.ensure(emitter) }

	function once_event_listener(emitter,...x){
		const {listener, type} = get_inputs(...x)
		function once_listener(...inputs){
			const {data} = get_inputs(...inputs)
			this.off(type, listener)
			listener.apply(emitter, type, data)
		}
		return emitter.on(type, once_listener)
	}

	function get_inputs(...x){
		return {
			event: x.filter(i=>i instanceof Event)[0] || null,
			get detail(){ return this.event && this.event.detail ? this.event.detail: null },
			get data(){ return this.event && this.event.data ? this.event.data:this.detail },
			get listener(){ return x.filter(i=>typeof i === 'function')[0]},
			get type(){ return x.filter(i=>typeof i === 'string')[0] || this.event.type },
			get options(){return x.filter(i=>(i instanceof Event && typeof(i)==='string' && typeof(i)==='function')===false)}
		}
	}


})