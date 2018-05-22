(define=>'prototyped' in URL?null:define())(()=>{
	URL.prototyped = 0.03
	URL.fragments = function get_valid_text_fragments(...x){ return x.map(i=>typeof i === 'string').filter(i=>i.length) }
	URL.join = function join_url(...x){return new URL(x.filter(i=>!(i instanceof URL)).join('/'), x.filter(i=>i instanceof URL)[0] || window.location.href) }
	URL.site = function join_url_for_main_site_location(...x){ return new URL(URL.fragments(...x).join('/'), window.location.origin) }
	URL.prototype = Object.defineProperties(URL.prototype, {
		basename: {get(){return this.parts().reverse()[0] || ''}},
		extension: {get(){return this.file.split('.').reverse()[0]}},
		file: {get(filename = null){return (filename = this.basename, filename.includes('.') ? filename:'index.html')}},
		filesystem: {get(){return this.protocol === 'file:'}},
		get: {value: async function(options = {}){ return await window.fetch(this, Object.assign({method: 'GET'}, options)) }},
		includes: {value(...x){return this.pathname.includes(...x)}},
		indexOf: {value(...x){return this.pathname.indexOf(...x)}},
		json: {value: async function(method = 'get', data, options){return await this[method](data, Object.assign({'content-type': 'application/json'}, options || {})).then(x=>x.json())}},
		localhost: {get(){return this.hostname === 'localhost'}},
		module: {value: async function(options = {}){return await(eval(await(this.get(Object.assign({'content-type': 'application/javascript'}, options)).then(x=>x.text())))) }},
		parts: {value(filter = i=>i.length){return this.pathname.split('/').filter(filter)}},
		post: {value: async function(data = {}, options = {}){ return await window.fetch(this, Object.assign({method: 'POST', body: JSON.stringify(data)}, (options))) }},
		secure: {get(){return this.protocol === 'https:' || this.protocol === 'wss:' || this.localhost === true}},
		split: {value(...x){return this.pathname.split(...x)}}
	})
})
