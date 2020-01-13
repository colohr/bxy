(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function Index(...x){
	const body = window.document.body
	body.insert('<h1>LESSON</h1>').start()

	const styles = await template_styles()
	const css = await window.modules.import.function('css')


	for(const entry of styles){
		const id = `header-${entry[0]}`
		body.insert(`<h1 id="${id}">${entry[0]}</h1>`).start()
		entry[1](body.gui[id])
	}

	//scope actions
	async function template_styles(){
		const map = new Map()
		map.sheet = get_sheet
		const response = (await window.modules.http(URL.join('template/styles.html'))).document
		for(const style of Array.from(response.querySelectorAll('style'))){

			map.set(style.id, get_sheet(style));
		}
		return map
		//scope actions
		function get_sheet(style){
			const sheet = properties
			sheet.rules = get_rules

			return properties

			//scope actions
			function get_rules(){
				const array = Object.entries(css.extract(style.innerHTML))
				const total = style.sheet.rules.length
				for(let index=0;index<total;index++){
					const rule = style.sheet.rules.item(index)
					for(let iteration=0;iteration<rule.style.length;iteration++){
						const field = rule.style.item(0)
						const value = rule.style.getPropertyValue(field)
						array.push([field,value])
					}
				}
				return array
			}
			function properties(element){
				for(const entry of get_rules()) element.style.setProperty(...entry);
				return element
			}
		}
	}

})