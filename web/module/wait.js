(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('wait', {value:await module(...inputs)}); return window.modules.has('wait')?window.modules.get('wait'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const limit = 100000

	//exports
	return async function wait_watcher(...x){
		let target = get_target(...x)
		let notations = get_notations(...x)
		let index = get_notations(...x)
		let whens = get_whens(...x)
		const one = get_one(...x)

		//exports
		return new Promise(wait_promise)

		//scope actions
		function wait_promise(success, failed){
			let interval = null
			let value = null
			let count = 0
			let results = []
			let watching = null
			return interval = window.setInterval(on_watch_loop, 100)

			//scope actions
			async function on_watch_loop(){
				if(watching === null && notations.length){
					watching = notations.splice(0,1)[0]
					try{
						value = await get_value(target, watching)
						if(window.modules.is.nothing(value) === false){
							results[index.indexOf(watching)] = value
							watching = null
						}
						else {
							notations.push(watching)
							watching = null
						}
					}
					catch(error){
						console.log(`watch() error: "${error.message}" on notation:"${watching}"`)
					}
				}
				else if(watching === null && notations.length === 0){
					window.clearInterval(interval)
					await when(...whens)
					await finish(...results)
				}

				if(count >= limit) return failed(new Error(`watch() count: "${count}" limit reached. Watching: notations: "${notations.join(',')}" elements: ""${whens.join(',')}""`))
				count++
			}
			async function finish(...out){
				value = null
				interval = null
				watching = null
				notations = null
				results = null
				index = null
				whens = null
				success(one === true ? out[0]:out)
			}
		}
	}

	//scope actions
	async function when(...x){ return await Promise.all(x.map(name=>window.customElements.whenDefined(name))) }
	function get_one(...x){ return x.filter(i=>typeof i === 'boolean')[0] || false }
	function get_notations(...x){ return get_text(...x).filter(i=>is_element_name(i) === false) }
	function get_target(...x){ return x.filter(x=>typeof x === 'object' && x !== null)[0] || window }
	function get_text(...x){ return x.filter(i=>typeof i === 'string') }
	function get_value(target, notation){ return 'modules' in window && 'dot' in window.modules ? window.modules.dot.get(target, notation):null }
	function get_whens(...x){ return get_text(...x).filter(is_element_name) }
	function is_element_name(x){ return x.includes('-') && x.includes('.') === false }
})
