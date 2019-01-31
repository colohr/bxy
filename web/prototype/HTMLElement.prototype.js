(define=>'prototyped' in HTMLElement ? null:define())(()=>{
	HTMLElement.prototyped = 0.06
	Object.defineProperties(HTMLElement.prototype, {
		all:{value:all},
		bound:{get(){return window.modules.element.bound(this)}},
		gui:{get(){return window.modules.element.gui(this)}},
		insert:{value:insert},
		ui:{get(){return window.modules.element.ui(this,'cssPrefix' in this.dataset?this.dataset.cssPrefix:false)}},
		xml:{get(){return window.modules.element.xml(this)}}
	})

	//scope actions
	function all(...selector_and_filter){ return window.modules.element.all(this,...selector_and_filter) }
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
		function insert_after(container){
			container[insert_type]('afterEnd', content)
			return container
		}

		function insert_before(container){
			container[insert_type]('beforeBegin',content)
			return container
		}

		function insert_end(container){
			container[insert_type]('beforeEnd', content)
			return container
		}

		function insert_start(container){
			container[insert_type]('afterBegin', content)
			return container
		}
	}
})
