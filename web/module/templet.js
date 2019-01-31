(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('templet', {value:await module(...inputs)}); return window.modules.has('templet')?window.modules.get('templet'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const Templet = await window.modules.import.package('Templet')
	const templet_render = await window.modules.import.function('templet.render')
	await Templet.directive('until')
	await Templet.directive('unsafe-html')
	//exports
	return new Proxy(templet_render, {deleteProperty: delete_templet, get, has, set})

	//scope actions
	function delete_templet(o,field){ return (Templet.delete(field), true) }
	function get(o,field){
		if(Templet.has(field)) return Templet.get(field)
		else if(Reflect.has(o, templet_render)) return Reflect.get(o, templet_render)
		return Reflect.get(Templet, field) || null
	}
	function has(o,field){ return Templet.has(field) || field in o || field in Templet || field === Symbol.proxy }
	function set(o,field,value){ return (Templet.set(field, value), true) }
})
