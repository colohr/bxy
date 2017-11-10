const fxy = require('fxy')
const index_page = require('./Template').index
const page_not_found = {
	name:'Page Not Found',
	styles:[],
	body_style:['<style>body{margin:0;}main{padding:20px;}</style>'],
	scripts:[],
	items:[`
			<main>
				<section>
					<h1>Page not found!</h1>
				</section>
			</main>
		`]
}
//exports
module.exports = router
module.exports.file = file_router

//shared actions
function file_router(app,database){
	//let url = fxy.source.url(app.url,`${database.route_path}`)
	//let database_index = get_index(database,url)
	return (request,response)=>{
		let file = fxy.basename(request.path)
		let item = database.get(file)
		if(item){
			let page = item.page || index_page
			let data = page.data({name:file},item.data,app)
			return response.send(page.bind(data))
		}
		return response.send(': )')
		
		
		
		if(!input.section){
			
			item.template = page.bind(data)
			html = item.template
		}
		else if(input.section){
			if(!item[`${input.section}-template`]){
				html = page.bind(data)
			}
		}
		//if(name === 'index.json') return response.json(database_index)
		//
		//if(database.has(name)){
		//
		//
		//}
		//if(!html) html = index_page.bind(index_page.data(input,page_not_found,app))
		return response.send(html)
	}
}

function get_index(database,url){
	let index = {}
	for(let item of database.values()) {
		index[item.name] = {
			title:fxy.id.proper(item.name),
			url:`${url}/${item.name}`,
			sections:item.data.items.map(section=>{
				return `${url}/${item.name}/${fxy.id.dash(section.name)}`
			})
		}
	}
	return index
}

function router(app,database){
	let url = fxy.source.url(app.url,`${database.route_path}`)
	let database_index = get_index(database,url)
	return (request,response)=>{
		let input = request.params
		let name = input.name
		console.log(input)
		let html = null
		if(name === 'index.json') return response.json(database_index)
		if(database.has(name)){
			
			let item = database.get(name)
			input.url = `${url}/${item.name}/`
			let page = item.page || index_page
			let data = page.data(input,item.data,app)
			if(!input.section){
				
				item.template = page.bind(data)
				html = item.template
			}
			else if(input.section){
				if(!item[`${input.section}-template`]){
					html = page.bind(data)
				}
			}
		}
		if(!html) html = index_page.bind(index_page.data(input,page_not_found,app))
		return response.send(html)
	}
}

