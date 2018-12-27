(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Emitter.Events', {value:await module(...inputs)}); return window.modules.has('Emitter.Events')?window.modules.get('Emitter.Events'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const events = Symbol('EventEmitter events')

	//exports
	return class Events extends Map{
		static get create(){ return create_events }
		static get delete(){ return delete_events }
		static get ensure(){ return ensure_events }
		static get get(){ return get_events }
		static get has(){ return has_events }
		static get set(){ return set_events }
		connect(name){ return this.has(name) ? super.get(name):super.set(name, new Set()) }
		delete(name, listener){
			if(this.has(name)){
				if(listener) this.listeners(name).delete(listener)
				else super.delete(name)
			}
			return this
		}
		disconnect(){
			for(const set of this.values()) set.clear()
			return this.clear()
		}
		get(name){ return this.has(name) ? super.get(name):new Set() }
		listeners(event){
			if(event instanceof CustomEvent) event = event.type
			return this.get(event)
		}
		set(name, listener){
			const set = this.connect(name)
			if(!set.has(listener)) set.add(listener)
			return this
		}
	}

	//scope actions
	function create_events(...x){ return new Events(...x) }
	function ensure_events(emitter,...x){ return has_events(emitter) ? emitter[emitter]:set_events(emitter,...x) }
	function delete_events(emitter){
		let emitter_events = get_events(emitter)
		if(emitter_events){
			emitter_events.disconnect()
			delete emitter[events]
		}
		return emitter_events = null
	}
	function get_events(emitter){ return has_events(emitter) ? emitter[events]:null }
	function has_events(emitter){ return events in emitter }
	function set_events(emitter, ...x){ return emitter[events] = create_events(...x) }
})