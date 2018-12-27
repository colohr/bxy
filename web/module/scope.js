((Scope,...x)=>Scope(...x))(function Scope(environments){
	environments = environments()
	const available = Symbol('available')
	const unavailable = Symbol('unavailable')
	const name = get_scope_name()
	const scope_environment = get_scope_environment()

	//exports
	return get_scope_exporter('scope')({ 
		availability,
		environment: scope_environment,
		environments,
		exporter: get_scope_exporter,
		name,
		properties: get_scope_properties
	},['web_module','web_worker','window'])

	//scope actions
	function availability(of){
		try{
			if(typeof of === 'string') of = eval(of)
			if(typeof of === 'function') return of() === true ? available:unavailable
			return available
		}
		catch(error){ return unavailable }
	}

	function get_scope_exporter(field=null){
		switch(scope_environment){
			case 'node_module': return (...inputs)=>(defines(inputs)?module.exports[field]=inputs[0]:module.exports=inputs[0])
			case 'web_module': return (...inputs)=>(defines(inputs)?window.modules.set(field, inputs[0]):inputs[0])
			case 'web_worker': return (...inputs)=>(defines(inputs)?this[field]=inputs[0]:inputs[0])
			case 'window': return (...inputs)=>(defines(inputs)?window[field]=inputs[0]:inputs[0])
		}
		return (...inputs)=>(defines(inputs)?{[field]:inputs[0]}:inputs[0])
		//scope actions
		function defines(inputs){
			if(field === null || inputs.length === 1) return false
			return inputs.length === 2 && inputs[1].includes(scope_environment)
		}
	}

	function get_scope_name(){ return this.constructor.name }

	function get_scope_properties(environment = this){
		return {
			get body(){ return availability(()=>typeof environment.document.body !== 'undefined') === available },

			get custom_event(){ return availability(()=>typeof CustomEvent === 'function') === available },

			get dispatch_event(){ return availability(()=>'dispatchEvent' in environment) === available },
			get document(){ return availability(()=>typeof environment.document !== 'undefined') === available },

			get emit(){ return availability(()=>'emit' in environment) === available },
			get event(){ return availability(()=>typeof Event === 'function') === available },
			get event_listener(){ return availability(()=>'addEventListener' in environment) === available },
			get export(){ return availability(`export const x = 1`) === available },
			get exports(){ return availability(()=>typeof exports !== 'undefined') === available },

			get global(){ return availability(()=>typeof global === 'object') === available },

			get head(){ return availability(()=>typeof environment.document.head !== 'undefined') === available },

			get import(){ return availability(`import('./x').then(()=>{}).catch(()=>{})`) === available },
			get import_from(){ return availability(`import * from './x';`) === available },
			get import_scripts(){ return availability(()=>typeof importScripts === 'function') === available },

			get location(){ return availability(()=>typeof environment.location !== 'undefined') === available },

			get module(){ return availability(()=>typeof module !== 'undefined') === available },

			get navigator(){ return availability(()=>typeof environment.navigator !== 'undefined') === available },

			get off(){ return availability(()=>'off' in environment) === available },
			get on(){ return availability(()=>'on' in environment) === available },
			get on_message(){ return availability(()=>'onmessage' in environment) === available },
			get once(){ return availability(()=>'on' in environment) === available },

			get process(){ return availability(()=>typeof process !== 'undefined') === available },
			get process_on(){ return availability(()=>typeof process.on === 'function') === available },
			get process_send(){ return availability(()=>typeof process.send === 'function') === available },
			get post_message(){ return availability(()=>'postMessage' in environment) === available },

			get require(){ return availability(()=>typeof require === 'function') === available },

			get self(){ return availability(()=>typeof self !== 'undefined') === available },
			get send(){ return availability(()=>'send' in environment) === available },

			get web_modules(){ return availability(()=>typeof environment.modules !== 'undefined') === available },
			get window(){ return availability(()=>typeof window !== 'undefined') === available }
		}
	}

	function get_scope_environment(){
		for(const entry of Object.entries(environments)){
			if(entry[1].name.includes(name)){
				if('availability' in entry[1]){
					if(availability(()=>entry[1].availability()) === available){
						return entry[0]
					}
				}
				else return entry[0]
			}
		}
		return 'unknown'
	}

}, function Environments(){
	//exports
	return {
		node_module:{
			applies_to:['process','global','this'],
			availability(){ return typeof process !== 'undefined' && typeof module !== 'undefined' && typeof require === 'function' },
			name:['Object'],
			type:'node'
		},
		web_module: {
			applies_to: ['self', 'this', 'window'],
			availability:()=> typeof this.modules !== 'undefined',
			name: ['Window', 'DedicatedWorkerGlobalScope'],
			type: 'web'
		},
		web_worker: {
			alias: ['self', 'this'],
			name: ['DedicatedWorkerGlobalScope'],
			type: 'web'
		},
		window: {
			alias: ['self', 'this', 'window'],
			name: ['Window'],
			type: 'web'
		}
	}

})
