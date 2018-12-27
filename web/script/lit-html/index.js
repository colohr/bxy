(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('lit-html', {value:await module(...inputs)}); return window.modules.has('lit-html')?window.modules.get('lit-html'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function load_module(version='0.14.0', folder=null, location=null ,locator = (version = '', location='')=>new URL(`https://unpkg.com/lit-html${version ? `@`:''}${version}${location}`)){
	const {id,is,dot} = window.modules
	const directives = {}

	if(window.modules.has('project.dependencies.lit-html') && window.modules.get('project.dependencies.lit-html') !== version){
		version = window.modules.get('project.dependencies.lit-html')
		folder = locator(version,'/')
		location = locator(version)
	}
	else{
		folder = new URL('module/', window.modules.directory.locator('script', 'lit-html').url)
		location = new URL('lit-html.js', folder)
	}

	import_asset.directive = import_directive

	//exports
	return {
		get directive(){ return directives },
		folder,
		get import(){ return import_asset },
		location,
		module: await import(`${location}`),
		get url(){ return get_locator },
		version
	}

	//scope actions
	function get_locator(name){
		if(name.includes('.js') === false) name = `${name}.js`
		return new URL(name, folder)
	}

	async function import_asset(asset_locator){ return await import(`${asset_locator}`) }

	async function import_directive(directive_name){
		const field = id.underscore(directive_name)
		if(dot.has(directives, field)) return dot.get(directives, field)
		return set_directive(directive_name, await import_asset(get_locator(`directives/${id.dash(directive_name)}`)))
	}

	function set_directive(directive_name, directive=null){
		if(is.data(directive) === false) return console.warn(`lit-html directive: "${directive_name}" failed to load`)
		return Object.entries(directive).reduce(reduce, directives)[id.underscore(directive_name)]
		//scope actions
		function reduce(directives, entry){
			directives[id.underscore(entry[0])] = entry[1]
			return directives
		}
	}
})
