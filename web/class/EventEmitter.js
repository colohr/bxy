(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('EventEmitter',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('EventEmitter')?_.get('EventEmitter'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(Emitter, Interface) { return (Emitter.Interface = Interface(Emitter), Emitter) },
[function EventEmitter(){
	if(typeof this.modules === 'undefined' && typeof require === 'function') return require('events')
	const default_max_listeners = 10
	const event_listeners = Symbol('EventEmitter listeners')
	const event_prefix = '@'
	const maximum_listeners = Symbol('Maximum listeners for event type')

	//exports
	return class EventEmitter{
		static get defaultMaxListeners(){ return default_max_listeners }
		addListener(type, listener){ return this.on.apply(this,arguments) }
		emit(type, ...inputs){ return emit.apply(this, arguments) }
		eventNames(){ return event_names.call(this) }
		getMaxListeners(){ return get_max_listeners.apply(this, arguments) }
		listenerCount(type){ return listener_count.apply(this,arguments)}
		listeners(type){ return listeners.apply(this, arguments) }
		off(type, listener){ return off.apply(this, arguments) }
		on(type, listener){ return on.apply(this, arguments) }
		once(type, listener){ return once.apply(this, arguments) }
		prependListener(type, listener){ return prepend_listener.apply(this,arguments) }
		prependOnceListener(type, listener){ return prepend_once_listener.apply(this,arguments) }
		removeAllListeners(type, listener){ return remove_all_listeners.apply(this,arguments) }
		removeListener(type, listener){ return this.off.apply(this, arguments) }
		setMaxListeners(maximum){ return set_max_listeners.apply(this,arguments) }
		rawListeners(type){ return raw_listeners.apply(this,arguments) }
	}

	//scope actions
	function added_listener(type, listener){
		if(listener_count.call(type) > get_max_listeners.call(this)) console.warn('MaxListenersExceededWarning: ',this)
		return this.emit('newListener', type, listener)
	}

	function emit(type,...inputs){
		for(const listener of this.listeners(type)) listener.apply(this, inputs)
		return this
	}

	function event_names(){
		return event_listeners in this ? Object.keys(this[event_listeners]).map(identity):[]
		//scope actions
		function identity(type){ return typeof type === 'string' ? type.slice(1):type  }
	}

	function event_type(type){ return typeof type === 'string' ? `${event_prefix}${type}`:type }

	function get_max_listeners(){ return maximum_listeners in this ? this[maximum_listeners]:default_max_listeners }

	function listener_count(type){ return event_listeners in this ? listeners.call(this,type).length:0  }

	function listeners(type){
		if(typeof type !== 'string' && typeof type !== 'symbol') return []
		this[event_listeners] = this[event_listeners] || {}
		type = event_type(type)
		return this[event_listeners][type] = this[event_listeners][type] || []
	}

	function off(type, listener){
		if(typeof(type)==='undefined' && typeof(listener)==='undefined') return (this[event_listeners] = {}, this)
		type = event_type(type)

		if(event_listeners in this === false || type in this[event_listeners] === false) return this

		if(typeof(listener) === 'undefined') return (delete this[event_listeners][type], this)

		for(const item of this[event_listeners][type]){
			if(item === listener || item.listener === item){
				removed_listener.call(this,type,this[event_listeners][type].splice(this[event_listeners][type].indexOf(item), 1)[0])
				break
			}
		}

		if(this[event_listeners][type].length === 0) delete this[event_listeners][type]
		return this
	}

	function on(type, listener, prepend=false){
		const action = prepend !== true ? 'push':'unshift'
		return (listeners.call(this, type)[action](listener), added_listener.call(this,type,listener))
	}

	function once(type, listener, prepend=false){
		function one(){ (this.off(type, one), listener.apply(this, arguments)) }
		one.listener = listener
		return this.on(type, one, prepend)
	}

	function prepend_listener(type, listener){ return on.call(this, type, listener, true) }
	function prepend_once_listener(type, listener){ return once.call(this, type, listener, true) }
	function remove_all_listeners(type){ return off.call(this,type) }
	function removed_listener(type, listener){ return this.emit('removeListener', type, listener) }
	function set_max_listeners(maximum){ return (typeof maximum === 'number' && isNaN(maximum) === false && maximum > -1 ? this[maximum_listeners]=maximum:null,this) }
	function raw_listeners(type){ return listeners.call(this,type) }

}], function Interface(EventEmitter){
	const InterfaceEvent = this.modules ? ('CustomEvent' in this ? this.CustomEvent:this.MessageEvent):create_node_event()
	const field = InterfaceEvent.name === 'MessageEvent' ? 'data':'detail'

	//exports
	return class EventInterface extends EventEmitter{
		constructor(adapter=null){ (super(), this.adapter = adapter) }
		addEventListener(type, listener){
			if(this.adapter) this.adapter.addEventListener(type,listener,false)
			return (listener.dispatches = true,this.on(type, listener))
		}

		dispatch(...event){
			if(event[0] instanceof InterfaceEvent === false) event = new InterfaceEvent(event[0], {[field]: event[1]})
			else event = event[0]
			return this.dispatchEvent(event)
		}
		dispatchEvent(event){
			if(this.adapter) this.adapter.dispatchEvent(event)
			return this.emit(event.type, event.detail)
		}
		has(type){ return this.count(type) > 0 }
		removeEventListener(type, listener){
			if(this.adapter) this.adapter.removeEventListener(type, listener, false)
			return this.off(type, listener)
		}
		send(type, detail){ return this.dispatch(type,detail) }
		sends(type){ return this.has(type) }
	}

	//scope actions
	function create_node_event(){
		return function NodeEvent(type,data){
			if(require('fxy').is.object(data)) data = data.detail
			this.type = type
			this.detail = require('fxy').is.object(data) ? data:require('fxy').meta.from(data)
			this.date = new Date()
		}
	}

})
