(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.import.worker',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.import.worker')?_.get('function.import.worker'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	//export
	return import_worker

	//scope actions
	async function import_worker(){
		if(window.modules.has('worker')) return window.modules.worker.embed(...arguments)
		return (await window.modules.import('worker')).embed(...arguments)
	}
})
