(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('sync', {value:await module(...inputs)}); return window.modules.has('sync')?window.modules.get('sync'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Sync){
	const [is] = await window.modules.wait('modules.is')

	//exports
	return sync

	//scope actions
	/**
	 * Recursive resolving of nested async values.
	 * Scans nested content of these object instances: Array, Map, Object + Set.
	 *
	 * @async
	 * @function sync
	 * @argument {Promise<any>} value - Promise or collection of nested promises to resolve.
	 * @return {<any>} Resolved value.
	 * @requires module: function.wait
	*/
	async function sync(value){
		if(is.promise(value)) value = await sync(await value)
		if(is.array(value)) return await sync_all(value)
		else if(is.set(value)) return await sync_set(value)
		else if(is.map(value)) return await sync_map(value)
		else if(is.data(value)) return await sync_data(value)
		else if(Sync.is(value)) return await sync_function(value)
		return value
	}

	async function sync_all(array){ return await Promise.all(array.map(sync)) }

	async function sync_data(object){
		const entries = await sync_entries(Object.entries(object))
		for(const entry of entries) object[entry[0]] = entry[1]
		return object
	}

	async function sync_entries(value){
		const entries = []
		for(const entry of value) entries.push(await sync_all(entry))
		return entries
	}

	async function sync_function(sync_function){
		if('caller' in Sync.get(sync_function)) return await sync(sync_function.call(await get_caller(), ...(await get_input())))
		//exports
		return await sync(sync_function(...(await get_input())))
		//scope actions
		async function get_caller(){ return await sync(Sync.get(sync_function).caller()) }
		async function get_input(inputs=[]){
			if('input' in Sync.get(sync_function)) inputs = await sync(Sync.get(sync_function).input())
			return Array.isArray(inputs) ? inputs:[inputs]
		}
	}

	async function sync_map(map){
		for(const [field, value] of await sync_entries(Array.from(map))){
			map.set(field, value)
		}
		return map
	}

	async function sync_set(set){
		const new_values = await sync_all(Array.from(set))
		set.clear()
		for(const value of new_values) set.add(value)
		return set
	}
}, async function Sync(){
	const symbol = Symbol('Sync Function')
	const Sync = create_sync_function
	Sync.get = get_sync_function
	Sync.is = is_sync_function

	//exports
	return window.modules.set('Sync',create_sync_function)

	//scope actions
	function create_sync_function(sync_function, setting={}){ return (sync_function[symbol] = Object.assign(sync_function[symbol] || {}, setting),sync_function) }
	function get_sync_function(sync_function){ return is_sync_function(sync_function) ? sync_function[symbol]:null }
	function is_sync_function(sync_function){ return typeof sync_function === 'function' && symbol in sync_function }
})