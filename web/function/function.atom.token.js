(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('token',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('token')?_.get('token'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(...x) {

	async function atomic_properties(...sequence){
		const sync = window.modules.has('sync') ? window.modules.get('sync'):await window.modules.import.function('sync')
		const atom = {}
		for(let item of sequence){
			try{
				if(window.modules.is.object(item = await sync(item))){
					try{ reduce_entries(await sync(get_json(item)), atom) }
					catch(error){ console.warn(error.message) }
				}
			}
			catch(error){ console.warn(error.message) }
			item = null
		}
		return atom
	}

	function symbolic_token_property(object, field, create = null){
		const symbol = Symbol(field)
		Object.defineProperty(object, field, {get: token_get, set: token_set})
		return ()=>symbol in object

		//scope actions
		function token_get(){ return symbol in this ? this[symbol]:(create ? create(this, {type: 'get', field, symbol}):null) }

		function token_set(value){ return (value = create ? create(this, {type: 'set', field, symbol}, value):value, window.modules.is.nothing(value) ? delete this[symbol]:this[symbol] = value) }
	}

})
