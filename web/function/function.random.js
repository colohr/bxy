(function(get_random){ return get_random() })
(function get_random(){
	//exports
	return new Proxy(get_random_number, {
		get(o, name){
			let value = null
			if(name === 'decimal') value = get_random_decimal
			else if(name === 'item') value = get_random_item
			if(name in o) value = o[name]
			return value
		}
	})

	//shared actions
	function get_random_decimal(from, to){return Math.random() * (to - from) + from}

	function get_random_item(array, ...items){
		let list = []
		if(Array.isArray(array)) list = array
		else{
			list.push(array)
			list = list.concat(items)
		}
		return list.length ? list[get_random_number(0, list.length - 1)]:-1
	}

	function get_random_number(from, to){
		if(is_valid(from) === false && is_valid(to) === false) return Math.random()
		return Math.floor(Math.random() * (to - from + 1)) + from
	}

	function is_valid(value){ return typeof value === 'number' && isNaN(value) === false }
})