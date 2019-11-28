(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function FunctionTempletRender(...x){
	const {is} = window.modules
	const Templet = window.modules.Templet || (await window.modules.import('templet'), window.modules.Templet)
	const property = {element: 0, target: 1, function: 1}
	const render_items = await window.modules.import.function('templet.items')
	const render_data = await window.modules.import.function('templet.data')
	const Render = {
		count(){ return Templet.dataset(arguments[property.element]).count },
		data(){ return render_data(arguments[property.element], render_function(arguments[property.element], update(...arguments))) },
		dataset(){ return window.modules.Templet.dataset(arguments[property.element]) },
		items(){ return render_items(arguments[property.element], render_function(arguments[property.element], update(...arguments))) },
		set(){ return (...x)=>set(arguments[property.element], ...x) },
		update(){ return (render_function(arguments[property.element], update(...arguments)))(arguments[property.element], update(...arguments)) }
	}
	const RenderHandler = element=>({
		get(target, field){
			if(field in Render) return Render[field](element, target, field)
			return Reflect.get(target, field) || null
		},
		has(target, field){ return field in Render || Reflect.has(target, field) },
		ownKeys(target){ return Array.from(new Set(Object.getOwnPropertyNames(target).concat(Object.getOwnPropertyNames(Render).sort()))) }
	})

	//exports
	return render_function

	//scope actions
	function create(element){
		return function render_update_function(){
			if(arguments.length) return set(element, render_update_function, ...arguments)
			return render(element, render_update_function, ...arguments)
		}
	}

	function render(element){
		const dataset = Templet.dataset(element)
		const template = dataset.template()
		if(is.function(template)) Promise.resolve(template(dataset)).then(on_content).catch(on_error)
		return render_function(dataset, update(...arguments))

		//scope actions
		function on_content(content){ dataset.engine.render(content, dataset.container) }
		function on_error(error){ console.error(error) }
	}

	function render_function(element){ return new Proxy(update(...arguments), RenderHandler(element)) }

	function set(element, ...values){
		const dataset = Templet.dataset(element)
		const items = values.filter(is.array)[0] || null
		const data = values.filter(is.data)
		const replace = values.filter(is.TF)[0] === true
		if(items) dataset.items = replace ? items:dataset.items.concat(items)
		if(data.length) dataset.data = replace ? Object.assign({}, ...data):Object.assign(dataset.data, ...data)
		return render(element, update.apply(null, arguments))
	}

	function update(...update_function){
		update_function = update_function.filter(is.function)[0] || null
		return is.function(update_function) ? update_function:create.apply(null, arguments)
	}
})
