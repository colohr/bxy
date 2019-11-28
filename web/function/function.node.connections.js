(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.node.connections', {value:await module(...inputs)}); return window.modules.has('function.node.connections')?window.modules.get('function.node.connections'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {is} = window.modules
	const ID = await window.modules.import.function('id')
	const connections = Symbol('Node.connections')
	class NodeConnection extends Set{
		constructor(from_node, to_node){
			super([`${from_node}`,`${to_node}`])
			this.from=from_node
			this.to=to_node
			this.id=ID('nodes')
			if(connections in NodeConnection === false) NodeConnection[connections] = new Map()
			NodeConnection[connections].set(`${this.id}`, this)
		}
		get dataset(){ return window.modules.Node.datasets.has(this)? window.modules.Node.datasets.get(this):null }
		set dataset(data){
			if(is.data(data) === false) window.modules.Node.datasets.delete(data)
			else window.modules.Node.datasets.set(this, data)
		}
		get selector(){ return get_selector(this) }
		toString(){ return this.selector }
	}

	//exports
	const node_connections_function = get_connections
	node_connections_function.connect = get_connection
	node_connections_function.entry = get_entry
	node_connections_function.id = get_id
	node_connections_function.selector = get_selector
	node_connections_function.value = get_connection_value
	return node_connections_function

	//scope actions
	function get_connection(from_node,to_node){
		let connection = get_entry(from_node, to_node)
		if(connection === null){
			from_node = ID.get(from_node)
			if(from_node){
				to_node = ID.get(to_node)
				if(to_node) connection = new NodeConnection(from_node, to_node)
			}
		}
		return connection
	}

	function get_connection_value(identity){
		identity = get_identity(identity)
		return connections in NodeConnection && NodeConnection[connections].has(identity) ? NodeConnection[connections].get(identity):null
	}

	function get_connections(identity){
		identity = get_identity(identity)
		const entries = []
		if(identity && connections in NodeConnection){
			for(const entry of NodeConnection[connections]){
				if(entry[0] === identity) entries.push(entry)
				else if(entry[1].has(identity)) entries.push(entry)
			}
		}
		return entries
	}

	function get_entry(from_node,to_node){
		if(connections in NodeConnection){
			from_node = get_identity(from_node)
			to_node = get_identity(to_node)
			if(from_node && to_node){
				for(const entry of NodeConnection[connections]){
					if(entry[1].has(from_node) && entry[1].has(to_node)) return entry
				}
			}
		}
		return null
	}

	function get_entry_id(target){
		const entries = get_connections(target)
		if(entries.length > 0) for(const entry of entries){
			if(entry.id === `${target}`) return entry.id
		}
		return null
	}

	function get_id(...connection){
		connection = get_connection(...connection)
		return connection ? connection.id:null
	}

	function get_identity(){ return (arguments[0]=ID.decode(arguments[0]), arguments[0] ? `${arguments[0]}`:null) }

	function get_selector(nodes){
		if(nodes instanceof NodeConnection) nodes = Array.from(nodes)
		else nodes = Array.from(arguments)
		return nodes.map(get_identity).filter(is.text).map(id=>`[nodes~="${id}"]`).join('')
	}

	function has_connections(identity){ return get_connections(identity).length === 0 }


})
