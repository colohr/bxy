(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Animations', {value:await module(...inputs)}); return window.modules.has('Animations')?window.modules.get('Animations'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Animate, AnimateList){
	const symbol = Symbol('animations')
	const phrase = window.modules.phrase
	const is = window.modules.is

	class Animation extends Map{
		constructor(name, ...rules){
			super(get_animation_rules(...rules))
			this.name = name
		}
		add(...x){
			const values = Array.from(this.values()).concat(x)
			this.clear()
			for(const rule of get_animation_rules(...values)) this.set(rule[0], rule[1])
			return this
		}
	}

	class Animations extends Map{
		constructor(element){
			super()
			this.element = element
			set_window_resize_trigger(this,'update')
		}
		animation(name, ...rules){ return this.set(name,new Animation(name,...rules)).get(name) }
		get content(){ return get_css_content(this) }
		get list(){ return AnimateList.get(this) }
		get style(){ return get_style_element(this.element) }
		update(){
			this.style.innerHTML = this.content
			return this
		}
	}



	//exports
	Animations.Mixin = Base=>class extends Base{
		get animation(){ return this.animations.list.value(this) }
		set animation(value){ return this.animations.list.value(this, value) }
		get animations(){ return symbol in this ? this[symbol]:this[symbol] = new Animations(this) }
	}
	return Animations

	//shared actions
	function set_window_resize_trigger(element, trigger_field='resize', trigger_duration=300){
		window.addEventListener('resize', set_window_resize_timer, false)
		return element
		//shared actions
		function set_window_resize_timer(){ clear_window_resize_timer().resize_timer = window.setTimeout(on_resize_trigger, trigger_duration) }
		function on_resize_trigger(){ clear_window_resize_timer()[trigger_field]() }
		function clear_window_resize_timer(){
			if('resize_timer' in element) window.clearTimeout(element.resize_timer)
			delete element.resize_timer
			return element
		}
	}

	function get_animation_rules(...rules){
		const x = 100 / (rules.length-1)
		return rules.map((rule, index)=>{
			if(is.array(rule)) return rule
			return [`${x*index}%`, rule]
		})
	}

	function get_css_content(animations){
		const content = []
		for(const animation of animations) content.push(get_css_keyframes(...animation))
		return content.join('\n')
	}

	function get_css_field_value(rules){
		const css = []
		for(const name in rules){
			const field = name.indexOf('--') === 0 ? name:phrase(name).dash
			css.push(`${field}: ${rules[name]};`)
		}
		return css.join('')
	}

	function get_css_keyframe(time, rules){
		return `${time}{${get_css_field_value(rules)}}`
	}

	function get_css_keyframes(name, animation){
		const keyframes = []
		for(const keyframe of animation){
			keyframes.push(get_css_keyframe(...keyframe))
		}
		return `@keyframes ${name}{ ${keyframes.join(' ')} }`
	}

	function get_style_element(element, type='animation'){
		const container = get_container()
		if(container === document.head) type = `${element.tagName}${element.id ? `-${element.id}`:''}-animation`
		const style = query(`style#${type}`)
		return style ? style:create()
		//shared actions
		function create(){
			const style_element = document.createElement('style')
			style_element.setAttribute('id', type)

			const last = query('style:last-of-type')
			const next = last ? last.nextElementSibling:container.firstElementChild
			return next ? container.insertBefore(style_element,next):container.appendChild(style_element)
		}
		function get_container(){
			return element.shadowRoot ? element.shadowRoot:document.head
		}
		function query(selector){
			return container.querySelector(selector)
		}

	}

}, async function Animate(){
	const phrase = window.modules.phrase
	const is = window.modules.is
	const name = Symbol('animate name')
	const cubic_bezier = (...x)=>`cubic-bezier(${x.join(',')})`
	const steps = (...x)=>`steps(${x.join(',')})`
	const frames = x=>`frames(${x})`

	const AnimationValues = {
		direction:['normal','reverse','alternate','alternate-reverse'],
		fill:['none','forwards','backwards','both'],
		iteration:['infinite'],
		state:['running','paused'],
		timing:['ease','ease-in','ease-out','ease-in-out','linear','step-start','step-end', cubic_bezier, steps, frames]
	}

	class Animate{
		static get bezier(){ return cubic_bezier }
		static get frames(){ return frames }
		static get steps(){ return steps }
		static get values(){ return AnimationValues }
		constructor(setting){ this.setting = Object.assign(this,get_setting(setting)) }
		assign(element){ return assign_style(this,element) }
		get data(){ return get_data(this) }
		delete(field){ return (delete this.setting[get_setting_field(field)], this) }
		get(field){ return this.has(field) ? this.setting[get_setting_field(field)]:null }
		has(field){ return get_setting_field(field) in this.setting }
		get name(){ return name in this ? this[name]:this.setting.name }
		set name(value){ return this[name]=value }
		set(field, value){ return (this.setting[get_setting_field(field)] = value, this) }
		toString(){ return get_text(this) }
	}

	//exports
	return window.modules.set('Animations.constructor.Animate',Animate)

	//shared actions
	function assign_style(animate,element){ return (Object.assign(element.style,animate.data), animate) }

	function get_data(animate){
		const data = {}
		for(const field in animate.setting) data[phrase(`animation-${field}`).dash] = get_value(animate, animate.setting[field])
		return data
	}

	function get_setting(setting){
		const data = {}
		if(is.data(setting)){
			for(const field in setting){
				const value = setting[field]
				data[get_setting_field(field)] = value
			}
		}
		return data
	}

	function get_setting_field(field){
		field = field.replace('animation','')
		switch(field){
			case 'fill':
				field = 'field-mode'
				break
			case 'iteration':
			case 'count':
				field = 'iteration-count'
				break
			case 'state':
				field = 'play-state'
				break
			case 'timing':
				field = 'timing-function'
				break
		}
		return phrase(field).underscore
	}

	function get_text(animate){
		const inline = []
		for(const field in animate) inline.push(get_value(field, animate[field]))
		return inline.join(' ')
	}

	function get_value(field, x){
		if(field !== 'duration' || field !== 'delay') return x
		return typeof x === 'number' ? `${x}ms`:x
	}
}, async function AnimateList(){
	await window.modules.wait('modules.Animations.constructor.Animate')
	const symbol = Symbol('Animate List')
	class AnimateList extends Map{
		static get get(){ return get_list }
		add(name, animate){
			const Animate = window.modules.get('Animations.constructor.Animate')
			animate = new Animate(animate instanceof Animate ? animate.setting:animate)
			animate.name = name
			return this.set(name, animate).get(name)
		}
		value(element, value){ return get_set_value(this,element,value) }
	}
	//exports
	return window.modules.set('Animations.constructor.Animate.List', AnimateList)
	//shared actions
	function get_list(component){ return symbol in component ? component[symbol]:component[symbol] = new AnimateList() }

	function get_set_value(list, element, value){
		const name = value && list.has(value) ? value:(value instanceof Animate ? value.name:null)
		value = name && list.has(name) ? list.get(name):(value instanceof Animate ? value:null)
		if(value) value.assign(element)
		if(name) element[symbol] = name
		return symbol in element ? element[symbol]:null
	}
})