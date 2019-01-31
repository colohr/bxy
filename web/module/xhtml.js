(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('html', {value:await module(...inputs)}); return window.modules.has('html')?window.modules.get('html'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(lit_html, Templets, Container){
	const is = window.modules.is
	const merge = window.modules.import.function('merge')
	const dot = window.modules.data
	const element_templet = Symbol('HTML Templet')
	const html = {
		container: Container,
		get lit(){ return this.lit_html.module },
		lit_html,
		get templet(){ return this.lit.html },
		templets: new Templets()
	}


	//exports
	return new Proxy(render_function, {
		deleteProperty(o, field){ return (is.text(field) ? dot.unset(html.templets, field):null, true) },
		get,
		has(o,field){ return field in o || field in html || (is.text(field) && dot.has(html.templets, field)) },
		set(o, field, value){ return (is.text(field) ? dot.set(html.templets, field, value):null, true) }
	})

	//scope actions
	function clear_data(element, ...fields){
		if(element_templet in element === false) return element
		if(!fields.length) fields = Object.keys(element[element_templet])
		for(const field of fields) delete element[element_templet][field]
		return element
	}

	function get(o,field){
		if(field in o) return is.function(o[field]) ? o[field].bind(o):o[field]
		else if(field in html) return is.function(html[field]) ? html[field].bind(html):html[field]
		else switch(field){
			default:
				return null
		}
	}

	function get_set_container(element, set_container=null){
		if(set_container === true) return Container.assign(element)
		else if(is.element(set_container)) return Container.set(element, set_container)
		return Container.get(element)
	}

	function render_content(element, lit_template){ return (html.lit.render(lit_template, Container.get(element)), render_function(element)) }

	function render_function(element){
		return new Proxy(get_templet(element),{
			get(o,field){
				switch(field){
					case 'clear': return (...fields)=>clear_data(element,...fields)
					case 'container': return (set_container)=>get_set_container(element, set_container)
					case 'render': return (lit_template=null)=>render_content(element, lit_template ? lit_template:o.templet(o.dataset))
					case 'get': return (data_field,data_value)=>get_property_value(element, data_field, data_value)
					case 'set': return (data_field, data_value)=>set_property_value(element, data_field, data_value)
					case 'templet': return notation=>(notation ? o.templet=notation:null,render_function(element))
					case 'update': return update_content(element)
					case 'items': return o.dataset.items
					case 'count': return o.dataset.count
					case 'data': return o.dataset.data
					case 'push':
					case 'pop':
					case 'sort':
					case 'filter':
					case 'unshift':
					case 'concat':
					case 'splice':
					case 'map':
						return (...x)=>items_property(element, field, ...x)

					default: return get(o,field)
				}
			},
			has(o,field){ return field in o },
			set(o, data_field, data_value){
				if(is.text(data_field)) set_property_value(element, data_field, data_value)
				return true
			}
		})
	}

	function items_property(element, action, ...x){
		if(x.length === 0) return render_function(element)
		const templet = get_templet(element)
		switch(action){
			case 'concat':
			case 'filter':
			case 'map':
				templet.dataset.items = templet.dataset.items[action](...x)
				break
			default:
				templet.dataset.items[action](...x)
				break
		}
		return update_content(element).call()
	}

	function get_property_value(element, field){
		if(is.text(field)) return dot.get(get_templet(element),`dataset.data.${field}`)
		return null
	}

	function set_property_value(element, field, value){
		if(is.text(field)){
			if(get_property_value(element,field) !== value){
				dot.set(get_templet(element), `dataset.data.${field}`, value)
				return update_content(element).call()
			}
		}
		return render_function(element)
	}


	function get_templet(element){
		return element_templet in element ? element[element_templet]:element[element_templet] = create()
		//scope actions
		function create(){
			return {
				dataset: {
					items:[],
					data:{},
					get count(){ return this.items.length }
				},
				notation: null,
				get templet(){ return this.notation ? (is.text(this.notation)?dot.get(html.templets, this.notation):this.notation):null },
				set templet(notation){ return ((is.text(notation) && dot.has(html.templets, notation)) || is.function(notation)) ? this.notation = notation:null }
			}
		}
	}

	function set_content(element, ...content){
		return (element[element_templet].dataset = merge(element[element_templet].dataset,...content), render_function(element))
	}


	function update_content(element){
		return (...content)=>{
			if(content.length) set_content(element, ...content)
			return render_content(element, get_templet(element).templet(get_templet(element).dataset), lit_html)
		}
	}


}, async function load_module(locator=window.modules.directory.locator('script', 'lit-html')){
	window.modules.import.assets(locator)
	return await window.modules.wait('modules.lit-html', true)
	//scope actions
}, async function Templets(){
	class Templets{}

	//scope actions
	return Templets

}, async function TempletContainer(){
	const is = window.modules.is
	const templet_attribute = 'templet'
	const templet_container = Symbol('Container element to render lit-html templates.')

	//exports
	return {
		get add(){ return add_container },
		get assign(){ return assign_container },
		get get(){ return get_container },
		get has(){ return has_container },
		get is(){ return is_container },
		get set(){ return set_container }
	}

	//scope actions
	function add_container(element, container = window.modules.element.create('div', {[templet_attribute]: ''})){
		return ((element.shadowRoot ? element.shadowRoot:element).appendChild(container), container)
	}

	function assign_container(element){ return (element.setAttribute(templet_attribute,''), element) }

	function get_container(element, container = null){
		container = element.querySelector(`[${templet_attribute}]`)
		return container === null && element.shadowRoot ? element.shadowRoot.querySelector(`[${templet_attribute}]`):container
	}

	function has_container(element){
		if(is.element(element[templet_container]) || is_container(element)) return true
		return is.element(element[templet_container] = get_container(element))
	}

	function is_container(element){ return element.hasAttribute(templet_attribute) }

	function set_container(element, container){
		if(is.element(container) === false) return add_container(element)
		return element[templet_container] = container
	}

})
