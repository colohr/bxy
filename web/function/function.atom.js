(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('atom', {value:await module(...inputs)}); return window.modules.has('atom')?window.modules.get('atom'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	function Atom(){}
	//once
	Atom.prototype.wait = async function wait_on_value(...listener_notations_targets){}
	//on
	Atom.prototype.watch = function watch(){}
	Atom.prototype.on = function on(){}
	Atom.prototype.once = function once(){}
	Atom.prototype.off = function off(){}
	//token symbol
	Atom.prototype.token = function symbol_for_token(notation){
		const dots = notation.split('.')
		return Symbol.for(dots[0])
	}
	return Atom
})
