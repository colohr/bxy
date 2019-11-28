(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('DataURI', {value:await module(...inputs)}); return window.modules.has('DataURI')?window.modules.get('DataURI'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(DataURI){
	const {is} = window.modules
	const meta = await window.modules.import('meta')
	const base = await window.modules.import.function('convert.base')

	function URIScope(Type){
		if(this instanceof URIScope === false) return new URIScope(...arguments)
		this.definition = Object.assign(DataURI.preset, {encoding: 'base64'}, Type.uri)
		this.type = DataURI.type(this.definition.data, this.definition.media)
		this.prefix = DataURI.prefix(this.type, this.definition.encoding)
		this.Type = Type
		if(is.nothing(this.Type.prototype) || (is.object(this.Type.prototype) && 'uri' in this.Type.prototype === false)){
			window.modules.dot.set(this.Type, 'prototype.uri', this)
		}
	}

	URIScope.prototype = {
		construct: construct_type,
		decode: decode_uri,
		deconstruct: deconstruct_type,
		encode: encode_uri,
		read: read_value,
		is: is_uri_value,
		write: write_value
	}

	//exports
	DataURI.Scope = URIScope
	return DataURI

	//scope actions
	function construct_type(value, ...input){
		if(value instanceof this.Type) return value
		value = this.read(value)
		if('construct' in this.definition) value = this.definition.construct(value)
		return new this.Type(value, ...input)
	}

	function decode_uri(value){
		if(is.text(value)){
			if(this.is(value)) value = DataURI.unwrap(value)
			value = base.is(value) ? base.value(value):value
		}
		return value
	}

	function deconstruct_type(value, ...assignment){
		if('deconstruct' in this.definition) value = this.definition.deconstruct(value, ...assignment)
		return this.write(value)
	}

	function encode_uri(value){
		if(is.text(value)){
			if(this.is(value)) value = DataURI.unwrap(value)
			value = base.is(value) ? value:base.text(value)
		}
		return value
	}

	function is_uri_value(value){ return is.text(value) && value.startsWith(this.prefix) }

	function read_value(value){
		if(is.not.text(value)) throw new Error('Read Error: Invalid URI entry value.')
		if(value instanceof DataURI) value = value.text
		value = this.decode(value)
		switch(this.definition.media){
			case 'meta':
				value = meta.data(value)
				break
			case 'json':
				value = JSON.parse(value)
				break
		}
		return value
	}

	function write_value(value){
		if(value instanceof DataURI) return value
		switch(this.definition.media){
			case 'meta':
				if(is.object(value))  value = meta.text(value)
				break
			case 'json':
				if(is.object(value)) value = JSON.stringify(value)
				break
		}
		if(is.not.text(value)) throw new Error('Write Error: Invalid URI entry value.')
		const {media,data,encoding} = this.definition
		return new DataURI(this.encode(value), {media, data, encoding})
	}

}, async function DataURI(){
	return class DataURI extends String{
		static encoding(encoding){ return encoding ? encoding:'' }
		static get identifier(){ return `data:` }
		static prefix(type, encoding){ return [`${this.identifier}${type}`, this.encoding(encoding)].join(';') }
		static get preset(){ return {encoding: null, media: 'plain', data: 'text'} }
		static type(data, media){ return [data, media].filter(window.modules.is.text).join('/') }
		static value(prefix, text){ return [prefix, text].join(',') }
		static valuable(value){ return window.modules.is.text(value) && value.startsWith(this.identifier) }
		static unwrap(value){ return (value = this.valuable(value) ? value.split(',').reverse()[0]:null, value || null) }
		constructor(value, definition){
			super(value)
			this.resource = Object.assign(this.constructor.preset, definition)
		}
		get encoding(){ return this.resource.encoding }
		get prefix(){ return this.constructor.prefix(this.type, this.encoding) }
		get text(){ return super.toString() }
		get type(){ return this.constructor.type(this.resource.data, this.resource.media) }
		get value(){ return this.constructor.value(this.prefix, super.toString()) }
		toString(){ return this.value }
	}
})