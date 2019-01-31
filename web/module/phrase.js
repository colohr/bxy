(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('phrase',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('phrase')?_.get('phrase'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(expressions){
	const fields = ['capitalize', 'class', 'clean', 'count', 'dash', 'dot_notation', 'empty', 'lower', 'list', 'medial', 'original', 'path', 'phrase', 'proper', 'separate', 'source', 'slash','space' , 'symbol', 'readable', 'text', 'underscore', '_', 'upper', 'words']

	//exports
	window.modules.set('id', new Proxy(text_phrase,{get, has, ownKeys(o){ return Array.from(new Set(Reflect.ownKeys(o).concat(fields))).sort() } }))
	return text_phrase

	//scope actions
	function get(o,field){ return fields.includes(field) ? (...x)=>text_phrase(...x)[field]:(Reflect.get(o, field) || null) }

	function has(o, field){ return fields.includes(field) || Reflect.has(o, field) }

	function text_phrase(value, separator = '_'){
		separator = typeof separator !== 'string' ? '_':separator
		const original = text(value)
		value = phrase(original)

		//exports
		return new Proxy(new String(value), {
			get(o, field){
				if(field in o) return typeof value[field] === 'function' ? value[field].bind(value):value[field]
				switch(field){
					case 'capitalize':
						return capitalize(o)
					case 'class':
						return words(o).map(capitalize).join('')
					case 'clean':
						return clean(o)
					case 'count':
						return o.trim().length
					case 'dash':
						return text_phrase(`${o}`, '-').phrase.toLowerCase()
					case 'dot_notation':
						return text_phrase(`${o}`, '.').phrase
					case 'empty':
						return o.trim().length === 0
					case 'lower':
						return o.toLowerCase()
					case 'list':
						return list(o)
					case 'medial':
						return words(o).map((word, index)=>index > 0 ? capitalize(word):word).join('')
					case 'original':
						return original
					case 'path':
					case 'slash':
						return text_phrase(`${o}`, '/').phrase
					case 'phrase':
						return phrase(o)
					case 'proper':
						return words(o).map(capitalize).join(' ')
					case 'separate':
						return separate(o)
					case 'source':
						return (...x)=>text_phrase(...x)
					case 'space':
					case 'readable':
						return text_phrase(`${o}`, ' ')
					case 'symbol':
						return Symbol.for(`${o}`)
					case 'text':
						return `${o}`
					case 'underscore':
					case '_':
						return text_phrase(`${o}`, '_').phrase.toLowerCase()
					case 'upper':
						return o.toUpperCase()
					case 'words':
						return words(o)
				}
				return null
			}
		})

		//scope actions
		function capitalize(x){ return x.replace(/\b\w/g, l=>l.toUpperCase()) }

		function clean(x){ return x.split(separator).map(i=>i.trim()).filter(i=>i.length).join(separator) }

		function escape_decimal_numbers(x){ return x.replace(/([0-9])+\.([0-9])/g, `$1$2${separator}`) }

		function list(x){
			for(const expression of expressions.aggregators) x = x.replace(expression, ' ')
			return x.split(' ').map(i=>i.trim()).filter(i=>i.length)
		}

		function phrase(x){
			x = separate(x)
			for(const category in expressions){
				for(const expression of expressions[category]){
					x = x.replace(expression, separator)
				}
			}
			return clean(x).trim()
		}

		function separate(x){
			x = escape_decimal_numbers(x)
			if(window.modules.is.text.uppercase(x)) return x
			return x.replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2').replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
		}

		function text(value){
			if(typeof value === 'string') return value
			const type = typeof value
			if(type === 'undefined' || value === null || isNaN(value) || type === 'symbol') return ''
			else if(value instanceof String) return `${value}`
			if(type === 'object'){
				try{
					if(!Array.isArray(type)){
						let object_text = `${value}`
						if(object_text.charAt(0) === '[') value = JSON.stringify(value)
						else value = object_text
					}
					else JSON.stringify(value)
				}
				catch(e){ value = '' }
			}
			else if(type === 'function') value = value.toString()
			else value = `${value}`
			return value.trim()
		}

		function words(x){ return phrase(x).split(separator) }

	}
}, [function expressions(){
	return {
		aggregators:[
			/\+/g,
			/\,/g,
			/\|/g,
			/ /g,
		],
		indicators:[
			/\-/g,
			/\./g,
			/\:/g,
			/\//g,
			/\_/g,
			/\(/g,
			/\)/g,
			/\[/g,
			/\]/g,
			/\=/g,
			/\"/g
		]
	}
}])
