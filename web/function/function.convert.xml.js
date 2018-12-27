(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('convert.xml', {value:await module(...inputs)}); return window.modules.has('convert.xml')?window.modules.get('convert.xml'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {is} = window.modules
	const escape = await window.modules.import.function('expression')
	const unicode = await window.modules.import.function('unicode')
	const codes = new Map(['<', '>', '/', '!'].map(get_entity))
	const expressions = ['<!', '</', '<', '>'].map(get_expression)

	//exports
	return to_xml

	//scope actions
	function get_entity(character){ return [character, unicode.by('character', character)] }

	function get_expression(target){
		return {
			expression: escape(target, 'g'),
			replace: target.split('').map(character=>codes.get(character)).join('')
		}
	}

	function to_xml(text){
		if(is.text(text) === false) return null
		for(const item of expressions){
			if(item.expression.test(text)){
				text = text.replace(item.expression, item.replace)
			}
		}
		return text
	}
})
