(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('uid', {value:await module(...inputs)}); return window.modules.has('uid')?window.modules.get('uid'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const uid = get_id
	uid.get = get_uid=>{
		return (...x)=>{
			let id = get_uid(...x)
			if(id) return id
			return get_id()
		}
	}
	//exports
	return uid

	//shared actions
	function get_id(){
		let first = (Math.random() * 46656) | 0
		let second = (Math.random() * 46656) | 0
		first = (`000${first.toString(36)}`).slice(-3)
		second = (`000${second.toString(36)}`).slice(-3)
		return `${first}${second}`
	}
})