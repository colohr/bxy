(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('primitive', {value:await module(...inputs)}); return window.modules.has('primitive')?window.modules.get('primitive'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(index){
	const primitive = get_primitive_base
	primitive.base = get_base_prototype
	primitive.constructable = index.constructable
	primitive.index = index
	primitive.is = is_primitive
	primitive.is.base = is_base

	//exports
	return primitive

	//scope actions
	function get_base_prototype(value){
		if(window.modules.is.nothing(value)) return null
		value = get_primitive_base(value)
		if(is_base(value)) return value.prototype
		return null
	}

	function get_primitive_base(value){
		if(window.modules.is.nothing(value)) return Function
		else if(is_primitive(value)) return value
		if(is_base(value)) return value
		else if(is_base(value.constructor)) return value.constructor
		else if(is_base(Object.getPrototypeOf(value))) return Object.getPrototypeOf(value)
		else if(is_base(Object.getPrototypeOf(value.constructor))) return Object.getPrototypeOf(value.constructor)
		return get_primitive_base(Object.getPrototypeOf(value))
	}

	function is_base(constructor){
		return is_primitive(constructor) && index.properties.has(constructor.name)
	}

	function is_primitive(constructor){
		return index.constructable(constructor) && index.primitives.has(constructor.name)
	}

}, async function load_assets(){
	//exports
	return get_objects(await window.modules.import.meta('objects'))

	//scope actions
	function get_objects(data){
		data = Object.values(data).reduce(map_value, {primitives: [], properties: []})
		data.primitives = new Set(get_primitives(data.primitives))
		data.properties = new Set(data.properties)
		data.constructable = is_constructable
		return data
		//scope actions
		function map_value(data,value){
			if('notations' in value) data.primitives.push(...value.notations)
			if('properties' in value) data.properties.push(...value.properties)
			return data
		}
	}

	function get_primitives(names){
		return get_constructors().filter(is_primitive_constructor)

		//scope actions
		function is_primitive_constructor(field){
			try{ return names.includes(this[field].name) }
			catch(error){ return false }
		}

		function get_constructors(){
			return Object.getOwnPropertyNames(this).filter(is_constructable_property)

			//scope actions
			function is_constructable_property(field){
				try{ return is_constructable(this[field]) }
				catch(error){ return false }
			}
		}
	}

	function is_constructable(property){
		try{
			if(window.modules.is.function(property) === true){
				if(window.modules.is.async(property) === false){
					if(property.hasOwnProperty('prototype')){
						return true
					}
				}
			}
			return false
		}
		catch(error){ return false }
	}

})
