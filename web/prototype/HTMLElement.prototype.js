((define, ElementSourceCode)=>'prototyped' in HTMLElement ? null:define(ElementSourceCode()))((SourceCode)=>{
	HTMLElement.prototyped = 0.09
	const Properties = {
		all: {value: all},
		aria: {get(){return window.modules.element.aria(this)}},
		bound: {get(){return window.modules.element.bound(this)}},
		dispatch: {value: dispatch},
		gui: {get(){return window.modules.element.gui(this)}},
		insert: {value: insert},
		off: {value: off},
		on: {value: on},
		once: {value: once},
		ui: {get(){return window.modules.element.ui(this, 'cssPrefix' in this.dataset ? this.dataset.cssPrefix:false)}},
		xml: {get(){return window.modules.element.xml(this) }}
	}
	Object.defineProperties(HTMLElement, { SourceCode: {value: SourceCode}, source_code: {get(){ return new Proxy(SourceCode, {get: (target, field)=>(field in target ? target[field]:(target(this)[field] || null))}) }, configurable: true} })
	Object.defineProperties(HTMLElement.prototype, Properties)
	Object.defineProperties(SVGElement.prototype, Properties)

	//scope actions
	function all(...selector_and_filter){ return window.modules.element.all(this,...selector_and_filter) }
	function dispatch(){ return window.modules.element.dispatch.apply(this, arguments) }
	function insert(content){
		if(typeof content !== 'string' && content.nodeType !== 1) content = content.nodeValue
		const insert_type = typeof content === 'string' ? 'insertAdjacentHTML':'insertAdjacentElement'
		return {
			after: ()=>insert_after(this),
			before: ()=>insert_before(this),
			end: ()=>insert_end(this),
			start: ()=>insert_start(this)
		}
		//scope actions
		function insert_after(container){ return (container[insert_type]('afterEnd', content), container) }
		function insert_before(container){ return (container[insert_type]('beforeBegin', content), container) }
		function insert_end(container){ return (container[insert_type]('beforeEnd', content), container) }
		function insert_start(container){ return (container[insert_type]('afterBegin', content), container) }
	}
	function off(){ return window.modules.element.off.apply(this, arguments) }
	function on(){ return window.modules.element.on.apply(this, arguments) }
	function once(){ return window.modules.element.once.apply(this, arguments) }
}, function ElementSourceCode(){
	function SourceCode(){
		if(this instanceof SourceCode === false) return new SourceCode(...arguments)
		this.name = window.modules.is.element(arguments[0]) ? arguments[0].constructor.name:arguments[0].name
		this.tag = window.modules.is.element(arguments[0]).localName || window.modules.id.dash(this.name)
		this.url = window.modules.is.url(arguments[1]) ? arguments[1]:new URL(get_source(window.modules.is.text(arguments[1]) ? arguments[1]:`${this.tag}.js`))
	}

	//exports
	SourceCode.all = get_source_elements
	SourceCode.get = get_source
	SourceCode.url = get_source_url
	SourceCode.prototype = {
		get at(){ return (...input)=>this.folder.at(...input) },
		get design(){ return new URL('design', this.folder) },
		get elements(){ return get_source_elements(this.folder.href) },
		get folder(){ return this.url.is.folder ? this.url:new URL(this.url.href.replace(this.url.file, '')) }
	}
	return SourceCode

	//scope actions
	function get_source(url, source = null){
		if(window.modules.is.url.text(url)) return url
		const expression = new RegExp(url)
		for(let index = 0; index < window.document.scripts.length; index++) if(expression.test(source = window.document.scripts.item(index).src)) return source
		return URL.join(url).href
	}
	function get_source_url(){ return new URL(get_source(...arguments)) }
	function get_source_elements(folder){
		const expression = new RegExp(folder)
		return Array.from(window.document.querySelectorAll('link[href], script[src]')).filter(source=>(source.href || source.src) && expression.test(source.href || source.src))
	}
})
