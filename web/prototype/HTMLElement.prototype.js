(define=>'prototyped' in HTMLElement ? null:define())(async ()=>{
	const utility = await window.modules.wait('modules.element', true)
	HTMLElement.prototyped = 0.04
	Object.defineProperties(HTMLElement.prototype, {
		all:{value:all},
		gui:{get(){return utility.gui(this)}},
		insert:{value:insert},
		ui:{get(){return utility.ui(this,'cssPrefix' in this.dataset?this.dataset.cssPrefix:false)}},
		xml:{get(){return utility.xml(this)}}
	})

	//scope actions
	function all(...selector_and_filter){ return utility.all(this,...selector_and_filter) }

	function insert(content){
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
