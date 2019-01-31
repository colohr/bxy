(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('meta', {value:await module(...inputs)}); return window.modules.has('meta')?window.modules.get('meta'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	(await window.modules.wait('modules.http.assets',true)).call(this,window.modules.http.locator.script('meta/esprima/index.js'))
	const symbol = Symbol('meta')
	const context = {phrase: /\(\)\>/, expression: /\(\)\>/g, replace: '!!js/function >'}
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
		get symbol(){return symbol }
		text(meta){ return this.yaml.dump(meta,{ skipInvalid: true, noRefs: true }) }
		get to(){ return this.text }
		get yaml(){ return window.modules.get('yaml') }
	}


	//exports
	return new Meta()

	//scope actions
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
		async function load_content(){
			if(is.text(arguments[0]) && URL.is(arguments[0])) arguments[0] = new URL(arguments[0])
			if(is.text(arguments[1]) && URL.is(arguments[1])) arguments[1] = new URL(arguments[1])
			if(is.url(arguments[0]) && is.url(arguments[1]) === false) arguments[1] = arguments[0]
			if(is.url(arguments[0])) arguments[0] = (await window.modules.http.get(arguments[0])).content
			return await prepare_content(...arguments)
		}
	}

	async function prepare_content(content, locator){
		content = await meta_source(content, locator)
		if(content.includes('${') && window.modules.has('tag') === false) await window.modules.import.function('tag')
		//if(context.phrase.test(content)) content = content.replace(context.expression, context.replace)
		return content
	}

	async function meta_source(){
		const import_field = '->:'
		const url = new URL(window.modules['@meta'] || arguments[1] || URL.base())
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
