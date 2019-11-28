import React from 'react';
import {TextInput} from 'react-native';
import * as Data from '../../Data';
import Valid from '../../Valid';
import Entry from './Entry';
import {
	fieldComponent,
	fieldsetComponent,

	formProperty,
	formFieldInputProperty,
	formFieldOutputProperty,
	formFieldOutputMessageProperty,

	formFieldOptionsProperty,
	formFieldOptionsMultipleProperty,
	formFieldOptionsValueAtProperty,
	formFieldOptionsValueIndexProperty,
	formFieldOptionsValueMultipleProperty

} from './Field';

//scope actions
export function componentProperty(field){
	if(typeof field !== 'string' && typeof field !== 'number') return null
	return Data.get(this, `props.${field}`)
}

export function fieldForm(componentInstance){ return Data.get(componentInstance, `props.${formProperty}`) }

export function fieldOptions(componentInstance){ return Data.get(componentInstance, `props.${formFieldOptionsProperty}`) || [] }

export function formInputs(component){
	return formRequirements.call(this, React.Children.toArray(component.props.children).map(mapFormElement, component))
}

export function formOutputMessage(){ return {[formFieldOutputMessageProperty]:arguments[0]} }

export function formRequirements(children){
	for(const input of children){
		if(isField(input)){
			if(this.form){
				const entry = Entry.create(input, {nativeEvent: {text: input.props.value}, initial: true})
				if(this.form.has(entry.field) === false) this.form.set(entry.field, entry)
			}
		}
	}
	return children
}

export function isField(component){ return component.type === TextInput || fieldComponent in component.type }

export function isFieldset(component){ return fieldsetComponent in component.type }

export function isMultiple(componentInstance){ return Data.get(componentInstance, `props.${formFieldOptionsMultipleProperty}`) }

function mapFormElement(component){
	if(isFieldset(component)) return React.cloneElement(component, {form: Data.get(this,'props.form')})
	else if(isField(component)) return React.cloneElement(component, {onChange: onInputChange.bind({form: Data.get(this, 'props.form'), props: component.props})})
	return component
}

function onInputChange(){
	if(this.form) this.form.push(Entry.create(this, ...arguments))
	else if(this.props.onChange) this.props.onChange(...arguments)
}

export function valueAt(){
	if(typeof arguments[0] !== 'number') return null
	if(this[formFieldOptionsValueAtProperty]) return this.props[formFieldOptionsValueAtProperty](...arguments)
	const options = fieldOptions(this)
	if(arguments[0] >= 0 && arguments[0] < options.length) return options[arguments[0]]
	return null
}

export function valueIndex(){
	if(this.props[formFieldOptionsValueIndexProperty]) return this.props[formFieldOptionsValueIndexProperty](...arguments)
	return fieldOptions(this).indexOf(arguments[0])
}

export function valueInput(){
	return this.props[formFieldInputProperty] ? this.props[formFieldInputProperty](...arguments):arguments[0]
}

export function valueMultiple(){ return (Valid.array(arguments[0]) ? arguments[0]:[arguments[0]]).filter(Valid) }

export function valueOutput(){
	return this[formFieldOutputMessageProperty](this.props[formFieldOutputProperty] ? this.props[formFieldOutputProperty](...arguments):arguments[0])
}



