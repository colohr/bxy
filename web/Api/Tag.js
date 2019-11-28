const tag_function = annotate_text
tag_function.annotation = annotation

//exports
export default tag_function;

//scope actions
function get_notation_from_text(text){
	if(text.indexOf('${') === -1) return null
	return text.substring(text.lastIndexOf('${') + 2, text.lastIndexOf('}'))
}

function get_value(data, notation){
	let x = null
	try{ x = eval(`(x, id)=>(x.${notation})`)(data) }
	catch(e){ x = retry() }
	return x === null || typeof x === 'undefined' ? '':x

	//scope actions
	function retry(){
		try{return notation.split('.').reduce((o, i)=>o[i], data)}
		catch(e){return null}
	}
}

function annotate_text(text, data = {}){
	let notation = get_notation_from_text(text)
	if(notation === null) return text
	const replacer = ['\$\{', notation, '\}'].join('')
	const value = get_value(data, notation)
	text = text.replace(replacer, value)
	return annotate_text(text, data)
}

function annotation(){
	const annotation_matcher = create_annotation_matcher
	annotation_matcher.get = get_annotations_in_text

	//exports
	return annotation_matcher

	//scope actions
	function create_annotation_matcher(start = '${', stop = '}'){
		const count = start.length
		return function find_next_annotation(text){
			let annotation = null
			if(typeof text !== 'string') return annotation
			text = text.trim()
			if(text.indexOf(start) === -1) return annotation
			try{ annotation = text.substring(text.lastIndexOf(start) + count, text.lastIndexOf(stop)) }
			catch(error){}
			return typeof annotation === 'string' ? annotation:null
		}

	}

	async function get_annotations_in_text(text, ...start_stop){
		const uid = await window.modules.import.function('uid')
		const expression = await window.modules.import.function('expression')
		const match = create_annotation_matcher(...start_stop)
		const replacer = id=>new RegExp(expression.escape([start_stop[0], id, start_stop[1]].join('')), 'g')
		const annotations = new Map()
		annotations.origin = text
		annotations.text = text
		//exports
		return next()

		//scope actions
		function next(){
			const annotation = match(annotations.text)
			if(annotation){
				const id = `annotation-${uid()}`
				const item = annotations.set(annotation, {
					annotation,
					replace_expression: replacer(annotation),
					id
				}).get(id)

				return (replace(annotation, item.replace_expression, item.id), next())
			}
			return annotations
		}

		function replace(annotation, replace_expression, replace_with){
			return annotations.text = annotations.text.replace(replace_expression, replace_with)
		}
	}
}

