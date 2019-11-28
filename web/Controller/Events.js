/*Event listener for components*/
const event_listeners = Symbol('EventEmitter listeners')
const event_prefix = '@'
//exports
export default class Events{
	static delete = instanceDelete
	static instance = instance
	count(){ return listener_count.apply(this, arguments) }
	disconnect(type, listener){ return remove_all_listeners.apply(this, arguments) }
	emit(type, ...inputs){ return emit.apply(this, arguments) }
	listeners(type){ return listeners.apply(this, arguments) }
	off(type, listener){ return off.apply(this, arguments) }
	on(type, listener){ return on.apply(this, arguments) }
	once(type, listener){ return once.apply(this, arguments) }
	send(type, detail){ return this.emit(type, detail) }
	sends(type){ return this.count(type) > 0 }
	get types(){ return event_names.call(this) }
}


//scope actions
function emit(type, ...inputs){
	return Array.from(this.listeners(type)).reduce(reduce, this)
	//scope actions
	function reduce(emitter, listener){ return (listener.apply(emitter, inputs),emitter) }
}

function event_names(){
	return event_listeners in this ? Object.keys(this[event_listeners]).map(identity):[]
	//scope actions
	function identity(type){ return typeof type === 'string' ? type.slice(1):type }
}

function event_type(type){ return typeof type === 'string' ? `${event_prefix}${type}`:(valid_type(type) ? type:null)  }

export function instance(component){ return event_listeners in  component ? component[event_listeners]:component[event_listeners] = new Events() }

export function instanceDelete(component){
	if(event_listeners in component){
		component[event_listeners].disconnect()
		delete component[event_listeners]
	}
	return true
}

function listener_count(){ return event_listeners in this ? listeners.apply(this, arguments).size:0 }

function listeners(type){
	if(valid_type(type = event_type(type))){
		this[event_listeners] = this[event_listeners] || {}
		return this[event_listeners][type] = this[event_listeners][type] || new Set()
	}
	return new Set()
}

function off(type, listener){
	if(valid_type(type = event_type(type)) === false && valid_listener(listener) === false) return (this[event_listeners] = {}, this)
	if(event_listeners in this === false || type in this[event_listeners] === false) return this
	if(valid_listener(listener) === false) return (delete this[event_listeners][type], this)
	if(this[event_listeners][type].has(listener)) this[event_listeners][type].delete(listener)
	else for(const item of this[event_listeners][type]){
		if(item.listener === listener){
			this[event_listeners][type].delete(item)
			break
		}
	}
	if(this[event_listeners][type].size===0) delete this[event_listeners][type]
	return this
}

function on(type, listener){ return (valid_type(type) && valid_listener(listener) ? listeners.call(this, type).add(listener):null, this) }

function once(type, listener){
	function one(){ (this.off(type, one), listener.apply(this, arguments)) }
	return (one.listener = listener, this.on(type, one))
}

function remove_all_listeners(){ return off.apply(this, arguments) }

function valid_type(type){ return typeof type === 'string' || typeof type === 'symbol' }

function valid_listener(listener){ return typeof listener === 'function' }

function remove_next_listener(type, listener){
	for(const item of this[event_listeners][type]){
		if(item === listener || item.listener === listener){
			this[event_listeners][type].splice(this[event_listeners][type].indexOf(item), 1)
			break
		}
	}
}