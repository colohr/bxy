import Valid from './Valid';
import * as Data from './Data';

const StructureType = Symbol('structure data type')

//exports
export class Structure{
	static get type(){ return getStructure }
	static get label(){ return getStructureLabel }
	constructor(structure, index){
		if(structure instanceof Structure) structure = structure.data
		this.data = structure
		this.index = Valid.number(index) ? index:-1
	}
	get componentLabel(){ return getStructureLabel(this.data,this.structure) }
	get componentKey(){ return `item-${this.index}` }
	delete(notation){ return Data.unset(this, notation) }
	get(notation){ return Data.get(this, notation) }
	has(notation){ return Data.has(this, notation) }
	set(notation, value){ return Data.set(this, notation, value) }
	get structure(){ return StructureType in this ? this[StructureType]:this[StructureType] = getStructure(this.data) }
}

export class Model extends Structure{
	constructor(data, index){
		const invalidData = Valid.data(data) === false
		super(invalidData ? {}:data, index)
		this.invalidData = invalidData
	}
	get created(){ return this.get('data.createdAgoString') }
	get createdNumberOfDaysAgo(){ return this.get('data.createdNumberOfDaysAgo') }
	get date(){
		return {
			created: this.get('data.created'),
			updated: this.get('data.updated')
		}
	}
	delete(notation){ return Data.unset(this, notation) }
	get(notation){ return Data.get(this, notation) }
	has(notation){ return Data.has(this, notation) }
	get id(){ return this.get('data.id') }
	set(notation, value){ return Data.set(this, notation, value) }
	get typeName(){ return this.get('data.type') }
	get views(){ return this.get('data.views') }
}

export class Dataset extends Array{
	constructor(items, DatasetModel=Model){
		if(Valid.function(DatasetModel) !== true) throw new Error(items)
		items = Valid.array(items) ? items:[]
		super(...items.map((item,index)=>item instanceof DatasetModel ? item:new DatasetModel(item, index)))
	}
	get count(){ return this.length }
	get total(){ return this.filter(item=>item.invalidData === false).length }

}


//scope actions
function getStructure(data){
	if(Valid(data) === false) return 'nothing'
	else if(Valid.date(data)) return 'date'
	else if(Valid.text(data)) return 'text'
	else if(Valid.number(data)) return 'number'
	else if(Valid.function(data)) return 'function'
	else if(Valid.data(data)) return 'data'
	else if(Valid.array(data)) return 'array'
	return typeof(data)
}

function getStructureLabel(data, structure=null){
	switch(structure = structure || getStructure(data)){
		case 'number':
		case 'date': return  data.toLocaleString()
		case 'text': return  data
		case 'nothing':
		case 'symbol': return ''
	}
	return Data.get(data,'label') || Data.get(data, 'title') || Data.get(data, 'name')
}