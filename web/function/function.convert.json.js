(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('convert.json', {value:await module(...inputs)}); return window.modules.has('convert.json')?window.modules.get('convert.json'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_json(){
	const {is} = window.modules
	const json_function = to_json
	json_function.text = to_json_text
	json_function.value = to_json_value

	//exports
	return json_function

	//scope actions
	function to_json(value, default_value=null){
		if(is.nothing(value)) return null
		else if(is.object(value) === false) value = to_json_value(value)
		if(is.object(value)){
			for(let [field, entry] of Object.entries(value)){
				if(is.nothing(entry) === false){
					if(is.object(entry) === false){
						const json_value = to_json_value(entry)
						if(entry !== json_value) value[field] = entry = json_value
					}
					if(is.object(entry)) value[field] = to_json(entry, default_value)
				}
			}
		}
		return value
	}

	function to_json_value(value){
		try{ return JSON.parse(value) }
		catch(error){}
		return value
	}

	function to_json_text(value, default_value = null){
		if(is.object(value)){
			try{ value = JSON.stringify(value) }
			catch(error){ value = default_value }
		}
		if(is.text(value) === false || !value) value = default_value
		return is.text(value) && value ? value:null
	}
})
