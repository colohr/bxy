import Valid, {is_mappable} from './Valid'

/* This module contains common functions used when working with javascript object types.*/

//Assigns only valid source fields
export function assign(...sources){ return copy(...sources.map(clean)) }

//Cleans all values rejected by validation type
export function clean(source, ...types){
	if((types = types.filter(type=>type in Valid)).length === 0) types = ['maps']
	if(Valid.object(source) === false) return source
	if(Valid.array(source)) return source.map(array_map).filter(clean_filter)
	return Object.entries(source).reduce(clean_reduce, {})

	//scope actions
	function clean_reduce(object, entry){
		const valid = clean_filter(entry[1] = clean(entry[1]))
		try{ if(valid) object[entry[0]]=entry[1] }
		catch(error){}
		return object
	}
	function clean_filter(value){
		for(const type of types){
			if(type in Valid){
				if(Valid[type](value) === false) {
					return false
				}
			}
		}
		return true
	}
	function array_map(value){ return clean(value, ...types) }
}

//Creates a merged clone of source objects without modifying sources.
export function copy(...sources){ return merge({}, ...sources) }

//Defines properties from 1 mappable source into the mappable target
export function define(target, definitions){
	return entries(definitions).reduce(reduce_entry, target)
	//scope actions
	function reduce_entry(object, entry){ return Object.defineProperty(object, entry[0], {value:entry[1]}) }
}

//Checks if object has no property assignments
export function empty(value){
	if(Valid.array(value)) return value.length === 0
	else if(Valid.data(value) || is_mappable(value)) return Object.getOwnPropertyNames(value).length === 0
	return true
}

//Returns array of entries. Entry -> [key, value]
//Assumes all arrays are valid. -> [ [key,value], [key,value] ]
export function entries(value){
	if(Array.isArray(value) === false) value = is_mappable(value) ? Object.entries(value):[]
	return value
}

//Empty all values in mappable value
export function voided(map){
	if(Valid.mappable(map)) for(const field in map) null_value(field, map)
	return map = null
	//scope actions
	function delete_value(){
		try{ delete arguments[1][arguments[0]] } catch(error){ }
		return (arguments[0] = null, arguments[1]=null)
	}
	function null_value(){
		try{ arguments[1][arguments[0]] = voided(arguments[1][arguments[0]])  }
		catch(error){ }
		return delete_value(...arguments)
	}
}

//Access object value by dot notation (get({a:{b:{c:'target value'}}}, 'a.b.c') = 'target value')
export function get(target, dot_notation){ return notation(dot_notation).reduce(property, target) }

//Verify object property is a valid value by dot notation (has(object, 'a.b.c') = true|false)
export function has(data, notation){ return Valid(get(data, notation)) }

//Access value at last index in an array
export function last(array){ return Array.isArray(array) && array.length ? array[array.length-1]:null }

//Recursive merge of source properties into target object (Valid.data objects only)
export function merge(target, ...sources){
	if(!sources.length) return target;
	const source = sources.shift();
	if(Valid.data(target) && Valid.data(source)){
		for(const key in source){
			if(Valid.data(source[key])){
				if(!target[key]) Object.assign(target, {[key]: {}})
				merge(target[key], source[key]);
			}
			else Object.assign(target, {[key]: source[key]})
		}
	}
	return merge(target, ...sources)
}

//Splits text values or converts property accessors into array to reduce value in `get` function
export function notation(field){
	if(typeof field === 'string') return field.split('.')
	return Valid.property(field) ? [field]:[]
}

export function parameters(){
	return (get(arguments[0], 'state.routes') || []).reduce(reduceParameters, get(arguments[0],'state.params') || {})
	//scope actions
	function reduceParameters(parameters, route){ return copy(get(arguments[1], 'params'), parameters) }
}

//Accesses a property from mappable object.
//Binds all functions back to parent source maintaining references to `this` in function scope.
export function property(object, field){
	return (
		field=Valid.mappable(object) && Valid.property(field) ? object[field]:undefined,
		Valid.function(field) ? field.bind(object):field
	)
}

//Reduces mappable source objects into mappable target. Default setting maps back to new object.
// [value_0, value_1] -> {value_0:preset, value_1:preset}
// {key: value} -> {key: value}
// ([1,2,3]) => {'1':null, '2':null, '3':null}
// (['red', 'green', 'blue'], true) => {red:true, green:true, blue:true}
//Also used for assigning properties that do not require cloning of object.
export function reduce(definitions, preset=null, mappable={}){
	return entries(definitions).map(on_entry).reduce(reduce_entry, mappable)
	//scope actions
	function on_entry(entry){ return Array.isArray(entry) ? entry:[entry, preset] }
	function reduce_entry(data, entry){ return Object.assign(data, {[entry[0]]: entry[1]}) }
}

//Changes parameter order of `reduce` function when reassigning properties from source to target.
export function remap(target, definitions, preset=null){ return reduce(definitions, target, preset) }

//Set object value by dot notation set(object, 'a.b.c', value)
export function set(data, dot_notation, value){
	if(Valid(data) === false) data = {}
	const levels = notation(dot_notation)
	const last_index = levels.length - 1
	let level = data
	let index = 0
	while(index < last_index){
		const field = levels[index]
		level = level[field] = field in level && Valid(level[field]) ? level[field]:{}
		index++
	}
	return level[last(levels)] = value
}

//Remove value from object by dot notation unset(object, 'a.b.c') = equivalent to `delete object.a.b.c`
export function unset(object, dot_notation){
	const levels = notation(dot_notation)
	const last_index = levels.length - 1
	let level = object
	let index = 0
	while(index < last_index){
		const field = levels[index]
		if(Valid(level[field])){
			level = level[field]
			index++
		}
	}
	return level ? delete level[last(levels)]:true
}