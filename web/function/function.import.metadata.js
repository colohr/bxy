(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.import.metadata', {value:await module(...inputs)}); return window.modules.has('function.import.metadata')?window.modules.get('function.import.metadata'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {http,dot,is} = window.modules

	//exports
	return import_meta

	//scope actions
	function get(notation){ return has(notation) ? dot.get(window.modules[window.modules.meta.symbol], notation):null }

	async function import_meta(locator, saves = false){
		if(window.modules.has('meta') === false) await window.modules.import('meta')
		locator = is.url(locator) ? locator:http.locator.meta(locator)
		const extension = locator.extension
		const notation = extension ? locator.file.replace(`.${extension}`,''):locator.basename
		let metadata = get(notation)
		return metadata ? metadata:window.modules.meta.import(locator).then(on_metadata)

		//scope actions
		function on_metadata(data){ return saves ? set(notation, data):data }
	}

	function has(notation){ return window.modules.meta.symbol in window.modules && dot.has(window.modules[window.modules.meta.symbol], notation) }

	function set(notation, metadata){
		if(is.nothing(metadata)) return metadata = null
		if(window.modules.meta.symbol in window.modules === false) window.modules[window.modules.meta.symbol] = {}
		return dot.set(window.modules[window.modules.meta.symbol], notation, metadata)
	}
})
