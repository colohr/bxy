import ProtocolPrototype from './ProtocolPrototype';
import {FormController, formEvents, formInputs, formMount, formUnmount} from '../Controller';
import {mountState, unmountState} from './MountProtocol';
import * as Data from '../Data';

//Provides form control for components controller input data from users
export default function FormProtocol(Interface = ProtocolPrototype){
	if(Data.has(Interface, 'prototype')){
		if(Interface.prototype.componentDidMount) Interface.prototype[formMount] = Interface.prototype.componentDidMount
		if(Interface.prototype.componentWillUnmount) Interface.prototype[formUnmount] = Interface.prototype.componentWillUnmount
	}
	return class extends Interface{
		constructor(){super(...arguments)}
		componentDidMount = onFormMount
		componentWillUnmount = onFormUnmount
		event = formEvents
		get form(){ return FormController.instance(this) }
		formInputs = formInputs
		off(){ return (this.form.off(...arguments), this) }
		on(){ return (this.form.on(...arguments), this) }
		once(){ return (this.form.once(...arguments), this) }
	}
}

export function onFormMount(){
	if(formMount in this) this[formMount].apply(this, arguments)
	mountState(this)
}

export function onFormUnmount(){
	if(FormController.delete(this)) unmountState(this)
	if(formUnmount in this) this[formUnmount].apply(this, arguments)
}