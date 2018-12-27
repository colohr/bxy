(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Element.Classes', {value:await module(...inputs)}); return window.modules.has('Element.Classes')?window.modules.get('Element.Classes'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){

	//exports
	return Base=>class extends Base{
		add_class(...x){ return set_class(this, true, ...x) }
		has_class(...x){ return has_class(this, ...x) }
		remove_class(...x){ return set_class(this, false, ...x) }
		toggle_class(name){ return this.has_class(name) ? this.remove_class(name):this.add_class(name) }
	}

	//scope actions
	function has_class(element, ...names){
		let has = false
		for(const name of names) has = element.classList.contains(name)
		return has
	}

	function set_class(element, value, ...x){
		for(const name of x) element.classList.toggle(name, value)
		return element
	}
})
