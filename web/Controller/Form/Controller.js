import * as Data from '../../Data';
import {ProtocolMap} from '../../Protocol/ProtocolPrototype';
import EventsProtocol from '../../Protocol/EventsProtocol';
import {formEvents as events, formInstance, formTimer, formTimerDuration} from './Field';
const Form =  EventsProtocol(class extends ProtocolMap{
	static delete = instanceDelete
	static instance = instance
	get data(){ return getData.call(this) }
	get invalid(){ return getInvalid.call(this) }
	push(){ return (this.send(events.entry, ...arguments), this) }
	get valid(){ return isValid.call(this) }
	get valueCount(){ return valueCount(this) }
})

export default Form;


//scope actions
function getData(){
	return Array.from(this.values()).reduce(reduce, {})
	//scope actions
	function reduce(data, entry){ return (Data.set(data, entry.field, entry.value),data) }
}

function getInvalid(){
	return Array.from(this.values()).filter(filter)
	//scope actions
	function filter(entry){ return entry.valid === false }
}

export function instance(component){
	if(formInstance in component) return component[formInstance]
	component[formInstance] = new Form()
	return (component[formInstance].on(events.entry, onEntry.bind(component[formInstance])), component[formInstance])
}

export function instanceDelete(component){
	if(formInstance in component){
		EventsProtocol.delete(component[formInstance])
		component[formInstance].clear()
		delete component[formInstance]
	}
	return true
}

function onEntry(entry){
	if(timerClear(this)){
		if(entry.empty && entry.required === false) this.delete(entry.field)
		else this.set(entry.field, entry)
		timerStart(this)
	}
}

function isValid(){
	for(const entry of this.values()) if(entry.valid !== true) return false
	return true
}

function timerClear(form){
	if(formTimer in form){
		clearTimeout(form[formTimer])
		delete form[formTimer]
	}
	return true
}

function timerStart(form){
	if(timerClear(form)){
		form[formTimer] = setTimeout(onTimeout, formTimerDuration)
	}
	return true

	//scope actions
	function onTimeout(){
		if(form.valid) form.send(events.submit, form.data)
		else form.send(events.change, form.invalid)
	}
}

function valueCount(form){
	return Array.from(form.values()).reduce(reduce, 0)
	//scope actions
	function reduce(count, {empty}){ return empty === false ? count + 1:count }
}