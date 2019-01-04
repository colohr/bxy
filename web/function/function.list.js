(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('list',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('list')?_.get('list'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
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
