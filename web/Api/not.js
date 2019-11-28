import Valid from './Valid'

/*
This module inverts the results of the `Valid` module and
is more useful when filtering out invalid types from arrays.
a) [1,'2',3].filter(not.number).map(map_array_function).sort(sort_array_function)
b) [1,'2',3].filter(value=>Valid.number(value)===false).map(map_array_function).sort(sort_array_function)
* */
export default create(Object.keys(Valid), function not(value){ return Valid(value) === false })

//scope actions
function create(validations, exported){
	for(const field of validations) exported[field] = invert(field)
	exported.empty = empty
	return exported
}

export function empty(value){
	if(Valid(value) === false) return false
	return Valid.iterator(value) ? Valid.iterable(value):true
}

function invert(field){ return function inverted(){ return Valid[field].apply(Valid, arguments) === false } }
