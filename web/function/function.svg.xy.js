(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('function.svg.xy', {value:await module(...inputs)}); return window.modules.has('function.svg.xy')?window.modules.get('function.svg.xy'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){
	const {dot,is} = window.modules
	const transform_types = { 0: 'unknown', 1: 'matrix', 2: 'translate', 3: 'scale', 4: 'rotate', 5: 'skew.x', 6: 'skew.y' }
	const matrix_types = {a:'scale.x',d:'scale.y',e:'translate.x',f:'translate.y' }
	const Unit = await window.modules.import.function('svg.unit')

	//exports
	const XY = item=>(item=get_transform(item),Unit.point(item.translate.x, item.translate.y))
	XY.matrix = matrix_types
	XY.transform = get_transform
	XY.translate = translate_item
	XY.value = translate_value
	return XY

	//scope actions
	function get_transform(element){
		element = is.svg(element) ? element:null
		if(is.nothing(element.transform)) return {}
		return Array.from(element.transform.baseVal).reduce(reduce,{})
		//scope actions
		function reduce(transform,entry){
			const type = transform_types[entry.type]
			switch(type){
				case 'translate':
					dot.set(transform,'translate.x', entry.matrix.e)
					dot.set(transform,'translate.y', entry.matrix.f)
					break
				case 'scale':
					dot.set(transform,'scale.x', entry.matrix.a)
					dot.set(transform,'scale.y', entry.matrix.d)
					break
				default:
					dot.set(transform,type, entry.angle)
					break
			}
			return transform
		}
	}


	function translate_item(item, ...value){
		if(is.svg(item)) item.setAttribute('transform', translate_value(...value) || item.getAttribute('transform') || '')
		return item
	}

	function translate_value(...translation){
		if(translation.length === 0) return null
		return `translate(${translation.join(',')})`
	}
})
