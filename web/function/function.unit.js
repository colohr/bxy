(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.unit',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.unit')?_.get('function.unit'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function Values(){
	const {is} = window.modules
	const units = [ 'Hz', 'Q', 'ch', 'cm', 'deg', 'dpcm', 'dpi', 'dppx', 'em', 'ex', 'fr', 'grad', 'in', 'kHz', 'mm', 'ms', 'pc', '%', 'pt', 'px', 'rad', 'rem', 's', 'turn', 'vh', 'vmax', 'vmin', 'vw']
	units.names = ['number', 'percent']
	//escape
	class UnitValue extends Number{
		constructor(value, type){ (super(get_value(value, type = get_unit_type(value,type))),this.type = type) }
		get unit(){ return this.toString() }
		get value(){ return this.valueOf() }
		toString(){ return [super.toString(),this.type].filter(is.text).join('') }
	}
	class UnitValueList extends Array{ static get Value(){ return UnitValue } constructor(...values){ super(...values.map(get_unit_value).filter(is.number)) } }
	class Point extends UnitValueList{
		constructor(...values){ (super(...values),this.length===0?this.x=0:null,this.length===1?this.y=0:null) }
		get x(){ return this[0] }
		set x(value){ return (value=get_unit_value(value), is.number(value)?this[0]=value:null) }
		get y(){ return this[1] }
		set y(value){ return (value=get_unit_value(value), is.number(value)?this[1]=value:null) }
	}
	class Size extends UnitValueList{
		constructor(...values){ (super(...values),this.length===0?this.width=0:null,this.length===1?this.height=0:null) }
		get height(){ return this[1] }
		set height(value){ return (value=get_unit_value(value), is.number(value)?this[1]=value:null) }
		get width(){ return this[0] }
		set width(value){ return (value=get_unit_value(value), is.number(value)?this[0]=value:null) }
	}

	//exports
	const Unit = get_unit_value
	Unit.calculate = get_calculate
	Unit.List = UnitValueList
	Unit.Point = Point
	Unit.set = get_unit_values
	Unit.supports = unit_is_supported
	Unit.Size = Size
	Unit.Type = get_unit_type
	Unit.value = get_value
	Unit.Value = UnitValue
	return Unit

	//scope actions
	function get_calculate(){
		try{ return 'CSSMathValue' in window ? window.CSSMathValue.parse(arguments[0]):arguments[0] }
		catch(error){}
		return arguments[0]
	}

	function get_unit_type(value, unit_type=null){
		if(value instanceof UnitValue) return value.type
		if(is.text(value)) for(const type of units) if(value.endsWith(type)) return type
		return is.text(unit_type) ? unit_type:'px'
	}

	function get_unit_value(...value){ return new UnitValue(...value) }

	function get_unit_value_set(value){
		if(arguments.length > 1) value = get_unit_values(...arguments)
		else if(window.modules.is.text(value)) value = get_unit_values(...value.split(' '))
		if(window.modules.is.array(value) === false) value = [value]
		return new UnitValueList(...value)
	}

	function get_unit_values(){
		const values = []
		for(const item of Array.from(arguments)) if(window.modules.is.text(item)) values.push([item,''])
		return values
	}

	function get_value(value, type){
		if(is.data(value)) value = get_value_of_data(value)
		type = is.text(type) ? type:get_unit_type(value)
		if(is.text(value)){
			value = value.includes(type) ? value.slice(0, value.length - type.length):value
			if(is.numeric(value) || is.text.decimal(value)) value = parseFloat(value)
		}
		return is.number(value) ? value:NaN
	}

	function get_value_of_data(data){
		if(data instanceof UnitValue) return data
		if('CSSUnitValue' in window && data instanceof window.CSSUnitValue) return units.includes(data.type) ? new Unit(data.value,data.type):data.toString()
		if(data instanceof SVGAnimatedLength) data = data.baseVal
		if(data instanceof SVGLength) data = data.value
		return data
	}

	function unit_is_supported(){ return 'CSS' in window ? window.CSS.supports(arguments[0]):false }

})
