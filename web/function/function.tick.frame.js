(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('tick.frame', {value:await module(...inputs)}); return window.modules.has('tick.frame')?window.modules.get('tick.frame'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(tick_timer){
	const ticker = Symbol('tick.frame')
	//exports
	return function tick_frame(activity, ...inputs){
		//exports
		return (tick_timer.clear(activity, ticker), activity[ticker] = tick_timer(frame_activity, {ticker, duration: 20}))

		//scope actions
		function frame_activity(){
			window.requestAnimationFrame(on_frame)
			//scope actions
			function on_frame(){ activity(...inputs) }
		}
	}
}, async function load_assets(){ return await window.modules.import.function('tick.timer') })
