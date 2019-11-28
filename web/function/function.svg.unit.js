(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.svg.unit', {value:await module(...inputs)}); return window.modules.has('function.svg.unit')?window.modules.get('function.svg.unit'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {dot,is} = window.modules
	const Unit = await window.modules.function('unit')

	//exports
	const unit_function = get_unit
	unit_function.attribute = get_attribute
	unit_function.point = get_point
	unit_function.property = get_property
	unit_function.size = get_size
	unit_function.size.of = get_size_of_element
	unit_function.style = get_style
	return unit_function

	//scope actions
	function get_attribute(element, field, default_value=0){
		element = window.modules.element.get(element)
		if(element && element.hasAttribute(field)) field = element.getAttribute(field)
		return is.nothing(field) ? default_value:field
	}

	function get_point(...values){ return new Unit.Point(...values) }

	function get_property(element, field, default_value=0){
		element = window.modules.element.get(element)
		if(element) field = Unit.value(dot.get(element, field))
		return new Unit.Value(is.nothing(field) ? default_value:field)
	}

	function get_size(...values){ return new Unit.Size(...values) }

	function get_size_of_element(element){  return new Unit.Size(get_style(element,'width'), get_style(element,'height'))  }

	function get_style(element, field, default_value=0){
		element = window.modules.element.get(element)
		if(element) {
			field = field in element ? element[field]:null
			if(is.nothing(field) && field in element.style) field = element.style[field]
			if(is.nothing(field)) field = get_attribute(element,field,default_value)
		}
		return new Unit.Value(is.nothing(field) ? default_value:field)
	}

	function get_unit(){ return Unit(...arguments) }

})
