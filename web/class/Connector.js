(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Connector', {value:await module(...inputs)}); return window.modules.has('Connector')?window.modules.get('Connector'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {dot} = window.modules
	const EventEmitter = await window.modules.import.class('EventEmitter')
	const Node = await window.modules.import.class('Node')
	const connector = await window.modules.import.worker(window.modules.get('@url').at('class/Connector.WebWorker.js'))
	connector.watchers = new Set()
	connector.once('field',event=>connector.field=event.detail.change)

	class Message extends Array{
		get from(){ return this[2] }
		get notation(){ return this[1] }
		get to(){ return this[3] }
		get type(){ return this[0] }
		get value(){ return this.to }
	}

	//exports
	return class Connector extends EventEmitter{
		static get Node(){ return Node }
		constructor(){
			super()
			this.id = window.modules.uid(this.constructor.name)
			this.nodes = new Set()
			this.on('removeListener', off_listener)
			this.on('newListener', on_listener)
			function off_listener(notation){ update_interval(this) }
			function on_listener(notation){
				if(notation === 'newListener' || notation === 'removeListener') return this
				update_interval(this)
			}
		}
		connect(item){ return connect_node.call(this, item) }
		dataset(){ return (arguments[0] = this.node(arguments[0]),Node.dataset.apply(this, arguments)) }
		delete(item){ return delete_node.call(this, item) }
		get emitter(){ return event=>this.emit(`${event.detail.notation}@${event.detail.id}`, event.detail) }
		exists(item){ return Node.has(window.modules.element.get(item)) }
		node(item){ return get_node.call(this, item) }
		has(item){ return has_node.call(this, item) }
		unwatch(target,notation,listener){
			const node = this.connect(target)
			const type = `${notation}@${node.id}`
			for(const watcher of connector.watchers){
				if(watcher.id === node.id && watcher.notation === notation){
					connector.watchers.delete(watcher)
				}
			}
			if('listener' in node) connector.off(node.namespace, node.listener)
			this.off(type, listener)
			return target
		}
		watch(target,notation,listener){
			const node = this.connect(target)
			const type = `${notation}@${node.id}`
			if('value' in node === false) node.value = function(){ return dot.get(target,arguments[0]) }
			if('listener' in node === false) connector.on(node.namespace, node.listener = this.emitter)
			connector.watchers.add(node.message(notation))
			this.on(type, listener)
			return target
		}
	}

	//scope actions
	function connect_node(item){
		let node = get_node(item)
		if(node===null&&(item = window.modules.element.get(item))!==null){
			Node.set(item, node=new Node(Node.ID.set(item), this.id))
		}
		return (node?this.nodes.add(node.id):null,node)
	}

	function delete_node(element){
		const id = Node.ID.get(element)
		if(id) this.nodes.delete(id)
		if((element=window.modules.element.get(element)) !== null) Node.delete(element)
		return element
	}

	function get_node(item){
		if(item instanceof Node) return item
		item = window.modules.element.get(item)
		return item ? Node.get(item):null
	}

	function has_node(item){ return this.nodes.has(Node.ID.get(item)) }

	function notation_interval(){
		if(connector.working === true) return
		connector.working = true
		for(const value of connector.watchers.values()){
			try{ connector.send('namespace', value()) }
			catch(error){ console.log(error) }
		}
		window.setTimeout(()=>connector.working = false, 50)
	}

	function update_interval(){
		if(connector.watchers.size === 0){
			if(typeof connector.interval === 'number'){
				connector.interval = window.clearInterval(connector.interval)
			}
		}
		else if(connector.watchers.size > 0){
			if(typeof connector.interval !== 'number'){
				connector.interval = window.setInterval(notation_interval, 300)
			}
		}
	}
})
