(WebEmitter=>WebEmitter)(function WebEmitterApi(Base = Object){
	const EmitterEvent = (emitter, notifier, type, detail)=>{
		return new CustomEvent(type, Object.assign({
			bubbles: emitter.shadowRoot ? Boolean(notifier.host.dataset.emitterBubbles):true,
			composed: emitter.shadowRoot ? Boolean(notifier.host.dataset.emitterComposed):false
		}, {detail}))
	}

	//exports
	return class Emitter extends Base{
		dispatch(...x){ return get_emitter(this).dispatch(...x) }
		on(...x){ return get_emitter(this).on(...x) }
		off(...x){ return get_emitter(this).off(...x) }
	}

	//shared actions
	function get_emitter(web_emitter){
		const listeners = get_listeners(web_emitter)

		//returning value
		return {
			dispatch(name, data){ return (listeners.dispatch(name, data), this) },
			on(name, callback){
				let listener = null
				if(!listeners.has(name)) listener = listeners.set(listeners.create(name)).get(name)
				else listener = listeners.get(name)
				if(!listener.callbacks.has(callback)) listener.callbacks.add(callback)
				return this
			},
			off(name, callback){
				let listener = listeners.get(name)
				if(typeof callback === 'function'){
					listener.callbacks.delete(callback)
					return this
				}
				listeners.remove(listener)
				return this
			}
		}
	}

	function get_listeners(emitter){
		const notifier = emitter.shadowRoot ? emitter.shadowRoot:self || this
		return {
			add(listener){ return (notifier.addEventListener(listener.type, listener.callback, false), listener) },
			create(name){
				const listener = {
					callbacks: new Set(),
					name: this.name(name),
					type: this.type(name)
				}
				listener.callback = function listener_callback(event){ for(const call of listener.callbacks) call(event.detail) }
				return listener
			},
			get data(){ return emitter.listener_data ? emitter.listener_data:emitter.listener_data=new Map() },
			dispatch(name, data){ return notifier.dispatchEvent(this.event(name, data)) },
			event(name, data){ return EmitterEvent(emitter, notifier, this.type(name), data) },
			get(name){ return this.data.get(this.name(name)) },
			has(name){ return this.data.has(this.name(name)) },
			name(type){ return type.replace(Base.name, '').trim() },
			remove(listener){ return (listener ? (notifier.removeEventListener(listener.type, listener.callback, false), this.data.delete(listener.name)):true, this) },
			set(listener){ return (this.data.set(listener.name, this.add(listener)), this) },
			type(name){ return name.indexOf(Base.name) === 0 ? name:`${Base.name} ${name}` }
		}
	}
})

