(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.import.document',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.import.document')?_.get('function.import.document'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const {element,http,id} = window.modules

	//exports
	return import_document

	//scope actions
	function attach_to_shadow_root(html_element){
		if(!html_element.shadowRoot) html_element.attachShadow({mode:'open'})
		return (html_element.shadowRoot.appendChild(this.import()),html_element)
	}

	async function create(template){
		const identifier = template.identifier
		if(template.document) switch(template.extension){
			case 'css': return create_style()
			case 'svg': return create_svg()
			default: return create_template()
		}

		return null

		//scope actions
		function create_style(){
			template = element.create('style',{'import-id':identifier, html:template.document})
			return (element.head.appendChild(template), template)
		}

		function create_svg(){
			const svg = template.document.body.querySelector('svg')
			if(svg) {
				svg.remove()
				svg.setAttribute('id', identifier)
				template = get_template(identifier,svg.outerHTML)
				template.svg = svg
				element.body.appendChild(element.create('div',{id:`${identifier}-import-container`,style:{display:'none'}}))
				element.document.getElementById(`${identifier}-import-container`).appendChild(template.svg)
			}
			return template
		}

		function create_template(){
			const all_styles = Array.from(template.document.querySelectorAll('style')).map(i=>i.outerHTML).join('\n')
			const all_content = template.document.body.innerHTML
			return get_template(identifier, `${all_styles}\n${all_content}`)
		}
	}

	function get_content(identifier, type){ return window.document.querySelector(`${type}[import-id="${identifier}"]`) }

	function get_template(identifier, content){
		const setting = {'import-id': identifier, import: import_content, attach: attach_to_shadow_root}
		const is_html = window.modules.is.text(content)
		if(is_html) setting.html = content
		const template = element.create('template', setting)
		if(window.modules.is.element(content)) template.appendChild(content)
		return (element.body.appendChild(template), template)
	}

	function get_type(locator){ return locator.extension === 'css' ? 'style':'template' }

	function import_document(locator){
		if(window.modules.is.url.text(locator)) locator =  new URL(locator)
		locator = window.modules.is.url(locator) ? locator:URL.get(locator)
		return load_document(locator)
	}

	function import_content(){ return document.importNode(this.content, true) }

	async function load_document(locator){
		const extension = locator.extension
		const identifier = extension ? id.dash(locator.basename):id.dash(`${locator.file.replace(`.${extension}`, '')}`)
		const type = get_type(locator)
		const content = get_content(identifier,type)
		if(content === null) return http(locator).then(on_document).then(create)
		return content
		//scope actions
		function on_document(response){ return {identifier,extension, type, document:type==='style' ? response.content:response.document,locator}  }
	}

})
