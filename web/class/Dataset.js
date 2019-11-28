(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Dataset', {value:await module(...inputs)}); return window.modules.has('Dataset')?window.modules.get('Dataset'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {is} = window.modules
	const uid = await window.modules.import.function('uid')
	return class Dataset extends Array{
		constructor(...data){ super(...data.map(ensure_value).filter(is.object)) }
		clear(){ return (this.splice(0), this) }
		configure(){ return configure_value.apply(this, arguments) }
		get count(){ return this.length }
		delete(){ return delete_value.apply(this,arguments) }
		get fields(){ return this.configure().map(({id})=>id) }
		get(){ return get_value.apply(this,arguments) }
		has(){ return has_value.apply(this,arguments) }
		index(){ return index_value.apply(this,arguments) }
		push(...data){ return super.push(...data.map(ensure_value).filter(is.object)) }
		set(){ return set_value.apply(this,arguments) }
	}

	//scope actions
	function configure_value(){ return this.map(ensure_value).filter(is.object) }

	function delete_value(identity){ return (identity=this.index(identity),identity>=0?this.splice(identity,1):null,this) }

	function ensure_value(data){
		if(is.object(data) === false) return null
		if('id' in data === false) data.id = uid('data-')
		return data
	}

	function get_value(identity){ return (identity=`${identity}`, this.filter(item=>item.id === identity)[0]||null) }

	function has_value(identity){ return (identity=`${identity}`, this.filter(item=>item.id === identity).length===1) }

	function index_value(data){
		let index = is.number(data)&&data>=0&&data<this.count?data:this.indexOf(data)
		if(index === -1) index = this.indexOf(this.get(data))
		return index
	}

	function set_value(identity, data){
		if(is.object(data) && 'id' in data === false) data.id = identity
		data = ensure_value(data)
		if(data){
			const index = this.index(identity)
			if(index >= 0) this[index] = data instanceof Array ? data:Object.assign(this[index], data)
			else this.push(data)
		}
		return this.configure()
	}


})
