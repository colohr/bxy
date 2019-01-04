(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('wait.on', {value:await module(...inputs)}); return window.modules.has('wait.on')?window.modules.get('wait.on'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(...x){
	const wait_on = wait_on_value
	const is = window.modules.is
	const get_uid = await window.module.import.function('uid')
	//exports
	//scope actions
	function wait_on_value(...x){
		const target = x.filter(i=>is.object(i))
		x = x.filter(i=>is.text(i))
		const uid = get_uid()
		const notations = get_notations(uid, ...x)
		console.log(notations)
		const waits = get_waits(notations, x)
		console.log(waits)
		return Promise.all(notations.map(set_notation)).then(()=>window.modules.wait(...waits)).then(result=>{
			console.log(result)
			console.log(wait_on[uid])
			window.modules.data.delete(wait_on,uid)
			return result
		})
		//scope actions
		function set_notation(notation){ return notation_wait(uid,notation) }

	}
	return wait_on_value

	//scope actions
	async function set_value(uid, notation, value){
		if(typeof value === 'function' && value.constructor.name === 'AsyncFunction') value = await value()
		else if(value instanceof Promise) value = await value
		return window.modules.data.set(wait_on, `${uid}.${notation}`, value)
	}

	async function notation_wait(uid, dot_notation){
		let dots = dot_notation.notation.split('.')
		let done = []
		for(const dot of dots){
			done.push(dot)
			const notation = done.join('.')
			await set_value(uid, notation, (await window.modules.wait(notation))[0])
		}
		return (done=null,dots=null)
	}
	async function when(...x){ return await Promise.all(x.map(name=>window.customElements.whenDefined(name))) }

	function get_waits(dot_notations, wait_notations){
		for(const dot of dot_notations){
			const index = wait_notations.indexOf(dot.notation)
			wait_notations[index] = dot.wait
		}
		return wait_notations
	}
	function get_whens(...x){ return x.filter(i=>i.includes('-')) }

	async function get_notations(uid, ...x){
		return x.filter(i=>i.includes('.')).map(notation=>({wait:`modules.wait.on.${uid}.${notation}`,notation}))
	}
})

