(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('meta',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('meta')?_.get('meta'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(expressions){
	const symbol = Symbol('meta data')
	class Meta{
		get content(){ return load_content }
		get lex(){ return window.modules.get('esprima') }
		async import(locator){ return await import_meta(this, locator) }
		load(content){ return this.yaml.load(content) }
		get symbol(){return symbol }
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

}, [function expressions(){
	return [
		{
			phrase: /\(\)\>/,
			expression: /\(\)\>/g,
			replace: '!!js/function >'
		}
	]
}])
