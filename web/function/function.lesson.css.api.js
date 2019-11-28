(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('gui.function.variable', {value:await module(...inputs)}); return window.modules.has('gui.function.variable')?window.modules.get('gui.function.variable'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(CSSStructure,CSSDocument){
	const {id,is} = window.modules
	const Color = window.modules.Color
	const design = window.modules.design
	const Unit = await window.modules.gui.function('unit')
	const container_style = { left: '0', overflow: 'auto', minHeight:'100vh', minWidth: '100vw', top: '0'}

	class CSSCalculator{
		constructor(element=window.document){
			this.container = window.modules.element.create('div', {
				attributes:{ style:'pointer-events:none !important;position:absolute !important;min-height:100vh;min-width:100vw;visibility:hidden !important; z-index:-1 !important;' },
				css: container_style
			})
			this.container.attachShadow({mode: 'open'}).innerHTML = `<div id="css-variable"></div>`
			this.fragment = element.shadowRoot||window.document
			window.modules.element.content(element===window.document?element.body:element).appendChild(this.container)
		}
		assign(css){ return Object.assign(this.element.style, css) }
		get content(){ return this.container.shadowRoot }
		get element(){ return this.content.getElementById('css-variable') }
		data(element=null,clear=true){ return  css_data(element||this.element, this, clear) }
		get(notation){ return window.modules.dot.get(this.style, notation) }
		reset(){ return (this.element.removeAttribute('style'), this) }
		import(){ return css_import.apply(this, arguments) }
		set(field,value){ return (this.element.style[field]=value,this) }
		get style(){ return window.getComputedStyle(this.element) }
		get structure(){ return 'global' in CSSStructure ? CSSStructure.global:CSSStructure.global= CSSStructure(this.fragment) }
		value(){ return css_calculator_value.apply(this, arguments) }
		variable(){ return CSSStructure.value.apply(this, arguments) }
	}

	//exports
	const css = new CSSCalculator()
	css.create = css_create
	css.create.structure = CSSStructure
	css.Document = CSSDocument
	css.Structure = CSSStructure
	return css

	//scope actions
	function css_calculator_value(field){
		let value = this.get(id.medial(field))
		field = id.dash(field)
		if(value) value = CSSStructure.valuable(CSSStructure.value(field, value))
		if(is.nothing(value) && 'css' in this && this.css.exists(field)) value = this.css.value(field)
		if(is.nothing(value) && this.structure.exists(field)) value = this.structure.value(field)
		return value
	}

	function css_create(element){ return element.css = new CSSCalculator(element) }

	function css_data(element,calculator, clear=true){
		const data = new Map()
		data.computed = get_computed()
		data.boundary = get_boundary()
		data.style = {}
		for(const field of element.style) data.style[field] = element.style.getPropertyValue(field)
		if(clear === true) calculator.reset()
		//exports
		return new Proxy(data,{
			get(target,field){ return get_property(target,field) },
			has(target,field){ return Reflect.has(target,field) || field in target.computed }
		})

		//scope actions
		function get_boundary(){
			return {
				area: element.getBoundingClientRect(),
				client: {height: element.clientHeight, width: element.clientWidth, x: element.clientLeft, y: element.clientTop},
				offset: {height: element.offsetHeight, width: element.offsetWidth, x: element.offsetLeft, y: element.offsetTop},
				scroll: {height: element.scrollHeight, width: element.scrollWidth, x: element.scrollLeft, y: element.scrollTop},
			}
		}

		function get_computed(){ return Object.assign({}, window.getComputedStyle(element)) }

		function get_property(target,field){
			field = id.dash(field)
			if(target.has(field)) return target.get(field)
			let value = calculator.value(field)
			if(target.has(field) === false) target.set(field,value)
			if(is.nothing(value) && Reflect.has(target, field)) return target[field]
			return is.nothing(value)?value=null:value
		}
	}

	async function css_import(...imports){
		this.imported = this.imported || new Set()
		for(const url of imports){
			let html = null
			let attribute = null
			if(url instanceof URL) {
				this.imported.add(url.href)
				html = `@import url("${url.href}");`
				attribute = url.href
			}
			else if(is.object(url)){
				attribute = url.id || null
				html = url.html
			}

			if(html){
				if(this.content.querySelector(`style[url="${attribute}"]`) === null){
					this.content.insertBefore(window.modules.element.create('style', {url: attribute, html}), this.element)
				}
			}
		}
		imports = imports.filter(window.modules.is.not.url).map(item=>item.html)

		for(const style of this.content.styleSheets){
			for(const rule of (style.rules || style.cssRules)){
				if(rule.constructor.name === 'CSSImportRule') await window.modules.wait(rule, 'styleSheet')
			}
		}
		this.css =  await CSSDocument.load(CSSStructure(this.content,this.css),...imports.concat(Array.from(this.imported).map(url=>new URL(url))))
		return this
	}

}, async function CSSStructure(){
	const variable_fragment = ['var(', ')']
	const {id,is} = window.modules
	const design = window.modules.design
	const Unit = await window.modules.gui.function('unit')
	const Color = window.modules.Color

	class CSSComputedValue extends String{}
	class CSSStructureReference extends String{
		get definition(){ return `var(${this})` }
		get property(){ return id.dash(this) }
		value(structure){ return structure instanceof CSSStructure ? structure.value(this.property):null }
	}
	class CSSStructure extends Map{
		css_value(field, value){ return css_value(field,value) }
		define(value,selector,name, include_selectors=false){
			const field = this.identifier(value) || name
			if(field.startsWith('--')) this.set(this.field(field),value)
			if(include_selectors === true){
				if('definitions' in this === false) this.definitions = new Map()
				if(this.definitions.has(selector) === false) this.definitions.set(selector, new Map())
				this.definitions.get(selector).set(field, value)
			}
			return this
		}
		exists(field){ return this.has(this.field(field)) }
		field(field){ return field.startsWith('--') ? id.dash(field):field }
		identifier(item){
			if(is.object(item) === false) return item
			if(is_rule_font(item)) return [item.style.fontFamily,item.style.fontStyle,item.style.fontWeight].filter(is.text).join('-')
			if(item.field) return item.field
			else if(item.variable) return item.variable
			if(item.selectorText) return item.selectorText
			if(item.href) return item.href
			return item.localName
		}
		value(field){ return this.has(field = this.field(field)) ? this.get(field):null }
	}

	//exports
	const css_structure_function = css_structure
	css_structure_function.value = css_value
	css_structure_function.valuable = css_valuable
	return css_structure_function

	//scope actions
	function clean_characters(text){
		return is.text(text) ? text.replace(/\(\s/g, '(')
								   .replace(/\s\)/g, ')')
								   .replace(/\,\s/g, ',')
								   .replace(/\s\,/g, ',')
								   .trim():''
	}

	function css_computed_value(origin){
		let value =null
		origin = is.text(origin) ? clean_characters(origin):origin
		if(is_css_reference(origin))  {
			const variable = css_variable(origin)
			if(is_css_reference(variable)) {
				value = new CSSStructureReference(variable)
				value.origin = origin
				return value
			}
			else origin = variable
		}
		if(origin.startsWith('#') || origin.startsWith('rgb') || design.colors.has(origin) || origin in Color.names) {
			value = design.color(origin)
		}
		else{
			value = origin.startsWith('calc(') ? Unit.calculate(value):Unit(origin)
			if(is.number(value) === false)  value = new CSSComputedValue(origin)
		}
		return value
	}

	function css_structure(value=window.document, structure=new CSSStructure(), include_selectors=false){
		if(structure instanceof CSSStructure === false) structure = new CSSStructure()
		if(has_style_sheets(value)) value = get_style_sheets(value)
		if(is_style_sheets(value)) return read_stylesheets.call(structure, value)
		if(is_style_sheet(value)) return read_stylesheet.call(structure, [value])
		if(is_rule_style(value)) return read_rules.call(structure, [value])
		if(is.element(value)) value = get_declaration(value)
		if(is_style_declaration(value)) return read_declaration.call(structure, value)
		if(is_style_map(value)) return read_map.call(structure, value)
		return structure

		//scope actions
		function read_declaration(rule){
			const identifier = this.identifier(rule)
			const declaration = has_declaration(rule) ? get_declaration(rule):null
			if(declaration){
				for(const field of declaration){
					const entry = [field, declaration[field]]
					const value = read_value.call(this, entry)
					if(value) this.define(value, identifier, field, include_selectors)
				}
			}
			return this
		}

		function read_rule(rule){
			if(is_rule(rule)){
				if(is_rule_import(rule)) return read_stylesheet.call(this,rule.styleSheet)
				const identifier = this.identifier(rule)
				const map = has_map(rule) ? new Map(Array.from(get_map(rule))):null
				if(map){
					for(const [field, entry] of map){
						if(is.array(entry)){
							for(const item of entry){
								const value = read_value.call(this, [field, item])
								if(value)  this.define(value,identifier,field,include_selectors)
							}
						}
						else console.log({entry})
					}
				}
				return read_declaration.call(this,rule)
			}
			else console.log({rule,skipped:true})
			return this
		}

		function read_rules(item){
			const rules = is_style_rules(item)
			if(rules === false && is.object(item)) item = Array.from(item)
			if(is.object(item) && item.length){
				const count = item.length
				for(let index = 0; index < count; index++){
					read_rule.call(this, rules ? item.item(index):item[index])
				}
			}
			return this
		}

		function read_stylesheet(value){ return is_style_sheet(value) ? read_rules.call(this, get_rules(value)):this }

		function read_stylesheets(value){
			for(const stylesheet of value) read_stylesheet.call(this, stylesheet)
			return this
		}

		function read_value(entry){
			const field = entry[0]
			let item = entry[1]
			let value = null
			if(is.text(item)) value = item.trim()
			if(is.object(item)){
				if(is_value_variable(item)){
					value = read_value.call(this,[field, item.fallback])
					if(value) value.variable = item.variable
				}
				else if(is_value_unparsed(item)){
					for(const variable of item){
						value = read_value.call(this, [field, variable])
						if(value) break
					}
				}
			}
			value = css_valuable(is.text(value)?css_value(field, value):value)
			if(is.object(value) && 'field' in value === false) value.field = field
			return value
		}
	}

	function css_valuable(value){
		if(is.nothing(value)) return value = null
		if(is.text(value) && (value = value.trim()).length === 0) value = null
		else if(is.text(value) && value.startsWith('--')) value = null
		else if(value instanceof Unit.List && value.length == 0) value = null
		return value
	}

	function css_value(field, value){
		value = css_computed_value(value)
		if(is.text(value) && value.includes(' ')) value = new Unit.List(...value.split(' ').map(css_computed_value))
		value.field = field
		return value
	}

	function css_variable(value){
		if(value.startsWith('calc(')) return value
		else if(value.startsWith(variable_fragment[0])){
			value = get_nested_value(value)
			if(value.includes(',')) value = value.split(',')[0]
		}
		return `--${id.dash(value)}`
		//scope actions
		function get_nested_value(text, at='start'){
			const action = at === 'start' ? 'indexOf':'lastIndexOf'
			if(text.indexOf(variable_fragment[0]) === -1) return null
			return text.substring(text[action](variable_fragment[0]) + variable_fragment[0].length, text.lastIndexOf(variable_fragment[1]))
		}
	}

	function get_declaration(item){ return has_declaration(item) ? item.style:null }
	function get_map(item){ return has_map(item) ? item.styleMap:null }
	function get_rules(item){  return has_rules(item) ? item.rules || item.cssRules:null }
	function get_style_sheets(item){ return has_style_sheets(item) ? item.styleSheets:null }

	function has_declaration(item){ return is.object(item) && 'style' in item }
	function has_map(item){ return is.object(item) && 'styleMap' in item }
	function has_rules(item){ return is.object(item) && ('rules' in item || 'cssRules' in item) }
	function has_style_sheets(item){ return is.object(item) && 'styleSheets' in item }

	function is_css_reference(value){ return is.text(value) && ['var(','--'].filter(item=>value.startsWith(item)).length > 0  }

	function is_rule(item){ return item instanceof CSSRule }
	function is_rule_font(item){ return item instanceof CSSFontFaceRule }
	function is_rule_keyframe(item){ return item instanceof CSSKeyframeRule }
	function is_rule_keyframes(item){ return item instanceof CSSKeyframesRule }
	function is_rule_image(item){ return item instanceof CSSImageValue }
	function is_rule_import(item){ return item instanceof CSSImportRule }
	function is_rule_style(item){ return item instanceof CSSStyleRule }

	function is_style_declaration(item){ return item instanceof CSSStyleDeclaration }
	function is_style_map(item){ return item instanceof StylePropertyMap }
	function is_style_rules(item){ return item instanceof CSSRuleList }
	function is_style_sheet(item){ return item instanceof CSSStyleSheet }
	function is_style_sheets(item){ return item instanceof StyleSheetList }

	function is_value(item){ return item instanceof CSSStyleValue }
	function is_value_unit(item){ return item instanceof CSSUnitValue }
	function is_value_unparsed(item){ return item instanceof CSSUnparsedValue }
	function is_value_variable(item){ return item instanceof CSSVariableReferenceValue }
}, async function CSSDocument(){
	const {id,is} = window.modules
	const css_document_function = create_from_shadow_root
	css_document_function.create = create
	css_document_function.load = create_from_url
	return css_document_function

	//scope actions
	function create(structure, content){ return define(structure, new window.modules.Document.CSS(content)) }

	function create_from_shadow_root(structure, content){
		return create(structure, {head:content})
	}
	async function create_from_url(structure, ...urls){
		const content = urls.filter(is.text).concat(await load(...urls.filter(is.not.text))).join('\n')
		return create(structure, await window.modules.Document(content))
	}

	function define(structure, css){
		for(let entry of css){
			const field = id.dash(entry[0])
			if(css.has(field) === false) css.set(field, entry[1])
			if(entry[0] !== field) css.delete(entry[0])
		}
		for(let entry of css){
			const value = entry[1]
			entry = get_value(entry)
			if(value !== entry[1]) css.set(entry[0], entry[1])
		}
		for(const entry of css){
			if(is.text(entry[1])){
				if(is.text.decimal(entry[1])) css.set(entry[0], parseFloat(entry[1]))
				else if(is.numeric(entry[1])) css.set(entry[0], parseFloat(entry[1]))
			}
			else if(is.data(entry[1])){
				if(is.number(entry[1].origin)){
					const number = new Number(entry[1].origin)
					number.unit = entry[1].type || ''
					number.value = entry[1].origin
					number.toString = function(){ return `${this.value}${this.unit}` }
					css.set(entry[0], number)
				}
			}
		}

		for(const entry of css){
			if(structure.has(entry[0]) === false){
				if(is.text(entry[1])===false){
					if(entry[1].field && structure.has(entry[1].field)){
						structure.set(entry[0], structure.get(entry[1].field))
					}
				}
				else structure.define(structure.css_value(...entry))
			}
		}
		return structure
		//scope actions
		function get_value(entry){
			if(is.text(entry[1])){
				if(entry[1].includes('var(')){
					entry[1] = entry[1].replace(/var\(/g, '').replace(/\)/g, '').split(',').map(item=>item.trim())
					for(let item of entry[1]){
						item = id.dash(item)
						if(css.has(item)) entry[1] = css.get(item)
					}
				}
			}
			return entry
		}
	}



	async function load(...imported){
		return await Promise.all(imported.map(async url=>await window.modules.http(url).then(({content})=>content)))
	}
})
