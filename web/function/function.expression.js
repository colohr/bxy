(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('expression', {value:await module(...inputs)}); return window.modules.has('expression')?window.modules.get('expression'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(code){
	// Referring to the table here:
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp
	// these characters should be escaped
	// \ ^ $ * + ? . ( ) | { } [ ]
	// These characters only have special meaning inside of brackets
	// they do not need to be escaped, but they MAY be escaped
	// without any adverse effects (to the best of my knowledge and casual testing)
	// : ! , =
	// my test "~!@#$%^&*(){}[]`/=?+\|-_;:'\",<.>".match(/[\#]/g)
	const specials = [
		// order matters for these
		"-"
		, "["
		, "]"
		// order doesn't matter for any of these
		, "/"
		, "{"
		, "}"
		, "("
		, ")"
		, "*"
		, "+"
		, "?"
		, "."
		, "\\"
		, "^"
		, "$"
		, "|"
	]

	const replace_expression = new RegExp(`[${specials.join('\\')}]`, 'g');
	const replace_expression_with = "\\$&"

	//exports
	return new Proxy(create, {get, has})

	//scope actions
	function create(text, ...codes){
		const option = codes.filter(i=>typeof i === 'string')[0]
		return new RegExp(codes.filter(i=>i!==option).reduce(reduce_codes,text), option)
	}

	function escape(text){ return text.replace(replace_expression, replace_expression_with) }

	function get(o, field){
		if(field in o) return typeof o[field] === 'function' ? o[field].bind(o):o[field]
		else switch(field){
			case 'escape': return escape
			case 'code': return code
			case 'codes': return code.codes
		}
		return code[field]
	}

	function has(o, field){
		if(field in o) return true
		else switch(field){
			case 'escape':
			case 'code':
			case 'codes':
				return true
		}
		return false
	}

	function reduce_codes(text, expression_code){ return code(text, expression_code) }

}, async function codes(){
	const codes = [
		{
			keywords:['b', 'word', 'boundary'],
			templet:(text)=>`${text}\\b`
		}
	]

	for(const item of codes) item.symbols = item.keywords.map(keyword=>Symbol.for(keyword))

	//exports
	return new Proxy(code, {get})

	//scope actions
	function code(text, expression_code){ return get_templet(expression_code).call(null, text) }

	function get(o,field){
		if(field in o) return typeof o[field] === 'function' ? o[field].bind(o):o[field]
		else if(field === 'codes') return codes
		return typeof field === 'string' ? Symbol.for(field):field
	}

	function get_templet(expression_code){
		for(const item of codes){
			if(item.keywords.includes(expression_code)) return item.templet
			else if(item.symbols.includes(expression_code)) return item.templet
		}
		return (text)=>text
	}

})