(function define(definition, UrlPrototype){ return 'prototyped' in URL ? null:definition(UrlPrototype)})
(function definition(UrlPrototype){
	//exports
	URL.prototyped = 0.05
	URL.fragments = get_fragments
	URL.is = is_external_locator
	URL.join = function join_url(...x){return new URL(x.filter(i=>!(i instanceof URL)).join('/'), x.filter(i=>i instanceof URL)[0] || get_window_location()) }
	return UrlPrototype(URL)
	//scope actions
	function get_window_location(){ return this.constructor.name === 'Window' ? window.location.href:window_location }
	function get_fragments(...values){ return values.map(fragment).filter(is_valuable) }
	function fragment(value){ return typeof value === 'string' ? value.trim():'' }
	function is_external_locator(value){ return (value=fragment(value), value.indexOf('http') === 0 && (value.indexOf('http://') === 0 || value.indexOf('https://') === 0)) }
	function is_valuable(fragment){ return fragment.length > 0 }

},
function UrlPrototype(){
	const protocols = ['http','ws','ftp']
	return Object.entries({
		at: {value: at},
		basename: {get: basename},
		extension: {get: extension},
		file: {get: file},
		includes: {value: includes},
		indexOf: {value: index_of},
		is: {get: get_is},
		parts: {value: parts},
		split: {value: split}
	}).reduce(reduce, arguments[0])

	//scope actions
	function at(...locator){ return (locator.push(this), URL.join(...locator))}
	function basename(){ return this.parts().reverse()[0] || '' }
	function extension(){ return this.file.split('.').reverse()[0] }
	function file(filename = null){return (filename = this.basename, filename.includes('.') ? filename:'/')}
	function includes(){return this.pathname.includes(arguments[0])}
	function index_of(){return this.pathname.indexOf(arguments[0])}
	function get_is(){
		return is(this)
		//scope actions
		function is(uniform_resource_locator){
			return {
				get folder(){ return is_folder.call(uniform_resource_locator) },
				get file(){ return is_file.call(uniform_resource_locator) },
				get filesystem(){ return is_filesystem.call(uniform_resource_locator) },
				get localhost(){ return is_localhost.call(uniform_resource_locator) },
				get secure(){ return is_secure.call(uniform_resource_locator) }
			}
			//scope actions
			function is_folder(){return this.file === '/'}
			function is_file(){return this.file !== '/'}
			function is_filesystem(){ return this.protocol === 'file:' }
			function is_localhost(){ return this.hostname === 'localhost'}
			function is_secure(){ return protocols.filter(id=>`${id}s:`===this.protocol).length>0 || this.localhost === true }
		}
	}
	function parts(filter = i=>i.length){return this.pathname.split('/').filter(filter)}
	function reduce(Base,entry){ return (Object.defineProperty(Base.prototype,entry[0],entry[1]),Base) }
	function split(){return this.pathname.split(arguments[0]) }
})
