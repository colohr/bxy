(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Mixin.Component', {value:await module(...inputs)}); return window.modules.has('Mixin.Component')?window.modules.get('Mixin.Component'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(...x){
	return (shadow_root = true, Base = HTMLElement)=>class extends Base{
		constructor(){
			super()
			if(shadow_root){
				const shadow = this.attachShadow({mode: 'open'})
				if(typeof shadow_root === 'string') shadow.innerHTML = shadow_root
			}
		}
		all(selector = '*', target){ return Array.from((target || this.component_container).querySelectorAll(selector)) }
		get component_container(){ return this.shadowRoot ? this.shadowRoot:this }
		get gui(){ return new Proxy(this.component_container, {get(o, field){return o.getElementById(field)}}) }
		query(selector = '*'){ return this.component_container.querySelector(selector) }
		get xml(){ return new Proxy(this, {deleteProperty(o, i){ return (o.removeAttribute(i), true) }, get(o, i){ return (a=>a === '' ? true:a)(i.includes('aria-') ? o.getAttribute(i) === 'true':o.getAttribute(i)) }, has(o, i){ return o.hasAttribute(i) }, set(o, i, x){ return (a=>(a === null ? o.removeAttribute(i):o.setAttribute(i, a), true))(x === true && !i.includes('aria-') ? '':x === false && !i.includes('aria-') ? null:x) }}) }
	}
})