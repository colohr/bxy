(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('TextRestore.Mixin', {value:await module(...inputs)}); return window.modules.has('TextRestore.Mixin')?window.modules.get('TextRestore.Mixin'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(TextRestore){
	const instance = Symbol('TextRestore instance')
	//exports
	return Base=>class extends Base{
		get text_restore_id(){ return this.dataset.textRestoreId || this.localName }
		get storage(){ return get_storage(this) }
	}

	//scope actions
	function get_storage(element){ return instance in element ? element[instance]:new TextRestore(element.text_restore_id) }


}, async function load_assets(){ return await window.modules.import.class('TextRestore') })
