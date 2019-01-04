(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('notate', {value:await module(...inputs)}); return window.modules.has('notate')?window.modules.get('notate'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(is){
	const array_leaf = Symbol('array values are kept intact')
	const array_flat = Symbol('array is flattened to an object')
	const default_annotation_field = '@annotation'
	const Notate = notate
	Notate.annotate = annotate
	Notate.data = data_from_notations
	Notate.intact = notate_intact

	//exports
	return Notate

	//scope actions
	function notate(data, array_type){ return (annotate(default_annotation_field, array_type))({}, null, data)[default_annotation_field] }
	function notate_intact(data){ return notate(data, array_leaf) }

	function annotate(annotation = default_annotation_field, array_type=array_flat){
		//exports
		return (...x)=>flatten(...x)
		//scope actions
		function build(data, operator, field, value){
			data[operator] = operator in data === false ? (is.array(value) ? []:{}):data[operator]
			data[operator][field] = value
			return data
		}

		function flatten(data, field, property){
			if(is.leaf(property) || (is.array(property) && array_type === array_leaf)) return field ? build(data, annotation, field, property):property
			const fields = Object.keys(property)
			if(!fields.length) {
				if(is.array(property) && array_type === array_flat){
					return field ? build(data, annotation, field, []):data
				}
				return field ? build(data, annotation, field, property):data
			}
			if(is.array(property)) build(data, annotation, field, [])
			for(let i = 0; i < fields.length; i++){
				const index_field = fields[i]
				if(typeof index_field === 'string'){
					const prefix = !field ? index_field:`${field}.${index_field}`
					flatten(data, prefix, property[index_field])
				}
			}
			return data
		}
	}

	function data_from_notations(notations){
		return Object.entries(notations).reduce(reduce,{})
		//scope actions
		function reduce(data,entry){ return (window.modules.dot.set(data, entry[0], entry[1]), data) }
	}



}, async function annotation_is(){
	const {is} = window.modules
	const types = {
		bson: [
			'Binary',
			'Code',
			'DBRef',
			'Decimal128',
			'Double',
			'Int32',
			'Long',
			'MaxKey',
			'MinKey',
			'ObjectID',
			'BSONRegExp',
			'Symbol',
			'Timestamp'
		],
		primitive: [
			'number',
			'string',
			'boolean',
			'symbol'
		]
	}

	//exports
	return {
		array: is.array,
		get bson(){ return is_bson },
		get leaf(){ return is_leaf },
		get primitive(){ return is_primitive }
	}

	//scope actions
	function is_bson(value){ return value._bsontype && types.bson.includes(value._bsontype) > -1 }

	function is_leaf(value){ return value === null || typeof(value) === 'undefined' || is_primitive(value) || is_bson(value) }

	function is_primitive(value){ return types.primitive.includes(typeof (value)) || is.date(value) || value instanceof String || value instanceof Number }
})
