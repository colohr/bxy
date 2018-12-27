(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('FileLoader', {value:await module(...inputs)}); return window.modules.has('FileLoader')?window.modules.get('FileLoader'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(...x){
	class FileData{
		constructor(value){
			this.value = value
			Object.defineProperty(this,'data',{ get(list=null){ return (list = this.list.map(i=>file_data(i)), this.multiple ? list:list[0]) } })
		}
		get multiple(){ return this.value instanceof FileList }
		get list(){ return this.multiple ? Array.from(this.value):[this.value] }
		get total_size(){ return file_upload_total(this.list) }
	}

	//exports
	return FileData

	//shared actions
	function file_upload_total(files){ return files.reduce((count, file)=>count + file.size, 0) }

	function multipart_data(query, variables = {}, files){
		const body = new FormData()
		variables.files = []
		for(const file of files){
			body.append(file.name, file)
			variables.files.push({name: file.name, type: file.type_name})
		}
		body.append('graphql.query', query)
		body.append('graphql.variables', JSON.stringify(variables))
		return body
	}

	function file_data(x, data = {}){
		const file = {}
		for(const field in x) file[field] = x[field]
		const buffer = { type: 'buffer', data: blob_binary(x) }
		if(!data.name) data.name = x.name
		file.filename = x.name
		data.file = file
		data.buffer = buffer
		return data
	}

	function blob_binary(blob){
		const uri = URL.createObjectURL(blob)
		const request = new XMLHttpRequest()
		request.open('GET', uri, false)
		request.send()

		URL.revokeObjectURL(uri)

		const count = request.response.length
		const array = new Uint8Array(count)

		for(let i = 0; i < count; ++i){
			array[i] = request.response.charCodeAt(i)
		}

		return array
	}


})