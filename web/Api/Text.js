import Valid from './Valid'
import not from './not'
const expressions = {
	aggregators:[
		/\+/g,
		/\,/g,
		/\|/g,
		/ /g,
	],
	indicators:[
		/\-/g,
		/\./g,
		/\:/g,
		/\//g,
		/\_/g,
		/\(/g,
		/\)/g,
		/\[/g,
		/\]/g,
		/\=/g,
		/\"/g
	]
}


/* Functions to perform common text reformatting & cleansing. */

//Cleanses text of extra spaces
export function clean(text, separator=' '){return text.split(separator=sequence_separator(separator)).map(trim).filter(not.empty).join(separator)}

//Formats text fragments to dash-case
export function dash(text){ return sequence_fragment(text, '-').toLowerCase() }

//Capitalizes first character of text value (ie "firstname lastname" -> "Firstname lastname")
export function capitalize(text){ return `${text.charAt(0).toUpperCase()}${text.slice(1)}` }

//Reformat text to lowercase (useful when mapping & chaining functions)
export function lowercase(value){ return Valid.text(value) ? value.toLowerCase():value }

//Lower-cases first fragment, capitalizes all phrases after + removes white spaces (ie "first middle last" -> "firstMiddleLast")
//Lower-first pascal, camel-case
export function medial(value){ return (value=type(value), `${value.charAt(0).toLowerCase()}${value.slice(1)}`) }

//Formats text fragments as dot notation
export function notated(text){ return Valid.text(text) ? text.split('.').reverse()[0]:null }

//Formats text fragments as dot notation
export function notation(text){ return sequence_fragment(text, '.').toLowerCase() }



//Capitalizes all text fragments (ie "firstname lastname" -> "Firstname Lastname")
export function proper(text){ return clean(text).split(' ').map(lowercase).map(capitalize).join(' ') }

//Separates a string value into
export function separate(text, separator){
	if(Valid.uppercase(text = escape_decimals())) return text
	return text.replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2').replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
	//scope actions
	//Replaces periods from character sequences with given separator
	function escape_decimals(){ return text.replace(/([0-9])+\.([0-9])/g, `$1$2${separator = sequence_separator(separator)}`) }
}

//Return a valid separator character (used when mapping arrays with second argument being `index` of value)
function sequence_separator(value){ return typeof value === 'string' ? value:' ' }

//Replaces all `separating` characters from text fragment with given separator
function sequence_fragment(text, separator){
	text = typeof text === 'symbol' ? text.description:`${text}`

	text = separate(text, separator = sequence_separator(separator))
	for(const category in expressions){
		for(const expression of expressions[category]){
			text = text.replace(expression, separator)
		}
	}
	//console.log({text,separator}, clean(text, separator))
	return clean(text, separator).trim()
}


//Trims whitespace from start + end of text (useful when mapping & chaining functions)
export function trim(value){ return value.trim() }

//Capitalizes first character of every word & removes white spaces (ie "First last" -> "FirstLast")
//Classes, pascal-case
export function type(text){ return words(text).split(' ').map(capitalize).join('') }

//Formats text fragments to underscore-case
export function underscore(text){ return sequence_fragment(text, '_').toLowerCase() }

//Checks if text has a positive length after trimming
export default function  valuable_text(value){ return Valid.text(value) ? value.trim():null }

//Checks if text has a positive length after trimming
export function words(text){ return separate(clean(text), ' ') }




