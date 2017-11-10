const fxy = require('fxy')
const txy = require('txy')
const router = require('./router')
const data = Symbol('data')



class Database extends Map{
	constructor(options){
		super()
		this.options = options
		let tree = fxy.tree(this.folder,'html')
		this.files = tree.items.filter(item=>item.get('type').file)
	}
	get collection(){ return this.options.collection }
	get folder(){ return this.options.folder }
	load(){
		let items = get_items(this)
		console.log('database count: ',items.length)
		return new Promise((success,error)=>{
			if(items.length) return success(set_items(this,...items))
			return this.save().then(()=>{
				items = get_items(this)
				return success(set_items(this,...items))
			}).catch(error)
		})
		//shared actions
		function set_items(db,...x){
			for(let item of x) db.set(item.name,item)
			return db
		}
	}
	route(path,app){
		this.route_path = path
		//console.log(this)
		for(let file of this.keys()){
			app.server.get(`${path}/${file}`,router.file(app,this))
		}
		//app.server.use(`${path}/:name`,router(app,this))
		//app.server.get(`${path}/:name/:section`,router(app,this))
		return this
		
	}
	get selector(){ return this.options.selector || 'body > .page-wrapper'}
	save(on_item){
		if(!fxy.exists(this.collection)) throw new Error(`The collection folder does not exist!`)
		if(fxy.is.function(on_item)) on_item = on_item.bind(this)
		let documents = get_documents(this)
		return Promise.all(documents.map(document=>document.save(this.collection,on_item)))
	}
}

class DatabaseItem{
	constructor(item){
		this.item = item
		this.name = item.name.replace('.json','').replace('-html','.html')
	}
	get content(){ return this.item.content }
	get data(){ return get_item_data(this) }
}


//exports
module.exports = Database

//shared actions
function get_item_data(item){
	if(data in item) return item[data]
	return item[data] = JSON.parse(item.content)
}

function get_items(database){
	let tree = fxy.tree(database.collection,'json')
	let items = tree.items.only
	return items.map(item=>new DatabaseItem(item))
}

function get_documents(database){
	return database.files.map(item=>{
		item.selector = database.selector
		return txy.document(item)
	})
}