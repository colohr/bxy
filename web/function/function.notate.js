(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('annotate', {value:await module(...inputs)}); return window.modules.has('annotate')?window.modules.get('annotate'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(is, Annotation){
	const default_annotation_field = '@annotation'
	const Annotate = annotate
	Annotate.data = annotate_data
	Annotate.field = annotate_data_field

	//exports
	return Annotate

	//scope actions
	function annotate(data){ return (annotate_data())({}, null, data)[default_annotation_field] }
	function annotate_data(annotation = default_annotation_field){
		//exports
		return (...x)=>flatten(...x)
		//scope actions
		function build(data, operator, field, value){
			if(Annotation.is(value)) return build(data, value.name, `${field}.${operator}`, value.value())
			data[operator] = data[operator] || {}
			data[operator][field] = value
			return data
		}

		function flatten(data, field, property){
			if(is.leaf(property)) return field ? build(data, annotation, field, property):property

			if(Annotation.is(property)) return build(data, property.name, field, property.value())

			const fields = Object.keys(property)
			if(!fields.length) return field ? build(data, annotation, field, property):data


			for(let i = 0; i < fields.length; i++){
				const index_field = fields[i]
				const prefix = !field ? index_field:`${field}.${index_field}`
				flatten(data, prefix, property[index_field])
			}

			return data
		}
	}

	function annotate_data_field(data, field){ return (annotate_data(field))({}, null, data) }

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
		get bson(){ return is_bson },
		get leaf(){ return is_leaf },
		get primitive(){ return is_primitive }
	}

	//scope actions
	function is_bson(value){ return value._bsontype && types.bson.includes(value._bsontype) > -1 }

	function is_leaf(value){ return value === null || typeof(value) === 'undefined' || is_primitive(value) || is_bson(value) }

	function is_primitive(value){ return types.primitive.includes(typeof (value)) || is.array(value) || is.date(value) }
}, async function AnnotationClass(){
	const {is} = window.modules
	const annotation_value = Symbol('Annotation Value')

	class Annotation{
		static get create(){ return create_annotation }
		static get is(){ return is_annotation }
		constructor(name){ this.name = name }
		value(value){
			if(typeof(value) === 'undefined') return this[annotation_value]
			this[annotation_value] = value
			return this
		}
	}

	//exports
	return Annotation

	//scope actions
	function create_annotation(name, value, default_value, annotation = null){
		if(is.nothing(name)) throw new Error('Invalid Annotation name')
		return (annotation = new Annotation(name), annotation.value(get_value(value, default_value)), annotation)
	}

	function get_value(value, default_value){ return typeof(value) === 'undefined' ? default_value:value }

	function is_annotation(value){ return value && value instanceof Annotation }
})