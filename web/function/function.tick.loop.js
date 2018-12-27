(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('tick.loop', {value:await module(...inputs)}); return window.modules.has('tick.loop')?window.modules.get('tick.loop'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const default_duration = 250
	const default_limit = 1000
	const ticker = Symbol('tick.timer')
	const stopper = Symbol('tick.timer.stopper')

	const tick_loop_function = start
	tick_loop_function.clear = clear
	tick_loop_function.has = has
	tick_loop_function.pause = pause

	//exports
	return tick_loop_function

	//scope actions
	function clear(activity){ return (has(activity) ? window.clearInterval(activity[ticker]):null, delete activity[ticker]) }

	function has(activity){ return ticker in activity && typeof activity[ticker] === 'number' }

	function pause(activity){ return activity[stopper] = true }

	function start(activity, duration=default_duration, limit = default_limit){
		if(stopper in activity && has(activity)) return (delete activity[stopper], activity[ticker])
		delete activity[stopper]

		let count = 0

		//exports
		return (activity[ticker] = window.setInterval(action, duration))

		//scope actions
		function action(){
			if(count >= limit) return clear(activity)
			else if(stopper in activity === false) {
				activity()
				count++
			}
		}
	}
})
