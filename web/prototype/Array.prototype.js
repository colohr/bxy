void function ArrayPrototype(ArrayPrototype){ return 'prototyped' in Array ? null:ArrayPrototype(this)}(async function ArrayPrototype(){
	Array.prototyped = '0.0.1'
	const [supertype, superset] = await window.modules.wait('supertype', 'superset')

	supertype(superset(Array, {
		add: array_add,
		after: array_after,
		at: array_at,
		any: array_any,
		before: array_before,
		clear: array_clear,
		count: array_count,
		delete: array_delete,
		each: array_each,
		has: array_has,
		index: array_index,
		indexes: array_indexes,
		insert: array_insert,
		missing: array_missing,
		order: array_order,
		remove: array_remove_all,
		replace: array_replace,
		unique: array_unique,
	}), {
		first: array_first,
		empty: array_empty,
		last: array_last,
		max: array_max,
		ordinal: array_ordinal,
		total: array_total
	})

	//scope actions
	function array_add(...items){ return (this.splice(this.max, 0, ...items),this) }
	function array_after(value, with_value){ return this.insert(this.indexOf(value) + 1, with_value) }

	function array_any(...values){ return values.some(this.includes, this) }
	function array_at(index){ return (index=typeof(index)==='number'?index:this.max,index < 0 ? 0:index > this.length ? this.length:index) }

	function array_before(value, with_value){ return this.insert(this.indexOf(value) - 1, with_value) }
	function array_clear(){ return this.splice(0, this.max) }
	function array_count(value){ return this.reduce(function(total=0,entry){return value===entry?total+1:total},0)  }

	function array_delete(...value){ return (value.reduce((deleted,entry)=>deleted.concat(this.has(entry)?this.splice(this.index(entry),1):[]), []),true) }

	function array_remove_all(...value){ return this.any(...value) ? (this.delete(...value), this.remove(...value)):this }

	function array_each(){ return this.add(...this.map.apply(this,arguments))  }
	function array_empty(){ return this.length === 0 }

	function array_first(){ return this[0] }

	function array_has(...values){ return values.every(this.includes,this)  }
	function array_index(any){ return this.includes(any) ? this.indexOf(any):this.at(any) }

	function array_indexes(...values){
		return values.map(map, [].concat(this))
		//scope actions
		function map(entry,index){ return (index=this.indexOf(entry),this.splice(index, 0, Symbol(index)),index) }
	}
	function array_insert(index, value){ return (this.splice(this.at(index), 0, value),this) }

	function array_last(){ return this[this.max] }
	function array_max(){ return this.length - 1 }
	function array_missing(...value){ return this.has(...value) === false }

	function array_order(sequence,target){ return this.sort(sequence||this.ordinal.numeric,target||this) }
	function array_ordinal(){
		return {
			character: (a,b)=>a.length-b.length,
			chronology:{ month:(...ab)=>`MM-` },
			digit,
			digits,
			number:(a,b)=>a-b,
			numeric:(...ab)=>(ab=ab.map(digit),ab[0]>ab[1]?1:ab[0]<ab[1]?-1:0)
		}
		//scope actions
		function digit(text){ return digits(text)[0] || 0 }
		function digits(text){ return text.match(/\d+/g).map(Number) }
	}

	function array_replace(target_item){
		const route = {
			with:(with_value)=>this.fill(with_value,target_item=this.index(target_item),target_item+1)
		}

		return new Proxy(replace, {get})
		//scope actions
		function get(target, field){
			if(field in route) return route[field]
			return field in target ? target[field]:null
		}
		function replace(position, ...values){ return this.splice(position, values.length, ...values) }
	}
	function array_unique(){ return ((arguments[0]||(()=>{})).apply(this, this.splice(0, this.max, ...new Set(this))), this) }
	function array_total(){ return this.length }
})

