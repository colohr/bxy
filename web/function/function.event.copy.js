(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.event.copy', {value:await module(...inputs)}); return window.modules.has('function.event.copy')?window.modules.get('function.event.copy'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const fragment = await window.modules.import.function('document')
	//exports
	return function event_copy(event){
		let selection = null
		try{ selection = fragment.select(event) }
		catch(error){}
		if(selection){
			try{
				window.document.execCommand('copy')
				selection.removeAllRanges()
			}
			catch(error){}
		}
	}
})

