(function define(definition, UrlPrototype){ return 'prototyped' in URL ? null:definition(UrlPrototype)})
(function definition(UrlPrototype){
	//exports
	URL.base = ()=>get_window_location()
	URL.get = get_url
	URL.fragment = get_fragment
	URL.is = is_text_locator
	URL.join = join_url
	URL.prototyped = 0.08
	return UrlPrototype(URL)
	//scope actions
	function get_fragment(){
		const starts = window.modules.is.text(arguments[0]) && arguments[0].startsWith('/')
		const ends = window.modules.is.text(arguments[0][arguments.length-1]) && arguments[0][arguments.length - 1].endsWith('/')
		if('value' in URL.fragment === false) URL.fragment.value = window.modules.is.dictionary.fragment('/')
		let value = URL.fragment.value(...arguments)
		if(starts) value = `/${value}`
		if(ends) value = `${value}/`
		return value
	}
	function get_url(...x){
		let origin = x.filter(window.modules.is.url)[0] || null
		if(origin === null){
			origin = x.filter(window.modules.is.url.notation)[0] || null
			if(origin) origin = window.modules.get(`project.${x.splice(x.indexOf(origin),1)[0]}`)
			if(origin && is_text_locator(origin)) origin = new URL(origin)
		}
		if(origin===null){
			origin = x.filter(is_text_locator)[0] || null
			if(origin) origin = new URL(x.splice(x.indexOf(origin), 1)[0])
		}
		return URL.join(origin, window.modules.is.dictionary.fragments(...x.join('/').split('/')).join('/'))
	}
	function get_window_location(){ return this.constructor.name === 'Window' ? window.location.href:window_location }
	function join_url(...x){ return window.modules.is.dictionary.locator.url(new URL(x.filter(window.modules.is.text).join('/'), x.filter(window.modules.is.url)[0] || get_window_location())) }
	function is_text_locator(value){ return window.modules.is.url.text(value) }

 	//function is_valuable(fragment){ return fragment.length > 0 }
	//function fragment(value){ return typeof value === 'string' ? value.trim():'' }

},
function UrlPrototype(){
	const resource = {
		id: Symbol('URL.id'),
		field: Symbol('URL.field'),
		header: Symbol('URL.header[Content-Type]'),
		type: Symbol('URL.type'),
		wait: Symbol('URL.wait')
	}

	return Object.entries({
		at: {get: at},
		basename: {get: basename},
		extension: {get: extension,set:extension},
		file: {get: file},
		includes: {value: includes},
		indexOf: {value: index_of},
		is: {get: get_is},
		parts: {value: parts},
		split: {value: split}
	}).reduce(reduce, arguments[0])

	//scope actions
	function at(){
		return Object.entries({
			id: url_property('id'),
			field: url_property('field'),
			has:{value:url_has_property},
			header: url_property('header', 'data'),
			type: url_property('type'),
			wait: url_property('wait','array'),
		}).reduce(reduce, url_at).bind(this)
		//scope actions
		function url_at(...locator){ return URL.join(URL.fragment(...locator), this) }
		function url_has_property(name){ return name in resource && resource[name] in this }
		function url_property(name, type='text'){
			const property = resource[name]
			return { get: url_property_value, set: url_property_value }
			//scope actions
			function url_property_value(setting=null){
				if(window.modules.is[type](setting)) this[property] = setting
				if(property in this===false) switch(name){
					case 'id': return this.extension ? this.file.replace(`.${this.extension}`, ''):this.basename
					case 'header': return this.extension?window.modules.http.content[this.extension]:{}
					case 'type': return this.type['Content-Type'] || null
					case 'wait': return []
					default: return null
				}
				return this[property]
			}
		}
	}
	function basename(){ return this.parts().reverse()[0] || '' }
	function extension(setting=null){
		if(setting !== null) {
			if(this.pathname.endsWith('/')) this.pathname=this.pathname.slice(0,this.pathname.length-1)
			this.pathname=`${this.pathname}.${setting}`
		}
		return window.modules.is.dictionary.extension(this.pathname)
	}
	function file(){return this.extension?this.basename:(this.pathname.endsWith('/')?'/':this.pathname=`${this.pathname}/`,'/')}
	function includes(){return this.pathname.includes(arguments[0])}
	function index_of(){return this.pathname.indexOf(arguments[0])}
	function get_is(){
		return is(this)
		//scope actions
		function is(uniform_resource_locator){
			return {
				get folder(){ return uniform_resource_locator.file === '/' },
				get file(){ return uniform_resource_locator.file !== '/' },
				get filesystem(){ return uniform_resource_locator.protocol === 'file:' },
				get localhost(){ return uniform_resource_locator.hostname === 'localhost' },
				get secure(){ return window.modules.is.url.secure(uniform_resource_locator.protocol) }
			}
		}
	}

	function parts(filter = i=>i.length){return this.pathname.split('/').filter(filter)}
	function reduce(Base,entry){ return (Object.defineProperty(Base.prototype,entry[0],entry[1]),Base) }
	function split(){return this.pathname.split(arguments[0]) }
})
