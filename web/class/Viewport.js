(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Viewport', {value:await module(...inputs)}); return window.modules.has('Viewport')?window.modules.get('Viewport'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const Dimension = await window.modules.import.class('Dimension')
	const timer = Symbol('timer')
	const timer_duration = 100
	const context = new (await window.modules.import.class('EventEmitter'))

	function Viewport(){ if(this instanceof Viewport === false) return new Viewport()  }
	Viewport.observe = observe
	Viewport.unobserve = unobserve
	Viewport.prototype = {
		get dimension(){ return context.dimension },
		get height(){ return this.dimension.height },
		get maximum(){ return this.size.maximum },
		get minimum(){ return this.size.minimum },
		get size(){ return this.dimension.size },
		get width(){ return this.dimension.width }
	}
	return (window.addEventListener('resize', resize), update(), Viewport)

	//scope actions
	function clear(){
		if(timer in context) window.clearTimeout(context[timer])
		return delete context[timer]
	}

	function observe(listener){ return (context.on('resize', listener),Viewport()) }

	function resize(){
		if(clear()) context[timer] = window.setTimeout(on_tick, timer_duration)
		//scope actions
		function on_tick(dimension = update()){
			if(context.listenerCount('resize')){
				context.emit('resize', dimension)
			}
		}
	}

	function unobserve(listener){ return (context.off('resize', listener),Viewport()) }

	function update(){ return context.dimension = Dimension({ height: window.innerHeight, width: window.innerWidth }) }
})