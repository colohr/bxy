(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('random',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('random')?_.get('random'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {

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

	//scope actions
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
