(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('localforage', {value:await module(...inputs)}); return window.modules.has('localforage')?window.modules.get('localforage'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	if(window.modules.has('project.node_modules')){
		const file = `localforage/${window.modules.directory.modules.Storage.file}`
		window.modules.import.assets(new URL(file,window.modules.project.node_modules))
		return await window.modules.set('Storage',await window.modules.wait('localforage', true))
	}
	return await window.modules.import.package(window.modules, 'Storage')
})
