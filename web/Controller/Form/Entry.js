import * as Data from '../../Data';
import * as Text from '../../Text';
import Valid from '../../Valid';
import not from '../../not';

import {formFieldRequiredProperty, formFieldProperty, formFieldOutputMessageProperty, formProperty} from './Field';
const entryFeedbackNotation = 'property.formFeedback'; //Feedback message for invalid input
const entryFieldNotation = `property.${formFieldProperty}`; //Property specifying the field value of entry
const entryLabelNotation = 'property.formLabel'; //Presentable label of input or feedback response
const entryPlaceholderNotation = 'props.placeholder';
const entryRequiredNotation = `property.${formFieldRequiredProperty}`; //Property specifying if field is required
const entryTypeNotation = 'property.formType'; //Property name of a validation function of `Api/Valid` module
const entryTextInputValueNotation = 'nativeEvent.text'; //Property containing value of input in events
const entryValueNotation = formFieldOutputMessageProperty;
const entryValidatorNotation = 'property.formValidator'; //Function to validate value of input

export default class Entry{
	static create = createEntry
	constructor(event){
		this.property = getProperty(event)
		this.value = Data.has(event, entryTextInputValueNotation) ? Data.get(event, entryTextInputValueNotation):Data.get(event, entryValueNotation)
		this.placeholder = Data.get(event, entryPlaceholderNotation)
		if(event.initial) this.initial = true
	}
	get field(){ return Data.get(this, entryFieldNotation) }
	get feedback(){ return Data.get(this, entryFeedbackNotation) }
	get empty(){ return not.empty(this.value) === false }
	get label(){ return getLabel.call(this)  }
	get required(){ return Data.get(this, entryRequiredNotation) === true }
	get valid(){ return validEntry.call(this) }
	get validator(){ return Data.get(this, entryValidatorNotation) }
	get type(){ return Data.get(this, entryTypeNotation) }
}

//scope actions
export function createEntry({props}, event){ return new Entry(Object.assign(event, {props})) }

function getLabel(){
	const label = Data.get(this, entryLabelNotation)
	return label ? label:Text.proper(this.field)
}

export function getProperty(event){
	const properties = {}
	for(const field in (Data.get(event, 'props') || {})){
		if(field.startsWith(formProperty)) {
			properties[field] = Data.get(event, `props.${field}`)
		}
	}
	return properties
}

function validEntry(){
	const {empty, required} = this
	if(required && empty) return false
	if(empty === false || required){
		const {type} = this
		if(type && type in Valid) return Valid[type](this.value)
		const {validator} = this
		if(Valid.function(validator)) return validator(this, {not, Valid})
	}
	return true
}
