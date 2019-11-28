(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Dimension', {value:await module(...inputs)}); return window.modules.has('Dimension')?window.modules.get('Dimension'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(function definition(Circle, Point, Size) {
	const {is} = window.modules
	function Dimension({width, height, radius, x, y, z}){
		if(this instanceof Dimension === false) return new Dimension(...arguments)
		if(is.number(radius)) {
			this.circle=radius
			height = this.circle.diameter
			width=this.circle.diameter
		}
		this.size = Size(width, height)
		this.point = Point(x,y,z)
	}
	Dimension.prototype = {
		get area(){ return this.size.area },
		get circumference(){ return this.circle.circumference },
		get center(){ return this.size.center },
		get circle(){ return get_circle(this) },
		set circle(value){ return set_circle(this,value) },
		contains: dimension_contains,
		get diameter(){ return this.circle.diameter },
		get height(){ return this.size.height },
		//get length(){} //depth of 3D object, width, diagonal size
		//get mass(){} //weight
		get radius(){ return this.circle.radius },
		get width(){ return this.size.width },
		//get volume(){} //
		get x(){ return this.point.x },
		get y(){ return this.point.y },
		get z(){ return this.point.z }
	}
	Dimension.Circle = Circle
	Dimension.Point = Point
	Dimension.Size = Size
	return Dimension
	//scope actions
	function dimension_contains(){
		let position = null
		let size = null
		if(arguments[0] instanceof Point) position = arguments[0]
		else if(arguments[0] instanceof Size) size = arguments[0]
		else if(arguments[0] instanceof Dimension){
			size = arguments[0].size
			position = {
				x: arguments[0].x + arguments[0].width,
				y: arguments[0].y + arguments[0].height
			}
		}
		else if(arguments[0] instanceof Circle) size = Size(arguments[0].diameter,arguments[0].diameter)
		else return false

		if(size){
			if(size.width > this.width) return false
			if(size.height > this.height) return false
		}

		if(position){
			const x = this.width + this.x
			if(position.x < x) return false
			if(position.x > x) return false

			const y = this.height + this.y
			if(position.y < y) return false
			if(position.y > y) return false
		}
		return true
	}
	function get_circle(dimension){ return Circle.symbol in dimension ? dimension[Circle.symbol]:set_circle(dimension, dimension.width) }
	function set_circle(dimension, radius){ return dimension[Circle.symbol] = Circle(radius) }

}, async function Circle(){
	const arc = π * 2
	function Circle(radius){
		if(this instanceof Circle === false) return new Circle(...arguments)
		this.circumference = arc *  radius
		this.radius = radius
		this.diameter = this.radius * 2
	}
	Circle.arc = arc
	Circle.symbol = Symbol('circle')
	Circle.prototype = { circumference: 0, diameter: 0, radius: 0 }

	//exports
	return Circle
},
async function Point(){
	const random = await window.modules.import.function('random')
	function Point(x=0,y=0,z=0){
		if(this instanceof Point === false) return new Point(...arguments)
		this.x=x
		this.y=y
		this.z=z
	}
	//exports
	Point.random = random_point
	return Point

	//scope actions
	function random_point(maximum,minimum){
		minimum = Object.assign({width:0,height:0}, minimum)
		return Point(random.decimal(minimum.width, maximum.width), random.decimal(minimum.height, maximum.height))
	}

}, async function Size(){
	function Size(){
		if(this instanceof Size === false) return new Size(...arguments)
		Object.assign(this,construct(...arguments))
		this.center = center(...arguments)
	}

	Size.prototype = {
		height:0,
		maximum: 0,
		minimum: 0,
		width: 0
	}
	Size.center = center
	//exports
	return Size

	//scope actions
	function construct(width,height){
		return {
			area: width * height,
			height,
			width,
			maximum: Math.max(width, height),
			minimum: Math.min(width, height)
		}
	}

	function center(width, height){ return window.modules.Dimension.Point(width/2, height/2) }
})
