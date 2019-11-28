(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('gui.function.root_list', {value:await module(...inputs)}); return window.modules.has('gui.function.root_list')?window.modules.get('gui.function.root_list'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(...x){
	const {is} = window.modules

	//exports
	return root_list


	//scope actions
	function get_elements(root,type){
		if(root.connected){
			if(is.data(type) === false) type = {exclude: null, include: null}
			return Array.from(root.children).filter(filter)
		}
		return []

		//scope actions
		function filter(item){
			if(!item.parentElement) return false
			if(type.exclude) return type.exclude.includes(item.localName) === false
			if(type.include) return type.include.includes(item.localName)
			return true
		}
	}

	function get_first(list){
		return {
			get element(){ return list.elements[0] || null },
			get style(){ return list.styles[0] || null }
		}
	}

	function get_last(list){
		return {
			get element(){ return list.elements.reverse()[0] || null },
			get style(){ return list.styles.reverse()[0] || null }
		}
	}

	function root_list(root){
		return {
			add(...items){
				for(const item of items){
					if(is.element(item)) root.appendChild(item)
					else this.end(item)
				}
				return this
			},
			after(...items){
				let target = this.first.element
				if(target && target.parentElement) {
					for(const item of items) {
						if(!target.parentElement) return this.after(...items)
						target.insert(items.splice(0,1)[0]).before()
					}
				}
				else this.add(...items)
				return this
			},
			before(...items){
				let first = this.first
				let target = first.style || first.element
				if(target && target.parentElement) {
					for(const item of items) {
						if(!target.parentElement) return this.before(...items)
						target.insert(items.splice(0, 1)[0]).before()
					}
				}
				else this.add(...items)
				return this
			},
			get connected(){ return root.host.isConnected   },
			get elements(){ return get_elements(root, {exclude: ['style', 'script']}) },
			end(...items){
				let target = root.lastElementChild
				for(const item of items) {
					if(target.parentElement === null) return this.end(...items)
					target.insert(items.splice(0, 1)[0]).after()
				}
				return this
			},
			get first(){ return get_first(this) },
			has(selector){ return root.querySelector(selector) !== null },
			get last(){ return get_last(this) },
			start(...items){
				let target = this.last.style
				if(target && target.parentElement)
					for(const item of items) {

						if(target.parentElement === null) return this.start(...items)
						target.insert(items.splice(0,1)[0]).after()
					}
				else this.after(...items)
				return this
			},
			get styles(){ return get_elements(root, {include: ['style']}) }
		}
	}
})
