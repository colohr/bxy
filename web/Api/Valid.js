/* Functions to perform validation of value types. */
const alphabetic_regular_expression = /^[A-Za-z]+$/
const alphanumeric_regular_expression = /^[A-Za-z0-9]+$/
const number_regular_expression = /^[0-9]+$/
const decimal_regular_expression = /^[-+]?[0-9]+\.[0-9]+$/
const email_regular_expression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

//exports
const Valid = valid
Valid.alphabetic = valid_alphabetic
Valid.alphanumeric = valid_alphanumeric
Valid.array = valid_array
Valid.data = valid_data
Valid.date = valid_date
Valid.decimal = valid_decimal
Valid.email = valid_email
Valid.even = valid_even
Valid.first = valid_first
Valid.first.index = valid_first_index
Valid.function = valid_function
Valid.iterable = valid_iterable
Valid.iterator = valid_iterator
Valid.last = valid_last
Valid.last.index = valid_last_index
Valid.lowercase = valid_lowercase
Valid.mappable = is_mappable
Valid.maps = valid_maps
Valid.number = valid_number
Valid.numeral = valid_numeral
Valid.object = valid_object
Valid.odd = valid_odd
Valid.property = valid_property
Valid.text = valid_text
Valid.uppercase = valid_uppercase
Valid.value = valid
export default Valid;

//scope actions

//Value has a `key` + `value` pair that can be mapped
export function is_mappable(value){ return valid_object(value) || valid_function(value) }

//Value is quantifiable & useful within contexts, interfaces or functionality leveraging this type
export function valid(value){
	const type = typeof(value)
	if(type === 'undefined' || value === null) return false
	else if(type === 'number' && (isNaN(value) || value === Infinity)) return false
	else if(type === 'object' && valid_date(value) && isNaN(value.getTime())) return false
	return true
}

//Alphabetic-only characters
export function valid_alphabetic(value){ return valid_text(value) && alphabetic_regular_expression.test(value) }

//Alphanumeric-only characters
export function valid_alphanumeric(value){ return valid_text(value) && alphanumeric_regular_expression.test(value)  }

//Type checking uniformity
export function valid_array(value){ return Array.isArray(value) }

//Object instance that is not an array {}
export function valid_data(value){ return valid_object(value) && !Array.isArray(value) }

//Date instance
export function valid_date(value){ return value instanceof Date}

//Value is text decimal number (not such thing as float in JS)
export function valid_decimal(value){
	if(valid_text(arguments[0] = arguments[0].toString())){
		if(arguments[0].includes('.')){
			arguments[0] = arguments[0].replace(/,/g, '')
			const places = arguments[0].split('.').length === 2 ? arguments[0].split('.')[1].length:0
			if(places > 0 && valid_number(value = parseFloat(arguments[0]))){
				return value.toFixed(places) === arguments[0]
			}
		}
	}
	return false
}

//Text is a valid email address
export function valid_email(value){ return valid_text(value) && email_regular_expression.test(value) }

//Value is an even number
export function valid_even(index){ return valid_number(index) && index % 2 === 0 }

//Value is in the first index position of an array
export function valid_first(value,index){ return Valid.number(index) &&  index === 0 }

//Value is the first index in array
export function valid_first_index(index){ return Valid.number(index) && index === 0 }

//Value for functions and `class` will be valid
export function valid_function(value){ return typeof value === 'function' }

//Value can be iterated and is `Array-link` (ie value.length only values)
export function valid_iterator(value){ return valid_text(value) || valid_array(value) }

//Value can be iterated and contains values or has a positive count of items (length)
export function valid_iterable(value){  return  (value = typeof(value)==='string'?value.trim():value, valid_iterator(value) && value.length > 0) }

//Value is in the last index position of an array
export function valid_last(value, index, array){ return Valid.number(index) && Valid.array(array) && index === array.length-1 }

//Value is the last index in array
export function valid_last_index(index, length){ return Valid.number(index) && Valid.number(length) && index === length-1 }

//If text contains any alphabetic characters, they must be lowercase.
export function valid_lowercase(value){ return valid_text(value) && value.toLowerCase() === value }

//Checks if mappable [key,value] objects & iterable values are empty + validity of other types
export function valid_maps(value){
	if(valid_iterator(value)) return valid_iterable(value)
	if(is_mappable(value) && valid_date(value) === false) return Object.keys(value).length > 0
	return valid(value)
}

//Value is a number or instance of Number
export function valid_number(value){ return valid(value) && (typeof value === 'number' || (valid_object(value) && value instanceof Number)) }

//Value is a text number
export function valid_numeral(value){
	if(valid_text(arguments[0])){
		if(valid_number(value = parseInt(arguments[0]= arguments[0].toString()))) {
			return `${value}` === arguments[0]
		}
	}
	return false
}


//Value is an odd number
export function valid_odd(index){ return valid_number(index) && index % 2 !== 0 }

//Value is a valid object type & is not null
export function valid_object(value){ return typeof value === 'object' && value !== null }

//Value is a valid property accessor (text, symbol or array index)
export function valid_property(field){ return (valid_text(field) && field.trim().length > 0) || typeof field === 'symbol' || (valid_number(field) && field >= 0) }

//Value is a valid string or instance of String
export function valid_text(value){ return typeof value === 'string' || (valid_object(value) && value instanceof String)}

//If text contains any alphabetic characters, they must be uppercase.
export function valid_uppercase(value){ return valid_text(value) && value.toUpperCase() === value }