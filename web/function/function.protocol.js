(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.protocol', {value:await module(...inputs)}); return window.modules.has('function.protocol')?window.modules.get('function.protocol'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {is} = window.modules
	const List = await window.modules.import.function('list')

	//exports
	const protocol = property_reduction
	protocol.assign = property_assignment
	protocol.extend = prototype_extend
	return protocol

	//scope actions
	function is_argument(){ return is.instance(value, arguments.constructor) }
	function is_array_type(value){ return is.map(value) || is.set(value) || is_argument(value) }
	function is_entry(entry){ return is.array(entry) && entry.length === 2 && is.text(entry[0]) }

	function property_assignment(properties, on_property){
		properties = property_dataset(properties, on_property)
		return target=>properties.reduce(property_assign, target)
	}

	function property_assign(target,entry){ return Object.assign(target,entry) }

	function property_array(value, wrap=true){
		if(is.not.array(value) && is_array_type(value)) value = Array.from(value)
		return is.array(value) ? value:(wrap === true ? [value]:[])
	}

	function property_dataset(properties, on_property=(x=>x)){ return property_array(properties,true).map(on_property).filter(is.data) }

	function property_entries(data){
		if(is.data(data)) return Object.entries(data)
		return List.join(property_array(data, false).map(property_entry)).filter(is_entry)
	}

	function property_entry(value){ return is.text(value) ? [value, null]:value }

	function property_list(properties, on_property = (x=>x)){ return property_entries(properties).map(on_property).filter(is_entry) }

	function property_reduce(target, entry){ return (target[entry[0]] = entry[1], arguments[0]) }

	function property_reduction(properties, on_property, reduce=property_reduce){
		properties = property_list(properties, on_property)
		return target=>properties.reduce(reduce,target)
	}

	function prototype_extend(properties, on_property){ return property_reduction(properties,on_property,prototype_reduce) }

	function prototype_reduce({prototype}, entry){ return (prototype[entry[0]] = entry[1], arguments[0]) }
})