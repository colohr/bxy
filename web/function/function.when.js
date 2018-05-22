(x=>x)(async function(){
	return async function when_watcher(...x){
		const limit = 100000
		const notations = get_notations(...x)
		const whens = get_whens(...x)
		return new Promise((success, error)=>{
			let interval = null
			let count = 0
			let results = []
			return interval = window.setInterval(on_watch_loop, 100)

			//shared actions
			async function on_watch_loop(){

				for(const i of notations){
					let value = 'modules' in window === false ? null:modules.dot.get(window, i)
					if(value !== null){
						notations.splice(0, 1)
						if(typeof value === 'function' && value.constructor.name === 'AsyncFunction') value = await value()
						if(value instanceof Promise) value = await value
						results.push(value)
					}
				}
				if(notations.length === 0) (window.clearInterval(interval), await when(...whens), success(results), results = null)
				if(count >= limit) return error(new Error(`App.watch count: "${count}" limit reached. Watching: "${x.join(',')}"`))
				count++
			}
		})
	}
	async function when(...x){ return await Promise.all(x.map(name=>window.customElements.whenDefined(name))) }
	function get_whens(...x){ return x.filter(i=>i.includes('-')) }
	function get_notations(...x){ return x.filter(i=>i.includes('-')===false) }

})
