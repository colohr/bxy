(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('constructor.Project', {value:await module(...inputs)}); return window.modules.has('constructor.Project')?window.modules.get('constructor.Project'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Project){

	//exports
	return create_project

	//scope actions
	async function create_project(element, project_field = 'project'){
		//exports
		return await Project.load(window.modules.set(project_field,new Project(await load_meta(), element)))

		//scope actions
		async function load_meta(base=null){
			try{
				if(element.url.extension === 'meta') base = await window.modules.meta.import(element.url)
				else base = await (await window.modules.http(element.url)).json(false,{})
			}
			catch(e){  }
			return window.modules.is.data(base) ? base:{}
		}
	}

}, async function Project(){
	const {dot,is} = window.modules
	class Project{
		static get load(){ return load_project }
		constructor(...x){ construct_project(this,...x) }
		get dependencies(){ return this.package.dependencies }
	}

	return Project

	//scope actions
	function construct_project(project, data, element){
		if(dot.has(data, 'project') === false) data.project = {}
		project.package = data
		project.element = element
		project.main = create_main(project, dot.get(data, 'project.main'))
		project.domain = create_domain(project,data)
		project.subdomain = create_subdomain(project, dot.get(data, 'project.subdomain'))
	}

	function create_domain(project, data){

		if(dot.has(data, 'project.domain') === false) data.project.domain = {}
		if(dot.has(data, 'project.domain.protocol') === false) data.project.domain.protocol = project.element.url.protocol.replace(':','')
		if(dot.has(data, 'project.domain.name') === false) data.project.domain.name = project.element.url.hostname
		return data.project.domain
	}

	function create_main(project,data){
		if(is.data(data) === false) data = {}
		data.url = get_main_url
		return data

		//scope actions
		function get_main_url(...locator){
			let location = undefined
			if(dot.has(project, locator[0])) location = dot.get(project, locator[0])
			if(location instanceof URL === false) location = undefined
			else locator.splice(0,1)
			if(is.nothing(location) && dot.has(project, 'main.location')) location = dot.get(project, 'main.location')
			if(location instanceof URL === false) location = undefined
			if(is.nothing(location) === false) locator.push(location)
			return URL.join(...locator)
		}

	}

	function create_subdomain(project, data, subdomain={}){
		if(is.array(data) === false) data = []
		for(const name of data){
			subdomain[name] = new URL(`${project.domain.protocol}://${name}.${project.domain.name}/`)
		}
		return subdomain
	}

	async function load_project(project, assets=[]){
		for(const field in project.subdomain) dot.set(project,field,project.subdomain[field])
		if(dot.has(project, 'package.project.locations')) await create_locations(dot.get(project,'package.project.locations'))

		if(dot.has(project, 'main.define')) await define_base_data(dot.get(project,'main.define'))

		Object.defineProperty(project.package, 'locations', {get(){ return window.modules.project }})

		if(dot.has(project, 'main.assets')){
			for(const item of dot.get(project, 'main.assets')){
				if(typeof item === 'string') assets.push({url: project.main.url(item)})
				else assets.push(item)
			}
		}
		if(assets.length) await window.modules.import.assets(...assets)
		if(dot.has(project,'main.wait')) await window.modules.wait(...project.main.wait)

		//exports
		return project

		//scope actions
		async function create_location(field, location){
			const folder = get_folder(location)
			const origin = get_origin(location)

			const location_name = dot.has(location, 'field') ? location.field:field
			dot.set(project, location_name, Object.assign(URL.join(`${folder}/`, origin), location))

			if(dot.has(location,'assets')){
				for(const asset of dot.get(location, 'assets')){
					assets.push({location:location_name, url:await get_url(origin, join_locations(folder, asset))})
				}
			}

			if(dot.has(location, 'items')){
				for(const item of dot.get(location, 'items')){
					set_project_location(item, await get_url(origin, `${join_locations(folder, item)}/`))
				}
			}

			if(dot.has(location, 'locations')){
				for(const notation in dot.get(location, 'locations')){
					set_project_location(notation, await get_url(origin, join_locations(folder, location.locations[notation])))
				}
			}

			//scope actions
			function set_project_location(notation, value){
				const extend_location = dot.has(project, notation) ? dot.get(project, notation):null
				dot.set(project, notation, Object.assign(value, extend_location))
			}

		}

		async function create_locations(locations){
			project[Symbol.for('locations')] = locations
			return await Promise.all(Object.entries(locations).map(get_location))
			//scope actions
			function get_location(fieldset){ return create_location(...fieldset) }
		}

		async function define_base_data(definitions){
			for(const field in definitions) dot.set(project, field, await (await window.modules.http(get_base_item(definitions[field]))).data)

			function get_base_item(item){
				if(item.includes('http')) return new URL(item)
				else if(item.includes('@')){
					item = item.split('@')
					return new URL(item[0], dot.get(project, item[1]))
				}
				return project.main.url(item)
			}
		}

		function get_folder(location, locations = []){
			if(dot.has(location, 'folder')) locations.push(dot.get(location, 'folder'))
			if(dot.has(location, 'version')) locations.push(dot.get(location, 'version'))
			return join_locations(...locations)
		}

		function get_origin(location){
			if(dot.has(location,'subdomain')) return project.subdomain[location.subdomain]
			return URL.join()
		}

		async function get_url(origin, value){

			if(is.text(value)){
				if(value.includes('${')) {
					value = window.modules.tag(value)
				}
			}
			else value = '/'


			return new URL(value,origin)
		}

		function join_locations(...location){
			return location.join('/').split('/').filter(i=>i.trim().length).join('/')
		}

	}
})
