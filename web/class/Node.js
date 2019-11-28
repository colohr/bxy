(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Node', {value:await module(...inputs)}); return window.modules.has('Node')?window.modules.get('Node'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(NodeMap){
	const {is} = window.modules
	const node_datasets = Symbol('Node.datasets')
	const ID = await window.modules.import.function('id')
	const node_connections = await window.modules.import.function('node.connections')

	class Node extends NodeMap{
		static get dataset(){ return get_dataset }
		static get datasets(){ return node_datasets in this ? this[node_datasets]:this[node_datasets]=new WeakMap() }
		static get(item){ return item instanceof Node ? item:NodeMap.get(item) }
		static has(item){ return item instanceof Node || NodeMap.has(item) }
		static get ID(){ return ID }
		constructor(node_id, connector_id){
			super()
			this.id = node_id ? ID.decode(node_id):ID()
			if(connector_id) this.connector = connector_id
		}
		connect(node){
			node = this.constructor.get(node)
			if(node) {
				const id = `${node_connections.id(this.id, node.id)}`
				this.set(`${node.id}`, id)
				node.set(`${this.id}`, id)
			}
			return node
		}
		get connections(){ return Array.from(this.values()) }
		message(){ return node_message(this, ...arguments) }
		get namespace(){ return `${this.connector}:${this.id}` }
		get selector(){ return node_connections.selector(this) }
	}


	//exports
	return Node

	//scope actions
	function get_dataset(){
		if(arguments.length === 2){
			if(is.nothing(arguments[1]) && node_datasets in Node) Node[node_datasets].delete(arguments[0])
			else Node.datasets.set(arguments[0],arguments[1])
		}
		return node_datasets in Node && Node[node_datasets].has(arguments[0]) ? Node[node_datasets].get(arguments[0]):null
	}

	function node_message(node, notation){
		const watcher = get_message
		watcher.namespace = node.namespace
		watcher.id = node.id
		watcher.notation = notation
		return watcher
		//scope actions
		function get_message(value){
			return {
				connector: node.connector,
				id: node.id,
				namespace: node.namespace,
				notation,
				value: get_value(value)
			}
		}
		function get_value(value){
			if(typeof value === 'undefined' && is.function(node.value)) value = node.value(notation)
			if(is.object(value)) value = 'toJSON' in value ? value.toJSON():Object.assign({},value)
			return is.nothing(value) ? null:value
		}
	}





}, async function NodeMap(){
	const node_map = Symbol('NodeMap.nodes')
	class NodeMap extends Map{
		static get delete(){ return delete_node }
		static get get(){ return get_node }
		static get has(){ return has_node }
		static get set(){ return set_node }
	}

	//exports
	return NodeMap

	//scope actions
	function delete_node(item){ return (has_node(item) ? nodes().delete(item):null,item) }
	function get_node(item){ return has_node(item) ? nodes().get(item):null }
	function has_node(item){ return node_map in NodeMap && nodes().has(item) }
	function nodes(){ return node_map in NodeMap ? NodeMap[node_map]:NodeMap[node_map]=new WeakMap() }
	function set_node(item, node){ return nodes().set(item, node) }
})
