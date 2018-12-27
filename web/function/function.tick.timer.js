(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('tick.timer', {value:await module(...inputs)}); return window.modules.has('tick.timer')?window.modules.get('tick.timer'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const default_duration = 50
	const timer = Symbol('tick.timer')
	const tick_timer_function = start
	tick_timer_function.clear = clear
	tick_timer_function.has = has

	//exports
	return tick_timer_function

	//scope actions
	function clear(activity, ticker = timer){ return (has(activity) ? window.clearTimeout(activity[ticker]):null, delete activity[ticker]) }

	function has(activity, ticker = timer){ return ticker in activity && typeof activity[ticker] === 'number' }

	function start(activity, setting, ...inputs){
		if(window.modules.is.number(setting)) setting = {duration:setting}
		if(window.modules.is.nothing(setting)) setting = {}
		if('duration' in setting === false) setting.duration = default_duration

		//exports
		return (clear(activity), activity[setting.ticker] = window.setTimeout(action, setting.duration))

		//scope actions
		function action(){
			clear(activity, setting.ticker)
			activity(...inputs)
		}
	}
})
