(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.resolver', {value:await module(...inputs)}); return window.modules.has('function.resolver')?window.modules.get('function.resolver'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(...x){
	const {is} = window.modules
	const Notate = await window.modules.import.function('notate')
	const Merge = await window.modules.import.function('merge')

	function create(){
		//provide notation for targets to create resolvers

		//return function that merges all sources
		//target provided notations
		//keep reference of functions and/or objects from sources
			//assign resolver function that will be called later & pass arguments to chain of function
			//set symbol to identify properties which are resolvers

		//merge all properties that are not resolvers
		//return object with placeholder chain resolver
		

	}
	function resolve(){
		//call resolver function -----
		//merge properties
		//loop referenced functions
		//call resolver functions & merge results to current property object
		//set resolved objects to each target notation
		//return resolved object
	}
	function construct_resolver(...sources){
		const map = new Map()
		sources = sources.map(construct_object)
		for(const [field,resolver] of sources){
			if(map.has(field) === false) map.set(field, [])
			map.get(field).push(resolver)
		}
		//loop each resolver
		//check

	}
	function construct_object(source){
		return Object.entries(source).map(create_entry, source)
	}


	function create_entry(object, entry){
		entry[1] = create_resolver(entry[1]).bind(object)
		return { [entry[0]]: [] }
	}
	function create_resolver(property){
		return function resolve_property(origin_arguments){
			if(is.function(property)) property = property.call(this, origin_arguments)
			return property
		}
	}
})
