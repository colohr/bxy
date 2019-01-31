(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.import.component', {value:await module(...inputs)}); return window.modules.has('function.import.component')?window.modules.get('function.import.component'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	//exports
	return import_component

	//scope actions
	function get_inputs(...inputs){
		inputs = get_locator(...inputs)
		if(inputs.filter(window.modules.is.url).length === 0)  {
			const component = inputs.filter(window.modules.is.text)[0]
			inputs[inputs.indexOf(component)] = window.modules.http.locator.component(component)
		}
		return {
			locator: inputs.filter(window.modules.is.url),
			name: inputs.filter(window.modules.is.text)[0] || null,
			definition: inputs.filter(window.modules.is.data)[0] || {},
			get tag(){ return get_tag(this.name,this.locator) }
		}
	}

	function get_locator(...inputs){
		for(const fragment of inputs){
			if(window.modules.is.url(fragment) === false){
				if(window.modules.is.url.text(fragment)){
					inputs[inputs.indexOf(fragment)] = new URL(fragment)
				}
			}
		}
		return inputs
	}

	function get_tag(name, locator){ return name && name.includes('-') ? name:window.modules.id.dash(locator.file.replace(`.${locator.extension}`, '')) }

	async function import_component(){
		const {locator,tag, definition} = get_inputs(...arguments)
		if(window.modules.is.defined(tag)) return window.modules.element.create(tag, definition)
		await window.modules.http.assets(locator)
		return window.modules.element.create(tag, definition)
	}
})

