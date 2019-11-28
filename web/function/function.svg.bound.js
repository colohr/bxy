(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.svg.bound', {value:await module(...inputs)}); return window.modules.has('function.svg.bound')?window.modules.get('function.svg.bound'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const Unit = await window.modules.import.function('svg.unit')
	const XY = await window.modules.import.function('svg.xy')
	const {Dimension} = await window.modules.import.function('svg.dimension')
	const valuable_range= [0.1, 0.1]
	class Bound{
		constructor(item){
			this.item = item
			this.dimension = new Dimension(this.item)
		}
		get box(){ return this.node.getBBox() }
		get center(){ return get_center(this.node) }
		get height(){ return this.node.clientHeight }
		get length(){ return this.node.getTotalLength() }
		get matrix(){ return this.node.getCTM() }
		get node(){ return this.item }
		get size(){
			const {width, height} = this
			return height > valuable_range[1] && width > valuable_range[0] ? this.dimension.size:null
		}
		get transform(){ return XY.transform(this.node) }
		get width(){ return this.node.clientWidth }
	}


	//exports
	const bound_function = get_bound
	bound_function.Bound = Bound
	bound_function.center = get_center
	return bound_function

	//scope actions
	function get_bound(element){ return new Bound(element) }
	function get_center(element){
		const center = Object.assign({}, element.getBoundingClientRect())
		switch(element.localName){
			case 'circle':
				center.point = Unit.point(Unit.property(element, 'cx'), Unit.property(element, 'cy'))
				const width = Unit.property(element, 'r', null) || element.getBoundingClientRect().width / 2
				center.size = Unit.size(width, width)
				break
			default:
				center.size = Unit.size(center.width / 2,center.height/2)
				center.point = Unit.Point(center.left + center.width,center.top + center.height)
				break
		}
		return center
	}

})
