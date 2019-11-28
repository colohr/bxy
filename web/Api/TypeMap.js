import * as Data from './Data';
import Valid from './Valid';
const TypeMap = typeMap;
TypeMap.dataValue = dataValue;
TypeMap.dataSource = dataSource;
TypeMap.propertyExists = propertyExists;
TypeMap.propertyValue = propertyValue;
export default TypeMap;

//scope actions
export function dataSource(componentInstance, propertyField='dataSource', defaultValue = {}){
	const value = propertyValue(componentInstance, propertyField, defaultValue)
	return Valid.object(value) ? value:defaultValue
}

export function dataValue(componentInstance, propertyField, defaultValue={}, dataSourceField = 'dataSource'){
	const value = propertyValue(componentInstance, `${dataSourceField}.${propertyField}`)
	return Valid.object(value) ? value:defaultValue
}

export function propertyExists(componentInstance, propertyField = 'value'){ return Data.has(componentInstance, `props.${propertyField}`) }

export function propertyValue(componentInstance, propertyField = 'value'){ return Data.get(componentInstance, `props.${propertyField}`) }


export function resetField(dataNotation, field){ return field in dataNotation && dataNotation[field] !== null }

export function setData(dataNotation, source, field){
	if(resetField(dataNotation, field)) Data.set(source, dataNotation[field], Data.get(source, field))
	return Data.unset(source, field)
}

export function unsetField(propTypes, field){ return field in propTypes === false }




export function typeMap(propTypes, dataNotation = {}){
	const typeMapInstance = (...sources)=>typeMapSource(propTypes, dataNotation,...sources)
	typeMapInstance.propTypes = propTypes
	return typeMapInstance
}

export function typeMapSource(propTypes, dataNotation, ...source){
	source = Data.assign(...source)
	for(const field in source){
		if(field in dataNotation) setData(dataNotation,source,field)
		else if(unsetField(propTypes, field)) Data.unset(source, field)
	}
	return Data.clean(source)
}