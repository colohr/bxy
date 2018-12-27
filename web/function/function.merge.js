(FunctionMerge=>FunctionMerge())(function FunctionMerge(){
	const is = window.modules.is
	merge.all = merge_all //merge object array with options
	merge.items = merge_items //merge target & source with options

	//exports
	return merge

	//scope actions
	function clone(value, options){
		return options.clone === true && merges(value) ? merge_items(empty(value), value, options):value
	}

	function empty(value){ return is.array(value) ? []:{} }

	function merge(...values){
		const options = {clone: values.filter(i=>is.TF(i))[0] === true}
		return values.filter(i=>!is.TF(i)).reduce(reduce,options.clone ? {}:values[0])
		//scope actions
		function reduce(target, source){ return merge_items(target, source, options) }
	}

	function merge_all(array, options){
		if(is.array(array)){
			if(array.length === 1) array[1] = empty(array[0])
			return array.reduce(reduce)
		}
		throw new Error('bxy.function.merge: Invalid input object for merge function.')
		//scope actions
		function reduce(previous, next){ return merge_items(previous, next, options) }
	}

	function merge_array(target, source, options){
		const destination = target.slice()
		const count = source.length
		for(let index = 0; index < count; index++){
			if(index in destination === false){
				destination[index] = clone(source[index], options)
			}
			else if(merges(source[index])){
				destination[index] = merge_items(target[index], source[index], options)
			}
			else if(target.indexOf(source[index]) === -1){
				destination.push(clone(source[index], options))
			}
		}
		return destination
	}

	function merge_data(target, source, options){
		const destination = {}
		if(merges(target)) Object.keys(target).forEach(merge_target)
		Object.keys(source).forEach(merge_source)
		//exports
		return destination
		//scope actions
		function merge_target(key){ destination[key] = clone(target[key], options) }
		function merge_source(key){
			if(!merges(source[key]) || !target[key]) destination[key] = clone(source[key], options)
			else destination[key] = merge_items(target[key], source[key], options)
		}
	}

	function merge_items(target, source, options={merge_array}){
		if(is.array(target)) return options.merge_array ? options.merge_array(target, source, options):clone(source, options)
		return merge_data(target, source, options)
	}

	function merges(value){
		return is.object(value) && is.regular_expression(value) === false && is.date.class(value) === false
	}
})