(async function define_module(...x){
	const define = async (module, ...inputs)=>await window.modules.define('Document.CSS', {value: await module(...inputs)})
	return window.modules.has('Document.CSS') ? window.modules.get('Document.CSS'):await (async ([module], asyncs, ...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1), (x = x.map(i=>i instanceof Promise ? async ()=>await i:i).reduce((l, i)=>((typeof(i) === 'function' && i.constructor.name === 'AsyncFunction') ? l[0].push(i()):l.push(i), l), [[]]))[0], ...x.slice(1, x.length))
})
(async function export_module(){
	const {is} = window.modules
	const selector_characters = ['#', '[', '.', ':','(',')',']','=']
	const special_characters = [/#/g, /\[/g, /\./g, /:/g, /\(/g, /\)/g, /\]/g, /=/g]
	const unit_characters = ['em','rem','px','pt','vw','vh']
	const origin = Symbol('CssUnitValue original value')
	const once = Symbol('CssUnitValue once value')
	const renamed = Symbol('Css map renamed')
	const check_limit = 100

	class CssUnitValue{
		constructor(...x){
			this[origin] = x[0]
			this.type = x[1]
			if(this.type.charAt(0) === 'v'){
				this.view_type = this.type.charAt(1) === 'h' ? 'height':'width'
			}

		}
		get origin(){ return this[origin] }
		set origin(value){ return this[once] = value }
		value(as_value=null){
			const x = as_value !== null ? as_value:(once in this ? this[once]:this[origin])
			if('view_type' in this) return this.view(x)
			return `${x}${this.type}`

		}
		view(percent=100){
			return `${value()[this.view_type]}px`
			//scope actions
			function value(){
				return {
					get height(){ return (percent / 100) * window.innerHeight },
					get width(){ return (percent / 100) * window.innerWidth }
				}
			}
		}
		toString(value=null){ return (value=this[once],delete this[once], this.value(value)) }
	}

	class CssVariable{
		constructor(...x){
			this[origin] = x[0]
			this.fields = get_fields()
			this.get_value = x[1]

			//scope actions
			function get_fields(){ return x[0].replace(/ /g,'').split(',var(').map(i=>i.replace(/var\(/g, '').replace(/\)/g, '').replace('--','').trim()).filter(i=>i.length) }
		}
		get value(){
			for(const field of this.fields){
				const value = this.get_value(field)
				if(value !== null) return (this.field= field, value)
			}
			return this[origin]
		}
		get origin(){
			const value = this.value
			if(value instanceof CssUnitValue) return value.origin
			else if(value instanceof CssVariable) return value.origin
			return 'field' in this ? this.field:this[origin]
		}
		toString(){ return `${this.value}` }
	}

	class Css extends Map{
		static values(declaration){
			const count = declaration.length
			const values = new Set()
			for(let i = 0; i < count; i++){
				const value = get_value(i)
				if(value) values.add(value)
			}
			return values

			//scope actions
			function get_value(index){
				const name = declaration.item(index)
				const property_value = declaration.getPropertyValue(name).trim()
				if(property_value) return {name, value: get_css_value(property_value)}
				return null
			}
		}

		static selector(selector_text){
			if(typeof selector_text !== 'string') return null
			const parts = selector_text.replace(':host', '').replace(':host-context', '')
									   .replace('::before','_before').replace(':before', '_before')
									   .replace('::after', '_after').replace(':after', '_after')
									   .replace(':root', '').replace('html', '')
									   .replace(/ /g, '')
									   .replace(/\n/g, '')
									   .replace(/\r/g, '')
									   .replace(/\t/g, '')
									   .split(',')
			const selector = parts.map(n=>n.trim()).filter(n=>{return n.length > 0}).join(',')
			if(selector.length <= 0) return null
			return selector
		}

		constructor(...x){
			super()
			const options = set_css(this, ...x)
			if(options.length){
				if(options.includes('extend')){
					let last_option_or_extension = options[options.length - 1]
					if(typeof last_option_or_extension === 'object' && last_option_or_extension !== null) Object.assign(this, last_option_or_extension)
				}
				if(options.includes('regulate')) this.regulate()
			}
			else this.regulate(false)
		}

		regulate(remove_values = true){
			if(renamed in this === false) rename_fields(this, remove_values)
			set_variable_fields(this,remove_values)
			if(remove_values === true) attempt_check(this)
			return this
		}
		get get_variable(){ return field=>this.has(field) ? this.get(field):null }
	}

	//exports
	return Css

	//scope actions
	function attempt_check(map){
		let checks = 0
		let interval = window.setInterval(check_variables, 200)

		//scope actions
		function check_variables(){
			if(checks >= check_limit || map.removable.size === 0) {
				for(const field of map.removable.keys()) map.delete(field)
				map.removable.clear()
				delete map.removable
				return window.clearInterval(interval)
			}
			else{
				set_variable_fields(map, true)
				checks++
			}
		}
	}

	function set_variable_fields(map, remove_values){
		const has_removable = remove_values === true && 'removable' in map === true
		const current_values = remove_values !== true || has_removable === false ? map:map.removable
		if(remove_values === true && has_removable === false) map.removable = new Map()
		for(const [key, value] of current_values){
			if(is_valid_value(value) === false) map.delete(key)
			else if(is_calculated_value(value)){
				if(remove_values === false && is_variable_value('var(')) map.set(key, new CssVariable(value, map.get_variable))
				else map.delete(key)
			}
			else if(is_variable_value(value)){
				if(remove_values === false) map.set(key, new CssVariable(value, map.get_variable))
				else{
					let color_value = value.replace('var(', '').replace(')', '').replace('--', '').trim()
					if(map.has(color_value)) {
						map.set(key, map.get(color_value))
						if(map.removable && map.removable.has(key)) map.removable.delete(key)
					}
					else if('style' in map){
						color_value = map.style.color(color_value)
						if(color_value.hex !== '#ffffff'){
							map.set(key, `${color_value}`)
							if(map.removable && map.removable.has(key)) map.removable.delete(key)
						}
						else map.removable.set(key,value)
					}
					else map.removable.set(key,value)
				}
			}
		}
		for(const [key, value] of map){
			if(is_valid_value(value)) map.set(key, value.trim())
		}

		//scope actions
		function is_valid_value(value){ return is.text(value) === true }
		function is_variable_value(value){ return value.indexOf('var(') === 0 }
		function is_calculated_value(value){ return value.includes('calc(') }
	}
	function rename_fields(map, remove_values){
		for(const key of map.keys()){
			let name = null
			if(key.includes('--')){
				name = key.replace('--', '')
				map.set(name, map.get(key))
				map.delete(key)
			}
			else if(has_selector(key)){
				if(remove_values) map.delete(key)
				else{
					name = get_fixed_name(key)
					map.set(name, map.get(key))
					map.delete(key)
				}
			}
		}
		return map[renamed] = true
	}

	function has_selector(value){ return selector_characters.filter(i=>value.includes(i)).length > 0 }

	function get_css_value(value){
		const has_unit = unit_characters.filter(i=>value.includes(i)).length > 0
		if(has_unit === false) return value
		for(const unit of unit_characters){
			if(value.includes(unit)){
				const number = parseFloat(value.replace(unit, ''))
				if(isNaN(number) === false){
					return new CssUnitValue(number,unit)
				}
			}
		}
		return value
	}

	function get_fixed_name(key){
		for(const character of special_characters) key = key.replace(character, '.')
		return key.split('.').map(i=>i.trim()).filter(i=>i.length).join('.')
	}

	function set_css(css, dox, ...x){
		const list = new Set(get_stylesheets())
		for(const item of list){
			const type = item.constructor.name
			const selector = type === 'CSSKeyframesRule' ? item.name:Css.selector(item.selectorText)
			if(selector === null && 'style' in item) for(const value of Css.values(item.style)) css.set(value.name, value.value)
			else if('style' in item) css.set(selector, Css.values(item.style))
		}

		//exports
		return x

		//scope actions
		function get_stylesheets(){
			return Array.from(dox.head.querySelectorAll('style'))
						.map(style=>Array.from(style.sheet.rules || style.sheet.cssRules))
						.reduce((list, item)=>list.concat(item), [])
		}
	}
})
