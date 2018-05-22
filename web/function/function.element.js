(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Element', {value:await module(...inputs)}); return window.modules.has('Element')?window.modules.get('Element'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){

	//exports
	return {
		all,
		content,
		create,
		defined,
		gui,
		has,
		mix,
		query,
		xml
	}

	//shared actions
	function all(element = document.body, selector = '*',  filter = ()=>true){ return Array.from(element.querySelectorAll(selector)).filter(filter) }

	function content(element){ return element.shadowRoot ? element.shadowRoot:element }

	function create(tag, options = {}, load, error, asset = null){ return (asset = document.createElement(tag), load ? asset.onload = load:true, error ? asset.onerror = error:true, tag === 'link' ? asset.rel = !options.extension || options.extension === 'css' ? 'stylesheet':'import':true, ['async', 'defer', tag === 'link' ? 'href':'src'].filter(i=>(i in options)).reduce((x, i)=>(asset[i] = options[i], x), asset)) }

	function defined(name){ return window.customElements.get(name) === 'undefined' }

	function gui(element = document){ return new Proxy(element && element.shadowRoot ? element.shadowRoot:element, {get(o, field){return o.getElementById(field)}}) }

	function has(selector, container = document){ return container.querySelector(selector) !== null }

	function mix(BaseElement = HTMLElement, ...Mixins){ return mixins(true, ...Mixins).reduce((Base, Mix)=>Mix(Base), BaseElement) }

	function mixins(mixins = true, ...x){ return x.filter(i=>(typeof i === 'function' && i.constructor.name !== 'AsyncFunction') === mixins) }

	function query(selector=':first-child', element = document.body){ return element.querySelector(selector) }

	function xml(element = document.documentElement){ return new Proxy(element, {deleteProperty(o, i){ return (o.removeAttribute(i), true) }, get(o, i){ return (a=>a === '' ? true:a)(i.includes('aria-') ? o.getAttribute(i) === 'true':o.getAttribute(i)) }, has(o, i){ return o.hasAttribute(i) }, set(o, i, x){ return (a=>(a === null ? o.removeAttribute(i):o.setAttribute(i, a), true))(x === true && !i.includes('aria-') ? '':x === false && !i.includes('aria-') ? null:x) }}) }
})