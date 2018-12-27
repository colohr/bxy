(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Timeout', {value:await module(...inputs)}); return window.modules.has('Timeout')?window.modules.get('Timeout'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(function Timeout(){
	const timeout = Symbol('Timeout')
	const timeout_timer = Symbol('Timeout timer')
		
	//exports
	return Base => class extends Base{
		get timeout(){ return get_timeout(this) }
	}
		
	//scope actions
	function clear_timer(){
		if(has_timeout(this)) window.clearTimeout(this[timeout_timer])
		return delete this[timeout_timer]
	}

	function get_time(value){
		const time = typeof value === "number" || typeof value === 'string' ? parseInt(value):undefined
		return isNaN(time) ? undefined:time
	}

	function get_timeout(element){
		if(timeout in element) return element[timeout]
		const element_timeout = new Proxy(set_timeout(element),{
			deleteProperty(o,name){ return delete o[name] },
			get(o,name){
				switch(name){
					case 'clear':
					case 'reset':
					case 'stop':
						return clear_timer.bind(element)
						break
					case 'set':
					case 'start':
						return element_timeout
						break
				}
				if(name in o) return o[name]
				return null
			},
			has(o,name){ return name === 'timer' || name === 'timeout' ? o():name in o },
			set(o,name,value){
				let func = null
				if(typeof value === 'function') o[name] = func = value
				if(value === true && name in o) func = o[name]
				else if(value === false || value === null) delete o[name]
				return typeof func === 'function' ? element_timeout(o[name],get_time(name)):true
			}
		})
		return element[timeout] = element_timeout
	}

	function has_timeout(element){ return timeout_timer in element && typeof element[timeout_timer] === 'number' }

	function set_timeout(element){
		return function set_element_timeout(callback,time=100){
			if(typeof callback !== 'function') return has_timeout(element)
			window.requestAnimationFrame(()=>element.timeout.clear()[timeout_timer] = window.setTimeout(callback,time))
			return true
		}
	}
		
		
})

