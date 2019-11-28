(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Templet', {value:await module(...inputs)}); return window.modules.has('Templet')?window.modules.get('Templet'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Container,Dataset){
	const {id,is,dot} = window.modules
	const lit_html_locator = (await window.modules.import.internal()).dependency('lit-html').locator

	class Templet{
		constructor(){
			this.directive = import_directive
			this.directives = new class Directives{}
			this.collection = new class Templets{}
			this.import = import_asset
			this.locator = get_locator
		}
		get Container(){ return Container }
		container(){ return Container.target(...arguments) }
		get Dataset(){ return Dataset }
		dataset(){ return Dataset.target(...arguments)  }
		delete(notation){ return (dot.delete(this.collection,notation),this) }
		get engine(){ return window.modules.lit }
		get(notation){ return this.has(notation) ? dot.get(this.collection,notation):null }
		has(notation){ return dot.has(this.collection, notation) }
		set(notation,template){ return (dot.set(this.collection, notation,template), this) }
	}

	//exports
	return new Templet()

	//scope actions
	function get_locator(){
		const locator = lit_html_locator.at(...arguments)
		return (!locator.extension?locator.extension='js':null,locator)
	}

	async function import_asset(asset_locator){ return await import(`${asset_locator}`) }

	async function import_directive(directive_name){
		const field = id.underscore(directive_name)
		if(dot.has(this.directives, field)) return dot.get(this.directives, field)
		return set_directive.call(this,directive_name, await import_asset(get_locator(`directives/${id.dash(directive_name)}`)))
	}

	function set_directive(field, directive=null){
		if(is.data(directive) === false) return console.warn(`lit-html directive: "${field}" failed to load`)
		return Object.entries(directive).reduce(reduce, this.directives)[id.underscore(field)]
		//scope actions
		function reduce(directives, entry){ return (directives[id.underscore(entry[0])] = entry[1], directives) }
	}



},async function Templets(){
	const is = window.modules.is
	const templet_attribute = 'templet'
	const templet_container = Symbol('Container element to render lit-html templates.')
	const templet_host = Symbol('DocumentFragment as templet container')
	//exports
	return class Container{
		static get add(){ return add_container }
		static get assign(){ return assign_container }
		static get component(){ return set_component }
		static get get(){ return get_container }
		static get has(){ return has_container }
		static get host(){ return templet_host }
		static get is(){ return is_container }
		static get set(){ return set_container }

		static target(element,set_container){
			if(set_container === true) return this.assign(element)
			else if(is.element(set_container)) return this.set(element, set_container)
			else if(is.document(element.shadowRoot) || set_container===templet_host) return this.component(element,set_container)
			return this.get(element)
		}
	}

	//scope actions
	function add_container(element, container = window.modules.element.create('div', {[templet_attribute]: ''})){
		return ((element.shadowRoot ? element.shadowRoot:element).appendChild(container), container)
	}

	function assign_container(element){ return (element.setAttribute(templet_attribute,''), element) }

	function get_container(element, container = null){
		container = is_host(element) ? element[templet_container]:element.querySelector(`[${templet_attribute}]`)
		return container === null && element.shadowRoot ? element.shadowRoot.querySelector(`[${templet_attribute}]`):container || element
	}

	function has_container(element){
		const type = is_host(element) ? 'document':'element'
		if(is[type](element[templet_container]) || is_container(element)) return true
		return is[type](element[templet_container] = get_container(element))
	}

	function is_container(element){ return element.hasAttribute(templet_attribute) }

	function is_host(element){ return templet_host in element }

	function set_component(element){
		if(is.document(element.shadowRoot) === false) element.attachShadow({mode:'open'})
		element[templet_host]=true
		return element[templet_container] = element.shadowRoot
	}

	function set_container(element, container){
		if(is.element(container) === false) return add_container(element)
		return element[templet_container] = container
	}

}, async function TempletDataset(){
	const templet_dataset = Symbol('Templet dataset')
	const templet_dataset_items = Symbol('Templet dataset.items')
	const templet_dataset_data = Symbol('Templet dataset.data')
	const templet_dataset_template = Symbol('Templet dataset.template')
	const {is} = window.modules
	return class TempletDataset{
		static clear(element){ return templet_dataset in element ? element[templet_dataset].clear():element }
		static target(element){ return templet_dataset in element ? element[templet_dataset]:element[templet_dataset] = new this(element) }
		constructor(element){
			this.element = element
			const notation = 'xml' in this.container ? this.container.xml.templet:this.element.xml.templet
			if(notation) this.template(notation)
		}
		clear(){ return clear.call(this) }
		get container(){ return this.module.container(this.element) }
		get count(){ return templet_dataset_items in this ? this[templet_dataset_items].length:(templet_dataset_data in this ? Object.keys(this[templet_dataset_data]).length:0)}
		get data(){ return get(this, templet_dataset_data, {}) }
		set data(value){ return set(this, templet_dataset_data, value, Object) }
		get directives(){ return this.module.directives }
		get dot(){ return window.modules.dot }
		get engine(){ return this.module.engine }
		get escape(){  return this.directives.unsafe_html }
		get html(){ return this.engine.html }
		get is(){ return window.modules.is }
		get items(){ return get(this, templet_dataset_items, []) }
		set items(value){ return set(this, templet_dataset_items, value, Array) }
		get module(){ return window.modules.Templet }
		template(){
			if(arguments.length) this[templet_dataset_template] = arguments[0]
			if(templet_dataset_template in this){
				if(is.text(this[templet_dataset_template])) return this.module.get(this[templet_dataset_template])
				return this[templet_dataset_template]
			}
			return ()=>{}
		}
		get until(){ return this.directives.until }
	}

	//scope actions
	function clear(){
		if(templet_dataset_data in this) this[templet_dataset_data] = {}
		if(templet_dataset_items in this) this[templet_dataset_items] = []
		return window.modules.templet.update(this)
	}
	function get(dataset,symbol,default_value){ return symbol in dataset ? dataset[symbol]:default_value }
	function set(dataset, symbol, value, instance){  return is.instance(value,instance) ? dataset[symbol] = value:value }
})

