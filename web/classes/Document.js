(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Document', {value:await module(...inputs)}); return window.modules.has('Document')?window.modules.get('Document'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(DOMParser){
	const DocumentContent = {
		types: {
			'css': 'text/html',
			'html': 'text/html',
			'json': 'application/json',
			'svg': 'image/svg+xml',
			'xml': 'application/xml'
		}
	}

	//exports
	return async function get_document(...x){ //file, content = null, mime_type = null
		let file = x.filter(i=>i instanceof URL || (typeof i === 'string' && i.indexOf('http')===0))[0]
		let content = x.filter(i=>typeof i === 'string' && i !== file && is_type(i) === false).join('\n')
		let extension = x.filter(i=>typeof i === 'string' && is_type(i))[0] || 'css'

		if(file && file instanceof URL === false) file = new URL(file)
		if(file) extension = file.extension

		content = content ? content:await load_content()
		const text = extension === 'css' ? `<style name="style">${content.trim()}</style>`:content

		//exports
		return create_document()

		//scope actions
		function create_document(){
			const mime_type = extension in DocumentContent.types ? DocumentContent.types[extension]:null
			const parser = new DOMParser()
			const type = mime_type ? mime_type:(file.extension in DocumentContent.types ? DocumentContent.types[file.extension]:`text/${extension}`)
			return parser.parseFromString(text, type)
		}
		async function load_content(){ return (await window.modules.http(file)).response }
		function is_type(text){ return text in DocumentContent.types || Object.values(DocumentContent.types).includes(text) }

	}

},async function Parser(){
	const DOMParser = window.DOMParser
	const prototype = DOMParser.prototype
	const nativeParse = prototype.parseFromString
	try{
		// WebKit returns null on unsupported types
		if(!get_test_document()){
			prototype.parseFromString = function(markup, type){
				if(/^\s*text\/html\s*(?:;|$)/i.test(type)){
					const doc = document.implementation.createHTMLDocument('')
					if(markup.toLowerCase().indexOf('<!doctype') > -1) doc.documentElement.innerHTML = markup
					else doc.body.innerHTML = markup
					return doc
				}
			    return nativeParse.apply(this, arguments)
			}
		}

	}
	catch(e){
		console.error(e)
		throw e
	}

	//exports
	return DOMParser

	//scope actions
	function get_test_document(){ return (new DOMParser()).parseFromString('', 'text/html') }
})