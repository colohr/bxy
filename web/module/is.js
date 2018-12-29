(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('is', {value:await module(...inputs)}); return window.modules.has('is')?window.modules.get('is'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const alphabet_regular_expression = /^[A-Za-z]+$/
	const number_regular_expression = /^[0-9]+$/
	const decimal_regular_expression = /^[-+]?[0-9]+\.[0-9]+$/
	const email_regular_expression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	is_alphabetic.character = is_alphabetic_character

	is_date.class = is_date_class

	is_numeric.character = is_numeric_character
	is_numeric.decimal = is_numeric_decimal

	is_text.decimal = is_text_decimal
	is_text.lowercase = is_text_lowercase
	is_text.number = is_text_number
	is_text.uppercase = is_text_uppercase


	//exports
	return {
		alphabetic: is_alphabetic,
		action: is_action,
		array: is_array,
		async: is_async,
		get bool(){ return this.TF },
		class: is_class,
		character: is_character,
		count: is_count,
		data: is_data,
		date: is_date,
		decimal: is_decimal,
		defined: is_defined,
		element: is_element,
		element_data: is_element_data,
		email: is_email,
		empty: is_empty,
		event: is_event,
		error: is_error,
		function: is_function,
		instance: is_instance,
		json: is_json,
		map: is_map,
		nothing: is_nothing,
		numeric: is_numeric,
		number: is_number,
		object: is_object,
		promise: is_promise,
		regular_expression: is_regular_expression,
		set: is_set,
		get string(){ return this.text },
		symbol: is_symbol,
		text: is_text,
		TF: is_TF
	}

	//scope actions
	function is_alphabetic(value){ return is_text(value) && alphabet_regular_expression.test(value) }
	function is_alphabetic_character(value){ return is_character(value) && alphabet_regular_expression.test(value) }

	function is_action(value){
		return is_function(value) && (is_async(value) || test_action() === true)

		//scope actions
		function test_action(){
			if(is_not(value, 'prototype') || is_not(value, 'constructor')) return false
			if(value.constructor.name !== 'Function') return false
			else try{ return (value(), true) }
			catch(e){ return false }
		}
	}
	function is_array(value){ return is_object(value) && Array.isArray(value) }
	function is_async(value){ return is_function(value) && value.constructor.name === 'AsyncFunction' }

	function is_character(value){ return is_text(value) && value.length === 1 }
	function is_class(value){ return is_function(value) && !is_action(value) }
	function is_count(value,count = 1){
		if(is_nothing(value)) return false
		if(is_text(value)) value = value.trim()
		if(is_text(value) || is_array(value)) return value.length >= count
		if(is_map(value) || is_set(value)) return value.size >= count
		if(is_object(value)) return Object.keys(value).length >= count
		return false
	}

	function is_data(value){ return is_object(value) && !is_array(value) && !is_error(value) }
	function is_date(value){ try{value=value instanceof Date === false ? new Date(value):value}catch(e){value=null} return value !== null && isNaN(value.getTime())===false }
	function is_date_class(value){ return is_data(value) && is_symbol(value)===false && Object.prototype.toString.call(value) === '[object Date]' }

	function is_decimal(value){
		value = is_number(value) ? value.toString():value
		return is_text(value) && decimal_regular_expression.test(value)
	}

	function is_defined(value){ return 'customElements' in window && !is_nothing(window.customElements.get(value)) }

	function is_element(value,type){ return is_instance( value, type || HTMLElement) }
	function is_element_data(value){ return is_object(value) || is_json(value) }
	function is_email(value){ return is_text(value) && email_regular_expression.test(value) }
	function is_empty(value){ return !is_count(value) }
	function is_event(value){ return value instanceof Event }
	function is_error(value){ return is_object(value) && value instanceof Error }

	function is_function(value){ return typeof value === 'function' }

	function is_has(value){ return is_object(value) || is_function(value) }

	function is_in(value,field){ return is_has(value) && field in value }
	function is_instance(value,type){ return is_object(value) && is_function(type) && value instanceof type }

	function is_json(value){ return is_text(value) && /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')) }

	function is_map(value){ return is_object(value) && value instanceof Map }

	function is_not(value, field){ return is_in(value, field) === false }
	function is_nothing(value){ return typeof value === 'undefined' || value === null || (typeof value === 'number' && isNaN(value)) }

	function is_numeric(value){ return is_text(value) && (number_regular_expression.test(value)) }
	function is_numeric_character(value){ return is_character(value) && number_regular_expression.test(value) }
	function is_numeric_decimal(value){ return is_text(value) && decimal_regular_expression.test(value) }

	function is_number(value){ return (typeof value === 'number' || is_object(value) && value instanceof Number) && !isNaN(value) && isFinite(value) }

	function is_object(value){ return typeof value === 'object' && value !== null }

	function is_promise(value){ return is_object(value) && value instanceof Promise }

	function is_regular_expression(value){ return is_data(value) && Object.prototype.toString.call(value) === '[object RegExp]' }

	function is_set(value){ return is_object(value) && value instanceof Set }
	function is_symbol(value){ return typeof value === 'symbol'}

	function is_text(value){ return typeof value === 'string' || (is_object(value) && value instanceof String)}
	function is_text_decimal(value, decimal, places=0){
		if(is_text(value)){
			if((value = value.toString()).includes('.')){
				if((places = decimal_places()) > 0){
					if(is_number(decimal = parseFloat(value))){
						return decimal.toFixed(places) === value
					}
				}
			}
		}
		//scope action
		function decimal_places(){ return value.split('.').length === 2 ? value.split('.')[1].length:0 }
	}
	function is_text_lowercase(value){ return is_text(value) && value.toLowerCase() === value }
	function is_text_number(value,  number){
		if(is_text(value)){
			if(is_number(number = parseInt(value = value.toString()))){
				return `${number}` === value
			}
		}
		return false
	}
	function is_text_uppercase(value){ return is_text(value) && value.toUpperCase() === value }

	function is_TF(value){return typeof value === 'boolean'}
})
