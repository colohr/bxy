(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('convert.search', {value:await module(...inputs)}); return window.modules.has('convert.search')?window.modules.get('convert.search'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(json){
		const {is} = window.modules

		//exports
		return {
			get data(){ return get_search_data },
			get text(){ return get_search_text_value }
		}

		//scope actions
		function get_search_data(locator){
			let text = null
			if(is.data(locator) && locator instanceof URL) text = locator.search
			else if(is.text(locator)) text = locator
			if(is.text(text) === false) text = window.location.search
			text = text.trim()
			if(text.includes('?')) text = text.split('?')[1]
			return text ? get_search_text_data(text):{}
		}

		function get_search_text_data(search=''){
			return search ? get_json():{}
			//scope actions
			function get_json(data=null){
				try{ data = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', decode_json) }
				catch(error){ data = {} }
				//exports
				return json(data)
				//scope actions
				function decode_json(key, value){ return key === "" ? value:decodeURIComponent(value) }
			}
		}

		function get_search_text_value(search, text=[]){
			if(is.data(search) === false) return ''
			for(let [name,value] of Object.entries(search)){
				if(is.object(value)) value = json.text(value, '{}')
				text.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
			}
			return text.join('&')
		}

}, async function load_assets(){
	return await window.modules.import.function('convert.json')
})
