(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('element', {value:await module(...inputs)}); return window.modules.has('element')?window.modules.get('element'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const load_attributes = ['async', 'defer', 'href', 'rel', 'src', 'type']

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
		set: create_set_options,
		ui,
		xml
	}

	//scope actions
	function all(element = document.body, selector=null, filter = ()=>true){ return Array.from(selector?content(element).querySelectorAll(selector):content(element).children).filter(filter) }

	function content(element){ return element.shadowRoot ? element.shadowRoot:element }

	function create(tag, options = {}, load, error, element = null){
		element = document.createElement(tag)
		if(load){
			options = create_load_options(tag, options)
			element.onload = load
			element.onerror = error
		}
		return create_set_options(element,options)
	}

	function create_load_options(tag, options){
		const extension = options.extension
		if(tag === 'link') options.rel = extension === 'html' ? 'import':'stylesheet'
		if(tag === 'link' && !options.href && options.url) options.href = options.url
		else if(tag === 'script' && !options.src && options.url) options.src = options.url
		if(options.src instanceof URL && options.src.searchParams.has('module')) options.type='module'
		if('async' in options === false) options.async = true
		if('defer' in options === false) options.defer = true
		return load_attributes.reduce((data,name)=>(name in options ? data[name] = options[name]:null,data),{})
	}

	function create_set_options(element, options){
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

	function defined(name){ return typeof window.customElements.get(name) !== 'undefined' }

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

	function mix(BaseElement=HTMLElement, ...Mixins){ return mixins(true, ...Mixins).reduce((Base, Mix)=>Mix(Base), BaseElement) }

	function mixins(mixins=true, ...x){ return x.filter(i=>(typeof i === 'function' && i.constructor.name !== 'AsyncFunction') === mixins) }

	function query(selector=':first-child', element=document.body){ return content(element).querySelector(selector) }

	function ui(element, property_prefix=''){
		if(typeof property_prefix !== 'string') property_prefix = ''

		//exports
		return new Proxy(element.style, {
			get(o, field){ return o.getPropertyValue(get_field(field)) },
			has(o, field){ return o.getPropertyValue(get_field(field)).length },
			set(o, field, value){ return (o.setProperty(get_field(field), value), true) }
		})

		//scope actions
		function get_field(field){
			if(field.indexOf('--') === 0) return field
			field = window.modules.id.dash(field)
			if(property_prefix && field.indexOf(property_prefix) !== 0) field = `--${property_prefix}-${field}`
			if(field.indexOf('--') !== 0) field = `--${field}`
			return field
		}
	}

	function xml(element = document.documentElement){ return new Proxy(element, {deleteProperty(o, i){ return (o.removeAttribute(i), true) }, get(o, i){ return (a=>a === '' ? true:a)(i.includes('aria-') ? o.getAttribute(i) === 'true':o.getAttribute(i)) }, has(o, i){ return o.hasAttribute(i) }, set(o, i, x){ return (a=>(a === null ? o.removeAttribute(i):o.setAttribute(i, a), true))(x === true && !i.includes('aria-') ? '':x === false && !i.includes('aria-') ? null:x) }}) }
}, async function load_assets(){
	eval(await window.fetch(new URL('prototype/HTMLElement.prototype.js', window.modules.constructor.url)).then(x=>x.text()))
})
