(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Design', {value:await module(...inputs)}); return window.modules.has('Design')?window.modules.get('Design'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Styles, Color, ColorSpace, Gradient, Luminance){
	const Random = await window.modules.import.function('random')
	const is = window.modules.is
	//exports
	return preload(class Design{
		static get Styles(){ return Styles }
		static load(){ return load.apply(this,arguments) }
		constructor(colors){
			this.colors = colors
			this.colors.style = this
			this.colors.random = get_random_color.bind(colors)
			this.colors.transparent = get_transparent_color.bind(this)
			this.luminance = new Luminance(this)
			//scope actions
			function get_transparent_color(color, transparency){
				if(color instanceof Color) return color.transparent(transparency)
				return this.color(color).transparent(transparency)
			}
		}
		color(color){ return new Color(color, this.colors) }
		for(element){ return HTMLElement.get_css ? HTMLElement.get_css(element):null }
	})

	//scope actions
	function get_random_color(options){
		const skip = is.data(options) && 'skip' in options ? options.skip:null
		let keys = Array.from(this.keys())
		if(Array.isArray(skip)) keys = keys.filter(key=>skip.filter(keyword=>key.includes(keyword)).length <= 0)
		return this.get(Random.item(keys))
	}

	async function load(...stylesheet){ return (await load_color_names.call(this), new (this)(await load_css(...stylesheet))) }

	async function load_css(...stylesheets){
		window.modules.import.assets(URL.join('design/colors.css', window.modules.constructor.url))
		const Document = await window.modules.import.class('Document')
		const CSS = await window.modules.import.class('Document.CSS')
		const base = new CSS(await Document(URL.join('design/colors.css', window.modules.constructor.url)),'wait')
		const sheets = await load_css_documents()
		for(const sheet of sheets) for(const [x,y] of sheet) base.set(x,y)

		//exports
		return base.regulate(true)

		//scope actions
		async function load_css_document(content){
			if(content instanceof Map) return content
			else if(Array.isArray(content) === false) content = [content]
			return new CSS(await Document(...content),'wait')
		}

		function load_css_documents(){ return Promise.all(stylesheets.map(load_css_document)) }
	}

	async function load_color_names(){return 'color_names' in this?this.color_names:this.color_names=await window.modules.import.json('colors')}

	function preload(Design){
		get_entries(window.modules.project.at('design.colors'), 'colors')
		get_entries(window.modules.project.at('design.styles'), 'styles')
		return Design
		//scope actions
		function get_entries(entries,type){
			if(window.modules.is.object(entries) === false) entries = []
			if(window.modules.is.array(entries) === false) entries = Object.entries(entries)
			return (entries=entries.map(entry),type==='colors'?Design.load(...entries.filter(window.modules.is.data)).then(on_load):Design.Styles.register(entries))
			//scope actions
			function entry(entry){
				if(window.modules.is.array(entry) === false){
					if(entry instanceof URL === false){
						if(URL.is(entry)) entry = new URL(entry)
						else return type === 'styles' ? [entry, URL.join(entry)]:URL.join(entry)
					}
					return entry
				}
				if(window.modules.is.array(entry[1])) entry[1] = window.modules.url(...entry[1])
				if(entry[1] instanceof URL === false) entry[1] = type === 'colors' ? window.modules.url(...entry.filter(window.modules.is.text)):window.modules.url(entry[1])
				return type === 'styles' ? entry:entry[1]
			}
		}
		function on_load(design){ window.modules.set(window.modules.project.at('design.field') || 'design', design) }
	}

}, async function DesignStyles(){
	const {is} = window.modules
	return class DesignStyles extends Array{
		static register(location_entries){ return location_entries.reduce((styles,entry)=>styles.set(...entry), this) }
		static set(field, url){
			if('get_css' in HTMLElement === false) Object.defineProperty(HTMLElement, 'get_css', {value: get_element_css})
			if('location' in HTMLElement === false) Object.defineProperty(HTMLElement,'location', {value: get_element_location})
			if('css' in HTMLElement === false) Object.defineProperty(HTMLElement, 'css', {get(){ return this.get_css() }})
			if(field in this === false) Object.defineProperty(this, field, {get: eval(`(folder=>(function get(){ return new (this)({folder}) }))`)(url) })
			if(field in this.prototype === false) Object.defineProperty(this.prototype, field, {value: eval(`(function(...locations){ return this.add(this.constructor['${field}'].add(locations)) })`)})
			return this
		}
		constructor(){ (super(), this.location = arguments[0]) }
		add(locations){
			if(locations.length){
				locations = locations.map(ensure_resource_name)
				for(const location of locations){
					if(location instanceof URL) this.push(location)
					else this.push(new URL(location, this.location.folder))
				}
			}
			return this
		}
		document(...locations){ return stylesheet_document(this.add(locations)) }
		element(...locations){ return stylesheet_element(this.add(locations)) }
		import(...locations){ return design_assets(this.add(locations)) }
		url(...locations){ return this.add(locations) }
		toString(){ return this.map(design_import).join('\n') }
	}

	//scope actions
	function design_assets(design_stylesheets){ return window.modules.import.assets(design_stylesheets) }
	function design_import(stylesheet){ return `@import url("${stylesheet}");` }
	function ensure_resource_name(name){ return is.text(name) && name.includes('.css') === false ? `${name}.css`:name }
	function get_element_css(element){ return new (window.modules.Design.Styles)(is.element(element) ? this.location(element):this.location()) }
	function get_element_location(element = null){ return get_element_source(element ? element.localName:window.modules.id.dash(this.name)) }
	function get_element_source(tag_name, source = null){
		const expression = new RegExp(`${tag_name}.js`)
		for(let index = 0; index < window.document.scripts.length; index++){
			if(source = window.document.scripts.item(index).src){
				if(expression.test(source)) return get_source_information(source)
			}
		}
		return get_source_information(URL.join(tag_name).href)
		//scope actions
		function get_source_information(source, url = null){ return {url: url = new URL(source),folder: new URL(source.replace(url.file, '')),get design(){ return new URL('design', this.folder) }} }
	}
	async function stylesheet_content(design_stylesheets){
		return (await Promise.all(design_stylesheets.map(map_stylesheet))).join('\n')
		//scope actions
		async function map_stylesheet(stylesheet){ return (await window.modules.http.get(stylesheet)).content }
	}
	async function stylesheet_document(design_stylesheets){ return new window.modules.Document.CSS(await window.modules.Document(design_stylesheets[0], await stylesheet_content(design_stylesheets))) }
	async function stylesheet_element(design_stylesheets){ return window.modules.element.create('style', {html: await stylesheet_content(design_stylesheets)}) }

},async function Color(){
	const is = window.modules.is
	const alpha_opacity_transparency = Symbol('color alpha, opacity or transparency')
	const shorthand_hex_reg = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
	const hex_to_rgb_reg = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

	class Color{
		constructor(value, colors){
			if(is.map(colors) && colors.has(value)) value = colors.get(value)
			this.identity = value
			this[alpha_opacity_transparency] = this.alpha
		}
		get alpha(){ return this.rgb[3] || 1 }
		get blue(){ return this.rgb[2] }
		get green(){ return this.rgb[1] }
		get hex(){ return get_rgb_to_hex(this.red, this.green, this.blue) }
		opacity(x){ return this.value(is.number(x) ? x:1) }
		get red(){ return this.rgb[0] }
		get rgb(){ return get_color(this.identity) }
		get transparency(){ return this[alpha_opacity_transparency] }
		set transparency(value){ return !is.number(value) ? this[alpha_opacity_transparency]:this[alpha_opacity_transparency] = value }
		transparent(x){ return this.value(is.number(x) ? x:1) }
		value(transparency){ return `rgba(${this.red},${this.green},${this.blue},${is.nothing(transparency) ? this.transparency:transparency})` }
		toString(){ return this.value() }
	}

	//exports
	return window.modules.set('Color', Color)

	//scope actions
	function get_color(value){
		const color_names = window.modules.get('Design.color_names')
		if(is.array(value)) return value
		if(is.text(value)){
			value = value.trim()
			if(value.length > 0){
				if(value in color_names) value = color_names[value]
				if(value.includes(',')){
					value = value.replace('rgba', '').replace('rgb', '').replace('(', '').replace(')', '').trim()
					return value.split(',').map(x=>parseFloat(x))
				}
				if(value.charAt(0) !== '#') value = `#${value}`
				value = get_hex_to_rgb(value)
				if(value !== null) return [value.r, value.g, value.b]
			}
		}
		return [255, 255, 255]
	}

	function get_component_to_hex(color){
		const hex = color.toString(16)
		return hex.length === 1 ? `0${hex}`:hex
	}

	function get_hex_to_rgb(hex){
		hex = hex.replace(shorthand_hex_reg, (m, r, g, b)=>r + r + g + g + b + b)
		const result = hex_to_rgb_reg.exec(hex)
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null
	}

	function get_rgb_to_hex(r,g,b){ return `#${get_component_to_hex(r)}${get_component_to_hex(g)}${get_component_to_hex(b)}` }

}, async function ColorSpace(){
	await window.modules.wait('modules.Color')
	const bit = { space: eight_bit=>eight_bit / 255 }

	const contrast = {
		accepted: 4.5,
		maximum: luminance=>Math.max(luminance[0], luminance[1]) + 0.05,
		minimum: luminance=>Math.min(luminance[0], luminance[1]) + 0.05,
		preferred: 7
	}

	const pixel = {
		get contrast(){ return contrast },
		contrast_ratio: luminance=>contrast.maximum(luminance) / contrast.minimum(luminance),
		luminance: bit=>bit <= 0.03928 ? bit / 12.92:Math.pow((bit + 0.055) / 1.055, 2.4)
	}

	const space = {
		bit,
		colors: rgb=>rgb.map(bit.space).map(pixel.luminance),
		get contrast(){ return space_contrast },
		luminance: ([red, green, blue])=>0.2126 * red + 0.7152 * green + 0.0722 * blue,
		pixel,
		relative_luminance
	}

	//exports
	return window.modules.set('Color.Space', space)

	//shared actions
	function space_contrast(...rgb){
		const relative = relative_luminance(...rgb)
		return (red, green, blue)=>{
			const luminance = relative_luminance(red, green, blue)
			const ratio = pixel.contrast_ratio([relative, luminance])
			return {
				ratio,
				relative,
				luminance,
				type: get_contrast_type(ratio),
				get valid(){ return this.type !== 'failed' }
			}
		}
	}

	function get_contrast_type(value){
		if(value < contrast.accepted) return 'failed'
		else if(value >= contrast.accepted && value < contrast.preferred) return 'accepted'
		return 'passed'
	}

	function relative_luminance(...rgb){ return space.luminance(space.colors(rgb)) }

}, async function Gradient(){
	await window.modules.wait('modules.Color')
	const is = window.modules.is
	const Color = window.modules.Color

	const tags = {
		color: ({red, green, blue, transparency, position}) => `rgba(${red},${green},${blue},${transparency}) ${position}`,
		radial: ({axis, origin, colors}) => `radial-gradient(${axis} ${origin},${colors})`,
		linear: ({axis, colors, origin, rotation}) => `linear-gradient(${axis} ${origin} ${rotation}, ${colors})`
	}

	class GradientColor extends Color{
		constructor(color, position){
			super(color)
			this.position = position
		}
	}

	class Gradient{
		constructor(...items){
			this.angle = null
			this.axis = 'to'
			this.items = items.map(item=>new GradientColor(item.color, item.position))
			this.origin = 'right'
			this.type = 'linear'
			this.side = 'right'
		}
		get colors(){ return this.items.map(color=>tags.color(color)) }
		get rule(){ return tags[this.type](this) }
		get rotation(){ return is.number(this.angle) ? `${this.angle}deg`:'' }
		toString(){ return this.rule }
	}

	class LinearGradient extends Gradient{ constructor(...colors){ super('linear', ...colors) } }

	class RadialGradient extends Gradient{
		constructor(...colors){
			super(...colors)
			this.type = 'radial'
			this.origin = 'ellipsis at center'
		}
	}

	//exports
	Gradient.Linear = LinearGradient
	Gradient.Radial = RadialGradient
	return window.modules.set('Color.Gradient', Gradient)

}, async function Luminance(){
	await window.modules.wait('modules.Color.Space')
	const is = window.modules.is
	const phrase = window.modules.phrase
	const ColorSpace = window.modules.Color.Space
	const white_space = ColorSpace.contrast(255, 255, 255)

	class Luminance{
		constructor(container){ this.container = container }
		element(element){
			return new Proxy(element,{get})
			//shared actions
			function get(element, name){ return get_luminance_type(this, get_luminance_color(this, element, name)) }
		}
		test(base, ...x){
			const test = new Map()
			test.base = this.container.color(base)
			test.space = ColorSpace.contrast(...test.base.rgb)
			test.colors = x.map(i=>this.container.color(i))
			for(const color of test.colors){
				color.contrast = test.space(...color.rgb)
				test.set(`${color}`, color.contrast)
			}
			return test
		}

	}

	//exports
	return Luminance

	//shared actions
	function get_luminance_color(component, element, name = 'color'){
		name = is.text(name) ? phrase(name).medial:'color'
		return component.style(element)[name] || 'black'
	}

	function get_luminance_type(component, value){
		const design_color = component.color(value)
		const contrast = white_space(...design_color.rgb)
		return {
			color: design_color,
			contrast,
			get is(){
				const dark = contrast.valid
				return {
					contrast,
					dark: dark,
					light: !dark
				}
			},
			get luminance(){ return ColorSpace.relative_luminance(...design_color.rgb) },
			value
		}
	}

	function is_dark(value){
		let color = get_color(value)
		let points = color.red + color.green + color.blue
		let mid = ((255 * 3) / 2) - 50
		console.log({points, mid})
		if(points < mid) return true
		return false
	}

	function is_light(value){
		let color = get_color(value)
		let points = color.red + color.green + color.blue
		let mid = ((255 * 3) / 2) + 50
		console.log({points, mid})
		if(points > mid) return true
		return false
	}

	function is_mid(value){
		let color = get_color(value)
		let points = color.red + color.green + color.blue
		let mid = ((255 * 3) / 2)
		console.log({points, mid})
		if(points < mid + 50 && points > mid - 50) return true
		return false
	}
})
