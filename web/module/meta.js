(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('meta', {value:await module(...inputs)}); return window.modules.has('meta')?window.modules.get('meta'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	(await window.modules.wait('modules.http.assets',true)).call(this,window.modules.http.locator.script('meta/esprima/index.js'))
	const symbol = Symbol('meta')
	const context = {phrase: /\(\)\>/, expression: /\(\)\>/g, replace: '!!js/function >'}
	const functions = {start: `!<tag:yaml.org,2002:js/function`, end:'(', breaks:'> |-\n',inline:`> '` }

	class Meta{
		static get url(){ return new URL('script/meta/index.js', window.modules['@url']) }
		constructor(){
			load().then(x=>window.modules.set('yaml', x))
			//window.modules.http.module(window.modules.http.locator.script('meta')).catch(console.trace)
			this.io = {
				incoming: data=>this.incoming(data),
				is(value){ return typeof value === 'string' && value.indexOf('#metadata') === 0 },
				outgoing: data=>this.outgoing(data)
			}
			async function load(){
				if(window.modules.has('esprima') === false) await window.modules.wait('modules.esprima')
				return window.modules.http.assets(window.modules.http.locator.script('meta/yaml/index.js')).then(()=>window.modules.wait('jsyaml', true))
			}
		}
		get content(){ return this.import }
		content_value(content){ return context.phrase.test(content)?content.replace(context.expression, context.replace):content }
		data(meta_text){ return this.load(meta_text) }
		get from(){ return this.data }
		get lex(){ return window.modules.get('esprima') }
		get import(){ return import_meta }
		incoming(data){ return data instanceof Object === false ? this.from(data):data }
		load(content){ return this.yaml.load(this.content_value(content)) }
		outgoing(data){ return data instanceof Object ? `#metadata\n${this.to(data)}`:data }
		get prepare(){ return prepare_content }
		get source(){ return meta_source }
		get symbol(){return symbol }
		text(meta){ return fix_functions(this.yaml.dump(meta,{ skipInvalid: true, noRefs: true })) }
		get to(){ return this.text }
		get yaml(){ return window.modules.get('yaml') }
	}

	//exports
	return new Meta()

	//scope actions
	function fix_function(content,fixes){
		const next = get_fragment(content)
		return next ? (fixes.add(next),fix_function(content.replace(next.start, next.index),fixes)):fixes
		//scope actions
		function get_fragment(text){
			if(text.indexOf(functions.start) === -1) return null
			const fragment = text.substring(text.lastIndexOf(functions.start) + functions.count, text.lastIndexOf(functions.end))
			const prefix = fragment.startsWith(functions.breaks) ? functions.breaks:functions.inline
			const start = `${functions.start}${fragment}${functions.end}`
			const fixed = fragment.replace(prefix.trim(), '')
			const from_fragment = `${fixed}${functions.end}`
			const to_fragment = `${fixed.replace(fixed.trim(),'')}function ${fixed.trim()}${functions.end}`
			return {start, from: from_fragment, prefix, index: `<<${fixes.size}>>`, to: to_fragment, valid: fragment.replace(prefix, '').trim().startsWith('function')}
		}
	}

	function fix_functions(text){
		if(text.includes(functions.start) === false) return text
		functions.count = functions.count || functions.start.length
		let fixes = fix_function(text, new Set())
		for(const fix of fixes) if(fix.valid === false) text = text.replace(fix.from,fix.to)
		return (fixes=null,text)
	}

	async function import_meta(locator){
		const {is} = window.modules
		try{
			if(!window.modules.yaml || !window.modules.esprima) await window.modules.wait('modules.esprima','modules.yaml')
			return window.modules.meta.load(await load_content(locator))
		}
		catch(error){
			console.error(error)
			throw error
		}

		//scope actions
		async function load_content(url, base_url, content=null){
			if(URL.is(url)) url = new URL(url)
			if(URL.is(base_url)) base_url = new URL(base_url)
			if(is.url(url) && is.not.url(base_url)) base_url = url
			if(is.url(url)) content = (await window.modules.http.get(url)).content
			return await prepare_content(content, url, base_url)
		}
	}

	async function prepare_content(content, locator){
		content = await meta_source(content, locator)
		if(content.includes('${') && window.modules.has('tag') === false) await window.modules.import.function('tag')
		return content
	}

	async function meta_source(){
		const import_field = '->:'
		const url = window.modules.is.url(arguments[1]) ? arguments[1]:new URL(window.modules['@meta'] || arguments[1] || URL.base())
		return read({ field: `@base`,name: 'base',notation: '',url: new URL(`package.meta`, url) }, arguments[0])
		//scope actions
		async function read(base, content){
			if(content.includes(import_field) === false) return content
			let sources = lines(content)
			if(sources.length){
				sources = sources.map(source_list)
				for(const source of sources) content = content.replace(source.replacer, await source.content())
			}
			return content
			//scope actions
			function lines(){ return arguments[0].split('\n').filter(valid) }
			function source_list(line){
				return {
					async content(text=''){
						for(const item of this.list){
							text+=`\n'${item.field}': &${item.notation}\n\t${(await item.load()).replace(/\n/g, '\n  ')}\n`
						}
						return text
					},
					list: clean(line.replace(import_field, '')).map(source_item),
					replacer: line
				}
				function clean(){ return arguments[0].split(' ').map(trim).filter(empty) }
				function empty(fragment){ return fragment.length > 0 }
				function source_item(name){
					return {
						field: `@${name}`,
						async load(){ return await window.modules.http(this.url).then(response=>read(this, response.content)) },
						name,
						notation: [base.notation, name].map(trim).filter(empty).join('/'),
						url: new URL(`@${name}/package.meta`, base.url)
					}
				}
				function trim(fragment){ return fragment.trim() }
			}
			function valid(line){ return line.indexOf(import_field) === 0 }
		}
	}



})
