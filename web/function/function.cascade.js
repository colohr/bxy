(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('cascade', {value:await module(...inputs)}); return window.modules.has('cascade')?window.modules.get('cascade'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Measure, Assignment, Container){
	const uid = await window.modules.import.function('uid')

	function Cascade(element){
		if(this instanceof Cascade === false) return new Cascade(...arguments)
		this.element = element || window.document.body
		this.definition = cascade_definition.call(this, this.element)
	}
	Cascade.prototype = {

		toJSON(){ return cascade_json(this) },
		toString(){ return cascade_text(this) }
	}

	//exports
	return Cascade


	//scope actions
	function cascade_definition(element){
		const assignment = {
			':host': Assignment(element),
			':host::after': Assignment(element, ':after'),
			':host::before': Assignment(element, ':before')
		}
		element.xml.uid = uid()
		return Container(element, assignment, cascade_content.call(this, element))
	}
	function cascade_json(){

	}

	//scope actions
	function cascade_content(element){ return Array.from(element.children).map(cascade_definition, this) }


	function cascade_text(cascade){
		if(cascade.children) for(const item of cascade.children){
			if(item.style){
				Object.assign(item.element.style, item.style)
				cascade_text(item)
			}
		}
		return cascade.element.outerHTML
	}


}, async function css_measure(){
	const expression = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/


	class CascadeMeasure extends Number{
		constructor(origin){
			const pair = measure_pair(origin) || []
			super(pair[0])
			this.origin = origin
			this.pair = pair
		}
		get unit(){ return this.pair[1] || '' }
		toString(){ return this.origin }
	}

	//exports
	return window.modules.set('Cascade.Measure',CascadeMeasure)

	//scope actions
	function measure_pair(value){
		return window.modules.is.not.nothing(value) ? String(value).match(expression):null
	}
}, async function CascadeAssignment(){
	const fieldset = {
		letting:['margin','padding'],
		viewport: ['height', 'width','font-size','origin']
	}

	function CascadeAssignment(element){
		if(this instanceof CascadeAssignment === false) return new CascadeAssignment(...arguments)
		assignment_context.apply(this,arguments)
	}


	//exports
	return CascadeAssignment

	//scope actions
	function assignment_context(){
		const Measure = window.modules.get('Cascade.Measure')
		for(const entry of assignment_data.apply(this, arguments)){
			let measure = new Measure(entry[1])
			if(measure.unit) entry[1] = measure
			const type = assignment_type(entry[0])
			window.modules.dot.set(this,`${type}.${entry[0]}`, entry[1])
		}
	}

	function assignment_data(element, pseudo, data={}){
		const styles = window.getComputedStyle(element, pseudo)
		const total = styles.length
		if(total){
			const defaults = assignment_defaults(...arguments)
			for(let index=0; index<total; index++){
				const field = styles.item(index)
				const value = styles.getPropertyValue(field)
				if(defaults.entry(field, value)) {
					window.modules.dot.set(data, field,value)
				}
			}
		}
		return data ? Object.entries(data):[]
	}

	function assignment_type(field){
		for(const type in fieldset){
			if(fieldset[type].some(includes_field)){
				return type
			}
		}
		return 'attribute'
		//scope actions
		function includes_field(entry){ return field.includes(entry) }
	}

	function assignment_defaults(element, pseudo){
		const sample = window.document.createElement(element.tagName)
		window.document.body.appendChild(sample)
		return {
			computed: window.getComputedStyle(sample, pseudo),
			entry(field, value){ return this.computed.getPropertyValue(field) !== value },
			remove(){ return (this.sample.remove(), this) },
			sample
		}
	}
},
async function CascadeContainer(){
	function CascadeContainer(element, assignments, contents){
		if(this instanceof CascadeContainer === false) return new CascadeContainer(...arguments)

		this.element = element
		this.template = window.modules.element.create('template',{
			uid: element.xml.uid,
			html:`${container_style(element, assignments)}`
		})

		for(const content of contents){
			content.element.insert(content.template).after()
			content.element.remove()
		}
		this.template.content.appendChild(this.element.cloneNode(true))
	}
	CascadeContainer.prototype = {
		toString(){ return this.template.outerHTML }
	}

	//exports
	return CascadeContainer

	//scope actions


	function container_style(element, assignments){
		const style = {}
		for(const assignment of Object.entries(assignments)){
			if(assignment[0] in style === false) style[assignment[0]] = []
			for(const field in assignment[1]){
				switch(field){
					case 'viewport':
						break
					default:
						style[assignment[0]].push(style_definition(field,assignment[1][field]))
						break
				}
			}
		}
		return style_sheet(style)
		//scope actions
		function style_definition(field, data){
			return Object.entries(data).map(rule).join('\n')
			//scope actions
			function rule(entry){ return `${entry[0]}: ${entry[1]};` }
		}

	}

	function style_sheet(style){
		return ['<style>', Object.entries(style).map(sheet).join('\n'),'</style>'].join('')
		//scope actions
		function sheet(entry){  return `${entry[0]}{ ${entry[1].join('\n')} } `  }
	}

})

