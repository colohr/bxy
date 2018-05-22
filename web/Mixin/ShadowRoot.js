(ShadowRootMixin=>ShadowRootMixin)(async function ShadowRootMixin(modules=window.modules){
	//exports
	return (...x) => class ShadowRootContent extends modules.element.mix(...x){
		constructor(fragment, ...x){
			super()
			this.attachShadow({mode: 'open'})
			if(modules.fragment.is(fragment)) modules.fragment.construct(this, fragment, ...x)
			else if(modules.fragment.is_element(fragment)) modules.fragment.append(this, fragment, ...x)
			else if(typeof fragment === 'string') modules.fragment.write(this, fragment, ...x)
		}
		all(selector = '*', target){ return Array.from((target || modules.element.content(this)).querySelectorAll(selector)) }
		get gui(){ return modules.element.gui(modules.element.content(this)) }
		query(selector = '*'){ return modules.element.content(this).querySelector(selector) }
		get xml(){ return modules.element.xml(modules.element.content(this)) }
	}
})