(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.id', {value:await module(...inputs)}); return window.modules.has('function.id')?window.modules.get('function.id'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {is} = window.modules
	const uid = await window.modules.import.function('uid')
	const id_attribute = `unique-id`
	const id_symbol = Symbol(id_attribute)

	class Identity extends String{
		constructor(...identity){
			identity = get_value(...identity)
			super(identity.id)
			this.identifier = identity
		}
		get locator(){
			const at = this.namespace ? `@${this.identifier}`:''
			return `${this}${at}`
		}
		get namespace(){ return this.identifier.namespace }
		notation(notation){ return [this.locator,notation].join(':') }
		selector(attribute=null){
			attribute = attribute || id_symbol
			return `[${attribute}="${this}"]`
		}
		get type(){ return this.identifier.type }
	}

	//exports
	const id_function = create
	id_function.attribute = id_attribute
	id_function.create = create
	id_function.decode = decode_id
	id_function.delete = delete_id
	id_function.get = get_id
	id_function.of = get_id_of
	id_function.set = set_id
	id_function.has = has_id
	id_function.unique = create_unique_id
	id_function.symbol = id_symbol
	return id_function

	//scope actions
	function create(){ return new Identity(...arguments) }

	function create_unique_id(){ return uid(...arguments) }

	function decode_id(value){
		if(value instanceof Identity) return value
		if(is.text(value)){
			const namespace = value.includes('@') ? value.split('@')[1]:null
			if(namespace) value = value.replace(`@${namespace}`,'')
			const prefix = value.includes('_') ? value.split('_')[0]:null
			if(prefix) value = value.replace(`_${prefix}`, '')
			const notation = value.includes(':') ? value.split(':')[1]:null
			if(notation) value = value.replace(`:${notation}`,'')
			return new Identity(prefix,namespace,value,notation)
		}
		return null
	}

	function delete_id(element, attribute = null){
		if(element){
			attribute = attribute || id_attribute
			element.removeAttribute(attribute)
			delete element[id_symbol]
		}
		return true
	}

	function get_id(element, attribute = null){
		if(element instanceof Identity) return element
		if(is_node(element)) return element.id
		if((element = window.modules.element.get(element)) !== null){
			if(id_symbol in element) return element[id_symbol]
			attribute = attribute || id_attribute
			if(element.hasAttribute(attribute)) return decode_id(element.getAttribute(attribute))
			return node_id(element)
		}
		return null
	}

	function get_id_of(element, attribute=null){
		if(element instanceof Identity) return element.toString()
		if(is_node(element)) return element.id.toString()
		element = window.modules.element.get(element)
		if(element) return set_id(element, attribute).toString()
		return null
	}

	function get_value(type,namespace=null,id=null, notation=null){
		const prefix = type ? `${type}_`:''
		id = id || uid(prefix)
		return {
			id,
			namespace,
			notation,
			type: type || 'id'
		}
	}

	function has_id(){ return is_node(arguments[0])?true:get_id(...arguments) !== null }

	function is_node(){ return window.modules.has('Node') && arguments[0] instanceof window.modules.Node }

	function node_id(){
		if(has_connections()){
			if(window.modules.Node.has(arguments[0])){
				return window.modules.Node.get(arguments[0]).id
			}
		}
		return null
		//scope actions
		function has_connections(){ return window.modules.has('Node') }
	}

	function set_id(element, attribute){
		if((element = window.modules.element.get(element)) !== null){
			const id = get_id(element, attribute) || create(element.localName)
			attribute = attribute || id_attribute
			element.setAttribute(attribute, element[id_symbol] = id)
			return id
		}
		return null
	}
})
