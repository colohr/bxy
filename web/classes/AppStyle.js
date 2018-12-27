(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('AppStyle', {value:await module(...inputs)}); return window.modules.has('AppStyle')?window.modules.get('AppStyle'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Color, ColorSpace, Gradient, Luminance){
	const Random = await window.modules.import.function('random')
	const is = window.modules.is

	class AppStyle{
		static get style(){ return get_style }
		static get load(){ return load_app_style }
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
		get style(){ return get_style }
	}

	//exports
	return AppStyle

	//scope actions
	function get_style(element){ return window.getComputedStyle(element) }

	function get_random_color(options){
		const skip = is.data(options) && 'skip' in options ? options.skip:null
		let keys = Array.from(this.keys())
		if(Array.isArray(skip)) keys = keys.filter(key=>skip.filter(keyword=>key.includes(keyword)).length <= 0)
		return this.get(Random.item(keys))
	}

	async function load_app_style(...stylesheet){
		return (await load_color_names(), new AppStyle(await load_css_document(...stylesheet)))
	}

	async function load_css_document(...stylesheets){
		const Document = await window.modules.import.class('Document')
		const CSS = await window.modules.import.class('Document.CSS')
		const base = new CSS(await Document(new URL('https://unpkg.com/wwi@0.0.733/modules/wwi/component/design/css/colors.css')),'wait')
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

	async function load_color_names(){
		if(window.modules.has('AppStyle.constructor.color_names')) return window.modules.get('AppStyle.constructor.color_names')
		return window.modules.set('AppStyle.constructor.color_names',await window.modules.import.json('colors'))
	}


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
		const color_names = window.modules.get('AppStyle.constructor.color_names')
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
