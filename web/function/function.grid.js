(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.grid',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.grid')?_.get('function.grid'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition(Index,Item,Row,Grid) {

	//exports
	Grid = Grid(Index, Item, Row)
	Grid.Index = Index
	Grid.Item = Item
	Grid.Row = Row
	const create_grid_function = create_grid
	create_grid_function.Grid = Grid
	create_grid_function.setting = create_setting
	return create_grid_function

	//scope actions
	function create_grid(){ return new Grid(...arguments) }
	function create_setting(number_of_items_per_row){
		return Object.keys(Grid.Preset).reduce(reduce, {})
		//scope actions
		function reduce(setting, field){ return Object.assign(setting, {[field]: number_of_items_per_row}) }
	}

},[
	function Index(){
		const {is} = window.modules
		return class Index extends Number{
			get even(){ return is.even(this.position) }
			get odd(){ return is.odd(this.position) }
			get position(){ return this + 1 }
		}
	},
	function Item(){
		return class Item{
			constructor(index, value){
				this.index = index
				this.value = value
			}
		}
	},
	function Row(){
		//exports
		return class Row extends Array{
			constructor(index, maximum){
				super()
				this.index = index
				this.maximum = maximum

			}
			get center(){ return this[Math.round(this.count / 2)]}
			get count(){ return this.length }
			get end(){ return this.count - 1 }
			get first(){ return this[0] || null }
			get full(){ return this.count === this.maximum }
			get last(){ return this[this.end] }
		}
		//scope actions
	}

],
function Grid(Index, Item, Row){
	const {is} = window.modules
	const grid_index = Symbol('grid index')
	const Preset = { items_per_row: 10, items_per_even_row: 10, items_per_odd_row: 10 }

	//exports
	return class Grid extends Array{
		static get Preset(){ return Preset }
		constructor(setting){
			super()
			this.setting = Object.assign(Object.create(Preset), is.data(setting)?setting:{})
		}
		at(index){ return (index = is.number(index) ? this.items[index]:null, index || null) }
		get center(){ return this[Math.round(this.count/2)]}
		get count(){ return this.length }
		get end(){ return this.count === 0 ? this.count:this.count-1 }
		get even(){ return this.filter(even_rows) }
		first(entry){ return entry instanceof Index ? entry==0:entry.index == 0 }
		index(item){
			if(grid_index in item) return item[grid_index]
			if(item instanceof Item) return item[grid_index] = this.items.indexOf(item)
			return this.values.indexOf(item)
		}
		get items(){ return this.reduce(reduce_items,[]) }
		last(entry){
			if(entry instanceof Row) return this.end == entry.index
			if(entry instanceof Index) return this[entry.row].end == entry
			return this[entry.index.row].end == entry.index
		}
		get odd(){ return this.filter(odd_rows) }
		push(value){
			const row = this.row()
			const item = create_item(row.index, row.count, value)
			return (row.push(item),item)
		}
		row(){
			let row_index = this.end
			let row = this[row_index] || null
			if(row === null){
				row = create_row(row_index, row_maximum(this.setting, row_index))
			}
			if(row.full) {
				row = create_row(row_index = this.count, row_maximum(this.setting, row_index))
			}
			if(this.includes(row) === false) super.push(row)
			return row
		}
		get total(){ return this.reduce(reduce_total, 0) }
		get values(){ return this.items.map(map_value) }
	}

	//scope actions
	function create_item(row, index, value){
		index = new Index(index)
		index.row = row
		return new Item(index, value)
	}

	function create_row(index, number_of_items_per_row){ return new Row(new Index(index), number_of_items_per_row) }

	function even_rows(row){ return row.index.even }

	function row_maximum({items_per_even_row,items_per_odd_row}, index){
		return is.even(index+1) ? items_per_even_row:items_per_odd_row
	}

	function map_value(item){ return item.value }

	function odd_rows(row){ return row.index.odd }

	function reduce_total(total, row){ return total + row.count }

	function reduce_items(items, row){ return items.concat(row) }

})
