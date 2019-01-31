(async function define_module(...x){ const define = async (module, ...inputs)=>await module(...inputs); return window.modules.has('random.extreme')?window.modules.get('random.extreme'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(random_extreme, Extreme){
	random_extreme.create = (...x)=>new Extreme(x)
	random_extreme.Extreme = Extreme
	//exports
	return window.modules.set('random.extreme', random_extreme)

}, async function RandomExtreme(){
	const random = await window.modules.import.function('random')
	const values = [random.decimal(-1, 111), 'Text',  window.modules.wait, NaN, new Date(), Symbol('extreme'), true, false, null, Infinity, random]
	const files = [window.modules.get('@url').at('function/function.data_map.js'), window.modules.get('@url').at('data/colors.json')]
	const symbols = [Symbol('array'),Symbol('object'),Symbol('promise'),Symbol('map'),Symbol('set'),Symbol('file'),Symbol('wait'),Symbol('date'),Symbol('value'), Symbol('value'), Symbol('value'), Symbol('value')]
	const notations = Object.getOwnPropertyNames(window).map(window.modules.id.dot_notation).map(notation=>notation.toLowerCase())
	const fields = Object.getOwnPropertyNames(Math).map(window.modules.id.class)
	let limit = 1400

	//exports
	return function(custom_limit=400){
		limit = custom_limit
		const gets = [get_random_array, get_random_object, get_random_promise, get_random_map, get_random_set, get_random_file, get_random_notation, get_random_date]
		let count = 0
		return get_object()

		//scope actions
		function get_random_value(){
			if(count < limit){
				const symbol = random.item(symbols)
				const index = symbols.indexOf(symbol)
				if(index <= 6) return gets[index]()
			}
			return random.item(values)
		}

		function get_object(object = {}){
			if(count >= limit) return object
			count = count + 1;

			const fields = get_random_fields()
			for(const field of fields) object[field] = get_random_value()
			return object
		}

		function get_array(array = []){
			if(count >= limit) return array
			count = count + 1;
			const fields = get_random_number_of_fields()
			for(let i = 0; i < fields; i++) array.push(get_random_value())
			return array
		}

		function get_random_notation(){
			const notation = random.item(notations)
			const dots = notation.split('.')
			const set = []
			if(window.modules.dot.has(window, notation) === false) window.setTimeout(add_notation, random(100, 1000));
			return window.modules.wait(notation)

			//scope actions
			function add_notation(){
				const dot = dots.splice(0, 1)[0]
				const new_notation = set.concat([dot]).join('.')
				if(window.modules.dot.has(window, new_notation) === false) window.modules.dot.set(window, new_notation, {})
				set.push(dot)
				return next()
			}

			function next(){ if(dots.length) window.setTimeout(add_notation, random(10, 500)); }
		}

		function get_random_object(){ return new Promise((success)=>window.setTimeout(()=>success(get_object()), random(10, 500))) }

		function get_random_array(){ return new Promise((success)=>window.setTimeout(()=>success(get_array()), random(10, 500))) }

		function get_random_set(){ return get_random_array().then(x=>new Set(x)) }

		function get_random_map(){ return get_random_object().then(x=>new Map(Object.entries(x))) }

		function get_random_date(date = new Date()){ return Promise.resolve(date.setDate(random.decimal(-500, 500))) }

		function get_random_file(){
			const file = random.item(files)
			const type = file.extension === 'md' ? 'content':'data'
			return window.modules.http(file).then(response=>response[type])
		}
	}

	//scope actions
	function get_random_fields(){
		const random_fields = []
		for(let i = 0; i < get_random_number_of_fields(); i++) random_fields.push(random.item(fields))
		return random_fields
	}

	function get_random_number_of_fields(){ return random(0, 20) }

	async function get_random_promise(){ return random.item(values) }

}, async function ExtremeClass(){
	const map = Symbol('map')

	class Icicle extends Boolean{
		constructor(value){
			super(value > 0)
			this.value = value
		}
		toJSON(){ return {value:this.value,name:this.toString()} }
		toString(){ return this.valueOf() === true ? 'TRUE':'FALSE' }
	}

	class Extrimitive extends Array{
		constructor(...x){
			super(...x)
			this.primitive = 'Extreme'
		}
		get(value){
			if(map in this === false) this[map] = new Map()
			return this[map].get(value)
		}
		db(){ return 'z' }
		set(field, value){
			if(map in this === false) this[map] = new Map()
			return (this[map].set(field, value), this)
		}
	}

	class ExtendsExtrimitive extends Extrimitive{ async jello(){ return 'teenage mutant ninja donatello' } }
	ExtendsExtrimitive.prototype.ice = new Icicle(Math.E)
	ExtendsExtrimitive.prototype.icicle = function create_icicle(value){ return Object.freeze(new Icicle(value)) }
	Object.freeze(ExtendsExtrimitive.prototype)


	class ExtrimitivePerimiter extends ExtendsExtrimitive{
		get perimeter_vernacular(){ return window.modules.get('random').decimal(-320392093.3293029380, 32092038203) }
	}
	Object.defineProperty(ExtrimitivePerimiter.prototype, 'level', {enumerable: false, configurable: false, value: 'Swagga on a 100 Thousand Trillion'})

	const SuperMix = Base=>class extends Base{
		db(){ return 'super' }
		get type(){ return 'Dragon' }
	}

	const InstinctMix = Base=>class extends Base{
		get extremity(){ return Infinity }
		get ultra_instinct(){ return 'omen' }
	}

	const UltraMix = Base=>class extends InstinctMix(Base){
		get date(){ return this.has('date') ? this.get('date'):this.set('date', new Date()).get('date') }
		set date(value){ return this.set('date', value) }
		get ultra_instinct(){ return 'super saiyan god super saiyan' }
	}

	const GalacticMix = Base=>class extends Base{
		constructor(...x){
			super(...x)
			this.splits = true
			this.set('lightsaber', 'indigo duo splitter')
		}
		get a_long_time_ago(){ return 'in a galaxy far far away' }
	}

	class ForceField extends SuperMix(ExtrimitivePerimiter){
		get jedi(){ return this.sith.test(this.field) }
		get sith(){ return new RegExp(/lord/,'i') }
	}
	ForceField.prototype.field = 'Dati'

	//exports
	return GalacticMix(class Pokedex extends UltraMix(ForceField){
		identity(){ return 'Mew' }
		get index(){ return this.number - 1 }
		get number(){ return 151 }
		get type(){ return 'Psychic' }
	})

})
