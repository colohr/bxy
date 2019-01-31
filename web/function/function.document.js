(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.document.range',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.document.range')?_.get('function.document.range'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const {is} = window.modules
	const document_function = get_document
	document_function.active = active
	document_function.host = get_host
	document_function.range = create_range
	document_function.root = get_root
	document_function.select = select
	document_function.selection = get_selection

	//exports
	return document_function

	//scope actions
	function active(){ return get_document(arguments[0]).activeElement || window.document.activeElement  }
	function create_range(){ return window.document.createRange() }
	function get_document(element){
		if(is.node(element)){
			if(is.document(element)) return element
			return get_document(element.parentNode)
		}
		return window.document
	}
	function get_host(element){ return get_document(element).host || get_root(element) }
	function get_root(element){
		if(is.node(element)){
			if(element === window.modules.element.head) return element
			else if(element === window.modules.element.body) return element
			else if(is.document(element)) return element
			return get_root(element.parentNode)
		}
		return window.document.body
	}
	function get_selection(){ return get_document(arguments[0]).getSelection()  }

	function select(target){
		if(is.not.node(target) && target instanceof Event) target = target.currentTarget || target.target
		if(is.not.node(target)) target = active()
		const selection = get_selection(target)
		selection.extend(target)
		return selection
	}




})
