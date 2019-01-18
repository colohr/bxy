this.FormData = Map;
const modules = this.modules = (function worker_modules(){
	const packages = {Storage: {notation: 'localforage', url: 'https://unpkg.com/localforage/dist/localforage.nopromises.min.js'}}

	//exports
	return {
		get ['@meta'](){ return this.directory['@meta'] },
		define(notation, {value}){ return this.set(notation, value) },
		directory: {
			base: {},
			locator(type, file){
				switch(type){
					case 'script':
						return {name: file, url: new URL(`${file}/index.js`, this.base[type].href.replace('/index.js', ''))}
				}
				return {name: file, url: new URL(file.includes('.') ? file:`${file}.js`, this.base[type].href.replace('/index.js', ''))}
			},
			url(type, file){ return type in this.base ? new URL(file, this.base[type]):new URL(type, file) }
		},
		get(notation){
			if(this.has(notation) === false) return null
			return 'dot' in this ? this.dot.get(this, notation):this[notation]
		},
		has(notation){ return notation in this || ('dot' in this && this.dot.has(this, notation)) },
		import: modules_import(),
		set(notation, value){
			if('dot' in this) this.dot.set(this, notation, value)
			else this[notation] = value
			return value
		},
		url(type, ...location){
			if(this.has(`project.${type}`)) location.push(this.get(`project.${type}`))
			else location.unshift(type)
			return URL.join(...location)
		},
		get storage(){
			return (function get_storage(window_modules){
				return {
					async clear(){ return await (await Storage()).clear() },
					async count(){ return await (await Storage()).length() },
					async delete(...x){ return await (await Storage()).removeItem(...x) },
					async drop(...x){ return await (await Storage()).dropInstance(...x) },
					async field(...x){ return await (await Storage()).key(...x) },
					async fields(){ return await (await Storage()).keys() },
					async get(field){ return await (await Storage()).getItem(field) },
					async has(field){ return await (await this.get(field)) !== null },
					async iterate(...x){ return await (await Storage()).iterate(...x) },
					async load(...x){ return await Storage(...x) },
					async set(field, value){ return await (await Storage()).setItem(field, value) },
					async user(update){
						const identifier = `user@${window_modules.phrase(`${window_modules.window_locator}`).underscore}`
						let user = null
						if(await this.has(identifier)) user = await this.get(identifier)
						if(typeof update === 'object' && update !== null){
							if(user) user = Object.assign(user, update)
							else user = update
							user.updated = new Date()
							await this.set(identifier, user)
						}
						else if(update === false) return (await this.delete(identifier), null)
						return user
					}
				}

				async function Storage(...configuration){
					//exports
					return 'storage-name' in window_modules ? await storage_module():configure_storage(await storage_module())

					//scope actions
					function configure_storage(storage){
						if(configuration.length){
							storage.config(...configuration)
							window_modules['storage-name'] = storage.config.name
						}
						else if(window_modules.base && 'version' in window_modules.base && 'name' in window_modules.base){
							window_modules['storage-name'] = window_modules.phrase(`${window_modules.base.name} version ${window_modules.base.version}`).underscore
							storage.config({name: window_modules['storage-name']})
						}
						else window_modules['storage-name'] = storage.config.name
						return storage
					}

					async function storage_module(){ return 'Storage' in window_modules ? window_modules.Storage:await window_modules.import.package('Storage') }
				}
			})(this)
		},
		tick(action){ return setTimeout(action, 10) },
		get window_locator(){ return window_location.href.replace(`${window_location.search}`, '').replace(`${window_location.hash}`, '') }
	}

	//scope actions
	function modules_import(){

		const module_import = {assets: import_scripts, class: import_asset, function: load_function, json: import_json, meta: import_meta, mixin: import_asset, module: import_asset, package: import_package, script: import_script}
		//exports
		return new Proxy(import_asset, {
			get(o, field){ return field in module_import ? module_import[field]:null },
			has(o, field){ return field in module_import },
			ownKeys(){ return Object.getOwnPropertyNames(module_import) }
		})

		//scope actions
		function get_locator(locator, base = window_location){
			if(typeof locator === 'string') locator = URL.is(locator) ? new URL(locator):new URL(locator, base)
			return locator
		}

		async function load_function(name){
			if(modules.has(name)) return modules.get(name)
			await import_asset(modules.directory.url('function', `function.${name}.js`))
			return modules.get(name)
		}

		async function import_asset(locator){ return await modules.http(get_locator(locator)).then(function on_response(response){ return response.module }) }

		async function import_json(name){ return (await modules.http(get_locator(`${name}.json`, modules.directory.base.json))).data }

		async function import_meta(name){ return await modules.meta.import(get_locator(`${name}.meta`, modules.directory.base.meta)) }

		async function import_script(locator){
			return await fetch(get_locator(locator)).then(on_response).then(on_script).catch(console.error)

			//scope actions
			function on_response(response){ return response.text() }

			async function on_script(script){ return await eval(`(function(){const module = {exports:{}};${script};return module.exports;})()`) }
		}

		async function import_package(locator, ...x){
			let name = null
			if(locator in packages){
				if(modules.has(locator)) return modules.get(locator)
				name = locator
				locator = packages[locator]
			}
			else locator = {url: unpack(locator, ...x)}
			importScripts(locator.url)
			if('notation' in locator && name) modules.set(name, await modules.wait(locator.notation, true))
			return name ? modules.get(name):modules
		}

		function unpack(...x){ return new URL(`https://unpkg.com/${x.filter(i=>i.length).join('/')}`) }

		async function import_scripts(...location){
			location = location.reduce(reduce_asset, [])
			return importScripts(...location)

			//scope actions
			function reduce_asset(list, asset){
				if(Array.isArray(asset) === false){
					if(asset instanceof URL) list.push(asset)
					else if(asset instanceof Object) list.push(asset.url)
					else if(URL.is(asset)) list.push(asset)
					return list
				}
				return asset.reduce(reduce_asset, list)
			}
		}

	}
})()

