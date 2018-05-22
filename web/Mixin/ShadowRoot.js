(ShadowRoot=>ShadowRoot)(async function ShadowRoot(modules){
	class TidyFlow extends HTMLElement{
		static get observedAttributes(){ return [] }
		static get Pod(){ return Pod }
		constructor(fragment, ...x){
			super()
			this.attachShadow({mode: 'open'})
			if(Pod.Fragment.is(fragment)) Pod.Fragment.construct(this, fragment, ...x)
			else if(Pod.Fragment.is_element(fragment)) Pod.Fragment.append(this, fragment, ...x)
			else if(typeof fragment === 'string') Pod.Fragment.write(this, fragment, ...x)
		}
		all(selector = '*', target){ return Array.from((target || this.component_container).querySelectorAll(selector)) }
		get component_container(){ return this.shadowRoot ? this.shadowRoot:this }
		get gui(){ return new Proxy(this.component_container, {get(o, field){return o.getElementById(field)}}) }
		query(selector = '*'){ return this.component_container.querySelector(selector) }
		get xml(){ return new Proxy(this, {deleteProperty(o, i){ return (o.removeAttribute(i), true) }, get(o, i){ return (a=>a === '' ? true:a)(i.includes('aria-') ? o.getAttribute(i) === 'true':o.getAttribute(i)) }, has(o, i){ return o.hasAttribute(i) }, set(o, i, x){ return (a=>(a === null ? o.removeAttribute(i):o.setAttribute(i, a), true))(x === true && !i.includes('aria-') ? '':x === false && !i.includes('aria-') ? null:x) }}) }
	}

	Pod.Mixin = get_mixed_base
	Pod.Element = get_base_element

	//exports
	return TidyFlow

	//shared actions
	function get_base_element(...Mixins){ return get_mixed_base(TidyFlow, ...Mixins) }

	function get_inputs(mixins = true, ...x){ return x.filter(i=>(typeof i === 'function' && i.constructor.name !== 'AsyncFunction') === mixins) }

	function get_mixed_base(BaseElement = HTMLElement, ...Mixins){ return get_inputs(true, ...Mixins).reduce((Base, Mix)=>Mix(Base), BaseElement) }

	//shared actions
})