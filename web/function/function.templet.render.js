(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function FunctionTempletRender(...x){
	const {is} = window.modules
	const Templet = window.modules.Templet
	const property = {element:0,target:1,field:2}
	const render_items = await window.modules.import.function('templet.items')
	const render_data = await window.modules.import.function('templet.data')
	const Render = {
		count(){ return Templet.dataset(arguments[property.element]).count },
		data(){ return render_data(arguments[property.element], render_function(arguments[property.element])) },
		items(){ return render_items(arguments[property.element], render_function(arguments[property.element])) },
		set(){ return (...x)=>set(arguments[property.element], ...x) },
		update(){ return update(arguments[property.element]) }
	}


	//exports
	return render_function

	//scope actions
	function render(element){
		const dataset = Templet.dataset(element)
		const template = dataset.template()
		Promise.resolve(template(dataset)).then(on_content).catch(on_error)
		return render_function(dataset)
		//scope actions
		function on_content(content){ dataset.engine.render(content,dataset.container) }
		function on_error(error){ console.error(error) }
	}



	function render_function(element){
		return new Proxy(function render_target(){ return render(element,...arguments) }, {
			get(target, field){
				if(field in Render) return Render[field](element, field)
				return Reflect.get(target, field) || null
			},
			has(target, field){ return field in Render || Reflect.has(target,field) },
			ownKeys(target){return Object.getOwnPropertyNames(Render).sort() }
		})
	}


	function set(element, ...values){
		const dataset = Templet.dataset(element)
		const items = values.filter(is.array)[0] || null
		const data = values.filter(is.data)
		const replace = values.filter(is.TF)[0] === true
		if(items) dataset.items = replace ? items:dataset.items.concat(items)
		if(data.length) dataset.data = replace ? Object.assign({}, ...data):Object.assign(dataset.data, ...data)
		return render(element)
	}



	function update(element){
		return (...content)=>{
			if(content.length) return set(element, ...content)
			return render(element)
		}
	}

})
