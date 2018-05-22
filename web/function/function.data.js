(async x=>await x())(async ()=>{
	const dot_notation = {
		get add(){ return add_value },
		get get(){ return get_value },
		get has(){ return has_value },
		get is(){ return {object: is_object, value: is_value} },
		get join(){ return join_value },
		get mix(){ return join_value },
		get push(){ return add_value },
		get set(){ return set_value },
		get unset(){ return unset_value }
	}

	dot_notation.Mix = (Base=Object) => class extends Base{
		static get dot_notation(){ return dot_notation }
		add(...x){ return add_value(this, ...x) }
		get(...x){ return get_value(this,...x) }
		has(...x){ return has_value(this, ...x) }
		mix(...x){ return join_value(this, ...x) }
		set(...x){ return set_value(this, ...x) }
		unset(...x){ return get_value(this, ...x) }
	}


	//exports
	return new Proxy(get_value,{
		get(o,field){ return field in dot_notation ? dot_notation[field]:null },
		has(o,field){ return field in dot_notation }
	})


	//shared actions
	function find_value(data, notation){
		if(!is_object(data)) return null
		const levels = notation.split('.')
		const last = levels.length - 1
		try{ return levels.reduce(get_item, data) }
		catch(e){ console.error(e) }
		return null
		//shared action
		function get_item(object,field,index){
			if(!is_value(object)) return null
			if(index === last && is_action(object[field])){
				return (...x)=>object[field](...x)
			}
			return object[field]
		}
	}

	function get_value(data, notation){
		const value = find_value(data,notation)
		return is_value(value) ? value:null
	}

	function has_value(data, notation){ return is_value(find_value(data, notation)) }

	function is_action(x){ return typeof x === 'function' && !('prototype' in x) }

	function is_object(x){ return typeof x === 'object' && x !== null }

	function is_value(x){ return typeof x !== 'undefined' && x !== null }

	function join_value(data, notation, value){
		const info = set_value(data, notation, value, true)
		if(Array.isArray(info.target)) return info.level[info.field] = info.target.concat(value)
		else if(is_value(info.target)) {
			if(typeof value === 'function') return info.level[info.field] = value.bind(info.target)
			return info.level[info.field] = Object.assign(info.target, value)
		}
		return info.level[info.field] = value
	}

	function add_value(data, notation, value){
		const info = set_value(data, notation, value, true)
		if(is_value(info.target)) return info.level[info.field].push(value)
		return info.level[info.field] = [value]
	}

	function set_value(data, notation, value, dont_set){
		if(!is_value(data)) data = {}
		const levels = notation.split('.')
		let level = data
		let i = 0
		while(i < levels.length - 1){
			if(!is_value(level[levels[i]])) level[levels[i]] = {}
			level = level[levels[i]]
			i++
		}
		if(dont_set === true){
			return {
				field: levels[levels.length - 1],
				level,
				target: level[levels[levels.length - 1]],
				value
			}
		}
		return level[levels[levels.length - 1]] = value
	}


	function unset_value(data, notation){
		const levels = notation.split('.')
		let level = data
		let i = 0
		while(i < levels.length - 1){
			if(is_value(level[levels[i]])){
				level = level[levels[i]]
				i++
			}
		}
		return level ? delete level[levels[levels.length - 1]]:true
	}

})


