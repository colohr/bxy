(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('meta', {value:await module(...inputs)}); return window.modules.has('meta')?window.modules.get('meta'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(expressions){

	class Meta{
		get content(){ return load_content }
		get lex(){ return window.modules.get('esprima') }
		async import(locator){ return await import_meta(this, locator) }
		load(content){ return this.yaml.load(content) }
		text(meta){ return this.yaml.dump(meta) }
		get yaml(){ return window.modules.get('yaml') }
	}

	//exports
	return new Meta()

	//scope actions
	async function import_meta(meta, locator, assets=[]){
		if(!window.modules.has('esprima')) assets.push(window.modules.directory.locator('script', 'esprima'))
		if(!window.modules.has('yaml')) assets.push(window.modules.directory.locator('script', 'yaml'))
		if(assets.length) await window.modules.import.assets(...assets).then(()=>window.modules.wait('jsyaml','modules.esprima',true)).then(yaml=>window.modules.set('yaml',yaml))
		try{ return meta.load(await load_content(locator)) }
		catch(error){
			console.error(error)
			throw error
		}
	}

	async function load_content(locator){ return await prepare_content((await window.modules.http.get(locator)).content)  }

	async function prepare_content(content){
		if(content.includes('${') && window.modules.has('tag') === false) await window.modules.import.function('tag')
		for(const item of expressions) if(item.phrase.test(content)) content = content.replace(item.expression,item.replace)
		return content
	}

}, async function expressions(){
	return [
		{
			phrase: /\(\)\>/,
			expression: /\(\)\>/g,
			replace: '!!js/function >'
		}
	]
})
