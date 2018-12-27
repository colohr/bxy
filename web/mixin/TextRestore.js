(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('TextRestore.Mixin', {value:await module(...inputs)}); return window.modules.has('TextRestore.Mixin')?window.modules.get('TextRestore.Mixin'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(TextRestore){
	//exports
	return Base=>class extends Base{
		constructor(...x){
			super(...x)
			this.storage = new TextRestore(this.localName)
		}
	}


}, async function load_assets(){ return await window.modules.import.class('TextRestore') })
