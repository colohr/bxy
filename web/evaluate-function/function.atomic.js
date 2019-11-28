(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('atomic',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('atomic')?_.get('atomic'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {

	const Atomic = atomic
	Atomic.action = atomic_action
	Atomic.array = reduce_array
	Atomic.array.item = reduce_array_item
	Atomic.mixin = atomic_mixin
	Atomic.entries = reduce_entries
	Atomic.entry = reduce_entry
	Atomic.properties = atomic_properties

	//exports
	return atomic

	//scope actions
	function atomic(){}

	function atomic_action(...actions){
		actions = reduce_array(actions).filter(window.modules.is.function)
		return function action(){ return actions.reduce(reduce_action,arguments[0]) }
	}
	function atomic_mixin(...mixins){
		const mixin = atomic_action(...mixins)
		return function class_mixin(){ return mixin(arguments[0] || Object) }
	}

	function atomic_properties(object, ...bindings){
		for(const binding of bindings){
			for(const entry of Object.entries(binding)){
				if(window.modules.is.function(entry[1]) && 'bind' in entry[1]) object[entry[0]] = entry[1].bind(object)
				else object[entry[0]] = entry[1]
			}
		}
		return object
	}

	function reduce_action(result, action){ return action(result) }
	function reduce_array(array){ return Array.isArray(array)?array.reduce(reduce_array_item,[]):[array] }
	function reduce_array_item(array, item){ return array.concat(reduce_array(item)) }
	function reduce_entries(object){ return Object.entries(object).reduce(reduce_entry, {}) }
	function reduce_entry(object, entry){ return (window.modules.dot.set(object,entry[0],entry[1]), object) }
})
