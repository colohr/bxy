(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('TextRestore', {value:await module(...inputs)}); return window.modules.has('TextRestore')?window.modules.get('TextRestore'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(Clean){
	const uid = await window.modules.import.function('uid')
	const {is} = window.modules

	//exports
	return class TextRestore{
		constructor(host_element_name){ this.element = host_element_name }
		backup(element, text){
			if(!is.element(element)) return element
			const id = is.text(element.dataset.restoreId) ? element.dataset.restoreId:element.dataset.restoreId = uid()
			return backup_element_text(element, locator(this.element, id), get_text(element, text))
		}
		async find(id){ return await get_storage_data(locator(id, this.element)) }
		async locators(){ return await get_storage_locators(this.element) }
		async restore(element){
			if(!is.element(element) || !is.text(element.dataset.restoreId)) return element
			return await restore_element_text(element, locator(this.element, element.dataset.restoreId))
		}
		async restore_all(...elements){ return await Promise.all(elements.map(element=>this.restore(element))) }
	}

	//scope actions
	function backup_element_text(element, identifier, text){
		if(!is.text(text)) return element
		set_storage_data(identifier, text).then(()=>element.innerHTML = `<storage-text id="${identifier}"></storage-text>`)
		return element
	}

	async function get_storage_data(identifier){
		return await window.modules.storage
						   .get(identifier)
						   .then(content=>content ? content.text:null)
	}

	function get_storage_locators(element){ return window.modules.storage.fields().then(fields=>fields.filter(field=>field.indexOf(Clean.field) === 0 && field.includes(`@${element}`))) }

	function get_text(element, text){
		if(!is.text(text)) text = element.innerHTML
		text = text.trim()
		return text.length && text.indexOf('<storage-text') !== 0 ? text:null
	}

	function locator(text_unique_id, host_element_tag_name){ return `${Clean.field}${text_unique_id}@${host_element_tag_name}`}

	async function restore_element_text(element, identifier){
		const content = await get_storage_data(identifier)
		if(content) element.innerHTML = content
		return element
	}

	function set_storage_data(locator, text){
		return window.modules.storage
					 .set(locator, {date: new Date(), text})
					 .then(()=>Clean.updates ? Clean.up():null)
					 .catch(error=> console.error(error))
	}

}, async function TextRestoreClean(){
	const data_field = 'TextRestore:'
	const second = 1000
	const minute = second * 60
	const hour = minute * 60
	let last_update = new Date()

	//exports
	return {
		field: data_field,
		up:update,
		get updates(){ return should_update() }
	}

	//scope actions
	async function get_date(locator){ return window.modules.storage.get(locator).then((...x)=>x[0].date) }
	function get_expiration(date = new Date()){ return (date.setDate(new Date().getDate() - 7), date) }
	function is_expired(date, expiration_date){return date <= expiration_date}
	function should_update(){ return new Date() - last_update > hour }
	async function update(){
		last_update = new Date()
		const expiration_date = get_expiration()
		const locators = await get_storage_item_fields()
		for(const locator of locators){
			if(await is_expired_field(locator)) await window.modules.storage.delete(locator)
		}

		//scope actions
		function is_expired_field(field){ return get_date(field).then(date=>is_expired(date, expiration_date)) }

		async function get_storage_item_fields(){
			return await window.modules.storage.fields().then(fields=>fields.filter(is_text_storage_field))
			//scope actions
			function is_text_storage_field(field){ return field.indexOf(data_field) === 0 }
		}
	}

})
