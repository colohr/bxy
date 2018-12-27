(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('sync.set', {value:await module(...inputs)}); return window.modules.has('sync.set')?window.modules.get('sync.set'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const sync = await window.modules.import.function('sync')
	const {is, Sync} = window.modules
	const skip = Symbol('skip wait custom element name')
	window.modules.set('sync.one', sync_one)
	window.modules.set('sync.input', input_action)

	//exports
   return sync_list

   //scope actions
   function filter_skipped(value){ return value !== skip }

   function get_list(...inputs){
	   return inputs.map(get_input)
	   //scope actions
	   function get_input(input){
			if(is.function(input)) return input_action(input)()
			else if(is.text(input)) return Sync(async (value=null)=>(is.nothing(await window.modules.wait(input,true))?skip:value))
			return Sync(async ()=>await sync(input))
	   }
   }

   function input_action(input){
		return async function input_function(){
			return await eval(`(async function on_input(call, create, get, one, set, {Sync,sync,wait,is,dot,url,id}, load){ 
				const make = create;
				const net = load;
				const exported = await (${input.toString()});
				return await sync(is.function(exported) ? Sync(exported):exported);
			})`)(call_function, create_function, get_function, sync_one, sync_list, window.modules, window.modules.import)
		}
		//scope actions
		async function call_function(exported, ...x){
			return (exported=await sync(exported), await sync(exported(...x)))
		}
		async function create_function(exported, ...x){
			return (exported=await sync(exported), await sync(new exported(...x)))
		}
		async function get_function(...x){
			return await window.modules.wait(true, ...x)
		}
   }

   async function sync_list(...inputs){ return (await sync(get_list(...inputs))).filter(filter_skipped) }

   async function sync_one(...inputs){ return await (await sync_list(...inputs))[0] }
})