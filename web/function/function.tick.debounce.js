(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('tick.debounce', {value:await module(...inputs)}); return window.modules.has('tick.debounce')?window.modules.get('tick.debounce'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function tick_debounce(){

	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing. The function also has a property 'clear'
	 * that is a function which will clear the timer to prevent previously scheduled executions.
	 *
	 * @source underscore.js
	 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	 * @param {Function} function to wrap
	 * @param {Number} timeout in ms (`100`)
	 * @param {Boolean} whether to execute at the beginning (`false`)
	 * @api public
	 */

	//exports
	return debounce

	//scope actions
	function debounce(activity, wait, immediate){
		let timeout, inputs, context, timestamp, result
		if(null === wait) wait = 100

		//exports
		return (debounced.clear=debounced_clear, debounced.flush=debounced_flush, debounced)

		//scope actions
		function debounced(){
			context = this
			inputs = arguments
			timestamp = Date.now()
			if(!timeout) timeout = window.setTimeout(debounced_later, wait)
			if(immediate && !timeout){
				result = activity.apply(context, inputs)
				context = inputs = null
			}
			return result
		}

		function debounced_clear(){
			if(timeout){
				window.clearTimeout(timeout)
				timeout = null
			}
		}

		function debounced_flush(){
			if(timeout){
				result = activity.apply(context, inputs)
				context = inputs = null
				window.clearTimeout(timeout)
				timeout = null
			}
		}

		function debounced_later(){
			let last = Date.now() - timestamp
			if(last < wait && last >= 0) timeout = window.setTimeout(debounced_later, wait - last)
			else{
				timeout = null
				if(!immediate){
					result = activity.apply(context, inputs)
					context = inputs = null
				}
			}
		}
	}


})
