import * as Text from './Text';
import Valid from './Valid';
const symbol = Symbol('Symbol.value')
const namespace_prefix = '@'
const namespace_separator = ':'


//Used to extend a field controlled by a superset scope or namespace
export class Namespace extends String{
	static field(value){
		if(Valid.property(value)){
			value = new String(typeof value === 'symbol' ? value.description:value)
			return value.startsWith(namespace_prefix) && value.split(':').length === 2
		}
		return false
	}
	constructor(value){
		super(value)
		this.prefix = `${namespace_prefix}${value}${namespace_separator}`
	}
	field(name){ return this.scoped(name) ? name:this.scope(name) }
	scope(field){ return [this.prefix, Text.dash(field)].join('') }
	scoped(field){
		if(Valid.property(field)){
			field = new String(typeof field === 'symbol' ? field.description:field)
			return field.startsWith(this.prefix)
		}
		return false
	}
	get symbol(){ return symbol in this ? this[symbol]:this[symbol]=Symbol.for(super.toString()) }

}



/*Generates a short uid
The prefix argument usually has more application within the DOM environment
since the `id` attribute for HTML Elements cannot begin with a number.
* <div id="39s9as">...</div> (invalid)
* <div id="prefix-39s9as">...</div> (valid)
* */
export default function Id(prefix = ''){
	let first = (Math.random() * 46656) | 0
	let second = (Math.random() * 46656) | 0
	first = (`000${first.toString(36)}`).slice(-3)
	second = (`000${second.toString(36)}`).slice(-3)
	return `${prefix}${first}${second}`
}



/*Constructs an namespace instance*/
export function StoreKey(identifier){ return identifier instanceof Namespace?identifier:new Namespace(identifier) }


