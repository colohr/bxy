(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.document.selector',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.document.selector')?_.get('function.document.selector'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const document_selector_function = document_selector
	document_selector_function.nest = document_selector_nest

	document_selector_function.nest.at = document_selector_nest_item_at_index_position
	document_selector_function.nest.at.inverse = document_selector_nest_item_at_index_inverse_position

	document_selector_function.nest.item = document_selector_nest_item_position
	document_selector_function.nest.item.inverse = document_selector_nest_item_inverse_position

	document_selector_function.nest.type = document_selector_nest_type_position
	document_selector_function.nest.type.at = document_selector_nest_type_at_index_position
	document_selector_function.nest.type.at.inverse = document_selector_nest_type_at_index_inverse_position
	document_selector_function.nest.type.inverse = document_selector_nest_type_inverse_position

	//[attribute*=]  [attribute~=]  [attribute^=]  [attribute|=]  [attribute$=]
	//:only-child
	//:only-of-type
	//:not()
	//:host
	//::slotted()
	//::before,::after

	return document_selector
	//scope actions
	function document_selector(element, ...include_attributes){
		const tag = element.localName
		const selector_id = element.hasAttribute('id') ? `#${element.getAttribute('id')}`:''
		const selector_name = element.hasAttribute('name') ? `[name="${element.getAttribute('name')}"]`:''

		return `${tag}${selector_id}${selector_name}${document_selector_attributes(element,...include_attributes)}`
	}

	function document_selector_attributes(element, ...include_attributes){
		return include_attributes.map(map).filter(filter).join('')
		//scope actions
		function filter(value){ return value !== null}
		function map(attribute){
			const value = element.getAttribute(attribute)
			return value !== null ? `[${attribute}="${value}"]`:null
		}
	}

	function document_selector_nest(nest, value){ return `${nest} > ${value}` }

	function document_selector_nest_item_at_index_position(value){ return document_selector_nest_item_position(value+1) }

	function document_selector_nest_item_at_index_inverse_position(value){ return document_selector_nest_item_inverse_position(value + 1) }

	function document_selector_nest_item_inverse_position(value){ return `:nth-last-child(${value})`}

	function document_selector_nest_item_position(value){ return `:nth-child(${value})` }

	function document_selector_nest_type_at_index_inverse_position(value){ return document_selector_nest_type_inverse_position(value + 1) }

	function document_selector_nest_type_at_index_position(value){ return document_selector_nest_type_position(value+1) }

	function document_selector_nest_type_inverse_position(value){ return `:nth-last-of-type(${value})` }

	function document_selector_nest_type_position(value){ return `:nth-of-type(${value})` }

})
