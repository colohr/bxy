(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('dot',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('dot')?_.get('dot'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const dot_notation = {
		get add(){ return add_value },
		get delete(){ return unset_value },
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
		delete(...x){ return unset_value(this,...x) }
		get(...x){ return get_value(this,...x) }
		has(...x){ return has_value(this, ...x) }
		mix(...x){ return join_value(this, ...x) }
		set(...x){ return set_value(this, ...x) }
		unset(...x){ return unset_value(this, ...x) }
	}

	//exports
	return window.modules.set('data', new Proxy(get_value,{
		get(o,field){ return field in dot_notation ? dot_notation[field]:(Reflect.get(o, field) || null) },
		has(o,field){ return field in dot_notation || Reflect.has(o,field) },
		ownKeys(o){ return Array.from(new Set(Reflect.ownKeys(o).concat(Object.getOwnPropertyNames(dot_notation)))).sort() }
	}))


	//scope actions
	function add_value(data, notation, value){
		const info = set_value(data, notation, value, true)
		if(is_value(info.target)) return info.level[info.field].push(value)
		return info.level[info.field] = [value]
	}

	function find_value(data, notation){
		if(!is_object(data)) return null
		const levels = get_notation(notation)
		const last = levels.length - 1
		try{ return levels.reduce(get_item, data) }
		catch(e){ console.error(e) }
		return null

		//scope action
		function get_item(object,field,index){
			if(!is_value(object)) return null
			if(index === last && is_action(object[field])){
				return (...x)=>object[field](...x)
			}
			return object[field]
		}
	}

	function get_notation(x){ return is_notation(x) === false ? []:typeof x === 'string' ? x.split('.'):[x] }

	function get_value(data, notation){
		const value = find_value(data,notation)
		return is_value(value) ? value:null
	}

	function has_value(data, notation){ return is_value(find_value(data, notation)) }

	function is_action(x){
		if(typeof x !== 'function') return false
		try{ return 'prototype' in x === false }
		catch(error){ return x.prototype instanceof Object === false }
	}

	function is_notation(x){ return typeof x === 'string' || typeof x === 'symbol'  || typeof x === 'number' }
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

	function set_value(data, notation, value, dont_set){
		if(!is_value(data)) data = {}
		const levels = get_notation(notation)
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
		const levels = get_notation(notation)
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



