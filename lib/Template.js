const fxy = require('fxy')
const txy = require('txy')

const templates_folder = fxy.join(__dirname,'templates')
const templates = {
	get index(){ return fxy.readFileSync(fxy.join(templates_folder,'index.html'),'utf8') }
}

class Template{
	static get index(){ return new Template(templates.index) }
	constructor(content){
		let template = txy.create(content)
		this.bind = data=>txy.set(template,data)
	}
	get data(){ return get_bind_data }
}

//exports
module.exports = Template


//shared actions
function get_bind_data(input,item,app){
	let data = Object.assign({},{
		links:get_links(item),
		style:get_style(item)
	},app.options)
	let options = app.options.bxy || {}
	let add_page_title = false

	for(let name in options){
		if(name === 'title') add_page_title = true
		else if(name !== 'wwi') data[name] = options[name]
		else{
			let attributes = []
			for(let x in options.wwi) attributes.push(`${x}="${options.wwi[x]}"`)
			data.wwi_script = `<script  ${attributes.join(' ')}></script>`
		}
	}
	if(add_page_title) data.title = `${data.title}: ${fxy.id.proper(item.name)}`
	data.body = get_body(item,input)
	return data
}

function get_body(item,input){
	let section = input.section
	return {
		attributes:fxy.is.array(item.body_attributes) ? item.body_attributes.join(' '):'',
		html:get_html(),
		html_class:'html_class' in item ? item.html_class:'page-wrapper',
		scripts:item.scripts.map(source=>`<script src="${source}"></script>`).join('\n')
	}
	//shared actions
	function get_html(){
		let html = item.items.filter(i=>!section ? true:fxy.id.dash(i.name) === section).map(i=>i.html).join('\n')
		return section && html.length === 0 ? get_names():html
	}
	function get_names(){
		let html = item.items.map(i=>{
			let i_section = fxy.id.dash(i.name)
			return `<li><a href="${input.url}${i_section}">${i_section}</a></li>`
		}).join('\n')
		return `<div class="container"><ol style="padding:20px;">${html}</ol></div>`
	}
}

function get_links(item){
	return item.styles.map(source=>`<link rel="stylesheet" href="${source}">`).join('\n')
}

function get_style(item){
	return fxy.is.array(item.body_style) ? item.body_style.join('\n'):''
}

