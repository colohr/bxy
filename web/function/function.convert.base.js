(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('convert.base', {value:await module(...inputs)}); return window.modules.has('convert.base')?window.modules.get('convert.base'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(json){

	const {is} = window.modules
	is.base64 = is_base64
	const base_function = base64_from_text
	base_function.from = base64_from_text
	base_function.json = json_value_from_base64
	base_function.is = is_base64
	base_function.text = base64_text_from_value
	base_function.value = text_from_base64

	//exports
	return base_function

	//scope actions
	function base64_from_text(text){
		if(is.text(text)){
			try{ return btoa(text) }
			catch(error){}
		}
		return ''
	}

	function base64_text_from_value(value){
		if(is.object(value)) value = json.text(value)
		if(is.text(value) && is_base64(value) === false) value = base64_from_text(value)
		return is.text(value) ? value:null
	}

	function is_base64(text){ return is.text(text) && text_from_base64(text).length > 0 }


	function json_value_from_base64(value){
		if(is.text(value) && is_base64(value)) value = text_from_base64(value)
		return json(value)
	}

	function text_from_base64(text){
		if(is.text(text)){
			try{ return atob(text) }
			catch(error){ }
		}
		return ''
	}


}, async function load_assets(){
	return await window.modules.import.function('convert.json')
})
