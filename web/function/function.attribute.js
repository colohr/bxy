(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.attribute',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.attribute')?_.get('function.attribute'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const type = Symbol('HTML type')
	class Attribute{
		constructor(...input){
			this.type(input.filter(window.modules.is.text)[0] || '')
			Object.assign(this, ...input.filter(window.modules.is.data))
		}
		type(value){ return (value?this[type]=value:null,this[type]||'') }
		toString(){ return get_selector(this.type(),this) }
	}
	//exports
	const attribute_function = get_attribute
	attribute_function.data = get_attributes
	attribute_function.selector = get_selector
	return attribute_function

	//scope actions
	function get_attribute(type,...attributes){ return new Attribute(type,get_attributes(...attributes)) }
	function get_attributes(...option){
		const attributes = option.filter(window.modules.is.data).filter(window.modules.is.not.element)[0] || {}
		const id = option.filter(window.modules.is.text)[0] || ''
		if(id) attributes.id = id
		return attributes
	}

	function get_selector(...option){
		let selector = window.modules.is.text(option[0]) ? option[0]:''
		if(selector) option.splice(option.indexOf(selector), 1)
		for(const attribute of Object.entries(get_attributes(...option))) selector += `[${attribute[0]}="${attribute[1]}"]`
		return selector
	}

})
