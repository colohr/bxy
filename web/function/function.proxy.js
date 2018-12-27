(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('proxy', {value:await module(...inputs)}); return window.modules.has('proxy')?window.modules.get('proxy'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(proxy_trap){

	//exports
	return proxy_trap

}, async function proxy_trap(){

	const {is} = window.modules

	//exports
	return {
		apply(applier){
			//A trap for a function call.
			return applier
		},
		construct(constructor){
			//A trap for the new operator.
			return constructor
		},
		defineProperty(setter){
			//A trap for Object.defineProperty.
			return setter
		},
		deleteProperty(remover){
			//A trap for the delete operator.
			return is.function(remover) ? on_delete(remover):default_delete
		},
		get(getter){
			//A trap for getting property values.
			return is.function(getter) ? on_get(getter):default_get
		},
		getOwnPropertyDescriptor(getter){
			//A trap for Object.getOwnPropertyDescriptor.
			return getter
		},
		getPrototypeOf(getter){
			//A trap for Object.getPrototypeOf.
			return getter
		},
		has(checker){
			//A trap for the in operator.
			return is.function(checker) ? on_has(checker):default_has
		},
		isExtensible(checker){
			//A trap for Object.isExtensible.
			return checker
		},
		ownKeys(getter){
			//A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
			return is.function(getter) ? on_fields(getter):default_fields
		},
		preventExtensions(checker){
			//A trap for Object.preventExtensions.
			return checker
		},
		set(setter){
			//A trap for setting property values.
			return is.function(setter) ? on_set(setter):default_set
		},
		setPrototypeOf(setter){
			//A trap for Object.setPrototypeOf.
			return setter
		}
	}

	//scope actions
	function default_delete(observed, field){
		try{ delete observed[field] }
		catch(error){ console.error(error) }
		return true
	}

	function default_fields(observed){
		try{ return get_list(Object.getOwnPropertyNames(observed), Object.keys(observed)) }
		catch(error){ console.error(error) }
		return []
	}

	function default_get(observed, field){
		let value = null
		try{
			if(field in observed){
				if(is.function(value = observed[field])){
					return value.bind(observed)
				}
			}
		}
		catch(error){ console.error(error) }
		return value
	}

	function default_has(observed, field){
		try{ return field in observed }
		catch(error){ console.error(error) }
		return false
	}

	function default_set(observed, field, value){
		try{ observed[field] = value }
		catch(error){ console.error(error) }
		return true
	}

	function get_list(...array){
		return Array.from(new Set(array.reduce(reduce_list, []))).filter(filter_nothing)

		//scope actions
		function filter_nothing(value){ return is.nothing(value) === false }

		function reduce_list(list, item){ return list.concat(item) }
	}

	function on_delete(action){
		let did_unset = null

		//exports
		return function on_proxy_delete_property(observed, field){
			did_unset = null
			try{
				did_unset = action(observed, field, ...action_inputs(observed, field))
			}
			catch(error){
				console.log(error)
			}
			return is.TF(did_unset) ? did_unset:default_delete(observed, field)
		}

		//scope actions
		function action_inputs(...x){
			return [
				{text: is.text(x[1]), has: default_has(...x)},
				()=>default_get(...x),
				()=>default_delete(...x)
			]
		}
	}

	function on_fields(action){
		let fields = null

		//exports
		return function on_proxy_own_keys(observed){
			fields = null
			try{
				fields = action(observed, ...action_inputs(observed))
			}
			catch(error){
				console.error(error)
			}
			return is.array(fields) ? fields:default_fields(observed)
		}

		//scope actions
		function action_inputs(...x){
			return [
				{text: is.text(x[1]), has: default_has(...x)},
				get_list,
				()=>default_fields(...x)
			]
		}
	}

	function on_has(action){
		let has = null

		//exports
		return function on_proxy_has(observed, field){
			has = null
			try{
				has = action(observed, field, ...action_inputs(observed, field))
			}
			catch(error){
				console.error(error)
			}
			return is.TF(has) ? has:default_has(observed, field)
		}

		//scope actions
		function action_inputs(...x){
			return [
				{text: is.text(x[1]), has: default_has(...x)}
			]
		}
	}

	function on_get(action){
		let value = null

		//exports
		return function on_proxy_get(observed, field){
			value = null
			try{
				value = action(observed, field, ...action_inputs(observed, field))
			}
			catch(error){
				console.error(error)
			}
			return is.nothing(value) ? value = null:value
		}

		//scope actions
		function action_inputs(...x){
			return [
				{text: is.text(x[1]), has: default_has(...x)},
				()=>default_get(...x)
			]
		}
	}

	function on_set(action){
		let did_set = null

		//exports
		return function on_proxy_set(observed, field, value){
			did_set = null
			try{
				did_set = action(observed, field, value, ...action_inputs(observed, field, value))
			}
			catch(error){
				console.error(error)
			}
			return is.TF(did_set) ? did_set:default_set(observed, field, value)
		}

		//scope actions
		function action_inputs(...x){
			return [
				{text: is.text(x[1]), has: default_has(...x)},
				()=>default_get(...x),
				()=>value_changed(x[2], ()=>default_get(...x)),
				()=>default_set(...x)
			]
		}
	}

	function value_changed(new_value, get_current_value){
		try{
			return new_value === get_current_value()
		}
		catch(error){
			console.error(error)
		}
		return false
	}

})