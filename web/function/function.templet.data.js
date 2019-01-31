(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function FunctionTempletData(){
	const Templet = window.modules.Templet
	const {dot} = window.modules
	//exports
	return templet_data

	//scope actions
	function templet_data(element, render){
		return new Proxy(assign_data, {
			deleteProperty(target,field){ return (delete_value(Templet.dataset(element), field)? render.update():null,true) },
			get(target, field){ return dot.get(Templet.dataset(element).data, field) },
			has(target, field){ return dot.has(Templet.dataset(element).data, field) },
			set(target, field){ return (set_value(Templet.dataset(element),field)? render.update():null,true) }
		})
	}

	function assign_data(dataset,render){  return (...data)=>(dataset.data=Object.assign(dataset.data,...data),render.update()) }

	function delete_value(dataset, field){
		const exists = field in dataset.data
		if(exists) dot.delete(dataset.data, field)
		return exists
	}

	function set_value(dataset, field, value){
		const current = dot.get(dataset,field)
		if(current !== value) dot.set(dataset, field, value)
		return current !== value
	}
})
