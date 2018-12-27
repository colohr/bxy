(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('unicode', {value:await module(...inputs)}); return window.modules.has('unicode')?window.modules.get('unicode'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(entities){
	const identity_fields = ['character','number','code', 'unicode']
	const original = Symbol('original entity')
	const function_fields = [
		'by',
		'categories',
		'characters',
		'find',
		'sets',
		'types'
	]

	//exports
	return new Proxy(get_entities,{
		get(o,field){
			if(field in o) return typeof o[field] === 'function' ? o[field].bind(o):o[field]
			else switch(field){
				case 'by': return get_by
				case 'categories': return get_categories()
				case 'characters': return get_characters()
				case 'find': return find_entities
				case 'sets': return get_sets()
				case 'types': return get_types()
			}
			return typeof field === 'string' ? get_entities(field)[0] || null:null
		},
		has(o,field){ return field in o || function_fields.includes(field) },
		ownKeys(){ return function_fields }
	})

	//scope actions
	function create_entity(data){ return Object.assign(Object.create(data), {toString(){ return this.hex }}) }

	function find_entities(...search){
		const list = new Set()
		for(const data of entities) if(matches(Object.values(data))) list.add(data)

		//exports
		return Array.from(list).map(create_entity)

		//scope actions
		function matches(values){
			for(const term of search) if(is_match(term)) return true
			return false
			//scope actions
			function is_match(term){
				if(values.includes(term)) return true
				for(const value of values){
					if(typeof value === 'text' && value.includes(term)) return true
				}
				return false
			}
		}
	}

	function get_by(field, value, return_original){
		for(const entity of entities) {
			if(entity[field] === value) {
				return return_original === original ? entity:create_entity(entity)
			}
		}
		return null
	}

	function get_characters(){ return new Set(entities.map(({character})=>character)) }

	function get_categories(){ return new Set(entities.map(({cateogory})=>cateogory)) }

	function get_entities(...identities){
		const list = new Set()
		for(const identity of identities){
			let data = null
			for(const field of identity_fields){
				if(data === null){
					data = get_by(field, identity, original)
					if(data) list.add(data)
				}
			}
		}
		return Array.from(list).map(create_entity)
	}

	function get_sets(){ return new Set(entities.map(({set})=>set)) }

	function get_types(){ return new Set(entities.map(({type})=>type)) }


}, async function unicode_entities(){
	return await window.modules.import.json('unicode.entities.json')
})
