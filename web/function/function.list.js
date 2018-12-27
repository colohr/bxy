(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('list', {value:await module(...inputs)}); return window.modules.has('list')?window.modules.get('list'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const list_function = unique_list
	list_function.array = unique_list_from_array
	list_function.join = unique_list_from_arrays

	//exports
	return list_function

	//scope actions
	function filter_nothing(value){ return window.modules.is.nothing(value) === false }

	function unique_list(...items){ return Array.from(new Set(items)).filter(filter_nothing) }

	function unique_list_from_array(array){
		if(window.modules.is.array(array) === false) array = Array.from(array)
		return unique_list(...array)
	}

	function unique_list_from_arrays(...array){
		return unique_list_from_array(array.reduce(reduce_list, []))

		//scope actions
		function reduce_list(list, item){ return list.concat(item) }
	}


})