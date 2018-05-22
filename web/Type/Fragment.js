(function(ExportFragment,...x){ return inputs=>ExportFragment(inputs, ...x) })
(function ExportFragment(inputs=window.modules,FragmentTools, ...x){
	const tools = x.reduce((tools, tool)=>tool(tools), FragmentTools())

	class Fragment{
		static get append(){ return root_content_append }
		static get construct(){ return root_content_construct }

		static get load(){ return load_fragment }

		static get import_document(){ return import_document }
		static get import_content(){ return import_content }
		static get import_styles(){ return import_styles }
		static get import_template(){ return import_template }

		static is(x){ return x instanceof Fragment }
		static is_element(x){ return x instanceof DocumentFragment || x instanceof HTMLElement }

		static get tools(){ return tools }
		static get write(){ return root_content_write }

		constructor(template_document){
			this.tag = 'custom-element-name'
			this.document = template_document
		}
		get list(){ return modules.element.all(this.document, `template:not(#${this.tag})`) }
		set(element, data){ return tools.set_fragment(this,element,data) }
		template(id){ return import_content(get_template(this.document, id)) }
	}

	//exports
	window.modules.fragment = new Proxy(function create_fragment(...x){ return new Fragment(...x) },{
		get(o,field){ return Fragment[field] },
		has(o, field){ return field in Fragment }
	})
	return Fragment

	//shared actions
	function get_template(o, id){ return o.getElementById(id) }

	async function import_document(url){ return (await inputs.http(url, http.content_headers.html)).document }

	function import_content(template){ return document.importNode(template.content, true) }

	function import_styles(host, ...styles){
		const style = document.createElement('style')
		style.innerHTML = `${styles.map(locator=>locator instanceof URL ? locator:new URL(locator, window.location.origin)).map(locator=>`@import url('${locator}');`).join('\n')}`
		return host.shadowRoot.firstElementChild ? host.shadowRoot.insertBefore(style, host.shadowRoot.firstElementChild):host.shadowRoot.appendChild(style)
	}

	async function import_template(url, selector='template', template_document=null){
		return (template_document = url instanceof URL||typeof(url)==='string'?await import_document(url):url, import_content(template_document.querySelector(selector)))
	}

	async function load_fragment(url){ return new Fragment(await import_document(url)) }

	function root_content_append(host, content, ...styles){
		if(content instanceof HTMLTemplateElement) content = import_content(content)
		return (host.shadowRoot.appendChild(content), import_styles(host, ...styles), host)
	}

	function root_content_construct(host, content, ...styles){
		root_content_append(host, get_template(content.document, content.tag = host.localName), ...styles).fragment = content
		return host
	}

	function root_content_write(host, content, ...styles){ return (host.shadowRoot.innerHTML = content, import_styles(host, ...styles), host) }


}, function FragmentDataTools(){

	return {
		get_notation_from_text,
		get_value_from_data,
		set_text_from_data,
		set_attributes_from_data
	}

	//shared actions
	function get_notation_from_text(text){
		if(text.indexOf('${') === -1) return null
		return text.substring(text.lastIndexOf("${") + 2, text.lastIndexOf("}"))
	}

	function get_value_from_data(data, notation){
		let x = null
		try{ x = eval(`(x, id)=>{
			return (x.${notation})
		}`)(data) }
		catch(e){ x = get_value() }
		return x === null || typeof x === 'undefined' ? '':x

		//shared actions
		function get_value(){
			try{return notation.split('.').reduce((o, i)=>o[i], data)}
			catch(e){return null}
		}
	}

	function set_attributes_from_data(element, data){
		if(typeof data !== 'object' || data === null) return element
		const attributes = element.attributes
		const count = attributes.length
		for(let i = 0; i < count; i++){
			const attribute = attributes.item(i)
			const value = attribute.value
			if(value){
				const new_value = get_value_from_data(value, data)
				if(value !== new_value) element.setAttribute(attribute.name, new_value)
			}
		}
		return element
	}

	function set_text_from_data(text, data){
		let notation = get_notation_from_text(text)
		if(notation === null) return text
		const replacer = ['\$\{', notation, '\}'].join('')
		const value = get_value_from_data(data, notation)
		text = text.replace(replacer, value)
		return set_text_from_data(text, data)
	}


}, function FragmentBindTools(tools){
	const field_selector = 'field'
	const html_fragment = Symbol('original html text fragment')

	tools.set_fragment = set_fragment
	return tools

	//shared actions
	function data_list(data, notation){
		const nested_data = notation ? tools.get_value_from_data(data, notation):data
		if(nested_data) return Array.isArray(nested_data) ? nested_data:[nested_data]
		return null
	}

	function get_bind_target(element){
		if(element instanceof ShadowRoot !== true && element instanceof DocumentFragment !== true && element.hasAttribute('bind-target')) return element
		else if(element.querySelector('[bind-target]') !== null) return element.querySelector('[bind-target]')
		return element
	}

	function get_field_target(element, notation){ return element.querySelector(`${field_selector}[name="${notation}"]`) }

	function get_fragment_field(fragment){ return new Proxy(loop_items, { get(o, field){ return (...x)=>loop_items(fragment, field, ...x) } }) }

	function loop_items(fragment, id, ...items){
		const loop = items.map(data=>{
			const element = fragment.template(id)
			Array.from(element.children).forEach(on_element)
			return {id, data, element}
			//shared actions
			function on_element(i){
				fragment.set(i, data, true)
				const attributes = Array.from(i.attributes)
				for(const attribute of attributes){
					const notation = tools.get_notation_from_text(attribute.value)
					if(notation){
						const value = tools.get_value_from_data(data, notation)
						if(value === null || value === undefined) i.removeAttribute(attribute.name)
						else i.setAttribute(attribute.name, value)
					}
				}
			}
		})

		loop.id = id
		loop.set = set_field

		return loop

		//shared actions
		function set_field(element){
			const target = get_field_target(element, this.id)
			target.innerHTML = ''
			this.forEach(item=>target.appendChild(item.element))
			return fragment
		}
	}

	function set_fragment(fragment, element, data){
		const bind_target = get_bind_target(element)
		const bind_type = 'innerHTML'
		if(html_fragment in bind_target !== true) bind_target[html_fragment] = bind_target[bind_type]
		bind_target[bind_type] = tools.set_text_from_data(bind_target[html_fragment], data)

		return loop_nested()

		function loop_nested(){
			const repeats = select_all(element, field_selector)
			const fragment_field = get_fragment_field(fragment)
			for(const repeat of repeats){
				const name = repeat.getAttribute('name')
				const notation = repeat.hasAttribute('import') ? null:(repeat.hasAttribute('notation') ? repeat.getAttribute('notation'):name)
				const nested_data = data_list(data, notation)
				if(nested_data) fragment_field[name](...nested_data).set(element)
			}
			return fragment
		}
	}

	function select_all(element, selector = 'template', filter = ()=>true){ return Array.from(element.querySelectorAll(selector)).filter(filter) }

})