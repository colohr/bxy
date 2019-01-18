(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function EventPrototype(capability){
	if(capability.Prototype) return
	const {is} = window.modules
	const protocol_value = Symbol('Event protocol')

	//exports
	define_event(this.MessageEvent)
	if(capability.CustomEvent) define_event(this.CustomEvent)
	this.Event.prototyped = 0.02


	//scope actions
	function define_event(Type){
		if('protocol' in Type.prototype === false) Object.defineProperty(Type.prototype, 'protocol', event_protocol())
		if('meta' in Type.prototype === false) Object.defineProperty(Type.prototype, 'meta', event_meta())
		if('detail' in Type.prototype === false) Object.defineProperty(Type.prototype, 'detail', event_detail())
	}
	function event_detail(){ return {get(){ return this.protocol.detail }} }
	function event_meta(){ return {get(){ return window.modules.meta.outgoing(this.protocol) }} }
	function event_protocol(){
		return {get, set}
		//scope actions
		function get(){
			if(protocol_value in this === false){
				if(this.constructor.name === 'MessageEvent'){
					if(is_entry(this) || is.object(this.data) === false){
						try{ this[protocol_value] = window.modules.meta.incoming(this.data) }
						catch(error){ this[protocol_value] = this.data }
					}
					else this[protocol_value] = this.data
				}
				else this[protocol_value] = {type: this.type, detail: this.detail}
				this[protocol_value] = event_protocol_value(this.type, this[protocol_value])
			}
			return this[protocol_value]
		}
		function set(value){ return this[protocol_value] = event_protocol_value(this.type, value) }
	}

	function event_protocol_value(type, value){
		if(is.data(value) === false) value = {detail: value}
		if('detail' in value === false) value = {detail: value}
		if(is.text(value.type) === false) value.type = type
		if(is.nothing(value.detail)) value.detail = null
		return value
	}

	function is_entry(event){ return event.constructor.name === 'MessageEvent' && event.type === 'message' && is.object(event.data) === false }

},
async function load_capability(){
	await window.modules.wait('modules.meta')
	return {
		CustomEvent: 'CustomEvent' in this,
		Event: 'Event' in this,
		MessageEvent: 'MessageEvent' in this,
		get Prototype(){ return this.Event && 'prototyped' in Event }
	}
})

