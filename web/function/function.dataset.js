(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.dataset', {value:await module(...inputs)}); return window.modules.has('function.dataset')?window.modules.get('function.dataset'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const Type = await window.modules.import.function('type')
	const Notate = await window.modules.import.function('notate')

	//exports
	return notate

	//scope actions
	function element_fieldset(element){
		let list = []
		if(is_element(element)) list = ['bound', 'dataset', 'clientWidth', 'clientHeight', 'innerHTML'].concat([Node, Element, EventTarget].reduce(cancel, Type.fieldset(element)))
		return Array.from(new Set(list))

		//scope actions
		function cancel(fields, instance){ return Type.cancel(fields, instance.prototype) }
	}

	function element_json_data(element){ return json_data(element_fieldset(element), element) }

	function json_data(fields, data){
		const json = {}
		if(window.modules.is.object(data)) for(const field of fields) window.modules.dot.set(json, field, data[field])
		return json
	}

	function is_element(element){ return window.modules.is.data(element) && element instanceof Node }

	function notate(value){
		if(is_element(value)) return notate(element_json_data(value))
		let notation = value
		if(window.modules.is.data(value)){
			notation = Notate(value)
			for(const entry of Object.entries(notation)){
				if(is_element(entry[1])){
					notation[entry[0]] = element_json_data(entry[1])
					return notate(json_data(Object.keys(notation), notation))
				}
			}
		}
		return notation
	}
})
