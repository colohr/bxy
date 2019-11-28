(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('convert.tabs',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('convert.tabs')?_.get('convert.tabs'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const tab_expression = /\s*\n[\t\s]*/

	//exports
	const convert_tabs_function = convert_tabs
	convert_tabs_function.element = convert_tabs_of_element
	return convert_tabs_function

	//scope actions
	function convert_tabs(content){
		if(window.modules.is.element(content)) return convert_tabs_of_element(content)
		if(window.modules.is.function(content)) content = content.toString()
		if(window.modules.is.object(content)) content = JSON.stringify(content,null,2)
		if(window.modules.is.text(content) && content.startsWith('\n') === false) content = `\n\t${content}`
		if(window.modules.is.text(content) === false) return ''
		const pattern = content.match(tab_expression)
		return content.replace(new RegExp(pattern, 'g'), '\n')
	}
	function convert_tabs_of_element(element){ return element.innerHTML = convert_tabs(element.innerHTML.trim()) }
})
