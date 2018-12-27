(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('data_map', {value:await module(...inputs)}); return window.modules.has('data_map')?window.modules.get('data_map'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(...x){
	return x.reduce((to,i)=>(to[i.name]=i,to),{})
}, function data_map(map){
	return new Proxy(map,{
		deleteProperty(o,field){
			field = get_fields(field).get(o)
			return (field ? o.delete(field):null,true)
		},
		get(o,field){
			field = get_fields(field).get(o)
			return field ? o.get(field):null
		},
		has(o,field){ return get_fields(field).has(o) },
		set(o,field,value){
			return (o.set(field,value),true)
		},
		ownKeys(o){ return Array.from(o.keys()) }
	})
	//scope actions
	function get_fields(field){
		const fields = typeof field === 'string' ? [field, window.modules.phrase(field).underscore, window.modules.phrase(field).dash]:[]
		fields.has = function map_has(map){ return this.filter(i=>map.has(i)).length > 0 }
		fields.get = function map_field(map){
			for(const i of this) if(map.has(i)) return i
			return null
		}
		return fields
	}
})
