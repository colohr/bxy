(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('element', {value:await module(...inputs)}); return window.modules.has('element')?window.modules.get('element'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	await window.modules.wait('HTMLElement.prototyped')
	const load_attributes = ['async', 'defer', 'href', 'rel', 'src', 'type']

	//exports
	const aria_function = aria
	aria_function.delete = aria_delete
	aria_function.field = aria_field
	aria_function.get = aria_get
	aria_function.has = aria_has
	aria_function.set = aria_set
	aria_function.value = aria_value

	const create_function = create
	create_function.svg = create_svg
	create_function.event = create_event
	create_function.range = create_range

	const get_function = gui
	get_function.all = all
	get_function.content = content
	get_function.focused = focused
	get_function.definition = get_definition
	get_function.document = get_document
	get_function.element = get_element
	get_function.host = get_host
	get_function.root = get_root
	get_function.selection = get_selection
	get_function.supersets = get_supersets

	const svg_element = create_svg
	svg_element.canvas = get_svg_canvas

	const set_function = set_properties
	set_function.selection = set_selection

	const define_function = define_element
	define_function.style = define_style_property

	return {
		all,
		aria: aria_function,
		focused,
		get body(){ return this.document.body },
		bound: get_bound,
		content,
		create: window.modules.set('create.element', create_function),
		define: define_element,
		defined,
		direct: direct_event,
		dispatch,
		get document(){ return window.document },
		get: window.modules.set('get.element',get_function),
		gui,
		has,
		get head(){ return this.document.head },
		get host(){ return get_host },
		matches,
		mix,
		off: event_off,
		on: event_on,
		once: event_once,
		query,
		remove,
		set: window.modules.set('set.element', set_function),
		svg: create_svg,
		ui,
		xml
	}

	//scope actions
	function all(element = document.body, selector=null, filter = ()=>true){ return Array.from(selector?content(element).querySelectorAll(selector):content(element).children).filter(filter) }

	function aria(element = document.documentElement){ return new Proxy(element, { deleteProperty:aria_delete, get:aria_get, has: aria_has, set: aria_set }) }

	function aria_delete(element, field){ return (element.removeAttribute(aria_field(field)),true) }

	function aria_field(field){ return field === 'role' || field === 'tabindex' || field.startsWith('aria-') ? field:`aria-${field}` }

	function aria_get(element, field){ return aria_value(element.getAttribute(aria_field(field))) }

	function aria_has(element, field){ return element.hasAttribute(aria_field(field))  }

	function aria_set(element, field, value){ return (element.setAttribute(aria_field(field), value), true) }

	function aria_value(value){
		if(value === 'true' || value === 'false') value = value === 'true'
		return window.modules.is.text(value) || window.modules.is.number(value) || window.modules.is.TF(value) ? value:value
	}

	function content(element){ return element.shadowRoot ? element.shadowRoot:element }

	function create(tag, options = {}, load, error, element = null){
		element = document.createElement(tag)
		if(load){
			options = create_load_options(tag, options)
			element.onload = load
			element.onerror = error
		}
		return set_properties(element,options)
	}

	function create_event(...inputs){
		const target = event_target.apply(this, inputs)
		let event = event_items(target, ...inputs).filter(item=>item instanceof Event)[0] || null
		if(event === null) {
			const type = event_type(...inputs)
			inputs = event_items(type,...inputs).filter(window.modules.is.not.nothing)
			let setting = inputs[0] || null
			setting = window.modules.is.data(setting) && 'detail' in setting ? setting:Object.assign({bubbles:true,detail: setting}, inputs[1] || null)
			event = new CustomEvent(type, setting)
			setting=null
		}
		return event
	}

	function create_load_options(tag, options){
		const extension = options.extension
		if(tag === 'link') options.rel = extension === 'html' ? 'import':'stylesheet'
		if(tag === 'link' && !options.href && options.url) options.href = options.url
		else if(tag === 'script' && !options.src && options.url) options.src = options.url
		if(options.src instanceof URL && options.src.searchParams.has('module')) options.type='module'
		return load_attributes.reduce((data,name)=>(name in options ? data[name] = options[name]:null,data),{})
	}

	function create_range(){ return window.document.createRange() }

	function create_svg(type='svg'){ return window.document.createElementNS('http://www.w3.org/2000/svg', type) }

	function define_element(){ return defined(arguments[0]) ? get_definition(arguments[0]):(window.customElements.define(...arguments), arguments[1]) }

	function define_style_property(...definition){
		const element = definition.filter(item=>item instanceof Element)[0] || this
		if(definition.includes(element)) definition.splice(definition.indexOf(element),1)
		const field = definition.filter(window.modules.is.text)[0]
		definition.splice(definition.indexOf(field),1)
		element.style.defineProperties(get_style_field(field), ...definition)
		return element
	}

	function direct_event(origin_event, ...input){
		const host = get_host(origin_event.currentTarget)
		const event = create_event(input.filter(window.modules.is.text)[0], Object.assign({event:origin_event}, ...input.filter(window.modules.is.data), {bubbles:true,composed:true}))
		return dispatch(host, event)
	}

	function dispatch(...inputs){
		const target = inputs.filter(item=>item instanceof EventTarget)[0] || this
		const event = create_event.apply(this, arguments)
		target.dispatchEvent(event)
		return target
	}

	function defined(name){ return window.modules.is.not.nothing(get_definition(name)) }

	function event_functions(target, type){
		return target[Symbol.for(`Listeners.${type}`)] = target[Symbol.for(`Listeners.${type}`)] || new class Listeners extends Set{
			constructor(){
				super()
				this.type = type
				this.symbol = Symbol.for(`Listeners.${type}`)
			}
			get count(){ return this.size }
			clear(element){
				for(const item of this) element.removeEventListener(this.type, item)
				for(const item of this) element.removeEventListener(this.type, item)
				delete element[this.symbol]
				return (super.clear(), element)
			}
		}
	}

	function event_items(remove, ...items){ return (items.includes(remove) ? items.splice(items.indexOf(remove), 1):null, items)  }

	function event_listener(...items){ return items.filter(window.modules.is.function)[0] || null }

	function event_off(...items){
		const target = event_target.apply(this, items)
		const type = event_type.apply(this, event_items(target, ...items))
		const listener = event_listener.apply(this, event_items(type, ...items))
		const functions = event_functions(target, type)
		let count = 0
		if(listener){
			target.removeEventListener(type, listener, event_setting.apply(this, event_items(listener, ...items)))
			functions.delete(listener)
			count = functions.count
 		}
		return count ? target:functions.clear(target)
	}

	function event_on(...items){
		const target = event_target.apply(this, items)
		const type = event_type.apply(this, event_items(target, ...items))
		const listener = event_listener.apply(this, event_items(type, ...items))
		const setting = event_setting.apply(this, event_items(listener, ...items))
		if(window.modules.is.not.data(setting) || setting.once !== true) event_functions(target, type).add(listener)
		target.addEventListener(type, listener, setting)
		return target
	}

	function event_once(...items){
		const setting = Object.assign(event_setting.apply(this, items) || {},{once:true})
		return event_on.apply(this, event_items(setting, ...items).concat([setting]))
	}

	function event_setting(...items){ return items.filter(window.modules.is.data)[0] || false }

	function event_target(...items){ return items.filter(item=>item instanceof EventTarget)[0] || this }

	function event_type(...items){ return items.filter(window.modules.is.text)[0] || null }

	function focused(){ return get_document(arguments[0]).activeElement || window.document.activeElement }

	function get_bound(element){
		return {
			get area(){ return element.getBoundingClientRect() },
			get center(){ return {x:this.width/2, y:this.height/2} },
			get design(){ return {get style(){ return window.getComputedStyle(element) }, value: get_value} },
			get height(){ return element.clientHeight },
			get size(){ return get_size.call(this,get_boundary()) },
			get width(){ return element.clientWidth }
		}
		//scope actions
		function get_boundary(){ return element.boundary || element.constructor.boundary || [10,10] }
		function get_size([minimum_width, minimum_height]){
			const width = this.width
			const height = this.height
			return height > minimum_height && width > minimum_width ? {height, width}:null
		}
		function get_value(name){
			const value = this.style[name]
			const number = parseFloat(value)
			return isNaN(value) ? number:value
		}
	}

	function get_definition(name){ return window.customElements.get(name) || null }

	function get_document(element){
		if(window.modules.is.node(element)){
			if(window.modules.is.document(element)) return element
			return get_document(element.parentNode)
		}
		return window.document
	}

	function get_element(){ return window.is.element(arguments[0]) ? arguments[0]:(window.is.svg(arguments[0]) ? arguments[0]:null)  }

	function get_host(element){ return get_document(element).host || get_root(element) }

	function get_root(element){
		if(window.modules.is.node(element)){
			if(element === window.modules.element.head) return element
			else if(element === window.modules.element.body) return element
			else if(window.modules.is.document(element)) return element
			return get_root(element.parentNode)
		}
		return window.document.body
	}

	function get_selection(){ return get_document(arguments[0]).getSelection() }

	function get_style_field(field, property_prefix=''){
		if(typeof property_prefix !== 'string') property_prefix = ''
		if(field.indexOf('--') === 0) return field
		field = window.modules.id.dash(field)
		if(property_prefix && field.indexOf(property_prefix) !== 0) field = `--${property_prefix}-${field}`
		if(field.indexOf('--') !== 0) field = `--${field}`
		return field
	}

	function get_supersets(element, selector){
		//get_ancestors_by_selector
		if(!matches(element, `${selector} ${element.tagName}`)){
			return null // Element is not inside an element that matches selector
		}

		// Move up the DOM tree until a parent matching the selector is found
		let current = element
		let superset = null
		while(superset === null){
			if(matches(current.parentNode, selector)) superset = current.parentNode
			else current = current.parentNode
		}
		return superset
	}

	function get_svg_canvas(item){
		item = get_element(item)
		if(window.is.svg(item)) return item.localName === 'svg' ? item:item.viewportElement
		return item = null
	}

	function gui(element = document){
		if(element !== document) element = content(element)
		const has_get_element_by_id = 'getElementById' in element

		//exports
		return new Proxy(query_selector,{deleteProperty: delete_elements, get: get_element_by_id, has: has_elements})

		//scope actions
		function delete_elements(o,selector){ return (all(element, selector).forEach(x=>x.remove()),true) }
		function get_element_by_id(o,id){ return has_get_element_by_id ? element.getElementById(id):query_selector(`#${id}`) }
		function has_elements(o,selector){ return all(element, selector).length > 0 }
		function query_selector(selector = '*'){ return query(selector, element) }
	}

	function has(selector, container=document){ return container.querySelector(selector) !== null }

	function matches(element, selector){
		if(!Element.prototype.matches){
			Element.prototype.matches =
				Element.prototype.matchesSelector ||
				Element.prototype.mozMatchesSelector ||
				Element.prototype.msMatchesSelector ||
				Element.prototype.oMatchesSelector ||
				Element.prototype.webkitMatchesSelector ||
				function matches_polyfill(){
					const matches = element.parentNode.querySelectorAll(arguments[0])
					let count = matches.length
					while(--count >= 0 && matches.item(count) !== this){}
					return count > -1
				}
		}
		return element.matches(selector)
	}

	function mix(BaseElement=HTMLElement, ...Mixins){ return mixins(true, ...Mixins).reduce((Base, Mix)=>Mix(Base), BaseElement) }

	function mixins(mixins=true, ...x){ return x.filter(i=>(typeof i === 'function' && i.constructor.name !== 'AsyncFunction') === mixins) }

	function query(selector=':first-child', element=document.body){ return content(element).querySelector(selector) }

	function remove(item){
		if(item.remove && window.modules.is.function(item.remove)) return item.remove()
		if(item.parentNode && item.parentNode.removeChild && window.modules.is.function(item.parentNode.removeChild)){
			return item.parentNode.removeChild(item)
		}
		return false
	}

	function set_properties(element, options){
		for(const field in options){
			const value = options[field]
			switch(field){
				case 'attributes':
					set_attributes(value)
					break
				case 'style':
				case 'css':
					set_styles(value)
					break
				case 'html':
				case 'innerHTML':
				case 'content':
					element.innerHTML = value
					break
				case 'dataset':
					set_dataset(value)
					break
				default:
					if(typeof value === 'function' || (value && typeof value === 'object')) element[field] = value
					else set_attribute(field,value)
					break
			}
		}

		//exports
		return element

		//scope actions
		function set_attribute(field, value){
			if(typeof value === 'boolean' && field.indexOf('aria-') !== 0) value = value === true ? '':null
			else element.setAttribute(field,value)
			return value === null ? element.removeAttribute(field):element.setAttribute(field, value)
		}

		function set_attributes(attributes){
			for(const field in attributes) set_attribute(field, attributes[field])
			return element
		}

		function set_dataset(dataset){
			for(const field in dataset) element.dataset[field] = dataset[field]
			return element
		}

		function set_styles(styles){ return (Object.assign(element.style, styles), element) }
	}

	function set_selection(target){
		if(window.modules.is.not.node(target) && target instanceof Event) target = target.currentTarget || target.target
		if(window.modules.is.not.node(target) && window.modules.is.node(this)) target = this
		if(window.modules.is.not.node(target)) target = active()
		const selection = get_selection(target)
		selection.extend(target)
		return selection
	}

	function ui(element, property_prefix){
		return new Proxy(element.style, {
			get(o, field){ return o.getPropertyValue(get_style_field(field, property_prefix)) },
			has(o, field){ return o.getPropertyValue(get_style_field(field, property_prefix)).length },
			set(o, field, value){ return (o.setProperty(get_style_field(field, property_prefix), value), true) }
		})
	}

	function xml(o = document.documentElement){ return new Proxy({[Symbol('attributes')]: o.attributes}, {deleteProperty(_, i){ return (o.removeAttribute(i), true) }, get(_, i){ return (a=>a === '' ? true:a)(i.includes('aria-') ? o.getAttribute(i) === 'true':o.getAttribute(i)) }, has(_, i){ return o.hasAttribute(i) }, set(_, i, x){ return (a=>(a === null ? o.removeAttribute(i):o.setAttribute(i, a), true))(x === true && !i.includes('aria-') ? '':x === false && !i.includes('aria-') ? null:x) }}) }

})
