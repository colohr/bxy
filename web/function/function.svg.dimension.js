(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.svg.dimension', {value:await module(...inputs)}); return window.modules.has('function.svg.dimension')?window.modules.get('function.svg.dimension'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {dot} = window.modules
	const Unit = await window.modules.import.function('svg.unit')
	class Dimension{
		constructor(item){
			this.item = item
			this.size = Unit.size.of(this.item)
		}
		get area(){ return this.node.getBoundingClientRect() }
		get node(){ return this.item.node() }
		get height(){ return dot.get(this,'size.height') || this.area.height }
		get width(){ return dot.get(this, 'size.width') || this.area.width }
	}

	//exports
	const dimension_function = get_dimension
	dimension_function.Dimension = Dimension
	return dimension_function

	//scope actions
	function get_dimension(element){ return new Dimension(element)  }

})
