(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('font', {value:await module(...inputs)}); return window.modules.has('font')?window.modules.get('font'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const font = new Set(['fontawesome','san-francisco','san-francisco-text'])
	font.awesome = ['all','brands','index','solid']
	font.load = load_font
	return font
	//scope actions
	function get_locator(name,type='font'){
		if(name === 'fontawesome' && font.awesome.includes(type) === false) type = 'solid'
		return `${type}.css`
	}
	async function load_font(name,locator){
		if(this.has(name)){
			locator = get_locator(name,locator)
			if(window.modules.constructor.url.href.includes('unpkg.com')) locator = new URL(`https://unpkg.com/bxy.font/web/${name}/${locator}`)
			else locator = new URL(`../node_modules/bxy.font/web/${name}/${locator}`, window.modules.constructor.url)
			return window.modules.import.assets(locator)
		}
		return null
	}

	
})
