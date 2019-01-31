(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('ExtendedCollection', {value:await module(...inputs)}); return window.modules.has('ExtendedCollection')?window.modules.get('ExtendedCollection'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Import, Base, Locations, Url){

	class ExtendedCollection{
		static get load(){ return load_collection(this) }
		constructor(base, definitions){ Base.construct(this, base, definitions) }
		get base(){ return Base(this) }
		get get(){ return get_module(this) }
		get has(){ return has_module(this) }
		get import(){ return Import(this) }
		get let(){ return let_module(this) }
		get locations(){ return Locations(this) }
		get set(){ return set_module(this)  }
		get url(){ return Url(this) }
	}

	//exports
	return ExtendedCollection

	//scope actions
	function get_module(collection){
		return function get_collection_module(notation){
			return window.modules.dot.get(collection, notation)
		}
	}

	function has_module(collection){
		return function has_collection_module(notation){
			return window.modules.dot.has(collection, notation)
		}
	}

	function let_module(collection){
		return function let_collection_properties(properties){
			return Object.entries(properties).reduce(reduce,collection)
			//scope actions
			function reduce(o, property){ return (o.set(...property), o) }
		}
	}

	function load_collection(Type){
		return async function load_collection_base(base, definitions){
			return Base.load(new Type(base), definitions)
		}
	}

	function set_module(collection){
		return function set_collection_module(notation, module){
			return window.modules.dot.set(collection, notation, module)
		}
	}


}, async function collection_imports(){
	const {is} = window.modules
	const unpkg = new URL(`https://unpkg.com/`)
	const imports = {
		asset: import_asset, //additional document body scripts or document head links related to the collection or its modules
		class: import_class, //a "class" from the "class" folder
		component: import_component, //custom-element from the "component" folder
		dependency: import_dependency, //a package or module defined in a "package.json > dependencies" loaded from unpkg.com versioned as defined or @latest by default
		//"design", //a design loaded from the "design" folder of an inner folder inside the "component" folder
		export: import_export, //a module from the "module" folder loaded via built-in "import(url)"
		function: import_function, //a single-purpose function from the "function" folder
		mixin: import_mixin, //a mixin function from the "mixin" folder
		module: import_module, //a module from the "module" folder loaded via "window.modules.import"
		package: import_package  //a package.json file
		//"templet", //a lit.html templet loaded from the "templet" folder of an inner folder inside the "component" folder
	}

	//exports
	return get_import

	//scope actions
	function get_import(collection){

		//exports
		return new Proxy(import_type('module'), {
			get(o, field){
				if(field in o) return is.function(o[field]) ? o[field].bind(o):o[field]
				else if(field in imports) return import_type(field)
				else switch(field){ case 'types': return Object.keys(imports) }
				return null
			},
			has(o, field){ return field in o || field in imports },
			ownKeys(){ return Object.keys(imports) }
		})

		//scope actions
		function import_type(type='module'){
			return async function import_collection_type(...x){
				return imports[type](collection, ...x)
			}
		}
	}

	async function import_asset(collection, locator, ...notation){
		locator = collection.url(locator)
		if(notation.length){
			window.module.import.assets(locator)
			return await window.modules.wait(true, ...notation)
		}
		return await window.module.import.assets(locator)
	}

	async function import_class(collection, ...locator){
		return await import_url(collection, collection.url('class', ...locator))
	}

	async function import_component(collection, locator, ...notation){
		if(notation.length) return await import_asset(collection, collection.url('component', locator), ...notation)
		return await import_url(collection, collection.url('component', locator))
	}

	async function import_dependency(collection, name, ...notation){
		const {dependencies} = collection.base
		if(dependencies && name in dependencies) name = `${name}@${dependencies[name]}`
		else if(name.includes('@') === false) name = `${name}@latest`
 		return await import_asset(collection, URL.join(name,unpkg), ...notation)
	}

	function import_export(collection, ...locator){
		return import(`${collection.url(...locator)}`)
	}

	async function import_function(collection, ...locator){
		locator = collection.url('function', ...locator)
		if(collection.has(`function.${locator.field}`)) return collection.get(`function.${locator.field}`)
		return await import_url(collection, locator)
	}

	async function import_mixin(collection, ...locator){
		return await import_url(collection, collection.url('mixin', ...locator))
	}

	async function import_module(collection, ...locator){
		return await import_url(collection, collection.url('module', ...locator))
	}

	async function import_package(collection, ...x){
		return (await window.modules.http.get(collection.url(...x))).data
	}

	async function import_url(collection, url){
		if(collection.has(url.field)) return collection.get(url.field)
		if(url.extension !== 'js') url = new URL(`${url}.js`)
		return (await window.modules.http.get(url)).module
	}

},async function Base(){
	const {is} = window.modules
	const collection_base = Symbol('ExtendedCollection.base')
	const collection_json = Symbol('ExtendedCollection.base has package.json')

	const base_function = get_collection_base
	base_function.construct = construct_collection_base
	base_function.load = load_collection_base
	//exports
	return base_function

	//scope actions
	function assign_base_properties(collection, base){
		if('folder' in base === false){
			if(base.url.file === 'index.html') base.folder = base.url
			else base.folder = new URL(base.url.href.replace(base.url.file, ''))
		}
		return base
	}
	function construct_collection_base(collection, base, definitions){
		if(base instanceof URL) base = {url:base}
		else if(is.text(base)) base = {url:URL.join(base)}
		if(is.data(base) === false) base = {url:URL.join()}
		if(is.data(definitions)) Object.assign(collection, definitions)
		collection[collection_base] = assign_base_properties(collection, base)
	}
	function get_collection_base(collection){ return collection[collection_base] }
	async function load_collection_base(collection, from_url=null){
		if(collection_json in this === false){
			if(collection.base.url.extension === 'json'){
				try{ Object.assign(collection.base, window.modules.http.get(collection.base.url).data) }
				catch(error){}
			}
			collection.base[collection_json] = true
		}
		if(is.function(from_url)) from_url = await from_url(collection)
		if(is.data(from_url) && from_url !== collection){
			try{
				if(from_url instanceof URL) Object.assign(collection.base, window.modules.http.get(from_url).data)
				else Object.assign(collection.base, from_url)
			}
			catch(error){}
		}
		return (assign_base_properties(collection, collection.base), collection)
	}
},
async function Locations(){
	const {is} = window.modules
	const collection_base_locations = Symbol('ExtendedCollection.locations')

	//exports
	return get_collection_locations

	//scope actions
	function create_collection_locations(collection, base = null){
		base = collection.base
		const locations = {}
		if('locations' in base){
			for(const field of base.locations){
				let value = base.locations[field]
				if(is.text(value)){
					if(value.indexOf('http') === 0) value = new URL(value)
					else value = URL.join(value, base.folder)
				}
				else if(is.array(value)) value = URL.get(...value, base.folder)
				if(value instanceof URL) window.modules.dot.set(locations, field, value)
			}
		}
		return (base=null,locations)
	}

	function get_collection_locations(collection){
		if(collection_base_locations in collection) return collection[collection_base_locations]
		return collection[collection_base_locations] = create_collection_locations(collection)
	}

}, async function Url(){
	//exports
	return get_collection_url
	//scope actions
	function get_collection_url(collection){
		return function create_collection_url(notation, ...locator){
			if(URL.is(notation)) notation = new URL(notation)
			if(notation instanceof URL) {
				if(notation.origin !== collection.base.url.origin){
					locator = locator.length ? URL.get(notation, ...locator):notation
				}
			}
			else if(collection.has(`locations.${notation}`)) locator = collection.get(`locations.${notation}`).at(...locator)
			else locator = collection.base.url.at(notation,...locator)
			if(locator.extension === null) locator.field = locator.basename
			else locator.field = locator.file.replace(`.${locator.extension}`,'')
			return locator
		}
	}
})
