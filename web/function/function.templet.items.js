(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function FunctionTempletItems(){
	const Templet = window.modules.Templet
	const fieldset={
		items:{
			get fields(){ return this.set.concat(this.reset).concat(this.method) },
			set:["copyWithin", "fill",'pop', "push",'reverse','shift','unshift','sort','splice','forEach'],
			reset: ['slice', 'filter', 'map', 'reduce', 'concat','reduceRight','flat','flatMap'],
			updates(){ return this.reset.concat(this.set).includes(arguments[0]) },
			method:['lastIndexOf','includes','indexOf','keys','entries','every','some','join','values','flat']
		}
	}

	//exports
	return templet_items

	//scope actions
	function templet_items(element, render){
		return new Proxy((items)=>(Templet.dataset(element).items=items,render.update()), {
			get(target, field){ return (...items)=>templet_items_property(Templet.dataset(element), render, field, ...items) }
		})
	}

	function templet_items_property(dataset, render, field, ...x){
		if(fieldset.items.fields.includes(field) === false) return null
		const updates = fieldset.items.updates(field)
		dataset.items = dataset.items
		if(fieldset.items.reset.includes(field)) dataset.items = dataset.items[field](...x)
		else if(updates) dataset.items[field](...x)
		if(updates) return render.update()
		return dataset.items[field](...x)
	}


})
