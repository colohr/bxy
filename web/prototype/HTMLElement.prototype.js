(define=>'prototyped' in HTMLElement ? null:define())(()=>{
	HTMLElement.prototyped = 0.01
	HTMLElement.prototype.insert = function insert(content){
		const insert_type = typeof content === 'string' ? 'insertAdjacentHTML':'insertAdjacentElement'
		return {
			after: element=>insert_after(element,this),
			before: element=>insert_before(element,this),
			end: ()=>insert_end(this),
			start: ()=>insert_start(this)
		}
		//shared actions

		function insert_after(element,container){
			if(element === null) container[insert_type]('afterEnd', content)
			else if(element.nextSibling) container.insertBefore(content, element.nextSibling)
			else container.appendChild(content)
			return container
		}
		function insert_before(element=null, container){
			if(element === null) container[insert_type]('beforeBegin',content)
			else container.insertBefore(content, element)
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