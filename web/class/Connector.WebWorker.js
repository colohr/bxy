(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function DrawFunctionConnections(DataStorage){
	if(modules.has('meta') === false) await modules.import('meta')
	const data_field = 'node_connector_data'
	const change_field = 'node_connector_change'
	const Data = DataStorage(data_field)
	const ChangedData = DataStorage(change_field)
	await Data.reset()
	await ChangedData.reset()
	worker.on('node', on_value)
	worker.on('namespace', on_value)
	worker.send('field', {data:data_field,change:change_field})
	ChangedData.interval = setInterval(change_interval,300)

	//scope actions
	async function get_value({id,notation}){ return await Data.get([id,notation].join('.')) }
	async function set_value({id, notation, value}){  return await Data.set([id, notation].join('.'), value) }
	async function on_value({detail}){
		const from_value = await get_value(detail)
		if(from_value !== Data.value(detail.value)){
			await set_value(detail)
			const changes = await ChangedData() || {}
			const namespace = detail.namespace
			if(namespace in changes === false) changes[namespace] = []
			detail.from = window.modules.meta.io.incoming(from_value)
			changes[namespace].push(detail)
			changes[namespace] = Array.from(new Set(changes[namespace]))
			await ChangedData.update(changes)
		}
	}

	async function changed({id, notation, value}){ return (await get_value({id,notation})) !== Data.value(value) }

	async function change_interval(){
		if(ChangedData.working === true) return
		ChangedData.working = true
		let changes = await ChangedData()
		await ChangedData.reset()
		if(changes){
			for(const id in changes){
				for(const change of changes[id]) worker.send(change.namespace,change)
			}
			await ChangedData.update(Object.assign({}, await ChangedData()))
		}
		changes = null
		ChangedData.working = false
	}

}, function Data(data_field){
	const {dot,is} = window.modules
	const Data = data
	Data.delete = delete_data
	Data.get = get_data
	Data.reset = reset_data
	Data.set = set_data
	Data.value = get_data_value
	Data.update = update
	return Data
	//scope actions
	async function data(){ return await window.modules.storage.get(data_field) }
	async function delete_data(notation,value=null){ return (dot.delete(value=await data(), notation),await update(value)) }
	async function get_data(notation){ return dot.get(await data(), notation) }
	function get_data_value(value){ return is.object(value) ? window.modules.meta.io.outgoing(value):value }
	async function reset_data(){  return (await window.modules.storage.delete(data_field), await update()) }
	async function set_data(notation,value, object=null){  return await update((dot.set(object=await data(), notation, get_data_value(value)),object)) }
	async function update(value={}){ return (await window.modules.storage.set(data_field, value),Data) }
})
