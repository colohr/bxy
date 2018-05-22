(function(Phrase){ return Phrase() })
(function(){
	return function text_phrase(value, separator = '_'){
		separator = typeof separator !== 'string' ? '_':separator

		const original = text(value)
		value = phrase(original)

		//returning value
		return new Proxy(new String(value), {
			get(o, i){
				if(i in o){ return typeof value[i] === 'function' ? value[i].bind(value):value[i] }
				const field = typeof i === 'string' ? singular(i):null
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
					case 'json':
						return JSON.parse(o)
					case 'lower':
						return o.toLowerCase()
					case 'medial':
						return words(o).join('')
					case 'original':
						return original
					case 'path':
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

		//shared actions
		function capitalize(x){ return x.replace(/\b\w/g, l=>l.toUpperCase()) }

		function clean(x){ return x.split(separator).map(i=>i.trim()).filter(i=>i.length).join(separator) }

		function phrase(x){
			x = separate(x)
			x = x.replace(/\-/g, separator)
			x = x.replace(/ /g, separator)
			x = x.replace(/\,/g, separator)
			x = x.replace(/\./g, separator)
			x = x.replace(/\:/g, separator)
			x = x.replace(/\//g, separator)
			x = x.replace(/\_/g, separator)
			return clean(x).trim()
		}

		function separate(x){
			return x.replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
					.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
		}

		function singular(x){
			if(x === 'class' || x === 'words') return x
			x = x.trim()
			const count = x.length
			if(x.charAt(count - 1) === 's') return x.substring(x, count - 2)
			return x
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
})