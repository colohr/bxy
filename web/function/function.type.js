(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('fields', {value:await module(...inputs)}); return window.modules.has('fields')?window.modules.get('fields'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const list = await window.modules.import.function('list')
	const primitive = await window.modules.import.function('primitive')

	const Type = get_type
	Type.assign = assign_properties
	Type.atomic = atomic_properties
	Type.bind = bind_properties
	Type.cancel = cancel_properties
	Type.define = define_property
	Type.fields = get_fields
	Type.fieldset = get_fieldset
	Type.get = get_property
	Type.has = has_prototype
	Type.iterations = get_iterations
	Type.iterations.filter = get_iterations_filter
	Type.json = get_json
	Type.let = let_property
	Type.names = get_names
	Type.of = get_prototype_of
	Type.primitive = primitive
	Type.primitive.filter = get_primitive_filter
	Type.primitive.properties = get_primitive_properties
	Type.properties = get_properties
	Type.set = set_property
	Type.token = symbolic_token_property
	Type.reduce = reduce_entries
	Type.reduce.entry = reduce_entry

	//exports
	return Type

	//scope actions
	function assign_properties(object, ...assignments){ return Object.assign(object, ...assignments) }

	async function atomic_properties(...sequence){
		const sync = window.modules.has('sync')?window.modules.get('sync'):await window.modules.import.function('sync')
		const atom = {}
		for(let item of sequence){
			try{
				if(window.modules.is.object(item = await sync(item))){
					try{ reduce_entries(await sync(get_json(item)), atom) }
					catch(error){ console.warn(error.message) }
				}
			}
			catch(error){ console.warn(error.message) }
			item = null
		}
		return atom
	}

	function bind_properties(object, ...bindings){
		for(const binding of bindings){
			for(const entry of Object.entries(binding)){
				if(window.modules.is.function(entry[1]) && 'bind' in entry[1]) object[entry[0]] = entry[1].bind(object)
				else object[entry[0]] = entry[1]
			}
		}
		return object
	}

	function cancel_properties(fields, cancellation){
		cancellation = get_properties(cancellation)
		fields = fields.filter(field=>cancellation.includes(field) === false)
		cancellation = null
		return fields
	}

	function define_property(object, field, definition){ return arguments.length === 3 ? Object.defineProperty(object, field, definition):Object.defineProperties(object,field) }

	function get_fields(object){ return get_names(object).filter(get_primitive_filter(object)) }

	function get_fieldset(object){
		return next(get_type(object), get_fields(object))

		//scope actions
		function next(type, set){
			if(has_prototype(type)){
				const fields = get_fields(type)
				return fields.length ? next(get_type(type), set.concat(fields)):list.array(set)
			}
			return (set = cancel_properties(set, type), type = null, list.array(set))
		}
	}

	function get_iterations(object){  return window.modules.is.array(object) || window.modules.is.text(object) ? object.length:false }

	function get_iterations_filter(iterations){
		iterations = get_iterations(iterations)
		return field=>iterations===false || is_iteration(field)===false

		//scope actions
		function is_iteration(field){
			if(window.modules.is.number(field = parseInt(field)) === false) return false
			return field >= 0 && field < iterations
		}
	}

	function get_json(object, json={}){
		for(const field of get_fieldset(object)){
			try{ json[field] = object[field] }
			catch(error){ console.warn(error.message) }
		}
		return json
	}

	function get_names(object){
		return list.join(get_properties(object), get_properties(get_type(object)))
				   .filter(get_iterations_filter(object))

	}

	function get_primitive_filter(object){
		object = get_primitive_properties(object)
		return field=>object.includes(field) === false
	}

	function get_primitive_properties(object){ return get_properties(get_type(primitive(object))) }

	function get_property(object, field, get, enumerable = false, configurable = false){ return Object.defineProperty(object, field, {get, enumerable, configurable}) }

	function get_properties(object){ return window.modules.is.nothing(object) ? []:Object.getOwnPropertyNames(object) }

	function get_prototype_of(object){ return Object.getPrototypeOf(object) }

	function get_type(object){ return primitive.constructable(object) ? object.prototype:get_prototype_of(object) }

	function has_prototype(object){ return window.modules.is.nothing(object) === false && get_prototype_of(object) !== null }

	function let_property(object, field, value, enumerable = false, configurable = false){ return Object.defineProperty(object, field, {value, enumerable, configurable}) }

	function reduce_entries(object, target={}){ return Object.entries(object).reduce(reduce_entry, target) }

	function reduce_entry(object,entry){ return (object[entry[0]]=object[entry[1]],object) }

	function set_property(object, field, get, set, enumerable = false, configurable = false){ return Object.defineProperty(object, field, {get, set, enumerable, configurable}) }

	function symbolic_token_property(object, field, create=null){
		const symbol = Symbol(field)
		Object.defineProperty(object, field, { get:token_get, set:token_set })
		return ()=>symbol in object
		//scope actions
		function token_get(){ return symbol in this ? this[symbol]:(create ? create(this, {type: 'get', field, symbol}):null) }
		function token_set(value){ return (value = create ? create(this, {type: 'set', field, symbol}, value):value, window.modules.is.nothing(value) ? delete this[symbol]:this[symbol] = value) }
	}

})
